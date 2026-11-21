class_name VeritasPrism
extends Node3D
## Interactive 3D Veritas Prism & Observatory Hero Relic controller.
## Dynamically instantiates real Blender 5.3.0 .glb assets (with graceful procedural fallback)
## and animates Core_Spindle, Crown_Top, Crown_Bottom, Shutter_0..3, and ClampJaw_0..3.

signal facet_changed(facet_index: int, facet_text: String)
signal peel_triggered(new_tier: int)
signal overclock_progress(charge: float, active: bool)
signal answer_locked(facet_index: int, facet_text: String, peel_tier: int, overclocked: bool, overclock_charge: float)
signal relic_changed(relic_id: String, relic_title: String, relic_origin: String)

const HERO_PRISM_GLB: String = "res://assets/models/veritas_prism_hero.glb"
const FACET_RADIUS: float = 1.24
const OVERCLOCK_THRESHOLD_SEC: float = 0.20
const OVERCLOCK_FULL_SEC: float = 1.15

const RELICS: Array[Dictionary] = [
	{"id": "meridian_astrolabe", "title": "Meridian Astrolabe", "origin": "Geneva · CH", "path": "res://assets/models/relic_meridian_astrolabe.glb", "color": Color("#e8c474")},
	{"id": "armillary_orrery", "title": "Armillary Orrery", "origin": "London · GB", "path": "res://assets/models/relic_armillary_orrery.glb", "color": Color("#d4a853")},
	{"id": "origami_prism", "title": "Kintsugi Origami Prism", "origin": "Tokyo · JP", "path": "res://assets/models/relic_origami_prism.glb", "color": Color("#f2c166")},
	{"id": "emerald_sphere", "title": "Sovereign Emerald Sphere", "origin": "Rio · BR", "path": "res://assets/models/relic_emerald_sphere.glb", "color": Color("#38c793")},
	{"id": "cipher_box", "title": "Meridian Cipher Box", "origin": "Cairo · EG", "path": "res://assets/models/relic_cipher_box.glb", "color": Color("#e2b35c")},
	{"id": "cryo_relay", "title": "Basalt Cryo-Relay", "origin": "Reykjavik · IS", "path": "res://assets/models/relic_cryo_relay.glb", "color": Color("#5ce1e6")},
	{"id": "council_seal", "title": "Tripartite Council Seal", "origin": "Singapore · SG", "path": "res://assets/models/relic_council_seal.glb", "color": Color("#e8c474")},
	{"id": "master_ledger", "title": "Master Ledger Tesseract", "origin": "Apex Forum · GLOBAL", "path": "res://assets/models/relic_master_ledger.glb", "color": Color("#f7df9c")},
]

const PRISM_SKINS: Dictionary = {
	"OBSIDIAN_BRASS": {"name": "Obsidian Brass", "core": Color("#f7df9c"), "accent": Color("#e8c474")},
	"KYOTO_KINTSUGI": {"name": "Kyoto Kintsugi", "core": Color("#ffcf6e"), "accent": Color("#e85d99")},
	"DAMASCUS_TITANIUM": {"name": "Damascus Titanium", "core": Color("#7ce8ff"), "accent": Color("#48b8f0")},
	"EMERALD_SOVEREIGN": {"name": "Emerald Sovereign", "core": Color("#6bf5b8"), "accent": Color("#38c793")},
	"BLACK_SALON_CRIMSON": {"name": "Black Salon Crimson", "core": Color("#ff5b6e"), "accent": Color("#e53e51")},
}

@onready var prism_assembly: Node3D = $PrismAssembly
@onready var model_pivot: Node3D = $PrismAssembly/ModelPivot
@onready var facet_ring: Node3D = $PrismAssembly/FacetRing
@onready var relic_stage: Node3D = $RelicStage
@onready var core_glow_light: OmniLight3D = $CoreGlowLight

var using_blender_glb: bool = false
var observatory_mode: bool = false
var interaction_locked: bool = false
var current_relic_index: int = 0
var current_skin_id: String = "OBSIDIAN_BRASS"

# Blender hierarchy bindings
var _core_spindle: Node3D = null
var _crown_top: Node3D = null
var _crown_bottom: Node3D = null
var _calibrator_bezel: Node3D = null
var _calibrator_needle: Node3D = null
var _facet_housing_template: Node3D = null
var _shutters: Array[Node3D] = []
var _shutter_rest_pos: Array[Vector3] = []
var _shutter_rest_rot: Array[Vector3] = []
var _shutter_out_dirs: Array[Vector3] = []
var _clamp_jaws: Array[Node3D] = []
var _jaw_rest_pos: Array[Vector3] = []
var _jaw_rest_rot: Array[Vector3] = []
var _jaw_in_dirs: Array[Vector3] = []
var _core_crystal_mat: StandardMaterial3D = null

# Facets state
var _facet_nodes: Array[Node3D] = []
var _facet_labels: Array[Label3D] = []
var _facet_panel_mats: Array[StandardMaterial3D] = []
var _facet_frame_mats: Array[StandardMaterial3D] = []
var _facet_data: Array[Dictionary] = []
var _facet_shattered: Array[bool] = [false, false, false, false]
var _facet_shatter_vel: Array[Vector3] = [Vector3.ZERO, Vector3.ZERO, Vector3.ZERO, Vector3.ZERO]
var _facet_shatter_spin: Array[Vector3] = [Vector3.ZERO, Vector3.ZERO, Vector3.ZERO, Vector3.ZERO]

# Rotation, Peel & Overclock physics
var _yaw: float = 0.0
var _angular_vel: float = 0.0
var _active_facet_index: int = 0
var _peel_tier: int = 1
var _shutter_open_anim: float = 0.0
var _jaw_clamp_anim: float = 0.0
var _overclock_holding: bool = false
var _overclock_hold_time: float = 0.0
var _overclock_charge: float = 0.0
var _overclock_pulse_timer: float = 0.0
var _time_acc: float = 0.0

# Touch / drag state
var _touch_active: bool = false
var _touch_index: int = -1
var _touch_start_pos: Vector2 = Vector2.ZERO
var _touch_last_pos: Vector2 = Vector2.ZERO
var _touch_total_drag: float = 0.0
var _touch_down_time: float = 0.0
var _touch_peeled_this_drag: bool = false
var _touch_started_overclock: bool = false

# Observatory relic orbit
var _relic_yaw: float = 0.0
var _relic_pitch: float = 0.12
var _relic_vel_yaw: float = 0.35
var _relic_vel_pitch: float = 0.0
var _relic_model_node: Node3D = null


func _ready() -> void:
	_load_hero_prism_model()
	_build_answer_facets()
	apply_prism_skin("OBSIDIAN_BRASS")


func _process(delta: float) -> void:
	_time_acc += delta

	if observatory_mode:
		_process_observatory(delta)
		return

	_process_prism_physics(delta)
	_process_overclock(delta)
	_animate_blender_nodes(delta)
	_animate_shattered_facets(delta)
	_update_facet_highlights(delta)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var touch: InputEventScreenTouch = event as InputEventScreenTouch
		if touch.pressed and not _touch_active:
			_touch_active = true
			_touch_index = touch.index
			_touch_start_pos = touch.position
			_touch_last_pos = touch.position
			_touch_total_drag = 0.0
			_touch_down_time = 0.0
			_touch_peeled_this_drag = false
			_touch_started_overclock = false
			_angular_vel = 0.0
		elif not touch.pressed and _touch_active and touch.index == _touch_index:
			_touch_active = false
			_touch_index = -1
			if _touch_started_overclock:
				_touch_started_overclock = false
				release_overclock()
	elif event is InputEventScreenDrag:
		var drag: InputEventScreenDrag = event as InputEventScreenDrag
		if _touch_active and drag.index == _touch_index:
			var delta_pos: Vector2 = drag.position - _touch_last_pos
			_touch_last_pos = drag.position
			_touch_total_drag += delta_pos.length()

			if observatory_mode:
				_relic_yaw += delta_pos.x * 0.010
				_relic_pitch = clampf(_relic_pitch + delta_pos.y * 0.008, -0.85, 0.85)
				_relic_vel_yaw = delta_pos.x * 0.16
				_relic_vel_pitch = delta_pos.y * 0.10
				return

			if interaction_locked or _touch_started_overclock:
				return

			# Horizontal drag spins the Veritas Prism with responsive torque
			_yaw += delta_pos.x * 0.0085
			_angular_vel = clampf(delta_pos.x * 0.22, -11.0, 11.0)

			# Downward swipe gesture (> 110px vertically, mostly downward) triggers Peel Crown!
			var total_vec: Vector2 = drag.position - _touch_start_pos
			if not _touch_peeled_this_drag and total_vec.y > 115.0 and absf(total_vec.y) > absf(total_vec.x) * 1.45:
				_touch_peeled_this_drag = true
				peel_crown()
	elif event is InputEventKey:
		var key: InputEventKey = event as InputEventKey
		if not key.pressed or key.echo:
			return
		if observatory_mode:
			if key.keycode == KEY_LEFT:
				cycle_relic(-1)
			elif key.keycode == KEY_RIGHT:
				cycle_relic(1)
			return
		if interaction_locked:
			return
		if key.keycode == KEY_LEFT:
			spin_by_steps(-1)
		elif key.keycode == KEY_RIGHT:
			spin_by_steps(1)
		elif key.keycode == KEY_P or key.keycode == KEY_DOWN:
			peel_crown()
		elif key.keycode == KEY_ENTER or key.keycode == KEY_SPACE:
			lock_current_facet(false, 0.0)


func load_question_facets(facets: Array[Dictionary], domain_accent: Color, archetype: String = "SIGHTLINE_LOCK") -> void:
	_facet_data = facets.duplicate(true)
	_peel_tier = 1
	_overclock_holding = false
	_overclock_hold_time = 0.0
	_overclock_charge = 0.0
	interaction_locked = false
	_angular_vel = 0.0
	_yaw = 0.0
	_active_facet_index = 0

	var show_calibrator: bool = (archetype == "CALIBRATOR_DIAL")
	if _calibrator_bezel != null:
		_calibrator_bezel.visible = show_calibrator
	if _calibrator_needle != null:
		_calibrator_needle.visible = show_calibrator

	for i: int in range(4):
		_facet_shattered[i] = false
		_facet_shatter_vel[i] = Vector3.ZERO
		_facet_shatter_spin[i] = Vector3.ZERO
		if i < _facet_nodes.size():
			var angle: float = float(i) * PI * 0.5
			var node: Node3D = _facet_nodes[i]
			node.visible = true
			node.position = Vector3(sin(angle) * FACET_RADIUS, 0.0, cos(angle) * FACET_RADIUS)
			node.rotation = Vector3(0.0, angle, 0.0)
			node.scale = Vector3.ONE
		if i < _facet_labels.size() and i < _facet_data.size():
			_facet_labels[i].text = str(_facet_data[i].get("text", "Option %d" % (i + 1)))
		if i < _facet_frame_mats.size():
			_facet_frame_mats[i].albedo_color = domain_accent.lerp(Color("#e8c474"), 0.55)

	core_glow_light.light_color = domain_accent.lerp(Color("#f7df9c"), 0.5)
	_emit_active_facet()


func spin_by_steps(step_delta: int) -> void:
	if interaction_locked or observatory_mode:
		return
	var next_idx: int = _find_next_active_facet(_active_facet_index, step_delta)
	var target_yaw: float = -float(next_idx) * PI * 0.5
	var diff: float = wrapf(target_yaw - _yaw, -PI, PI)
	_angular_vel = diff * 5.2
	_active_facet_index = next_idx
	AudioSynth.play_horological_click(1.0 + float(next_idx) * 0.06)
	_vibrate(10)
	_emit_active_facet()


func peel_crown() -> int:
	if interaction_locked or observatory_mode or _peel_tier >= 3:
		return _peel_tier
	_peel_tier += 1
	AudioSynth.play_peel_swoosh(_peel_tier)
	_vibrate(24)

	if _peel_tier == 3:
		_shatter_decoy_facets(2)
	elif _peel_tier == 2:
		_shatter_decoy_facets(1)

	peel_triggered.emit(_peel_tier)
	return _peel_tier


func begin_overclock() -> void:
	if interaction_locked or observatory_mode:
		return
	_overclock_holding = true
	_overclock_hold_time = 0.0
	_overclock_charge = 0.0
	_overclock_pulse_timer = 0.0
	overclock_progress.emit(0.0, true)


func release_overclock() -> void:
	if not _overclock_holding:
		return
	var was_overclocked: bool = _overclock_hold_time >= OVERCLOCK_THRESHOLD_SEC
	var final_charge: float = _overclock_charge if was_overclocked else 0.0
	_overclock_holding = false
	_overclock_hold_time = 0.0
	overclock_progress.emit(0.0, false)
	lock_current_facet(was_overclocked, final_charge)


func cancel_overclock() -> void:
	_overclock_holding = false
	_overclock_hold_time = 0.0
	_overclock_charge = 0.0
	overclock_progress.emit(0.0, false)


func lock_current_facet(overclocked: bool = false, charge: float = 0.0) -> void:
	if interaction_locked or observatory_mode:
		return
	if _active_facet_index < 0 or _active_facet_index >= _facet_data.size():
		return
	if _facet_shattered[_active_facet_index]:
		_active_facet_index = _find_next_active_facet(_active_facet_index, 1)

	interaction_locked = true
	_angular_vel = 0.0
	AudioSynth.play_lock_thunk(overclocked)
	_vibrate(45 if overclocked else 28)

	var facet_text: String = str(_facet_data[_active_facet_index].get("text", ""))
	answer_locked.emit(_active_facet_index, facet_text, _peel_tier, overclocked, charge)


func get_active_facet_dict() -> Dictionary:
	if _active_facet_index >= 0 and _active_facet_index < _facet_data.size():
		return _facet_data[_active_facet_index]
	return {}


func get_peel_tier() -> int:
	return _peel_tier


func set_observatory_mode(enabled: bool, relic_id: String = "") -> void:
	observatory_mode = enabled
	prism_assembly.visible = not enabled
	relic_stage.visible = enabled
	if enabled:
		cancel_overclock()
		if not relic_id.is_empty():
			for i: int in range(RELICS.size()):
				if str(RELICS[i]["id"]) == relic_id:
					current_relic_index = i
					break
		load_relic_by_index(current_relic_index)
	else:
		apply_prism_skin(current_skin_id)


func cycle_relic(delta_step: int) -> void:
	current_relic_index = posmod(current_relic_index + delta_step, RELICS.size())
	load_relic_by_index(current_relic_index)
	AudioSynth.play_brass_snap()
	_vibrate(14)


func load_relic_by_index(idx: int) -> void:
	current_relic_index = posmod(idx, RELICS.size())
	var info: Dictionary = RELICS[current_relic_index]

	for child: Node in relic_stage.get_children():
		child.queue_free()
	_relic_model_node = null

	var glb_path: String = str(info["path"])
	var root_node: Node3D = Node3D.new()
	root_node.name = "ActiveRelicRoot"
	relic_stage.add_child(root_node)

	if ResourceLoader.exists(glb_path):
		var packed: Resource = load(glb_path)
		if packed is PackedScene:
			var inst: Node = (packed as PackedScene).instantiate()
			if inst is Node3D:
				root_node.add_child(inst)
				_relic_model_node = root_node

	if _relic_model_node == null:
		var fallback: Node3D = _build_procedural_relic_fallback(info["color"] as Color, current_relic_index)
		root_node.add_child(fallback)
		_relic_model_node = root_node

	core_glow_light.light_color = info["color"] as Color
	core_glow_light.light_energy = 2.6
	_relic_vel_yaw = 0.55
	relic_changed.emit(str(info["id"]), str(info["title"]), str(info["origin"]))


func apply_prism_skin(skin_id: String) -> void:
	if not PRISM_SKINS.has(skin_id):
		return
	current_skin_id = skin_id
	var skin: Dictionary = PRISM_SKINS[skin_id]
	var core_col: Color = skin["core"] as Color
	core_glow_light.light_color = core_col
	if _core_crystal_mat != null:
		_core_crystal_mat.albedo_color = core_col
		_core_crystal_mat.emission = core_col


func cycle_prism_skin() -> String:
	var keys: Array = PRISM_SKINS.keys()
	var idx: int = keys.find(current_skin_id)
	var next_key: String = str(keys[posmod(idx + 1, keys.size())])
	apply_prism_skin(next_key)
	AudioSynth.play_brass_snap()
	_vibrate(14)
	return str(PRISM_SKINS[next_key]["name"])


func _process_prism_physics(delta: float) -> void:
	# Handle direct press-and-hold on the 3D viewport when stationary
	if _touch_active and not interaction_locked and not _touch_peeled_this_drag:
		_touch_down_time += delta
		if not _touch_started_overclock and _touch_down_time >= 0.34 and _touch_total_drag < 26.0:
			_touch_started_overclock = true
			begin_overclock()

	if not _touch_active:
		# Integrate inertia & smoothly snap magnetically toward nearest active facet
		_yaw += _angular_vel * delta
		_angular_vel = lerpf(_angular_vel, 0.0, minf(1.0, delta * 5.8))

		var nearest_idx: int = _compute_front_facet_index()
		if nearest_idx != _active_facet_index:
			_active_facet_index = nearest_idx
			AudioSynth.play_horological_click(1.0 + float(nearest_idx) * 0.05)
			_vibrate(8)
			_emit_active_facet()

		if absf(_angular_vel) < 1.25:
			var target_yaw: float = -float(_active_facet_index) * PI * 0.5
			var err: float = wrapf(target_yaw - _yaw, -PI, PI)
			if absf(err) > 0.002:
				_yaw += err * minf(1.0, delta * 9.5)
	else:
		var drag_front: int = _compute_front_facet_index()
		if drag_front != _active_facet_index:
			_active_facet_index = drag_front
			AudioSynth.play_horological_click(1.05 + float(drag_front) * 0.05)
			_vibrate(8)
			_emit_active_facet()

	# Subtle Sovereign levitation + micro-tremor during Overclock charge
	var float_y: float = sin(_time_acc * 1.45) * 0.045
	var tremor: Vector3 = Vector3.ZERO
	if _overclock_holding and _overclock_charge > 0.05:
		var amp: float = 0.018 * _overclock_charge
		tremor = Vector3(sin(_time_acc * 64.0) * amp, cos(_time_acc * 58.0) * amp * 0.6, sin(_time_acc * 71.0) * amp)

	prism_assembly.position = Vector3(0.0, float_y, 0.0) + tremor
	prism_assembly.rotation.y = _yaw


func _process_overclock(delta: float) -> void:
	if _overclock_holding and not interaction_locked:
		_overclock_hold_time += delta
		if _overclock_hold_time >= OVERCLOCK_THRESHOLD_SEC:
			var t: float = (_overclock_hold_time - OVERCLOCK_THRESHOLD_SEC) / maxf(0.1, OVERCLOCK_FULL_SEC - OVERCLOCK_THRESHOLD_SEC)
			_overclock_charge = clampf(t, 0.0, 1.0)
			_overclock_pulse_timer += delta
			if _overclock_pulse_timer >= 0.18:
				_overclock_pulse_timer = 0.0
				AudioSynth.play_overclock_pulse(_overclock_charge)
				_vibrate(14 + int(_overclock_charge * 12.0))
			overclock_progress.emit(_overclock_charge, true)
	else:
		_overclock_charge = lerpf(_overclock_charge, 0.0, minf(1.0, delta * 7.0))


func _animate_blender_nodes(delta: float) -> void:
	var target_open: float = 0.0 if _peel_tier <= 1 else (0.55 if _peel_tier == 2 else 1.0)
	_shutter_open_anim = lerpf(_shutter_open_anim, target_open, minf(1.0, delta * 6.5))

	var target_clamp: float = _overclock_charge if _overclock_holding else 0.0
	_jaw_clamp_anim = lerpf(_jaw_clamp_anim, target_clamp, minf(1.0, delta * 9.0))

	if _crown_top != null:
		_crown_top.rotation.y += delta * (0.28 + _shutter_open_anim * 0.55 + _jaw_clamp_anim * 1.4)
	if _crown_bottom != null:
		_crown_bottom.rotation.y -= delta * (0.24 + _shutter_open_anim * 0.45 + _jaw_clamp_anim * 1.2)
	if _core_spindle != null:
		_core_spindle.rotation.y += delta * (0.14 + _jaw_clamp_anim * 1.8)
	if _calibrator_needle != null:
		_calibrator_needle.rotation.z = sin(_time_acc * 1.9) * 0.35 + _jaw_clamp_anim * 1.1

	for i: int in range(_shutters.size()):
		var sh: Node3D = _shutters[i]
		var rest_p: Vector3 = _shutter_rest_pos[i]
		var rest_r: Vector3 = _shutter_rest_rot[i]
		var out_dir: Vector3 = _shutter_out_dirs[i]
		sh.position = rest_p + out_dir * (_shutter_open_anim * 0.34) + Vector3(0.0, _shutter_open_anim * 0.05, 0.0)
		sh.rotation = rest_r + Vector3(0.0, _shutter_open_anim * 0.16, 0.0)

	for i: int in range(_clamp_jaws.size()):
		var jaw: Node3D = _clamp_jaws[i]
		var rest_p: Vector3 = _jaw_rest_pos[i]
		var rest_r: Vector3 = _jaw_rest_rot[i]
		var in_dir: Vector3 = _jaw_in_dirs[i]
		jaw.position = rest_p + in_dir * (_jaw_clamp_anim * 0.17)
		jaw.rotation = rest_r + Vector3(0.0, -_jaw_clamp_anim * 0.06, 0.0)

	# Molten gold energy surge on CoreGlowLight
	var skin: Dictionary = PRISM_SKINS.get(current_skin_id, PRISM_SKINS["OBSIDIAN_BRASS"])
	var base_col: Color = skin["core"] as Color
	var molten_col: Color = Color("#ffcf66")
	core_glow_light.light_color = base_col.lerp(molten_col, _jaw_clamp_anim)
	core_glow_light.light_energy = 1.9 + _shutter_open_anim * 1.3 + _jaw_clamp_anim * 3.8 + sin(_time_acc * 3.2) * 0.18
	if _core_crystal_mat != null:
		_core_crystal_mat.emission_energy_multiplier = 1.6 + _shutter_open_anim * 1.5 + _jaw_clamp_anim * 3.5


func _animate_shattered_facets(delta: float) -> void:
	for i: int in range(_facet_nodes.size()):
		if not _facet_shattered[i]:
			continue
		var node: Node3D = _facet_nodes[i]
		if not node.visible:
			continue
		_facet_shatter_vel[i].y -= 7.8 * delta
		node.position += _facet_shatter_vel[i] * delta
		node.rotation += _facet_shatter_spin[i] * delta
		node.scale = node.scale.lerp(Vector3(0.05, 0.05, 0.05), minf(1.0, delta * 2.8))
		if node.position.y < -3.5:
			node.visible = false


func _update_facet_highlights(delta: float) -> void:
	for i: int in range(_facet_nodes.size()):
		if _facet_shattered[i]:
			continue
		var is_front: bool = (i == _active_facet_index)
		var target_scale: Vector3 = Vector3(1.07, 1.07, 1.07) if is_front else Vector3(0.94, 0.94, 0.94)
		_facet_nodes[i].scale = _facet_nodes[i].scale.lerp(target_scale, minf(1.0, delta * 10.0))

		var panel_mat: StandardMaterial3D = _facet_panel_mats[i]
		var target_emissive: Color = Color("#4a3614") if is_front else Color("#090d16")
		if is_front and _jaw_clamp_anim > 0.05:
			target_emissive = target_emissive.lerp(Color("#d49328"), _jaw_clamp_anim)
		panel_mat.emission = panel_mat.emission.lerp(target_emissive, minf(1.0, delta * 10.0))

		var lbl: Label3D = _facet_labels[i]
		var target_mod: Color = Color("#fff6dc") if is_front else Color("#a7b3c9")
		lbl.modulate = lbl.modulate.lerp(target_mod, minf(1.0, delta * 10.0))


func _process_observatory(delta: float) -> void:
	if not _touch_active:
		_relic_yaw += _relic_vel_yaw * delta
		_relic_pitch = clampf(_relic_pitch + _relic_vel_pitch * delta, -0.85, 0.85)
		_relic_vel_yaw = lerpf(_relic_vel_yaw, 0.38, minf(1.0, delta * 2.2))
		_relic_vel_pitch = lerpf(_relic_vel_pitch, 0.0, minf(1.0, delta * 3.5))

	if _relic_model_node != null:
		_relic_model_node.rotation = Vector3(_relic_pitch, _relic_yaw, 0.0)
		_relic_model_node.position.y = sin(_time_acc * 1.6) * 0.07


func _shatter_decoy_facets(target_shattered_total: int) -> void:
	var already_shattered: int = 0
	for s: bool in _facet_shattered:
		if s:
			already_shattered += 1

	var candidates: Array[int] = []
	for i: int in range(_facet_data.size()):
		if not _facet_shattered[i] and not bool(_facet_data[i].get("is_correct", false)):
			candidates.append(i)

	# Eliminate lowest-plausibility distractors first so remaining duel stays suspenseful
	candidates.sort_custom(func(a: int, b: int) -> bool:
		return float(_facet_data[a].get("plausibility", 0.5)) < float(_facet_data[b].get("plausibility", 0.5))
	)

	for idx: int in candidates:
		if already_shattered >= target_shattered_total:
			break
		_facet_shattered[idx] = true
		var angle: float = float(idx) * PI * 0.5
		_facet_shatter_vel[idx] = Vector3(sin(angle) * 2.8, 1.9, cos(angle) * 2.8)
		_facet_shatter_spin[idx] = Vector3(4.5, 6.2, -3.8)
		already_shattered += 1

	if _facet_shattered[_active_facet_index]:
		_active_facet_index = _find_next_active_facet(_active_facet_index, 1)
		_emit_active_facet()


func _compute_front_facet_index() -> int:
	var best_idx: int = _active_facet_index
	var best_dot: float = -2.0
	for i: int in range(4):
		if _facet_shattered[i]:
			continue
		var world_angle: float = float(i) * PI * 0.5 + _yaw
		var d: float = cos(world_angle)
		if d > best_dot:
			best_dot = d
			best_idx = i
	return best_idx


func _find_next_active_facet(from_idx: int, step_dir: int) -> int:
	var step: int = 1 if step_dir >= 0 else -1
	for offset: int in range(1, 5):
		var cand: int = posmod(from_idx + offset * step, 4)
		if not _facet_shattered[cand]:
			return cand
	return from_idx


func _emit_active_facet() -> void:
	var text: String = ""
	if _active_facet_index >= 0 and _active_facet_index < _facet_data.size():
		text = str(_facet_data[_active_facet_index].get("text", ""))
	facet_changed.emit(_active_facet_index, text)


func _load_hero_prism_model() -> void:
	for child: Node in model_pivot.get_children():
		child.queue_free()
	_shutters.clear()
	_shutter_rest_pos.clear()
	_shutter_rest_rot.clear()
	_shutter_out_dirs.clear()
	_clamp_jaws.clear()
	_jaw_rest_pos.clear()
	_jaw_rest_rot.clear()
	_jaw_in_dirs.clear()

	using_blender_glb = false
	var loaded_root: Node3D = null

	if ResourceLoader.exists(HERO_PRISM_GLB):
		var res: Resource = load(HERO_PRISM_GLB)
		if res is PackedScene:
			var inst: Node = (res as PackedScene).instantiate()
			if inst is Node3D:
				loaded_root = inst as Node3D
				model_pivot.add_child(loaded_root)
				using_blender_glb = true

	if loaded_root == null:
		loaded_root = _build_procedural_prism_fallback()
		model_pivot.add_child(loaded_root)

	# Bind exact Blender 5.3.0 hierarchy nodes
	_core_spindle = _find_node3d(loaded_root, "Core_Spindle")
	_crown_top = _find_node3d(loaded_root, "Crown_Top")
	_crown_bottom = _find_node3d(loaded_root, "Crown_Bottom")
	_calibrator_bezel = _find_node3d(loaded_root, "Calibrator_Bezel")
	_calibrator_needle = _find_node3d(loaded_root, "Calibrator_Needle")
	if _calibrator_bezel != null:
		_calibrator_bezel.visible = false
	if _calibrator_needle != null:
		_calibrator_needle.visible = false

	_facet_housing_template = _find_node3d(loaded_root, "FacetHousing_Template")
	if _facet_housing_template != null:
		_facet_housing_template.visible = false

	for i: int in range(4):
		var sh: Node3D = _find_node3d(loaded_root, "Shutter_%d" % i)
		if sh != null:
			_shutters.append(sh)
			_shutter_rest_pos.append(sh.position)
			_shutter_rest_rot.append(sh.rotation)
			var flat_pos: Vector2 = Vector2(sh.position.x, sh.position.z)
			if flat_pos.length() > 0.05:
				_shutter_out_dirs.append(Vector3(sh.position.x, 0.0, sh.position.z).normalized())
			else:
				# Blender Shutter_0..3 sit at origin rotated to 45 deg + i*90 deg with local +Z radially outward
				var basis_out: Vector3 = Vector3(sh.basis.z.x, 0.0, sh.basis.z.z)
				if basis_out.length() > 0.01:
					_shutter_out_dirs.append(basis_out.normalized())
				else:
					var a: float = float(i) * PI * 0.5 + PI * 0.25
					_shutter_out_dirs.append(Vector3(sin(a), 0.0, cos(a)))

		var jaw: Node3D = _find_node3d(loaded_root, "ClampJaw_%d" % i)
		if jaw != null:
			_clamp_jaws.append(jaw)
			_jaw_rest_pos.append(jaw.position)
			_jaw_rest_rot.append(jaw.rotation)
			var flat_jaw: Vector2 = Vector2(jaw.position.x, jaw.position.z)
			if flat_jaw.length() > 0.05:
				_jaw_in_dirs.append(-Vector3(jaw.position.x, 0.0, jaw.position.z).normalized())
			else:
				var ja: float = float(i) * PI * 0.5 + PI * 0.25
				_jaw_in_dirs.append(-Vector3(sin(ja), 0.0, cos(ja)))


func _find_node3d(root: Node, target_name: String) -> Node3D:
	var found: Node = root.find_child(target_name, true, false)
	if found is Node3D:
		return found as Node3D
	return null


func _build_answer_facets() -> void:
	for child: Node in facet_ring.get_children():
		child.queue_free()
	_facet_nodes.clear()
	_facet_labels.clear()
	_facet_panel_mats.clear()
	_facet_frame_mats.clear()

	for i: int in range(4):
		var angle: float = float(i) * PI * 0.5
		var holder: Node3D = Node3D.new()
		holder.name = "AnswerFacet_%d" % i
		holder.position = Vector3(sin(angle) * FACET_RADIUS, 0.0, cos(angle) * FACET_RADIUS)
		holder.rotation = Vector3(0.0, angle, 0.0)
		facet_ring.add_child(holder)

		# Smoked optical obsidian glass slab sized cleanly for the 1.04 x 0.56 Blender FacetHousing cutout
		var panel_mesh: BoxMesh = BoxMesh.new()
		panel_mesh.size = Vector3(1.03, 0.55, 0.032)
		var panel_mat: StandardMaterial3D = StandardMaterial3D.new()
		panel_mat.albedo_color = Color(0.045, 0.072, 0.132, 0.88)
		panel_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		panel_mat.metallic = 0.28
		panel_mat.roughness = 0.14
		panel_mat.emission_enabled = true
		panel_mat.emission = Color("#090d16")
		panel_mat.emission_energy_multiplier = 0.85

		var panel: MeshInstance3D = MeshInstance3D.new()
		panel.mesh = panel_mesh
		panel.material_override = panel_mat
		holder.add_child(panel)

		# Clone real Blender FacetHousing_Template bezel onto every Answer Facet (with fallback bars if missing)
		var frame_mat: StandardMaterial3D = StandardMaterial3D.new()
		frame_mat.albedo_color = Color("#e8c474")
		frame_mat.metallic = 0.92
		frame_mat.roughness = 0.24

		if _facet_housing_template != null:
			var housing_clone: Node3D = _facet_housing_template.duplicate() as Node3D
			housing_clone.name = "BlenderFacetHousing_%d" % i
			housing_clone.visible = true
			housing_clone.position = Vector3.ZERO
			housing_clone.rotation = Vector3.ZERO
			housing_clone.scale = Vector3.ONE
			holder.add_child(housing_clone)
		else:
			var top_bar: MeshInstance3D = MeshInstance3D.new()
			var h_box: BoxMesh = BoxMesh.new()
			h_box.size = Vector3(1.12, 0.045, 0.07)
			top_bar.mesh = h_box
			top_bar.material_override = frame_mat
			top_bar.position = Vector3(0.0, 0.29, 0.0)
			holder.add_child(top_bar)

			var bot_bar: MeshInstance3D = MeshInstance3D.new()
			bot_bar.mesh = h_box
			bot_bar.material_override = frame_mat
			bot_bar.position = Vector3(0.0, -0.29, 0.0)
			holder.add_child(bot_bar)

		# High-contrast 3D glass typography positioned cleanly in front of the smoked obsidian window
		var lbl: Label3D = Label3D.new()
		lbl.name = "FacetLabel"
		lbl.position = Vector3(0.0, 0.0, 0.042)
		lbl.text = "Option %d" % (i + 1)
		lbl.font_size = 42
		lbl.outline_size = 10
		lbl.outline_modulate = Color(0.03, 0.05, 0.09, 0.95)
		lbl.modulate = Color("#fff6dc")
		lbl.pixel_size = 0.0028
		lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		lbl.width = 320.0
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		holder.add_child(lbl)

		_facet_nodes.append(holder)
		_facet_labels.append(lbl)
		_facet_panel_mats.append(panel_mat)
		_facet_frame_mats.append(frame_mat)


func _build_procedural_prism_fallback() -> Node3D:
	## Sovereign Modernism procedural fallback with exact Blender node hierarchy names.
	var root: Node3D = Node3D.new()
	root.name = "VeritasPrismProceduralFallback"

	var mat_obsidian: StandardMaterial3D = StandardMaterial3D.new()
	mat_obsidian.albedo_color = Color("#0c1220")
	mat_obsidian.metallic = 0.35
	mat_obsidian.roughness = 0.18

	var mat_brass: StandardMaterial3D = StandardMaterial3D.new()
	mat_brass.albedo_color = Color("#e8c474")
	mat_brass.metallic = 0.94
	mat_brass.roughness = 0.22

	var mat_titanium: StandardMaterial3D = StandardMaterial3D.new()
	mat_titanium.albedo_color = Color("#2b3445")
	mat_titanium.metallic = 0.88
	mat_titanium.roughness = 0.30

	_core_crystal_mat = StandardMaterial3D.new()
	_core_crystal_mat.albedo_color = Color("#f7df9c")
	_core_crystal_mat.emission_enabled = true
	_core_crystal_mat.emission = Color("#f7df9c")
	_core_crystal_mat.emission_energy_multiplier = 2.0

	var spindle: Node3D = Node3D.new()
	spindle.name = "Core_Spindle"
	root.add_child(spindle)

	var core_col: MeshInstance3D = MeshInstance3D.new()
	var col_mesh: CylinderMesh = CylinderMesh.new()
	col_mesh.top_radius = 0.34
	col_mesh.bottom_radius = 0.34
	col_mesh.height = 1.48
	col_mesh.radial_segments = 12
	core_col.mesh = col_mesh
	core_col.material_override = mat_obsidian
	spindle.add_child(core_col)

	var crystal: MeshInstance3D = MeshInstance3D.new()
	var crys_mesh: PrismMesh = PrismMesh.new()
	crys_mesh.size = Vector3(0.42, 0.72, 0.42)
	crystal.mesh = crys_mesh
	crystal.material_override = _core_crystal_mat
	spindle.add_child(crystal)

	for cname: String in ["Crown_Top", "Crown_Bottom"]:
		var crown: Node3D = Node3D.new()
		crown.name = cname
		crown.position = Vector3(0.0, 0.82 if cname == "Crown_Top" else -0.82, 0.0)
		root.add_child(crown)

		var ring: MeshInstance3D = MeshInstance3D.new()
		var torus: TorusMesh = TorusMesh.new()
		torus.inner_radius = 0.48
		torus.outer_radius = 0.68
		ring.mesh = torus
		ring.material_override = mat_brass
		crown.add_child(ring)

	for i: int in range(4):
		var a: float = float(i) * PI * 0.5
		var shutter: Node3D = Node3D.new()
		shutter.name = "Shutter_%d" % i
		shutter.position = Vector3(sin(a) * 0.56, 0.0, cos(a) * 0.56)
		shutter.rotation = Vector3(0.0, a, 0.0)
		root.add_child(shutter)

		var sh_mesh: MeshInstance3D = MeshInstance3D.new()
		var sbox: BoxMesh = BoxMesh.new()
		sbox.size = Vector3(0.42, 1.16, 0.08)
		sh_mesh.mesh = sbox
		sh_mesh.material_override = mat_obsidian
		shutter.add_child(sh_mesh)

		var ja: float = a + PI * 0.25
		var jaw: Node3D = Node3D.new()
		jaw.name = "ClampJaw_%d" % i
		jaw.position = Vector3(sin(ja) * 0.88, 0.0, cos(ja) * 0.88)
		jaw.rotation = Vector3(0.0, ja, 0.0)
		root.add_child(jaw)

		var j_mesh: MeshInstance3D = MeshInstance3D.new()
		var jbox: BoxMesh = BoxMesh.new()
		jbox.size = Vector3(0.14, 0.86, 0.22)
		j_mesh.mesh = jbox
		j_mesh.material_override = mat_titanium
		jaw.add_child(j_mesh)

	return root


func _build_procedural_relic_fallback(accent: Color, seed_idx: int) -> Node3D:
	var holder: Node3D = Node3D.new()
	var mat_gold: StandardMaterial3D = StandardMaterial3D.new()
	mat_gold.albedo_color = accent
	mat_gold.metallic = 0.92
	mat_gold.roughness = 0.20

	var mat_glow: StandardMaterial3D = StandardMaterial3D.new()
	mat_glow.albedo_color = accent
	mat_glow.emission_enabled = true
	mat_glow.emission = accent
	mat_glow.emission_energy_multiplier = 2.2

	var core: MeshInstance3D = MeshInstance3D.new()
	var sph: SphereMesh = SphereMesh.new()
	sph.radius = 0.36
	sph.height = 0.72
	sph.radial_segments = 12 if (seed_idx % 2 == 0) else 6
	sph.rings = 6
	core.mesh = sph
	core.material_override = mat_glow
	holder.add_child(core)

	for r: int in range(3):
		var ring: MeshInstance3D = MeshInstance3D.new()
		var t: TorusMesh = TorusMesh.new()
		t.inner_radius = 0.56 + float(r) * 0.14
		t.outer_radius = 0.62 + float(r) * 0.14
		ring.mesh = t
		ring.material_override = mat_gold
		ring.rotation = Vector3(float(r) * 0.75 + float(seed_idx) * 0.3, float(r) * 0.5, 0.4)
		holder.add_child(ring)

	return holder


func _vibrate(duration_ms: int) -> void:
	if DisplayServer.get_name() == "headless":
		return
	Input.vibrate_handheld(duration_ms)
