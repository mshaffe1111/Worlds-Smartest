class_name EvidenceBoardOverlay
extends Control
## Interactive Conspiracy Evidence Board ("DOSSIER") for World's Smartest (Godot 4.7.2).
## Displays all 12 discoverable conspiracy clues pinned across an illuminated war-room board,
## connected by real glowing crimson & champagne-gold Godot Line2D conspiracy threads,
## plus clickable forensic detail cards and an Act 0..5 Cutscene Replay strip!

signal back_requested()
signal replay_cutscene_requested(act_idx: int)

var _count_label: Label = null
var _cutscene_row: HBoxContainer = null
var _board_canvas: Control = null
var _thread_layer: Node2D = null
var _pin_grid: GridContainer = null
var _pin_buttons: Dictionary = {} # clue_id -> Button

var _detail_panel: PanelContainer = null
var _detail_portrait: TextureRect = null
var _detail_title: Label = null
var _detail_meta: Label = null
var _detail_body: Label = null

var _clues: Array[Dictionary] = []
var _selected_clue_id: String = ""


func _ready() -> void:
	name = "EvidenceBoardOverlay"
	set_anchors_preset(Control.PRESET_FULL_RECT)
	visible = false
	_build_ui()


func _build_ui() -> void:
	var vbox: VBoxContainer = VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 12)
	add_child(vbox)

	# Top Header Bar
	var top: HBoxContainer = HBoxContainer.new()
	top.add_theme_constant_override("separation", 12)
	var back_btn: Button = Button.new()
	back_btn.text = "< HUB"
	back_btn.custom_minimum_size = Vector2(138, 82)
	back_btn.add_theme_font_size_override("font_size", 28)
	SovereignTheme.style_ghost_icon_button(back_btn)
	back_btn.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	back_btn.pressed.connect(func() -> void:
		AudioDirector.play_ui_click()
		back_requested.emit()
	)
	top.add_child(back_btn)

	var hdr_col: VBoxContainer = VBoxContainer.new()
	hdr_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var hdr: Label = Label.new()
	hdr.text = "CONSPIRACY DOSSIER — THE $100M LEDGER"
	hdr.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hdr.add_theme_font_override("font", SovereignTheme.font_serif(true))
	hdr.add_theme_font_size_override("font_size", 34)
	hdr.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	hdr_col.add_child(hdr)

	_count_label = Label.new()
	_count_label.text = "CLUES DISCOVERED: 1 / 12  ·  Tap any unlocked clue to inspect the red thread."
	_count_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_count_label.add_theme_font_size_override("font_size", 24)
	_count_label.add_theme_color_override("font_color", SovereignTheme.INK_MUTED)
	hdr_col.add_child(_count_label)
	top.add_child(hdr_col)
	vbox.add_child(top)

	# Illustrated Act Cutscenes Replay Strip (ACT 0 .. ACT 5)
	var cs_scroll: ScrollContainer = ScrollContainer.new()
	cs_scroll.custom_minimum_size = Vector2(0, 72)
	cs_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_cutscene_row = HBoxContainer.new()
	_cutscene_row.add_theme_constant_override("separation", 10)
	cs_scroll.add_child(_cutscene_row)
	vbox.add_child(cs_scroll)

	# Illuminated Evidence Board Canvas (ScrollContainer holding Pin Grid + Glowing Line2D Threads!)
	var board_panel: PanelContainer = PanelContainer.new()
	board_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	board_panel.add_theme_stylebox_override("panel", SovereignTheme.make_tableau_style(22.0, 18.0))
	vbox.add_child(board_panel)

	var board_scroll: ScrollContainer = ScrollContainer.new()
	board_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	board_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	board_panel.add_child(board_scroll)

	_board_canvas = Control.new()
	_board_canvas.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_board_canvas.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_board_canvas.custom_minimum_size = Vector2(0, 520)
	board_scroll.add_child(_board_canvas)

	# Glowing Line2D Conspiracy Thread Layer underneath the Clue Pins!
	_thread_layer = Node2D.new()
	_thread_layer.name = "ConspiracyThreads"
	_board_canvas.add_child(_thread_layer)

	_pin_grid = GridContainer.new()
	_pin_grid.columns = 4
	_pin_grid.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_pin_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_pin_grid.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_pin_grid.add_theme_constant_override("h_separation", 22)
	_pin_grid.add_theme_constant_override("v_separation", 22)
	_board_canvas.add_child(_pin_grid)

	# Bottom Forensic Detail Drawer
	_detail_panel = PanelContainer.new()
	_detail_panel.add_theme_stylebox_override("panel", SovereignTheme.make_dialogue_style(32.0, 26.0))
	vbox.add_child(_detail_panel)

	var drow: HBoxContainer = HBoxContainer.new()
	drow.add_theme_constant_override("separation", 18)
	_detail_panel.add_child(drow)

	_detail_portrait = TextureRect.new()
	_detail_portrait.custom_minimum_size = Vector2(110, 132)
	_detail_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_detail_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_detail_portrait.material = SovereignTheme.make_cutout_feather_material()
	drow.add_child(_detail_portrait)

	var dcol: VBoxContainer = VBoxContainer.new()
	dcol.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dcol.add_theme_constant_override("separation", 6)
	drow.add_child(dcol)

	_detail_title = Label.new()
	_detail_title.text = "SELECT A DISCOVERED CLUE"
	_detail_title.add_theme_font_override("font", SovereignTheme.font_serif(true))
	_detail_title.add_theme_font_size_override("font_size", 32)
	_detail_title.add_theme_color_override("font_color", SovereignTheme.GOLD_CHAMPAGNE)
	dcol.add_child(_detail_title)

	_detail_meta = Label.new()
	_detail_meta.text = "GENEVA · SUSPECT: JULIAN VANCE"
	_detail_meta.add_theme_font_override("font", SovereignTheme.font_mono())
	_detail_meta.add_theme_font_size_override("font_size", 22)
	_detail_meta.add_theme_color_override("font_color", SovereignTheme.CYAN_INTEL)
	dcol.add_child(_detail_meta)

	_detail_body = Label.new()
	_detail_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_detail_body.add_theme_font_size_override("font_size", 28)
	_detail_body.add_theme_color_override("font_color", SovereignTheme.INK_IVORY)
	dcol.add_child(_detail_body)


func refresh_board(is_desktop: bool) -> void:
	_pin_grid.columns = 4 if is_desktop else 2
	_clues = TriviaDB.get_evidence_board()

	# Populate Act Cutscenes Replay Strip
	for ch: Node in _cutscene_row.get_children():
		ch.queue_free()
	var cutscenes: Array[Dictionary] = TriviaDB.get_all_act_cutscenes()
	for i: int in range(cutscenes.size()):
		var cs: Dictionary = cutscenes[i]
		var act_num: int = int(cs.get("act_index", cs.get("act", i)))
		var b: Button = Button.new()
		var cs_title: String = str(cs.get("title", "SCENE")).to_upper().strip_edges()
		if cs_title.begins_with("ACT "):
			b.text = SovereignTheme.sanitize_display_text(cs_title)
		else:
			b.text = "ACT %d · %s" % [act_num, SovereignTheme.sanitize_display_text(cs_title)]
		b.custom_minimum_size = Vector2(240, 68)
		b.add_theme_font_size_override("font_size", 22)
		var unlocked_cs: bool = (act_num == 0) or TriviaDB.is_city_unlocked(mini(7, act_num))
		b.disabled = not unlocked_cs
		SovereignTheme.style_answer_pill(b, "focused" if unlocked_cs else "locked")
		var cap_act: int = act_num
		b.pressed.connect(func() -> void:
			AudioDirector.play_cutscene_whoosh()
			replay_cutscene_requested.emit(cap_act)
		)
		_cutscene_row.add_child(b)

	# Populate 12 Clue Pin Cards
	for ch: Node in _pin_grid.get_children():
		ch.queue_free()
	_pin_buttons.clear()

	var unlocked_total: int = 0
	var first_unlocked_id: String = ""
	for c: Dictionary in _clues:
		var cid: String = str(c.get("id", ""))
		var unlocked: bool = TriviaDB.is_evidence_unlocked(c)
		if unlocked:
			unlocked_total += 1
			if first_unlocked_id.is_empty():
				first_unlocked_id = cid

		var btn: Button = Button.new()
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.size_flags_vertical = Control.SIZE_EXPAND_FILL
		btn.custom_minimum_size = Vector2(0, 146)
		btn.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		btn.add_theme_font_size_override("font_size", 24)
		var city_tag: String = str(c.get("city_label", c.get("city_id", c.get("city", "GENEVA")))).to_upper()
		if unlocked:
			btn.text = "[%s]\n%s" % [city_tag, SovereignTheme.sanitize_display_text(str(c.get("title", "Classified File")))]
			btn.disabled = false
			SovereignTheme.style_answer_pill(btn, "focused" if cid == _selected_clue_id else "normal")
			var cap_c: Dictionary = c
			btn.pressed.connect(func() -> void: _select_clue(cap_c))
		else:
			var req_raw: Variant = c.get("unlock_mission", 1)
			var req_label: String = _format_unlock_requirement(req_raw, city_tag)
			btn.text = "SEALED FILE\nUnlock: %s" % req_label
			btn.disabled = true
			SovereignTheme.style_answer_pill(btn, "locked")
		_pin_grid.add_child(btn)
		_pin_buttons[cid] = btn

	_count_label.text = "CLUES DISCOVERED: %d / %d  ·  Clear Campaign rounds to expose the $100M conspiracy." % [unlocked_total, _clues.size()]

	if _selected_clue_id.is_empty() and not first_unlocked_id.is_empty():
		for c: Dictionary in _clues:
			if str(c.get("id", "")) == first_unlocked_id:
				_select_clue(c)
				break
	call_deferred("_redraw_conspiracy_threads")


func _format_unlock_requirement(req_raw: Variant, city_tag: String) -> String:
	if req_raw is String:
		var s: String = (req_raw as String).strip_edges()
		if s.contains("_"):
			var parts: PackedStringArray = s.split("_")
			var v: Dictionary = TriviaDB.get_venue_by_code(parts[0])
			var r_num: String = parts[1] if parts.size() > 1 else "1"
			return "%s R%s" % [str(v.get("short", city_tag)), r_num]
		return s.to_upper()
	return "Mission %d" % int(req_raw)


func _select_clue(c: Dictionary) -> void:
	AudioDirector.play_ui_click()
	_selected_clue_id = str(c.get("id", ""))
	for cid: String in _pin_buttons.keys():
		var b: Button = _pin_buttons[cid] as Button
		if b != null and not b.disabled:
			SovereignTheme.style_answer_pill(b, "focused" if cid == _selected_clue_id else "normal")

	var spk_id: String = str(c.get("suspect_id", "vance")).to_lower()
	var prof: Dictionary = TriviaDB.get_cast_profile(spk_id)
	var ppath: String = TriviaDB.get_cast_portrait_path(spk_id, "intense")
	if ResourceLoader.exists(ppath):
		_detail_portrait.texture = load(ppath) as Texture2D
	_detail_title.text = SovereignTheme.sanitize_display_text(str(c.get("title", "Evidence")).to_upper())
	var city_code: String = str(c.get("city_id", "ch"))
	var city_name: String = str(TriviaDB.get_venue_by_code(city_code)["city"]).to_upper()
	_detail_meta.text = "CITY: %s  ·  LINKED SUSPECT: %s" % [city_name, str(prof["name"])]
	_detail_body.text = SovereignTheme.sanitize_display_text(str(c.get("summary", "")))
	call_deferred("_redraw_conspiracy_threads")


func _redraw_conspiracy_threads() -> void:
	if _thread_layer == null:
		return
	for ch: Node in _thread_layer.get_children():
		ch.queue_free()

	for c: Dictionary in _clues:
		var from_id: String = str(c.get("id", ""))
		if not _pin_buttons.has(from_id):
			continue
		var from_btn: Button = _pin_buttons[from_id] as Button
		var from_unlocked: bool = not from_btn.disabled
		var targets: Variant = c.get("red_thread_to", [])
		var target_list: Array = targets if targets is Array else ([targets] if targets is String and not (targets as String).is_empty() else [])
		for t_item: Variant in target_list:
			var to_id: String = str(t_item)
			if not _pin_buttons.has(to_id):
				continue
			var to_btn: Button = _pin_buttons[to_id] as Button
			var p1: Vector2 = from_btn.position + from_btn.size * 0.5
			var p2: Vector2 = to_btn.position + to_btn.size * 0.5
			if p1.distance_squared_to(p2) < 4.0:
				continue

			var line: Line2D = Line2D.new()
			line.width = 4.5 if (from_id == _selected_clue_id or to_id == _selected_clue_id) else 2.5
			var both_open: bool = from_unlocked and (not to_btn.disabled)
			if from_id == _selected_clue_id or to_id == _selected_clue_id:
				line.default_color = Color(1.0, 0.30, 0.36, 0.92)
			elif both_open:
				line.default_color = Color(0.95, 0.78, 0.38, 0.65)
			else:
				line.default_color = Color(0.75, 0.25, 0.30, 0.22)
			line.add_point(p1)
			# Subtle gravity sag like a real corkboard crimson string!
			var mid: Vector2 = (p1 + p2) * 0.5 + Vector2(0.0, 14.0)
			line.add_point(mid)
			line.add_point(p2)
			line.antialiased = true
			_thread_layer.add_child(line)
