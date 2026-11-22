class_name TriviaDatabase
extends Node
## Principal 1M-Ready Trivia Database, Strict Progressive Difficulty Curve (Geneva Easy -> Apex Genius),
## Custom Categories Selector, 40-Mission Campaign Progression (Stars + Ranks + 8 Cities), & Persistent Save.

const QUESTIONS_GZ_PATH: String = "res://data/questions.json.gz"
const QUESTIONS_PATH: String = "res://data/questions.json"
const CAMPAIGN_PATH: String = "res://data/campaign_20hr.json"
const SHARD_MANIFEST_PATH: String = "res://data/shards/shard_manifest.json"
const BITSET_SAVE_PATH: String = "user://meridian_seen_bitset.bin"
const STATE_SAVE_PATH: String = "user://meridian_campaign_save.json"
const BITSET_BYTES: int = 131072 # 1,048,576 unique QIDs in 128 KB RAM
const DAILY_SALT: String = "WS_MERIDIAN_DAILY_V2"
const BASE_POINTS: int = 500
const MAX_SPEED_BONUS: int = 250

const BOND_NAMES: Array[String] = ["NEMESIS", "RIVAL", "NEUTRAL", "ALLIED"]

const DOMAIN_META: Array[Dictionary] = [
	{"id": 0, "key": "HISTORY", "name": "World History", "short": "History", "accent": Color("#d4a853")},
	{"id": 1, "key": "SCIENCE", "name": "Science & Space", "short": "Science", "accent": Color("#48b8f0")},
	{"id": 2, "key": "GEOGRAPHY", "name": "Geography & Wonders", "short": "Geography", "accent": Color("#38c793")},
	{"id": 3, "key": "ARTS", "name": "Arts & Architecture", "short": "Arts", "accent": Color("#e6c78b")},
	{"id": 4, "key": "POP", "name": "Film, Music & Pop", "short": "Pop Culture", "accent": Color("#e85d99")},
	{"id": 5, "key": "SPORTS", "name": "Sports & Games", "short": "Sports", "accent": Color("#f08a3e")},
	{"id": 6, "key": "TECH", "name": "Tech & Computing", "short": "Tech", "accent": Color("#5ce1e6")},
	{"id": 7, "key": "NATURE", "name": "Nature & Biology", "short": "Nature", "accent": Color("#58d66b")},
	{"id": 8, "key": "SOCIETY", "name": "World Affairs & Law", "short": "World Affairs", "accent": Color("#c8b89d")},
	{"id": 9, "key": "FOOD", "name": "Food, Craft & Design", "short": "Food & Craft", "accent": Color("#e08e5a")},
	{"id": 10, "key": "MYTH", "name": "Myth & Literature", "short": "Myth & Lit", "accent": Color("#8d7bf0")},
	{"id": 11, "key": "LOGIC", "name": "Logic & Math", "short": "Logic & Math", "accent": Color("#f7df9c")},
]

# Canonical Cast Lock (ZERO legacy drift)
const CANON_CAST: Dictionary = {
	"vance": {
		"id": "vance",
		"name": "JULIAN VANCE",
		"short_name": "Vance",
		"role": "Championship Host · The Maestro",
		"portrait": "res://assets/portraits_cutout/vance.png",
		"accent": Color("#f2d28b"),
		"strong_domains": [0, 8, 11],
		"weak_domains": [4, 5],
		"base_lock_sec": 7.5,
		"tell_bluff": "Vance adjusts his brass cufflink—a calculated feint.",
		"tell_real": "Vance taps his gold stylus with calm certainty.",
	},
	"nadia": {
		"id": "nadia",
		"name": "NADIA AL-MANSOOR",
		"short_name": "Nadia",
		"role": "Prodigy Rival · The Polymath",
		"portrait": "res://assets/portraits_cutout/nadia.png",
		"accent": Color("#6ce0f5"),
		"strong_domains": [0, 1, 8, 11],
		"weak_domains": [4, 5],
		"base_lock_sec": 8.0,
		"tell_bluff": "Nadia's jaw tightens briefly—she is guessing under pressure.",
		"tell_real": "A sharp corner smirk—she knows this cold.",
	},
	"soren": {
		"id": "soren",
		"name": "SOREN \"ECHO\" KAEL",
		"short_name": "Soren",
		"role": "Wildcard Contender · Speed Specialist",
		"portrait": "res://assets/portraits_cutout/soren.png",
		"accent": Color("#5ce1e6"),
		"strong_domains": [4, 5, 6],
		"weak_domains": [0, 3, 10],
		"base_lock_sec": 4.8,
		"tell_bluff": "Soren's knuckle coin keeps spinning fast—pure bluff!",
		"tell_real": "Soren's knuckle coin freezes dead—his answer is locked.",
	},
	"teo": {
		"id": "teo",
		"name": "MATEO \"TEO\" ROJAS",
		"short_name": "Teo",
		"role": "Backstage Producer · The Insider",
		"portrait": "res://assets/portraits_cutout/teo.png",
		"accent": Color("#4ce0a0"),
		"strong_domains": [4, 6, 8],
		"weak_domains": [1, 11],
		"base_lock_sec": 6.8,
		"tell_bluff": "Teo glances toward the broadcast monitor—something is off.",
		"tell_real": "Teo holds a steady gaze—his intel is clean.",
	},
	"lindqvist": {
		"id": "lindqvist",
		"name": "CHANCELLOR INGRID LINDQVIST",
		"short_name": "Lindqvist",
		"role": "Championship Chair · Kingmaker",
		"portrait": "res://assets/portraits_cutout/lindqvist.png",
		"accent": Color("#d4a853"),
		"strong_domains": [0, 2, 8],
		"weak_domains": [4, 6],
		"base_lock_sec": 9.0,
		"tell_bluff": "Lindqvist removes her spectacles—expect a trap.",
		"tell_real": "Lindqvist does not blink behind her platinum spectacles.",
	},
	"tariq": {
		"id": "tariq",
		"name": "TARIQ AL-MANSOOR",
		"short_name": "Tariq",
		"role": "Defending Champion · Meridian Zero",
		"portrait": "res://assets/portraits_cutout/tariq.png",
		"accent": Color("#f2c166"),
		"strong_domains": [1, 6, 10, 11],
		"weak_domains": [5],
		"base_lock_sec": 7.0,
		"tell_bluff": "Tariq pauses mid-thought—testing your nerve.",
		"tell_real": "Tariq's fingers tap a crisp triangle—he has the exact answer.",
	},
}

# 8-City Progressive Campaign Tour (Strict Easy -> Genius irtB curve!)
const VENUES: Array[Dictionary] = [
	{
		"index": 0, "code": "ch", "region": "CH", "city": "Geneva", "short": "Geneva",
		"venue_name": "The Vetting Chamber", "act": 1, "speaker_id": "vance", "boss_id": "vance",
		"tier": "EASY", "tier_color": Color("#4ce0a0"), "irt_min": -1.80, "irt_max": -0.35,
		"timer_sec": 22.0, "rival_acc": 0.52, "archetypes": ["SIGHTLINE_LOCK"],
		"accent": Color("#4ce0a0"),
		"city_hook": "Prove you belong in the $100M Championship with crisp classic trivia.",
	},
	{
		"index": 1, "code": "gb", "region": "GB", "city": "London", "short": "London",
		"venue_name": "The Sovereign Rotunda", "act": 2, "speaker_id": "nadia", "boss_id": "nadia",
		"tier": "EASY+", "tier_color": Color("#5ce1e6"), "irt_min": -1.00, "irt_max": 0.10,
		"timer_sec": 20.0, "rival_acc": 0.58, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER"],
		"accent": Color("#5ce1e6"),
		"city_hook": "Introduces True/False Speed rounds under London's glass dome against Nadia.",
	},
	{
		"index": 2, "code": "jp", "region": "JP", "city": "Tokyo", "short": "Tokyo",
		"venue_name": "Shinkansen Sky Pavilion", "act": 3, "speaker_id": "soren", "boss_id": "soren",
		"tier": "MEDIUM", "tier_color": Color("#f2d28b"), "irt_min": -0.50, "irt_max": 0.55,
		"timer_sec": 19.0, "rival_acc": 0.64, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER", "CALIBRATOR_DIAL"],
		"accent": Color("#f2d28b"),
		"city_hook": "Introduces Year & Number Estimator rounds high above Tokyo against Soren.",
	},
	{
		"index": 3, "code": "br", "region": "BR", "city": "Rio de Janeiro", "short": "Rio",
		"venue_name": "Botanical Glass Canopy", "act": 4, "speaker_id": "nadia", "boss_id": "nadia",
		"tier": "MEDIUM+", "tier_color": Color("#f0a850"), "irt_min": -0.10, "irt_max": 0.90,
		"timer_sec": 18.0, "rival_acc": 0.68, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER", "CALIBRATOR_DIAL"],
		"accent": Color("#f0a850"),
		"city_hook": "Faster clocks and tougher questions as rivalries heat up in Rio.",
	},
	{
		"index": 4, "code": "eg", "region": "EG", "city": "Cairo", "short": "Cairo",
		"venue_name": "The Solar Acoustic Hall", "act": 5, "speaker_id": "teo", "boss_id": "teo",
		"tier": "CHALLENGING", "tier_color": Color("#f08a3e"), "irt_min": 0.30, "irt_max": 1.25,
		"timer_sec": 17.0, "rival_acc": 0.73, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER", "CALIBRATOR_DIAL", "CODEX_DUAL_RING"],
		"accent": Color("#f08a3e"),
		"city_hook": "Introduces Codex Word Decoder rounds inside Cairo's golden acoustic hall.",
	},
	{
		"index": 5, "code": "is", "region": "IS", "city": "Reykjavik", "short": "Reykjavik",
		"venue_name": "Geothermal Basalt Caldera", "act": 6, "speaker_id": "tariq", "boss_id": "tariq",
		"tier": "HARD", "tier_color": Color("#ff7878"), "irt_min": 0.65, "irt_max": 1.65,
		"timer_sec": 15.0, "rival_acc": 0.78, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER", "CALIBRATOR_DIAL", "CODEX_DUAL_RING"],
		"accent": Color("#ff7878"),
		"city_hook": "High-pressure semifinals against former champion Tariq under the northern lights.",
	},
	{
		"index": 6, "code": "sg", "region": "SG", "city": "Singapore", "short": "Singapore",
		"venue_name": "Diplomatic Sky-Bridge Core", "act": 7, "speaker_id": "lindqvist", "boss_id": "lindqvist",
		"tier": "EXPERT", "tier_color": Color("#ff5c72"), "irt_min": 1.05, "irt_max": 2.10,
		"timer_sec": 14.0, "rival_acc": 0.83, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER", "CALIBRATOR_DIAL", "CODEX_DUAL_RING"],
		"accent": Color("#ff5c72"),
		"city_hook": "Expert-tier championship qualifiers where every second and lifeline matters.",
	},
	{
		"index": 7, "code": "global", "region": "GLOBAL", "city": "Apex Forum", "short": "Apex",
		"venue_name": "The Apex Forum", "act": 8, "speaker_id": "vance", "boss_id": "vance",
		"tier": "GENIUS", "tier_color": Color("#c87dff"), "irt_min": 1.45, "irt_max": 2.80,
		"timer_sec": 13.0, "rival_acc": 0.88, "archetypes": ["SIGHTLINE_LOCK", "GAUNTLET_SHATTER", "CALIBRATOR_DIAL", "CODEX_DUAL_RING"],
		"accent": Color("#c87dff"),
		"city_hook": "The $100M Grand Final. Outthink the world's finest minds to claim the crown.",
	},
]

const ROUND_SUBTITLES: Array[String] = [
	"THE QUALIFIER",
	"THE SHOWCASE",
	"THE PRESSURE TEST",
	"THE SEMIFINAL",
	"CITY BOSS DUEL",
]

var _questions: Array[Dictionary] = []
var _by_qid: Dictionary = {}
var _by_archetype: Dictionary = {}
var _by_domain: Dictionary = {}
var _domain_counts: Dictionary = {}

var _campaign_data: Dictionary = {}
var _missions: Array[Dictionary] = []
var _missions_by_id: Dictionary = {}
var _endings: Array[Dictionary] = []
var _act_cutscenes: Array[Dictionary] = []
var _evidence_board: Array[Dictionary] = []
var _rival_reactions: Dictionary = {}

# Tier-2 Lazy-Loaded Million-Scale Shard State (Zero Startup Bloat!)
var _shard_manifest: Dictionary = {}
var _shard_domain_totals: Dictionary = {}
var _shard_domain_files: Dictionary = {} # domain_id -> Array[Dictionary]
var _shard_types: Dictionary = {}
var _shard_decoder_spec: Dictionary = {}
var _shard_total_playable: int = 0
var _loaded_shards: Dictionary = {} # domain_id -> Array[Dictionary] of loaded chunk objects
var _loaded_shard_paths: Dictionary = {}
var _pending_shard_reqs: Dictionary = {}

signal shard_loaded(domain_id: int, entity_count: int)

var _seen_bitset: PackedByteArray = PackedByteArray()
var _seen_count: int = 0
var loaded_from_json: bool = false
var campaign_loaded: bool = false

var save_state: Dictionary = {}
var consecutive_misses: int = 0


func _ready() -> void:
	_init_bitset()
	_reset_default_save_state()
	load_history()
	load_save_state()
	reload_database()
	reload_campaign()
	reload_shard_manifest()


func _init_bitset() -> void:
	_seen_bitset.resize(BITSET_BYTES)
	_seen_bitset.fill(0)
	_seen_count = 0


func _reset_default_save_state() -> void:
	var ratings: Array = []
	for _i: int in range(12):
		ratings.append(1200)
	save_state = {
		"version": 3,
		"player_theta": 0.0,
		"domain_ratings": ratings,
		"integrity": 0,
		"public_trust": 50,
		"council_favor": 50,
		"bonds": {
			"nadia": 1,
			"teo": 2,
			"lindqvist": 2,
			"soren": 1,
			"tariq": 2,
		},
		"flags": {},
		"completed_missions": [],
		"mission_stars": {},
		"seen_cutscenes": [],
		"current_mission_number": 1,
		"unlocked_perks": [],
		"unlocked_relics": [],
		"unlocked_endings": [],
		"vault_clues_found": [],
		"free_peel_tokens": 0,
		"redemption_queue": [],
		"new_circuit_plus": false,
		"daily_completed_utc": "",
		"daily_last_card": "",
		"daily_best_score": 0,
		"endless_best_score": 0,
		"endless_best_depth": 0,
		"endless_banked_prestige": 0,
		"bookmarks": [],
	}


func reload_database() -> void:
	_questions.clear()
	_by_qid.clear()
	_by_archetype = {
		"SIGHTLINE_LOCK": [],
		"CALIBRATOR_DIAL": [],
		"CODEX_DUAL_RING": [],
		"GAUNTLET_SHATTER": [],
		"HERO_ARTIFACT_SYNTHESIS": [],
	}
	_by_domain.clear()
	_domain_counts.clear()
	for d: int in range(12):
		_by_domain[d] = []
		_domain_counts[d] = 0
	loaded_from_json = false

	var raw_text: String = ""
	if FileAccess.file_exists(QUESTIONS_GZ_PATH):
		var gz_bytes: PackedByteArray = FileAccess.get_file_as_bytes(QUESTIONS_GZ_PATH)
		if gz_bytes.size() > 0:
			var plain_bytes: PackedByteArray = gz_bytes.decompress_dynamic(-1, FileAccess.COMPRESSION_GZIP)
			if plain_bytes.size() > 0:
				raw_text = plain_bytes.get_string_from_utf8()

	if raw_text.is_empty() and FileAccess.file_exists(QUESTIONS_PATH):
		var file: FileAccess = FileAccess.open(QUESTIONS_PATH, FileAccess.READ)
		if file != null:
			raw_text = file.get_as_text()
			file.close()

	if not raw_text.is_empty():
		var parsed: Variant = JSON.parse_string(raw_text)
		var raw_list: Array = []
		if parsed is Array:
			raw_list = parsed
		elif parsed is Dictionary and parsed.has("questions") and parsed["questions"] is Array:
			raw_list = parsed["questions"]

		for item: Variant in raw_list:
			if item is Dictionary and item.has("qid") and item.has("prompt"):
				var q: Dictionary = item as Dictionary
				_questions.append(q)
				_by_qid[int(q["qid"])] = q
				var arch: String = str(q.get("archetype", "SIGHTLINE_LOCK"))
				if not _by_archetype.has(arch):
					_by_archetype[arch] = []
				(_by_archetype[arch] as Array).append(q)
				var dom_id: int = clampi(int(q.get("l0Domain", 0)), 0, 11)
				(_by_domain[dom_id] as Array).append(q)
				_domain_counts[dom_id] = int(_domain_counts[dom_id]) + 1

		if _questions.size() > 0:
			loaded_from_json = true

	if _questions.is_empty():
		_load_starter_seed()


func reload_campaign() -> void:
	_campaign_data.clear()
	_missions.clear()
	_missions_by_id.clear()
	_endings.clear()
	_act_cutscenes.clear()
	_evidence_board.clear()
	_rival_reactions.clear()
	campaign_loaded = false

	if FileAccess.file_exists(CAMPAIGN_PATH):
		var file: FileAccess = FileAccess.open(CAMPAIGN_PATH, FileAccess.READ)
		if file != null:
			var raw_text: String = file.get_as_text()
			file.close()
			var parsed: Variant = JSON.parse_string(raw_text)
			if parsed is Dictionary:
				_campaign_data = parsed as Dictionary
				var raw_missions: Variant = _campaign_data.get("missions", [])
				if raw_missions is Array:
					for m: Variant in raw_missions:
						if m is Dictionary:
							var md: Dictionary = m as Dictionary
							_missions.append(md)
							var mid: String = str(md.get("id", "m%02d" % _missions.size()))
							_missions_by_id[mid] = md
				var raw_endings: Variant = _campaign_data.get("endings", [])
				if raw_endings is Array:
					for e: Variant in raw_endings:
						if e is Dictionary:
							_endings.append(e as Dictionary)
				var raw_cs: Variant = _campaign_data.get("act_cutscenes", [])
				if raw_cs is Array:
					for cs: Variant in raw_cs:
						if cs is Dictionary:
							_act_cutscenes.append(cs as Dictionary)
				var raw_ev: Variant = _campaign_data.get("evidence_board", [])
				var ev_list: Array = []
				if raw_ev is Dictionary and (raw_ev as Dictionary).has("clues") and (raw_ev as Dictionary)["clues"] is Array:
					ev_list = (raw_ev as Dictionary)["clues"] as Array
				elif raw_ev is Array:
					ev_list = raw_ev as Array
				for ev: Variant in ev_list:
					if ev is Dictionary:
						_evidence_board.append(ev as Dictionary)
				var raw_rr: Variant = _campaign_data.get("rival_reactions", {})
				if raw_rr is Dictionary:
					_rival_reactions = raw_rr as Dictionary
				if _missions.size() > 0:
					campaign_loaded = true

	if _missions.is_empty():
		_build_fallback_campaign_skeleton()
	if _act_cutscenes.is_empty():
		_build_fallback_act_cutscenes()
	if _evidence_board.is_empty():
		_build_fallback_evidence_board()


func get_question_count() -> int:
	return _questions.size()


func get_domain_counts() -> Dictionary:
	return _domain_counts


func get_mission_count() -> int:
	return _missions.size()


func get_mission_by_number(num: int) -> Dictionary:
	for m: Dictionary in _missions:
		if int(m.get("mission_number", m.get("missionNumber", 0))) == num:
			return m
	if num >= 1 and num <= _missions.size():
		return _missions[num - 1]
	return _missions[0] if not _missions.is_empty() else {}


func get_missions_for_hub(hub_code: String) -> Array[Dictionary]:
	var target: String = hub_code.to_upper()
	var out: Array[Dictionary] = []
	for m: Dictionary in _missions:
		var h: String = str(m.get("venue_region", m.get("hub_id", m.get("hub", m.get("venue", "CH"))))).to_upper()
		if h == target:
			out.append(m)
	return out


func get_cast_profile(speaker_id: String) -> Dictionary:
	var key: String = speaker_id.to_lower()
	if CANON_CAST.has(key):
		return CANON_CAST[key] as Dictionary
	return CANON_CAST["vance"] as Dictionary


func get_domain_meta(domain_id: int) -> Dictionary:
	if domain_id >= 0 and domain_id < DOMAIN_META.size():
		return DOMAIN_META[domain_id]
	return DOMAIN_META[0]


func get_venue_list() -> Array[Dictionary]:
	return VENUES


func get_venue_by_code(code: String) -> Dictionary:
	var lower: String = code.to_lower()
	for v: Dictionary in VENUES:
		if str(v["code"]) == lower or str(v["region"]).to_lower() == lower:
			return v
	return VENUES[0]


func get_venue_by_index(idx: int) -> Dictionary:
	return VENUES[clampi(idx, 0, VENUES.size() - 1)]


# --- Campaign Progression, Stars, Ranks & City Unlocking ---
func get_total_stars() -> int:
	var stars_map: Variant = save_state.get("mission_stars", {})
	var total: int = 0
	if stars_map is Dictionary:
		for v: Variant in (stars_map as Dictionary).values():
			total += clampi(int(v), 0, 3)
	return total


func get_mission_stars(mid: String) -> int:
	var stars_map: Variant = save_state.get("mission_stars", {})
	if stars_map is Dictionary and (stars_map as Dictionary).has(mid):
		return clampi(int((stars_map as Dictionary)[mid]), 0, 3)
	return 1 if is_mission_completed(mid) else 0


func get_completed_count() -> int:
	var done: Variant = save_state.get("completed_missions", [])
	return (done as Array).size() if done is Array else 0


func get_player_rank() -> String:
	var c: int = get_completed_count()
	if c >= 40:
		return "World's Smartest"
	if c >= 30:
		return "Grandmaster"
	if c >= 20:
		return "Master"
	if c >= 10:
		return "Contender"
	if c >= 5:
		return "Challenger"
	return "Rookie"


func is_city_unlocked(city_idx: int) -> bool:
	if city_idx <= 0:
		return true
	var prev_v: Dictionary = get_venue_by_index(city_idx - 1)
	var prev_missions: Array[Dictionary] = get_missions_for_hub(str(prev_v["region"]))
	if prev_missions.is_empty():
		return true
	var boss_m: Dictionary = prev_missions[prev_missions.size() - 1]
	return is_mission_completed(str(boss_m.get("id", "")))


func is_round_unlocked(city_idx: int, round_idx: int) -> bool:
	if not is_city_unlocked(city_idx):
		return false
	if round_idx <= 0:
		return true
	var v: Dictionary = get_venue_by_index(city_idx)
	var hub_ms: Array[Dictionary] = get_missions_for_hub(str(v["region"]))
	if round_idx - 1 < hub_ms.size():
		return is_mission_completed(str(hub_ms[round_idx - 1].get("id", "")))
	return false


func is_mission_completed(mid: String) -> bool:
	var done: Variant = save_state.get("completed_missions", [])
	return done is Array and (done as Array).has(mid)


func mark_mission_completed(mid: String, next_mission_num: int, stars_earned: int = 1) -> void:
	var done: Array = save_state.get("completed_missions", []) as Array
	if not done.has(mid):
		done.append(mid)
	save_state["completed_missions"] = done

	var stars_map: Dictionary = save_state.get("mission_stars", {}) as Dictionary if save_state.get("mission_stars") is Dictionary else {}
	stars_map[mid] = maxi(int(stars_map.get(mid, 0)), clampi(stars_earned, 1, 3))
	save_state["mission_stars"] = stars_map

	var cur_m: int = int(save_state.get("current_mission_number", 1))
	save_state["current_mission_number"] = clampi(maxi(cur_m, next_mission_num), 1, maxi(1, _missions.size()))
	save_campaign_state()


# --- 1M Bitset History ---
func is_seen(qid: int) -> bool:
	if qid < 0:
		return false
	var byte_idx: int = qid >> 3
	if byte_idx >= _seen_bitset.size():
		return false
	return (_seen_bitset[byte_idx] & (1 << (qid & 7))) != 0


func mark_seen(qid: int) -> void:
	if qid < 0:
		return
	var byte_idx: int = qid >> 3
	if byte_idx >= _seen_bitset.size():
		return
	var mask: int = 1 << (qid & 7)
	if (_seen_bitset[byte_idx] & mask) == 0:
		_seen_bitset[byte_idx] = _seen_bitset[byte_idx] | mask
		_seen_count += 1


func save_history() -> void:
	var file: FileAccess = FileAccess.open(BITSET_SAVE_PATH, FileAccess.WRITE)
	if file != null:
		file.store_buffer(_seen_bitset)
		file.close()


func load_history() -> void:
	if not FileAccess.file_exists(BITSET_SAVE_PATH):
		return
	var file: FileAccess = FileAccess.open(BITSET_SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var buf: PackedByteArray = file.get_buffer(BITSET_BYTES)
	file.close()
	if buf.size() == BITSET_BYTES:
		_seen_bitset = buf
		var total: int = 0
		for b: int in _seen_bitset:
			var v: int = b
			while v > 0:
				total += v & 1
				v >>= 1
		_seen_count = total


# --- Persistent Save State ---
func save_campaign_state() -> void:
	var file: FileAccess = FileAccess.open(STATE_SAVE_PATH, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(save_state))
		file.close()


func load_save_state() -> void:
	if not FileAccess.file_exists(STATE_SAVE_PATH):
		return
	var file: FileAccess = FileAccess.open(STATE_SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var raw: String = file.get_as_text()
	file.close()
	var parsed: Variant = JSON.parse_string(raw)
	if parsed is Dictionary:
		for k: Variant in (parsed as Dictionary).keys():
			save_state[k] = (parsed as Dictionary)[k]


func get_bond_tier(npc_id: String) -> int:
	var bonds: Dictionary = save_state.get("bonds", {}) as Dictionary
	return clampi(int(bonds.get(npc_id.to_lower(), 2)), 0, 3)


func get_bond_label(npc_id: String) -> String:
	return BOND_NAMES[get_bond_tier(npc_id)]


func toggle_bookmark(qid: int) -> bool:
	var bm: Array = save_state.get("bookmarks", []) as Array
	if bm.has(qid):
		bm.erase(qid)
		save_campaign_state()
		return false
	bm.append(qid)
	save_campaign_state()
	return true


func apply_choice_effects(effects: Dictionary) -> Array[String]:
	var notices: Array[String] = []
	if effects.has("integrity"):
		var d: int = int(effects["integrity"])
		save_state["integrity"] = clampi(int(save_state.get("integrity", 0)) + d, -100, 100)
		notices.append("%s%d Integrity" % ["+" if d >= 0 else "", d])
	if effects.has("public_trust"):
		var d: int = int(effects["public_trust"])
		save_state["public_trust"] = clampi(int(save_state.get("public_trust", 50)) + d, 0, 100)
		notices.append("%s%d Public Trust" % ["+" if d >= 0 else "", d])
	if effects.has("council_favor"):
		var d: int = int(effects["council_favor"])
		save_state["council_favor"] = clampi(int(save_state.get("council_favor", 50)) + d, 0, 100)
		notices.append("%s%d Sponsor Backing" % ["+" if d >= 0 else "", d])

	var bonds: Dictionary = save_state.get("bonds", {}) as Dictionary
	for npc: String in ["nadia", "teo", "lindqvist", "soren", "tariq"]:
		var bkey: String = "bond_" + npc
		if effects.has(bkey):
			var prev: int = clampi(int(bonds.get(npc, 2)), 0, 3)
			var nxt: int = clampi(prev + int(effects[bkey]), 0, 3)
			bonds[npc] = nxt
			if nxt != prev:
				notices.append("%s -> %s" % [npc.capitalize(), BOND_NAMES[nxt]])
	save_state["bonds"] = bonds
	save_campaign_state()
	return notices


func evaluate_ending_id() -> String:
	var integrity: int = int(save_state.get("integrity", 0))
	var public_t: int = int(save_state.get("public_trust", 50))
	var council_f: int = int(save_state.get("council_favor", 50))
	if integrity >= 20 and public_t >= 55:
		return "ARCHITECT_SUCCESSION"
	if integrity <= -15:
		return "THE_KINGMAKER"
	if council_f >= 60:
		return "SOVEREIGN_ARBITER"
	return "OPEN_COMMONS"


# --- Psychometrics ---
func compute_2pl_prob(theta: float, irt_a: float, irt_b: float) -> float:
	var a: float = clampf(irt_a, 0.4, 2.5)
	return 1.0 / (1.0 + exp(-a * (theta - irt_b)))


func update_psychometrics(q: Dictionary, correct: bool, high_stakes: bool) -> void:
	var theta: float = float(save_state.get("player_theta", 0.0))
	var irt_b: float = float(q.get("irtB", 0.0))
	var irt_a: float = float(q.get("irtA", 1.15))
	var p_exp: float = compute_2pl_prob(theta, irt_a, irt_b)
	var actual: float = 1.0 if correct else 0.0
	theta = clampf(theta + 0.16 * (actual - p_exp), -2.5, 2.5)
	save_state["player_theta"] = snappedf(theta, 0.001)

	var dom: int = clampi(int(q.get("l0Domain", 0)), 0, 11)
	var arr: Array = save_state.get("domain_ratings", []) as Array
	while arr.size() < 12:
		arr.append(1200)
	var cur_elo: int = int(arr[dom])
	var delta_elo: int = int(round((actual - p_exp) * (34.0 if high_stakes else 24.0)))
	arr[dom] = clampi(cur_elo + delta_elo, 800, 2200)
	save_state["domain_ratings"] = arr
	consecutive_misses = 0 if correct else consecutive_misses + 1
	save_campaign_state()


# --- Daily UTC Feed ---
func get_daily_utc_key() -> String:
	var utc: Dictionary = Time.get_date_dict_from_system(true)
	return "%04d-%02d-%02d" % [int(utc["year"]), int(utc["month"]), int(utc["day"])]


func get_daily_seed_utc() -> int:
	return _fnv1a_32("%s:%s" % [DAILY_SALT, get_daily_utc_key()])


func is_daily_completed_today() -> bool:
	return str(save_state.get("daily_completed_utc", "")) == get_daily_utc_key()


func record_daily_completion(score: int, share_card: String) -> void:
	save_state["daily_completed_utc"] = get_daily_utc_key()
	save_state["daily_last_card"] = share_card
	save_state["daily_best_score"] = maxi(int(save_state.get("daily_best_score", 0)), score)
	save_campaign_state()


func select_daily_questions() -> Array[Dictionary]:
	## 7-Question UTC Daily Global Feed with progressive curve (-1.0 -> +1.2) and crisp variety!
	var pattern: Array[String] = [
		"SIGHTLINE_LOCK",
		"SIGHTLINE_LOCK",
		"GAUNTLET_SHATTER",
		"SIGHTLINE_LOCK",
		"CALIBRATOR_DIAL",
		"SIGHTLINE_LOCK",
		"SIGHTLINE_LOCK",
	]
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = get_daily_seed_utc()
	var chosen: Array[Dictionary] = []
	var used_qids: Dictionary = {}
	var used_domains: Dictionary = {}
	var prev_dom: int = -1

	for slot: int in range(pattern.size()):
		var target_b: float = lerpf(-1.05, 1.15, float(slot) / 6.0)
		var q: Dictionary = _pick_in_range(pattern[slot], target_b - 0.55, target_b + 0.55, target_b, [], used_qids, used_domains, rng, false, prev_dom)
		if not q.is_empty():
			chosen.append(q)
			used_qids[int(q["qid"])] = true
			prev_dom = int(q.get("l0Domain", 0))
			used_domains[prev_dom] = true
	return chosen


# --- STRICT PROGRESSIVE CAMPAIGN ROUND SELECTOR (Easy Geneva -> Genius Apex!) ---
func select_campaign_round_questions(venue_code: String, round_idx: int, count: int = 5) -> Array[Dictionary]:
	var v: Dictionary = get_venue_by_code(venue_code)
	var irt_min: float = float(v["irt_min"])
	var irt_max: float = float(v["irt_max"])
	var allowed_archs: Array = v["archetypes"] as Array
	var span: float = maxf(0.25, irt_max - irt_min)

	# Bias gently upward across the 5 rounds of the city (r = 0..4)
	var r_frac: float = clampf(float(round_idx) / 4.0, 0.0, 1.0)
	var round_center: float = lerpf(irt_min + span * 0.22, irt_max - span * 0.14, r_frac)

	# Build clean, welcoming archetype schedule matching the city's unlocked mechanics
	var schedule: Array[String] = _build_city_archetype_schedule(allowed_archs, count, round_idx)

	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()
	var chosen: Array[Dictionary] = []
	var used_qids: Dictionary = {}
	var used_domains: Dictionary = {}
	var prev_dom: int = -1

	for slot: int in range(count):
		var slot_offset: float = lerpf(-span * 0.18, span * 0.18, float(slot) / maxf(1.0, float(count - 1)))
		var target_b: float = clampf(round_center + slot_offset, irt_min, irt_max)
		var want_arch: String = schedule[slot]
		var q: Dictionary = _pick_in_range(want_arch, irt_min, irt_max, target_b, [], used_qids, used_domains, rng, true, prev_dom)
		if not q.is_empty():
			chosen.append(q)
			used_qids[int(q["qid"])] = true
			prev_dom = int(q.get("l0Domain", 0))
			used_domains[prev_dom] = true

	return chosen


func _build_city_archetype_schedule(allowed_archs: Array, count: int, round_idx: int) -> Array[String]:
	var schedule: Array[String] = []
	if allowed_archs.size() <= 1:
		for _i: int in range(count):
			schedule.append("SIGHTLINE_LOCK")
		return schedule

	# Majority Classic 4-Choice so gameplay stays crisp, fast, and instantly recognizable,
	# weaving in the newly unlocked format on slots 1 and/or 3!
	for i: int in range(count):
		schedule.append("SIGHTLINE_LOCK")

	if count >= 4:
		var special_pool: Array[String] = []
		for a: Variant in allowed_archs:
			var sa: String = str(a)
			if sa != "SIGHTLINE_LOCK":
				special_pool.append(sa)
		if not special_pool.is_empty():
			schedule[1] = special_pool[round_idx % special_pool.size()]
			if count >= 5 and special_pool.size() >= 2:
				schedule[3] = special_pool[(round_idx + 1) % special_pool.size()]
	return schedule


# --- NEW CATEGORIES MODE SELECTOR (Pick 1, Multiple, or ALL Categories + Difficulty + Length!) ---
func select_category_questions(domain_ids: Array[int], difficulty_preset: String = "MEDIUM", count: int = 10) -> Array[Dictionary]:
	var upper_diff: String = difficulty_preset.to_upper()
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()

	var chosen: Array[Dictionary] = []
	var used_qids: Dictionary = {}
	var used_domains: Dictionary = {}
	var prev_dom: int = -1

	# Trigger lazy-load for requested domains (instant local FileAccess on Desktop/Android; background HTTP on Web)
	if has_shard_manifest():
		var preload_doms: Array[int] = [0, 1, 2, 4]
		if not domain_ids.is_empty():
			preload_doms = domain_ids
		for did_req: int in preload_doms:
			if not is_domain_shard_loaded(did_req):
				request_domain_shard(did_req)

	for slot: int in range(count):
		var lo: float = -0.35
		var hi: float = 0.75
		var target_b: float = 0.20
		match upper_diff:
			"EASY":
				lo = -1.80
				hi = -0.20
				target_b = lerpf(-1.35, -0.35, float(slot) / maxf(1.0, float(count - 1)))
			"HARD":
				lo = 0.65
				hi = 2.80
				target_b = lerpf(0.85, 2.25, float(slot) / maxf(1.0, float(count - 1)))
			"PROGRESSIVE":
				var frac: float = float(slot) / maxf(1.0, float(count - 1))
				target_b = lerpf(-1.35, 1.85, frac)
				lo = target_b - 0.55
				hi = target_b + 0.55
			_: # MEDIUM
				lo = -0.40
				hi = 0.80
				target_b = lerpf(-0.20, 0.65, float(slot) / maxf(1.0, float(count - 1)))

		# Mix crisp variety on longer rounds while honoring selected categories!
		var want_arch: String = "SIGHTLINE_LOCK"
		if slot == 1 and count >= 5:
			want_arch = "GAUNTLET_SHATTER"
		elif slot == 3 and count >= 5:
			want_arch = "CALIBRATOR_DIAL"
		elif slot > 4 and slot % 4 == 2:
			want_arch = "GAUNTLET_SHATTER"

		var avoid_dom: int = prev_dom if domain_ids.size() != 1 else -1
		var q: Dictionary = {}
		# Hybrid Tier-1 + Tier-2 (~1M Fact-Graph Shards!): alternate smoothly when Tier-2 shards are loaded!
		if (slot % 2 == 1) and _has_any_loaded_shard_for(domain_ids):
			q = _pick_from_loaded_shards(want_arch, lo, hi, target_b, domain_ids, used_qids, rng, true, avoid_dom)
		if q.is_empty():
			q = _pick_in_range(want_arch, lo, hi, target_b, domain_ids, used_qids, used_domains, rng, true, avoid_dom)
		if not q.is_empty():
			chosen.append(q)
			used_qids[int(q["qid"])] = true
			prev_dom = int(q.get("l0Domain", 0))
			used_domains[prev_dom] = true

	return chosen


# --- ENDLESS MODE SELECTOR (Smoothly climbs from Easy to Genius across depths!) ---
func select_endless_batch(depth_start: int, count: int = 5) -> Array[Dictionary]:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()
	var chosen: Array[Dictionary] = []
	var used_qids: Dictionary = {}
	var used_domains: Dictionary = {}
	var prev_dom: int = -1

	if has_shard_manifest():
		var next_dom: int = (depth_start / 5) % 12
		if not is_domain_shard_loaded(next_dom):
			request_domain_shard(next_dom)

	for slot: int in range(count):
		var d: int = depth_start + slot
		var target_b: float = clampf(-1.20 + float(d) * 0.14, -1.50, 2.40)
		var want_arch: String = "SIGHTLINE_LOCK"
		if slot == 1 and d >= 2:
			want_arch = "GAUNTLET_SHATTER"
		elif slot == 3 and d >= 4:
			want_arch = "CALIBRATOR_DIAL"
		var q: Dictionary = {}
		if (slot % 2 == 1) and _has_any_loaded_shard_for([]):
			q = _pick_from_loaded_shards(want_arch, target_b - 0.55, target_b + 0.55, target_b, [], used_qids, rng, true, prev_dom)
		if q.is_empty():
			q = _pick_in_range(want_arch, target_b - 0.55, target_b + 0.55, target_b, [], used_qids, used_domains, rng, true, prev_dom)
		if not q.is_empty():
			chosen.append(q)
			used_qids[int(q["qid"])] = true
			prev_dom = int(q.get("l0Domain", 0))
			used_domains[prev_dom] = true
	return chosen


func pick_fork_question(domain_id: int, irt_min: float, irt_max: float, want_arch: String, used_qids: Dictionary) -> Dictionary:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()
	var doms: Array[int] = [clampi(domain_id, 0, 11)]
	return _pick_in_range(want_arch, irt_min, irt_max, (irt_min + irt_max) * 0.5, doms, used_qids, {}, rng, true, -1)


func pick_two_fork_domains(exclude_dom: int, allowed_domains: Array[int] = []) -> Array[int]:
	var pool: Array[int] = []
	if allowed_domains.size() >= 2:
		for d: int in allowed_domains:
			if d != exclude_dom:
				pool.append(d)
	if pool.size() < 2:
		pool.clear()
		for d: int in range(12):
			if d != exclude_dom:
				pool.append(d)
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()
	var first_idx: int = rng.randi_range(0, pool.size() - 1)
	var d1: int = pool[first_idx]
	pool.remove_at(first_idx)
	var d2: int = pool[rng.randi_range(0, pool.size() - 1)]
	return [d1, d2]


func _pick_in_range(
	want_arch: String,
	irt_min: float,
	irt_max: float,
	target_b: float,
	allowed_domains: Array[int],
	used_qids: Dictionary,
	used_domains: Dictionary,
	rng: RandomNumberGenerator,
	prefer_unseen: bool,
	avoid_prev_domain: int = -1
) -> Dictionary:
	# Build candidate pool filtered by domain (if any) and archetype
	var base_pool: Array = []
	if allowed_domains.is_empty():
		base_pool = _by_archetype.get(want_arch, []) as Array
		if base_pool.is_empty():
			base_pool = _questions
	else:
		for did: int in allowed_domains:
			var dlist: Array = _by_domain.get(did, []) as Array
			for q: Variant in dlist:
				var qd: Dictionary = q as Dictionary
				if str(qd.get("archetype", "SIGHTLINE_LOCK")) == want_arch:
					base_pool.append(qd)
		if base_pool.is_empty():
			for did: int in allowed_domains:
				var dlist2: Array = _by_domain.get(did, []) as Array
				for q2: Variant in dlist2:
					base_pool.append(q2)

	# Pass 1: Strict in-range [irt_min, irt_max]; Pass 2: Relaxed closest-b fallback
	for strict_pass: int in range(2):
		var best_q: Dictionary = {}
		var best_score: float = -999999.0
		var stride: int = maxi(1, base_pool.size() / 260)
		var offset: int = rng.randi_range(0, stride - 1) if stride > 1 else 0
		var idx: int = offset
		while idx < base_pool.size():
			var q: Dictionary = base_pool[idx] as Dictionary
			idx += stride
			var qid: int = int(q.get("qid", 0))
			if used_qids.has(qid):
				continue
			var b: float = float(q.get("irtB", 0.0))
			if strict_pass == 0 and (b < irt_min or b > irt_max):
				continue
			var dom: int = int(q.get("l0Domain", 0))
			var s: float = 0.0
			if prefer_unseen and not is_seen(qid):
				s += 35.0
			if avoid_prev_domain >= 0 and dom == avoid_prev_domain:
				s -= 80.0
			elif allowed_domains.size() != 1 and not used_domains.has(dom):
				s += 14.0
			s -= absf(b - target_b) * 18.0
			s += rng.randf() * 6.0
			if s > best_score:
				best_score = s
				best_q = q
		if not best_q.is_empty():
			return best_q

	# Final safety scan across all questions
	for q: Dictionary in _questions:
		if not used_qids.has(int(q.get("qid", 0))):
			return q
	return _questions[0] if not _questions.is_empty() else {}


# --- Answer Shuffling & Evaluators ---
func get_answer_facets(q: Dictionary, run_salt: int = 0) -> Array[Dictionary]:
	var facets: Array[Dictionary] = []
	var correct_text: String = str(q.get("answerCorrect", "Meridian"))
	facets.append({"text": correct_text, "is_correct": true, "plausibility": 1.0})
	var distractors: Variant = q.get("distractors", [])
	if distractors is Array:
		for d: Variant in distractors:
			if facets.size() >= 4:
				break
			if d is Dictionary:
				facets.append({
					"text": str((d as Dictionary).get("text", "Unknown")),
					"is_correct": false,
					"plausibility": float((d as Dictionary).get("plausibility", 0.55)),
				})
			elif d is String:
				facets.append({"text": d, "is_correct": false, "plausibility": 0.55})
	while facets.size() < 4:
		facets.append({"text": "Option %d" % (facets.size() + 1), "is_correct": false, "plausibility": 0.2})

	var qid: int = int(q.get("qid", 1))
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = _fnv1a_32("WS_FACET_SHUFFLE:%d:%d:%s" % [qid, run_salt, correct_text])
	for _w: int in range(6):
		rng.randi()
	_deterministic_shuffle(facets, rng)
	return facets


func get_calibrator_spec(q: Dictionary) -> Dictionary:
	var cal: Dictionary = q.get("calibratorExt", {}) as Dictionary if q.get("calibratorExt") is Dictionary else {}
	var min_v: float = float(cal.get("minVal", 1800.0))
	var max_v: float = float(cal.get("maxVal", 2025.0))
	var exact_v: float = float(cal.get("exactVal", (min_v + max_v) * 0.5))
	var step_v: float = maxf(0.1, float(cal.get("step", 1.0)))
	var unit: String = str(cal.get("unit", ""))
	if max_v <= min_v:
		max_v = min_v + 100.0
	var span: float = max_v - min_v
	var win_margin: float = maxf(step_v, snappedf(span * 0.12, step_v))
	return {
		"min_val": min_v,
		"max_val": max_v,
		"exact_val": exact_v,
		"step": step_v,
		"win_margin": win_margin,
		"exact_norm": clampf((exact_v - min_v) / span, 0.0, 1.0),
		"unit": unit,
	}


func get_codex_spec(q: Dictionary) -> Dictionary:
	var cx: Dictionary = q.get("codexExt", {}) as Dictionary if q.get("codexExt") is Dictionary else {}
	var pairs_raw: Variant = cx.get("pairs", [])
	var subjects: Array[String] = []
	var correct_targets: Array[String] = []
	var target_pool: Array[String] = []
	if pairs_raw is Array:
		for p: Variant in pairs_raw:
			if p is Dictionary and subjects.size() < 3:
				subjects.append(str((p as Dictionary).get("subject", "Item")))
				var t: String = str((p as Dictionary).get("target", "Value"))
				correct_targets.append(t)
				target_pool.append(t)
	while subjects.size() < 3:
		subjects.append("Cipher %d" % (subjects.size() + 1))
		correct_targets.append("Key %d" % correct_targets.size())
		target_pool.append("Key %d" % target_pool.size())

	var decoy: String = str(cx.get("decoyTarget", "Decoy Key"))
	if not target_pool.has(decoy):
		target_pool.append(decoy)

	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = _fnv1a_32("CODEX:%d" % int(q.get("qid", 1)))
	for i: int in range(target_pool.size() - 1, 0, -1):
		var j: int = rng.randi_range(0, i)
		var tmp: String = target_pool[i]
		target_pool[i] = target_pool[j]
		target_pool[j] = tmp

	return {
		"subjects": subjects,
		"correct_targets": correct_targets,
		"targets": target_pool,
	}


func evaluate_choice_answer(
	q: Dictionary,
	selected_facet: Dictionary,
	used_hint: bool,
	used_5050: bool,
	wager_2x: bool,
	elapsed_sec: float,
	time_limit_sec: float,
	cur_streak: int
) -> Dictionary:
	var qid: int = int(q.get("qid", 0))
	mark_seen(qid)
	save_history()

	var correct: bool = bool(selected_facet.get("is_correct", false))
	var lifeline_mult: float = 1.0
	if used_5050:
		lifeline_mult *= 0.65
	if used_hint:
		lifeline_mult *= 0.80
	var wager_mult: float = 2.0 if wager_2x else 1.0
	var speed_bonus: int = int(round((1.0 - clampf(elapsed_sec / maxf(1.0, time_limit_sec), 0.0, 1.0)) * float(MAX_SPEED_BONUS))) if correct else 0
	var streak_bonus: int = mini(500, cur_streak * 100) if correct else 0
	var backfired: bool = (not correct) and wager_2x

	var total_points: int = 0
	if correct:
		total_points = int(round(float(BASE_POINTS + speed_bonus + streak_bonus) * lifeline_mult * wager_mult))
	elif backfired:
		total_points = -250

	var peel_tier_compat: int = 3 if used_5050 else (2 if used_hint else 1)
	update_psychometrics(q, correct, wager_2x)

	return {
		"qid": qid,
		"correct": correct,
		"backfired": backfired,
		"bullseye": false,
		"grazing": false,
		"peel_tier": peel_tier_compat,
		"overclocked": wager_2x,
		"total_points": total_points,
		"correct_answer": str(q.get("answerCorrect", "")),
		"why": str(q.get("whyExplanation", "Verified in the World's Smartest Archive.")),
	}


func evaluate_direct_estimate(
	q: Dictionary,
	guess_val: float,
	elapsed_sec: float,
	time_limit_sec: float,
	wager_2x: bool = false,
	cur_streak: int = 0
) -> Dictionary:
	var qid: int = int(q.get("qid", 0))
	mark_seen(qid)
	save_history()

	var spec: Dictionary = get_calibrator_spec(q)
	var exact_v: float = float(spec["exact_val"])
	var win_margin: float = float(spec["win_margin"])
	var unit: String = str(spec["unit"])
	var diff: float = absf(guess_val - exact_v)

	var bullseye: bool = diff <= maxf(float(spec["step"]) * 0.5, win_margin * 0.25)
	var in_margin: bool = diff <= win_margin
	var close_call: bool = (not in_margin) and (diff <= win_margin * 1.55)

	var speed_bonus: int = int(round((1.0 - clampf(elapsed_sec / maxf(1.0, time_limit_sec), 0.0, 1.0)) * float(MAX_SPEED_BONUS)))
	var streak_bonus: int = mini(500, cur_streak * 100)
	var wager_mult: float = 2.0 if wager_2x else 1.0

	var total_points: int = 0
	var rating: String = "MISSED"
	if bullseye:
		total_points = int(round(float(950 + speed_bonus + streak_bonus) * wager_mult))
		rating = "BULLSEYE!"
	elif in_margin:
		var acc_ratio: float = clampf(1.0 - (diff / maxf(0.001, win_margin)), 0.0, 1.0)
		var base_hit: float = lerpf(550.0, 850.0, acc_ratio)
		total_points = int(round((base_hit + float(speed_bonus + streak_bonus)) * wager_mult))
		rating = "GREAT!"
	elif close_call:
		total_points = int(round(320.0 * wager_mult))
		rating = "CLOSE!"
	elif wager_2x:
		total_points = -250

	var correct_like: bool = in_margin or close_call
	update_psychometrics(q, in_margin, bullseye or wager_2x)

	var exact_str: String = format_calibrator_value(exact_v, unit)
	var guess_str: String = format_calibrator_value(guess_val, unit)
	var diff_str: String = format_calibrator_value(diff, unit)
	var compare_line: String = "Exact: %s · You guessed %s (%s off — %s)" % [exact_str, guess_str, diff_str, rating]

	return {
		"qid": qid,
		"correct": correct_like,
		"exact_hit": in_margin,
		"grazing": close_call,
		"bullseye": bullseye,
		"backfired": (not correct_like) and wager_2x,
		"peel_tier": 1 if in_margin else 2,
		"overclocked": bullseye or wager_2x,
		"guess_display": guess_str,
		"compare_line": compare_line,
		"rating": rating,
		"total_points": total_points,
		"correct_answer": exact_str,
		"why": str(q.get("whyExplanation", "Precision verified in the archive.")),
	}


func evaluate_codex(
	q: Dictionary,
	chosen_targets: Array[String],
	elapsed_sec: float,
	time_limit_sec: float,
	wager_2x: bool = false
) -> Dictionary:
	var qid: int = int(q.get("qid", 0))
	mark_seen(qid)
	save_history()

	var spec: Dictionary = get_codex_spec(q)
	var correct_targets: Array = spec["correct_targets"] as Array
	var matched: int = 0
	for i: int in range(mini(chosen_targets.size(), correct_targets.size())):
		if chosen_targets[i] == str(correct_targets[i]):
			matched += 1
	var perfect: bool = matched == correct_targets.size()
	var partial: bool = matched >= 2
	var speed_bonus: int = int(round((1.0 - clampf(elapsed_sec / maxf(1.0, time_limit_sec), 0.0, 1.0)) * float(MAX_SPEED_BONUS))) if perfect else 0
	var wager_mult: float = 2.0 if wager_2x else 1.0
	var total_points: int = 0
	if perfect:
		total_points = int(round(float(900 + speed_bonus) * wager_mult))
	elif partial:
		total_points = int(round(450.0 * wager_mult))
	elif wager_2x:
		total_points = -250

	update_psychometrics(q, perfect, perfect or wager_2x)

	var summary_pairs: Array[String] = []
	var subs: Array = spec["subjects"] as Array
	for i: int in range(mini(subs.size(), correct_targets.size())):
		summary_pairs.append("%s = %s" % [str(subs[i]), str(correct_targets[i])])

	return {
		"qid": qid,
		"correct": perfect or partial,
		"perfect": perfect,
		"matched": matched,
		"total_pairs": correct_targets.size(),
		"bullseye": perfect,
		"backfired": (not (perfect or partial)) and wager_2x,
		"peel_tier": 1 if perfect else 2,
		"overclocked": perfect or wager_2x,
		"total_points": total_points,
		"correct_answer": " · ".join(summary_pairs),
		"why": str(q.get("whyExplanation", "All pairs decoded.")),
	}


func evaluate_gauntlet(
	q: Dictionary,
	direction: String,
	elapsed_sec: float,
	time_limit_sec: float,
	wager_2x: bool = false
) -> Dictionary:
	var qid: int = int(q.get("qid", 0))
	mark_seen(qid)
	save_history()

	var g: Dictionary = q.get("gauntletExt", {}) as Dictionary if q.get("gauntletExt") is Dictionary else {}
	var is_true: bool = bool(g.get("isTrue", true))
	var is_trick: bool = bool(g.get("isTrick", false))

	var correct: bool = false
	var challenge_bonus: bool = false
	if direction == "UP":
		correct = is_trick
		challenge_bonus = is_trick
	elif direction == "RIGHT":
		correct = is_true and not is_trick
	elif direction == "LEFT":
		correct = (not is_true) and not is_trick

	var speed_bonus: int = int(round((1.0 - clampf(elapsed_sec / maxf(1.0, time_limit_sec), 0.0, 1.0)) * float(MAX_SPEED_BONUS))) if correct else 0
	var wager_mult: float = 2.0 if wager_2x else 1.0
	var total_points: int = 0
	if challenge_bonus:
		total_points = int(round(float(950 + speed_bonus) * wager_mult))
	elif correct:
		total_points = int(round(float(BASE_POINTS + speed_bonus) * wager_mult))
	elif wager_2x or direction == "UP":
		total_points = -250

	update_psychometrics(q, correct, challenge_bonus or wager_2x)

	var ans_label: String = "TRICK QUESTION!" if is_trick else ("TRUE" if is_true else "FALSE")
	return {
		"qid": qid,
		"correct": correct,
		"bullseye": challenge_bonus,
		"backfired": (not correct) and (direction == "UP" or wager_2x),
		"peel_tier": 1,
		"overclocked": challenge_bonus or wager_2x,
		"total_points": total_points,
		"correct_answer": ans_label,
		"why": str(q.get("whyExplanation", "Fact check verified.")),
	}


func format_calibrator_value(val: float, unit: String) -> String:
	var rounded: String = str(int(round(val))) if absf(val) >= 10.0 else ("%.1f" % val)
	return SovereignTheme.sanitize_display_text(("%s %s" % [rounded, unit]).strip_edges())


func _fnv1a_32(text: String) -> int:
	var hash_val: int = 0x811c9dc5
	var bytes: PackedByteArray = text.to_utf8_buffer()
	for b: int in bytes:
		hash_val = hash_val ^ b
		hash_val = (hash_val * 0x01000193) & 0xFFFFFFFF
	return hash_val


func _deterministic_shuffle(arr: Array[Dictionary], rng: RandomNumberGenerator) -> void:
	for i: int in range(arr.size() - 1, 0, -1):
		var j: int = rng.randi_range(0, i)
		var tmp: Dictionary = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp


func _build_fallback_campaign_skeleton() -> void:
	_missions.clear()
	_missions_by_id.clear()
	var m_num: int = 1
	for v: Dictionary in VENUES:
		for slot: int in range(1, 6):
			var mid: String = "%s_%d" % [str(v["code"]), slot]
			var md: Dictionary = {
				"id": mid,
				"mission_number": m_num,
				"act": int(v["act"]),
				"hub_id": str(v["code"]),
				"venue_region": str(v["region"]),
				"title": "%s — Round %d" % [str(v["city"]), slot],
				"question_count": 5,
				"speaker": str(v["speaker_id"]),
				"rival_id": str(v["boss_id"]),
				"dialogue_beats": [
					{
						"speaker": str(v["speaker_id"]),
						"voice_clip": "res://assets/voice/vance_intro_1.mp3",
						"text": "Welcome to %s. Prove your edge in Round %d." % [str(v["venue_name"]), slot],
					},
				],
				"cliffhanger_hook": "Your championship standings climb across the global circuit.",
			}
			_missions.append(md)
			_missions_by_id[mid] = md
			m_num += 1


func _load_starter_seed() -> void:
	var seed_q: Dictionary = {
		"qid": 1, "l0Domain": 0, "l1Category": "History", "regions": ["CH", "GLOBAL"],
		"irtB": -0.8, "irtA": 1.2, "archetype": "SIGHTLINE_LOCK",
		"prompt": "Founded in Geneva in 1863, which humanitarian body inverted the Swiss flag for its emblem?",
		"answerCorrect": "Red Cross",
		"distractors": [
			{"text": "Doctors Without Borders", "plausibility": 0.82},
			{"text": "Amnesty International", "plausibility": 0.62},
			{"text": "World Health Org.", "plausibility": 0.74},
		],
		"clues": [
			"Henry Dunant co-founded it after the 1859 Battle of Solferino.",
			"Its emblem flips white-on-crimson into a crimson cross on white.",
		],
		"whyExplanation": "The International Committee of the Red Cross inverted the Swiss flag to denote neutrality.",
	}
	_questions.append(seed_q)
	_by_qid[1] = seed_q
	(_by_archetype["SIGHTLINE_LOCK"] as Array).append(seed_q)
	(_by_domain[0] as Array).append(seed_q)
	_domain_counts[0] = 1


# ==============================================================================
# STORY THRILLER APIS: CUTSCENES, EVIDENCE BOARD, REACTIVE RIVALS & PORTRAITS
# ==============================================================================
func get_cast_portrait_path(speaker_id: String, expression: String = "neutral") -> String:
	var base_id: String = speaker_id.to_lower()
	var expr: String = expression.to_lower()
	if not expr.is_empty() and expr != "neutral":
		var expr_path: String = "res://assets/portraits_cutout/%s_%s.png" % [base_id, expr]
		if ResourceLoader.exists(expr_path):
			return expr_path
	return str(get_cast_profile(base_id)["portrait"])


func get_all_act_cutscenes() -> Array[Dictionary]:
	return _act_cutscenes


func get_act_cutscene(act_idx: int) -> Dictionary:
	for cs: Dictionary in _act_cutscenes:
		if int(cs.get("act_index", cs.get("act", -1))) == act_idx:
			return cs
	if act_idx >= 0 and act_idx < _act_cutscenes.size():
		return _act_cutscenes[act_idx]
	return _act_cutscenes[0] if not _act_cutscenes.is_empty() else {}


func has_seen_cutscene(act_id: String) -> bool:
	var seen: Variant = save_state.get("seen_cutscenes", [])
	return seen is Array and (seen as Array).has(act_id)


func mark_cutscene_seen(act_id: String) -> void:
	var seen: Array = save_state.get("seen_cutscenes", []) as Array if save_state.get("seen_cutscenes") is Array else []
	if not seen.has(act_id):
		seen.append(act_id)
		save_state["seen_cutscenes"] = seen
		save_campaign_state()


func get_evidence_board() -> Array[Dictionary]:
	return _evidence_board


func is_evidence_unlocked(clue: Dictionary) -> bool:
	if int(clue.get("number", 0)) == 1:
		return true
	var req: Variant = clue.get("unlock_mission", 1)
	if req is String:
		var mid: String = (req as String).strip_edges()
		if mid == "ch_1" or mid.is_empty():
			return true
		if is_mission_completed(mid):
			return true
		if _missions_by_id.has(mid):
			var m_num: int = int((_missions_by_id[mid] as Dictionary).get("mission_number", 99))
			return m_num <= 1 or get_completed_count() >= m_num
		return false
	var req_m: int = int(req)
	if req_m <= 1:
		return true
	return get_completed_count() >= (req_m - 1)


func get_rival_reaction(actor_id: String, trigger_key: String) -> Dictionary:
	var aid: String = actor_id.to_lower()
	var trig: String = trigger_key.to_lower()
	var default_expr: String = "neutral"
	match trig:
		"on_player_streak":
			default_expr = "shocked" if aid == "nadia" else "intense"
		"on_player_miss", "on_rival_ahead":
			default_expr = "smirk" if aid == "soren" else "intense"
		"on_boss_intro":
			default_expr = "intense"
		"on_defeat":
			default_expr = "shocked" if aid == "nadia" else "neutral"

	var voice_stem: String = "%s_%s" % [aid, trig]
	if _rival_reactions.has(aid) and _rival_reactions[aid] is Dictionary:
		var amap: Dictionary = _rival_reactions[aid] as Dictionary
		if amap.has(trig) and amap[trig] is Dictionary:
			var entry: Dictionary = amap[trig] as Dictionary
			return {
				"text": str(entry.get("text", "")),
				"expression": str(entry.get("expression", default_expr)),
				"voice_clip": str(entry.get("voice_clip", voice_stem)),
			}

	var fallback_lines: Dictionary = {
		"on_player_streak": "Impressive streak—don't get overconfident.",
		"on_player_miss": "Slip of focus. That opening is mine.",
		"on_rival_ahead": "You're falling behind on the scoreboard.",
		"on_boss_intro": "Everything you've earned comes down to this duel.",
		"on_defeat": "Well played. You earned this city.",
	}
	return {
		"text": str(fallback_lines.get(trig, "Staying sharp.")),
		"expression": default_expr,
		"voice_clip": voice_stem,
	}


func _build_fallback_act_cutscenes() -> void:
	_act_cutscenes = [
		{
			"id": "act0_invitation", "act": 0, "title": "The Invitation", "subtitle": "Geneva Prologue",
			"image": "res://assets/cutscenes/act0_invitation.jpg",
			"beats": [
				{"speaker": "vance", "voice_clip": "cutscene_act0_1", "text": "Eight cities. Forty rounds. One hundred million dollars waiting behind a single sealed ledger."},
				{"speaker": "vance", "voice_clip": "cutscene_act0_2", "text": "They call it a championship of pure intellect. Look closer, and you'll notice the rules bend for whoever controls the vault."},
				{"speaker": "vance", "voice_clip": "cutscene_act0_3", "text": "Welcome to Geneva. Pass the qualifier—and keep your eyes open behind the glass."},
			],
		},
		{
			"id": "act1_london_leak", "act": 1, "title": "The London Leak", "subtitle": "Sovereign Rotunda",
			"image": "res://assets/cutscenes/act1_london_leak.jpg",
			"beats": [
				{"speaker": "teo", "voice_clip": "cutscene_act1_1", "text": "Don't turn around. Someone inside London's broadcast booth sold the Round 5 question packet an hour ago."},
				{"speaker": "nadia", "voice_clip": "cutscene_act1_2", "text": "If you think I needed leaked questions to beat you in London, prove it on the board."},
			],
		},
		{
			"id": "act2_tokyo_confrontation", "act": 2, "title": "Tokyo Confrontation", "subtitle": "Shinkansen Sky Pavilion",
			"image": "res://assets/cutscenes/act2_tokyo_confrontation.jpg",
			"beats": [
				{"speaker": "soren", "voice_clip": "cutscene_act2_1", "text": "Speed beats pedigree at thirty floors up. Care to wager your streak against my reflexes?"},
				{"speaker": "teo", "voice_clip": "cutscene_act2_2", "text": "Watch Soren's feed—someone is routing live telemetry off the Tokyo relay."},
			],
		},
		{
			"id": "act3_cairo_vault", "act": 3, "title": "The Cairo Vault", "subtitle": "Solar Acoustic Hall",
			"image": "res://assets/cutscenes/act3_cairo_vault.jpg",
			"beats": [
				{"speaker": "teo", "voice_clip": "cutscene_act3_1", "text": "This acoustic chamber wasn't built for trivia. The archive key from Trial Zero is hidden right beneath our feet."},
				{"speaker": "tariq", "voice_clip": "cutscene_act3_2", "text": "Every champion before you asked the wrong questions. Ask the right ones, and the vault opens."},
			],
		},
		{
			"id": "act4_singapore_betrayal", "act": 4, "title": "Singapore Betrayal", "subtitle": "Diplomatic Sky-Bridge",
			"image": "res://assets/cutscenes/act4_singapore_betrayal.jpg",
			"beats": [
				{"speaker": "lindqvist", "voice_clip": "cutscene_act4_1", "text": "You've climbed far enough to become inconvenient. Tonight, the Council decides who reaches the Apex."},
				{"speaker": "nadia", "voice_clip": "cutscene_act4_2", "text": "They tried to bury Trial Zero once. Win Singapore, and we expose the whole ledger live on air."},
			],
		},
		{
			"id": "act5_apex_finale", "act": 5, "title": "The Apex Finale", "subtitle": "International Waters",
			"image": "res://assets/cutscenes/act5_apex_finale.jpg",
			"beats": [
				{"speaker": "vance", "voice_clip": "cutscene_act5_1", "text": "The whole world is watching. Eight cities behind you, one hundred million dollars in front of you."},
				{"speaker": "vance", "voice_clip": "cutscene_act5_2", "text": "Claim the crown—and decide whether the truth stays locked in this room or belongs to everyone."},
			],
		},
	]


func _build_fallback_evidence_board() -> void:
	_evidence_board = [
		{"id": "clue_01", "title": "Mirror Reflection Flash", "city_id": "ch", "unlock_mission": 1, "suspect_id": "vance", "summary": "A bright tablet flashed behind Geneva's one-way glass during screening—proof someone is feeding live prompts.", "red_thread_to": ["clue_02", "clue_03"]},
		{"id": "clue_02", "title": "Sealed Ledger Key #00", "city_id": "ch", "unlock_mission": 4, "suspect_id": "tariq", "summary": "Missing signature from Trial Zero winner Tariq Al-Mansoor on the original $100M escrow charter.", "red_thread_to": ["clue_06", "clue_11"]},
		{"id": "clue_03", "title": "Rotunda Uplink Log", "city_id": "gb", "unlock_mission": 6, "suspect_id": "teo", "summary": "Encrypted packet burst left London's control booth 42 minutes before Nadia's showcase round.", "red_thread_to": ["clue_04", "clue_05"]},
		{"id": "clue_04", "title": "Encrypted Sponsor Wire", "city_id": "gb", "unlock_mission": 10, "suspect_id": "lindqvist", "summary": "Offshore transfer routed from Chancellor Lindqvist's Sovereign Bloc straight to a dummy broadcast vendor.", "red_thread_to": ["clue_09", "clue_10"]},
		{"id": "clue_05", "title": "Shinkansen Relay Tap", "city_id": "jp", "unlock_mission": 12, "suspect_id": "soren", "summary": "Micro-latency spoof on Soren's Tokyo buzzer gave him a 0.4s head start until you exposed it.", "red_thread_to": ["clue_07"]},
		{"id": "clue_06", "title": "Nadia's Private Notebook", "city_id": "br", "unlock_mission": 16, "suspect_id": "nadia", "summary": "Nadia isn't cheating—she's tracking her missing brother Tariq's trail across the championship circuit.", "red_thread_to": ["clue_08", "clue_11"]},
		{"id": "clue_07", "title": "Botanical Jammer Chip", "city_id": "br", "unlock_mission": 20, "suspect_id": "teo", "summary": "Hardware jammer recovered under Rio's canopy matches serial numbers from Geneva's security vault.", "red_thread_to": ["clue_08"]},
		{"id": "clue_08", "title": "Cairo Acoustic Cipher", "city_id": "eg", "unlock_mission": 23, "suspect_id": "tariq", "summary": "Resonance recording hidden inside the Solar Hall reveals Julian Vance vetoed an earlier whistleblower audit.", "red_thread_to": ["clue_09", "clue_12"]},
		{"id": "clue_09", "title": "Geothermal Cold Backup", "city_id": "is", "unlock_mission": 27, "suspect_id": "tariq", "summary": "Unedited Trial Zero footage archived under Reykjavik shows the final question was swapped mid-air.", "red_thread_to": ["clue_10", "clue_12"]},
		{"id": "clue_10", "title": "Sky-Bridge Betrayal Audio", "city_id": "sg", "unlock_mission": 32, "suspect_id": "lindqvist", "summary": "Secret recording of Lindqvist ordering a contender eliminated before reaching international waters.", "red_thread_to": ["clue_12"]},
		{"id": "clue_11", "title": "Meridian Zero Manifest", "city_id": "sg", "unlock_mission": 35, "suspect_id": "nadia", "summary": "Full passenger & payout list proving the $100M prize pool doubles as a geopolitical vetting machine.", "red_thread_to": ["clue_12"]},
		{"id": "clue_12", "title": "The Master Ledger Override", "city_id": "global", "unlock_mission": 38, "suspect_id": "vance", "summary": "Final decryption key placing the fate of the Meridian Championship—and the truth—directly in your hands.", "red_thread_to": []},
	]


# ==============================================================================
# TIER-2 LAZY-LOADED MILLION-SCALE SHARD ENGINE (WS_SHARD_V1 — ZERO STARTUP BLOAT!)
# ==============================================================================
func reload_shard_manifest() -> void:
	_shard_manifest.clear()
	_shard_domain_totals.clear()
	_shard_domain_files.clear()
	_shard_types.clear()
	_shard_decoder_spec.clear()
	_shard_total_playable = 0
	for d: int in range(12):
		_shard_domain_totals[d] = 0
		_shard_domain_files[d] = []

	if not FileAccess.file_exists(SHARD_MANIFEST_PATH):
		return
	var file: FileAccess = FileAccess.open(SHARD_MANIFEST_PATH, FileAccess.READ)
	if file == null:
		return
	var raw: String = file.get_as_text()
	file.close()
	var parsed: Variant = JSON.parse_string(raw)
	if not (parsed is Dictionary):
		return
	_shard_manifest = parsed as Dictionary
	_shard_total_playable = int(_shard_manifest.get("totalQuestions", _shard_manifest.get("total_playable_questions", _shard_manifest.get("total_questions", 0))))
	if _shard_manifest.get("types") is Dictionary:
		_shard_types = _shard_manifest["types"] as Dictionary
	if _shard_manifest.get("decoderSpec") is Dictionary:
		_shard_decoder_spec = _shard_manifest["decoderSpec"] as Dictionary

	var doms: Variant = _shard_manifest.get("domains", _shard_manifest.get("shards", []))
	if doms is Array:
		for item: Variant in (doms as Array):
			if item is Dictionary:
				var d_entry: Dictionary = item as Dictionary
				var did2: int = int(d_entry.get("l0Domain", d_entry.get("domain_id", -1)))
				if did2 >= 0 and did2 < 12:
					_shard_domain_totals[did2] = int(d_entry.get("questions", d_entry.get("playable_questions", 0)))
					var flist: Array = []
					if d_entry.get("files") is Array:
						for fm: Variant in (d_entry["files"] as Array):
							if fm is Dictionary:
								flist.append(fm as Dictionary)
					elif d_entry.has("file"):
						flist.append({"path": str(d_entry["file"])})
					_shard_domain_files[did2] = flist
	elif doms is Dictionary:
		for k: Variant in (doms as Dictionary).keys():
			var did: int = int(str(k))
			if did >= 0 and did < 12:
				var entry: Variant = (doms as Dictionary)[k]
				if entry is Dictionary:
					var ed: Dictionary = entry as Dictionary
					_shard_domain_totals[did] = int(ed.get("questions", ed.get("playable_questions", 0)))
					if ed.get("files") is Array:
						_shard_domain_files[did] = ed["files"] as Array
					elif ed.has("file"):
						_shard_domain_files[did] = [{"path": str(ed["file"])}]
				else:
					_shard_domain_totals[did] = int(entry)


func get_total_playable_count() -> int:
	return _questions.size() + _shard_total_playable


func get_combined_domain_counts() -> Dictionary:
	var combined: Dictionary = {}
	for d: int in range(12):
		combined[d] = int(_domain_counts.get(d, 0)) + int(_shard_domain_totals.get(d, 0))
	return combined


func has_shard_manifest() -> bool:
	return not _shard_manifest.is_empty() and _shard_total_playable > 0


func is_domain_shard_loaded(domain_id: int) -> bool:
	return _loaded_shards.has(domain_id) and not (_loaded_shards[domain_id] as Array).is_empty()


func _has_any_loaded_shard_for(allowed_domains: Array[int]) -> bool:
	if _loaded_shards.is_empty():
		return false
	if allowed_domains.is_empty():
		return true
	for did: int in allowed_domains:
		if is_domain_shard_loaded(did):
			return true
	return false


func request_domain_shard(domain_id: int, chunk_idx: int = -1) -> void:
	var did: int = clampi(domain_id, 0, 11)
	if not has_shard_manifest():
		return
	var flist: Array = _shard_domain_files.get(did, []) as Array
	if flist.is_empty():
		return
	var target_path: String = ""
	if chunk_idx >= 0 and chunk_idx < flist.size():
		target_path = str((flist[chunk_idx] as Dictionary).get("path", ""))
	else:
		# Pick first unloaded chunk (or random unloaded chunk)
		for fm: Variant in flist:
			if fm is Dictionary:
				var p: String = str((fm as Dictionary).get("path", ""))
				if not p.is_empty() and not _loaded_shard_paths.has(p) and not _pending_shard_reqs.has(p):
					target_path = p
					break
	if target_path.is_empty() or _loaded_shard_paths.has(target_path) or _pending_shard_reqs.has(target_path):
		return

	# Native / Desktop / Android: instant local FileAccess (supports .json and .json.gz!)
	if not OS.has_feature("web"):
		var local_path: String = "res://data/shards/" + target_path
		if FileAccess.file_exists(local_path):
			var bytes: PackedByteArray = FileAccess.get_file_as_bytes(local_path)
			if bytes.size() > 0:
				_ingest_shard_bytes(did, target_path, bytes)
		return

	# Web HTML5: async HTTPRequest from ./data/shards/<target_path> (zero startup index.pck bloat!)
	_pending_shard_reqs[target_path] = true
	var req: HTTPRequest = HTTPRequest.new()
	add_child(req)
	var base_url: String = ""
	var origin: Variant = JavaScriptBridge.eval("window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1)")
	if origin is String:
		base_url = origin as String
	var url: String = base_url + "data/shards/" + target_path
	var cap_path: String = target_path
	req.request_completed.connect(func(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
		_pending_shard_reqs.erase(cap_path)
		req.queue_free()
		if result == HTTPRequest.RESULT_SUCCESS and code == 200 and body.size() > 0:
			_ingest_shard_bytes(did, cap_path, body)
	)
	req.request(url)


func _ingest_shard_bytes(domain_id: int, fname: String, bytes: PackedByteArray) -> void:
	var text_str: String = ""
	if fname.ends_with(".gz"):
		var raw_bytes: PackedByteArray = bytes.decompress_dynamic(-1, FileAccess.COMPRESSION_GZIP)
		text_str = raw_bytes.get_string_from_utf8()
	else:
		text_str = bytes.get_string_from_utf8()
	if text_str.is_empty():
		return
	var parsed: Variant = JSON.parse_string(text_str)
	if parsed is Dictionary:
		var chunk: Dictionary = parsed as Dictionary
		if not _loaded_shards.has(domain_id):
			_loaded_shards[domain_id] = []
		(_loaded_shards[domain_id] as Array).append(chunk)
		_loaded_shard_paths[fname] = true
		var ent_count: int = 0
		var tables: Variant = chunk.get("t", [])
		if tables is Array:
			for tb: Variant in (tables as Array):
				if tb is Dictionary and (tb as Dictionary).get("r") is Array:
					ent_count += ((tb as Dictionary)["r"] as Array).size()
		shard_loaded.emit(domain_id, ent_count)


func _pick_from_loaded_shards(
	want_arch: String,
	irt_min: float,
	irt_max: float,
	target_b: float,
	allowed_domains: Array[int],
	used_qids: Dictionary,
	rng: RandomNumberGenerator,
	prefer_unseen: bool,
	avoid_prev_domain: int = -1
) -> Dictionary:
	var cand_doms: Array[int] = []
	if allowed_domains.is_empty():
		for k: Variant in _loaded_shards.keys():
			var d_id: int = int(k)
			if is_domain_shard_loaded(d_id):
				cand_doms.append(d_id)
	else:
		for d_id2: int in allowed_domains:
			if is_domain_shard_loaded(d_id2):
				cand_doms.append(d_id2)
	if cand_doms.is_empty():
		return {}

	var best_chunk: Dictionary = {}
	var best_ti: int = -1
	var best_ri: int = -1
	var best_ai: int = -1
	var best_score: float = -999999.0

	for _probe: int in range(56):
		var d_id: int = cand_doms[rng.randi_range(0, cand_doms.size() - 1)]
		var chunks: Array = _loaded_shards[d_id] as Array
		if chunks.is_empty():
			continue
		var chunk: Dictionary = chunks[rng.randi_range(0, chunks.size() - 1)] as Dictionary
		var tables: Array = chunk.get("t", []) as Array
		if tables.is_empty():
			continue
		var ti: int = rng.randi_range(0, tables.size() - 1)
		var tbl: Dictionary = tables[ti] as Dictionary
		var type_id: String = str(tbl.get("type", ""))
		if not _shard_types.has(type_id):
			continue
		var spec: Dictionary = _shard_types[type_id] as Dictionary
		var angles: Array = spec.get("angles", []) as Array
		var rows: Array = tbl.get("r", []) as Array
		if angles.is_empty() or rows.is_empty():
			continue

		# Match requested archetype if available on this table
		var matching_angles: Array[int] = []
		for ai_check: int in range(angles.size()):
			if str((angles[ai_check] as Dictionary).get("archetype", "")) == want_arch:
				matching_angles.append(ai_check)
		if matching_angles.is_empty():
			continue
		var ai: int = matching_angles[rng.randi_range(0, matching_angles.size() - 1)]
		var angle: Dictionary = angles[ai] as Dictionary
		var ri: int = rng.randi_range(0, rows.size() - 1)
		var row: Array = rows[ri] as Array
		if row.is_empty():
			continue

		var qid: int = int(tbl.get("baseQid", 60000)) + ri * angles.size() + ai
		if used_qids.has(qid):
			continue
		var irt_b: float = clampf(float(row[row.size() - 1]) / 100.0 + float(angle.get("irtOffset", 0.0)), -1.60, 2.75)
		if irt_b < irt_min - 0.35 or irt_b > irt_max + 0.35:
			continue

		var sc: float = 0.0
		if prefer_unseen and not is_seen(qid):
			sc += 35.0
		if avoid_prev_domain >= 0 and d_id == avoid_prev_domain and cand_doms.size() > 1:
			sc -= 60.0
		if irt_b < irt_min or irt_b > irt_max:
			sc -= 25.0
		sc -= absf(irt_b - target_b) * 18.0
		sc += rng.randf() * 6.0
		if sc > best_score:
			best_score = sc
			best_chunk = chunk
			best_ti = ti
			best_ri = ri
			best_ai = ai

	if best_ti >= 0:
		return decode_shard_question(best_chunk, best_ti, best_ri, best_ai)
	return {}


func decode_shard_question(chunk: Dictionary, table_idx: int, row_idx: int, angle_idx: int) -> Dictionary:
	## Exact 1:1 WS_SHARD_V1 Deterministic Question Decoder (mirrors validate_million_shards.py).
	var tables: Array = chunk.get("t", []) as Array
	if table_idx < 0 or table_idx >= tables.size():
		return {}
	var table: Dictionary = tables[table_idx] as Dictionary
	var type_id: String = str(table.get("type", ""))
	if not _shard_types.has(type_id):
		return {}
	var spec: Dictionary = _shard_types[type_id] as Dictionary
	var angles: Array = spec.get("angles", []) as Array
	var rows: Array = table.get("r", []) as Array
	if angle_idx < 0 or angle_idx >= angles.size() or row_idx < 0 or row_idx >= rows.size():
		return {}

	var angle: Dictionary = angles[angle_idx] as Dictionary
	var pool: Array = chunk.get("p", []) as Array
	var row: Array = rows[row_idx] as Array
	var cols: Array = spec.get("cols", []) as Array
	var pool_cols_set: Dictionary = {}
	for pc: Variant in (spec.get("poolCols", []) as Array):
		pool_cols_set[int(pc)] = true

	var qid: int = int(table.get("baseQid", 60000)) + row_idx * angles.size() + angle_idx
	var ctx: Dictionary = {}
	for ci: int in range(mini(cols.size(), row.size())):
		var cname: String = str(cols[ci])
		if pool_cols_set.has(ci):
			var pidx: int = int(row[ci])
			ctx[cname] = str(pool[pidx]) if pidx >= 0 and pidx < pool.size() else ""
		else:
			ctx[cname] = row[ci]

	var base_irt: float = float(row[row.size() - 1]) / 100.0
	var irt_b: float = snappedf(clampf(base_irt + float(angle.get("irtOffset", 0.0)), -1.60, 2.75), 0.01)
	var arch: String = str(angle.get("archetype", "SIGHTLINE_LOCK"))
	var radius: int = int(_shard_decoder_spec.get("distractorWindowRadius", 60))

	var q: Dictionary = {
		"qid": qid,
		"l0Domain": int(spec.get("l0Domain", 0)),
		"l1Category": str(spec.get("l1Category", "General")),
		"irtB": irt_b,
		"irtA": 1.25,
		"freshness": "EVERGREEN",
		"archetype": arch,
		"glyphHint": str(spec.get("glyphHint", "compass")),
		"shardType": type_id,
		"angleId": str(angle.get("id", "")),
	}

	if arch == "SIGHTLINE_LOCK":
		var ans: String = _resolve_shard_cell(row, int(angle.get("answerCol", 0)), pool_cols_set, pool)
		ctx["ans_init"] = ans.substr(0, 1).to_upper() if not ans.is_empty() else "?"
		var dists: Array[String] = []
		if angle.has("inlineDistCols") and angle["inlineDistCols"] is Array:
			for ci_v: Variant in (angle["inlineDistCols"] as Array):
				dists.append(_resolve_shard_cell(row, int(ci_v), pool_cols_set, pool))
		else:
			dists = _pick_shard_distractors(rows, row_idx, pool_cols_set, angle, pool, qid, radius)
		q["prompt"] = _format_shard_template(str(angle.get("prompt", "")), ctx)
		q["answerCorrect"] = ans
		var d_arr: Array[Dictionary] = []
		for d_str: String in dists:
			d_arr.append({"text": d_str, "plausibility": 0.78})
		q["distractors"] = d_arr
		q["clues"] = [
			_format_shard_template(str(angle.get("clue1", "")), ctx),
			_format_shard_template(str(angle.get("clue2", "")), ctx),
		]
		q["whyExplanation"] = _format_shard_template(str(angle.get("why", "")), ctx)

	elif arch == "GAUNTLET_SHATTER":
		var is_true: bool = (_fnv1a_32("TF:%d" % qid) & 1) == 0
		if is_true:
			q["prompt"] = _format_shard_template(str(angle.get("truePrompt", "")), ctx)
			q["answerCorrect"] = "TRUE"
			q["whyExplanation"] = _format_shard_template(str(angle.get("whyTrue", "")), ctx)
		else:
			var fake_val: String = "Unknown"
			if angle.has("inlineFakeCol"):
				fake_val = _resolve_shard_cell(row, int(angle["inlineFakeCol"]), pool_cols_set, pool)
			else:
				var fake_col: int = int(angle.get("fakeCol", 1))
				var fake_cands: Array[String] = _pick_shard_distractors(
					rows, row_idx, pool_cols_set, {"distractorCol": fake_col}, pool, qid ^ 0x5A5A, radius
				)
				if not fake_cands.is_empty():
					fake_val = fake_cands[0]
			ctx["fake"] = fake_val
			q["prompt"] = _format_shard_template(str(angle.get("falsePrompt", "")), ctx)
			q["answerCorrect"] = "FALSE"
			q["whyExplanation"] = _format_shard_template(str(angle.get("whyFalse", "")), ctx)
		q["clues"] = [_format_shard_template(str(angle.get("clue1", "")), ctx)]
		q["gauntletExt"] = {"isTrue": is_true, "isTrick": false, "windowSec": 8}

	elif arch == "CALIBRATOR_DIAL":
		var exact_v: int = int(round(float(row[int(angle.get("exactCol", 2))])))
		var unit_str: String = _resolve_shard_cell(row, int(angle["unitCol"]), pool_cols_set, pool) if angle.has("unitCol") else str(angle.get("unit", ""))
		var bounds: Dictionary = _compute_shard_calibrator_bounds(exact_v, angle, qid)
		bounds["unit"] = unit_str
		q["prompt"] = _format_shard_template(str(angle.get("prompt", "")), ctx)
		q["answerCorrect"] = ("%d %s" % [int(bounds["exactVal"]), unit_str]).strip_edges()
		q["clues"] = [_format_shard_template(str(angle.get("clue1", "")), ctx)]
		q["whyExplanation"] = _format_shard_template(str(angle.get("why", "")), ctx)
		q["calibratorExt"] = bounds

	return q


func _resolve_shard_cell(row: Array, col_idx: int, pool_cols_set: Dictionary, pool: Array) -> String:
	if col_idx < 0 or col_idx >= row.size():
		return ""
	if pool_cols_set.has(col_idx):
		var pidx: int = int(row[col_idx])
		return str(pool[pidx]) if pidx >= 0 and pidx < pool.size() else ""
	return str(row[col_idx])


func _format_shard_template(tpl: String, ctx: Dictionary) -> String:
	var out: String = tpl
	for k: Variant in ctx.keys():
		var token: String = "{%s}" % str(k)
		if out.contains(token):
			out = out.replace(token, str(ctx[k]))
	return SovereignTheme.sanitize_display_text(out)


func _int_gcd(a: int, b: int) -> int:
	var x: int = absi(a)
	var y: int = absi(b)
	while y != 0:
		var t: int = x % y
		x = y
		y = t
	return maxi(1, x)


func _pick_shard_distractors(
	rows: Array,
	row_idx: int,
	pool_cols_set: Dictionary,
	angle: Dictionary,
	pool: Array,
	qid: int,
	radius: int
) -> Array[String]:
	var dcol: int = int(angle.get("distractorCol", 1))
	var ans: String = _resolve_shard_cell(rows[row_idx] as Array, dcol, pool_cols_set, pool)
	var has_avoid: bool = angle.has("avoidSameCol") and angle["avoidSameCol"] != null
	var avoid_col: int = int(angle.get("avoidSameCol", -1)) if has_avoid else -1
	var avoid_val: String = _resolve_shard_cell(rows[row_idx] as Array, avoid_col, pool_cols_set, pool).to_lower() if has_avoid else ""
	var has_prefer: bool = angle.has("preferSameCol") and angle["preferSameCol"] != null
	var prefer_col: int = int(angle.get("preferSameCol", -1)) if has_prefer else -1
	var prefer_val: String = _resolve_shard_cell(rows[row_idx] as Array, prefer_col, pool_cols_set, pool).to_lower() if has_prefer else ""

	var n: int = rows.size()
	var h: int = _fnv1a_32("DIST:%d:%d" % [qid, row_idx])
	var picked: Array[String] = []
	var seen: Dictionary = {ans.to_lower(): true}

	# Pass 1: preferSameCol window
	if has_prefer:
		var lo1: int = maxi(0, row_idx - radius * 3)
		var hi1: int = mini(n, row_idx + radius * 3 + 1)
		var sp1: int = maxi(1, hi1 - lo1)
		var st1: int = (h % 13) + 1
		if _int_gcd(st1, sp1) != 1:
			st1 = 1
		var start1: int = h % sp1
		for k: int in range(sp1):
			var ci: int = lo1 + (start1 + k * st1) % sp1
			if ci == row_idx:
				continue
			var crow: Array = rows[ci] as Array
			if has_avoid and _resolve_shard_cell(crow, avoid_col, pool_cols_set, pool).to_lower() == avoid_val:
				continue
			if _resolve_shard_cell(crow, prefer_col, pool_cols_set, pool).to_lower() != prefer_val:
				continue
			var cv: String = _resolve_shard_cell(crow, dcol, pool_cols_set, pool)
			var cl: String = cv.to_lower()
			if not seen.has(cl):
				seen[cl] = true
				picked.append(cv)
				if picked.size() >= 3:
					return picked

	# Pass 2: Local fame/era window
	var lo2: int = maxi(0, row_idx - radius)
	var hi2: int = mini(n, row_idx + radius + 1)
	var sp2: int = maxi(1, hi2 - lo2)
	var st2: int = (h % 7) + 1
	while _int_gcd(st2, sp2) != 1 and st2 < sp2:
		st2 += 1
	var start2: int = (h >> 5) % sp2
	for k2: int in range(sp2):
		var ci2: int = lo2 + (start2 + k2 * st2) % sp2
		if ci2 == row_idx:
			continue
		var crow2: Array = rows[ci2] as Array
		if has_avoid and _resolve_shard_cell(crow2, avoid_col, pool_cols_set, pool).to_lower() == avoid_val:
			continue
		var cv2: String = _resolve_shard_cell(crow2, dcol, pool_cols_set, pool)
		var cl2: String = cv2.to_lower()
		if not seen.has(cl2):
			seen[cl2] = true
			picked.append(cv2)
			if picked.size() >= 3:
				return picked

	# Pass 3: Full table deterministic scan fallback
	var start3: int = h % maxi(1, n)
	var st3: int = (h % 17) + 1
	while _int_gcd(st3, n) != 1 and st3 < n:
		st3 += 1
	for k3: int in range(n):
		var ci3: int = (start3 + k3 * st3) % n
		if ci3 == row_idx:
			continue
		var crow3: Array = rows[ci3] as Array
		if has_avoid and _resolve_shard_cell(crow3, avoid_col, pool_cols_set, pool).to_lower() == avoid_val:
			continue
		var cv3: String = _resolve_shard_cell(crow3, dcol, pool_cols_set, pool)
		var cl3: String = cv3.to_lower()
		if not seen.has(cl3):
			seen[cl3] = true
			picked.append(cv3)
			if picked.size() >= 3:
				return picked

	return picked


func _compute_shard_calibrator_bounds(exact_val_in: int, angle: Dictionary, qid: int) -> Dictionary:
	var exact_val: int = exact_val_in
	var step: int = int(angle.get("step", 1))
	var pad: int = int(angle.get("pad", 0))
	var min_clamp: int = int(angle.get("minClamp", -1000000))
	var max_clamp: int = int(angle.get("maxClamp", 1000000))

	if step <= 0:
		var av: float = absf(float(exact_val))
		step = 500
		var brackets: Variant = _shard_decoder_spec.get("adaptiveStepBrackets", [[30, 1], [100, 5], [300, 10], [1000, 25], [3000, 50], [10000, 100], [50000, 250]])
		if brackets is Array:
			for br: Variant in (brackets as Array):
				if br is Array and (br as Array).size() >= 2:
					if av <= float((br as Array)[0]):
						step = int((br as Array)[1])
						break

	if step > 1 and (exact_val % step) != 0:
		exact_val = int(round(float(exact_val) / float(step))) * step

	if pad <= 0:
		pad = maxi(step * 8, int(round(maxf(absf(float(exact_val)) * 0.55, float(step * 10)) / float(step))) * step)
	var span: int = int(round(float(maxi(step * 10, pad * 2)) / float(step))) * step

	var offsets: Array = _shard_decoder_spec.get("calibratorOffsets", [0.24, 0.34, 0.66, 0.76]) as Array
	var h: int = _fnv1a_32("CAL:%d" % qid)
	var off: float = float(offsets[h % maxi(1, offsets.size())])

	var min_grid: int = int(ceil(float(min_clamp) / float(step))) * step
	var max_grid: int = int(floor(float(max_clamp) / float(step))) * step
	if exact_val <= min_grid + step:
		min_grid = exact_val - step * 4
	if exact_val >= max_grid - step:
		max_grid = exact_val + step * 4

	var raw_min: int = int(round((float(exact_val) - float(span) * off) / float(step))) * step
	var min_val: int = maxi(min_grid, mini(raw_min, exact_val - step * 2))
	var max_val: int = min_val + span
	if max_val > max_grid:
		max_val = max_grid
		min_val = maxi(min_grid, max_val - span)
	if max_val <= exact_val + step:
		max_val = exact_val + step * 2
	if min_val >= exact_val - step:
		min_val = exact_val - step * 2

	var mid: float = float(min_val + max_val) * 0.5
	var cur_span: float = float(maxi(step * 4, max_val - min_val))
	if absf(float(exact_val) - mid) < cur_span * 0.14:
		var shift: int = int(ceil((cur_span * 0.22) / float(step))) * step
		if min_val - shift >= min_grid and (max_val - shift) >= exact_val + step * 2:
			min_val -= shift
			max_val -= shift
		elif max_val + shift <= max_grid and (min_val + shift) <= exact_val - step * 2:
			min_val += shift
			max_val += shift

	return {"exactVal": exact_val, "minVal": min_val, "maxVal": max_val, "step": step}


func run_shard_self_test() -> Dictionary:
	if not has_shard_manifest():
		return {"has_manifest": false, "total_playable": get_total_playable_count(), "decoded_ok": true}
	var decoded_count: int = 0
	var bad_count: int = 0
	for did: int in [0, 2, 11]:
		request_domain_shard(did, 0)
		if is_domain_shard_loaded(did):
			var chunks: Array = _loaded_shards[did] as Array
			var chunk: Dictionary = chunks[0] as Dictionary
			var tables: Array = chunk.get("t", []) as Array
			if not tables.is_empty():
				var tbl: Dictionary = tables[0] as Dictionary
				var spec: Dictionary = _shard_types.get(str(tbl.get("type", "")), {}) as Dictionary
				var angles: Array = spec.get("angles", []) as Array
				for ai: int in range(angles.size()):
					var q: Dictionary = decode_shard_question(chunk, 0, 0, ai)
					decoded_count += 1
					var p: String = str(q.get("prompt", ""))
					if p.is_empty() or p.contains("{") or str(q.get("answerCorrect", "")).is_empty():
						bad_count += 1
	return {
		"has_manifest": true,
		"total_playable": get_total_playable_count(),
		"shard_playable": _shard_total_playable,
		"decoded_count": decoded_count,
		"bad_count": bad_count,
		"decoded_ok": decoded_count > 0 and bad_count == 0,
	}
