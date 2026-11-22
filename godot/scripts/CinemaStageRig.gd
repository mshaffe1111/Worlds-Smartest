class_name CinemaStageRig
extends Node3D
## Cinema-Grade 2.5D Architectural Parallax Stage + Lean 3D Hero Studio Rig (Godot 4.7.2 gl_compatibility).
## Replaces heavy unbaked 3D rooms & clashing desk props with:
##  1. Full-bleed aspect-preserving 2.5D shader stage across all 10 Hollywood-grade painted venues
##     (Ken-Burns breathing + live pointer parallax + animated golden skylight beams + soft circular bokeh embers
##     + live broadcast mood lighting for Reading, 2x Wager Spotlight, Suspense Hush, Emerald Win, Crimson Miss).
##  2. Lean transparent 3D SubViewport studio rig rendered ONLY when a 3D Hero Artifact is active (Title Orb / World Globe),
##     completely disabled during active trivia gameplay for locked 60 FPS & zero WebAudio crackle!

const VENUE_IMAGE_PATHS: Dictionary = {
	"ch": "res://assets/venues/ch.jpg",
	"gb": "res://assets/venues/gb.jpg",
	"jp": "res://assets/venues/jp.jpg",
	"br": "res://assets/venues/br.jpg",
	"eg": "res://assets/venues/eg.jpg",
	"is": "res://assets/venues/is.jpg",
	"sg": "res://assets/venues/sg.jpg",
	"global": "res://assets/venues/global.jpg",
	"ledger": "res://assets/venues/ledger.jpg",
	"studio": "res://assets/venues/studio.jpg",
}

const STUDIO_HDRI_PATH: String = "res://assets/polyhaven/hdris/studio_small_09.hdr"

var current_venue: String = "ch"
var current_mood: String = "TITLE"

# 2.5D Stage Nodes
var _stage_layer: CanvasLayer = null
var _stage_rect: ColorRect = null
var _stage_mat: ShaderMaterial = null
var _venue_tex_cache: Dictionary = {}
var _fallback_tex: ImageTexture = null

# Crossfade & Live Mood Interpolation
var _blend_t: float = 1.0
var _time_acc: float = 0.0
var _pointer_target: Vector2 = Vector2.ZERO
var _pointer_smooth: Vector2 = Vector2.ZERO

var _cur_vignette: float = 0.36
var _tgt_vignette: float = 0.36
var _cur_darken: float = 0.06
var _tgt_darken: float = 0.06
var _cur_gold_spot: float = 0.14
var _tgt_gold_spot: float = 0.14
var _cur_tint: Color = Color(1.0, 0.98, 0.94, 0.0)
var _tgt_tint: Color = Color(1.0, 0.98, 0.94, 0.0)
var _cur_pulse_amt: float = 0.0
var _flash_decay: float = 0.0

# 3D Hero Transparent SubViewport Rig (ONLY active on Title Orb & World Globe!)
var _hero_layer: CanvasLayer = null
var _hero_container: SubViewportContainer = null
var _hero_viewport: SubViewport = null
var _hero_world_env: WorldEnvironment = null
var _hero_key_light: DirectionalLight3D = null
var _hero_rim_light: DirectionalLight3D = null
var _hero_bounce_light: OmniLight3D = null
var _hero_3d_active: bool = true
var _loaded_hdri_ok: bool = false


func _ready() -> void:
	_build_fallback_texture()
	_build_25d_stage()
	_build_hero_3d_viewport()
	set_venue("ch", true)
	set_mood("TITLE", true)


func _exit_tree() -> void:
	_venue_tex_cache.clear()
	_fallback_tex = null
	_stage_mat = null


func get_hero_viewport_root() -> SubViewport:
	return _hero_viewport


func set_hero_3d_enabled(enabled: bool) -> void:
	_hero_3d_active = enabled
	if _hero_container != null:
		_hero_container.visible = enabled
	if _hero_viewport != null:
		_hero_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS if enabled else SubViewport.UPDATE_DISABLED


func _build_fallback_texture() -> void:
	var img: Image = Image.create(4, 4, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.05, 0.07, 0.12, 1.0))
	_fallback_tex = ImageTexture.create_from_image(img)


func _build_25d_stage() -> void:
	_stage_layer = CanvasLayer.new()
	_stage_layer.name = "CinemaStageLayer"
	_stage_layer.layer = -10
	add_child(_stage_layer)

	_stage_rect = ColorRect.new()
	_stage_rect.name = "CinemaStageQuad"
	_stage_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_stage_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_stage_layer.add_child(_stage_rect)

	var shader: Shader = Shader.new()
	shader.code = """
shader_type canvas_item;

uniform sampler2D tex_prev : filter_linear_mipmap, repeat_disable;
uniform sampler2D tex_curr : filter_linear_mipmap, repeat_disable;
uniform float tex_aspect = 1.79166;
uniform float view_aspect = 1.77777;
uniform float blend_t = 1.0;
uniform float time_sec = 0.0;
uniform vec2 parallax = vec2(0.0, 0.0);
uniform float vignette_strength = 0.38;
uniform float darken_focus = 0.12;
uniform float spotlight_gold = 0.16;
uniform vec4 mood_tint = vec4(1.0, 0.96, 0.88, 0.0);

vec2 cover_uv(vec2 uv, float t_aspect, float v_aspect, float zoom, vec2 drift) {
	vec2 centered = uv - vec2(0.5);
	if (v_aspect > t_aspect) {
		centered.y *= (t_aspect / max(v_aspect, 0.001));
	} else {
		centered.x *= (v_aspect / max(t_aspect, 0.001));
	}
	centered = centered / max(zoom, 1.0) + drift;
	return clamp(centered + vec2(0.5), vec2(0.002), vec2(0.998));
}

float hash11(float p) {
	p = fract(p * 0.1031);
	p *= p + 33.33;
	p *= p + p;
	return fract(p);
}

void fragment() {
	// Subtle Ken-Burns cinema breathing + gentle pointer parallax
	float zoom = 1.045 + sin(time_sec * 0.22) * 0.018;
	vec2 ken_drift = vec2(sin(time_sec * 0.16) * 0.008, cos(time_sec * 0.19) * 0.005);
	vec2 drift = ken_drift + parallax * 0.015;
	vec2 uv = cover_uv(UV, tex_aspect, view_aspect, zoom, drift);

	vec3 col_prev = texture(tex_prev, uv).rgb;
	vec3 col_curr = texture(tex_curr, uv).rgb;
	vec3 col = mix(col_prev, col_curr, clamp(blend_t, 0.0, 1.0));

	// Subtle cinematic warm-shadow contrast lift (keeps highlights jewel-rich)
	col = pow(max(col, vec3(0.0)), vec3(1.04));

	// Animated architectural volumetric skylight beams (diagonal soft shafts from top-left & top-center)
	float beam_coord = UV.x * 1.15 - UV.y * 0.42;
	float shaft1 = exp(-pow((beam_coord - 0.18 + sin(time_sec * 0.35) * 0.04) * 5.2, 2.0));
	float shaft2 = exp(-pow((beam_coord - 0.56 + cos(time_sec * 0.28) * 0.05) * 4.4, 2.0));
	float top_falloff = smoothstep(0.95, 0.05, UV.y);
	float beams = (shaft1 * 0.65 + shaft2 * 0.45) * top_falloff;
	col += vec3(1.0, 0.86, 0.56) * beams * (0.075 + spotlight_gold * 0.18);

	// 2x Wager / Broadcast overhead golden spotlight cone
	vec2 spot_delta = (UV - vec2(0.5, 0.34)) * vec2(view_aspect * 0.72, 1.0);
	float spot_rad = length(spot_delta);
	float spot_cone = smoothstep(0.92, 0.08, spot_rad);
	col += vec3(1.0, 0.82, 0.42) * spot_cone * spotlight_gold * 0.22;

	// Analytical circular golden bokeh dust embers (100% smooth circles, ZERO square pixels!)
	vec3 bokeh_acc = vec3(0.0);
	for (int i = 0; i < 12; i++) {
		float fi = float(i) + 1.0;
		float sx = hash11(fi * 17.31);
		float sy = hash11(fi * 43.17);
		float spd = 0.012 + hash11(fi * 9.73) * 0.016;
		float rad = 0.0045 + hash11(fi * 29.11) * 0.0085;
		float bx = fract(sx + sin(time_sec * (0.24 + spd * 4.0) + fi * 2.1) * 0.035 + parallax.x * 0.028);
		float by = fract(sy - time_sec * spd + parallax.y * 0.018);
		vec2 d = (UV - vec2(bx, by)) * vec2(view_aspect, 1.0);
		float dist = length(d);
		float glow = smoothstep(rad * 1.9, rad * 0.15, dist);
		float twinkle = 0.55 + 0.45 * sin(time_sec * (1.2 + hash11(fi * 5.3) * 1.8) + fi * 3.7);
		bokeh_acc += vec3(1.0, 0.86, 0.54) * glow * twinkle * (0.14 + spotlight_gold * 0.20);
	}
	col += bokeh_acc;

	// Theater vignette + focus darken so HUD text pops effortlessly
	vec2 vig_d = (UV - vec2(0.5)) * vec2(1.08, 1.16);
	float vig = smoothstep(0.32, 0.98, length(vig_d));
	col *= 1.0 - clamp(darken_focus, 0.0, 0.65);
	col *= 1.0 - vig * clamp(vignette_strength, 0.0, 0.90);

	// Live mood color grade / win-emerald or wrong-crimson edge shimmer
	col = mix(col, col * mood_tint.rgb + mood_tint.rgb * 0.18, clamp(mood_tint.a, 0.0, 0.65));

	COLOR = vec4(clamp(col, vec3(0.0), vec3(1.0)), 1.0);
}
"""
	_stage_mat = ShaderMaterial.new()
	_stage_mat.shader = shader
	_stage_mat.set_shader_parameter("tex_prev", _fallback_tex)
	_stage_mat.set_shader_parameter("tex_curr", _fallback_tex)
	_stage_mat.set_shader_parameter("blend_t", 1.0)
	_stage_rect.material = _stage_mat


func _build_hero_3d_viewport() -> void:
	_hero_layer = CanvasLayer.new()
	_hero_layer.name = "Hero3DLayer"
	_hero_layer.layer = -5
	add_child(_hero_layer)

	_hero_container = SubViewportContainer.new()
	_hero_container.name = "Hero3DViewportContainer"
	_hero_container.set_anchors_preset(Control.PRESET_FULL_RECT)
	_hero_container.stretch = true
	_hero_container.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hero_layer.add_child(_hero_container)

	_hero_viewport = SubViewport.new()
	_hero_viewport.name = "Hero3DViewport"
	_hero_viewport.transparent_bg = true
	_hero_viewport.own_world_3d = true
	_hero_viewport.msaa_3d = Viewport.MSAA_4X
	_hero_viewport.use_hdr_2d = false
	_hero_viewport.handle_input_locally = false
	_hero_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	_hero_container.add_child(_hero_viewport)

	# Crisp museum jewelry studio environment (warm gold HDRI reflections + transparent background!)
	_hero_world_env = WorldEnvironment.new()
	_hero_world_env.name = "HeroStudioEnvironment"
	var env: Environment = Environment.new()
	env.background_mode = Environment.BG_CLEAR_COLOR
	env.background_color = Color(0.0, 0.0, 0.0, 0.0)
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.tonemap_exposure = 1.08
	env.tonemap_white = 4.5
	# Keep glow OFF inside transparent SubViewport so WebGL2 alpha compositing stays razor-sharp with 0 halos!
	env.glow_enabled = false

	if ResourceLoader.exists(STUDIO_HDRI_PATH):
		var hdri_tex: Texture2D = load(STUDIO_HDRI_PATH) as Texture2D
		if hdri_tex != null:
			var sky_mat: PanoramaSkyMaterial = PanoramaSkyMaterial.new()
			sky_mat.panorama = hdri_tex
			sky_mat.energy_multiplier = 1.25
			var sky: Sky = Sky.new()
			sky.sky_material = sky_mat
			env.sky = sky
			env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
			env.ambient_light_sky_contribution = 0.85
			env.ambient_light_energy = 0.85
			env.reflected_light_source = Environment.REFLECTION_SOURCE_SKY
			_loaded_hdri_ok = true
	if not _loaded_hdri_ok:
		env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
		env.ambient_light_color = Color(0.45, 0.42, 0.36)
		env.ambient_light_energy = 0.9

	_hero_world_env.environment = env
	_hero_viewport.add_child(_hero_world_env)

	# 3-Point Luxury Horology Studio Lighting (Rembrandt Gold Key + Cool Sapphire Rim + Warm Underside Fill)
	_hero_key_light = DirectionalLight3D.new()
	_hero_key_light.name = "HeroRembrandtKey"
	_hero_key_light.rotation_degrees = Vector3(-34.0, 38.0, 0.0)
	_hero_key_light.light_color = Color(1.0, 0.91, 0.74)
	_hero_key_light.light_energy = 2.15
	_hero_key_light.shadow_enabled = false
	_hero_viewport.add_child(_hero_key_light)

	_hero_rim_light = DirectionalLight3D.new()
	_hero_rim_light.name = "HeroSapphireRim"
	_hero_rim_light.rotation_degrees = Vector3(-18.0, -142.0, 0.0)
	_hero_rim_light.light_color = Color(0.68, 0.84, 1.0)
	_hero_rim_light.light_energy = 1.75
	_hero_rim_light.shadow_enabled = false
	_hero_viewport.add_child(_hero_rim_light)

	_hero_bounce_light = OmniLight3D.new()
	_hero_bounce_light.name = "HeroWarmBounce"
	_hero_bounce_light.position = Vector3(-0.65, -0.35, 1.25)
	_hero_bounce_light.light_color = Color(1.0, 0.82, 0.50)
	_hero_bounce_light.light_energy = 1.45
	_hero_bounce_light.omni_range = 5.0
	_hero_viewport.add_child(_hero_bounce_light)


func _load_venue_texture(code: String) -> Texture2D:
	var key: String = code.to_lower()
	if not VENUE_IMAGE_PATHS.has(key):
		key = "ch"
	if _venue_tex_cache.has(key):
		return _venue_tex_cache[key] as Texture2D
	var path: String = str(VENUE_IMAGE_PATHS[key])
	if ResourceLoader.exists(path):
		var tex: Texture2D = load(path) as Texture2D
		if tex != null:
			_venue_tex_cache[key] = tex
			return tex
	return _fallback_tex


func set_venue(code: String, instant: bool = false) -> void:
	var key: String = code.to_lower()
	if not VENUE_IMAGE_PATHS.has(key):
		key = "ch"
	var next_tex: Texture2D = _load_venue_texture(key)
	var prev_tex: Texture2D = _load_venue_texture(current_venue)
	current_venue = key

	if _stage_mat == null:
		return
	if next_tex != null and next_tex.get_height() > 0:
		_stage_mat.set_shader_parameter("tex_aspect", float(next_tex.get_width()) / float(next_tex.get_height()))
	if instant or prev_tex == next_tex:
		_stage_mat.set_shader_parameter("tex_prev", next_tex)
		_stage_mat.set_shader_parameter("tex_curr", next_tex)
		_blend_t = 1.0
		_stage_mat.set_shader_parameter("blend_t", 1.0)
	else:
		_stage_mat.set_shader_parameter("tex_prev", prev_tex)
		_stage_mat.set_shader_parameter("tex_curr", next_tex)
		_blend_t = 0.0
		_stage_mat.set_shader_parameter("blend_t", 0.0)


func set_mood(mood_name: String, instant: bool = false) -> void:
	current_mood = mood_name.to_upper()
	match current_mood:
		"TITLE":
			_tgt_vignette = 0.34
			_tgt_darken = 0.06
			_tgt_gold_spot = 0.20
			_tgt_tint = Color(1.0, 0.96, 0.88, 0.0)
		"CAMPAIGN_HUB", "CATEGORIES", "GLOBE":
			_tgt_vignette = 0.48
			_tgt_darken = 0.18
			_tgt_gold_spot = 0.16
			_tgt_tint = Color(0.95, 0.94, 1.0, 0.0)
		"INTERVIEW":
			_tgt_vignette = 0.44
			_tgt_darken = 0.12
			_tgt_gold_spot = 0.18
			_tgt_tint = Color(1.0, 0.95, 0.86, 0.02)
		"PLAYING":
			_tgt_vignette = 0.54
			_tgt_darken = 0.24
			_tgt_gold_spot = 0.16
			_tgt_tint = Color(0.96, 0.97, 1.0, 0.0)
		"DOUBLE_DOWN":
			_tgt_vignette = 0.66
			_tgt_darken = 0.22
			_tgt_gold_spot = 0.85
			_tgt_tint = Color(1.0, 0.84, 0.44, 0.14)
		"SUSPENSE":
			_tgt_vignette = 0.78
			_tgt_darken = 0.42
			_tgt_gold_spot = 0.42
			_tgt_tint = Color(0.75, 0.85, 1.0, 0.06)
		"WIN":
			_tgt_vignette = 0.44
			_tgt_darken = 0.14
			_tgt_gold_spot = 0.48
			_tgt_tint = Color(0.28, 0.92, 0.64, 0.18)
			_flash_decay = 1.0
		"WRONG":
			_tgt_vignette = 0.64
			_tgt_darken = 0.28
			_tgt_gold_spot = 0.06
			_tgt_tint = Color(0.95, 0.24, 0.30, 0.22)
			_flash_decay = 1.0
		_:
			_tgt_vignette = 0.46
			_tgt_darken = 0.18
			_tgt_gold_spot = 0.16
			_tgt_tint = Color(1.0, 0.98, 0.94, 0.0)

	if instant:
		_cur_vignette = _tgt_vignette
		_cur_darken = _tgt_darken
		_cur_gold_spot = _tgt_gold_spot
		_cur_tint = _tgt_tint


func set_pointer_parallax(norm_pos: Vector2) -> void:
	_pointer_target = Vector2(clampf(norm_pos.x, -1.0, 1.0), clampf(norm_pos.y, -1.0, 1.0))


func _process(delta: float) -> void:
	_time_acc += delta
	if _blend_t < 1.0:
		_blend_t = minf(1.0, _blend_t + delta * 2.4)

	_pointer_smooth = _pointer_smooth.lerp(_pointer_target, clampf(delta * 4.5, 0.0, 1.0))

	if _flash_decay > 0.0:
		_flash_decay = maxf(0.0, _flash_decay - delta * 0.75)

	var spd: float = clampf(delta * 5.2, 0.0, 1.0)
	_cur_vignette = lerpf(_cur_vignette, _tgt_vignette, spd)
	_cur_darken = lerpf(_cur_darken, _tgt_darken, spd)
	_cur_gold_spot = lerpf(_cur_gold_spot, _tgt_gold_spot, spd)
	var effective_tint: Color = _tgt_tint
	if current_mood in ["WIN", "WRONG"]:
		effective_tint.a = _tgt_tint.a * (0.45 + 0.55 * _flash_decay)
	_cur_tint = _cur_tint.lerp(effective_tint, spd)

	if _stage_mat != null:
		var vp: Vector2 = get_viewport().get_visible_rect().size
		_stage_mat.set_shader_parameter("view_aspect", vp.x / maxf(1.0, vp.y))
		_stage_mat.set_shader_parameter("time_sec", _time_acc)
		_stage_mat.set_shader_parameter("blend_t", _blend_t)
		_stage_mat.set_shader_parameter("parallax", _pointer_smooth)
		_stage_mat.set_shader_parameter("vignette_strength", _cur_vignette)
		_stage_mat.set_shader_parameter("darken_focus", _cur_darken)
		_stage_mat.set_shader_parameter("spotlight_gold", _cur_gold_spot)
		_stage_mat.set_shader_parameter("mood_tint", _cur_tint)


func audit_stage() -> Dictionary:
	var loaded_venues: int = 0
	for key: String in VENUE_IMAGE_PATHS.keys():
		if ResourceLoader.exists(str(VENUE_IMAGE_PATHS[key])):
			loaded_venues += 1
	return {
		"venues_total": VENUE_IMAGE_PATHS.size(),
		"venues_ready": loaded_venues,
		"studio_hdri_loaded": _loaded_hdri_ok,
	}
