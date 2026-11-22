#!/usr/bin/env python3
"""
WORLD'S SMARTEST — Automated FORGE Open-Knowledge Ingestion & Verification Pipeline
===================================================================================
Expands the live verified trivia database from 832 hand-verified Gold questions to
3,500–4,500+ unique, factually accurate, zero-duplicate, zero-slop questions across
all 12 L0 Domains and all 5 3D Prism Archetypes, exported identically as compact
schemaVersion 2.0.0 JSON to:
  - godot/data/questions.json
  - public/data/questions.json

Authoritative Open-Knowledge Sources (zero-auth, verified):
  0. Gold Core (QIDs 1..832) — preserved 100% intact at the front of the catalog
  1. The Trivia API v2 (https://the-trivia-api.com/v2/questions)
     Wikipedia-checked trivia with verified hints, explanations, and topic tags
  2. Open Trivia Database (https://opentdb.com/api.php)
     Session-token rate-limited verified multiple-choice + boolean (Gauntlet) sets
  3. Authoritative UN/ISO Country & World Bank 2025 Data
     - mledoze/countries (canonical upstream JSON dataset of REST Countries;
       restcountries.com v3.1/v5 returned legacy deprecation notice)
     - World Bank API v2 (SP.POP.TOTL official population indicator)
  4. IUPAC Periodic Table JSON + Official Nobel Prize Foundation API v2.1
     - Bowserinator/Periodic-Table-JSON (118 verified IUPAC elements)
     - https://api.nobelprize.org/2.1/nobelPrizes (official Nobel citations)
  5. Deterministic Textbook / SI / NASA / Pure-Math Verified Reference Datasets
     (Solar System, Computing/RFCs/Languages, SI Units, Computed Math/Logic,
      World Mythology/Philosophy, History Timelines, Arts/Literature, Sports
      Rules & Olympics, Culinary Craft, and Nature/Biology)

Usage:
  python tools/forge_expand_catalog.py
"""

from __future__ import annotations

import datetime as dt
import gzip
import hashlib
import html
import io
import json
import math
import random
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

# ============================================================================
# 1. FORGE SCHEMA CONTRACTS & BUDGETS
# ============================================================================

ROOT = Path(__file__).resolve().parent.parent
GODOT_OUT = ROOT / "godot" / "data" / "questions.json"
WEB_OUT = ROOT / "public" / "data" / "questions.json"

GOLD_COUNT = 832
MIN_TOTAL_TARGET = 3000

VALID_DOMAINS = set(range(12))
DOMAIN_NAMES = [
    "0:History",
    "1:Science",
    "2:Geography",
    "3:Arts",
    "4:Pop",
    "5:Sports",
    "6:Tech",
    "7:Nature",
    "8:Society",
    "9:Food",
    "10:Myth",
    "11:Logic",
]

DOMAIN_GLYPHS: dict[int, tuple[str, ...]] = {
    0: ("crown", "scroll", "compass"),
    1: ("atom", "star", "wave"),
    2: ("globe", "compass", "wave"),
    3: ("column", "scroll", "wave"),
    4: ("mask", "wave", "eye"),
    5: ("flame", "prism", "crown"),
    6: ("gear", "rocket", "wave"),
    7: ("dna", "wave", "eye"),
    8: ("scales", "globe", "scroll"),
    9: ("compass", "flame", "dna"),
    10: ("scroll", "eye", "prism"),
    11: ("prism", "scales", "scroll"),
}

DOMAIN_DEFAULT_TAGS: dict[int, list[str]] = {
    0: ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
    1: ["HORIZON_TECH", "ARCHIVE_CORE"],
    2: ["AGORA_CIVIC", "ARCHIVE_CORE"],
    3: ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
    4: ["AGORA_CIVIC", "CURRENT_PULSE"],
    5: ["AGORA_CIVIC", "RIVAL_PRESSURE"],
    6: ["HORIZON_TECH", "LATERAL_DEDUCTION"],
    7: ["AGORA_CIVIC", "ARCHIVE_CORE"],
    8: ["SOVEREIGN_BLOC", "ETHICS"],
    9: ["AGORA_CIVIC", "ARCHIVE_CORE"],
    10: ["SOVEREIGN_BLOC", "LATERAL_DEDUCTION"],
    11: ["HORIZON_TECH", "LATERAL_DEDUCTION"],
}

VALID_GLYPHS = {
    "globe", "atom", "crown", "dna", "compass", "prism", "scales", "column",
    "rocket", "gear", "mask", "flame", "eye", "wave", "star", "scroll",
}

VALID_ARCHETYPES = {
    "SIGHTLINE_LOCK",
    "CODEX_DUAL_RING",
    "CALIBRATOR_DIAL",
    "GAUNTLET_SHATTER",
    "HERO_ARTIFACT_SYNTHESIS",
}

VALID_RELICS = {
    "meridian_astrolabe",
    "armillary_orrery",
    "origami_prism",
    "emerald_sphere",
    "cipher_box",
    "cryo_relay",
    "council_seal",
    "master_ledger",
}

CAMPAIGN_COUNTRY_RELIC = {
    "CH": "meridian_astrolabe",
    "GB": "armillary_orrery",
    "JP": "origami_prism",
    "BR": "emerald_sphere",
    "EG": "cipher_box",
    "IS": "cryo_relay",
    "SG": "council_seal",
    "GLOBAL": "master_ledger",
}

VALID_REGIONS = set(CAMPAIGN_COUNTRY_RELIC.keys())

VALID_TAGS = {
    "SOVEREIGN_BLOC", "HORIZON_TECH", "AGORA_CIVIC", "MERIDIAN_ZERO",
    "BLACK_SALON", "ESPIONAGE", "ETHICS", "HIGH_POWER", "INVESTIGATIVE",
    "LATERAL_DEDUCTION", "CLASSIFIED_LEDGER", "HIGH_STAKES_BLUFF",
    "ARCHIVE_CORE", "CURRENT_PULSE", "RIVAL_PRESSURE", "FINALE_SYNTHESIS",
}

VALID_TONES = {"PRESTIGE", "WITTY", "THRILLER", "CRYPTIC"}
VALID_FRESHNESS = {"EVERGREEN", "SLOW_DRIFT", "CURRENT_EVENTS"}

BUDGETS = {
    "promptMin": 15,
    "promptMax": 140,
    "answerMax": 28,
    "distractorMax": 28,
    "codexLabelMax": 28,
    "clue0Min": 8,
    "clue0Max": 90,
    "clue1Min": 8,
    "clue1Max": 80,
    "whyMin": 20,
    "whyMax": 180,
}

REGION_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("CH", re.compile(r"\b(switzerland|swiss|geneva|zurich|bern|cern|basel|lausanne)\b", re.I)),
    ("GB", re.compile(r"\b(united kingdom|britain|british|england|english|london|scotland|scottish|wales|welsh|oxford|cambridge|thames|westminster|greenwich)\b", re.I)),
    ("JP", re.compile(r"\b(japan|japanese|tokyo|kyoto|osaka|hiroshima|shogun|samurai|fuji|honshu|hokkaido)\b", re.I)),
    ("BR", re.compile(r"\b(brazil|brazilian|rio de janeiro|brasilia|sao paulo|amazonas|copa|carnival)\b", re.I)),
    ("EG", re.compile(r"\b(egypt|egyptian|cairo|alexandria|giza|pharaoh|nile|suez|luxor|tutankhamun|cleopatra)\b", re.I)),
    ("IS", re.compile(r"\b(iceland|icelandic|reykjavik|eyjafjallajokull|althing|thingvellir)\b", re.I)),
    ("SG", re.compile(r"\b(singapore|singaporean|malacca|merlion)\b", re.I)),
]

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "being", "by", "can",
    "did", "do", "does", "for", "from", "had", "has", "have", "he", "her",
    "his", "how", "i", "in", "into", "is", "it", "its", "made", "make", "many",
    "more", "most", "name", "not", "of", "on", "one", "or", "other", "over",
    "she", "so", "some", "such", "than", "that", "the", "their", "them",
    "there", "these", "they", "this", "those", "through", "to", "two", "under",
    "up", "was", "we", "were", "what", "when", "where", "which", "who", "whom",
    "whose", "why", "will", "with", "would", "you", "your", "known", "called",
    "famous", "world", "first", "used", "found", "city", "country", "state",
    "number", "year", "term", "word", "part", "type", "form", "large", "largest",
    "small", "smallest", "long", "longest", "high", "highest",
}

GENERIC_ANSWER_TOKENS = {
    "united", "states", "republic", "kingdom", "empire", "great", "north",
    "south", "east", "west", "central", "new", "saint", "islands", "island",
    "river", "mount", "mountain", "ocean", "sea", "lake", "gulf", "strait",
    "city", "capital", "national", "international", "american", "british",
    "french", "german", "chinese", "japanese", "russian", "indian", "african",
    "european", "dollar", "pound", "franc", "peso", "rupee", "crown", "krone",
    "dinar", "dirham", "shilling", "ruble", "system", "theory", "effect",
    "order", "house", "award", "prize", "metal", "nonmetal", "earth", "noble",
    "black", "white", "green", "blue", "gold", "silver", "iron", "royal",
}

HTML_ARTIFACT_RE = re.compile(r"&(?:[a-zA-Z]{2,12}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
HTML_TAG_RE = re.compile(r"</?[a-zA-Z][^>]*>")
SENTENCE_END_RE = re.compile(r'[.!?"\'\u201d\u2019\)]$')

TYPO_OR_SLOP_RE = re.compile(
    r"\b(Britian|World War ll|delevoped|mytological|manfacturer|originiate|EPOX|Grumpy Cat|LS1 engine|LS7 engine|Untied States|Recieve|Occured|Seperate|Definately|Goverment)\b"
    r"|with tank was the most fear|Who in [^?]+, who |animals are not real|first official international game played|\ba german soldier\b",
    re.I,
)

EASY_ICONIC_CAPITALS = {
    "France", "United Kingdom", "Japan", "Italy", "Spain", "Germany",
    "United States", "Canada", "Egypt", "Mexico", "Brazil", "Russia",
    "China", "India", "Australia", "Greece", "Ireland", "Portugal",
    "Argentina", "South Korea", "Thailand", "Sweden", "Norway", "Austria",
    "Poland", "Peru", "Netherlands", "Cuba", "Iceland", "Switzerland",
    "Kenya", "Indonesia",
}

EASY_ICONIC_ELEMENTS = {
    "Hydrogen", "Helium", "Carbon", "Nitrogen", "Oxygen", "Sodium",
    "Aluminium", "Chlorine", "Calcium", "Iron", "Copper", "Silver",
    "Gold", "Mercury", "Lead", "Uranium",
}

EASY_ICONIC_CURRENCIES = {
    "Japan", "India", "Switzerland", "China", "Brazil", "South Korea",
}

EASY_OBVIOUS_COASTAL_OR_LL = {
    "India", "China", "United States", "Japan", "Australia", "Italy",
    "United Kingdom", "Brazil", "Mexico", "Switzerland", "Austria",
}

CRYPTIC_CALIBRATOR_UNITS = {"M", "k km²", "val", "deg", "Earth yrs", "pts", "ft"}

CALIBRATOR_UNIT_UPGRADE = {
    "M": "million",
    "k km²": "thousand km²",
    "val": "value",
    "deg": "degrees",
    "Earth yrs": "Earth years",
    "pts": "points",
    "ft": "feet",
    "m": "meters",
}

BANNED_PROMPT_PATTERNS = [
    re.compile(r"\b(pictured|shown here|shown above|shown below|in this photo|in this image|audio clip|listen to)\b", re.I),
    re.compile(r"\b(all of the above|none of the above|both a and b|neither a nor b)\b", re.I),
    re.compile(r"\b(currently|right now|at present|as of 20\d\d|this year|last year|nowadays|incumbent|reigning champion|most recent)\b", re.I),
    re.compile(r"\b(current (president|prime minister|monarch|king|queen|chancellor|pope|leader|ceo|champion|holder))\b", re.I),
    re.compile(r"\b(is hosting|will host|will be held|will take place|is set to)\b.*\b20[012]\d\b", re.I),
    re.compile(r"\b(true or false)\b", re.I),
    re.compile(r"_{3,}"),
    re.compile(r"\b(which of the following is not|which of these is not)\b", re.I),
    re.compile(r"\b(according to wikipedia|on reddit|tiktok|instagram|youtuber|twitch streamer|minecraft mod|fortnite skin|pokemon go)\b", re.I),
]

# ============================================================================
# 2. HTTP CLIENT & TEXT UTILITIES
# ============================================================================

def http_get_json(url: str, timeout: int = 20, retries: int = 3, base_sleep: float = 2.0) -> Any:
    headers = {
        "User-Agent": "WorldsSmartestFORGE/2.0 (Educational Trivia Pipeline)",
        "Accept": "application/json",
    }
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
                return json.loads(raw)
        except urllib.error.HTTPError as e:
            last_err = e
            wait = base_sleep * (attempt + 1)
            if e.code == 429:
                wait = max(6.0, wait * 2.0)
            time.sleep(wait)
        except Exception as e:
            last_err = e
            time.sleep(base_sleep * (attempt + 1))
    raise RuntimeError(f"Failed GET {url}: {last_err}")


def clean_text(text: Any) -> str:
    if text is None:
        return ""
    s = str(text)
    # Double-unescape catches nested entities like &amp;quot;
    s = html.unescape(html.unescape(s))
    # Strip any inline HTML formatting tags (e.g. <I>...</I> from Nobel API citations)
    s = HTML_TAG_RE.sub("", s)
    s = s.replace("\u00a0", " ").replace("\u200b", "").replace("\ufeff", "")
    s = s.replace("\r", " ").replace("\n", " ").replace("\t", " ")
    s = re.sub(r"\s+", " ", s).strip()
    # Fix stray spacing before punctuation
    s = re.sub(r"\s+([?,.;:!])", r"\1", s)
    return s


def has_dirty_artifacts(text: str) -> bool:
    if not text or "\ufffd" in text:
        return True
    if HTML_ARTIFACT_RE.search(text) or HTML_TAG_RE.search(text):
        return True
    if any(ord(ch) < 32 for ch in text):
        return True
    return False


def normalize_text(text: Any) -> str:
    s = unicodedata.normalize("NFKD", str(text or "").lower())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"[^a-z0-9]+", " ", s).strip()
    return s


def content_tokens(text: str) -> set[str]:
    norm = normalize_text(text)
    return {t for t in norm.split() if len(t) >= 3 and t not in STOPWORDS}


def slugify_topic(prefix: str, text: str) -> str:
    norm = normalize_text(text)
    slug = re.sub(r"\s+", "_", norm)[:38].strip("_")
    digest = hashlib.sha1(f"{prefix}:{text}".encode("utf-8")).hexdigest()[:8]
    if slug:
        return f"{prefix}_{slug}_{digest}"
    return f"{prefix}_{digest}"


def trim_sentence(text: str, max_len: int, min_len: int = 12) -> str | None:
    """Cleanly fit text to <= max_len at sentence or clause boundary without broken ellipsis."""
    s = clean_text(text)
    if not s or has_dirty_artifacts(s):
        return None
    if len(s) <= max_len:
        return s if len(s) >= min_len else None

    # 1. Try taking first 1-2 complete sentences
    sentences = re.split(r"(?<=[.!?])\s+", s)
    acc = ""
    for sent in sentences:
        cand = f"{acc} {sent}".strip() if acc else sent
        if len(cand) <= max_len:
            acc = cand
        else:
            break
    if len(acc) >= min_len:
        return acc

    # 2. Try first clean clause before semicolon, colon, or em-dash
    for sep in ("; ", " — ", " - ", ": "):
        if sep in s:
            head = s.split(sep, 1)[0].strip().rstrip(",;:")
            if min_len <= len(head) <= max_len - 1:
                return head + ("." if head[-1] not in ".!?" else "")

    # 3. Try comma clause near end if complete-looking
    cut = s[: max_len - 1]
    for sep in (", which ", ", where ", ", while ", ", although ", ", because ", ", making ", ", including "):
        idx = cut.rfind(sep)
        if idx >= min_len:
            head = cut[:idx].strip().rstrip(",;:")
            if min_len <= len(head) <= max_len - 1:
                return head + ("." if head[-1] not in ".!?" else "")
    return None


def detect_regions(*texts: str) -> list[str]:
    blob = " ".join(t for t in texts if t)
    found: list[str] = []
    for code, pat in REGION_PATTERNS:
        if pat.search(blob):
            found.append(code)
            if len(found) >= 2:
                break
    found.append("GLOBAL")
    return found


def pick_glyph(domain_id: int, seed_str: str) -> str:
    choices = DOMAIN_GLYPHS[domain_id]
    idx = int(hashlib.md5(seed_str.encode("utf-8")).hexdigest()[:6], 16) % len(choices)
    return choices[idx]


def contains_whole_phrase(haystack_norm: str, needle_norm: str) -> bool:
    if not needle_norm or len(needle_norm) < 3:
        return False
    pat = r"(?:^| )" + re.escape(needle_norm) + r"(?: |$)"
    return re.search(pat, haystack_norm) is not None


def format_calibrator_godot(val: float, unit: str) -> str:
    """Exact mirror of Godot TriviaDatabase._format_calibrator(val, unit)."""
    rounded = str(int(round(val))) if abs(val) >= 10.0 else f"{val:.1f}"
    return f"{rounded} {unit}".strip()


def calibrator_facets_distinct_in_godot(exact_val: float, min_val: float, max_val: float, unit: str) -> bool:
    """Verify Godot's 4 generated Prism facets [-0.22, 0.19, 0.36] are all strictly distinct."""
    if not (min_val < exact_val < max_val):
        return False
    span = max(1.0, max_val - min_val)
    seen = {format_calibrator_godot(exact_val, unit)}
    for off in (-0.22, 0.19, 0.36):
        decoy = max(min_val, min(max_val, exact_val + span * off))
        if abs(decoy - exact_val) < 1e-6:
            decoy = exact_val + span * 0.14
        label = format_calibrator_godot(decoy, unit)
        if not label or len(label) > 28 or label in seen:
            return False
        seen.add(label)
    return len(seen) == 4


def make_calibrator_bounds(
    exact_val: float,
    unit: str,
    key: str,
    floor_val: float | None = None,
    ceil_val: float | None = None,
    step: float = 1,
    min_span: float = 10.0,
) -> tuple[float, float] | None:
    """Choose natural, non-gameable (minVal, maxVal) guaranteed safe for Godot facets."""
    h = int(hashlib.md5(key.encode("utf-8")).hexdigest()[:6], 16)
    # Place exact_val between 32% and 56% of slider so -0.22 and +0.36 never clamp!
    pos_ratio = 0.32 + (h % 25) * 0.01  # 0.32 .. 0.56

    if abs(exact_val) >= 1000:
        span = max(min_span, abs(exact_val) * (0.45 + (h % 20) * 0.015))
    elif abs(exact_val) >= 100:
        span = max(min_span, abs(exact_val) * (0.55 + (h % 20) * 0.015))
    elif abs(exact_val) >= 10:
        span = max(min_span, abs(exact_val) * (0.75 + (h % 25) * 0.02))
    else:
        span = max(min_span, abs(exact_val) * 1.4 + 4.0)

    lo = exact_val - span * pos_ratio
    hi = exact_val + span * (1.0 - pos_ratio)

    if floor_val is not None and lo < floor_val:
        lo = floor_val
    if ceil_val is not None and hi > ceil_val:
        hi = ceil_val

    # Snap cleanly to nice increments
    snap = step if step >= 1 else 0.1
    if span >= 2000:
        snap = 100
    elif span >= 400:
        snap = 10
    elif span >= 60:
        snap = 5
    elif span >= 12 and step >= 1:
        snap = 1

    if snap >= 1:
        lo = math.floor(lo / snap) * snap
        hi = math.ceil(hi / snap) * snap
    else:
        lo = round(math.floor(lo / snap) * snap, 2)
        hi = round(math.ceil(hi / snap) * snap, 2)

    if floor_val is not None:
        lo = max(floor_val, lo)
    if ceil_val is not None:
        hi = min(ceil_val, hi)

    # Ensure strictly contains exactVal and distinct Godot facets
    if not (lo < exact_val < hi):
        return None
    if calibrator_facets_distinct_in_godot(exact_val, lo, hi, unit):
        return (int(lo) if float(lo).is_integer() else round(lo, 2),
                int(hi) if float(hi).is_integer() else round(hi, 2))

    # Fallback: gently widen span within floor/ceil
    for mult in (1.3, 1.8, 0.7):
        lo2 = exact_val - span * mult * 0.42
        hi2 = exact_val + span * mult * 0.58
        if floor_val is not None:
            lo2 = max(floor_val, lo2)
        if ceil_val is not None:
            hi2 = min(ceil_val, hi2)
        lo2 = math.floor(lo2) if step >= 1 else round(lo2, 1)
        hi2 = math.ceil(hi2) if step >= 1 else round(hi2, 1)
        if lo2 < exact_val < hi2 and calibrator_facets_distinct_in_godot(exact_val, lo2, hi2, unit):
            return (int(lo2) if float(lo2).is_integer() else round(lo2, 2),
                    int(hi2) if float(hi2).is_integer() else round(hi2, 2))
    return None


def check_clue_leaks(q: dict[str, Any], strict: bool = True) -> list[str]:
    leaks: list[str] = []
    clues = q.get("clues", [])
    clue_norms = [normalize_text(c) for c in clues]
    arch = q.get("archetype")

    if arch in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS"):
        ans = str(q.get("answerCorrect", ""))
        ans_norm = normalize_text(ans)
        if len(ans_norm) >= 3:
            for idx, cn in enumerate(clue_norms):
                if contains_whole_phrase(cn, ans_norm):
                    leaks.append(f'clues[{idx}] contains answerCorrect "{ans}"')
        if strict and len(ans_norm) >= 3:
            # Also catch distinctive surname / rare answer-word leaks
            ans_tokens = [
                t for t in ans_norm.split()
                if len(t) >= 5 and t not in STOPWORDS and t not in GENERIC_ANSWER_TOKENS
            ]
            # Avoid false positives when the prompt itself mentions that token
            prompt_norm = normalize_text(q.get("prompt", ""))
            for tok in ans_tokens:
                if contains_whole_phrase(prompt_norm, tok):
                    continue
                for idx, cn in enumerate(clue_norms):
                    if contains_whole_phrase(cn, tok):
                        leaks.append(f'clues[{idx}] leaks distinctive token "{tok}" of "{ans}"')
                        break
    elif arch == "CALIBRATOR_DIAL" and isinstance(q.get("calibratorExt"), dict):
        exact_val = q["calibratorExt"].get("exactVal")
        exact_str = str(exact_val)
        if len(exact_str) >= 2:
            pat = re.compile(r"(?<![0-9.,])" + re.escape(exact_str) + r"(?![0-9.,])")
            for idx, c in enumerate(clues):
                if pat.search(str(c)):
                    leaks.append(f'clues[{idx}] reveals exactVal "{exact_str}"')
        # Also check comma-formatted version e.g. 1,864
        if isinstance(exact_val, (int, float)) and abs(exact_val) >= 1000 and float(exact_val).is_integer():
            comma_str = f"{int(exact_val):,}"
            for idx, c in enumerate(clues):
                if comma_str in str(c):
                    leaks.append(f'clues[{idx}] reveals formatted exactVal "{comma_str}"')
    elif arch == "GAUNTLET_SHATTER" and strict:
        spoiler_re = re.compile(r"\b(is true|is false|actually true|actually false|classic myth|common myth|debunked)\b", re.I)
        for idx, c in enumerate(clues):
            if spoiler_re.search(str(c)):
                leaks.append(f"clues[{idx}] spoils GAUNTLET verdict")
    return leaks


# ============================================================================
# 3. CATALOG BUILDER & SEMANTIC DEDUPLICATOR
# ============================================================================

class CatalogBuilder:
    def __init__(self, gold_questions: list[dict[str, Any]]) -> None:
        self.questions: list[dict[str, Any]] = []
        self.source_counts: Counter[str] = Counter()
        self.reject_counts: Counter[str] = Counter()

        self._seen_topics: set[str] = set()
        self._seen_prompts: set[str] = set()
        self._prompts_by_answer: dict[str, list[set[str]]] = defaultdict(list)
        self._cal_by_val: dict[float, list[set[str]]] = defaultdict(list)
        self._prompt_tokens_by_domain: dict[int, list[set[str]]] = defaultdict(list)

        for gq in gold_questions:
            self.questions.append(gq)
            self._index_question(gq)
        self.source_counts["Gold Core (Hand-Verified 1..832)"] = len(gold_questions)

    def _index_question(self, q: dict[str, Any]) -> None:
        self._seen_topics.add(q["microTopicId"])
        norm_p = normalize_text(q["prompt"])
        self._seen_prompts.add(norm_p)
        toks = content_tokens(q["prompt"])
        if toks:
            self._prompt_tokens_by_domain[q["l0Domain"]].append(toks)
            if q["archetype"] in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS"):
                ans_norm = normalize_text(q["answerCorrect"])
                if ans_norm:
                    self._prompts_by_answer[ans_norm].append(toks)
            elif q["archetype"] == "CALIBRATOR_DIAL" and isinstance(q.get("calibratorExt"), dict):
                ev = q["calibratorExt"].get("exactVal")
                if isinstance(ev, (int, float)):
                    self._cal_by_val[float(ev)].append(toks)

    def _is_semantic_duplicate(self, q: dict[str, Any], structured: bool = False) -> bool:
        norm_p = normalize_text(q["prompt"])
        if norm_p in self._seen_prompts:
            return True
        toks = content_tokens(q["prompt"])
        if not toks:
            return True

        # Same-answer semantic overlap check (catches paraphrased trivia of same fact)
        if q["archetype"] in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS"):
            ans_norm = normalize_text(q["answerCorrect"])
            for existing_toks in self._prompts_by_answer.get(ans_norm, ()):
                inter = len(toks & existing_toks)
                union = len(toks | existing_toks)
                if union > 0 and (inter / union >= 0.45 or (inter >= 3 and inter / min(len(toks), len(existing_toks)) >= 0.6)):
                    return True
        elif q["archetype"] == "CALIBRATOR_DIAL" and isinstance(q.get("calibratorExt"), dict):
            ev = q["calibratorExt"].get("exactVal")
            if isinstance(ev, (int, float)):
                for existing_toks in self._cal_by_val.get(float(ev), ()):
                    if len(toks & existing_toks) >= 2:
                        return True

        # Cross-prompt near-duplicate check within same domain (external APIs only;
        # structured datasets generate distinct items with distinct verified answers)
        if not structured:
            for existing_toks in self._prompt_tokens_by_domain.get(q["l0Domain"], ()):
                if abs(len(toks) - len(existing_toks)) > 4:
                    continue
                inter = len(toks & existing_toks)
                if inter < 3:
                    continue
                union = len(toks | existing_toks)
                if union > 0 and inter / union >= 0.78:
                    return True
        return False

    def try_add(self, q: dict[str, Any], source: str, structured: bool = False) -> bool:
        # Clean core text fields
        q["prompt"] = clean_text(q.get("prompt", ""))
        q["answerCorrect"] = clean_text(q.get("answerCorrect", ""))
        q["l1Category"] = clean_text(q.get("l1Category", ""))
        q["l2Subcategory"] = clean_text(q.get("l2Subcategory", ""))
        q["whyExplanation"] = clean_text(q.get("whyExplanation", ""))
        q["clues"] = [clean_text(c) for c in q.get("clues", [])]

        # Enforce clean sentence endings without blind truncation
        for idx, lim in ((0, BUDGETS["clue0Max"]), (1, BUDGETS["clue1Max"])):
            if idx < len(q["clues"]) and q["clues"][idx]:
                if len(q["clues"][idx]) > lim:
                    fitted = trim_sentence(q["clues"][idx], lim, 12)
                    if not fitted:
                        self.reject_counts[f"clue{idx}_len"] += 1
                        return False
                    q["clues"][idx] = fitted
                if not SENTENCE_END_RE.search(q["clues"][idx]):
                    if len(q["clues"][idx]) + 1 <= lim:
                        q["clues"][idx] = q["clues"][idx].rstrip(",;:") + "."
                    else:
                        self.reject_counts[f"clue{idx}_punct"] += 1
                        return False

        if q["whyExplanation"]:
            if len(q["whyExplanation"]) > BUDGETS["whyMax"]:
                fitted_w = trim_sentence(q["whyExplanation"], BUDGETS["whyMax"], BUDGETS["whyMin"])
                if not fitted_w:
                    self.reject_counts["why_len"] += 1
                    return False
                q["whyExplanation"] = fitted_w
            if not SENTENCE_END_RE.search(q["whyExplanation"]):
                if len(q["whyExplanation"]) + 1 <= BUDGETS["whyMax"]:
                    q["whyExplanation"] = q["whyExplanation"].rstrip(",;:") + "."
                else:
                    self.reject_counts["why_punct"] += 1
                    return False

        # Check all string fields for HTML artifacts or control chars
        all_strs = [
            q["prompt"], q["answerCorrect"], q["l1Category"], q["l2Subcategory"],
            q["whyExplanation"], *q["clues"],
        ]
        if q["archetype"] == "SIGHTLINE_LOCK":
            for d in q.get("distractors", []):
                d["text"] = clean_text(d.get("text", ""))
                all_strs.append(d["text"])
        elif q["archetype"] == "CODEX_DUAL_RING":
            ext = q.get("codexExt", {})
            for p in ext.get("pairs", []):
                p["subject"] = clean_text(p.get("subject", ""))
                p["target"] = clean_text(p.get("target", ""))
                all_strs.extend([p["subject"], p["target"]])
            ext["decoyTarget"] = clean_text(ext.get("decoyTarget", ""))
            all_strs.append(ext["decoyTarget"])
        elif q["archetype"] == "CALIBRATOR_DIAL":
            ext = q.get("calibratorExt", {})
            ext["unit"] = clean_text(ext.get("unit", ""))
            all_strs.append(ext["unit"])

        if any(has_dirty_artifacts(s) for s in all_strs):
            self.reject_counts["dirty_text"] += 1
            return False

        # Budget checks
        if not (BUDGETS["promptMin"] <= len(q["prompt"]) <= BUDGETS["promptMax"]):
            self.reject_counts["prompt_len"] += 1
            return False
        if len(q["clues"]) != 2:
            self.reject_counts["clue_count"] += 1
            return False
        if not (BUDGETS["clue0Min"] <= len(q["clues"][0]) <= BUDGETS["clue0Max"]):
            self.reject_counts["clue0_len"] += 1
            return False
        if not (BUDGETS["clue1Min"] <= len(q["clues"][1]) <= BUDGETS["clue1Max"]):
            self.reject_counts["clue1_len"] += 1
            return False
        if not (BUDGETS["whyMin"] <= len(q["whyExplanation"]) <= BUDGETS["whyMax"]):
            self.reject_counts["why_len"] += 1
            return False
        if not q["answerCorrect"]:
            self.reject_counts["empty_answer"] += 1
            return False

        # Banned prompt patterns & typo/slop guard
        if TYPO_OR_SLOP_RE.search(q["prompt"]):
            self.reject_counts["typo_or_slop"] += 1
            return False
        for pat in BANNED_PROMPT_PATTERNS:
            if pat.search(q["prompt"]):
                self.reject_counts["banned_prompt"] += 1
                return False

        # Archetype-specific validation
        arch = q["archetype"]
        if arch in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS"):
            if len(q["answerCorrect"]) > BUDGETS["answerMax"]:
                self.reject_counts["answer_len"] += 1
                return False
            dists = q.get("distractors", [])
            if not (3 <= len(dists) <= 4):
                self.reject_counts["dist_count"] += 1
                return False
            seen_opts = {normalize_text(q["answerCorrect"])}
            for d in dists:
                if not (1 <= len(d["text"]) <= BUDGETS["distractorMax"]):
                    self.reject_counts["dist_len"] += 1
                    return False
                nd = normalize_text(d["text"])
                if not nd or nd in seen_opts:
                    self.reject_counts["dist_dup"] += 1
                    return False
                seen_opts.add(nd)
        elif arch == "CALIBRATOR_DIAL":
            ext = q.get("calibratorExt", {})
            if not calibrator_facets_distinct_in_godot(
                float(ext["exactVal"]), float(ext["minVal"]), float(ext["maxVal"]), ext["unit"]
            ):
                self.reject_counts["calibrator_bounds"] += 1
                return False
        elif arch == "CODEX_DUAL_RING":
            ext = q.get("codexExt", {})
            pairs = ext.get("pairs", [])
            if len(pairs) != 3:
                self.reject_counts["codex_pairs"] += 1
                return False
            subs, targs = set(), set()
            for p in pairs:
                if not (1 <= len(p["subject"]) <= BUDGETS["codexLabelMax"]):
                    self.reject_counts["codex_len"] += 1
                    return False
                if not (1 <= len(p["target"]) <= BUDGETS["codexLabelMax"]):
                    self.reject_counts["codex_len"] += 1
                    return False
                ns, nt = normalize_text(p["subject"]), normalize_text(p["target"])
                if not ns or not nt or ns in subs or nt in targs:
                    self.reject_counts["codex_dup"] += 1
                    return False
                subs.add(ns)
                targs.add(nt)
            dec = ext.get("decoyTarget", "")
            if not (1 <= len(dec) <= BUDGETS["codexLabelMax"]) or normalize_text(dec) in targs:
                self.reject_counts["codex_decoy"] += 1
                return False
        elif arch == "GAUNTLET_SHATTER":
            ext = q.get("gauntletExt", {})
            if not (isinstance(ext.get("isTrue"), bool) and isinstance(ext.get("isTrick"), bool)):
                self.reject_counts["gauntlet_ext"] += 1
                return False
            if not (5 <= ext.get("windowSec", 0) <= 12):
                self.reject_counts["gauntlet_win"] += 1
                return False

        # Clue leak gate
        if check_clue_leaks(q, strict=True):
            self.reject_counts["clue_leak"] += 1
            return False

        # Ensure unique microTopicId
        base_topic = q["microTopicId"]
        if base_topic in self._seen_topics:
            suffix = hashlib.sha1(q["prompt"].encode("utf-8")).hexdigest()[:6]
            q["microTopicId"] = f"{base_topic}_{suffix}"
        if q["microTopicId"] in self._seen_topics:
            self.reject_counts["dup_topic"] += 1
            return False

        # Semantic duplicate gate
        if self._is_semantic_duplicate(q, structured=structured):
            self.reject_counts["dup_semantic"] += 1
            return False

        # Assign provisional QID (re-numbered cleanly 1..N at finalize)
        q["qid"] = len(self.questions) + 1
        self.questions.append(q)
        self._index_question(q)
        self.source_counts[source] += 1
        return True


# ============================================================================
# 4. SOURCE 1: THE TRIVIA API v2 (Wikipedia-Verified with Hints & Explanations)
# ============================================================================

def route_trivia_api_domain(cat: str, tags: list[str], prompt: str) -> tuple[int, str, str]:
    tag_str = " ".join(tags).lower()
    p_low = prompt.lower()

    # High-specificity tag routing first so all 12 domains get crisp separation
    if any(k in tag_str for k in ("science:computing", "science:technology", "org:tech-companies", "topic:computing", "topic:internet")):
        return (6, "Computing & Engineering", "Technology")
    if any(k in tag_str for k in ("science:mathematics", "topic:mathematics", "topic:chess", "topic:puzzles")):
        return (11, "Mathematics & Logic", "Analytical Reasoning")
    if any(k in tag_str for k in ("topic:mythology", "greek-mythology", "norse-mythology", "egyptian-mythology", "mythical-creatures")):
        return (10, "World Mythology", "Mythic Lore")
    if any(k in tag_str for k in ("topic:philosophy", "person:philosophers", "topic:religion")):
        return (10, "Philosophy & Thought", "Classical Ideas")
    if any(k in tag_str for k in ("animal:", "science:biology", "science:botany", "topic:plants", "topic:trees", "topic:dinosaurs", "science:ecology")):
        return (7, "Natural Sciences", "Biology & Wildlife")
    if any(k in tag_str for k in ("topic:law", "topic:economics", "topic:politics", "topic:government", "topic:currency")):
        return (8, "Civics & Society", "Law & Institutions")
    if any(k in tag_str for k in ("topic:architecture", "person:architects")):
        return (3, "Architecture", "World Monuments")
    if any(k in tag_str for k in ("science:astronomy", "science:physics", "science:chemistry", "science:geology", "science:medicine", "science:human-body")):
        if "human-body" in tag_str or "medicine" in tag_str or "anatomy" in tag_str:
            return (7, "Life Sciences", "Human Biology")
        return (1, "Physical Sciences", "Core Science")
    if "topic:transport" in tag_str or any(w in p_low for w in ("algorithm", "software", "microchip", "transistor", "protocol", "programming language")):
        return (6, "Engineering & Systems", "Applied Tech")

    # Category fallback mapping
    cat_map: dict[str, tuple[int, str, str]] = {
        "history": (0, "World History", "Historical Events"),
        "science": (1, "Natural & Physical Science", "Scientific Discovery"),
        "geography": (2, "World Geography", "Global Landmarks"),
        "arts_and_literature": (3, "Arts & Literature", "Cultural Heritage"),
        "film_and_tv": (4, "Cinema & Television", "Screen Culture"),
        "music": (4, "Music & Recording", "Popular Culture"),
        "sport_and_leisure": (5, "Sports & Games", "Athletic Competition"),
        "society_and_culture": (8, "Society & Culture", "Global Institutions"),
        "food_and_drink": (9, "Culinary Traditions", "World Gastronomy"),
        "general_knowledge": (8, "General Knowledge", "World Affairs"),
    }
    dom, l1, l2 = cat_map.get(cat, (8, "General Knowledge", "World Affairs"))
    # Classical music / opera belongs in Arts (3)
    if cat == "music" and any(k in tag_str for k in ("classical", "opera", "composers", "orchestra")):
        return (3, "Classical Music", "Composition")
    return (dom, l1, l2)


def build_trivia_api_clues(
    domain_id: int,
    l1: str,
    tags: list[str],
    hint_raw: str,
    ans: str,
    prompt: str,
) -> tuple[str, str] | None:
    """Build crisp, non-leaking [Tier-2 Lateral <=90, Tier-3 Pinpoint <=80] from API metadata + hint."""
    ans_norm = normalize_text(ans)
    ans_tokens = [t for t in ans_norm.split() if len(t) >= 5 and t not in STOPWORDS and t not in GENERIC_ANSWER_TOKENS]
    prompt_norm = normalize_text(prompt)

    def leaks(txt: str) -> bool:
        tn = normalize_text(txt)
        if len(ans_norm) >= 3 and contains_whole_phrase(tn, ans_norm):
            return True
        for tok in ans_tokens:
            if not contains_whole_phrase(prompt_norm, tok) and contains_whole_phrase(tn, tok):
                return True
        return False

    # Extract clean descriptive tag labels for lateral framing
    nice_tags: list[str] = []
    for t in tags:
        if ":" in t:
            prefix, val = t.split(":", 1)
            if prefix in ("category",):
                continue
            label = val.replace("-", " ").title()
            if label and not leaks(label) and not contains_whole_phrase(prompt_norm, normalize_text(label)):
                nice_tags.append(label)
    tag_context = ", ".join(nice_tags[:2]) if nice_tags else l1

    # Structural lateral hint (always truthful, never leaks)
    words = ans.split()
    first_ch = ans[0].upper() if ans and ans[0].isalnum() else ""
    if len(words) == 1 and ans.isdigit():
        lateral = f"Archive dossier: {tag_context}. Focus on the exact milestone number."
    elif tag_context and len(tag_context) <= 44:
        lateral = f"Filed under {tag_context}; narrow down by domain context."
    else:
        lateral = f"Archive sector: {l1}. Cross-check the defining historical or factual cue."
    lateral = trim_sentence(lateral, BUDGETS["clue0Max"], 15) or f"Archive dossier: {l1}."

    # Use Wikipedia-checked API hint cleanly!
    h80 = trim_sentence(hint_raw, BUDGETS["clue1Max"], 14)
    if h80 and not leaks(h80):
        return (lateral, h80)

    # If hint is 81..90 chars, promote rich API hint to clue0 (limit 90) and use pinpoint structural clue1!
    h90 = trim_sentence(hint_raw, BUDGETS["clue0Max"], 14)
    if h90 and not leaks(h90):
        if len(words) == 1 and first_ch:
            pinpoint = f"Single-word verified answer beginning with '{first_ch}' ({len(ans)} characters)."
        elif first_ch:
            pinpoint = f"{len(words)}-word verified answer starting with the letter '{first_ch}'."
        else:
            pinpoint = f"Domain pinpoint: {tag_context[:50]}."
        pinpoint = trim_sentence(pinpoint, BUDGETS["clue1Max"], 12)
        if pinpoint and not leaks(pinpoint):
            return (h90, pinpoint)

    return None


def ingest_trivia_api(builder: CatalogBuilder) -> None:
    print("[FORGE] Source 1/5: Ingesting The Trivia API v2 (Wikipedia-verified)...")
    categories = [
        "history", "science", "geography", "arts_and_literature",
        "film_and_tv", "music", "sport_and_leisure",
        "society_and_culture", "food_and_drink", "general_knowledge",
    ]
    difficulties = ["easy", "medium", "hard"]

    raw_by_id: dict[str, dict[str, Any]] = {}

    # 1. Balanced sweep across all 10 categories x 3 difficulties (2 passes each)
    for cat in categories:
        passes = 3 if cat in ("science", "history", "geography", "arts_and_literature", "food_and_drink", "society_and_culture") else 2
        for diff in difficulties:
            for _ in range(passes):
                url = f"https://the-trivia-api.com/v2/questions?limit=50&categories={cat}&difficulties={diff}"
                try:
                    batch = http_get_json(url, timeout=20, retries=3, base_sleep=1.0)
                    if isinstance(batch, list):
                        for item in batch:
                            qid_ext = item.get("id")
                            if qid_ext and qid_ext not in raw_by_id:
                                raw_by_id[qid_ext] = item
                except Exception as e:
                    print(f"  [warn] TriviaAPI {cat}/{diff}: {e}")
                time.sleep(0.18)

    # 2. Targeted domain-booster tag queries (Tech, Logic/Math, Myth/Philosophy, Nature, Sports, Society)
    boost_tags = [
        "science:technology", "science:computing", "org:tech-companies",
        "science:mathematics", "topic:mythology", "topic:greek-mythology",
        "topic:philosophy", "person:philosophers", "animal:animals",
        "animal:mammals", "animal:birds", "animal:marine-life",
        "science:biology", "topic:law-and-crime", "topic:economics",
        "topic:architecture", "sport:sports", "sport:sports-rules-and-terms",
        "food:world-cuisine", "food:drinks",
    ]
    for tag in boost_tags:
        for _ in range(2):
            q_tag = urllib.parse.quote(tag)
            url = f"https://the-trivia-api.com/v2/questions?limit=50&tags={q_tag}"
            try:
                batch = http_get_json(url, timeout=20, retries=2, base_sleep=1.0)
                if isinstance(batch, list):
                    for item in batch:
                        qid_ext = item.get("id")
                        if qid_ext and qid_ext not in raw_by_id:
                            raw_by_id[qid_ext] = item
            except Exception as e:
                print(f"  [warn] TriviaAPI tag={tag}: {e}")
            time.sleep(0.18)

    print(f"  Fetched {len(raw_by_id)} unique raw Trivia API candidates. Filtering & mapping...")

    diff_to_irt = {"easy": -1.1, "medium": 0.3, "hard": 1.6}
    # Caps on repetitive templates so variety stays ultra-high
    template_caps = {
        "music_release": [0, 75],
        "author_wrote": [0, 85],
        "which_of_these": [0, 140],
        "domain_4_pop": [0, 260],
    }

    added = 0
    # Deterministic ordering by external ID
    for ext_id in sorted(raw_by_id.keys()):
        item = raw_by_id[ext_id]
        if item.get("type") != "text_choice":
            continue
        prompt = clean_text((item.get("question") or {}).get("text", ""))
        ans = clean_text(item.get("correctAnswer", ""))
        inc = [clean_text(x) for x in (item.get("incorrectAnswers") or [])]
        hint_raw = clean_text(item.get("hint", ""))
        exp_raw = clean_text(item.get("explanation", ""))
        cat = str(item.get("category", "general_knowledge"))
        tags = [str(t) for t in (item.get("tags") or [])]
        diff = str(item.get("difficulty", "medium")).lower()

        if not prompt or not ans or len(inc) != 3 or not hint_raw:
            continue
        if len(prompt) > BUDGETS["promptMax"] or len(prompt) < BUDGETS["promptMin"]:
            continue
        if len(ans) > BUDGETS["answerMax"] or any(len(d) > BUDGETS["distractorMax"] or not d for d in inc):
            continue

        # Filter out overly obscure book titles with bibliographic colons
        if " : " in prompt:
            continue

        p_low = prompt.lower()
        if "released the studio album" in p_low or "released the album" in p_low or "released the song" in p_low:
            if template_caps["music_release"][0] >= template_caps["music_release"][1]:
                continue
        if p_low.startswith("which author wrote '") or p_low.startswith('which author wrote "'):
            if template_caps["author_wrote"][0] >= template_caps["author_wrote"][1]:
                continue
        if p_low.startswith("which of these"):
            if template_caps["which_of_these"][0] >= template_caps["which_of_these"][1]:
                continue

        dom, l1, l2 = route_trivia_api_domain(cat, tags, prompt)
        if dom == 4 and template_caps["domain_4_pop"][0] >= template_caps["domain_4_pop"][1]:
            continue

        clues = build_trivia_api_clues(dom, l1, tags, hint_raw, ans, prompt)
        if not clues:
            continue

        why = trim_sentence(exp_raw, BUDGETS["whyMax"], BUDGETS["whyMin"])
        if not why:
            why = trim_sentence(f"{ans} is the verified answer ({l1}). {hint_raw}", BUDGETS["whyMax"], BUDGETS["whyMin"])
        if not why:
            continue

        # Smooth IRT jitter based on stable hash so Endless difficulty curve is gradual
        h_int = int(hashlib.md5(ext_id.encode("utf-8")).hexdigest()[:4], 16)
        irt_b = round(max(-2.2, min(2.6, diff_to_irt.get(diff, 0.3) + ((h_int % 11) - 5) * 0.12)), 2)
        irt_a = round(1.15 + (h_int % 5) * 0.08, 2)

        # Assign varied plausibilities for Peel Crown gameplay
        plaus = [0.84, 0.71, 0.56]
        dists = [{"text": d, "plausibility": plaus[i]} for i, d in enumerate(inc)]

        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": l2,
            "microTopicId": slugify_topic("tapi", f"{cat}_{ans}_{ext_id[:6]}"),
            "regions": detect_regions(prompt, ans, " ".join(tags)),
            "narrativeTags": list(DOMAIN_DEFAULT_TAGS[dom]),
            "tone": "WITTY" if dom in (4, 5, 9) else "PRESTIGE",
            "irtB": irt_b,
            "irtA": irt_a,
            "freshness": "EVERGREEN",
            "archetype": "SIGHTLINE_LOCK",
            "prompt": prompt,
            "answerCorrect": ans,
            "distractors": dists,
            "clues": [clues[0], clues[1]],
            "glyphHint": pick_glyph(dom, ext_id),
            "whyExplanation": why,
        }
        if builder.try_add(rec, "The Trivia API v2"):
            added += 1
            if "released the studio album" in p_low or "released the album" in p_low or "released the song" in p_low:
                template_caps["music_release"][0] += 1
            if p_low.startswith("which author wrote '") or p_low.startswith('which author wrote "'):
                template_caps["author_wrote"][0] += 1
            if p_low.startswith("which of these"):
                template_caps["which_of_these"][0] += 1
            if dom == 4:
                template_caps["domain_4_pop"][0] += 1

    print(f"  -> Accepted {added} verified questions from The Trivia API v2.")


# ============================================================================
# 5. SOURCE 2: OPEN TRIVIA DATABASE (Session Token, Rate-Limited)
# ============================================================================

OPENTDB_CAT_MAP: dict[str, tuple[int, str, str]] = {
    "History": (0, "World History", "Historical Archive"),
    "Science & Nature": (1, "Science & Nature", "Natural Laws"),
    "Geography": (2, "World Geography", "Atlas Archive"),
    "Art": (3, "Fine Arts", "Visual Culture"),
    "Entertainment: Books": (3, "World Literature", "Classic Letters"),
    "Entertainment: Musicals & Theatres": (3, "Theatre & Stage", "Performing Arts"),
    "Entertainment: Film": (4, "Cinema", "Film Archive"),
    "Entertainment: Music": (4, "Music", "Recording Arts"),
    "Entertainment: Television": (4, "Television", "Broadcast Media"),
    "Entertainment: Video Games": (4, "Interactive Media", "Game History"),
    "Sports": (5, "Sports", "Competition"),
    "Entertainment: Board Games": (5, "Tabletop & Strategy", "Board Games"),
    "Science: Computers": (6, "Computer Science", "Computing Systems"),
    "Science: Gadgets": (6, "Engineering & Hardware", "Consumer Tech"),
    "Vehicles": (6, "Mechanical Engineering", "Vehicles & Aviation"),
    "Animals": (7, "Zoology", "Animal Kingdom"),
    "Politics": (8, "Politics & Governance", "Public Affairs"),
    "General Knowledge": (8, "General Knowledge", "World Archive"),
    "Mythology": (10, "Mythology", "Ancient Pantheon"),
    "Science: Mathematics": (11, "Mathematics", "Pure & Applied Math"),
}


def ingest_opentdb(builder: CatalogBuilder) -> None:
    print("[FORGE] Source 2/5: Ingesting Open Trivia Database (polite 5.3s token batches)...")
    try:
        tok_resp = http_get_json("https://opentdb.com/api_token.php?command=request", timeout=15)
        token = tok_resp.get("token", "")
    except Exception as e:
        print(f"  [warn] OpenTDB token request failed: {e}")
        return

    if not token:
        print("  [warn] OpenTDB returned empty token; skipping.")
        return

    # Targeted high-prestige batches: (category_id or None, qtype, amount)
    # 16 polite calls (~85s total) -> rich GAUNTLET_SHATTER + underrepresented domains!
    plan: list[tuple[int | None, str, int]] = [
        # Boolean -> GAUNTLET_SHATTER across prestige domains
        (22, "boolean", 40),  # Geography
        (23, "boolean", 40),  # History
        (17, "boolean", 40),  # Science & Nature
        (18, "boolean", 40),  # Computers
        (27, "boolean", 30),  # Animals
        (9, "boolean", 40),   # General Knowledge
        (21, "boolean", 25),  # Sports
        # Multiple -> SIGHTLINE_LOCK for high-value underrepresented domains
        (18, "multiple", 50), # Computers -> Tech (6)
        (19, "multiple", 40), # Mathematics -> Logic (11)
        (20, "multiple", 40), # Mythology -> Myth (10)
        (27, "multiple", 50), # Animals -> Nature (7)
        (21, "multiple", 50), # Sports -> Sports (5)
        (16, "multiple", 40), # Board Games -> Sports (5)
        (28, "multiple", 40), # Vehicles -> Tech (6)
        (25, "multiple", 30), # Art -> Arts (3)
        (24, "multiple", 40), # Politics -> Society (8)
    ]

    # Keep community OpenTDB out of City 1 Easy (irtB <= -0.35) so Geneva stays ultra-clean
    diff_to_irt = {"easy": 0.20, "medium": 0.85, "hard": 1.85}
    added_multi = 0
    added_bool = 0

    for idx, (cat_id, qtype, amount) in enumerate(plan):
        if idx > 0:
            time.sleep(5.3)
        params = f"amount={amount}&type={qtype}&token={token}"
        if cat_id is not None:
            params += f"&category={cat_id}"
        url = f"https://opentdb.com/api.php?{params}"

        results: list[dict[str, Any]] = []
        for retry in range(2):
            try:
                resp = http_get_json(url, timeout=20, retries=2, base_sleep=5.5)
                code = resp.get("response_code", -1)
                if code == 0:
                    results = resp.get("results", [])
                    break
                elif code == 5:
                    # Rate limit hit -> wait 6s and retry once
                    time.sleep(6.0)
                    continue
                elif code == 1 and amount > 20:
                    # Fewer questions available than requested -> ask for 20
                    url = f"https://opentdb.com/api.php?amount=20&type={qtype}&token={token}" + (f"&category={cat_id}" if cat_id else "")
                    time.sleep(5.3)
                    continue
                else:
                    break
            except Exception as e:
                print(f"  [warn] OpenTDB batch {idx+1}/{len(plan)} failed: {e}")
                break

        for r in results:
            raw_cat = clean_text(r.get("category", "General Knowledge"))
            if raw_cat not in OPENTDB_CAT_MAP:
                continue
            dom, l1, l2 = OPENTDB_CAT_MAP[raw_cat]
            diff = str(r.get("difficulty", "medium")).lower()
            prompt = clean_text(r.get("question", ""))
            correct = clean_text(r.get("correct_answer", ""))
            incorrect = [clean_text(x) for x in (r.get("incorrect_answers") or [])]

            if not prompt or len(prompt) < BUDGETS["promptMin"] or len(prompt) > BUDGETS["promptMax"]:
                continue

            h_int = int(hashlib.md5(prompt.encode("utf-8")).hexdigest()[:4], 16)
            irt_b = round(max(-2.1, min(2.5, diff_to_irt.get(diff, 0.35) + ((h_int % 9) - 4) * 0.12)), 2)
            irt_a = round(1.15 + (h_int % 4) * 0.08, 2)

            if qtype == "boolean":
                if correct not in ("True", "False"):
                    continue
                # Ensure clean declarative sentence (no question mark)
                if prompt.endswith("?"):
                    continue
                if not prompt.endswith("."):
                    prompt = prompt + "."
                if len(prompt) > BUDGETS["promptMax"]:
                    continue
                is_true = correct == "True"
                # Zero-hallucination verification framing
                clue0 = f"Dossier: {l1} ({l2}). Evaluate the factual claim."
                clue1 = "Check exact names, definitions, and edge-case qualifiers in the statement."
                if is_true:
                    why = trim_sentence(
                        f"Verified TRUE ({l1}): {prompt}",
                        BUDGETS["whyMax"],
                        BUDGETS["whyMin"],
                    )
                else:
                    why = trim_sentence(
                        f"Verified FALSE ({l1}): The statement '{prompt[:-1]}' contradicts the established record.",
                        BUDGETS["whyMax"],
                        BUDGETS["whyMin"],
                    ) or f"Verified FALSE in the {l1} reference archive; this claim is factually inaccurate."

                rec = {
                    "qid": 0,
                    "l0Domain": dom,
                    "l1Category": l1,
                    "l2Subcategory": l2,
                    "microTopicId": slugify_topic("otdb_bool", prompt[:42]),
                    "regions": detect_regions(prompt),
                    "narrativeTags": list(DOMAIN_DEFAULT_TAGS[dom]),
                    "tone": "THRILLER" if diff == "hard" else "PRESTIGE",
                    "irtB": irt_b,
                    "irtA": irt_a,
                    "freshness": "EVERGREEN",
                    "archetype": "GAUNTLET_SHATTER",
                    "prompt": prompt,
                    "answerCorrect": "TRUE" if is_true else "FALSE",
                    "clues": [clue0, clue1],
                    "glyphHint": pick_glyph(dom, prompt),
                    "whyExplanation": why,
                    "gauntletExt": {
                        "isTrue": is_true,
                        "isTrick": False,
                        "windowSec": 8 if diff != "hard" else 9,
                    },
                }
                if builder.try_add(rec, "Open Trivia DB"):
                    added_bool += 1
            else:
                if len(incorrect) != 3 or len(correct) > BUDGETS["answerMax"]:
                    continue
                if any(len(x) > BUDGETS["distractorMax"] or not x for x in incorrect):
                    continue
                # Non-hallucinating, non-leaking clues derived purely from verified taxonomy & answer shape
                words = correct.split()
                first_ch = correct[0].upper() if correct and correct[0].isalnum() else ""
                clue0 = f"Verified {l1} dossier ({l2}); filter options by domain precision."
                if correct.isdigit():
                    clue1 = f"The verified numeric answer has {len(correct)} digit{'s' if len(correct) != 1 else ''}."
                elif first_ch and len(words) == 1:
                    clue1 = f"Single-word term beginning with '{first_ch}' ({len(correct)} characters)."
                elif first_ch:
                    clue1 = f"{len(words)}-word verified answer beginning with '{first_ch}'."
                else:
                    clue1 = f"Eliminate the {l2.lower()} decoys that fall outside the prompt's scope."

                why = trim_sentence(
                    f"The verified answer is {correct}, cataloged under {l1} ({l2}) in the Open Trivia archive.",
                    BUDGETS["whyMax"],
                    BUDGETS["whyMin"],
                )
                if not why:
                    continue

                plaus = [0.83, 0.70, 0.55]
                rec = {
                    "qid": 0,
                    "l0Domain": dom,
                    "l1Category": l1,
                    "l2Subcategory": l2,
                    "microTopicId": slugify_topic("otdb", f"{l1}_{correct}"),
                    "regions": detect_regions(prompt, correct),
                    "narrativeTags": list(DOMAIN_DEFAULT_TAGS[dom]),
                    "tone": "PRESTIGE",
                    "irtB": irt_b,
                    "irtA": irt_a,
                    "freshness": "EVERGREEN",
                    "archetype": "SIGHTLINE_LOCK",
                    "prompt": prompt,
                    "answerCorrect": correct,
                    "distractors": [{"text": d, "plausibility": plaus[i]} for i, d in enumerate(incorrect)],
                    "clues": [clue0, clue1],
                    "glyphHint": pick_glyph(dom, prompt),
                    "whyExplanation": why,
                }
                if builder.try_add(rec, "Open Trivia DB"):
                    added_multi += 1

    print(f"  -> Accepted {added_multi} Sightline + {added_bool} Gauntlet ({added_multi + added_bool} total) from Open Trivia DB.")


# ============================================================================
# 6. SOURCE 3: AUTHORITATIVE UN/ISO COUNTRIES + WORLD BANK 2025 DATA
# ============================================================================

# Countries excluded from capital/border questions due to disputes or overseas border ambiguity
DISPUTED_CAPITALS = {"Israel", "Palestine", "South Africa", "Ivory Coast", "Sri Lanka", "Bolivia", "Netherlands", "Eswatini", "Benin", "Malaysia", "Tanzania"}
AMBIGUOUS_BORDER_COUNTS = {
    "France", "Spain", "Netherlands", "United Kingdom", "United States", "Denmark",
    "Norway", "China", "Brazil", "India", "Pakistan", "Serbia", "Morocco", "Israel",
    "Azerbaijan", "Armenia", "Georgia", "Cyprus", "Ukraine", "Russia", "Italy",
    "Sudan", "South Sudan", "Kenya", "Somalia", "Ethiopia", "Egypt", "Syria",
    "Lebanon", "North Korea", "South Korea", "Venezuela", "Guyana", "Suriname",
    "Belize", "Guatemala",
}

# Classic capital-city misconceptions for GAUNTLET_SHATTER (isTrick=True)
CAPITAL_MYTHS: list[tuple[str, str, str]] = [
    ("Australia", "Sydney", "Canberra"),
    ("Brazil", "Rio de Janeiro", "Brasília"),
    ("Canada", "Toronto", "Ottawa"),
    ("Turkey", "Istanbul", "Ankara"),
    ("Switzerland", "Zurich", "Bern"),
    ("New Zealand", "Auckland", "Wellington"),
    ("Morocco", "Casablanca", "Rabat"),
    ("Nigeria", "Lagos", "Abuja"),
    ("India", "Mumbai", "New Delhi"),
    ("United Arab Emirates", "Dubai", "Abu Dhabi"),
    ("Vietnam", "Ho Chi Minh City", "Hanoi"),
    ("Pakistan", "Karachi", "Islamabad"),
    ("Kazakhstan", "Almaty", "Astana"),
    ("Myanmar", "Yangon", "Naypyidaw"),
    ("Ecuador", "Guayaquil", "Quito"),
    ("Belize", "Belize City", "Belmopan"),
    ("Cameroon", "Douala", "Yaoundé"),
    ("Saudi Arabia", "Jeddah", "Riyadh"),
]


def ingest_countries_worldbank(builder: CatalogBuilder) -> None:
    print("[FORGE] Source 3/5: Ingesting UN/ISO Countries (mledoze/REST Countries upstream) + World Bank 2025...")
    countries_raw = http_get_json(
        "https://raw.githubusercontent.com/mledoze/countries/master/countries.json",
        timeout=25,
    )
    wb_raw = http_get_json(
        "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&mrnev=1&per_page=300",
        timeout=25,
    )
    pop_by_cca3: dict[str, tuple[int, str]] = {}
    if isinstance(wb_raw, list) and len(wb_raw) > 1 and isinstance(wb_raw[1], list):
        for row in wb_raw[1]:
            iso3 = row.get("countryiso3code")
            val = row.get("value")
            yr = str(row.get("date", "2025"))
            if iso3 and isinstance(val, (int, float)) and val > 0:
                pop_by_cca3[iso3] = (int(val), yr)

    # Filter to sovereign independent UN member states with clean fields
    un_countries: list[dict[str, Any]] = []
    by_cca3: dict[str, dict[str, Any]] = {}
    for c in countries_raw:
        if not (c.get("independent") and c.get("unMember")):
            continue
        common = clean_text((c.get("name") or {}).get("common", ""))
        if common == "Türkiye":
            common = "Turkey"
        if not common or len(common) > 24:
            continue
        cca3 = c.get("cca3", "")
        cca2 = c.get("cca2", "")
        region = clean_text(c.get("region", ""))
        subregion = clean_text(c.get("subregion", "")) or region
        caps = [clean_text(x) for x in (c.get("capital") or []) if clean_text(x)]
        area = c.get("area")
        landlocked = bool(c.get("landlocked", False))
        borders = list(c.get("borders") or [])
        currencies = c.get("currencies") or {}
        languages = c.get("languages") or {}
        pop_info = pop_by_cca3.get(cca3)

        entry = {
            "name": common,
            "cca2": cca2,
            "cca3": cca3,
            "region": region,
            "subregion": subregion,
            "capital": caps[0] if len(caps) == 1 else "",
            "area": float(area) if isinstance(area, (int, float)) and area > 0 else 0.0,
            "landlocked": landlocked,
            "borders": borders,
            "currencies": currencies,
            "languages": languages,
            "pop": pop_info[0] if pop_info else 0,
            "pop_year": pop_info[1] if pop_info else "2025",
        }
        un_countries.append(entry)
        by_cca3[cca3] = entry

    un_cca3_set = set(by_cca3.keys())
    rng = random.Random(20261121)

    # Helper to map country cca2 to our campaign region codes
    def country_regions(c: dict[str, Any]) -> list[str]:
        if c["cca2"] in VALID_REGIONS and c["cca2"] != "GLOBAL":
            return [c["cca2"], "GLOBAL"]
        return ["GLOBAL"]

    by_region: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for c in un_countries:
        if c["region"]:
            by_region[c["region"]].append(c)

    counts = Counter()

    # --- 3A. SIGHTLINE_LOCK: World Capitals (unambiguous sovereign states) ---
    cap_eligible = [
        c for c in un_countries
        if c["capital"] and len(c["capital"]) <= 26
        and c["name"] not in DISPUTED_CAPITALS
        and normalize_text(c["capital"]) != normalize_text(c["name"])  # skip Singapore/Monaco/San Marino tautology
    ]
    cap_eligible.sort(key=lambda x: x["pop"], reverse=True)
    for idx, c in enumerate(cap_eligible):
        same_reg_caps = [
            o["capital"] for o in by_region[c["region"]]
            if o["capital"] and o["name"] != c["name"]
            and len(o["capital"]) <= 26
            and normalize_text(o["capital"]) != normalize_text(c["capital"])
        ]
        if len(same_reg_caps) < 3:
            continue
        rng.shuffle(same_reg_caps)
        dists = same_reg_caps[:3]
        if c["name"] in EASY_ICONIC_CAPITALS:
            irt_b = round(-1.25 + (idx % 12) * 0.06, 2)
        else:
            irt_b = round(0.15 + min(2.35, (idx / max(1, len(cap_eligible))) * 2.35), 2)
        border_hint = "a landlocked state" if c["landlocked"] else "a coastal or island state"
        clue0 = f"This capital serves {border_hint} in {c['subregion']}."
        clue1 = f"The city's name begins with '{c['capital'][0].upper()}' and sits in {c['region']}."
        why = f"{c['capital']} is the official national capital of {c['name']}, located in {c['subregion']} ({c['region']})."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "World Capitals",
            "l2Subcategory": c["subregion"],
            "microTopicId": slugify_topic("geo_cap", c["name"]),
            "regions": country_regions(c),
            "narrativeTags": ["AGORA_CIVIC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "SIGHTLINE_LOCK",
            "prompt": f"What is the official capital city of {c['name']}?",
            "answerCorrect": c["capital"],
            "distractors": [
                {"text": dists[0], "plausibility": 0.82},
                {"text": dists[1], "plausibility": 0.68},
                {"text": dists[2], "plausibility": 0.54},
            ],
            "clues": [clue0, clue1],
            "glyphHint": "globe",
            "whyExplanation": why,
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["sightline_cap"] += 1

    # --- 3B. SIGHTLINE_LOCK: Official National Currencies (distinctive, non-Euro/non-USD) ---
    all_distinct_currencies: list[tuple[str, str, dict[str, Any]]] = []
    for c in un_countries:
        if len(c["currencies"]) != 1:
            continue
        code, info = next(iter(c["currencies"].items()))
        cname = clean_text((info or {}).get("name", ""))
        if not cname or len(cname) > 26:
            continue
        # Skip tautological names containing the country name (e.g. "Japanese yen" contains "Japan")
        if normalize_text(c["name"]) in normalize_text(cname):
            continue
        # Also skip super-generic "Euro" / "United States dollar"
        if code in ("EUR", "USD"):
            continue
        all_distinct_currencies.append((code, cname, c))

    # Include famous distinctive currencies even if adjective matches (strip country adjective for clean currency unit!)
    FAMOUS_CURRENCIES: list[tuple[str, str, str, str]] = [
        ("Japan", "Yen", "JPY", "East Asia"),
        ("Poland", "Złoty", "PLN", "Central Europe"),
        ("Hungary", "Forint", "HUF", "Central Europe"),
        ("Thailand", "Baht", "THB", "Southeast Asia"),
        ("Vietnam", "Đồng", "VND", "Southeast Asia"),
        ("Indonesia", "Rupiah", "IDR", "Southeast Asia"),
        ("Malaysia", "Ringgit", "MYR", "Southeast Asia"),
        ("South Korea", "Won", "KRW", "East Asia"),
        ("China", "Renminbi (Yuan)", "CNY", "East Asia"),
        ("India", "Rupee", "INR", "South Asia"),
        ("Brazil", "Real", "BRL", "South America"),
        ("Peru", "Sol", "PEN", "South America"),
        ("South Africa", "Rand", "ZAR", "Southern Africa"),
        ("Nigeria", "Naira", "NGN", "West Africa"),
        ("Ghana", "Cedi", "GHS", "West Africa"),
        ("Ethiopia", "Birr", "ETB", "East Africa"),
        ("Morocco", "Dirham", "MAD", "North Africa"),
        ("Turkey", "Lira", "TRY", "Western Asia"),
        ("Israel", "New Shekel", "ILS", "Western Asia"),
        ("Saudi Arabia", "Riyal", "SAR", "Western Asia"),
        ("Ukraine", "Hryvnia", "UAH", "Eastern Europe"),
        ("Romania", "Leu", "RON", "Southeast Europe"),
        ("Bulgaria", "Lev", "BGN", "Southeast Europe"),
        ("Sweden", "Krona", "SEK", "Northern Europe"),
        ("Norway", "Krone", "NOK", "Northern Europe"),
        ("Iceland", "Króna", "ISK", "Northern Europe"),
        ("Switzerland", "Swiss Franc", "CHF", "Central Europe"),
        ("Czechia", "Koruna", "CZK", "Central Europe"),
        ("Bangladesh", "Taka", "BDT", "South Asia"),
        ("Cambodia", "Riel", "KHR", "Southeast Asia"),
        ("Laos", "Kip", "LAK", "Southeast Asia"),
        ("Myanmar", "Kyat", "MMK", "Southeast Asia"),
        ("Mongolia", "Tögrög", "MNT", "East Asia"),
        ("Kazakhstan", "Tenge", "KZT", "Central Asia"),
        ("Uzbekistan", "Soʻm", "UZS", "Central Asia"),
        ("Georgia", "Lari", "GEL", "Caucasus"),
        ("Armenia", "Dram", "AMD", "Caucasus"),
        ("Azerbaijan", "Manat", "AZN", "Caucasus"),
        ("Guatemala", "Quetzal", "GTQ", "Central America"),
        ("Honduras", "Lempira", "HNL", "Central America"),
        ("Nicaragua", "Córdoba", "NIO", "Central America"),
        ("Costa Rica", "Colón", "CRC", "Central America"),
        ("Paraguay", "Guaraní", "PYG", "South America"),
        ("Bolivia", "Boliviano", "BOB", "South America"),
        ("Botswana", "Pula", "BWP", "Southern Africa"),
        ("Angola", "Kwanza", "AOA", "Southern Africa"),
        ("Zambia", "Kwacha", "ZMW", "Southern Africa"),
        ("Mozambique", "Metical", "MZN", "Southern Africa"),
        ("Madagascar", "Ariary", "MGA", "East Africa"),
    ]
    all_unit_names = [x[1] for x in FAMOUS_CURRENCIES]
    by_name = {c["name"]: c for c in un_countries}
    for idx, (cname, unit, iso_code, subreg) in enumerate(FAMOUS_CURRENCIES):
        c_obj = by_name.get(cname)
        if not c_obj or iso_code not in c_obj["currencies"]:
            continue
        pool = [u for u in all_unit_names if normalize_text(u) != normalize_text(unit)]
        rng.shuffle(pool)
        dists = pool[:3]
        if cname in EASY_ICONIC_CURRENCIES:
            irt_b = round(-0.75 + (idx % 6) * 0.06, 2)
        else:
            irt_b = round(0.20 + (idx / len(FAMOUS_CURRENCIES)) * 1.9, 2)
        clue0 = f"This sovereign currency circulates across {cname} in {subreg}."
        clue1 = f"Its three-letter ISO 4217 currency code is '{iso_code}'."
        why = f"The {unit} (ISO code {iso_code}) is the official national currency of {cname}."
        rec = {
            "qid": 0,
            "l0Domain": 8 if idx % 2 == 0 else 2,
            "l1Category": "Global Finance" if idx % 2 == 0 else "Economic Geography",
            "l2Subcategory": "World Currencies",
            "microTopicId": slugify_topic("geo_curr", f"{cname}_{iso_code}"),
            "regions": country_regions(c_obj),
            "narrativeTags": ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "SIGHTLINE_LOCK",
            "prompt": f"What is the official national currency of {cname}?",
            "answerCorrect": unit,
            "distractors": [
                {"text": dists[0], "plausibility": 0.80},
                {"text": dists[1], "plausibility": 0.68},
                {"text": dists[2], "plausibility": 0.54},
            ],
            "clues": [clue0, clue1],
            "glyphHint": "scales" if idx % 2 == 0 else "globe",
            "whyExplanation": why,
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["sightline_curr"] += 1

    # --- 3C. CALIBRATOR_DIAL: 2025 World Bank Populations (millions) ---
    pop_countries = sorted([c for c in un_countries if c["pop"] >= 5_000_000], key=lambda x: x["pop"], reverse=True)
    for idx, c in enumerate(pop_countries[:72]):
        pop_m = round(c["pop"] / 1_000_000.0, 1)
        exact = int(round(pop_m)) if pop_m >= 15 else round(pop_m * 2.0) / 2.0
        cal_step = 1 if exact >= 15 else 0.5
        bounds = make_calibrator_bounds(
            exact, "million", f"pop:{c['cca3']}",
            floor_val=1 if exact >= 15 else 0.5,
            step=cal_step,
            min_span=12 if exact >= 15 else 8,
        )
        if not bounds:
            continue
        lo, hi = bounds
        irt_b = round(-0.20 + (idx / 72.0) * 2.0, 2)
        clue0 = f"This {c['subregion']} nation ranks #{idx + 1} by population among UN states here."
        clue1 = f"World Bank {c['pop_year']} figures place it between {lo} and {hi} million people."
        why = f"According to World Bank {c['pop_year']} data, {c['name']} has a population of approximately {exact} million people."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "Demographics",
            "l2Subcategory": c["subregion"],
            "microTopicId": slugify_topic("geo_pop", c["name"]),
            "regions": country_regions(c),
            "narrativeTags": ["AGORA_CIVIC", "CURRENT_PULSE"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.2,
            "freshness": "SLOW_DRIFT",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": f"Approximately how many million people live in {c['name']} (World Bank {c['pop_year']})?",
            "answerCorrect": f"{exact} million",
            "clues": [clue0, clue1],
            "glyphHint": "globe",
            "whyExplanation": why,
            "calibratorExt": {
                "exactVal": exact,
                "unit": "million",
                "minVal": lo,
                "maxVal": hi,
                "step": cal_step,
            },
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["calibrator_pop"] += 1

    # --- 3D. CALIBRATOR_DIAL: Total Area (thousand km²) ---
    area_countries = sorted([c for c in un_countries if c["area"] >= 40_000], key=lambda x: x["area"], reverse=True)
    for idx, c in enumerate(area_countries[:60]):
        k_km2 = int(round(c["area"] / 1000.0))
        bounds = make_calibrator_bounds(k_km2, "thousand km²", f"area:{c['cca3']}", floor_val=10, step=1, min_span=40)
        if not bounds:
            continue
        lo, hi = bounds
        irt_b = round(0.15 + (idx / 60.0) * 2.05, 2)
        clue0 = f"Located in {c['subregion']}, {c['name']} ranks among the 60 largest UN nations."
        clue1 = f"Calibrate its total surface area in thousands of square kilometers."
        why = f"{c['name']} spans approximately {int(c['area']):,} km² ({k_km2:,} thousand km²) in {c['subregion']}."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "Physical Geography",
            "l2Subcategory": "National Land Area",
            "microTopicId": slugify_topic("geo_area", c["name"]),
            "regions": country_regions(c),
            "narrativeTags": ["AGORA_CIVIC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.2,
            "freshness": "EVERGREEN",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": f"What is the total area of {c['name']} in thousands of square kilometers?",
            "answerCorrect": f"{k_km2} thousand km²",
            "clues": [clue0, clue1],
            "glyphHint": "compass",
            "whyExplanation": why,
            "calibratorExt": {
                "exactVal": k_km2,
                "unit": "thousand km²",
                "minVal": lo,
                "maxVal": hi,
                "step": 1,
            },
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["calibrator_area"] += 1

    # --- 3E. CALIBRATOR_DIAL: Unambiguous Sovereign Land Borders ---
    border_candidates = []
    for c in un_countries:
        if c["name"] in AMBIGUOUS_BORDER_COUNTS:
            continue
        un_neighbors = [b for b in c["borders"] if b in un_cca3_set]
        if 3 <= len(un_neighbors) <= 12:
            border_candidates.append((c, un_neighbors))
    border_candidates.sort(key=lambda x: x[0]["pop"], reverse=True)
    for idx, (c, neigh) in enumerate(border_candidates[:34]):
        nb = len(neigh)
        # Note: Godot formats <10 as %.1f -> use step 1 and distinct bounds so all 4 facets differ
        lo = 0
        hi = max(12, nb + 6)
        if not calibrator_facets_distinct_in_godot(nb, lo, hi, "borders"):
            continue
        sample_names = ", ".join(by_cca3[b]["name"] for b in neigh[:2])
        irt_b = round(0.2 + (idx / 34.0) * 1.8, 2)
        clue0 = f"Situated in {c['subregion']}; two of its land neighbors are {sample_names}."
        clue1 = f"Count every sovereign UN state sharing a direct land frontier with {c['name']}."
        all_n = ", ".join(by_cca3[b]["name"] for b in neigh)
        why = trim_sentence(
            f"{c['name']} shares sovereign land borders with {nb} nations: {all_n}.",
            BUDGETS["whyMax"], 20
        ) or f"{c['name']} shares sovereign land frontiers with exactly {nb} neighboring nations in {c['subregion']}."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "Political Geography",
            "l2Subcategory": "Sovereign Borders",
            "microTopicId": slugify_topic("geo_borders", c["name"]),
            "regions": country_regions(c),
            "narrativeTags": ["SOVEREIGN_BLOC", "LATERAL_DEDUCTION"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": f"How many sovereign countries share a land border with {c['name']}?",
            "answerCorrect": f"{nb} borders",
            "clues": [clue0, clue1],
            "glyphHint": "compass",
            "whyExplanation": why,
            "calibratorExt": {
                "exactVal": nb,
                "unit": "borders",
                "minVal": lo,
                "maxVal": hi,
                "step": 1,
            },
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["calibrator_borders"] += 1

    # --- 3F. CODEX_DUAL_RING: 3 Countries <-> Capitals (grouped by region + 1 decoy) ---
    for region, clist in sorted(by_region.items()):
        clean_list = [
            c for c in clist
            if c["capital"] and len(c["name"]) <= 20 and len(c["capital"]) <= 20
            and c["name"] not in DISPUTED_CAPITALS
            and normalize_text(c["name"]) != normalize_text(c["capital"])
        ]
        clean_list.sort(key=lambda x: x["pop"], reverse=True)
        for i in range(0, len(clean_list) - 3, 4):
            grp = clean_list[i : i + 4]
            pairs = [{"subject": g["name"], "target": g["capital"]} for g in grp[:3]]
            decoy = grp[3]["capital"]
            names_str = ", ".join(g["name"] for g in grp[:3])
            irt_b = round(-0.4 + min(2.2, (i / max(1, len(clean_list))) * 2.2), 2)
            reg_adj = {
                "Africa": "African",
                "Americas": "American",
                "Asia": "Asian",
                "Europe": "European",
                "Oceania": "Oceanian",
            }.get(region, region)
            clue0 = f"All three states lie in {region}; the decoy capital belongs to {grp[3]['name']}."
            clue1 = f"First check {grp[0]['name']} in {grp[0]['subregion']} to anchor the ring."
            why = f"Verified {reg_adj} capitals: {grp[0]['name']} -> {grp[0]['capital']}, {grp[1]['name']} -> {grp[1]['capital']}, {grp[2]['name']} -> {grp[2]['capital']} (decoy: {decoy})."
            rec = {
                "qid": 0,
                "l0Domain": 2,
                "l1Category": "World Capitals",
                "l2Subcategory": f"{region} Atlas",
                "microTopicId": slugify_topic("geo_codex_cap", names_str),
                "regions": detect_regions(names_str),
                "narrativeTags": ["AGORA_CIVIC", "LATERAL_DEDUCTION"],
                "tone": "PRESTIGE",
                "irtB": irt_b,
                "irtA": 1.3,
                "freshness": "EVERGREEN",
                "archetype": "CODEX_DUAL_RING",
                "prompt": f"Align each {reg_adj} nation ({names_str}) with its official capital city.",
                "answerCorrect": f"3/3 {reg_adj} Capitals",
                "clues": [clue0, clue1],
                "glyphHint": "globe",
                "whyExplanation": why,
                "codexExt": {"pairs": pairs, "decoyTarget": decoy},
            }
            if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
                counts["codex_cap"] += 1

    # --- 3G. CODEX_DUAL_RING: 3 Countries <-> Currencies (+ 1 decoy currency) ---
    curr_valid = [x for x in FAMOUS_CURRENCIES if x[0] in by_name and x[2] in by_name[x[0]]["currencies"]]
    for i in range(0, len(curr_valid) - 3, 4):
        grp = curr_valid[i : i + 4]
        # Ensure 4 distinct currency labels
        if len({normalize_text(g[1]) for g in grp}) < 4:
            continue
        pairs = [{"subject": g[0], "target": g[1]} for g in grp[:3]]
        decoy = grp[3][1]
        names_str = ", ".join(g[0] for g in grp[:3])
        irt_b = round(0.1 + (i / max(1, len(curr_valid))) * 1.8, 2)
        clue0 = f"Watch ISO codes: {grp[0][0]} uses {grp[0][2]}, while {grp[1][0]} uses {grp[1][2]}."
        clue1 = f"The decoy currency ({decoy}) is actually issued by {grp[3][0]}."
        why = f"National currencies: {grp[0][0]} -> {grp[0][1]}, {grp[1][0]} -> {grp[1][1]}, {grp[2][0]} -> {grp[2][1]}."
        rec = {
            "qid": 0,
            "l0Domain": 8,
            "l1Category": "Global Economics",
            "l2Subcategory": "Sovereign Currencies",
            "microTopicId": slugify_topic("geo_codex_curr", names_str),
            "regions": detect_regions(names_str),
            "narrativeTags": ["SOVEREIGN_BLOC", "LATERAL_DEDUCTION"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "CODEX_DUAL_RING",
            "prompt": f"Match each nation ({names_str}) to its official national currency.",
            "answerCorrect": "3/3 World Currencies",
            "clues": [clue0, clue1],
            "glyphHint": "scales",
            "whyExplanation": why,
            "codexExt": {"pairs": pairs, "decoyTarget": decoy},
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["codex_curr"] += 1

    # --- 3H. CODEX_DUAL_RING: 3 Countries <-> Subregions ---
    by_subreg: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for c in un_countries:
        if c["subregion"] and len(c["subregion"]) <= 24 and len(c["name"]) <= 20:
            by_subreg[c["subregion"]].append(c)
    sub_keys = [k for k, v in sorted(by_subreg.items()) if len(v) >= 2]
    for round_idx in range(2):
        rng.shuffle(sub_keys)
        for i in range(0, len(sub_keys) - 3, 4):
            sks = sub_keys[i : i + 4]
            picked = []
            for sk in sks:
                arr = sorted(by_subreg[sk], key=lambda x: x["pop"], reverse=True)
                picked.append(arr[round_idx % len(arr)])
            pairs = [{"subject": picked[j]["name"], "target": sks[j]} for j in range(3)]
            decoy = sks[3]
            names_str = ", ".join(picked[j]["name"] for j in range(3))
            clue0 = f"Anchor {picked[0]['name']} first; its capital is {picked[0]['capital'] or 'in ' + picked[0]['region']}."
            clue1 = f"The extra subregion decoy belongs to {picked[3]['name']}."
            why = f"UN subregions: {picked[0]['name']} ({sks[0]}), {picked[1]['name']} ({sks[1]}), {picked[2]['name']} ({sks[2]})."
            rec = {
                "qid": 0,
                "l0Domain": 2,
                "l1Category": "Regional Geography",
                "l2Subcategory": "UN Geoscheme",
                "microTopicId": slugify_topic("geo_codex_sub", names_str),
                "regions": detect_regions(names_str),
                "narrativeTags": ["AGORA_CIVIC", "ARCHIVE_CORE"],
                "tone": "PRESTIGE",
                "irtB": round(0.0 + round_idx * 0.7, 2),
                "irtA": 1.25,
                "freshness": "EVERGREEN",
                "archetype": "CODEX_DUAL_RING",
                "prompt": f"Link each nation ({names_str}) to its official UN geographic subregion.",
                "answerCorrect": "3/3 UN Subregions",
                "clues": [clue0, clue1],
                "glyphHint": "compass",
                "whyExplanation": why,
                "codexExt": {"pairs": pairs, "decoyTarget": decoy},
            }
            if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
                counts["codex_sub"] += 1

    # --- 3I. GAUNTLET_SHATTER: Classic Capital City Myths (isTrick=True!) ---
    for country, fake_cap, real_cap in CAPITAL_MYTHS:
        c_obj = by_name.get(country)
        if not c_obj:
            continue
        clue0 = f"Separate {country}'s largest commercial metropolis from its seat of government."
        clue1 = f"The real political capital of {country} starts with the letter '{real_cap[0]}'."
        why = f"Classic geography trick! {fake_cap} is {country}'s largest or most famous hub, but {real_cap} is the official national capital."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "World Capitals",
            "l2Subcategory": "Capital Misconceptions",
            "microTopicId": slugify_topic("geo_myth_cap", f"{country}_{fake_cap}"),
            "regions": country_regions(c_obj),
            "narrativeTags": ["HIGH_STAKES_BLUFF", "AGORA_CIVIC"],
            "tone": "WITTY",
            "irtB": 0.1,
            "irtA": 1.35,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": f"{fake_cap} is the official national capital city of {country}.",
            "answerCorrect": "CHALLENGE! (Myth)",
            "clues": [clue0, clue1],
            "glyphHint": "globe",
            "whyExplanation": why,
            "gauntletExt": {"isTrue": False, "isTrick": True, "windowSec": 8},
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["gauntlet_myth"] += 1

    # --- 3J. GAUNTLET_SHATTER: Landlocked vs Coastal Verified Facts ---
    landlocked_list = sorted([c for c in un_countries if c["landlocked"]], key=lambda x: x["pop"], reverse=True)
    coastal_list = sorted([c for c in un_countries if not c["landlocked"] and c["area"] > 50_000], key=lambda x: x["pop"], reverse=True)
    for idx, c in enumerate(landlocked_list[:26]):
        clue0 = f"Picture {c['name']} on a map of {c['subregion']} and trace its perimeter."
        clue1 = f"Check whether any border of {c['name']} reaches an open world ocean."
        why = f"{c['name']} is completely landlocked in {c['subregion']}, with no direct coastline on any open ocean."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "Physical Geography",
            "l2Subcategory": "Landlocked States",
            "microTopicId": slugify_topic("geo_ll_t", c["name"]),
            "regions": country_regions(c),
            "narrativeTags": ["AGORA_CIVIC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": round(-0.5 + (idx / 26.0) * 2.1, 2),
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": f"{c['name']} is a completely landlocked sovereign nation in {c['subregion']}.",
            "answerCorrect": "TRUE",
            "clues": [clue0, clue1],
            "glyphHint": "compass",
            "whyExplanation": why,
            "gauntletExt": {"isTrue": True, "isTrick": False, "windowSec": 8},
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["gauntlet_ll"] += 1

    for idx, c in enumerate(coastal_list[:24]):
        clue0 = f"Locate {c['name']} within {c['subregion']} and inspect its maritime access."
        clue1 = f"Verify whether {c['name']} possesses a coastline on a sea or ocean."
        why = f"{c['name']} is not landlocked—it borders maritime waters along its coast in {c['subregion']}."
        rec = {
            "qid": 0,
            "l0Domain": 2,
            "l1Category": "Physical Geography",
            "l2Subcategory": "Maritime Access",
            "microTopicId": slugify_topic("geo_ll_f", c["name"]),
            "regions": country_regions(c),
            "narrativeTags": ["AGORA_CIVIC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": round(-0.6 + (idx / 24.0) * 1.9, 2),
            "irtA": 1.2,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": f"{c['name']} is a completely landlocked nation with no open-ocean coastline.",
            "answerCorrect": "FALSE",
            "clues": [clue0, clue1],
            "glyphHint": "wave",
            "whyExplanation": why,
            "gauntletExt": {"isTrue": False, "isTrick": False, "windowSec": 8},
        }
        if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
            counts["gauntlet_ll"] += 1

    # --- 3K. GAUNTLET_SHATTER: Verified Shared Land Borders (True & False pairs) ---
    major_contiguous = [
        c for c in un_countries
        if c["name"] not in AMBIGUOUS_BORDER_COUNTS and len([b for b in c["borders"] if b in un_cca3_set]) >= 2
    ]
    major_contiguous.sort(key=lambda x: x["pop"], reverse=True)
    seen_border_pairs: set[tuple[str, str]] = set()
    for idx, c in enumerate(major_contiguous[:35]):
        un_nb = [b for b in c["borders"] if b in un_cca3_set and by_cca3[b]["name"] not in AMBIGUOUS_BORDER_COUNTS]
        if not un_nb:
            continue
        # 1 TRUE pair
        b_code = un_nb[idx % len(un_nb)]
        other = by_cca3[b_code]
        pair_key = tuple(sorted([c["cca3"], other["cca3"]]))
        if pair_key not in seen_border_pairs:
            seen_border_pairs.add(pair_key)
            rec = {
                "qid": 0,
                "l0Domain": 2,
                "l1Category": "Political Geography",
                "l2Subcategory": "Border Verification",
                "microTopicId": slugify_topic("geo_nb_t", f"{c['name']}_{other['name']}"),
                "regions": detect_regions(c["name"], other["name"]),
                "narrativeTags": ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
                "tone": "PRESTIGE",
                "irtB": round(-0.2 + (idx / 35.0) * 1.6, 2),
                "irtA": 1.2,
                "freshness": "EVERGREEN",
                "archetype": "GAUNTLET_SHATTER",
                "prompt": f"{c['name']} and {other['name']} share a direct international land border.",
                "answerCorrect": "TRUE",
                "clues": [
                    f"Trace the frontiers of {c['name']} inside {c['subregion']}.",
                    f"Consider whether any third country separates {c['name']} from {other['name']}.",
                ],
                "glyphHint": "compass",
                "whyExplanation": f"Confirmed: {c['name']} and {other['name']} are direct land neighbors in {c['region']}.",
                "gauntletExt": {"isTrue": True, "isTrick": False, "windowSec": 8},
            }
            if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
                counts["gauntlet_border"] += 1

        # 1 FALSE same-region non-neighbor pair
        non_nb = [
            o for o in by_region[c["region"]]
            if o["cca3"] != c["cca3"] and o["cca3"] not in c["borders"]
            and o["name"] not in AMBIGUOUS_BORDER_COUNTS and o["pop"] > 4_000_000
        ]
        if non_nb:
            other2 = non_nb[idx % len(non_nb)]
            pair_key2 = tuple(sorted([c["cca3"], other2["cca3"]]))
            if pair_key2 not in seen_border_pairs:
                seen_border_pairs.add(pair_key2)
                rec = {
                    "qid": 0,
                    "l0Domain": 2,
                    "l1Category": "Political Geography",
                    "l2Subcategory": "Border Verification",
                    "microTopicId": slugify_topic("geo_nb_f", f"{c['name']}_{other2['name']}"),
                    "regions": detect_regions(c["name"], other2["name"]),
                    "narrativeTags": ["SOVEREIGN_BLOC", "LATERAL_DEDUCTION"],
                    "tone": "PRESTIGE",
                    "irtB": round(-0.1 + (idx / 35.0) * 1.7, 2),
                    "irtA": 1.25,
                    "freshness": "EVERGREEN",
                    "archetype": "GAUNTLET_SHATTER",
                    "prompt": f"{c['name']} shares a direct international land border with {other2['name']}.",
                    "answerCorrect": "FALSE",
                    "clues": [
                        f"Both sit in {c['region']}, but check if they actually touch on land.",
                        f"Visualize the buffer countries or sea between {c['name']} and {other2['name']}.",
                    ],
                    "glyphHint": "globe",
                    "whyExplanation": f"{c['name']} and {other2['name']} are both in {c['region']}, but they do not share a direct land border.",
                    "gauntletExt": {"isTrue": False, "isTrick": False, "windowSec": 8},
                }
                if builder.try_add(rec, "UN/ISO Countries + World Bank", structured=True):
                    counts["gauntlet_border"] += 1

    print(f"  -> Accepted {sum(counts.values())} verified Geography/Economics questions: {dict(counts)}")


# ============================================================================
# 7. SOURCE 4: IUPAC PERIODIC TABLE + OFFICIAL NOBEL PRIZE API v2.1
# ============================================================================

ELEMENT_SYMBOL_MYTHS: list[tuple[str, str, str]] = [
    ("Potassium", "P", "K (from Latin kalium)"),
    ("Sodium", "So", "Na (from Latin natrium)"),
    ("Gold", "Gd", "Au (from Latin aurum)"),
    ("Silver", "Si", "Ag (from Latin argentum)"),
    ("Tungsten", "Tu", "W (from wolfram)"),
    ("Lead", "Ld", "Pb (from Latin plumbum)"),
    ("Tin", "Ti", "Sn (from Latin stannum)"),
    ("Mercury", "Mc", "Hg (from hydrargyrum)"),
    ("Iron", "Ir", "Fe (from Latin ferrum)"),
    ("Copper", "Co", "Cu (from Latin cuprum)"),
    ("Antimony", "An", "Sb (from Latin stibium)"),
    ("Phosphorus", "Ph", "P (atomic number 15)"),
]


def ingest_periodic_and_nobel(builder: CatalogBuilder) -> None:
    print("[FORGE] Source 4/5: Ingesting IUPAC Periodic Table (118) + Official Nobel Prize API v2.1...")
    pt_raw = http_get_json(
        "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json",
        timeout=25,
    )
    elements = [e for e in pt_raw.get("elements", []) if isinstance(e.get("number"), int) and 1 <= e["number"] <= 118]
    rng = random.Random(20261122)
    counts = Counter()

    # Clean category title formatting
    def fmt_cat(raw_cat: str) -> str:
        c = clean_text(raw_cat)
        if c.startswith("unknown"):
            return ""
        return c.title()

    # --- 4A. Periodic Table SIGHTLINE_LOCK (Chemical Symbols <-> Elements) ---
    # Prioritize iconic, Latin-root, and widely tested elements (1..94)
    all_names = [e["name"] for e in elements]
    for e in elements:
        num = e["number"]
        name = e["name"]
        sym = e["symbol"]
        cat = fmt_cat(e.get("category", ""))
        phase = clean_text(e.get("phase", ""))
        period = e.get("period")
        group = e.get("group")

        # Skip ultra-obscure synthetic elements > 95 for Sightline Symbol except famous ones
        if num > 95 and num not in (96, 98, 99, 100, 101, 102, 118):
            continue

        # Distractors: elements starting with same first letter or same symbol letter for high plausibility!
        same_letter = [x["name"] for x in elements if x["name"] != name and (x["name"][0] == sym[0] or x["name"][0] == name[0])]
        others = [x["name"] for x in elements if x["name"] != name and x["name"] not in same_letter]
        rng.shuffle(same_letter)
        rng.shuffle(others)
        dists = (same_letter + others)[:3]

        if name in EASY_ICONIC_ELEMENTS:
            irt_b = round(-1.20 if name in ("Hydrogen", "Helium", "Carbon", "Nitrogen", "Oxygen") else -0.55, 2)
        else:
            irt_b = round(0.25 + (num / 118.0) * 2.1, 2)
            if not name.lower().startswith(sym.lower()):
                irt_b = round(min(2.5, irt_b + 0.25), 2)
        clue0 = f"Atomic number {num} in Period {period}; classified as a {cat.lower() or 'chemical element'}."
        clue1 = f"At room temperature this element is a {phase.lower() or 'substance'} in Group {group}."
        why = f"On the periodic table, '{sym}' is the official IUPAC symbol for {name} (atomic number {num}, {cat.lower() or 'element'})."

        rec = {
            "qid": 0,
            "l0Domain": 1,
            "l1Category": "Chemistry",
            "l2Subcategory": "Periodic Table",
            "microTopicId": slugify_topic("pt_sym", f"{num}_{sym}"),
            "regions": ["GLOBAL"],
            "narrativeTags": ["HORIZON_TECH", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "SIGHTLINE_LOCK",
            "prompt": f"Which chemical element is represented by the periodic table symbol '{sym}'?",
            "answerCorrect": name,
            "distractors": [
                {"text": dists[0], "plausibility": 0.86},
                {"text": dists[1], "plausibility": 0.72},
                {"text": dists[2], "plausibility": 0.56},
            ],
            "clues": [clue0, clue1],
            "glyphHint": "atom",
            "whyExplanation": why,
        }
        if builder.try_add(rec, "IUPAC Periodic Table", structured=True):
            counts["pt_sightline"] += 1

    # --- 4B. Periodic Table CALIBRATOR_DIAL (Atomic Numbers & Melting Points °C) ---
    cal_elements = [
        e for e in elements
        if e["number"] in (
            2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 25,
            26, 27, 28, 29, 30, 33, 35, 36, 47, 50, 53, 54, 56, 74, 78, 79, 80, 82,
            83, 86, 88, 92, 94, 118,
        )
    ]
    for e in cal_elements:
        num = e["number"]
        name = e["name"]
        sym = e["symbol"]
        cat = fmt_cat(e.get("category", "")) or "element"
        bounds = make_calibrator_bounds(num, "protons", f"pt_z:{num}", floor_val=1, ceil_val=118, step=1, min_span=14)
        if not bounds:
            continue
        lo, hi = bounds
        irt_b = round(-0.45 if num in (2, 6, 7, 8) else 0.15 + (num / 118.0) * 2.0, 2)
        clue0 = f"Symbol '{sym}' resides in Period {e['period']}, Group {e['group']} ({cat.lower()})."
        clue1 = f"Count its protons along the IUPAC periodic table between {lo} and {hi}."
        why = f"{name} (symbol {sym}) has atomic number {num}, meaning every neutral {name} atom contains {num} protons."
        rec = {
            "qid": 0,
            "l0Domain": 1,
            "l1Category": "Chemistry",
            "l2Subcategory": "Atomic Structure",
            "microTopicId": slugify_topic("pt_z", name),
            "regions": ["GLOBAL"],
            "narrativeTags": ["HORIZON_TECH", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": f"What is the atomic number (proton count) of the element {name}?",
            "answerCorrect": f"{num} protons",
            "clues": [clue0, clue1],
            "glyphHint": "atom",
            "whyExplanation": why,
            "calibratorExt": {"exactVal": num, "unit": "protons", "minVal": lo, "maxVal": hi, "step": 1},
        }
        if builder.try_add(rec, "IUPAC Periodic Table", structured=True):
            counts["pt_cal_z"] += 1

    # Melting points in °C for iconic metals/elements
    melt_nums = {3, 11, 13, 14, 22, 26, 29, 30, 47, 50, 74, 78, 79, 80, 82}
    for e in elements:
        if e["number"] not in melt_nums or not isinstance(e.get("melt"), (int, float)):
            continue
        c_temp = int(round(e["melt"] - 273.15))
        bounds = make_calibrator_bounds(c_temp, "°C", f"pt_melt:{e['number']}", floor_val=-273, step=1, min_span=80)
        if not bounds:
            continue
        lo, hi = bounds
        clue0 = f"{e['name']} (symbol {e['symbol']}) is a {fmt_cat(e['category']).lower() or 'element'}."
        clue1 = f"Calibrate its standard atmospheric melting point in degrees Celsius."
        why = f"At standard pressure, {e['name']} melts at approximately {c_temp:,} °C ({e['melt']:.1f} K)."
        rec = {
            "qid": 0,
            "l0Domain": 1,
            "l1Category": "Materials Physics",
            "l2Subcategory": "Phase Transitions",
            "microTopicId": slugify_topic("pt_melt", e["name"]),
            "regions": ["GLOBAL"],
            "narrativeTags": ["HORIZON_TECH", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": 1.15,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": f"At approximately what temperature in °C does pure {e['name']} melt?",
            "answerCorrect": f"{c_temp} °C",
            "clues": [clue0, clue1],
            "glyphHint": "atom",
            "whyExplanation": why,
            "calibratorExt": {"exactVal": c_temp, "unit": "°C", "minVal": lo, "maxVal": hi, "step": 1},
        }
        if builder.try_add(rec, "IUPAC Periodic Table", structured=True):
            counts["pt_cal_melt"] += 1

    # --- 4C. Periodic Table CODEX_DUAL_RING (Elements <-> Symbols) ---
    codex_els = [e for e in elements if e["number"] <= 92]
    for i in range(0, len(codex_els) - 3, 4):
        grp = codex_els[i : i + 4]
        pairs = [{"subject": g["name"], "target": g["symbol"]} for g in grp[:3]]
        decoy = grp[3]["symbol"]
        names = ", ".join(g["name"] for g in grp[:3])
        irt_b = round(-0.5 + (i / len(codex_els)) * 2.2, 2)
        clue0 = f"Anchor {grp[0]['name']} first (atomic number {grp[0]['number']})."
        clue1 = f"The decoy symbol '{decoy}' actually stands for {grp[3]['name']}."
        why = f"IUPAC symbols: {grp[0]['name']} -> {grp[0]['symbol']}, {grp[1]['name']} -> {grp[1]['symbol']}, {grp[2]['name']} -> {grp[2]['symbol']}."
        rec = {
            "qid": 0,
            "l0Domain": 1,
            "l1Category": "Chemistry",
            "l2Subcategory": "Elemental Symbols",
            "microTopicId": slugify_topic("pt_codex_sym", names),
            "regions": ["GLOBAL"],
            "narrativeTags": ["HORIZON_TECH", "LATERAL_DEDUCTION"],
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "CODEX_DUAL_RING",
            "prompt": f"Align each element ({names}) with its official IUPAC chemical symbol.",
            "answerCorrect": "3/3 Chemical Symbols",
            "clues": [clue0, clue1],
            "glyphHint": "atom",
            "whyExplanation": why,
            "codexExt": {"pairs": pairs, "decoyTarget": decoy},
        }
        if builder.try_add(rec, "IUPAC Periodic Table", structured=True):
            counts["pt_codex"] += 1

    # --- 4D. Periodic Table GAUNTLET_SHATTER (Symbol Myths + Phase/Family Facts) ---
    for el_name, fake_sym, real_info in ELEMENT_SYMBOL_MYTHS:
        rec = {
            "qid": 0,
            "l0Domain": 1,
            "l1Category": "Chemistry",
            "l2Subcategory": "Periodic Table Traps",
            "microTopicId": slugify_topic("pt_myth", f"{el_name}_{fake_sym}"),
            "regions": ["GLOBAL"],
            "narrativeTags": ["HORIZON_TECH", "HIGH_STAKES_BLUFF"],
            "tone": "WITTY",
            "irtB": 0.25,
            "irtA": 1.35,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": f"On the periodic table, the chemical symbol for {el_name} is '{fake_sym}'.",
            "answerCorrect": "CHALLENGE! (Myth)",
            "clues": [
                f"Many classical metals draw their symbols from Latin or older mineral names.",
                f"Check whether '{fake_sym}' actually belongs to a different element.",
            ],
            "glyphHint": "atom",
            "whyExplanation": f"Chemistry trap! {el_name}'s official IUPAC symbol is {real_info}, not '{fake_sym}'.",
            "gauntletExt": {"isTrue": False, "isTrick": True, "windowSec": 8},
        }
        if builder.try_add(rec, "IUPAC Periodic Table", structured=True):
            counts["pt_gauntlet"] += 1

    # Verified noble gas / liquid phase true/false
    noble_gases = {e["name"] for e in elements if e.get("category") == "noble gas"}
    for e in elements[:54]:
        if e["number"] not in (2, 7, 8, 10, 17, 18, 26, 29, 35, 36, 47, 53, 54):
            continue
        is_noble = e["name"] in noble_gases
        rec = {
            "qid": 0,
            "l0Domain": 1,
            "l1Category": "Chemistry",
            "l2Subcategory": "Elemental Families",
            "microTopicId": slugify_topic("pt_noble", e["name"]),
            "regions": ["GLOBAL"],
            "narrativeTags": ["HORIZON_TECH", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": -0.2,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": f"{e['name']} (symbol {e['symbol']}) belongs to the noble gas family in Group 18.",
            "answerCorrect": "TRUE" if is_noble else "FALSE",
            "clues": [
                f"Locate {e['name']} (atomic number {e['number']}) on the right edge of the table.",
                f"Group 18 elements have complete outer valence electron shells.",
            ],
            "glyphHint": "atom",
            "whyExplanation": (
                f"{e['name']} ({e['symbol']}, Z={e['number']}) is a Group 18 noble gas."
                if is_noble
                else f"{e['name']} ({e['symbol']}, Z={e['number']}) is in Group {e['group']} ({fmt_cat(e['category']).lower() or 'other family'}), not a noble gas."
            ),
            "gauntletExt": {"isTrue": is_noble, "isTrick": False, "windowSec": 8},
        }
        if builder.try_add(rec, "IUPAC Periodic Table", structured=True):
            counts["pt_gauntlet"] += 1

    # --- 4E. OFFICIAL NOBEL PRIZE API v2.1 (1901–2025) ---
    try:
        nobel_raw = http_get_json("https://api.nobelprize.org/2.1/nobelPrizes?limit=700", timeout=25)
        prizes = nobel_raw.get("nobelPrizes", [])
    except Exception as e:
        print(f"  [warn] Nobel API fetch failed: {e}")
        prizes = []

    nobel_cat_domain = {
        "Physics": (1, "Physics", "Nobel Laureates"),
        "Chemistry": (1, "Chemistry", "Nobel Laureates"),
        "Physiology or Medicine": (7, "Medicine & Biology", "Nobel Laureates"),
        "Literature": (3, "World Literature", "Nobel Laureates"),
        "Peace": (8, "International Diplomacy", "Nobel Laureates"),
        "Economic Sciences": (8, "Economics", "Nobel Laureates"),
    }
    short_cat = {
        "Physics": "Physics",
        "Chemistry": "Chemistry",
        "Physiology or Medicine": "Medicine",
        "Literature": "Literature",
        "Peace": "Peace",
        "Economic Sciences": "Economics",
    }

    # Count laureate appearances to exclude multi-prize laureates from ambiguous category/year prompts
    laureate_freq: Counter[str] = Counter()
    single_prizes: list[dict[str, Any]] = []
    for p in prizes:
        try:
            yr = int(p.get("awardYear", 0))
        except ValueError:
            continue
        if not (1901 <= yr <= 2025):
            continue
        cat_en = clean_text((p.get("category") or {}).get("en", ""))
        if cat_en not in nobel_cat_domain:
            continue
        ls = p.get("laureates") or []
        for l in ls:
            nm = clean_text(((l.get("knownName") or l.get("orgName") or {}).get("en", "")))
            if nm:
                laureate_freq[nm] += 1
        if len(ls) == 1:
            l0 = ls[0]
            nm = clean_text(((l0.get("knownName") or l0.get("orgName") or {}).get("en", "")))
            mot = clean_text((l0.get("motivation") or {}).get("en", ""))
            if nm and len(nm) <= 26 and mot:
                single_prizes.append({"year": yr, "cat": cat_en, "short": short_cat[cat_en], "name": nm, "mot": mot})

    # Keep only unique-laureate prizes so every category/year answer is 100% unambiguous
    unique_nobels = [x for x in single_prizes if laureate_freq[x["name"]] == 1]

    # SIGHTLINE_LOCK: Laureate -> Nobel Category (clean, crisp, diverse!)
    all_short_cats = list(short_cat.values())
    # Sample balanced across all 6 Nobel categories
    by_ncat: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for x in unique_nobels:
        by_ncat[x["short"]].append(x)

    picked_sightline: list[dict[str, Any]] = []
    for cname, lst in sorted(by_ncat.items()):
        # Take evenly spaced laureates across the 1901..2025 timeline
        step = max(1, len(lst) // 16)
        picked_sightline.extend(lst[::step][:16])

    for x in picked_sightline:
        dom, l1, l2 = nobel_cat_domain[x["cat"]]
        dists = [c for c in all_short_cats if c != x["short"]]
        rng.shuffle(dists)
        mot_clean = trim_sentence(x["mot"], 82, 16)
        # Ensure motivation does not leak the Nobel category word
        if not mot_clean or contains_whole_phrase(normalize_text(mot_clean), normalize_text(x["short"])):
            mot_clean = f"This {x['year']} Nobel citation honored landmark contributions in {l1.lower()}."
        clue0 = f"Awarded by the Nobel committees in {x['year']}."
        clue1 = trim_sentence(f"Citation focus: {mot_clean}", BUDGETS["clue1Max"], 14) or f"Filed under the {l1} domain in the Meridian Archive."
        why = trim_sentence(
            f"In {x['year']}, {x['name']} received the Nobel Prize in {x['cat']} ({x['mot']}).",
            BUDGETS["whyMax"], 20
        ) or f"In {x['year']}, {x['name']} was awarded the Nobel Prize in {x['cat']}."

        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": l2,
            "microTopicId": slugify_topic("nobel_cat", f"{x['year']}_{x['name']}"),
            "regions": detect_regions(x["name"], x["mot"]),
            "narrativeTags": ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": round(0.4 + ((x["year"] - 1901) / 125.0) * 1.4, 2),
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "SIGHTLINE_LOCK",
            "prompt": f"In which Nobel Prize field was {x['name']} honored in {x['year']}?",
            "answerCorrect": x["short"],
            "distractors": [
                {"text": dists[0], "plausibility": 0.78},
                {"text": dists[1], "plausibility": 0.66},
                {"text": dists[2], "plausibility": 0.54},
            ],
            "clues": [clue0, clue1],
            "glyphHint": pick_glyph(dom, x["name"]),
            "whyExplanation": why,
        }
        if builder.try_add(rec, "Nobel Prize API v2.1", structured=True):
            counts["nobel_sightline"] += 1

    # CALIBRATOR_DIAL: Iconic Nobel Prize Years (1905..2000 so maxVal <= 2025!)
    iconic_laureates = {
        "Albert Einstein", "Max Planck", "Niels Bohr", "Werner Heisenberg", "Erwin Schrödinger",
        "Paul Dirac", "Enrico Fermi", "Richard P. Feynman", "Subrahmanyan Chandrasekhar",
        "Ernest Rutherford", "Fritz Haber", "Otto Hahn", "Dorothy Crowfoot Hodgkin",
        "Ivan Pavlov", "Robert Koch", "Alexander Fleming", "Barbara McClintock",
        "Rudyard Kipling", "Rabindranath Tagore", "William Butler Yeats", "George Bernard Shaw",
        "Sinclair Lewis", "Eugene O'Neill", "Pearl Buck", "Hermann Hesse", "T.S. Eliot",
        "William Faulkner", "Bertrand Russell", "Winston Churchill", "Ernest Hemingway",
        "Albert Camus", "Boris Pasternak", "John Steinbeck", "Jean-Paul Sartre",
        "Samuel Beckett", "Aleksandr Solzhenitsyn", "Pablo Neruda", "Gabriel García Márquez",
        "William Golding", "Wole Soyinka", "Naguib Mahfouz", "Octavio Paz", "Toni Morrison",
        "Seamus Heaney", "José Saramago", "Günter Grass", "Theodore Roosevelt",
        "Woodrow Wilson", "Jane Addams", "George C. Marshall", "Albert Schweitzer",
        "Martin Luther King Jr.", "Mother Teresa", "Lech Walesa", "Desmond Tutu",
        "Elie Wiesel", "Mikhail Gorbachev", "Aung San Suu Kyi", "Kofi Annan",
        "Paul A. Samuelson", "Kenneth J. Arrow", "Friedrich August von Hayek",
        "Milton Friedman", "Herbert A. Simon", "Gary S. Becker", "Amartya Sen",
    }
    for x in unique_nobels:
        if x["name"] not in iconic_laureates or not (1905 <= x["year"] <= 2002):
            continue
        dom, l1, l2 = nobel_cat_domain[x["cat"]]
        bounds = make_calibrator_bounds(x["year"], "CE", f"nobel_yr:{x['name']}", floor_val=1901, ceil_val=2025, step=1, min_span=30)
        if not bounds:
            continue
        lo, hi = bounds
        decade = (x["year"] // 10) * 10
        clue0 = f"This Nobel Prize in {x['cat']} was awarded during the {decade}s."
        clue1 = f"Dial in the exact award year between {lo} and {hi} CE."
        why = trim_sentence(
            f"{x['name']} received the {x['year']} Nobel Prize in {x['cat']} ({x['mot']}).",
            BUDGETS["whyMax"], 20
        ) or f"{x['name']} was awarded the Nobel Prize in {x['cat']} in {x['year']}."
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": "Nobel Chronology",
            "microTopicId": slugify_topic("nobel_yr", x["name"]),
            "regions": detect_regions(x["name"], x["mot"]),
            "narrativeTags": ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": 1.15,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": f"In what year was {x['name']} awarded the Nobel Prize in {x['short']}?",
            "answerCorrect": f"{x['year']} CE",
            "clues": [clue0, clue1],
            "glyphHint": pick_glyph(dom, x["name"]),
            "whyExplanation": why,
            "calibratorExt": {"exactVal": x["year"], "unit": "CE", "minVal": lo, "maxVal": hi, "step": 1},
        }
        if builder.try_add(rec, "Nobel Prize API v2.1", structured=True):
            counts["nobel_cal"] += 1

    # CODEX_DUAL_RING: 3 Nobel Laureates <-> Distinct Categories (+1 decoy category)
    iconic_by_cat: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for x in unique_nobels:
        if x["name"] in iconic_laureates and len(x["name"]) <= 22:
            iconic_by_cat[x["short"]].append(x)
    # Pad categories with additional clean laureates if needed
    for cname, lst in by_ncat.items():
        for x in lst:
            if len(iconic_by_cat[cname]) >= 12:
                break
            if len(x["name"]) <= 20 and x not in iconic_by_cat[cname]:
                iconic_by_cat[cname].append(x)

    cat_order = ["Physics", "Chemistry", "Medicine", "Literature", "Peace", "Economics"]
    for idx in range(20):
        c_slice = [cat_order[(idx + j) % 6] for j in range(4)]
        cands = []
        ok = True
        for j in range(3):
            pool = iconic_by_cat[c_slice[j]]
            if not pool:
                ok = False
                break
            cands.append(pool[idx % len(pool)])
        if not ok or len({c["name"] for c in cands}) < 3:
            continue
        pairs = [{"subject": c["name"], "target": c["short"]} for c in cands]
        decoy = c_slice[3]
        names_str = ", ".join(c["name"] for c in cands)
        rec = {
            "qid": 0,
            "l0Domain": 0 if idx % 2 == 0 else 8,
            "l1Category": "History of Ideas" if idx % 2 == 0 else "Nobel Distinctions",
            "l2Subcategory": "Nobel Laureates",
            "microTopicId": slugify_topic("nobel_codex", names_str),
            "regions": detect_regions(names_str),
            "narrativeTags": ["SOVEREIGN_BLOC", "LATERAL_DEDUCTION"],
            "tone": "PRESTIGE",
            "irtB": round(0.3 + (idx / 20.0) * 1.4, 2),
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "CODEX_DUAL_RING",
            "prompt": f"Match each Nobel laureate ({names_str}) to their prize category.",
            "answerCorrect": "3/3 Nobel Categories",
            "clues": [
                f"{cands[0]['name']} won in {cands[0]['year']}; {cands[1]['name']} won in {cands[1]['year']}.",
                f"None of these three laureates won the {decoy} prize.",
            ],
            "glyphHint": "crown" if idx % 2 == 0 else "scales",
            "whyExplanation": f"Nobel categories: {cands[0]['name']} ({cands[0]['short']}), {cands[1]['name']} ({cands[1]['short']}), {cands[2]['name']} ({cands[2]['short']}).",
            "codexExt": {"pairs": pairs, "decoyTarget": decoy},
        }
        if builder.try_add(rec, "Nobel Prize API v2.1", structured=True):
            counts["nobel_codex"] += 1

    # GAUNTLET_SHATTER: Verified Iconic Nobel True/False statements
    iconic_list = [x for x in unique_nobels if x["name"] in iconic_laureates]
    for idx, x in enumerate(iconic_list[:32]):
        dom, l1, l2 = nobel_cat_domain[x["cat"]]
        make_true = (idx % 2 == 0)
        shown_cat = x["cat"] if make_true else [c for c in nobel_cat_domain if c != x["cat"]][idx % 5]
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": "Nobel Records",
            "microTopicId": slugify_topic("nobel_tf", f"{x['name']}_{shown_cat}"),
            "regions": detect_regions(x["name"]),
            "narrativeTags": ["SOVEREIGN_BLOC", "ARCHIVE_CORE"],
            "tone": "PRESTIGE",
            "irtB": 0.45,
            "irtA": 1.25,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": f"{x['name']} was awarded the {x['year']} Nobel Prize in {shown_cat}.",
            "answerCorrect": "TRUE" if make_true else "FALSE",
            "clues": [
                f"Recall {x['name']}'s signature discipline during the {(x['year']//10)*10}s.",
                f"Verify whether the cited Nobel committee matches {x['name']}'s career.",
            ],
            "glyphHint": pick_glyph(dom, x["name"]),
            "whyExplanation": (
                f"Confirmed: {x['name']} received the {x['year']} Nobel Prize in {x['cat']}."
                if make_true
                else f"Incorrect category: {x['name']} won the {x['year']} Nobel Prize in {x['cat']}, not {shown_cat}."
            ),
            "gauntletExt": {"isTrue": make_true, "isTrick": False, "windowSec": 8},
        }
        if builder.try_add(rec, "Nobel Prize API v2.1", structured=True):
            counts["nobel_gauntlet"] += 1

    print(f"  -> Accepted {sum(counts.values())} verified Periodic Table + Nobel questions: {dict(counts)}")


# ============================================================================
# 8. SOURCE 5: DETERMINISTIC VERIFIED REFERENCE DATASETS (ALL 12 DOMAINS)
# ============================================================================

def _is_prime(n: int) -> bool:
    if n < 2:
        return False
    for d in range(2, int(math.isqrt(n)) + 1):
        if n % d == 0:
            return False
    return True


def _to_roman(n: int) -> str:
    vals = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"),
            (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"),
            (5, "V"), (4, "IV"), (1, "I")]
    out = []
    for v, sym in vals:
        while n >= v:
            out.append(sym)
            n -= v
    return "".join(out)


def ingest_verified_reference_datasets(builder: CatalogBuilder) -> None:
    print("[FORGE] Source 5/5: Generating deterministic textbook/SI/NASA/computed reference questions...")
    rng = random.Random(20261123)
    counts = Counter()

    def add_cal(dom: int, l1: str, l2: str, slug: str, prompt: str, exact: float, unit: str,
                clue0: str, clue1: str, why: str, irt_b: float = 0.4,
                floor_val: float | None = None, ceil_val: float | None = None, step: float = 1,
                min_span: float = 12.0, bucket: str = "ref_cal") -> None:
        bounds = make_calibrator_bounds(exact, unit, slug, floor_val=floor_val, ceil_val=ceil_val, step=step, min_span=min_span)
        if not bounds:
            return
        lo, hi = bounds
        ans_str = f"{int(exact) if float(exact).is_integer() else exact} {unit}".strip()
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": l2,
            "microTopicId": slugify_topic("ref", slug),
            "regions": detect_regions(prompt, why),
            "narrativeTags": list(DOMAIN_DEFAULT_TAGS[dom]),
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "CALIBRATOR_DIAL",
            "prompt": prompt,
            "answerCorrect": ans_str,
            "clues": [clue0, clue1],
            "glyphHint": pick_glyph(dom, slug),
            "whyExplanation": why,
            "calibratorExt": {"exactVal": exact, "unit": unit, "minVal": lo, "maxVal": hi, "step": step},
        }
        if builder.try_add(rec, "Verified Reference Datasets", structured=True):
            counts[bucket] += 1

    def add_sight(dom: int, l1: str, l2: str, slug: str, prompt: str, ans: str,
                  dists: list[str], clue0: str, clue1: str, why: str, irt_b: float = 0.2,
                  tone: str = "PRESTIGE", bucket: str = "ref_sight") -> None:
        plaus = [0.84, 0.72, 0.58]
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": l2,
            "microTopicId": slugify_topic("ref", slug),
            "regions": detect_regions(prompt, ans, why),
            "narrativeTags": list(DOMAIN_DEFAULT_TAGS[dom]),
            "tone": tone,
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "SIGHTLINE_LOCK",
            "prompt": prompt,
            "answerCorrect": ans,
            "distractors": [{"text": d, "plausibility": plaus[i]} for i, d in enumerate(dists[:3])],
            "clues": [clue0, clue1],
            "glyphHint": pick_glyph(dom, slug),
            "whyExplanation": why,
        }
        if builder.try_add(rec, "Verified Reference Datasets", structured=True):
            counts[bucket] += 1

    def add_codex(dom: int, l1: str, l2: str, slug: str, prompt: str, ans_label: str,
                  pairs: list[tuple[str, str]], decoy: str, clue0: str, clue1: str, why: str,
                  irt_b: float = 0.4, bucket: str = "ref_codex") -> None:
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": l2,
            "microTopicId": slugify_topic("ref_cx", slug),
            "regions": detect_regions(prompt, why),
            "narrativeTags": list(DOMAIN_DEFAULT_TAGS[dom]),
            "tone": "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "CODEX_DUAL_RING",
            "prompt": prompt,
            "answerCorrect": ans_label,
            "clues": [clue0, clue1],
            "glyphHint": pick_glyph(dom, slug),
            "whyExplanation": why,
            "codexExt": {
                "pairs": [{"subject": s, "target": t} for s, t in pairs],
                "decoyTarget": decoy,
            },
        }
        if builder.try_add(rec, "Verified Reference Datasets", structured=True):
            counts[bucket] += 1

    def add_gauntlet(dom: int, l1: str, l2: str, slug: str, prompt: str, is_true: bool,
                     is_trick: bool, clue0: str, clue1: str, why: str, irt_b: float = 0.3,
                     bucket: str = "ref_gauntlet") -> None:
        ans = "CHALLENGE! (Myth)" if is_trick else ("TRUE" if is_true else "FALSE")
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "l2Subcategory": l2,
            "microTopicId": slugify_topic("ref_gt", slug),
            "regions": detect_regions(prompt, why),
            "narrativeTags": (["HIGH_STAKES_BLUFF", "LATERAL_DEDUCTION"] if is_trick else list(DOMAIN_DEFAULT_TAGS[dom])),
            "tone": "WITTY" if is_trick else "PRESTIGE",
            "irtB": irt_b,
            "irtA": 1.3,
            "freshness": "EVERGREEN",
            "archetype": "GAUNTLET_SHATTER",
            "prompt": prompt,
            "answerCorrect": ans,
            "clues": [clue0, clue1],
            "glyphHint": pick_glyph(dom, slug),
            "whyExplanation": why,
            "gauntletExt": {"isTrue": is_true, "isTrick": is_trick, "windowSec": 8},
        }
        if builder.try_add(rec, "Verified Reference Datasets", structured=True):
            counts[bucket] += 1

    # ------------------------------------------------------------------------
    # 8A. PURE COMPUTED MATHEMATICS & LOGIC (Domain 11 — 100% mathematically proven!)
    # ------------------------------------------------------------------------
    # Primes (nth prime)
    primes = [n for n in range(2, 600) if _is_prime(n)]
    for k in (10, 12, 15, 18, 20, 25, 30, 35, 40, 50):
        pk = primes[k - 1]
        add_cal(
            11, "Number Theory", "Prime Numbers", f"math_nth_prime_{k}",
            f"What is the {k}th prime number (counting 2 as the 1st prime)?",
            pk, "prime",
            f"Remember 1 is not prime; the first five primes are 2, 3, 5, 7, 11.",
            f"Prime density thins gently as numbers climb past {k * 2}.",
            f"Counting upward from 2 as the 1st prime, the {k}th prime number is exactly {pk}.",
            irt_b=round(-0.3 + k * 0.04, 2), floor_val=2, step=1, min_span=20, bucket="math_logic",
        )

    # Polygon interior angle sums
    poly_names = [
        (5, "pentagon"), (6, "hexagon"), (7, "heptagon"), (8, "octagon"),
        (9, "nonagon"), (10, "decagon"), (12, "dodecagon"), (15, "pentadecagon"), (20, "icosagon"),
    ]
    for sides, pname in poly_names:
        angle_sum = (sides - 2) * 180
        add_cal(
            11, "Euclidean Geometry", "Polygons", f"math_poly_{sides}",
            f"What is the sum of the interior angles of a simple {pname} ({sides} sides)?",
            angle_sum, "degrees",
            f"Triangulate the {pname} from a single vertex into (n - 2) triangles.",
            f"Each internal triangle contributes 180 degrees to the total.",
            f"By (n - 2) x 180°, a {sides}-sided {pname} has an interior angle sum of {angle_sum} degrees.",
            irt_b=round(-0.8 + sides * 0.12, 2), floor_val=180, step=10, min_span=180, bucket="math_logic",
        )

    # Fibonacci sequence terms
    fibs = [0, 1]
    while len(fibs) < 25:
        fibs.append(fibs[-1] + fibs[-2])
    for idx in (8, 9, 10, 11, 12, 13, 14, 15, 16):
        fval = fibs[idx]
        add_cal(
            11, "Discrete Mathematics", "Sequences", f"math_fib_{idx}",
            f"In the Fibonacci sequence starting 1, 1, 2, 3, 5..., what is the {idx}th term?",
            fval, "value",
            f"Each term equals the sum of the two immediately preceding terms.",
            f"Terms 6 and 7 are 8 and 13; continue summing forward.",
            f"Starting F(1)=1, F(2)=1, the {idx}th Fibonacci number is F({idx}) = {fval}.",
            irt_b=round(-0.4 + (idx - 8) * 0.25, 2), floor_val=1, step=1, min_span=16, bucket="math_logic",
        )

    # Powers of 2 (essential for Logic & Computing)
    for exp in (7, 8, 9, 10, 11, 12, 13, 14, 15, 16):
        val = 2 ** exp
        add_cal(
            11 if exp % 2 == 0 else 6,
            "Binary Mathematics" if exp % 2 == 0 else "Computer Architecture",
            "Powers of Two", f"math_pow2_{exp}",
            f"What exact integer value equals 2 raised to the power of {exp} (2^{exp})?",
            val, "value",
            f"Anchor on 2^10 = 1,024 and double or halve step by step.",
            f"Every increment in the exponent doubles the previous binary value.",
            f"2^{exp} equals exactly {val:,}, a core binary boundary in mathematics and computing.",
            irt_b=round(-0.7 + (exp - 7) * 0.22, 2), floor_val=16, step=1, min_span=max(20, val * 0.4), bucket="math_logic",
        )

    # Combinatorics nCr
    comb_cases = [(5, 2), (6, 2), (6, 3), (7, 2), (7, 3), (8, 2), (8, 3), (9, 2), (10, 2), (10, 3), (12, 2)]
    for n, r in comb_cases:
        cval = math.comb(n, r)
        add_cal(
            11, "Combinatorics", "Counting & Probability", f"math_comb_{n}_{r}",
            f"How many distinct {r}-member committees can be chosen from {n} people (C({n},{r}))?",
            cval, "ways",
            f"Order does not matter—divide permutations by {r}! ({math.factorial(r)}).",
            f"Apply the binomial formula n! / (r!(n-r)!).",
            f"C({n},{r}) = {n}! / ({r}! x {n-r}!) = {cval} distinct unordered combinations.",
            irt_b=round(0.2 + (n - 5) * 0.2, 2), floor_val=1, step=1, min_span=14, bucket="math_logic",
        )

    # Roman numerals Sightline Lock
    roman_cases = [
        (44, "XLIV"), (79, "LXXIX"), (94, "XCIV"), (149, "CXLIX"), (399, "CCCXCIX"),
        (444, "CDXLIV"), (689, "DCLXXXIX"), (842, "DCCCXLII"), (999, "CMXCIX"),
        (1492, "MCDXCII"), (1776, "MDCCLXXVI"), (1969, "MCMLXIX"), (1984, "MCMLXXXIV"),
        (2024, "MMXXIV"),
    ]
    for num, rom in roman_cases:
        dists = [_to_roman(num + off) for off in (-10, 10, 50) if num + off > 0 and _to_roman(num + off) != rom][:3]
        add_sight(
            11, "Numeral Systems", "Roman Numerals", f"math_roman_{num}",
            f"How is the Arabic integer {num} written in standard subtractive Roman numerals?",
            rom, dists,
            "Use I=1, V=5, X=10, L=50, C=100, D=500, M=1000 with subtractive pairs.",
            f"Break {num} down by decimal place values from left to right.",
            f"Converting each place value yields {num} = {rom} in standard Roman notation.",
            irt_b=round(-0.6 + (num / 2024.0) * 1.8, 2), bucket="math_logic",
        )

    # Hexadecimal conversions Sightline Lock
    hex_cases = [26, 42, 64, 99, 128, 160, 175, 200, 240, 255, 274, 512, 1024]
    for num in hex_cases:
        hx = f"0x{num:X}"
        dists = [f"0x{num + off:X}" for off in (-16, 16, 10) if num + off > 0]
        add_sight(
            11 if num % 2 == 0 else 6,
            "Numeral Systems", "Hexadecimal", f"math_hex_{num}",
            f"What is the hexadecimal (base-16) representation of the decimal number {num}?",
            hx, dists,
            "Hexadecimal digits run 0-9 then A=10 through F=15 in powers of 16.",
            f"Divide {num} by 16 to extract the higher hex digit and remainder.",
            f"In base 16, decimal {num} equals {hx}.",
            irt_b=round(0.3 + (num / 1024.0) * 1.4, 2), bucket="math_logic",
        )

    # Platonic solids & geometric Codex sets
    platonic_codex = [
        ("platonic_faces", "Match each Platonic solid to its exact number of flat faces.",
         [("Tetrahedron", "4 faces"), ("Octahedron", "8 faces"), ("Dodecahedron", "12 faces")], "20 faces",
         "Greek prefixes tell the count: tetra (4), octa (8), dodeca (12).",
         "The 20-face decoy belongs to the regular icosahedron.",
         "The five Platonic solids have 4 (tetra), 6 (cube), 8 (octa), 12 (dodeca), and 20 (icosa) faces."),
        ("platonic_verts", "Match each Platonic solid to its exact number of vertices.",
         [("Tetrahedron", "4 vertices"), ("Cube", "8 vertices"), ("Icosahedron", "12 vertices")], "20 vertices",
         "Apply Euler's formula V - E + F = 2 across the regular polyhedra.",
         "A dodecahedron owns the 20-vertex decoy count.",
         "Vertex counts: Tetrahedron (4), Cube (8), Octahedron (6), Icosahedron (12), Dodecahedron (20)."),
        ("logic_gates", "Align each fundamental Boolean logic gate with its output rule.",
         [("AND Gate", "1 only if all inputs 1"), ("XOR Gate", "1 if inputs differ"), ("NOR Gate", "1 only if all inputs 0")], "Always outputs 1",
         "XOR stands for exclusive OR; NOR is the logical negation of OR.",
         "Check which gate activates strictly when both inputs match zero.",
         "AND requires all true, XOR triggers on differing inputs, and NOR outputs true only when every input is false."),
        ("math_constants", "Match each famous mathematical constant to its rounded value.",
         [("Euler's Number (e)", "2.718"), ("Golden Ratio (phi)", "1.618"), ("Square Root of 2", "1.414")], "3.142",
         "Pi (~3.142) is the decoy; separate natural growth (e) from golden proportion.",
         "Pythagoras's constant sqrt(2) is the diagonal of a unit square.",
         "Approximate values: e ≈ 2.71828, golden ratio φ ≈ 1.61803, and √2 ≈ 1.41421."),
        ("fallacies_1", "Align each classic logical fallacy with its core reasoning flaw.",
         [("Ad Hominem", "Attacking the speaker"), ("Straw Man", "Distorting rival view"), ("Slippery Slope", "Unproven chain doom")], "Valid syllogism",
         "Latin 'ad hominem' literally translates to 'to the person'.",
         "A straw man substitutes an easy-to-knock-down caricature for the real claim.",
         "Ad hominem targets the person, straw man distorts the argument, and slippery slope asserts an unsupported cascade."),
        ("set_symbols", "Match each mathematical set-theory symbol to its meaning.",
         [("Union (U)", "In either set A or B"), ("Intersection", "In both A and B"), ("Empty Set", "Contains zero items")], "All real numbers",
         "Intersection narrows to overlap; union combines both collections.",
         "The null/empty set has cardinality zero.",
         "Set union merges elements from either set, intersection retains shared elements, and the empty set holds none."),
        ("probability_1", "Match each standard game event to its exact single-trial probability.",
         [("Fair Coin Heads", "1 in 2"), ("Die Roll = 6", "1 in 6"), ("Ace from 52 Cards", "1 in 13")], "1 in 52",
         "A standard deck has four aces across 52 cards (4/52 reduces cleanly).",
         "The 1-in-52 decoy applies only to a single named card like the Ace of Spades.",
         "Probabilities: fair coin = 1/2, single die face = 1/6, and any Ace from 52 cards = 4/52 = 1/13."),
        ("algo_complexity", "Match each classic algorithm to its average Big-O time complexity.",
         [("Binary Search", "O(log n)"), ("Merge Sort", "O(n log n)"), ("Bubble Sort", "O(n^2)")], "O(n!)",
         "Binary search halves the sorted array at every comparison step.",
         "Merge sort divides recursively and merges linearly in O(n log n).",
         "Binary search runs in O(log n), merge sort in O(n log n), and bubble sort averages quadratic O(n^2) time."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in platonic_codex:
        add_codex(11, "Logic & Mathematics", "Core Concepts", slug, prompt, "3/3 Logic Matches", pairs, decoy, c0, c1, why, 0.5, "math_logic")

    # Math/Logic Gauntlet Shatter (including classic tricks!)
    math_gauntlet = [
        ("gt_one_prime", "The number 1 is mathematically classified as the smallest prime number.", False, True,
         "Check the fundamental theorem of arithmetic on unique prime factorization.",
         "A prime must have exactly two distinct positive divisors.",
         "Classic math trap! 1 has only one divisor, so 2 is the smallest prime number (preserving unique prime factorization)."),
        ("gt_two_even_prime", "The number 2 is the only even prime number in all of mathematics.", True, False,
         "Consider what every even integer greater than 2 is divisible by.",
         "Any even integer above 2 has 2 as a proper factor.",
         "Verified: 2 is divisible only by 1 and 2, while every larger even integer is divisible by 2."),
        ("gt_zero_even", "Zero (0) is mathematically an even integer.", True, False,
         "An integer n is even whenever n = 2k for some integer k.",
         "Test whether 0 divided by 2 leaves an integer quotient with zero remainder.",
         "Verified: 0 = 2 x 0, satisfying the exact mathematical definition of an even integer."),
        ("gt_pi_rational", "Pi (π) can be expressed exactly as the ratio 22/7.", False, True,
         "Recall Johann Lambert's 1761 proof about the nature of π.",
         "Compare 22/7 (3.142857...) against π (3.141592...).",
         "Common misconception! 22/7 is only a handy approximation; π is irrational and cannot equal any fraction of integers."),
        ("gt_euler_poly", "For every convex polyhedron, Vertices minus Edges plus Faces equals 2.", True, False,
         "Test the formula on a cube: V=8, E=12, F=6.",
         "This topological invariant was proved by Swiss mathematician Leonhard Euler.",
         "Verified: Euler's polyhedron formula V - E + F = 2 holds for every convex polyhedron."),
        ("gt_triangle_non_euc", "On the surface of a sphere, a triangle's interior angles always sum to strictly more than 180 degrees.", True, False,
         "Imagine walking from the North Pole to the Equator, turning 90°, and returning.",
         "Spherical geometry has positive Gaussian curvature.",
         "Verified: Spherical triangles always exceed 180° (for instance, three 90° right angles sum to 270°)."),
        ("gt_91_prime", "The number 91 is a prime number.", False, True,
         "Test small prime factors 3, 5, and 7 against 91.",
         "Notice 91 = 70 + 21.",
         "Classic number trap! 91 is composite because 7 x 13 = 91."),
        ("gt_57_prime", "The number 57 is a prime number.", False, True,
         "Use the digit-sum divisibility rule for 3.",
         "Add the digits 5 + 7 to check divisibility.",
         "Famous 'Grothendieck prime' trap! 5 + 7 = 12, so 57 is divisible by 3 (3 x 19 = 57)."),
        ("gt_monty_hall", "In the standard Monty Hall problem, switching doors raises your winning probability from 1/3 to 2/3.", True, False,
         "Track where the 2/3 probability of picking a goat initially concentrates.",
         "The host deliberately reveals a goat behind an unchosen door.",
         "Verified: Your initial pick wins 1/3 of the time; switching captures the entire 2/3 chance that your first pick was wrong."),
        ("gt_birthday_23", "In a group of just 23 random people, the probability that at least two share a birthday exceeds 50%.", True, False,
         "Count how many distinct pairs exist among 23 people: C(23,2) = 253.",
         "Compute 1 minus the chance that all 23 birthdays are distinct.",
         "Verified: With 253 distinct pairs, the birthday-match probability reaches about 50.7% at n = 23."),
        ("gt_0999_eq_1", "In real analysis, the repeating decimal 0.999... is strictly equal to 1.", True, False,
         "Compare 1/3 = 0.333... multiplied by 3.",
         "There is no real number sitting strictly between 0.999... and 1.",
         "Verified: In the real number system, the infinite geometric series sum of 9/10^k equals exactly 1."),
        ("gt_halting", "Alan Turing proved no general algorithm can decide whether every arbitrary program halts.", True, False,
         "Think of Turing's 1936 diagonalization proof in computability theory.",
         "Self-referential paradoxes prevent a universal halting decider.",
         "Verified: Turing's 1936 paper proved the Halting Problem is undecidable for arbitrary Turing machines."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in math_gauntlet:
        add_gauntlet(11, "Logic & Mathematics", "Mathematical Proofs", slug, prompt, is_t, is_tr, c0, c1, why, 0.5, "math_logic")

    # ------------------------------------------------------------------------
    # 8B. COMPUTING, PROTOCOLS & ENGINEERING (Domain 6: Tech)
    # ------------------------------------------------------------------------
    # Standard TCP/UDP IANA Ports (CALIBRATOR_DIAL + SIGHTLINE_LOCK)
    iana_ports = [
        ("FTP Control", 21, "File Transfer Protocol command channel"),
        ("SSH", 22, "Secure Shell encrypted remote login"),
        ("Telnet", 23, "Unencrypted remote terminal protocol"),
        ("SMTP", 25, "Simple Mail Transfer Protocol for outgoing email"),
        ("DNS", 53, "Domain Name System address resolution"),
        ("HTTP", 80, "Hypertext Transfer Protocol for unencrypted web traffic"),
        ("POP3", 110, "Post Office Protocol v3 for retrieving email"),
        ("NTP", 123, "Network Time Protocol for clock synchronization"),
        ("IMAP", 143, "Internet Message Access Protocol for synced email"),
        ("BGP", 179, "Border Gateway Protocol routing the global internet"),
        ("HTTPS", 443, "HTTP encrypted over TLS/SSL"),
        ("RDP", 3389, "Remote Desktop Protocol"),
    ]
    all_port_nums = [str(p[1]) for p in iana_ports]
    for proto, port, desc in iana_ports:
        dists = [x for x in all_port_nums if x != str(port)]
        rng.shuffle(dists)
        add_sight(
            6, "Network Engineering", "Internet Protocols", f"tech_port_{proto.lower()}",
            f"What is the standard default TCP/UDP port number assigned to {proto}?",
            str(port), dists[:3],
            f"This protocol handles {desc.lower()}.",
            f"It belongs to the official IANA standard port registry.",
            f"IANA assigns port {port} as the standard default for {proto} ({desc}).",
            irt_b=0.2 if port in (22, 53, 80, 443) else 1.2, bucket="tech_ref",
        )

    # Programming Language Release Years (CALIBRATOR_DIAL)
    lang_years = [
        ("Fortran", 1957, "John Backus at IBM"),
        ("Lisp", 1958, "John McCarthy at MIT"),
        ("COBOL", 1959, "Grace Hopper and CODASYL"),
        ("BASIC", 1964, "Kemeny and Kurtz at Dartmouth"),
        ("C", 1972, "Dennis Ritchie at Bell Labs"),
        ("SQL", 1974, "Chamberlin and Boyce at IBM"),
        ("C++", 1985, "Bjarne Stroustrup at Bell Labs"),
        ("Perl", 1987, "Larry Wall"),
        ("Python", 1991, "Guido van Rossum"),
        ("Java", 1995, "James Gosling at Sun Microsystems"),
        ("JavaScript", 1995, "Brendan Eich at Netscape"),
        ("Ruby", 1995, "Yukihiro Matsumoto"),
        ("C#", 2000, "Anders Hejlsberg at Microsoft"),
        ("Go", 2009, "Griesemer, Pike, and Thompson at Google"),
        ("Rust", 2010, "Graydon Hoare at Mozilla"),
        ("TypeScript", 2012, "Microsoft"),
        ("Swift", 2014, "Apple"),
    ]
    for lang, yr, creator in lang_years:
        if yr <= 2006:
            add_cal(
                6, "Software Engineering", "Programming Languages", f"tech_lang_yr_{lang.lower()}",
                f"In what year did the programming language {lang} make its first public release?",
                yr, "CE",
                f"Originally designed by {creator}.",
                f"Place its debut within the {(yr // 10) * 10}s computing era.",
                f"{lang}, created by {creator}, first appeared publicly in {yr}.",
                irt_b=0.6, floor_val=1950, ceil_val=2025, step=1, min_span=25, bucket="tech_ref",
            )

    # Tech Creators & Computing Codex sets
    tech_codex = [
        ("tech_lang_creators_1", "Match each programming language to its primary original creator.",
         [("Python", "Guido van Rossum"), ("C Language", "Dennis Ritchie"), ("C++", "Bjarne Stroustrup")], "Linus Torvalds",
         "C and C++ both emerged from Bell Labs; Python began in the Netherlands.",
         "Linus Torvalds created the Linux kernel and Git, not one of these languages.",
         "Guido van Rossum created Python, Dennis Ritchie created C, and Bjarne Stroustrup designed C++."),
        ("tech_lang_creators_2", "Match each modern programming language to its creator or origin.",
         [("JavaScript", "Brendan Eich"), ("Ruby", "Yukihiro Matsumoto"), ("Java", "James Gosling")], "Tim Berners-Lee",
         "All three languages debuted in 1995; Ruby originated in Japan.",
         "Tim Berners-Lee invented the World Wide Web, making him the decoy.",
         "Brendan Eich built JavaScript in 10 days, Yukihiro Matsumoto created Ruby, and James Gosling led Java."),
        ("tech_os_creators", "Align each foundational computing system with its principal creator.",
         [("Linux Kernel", "Linus Torvalds"), ("World Wide Web", "Tim Berners-Lee"), ("TeX Typesetting", "Donald Knuth")], "Alan Turing",
         "TeX was authored by Stanford's pioneer of 'The Art of Computer Programming'.",
         "Alan Turing laid theoretical foundations decades earlier and is the decoy.",
         "Linus Torvalds released Linux in 1991, Tim Berners-Lee invented the Web in 1989, and Donald Knuth wrote TeX."),
        ("tech_ports_codex", "Match each core Internet protocol to its default standard port.",
         [("HTTP", "Port 80"), ("HTTPS", "Port 443"), ("SSH", "Port 22")], "Port 53",
         "Secure Shell uses a low two-digit port; encrypted web traffic uses 443.",
         "Port 53 is the decoy—it belongs to the Domain Name System (DNS).",
         "Standard IANA ports: HTTP = 80, HTTPS = 443, SSH = 22 (while DNS uses port 53)."),
        ("tech_crypto_codex", "Match each cryptographic standard to its primary category.",
         [("AES-256", "Symmetric Cipher"), ("SHA-256", "Cryptographic Hash"), ("RSA", "Public-Key Crypto")], "Lossy Compression",
         "SHA produces a fixed-length one-way digest; AES shares one secret key.",
         "Lossy compression (like JPEG) is not a cryptographic primitive.",
         "AES-256 is a symmetric block cipher, SHA-256 is a one-way hash, and RSA is asymmetric public-key cryptography."),
        ("tech_units_codex", "Align each digital information unit with its exact bit or byte value.",
         [("Nibble", "4 bits"), ("Byte", "8 bits"), ("Kibibyte (KiB)", "1,024 bytes")], "1,000 bits",
         "A nibble is literally half a standard byte (one hexadecimal digit).",
         "Binary IEC prefixes use powers of 2 (2^10 = 1,024).",
         "A nibble equals 4 bits, a byte equals 8 bits, and one kibibyte (KiB) equals 1,024 bytes."),
        ("tech_http_codes", "Match each HTTP status code to its standard browser meaning.",
         [("200 OK", "Request succeeded"), ("404 Not Found", "Resource missing"), ("503 Unavailable", "Server overloaded")], "Redirect moved",
         "2xx signals success, 4xx signals client error, and 5xx signals server error.",
         "Redirects belong to the 3xx series (such as 301 or 302).",
         "HTTP status classes: 200 confirms success, 404 reports a missing resource, and 503 indicates temporary server unavailability."),
        ("tech_osi_codex", "Match each network protocol to its primary function on the Internet.",
         [("DNS", "Resolves domain names"), ("DHCP", "Assigns IP addresses"), ("TLS", "Encrypts connections")], "Renders 3D shaders",
         "DNS acts as the Internet's phonebook; TLS secures HTTPS links.",
         "3D shader rendering occurs on a GPU, not in network protocols.",
         "DNS translates hostnames to IPs, DHCP dynamically assigns IP configurations, and TLS encrypts network traffic."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in tech_codex:
        add_codex(6, "Computing & Engineering", "Systems Architecture", slug, prompt, "3/3 Tech Systems", pairs, decoy, c0, c1, why, 0.45, "tech_ref")

    # Tech Gauntlet Shatter
    tech_gauntlet = [
        ("tech_gt_java_js", "JavaScript was created as a lightweight simplified subset of the Java programming language.", False, True,
         "Examine the actual 1995 history of Netscape and Sun Microsystems.",
         "Consider whether their runtime architectures share the same ancestry.",
         "Classic tech myth! JavaScript was designed by Brendan Eich in 1995 with Scheme/Self roots and named for marketing alignment with Java."),
        ("tech_gt_www_net", "The World Wide Web and the Internet are the exact same technology invented in 1989.", False, True,
         "Compare ARPANET/TCP-IP from the 1960s–1980s with CERN's 1989 hypertext system.",
         "One is the global packet network; the other is an application layer built atop it.",
         "Common confusion! The Internet (ARPANET/TCP-IP) predates Tim Berners-Lee's 1989 World Wide Web by two decades."),
        ("tech_gt_transistor", "The first working point-contact transistor was demonstrated at Bell Labs in 1947.", True, False,
         "John Bardeen, Walter Brattain, and William Shockley shared the 1956 Nobel Prize.",
         "Think of the post-WWII solid-state revolution replacing vacuum tubes.",
         "Verified: Bardeen and Brattain built the first working transistor at Bell Labs in December 1947."),
        ("tech_gt_utf8_ascii", "Every valid 7-bit ASCII text file is automatically also valid UTF-8.", True, False,
         "Ken Thompson and Rob Pike deliberately designed UTF-8 for backward compatibility.",
         "Bytes 0x00 through 0x7F encode identically in both standards.",
         "Verified: UTF-8 is strictly backward-compatible with 7-bit ASCII for all code points 0–127."),
        ("tech_gt_ipv4_bits", "An IPv4 network address consists of 32 bits, yielding roughly 4.3 billion addresses.", True, False,
         "Four decimal octets (0–255) separated by dots form an IPv4 address.",
         "Compute 4 octets x 8 bits per octet.",
         "Verified: IPv4 uses 32-bit addresses (2^32 = 4,294,967,296), whereas IPv6 expands to 128 bits."),
        ("tech_gt_git_github", "Git and GitHub were created at the same time by the same company.", False, False,
         "Recall who authored the Git version-control system in 2005 for Linux.",
         "GitHub launched as a web hosting platform three years later in 2008.",
         "False: Linus Torvalds created Git in 2005 for Linux kernel development; GitHub launched independently in 2008."),
        ("tech_gt_ssd_platter", "A solid-state drive (SSD) stores data using spinning magnetized aluminum platters.", False, False,
         "Contrast NAND flash memory semiconductors with traditional HDDs.",
         "Check what 'solid-state' means in electronics engineering.",
         "False: SSDs use non-volatile NAND flash memory with no moving mechanical parts; spinning platters belong to HDDs."),
        ("tech_gt_moore", "Gordon Moore originally observed that transistor counts on dense integrated circuits roughly double every two years.", True, False,
         "Intel co-founder Gordon Moore updated his 1965 projection in 1975.",
         "This empirical scaling trend guided semiconductor roadmaps for decades.",
         "Verified: Moore's Law tracks the roughly biennial doubling of transistors on integrated circuits."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in tech_gauntlet:
        add_gauntlet(6, "Computing & Engineering", "Tech Verification", slug, prompt, is_t, is_tr, c0, c1, why, 0.35, "tech_ref")

    # ------------------------------------------------------------------------
    # 8C. NASA SOLAR SYSTEM, SPACEFLIGHT & SI UNITS (Domain 1: Science)
    # ------------------------------------------------------------------------
    si_units = [
        ("Newton", "Force", "N"), ("Joule", "Energy & Work", "J"), ("Watt", "Power", "W"),
        ("Pascal", "Pressure", "Pa"), ("Hertz", "Frequency", "Hz"), ("Volt", "Electric Potential", "V"),
        ("Ohm", "Electrical Resistance", "Ω"), ("Coulomb", "Electric Charge", "C"),
        ("Tesla", "Magnetic Flux Density", "T"), ("Farad", "Capacitance", "F"),
        ("Henry", "Inductance", "H"), ("Weber", "Magnetic Flux", "Wb"),
        ("Becquerel", "Radioactive Activity", "Bq"), ("Sievert", "Radiation Dose", "Sv"),
        ("Lumen", "Luminous Flux", "lm"), ("Lux", "Illuminance", "lx"),
    ]
    all_si_names = [u[0] for u in si_units]
    for uname, qty, sym in si_units:
        dists = [x for x in all_si_names if x != uname]
        rng.shuffle(dists)
        add_sight(
            1, "Physics", "SI Measurement Units", f"sci_si_{uname.lower()}",
            f"Which SI derived unit measures {qty.lower()}?",
            uname, dists[:3],
            f"Its official international SI symbol is '{sym}'.",
            "Named in honor of a pioneering physicist or scientist.",
            f"The {uname} (symbol {sym}) is the official SI derived unit of {qty.lower()}.",
            irt_b=-0.5 if uname in ("Newton", "Joule", "Watt", "Hertz", "Volt", "Ohm") else 0.9,
            bucket="science_ref",
        )

    for i in range(0, len(si_units) - 3, 4):
        grp = si_units[i : i + 4]
        pairs = [(g[1], g[0]) for g in grp[:3]]
        decoy = grp[3][0]
        add_codex(
            1, "Physics", "SI Units", f"sci_codex_si_{i}",
            f"Align each physical quantity with its official SI derived unit.",
            "3/3 SI Units", pairs, decoy,
            f"Symbols in play: {grp[0][2]}, {grp[1][2]}, and {grp[2][2]}.",
            f"The decoy unit ({decoy}) actually measures {grp[3][1].lower()}.",
            f"SI matches: {grp[0][1]} -> {grp[0][0]}, {grp[1][1]} -> {grp[1][0]}, {grp[2][1]} -> {grp[2][0]}.",
            0.4, "science_ref",
        )

    space_milestones = [
        ("Sputnik 1, the first artificial Earth satellite, launched", 1957, "Soviet Union"),
        ("Yuri Gagarin completed the first human orbital spaceflight aboard Vostok 1", 1961, "Soviet Union"),
        ("Apollo 11 landed the first humans on the Moon", 1969, "NASA"),
        ("Voyager 1 launched on its grand tour toward interstellar space", 1977, "NASA"),
        ("The Hubble Space Telescope was deployed into low Earth orbit", 1990, "NASA/ESA"),
        ("The first module of the International Space Station (Zarya) launched", 1998, "Roscosmos/NASA"),
        ("The Cassini spacecraft entered orbit around Saturn", 2004, "NASA/ESA/ASI"),
        ("NASA's Curiosity rover touched down inside Gale Crater on Mars", 2012, "NASA"),
        ("New Horizons made the first close flyby of Pluto", 2015, "NASA"),
        ("The James Webb Space Telescope launched to the Sun-Earth L2 point", 2021, "NASA/ESA/CSA"),
    ]
    for desc, yr, agency in space_milestones:
        if yr <= 2016:
            add_cal(
                6 if yr >= 1990 else 1, "Space Exploration", "Orbital Milestones", f"space_yr_{yr}",
                f"In what year was the milestone achieved: {desc}?",
                yr, "CE",
                f"Operated by {agency} during the {(yr // 10) * 10}s space era.",
                f"Calibrate the exact launch or arrival year.",
                f"In {yr}, {desc} ({agency}).",
                irt_b=0.25, floor_val=1950, ceil_val=2025, step=1, min_span=20, bucket="science_ref",
            )

    # NASA Planetary Facts (CALIBRATOR_DIAL + CODEX + GAUNTLET)
    planet_days = [
        ("Mercury", 88, "Earth days", "closest planet to the Sun"),
        ("Venus", 225, "Earth days", "second planet from the Sun"),
        ("Mars", 687, "Earth days", "fourth planet from the Sun"),
        ("Jupiter", 12, "Earth years", "largest gas giant"),
        ("Saturn", 29, "Earth years", "ringed gas giant"),
        ("Uranus", 84, "Earth years", "tilted ice giant"),
        ("Neptune", 165, "Earth years", "outermost major planet"),
    ]
    for pname, orb, unit, desc in planet_days:
        add_cal(
            1, "Astronomy", "Planetary Orbits", f"planet_orb_{pname.lower()}",
            f"Approximately how many {unit} does {pname} take to complete one orbit of the Sun?",
            orb, unit,
            f"{pname} is the {desc}; Kepler's third law links distance to orbital period.",
            f"Compare its orbit against Earth's 365-day / 1-year period.",
            f"According to NASA planetary data, {pname}'s sidereal orbital period is about {orb} {unit}.",
            irt_b=0.5, floor_val=2, step=1, min_span=max(12, orb * 0.5), bucket="science_ref",
        )

    science_gauntlet = [
        ("sci_gt_venus_day", "A sidereal day (one rotation on its axis) on Venus is longer than a Venusian year.", True, False,
         "Compare Venus's ultra-slow 243-Earth-day retrograde spin with its 225-day orbit.",
         "Venus rotates backwards and far more slowly than any other planet.",
         "Verified: Venus takes ~243 Earth days to rotate once on its axis, exceeding its ~225-Earth-day orbit around the Sun."),
        ("sci_gt_sound_space", "Sound waves travel faster through the vacuum of outer space than through air.", False, True,
         "Remember whether acoustic waves are mechanical vibrations or electromagnetic waves.",
         "Check what physical medium sound requires to propagate.",
         "Physics trap! Sound is a mechanical pressure wave requiring a medium; it cannot travel through the vacuum of space at all."),
        ("sci_gt_glass_liquid", "Old medieval cathedral windows are thicker at the bottom because glass flows like a slow liquid at room temperature.", False, True,
         "Distinguish an amorphous solid from an actual flowing fluid over centuries.",
         "Consider how medieval crown glass panes were originally spun and installed.",
         "Classic physics myth! Room-temperature glass is an amorphous solid that does not flow; glaziers installed uneven panes thick-edge down."),
        ("sci_gt_diamond_coal", "Most natural Earth diamonds form from compressed ancient coal deposits.", False, True,
         "Check when Earth's oldest diamonds formed versus when land plants first evolved.",
         "Diamonds crystallize in the upper mantle 140–190 km deep from primordial carbon.",
         "Geology myth! Most natural diamonds formed 1–3 billion years ago deep in the mantle—long before coal-forming land plants existed."),
        ("sci_gt_mercury_hot", "Mercury is the hottest planet in our Solar System because it is closest to the Sun.", False, True,
         "Compare an airless rocky world against a neighbor wrapped in thick CO2 clouds.",
         "Runaway greenhouse warming dramatically outpaces raw solar proximity.",
         "Classic astronomy trap! Venus averages ~464 °C due to its crushing CO2 greenhouse atmosphere, hotter than Mercury."),
        ("sci_gt_water_boil_alt", "Water boils at a lower temperature atop Mount Everest than at sea level.", True, False,
         "Boiling occurs when liquid vapor pressure equals surrounding atmospheric pressure.",
         "Air pressure drops sharply at high altitude.",
         "Verified: Lower atmospheric pressure at Everest's summit lowers water's boiling point to roughly 68–70 °C."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in science_gauntlet:
        add_gauntlet(1, "Science", "Physics & Astronomy", slug, prompt, is_t, is_tr, c0, c1, why, 0.35, "science_ref")

    # ------------------------------------------------------------------------
    # 8D. WORLD MYTHOLOGY & PHILOSOPHY (Domain 10: Myth)
    # ------------------------------------------------------------------------
    greek_roman = [
        ("Zeus", "Jupiter", "sky and thunder"),
        ("Hera", "Juno", "marriage and queenship"),
        ("Poseidon", "Neptune", "seas and earthquakes"),
        ("Athena", "Minerva", "wisdom and strategy"),
        ("Ares", "Mars", "war and bloodshed"),
        ("Aphrodite", "Venus", "love and beauty"),
        ("Artemis", "Diana", "the hunt and moon"),
        ("Hermes", "Mercury", "messengers and commerce"),
        ("Hephaestus", "Vulcan", "fire and metalworking"),
        ("Demeter", "Ceres", "harvest and agriculture"),
        ("Dionysus", "Bacchus", "wine and festivity"),
        ("Hades", "Pluto", "the underworld"),
        ("Hestia", "Vesta", "the hearth and home"),
        ("Cronus", "Saturn", "time and agriculture"),
        ("Eros", "Cupid", "desire and affection"),
        ("Nike", "Victoria", "winged victory"),
    ]
    all_roman = [x[1] for x in greek_roman]
    for gr, rm, dom_desc in greek_roman:
        dists = [x for x in all_roman if x != rm]
        rng.shuffle(dists)
        add_sight(
            10, "Classical Mythology", "Greco-Roman Pantheon", f"myth_gr_rm_{gr.lower()}",
            f"Who is the Roman mythological counterpart to the Greek deity {gr}?",
            rm, dists[:3],
            f"Both traditions associated this deity with {dom_desc}.",
            f"The Roman name begins with the letter '{rm[0]}'.",
            f"In classical syncretism, Roman {rm} corresponds directly to Greek {gr}, deity of {dom_desc}.",
            irt_b=-0.7 if gr in ("Zeus", "Poseidon", "Aphrodite", "Ares", "Athena", "Hades") else 0.4,
            bucket="myth_ref",
        )

    for i in range(0, len(greek_roman) - 3, 4):
        grp = greek_roman[i : i + 4]
        pairs = [(g[0], g[1]) for g in grp[:3]]
        decoy = grp[3][1]
        add_codex(
            10, "Classical Mythology", "Pantheon Equivalence", f"myth_codex_gr_{i}",
            f"Align each Greek deity ({grp[0][0]}, {grp[1][0]}, {grp[2][0]}) with their Roman name.",
            "3/3 Classical Deities", pairs, decoy,
            f"Domain cues: {grp[0][0]} governs {grp[0][2]}.",
            f"The decoy name {decoy} corresponds instead to Greek {grp[3][0]}.",
            f"Counterparts: {grp[0][0]} -> {grp[0][1]}, {grp[1][0]} -> {grp[1][1]}, {grp[2][0]} -> {grp[2][1]}.",
            0.25, "myth_ref",
        )

    world_myth_codex = [
        ("myth_norse_1", "Match each Norse deity to their mythic domain or attribute.",
         [("Odin", "Wisdom & Runes"), ("Thor", "Thunder & Mjölnir"), ("Freyja", "Love & Seiðr")], "Underworld Rivers",
         "Odin sacrificed an eye at Mímir's well; Thor wields the hammer Mjölnir.",
         "Underworld rivers belong to Greek Hades (Styx/Lethe), not the Aesir/Vanir.",
         "In Norse myth, Odin governs wisdom and runes, Thor commands thunder, and Freyja presides over love and seiðr."),
        ("myth_norse_2", "Align each iconic figure or place of Norse cosmology with its role.",
         [("Yggdrasil", "World Ash Tree"), ("Bifröst", "Rainbow Bridge"), ("Fenrir", "Monstrous Wolf")], "Golden Fleece",
         "Bifröst links Midgard to Asgard; Yggdrasil binds the Nine Worlds.",
         "The Golden Fleece comes from the Greek Argonautica.",
         "Yggdrasil is the cosmic ash tree, Bifröst is the burning rainbow bridge, and Fenrir is Loki's giant wolf."),
        ("myth_egypt_1", "Match each ancient Egyptian deity to their traditional sphere.",
         [("Anubis", "Embalming & Tombs"), ("Thoth", "Writing & Wisdom"), ("Ra", "Sun & Creation")], "Thunderbolt Forge",
         "Anubis carries a jackal head; Thoth is depicted as an ibis or baboon.",
         "The thunderbolt forge is Greek (Cyclopes/Hephaestus).",
         "Anubis guarded embalming and the dead, Thoth patronized scribes and wisdom, and Ra embodied the sun."),
        ("myth_egypt_2", "Align each Egyptian deity with their iconic mythic identity.",
         [("Osiris", "Lord of Underworld"), ("Isis", "Magic & Healing"), ("Ma'at", "Truth & Cosmic Order")], "Norse Hearth",
         "A deceased soul's heart was weighed against the ostrich feather of Ma'at.",
         "Isis restored Osiris and protected pharaohs through arcane knowledge.",
         "Osiris ruled the Duat underworld, Isis mastered magic and healing, and Ma'at personified truth and cosmic balance."),
        ("myth_japan_1", "Match each major Shinto kami in Japanese mythology to their domain.",
         [("Amaterasu", "Sun Goddess"), ("Susanoo", "Storms & Sea"), ("Tsukuyomi", "Moon Deity")], "Mount Olympus",
         "These three 'noble children' emerged from Izanagi's purification rites.",
         "Mount Olympus belongs to classical Greek mythology.",
         "In the Kojiki, Amaterasu governs the sun, Susanoo rules storms and seas, and Tsukuyomi presides over the moon."),
        ("myth_phil_1", "Match each classical Greek philosopher to their renowned school or method.",
         [("Plato", "The Academy"), ("Aristotle", "The Lyceum"), ("Zeno of Citium", "Stoicism")], "Pragmatism",
         "Zeno taught beneath the Painted Porch (Stoa Poikile) in Athens.",
         "Pragmatism arose in 19th-century America and serves as the decoy.",
         "Plato founded the Academy, Aristotle established the Lyceum, and Zeno of Citium founded Stoicism."),
        ("myth_phil_2", "Align each major philosopher with their landmark treatise.",
         [("Immanuel Kant", "Critique of Pure Reason"), ("Niccolò Machiavelli", "The Prince"), ("Thomas Hobbes", "Leviathan")], "The Republic",
         "Hobbes described life without a social contract as 'nasty, brutish, and short'.",
         "The Republic was written by Plato in antiquity.",
         "Kant authored Critique of Pure Reason, Machiavelli wrote The Prince, and Hobbes published Leviathan."),
        ("myth_phil_3", "Match each Eastern philosophical thinker to their foundational tradition.",
         [("Confucius", "Confucianism"), ("Laozi", "Daoism"), ("Siddhartha Gautama", "Buddhism")], "Epicureanism",
         "Laozi is traditionally credited with the Daodejing ('Classic of the Way').",
         "Epicureanism is a Hellenistic Greek school.",
         "Confucius shaped Confucian ethics, Laozi is linked to Daoism, and Siddhartha Gautama founded Buddhism."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in world_myth_codex:
        add_codex(10, "Mythology & Philosophy", "Global Traditions", slug, prompt, "3/3 Myth & Philosophy", pairs, decoy, c0, c1, why, 0.4, "myth_ref")

    myth_gauntlet = [
        ("myth_gt_pandora_box", "In Hesiod's original Greek myth, Pandora opened a sealed ceramic jar (pithos), not a wooden box.", True, False,
         "Renaissance translator Erasmus rendered Greek 'pithos' into Latin 'pyxis' (box).",
         "Ancient Greeks stored grain and oils in large earthenware jars.",
         "Verified: Hesiod wrote of a 'pithos' (large jar); 'Pandora's box' arose from a 16th-century translation slip by Erasmus."),
        ("myth_gt_prometheus_eagle", "In Greek mythology, Prometheus was punished by Zeus for stealing fire for humanity.", True, False,
         "Recall the Titan chained to a Caucasus peak visited daily by an eagle.",
         "His name translates roughly to 'forethought'.",
         "Verified: Zeus bound Prometheus to a rock in the Caucasus for defying Olympus and gifting fire to mortals."),
        ("myth_gt_medusa_serpent", "In Greek mythology, Perseus slew the Gorgon Medusa while looking at her reflection in a polished shield.", True, False,
         "Athena lent Perseus a bronze mirror-shield to avoid Medusa's petrifying gaze.",
         "Directly meeting Medusa's eyes turned onlookers to stone.",
         "Verified: Perseus used Athena's reflective shield to guide his blade safely without looking directly at Medusa."),
        ("myth_gt_cerberus_norse", "Cerberus, the multi-headed guard dog of the underworld, originates in Norse mythology.", False, False,
         "Distinguish the hound of Hades from the Norse underworld hound Garmr.",
         "Heracles captured this hound as his twelfth and final Labor.",
         "False: Cerberus belongs to Greek mythology (guarding Hades); Norse mythology features Garmr at the gates of Hel."),
        ("myth_gt_socrates_books", "Socrates left behind over twenty surviving philosophical treatises written in his own hand.", False, True,
         "Recall how we know Socrates's dialogues today.",
         "Plato and Xenophon recorded his spoken inquiries in Athens.",
         "Philosophy trap! Socrates famously wrote nothing down; his ideas survive through Plato, Xenophon, and Aristophanes."),
        ("myth_gt_achilles_homer", "The story of Achilles's mother dipping him into the River Styx appears explicitly in Homer's Iliad.", False, True,
         "Check whether the invulnerable-heel legend comes from Homer or much later Roman poetry.",
         "Statius's 1st-century CE Achilleid popularized the River Styx dip.",
         "Literary trap! Homer's Iliad never mentions the River Styx heel legend—it first survives in Statius's Roman epic centuries later."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in myth_gauntlet:
        add_gauntlet(10, "Mythology & Philosophy", "Classical Verification", slug, prompt, is_t, is_tr, c0, c1, why, 0.45, "myth_ref")

    # ------------------------------------------------------------------------
    # 8E. WORLD HISTORY TIMELINES & MYTHS (Domain 0: History)
    # ------------------------------------------------------------------------
    hist_years = [
        ("the Magna Carta was sealed at Runnymede in England", 1215),
        ("Johannes Gutenberg completed his movable-type Bible in Mainz", 1455),
        ("Constantinople fell to Ottoman Sultan Mehmed II", 1453),
        ("the Peace of Westphalia ended the Thirty Years' War", 1648),
        ("the French Revolution began with the storming of the Bastille", 1789),
        ("the Congress of Vienna redrew Europe after Napoleon's defeat", 1815),
        ("the Suez Canal officially opened to international shipping", 1869),
        ("the Panama Canal officially opened between the Atlantic and Pacific", 1914),
        ("the Treaty of Versailles was signed following World War I", 1919),
        ("the United Nations Charter entered into force", 1945),
        ("the Treaty of Rome established the European Economic Community", 1957),
        ("the Berlin Wall fell, heralding German reunification", 1989),
    ]
    for desc, yr in hist_years:
        add_cal(
            0, "World History", "Milestone Chronology", f"hist_yr_{yr}_{desc[:14]}",
            f"In what year CE did this historic turning point occur: {desc}?",
            yr, "CE",
            f"Anchor this event inside the {((yr - 1) // 100) + 1}th century.",
            f"Zero in on the exact decade of the {(yr // 10) * 10}s.",
            f"Historically documented in {yr} CE, {desc}.",
            irt_b=0.2 if yr >= 1789 else 0.9, floor_val=1000, ceil_val=2025, step=1, min_span=30, bucket="hist_ref",
        )

    hist_gauntlet = [
        ("hist_gt_napoleon_short", "Napoleon Bonaparte was unusually short for a Frenchman of his era, standing roughly 5 feet 2 inches in modern feet.", False, True,
         "Compare old French 'pieds' (inches) against British imperial inches.",
         "At 5'2\" in pre-metric French units, he stood about 5'6\"–5'7\" in modern height.",
         "Classic history myth! Confusion between French and English inches made Napoleon sound tiny; he was actually average height (~1.69 m)."),
        ("hist_gt_viking_horns", "Historical Viking warriors routinely wore horned metal helmets into battle.", False, True,
         "Check archaeological finds from Scandinavia versus 19th-century opera costumes.",
         "Carl Emil Doepler designed horned helmets for Wagner's 1876 Ring cycle.",
         "History myth! No Viking battle helmet found by archaeologists had horns; the image came from 19th-century romantic art and opera."),
        ("hist_gt_cleopatra_pyramids", "Cleopatra VII lived closer in time to the 1969 Moon landing than to the building of the Great Pyramid of Giza.", True, False,
         "Great Pyramid: ~2560 BCE. Cleopatra VII: 69–30 BCE. Apollo 11: 1969 CE.",
         "Compare roughly 2,500 years before Cleopatra against ~2,000 years after her.",
         "Verified: ~2,500 years separated Giza's Great Pyramid from Cleopatra, while Apollo 11 occurred just under 2,000 years after her."),
        ("hist_gt_oxford_aztec", "Teaching began at the University of Oxford centuries before the founding of the Aztec capital Tenochtitlan.", True, False,
         "Oxford instruction dates to ~1096 CE; Tenochtitlan was founded in 1325 CE.",
         "Compare late 11th-century England with 14th-century Mesoamerica.",
         "Verified: Teaching at Oxford is documented by 1096 CE, more than two centuries before Tenochtitlan's founding in 1325 CE."),
        ("hist_gt_great_wall_moon", "The Great Wall of China is clearly visible to the naked human eye from the surface of the Moon.", False, True,
         "Estimate the angular width of a 6-meter-wide wall viewed from 384,400 km away.",
         "Astronauts including Yang Liwei confirmed it cannot be seen unaided from orbit.",
         "Classic myth! At ~6 meters wide, seeing the Great Wall from the Moon would be like spotting a human hair from miles away."),
        ("hist_gt_einstein_math", "Albert Einstein failed elementary school mathematics as a child.", False, True,
         "Check how Switzerland reversed its 1-to-6 school grading scale in 1896.",
         "Einstein mastered differential and integral calculus before turning 15.",
         "Famous myth! Einstein excelled in math; a German-vs-Swiss grading scale reversal (where 6 became the top mark) sparked the legend."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in hist_gauntlet:
        add_gauntlet(0, "World History", "Historical Myths", slug, prompt, is_t, is_tr, c0, c1, why, 0.25, "hist_ref")

    # ------------------------------------------------------------------------
    # 8F. ARTS, ARCHITECTURE & LITERATURE (Domain 3: Arts)
    # ------------------------------------------------------------------------
    arts_codex = [
        ("arts_paint_1", "Match each iconic painting to the master artist who created it.",
         [("The Starry Night", "Vincent van Gogh"), ("Guernica", "Pablo Picasso"), ("The Persistence of Memory", "Salvador Dalí")], "Claude Monet",
         "Guernica responded to the 1937 Spanish Civil War bombing; melting clocks are surrealist.",
         "Impressionist master Claude Monet is the decoy here.",
         "Van Gogh painted The Starry Night (1889), Picasso painted Guernica (1937), and Dalí painted The Persistence of Memory (1931)."),
        ("arts_paint_2", "Align each Renaissance or Baroque masterpiece with its artist.",
         [("Girl with a Pearl Earring", "Johannes Vermeer"), ("The Birth of Venus", "Sandro Botticelli"), ("The Night Watch", "Rembrandt")], "Michelangelo",
         "Two of these masters hail from the Dutch Golden Age; Venus hails from Florence.",
         "Michelangelo painted the Sistine Chapel ceiling and is the decoy.",
         "Vermeer painted Girl with a Pearl Earring, Botticelli painted The Birth of Venus, and Rembrandt painted The Night Watch."),
        ("arts_arch_1", "Match each world-famous architectural landmark to its host city.",
         [("Sagrada Família", "Barcelona"), ("Hagia Sophia", "Istanbul"), ("Burj Khalifa", "Dubai")], "Athens",
         "Antoni Gaudí began Sagrada Família in Catalonia; Hagia Sophia crowns the Bosphorus.",
         "Athens hosts the Parthenon and serves as the decoy.",
         "Sagrada Família rises in Barcelona, Hagia Sophia stands in Istanbul, and Burj Khalifa towers over Dubai."),
        ("arts_arch_2", "Align each historic monument with the country where it stands.",
         [("Angkor Wat", "Cambodia"), ("Petra", "Jordan"), ("Alhambra", "Spain")], "Morocco",
         "Angkor Wat is the vast Khmer temple complex; Petra is carved into rose sandstone.",
         "Alhambra overlooks Granada in Andalusia, making Morocco the decoy.",
         "Angkor Wat stands in Cambodia, Petra lies in southern Jordan, and the Alhambra palace stands in Granada, Spain."),
        ("arts_comp_1", "Match each classical masterwork to its composer.",
         [("The Four Seasons", "Antonio Vivaldi"), ("Moonlight Sonata", "Ludwig van Beethoven"), ("The Magic Flute", "Wolfgang A. Mozart")], "Frédéric Chopin",
         "Vivaldi composed his violin concertos in Venice; Mozart wrote his Singspiel opera in 1791.",
         "Polish piano poet Frédéric Chopin is the decoy.",
         "Vivaldi wrote The Four Seasons, Beethoven composed Moonlight Sonata, and Mozart premiered The Magic Flute."),
        ("arts_lit_1", "Match each world literature classic to its author.",
         [("One Hundred Years of Solitude", "Gabriel García Márquez"), ("Crime and Punishment", "Fyodor Dostoevsky"), ("Don Quixote", "Miguel de Cervantes")], "Leo Tolstoy",
         "Macondo belongs to Colombian magical realism; Raskolnikov walks St. Petersburg.",
         "Leo Tolstoy wrote War and Peace and Anna Karenina, serving as decoy.",
         "García Márquez wrote One Hundred Years of Solitude, Dostoevsky wrote Crime and Punishment, and Cervantes wrote Don Quixote."),
        ("arts_lit_2", "Align each celebrated novel with its author.",
         [("The Tale of Genji", "Murasaki Shikibu"), ("Frankenstein", "Mary Shelley"), ("Things Fall Apart", "Chinua Achebe")], "Virginia Woolf",
         "The Tale of Genji was written at Japan's Heian court around 1008 CE.",
         "Mary Shelley conceived her Gothic classic near Lake Geneva in 1816.",
         "Murasaki Shikibu wrote The Tale of Genji, Mary Shelley wrote Frankenstein, and Chinua Achebe wrote Things Fall Apart."),
        ("arts_music_terms", "Match each Italian musical notation term to its performance instruction.",
         [("Allegro", "Fast and bright"), ("Adagio", "Slow and stately"), ("Pianissimo", "Very softly")], "Pluck the strings",
         "Piano means soft; adding '-issimo' intensifies it to 'very'.",
         "Plucking strings is indicated by 'pizzicato' (the decoy).",
         "In musical notation, allegro indicates brisk tempo, adagio signals slow pace, and pianissimo directs very soft volume."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in arts_codex:
        add_codex(3, "Arts & Culture", "Masterworks", slug, prompt, "3/3 Cultural Works", pairs, decoy, c0, c1, why, 0.3, "arts_ref")

    # ------------------------------------------------------------------------
    # 8G. SPORTS RULES, DIMENSIONS & OLYMPIC HISTORY (Domain 5: Sports)
    # ------------------------------------------------------------------------
    sports_numbers = [
        ("How many total squares make up a standard international chessboard?", 64, "squares", "Chess", "Multiply 8 ranks by 8 files."),
        ("How many regulation innings constitute a standard Major League Baseball game?", 9, "innings", "Baseball", "Each side gets three outs per half-inning."),
        ("How many players from one team are on the pitch simultaneously in regulation association football (soccer)?", 11, "players", "Football", "Ten outfield players plus one goalkeeper."),
        ("How many players from one team take the field simultaneously in Rugby Union?", 15, "players", "Rugby", "Eight forwards and seven backs per side."),
        ("How many holes comprise a standard full round on a championship golf course?", 18, "holes", "Golf", "Split evenly into a front nine and back nine."),
        ("How many red balls are racked on the table at the start of a full frame of snooker?", 15, "balls", "Snooker", "Arranged in a triangle alongside six colored balls."),
        ("How many frames make up a standard game of ten-pin bowling?", 10, "frames", "Bowling", "A perfect score of 300 requires twelve consecutive strikes."),
        ("How many cards (excluding jokers) are in a standard Anglo-American playing deck?", 52, "cards", "Card Games", "Four suits multiplied by thirteen ranks."),
        ("What is the official Olympic marathon distance in kilometers (rounded to 1 decimal)?", 42.2, "km", "Athletics", "Standardized at 26 miles 385 yards after the 1908 London Games."),
        ("How many points is a regulation touchdown worth in American football before the extra point?", 6, "points", "American Football", "Worth double a standard 3-point field goal."),
        ("How many players per team are on court simultaneously in standard indoor volleyball?", 6, "players", "Volleyball", "Three front-row and three back-row positions rotate clockwise."),
        ("How many vertical and horizontal grid lines form a standard full-size Go board?", 19, "lines", "Go", "Creates 361 total intersections (19 x 19)."),
        ("What is the regulation height of a basketball rim above the court floor in feet?", 10, "feet", "Basketball", "James Naismith nailed the original peach basket to a 10-foot balcony."),
        ("How many interlocking rings appear on the official Olympic flag?", 5, "rings", "Olympics", "Symbolizes the union of the five inhabited continents."),
    ]
    for prompt, val, unit, l2, hint in sports_numbers:
        step = 0.2 if not float(val).is_integer() else 1
        add_cal(
            5, "Sports & Games", l2, f"sport_num_{l2.lower()}_{val}",
            prompt, val, unit,
            f"Standard international rulebook specification for {l2}.",
            hint,
            f"Under official international {l2} rules, the verified measurement or count is {val} {unit}.",
            irt_b=-0.4 if val in (64, 11, 18, 52, 5, 10) else 0.5,
            floor_val=1, step=step, min_span=max(10.0, val * 0.5), bucket="sports_ref",
        )

    olympic_codex = [
        ("sport_oly_1", "Match each Summer Olympic Games year to its host city.",
         [("1896 Olympics", "Athens"), ("1964 Olympics", "Tokyo"), ("2008 Olympics", "Beijing")], "Sydney",
         "The first modern Games revived in Greece; Japan hosted Asia's first Summer Games in 1964.",
         "Sydney hosted the millennium Summer Games in 2000 (decoy).",
         "Modern Summer Olympic hosts: Athens (1896), Tokyo (1964), and Beijing (2008)."),
        ("sport_oly_2", "Align each Summer Olympic Games year with its host city.",
         [("1992 Olympics", "Barcelona"), ("2000 Olympics", "Sydney"), ("2016 Olympics", "Rio de Janeiro")], "London",
         "South America hosted its first-ever Summer Games in 2016.",
         "London hosted in 1908, 1948, and 2012 (decoy).",
         "Summer Olympic hosts: Barcelona (1992), Sydney (2000), and Rio de Janeiro (2016)."),
        ("sport_tennis_slams", "Match each tennis Grand Slam tournament to its signature court surface.",
         [("Wimbledon", "Grass"), ("French Open", "Red Clay"), ("US Open", "Hard Court")], "Wood Parquet",
         "Roland-Garros in Paris is famed for slow red brick-dust clay.",
         "No Grand Slam is contested on wood parquet.",
         "Grand Slam surfaces: Wimbledon is played on grass, the French Open on red clay, and the US Open on hard courts."),
        ("sport_chess_moves", "Align each chess piece with its defining geometric movement.",
         [("Knight", "L-shaped jump"), ("Bishop", "Diagonals only"), ("Rook", "Ranks and files")], "One step only",
         "Only one chess piece can leap over intervening pieces.",
         "Moving strictly one square at a time describes the King (decoy).",
         "Knights leap in 2x1 L-shapes, bishops glide diagonally, and rooks move orthogonally along ranks and files."),
        ("sport_trophies", "Match each prestigious sporting championship to its iconic trophy.",
         [("NHL Hockey", "Stanley Cup"), ("Golf Open", "Claret Jug"), ("NFL Super Bowl", "Lombardi Trophy")], "Davis Cup",
         "The silver Claret Jug is awarded at The Open Championship in Britain.",
         "The Davis Cup is an international men's team tennis trophy.",
         "NHL awards the Stanley Cup, The Open awards the Claret Jug, and the NFL awards the Vince Lombardi Trophy."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in olympic_codex:
        add_codex(5, "Sports & Games", "Championships & Rules", slug, prompt, "3/3 Sports Matches", pairs, decoy, c0, c1, why, 0.25, "sports_ref")

    # ------------------------------------------------------------------------
    # 8H. FOOD, BEVERAGES & CULINARY CRAFT (Domain 9: Food)
    # ------------------------------------------------------------------------
    culinary_dishes = [
        ("Paella", "Spain", "Valencian saffron rice cooked in a wide shallow pan"),
        ("Kimchi", "South Korea", "Fermented napa cabbage and radish seasoned with chili"),
        ("Poutine", "Canada", "Fries topped with cheese curds and warm brown gravy"),
        ("Ceviche", "Peru", "Fresh raw fish cured in tangy citrus lime juice"),
        ("Pho", "Vietnam", "Aromatic beef or chicken broth with rice noodles and herbs"),
        ("Goulash", "Hungary", "Paprika-spiced stew of tender beef and vegetables"),
        ("Moussaka", "Greece", "Layered eggplant, spiced meat, and creamy béchamel bake"),
        ("Feijoada", "Brazil", "Rich black bean stew traditionally served with rice and orange"),
        ("Rendang", "Indonesia", "Slow-braised spiced beef caramelized in coconut milk"),
        ("Biryani", "India", "Fragrant layered basmati rice spiced with saffron and cardamom"),
        ("Tagine", "Morocco", "Slow-simmered savory stew named for its conical clay pot"),
        ("Khachapuri", "Georgia", "Warm boat-shaped flatbread filled with molten cheese"),
        ("Shakshuka", "Tunisia", "Eggs poached in spiced tomato and pepper sauce"),
        ("Koshari", "Egypt", "Hearty street mix of lentils, rice, pasta, and crispy onions"),
        ("Haggis", "Scotland", "Savory pudding served with neeps and tatties"),
        ("Pierogi", "Poland", "Crescent dumplings stuffed with potato, cheese, or fruit"),
        ("Bibimbap", "South Korea", "Warm rice bowl topped with seasoned vegetables and gochujang"),
        ("Arepas", "Venezuela", "Grilled or baked ground maize flatbread pockets"),
        ("Pad Thai", "Thailand", "Stir-fried rice noodles balanced with tamarind, lime, and peanuts"),
        ("Ramen", "Japan", "Wheat noodles in savory dashi, miso, or tonkotsu broth"),
        ("Laksa", "Malaysia", "Spicy Peranakan coconut or sour tamarind noodle soup"),
        ("Fondue", "Switzerland", "Communal pot of melted alpine Gruyère and Emmental cheese"),
        ("Smørrebrød", "Denmark", "Artisanal open-faced rye bread sandwiches"),
        ("Borscht", "Ukraine", "Vibrant ruby-red beetroot soup finished with sour cream"),
    ]
    dish_countries = sorted(set(x[1] for x in culinary_dishes))
    for dish, country, desc in culinary_dishes:
        dists = [c for c in dish_countries if c != country]
        rng.shuffle(dists)
        add_sight(
            9, "World Gastronomy", "National Dishes", f"food_dish_{dish.lower()}",
            f"Which country is most famously associated with the traditional dish {dish}?",
            country, dists[:3],
            f"Culinary profile: {desc}.",
            f"Trace the dish's staple spices and culinary heritage.",
            f"{dish} ({desc.lower()}) is a signature culinary tradition of {country}.",
            irt_b=-0.5 if dish in ("Paella", "Kimchi", "Poutine", "Pho", "Fondue", "Ramen", "Pad Thai") else 0.45,
            bucket="food_ref",
        )

    for i in range(0, len(culinary_dishes) - 3, 4):
        grp = culinary_dishes[i : i + 4]
        if len({g[1] for g in grp}) < 4:
            continue
        pairs = [(g[0], g[1]) for g in grp[:3]]
        decoy = grp[3][1]
        add_codex(
            9, "World Gastronomy", "Culinary Atlas", f"food_codex_{i}",
            f"Match each signature dish ({grp[0][0]}, {grp[1][0]}, {grp[2][0]}) to its homeland.",
            "3/3 Culinary Origins", pairs, decoy,
            f"Dish cue: {grp[0][0]} is {grp[0][2].lower()[:48]}.",
            f"{decoy} is the decoy—it is famed instead for {grp[3][0]}.",
            f"Culinary origins: {grp[0][0]} ({grp[0][1]}), {grp[1][0]} ({grp[1][1]}), {grp[2][0]} ({grp[2][1]}).",
            0.3, "food_ref",
        )

    food_codex_extra = [
        ("food_cheese_1", "Match each celebrated protected cheese to its country of origin.",
         [("Parmigiano-Reggiano", "Italy"), ("Roquefort", "France"), ("Manchego", "Spain")], "Switzerland",
         "Manchego is crafted from sheep's milk in La Mancha; Roquefort ages in Combalou caves.",
         "Switzerland is famed for Gruyère and Emmental (decoy).",
         "Protected cheese origins: Parmigiano-Reggiano (Italy), Roquefort (France), and Manchego (Spain)."),
        ("food_coffee_1", "Align each classic espresso beverage with its defining composition.",
         [("Americano", "Espresso + hot water"), ("Macchiato", "Espresso + foam mark"), ("Affogato", "Espresso + gelato")], "Cold brew + tonic",
         "Italian 'macchiato' literally means 'stained' or 'marked'; 'affogato' means 'drowned'.",
         "Espresso over vanilla gelato bridges coffee and dessert.",
         "An Americano dilutes espresso with hot water, a macchiato marks it with foam, and an affogato pours it over gelato."),
        ("food_spices_1", "Match each prized culinary spice to the plant part it comes from.",
         [("Saffron", "Flower stigmas"), ("Cinnamon", "Inner tree bark"), ("Cloves", "Dried flower buds")], "Underground root",
         "Saffron is hand-harvested from Crocus sativus blossoms, making it costly by weight.",
         "Underground rhizomes/roots give us ginger and turmeric (decoy).",
         "Saffron comes from crocus stigmas, cinnamon from inner Cinnamomum bark, and cloves from dried aromatic flower buds."),
        ("food_tea_1", "Match each major tea style to its defining processing step.",
         [("Matcha", "Stone-ground shade leaf"), ("Oolong", "Partially oxidized"), ("Pu-erh", "Post-fermented aged")], "Roasted coffee bean",
         "All true teas come from Camellia sinensis; oxidation separates green from oolong.",
         "Pu-erh is a renowned aged dark tea originating in Yunnan, China.",
         "Matcha is powdered shade-grown green tea, oolong is partially oxidized, and pu-erh undergoes microbial fermentation."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in food_codex_extra:
        add_codex(9, "Food & Craft", "Ingredients & Beverages", slug, prompt, "3/3 Craft Matches", pairs, decoy, c0, c1, why, 0.35, "food_ref")

    food_gauntlet = [
        ("food_gt_peanuts", "Botanically speaking, peanuts are legumes related to beans and peas rather than true tree nuts.", True, False,
         "Look at where peanut pods mature—underground on flowering herbaceous plants.",
         "Arachis hypogaea belongs to the Fabaceae (pea/bean) family.",
         "Verified: Peanuts are underground legumes in the Fabaceae family, not botanical tree nuts."),
        ("food_gt_tomato_fruit", "Botanically, a tomato is a fruit (specifically a berry) rather than a vegetable.", True, False,
         "Botany classifies seed-bearing structures developed from a flower's ovary as fruits.",
         "Culinary usage differs from botanical classification.",
         "Verified: Because tomatoes develop from a flower's ovary and contain seeds, botanists classify them as berries."),
        ("food_gt_saffron_cost", "By weight, saffron is widely recognized as the world's most expensive spice.", True, False,
         "Roughly 75,000 crocus blossoms yield a single pound of dried threads.",
         "Every delicate red stigma must be harvested by hand.",
         "Verified: Hand-picking three tiny stigmas per Crocus sativus blossom makes saffron the costliest spice by weight."),
        ("food_gt_fortune_china", "Modern crisp folded fortune cookies originated in ancient Ming Dynasty Beijing.", False, True,
         "Trace early 20th-century Japanese-American bakeries in California.",
         "They evolved from Japanese 'tsujiura senbei' crackers brought to California.",
         "Culinary myth! Modern fortune cookies were popularized in early 1900s California by Japanese-American and Chinese-American bakers."),
        ("food_gt_white_choc", "White chocolate contains cocoa solids just like dark and milk chocolate.", False, False,
         "Check which component of the cacao bean gives white chocolate its ivory color.",
         "White chocolate is made from cocoa butter, sugar, and milk solids.",
         "False: White chocolate contains cocoa butter (fat) but zero dark cocoa solids."),
        ("food_gt_honey_spoil", "Properly sealed raw honey can remain edible for thousands of years without spoiling.", True, False,
         "Low moisture, acidic pH, and natural hydrogen peroxide block bacterial growth.",
         "Archaeologists have found preserved honey in ancient Egyptian tombs.",
         "Verified: Honey's extremely low water activity and natural acidity prevent spoilage bacteria from thriving."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in food_gauntlet:
        add_gauntlet(9, "Food & Craft", "Culinary Science", slug, prompt, is_t, is_tr, c0, c1, why, 0.2, "food_ref")

    # ------------------------------------------------------------------------
    # 8I. NATURE, HUMAN BIOLOGY & EARTH EXTREMES (Domain 7: Nature)
    # ------------------------------------------------------------------------
    bio_numbers = [
        ("How many bones are present in the typical adult human skeleton?", 206, "bones", "Human Anatomy", "Babies start near 270 before bones fuse."),
        ("How many chromosomes are contained in a typical human somatic (body) cell?", 46, "chromosomes", "Genetics", "Organized as 23 matched pairs."),
        ("How many cervical (neck) vertebrae does a giraffe possess?", 7, "vertebrae", "Zoology", "Surprisingly identical to almost all mammals, including humans."),
        ("How many pairs of cranial nerves emerge directly from the human brain?", 12, "pairs", "Neuroscience", "Numbered I (olfactory) through XII (hypoglossal)."),
        ("How many permanent teeth does a typical adult human possess (including wisdom teeth)?", 32, "teeth", "Human Anatomy", "Eight teeth in each of the four jaw quadrants."),
        ("What is the official elevation of Mount Everest's summit in meters (2020 Nepal-China survey)?", 8849, "meters", "Earth Extremes", "The 2020 joint survey refined it to 8,848.86 meters."),
        ("What is the approximate maximum depth of the Mariana Trench's Challenger Deep in meters?", 10935, "meters", "Oceanography", "Nearly 11 kilometers beneath the western Pacific surface."),
        ("What is the average normal human resting body temperature in degrees Celsius?", 37, "°C", "Physiology", "Equivalent to 98.6 degrees Fahrenheit."),
    ]
    for prompt, val, unit, l2, hint in bio_numbers:
        add_cal(
            7 if l2 != "Earth Extremes" else 2,
            "Biology & Earth" if l2 != "Earth Extremes" else "Physical Geography",
            l2, f"bio_num_{l2.lower()}_{val}",
            prompt, val, unit,
            f"Verified standard measurement in {l2.lower()}.",
            hint,
            f"Standard scientific measurements establish this value at {val:,} {unit}.",
            irt_b=-0.3 if val in (206, 46, 32, 37) else 0.7,
            floor_val=1, step=1, min_span=max(10.0, val * 0.45), bucket="nature_ref",
        )

    nature_codex = [
        ("nat_collective_1", "Match each animal species to its traditional English collective noun.",
         [("Crows", "A Murder"), ("Owls", "A Parliament"), ("Lions", "A Pride")], "A Pod",
         "C.S. Lewis popularized a Parliament of Owls; pods belong to marine mammals.",
         "Dolphins and whales travel in the decoy 'pod'.",
         "Traditional collective nouns: a murder of crows, a parliament of owls, and a pride of lions."),
        ("nat_taxonomy_1", "Align each animal with its correct biological taxonomic class.",
         [("Platypus", "Mammalia"), ("Komodo Dragon", "Reptilia"), ("Axolotl", "Amphibia")], "Aves",
         "Despite laying eggs, the platypus produces milk and has fur (monotreme).",
         "Aves is the class of birds (decoy).",
         "Platypuses are monotreme mammals, Komodo dragons are reptiles, and axolotls are neotenic salamanders (amphibians)."),
        ("nat_biomes_1", "Match each iconic Earth biome to its defining climate characteristic.",
         [("Taiga (Boreal)", "Subarctic conifer forest"), ("Tundra", "Treeless permafrost"), ("Savanna", "Tropical grassland")], "Abyssal ocean vent",
         "Taiga forms Earth's largest terrestrial biome across northern Eurasia and Canada.",
         "Permafrost blocks deep tree roots across the Arctic tundra.",
         "Taiga is boreal conifer forest, tundra is treeless permafrost, and savanna is seasonal tropical grassland."),
        ("nat_cell_1", "Match each eukaryotic cell organelle to its primary biological role.",
         [("Mitochondria", "ATP energy production"), ("Ribosome", "Protein synthesis"), ("Chloroplast", "Photosynthesis")], "Bone marrow storage",
         "Chloroplasts contain chlorophyll in plant and algal cells.",
         "Ribosomes translate mRNA blueprints into amino-acid chains.",
         "Mitochondria generate ATP, ribosomes synthesize proteins, and chloroplasts drive photosynthesis in plants."),
    ]
    for slug, prompt, pairs, decoy, c0, c1, why in nature_codex:
        add_codex(7, "Nature & Biology", "Life Sciences", slug, prompt, "3/3 Nature Matches", pairs, decoy, c0, c1, why, 0.3, "nature_ref")

    nature_gauntlet = [
        ("nat_gt_bats_blind", "All species of bats are completely blind and navigate solely by echolocation.", False, True,
         "Think of large fruit bats (flying foxes) that forage by twilight sight.",
         "Even echolocating microbats possess functional eyes.",
         "Classic biology myth! No bat species is blind; many fruit bats have keen night vision and do not echolocate at all."),
        ("nat_gt_goldfish_mem", "Goldfish have a memory span lasting only three seconds.", False, True,
         "Controlled behavioral experiments have trained goldfish on mazes and levers.",
         "Check whether fish can retain feeding schedules over weeks or months.",
         "Classic animal myth! Scientific studies show goldfish remember trained routines and cues for months, not three seconds."),
        ("nat_gt_shark_bones", "Sharks have skeletons made entirely of cartilage rather than calcified bone.", True, False,
         "Sharks belong to the class Chondrichthyes ('cartilaginous fishes').",
         "Lighter flexible cartilage aids buoyancy without a swim bladder.",
         "Verified: Sharks, rays, and skates possess skeletons composed of cartilage rather than true bone."),
        ("nat_gt_ostrich_sand", "Threatened ostriches literally bury their heads deep underground in sand to hide from predators.", False, True,
         "Consider how a bird would breathe with its head buried in sand.",
         "Ostriches actually lie flat low to the ground or sprint up to 70 km/h.",
         "Classic wildlife myth! Ostriches do not bury their heads—when pressed low to the ground from afar, their pale heads blend into sand."),
        ("nat_gt_whale_mammal", "Blue whales are mammals that breathe air with lungs and nurse their calves with milk.", True, False,
         "Cetaceans evolved from terrestrial mammalian ancestors.",
         "Notice blowholes leading to lungs rather than fish gills.",
         "Verified: Blue whales are marine mammals—the largest animals ever known to live on Earth."),
        ("nat_gt_camels_water", "A camel's hump stores liquid water directly inside a hollow bladder.", False, True,
         "Distinguish adipose fat reserves from direct water tanks.",
         "Metabolizing stored fat yields energy and metabolic moisture in arid climates.",
         "Biology myth! A camel's hump stores concentrated fatty tissue, not liquid water."),
        ("nat_gt_koala_bear", "Koalas are marsupials rather than true bears.", True, False,
         "Check whether koalas raise their joeys inside a pouch in Australia.",
         "Their closest living evolutionary relative is the wombat.",
         "Verified: Koalas are Australian marsupials (family Phascolarctidae), completely unrelated to placental bears."),
        ("nat_gt_chameleon_camo", "Chameleons change color primarily for social signaling and temperature regulation, not just camouflage.", True, False,
         "Observe how male chameleons flash vivid hues during courtship or rivalry.",
         "Nanocrystals in their skin shift color in response to mood and light.",
         "Verified: Research confirms chameleons shift skin coloration mainly for communication and thermoregulation, alongside background blending."),
    ]
    for slug, prompt, is_t, is_tr, c0, c1, why in nature_gauntlet:
        add_gauntlet(7, "Nature & Biology", "Biology Myths & Facts", slug, prompt, is_t, is_tr, c0, c1, why, 0.2, "nature_ref")

    print(f"  -> Accepted {sum(counts.values())} verified Reference Dataset questions: {dict(counts)}")


# ============================================================================
# 9. STRICT FORGE QUALITY GATE (100% PARITY + STRICTER CHECKS)
# ============================================================================

def validate_catalog(questions: list[dict[str, Any]]) -> tuple[list[str], list[str], dict[str, Any]]:
    errors: list[str] = []
    warnings: list[str] = []

    if len(questions) < MIN_TOTAL_TARGET:
        errors.append(f"Total question count {len(questions)} < {MIN_TOTAL_TARGET} target")

    # Verify Gold Core 1..832 preserved monotonically and pinned QIDs 1..4 untouched
    if len(questions) >= 4:
        if questions[0].get("answerCorrect") != "Red Cross":
            errors.append("Pinned QID 1 altered!")
        if questions[1].get("answerCorrect") != "League of Nations":
            errors.append("Pinned QID 2 altered!")
        if questions[2].get("answerCorrect") != "World Wide Web":
            errors.append("Pinned QID 3 altered!")
        if questions[3].get("heroRelicId") != "meridian_astrolabe":
            errors.append("Pinned QID 4 altered!")

    seen_qids: set[int] = set()
    seen_topics: set[str] = set()
    seen_prompts: dict[str, int] = {}

    by_domain = {str(d): 0 for d in range(12)}
    dom_min_b = {d: float("inf") for d in range(12)}
    dom_max_b = {d: float("-inf") for d in range(12)}
    by_arch = {a: 0 for a in (
        "SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS", "CALIBRATOR_DIAL",
        "CODEX_DUAL_RING", "GAUNTLET_SHATTER",
    )}
    by_country = {c: 0 for c in CAMPAIGN_COUNTRY_RELIC}
    by_country_arch = {c: set() for c in CAMPAIGN_COUNTRY_RELIC}
    by_country_relics = {c: set() for c in CAMPAIGN_COUNTRY_RELIC}
    by_tag: Counter[str] = Counter()

    for idx, q in enumerate(questions):
        qid = q.get("qid")
        tag = f"QID {qid}"

        # Monotonic QID check
        if qid != idx + 1:
            errors.append(f"Non-monotonic QID at index {idx}: expected {idx+1}, got {qid}")
            break
        if qid in seen_qids:
            errors.append(f"Duplicate qid: {qid}")
        seen_qids.add(qid)

        # Basic required fields
        dom = q.get("l0Domain")
        if dom not in VALID_DOMAINS:
            errors.append(f"{tag}: invalid l0Domain {dom}")
        else:
            by_domain[str(dom)] += 1
            if isinstance(q.get("irtB"), (int, float)):
                dom_min_b[dom] = min(dom_min_b[dom], float(q["irtB"]))
                dom_max_b[dom] = max(dom_max_b[dom], float(q["irtB"]))

        if not isinstance(q.get("l1Category"), str) or len(q["l1Category"].strip()) < 2:
            errors.append(f"{tag}: invalid l1Category")

        is_compact_tier1 = qid > 4964
        mt = q.get("microTopicId")
        if not is_compact_tier1:
            if not isinstance(q.get("l2Subcategory"), str) or len(q["l2Subcategory"].strip()) < 2:
                errors.append(f"{tag}: invalid l2Subcategory")
            if not isinstance(mt, str) or not re.match(r"^[a-z0-9_]+$", mt):
                errors.append(f'{tag}: microTopicId "{mt}" must be snake_case')
            elif mt in seen_topics:
                errors.append(f'{tag}: duplicate microTopicId "{mt}"')
            else:
                seen_topics.add(mt)

        regs = q.get("regions")
        if not isinstance(regs, list) or not regs or any(r not in VALID_REGIONS for r in regs):
            errors.append(f"{tag}: invalid regions {regs}")
        else:
            for r in regs:
                if r in by_country:
                    by_country[r] += 1
                    by_country_arch[r].add(q.get("archetype"))
                    if q.get("heroRelicId"):
                        by_country_relics[r].add(f"{q.get('archetype')}:{q['heroRelicId']}")

        if not is_compact_tier1:
            ntags = q.get("narrativeTags")
            if not isinstance(ntags, list) or not ntags or any(t not in VALID_TAGS for t in ntags):
                errors.append(f"{tag}: invalid narrativeTags {ntags}")
            else:
                for t in ntags:
                    by_tag[t] += 1
            if q.get("tone") not in VALID_TONES:
                errors.append(f"{tag}: invalid tone {q.get('tone')}")
            if not isinstance(q.get("irtA"), (int, float)) or not (0.8 <= q["irtA"] <= 2.5):
                errors.append(f"{tag}: irtA {q.get('irtA')} out of [0.8, 2.5]")
            if q.get("freshness") not in VALID_FRESHNESS:
                errors.append(f"{tag}: invalid freshness {q.get('freshness')}")
            if q.get("glyphHint") not in VALID_GLYPHS:
                errors.append(f"{tag}: invalid glyphHint {q.get('glyphHint')}")

        if not isinstance(q.get("irtB"), (int, float)) or not (-2.5 <= q["irtB"] <= 3.0):
            errors.append(f"{tag}: irtB {q.get('irtB')} out of [-2.5, 3.0]")

        arch = q.get("archetype")
        if arch not in VALID_ARCHETYPES:
            errors.append(f"{tag}: invalid archetype {arch}")
        else:
            by_arch[arch] += 1

        # Prompt & uniqueness
        prompt = q.get("prompt", "")
        p_max = 165 if is_compact_tier1 else BUDGETS["promptMax"]
        if not isinstance(prompt, str) or not (BUDGETS["promptMin"] <= len(prompt) <= p_max):
            errors.append(f"{tag}: prompt length {len(prompt)} out of [15, {p_max}]")
        norm_p = normalize_text(prompt)
        if norm_p in seen_prompts:
            errors.append(f"{tag}: duplicate prompt matches QID {seen_prompts[norm_p]}")
        else:
            seen_prompts[norm_p] = qid

        # Clues & Why
        clues = q.get("clues")
        c0_max = 95 if qid <= GOLD_COUNT else BUDGETS["clue0Max"]
        c1_max = 85 if qid <= GOLD_COUNT else BUDGETS["clue1Max"]
        why_max = 185 if qid <= GOLD_COUNT else BUDGETS["whyMax"]

        if not isinstance(clues, list) or len(clues) != 2:
            errors.append(f"{tag}: clues must be tuple of 2 strings")
        else:
            if not (8 <= len(str(clues[0])) <= c0_max):
                errors.append(f"{tag}: clues[0] length {len(str(clues[0]))} out of [8, {c0_max}]")
            if not (8 <= len(str(clues[1])) <= c1_max):
                errors.append(f"{tag}: clues[1] length {len(str(clues[1]))} out of [8, {c1_max}]")

        why = q.get("whyExplanation", "")
        if not isinstance(why, str) or not (BUDGETS["whyMin"] <= len(why) <= why_max):
            errors.append(f"{tag}: whyExplanation length {len(why)} out of [{BUDGETS['whyMin']}, {why_max}]")

        # HTML entity check across ALL string fields on new questions (and check gold too)
        check_fields = [prompt, str(q.get("answerCorrect", "")), why] + (list(clues) if isinstance(clues, list) else [])
        opt_max = 38 if is_compact_tier1 else BUDGETS["answerMax"]
        if arch in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS"):
            if len(str(q.get("answerCorrect", ""))) > opt_max:
                errors.append(f"{tag}: answerCorrect too long (>{opt_max})")
            dists = q.get("distractors", [])
            if not isinstance(dists, list) or not (3 <= len(dists) <= 4):
                errors.append(f"{tag}: Sightline/Hero needs 3-4 distractors")
            else:
                seen_f = {normalize_text(q["answerCorrect"])}
                for di, d in enumerate(dists):
                    dt_txt = d.get("text", "") if isinstance(d, dict) else (d if isinstance(d, str) else "")
                    check_fields.append(dt_txt)
                    if not (1 <= len(dt_txt) <= opt_max):
                        errors.append(f"{tag}: distractor[{di}] length invalid (>{opt_max})")
                    nd = normalize_text(dt_txt)
                    if not nd or nd in seen_f:
                        errors.append(f'{tag}: duplicate/empty option "{dt_txt}"')
                    seen_f.add(nd)
        elif arch == "CALIBRATOR_DIAL":
            ext = q.get("calibratorExt")
            if not isinstance(ext, dict):
                errors.append(f"{tag}: missing calibratorExt")
            else:
                ev, mn, mx = ext.get("exactVal"), ext.get("minVal"), ext.get("maxVal")
                st = ext.get("step", 1)
                if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in (ev, mn, mx)):
                    errors.append(f"{tag}: invalid calibrator numbers")
                elif not (mn < ev < mx):
                    errors.append(f"{tag}: calibrator minVal < exactVal < maxVal violated")
                if not isinstance(ext.get("unit"), str) or not ext["unit"].strip():
                    errors.append(f"{tag}: calibrator unit missing")
                elif qid > GOLD_COUNT and ext["unit"] in CRYPTIC_CALIBRATOR_UNITS:
                    errors.append(f'{tag}: cryptic calibrator unit "{ext["unit"]}"')
                if qid > GOLD_COUNT:
                    if not isinstance(st, (int, float)) or st <= 0:
                        errors.append(f"{tag}: invalid calibrator step {st}")
                    elif isinstance(ev, (int, float)) and isinstance(mn, (int, float)):
                        if abs((ev - mn) / st - round((ev - mn) / st)) > 1e-6:
                            errors.append(f"{tag}: calibrator exactVal {ev} not reachable on step {st} from {mn}")
                    if not calibrator_facets_distinct_in_godot(float(ev), float(mn), float(mx), ext["unit"]):
                        errors.append(f"{tag}: Godot calibrator facets collide")
        elif arch == "CODEX_DUAL_RING":
            ext = q.get("codexExt")
            if not isinstance(ext, dict) or not isinstance(ext.get("pairs"), list) or len(ext["pairs"]) != 3:
                errors.append(f"{tag}: invalid codexExt.pairs")
            else:
                subs, targs = set(), set()
                for p in ext["pairs"]:
                    s, t = p.get("subject", ""), p.get("target", "")
                    check_fields.extend([s, t])
                    if not (1 <= len(s) <= 28 and 1 <= len(t) <= 28):
                        errors.append(f"{tag}: codex label length invalid")
                    ns, nt = normalize_text(s), normalize_text(t)
                    if ns in subs or nt in targs:
                        errors.append(f"{tag}: duplicate codex subject/target")
                    subs.add(ns)
                    targs.add(nt)
                dec = ext.get("decoyTarget", "")
                check_fields.append(dec)
                if not (1 <= len(dec) <= 28) or normalize_text(dec) in targs:
                    errors.append(f"{tag}: invalid codex decoyTarget")
        elif arch == "GAUNTLET_SHATTER":
            ext = q.get("gauntletExt")
            if not isinstance(ext, dict):
                errors.append(f"{tag}: missing gauntletExt")
            else:
                if not isinstance(ext.get("isTrue"), bool) or not isinstance(ext.get("isTrick"), bool):
                    errors.append(f"{tag}: gauntlet boolean flags invalid")
                if not (isinstance(ext.get("windowSec"), (int, float)) and 5 <= ext["windowSec"] <= 12):
                    errors.append(f"{tag}: gauntlet windowSec out of [5, 12]")

        for fld in check_fields:
            s_fld = str(fld)
            if HTML_ARTIFACT_RE.search(s_fld) or HTML_TAG_RE.search(s_fld):
                errors.append(f'{tag}: HTML artifact/tag detected in "{s_fld[:50]}"')
                break

        if qid > GOLD_COUNT:
            if TYPO_OR_SLOP_RE.search(prompt):
                errors.append(f'{tag}: typo/slop prompt detected: "{prompt[:60]}"')
            if qid > BASE_CORE_COUNT:
                if any(has_unsafe_godot_glyph_or_latex(str(fld)) for fld in check_fields):
                    errors.append(f'{tag}: unsafe Godot glyph or LaTeX detected')
            if isinstance(clues, list) and len(clues) == 2:
                if not SENTENCE_END_RE.search(str(clues[0])):
                    errors.append(f'{tag}: clues[0] missing clean ending punctuation')
                if not SENTENCE_END_RE.search(str(clues[1])):
                    errors.append(f'{tag}: clues[1] missing clean ending punctuation')
            if not SENTENCE_END_RE.search(why):
                errors.append(f'{tag}: whyExplanation missing clean ending punctuation')
            # Easy-tier QC Charter gate: no community OpenTDB noise in City 1 Easy (irtB <= -0.35)
            if isinstance(q.get("irtB"), (int, float)) and q["irtB"] <= -0.35:
                if str(mt).startswith("otdb_"):
                    errors.append(f"{tag}: OpenTDB question tagged as City 1 Easy (irtB={q['irtB']})")

        # Clue leak check (strict on all QIDs > GOLD_COUNT; mirror legacy rule on 1..220)
        leaks = check_clue_leaks(q, strict=(qid > GOLD_COUNT))
        for lk in leaks:
            if qid <= 220:
                warnings.append(f"{tag} (legacy core): {lk}")
            else:
                errors.append(f"{tag}: CLUE LEAK - {lk}")

    # Balance & Campaign Gates
    for d in range(12):
        if by_domain[str(d)] < 120:
            warnings.append(f"Domain {DOMAIN_NAMES[d]} count {by_domain[str(d)]} < 120 soft balance target")
        if dom_min_b[d] > -1.0:
            errors.append(f"Domain {DOMAIN_NAMES[d]} min irtB {dom_min_b[d]} > -1.0")
        if dom_max_b[d] < 2.2:
            errors.append(f"Domain {DOMAIN_NAMES[d]} max irtB {dom_max_b[d]} < 2.2")

    for country, relic in CAMPAIGN_COUNTRY_RELIC.items():
        if by_country[country] < 20:
            errors.append(f"Country {country} count {by_country[country]} < 20")
        if f"HERO_ARTIFACT_SYNTHESIS:{relic}" not in by_country_relics[country]:
            errors.append(f"Country {country} missing boss relic {relic}")

    stats = {
        "byDomain": by_domain,
        "byArchetype": by_arch,
        "byCountry": by_country,
        "domainMinB": dom_min_b,
        "domainMaxB": dom_max_b,
    }
    return errors, warnings, stats


# ============================================================================
# 10. MAIN RUNNER
# ============================================================================

def load_gold_core() -> list[dict[str, Any]]:
    src_path = GODOT_OUT if GODOT_OUT.exists() else WEB_OUT
    if not src_path.exists():
        raise FileNotFoundError(f"Cannot locate existing Gold catalog at {src_path}")
    with src_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    qs = data.get("questions", [])
    gold = [q for q in qs if isinstance(q.get("qid"), int) and 1 <= q["qid"] <= GOLD_COUNT]
    gold.sort(key=lambda x: x["qid"])
    if len(gold) != GOLD_COUNT:
        raise RuntimeError(f"Expected exactly {GOLD_COUNT} Gold Core questions (qid 1..{GOLD_COUNT}), found {len(gold)}")
    for idx, q in enumerate(gold):
        if q["qid"] != idx + 1:
            raise RuntimeError(f"Gold Core non-monotonic at index {idx}: got qid={q['qid']}")
    if gold[0].get("answerCorrect") != "Red Cross" or gold[3].get("heroRelicId") != "meridian_astrolabe":
        raise RuntimeError("Pinned Geneva Prologue QIDs 1..4 verification failed!")
    return gold


def polish_existing_catalog() -> tuple[list[dict[str, Any]], Counter[str], Counter[str]]:
    """Fast deterministic QC polish over an already-ingested catalog without re-hitting external APIs."""
    src_path = GODOT_OUT if GODOT_OUT.exists() else WEB_OUT
    with src_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    all_qs = data.get("questions", [])
    gold = [q for q in all_qs if isinstance(q.get("qid"), int) and 1 <= q["qid"] <= GOLD_COUNT]
    gold.sort(key=lambda x: x["qid"])
    if len(gold) != GOLD_COUNT:
        raise RuntimeError(f"Expected {GOLD_COUNT} Gold questions, got {len(gold)}")

    # Build Gold Calibrator index for duplicate elimination
    gold_cal_tokens: dict[float, list[set[str]]] = defaultdict(list)
    for gq in gold:
        if gq.get("archetype") == "CALIBRATOR_DIAL" and isinstance(gq.get("calibratorExt"), dict):
            ev = gq["calibratorExt"].get("exactVal")
            if isinstance(ev, (int, float)):
                gold_cal_tokens[float(ev)].append(content_tokens(gq["prompt"]))

    kept = list(gold)
    qc_actions: Counter[str] = Counter()
    by_source: Counter[str] = Counter()
    by_source["Gold Core (Hand-Verified 1..832)"] = len(gold)

    def infer_source(mt: str) -> str:
        if mt.startswith("tapi_"):
            return "The Trivia API v2"
        if mt.startswith("otdb_"):
            return "Open Trivia DB"
        if mt.startswith("geo_"):
            return "UN/ISO Countries + World Bank"
        if mt.startswith("pt_"):
            return "IUPAC Periodic Table"
        if mt.startswith("nobel_"):
            return "Nobel Prize API v2.1"
        return "Verified Reference Datasets"

    for q in all_qs:
        if not isinstance(q.get("qid"), int) or q["qid"] <= GOLD_COUNT:
            continue
        mt = str(q.get("microTopicId", ""))
        prompt = str(q.get("prompt", ""))

        # 1. Drop OpenTDB typos / broken English / meme slop
        if TYPO_OR_SLOP_RE.search(prompt):
            qc_actions["dropped_typo_or_slop"] += 1
            continue

        # 2. Calibrator QC: drop Gold duplicates, upgrade cryptic units, enforce exact step grid
        if q.get("archetype") == "CALIBRATOR_DIAL" and isinstance(q.get("calibratorExt"), dict):
            ext = q["calibratorExt"]
            ev = ext.get("exactVal")
            toks = content_tokens(prompt)
            if isinstance(ev, (int, float)) and any(len(toks & gt) >= 2 for gt in gold_cal_tokens.get(float(ev), ())):
                qc_actions["dropped_dup_gold_calibrator"] += 1
                continue

            # Upgrade cryptic units -> plain human-readable English
            old_u = str(ext.get("unit", ""))
            if old_u in CALIBRATOR_UNIT_UPGRADE:
                new_u = CALIBRATOR_UNIT_UPGRADE[old_u]
                ext["unit"] = new_u
                q["answerCorrect"] = f"{int(ev) if isinstance(ev, (int, float)) and float(ev).is_integer() else ev} {new_u}"
                # Also clean clue1 if it said "between X M and Y M" -> "between X and Y million"
                if old_u == "M" and isinstance(q.get("clues"), list) and len(q["clues"]) == 2:
                    q["clues"][1] = re.sub(r"between (\S+)M and (\S+)M people", r"between \1 and \2 million people", q["clues"][1])
                qc_actions["upgraded_calibrator_unit"] += 1

            # Guarantee exactVal & maxVal sit cleanly on step grid so Direct Slider can hit 100% bullseye!
            st = ext.get("step", 1)
            mn, mx = ext["minVal"], ext["maxVal"]
            if isinstance(ev, (int, float)) and isinstance(mn, (int, float)) and isinstance(mx, (int, float)):
                if float(ev).is_integer():
                    if st != 1 and (abs((ev - mn) / st - round((ev - mn) / st)) > 1e-6 or abs((mx - mn) / st - round((mx - mn) / st)) > 1e-6):
                        ext["step"] = 1
                        qc_actions["fixed_calibrator_step_grid"] += 1
                else:
                    # Decimal calibrator (<15M population or 42.2 km marathon): ensure clean step-grid alignment
                    if st == 0.5 and abs((ev - mn) / 0.5 - round((ev - mn) / 0.5)) > 1e-6:
                        snapped = round(ev * 2.0) / 2.0
                        if mn < snapped < mx:
                            ext["exactVal"] = snapped
                            q["answerCorrect"] = f"{snapped} {ext['unit']}"
                            q["whyExplanation"] = re.sub(r"approximately [0-9.]+ million", f"approximately {snapped} million", q["whyExplanation"])
                            qc_actions["fixed_calibrator_step_grid"] += 1
                    elif abs((ev - mn) / st - round((ev - mn) / st)) > 1e-6:
                        ext["step"] = 0.1
                        ext["minVal"] = round(mn, 1)
                        ext["maxVal"] = round(mx, 1)
                        qc_actions["fixed_calibrator_step_grid"] += 1

            # Keep World Bank population estimates in Tokyo+ Medium tier (>= -0.20)
            if mt.startswith("geo_pop_") and q["irtB"] <= -0.35:
                q["irtB"] = -0.20
                qc_actions["recalibrated_easy_to_medium"] += 1

        # 3. Easy-Tier (irtB <= -0.35) Accessibility Integrity!
        if q["irtB"] <= -0.35:
            if mt.startswith("otdb_"):
                # Shift noisy community OpenTDB questions into Medium (0.10..0.45)
                q["irtB"] = round(max(0.10, q["irtB"] + 1.25), 2)
                qc_actions["recalibrated_otdb_easy"] += 1
            elif mt.startswith("geo_cap_"):
                m = re.match(r"What is the official capital city of (.+)\?", prompt)
                if m and m.group(1) not in EASY_ICONIC_CAPITALS:
                    q["irtB"] = round(max(0.20, q["irtB"] + 1.35), 2)
                    qc_actions["recalibrated_easy_to_medium"] += 1
            elif mt.startswith("geo_curr_"):
                m = re.match(r"What is the official national currency of (.+)\?", prompt)
                if m and m.group(1) not in EASY_ICONIC_CURRENCIES:
                    q["irtB"] = round(max(0.25, q["irtB"] + 1.05), 2)
                    qc_actions["recalibrated_easy_to_medium"] += 1
            elif mt.startswith("pt_sym_") or mt.startswith("pt_z_"):
                el = q["answerCorrect"] if mt.startswith("pt_sym_") else re.sub(r".*element ([^?]+)\?", r"\1", prompt)
                if el not in EASY_ICONIC_ELEMENTS or (mt.startswith("pt_z_") and el not in ("Hydrogen", "Helium", "Carbon", "Nitrogen", "Oxygen")):
                    q["irtB"] = round(max(0.25, q["irtB"] + 1.35), 2)
                    qc_actions["recalibrated_easy_to_medium"] += 1
            elif mt.startswith("geo_ll_"):
                cname = prompt.split(" is a completely", 1)[0]
                if cname not in EASY_OBVIOUS_COASTAL_OR_LL:
                    q["irtB"] = round(max(0.20, q["irtB"] + 0.85), 2)
                    qc_actions["recalibrated_easy_to_medium"] += 1
            elif q.get("archetype") == "CODEX_DUAL_RING":
                q["irtB"] = round(max(0.10, q["irtB"] + 0.65), 2)
                qc_actions["recalibrated_easy_to_medium"] += 1

        kept.append(q)
        by_source[infer_source(mt)] += 1

    return kept, by_source, qc_actions


# ============================================================================
# 9B. TIER-1 COMMERCIAL-SAFE HUGGINGFACE HUMAN-WRITTEN PIPELINE (25k-45k+)
#     MIT / Apache-2.0 / CC-BY-SA ONLY — ZERO CC-BY-NC, ZERO COPYRIGHTED SCRAPES
# ============================================================================

BASE_CORE_COUNT = 4964

HF_BAD_PROMPT_RE = re.compile(
    r"\b(passage|excerpt|paragraph|diagram|figure|table|graph|chart|pictured|shown below|shown above|illustrated|"
    r"statement 1|statement 2|statement i|statement ii|following statements|all of the above|none of the above|"
    r"both a and b|i and ii|ii and iii|based on the|according to the text|according to the article|according to the reading|"
    r"the author|in the story|the student|a student|students in|a teacher|a class of|mrs\.|mr\.|ms\.|"
    r"experiment below|investigation below|list below|map above|map below|data below|box below|timeline below|"
    r"picture above|picture below|drawing below|model below|following sentence|following quote|underlined|above-mentioned|"
    r"in an experiment|a researcher observed|the graph|the table|the chart|the diagram|the figure|the data|themean)\b"
    r"|__|\\frac|\\int|\\sum|\\sqrt|\\theta|\\alpha|\\beta|\\begin|\$\$|\{|\}|->|=>|!=|==|\|\||&&|\bdef |\bint main|\bprintf\b|System\.out|\[x\]/|\bR\^|\bf\([xy]\)\s*=|\b[a-d]\)\s|\d+_\d+|\b\d+[a-z]{5,}\b",
    re.I,
)

# Strict Godot Font-Safe Unicode Allowlist (ASCII + Latin-1/Latin-Ext-A + proven punctuation/units -> 0 tofu boxes!)
GODOT_SAFE_EXTRA_CHARS = set("–—‘’“”…·°±²³×÷€£¥¢§©®™")


def has_unsafe_godot_glyph_or_latex(text: str) -> bool:
    if re.search(r"\\[a-zA-Z]{2,}|\$[A-Za-z(\\]|\$[^0-9\s]|\$[0-9][^$]{0,24}[\\^_=!]|\\$", text):
        return True
    # Also catch paired LaTeX math delimiters like "$5$" or "$25, 26$" (dollar immediately before closing dollar without currency decimal)
    if re.search(r"\$\d+\$", text):
        return True
    for ch in text:
        cp = ord(ch)
        if 32 <= cp <= 126:
            continue
        if 0x00A0 <= cp <= 0x017F:  # Latin-1 Supplement & Latin Extended-A (é, ü, ñ, ł, ś, etc.)
            continue
        if ch in GODOT_SAFE_EXTRA_CHARS:
            continue
        return True
    return False


# Case-sensitive check for broken double-caps typos (WHat, WHere) and abstract-algebra symbols (Z_3, K_f)
HF_BAD_CASE_RE = re.compile(r"\b(?!MHz|GHz|kHz|DNA|RNA|USB|CPU|GPU|PDF|HTML|HTTP|NATO|NASA|OPEC|ASEAN|UEFA|FIFA|NCAA|PhD|MacOS|iOS|iPad|iPhone)[A-Z]{2}[a-z]{2,}\b|\b[A-Z]_\d|\b[A-Za-z]_[a-z]\b")

HF_BAD_OPT_RE = re.compile(
    r"^(all|none|both|neither)\b.*\b(above|these|them|a and b|i and ii|correct|true|false|apply|answers)$"
    r"|^(i|ii|iii|iv|1|2|3|4)\s+(and|only)\b|cannot be determined|not enough information|^n/a$|^other$|^statement [12i]"
    r"|^(\(?[A-Da-d1-4]\)|[A-Da-d]\.\s)|\(A\),\s*\(B\)|\bCatching Pray\b|\bLove else\b",
    re.I,
)

CSQA_AWKWARD_WHAT_RE = re.compile(
    r"\b(to|a|an|the|be|is|are|was|were|will|would|could|should|of|in|on|at|for|by|with|into|from|as|had|has|have|some|many|very|more|most|their|his|her|its|your|my|our|do|does|did)\s+what\b",
    re.I,
)

BOOLQ_STALE_RE = re.compile(
    r"\b(still|season \d|new season|next season|another season|sequel|coming out|netflix|hulu|amazon prime|disney plus|"
    r"currently|right now|today|this year|last year|201[6-9]|202\d|will there be|going to be|"
    r"is there a part|is there a second|is there a third|on tv|airing|renewed|cancelled|canceled|"
    r"for sale|open on|cost to|price of|available on|can you buy|can you get|can you still|can i |do i need|"
    r"do you have to|is it illegal|is it legal|worth it|youtube|instagram|snapchat|facebook|iphone \d|xbox one|ps4|"
    r"ever won|ever been|ever made|ever played|ever hosted|qualified for|won a |won the |win the |most goals|"
    r"most points|highest grossing|richest|oldest living|youngest|still alive|still married|still play|still open)\b",
    re.I,
)

ABBREV_END_RE = re.compile(r"\b(U\.S|U\.K|St|Dr|Mr|Mrs|Ms|Jr|Sr|Inc|Ltd|Co|Prof|Mt|Ft|vs|etc|Ph\.D|a\.m|p\.m|B\.C|A\.D)\.$", re.I)

MMLU_SUBJECT_MAP: dict[str, tuple[int, str, float]] = {
    # Domain 0: History
    "high_school_european_history": (0, "European History", 0.45),
    "high_school_us_history": (0, "US History", 0.40),
    "high_school_world_history": (0, "World History", 0.45),
    "prehistory": (0, "Prehistory", 0.75),
    # Domain 1: Science (Physics, Chemistry, Astronomy)
    "astronomy": (1, "Astronomy", 0.70),
    "conceptual_physics": (1, "Physics", 0.35),
    "high_school_physics": (1, "Physics", 0.65),
    "high_school_chemistry": (1, "Chemistry", 0.65),
    "college_physics": (1, "Advanced Physics", 1.25),
    "college_chemistry": (1, "Advanced Chemistry", 1.25),
    # Domain 2: Geography
    "high_school_geography": (2, "Geography", 0.35),
    "global_facts": (2, "Global Facts", 0.55),
    # Domain 6: Tech & Engineering
    "high_school_computer_science": (6, "Computer Science", 0.55),
    "college_computer_science": (6, "Computer Science", 1.20),
    "computer_security": (6, "Cybersecurity", 1.25),
    "electrical_engineering": (6, "Electrical Engineering", 1.20),
    "machine_learning": (6, "Machine Learning", 1.35),
    # Domain 7: Nature, Biology & Medicine
    "high_school_biology": (7, "Biology", 0.40),
    "college_biology": (7, "Biology", 1.10),
    "anatomy": (7, "Human Anatomy", 0.90),
    "clinical_knowledge": (7, "Medicine", 1.15),
    "college_medicine": (7, "Medicine", 1.25),
    "professional_medicine": (7, "Clinical Medicine", 1.45),
    "medical_genetics": (7, "Genetics", 1.20),
    "virology": (7, "Virology", 1.30),
    "human_aging": (7, "Human Biology", 0.70),
    "human_sexuality": (7, "Human Biology", 0.65),
    # Domain 8: Society, Law, Politics, Economics, Psychology
    "high_school_government_and_politics": (8, "Government & Civics", 0.45),
    "high_school_macroeconomics": (8, "Economics", 0.55),
    "high_school_microeconomics": (8, "Economics", 0.55),
    "high_school_psychology": (8, "Psychology", 0.45),
    "sociology": (8, "Sociology", 0.65),
    "us_foreign_policy": (8, "Foreign Policy", 0.85),
    "security_studies": (8, "International Security", 1.05),
    "international_law": (8, "International Law", 1.25),
    "jurisprudence": (8, "Legal Philosophy", 1.30),
    "professional_law": (8, "Law", 1.45),
    "professional_psychology": (8, "Psychology", 1.25),
    "business_ethics": (8, "Business Ethics", 0.75),
    "management": (8, "Management", 0.70),
    "marketing": (8, "Marketing", 0.65),
    "public_relations": (8, "Public Relations", 0.70),
    "professional_accounting": (8, "Finance & Accounting", 1.30),
    "econometrics": (8, "Econometrics", 1.40),
    "moral_disputes": (8, "Ethics", 0.95),
    # Domain 9: Food & Nutrition
    "nutrition": (9, "Nutrition & Food", 0.50),
    # Domain 10: Philosophy & World Religions
    "philosophy": (10, "Philosophy", 0.95),
    "world_religions": (10, "World Religions", 0.55),
    # Domain 11: Logic & Mathematics
    "elementary_mathematics": (11, "Mathematics", 0.15),
    "high_school_mathematics": (11, "Mathematics", 0.80),
    "high_school_statistics": (11, "Statistics", 0.80),
    "logical_fallacies": (11, "Critical Reasoning", 0.70),
    "formal_logic": (11, "Formal Logic", 1.35),
    "college_mathematics": (11, "Advanced Math", 1.45),
    "abstract_algebra": (11, "Abstract Algebra", 1.55),
    # Miscellaneous routed dynamically by keyword
    "miscellaneous": (8, "General Knowledge", 0.30),
}

MMLU_PRO_CAT_MAP: dict[str, tuple[int, str]] = {
    "history": (0, "World History"),
    "physics": (1, "Advanced Physics"),
    "chemistry": (1, "Advanced Chemistry"),
    "computer science": (6, "Computer Science"),
    "engineering": (6, "Engineering"),
    "biology": (7, "Advanced Biology"),
    "health": (7, "Medicine & Health"),
    "law": (8, "Law & Jurisprudence"),
    "economics": (8, "Economics"),
    "business": (8, "Business & Finance"),
    "psychology": (8, "Psychology"),
    "philosophy": (10, "Philosophy"),
    "math": (11, "Advanced Math"),
    "other": (8, "General Scholarship"),
}

KEYWORD_DOMAIN_RULES: list[tuple[int, str, re.Pattern[str]]] = [
    (5, "Sports & Games", re.compile(r"\b(football|soccer|basketball|baseball|tennis|golf|cricket|hockey|rugby|olympic|olympics|nfl|nba|mlb|nhl|fifa|world cup|super bowl|chess|marathon|boxing|wrestling|swimming|gymnastics|formula 1|nascar|wimbledon|stadium|quarterback|goalkeeper|home run|touchdown)\b", re.I)),
    (4, "Film, Music & Pop", re.compile(r"\b(movie|film|actor|actress|director|oscar|academy award|grammy|album|song|singer|band|rock|jazz|hip hop|rapper|tv show|television|series|sitcom|broadway|disney|pixar|marvel|star wars|harry potter|video game|nintendo|playstation|minecraft|anime|comic book|superhero)\b", re.I)),
    (3, "Arts & Literature", re.compile(r"\b(painting|painter|sculptor|sculpture|museum|louvre|architecture|cathedral|symphony|opera|composer|beethoven|mozart|shakespeare|novel|novelist|poet|poetry|playwright|renaissance|baroque|impressionism|ballet|sonnet|fresco|mural)\b", re.I)),
    (9, "Food & Culinary", re.compile(r"\b(cheese|wine|coffee|tea|beer|whiskey|chocolate|bread|pasta|pizza|sushi|spice|saffron|pepper|sugar|butter|flour|baking|cooking|recipe|cuisine|dish|fruit|vegetable|meat|beef|pork|chicken|salad|soup|dessert|cake|cocktail|ingredient|culinary|vitamin|calorie)\b", re.I)),
    (10, "Myth & Religion", re.compile(r"\b(mythology|greek god|roman god|norse|zeus|odin|thor|apollo|athena|bible|biblical|quran|torah|buddhism|hinduism|islam|christianity|judaism|philosophy|philosopher|socrates|plato|aristotle|stoicism|olympus|valhalla|pharaoh|temple|deity|goddess)\b", re.I)),
    (6, "Tech & Computing", re.compile(r"\b(computer|software|hardware|internet|algorithm|programming|python|java|linux|windows|apple|microsoft|google|cpu|gpu|ram|battery|engine|aircraft|airplane|rocket|satellite|radar|laser|electricity|circuit|transistor|robot|ai|crypto|encryption|wifi|bluetooth|browser|smartphone)\b", re.I)),
    (2, "World Geography", re.compile(r"\b(country|countries|capital|continent|ocean|river|mountain|island|desert|volcano|peninsula|strait|border|equator|hemisphere|latitude|longitude|glacier|canyon|lake|sea|waterfall|amazon|nile|everest|sahara|europe|asia|africa|antarctica|atlantic|pacific|mediterranean)\b", re.I)),
    (0, "World History", re.compile(r"\b(century|empire|war|battle|treaty|dynasty|king|queen|emperor|pharaoh|revolution|ancient|medieval|roman|ottoman|byzantine|napoleon|world war|cold war|colonial|independence|historic|historical|archaeology|civilization|constitution|founding)\b", re.I)),
    (7, "Nature & Biology", re.compile(r"\b(animal|mammal|bird|fish|reptile|amphibian|insect|spider|whale|shark|dolphin|dinosaur|plant|tree|flower|forest|ecosystem|photosynthesis|dna|gene|cell|organ|heart|brain|lung|blood|bone|muscle|bacteria|virus|species|habitat|predator|herbivore|evolution|ecology)\b", re.I)),
    (1, "Science & Space", re.compile(r"\b(atom|molecule|element|chemical|acid|gravity|force|energy|light|sound|wave|magnet|planet|star|galaxy|solar system|moon|sun|orbit|comet|asteroid|black hole|quantum|relativity|thermodynamics|velocity|mass|density|temperature|boiling|melting|electron|proton|neutron|telescope)\b", re.I)),
    (8, "Society & Law", re.compile(r"\b(law|legal|court|supreme court|parliament|senate|congress|president|prime minister|government|democracy|election|constitution|economy|economic|bank|currency|tax|inflation|treaty|united nations|nato|diplomacy|crime|rights|citizenship|psychology|sociology)\b", re.I)),
]


def classify_domain_by_text(text: str, default_dom: int, default_cat: str) -> tuple[int, str]:
    for dom, cat, pat in KEYWORD_DOMAIN_RULES:
        if pat.search(text):
            return (dom, cat)
    return (default_dom, default_cat)


def _fetch_hf_parquet_rows(dataset: str, config: str, splits: set[str]) -> list[dict[str, Any]]:
    import pyarrow.parquet as pq  # Local import so stdlib-only modes still run without pyarrow

    meta_url = f"https://datasets-server.huggingface.co/parquet?dataset={dataset}&config={config}"
    meta = http_get_json(meta_url, timeout=25, retries=3, base_sleep=2.0)
    rows: list[dict[str, Any]] = []
    for pf in meta.get("parquet_files", []):
        if pf.get("split") not in splits:
            continue
        url = pf["url"]
        req = urllib.request.Request(url, headers={"User-Agent": "WorldsSmartestFORGE/3.0"})
        with urllib.request.urlopen(req, timeout=45) as resp:
            buf = io.BytesIO(resp.read())
        tbl = pq.read_table(buf)
        rows.extend(tbl.to_pylist())
    return rows


def _clean_choice(opt: str) -> str:
    s = clean_text(opt)
    if not s:
        return ""
    s = s.replace("``", '"').replace("''", '"')
    # Strip trailing lone period from noun-phrase choices (keep abbreviations like U.S., Dr.)
    if s.endswith(".") and not s.endswith("...") and not ABBREV_END_RE.search(s):
        s = s[:-1].strip()
    # Fix common brand casing
    if s.lower() == "iphone":
        return "iPhone"
    if s.lower() == "ipad":
        return "iPad"
    # Capitalize first letter cleanly if choice starts with lowercase letter (not units like pH, mRNA, iOS, eBay)
    if len(s) >= 2 and s[0].islower() and not (s[1].isupper()):
        s = s[0].upper() + s[1:]
    elif len(s) == 1 and s.islower():
        s = s.upper()
    return s


def _edit_dist_le_1(a: str, b: str) -> bool:
    """Fast O(n) check for Levenshtein distance <= 1 (catches crowdworker typo duplicates like jewlery/jewelry)."""
    if a == b:
        return True
    la, lb = len(a), len(b)
    if abs(la - lb) > 1:
        return False
    if la == lb:
        diffs = sum(1 for x, y in zip(a, b) if x != y)
        return diffs <= 1
    if la > lb:
        a, b = b, a
    # la + 1 == lb
    i = j = diffs = 0
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            i += 1
            j += 1
        else:
            diffs += 1
            if diffs > 1:
                return False
            j += 1
    return True


def _restore_boolq_case(question: str, passage: str) -> str:
    """Capitalize BoolQ lowercase question cleanly using strictly mid-sentence proper nouns from its passage."""
    q = clean_text(question).rstrip("?").strip()
    if not q:
        return ""

    # Only collect words capitalized strictly AFTER a lowercase word (never sentence-initial words!)
    proper_map: dict[str, str] = {}
    for m in re.finditer(r"(?<=[a-z]\s)\b([A-Z][A-Za-z0-9'\-]+)\b", passage):
        w = m.group(1)
        lw = w.lower()
        # Skip generic nouns that only got capitalized inside multi-word titles unless matched as phrase
        if lw in ("minister", "president", "king", "queen", "street", "road", "river", "mountain", "lake", "ocean", "sea", "park", "island", "state", "city", "county", "war", "day", "night", "time", "house", "hall", "school", "university", "church", "bank", "court", "law", "act", "book", "film", "movie", "song", "game", "cup", "league", "series", "order", "party", "union", "republic", "empire", "kingdom", "termination"):
            continue
        if lw not in proper_map or (w.isupper() and len(w) <= 5):
            proper_map[lw] = w
    # Always preserve common acronyms / proper nouns / states / countries
    for w in (
        "USA", "US", "UK", "UN", "EU", "NASA", "NBA", "NFL", "MLB", "NHL", "FIFA", "DNA", "RNA", "CPU", "GPU",
        "HTTP", "HTML", "WWII", "WWI", "I", "Earth", "Moon", "Sun", "Mars", "Venus", "Jupiter", "Saturn",
        "English", "French", "Spanish", "German", "Chinese", "Japanese", "Italian", "Russian", "Arabic", "Greek",
        "Roman", "Latin", "American", "British", "Australian", "Canadian", "Indian", "African", "European", "Asian",
        "Christmas", "Easter", "Thanksgiving", "Halloween", "California", "Texas", "Florida", "Alaska", "Hawaii",
        "Canada", "Mexico", "China", "India", "Japan", "Russia", "France", "Germany", "Italy", "Spain", "Brazil",
        "Egypt", "Australia", "England", "Scotland", "Ireland", "Wales", "Panama", "Europe", "Asia", "Africa",
    ):
        proper_map[w.lower()] = w

    words = q.split(" ")
    out = []
    for idx, tok in enumerate(words):
        m = re.match(r"^([^A-Za-z0-9]*)([A-Za-z0-9'\-]+)([^A-Za-z0-9]*)$", tok)
        if m:
            pre, core, post = m.groups()
            lc = core.lower()
            if lc in proper_map:
                core = proper_map[lc]
            elif idx == 0:
                core = core[0].upper() + core[1:]
            out.append(f"{pre}{core}{post}")
        else:
            out.append(tok)
    res = " ".join(out)
    # Clean known multi-word proper titles
    for pat, repl in (
        (r"\bworld cup\b", "World Cup"),
        (r"\bsuper bowl\b", "Super Bowl"),
        (r"\bworld war\b", "World War"),
        (r"\bunited states\b", "United States"),
        (r"\bunited kingdom\b", "United Kingdom"),
        (r"\bnew york\b", "New York"),
        (r"\blos angeles\b", "Los Angeles"),
        (r"\bsan francisco\b", "San Francisco"),
        (r"\bsupreme court\b", "Supreme Court"),
        (r"\bwhite house\b", "White House"),
    ):
        res = re.sub(pat, repl, res, flags=re.I)
    if res and res[0].islower():
        res = res[0].upper() + res[1:]
    return res + "?"


def _clean_wikipedia_passage(passage: str) -> str:
    """Strip IPA pronunciation brackets, non-Latin script glosses, LaTeX quotes, and [1] refs."""
    s = clean_text(passage)
    s = s.replace("``", '"').replace("''", '"')
    def _strip_paren(m: re.Match[str]) -> str:
        inner = m.group(0)
        if "/" in inner or "listen" in inner.lower() or any(ord(ch) > 591 for ch in inner):
            return ""
        return inner
    s = re.sub(r"\([^()]{1,120}\)", _strip_paren, s)
    s = re.sub(r"\[\d+\]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([?,.;:!])", r"\1", s)
    return s


def _make_nonleaking_mc_clues(l1: str, ans: str, prompt: str) -> tuple[str, str]:
    words = ans.split()
    first_ch = ans[0].upper() if ans and ans[0].isalnum() else ""
    c0 = f"Topic sector: {l1}. Focus on the defining principle or verified fact."
    if ans.replace(".", "", 1).replace("-", "", 1).isdigit():
        c1 = f"The verified numeric answer contains {len(ans)} characters."
    elif first_ch and len(words) == 1:
        c1 = f"Single-word verified answer beginning with '{first_ch}' ({len(ans)} letters)."
    elif first_ch:
        c1 = f"{len(words)}-word verified answer beginning with the letter '{first_ch}'."
    else:
        c1 = f"Rule out decoys that conflict with established {l1.lower()} facts."
    return (c0[:90], c1[:80])


def ingest_tier1_hf_datasets(
    base_questions: list[dict[str, Any]],
    base_sources: Counter[str],
) -> tuple[list[dict[str, Any]], Counter[str], Counter[str]]:
    """
    Append 25,000–40,000+ commercial-safe human-written questions (MIT / Apache-2.0 / CC-BY-SA)
    from 6 HuggingFace Parquet datasets while preserving base_questions (1..4964) 100% intact.
    """
    print("[FORGE-TIER1] Ingesting 6 Commercial-Safe HuggingFace Datasets (MIT / Apache-2.0 / CC-BY-SA)...")
    questions = list(base_questions)
    source_counts = Counter(base_sources)
    reject_counts: Counter[str] = Counter()

    seen_prompts: set[str] = set()
    domain_tok_buckets: dict[int, list[set[str]]] = defaultdict(list)
    for q in questions:
        seen_prompts.add(normalize_text(q["prompt"]))
        toks = content_tokens(q["prompt"])
        if toks:
            domain_tok_buckets[int(q["l0Domain"])].append(toks)

    # Inverted index for fast O(1) near-duplicate lookup across 35,000+ items!
    inv_index: dict[tuple[int, str], list[int]] = defaultdict(list)
    all_tok_sets: list[set[str]] = []
    for q in questions:
        toks = content_tokens(q["prompt"])
        idx_id = len(all_tok_sets)
        all_tok_sets.append(toks)
        dom_i = int(q["l0Domain"])
        # Index up to 3 rarest-looking tokens (longest tokens)
        for tok in sorted(toks, key=len, reverse=True)[:3]:
            inv_index[(dom_i, tok)].append(idx_id)

    def is_dup_fast(dom: int, prompt: str, check_jaccard: bool = True) -> bool:
        np = normalize_text(prompt)
        if not np or np in seen_prompts:
            return True
        toks = content_tokens(prompt)
        if len(toks) < 2:
            return True
        if check_jaccard:
            cand_counts: Counter[int] = Counter()
            for tok in sorted(toks, key=len, reverse=True)[:4]:
                for cid in inv_index.get((dom, tok), ()):
                    cand_counts[cid] += 1
            for cid, shared in cand_counts.items():
                if shared < 2:
                    continue
                etoks = all_tok_sets[cid]
                if abs(len(toks) - len(etoks)) > 5:
                    continue
                inter = len(toks & etoks)
                union = len(toks | etoks)
                if union > 0 and inter / union >= 0.78:
                    return True
        return False

    def register_added(rec: dict[str, Any], src: str) -> None:
        np = normalize_text(rec["prompt"])
        seen_prompts.add(np)
        toks = content_tokens(rec["prompt"])
        idx_id = len(all_tok_sets)
        all_tok_sets.append(toks)
        dom_i = int(rec["l0Domain"])
        for tok in sorted(toks, key=len, reverse=True)[:3]:
            inv_index[(dom_i, tok)].append(idx_id)
        rec["qid"] = len(questions) + 1
        questions.append(rec)
        source_counts[src] += 1

    def try_add_mc(
        src: str,
        dom: int,
        l1: str,
        prompt_raw: str,
        ans_raw: str,
        dists_raw: list[str],
        irt_b: float,
        why_raw: str = "",
        check_jaccard: bool = True,
    ) -> bool:
        prompt = clean_text(prompt_raw).replace("``", '"').replace("''", '"')
        if prompt and prompt[0].islower():
            prompt = prompt[0].upper() + prompt[1:]
        if prompt and prompt[-1] not in "?.:!":
            prompt = prompt + "..."
        if not (15 <= len(prompt) <= 165) or has_dirty_artifacts(prompt) or has_unsafe_godot_glyph_or_latex(prompt) or prompt.count('"') % 2 == 1:
            reject_counts["hf_prompt_len_or_dirty"] += 1
            return False
        if re.match(r"^[^A-Za-z0-9\"'(]", prompt):
            reject_counts["hf_prompt_len_or_dirty"] += 1
            return False
        if HF_BAD_PROMPT_RE.search(prompt) or HF_BAD_CASE_RE.search(prompt) or TYPO_OR_SLOP_RE.search(prompt):
            reject_counts["hf_boilerplate"] += 1
            return False
        for pat in BANNED_PROMPT_PATTERNS:
            if pat.search(prompt):
                reject_counts["hf_banned"] += 1
                return False

        ans = _clean_choice(ans_raw)
        if not (1 <= len(ans) <= 38) or has_dirty_artifacts(ans) or HF_BAD_OPT_RE.search(ans):
            reject_counts["hf_bad_ans"] += 1
            return False

        # Reject if answer appears verbatim as a whole word in prompt (len >= 5)
        ans_norm = normalize_text(ans)
        p_norm = normalize_text(prompt)
        if len(ans_norm) >= 5 and contains_whole_phrase(p_norm, ans_norm):
            reject_counts["hf_ans_in_prompt"] += 1
            return False

        # Pick 3 cleanest distinct distractors (preferring closest length to ans for MMLU-Pro's 10 options!)
        clean_cands: list[str] = []
        seen_norms = [ans_norm]
        for raw_d in dists_raw:
            cd = _clean_choice(raw_d)
            if not (1 <= len(cd) <= 38) or has_dirty_artifacts(cd) or HF_BAD_OPT_RE.search(cd):
                continue
            nd = normalize_text(cd)
            if not nd or nd in seen_norms:
                continue
            # Reject 1-edit-distance typo duplicates (e.g. jewlery box vs jewelry box)
            if len(nd) >= 5 and any(_edit_dist_le_1(nd, prev) for prev in seen_norms if len(prev) >= 5):
                continue
            seen_norms.append(nd)
            clean_cands.append(cd)

        if len(clean_cands) < 3:
            reject_counts["hf_few_dists"] += 1
            return False

        # When >3 candidates exist (MMLU-Pro / CommonsenseQA), choose the 3 closest in length to answerCorrect
        if len(clean_cands) > 3:
            clean_cands.sort(key=lambda x: (abs(len(x) - len(ans)), x))
        chosen_dists = clean_cands[:3]

        if is_dup_fast(dom, prompt, check_jaccard=check_jaccard):
            reject_counts["hf_dup"] += 1
            return False

        c0, c1 = _make_nonleaking_mc_clues(l1, ans, prompt)
        if why_raw:
            why = trim_sentence(why_raw, 180, 20) or f"The verified answer is {ans} ({l1})."
        else:
            why = trim_sentence(f"Verified answer: {ans} ({l1}).", 180, 20) or f"The verified answer is {ans} in {l1}."
        if not SENTENCE_END_RE.search(why):
            why = why[:179].rstrip(",;: ") + "."
        if not SENTENCE_END_RE.search(c0):
            c0 = c0[:89].rstrip(",;: ") + "."
        if not SENTENCE_END_RE.search(c1):
            c1 = c1[:79].rstrip(",;: ") + "."

        plaus = [0.82, 0.68, 0.54]
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "regions": detect_regions(prompt, ans),
            "irtB": round(max(-2.0, min(2.8, irt_b)), 2),
            "archetype": "SIGHTLINE_LOCK",
            "prompt": prompt,
            "answerCorrect": ans,
            "distractors": [{"text": d, "plausibility": plaus[i]} for i, d in enumerate(chosen_dists)],
            "clues": [c0, c1],
            "whyExplanation": why,
        }
        if check_clue_leaks(rec, strict=True):
            # Fallback completely safe clues
            rec["clues"] = [
                f"Topic sector: {l1}. Compare each choice carefully.",
                f"Verify the exact definition or principle inside {l1}.",
            ]
            if check_clue_leaks(rec, strict=True):
                reject_counts["hf_clue_leak"] += 1
                return False
        if any(has_unsafe_godot_glyph_or_latex(s) for s in [rec["answerCorrect"], rec["whyExplanation"], *rec["clues"], *(d["text"] for d in rec["distractors"])]):
            reject_counts["hf_unsafe_glyph"] += 1
            return False

        register_added(rec, src)
        return True

    # NOTE: MTurk crowdworker benchmarks (commonsense_qa, openbookqa) are strictly excluded
    # per #105 QC audit so Tier-1 stays 100% factual standardized-exam & encyclopedic trivia!

    # ------------------------------------------------------------------
    # 1. allenai/ai2_arc (ARC-Easy + ARC-Challenge, Apache-2.0)
    # ------------------------------------------------------------------
    print("  [1/4] Loading allenai/ai2_arc (ARC-Easy + ARC-Challenge, Apache-2.0)...")
    for cfg, src_name, b_lo, b_span in (
        ("ARC-Easy", "AI2 ARC-Easy (Apache-2.0)", -1.35, 0.90),
        ("ARC-Challenge", "AI2 ARC-Challenge (Apache-2.0)", 0.05, 0.85),
    ):
        arc_rows = _fetch_hf_parquet_rows("allenai/ai2_arc", cfg, {"train", "validation", "test"})
        arc_added = 0
        for r in arc_rows:
            qtxt = clean_text(r.get("question", ""))
            ch = r.get("choices") or {}
            labels, texts = ch.get("label") or [], ch.get("text") or []
            akey = str(r.get("answerKey", ""))
            if akey not in labels:
                continue
            ai = labels.index(akey)
            dom, l1 = classify_domain_by_text(qtxt, 1, "Science Fundamentals")
            h = int(hashlib.md5(qtxt.encode("utf-8")).hexdigest()[:4], 16)
            irt_b = b_lo + ((h % 100) / 100.0) * b_span
            dists = [t for i, t in enumerate(texts) if i != ai]
            if try_add_mc(src_name, dom, l1, qtxt, texts[ai], dists, irt_b):
                arc_added += 1
        print(f"    -> Accepted {arc_added:,} verified {cfg} questions.")

    # ------------------------------------------------------------------
    # 2. cais/mmlu (MIT — 56 clean subjects, Medium/Hard +0.10..+1.60)
    # ------------------------------------------------------------------
    print("  [2/4] Loading cais/mmlu (MIT — 56 clean subjects)...")
    mmlu_rows = _fetch_hf_parquet_rows("cais/mmlu", "all", {"test", "validation", "dev"})
    mmlu_added = 0
    for r in mmlu_rows:
        subj = str(r.get("subject", "")).strip()
        if subj == "moral_scenarios" or subj not in MMLU_SUBJECT_MAP:
            continue
        dom, l1, base_b = MMLU_SUBJECT_MAP[subj]
        qtxt = clean_text(r.get("question", ""))
        choices = r.get("choices") or []
        try:
            ai = int(r.get("answer", -1))
        except (TypeError, ValueError):
            continue
        if not (0 <= ai < len(choices)):
            continue
        if subj == "miscellaneous":
            dom, l1 = classify_domain_by_text(qtxt, 8, "General Knowledge")
        h = int(hashlib.md5(qtxt.encode("utf-8")).hexdigest()[:4], 16)
        irt_b = max(0.10, min(1.60, base_b + ((h % 9) - 4) * 0.06))
        dists = [c for i, c in enumerate(choices) if i != ai]
        if try_add_mc("MMLU (MIT)", dom, l1, qtxt, choices[ai], dists, irt_b):
            mmlu_added += 1
    print(f"    -> Accepted {mmlu_added:,} verified MMLU questions.")

    # ------------------------------------------------------------------
    # 3. TIGER-Lab/MMLU-Pro (MIT — Championship Expert/Genius +1.50..+2.75)
    # ------------------------------------------------------------------
    print("  [3/4] Loading TIGER-Lab/MMLU-Pro (MIT — Expert/Genius)...")
    mpro_rows = _fetch_hf_parquet_rows("TIGER-Lab/MMLU-Pro", "default", {"test", "validation"})
    mpro_added = 0
    for r in mpro_rows:
        cat = str(r.get("category", "other")).lower().strip()
        dom, l1 = MMLU_PRO_CAT_MAP.get(cat, (8, "General Scholarship"))
        qtxt = clean_text(r.get("question", ""))
        opts = r.get("options") or []
        try:
            ai = int(r.get("answer_index", -1))
        except (TypeError, ValueError):
            continue
        if not (0 <= ai < len(opts)):
            continue
        if cat == "other":
            dom, l1 = classify_domain_by_text(qtxt, 8, "General Scholarship")
        h = int(hashlib.md5(qtxt.encode("utf-8")).hexdigest()[:4], 16)
        irt_b = 1.52 + ((h % 120) / 100.0)  # +1.52 .. +2.71
        dists = [o for i, o in enumerate(opts) if i != ai]
        if try_add_mc("MMLU-Pro (MIT)", dom, l1, qtxt, opts[ai], dists, irt_b):
            mpro_added += 1
    print(f"    -> Accepted {mpro_added:,} verified MMLU-Pro Expert/Genius questions.")

    # ------------------------------------------------------------------
    # 4. google/boolq (CC-BY-SA — Lightning True/False w/ Wikipedia whyExplanation)
    # ------------------------------------------------------------------
    print("  [4/4] Loading google/boolq (CC-BY-SA — Lightning True/False)...")
    bq_rows = _fetch_hf_parquet_rows("google/boolq", "default", {"train", "validation"})
    bq_added = 0
    bq_true = 0
    bq_false = 0
    bq_per_side_cap = 4000
    for r in bq_rows:
        if bq_added >= bq_per_side_cap * 2:
            break
        raw_q = clean_text(r.get("question", ""))
        raw_pass = str(r.get("passage", ""))
        ans_bool = r.get("answer")
        if not isinstance(ans_bool, bool):
            continue
        if ans_bool and bq_true >= bq_per_side_cap:
            continue
        if (not ans_bool) and bq_false >= bq_per_side_cap:
            continue
        if not (18 <= len(raw_q) <= 135) or BOOLQ_STALE_RE.search(raw_q) or HF_BAD_PROMPT_RE.search(raw_q):
            reject_counts["boolq_stale_or_bad"] += 1
            continue
        # Must start with clear auxiliary verb so it reads as a crisp True/False question
        if not re.match(r"^(is|are|was|were|do|does|did|can|has|have)\s+", raw_q, re.I):
            reject_counts["boolq_non_aux"] += 1
            continue

        prompt = _restore_boolq_case(raw_q, raw_pass)
        if not (18 <= len(prompt) <= 140) or has_dirty_artifacts(prompt) or TYPO_OR_SLOP_RE.search(prompt):
            reject_counts["boolq_dirty"] += 1
            continue

        clean_pass = _clean_wikipedia_passage(raw_pass)
        why_snip = trim_sentence(clean_pass, 158, 24)
        if not why_snip:
            reject_counts["boolq_no_why"] += 1
            continue
        verdict_word = "TRUE" if ans_bool else "FALSE"
        why = f"{verdict_word}: {why_snip}"
        if len(why) > 180:
            why = trim_sentence(why_snip, 180, 24) or why[:180]
        if not SENTENCE_END_RE.search(why):
            why = why[:179].rstrip(",;: ") + "."

        dom, l1 = classify_domain_by_text(f"{prompt} {clean_pass[:220]}", 8, "World Facts")
        if is_dup_fast(dom, prompt, check_jaccard=True):
            reject_counts["hf_dup"] += 1
            continue

        h = int(hashlib.md5(prompt.encode("utf-8")).hexdigest()[:4], 16)
        irt_b = round(-0.70 + ((h % 210) / 100.0), 2)  # -0.70 .. +1.39 (City 2 London -> City 7 Singapore)
        rec = {
            "qid": 0,
            "l0Domain": dom,
            "l1Category": l1,
            "regions": detect_regions(prompt, clean_pass[:160]),
            "irtB": irt_b,
            "archetype": "GAUNTLET_SHATTER",
            "prompt": prompt,
            "answerCorrect": verdict_word,
            "clues": [
                f"Lightning check ({l1}): verify the core factual relationship.",
                "Watch for subtle exceptions, naming mix-ups, or scope traps.",
            ],
            "whyExplanation": why,
            "gauntletExt": {
                "isTrue": ans_bool,
                "isTrick": False,
                "windowSec": 9,
            },
        }
        if any(has_unsafe_godot_glyph_or_latex(s) for s in [prompt, why]):
            reject_counts["boolq_unsafe_glyph"] += 1
            continue

        register_added(rec, "Google BoolQ (CC-BY-SA)")
        bq_added += 1
        if ans_bool:
            bq_true += 1
        else:
            bq_false += 1
    print(f"    -> Accepted {bq_added:,} verified BoolQ Lightning questions (True={bq_true:,}, False={bq_false:,}).")

    return questions, source_counts, reject_counts


def load_base_4964() -> tuple[list[dict[str, Any]], Counter[str]]:
    src_path = GODOT_OUT if GODOT_OUT.exists() else WEB_OUT
    with src_path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    qs = data.get("questions", [])
    base = [q for q in qs if isinstance(q.get("qid"), int) and 1 <= q["qid"] <= BASE_CORE_COUNT]
    base.sort(key=lambda x: x["qid"])
    if len(base) != BASE_CORE_COUNT:
        raise RuntimeError(f"Expected {BASE_CORE_COUNT} base questions (qid 1..{BASE_CORE_COUNT}), got {len(base)}")
    if base[0].get("answerCorrect") != "Red Cross" or base[3].get("heroRelicId") != "meridian_astrolabe":
        raise RuntimeError("Gold Core pinned QIDs 1..4 verification failed!")
    base_sources: Counter[str] = Counter()
    for q in base:
        if q["qid"] <= GOLD_COUNT:
            base_sources["Gold Core (Hand-Verified 1..832)"] += 1
        else:
            mt = str(q.get("microTopicId", ""))
            if mt.startswith("tapi_"):
                base_sources["The Trivia API v2"] += 1
            elif mt.startswith("otdb_"):
                base_sources["Open Trivia DB"] += 1
            elif mt.startswith("geo_"):
                base_sources["UN/ISO Countries + World Bank"] += 1
            elif mt.startswith("pt_"):
                base_sources["IUPAC Periodic Table"] += 1
            elif mt.startswith("nobel_"):
                base_sources["Nobel Prize API v2.1"] += 1
            else:
                base_sources["Verified Reference Datasets"] += 1
    return base, base_sources


def main() -> int:
    t0 = time.time()
    polish_only = "--polish-existing" in sys.argv[1:]
    tier1_hf = "--tier1-hf" in sys.argv[1:]
    print("=" * 76)
    print("WORLD'S SMARTEST — FORGE TIER-1 OPEN-KNOWLEDGE CATALOG EXPANSION PIPELINE")
    print("=" * 76)

    if polish_only:
        print("[FORGE] Running fast deterministic QC polish on existing live catalog (--polish-existing)...")
        questions, source_counts, reject_counts = polish_existing_catalog()
    elif tier1_hf:
        base_qs, base_srcs = load_base_4964()
        print(f"[FORGE] Preserved {len(base_qs):,} cleaned base questions (Gold 1..832 + #89 bank) intact.")
        questions, source_counts, reject_counts = ingest_tier1_hf_datasets(base_qs, base_srcs)
    else:
        gold = load_gold_core()
        print(f"[FORGE] Loaded {len(gold)} hand-verified Gold Core questions (QIDs 1..{GOLD_COUNT}) intact.")

        builder = CatalogBuilder(gold)

        # Execute all 5 open-knowledge & structured verification ingestors
        ingest_trivia_api(builder)
        ingest_opentdb(builder)
        ingest_countries_worldbank(builder)
        ingest_periodic_and_nobel(builder)
        ingest_verified_reference_datasets(builder)

        questions, source_counts, hf_rejects = ingest_tier1_hf_datasets(builder.questions, builder.source_counts)
        reject_counts = builder.reject_counts + hf_rejects

    # Guarantee strictly monotonic QIDs 1..N while keeping 1..832 untouched in position
    for idx, q in enumerate(questions):
        q["qid"] = idx + 1

    print("\n[FORGE] Running Strict FORGE Quality Gate across all questions...")
    errors, warnings, stats = validate_catalog(questions)

    print("\n" + "=" * 76)
    print("FORGE EXPANSION TELEMETRY REPORT (Schema v2.0.0)")
    print("=" * 76)
    print(f"Total Verified Questions : {len(questions):,}")
    print(f"Elapsed Pipeline Time    : {time.time() - t0:.1f}s")

    print("\nBy Source:")
    for src, cnt in source_counts.items():
        print(f"  {src:<36} : {cnt:>4}")

    print("\nBy Archetype (3D Prism Morph):")
    for arch, cnt in stats["byArchetype"].items():
        print(f"  {arch:<26} : {cnt:>4}")

    print("\nBy L0 Domain (0..11):")
    for d in range(12):
        cnt = stats["byDomain"][str(d)]
        mn = stats["domainMinB"][d]
        mx = stats["domainMaxB"][d]
        print(f"  {DOMAIN_NAMES[d]:<14} : {cnt:>4}   (irtB {mn:+.2f} .. {mx:+.2f})")

    print("\nBy Campaign Venue Region:")
    for reg, cnt in stats["byCountry"].items():
        print(f"  {reg:<8} : {cnt:>4}")

    print("\nFilter / Quality-Gate Actions (slop/dups/leaks/recalibrations):")
    for reason, cnt in reject_counts.most_common():
        print(f"  {reason:<30} : {cnt:>4}")

    if warnings:
        print(f"\nWarnings ({len(warnings)}):")
        for w in warnings[:15]:
            print(f"  [WARN] {w}")

    if errors:
        print(f"\nVALIDATION FAILED — {len(errors)} error(s):", file=sys.stderr)
        for e in errors[:40]:
            print(f"  [ERR] {e}", file=sys.stderr)
        return 1

    print("\n[PASS] 0 validation errors! Exporting compact Schema 2.0.0 JSON...")

    payload = {
        "schemaVersion": "2.0.0",
        "generatedAt": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "totalCount": len(questions),
        "counts": {
            "byDomain": stats["byDomain"],
            "byArchetype": stats["byArchetype"],
            "byCountry": stats["byCountry"],
            "bySource": dict(source_counts),
        },
        "questions": questions,
    }

    # Compact JSON + Level-9 RFC-1952 GZIP companion (for lean Godot Web .pck loading!)
    json_bytes = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    gz_bytes = gzip.compress(json_bytes, compresslevel=9, mtime=0)
    assert gzip.decompress(gz_bytes) == json_bytes, "GZIP round-trip verification failed!"

    godot_gz = GODOT_OUT.with_suffix(".json.gz")
    web_gz = WEB_OUT.with_suffix(".json.gz")

    GODOT_OUT.parent.mkdir(parents=True, exist_ok=True)
    WEB_OUT.parent.mkdir(parents=True, exist_ok=True)
    GODOT_OUT.write_bytes(json_bytes)
    WEB_OUT.write_bytes(json_bytes)
    godot_gz.write_bytes(gz_bytes)
    web_gz.write_bytes(gz_bytes)

    raw_mb = len(json_bytes) / (1024 * 1024)
    gz_mb = len(gz_bytes) / (1024 * 1024)
    print(f"Exported {len(questions):,} verified unique questions:")
    print(f"  Raw compact JSON  : {raw_mb:.2f} MB ({len(json_bytes):,} bytes)")
    print(f"  GZIP companion    : {gz_mb:.2f} MB ({len(gz_bytes):,} bytes)")
    print(f"  -> {GODOT_OUT}")
    print(f"  -> {godot_gz}")
    print(f"  -> {WEB_OUT}")
    print(f"  -> {web_gz}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
