class_name SovereignTheme
extends RefCounted
## AAA Sculpted NinePatch Luxury UI Theme & Material Factory (Godot 4.7.2 — gl_compatibility Web-Safe).
## Upgrades flat CSS rectangles into richly bevel-lit brushed-obsidian & burnished-gold NinePatch panels
## (`godot/assets/ui/*.png`), animated metallic gold-foil sheen shaders (`godot/shaders/*.gdshader`),
## sculpted 3D-lit championship stars (`star_filled.png`/`star_empty.png`), and 12 illustrated Category Medallions!

const FONT_SERIF_PATH: String = "res://themes/fonts/Cinzel.ttf"
const FONT_SANS_PATH: String = "res://themes/fonts/PlusJakartaSans.ttf"
const FONT_MONO_PATH: String = "res://themes/fonts/JetBrainsMono.ttf"
const UI_DIR: String = "res://assets/ui/"
const SHIMMER_SHADER_PATH: String = "res://shaders/gold_foil_sheen.gdshader"

const INK_IVORY: Color = Color("#f5f1e6")
const INK_MUTED: Color = Color("#c8d1e0")
const GOLD_CHAMPAGNE: Color = Color("#f4d68c")
const GOLD_BRASS: Color = Color("#d4a853")
const GOLD_DARK_INK: Color = Color("#12151f")
const EMERALD_LOCK: Color = Color("#3ee89e")
const CRIMSON_FRACTURE: Color = Color("#ff5c72")
const CYAN_INTEL: Color = Color("#6ce0f5")
const GLASS_OBSIDIAN: Color = Color(0.039, 0.055, 0.094, 0.84)
const GLASS_RIBBON: Color = Color(0.031, 0.047, 0.078, 0.78)
const GLASS_FOCUSED: Color = Color(0.165, 0.128, 0.064, 0.92)
const GLASS_MODAL: Color = Color(0.032, 0.045, 0.076, 0.94)

static var _serif_semibold: Font = null
static var _serif_bold: Font = null
static var _sans_regular: Font = null
static var _sans_medium: Font = null
static var _sans_semibold: Font = null
static var _sans_bold: Font = null
static var _mono_bold: Font = null
static var _tex_cache: Dictionary = {}
static var _shimmer_mat_cache: ShaderMaterial = null


static func clear_cache() -> void:
	_serif_semibold = null
	_serif_bold = null
	_sans_regular = null
	_sans_medium = null
	_sans_semibold = null
	_sans_bold = null
	_mono_bold = null
	_tex_cache.clear()
	_shimmer_mat_cache = null


static func ensure_fonts() -> void:
	if _serif_semibold != null:
		return
	var base_serif: FontFile = _load_font(FONT_SERIF_PATH, true)
	var base_sans: FontFile = _load_font(FONT_SANS_PATH, true)
	var base_mono: FontFile = _load_font(FONT_MONO_PATH, false)

	_serif_semibold = _make_variation(base_serif, 600, 2)
	_serif_bold = _make_variation(base_serif, 700, 3)
	_sans_regular = _make_variation(base_sans, 450, 0)
	_sans_medium = _make_variation(base_sans, 520, 0)
	_sans_semibold = _make_variation(base_sans, 620, 0)
	_sans_bold = _make_variation(base_sans, 760, 0)
	_mono_bold = _make_variation(base_mono, 650, 0)


static func _load_font(path: String, use_msdf: bool) -> FontFile:
	if not ResourceLoader.exists(path):
		return null
	var f: FontFile = load(path) as FontFile
	if f != null:
		f.multichannel_signed_distance_field = use_msdf
		if use_msdf:
			f.msdf_size = 48
			f.msdf_pixel_range = 8
			f.generate_mipmaps = true
		else:
			f.oversampling = 2.0
			f.generate_mipmaps = false
	return f


static func _make_variation(base_font: FontFile, weight: int, glyph_spacing: int) -> Font:
	if base_font == null:
		return ThemeDB.fallback_font
	var fv: FontVariation = FontVariation.new()
	fv.base_font = base_font
	fv.variation_opentype = {"wght": weight}
	if glyph_spacing != 0:
		fv.spacing_glyph = glyph_spacing
	return fv


static func font_serif(bold: bool = false) -> Font:
	ensure_fonts()
	return _serif_bold if bold else _serif_semibold


static func font_sans(weight: String = "semibold") -> Font:
	ensure_fonts()
	match weight:
		"bold": return _sans_bold
		"medium": return _sans_medium
		"regular": return _sans_regular
		_: return _sans_semibold


static func font_mono() -> Font:
	ensure_fonts()
	return _mono_bold


static func load_ui_texture(filename: String) -> Texture2D:
	if _tex_cache.has(filename):
		return _tex_cache[filename] as Texture2D
	var path: String = UI_DIR + filename
	if ResourceLoader.exists(path):
		var tex: Texture2D = load(path) as Texture2D
		if tex != null:
			_tex_cache[filename] = tex
			return tex
	_tex_cache[filename] = null
	return null


static func load_category_icon(domain_id: int) -> Texture2D:
	return load_ui_texture("cat_%d.png" % clampi(domain_id, 0, 11))


static func load_category_icon_sized(domain_id: int, size_px: int = 56) -> Texture2D:
	var did: int = clampi(domain_id, 0, 11)
	var key: String = "cat_%d_%d" % [did, size_px]
	if _tex_cache.has(key):
		return _tex_cache[key] as Texture2D
	var base: Texture2D = load_category_icon(did)
	if base == null:
		return null
	var img: Image = base.get_image()
	if img == null or img.is_empty():
		return base
	var dup: Image = img.duplicate() as Image
	if dup.is_compressed():
		dup.decompress()
	dup.resize(size_px, size_px, Image.INTERPOLATE_LANCZOS)
	var out_tex: ImageTexture = ImageTexture.create_from_image(dup)
	_tex_cache[key] = out_tex
	return out_tex


static func has_sculpted_ui_pack() -> bool:
	return load_ui_texture("panel_tableau.png") != null


static func make_ninepatch_style(
	filename: String,
	margin_l: float,
	margin_r: float,
	margin_t: float,
	margin_b: float,
	pad_x: float,
	pad_y: float,
	modulate: Color = Color.WHITE,
	fallback: StyleBox = null,
	expand_l: float = 8.0,
	expand_r: float = 8.0,
	expand_t: float = 6.0,
	expand_b: float = 12.0
) -> StyleBox:
	var tex: Texture2D = load_ui_texture(filename)
	if tex == null:
		return fallback if fallback != null else make_smoked_glass(GLASS_OBSIDIAN, Color(0.949, 0.824, 0.545, 0.36), 20, int(pad_x), int(pad_y))
	var sb: StyleBoxTexture = StyleBoxTexture.new()
	sb.texture = tex
	sb.texture_margin_left = margin_l
	sb.texture_margin_right = margin_r
	sb.texture_margin_top = margin_t
	sb.texture_margin_bottom = margin_b
	sb.expand_margin_left = expand_l
	sb.expand_margin_right = expand_r
	sb.expand_margin_top = expand_t
	sb.expand_margin_bottom = expand_b
	sb.content_margin_left = pad_x
	sb.content_margin_right = pad_x
	sb.content_margin_top = pad_y
	sb.content_margin_bottom = pad_y
	sb.axis_stretch_horizontal = StyleBoxTexture.AXIS_STRETCH_MODE_STRETCH
	sb.axis_stretch_vertical = StyleBoxTexture.AXIS_STRETCH_MODE_STRETCH
	sb.modulate_color = modulate
	return sb


static func make_tableau_style(pad_x: float = 36.0, pad_y: float = 32.0) -> StyleBox:
	var fb: StyleBoxFlat = make_smoked_glass(Color(0.028, 0.042, 0.074, 0.90), Color(0.949, 0.824, 0.545, 0.46), 26, int(pad_x), int(pad_y), 24, 3, 1)
	return make_ninepatch_style("panel_tableau.png", 84.0, 84.0, 76.0, 80.0, pad_x, pad_y, Color.WHITE, fb, 10.0, 10.0, 8.0, 14.0)


static func make_dialogue_style(pad_x: float = 34.0, pad_y: float = 26.0) -> StyleBox:
	var fb: StyleBoxFlat = make_smoked_glass(Color(0.024, 0.036, 0.066, 0.92), Color(0.949, 0.824, 0.545, 0.44), 24, int(pad_x), int(pad_y), 22, 3, 1)
	return make_ninepatch_style("panel_dialogue_cinema.png", 72.0, 72.0, 64.0, 68.0, pad_x, pad_y, Color.WHITE, fb, 10.0, 10.0, 8.0, 14.0)


static func make_ribbon_style(pad_x: float = 22.0, pad_y: float = 12.0) -> StyleBox:
	## Sleek dark-obsidian chamfered ribbon bar with warm burnished-gold border for thin single-line bars & nameplates.
	return make_smoked_glass(Color(0.032, 0.048, 0.086, 0.92), Color(0.949, 0.800, 0.460, 0.72), 16, int(pad_x), int(pad_y), 14, 2, 2)


static func get_gold_shimmer_material() -> ShaderMaterial:
	if _shimmer_mat_cache != null:
		return _shimmer_mat_cache
	if ResourceLoader.exists(SHIMMER_SHADER_PATH):
		var sh: Shader = load(SHIMMER_SHADER_PATH) as Shader
		if sh != null:
			var sm: ShaderMaterial = ShaderMaterial.new()
			sm.shader = sh
			_shimmer_mat_cache = sm
			return sm
	var fb_sh: Shader = Shader.new()
	fb_sh.code = """
shader_type canvas_item;
uniform float speed = 0.55;
uniform float intensity = 0.22;
void fragment() {
	vec4 base = texture(TEXTURE, UV) * COLOR;
	float wave = fract(TIME * speed - UV.x * 0.55 - UV.y * 0.25);
	float band = exp(-pow((wave - 0.5) * 14.0, 2.0));
	vec3 lit = base.rgb + vec3(1.0, 0.94, 0.72) * band * intensity * base.a;
	COLOR = vec4(lit, base.a);
}
"""
	var sm2: ShaderMaterial = ShaderMaterial.new()
	sm2.shader = fb_sh
	_shimmer_mat_cache = sm2
	return sm2


static func make_star_control(filled: bool, size_px: int = 44) -> Control:
	var fname: String = "star_filled.png" if filled else "star_empty.png"
	var tex: Texture2D = load_ui_texture(fname)
	if tex != null:
		var tr: TextureRect = TextureRect.new()
		tr.texture = tex
		tr.custom_minimum_size = Vector2(size_px, size_px)
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		return tr
	var chip: PanelContainer = PanelContainer.new()
	chip.custom_minimum_size = Vector2(size_px, size_px)
	chip.mouse_filter = Control.MOUSE_FILTER_IGNORE
	chip.add_theme_stylebox_override("panel", make_flat_pill(
		Color(0.56, 0.42, 0.08, 0.96) if filled else Color(0.06, 0.08, 0.14, 0.72),
		GOLD_CHAMPAGNE if filled else Color(0.45, 0.50, 0.60, 0.35),
		maxi(8, size_px / 4), 2, 4, 2
	))
	var sl: Label = Label.new()
	sl.text = "*"
	sl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	sl.add_theme_font_override("font", font_sans("bold"))
	sl.add_theme_font_size_override("font_size", maxi(18, int(float(size_px) * 0.65)))
	sl.add_theme_color_override("font_color", Color("#fff6cc") if filled else Color(0.45, 0.50, 0.60, 0.36))
	chip.add_child(sl)
	return chip


static func build_root_theme() -> Theme:
	ensure_fonts()
	var t: Theme = Theme.new()
	t.default_font = _sans_semibold
	t.default_font_size = 36

	t.set_stylebox("panel", "PanelContainer", make_tableau_style(32.0, 26.0))
	t.set_stylebox("normal", "Button", make_ninepatch_style("btn_answer_idle.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, make_smoked_glass(GLASS_OBSIDIAN, Color(0.949, 0.824, 0.545, 0.34), 18, 22, 14)))
	t.set_stylebox("hover", "Button", make_ninepatch_style("btn_answer_hover.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, make_smoked_glass(Color(0.095, 0.125, 0.195, 0.90), Color(0.949, 0.824, 0.545, 0.76), 18, 22, 14)))
	t.set_stylebox("pressed", "Button", make_ninepatch_style("btn_answer_hover.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color(1.06, 1.0, 0.92, 1.0), make_smoked_glass(GLASS_FOCUSED, GOLD_CHAMPAGNE, 18, 22, 14)))
	t.set_stylebox("focus", "Button", make_ninepatch_style("btn_answer_hover.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, make_smoked_glass(Color(0.072, 0.095, 0.148, 0.84), Color(0.949, 0.824, 0.545, 0.60), 18, 22, 14)))
	t.set_stylebox("disabled", "Button", make_smoked_glass(Color(0.035, 0.045, 0.070, 0.36), Color(0.55, 0.58, 0.65, 0.18), 18, 22, 14, 0))

	t.set_color("font_color", "Button", INK_IVORY)
	t.set_color("font_hover_color", "Button", GOLD_CHAMPAGNE)
	t.set_color("font_pressed_color", "Button", GOLD_CHAMPAGNE)
	t.set_color("font_disabled_color", "Button", Color(0.62, 0.66, 0.74, 0.52))

	t.set_stylebox("background", "ProgressBar", make_flat_pill(Color(0.039, 0.055, 0.094, 0.68), Color(0.949, 0.824, 0.545, 0.24), 6, 1, 0, 0))
	t.set_stylebox("fill", "ProgressBar", make_flat_pill(GOLD_CHAMPAGNE, Color(1, 1, 1, 0), 6, 0, 0, 0))

	var slider_bg: StyleBoxFlat = make_flat_pill(Color(0.08, 0.11, 0.18, 0.92), Color(0.949, 0.824, 0.545, 0.45), 10, 2, 0, 10)
	var slider_fill: StyleBoxFlat = make_flat_pill(GOLD_BRASS, GOLD_CHAMPAGNE, 10, 1, 0, 10)
	t.set_stylebox("slider", "HSlider", slider_bg)
	t.set_stylebox("grabber_area", "HSlider", slider_fill)
	t.set_stylebox("grabber_area_highlight", "HSlider", make_flat_pill(GOLD_CHAMPAGNE, Color(1, 1, 1, 0.85), 10, 1, 0, 10))
	return t


static func make_smoked_glass(
	bg: Color,
	border: Color,
	radius: int = 18,
	pad_x: int = 22,
	pad_y: int = 14,
	shadow_size: int = 14,
	border_top: int = 2,
	border_other: int = 1
) -> StyleBoxFlat:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.border_width_top = border_top
	sb.border_width_left = border_other
	sb.border_width_right = border_other
	sb.border_width_bottom = border_other
	sb.set_corner_radius_all(radius)
	sb.content_margin_left = pad_x
	sb.content_margin_right = pad_x
	sb.content_margin_top = pad_y
	sb.content_margin_bottom = pad_y
	if shadow_size > 0:
		sb.shadow_color = Color(0.0, 0.0, 0.0, 0.46)
		sb.shadow_size = shadow_size
		sb.shadow_offset = Vector2(0, 6)
	return sb


static func make_flat_pill(
	bg: Color,
	border: Color,
	radius: int = 24,
	border_w: int = 1,
	pad_x: int = 18,
	pad_y: int = 10
) -> StyleBoxFlat:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.set_border_width_all(border_w)
	sb.set_corner_radius_all(radius)
	sb.content_margin_left = pad_x
	sb.content_margin_right = pad_x
	sb.content_margin_top = pad_y
	sb.content_margin_bottom = pad_y
	return sb


static func style_primary_gold_cta(btn: Button, full_pill: bool = true) -> void:
	ensure_fonts()
	var rad: int = 66 if full_pill else 20
	btn.add_theme_font_override("font", _sans_bold)
	btn.add_theme_color_override("font_color", GOLD_DARK_INK)
	btn.add_theme_color_override("font_hover_color", GOLD_DARK_INK)
	btn.add_theme_color_override("font_pressed_color", GOLD_DARK_INK)
	btn.add_theme_color_override("font_disabled_color", Color(0.18, 0.16, 0.12, 0.65))
	var fb_n: StyleBoxFlat = make_smoked_glass(GOLD_BRASS, Color(1.0, 0.94, 0.78, 0.90), rad, 32, 16, 18, 2, 2)
	var fb_h: StyleBoxFlat = make_smoked_glass(GOLD_CHAMPAGNE, Color(1.0, 0.98, 0.88, 0.98), rad, 32, 16, 22, 2, 2)
	var fb_p: StyleBoxFlat = make_smoked_glass(Color("#b88e3d"), Color(1.0, 0.90, 0.68, 0.92), rad, 32, 16, 8, 2, 2)
	var sb_n: StyleBox = make_ninepatch_style("btn_gold_primary.png", 68.0, 68.0, 50.0, 56.0, 32.0, 16.0, Color.WHITE, fb_n, 10.0, 10.0, 8.0, 14.0)
	var sb_h: StyleBox = make_ninepatch_style("btn_gold_hover.png", 68.0, 68.0, 50.0, 56.0, 32.0, 16.0, Color.WHITE, fb_h, 10.0, 10.0, 8.0, 14.0)
	var sb_p: StyleBox = make_ninepatch_style("btn_gold_primary.png", 68.0, 68.0, 50.0, 56.0, 32.0, 16.0, Color(0.88, 0.84, 0.76, 1.0), fb_p, 10.0, 10.0, 8.0, 14.0)
	btn.add_theme_stylebox_override("normal", sb_n)
	btn.add_theme_stylebox_override("hover", sb_h)
	btn.add_theme_stylebox_override("pressed", sb_p)
	btn.add_theme_stylebox_override("focus", sb_h)
	btn.add_theme_stylebox_override("disabled", make_smoked_glass(Color(0.32, 0.27, 0.18, 0.55), Color(0.65, 0.58, 0.42, 0.32), rad, 32, 16, 0, 1, 1))
	btn.material = get_gold_shimmer_material()


static func style_answer_pill(btn: Button, state: String) -> void:
	ensure_fonts()
	btn.add_theme_font_override("font", _sans_semibold)
	btn.material = null
	match state:
		"focused":
			var fb_f: StyleBoxFlat = make_smoked_glass(GLASS_FOCUSED, GOLD_CHAMPAGNE, 20, 24, 14, 16, 3, 2)
			var foc_sb: StyleBox = make_ninepatch_style("btn_answer_hover.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color(1.10, 1.03, 0.90, 1.0), fb_f)
			btn.add_theme_stylebox_override("normal", foc_sb)
			btn.add_theme_stylebox_override("hover", foc_sb)
			btn.add_theme_stylebox_override("disabled", foc_sb)
			btn.add_theme_color_override("font_color", GOLD_CHAMPAGNE)
			btn.add_theme_color_override("font_hover_color", Color("#fff6d4"))
			btn.add_theme_color_override("font_disabled_color", GOLD_CHAMPAGNE)
		"correct":
			var fb_c: StyleBoxFlat = make_smoked_glass(Color(0.06, 0.30, 0.21, 0.96), Color("#26b87a"), 20, 24, 14, 18, 3, 2)
			var cor_sb: StyleBox = make_ninepatch_style("btn_answer_correct.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, fb_c)
			btn.add_theme_stylebox_override("normal", cor_sb)
			btn.add_theme_stylebox_override("hover", cor_sb)
			btn.add_theme_stylebox_override("disabled", cor_sb)
			btn.add_theme_color_override("font_color", Color("#ecfff7"))
			btn.add_theme_color_override("font_disabled_color", Color("#ecfff7"))
		"wrong":
			var fb_w: StyleBoxFlat = make_smoked_glass(Color(0.30, 0.075, 0.095, 0.94), CRIMSON_FRACTURE, 20, 24, 14, 18, 3, 2)
			var wrg_sb: StyleBox = make_ninepatch_style("btn_answer_wrong.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, fb_w)
			btn.add_theme_stylebox_override("normal", wrg_sb)
			btn.add_theme_stylebox_override("hover", wrg_sb)
			btn.add_theme_stylebox_override("disabled", wrg_sb)
			btn.add_theme_color_override("font_color", Color("#ffe4e9"))
			btn.add_theme_color_override("font_disabled_color", Color("#ffe4e9"))
		"locked":
			var lck: StyleBoxFlat = make_smoked_glass(Color(0.042, 0.056, 0.092, 0.66), Color(0.62, 0.66, 0.76, 0.34), 20, 18, 12, 0, 1, 1)
			btn.add_theme_stylebox_override("normal", lck)
			btn.add_theme_stylebox_override("disabled", lck)
			btn.add_theme_color_override("font_color", Color(0.74, 0.78, 0.86, 0.80))
			btn.add_theme_color_override("font_disabled_color", Color(0.74, 0.78, 0.86, 0.80))
		"eliminated":
			var elim: StyleBoxFlat = make_smoked_glass(Color(0.032, 0.040, 0.058, 0.24), Color(0.45, 0.48, 0.54, 0.14), 20, 22, 14, 0, 1, 1)
			btn.add_theme_stylebox_override("normal", elim)
			btn.add_theme_stylebox_override("disabled", elim)
			btn.add_theme_color_override("font_color", Color(0.45, 0.48, 0.54, 0.32))
			btn.add_theme_color_override("font_disabled_color", Color(0.45, 0.48, 0.54, 0.32))
		_:
			var fb_n: StyleBoxFlat = make_smoked_glass(Color(0.045, 0.064, 0.110, 0.86), Color(0.949, 0.824, 0.545, 0.36), 20, 24, 14, 12, 2, 1)
			var fb_hv: StyleBoxFlat = make_smoked_glass(Color(0.095, 0.125, 0.195, 0.94), Color(0.949, 0.824, 0.545, 0.82), 20, 24, 14, 14, 2, 2)
			var norm_sb: StyleBox = make_ninepatch_style("btn_answer_idle.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, fb_n)
			var hov_sb: StyleBox = make_ninepatch_style("btn_answer_hover.png", 48.0, 48.0, 38.0, 40.0, 24.0, 14.0, Color.WHITE, fb_hv)
			btn.add_theme_stylebox_override("normal", norm_sb)
			btn.add_theme_stylebox_override("hover", hov_sb)
			btn.add_theme_stylebox_override("disabled", make_smoked_glass(Color(0.038, 0.050, 0.084, 0.52), Color(0.65, 0.68, 0.75, 0.18), 20, 22, 14, 0, 1, 1))
			btn.add_theme_color_override("font_color", INK_IVORY)
			btn.add_theme_color_override("font_hover_color", GOLD_CHAMPAGNE)
			btn.add_theme_color_override("font_disabled_color", Color(0.68, 0.72, 0.80, 0.65))


static func style_ghost_icon_button(btn: Button) -> void:
	ensure_fonts()
	btn.add_theme_font_override("font", _sans_bold)
	var empty_sb: StyleBoxEmpty = StyleBoxEmpty.new()
	btn.add_theme_stylebox_override("normal", empty_sb)
	btn.add_theme_stylebox_override("focus", empty_sb)
	btn.add_theme_stylebox_override("hover", make_flat_pill(Color(0.07, 0.095, 0.145, 0.58), Color(0.949, 0.824, 0.545, 0.42), 28, 1, 0, 0))
	btn.add_theme_stylebox_override("pressed", make_flat_pill(Color(0.14, 0.12, 0.08, 0.76), GOLD_CHAMPAGNE, 28, 1, 0, 0))
	btn.add_theme_color_override("font_color", INK_IVORY)
	btn.add_theme_color_override("font_hover_color", GOLD_CHAMPAGNE)


static func style_mode_tab(btn: Button, active: bool) -> void:
	ensure_fonts()
	btn.add_theme_font_override("font", _sans_bold if active else _sans_medium)
	var empty_sb: StyleBoxEmpty = StyleBoxEmpty.new()
	if active:
		var active_sb: StyleBoxFlat = StyleBoxFlat.new()
		active_sb.bg_color = Color(0.949, 0.824, 0.545, 0.14)
		active_sb.border_color = GOLD_CHAMPAGNE
		active_sb.border_width_bottom = 3
		active_sb.set_corner_radius_all(12)
		active_sb.content_margin_left = 10
		active_sb.content_margin_right = 10
		active_sb.content_margin_top = 10
		active_sb.content_margin_bottom = 10
		btn.add_theme_stylebox_override("normal", active_sb)
		btn.add_theme_stylebox_override("hover", active_sb)
		btn.add_theme_color_override("font_color", GOLD_CHAMPAGNE)
	else:
		btn.add_theme_stylebox_override("normal", empty_sb)
		btn.add_theme_stylebox_override("hover", make_flat_pill(Color(0.949, 0.824, 0.545, 0.08), Color(0, 0, 0, 0), 12, 0, 10, 10))
		btn.add_theme_color_override("font_color", INK_MUTED)
	btn.add_theme_stylebox_override("focus", empty_sb)
	btn.add_theme_stylebox_override("pressed", make_flat_pill(Color(0.949, 0.824, 0.545, 0.18), Color(0, 0, 0, 0), 12, 0, 10, 10))


static func make_vertical_scrim_texture(top_alpha: float, bottom_alpha: float) -> GradientTexture2D:
	var grad: Gradient = Gradient.new()
	grad.set_color(0, Color(0.024, 0.035, 0.063, top_alpha))
	grad.set_color(1, Color(0.024, 0.035, 0.063, bottom_alpha))
	var tex: GradientTexture2D = GradientTexture2D.new()
	tex.gradient = grad
	tex.width = 4
	tex.height = 128
	tex.fill_from = Vector2(0.5, 0.0)
	tex.fill_to = Vector2(0.5, 1.0)
	return tex


static func make_cutout_feather_material() -> ShaderMaterial:
	var shader: Shader = Shader.new()
	shader.code = """
shader_type canvas_item;
uniform float speak_lift : hint_range(0.0, 0.15) = 0.0;
void fragment() {
	vec4 tex = texture(TEXTURE, UV);
	float bottom_fade = 1.0 - smoothstep(0.72, 0.98, UV.y);
	float left_fade = smoothstep(0.0, 0.055, UV.x);
	float right_fade = 1.0 - smoothstep(0.945, 1.0, UV.x);
	float edge_alpha = bottom_fade * left_fade * right_fade;
	vec3 col = tex.rgb * (1.0 + speak_lift);
	COLOR = vec4(col, tex.a * edge_alpha) * COLOR;
}
"""
	var sm: ShaderMaterial = ShaderMaterial.new()
	sm.shader = shader
	return sm


static func sanitize_display_text(text: String) -> String:
	ensure_fonts()
	if _sans_semibold == null or text.is_empty():
		return text
	var needs_fix: bool = false
	for i: int in range(text.length()):
		var cp: int = text.unicode_at(i)
		if cp > 127 and not _sans_semibold.has_char(cp):
			needs_fix = true
			break
	if not needs_fix:
		return text

	var repl: Dictionary = {
		"’": "'", "‘": "'", "“": "\"", "”": "\"", "–": "-", "—": "-",
		"−": "-", "×": "x", "²": "^2", "³": "^3", "¹": "^1", "⁰": "^0",
		"⁶": "^6", "⁷": "^7", "₂": "2", "₃": "3", "°": " deg", "±": "+/-",
		"≈": "~", "√": "sqrt", "π": "pi", "Ω": "Ohm", "Δ": "Delta",
		"Φ": "Phi", "Γ": "Gamma", "φ": "phi", "ℝ": "R", "′": "'", "″": "\"",
		"¾": "3/4", "£": "GBP ",
	}
	var out: String = ""
	for i: int in range(text.length()):
		var ch: String = text[i]
		var cp: int = text.unicode_at(i)
		if cp <= 127 or _sans_semibold.has_char(cp):
			out += ch
		elif repl.has(ch):
			out += str(repl[ch])
		else:
			out += " "
	return out
