class_name VFXJuiceDirector
extends Node
## AAA UI VFX, Live City Atmosphere & Tactile Juice Director for World's Smartest (Godot 4.7.2).
## 100% gl_compatibility (WebGL2 Single-Threaded + Android + Desktop) & Headless Safe, Zero Exit Leaks.
##
## Public API:
##   - play_correct_burst(pos: Vector2, streak: int = 1) -> void
##   - play_wrong_pulse() -> void
##   - play_bullseye_celebration(pos: Vector2 = Vector2.ZERO) -> void
##   - set_city_weather(city_id: String, instant: bool = false) -> void
##   - create_shimmer_material(hover_boost: float = 0.0, speed: float = 0.62, interval: float = 3.8) -> ShaderMaterial
##   - trigger_shimmer_sweep(mat: ShaderMaterial, duration: float = 0.65) -> void
##   - bind_shake_target(target: Node) -> void

const WEATHER_SHADER_PATH: String = "res://shaders/city_atmosphere.gdshader"
const SHOCKWAVE_SHADER_PATH: String = "res://shaders/radial_shockwave.gdshader"
const SHEEN_SHADER_PATH: String = "res://shaders/gold_foil_sheen.gdshader"
const SPARK_TEXTURE_PATH: String = "res://assets/ui/spark_glow.png"

const MAX_SHOCKWAVES: int = 3
const MAX_PARTICLES: int = 240

# City Weather Presets -> city_atmosphere.gdshader parameters
const CITY_WEATHER_PRESETS: Dictionary = {
	"ch": {
		"mode": 0, "intensity": 0.92,
		"primary": Color(0.88, 0.95, 1.0, 1.0),
		"secondary": Color(0.42, 0.68, 0.98, 1.0),
	},
	"gb": {
		"mode": 1, "intensity": 0.88,
		"primary": Color(0.96, 0.80, 0.48, 1.0),
		"secondary": Color(0.46, 0.68, 0.95, 1.0),
	},
	"jp": {
		"mode": 1, "intensity": 0.98,
		"primary": Color(0.32, 0.92, 1.0, 1.0),
		"secondary": Color(1.0, 0.34, 0.68, 1.0),
	},
	"sg": {
		"mode": 1, "intensity": 0.92,
		"primary": Color(0.30, 0.94, 0.70, 1.0),
		"secondary": Color(0.98, 0.84, 0.48, 1.0),
	},
	"eg": {
		"mode": 2, "intensity": 0.95,
		"primary": Color(1.0, 0.84, 0.44, 1.0),
		"secondary": Color(0.98, 0.62, 0.24, 1.0),
	},
	"br": {
		"mode": 2, "intensity": 0.90,
		"primary": Color(1.0, 0.88, 0.50, 1.0),
		"secondary": Color(0.34, 0.90, 0.62, 1.0),
	},
	"is": {
		"mode": 3, "intensity": 1.00,
		"primary": Color(0.16, 0.96, 0.72, 1.0),
		"secondary": Color(0.28, 0.78, 1.0, 1.0),
	},
	"global": {
		"mode": 4, "intensity": 1.00,
		"primary": Color(1.0, 0.88, 0.54, 1.0),
		"secondary": Color(0.72, 0.52, 1.0, 1.0),
	},
	"studio": {
		"mode": 2, "intensity": 0.36,
		"primary": Color(0.98, 0.86, 0.54, 1.0),
		"secondary": Color(0.76, 0.64, 0.36, 1.0),
	},
	"ledger": {
		"mode": 2, "intensity": 0.34,
		"primary": Color(0.96, 0.82, 0.48, 1.0),
		"secondary": Color(0.58, 0.72, 0.94, 1.0),
	},
}

var current_city_id: String = "ch"
var weather_intensity_scale: float = 1.0

# Cached Shaders & Smooth Radial Particle Sprite
var _weather_shader: Shader = null
var _shockwave_shader: Shader = null
var _sheen_shader: Shader = null
var _spark_tex: Texture2D = null

# Weather Overlay Layer (sits at layer -7: right above 2.5D stage -10, cleanly under 3D Hero -5 & HUD 10)
var _weather_layer: CanvasLayer = null
var _weather_rect: ColorRect = null
var _weather_mat: ShaderMaterial = null
var _weather_cur_intensity: float = 0.0
var _weather_tgt_intensity: float = 0.92
var _weather_lightning_boost: float = 0.0
var _weather_tween: Tween = null

# VFX Burst / Vignette / Particle Overlay Layer (sits at layer 25: above HUD 10, zero input blocking)
var _vfx_layer: CanvasLayer = null
var _vignette_rect: ColorRect = null
var _vignette_mat: ShaderMaterial = null
var _vignette_strength: float = 0.0
var _vignette_decay_rate: float = 2.4
var _vignette_color: Color = Color(0.30, 0.94, 0.66, 1.0)

var _shockwaves: Array[Dictionary] = []
var _next_shockwave_idx: int = 0
var _particle_canvas: _SmoothParticleCanvas = null

# Micro-Camera-Punch / Tactile Shake State
var _shake_target: Node = null
var _shake_base_offset: Vector2 = Vector2.ZERO
var _shake_has_base: bool = false
var _shake_amp: float = 0.0
var _shake_decay: float = 9.0
var _shake_phase: float = 0.0
var _shake_horizontal_bias: float = 1.0
var _shake_vertical_punch: float = 0.0
var _time_acc: float = 0.0

# Telemetry for Automated Smoke Tests
var _burst_count: int = 0
var _wrong_count: int = 0
var _bullseye_count: int = 0
var _shimmer_mats_created: int = 0
var _initialized: bool = false


# ==============================================================================
# INNER CLASS: ZERO-ALLOCATION POOLED SMOOTH RADIAL PARTICLE CANVAS
# ==============================================================================
class _SmoothParticleCanvas extends Control:
	var spark_tex: Texture2D = null
	var particles: Array[Dictionary] = []
	var max_particles: int = 240

	func _ready() -> void:
		set_anchors_preset(Control.PRESET_FULL_RECT)
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		var add_mat: CanvasItemMaterial = CanvasItemMaterial.new()
		add_mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = add_mat

	func clear_all() -> void:
		particles.clear()
		queue_redraw()

	func spawn_particle(
		pos: Vector2,
		vel: Vector2,
		col: Color,
		size_px: float,
		life: float,
		gravity: float = 220.0,
		drag: float = 2.4,
		twinkle_spd: float = 9.0
	) -> void:
		if particles.size() >= max_particles:
			particles.pop_front()
		particles.append({
			"pos": pos,
			"vel": vel,
			"col": col,
			"size": size_px,
			"age": 0.0,
			"life": maxf(life, 0.12),
			"grav": gravity,
			"drag": drag,
			"twinkle": twinkle_spd,
			"phase": randf() * TAU,
		})

	func step(delta: float) -> void:
		if particles.is_empty():
			return
		var i: int = particles.size() - 1
		while i >= 0:
			var p: Dictionary = particles[i]
			p["age"] = float(p["age"]) + delta
			if float(p["age"]) >= float(p["life"]):
				particles.remove_at(i)
			else:
				var vel: Vector2 = p["vel"]
				var drag_f: float = maxf(0.0, 1.0 - float(p["drag"]) * delta)
				vel *= drag_f
				vel.y += float(p["grav"]) * delta
				p["vel"] = vel
				p["pos"] = (p["pos"] as Vector2) + vel * delta
			i -= 1
		queue_redraw()

	func _draw() -> void:
		if particles.is_empty() or spark_tex == null:
			return
		for p: Dictionary in particles:
			var t: float = clampf(float(p["age"]) / float(p["life"]), 0.0, 1.0)
			var fade_in: float = clampf(t / 0.10, 0.0, 1.0)
			var fade_out: float = pow(1.0 - t, 1.55)
			var tw: float = 0.76 + 0.24 * sin(float(p["age"]) * float(p["twinkle"]) + float(p["phase"]))
			var alpha: float = fade_in * fade_out * tw
			if alpha <= 0.008:
				continue
			var sz: float = float(p["size"]) * (0.65 + 0.55 * sin(minf(t * 2.2, 1.0) * PI * 0.5)) * (1.0 - t * 0.35)
			var pos: Vector2 = p["pos"]
			var col: Color = p["col"]
			col.a *= alpha
			var half: Vector2 = Vector2(sz * 0.5, sz * 0.5)
			draw_texture_rect(spark_tex, Rect2(pos - half, Vector2(sz, sz)), false, col)


# ==============================================================================
# LIFECYCLE & RESOURCE LOADING
# ==============================================================================

func _ready() -> void:
	_ensure_initialized()


func _ensure_initialized() -> void:
	if _initialized:
		return
	_initialized = true
	_load_resources()
	_build_weather_layer()
	_build_vfx_layer()
	set_city_weather(current_city_id, true)


func _exit_tree() -> void:
	if _weather_tween != null and _weather_tween.is_valid():
		_weather_tween.kill()
	_weather_tween = null
	_restore_shake_target()
	_shake_target = null
	if _particle_canvas != null:
		_particle_canvas.clear_all()
	_shockwaves.clear()
	_weather_mat = null
	_vignette_mat = null
	_weather_shader = null
	_shockwave_shader = null
	_sheen_shader = null
	_spark_tex = null
	_initialized = false


func _load_resources() -> void:
	if ResourceLoader.exists(WEATHER_SHADER_PATH):
		_weather_shader = load(WEATHER_SHADER_PATH) as Shader
	if ResourceLoader.exists(SHOCKWAVE_SHADER_PATH):
		_shockwave_shader = load(SHOCKWAVE_SHADER_PATH) as Shader
	if ResourceLoader.exists(SHEEN_SHADER_PATH):
		_sheen_shader = load(SHEEN_SHADER_PATH) as Shader

	if ResourceLoader.exists(SPARK_TEXTURE_PATH):
		_spark_tex = load(SPARK_TEXTURE_PATH) as Texture2D
	if _spark_tex == null:
		_spark_tex = _build_procedural_radial_spark_texture(64)


func _build_procedural_radial_spark_texture(size: int) -> ImageTexture:
	## Guaranteed smooth analytical circular glow fallback -> ZERO square particle pixels even if PNG missing!
	var img: Image = Image.create(size, size, false, Image.FORMAT_RGBA8)
	var half: float = float(size - 1) * 0.5
	for y: int in range(size):
		var dy: float = (float(y) - half) / maxf(half, 1.0)
		for x: int in range(size):
			var dx: float = (float(x) - half) / maxf(half, 1.0)
			var r: float = sqrt(dx * dx + dy * dy)
			var edge_kill: float = clampf((0.96 - r) / 0.34, 0.0, 1.0)
			var core: float = exp(-r * r * 12.0) + exp(-r * r * 3.6) * 0.55
			var a: float = clampf(core * edge_kill, 0.0, 1.0)
			img.set_pixel(x, y, Color(1.0, 1.0, 1.0, a))
	return ImageTexture.create_from_image(img)


func _build_weather_layer() -> void:
	_weather_layer = CanvasLayer.new()
	_weather_layer.name = "VFXCityWeatherLayer"
	_weather_layer.layer = -7
	add_child(_weather_layer)

	_weather_rect = ColorRect.new()
	_weather_rect.name = "CityAtmosphereQuad"
	_weather_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_weather_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_weather_rect.color = Color(1.0, 1.0, 1.0, 1.0)
	_weather_layer.add_child(_weather_rect)

	if _weather_shader != null:
		_weather_mat = ShaderMaterial.new()
		_weather_mat.shader = _weather_shader
		_weather_mat.set_shader_parameter("weather_mode", 0)
		_weather_mat.set_shader_parameter("intensity", 0.90)
		_weather_mat.set_shader_parameter("view_aspect", _get_viewport_aspect())
		_weather_rect.material = _weather_mat


func _build_vfx_layer() -> void:
	_vfx_layer = CanvasLayer.new()
	_vfx_layer.name = "VFXJuiceOverlayLayer"
	_vfx_layer.layer = 25
	add_child(_vfx_layer)

	# 1. Smooth radial screen-edge vignette pulse (never dims center question text!)
	_vignette_rect = ColorRect.new()
	_vignette_rect.name = "VFXEdgeVignettePulse"
	_vignette_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_vignette_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_vignette_rect.visible = false
	_vfx_layer.add_child(_vignette_rect)

	var vig_shader: Shader = Shader.new()
	vig_shader.code = """
shader_type canvas_item;
render_mode blend_add;
uniform vec4 pulse_color : source_color = vec4(0.30, 0.94, 0.66, 1.0);
uniform float pulse_strength : hint_range(0.0, 1.5) = 0.0;
void fragment() {
	vec2 d = (UV - vec2(0.5)) * vec2(1.18, 1.12);
	float dist = length(d);
	float rim = smoothstep(0.36, 0.88, dist);
	float a = rim * rim * clamp(pulse_strength, 0.0, 1.5);
	COLOR = vec4(pulse_color.rgb * a, clamp(a, 0.0, 1.0));
}
"""
	_vignette_mat = ShaderMaterial.new()
	_vignette_mat.shader = vig_shader
	_vignette_mat.set_shader_parameter("pulse_strength", 0.0)
	_vignette_rect.material = _vignette_mat

	# 2. Pooled GPU Radial Shockwave Quads (up to 3 simultaneous overlapping rings!)
	_shockwaves.clear()
	for i: int in range(MAX_SHOCKWAVES):
		var rect: ColorRect = ColorRect.new()
		rect.name = "VFXShockwaveQuad_%d" % i
		rect.set_anchors_preset(Control.PRESET_FULL_RECT)
		rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		rect.visible = false
		var sm: ShaderMaterial = null
		if _shockwave_shader != null:
			sm = ShaderMaterial.new()
			sm.shader = _shockwave_shader
			sm.set_shader_parameter("progress", 0.0)
			sm.set_shader_parameter("strength", 0.0)
			rect.material = sm
		_vfx_layer.add_child(rect)
		_shockwaves.append({
			"rect": rect,
			"mat": sm,
			"active": false,
			"delay": 0.0,
			"age": 0.0,
			"duration": 0.62,
			"strength": 1.0,
		})

	# 3. Smooth Additive Radial Particle Canvas
	_particle_canvas = _SmoothParticleCanvas.new()
	_particle_canvas.name = "VFXSmoothParticles"
	_particle_canvas.spark_tex = _spark_tex
	_particle_canvas.max_particles = MAX_PARTICLES
	_vfx_layer.add_child(_particle_canvas)


# ==============================================================================
# PUBLIC API
# ==============================================================================

func set_city_weather(city_id: String, instant: bool = false) -> void:
	_ensure_initialized()
	var key: String = city_id.to_lower().strip_edges()
	if not CITY_WEATHER_PRESETS.has(key):
		key = "ch"
	current_city_id = key
	var preset: Dictionary = CITY_WEATHER_PRESETS[key]
	var mode: int = int(preset.get("mode", 0))
	var tgt_int: float = float(preset.get("intensity", 0.90)) * weather_intensity_scale
	var col_p: Color = preset.get("primary", Color.WHITE)
	var col_s: Color = preset.get("secondary", Color.WHITE)
	_weather_tgt_intensity = tgt_int

	if _weather_mat == null:
		return

	if _weather_tween != null and _weather_tween.is_valid():
		_weather_tween.kill()
		_weather_tween = null

	if instant or not is_inside_tree():
		_apply_weather_uniforms(mode, col_p, col_s, tgt_int)
		return

	_weather_tween = create_tween()
	_weather_tween.tween_method(_set_weather_shader_intensity, _weather_cur_intensity, 0.0, 0.24)
	_weather_tween.tween_callback(func() -> void:
		if _weather_mat != null:
			_weather_mat.set_shader_parameter("weather_mode", mode)
			_weather_mat.set_shader_parameter("tint_primary", col_p)
			_weather_mat.set_shader_parameter("tint_secondary", col_s)
	)
	_weather_tween.tween_method(_set_weather_shader_intensity, 0.0, tgt_int, 0.42)


func set_weather_visible(enabled: bool) -> void:
	_ensure_initialized()
	if _weather_layer != null:
		_weather_layer.visible = enabled


func set_weather_intensity(mult: float) -> void:
	_ensure_initialized()
	weather_intensity_scale = clampf(mult, 0.0, 1.5)
	var preset: Dictionary = CITY_WEATHER_PRESETS.get(current_city_id, CITY_WEATHER_PRESETS["ch"])
	_weather_tgt_intensity = float(preset.get("intensity", 0.90)) * weather_intensity_scale
	_set_weather_shader_intensity(_weather_tgt_intensity)


func trigger_apex_lightning(strength: float = 1.0) -> void:
	_weather_lightning_boost = maxf(_weather_lightning_boost, clampf(strength, 0.0, 1.4))


func bind_shake_target(target: Node) -> void:
	_restore_shake_target()
	_shake_target = target
	_shake_has_base = false
	if target is CanvasLayer:
		_shake_base_offset = (target as CanvasLayer).offset
		_shake_has_base = true
	elif target is Control:
		_shake_base_offset = (target as Control).position
		_shake_has_base = true


func create_shimmer_material(hover_boost: float = 0.0, speed: float = 0.62, interval: float = 3.8) -> ShaderMaterial:
	## Returns a reusable 24K metallic gold-foil sheen ShaderMaterial ready for CTAs, Answer Cards & Badges!
	if _sheen_shader == null and ResourceLoader.exists(SHEEN_SHADER_PATH):
		_sheen_shader = load(SHEEN_SHADER_PATH) as Shader
	var sm: ShaderMaterial = ShaderMaterial.new()
	if _sheen_shader != null:
		sm.shader = _sheen_shader
		sm.set_shader_parameter("hover_boost", clampf(hover_boost, 0.0, 1.0))
		sm.set_shader_parameter("sheen_speed", maxf(speed, 0.1))
		sm.set_shader_parameter("sheen_interval", maxf(interval, 1.2))
		sm.set_shader_parameter("manual_sweep_t", -1.0)
	_shimmer_mats_created += 1
	return sm


func trigger_shimmer_sweep(mat: ShaderMaterial, duration: float = 0.65) -> void:
	## Fires a crisp one-shot metallic specular sweep across a button/card on hover or tap!
	if mat == null or not is_inside_tree():
		return
	var tw: Tween = create_tween()
	tw.tween_method(func(v: float) -> void:
		if is_instance_valid(mat):
			mat.set_shader_parameter("manual_sweep_t", v)
	, 0.0, 1.0, maxf(duration, 0.18))
	tw.tween_callback(func() -> void:
		if is_instance_valid(mat):
			mat.set_shader_parameter("manual_sweep_t", -1.0)
	)


func play_correct_burst(pos: Vector2, streak: int = 1) -> void:
	_ensure_initialized()
	_burst_count += 1
	var vp_size: Vector2 = _get_viewport_size()
	var origin: Vector2 = pos if pos.length_squared() > 1.0 else vp_size * 0.5
	var st: int = maxi(streak, 1)

	# Streak-scaled visual intensity tiers: x1 -> x2 -> x3..4 -> x5+ Championship Overdrive!
	var tier_scale: float = 1.0
	var particle_count: int = 28
	var vig_str: float = 0.44
	var punch_px: float = 3.5
	var core_col: Color = Color(1.0, 0.94, 0.64, 1.0)
	var rim_col: Color = Color(0.28, 0.94, 0.64, 1.0)

	if st == 2:
		tier_scale = 1.22
		particle_count = 46
		vig_str = 0.56
		punch_px = 5.5
		rim_col = Color(0.38, 0.96, 0.68, 1.0)
	elif st == 3 or st == 4:
		tier_scale = 1.44
		particle_count = 72
		vig_str = 0.68
		punch_px = 7.5
		core_col = Color(1.0, 0.92, 0.52, 1.0)
		rim_col = Color(0.95, 0.80, 0.36, 1.0)
	elif st >= 5:
		tier_scale = 1.70
		particle_count = 104
		vig_str = 0.82
		punch_px = 9.5
		core_col = Color(1.0, 0.98, 0.82, 1.0)
		rim_col = Color(1.0, 0.82, 0.30, 1.0)

	# 1. Primary GPU Shockwave Burst at exact tapped card position (jewel-toned, crisp, never blinding!)
	_spawn_shockwave(
		origin,
		core_col,
		rim_col,
		0.56 + 0.05 * minf(float(st), 5.0),
		0.56 * minf(tier_scale, 1.28),
		0.38 * minf(tier_scale, 1.45),
		0.54 + 0.06 * minf(float(st), 4.0),
		0.0
	)

	# Secondary golden harmonic shockwave on Streak x3+!
	if st >= 3:
		_spawn_shockwave(
			origin,
			Color(1.0, 0.96, 0.78, 1.0),
			Color(0.30, 0.96, 0.68, 1.0),
			0.72,
			0.74,
			0.48,
			0.58,
			0.11
		)

	# 2. Smooth Radial-Glow Spark Fountain (ZERO square pixels!)
	var palette: Array[Color] = [
		Color(0.32, 0.96, 0.68, 0.98),
		Color(1.0, 0.90, 0.52, 0.98),
		Color(1.0, 0.98, 0.86, 0.96),
	]
	if st >= 3:
		palette.append(Color(1.0, 0.78, 0.24, 1.0))
		palette.append(Color(0.56, 1.0, 0.82, 0.95))

	if _particle_canvas != null:
		for i: int in range(particle_count):
			var ang: float = randf() * TAU
			var spd: float = randf_range(130.0, 560.0) * (0.85 + 0.20 * minf(float(st), 5.0))
			var vel: Vector2 = Vector2(cos(ang) * spd, sin(ang) * spd - randf_range(40.0, 180.0))
			var jitter: Vector2 = Vector2(randf_range(-32.0, 32.0), randf_range(-16.0, 16.0))
			var col: Color = palette[i % palette.size()]
			var sz: float = randf_range(20.0, 52.0) * (0.95 + 0.10 * minf(float(st), 4.0))
			var life: float = randf_range(0.48, 1.05)
			_particle_canvas.spawn_particle(origin + jitter, vel, col, sz, life, 260.0, 2.35, randf_range(7.0, 14.0))

	# 3. Smooth Emerald-Gold Screen-Edge Vignette Flash + Upward Micro-Camera-Punch
	_trigger_vignette(rim_col.lerp(core_col, 0.35), vig_str, 2.3)
	_trigger_shake(punch_px, 11.5, 0.35, -punch_px * 0.65)


func play_wrong_pulse() -> void:
	_ensure_initialized()
	_wrong_count += 1
	var vp_size: Vector2 = _get_viewport_size()

	# 1. Dramatic Crimson-Bronze Theater-Edge Vignette Flash
	_trigger_vignette(Color(1.0, 0.22, 0.32, 1.0), 0.78, 2.1)

	# 2. Tactile Horizontal Damped Micro-Shake
	_trigger_shake(10.5, 11.0, 1.0, 0.0)

	# 3. Subtle Falling Dark Crimson-Bronze Embers across upper-center
	if _particle_canvas != null:
		for i: int in range(16):
			var px: float = vp_size.x * randf_range(0.16, 0.84)
			var py: float = vp_size.y * randf_range(0.18, 0.44)
			var vel: Vector2 = Vector2(randf_range(-90.0, 90.0), randf_range(40.0, 190.0))
			var col: Color = Color(1.0, 0.34, 0.42, 0.85) if (i % 2 == 0) else Color(0.86, 0.46, 0.28, 0.78)
			_particle_canvas.spawn_particle(Vector2(px, py), vel, col, randf_range(16.0, 34.0), randf_range(0.45, 0.85), 320.0, 1.6, 6.0)


func play_bullseye_celebration(pos: Vector2 = Vector2.ZERO) -> void:
	_ensure_initialized()
	_bullseye_count += 1
	var vp_size: Vector2 = _get_viewport_size()
	var origin: Vector2 = pos if pos.length_squared() > 1.0 else Vector2(vp_size.x * 0.5, vp_size.y * 0.46)

	# 1. Triple-Stage Staggered 24K Gold, Diamond & Emerald GPU Shockwave Explosion!
	_spawn_shockwave(origin, Color(1.0, 0.98, 0.86, 1.0), Color(1.0, 0.82, 0.30, 1.0), 0.72, 0.82, 0.68, 0.72, 0.0)
	_spawn_shockwave(origin, Color(1.0, 0.92, 0.54, 1.0), Color(0.30, 0.96, 0.68, 1.0), 0.84, 0.94, 0.56, 0.64, 0.14)
	_spawn_shockwave(origin, Color(1.0, 0.96, 0.80, 1.0), Color(1.0, 0.76, 0.24, 1.0), 0.96, 1.06, 0.44, 0.54, 0.28)

	# 2. Grand 140-Spark Radial Crown Burst + Dual Lower-Corner Golden Side Cannons!
	var gold_palette: Array[Color] = [
		Color(1.0, 0.98, 0.86, 1.0),
		Color(1.0, 0.86, 0.38, 1.0),
		Color(0.98, 0.72, 0.20, 0.98),
		Color(0.34, 0.96, 0.70, 0.96),
	]
	if _particle_canvas != null:
		# Central radiant supernova shower
		for i: int in range(88):
			var ang: float = randf() * TAU
			var spd: float = randf_range(180.0, 820.0)
			var vel: Vector2 = Vector2(cos(ang) * spd, sin(ang) * spd - randf_range(80.0, 260.0))
			var col: Color = gold_palette[i % gold_palette.size()]
			var sz: float = randf_range(24.0, 64.0)
			_particle_canvas.spawn_particle(origin, vel, col, sz, randf_range(0.68, 1.45), 310.0, 1.95, randf_range(8.0, 16.0))

		# Dual celebratory broadcast side-cannons arcing upward from lower left & right!
		for side: int in [-1, 1]:
			var cannon_pos: Vector2 = Vector2(vp_size.x * (0.08 if side < 0 else 0.92), vp_size.y * 0.88)
			for j: int in range(28):
				var vx: float = float(-side) * randf_range(220.0, 640.0)
				var vy: float = -randf_range(580.0, 1180.0)
				var col: Color = gold_palette[(j + (0 if side < 0 else 1)) % gold_palette.size()]
				var sz: float = randf_range(22.0, 56.0)
				_particle_canvas.spawn_particle(cannon_pos, Vector2(vx, vy), col, sz, randf_range(0.85, 1.65), 480.0, 1.35, randf_range(9.0, 16.0))

	# 3. Championship Golden Vignette Glow + Upbeat Celebration Punch (+ Apex lightning flair!)
	_trigger_vignette(Color(1.0, 0.88, 0.44, 1.0), 0.92, 1.55)
	_trigger_shake(10.0, 9.5, 0.30, -10.0)
	if current_city_id == "global":
		trigger_apex_lightning(1.2)


func get_smoke_test_report() -> Dictionary:
	return {
		"weather_shader_ok": _weather_shader != null,
		"shockwave_shader_ok": _shockwave_shader != null,
		"sheen_shader_ok": _sheen_shader != null,
		"spark_texture_ok": _spark_tex != null,
		"current_city_id": current_city_id,
		"burst_count": _burst_count,
		"wrong_count": _wrong_count,
		"bullseye_count": _bullseye_count,
		"shimmer_mats_created": _shimmer_mats_created,
		"active_particles": _particle_canvas.particles.size() if _particle_canvas != null else 0,
	}


# ==============================================================================
# FRAME UPDATE & INTERNAL VFX HELPERS
# ==============================================================================

func _process(delta: float) -> void:
	var dt: float = minf(delta, 0.05)
	_time_acc += dt

	# 1. Live City Weather Aspect & Time Sync
	if _weather_mat != null:
		_weather_mat.set_shader_parameter("time_sec", _time_acc)
		_weather_mat.set_shader_parameter("view_aspect", _get_viewport_aspect())
		if _weather_lightning_boost > 0.001:
			_weather_lightning_boost = maxf(0.0, _weather_lightning_boost - dt * 3.4)
			_weather_mat.set_shader_parameter("lightning_boost", _weather_lightning_boost)

	# 2. Smooth Radial Vignette Decay
	if _vignette_strength > 0.002 and _vignette_mat != null and _vignette_rect != null:
		_vignette_strength = maxf(0.0, _vignette_strength - dt * _vignette_decay_rate * _vignette_strength - dt * 0.14)
		_vignette_mat.set_shader_parameter("pulse_strength", _vignette_strength)
		if _vignette_strength <= 0.002:
			_vignette_rect.visible = false

	# 3. GPU Radial Shockwave Pool Stepping
	var aspect: float = _get_viewport_aspect()
	for sw: Dictionary in _shockwaves:
		if not bool(sw["active"]):
			continue
		var delay: float = float(sw["delay"])
		if delay > 0.0:
			sw["delay"] = delay - dt
			continue
		var age: float = float(sw["age"]) + dt
		var dur: float = float(sw["duration"])
		sw["age"] = age
		var rect: ColorRect = sw["rect"]
		var sm: ShaderMaterial = sw["mat"]
		if age >= dur:
			sw["active"] = false
			if rect != null:
				rect.visible = false
			if sm != null:
				sm.set_shader_parameter("progress", 0.0)
				sm.set_shader_parameter("strength", 0.0)
		else:
			if rect != null and not rect.visible:
				rect.visible = true
			if sm != null:
				sm.set_shader_parameter("aspect_ratio", aspect)
				sm.set_shader_parameter("progress", clampf(age / maxf(dur, 0.01), 0.0, 1.0))
				sm.set_shader_parameter("strength", float(sw["strength"]))

	# 4. Smooth Radial Particle Pool Physics
	if _particle_canvas != null:
		_particle_canvas.step(dt)

	# 5. Damped Micro-Camera-Punch / Shake Recovery
	if _shake_amp > 0.08 or absf(_shake_vertical_punch) > 0.08:
		_shake_phase += dt * 44.0
		_shake_amp *= exp(-_shake_decay * dt)
		_shake_vertical_punch *= exp(-12.0 * dt)
		var ox: float = sin(_shake_phase) * _shake_amp * _shake_horizontal_bias
		var oy: float = cos(_shake_phase * 1.17) * _shake_amp * (1.0 - _shake_horizontal_bias * 0.55) + _shake_vertical_punch
		_apply_shake_offset(Vector2(ox, oy))
		if _shake_amp <= 0.08 and absf(_shake_vertical_punch) <= 0.08:
			_shake_amp = 0.0
			_shake_vertical_punch = 0.0
			_restore_shake_target()


func _apply_weather_uniforms(mode: int, primary: Color, secondary: Color, intensity_val: float) -> void:
	if _weather_mat == null:
		return
	_weather_mat.set_shader_parameter("weather_mode", mode)
	_weather_mat.set_shader_parameter("tint_primary", primary)
	_weather_mat.set_shader_parameter("tint_secondary", secondary)
	_set_weather_shader_intensity(intensity_val)


func _set_weather_shader_intensity(val: float) -> void:
	_weather_cur_intensity = clampf(val, 0.0, 1.5)
	if _weather_mat != null:
		_weather_mat.set_shader_parameter("intensity", _weather_cur_intensity)


func _spawn_shockwave(
	screen_pos: Vector2,
	core_col: Color,
	rim_col: Color,
	duration: float,
	max_rad: float,
	ray_int: float,
	strength: float,
	delay: float
) -> void:
	if _shockwaves.is_empty():
		return
	var sw: Dictionary = _shockwaves[_next_shockwave_idx % _shockwaves.size()]
	_next_shockwave_idx = (_next_shockwave_idx + 1) % _shockwaves.size()
	var vp: Vector2 = _get_viewport_size()
	var uv: Vector2 = Vector2(
		clampf(screen_pos.x / maxf(vp.x, 1.0), 0.02, 0.98),
		clampf(screen_pos.y / maxf(vp.y, 1.0), 0.02, 0.98)
	)
	var sm: ShaderMaterial = sw["mat"]
	var rect: ColorRect = sw["rect"]
	if sm != null:
		sm.set_shader_parameter("center_uv", uv)
		sm.set_shader_parameter("core_color", core_col)
		sm.set_shader_parameter("rim_color", rim_col)
		sm.set_shader_parameter("max_radius", max_rad)
		sm.set_shader_parameter("ray_intensity", ray_int)
		sm.set_shader_parameter("ring_thickness", 0.068)
		sm.set_shader_parameter("aspect_ratio", _get_viewport_aspect())
		sm.set_shader_parameter("progress", 0.002 if delay <= 0.0 else 0.0)
		sm.set_shader_parameter("strength", strength)
	if rect != null:
		rect.visible = (delay <= 0.0)
	sw["active"] = true
	sw["delay"] = maxf(delay, 0.0)
	sw["age"] = 0.0
	sw["duration"] = maxf(duration, 0.25)
	sw["strength"] = strength


func _trigger_vignette(col: Color, strength: float, decay_rate: float) -> void:
	_vignette_color = col
	_vignette_strength = maxf(_vignette_strength, clampf(strength, 0.0, 1.25))
	_vignette_decay_rate = maxf(decay_rate, 0.5)
	if _vignette_mat != null:
		_vignette_mat.set_shader_parameter("pulse_color", _vignette_color)
		_vignette_mat.set_shader_parameter("pulse_strength", _vignette_strength)
	if _vignette_rect != null:
		_vignette_rect.visible = true


func _trigger_shake(amp: float, decay: float, horiz_bias: float, vert_punch: float) -> void:
	_ensure_default_shake_target()
	_shake_amp = maxf(_shake_amp, amp)
	_shake_decay = decay
	_shake_horizontal_bias = clampf(horiz_bias, 0.0, 1.0)
	_shake_vertical_punch = vert_punch
	_shake_phase = 0.0


func _ensure_default_shake_target() -> void:
	if _shake_target != null and is_instance_valid(_shake_target):
		return
	var p: Node = get_parent()
	if p != null:
		var hud: Node = p.get_node_or_null("HUDLayer")
		if hud is CanvasLayer:
			bind_shake_target(hud)


func _apply_shake_offset(delta_off: Vector2) -> void:
	if _shake_target == null or not is_instance_valid(_shake_target) or not _shake_has_base:
		return
	if _shake_target is CanvasLayer:
		(_shake_target as CanvasLayer).offset = _shake_base_offset + delta_off
	elif _shake_target is Control:
		(_shake_target as Control).position = _shake_base_offset + delta_off


func _restore_shake_target() -> void:
	if _shake_target == null or not is_instance_valid(_shake_target) or not _shake_has_base:
		return
	if _shake_target is CanvasLayer:
		(_shake_target as CanvasLayer).offset = _shake_base_offset
	elif _shake_target is Control:
		(_shake_target as Control).position = _shake_base_offset


func _get_viewport_size() -> Vector2:
	var vp: Viewport = get_viewport()
	if vp != null:
		var sz: Vector2 = vp.get_visible_rect().size
		if sz.x > 1.0 and sz.y > 1.0:
			return sz
	return Vector2(1080.0, 1920.0)


func _get_viewport_aspect() -> float:
	var sz: Vector2 = _get_viewport_size()
	return maxf(sz.x / maxf(sz.y, 1.0), 0.25)
