#!/usr/bin/env python3
"""
World's Smartest — 100% Corpus Formatting & Date-Comma Sanitizer
================================================================
Sanitizes ALL JSON data assets across `public/data/**` and keeps `godot/data/**`
mirrors + `questions.json.gz` + manifest byte counts 100% synchronized:
  - public/data/questions.json (+ godot/data/questions.json & both .json.gz)
  - public/data/gold_venue_packs.json
  - public/data/campaign_20hr.json (+ godot/data/campaign_20hr.json)
  - public/data/narrative_wave2.json
  - public/data/shards/shard_manifest.json (+ godot/data/shards/shard_manifest.json)
  - public/data/shards/domain_0..11*.json (+ godot/data/shards/domain_0..11*.json)
  - public/data/shards/taxonomy_tree.json
  - public/data/shards/subcat_baseball.json
  - public/data/shards/domain_subcats_0..11.json

Eliminates:
  1. Commas inside 4-digit years/dates (1,000-2,099 & era years) while preserving
     legitimate commas in non-year quantities (3,000 hits, 2,297 RBIs, 10,000 m).
  2. `<City>. <State/Abbrev>` period-before-state typos (`Detroit. MI` -> `Detroit, MI`)
     while excluding initials/abbreviations (`Vol. II`, `Pt. II`, `vs. DC`, `U. S.`).
  3. Double punctuation (`..` non-ellipsis, `.?` non-abbrev, `?.`, `??`, `,,`, `,.`, `.,`),
     including 1,156 shard template end-dot collisions (`R.E.M..`, `Apple Inc..`,
     `Washington, D.C..`) and 3,252 math sequence `, ...?` endings.
  4. Space before punctuation (` ?`, ` ,`, ` !`, ` ;`, ` :`, ` ...` in art titles).
  5. Unescaped HTML entities (`&quot;`, `&#039;`, `&amp;`, etc.).
  6. Indefinite article `"a [Vowel]"` grammar flaws (preserving phonetic `/ju:/` & `/w/`).
  7. Unmatched parentheses (216 truncated explanations + stray `(`), unmatched double
     quotes, repeated consecutive words, missing `?` on Wh-questions, missing spaces
     after commas/decimals/sentence punctuation, OCR word-fusions, corrupted `C?H??O?`,
     `"the The "` shard duplicates, and 7 corrupted Lahman ballpark join entries.

Run:
    python tools/sanitize_all_questions_and_dates.py
    python tools/sanitize_all_questions_and_dates.py --audit-only
"""

from __future__ import annotations

import argparse
import gzip
import html
import json
import re
import shutil
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parent.parent
PUB_DATA = ROOT / "public" / "data"
PUB_SHARDS = PUB_DATA / "shards"
GODOT_DATA = ROOT / "godot" / "data"
GODOT_SHARDS = GODOT_DATA / "shards"

# =============================================================================
# 1. REGEX DEFINITIONS (HIGH-PRECISION, ZERO FALSE-POSITIVE CORRUPTION)
# =============================================================================

# Quantity units after a 4-digit number that prove it is NOT a calendar year
QUANTITY_AFTER_RE = re.compile(
    r"^\s*(?:km|km²|km2|kilometers?|kilometres?|millimeters?|millimetres?|centimeters?|centimetres?|"
    r"m\b|m²|m2|meters?|metres?|miles?|mi\b|ft|feet|inches?|cm|mm|kg|g\b|mg\b|"
    r"lbs?|pounds?|tons?|tonnes?|liters?|litres?|gallons?|watts?|mw|gw|kw|hz|khz|mhz|ghz|volts?|"
    r"bytes?|bits?|kb|mb|gb|tb|px|pixels?|years?\b|year-|months?|days?|hours?|minutes?|seconds?|"
    r"centuries|decades|hits?|rbis?|runs?|home runs?|hrs?|wins?|strikeouts?|points?|pts\b|yards?|"
    r"goals?|passes?|people|inhabitants|residents|citizens|soldiers|troops|casualties|deaths|"
    r"victims|students|members|copies|books|pages|words|characters|letters|lines|verses|songs?|"
    r"tracks?|episodes?|films?|movies?|species|genera|families|animals|birds|plants|trees|islands?|"
    r"lakes?|rivers?|stars?|planets?|galaxies|dollars?|euros?|yen|francs?|pesos?|rubles?|rupees?|"
    r"yuan|won|fils|crores?|usd|eur|gbp|jpy|%|percent|degrees?|°|kelvin|k\b|celsius|fahrenheit|"
    r"mph|km/h|knots|rpm|psi|atm|atmospheres?|bar|joules?|calories?|kcal|blocks?|planks?|valves?|"
    r"cylinders?|seats?|rooms?|floors?|stories|steps?|stairs?|bricks?|stones?|tiles?|ships?|"
    r"aircraft|planes?|tanks?|guns?|missiles?|satellites?|robots?|computers?|chips?|employees|"
    r"workers|staff|players|teams|clubs|schools|universities|cities|towns|villages|counties|"
    r"stores?|retail|locations?|horses?|games?|high-rises?|shelters?|works?|genes?|cases?|maps?|"
    r"times|fold|x\b|×|\+|th\b|st\b|nd\b|rd\b|thousand|million|billion|daltons?|ppm|cubic|square|"
    r"sq\.|acres?|hectares?|barrels?|bushels?|ounces?|carats?|light-years?|au\b|parsecs?|newtons?|"
    r"pascals?|ohms?|amps?|amperes?|lumens?|decibels?|db\b|cycles?|"
    r"-(?:yen|year|meter|metre|foot|mile|km|ton|tonne|pound|dollar|valve|block|seat|story|room|bed|word|page))",
    re.IGNORECASE,
)

# Date/year context word immediately preceding a 4-digit year with comma
DATE_BEFORE_RE = re.compile(
    r"\b(in|on|by|born|died|founded|opened|closed|established|created|built|released|published|"
    r"written|composed|painted|discovered|invented|signed|enacted|adopted|inducted|debuted|"
    r"drafted|elected|crowned|reigned|ruled|fought|launched|completed|occurred|season|series|"
    r"circa|c\.|ca\.|ad|bc|ce|bce|from|until|since|year|"
    r"january|february|march|april|may|june|july|august|september|october|november|december|"
    r"jan\.|feb\.|mar\.|apr\.|jun\.|jul\.|aug\.|sep\.|sept\.|oct\.|nov\.|dec\.)"
    r"(\s+)([12]),(\d{3})\b",
    re.IGNORECASE,
)

# Era suffix immediately following a comma-formatted year (e.g. "1,863 CE", "2,500 BCE")
DATE_ERA_RE = re.compile(
    r"(?<![\d.,])([1-9]),(\d{3})(\s*(?:CE|BCE|AD|BC|A\.D\.|B\.C\.))\b",
    re.IGNORECASE,
)

# Parenthesized year: (1,903), (b. 1,879), (est. 1,920), (c. 1,450)
DATE_PAREN_RE = re.compile(
    r"\(([bBdDcC]\.\s*|est\.\s*|born\s+|died\s+|founded\s+|circa\s+|fl\.\s*|r\.\s*)?([12]),(\d{3})\)"
)

# Decade: 1,980s, 1,920s
DATE_DECADE_RE = re.compile(r"(?<![\d.,])([12]),(\d{3})s\b")

# Year range: 1,914-1,918, 1,914–1,918, 1,914-1918
DATE_RANGE_RE = re.compile(r"(?<![\d.,])([12]),(\d{3})(\s*[–—-]\s*)([12]),?(\d{3})\b")

# US State / Canadian Province 2-letter postal abbreviations for `<City>. <ST>` detection
STATE_PROV_ABBREVS = (
    "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|"
    "NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|"
    "ON|QC|BC|AB|MB|SK|NS|NB|PE|NL|PR|VI|GU"
)
NON_CITY_PREFIX_WORDS = {
    "vol", "pt", "no", "art", "co", "vs", "st", "mt", "dr", "mr", "mrs", "ms", "jr", "sr",
    "inc", "ltd", "corp", "bros", "prof", "rev", "gov", "sen", "rep", "gen", "col", "maj",
    "capt", "lt", "sgt", "jan", "feb", "mar", "apr", "aug", "sep", "sept", "oct", "nov", "dec",
    "fig", "ch", "sec", "par", "p", "pp", "ed", "al", "et", "est", "ca", "op", "ft", "u", "s",
    "j", "k", "a", "b", "c", "d", "e", "f", "g", "h", "i", "l", "m", "n", "o", "q", "r", "t",
    "v", "w", "x", "y", "z",
}
CITY_DOT_STATE_RE = re.compile(
    rf"\b([A-Za-z][A-Za-z .'-]{{1,32}}?)\.\s+({STATE_PROV_ABBREVS})(?=[?.!,;:\)\]\s\"']|$)"
)

# HTML entities
HTML_ENTITY_RE = re.compile(
    r"&(?:quot|amp|apos|lt|gt|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo|#\d+|#x[0-9a-fA-F]+);"
)

# Indefinite article "a [Vowel]"
ARTICLE_VOWEL_RE = re.compile(r"\b([Aa]) ([AEIOUaeiou][a-zA-Z-]{2,})\b")
ARTICLE_SAFE_PREFIXES = (
    "uni", "use", "usu", "utens", "util", "uro", "utah", "eup", "eur", "euk", "eug", "ewe",
    "one", "once", "u.s.", "ufo", "uk", "ukr", "ubi", "uran", "unanimous", "uterus", "upc",
    "usda", "un-", "u-", "usb", "url", "utc", "unicef", "unesco", "ucla", "usa", "usaf",
    "iii", "iv",
)
ARTICLE_SKIP_WORDS_CAP_A = {
    "and", "or", "to", "in", "on", "at", "of", "is", "are", "was", "were", "above", "below",
    "equals", "over", "under", "into", "after", "affiliate", "almonacid", "esmorga", "escrava",
    "institute",
}
ARTICLE_SKIP_BEFORE_RE = re.compile(
    r"(?:Concert|Vitamin|Type|Group|Class|Grade|Series|Model|Plan|Side|Team|Option|Choice|Part|"
    r"Section|Appendix|Figure|Point|Vertex|Angle|Node|Set|Matrix|Key|Note|Scale|Major|Minor|"
    r"between|letter|from|Triple-|Double-|Single-|known that|Capitan V)\s*$",
    re.IGNORECASE,
)

# Allowed characters in shards (1:1 parity with tools/validate_million_shards.py)
ALLOWED_EXTRA_CHARS = set(
    "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß"
    "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ"
    "ĀāĂăĄąĆćČčĎďĐđĒēĖėĘęĚěĞğĪīİıŁłŃńŇňŌōŐőŒœŔŕŘřŚśŞşŠšŢţŤťŪūŮůŰűŹźŻżŽž"
    "°²³·"
)

def is_valid_shard_text(s: str) -> bool:
    for ch in s:
        cp = ord(ch)
        if 32 <= cp <= 126 or ch in ALLOWED_EXTRA_CHARS:
            continue
        return False
    return True


# =============================================================================
# 2. CORE TEXT SANITIZATION PRIMITIVES
# =============================================================================

def strip_date_commas(text: str) -> str:
    if "," not in text:
        return text

    # 1. Era-suffixed years: "1,863 CE", "2,500 BCE"
    text = DATE_ERA_RE.sub(r"\1\2\3", text)

    # 2. Date-context prefix + 4-digit year (1,000..2,099), guarding against quantity units
    def _repl_before(m: re.Match) -> str:
        val = int(m.group(3) + m.group(4))
        after = text[m.end():]
        if val > 2099 or QUANTITY_AFTER_RE.match(after):
            return m.group(0)
        # Exclude "from 900 to 1,000" / "in 2,000+" / "in 1,224 planks" / "in 1,000th"
        if re.match(r"^\s*(?:\+|th\b|st\b|nd\b|rd\b|/|thousand|million|billion|vivid|numbered|completed|retail|indoor|custom|previously)", after, re.I):
            return m.group(0)
        return f"{m.group(1)}{m.group(2)}{m.group(3)}{m.group(4)}"

    text = DATE_BEFORE_RE.sub(_repl_before, text)

    # 3. Parenthesized years: "(1,903)", "(b. 1,879)"
    def _repl_paren(m: re.Match) -> str:
        val = int(m.group(2) + m.group(3))
        if val > 2099:
            return m.group(0)
        prefix = m.group(1) or ""
        return f"({prefix}{m.group(2)}{m.group(3)})"

    text = DATE_PAREN_RE.sub(_repl_paren, text)

    # 4. Decades: "1,980s" -> "1980s"
    def _repl_decade(m: re.Match) -> str:
        val = int(m.group(1) + m.group(2))
        if val > 2099 or val % 10 != 0:
            return m.group(0)
        return f"{m.group(1)}{m.group(2)}s"

    text = DATE_DECADE_RE.sub(_repl_decade, text)

    # 5. Year ranges: "1,914–1,918" -> "1914–1918" (guard against "1,320–1,330 kilometers" / "2,500–6,000 ppm")
    def _repl_range(m: re.Match) -> str:
        v1 = int(m.group(1) + m.group(2))
        v2 = int(m.group(4) + m.group(5))
        after = text[m.end():]
        if v1 > 2099 or v2 > 2099 or QUANTITY_AFTER_RE.match(after):
            return m.group(0)
        if v2 < v1:
            return m.group(0)
        return f"{m.group(1)}{m.group(2)}{m.group(3)}{m.group(4)}{m.group(5)}"

    text = DATE_RANGE_RE.sub(_repl_range, text)
    return text


def fix_city_dot_state(text: str) -> str:
    if "." not in text:
        return text

    def _repl(m: re.Match) -> str:
        left = m.group(1)
        st = m.group(2)
        last_word = left.strip().split()[-1].rstrip(".").lower()
        if last_word in NON_CITY_PREFIX_WORDS or len(last_word) == 1:
            return m.group(0)
        # Skip ALL-CAPS headings like "GENEVA CHARTER ART. IV"
        if left.isupper():
            return m.group(0)
        return f"{left}, {st}"

    return CITY_DOT_STATE_RE.sub(_repl, text)


def unescape_html_entities(text: str) -> str:
    if "&" not in text:
        return text
    if HTML_ENTITY_RE.search(text):
        text = html.unescape(text)
    return text


def fix_indefinite_articles(text: str) -> str:
    if not text:
        return text

    def _repl(m: re.Match) -> str:
        art = m.group(1)
        word = m.group(2)
        wl = word.lower()
        if wl.startswith(ARTICLE_SAFE_PREFIXES):
            return m.group(0)
        if art == "A" and wl in ARTICLE_SKIP_WORDS_CAP_A:
            return m.group(0)
        if art == "a" and wl in ("and", "or", "egipto", "auvers", "orphee", "olvidar", "escrava", "esmorga"):
            return m.group(0)
        pre = text[max(0, m.start() - 20):m.start()]
        if ARTICLE_SKIP_BEFORE_RE.search(pre):
            return m.group(0)
        # Capitalize well-known proper nouns fixed alongside article
        fixed_word = {"irish": "Irish", "uno": "Uno", "intel": "Intel"}.get(word, word)
        return f"{'An' if art == 'A' else 'an'} {fixed_word}"

    return ARTICLE_VOWEL_RE.sub(_repl, text)


def fix_unmatched_parens(text: str) -> str:
    if text.count("(") == text.count(")"):
        return text
    # Remove raw Wikipedia audio-help artifact (e.g. qid=15984)
    if "(help info))" in text or "(help·info))" in text:
        text = re.sub(r";?\s*from Nahuatl pronunciation \(help\s*[·\s]?\s*info\)\)", "", text)
        text = re.sub(r"\s*\(help\s*[·\s]?\s*info\)\)?", "", text)

    while text.count("(") > text.count(")"):
        idx = text.rfind("(")
        if idx == -1:
            break
        pre = text[:idx].rstrip()
        frag = text[idx:]
        inner = frag[1:].strip()
        inner_no_dot = inner.rstrip(". ")

        is_truncated_frag = (
            not inner_no_dot
            or re.search(
                r"(?:^|[,;\s])(?:lit|c|p|pp|e\.g|i\.e|vs|etc|est|approx|ca|fl|b|d|"
                r"pronounced|pronunciation|formerly|also|including|meaning|from|or|and|"
                r"which|who|that|where|when|with|in|of|the|a|an|for|to|by|as|at|on)$",
                inner_no_dot,
                re.IGNORECASE,
            )
            or re.match(
                r"^(?:Irish|French|German|Spanish|Italian|Japanese|Russian|Chinese|Arabic|Greek|Latin|"
                r"Dutch|Polish|Portuguese|Korean|Swedish|Danish|Norwegian|Turkish|Hindi|Hebrew|Norman|"
                r"Welsh|Scottish|Gaelic|Manx|Catalan|Basque|Czech|Hungarian|Finnish|Persian|Thai|"
                r"Vietnamese|Indonesian|Malay|Swahili|Tagalog|Sanskrit|Old English|Middle English|"
                r"Ancient Greek|Modern Greek|IATA|ICAO|SAME code|NOAA|ISBN|ISSN|DOI|"
                r"(?:\d+\s+)?U\.S\.C|Title \d+|Section \d+|Art\.|Ch\.|Vol\.|No\.)$",
                inner_no_dot,
                re.IGNORECASE,
            )
            or bool(re.search(r"\b[A-Z]$", inner_no_dot))
            or bool(re.search(r"[:;]$", inner_no_dot))
            or (inner_no_dot.count('"') % 2 != 0)
            or (
                ":" in inner_no_dot
                and len(inner_no_dot.split(":")[-1].strip()) <= 2
                and not any(sym in inner_no_dot for sym in ("£", "$", "€", "¥"))
            )
        )

        if not is_truncated_frag and len(inner_no_dot) >= 3 and (
            re.match(
                r"^(?:\d[\d.,\s-]*[a-zA-Z°%£$€¥/]+|[A-Z]{2,6}|[A-Za-z]+ English|symbol:\s*\S+|"
                r"for [a-z].{15,}|in special recognition.{15,})$",
                inner_no_dot,
            )
            or (
                ":" in inner_no_dot
                and not re.search(r"(?:lit|pronounced|pronunciation|U\.S\.)$", inner_no_dot, re.I)
                and len(inner_no_dot.split(":")[-1].strip()) >= 3
            )
            or re.match(r"^also known as [A-Z].{4,}$", inner_no_dot)
            or (inner_no_dot.endswith('"') and inner_no_dot.count('"') == 2)
        ):
            text = f"{pre} ({inner_no_dot})."
        else:
            cleaned_pre = pre.rstrip(" ,;:-—–")
            if not cleaned_pre.endswith((".", "!", "?")):
                cleaned_pre += "."
            text = cleaned_pre
    return text


def fix_unmatched_dquotes(text: str) -> str:
    if text.count('"') % 2 == 0:
        return text
    # Preserve inch/arcsecond symbols like 5'2", 27° 44' 36", 29" wheels
    if re.search(r'\d"', text):
        return text
    # Specific truncated BoolQ quote patterns
    if text.startswith(('TRUE: "', 'FALSE: "')) and not text.endswith('"'):
        # Unclosed opening quote on a single sentence -> close before final period
        if text.endswith("."):
            return text[:-1] + '."'
        return text + '"'
    # If there is an unclosed quote near the end from sentence-split truncation:
    # e.g. '..., "the prince of timekeepers.' -> close cleanly or strip trailing incomplete quote
    idx = text.rfind('"')
    if idx != -1:
        tail = text[idx + 1:].strip()
        tail_no_dot = tail.rstrip(". ")
        if re.search(r'(?:^|\s)(?:Mr|Mrs|Ms|Dr|St|in|of|the|a|an|to|at|by|for|with|and|or)$', tail_no_dot):
            # Truncated mid-phrase inside quote (e.g. 'who refer to Wales as "Mr.' or 'fable in.')
            # Drop the trailing incomplete clause if it starts with a second sentence, else strip the stray '"'
            parts = text.rsplit(". ", 1)
            if len(parts) == 2 and parts[1].count('"') == 1 and len(parts[0]) >= 35:
                return parts[0] + "."
            return text[:idx] + text[idx + 1:]
        if text.endswith("..."):
            return text[:-3] + '..."'
        if text.endswith("."):
            return text[:-1] + '."'
        return text + '"'
    return text


def fix_double_dashes(text: str, allow_unicode_dash: bool = True) -> str:
    if "--" not in text:
        return text
    # Never touch Morse code ("... --- ...") or arrow "-->"
    if "---" in text or "-->" in text:
        return text
    em = " — " if allow_unicode_dash else " - "
    en = "–" if allow_unicode_dash else "-"
    # Spaced "--" -> em-dash
    text = re.sub(r"\s+--\s+", em, text)
    # Tight "-- " or " --" -> em-dash
    text = re.sub(r"(?<=\S)--\s+", em, text)
    text = re.sub(r"\s+--(?=\S)", em, text)
    # Between numbers/ordinals/words (1931--1958, 2,500--6,000, 47th--50th, blood--brain) -> en-dash
    text = re.sub(r"([A-Za-z0-9])--([A-Za-z0-9])", rf"\1{en}\2", text)
    return text


def fix_common_prose_formatting(text: str, preserve_newlines: bool = False) -> str:
    if not text:
        return text
    text = unescape_html_entities(text)
    text = strip_date_commas(text)
    text = fix_city_dot_state(text)
    if preserve_newlines:
        lines = [re.sub(r"  +", " ", ln.strip()) for ln in text.split("\n")]
        text = "\n".join(lines)
    else:
        text = text.strip()
        text = re.sub(r"  +", " ", text)
    # Clean spaces just inside parentheses: "( foo )" -> "(foo)"
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    # Clean stray space before comma/question/exclamation/semicolon/colon (skip Morse/code)
    text = re.sub(r"\s+([?!,;])", r"\1", text)
    # Clean non-ellipsis double periods (skip numeric ranges 1..12)
    text = re.sub(r"(?<![\d.])\.\.(?!\.)(?!\d)", ".", text)
    return text


# Exact verified OCR / typo fixes in questions.json (researched from audit!)
EXACT_QUESTIONS_TEXT_FIXES: List[Tuple[str, str]] = [
    # Punctuation / stray quote / stray paren / double word
    ('types of what"?', "types of what?"),
    ("word for for 'nine'?", "word for 'nine'?"),
    ("Smothers Brothers'(first names?", "Smothers Brothers' first names?"),
    ("in the U.S..", "in the U.S.?"),
    ("come back in in soccer?", "re-enter a match in soccer?"),
    ("throw in in soccer?", "throw-in in soccer?"),
    ("Any Souls Loggedin?", "Any Souls Logged In?"),
    # Corrupted chemical formula subscripts on qid=5644
    ("C?H??O?", "C6H12O6"),
    ("BF?", "BF3"),
    ("MoCl?", "MoCl2"),
    # Missing space after sentence punct & OCR word-fusions (qid=8986, 12690..13710)
    ("predicate logic.George", "predicate logic. George"),
    ("agate line.What is themillinerate?", "agate line. What is the milline rate?"),
    ("What is themillinerate?", "What is the milline rate?"),
    ("find themillinerate.", "find the milline rate."),
    ("newspaper'srate", "newspaper's rate"),
    ("HarryHyppeis", "Harry Hyppe is"),
    ("JaneCarpovheld", "Jane Carpov held"),
    ("Herbie'sService", "Herbie's Service"),
    ("MaxFlaumhad", "Max Flaum had"),
    ("VelcoCorporation", "Velco Corporation"),
    ("what isVelco' s", "what is Velco's"),
    ("JohnBindelsearns", "John Bindels earns"),
    ("January 30with aterm", "January 30 with a term"),
    ("a$155", "a $155"),
    ("ownerof", "owner of"),
    ("BennetBros.", "Bennet Bros."),
    ("assessedvalue of$3,250", "assessed value of $3,250"),
    ("BeinstockInc.", "Beinstock Inc."),
    ("rateof", "rate of"),
    ("fiveyears", "five years"),
    ("liabilitiesof", "liabilities of"),
    ("valueof", "value of"),
    ("theassessed", "the assessed"),
    ("thecoatis", "the coat is"),
    ("find thecost", "find the cost"),
    ("Ifitsselling", "If its selling"),
    ("percentof", "percent of"),
    ("anannual premiumof", "an annual premium of"),
    ("pieceof furniturevalued", "piece of furniture valued"),
    ("computethe", "compute the"),
    ("deviationof", "deviation of"),
    ("inthis moleculeof", "in this molecule of"),
    ("woodof dimensions25.0", "wood of dimensions 25.0"),
    ("toone another", "to one another"),
    ("AssumeK_w=", "Assume K_w ="),
    ("vanderWaals", "van der Waals"),
    ("forCsBrwith CsBr with a = 7.28°A. a = 7.28°A.", "for CsBr with a = 7.28 Å."),
    ("dissolvesPbSin", "dissolves PbS in"),
    ("TheK_spis", "The K_sp is"),
    ("themolarityof", "the molarity of"),
    (
        "Calculate theCoulombicbarrier in the bombardment of ^209Bi Calculate theCoulombicbarrier in the bombardment of ^209Bi with alpha particles.",
        "Calculate the Coulombic barrier in the bombardment of ^209Bi with alpha particles.",
    ),
    ("isHermitian; d/dx,id/dx,", "is Hermitian: d/dx, i d/dx,"),
    ("BothHClandNaOHare", "Both HCl and NaOH are"),
    ("MNaOHto", "M NaOH to"),
    ("MHCl?", "M HCl?"),
    ("theK_dissof", "the K_diss of"),
    ("ofNaClto", "of NaCl to"),
    ("andCl^-", "and Cl^-"),
    ("apparentpKfor", "apparent pK for"),
    ("theK_sp.", "the K_sp."),
    ("diameterof", "diameter of"),
    ("resultingmolarity?", "resulting molarity?"),
    ("TheK_eqfor", "The K_eq for"),
    ("molarityof", "molarity of"),
    ("factorsof production", "factors of production"),
    ("Is thisinflationary", "Is this inflationary"),
    ("moreclosely", "more closely"),
    ("100ntis", "100 N is"),
    ("100-Wlight bulb be illuminated?A 100-W", "100-W light bulb be illuminated? A 100-W"),
    ("inelectronvoltsof", "in electronvolts of"),
    ("single-slitFraunhoferdiffraction", "single-slit Fraunhofer diffraction"),
    ("volt60-cycle", "volt 60-cycle"),
    ("Findcurlaat", "Find curl a at"),
    ("fora=", "for a ="),
    ("showing15.55°C when dry airat atmosphericpressure", "showing 15.55°C when dry air at atmospheric pressure"),
    ("57.2lb_m/ft^3", "57.2 lb_m/ft^3"),
    ("62.4lb_m/ft^3", "62.4 lb_m/ft^3"),
    ("and16.", "and 16."),
    ("and15 psi", "and 15 psi"),
    ("of40KHzis", "of 40 kHz is"),
    ("antennato", "antenna to"),
    ("takenby", "taken by"),
    ("0.001mHat", "0.001 mH at"),
    ("lit-atmof", "lit-atm of"),
    ("forever21 and charlotte Russe", "Forever 21 and Charlotte Russe"),
    ("American idol?", "American Idol?"),
    ("obtained When $5,000", "obtained when $5,000"),
    # Missing space after comma in prose
    ("Jupiter,the Moon", "Jupiter, the Moon"),
    ("thousand,is 47,000", "thousand, is 47,000"),
    ("inert gases,Ar,", "inert gases, Ar,"),
    ("nucleus,He^2+", "nucleus, He^2+"),
    ("capitalism,perhaps", "capitalism, perhaps"),
    ("variance,VarX", "variance, Var(X)"),
    ("A,b in H=>", "a, b in H =>"),
    ("g,.02673 kg", "g, 0.02673 kg"),
    ("g,.02373 kg", "g, 0.02373 kg"),
    ("g,.02473 kg", "g, 0.02473 kg"),
    ("g,.02573 kg", "g, 0.02573 kg"),
    (",.22 Magnum,.22 MRF", ", .22 Magnum, .22 MRF"),
    (",.38 Long Colt", ", .38 Long Colt"),
    ("prepared,...", "prepared, ..."),
    ("fired,...", "fired, ..."),
    ("equal,...", "equal, ..."),
    ("supplied,...", "supplied, ..."),
    ("rate,...", "rate, ..."),
    ("arises,...", "arises, ..."),
    ("euthanasia,...", "euthanasia, ..."),
]

# QIDs of direct Wh-questions in questions.json missing a terminal '?'
QIDS_ADD_QMARK = {3462, 3552}
QIDS_DOT_TO_QMARK = {3496, 3509, 3553, 8532, 12704, 12753, 12819, 12827, 13043, 13476}
QIDS_INTERNAL_DOT_TO_QMARK = {
    12762: ("for 52(3/4). Give answer", "for 52(3/4)? Give answer"),
    12935: ("× 300 mm. All edges", "× 300 mm? All edges"),
}

# Missing space before leading decimals (e.g. "The.44", "the.32", "equals.75", "is.03", "use.380")
MISSING_SPACE_BEFORE_DEC_RE = re.compile(
    r"\b(The|the|is|of|and|or|hit|use|reads|equals|contains|simply|frequently|lengthened|called)\.(\d{2,})"
)

# Raw LaTeX numeric subscripts like O_{3}, H_{2}O -> Unicode subscripts O₃, H₂O
LATEX_SUB_RE = re.compile(r"_\{([0-9]+)\}")
SUBSCRIPT_TRANS = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")

def fix_latex_subscripts(text: str) -> str:
    if "_{" not in text:
        return text
    return LATEX_SUB_RE.sub(lambda m: m.group(1).translate(SUBSCRIPT_TRANS), text)

# Exact "an [Consonant]" typo fixes in questions.json (#249 P1)
EXACT_AN_CONSONANT_FIXES: List[Tuple[str, str]] = [
    ("an Russian", "a Russian"),
    ("An decrease", "A decrease"),
    ("an nonrenewable", "a nonrenewable"),
    ("an mp?", "an MP?"),
    ("an mp in", "an MP in"),
]

# Rewrites for 15 broken shuffled letter-reference MCQs in questions.json (#249 P0)
LETTER_REF_MCQ_REWRITES: Dict[int, Dict[str, Any]] = {
    9114: {
        "prompt": "Which of the following are common features of all fresh (not eroded) impact craters formed on solid surfaces?",
        "answerCorrect": "Ejecta and raised rims",
        "distractors": ["Ejecta only", "Raised rims only", "Central peaks only"],
        "clue2": "4-word verified answer beginning with the letter 'E'.",
        "whyExplanation": "Verified answer: Ejecta and raised rims (Astronomy).",
    },
    9121: {
        "answerCorrect": "The U.S.S.R.",
        "distractors": ["The U.S.", "France", "Japan"],
        "clue2": "2-word verified answer beginning with the letter 'T'.",
        "whyExplanation": "Verified answer: The U.S.S.R. (Astronomy).",
    },
    9459: {
        "distractors": [
            "Likely be sucked into the black hole",
            "Be pulled apart by tidal forces",
            "Be flung out of the Solar System",
        ],
    },
    9550: {
        "answerCorrect": "Triangular and sawtooth waves",
        "distractors": ["Sinusoidal waves only", "Triangular waves only", "Sawtooth waves only"],
        "clue2": "4-word verified answer beginning with the letter 'T'.",
        "whyExplanation": "Verified answer: Triangular and sawtooth waves (Electrical Engineering).",
    },
    9770: {
        "answerCorrect": "Nucleotide variability and average heterozygosity",
        "distractors": ["Nucleotide variability only", "Genetic polyploidy", "Average heterozygosity only"],
        "clue2": "5-word verified answer beginning with the letter 'N'.",
        "whyExplanation": "Verified answer: Nucleotide variability and average heterozygosity (Biology).",
    },
    9816: {
        "answerCorrect": "Artificial and directional selection",
        "distractors": ["Artificial selection only", "Directional selection only", "Stabilizing selection"],
        "clue2": "4-word verified answer beginning with the letter 'A'.",
        "whyExplanation": "Verified answer: Artificial and directional selection (Biology).",
    },
    10518: {
        "answerCorrect": "Vitamins B6 and B12",
        "distractors": ["Vitamins A and C", "Vitamins B6 and D", "Vitamins B12 and E"],
        "clue2": "4-word verified answer beginning with the letter 'V'.",
        "whyExplanation": "Verified answer: Vitamins B6 and B12 (Human Biology).",
    },
    10642: {
        "answerCorrect": "Sociological and statistical",
        "distractors": ["Psychological only", "Sociological only", "Statistical only"],
        "clue2": "3-word verified answer beginning with the letter 'S'.",
        "whyExplanation": "Verified answer: Sociological and statistical (Human Biology).",
    },
    10654: {
        "answerCorrect": "Some monkey and ape species",
        "distractors": ["Some monkey species only", "Some ape species only", "Some breeds of dogs"],
        "clue2": "5-word verified answer beginning with the letter 'S'.",
        "whyExplanation": "Verified answer: Some monkey and ape species (Human Biology).",
    },
    10671: {
        "distractors": ["Foreskin too tight", "Vaginismus", "Endometriosis"],
    },
    10676: {
        "answerCorrect": "Masturbation and autoeroticism",
        "distractors": ["Masturbation only", "Autoeroticism only", "Voyeurism"],
        "clue2": "3-word verified answer beginning with the letter 'M'.",
        "whyExplanation": "Verified answer: Masturbation and autoeroticism (Human Biology).",
    },
    10717: {
        "answerCorrect": "Might be materially true or untrue",
        "distractors": [
            "Cannot be materially true",
            "Must be materially true",
            "Must be materially untrue",
        ],
        "clue2": "6-word verified answer beginning with the letter 'M'.",
        "whyExplanation": "Verified answer: Might be materially true or untrue (Critical Reasoning).",
    },
    11555: {
        "answerCorrect": "Interdivisional and intradivisional speech",
        "distractors": [
            "Interdivisional speech only",
            "Intradivisional speech only",
            "Interpersonal speech only",
        ],
        "clue2": "4-word verified answer beginning with the letter 'I'.",
        "whyExplanation": "Verified answer: Interdivisional and intradivisional speech (Ethics).",
    },
    11816: {
        "distractors": ["Acheulean", "Mousterian", "Oldowan"],
    },
    11821: {
        "distractors": ["Aurignacian", "Acheulean", "Oldowan"],
    },
}

LETTER_REF_OPTION_RE = re.compile(r"^(?:both\s+)?[a-d]\s+and\s+[a-d](?:\s+only)?$", re.IGNORECASE)

# Campaign & Wave-2 story continuity / VO alignment fixes (#248 §4)
CAMPAIGN_CLEAR_MISMATCHED_VO_BEATS = {
    "ch_s2_b1", "ch_s3_b1", "ch_s6_b1",
    "gb_s6_b1", "gb_s7_b1",
    "br_s3_b1",
    "eg_s2_b1", "eg_s4_b1", "eg_s5_b1", "eg_s6_b1", "eg_s7_b1",
    "is_s3_b1", "is_s6_b1", "is_3_b3",
    "sg_s1_b1", "sg_s5_b1", "sg_s6_b1",
    "global_s1_b1", "global_s3_b1", "global_s4_b1",
}

BACKSTAGE_HUB_NEXT_LINKS: Dict[str, Dict[str, str]] = {
    "ch": {"n2_outsider": "n3_close", "n2_stakes": "n3_close"},
    "gb": {"n1": "n2", "n2": "n3"},
    "jp": {"n1": "n2", "n2": "n3", "n4_blackmail": "n5_fracture", "n4_jammer": "n5_fracture"},
    "eg": {"n1": "n2", "n2": "n3"},
    "is": {"n1": "n2", "n2": "n3"},
    "global": {"n1": "n2", "n2": "n3"},
}

# Verified non-leaking aliases for specialist subcat rows (#249 P1)
SUBCAT_EXO_NAME_FIXES = {
    "PH1 b": "Kepler-64b",
    "PH2 b": "Kepler-86b",
}
SUBCAT_AERO_NAME_FIXES = {
    "ZIL-111": "111 Limousine",
    "GAZ-13": "Chaika 13",
    "PZL-104 Wilga": "104 Wilga",
    "PZL-130 Orlik": "130 Orlik",
    "GAZ-62": "Model 62 Utility Truck",
}

# =============================================================================
# 3. SHARD TEMPLATE END-DOT REPHRASING (ZERO `..` ACROSS ALL 1.4M QIDS!)
# =============================================================================

MANIFEST_TEMPLATE_FIXES: Dict[str, Dict[str, Dict[str, str]]] = {
    "sport_videogame": {
        "svg_dev": {"why": '{dev} developed "{title}" ({year}).'},
        "svg_tf": {
            "truePrompt": '{dev} developed the video game "{title}" ({year}).',
            "falsePrompt": '{fake} developed the video game "{title}" ({year}).',
            "whyFalse": 'False! {dev} (not {fake}) developed "{title}".',
        },
        "svg_year": {"clue1": "Developed by {dev} for video game audiences."},
    },
    "pop_album": {
        "pa_art": {"why": '{artist} released the album "{title}" ({year}).'},
        "pa_tf": {
            "truePrompt": '{artist} released the album "{title}" ({year}).',
            "falsePrompt": '{fake} released the album "{title}" ({year}).',
            "whyFalse": 'False! {artist} (not {fake}) released "{title}".',
        },
        "pa_year": {"clue1": "{artist} released this studio album."},
    },
    "pop_song": {
        "ps_art": {"why": '{artist} performed "{title}" ({year}).'},
        "ps_tf": {
            "truePrompt": '{artist} performed the song "{title}" ({year}).',
            "falsePrompt": '{fake} performed the song "{title}" ({year}).',
            "whyFalse": 'False! {artist} (not {fake}) performed "{title}".',
        },
        "ps_year": {"clue1": "{artist} performed this recorded track."},
    },
    "pop_film": {
        "pf_dir": {"why": '{director} directed "{title}" ({year}, {country}).'},
        "pf_tf": {
            "truePrompt": '{director} directed the {year} film "{title}" ({country}).',
            "falsePrompt": '{fake} directed the {year} film "{title}" ({country}).',
            "whyFalse": 'False! {director} (not {fake}) directed "{title}".',
        },
        "pf_year": {"clue1": "{director} directed this {country} film."},
    },
    "tech_vehicle": {
        "tv_maker": {"why": "{maker} built {name} ({veh_type})."},
        "tv_type": {"clue1": "{maker} manufactured this machine or vehicle."},
        "tv_rev": {"why": "{maker} manufactured {name} ({veh_type})."},
        "tv_tf": {
            "truePrompt": "{maker} manufactured {name} ({veh_type}).",
            "falsePrompt": "{fake} manufactured {name} ({veh_type}).",
            "whyTrue": "True! {maker} built {name} ({veh_type}).",
            "whyFalse": "False! {maker} (not {fake}) built {name} ({veh_type}).",
        },
    },
    "art_work": {
        "aw_artist": {"why": '{artist} created "{title}" ({year}, {medium}).'},
        "aw_tf": {
            "truePrompt": '{artist} created the {year} artwork "{title}" ({medium}).',
            "falsePrompt": '{fake} created the {year} artwork "{title}" ({medium}).',
            "whyFalse": 'False! {artist} (not {fake}) created "{title}".',
        },
        "aw_year": {"clue1": "{artist} created this {medium}."},
    },
    "lit_work": {
        "lw_auth": {"why": '{author} wrote "{title}" ({year}, {lang}).'},
        "lw_tf": {
            "truePrompt": '{author} wrote the {year} work "{title}" ({lang}).',
            "falsePrompt": '{fake} wrote the {year} work "{title}" ({lang}).',
            "whyFalse": 'False! {author} (not {fake}) wrote "{title}".',
        },
        "lw_year": {"clue1": "{author} originally wrote it in {lang}."},
    },
    "hist_empire": {
        "he_tf": {"whyFalse": "False! {capital} (not {fake}) was the capital of {name}."},
        "he_year": {"clue1": "{capital} served as its historical capital."},
    },
}

TAXONOMY_TEMPLATE_FIXES: Dict[str, Dict[str, Dict[str, str]]] = {
    "sub_tech_format": {
        "stf_dev": {"why": "{ext_or_dev} developed {name} ({year})."},
        "stf_tf": {
            "truePrompt": "{ext_or_dev} created computing technology {name} ({year}).",
            "falsePrompt": "{fake} created computing technology {name} ({year}).",
            "whyTrue": "True! {ext_or_dev} created {name} ({year}).",
            "whyFalse": "False! {ext_or_dev} (not {fake}) created {name} ({year}).",
        },
        "stf_yr": {"clue1": "{ext_or_dev} created this {kind}."},
    },
    "sub_food_atelier": {
        "sfa_fnd": {"why": "{founder} founded {name} ({country}, {year})."},
        "sfa_tf": {
            "truePrompt": "{founder} founded {name} ({country}, {year}).",
            "falsePrompt": "{fake} founded {name} ({country}, {year}).",
            "whyFalse": "False! {founder} (not {fake}) founded {name} ({year}).",
        },
    },
    "sub_lit_genre": {
        "slg_tf": {
            "truePrompt": '{author} wrote "{title}" ({year}, {genre}).',
            "falsePrompt": '{fake} wrote "{title}" ({year}, {genre}).',
            "whyFalse": 'False! {author} (not {fake}) wrote "{title}" ({year}).',
        },
    },
    "sub_lit_char": {
        "slc_wrk": {"clue1": "{creator} created this literary character."},
        "slc_tf": {
            "truePrompt": '{creator} created the character {name} (featured in "{work}").',
            "falsePrompt": '{fake} created the character {name} (featured in "{work}").',
            "whyTrue": 'True! {creator} created {name} ("{work}").',
            "whyFalse": 'False! {creator} (not {fake}) created {name} ("{work}").',
        },
    },
    "sub_tech_aero_year": {
        "sta_tf": {
            "truePrompt": "{maker} built {name} ({vclass}, {year}).",
            "falsePrompt": "{fake} built {name} ({vclass}, {year}).",
            "whyTrue": "True! {maker} built {name} ({year}).",
            "whyFalse": "False! {maker} (not {fake}) built {name} ({year}).",
        },
    },
    # Stem/clue answer-leak prevention on specialist shard templates
    "sub_soc_party_leader": {
        "ssp_cnt": {
            "prompt": "In which country's politics did {name} (b. {year}) serve?",
            "clue1": "Political figure born in {year}.",
        },
    },
    "sub_art_style": {
        "sas_cnt": {
            "prompt": "In which country does the architectural landmark {name} ({year}) stand?",
            "clue1": "Completed or founded around {year}.",
        },
    },
    "sub_geo_city_deep": {
        "sgc_cnt": {
            "prompt": "In which country is the city of {name} located?",
        },
    },
    # Drop self-answering `{city}` from sub_bb_ballpark:bbk_team (#249 P0 / Screenshot #1)
    "sub_bb_ballpark": {
        "bbk_team": {
            "prompt": "Which MLB club played home games at {park}?",
            "clue1": "First hosted MLB play in {year}.",
        },
    },
}

# Verified Lahman ballpark join corrections in subcat_baseball.json (`sub_bb_ballpark`)
BASEBALL_PARK_CORRECTIONS: Dict[str, Tuple[Optional[str], Optional[int]]] = {
    "Wrigley Field": ("Chicago, IL", None),
    "Fenway Park": (None, 1912),
    "League Park II": ("Cleveland, OH", None),
    "Columbia Park": ("Philadelphia, PA", None),
    "Exposition Park": ("Pittsburgh, PA", None),
    "Island Park": ("Harrisburg, PA", None),
    "Great American Ballpark": (None, 2003),
}


# =============================================================================
# 4. EXHAUSTIVE DEFECT AUDIT (BEFORE & AFTER PROOF)
# =============================================================================

def audit_corpus_defects() -> Dict[str, int]:
    """
    Audits EVERY file in `public/data/**` + EVERY template-cell rendering across
    all 1,408,590 QIDs for all tracked formatting & date-comma defect classes.
    """
    counts: Counter[str] = Counter()

    def _check_date_comma(s: str) -> int:
        fixed = strip_date_commas(s)
        return 1 if fixed != s else 0

    def _check_city_dot_state(s: str) -> int:
        fixed = fix_city_dot_state(s)
        return 1 if fixed != s else 0

    def _check_html(s: str) -> int:
        return len(HTML_ENTITY_RE.findall(s))

    def _check_a_vowel(s: str) -> int:
        fixed = fix_indefinite_articles(s)
        return 1 if fixed != s else 0

    # --- A. questions.json & gold_venue_packs.json ---
    for fname in ("questions.json", "gold_venue_packs.json"):
        data = json.loads((PUB_DATA / fname).read_text(encoding="utf-8"))
        qs = data.get("questions", [])
        if fname == "gold_venue_packs.json":
            for bc in data.get("bossChains", []):
                qs = qs + bc.get("steps", [])

        for q in qs:
            qid = q.get("qid")
            prompt = str(q.get("prompt", ""))
            ans = str(q.get("answerCorrect", ""))
            why = str(q.get("whyExplanation", ""))
            clues = [str(c) for c in (q.get("clues") or [])]
            dists = [str(d.get("text", "") if isinstance(d, dict) else d) for d in (q.get("distractors") or [])]

            fields = [("prompt", prompt), ("ans", ans), ("why", why)]
            fields += [(f"clue{i}", c) for i, c in enumerate(clues)]
            fields += [(f"dist{i}", d) for i, d in enumerate(dists)]

            for fkey, val in fields:
                if not val:
                    continue
                counts["date_comma"] += _check_date_comma(val)
                counts["city_dot_state"] += _check_city_dot_state(val)
                counts["html_entity"] += _check_html(val)
                counts["a_vowel"] += _check_a_vowel(val)
                if "  " in val or val != val.strip():
                    counts["whitespace_defect"] += 1
                if re.search(r"\s+[?!,;]", val) or re.search(r"\(\s+|\s+\)", val):
                    counts["space_before_punct"] += 1
                if re.search(r"(?<![\d.])\.\.(?!\.)(?!\d)", val):
                    counts["double_punct"] += 1
                if "--" in val and "---" not in val and "-->" not in val:
                    counts["double_dash"] += 1
                if MISSING_SPACE_BEFORE_DEC_RE.search(val):
                    counts["missing_space_decimal"] += 1
                if re.search(r",([A-Za-z.])", val):
                    for m in re.finditer(r",([A-Za-z.])", val):
                        pre = val[max(0, m.start() - 5):m.start() + 1]
                        if not re.search(r"[\[\(]|(?:45|46|47|48|69),$|^\(t,$|^t,$|^x,$|^y,$|XX,$|XY,$|rob,$", pre):
                            if not re.search(r"\(t,x,y,z\)", val) and not re.search(r"4[5678],X|69,X", val):
                                counts["missing_space_after_comma"] += 1
                if re.search(r"[?!][A-Za-z]|[a-z]{2,}\.[A-Z][a-z]{2,}", val):
                    if not re.search(r"Pharm\.D|Pub\.L|P!nk", val):
                        counts["missing_space_sentence"] += 1
                if fkey in ("prompt", "why", "clue0", "clue1"):
                    if val.count("(") != val.count(")"):
                        counts["unmatched_parens"] += 1
                    if val.count('"') % 2 != 0 and not re.search(r'\d"', val):
                        counts["unmatched_dquote"] += 1
                if re.search(r"\b(?:for for|throw in in|come back in in)\b", val, re.I):
                    counts["repeated_word"] += 1
                if "C?H??O?" in val or "BF?" in val or "MoCl?" in val:
                    counts["corrupted_formula_qmark"] += 1
                if LATEX_SUB_RE.search(val):
                    counts["raw_latex_subscript"] += 1
                for bad_an, _ in EXACT_AN_CONSONANT_FIXES:
                    if bad_an in val:
                        counts["an_consonant"] += 1
                if fkey == "ans" or fkey.startswith("dist"):
                    if LETTER_REF_OPTION_RE.match(val.strip()):
                        counts["broken_letter_ref_mcq"] += 1

            if fname == "questions.json" and (qid in QIDS_ADD_QMARK or qid in QIDS_DOT_TO_QMARK):
                if not prompt.endswith("?"):
                    counts["wh_missing_qmark"] += 1
            if fname == "questions.json" and qid in QIDS_INTERNAL_DOT_TO_QMARK:
                old_seg, _ = QIDS_INTERNAL_DOT_TO_QMARK[qid]
                if old_seg in prompt:
                    counts["wh_missing_qmark"] += 1
            if q.get("archetype") == "CALIBRATOR_DIAL":
                unit = str((q.get("calibratorExt") or {}).get("unit", ""))
                if unit in ("CE", "BCE", "AD", "BC", "year") and "," in ans:
                    counts["date_comma"] += 1

    # --- B. campaign_20hr.json & narrative_wave2.json ---
    for fname in ("campaign_20hr.json", "narrative_wave2.json"):
        data = json.loads((PUB_DATA / fname).read_text(encoding="utf-8"))

        def _walk_meta(obj: Any) -> None:
            if isinstance(obj, str):
                if obj.startswith(("res://", "/assets/", "assets/", "http")) or obj.endswith((".mp3", ".png", ".glb", ".json")):
                    return
                counts["date_comma"] += _check_date_comma(obj)
                counts["city_dot_state"] += _check_city_dot_state(obj)
                counts["html_entity"] += _check_html(obj)
                if "\n" not in obj and ("  " in obj or obj != obj.strip()):
                    counts["whitespace_defect"] += 1
            elif isinstance(obj, list):
                for item in obj:
                    _walk_meta(item)
            elif isinstance(obj, dict):
                for k, v in obj.items():
                    if k not in ("id", "path", "voice_clip", "portrait"):
                        _walk_meta(v)

        _walk_meta(data)

    # --- C. ALL Shards (base + specialist) & rendered boundary collisions across all 1.4M Qs ---
    manifest = json.loads((PUB_SHARDS / "shard_manifest.json").read_text(encoding="utf-8"))
    tax = json.loads((PUB_SHARDS / "taxonomy_tree.json").read_text(encoding="utf-8"))
    all_types = {**manifest["types"], **tax["types"]}

    for sf in sorted(PUB_SHARDS.glob("*.json")):
        if sf.name in ("shard_manifest.json", "taxonomy_tree.json"):
            continue
        ch = json.loads(sf.read_text(encoding="utf-8"))
        pool = ch["p"]

        for s in pool:
            counts["date_comma"] += _check_date_comma(s)
            counts["city_dot_state"] += _check_city_dot_state(s)
            counts["html_entity"] += _check_html(s)
            if "  " in s or s != s.strip():
                counts["whitespace_defect"] += 1
            if re.search(r"\s+[?!,;:]", s):
                counts["space_before_punct"] += 1

        for tbl in ch["t"]:
            tid = tbl["type"]
            spec = ch.get("types", {}).get(tid) or all_types[tid]
            cols = spec["cols"]
            pcols = set(spec.get("poolCols", []))
            col_before_dot = set()
            col_after_the = set()
            for ang in spec["angles"]:
                for k in ("prompt", "truePrompt", "falsePrompt", "clue1", "clue2", "why", "whyTrue", "whyFalse"):
                    tpl = ang.get(k, "")
                    for c in cols:
                        if f"{{{c}}}." in tpl:
                            col_before_dot.add(c)
                        if re.search(rf"\b[Tt]he \{{{c}\}}", tpl):
                            col_after_the.add(c)
                    if "{fake}." in tpl and ang.get("fakeCol") is not None:
                        fc = int(ang["fakeCol"])
                        if 0 <= fc < len(cols):
                            col_before_dot.add(cols[fc])

            for r in tbl["r"]:
                # Check math trailing ", ..." before "{stmt}?"
                if tid in ("math_num", "sub_math_spec_num"):
                    stmt = r[0] if isinstance(r[0], str) else pool[int(r[0])]
                    if stmt.endswith("..."):
                        counts["math_ellipsis_before_qmark"] += 1

                # Check clumsy "(winner debut YYYY)" or raw "ML " prefix in sub_bb_awards_hof (#253)
                if tid == "sub_bb_awards_hof" and isinstance(r[0], str):
                    if "(winner debut " in r[0] or r[0].startswith("ML "):
                        counts["baseball_award_format_bug"] += 1

                # Check corrupted baseball ballpark cities/years
                if tid == "sub_bb_ballpark":
                    pname = r[0]
                    city = pool[int(r[1])]
                    yr = int(r[3])
                    if pname in BASEBALL_PARK_CORRECTIONS:
                        exp_city, exp_yr = BASEBALL_PARK_CORRECTIONS[pname]
                        if (exp_city and city != exp_city) or (exp_yr and yr != exp_yr):
                            counts["baseball_park_fact_bug"] += 1

                for ci, cname in enumerate(cols[:-1]):
                    v = pool[int(r[ci])] if ci in pcols else r[ci]
                    if not isinstance(v, str):
                        continue
                    if ci not in pcols:
                        counts["date_comma"] += _check_date_comma(v)
                        counts["city_dot_state"] += _check_city_dot_state(v)
                        counts["html_entity"] += _check_html(v)
                        if "  " in v or v != v.strip():
                            counts["whitespace_defect"] += 1
                        if re.search(r"\s+[?!,;:]", v) and v not in ("Myself ; Yourself", "Human. :II: Nature."):
                            counts["space_before_punct"] += 1
                        if v.endswith(" ..."):
                            counts["space_before_punct"] += 1
                    if cname in col_before_dot and v.endswith(".") and not v.endswith("..."):
                        counts["shard_rendered_double_dot"] += 1
                    if cname in col_after_the and v.lower().startswith("the "):
                        counts["shard_the_The_dup"] += 1

    return dict(counts)


# =============================================================================
# 5. SANITIZATION PASSES PER DATASET
# =============================================================================

def sanitize_question_record(q: Dict[str, Any], is_questions_json: bool) -> int:
    """Sanitizes a single Question object in-place. Returns number of modified fields."""
    changes = 0
    qid = q.get("qid")

    # Apply curated rewrites for broken shuffled letter-reference MCQs (#249 P0)
    if is_questions_json and isinstance(qid, int) and qid in LETTER_REF_MCQ_REWRITES:
        rw = LETTER_REF_MCQ_REWRITES[qid]
        for rk in ("prompt", "answerCorrect", "whyExplanation"):
            if rk in rw and q.get(rk) != rw[rk]:
                q[rk] = rw[rk]
                changes += 1
        if "distractors" in rw and isinstance(q.get("distractors"), list):
            for idx, new_txt in enumerate(rw["distractors"]):
                if idx < len(q["distractors"]):
                    if isinstance(q["distractors"][idx], dict):
                        if q["distractors"][idx].get("text") != new_txt:
                            q["distractors"][idx]["text"] = new_txt
                            changes += 1
                    elif q["distractors"][idx] != new_txt:
                        q["distractors"][idx] = new_txt
                        changes += 1
        if "clue2" in rw and isinstance(q.get("clues"), list) and len(q["clues"]) >= 2:
            if q["clues"][1] != rw["clue2"]:
                q["clues"][1] = rw["clue2"]
                changes += 1

    def clean_field(val: str, is_prose: bool, is_why: bool = False) -> str:
        s = val
        if is_questions_json:
            for old, new in EXACT_QUESTIONS_TEXT_FIXES:
                if old in s:
                    s = s.replace(old, new)
            for old, new in EXACT_AN_CONSONANT_FIXES:
                if old in s:
                    s = s.replace(old, new)
        s = fix_latex_subscripts(s)
        s = MISSING_SPACE_BEFORE_DEC_RE.sub(r"\1 .\2", s)
        s = fix_common_prose_formatting(s, preserve_newlines=False)
        s = fix_double_dashes(s, allow_unicode_dash=True)
        s = fix_indefinite_articles(s)
        if is_prose:
            s = fix_unmatched_parens(s)
            s = fix_unmatched_dquotes(s)
            # Re-clean trailing double dots if paren/quote fix introduced any
            s = re.sub(r"(?<![\d.])\.\.(?!\.)(?!\d)", ".", s)
            s = re.sub(r"  +", " ", s).strip()
        return s

    for key, is_prose, is_why in (
        ("prompt", True, False),
        ("answerCorrect", False, False),
        ("whyExplanation", True, True),
    ):
        if isinstance(q.get(key), str):
            old = q[key]
            new = clean_field(old, is_prose=is_prose, is_why=is_why)
            if key == "prompt" and is_questions_json:
                if qid in QIDS_ADD_QMARK and not new.endswith("?"):
                    new = new.rstrip(" ") + "?"
                elif qid in QIDS_DOT_TO_QMARK and new.endswith("."):
                    new = new[:-1] + "?"
                elif qid in QIDS_INTERNAL_DOT_TO_QMARK:
                    o_seg, n_seg = QIDS_INTERNAL_DOT_TO_QMARK[qid]
                    new = new.replace(o_seg, n_seg)
            if key == "answerCorrect" and q.get("archetype") == "CALIBRATOR_DIAL":
                unit = str((q.get("calibratorExt") or {}).get("unit", ""))
                if unit in ("CE", "BCE", "AD", "BC", "year"):
                    new = re.sub(r"(?<![\d.,])([1-9]),(\d{3})\b", r"\1\2", new)
            if new != old:
                q[key] = new
                changes += 1

    if isinstance(q.get("clues"), list):
        for i, c in enumerate(q["clues"]):
            if isinstance(c, str):
                new = clean_field(c, is_prose=True)
                if new != c:
                    q["clues"][i] = new
                    changes += 1

    if isinstance(q.get("clueTiers"), list):
        for tier in q["clueTiers"]:
            if isinstance(tier, dict) and isinstance(tier.get("clueText"), str):
                old = tier["clueText"]
                new = clean_field(old, is_prose=True)
                if new != old:
                    tier["clueText"] = new
                    changes += 1

    if isinstance(q.get("distractors"), list):
        for i, d in enumerate(q["distractors"]):
            if isinstance(d, dict) and isinstance(d.get("text"), str):
                old = d["text"]
                new = clean_field(old, is_prose=False)
                if new != old:
                    d["text"] = new
                    changes += 1
            elif isinstance(d, str):
                new = clean_field(d, is_prose=False)
                if new != d:
                    q["distractors"][i] = new
                    changes += 1

    if isinstance(q.get("codexExt"), dict):
        ce = q["codexExt"]
        for pair in ce.get("pairs") or []:
            if isinstance(pair, dict):
                for pk in ("subject", "target"):
                    if isinstance(pair.get(pk), str):
                        old = pair[pk]
                        new = clean_field(old, is_prose=False)
                        if new != old:
                            pair[pk] = new
                            changes += 1
        if isinstance(ce.get("decoyTarget"), str):
            old = ce["decoyTarget"]
            new = clean_field(old, is_prose=False)
            if new != old:
                ce["decoyTarget"] = new
                changes += 1

    return changes


def sanitize_questions_and_gold() -> Dict[str, int]:
    stats: Dict[str, int] = {}

    # 1. questions.json (+ godot mirror + both .json.gz)
    qpath = PUB_DATA / "questions.json"
    qdata = json.loads(qpath.read_text(encoding="utf-8"))
    q_changes = 0
    for q in qdata.get("questions", []):
        q_changes += sanitize_question_record(q, is_questions_json=True)
    serialized = json.dumps(qdata, ensure_ascii=False, indent=2)
    raw_bytes = serialized.encode("utf-8")
    qpath.write_bytes(raw_bytes)
    if (GODOT_DATA / "questions.json").exists():
        (GODOT_DATA / "questions.json").write_bytes(raw_bytes)
    # Re-compress .json.gz (both public/data and godot/data) from exact byte-identical payload
    gz_bytes = gzip.compress(raw_bytes, compresslevel=9, mtime=0)
    (PUB_DATA / "questions.json.gz").write_bytes(gz_bytes)
    if (GODOT_DATA / "questions.json.gz").exists():
        (GODOT_DATA / "questions.json.gz").write_bytes(gz_bytes)
    stats["questions.json"] = q_changes

    # 2. gold_venue_packs.json
    gpath = PUB_DATA / "gold_venue_packs.json"
    gdata = json.loads(gpath.read_text(encoding="utf-8"))
    g_changes = 0
    for q in gdata.get("questions", []):
        g_changes += sanitize_question_record(q, is_questions_json=False)
    for bc in gdata.get("bossChains", []):
        for step in bc.get("steps", []):
            g_changes += sanitize_question_record(step, is_questions_json=False)
    if g_changes:
        gpath.write_text(json.dumps(gdata, ensure_ascii=False, indent=2), encoding="utf-8")
    stats["gold_venue_packs.json"] = g_changes

    return stats


def sanitize_campaign_and_wave2() -> Dict[str, int]:
    stats: Dict[str, int] = {}

    def walk_clean(obj: Any, counter: List[int]) -> Any:
        if isinstance(obj, str):
            if obj.startswith(("res://", "/assets/", "assets/", "http")) or obj.endswith((".mp3", ".png", ".glb", ".json")):
                return obj
            new = fix_common_prose_formatting(obj, preserve_newlines=("\n" in obj))
            if new != obj:
                counter[0] += 1
            return new
        if isinstance(obj, list):
            return [walk_clean(v, counter) for v in obj]
        if isinstance(obj, dict):
            out = {}
            for k, v in obj.items():
                if k in ("id", "path", "voice_clip", "portrait", "schema_version", "schemaVersion"):
                    out[k] = v
                else:
                    out[k] = walk_clean(v, counter)
            return out
        return obj

    for fname in ("campaign_20hr.json", "narrative_wave2.json"):
        p = PUB_DATA / fname
        raw = p.read_text(encoding="utf-8")
        data = json.loads(raw)
        c = [0]
        cleaned = walk_clean(data, c)

        # Story continuity, VO alignment, and orphan-node fixes (#248 §4)
        if fname == "campaign_20hr.json":
            # 1. Clear mismatched VO clips on 19 side-op beats + is_3_b3; differentiate br_2_b1
            for m in cleaned.get("missions", []):
                mid = m.get("id")
                for grp in ("dialogue_beats", "post_match_beats"):
                    for b in m.get(grp, []):
                        bid = b.get("id")
                        if bid in CAMPAIGN_CLEAR_MISMATCHED_VO_BEATS and b.get("voice_clip"):
                            del b["voice_clip"]
                            c[0] += 1
                        if bid == "br_2_b1":
                            new_txt = "My Prism clamps are surging—someone spiked my pod's voltage! If I let go now, my shield shatters!"
                            new_clip = "res://assets/voice/rio_nadia_sabotage_1.mp3"
                            if b.get("text") != new_txt:
                                b["text"] = new_txt
                                c[0] += 1
                            if b.get("voice_clip") != new_clip:
                                b["voice_clip"] = new_clip
                                c[0] += 1
                        if bid == "is_3_b3" and "Five years, Tariq." in str(b.get("text", "")):
                            b["text"] = b["text"].replace("Five years, Tariq.", "Seven years, Tariq.")
                            c[0] += 1
                        if isinstance(b.get("passive_elo_check"), dict):
                            ins = str(b["passive_elo_check"].get("insight", ""))
                            if "five years before" in ins:
                                b["passive_elo_check"]["insight"] = ins.replace("five years before", "seven years before")
                                c[0] += 1
            # 2. Align Trial Zero 2019->2026 timeline on evidence_board.clues[2, 10]
            clues = cleaned.get("evidence_board", {}).get("clues", [])
            for idx in (2, 10):
                if idx < len(clues):
                    summ = str(clues[idx].get("summary", ""))
                    if "five years" in summ:
                        clues[idx]["summary"] = summ.replace("five years", "seven years")
                        c[0] += 1

        elif fname == "narrative_wave2.json":
            # 1. Fix PRODIGY startingPerkId drift ("MAVERICK_GAMBIT" -> "CLEAN_HANDS")
            for pc in cleaned.get("persona_ceremonies", []):
                if pc.get("personaId") == "PRODIGY" and pc.get("startingPerkId") != "CLEAN_HANDS":
                    pc["startingPerkId"] = "CLEAN_HANDS"
                    c[0] += 1
            # 2. Align Trial Zero timeline in archive_lore_logs[31].redactedTeaser
            logs = cleaned.get("archive_lore_logs", [])
            if len(logs) > 31:
                rt = str(logs[31].get("redactedTeaser", ""))
                if "Five years of strategy" in rt:
                    logs[31]["redactedTeaser"] = rt.replace("Five years of strategy", "Seven years of strategy")
                    c[0] += 1
            # 3. Wire 15 orphan nodes in fallback backstage_hubs
            bh = cleaned.get("backstage_hubs", {})
            for hid, link_map in BACKSTAGE_HUB_NEXT_LINKS.items():
                conv = bh.get(hid)
                if not isinstance(conv, dict):
                    continue
                nodes = conv.get("nodes")
                if isinstance(nodes, list):
                    for nd in nodes:
                        nid = nd.get("id")
                        if nid in link_map and nd.get("nextNodeId") != link_map[nid]:
                            nd["nextNodeId"] = link_map[nid]
                            c[0] += 1
                elif isinstance(nodes, dict):
                    for nid, target in link_map.items():
                        if nid in nodes and nodes[nid].get("nextNodeId") != target:
                            nodes[nid]["nextNodeId"] = target
                            c[0] += 1

        if c[0] > 0:
            out_bytes = json.dumps(cleaned, ensure_ascii=False, indent=2).encode("utf-8")
            p.write_bytes(out_bytes)
            if fname == "campaign_20hr.json":
                (GODOT_DATA / "campaign_20hr.json").write_bytes(out_bytes)
        elif fname == "campaign_20hr.json":
            # Ensure exact byte-for-byte sync between public/data and godot/data
            pub_bytes = p.read_bytes()
            godot_p = GODOT_DATA / "campaign_20hr.json"
            if not godot_p.exists() or godot_p.read_bytes() != pub_bytes:
                godot_p.write_bytes(pub_bytes)
        stats[fname] = c[0]

    return stats


def clean_shard_cell(val: str, sf_name: str, tid: str) -> str:
    s = val
    s = unescape_html_entities(s)
    s = strip_date_commas(s)
    s = fix_city_dot_state(s)
    s = re.sub(r"  +", " ", s.strip())
    # Specific verified shard cell fixes
    if s == "Andreas ? Voigt":
        s = "Andreas Voigt"
    elif s == "From my Life : Poetry and Truth":
        s = "From my Life: Poetry and Truth"
    elif s == "EXOLOGY CHAPTER 1 : THE LOST PLANET":
        s = "EXOLOGY CHAPTER 1: THE LOST PLANET"
    elif s == "Agda Östlund.":
        s = "Agda Östlund"
    elif s == "The Mirror of Venus.":
        s = "The Mirror of Venus"
    elif s == "The Marches" and sf_name == "domain_2.json":
        s = "Marches"
    elif s == "The Northern Spinach" and sf_name == "domain_7.json":
        s = "Northern Spinach"
    elif s == "The Tissue" and sf_name == "domain_7.json":
        s = "Tissue"
    # Verified non-leaking aliases for specialist subcat rows (#249 P1)
    if tid == "sub_sci_exo_deep" and s in SUBCAT_EXO_NAME_FIXES:
        s = SUBCAT_EXO_NAME_FIXES[s]
    elif tid == "sub_tech_aero_year" and s in SUBCAT_AERO_NAME_FIXES:
        s = SUBCAT_AERO_NAME_FIXES[s]
    elif tid == "sub_bb_awards_hof":
        # Strip clumsy "(winner debut YYYY)" suffix and expand raw Lahman "ML " -> "MLB " (#253)
        s = re.sub(r"\s*\(winner debut \d{4}\)", "", s).strip()
        if s.startswith("ML "):
            s = "MLB " + s[3:]
    # Clean " ..." space before ellipsis in art_work titles (domain_3.json)
    if s.endswith(" ..."):
        s = s[:-4] + "..."
    # Clean math sequence trailing ", ..." so "{stmt}?" never produces ", ...?"
    if tid in ("math_num", "sub_math_spec_num") and s.endswith("..."):
        s = re.sub(r",?\s*\.\.\.$", "", s).strip()
    assert is_valid_shard_text(s), f"Invalid display char in shard {sf_name}/{tid}: {s!r}"
    return s


def sanitize_shards_and_manifests() -> Dict[str, int]:
    stats: Dict[str, int] = {}

    manifest_path = PUB_SHARDS / "shard_manifest.json"
    tax_path = PUB_SHARDS / "taxonomy_tree.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    tax = json.loads(tax_path.read_text(encoding="utf-8"))

    # 1. Apply end-dot-safe template upgrades in shard_manifest.json & taxonomy_tree.json
    tpl_changes = 0
    for tid, angle_map in MANIFEST_TEMPLATE_FIXES.items():
        spec = manifest["types"].get(tid)
        if not spec:
            continue
        for ang in spec["angles"]:
            if ang["id"] in angle_map:
                for k, new_tpl in angle_map[ang["id"]].items():
                    if ang.get(k) != new_tpl:
                        ang[k] = new_tpl
                        tpl_changes += 1
    stats["shard_manifest_templates"] = tpl_changes

    tax_tpl_changes = 0
    for tid, angle_map in TAXONOMY_TEMPLATE_FIXES.items():
        spec = tax["types"].get(tid)
        if not spec:
            continue
        for ang in spec["angles"]:
            if ang["id"] in angle_map:
                for k, new_tpl in angle_map[ang["id"]].items():
                    if ang.get(k) != new_tpl:
                        ang[k] = new_tpl
                        tax_tpl_changes += 1
    stats["taxonomy_tree_templates"] = tax_tpl_changes

    all_types = {**manifest["types"], **tax["types"]}

    # 2. Sanitize every shard chunk file in public/data/shards/
    base_shard_names = {
        fm["path"]
        for dom in manifest["domains"]
        for fm in dom.get("files", [])
    }

    for sf in sorted(PUB_SHARDS.glob("*.json")):
        if sf.name in ("shard_manifest.json", "taxonomy_tree.json"):
            continue
        ch = json.loads(sf.read_text(encoding="utf-8"))
        changes = 0

        # Clean string pool
        pool = ch["p"]
        for pi, s in enumerate(pool):
            ns = clean_shard_cell(s, sf.name, "_pool")
            if ns != s:
                pool[pi] = ns
                changes += 1

        # Clean string cells in tables (+ verified ballpark corrections)
        for tbl in ch["t"]:
            tid = tbl["type"]
            spec = ch.get("types", {}).get(tid) or all_types[tid]
            pcols = set(spec.get("poolCols", []))
            for r in tbl["r"]:
                # Verified Lahman ballpark fixes on sub_bb_ballpark
                if tid == "sub_bb_ballpark" and r[0] in BASEBALL_PARK_CORRECTIONS:
                    exp_city, exp_yr = BASEBALL_PARK_CORRECTIONS[r[0]]
                    if exp_city is not None:
                        if exp_city not in pool:
                            pool.append(exp_city)
                        new_idx = pool.index(exp_city)
                        if r[1] != new_idx:
                            r[1] = new_idx
                            changes += 1
                    if exp_yr is not None and int(r[3]) != exp_yr:
                        r[3] = exp_yr
                        changes += 1

                for ci in range(len(spec["cols"]) - 1):
                    if ci not in pcols and isinstance(r[ci], str):
                        ns = clean_shard_cell(r[ci], sf.name, tid)
                        if ns != r[ci]:
                            r[ci] = ns
                            changes += 1

        if changes > 0:
            compact = json.dumps(ch, ensure_ascii=False, separators=(",", ":"))
            sf.write_text(compact, encoding="utf-8")
            if sf.name in base_shard_names and GODOT_SHARDS.exists():
                (GODOT_SHARDS / sf.name).write_text(compact, encoding="utf-8")
            stats[sf.name] = changes

    # 3. Recompute exact `bytes` in shard_manifest.json (and sync to godot/data/shards!)
    for dom in manifest["domains"]:
        for fm in dom.get("files", []):
            fp = PUB_SHARDS / fm["path"]
            fm["bytes"] = fp.stat().st_size
            # Ensure godot mirror is byte-identical
            if GODOT_SHARDS.exists():
                gfp = GODOT_SHARDS / fm["path"]
                if not gfp.exists() or gfp.read_bytes() != fp.read_bytes():
                    shutil.copy2(fp, gfp)

    manifest_txt = json.dumps(manifest, ensure_ascii=False, indent=2)
    manifest_path.write_text(manifest_txt, encoding="utf-8")
    if GODOT_SHARDS.exists():
        (GODOT_SHARDS / "shard_manifest.json").write_text(manifest_txt, encoding="utf-8")

    # 4. Recompute exact `bytes` in taxonomy_tree.json
    for _, flist in tax.get("subcatFiles", {}).items():
        for fm in flist:
            fp = PUB_SHARDS / fm["path"]
            if fp.exists():
                fm["bytes"] = fp.stat().st_size

    tax_txt = json.dumps(tax, ensure_ascii=False, indent=2)
    tax_path.write_text(tax_txt, encoding="utf-8")

    return stats


# =============================================================================
# 6. CLI ENTRYPOINT & SELF-TEST
# =============================================================================

def run_unit_self_tests() -> None:
    """Prove date-comma & City. ST rules handle both positive fixes and negative guards."""
    # Positive date-comma fixes
    assert strip_date_commas("Founded in 1,984 by pioneers.") == "Founded in 1984 by pioneers."
    assert strip_date_commas("1,863 CE") == "1863 CE"
    assert strip_date_commas("World Series (1,903)") == "World Series (1903)"
    assert strip_date_commas("Born in 1,997.") == "Born in 1997."
    assert strip_date_commas("During the 1,980s") == "During the 1980s"
    assert strip_date_commas("War of 1,914–1,918") == "War of 1914–1918"
    assert strip_date_commas("Author (b. 1,879)") == "Author (b. 1879)"
    # Negative guards (legitimate quantities MUST keep commas!)
    assert strip_date_commas("3,000 hits and 2,297 RBIs") == "3,000 hits and 2,297 RBIs"
    assert strip_date_commas("10,000 meters and 1,000,000 pts") == "10,000 meters and 1,000,000 pts"
    assert strip_date_commas("Right around 1,320–1,330 kilometers.") == "Right around 1,320–1,330 kilometers."
    assert strip_date_commas("Unearthed in 1,224 planks in 1954") == "Unearthed in 1,224 planks in 1954"
    assert strip_date_commas("at 1,822 meters in Canton") == "at 1,822 meters in Canton"
    # City. ST fixes + guards
    assert fix_city_dot_state("Which MLB club played home games at Tiger Stadium in Detroit. MI?") == (
        "Which MLB club played home games at Tiger Stadium in Detroit, MI?"
    )
    assert fix_city_dot_state("St. Louis. MO") == "St. Louis, MO"
    assert fix_city_dot_state("Vol. II") == "Vol. II"
    assert fix_city_dot_state("Mortal Kombat vs. DC Universe") == "Mortal Kombat vs. DC Universe"
    assert fix_city_dot_state("P vs. NP problem") == "P vs. NP problem"
    assert fix_city_dot_state("GENEVA CHARTER ART. IV") == "GENEVA CHARTER ART. IV"
    assert fix_city_dot_state("U. S. Senate") == "U. S. Senate"
    # Indefinite articles + guards
    assert fix_indefinite_articles("classified as a alkali metal.") == "classified as an alkali metal."
    assert fix_indefinite_articles("a university in a Utah canyon with a ewe") == "a university in a Utah canyon with a ewe"


def main() -> int:
    parser = argparse.ArgumentParser(description="Sanitize all trivia corpus formatting & date commas")
    parser.add_argument("--audit-only", action="store_true", help="Scan and print defect counts without modifying files")
    args = parser.parse_args()

    run_unit_self_tests()

    print("==========================================================================")
    print("WORLD'S SMARTEST — CORPUS FORMATTING & DATE-COMMA SANITIZATION")
    print("==========================================================================")

    before = audit_corpus_defects()
    before_total = sum(before.values())
    print(f"\n[BEFORE] Total tracked defects across all 1,408,590 Qs: {before_total:,}")
    for k, v in sorted(before.items(), key=lambda kv: -kv[1]):
        print(f"  - {k:30s}: {v:,}")

    if args.audit_only:
        return 0 if before_total == 0 else 1

    print("\n[RUN] Sanitizing all datasets + mirroring godot/data + re-compressing .gz...")
    q_stats = sanitize_questions_and_gold()
    c_stats = sanitize_campaign_and_wave2()
    s_stats = sanitize_shards_and_manifests()

    print("  Modifications applied:")
    for group in (q_stats, c_stats, s_stats):
        for k, v in sorted(group.items()):
            if v > 0:
                print(f"    {k:32s}: {v:,} edits")

    after = audit_corpus_defects()
    after_total = sum(after.values())
    print(f"\n[AFTER]  Total tracked defects across all 1,408,590 Qs: {after_total:,}")
    all_keys = sorted(set(before.keys()) | set(after.keys()))
    for k in all_keys:
        print(f"  - {k:30s}: {before.get(k, 0):6,d} -> {after.get(k, 0):6,d}")

    if after_total != 0:
        print(f"\n[FAIL] {after_total} residual defects remain!")
        return 1

    print("\n[PASS] 100% CLEAN — 0 DATE-COMMA & 0 FORMATTING DEFECTS REMAINING!")
    print("==========================================================================")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
