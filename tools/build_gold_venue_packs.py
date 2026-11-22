#!/usr/bin/env python3
"""Build & ruthlessly validate Wave-2 `public/data/gold_venue_packs.json` (`PITCH_BIBLE.md` §3.4).

Outputs:
  - 640 bespoke host-country & thematic Gold questions (80 per venue across ch, gb, jp, br, eg, is, sg, global)
    in QID range 50,001 .. 50,640
  - 24 bespoke 3-step `HERO_ARTIFACT_SYNTHESIS` Boss chains (3 per venue x 8 venues = 72 step QIDs)
    in QID range 50,641 .. 50,712
  - Total: 712 unique Gold QIDs (50,001 .. 50,712), 100% tagged with verified `glyphId`s from
    `public/assets/glyphs/manifest.json` and 3 progressive `clueTiers`.
"""
from __future__ import annotations

import datetime as dt
import json
import math
import os
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.gold_venues import (  # noqa: E402
    venue_br,
    venue_ch,
    venue_eg,
    venue_gb,
    venue_global,
    venue_is,
    venue_jp,
    venue_sg,
)
from tools.gold_venues.tight_overrides import apply_tight_overrides  # noqa: E402

VENUE_MODULES = [
    venue_ch,
    venue_gb,
    venue_jp,
    venue_br,
    venue_eg,
    venue_is,
    venue_sg,
    venue_global,
]

DOMAIN_SHORT_NAMES: dict[int, str] = {
    0: "HISTORY",
    1: "SCIENCE",
    2: "GEOGRAPHY",
    3: "ARTS",
    4: "POP & MEDIA",
    5: "SPORTS",
    6: "TECH",
    7: "NATURE",
    8: "SOCIETY & LAW",
    9: "FOOD & CRAFT",
    10: "MYTH & LIT",
    11: "LOGIC & MATH",
}

VALID_GLYPH_HINTS = {
    "globe", "atom", "crown", "dna", "compass", "prism", "scales", "column",
    "rocket", "gear", "mask", "flame", "eye", "wave", "star", "scroll",
}

VALID_NARRATIVE_TAGS = {
    "SOVEREIGN_BLOC", "HORIZON_TECH", "AGORA_CIVIC", "MERIDIAN_ZERO",
    "BLACK_SALON", "ESPIONAGE", "ETHICS", "HIGH_POWER", "INVESTIGATIVE",
    "LATERAL_DEDUCTION", "CLASSIFIED_LEDGER", "HIGH_STAKES_BLUFF",
    "ARCHIVE_CORE", "CURRENT_PULSE", "RIVAL_PRESSURE", "FINALE_SYNTHESIS",
}

VALID_TONES = {"PRESTIGE", "WITTY", "THRILLER", "CRYPTIC"}

LITERARY_HYPERNYMS = {
    "writer", "novelist", "poet", "playwright", "children's author",
    "author", "essayist", "screenwriter", "dramatist",
}

# Keyword -> specific glyphId inside each domain's 3 SDF glyphs (WS_GLYPH_MANIFEST_V1)
GLYPH_KEYWORD_RULES: dict[int, list[tuple[list[str], str]]] = {
    0: [
        (["astrolabe", "star", "solar", "navigation", "meridian", "longitude", "equinox", "calendar"], "astrolabe"),
        (["charter", "scroll", "treaty", "papyrus", "seal", "law", "diary", "decree", "stone", "letters"], "wax_seal_scroll"),
        (["eagle", "crown", "battle", "empire", "monarch", "shogun", "castle", "guard", "citadel"], "double_eagle"),
    ],
    1: [
        (["prism", "light", "optic", "laser", "led", "color", "calcite", "cherenkov", "emerald", "uv", "rayleigh"], "prism_refraction"),
        (["planet", "star", "orbit", "exoplanet", "lunar", "moon", "apollo", "comet", "universe", "eclipse", "solar", "black hole", "lagrange", "asteroid"], "ringed_planet"),
        (["atom", "quantum", "boson", "meson", "muon", "element", "isotope", "superconduct", "kilogram", "entangle"], "atom_orbital"),
    ],
    2: [
        (["volcano", "lava", "caldera", "glacier", "geyser", "fissure", "mountain", "peak", "rift", "basalt"], "volcano"),
        (["compass", "strait", "harbor", "lighthouse", "canal", "bridge", "island", "nemo", "route", "tunnel", "wharf"], "compass_rose"),
        (["globe", "latitude", "river", "lake", "waterfall", "forest", "desert", "park", "basin", "grid"], "globe_grid"),
    ],
    3: [
        (["rose", "cathedral", "dome", "mosque", "glass", "shrine", "temple", "vault", "conservatory", " stained"], "gothic_rose"),
        (["palette", "paint", "sculpt", "mosaic", "tile", "print", "art", "lacquer", "gallery", "statue"], "painters_palette"),
        (["column", "tower", "bridge", "spire", "sky", "arch", "hotel", "museum", "obelisk", "hall"], "ionic_column"),
    ],
    4: [
        (["reel", "film", "cinema", "movie", "play", "theatre", "puppet", "stage", "director", "curtain"], "cinema_reel"),
        (["vinyl", "waveform", "synth", "drum", "studio", "electronic", "rock", "pop", "bossa", "samba", "game", "online"], "vinyl_waveform"),
        (["lyre", "orchestra", "opera", "cello", "horn", "oud", "bow", "anthem", "classical", "choro"], "apollo_lyre"),
    ],
    5: [
        (["chronograph", "f1", "race", "speed", "row", "boat", "senna", "time"], "chronograph_dial"),
        (["laurel", "champion", "gold", "wimbledon", "cricket", "judo", "wrestl", "glima", "squash", "world cup", "pele"], "victory_laurel"),
        (["torch", "olympic", "relay", "stadium", "ring", "sumo", "beach", "badminton"], "olympic_torch"),
    ],
    6: [
        (["quantum", "qubit", "diode", "squid", "wafer", "chip", "semiconductor", "transistor", "battery"], "quantum_chip"),
        (["network", "web", "internet", "bgp", "fiber", "cable", "pix", "ai", "alphafold", "tube", "rail", "train"], "neural_network"),
        (["cipher", "enigma", "colossus", "turing", "crypt", "merkle", "sha", "zkp", "key", "qr", "code", "watch", "clock"], "cipher_key"),
    ],
    7: [
        (["frond", "tree", "forest", "botanic", "orchid", "palm", "seed", "acai", "cotton", "rubber", "leaf", "birch"], "botanical_frond"),
        (["shell", "whale", "dolphin", "fish", "clam", "jellyfish", "shark", "otter", "vent", "coral", "cod"], "nautilus_shell"),
        (["dna", "gene", "stem", "cell", "vaccine", "penicillin", "crispr", "archaea", "viper", "venom", "psychology", "fox", "horse", "tamarin"], "dna_helix"),
    ],
    8: [
        (["gavel", "constitution", "parliament", "althing", "court", "vote", "budget", "law", "bill", "mediation", "genocide"], "gavel_charter"),
        (["olive", "peace", "un", "neutral", "summit", "antarctic", "asean", "treaty", "climate", "diploma", "unesco"], "diplomatic_olive"),
        (["scales", "bank", "monetary", "currency", "imf", "bretton", "cpf", "coe", "trade", "eez", "commons"], "scales_treaty"),
    ],
    9: [
        (["gears", "knife", "steel", "typeface", "helvetica", "tailor", "wool", "paper", "cotton", "design"], "horology_gears"),
        (["flask", "ferment", "koji", "umami", "cheese", "cocoa", "ethanol", "lacquer", "artemisinin", "tea", "beer", "cacha"], "alembic_flask"),
        (["amphora", "bread", "sushi", "ramen", "kopi", "dish", "stew", "bean", "porcelain", "jar", "hawker", "muesli"], "artisan_amphora"),
    ],
    10: [
        (["trident", "odin", "thor", "viking", "poseidon", "sea", "king", "hero"], "trident_crown"),
        (["ouroboros", "sun", "amaterasu", "horus", "ankh", "yggdrasil", "myth", "kenning", "folklore", "babel"], "ouroboros_sun"),
        (["quill", "novel", "poet", "saga", "edda", "geniza", "papyrus", "codex", "shakespeare", "dickens", "mahfouz", "script"], "grimoire_quill"),
    ],
    11: [
        (["knight", "game", "shogi", "senet", "go", "checkers", "auction", "arrow", "aumann", "voter", "bayes", "survivor"], "chess_knight"),
        (["infinity", "godel", "noether", "poincare", "cantor", "diophant", "rice", "pspace", "uncount", "limit"], "mobius_infinity"),
        (["spiral", "fibonacci", "origami", "angle", "hyperboloid", "euclid", "fraction", "benford", "bar model", "abacus", "probability", "irt"], "fibonacci_spiral"),
    ],
}


def clean_text(s: str) -> str:
    # Remove any accidental LaTeX $ wrappers and normalize whitespace
    out = s.strip()
    out = out.replace("$10^{-15}$", "10^-15")
    out = out.replace("$10^-15$", "10^-15")
    out = out.replace("$2^{20}$", "2^20")
    out = out.replace("$\\sqrt{}$", "square-root")
    out = out.replace("$x^8$", "x^8")
    out = re.sub(r"\s+", " ", out).strip()
    return out


def load_glyph_manifest() -> tuple[dict[str, dict[str, Any]], dict[int, list[str]], dict[int, str]]:
    manifest_path = ROOT / "public" / "assets" / "glyphs" / "manifest.json"
    with manifest_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    by_id: dict[str, dict[str, Any]] = {}
    for g in data["glyphs"]:
        gid = g["glyphId"]
        png_path = ROOT / "public" / g["url"].lstrip("/")
        if not png_path.is_file():
            raise FileNotFoundError(f"Missing glyph PNG on disk: {png_path}")
        by_id[gid] = g
    by_domain = {int(k): list(v) for k, v in data["byDomain"].items()}
    defaults = {int(k): str(v) for k, v in data["defaultByDomain"].items()}
    return by_id, by_domain, defaults


def resolve_glyph_id(
    raw: dict[str, Any],
    by_domain: dict[int, list[str]],
    defaults: dict[int, str],
    usage_counter: Counter[str],
) -> str:
    dom = int(raw["l0Domain"])
    hay = " ".join([
        str(raw.get("_glyphKw", "")),
        str(raw.get("l1Category", "")),
        str(raw.get("l2Subcategory", "")),
        str(raw.get("prompt", "")),
        str(raw.get("glyphHint", "")),
    ]).lower()

    best_gid: str | None = None
    best_hits = 0
    for kw_list, gid in GLYPH_KEYWORD_RULES.get(dom, []):
        hits = sum(1 for kw in kw_list if kw in hay)
        if hits > best_hits:
            best_hits = hits
            best_gid = gid

    if best_gid and best_gid in by_domain[dom]:
        return best_gid

    # Balance across the domain's 3 glyphs when no specific keyword dominates
    dom_glyphs = by_domain[dom]
    return min(dom_glyphs, key=lambda g: (usage_counter[g], dom_glyphs.index(g)))


def build_clue_tiers(raw: dict[str, Any], glyph_id: str, glyph_url: str) -> list[dict[str, Any]]:
    dom = int(raw["l0Domain"])
    short_dom = DOMAIN_SHORT_NAMES[dom]
    l1 = raw["l1Category"].upper()
    cat_label = f"{short_dom} · {l1}"
    gh = raw["glyphHint"]
    c1, c2 = raw["clues"][0], raw["clues"][1]
    shatter = [2, 3] if raw["archetype"] in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS") else []
    return [
        {
            "tier": 1,
            "title": "COLD INSTINCT",
            "multiplier": 3.0,
            "sealed": True,
            "clueText": None,
            "glyphHint": gh,
            "glyphId": glyph_id,
            "glyphUrl": glyph_url,
            "glyphCategoryLabel": cat_label,
            "shatteredFacetIndices": [],
        },
        {
            "tier": 2,
            "title": "THE CLUE CORE",
            "multiplier": 2.0,
            "sealed": False,
            "clueText": c1,
            "glyphHint": gh,
            "glyphId": glyph_id,
            "glyphUrl": glyph_url,
            "glyphCategoryLabel": cat_label,
            "shatteredFacetIndices": [],
        },
        {
            "tier": 3,
            "title": "THE BLUEPRINT CORE",
            "multiplier": 1.2,
            "sealed": False,
            "clueText": c2,
            "glyphHint": gh,
            "glyphId": glyph_id,
            "glyphUrl": glyph_url,
            "glyphCategoryLabel": cat_label,
            "shatteredFacetIndices": shatter,
        },
    ]


def answer_leak_tokens(ans: str) -> list[str]:
    """Return case-insensitive phrases/tokens from `ans` that must NEVER appear in prompt or clues."""
    low = ans.strip().lower()
    checks = []
    if len(low) >= 4:
        checks.append(low)
    # Also check parenthetical & main non-parenthetical parts (e.g. "Ibn al-Haytham (Alhazen)")
    parts = [p.strip() for p in re.split(r"[()/]", low) if len(p.strip()) >= 5]
    for p in parts:
        if p not in {"true", "false", "challenge!"} and not p.startswith("3/3 "):
            checks.append(p)
    return list(dict.fromkeys(checks))


def sanitize_and_enrich(
    raw_in: dict[str, Any],
    qid: int,
    hub: str,
    region_code: str,
    glyph_by_domain: dict[int, list[str]],
    glyph_defaults: dict[int, str],
    glyph_usage: Counter[str],
    is_boss_step: bool = False,
    relic_id: str | None = None,
) -> dict[str, Any]:
    q = apply_tight_overrides(raw_in, qid)
    q["qid"] = qid
    q["venueHub"] = hub
    q["sourceTier"] = "GOLD_CURATED"
    q["freshness"] = "EVERGREEN"
    q["regions"] = ["GLOBAL"] if region_code == "GLOBAL" else [region_code, "GLOBAL"]
    if is_boss_step:
        q["archetype"] = "HERO_ARTIFACT_SYNTHESIS"
        if relic_id:
            q["heroRelicId"] = relic_id

    q["prompt"] = clean_text(q["prompt"])
    q["answerCorrect"] = clean_text(q["answerCorrect"])
    q["l1Category"] = clean_text(q["l1Category"])
    q["l2Subcategory"] = clean_text(q["l2Subcategory"])
    q["microTopicId"] = clean_text(q["microTopicId"])
    q["whyExplanation"] = clean_text(q["whyExplanation"])
    q["clues"] = [clean_text(q["clues"][0]), clean_text(q["clues"][1])]

    if "distractors" in q and isinstance(q["distractors"], list):
        q["distractors"] = [
            {"text": clean_text(d["text"]), "plausibility": d["plausibility"]}
            for d in q["distractors"]
        ]

    if "codexExt" in q and isinstance(q["codexExt"], dict):
        q["codexExt"] = {
            "pairs": [
                {"subject": clean_text(p["subject"]), "target": clean_text(p["target"])}
                for p in q["codexExt"]["pairs"]
            ],
            "decoyTarget": clean_text(q["codexExt"]["decoyTarget"]),
        }

    gid = resolve_glyph_id(q, glyph_by_domain, glyph_defaults, glyph_usage)
    glyph_usage[gid] += 1
    gurl = f"/assets/glyphs/{gid}.png"
    q["glyphId"] = gid
    q["glyphUrl"] = gurl
    q["clueTiers"] = build_clue_tiers(q, gid, gurl)
    q.pop("_glyphKw", None)
    return q


def validate_all(
    questions: list[dict[str, Any]],
    boss_chains: list[dict[str, Any]],
    venue_meta_map: dict[str, dict[str, Any]],
    glyph_by_id: dict[str, dict[str, Any]],
) -> list[str]:
    errors: list[str] = []

    # Load existing 20,165 questions for strict cross-deduplication
    existing_path = ROOT / "public" / "data" / "questions.json"
    with existing_path.open("r", encoding="utf-8") as f:
        existing_bundle = json.load(f)
    existing_qids = {int(x["qid"]) for x in existing_bundle["questions"]}
    existing_prompts = {
        re.sub(r"[^a-z0-9]+", "", x["prompt"].lower()) for x in existing_bundle["questions"]
    }
    existing_topics = {
        str(x.get("microTopicId", "")).strip().lower()
        for x in existing_bundle["questions"]
        if x.get("microTopicId")
    }

    all_records: list[dict[str, Any]] = list(questions)
    for ch in boss_chains:
        all_records.extend(ch["steps"])

    seen_qids: set[int] = set()
    seen_prompts: set[str] = set()
    seen_topics: set[str] = set()

    for q in all_records:
        qid = q["qid"]
        tag = f"Q{qid} ({q['microTopicId']})"

        if qid in seen_qids or qid in existing_qids or not (50001 <= qid < 60000):
            errors.append(f"{tag}: QID collision or out of 50001..59999 range")
        seen_qids.add(qid)

        norm_p = re.sub(r"[^a-z0-9]+", "", q["prompt"].lower())
        if norm_p in seen_prompts or norm_p in existing_prompts:
            errors.append(f"{tag}: Duplicate prompt detected: {q['prompt'][:70]}")
        seen_prompts.add(norm_p)

        topic_low = q["microTopicId"].lower()
        if topic_low in seen_topics or topic_low in existing_topics:
            errors.append(f"{tag}: Duplicate microTopicId '{q['microTopicId']}'")
        seen_topics.add(topic_low)

        # Check IRT range vs venue curve
        vmeta = venue_meta_map[q["venueHub"]]
        lo_b, hi_b = vmeta["irtRange"]
        if not (lo_b - 1e-6 <= q["irtB"] <= hi_b + 1e-6):
            errors.append(f"{tag}: irtB={q['irtB']} outside {q['venueHub']} [{lo_b}, {hi_b}]")

        # Check LaTeX / HTML entities / brackets (allowing currency like $1M, US$2, S$5)
        latex_re = re.compile(r"(\\[a-zA-Z]+|\$[a-zA-Z\\][^$]{0,30}\$)")
        for field_name in ("prompt", "answerCorrect", "whyExplanation"):
            val = q[field_name]
            if any(bad in val for bad in ("&quot;", "&#", "[[", "]]")) or latex_re.search(val):
                errors.append(f"{tag}: Artifact in {field_name}: {val}")
        for ci, ctext in enumerate(q["clues"]):
            if any(bad in ctext for bad in ("&quot;", "&#", "[[", "]]")) or latex_re.search(ctext):
                errors.append(f"{tag}: Artifact in clue[{ci}]: {ctext}")

        # Check uppercase start on prompt
        if not q["prompt"][0].isupper() and q["prompt"][0] not in ("'", '"', "“"):
            errors.append(f"{tag}: Prompt does not start uppercase: {q['prompt'][:40]}")

        # Check glyphId & glyphHint & tags & tone
        if q["glyphId"] not in glyph_by_id:
            errors.append(f"{tag}: Unknown glyphId {q['glyphId']}")
        if q["glyphHint"] not in VALID_GLYPH_HINTS:
            errors.append(f"{tag}: Invalid glyphHint {q['glyphHint']}")
        if q["tone"] not in VALID_TONES:
            errors.append(f"{tag}: Invalid tone {q['tone']}")
        for nt in q.get("narrativeTags", []):
            if nt not in VALID_NARRATIVE_TAGS:
                errors.append(f"{tag}: Invalid narrativeTag {nt}")

        # Archetype-specific checks
        arch = q["archetype"]
        ans = q["answerCorrect"]
        max_prompt_len = 165 if arch == "GAUNTLET_SHATTER" else 210
        if len(q["prompt"]) > max_prompt_len:
            errors.append(f"{tag}: prompt > {max_prompt_len} chars ({len(q['prompt'])}): '{q['prompt'][:80]}...'")
        if len(ans) > 28:
            errors.append(f"{tag}: answerCorrect > 28 chars ({len(ans)}): '{ans}'")

        # Article grammar hygiene matching tools/qa/audit_questions_and_cadence.mjs
        if re.search(r"\b[Aa] [AEIOUaeiou][a-z]{2,}\b", q["prompt"]) and not re.search(
            r"\b[Aa] (?:uni|use|usa|euro|one|u\.s|ukrain|utah|ugand)", q["prompt"], re.I
        ):
            errors.append(f"{tag}: Awkward article 'a [vowel]' in prompt: '{q['prompt'][:90]}'")
        if re.search(r"\b[Aa]n [^AEIOUaeiou\s][a-z]{2,}\b", q["prompt"]) and not re.search(
            r"\b[Aa]n (?:hour|honest|honor|heir|herb|mri|ngo|nba|nfl|nhl|fbi|html|http|sql|x-ray)",
            q["prompt"],
            re.I,
        ):
            errors.append(f"{tag}: Awkward article 'an [consonant]' in prompt: '{q['prompt'][:90]}'")

        if arch in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS"):
            dists = q.get("distractors", [])
            if len(dists) < 3:
                errors.append(f"{tag}: Needs >=3 distractors, got {len(dists)}")
            labels_low = [ans.lower()]
            for d in dists:
                dt_txt = d["text"]
                if not dt_txt or len(dt_txt) > 28:
                    errors.append(f"{tag}: Distractor >28 or empty ({len(dt_txt)}): '{dt_txt}'")
                is_math_expr = bool(re.match(r"^[a-z]\b|^e\^|^kB\b", dt_txt))
                if not dt_txt[0].isupper() and not dt_txt[0].isdigit() and dt_txt[0] not in ("'", '"', "-") and not is_math_expr:
                    errors.append(f"{tag}: Lowercase distractor start: '{dt_txt}'")
                dlow = dt_txt.lower()
                if dlow in labels_low:
                    errors.append(f"{tag}: Duplicate option '{dt_txt}'")
                for prev in labels_low:
                    if prev in LITERARY_HYPERNYMS and dlow in LITERARY_HYPERNYMS:
                        errors.append(f"{tag}: Hypernym collision '{prev}' vs '{dlow}'")
                labels_low.append(dlow)

            # Strict stem & clue answer-leak check (across ALL domains including domain 11!)
            for tok in answer_leak_tokens(ans):
                if tok in q["prompt"].lower():
                    errors.append(f"{tag}: Answer leak '{tok}' inside prompt!")
                for ci, ctext in enumerate(q["clues"]):
                    if tok in ctext.lower():
                        errors.append(f"{tag}: Answer leak '{tok}' inside clue[{ci}]!")

            # Partial 6+-char distinctive token check matching tools/qa/audit_questions_and_cadence.mjs
            qa_stopwords = {
                "the", "of", "and", "in", "to", "for", "on", "at", "by", "with", "from",
                "city", "river", "lake", "mount", "sea", "island", "islands", "park", "national",
                "university", "college", "empire", "kingdom", "republic", "united", "states",
                "war", "battle", "treaty", "act", "law", "theory", "effect", "constant", "number",
                "world", "new", "old", "north", "south", "east", "west", "great", "saint", "san",
                "king", "queen", "prince", "general", "president", "doctor", "sir", "lord",
            }
            if q["l0Domain"] != 11:
                for ptok in re.split(r"[^a-z0-9]+", ans.lower()):
                    if len(ptok) >= 6 and ptok not in qa_stopwords:
                        if re.search(rf"\b{re.escape(ptok)}\b", q["prompt"], re.I):
                            errors.append(f"{tag}: Partial token '{ptok}' from '{ans}' repeated in prompt!")

        elif arch == "CALIBRATOR_DIAL":
            cext = q.get("calibratorExt")
            if not cext:
                errors.append(f"{tag}: Missing calibratorExt")
            else:
                ex, mn, mx, st = cext["exactVal"], cext["minVal"], cext["maxVal"], cext["step"]
                if not (mn < ex < mx):
                    errors.append(f"{tag}: Calibrator exactVal={ex} not strictly inside ({mn}, {mx})")
                span = mx - mn
                mid_step = round(((mn + mx) * 0.5) / st) * st
                wide_margin = max(st * 3, round((span * 0.165) / st) * st)
                if abs(ex - mid_step) <= wide_margin:
                    errors.append(
                        f"{tag}: Calibrator exactVal={ex} within WIDE margin ({wide_margin}) of midpoint {mid_step}"
                    )
                # Step grid alignment
                rem_ex = abs((ex - mn) / st - round((ex - mn) / st))
                rem_mx = abs((mx - mn) / st - round((mx - mn) / st))
                if rem_ex > 1e-6 or rem_mx > 1e-6:
                    errors.append(f"{tag}: Calibrator off step grid ({mn}..{mx}, ex={ex}, step={st})")
                # Exact numeric leak check in prompt and clues
                ex_str = str(ex)
                for field_lbl, txt in [("prompt", q["prompt"]), ("clue[0]", q["clues"][0]), ("clue[1]", q["clues"][1])]:
                    if re.search(rf"(?<![0-9.]){re.escape(ex_str)}(?![0-9.])", txt):
                        errors.append(f"{tag}: Exact number '{ex_str}' leaked in {field_lbl}: '{txt}'")

        elif arch == "CODEX_DUAL_RING":
            xext = q.get("codexExt")
            if not xext or len(xext.get("pairs", [])) != 3:
                errors.append(f"{tag}: Invalid codexExt")
            else:
                subjs = [p["subject"] for p in xext["pairs"]]
                targs = [p["target"] for p in xext["pairs"]] + [xext["decoyTarget"]]
                if len({s.lower() for s in subjs}) != 3:
                    errors.append(f"{tag}: Duplicate Codex subjects {subjs}")
                if len({t.lower() for t in targs}) != 4:
                    errors.append(f"{tag}: Duplicate Codex targets {targs}")
                for item in subjs + targs:
                    if len(item) > 28:
                        errors.append(f"{tag}: Codex label > 28 chars ({len(item)}): '{item}'")

        elif arch == "GAUNTLET_SHATTER":
            gext = q.get("gauntletExt")
            if not gext:
                errors.append(f"{tag}: Missing gauntletExt")
            for ci, ctext in enumerate(q["clues"]):
                clow = ctext.lower()
                if any(giveaway in clow for giveaway in ("statement is true", "statement is false", "is a myth", "urban myth")):
                    errors.append(f"{tag}: Direct giveaway in Gauntlet clue[{ci}]: '{ctext}'")

    return errors


def main() -> int:
    glyph_by_id, glyph_by_domain, glyph_defaults = load_glyph_manifest()
    glyph_usage: Counter[str] = Counter()

    questions: list[dict[str, Any]] = []
    boss_chains: list[dict[str, Any]] = []
    venue_meta_map: dict[str, dict[str, Any]] = {}

    next_qid = 50001
    for mod in VENUE_MODULES:
        vmeta = dict(mod.VENUE_META)
        hub = vmeta["hub"]
        reg = vmeta["regionCode"]
        venue_meta_map[hub] = vmeta

        mod_qs = mod.QUESTIONS
        if len(mod_qs) < 75:
            print(f"ERROR: Venue {hub} has only {len(mod_qs)} questions (<75)", file=sys.stderr)
            return 1

        for raw_q in mod_qs:
            enriched = sanitize_and_enrich(
                raw_q, next_qid, hub, reg, glyph_by_domain, glyph_defaults, glyph_usage
            )
            questions.append(enriched)
            next_qid += 1

    for mod in VENUE_MODULES:
        vmeta = mod.VENUE_META
        hub = vmeta["hub"]
        reg = vmeta["regionCode"]
        for raw_chain in mod.BOSS_CHAINS:
            steps_out = []
            for st in raw_chain["steps"]:
                enriched_step = sanitize_and_enrich(
                    st,
                    next_qid,
                    hub,
                    reg,
                    glyph_by_domain,
                    glyph_defaults,
                    glyph_usage,
                    is_boss_step=True,
                    relic_id=raw_chain["relicId"],
                )
                steps_out.append(enriched_step)
                next_qid += 1
            boss_chains.append({
                "chainId": raw_chain["chainId"],
                "relicId": raw_chain["relicId"],
                "relicName": raw_chain["relicName"],
                "hub": hub,
                "chainTitle": clean_text(raw_chain["chainTitle"]),
                "steps": steps_out,
            })

    errors = validate_all(questions, boss_chains, venue_meta_map, glyph_by_id)
    if errors:
        print(f"VALIDATION FAILED WITH {len(errors)} ERRORS:")
        for e in errors:
            print("  -", e)
        return 1

    all_items = questions + [s for c in boss_chains for s in c["steps"]]
    by_venue = Counter(q["venueHub"] for q in all_items)
    by_domain = Counter(str(q["l0Domain"]) for q in all_items)
    by_arch = Counter(q["archetype"] for q in all_items)
    by_glyph = Counter(q["glyphId"] for q in all_items)

    bundle = {
        "schemaVersion": "WS_GOLD_VENUE_PACKS_V2",
        "generatedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "qidRange": [50001, next_qid - 1],
        "totalQuestions": len(questions),
        "totalBossChains": len(boss_chains),
        "totalBossStepQuestions": len(boss_chains) * 3,
        "totalAllGoldItems": len(all_items),
        "counts": {
            "byVenue": dict(by_venue),
            "byDomain": {str(k): by_domain[str(k)] for k in range(12)},
            "byArchetype": dict(by_arch),
            "byGlyphId": dict(sorted(by_glyph.items())),
        },
        "venueMeta": venue_meta_map,
        "questions": questions,
        "bossChains": boss_chains,
    }

    out_path = ROOT / "public" / "data" / "gold_venue_packs.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(bundle, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = out_path.stat().st_size / 1024.0
    print(f"SUCCESS: Wrote {out_path} ({size_kb:.1f} KB)")
    print(f"  Standalone Regional Questions : {len(questions)} (QIDs 50001..{50000 + len(questions)})")
    print(f"  Boss Synthesis 3-Step Chains  : {len(boss_chains)} ({len(boss_chains) * 3} steps, QIDs {50001 + len(questions)}..{next_qid - 1})")
    print(f"  Total Unique Gold QIDs        : {len(all_items)}")
    print(f"  Unique SDF Glyphs Used        : {len(by_glyph)} / {len(glyph_by_id)}")
    print(f"  Counts by Venue               : {dict(by_venue)}")
    print(f"  Counts by Archetype           : {dict(by_arch)}")
    print(f"  Counts by Domain              : { {k: by_domain[str(k)] for k in range(12)} }")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
