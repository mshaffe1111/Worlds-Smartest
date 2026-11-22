class_name MainDirector
extends Node3D
## Principal AAA Game Director for World's Smartest (Godot 4.7.2 — WebGL2 Single-Threaded & Android Play Store).
## Integrates:
##  - Sculpted NinePatch PBR UI Pack + Gold Shimmer Shaders + 12 Illustrated Category Medallions + Sculpted Gold Stars
##  - 10 Feature-Film 2.5D Parallax Venues + Live City Weather & Tactile Answer/Streak Particle VFX (VFXJuiceDirector)
##  - Full-Screen Illustrated Graphic-Novel Cutscene Theater (Acts 0..5) + Interactive Conspiracy Evidence Board (Line2D Threads)
##  - Live Reactive Rivals (Expression Cutout Swapping + 76+ Neural VO Banter + Ascending Streak Chimes + 4 Orchestral Scores)
##  - 3D Museum Showcase (Title Veritas Orb, World Circuit Globe w/ Flush Beacons, Boss-Clear Championship Crown Trophy)
##  - Hybrid Tier-1 Bundled + Tier-2 Lazy-Loaded ~1,000,000 Question Shard Engine

enum GameState {
	TITLE,
	CAMPAIGN_HUB,
	CAMPAIGN_GLOBE,
	EVIDENCE_BOARD,
	CATEGORIES_PICKER,
	CUTSCENE,
	INTERVIEW,
	MATCH_PLAY,
	MATCH_SUMMARY,
}

enum MatchPhase {
	IDLE,
	CATEGORY_FORK,
	FINAL_WAGER,
	ACTIVE,
	SUSPENSE_LOCK,
	REVEAL,
	AIRLOCK_CHOICE,
}

const MODE_KEYS: Array[String] = ["CAMPAIGN", "CATEGORIES", "DAILY", "ENDLESS"]
const MODE_LABELS: Array[String] = ["Campaign", "Categories", "Daily", "Endless"]
const MODE_SUBS: Dictionary = {
	"CAMPAIGN": "8 Cities · 40 Rounds · Illustrated Thriller Story",
	"CATEGORIES": "Pick Any of 12 Categories · Custom Difficulty & Length",
	"DAILY": "7-Question Global Broadcast · Shareable Results Card",
	"ENDLESS": "3 Shields · Rising Stakes · Bank or Push Your Luck",
}

const DIFF_PRESETS: Array[String] = ["EASY", "MEDIUM", "HARD", "PROGRESSIVE"]
const LENGTH_PRESETS: Array[int] = [5, 10, 20]
const ENDLESS_TIER_MULTS: Array[float] = [1.0, 1.5, 2.0, 3.0, 4.0]
const LETTER_BADGES: Array[String] = ["A", "B", "C", "D"]
const VANCE_WIN_CLIPS: Array[String] = ["vance_correct_1", "vance_correct_2", "vance_correct_3"]

# Core Visual & Juice Rigs
var stage_rig: CinemaStageRig = null
var artifact_rig: HeroArtifactRig = null
var cam_rig: CinematicCameraRig = null
var vfx_director: Node = null

# Global App State
var state: GameState = GameState.TITLE
var match_phase: MatchPhase = MatchPhase.IDLE
var selected_mode_idx: int = 0
var active_mode: String = "CAMPAIGN"
var active_venue_code: String = "ch"
var hub_selected_city_idx: int = 0
var hub_selected_round_idx: int = 0
var active_mission: Dictionary = {}
var active_city_idx: int = 0
var active_round_idx: int = 0
var _cutscene_after_cb: Callable = Callable()

# Categories Picker Selections
var cat_selected_domains: Array[int] = [] # empty == ALL 12
var cat_selected_diff: String = "MEDIUM"
var cat_selected_count: int = 10

# Active Match State
var match_questions: Array[Dictionary] = []
var match_outcomes: Array[Dictionary] = []
var q_index: int = 0
var current_q: Dictionary = {}
var current_facets: Array[Dictionary] = []
var eliminated_facets: Array[bool] = [false, false, false, false]
var selected_answer_idx: int = -1
var _last_tapped_screen_pos: Vector2 = Vector2(640.0, 460.0)
var run_shuffle_salt: int = 1

var match_score: int = 0
var displayed_score: float = 0.0
var streak: int = 0
var best_streak: int = 0
var shields: int = 3
var endless_depth: int = 0
var endless_banked: int = 0
var endless_unbanked: int = 0
var endless_tier_idx: int = 0

# Lifelines & Variety Twists
var lifelines_5050_left: int = 2
var lifelines_hint_left: int = 2
var used_5050_this_q: bool = false
var used_hint_this_q: bool = false
var wager_2x_armed: bool = false
var final_wager_amount: int = 0
var fork_triggered_this_match: bool = false
var final_wager_triggered_this_match: bool = false
var fork_domain_options: Array[int] = [0, 1]

# Direct Estimate Slider & Codex State
var current_cal_spec: Dictionary = {}
var current_cal_guess: float = 0.0
var cal_small_step: float = 1.0
var cal_big_step: float = 10.0
var codex_spec: Dictionary = {}
var codex_slots: Array[int] = [0, 1, 2]

# Timers & Suspense
var q_time_limit: float = 20.0
var q_time_remaining: float = 20.0
var q_elapsed: float = 0.0
var suspense_timer: float = 0.0
var pending_eval: Dictionary = {}

# Rival Head-to-Head State
var rival_active: bool = false
var rival_id: String = "vance"
var rival_score: int = 0
var rival_acc: float = 0.55
var rival_lock_time: float = 10.0
var rival_locked: bool = false

# Story Interview State
var interview_beats: Array[Dictionary] = []
var interview_idx: int = 0
var interview_decision: Dictionary = {}
var interview_after_callback: Callable = Callable()
var active_portrait_speaker: String = ""
var portrait_base_y: float = 200.0
var _time_acc: float = 0.0
var _web_audio_unlocked: bool = false
var _last_share_text: String = ""
var _is_desktop_layout: bool = false
var _qa_snap_path: String = ""
var _qa_snap_frames: int = 0

# HUD Root Nodes
var hud_layer: CanvasLayer = null
var hud_root: Control = null
var top_scrim: TextureRect = null
var bottom_scrim: TextureRect = null
var portrait_stage: Control = null
var cutout_portrait: TextureRect = null
var cutout_mat: ShaderMaterial = null
var hud_column: Control = null
var safe_margin: SafeMarginContainer = null

# Dedicated Feature Modules
var cutscene_player: CutscenePlayer = null
var evidence_board: EvidenceBoardOverlay = null

# Persistent Outer Top-Right Utility Controls (Title)
var title_utility_bar: HBoxContainer = null
var mute_icon_btn: Button = null

# Screen 1: Title
var title_overlay: Control = null
var title_sub_label: Label = null
var title_play_btn: Button = null
var title_cta_sub: Label = null
var mode_tab_btns: Array[Button] = []

# Screen 2: Campaign Tour Hub
var campaign_hub_overlay: Control = null
var hub_rank_label: Label = null
var hub_city_btns: Array[Button] = []
var hub_round_eyebrow: Label = null
var hub_diff_pill: PanelContainer = null
var hub_diff_label: Label = null
var hub_round_title: Label = null
var hub_goal_label: Label = null
var hub_hook_label: Label = null
var hub_meta_label: Label = null
var hub_star_row: HBoxContainer = null
var hub_start_btn: Button = null
var hub_round_btns: Array[Button] = []
var hub_rival_panel: Control = null
var hub_rival_portrait: TextureRect = null
var hub_rival_name_label: Label = null

# Screen 3: 3D World Globe
var globe_overlay: Control = null
var globe_hub_btns: Array[Button] = []
var globe_city_title: Label = null
var globe_city_desc: Label = null
var globe_enter_btn: Button = null

# Screen 4: Categories Picker
var categories_overlay: Control = null
var cat_all_btn: Button = null
var cat_domain_btns: Array[Button] = []
var cat_domain_grid: GridContainer = null
var cat_scroll: ScrollContainer = null
var cat_diff_btns: Array[Button] = []
var cat_len_btns: Array[Button] = []
var cat_start_btn: Button = null

# Screen 5: Short Voiced Story Interview
var interview_overlay: Control = null
var interview_act_label: Label = null
var speaker_name_label: Label = null
var speaker_role_label: Label = null
var vo_eq_bars: Array[ColorRect] = []
var subtitle_label: Label = null
var choice_stack: VBoxContainer = null
var interview_continue_btn: Button = null

# Screen 6: Unified Broadcast Gameplay HUD
var gameplay_hud: Control = null
var top_venue_label: Label = null
var top_diff_pill: PanelContainer = null
var top_diff_label: Label = null
var top_score_label: Label = null
var top_streak_pill: PanelContainer = null
var top_streak_icon: TextureRect = null
var top_streak_label: Label = null
var top_shields_label: Label = null
var top_sound_btn: Button = null
var chrono_bar: ProgressBar = null
var chrono_time_label: Label = null

var gameplay_stage_hbox: HBoxContainer = null
var tableau_card: PanelContainer = null
var progress_pips_row: HBoxContainer = null
var h2h_label: Label = null
var format_cat_icon: TextureRect = null
var format_tag_label: Label = null
var wager_active_pill: PanelContainer = null
var prompt_label: Label = null
var hint_drawer: PanelContainer = null
var hint_label: Label = null

# Live Desktop Rival Stage beside Unified Tableau
var gameplay_rival_col: VBoxContainer = null
var gameplay_rival_portrait: TextureRect = null
var gameplay_rival_name: Label = null
var gameplay_rival_status: Label = null

# Answer Decks Inside Unified Tableau
var classic_deck: GridContainer = null
var answer_pill_btns: Array[Button] = []

var lightning_deck: VBoxContainer = null
var lightning_false_btn: Button = null
var lightning_myth_btn: Button = null
var lightning_true_btn: Button = null

var estimate_deck: VBoxContainer = null
var estimate_rule_label: Label = null
var estimate_value_label: Label = null
var estimate_min_label: Label = null
var estimate_max_label: Label = null
var calib_slider: HSlider = null
var estimate_nudge_btns: Array[Button] = []
var estimate_lock_btn: Button = null

var codex_deck: VBoxContainer = null
var codex_subject_labels: Array[Label] = []
var codex_target_btns: Array[Button] = []
var codex_lock_btn: Button = null

var fork_deck: VBoxContainer = null
var fork_opt_btns: Array[Button] = []

var final_wager_deck: VBoxContainer = null
var final_wager_sub_label: Label = null
var final_wager_btns: Array[Button] = []

var airlock_deck: VBoxContainer = null
var airlock_stats_label: Label = null

# Lifelines Bar + Reveal Bar
var lifelines_row: HBoxContainer = null
var lifeline_5050_btn: Button = null
var lifeline_hint_btn: Button = null
var lifeline_wager_btn: Button = null

var reveal_panel: PanelContainer = null
var reveal_header_label: Label = null
var reveal_bookmark_btn: Button = null
var reveal_why_label: Label = null
var reveal_next_btn: Button = null

# Screen 7: Results Summary + Settings Modal
var summary_overlay: Control = null
var summary_vbox: VBoxContainer = null
var summary_trophy_spacer: Control = null
var summary_title: Label = null
var summary_star_row: HBoxContainer = null
var summary_score_label: Label = null
var summary_stats_label: Label = null
var summary_hook_label: Label = null
var summary_share_box: PanelContainer = null
var summary_badge_row: HBoxContainer = null
var summary_share_preview: Label = null
var summary_copy_btn: Button = null
var summary_primary_btn: Button = null
var summary_secondary_btn: Button = null

var settings_modal: Control = null
var settings_voice_btn: Button = null
var settings_music_btn: Button = null
var settings_haptics_btn: Button = null


func _ready() -> void:
	_setup_visual_rigs()
	_build_hud_tree()
	get_viewport().size_changed.connect(_update_responsive_layout)
	call_deferred("_update_responsive_layout")

	_enter_title_screen()

	var user_args: PackedStringArray = OS.get_cmdline_user_args()
	if user_args.has("--self-test"):
		call_deferred("_run_self_test")
	else:
		var qa_shot: String = ""
		for arg: String in user_args:
			if arg.begins_with("--qa-shot="):
				qa_shot = arg.substr("--qa-shot=".length()).to_lower()
			elif arg.begins_with("--qa-snap="):
				_qa_snap_path = arg.substr("--qa-snap=".length())
		if not qa_shot.is_empty():
			call_deferred("_apply_qa_shot", qa_shot)
		if not _qa_snap_path.is_empty():
			_qa_snap_frames = 8


func _exit_tree() -> void:
	SovereignTheme.clear_cache()


func _setup_visual_rigs() -> void:
	stage_rig = CinemaStageRig.new()
	stage_rig.name = "CinemaStageRig"
	add_child(stage_rig)

	var hero_vp: SubViewport = stage_rig.get_hero_viewport_root()
	artifact_rig = HeroArtifactRig.new()
	artifact_rig.name = "HeroArtifactRig"
	hero_vp.add_child(artifact_rig)

	cam_rig = CinematicCameraRig.new()
	cam_rig.name = "HeroCamera"
	cam_rig.keep_aspect = Camera3D.KEEP_HEIGHT
	hero_vp.add_child(cam_rig)
	cam_rig.make_current()

	# Dynamically attach VFXJuiceDirector (City Weather Shaders + Radial Particle Bursts!)
	if ResourceLoader.exists("res://scripts/VFXJuiceDirector.gd"):
		var vfx_scr: Script = load("res://scripts/VFXJuiceDirector.gd") as Script
		if vfx_scr != null:
			var inst: Variant = vfx_scr.new()
			if inst is Node:
				vfx_director = inst as Node
				vfx_director.name = "VFXJuiceDirector"
				add_child(vfx_director)


func _set_city_weather(venue_code: String) -> void:
	if vfx_director != null and vfx_director.has_method("set_city_weather"):
		vfx_director.call("set_city_weather", venue_code)


func _vfx_correct_burst(screen_pos: Vector2, cur_streak: int) -> void:
	if vfx_director != null and vfx_director.has_method("play_correct_burst"):
		vfx_director.call("play_correct_burst", screen_pos, cur_streak)


func _vfx_bullseye_burst() -> void:
	if vfx_director != null and vfx_director.has_method("play_bullseye_celebration"):
		vfx_director.call("play_bullseye_celebration")


func _vfx_wrong_pulse() -> void:
	if vfx_director != null and vfx_director.has_method("play_wrong_pulse"):
		vfx_director.call("play_wrong_pulse")


func _set_hero_3d_mode(new_mode: HeroArtifactRig.ArtifactMode, shot: String = "") -> void:
	artifact_rig.set_artifact_mode(new_mode)
	var active_3d: bool = (new_mode != HeroArtifactRig.ArtifactMode.NONE)
	stage_rig.set_hero_3d_enabled(active_3d)
	artifact_rig.interaction_enabled = active_3d
	if active_3d and not shot.is_empty():
		cam_rig.set_shot(shot)


# ==============================================================================
# HUD CONSTRUCTION (SCULPTED NINEPATCH LUXURY THEME — ZERO TOFU GLYPHS!)
# ==============================================================================
func _build_hud_tree() -> void:
	SovereignTheme.ensure_fonts()

	hud_layer = CanvasLayer.new()
	hud_layer.name = "HUDLayer"
	hud_layer.layer = 10
	add_child(hud_layer)
	if vfx_director != null and vfx_director.has_method("bind_shake_target"):
		vfx_director.call("bind_shake_target", hud_layer)

	hud_root = Control.new()
	hud_root.name = "HUDRoot"
	hud_root.set_anchors_preset(Control.PRESET_FULL_RECT)
	hud_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.theme = SovereignTheme.build_root_theme()
	hud_layer.add_child(hud_root)

	top_scrim = TextureRect.new()
	top_scrim.name = "TopScrim"
	top_scrim.set_anchors_preset(Control.PRESET_TOP_WIDE)
	top_scrim.offset_bottom = 320.0
	top_scrim.texture = SovereignTheme.make_vertical_scrim_texture(0.76, 0.0)
	top_scrim.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	top_scrim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(top_scrim)

	bottom_scrim = TextureRect.new()
	bottom_scrim.name = "BottomScrim"
	bottom_scrim.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	bottom_scrim.offset_top = -780.0
	bottom_scrim.texture = SovereignTheme.make_vertical_scrim_texture(0.0, 0.90)
	bottom_scrim.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bottom_scrim.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(bottom_scrim)

	# Full-screen Interview Cutout Stage
	portrait_stage = Control.new()
	portrait_stage.name = "PortraitStage"
	portrait_stage.set_anchors_preset(Control.PRESET_FULL_RECT)
	portrait_stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	portrait_stage.visible = false
	hud_root.add_child(portrait_stage)

	cutout_portrait = TextureRect.new()
	cutout_portrait.name = "CutoutPortraitRect"
	cutout_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	cutout_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	cutout_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cutout_mat = SovereignTheme.make_cutout_feather_material()
	cutout_portrait.material = cutout_mat
	portrait_stage.add_child(cutout_portrait)

	# Outer Top-Right Title Utility Bar (MENU / SOUND)
	title_utility_bar = HBoxContainer.new()
	title_utility_bar.name = "TitleUtilityBar"
	title_utility_bar.set_anchors_preset(Control.PRESET_TOP_WIDE)
	title_utility_bar.offset_top = 36.0
	title_utility_bar.offset_bottom = 132.0
	title_utility_bar.offset_left = 36.0
	title_utility_bar.offset_right = -36.0
	title_utility_bar.alignment = BoxContainer.ALIGNMENT_END
	title_utility_bar.add_theme_constant_override("separation", 12)
	title_utility_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(title_utility_bar)

	var gear_btn: Button = Button.new()
	gear_btn.text = "MENU"
	gear_btn.custom_minimum_size = Vector2(132, 82)
	gear_btn.add_theme_font_size_override("font_size", 28)
	SovereignTheme.style_ghost_icon_button(gear_btn)
	gear_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	gear_btn.pressed.connect(_open_settings_modal)
	title_utility_bar.add_child(gear_btn)

	mute_icon_btn = Button.new()
	mute_icon_btn.text = "SOUND"
	mute_icon_btn.custom_minimum_size = Vector2(142, 82)
	mute_icon_btn.add_theme_font_size_override("font_size", 28)
	SovereignTheme.style_ghost_icon_button(mute_icon_btn)
	mute_icon_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	mute_icon_btn.pressed.connect(_on_toggle_mute)
	title_utility_bar.add_child(mute_icon_btn)

	# Responsive HUD Column
	hud_column = Control.new()
	hud_column.name = "HUDColumn"
	hud_column.set_anchors_preset(Control.PRESET_FULL_RECT)
	hud_column.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hud_root.add_child(hud_column)

	safe_margin = SafeMarginContainer.new()
	safe_margin.name = "SafeMargin"
	safe_margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	hud_column.add_child(safe_margin)

	var host: Control = Control.new()
	host.name = "OverlayHost"
	host.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	host.size_flags_vertical = Control.SIZE_EXPAND_FILL
	host.mouse_filter = Control.MOUSE_FILTER_IGNORE
	safe_margin.add_child(host)

	_build_title_overlay(host)
	_build_campaign_hub_overlay(host)
	_build_globe_overlay(host)
	_build_categories_overlay(host)
	_build_interview_overlay(host)
	_build_gameplay_hud(host)
	_build_summary_overlay(host)

	# Interactive Conspiracy Evidence Board inside OverlayHost
	evidence_board = EvidenceBoardOverlay.new()
	evidence_board.back_requested.connect(_enter_campaign_hub)
	evidence_board.replay_cutscene_requested.connect(_on_replay_act_cutscene)
	host.add_child(evidence_board)

	# Full-Bleed Graphic-Novel Cutscene Theater above HUD Column
	cutscene_player = CutscenePlayer.new()
	cutscene_player.cutscene_finished.connect(_on_cutscene_finished)
	hud_root.add_child(cutscene_player)
	cutscene_player.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	_build_settings_modal(hud_root)


func _build_title_overlay(parent: Control) -> void:
	title_overlay = Control.new()
	title_overlay.name = "TitleOverlay"
	title_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	title_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(title_overlay)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_theme_constant_override("separation", 10)
	title_overlay.add_child(vbox)

	var top_pad: Control = Control.new()
	top_pad.custom_minimum_size = Vector2(0, 56)
	top_pad.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(top_pad)

	var eyebrow: Label = Label.new()
	eyebrow.text = "—  THE $100M GLOBAL CHAMPIONSHIP  —"
	eyebrow.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	eyebrow.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	eyebrow.add_theme_font_size_override("font_size", 28)
	eyebrow.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	eyebrow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(eyebrow)

	var wordmark: Label = Label.new()
	wordmark.text = "WORLD'S SMARTEST"
	wordmark.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	wordmark.add_theme_font_override("font", SovereignTheme.font_serif(true))
	wordmark.add_theme_font_size_override("font_size", 80)
	wordmark.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	wordmark.add_theme_color_override("font_shadow_color", Color(0.0, 0.0, 0.0, 0.82))
	wordmark.add_theme_constant_override("shadow_offset_y", 6)
	wordmark.add_theme_constant_override("shadow_outline_size", 4)
	wordmark.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(wordmark)

	title_sub_label = Label.new()
	title_sub_label.text = "Geneva · The Vetting Chamber"
	title_sub_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_sub_label.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
	title_sub_label.add_theme_font_size_override("font_size", 30)
	title_sub_label.add_theme_color_override("font_color", Color(0.96, 0.94, 0.90, 0.92))
	title_sub_label.add_theme_color_override("font_shadow_color", Color(0.0, 0.0, 0.0, 0.72))
	title_sub_label.add_theme_constant_override("shadow_offset_y", 3)
	title_sub_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(title_sub_label)

	var open_stage: Control = Control.new()
	open_stage.size_flags_vertical = Control.SIZE_EXPAND_FILL
	open_stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(open_stage)

	var cta_center: CenterContainer = CenterContainer.new()
	cta_center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	title_play_btn = Button.new()
	title_play_btn.name = "TitlePlayCTA"
	title_play_btn.text = "PLAY CAMPAIGN"
	title_play_btn.custom_minimum_size = Vector2(640, 134)
	title_play_btn.add_theme_font_size_override("font_size", 42)
	SovereignTheme.style_primary_gold_cta(title_play_btn, true)
	title_play_btn.pressed.connect(_on_title_play_pressed)
	cta_center.add_child(title_play_btn)
	vbox.add_child(cta_center)

	title_cta_sub = Label.new()
	title_cta_sub.text = MODE_SUBS["CAMPAIGN"]
	title_cta_sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_cta_sub.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	title_cta_sub.add_theme_font_size_override("font_size", 28)
	title_cta_sub.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	title_cta_sub.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(title_cta_sub)

	var ribbon_center: CenterContainer = CenterContainer.new()
	ribbon_center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var ribbon_panel: PanelContainer = PanelContainer.new()
	ribbon_panel.custom_minimum_size = Vector2(940, 104)
	ribbon_panel.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(14.0, 8.0))
	var tab_row: HBoxContainer = HBoxContainer.new()
	tab_row.add_theme_constant_override("separation", 8)
	ribbon_panel.add_child(tab_row)

	mode_tab_btns.clear()
	for i: int in range(MODE_KEYS.size()):
		var tb: Button = Button.new()
		tb.text = MODE_LABELS[i]
		tb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		tb.custom_minimum_size = Vector2(0, 84)
		tb.add_theme_font_size_override("font_size", 32)
		var captured_i: int = i
		tb.pressed.connect(func() -> void: _on_mode_tab_pressed(captured_i))
		tab_row.add_child(tb)
		mode_tab_btns.append(tb)
	ribbon_center.add_child(ribbon_panel)
	vbox.add_child(ribbon_center)


func _build_campaign_hub_overlay(parent: Control) -> void:
	campaign_hub_overlay = Control.new()
	campaign_hub_overlay.name = "CampaignHubOverlay"
	campaign_hub_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	campaign_hub_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	campaign_hub_overlay.visible = false
	parent.add_child(campaign_hub_overlay)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_theme_constant_override("separation", 12)
	campaign_hub_overlay.add_child(vbox)

	# Top Bar: < | Premise | DOSSIER | GLOBE
	var top: HBoxContainer = HBoxContainer.new()
	top.add_theme_constant_override("separation", 10)
	var back_btn: Button = Button.new()
	back_btn.text = "<"
	back_btn.custom_minimum_size = Vector2(80, 82)
	back_btn.add_theme_font_size_override("font_size", 34)
	SovereignTheme.style_ghost_icon_button(back_btn)
	back_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	back_btn.pressed.connect(_enter_title_screen)
	top.add_child(back_btn)

	var title_col: VBoxContainer = VBoxContainer.new()
	title_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_col.add_theme_constant_override("separation", 2)
	var premise_hdr: Label = Label.new()
	premise_hdr.text = "THE $100M WORLD'S SMARTEST CHAMPIONSHIP"
	premise_hdr.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	premise_hdr.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	premise_hdr.add_theme_font_override("font", SovereignTheme.font_serif(true))
	premise_hdr.add_theme_font_size_override("font_size", 28)
	premise_hdr.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	title_col.add_child(premise_hdr)

	var premise_sub: Label = Label.new()
	premise_sub.text = "Conquer 8 Cities (40 Rounds), Outsmart 5 Rivals, Expose the Conspiracy."
	premise_sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	premise_sub.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	premise_sub.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	premise_sub.add_theme_font_size_override("font_size", 22)
	premise_sub.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	title_col.add_child(premise_sub)
	top.add_child(title_col)

	var dossier_btn: Button = Button.new()
	dossier_btn.name = "HubDossierBtn"
	dossier_btn.text = "DOSSIER"
	dossier_btn.custom_minimum_size = Vector2(142, 82)
	dossier_btn.add_theme_font_size_override("font_size", 24)
	SovereignTheme.style_answer_pill(dossier_btn, "focused")
	dossier_btn.pressed.connect(_enter_evidence_board)
	top.add_child(dossier_btn)

	var globe_btn: Button = Button.new()
	globe_btn.text = "GLOBE"
	globe_btn.custom_minimum_size = Vector2(124, 82)
	globe_btn.add_theme_font_size_override("font_size", 24)
	SovereignTheme.style_answer_pill(globe_btn, "normal")
	globe_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	globe_btn.pressed.connect(_enter_campaign_globe)
	top.add_child(globe_btn)
	vbox.add_child(top)

	# Progress Strip
	var prog_panel: PanelContainer = PanelContainer.new()
	prog_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	prog_panel.add_theme_stylebox_override("panel", SovereignTheme.make_ribbon_style(22.0, 12.0))
	hub_rank_label = Label.new()
	hub_rank_label.text = "RANK: ROOKIE  ·  STARS: 0 / 120  ·  CITY 1 OF 8 · GENEVA"
	hub_rank_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hub_rank_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_rank_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hub_rank_label.add_theme_font_override("font", SovereignTheme.font_mono())
	hub_rank_label.add_theme_font_size_override("font_size", 24)
	hub_rank_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	prog_panel.add_child(hub_rank_label)
	vbox.add_child(prog_panel)

	# 8-City Tour Selector Bar
	var city_scroll: ScrollContainer = ScrollContainer.new()
	city_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	city_scroll.clip_contents = true
	city_scroll.custom_minimum_size = Vector2(0, 106)
	city_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	var city_row: HBoxContainer = HBoxContainer.new()
	city_row.add_theme_constant_override("separation", 10)
	city_scroll.add_child(city_row)
	hub_city_btns.clear()
	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	for i: int in range(venues.size()):
		var cb: Button = Button.new()
		cb.custom_minimum_size = Vector2(204, 94)
		cb.add_theme_font_size_override("font_size", 24)
		var captured_idx: int = i
		cb.pressed.connect(func() -> void: _select_hub_city(captured_idx))
		city_row.add_child(cb)
		hub_city_btns.append(cb)
	vbox.add_child(city_scroll)

	# Center Hero Stage
	var mid_center: Control = Control.new()
	mid_center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid_center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(mid_center)

	var mid_hbox: HBoxContainer = HBoxContainer.new()
	mid_hbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	mid_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	mid_hbox.add_theme_constant_override("separation", 24)
	mid_hbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mid_center.add_child(mid_hbox)

	var hero_wrap: VBoxContainer = VBoxContainer.new()
	hero_wrap.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hero_wrap.size_flags_stretch_ratio = 1.65
	hero_wrap.alignment = BoxContainer.ALIGNMENT_CENTER
	hero_wrap.add_theme_constant_override("separation", 14)
	mid_hbox.add_child(hero_wrap)

	var hero_card: PanelContainer = PanelContainer.new()
	hero_card.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(40.0, 34.0))
	hero_wrap.add_child(hero_card)

	var hc_box: VBoxContainer = VBoxContainer.new()
	hc_box.add_theme_constant_override("separation", 14)
	hero_card.add_child(hc_box)

	var hc_top: HBoxContainer = HBoxContainer.new()
	hc_top.add_theme_constant_override("separation", 12)
	hub_round_eyebrow = Label.new()
	hub_round_eyebrow.text = "CITY 1 · GENEVA  ·  ROUND 1 OF 5"
	hub_round_eyebrow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hub_round_eyebrow.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_round_eyebrow.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	hub_round_eyebrow.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	hub_round_eyebrow.add_theme_font_size_override("font_size", 28)
	hub_round_eyebrow.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	hc_top.add_child(hub_round_eyebrow)

	hub_diff_pill = PanelContainer.new()
	hub_diff_label = Label.new()
	hub_diff_label.text = "EASY"
	hub_diff_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	hub_diff_label.add_theme_font_size_override("font_size", 26)
	hub_diff_pill.add_child(hub_diff_label)
	hc_top.add_child(hub_diff_pill)
	hc_box.add_child(hc_top)

	hub_round_title = Label.new()
	hub_round_title.text = "THE QUALIFIER — Welcome to Geneva"
	hub_round_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_round_title.add_theme_font_override("font", SovereignTheme.font_serif(true))
	hub_round_title.add_theme_font_size_override("font_size", 42)
	hub_round_title.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	hc_box.add_child(hub_round_title)

	var goal_pill: PanelContainer = PanelContainer.new()
	goal_pill.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(Color(0.06, 0.24, 0.17, 0.90), Color("#3ee89e"), 14, 2, 18, 10))
	hub_goal_label = Label.new()
	hub_goal_label.text = "GOAL: Get 3 of 5 right to advance to Round 2"
	hub_goal_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_goal_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	hub_goal_label.add_theme_font_size_override("font_size", 28)
	hub_goal_label.add_theme_color_override("font_color", Color("#e6fff4"))
	goal_pill.add_child(hub_goal_label)
	hc_box.add_child(goal_pill)

	hub_hook_label = Label.new()
	hub_hook_label.text = "Prove you belong in the $100M Championship with crisp classic trivia."
	hub_hook_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_hook_label.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	hub_hook_label.add_theme_font_size_override("font_size", 28)
	hub_hook_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	hc_box.add_child(hub_hook_label)

	var meta_row: HBoxContainer = HBoxContainer.new()
	meta_row.add_theme_constant_override("separation", 12)
	hub_meta_label = Label.new()
	hub_meta_label.text = "5 Questions · 22s Timer · Classic 4-Choice"
	hub_meta_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hub_meta_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_meta_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	hub_meta_label.add_theme_font_override("font", SovereignTheme.font_mono())
	hub_meta_label.add_theme_font_size_override("font_size", 24)
	hub_meta_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	meta_row.add_child(hub_meta_label)

	hub_star_row = HBoxContainer.new()
	hub_star_row.add_theme_constant_override("separation", 8)
	meta_row.add_child(hub_star_row)
	hc_box.add_child(meta_row)

	hub_start_btn = Button.new()
	hub_start_btn.name = "HubStartRoundBtn"
	hub_start_btn.text = "START ROUND >"
	hub_start_btn.custom_minimum_size = Vector2(0, 126)
	hub_start_btn.add_theme_font_size_override("font_size", 42)
	SovereignTheme.style_primary_gold_cta(hub_start_btn, false)
	hub_start_btn.pressed.connect(_on_hub_start_round)
	hc_box.add_child(hub_start_btn)

	# 5-Round Selector Strip with Sculpted Mini-Star Indicators (ZERO ASCII --- / **_)
	var round_row: HBoxContainer = HBoxContainer.new()
	round_row.add_theme_constant_override("separation", 10)
	hub_round_btns.clear()
	for r: int in range(5):
		var rb: Button = Button.new()
		rb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		rb.custom_minimum_size = Vector2(0, 92)
		rb.add_theme_font_size_override("font_size", 24)
		var cap_r: int = r
		rb.pressed.connect(func() -> void: _select_hub_round(cap_r))
		round_row.add_child(rb)
		hub_round_btns.append(rb)
	hero_wrap.add_child(round_row)

	# Desktop Rival Portrait Side Panel
	hub_rival_panel = VBoxContainer.new()
	hub_rival_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hub_rival_panel.size_flags_stretch_ratio = 0.72
	hub_rival_panel.alignment = BoxContainer.ALIGNMENT_CENTER
	hub_rival_panel.add_theme_constant_override("separation", 6)
	hub_rival_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	mid_hbox.add_child(hub_rival_panel)

	hub_rival_portrait = TextureRect.new()
	hub_rival_portrait.custom_minimum_size = Vector2(340, 440)
	hub_rival_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hub_rival_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hub_rival_portrait.material = SovereignTheme.make_cutout_feather_material()
	hub_rival_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hub_rival_panel.add_child(hub_rival_portrait)

	var rv_plate: PanelContainer = PanelContainer.new()
	rv_plate.add_theme_stylebox_override("panel", SovereignTheme.make_ribbon_style(20.0, 12.0))
	hub_rival_name_label = Label.new()
	hub_rival_name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hub_rival_name_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hub_rival_name_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	hub_rival_name_label.add_theme_font_size_override("font_size", 26)
	hub_rival_name_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	rv_plate.add_child(hub_rival_name_label)
	hub_rival_panel.add_child(rv_plate)


func _build_globe_overlay(parent: Control) -> void:
	globe_overlay = Control.new()
	globe_overlay.name = "CampaignGlobeOverlay"
	globe_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	globe_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	globe_overlay.visible = false
	parent.add_child(globe_overlay)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_theme_constant_override("separation", 12)
	globe_overlay.add_child(vbox)

	var top: HBoxContainer = HBoxContainer.new()
	top.add_theme_constant_override("separation", 12)
	var back_btn: Button = Button.new()
	back_btn.text = "< TOUR HUB"
	back_btn.custom_minimum_size = Vector2(180, 82)
	back_btn.add_theme_font_size_override("font_size", 28)
	SovereignTheme.style_ghost_icon_button(back_btn)
	back_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	back_btn.pressed.connect(_enter_campaign_hub)
	top.add_child(back_btn)

	globe_city_title = Label.new()
	globe_city_title.text = "WORLD CIRCUIT GLOBE · GENEVA"
	globe_city_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	globe_city_title.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	globe_city_title.add_theme_font_override("font", SovereignTheme.font_serif(true))
	globe_city_title.add_theme_font_size_override("font_size", 36)
	globe_city_title.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	top.add_child(globe_city_title)
	vbox.add_child(top)

	var hub_scroll: ScrollContainer = ScrollContainer.new()
	hub_scroll.custom_minimum_size = Vector2(0, 82)
	hub_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	var hub_row: HBoxContainer = HBoxContainer.new()
	hub_row.add_theme_constant_override("separation", 10)
	hub_scroll.add_child(hub_row)
	globe_hub_btns.clear()
	for i: int in range(TriviaDB.get_venue_list().size()):
		var v: Dictionary = TriviaDB.get_venue_by_index(i)
		var hb: Button = Button.new()
		hb.text = str(v["short"]).to_upper()
		hb.custom_minimum_size = Vector2(146, 72)
		hb.add_theme_font_size_override("font_size", 26)
		var cap_i: int = i
		hb.pressed.connect(func() -> void: _select_globe_city(cap_i))
		hub_row.add_child(hb)
		globe_hub_btns.append(hb)
	vbox.add_child(hub_scroll)

	var open_globe: Control = Control.new()
	open_globe.size_flags_vertical = Control.SIZE_EXPAND_FILL
	open_globe.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(open_globe)

	var foot: PanelContainer = PanelContainer.new()
	foot.add_theme_stylebox_override("panel", SovereignTheme.make_ribbon_style(28.0, 18.0))
	var fbox: VBoxContainer = VBoxContainer.new()
	fbox.add_theme_constant_override("separation", 12)
	foot.add_child(fbox)

	globe_city_desc = Label.new()
	globe_city_desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	globe_city_desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	globe_city_desc.add_theme_font_size_override("font_size", 28)
	globe_city_desc.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	fbox.add_child(globe_city_desc)

	globe_enter_btn = Button.new()
	globe_enter_btn.text = "OPEN CITY IN CAMPAIGN HUB >"
	globe_enter_btn.custom_minimum_size = Vector2(0, 112)
	globe_enter_btn.add_theme_font_size_override("font_size", 36)
	SovereignTheme.style_primary_gold_cta(globe_enter_btn, false)
	globe_enter_btn.pressed.connect(_enter_campaign_hub)
	fbox.add_child(globe_enter_btn)
	vbox.add_child(foot)


func _build_categories_overlay(parent: Control) -> void:
	categories_overlay = Control.new()
	categories_overlay.name = "CategoriesOverlay"
	categories_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	categories_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	categories_overlay.visible = false
	parent.add_child(categories_overlay)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 14)
	categories_overlay.add_child(vbox)

	var top: HBoxContainer = HBoxContainer.new()
	top.add_theme_constant_override("separation", 12)
	var back_btn: Button = Button.new()
	back_btn.text = "< TITLE"
	back_btn.custom_minimum_size = Vector2(150, 82)
	back_btn.add_theme_font_size_override("font_size", 28)
	SovereignTheme.style_ghost_icon_button(back_btn)
	back_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	back_btn.pressed.connect(_enter_title_screen)
	top.add_child(back_btn)

	var hdr_col: VBoxContainer = VBoxContainer.new()
	hdr_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var hdr: Label = Label.new()
	hdr.text = "PICK YOUR TRIVIA CATEGORIES"
	hdr.add_theme_font_override("font", SovereignTheme.font_serif(true))
	hdr.add_theme_font_size_override("font_size", 36)
	hdr.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	hdr_col.add_child(hdr)

	var sub: Label = Label.new()
	sub.text = "Tap any topics below, choose your difficulty & length, and play!"
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sub.add_theme_font_size_override("font_size", 24)
	sub.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	hdr_col.add_child(sub)
	top.add_child(hdr_col)
	vbox.add_child(top)

	cat_all_btn = Button.new()
	cat_all_btn.text = "ALL CATEGORIES (MIXED · %s Qs)" % ShareClipboard.format_commas(TriviaDB.get_total_playable_count())
	cat_all_btn.custom_minimum_size = Vector2(0, 82)
	cat_all_btn.add_theme_font_size_override("font_size", 30)
	cat_all_btn.pressed.connect(_on_cat_all_pressed)
	vbox.add_child(cat_all_btn)

	# Tightly fitted ScrollContainer (no cavernous empty gap on Desktop 1280x800 per #96 polish #3!)
	cat_scroll = ScrollContainer.new()
	cat_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(cat_scroll)

	cat_domain_grid = GridContainer.new()
	cat_domain_grid.columns = 2
	cat_domain_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cat_domain_grid.add_theme_constant_override("h_separation", 14)
	cat_domain_grid.add_theme_constant_override("v_separation", 12)
	cat_scroll.add_child(cat_domain_grid)

	var counts: Dictionary = TriviaDB.get_combined_domain_counts()
	cat_domain_btns.clear()
	for i: int in range(12):
		var dm: Dictionary = TriviaDB.get_domain_meta(i)
		var b: Button = Button.new()
		b.text = "%s\n%s Qs" % [str(dm["name"]), ShareClipboard.format_commas(int(counts.get(i, 0)))]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 114)
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		b.add_theme_font_size_override("font_size", 26)
		var ico: Texture2D = SovereignTheme.load_category_icon_sized(i, 58)
		if ico != null:
			b.icon = ico
			b.expand_icon = false
			b.add_theme_constant_override("h_separation", 14)
		var cap_i: int = i
		b.pressed.connect(func() -> void: _on_cat_domain_toggled(cap_i))
		cat_domain_grid.add_child(b)
		cat_domain_btns.append(b)

	var dock_card: PanelContainer = PanelContainer.new()
	dock_card.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(34.0, 26.0))
	var dbox: VBoxContainer = VBoxContainer.new()
	dbox.add_theme_constant_override("separation", 12)
	dock_card.add_child(dbox)

	var diff_row: HBoxContainer = HBoxContainer.new()
	diff_row.add_theme_constant_override("separation", 10)
	var d_lbl: Label = Label.new()
	d_lbl.text = "DIFFICULTY:"
	d_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	d_lbl.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	d_lbl.add_theme_font_size_override("font_size", 24)
	d_lbl.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	diff_row.add_child(d_lbl)
	cat_diff_btns.clear()
	for dp: String in DIFF_PRESETS:
		var db: Button = Button.new()
		db.text = dp
		db.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		db.custom_minimum_size = Vector2(0, 72)
		db.add_theme_font_size_override("font_size", 24)
		var cap_dp: String = dp
		db.pressed.connect(func() -> void:
			AudioDirector.play_ui_click()
			cat_selected_diff = cap_dp
			_refresh_categories_ui()
		)
		diff_row.add_child(db)
		cat_diff_btns.append(db)
	dbox.add_child(diff_row)

	var len_row: HBoxContainer = HBoxContainer.new()
	len_row.add_theme_constant_override("separation", 10)
	var l_lbl: Label = Label.new()
	l_lbl.text = "LENGTH:"
	l_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l_lbl.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	l_lbl.add_theme_font_size_override("font_size", 24)
	l_lbl.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	len_row.add_child(l_lbl)
	cat_len_btns.clear()
	for lp: int in LENGTH_PRESETS:
		var lb: Button = Button.new()
		lb.text = "%d Qs" % lp
		lb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		lb.custom_minimum_size = Vector2(0, 72)
		lb.add_theme_font_size_override("font_size", 26)
		var cap_lp: int = lp
		lb.pressed.connect(func() -> void:
			AudioDirector.play_ui_click()
			cat_selected_count = cap_lp
			_refresh_categories_ui()
		)
		len_row.add_child(lb)
		cat_len_btns.append(lb)
	dbox.add_child(len_row)

	cat_start_btn = Button.new()
	cat_start_btn.name = "CatStartTriviaBtn"
	cat_start_btn.text = "START TRIVIA >"
	cat_start_btn.custom_minimum_size = Vector2(0, 118)
	cat_start_btn.add_theme_font_size_override("font_size", 38)
	SovereignTheme.style_primary_gold_cta(cat_start_btn, false)
	cat_start_btn.pressed.connect(_on_cat_start_pressed)
	dbox.add_child(cat_start_btn)
	vbox.add_child(dock_card)


func _build_interview_overlay(parent: Control) -> void:
	interview_overlay = Control.new()
	interview_overlay.name = "InterviewOverlay"
	interview_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	interview_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	interview_overlay.visible = false
	parent.add_child(interview_overlay)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_theme_constant_override("separation", 12)
	interview_overlay.add_child(vbox)

	var top: HBoxContainer = HBoxContainer.new()
	var pause_btn: Button = Button.new()
	pause_btn.text = "II"
	pause_btn.custom_minimum_size = Vector2(100, 92)
	pause_btn.add_theme_font_size_override("font_size", 32)
	SovereignTheme.style_ghost_icon_button(pause_btn)
	pause_btn.pressed.connect(_open_settings_modal)
	top.add_child(pause_btn)

	interview_act_label = Label.new()
	interview_act_label.text = "GENEVA · ROUND 1"
	interview_act_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	interview_act_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	interview_act_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	interview_act_label.add_theme_font_size_override("font_size", 30)
	interview_act_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	top.add_child(interview_act_label)

	var skip_btn: Button = Button.new()
	skip_btn.text = "SKIP >"
	skip_btn.custom_minimum_size = Vector2(160, 84)
	skip_btn.add_theme_font_size_override("font_size", 30)
	SovereignTheme.style_ghost_icon_button(skip_btn)
	skip_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	skip_btn.pressed.connect(_skip_interview_to_match)
	top.add_child(skip_btn)
	vbox.add_child(top)

	var stage_spacer: Control = Control.new()
	stage_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	stage_spacer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(stage_spacer)

	var dlg_panel: PanelContainer = PanelContainer.new()
	dlg_panel.add_theme_stylebox_override("panel", SovereignTheme.make_dialogue_style(28.0, 22.0))
	vbox.add_child(dlg_panel)

	var dlg_box: VBoxContainer = VBoxContainer.new()
	dlg_box.add_theme_constant_override("separation", 14)
	dlg_panel.add_child(dlg_box)

	var name_row: HBoxContainer = HBoxContainer.new()
	name_row.add_theme_constant_override("separation", 14)
	var gold_bar: ColorRect = ColorRect.new()
	gold_bar.color = SovereignTheme.GOLD_CHAMPAGNE
	gold_bar.custom_minimum_size = Vector2(6, 52)
	name_row.add_child(gold_bar)

	var name_col: VBoxContainer = VBoxContainer.new()
	name_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	speaker_name_label = Label.new()
	speaker_name_label.text = "JULIAN VANCE"
	speaker_name_label.add_theme_font_override("font", SovereignTheme.font_serif(true))
	speaker_name_label.add_theme_font_size_override("font_size", 36)
	speaker_name_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	name_col.add_child(speaker_name_label)

	speaker_role_label = Label.new()
	speaker_role_label.text = "Championship Host"
	speaker_role_label.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
	speaker_role_label.add_theme_font_size_override("font_size", 28)
	speaker_role_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	name_col.add_child(speaker_role_label)
	name_row.add_child(name_col)

	var eq_box: HBoxContainer = HBoxContainer.new()
	eq_box.alignment = BoxContainer.ALIGNMENT_END
	eq_box.add_theme_constant_override("separation", 6)
	vo_eq_bars.clear()
	for _i: int in range(3):
		var bar: ColorRect = ColorRect.new()
		bar.color = SovereignTheme.GOLD_CHAMPAGNE
		bar.custom_minimum_size = Vector2(8, 14)
		bar.size_flags_vertical = Control.SIZE_SHRINK_END
		eq_box.add_child(bar)
		vo_eq_bars.append(bar)
	name_row.add_child(eq_box)
	dlg_box.add_child(name_row)

	subtitle_label = Label.new()
	subtitle_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	subtitle_label.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	subtitle_label.add_theme_font_size_override("font_size", 38)
	subtitle_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	dlg_box.add_child(subtitle_label)

	choice_stack = VBoxContainer.new()
	choice_stack.add_theme_constant_override("separation", 12)
	dlg_box.add_child(choice_stack)

	interview_continue_btn = Button.new()
	interview_continue_btn.text = "BEGIN ROUND >"
	interview_continue_btn.custom_minimum_size = Vector2(0, 118)
	interview_continue_btn.add_theme_font_size_override("font_size", 38)
	SovereignTheme.style_primary_gold_cta(interview_continue_btn, false)
	interview_continue_btn.pressed.connect(_advance_interview_beat)
	dlg_box.add_child(interview_continue_btn)


func _build_gameplay_hud(parent: Control) -> void:
	gameplay_hud = Control.new()
	gameplay_hud.name = "GameplayHUD"
	gameplay_hud.set_anchors_preset(Control.PRESET_FULL_RECT)
	gameplay_hud.mouse_filter = Control.MOUSE_FILTER_IGNORE
	gameplay_hud.visible = false
	parent.add_child(gameplay_hud)

	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_theme_constant_override("separation", 12)
	gameplay_hud.add_child(vbox)

	# 1. FULL-WIDTH TOP BROADCAST BAR
	var top_bar: PanelContainer = PanelContainer.new()
	top_bar.add_theme_stylebox_override("panel", SovereignTheme.make_ribbon_style(22.0, 14.0))
	var top_vb: VBoxContainer = VBoxContainer.new()
	top_vb.add_theme_constant_override("separation", 8)
	top_bar.add_child(top_vb)

	var top_row: HBoxContainer = HBoxContainer.new()
	top_row.add_theme_constant_override("separation", 12)

	var pause_btn: Button = Button.new()
	pause_btn.text = "II"
	pause_btn.custom_minimum_size = Vector2(82, 72)
	pause_btn.add_theme_font_size_override("font_size", 30)
	SovereignTheme.style_ghost_icon_button(pause_btn)
	pause_btn.pressed.connect(_open_settings_modal)
	top_row.add_child(pause_btn)

	top_venue_label = Label.new()
	top_venue_label.text = "GENEVA · ROUND 1"
	top_venue_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	top_venue_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	top_venue_label.add_theme_font_size_override("font_size", 30)
	top_venue_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	top_row.add_child(top_venue_label)

	top_diff_pill = PanelContainer.new()
	top_diff_label = Label.new()
	top_diff_label.text = "EASY"
	top_diff_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	top_diff_label.add_theme_font_size_override("font_size", 24)
	top_diff_pill.add_child(top_diff_label)
	top_row.add_child(top_diff_pill)

	var top_spacer: Control = Control.new()
	top_spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_row.add_child(top_spacer)

	top_streak_pill = PanelContainer.new()
	top_streak_pill.visible = false
	top_streak_pill.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(Color(0.38, 0.22, 0.04, 0.94), SovereignTheme.GOLD_CHAMPAGNE, 14, 2, 12, 4))
	var st_row: HBoxContainer = HBoxContainer.new()
	st_row.add_theme_constant_override("separation", 6)
	top_streak_icon = TextureRect.new()
	var fire_tex: Texture2D = SovereignTheme.load_ui_texture("badge_streak_fire.png")
	top_streak_icon.texture = fire_tex
	top_streak_icon.visible = fire_tex != null
	top_streak_icon.custom_minimum_size = Vector2(28, 28)
	top_streak_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	top_streak_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	st_row.add_child(top_streak_icon)

	top_streak_label = Label.new()
	top_streak_label.text = "STREAK x2"
	top_streak_label.add_theme_font_override("font", SovereignTheme.font_mono())
	top_streak_label.add_theme_font_size_override("font_size", 24)
	top_streak_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	st_row.add_child(top_streak_label)
	top_streak_pill.add_child(st_row)
	top_row.add_child(top_streak_pill)

	top_shields_label = Label.new()
	top_shields_label.text = "[I] [I] [I]"
	top_shields_label.visible = false
	top_shields_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	top_shields_label.add_theme_font_override("font", SovereignTheme.font_mono())
	top_shields_label.add_theme_font_size_override("font_size", 26)
	top_shields_label.add_theme_color_override("font_color", SovereignTheme.CYAN_INTEL)
	top_row.add_child(top_shields_label)

	top_score_label = Label.new()
	top_score_label.text = "0 PTS"
	top_score_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	top_score_label.add_theme_font_override("font", SovereignTheme.font_mono())
	top_score_label.add_theme_font_size_override("font_size", 36)
	top_score_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	top_row.add_child(top_score_label)

	top_sound_btn = Button.new()
	top_sound_btn.text = "SOUND"
	top_sound_btn.custom_minimum_size = Vector2(118, 72)
	top_sound_btn.add_theme_font_size_override("font_size", 24)
	SovereignTheme.style_ghost_icon_button(top_sound_btn)
	top_sound_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	top_sound_btn.pressed.connect(_on_toggle_mute)
	top_row.add_child(top_sound_btn)
	top_vb.add_child(top_row)

	var chrono_row: HBoxContainer = HBoxContainer.new()
	chrono_row.add_theme_constant_override("separation", 12)
	chrono_bar = ProgressBar.new()
	chrono_bar.custom_minimum_size = Vector2(0, 12)
	chrono_bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	chrono_bar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	chrono_bar.show_percentage = false
	chrono_bar.value = 100.0
	chrono_row.add_child(chrono_bar)

	chrono_time_label = Label.new()
	chrono_time_label.text = "22.0s"
	chrono_time_label.custom_minimum_size = Vector2(104, 0)
	chrono_time_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	chrono_time_label.add_theme_font_override("font", SovereignTheme.font_mono())
	chrono_time_label.add_theme_font_size_override("font_size", 30)
	chrono_time_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	chrono_row.add_child(chrono_time_label)
	top_vb.add_child(chrono_row)
	vbox.add_child(top_bar)

	# 2. CENTERED BROADCAST STAGE
	var stage_center: Control = Control.new()
	stage_center.size_flags_vertical = Control.SIZE_EXPAND_FILL
	stage_center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vbox.add_child(stage_center)

	gameplay_stage_hbox = HBoxContainer.new()
	gameplay_stage_hbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	gameplay_stage_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	gameplay_stage_hbox.add_theme_constant_override("separation", 24)
	gameplay_stage_hbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stage_center.add_child(gameplay_stage_hbox)

	var tab_vcenter: VBoxContainer = VBoxContainer.new()
	tab_vcenter.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	tab_vcenter.size_flags_stretch_ratio = 2.0
	tab_vcenter.alignment = BoxContainer.ALIGNMENT_CENTER
	tab_vcenter.mouse_filter = Control.MOUSE_FILTER_IGNORE
	gameplay_stage_hbox.add_child(tab_vcenter)

	tableau_card = PanelContainer.new()
	tableau_card.name = "UnifiedBroadcastTableau"
	tableau_card.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(40.0, 34.0))
	tab_vcenter.add_child(tableau_card)

	var tb: VBoxContainer = VBoxContainer.new()
	tb.add_theme_constant_override("separation", 16)
	tableau_card.add_child(tb)

	# Row A: Round Pips + Live Head-to-Head Score
	var pip_bar: HBoxContainer = HBoxContainer.new()
	pip_bar.add_theme_constant_override("separation", 10)
	progress_pips_row = HBoxContainer.new()
	progress_pips_row.add_theme_constant_override("separation", 8)
	pip_bar.add_child(progress_pips_row)

	var p_sp: Control = Control.new()
	p_sp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pip_bar.add_child(p_sp)

	h2h_label = Label.new()
	h2h_label.text = "YOU 0  vs  VANCE 0"
	h2h_label.add_theme_font_override("font", SovereignTheme.font_mono())
	h2h_label.add_theme_font_size_override("font_size", 26)
	h2h_label.add_theme_color_override("font_color", SovereignTheme.CYAN_INTEL)
	pip_bar.add_child(h2h_label)
	tb.add_child(pip_bar)

	# Row B: Illustrated Category Crest Medallion + Format Tag + Optional Wager Pill
	var fmt_row: HBoxContainer = HBoxContainer.new()
	fmt_row.add_theme_constant_override("separation", 12)

	format_cat_icon = TextureRect.new()
	format_cat_icon.custom_minimum_size = Vector2(46, 46)
	format_cat_icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	format_cat_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	format_cat_icon.visible = false
	fmt_row.add_child(format_cat_icon)

	format_tag_label = Label.new()
	format_tag_label.text = "WORLD HISTORY  ·  CLASSIC · Pick 1 of 4"
	format_tag_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	format_tag_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	format_tag_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	format_tag_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	format_tag_label.add_theme_font_size_override("font_size", 28)
	format_tag_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	fmt_row.add_child(format_tag_label)

	wager_active_pill = PanelContainer.new()
	wager_active_pill.visible = false
	wager_active_pill.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(Color(0.50, 0.36, 0.06, 0.96), SovereignTheme.GOLD_CHAMPAGNE, 12, 2, 14, 4))
	var wl: Label = Label.new()
	wl.text = "2x WAGER LIVE"
	wl.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	wl.add_theme_font_size_override("font_size", 24)
	wl.add_theme_color_override("font_color", Color("#fff6d6"))
	wager_active_pill.add_child(wl)
	fmt_row.add_child(wager_active_pill)
	tb.add_child(fmt_row)

	# Row C: Question Prompt
	prompt_label = Label.new()
	prompt_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	prompt_label.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
	prompt_label.add_theme_font_size_override("font_size", 42)
	prompt_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	tb.add_child(prompt_label)

	hint_drawer = PanelContainer.new()
	hint_drawer.visible = false
	hint_drawer.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(Color(0.11, 0.09, 0.04, 0.92), SovereignTheme.GOLD_CHAMPAGNE, 16, 2, 18, 12))
	hint_label = Label.new()
	hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hint_label.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	hint_label.add_theme_font_size_override("font_size", 32)
	hint_label.add_theme_color_override("font_color", Color("#fae7b4"))
	hint_drawer.add_child(hint_label)
	tb.add_child(hint_drawer)

	_build_classic_deck(tb)
	_build_lightning_deck(tb)
	_build_estimate_deck(tb)
	_build_codex_deck(tb)
	_build_fork_deck(tb)
	_build_final_wager_deck(tb)
	_build_airlock_deck(tb)
	_build_lifelines_bar(tb)
	_build_reveal_panel(tb)

	# Right Column (Desktop): Reactive Rival Portrait + Banter Nameplate
	gameplay_rival_col = VBoxContainer.new()
	gameplay_rival_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	gameplay_rival_col.size_flags_stretch_ratio = 0.78
	gameplay_rival_col.alignment = BoxContainer.ALIGNMENT_CENTER
	gameplay_rival_col.add_theme_constant_override("separation", 6)
	gameplay_rival_col.mouse_filter = Control.MOUSE_FILTER_IGNORE
	gameplay_stage_hbox.add_child(gameplay_rival_col)

	gameplay_rival_portrait = TextureRect.new()
	gameplay_rival_portrait.custom_minimum_size = Vector2(340, 440)
	gameplay_rival_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	gameplay_rival_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	gameplay_rival_portrait.material = SovereignTheme.make_cutout_feather_material()
	gameplay_rival_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	gameplay_rival_col.add_child(gameplay_rival_portrait)

	var gr_plate: PanelContainer = PanelContainer.new()
	gr_plate.add_theme_stylebox_override("panel", SovereignTheme.make_ribbon_style(18.0, 12.0))
	var gr_vb: VBoxContainer = VBoxContainer.new()
	gr_vb.add_theme_constant_override("separation", 4)
	gr_plate.add_child(gr_vb)
	gameplay_rival_name = Label.new()
	gameplay_rival_name.text = "JULIAN VANCE"
	gameplay_rival_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	gameplay_rival_name.add_theme_font_override("font", SovereignTheme.font_serif(true))
	gameplay_rival_name.add_theme_font_size_override("font_size", 26)
	gameplay_rival_name.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	gr_vb.add_child(gameplay_rival_name)

	gameplay_rival_status = Label.new()
	gameplay_rival_status.text = "Studying the board..."
	gameplay_rival_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	gameplay_rival_status.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	gameplay_rival_status.add_theme_font_size_override("font_size", 24)
	gameplay_rival_status.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	gr_vb.add_child(gameplay_rival_status)
	gameplay_rival_col.add_child(gr_plate)


func _build_classic_deck(parent: VBoxContainer) -> void:
	classic_deck = GridContainer.new()
	classic_deck.name = "ClassicDeck"
	classic_deck.columns = 2
	classic_deck.add_theme_constant_override("h_separation", 16)
	classic_deck.add_theme_constant_override("v_separation", 14)
	parent.add_child(classic_deck)

	answer_pill_btns.clear()
	for i: int in range(4):
		var btn: Button = Button.new()
		btn.name = "AnswerPill_%d" % i
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.custom_minimum_size = Vector2(0, 118)
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		btn.add_theme_font_size_override("font_size", 36)
		SovereignTheme.style_answer_pill(btn, "normal")
		var cap_i: int = i
		btn.pressed.connect(func() -> void: _on_classic_answer_tapped(cap_i))
		classic_deck.add_child(btn)
		answer_pill_btns.append(btn)


func _build_lightning_deck(parent: VBoxContainer) -> void:
	lightning_deck = VBoxContainer.new()
	lightning_deck.name = "LightningDeck"
	lightning_deck.visible = false
	lightning_deck.add_theme_constant_override("separation", 12)
	parent.add_child(lightning_deck)

	var row: HBoxContainer = HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	lightning_deck.add_child(row)

	lightning_false_btn = Button.new()
	lightning_false_btn.text = "FALSE"
	lightning_false_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lightning_false_btn.custom_minimum_size = Vector2(0, 128)
	lightning_false_btn.add_theme_font_size_override("font_size", 38)
	lightning_false_btn.pressed.connect(func() -> void: _on_lightning_picked("LEFT", lightning_false_btn))
	row.add_child(lightning_false_btn)

	lightning_myth_btn = Button.new()
	lightning_myth_btn.text = "MYTH 2x"
	lightning_myth_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lightning_myth_btn.custom_minimum_size = Vector2(0, 128)
	lightning_myth_btn.add_theme_font_size_override("font_size", 36)
	lightning_myth_btn.pressed.connect(func() -> void: _on_lightning_picked("UP", lightning_myth_btn))
	row.add_child(lightning_myth_btn)

	lightning_true_btn = Button.new()
	lightning_true_btn.text = "TRUE"
	lightning_true_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lightning_true_btn.custom_minimum_size = Vector2(0, 128)
	lightning_true_btn.add_theme_font_size_override("font_size", 38)
	lightning_true_btn.pressed.connect(func() -> void: _on_lightning_picked("RIGHT", lightning_true_btn))
	row.add_child(lightning_true_btn)
	_reset_lightning_styles()


func _reset_lightning_styles() -> void:
	SovereignTheme.style_answer_pill(lightning_false_btn, "wrong")
	SovereignTheme.style_answer_pill(lightning_myth_btn, "focused")
	SovereignTheme.style_answer_pill(lightning_true_btn, "correct")


func _build_estimate_deck(parent: VBoxContainer) -> void:
	estimate_deck = VBoxContainer.new()
	estimate_deck.name = "EstimateDeck"
	estimate_deck.visible = false
	estimate_deck.add_theme_constant_override("separation", 14)
	parent.add_child(estimate_deck)

	var rule_pill: PanelContainer = PanelContainer.new()
	rule_pill.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(Color(0.08, 0.11, 0.18, 0.92), Color(0.949, 0.824, 0.545, 0.42), 14, 1, 16, 8))
	estimate_rule_label = Label.new()
	estimate_rule_label.text = "ESTIMATE — Drag the slider to your answer!"
	estimate_rule_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	estimate_rule_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	estimate_rule_label.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
	estimate_rule_label.add_theme_font_size_override("font_size", 28)
	estimate_rule_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	rule_pill.add_child(estimate_rule_label)
	estimate_deck.add_child(rule_pill)

	estimate_value_label = Label.new()
	estimate_value_label.text = "YOUR ESTIMATE: 1990 CE"
	estimate_value_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	estimate_value_label.add_theme_font_override("font", SovereignTheme.font_mono())
	estimate_value_label.add_theme_font_size_override("font_size", 50)
	estimate_value_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	estimate_deck.add_child(estimate_value_label)

	var slider_row: HBoxContainer = HBoxContainer.new()
	slider_row.add_theme_constant_override("separation", 14)
	estimate_min_label = Label.new()
	estimate_min_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	estimate_min_label.add_theme_font_override("font", SovereignTheme.font_mono())
	estimate_min_label.add_theme_font_size_override("font_size", 26)
	estimate_min_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	slider_row.add_child(estimate_min_label)

	calib_slider = HSlider.new()
	calib_slider.name = "DirectEstimateSlider"
	calib_slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	calib_slider.custom_minimum_size = Vector2(0, 68)
	calib_slider.min_value = 1960.0
	calib_slider.max_value = 2020.0
	calib_slider.step = 1.0
	calib_slider.value = 1990.0
	calib_slider.value_changed.connect(_on_estimate_slider_changed)
	slider_row.add_child(calib_slider)

	estimate_max_label = Label.new()
	estimate_max_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	estimate_max_label.add_theme_font_override("font", SovereignTheme.font_mono())
	estimate_max_label.add_theme_font_size_override("font_size", 26)
	estimate_max_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	slider_row.add_child(estimate_max_label)
	estimate_deck.add_child(slider_row)

	var nudge_row: HBoxContainer = HBoxContainer.new()
	nudge_row.alignment = BoxContainer.ALIGNMENT_CENTER
	nudge_row.add_theme_constant_override("separation", 12)
	estimate_nudge_btns.clear()
	var signs: Array[int] = [-2, -1, 1, 2]
	for idx: int in range(4):
		var nb: Button = Button.new()
		nb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		nb.custom_minimum_size = Vector2(0, 74)
		nb.add_theme_font_size_override("font_size", 30)
		SovereignTheme.style_answer_pill(nb, "normal")
		var sgn: int = signs[idx]
		nb.pressed.connect(func() -> void: _on_estimate_nudge(sgn))
		nudge_row.add_child(nb)
		estimate_nudge_btns.append(nb)
	estimate_deck.add_child(nudge_row)

	estimate_lock_btn = Button.new()
	estimate_lock_btn.text = "LOCK ESTIMATE"
	estimate_lock_btn.custom_minimum_size = Vector2(0, 122)
	estimate_lock_btn.add_theme_font_size_override("font_size", 38)
	SovereignTheme.style_primary_gold_cta(estimate_lock_btn, false)
	estimate_lock_btn.pressed.connect(_on_estimate_lock_pressed)
	estimate_deck.add_child(estimate_lock_btn)


func _build_codex_deck(parent: VBoxContainer) -> void:
	codex_deck = VBoxContainer.new()
	codex_deck.name = "CodexDeck"
	codex_deck.visible = false
	codex_deck.add_theme_constant_override("separation", 12)
	parent.add_child(codex_deck)

	codex_subject_labels.clear()
	codex_target_btns.clear()
	for i: int in range(3):
		var row_panel: PanelContainer = PanelContainer.new()
		row_panel.custom_minimum_size = Vector2(0, 92)
		row_panel.add_theme_stylebox_override("panel", SovereignTheme.make_smoked_glass(Color(0.045, 0.062, 0.105, 0.88), Color(0.949, 0.824, 0.545, 0.36), 16, 16, 8))
		var row: HBoxContainer = HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)
		row_panel.add_child(row)

		var sub_lbl: Label = Label.new()
		sub_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		sub_lbl.size_flags_stretch_ratio = 0.44
		sub_lbl.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
		sub_lbl.add_theme_font_size_override("font_size", 32)
		sub_lbl.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
		row.add_child(sub_lbl)
		codex_subject_labels.append(sub_lbl)

		var link_lbl: Label = Label.new()
		link_lbl.text = "=>"
		link_lbl.add_theme_font_size_override("font_size", 28)
		link_lbl.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
		row.add_child(link_lbl)

		var rot_btn: Button = Button.new()
		rot_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		rot_btn.size_flags_stretch_ratio = 0.50
		rot_btn.custom_minimum_size = Vector2(0, 76)
		rot_btn.add_theme_font_size_override("font_size", 30)
		SovereignTheme.style_answer_pill(rot_btn, "focused")
		var cap_i: int = i
		rot_btn.pressed.connect(func() -> void: _rotate_codex_ring(cap_i))
		row.add_child(rot_btn)
		codex_target_btns.append(rot_btn)
		codex_deck.add_child(row_panel)

	codex_lock_btn = Button.new()
	codex_lock_btn.text = "LOCK MATCHES"
	codex_lock_btn.custom_minimum_size = Vector2(0, 122)
	codex_lock_btn.add_theme_font_size_override("font_size", 38)
	SovereignTheme.style_primary_gold_cta(codex_lock_btn, false)
	codex_lock_btn.pressed.connect(_on_codex_lock_pressed)
	codex_deck.add_child(codex_lock_btn)


func _build_fork_deck(parent: VBoxContainer) -> void:
	fork_deck = VBoxContainer.new()
	fork_deck.name = "CategoryForkDeck"
	fork_deck.visible = false
	fork_deck.add_theme_constant_override("separation", 14)
	parent.add_child(fork_deck)

	var sub: Label = Label.new()
	sub.text = "Steer the round! Choose which category comes next:"
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.add_theme_font_size_override("font_size", 30)
	sub.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	fork_deck.add_child(sub)

	var row: HBoxContainer = HBoxContainer.new()
	row.add_theme_constant_override("separation", 16)
	fork_deck.add_child(row)

	fork_opt_btns.clear()
	for i: int in range(2):
		var fb: Button = Button.new()
		fb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		fb.custom_minimum_size = Vector2(0, 148)
		fb.alignment = HORIZONTAL_ALIGNMENT_LEFT
		fb.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		fb.add_theme_font_size_override("font_size", 34)
		fb.add_theme_constant_override("h_separation", 18)
		fb.expand_icon = false
		SovereignTheme.style_answer_pill(fb, "focused" if i == 0 else "normal")
		var cap_i: int = i
		fb.pressed.connect(func() -> void: _on_fork_chosen(cap_i))
		row.add_child(fb)
		fork_opt_btns.append(fb)


func _build_final_wager_deck(parent: VBoxContainer) -> void:
	final_wager_deck = VBoxContainer.new()
	final_wager_deck.name = "FinalWagerDeck"
	final_wager_deck.visible = false
	final_wager_deck.add_theme_constant_override("separation", 14)
	parent.add_child(final_wager_deck)

	final_wager_sub_label = Label.new()
	final_wager_sub_label.text = "Risk a slice of your score on the final question! Win it right to gain your wager; miss to lose it."
	final_wager_sub_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	final_wager_sub_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	final_wager_sub_label.add_theme_font_size_override("font_size", 30)
	final_wager_sub_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	final_wager_deck.add_child(final_wager_sub_label)

	var row: HBoxContainer = HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	final_wager_deck.add_child(row)

	final_wager_btns.clear()
	var ratios: Array[float] = [0.0, 0.25, 0.50, 1.0]
	for i: int in range(4):
		var wb: Button = Button.new()
		wb.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		wb.custom_minimum_size = Vector2(0, 128)
		wb.add_theme_font_size_override("font_size", 30)
		if i == 3:
			SovereignTheme.style_primary_gold_cta(wb, false)
		else:
			SovereignTheme.style_answer_pill(wb, "normal")
		var cap_r: float = ratios[i]
		wb.pressed.connect(func() -> void: _on_final_wager_selected(cap_r))
		row.add_child(wb)
		final_wager_btns.append(wb)


func _build_airlock_deck(parent: VBoxContainer) -> void:
	airlock_deck = VBoxContainer.new()
	airlock_deck.name = "AirlockDeck"
	airlock_deck.visible = false
	airlock_deck.add_theme_constant_override("separation", 14)
	parent.add_child(airlock_deck)

	airlock_stats_label = Label.new()
	airlock_stats_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	airlock_stats_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	airlock_stats_label.add_theme_font_size_override("font_size", 32)
	airlock_stats_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	airlock_deck.add_child(airlock_stats_label)

	var row: HBoxContainer = HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	var ext_btn: Button = Button.new()
	ext_btn.text = "BANK & CASH OUT"
	ext_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ext_btn.custom_minimum_size = Vector2(0, 124)
	ext_btn.add_theme_font_size_override("font_size", 34)
	ext_btn.pressed.connect(_on_airlock_extract)
	row.add_child(ext_btn)

	var desc_btn: Button = Button.new()
	desc_btn.text = "PUSH DEEPER >"
	desc_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	desc_btn.custom_minimum_size = Vector2(0, 124)
	desc_btn.add_theme_font_size_override("font_size", 34)
	SovereignTheme.style_primary_gold_cta(desc_btn, false)
	desc_btn.pressed.connect(_on_airlock_descend)
	row.add_child(desc_btn)
	airlock_deck.add_child(row)


func _build_lifelines_bar(parent: VBoxContainer) -> void:
	lifelines_row = HBoxContainer.new()
	lifelines_row.name = "LifelinesBar"
	lifelines_row.add_theme_constant_override("separation", 14)
	parent.add_child(lifelines_row)

	lifeline_5050_btn = Button.new()
	lifeline_5050_btn.text = "50 / 50 (2)"
	lifeline_5050_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lifeline_5050_btn.custom_minimum_size = Vector2(0, 88)
	lifeline_5050_btn.add_theme_font_size_override("font_size", 30)
	lifeline_5050_btn.pressed.connect(_on_lifeline_5050)
	lifelines_row.add_child(lifeline_5050_btn)

	lifeline_hint_btn = Button.new()
	lifeline_hint_btn.text = "HINT (2)"
	lifeline_hint_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lifeline_hint_btn.custom_minimum_size = Vector2(0, 88)
	lifeline_hint_btn.add_theme_font_size_override("font_size", 30)
	lifeline_hint_btn.pressed.connect(_on_lifeline_hint)
	lifelines_row.add_child(lifeline_hint_btn)

	lifeline_wager_btn = Button.new()
	lifeline_wager_btn.text = "2x WAGER"
	lifeline_wager_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lifeline_wager_btn.custom_minimum_size = Vector2(0, 88)
	lifeline_wager_btn.add_theme_font_size_override("font_size", 30)
	lifeline_wager_btn.pressed.connect(_on_lifeline_wager_toggle)
	lifelines_row.add_child(lifeline_wager_btn)


func _build_reveal_panel(parent: VBoxContainer) -> void:
	reveal_panel = PanelContainer.new()
	reveal_panel.name = "RevealPanel"
	reveal_panel.visible = false
	reveal_panel.add_theme_stylebox_override("panel", SovereignTheme.make_dialogue_style(22.0, 16.0))
	parent.add_child(reveal_panel)

	var box: VBoxContainer = VBoxContainer.new()
	box.add_theme_constant_override("separation", 10)
	reveal_panel.add_child(box)

	var hdr: HBoxContainer = HBoxContainer.new()
	reveal_header_label = Label.new()
	reveal_header_label.text = "CORRECT!  +650 PTS"
	reveal_header_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	reveal_header_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	reveal_header_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	reveal_header_label.add_theme_font_size_override("font_size", 34)
	reveal_header_label.add_theme_color_override("font_color", SovereignTheme.EMERALD_LOCK)
	hdr.add_child(reveal_header_label)

	reveal_bookmark_btn = Button.new()
	reveal_bookmark_btn.text = "SAVE"
	reveal_bookmark_btn.custom_minimum_size = Vector2(114, 70)
	reveal_bookmark_btn.add_theme_font_size_override("font_size", 26)
	SovereignTheme.style_ghost_icon_button(reveal_bookmark_btn)
	reveal_bookmark_btn.pressed.connect(_on_bookmark_pressed)
	hdr.add_child(reveal_bookmark_btn)
	box.add_child(hdr)

	reveal_why_label = Label.new()
	reveal_why_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	reveal_why_label.add_theme_font_override("font", SovereignTheme.font_sans("regular"))
	reveal_why_label.add_theme_font_size_override("font_size", 30)
	reveal_why_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	box.add_child(reveal_why_label)

	reveal_next_btn = Button.new()
	reveal_next_btn.text = "NEXT QUESTION >"
	reveal_next_btn.custom_minimum_size = Vector2(0, 112)
	reveal_next_btn.add_theme_font_size_override("font_size", 38)
	SovereignTheme.style_primary_gold_cta(reveal_next_btn, false)
	reveal_next_btn.pressed.connect(_on_reveal_next_pressed)
	box.add_child(reveal_next_btn)


func _build_summary_overlay(parent: Control) -> void:
	summary_overlay = Control.new()
	summary_overlay.name = "SummaryOverlay"
	summary_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	summary_overlay.visible = false
	parent.add_child(summary_overlay)

	summary_vbox = VBoxContainer.new()
	summary_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	summary_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	summary_vbox.add_theme_constant_override("separation", 16)
	summary_overlay.add_child(summary_vbox)

	# Open top showcase window ONLY when 3D Championship Crown Trophy is spinning on Boss Clear!
	summary_trophy_spacer = Control.new()
	summary_trophy_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	summary_trophy_spacer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	summary_trophy_spacer.visible = false
	summary_vbox.add_child(summary_trophy_spacer)

	var card: PanelContainer = PanelContainer.new()
	card.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(32.0, 26.0))
	summary_vbox.add_child(card)

	var cbox: VBoxContainer = VBoxContainer.new()
	cbox.add_theme_constant_override("separation", 14)
	card.add_child(cbox)

	summary_title = Label.new()
	summary_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	summary_title.add_theme_font_override("font", SovereignTheme.font_serif(true))
	summary_title.add_theme_font_size_override("font_size", 48)
	summary_title.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	cbox.add_child(summary_title)

	summary_star_row = HBoxContainer.new()
	summary_star_row.alignment = BoxContainer.ALIGNMENT_CENTER
	summary_star_row.add_theme_constant_override("separation", 18)
	cbox.add_child(summary_star_row)

	summary_score_label = Label.new()
	summary_score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	summary_score_label.add_theme_font_override("font", SovereignTheme.font_mono())
	summary_score_label.add_theme_font_size_override("font_size", 52)
	summary_score_label.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	cbox.add_child(summary_score_label)

	summary_stats_label = Label.new()
	summary_stats_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	summary_stats_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	summary_stats_label.add_theme_font_override("font", SovereignTheme.font_sans("bold"))
	summary_stats_label.add_theme_font_size_override("font_size", 30)
	summary_stats_label.add_theme_color_override("font_color", SovereignTheme.CYAN_INTEL)
	cbox.add_child(summary_stats_label)

	summary_hook_label = Label.new()
	summary_hook_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	summary_hook_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	summary_hook_label.add_theme_font_override("font", SovereignTheme.font_sans("medium"))
	summary_hook_label.add_theme_font_size_override("font_size", 28)
	summary_hook_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	cbox.add_child(summary_hook_label)

	summary_share_box = PanelContainer.new()
	summary_share_box.visible = false
	summary_share_box.add_theme_stylebox_override("panel", SovereignTheme.make_dialogue_style(22.0, 16.0))
	var share_vb: VBoxContainer = VBoxContainer.new()
	share_vb.add_theme_constant_override("separation", 12)
	summary_share_box.add_child(share_vb)

	summary_badge_row = HBoxContainer.new()
	summary_badge_row.alignment = BoxContainer.ALIGNMENT_CENTER
	summary_badge_row.add_theme_constant_override("separation", 10)
	share_vb.add_child(summary_badge_row)

	summary_share_preview = Label.new()
	summary_share_preview.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	summary_share_preview.add_theme_font_override("font", SovereignTheme.font_sans("semibold"))
	summary_share_preview.add_theme_font_size_override("font_size", 28)
	summary_share_preview.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	share_vb.add_child(summary_share_preview)
	cbox.add_child(summary_share_box)

	summary_copy_btn = Button.new()
	summary_copy_btn.text = "COPY SHARE CARD"
	summary_copy_btn.visible = false
	summary_copy_btn.custom_minimum_size = Vector2(0, 114)
	summary_copy_btn.add_theme_font_size_override("font_size", 36)
	SovereignTheme.style_primary_gold_cta(summary_copy_btn, false)
	summary_copy_btn.pressed.connect(_on_copy_daily_share)
	cbox.add_child(summary_copy_btn)

	summary_primary_btn = Button.new()
	summary_primary_btn.text = "NEXT ROUND >"
	summary_primary_btn.custom_minimum_size = Vector2(0, 120)
	summary_primary_btn.add_theme_font_size_override("font_size", 40)
	SovereignTheme.style_primary_gold_cta(summary_primary_btn, false)
	summary_primary_btn.pressed.connect(_on_summary_primary)
	cbox.add_child(summary_primary_btn)

	summary_secondary_btn = Button.new()
	summary_secondary_btn.text = "CAMPAIGN HUB"
	summary_secondary_btn.custom_minimum_size = Vector2(0, 98)
	summary_secondary_btn.add_theme_font_size_override("font_size", 34)
	summary_secondary_btn.pressed.connect(_on_summary_secondary)
	cbox.add_child(summary_secondary_btn)


func _build_settings_modal(parent: Control) -> void:
	settings_modal = ColorRect.new()
	settings_modal.name = "SettingsModal"
	settings_modal.color = Color(0.015, 0.022, 0.042, 0.80)
	settings_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	settings_modal.visible = false
	parent.add_child(settings_modal)

	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	settings_modal.add_child(center)

	var card: PanelContainer = PanelContainer.new()
	card.custom_minimum_size = Vector2(820, 0)
	card.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(30.0, 24.0))
	center.add_child(card)

	var box: VBoxContainer = VBoxContainer.new()
	box.add_theme_constant_override("separation", 14)
	card.add_child(box)

	var ttl: Label = Label.new()
	ttl.text = "SETTINGS & NAVIGATION"
	ttl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ttl.add_theme_font_override("font", SovereignTheme.font_serif(true))
	ttl.add_theme_font_size_override("font_size", 42)
	ttl.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	box.add_child(ttl)

	settings_voice_btn = Button.new()
	settings_voice_btn.custom_minimum_size = Vector2(0, 96)
	settings_voice_btn.add_theme_font_size_override("font_size", 32)
	settings_voice_btn.pressed.connect(func() -> void:
		AudioDirector.set_voice_enabled(not AudioDirector.voice_enabled)
		_refresh_settings_labels()
	)
	box.add_child(settings_voice_btn)

	settings_music_btn = Button.new()
	settings_music_btn.custom_minimum_size = Vector2(0, 96)
	settings_music_btn.add_theme_font_size_override("font_size", 32)
	settings_music_btn.pressed.connect(func() -> void:
		AudioDirector.set_music_enabled(not AudioDirector.music_enabled)
		_refresh_settings_labels()
	)
	box.add_child(settings_music_btn)

	settings_haptics_btn = Button.new()
	settings_haptics_btn.custom_minimum_size = Vector2(0, 96)
	settings_haptics_btn.add_theme_font_size_override("font_size", 32)
	settings_haptics_btn.pressed.connect(func() -> void:
		AudioDirector.set_haptics_enabled(not AudioDirector.haptics_enabled)
		_refresh_settings_labels()
	)
	box.add_child(settings_haptics_btn)

	var dossier_nav: Button = Button.new()
	dossier_nav.text = "CONSPIRACY DOSSIER"
	dossier_nav.custom_minimum_size = Vector2(0, 96)
	dossier_nav.add_theme_font_size_override("font_size", 32)
	dossier_nav.pressed.connect(func() -> void:
		settings_modal.visible = false
		_enter_evidence_board()
	)
	box.add_child(dossier_nav)

	var hub_btn: Button = Button.new()
	hub_btn.text = "CAMPAIGN TOUR HUB"
	hub_btn.custom_minimum_size = Vector2(0, 96)
	hub_btn.add_theme_font_size_override("font_size", 32)
	hub_btn.pressed.connect(func() -> void:
		settings_modal.visible = false
		_enter_campaign_hub()
	)
	box.add_child(hub_btn)

	var home_btn: Button = Button.new()
	home_btn.text = "RETURN TO TITLE"
	home_btn.custom_minimum_size = Vector2(0, 96)
	home_btn.add_theme_font_size_override("font_size", 32)
	home_btn.pressed.connect(func() -> void:
		settings_modal.visible = false
		_enter_title_screen()
	)
	box.add_child(home_btn)

	var close_btn: Button = Button.new()
	close_btn.text = "RESUME"
	close_btn.custom_minimum_size = Vector2(0, 114)
	close_btn.add_theme_font_size_override("font_size", 38)
	SovereignTheme.style_primary_gold_cta(close_btn, false)
	close_btn.pressed.connect(func() -> void:
		AudioDirector.play_ui_click()
		settings_modal.visible = false
	)
	box.add_child(close_btn)


func _update_responsive_layout() -> void:
	var vp: Vector2 = get_viewport().get_visible_rect().size
	_is_desktop_layout = vp.x > vp.y * 0.90

	if _is_desktop_layout:
		var max_w: float = minf(1560.0, vp.x * 0.94)
		hud_column.anchor_left = 0.5
		hud_column.anchor_right = 0.5
		hud_column.offset_left = -max_w * 0.5
		hud_column.offset_right = max_w * 0.5
	else:
		hud_column.anchor_left = 0.0
		hud_column.anchor_right = 1.0
		hud_column.offset_left = 0.0
		hud_column.offset_right = 0.0

	if hub_rival_panel != null:
		hub_rival_panel.visible = _is_desktop_layout
	if gameplay_rival_col != null:
		gameplay_rival_col.visible = _is_desktop_layout and state == GameState.MATCH_PLAY
	if cat_domain_grid != null:
		cat_domain_grid.columns = 4 if _is_desktop_layout else 2
	if cat_scroll != null:
		# Tighten vertical fit on desktop 1280x800 so Categories grid sits snugly above Difficulty/Start panel!
		if _is_desktop_layout:
			cat_scroll.size_flags_vertical = Control.SIZE_SHRINK_CENTER
			cat_scroll.custom_minimum_size = Vector2(0, 392)
		else:
			cat_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
			cat_scroll.custom_minimum_size = Vector2(0, 0)

	if state == GameState.EVIDENCE_BOARD and evidence_board != null:
		evidence_board.refresh_board(_is_desktop_layout)

	if cutscene_player != null:
		cutscene_player.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	if cutout_portrait != null:
		var pw: float = minf(900.0, vp.x * 0.86)
		var ph: float = clampf(vp.y * 0.62, 620.0, 1160.0)
		portrait_base_y = clampf(vp.y * 0.10, 90.0, 220.0)
		cutout_portrait.size = Vector2(pw, ph)
		cutout_portrait.position = Vector2((vp.x - pw) * 0.5, portrait_base_y)


# ==============================================================================
# SCREEN NAVIGATION, CUTSCENES & CONSPIRACY EVIDENCE BOARD
# ==============================================================================
func _hide_all_overlays() -> void:
	title_overlay.visible = false
	title_utility_bar.visible = false
	campaign_hub_overlay.visible = false
	globe_overlay.visible = false
	categories_overlay.visible = false
	interview_overlay.visible = false
	gameplay_hud.visible = false
	summary_overlay.visible = false
	portrait_stage.visible = false
	if evidence_board != null:
		evidence_board.visible = false
	if cutscene_player != null:
		cutscene_player.visible = false
	AudioDirector.set_suspense_duck(false)


func _enter_title_screen() -> void:
	state = GameState.TITLE
	match_phase = MatchPhase.IDLE
	_hide_all_overlays()
	title_overlay.visible = true
	title_utility_bar.visible = true

	match_score = 0
	displayed_score = 0.0
	streak = 0
	best_streak = 0
	selected_answer_idx = -1
	if top_score_label != null:
		top_score_label.text = "0 PTS"

	stage_rig.set_venue("ch")
	stage_rig.set_mood("TITLE")
	_set_city_weather("ch")
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.ORB, CinematicCameraRig.SHOT_TITLE_ORBIT)
	AudioDirector.stop_voice()
	AudioDirector.play_music("music_vetting_ambient", -11.5)
	_refresh_title_mode_ui()


func _refresh_title_mode_ui() -> void:
	var mode_key: String = MODE_KEYS[selected_mode_idx]
	for i: int in range(mode_tab_btns.size()):
		var lbl: String = MODE_LABELS[i]
		if MODE_KEYS[i] == "DAILY":
			lbl = "Daily OK" if TriviaDB.is_daily_completed_today() else "Daily"
		mode_tab_btns[i].text = lbl
		SovereignTheme.style_mode_tab(mode_tab_btns[i], i == selected_mode_idx)

	match mode_key:
		"CAMPAIGN":
			title_play_btn.text = "PLAY CAMPAIGN"
		"CATEGORIES":
			title_play_btn.text = "PICK CATEGORIES"
		"DAILY":
			title_play_btn.text = "PLAY DAILY #%d" % ShareClipboard.get_daily_edition_number()
		"ENDLESS":
			title_play_btn.text = "PLAY ENDLESS"
	title_cta_sub.text = str(MODE_SUBS.get(mode_key, ""))


func _on_mode_tab_pressed(idx: int) -> void:
	AudioDirector.play_ui_click()
	if idx == selected_mode_idx:
		_on_title_play_pressed()
		return
	selected_mode_idx = idx
	_refresh_title_mode_ui()


func _on_title_play_pressed() -> void:
	AudioDirector.play_facet_snap()
	var mode_key: String = MODE_KEYS[selected_mode_idx]
	active_mode = mode_key
	match mode_key:
		"CAMPAIGN":
			_enter_campaign_hub()
		"CATEGORIES":
			_enter_categories_picker()
		"DAILY":
			_start_daily_match()
		"ENDLESS":
			_start_endless_match(true)


func _enter_evidence_board() -> void:
	state = GameState.EVIDENCE_BOARD
	match_phase = MatchPhase.IDLE
	_hide_all_overlays()
	evidence_board.visible = true
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
	stage_rig.set_venue("ledger")
	stage_rig.set_mood("CAMPAIGN_HUB")
	_set_city_weather("eg")
	AudioDirector.stop_voice()
	AudioDirector.play_music_with_fallback("music_campaign_mystery", "music_vetting_ambient", -11.0)
	evidence_board.refresh_board(_is_desktop_layout)


func _on_replay_act_cutscene(act_idx: int) -> void:
	_play_act_cutscene(act_idx, func() -> void: _enter_evidence_board())


func _play_act_cutscene(act_idx: int, after_cb: Callable) -> void:
	var cs: Dictionary = TriviaDB.get_act_cutscene(act_idx)
	if cs.is_empty():
		if after_cb.is_valid():
			after_cb.call()
		return
	state = GameState.CUTSCENE
	_cutscene_after_cb = after_cb
	_hide_all_overlays()
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
	_set_city_weather(str(cs.get("hub_id", "ch")))
	var cid: String = str(cs.get("id", "act%d" % act_idx))
	TriviaDB.mark_cutscene_seen(cid)
	cutscene_player.play_cutscene(cs)


func _on_cutscene_finished(_act_id: String) -> void:
	if _cutscene_after_cb.is_valid():
		var cb: Callable = _cutscene_after_cb
		_cutscene_after_cb = Callable()
		cb.call()
	else:
		_enter_campaign_hub()


# ==============================================================================
# CAMPAIGN TOUR HUB & 3D WORLD GLOBE
# ==============================================================================
func _enter_campaign_hub() -> void:
	state = GameState.CAMPAIGN_HUB
	match_phase = MatchPhase.IDLE
	_hide_all_overlays()
	campaign_hub_overlay.visible = true
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
	stage_rig.set_mood("CAMPAIGN_HUB")
	AudioDirector.stop_voice()
	AudioDirector.play_music("music_vetting_ambient", -11.5)

	var cur_m_num: int = int(TriviaDB.save_state.get("current_mission_number", 1))
	hub_selected_city_idx = clampi((cur_m_num - 1) / 5, 0, 7)
	hub_selected_round_idx = clampi((cur_m_num - 1) % 5, 0, 4)
	_refresh_campaign_hub_ui()


func _select_hub_city(city_idx: int) -> void:
	if not TriviaDB.is_city_unlocked(city_idx):
		AudioDirector.play_ui_click()
		return
	AudioDirector.play_ui_click()
	hub_selected_city_idx = clampi(city_idx, 0, 7)
	hub_selected_round_idx = 0
	var v: Dictionary = TriviaDB.get_venue_by_index(hub_selected_city_idx)
	var ms: Array[Dictionary] = TriviaDB.get_missions_for_hub(str(v["region"]))
	for r: int in range(mini(5, ms.size())):
		if not TriviaDB.is_mission_completed(str(ms[r].get("id", ""))):
			hub_selected_round_idx = r
			break
	_refresh_campaign_hub_ui()


func _select_hub_round(round_idx: int) -> void:
	if not TriviaDB.is_round_unlocked(hub_selected_city_idx, round_idx):
		AudioDirector.play_ui_click()
		return
	AudioDirector.play_ui_click()
	hub_selected_round_idx = clampi(round_idx, 0, 4)
	_refresh_campaign_hub_ui()


func _refresh_campaign_hub_ui() -> void:
	var v: Dictionary = TriviaDB.get_venue_by_index(hub_selected_city_idx)
	var vcode: String = str(v["code"])
	stage_rig.set_venue(vcode)
	_set_city_weather(vcode)

	hub_rank_label.text = "RANK: %s  ·  STARS: %d / 120  ·  CITY %d OF 8 · %s" % [
		TriviaDB.get_player_rank().to_upper(),
		TriviaDB.get_total_stars(),
		hub_selected_city_idx + 1,
		str(v["city"]).to_upper(),
	]

	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	for i: int in range(mini(hub_city_btns.size(), venues.size())):
		var cv: Dictionary = venues[i]
		var unlocked: bool = TriviaDB.is_city_unlocked(i)
		var btn: Button = hub_city_btns[i]
		if unlocked:
			btn.text = "%d. %s\n%s" % [i + 1, str(cv["short"]).to_upper(), str(cv["tier"])]
			btn.disabled = false
			SovereignTheme.style_answer_pill(btn, "focused" if i == hub_selected_city_idx else "normal")
		else:
			btn.text = "%d. %s\nLOCKED · %s" % [i + 1, str(cv["short"]).to_upper(), str(cv["tier"])]
			btn.disabled = true
			SovereignTheme.style_answer_pill(btn, "locked")

	var city_ms: Array[Dictionary] = TriviaDB.get_missions_for_hub(str(v["region"]))
	var m: Dictionary = city_ms[hub_selected_round_idx] if hub_selected_round_idx < city_ms.size() else TriviaDB.get_mission_by_number(hub_selected_city_idx * 5 + hub_selected_round_idx + 1)
	var mid: String = str(m.get("id", "%s_%d" % [vcode, hub_selected_round_idx + 1]))
	var is_boss: bool = (hub_selected_round_idx == 4)
	var boss_prof: Dictionary = TriviaDB.get_cast_profile(str(v["boss_id"]))
	var q_count: int = 5
	var pass_need: int = 3

	hub_round_eyebrow.text = "CITY %d · %s  ·  ROUND %d OF 5" % [hub_selected_city_idx + 1, str(v["city"]).to_upper(), hub_selected_round_idx + 1]
	_style_difficulty_pill(hub_diff_pill, hub_diff_label, str(v["tier"]), v["tier_color"])

	var r_sub: String = TriviaDB.ROUND_SUBTITLES[clampi(hub_selected_round_idx, 0, 4)]
	var m_title: String = SovereignTheme.sanitize_display_text(str(m.get("title", r_sub)))
	hub_round_title.text = "%s — %s" % [r_sub, m_title]

	var custom_goal: String = SovereignTheme.sanitize_display_text(str(m.get("pass_goal", "")))
	if not custom_goal.is_empty():
		hub_goal_label.text = "GOAL: " + custom_goal
	elif is_boss:
		var next_city_name: String = str(TriviaDB.get_venue_by_index(hub_selected_city_idx + 1)["short"]).to_upper() if hub_selected_city_idx < 7 else "THE $100M CROWN"
		hub_goal_label.text = "BOSS DUEL: Get %d/%d right AND beat %s to unlock %s!" % [pass_need, q_count, str(boss_prof["short_name"]), next_city_name]
	else:
		hub_goal_label.text = "GOAL: Get %d of %d right to advance to Round %d" % [pass_need, q_count, hub_selected_round_idx + 2]

	hub_hook_label.text = str(v["city_hook"])
	hub_meta_label.text = "%d Questions · %ds Timer · %s" % [q_count, int(v["timer_sec"]), _city_formats_summary(v["archetypes"] as Array)]

	# Sculpted 3D-Lit Gold Stars!
	for ch: Node in hub_star_row.get_children():
		ch.queue_free()
	var earned_stars: int = TriviaDB.get_mission_stars(mid)
	for s: int in range(3):
		hub_star_row.add_child(SovereignTheme.make_star_control(s < earned_stars, 46))

	hub_start_btn.text = "REPLAY ROUND %d >" % (hub_selected_round_idx + 1) if TriviaDB.is_mission_completed(mid) else "START ROUND %d >" % (hub_selected_round_idx + 1)

	# 5 Round Selector Chips (Clean Labels — ZERO ugly ASCII --- / **_)
	for r: int in range(5):
		var rb: Button = hub_round_btns[r]
		var r_unlocked: bool = TriviaDB.is_round_unlocked(hub_selected_city_idx, r)
		var r_mid: String = str(city_ms[r].get("id", "")) if r < city_ms.size() else ""
		var r_stars: int = TriviaDB.get_mission_stars(r_mid)
		var tag: String = "BOSS" if r == 4 else ("R%d" % (r + 1))
		if r_unlocked:
			var sub_txt: String = ("%d/3" % r_stars) if r_stars > 0 else "OPEN"
			rb.text = "%s\n%s" % [tag, sub_txt]
			rb.disabled = false
			SovereignTheme.style_answer_pill(rb, "focused" if r == hub_selected_round_idx else ("correct" if r_stars > 0 else "normal"))
		else:
			rb.text = "%s\nLOCK" % tag
			rb.disabled = true
			SovereignTheme.style_answer_pill(rb, "locked")

	_load_portrait_into(hub_rival_portrait, TriviaDB.get_cast_portrait_path(str(v["boss_id"]), "neutral"))
	hub_rival_name_label.text = "%s\n%s" % [str(boss_prof["name"]), str(boss_prof["role"])]
	hub_rival_panel.visible = _is_desktop_layout


func _city_formats_summary(archs: Array) -> String:
	if archs.size() <= 1:
		return "Classic 4-Choice"
	if archs.size() == 2:
		return "Classic + Lightning T/F"
	if archs.size() == 3:
		return "Classic + Lightning + Estimate"
	return "All 4 Formats"


func _on_hub_start_round() -> void:
	AudioDirector.play_facet_snap()
	var v: Dictionary = TriviaDB.get_venue_by_index(hub_selected_city_idx)
	var city_ms: Array[Dictionary] = TriviaDB.get_missions_for_hub(str(v["region"]))
	var m: Dictionary = city_ms[hub_selected_round_idx] if hub_selected_round_idx < city_ms.size() else TriviaDB.get_mission_by_number(hub_selected_city_idx * 5 + hub_selected_round_idx + 1)
	_launch_campaign_round(hub_selected_city_idx, hub_selected_round_idx, m)


func _launch_campaign_round(city_idx: int, round_idx: int, m: Dictionary) -> void:
	active_mode = "CAMPAIGN"
	active_city_idx = clampi(city_idx, 0, 7)
	active_round_idx = clampi(round_idx, 0, 4)
	active_mission = m
	var v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx)
	active_venue_code = str(v["code"])
	rival_id = str(v["boss_id"])
	rival_acc = float(v["rival_acc"])

	# Map key City Openings to our 6 Illustrated Graphic-Novel Story Act Cutscenes!
	var act_map: Dictionary = {0: 0, 1: 1, 2: 2, 4: 3, 6: 4, 7: 5}
	var should_cutscene: bool = (active_round_idx == 0) and act_map.has(active_city_idx)
	if should_cutscene:
		var act_num: int = int(act_map[active_city_idx])
		var cs_def: Dictionary = TriviaDB.get_act_cutscene(act_num)
		var cid: String = str(cs_def.get("id", "act%d" % act_num))
		if not cs_def.is_empty() and not TriviaDB.has_seen_cutscene(cid):
			_play_act_cutscene(act_num, func() -> void: _launch_campaign_interview_or_match(m))
			return

	_launch_campaign_interview_or_match(m)


func _launch_campaign_interview_or_match(m: Dictionary) -> void:
	var raw_beats: Array[Dictionary] = _extract_dialogue_beats(m)
	var show_intro: bool = (active_round_idx == 0 or active_round_idx == 4) and not raw_beats.is_empty()
	if show_intro:
		var short_beats: Array[Dictionary] = []
		for i: int in range(mini(2, raw_beats.size())):
			short_beats.append(raw_beats[i])
		var dec: Dictionary = {}
		if active_round_idx == 4 and m.has("choices") and m["choices"] is Array and not (m["choices"] as Array).is_empty():
			dec = {"choices": m["choices"]}
		_start_interview(short_beats, dec, func() -> void: _start_campaign_match())
	else:
		_start_campaign_match()


func _enter_campaign_globe() -> void:
	state = GameState.CAMPAIGN_GLOBE
	_hide_all_overlays()
	globe_overlay.visible = true
	stage_rig.set_venue("studio")
	stage_rig.set_mood("GLOBE")
	_set_city_weather("global")
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.GLOBE, CinematicCameraRig.SHOT_GLOBE_MAP)
	AudioDirector.play_music("music_vetting_ambient", -11.5)
	_select_globe_city(hub_selected_city_idx)


func _select_globe_city(city_idx: int) -> void:
	AudioDirector.play_ui_click()
	hub_selected_city_idx = clampi(city_idx, 0, 7)
	var v: Dictionary = TriviaDB.get_venue_by_index(hub_selected_city_idx)
	artifact_rig.focus_globe_city(str(v["code"]))
	globe_city_title.text = "CITY %d · %s (%s)" % [hub_selected_city_idx + 1, str(v["city"]).to_upper(), str(v["tier"])]
	globe_city_desc.text = "%s — %s" % [str(v["venue_name"]), str(v["city_hook"])]
	var unlocked: bool = TriviaDB.is_city_unlocked(hub_selected_city_idx)
	globe_enter_btn.disabled = not unlocked
	globe_enter_btn.text = ("ENTER %s IN CAMPAIGN HUB >" % str(v["short"]).to_upper()) if unlocked else ("CLEAR PREVIOUS CITY BOSS TO UNLOCK %s" % str(v["short"]).to_upper())
	for i: int in range(globe_hub_btns.size()):
		SovereignTheme.style_answer_pill(globe_hub_btns[i], "focused" if i == hub_selected_city_idx else "normal")


# ==============================================================================
# CATEGORIES PICKER MODE (WITH 12 ILLUSTRATED CREST MEDALLIONS + LAZY SHARDS!)
# ==============================================================================
func _enter_categories_picker() -> void:
	state = GameState.CATEGORIES_PICKER
	match_phase = MatchPhase.IDLE
	_hide_all_overlays()
	categories_overlay.visible = true
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
	stage_rig.set_venue("ledger")
	stage_rig.set_mood("CATEGORIES")
	_set_city_weather("eg")
	AudioDirector.stop_voice()
	AudioDirector.play_music("music_vetting_ambient", -11.5)
	_refresh_categories_ui()


func _on_cat_all_pressed() -> void:
	AudioDirector.play_ui_click()
	cat_selected_domains.clear()
	_refresh_categories_ui()


func _on_cat_domain_toggled(dom_id: int) -> void:
	AudioDirector.play_ui_click()
	if cat_selected_domains.has(dom_id):
		cat_selected_domains.erase(dom_id)
	else:
		cat_selected_domains.append(dom_id)
		TriviaDB.request_domain_shard(dom_id)
	_refresh_categories_ui()


func _refresh_categories_ui() -> void:
	var is_all: bool = cat_selected_domains.is_empty()
	cat_all_btn.text = "ALL CATEGORIES (MIXED · %s Qs)" % ShareClipboard.format_commas(TriviaDB.get_total_playable_count())
	SovereignTheme.style_answer_pill(cat_all_btn, "focused" if is_all else "normal")
	var counts: Dictionary = TriviaDB.get_combined_domain_counts()
	for i: int in range(cat_domain_btns.size()):
		var dm: Dictionary = TriviaDB.get_domain_meta(i)
		cat_domain_btns[i].text = "%s\n%s Qs" % [str(dm["name"]), ShareClipboard.format_commas(int(counts.get(i, 0)))]
		SovereignTheme.style_answer_pill(cat_domain_btns[i], "focused" if cat_selected_domains.has(i) else "normal")
	for i: int in range(DIFF_PRESETS.size()):
		SovereignTheme.style_answer_pill(cat_diff_btns[i], "focused" if DIFF_PRESETS[i] == cat_selected_diff else "normal")
	for i: int in range(LENGTH_PRESETS.size()):
		SovereignTheme.style_answer_pill(cat_len_btns[i], "focused" if LENGTH_PRESETS[i] == cat_selected_count else "normal")

	var topic_summary: String = "ALL CATEGORIES" if is_all else ("%s" % str(TriviaDB.get_domain_meta(cat_selected_domains[0])["short"]).to_upper() if cat_selected_domains.size() == 1 else "%d CATEGORIES" % cat_selected_domains.size())
	cat_start_btn.text = "START %d Qs · %s (%s) >" % [cat_selected_count, topic_summary, cat_selected_diff]


func _on_cat_start_pressed() -> void:
	AudioDirector.play_facet_snap()
	active_mode = "CATEGORIES"
	active_venue_code = "studio"
	rival_active = false
	var qs: Array[Dictionary] = TriviaDB.select_category_questions(cat_selected_domains, cat_selected_diff, cat_selected_count)
	_begin_match_session("CATEGORIES", "studio", qs, cat_selected_diff, _diff_color(cat_selected_diff), 20.0)


# ==============================================================================
# PUNCHY VOICED INTERVIEW
# ==============================================================================
func _start_interview(beats: Array[Dictionary], decision: Dictionary, on_done: Callable) -> void:
	state = GameState.INTERVIEW
	interview_beats = beats
	interview_idx = 0
	interview_decision = decision
	interview_after_callback = on_done

	_hide_all_overlays()
	interview_overlay.visible = true
	portrait_stage.visible = true
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
	stage_rig.set_venue(active_venue_code)
	stage_rig.set_mood("INTERVIEW")
	_set_city_weather(active_venue_code)
	AudioDirector.play_music("music_vetting_ambient", -12.0)

	var v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx)
	interview_act_label.text = "CITY %d · %s  ·  ROUND %d OF 5" % [active_city_idx + 1, str(v["city"]).to_upper(), active_round_idx + 1]
	_render_interview_beat()


func _render_interview_beat() -> void:
	for c: Node in choice_stack.get_children():
		c.queue_free()

	if interview_idx >= interview_beats.size():
		if not interview_decision.is_empty() and interview_decision.has("choices"):
			_show_interview_decision(interview_decision)
		else:
			_finish_interview()
		return

	var beat: Dictionary = interview_beats[interview_idx]
	var spk_id: String = str(beat.get("speaker", active_mission.get("speaker", "vance"))).to_lower()
	var expr: String = str(beat.get("expression", "neutral"))
	var profile: Dictionary = TriviaDB.get_cast_profile(spk_id)
	_set_cutout_portrait(spk_id, TriviaDB.get_cast_portrait_path(spk_id, expr))

	speaker_name_label.text = str(profile["name"])
	speaker_role_label.text = str(profile["role"])
	subtitle_label.text = SovereignTheme.sanitize_display_text(str(beat.get("text", "")))

	var vclip: String = str(beat.get("voice_clip", beat.get("voiceClip", "")))
	if not vclip.is_empty():
		AudioDirector.play_voice(vclip)
	else:
		AudioDirector.stop_voice()
		AudioDirector.play_ui_click()

	interview_continue_btn.visible = true
	interview_continue_btn.text = "BEGIN ROUND >" if (interview_idx == interview_beats.size() - 1 and interview_decision.is_empty()) else "NEXT >"


func _show_interview_decision(dec: Dictionary) -> void:
	interview_continue_btn.visible = false
	var choices: Variant = dec.get("choices", [])
	if choices is Array and not (choices as Array).is_empty():
		subtitle_label.text = "Make your call before stepping onto the stage:"
		for c: Variant in (choices as Array):
			if not (c is Dictionary):
				continue
			var cd: Dictionary = c as Dictionary
			var eff_hint: String = _summarize_choice_effects(cd.get("effects", {}) as Dictionary if cd.get("effects") is Dictionary else {})
			var cbtn: Button = Button.new()
			cbtn.text = SovereignTheme.sanitize_display_text(str(cd.get("label", "Choose")) + (("  (" + eff_hint + ")") if not eff_hint.is_empty() else ""))
			cbtn.custom_minimum_size = Vector2(0, 102)
			cbtn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
			cbtn.add_theme_font_size_override("font_size", 30)
			SovereignTheme.style_answer_pill(cbtn, "normal")
			cbtn.pressed.connect(func() -> void:
				AudioDirector.play_facet_snap()
				if cd.get("effects") is Dictionary:
					TriviaDB.apply_choice_effects(cd["effects"] as Dictionary)
				interview_decision = {}
				_finish_interview()
			)
			choice_stack.add_child(cbtn)
	else:
		_finish_interview()


func _summarize_choice_effects(eff: Dictionary) -> String:
	var parts: Array[String] = []
	if eff.has("integrity"):
		var d: int = int(eff["integrity"])
		parts.append("%s%d Integrity" % ["+" if d >= 0 else "", d])
	if eff.has("public_trust"):
		var d: int = int(eff["public_trust"])
		parts.append("%s%d Fan Support" % ["+" if d >= 0 else "", d])
	if eff.has("council_favor"):
		var d: int = int(eff["council_favor"])
		parts.append("%s%d Sponsor Backing" % ["+" if d >= 0 else "", d])
	for npc: String in ["nadia", "teo", "lindqvist", "soren", "tariq"]:
		if eff.has("bond_" + npc):
			var d: int = int(eff["bond_" + npc])
			parts.append("%s %s" % ["+Ally" if d > 0 else "-Rival", npc.capitalize()])
	return ", ".join(parts)


func _advance_interview_beat() -> void:
	AudioDirector.play_ui_click()
	interview_idx += 1
	_render_interview_beat()


func _skip_interview_to_match() -> void:
	AudioDirector.play_ui_click()
	AudioDirector.stop_voice()
	_finish_interview()


func _finish_interview() -> void:
	AudioDirector.stop_voice()
	portrait_stage.visible = false
	if interview_after_callback.is_valid():
		interview_after_callback.call()


func _set_cutout_portrait(spk_id: String, tex_path: String) -> void:
	if not ResourceLoader.exists(tex_path):
		return
	var tex: Texture2D = load(tex_path) as Texture2D
	if tex == null:
		return
	var is_new: bool = spk_id != active_portrait_speaker
	active_portrait_speaker = spk_id
	cutout_portrait.texture = tex
	if is_new:
		var vp: Vector2 = get_viewport().get_visible_rect().size
		var target_x: float = (vp.x - cutout_portrait.size.x) * 0.5
		cutout_portrait.position.x = target_x + 42.0
		cutout_portrait.modulate = Color(1, 1, 1, 0)
		var tw: Tween = create_tween().set_parallel(true)
		tw.set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		tw.tween_property(cutout_portrait, "position:x", target_x, 0.30)
		tw.tween_property(cutout_portrait, "modulate:a", 1.0, 0.24)


# ==============================================================================
# MATCH SESSION LAUNCHERS
# ==============================================================================
func _start_campaign_match() -> void:
	var v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx)
	rival_active = true
	rival_id = str(v["boss_id"])
	rival_acc = float(v["rival_acc"])
	var qs: Array[Dictionary] = TriviaDB.select_campaign_round_questions(str(v["code"]), active_round_idx, 5)
	_begin_match_session("CAMPAIGN", str(v["code"]), qs, str(v["tier"]), v["tier_color"], float(v["timer_sec"]))


func _start_daily_match() -> void:
	active_mode = "DAILY"
	rival_active = false
	var qs: Array[Dictionary] = TriviaDB.select_daily_questions()
	_begin_match_session("DAILY", "global", qs, "DAILY MIX", SovereignTheme.GOLD_CHAMPAGNE, 19.0)


func _start_endless_match(fresh_run: bool) -> void:
	active_mode = "ENDLESS"
	rival_active = false
	if fresh_run:
		endless_depth = 0
		endless_banked = 0
		endless_unbanked = 0
		endless_tier_idx = 0
		shields = 3
	var venues: Array[Dictionary] = TriviaDB.get_venue_list()
	var v: Dictionary = venues[endless_tier_idx % venues.size()]
	var qs: Array[Dictionary] = TriviaDB.select_endless_batch(endless_depth, 5)
	_begin_match_session("ENDLESS", str(v["code"]), qs, str(v["tier"]), v["tier_color"], maxf(13.0, 20.0 - float(endless_tier_idx) * 1.5))


func _begin_match_session(
	mode_name: String,
	venue_code: String,
	questions: Array[Dictionary],
	diff_label_txt: String,
	diff_col: Color,
	base_timer_sec: float
) -> void:
	state = GameState.MATCH_PLAY
	active_mode = mode_name
	active_venue_code = venue_code
	match_questions = questions
	match_outcomes.clear()
	q_index = 0
	run_shuffle_salt = TriviaDB.get_daily_seed_utc() if mode_name == "DAILY" else int(Time.get_ticks_usec() & 0x7FFFFFFF)
	if mode_name != "ENDLESS" or endless_depth == 0:
		match_score = 0
		displayed_score = 0.0
		streak = 0
		best_streak = 0
		top_score_label.text = "0 PTS"

	rival_score = 0
	lifelines_5050_left = 2
	lifelines_hint_left = 2
	fork_triggered_this_match = false
	final_wager_triggered_this_match = false
	final_wager_amount = 0
	q_time_limit = base_timer_sec

	_hide_all_overlays()
	gameplay_hud.visible = true
	_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
	stage_rig.set_venue(venue_code)
	stage_rig.set_mood("PLAYING")
	_set_city_weather(venue_code)

	# Epic orchestral score on City Boss Round 5 & Apex Finale!
	var is_boss_match: bool = (mode_name == "CAMPAIGN" and (active_round_idx == 4 or active_city_idx == 7))
	if is_boss_match:
		AudioDirector.play_music_with_fallback("music_finale_epic", "music_showdown_tension", -10.5)
	else:
		AudioDirector.play_music("music_showdown_tension", -11.5)

	_style_difficulty_pill(top_diff_pill, top_diff_label, diff_label_txt, diff_col)

	var side_speaker: String = rival_id if rival_active else "vance"
	var prof: Dictionary = TriviaDB.get_cast_profile(side_speaker)
	gameplay_rival_name.text = str(prof["name"])
	if is_boss_match and rival_active:
		_trigger_rival_reaction(side_speaker, "on_boss_intro", true)
	else:
		_set_gameplay_rival_expression(side_speaker, "neutral", "Ready for Round %d!" % (active_round_idx + 1) if rival_active else "Hosting Live Broadcast")
	gameplay_rival_col.visible = _is_desktop_layout

	_load_current_question()


func _set_gameplay_rival_expression(actor_id: String, expr: String, status_text: String) -> void:
	_load_portrait_into(gameplay_rival_portrait, TriviaDB.get_cast_portrait_path(actor_id, expr))
	gameplay_rival_status.text = SovereignTheme.sanitize_display_text(status_text)
	if gameplay_rival_portrait != null and gameplay_rival_col.visible:
		var tw: Tween = create_tween()
		tw.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		gameplay_rival_portrait.scale = Vector2(1.04, 1.04)
		tw.tween_property(gameplay_rival_portrait, "scale", Vector2.ONE, 0.28)


func _trigger_rival_reaction(actor_id: String, trigger_key: String, play_vo: bool = true) -> void:
	var rx: Dictionary = TriviaDB.get_rival_reaction(actor_id, trigger_key)
	_set_gameplay_rival_expression(actor_id, str(rx["expression"]), str(rx["text"]))
	if play_vo:
		var clip: String = str(rx["voice_clip"])
		if not clip.is_empty():
			AudioDirector.play_voice(clip)


# ==============================================================================
# UNIFIED BROADCAST GAMEPLAY LOOP
# ==============================================================================
func _load_current_question() -> void:
	if q_index >= match_questions.size():
		if active_mode == "ENDLESS":
			_open_extraction_airlock()
			return
		_enter_match_summary()
		return

	var can_fork: bool = (q_index == 2) and (not fork_triggered_this_match) and (match_questions.size() >= 5) and (active_mode != "DAILY") and (not (active_mode == "CATEGORIES" and cat_selected_domains.size() == 1))
	if can_fork:
		fork_triggered_this_match = true
		_open_category_fork()
		return

	var can_final_wager: bool = (q_index == match_questions.size() - 1) and (not final_wager_triggered_this_match) and (active_mode in ["CAMPAIGN", "CATEGORIES", "DAILY"]) and (match_score >= 200) and (match_questions.size() >= 5)
	if can_final_wager:
		final_wager_triggered_this_match = true
		_open_final_wager()
		return

	_present_active_question()


func _open_category_fork() -> void:
	match_phase = MatchPhase.CATEGORY_FORK
	stage_rig.set_mood("DOUBLE_DOWN")
	_hide_all_tableau_decks()
	lifelines_row.visible = false
	reveal_panel.visible = false
	hint_drawer.visible = false
	wager_active_pill.visible = false
	format_cat_icon.visible = false
	_refresh_top_header_and_pips()

	var prev_dom: int = int(match_questions[q_index - 1].get("l0Domain", 0)) if q_index > 0 else -1
	var allow: Array[int] = []
	if active_mode == "CATEGORIES":
		allow = cat_selected_domains
	fork_domain_options = TriviaDB.pick_two_fork_domains(prev_dom, allow)

	format_tag_label.text = "MID-ROUND CHOICE  ·  PICK YOUR NEXT CATEGORY"
	prompt_label.text = "Choose which topic you want for Question %d:" % (q_index + 1)
	for i: int in range(2):
		var dm: Dictionary = TriviaDB.get_domain_meta(fork_domain_options[i])
		fork_opt_btns[i].text = str(dm["name"]).to_upper()
		fork_opt_btns[i].icon = SovereignTheme.load_category_icon_sized(fork_domain_options[i], 76)
	fork_deck.visible = true
	gameplay_rival_status.text = "Waiting for your category pick..."
	AudioDirector.play_peel_open(2)


func _on_fork_chosen(opt_idx: int) -> void:
	if match_phase != MatchPhase.CATEGORY_FORK:
		return
	AudioDirector.play_facet_snap()
	var chosen_dom: int = fork_domain_options[clampi(opt_idx, 0, 1)]
	var used_qids: Dictionary = {}
	for mq: Dictionary in match_questions:
		used_qids[int(mq.get("qid", 0))] = true

	var lo: float = -0.8
	var hi: float = 0.8
	if active_mode == "CAMPAIGN":
		var v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx)
		lo = float(v["irt_min"])
		hi = float(v["irt_max"])
	elif active_mode == "CATEGORIES":
		if cat_selected_diff == "EASY":
			lo = -1.8; hi = -0.2
		elif cat_selected_diff == "HARD":
			lo = 0.65; hi = 2.8

	var want_arch: String = str(match_questions[q_index].get("archetype", "SIGHTLINE_LOCK"))
	var swapped: Dictionary = TriviaDB.pick_fork_question(chosen_dom, lo, hi, want_arch, used_qids)
	if not swapped.is_empty():
		match_questions[q_index] = swapped
	_present_active_question()


func _open_final_wager() -> void:
	match_phase = MatchPhase.FINAL_WAGER
	stage_rig.set_mood("DOUBLE_DOWN")
	_hide_all_tableau_decks()
	lifelines_row.visible = false
	reveal_panel.visible = false
	hint_drawer.visible = false
	wager_active_pill.visible = false
	_refresh_top_header_and_pips()

	var next_q: Dictionary = match_questions[q_index]
	var dom_id: int = int(next_q.get("l0Domain", 0))
	var dm: Dictionary = TriviaDB.get_domain_meta(dom_id)
	var ico: Texture2D = SovereignTheme.load_category_icon(dom_id)
	format_cat_icon.texture = ico
	format_cat_icon.visible = ico != null
	format_tag_label.text = "FINAL SHOWDOWN WAGER  ·  CATEGORY: %s" % str(dm["name"]).to_upper()
	prompt_label.text = "Final Question! How many of your %s points will you wager?" % ShareClipboard.format_commas(match_score)

	var w25: int = int(round(float(match_score) * 0.25))
	var w50: int = int(round(float(match_score) * 0.50))
	final_wager_btns[0].text = "SAFE\n0 PTS"
	final_wager_btns[1].text = "25%%\n+%s" % ShareClipboard.format_commas(w25)
	final_wager_btns[2].text = "50%%\n+%s" % ShareClipboard.format_commas(w50)
	final_wager_btns[3].text = "ALL-IN!\n+%s" % ShareClipboard.format_commas(match_score)
	final_wager_deck.visible = true
	gameplay_rival_status.text = "Locking in their final wager..."
	AudioDirector.play_peel_open(3)


func _on_final_wager_selected(ratio: float) -> void:
	if match_phase != MatchPhase.FINAL_WAGER:
		return
	AudioDirector.play_lock_thunk(ratio >= 0.5)
	final_wager_amount = int(round(float(match_score) * ratio))
	_present_active_question()


func _present_active_question() -> void:
	current_q = match_questions[q_index]
	var arch: String = str(current_q.get("archetype", "SIGHTLINE_LOCK"))
	var dom_id: int = int(current_q.get("l0Domain", 0))
	var dom_meta: Dictionary = TriviaDB.get_domain_meta(dom_id)

	var cat_ico: Texture2D = SovereignTheme.load_category_icon(dom_id)
	format_cat_icon.texture = cat_ico
	format_cat_icon.visible = cat_ico != null

	selected_answer_idx = -1
	eliminated_facets = [false, false, false, false]
	used_5050_this_q = false
	used_hint_this_q = false
	wager_2x_armed = false
	rival_locked = false
	q_elapsed = 0.0

	var base_t: float = 20.0
	if active_mode == "CAMPAIGN":
		base_t = float(TriviaDB.get_venue_by_index(active_city_idx)["timer_sec"])
	elif active_mode == "ENDLESS":
		base_t = maxf(13.0, 20.0 - float(endless_tier_idx) * 1.5)
	match arch:
		"GAUNTLET_SHATTER":
			q_time_limit = minf(12.0, base_t * 0.65)
		"CALIBRATOR_DIAL", "CODEX_DUAL_RING":
			q_time_limit = base_t + 4.0
		_:
			q_time_limit = base_t
	q_time_remaining = q_time_limit
	rival_lock_time = clampf(q_time_limit * 0.42, 3.0, q_time_limit - 3.0)

	_hide_all_tableau_decks()
	reveal_panel.visible = false
	hint_drawer.visible = false
	wager_active_pill.visible = (final_wager_amount > 0)
	if final_wager_amount > 0:
		(wager_active_pill.get_child(0) as Label).text = "FINAL WAGER: %s" % ShareClipboard.format_commas(final_wager_amount)

	stage_rig.set_mood("DOUBLE_DOWN" if final_wager_amount > 0 else "PLAYING")
	_refresh_top_header_and_pips()

	var p_text: String = SovereignTheme.sanitize_display_text(str(current_q.get("prompt", "")))
	prompt_label.text = p_text
	prompt_label.add_theme_font_size_override("font_size", 36 if p_text.length() > 105 else 42)

	var dom_name: String = str(dom_meta["name"]).to_upper()
	var side_actor: String = rival_id if rival_active else "vance"
	match arch:
		"GAUNTLET_SHATTER":
			format_tag_label.text = "%s  ·  LIGHTNING · True, False, or Myth (%.0fs!)" % [dom_name, q_time_limit]
			lightning_deck.visible = true
			_reset_lightning_styles()
			_enable_lightning_btns(true)
			_set_gameplay_rival_expression(side_actor, "neutral", "Lightning round — trust your gut!")
		"CALIBRATOR_DIAL":
			current_cal_spec = TriviaDB.get_calibrator_spec(current_q)
			var min_v: float = float(current_cal_spec["min_val"])
			var max_v: float = float(current_cal_spec["max_val"])
			var step_v: float = float(current_cal_spec["step"])
			var margin_v: float = float(current_cal_spec["win_margin"])
			var unit_str: String = str(current_cal_spec["unit"])
			var mid_v: float = snappedf((min_v + max_v) * 0.5, step_v)

			calib_slider.min_value = min_v
			calib_slider.max_value = max_v
			calib_slider.step = step_v
			current_cal_guess = clampf(mid_v, min_v, max_v)
			calib_slider.set_value_no_signal(current_cal_guess)
			calib_slider.editable = true
			estimate_lock_btn.disabled = false

			var span: float = max_v - min_v
			cal_small_step = step_v
			cal_big_step = _pick_clean_big_step(span, step_v)
			var sm_lbl: String = _format_step_num(cal_small_step)
			var bg_lbl: String = _format_step_num(cal_big_step)
			estimate_nudge_btns[0].text = "-%s" % bg_lbl
			estimate_nudge_btns[1].text = "-%s" % sm_lbl
			estimate_nudge_btns[2].text = "+%s" % sm_lbl
			estimate_nudge_btns[3].text = "+%s" % bg_lbl
			for nb: Button in estimate_nudge_btns:
				nb.disabled = false

			format_tag_label.text = "%s  ·  ESTIMATE · Slide to your answer" % dom_name
			estimate_rule_label.text = "Drag the slider to your answer — Win if within ±%s!" % TriviaDB.format_calibrator_value(margin_v, unit_str)
			estimate_min_label.text = TriviaDB.format_calibrator_value(min_v, unit_str)
			estimate_max_label.text = TriviaDB.format_calibrator_value(max_v, unit_str)
			_refresh_estimate_value_label()
			estimate_deck.visible = true
			_set_gameplay_rival_expression(side_actor, "neutral", "Dialing in an estimate...")
		"CODEX_DUAL_RING":
			codex_spec = TriviaDB.get_codex_spec(current_q)
			codex_slots = [0, 1, 2]
			format_tag_label.text = "%s  ·  MATCH PAIRS · Tap right buttons to match all 3" % dom_name
			codex_deck.visible = true
			codex_lock_btn.disabled = false
			for tb: Button in codex_target_btns:
				tb.disabled = false
			_refresh_codex_ui()
			_set_gameplay_rival_expression(side_actor, "neutral", "Decoding the 3 pairs...")
		_:
			current_facets = TriviaDB.get_answer_facets(current_q, run_shuffle_salt)
			format_tag_label.text = "%s  ·  CLASSIC · Pick 1 of 4" % dom_name
			classic_deck.visible = true
			_refresh_classic_pills()
			_set_gameplay_rival_expression(side_actor, "neutral", "Studying the board..." if rival_active else "Choose your answer!")

	lifelines_row.visible = true
	_refresh_lifelines_ui()

	chrono_bar.value = 100.0
	chrono_time_label.text = "%.1fs" % q_time_limit
	match_phase = MatchPhase.ACTIVE


func _hide_all_tableau_decks() -> void:
	classic_deck.visible = false
	lightning_deck.visible = false
	estimate_deck.visible = false
	codex_deck.visible = false
	fork_deck.visible = false
	final_wager_deck.visible = false
	airlock_deck.visible = false


func _refresh_top_header_and_pips() -> void:
	match active_mode:
		"CAMPAIGN":
			var v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx)
			top_venue_label.text = "%s · ROUND %d" % [str(v["short"]).to_upper(), active_round_idx + 1]
		"DAILY":
			top_venue_label.text = "DAILY #%d" % ShareClipboard.get_daily_edition_number()
		"CATEGORIES":
			var tag: String = "MIXED" if cat_selected_domains.is_empty() else (str(TriviaDB.get_domain_meta(cat_selected_domains[0])["short"]).to_upper() if cat_selected_domains.size() == 1 else "%d TOPICS" % cat_selected_domains.size())
			top_venue_label.text = "CUSTOM · %s" % tag
		"ENDLESS":
			top_venue_label.text = "ENDLESS · Q%d" % (endless_depth + 1)

	top_shields_label.visible = (active_mode == "ENDLESS")
	if active_mode == "ENDLESS":
		var sh: Array[String] = []
		for i: int in range(3):
			sh.append("[I]" if i < shields else "[ ]")
		top_shields_label.text = " ".join(sh)

	top_streak_pill.visible = (streak >= 2)
	if streak >= 2:
		top_streak_label.text = "STREAK x%d" % streak

	for ch: Node in progress_pips_row.get_children():
		ch.queue_free()
	var total_pips: int = mini(10, match_questions.size())
	var pip_offset: int = maxi(0, q_index - 9) if match_questions.size() > 10 else 0
	for idx: int in range(total_pips):
		var real_i: int = pip_offset + idx
		var p: PanelContainer = PanelContainer.new()
		p.custom_minimum_size = Vector2(40, 34)
		var bg: Color = Color(0.08, 0.10, 0.16, 0.72)
		var bd: Color = Color(0.45, 0.50, 0.60, 0.35)
		if real_i < match_outcomes.size():
			var ok: bool = bool(match_outcomes[real_i].get("correct", false))
			bg = Color(0.07, 0.34, 0.22, 0.96) if ok else Color(0.36, 0.08, 0.11, 0.96)
			bd = Color("#26b87a") if ok else SovereignTheme.CRIMSON_FRACTURE
		elif real_i == q_index:
			bg = Color(0.48, 0.36, 0.08, 0.96)
			bd = SovereignTheme.GOLD_CHAMPAGNE
		p.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(bg, bd, 10, 2, 4, 2))
		var pl: Label = Label.new()
		pl.text = str(real_i + 1)
		pl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		pl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		pl.add_theme_font_override("font", SovereignTheme.font_mono())
		pl.add_theme_font_size_override("font_size", 20)
		pl.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
		p.add_child(pl)
		progress_pips_row.add_child(p)

	if rival_active:
		var rprof: Dictionary = TriviaDB.get_cast_profile(rival_id)
		h2h_label.text = "YOU %s  vs  %s %s" % [
			ShareClipboard.format_commas(match_score),
			str(rprof["short_name"]).to_upper(),
			ShareClipboard.format_commas(rival_score),
		]
	else:
		var solved: int = 0
		for o: Dictionary in match_outcomes:
			if bool(o.get("correct", false)):
				solved += 1
		h2h_label.text = "Q %d / %d  ·  %d RIGHT" % [q_index + 1, match_questions.size(), solved]


func _refresh_classic_pills(reveal_mode: bool = false) -> void:
	for i: int in range(mini(4, current_facets.size())):
		var btn: Button = answer_pill_btns[i]
		var f: Dictionary = current_facets[i]
		var txt: String = "%s.  %s" % [LETTER_BADGES[i], SovereignTheme.sanitize_display_text(str(f.get("text", "")))]
		btn.text = txt
		btn.add_theme_font_size_override("font_size", 30 if txt.length() > 28 else 36)

		if reveal_mode:
			btn.disabled = true
			var is_cor: bool = bool(f.get("is_correct", false))
			if is_cor:
				SovereignTheme.style_answer_pill(btn, "correct")
			elif i == selected_answer_idx:
				SovereignTheme.style_answer_pill(btn, "wrong")
			elif eliminated_facets[i]:
				SovereignTheme.style_answer_pill(btn, "eliminated")
			else:
				SovereignTheme.style_answer_pill(btn, "normal")
		elif match_phase == MatchPhase.SUSPENSE_LOCK:
			btn.disabled = true
			SovereignTheme.style_answer_pill(btn, "focused" if i == selected_answer_idx else ("eliminated" if eliminated_facets[i] else "normal"))
		else:
			if eliminated_facets[i]:
				btn.disabled = true
				SovereignTheme.style_answer_pill(btn, "eliminated")
			else:
				btn.disabled = false
				SovereignTheme.style_answer_pill(btn, "normal")


func _refresh_lifelines_ui() -> void:
	var is_classic: bool = classic_deck.visible
	lifeline_5050_btn.visible = is_classic
	lifeline_5050_btn.text = "50 / 50 (%d)" % lifelines_5050_left
	lifeline_5050_btn.disabled = (not is_classic) or used_5050_this_q or lifelines_5050_left <= 0
	SovereignTheme.style_answer_pill(lifeline_5050_btn, "eliminated" if lifeline_5050_btn.disabled else "normal")

	lifeline_hint_btn.text = "HINT (%d)" % lifelines_hint_left
	lifeline_hint_btn.disabled = used_hint_this_q or lifelines_hint_left <= 0
	SovereignTheme.style_answer_pill(lifeline_hint_btn, "eliminated" if lifeline_hint_btn.disabled else "normal")

	var has_final: bool = final_wager_amount > 0
	lifeline_wager_btn.disabled = has_final
	lifeline_wager_btn.text = "2x WAGER ON!" if wager_2x_armed else "2x WAGER"
	if wager_2x_armed:
		SovereignTheme.style_primary_gold_cta(lifeline_wager_btn, false)
	else:
		SovereignTheme.style_answer_pill(lifeline_wager_btn, "eliminated" if has_final else "normal")


# --- Lifelines ---
func _on_lifeline_5050() -> void:
	if match_phase != MatchPhase.ACTIVE or used_5050_this_q or lifelines_5050_left <= 0 or not classic_deck.visible:
		return
	used_5050_this_q = true
	lifelines_5050_left -= 1
	AudioDirector.play_peel_open(3)

	var wrong_indices: Array[int] = []
	for i: int in range(current_facets.size()):
		if not bool(current_facets[i].get("is_correct", false)):
			wrong_indices.append(i)
	wrong_indices.sort_custom(func(a: int, b: int) -> bool:
		return float(current_facets[a].get("plausibility", 0.5)) < float(current_facets[b].get("plausibility", 0.5))
	)
	for k: int in range(mini(2, wrong_indices.size())):
		eliminated_facets[wrong_indices[k]] = true
	_refresh_classic_pills(false)
	_refresh_lifelines_ui()


func _on_lifeline_hint() -> void:
	if match_phase != MatchPhase.ACTIVE or used_hint_this_q or lifelines_hint_left <= 0:
		return
	used_hint_this_q = true
	lifelines_hint_left -= 1
	AudioDirector.play_peel_open(2)

	var clues: Variant = current_q.get("clues", [])
	var clue_txt: String = ""
	if clues is Array and not (clues as Array).is_empty():
		clue_txt = str((clues as Array)[0])
	if clue_txt.is_empty():
		clue_txt = "Focus on the core historical or scientific origin mentioned in the prompt."
	hint_label.text = SovereignTheme.sanitize_display_text("HINT: " + clue_txt)
	hint_drawer.visible = true
	_refresh_lifelines_ui()


func _on_lifeline_wager_toggle() -> void:
	if match_phase != MatchPhase.ACTIVE or final_wager_amount > 0:
		return
	wager_2x_armed = not wager_2x_armed
	wager_active_pill.visible = wager_2x_armed
	var side_actor: String = rival_id if rival_active else "vance"
	if wager_2x_armed:
		(wager_active_pill.get_child(0) as Label).text = "2x WAGER LIVE"
		stage_rig.set_mood("DOUBLE_DOWN")
		AudioDirector.play_sfx("sfx_overclock_rise", -6.0, 0.01, 1.0)
		_set_gameplay_rival_expression(side_actor, "intense", "Bold 2x Wager! High stakes!")
	else:
		stage_rig.set_mood("PLAYING")
		AudioDirector.play_ui_click()
		_set_gameplay_rival_expression(side_actor, "neutral", "Playing it steady...")
	_refresh_lifelines_ui()


# --- Answer Lock Handlers ---
func _capture_btn_center(btn: Control) -> void:
	if btn != null:
		_last_tapped_screen_pos = btn.global_position + btn.size * 0.5


func _on_classic_answer_tapped(idx: int) -> void:
	if match_phase != MatchPhase.ACTIVE or eliminated_facets[idx]:
		return
	selected_answer_idx = idx
	_capture_btn_center(answer_pill_btns[idx])
	var ev: Dictionary = TriviaDB.evaluate_choice_answer(
		current_q, current_facets[idx], used_hint_this_q, used_5050_this_q, wager_2x_armed, q_elapsed, q_time_limit, streak
	)
	_enter_suspense_lock(ev)
	_refresh_classic_pills(false)


func _on_lightning_picked(dir: String, src_btn: Button) -> void:
	if match_phase != MatchPhase.ACTIVE:
		return
	_capture_btn_center(src_btn)
	_enable_lightning_btns(false)
	var ev: Dictionary = TriviaDB.evaluate_gauntlet(current_q, dir, q_elapsed, q_time_limit, wager_2x_armed)
	if str(ev.get("correct_answer", "")) == "TRICK QUESTION!":
		ev["correct_answer"] = "MYTH 2x!"
	_enter_suspense_lock(ev)


func _enable_lightning_btns(en: bool) -> void:
	lightning_false_btn.disabled = not en
	lightning_myth_btn.disabled = not en
	lightning_true_btn.disabled = not en


func _highlight_lightning_reveal() -> void:
	var g: Dictionary = current_q.get("gauntletExt", {}) as Dictionary if current_q.get("gauntletExt") is Dictionary else {}
	var is_true: bool = bool(g.get("isTrue", true))
	var is_trick: bool = bool(g.get("isTrick", false))
	SovereignTheme.style_answer_pill(lightning_false_btn, "correct" if (not is_true and not is_trick) else "locked")
	SovereignTheme.style_answer_pill(lightning_myth_btn, "correct" if is_trick else "locked")
	SovereignTheme.style_answer_pill(lightning_true_btn, "correct" if (is_true and not is_trick) else "locked")


func _on_estimate_slider_changed(val: float) -> void:
	current_cal_guess = val
	_refresh_estimate_value_label()
	AudioDirector.play_spin_tick(0.25)


func _on_estimate_nudge(sign_code: int) -> void:
	if match_phase != MatchPhase.ACTIVE:
		return
	var delta_v: float = (cal_big_step if absi(sign_code) >= 2 else cal_small_step) * (1.0 if sign_code > 0 else -1.0)
	current_cal_guess = clampf(current_cal_guess + delta_v, calib_slider.min_value, calib_slider.max_value)
	calib_slider.set_value_no_signal(current_cal_guess)
	_refresh_estimate_value_label()
	AudioDirector.play_ui_click()


func _refresh_estimate_value_label() -> void:
	var unit_str: String = str(current_cal_spec.get("unit", ""))
	estimate_value_label.text = "YOUR ESTIMATE: %s" % TriviaDB.format_calibrator_value(current_cal_guess, unit_str)


func _on_estimate_lock_pressed() -> void:
	if match_phase != MatchPhase.ACTIVE:
		return
	_capture_btn_center(estimate_lock_btn)
	calib_slider.editable = false
	estimate_lock_btn.disabled = true
	for nb: Button in estimate_nudge_btns:
		nb.disabled = true
	var ev: Dictionary = TriviaDB.evaluate_direct_estimate(current_q, current_cal_guess, q_elapsed, q_time_limit, wager_2x_armed, streak)
	_enter_suspense_lock(ev)


func _rotate_codex_ring(ring_idx: int) -> void:
	if match_phase != MatchPhase.ACTIVE:
		return
	var targets: Array = codex_spec.get("targets", []) as Array
	if targets.is_empty():
		return
	codex_slots[ring_idx] = (codex_slots[ring_idx] + 1) % targets.size()
	AudioDirector.play_facet_snap()
	_refresh_codex_ui()


func _refresh_codex_ui() -> void:
	var subs: Array = codex_spec.get("subjects", []) as Array
	var targets: Array = codex_spec.get("targets", []) as Array
	for i: int in range(mini(3, subs.size())):
		codex_subject_labels[i].text = SovereignTheme.sanitize_display_text(str(subs[i]))
		var t_str: String = SovereignTheme.sanitize_display_text(str(targets[codex_slots[i] % maxi(1, targets.size())])) if not targets.is_empty() else "-"
		codex_target_btns[i].text = "<  %s  >" % t_str


func _on_codex_lock_pressed() -> void:
	if match_phase != MatchPhase.ACTIVE:
		return
	_capture_btn_center(codex_lock_btn)
	codex_lock_btn.disabled = true
	for tb: Button in codex_target_btns:
		tb.disabled = true
	var targets: Array = codex_spec.get("targets", []) as Array
	var chosen: Array[String] = []
	for i: int in range(3):
		chosen.append(str(targets[codex_slots[i] % maxi(1, targets.size())]) if not targets.is_empty() else "")
	var ev: Dictionary = TriviaDB.evaluate_codex(current_q, chosen, q_elapsed, q_time_limit, wager_2x_armed)
	_enter_suspense_lock(ev)


# --- Suspense Beat -> Explosive VFX & Reactive Rival Reveal ---
func _enter_suspense_lock(ev: Dictionary) -> void:
	pending_eval = ev
	lifelines_row.visible = false
	match_phase = MatchPhase.SUSPENSE_LOCK
	suspense_timer = 0.55 if (wager_2x_armed or final_wager_amount > 0) else 0.35
	stage_rig.set_mood("SUSPENSE")
	AudioDirector.set_suspense_duck(true)
	AudioDirector.play_lock_thunk(wager_2x_armed or final_wager_amount > 0)


func _punch_tableau(correct: bool) -> void:
	if tableau_card == null:
		return
	tableau_card.pivot_offset = tableau_card.size * 0.5
	var tw: Tween = create_tween()
	if correct:
		tw.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		tw.tween_property(tableau_card, "scale", Vector2(1.022, 1.022), 0.11)
		tw.tween_property(tableau_card, "scale", Vector2.ONE, 0.22)
	else:
		var base_x: float = tableau_card.position.x
		tw.tween_property(tableau_card, "position:x", base_x - 10.0, 0.05)
		tw.tween_property(tableau_card, "position:x", base_x + 10.0, 0.06)
		tw.tween_property(tableau_card, "position:x", base_x - 5.0, 0.05)
		tw.tween_property(tableau_card, "position:x", base_x, 0.06)


func _resolve_reveal() -> void:
	AudioDirector.set_suspense_duck(false)
	match_phase = MatchPhase.REVEAL

	var correct: bool = bool(pending_eval.get("correct", false))
	var backfired: bool = bool(pending_eval.get("backfired", false))
	var bullseye: bool = bool(pending_eval.get("bullseye", false))
	var pts: int = int(pending_eval.get("total_points", 0))

	if final_wager_amount > 0:
		if correct:
			pts += final_wager_amount
		else:
			pts = -final_wager_amount

	if active_mode == "ENDLESS":
		var mult: float = ENDLESS_TIER_MULTS[clampi(endless_tier_idx, 0, ENDLESS_TIER_MULTS.size() - 1)]
		pts = int(round(float(pts) * mult))
		if pts > 0:
			endless_unbanked += pts
		endless_depth += 1

	match_score = maxi(0, match_score + pts)
	match_outcomes.append(pending_eval)

	# Rival score update
	if rival_active:
		var rng: RandomNumberGenerator = RandomNumberGenerator.new()
		rng.seed = int(current_q.get("qid", 1)) * 31 + q_index * 17 + run_shuffle_salt
		if rng.randf() < rival_acc:
			rival_score += 550 + rng.randi_range(40, 180)

	_punch_tableau(correct)

	if correct:
		streak += 1
		best_streak = maxi(best_streak, streak)
		stage_rig.set_mood("WIN")
		_vfx_correct_burst(_last_tapped_screen_pos, streak)
		if bullseye or wager_2x_armed or final_wager_amount > 0:
			_vfx_bullseye_burst()
			AudioDirector.play_reveal_win(true)
		else:
			AudioDirector.play_streak_chime(streak)

		# Live Reactive Rival / Host expression & voiced banter!
		if rival_active:
			if streak >= 2:
				_trigger_rival_reaction(rival_id, "on_player_streak", true)
			else:
				_set_gameplay_rival_expression(rival_id, "neutral", "Matched your pace!" if rival_score >= match_score else "Good read—stay alert!")
		else:
			var host_line: String = "Brilliant streak! Keep rolling!" if streak >= 2 else ("Bold wager paid off!" if (wager_2x_armed or final_wager_amount > 0) else "Clean read! Nice work.")
			_set_gameplay_rival_expression("vance", "intense" if streak >= 3 else "neutral", host_line)
			if streak >= 2:
				AudioDirector.play_voice(VANCE_WIN_CLIPS[streak % VANCE_WIN_CLIPS.size()])
	else:
		streak = 0
		if active_mode == "ENDLESS":
			shields = maxi(0, shields - (2 if wager_2x_armed else 1))
		stage_rig.set_mood("WRONG")
		_vfx_wrong_pulse()
		AudioDirector.play_reveal_backfire(backfired)

		if rival_active:
			var trig: String = "on_rival_ahead" if rival_score > match_score else "on_player_miss"
			_trigger_rival_reaction(rival_id, trig, true)
		else:
			_set_gameplay_rival_expression("vance", "intense" if backfired else "neutral", "Tough break—shake it off!" if not backfired else "High stakes cut both ways!")
			AudioDirector.play_voice("vance_backfire" if backfired else "vance_wrong")

	if classic_deck.visible:
		_refresh_classic_pills(true)
	elif lightning_deck.visible:
		_highlight_lightning_reveal()
	_refresh_top_header_and_pips()

	var compare_line: String = str(pending_eval.get("compare_line", ""))
	var ans_str: String = SovereignTheme.sanitize_display_text(str(pending_eval.get("correct_answer", "")))
	if not compare_line.is_empty():
		var pts_tag: String = ("  +%s PTS" % ShareClipboard.format_commas(pts)) if pts > 0 else ""
		reveal_header_label.text = SovereignTheme.sanitize_display_text(compare_line + pts_tag)
		reveal_header_label.add_theme_color_override("font_color", SovereignTheme.EMERALD_LOCK if correct else SovereignTheme.CRIMSON_FRACTURE)
	elif correct:
		var tag: String = "2x WAGER HIT!" if wager_2x_armed else ("FINAL WAGER WON!" if final_wager_amount > 0 else "CORRECT!")
		reveal_header_label.text = "%s  +%s PTS" % [tag, ShareClipboard.format_commas(pts)]
		reveal_header_label.add_theme_color_override("font_color", SovereignTheme.EMERALD_LOCK)
	else:
		var loss_tag: String = (" (%s PTS)" % ShareClipboard.format_commas(pts)) if pts < 0 else ""
		reveal_header_label.text = "MISSED%s  ·  ANSWER: %s" % [loss_tag, ans_str]
		reveal_header_label.add_theme_color_override("font_color", SovereignTheme.CRIMSON_FRACTURE)

	reveal_why_label.text = SovereignTheme.sanitize_display_text("Did you know? " + str(pending_eval.get("why", "")))
	reveal_bookmark_btn.text = "SAVED" if (TriviaDB.save_state.get("bookmarks", []) as Array).has(int(current_q.get("qid", 0))) else "SAVE"

	var fatal_endless: bool = (active_mode == "ENDLESS" and shields <= 0)
	if fatal_endless:
		reveal_next_btn.text = "VIEW RESULTS >"
	elif q_index >= match_questions.size() - 1:
		reveal_next_btn.text = "OPEN CHECKPOINT >" if active_mode == "ENDLESS" else "VIEW RESULTS >"
	else:
		reveal_next_btn.text = "NEXT QUESTION >"

	reveal_panel.visible = true
	final_wager_amount = 0


func _on_reveal_next_pressed() -> void:
	if match_phase != MatchPhase.REVEAL:
		return
	AudioDirector.play_ui_click()
	if active_mode == "ENDLESS" and shields <= 0:
		endless_unbanked = int(round(float(endless_unbanked) * 0.5))
		match_score = endless_banked + endless_unbanked
		_enter_match_summary()
		return
	q_index += 1
	_load_current_question()


func _on_bookmark_pressed() -> void:
	AudioDirector.play_ui_click()
	var saved: bool = TriviaDB.toggle_bookmark(int(current_q.get("qid", 0)))
	reveal_bookmark_btn.text = "SAVED" if saved else "SAVE"


# --- Endless Checkpoint ---
func _open_extraction_airlock() -> void:
	match_phase = MatchPhase.AIRLOCK_CHOICE
	stage_rig.set_mood("DOUBLE_DOWN")
	_hide_all_tableau_decks()
	lifelines_row.visible = false
	reveal_panel.visible = false
	format_cat_icon.visible = false
	format_tag_label.text = "ENDLESS CHECKPOINT · DEPTH %d" % endless_depth
	prompt_label.text = "Bank your score safely, or push deeper for higher multipliers!"
	var cur_m: float = ENDLESS_TIER_MULTS[clampi(endless_tier_idx, 0, ENDLESS_TIER_MULTS.size() - 1)]
	var nxt_m: float = ENDLESS_TIER_MULTS[clampi(endless_tier_idx + 1, 0, ENDLESS_TIER_MULTS.size() - 1)]
	airlock_stats_label.text = "Banked: %s  ·  At Risk: %s  ·  Next Multiplier: %.1fx (Current %.1fx)" % [
		ShareClipboard.format_commas(endless_banked),
		ShareClipboard.format_commas(endless_unbanked),
		nxt_m,
		cur_m,
	]
	airlock_deck.visible = true


func _on_airlock_extract() -> void:
	AudioDirector.play_reveal_win(true)
	endless_banked += endless_unbanked
	endless_unbanked = 0
	match_score = endless_banked
	TriviaDB.save_state["endless_banked_prestige"] = int(TriviaDB.save_state.get("endless_banked_prestige", 0)) + endless_banked
	TriviaDB.save_state["endless_best_score"] = maxi(int(TriviaDB.save_state.get("endless_best_score", 0)), endless_banked)
	TriviaDB.save_state["endless_best_depth"] = maxi(int(TriviaDB.save_state.get("endless_best_depth", 0)), endless_depth)
	TriviaDB.save_campaign_state()
	_enter_match_summary()


func _on_airlock_descend() -> void:
	AudioDirector.play_lock_thunk(true)
	endless_tier_idx = mini(endless_tier_idx + 1, ENDLESS_TIER_MULTS.size() - 1)
	_start_endless_match(false)


# ==============================================================================
# VICTORY SUMMARY + 3D CHAMPIONSHIP CROWN TROPHY CELEBRATION
# ==============================================================================
func _enter_match_summary() -> void:
	state = GameState.MATCH_SUMMARY
	match_phase = MatchPhase.IDLE
	_hide_all_overlays()
	summary_overlay.visible = true

	var solved: int = 0
	for o: Dictionary in match_outcomes:
		if bool(o.get("correct", false)):
			solved += 1
	var total: int = maxi(1, match_outcomes.size())
	var acc: float = float(solved) / float(total)
	var is_boss: bool = (active_mode == "CAMPAIGN" and active_round_idx == 4)
	var passed: bool = (solved >= int(ceil(float(total) * 0.6))) and ((not is_boss) or match_score >= rival_score)
	if active_mode == "ENDLESS":
		passed = shields > 0

	var stars: int = 0
	if passed:
		stars = 3 if (acc >= 0.99 or solved >= total) else (2 if acc >= 0.78 else 1)

	# Spin the 3D Championship Crown Trophy proudly on City Boss Victory!
	var show_trophy: bool = (active_mode == "CAMPAIGN" and is_boss and passed)
	summary_trophy_spacer.visible = show_trophy
	summary_vbox.alignment = BoxContainer.ALIGNMENT_END if show_trophy else BoxContainer.ALIGNMENT_CENTER
	if show_trophy:
		_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.TROPHY, CinematicCameraRig.SHOT_TROPHY_HERO)
		stage_rig.set_mood("DOUBLE_DOWN")
		_vfx_bullseye_burst()
		AudioDirector.play_music_with_fallback("music_finale_epic", "music_vetting_ambient", -11.0)
	else:
		_set_hero_3d_mode(HeroArtifactRig.ArtifactMode.NONE)
		stage_rig.set_mood("TITLE")
		AudioDirector.play_music("music_vetting_ambient", -11.0)

	if active_mode == "CAMPAIGN" and is_boss and passed:
		var def_rx: Dictionary = TriviaDB.get_rival_reaction(rival_id, "on_defeat")
		if not AudioDirector.play_voice(str(def_rx["voice_clip"])):
			AudioDirector.play_voice("vance_victory")
	else:
		AudioDirector.play_voice("vance_victory" if passed else "vance_defeat")

	summary_score_label.text = "%s PTS" % ShareClipboard.format_commas(match_score)
	summary_share_box.visible = false
	summary_copy_btn.visible = false

	for ch: Node in summary_star_row.get_children():
		ch.queue_free()
	summary_star_row.visible = (active_mode == "CAMPAIGN")
	if active_mode == "CAMPAIGN":
		for s: int in range(3):
			summary_star_row.add_child(SovereignTheme.make_star_control(s < stars, 72))

	if active_mode == "DAILY":
		summary_title.text = "DAILY BROADCAST #%d" % ShareClipboard.get_daily_edition_number()
		summary_stats_label.text = "%d / %d Correct  ·  Best Streak %d" % [solved, total, best_streak]
		_last_share_text = ShareClipboard.format_daily_share_card(match_outcomes, match_score, best_streak)
		TriviaDB.record_daily_completion(match_score, _last_share_text)
		_populate_daily_visual_badges(match_outcomes, match_score, solved, total)
		summary_share_box.visible = true
		summary_copy_btn.visible = true
		summary_copy_btn.text = "COPY SHARE CARD"
		summary_hook_label.text = "Tap Copy Share Card to paste your spoiler-free emoji results anywhere!"
		summary_primary_btn.text = "PLAY CAMPAIGN >"
		summary_secondary_btn.text = "RETURN TO TITLE"
	elif active_mode == "CAMPAIGN":
		var v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx)
		var rprof: Dictionary = TriviaDB.get_cast_profile(rival_id)
		var mnum: int = active_city_idx * 5 + active_round_idx + 1
		var mid: String = str(active_mission.get("id", "%s_%d" % [str(v["code"]), active_round_idx + 1]))
		summary_stats_label.text = "%d / %d Correct  ·  Best Streak %d  ·  YOU %s vs %s %s" % [
			solved, total, best_streak,
			ShareClipboard.format_commas(match_score),
			str(rprof["short_name"]).to_upper(),
			ShareClipboard.format_commas(rival_score),
		]
		if passed:
			TriviaDB.mark_mission_completed(mid, mini(40, mnum + 1), stars)
			if mnum >= 40:
				summary_title.text = "WORLD'S SMARTEST CHAMPION!"
				summary_hook_label.text = "You conquered all 8 cities and claimed the $100M Championship Crown!"
				summary_primary_btn.text = "TOUR HUB >"
			elif active_round_idx == 4:
				var next_v: Dictionary = TriviaDB.get_venue_by_index(active_city_idx + 1)
				summary_title.text = "%s CONQUERED!" % str(v["city"]).to_upper()
				summary_hook_label.text = "City Unlocked: %s (%s) · New Conspiracy Clue Added to Dossier!" % [str(next_v["city"]), str(next_v["tier"])]
				summary_primary_btn.text = "FLY TO %s >" % str(next_v["short"]).to_upper()
			else:
				summary_title.text = "ROUND %d CLEARED!" % (active_round_idx + 1)
				summary_hook_label.text = SovereignTheme.sanitize_display_text(str(active_mission.get("cliffhanger_hook", "Great round! Step up for the next challenge.")))
				summary_primary_btn.text = "NEXT ROUND (%d/5) >" % (active_round_idx + 2)
		else:
			summary_title.text = "ROUND FAILED — TRY AGAIN"
			summary_hook_label.text = "Need 3 of 5 right%s to advance. You've got this!" % (" and to beat " + str(rprof["short_name"]) if is_boss else "")
			summary_primary_btn.text = "RETRY ROUND %d >" % (active_round_idx + 1)
		summary_secondary_btn.text = "CAMPAIGN HUB"
	elif active_mode == "CATEGORIES":
		var topic_tag: String = "All Categories" if cat_selected_domains.is_empty() else (str(TriviaDB.get_domain_meta(cat_selected_domains[0])["name"]) if cat_selected_domains.size() == 1 else "%d Categories" % cat_selected_domains.size())
		summary_title.text = "CUSTOM TRIVIA COMPLETE"
		summary_stats_label.text = "%d / %d Correct  ·  Best Streak %d  ·  %s" % [solved, total, best_streak, cat_selected_diff]
		summary_hook_label.text = "Topics: %s" % topic_tag
		summary_primary_btn.text = "PLAY AGAIN >"
		summary_secondary_btn.text = "CHANGE CATEGORIES"
	else:
		summary_title.text = "RUN BANKED!" if shields > 0 else "SHIELDS DEPLETED"
		summary_stats_label.text = "Depth %d  ·  Best Streak %d  ·  Total Banked %s" % [
			endless_depth, best_streak, ShareClipboard.format_commas(int(TriviaDB.save_state.get("endless_banked_prestige", 0)))
		]
		summary_hook_label.text = "Each depth climbs higher in difficulty and points multiplier."
		summary_primary_btn.text = "NEW ENDLESS RUN >"
		summary_secondary_btn.text = "RETURN TO TITLE"


func _populate_daily_visual_badges(outcomes: Array[Dictionary], score: int, solved: int, total: int) -> void:
	for ch: Node in summary_badge_row.get_children():
		ch.queue_free()
	var wagers: int = 0
	for o: Dictionary in outcomes:
		var correct: bool = bool(o.get("correct", false))
		var backfired: bool = bool(o.get("backfired", false))
		var bullseye: bool = bool(o.get("bullseye", false))
		var oc: bool = bool(o.get("overclocked", false))
		var pt: int = int(o.get("peel_tier", 1))
		if correct and oc:
			wagers += 1

		var tag: String = "X"
		var bg: Color = Color(0.16, 0.18, 0.24, 0.90)
		var border: Color = Color(0.45, 0.50, 0.60, 0.60)
		if (not correct) and backfired:
			tag = "2xX"
			bg = Color(0.48, 0.10, 0.14, 0.95)
			border = SovereignTheme.CRIMSON_FRACTURE
		elif correct and bullseye:
			tag = "HIT"
			bg = Color(0.08, 0.34, 0.38, 0.95)
			border = SovereignTheme.CYAN_INTEL
		elif correct and oc and pt <= 1:
			tag = "2x"
			bg = Color(0.56, 0.42, 0.12, 0.95)
			border = SovereignTheme.GOLD_CHAMPAGNE
		elif correct and pt <= 1:
			tag = "OK"
			bg = Color(0.08, 0.34, 0.22, 0.95)
			border = SovereignTheme.EMERALD_LOCK
		elif correct:
			tag = "H"
			bg = Color(0.12, 0.24, 0.42, 0.95)
			border = Color(0.42, 0.68, 0.98)

		var chip: PanelContainer = PanelContainer.new()
		chip.custom_minimum_size = Vector2(88, 62)
		chip.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(bg, border, 14, 2, 6, 6))
		var lbl: Label = Label.new()
		lbl.text = tag
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		lbl.add_theme_font_override("font", SovereignTheme.font_mono())
		lbl.add_theme_font_size_override("font_size", 26)
		lbl.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
		chip.add_child(lbl)
		summary_badge_row.add_child(chip)

	var top_pct: int = ShareClipboard.estimate_top_percentile(score, solved, total)
	summary_share_preview.text = "WORLD'S SMARTEST · #%d  ·  TOP %d%%\n%d/%d SOLVED  ·  %d BONUS HITS  ·  STREAK %d" % [
		ShareClipboard.get_daily_edition_number(), top_pct, solved, total, wagers, best_streak
	]


func _on_copy_daily_share() -> void:
	ShareClipboard.copy_text(_last_share_text)
	AudioDirector.play_facet_snap()
	summary_copy_btn.text = "COPIED TO CLIPBOARD!"
	var tw: Tween = create_tween()
	tw.tween_interval(2.0)
	tw.tween_callback(func() -> void:
		if summary_copy_btn != null:
			summary_copy_btn.text = "COPY SHARE CARD"
	)


func _on_summary_primary() -> void:
	AudioDirector.play_facet_snap()
	if active_mode == "CAMPAIGN":
		if summary_primary_btn.text.contains("RETRY"):
			_launch_campaign_round(active_city_idx, active_round_idx, active_mission)
		elif active_city_idx == 7 and active_round_idx == 4:
			_enter_campaign_hub()
		else:
			var next_num: int = mini(40, active_city_idx * 5 + active_round_idx + 2)
			var next_city: int = (next_num - 1) / 5
			var next_round: int = (next_num - 1) % 5
			var nv: Dictionary = TriviaDB.get_venue_by_index(next_city)
			var nms: Array[Dictionary] = TriviaDB.get_missions_for_hub(str(nv["region"]))
			var nm: Dictionary = nms[next_round] if next_round < nms.size() else TriviaDB.get_mission_by_number(next_num)
			_launch_campaign_round(next_city, next_round, nm)
	elif active_mode == "CATEGORIES":
		_on_cat_start_pressed()
	elif active_mode == "DAILY":
		_enter_campaign_hub()
	else:
		_start_endless_match(true)


func _on_summary_secondary() -> void:
	AudioDirector.play_ui_click()
	if active_mode == "CAMPAIGN":
		_enter_campaign_hub()
	elif active_mode == "CATEGORIES":
		_enter_categories_picker()
	else:
		_enter_title_screen()


# ==============================================================================
# SETTINGS, AUDIO & MAIN LOOP
# ==============================================================================
func _open_settings_modal() -> void:
	AudioDirector.play_ui_click()
	_refresh_settings_labels()
	settings_modal.visible = true


func _refresh_settings_labels() -> void:
	settings_voice_btn.text = "VOICE ACTING: %s" % ("ON" if AudioDirector.voice_enabled else "OFF")
	settings_music_btn.text = "MUSIC: %s" % ("ON" if AudioDirector.music_enabled else "OFF")
	settings_haptics_btn.text = "HAPTICS: %s" % ("ON" if AudioDirector.haptics_enabled else "OFF")


func _on_toggle_mute() -> void:
	AudioDirector.set_muted(not AudioDirector.master_muted)
	var lbl: String = "MUTE" if AudioDirector.master_muted else "SOUND"
	mute_icon_btn.text = lbl
	top_sound_btn.text = lbl
	if not AudioDirector.master_muted:
		AudioDirector.play_ui_click()


func _input(event: InputEvent) -> void:
	if not _web_audio_unlocked and (event is InputEventMouseButton or event is InputEventScreenTouch):
		if event.is_pressed():
			_web_audio_unlocked = true
			AudioDirector.play_music("music_showdown_tension" if state == GameState.MATCH_PLAY else "music_vetting_ambient", -11.5)

	if event is InputEventMouseMotion:
		var mm: InputEventMouseMotion = event as InputEventMouseMotion
		var vp: Vector2 = get_viewport().get_visible_rect().size
		if vp.x > 0.0 and vp.y > 0.0:
			var np: Vector2 = Vector2((mm.position.x / vp.x) * 2.0 - 1.0, (mm.position.y / vp.y) * 2.0 - 1.0)
			stage_rig.set_pointer_parallax(np)
			cam_rig.parallax_offset = np

	if settings_modal != null and settings_modal.visible:
		return
	if state in [GameState.TITLE, GameState.CAMPAIGN_GLOBE, GameState.MATCH_SUMMARY]:
		artifact_rig.handle_viewport_input(event, get_viewport().get_visible_rect().size)


func _process(delta: float) -> void:
	if not _qa_snap_path.is_empty() and _qa_snap_frames > 0:
		_qa_snap_frames -= 1
		if _qa_snap_frames == 0:
			var img: Image = get_viewport().get_texture().get_image()
			if img != null:
				img.save_png(_qa_snap_path)
			get_tree().quit(0)
			return

	_time_acc += delta

	if not is_equal_approx(displayed_score, float(match_score)):
		displayed_score = lerpf(displayed_score, float(match_score), clampf(delta * 10.0, 0.0, 1.0))
		if absf(displayed_score - float(match_score)) < 2.0:
			displayed_score = float(match_score)
		top_score_label.text = "%s PTS" % ShareClipboard.format_commas(roundi(displayed_score))

	if portrait_stage.visible and cutout_portrait != null:
		cutout_portrait.position.y = portrait_base_y + sin(_time_acc * 1.65) * 5.0
		var v_pulse: float = AudioDirector.get_voice_pulse()
		if cutout_mat != null:
			cutout_mat.set_shader_parameter("speak_lift", v_pulse * 0.07)
		for i: int in range(vo_eq_bars.size()):
			var phase: float = _time_acc * (11.0 + float(i) * 3.7)
			vo_eq_bars[i].custom_minimum_size.y = 10.0 + (36.0 * v_pulse * (0.45 + 0.55 * absf(sin(phase))))

	if state != GameState.MATCH_PLAY:
		return

	if match_phase == MatchPhase.ACTIVE:
		q_elapsed += delta
		q_time_remaining = maxf(0.0, q_time_remaining - delta)
		chrono_bar.value = (q_time_remaining / maxf(1.0, q_time_limit)) * 100.0
		chrono_time_label.text = "%.1fs" % q_time_remaining
		if q_time_remaining <= 5.0:
			var pulse_a: float = 0.65 + 0.35 * absf(sin(_time_acc * TAU * 2.0))
			chrono_time_label.add_theme_color_override("font_color", Color(1.0, 0.36, 0.45, pulse_a))
		else:
			chrono_time_label.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)

		if rival_active and not rival_locked and q_elapsed >= rival_lock_time:
			rival_locked = true
			gameplay_rival_status.text = "Locked in at %.1fs!" % q_elapsed

		if q_time_remaining <= 0.0:
			var timeout_ev: Dictionary = {
				"qid": int(current_q.get("qid", 0)),
				"correct": false,
				"backfired": wager_2x_armed,
				"bullseye": false,
				"peel_tier": 1,
				"overclocked": wager_2x_armed,
				"total_points": -250 if wager_2x_armed else 0,
				"correct_answer": str(current_q.get("answerCorrect", "Time Up")),
				"why": str(current_q.get("whyExplanation", "Clock expired.")),
			}
			TriviaDB.update_psychometrics(current_q, false, false)
			_enter_suspense_lock(timeout_ev)
	elif match_phase == MatchPhase.SUSPENSE_LOCK:
		suspense_timer -= delta
		if suspense_timer <= 0.0:
			_resolve_reveal()


# --- Helpers ---
func _style_difficulty_pill(pill: PanelContainer, lbl: Label, text: String, col: Color) -> void:
	lbl.text = text
	lbl.add_theme_color_override("font_color", col)
	var bg: Color = Color(col.r * 0.22, col.g * 0.22, col.b * 0.22, 0.90)
	pill.add_theme_stylebox_override("panel", SovereignTheme.make_flat_pill(bg, col, 12, 2, 14, 4))


func _pick_clean_big_step(span: float, step_v: float) -> float:
	var target: float = span * 0.08
	var nice_steps: Array[float] = [5.0, 10.0, 25.0, 50.0, 100.0, 250.0, 500.0, 1000.0]
	var chosen: float = maxf(step_v * 5.0, 10.0)
	for n: float in nice_steps:
		if n >= target and n >= step_v * 2.0:
			chosen = n
			break
	if chosen < step_v * 2.0:
		chosen = step_v * 5.0
	return chosen


func _format_step_num(v: float) -> String:
	if is_equal_approx(v, round(v)):
		return str(int(round(v)))
	return "%.1f" % v


func _diff_color(diff: String) -> Color:
	match diff.to_upper():
		"EASY": return Color("#4ce0a0")
		"HARD": return Color("#ff6b7a")
		"PROGRESSIVE": return Color("#6ce0f5")
		_: return SovereignTheme.GOLD_CHAMPAGNE


func _load_portrait_into(rect: TextureRect, path: String) -> void:
	if rect == null or not ResourceLoader.exists(path):
		return
	var tex: Texture2D = load(path) as Texture2D
	if tex != null:
		rect.texture = tex


func _extract_dialogue_beats(m: Dictionary) -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	var raw: Variant = m.get("dialogue_beats", m.get("pre_dialogue", []))
	if raw is Array:
		for b: Variant in (raw as Array):
			if b is Dictionary:
				out.append(b as Dictionary)
	return out


# ==============================================================================
# LIVE GPU VISUAL QA SHOTS (--qa-shot=...)
# ==============================================================================
func _apply_qa_shot(shot: String) -> void:
	match shot:
		"title":
			_enter_title_screen()
		"campaign", "hub":
			_enter_campaign_hub()
		"dossier", "evidence":
			_enter_evidence_board()
		"cutscene":
			_play_act_cutscene(0, Callable())
		"categories":
			_enter_categories_picker()
			cat_selected_domains = [1, 6]
			_refresh_categories_ui()
		"interview":
			var m1: Dictionary = TriviaDB.get_mission_by_number(1)
			_launch_campaign_interview_or_match(m1)
		"gameplay":
			var m1: Dictionary = TriviaDB.get_mission_by_number(1)
			active_city_idx = 0
			active_round_idx = 0
			active_mission = m1
			_start_campaign_match()
		"estimate":
			var cals: Array[Dictionary] = TriviaDB.select_daily_questions()
			var est_q: Dictionary = {}
			for q: Dictionary in cals:
				if str(q.get("archetype", "")) == "CALIBRATOR_DIAL":
					est_q = q
					break
			if not est_q.is_empty():
				active_city_idx = 2
				active_round_idx = 2
				rival_active = true
				rival_id = "soren"
				_begin_match_session("CAMPAIGN", "jp", [est_q], "MEDIUM", Color("#f2d28b"), 19.0)
		"lightning":
			var dqs: Array[Dictionary] = TriviaDB.select_daily_questions()
			var lt_q: Dictionary = {}
			for q: Dictionary in dqs:
				if str(q.get("archetype", "")) == "GAUNTLET_SHATTER":
					lt_q = q
					break
			if not lt_q.is_empty():
				active_city_idx = 1
				active_round_idx = 1
				rival_active = true
				rival_id = "nadia"
				_begin_match_session("CAMPAIGN", "gb", [lt_q], "EASY+", Color("#5ce1e6"), 20.0)
		"fork":
			active_city_idx = 1
			active_round_idx = 1
			_start_campaign_match()
			q_index = 2
			fork_triggered_this_match = false
			_load_current_question()
		"wager":
			active_city_idx = 2
			active_round_idx = 4
			_start_campaign_match()
			match_score = 2400
			displayed_score = 2400.0
			top_score_label.text = "2,400 PTS"
			q_index = 4
			final_wager_triggered_this_match = false
			_load_current_question()
		"globe":
			_enter_campaign_globe()
		"trophy", "summary":
			active_mode = "CAMPAIGN"
			active_city_idx = 0
			active_round_idx = 4 if shot == "trophy" else 0
			rival_id = "vance"
			match_score = 3850
			rival_score = 1950
			best_streak = 4
			match_outcomes = [
				{"correct": true, "overclocked": true, "peel_tier": 1, "bullseye": false, "backfired": false},
				{"correct": true, "overclocked": false, "peel_tier": 1, "bullseye": false, "backfired": false},
				{"correct": true, "overclocked": false, "peel_tier": 2, "bullseye": false, "backfired": false},
				{"correct": true, "overclocked": false, "peel_tier": 1, "bullseye": false, "backfired": false},
				{"correct": true, "overclocked": true, "peel_tier": 1, "bullseye": false, "backfired": false},
			]
			_enter_match_summary()


# ==============================================================================
# STRICT AUTOMATED QC SELF-TEST
# ==============================================================================
func _run_self_test() -> void:
	print("=== WORLD'S SMARTEST AAA STUDIO EDITION SELF-TEST ===")
	var st_info: Dictionary = stage_rig.audit_stage()
	var aud_info: Dictionary = AudioDirector.audit_assets()
	var q_count: int = TriviaDB.get_question_count()
	var total_playable: int = TriviaDB.get_total_playable_count()
	var m_count: int = TriviaDB.get_mission_count()

	var cutouts_ok: int = 0
	for cid: String in TriviaDB.CANON_CAST.keys():
		if ResourceLoader.exists(str(TriviaDB.CANON_CAST[cid]["portrait"])):
			cutouts_ok += 1

	var cutscenes_art_ok: int = 0
	for cs: Dictionary in TriviaDB.get_all_act_cutscenes():
		var ip: String = str(cs.get("image", ""))
		if not ip.begins_with("res://") and not ip.is_empty():
			ip = "res://assets/cutscenes/" + ip.get_file()
		if ResourceLoader.exists(ip):
			cutscenes_art_ok += 1

	# Shuffle fairness
	var slot_hits: Array[int] = [0, 0, 0, 0]
	var sampled: int = 0
	var test_qs: Array[Dictionary] = TriviaDB.select_category_questions([], "MEDIUM", 120)
	for q_item: Dictionary in test_qs:
		if str(q_item.get("archetype", "")) != "SIGHTLINE_LOCK":
			continue
		var facets: Array[Dictionary] = TriviaDB.get_answer_facets(q_item, 99173)
		for fi: int in range(facets.size()):
			if bool(facets[fi].get("is_correct", false)):
				slot_hits[fi] += 1
				sampled += 1
				break
	var max_share: float = float(maxi(maxi(slot_hits[0], slot_hits[1]), maxi(slot_hits[2], slot_hits[3]))) / maxf(1.0, float(sampled))
	var shuffle_ok: bool = (sampled >= 60 and max_share < 0.45 and mini(mini(slot_hits[0], slot_hits[1]), mini(slot_hits[2], slot_hits[3])) > 0)

	# Difficulty curve
	var ch_avg: float = _avg_irt_b(TriviaDB.select_campaign_round_questions("ch", 0, 10))
	var jp_avg: float = _avg_irt_b(TriviaDB.select_campaign_round_questions("jp", 2, 10))
	var apex_avg: float = _avg_irt_b(TriviaDB.select_campaign_round_questions("global", 4, 10))
	var diff_curve_ok: bool = (ch_avg < jp_avg) and (jp_avg < apex_avg) and (ch_avg <= -0.35) and (apex_avg >= 1.45)

	# Categories & no consecutive domains
	var sci_qs: Array[Dictionary] = TriviaDB.select_category_questions([1], "EASY", 10)
	var cat_strict_ok: bool = sci_qs.size() == 10
	for sq: Dictionary in sci_qs:
		if int(sq.get("l0Domain", -1)) != 1:
			cat_strict_ok = false
	var multi_qs: Array[Dictionary] = TriviaDB.select_category_questions([0, 2, 6], "PROGRESSIVE", 10)
	var no_consec_ok: bool = true
	for mi: int in range(1, multi_qs.size()):
		if int(multi_qs[mi].get("l0Domain", -1)) == int(multi_qs[mi - 1].get("l0Domain", -2)):
			no_consec_ok = false
	var categories_ok: bool = cat_strict_ok and multi_qs.size() == 10

	# Direct Estimate Slider
	var daily_qs: Array[Dictionary] = TriviaDB.select_daily_questions()
	var est_q: Dictionary = {}
	for dq: Dictionary in daily_qs:
		if str(dq.get("archetype", "")) == "CALIBRATOR_DIAL":
			est_q = dq
			break
	var direct_slider_ok: bool = false
	if not est_q.is_empty():
		var spec: Dictionary = TriviaDB.get_calibrator_spec(est_q)
		_begin_match_session("CAMPAIGN", "jp", [est_q], "MEDIUM", SovereignTheme.GOLD_CHAMPAGNE, 19.0)
		direct_slider_ok = (
			is_equal_approx(calib_slider.min_value, float(spec["min_val"]))
			and is_equal_approx(calib_slider.max_value, float(spec["max_val"]))
			and is_equal_approx(calib_slider.step, float(spec["step"]))
			and calib_slider.value >= float(spec["min_val"])
			and calib_slider.value <= float(spec["max_val"])
		)

	# Fork, Cutscene, Evidence Board, Daily Reset, Zero Pre-select
	active_city_idx = 1
	active_round_idx = 1
	_start_campaign_match()
	q_index = 2
	fork_triggered_this_match = false
	_load_current_question()
	var fork_ok: bool = (match_phase == MatchPhase.CATEGORY_FORK and fork_deck.visible and not fork_opt_btns[0].text.is_empty())

	_enter_evidence_board()
	var dossier_ok: bool = (evidence_board.visible and TriviaDB.get_evidence_board().size() >= 12)
	_play_act_cutscene(0, Callable())
	var cutscene_ok: bool = cutscene_player.visible

	match_score = 4500
	_enter_title_screen()
	_start_daily_match()
	var daily_reset_ok: bool = (match_score == 0 and top_venue_label.text.begins_with("DAILY #"))
	var no_preselect_ok: bool = (selected_answer_idx == -1)

	var missing_glyphs: Array[String] = _audit_hud_glyphs(hud_root)
	var shard_test: Dictionary = TriviaDB.run_shard_self_test()

	print("VenuesReady=%d/%d StudioHDRI=%s SculptedUI=%s VFXNode=%s" % [int(st_info["venues_ready"]), int(st_info["venues_total"]), str(st_info["studio_hdri_loaded"]), str(SovereignTheme.has_sculpted_ui_pack()), str(vfx_director != null)])
	print("HeroModels=%s CutscenesArt=%d/6" % [JSON.stringify(artifact_rig.loaded_models), cutscenes_art_ok])
	print("AudioAssets: voices=%d sfx_bgm=%d" % [int(aud_info["voice_count"]), int(aud_info["audio_count"])])
	print("QuestionsTier1=%d TotalPlayable=%d ShardsManifest=%s ShardTest=%s Missions=%d Cutouts=%d/6" % [q_count, total_playable, str(TriviaDB.has_shard_manifest()), JSON.stringify(shard_test), m_count, cutouts_ok])
	print("ShuffleDist=%s ShuffleFairnessOK=%s" % [str(slot_hits), str(shuffle_ok)])
	print("DifficultyCurve: Geneva=%.2f Tokyo=%.2f Apex=%.2f DifficultyCurveOK=%s" % [ch_avg, jp_avg, apex_avg, str(diff_curve_ok)])
	print("CategoriesModeOK=%s ZeroConsecDomainOK=%s DirectSliderOK=%s CategoryForkOK=%s" % [str(categories_ok), str(no_consec_ok), str(direct_slider_ok), str(fork_ok)])
	print("CutsceneOK=%s DossierOK=%s DailyResetOK=%s NoPreselectOK=%s MissingGlyphs=%d" % [str(cutscene_ok), str(dossier_ok), str(daily_reset_ok), str(no_preselect_ok), missing_glyphs.size()])
	if not missing_glyphs.is_empty():
		print("MISSING_GLYPHS_DETAIL=%s" % ", ".join(missing_glyphs))

	var all_pass: bool = (
		int(st_info["venues_ready"]) >= 10
		and q_count >= 15000
		and m_count >= 40
		and cutouts_ok == 6
		and cutscenes_art_ok == 6
		and shuffle_ok
		and diff_curve_ok
		and categories_ok
		and direct_slider_ok
		and fork_ok
		and cutscene_ok
		and dossier_ok
		and daily_reset_ok
		and no_preselect_ok
		and bool(shard_test.get("decoded_ok", true))
		and missing_glyphs.is_empty()
	)
	print("SELF_TEST_RESULT=" + ("PASS" if all_pass else "FAIL"))
	get_tree().quit(0 if all_pass else 1)


func _avg_irt_b(qs: Array[Dictionary]) -> float:
	if qs.is_empty():
		return 0.0
	var s: float = 0.0
	for q: Dictionary in qs:
		s += float(q.get("irtB", 0.0))
	return s / float(qs.size())


func _audit_hud_glyphs(root: Node) -> Array[String]:
	var missing: Array[String] = []
	var seen: Dictionary = {}
	var default_font: Font = SovereignTheme.font_sans("semibold")
	var stack: Array[Node] = [root]
	while not stack.is_empty():
		var n: Node = stack.pop_back()
		var txt: String = ""
		var f: Font = default_font
		if n is Label:
			var l: Label = n as Label
			txt = l.text
			var ov: Font = l.get_theme_font("font")
			if ov != null:
				f = ov
		elif n is Button:
			var b: Button = n as Button
			txt = b.text
			var ov2: Font = b.get_theme_font("font")
			if ov2 != null:
				f = ov2
		if not txt.is_empty() and f != null:
			for ci: int in range(txt.length()):
				var cp: int = txt.unicode_at(ci)
				if cp <= 32:
					continue
				if not f.has_char(cp):
					var key: String = "U+%04X(%s)" % [cp, txt[ci]]
					if not seen.has(key):
						seen[key] = true
						missing.append(key)
		for ch: Node in n.get_children():
			stack.append(ch)
	return missing
