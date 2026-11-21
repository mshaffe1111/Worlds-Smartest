class_name TriviaDatabase
extends Node
## 1M-ready Trivia Database with PackedByteArray bitset zero-repeat tracking,
## deterministic Daily UTC selection, and Tier/Overclock/Speed scoring.

const QUESTIONS_PATH: String = "res://data/questions.json"
const BITSET_SAVE_PATH: String = "user://meridian_seen_bitset.bin"
const BITSET_BYTES: int = 131072 # 1,048,576 unique QIDs in 128 KB RAM
const DAILY_SALT: String = "WS_MERIDIAN_DAILY_V1"
const BASE_POINTS: int = 1000
const MAX_SPEED_BONUS: int = 300

const DOMAIN_META: Array[Dictionary] = [
	{"id": 0, "key": "HISTORY", "name": "History", "accent": Color("#d4a853")},
	{"id": 1, "key": "SCIENCE", "name": "Science", "accent": Color("#48b8f0")},
	{"id": 2, "key": "GEOGRAPHY", "name": "Geography", "accent": Color("#38c793")},
	{"id": 3, "key": "ARTS", "name": "Arts & Culture", "accent": Color("#e6c78b")},
	{"id": 4, "key": "POP", "name": "Pop & Media", "accent": Color("#e85d99")},
	{"id": 5, "key": "SPORTS", "name": "Sports & Games", "accent": Color("#f08a3e")},
	{"id": 6, "key": "TECH", "name": "Tech & Eng", "accent": Color("#5ce1e6")},
	{"id": 7, "key": "NATURE", "name": "Nature & Bio", "accent": Color("#58d66b")},
	{"id": 8, "key": "SOCIETY", "name": "Society & Law", "accent": Color("#c8b89d")},
	{"id": 9, "key": "FOOD", "name": "Food & Craft", "accent": Color("#e08e5a")},
	{"id": 10, "key": "MYTH", "name": "Myth & Philosophy", "accent": Color("#8d7bf0")},
	{"id": 11, "key": "LOGIC", "name": "Logic & Math", "accent": Color("#f7df9c")},
]

const VENUES: Array[Dictionary] = [
	{
		"code": "ch",
		"region": "CH",
		"city": "Geneva",
		"venue_name": "The Meridian Rotunda",
		"relic_id": "meridian_astrolabe",
		"speaker_id": "vance",
		"accent": Color("#e8c474"),
		"rim": Color("#48b8f0"),
		"fog": Color("#090f1d"),
	},
	{
		"code": "gb",
		"region": "GB",
		"city": "London",
		"venue_name": "Royal Meridian Library",
		"relic_id": "armillary_orrery",
		"speaker_id": "nadia",
		"accent": Color("#d4a853"),
		"rim": Color("#7fa6d8"),
		"fog": Color("#0c1019"),
	},
	{
		"code": "jp",
		"region": "JP",
		"city": "Tokyo",
		"venue_name": "Kintsugi Sky Pavilion",
		"relic_id": "origami_prism",
		"speaker_id": "soren",
		"accent": Color("#f2c166"),
		"rim": Color("#e85d99"),
		"fog": Color("#0c0b18"),
	},
	{
		"code": "br",
		"region": "BR",
		"city": "Rio de Janeiro",
		"venue_name": "Niemeyer Glass Auditorium",
		"relic_id": "emerald_sphere",
		"speaker_id": "teo",
		"accent": Color("#38c793"),
		"rim": Color("#f0c869"),
		"fog": Color("#081617"),
	},
	{
		"code": "eg",
		"region": "EG",
		"city": "Cairo",
		"venue_name": "Grand Meridian Vault",
		"relic_id": "cipher_box",
		"speaker_id": "lindqvist",
		"accent": Color("#e2b35c"),
		"rim": Color("#5ce1e6"),
		"fog": Color("#14100b"),
	},
	{
		"code": "is",
		"region": "IS",
		"city": "Reykjavik",
		"venue_name": "Geothermal Basalt Caldera",
		"relic_id": "cryo_relay",
		"speaker_id": "tariq",
		"accent": Color("#5ce1e6"),
		"rim": Color("#38c793"),
		"fog": Color("#06131c"),
	},
	{
		"code": "sg",
		"region": "SG",
		"city": "Singapore",
		"venue_name": "Diplomatic Sky-Bridge Core",
		"relic_id": "council_seal",
		"speaker_id": "lindqvist",
		"accent": Color("#e8c474"),
		"rim": Color("#58d66b"),
		"fog": Color("#081415"),
	},
	{
		"code": "global",
		"region": "GLOBAL",
		"city": "International Waters",
		"venue_name": "The Apex Forum",
		"relic_id": "master_ledger",
		"speaker_id": "vance",
		"accent": Color("#f7df9c"),
		"rim": Color("#8d7bf0"),
		"fog": Color("#070a14"),
	},
]

var _questions: Array[Dictionary] = []
var _by_qid: Dictionary = {}
var _seen_bitset: PackedByteArray = PackedByteArray()
var _seen_count: int = 0
var loaded_from_json: bool = false


func _ready() -> void:
	_init_bitset()
	load_history()
	reload_database()


func _init_bitset() -> void:
	_seen_bitset.resize(BITSET_BYTES)
	_seen_bitset.fill(0)
	_seen_count = 0


func reload_database() -> void:
	_questions.clear()
	_by_qid.clear()
	loaded_from_json = false

	if FileAccess.file_exists(QUESTIONS_PATH):
		var file: FileAccess = FileAccess.open(QUESTIONS_PATH, FileAccess.READ)
		if file != null:
			var raw_text: String = file.get_as_text()
			file.close()
			var parsed: Variant = JSON.parse_string(raw_text)
			var raw_list: Array = []
			if parsed is Array:
				raw_list = parsed
			elif parsed is Dictionary and parsed.has("questions") and parsed["questions"] is Array:
				raw_list = parsed["questions"]

			for item: Variant in raw_list:
				if item is Dictionary and item.has("qid") and item.has("prompt"):
					_questions.append(item)
					_by_qid[int(item["qid"])] = item

			if _questions.size() > 0:
				loaded_from_json = true

	if _questions.is_empty():
		_load_starter_seed()


func get_question_count() -> int:
	return _questions.size()


func get_domain_meta(domain_id: int) -> Dictionary:
	if domain_id >= 0 and domain_id < DOMAIN_META.size():
		return DOMAIN_META[domain_id]
	return DOMAIN_META[0]


func get_venue_list() -> Array[Dictionary]:
	return VENUES


func get_venue_by_code(code: String) -> Dictionary:
	var lower: String = code.to_lower()
	for v: Dictionary in VENUES:
		if str(v["code"]) == lower:
			return v
	return VENUES[0]


func is_seen(qid: int) -> bool:
	if qid < 0:
		return false
	var byte_idx: int = qid >> 3
	if byte_idx >= _seen_bitset.size():
		return false
	var mask: int = 1 << (qid & 7)
	return (_seen_bitset[byte_idx] & mask) != 0


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


func get_seen_count() -> int:
	return _seen_count


func reset_history() -> void:
	_seen_bitset.fill(0)
	_seen_count = 0
	save_history()


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
		_recount_seen()


func _recount_seen() -> void:
	var total: int = 0
	for b: int in _seen_bitset:
		if b == 0:
			continue
		var v: int = b
		while v > 0:
			total += v & 1
			v >>= 1
	_seen_count = total


func get_daily_utc_key() -> String:
	var utc: Dictionary = Time.get_date_dict_from_system(true)
	return "%04d-%02d-%02d" % [int(utc["year"]), int(utc["month"]), int(utc["day"])]


func get_daily_seed_utc() -> int:
	return _fnv1a_32("%s:%s" % [DAILY_SALT, get_daily_utc_key()])


func select_daily_questions(count: int = 7) -> Array[Dictionary]:
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = get_daily_seed_utc()
	var pool: Array[Dictionary] = _questions.duplicate()
	_deterministic_shuffle(pool, rng)
	var chosen: Array[Dictionary] = []
	var used_domains: Dictionary = {}
	for q: Dictionary in pool:
		if chosen.size() >= count:
			break
		var dom: int = int(q.get("l0Domain", 0))
		if not used_domains.has(dom) or chosen.size() >= DOMAIN_META.size():
			chosen.append(q)
			used_domains[dom] = true
	for q: Dictionary in pool:
		if chosen.size() >= count:
			break
		if not chosen.has(q):
			chosen.append(q)
	return chosen


func select_match_questions(mode: String, venue_code: String = "ch", count: int = 6) -> Array[Dictionary]:
	if _questions.is_empty():
		return []
	var upper_mode: String = mode.to_upper()
	if upper_mode == "DAILY":
		return select_daily_questions(maxi(count, 7))

	var venue: Dictionary = get_venue_by_code(venue_code)
	var target_region: String = str(venue.get("region", "CH"))
	var target_relic: String = str(venue.get("relic_id", ""))

	var primary_unseen: Array[Dictionary] = []
	var secondary_unseen: Array[Dictionary] = []
	var fallback_seen: Array[Dictionary] = []
	var boss_question: Dictionary = {}

	for q: Dictionary in _questions:
		var qid: int = int(q.get("qid", 0))
		var seen: bool = is_seen(qid)
		var regions: Variant = q.get("regions", [])
		var in_region: bool = regions is Array and regions.has(target_region)
		var relic: String = str(q.get("heroRelicId", ""))
		if upper_mode == "CAMPAIGN" and not target_relic.is_empty() and relic == target_relic and boss_question.is_empty():
			boss_question = q
			continue

		if not seen:
			if upper_mode == "CAMPAIGN" and in_region:
				primary_unseen.append(q)
			elif upper_mode == "TRIALS" and float(q.get("irtB", 0.0)) >= 0.8:
				primary_unseen.append(q)
			else:
				secondary_unseen.append(q)
		else:
			fallback_seen.append(q)

	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.randomize()
	_deterministic_shuffle(primary_unseen, rng)
	_deterministic_shuffle(secondary_unseen, rng)
	_deterministic_shuffle(fallback_seen, rng)

	if upper_mode == "ENDLESS":
		secondary_unseen.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
			return float(a.get("irtB", 0.0)) < float(b.get("irtB", 0.0))
		)

	var target_slots: int = count - (1 if not boss_question.is_empty() else 0)
	var selected: Array[Dictionary] = []
	for bucket: Array[Dictionary] in [primary_unseen, secondary_unseen, fallback_seen]:
		for q: Dictionary in bucket:
			if selected.size() >= target_slots:
				break
			selected.append(q)
		if selected.size() >= target_slots:
			break

	if not boss_question.is_empty():
		selected.append(boss_question)
	return selected


func get_answer_facets(q: Dictionary) -> Array[Dictionary]:
	## Normalizes ANY question archetype into 4 tactile 3D Prism facets.
	var archetype: String = str(q.get("archetype", "SIGHTLINE_LOCK"))
	var facets: Array[Dictionary] = []

	if archetype == "GAUNTLET_SHATTER" and q.has("gauntletExt") and q["gauntletExt"] is Dictionary:
		var g: Dictionary = q["gauntletExt"]
		var is_true: bool = bool(g.get("isTrue", true))
		var is_trick: bool = bool(g.get("isTrick", false))
		facets = [
			{"text": "VERIFIED TRUE", "is_correct": is_true and not is_trick, "plausibility": 0.9},
			{"text": "MYTH / FALSE", "is_correct": (not is_true) and not is_trick, "plausibility": 0.9},
			{"text": "CHALLENGE! (TRICK)", "is_correct": is_trick, "plausibility": 0.75},
			{"text": "REDACTED / SKIP", "is_correct": false, "plausibility": 0.25},
		]
	elif archetype == "CALIBRATOR_DIAL" and q.has("calibratorExt") and q["calibratorExt"] is Dictionary:
		var cal: Dictionary = q["calibratorExt"]
		var exact_val: float = float(cal.get("exactVal", 0.0))
		var min_val: float = float(cal.get("minVal", 0.0))
		var max_val: float = float(cal.get("maxVal", 100.0))
		var unit: String = str(cal.get("unit", ""))
		var span: float = maxf(1.0, max_val - min_val)
		var correct_str: String = _format_calibrator(exact_val, unit)
		facets.append({"text": correct_str, "is_correct": true, "plausibility": 1.0})
		var offsets: Array[float] = [-0.22, 0.19, 0.36]
		for off: float in offsets:
			var decoy_val: float = clampf(exact_val + span * off, min_val, max_val)
			if is_equal_approx(decoy_val, exact_val):
				decoy_val = exact_val + span * 0.14
			facets.append({
				"text": _format_calibrator(decoy_val, unit),
				"is_correct": false,
				"plausibility": 0.8 - absf(off),
			})
	elif archetype == "CODEX_DUAL_RING" and q.has("codexExt") and q["codexExt"] is Dictionary:
		var codex: Dictionary = q["codexExt"]
		var pairs: Variant = codex.get("pairs", [])
		var decoy_target: String = str(codex.get("decoyTarget", "Decoy Cipher"))
		if pairs is Array and pairs.size() >= 1 and pairs[0] is Dictionary:
			var p0: Dictionary = pairs[0]
			facets.append({
				"text": "%s -> %s" % [str(p0.get("subject", "A")), str(p0.get("target", "B"))],
				"is_correct": true,
				"plausibility": 1.0,
			})
			for idx: int in range(1, mini(pairs.size(), 3)):
				if pairs[idx] is Dictionary:
					var px: Dictionary = pairs[idx]
					facets.append({
						"text": "%s -> %s" % [str(p0.get("subject", "A")), str(px.get("target", "C"))],
						"is_correct": false,
						"plausibility": 0.82,
					})
			facets.append({
				"text": "%s -> %s" % [str(p0.get("subject", "A")), decoy_target],
				"is_correct": false,
				"plausibility": 0.65,
			})

	if facets.is_empty():
		var correct_text: String = str(q.get("answerCorrect", "Meridian"))
		facets.append({"text": correct_text, "is_correct": true, "plausibility": 1.0})
		var distractors: Variant = q.get("distractors", [])
		if distractors is Array:
			for d: Variant in distractors:
				if facets.size() >= 4:
					break
				if d is Dictionary:
					facets.append({
						"text": str(d.get("text", "Unknown")),
						"is_correct": false,
						"plausibility": float(d.get("plausibility", 0.5)),
					})
				elif d is String:
					facets.append({"text": d, "is_correct": false, "plausibility": 0.5})

	while facets.size() < 4:
		facets.append({"text": "Classified #%d" % (facets.size() + 1), "is_correct": false, "plausibility": 0.2})

	# Deterministic per-QID facet permutation so the answer is evenly spread across all 4 prism faces.
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = _fnv1a_32("FACET:%d:%d" % [int(q.get("qid", 1)), int(Time.get_unix_time_from_system() / 60.0)])
	_deterministic_shuffle(facets, rng)
	return facets


func evaluate_answer(
	q: Dictionary,
	selected_facet: Dictionary,
	peel_tier: int,
	overclocked: bool,
	overclock_charge: float,
	elapsed_sec: float,
	time_limit_sec: float = 20.0
) -> Dictionary:
	var qid: int = int(q.get("qid", 0))
	mark_seen(qid)
	save_history()

	var correct: bool = bool(selected_facet.get("is_correct", false))
	var tier_mult: float = 3.0 if peel_tier <= 1 else (2.0 if peel_tier == 2 else 1.2)
	var oc_mult: float = 1.0 + clampf(overclock_charge, 0.0, 1.0) if overclocked else 1.0
	var elapsed_ratio: float = clampf(elapsed_sec / maxf(1.0, time_limit_sec), 0.0, 1.0)
	var speed_bonus: int = int(round((1.0 - elapsed_ratio) * float(MAX_SPEED_BONUS))) if correct else 0
	var backfired: bool = (not correct) and overclocked

	var total_points: int = 0
	if correct:
		total_points = int(round(float(BASE_POINTS) * tier_mult * oc_mult)) + speed_bonus
	elif backfired:
		total_points = -450

	var correct_display: String = str(q.get("answerCorrect", ""))
	if correct_display.is_empty() and q.has("gauntletExt") and q["gauntletExt"] is Dictionary:
		var g: Dictionary = q["gauntletExt"]
		correct_display = "CHALLENGE!" if bool(g.get("isTrick", false)) else ("TRUE" if bool(g.get("isTrue", true)) else "FALSE")

	return {
		"qid": qid,
		"correct": correct,
		"backfired": backfired,
		"tier_multiplier": tier_mult,
		"overclock_multiplier": snappedf(oc_mult, 0.01),
		"speed_bonus": speed_bonus,
		"total_points": total_points,
		"correct_answer": correct_display,
		"why": str(q.get("whyExplanation", "Verified in the Meridian Global Archive.")),
	}


func _format_calibrator(val: float, unit: String) -> String:
	var rounded: String = str(int(round(val))) if absf(val) >= 10.0 else ("%.1f" % val)
	return ("%s %s" % [rounded, unit]).strip_edges()


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


func _load_starter_seed() -> void:
	var seed_list: Array[Dictionary] = [
		{
			"qid": 1, "l0Domain": 8, "l1Category": "Diplomacy", "regions": ["CH", "GLOBAL"],
			"irtB": -0.6, "archetype": "SIGHTLINE_LOCK", "heroRelicId": "meridian_astrolabe",
			"prompt": "Founded in Geneva in 1863, which humanitarian organization reversed the Swiss flag's colors for its emblem?",
			"answerCorrect": "Red Cross",
			"distractors": [
				{"text": "Doctors Without Borders", "plausibility": 0.82},
				{"text": "Amnesty International", "plausibility": 0.62},
				{"text": "World Health Org.", "plausibility": 0.74},
			],
			"clues": [
				"Henry Dunant co-founded it after witnessing the 1859 Battle of Solferino.",
				"Its emblem swaps white-on-crimson into a crimson cross on white.",
			],
			"whyExplanation": "The International Committee of the Red Cross inverted the Swiss flag to honor Switzerland and denote neutrality.",
		},
		{
			"qid": 2, "l0Domain": 6, "l1Category": "Computing History", "regions": ["CH", "GLOBAL"],
			"irtB": 0.4, "archetype": "SIGHTLINE_LOCK",
			"prompt": "At CERN in Geneva in 1989, Tim Berners-Lee drafted the proposal for what global information system?",
			"answerCorrect": "World Wide Web",
			"distractors": [
				{"text": "ARPANET", "plausibility": 0.86},
				{"text": "TCP/IP Suite", "plausibility": 0.76},
				{"text": "Usenet Network", "plausibility": 0.62},
			],
			"clues": [
				"It combined hypertext with the Internet using HTTP, HTML, and URLs.",
				"Its first live webpage explained how to build websites at CERN.",
			],
			"whyExplanation": "Tim Berners-Lee invented the World Wide Web at CERN in 1989 and placed its core protocols into the public domain.",
		},
		{
			"qid": 3, "l0Domain": 1, "l1Category": "Astronomy & Time", "regions": ["GB", "GLOBAL"],
			"irtB": 0.1, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "armillary_orrery",
			"prompt": "Which London observatory established the zero-degree Prime Meridian adopted worldwide in 1884?",
			"answerCorrect": "Royal Observatory Greenwich",
			"distractors": [
				{"text": "Kew Observatory", "plausibility": 0.78},
				{"text": "Jodrell Bank", "plausibility": 0.66},
				{"text": "Radcliffe Observatory", "plausibility": 0.58},
			],
			"clues": [
				"Its brass meridian strip still divides Eastern and Western hemispheres.",
				"It sits atop a hill overlooking the Thames in southeast London.",
			],
			"whyExplanation": "The 1884 International Meridian Conference selected Greenwich's Airy Transit Circle as 0 degrees longitude.",
		},
		{
			"qid": 4, "l0Domain": 3, "l1Category": "Japanese Craft", "regions": ["JP", "GLOBAL"],
			"irtB": 0.3, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "origami_prism",
			"prompt": "What traditional Japanese art repairs broken pottery with lacquer dusted in powdered gold?",
			"answerCorrect": "Kintsugi",
			"distractors": [
				{"text": "Ukiyo-e", "plausibility": 0.72},
				{"text": "Ikebana", "plausibility": 0.68},
				{"text": "Raku-yaki", "plausibility": 0.84},
			],
			"clues": [
				"Its name translates literally as 'golden joinery'.",
				"It treats fracture and repair as part of an object's honored history.",
			],
			"whyExplanation": "Kintsugi ('golden joinery') highlights cracks with urushi lacquer and gold powder rather than disguising damage.",
		},
		{
			"qid": 5, "l0Domain": 3, "l1Category": "Modernist Architecture", "regions": ["BR", "GLOBAL"],
			"irtB": 0.5, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "emerald_sphere",
			"prompt": "Which Brazilian Pritzker-winning architect sculpted the sweeping curved concrete monuments of Brasilia?",
			"answerCorrect": "Oscar Niemeyer",
			"distractors": [
				{"text": "Lina Bo Bardi", "plausibility": 0.80},
				{"text": "Paulo Mendes da Rocha", "plausibility": 0.74},
				{"text": "Le Corbusier", "plausibility": 0.78},
			],
			"clues": [
				"He famously rejected rigid right angles in favor of free-flowing curves.",
				"He also designed Rio's flying-saucer Niteroi Contemporary Art Museum.",
			],
			"whyExplanation": "Oscar Niemeyer designed Brasilia's iconic civic landmarks alongside urban planner Lucio Costa in the late 1950s.",
		},
		{
			"qid": 6, "l0Domain": 0, "l1Category": "Epigraphy", "regions": ["EG", "GLOBAL"],
			"irtB": 0.0, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "cipher_box",
			"prompt": "Which 196 BCE granodiorite stele unlocked Egyptian hieroglyphs through three parallel scripts?",
			"answerCorrect": "Rosetta Stone",
			"distractors": [
				{"text": "Behistun Inscription", "plausibility": 0.82},
				{"text": "Palermo Stone", "plausibility": 0.76},
				{"text": "Narmer Palette", "plausibility": 0.64},
			],
			"clues": [
				"It carried a Ptolemaic decree in hieroglyphs, Demotic, and Ancient Greek.",
				"Jean-Francois Champollion cracked its royal cartouches in 1822.",
			],
			"whyExplanation": "Found near Rashid (Rosetta) in 1799, the trilingual Rosetta Stone enabled Champollion to decipher hieroglyphs.",
		},
		{
			"qid": 7, "l0Domain": 2, "l1Category": "Geology & Energy", "regions": ["IS", "GLOBAL"],
			"irtB": 0.4, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "cryo_relay",
			"prompt": "Iceland straddles the divergent rift boundary between the North American and which other tectonic plate?",
			"answerCorrect": "Eurasian Plate",
			"distractors": [
				{"text": "Arctic Microplate", "plausibility": 0.78},
				{"text": "Nordic Shield Plate", "plausibility": 0.72},
				{"text": "Celtic Plate", "plausibility": 0.55},
			],
			"clues": [
				"This Mid-Atlantic Ridge boundary runs straight through Thingvellir National Park.",
				"The plate encompasses nearly all of Europe and mainland Asia.",
			],
			"whyExplanation": "Iceland sits atop the Mid-Atlantic Ridge where the North American and Eurasian plates drift apart ~2.5 cm per year.",
		},
		{
			"qid": 8, "l0Domain": 2, "l1Category": "Maritime Trade", "regions": ["SG", "GLOBAL"],
			"irtB": 0.3, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "council_seal",
			"prompt": "Singapore commands global container shipping at the southern entrance of which vital maritime strait?",
			"answerCorrect": "Strait of Malacca",
			"distractors": [
				{"text": "Sunda Strait", "plausibility": 0.82},
				{"text": "Strait of Hormuz", "plausibility": 0.65},
				{"text": "Lombok Strait", "plausibility": 0.74},
			],
			"clues": [
				"It separates the Malay Peninsula from the Indonesian island of Sumatra.",
				"Roughly a quarter of all seaborne global trade transits this corridor.",
			],
			"whyExplanation": "The Strait of Malacca links the Indian Ocean to the South China Sea, making Singapore a premier maritime hub.",
		},
		{
			"qid": 9, "l0Domain": 11, "l1Category": "Cryptography", "regions": ["GLOBAL"],
			"irtB": 0.9, "archetype": "HERO_ARTIFACT_SYNTHESIS", "heroRelicId": "master_ledger",
			"prompt": "In public-key cryptography, RSA security relies primarily on the computational difficulty of what problem?",
			"answerCorrect": "Prime Factorization",
			"distractors": [
				{"text": "Graph Coloring", "plausibility": 0.72},
				{"text": "Knapsack Packing", "plausibility": 0.78},
				{"text": "Matrix Inversion", "plausibility": 0.64},
			],
			"clues": [
				"Multiplying two massive primes is trivial; reversing the product is not.",
				"Shor's quantum algorithm threatens this specific number-theory barrier.",
			],
			"whyExplanation": "RSA derives its trapdoor security from the infeasibility of factoring the product of two huge prime numbers classically.",
		},
		{
			"qid": 10, "l0Domain": 7, "l1Category": "Marine Biology", "regions": ["GLOBAL"],
			"irtB": 0.2, "archetype": "SIGHTLINE_LOCK",
			"prompt": "Which deep-sea cephalopod possesses three hearts, blue copper-based blood, and decentralized arm neurons?",
			"answerCorrect": "Octopus",
			"distractors": [
				{"text": "Chambered Nautilus", "plausibility": 0.76},
				{"text": "Horseshoe Crab", "plausibility": 0.70},
				{"text": "Giant Isopod", "plausibility": 0.54},
			],
			"clues": [
				"Two branchial hearts pump blood across its gills while one serves the body.",
				"Roughly two-thirds of its neurons reside inside its eight flexible arms.",
			],
			"whyExplanation": "Octopuses circulate oxygen with copper-rich hemocyanin (blue blood) powered by three hearts and distributed arm ganglia.",
		},
	]
	for item: Dictionary in seed_list:
		_questions.append(item)
		_by_qid[int(item["qid"])] = item
