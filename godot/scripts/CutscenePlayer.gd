class_name CutscenePlayer
extends Control
## Full-Screen Illustrated Graphic-Novel Cutscene Theater for World's Smartest (Godot 4.7.2).
## Renders feature-film painted key-art (`godot/assets/cutscenes/act0..act5.jpg`) with aspect-preserving
## Ken-Burns zoom & slow cinematic pan, dramatic embossed Act Title Card, sculpted dialogue frame
## (`panel_dialogue_cinema.png`), synced neural VO + live golden equalizer bars, and NEXT / SKIP controls.

signal cutscene_finished(act_id: String)

var _bg_rect: ColorRect = null
var _bg_mat: ShaderMaterial = null
var _fallback_tex: ImageTexture = null
var _act_eyebrow: Label = null
var _act_title: Label = null
var _speaker_name: Label = null
var _speaker_role: Label = null
var _vo_bars: Array[ColorRect] = []
var _subtitle_label: Label = null
var _beat_counter: Label = null
var _next_btn: Button = null
var _skip_btn: Button = null

var _current_cutscene: Dictionary = {}
var _beats: Array[Dictionary] = []
var _beat_idx: int = 0
var _time_acc: float = 0.0
var _beat_elapsed: float = 0.0
var _pan_dir: Vector2 = Vector2(1.0, -0.3)
var _active: bool = false


func _ready() -> void:
	name = "CutscenePlayer"
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	visible = false
	_build_fallback()
	_build_ui()


func _exit_tree() -> void:
	_fallback_tex = null
	_bg_mat = null


func _build_fallback() -> void:
	var img: Image = Image.create(4, 4, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.03, 0.04, 0.07, 1.0))
	_fallback_tex = ImageTexture.create_from_image(img)


func _build_ui() -> void:
	# Full-bleed Ken-Burns Graphic-Novel Key Art Layer
	_bg_rect = ColorRect.new()
	_bg_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_bg_rect.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_bg_rect)

	var shader: Shader = Shader.new()
	shader.code = """
shader_type canvas_item;
uniform sampler2D tex_art : filter_linear_mipmap, repeat_disable;
uniform float tex_aspect = 1.7777;
uniform float view_aspect = 1.7777;
uniform float zoom = 1.06;
uniform vec2 pan = vec2(0.0, 0.0);
uniform float fade_alpha = 1.0;

vec2 cover_uv(vec2 uv, float t_aspect, float v_aspect, float z, vec2 p) {
	vec2 c = uv - vec2(0.5);
	if (v_aspect > t_aspect) {
		c.y *= (t_aspect / max(v_aspect, 0.001));
	} else {
		c.x *= (v_aspect / max(t_aspect, 0.001));
	}
	c = c / max(z, 1.0) + p;
	return clamp(c + vec2(0.5), vec2(0.002), vec2(0.998));
}

void fragment() {
	vec2 uv = cover_uv(UV, tex_aspect, view_aspect, zoom, pan);
	vec3 col = texture(tex_art, uv).rgb;

	// Prestige theatrical letterbox gradient (top & bottom readability scrims + soft edge vignette)
	float top_scrim = smoothstep(0.32, 0.0, UV.y) * 0.62;
	float bot_scrim = smoothstep(0.56, 0.96, UV.y) * 0.84;
	float vig = smoothstep(0.38, 1.02, length((UV - vec2(0.5)) * vec2(1.05, 1.15))) * 0.42;
	col *= (1.0 - max(max(top_scrim, bot_scrim), vig));
	COLOR = vec4(col * fade_alpha, 1.0);
}
"""
	_bg_mat = ShaderMaterial.new()
	_bg_mat.shader = shader
	_bg_mat.set_shader_parameter("tex_art", _fallback_tex)
	_bg_rect.material = _bg_mat

	# Safe margin overlay container
	var margin: MarginContainer = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 42)
	margin.add_theme_constant_override("margin_right", 42)
	margin.add_theme_constant_override("margin_top", 38)
	margin.add_theme_constant_override("margin_bottom", 42)
	margin.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(margin)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	vbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	margin.add_child(vbox)

	# Top Cinema Bar: Embossed Act Crest + SKIP CUTSCENE
	var top: HBoxContainer = HBoxContainer.new()
	top.add_theme_constant_override("separation", 14)
	var title_col: VBoxContainer = VBoxContainer.new()
	title_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_col.add_theme_constant_override("separation", 4)

	_act_eyebrow = Label.new()
	_act_eyebrow.text = "ACT 0  ·  GENEVA PROLOGUE"
	_act_eyebrow.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	_act_eyebrow.add_theme_font_size_override("font_size", 26)
	_act_eyebrow.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	title_col.add_child(_act_eyebrow)

	_act_title = Label.new()
	_act_title.text = "THE INVITATION"
	_act_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_act_title.add_theme_font_override("font", SovereignTheme.font_serif(true))
	_act_title.add_theme_font_size_override("font_size", 52)
	_act_title.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	_act_title.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.85))
	_act_title.add_theme_constant_override("shadow_offset_y", 4)
	title_col.add_child(_act_title)
	top.add_child(title_col)

	_skip_btn = Button.new()
	_skip_btn.text = "SKIP CUTSCENE >"
	_skip_btn.custom_minimum_size = Vector2(220, 76)
	_skip_btn.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	_skip_btn.add_theme_font_size_override("font_size", 26)
	SovereignTheme.style_answer_pill(_skip_btn, "normal")
	_skip_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	_skip_btn.pressed.connect(_on_skip_pressed)
	top.add_child(_skip_btn)
	vbox.add_child(top)

	# Open full-bleed illustration space (>= 62% screen!)
	var open_art: Control = Control.new()
	open_art.size_flags_vertical = Control.SIZE_EXPAND_FILL
	open_art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(open_art)

	# Sculpted Bottom Cinema Subtitle Card
	var dlg_card: PanelContainer = PanelContainer.new()
	dlg_card.custom_minimum_size = Vector2(0, 0)
	dlg_card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dlg_card.add_theme_stylebox_override("panel", SovereignTheme.make_dialogue_style(30.0, 22.0))
	vbox.add_child(dlg_card)

	var dbox: VBoxContainer = VBoxContainer.new()
	dbox.add_theme_constant_override("separation", 12)
	dlg_card.add_child(dbox)

	var hdr: HBoxContainer = HBoxContainer.new()
	hdr.add_theme_constant_override("separation", 14)

	var bar_accent: ColorRect = ColorRect.new()
	bar_accent.color = SovereignTheme.GOLD_CHAMPAGNE
	bar_accent.custom_minimum_size = Vector2(6, 48)
	hdr.add_child(bar_accent)

	var spk_col: VBoxContainer = VBoxContainer.new()
	spk_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_speaker_name = Label.new()
	_speaker_name.text = "JULIAN VANCE"
	_speaker_name.add_theme_font_override("font", SovereignTheme.font_serif(true))
	_speaker_name.add_theme_font_size_override("font_size", 34)
	_speaker_name.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	spk_col.add_child(_speaker_name)

	_speaker_role = Label.new()
	_speaker_role.text = "Championship Host"
	_speaker_role.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
	_speaker_role.add_theme_font_size_override("font_size", 24)
	_speaker_role.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	spk_col.add_child(_speaker_role)
	hdr.add_child(spk_col)

	var eq_box: HBoxContainer = HBoxContainer.new()
	eq_box.alignment = BoxContainer.ALIGNMENT_END
	eq_box.add_theme_constant_override("separation", 5)
	_vo_bars.clear()
	for _i: int in range(3):
		var b: ColorRect = ColorRect.new()
		b.color = SovereignTheme.GOLD_CHAMPAGNE
		b.custom_minimum_size = Vector2(8, 12)
		b.size_flags_vertical = Control.SIZE_SHRINK_END
		eq_box.add_child(b)
		_vo_bars.append(b)
	hdr.add_child(eq_box)
	dbox.add_child(hdr)

	_subtitle_label = Label.new()
	_subtitle_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_subtitle_label.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	_subtitle_label.add_theme_font_size_override("font_size", 36)
	_subtitle_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	dbox.add_child(_subtitle_label)

	var foot: HBoxContainer = HBoxContainer.new()
	foot.add_theme_constant_override("separation", 14)
	_beat_counter = Label.new()
	_beat_counter.text = "1 / 3"
	_beat_counter.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_beat_counter.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_beat_counter.add_theme_font_override("font", SovereignTheme.font_mono())
	_beat_counter.add_theme_font_size_override("font_size", 26)
	_beat_counter.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	foot.add_child(_beat_counter)

	_next_btn = Button.new()
	_next_btn.text = "NEXT >"
	_next_btn.custom_minimum_size = Vector2(300, 96)
	_next_btn.add_theme_font_size_override("font_size", 34)
	SovereignTheme.style_primary_gold_cta(_next_btn, false)
	_next_btn.pressed.connect(_on_next_pressed)
	foot.add_child(_next_btn)
	dbox.add_child(foot)


func play_cutscene(cutscene_def: Dictionary) -> void:
	_current_cutscene = cutscene_def
	_beats.clear()
	var raw_beats: Variant = cutscene_def.get("beats", cutscene_def.get("lines", []))
	if raw_beats is Array:
		for b: Variant in (raw_beats as Array):
			if b is Dictionary:
				_beats.append(b as Dictionary)
			elif b is String:
				_beats.append({"speaker": "vance", "text": b})
	if _beats.is_empty():
		_beats.append({"speaker": "vance", "text": str(cutscene_def.get("summary", "The Meridian Championship begins."))})

	_beat_idx = 0
	_time_acc = 0.0
	_beat_elapsed = 0.0
	_active = true
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	visible = true

	var act_num: int = int(cutscene_def.get("act_index", cutscene_def.get("act", 0)))
	var sub_tag: String = str(cutscene_def.get("location", cutscene_def.get("subtitle", "WORLD CHAMPIONSHIP"))).to_upper()
	_act_eyebrow.text = "ACT %d  ·  %s" % [act_num, SovereignTheme.sanitize_display_text(sub_tag)]
	var raw_title: String = str(cutscene_def.get("title", "THE INVITATION")).to_upper().strip_edges()
	if raw_title.begins_with("ACT "):
		var sep_dot: int = raw_title.find("·")
		var sep_col: int = raw_title.find(":")
		var cut_i: int = sep_dot if sep_dot >= 0 else sep_col
		if cut_i >= 0:
			raw_title = raw_title.substr(cut_i + 1).strip_edges()
	_act_title.text = SovereignTheme.sanitize_display_text(raw_title)

	# Load feature-film graphic-novel artwork
	var img_path: String = str(cutscene_def.get("image", cutscene_def.get("art_path", "")))
	if not img_path.begins_with("res://") and not img_path.is_empty():
		img_path = "res://assets/cutscenes/" + img_path.get_file()
	var tex: Texture2D = _fallback_tex
	if not img_path.is_empty() and ResourceLoader.exists(img_path):
		var loaded: Texture2D = load(img_path) as Texture2D
		if loaded != null:
			tex = loaded
	_bg_mat.set_shader_parameter("tex_art", tex)
	if tex != null and tex.get_height() > 0:
		_bg_mat.set_shader_parameter("tex_aspect", float(tex.get_width()) / float(tex.get_height()))

	var music_key: String = str(cutscene_def.get("music", "music_campaign_mystery")).get_file().get_basename()
	if music_key.is_empty():
		music_key = "music_campaign_mystery"
	AudioDirector.play_music_with_fallback(music_key, "music_vetting_ambient", -10.5)
	AudioDirector.play_cutscene_whoosh()
	_render_current_beat()


func _render_current_beat() -> void:
	if _beat_idx >= _beats.size():
		_finish()
		return
	_beat_elapsed = 0.0
	_pan_dir = Vector2(1.0 if _beat_idx % 2 == 0 else -1.0, -0.35 if _beat_idx % 2 == 0 else 0.35)

	var beat: Dictionary = _beats[_beat_idx]
	var spk_id: String = str(beat.get("speaker", "vance")).to_lower()
	var prof: Dictionary = TriviaDB.get_cast_profile(spk_id)
	var override_name: String = str(beat.get("speaker_name", "")).strip_edges()
	_speaker_name.text = SovereignTheme.sanitize_display_text(override_name.to_upper() if not override_name.is_empty() else str(prof["name"]))
	_speaker_role.text = str(prof["role"])
	_subtitle_label.text = SovereignTheme.sanitize_display_text(str(beat.get("text", "")))
	_beat_counter.text = "SCENE %d / %d" % [_beat_idx + 1, _beats.size()]
	_next_btn.text = "CONTINUE >" if _beat_idx >= _beats.size() - 1 else "NEXT >"

	var vclip: String = str(beat.get("voice_clip", beat.get("voiceClip", "")))
	if vclip.is_empty():
		var act_num: int = int(_current_cutscene.get("act_index", _current_cutscene.get("act", 0)))
		vclip = "cutscene_act%d_%d" % [act_num, _beat_idx + 1]
	if not AudioDirector.play_voice(vclip):
		AudioDirector.stop_voice()
		AudioDirector.play_cutscene_whoosh()


func _on_next_pressed() -> void:
	if not _active:
		return
	AudioDirector.play_ui_click()
	_beat_idx += 1
	_render_current_beat()


func _on_skip_pressed() -> void:
	if not _active:
		return
	AudioDirector.play_ui_click()
	_finish()


func _finish() -> void:
	_active = false
	visible = false
	AudioDirector.stop_voice()
	var cid: String = str(_current_cutscene.get("id", "act0"))
	cutscene_finished.emit(cid)


func _process(delta: float) -> void:
	if not _active or not visible:
		return
	_time_acc += delta
	_beat_elapsed += delta

	if _bg_mat != null:
		var vp: Vector2 = get_viewport().get_visible_rect().size
		_bg_mat.set_shader_parameter("view_aspect", vp.x / maxf(1.0, vp.y))
		var zoom_v: float = 1.04 + clampf(_time_acc * 0.012, 0.0, 0.10)
		var pan_v: Vector2 = _pan_dir * sin(_time_acc * 0.25) * 0.018
		_bg_mat.set_shader_parameter("zoom", zoom_v)
		_bg_mat.set_shader_parameter("pan", pan_v)
		_bg_mat.set_shader_parameter("fade_alpha", clampf(0.45 + _time_acc * 3.5, 0.45, 1.0))

	var pulse: float = AudioDirector.get_voice_pulse()
	for i: int in range(_vo_bars.size()):
		var ph: float = _time_acc * (11.0 + float(i) * 3.4)
		_vo_bars[i].custom_minimum_size.y = 10.0 + (34.0 * pulse * (0.45 + 0.55 * absf(sin(ph))))
