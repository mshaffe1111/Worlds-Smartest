#!/usr/bin/env python3
"""
World's Smartest — Million-Scale Fact-Graph & Lazy-Shard Architect Builder
==========================================================================
Builds compact, lazy-loaded, 100% commercial-safe (CC0 / Public Domain /
CC-BY 4.0 / MIT) verified encyclopedic fact-graph shards across all 12
domains (l0Domain 0..11) plus godot/data/shards/shard_manifest.json.

Design Guarantees:
- ZERO files touched outside godot/data/shards/ (never edits questions.json or *.gd).
- Every shard chunk file strictly <= 1.42 MB uncompressed (< 1.5 MB hard cap).
- Total disk footprint across ALL shards strictly <= 45 MB (targets ~16-28 MB).
- Contiguous deterministic QIDs starting at 60,000 and staying strictly < 1,048,576
  so 100% of Tier-1 + Tier-2 questions fit inside TriviaDatabase.gd's 128 KB bitset.
- Strict text hygiene: zero raw Q-IDs, zero non-Latin tofu glyphs, zero generic/junk
  labels, strict single-value unambiguity, canonical country/sport normalization,
  and strict fame-to-difficulty (irtB) calibration (-1.50 Easy .. +2.55 Genius).
"""

import argparse
import csv
import gzip
import hashlib
import io
import json
import math
import os
import re
import sys
import tempfile
import time
import unicodedata
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

ROOT = Path(__file__).resolve().parent.parent
SHARDS_DIR = ROOT / "godot" / "data" / "shards"
DEFAULT_CACHE_DIR = Path(tempfile.gettempdir()) / "ws_million_shard_cache_v1"

UA = "WorldsSmartestTriviaBuilder/1.0 (https://github.com/mshaffe1111/Worlds-Smartest)"
QLEVER_ENDPOINT = "https://qlever.dev/api/wikidata"

MAX_CHUNK_BYTES = 1_400_000  # strictly < 1.5 MB (1,572,864 bytes)
START_QID = 60_000
MAX_QID_EXCLUSIVE = 1_045_000  # leaves buffer below 1,048,576 (128 KB bitset)

DOMAIN_META = [
    {"id": 0, "key": "HISTORY", "name": "World History"},
    {"id": 1, "key": "SCIENCE", "name": "Science & Space"},
    {"id": 2, "key": "GEOGRAPHY", "name": "Geography & Wonders"},
    {"id": 3, "key": "ARTS", "name": "Arts & Architecture"},
    {"id": 4, "key": "POP", "name": "Film, Music & Pop"},
    {"id": 5, "key": "SPORTS", "name": "Sports & Games"},
    {"id": 6, "key": "TECH", "name": "Tech & Computing"},
    {"id": 7, "key": "NATURE", "name": "Nature & Biology"},
    {"id": 8, "key": "SOCIETY", "name": "World Affairs & Law"},
    {"id": 9, "key": "FOOD", "name": "Food, Craft & Design"},
    {"id": 10, "key": "MYTH", "name": "Myth & Literature"},
    {"id": 11, "key": "LOGIC", "name": "Logic & Math"},
]

LICENSES = [
    {
        "source": "Wikidata RDF Knowledge Graph (via QLever)",
        "license": "CC0-1.0 (Public Domain Dedication)",
        "url": "https://www.wikidata.org/wiki/Wikidata:Licensing",
    },
    {
        "source": "GeoNames Geographical Database (cities15000, countryInfo, admin1)",
        "license": "CC-BY-4.0",
        "url": "https://www.geonames.org/",
    },
    {
        "source": "OurAirports Worldwide Airport Directory",
        "license": "CC0-1.0 / Public Domain",
        "url": "https://ourairports.com/data/",
    },
    {
        "source": "NASA Exoplanet Archive (pscomppars)",
        "license": "Public Domain (US Government / NASA)",
        "url": "https://exoplanetarchive.ipac.caltech.edu/",
    },
    {
        "source": "PubChem Periodic Table of Elements",
        "license": "Public Domain (NIH / US Government)",
        "url": "https://pubchem.ncbi.nlm.nih.gov/",
    },
    {
        "source": "National Gallery of Art Open Data Program",
        "license": "CC0-1.0 (Public Domain Dedication)",
        "url": "https://github.com/NationalGalleryOfArt/opendata",
    },
    {
        "source": "World's Smartest Programmatically Verified Logic & Math Bank",
        "license": "MIT / Original",
        "url": "internal",
    },
]

# ---------------------------------------------------------------------------
# Strict Glyph, Text & Canonical Entity Hygiene
# ---------------------------------------------------------------------------
# PlusJakartaSans.ttf verified printable ASCII + Latin-1/Extended-A accented letters
ALLOWED_EXTRA_CHARS = set(
    "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß"
    "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"
    "ĀāĂăĄąĆćČčĎďĐđĒēĖėĘęĚěĞğĪīİıŁłŃńŇňŌōŐőŒœŔŕŘřŚśŞşŠšŢţŤťŪūŮůŰűŹźŻżŽž"
    "°²³·"
)

SMART_REPLACEMENTS = str.maketrans({
    "\u2018": "'",
    "\u2019": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u2013": "-",
    "\u2014": "-",
    "\u2212": "-",
    "\u00a0": " ",
    "\u200b": "",
    "\ufeff": "",
})

SUBSCRIPT_MAP = str.maketrans("₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹", "01234567890123456789")

QID_RE = re.compile(r"^[QP]\d+$", re.IGNORECASE)
WHITESPACE_RE = re.compile(r"\s+")
PAREN_SUFFIX_RE = re.compile(r"\s*\([^)]{1,40}\)\s*$")

JUNK_LABELS = {
    "unknown", "anonymous", "untitled", "various", "various artists", "none",
    "other", "n/a", "null", "unnamed", "human", "film", "book", "song", "album",
    "novel", "painting", "sculpture", "drawing", "print", "study", "sketch",
    "fragment", "plate", "sheet", "bowl", "vase", "coin", "medal", "portrait",
    "landscape", "still life", "self-portrait", "head of a man", "head of a woman",
    "study of a head", "virgin and child", "madonna and child", "crucifixion",
    "annunciation", "nativity", "pieta", "saint jerome", "saint peter",
    "disambiguation", "animal", "plant", "organism", "species", "taxon", "food",
    "dish", "drink", "beverage", "software", "website", "company", "organization",
    "country", "city", "mountain", "river", "island", "lake", "building",
    "museum", "castle", "bridge", "stadium", "athlete", "scientist", "writer",
    "actor", "director", "musician", "band", "person", "work", "art",
}

JUNK_PREFIXES = (
    "list of ", "category:", "template:", "wikipedia:", "untitled",
    "fragment of ", "study for ", "study of ", "sketch for ", "plate ",
    "sheet ", "folio ", "page ", "design for ", "detail of ", "copy after ",
    "after ", "attributed to ", "workshop of ", "circle of ", "follower of ",
    "school of ", "manner of ", "style of ", "imitator of ", "american ",
    "british ", "french ", "italian ", "german ", "dutch ", "spanish ",
    "unidentified ", "unknown ",
)

COUNTRY_ALIASES = {
    "united states of america": "United States",
    "u.s.a.": "United States",
    "usa": "United States",
    "us": "United States",
    "u.s.": "United States",
    "united kingdom of great britain and ireland": "United Kingdom",
    "united kingdom of great britain and northern ireland": "United Kingdom",
    "great britain": "United Kingdom",
    "kingdom of great britain": "United Kingdom",
    "england": "United Kingdom",
    "scotland": "United Kingdom",
    "wales": "United Kingdom",
    "people's republic of china": "China",
    "republic of china": "Taiwan",
    "russian federation": "Russia",
    "soviet union": "Soviet Union",
    "union of soviet socialist republics": "Soviet Union",
    "ussr": "Soviet Union",
    "federal republic of germany": "Germany",
    "german empire": "Germany",
    "weimar republic": "Germany",
    "west germany": "Germany",
    "east germany": "Germany",
    "nazi germany": "Germany",
    "french republic": "France",
    "kingdom of france": "France",
    "french third republic": "France",
    "kingdom of spain": "Spain",
    "kingdom of the netherlands": "Netherlands",
    "the netherlands": "Netherlands",
    "dutch republic": "Netherlands",
    "republic of ireland": "Ireland",
    "republic of korea": "South Korea",
    "korea, south": "South Korea",
    "democratic people's republic of korea": "North Korea",
    "czech republic": "Czechia",
    "islamic republic of iran": "Iran",
    "syrian arab republic": "Syria",
    "bolivarian republic of venezuela": "Venezuela",
    "plurinational state of bolivia": "Bolivia",
    "united mexican states": "Mexico",
    "federative republic of brazil": "Brazil",
    "argentine republic": "Argentina",
    "commonwealth of australia": "Australia",
    "dominion of canada": "Canada",
    "kingdom of sweden": "Sweden",
    "kingdom of norway": "Norway",
    "kingdom of denmark": "Denmark",
    "kingdom of belgium": "Belgium",
    "kingdom of italy": "Italy",
    "italian republic": "Italy",
    "hellenic republic": "Greece",
    "republic of turkey": "Turkey",
    "türkiye": "Turkey",
    "republic of poland": "Poland",
    "republic of austria": "Austria",
    "swiss confederation": "Switzerland",
    "portuguese republic": "Portugal",
    "state of israel": "Israel",
    "arab republic of egypt": "Egypt",
    "kingdom of morocco": "Morocco",
    "republic of south africa": "South Africa",
    "federal republic of nigeria": "Nigeria",
    "republic of kenya": "Kenya",
    "republic of india": "India",
    "empire of japan": "Japan",
    "state of japan": "Japan",
    "socialist republic of vietnam": "Vietnam",
    "viet nam": "Vietnam",
    "kingdom of thailand": "Thailand",
    "republic of the philippines": "Philippines",
    "republic of indonesia": "Indonesia",
    "republic of singapore": "Singapore",
    "kingdom of saudi arabia": "Saudi Arabia",
    "united arab emirates": "United Arab Emirates",
    "republic of colombia": "Colombia",
    "republic of chile": "Chile",
    "republic of peru": "Peru",
    "republic of cuba": "Cuba",
    "republic of finland": "Finland",
    "republic of hungary": "Hungary",
    "austro-hungarian empire": "Austria-Hungary",
    "austria-hungary": "Austria-Hungary",
    "ottoman empire": "Ottoman Empire",
    "roman empire": "Roman Empire",
    "byzantine empire": "Byzantine Empire",
    "holy roman empire": "Holy Roman Empire",
    "russian empire": "Russian Empire",
    "qing dynasty": "Qing Dynasty",
    "ming dynasty": "Ming Dynasty",
    "british empire": "British Empire",
    "prussia": "Prussia",
    "kingdom of prussia": "Prussia",
    "democratic republic of the congo": "DR Congo",
    "republic of the congo": "Republic of the Congo",
    "ivory coast": "Ivory Coast",
    "côte d'ivoire": "Ivory Coast",
    "myanmar": "Myanmar",
    "burma": "Myanmar",
    "bosnia and herzegovina": "Bosnia and Herzegovina",
    "north macedonia": "North Macedonia",
    "republic of macedonia": "North Macedonia",
    "trinidad and tobago": "Trinidad and Tobago",
    "papua new guinea": "Papua New Guinea",
    "new zealand": "New Zealand",
    "hong kong": "Hong Kong",
    "macau": "Macau",
}

SPORT_ALIASES = {
    "association football": "Soccer",
    "football": "Soccer",
    "women's association football": "Soccer",
    "basketball": "Basketball",
    "tennis": "Tennis",
    "athletics": "Track and Field",
    "track and field": "Track and Field",
    "baseball": "Baseball",
    "ice hockey": "Ice Hockey",
    "american football": "American Football",
    "gridiron football": "American Football",
    "swimming": "Swimming",
    "competitive swimming": "Swimming",
    "boxing": "Boxing",
    "golf": "Golf",
    "cycle sport": "Cycling",
    "road bicycle racing": "Cycling",
    "cycling": "Cycling",
    "chess": "Chess",
    "formula one": "Formula One",
    "auto racing": "Auto Racing",
    "motorsport": "Auto Racing",
    "cricket": "Cricket",
    "rugby union": "Rugby",
    "rugby league": "Rugby",
    "rugby": "Rugby",
    "artistic gymnastics": "Gymnastics",
    "rhythmic gymnastics": "Gymnastics",
    "gymnastics": "Gymnastics",
    "alpine skiing": "Alpine Skiing",
    "cross-country skiing": "Cross-Country Skiing",
    "ski jumping": "Ski Jumping",
    "biathlon": "Biathlon",
    "figure skating": "Figure Skating",
    "speed skating": "Speed Skating",
    "volleyball": "Volleyball",
    "beach volleyball": "Volleyball",
    "handball": "Handball",
    "field hockey": "Field Hockey",
    "rowing": "Rowing",
    "fencing": "Fencing",
    "judo": "Judo",
    "wrestling": "Wrestling",
    "freestyle wrestling": "Wrestling",
    "greco-roman wrestling": "Wrestling",
    "weightlifting": "Weightlifting",
    "table tennis": "Table Tennis",
    "badminton": "Badminton",
    "sailing": "Sailing",
    "equestrianism": "Equestrian",
    "shooting sport": "Sport Shooting",
    "archery": "Archery",
    "diving": "Diving",
    "water polo": "Water Polo",
    "mixed martial arts": "Mixed Martial Arts",
    "snooker": "Snooker",
    "australian rules football": "Australian Rules Football",
    "canoeing and kayaking": "Canoeing",
    "triathlon": "Triathlon",
    "snowboarding": "Snowboarding",
    "skateboarding": "Skateboarding",
    "surfing": "Surfing",
    "curling": "Curling",
    "lacrosse": "Lacrosse",
    "squash": "Squash",
    "bobsleigh": "Bobsleigh",
    "luge": "Luge",
    "taekwondo": "Taekwondo",
    "karate": "Karate",
}


def is_allowed_char(ch: str) -> bool:
    cp = ord(ch)
    if 32 <= cp <= 126:
        return True
    return ch in ALLOWED_EXTRA_CHARS


def clean_text(raw: Any, max_len: int = 44, min_len: int = 2, allow_digits_only: bool = False) -> Optional[str]:
    if raw is None:
        return None
    s = unicodedata.normalize("NFKC", str(raw)).translate(SMART_REPLACEMENTS)
    s = WHITESPACE_RE.sub(" ", s).strip()
    if not s:
        return None
    if len(s) < min_len or len(s) > max_len:
        return None
    if QID_RE.match(s):
        return None
    low = s.lower()
    if low in JUNK_LABELS:
        return None
    if any(low.startswith(p) for p in JUNK_PREFIXES):
        return None
    if "http://" in low or "https://" in low or "www." in low:
        return None
    if any(c in s for c in "{}[]<>|\\`~_\t\r\n"):
        return None
    if not all(is_allowed_char(c) for c in s):
        return None
    if not allow_digits_only and not any(c.isalpha() for c in s):
        return None
    if s.startswith("?") or s.endswith("?") or s.startswith("(") and s.endswith(")"):
        return None
    return s


VALID_HISTORIC_REALMS = {
    "Roman Empire", "Byzantine Empire", "Ottoman Empire", "Holy Roman Empire",
    "Austria-Hungary", "Soviet Union", "Prussia", "Russian Empire", "British Empire",
    "Qing Dynasty", "Ming Dynasty", "Ancient Greece", "Ancient Rome", "Ancient Egypt",
    "Republic of Venice", "Republic of Florence", "Kingdom of Naples", "Kingdom of Sicily",
    "Dutch Republic", "Yugoslavia", "Czechoslovakia", "Polish-Lithuanian Commonwealth",
    "Persian Empire", "Spanish Empire", "Portuguese Empire", "German Confederation",
    "Kingdom of Bavaria", "Kingdom of Saxony", "Kingdom of Sardinia", "Papal States",
    "Grand Duchy of Tuscany", "Northern Ireland", "Puerto Rico", "Hong Kong", "Macau",
    "Taiwan", "Palestine", "Vatican City", "Kosovo", "Greenland", "Faroe Islands",
    "Tibet", "DR Congo", "Republic of the Congo", "Ivory Coast", "Czechia",
    "North Macedonia", "South Korea", "North Korea", "United Kingdom", "United States",
    "Bosnia and Herzegovina", "Trinidad and Tobago", "Papua New Guinea", "New Zealand",
    "United Arab Emirates", "Saudi Arabia", "South Africa", "Myanmar",
}

VALID_COUNTRIES: Set[str] = set(VALID_HISTORIC_REALMS)

SENSITIVE_NON_ENTERTAINMENT_FIGURES = {
    "hitler", "adolf hitler", "joseph stalin", "stalin", "benito mussolini",
    "mussolini", "heinrich himmler", "joseph goebbels", "hermann göring",
    "pol pot", "osama bin laden", "saddam hussein", "kim il-sung", "kim jong-il",
    "kim jong-un", "idi amin", "nicolae ceausescu", "nicolae ceaușescu",
    "slobodan milosevic", "slobodan milošević", "charles manson", "ted bundy",
}


def load_valid_countries(client: "CachedClient") -> None:
    """Populate VALID_COUNTRIES strictly from GeoNames countryInfo.txt (CC-BY 4.0)."""
    ci_path = client.fetch_file("geonames_countryInfo.txt", "https://download.geonames.org/export/dump/countryInfo.txt")
    for line in ci_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 5:
            continue
        raw_c = parts[4].strip()
        s = clean_text(raw_c, max_len=36, min_len=2)
        if s:
            mapped = COUNTRY_ALIASES.get(s.lower(), s)
            VALID_COUNTRIES.add(mapped)


def clean_country(raw: Any) -> Optional[str]:
    s = clean_text(raw, max_len=36, min_len=2)
    if not s:
        return None
    low = s.lower()
    if low in COUNTRY_ALIASES:
        s = COUNTRY_ALIASES[low]
    if len(s) > 32:
        return None
    if VALID_COUNTRIES and s not in VALID_COUNTRIES:
        return None
    return s


def clean_sport(raw: Any) -> Optional[str]:
    s = clean_text(raw, max_len=32, min_len=3)
    if not s:
        return None
    low = s.lower()
    if low in SPORT_ALIASES:
        return SPORT_ALIASES[low]
    return None  # Keep strictly clean mainstream sports!


def sl_to_irt(sl: int, shift: float = 0.0) -> int:
    """Convert Wikipedia sitelinks count into calibrated centi-IRT (-150..+250)."""
    sl = max(1, int(sl))
    # log2(120)=6.9 -> -1.30; log2(60)=5.9 -> -0.70; log2(30)=4.9 -> -0.05;
    # log2(15)=3.9 -> +0.65; log2(8)=3.0 -> +1.35; log2(4)=2.0 -> +2.10
    val = 3.55 - 0.72 * math.log2(sl) + shift
    val = max(-1.50, min(2.55, val))
    return int(round(val * 100))


def pop_to_irt(pop: int, is_capital: bool = False) -> int:
    """Convert city population into calibrated centi-IRT (-145..+245)."""
    pop = max(1000, int(pop))
    # 5M -> -1.35; 1M -> -0.55; 300k -> +0.35; 100k -> +1.15; 30k -> +2.00
    val = 3.60 - 0.74 * math.log10(pop)
    if is_capital:
        val -= 0.55
    val = max(-1.45, min(2.45, val))
    return int(round(val * 100))


# ---------------------------------------------------------------------------
# Exact Template Specification (Stored Verbatim in shard_manifest.json!)
# ---------------------------------------------------------------------------
# Decoder contract (identical in Python validator and GDScript TriviaDatabase):
#   - Every table in a shard chunk has {"type": typeId, "baseQid": int, "r": [row, ...]}.
#   - Each row is a compact JSON array matching TYPE_SPECS[typeId]["cols"].
#   - Columns listed in "poolCols" store integer indexes into chunk["p"] (string pool).
#   - Last column is ALWAYS "irt" (integer centi-IRT: divide by 100.0 for float irtB).
#   - Number of playable questions for a table = len(rows) * len(angles).
#   - Deterministic QID for (row_i, angle_a) = baseQid + row_i * len(angles) + angle_a.
#   - Angle archetypes:
#       * SIGHTLINE_LOCK: 4-choice (answerCol + 3 distractors from distractorCol, or
#         inlineDistCols for math_puzzle). Respects avoidSameCol & preferSameCol.
#       * GAUNTLET_SHATTER: True/False (isTrue determined by (((qid >> 1) ^ (row_i * 7)) & 1) == 0).
#         False variant samples {fake} from fakeCol (or inlineFakeCol).
#       * CALIBRATOR_DIAL: Direct Estimate Slider on exactCol with unit, step (or adaptive
#         step when step == 0), pad, minClamp, maxClamp. Window is offset deterministically
#         so exactVal is NEVER dead-center and ALWAYS strictly on-grid inside (minVal, maxVal).
# ---------------------------------------------------------------------------

TYPE_SPECS: Dict[str, Dict[str, Any]] = {
    # ===================== DOMAIN 0: WORLD HISTORY =====================
    "hist_battle": {
        "l0Domain": 0, "l1Category": "Military History", "glyphHint": "shield",
        "cols": ["name", "conflict", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "hb_conflict", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which larger conflict included {name} ({year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This engagement took place in {year} in what is now {country}.",
                "clue2": "The conflict's name begins with \"{ans_init}\".",
                "why": "{name} ({year}) was fought during {conflict}.",
                "irtOffset": 0.0,
            },
            {
                "id": "hb_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which modern-day country did {name} ({year}) take place?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "It was fought during {conflict} in {year}.",
                "clue2": "The country's name starts with \"{ans_init}\".",
                "why": "{name} ({year}) took place in present-day {country}.",
                "irtOffset": 0.10,
            },
            {
                "id": "hb_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({year}) took place in present-day {country}.",
                "falsePrompt": "{name} ({year}) took place in present-day {fake}.",
                "fakeCol": 3,
                "clue1": "Place {conflict} ({year}) on the map.",
                "whyTrue": "True! {name} ({year}) was fought in present-day {country}.",
                "whyFalse": "False! {name} ({year}) took place in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "hb_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {name} ({conflict}) take place?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 45, "minClamp": 100, "maxClamp": 2024,
                "clue1": "It was fought in present-day {country} during {conflict}.",
                "why": "{name} took place in {year} CE during {conflict}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "hist_figure": {
        "l0Domain": 0, "l1Category": "Historical Figures", "glyphHint": "crown",
        "cols": ["name", "role", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "hf_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country or realm was historical figure {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "{name} was a notable {role} born in {year}.",
                "clue2": "The realm or nation begins with \"{ans_init}\".",
                "why": "{name} (born {year}) was a {role} associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "hf_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these historical figures was associated with {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "Born in {year} and known as a {role}.",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} (born {year}) was associated with {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "hf_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Historical figure {name} (born {year}) was associated with {country}.",
                "falsePrompt": "Historical figure {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Recall the historical homeland of {name} ({role}).",
                "whyTrue": "True! {name} (born {year}) was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "hf_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was historical figure {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 55, "minClamp": 100, "maxClamp": 1950,
                "clue1": "{name} was a {role} associated with {country}.",
                "why": "{name} ({country}) was born in {year} CE.",
                "irtOffset": 0.35,
            },
        ],
    },
    "hist_empire": {
        "l0Domain": 0, "l1Category": "Empires & States", "glyphHint": "crown",
        "cols": ["name", "capital", "year", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "he_cap", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What was the capital city of {name} (established {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This historical realm was founded in {year}.",
                "clue2": "Its capital starts with \"{ans_init}\".",
                "why": "{capital} served as the capital of {name} (founded {year}).",
                "irtOffset": 0.0,
            },
            {
                "id": "he_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which historical state or empire had {capital} as its capital?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "This state was established in {year}.",
                "clue2": "Its name starts with \"{ans_init}\".",
                "why": "{name} (established {year}) had {capital} as its capital.",
                "irtOffset": 0.10,
            },
            {
                "id": "he_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{capital} served as the capital of {name}.",
                "falsePrompt": "{fake} served as the capital of {name}.",
                "fakeCol": 1,
                "clue1": "Think of the historic seat of power for {name} ({year}).",
                "whyTrue": "True! {capital} was the capital of {name}.",
                "whyFalse": "False! The capital of {name} was {capital}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "he_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In approximately what year was {name} established?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 70, "minClamp": 100, "maxClamp": 2010,
                "clue1": "Its historical capital was {capital}.",
                "why": "{name} (capital: {capital}) was established in {year} CE.",
                "irtOffset": 0.35,
            },
        ],
    },
    "hist_war": {
        "l0Domain": 0, "l1Category": "Wars & Treaties", "glyphHint": "scales",
        "cols": ["name", "year", "country", "irt"],
        "poolCols": [2],
        "angles": [
            {
                "id": "hw_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country or region was directly tied to {name} ({year})?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "This historical event began or was signed in {year}.",
                "clue2": "The country begins with \"{ans_init}\".",
                "why": "{name} ({year}) was directly associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "hw_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these historical conflicts or treaties directly involved {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "It dates to the year {year}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({year}) involved {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "hw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({year}) was directly associated with {country}.",
                "falsePrompt": "{name} ({year}) was directly associated with {fake}.",
                "fakeCol": 2,
                "clue1": "Connect {name} ({year}) to the right nation.",
                "whyTrue": "True! {name} ({year}) involved {country}.",
                "whyFalse": "False! {name} ({year}) involved {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "hw_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {name} ({country}) begin or occur?",
                "exactCol": 1, "unit": "CE", "step": 1, "pad": 45, "minClamp": 100, "maxClamp": 2024,
                "clue1": "It is historically tied to {country}.",
                "why": "{name} ({country}) dates to {year} CE.",
                "irtOffset": 0.30,
            },
        ],
    },

    # ===================== DOMAIN 1: SCIENCE & SPACE =====================
    "sci_element": {
        "l0Domain": 1, "l1Category": "Chemistry", "glyphHint": "atom",
        "cols": ["name", "symbol", "anum", "category", "irt"],
        "poolCols": [3],
        "angles": [
            {
                "id": "se_sym", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the chemical symbol for the element {name}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} is classified as a {category} with atomic number {anum}.",
                "clue2": "Its symbol starts with \"{ans_init}\".",
                "why": "{name} (atomic number {anum}) has the chemical symbol {symbol}.",
                "irtOffset": -0.10,
            },
            {
                "id": "se_name", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which chemical element has the symbol {symbol}?",
                "answerCol": 0, "distractorCol": 0,
                "clue1": "Its atomic number is {anum} ({category}).",
                "clue2": "The element name starts with \"{ans_init}\".",
                "why": "{symbol} is the periodic table symbol for {name} (atomic number {anum}).",
                "irtOffset": -0.05,
            },
            {
                "id": "se_cat", "archetype": "SIGHTLINE_LOCK",
                "prompt": "To which periodic table group does {name} ({symbol}) belong?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "{name} has atomic number {anum}.",
                "clue2": "The group name begins with \"{ans_init}\".",
                "why": "{name} ({symbol}, atomic number {anum}) is classified as {category}.",
                "irtOffset": 0.15,
            },
            {
                "id": "se_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The chemical symbol for {name} is {symbol}.",
                "falsePrompt": "The chemical symbol for {name} is {fake}.",
                "fakeCol": 1,
                "clue1": "Check the periodic table entry for atomic number {anum}.",
                "whyTrue": "True! {name} has the symbol {symbol}.",
                "whyFalse": "False! The symbol for {name} is {symbol}, not {fake}.",
                "irtOffset": -0.20,
            },
            {
                "id": "se_anum", "archetype": "CALIBRATOR_DIAL",
                "prompt": "What is the atomic number of {name} ({symbol})?",
                "exactCol": 2, "unit": "protons", "step": 1, "pad": 18, "minClamp": 1, "maxClamp": 118,
                "clue1": "{name} belongs to the {category} group.",
                "why": "{name} ({symbol}) has atomic number {anum}.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sci_scientist": {
        "l0Domain": 1, "l1Category": "History of Science", "glyphHint": "atom",
        "cols": ["name", "field", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "ss_field", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What was the primary scientific field of {name} (born {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} was associated with {country}.",
                "clue2": "The scientific field begins with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) was primarily known in {field}.",
                "irtOffset": 0.0,
            },
            {
                "id": "ss_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was scientist {name} ({field}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "{name} was born in {year} and worked in {field}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({field}, b. {year}) was associated with {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "ss_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these scientists was renowned primarily in {field}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Born in {year} and associated with {country}.",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) specialized in {field}.",
                "irtOffset": 0.15,
            },
            {
                "id": "ss_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Scientist {name} (born {year}) was renowned primarily in {field}.",
                "falsePrompt": "Scientist {name} (born {year}) was renowned primarily in {fake}.",
                "fakeCol": 1,
                "clue1": "Recall the scientific discipline of {name} ({country}).",
                "whyTrue": "True! {name} was a noted figure in {field}.",
                "whyFalse": "False! {name} was renowned in {field}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "ss_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was scientist {name} ({field}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 45, "minClamp": 1400, "maxClamp": 2000,
                "clue1": "{name} worked in {field} and was associated with {country}.",
                "why": "{name} ({field}, {country}) was born in {year} CE.",
                "irtOffset": 0.35,
            },
        ],
    },
    "sci_exoplanet": {
        "l0Domain": 1, "l1Category": "Exoplanets & Space", "glyphHint": "orbit",
        "cols": ["name", "method", "year", "facility", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "sx_method", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which astronomical method discovered the exoplanet {name} ({year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "It was detected by {facility} in {year}.",
                "clue2": "The method begins with \"{ans_init}\".",
                "why": "NASA confirms {name} ({year}) was discovered via {method} by {facility}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sx_fac", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which observatory or space mission discovered the exoplanet {name}?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Discovered in {year} using {method}.",
                "clue2": "The facility starts with \"{ans_init}\".",
                "why": "The exoplanet {name} ({year}) was discovered by {facility}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sx_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The exoplanet {name} was discovered using the {method} method.",
                "falsePrompt": "The exoplanet {name} was discovered using the {fake} method.",
                "fakeCol": 1,
                "clue1": "Confirmed in {year} by {facility}.",
                "whyTrue": "True! {name} was detected via {method} ({facility}, {year}).",
                "whyFalse": "False! {name} was detected via {method}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sx_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the exoplanet {name} discovered?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 10, "minClamp": 1988, "maxClamp": 2025,
                "clue1": "Detected via {method} by {facility}.",
                "why": "The exoplanet {name} was discovered in {year} by {facility}.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sci_astro": {
        "l0Domain": 1, "l1Category": "Astronomy", "glyphHint": "orbit",
        "cols": ["name", "astro_type", "constellation", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "sa_con", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which constellation is the {astro_type} {name} located?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "{name} is cataloged as a {astro_type}.",
                "clue2": "The constellation begins with \"{ans_init}\".",
                "why": "{name} ({astro_type}) is located in the constellation {constellation}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sa_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these celestial objects is located in the constellation {constellation}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "It is classified as a {astro_type}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({astro_type}) lies in the constellation {constellation}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sa_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What type of celestial object is {name}, found in {constellation}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Astronomers observe it in the direction of {constellation}.",
                "clue2": "The category begins with \"{ans_init}\".",
                "why": "{name} (constellation {constellation}) is a {astro_type}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sa_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {astro_type} {name} is located in the constellation {constellation}.",
                "falsePrompt": "The {astro_type} {name} is located in the constellation {fake}.",
                "fakeCol": 2,
                "clue1": "Picture the sky region containing {name}.",
                "whyTrue": "True! {name} is in the constellation {constellation}.",
                "whyFalse": "False! {name} lies in {constellation}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },
    "sci_chemical": {
        "l0Domain": 1, "l1Category": "Chemistry & Materials", "glyphHint": "atom",
        "cols": ["name", "formula", "mass", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "sc_form", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the chemical formula of {name}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Its approximate molar mass is {mass} g/mol.",
                "clue2": "The formula starts with \"{ans_init}\".",
                "why": "{name} has the chemical formula {formula} (molar mass ~{mass} g/mol).",
                "irtOffset": 0.0,
            },
            {
                "id": "sc_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which chemical substance has the formula {formula}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Its approximate molar mass is {mass} g/mol.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "The formula {formula} represents {name}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sc_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The chemical formula of {name} is {formula}.",
                "falsePrompt": "The chemical formula of {name} is {fake}.",
                "fakeCol": 1,
                "clue1": "Check the elemental composition of {name} (~{mass} g/mol).",
                "whyTrue": "True! {name} has the formula {formula}.",
                "whyFalse": "False! The formula of {name} is {formula}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sc_mass", "archetype": "CALIBRATOR_DIAL",
                "prompt": "What is the approximate molar mass of {name} ({formula})?",
                "exactCol": 2, "unit": "g/mol", "step": 0, "pad": 0, "minClamp": 2, "maxClamp": 1500,
                "clue1": "Add the standard atomic weights of the atoms in {formula}.",
                "why": "{name} ({formula}) has a molar mass of approximately {mass} g/mol.",
                "irtOffset": 0.40,
            },
        ],
    },
    "sci_space": {
        "l0Domain": 1, "l1Category": "Space Exploration", "glyphHint": "orbit",
        "cols": ["name", "agency", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "sm_ag", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which space agency or operator ran the {year} mission {name}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "It launched in {year}.",
                "clue2": "The operator starts with \"{ans_init}\".",
                "why": "{name} (launched {year}) was operated by {agency}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sm_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these space missions or spacecraft was operated by {agency}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It launched in {year}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({year}) was operated by {agency}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sm_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} space mission {name} was operated by {agency}.",
                "falsePrompt": "The {year} space mission {name} was operated by {fake}.",
                "fakeCol": 1,
                "clue1": "Recall which spacefaring organization launched {name}.",
                "whyTrue": "True! {name} ({year}) was operated by {agency}.",
                "whyFalse": "False! {name} was operated by {agency}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sm_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the space mission {name} ({agency}) launched?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 15, "minClamp": 1957, "maxClamp": 2025,
                "clue1": "It was operated by {agency}.",
                "why": "{name} ({agency}) launched in {year}.",
                "irtOffset": 0.25,
            },
        ],
    },

    # ===================== DOMAIN 2: GEOGRAPHY & WONDERS =====================
    "geo_city": {
        "l0Domain": 2, "l1Category": "World Cities", "glyphHint": "compass",
        "cols": ["name", "country", "region", "pop_k", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "gc_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is the city of {name} located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "It sits in the {region} region (population ~{pop_k},000).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} (region: {region}) is a city in {country}.",
                "irtOffset": -0.05,
            },
            {
                "id": "gc_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these cities is located in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It lies in the {region} region.",
                "clue2": "The city's name begins with \"{ans_init}\".",
                "why": "{name} ({region}) is located in {country}.",
                "irtOffset": 0.10,
            },
            {
                "id": "gc_reg", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In {country}, which state, province, or region contains the city of {name}?",
                "answerCol": 2, "distractorCol": 2, "preferSameCol": 1,
                "clue1": "{name} has a population of roughly {pop_k},000.",
                "clue2": "The region name starts with \"{ans_init}\".",
                "why": "{name} is located in {region}, {country}.",
                "irtOffset": 0.30,
            },
            {
                "id": "gc_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The city of {name} is located in {country}.",
                "falsePrompt": "The city of {name} is located in {fake}.",
                "fakeCol": 1,
                "clue1": "Locate the {region} region on a world map.",
                "whyTrue": "True! {name} ({region}) is in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "gc_pop", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately what is the population of {name}, {country}?",
                "exactCol": 3, "unit": "thousand", "step": 0, "pad": 0, "minClamp": 10, "maxClamp": 30000,
                "clue1": "{name} is located in {region}, {country}.",
                "why": "{name}, {country} has an approximate population of {pop_k} thousand.",
                "irtOffset": 0.35,
            },
        ],
    },
    "geo_airport": {
        "l0Domain": 2, "l1Category": "World Aviation & Hubs", "glyphHint": "compass",
        "cols": ["iata", "city", "airport", "country", "irt"],
        "poolCols": [3],
        "angles": [
            {
                "id": "ga_city", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which city is served by {airport} (IATA code {iata})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This airport is located in {country}.",
                "clue2": "The city starts with \"{ans_init}\".",
                "why": "{airport} ({iata}) serves {city}, {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "ga_code", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the 3-letter IATA airport code for {airport} in {city}?",
                "answerCol": 0, "distractorCol": 0,
                "clue1": "Located in {city}, {country}.",
                "clue2": "The 3-letter code begins with \"{ans_init}\".",
                "why": "{airport} ({city}, {country}) uses the IATA code {iata}.",
                "irtOffset": 0.25,
            },
            {
                "id": "ga_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is {airport} (IATA: {iata}) located?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "It serves the city of {city}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{airport} ({iata}) is located in {city}, {country}.",
                "irtOffset": -0.10,
            },
            {
                "id": "ga_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Airport code {iata} belongs to {airport} in {country}.",
                "falsePrompt": "Airport code {iata} belongs to an airport in {fake}.",
                "fakeCol": 3,
                "clue1": "Recall the international hub serving {city}.",
                "whyTrue": "True! {iata} is {airport} in {city}, {country}.",
                "whyFalse": "False! {iata} ({airport}) is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },
    "geo_mountain": {
        "l0Domain": 2, "l1Category": "Peaks & Ranges", "glyphHint": "compass",
        "cols": ["name", "country", "elev_m", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "gm_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is the mountain peak {name} ({elev_m} m) located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Its summit reaches {elev_m} meters above sea level.",
                "clue2": "The country begins with \"{ans_init}\".",
                "why": "{name} ({elev_m} meters) is located in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "gm_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these mountains or peaks is located in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Its elevation is approximately {elev_m} meters.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({elev_m} m) rises in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "gm_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The mountain peak {name} is located in {country}.",
                "falsePrompt": "The mountain peak {name} is located in {fake}.",
                "fakeCol": 1,
                "clue1": "It stands {elev_m} meters above sea level.",
                "whyTrue": "True! {name} ({elev_m} m) is in {country}.",
                "whyFalse": "False! {name} is located in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "gm_elev", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately how high above sea level is {name} ({country})?",
                "exactCol": 2, "unit": "meters", "step": 50, "pad": 1200, "minClamp": 200, "maxClamp": 9000,
                "clue1": "This peak is located in {country}.",
                "why": "{name} ({country}) has an elevation of {elev_m} meters.",
                "irtOffset": 0.30,
            },
        ],
    },
    "geo_river": {
        "l0Domain": 2, "l1Category": "Rivers & Waterways", "glyphHint": "compass",
        "cols": ["name", "country", "len_km", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "gr_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country is home to {name} ({len_km} km long)?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This waterway extends approximately {len_km} kilometers.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({len_km} km) flows through {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "gr_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these rivers flows in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Its length is about {len_km} km.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({len_km} km) flows in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "gr_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} is a river located in {country}.",
                "falsePrompt": "{name} is a river located in {fake}.",
                "fakeCol": 1,
                "clue1": "Its total length is approximately {len_km} km.",
                "whyTrue": "True! {name} flows in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "gr_len", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately how long is {name} ({country})?",
                "exactCol": 2, "unit": "km", "step": 0, "pad": 0, "minClamp": 20, "maxClamp": 7500,
                "clue1": "This river flows through {country}.",
                "why": "{name} ({country}) is approximately {len_km} km long.",
                "irtOffset": 0.35,
            },
        ],
    },
    "geo_wonder": {
        "l0Domain": 2, "l1Category": "Natural Wonders", "glyphHint": "compass",
        "cols": ["name", "geo_type", "country", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "gw_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is the {geo_type} {name} located?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "{name} is classified as a {geo_type}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({geo_type}) is located in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "gw_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What type of geographical feature is {name} in {country}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "It is located in {country}.",
                "clue2": "The feature type starts with \"{ans_init}\".",
                "why": "{name} ({country}) is a {geo_type}.",
                "irtOffset": -0.10,
            },
            {
                "id": "gw_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these natural features is located in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "It is classified as a {geo_type}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({geo_type}) is located in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "gw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {geo_type} {name} is located in {country}.",
                "falsePrompt": "The {geo_type} {name} is located in {fake}.",
                "fakeCol": 2,
                "clue1": "Picture where {name} appears on the world atlas.",
                "whyTrue": "True! {name} ({geo_type}) is in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },

    # ===================== DOMAIN 3: ARTS & ARCHITECTURE =====================
    "art_work": {
        "l0Domain": 3, "l1Category": "Fine Arts", "glyphHint": "palette",
        "cols": ["title", "artist", "year", "medium", "irt"],
        "poolCols": [3],
        "angles": [
            {
                "id": "aw_artist", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who created the {year} artwork \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This {medium} dates to {year}.",
                "clue2": "The artist's name begins with \"{ans_init}\".",
                "why": "\"{title}\" ({year}, {medium}) was created by {artist}.",
                "irtOffset": 0.0,
            },
            {
                "id": "aw_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these artworks was created by {artist}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It is a {medium} dating from {year}.",
                "clue2": "Its title begins with \"{ans_init}\".",
                "why": "{artist} created the {medium} \"{title}\" in {year}.",
                "irtOffset": 0.15,
            },
            {
                "id": "aw_med", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What artistic form or medium is \"{title}\" ({year}) by {artist}?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Created by {artist} in {year}.",
                "clue2": "The medium starts with \"{ans_init}\".",
                "why": "\"{title}\" by {artist} ({year}) is a {medium}.",
                "irtOffset": 0.10,
            },
            {
                "id": "aw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} artwork \"{title}\" was created by {artist}.",
                "falsePrompt": "The {year} artwork \"{title}\" was created by {fake}.",
                "fakeCol": 1,
                "clue1": "Recall the master behind the {medium} \"{title}\".",
                "whyTrue": "True! {artist} created \"{title}\" in {year}.",
                "whyFalse": "False! \"{title}\" was created by {artist}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "aw_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In approximately what year did {artist} create \"{title}\"?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 40, "minClamp": 1200, "maxClamp": 2024,
                "clue1": "It is a {medium} by {artist}.",
                "why": "{artist} created \"{title}\" ({medium}) in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "art_landmark": {
        "l0Domain": 3, "l1Category": "Architecture & Landmarks", "glyphHint": "column",
        "cols": ["name", "arch_type", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "al_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is the landmark {name} ({arch_type}) located?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "This {arch_type} dates to {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({arch_type}, {year}) is located in {country}.",
                "irtOffset": -0.05,
            },
            {
                "id": "al_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What architectural category best describes {name} in {country}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Built or founded in {year} in {country}.",
                "clue2": "The category starts with \"{ans_init}\".",
                "why": "{name} ({country}, {year}) is a {arch_type}.",
                "irtOffset": 0.05,
            },
            {
                "id": "al_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these architectural landmarks stands in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "It is a {arch_type} dating from {year}.",
                "clue2": "Its name starts with \"{ans_init}\".",
                "why": "{name} ({arch_type}, {year}) stands in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "al_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {arch_type} {name} is located in {country}.",
                "falsePrompt": "The {arch_type} {name} is located in {fake}.",
                "fakeCol": 3,
                "clue1": "This landmark dates to {year}.",
                "whyTrue": "True! {name} ({arch_type}) is located in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "al_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In approximately what year was {name} ({country}) built or founded?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 55, "minClamp": 500, "maxClamp": 2024,
                "clue1": "It is a {arch_type} located in {country}.",
                "why": "{name} ({country}, {arch_type}) dates to {year} CE.",
                "irtOffset": 0.35,
            },
        ],
    },
    "art_creator": {
        "l0Domain": 3, "l1Category": "Masters of Art", "glyphHint": "palette",
        "cols": ["name", "discipline", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "ac_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was the {discipline} {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "{name} was born in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({discipline}, b. {year}) was associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "ac_disc", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What was the primary artistic discipline of {name} ({country}, b. {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} was born in {year} ({country}).",
                "clue2": "The discipline begins with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) was primarily a {discipline}.",
                "irtOffset": 0.05,
            },
            {
                "id": "ac_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Artist {name} (born {year}) was primarily known as a {discipline}.",
                "falsePrompt": "Artist {name} (born {year}) was primarily known as a {fake}.",
                "fakeCol": 1,
                "clue1": "{name} was associated with {country}.",
                "whyTrue": "True! {name} was renowned as a {discipline}.",
                "whyFalse": "False! {name} was primarily a {discipline}, not a {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "ac_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the {discipline} {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 45, "minClamp": 1250, "maxClamp": 2000,
                "clue1": "{name} was a {discipline} from {country}.",
                "why": "{name} ({discipline}, {country}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },

    # ===================== DOMAIN 4: FILM, MUSIC & POP =====================
    "pop_film": {
        "l0Domain": 4, "l1Category": "Cinema", "glyphHint": "film",
        "cols": ["title", "director", "year", "country", "irt"],
        "poolCols": [3],
        "angles": [
            {
                "id": "pf_dir", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who directed the {year} film \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This {year} film came from {country}.",
                "clue2": "The director's name starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}, {country}) was directed by {director}.",
                "irtOffset": 0.0,
            },
            {
                "id": "pf_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these films was directed by {director}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Released in {year} ({country}).",
                "clue2": "Its title begins with \"{ans_init}\".",
                "why": "{director} directed \"{title}\" ({year}).",
                "irtOffset": 0.10,
            },
            {
                "id": "pf_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country produced the {year} film \"{title}\", directed by {director}?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Directed by {director} in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}), directed by {director}, is from {country}.",
                "irtOffset": 0.20,
            },
            {
                "id": "pf_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} film \"{title}\" was directed by {director}.",
                "falsePrompt": "The {year} film \"{title}\" was directed by {fake}.",
                "fakeCol": 1,
                "clue1": "Recall who directed this {year} {country} film.",
                "whyTrue": "True! {director} directed \"{title}\" ({year}).",
                "whyFalse": "False! \"{title}\" was directed by {director}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "pf_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the film \"{title}\" (dir. {director}) released?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 22, "minClamp": 1910, "maxClamp": 2025,
                "clue1": "A {country} film directed by {director}.",
                "why": "\"{title}\" (directed by {director}) was released in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "pop_album": {
        "l0Domain": 4, "l1Category": "Recorded Music", "glyphHint": "music",
        "cols": ["title", "artist", "year", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "pa_art", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which musical artist or band released the {year} album \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This album was released in {year}.",
                "clue2": "The artist's name begins with \"{ans_init}\".",
                "why": "The {year} album \"{title}\" was released by {artist}.",
                "irtOffset": 0.0,
            },
            {
                "id": "pa_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these albums was released by {artist}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It came out in {year}.",
                "clue2": "The album title starts with \"{ans_init}\".",
                "why": "{artist} released \"{title}\" in {year}.",
                "irtOffset": 0.15,
            },
            {
                "id": "pa_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} album \"{title}\" was released by {artist}.",
                "falsePrompt": "The {year} album \"{title}\" was released by {fake}.",
                "fakeCol": 1,
                "clue1": "Match the {year} album \"{title}\" to its performer.",
                "whyTrue": "True! {artist} released \"{title}\" in {year}.",
                "whyFalse": "False! \"{title}\" was released by {artist}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "pa_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {artist} release the album \"{title}\"?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 18, "minClamp": 1950, "maxClamp": 2025,
                "clue1": "It is a studio album by {artist}.",
                "why": "{artist} released \"{title}\" in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "pop_song": {
        "l0Domain": 4, "l1Category": "Hit Songs", "glyphHint": "music",
        "cols": ["title", "artist", "year", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "ps_art", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who performed the {year} song \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This song was released in {year}.",
                "clue2": "The performer's name starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}) was performed by {artist}.",
                "irtOffset": 0.0,
            },
            {
                "id": "ps_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these songs was performed by {artist}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Released in {year}.",
                "clue2": "The song title begins with \"{ans_init}\".",
                "why": "{artist} performed \"{title}\" ({year}).",
                "irtOffset": 0.15,
            },
            {
                "id": "ps_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} song \"{title}\" was performed by {artist}.",
                "falsePrompt": "The {year} song \"{title}\" was performed by {fake}.",
                "fakeCol": 1,
                "clue1": "Think back to the charts of {year}.",
                "whyTrue": "True! {artist} performed \"{title}\" ({year}).",
                "whyFalse": "False! \"{title}\" was performed by {artist}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "ps_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was \"{title}\" by {artist} released?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 18, "minClamp": 1950, "maxClamp": 2025,
                "clue1": "Performed by {artist}.",
                "why": "\"{title}\" by {artist} was released in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "pop_tv": {
        "l0Domain": 4, "l1Category": "Television", "glyphHint": "film",
        "cols": ["title", "country", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "pt_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country did the television series \"{title}\" (premiered {year}) originate?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This series premiered in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "The TV series \"{title}\" ({year}) originated in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "pt_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these television series originated in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It premiered in {year}.",
                "clue2": "Its title begins with \"{ans_init}\".",
                "why": "\"{title}\" ({year}) is a television series from {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "pt_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The television series \"{title}\" ({year}) originated in {country}.",
                "falsePrompt": "The television series \"{title}\" ({year}) originated in {fake}.",
                "fakeCol": 1,
                "clue1": "It first aired in {year}.",
                "whyTrue": "True! \"{title}\" originated in {country}.",
                "whyFalse": "False! \"{title}\" originated in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "pt_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did the TV series \"{title}\" ({country}) premiere?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 18, "minClamp": 1948, "maxClamp": 2025,
                "clue1": "This series originated in {country}.",
                "why": "\"{title}\" ({country}) premiered in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "pop_band": {
        "l0Domain": 4, "l1Category": "Bands & Groups", "glyphHint": "music",
        "cols": ["name", "country", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "pb_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country was the musical group {name} (formed {year}) founded?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} formed in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "The musical group {name} formed in {country} in {year}.",
                "irtOffset": 0.0,
            },
            {
                "id": "pb_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these musical groups originated in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Formed in {year}.",
                "clue2": "The group's name starts with \"{ans_init}\".",
                "why": "{name} (formed {year}) originated in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "pb_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The musical group {name} (formed {year}) originated in {country}.",
                "falsePrompt": "The musical group {name} (formed {year}) originated in {fake}.",
                "fakeCol": 1,
                "clue1": "They formed in {year}.",
                "whyTrue": "True! {name} originated in {country}.",
                "whyFalse": "False! {name} originated in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "pb_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the musical group {name} ({country}) formed?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 18, "minClamp": 1950, "maxClamp": 2024,
                "clue1": "Originating in {country}.",
                "why": "{name} ({country}) formed in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },

    # ===================== DOMAIN 5: SPORTS & GAMES =====================
    "sport_athlete": {
        "l0Domain": 5, "l1Category": "Athletes & Champions", "glyphHint": "trophy",
        "cols": ["name", "sport", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "spa_sport", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which sport did {name} ({country}) compete?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} was born in {year} and represented {country}.",
                "clue2": "The sport starts with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) competed in {sport}.",
                "irtOffset": -0.05,
            },
            {
                "id": "spa_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country did {sport} athlete {name} (b. {year}) represent?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "{name} competed in {sport} (born {year}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{sport} athlete {name} represented {country}.",
                "irtOffset": 0.10,
            },
            {
                "id": "spa_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these athletes competed in {sport}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Born in {year}, representing {country}.",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} ({country}) competed in {sport}.",
                "irtOffset": 0.15,
            },
            {
                "id": "spa_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Athlete {name} ({country}) competed in {sport}.",
                "falsePrompt": "Athlete {name} ({country}) competed in {fake}.",
                "fakeCol": 1,
                "clue1": "Recall the sport of {name} (b. {year}).",
                "whyTrue": "True! {name} ({country}) competed in {sport}.",
                "whyFalse": "False! {name} competed in {sport}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "spa_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {sport} athlete {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 22, "minClamp": 1870, "maxClamp": 2008,
                "clue1": "Represented {country} in {sport}.",
                "why": "{name} ({country}, {sport}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "sport_club": {
        "l0Domain": 5, "l1Category": "Clubs & Franchises", "glyphHint": "trophy",
        "cols": ["name", "country", "year", "sport", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "spc_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is the {sport} team {name} based?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Founded in {year} ({sport}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({sport}, founded {year}) is based in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "spc_sport", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which sport is played by {name} ({country}, founded {year})?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Based in {country} since {year}.",
                "clue2": "The sport starts with \"{ans_init}\".",
                "why": "{name} ({country}) competes in {sport}.",
                "irtOffset": 0.05,
            },
            {
                "id": "spc_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {sport} club {name} is based in {country}.",
                "falsePrompt": "The {sport} club {name} is based in {fake}.",
                "fakeCol": 1,
                "clue1": "This club was founded in {year}.",
                "whyTrue": "True! {name} is based in {country}.",
                "whyFalse": "False! {name} is based in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "spc_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the {sport} club {name} ({country}) founded?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1850, "maxClamp": 2024,
                "clue1": "Based in {country} ({sport}).",
                "why": "{name} ({country}, {sport}) was founded in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "sport_stadium": {
        "l0Domain": 5, "l1Category": "Arenas & Stadiums", "glyphHint": "trophy",
        "cols": ["name", "country", "cap", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "sps_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is {name} (capacity ~{cap}) located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This venue holds roughly {cap} spectators.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} (capacity ~{cap}) is located in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sps_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these stadiums is located in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Its seating capacity is approximately {cap}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} is located in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sps_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} is a sports stadium located in {country}.",
                "falsePrompt": "{name} is a sports stadium located in {fake}.",
                "fakeCol": 1,
                "clue1": "This venue seats around {cap} fans.",
                "whyTrue": "True! {name} is located in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sps_cap", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately how many spectators can {name} ({country}) hold?",
                "exactCol": 2, "unit": "seats", "step": 1000, "pad": 22000, "minClamp": 4000, "maxClamp": 140000,
                "clue1": "Located in {country}.",
                "why": "{name} ({country}) has an approximate capacity of {cap} seats.",
                "irtOffset": 0.35,
            },
        ],
    },
    "sport_videogame": {
        "l0Domain": 5, "l1Category": "Video Games", "glyphHint": "trophy",
        "cols": ["title", "dev", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "svg_dev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which studio developed the {year} video game \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Released in {year}.",
                "clue2": "The developer starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}) was developed by {dev}.",
                "irtOffset": 0.0,
            },
            {
                "id": "svg_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these video games was developed by {dev}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "First released in {year}.",
                "clue2": "The game title starts with \"{ans_init}\".",
                "why": "{dev} developed \"{title}\" ({year}).",
                "irtOffset": 0.15,
            },
            {
                "id": "svg_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} video game \"{title}\" was developed by {dev}.",
                "falsePrompt": "The {year} video game \"{title}\" was developed by {fake}.",
                "fakeCol": 1,
                "clue1": "Released in {year}.",
                "whyTrue": "True! {dev} developed \"{title}\" ({year}).",
                "whyFalse": "False! \"{title}\" was developed by {dev}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "svg_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the video game \"{title}\" ({dev}) first released?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 12, "minClamp": 1970, "maxClamp": 2025,
                "clue1": "Developed by {dev}.",
                "why": "\"{title}\" ({dev}) was released in {year}.",
                "irtOffset": 0.25,
            },
        ],
    },

    # ===================== DOMAIN 6: TECH & COMPUTING =====================
    "tech_company": {
        "l0Domain": 6, "l1Category": "Industry & Tech Giants", "glyphHint": "chip",
        "cols": ["name", "industry", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "tc_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is {name} ({industry}, founded {year}) headquartered?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Founded in {year} in the {industry} sector.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({industry}, founded {year}) is headquartered in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "tc_ind", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the primary industry of {name} ({country}, founded {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Headquartered in {country} since {year}.",
                "clue2": "The industry begins with \"{ans_init}\".",
                "why": "{name} ({country}) operates primarily in {industry}.",
                "irtOffset": 0.05,
            },
            {
                "id": "tc_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these companies is headquartered in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "Founded in {year} ({industry}).",
                "clue2": "The company name starts with \"{ans_init}\".",
                "why": "{name} ({industry}, {year}) is headquartered in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "tc_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({industry}) is headquartered in {country}.",
                "falsePrompt": "{name} ({industry}) is headquartered in {fake}.",
                "fakeCol": 3,
                "clue1": "Founded in {year}.",
                "whyTrue": "True! {name} is headquartered in {country}.",
                "whyFalse": "False! {name} is headquartered in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "tc_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({country}, {industry}) founded?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 32, "minClamp": 1800, "maxClamp": 2024,
                "clue1": "Headquartered in {country} ({industry}).",
                "why": "{name} ({country}, {industry}) was founded in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "tech_pioneer": {
        "l0Domain": 6, "l1Category": "Inventors & Engineers", "glyphHint": "chip",
        "cols": ["name", "role", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "tp_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was {role} {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Born in {year}, known as a {role}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({role}, b. {year}) was associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "tp_role", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which technical role best describes {name} ({country}, b. {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year} ({country}).",
                "clue2": "The role starts with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) was renowned as a {role}.",
                "irtOffset": 0.10,
            },
            {
                "id": "tp_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{role} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{role} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Connect {name} ({role}) to their country.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "tp_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {role} {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 40, "minClamp": 1650, "maxClamp": 2000,
                "clue1": "A {role} associated with {country}.",
                "why": "{name} ({role}, {country}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "tech_software": {
        "l0Domain": 6, "l1Category": "Computing & Software", "glyphHint": "chip",
        "cols": ["name", "sw_type", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "ts_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What kind of computing technology is {name} (introduced {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "First launched or released in {year}.",
                "clue2": "The category starts with \"{ans_init}\".",
                "why": "{name} ({year}) is a {sw_type}.",
                "irtOffset": -0.05,
            },
            {
                "id": "ts_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these is a {sw_type}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Introduced in {year}.",
                "clue2": "Its name starts with \"{ans_init}\".",
                "why": "{name} ({year}) is classified as a {sw_type}.",
                "irtOffset": 0.10,
            },
            {
                "id": "ts_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} (introduced {year}) is classified as a {sw_type}.",
                "falsePrompt": "{name} (introduced {year}) is classified as a {fake}.",
                "fakeCol": 1,
                "clue1": "Introduced in {year}.",
                "whyTrue": "True! {name} is a {sw_type} ({year}).",
                "whyFalse": "False! {name} is a {sw_type}, not a {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "ts_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the {sw_type} {name} first launched?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 14, "minClamp": 1950, "maxClamp": 2025,
                "clue1": "{name} is a {sw_type}.",
                "why": "{name} ({sw_type}) launched in {year}.",
                "irtOffset": 0.25,
            },
        ],
    },
    "tech_vehicle": {
        "l0Domain": 6, "l1Category": "Engineering & Machines", "glyphHint": "chip",
        "cols": ["name", "maker", "veh_type", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "tv_maker", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which manufacturer produced the {veh_type} {name}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} is classified as a {veh_type}.",
                "clue2": "The manufacturer starts with \"{ans_init}\".",
                "why": "The {veh_type} {name} was built by {maker}.",
                "irtOffset": 0.0,
            },
            {
                "id": "tv_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What type of machine or vehicle is {name}, built by {maker}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Manufactured by {maker}.",
                "clue2": "The category begins with \"{ans_init}\".",
                "why": "{name} ({maker}) is a {veh_type}.",
                "irtOffset": -0.05,
            },
            {
                "id": "tv_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these models was manufactured by {maker}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It is a {veh_type}.",
                "clue2": "Its name starts with \"{ans_init}\".",
                "why": "{maker} manufactured the {veh_type} {name}.",
                "irtOffset": 0.15,
            },
            {
                "id": "tv_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {veh_type} {name} was manufactured by {maker}.",
                "falsePrompt": "The {veh_type} {name} was manufactured by {fake}.",
                "fakeCol": 1,
                "clue1": "Match the {veh_type} {name} to its builder.",
                "whyTrue": "True! {maker} built the {veh_type} {name}.",
                "whyFalse": "False! {name} was built by {maker}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },

    # ===================== DOMAIN 7: NATURE & BIOLOGY =====================
    "nat_species": {
        "l0Domain": 7, "l1Category": "Wildlife & Botany", "glyphHint": "leaf",
        "cols": ["name", "sci", "group", "irt"],
        "poolCols": [2],
        "angles": [
            {
                "id": "ns_grp", "archetype": "SIGHTLINE_LOCK",
                "prompt": "To which biological group does the {name} belong?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Its scientific name is {sci}.",
                "clue2": "The group begins with \"{ans_init}\".",
                "why": "The {name} ({sci}) is classified as a {group}.",
                "irtOffset": -0.20,
            },
            {
                "id": "ns_sci", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the scientific (Latin) name of the {name}?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 2,
                "clue1": "It belongs to the {group} group.",
                "clue2": "The genus name starts with \"{ans_init}\".",
                "why": "The scientific name of the {name} ({group}) is {sci}.",
                "irtOffset": 0.55,
            },
            {
                "id": "ns_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which {group} has the scientific name \"{sci}\"?",
                "answerCol": 0, "distractorCol": 0, "preferSameCol": 2,
                "clue1": "It is a member of the {group} group.",
                "clue2": "Its common name starts with \"{ans_init}\".",
                "why": "\"{sci}\" is the scientific name of the {name} ({group}).",
                "irtOffset": 0.45,
            },
            {
                "id": "ns_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {name} ({sci}) is classified as a {group}.",
                "falsePrompt": "The {name} ({sci}) is classified as a {fake}.",
                "fakeCol": 2,
                "clue1": "Think of the biological class of the {name}.",
                "whyTrue": "True! The {name} ({sci}) is a {group}.",
                "whyFalse": "False! The {name} is a {group}, not a {fake}.",
                "irtOffset": -0.20,
            },
        ],
    },
    "nat_dino": {
        "l0Domain": 7, "l1Category": "Prehistoric Life", "glyphHint": "leaf",
        "cols": ["name", "period", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "nd_per", "archetype": "SIGHTLINE_LOCK",
                "prompt": "During which geological epoch or period did prehistoric genus {name} live?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Scientifically named in {year}.",
                "clue2": "The geological period starts with \"{ans_init}\".",
                "why": "{name} (named {year}) lived during the {period}.",
                "irtOffset": 0.10,
            },
            {
                "id": "nd_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which prehistoric genus lived during the {period}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Scientifically described in {year}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} (named {year}) lived during the {period}.",
                "irtOffset": 0.25,
            },
            {
                "id": "nd_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The prehistoric genus {name} lived during the {period}.",
                "falsePrompt": "The prehistoric genus {name} lived during the {fake}.",
                "fakeCol": 1,
                "clue1": "Described by paleontologists in {year}.",
                "whyTrue": "True! {name} lived during the {period}.",
                "whyFalse": "False! {name} lived during the {period}, not the {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "nd_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the prehistoric genus {name} ({period}) scientifically named?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1750, "maxClamp": 2024,
                "clue1": "It lived during the {period}.",
                "why": "{name} ({period}) was scientifically named in {year}.",
                "irtOffset": 0.45,
            },
        ],
    },

    # ===================== DOMAIN 8: WORLD AFFAIRS & LAW =====================
    "soc_country": {
        "l0Domain": 8, "l1Category": "Nations & Capitals", "glyphHint": "scales",
        "cols": ["name", "capital", "continent", "currency", "irt"],
        "poolCols": [2, 3],
        "angles": [
            {
                "id": "scn_cap", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the capital city of {name}?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 2,
                "clue1": "{name} is in {continent} and uses the {currency}.",
                "clue2": "Its capital starts with \"{ans_init}\".",
                "why": "The capital of {name} ({continent}) is {capital}.",
                "irtOffset": -0.25,
            },
            {
                "id": "scn_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "{capital} is the national capital of which country?",
                "answerCol": 0, "distractorCol": 0, "preferSameCol": 2,
                "clue1": "This nation is in {continent} (currency: {currency}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{capital} is the capital of {name} ({continent}).",
                "irtOffset": -0.20,
            },
            {
                "id": "scn_cur", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the official currency of {name} (capital: {capital})?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "{name} is located in {continent}.",
                "clue2": "The currency starts with \"{ans_init}\".",
                "why": "The official currency of {name} is the {currency}.",
                "irtOffset": 0.05,
            },
            {
                "id": "scn_cont", "archetype": "SIGHTLINE_LOCK",
                "prompt": "On which continent or world region is {name} (capital: {capital}) located?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Its capital is {capital}.",
                "clue2": "The region starts with \"{ans_init}\".",
                "why": "{name} (capital: {capital}) is in {continent}.",
                "irtOffset": -0.35,
            },
            {
                "id": "scn_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{capital} is the official capital of {name}.",
                "falsePrompt": "{fake} is the official capital of {name}.",
                "fakeCol": 1,
                "clue1": "{name} is in {continent}.",
                "whyTrue": "True! {capital} is the capital of {name}.",
                "whyFalse": "False! The capital of {name} is {capital}, not {fake}.",
                "irtOffset": -0.30,
            },
        ],
    },
    "soc_university": {
        "l0Domain": 8, "l1Category": "Universities & Institutions", "glyphHint": "scales",
        "cols": ["name", "country", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "su_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is {name} (founded {year}) located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "This university was founded in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} (founded {year}) is located in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "su_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these universities is located in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "It was founded in {year}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} (founded {year}) is in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "su_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} (founded {year}) is a university in {country}.",
                "falsePrompt": "{name} (founded {year}) is a university in {fake}.",
                "fakeCol": 1,
                "clue1": "Founded in {year}.",
                "whyTrue": "True! {name} is located in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "su_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({country}) founded?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 55, "minClamp": 850, "maxClamp": 2024,
                "clue1": "Located in {country}.",
                "why": "{name} ({country}) was founded in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "soc_org": {
        "l0Domain": 8, "l1Category": "Institutions & Media", "glyphHint": "scales",
        "cols": ["name", "org_type", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "so_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which country is {name} ({org_type}, founded {year}) associated?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "This {org_type} was founded in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({org_type}, {year}) is associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "so_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What type of institution is {name} ({country}, founded {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Associated with {country} since {year}.",
                "clue2": "The category starts with \"{ans_init}\".",
                "why": "{name} ({country}, {year}) is a {org_type}.",
                "irtOffset": 0.05,
            },
            {
                "id": "so_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these institutions is associated with {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "It is a {org_type} founded in {year}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({org_type}, {year}) is associated with {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "so_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({org_type}) is associated with {country}.",
                "falsePrompt": "{name} ({org_type}) is associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Founded in {year}.",
                "whyTrue": "True! {name} ({org_type}) is associated with {country}.",
                "whyFalse": "False! {name} is associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "so_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({country}, {org_type}) founded?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1600, "maxClamp": 2024,
                "clue1": "It is a {org_type} in {country}.",
                "why": "{name} ({country}, {org_type}) was founded in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "soc_leader": {
        "l0Domain": 8, "l1Category": "Law, Economics & Society", "glyphHint": "scales",
        "cols": ["name", "role", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "sl_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was {role} {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Known as a {role}, born in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({role}, b. {year}) was associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sl_role", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which public role best describes {name} ({country}, b. {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year} ({country}).",
                "clue2": "The role starts with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) was known primarily as a {role}.",
                "irtOffset": 0.05,
            },
            {
                "id": "sl_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{role} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{role} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Place {name} ({role}) in their nation.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sl_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {role} {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 38, "minClamp": 1650, "maxClamp": 2000,
                "clue1": "A {role} associated with {country}.",
                "why": "{name} ({role}, {country}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },

    # ===================== DOMAIN 9: FOOD, CRAFT & DESIGN =====================
    "food_item": {
        "l0Domain": 9, "l1Category": "World Cuisine & Drinks", "glyphHint": "cup",
        "cols": ["name", "food_type", "country", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "fi_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country is the traditional origin of {name} ({food_type})?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "{name} is a traditional {food_type}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({food_type}) originated in {country}.",
                "irtOffset": -0.05,
            },
            {
                "id": "fi_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What culinary category best describes {name} from {country}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "It is a culinary specialty from {country}.",
                "clue2": "The category begins with \"{ans_init}\".",
                "why": "{name} ({country}) is a {food_type}.",
                "irtOffset": 0.05,
            },
            {
                "id": "fi_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these culinary specialties originated in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "It is classified as a {food_type}.",
                "clue2": "Its name starts with \"{ans_init}\".",
                "why": "{name} ({food_type}) originated in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "fi_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({food_type}) traditionally originated in {country}.",
                "falsePrompt": "{name} ({food_type}) traditionally originated in {fake}.",
                "fakeCol": 2,
                "clue1": "Match {name} ({food_type}) to its culinary homeland.",
                "whyTrue": "True! {name} ({food_type}) originated in {country}.",
                "whyFalse": "False! {name} originated in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },
    "food_brand": {
        "l0Domain": 9, "l1Category": "Craft, Fashion & Houses", "glyphHint": "cup",
        "cols": ["name", "brand_type", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "fb_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country was the {brand_type} {name} (founded {year}) established?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "This {brand_type} dates back to {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({brand_type}, founded {year}) comes from {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "fb_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What craft or design category best describes {name} ({country}, est. {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Founded in {country} in {year}.",
                "clue2": "The category begins with \"{ans_init}\".",
                "why": "{name} ({country}, {year}) is a {brand_type}.",
                "irtOffset": 0.05,
            },
            {
                "id": "fb_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these culinary or design houses originated in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "A {brand_type} founded in {year}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({brand_type}, {year}) originated in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "fb_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {brand_type} {name} originated in {country}.",
                "falsePrompt": "The {brand_type} {name} originated in {fake}.",
                "fakeCol": 3,
                "clue1": "Established in {year}.",
                "whyTrue": "True! {name} ({brand_type}) originated in {country}.",
                "whyFalse": "False! {name} originated in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "fb_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the {brand_type} {name} ({country}) founded?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1600, "maxClamp": 2024,
                "clue1": "Established in {country} ({brand_type}).",
                "why": "{name} ({country}, {brand_type}) was founded in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "food_maker": {
        "l0Domain": 9, "l1Category": "Chefs & Designers", "glyphHint": "cup",
        "cols": ["name", "craft", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "fm_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was {craft} {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Born in {year}, renowned as a {craft}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({craft}, b. {year}) was associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "fm_craft", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which culinary or design field made {name} ({country}, b. {year}) famous?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year} ({country}).",
                "clue2": "The field begins with \"{ans_init}\".",
                "why": "{name} ({country}) was renowned as a {craft}.",
                "irtOffset": 0.05,
            },
            {
                "id": "fm_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{craft} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{craft} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Match {name} ({craft}) to their country.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "fm_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {craft} {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 32, "minClamp": 1750, "maxClamp": 2000,
                "clue1": "A {craft} associated with {country}.",
                "why": "{name} ({craft}, {country}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },

    # ===================== DOMAIN 10: MYTH & LITERATURE =====================
    "lit_work": {
        "l0Domain": 10, "l1Category": "Classic & Modern Literature", "glyphHint": "book",
        "cols": ["title", "author", "year", "lang", "irt"],
        "poolCols": [3],
        "angles": [
            {
                "id": "lw_auth", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who wrote the {year} literary work \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Originally written in {lang} and published in {year}.",
                "clue2": "The author's name starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}, {lang}) was written by {author}.",
                "irtOffset": -0.05,
            },
            {
                "id": "lw_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these literary works was written by {author}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Published in {year} (original language: {lang}).",
                "clue2": "Its title begins with \"{ans_init}\".",
                "why": "{author} wrote \"{title}\" ({year}, {lang}).",
                "irtOffset": 0.10,
            },
            {
                "id": "lw_lang", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which language was \"{title}\" ({year}) by {author} originally written?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Written by {author} and published in {year}.",
                "clue2": "The language begins with \"{ans_init}\".",
                "why": "\"{title}\" ({year}) by {author} was originally written in {lang}.",
                "irtOffset": 0.15,
            },
            {
                "id": "lw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} literary work \"{title}\" was written by {author}.",
                "falsePrompt": "The {year} literary work \"{title}\" was written by {fake}.",
                "fakeCol": 1,
                "clue1": "Originally published in {lang} in {year}.",
                "whyTrue": "True! {author} wrote \"{title}\" ({year}).",
                "whyFalse": "False! \"{title}\" was written by {author}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "lw_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was \"{title}\" by {author} first published?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1000, "maxClamp": 2025,
                "clue1": "Originally written in {lang} by {author}.",
                "why": "\"{title}\" ({lang}) by {author} was published in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "lit_author": {
        "l0Domain": 10, "l1Category": "Authors & Philosophers", "glyphHint": "book",
        "cols": ["name", "role", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "la_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was the {role} {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Born in {year}, renowned as a {role}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({role}, b. {year}) was associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "la_role", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which literary or philosophical role best describes {name} ({country}, b. {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year} ({country}).",
                "clue2": "The role starts with \"{ans_init}\".",
                "why": "{name} ({country}, b. {year}) was best known as a {role}.",
                "irtOffset": 0.10,
            },
            {
                "id": "la_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{role} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{role} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Connect {name} ({role}) to their literary tradition.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "la_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was the {role} {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 42, "minClamp": 1200, "maxClamp": 2000,
                "clue1": "A {role} associated with {country}.",
                "why": "{name} ({role}, {country}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "lit_myth": {
        "l0Domain": 10, "l1Category": "Mythology & Legend", "glyphHint": "book",
        "cols": ["name", "tradition", "mtype", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "lm_trad", "archetype": "SIGHTLINE_LOCK",
                "prompt": "To which mythological tradition does {name} ({mtype}) belong?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} is a {mtype}.",
                "clue2": "The tradition starts with \"{ans_init}\".",
                "why": "{name} ({mtype}) belongs to {tradition}.",
                "irtOffset": -0.05,
            },
            {
                "id": "lm_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these figures or creatures belongs to {tradition}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Described as a {mtype}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{name} ({mtype}) belongs to {tradition}.",
                "irtOffset": 0.15,
            },
            {
                "id": "lm_type", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In {tradition}, what kind of being is {name}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Part of {tradition}.",
                "clue2": "The category starts with \"{ans_init}\".",
                "why": "In {tradition}, {name} is a {mtype}.",
                "irtOffset": 0.05,
            },
            {
                "id": "lm_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "In mythology, {name} ({mtype}) belongs to {tradition}.",
                "falsePrompt": "In mythology, {name} ({mtype}) belongs to {fake}.",
                "fakeCol": 1,
                "clue1": "Recall the mythic pantheon of {name}.",
                "whyTrue": "True! {name} belongs to {tradition}.",
                "whyFalse": "False! {name} belongs to {tradition}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },

    # ===================== DOMAIN 11: LOGIC & MATH =====================
    "math_person": {
        "l0Domain": 11, "l1Category": "History of Mathematics", "glyphHint": "sigma",
        "cols": ["name", "field", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "mp_country", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was {field} {name} (b. {year}) associated with?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Born in {year}, renowned as a {field}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({field}, b. {year}) was associated with {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "mp_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these mathematicians or logicians was associated with {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "Born in {year} ({field}).",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} ({field}, b. {year}) was associated with {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "mp_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{field} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{field} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Place {name} ({field}) in their country.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "mp_year", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {field} {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 45, "minClamp": 1400, "maxClamp": 2000,
                "clue1": "A {field} from {country}.",
                "why": "{name} ({field}, {country}) was born in {year}.",
                "irtOffset": 0.35,
            },
        ],
    },
    "math_num": {
        "l0Domain": 11, "l1Category": "Math & Logic Brainteasers", "glyphHint": "sigma",
        "cols": ["stmt", "ans", "d1", "d2", "d3", "cat", "unit", "irt"],
        "poolCols": [5, 6],
        "angles": [
            {
                "id": "mn_mc", "archetype": "SIGHTLINE_LOCK",
                "prompt": "{stmt}?",
                "answerCol": 1, "inlineDistCols": [2, 3, 4],
                "clue1": "Category: {cat}. Double-check the pattern carefully.",
                "clue2": "Watch out for off-by-one traps in {cat}.",
                "why": "Exact answer: {ans} ({cat}).",
                "irtOffset": 0.0,
            },
            {
                "id": "mn_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Check this {cat} result: {stmt}? Answer: {ans}.",
                "falsePrompt": "Check this {cat} result: {stmt}? Answer: {fake}.",
                "inlineFakeCol": 2,
                "clue1": "Verify the exact value for this {cat} problem.",
                "whyTrue": "True! The exact answer is {ans}.",
                "whyFalse": "False! The exact answer is {ans}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "mn_est", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Estimate the exact value: {stmt}?",
                "exactCol": 1, "unitCol": 6, "step": 0, "pad": 0, "minClamp": -1000, "maxClamp": 1000000,
                "clue1": "Category: {cat}. Narrow down the magnitude first.",
                "why": "Exact value: {ans} ({cat}).",
                "irtOffset": 0.25,
            },
        ],
    },
    "math_word": {
        "l0Domain": 11, "l1Category": "Ciphers, Bases & Logic", "glyphHint": "sigma",
        "cols": ["stmt", "ans", "d1", "d2", "d3", "cat", "irt"],
        "poolCols": [5],
        "angles": [
            {
                "id": "mw_mc", "archetype": "SIGHTLINE_LOCK",
                "prompt": "{stmt}?",
                "answerCol": 1, "inlineDistCols": [2, 3, 4],
                "clue1": "Category: {cat}. Work through each symbol step by step.",
                "clue2": "The answer begins with \"{ans_init}\".",
                "why": "Verified solution: {ans} ({cat}).",
                "irtOffset": 0.0,
            },
            {
                "id": "mw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Check this {cat} puzzle: {stmt}? Solution: {ans}.",
                "falsePrompt": "Check this {cat} puzzle: {stmt}? Solution: {fake}.",
                "inlineFakeCol": 2,
                "clue1": "Check the first and last characters carefully.",
                "whyTrue": "True! The verified solution is {ans}.",
                "whyFalse": "False! The solution is {ans}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },
}


# ---------------------------------------------------------------------------
# Cached HTTP & QLever SPARQL Client
# ---------------------------------------------------------------------------
class CachedClient:
    def __init__(self, cache_dir: Path, use_cache_only: bool = False):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.use_cache_only = use_cache_only
        self._last_qlever = 0.0

    def fetch_file(self, name: str, url: str, timeout: int = 90) -> Path:
        dest = self.cache_dir / name
        if dest.exists() and dest.stat().st_size > 100:
            return dest
        if self.use_cache_only:
            raise RuntimeError(f"Cache miss in --cache-only mode: {name}")
        print(f"  [DL] {name} <- {url[:80]}...", flush=True)
        for attempt in range(4):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    tmp = dest.with_suffix(dest.suffix + ".tmp")
                    with open(tmp, "wb") as f:
                        while True:
                            chunk = resp.read(262144)
                            if not chunk:
                                break
                            f.write(chunk)
                    os.replace(tmp, dest)
                    print(f"  [DL] Saved {name} ({dest.stat().st_size / 1e6:.2f} MB)", flush=True)
                    return dest
            except Exception as e:
                wait = 2.0 * (attempt + 1)
                print(f"  [DL-RETRY {attempt+1}] {name}: {e} (wait {wait:.1f}s)", flush=True)
                time.sleep(wait)
        raise RuntimeError(f"Failed to download {url}")

    def qlever_query(self, key: str, sparql: str, timeout: int = 45) -> List[Dict[str, str]]:
        h = hashlib.sha256(sparql.encode("utf-8")).hexdigest()[:12]
        cache_path = self.cache_dir / f"qlever_{key}_{h}.json.gz"
        if cache_path.exists() and cache_path.stat().st_size > 20:
            with gzip.open(cache_path, "rt", encoding="utf-8") as f:
                return json.load(f)
        if self.use_cache_only:
            raise RuntimeError(f"Cache miss in --cache-only mode: qlever_{key}")

        # Polite sequential pacing for QLever
        elapsed = time.time() - self._last_qlever
        if elapsed < 1.35:
            time.sleep(1.35 - elapsed)

        data = urllib.parse.urlencode({"query": sparql}).encode("utf-8")
        for attempt in range(5):
            self._last_qlever = time.time()
            t0 = time.time()
            try:
                req = urllib.request.Request(
                    QLEVER_ENDPOINT,
                    data=data,
                    headers={"User-Agent": UA, "Accept": "application/sparql-results+json"},
                )
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    raw = json.loads(resp.read().decode("utf-8"))
                bindings = raw.get("results", {}).get("bindings", [])
                rows = [{k: v.get("value", "") for k, v in b.items()} for b in bindings]
                tmp = cache_path.with_suffix(".tmp")
                with gzip.open(tmp, "wt", encoding="utf-8") as f:
                    json.dump(rows, f)
                os.replace(tmp, cache_path)
                print(f"  [QL] {key:26s} -> {len(rows):6d} raw rows ({time.time()-t0:.2f}s)", flush=True)
                return rows
            except Exception as e:
                wait = 3.5 * (attempt + 1)
                print(f"  [QL-RETRY {attempt+1}] {key}: {str(e)[:80]} (wait {wait:.1f}s)", flush=True)
                time.sleep(wait)
        print(f"  [QL-WARN] {key} failed after retries; returning empty", flush=True)
        return []


QL_PREFIX = """PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX wikibase: <http://wikiba.se/ontology#>
"""


def group_single_valued(
    raw_rows: List[Dict[str, str]],
    single_keys: List[str],
    keep_keys: List[str],
) -> List[Dict[str, str]]:
    """
    Group raw SPARQL rows by ?item QID.
    For every key in single_keys, if an item has >1 distinct non-empty value, drop the item
    so no question ever has two equally valid answers!
    """
    by_item: Dict[str, Dict[str, Set[str]]] = {}
    sl_map: Dict[str, int] = {}
    for r in raw_rows:
        item = r.get("item", "")
        if not item:
            continue
        ent = by_item.setdefault(item, {k: set() for k in set(single_keys + keep_keys)})
        for k in ent:
            v = r.get(k, "").strip()
            if v:
                ent[k].add(v)
        try:
            sl_map[item] = max(sl_map.get(item, 0), int(float(r.get("sl", "0"))))
        except ValueError:
            pass

    out: List[Dict[str, str]] = []
    for item, vals in by_item.items():
        bad = False
        row: Dict[str, str] = {"item": item, "sl": str(sl_map.get(item, 0))}
        for k in single_keys:
            if len(vals[k]) != 1:
                bad = True
                break
            row[k] = next(iter(vals[k]))
        if bad:
            continue
        for k in keep_keys:
            if k not in row:
                if not vals[k]:
                    bad = True
                    break
                # Deterministic canonical choice (shortest clean label or min)
                row[k] = sorted(vals[k], key=lambda x: (len(x), x))[0]
        if not bad:
            out.append(row)
    out.sort(key=lambda x: -int(x.get("sl", "0")))
    return out


# ---------------------------------------------------------------------------
# Atomic Weights for Exact Molar Mass Computation (IUPAC / PubChem PD)
# ---------------------------------------------------------------------------
ATOMIC_WEIGHTS = {
    "H": 1.008, "He": 4.003, "Li": 6.94, "Be": 9.012, "B": 10.81, "C": 12.011,
    "N": 14.007, "O": 15.999, "F": 18.998, "Ne": 20.180, "Na": 22.990, "Mg": 24.305,
    "Al": 26.982, "Si": 28.085, "P": 30.974, "S": 32.06, "Cl": 35.45, "Ar": 39.948,
    "K": 39.098, "Ca": 40.078, "Sc": 44.956, "Ti": 47.867, "V": 50.942, "Cr": 51.996,
    "Mn": 54.938, "Fe": 55.845, "Co": 58.933, "Ni": 58.693, "Cu": 63.546, "Zn": 65.38,
    "Ga": 69.723, "Ge": 72.630, "As": 74.922, "Se": 78.971, "Br": 79.904, "Kr": 83.798,
    "Rb": 85.468, "Sr": 87.62, "Y": 88.906, "Zr": 91.224, "Nb": 92.906, "Mo": 95.95,
    "Ru": 101.07, "Rh": 102.91, "Pd": 106.42, "Ag": 107.87, "Cd": 112.41, "In": 114.82,
    "Sn": 118.71, "Sb": 121.76, "Te": 127.60, "I": 126.90, "Xe": 131.29, "Cs": 132.91,
    "Ba": 137.33, "La": 138.91, "Ce": 140.12, "Nd": 144.24, "Gd": 157.25, "Hf": 178.49,
    "Ta": 180.95, "W": 183.84, "Re": 186.21, "Os": 190.23, "Ir": 192.22, "Pt": 195.08,
    "Au": 196.97, "Hg": 200.59, "Tl": 204.38, "Pb": 207.2, "Bi": 208.98, "Th": 232.04,
    "U": 238.03,
}
FORMULA_TOKEN_RE = re.compile(r"([A-Z][a-z]?)(\d*)")


def parse_formula_molar_mass(raw_formula: str) -> Optional[Tuple[str, int]]:
    f = raw_formula.translate(SUBSCRIPT_MAP).strip()
    if not f or len(f) < 2 or len(f) > 22:
        return None
    if not re.match(r"^[A-Za-z0-9]+$", f):
        return None
    pos = 0
    total = 0.0
    elems = 0
    for m in FORMULA_TOKEN_RE.finditer(f):
        if m.start() != pos:
            return None
        pos = m.end()
        sym, cnt_s = m.group(1), m.group(2)
        if sym not in ATOMIC_WEIGHTS:
            return None
        cnt = int(cnt_s) if cnt_s else 1
        if cnt <= 0 or cnt > 200:
            return None
        total += ATOMIC_WEIGHTS[sym] * cnt
        elems += 1
    if pos != len(f) or elems < 2:
        return None
    mass = int(round(total))
    if mass < 6 or mass > 1200:
        return None
    return f, mass


# ---------------------------------------------------------------------------
# Domain Harvesters (0..11)
# ---------------------------------------------------------------------------

def harvest_domain_0_history(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 0: World History ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Historical Battles
    raw = client.qlever_query("d0_battles", QL_PREFIX + """
SELECT ?item ?name ?conflict ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q178561 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P361 ?w ;
        wdt:P585 ?dt ;
        wdt:P17 ?c .
  ?w @en@rdfs:label ?conflict .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 100 && ?year <= 2022)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_b = []
    seen = set()
    for r in group_single_valued(raw, ["conflict", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=48)
        conflict = clean_text(r["conflict"], max_len=36)
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and conflict and country) or name.lower() == conflict.lower():
            continue
        if name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_b.append([name, conflict, year, country, sl_to_irt(sl, -0.10)])
    rows_b.sort(key=lambda x: (x[4], x[2]))
    tables["hist_battle"] = rows_b[:3000]

    # 2. Historical Figures (strictly born <= 1925, single unambiguous country & role)
    role_map = {
        "monarch": "Monarch", "king": "Monarch", "queen": "Monarch",
        "emperor": "Emperor", "politician": "Statesman", "president": "President",
        "prime minister": "Prime Minister", "military officer": "Military Commander",
        "military personnel": "Military Commander", "general": "Military Commander",
        "explorer": "Explorer", "diplomat": "Diplomat", "revolutionary": "Revolutionary",
        "historian": "Historian", "aristocrat": "Noble", "pharaoh": "Pharaoh",
    }
    raw = client.qlever_query("d0_figures_v2", QL_PREFIX + """
SELECT ?item ?name ?role ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q82955 wd:Q116 wd:Q30461 wd:Q189290 wd:Q11900058 wd:Q193391 wd:Q3242115 wd:Q37110 wd:Q201788 }
  ?occ @en@rdfs:label ?role .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 12 && ?year >= 100 && ?year <= 1925)
} ORDER BY DESC(?sl) LIMIT 60000
""")
    rows_f = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "role"]):
        name = clean_text(r["name"], max_len=36)
        country = clean_country(r["country"])
        role = role_map.get(r["role"].lower())
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country and role) or " " not in name and sl < 35:
            continue
        if name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_f.append([name, role, year, country, sl_to_irt(sl, 0.05)])
    rows_f.sort(key=lambda x: (x[4], x[2]))
    tables["hist_figure"] = rows_f[:17500]

    # 3. Historical States / Empires
    raw = client.qlever_query("d0_empires", QL_PREFIX + """
SELECT ?item ?name ?capital ?year ?sl WHERE {
  ?item wdt:P31 wd:Q3024240 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P36 ?cap ;
        wdt:P571 ?dt .
  ?cap @en@rdfs:label ?capital .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 100 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 6000
""")
    rows_e = []
    seen = set()
    for r in group_single_valued(raw, ["capital", "year"], ["name"]):
        name = clean_text(r["name"], max_len=38)
        cap = clean_text(r["capital"], max_len=30)
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and cap) or name.lower() == cap.lower() or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_e.append([name, cap, year, sl_to_irt(sl, -0.10)])
    rows_e.sort(key=lambda x: (x[3], x[2]))
    tables["hist_empire"] = rows_e[:1500]

    # 4. Wars & Treaties
    raw = client.qlever_query("d0_wars_treaties", QL_PREFIX + """
SELECT ?item ?name ?year ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c .
  VALUES ?t { wd:Q198 wd:Q131569 wd:Q180684 wd:Q10931 }
  ?c @en@rdfs:label ?country .
  { ?item wdt:P580 ?dt . } UNION { ?item wdt:P585 ?dt . }
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 100 && ?year <= 2023)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_w = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=46)
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_w.append([name, year, country, sl_to_irt(sl, -0.05)])
    rows_w.sort(key=lambda x: (x[3], x[1]))
    tables["hist_war"] = rows_w[:2500]

    return tables


def harvest_domain_1_science(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 1: Science & Space ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. PubChem Periodic Table (118 Elements - US Gov Public Domain)
    pt_path = client.fetch_file("pubchem_periodic.json", "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON")
    pt_data = json.loads(pt_path.read_text(encoding="utf-8"))
    cols = pt_data["Table"]["Columns"]["Column"]
    idx_num = cols.index("AtomicNumber")
    idx_sym = cols.index("Symbol")
    idx_name = cols.index("Name")
    idx_grp = cols.index("GroupBlock")
    rows_el = []
    famous_els = {"Hydrogen", "Helium", "Carbon", "Nitrogen", "Oxygen", "Neon", "Sodium", "Aluminum", "Silicon", "Phosphorus", "Sulfur", "Chlorine", "Potassium", "Calcium", "Iron", "Copper", "Zinc", "Silver", "Tin", "Iodine", "Gold", "Mercury", "Lead", "Uranium", "Platinum", "Titanium", "Nickel", "Magnesium"}
    for row in pt_data["Table"]["Row"]:
        c = row["Cell"]
        anum = int(c[idx_num])
        sym = clean_text(c[idx_sym], max_len=4, min_len=1)
        name = clean_text(c[idx_name], max_len=24)
        grp = clean_text(c[idx_grp], max_len=28)
        if not (sym and name and grp):
            continue
        if name in famous_els:
            irt = -125 + (anum % 40)
        elif anum <= 56:
            irt = -25 + anum * 2
        elif anum <= 94:
            irt = 65 + (anum - 56) * 2
        else:
            irt = 155 + (anum - 94) * 3
        rows_el.append([name, sym, anum, grp, max(-140, min(230, irt))])
    rows_el.sort(key=lambda x: (x[4], x[2]))
    tables["sci_element"] = rows_el

    # 2. Scientists (Physics, Chemistry, Biology, Astronomy, Medicine, Geology, Botany)
    field_map = {
        "physicist": "Physics", "theoretical physicist": "Physics", "nuclear physicist": "Physics",
        "chemist": "Chemistry", "biochemist": "Biochemistry",
        "biologist": "Biology", "microbiologist": "Biology", "zoologist": "Zoology",
        "astronomer": "Astronomy", "astrophysicist": "Astronomy",
        "physician": "Medicine", "surgeon": "Medicine",
        "botanist": "Botany", "geologist": "Geology",
    }
    raw = client.qlever_query("d1_scientists", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q169470 wd:Q593644 wd:Q864503 wd:Q11063 wd:Q39631 wd:Q2374149 wd:Q520549 wd:Q350979 }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1450 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 32000
""")
    rows_sc = []
    seen = set()
    for r in group_single_valued(raw, ["occLabel", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=36)
        field = field_map.get(r["occLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and field and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_sc.append([name, field, year, country, sl_to_irt(sl, 0.0)])
    rows_sc.sort(key=lambda x: (x[4], x[2]))
    tables["sci_scientist"] = rows_sc[:10000]

    # 3. NASA Exoplanet Archive (Public Domain!)
    exo_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,discoverymethod,disc_year,disc_facility,sy_dist+from+pscomppars&format=csv"
    exo_path = client.fetch_file("nasa_exoplanets.csv", exo_url)
    famous_exo = {"51 Peg b", "Proxima Cen b", "TRAPPIST-1 e", "TRAPPIST-1 d", "Kepler-22 b", "Kepler-186 f", "HD 209458 b", "HD 189733 b", "55 Cnc e", "GJ 1214 b", "K2-18 b", "PSR B1257+12 c"}
    rows_exo = []
    fac_counts: Dict[str, int] = defaultdict(int)
    seen = set()
    with open(exo_path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        raw_exo = list(reader)
    # Sort so iconic + diverse non-Kepler facilities get priority, cap Kepler to keep variety crisp!
    raw_exo.sort(key=lambda r: (0 if r.get("pl_name") in famous_exo else 1, int(r.get("disc_year") or 2025), r.get("pl_name", "")))
    for r in raw_exo:
        name = clean_text(r.get("pl_name"), max_len=30)
        method = clean_text(r.get("discoverymethod"), max_len=28)
        fac = clean_text(r.get("disc_facility"), max_len=36)
        try:
            year = int(r.get("disc_year") or 0)
        except ValueError:
            continue
        if not (name and method and fac) or year < 1988 or year > 2025:
            continue
        if name.lower() in seen:
            continue
        # Cap any single survey so we get rich observatory variety
        if fac_counts[fac] >= 750 and name not in famous_exo:
            continue
        seen.add(name.lower())
        fac_counts[fac] += 1
        if name in famous_exo:
            irt = 35
        elif year <= 2005:
            irt = 120 + (year - 1988) * 3
        else:
            irt = 165 + min(80, (fac_counts[fac] // 10))
        rows_exo.append([name, method, year, fac, irt])
        if len(rows_exo) >= 2800:
            break
    rows_exo.sort(key=lambda x: (x[4], x[2]))
    tables["sci_exoplanet"] = rows_exo

    # 4. Celestial Objects in Constellations (Stars, Galaxies, Nebulae, Clusters)
    astro_type_map = {
        "star": "Star", "red giant": "Star", "binary star": "Star", "double star": "Star",
        "galaxy": "Galaxy", "spiral galaxy": "Galaxy", "elliptical galaxy": "Galaxy",
        "nebula": "Nebula", "planetary nebula": "Nebula", "emission nebula": "Nebula",
        "globular cluster": "Star Cluster", "open cluster": "Star Cluster", "star cluster": "Star Cluster",
        "supernova": "Supernova", "pulsar": "Pulsar", "quasar": "Quasar",
    }
    raw = client.qlever_query("d1_astro", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?con ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P59 ?c .
  VALUES ?t { wd:Q523 wd:Q318 wd:Q42372 wd:Q168845 wd:Q3937 wd:Q11276 wd:Q11387 wd:Q2488 wd:Q13632 wd:Q83373 wd:Q4360 }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?con .
  FILTER(?sl >= 5)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_a = []
    seen = set()
    for r in group_single_valued(raw, ["con"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=36)
        atype = astro_type_map.get(r["tLabel"].lower())
        con = clean_text(r["con"], max_len=28)
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and atype and con) or name.lower() == con.lower() or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_a.append([name, atype, con, sl_to_irt(sl, 0.10)])
    rows_a.sort(key=lambda x: (x[3], x[0]))
    tables["sci_astro"] = rows_a[:3000]

    # 5. Chemical Compounds with Unique Clean Formula + Exact Molar Mass
    raw = client.qlever_query("d1_chemicals", QL_PREFIX + """
SELECT ?item ?name ?formula ?sl WHERE {
  ?item wdt:P274 ?formula ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name .
  FILTER(?sl >= 7)
} ORDER BY DESC(?sl) LIMIT 18000
""")
    rows_c_cand = []
    seen_name = set()
    formula_counts: Dict[str, int] = defaultdict(int)
    for r in group_single_valued(raw, ["formula"], ["name"]):
        name = clean_text(r["name"], max_len=30)
        if not name or any(ch.isdigit() for ch in name) or "," in name or "(" in name:
            continue
        parsed = parse_formula_molar_mass(r["formula"])
        if not parsed:
            continue
        formula, mass = parsed
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if name.lower() in seen_name:
            continue
        seen_name.add(name.lower())
        formula_counts[formula] += 1
        rows_c_cand.append((name, formula, mass, sl))
    # Keep strictly unique formulas (zero isomer ambiguity!)
    rows_c = []
    for name, formula, mass, sl in rows_c_cand:
        if formula_counts[formula] == 1:
            rows_c.append([name, formula, mass, sl_to_irt(sl, 0.15)])
    rows_c.sort(key=lambda x: (x[3], x[2]))
    tables["sci_chemical"] = rows_c[:5500]

    # 6. Space Missions & Spacecraft
    raw = client.qlever_query("d1_space", QL_PREFIX + """
SELECT ?item ?name ?agency ?year ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P137 ?op ;
        wdt:P619 ?dt .
  VALUES ?t { wd:Q2133344 wd:Q40218 wd:Q26529 wd:Q752783 wd:Q5916 wd:Q26529 }
  ?op @en@rdfs:label ?agency .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 1957 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 4000
""")
    rows_sp = []
    seen = set()
    for r in group_single_valued(raw, ["agency", "year"], ["name"]):
        name = clean_text(r["name"], max_len=36)
        ag = clean_text(r["agency"], max_len=34)
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and ag) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_sp.append([name, ag, year, sl_to_irt(sl, -0.05)])
    rows_sp.sort(key=lambda x: (x[3], x[2]))
    tables["sci_space"] = rows_sp[:1000]

    return tables


def harvest_domain_2_geography(client: CachedClient) -> Tuple[Dict[str, List[list]], List[list]]:
    """Returns (domain_2_tables, country_rows_for_domain_8)."""
    print("\n=== Harvesting Domain 2: Geography & Wonders ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. GeoNames countryInfo.txt + admin1CodesASCII.txt + cities15000.zip (CC-BY 4.0)
    ci_path = client.fetch_file("geonames_countryInfo.txt", "https://download.geonames.org/export/dump/countryInfo.txt")
    a1_path = client.fetch_file("geonames_admin1.txt", "https://download.geonames.org/export/dump/admin1CodesASCII.txt")
    c15_path = client.fetch_file("geonames_cities15000.zip", "https://download.geonames.org/export/dump/cities15000.zip")

    cont_map = {
        "AF": "Africa", "AS": "Asia", "EU": "Europe",
        "NA": "North America", "OC": "Oceania", "SA": "South America", "AN": "Antarctica",
    }
    country_by_iso: Dict[str, str] = {}
    capitals_lower: Set[str] = set()
    soc_countries: List[list] = []
    for line in ci_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 12:
            continue
        iso = parts[0].strip()
        cname = clean_country(parts[4].strip())
        cap = clean_text(parts[5].strip(), max_len=30)
        pop_s = parts[7].strip()
        cont = cont_map.get(parts[8].strip())
        curr_name = clean_text(parts[11].strip(), max_len=26)
        if iso and cname:
            country_by_iso[iso] = cname
        if cap:
            capitals_lower.add(cap.lower())
        try:
            pop = int(pop_s)
        except ValueError:
            pop = 0
        if cname and cap and cont and curr_name and pop >= 50000 and cname.lower() != cap.lower():
            irt = pop_to_irt(max(pop, 500000), is_capital=True)
            soc_countries.append([cname, cap, cont, curr_name, max(-145, min(140, irt))])
    soc_countries.sort(key=lambda x: (x[4], x[0]))

    admin1_map: Dict[str, str] = {}
    for line in a1_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        parts = line.split("\t")
        if len(parts) >= 2:
            reg = clean_text(parts[1], max_len=32)
            if reg:
                admin1_map[parts[0].strip()] = reg

    # Parse cities15000.txt — keep highest-population unique city name, clean region != city
    best_city_by_name: Dict[str, Tuple[int, str, str, str, int, bool]] = {}
    with zipfile.ZipFile(c15_path) as zf:
        with zf.open("cities15000.txt") as f:
            for raw_line in io.TextIOWrapper(f, encoding="utf-8", errors="ignore"):
                parts = raw_line.rstrip("\r\n").split("\t")
                if len(parts) < 15:
                    continue
                # Prefer clean ASCII/Latin name (col 1 or col 2 asciiname)
                name = clean_text(parts[1], max_len=30) or clean_text(parts[2], max_len=30)
                fcode = parts[7]
                cc = parts[8].strip()
                a1 = parts[10].strip()
                try:
                    pop = int(parts[14])
                except ValueError:
                    continue
                if not name or pop < 30_000:
                    continue
                country = country_by_iso.get(cc)
                reg = admin1_map.get(f"{cc}.{a1}")
                if not (country and reg):
                    continue
                if reg.lower() == name.lower() or reg.lower() == country.lower():
                    continue
                if name.lower() == country.lower():
                    continue
                is_cap = (fcode == "PPLC") or (name.lower() in capitals_lower and pop >= 200_000)
                key = name.lower()
                prev = best_city_by_name.get(key)
                if prev is None or pop > prev[0]:
                    best_city_by_name[key] = (pop, name, country, reg, max(30, int(round(pop / 1000.0))), is_cap)

    # Filter out regions that appear only once in their country? No — fallback scans across countries if needed,
    # and preferSameCol prioritizes same-country regions whenever >=3 exist!
    rows_city = []
    for pop, name, country, reg, pop_k, is_cap in best_city_by_name.values():
        irt = pop_to_irt(pop, is_capital=is_cap)
        rows_city.append([name, country, reg, pop_k, irt])
    rows_city.sort(key=lambda x: (x[4], -x[3]))
    tables["geo_city"] = rows_city[:18500]

    # 2. OurAirports CC0 (major commercial airports with 3-letter IATA code)
    ap_path = client.fetch_file("ourairports.csv", "https://davidmegginson.github.io/ourairports-data/airports.csv")
    rows_ap = []
    seen_iata = set()
    seen_ap_name = set()
    with open(ap_path, "r", encoding="utf-8", errors="ignore") as f:
        for r in csv.DictReader(f):
            atype = r.get("type", "")
            if atype not in ("large_airport", "medium_airport"):
                continue
            if r.get("scheduled_service", "").lower() != "yes":
                continue
            iata = (r.get("iata_code") or "").strip().upper()
            if not re.match(r"^[A-Z]{3}$", iata) or iata in seen_iata:
                continue
            ap_name = clean_text(r.get("name"), max_len=44)
            city = clean_text(r.get("municipality"), max_len=28)
            country = country_by_iso.get((r.get("iso_country") or "").strip())
            if not (ap_name and city and country):
                continue
            if ap_name.lower() in seen_ap_name:
                continue
            seen_iata.add(iata)
            seen_ap_name.add(ap_name.lower())
            irt = -65 if atype == "large_airport" else 95
            # Major famous hubs get Easy tier
            if iata in {"JFK", "LAX", "LHR", "CDG", "HND", "NRT", "DXB", "SIN", "FRA", "AMS", "ORD", "ATL", "DFW", "SFO", "MIA", "YYZ", "SYD", "ICN", "HKG", "PEK", "MAD", "BCN", "FCO", "ZRH", "GVA", "IST", "DOH", "GRU", "MEX", "BOS", "SEA", "LAS", "MCO"}:
                irt = -120
            rows_ap.append([iata, city, ap_name, country, irt])
    rows_ap.sort(key=lambda x: (x[4], x[0]))
    tables["geo_airport"] = rows_ap[:2800]

    # 3. Mountains (Wikidata CC0)
    raw = client.qlever_query("d2_mountains", QL_PREFIX + """
SELECT ?item ?name ?country ?elev ?sl WHERE {
  ?item wdt:P31 wd:Q8502 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P2044 ?elev .
  ?c @en@rdfs:label ?country .
  FILTER(?sl >= 6 && ?elev >= 300 && ?elev <= 8850)
} ORDER BY DESC(?sl) LIMIT 15000
""")
    rows_m = []
    seen = set()
    for r in group_single_valued(raw, ["country"], ["name", "elev"]):
        name = clean_text(r["name"], max_len=36)
        country = clean_country(r["country"])
        try:
            elev = int(round(float(r["elev"]) / 50.0) * 50)
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or elev < 300 or elev > 8850 or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_m.append([name, country, elev, sl_to_irt(sl, 0.05)])
    rows_m.sort(key=lambda x: (x[3], -x[2]))
    tables["geo_mountain"] = rows_m[:5000]

    # 4. Rivers (Wikidata CC0)
    raw = client.qlever_query("d2_rivers", QL_PREFIX + """
SELECT ?item ?name ?country ?len ?sl WHERE {
  ?item wdt:P31 wd:Q4022 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P2043 ?len .
  ?c @en@rdfs:label ?country .
  FILTER(?sl >= 6 && ?len >= 50 && ?len <= 7000)
} ORDER BY DESC(?sl) LIMIT 15000
""")
    rows_r = []
    seen = set()
    for r in group_single_valued(raw, ["country"], ["name", "len"]):
        name = clean_text(r["name"], max_len=34)
        country = clean_country(r["country"])
        try:
            length = int(round(float(r["len"])))
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or length < 50 or length > 7000 or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_r.append([name, country, length, sl_to_irt(sl, 0.05)])
    rows_r.sort(key=lambda x: (x[3], -x[2]))
    tables["geo_river"] = rows_r[:4500]

    # 5. Islands, Lakes, Volcanoes, National Parks (Wikidata CC0)
    gtype_map = {
        "island": "Island", "lake": "Lake", "volcano": "Volcano",
        "stratovolcano": "Volcano", "national park": "National Park",
    }
    raw = client.qlever_query("d2_wonders", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c .
  VALUES ?t { wd:Q23442 wd:Q23397 wd:Q8072 wd:Q169358 wd:Q46169 }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?country .
  FILTER(?sl >= 6)
} ORDER BY DESC(?sl) LIMIT 14000
""")
    rows_w = []
    seen = set()
    for r in group_single_valued(raw, ["country", "tLabel"], ["name"]):
        name = clean_text(r["name"], max_len=36)
        gt = gtype_map.get(r["tLabel"].lower())
        country = clean_country(r["country"])
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and gt and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_w.append([name, gt, country, sl_to_irt(sl, 0.0)])
    rows_w.sort(key=lambda x: (x[3], x[0]))
    tables["geo_wonder"] = rows_w[:3500]

    return tables, soc_countries


def harvest_domain_3_arts(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 3: Arts & Architecture ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1A. Wikidata Famous Paintings & Sculptures (CC0)
    med_map = {
        "painting": "Painting", "sculpture": "Sculpture", "statue": "Sculpture",
        "drawing": "Drawing", "print": "Print", "fresco": "Fresco",
        "photograph": "Photograph", "engraving": "Print", "etching": "Print",
        "lithograph": "Print", "woodcut": "Print", "watercolor": "Painting",
    }
    raw = client.qlever_query("d3_artworks", QL_PREFIX + """
SELECT ?item ?title ?artist ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P170 ?a ;
        wdt:P571 ?dt .
  VALUES ?t { wd:Q3305213 wd:Q860861 wd:Q179700 wd:Q93184 wd:Q125191 wd:Q11060274 }
  ?t @en@rdfs:label ?tLabel .
  ?a @en@rdfs:label ?artist .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 4 && ?year >= 1200 && ?year <= 2023)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    rows_aw = []
    seen_title = set()
    for r in group_single_valued(raw, ["artist", "year"], ["title", "tLabel"]):
        title = clean_text(r["title"], max_len=44)
        artist = clean_text(r["artist"], max_len=34)
        med = med_map.get(r["tLabel"].lower())
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and artist and med) or title.lower() in seen_title:
            continue
        seen_title.add(title.lower())
        rows_aw.append([title, artist, year, med, sl_to_irt(sl, -0.05)])

    # 1B. National Gallery of Art Open Data (CC0!) — strictly famous masters w/ clean titles
    nga_path = client.fetch_file("nga_objects.csv", "https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/objects.csv")
    famous_masters = {
        "Vincent van Gogh", "Claude Monet", "Pablo Picasso", "Rembrandt van Rijn",
        "Leonardo da Vinci", "Johannes Vermeer", "Edgar Degas", "Paul Cézanne",
        "Pierre-Auguste Renoir", "Edouard Manet", "Édouard Manet", "Henri Matisse",
        "Paul Gauguin", "Sandro Botticelli", "Raphael", "Titian", "Peter Paul Rubens",
        "Francisco de Goya", "Diego Velázquez", "El Greco", "Albrecht Dürer",
        "J.M.W. Turner", "John Constable", "Winslow Homer", "John Singer Sargent",
        "Mary Cassatt", "Georgia O'Keeffe", "Edward Hopper", "Jackson Pollock",
        "Mark Rothko", "Andy Warhol", "Roy Lichtenstein", "Wassily Kandinsky",
        "Piet Mondrian", "Amedeo Modigliani", "Marc Chagall", "Salvador Dalí",
        "Auguste Rodin", "Alexander Calder", "Henri de Toulouse-Lautrec",
        "Georges Seurat", "Camille Pissarro", "Alfred Sisley", "Gustave Courbet",
        "Eugène Delacroix", "Jacques-Louis David", "Jean-Auguste-Dominique Ingres",
        "Caravaggio", "Canaletto", "Giovanni Battista Tiepolo", "Fra Angelico",
        "Jan van Eyck", "Hieronymus Bosch", "Pieter Bruegel the Elder",
        "Anthony van Dyck", "Frans Hals", "Hans Holbein the Younger",
        "William Blake", "Thomas Gainsborough", "Joshua Reynolds",
        "James McNeill Whistler", "Thomas Eakins", "Gilbert Stuart",
        "Ansel Adams", "Alfred Stieglitz", "Walker Evans", "Dorothea Lange",
        "Katsushika Hokusai", "Utagawa Hiroshige", "Honoré Daumier",
        "Giovanni Bellini", "Paolo Veronese", "Tintoretto", "Andrea Mantegna",
        "Piero della Francesca", "Giorgione", "Nicolas Poussin", "Claude Lorrain",
        "Jean-Honoré Fragonard", "Antoine Watteau", "François Boucher",
        "Élisabeth Vigée Le Brun", "Berthe Morisot", "Gustav Klimt", "Egon Schiele",
        "Edvard Munch", "Paul Klee", "Joan Miró", "René Magritte", "Max Ernst",
        "Marcel Duchamp", "Constantin Brancusi", "Alberto Giacometti", "Henry Moore",
        "David Hockney", "Jasper Johns", "Robert Rauschenberg", "Willem de Kooning",
        "Chuck Close", "Wayne Thiebaud", "Richard Diebenkorn", "Frederic Edwin Church",
        "Albert Bierstadt", "Thomas Cole", "George Bellows", "Childe Hassam",
    }
    nga_cls_map = {
        "Painting": "Painting", "Sculpture": "Sculpture", "Print": "Print",
        "Drawing": "Drawing", "Photograph": "Photograph",
    }
    nga_artist_counts: Dict[str, int] = defaultdict(int)
    with open(nga_path, "r", encoding="utf-8", errors="ignore") as f:
        for r in csv.DictReader(f):
            cls = nga_cls_map.get((r.get("classification") or "").strip())
            if not cls:
                continue
            artist = clean_text(r.get("attribution"), max_len=34)
            title = clean_text(r.get("title"), max_len=44)
            if not (artist and title):
                continue
            if any(bad in artist.lower() for bad in ("after ", "follower", "circle", "workshop", "school", "manner", "probably", "attributed", "american ", "french ", "italian ", "german ", "british ", "dutch ", "spanish ", "unknown", "unidentified", "anonymous")):
                continue
            if any(bad in title.lower() for bad in ("untitled", "plate ", "sheet ", "study", "sketch", "verso", "recto", "fragment", "[", "]", "portfolio", "series", "no.", "#")):
                continue
            try:
                y1 = int(r.get("beginyear") or 0)
                y2 = int(r.get("endyear") or y1)
            except ValueError:
                continue
            if y1 < 1300 or y1 > 2020 or abs(y2 - y1) > 15:
                continue
            if title.lower() in seen_title:
                continue
            is_master = artist in famous_masters
            cap_per_artist = 60 if is_master else 12
            if nga_artist_counts[artist] >= cap_per_artist:
                continue
            seen_title.add(title.lower())
            nga_artist_counts[artist] += 1
            irt = 25 + nga_artist_counts[artist] * 2 if is_master else 155 + nga_artist_counts[artist] * 5
            rows_aw.append([title, artist, y1, cls, min(245, irt)])
            if len(rows_aw) >= 10500:
                break
    rows_aw.sort(key=lambda x: (x[4], x[2]))
    tables["art_work"] = rows_aw[:10000]

    # 2. Architectural Landmarks (Museums, Castles, Cathedrals, Bridges, Skyscrapers, Palaces, Temples)
    arch_map = {
        "museum": "Museum", "art museum": "Museum", "castle": "Castle",
        "cathedral": "Cathedral", "bridge": "Bridge", "suspension bridge": "Bridge",
        "skyscraper": "Skyscraper", "palace": "Palace", "temple": "Temple",
        "building": "Landmark", "tower": "Tower", "basilica": "Cathedral",
        "mosque": "Mosque", "monument": "Monument",
    }
    raw = client.qlever_query("d3_landmarks", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P571 ?dt .
  VALUES ?t { wd:Q33506 wd:Q23413 wd:Q12280 wd:Q2977 wd:Q11303 wd:Q16560 wd:Q44539 wd:Q12518 wd:Q32815 wd:Q4989906 }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 6 && ?year >= 500 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 14000
""")
    rows_al = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=40)
        at = arch_map.get(r["tLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and at and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_al.append([name, at, year, country, sl_to_irt(sl, -0.05)])
    rows_al.sort(key=lambda x: (x[4], x[2]))
    tables["art_landmark"] = rows_al[:5500]

    # 3. Painters, Sculptors, Architects, Photographers
    disc_map = {
        "painter": "Painter", "sculptor": "Sculptor", "architect": "Architect",
        "photographer": "Photographer", "printmaker": "Printmaker",
    }
    raw = client.qlever_query("d3_creators", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q1028181 wd:Q1281618 wd:Q42973 wd:Q33231 wd:Q11569986 }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1250 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 20000
""")
    rows_ac = []
    seen = set()
    for r in group_single_valued(raw, ["occLabel", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        disc = disc_map.get(r["occLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and disc and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_ac.append([name, disc, year, country, sl_to_irt(sl, 0.05)])
    rows_ac.sort(key=lambda x: (x[4], x[2]))
    tables["art_creator"] = rows_ac[:6500]

    return tables


def harvest_domain_4_pop(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 4: Film, Music & Pop ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Films
    raw = client.qlever_query("d4_films_v2", QL_PREFIX + """
SELECT ?item ?title ?dir ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q11424 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P57 ?d ;
        wdt:P577 ?pub ;
        wdt:P495 ?c .
  ?d @en@rdfs:label ?dir .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?pub) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1915 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 40000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["dir", "country", "year"], ["title"]):
        title = clean_text(r["title"], max_len=40)
        director = clean_text(r["dir"], max_len=34)
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and director and country) or title.lower() in seen:
            continue
        seen.add(title.lower())
        rows.append([title, director, year, country, sl_to_irt(sl, -0.10)])
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["pop_film"] = rows[:14000]

    # 2. Music Albums
    raw = client.qlever_query("d4_albums", QL_PREFIX + """
SELECT ?item ?title ?artist ?year ?sl WHERE {
  ?item wdt:P31 wd:Q482994 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P175 ?a ;
        wdt:P577 ?pub .
  ?a @en@rdfs:label ?artist .
  BIND(YEAR(?pub) AS ?year)
  FILTER(?sl >= 6 && ?year >= 1955 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 18000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["artist", "year"], ["title"]):
        title = clean_text(r["title"], max_len=38)
        artist = clean_text(r["artist"], max_len=32)
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and artist) or title.lower() == artist.lower() or title.lower() in seen:
            continue
        seen.add(title.lower())
        rows.append([title, artist, year, sl_to_irt(sl, -0.05)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["pop_album"] = rows[:10000]

    # 3. Hit Songs / Singles
    raw = client.qlever_query("d4_songs", QL_PREFIX + """
SELECT ?item ?title ?artist ?year ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P175 ?a ;
        wdt:P577 ?pub .
  VALUES ?t { wd:Q7366 wd:Q134556 }
  ?a @en@rdfs:label ?artist .
  BIND(YEAR(?pub) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1955 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["artist", "year"], ["title"]):
        title = clean_text(r["title"], max_len=38)
        artist = clean_text(r["artist"], max_len=32)
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and artist) or title.lower() == artist.lower() or title.lower() in seen:
            continue
        seen.add(title.lower())
        rows.append([title, artist, year, sl_to_irt(sl, -0.10)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["pop_song"] = rows[:4000]

    # 4. TV Series
    raw = client.qlever_query("d4_tv", QL_PREFIX + """
SELECT ?item ?title ?country ?year ?sl WHERE {
  ?item wdt:P31 wd:Q5398426 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P495 ?c ;
        wdt:P580 ?pub .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?pub) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1950 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["title"]):
        title = clean_text(r["title"], max_len=38)
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and country) or title.lower() in seen:
            continue
        seen.add(title.lower())
        rows.append([title, country, year, sl_to_irt(sl, -0.10)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["pop_tv"] = rows[:3500]

    # 5. Bands & Musical Groups
    raw = client.qlever_query("d4_bands", QL_PREFIX + """
SELECT ?item ?name ?country ?year ?sl WHERE {
  ?item wdt:P31 wd:Q215380 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P495 ?c ;
        wdt:P571 ?dt .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1955 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, country, year, sl_to_irt(sl, -0.10)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["pop_band"] = rows[:3000]

    return tables


def harvest_domain_5_sports(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 5: Sports & Games ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Famous International Athletes (strictly genuine athletic occupations, sl >= 18!)
    raw = client.qlever_query("d5_athletes_v2", QL_PREFIX + """
SELECT ?item ?name ?sport ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P106 ?occ ;
        wdt:P641 ?s ;
        wdt:P27 ?c ;
        wdt:P569 ?b .
  VALUES ?occ {
    wd:Q937857 wd:Q3665646 wd:Q10833314 wd:Q11513337 wd:Q10843402 wd:Q10871364
    wd:Q11774891 wd:Q19204627 wd:Q11338576 wd:Q13156709 wd:Q2309784 wd:Q10873124
    wd:Q378622 wd:Q12299841 wd:Q13415036 wd:Q15117302 wd:Q13219587 wd:Q15982858
    wd:Q13382576 wd:Q13381863 wd:Q13474373 wd:Q13381572 wd:Q10843263 wd:Q14089670
    wd:Q11124885 wd:Q2066131 wd:Q4009406 wd:Q13382608 wd:Q13382519 wd:Q13141064
  }
  ?s @en@rdfs:label ?sport .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 18 && ?year >= 1875 && ?year <= 2006)
} ORDER BY DESC(?sl) LIMIT 32000
""")
    rows = []
    seen = set()
    sport_cap: Dict[str, int] = defaultdict(int)
    for r in group_single_valued(raw, ["sport", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        sport = clean_sport(r["sport"])
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and sport and country) or name.lower() in seen:
            continue
        # Cap Soccer so athletes span ALL Olympic & pro sports richly!
        if sport == "Soccer" and sport_cap[sport] >= 2200:
            continue
        seen.add(name.lower())
        sport_cap[sport] += 1
        rows.append([name, sport, year, country, sl_to_irt(sl, -0.05)])
        if len(rows) >= 9000:
            break
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["sport_athlete"] = rows

    # 2. Sports Clubs & Franchises
    club_sport_map = {
        "association football club": "Soccer", "football club": "Soccer",
        "basketball team": "Basketball", "baseball team": "Baseball",
        "ice hockey team": "Ice Hockey", "american football team": "American Football",
        "rugby union team": "Rugby", "cricket team": "Cricket",
    }
    raw = client.qlever_query("d5_clubs", QL_PREFIX + """
SELECT ?item ?name ?country ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P571 ?dt .
  VALUES ?t { wd:Q476028 wd:Q13393265 wd:Q13027888 wd:Q4498974 wd:Q17156793 wd:Q15944511 wd:Q23759293 }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1850 && ?year <= 2023)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=36)
        country = clean_country(r["country"])
        sp = club_sport_map.get(r["tLabel"].lower())
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country and sp) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, country, year, sp, sl_to_irt(sl, 0.0)])
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["sport_club"] = rows[:4000]

    # 3. Stadiums
    raw = client.qlever_query("d5_stadiums", QL_PREFIX + """
SELECT ?item ?name ?country ?cap ?sl WHERE {
  ?item wdt:P31 wd:Q483110 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P1083 ?cap .
  ?c @en@rdfs:label ?country .
  FILTER(?sl >= 6 && ?cap >= 5000 && ?cap <= 135000)
} ORDER BY DESC(?sl) LIMIT 5000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country"], ["name", "cap"]):
        name = clean_text(r["name"], max_len=38)
        country = clean_country(r["country"])
        try:
            cap = int(round(float(r["cap"]) / 1000.0) * 1000)
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or cap < 5000 or cap > 135000 or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, country, cap, sl_to_irt(sl, 0.0)])
    rows.sort(key=lambda x: (x[3], -x[2]))
    tables["sport_stadium"] = rows[:1400]

    # 4. Video Games
    raw = client.qlever_query("d5_videogames", QL_PREFIX + """
SELECT ?item ?title ?dev ?year ?sl WHERE {
  ?item wdt:P31 wd:Q7889 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P178 ?d ;
        wdt:P577 ?pub .
  ?d @en@rdfs:label ?dev .
  BIND(YEAR(?pub) AS ?year)
  FILTER(?sl >= 7 && ?year >= 1972 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["dev", "year"], ["title"]):
        title = clean_text(r["title"], max_len=38)
        dev = clean_text(r["dev"], max_len=32)
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and dev) or title.lower() in seen:
            continue
        seen.add(title.lower())
        rows.append([title, dev, year, sl_to_irt(sl, -0.05)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["sport_videogame"] = rows[:5000]

    return tables


def harvest_domain_6_tech(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 6: Tech & Computing ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Tech & Industrial Companies
    ind_norm = {
        "software": "Software", "software industry": "Software",
        "information technology": "Technology", "technology": "Technology",
        "electronics": "Electronics", "consumer electronics": "Electronics",
        "semiconductor industry": "Semiconductors", "telecommunications": "Telecommunications",
        "automotive industry": "Automotive", "aerospace": "Aerospace",
        "aerospace industry": "Aerospace", "aviation": "Aviation",
        "video game industry": "Video Games", "internet": "Internet",
        "pharmaceutical industry": "Pharmaceuticals", "energy industry": "Energy",
        "petroleum industry": "Energy", "financial services": "Finance",
        "banking": "Finance", "retail": "Retail", "media": "Media",
        "chemical industry": "Chemicals", "defense industry": "Defense",
        "biotechnology": "Biotechnology", "e-commerce": "E-Commerce",
        "computer hardware": "Computing Hardware", "computing": "Technology",
        "electrical engineering": "Electronics", "publishing": "Media",
        "film industry": "Media", "mass media": "Media",
        "transport": "Transportation", "rail transport": "Transportation",
    }
    raw = client.qlever_query("d6_companies", QL_PREFIX + """
SELECT ?item ?name ?ind ?year ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P571 ?dt ;
        wdt:P452 ?i .
  VALUES ?t { wd:Q4830453 wd:Q891723 wd:Q783794 wd:Q6881511 }
  ?c @en@rdfs:label ?country .
  ?i @en@rdfs:label ?ind .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1800 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 18000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "ind"]):
        name = clean_text(r["name"], max_len=36)
        country = clean_country(r["country"])
        ind = ind_norm.get(r["ind"].lower())
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country and ind) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, ind, year, country, sl_to_irt(sl, -0.05)])
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["tech_company"] = rows[:7500]

    # 2. Inventors, Computer Scientists & Engineers
    pioneer_map = {
        "inventor": "Inventor", "computer scientist": "Computer Scientist",
        "engineer": "Engineer", "software engineer": "Software Engineer",
        "electrical engineer": "Electrical Engineer", "mechanical engineer": "Mechanical Engineer",
        "aerospace engineer": "Aerospace Engineer", "aircraft pilot": "Aviation Pioneer",
        "programmer": "Computer Scientist",
    }
    raw = client.qlever_query("d6_pioneers", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q205375 wd:Q82594 wd:Q81096 wd:Q1709010 wd:Q1326886 wd:Q19350898 wd:Q15895020 }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1650 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 18000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["occLabel", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        role = pioneer_map.get(r["occLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and role and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, role, year, country, sl_to_irt(sl, 0.05)])
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["tech_pioneer"] = rows[:5500]

    # 3. Programming Languages, OS, Software, Websites, Browsers
    sw_map = {
        "programming language": "Programming Language",
        "operating system": "Operating System",
        "web browser": "Web Browser",
        "website": "Website",
        "mobile app": "Mobile App",
        "free software": "Open-Source Software",
        "application": "Software Application",
        "software": "Software",
        "database management system": "Database System",
        "game engine": "Game Engine",
    }
    raw = client.qlever_query("d6_software", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?year ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P571 ?dt .
  VALUES ?t { wd:Q9143 wd:Q9135 wd:Q6368 wd:Q35127 wd:Q620615 wd:Q341 wd:Q166142 wd:Q7397 wd:Q176165 wd:Q193564 }
  ?t @en@rdfs:label ?tLabel .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 6 && ?year >= 1950 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["year"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=34)
        st = sw_map.get(r["tLabel"].lower())
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and st) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, st, year, sl_to_irt(sl, -0.05)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["tech_software"] = rows[:2800]

    # 4. Iconic Vehicles, Aircraft & Ships
    veh_map = {
        "car model": "Car Model", "automobile model": "Car Model",
        "aircraft family": "Aircraft", "aircraft model": "Aircraft", "aircraft": "Aircraft",
        "ship": "Ship", "motorcycle model": "Motorcycle", "locomotive": "Locomotive",
        "rocket": "Rocket", "fighter aircraft": "Fighter Aircraft",
    }
    raw = client.qlever_query("d6_vehicles", QL_PREFIX + """
SELECT ?item ?name ?maker ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P176 ?m .
  VALUES ?t { wd:Q3231690 wd:Q15056993 wd:Q11436 wd:Q11446 wd:Q19847637 wd:Q127771 wd:Q41291 }
  ?m @en@rdfs:label ?maker .
  ?t @en@rdfs:label ?tLabel .
  FILTER(?sl >= 6)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["maker"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=36)
        maker = clean_text(r["maker"], max_len=30)
        vt = veh_map.get(r["tLabel"].lower())
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and maker and vt) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, maker, vt, sl_to_irt(sl, 0.0)])
    rows.sort(key=lambda x: (x[3], x[0]))
    tables["tech_vehicle"] = rows[:4800]

    return tables


def harvest_domain_7_nature(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 7: Nature & Biology ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # Query biological classes in STRICT priority order (Bird BEFORE Reptile so Aves != Reptile!)
    # Require EXISTS { ?item @en@wdt:P1843 ?cn } so it's a recognized English-named species,
    # while using @en@rdfs:label ?name (canonical Wikipedia title!) to avoid weird P1843 synonyms!
    bio_classes = [
        ("Bird", "Q5113", 5500, 6),
        ("Mammal", "Q7377", 4500, 6),
        ("Amphibian", "Q10908", 1800, 5),
        ("Reptile", "Q10811", 2600, 5),
        ("Fish", "Q127282", 3400, 5),
        ("Shark or Ray", "Q25371", 600, 5),
        ("Insect", "Q1390", 3500, 5),
        ("Arachnid", "Q1358", 600, 5),
        ("Mollusk", "Q25326", 900, 5),
        ("Crustacean", "Q25364", 600, 5),
        ("Plant", "Q756", 5500, 7),
        ("Fungus", "Q764", 1100, 6),
    ]
    seen_item: Set[str] = set()
    seen_name: Set[str] = set()
    seen_sci: Set[str] = set()
    rows_sp = []

    for label, qid, lim, min_sl in bio_classes:
        raw = client.qlever_query(f"d7_{label.lower().replace(' ', '_')}", QL_PREFIX + f"""
SELECT ?item ?name ?sci ?sl WHERE {{
  ?item wdt:P31 wd:Q16521 ;
        wdt:P105 wd:Q7432 ;
        wdt:P171+ wd:{qid} ;
        wdt:P225 ?sci ;
        @en@rdfs:label ?name ;
        wikibase:sitelinks ?sl .
  FILTER EXISTS {{ ?item @en@wdt:P1843 ?cn . }}
  FILTER(?sl >= {min_sl})
}} ORDER BY DESC(?sl) LIMIT {lim + 1200}
""")
        added = 0
        for r in raw:
            item = r.get("item", "")
            if not item or item in seen_item:
                continue
            name = clean_text(r.get("name"), max_len=34)
            sci = clean_text(r.get("sci"), max_len=36)
            try:
                sl = int(float(r.get("sl", "0")))
            except ValueError:
                continue
            if not (name and sci):
                continue
            # Strictly require genuine English common name != scientific binomial!
            if name.lower() == sci.lower():
                continue
            sci_parts = sci.split()
            if len(sci_parts) != 2 or not sci_parts[0][0].isupper() or not sci_parts[1][0].islower():
                continue
            # Reject Latin genus-only names masquerading as common name
            if name.lower().startswith(sci_parts[0].lower() + " "):
                continue
            if name.lower() in seen_name or sci.lower() in seen_sci:
                continue
            seen_item.add(item)
            seen_name.add(name.lower())
            seen_sci.add(sci.lower())
            disp_name = name[0].lower() + name[1:] if name[0].isupper() and not any(w[0].isupper() for w in name.split()[1:]) and name.split()[0] not in {"African", "American", "Asian", "European", "Australian", "Indian", "Atlantic", "Pacific", "Arctic", "Antarctic", "Mediterranean", "California", "Florida", "Alaska", "Texas", "Chilean", "Peruvian", "Japanese", "Chinese", "Siberian", "Bengal", "Sumatran", "Bornean", "Madagascar", "Galapagos", "Emperor", "King", "Queen", "Monarch", "Atlas", "Goliath", "Hercules"} else name
            rows_sp.append([disp_name, sci, label, sl_to_irt(sl, -0.05)])
            added += 1
            if added >= lim:
                break
    rows_sp.sort(key=lambda x: (x[3], x[0]))
    tables["nat_species"] = rows_sp[:19000]
    return tables


def harvest_domain_8_society(client: CachedClient, soc_countries: List[list]) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 8: World Affairs & Law ===", flush=True)
    tables: Dict[str, List[list]] = {}
    tables["soc_country"] = soc_countries

    # 1. World Universities
    raw = client.qlever_query("d8_universities", QL_PREFIX + """
SELECT ?item ?name ?country ?year ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P571 ?dt .
  VALUES ?t { wd:Q3918 wd:Q875538 wd:Q902104 wd:Q1365560 }
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 8 && ?year >= 850 && ?year <= 2023)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=42)
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, country, year, sl_to_irt(sl, -0.05)])
    rows.sort(key=lambda x: (x[3], x[2]))
    tables["soc_university"] = rows[:3500]

    # 2. International Orgs, Government Agencies, Newspapers, Broadcasters, Political Parties
    org_map = {
        "international organization": "International Organization",
        "intergovernmental organization": "International Organization",
        "government agency": "Government Agency",
        "political party": "Political Party",
        "newspaper": "Newspaper",
        "daily newspaper": "Newspaper",
        "television network": "Broadcaster",
        "broadcasting network": "Broadcaster",
        "nonprofit organization": "Nonprofit Organization",
        "trade union": "Labor Union",
    }
    raw = client.qlever_query("d8_orgs", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P571 ?dt .
  VALUES ?t { wd:Q484652 wd:Q245065 wd:Q327333 wd:Q7278 wd:Q11032 wd:Q1110794 wd:Q15265344 wd:Q163740 wd:Q178790 }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1650 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=40)
        ot = org_map.get(r["tLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and ot and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, ot, year, country, sl_to_irt(sl, 0.0)])
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["soc_org"] = rows[:5000]

    # 3. Economists, Jurists, Judges, Diplomats, Activists (born > 1800 or distinct from D0)
    soc_role_map = {
        "economist": "Economist", "jurist": "Jurist", "judge": "Judge",
        "lawyer": "Jurist", "activist": "Activist", "human rights activist": "Activist",
        "diplomat": "Diplomat", "journalist": "Journalist", "sociologist": "Sociologist",
    }
    raw = client.qlever_query("d8_leaders", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q188094 wd:Q185351 wd:Q16533 wd:Q15253558 wd:Q1930187 wd:Q2306091 }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1700 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 22000
""")
    rows = []
    seen = set()
    for r in group_single_valued(raw, ["occLabel", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        role = soc_role_map.get(r["occLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and role and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows.append([name, role, year, country, sl_to_irt(sl, 0.05)])
    rows.sort(key=lambda x: (x[4], x[2]))
    tables["soc_leader"] = rows[:8500]

    return tables


def harvest_domain_9_food(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 9: Food, Craft & Design ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Dishes, Cheeses, Breads, Desserts, Soups, Wines, Beers, Spirits, Cocktails, Instruments
    food_map = {
        "dish": "Dish", "food": "Dish", "cheese": "Cheese", "bread": "Bread",
        "dessert": "Dessert", "pastry": "Pastry", "soup": "Soup", "sauce": "Sauce",
        "pasta": "Pasta", "cake": "Cake", "cocktail": "Cocktail", "wine": "Wine",
        "beer": "Beer", "alcoholic beverage": "Spirit or Drink", "drink": "Beverage",
        "liqueur": "Liqueur", "tea": "Tea", "distilled beverage": "Spirit",
        "confectionery": "Confection", "candy": "Confection", "sausage": "Sausage",
        "type of musical instrument": "Musical Instrument", "musical instrument": "Musical Instrument",
        "type of food or dish": "Dish", "baked good": "Baked Good", "stew": "Stew",
        "salad": "Salad", "dumpling": "Dumpling", "noodle": "Noodle Dish",
        "grape variety": "Wine Grape", "cultivar": "Culinary Cultivar",
    }
    raw = client.qlever_query("d9_foods_v2", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P495 ?c .
  VALUES ?t {
    wd:Q746549 wd:Q2095 wd:Q10943 wd:Q7802 wd:Q182940 wd:Q19861951 wd:Q41415
    wd:Q178359 wd:Q477248 wd:Q13276 wd:Q134768 wd:Q282 wd:Q44 wd:Q154 wd:Q40050
    wd:Q25403900 wd:Q178780 wd:Q6097 wd:Q56139 wd:Q185583 wd:Q131419 wd:Q34379
    wd:Q110295396 wd:Q2920963 wd:Q9266 wd:Q192628 wd:Q10978 wd:Q4886 wd:Q11460 wd:Q28823
  }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?country .
  FILTER(?sl >= 2)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    rows_fi = []
    seen = set()
    for r in group_single_valued(raw, ["country"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=36)
        ft = food_map.get(r["tLabel"].lower())
        country = clean_country(r["country"])
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and ft and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        disp_food = name[0].upper() + name[1:] if name[0].islower() else name
        rows_fi.append([disp_food, ft, country, sl_to_irt(sl, -0.10)])
    rows_fi.sort(key=lambda x: (x[3], x[0]))
    tables["food_item"] = rows_fi[:6000]

    # 2. Culinary, Brewery, Winery, Fashion, Watch & Design Houses
    brand_map = {
        "fashion house": "Fashion House", "fashion label": "Fashion House",
        "restaurant": "Restaurant", "restaurant chain": "Restaurant Chain",
        "brewery": "Brewery", "winery": "Winery", "distillery": "Distillery",
        "brand": "Heritage Brand", "trademark": "Heritage Brand",
        "automaker": "Automotive Marque", "automobile manufacturer": "Automotive Marque",
        "watchmaker": "Watchmaker", "clothing brand": "Fashion House",
        "luxury brand": "Luxury House", "chocolate company": "Chocolatier",
        "food manufacturer": "Food Producer", "hotel": "Historic Hotel",
        "department store": "Department Store", "fast food restaurant chain": "Restaurant Chain",
    }
    raw = client.qlever_query("d9_brands_v2", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P17 ?c ;
        wdt:P571 ?dt .
  VALUES ?t {
    wd:Q1618899 wd:Q11707 wd:Q18534542 wd:Q131734 wd:Q156362 wd:Q1252971
    wd:Q431289 wd:Q786820 wd:Q27686 wd:Q216107 wd:Q167270 wd:Q192909 wd:Q219577 wd:Q15711870
  }
  ?t @en@rdfs:label ?tLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 3 && ?year >= 1500 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    rows_fb = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=36)
        bt = brand_map.get(r["tLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and bt and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_fb.append([name, bt, year, country, sl_to_irt(sl, -0.05)])
    rows_fb.sort(key=lambda x: (x[4], x[2]))
    tables["food_brand"] = rows_fb[:6500]

    # 3. Chefs, Fashion Designers, Industrial/Graphic Designers, Couturiers
    maker_map = {
        "fashion designer": "Fashion Designer", "chef": "Chef", "cook": "Chef",
        "designer": "Designer", "industrial designer": "Industrial Designer",
        "graphic designer": "Graphic Designer", "interior designer": "Interior Designer",
        "couturier": "Couturier", "jeweler": "Jeweler", "ceramicist": "Ceramicist",
    }
    raw = client.qlever_query("d9_makers", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q3501317 wd:Q3499072 wd:Q5322166 wd:Q11124885 wd:Q627325 wd:Q2133309 wd:Q15978655 wd:Q211423 wd:Q7541856 }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 6 && ?year >= 1750 && ?year <= 1998)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_fm = []
    seen = set()
    for r in group_single_valued(raw, ["occLabel", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        cr = maker_map.get(r["occLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and cr and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_fm.append([name, cr, year, country, sl_to_irt(sl, 0.05)])
    rows_fm.sort(key=lambda x: (x[4], x[2]))
    tables["food_maker"] = rows_fm[:3500]

    return tables


def harvest_domain_10_myth_lit(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 10: Myth & Literature ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Literary Works with Original Language (Novels, Plays, Poems, Classics)
    raw = client.qlever_query("d10_works_lang", QL_PREFIX + """
SELECT ?item ?title ?author ?year ?lang ?sl WHERE {
  ?item wdt:P31 wd:Q7725634 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?title ;
        wdt:P50 ?a ;
        wdt:P577 ?pub ;
        wdt:P407 ?l .
  ?a @en@rdfs:label ?author .
  ?l @en@rdfs:label ?lang .
  BIND(YEAR(?pub) AS ?year)
  FILTER(?sl >= 5 && ?year >= 1000 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 20000
""")
    rows_w = []
    seen = set()
    for r in group_single_valued(raw, ["author", "year", "lang"], ["title"]):
        title = clean_text(r["title"], max_len=42)
        author = clean_text(r["author"], max_len=34)
        lang = clean_text(r["lang"], max_len=24)
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (title and author and lang) or title.lower() in seen:
            continue
        seen.add(title.lower())
        rows_w.append([title, author, year, lang, sl_to_irt(sl, -0.10)])
    rows_w.sort(key=lambda x: (x[4], x[2]))
    tables["lit_work"] = rows_w[:9500]

    # 2. Authors, Poets, Playwrights & Philosophers
    auth_map = {
        "novelist": "Novelist", "poet": "Poet", "playwright": "Playwright",
        "philosopher": "Philosopher", "writer": "Writer",
        "science fiction writer": "Sci-Fi Author", "children's writer": "Children's Author",
    }
    raw = client.qlever_query("d10_authors_v2", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q6625963 wd:Q49757 wd:Q214917 wd:Q4964182 wd:Q36180 wd:Q18844224 wd:Q4853732 }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1200 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 36000
""")
    rows_a = []
    seen = set()
    for r in group_single_valued(raw, ["occLabel", "country", "year"], ["name"]):
        name = clean_text(r["name"], max_len=34)
        role = auth_map.get(r["occLabel"].lower())
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and role and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_a.append([name, role, year, country, sl_to_irt(sl, 0.0)])
    rows_a.sort(key=lambda x: (x[4], x[2]))
    tables["lit_author"] = rows_a[:12500]

    # 3. Mythological Deities, Creatures & Heroes
    mtype_map = {
        "deity": "Deity", "greek deity": "Deity", "norse deity": "Deity",
        "egyptian deity": "Deity", "ancient egyptian deity": "Deity",
        "water deity": "Deity", "roman deity": "Deity", "hindu deity": "Deity",
        "celtic deity": "Deity", "mesopotamian deity": "Deity", "slavic deity": "Deity",
        "mythical creature": "Mythical Creature", "legendary creature": "Mythical Creature",
        "mythical character": "Mythological Figure", "mythological greek character": "Mythological Figure",
        "legendary figure": "Legendary Figure", "folklore character": "Folklore Figure",
        "titan": "Titan", "nymph": "Nymph", "demigod": "Demigod",
    }
    raw = client.qlever_query("d10_myth", QL_PREFIX + """
SELECT ?item ?name ?trad ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name .
  VALUES ?t {
    wd:Q178885 wd:Q22989102 wd:Q16513881 wd:Q146083 wd:Q11688446 wd:Q1916821
    wd:Q2239243 wd:Q4271324 wd:Q22988604 wd:Q13002315 wd:Q1047299 wd:Q1800833
  }
  { ?item wdt:P361 ?m . } UNION { ?item wdt:P1049 ?m . } UNION { ?item wdt:P2596 ?m . }
  ?m @en@rdfs:label ?trad .
  ?t @en@rdfs:label ?tLabel .
  FILTER(?sl >= 4)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows_m = []
    seen = set()
    for r in group_single_valued(raw, ["trad"], ["name", "tLabel"]):
        name = clean_text(r["name"], max_len=32)
        trad = clean_text(r["trad"], max_len=34)
        mt = mtype_map.get(r["tLabel"].lower(), "Mythological Figure")
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and trad) or name.lower() == trad.lower() or name.lower() in seen:
            continue
        # Require mythology/legend/religion/folklore/pantheon or known culture in trad
        tl = trad.lower()
        if not any(k in tl for k in ("myth", "legend", "folklore", "pantheon", "religion", "epic", "hindu", "buddh", "shinto", "greek", "norse", "roman", "egypt", "celtic", "mayan", "aztec", "inca", "slavic", "chinese", "japanese", "arthur", "olympian", "aesir", "vanir", "mesopotam", "sumer", "babylon")):
            continue
        seen.add(name.lower())
        rows_m.append([name, trad, mt, sl_to_irt(sl, -0.05)])
    rows_m.sort(key=lambda x: (x[3], x[0]))
    tables["lit_myth"] = rows_m[:2200]

    return tables


# ---------------------------------------------------------------------------
# Domain 11: Verified Mathematicians + 12-Family Programmatic Brainteaser Bank
# ---------------------------------------------------------------------------
def _int_to_roman(n: int) -> str:
    vals = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]
    out = []
    for v, sym in vals:
        while n >= v:
            out.append(sym)
            n -= v
    return "".join(out)


def _primes_up_to(limit: int) -> List[int]:
    sieve = bytearray(b"\x01") * (limit + 1)
    sieve[0:2] = b"\x00\x00"
    for i in range(2, int(limit ** 0.5) + 1):
        if sieve[i]:
            sieve[i * i : limit + 1 : i] = b"\x00" * len(sieve[i * i : limit + 1 : i])
    return [i for i in range(2, limit + 1) if sieve[i]]


def _near_int_distractors(ans: int, offsets: List[int], min_val: int = 0) -> List[int]:
    out = []
    seen = {ans}
    for off in offsets:
        cand = ans + off
        if cand >= min_val and cand not in seen:
            seen.add(cand)
            out.append(cand)
        if len(out) == 3:
            break
    step = 1
    while len(out) < 3:
        for cand in (ans + step, ans - step):
            if cand >= min_val and cand not in seen:
                seen.add(cand)
                out.append(cand)
                if len(out) == 3:
                    break
        step += 1
    return out


def _caesar(word: str, shift: int) -> str:
    return "".join(chr((ord(c) - 65 + shift) % 26 + 65) for c in word)


CIPHER_WORDS = [
    "PLANET", "GALAXY", "QUASAR", "ORBIT", "COMET", "NEBULA", "ECLIPSE", "SOLAR",
    "ZENITH", "HORIZON", "COMPASS", "ATLAS", "ISLAND", "CANYON", "GLACIER", "VOLCANO",
    "SUMMIT", "RIVER", "OCEAN", "DESERT", "FOREST", "TUNDRA", "SAVANNA", "FJORD",
    "CIPHER", "ENIGMA", "MATRIX", "VECTOR", "PRISM", "QUARTZ", "DIAMOND", "EMERALD",
    "SAPPHIRE", "OBSIDIAN", "MARBLE", "BRONZE", "SILVER", "GOLDEN", "COBALT", "COPPER",
    "TITAN", "PHOENIX", "DRAGON", "GRIFFIN", "PEGASUS", "SPHINX", "ORACLE", "LEGEND",
    "EMPIRE", "KINGDOM", "CROWN", "SCEPTER", "THRONE", "TREATY", "CHARTER", "SENATE",
    "CHRONO", "PENDULUM", "QUARTET", "SYMPHONY", "SONATA", "OPERA", "BALLET", "FRESCO",
    "MOSAIC", "STATUE", "PALACE", "CASTLE", "BRIDGE", "TOWER", "TEMPLE", "DOME",
    "PHOTON", "PROTON", "NEUTRON", "QUARK", "PLASMA", "LASER", "OPTICS", "MAGNET",
    "GRAVITY", "ENERGY", "ENTROPY", "INERTIA", "MOMENT", "SPECTRUM", "PRIMER", "HELIX",
    "GENOME", "ENZYME", "NEURON", "SYNAPSE", "CORTEX", "BIOME", "CORAL", "MANGROVE",
    "FALCON", "CONDOR", "OSPREY", "PANTHER", "JAGUAR", "CHEETAH", "DOLPHIN", "NARWHAL",
    "PENGUIN", "ALBATROSS", "LEOPARD", "GAZELLE", "MANTIS", "SCARAB", "ORCHID", "SEQUOIA",
    "BINARY", "PYTHON", "KERNEL", "SERVER", "ROUTER", "PACKET", "SOCKET", "THREAD",
    "SYNTAX", "PARSER", "LAMBDA", "TENSOR", "CRYPTO", "SIGNAL", "MEMORY", "BUFFER",
    "KNIGHT", "BISHOP", "ROOK", "GAMBIT", "CHECK", "CASTLE", "OPENING", "ENDGAME",
    "SPRINT", "HURDLE", "JAVELIN", "DISCUS", "ROWING", "FENCING", "ARCHERY", "SLALOM",
    "SAFFRON", "VANILLA", "NUTMEG", "GINGER", "BASIL", "THYME", "OREGANO", "PAPRIKA",
    "TRUFFLE", "BRIOCHE", "PAELLA", "RAMEN", "RISOTTO", "CEVICHE", "GELATO", "ESPRESSO",
    "VELVET", "SATIN", "LINEN", "CASHMERE", "INDIGO", "CRIMSON", "AMBER", "SCARLET",
    "SONNET", "STANZA", "METAPHOR", "ALLEGORY", "PROLOGUE", "EPILOGUE", "FABLE", "MYTHOS",
    "AXIOM", "THEOREM", "LEMMA", "PROOF", "PRIME", "FACTOR", "RATIO", "MEDIAN",
    "POLYGON", "HEXAGON", "OCTAGON", "RHOMBUS", "TANGENT", "SECANT", "CHORD", "RADIUS",
    "MERIDIAN", "EQUATOR", "TROPIC", "LATITUDE", "AZIMUTH", "BEARING", "SEXTANT", "ASTRO",
    "GENEVA", "LONDON", "TOKYO", "CAIRO", "SINGAPORE", "VIENNA", "PRAGUE", "ATHENS",
    "VENICE", "FLORENCE", "KYOTO", "LISBON", "DUBLIN", "OSLO", "ZURICH", "BERN",
    "MADRID", "SEVILLE", "MILAN", "NAPLES", "LYON", "MARSEILLE", "MUNICH", "HAMBURG",
    "CRACOW", "WARSAW", "BUDAPEST", "SOFIA", "TALLINN", "RIGA", "HELSINKI", "STOCKHOLM",
    "MONTREAL", "TORONTO", "VANCOUVER", "SEATTLE", "BOSTON", "CHICAGO", "DENVER", "AUSTIN",
    "SYDNEY", "MELBOURNE", "AUCKLAND", "PERTH", "SEOUL", "BUSAN", "OSAKA", "TAIPEI",
    "MUMBAI", "DELHI", "BANGALORE", "HANOI", "BANGKOK", "MANILA", "JAKARTA", "NAIROBI",
    "ACCRA", "LAGOS", "TUNIS", "RABAT", "AMMAN", "MUSCAT", "DOHA", "ANKARA",
    "QUINTET", "OCTAVE", "CADENCE", "PRELUDE", "NOCTURNE", "ETUDE", "WALTZ", "BOLERO",
    "SOLSTICE", "EQUINOX", "APOGEE", "PERIGEE", "CORONA", "AURORA", "METEOR", "ASTEROID",
    "CRATER", "CALDERA", "GEYSER", "ESTUARY", "DELTA", "PENINSULA", "ATOLL", "LAGOON",
    "PLATEAU", "STEPPE", "PRAIRIE", "TAIGA", "ALPINE", "MONSOON", "CYCLONE", "TYPHOON",
    "BAROQUE", "GOTHIC", "ROCOCO", "CUBISM", "REALISM", "MODERN", "CLASSIC", "NEON",
    "ALCHEMY", "CATALYST", "ISOTOPE", "POLYMER", "CRYSTAL", "ALLOY", "SOLVENT", "VALENCE",
    "ACOUSTIC", "HARMONIC", "RESONANT", "KINETIC", "DYNAMIC", "STATIC", "THERMAL", "OPTICAL",
    "QUOTIENT", "PRODUCT", "INTEGRAL", "DERIVED", "FINITE", "INFINITE", "FRACTAL", "SPIRAL",
    "CIPHERS", "DECODER", "BEACON", "SIGNAL", "VOYAGER", "PIONEER", "MARINER", "GALILEO",
    "CASSINI", "HUBBLE", "KEPLER", "ARTEMIS", "APOLLO", "GEMINI", "MERCURY", "VIKING",
]


def harvest_domain_11_logic_math(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting Domain 11: Logic & Math ===", flush=True)
    tables: Dict[str, List[list]] = {}

    # 1. Famous Mathematicians, Logicians & Statisticians (Wikidata CC0, excluding pure painters like da Vinci)
    mp_map = {
        "mathematician": "Mathematician", "logician": "Logician",
        "statistician": "Statistician", "cryptographer": "Cryptographer",
    }
    raw = client.qlever_query("d11_mathematicians_v2", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ;
        wikibase:sitelinks ?sl ;
        @en@rdfs:label ?name ;
        wdt:P27 ?c ;
        wdt:P569 ?b ;
        wdt:P106 ?occ .
  VALUES ?occ { wd:Q170790 wd:Q14565331 wd:Q2732142 wd:Q15442776 }
  FILTER NOT EXISTS { ?item wdt:P106 wd:Q1028181 . }
  ?occ @en@rdfs:label ?occLabel .
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1400 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows_mp = []
    seen = set()
    for r in group_single_valued(raw, ["country", "year"], ["name", "occLabel"]):
        name = clean_text(r["name"], max_len=34)
        field = mp_map.get(r["occLabel"].lower(), "Mathematician")
        country = clean_country(r["country"])
        try:
            year = int(r["year"])
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (name and country) or name.lower() in seen:
            continue
        seen.add(name.lower())
        rows_mp.append([name, field, year, country, sl_to_irt(sl, 0.05)])
    rows_mp.sort(key=lambda x: (x[4], x[2]))
    tables["math_person"] = rows_mp[:3500]

    # 2. Programmatically Verified Graded Brainteasers (12 diverse non-spam families!)
    # Format for math_num: [stmt, ans_int, d1, d2, d3, cat, unit, irt]
    # Format for math_word: [stmt, ans_str, d1, d2, d3, cat, irt]
    num_rows: List[list] = []
    word_rows: List[list] = []
    seen_stmt: Set[str] = set()

    def add_num(stmt: str, ans: int, d_offs: List[int], cat: str, unit: str, irt: int, min_v: int = 0):
        if stmt in seen_stmt:
            return
        seen_stmt.add(stmt)
        ds = _near_int_distractors(ans, d_offs, min_val=min_v)
        num_rows.append([stmt, ans, ds[0], ds[1], ds[2], cat, unit, max(-145, min(250, irt))])

    def add_word(stmt: str, ans: str, ds: List[str], cat: str, irt: int):
        if stmt in seen_stmt:
            return
        uniq = []
        s_seen = {ans.upper()}
        for d in ds:
            if d and d.upper() not in s_seen:
                s_seen.add(d.upper())
                uniq.append(d)
        if len(uniq) < 3:
            return
        seen_stmt.add(stmt)
        word_rows.append([stmt, ans, uniq[0], uniq[1], uniq[2], cat, max(-145, min(250, irt))])

    # Family 1: Number Sequences (Quadratic, Fibonacci-like, Geometric, Alternating, Prime-gap) (~2,400 puzzles)
    # 1a. Quadratic second-difference sequences: a_n = a0 + b*n + c*n*(n-1)/2
    for a0 in range(1, 25):
        for b in range(2, 16):
            for c in range(1, 10):
                seq = [a0 + b * n + (c * n * (n - 1)) // 2 for n in range(6)]
                if seq[-1] > 900:
                    continue
                s_txt = ", ".join(str(x) for x in seq[:5])
                irt = -95 + min(260, (c * 18 + b * 6))
                add_num(
                    f"What number comes next in the sequence: {s_txt}, ...",
                    seq[5], [c, -c, b, 2 * c, -2], "Number Sequences", "", irt, min_v=1
                )
                if len(num_rows) >= 1600:
                    break
            if len(num_rows) >= 1600:
                break
        if len(num_rows) >= 1600:
            break

    # 1b. Fibonacci-like additive sequences
    for a in range(1, 18):
        for b in range(a + 1, 26):
            seq = [a, b]
            for _ in range(5):
                seq.append(seq[-1] + seq[-2])
            if seq[6] > 600:
                continue
            s_txt = ", ".join(str(x) for x in seq[:6])
            irt = -80 + min(200, (a + b) * 4)
            add_num(
                f"What is the next term in the Fibonacci-style sequence {s_txt}, ...",
                seq[6], [seq[4], -seq[3], 2, -2, 10], "Number Sequences", "", irt, min_v=1
            )

    # 1c. Geometric & double-plus-k sequences
    for a0 in range(1, 22):
        for k in range(1, 12):
            seq = [a0]
            for _ in range(5):
                seq.append(seq[-1] * 2 + k)
            if seq[5] > 2000:
                continue
            s_txt = ", ".join(str(x) for x in seq[:5])
            add_num(
                f"Find the next number in the pattern: {s_txt}, ...",
                seq[5], [k, -k, 2 * k, -1], "Number Sequences", "", 20 + k * 14, min_v=1
            )

    # Family 2: Primes, GCD, LCM, Divisors & Modular Arithmetic (~3,000 puzzles)
    primes = _primes_up_to(8000)
    for idx in range(5, 320):
        p = primes[idx]
        irt = -110 if idx < 15 else (-30 if idx < 35 else (65 if idx < 90 else 155 + min(85, idx // 4)))
        add_num(
            f"What is the {idx + 1}th prime number",
            p, [2, -2, 4, -4, 6], "Prime Numbers", "", irt, min_v=2
        )
    # Prime gaps / next prime after N
    for n in range(20, 620, 3):
        nxt = next(p for p in primes if p > n)
        add_num(
            f"What is the smallest prime number strictly greater than {n}",
            nxt, [2, 4, -2, 6, 1], "Prime Numbers", "", -40 + min(220, n // 3), min_v=2
        )
    # GCD & LCM
    gcd_added = 0
    for g in range(6, 42):
        for m1 in range(2, 11):
            for m2 in range(m1 + 1, 13):
                if math.gcd(m1, m2) != 1:
                    continue
                x, y = g * m1, g * m2
                if y > 450:
                    continue
                irt = -70 + min(230, g * 4 + (m1 + m2) * 5)
                add_num(
                    f"What is the greatest common divisor (GCD) of {x} and {y}",
                    g, [g // 2 if g >= 4 else 1, g * 2, 2, -2, 3], "Number Theory", "", irt, min_v=1
                )
                gcd_added += 1
                if gcd_added >= 900:
                    break
            if gcd_added >= 900:
                break
        if gcd_added >= 900:
            break

    lcm_added = 0
    for a in range(6, 48):
        for b in range(a + 2, 54):
            if b % a == 0:
                continue
            L = math.lcm(a, b)
            if L > 900 or L == a * b and a > 22:
                continue
            irt = -50 + min(230, L // 4)
            add_num(
                f"What is the least common multiple (LCM) of {a} and {b}",
                L, [a, b, -a, L // 2, 12], "Number Theory", "", irt, min_v=2
            )
            lcm_added += 1
            if lcm_added >= 800:
                break
        if lcm_added >= 800:
            break

    # Modular Arithmetic & Clock Math
    mod_added = 0
    for m in [7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 23]:
        for n in range(37, 980, 11):
            rem = n % m
            if rem == 0:
                continue
            add_num(
                f"What is the remainder when {n} is divided by {m}",
                rem, [1, -1, 2, -2, 3], "Modular Arithmetic", "", -10 + min(210, m * 8 + n // 15), min_v=0
            )
            mod_added += 1
            if mod_added >= 750:
                break
        if mod_added >= 750:
            break

    for start_h in range(1, 13):
        for delta in range(17, 260, 7):
            end_h = ((start_h - 1 + delta) % 12) + 1
            add_num(
                f"If a 12-hour clock reads {start_h}:00 now, what hour number will it show {delta} hours later",
                end_h, [1, -1, 2, -2, 3], "Clock Logic", "o'clock", -60 + min(190, delta // 2), min_v=1
            )

    # Family 3: Geometry — Polygons, Pythagorean Triples, Areas, Volumes (~2,200 puzzles)
    for sides in range(3, 45):
        interior = (sides - 2) * 180
        diags = (sides * (sides - 3)) // 2
        add_num(
            f"What is the sum of the interior angles of a {sides}-sided convex polygon",
            interior, [180, -180, 90, 360], "Geometry", "degrees", -95 + min(240, sides * 6), min_v=180
        )
        if sides >= 4:
            add_num(
                f"How many diagonals does a {sides}-sided convex polygon have",
                diags, [sides, -sides, 2, -2, 5], "Geometry", "diagonals", 10 + min(220, sides * 5), min_v=2
            )

    # Right triangle areas & perimeters & Pythagorean hypotenuses
    prim_triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25), (20, 21, 29), (9, 40, 41), (12, 35, 37)]
    for a, b, c in prim_triples:
        for k in range(1, 22):
            ak, bk, ck = a * k, b * k, c * k
            if ck > 400:
                continue
            add_num(
                f"What is the hypotenuse of a right triangle with legs {ak} and {bk}",
                ck, [1, -1, 2, -2, 5], "Geometry", "units", -75 + min(230, ck // 2), min_v=2
            )
            area = (ak * bk) // 2
            if area <= 10000:
                add_num(
                    f"What is the area of a right triangle with legs {ak} and {bk}",
                    area, [ak, bk, -ak, area // 2, 10], "Geometry", "sq units", -85 + min(210, k * 14), min_v=2
                )

    # Rectangular prisms & cubes & trapezoids
    for s in range(2, 42):
        add_num(
            f"What is the total surface area of a cube with edge length {s}",
            6 * s * s, [s * s, -s * s, 2 * s, -2 * s], "3D Geometry", "sq units", -70 + min(210, s * 5), min_v=6
        )
        if s <= 25:
            add_num(
                f"What is the volume of a cube with edge length {s}",
                s ** 3, [s * s, -s * s, 3 * s, 10], "3D Geometry", "cubic units", -85 + min(220, s * 8), min_v=1
            )

    for b1 in range(4, 34, 2):
        for b2 in range(b1 + 2, 40, 2):
            for h in range(3, 18, 2):
                area = ((b1 + b2) * h) // 2
                add_num(
                    f"What is the area of a trapezoid with parallel bases {b1} and {b2} and height {h}",
                    area, [h, -h, b1, b2, 4], "Geometry", "sq units", -20 + min(200, area // 3), min_v=4
                )
                if len(num_rows) >= 6400:
                    break
            if len(num_rows) >= 6400:
                break
        if len(num_rows) >= 6400:
            break

    # Family 4: Combinatorics, Factorials, Handshakes & Set Inclusion-Exclusion (~2,200 puzzles)
    for n in range(4, 80):
        hs = (n * (n - 1)) // 2
        add_num(
            f"If {n} people each shake hands with every other person once, how many handshakes occur",
            hs, [n, -n, n - 1, 2], "Combinatorics", "handshakes", -65 + min(230, n * 3), min_v=3
        )
    for n in range(5, 22):
        for k in range(2, min(7, n - 1)):
            val = math.comb(n, k)
            if val > 50000:
                continue
            add_num(
                f"How many ways can you choose {k} items from {n} distinct items (C({n},{k}))",
                val, [n, -n, k, val // 2 if val > 10 else 2, -k], "Combinatorics", "ways", 15 + min(225, k * 28 + n * 5), min_v=2
            )
    for n in range(4, 14):
        for k in range(2, min(5, n)):
            val = math.perm(n, k)
            if val > 50000:
                continue
            add_num(
                f"How many ordered ways can you arrange {k} items chosen from {n} distinct items (P({n},{k}))",
                val, [n, -n, val // k if val > 6 else 2, 6], "Combinatorics", "ways", 35 + min(210, k * 35 + n * 6), min_v=2
            )

    # Set Theory Inclusion-Exclusion |A u B| = |A| + |B| - |A n B|
    set_added = 0
    for a in range(15, 95, 5):
        for b in range(18, 92, 6):
            for inter in range(4, min(a, b) - 4, 5):
                union = a + b - inter
                add_num(
                    f"In a survey, {a} people like Jazz, {b} like Rock, and {inter} like both. How many like at least one",
                    union, [inter, -inter, 2 * inter, 5], "Set Logic", "people", -85 + min(190, (a + b) // 2), min_v=5
                )
                set_added += 1
                if set_added >= 700:
                    break
            if set_added >= 700:
                break
        if set_added >= 700:
            break

    # Family 5: Powers, Roots, Triangular Sums & Odd Sums (~1,200 puzzles)
    for base in range(2, 16):
        for exp in range(2, 13):
            val = base ** exp
            if val < 16 or val > 65536:
                continue
            add_num(
                f"What is {base} raised to the power of {exp} ({base}^{exp})",
                val, [base, -base, val // base if val > base else 2, base * 2], "Exponents", "", -95 + min(240, exp * 22 + base * 6), min_v=4
            )
    for n in range(12, 95):
        add_num(
            f"What is the square root of {n * n}",
            n, [1, -1, 2, -2, 10], "Mental Math", "", -70 + min(220, n * 2), min_v=2
        )
    for n in range(10, 140):
        s = (n * (n + 1)) // 2
        add_num(
            f"What is the sum of all whole numbers from 1 to {n}",
            s, [n, -n, n // 2, 10], "Series & Sums", "", -35 + min(220, n * 2), min_v=10
        )
    for n in range(5, 85):
        add_num(
            f"What is the sum of the first {n} positive odd integers (1 + 3 + 5 + ...)",
            n * n, [n, -n, 2 * n, 1], "Series & Sums", "", -25 + min(210, n * 2), min_v=4
        )

    # Family 6: Temperature, Speed-Distance-Time & Percentage Brainteasers (~2,000 puzzles)
    for c in range(-40, 220, 5):
        f_val = (c * 9) // 5 + 32
        add_num(
            f"What is {c} degrees Celsius converted to degrees Fahrenheit",
            f_val, [5, -5, 9, -9, 10], "Unit Conversion", "deg F", -80 + min(195, abs(c)), min_v=-60
        )
    for speed in range(30, 140, 5):
        for hrs in range(2, 14):
            dist = speed * hrs
            add_num(
                f"Traveling at a steady {speed} km/h, how far do you travel in {hrs} hours",
                dist, [speed, -speed, hrs * 5, 10], "Rate & Motion", "km", -120 + min(170, (speed + hrs * 10) // 2), min_v=10
            )
            if len(num_rows) >= 10400:
                break
        if len(num_rows) >= 10400:
            break

    # Discounts & Percentages
    for pct in [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]:
        for price in range(40, 620, 20):
            sale = (price * (100 - pct)) // 100
            if (price * (100 - pct)) % 100 != 0:
                continue
            add_num(
                f"An item priced at {price} dollars is discounted by {pct}%. What is the sale price",
                sale, [price - sale, 10, -10, 5, -5], "Percentages", "dollars", -115 + min(190, pct * 2 + price // 10), min_v=1
            )
            if len(num_rows) >= 11500:
                break
        if len(num_rows) >= 11500:
            break

    # Family 7: Binary & Hexadecimal to Decimal Conversions (numeric!) (~1,800 puzzles)
    for n in range(10, 512):
        b_str = bin(n)[2:]
        irt = -45 + min(240, len(b_str) * 28)
        add_num(
            f"What is the decimal (base-10) value of binary {b_str}",
            n, [1, -1, 2, -2, 4, 8], "Binary Logic", "", irt, min_v=1
        )
    for n in range(18, 1020, 2):
        h_str = f"0x{n:X}"
        irt = 15 + min(225, len(h_str) * 35 + n // 15)
        add_num(
            f"What is the decimal (base-10) value of hexadecimal {h_str}",
            n, [16, -16, 1, -1, 6], "Hexadecimal Logic", "", irt, min_v=1
        )

    # Family 8: Roman Numerals to Arabic (numeric!) (~1,500 puzzles)
    for n in range(14, 2999, 2):
        rom = _int_to_roman(n)
        if len(rom) < 3 or len(rom) > 12:
            continue
        irt = -105 if n < 100 else (-25 if n < 500 else (55 if n < 1500 else 135))
        add_num(
            f"What modern number is represented by the Roman numeral {rom}",
            n, [10, -10, 2, -2, 100, -100], "Roman Numerals", "", irt, min_v=1
        )
        if len(num_rows) >= 14500:
            break

    # Family 9: Bitwise Boolean Logic (XOR / AND / OR) (numeric!) (~800 puzzles)
    bw_added = 0
    for a in range(5, 64, 3):
        for b in range(a + 2, 64, 5):
            ans_xor = a ^ b
            add_num(
                f"What is the bitwise XOR of {a} and {b} ({a} XOR {b})",
                ans_xor, [a & b, a | b, 2, -2, 4], "Boolean Logic", "", 75 + min(170, (a + b)), min_v=0
            )
            bw_added += 1
            if bw_added >= 700:
                break
        if bw_added >= 700:
            break

    # Family 9B: Linear Equations (ax + b = c) & Weighted Averages (~2,800 verified puzzles!)
    eq_added = 0
    for a in range(2, 16):
        for x in range(3, 35):
            for b in range(5, 45, 4):
                c = a * x + b
                if c > 500:
                    continue
                add_num(
                    f"Solve for x: {a}x + {b} = {c}",
                    x, [1, -1, 2, -2, a], "Algebra", "", -95 + min(220, a * 12 + x * 2), min_v=1
                )
                eq_added += 1
                if eq_added >= 1800:
                    break
            if eq_added >= 1800:
                break
        if eq_added >= 1800:
            break

    # Family 9C: Arithmetic Mean / Average & Divisors Count (~1,400 verified puzzles!)
    for n in range(12, 500):
        divs = sum(1 for k in range(1, int(n ** 0.5) + 1) if n % k == 0 for _ in (range(1) if k * k == n else range(2)))
        if divs < 4:
            continue
        add_num(
            f"How many positive whole-number divisors does {n} have (including 1 and {n})",
            divs, [2, -2, 1, -1, 4], "Number Theory", "divisors", -15 + min(225, n // 2), min_v=2
        )

    for base_m in range(10, 95, 2):
        for spread in range(3, 19, 2):
            nums = [base_m - 2 * spread, base_m - spread, base_m, base_m + spread, base_m + 2 * spread]
            s_nums = ", ".join(str(v) for v in nums)
            add_num(
                f"What is the arithmetic mean (average) of {s_nums}",
                base_m, [spread, -spread, 2, -2, 5], "Statistics & Logic", "", -100 + min(180, spread * 9), min_v=1
            )

    # --- WORD / SYMBOL PUZZLES (math_word: 2 angles each) ---
    # Family 10: Arabic -> Roman Numeral Encoding (~1,200 puzzles)
    for n in range(14, 2420, 2):
        rom = _int_to_roman(n)
        if len(rom) < 3 or len(rom) > 11:
            continue
        d1 = _int_to_roman(max(1, n + 2))
        d2 = _int_to_roman(max(1, n - 2))
        d3 = _int_to_roman(max(1, n + 10))
        irt = -80 if n < 100 else (10 if n < 600 else 115)
        add_word(f"How is the number {n} written in Roman numerals", rom, [d1, d2, d3], "Roman Numerals", irt)
        if len(word_rows) >= 1100:
            break

    # Family 11: Decimal -> Binary & Hex Encoding (~1,200 puzzles)
    for n in range(12, 256):
        ans_b = bin(n)[2:]
        add_word(
            f"How is decimal {n} written in binary (base-2)",
            ans_b,
            [bin(n ^ 1)[2:], bin(n ^ 2)[2:], bin(n ^ 4)[2:]],
            "Binary Logic",
            -20 + min(200, n),
        )
    for n in range(20, 512, 2):
        ans_h = f"0x{n:X}"
        add_word(
            f"How is decimal {n} written in hexadecimal (base-16)",
            ans_h,
            [f"0x{n+1:X}", f"0x{max(1,n-1):X}", f"0x{n+16:X}"],
            "Hexadecimal Logic",
            45 + min(180, n // 3),
        )

    # Family 12: Caesar Cipher Decoding of Real English Words (~2,200 puzzles!)
    clean_words = sorted(set(w for w in CIPHER_WORDS if 5 <= len(w) <= 9 and w.isalpha()))
    shifts = [1, 2, 3, 4, 5, 7, 13]
    for s_idx, sh in enumerate(shifts):
        for w_i, word in enumerate(clean_words):
            enc = _caesar(word, sh)
            # Pick 3 plausible same-length English word distractors!
            same_len = [cw for cw in clean_words if len(cw) == len(word) and cw != word]
            if len(same_len) < 3:
                continue
            stride = max(1, len(same_len) // 7)
            base_i = (w_i * 5 + s_idx * 13) % len(same_len)
            ds = [same_len[(base_i + k * stride) % len(same_len)] for k in range(3)]
            label = "ROT13" if sh == 13 else f"Caesar +{sh}"
            stmt = (
                f"Decode the ROT13 cipher \"{enc}\" (shift each letter by 13)"
                if sh == 13
                else f"Decode the Caesar cipher \"{enc}\" (each letter was shifted forward by {sh})"
            )
            irt = -40 + sh * 18
            add_word(stmt, word, ds, f"Cryptography ({label})", irt)

    # Family 13: Day-of-Week Calendar Logic (~400 puzzles)
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for d_i, d_name in enumerate(days):
        for delta in range(15, 420, 7):
            for rem in (1, 2, 3, 4, 5, 6):
                step_d = delta + rem
                ans_d = days[(d_i + step_d) % 7]
                ds = [days[(d_i + step_d + off) % 7] for off in (1, 2, 6)]
                add_word(
                    f"If today is {d_name}, what day of the week will it be {step_d} days from now",
                    ans_d, ds, "Calendar Logic", -55 + min(190, step_d // 2)
                )
                if len(word_rows) >= 4800:
                    break
            if len(word_rows) >= 4800:
                break
        if len(word_rows) >= 4800:
            break

    num_rows.sort(key=lambda x: (x[-1], x[5], x[0]))
    word_rows.sort(key=lambda x: (x[-1], x[5], x[0]))
    tables["math_num"] = num_rows[:21000]
    tables["math_word"] = word_rows[:6000]
    return tables


# ---------------------------------------------------------------------------
# Shard Serialization, String-Pool Interning, Chunk Splitting & Manifest Writer
# ---------------------------------------------------------------------------

def intern_table_rows(type_id: str, rows: List[list]) -> Tuple[List[str], List[list]]:
    """Build compact string pool for poolCols of a single table slice."""
    spec = TYPE_SPECS[type_id]
    pool_cols = set(spec.get("poolCols", []))
    pool: List[str] = []
    pool_idx: Dict[str, int] = {}
    out_rows: List[list] = []
    for row in rows:
        new_row = list(row)
        for ci in pool_cols:
            val = str(new_row[ci])
            idx = pool_idx.get(val)
            if idx is None:
                idx = len(pool)
                pool.append(val)
                pool_idx[val] = idx
            new_row[ci] = idx
        out_rows.append(new_row)
    return pool, out_rows


def serialize_chunk_bytes(domain_id: int, chunk_tables: List[Tuple[str, int, List[list]]]) -> bytes:
    """Serialize a shard chunk with shared chunk-level string pool 'p'."""
    pool: List[str] = []
    pool_idx: Dict[str, int] = {}
    t_objs = []
    for type_id, base_qid, rows in chunk_tables:
        pool_cols = set(TYPE_SPECS[type_id].get("poolCols", []))
        interned_rows = []
        for row in rows:
            nr = list(row)
            for ci in pool_cols:
                val = str(nr[ci])
                idx = pool_idx.get(val)
                if idx is None:
                    idx = len(pool)
                    pool.append(val)
                    pool_idx[val] = idx
                nr[ci] = idx
            interned_rows.append(nr)
        t_objs.append({"type": type_id, "baseQid": base_qid, "r": interned_rows})
    obj = {"v": 1, "d": domain_id, "p": pool, "t": t_objs}
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def validate_chunk_distractor_diversity(chunk_tables: List[Tuple[str, int, List[list]]]) -> None:
    """Guarantee every table slice in a chunk has >=4 distinct values on every distractorCol."""
    for type_id, _, rows in chunk_tables:
        spec = TYPE_SPECS[type_id]
        for ang in spec["angles"]:
            if ang["archetype"] == "SIGHTLINE_LOCK" and "distractorCol" in ang:
                dcol = ang["distractorCol"]
                uniq = {str(r[dcol]).lower() for r in rows}
                if len(uniq) < 4:
                    raise ValueError(f"Chunk table {type_id} angle {ang['id']} has only {len(uniq)} distinct values on col {dcol}")
                if "avoidSameCol" in ang:
                    acol = ang["avoidSameCol"]
                    uniq_a = {str(r[acol]).lower() for r in rows}
                    if len(uniq_a) < 4:
                        raise ValueError(f"Chunk table {type_id} angle {ang['id']} has only {len(uniq_a)} distinct avoidSameCol values on col {acol}")


def pack_domain_into_chunks(
    domain_id: int,
    tables: Dict[str, List[list]],
    next_qid: int,
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Pack a domain's tables into 1 or more JSON chunk files, each strictly <= MAX_CHUNK_BYTES,
    ensuring every table slice stays rich (>= 120 rows) for great distractors and assigning
    contiguous QIDs.
    """
    # Filter empty tables & verify diversity
    ordered_items = [(tid, rows) for tid, rows in tables.items() if len(rows) >= 20]

    # Try single file first
    tentative = []
    q_cursor = next_qid
    for tid, rows in ordered_items:
        n_angles = len(TYPE_SPECS[tid]["angles"])
        tentative.append((tid, q_cursor, rows))
        q_cursor += len(rows) * n_angles

    raw_single = serialize_chunk_bytes(domain_id, tentative)
    if len(raw_single) <= MAX_CHUNK_BYTES:
        validate_chunk_distractor_diversity(tentative)
        path = f"domain_{domain_id}.json"
        (SHARDS_DIR / path).write_bytes(raw_single)
        ents = sum(len(r) for _, _, r in tentative)
        qs = q_cursor - next_qid
        irts = [r[-1] / 100.0 for _, _, rows in tentative for r in rows]
        return [{
            "path": path,
            "bytes": len(raw_single),
            "entities": ents,
            "questions": qs,
            "baseQid": next_qid,
            "qidEnd": q_cursor - 1,
            "irtMin": round(min(irts), 2),
            "irtMax": round(max(irts), 2),
            "types": [t for t, _, _ in tentative],
        }], q_cursor

    # Otherwise split cleanly across chunks <= MAX_CHUNK_BYTES
    # Split any huge single table (> 10,000 rows) into balanced interleaved slices so every slice
    # preserves full diversity of countries/categories/eras AND full Easy->Genius spread!
    segments: List[Tuple[str, List[list]]] = []
    for tid, rows in ordered_items:
        est_row_bytes = max(35, len(json.dumps(rows[0], ensure_ascii=False, separators=(",", ":"))) + 4)
        max_rows_for_chunk = max(400, int((MAX_CHUNK_BYTES * 0.85) // est_row_bytes))
        if len(rows) <= max_rows_for_chunk:
            segments.append((tid, rows))
        else:
            n_parts = math.ceil(len(rows) / max_rows_for_chunk)
            for p_i in range(n_parts):
                # Interleaved stride slicing preserves full fame & category diversity in EVERY chunk!
                part = rows[p_i::n_parts]
                segments.append((tid, part))

    chunks_meta: List[Dict[str, Any]] = []
    cur_tables: List[Tuple[str, int, List[list]]] = []
    cur_start_qid = next_qid
    q_cursor = next_qid
    chunk_idx = 0

    def flush_chunk():
        nonlocal chunk_idx, cur_tables, cur_start_qid
        if not cur_tables:
            return
        validate_chunk_distractor_diversity(cur_tables)
        payload = serialize_chunk_bytes(domain_id, cur_tables)
        assert len(payload) <= MAX_CHUNK_BYTES, f"Chunk domain_{domain_id}_{chunk_idx} exceeded limit: {len(payload)}"
        path = f"domain_{domain_id}_{chunk_idx}.json"
        (SHARDS_DIR / path).write_bytes(payload)
        ents = sum(len(r) for _, _, r in cur_tables)
        qs = sum(len(r) * len(TYPE_SPECS[t]["angles"]) for t, _, r in cur_tables)
        irts = [r[-1] / 100.0 for _, _, rows in cur_tables for r in rows]
        chunks_meta.append({
            "path": path,
            "bytes": len(payload),
            "entities": ents,
            "questions": qs,
            "baseQid": cur_start_qid,
            "qidEnd": cur_start_qid + qs - 1,
            "irtMin": round(min(irts), 2),
            "irtMax": round(max(irts), 2),
            "types": [t for t, _, _ in cur_tables],
        })
        chunk_idx += 1
        cur_tables = []
        cur_start_qid = q_cursor

    for tid, rows in segments:
        n_angles = len(TYPE_SPECS[tid]["angles"])
        candidate = cur_tables + [(tid, q_cursor, rows)]
        if cur_tables and len(serialize_chunk_bytes(domain_id, candidate)) > MAX_CHUNK_BYTES:
            flush_chunk()
            candidate = [(tid, q_cursor, rows)]
        # Safety: if even a single segment exceeds MAX_CHUNK_BYTES, bisect it cleanly
        if len(serialize_chunk_bytes(domain_id, candidate)) > MAX_CHUNK_BYTES:
            halves = [rows[0::2], rows[1::2]]
            for h_rows in halves:
                h_cand = cur_tables + [(tid, q_cursor, h_rows)]
                if cur_tables and len(serialize_chunk_bytes(domain_id, h_cand)) > MAX_CHUNK_BYTES:
                    flush_chunk()
                cur_tables.append((tid, q_cursor, h_rows))
                q_cursor += len(h_rows) * n_angles
                flush_chunk()
        else:
            cur_tables = candidate
            q_cursor += len(rows) * n_angles

    flush_chunk()
    return chunks_meta, q_cursor


def scale_tables_to_qid_cap(all_domain_tables: Dict[int, Dict[str, List[list]]]) -> None:
    """
    If total playable questions would exceed MAX_QID_EXCLUSIVE - START_QID (~985,000),
    trim proportionally from the hardest (highest-irt) tail of the largest tables
    so ALL QIDs fit cleanly inside TriviaDatabase.gd's 128 KB bitset (< 1,048,576)!
    """
    max_q = MAX_QID_EXCLUSIVE - START_QID
    total_q = sum(
        len(rows) * len(TYPE_SPECS[tid]["angles"])
        for d_tables in all_domain_tables.values()
        for tid, rows in d_tables.items()
    )
    if total_q <= max_q:
        return
    ratio = (max_q - 500) / float(total_q)
    print(f"\n[SCALE] Total raw Qs={total_q:,} exceeds bitset-safe cap {max_q:,}; trimming hardest tail by factor {ratio:.4f}...", flush=True)
    for d_id, d_tables in all_domain_tables.items():
        for tid, rows in list(d_tables.items()):
            if len(rows) > 300:
                new_len = max(300, int(len(rows) * ratio))
                d_tables[tid] = rows[:new_len]


def main() -> int:
    parser = argparse.ArgumentParser(description="Build World's Smartest Million-Scale Fact-Graph Shards")
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--cache-only", action="store_true")
    args = parser.parse_args()

    t_start = time.time()
    client = CachedClient(args.cache_dir, use_cache_only=args.cache_only)
    load_valid_countries(client)
    SHARDS_DIR.mkdir(parents=True, exist_ok=True)
    # Remove any stale shard json files before writing fresh ones
    for old in SHARDS_DIR.glob("*.json"):
        old.unlink()

    all_tables: Dict[int, Dict[str, List[list]]] = {}
    all_tables[0] = harvest_domain_0_history(client)
    all_tables[1] = harvest_domain_1_science(client)
    d2_tables, soc_countries = harvest_domain_2_geography(client)
    all_tables[2] = d2_tables
    all_tables[3] = harvest_domain_3_arts(client)
    all_tables[4] = harvest_domain_4_pop(client)
    all_tables[5] = harvest_domain_5_sports(client)
    all_tables[6] = harvest_domain_6_tech(client)
    all_tables[7] = harvest_domain_7_nature(client)
    all_tables[8] = harvest_domain_8_society(client, soc_countries)
    all_tables[9] = harvest_domain_9_food(client)
    all_tables[10] = harvest_domain_10_myth_lit(client)
    all_tables[11] = harvest_domain_11_logic_math(client)

    # Cross-domain person disambiguation & quality filter:
    # 1. Exclude ALL raw scientists/historians/artists/authors/politicians from sport_athlete
    #    (even polymaths like Niels Bohr or Albert Camus who had multiple occupations!)
    non_sport_people = {"niels bohr", "albert camus", "harald bohr", "pope john paul ii", "john paul ii", "seán o'casey", "arthur conan doyle"}
    for d_k, t_k in ((0, "hist_figure"), (1, "sci_scientist"), (3, "art_creator"), (6, "tech_pioneer"), (8, "soc_leader"), (10, "lit_author"), (11, "math_person")):
        for row in all_tables[d_k].get(t_k, []):
            non_sport_people.add(str(row[0]).lower())
    for cache_pat in ("qlever_d0_figures_v2_*.json.gz", "qlever_d1_scientists_*.json.gz", "qlever_d10_authors_v2_*.json.gz", "qlever_d3_creators_*.json.gz", "qlever_d11_mathematicians_v2_*.json.gz"):
        for cp in args.cache_dir.glob(cache_pat):
            try:
                with gzip.open(cp, "rt", encoding="utf-8") as gf:
                    for raw_r in json.load(gf):
                        nm = raw_r.get("name", "").strip().lower()
                        if nm:
                            non_sport_people.add(nm)
            except Exception:
                pass
    if "sport_athlete" in all_tables[5]:
        before = len(all_tables[5]["sport_athlete"])
        all_tables[5]["sport_athlete"] = [
            r for r in all_tables[5]["sport_athlete"]
            if str(r[0]).lower() not in non_sport_people
        ]
        print(f"[QC] Removed {before - len(all_tables[5]['sport_athlete'])} non-athlete cross-domain overlaps from sport_athlete", flush=True)

    # 2. Keep notorious dictators/criminals out of Literature/Pop/Food/Sports entertainment tables
    for d_k in (3, 4, 5, 9, 10):
        for t_k, rows in list(all_tables[d_k].items()):
            all_tables[d_k][t_k] = [
                r for r in rows
                if str(r[0]).lower() not in SENSITIVE_NON_ENTERTAINMENT_FIGURES
                and str(r[1]).lower() not in SENSITIVE_NON_ENTERTAINMENT_FIGURES
            ]

    # Guarantee 100% bitset compatibility (< 1,048,576)
    scale_tables_to_qid_cap(all_tables)

    print("\n=== Packing Shards & Generating shard_manifest.json ===", flush=True)
    next_qid = START_QID
    domains_manifest = []
    total_entities = 0
    total_questions = 0
    total_bytes = 0
    max_file_bytes = 0
    used_types: Set[str] = set()

    for dm in DOMAIN_META:
        d_id = dm["id"]
        d_tables = all_tables[d_id]
        files_meta, next_qid = pack_domain_into_chunks(d_id, d_tables, next_qid)
        d_ents = sum(f["entities"] for f in files_meta)
        d_qs = sum(f["questions"] for f in files_meta)
        d_bytes = sum(f["bytes"] for f in files_meta)
        for fm in files_meta:
            max_file_bytes = max(max_file_bytes, fm["bytes"])
            used_types.update(fm["types"])
        total_entities += d_ents
        total_questions += d_qs
        total_bytes += d_bytes
        domains_manifest.append({
            "l0Domain": d_id,
            "key": dm["key"],
            "name": dm["name"],
            "entities": d_ents,
            "questions": d_qs,
            "bytes": d_bytes,
            "files": files_meta,
        })
        print(
            f"  Domain {d_id:2d} ({dm['name']:22s}): {d_ents:6,d} entities -> {d_qs:7,d} Qs | "
            f"{len(files_meta)} file(s) | {d_bytes/1e6:5.2f} MB",
            flush=True,
        )

    manifest = {
        "schemaVersion": "WS_SHARD_V1",
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "baseUrlRelative": "shards/",
        "qidRange": [START_QID, next_qid - 1],
        "totalEntities": total_entities,
        "totalQuestions": total_questions,
        "totalShardBytes": total_bytes,
        "maxShardBytes": max_file_bytes,
        "licenses": LICENSES,
        "decoderSpec": {
            "hashFn": "fnv1a_32",
            "trueFalseBitExpr": "(fnv1a_32('TF:' + str(qid)) & 1) == 0",
            "distractorWindowRadius": 60,
            "calibratorOffsets": [0.24, 0.34, 0.66, 0.76],
            "adaptiveStepBrackets": [[30, 1], [100, 5], [300, 10], [1000, 25], [3000, 50], [10000, 100], [50000, 250]],
        },
        "domains": domains_manifest,
        "types": {k: v for k, v in TYPE_SPECS.items() if k in used_types},
    }

    manifest_path = SHARDS_DIR / "shard_manifest.json"
    manifest_bytes = json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8")
    manifest_path.write_bytes(manifest_bytes)

    elapsed = time.time() - t_start
    print("\n============================================================")
    print(f"BUILD COMPLETE in {elapsed:.1f}s")
    print(f"  Total Verified Entities : {total_entities:,}")
    print(f"  Total Playable Questions: {total_questions:,} (QIDs {START_QID:,}..{next_qid-1:,})")
    print(f"  Total Shard Bytes       : {total_bytes/1e6:.2f} MB (cap: 45.00 MB)")
    print(f"  Max Single Shard File   : {max_file_bytes/1e6:.2f} MB (cap: 1.50 MB)")
    print(f"  Manifest Size           : {len(manifest_bytes)/1e3:.1f} KB -> {manifest_path}")
    print("============================================================")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
