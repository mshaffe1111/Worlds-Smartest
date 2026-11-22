class_name CinematicCameraRig
extends Camera3D
## Lean Studio Camera for the 3D Hero Showcase SubViewport (Title Veritas Orb, World Globe, Championship Trophy).
## Applies #96 Gate D vertical clearance polish across both 16:9 widescreen desktop and 9:16 mobile portrait!

const SHOT_TITLE_ORBIT: String = "CAM_TITLE_ORBIT"
const SHOT_GLOBE_MAP: String = "CAM_GLOBE_MAP"
const SHOT_TROPHY_HERO: String = "CAM_TROPHY_HERO"

var current_shot: String = SHOT_TITLE_ORBIT
var parallax_offset: Vector2 = Vector2.ZERO

var _current_pos: Vector3 = Vector3(0.0, 0.14, 2.42)
var _current_target: Vector3 = Vector3(0.0, 0.04, 0.0)
var _current_fov: float = 38.0
var _time_acc: float = 0.0
var _orbit_angle: float = 0.25


func _ready() -> void:
	near = 0.05
	far = 40.0
	snap_to_shot(SHOT_TITLE_ORBIT)


func set_shot(shot_name: String) -> void:
	current_shot = shot_name


func snap_to_shot(shot_name: String) -> void:
	current_shot = shot_name
	if shot_name == SHOT_GLOBE_MAP:
		_current_pos = Vector3(0.0, 0.14, 2.66)
		_current_target = Vector3(0.0, -0.14, 0.0)
		_current_fov = 38.0
	elif shot_name == SHOT_TROPHY_HERO:
		_current_pos = Vector3(0.0, 0.02, 2.70)
		_current_target = Vector3(0.0, -0.17, 0.0)
		_current_fov = 38.0
	else:
		_current_pos = Vector3(0.0, 0.16, 2.44)
		_current_target = Vector3(0.0, 0.045, 0.0)
		_current_fov = 38.0
	global_position = _current_pos
	look_at(_current_target, Vector3.UP)
	fov = _current_fov


func _process(delta: float) -> void:
	_time_acc += delta
	var vp_size: Vector2 = get_viewport().get_visible_rect().size
	var aspect: float = vp_size.x / maxf(1.0, vp_size.y)
	var portrait_factor: float = clampf((0.95 - aspect) / 0.42, 0.0, 1.0)

	var desired_pos: Vector3
	var desired_target: Vector3
	var desired_fov: float = 37.0 + portrait_factor * 7.5

	if current_shot == SHOT_GLOBE_MAP:
		# Nudge Globe cleanly upward on widescreen so bottom CTA clears the wooden tripod pedestal!
		desired_pos = Vector3(
			parallax_offset.x * 0.14,
			0.14 + portrait_factor * 0.12 + parallax_offset.y * 0.08,
			2.66 + portrait_factor * 0.56
		)
		desired_target = Vector3(0.0, -0.14 + portrait_factor * 0.06, 0.0)
	elif current_shot == SHOT_TROPHY_HERO:
		# Frame spinning 3D Championship Trophy proudly in the upper open frame with regal finial headroom!
		desired_pos = Vector3(
			parallax_offset.x * 0.12,
			0.02 + sin(_time_acc * 0.6) * 0.03,
			2.70 + portrait_factor * 0.42
		)
		desired_target = Vector3(0.0, lerpf(-0.17, -0.22, portrait_factor), 0.0)
	else:
		_orbit_angle += delta * 0.15
		var swing: float = sin(_orbit_angle) * 0.42
		var radius: float = 2.44 + portrait_factor * 0.12
		desired_pos = Vector3(
			sin(swing) * radius + parallax_offset.x * 0.12,
			0.16 + sin(_time_acc * 0.45) * 0.04 + parallax_offset.y * 0.06,
			cos(swing) * radius
		)
		# Shift desktop target slightly higher (+0.045) -> pushes Orb cleanly down below subtitle & above PLAY pill!
		desired_target = Vector3(0.0, lerpf(0.045, -0.02, portrait_factor), 0.0)

	var smooth: float = clampf(delta * 5.0, 0.0, 1.0)
	_current_pos = _current_pos.lerp(desired_pos, smooth)
	_current_target = _current_target.lerp(desired_target, smooth)
	_current_fov = lerpf(_current_fov, desired_fov, smooth)

	global_position = _current_pos
	if global_position.distance_squared_to(_current_target) > 0.001:
		look_at(_current_target, Vector3.UP)
	fov = clampf(_current_fov, 30.0, 56.0)
