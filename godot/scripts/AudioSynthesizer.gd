class_name AudioSynthesizer
extends Node
## Native Godot 4 AudioStreamGenerator procedural horological & Sovereign Modernism synthesizer.
## Produces zero-latency mechanical clicks, brass snaps, peel swooshes, overclock pulses, and lock thunks on Android.

const MIX_RATE: float = 44100.0
const MAX_VOICES: int = 12

var _player: AudioStreamPlayer = null
var _playback: AudioStreamGeneratorPlayback = null
var _voices: Array[Dictionary] = []
var _audio_active: bool = false
var _noise_state: int = 2463534242


func _ready() -> void:
	# Skip audio generation cleanly when running headless verification/CI
	if DisplayServer.get_name() == "headless":
		_audio_active = false
		return

	var stream: AudioStreamGenerator = AudioStreamGenerator.new()
	stream.mix_rate = MIX_RATE
	stream.buffer_length = 0.2

	_player = AudioStreamPlayer.new()
	_player.name = "HorologicalSynthPlayer"
	_player.stream = stream
	_player.volume_db = -6.0
	add_child(_player)
	_player.play()
	_playback = _player.get_stream_playback() as AudioStreamGeneratorPlayback
	_audio_active = _playback != null


func _process(_delta: float) -> void:
	if not _audio_active or _playback == null:
		return
	var frames_available: int = _playback.get_frames_available()
	if frames_available <= 0:
		return

	var dt: float = 1.0 / MIX_RATE
	var to_fill: int = mini(frames_available, 1024)
	for _i: int in range(to_fill):
		var sample_l: float = 0.0
		var sample_r: float = 0.0
		var idx: int = _voices.size() - 1
		while idx >= 0:
			var v: Dictionary = _voices[idx]
			var age: float = float(v["age"])
			var dur: float = float(v["dur"])
			if age >= dur:
				_voices.remove_at(idx)
				idx -= 1
				continue

			var progress: float = age / dur
			var env: float = exp(-progress * float(v["decay"]))
			if age < 0.003:
				env *= age / 0.003

			var freq_start: float = float(v["freq"])
			var freq_end: float = float(v["freq_end"])
			var cur_freq: float = lerpf(freq_start, freq_end, progress)
			var phase: float = float(v["phase"]) + TAU * cur_freq * dt
			v["phase"] = fmod(phase, TAU)
			v["age"] = age + dt

			var sig: float = sin(phase)
			var harmonic: float = float(v["harmonic"])
			if harmonic > 0.0:
				sig += harmonic * sin(phase * 2.02)
			var noise_amt: float = float(v["noise"])
			if noise_amt > 0.0:
				sig += noise_amt * _next_noise()

			var amp: float = float(v["amp"]) * env
			var pan: float = float(v["pan"])
			sample_l += sig * amp * (1.0 - maxf(0.0, pan))
			sample_r += sig * amp * (1.0 + minf(0.0, pan))
			idx -= 1

		sample_l = clampf(tanh(sample_l), -0.95, 0.95)
		sample_r = clampf(tanh(sample_r), -0.95, 0.95)
		_playback.push_frame(Vector2(sample_l, sample_r))


func play_horological_click(pitch_scale: float = 1.0) -> void:
	_spawn_voice(2650.0 * pitch_scale, 1850.0 * pitch_scale, 0.026, 0.24, 9.5, 0.35, 0.25, 0.0)
	_spawn_voice(5200.0 * pitch_scale, 4100.0 * pitch_scale, 0.015, 0.14, 12.0, 0.0, 0.12, 0.0)


func play_brass_snap() -> void:
	_spawn_voice(880.0, 872.0, 0.11, 0.22, 6.2, 0.42, 0.06, -0.08)
	_spawn_voice(1760.0, 1740.0, 0.08, 0.14, 7.5, 0.15, 0.0, 0.08)
	_spawn_voice(310.0, 180.0, 0.045, 0.24, 9.0, 0.0, 0.15, 0.0)


func play_peel_swoosh(tier: int = 2) -> void:
	var base: float = 420.0 if tier <= 2 else 580.0
	_spawn_voice(base, base * 2.15, 0.24, 0.20, 3.8, 0.28, 0.18, -0.15)
	_spawn_voice(base * 1.5, base * 2.8, 0.20, 0.15, 4.5, 0.20, 0.05, 0.15)


func play_overclock_pulse(charge: float) -> void:
	var c: float = clampf(charge, 0.0, 1.0)
	var freq: float = 150.0 + c * 290.0
	_spawn_voice(freq, freq * 1.18, 0.09, 0.18 + c * 0.10, 4.2, 0.55, 0.04, 0.0)
	_spawn_voice(freq * 2.0, freq * 2.35, 0.07, 0.11 + c * 0.08, 5.0, 0.25, 0.0, 0.0)


func play_lock_thunk(overclocked: bool = false) -> void:
	_spawn_voice(135.0, 52.0, 0.19, 0.44, 6.8, 0.30, 0.22, 0.0)
	_spawn_voice(660.0, 654.0, 0.16, 0.22, 5.2, 0.35, 0.0, 0.0)
	if overclocked:
		_spawn_voice(990.0, 1320.0, 0.26, 0.24, 3.6, 0.40, 0.0, 0.12)
		_spawn_voice(1480.0, 1480.0, 0.28, 0.16, 3.8, 0.20, 0.0, -0.12)


func play_verdict_correct(overclocked: bool = false) -> void:
	var chord: Array[float] = [261.63, 329.63, 392.0, 493.88]
	if overclocked:
		chord.append(587.33)
	for i: int in range(chord.size()):
		var f: float = chord[i]
		var pan: float = -0.25 + 0.5 * (float(i) / maxf(1.0, float(chord.size() - 1)))
		_spawn_voice(f, f * 1.003, 0.42, 0.16, 3.2, 0.22, 0.0, pan)


func play_verdict_wrong(backfired: bool = false) -> void:
	_spawn_voice(148.0, 74.0, 0.32, 0.38, 4.5, 0.40, 0.18, 0.0)
	_spawn_voice(208.0, 138.0, 0.28, 0.22, 4.8, 0.25, 0.10, -0.12)
	if backfired:
		_spawn_voice(92.0, 38.0, 0.46, 0.45, 3.4, 0.55, 0.32, 0.12)


func play_venue_chime(venue_code: String) -> void:
	var scale_map: Dictionary = {
		"ch": [523.25, 659.25, 783.99],
		"gb": [440.0, 523.25, 659.25],
		"jp": [440.0, 493.88, 659.25],
		"br": [392.0, 493.88, 587.33],
		"eg": [440.0, 466.16, 659.25],
		"is": [587.33, 698.46, 880.0],
		"sg": [493.88, 659.25, 739.99],
		"global": [523.25, 783.99, 1046.5],
	}
	var notes: Array = scale_map.get(venue_code.to_lower(), [523.25, 659.25, 783.99])
	for i: int in range(notes.size()):
		var f: float = float(notes[i])
		_spawn_voice(f, f, 0.34, 0.14, 4.0, 0.18, 0.0, (float(i) - 1.0) * 0.2)


func _spawn_voice(
	freq: float,
	freq_end: float,
	dur: float,
	amp: float,
	decay: float,
	harmonic: float,
	noise: float,
	pan: float
) -> void:
	if not _audio_active:
		return
	if _voices.size() >= MAX_VOICES:
		_voices.pop_front()
	_voices.append({
		"freq": freq,
		"freq_end": freq_end,
		"dur": maxf(0.01, dur),
		"age": 0.0,
		"phase": 0.0,
		"amp": amp,
		"decay": decay,
		"harmonic": harmonic,
		"noise": noise,
		"pan": pan,
	})


func _next_noise() -> float:
	_noise_state = (_noise_state ^ ((_noise_state << 13) & 0xFFFFFFFF)) & 0xFFFFFFFF
	_noise_state = (_noise_state ^ (_noise_state >> 17)) & 0xFFFFFFFF
	_noise_state = (_noise_state ^ ((_noise_state << 5) & 0xFFFFFFFF)) & 0xFFFFFFFF
	return (float(_noise_state & 0xFFFF) / 32768.0) - 1.0
