class_name AudioDirectorService
extends Node
## Studio Audio, Neural Voice Acting, Adaptive Music & Haptics Director for World's Smartest (Godot 4.7.2).
## Plays real neural voice .mp3 clips, real studio Foley .wav/.ogg/.mp3, and seamlessly looping cinematic BGM
## with automatic music ducking during voice lines, gentle pitch humanization, and handheld haptics.

const VOICE_DIR: String = "res://assets/voice/"
const AUDIO_DIR: String = "res://assets/audio/"

signal voice_started(clip_id: String)
signal voice_finished(clip_id: String)

var master_muted: bool = false
var voice_enabled: bool = true
var music_enabled: bool = false
var sfx_enabled: bool = true
var haptics_enabled: bool = true

var _bgm_a: AudioStreamPlayer = null
var _bgm_b: AudioStreamPlayer = null
var _bgm_active_is_a: bool = true
var _current_bgm_id: String = ""
var _bgm_target_db: float = -10.5
var _bgm_duck_db: float = 0.0
var _suspense_duck_active: bool = false
var _voice_bus_idx: int = -1

var _voice_player: AudioStreamPlayer = null
var _current_voice_id: String = ""
var _sfx_pool: Array[AudioStreamPlayer] = []
var _sfx_cursor: int = 0
var _overclock_loop_player: AudioStreamPlayer = null

var _stream_cache: Dictionary = {}
var _headless: bool = false
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	_headless = DisplayServer.get_name() == "headless"

	_bgm_a = AudioStreamPlayer.new()
	_bgm_a.name = "BGMPlayerA"
	_bgm_a.volume_db = -80.0
	add_child(_bgm_a)

	_bgm_b = AudioStreamPlayer.new()
	_bgm_b.name = "BGMPlayerB"
	_bgm_b.volume_db = -80.0
	add_child(_bgm_b)

	_voice_bus_idx = AudioServer.get_bus_index("Voice")
	if _voice_bus_idx == -1:
		AudioServer.add_bus()
		_voice_bus_idx = AudioServer.get_bus_count() - 1
		AudioServer.set_bus_name(_voice_bus_idx, "Voice")

	_voice_player = AudioStreamPlayer.new()
	_voice_player.name = "NeuralVoicePlayer"
	_voice_player.bus = "Voice"
	_voice_player.volume_db = -1.5
	_voice_player.finished.connect(_on_voice_finished)
	add_child(_voice_player)

	_overclock_loop_player = AudioStreamPlayer.new()
	_overclock_loop_player.name = "OverclockRisePlayer"
	_overclock_loop_player.volume_db = -8.0
	add_child(_overclock_loop_player)

	for i: int in range(8):
		var p: AudioStreamPlayer = AudioStreamPlayer.new()
		p.name = "SFXPlayer_%d" % i
		add_child(p)
		_sfx_pool.append(p)


func _process(delta: float) -> void:
	if _headless:
		return

	# Smoothly duck music when neural voice acting speaks OR during R1-01 Suspense Pause (-14 dB Millionaire silence!)
	var target_duck: float = 0.0
	if _suspense_duck_active:
		target_duck = -14.0
	elif _voice_player != null and _voice_player.playing:
		target_duck = -7.5
	var duck_speed: float = 12.0 if _suspense_duck_active else 5.5
	_bgm_duck_db = lerpf(_bgm_duck_db, target_duck, clampf(delta * duck_speed, 0.0, 1.0))

	var active_bgm: AudioStreamPlayer = _bgm_a if _bgm_active_is_a else _bgm_b
	var inactive_bgm: AudioStreamPlayer = _bgm_b if _bgm_active_is_a else _bgm_a

	var desired_active_db: float = -80.0 if (master_muted or not music_enabled) else (_bgm_target_db + _bgm_duck_db)
	if active_bgm.playing:
		active_bgm.volume_db = lerpf(active_bgm.volume_db, desired_active_db, clampf(delta * 3.0, 0.0, 1.0))
	if inactive_bgm.playing:
		inactive_bgm.volume_db = lerpf(inactive_bgm.volume_db, -80.0, clampf(delta * 3.5, 0.0, 1.0))
		if inactive_bgm.volume_db < -55.0:
			inactive_bgm.stop()


func set_muted(muted: bool) -> void:
	master_muted = muted
	if muted:
		stop_voice()
		stop_overclock_rise()


func set_music_enabled(enabled: bool) -> void:
	music_enabled = enabled


func set_voice_enabled(enabled: bool) -> void:
	voice_enabled = enabled
	if not enabled:
		stop_voice()


func set_haptics_enabled(enabled: bool) -> void:
	haptics_enabled = enabled


func is_voice_playing() -> bool:
	return _voice_player != null and _voice_player.playing


func set_suspense_duck(active: bool) -> void:
	_suspense_duck_active = active


func get_voice_pulse() -> float:
	if _headless or not is_voice_playing():
		return 0.0
	if _voice_bus_idx >= 0:
		var db: float = AudioServer.get_bus_peak_volume_left_db(_voice_bus_idx, 0)
		var norm: float = clampf((db + 42.0) / 36.0, 0.0, 1.0)
		if norm > 0.02:
			return norm
	var t: float = Time.get_ticks_msec() * 0.011
	return 0.35 + 0.55 * absf(sin(t) * cos(t * 0.53))


func play_music(track_key: String, volume_db: float = -10.5) -> void:
	_bgm_target_db = volume_db
	if track_key == _current_bgm_id:
		var cur: AudioStreamPlayer = _bgm_a if _bgm_active_is_a else _bgm_b
		if not _headless and cur != null and not cur.playing and cur.stream != null and music_enabled and not master_muted:
			cur.play()
		return

	var stream: AudioStream = _load_audio_by_stem(AUDIO_DIR, track_key)
	if stream == null:
		return

	_enable_stream_loop(stream)
	_current_bgm_id = track_key
	if _headless:
		return

	_bgm_active_is_a = not _bgm_active_is_a
	var next_player: AudioStreamPlayer = _bgm_a if _bgm_active_is_a else _bgm_b
	next_player.stream = stream
	next_player.volume_db = -42.0
	next_player.play()


func play_voice(clip_id: String) -> bool:
	if clip_id.is_empty():
		return false
	var clean_id: String = clip_id.get_file().get_basename()
	var stream: AudioStream = _load_audio_by_stem(VOICE_DIR, clean_id)
	if stream == null:
		return false

	_current_voice_id = clean_id
	if _headless or master_muted or not voice_enabled:
		return true

	_voice_player.stop()
	_voice_player.stream = stream
	_voice_player.volume_db = -1.0
	_voice_player.play()
	voice_started.emit(clean_id)
	return true


func stop_voice() -> void:
	if _voice_player != null and _voice_player.playing:
		_voice_player.stop()
	_current_voice_id = ""


func play_sfx(stem: String, volume_db: float = -4.0, pitch_jitter: float = 0.04, base_pitch: float = 1.0) -> void:
	if _headless or master_muted or not sfx_enabled:
		return
	var stream: AudioStream = _load_audio_by_stem(AUDIO_DIR, stem)
	if stream == null:
		return
	var player: AudioStreamPlayer = _sfx_pool[_sfx_cursor]
	_sfx_cursor = (_sfx_cursor + 1) % _sfx_pool.size()
	player.stop()
	player.stream = stream
	player.volume_db = volume_db
	var jitter: float = _rng.randf_range(-pitch_jitter, pitch_jitter) if pitch_jitter > 0.0 else 0.0
	player.pitch_scale = maxf(0.5, base_pitch + jitter)
	player.play()


func play_spin_tick(speed_ratio: float = 0.0) -> void:
	var pitch: float = 0.96 + clampf(speed_ratio, 0.0, 1.0) * 0.16
	play_sfx("sfx_spin_tick", -7.5, 0.03, pitch)
	vibrate(10)


func play_facet_snap() -> void:
	play_sfx("sfx_facet_snap", -4.5, 0.025, 1.0)
	vibrate(16)


func play_peel_open(tier: int = 2) -> void:
	play_sfx("sfx_peel_open", -3.0, 0.02, 1.0 if tier <= 2 else 1.12)
	vibrate(24)


func start_overclock_rise() -> void:
	if _headless or master_muted or not sfx_enabled:
		return
	var stream: AudioStream = _load_audio_by_stem(AUDIO_DIR, "sfx_overclock_rise")
	if stream == null:
		return
	_overclock_loop_player.stop()
	_overclock_loop_player.stream = stream
	_overclock_loop_player.volume_db = -6.0
	_overclock_loop_player.pitch_scale = 0.96
	_overclock_loop_player.play()


func update_overclock_rise(charge: float) -> void:
	if _headless or _overclock_loop_player == null or not _overclock_loop_player.playing:
		return
	var c: float = clampf(charge, 0.0, 1.0)
	_overclock_loop_player.pitch_scale = lerpf(0.95, 1.24, c)
	_overclock_loop_player.volume_db = lerpf(-8.0, -2.0, c)


func stop_overclock_rise() -> void:
	if _overclock_loop_player != null and _overclock_loop_player.playing:
		_overclock_loop_player.stop()


func play_lock_thunk(overclocked: bool = false) -> void:
	stop_overclock_rise()
	play_sfx("sfx_lock_thunk", -1.5 if overclocked else -3.5, 0.02, 0.94 if overclocked else 1.04)
	vibrate(55 if overclocked else 28)


func play_reveal_win(overclocked: bool = false) -> void:
	play_sfx("sfx_reveal_win", -2.5 if overclocked else -4.0, 0.01, 1.05 if overclocked else 1.0)
	vibrate(40 if overclocked else 20)


func play_reveal_backfire(backfired: bool = false) -> void:
	play_sfx("sfx_reveal_backfire", -1.5 if backfired else -4.5, 0.015, 0.92 if backfired else 1.04)
	vibrate(95 if backfired else 45)


func play_ui_click() -> void:
	play_sfx("sfx_ui_click", -8.0, 0.03, 1.0)
	vibrate(8)


func play_streak_chime(streak_count: int) -> void:
	var tier: int = clampi(streak_count, 1, 5)
	var stem: String = "sfx_streak_%d" % tier
	if _load_audio_by_stem(AUDIO_DIR, stem) != null:
		play_sfx(stem, -3.5, 0.01, 1.0)
	else:
		play_sfx("sfx_reveal_win", -4.5, 0.01, 1.0 + float(tier - 1) * 0.06)
	vibrate(18 + tier * 6)


func play_cutscene_whoosh() -> void:
	if _load_audio_by_stem(AUDIO_DIR, "sfx_cutscene_whoosh") != null:
		play_sfx("sfx_cutscene_whoosh", -5.5, 0.02, 1.0)
	else:
		play_sfx("sfx_peel_open", -8.0, 0.02, 0.88)


func play_music_with_fallback(primary_track: String, fallback_track: String, volume_db: float = -11.0) -> void:
	if _load_audio_by_stem(AUDIO_DIR, primary_track) != null:
		play_music(primary_track, volume_db)
	else:
		play_music(fallback_track, volume_db)


func vibrate(duration_ms: int) -> void:
	if _headless or not haptics_enabled or duration_ms <= 0:
		return
	if OS.has_feature("mobile") or OS.has_feature("android") or OS.has_feature("ios"):
		Input.vibrate_handheld(duration_ms)


func audit_assets() -> Dictionary:
	var voice_files: Array[String] = _list_dir_audio(VOICE_DIR)
	var audio_files: Array[String] = _list_dir_audio(AUDIO_DIR)
	return {
		"voice_count": voice_files.size(),
		"audio_count": audio_files.size(),
		"voice_files": voice_files,
		"audio_files": audio_files,
	}


func _list_dir_audio(dir_path: String) -> Array[String]:
	var found: Array[String] = []
	var d: DirAccess = DirAccess.open(dir_path)
	if d == null:
		return found
	d.list_dir_begin()
	var fname: String = d.get_next()
	while not fname.is_empty():
		if not d.current_is_dir():
			var ext: String = fname.get_extension().to_lower()
			if ext in ["mp3", "wav", "ogg"]:
				found.append(fname)
		fname = d.get_next()
	d.list_dir_end()
	found.sort()
	return found


func _load_audio_by_stem(dir_path: String, stem: String) -> AudioStream:
	var cache_key: String = dir_path + stem
	if _stream_cache.has(cache_key):
		return _stream_cache[cache_key] as AudioStream

	var candidates: Array[String] = [
		dir_path + stem + ".mp3",
		dir_path + stem + ".ogg",
		dir_path + stem + ".wav",
		dir_path + stem,
	]
	for path: String in candidates:
		if ResourceLoader.exists(path):
			var loaded: Resource = load(path)
			if loaded is AudioStream:
				_stream_cache[cache_key] = loaded
				return loaded as AudioStream
	return null


func _enable_stream_loop(stream: AudioStream) -> void:
	if stream is AudioStreamMP3:
		(stream as AudioStreamMP3).loop = true
	elif stream is AudioStreamOggVorbis:
		(stream as AudioStreamOggVorbis).loop = true
	elif stream is AudioStreamWAV:
		(stream as AudioStreamWAV).loop_mode = AudioStreamWAV.LOOP_FORWARD


func _exit_tree() -> void:
	_stream_cache.clear()


func _on_voice_finished() -> void:
	var finished_id: String = _current_voice_id
	_current_voice_id = ""
	if not finished_id.is_empty():
		voice_finished.emit(finished_id)
