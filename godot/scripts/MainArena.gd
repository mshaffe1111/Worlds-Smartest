class_name MainArena
extends Node3D
## Principal 3D Arena & 9:16 Mobile Portrait HUD controller for World's Smartest (Godot 4.7.2).
## Drives ACES Filmic environment, Rembrandt + Broadcast/Fracture crimson lighting, Blender stage props,
## curved panoramic backdrops across all 8 Global Venues, VeritasPrism interaction, and Fortiche portrait dialogue.

const STAGE_PLINTH_GLB: String = "res://assets/models/stage_plinth.glb"
const STAGE_MONOLITH_GLB: String = "res://assets/models/stage_monolith.glb"
const WORLD_GLOBE_GLB: String = "res://assets/models/world_globe_rig.glb"

const MODES: Array[String] = ["CAMPAIGN", "DAILY", "ENDLESS", "TRIALS", "OBSERVATORY"]

const CAST_PROFILES: Array[Dictionary] = [
	{
		"id": "vance",
		"name": "JULIAN VANCE",
		"role": "Chief Arbiter · The Meridian",
		"portrait": "res://assets/portraits/vance.jpg",
		"accent": Color("#e8c474"),
		"line": "Two billion viewers are watching the prism. Trust your first sightline—or peel the crown if doubt creeps in.",
	},
	{
		"id": "nadia",
		"name": "DR. NADIA OKAFOR",
		"role": "Quantum Historian · Rival",
		"portrait": "res://assets/portraits/nadia.jpg",
		"accent": Color("#48b8f0"),
		"line": "Overclocking at Tier 1 is a statement. Just remember: a fractured lock costs more than points.",
	},
	{
		"id": "soren",
		"name": "SOREN KESSLER",
		"role": "Horizon Prodigy · Rival",
		"portrait": "res://assets/portraits/soren.jpg",
		"accent": Color("#5ce1e6"),
		"line": "I mapped every shard in the Geneva vault before takeoff. Let us see if your intuition beats telemetry.",
	},
	{
		"id": "teo",
		"name": "TEO MORALES",
		"role": "Investigative Journalist",
		"portrait": "res://assets/portraits/teo.jpg",
		"accent": Color("#38c793"),
		"line": "Check the metadata behind the Meridian broadcast. The Council isn't just testing intelligence—they're auditioning a successor.",
	},
	{
		"id": "lindqvist",
		"name": "CHANCELLOR LINDQVIST",
		"role": "Sovereign Bloc Patron",
		"portrait": "res://assets/portraits/lindqvist.jpg",
		"accent": Color("#d4a853"),
		"line": "Order demands precision. Hold the Overclock clamp only when certainty is absolute.",
	},
	{
		"id": "tariq",
		"name": "TARIQ AL-MANSOOR",
		"role": "Architect of Meridian Zero",
		"portrait": "res://assets/portraits/tariq.jpg",
		"accent": Color("#f2c166"),
		"line": "Every relic across the eight cities is a key shard. Inspect them closely in the Observatory.",
	},
]

# 3D Scene Nodes
@onready var world_env: WorldEnvironment = $WorldEnvironment
@onready var arena_camera: Camera3D = $ArenaCamera
@onready var key_light: DirectionalLight3D = $LightingRig/KeyLight
@onready var rim_light: OmniLight3D = $LightingRig/RimLight
@onready var fill_light: OmniLight3D = $LightingRig/FillLight
@onready var stage_bounce_light: OmniLight3D = $LightingRig/StageBounceLight
@onready var venue_backdrop: MeshInstance3D = $VenueBackdrop
@onready var plinth_anchor: Node3D = $StagePlinthAnchor
@onready var monolith_anchor: Node3D = $StageMonolithAnchor
@onready var monolith_portrait_screen: MeshInstance3D = $StageMonolithAnchor/PortraitScreen
@onready var globe_anchor: Node3D = $GlobeAnchor
@onready var veritas_prism: VeritasPrism = $VeritasPrism

# HUD Nodes
@onready var top_panel: PanelContainer = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel
@onready var venue_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel/TopVBox/TopRow/VenueButton
@onready var mode_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel/TopVBox/TopRow/ModeButton
@onready var lighting_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel/TopVBox/TopRow/LightingButton
@onready var score_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel/TopVBox/StatsRow/ScoreLabel
@onready var streak_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel/TopVBox/StatsRow/StreakLabel
@onready var db_badge_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/TopPanel/TopVBox/StatsRow/DbBadgeLabel

@onready var prompt_card: PanelContainer = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard
@onready var chrono_bar: ProgressBar = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/ChronoBar
@onready var domain_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/MetaRow/DomainLabel
@onready var timer_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/MetaRow/TimerLabel
@onready var prompt_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/PromptLabel
@onready var clue_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/ClueLabel
@onready var verdict_box: VBoxContainer = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/VerdictBox
@onready var verdict_title: Label = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/VerdictBox/VerdictTitle
@onready var verdict_why: Label = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/VerdictBox/VerdictWhy
@onready var next_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/PromptCard/PromptVBox/VerdictBox/NextButton

@onready var sightline_panel: PanelContainer = $HUDLayer/HUDRoot/MainMargin/VBox/SightlinePanel
@onready var spin_left_btn: Button = $HUDLayer/HUDRoot/MainMargin/VBox/SightlinePanel/SightlineHBox/SpinLeftBtn
@onready var active_facet_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/SightlinePanel/SightlineHBox/ActiveFacetLabel
@onready var spin_right_btn: Button = $HUDLayer/HUDRoot/MainMargin/VBox/SightlinePanel/SightlineHBox/SpinRightBtn

@onready var dialogue_panel: PanelContainer = $HUDLayer/HUDRoot/MainMargin/VBox/DialoguePanel
@onready var portrait_rect: TextureRect = $HUDLayer/HUDRoot/MainMargin/VBox/DialoguePanel/DialogueHBox/PortraitFrame/PortraitRect
@onready var speaker_name_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/DialoguePanel/DialogueHBox/DialogueTextVBox/SpeakerHeader/SpeakerNameLabel
@onready var cast_cycle_btn: Button = $HUDLayer/HUDRoot/MainMargin/VBox/DialoguePanel/DialogueHBox/DialogueTextVBox/SpeakerHeader/CastCycleBtn
@onready var dialogue_body_label: Label = $HUDLayer/HUDRoot/MainMargin/VBox/DialoguePanel/DialogueHBox/DialogueTextVBox/DialogueBodyLabel

@onready var peel_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/ActionDock/PeelButton
@onready var overclock_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/ActionDock/OverclockButton
@onready var vault_button: Button = $HUDLayer/HUDRoot/MainMargin/VBox/ActionDock/VaultButton

var _venue_index: int = 0
var _mode_index: int = 0
var _cast_index: int = 0
var _fracture_lighting: bool = false
var _score: int = 0
var _streak: int = 0
var _match_questions: Array[Dictionary] = []
var _question_index: int = 0
var _current_question: Dictionary = {}
var _time_limit_sec: float = 20.0
var _time_remaining_sec: float = 20.0
var _question_active: bool = false

var _backdrop_mat: StandardMaterial3D = null
var _monolith_screen_mat: StandardMaterial3D = null
var _cam_base_pos: Vector3 = Vector3(0.0, 0.45, 5.25)
var _cam_shake: float = 0.0
var _time_acc: float = 0.0
var _overclock_visual_charge: float = 0.0


func _ready() -> void:
	_cam_base_pos = arena_camera.position
	_apply_sovereign_hud_styles()
	_build_curved_venue_backdrop()
	_load_stage_blender_props()
	_wire_signals()

	# Initialize Geneva flagship venue, speaker, and match deck
	set_venue_by_index(0, false)
	set_speaker_by_id("vance")
	_start_new_match()

	if OS.get_cmdline_user_args().has("--self-test"):
		call_deferred("_run_self_test")


func _process(delta: float) -> void:
	_time_acc += delta
	_update_dynamic_lighting(delta)
	_update_camera_motion(delta)
	_update_match_timer(delta)
	if globe_anchor.visible:
		globe_anchor.rotation.y += delta * 0.22


func _wire_signals() -> void:
	venue_button.pressed.connect(_on_venue_button_pressed)
	mode_button.pressed.connect(_on_mode_button_pressed)
	lighting_button.pressed.connect(_on_lighting_button_pressed)
	next_button.pressed.connect(_on_next_question_pressed)
	spin_left_btn.pressed.connect(_on_spin_left_pressed)
	spin_right_btn.pressed.connect(_on_spin_right_pressed)
	cast_cycle_btn.pressed.connect(_on_cast_cycle_pressed)
	peel_button.pressed.connect(_on_peel_button_pressed)
	overclock_button.button_down.connect(_on_overclock_button_down)
	overclock_button.button_up.connect(_on_overclock_button_up)
	vault_button.pressed.connect(_on_vault_button_pressed)

	veritas_prism.facet_changed.connect(_on_prism_facet_changed)
	veritas_prism.peel_triggered.connect(_on_prism_peel_triggered)
	veritas_prism.overclock_progress.connect(_on_prism_overclock_progress)
	veritas_prism.answer_locked.connect(_on_prism_answer_locked)
	veritas_prism.relic_changed.connect(_on_prism_relic_changed)


func set_venue_by_index(idx: int, play_chime: bool = true) -> void:
	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	if venues.is_empty():
		return
	_venue_index = posmod(idx, venues.size())
	var venue: Dictionary = venues[_venue_index]
	var code: String = str(venue["code"])

	venue_button.text = "%s · %s ▸" % [str(venue["city"]).to_upper(), code.to_upper()]
	_apply_venue_backdrop_texture(code)
	set_speaker_by_id(str(venue.get("speaker_id", "vance")))

	if play_chime:
		AudioSynth.play_venue_chime(code)


func _apply_venue_backdrop_texture(venue_code: String) -> void:
	if _backdrop_mat == null:
		return
	var primary_path: String = "res://assets/venues/%s.jpg" % venue_code.to_lower()
	var chosen_path: String = primary_path
	if not ResourceLoader.exists(chosen_path):
		chosen_path = "res://assets/venues/ch.jpg"

	if ResourceLoader.exists(chosen_path):
		var tex: Resource = load(chosen_path)
		if tex is Texture2D:
			_backdrop_mat.albedo_texture = tex as Texture2D
			_backdrop_mat.emission_texture = tex as Texture2D


func set_speaker_by_id(speaker_id: String, custom_line: String = "") -> void:
	for i: int in range(CAST_PROFILES.size()):
		if str(CAST_PROFILES[i]["id"]) == speaker_id:
			_cast_index = i
			break
	var profile: Dictionary = CAST_PROFILES[_cast_index]
	speaker_name_label.text = "%s · %s" % [str(profile["name"]), str(profile["role"])]
	speaker_name_label.add_theme_color_override("font_color", profile["accent"] as Color)
	dialogue_body_label.text = custom_line if not custom_line.is_empty() else str(profile["line"])

	var portrait_path: String = str(profile["portrait"])
	if ResourceLoader.exists(portrait_path):
		var tex: Resource = load(portrait_path)
		if tex is Texture2D:
			portrait_rect.texture = tex as Texture2D
			if _monolith_screen_mat != null:
				_monolith_screen_mat.albedo_texture = tex as Texture2D
				_monolith_screen_mat.emission_texture = tex as Texture2D


func _start_new_match() -> void:
	var mode_name: String = MODES[_mode_index]
	mode_button.text = "%s ▸" % mode_name

	if mode_name == "OBSERVATORY":
		_enter_observatory_view()
		return

	veritas_prism.set_observatory_mode(false)
	globe_anchor.visible = false
	prompt_card.visible = true
	verdict_box.visible = false
	_fracture_lighting = (mode_name == "TRIALS")
	lighting_button.text = "FRACTURE" if _fracture_lighting else "BROADCAST"

	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	var venue_code: String = str(venues[_venue_index]["code"])
	var q_count: int = 7 if mode_name == "DAILY" else (12 if mode_name == "ENDLESS" else 6)
	_match_questions = TriviaDB.select_match_questions(mode_name, venue_code, q_count)
	_question_index = 0
	_update_action_dock_labels(false)
	_present_current_question()


func _enter_observatory_view() -> void:
	_question_active = false
	prompt_card.visible = false
	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	var relic_id: String = str(venues[_venue_index].get("relic_id", "meridian_astrolabe"))
	veritas_prism.set_observatory_mode(true, relic_id)
	globe_anchor.visible = false
	set_speaker_by_id("tariq", "Drag in any direction to orbit the Blender 3D Hero Relic. Tap PREV / NEXT to inspect all 8 vault artifacts.")
	_update_action_dock_labels(true)
	_refresh_stats_bar()


func _present_current_question() -> void:
	if _match_questions.is_empty():
		return
	if _question_index >= _match_questions.size():
		_start_new_match()
		return

	_current_question = _match_questions[_question_index]
	var dom_id: int = int(_current_question.get("l0Domain", 0))
	var dom_meta: Dictionary = TriviaDB.get_domain_meta(dom_id)
	var accent: Color = dom_meta["accent"] as Color

	var facets: Array[Dictionary] = TriviaDB.get_answer_facets(_current_question)
	var archetype: String = str(_current_question.get("archetype", "SIGHTLINE_LOCK"))
	veritas_prism.load_question_facets(facets, accent, archetype)

	_time_limit_sec = 10.0 if str(_current_question.get("archetype", "")) == "GAUNTLET_SHATTER" else 20.0
	_time_remaining_sec = _time_limit_sec
	_question_active = true

	prompt_label.text = str(_current_question.get("prompt", ""))
	clue_label.visible = false
	clue_label.text = ""
	verdict_box.visible = false
	chrono_bar.value = 100.0

	_update_domain_header(1)
	_update_action_dock_labels(false)
	_refresh_stats_bar()


func _update_domain_header(peel_tier: int) -> void:
	var dom_id: int = int(_current_question.get("l0Domain", 0))
	var dom_meta: Dictionary = TriviaDB.get_domain_meta(dom_id)
	var mult_str: String = "3.0x" if peel_tier <= 1 else ("2.0x" if peel_tier == 2 else "1.2x")
	var cat: String = str(_current_question.get("l1Category", dom_meta["name"]))
	domain_label.text = "%s · %s · TIER %d (%s)" % [str(dom_meta["name"]).to_upper(), cat.to_upper(), peel_tier, mult_str]
	domain_label.add_theme_color_override("font_color", dom_meta["accent"] as Color)


func _refresh_stats_bar() -> void:
	score_label.text = "SCORE %d" % _score
	var mode_name: String = MODES[_mode_index]
	if mode_name == "OBSERVATORY":
		streak_label.text = "RELIC %d / 8" % (veritas_prism.current_relic_index + 1)
	else:
		streak_label.text = "STREAK %d · Q %d/%d" % [_streak, _question_index + 1, maxi(1, _match_questions.size())]
	var src_tag: String = "JSON" if TriviaDB.loaded_from_json else "SEED"
	db_badge_label.text = "%s %d Qs · %d SEEN" % [src_tag, TriviaDB.get_question_count(), TriviaDB.get_seen_count()]


func _update_action_dock_labels(is_observatory: bool) -> void:
	if is_observatory:
		peel_button.text = "◄ PREV RELIC"
		peel_button.disabled = false
		overclock_button.text = "PRISM SKIN ▸"
		overclock_button.disabled = false
		vault_button.text = "RETURN TO ARENA"
	else:
		var tier: int = veritas_prism.get_peel_tier()
		if tier == 1:
			peel_button.text = "PEEL TIER 2 (2.0x)"
			peel_button.disabled = not _question_active
		elif tier == 2:
			peel_button.text = "PEEL TIER 3 (1.2x)"
			peel_button.disabled = not _question_active
		else:
			peel_button.text = "CROWN OPEN (MAX)"
			peel_button.disabled = true
		overclock_button.text = "HOLD OVERCLOCK · TAP LOCK"
		overclock_button.disabled = not _question_active
		vault_button.text = "RELIC VAULT"


func _update_match_timer(delta: float) -> void:
	if not _question_active:
		return
	_time_remaining_sec = maxf(0.0, _time_remaining_sec - delta)
	var pct: float = (_time_remaining_sec / maxf(1.0, _time_limit_sec)) * 100.0
	chrono_bar.value = pct
	timer_label.text = "%.1fs" % _time_remaining_sec
	timer_label.add_theme_color_override("font_color", Color("#ff5b6e") if _time_remaining_sec <= 5.0 else Color("#e8c474"))
	if _time_remaining_sec <= 0.0:
		_resolve_question({}, veritas_prism.get_peel_tier(), false, 0.0, true)


func _resolve_question(facet: Dictionary, peel_tier: int, overclocked: bool, oc_charge: float, timed_out: bool) -> void:
	_question_active = false
	veritas_prism.interaction_locked = true
	var elapsed: float = _time_limit_sec - _time_remaining_sec
	var eval_facet: Dictionary = {} if timed_out else facet
	var res: Dictionary = TriviaDB.evaluate_answer(_current_question, eval_facet, peel_tier, overclocked, oc_charge, elapsed, _time_limit_sec)

	var correct: bool = bool(res["correct"])
	var backfired: bool = bool(res["backfired"])
	var pts: int = int(res["total_points"])

	if correct:
		_score += pts
		_streak += 1
		AudioSynth.play_verdict_correct(overclocked)
		verdict_title.text = "LOCKED · +%d PTS (%.1fx%s)" % [
			pts,
			float(res["tier_multiplier"]),
			" · OC %.2fx" % float(res["overclock_multiplier"]) if overclocked else "",
		]
		verdict_title.add_theme_color_override("font_color", Color("#58d66b"))
		if overclocked:
			set_speaker_by_id("vance", "Extraordinary nerve. An Overclocked lock under studio pressure—the Council took note.")
		else:
			set_speaker_by_id("nadia", "Clean sightline deduction. Keep that pace up across the remaining venues.")
	else:
		_score = maxi(0, _score + pts)
		_streak = 0
		AudioSynth.play_verdict_wrong(backfired)
		if backfired:
			_cam_shake = 0.24
			_fracture_lighting = true
			lighting_button.text = "FRACTURE"
			verdict_title.text = "OVERCLOCK BACKFIRE · %d PTS · ANS: %s" % [pts, str(res["correct_answer"])]
			set_speaker_by_id("soren", "Overclock backfire! The prism clamps shattered your multiplier—watch the Fracture lighting.")
		elif timed_out:
			verdict_title.text = "CHRONO EXPIRED · ANS: %s" % str(res["correct_answer"])
			set_speaker_by_id("lindqvist", "Hesitation is fatal on the global feed. Lock your sightline before the chrono runs dry.")
		else:
			verdict_title.text = "MISMATCH · CORRECT: %s" % str(res["correct_answer"])
			set_speaker_by_id("teo", "Close decoy—use Peel Crown next time to shatter low-probability distractors.")
		verdict_title.add_theme_color_override("font_color", Color("#ff5b6e"))

	verdict_why.text = str(res["why"])
	verdict_box.visible = true
	_update_action_dock_labels(false)
	_refresh_stats_bar()


func _update_dynamic_lighting(delta: float) -> void:
	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	var venue: Dictionary = venues[_venue_index]
	var accent_col: Color = venue["accent"] as Color
	var rim_col: Color = venue["rim"] as Color
	var fog_col: Color = venue["fog"] as Color

	var target_key: Color = Color("#ff5266") if _fracture_lighting else accent_col.lerp(Color("#fff1d0"), 0.45)
	var target_rim: Color = Color("#e53e51") if _fracture_lighting else rim_col
	var target_bounce: Color = Color("#d92b40") if _fracture_lighting else accent_col
	if _overclock_visual_charge > 0.05:
		target_bounce = target_bounce.lerp(Color("#ffcf52"), _overclock_visual_charge)

	var pulse: float = 0.22 * sin(_time_acc * (5.2 if _fracture_lighting else 1.4))
	key_light.light_color = key_light.light_color.lerp(target_key, minf(1.0, delta * 4.5))
	rim_light.light_color = rim_light.light_color.lerp(target_rim, minf(1.0, delta * 4.5))
	stage_bounce_light.light_color = stage_bounce_light.light_color.lerp(target_bounce, minf(1.0, delta * 5.0))
	stage_bounce_light.light_energy = 1.65 + pulse + _overclock_visual_charge * 2.2

	if world_env.environment != null:
		var target_fog: Color = Color("#1b070c") if _fracture_lighting else fog_col
		world_env.environment.fog_light_color = world_env.environment.fog_light_color.lerp(target_fog, minf(1.0, delta * 3.5))


func _update_camera_motion(delta: float) -> void:
	var sway_x: float = sin(_time_acc * 0.42) * 0.08
	var sway_y: float = cos(_time_acc * 0.31) * 0.04
	var shake_vec: Vector3 = Vector3.ZERO
	if _cam_shake > 0.001:
		shake_vec = Vector3(sin(_time_acc * 83.0), cos(_time_acc * 77.0), 0.0) * _cam_shake
		_cam_shake = lerpf(_cam_shake, 0.0, minf(1.0, delta * 6.5))
	arena_camera.position = _cam_base_pos + Vector3(sway_x, sway_y, 0.0) + shake_vec


func _on_venue_button_pressed() -> void:
	set_venue_by_index(_venue_index + 1, true)
	if MODES[_mode_index] == "OBSERVATORY":
		_enter_observatory_view()
	else:
		_start_new_match()


func _on_mode_button_pressed() -> void:
	_mode_index = posmod(_mode_index + 1, MODES.size())
	AudioSynth.play_brass_snap()
	_start_new_match()


func _on_lighting_button_pressed() -> void:
	_fracture_lighting = not _fracture_lighting
	lighting_button.text = "FRACTURE" if _fracture_lighting else "BROADCAST"
	AudioSynth.play_brass_snap()


func _on_next_question_pressed() -> void:
	AudioSynth.play_horological_click(1.1)
	_question_index += 1
	_present_current_question()


func _on_spin_left_pressed() -> void:
	if veritas_prism.observatory_mode:
		veritas_prism.cycle_relic(-1)
	else:
		veritas_prism.spin_by_steps(-1)


func _on_spin_right_pressed() -> void:
	if veritas_prism.observatory_mode:
		veritas_prism.cycle_relic(1)
	else:
		veritas_prism.spin_by_steps(1)


func _on_cast_cycle_pressed() -> void:
	_cast_index = posmod(_cast_index + 1, CAST_PROFILES.size())
	set_speaker_by_id(str(CAST_PROFILES[_cast_index]["id"]))
	AudioSynth.play_horological_click(1.15)


func _on_peel_button_pressed() -> void:
	if veritas_prism.observatory_mode:
		veritas_prism.cycle_relic(-1)
		return
	veritas_prism.peel_crown()


func _on_overclock_button_down() -> void:
	if veritas_prism.observatory_mode:
		var skin_name: String = veritas_prism.cycle_prism_skin()
		overclock_button.text = "SKIN: %s" % skin_name.to_upper()
		return
	veritas_prism.begin_overclock()


func _on_overclock_button_up() -> void:
	if veritas_prism.observatory_mode:
		return
	veritas_prism.release_overclock()


func _on_vault_button_pressed() -> void:
	AudioSynth.play_brass_snap()
	if veritas_prism.observatory_mode:
		_mode_index = 0
		_start_new_match()
	else:
		_mode_index = MODES.find("OBSERVATORY")
		_start_new_match()


func _on_prism_facet_changed(_facet_index: int, facet_text: String) -> void:
	if veritas_prism.observatory_mode:
		return
	active_facet_label.text = "%s" % facet_text.to_upper()


func _on_prism_peel_triggered(new_tier: int) -> void:
	_update_domain_header(new_tier)
	_update_action_dock_labels(false)

	var clues: Variant = _current_question.get("clues", [])
	var lines: Array[String] = []
	if clues is Array:
		if new_tier >= 2 and clues.size() >= 1:
			lines.append("TIER-2 INTEL: %s" % str(clues[0]))
		if new_tier >= 3 and clues.size() >= 2:
			lines.append("TIER-3 PINPOINT: %s" % str(clues[1]))
	if not lines.is_empty():
		clue_label.text = "\n".join(lines)
		clue_label.visible = true


func _on_prism_overclock_progress(charge: float, active: bool) -> void:
	_overclock_visual_charge = charge if active else 0.0
	if active and charge > 0.02:
		var mult: float = 1.0 + charge
		overclock_button.text = "OVERCLOCKING %.2fx — RELEASE TO LOCK!" % mult
	elif not veritas_prism.observatory_mode:
		overclock_button.text = "HOLD OVERCLOCK · TAP LOCK"


func _on_prism_answer_locked(_facet_index: int, _facet_text: String, peel_tier: int, overclocked: bool, oc_charge: float) -> void:
	if not _question_active:
		return
	_resolve_question(veritas_prism.get_active_facet_dict(), peel_tier, overclocked, oc_charge, false)


func _on_prism_relic_changed(_relic_id: String, relic_title: String, relic_origin: String) -> void:
	active_facet_label.text = "%s · %s" % [relic_title.to_upper(), relic_origin.to_upper()]
	_refresh_stats_bar()


func _build_curved_venue_backdrop() -> void:
	## Builds a smooth curved panoramic cyclorama cylinder arc behind the 3D arena.
	var st: SurfaceTool = SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)

	var radius: float = 10.6
	var height: float = 11.8
	var segs: int = 36
	var arc_rad: float = deg_to_rad(138.0)

	for i: int in range(segs):
		var u0: float = float(i) / float(segs)
		var u1: float = float(i + 1) / float(segs)
		var a0: float = PI + (u0 - 0.5) * arc_rad
		var a1: float = PI + (u1 - 0.5) * arc_rad

		var p00: Vector3 = Vector3(sin(a0) * radius, -height * 0.5, cos(a0) * radius)
		var p10: Vector3 = Vector3(sin(a1) * radius, -height * 0.5, cos(a1) * radius)
		var p01: Vector3 = Vector3(sin(a0) * radius, height * 0.5, cos(a0) * radius)
		var p11: Vector3 = Vector3(sin(a1) * radius, height * 0.5, cos(a1) * radius)

		var n0: Vector3 = Vector3(-sin(a0), 0.0, -cos(a0)).normalized()
		var n1: Vector3 = Vector3(-sin(a1), 0.0, -cos(a1)).normalized()

		st.set_normal(n0); st.set_uv(Vector2(u0, 1.0)); st.add_vertex(p00)
		st.set_normal(n0); st.set_uv(Vector2(u0, 0.0)); st.add_vertex(p01)
		st.set_normal(n1); st.set_uv(Vector2(u1, 0.0)); st.add_vertex(p11)

		st.set_normal(n0); st.set_uv(Vector2(u0, 1.0)); st.add_vertex(p00)
		st.set_normal(n1); st.set_uv(Vector2(u1, 0.0)); st.add_vertex(p11)
		st.set_normal(n1); st.set_uv(Vector2(u1, 1.0)); st.add_vertex(p10)

	venue_backdrop.mesh = st.commit()
	_backdrop_mat = StandardMaterial3D.new()
	_backdrop_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_backdrop_mat.albedo_color = Color(0.76, 0.78, 0.84, 1.0)
	_backdrop_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	venue_backdrop.material_override = _backdrop_mat


func _load_stage_blender_props() -> void:
	# 1. Stage Plinth (Blender .glb or stepped obsidian/brass fallback)
	var plinth_loaded: bool = _instantiate_glb_into(STAGE_PLINTH_GLB, plinth_anchor)
	if not plinth_loaded:
		var mat_obs: StandardMaterial3D = StandardMaterial3D.new()
		mat_obs.albedo_color = Color("#0b101b")
		mat_obs.metallic = 0.32
		mat_obs.roughness = 0.22

		var mat_gold: StandardMaterial3D = StandardMaterial3D.new()
		mat_gold.albedo_color = Color("#d4a853")
		mat_gold.metallic = 0.92
		mat_gold.roughness = 0.24

		var base_cyl: MeshInstance3D = MeshInstance3D.new()
		var cm: CylinderMesh = CylinderMesh.new()
		cm.top_radius = 2.4
		cm.bottom_radius = 2.75
		cm.height = 0.48
		cm.radial_segments = 8
		base_cyl.mesh = cm
		base_cyl.position = Vector3(0.0, -0.24, 0.0)
		base_cyl.material_override = mat_obs
		plinth_anchor.add_child(base_cyl)

		var trim: MeshInstance3D = MeshInstance3D.new()
		var tm: TorusMesh = TorusMesh.new()
		tm.inner_radius = 2.26
		tm.outer_radius = 2.38
		trim.mesh = tm
		trim.position = Vector3(0.0, 0.02, 0.0)
		trim.material_override = mat_gold
		plinth_anchor.add_child(trim)

	# 2. Stage Monolith (Blender .glb or sculptural obsidian/brass aperture fallback)
	var mono_loaded: bool = _instantiate_glb_into(STAGE_MONOLITH_GLB, monolith_anchor)
	if not mono_loaded:
		var frame_mat: StandardMaterial3D = StandardMaterial3D.new()
		frame_mat.albedo_color = Color("#131a29")
		frame_mat.metallic = 0.72
		frame_mat.roughness = 0.26

		var frame: MeshInstance3D = MeshInstance3D.new()
		var fbox: BoxMesh = BoxMesh.new()
		fbox.size = Vector3(1.68, 2.18, 0.16)
		frame.mesh = fbox
		frame.position = Vector3(0.0, 0.12, -0.09)
		frame.material_override = frame_mat
		monolith_anchor.add_child(frame)

	_monolith_screen_mat = StandardMaterial3D.new()
	_monolith_screen_mat.albedo_color = Color(0.88, 0.88, 0.92, 1.0)
	_monolith_screen_mat.emission_enabled = true
	_monolith_screen_mat.emission = Color(0.55, 0.55, 0.62, 1.0)
	_monolith_screen_mat.emission_energy_multiplier = 0.65
	monolith_portrait_screen.material_override = _monolith_screen_mat

	# 3. Optional World Globe Gimbal Rig (loaded if exported by Blender)
	_instantiate_glb_into(WORLD_GLOBE_GLB, globe_anchor)
	globe_anchor.visible = false


func _instantiate_glb_into(glb_path: String, parent_node: Node3D) -> bool:
	if not ResourceLoader.exists(glb_path):
		return false
	var res: Resource = load(glb_path)
	if res is PackedScene:
		var inst: Node = (res as PackedScene).instantiate()
		if inst is Node3D:
			parent_node.add_child(inst)
			return true
	return false


func _apply_sovereign_hud_styles() -> void:
	var glass_panel: StyleBoxFlat = _make_box(Color(0.039, 0.055, 0.092, 0.88), Color(0.831, 0.659, 0.325, 0.58), 2, 14)
	var gold_panel: StyleBoxFlat = _make_box(Color(0.047, 0.068, 0.114, 0.92), Color(0.910, 0.769, 0.455, 0.82), 2, 16)
	top_panel.add_theme_stylebox_override("panel", glass_panel)
	prompt_card.add_theme_stylebox_override("panel", gold_panel)
	sightline_panel.add_theme_stylebox_override("panel", glass_panel)
	dialogue_panel.add_theme_stylebox_override("panel", glass_panel)

	var btn_obsidian: StyleBoxFlat = _make_box(Color(0.075, 0.106, 0.172, 0.94), Color(0.831, 0.659, 0.325, 0.72), 2, 12)
	var btn_hover: StyleBoxFlat = _make_box(Color(0.118, 0.165, 0.255, 0.96), Color(0.969, 0.875, 0.612, 0.95), 2, 12)
	var btn_gold: StyleBoxFlat = _make_box(Color(0.765, 0.569, 0.224, 0.96), Color(0.988, 0.910, 0.690, 1.0), 2, 14)
	var btn_gold_pressed: StyleBoxFlat = _make_box(Color(0.945, 0.745, 0.310, 1.0), Color(1.0, 0.96, 0.84, 1.0), 3, 14)

	for b: Button in [venue_button, mode_button, lighting_button, spin_left_btn, spin_right_btn, cast_cycle_btn, peel_button, vault_button]:
		b.add_theme_stylebox_override("normal", btn_obsidian)
		b.add_theme_stylebox_override("hover", btn_hover)
		b.add_theme_stylebox_override("pressed", btn_gold)
		b.add_theme_color_override("font_color", Color("#f6eed8"))

	for hero_b: Button in [overclock_button, next_button]:
		hero_b.add_theme_stylebox_override("normal", btn_gold)
		hero_b.add_theme_stylebox_override("hover", btn_gold_pressed)
		hero_b.add_theme_stylebox_override("pressed", btn_gold_pressed)
		hero_b.add_theme_color_override("font_color", Color("#0a0e17"))

	var bar_bg: StyleBoxFlat = _make_box(Color(0.08, 0.11, 0.18, 0.95), Color(0.83, 0.66, 0.33, 0.35), 1, 6)
	var bar_fill: StyleBoxFlat = _make_box(Color(0.91, 0.77, 0.45, 1.0), Color(0.98, 0.90, 0.66, 1.0), 0, 6)
	chrono_bar.add_theme_stylebox_override("background", bar_bg)
	chrono_bar.add_theme_stylebox_override("fill", bar_fill)


func _make_box(bg: Color, border: Color, border_px: int, radius: int) -> StyleBoxFlat:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.set_border_width_all(border_px)
	sb.set_corner_radius_all(radius)
	sb.content_margin_left = 14.0
	sb.content_margin_right = 14.0
	sb.content_margin_top = 10.0
	sb.content_margin_bottom = 10.0
	return sb


func _run_self_test() -> void:
	var errors: Array[String] = []
	print("[SELF-TEST] Godot 4.7.2 MainArena live verification starting...")

	# 1. Verify Blender Hero Veritas Prism GLB & exact named nodes
	if not veritas_prism.using_blender_glb:
		errors.append("veritas_prism_hero.glb did not instantiate")
	var model_nodes: Array[String] = []
	if veritas_prism.model_pivot.get_child_count() > 0:
		_collect_node_names(veritas_prism.model_pivot.get_child(0), model_nodes)
	print("[SELF-TEST] Hero Prism GLB=%s nodes=%d (%s)" % [
		str(veritas_prism.using_blender_glb),
		model_nodes.size(),
		", ".join(model_nodes.slice(0, 18)),
	])
	print("[SELF-TEST] Bound Blender nodes: Core_Spindle=%s Crown_Top=%s Crown_Bottom=%s Shutters=%d ClampJaws=%d CalibratorBezel=%s CalibratorNeedle=%s" % [
		str(veritas_prism._core_spindle != null),
		str(veritas_prism._crown_top != null),
		str(veritas_prism._crown_bottom != null),
		veritas_prism._shutters.size(),
		veritas_prism._clamp_jaws.size(),
		str(veritas_prism._calibrator_bezel != null),
		str(veritas_prism._calibrator_needle != null),
	])
	if veritas_prism._core_spindle == null:
		errors.append("Missing Core_Spindle in veritas_prism_hero.glb")
	if veritas_prism._crown_top == null or veritas_prism._crown_bottom == null:
		errors.append("Missing Crown_Top or Crown_Bottom in veritas_prism_hero.glb")
	if veritas_prism._shutters.size() != 4:
		errors.append("Expected 4 Shutter_0..3 nodes, found %d" % veritas_prism._shutters.size())
	if veritas_prism._clamp_jaws.size() != 4:
		errors.append("Expected 4 ClampJaw_0..3 nodes, found %d" % veritas_prism._clamp_jaws.size())

	# 2. Verify Stage Props & World Globe GLBs
	for p: String in [STAGE_PLINTH_GLB, STAGE_MONOLITH_GLB, WORLD_GLOBE_GLB]:
		if not ResourceLoader.exists(p):
			errors.append("Missing stage GLB: %s" % p)

	# 3. Verify all 8 Global Venues + curved backdrop textures
	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	for i: int in range(venues.size()):
		set_venue_by_index(i, false)
		var vpath: String = "res://assets/venues/%s.jpg" % str(venues[i]["code"])
		if not ResourceLoader.exists(vpath):
			errors.append("Missing venue texture: %s" % vpath)
	set_venue_by_index(0, false)

	# 4. Verify all 6 Fortiche portraits
	for prof: Dictionary in CAST_PROFILES:
		set_speaker_by_id(str(prof["id"]))
		if not ResourceLoader.exists(str(prof["portrait"])):
			errors.append("Missing portrait texture: %s" % str(prof["portrait"]))

	# 5. Exercise Spin -> Peel Tier 2 & 3 -> Overclock -> Lock
	veritas_prism.spin_by_steps(1)
	var t2: int = veritas_prism.peel_crown()
	var t3: int = veritas_prism.peel_crown()
	if t2 != 2 or t3 != 3:
		errors.append("Peel tier progression error: %d -> %d" % [t2, t3])
	veritas_prism.begin_overclock()
	await get_tree().process_frame
	veritas_prism.release_overclock()
	await get_tree().process_frame

	# 6. Exercise Observatory Mode across ALL 8 Blender Hero Relics
	veritas_prism.set_observatory_mode(true)
	for r: int in range(VeritasPrism.RELICS.size()):
		veritas_prism.load_relic_by_index(r)
		var rpath: String = str(VeritasPrism.RELICS[r]["path"])
		if not ResourceLoader.exists(rpath):
			errors.append("Missing Hero Relic GLB: %s" % rpath)
	veritas_prism.set_observatory_mode(false)

	# 7. Verify TriviaDatabase Daily UTC & 1M bitset
	var d1: Array[Dictionary] = TriviaDB.select_daily_questions(7)
	var d2: Array[Dictionary] = TriviaDB.select_daily_questions(7)
	if d1.size() < 7 or int(d1[0]["qid"]) != int(d2[0]["qid"]):
		errors.append("Daily UTC determinism failed")
	TriviaDB.mark_seen(999999)
	if not TriviaDB.is_seen(999999):
		errors.append("1M-scale bitset check failed")

	print("[SELF-TEST] TriviaDB: json=%s count=%d daily_utc=%s venues=%d portraits=%d relics=%d" % [
		str(TriviaDB.loaded_from_json),
		TriviaDB.get_question_count(),
		TriviaDB.get_daily_utc_key(),
		venues.size(),
		CAST_PROFILES.size(),
		VeritasPrism.RELICS.size(),
	])

	if errors.is_empty():
		print("[SELF-TEST] PASS — ZERO ERRORS!")
		get_tree().quit(0)
	else:
		for e: String in errors:
			printerr("[SELF-TEST] ERROR: %s" % e)
		get_tree().quit(1)


func _collect_node_names(n: Node, out: Array[String]) -> void:
	out.append(n.name)
	for c: Node in n.get_children():
		_collect_node_names(c, out)
