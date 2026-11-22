class_name HeroArtifactRig
extends Node3D
## Museum-Grade 3D Hero Artifact Showcase for World's Smartest (Godot 4.7.2).
## Renders the 3 sculpted Blender 5.3.0 masterpieces ONLY where 3D truly shines:
##  1. Veritas Astrolabe Orb (`veritas_astrolabe_orb.glb`) — floating centerpiece on Title Screen
##  2. Meridian World Globe (`meridian_world_globe.glb`) — interactive 3D World Circuit Globe with 8 flush beacons
##  3. Championship Crown Trophy (`championship_trophy.glb`) — heroic rotating victory showcase on City Boss & Finale Clear!
## Switches to ArtifactMode.NONE (0 GPU triangles) during active trivia gameplay for locked 60 FPS!

const ORB_GLB: String = "res://assets/aaa_models/veritas_astrolabe_orb.glb"
const GLOBE_GLB: String = "res://assets/aaa_models/meridian_world_globe.glb"
const TROPHY_GLB: String = "res://assets/aaa_models/championship_trophy.glb"

enum ArtifactMode {
	NONE,
	ORB,
	GLOBE,
	TROPHY,
}

const CITY_COORDS: Array[Dictionary] = [
	{"code": "ch", "city": "Geneva", "lat": 46.20, "lon": 6.14},
	{"code": "gb", "city": "London", "lat": 51.51, "lon": -0.13},
	{"code": "jp", "city": "Tokyo", "lat": 35.68, "lon": 139.65},
	{"code": "br", "city": "Rio de Janeiro", "lat": -22.91, "lon": -43.17},
	{"code": "eg", "city": "Cairo", "lat": 30.04, "lon": 31.24},
	{"code": "is", "city": "Reykjavik", "lat": 64.15, "lon": -21.94},
	{"code": "sg", "city": "Singapore", "lat": 1.35, "lon": 103.82},
	{"code": "global", "city": "Apex Forum", "lat": 14.50, "lon": -38.00},
]

var mode: ArtifactMode = ArtifactMode.ORB
var interaction_enabled: bool = true
var selected_globe_code: String = "ch"
var loaded_models: Dictionary = {}

var _orb_root: Node3D = null
var _globe_root: Node3D = null
var _trophy_root: Node3D = null

var _ring_outer: Node3D = null
var _ring_mid: Node3D = null
var _ring_inner: Node3D = null
var _crystal_core: Node3D = null
var _orb_core_light: OmniLight3D = null

var _trophy_crown: Node3D = null
var _trophy_ring_outer: Node3D = null
var _trophy_ring_inner: Node3D = null
var _trophy_star_core: Node3D = null
var _trophy_core_light: OmniLight3D = null

var _globe_spin_node: Node3D = null
var _globe_pins: Dictionary = {}
var _globe_yaw: float = 0.0
var _globe_target_yaw: float = 0.0
var _globe_yaw_vel: float = 0.0
var _globe_dragging: bool = false

var _spin_yaw: float = 0.0
var _spin_vel_y: float = 0.0
var _spin_tilt_x: float = 0.0
var _last_tick_step: int = 0
var _time_acc: float = 0.0

var _dragging: bool = false
var _active_touch_id: int = -1


func _ready() -> void:
	position = Vector3.ZERO
	_build_orb_rig()
	_build_globe_rig()
	_build_trophy_rig()
	set_artifact_mode(ArtifactMode.ORB, true)


func _load_glb_centered(path: String, key: String, fallback_builder: Callable, target_height: float) -> Node3D:
	var wrapper: Node3D = Node3D.new()
	wrapper.name = "Wrapper_" + key
	if ResourceLoader.exists(path):
		var scene: PackedScene = load(path) as PackedScene
		if scene != null:
			var inst: Node = scene.instantiate()
			if inst is Node3D:
				var inst3d: Node3D = inst as Node3D
				wrapper.add_child(inst3d)
				var bounds: AABB = _compute_bounds(inst3d)
				if bounds.size.y > 0.001:
					var ratio: float = target_height / bounds.size.y
					inst3d.scale = Vector3.ONE * ratio
					bounds = _compute_bounds(inst3d)
					var center: Vector3 = bounds.position + bounds.size * 0.5
					inst3d.position -= center
				loaded_models[key] = true
				return wrapper

	loaded_models[key] = false
	wrapper.add_child(fallback_builder.call())
	return wrapper


func _build_orb_rig() -> void:
	_orb_root = _load_glb_centered(ORB_GLB, "veritas_astrolabe_orb", _build_fallback_orb, 0.90)
	_orb_root.name = "VeritasAstrolabeOrb"
	add_child(_orb_root)

	_ring_outer = _find_node_ci(_orb_root, ["Ring_Outer", "Outer_Ring", "Armillary_Outer"])
	_ring_mid = _find_node_ci(_orb_root, ["Ring_Mid", "Mid_Ring", "Armillary_Mid"])
	_ring_inner = _find_node_ci(_orb_root, ["Ring_Inner", "Inner_Ring", "Armillary_Inner"])
	_crystal_core = _find_node_ci(_orb_root, ["Crystal_Core", "Core_Crystal", "Core_Spindle"])

	# Preserve native Blender 5.3.0 multi-material PBR textures (24K gold, sapphire enamel, titanium, obsidian, diamond)
	# Only apply fallback relighting if the GLB was missing and fallback primitive geometry was spawned.
	if not bool(loaded_models.get("veritas_astrolabe_orb", false)):
		_relight_orb_materials(_orb_root)

	_orb_core_light = OmniLight3D.new()
	_orb_core_light.name = "OrbWarmCoreLight"
	_orb_core_light.position = Vector3(0.0, 0.04, 0.0)
	_orb_core_light.light_color = Color(1.0, 0.84, 0.48)
	_orb_core_light.light_energy = 1.45
	_orb_core_light.omni_range = 2.8
	_orb_core_light.omni_attenuation = 1.5
	_orb_root.add_child(_orb_core_light)


func _relight_orb_materials(root: Node) -> void:
	var gold_mat: StandardMaterial3D = StandardMaterial3D.new()
	gold_mat.albedo_color = Color(0.95, 0.80, 0.46)
	gold_mat.metallic = 0.90
	gold_mat.roughness = 0.22

	var petal_mat: StandardMaterial3D = StandardMaterial3D.new()
	petal_mat.albedo_color = Color(0.09, 0.14, 0.26)
	petal_mat.metallic = 0.48
	petal_mat.roughness = 0.18

	var core_mat: StandardMaterial3D = StandardMaterial3D.new()
	core_mat.albedo_color = Color(0.96, 0.74, 0.30)
	core_mat.metallic = 0.28
	core_mat.roughness = 0.14
	core_mat.emission_enabled = true
	core_mat.emission = Color(1.0, 0.80, 0.38)
	core_mat.emission_energy_multiplier = 1.35

	var stack: Array[Node] = [root]
	while not stack.is_empty():
		var n: Node = stack.pop_back()
		if n is MeshInstance3D:
			var mi: MeshInstance3D = n as MeshInstance3D
			var lname: String = mi.name.to_lower()
			var pname: String = mi.get_parent().name.to_lower() if mi.get_parent() != null else ""
			var tag: String = lname + " " + pname
			if tag.contains("core") or tag.contains("crystal"):
				mi.material_override = core_mat
			elif tag.contains("petal") or tag.contains("shutter"):
				mi.material_override = petal_mat
			elif tag.contains("ring") or tag.contains("caliper") or tag.contains("base") or tag.contains("plinth"):
				mi.material_override = gold_mat
		for ch: Node in n.get_children():
			stack.append(ch)


func _build_globe_rig() -> void:
	_globe_root = _load_glb_centered(GLOBE_GLB, "meridian_world_globe", _build_fallback_globe, 1.04)
	_globe_root.name = "MeridianWorldGlobe"
	add_child(_globe_root)

	_globe_spin_node = _find_node_ci(_globe_root, ["Globe_Spin_Pivot", "Globe_Sphere", "Globe"])
	if _globe_spin_node == null:
		_globe_spin_node = _globe_root

	var sphere_mesh_node: Node3D = _find_node_ci(_globe_spin_node, ["Globe_Sphere"])
	var pin_parent: Node3D = sphere_mesh_node if sphere_mesh_node != null else _globe_spin_node
	var local_center: Vector3 = Vector3.ZERO
	var radius: float = 0.55
	if pin_parent is MeshInstance3D:
		var lb: AABB = (pin_parent as MeshInstance3D).get_aabb()
		local_center = lb.position + lb.size * 0.5
		radius = maxf(0.15, lb.size.x * 0.5 * 1.015)
	else:
		var sb: AABB = _compute_bounds(pin_parent)
		if sb.size.x > 0.05:
			local_center = sb.position + sb.size * 0.5
			radius = sb.size.x * 0.5 * 1.015

	var pin_sphere: SphereMesh = SphereMesh.new()
	pin_sphere.radius = radius * 0.042
	pin_sphere.height = radius * 0.084

	for c: Dictionary in CITY_COORDS:
		var lat_r: float = deg_to_rad(float(c["lat"]))
		var lon_r: float = deg_to_rad(float(c["lon"]))
		var dir: Vector3 = Vector3(
			cos(lat_r) * sin(lon_r),
			sin(lat_r),
			cos(lat_r) * cos(lon_r)
		)
		var pin: MeshInstance3D = MeshInstance3D.new()
		pin.name = "CityPin_" + str(c["code"])
		pin.mesh = pin_sphere
		var mat: StandardMaterial3D = StandardMaterial3D.new()
		mat.albedo_color = Color(0.98, 0.84, 0.48)
		mat.emission_enabled = true
		mat.emission = Color(1.0, 0.84, 0.42)
		mat.emission_energy_multiplier = 1.85
		pin.material_override = mat
		pin.position = local_center + dir * radius
		pin_parent.add_child(pin)
		_globe_pins[str(c["code"])] = pin


func _build_trophy_rig() -> void:
	_trophy_root = _load_glb_centered(TROPHY_GLB, "championship_trophy", _build_fallback_trophy, 0.98)
	_trophy_root.name = "ChampionshipTrophy"
	add_child(_trophy_root)

	_trophy_crown = _find_node_ci(_trophy_root, ["Trophy_Crown_Ring", "Crown_Ring"])
	_trophy_ring_outer = _find_node_ci(_trophy_root, ["Trophy_Astrolabe_Ring_Outer", "Astrolabe_Ring_Outer"])
	_trophy_ring_inner = _find_node_ci(_trophy_root, ["Trophy_Astrolabe_Ring_Inner", "Astrolabe_Ring_Inner"])
	_trophy_star_core = _find_node_ci(_trophy_root, ["Trophy_Star_Core", "Star_Core"])

	_trophy_core_light = OmniLight3D.new()
	_trophy_core_light.name = "TrophyCoreLight"
	_trophy_core_light.position = Vector3(0.0, 0.24, 0.14)
	_trophy_core_light.light_color = Color(1.0, 0.86, 0.46)
	_trophy_core_light.light_energy = 1.65
	_trophy_core_light.omni_range = 3.0
	_trophy_core_light.omni_attenuation = 1.4
	_trophy_root.add_child(_trophy_core_light)


func set_artifact_mode(new_mode: ArtifactMode, instant: bool = false) -> void:
	mode = new_mode
	_orb_root.visible = (mode == ArtifactMode.ORB)
	_globe_root.visible = (mode == ArtifactMode.GLOBE)
	_trophy_root.visible = (mode == ArtifactMode.TROPHY)
	if not instant and mode != ArtifactMode.NONE:
		var active_node: Node3D = _orb_root if mode == ArtifactMode.ORB else (_globe_root if mode == ArtifactMode.GLOBE else _trophy_root)
		active_node.scale = Vector3.ONE * 0.84
		var tw: Tween = create_tween()
		tw.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		tw.tween_property(active_node, "scale", Vector3.ONE, 0.40)


func focus_globe_city(venue_code: String) -> void:
	selected_globe_code = venue_code.to_lower()
	for c: Dictionary in CITY_COORDS:
		if str(c["code"]) == selected_globe_code:
			_globe_target_yaw = -deg_to_rad(float(c["lon"]))
			break
	for code: String in _globe_pins.keys():
		var pin: MeshInstance3D = _globe_pins[code] as MeshInstance3D
		if pin != null and pin.material_override is StandardMaterial3D:
			var sm: StandardMaterial3D = pin.material_override as StandardMaterial3D
			var is_sel: bool = (code == selected_globe_code)
			sm.emission_energy_multiplier = 3.2 if is_sel else 1.2
			pin.scale = Vector3.ONE * (1.55 if is_sel else 0.9)


func handle_viewport_input(event: InputEvent, viewport_size: Vector2) -> bool:
	if not interaction_enabled or mode == ArtifactMode.NONE:
		return false

	if event is InputEventScreenTouch:
		var st: InputEventScreenTouch = event as InputEventScreenTouch
		if st.pressed and _active_touch_id == -1:
			if _is_in_3d_touch_zone(st.position, viewport_size):
				_active_touch_id = st.index
				_dragging = true
				_globe_dragging = (mode == ArtifactMode.GLOBE)
				return true
		elif not st.pressed and st.index == _active_touch_id:
			_active_touch_id = -1
			_dragging = false
			_globe_dragging = false
			return true
	elif event is InputEventScreenDrag:
		var sd: InputEventScreenDrag = event as InputEventScreenDrag
		if sd.index == _active_touch_id and _dragging:
			_apply_drag(sd.relative, viewport_size)
			return true
	elif event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT:
			if mb.pressed and _is_in_3d_touch_zone(mb.position, viewport_size):
				_dragging = true
				_globe_dragging = (mode == ArtifactMode.GLOBE)
				return true
			elif not mb.pressed and _dragging:
				_dragging = false
				_globe_dragging = false
				return true
	elif event is InputEventMouseMotion:
		var mm: InputEventMouseMotion = event as InputEventMouseMotion
		if _dragging:
			_apply_drag(mm.relative, viewport_size)
			return true
	return false


func _is_in_3d_touch_zone(pos: Vector2, vp: Vector2) -> bool:
	var y_ratio: float = pos.y / maxf(1.0, vp.y)
	return y_ratio >= 0.16 and y_ratio <= 0.72


func _apply_drag(rel: Vector2, vp: Vector2) -> void:
	var norm_dx: float = rel.x / maxf(240.0, vp.x)
	var norm_dy: float = rel.y / maxf(240.0, vp.y)
	if mode == ArtifactMode.ORB or mode == ArtifactMode.TROPHY:
		_spin_yaw += norm_dx * 4.5
		_spin_vel_y = norm_dx * 28.0
		_spin_tilt_x = clampf(_spin_tilt_x + norm_dy * 1.3, -0.35, 0.35)
		var step_val: int = int(floor(_spin_yaw / (PI * 0.25)))
		if step_val != _last_tick_step:
			_last_tick_step = step_val
			AudioDirector.play_spin_tick(clampf(absf(_spin_vel_y) / 14.0, 0.0, 1.0))
	elif mode == ArtifactMode.GLOBE:
		_globe_yaw += norm_dx * 4.6
		_globe_yaw_vel = norm_dx * 24.0


func _process(delta: float) -> void:
	if mode == ArtifactMode.NONE:
		return
	_time_acc += delta

	if mode == ArtifactMode.ORB and _orb_root != null and _orb_root.visible:
		if not _dragging:
			_spin_yaw += _spin_vel_y * delta
			_spin_vel_y *= exp(-delta * 4.0)
			_spin_tilt_x = lerpf(_spin_tilt_x, 0.0, clampf(delta * 4.0, 0.0, 1.0))
		var idle_drift: float = _time_acc * 0.26
		if _ring_outer != null:
			_ring_outer.rotation.y = _spin_yaw + idle_drift * 0.45
			_ring_outer.rotation.x = _spin_tilt_x + sin(_time_acc * 0.65) * 0.06
		if _ring_mid != null:
			_ring_mid.rotation.y = -_spin_yaw * 0.72 - idle_drift * 0.78
			_ring_mid.rotation.z = cos(_time_acc * 0.8) * 0.14
		if _ring_inner != null:
			_ring_inner.rotation.y = _spin_yaw * 1.35 + idle_drift * 1.25
			_ring_inner.rotation.x = sin(_time_acc * 1.1) * 0.18
		if _crystal_core != null:
			_crystal_core.rotation.y = _spin_yaw * 1.5 + _time_acc * 0.75
			var s: float = 1.0 + sin(_time_acc * 2.4) * 0.02
			_crystal_core.scale = Vector3.ONE * s
		_orb_root.position.y = sin(_time_acc * 1.15) * 0.022

	elif mode == ArtifactMode.GLOBE and _globe_root != null and _globe_root.visible:
		if not _globe_dragging:
			if absf(_globe_yaw_vel) > 0.05:
				_globe_yaw += _globe_yaw_vel * delta
				_globe_yaw_vel *= exp(-delta * 3.5)
				_globe_target_yaw = _globe_yaw
			else:
				_globe_target_yaw += delta * 0.14
				var diff: float = wrapf(_globe_target_yaw - _globe_yaw, -PI, PI)
				_globe_yaw += diff * clampf(delta * 4.5, 0.0, 1.0)
		if _globe_spin_node != null:
			_globe_spin_node.rotation.y = _globe_yaw

	elif mode == ArtifactMode.TROPHY and _trophy_root != null and _trophy_root.visible:
		if not _dragging:
			_spin_yaw += _spin_vel_y * delta
			_spin_vel_y *= exp(-delta * 4.0)
		_trophy_root.rotation.y = _time_acc * 0.48 + _spin_yaw
		_trophy_root.position.y = sin(_time_acc * 1.4) * 0.024
		if _trophy_crown != null:
			_trophy_crown.rotation.y = _time_acc * 0.35
		if _trophy_ring_outer != null:
			_trophy_ring_outer.rotation.y = -_time_acc * 0.72
			_trophy_ring_outer.rotation.x = sin(_time_acc * 0.9) * 0.14
		if _trophy_ring_inner != null:
			_trophy_ring_inner.rotation.y = _time_acc * 1.15
			_trophy_ring_inner.rotation.z = cos(_time_acc * 1.1) * 0.18
		if _trophy_star_core != null:
			_trophy_star_core.rotation.y = _time_acc * 1.45
			var ts: float = 1.0 + sin(_time_acc * 2.8) * 0.035
			_trophy_star_core.scale = Vector3.ONE * ts


func _find_node_ci(root: Node, names: Array[String]) -> Node3D:
	var lowered: Array[String] = []
	for nm: String in names:
		lowered.append(nm.to_lower())
	var stack: Array[Node] = [root]
	while not stack.is_empty():
		var cur: Node = stack.pop_back()
		if cur is Node3D:
			var cname: String = cur.name.to_lower()
			for target: String in lowered:
				if cname == target or cname.contains(target):
					return cur as Node3D
		for ch: Node in cur.get_children():
			stack.append(ch)
	return null


func _compute_bounds(root: Node3D) -> AABB:
	var has_any: bool = false
	var combined: AABB = AABB()
	var stack: Array[Node] = [root]
	while not stack.is_empty():
		var n: Node = stack.pop_back()
		if n is MeshInstance3D:
			var mi: MeshInstance3D = n as MeshInstance3D
			var lb: AABB = mi.get_aabb()
			var xf: Transform3D = root.transform.affine_inverse() * mi.transform
			var cur_p: Node = mi.get_parent()
			while cur_p != null and cur_p != root:
				if cur_p is Node3D:
					xf = (cur_p as Node3D).transform * xf
				cur_p = cur_p.get_parent()
			var tb: AABB = xf * lb
			combined = tb if not has_any else combined.merge(tb)
			has_any = true
		for ch: Node in n.get_children():
			stack.append(ch)
	return combined


func _build_fallback_orb() -> Node3D:
	var root: Node3D = Node3D.new()
	var ring: MeshInstance3D = MeshInstance3D.new()
	ring.name = "Ring_Outer"
	var t: TorusMesh = TorusMesh.new()
	t.inner_radius = 0.28
	t.outer_radius = 0.34
	ring.mesh = t
	root.add_child(ring)
	var core: MeshInstance3D = MeshInstance3D.new()
	core.name = "Crystal_Core"
	var sp: SphereMesh = SphereMesh.new()
	sp.radius = 0.14
	sp.height = 0.28
	core.mesh = sp
	root.add_child(core)
	return root


func _build_fallback_globe() -> Node3D:
	var root: Node3D = Node3D.new()
	var sp_node: MeshInstance3D = MeshInstance3D.new()
	sp_node.name = "Globe_Spin_Pivot"
	var sp: SphereMesh = SphereMesh.new()
	sp.radius = 0.48
	sp.height = 0.96
	sp_node.mesh = sp
	root.add_child(sp_node)
	return root


func _build_fallback_trophy() -> Node3D:
	var root: Node3D = Node3D.new()
	var gold: StandardMaterial3D = StandardMaterial3D.new()
	gold.albedo_color = Color(0.95, 0.80, 0.44)
	gold.metallic = 0.92
	gold.roughness = 0.20

	var base: MeshInstance3D = MeshInstance3D.new()
	var cyl: CylinderMesh = CylinderMesh.new()
	cyl.top_radius = 0.18
	cyl.bottom_radius = 0.24
	cyl.height = 0.16
	base.mesh = cyl
	base.position = Vector3(0.0, -0.34, 0.0)
	base.material_override = gold
	root.add_child(base)

	var cup: MeshInstance3D = MeshInstance3D.new()
	var t: TorusMesh = TorusMesh.new()
	t.inner_radius = 0.22
	t.outer_radius = 0.28
	cup.mesh = t
	cup.position = Vector3(0.0, 0.08, 0.0)
	cup.material_override = gold
	root.add_child(cup)
	return root
