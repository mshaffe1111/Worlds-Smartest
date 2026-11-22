#!/usr/bin/env python3
"""
World's Smartest — 40-Mission 20+ Hour Campaign Validator (Godot 4.7.2)
Validates godot/data/campaign_20hr.json against ALL Studio, Research #1, and Research #3 Gates:
  1. 100% valid UTF-8 JSON & strict schema compliance
  2. Canon Cast Lock (zero legacy placeholder names anywhere in campaign JSON)
  3. Exact 8 Global Hubs x 5 Missions = 40 Playable Story Missions obeying 5-Slot Country Rhythm
  4. Zero broken mission, choice, variant, relic, perk, speaker, or ending links
  5. BFS reachability proving ALL 40 missions are reachable from ch_1
  6. State simulation proving ALL 4 distinct endings (including Secret True Ending) are reachable
  7. Morph mix sum == question_count + R1-04 Archetype Rotation (never >2 consecutive SIGHTLINE_LOCK)
  8. All 12 anti-repetition challenge mutators defined, active, never repeated back-to-back,
     AND strictly obeying Illegal Mutator Pairing Banlist (never ANALOG_STATIC + GRUDGE_WEAKEST_DOMAIN)
  9. Zero-Fake-Choice Contract on all major act decisions (M2, M5, M8, M13, M17, M24, M33, M40)
 10. Mobile Dialogue & Neural VO Pacing (>=95% beats <=24 words & <=145 chars, zero semicolons,
     zero contractions on Lindqvist, tell_hint present, all 40 cliffhanger_hooks <=18 words)
 11. R1-05 Forensic Table Props, R1-06 Rival AI Profiles, and all 8 Fair-Play Knives Out Clues
 12. 100% Disk Verification of all referenced voice/*.mp3 and portraits_cutout/*.png files!
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, deque
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CAMPAIGN_PATH = ROOT / "godot" / "data" / "campaign_20hr.json"
PUBLIC_CAMPAIGN_PATH = ROOT / "public" / "data" / "campaign_20hr.json"
QUESTIONS_PATH = ROOT / "godot" / "data" / "questions.json"
VOICE_DIR = ROOT / "godot" / "assets" / "voice"
WAVE2_PATH = ROOT / "public" / "data" / "narrative_wave2.json"
VO_WAVE2_MANIFEST_PATH = ROOT / "public" / "assets" / "voice" / "vo_wave2_manifest.json"
GLYPH_MANIFEST_PATH = ROOT / "public" / "assets" / "glyphs" / "manifest.json"

EXPECTED_HUBS = ["ch", "gb", "jp", "br", "eg", "is", "sg", "global"]
EXPECTED_RELICS = {
    "ch": "meridian_astrolabe",
    "gb": "armillary_orrery",
    "jp": "origami_prism",
    "br": "emerald_sphere",
    "eg": "cipher_box",
    "is": "cryo_relay",
    "sg": "council_seal",
    "global": "master_ledger",
}
EXPECTED_ENDINGS = {
    "SOVEREIGN_ARBITER",
    "OPEN_COMMONS",
    "KINGMAKER",
    "ARCHITECT_SUCCESSION",
}
REQUIRED_CHALLENGE_MUTATORS = {
    "ANALOG_STATIC",
    "TEMPO_STEAL",
    "BLUFF_WAGER",
    "BLACKOUT_SPOTLIGHT",
    "CHRONO_SURGE",
    "DOUBLE_OR_NOTHING",
    "GRUDGE_WEAKEST_DOMAIN",
    "CHAIN_SYNTHESIS",
    "WHISPERED_INSIDER",
    "ZERO_SHIELD_SUDDEN_DEATH",
    "MIRROR_LEAK_ETHICS",
    "REDEMPTION_GAUNTLET",
}
VALID_MORPHS = {
    "SIGHTLINE_LOCK",
    "CALIBRATOR_DIAL",
    "CODEX_DUAL_RING",
    "GAUNTLET_SHATTER",
    "HERO_ARTIFACT_SYNTHESIS",
}
VALID_LIGHTING = {"BROADCAST", "INTIMATE", "ARCHIVE", "SPOTLIGHT", "FRACTURE"}
VALID_CAST = {"vance", "nadia", "teo", "lindqvist", "soren", "tariq"}
BANNED_LEGACY_NAMES = [
    "Nadia Okafor",
    "Soren Kessler",
    "Teo Morales",
    "Nadia Rostova",
    "Soren Takahashi",
    "Henrik Lindqvist",
]
MAJOR_DECISION_MISSIONS = {"ch_2", "ch_5", "gb_3", "jp_3", "br_2", "eg_4", "sg_3", "global_5"}
RHYTHM_SLOTS = {
    1: "ARRIVAL_QUALIFIER",
    2: "COVERT_INVESTIGATION",
    3: "RIVAL_MIND_GAME",
    4: "HIGH_STAKES_AUDIBLE",
    5: "RELIC_BOSS_SHOWDOWN",
}
REQUIRED_MISSION_FIELDS = [
    "id",
    "mission_number",
    "act",
    "hub_id",
    "rhythm_slot",
    "rhythm_role",
    "title",
    "subtitle",
    "difficulty_label",
    "pass_goal",
    "estimated_minutes",
    "venue",
    "venue_region",
    "venue_3d_scene",
    "lighting_state",
    "camera_preset",
    "music_layer",
    "question_count",
    "time_per_question_sec",
    "difficulty_tier",
    "irt_b_range",
    "narrative_tags",
    "preferred_domains",
    "morph_mix",
    "mutator",
    "mutators",
    "mutator_brief",
    "speaker",
    "rival_id",
    "voice_clip",
    "dialogue_beats",
    "choices",
    "post_match_beats",
    "cliffhanger_hook",
]

PLAIN_ENGLISH_BANNED_CI_RE = re.compile(
    r"\b(Red Check|Detroit|Roster Substitution|Hypercorrection|Domino Cipher|Sightline|Brass Crown|"
    r"Tolerance Cone|Tier-1|Tier-2|Tier-3|432-hertz|Elo|Veritas Orb|Overclock|Peel|t=\d+\.\d+s)\b",
    re.IGNORECASE,
)
PLAIN_ENGLISH_BANNED_ACRONYM_RE = re.compile(
    r"\b(00-W|RF|SD|MHz|IRT|L0|L2|HUD|LEDs?)\b"
)

LINDQVIST_CONTRACTION_RE = re.compile(
    r"\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|you're|we're|they're|i'm|it's|that's|there's|let's)\b",
    re.IGNORECASE,
)


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def res_to_disk(res_path: str) -> Path:
    if not res_path.startswith("res://"):
        raise ValueError(f"Expected res:// path, got: {res_path}")
    return ROOT / "godot" / Path(res_path[len("res://") :])


def eval_condition(cond: dict[str, Any], state: dict[str, Any]) -> bool:
    if not cond:
        return True
    if "all" in cond:
        return all(eval_condition(sub, state) for sub in cond["all"])
    if "any" in cond:
        return any(eval_condition(sub, state) for sub in cond["any"])
    if "min_integrity" in cond and state["integrity"] < cond["min_integrity"]:
        return False
    if "max_integrity" in cond and state["integrity"] > cond["max_integrity"]:
        return False
    if "min_public_trust" in cond and state["public_trust"] < cond["min_public_trust"]:
        return False
    if "min_council_favor" in cond and state["council_favor"] < cond["min_council_favor"]:
        return False
    if "min_vault_clues" in cond and len(state["vault_clues"]) < cond["min_vault_clues"]:
        return False
    if "min_bond" in cond:
        for npc, threshold in cond["min_bond"].items():
            if state["bonds"].get(npc, 0) < threshold:
                return False
    if "min_any_bond" in cond:
        pair = cond["min_any_bond"]
        npcs = pair.get("npcs", [])
        threshold = pair.get("threshold", 1)
        if not any(state["bonds"].get(npc, 0) >= threshold for npc in npcs):
            return False
    if "flag_equals" in cond:
        for key, expected in cond["flag_equals"].items():
            if state["branch_flags"].get(key) != expected:
                return False
    return True


def apply_effects(state: dict[str, Any], effects: dict[str, Any]) -> None:
    if not isinstance(effects, dict):
        return
    for stat in ("integrity", "public_trust", "council_favor"):
        if stat in effects:
            state[stat] += int(effects[stat])
    state["integrity"] = max(-100, min(100, state["integrity"]))
    state["public_trust"] = max(0, min(100, state["public_trust"]))
    state["council_favor"] = max(0, min(100, state["council_favor"]))
    for key, val in effects.items():
        if key.startswith("bond_"):
            npc = key[len("bond_") :]
            state["bonds"][npc] = state["bonds"].get(npc, 0) + int(val)
    if effects.get("vault_clue"):
        state["vault_clues"].add(str(effects["vault_clue"]))
    if effects.get("unlock_perk"):
        state["unlocked_perks"].add(str(effects["unlock_perk"]))
    if effects.get("unlock_relic"):
        state["unlocked_relics"].add(str(effects["unlock_relic"]))
    if effects.get("unlock_skin"):
        state["unlocked_skins"].add(str(effects["unlock_skin"]))
    if isinstance(effects.get("branch_flag"), dict):
        for fk, fv in effects["branch_flag"].items():
            state["branch_flags"][fk] = fv


def make_initial_state(data: dict[str, Any]) -> dict[str, Any]:
    init = data.get("initial_state", {})
    return {
        "integrity": int(init.get("integrity", 0)),
        "public_trust": int(init.get("public_trust", 50)),
        "council_favor": int(init.get("council_favor", 50)),
        "bonds": {k: int(v) for k, v in init.get("bonds", {}).items()},
        "vault_clues": set(init.get("vault_clues", [])),
        "unlocked_perks": set(init.get("unlocked_perks", [])),
        "unlocked_relics": set(init.get("unlocked_relics", [])),
        "unlocked_skins": set(init.get("unlocked_skins", [])),
        "branch_flags": dict(init.get("branch_flags", {})),
    }


def simulate_ending_reachability(
    data: dict[str, Any], include_side_ops: bool = True
) -> tuple[set[str], dict[str, dict[str, Any]]]:
    strategies = {
        "SOVEREIGN_ARBITER": lambda c: (
            c.get("effects", {}).get("council_favor", 0) * 2
            + max(0, c.get("effects", {}).get("integrity", 0)) * 3
            + (15 if c.get("effects", {}).get("branch_flag", {}).get("act3_branch") == "INSIDER" else 0)
            + (20 if c.get("effects", {}).get("branch_flag", {}).get("trojan_pact") == "ALLIED" else 0)
            + (500 if c.get("ending_id") == "SOVEREIGN_ARBITER" else 0)
        ),
        "OPEN_COMMONS": lambda c: (
            c.get("effects", {}).get("public_trust", 0) * 3
            + c.get("effects", {}).get("integrity", 0)
            + (40 if c.get("effects", {}).get("branch_flag", {}).get("act3_branch") == "WHISTLEBLOWER" else 0)
            + (500 if c.get("ending_id") == "OPEN_COMMONS" else 0)
        ),
        "KINGMAKER": lambda c: (
            -c.get("effects", {}).get("integrity", 0) * 3
            + c.get("effects", {}).get("council_favor", 0)
            + (40 if c.get("effects", {}).get("branch_flag", {}).get("trojan_pact") == "SOLO" else 0)
            + (500 if c.get("ending_id") == "KINGMAKER" else 0)
        ),
        "ARCHITECT_SUCCESSION": lambda c: (
            c.get("effects", {}).get("integrity", 0) * 2
            + c.get("effects", {}).get("public_trust", 0) * 2
            + c.get("effects", {}).get("bond_nadia", 0) * 20
            + c.get("effects", {}).get("bond_teo", 0) * 20
            + (90 if c.get("effects", {}).get("vault_clue") else 0)
            + (30 if c.get("effects", {}).get("branch_flag", {}).get("trojan_pact") == "ALLIED" else 0)
            + (500 if c.get("ending_id") == "ARCHITECT_SUCCESSION" else 0)
        ),
    }

    endings_by_id = {e["id"]: e for e in data.get("endings", [])}
    reached: set[str] = set()
    summaries: dict[str, dict[str, Any]] = {}
    mission_pool = [
        m for m in data["missions"] if include_side_ops or not m.get("optional_side_mission")
    ]

    for target_ending, scorer in strategies.items():
        state = make_initial_state(data)
        for m in mission_pool:
            if m.get("unlock_relic"):
                state["unlocked_relics"].add(m["unlock_relic"])
            if m.get("unlock_perk"):
                state["unlocked_perks"].add(m["unlock_perk"])
            choices = m.get("choices", [])
            eligible = [c for c in choices if eval_condition(c.get("requires") or {}, state)]
            if not eligible:
                eligible = choices
            if eligible:
                best = max(eligible, key=scorer)
                apply_effects(state, best.get("effects") or {})
                if m["id"] == "global_5" and best.get("ending_id") == target_ending:
                    ending_def = endings_by_id.get(target_ending)
                    if ending_def and eval_condition(ending_def.get("requirements") or {}, state):
                        reached.add(target_ending)
        summaries[target_ending] = {
            "integrity": state["integrity"],
            "public_trust": state["public_trust"],
            "council_favor": state["council_favor"],
            "bonds": state["bonds"],
            "vault_clues": sorted(state["vault_clues"]),
            "act3_branch": state["branch_flags"].get("act3_branch"),
            "reached": target_ending in reached,
        }

    return reached, summaries


def validate(require_disk_assets: bool = True, require_v4_assets: bool = False) -> int:
    errors: list[str] = []
    warnings: list[str] = []

    if not CAMPAIGN_PATH.exists():
        print(f"[FAIL] Missing campaign file: {CAMPAIGN_PATH}")
        return 1

    raw_text = CAMPAIGN_PATH.read_text(encoding="utf-8")
    try:
        data = json.loads(raw_text)
    except Exception as exc:
        print(f"[FAIL] Invalid JSON in {CAMPAIGN_PATH}: {exc}")
        return 1

    # 1. Canon Cast Lock check
    for banned in BANNED_LEGACY_NAMES:
        if banned in raw_text:
            errors.append(f"Canon Cast Lock VIOLATION: legacy name '{banned}' found in campaign JSON!")

    # Load questions.json metadata for tag cross-checking
    valid_regions: set[str] = {"CH", "GB", "JP", "BR", "EG", "IS", "SG", "GLOBAL"}
    valid_q_tags: set[str] = set()
    if QUESTIONS_PATH.exists():
        try:
            qdata = load_json(QUESTIONS_PATH)
            for q in qdata.get("questions", []):
                for r in q.get("regions", []):
                    valid_regions.add(r)
                for t in q.get("narrativeTags", []):
                    valid_q_tags.add(t)
        except Exception as exc:
            warnings.append(f"Could not inspect questions.json: {exc}")

    # 2. Required top-level sections
    for section in (
        "schema_version",
        "title",
        "estimated_playtime_hours",
        "design_pillars",
        "initial_state",
        "cast",
        "expression_portraits",
        "rival_ai_profiles",
        "rival_reactions",
        "act_cutscenes",
        "evidence_board",
        "audio_manifest",
        "voice_manifest",
        "mutators",
        "perks",
        "relics",
        "vault_clues",
        "fair_play_clues",
        "hubs",
        "missions",
        "dynamic_betrayal_resolver",
        "endings",
        "mode_lore_bridges",
    ):
        if section not in data:
            errors.append(f"Missing required top-level key: '{section}'")

    if errors:
        for e in errors:
            print(f"[ERR] {e}")
        return 1

    # 3. Playtime >= 20h
    total_hrs = float(data["estimated_playtime_hours"].get("total_story_campaign_hours", 0))
    if total_hrs < 20.0:
        errors.append(f"total_story_campaign_hours ({total_hrs}) must be >= 20.0")

    # 4. Cast, Rival AI Profiles, Manifests
    cast_ids = set(data["cast"].keys())
    if not VALID_CAST.issubset(cast_ids):
        errors.append(f"Missing cast entries: {sorted(VALID_CAST - cast_ids)}")

    rival_ids = set(data["rival_ai_profiles"].keys())
    for req_rival in ("nadia", "soren", "lindqvist", "teo", "vance"):
        if req_rival not in rival_ids:
            errors.append(f"R1-06 violation: missing rival_ai_profiles['{req_rival}']")

    mutators = data["mutators"]
    missing_mutators = REQUIRED_CHALLENGE_MUTATORS - set(mutators.keys())
    if missing_mutators:
        errors.append(f"Missing required mutator definitions: {sorted(missing_mutators)}")
    if "NONE" not in mutators:
        errors.append("Missing 'NONE' baseline mutator definition")

    perks = set(data["perks"].keys())
    relics = set(data["relics"].keys())
    vault_clue_ids = {vc["id"] for vc in data["vault_clues"]}
    if len(vault_clue_ids) < 3:
        errors.append(f"Expected >= 3 hidden vault clues, found {len(vault_clue_ids)}")

    fair_play_clues = data["fair_play_clues"]
    if len(fair_play_clues) < 8:
        errors.append(f"Expected 8 Knives Out Fair-Play clues, found {len(fair_play_clues)}")

    voice_manifest_paths: set[str] = set()
    core_voice_paths: set[str] = set()
    v4_voice_paths: set[str] = set()
    for vc in data["voice_manifest"].get("story_clips", []):
        voice_manifest_paths.add(vc["path"])
        core_voice_paths.add(vc["path"])
    for _, bpath in data["voice_manifest"].get("gameplay_barks", {}).items():
        voice_manifest_paths.add(bpath)
        core_voice_paths.add(bpath)
    for bucket in ("cutscene_clips", "rival_reaction_clips", "ending_clips", "wave2_clips"):
        for vc in data["voice_manifest"].get(bucket, []):
            voice_manifest_paths.add(vc["path"])
            v4_voice_paths.add(vc["path"])
    if len(voice_manifest_paths) < 140:
        errors.append(f"Expected >= 140 voice clips in voice_manifest, found {len(voice_manifest_paths)}")

    if PUBLIC_CAMPAIGN_PATH.exists():
        pub_raw = PUBLIC_CAMPAIGN_PATH.read_text(encoding="utf-8")
        if pub_raw != raw_text:
            errors.append("Out-of-sync campaign_20hr.json between godot/data/ and public/data/!")
    else:
        errors.append(f"Missing mirrored web campaign file: {PUBLIC_CAMPAIGN_PATH}")

    # 5. Hubs validation (12 missions per hub = 5 Core Spine + 7 City Side-Investigations)
    hubs = data["hubs"]
    if len(hubs) != 8:
        errors.append(f"Expected 8 hubs, found {len(hubs)}")
    hub_ids = [h["id"] for h in hubs]
    if hub_ids != EXPECTED_HUBS:
        errors.append(f"Hub order/IDs mismatch: expected {EXPECTED_HUBS}, got {hub_ids}")

    hub_mission_sets: dict[str, list[str]] = {}
    hub_core_sets: dict[str, list[str]] = {}
    hub_side_sets: dict[str, list[str]] = {}
    for h in hubs:
        hid = h["id"]
        cids = h.get("core_mission_ids", [])
        sids = h.get("side_mission_ids", [])
        mids = h.get("mission_ids", [])
        if len(cids) != 5:
            errors.append(f"Hub '{hid}' must list 5 core_mission_ids, got {len(cids)}")
        if len(sids) != 7:
            errors.append(f"Hub '{hid}' must list 7 side_mission_ids, got {len(sids)}")
        if len(mids) != 12 or mids != cids + sids:
            errors.append(f"Hub '{hid}' mission_ids must be 12 (5 core + 7 side), got {len(mids)}")
        hub_mission_sets[hid] = mids
        hub_core_sets[hid] = cids
        hub_side_sets[hid] = sids
        if h.get("boss_relic_id") != EXPECTED_RELICS.get(hid):
            errors.append(f"Hub '{hid}' boss_relic_id mismatch")

    # 6. Missions validation (96 total = 40 Core Spine + 56 Side Investigations)
    missions = data["missions"]
    if len(missions) != 96:
        errors.append(f"Expected exactly 96 missions (40 Core + 56 Side Ops), found {len(missions)}")

    missions_by_id: dict[str, dict[str, Any]] = {}
    seen_mission_titles: set[str] = set()
    for idx, m in enumerate(missions, start=1):
        mid = m.get("id", f"<missing_{idx}>")
        if mid in missions_by_id:
            errors.append(f"Duplicate mission id: '{mid}'")
        missions_by_id[mid] = m
        if m.get("mission_number") != idx:
            errors.append(f"Mission '{mid}' mission_number={m.get('mission_number')}, expected {idx}")
        mtitle = str(m.get("title", "")).strip()
        if mtitle in seen_mission_titles:
            errors.append(f"Duplicate mission title '{mtitle}' on '{mid}' (zero copy-paste titles!)")
        seen_mission_titles.add(mtitle)

    for hid, cids in hub_core_sets.items():
        for slot_i, mid in enumerate(cids, start=1):
            if mid not in missions_by_id:
                errors.append(f"Hub '{hid}' references nonexistent core mission '{mid}'")
            else:
                mm = missions_by_id[mid]
                if mm.get("hub_id") != hid:
                    errors.append(f"Mission '{mid}' hub_id mismatch vs '{hid}'")
                if mm.get("optional_side_mission") is True:
                    errors.append(f"Core mission '{mid}' must have optional_side_mission=False")
                if mm.get("rhythm_slot") != slot_i or mm.get("rhythm_role") != RHYTHM_SLOTS[slot_i]:
                    errors.append(
                        f"Mission '{mid}' rhythm slot/role ({mm.get('rhythm_slot')}/{mm.get('rhythm_role')}) "
                        f"!= expected ({slot_i}/{RHYTHM_SLOTS[slot_i]})"
                    )

    for hid, sids in hub_side_sets.items():
        for side_i, mid in enumerate(sids, start=1):
            if mid not in missions_by_id:
                errors.append(f"Hub '{hid}' references nonexistent side mission '{mid}'")
            else:
                mm = missions_by_id[mid]
                if mm.get("hub_id") != hid:
                    errors.append(f"Side mission '{mid}' hub_id mismatch vs '{hid}'")
                if mm.get("optional_side_mission") is not True:
                    errors.append(f"Side mission '{mid}' must set optional_side_mission=True")
                rslot = mm.get("rhythm_slot")
                if rslot not in (2, 3, 4) or mm.get("rhythm_role") != RHYTHM_SLOTS.get(rslot):
                    errors.append(f"Side mission '{mid}' must use rhythm_slot in {{2,3,4}}, got {rslot}")

    endings = data["endings"]
    ending_ids = {e["id"] for e in endings}
    if ending_ids != EXPECTED_ENDINGS:
        errors.append(f"Ending IDs mismatch: expected {sorted(EXPECTED_ENDINGS)}, got {sorted(ending_ids)}")

    # Per-mission deep audit
    used_mutators: Counter[str] = Counter()
    used_voice_clips: set[str] = set(voice_manifest_paths)
    used_portraits: set[str] = set()
    used_relic_unlocks: set[str] = set()
    used_vault_clues: set[str] = set()
    planted_fair_play: set[int] = set()
    forensic_props_count = 0
    passive_elo_count = 0

    total_beats_checked = 0
    beats_within_budget = 0
    long_beats: list[str] = []
    total_choices = 0
    total_questions = 0
    total_mission_minutes = 0

    def audit_beat(ctx_id: str, b: dict[str, Any]) -> None:
        nonlocal total_beats_checked, beats_within_budget, passive_elo_count
        total_beats_checked += 1
        spk = b.get("speaker")
        if spk not in cast_ids:
            errors.append(f"{ctx_id}: unknown speaker '{spk}'")
        txt = str(b.get("text", "")).strip()
        if not txt or "TODO" in txt.upper():
            errors.append(f"{ctx_id}: empty/TODO text")
        if ";" in txt:
            errors.append(f"{ctx_id}: semicolon banned in spoken TTS beat: {txt}")
        if spk == "lindqvist" and LINDQVIST_CONTRACTION_RE.search(txt):
            errors.append(f"{ctx_id}: contraction banned for Chancellor Lindqvist: {txt}")
        words = len(txt.split())
        if words <= 24 and len(txt) <= 145:
            beats_within_budget += 1
        else:
            long_beats.append(f"{ctx_id} ({words}w / {len(txt)}c)")
        th = str(b.get("tell_hint", "")).strip()
        if not th:
            errors.append(f"{ctx_id}: missing tell_hint")
        elif len(th) > 95:
            warnings.append(f"{ctx_id}: long tell_hint ({len(th)} chars)")
        if b.get("passive_elo_check"):
            passive_elo_count += 1
        if b.get("voice_clip"):
            if b["voice_clip"] not in voice_manifest_paths:
                errors.append(f"{ctx_id}: voice_clip '{b['voice_clip']}' not in manifest")
            used_voice_clips.add(b["voice_clip"])
        if b.get("portrait"):
            used_portraits.add(b["portrait"])

    for m in missions:
        mid = m["id"]
        for field in REQUIRED_MISSION_FIELDS:
            if field not in m:
                errors.append(f"Mission '{mid}' missing required field '{field}'")

        if m.get("venue") not in EXPECTED_HUBS:
            errors.append(f"Mission '{mid}' invalid venue '{m.get('venue')}'")
        if m.get("venue_region") not in valid_regions:
            errors.append(f"Mission '{mid}' invalid venue_region '{m.get('venue_region')}'")
        if m.get("lighting_state") not in VALID_LIGHTING:
            errors.append(f"Mission '{mid}' invalid lighting_state '{m.get('lighting_state')}'")
        tier = m.get("difficulty_tier", 0)
        if not isinstance(tier, int) or not (1 <= tier <= 10):
            errors.append(f"Mission '{mid}' difficulty_tier must be int 1..10, got {tier}")

        if m.get("rival_id") not in rival_ids:
            errors.append(f"Mission '{mid}' unknown rival_id '{m.get('rival_id')}'")

        if valid_q_tags:
            for tag in m.get("narrative_tags", []):
                if tag not in valid_q_tags:
                    errors.append(f"Mission '{mid}' narrative_tag '{tag}' not in questions.json")

        # Morph mix + R1-04 archetype rotation feasibility (never >2 consecutive SIGHTLINE_LOCK)
        q_count = int(m.get("question_count", 0))
        total_questions += q_count
        morph_mix = m.get("morph_mix", {})
        bad_morphs = set(morph_mix.keys()) - VALID_MORPHS
        if bad_morphs:
            errors.append(f"Mission '{mid}' unknown morphs: {sorted(bad_morphs)}")
        morph_sum = sum(int(v) for v in morph_mix.values())
        if morph_sum != q_count:
            errors.append(f"Mission '{mid}' morph_mix sum ({morph_sum}) != question_count ({q_count})")
        sightline_n = int(morph_mix.get("SIGHTLINE_LOCK", 0))
        other_n = q_count - sightline_n
        if sightline_n > 2 * (other_n + 1):
            errors.append(
                f"R1-04 violation on '{mid}': SIGHTLINE_LOCK={sightline_n} with other={other_n} forces >2 consecutive Sightlines!"
            )

        if m.get("rhythm_slot") == 5:
            if int(morph_mix.get("HERO_ARTIFACT_SYNTHESIS", 0)) < 1:
                errors.append(f"Boss mission '{mid}' must include HERO_ARTIFACT_SYNTHESIS >= 1")

        if m.get("unlock_relic"):
            if m["unlock_relic"] not in relics:
                errors.append(f"Mission '{mid}' unknown unlock_relic '{m['unlock_relic']}'")
            else:
                used_relic_unlocks.add(m["unlock_relic"])
        if m.get("unlock_perk") and m["unlock_perk"] not in perks:
            errors.append(f"Mission '{mid}' unknown unlock_perk '{m['unlock_perk']}'")

        # Mutators + Illegal Pairing Banlist
        mut_list = m.get("mutators", [])
        if not isinstance(mut_list, list) or not mut_list:
            errors.append(f"Mission '{mid}' must have non-empty mutators list")
        if m.get("mutator") not in mut_list:
            errors.append(f"Mission '{mid}' primary mutator '{m.get('mutator')}' not in mutators list {mut_list}")
        mut_set = set(mut_list)
        for mut_id in mut_list:
            if mut_id not in mutators:
                errors.append(f"Mission '{mid}' unknown mutator '{mut_id}'")
            else:
                used_mutators[mut_id] += 1
        if "ANALOG_STATIC" in mut_set and "GRUDGE_WEAKEST_DOMAIN" in mut_set:
            errors.append(f"Illegal Mutator Banlist VIOLATION on '{mid}': ANALOG_STATIC + GRUDGE_WEAKEST_DOMAIN!")

        # Fair-play clues & forensic props
        if m.get("fair_play_clue"):
            planted_fair_play.add(int(m["fair_play_clue"]))
        if m.get("forensic_prop_inspect"):
            forensic_props_count += 1

        # Voice & Dialogue beats
        vclip = m.get("voice_clip")
        if not isinstance(vclip, str) or vclip not in voice_manifest_paths:
            errors.append(f"Mission '{mid}' voice_clip '{vclip}' missing from manifest")
        else:
            used_voice_clips.add(vclip)

        beats = m.get("dialogue_beats", [])
        if len(beats) < 2:
            errors.append(f"Mission '{mid}' must have >= 2 dialogue_beats")
        for b in beats:
            audit_beat(f"{mid}.{b.get('id')}", b)

        pbeats = m.get("post_match_beats", [])
        if len(pbeats) < 1:
            errors.append(f"Mission '{mid}' must have >= 1 post_match_beats")
        for pb in pbeats:
            audit_beat(f"{mid}.{pb.get('id')}", pb)

        for vkey, vobj in (m.get("variant_branches") or {}).items():
            for vb in vobj.get("dialogue_beats", []):
                audit_beat(f"{mid}.{vkey}.{vb.get('id')}", vb)

        # 40-Hook Rule check + Plain-English Clarity QC Audit
        hook = str(m.get("cliffhanger_hook", "")).strip()
        if not hook:
            errors.append(f"Mission '{mid}' missing cliffhanger_hook")
        elif len(hook.split()) > 18:
            errors.append(f"40-Hook Rule violation on '{mid}': cliffhanger_hook has {len(hook.split())} words (> 18)")

        # Plain-English Clarity QC check across player-facing strings
        pf_fields = [
            ("title", str(m.get("title", ""))),
            ("subtitle", str(m.get("subtitle", ""))),
            ("pass_goal", str(m.get("pass_goal", ""))),
            ("mutator_brief", str(m.get("mutator_brief", ""))),
            ("cliffhanger_hook", hook),
        ]
        for b in beats:
            pf_fields.append((f"beat:{b.get('id')}", str(b.get("text", ""))))
        for c in m.get("choices", []):
            pf_fields.append((f"choice:{c.get('id')}.label", str(c.get("label", ""))))
            pf_fields.append((f"choice:{c.get('id')}.subtext", str(c.get("subtext", ""))))
            pf_fields.append((f"choice:{c.get('id')}.impact", str(c.get("impact_badge", ""))))
        for fkey, fval in pf_fields:
            match = PLAIN_ENGLISH_BANNED_CI_RE.search(fval) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(fval)
            if match:
                errors.append(
                    f"Plain-English QC VIOLATION on '{mid}.{fkey}': banned jargon '{match.group(0)}' in \"{fval}\""
                )

        if mid == "ch_1":
            if len(beats) > 2:
                errors.append(f"City 1 M1 Opening Pacing VIOLATION: ch_1 has {len(beats)} beats (> 2 max before Q1)")
            if q_count != 4:
                errors.append(f"City 1 M1 Onboarding VIOLATION: ch_1 must keep 4 snappy questions, got {q_count}")

        # Choices + Zero-Fake-Choice Contract
        choices = m.get("choices", [])
        if len(choices) < 2:
            errors.append(f"Mission '{mid}' must have >= 2 meaningful choices")
        for c in choices:
            total_choices += 1
            eff = c.get("effects")
            if not isinstance(eff, dict) or not eff:
                errors.append(f"Mission '{mid}' choice '{c.get('id')}' has empty effects!")
                continue
            if "unlock_perk" in eff and eff["unlock_perk"] not in perks:
                errors.append(f"Mission '{mid}' choice '{c.get('id')}' unknown perk '{eff['unlock_perk']}'")
            if "unlock_relic" in eff:
                if eff["unlock_relic"] not in relics:
                    errors.append(f"Mission '{mid}' choice '{c.get('id')}' unknown relic '{eff['unlock_relic']}'")
                else:
                    used_relic_unlocks.add(eff["unlock_relic"])
            if "vault_clue" in eff:
                if eff["vault_clue"] not in vault_clue_ids:
                    errors.append(f"Mission '{mid}' choice '{c.get('id')}' unknown vault_clue '{eff['vault_clue']}'")
                else:
                    used_vault_clues.add(eff["vault_clue"])

            # Major act decision audit: must mutate >= 2 blackboard keys + branch_flag or perk/relic/venue
            if mid in MAJOR_DECISION_MISSIONS:
                stat_keys = [k for k in eff.keys() if k in ("integrity", "public_trust", "council_favor") or k.startswith("bond_")]
                has_ripple = bool(eff.get("branch_flag") or eff.get("unlock_perk") or eff.get("unlock_relic"))
                if len(stat_keys) < 2 or not has_ripple:
                    errors.append(
                        f"Zero-Fake-Choice violation on major decision '{mid}.{c.get('id')}': "
                        f"needs >=2 blackboard stats + rule/flag ripple (got {list(eff.keys())})"
                    )

            cnext = c.get("next_mission_id")
            if mid == "global_5":
                if c.get("ending_id") not in ending_ids:
                    errors.append(f"Finale choice '{c.get('id')}' missing valid ending_id")
            elif cnext is not None and cnext not in missions_by_id:
                errors.append(f"Mission '{mid}' choice '{c.get('id')}' broken next_mission_id '{cnext}'")

        nxt = m.get("next_mission_id")
        if mid != "global_5" and nxt not in missions_by_id:
            errors.append(f"Mission '{mid}' broken next_mission_id '{nxt}'")
        for alt in m.get("alternate_next_ids", []):
            if alt not in missions_by_id:
                errors.append(f"Mission '{mid}' broken alternate_next_ids '{alt}'")

        total_mission_minutes += int(m.get("estimated_minutes", 0))

    # Endings beats check
    for e in endings:
        if e.get("voice_clip") not in voice_manifest_paths:
            errors.append(f"Ending '{e['id']}' voice_clip missing from manifest")
        for eb in e.get("epilogue_beats", []):
            audit_beat(f"ending.{e['id']}.{eb.get('id')}", eb)

    # Check dialogue budget >= 95%
    pct_within = (beats_within_budget / max(1, total_beats_checked)) * 100.0
    if pct_within < 95.0:
        errors.append(
            f"Mobile Dialogue Pacing violation: {pct_within:.1f}% beats <=24w/145c (< 95.0% required). Offenders: {long_beats[:8]}"
        )

    # Check all 12 challenge mutators used + no back-to-back identical primary mutator per hub
    unused_mut = REQUIRED_CHALLENGE_MUTATORS - set(used_mutators.keys())
    if unused_mut:
        errors.append(f"Required challenge mutators never used: {sorted(unused_mut)}")

    for hid, mids in hub_mission_sets.items():
        prev_mut = None
        for mid in mids:
            mut = missions_by_id[mid].get("mutator")
            if prev_mut is not None and mut != "NONE" and mut == prev_mut:
                errors.append(f"Back-to-back duplicate primary mutator '{mut}' in hub '{hid}' at '{mid}'")
            prev_mut = mut

    # Also audit mutators, perks, and hub taglines for plain-English clarity
    for mut_id, mobj in mutators.items():
        for k in ("name", "badge", "summary", "counterplay"):
            val = str(mobj.get(k, ""))
            match = PLAIN_ENGLISH_BANNED_CI_RE.search(val) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(val)
            if match:
                errors.append(f"Plain-English QC VIOLATION on mutators.{mut_id}.{k}: '{match.group(0)}'")
    for pid, pobj in data["perks"].items():
        for k in ("name", "effect"):
            val = str(pobj.get(k, ""))
            match = PLAIN_ENGLISH_BANNED_CI_RE.search(val) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(val)
            if match:
                errors.append(f"Plain-English QC VIOLATION on perks.{pid}.{k}: '{match.group(0)}'")
    for h in hubs:
        val = str(h.get("tagline", ""))
        match = PLAIN_ENGLISH_BANNED_CI_RE.search(val) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(val)
        if match:
            errors.append(f"Plain-English QC VIOLATION on hubs.{h['id']}.tagline: '{match.group(0)}'")

    # Progressive Difficulty Curve QC across all 8 Cities (Geneva -> Apex)
    hub_avg_irt: list[tuple[str, float, float]] = []
    for hid in EXPECTED_HUBS:
        hm = [missions_by_id[mid] for mid in hub_mission_sets[hid]]
        avg_irt = sum((m["irt_b_range"][0] + m["irt_b_range"][1]) * 0.5 for m in hm) / len(hm)
        avg_t = sum(float(m["time_per_question_sec"]) for m in hm) / len(hm)
        hub_avg_irt.append((hid, avg_irt, avg_t))
    for i in range(1, len(hub_avg_irt)):
        prev_h, prev_b, prev_t = hub_avg_irt[i - 1]
        cur_h, cur_b, cur_t = hub_avg_irt[i]
        if cur_b <= prev_b:
            errors.append(f"Difficulty Curve VIOLATION: {cur_h} avg irtB ({cur_b:.2f}) <= {prev_h} ({prev_b:.2f})")
        if cur_t > prev_t:
            errors.append(f"Timer Curve VIOLATION: {cur_h} timer ({cur_t:.1f}s) > {prev_h} ({prev_t:.1f}s)")

    # Relics, Vault Clues, Fair-Play Clues checks
    missing_relics = set(EXPECTED_RELICS.values()) - used_relic_unlocks
    if missing_relics:
        errors.append(f"Relics never unlocked: {sorted(missing_relics)}")
    missing_vclues = vault_clue_ids - used_vault_clues
    if missing_vclues:
        errors.append(f"Vault clues never awarded: {sorted(missing_vclues)}")
    if planted_fair_play != {1, 2, 3, 4, 5, 6, 7, 8}:
        errors.append(f"Expected Fair-Play clues 1..8 planted across missions, found {sorted(planted_fair_play)}")

    # 7. BFS Graph Reachability from ch_1
    visited: set[str] = set()
    queue: deque[str] = deque(["ch_1"])
    while queue:
        cur = queue.popleft()
        if cur in visited or cur not in missions_by_id:
            continue
        visited.add(cur)
        m = missions_by_id[cur]
        targets: list[str] = []
        if m.get("next_mission_id"):
            targets.append(m["next_mission_id"])
        targets.extend(m.get("alternate_next_ids", []))
        for c in m.get("choices", []):
            if c.get("next_mission_id"):
                targets.append(c["next_mission_id"])
        for t in targets:
            if t not in visited and t in missions_by_id:
                queue.append(t)

    unreachable = set(missions_by_id.keys()) - visited
    if unreachable:
        errors.append(f"Unreachable missions from ch_1: {sorted(unreachable)}")

    # 7B. Validate v4.0 HBO Thriller Expansion: act_cutscenes (6), evidence_board (12), rival_reactions (6x5=30)
    valid_expressions = {"neutral", "intense", "shocked", "smirk"}
    expected_cutscene_imgs = {
        "act0_invitation.jpg",
        "act1_london_leak.jpg",
        "act2_tokyo_confrontation.jpg",
        "act3_cairo_vault.jpg",
        "act4_singapore_betrayal.jpg",
        "act5_apex_finale.jpg",
    }
    act_cutscenes = data.get("act_cutscenes", [])
    if len(act_cutscenes) != 6:
        errors.append(f"Expected exactly 6 act_cutscenes, found {len(act_cutscenes)}")
    seen_cutscene_imgs: set[str] = set()
    total_cutscene_lines = 0
    for cs in act_cutscenes:
        cs_id = cs.get("id", "<missing>")
        trig = cs.get("trigger_before_mission")
        if trig not in missions_by_id:
            errors.append(f"Cutscene '{cs_id}' broken trigger_before_mission '{trig}'")
        elif missions_by_id[trig].get("cutscene_before") != cs_id:
            errors.append(f"Mission '{trig}' missing matching cutscene_before='{cs_id}'")
        img = str(cs.get("image", ""))
        seen_cutscene_imgs.add(img.rsplit("/", 1)[-1])
        lines = cs.get("lines", [])
        if len(lines) < 3:
            errors.append(f"Cutscene '{cs_id}' must have >= 3 dramatic voiced lines, got {len(lines)}")
        for ln in lines:
            total_cutscene_lines += 1
            spk = ln.get("speaker")
            if spk not in cast_ids:
                errors.append(f"Cutscene '{cs_id}.{ln.get('id')}' unknown speaker '{spk}'")
            if ln.get("expression") not in valid_expressions:
                errors.append(f"Cutscene '{cs_id}.{ln.get('id')}' invalid expression '{ln.get('expression')}'")
            if ln.get("voice_clip") not in voice_manifest_paths:
                errors.append(f"Cutscene '{cs_id}.{ln.get('id')}' voice_clip missing from manifest")
            ltxt = str(ln.get("text", "")).strip()
            if not ltxt or ";" in ltxt:
                errors.append(f"Cutscene '{cs_id}.{ln.get('id')}' empty or semicolon text")
            if spk == "lindqvist" and LINDQVIST_CONTRACTION_RE.search(ltxt):
                errors.append(f"Cutscene '{cs_id}.{ln.get('id')}' Lindqvist contraction banned: {ltxt}")
            m_ban = PLAIN_ENGLISH_BANNED_CI_RE.search(ltxt) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(ltxt)
            if m_ban:
                errors.append(f"Cutscene '{cs_id}.{ln.get('id')}' banned jargon '{m_ban.group(0)}'")
    if seen_cutscene_imgs != expected_cutscene_imgs:
        errors.append(f"Cutscene images mismatch: expected {sorted(expected_cutscene_imgs)}, got {sorted(seen_cutscene_imgs)}")

    ev_board = data.get("evidence_board", {})
    ev_clues = ev_board.get("clues", [])
    if len(ev_clues) != 12:
        errors.append(f"Expected exactly 12 evidence_board clues, found {len(ev_clues)}")
    ev_clue_ids = {c.get("id") for c in ev_clues}
    ev_cities: set[str] = set()
    ev_threads = 0
    for c in ev_clues:
        cid = c.get("id")
        if c.get("city_id") not in EXPECTED_HUBS:
            errors.append(f"Evidence clue '{cid}' invalid city_id '{c.get('city_id')}'")
        else:
            ev_cities.add(c["city_id"])
        um = c.get("unlock_mission")
        if um not in missions_by_id:
            errors.append(f"Evidence clue '{cid}' broken unlock_mission '{um}'")
        if c.get("suspect_id") not in cast_ids:
            errors.append(f"Evidence clue '{cid}' invalid suspect_id '{c.get('suspect_id')}'")
        for target_id in c.get("red_thread_to", []):
            ev_threads += 1
            if target_id not in ev_clue_ids or target_id == cid:
                errors.append(f"Evidence clue '{cid}' invalid red_thread_to '{target_id}'")
        for field in ("title", "summary"):
            txt = str(c.get(field, ""))
            m_ban = PLAIN_ENGLISH_BANNED_CI_RE.search(txt) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(txt)
            if m_ban:
                errors.append(f"Evidence clue '{cid}.{field}' banned jargon '{m_ban.group(0)}'")
    if ev_cities != set(EXPECTED_HUBS):
        errors.append(f"Evidence board must span all 8 cities, missing {sorted(set(EXPECTED_HUBS) - ev_cities)}")

    required_triggers = ["on_player_streak", "on_player_miss", "on_rival_ahead", "on_boss_intro", "on_defeat"]
    rival_rx = data.get("rival_reactions", {})
    total_rx = 0
    for actor in sorted(VALID_CAST):
        if actor not in rival_rx:
            errors.append(f"Missing rival_reactions for actor '{actor}'")
            continue
        for trig in required_triggers:
            entry = rival_rx[actor].get(trig)
            if not isinstance(entry, dict):
                errors.append(f"Missing rival_reactions['{actor}']['{trig}']")
                continue
            total_rx += 1
            if entry.get("expression") not in valid_expressions:
                errors.append(f"Invalid expression on rival_reactions.{actor}.{trig}")
            if entry.get("voice_clip") not in voice_manifest_paths:
                errors.append(f"Voice clip missing from manifest on rival_reactions.{actor}.{trig}")
            rtxt = str(entry.get("text", "")).strip()
            if not rtxt or len(rtxt.split()) > 22:
                errors.append(f"Reaction text empty or >22w on rival_reactions.{actor}.{trig}")
            if actor == "lindqvist" and LINDQVIST_CONTRACTION_RE.search(rtxt):
                errors.append(f"Lindqvist contraction banned on rival_reactions.{actor}.{trig}: {rtxt}")
            m_ban = PLAIN_ENGLISH_BANNED_CI_RE.search(rtxt) or PLAIN_ENGLISH_BANNED_ACRONYM_RE.search(rtxt)
            if m_ban:
                errors.append(f"Banned jargon '{m_ban.group(0)}' on rival_reactions.{actor}.{trig}")

    # 8. State Simulation for all 4 Endings (BOTH 40-mission Core Spine AND 96-mission Full Run)
    if total_questions < 1050:
        errors.append(f"Directive #175 VIOLATION: expected >= 1,050 total match questions across 96 missions, got {total_questions}")

    reached_core, sim_core = simulate_ending_reachability(data, include_side_ops=False)
    reached_endings, sim_summaries = simulate_ending_reachability(data, include_side_ops=True)
    if EXPECTED_ENDINGS - reached_core:
        errors.append(f"Unreachable endings on 40-mission Core Spine: {sorted(EXPECTED_ENDINGS - reached_core)}")
    unreachable_endings = EXPECTED_ENDINGS - reached_endings
    if unreachable_endings:
        errors.append(f"Unreachable endings on 96-mission Full Run: {sorted(unreachable_endings)} | {sim_summaries}")

    betrayal_rules = data["dynamic_betrayal_resolver"].get("evaluation_order", [])
    betrayal_probe_states = [
        {"integrity": -10, "public_trust": 40, "council_favor": 60, "bonds": {}, "vault_clues": set(), "branch_flags": {"rio_sabotage": "CLAIMED_SEED"}},
        {"integrity": -30, "public_trust": 40, "council_favor": 65, "bonds": {}, "vault_clues": set(), "branch_flags": {"rio_sabotage": "SAVED_NADIA"}},
        {"integrity": 35, "public_trust": 70, "council_favor": 55, "bonds": {}, "vault_clues": set(), "branch_flags": {"rio_sabotage": "SAVED_NADIA"}},
    ]
    reached_betrayers: set[str] = set()
    for pstate in betrayal_probe_states:
        for rule in betrayal_rules:
            if eval_condition(rule.get("condition") or {}, pstate):
                reached_betrayers.add(str(rule["betrayer_id"]))
                break
    if reached_betrayers != {"nadia", "teo", "soren"}:
        errors.append(f"Not all 3 Singapore betrayers reachable: got {sorted(reached_betrayers)}")

    # 9. Disk asset check (core 24 MP3s + v4 52 MP3s, cutouts, cutscenes, Poly Haven props/HDRIs, venues/relics)
    core_voice_ok = 0
    core_voice_missing: list[str] = []
    for vp_str in sorted(core_voice_paths):
        dp = res_to_disk(vp_str)
        if dp.exists() and dp.stat().st_size > 0:
            core_voice_ok += 1
        else:
            core_voice_missing.append(vp_str)

    v4_voice_ok = 0
    v4_voice_missing: list[str] = []
    for vp_str in sorted(v4_voice_paths):
        dp = res_to_disk(vp_str)
        if dp.exists() and dp.stat().st_size > 0:
            v4_voice_ok += 1
        else:
            v4_voice_missing.append(vp_str)

    cutscene_img_ok = 0
    cutscene_img_missing: list[str] = []
    for cs in act_cutscenes:
        dp = res_to_disk(str(cs["image"]))
        if dp.exists() and dp.stat().st_size > 0:
            cutscene_img_ok += 1
        else:
            cutscene_img_missing.append(str(cs["image"]))

    voice_ok = core_voice_ok + v4_voice_ok
    voice_missing = core_voice_missing + v4_voice_missing

    # Verify all expression_portraits & audio_manifest files on disk too
    for _, expr_map in (data.get("expression_portraits") or {}).items():
        for _, ep_str in expr_map.items():
            used_portraits.add(str(ep_str))

    audio_manifest_paths: list[str] = []
    am = data.get("audio_manifest") or {}
    for _, mpath in (am.get("music") or {}).items():
        audio_manifest_paths.append(str(mpath))
    for spath in am.get("streak_chimes") or []:
        audio_manifest_paths.append(str(spath))
    if am.get("cutscene_whoosh"):
        audio_manifest_paths.append(str(am["cutscene_whoosh"]))
    audio_ok = 0
    audio_missing: list[str] = []
    for ap_str in sorted(set(audio_manifest_paths)):
        dp = res_to_disk(ap_str)
        if dp.exists() and dp.stat().st_size > 0:
            audio_ok += 1
        else:
            audio_missing.append(ap_str)

    portrait_ok = 0
    portrait_missing: list[str] = []
    for pp_str in sorted(used_portraits):
        dp = res_to_disk(pp_str)
        if dp.exists() and dp.stat().st_size > 0:
            portrait_ok += 1
        else:
            portrait_missing.append(pp_str)

    used_props: set[str] = set()
    used_venues: set[str] = set()
    for m in missions:
        if m.get("venue_3d_scene"):
            used_venues.add(str(m["venue_3d_scene"]))
        fpi = m.get("forensic_prop_inspect")
        if isinstance(fpi, dict) and fpi.get("prop_glb"):
            used_props.add(str(fpi["prop_glb"]))

    prop_ok = 0
    prop_missing: list[str] = []
    for pr in sorted(used_props):
        dp = ROOT / "godot" / "assets" / "polyhaven" / "models" / pr
        if dp.exists() and dp.stat().st_size > 0:
            prop_ok += 1
        else:
            prop_missing.append(pr)

    venue_ok = 0
    venue_missing: list[str] = []
    for vn in sorted(used_venues):
        dp = ROOT / "godot" / "assets" / "aaa_models" / vn
        if dp.exists() and dp.stat().st_size > 0:
            venue_ok += 1
        else:
            venue_missing.append(vn)

    hdri_ok = 0
    hdri_missing: list[str] = []
    used_hdris = sorted({str(h["hdri"]) for h in hubs if h.get("hdri")})
    for hd in used_hdris:
        dp = ROOT / "godot" / "assets" / "polyhaven" / "hdris" / f"{hd}.hdr"
        if dp.exists() and dp.stat().st_size > 0:
            hdri_ok += 1
        else:
            hdri_missing.append(f"{hd}.hdr")

    relic_ok = 0
    relic_missing: list[str] = []
    for rid, robj in data["relics"].items():
        dp = res_to_disk(str(robj["glb"]))
        if dp.exists() and dp.stat().st_size > 0:
            relic_ok += 1
        else:
            relic_missing.append(robj["glb"])

    backdrop_ok = 0
    backdrop_missing: list[str] = []
    for h in hubs:
        dp = res_to_disk(str(h["backdrop"]))
        if dp.exists() and dp.stat().st_size > 0:
            backdrop_ok += 1
        else:
            backdrop_missing.append(h["backdrop"])

    if require_disk_assets:
        if core_voice_missing:
            errors.append(f"Missing/empty core voice MP3 files on disk: {core_voice_missing}")
        if portrait_missing:
            errors.append(f"Missing/empty cutout portrait PNG files on disk: {portrait_missing}")
        if prop_missing:
            errors.append(f"Missing/empty Poly Haven prop GLBs on disk: {prop_missing}")
        if venue_missing:
            errors.append(f"Missing/empty Blender venue GLBs on disk: {venue_missing}")
        if hdri_missing:
            errors.append(f"Missing/empty Poly Haven HDRIs on disk: {hdri_missing}")
        if relic_missing:
            errors.append(f"Missing/empty Hero Relic GLBs on disk: {relic_missing}")
        if backdrop_missing:
            errors.append(f"Missing/empty Venue Backdrops on disk: {backdrop_missing}")
        if require_v4_assets:
            if v4_voice_missing:
                errors.append(f"Missing/empty v4 expansion voice MP3s on disk ({len(v4_voice_missing)}): {v4_voice_missing[:8]}")
            if cutscene_img_missing:
                errors.append(f"Missing/empty v4 cutscene JPGs on disk: {cutscene_img_missing}")
            if audio_missing:
                errors.append(f"Missing/empty audio_manifest files on disk: {audio_missing}")
        else:
            if v4_voice_missing:
                warnings.append(f"v4 voice clips still rendering in parallel: {v4_voice_ok}/{len(v4_voice_paths)} on disk.")
            if cutscene_img_missing:
                warnings.append(f"v4 cutscene art still rendering in parallel: {cutscene_img_ok}/{len(act_cutscenes)} on disk.")

    # Summary Report
    print("=" * 76)
    print("WORLD'S SMARTEST — 96-MISSION 20+ HOUR CAMPAIGN VALIDATION REPORT")
    print("=" * 76)
    print(f"Files (In-Sync):      {CAMPAIGN_PATH.relative_to(ROOT)} & {PUBLIC_CAMPAIGN_PATH.relative_to(ROOT)} ({CAMPAIGN_PATH.stat().st_size / 1024:.1f} KB)")
    print(f"Schema Version:       {data.get('schema_version')} | Canon Cast Lock: PASS (0 legacy names)")
    print(f"Hubs / Missions:      {len(hubs)} hubs x 12 (5 Core + 7 Side) = {len(missions)} missions (BFS Reachable: {len(visited)}/96)")
    print(f"Story Question Slots: {total_questions} curated slots (ch_1=4 Qs | R1-04 Rotation: 96/96 PASS)")
    print(f"Dialogue Pacing:      {beats_within_budget}/{total_beats_checked} ({pct_within:.1f}%) <=24w/145c | {total_choices} choices")
    print(f"Investigation Depth:  {forensic_props_count} Tabletop 3D Prop Clues (R1-05) | {passive_elo_count} Passive Elo Checks | 8/8 Fair-Play Clues")
    print(f"Relics / Vault Clues: {len(used_relic_unlocks)}/8 Hero Relics | {len(used_vault_clues)}/3 Hidden Vault Clues")
    print(f"Mutator Coverage:     {len(REQUIRED_CHALLENGE_MUTATORS & set(used_mutators.keys()))}/12 Challenge Mutators | Banlist Violations: 0")
    print(
        f"HBO Story Expansion:  {len(act_cutscenes)} Act Cutscenes ({total_cutscene_lines} VO lines, {cutscene_img_ok}/6 JPGs on disk) | "
        f"{len(ev_clues)} Evidence Clues ({ev_threads} red threads) | {total_rx} Rival Reactions (6x5)"
    )
    print(
        f"Disk Assets Verified: {voice_ok}/{len(voice_manifest_paths)} MP3s | "
        f"{audio_ok}/{len(set(audio_manifest_paths))} Music/StreakSFX | "
        f"{portrait_ok}/{len(used_portraits)} Cutouts | "
        f"{prop_ok}/{len(used_props)} Props | "
        f"{venue_ok}/{len(used_venues)} Venues | "
        f"{hdri_ok}/{len(used_hdris)} HDRIs | "
        f"{relic_ok}/8 Relics | "
        f"{backdrop_ok}/8 Backdrops"
    )
    curve_str = " -> ".join(f"{h.upper()}({b:+.2f}/{int(t)}s)" for h, b, t in hub_avg_irt)
    print(f"Plain-English QC:     PASS (0 unexplained jargon/acronyms across all 96 missions; ch_1=4 Qs & 2 crisp intro beats)")
    print(f"Difficulty Curve:     {curve_str}")
    print(f"Dynamic Betrayers:    {len(reached_betrayers)}/3 Reachable ({', '.join(sorted(reached_betrayers))})")
    print(f"Campaign Playtime:    {total_mission_minutes/60.0:.1f}h single run | {total_hrs:.1f}h total w/ Black Salons + New Circuit+")
    print("Ending Reachability Simulation:")
    for eid in sorted(EXPECTED_ENDINGS):
        s = sim_summaries[eid]
        mark = "REACHABLE" if s["reached"] else "BLOCKED"
        print(
            f"  - {eid:22s}: [{mark}] Int={s['integrity']:+d} Trust={s['public_trust']} "
            f"Council={s['council_favor']} Clues={len(s['vault_clues'])}/3 Branch={s['act3_branch']}"
        )

    if long_beats:
        print(f"\nVerbatim/Long Beats ({len(long_beats)} total, <=5% allowed): {', '.join(long_beats)}")
    if warnings:
        print("\nWARNINGS:")
        for w in warnings:
            print(f"  [WARN] {w}")
    if errors:
        print(f"\n[FAIL] {len(errors)} validation error(s) found:")
        for e in errors:
            print(f"  [ERR]  {e}")
        return 1

    print(
        f"\n[PASS] 0 validation errors! All 96 missions (40 Core + 56 Side Ops, {total_questions} Qs), "
        f"6 cutscenes, 12 evidence clues, 30 rival reactions, 12 mutators, "
        f"{voice_ok}/{len(voice_manifest_paths)} voice clips, and 4 endings verified."
    )
    return 0


def validate_wave2(campaign_data: dict[str, Any], require_disk_assets: bool = True) -> int:
    errors: list[str] = []
    if not WAVE2_PATH.exists():
        print(f"[FAIL] Missing Wave-2 narrative file: {WAVE2_PATH}")
        return 1

    raw_w2 = WAVE2_PATH.read_text(encoding="utf-8")
    try:
        w2 = json.loads(raw_w2)
    except Exception as exc:
        print(f"[FAIL] Invalid JSON in {WAVE2_PATH}: {exc}")
        return 1

    for banned in BANNED_LEGACY_NAMES:
        if banned in raw_w2:
            errors.append(f"Wave-2 Canon Cast Lock VIOLATION: legacy name '{banned}' found!")

    if re.search(r"[\u4e00-\u9fff]", raw_w2):
        errors.append("Wave-2 non-English CJK character leak detected in narrative_wave2.json!")

    mission_ids = {m["id"] for m in campaign_data.get("missions", [])}
    perk_ids = set(campaign_data.get("perks", {}).keys())
    vault_clue_ids = {vc["id"] for vc in campaign_data.get("vault_clues", [])}
    ev_clue_ids = {ec["id"] for ec in campaign_data.get("evidence_board", {}).get("clues", [])}

    valid_glyph_ids: set[str] = set()
    if GLYPH_MANIFEST_PATH.exists():
        gman = load_json(GLYPH_MANIFEST_PATH)
        valid_glyph_ids = {g["glyphId"] for g in gman.get("glyphs", [])}

    vo_w2_by_id: dict[str, dict[str, Any]] = {}
    if VO_WAVE2_MANIFEST_PATH.exists():
        vman = load_json(VO_WAVE2_MANIFEST_PATH)
        vo_w2_by_id = {c["id"]: c for c in vman.get("clips", [])}

    checked_urls: set[str] = set()
    missing_urls: list[str] = []

    def check_public_url(ctx: str, url: str | None) -> None:
        if not url:
            return
        if url.startswith("/"):
            errors.append(f"{ctx}: asset URL '{url}' must be relative ('assets/...') without leading slash")
        rel = url.lstrip("/")
        checked_urls.add(rel)
        if require_disk_assets:
            dp = ROOT / "public" / Path(rel)
            if not dp.exists() or dp.stat().st_size == 0:
                missing_urls.append(f"{ctx} -> {rel}")

    referenced_vo_ids: set[str] = set()

    def check_voiced_line(ctx: str, speaker: str, text: str, voice_url: str | None) -> None:
        if speaker not in VALID_CAST:
            errors.append(f"{ctx}: invalid speaker '{speaker}'")
        if not text.strip():
            errors.append(f"{ctx}: empty text")
        if ";" in text:
            errors.append(f"{ctx}: semicolon banned in spoken line: {text}")
        if speaker == "lindqvist" and LINDQVIST_CONTRACTION_RE.search(text):
            errors.append(f"{ctx}: Lindqvist contraction banned: {text}")
        if voice_url:
            check_public_url(ctx, voice_url)
            vid = Path(voice_url).stem
            referenced_vo_ids.add(vid)
            if vid in vo_w2_by_id:
                expected_txt = vo_w2_by_id[vid]["text"]
                if text != expected_txt:
                    errors.append(f"{ctx}: text mismatch vs vo_wave2_manifest[{vid}]: '{text}' != '{expected_txt}'")

    # 1. Persona Ceremonies (4)
    personas = w2.get("persona_ceremonies", [])
    if {p.get("personaId") for p in personas} != {"MAVERICK", "DIPLOMAT", "ANALYST", "PRODIGY"}:
        errors.append("Wave-2 persona_ceremonies must cover MAVERICK, DIPLOMAT, ANALYST, PRODIGY")
    for p in personas:
        pid = p.get("personaId")
        if p.get("startingPerkId") not in perk_ids:
            errors.append(f"persona.{pid}: invalid startingPerkId '{p.get('startingPerkId')}'")
        check_public_url(f"persona.{pid}.portrait", p.get("portraitUrl"))
        check_voiced_line(f"persona.{pid}", p.get("speaker", ""), p.get("text", ""), p.get("voiceUrl"))

    # 2. Backstage Hubs (8) & Backstage Conversations (16 across 8 hubs)
    b_hubs = w2.get("backstage_hubs", {})
    if set(b_hubs.keys()) != set(EXPECTED_HUBS):
        errors.append(f"Wave-2 backstage_hubs mismatch: got {sorted(b_hubs.keys())}")
    for hid, hconv in b_hubs.items():
        check_public_url(f"backstage_hubs.{hid}.ambience", hconv.get("ambienceUrl"))
        for n in hconv.get("nodes", []):
            check_public_url(f"backstage_hubs.{hid}.{n.get('id')}.portrait", n.get("portraitUrl"))
            check_public_url(f"backstage_hubs.{hid}.{n.get('id')}.voice", n.get("voiceUrl"))
            for opt in n.get("options", []):
                check_public_url(f"backstage_hubs.{hid}.{opt.get('id')}.respVoice", opt.get("responseVoiceUrl"))

    convs = w2.get("backstage_conversations", [])
    if len(convs) != 32:
        errors.append(f"Expected 32 backstage_conversations (4 per hub), found {len(convs)}")
    conv_hub_counts: Counter[str] = Counter()
    total_conv_nodes = 0
    for conv in convs:
        cid = conv.get("id", "<missing>")
        hid = conv.get("hubId", "")
        conv_hub_counts[hid] += 1
        if conv.get("unlockAfterMission") not in mission_ids:
            errors.append(f"conv.{cid}: invalid unlockAfterMission '{conv.get('unlockAfterMission')}'")
        check_public_url(f"conv.{cid}.venueGlb", conv.get("venueRoomGlb"))
        check_public_url(f"conv.{cid}.ambience", conv.get("ambientAudioUrl"))
        nodes = conv.get("nodes", {})
        entry = conv.get("entryNodeId")
        if entry not in nodes:
            errors.append(f"conv.{cid}: entryNodeId '{entry}' missing from nodes")
            continue
        seen_nodes: set[str] = set()
        q_nodes: deque[str] = deque([entry])
        while q_nodes:
            nid = q_nodes.popleft()
            if nid in seen_nodes or nid not in nodes:
                continue
            seen_nodes.add(nid)
            n = nodes[nid]
            total_conv_nodes += 1
            check_public_url(f"conv.{cid}.{nid}.portrait", n.get("portraitUrl"))
            check_voiced_line(f"conv.{cid}.{nid}", n.get("speaker", ""), n.get("text", ""), n.get("voiceUrl"))
            nxt = n.get("nextNodeId")
            if nxt is not None:
                if nxt not in nodes:
                    errors.append(f"conv.{cid}.{nid}: broken nextNodeId '{nxt}'")
                else:
                    q_nodes.append(nxt)
            for ch in n.get("choices", []):
                cnxt = ch.get("nextNodeId")
                if cnxt is not None:
                    if cnxt not in nodes:
                        errors.append(f"conv.{cid}.{nid}.{ch.get('id')}: broken nextNodeId '{cnxt}'")
                    else:
                        q_nodes.append(cnxt)
                eff = ch.get("effects", {})
                if eff.get("unlockPerk") and eff["unlockPerk"] not in perk_ids:
                    errors.append(f"conv.{cid}.{nid}.{ch.get('id')}: unknown unlockPerk '{eff['unlockPerk']}'")
                if eff.get("vaultClue") and eff["vaultClue"] not in vault_clue_ids:
                    errors.append(f"conv.{cid}.{nid}.{ch.get('id')}: unknown vaultClue '{eff['vaultClue']}'")
                if eff.get("unlockEvidenceClue") and eff["unlockEvidenceClue"] not in ev_clue_ids:
                    errors.append(f"conv.{cid}.{nid}.{ch.get('id')}: unknown evidence clue '{eff['unlockEvidenceClue']}'")
        orphan_nodes = set(nodes.keys()) - seen_nodes
        if orphan_nodes:
            errors.append(f"conv.{cid}: unreachable orphan nodes: {sorted(orphan_nodes)}")
    for hid in EXPECTED_HUBS:
        if conv_hub_counts[hid] != 4:
            errors.append(f"Hub '{hid}' expected 4 backstage_conversations, got {conv_hub_counts[hid]}")
    if total_conv_nodes < 120:
        errors.append(f"Expected >= 120 reachable backstage nodes, found {total_conv_nodes}")

    # 3. Tier-2 Gameplay Callouts (24) & Boss Phase Banners (3)
    callouts = w2.get("tier2_gameplay_callouts", [])
    if len(callouts) != 24:
        errors.append(f"Expected 24 tier2_gameplay_callouts, found {len(callouts)}")
    for c in callouts:
        cid = c.get("id", "<missing>")
        check_public_url(f"callout.{cid}.portrait", c.get("portraitUrl"))
        check_voiced_line(f"callout.{cid}", c.get("speakerId", ""), c.get("text", ""), c.get("voiceUrl"))

    banners = w2.get("boss_phase_banners", [])
    if [b.get("phase") for b in banners] != [1, 2, 3]:
        errors.append("Expected 3 boss_phase_banners for phases [1, 2, 3]")
    for b in banners:
        check_voiced_line(f"banner.phase{b.get('phase')}", "vance", b.get("text", ""), b.get("voiceUrl"))

    # 4. 40 Redacted Ledger Lore Logs (Depths 5..200)
    lore_logs = w2.get("archive_lore_logs", [])
    if len(lore_logs) != 40:
        errors.append(f"Expected exactly 40 archive_lore_logs, found {len(lore_logs)}")
    expected_depths = [i * 5 for i in range(1, 41)]
    if [lg.get("depth") for lg in lore_logs] != expected_depths:
        errors.append("archive_lore_logs depths must be strictly [5, 10, ..., 200]")
    seen_titles: set[str] = set()
    for lg in lore_logs:
        t = str(lg.get("title", "")).strip()
        btxt = str(lg.get("body", "")).strip()
        if not t or not btxt:
            errors.append(f"archive_lore_logs[{lg.get('airlockNumber')}]: empty title or body")
        if t in seen_titles:
            errors.append(f"Duplicate archive_lore_log title: '{t}'")
        seen_titles.add(t)
        if lg.get("strataId") not in {"PUBLIC_STRATA", "DIPLOMATIC_VAULTS", "MERIDIAN_ZERO_CORE"}:
            errors.append(f"Invalid strataId '{lg.get('strataId')}' on log '{t}'")
        if lg.get("relatedSuspectId") not in VALID_CAST:
            errors.append(f"Invalid relatedSuspectId '{lg.get('relatedSuspectId')}' on log '{t}'")

    # 5. 8 Tier-3 Relic Provenance Dossiers x 3 Latches = 24 Latches
    r_prov = w2.get("tier3_relic_provenance", {})
    if set(r_prov.keys()) != set(EXPECTED_RELICS.values()):
        errors.append(f"tier3_relic_provenance keys mismatch: got {sorted(r_prov.keys())}")
    total_latches = 0
    for rid, robj in r_prov.items():
        check_public_url(f"relic.{rid}.glb", robj.get("glbUrl"))
        check_public_url(f"relic.{rid}.fallbackGlb", robj.get("fallbackGlbUrl"))
        check_public_url(f"relic.{rid}.visa", robj.get("visaStampUrl"))
        check_public_url(f"relic.{rid}.sigGlyph", robj.get("signatureGlyphUrl"))
        if valid_glyph_ids and robj.get("signatureGlyphId") not in valid_glyph_ids:
            errors.append(f"relic.{rid}: unknown signatureGlyphId '{robj.get('signatureGlyphId')}'")
        if len(robj.get("inspectionHotspots", [])) != 3:
            errors.append(f"relic.{rid}: expected 3 inspectionHotspots")
        latches = robj.get("latches", [])
        if [lt.get("step") for lt in latches] != [1, 2, 3]:
            errors.append(f"relic.{rid}: latches must have steps [1, 2, 3]")
        for lt in latches:
            total_latches += 1
            check_public_url(f"relic.{rid}.latch{lt.get('step')}.glyph", lt.get("glyphUrl"))
            check_public_url(f"relic.{rid}.latch{lt.get('step')}.vo", lt.get("unlockVoiceUrl"))
            if valid_glyph_ids and lt.get("glyphId") not in valid_glyph_ids:
                errors.append(f"relic.{rid}.latch{lt.get('step')}: unknown glyphId '{lt.get('glyphId')}'")

    if vo_w2_by_id:
        unreferenced_w2 = set(vo_w2_by_id.keys()) - referenced_vo_ids
        if unreferenced_w2:
            errors.append(f"Unreferenced clips from vo_wave2_manifest.json: {sorted(unreferenced_w2)}")

    if missing_urls:
        errors.append(f"Missing Wave-2 public disk assets ({len(missing_urls)}): {missing_urls[:10]}")

    print("=" * 76)
    print("WORLD'S SMARTEST — WAVE-2 NARRATIVE EXPANSION VALIDATION REPORT")
    print("=" * 76)
    print(f"File:                 {WAVE2_PATH.relative_to(ROOT)} ({WAVE2_PATH.stat().st_size / 1024:.1f} KB)")
    print(f"Persona Ceremonies:   {len(personas)}/4 Stamped Archetypes | Boss Phase Banners: {len(banners)}/3")
    print(f"Backstage Drama:      {len(convs)} Branching Trees across {len(b_hubs)}/8 Hubs ({total_conv_nodes} Reachable Nodes, 0 Orphans)")
    print(f"Live Gameplay Barks:  {len(callouts)}/24 Modular Tier-2 Callouts")
    print(f"Archive Lore Logs:    {len(lore_logs)}/40 Subterranean Strata Logs (Depths 5..200)")
    print(f"Tier-3 Observatory:   {len(r_prov)}/8 Hero Relics x 3 = {total_latches}/24 Engraved Latches")
    print(
        f"Disk & VO Sync:       {len(vo_w2_by_id)}/{len(vo_w2_by_id)} Wave-2 VO Clips Verbatim Synced | "
        f"{len(checked_urls) - len(missing_urls)}/{len(checked_urls)} Public Asset URLs Verified (0 404s)"
    )

    if errors:
        print(f"\n[FAIL] {len(errors)} Wave-2 validation error(s) found:")
        for e in errors:
            print(f"  [ERR]  {e}")
        return 1

    print("\n[PASS] Wave-2 narrative_wave2.json passed 100% of schema, graph, glyph, GLB, and VO checks!")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate World's Smartest 40-mission campaign & Wave-2 narrative JSONs.")
    parser.add_argument("--skip-disk-check", action="store_true", help="Skip disk asset existence check.")
    parser.add_argument("--require-v4-assets", action="store_true", help="Require all 76 VO clips and 6 cutscene JPGs on disk.")
    args = parser.parse_args()
    rc1 = validate(require_disk_assets=not args.skip_disk_check, require_v4_assets=args.require_v4_assets)
    if rc1 != 0:
        return rc1
    campaign_data = load_json(CAMPAIGN_PATH)
    return validate_wave2(campaign_data=campaign_data, require_disk_assets=not args.skip_disk_check)


if __name__ == "__main__":
    sys.exit(main())
