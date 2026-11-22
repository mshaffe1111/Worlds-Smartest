#!/usr/bin/env python3
"""
World's Smartest — Tier-1 (`questions.json`) & Gold Venue Packs (`gold_venue_packs.json`)
Deterministic Editorial Jeopardy/Meridian Stem, Clue & Explanation Upgrader + Verifier
=======================================================================================

Upgrades dry, repetitive, quiz-bowl/database stems, truncated sentence fragments,
raw search-query Gauntlet items, overlong (>185 char) Gold Venue prompts, and generic
fallback `clues` / `whyExplanation` boilerplate across ALL 12 domains (`0..11`) while:
  - Preserving 100% factual truth, `qid`, `l0Domain`, `l1Category`, `archetype`,
    `answerCorrect`, `distractors`, `calibratorExt`, `codexExt`, `gauntletExt`,
    `heroRelicId`, and calibrated numerical values.
  - Enforcing strict <= 185-char prompt ceiling across all 20,165 + 712 items
    (0px portrait mobile HUD overlap).
  - Enforcing strict zero-defect QA parity with `tools/qa/rt_dates_and_copy_audit.mjs`
    and `tools/sanitize_all_questions_and_dates.py` (0 date commas, 0 "City. ST" typos,
    0 answer leaks, 0 article errors, 0 double punctuation/spaces/words, 0 broken
    letter-ref regressions).
  - Keeping `public/data/questions.json`, `public/data/questions.json.gz`,
    `godot/data/questions.json`, and `godot/data/questions.json.gz` 100% MD5/byte synced!

Usage:
    python tools/upgrade_tier1_jeopardy_stems.py
    python tools/upgrade_tier1_jeopardy_stems.py --verify
    python tools/upgrade_tier1_jeopardy_stems.py --samples-out <path>
"""

from __future__ import annotations

import argparse
import copy
import gzip
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Set, Tuple

ROOT = Path(__file__).resolve().parent.parent
PUB_DATA = ROOT / "public" / "data"
GODOT_DATA = ROOT / "godot" / "data"

MAX_PROMPT_LEN = 185

DOMAIN_NAMES: Dict[int, str] = {
    0: "World History",
    1: "Science & Space",
    2: "Geography & Wonders",
    3: "Arts & Architecture",
    4: "Film, Music & Pop",
    5: "Sports & Games",
    6: "Tech & Computing",
    7: "Nature & Biology",
    8: "Society & Law",
    9: "Food, Craft & Design",
    10: "Myth & Literature",
    11: "Logic & Math",
}

# QIDs that MUST end with '?' per tools/sanitize_all_questions_and_dates.py
MUST_END_QMARK_QIDS: Set[int] = {
    3462, 3552, 3496, 3509, 3553, 8532, 12704, 12753, 12819, 12827, 13043, 13476,
}

# Protected canonical QIDs (explicitly asserted in live QA harnesses / reference prompts)
PROTECTED_PROMPT_QIDS: Set[int] = {
    4, 16,
    # MMLU business_ethics numeric-list items whose options are "1,4" etc.
    9151, 9153, 9155, 9156, 9157, 12364, 12365,
}

# =============================================================================
# 1. AUDIT & SANITIZATION PRIMITIVES (1:1 PARITY WITH rt_dates_and_copy_audit.mjs)
# =============================================================================

US_CA_STATE_CODES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC", "ON", "QC", "BC", "AB", "MB", "SK", "NS", "NB", "NL", "PE",
}
AMBIGUOUS_STATE_WORDS = {
    "IN", "ME", "OR", "OH", "OK", "HI", "ON", "LA", "DE", "PA", "MA",
    "AL", "CO", "NO", "ID", "MS", "MT", "NE", "UT", "VA", "WA",
}
ABBREV_BEFORE_PERIOD = {
    "st", "mt", "ft", "dr", "mr", "mrs", "ms", "jr", "sr", "no", "vs", "prof",
    "rev", "gen", "col", "capt", "lt", "sgt", "gov", "sen", "rep", "pres", "hon",
    "vol", "ch", "fig", "ed", "inc", "corp", "ltd", "co", "etc", "est", "ca",
    "approx", "dept", "univ", "assn", "intl", "natl", "jan", "feb", "mar", "apr",
    "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec", "bros", "e.g", "i.e",
    "b", "d", "c", "fl", "r", "p", "pp", "u", "a", "e", "i", "o", "k", "j", "h",
    "w", "m", "n", "s", "t", "v", "g", "f", "l", "q", "x", "y", "z",
}

RE_YEAR_PROMPT_CUE = re.compile(
    r"\b(what year|which year|in what year|when was|when did|born|died|founded|"
    r"opened|inducted|established|debuted|world series|season|released in|"
    r"published in|fought in|signed|calendar year|exact year|pinpoint the year|"
    r"dial in the exact year|calibrate the year|year ce|year bce)\b",
    re.I,
)
RE_YEAR_UNIT = re.compile(r"^(?:ce|bce|ad|bc|c\.e\.|b\.c\.e\.|a\.d\.|b\.c\.|year|yr)$", re.I)

NON_YEAR_AFTER_NUM = re.compile(
    r"^(?:,\d{3}|\+|\s*[–-]\s*[\d,]+\s*(?:km|kilometers?|miles?|meters?|metres?|m\b|ft|feet|hits?|rbis?|strikeouts?|thousand|million|billion|light-years|days?|years?)|"
    r"\s+and\s+[\d,]+\s*(?:hits?|rbis?|strikeouts?|km|kilometers?|miles?|meters?|metres?|m\b|ft|feet|thousand|million|billion|light-years|days?|hr|hrs|home\s+runs?)|"
    r"\s*(?:-(?:year|meter|metre|foot|mile|km|day|hour|lb|kg|ton|seat|bed|room|page|word|step|piece|plank|tile)|"
    r"(?:years?\s+(?:old|ago|later|earlier|dormant|long|of)|year-old|km|kilometers?|m\b|meters?|metres?|miles?|mi\b|feet|ft\b|cm|mm|kg|lbs?|pounds?|tons?|tonnes?|°[cf]?|deg|kelvin|k\b|copies|planks?|tiles?|stars?|works?|songs?|albums?|films?|books?|pages?|games?|hits?|rbis?|strikeouts?|home\s+runs?|wins?|goals?|pts|points?|seats?|people|residents|inhabitants|soldiers|troops|species|trees|floodlights|dollars|usd|euros?|yen|thousand|million|billion|percent|%|nhl|nba|nfl|mlb|recordings|/)))",
    re.I,
)

RE_YEAR_COMMA_PREFIX = re.compile(
    r"\b(?:in|from|until|since|by|before|after|between|around|circa|c\.|born|died|founded|opened|closed|established|inducted|elected|signed|built|released|published|premiered|debuted|won|season|series|world\s+series|olympics|year|january|february|march|april|may|june|july|august|september|october|november|december|jan\.|feb\.|mar\.|apr\.|aug\.|sept?\.|oct\.|nov\.|dec\.|ad|bc|ce|bce)\s+([12]),(\d{3})\b",
    re.I,
)
RE_YEAR_COMMA_SUFFIX = re.compile(
    r"\b([12]),(\d{3})\s*(?:CE|BCE|AD|BC|season|World\s+Series|Olympics|treaty|rebellion|revolution|expedition|census|edition|Games|Cup|Draft|MVP|Cy\s+Young)\b",
    re.I,
)
RE_YEAR_COMMA_DECADE = re.compile(r"\b([12]),(\d{2}0)s\b")
RE_YEAR_COMMA_PAREN = re.compile(
    r"\((?:(?:b\.|d\.|c\.|ca\.|fl\.|r\.|est\.|opened|founded|born|died)\s*)?([12]),(\d{3})(?:\s*[–-]\s*(?:[12],?\d{3})?)?\)",
    re.I,
)
RE_YEAR_COMMA_RANGE = re.compile(
    r"\b(?:([12]),(\d{3})\s*[–-]\s*([12]),?(\d{3})|([12]\d{3})\s*[–-]\s*([12]),(\d{3}))\b"
)

RE_MALFORMED_COMMA_NUM = re.compile(r"\b\d{4,},\d{3}\b")
RE_CITY_PERIOD_STATE = re.compile(r"\b([A-Z][a-zA-Z'-]{2,})\.\s+([A-Z]{2})(?=[?!,)\s]|$)")
RE_DOUBLE_DOT_BAD = re.compile(r"(?<!\.|\d)\.\.(?!\.|\d)")
RE_BAD_DOT_Q = re.compile(r"\b([A-Za-z]{3,}|\d+)\.\?(?:\s|$)")
RE_BAD_PUNCT_SEQ = re.compile(r"\?\?|,,|,\.(?!\.)|:\?|;\?|\?\.")
RE_BAD_DOUBLE_BANG = re.compile(r"(?<![)\w])!!")
RE_SPACE_BEFORE_PUNCT = re.compile(r"\s+[?!,;:]|\s+\.(?!\d|\.\.|[a-z]{2,4}\b)")
RE_HTML_ENTITY = re.compile(
    r"&(?:quot|amp|apos|lt|gt|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo|hellip|deg|times|divide|minus|plusmn);|&#\d+;|&#x[0-9a-f]+;",
    re.I,
)
RE_LATEX_SUB_SUP = re.compile(r"[_^]\{[^}]+\}")
RE_CORRUPT_QMARK = re.compile(r"[A-Za-z]\?[A-Za-z0-9?]+|\s\?\s")
RE_UNRESOLVED_TPL = re.compile(r"(?<![_^A-Za-z])\{[a-zA-Z_][a-zA-Z0-9_]{1,}\}|\[\[(?![\s\d,-]+\])|\bundefined\b|\bNaN\b")
RE_DOUBLE_SPACE = re.compile(r" {2,}")
RE_DOUBLE_WORD = re.compile(
    r"(?<![A-Za-z0-9_-])(the|in|of|is|to|at|for|on|with|from|by|was|were|are|a|an)\s+\1(?![A-Za-z0-9_&])",
    re.I,
)
RE_LETTER_REF_OPTION = re.compile(r"^(?:both\s+)?[a-d]\s+and\s+[a-d](?:\s+only)?$", re.I)

RE_A_VOWEL = re.compile(r"(?<![A-Za-z0-9_'-])([Aa])\s+([AEIOUaeiou][a-zA-Z-]{2,})(?![A-Za-z0-9_])")
RE_A_VOWEL_EXCEPT = re.compile(
    r"^(?:uni|use|usu|utens|util|uro|uran|uter|utah|ugand|ukrain|uruguay|eup|eur|euk|eul|euth|eugl|"
    r"one|once|ouija|ufo|usa|usb|url|uber|utopi|ukulel|unanim|ubiquit|unicorn|uniform|union|uniqu|"
    r"unit|univers|usurp|ewe|one-|u-|un-|iiird|and|or|are|is|in|on|at|of|as|if|up|out|off|into|over|"
    r"under|after|about|against|along|among|around|across|also|already|always|away|either|else|equals|equal)",
    re.I,
)
RE_LABEL_BEFORE_A = re.compile(
    r"(?:Group|Class|Tier|Grade|Type|Serie|List|Plan|Model|Vitamin|Option|Team|Zone|Phase|Part|Act|"
    r"Section|Category|Division|League|Annex|Schedule|Appendix|Side|Form|Track|Band|Note|Key|Flat|"
    r"Sharp|Major|Minor|Double|Triple|Single|Concert|Stock|Blood|Hepatitis|Studio|Block|Room|Suite|"
    r"Seat|Box|Card|Test|Sample|Specimen|Solution|Compound|Drug|Protein|Gene|Enzyme|Channel|Wave|Ray|"
    r"Title|Rule|Article|Clause|Exhibit|Item|Choice|Answer|Statement|Element|Variable|Parameter|"
    r"Constant|Function|Object|Body|Mass|Charge|Particle|Atom|Ion|Let|Both|Between|From|Than|Versus|Vs\.?)\s+$",
    re.I,
)

RE_AN_CONSONANT = re.compile(
    r"(?<![A-Za-z0-9_'-])([Aa]n)\s+([BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz][a-zA-Z-]{2,})(?![A-Za-z0-9_])"
)
RE_AN_CONSONANT_EXCEPT = re.compile(
    r"^(?:hour|honest|honor|honour|heir|heiress|herb|homage|hors|der|den|dem|das|die|des|mri|mlb|mls|"
    r"mvp|mma|mba|mph|mtv|mit|mgm|ngo|nba|nfl|nhl|ncaa|npr|nsa|nwa|fbi|fda|fcc|fifa|fps|ftc|html|http|"
    r"https|hbo|hiv|hpv|hdtv|sql|svg|sms|ssd|suv|snl|sec|swat|x-ray|xbox|xml|led|lcd|lsd|lga|lax|rpg|"
    r"rpm|rna|rsa|rsvp|sos|nfc|nrl|nbl|nra|nypd|lapd|lpga|fha|faa|fema|fdr|jfk|lbj|mlk|hbc|hmv|hmo|"
    r"hvac|mfa|mla|mpa|msc|mta|nasdaq|nato|noaa|norad|n-type|l-shape|s-curve|f-stop|h-bomb|m-theory|"
    r"r-value|x-axis|x-chrom|s-wave|p-wave)",
    re.I,
)
RE_AN_CONS_NAT = re.compile(
    r"^(?:Russian|French|German|Spanish|Italian|British|Japanese|Chinese|Korean|Polish|Dutch|Greek|"
    r"Swiss|Swedish|Norwegian|Danish|Finnish|Czech|Turkish|Persian|Roman|Latin|Catholic|Christian|"
    r"Jewish|Muslim|Buddhist|Hindu|Nordic|Celtic|Slavic|Baltic|Balkan|Pacific|Caribbean|Brazilian|"
    r"Mexican|Canadian)$"
)

LEAK_STOPWORDS = {
    "the", "of", "and", "in", "to", "for", "on", "at", "by", "with", "from", "as", "an", "or",
    "la", "le", "de", "el", "al", "von", "van", "city", "river", "lake", "mount", "sea", "ocean",
    "island", "islands", "park", "national", "state", "states", "united", "university", "college",
    "institute", "school", "academy", "empire", "kingdom", "republic", "federation", "union",
    "war", "battle", "treaty", "act", "law", "theory", "effect", "constant", "number", "system",
    "order", "house", "world", "new", "old", "north", "south", "east", "west", "central", "upper",
    "lower", "great", "grand", "saint", "san", "santa", "king", "queen", "prince", "princess",
    "emperor", "general", "president", "prime", "minister", "doctor", "sir", "lord", "lady",
    "club", "team", "fc", "sc", "ac", "bc", "cf", "sport", "sports", "league", "cup", "open",
    "championship", "series", "games", "museum", "palace", "castle", "cathedral", "church",
    "temple", "bridge", "tower", "square", "street", "avenue", "station", "airport", "company",
    "corporation", "group", "bank", "press", "books", "music", "records", "films", "pictures",
    "studios", "network", "first", "second", "third", "fourth", "fifth", "black", "white", "red",
    "blue", "green", "gold", "golden", "silver", "royal", "american", "british", "english",
    "french", "german", "italian", "spanish", "russian", "chinese", "japanese", "indian",
    "canadian", "australian", "county", "province", "region", "district", "peninsula", "bay",
    "gulf", "strait", "cape", "valley", "desert", "forest", "part", "book", "song", "film",
    "movie", "play", "poem", "novel", "story", "tale", "chronicle", "history", "life", "time",
    "times", "international", "global", "modern", "ancient", "classic", "classical", "major",
    "minor", "super", "ultra", "mega", "mini", "stadium", "arena", "field", "ballpark", "gardens",
    "garden", "center", "centre", "coliseum", "dome", "bowl", "ground", "grounds",
}


def singular_stem(tok: str) -> str:
    if len(tok) > 5 and tok.endswith("ies"):
        return tok[:-3] + "y"
    if len(tok) > 5 and tok.endswith("es"):
        return tok[:-2]
    if len(tok) > 4 and tok.endswith("s") and not tok.endswith("ss"):
        return tok[:-1]
    return tok


def has_word_stem(hay_low: str, stem: str) -> bool:
    idx = hay_low.find(stem)
    while idx != -1:
        before_ok = idx == 0 or not hay_low[idx - 1].isalnum()
        if before_ok:
            after_pos = idx + len(stem)
            tail = hay_low[after_pos : after_pos + 3]
            if tail == "" or re.match(r"^[^a-z0-9]|^(?:s|es|ed|er|y)(?:[^a-z0-9]|$)", tail):
                return True
        idx = hay_low.find(stem, idx + 1)
    return False


def fix_articles_inline(text: str) -> str:
    """Cleanly repair 'a <vowel>' and 'an <consonant>' introduced during rephrasing."""
    def _fix_a(m: re.Match) -> str:
        art, word = m.group(1), m.group(2)
        if RE_A_VOWEL_EXCEPT.match(word) or re.match(r"^U[A-Z]+$", word):
            return m.group(0)
        if "A esmorga" in text:
            return m.group(0)
        before = text[max(0, m.start() - 18) : m.start()]
        if RE_LABEL_BEFORE_A.search(before):
            return m.group(0)
        if art == "A" and word[0].isupper() and m.start() > 0 and not re.search(r'[.?!:\n"“]\s*$', text[: m.start()]):
            return m.group(0)
        return ("An " if art == "A" else "an ") + word

    def _fix_an(m: re.Match) -> str:
        art, word = m.group(1), m.group(2)
        if RE_AN_CONSONANT_EXCEPT.match(word) or re.match(r"^[FHLMNRSX][A-Z0-9-]+$", word):
            return m.group(0)
        if word[0].isupper() and not RE_AN_CONS_NAT.match(word):
            return m.group(0)
        return ("A " if art == "An" else "a ") + word

    text = RE_A_VOWEL.sub(_fix_a, text)
    text = RE_AN_CONSONANT.sub(_fix_an, text)
    return text


def polish_whitespace_punct(text: str) -> str:
    s = re.sub(r" {2,}", " ", text.strip())
    s = re.sub(r"\s+([?!,;])", r"\1", s)
    s = re.sub(r"(?<![.\d])\.\.(?!\.|\d)", ".", s)
    s = re.sub(r"\.\?", "?", s)
    s = re.sub(r"\?\.", "?", s)
    s = re.sub(r",\.", ".", s)
    s = re.sub(r";\?", "?", s)
    s = re.sub(r":\?", "?", s)
    s = fix_articles_inline(s)
    return s


def check_text_defects(text: str, l0_domain: int, is_year_ctx: bool = False) -> List[str]:
    """Exact mirror of rt_dates_and_copy_audit.mjs checkTextCopy + sanitize_all checks."""
    defects: List[str] = []
    if not text:
        return ["EMPTY"]

    if "," in text:
        is_non_year_pinpoint = not is_year_ctx and text.lower().startswith("pinpoint band: between ")
        if not is_non_year_pinpoint:
            for rx in (
                RE_YEAR_COMMA_PREFIX,
                RE_YEAR_COMMA_SUFFIX,
                RE_YEAR_COMMA_DECADE,
                RE_YEAR_COMMA_PAREN,
                RE_YEAR_COMMA_RANGE,
            ):
                for m in rx.finditer(text):
                    g = m.groups()
                    if rx is RE_YEAR_COMMA_RANGE:
                        yr = int((g[0] or g[4] or "0") + (g[1] or g[5] or "000"))
                    else:
                        yr = int(g[0] + g[1])
                    if 1000 <= yr <= 2099 and not NON_YEAR_AFTER_NUM.match(text[m.end() :]):
                        defects.append(f"DATE_YEAR_COMMA:{m.group(0)}")
                        break
        if RE_MALFORMED_COMMA_NUM.search(text):
            defects.append("MALFORMED_COMMA_NUMBER")
        # Also mirror sanitize_all_questions_and_dates.py missing-space-after-comma check
        for m in re.finditer(r",([A-Za-z.])", text):
            pre = text[max(0, m.start() - 5) : m.start() + 1]
            if not re.search(r"[\[\(]|(?:45|46|47|48|69),$|^\(t,$|^t,$|^x,$|^y,$|XX,$|XY,$|rob,$", pre):
                if not re.search(r"\(t,x,y,z\)", text) and not re.search(r"4[5678],X|69,X", text):
                    defects.append(f"MISSING_SPACE_COMMA:{m.group(0)}")
                    break

    if "." in text:
        for cm in RE_CITY_PERIOD_STATE.finditer(text):
            city_w, st = cm.group(1), cm.group(2)
            if st not in US_CA_STATE_CODES or city_w.lower() in ABBREV_BEFORE_PERIOD:
                continue
            after_c = text[cm.end() : cm.end() + 1]
            if st in AMBIGUOUS_STATE_WORDS and not re.match(r"^[?!,)]|$", after_c):
                continue
            defects.append(f"CITY_PERIOD_STATE:{cm.group(0)}")
            break
        if RE_DOUBLE_DOT_BAD.search(text) and not re.search(r"(?:Mm\.\. Food|Dil Se\.\.|Hain Koun\.\.!)", text):
            defects.append("DOUBLE_PUNCT_DOTDOT")
        if "?" in text:
            m = RE_BAD_DOT_Q.search(text)
            if m and m.group(1).lower() not in ABBREV_BEFORE_PERIOD and not re.match(
                r"^(inc|corp|ltd|jr|sr|etc|phd|mph|rpm|est|vol|nos|dept|univ|assoc|bros|co|ave|blvd|rd|ln|ct|pl|sq|bldg|ste|apt|fl|ft|mt|st|dr|prof|rev|hon|gov|sen|rep|gen|col|maj|capt|lt|sgt|cpl|pvt|adm|cmdr|ens)$",
                m.group(1).lower(),
            ):
                defects.append(f"DOUBLE_PUNCT_DOTQ:{m.group(0)}")

    if "!" in text and RE_BAD_DOUBLE_BANG.search(text):
        defects.append("DOUBLE_BANG")
    if RE_BAD_PUNCT_SEQ.search(text):
        defects.append(f"BAD_PUNCT_SEQ:{RE_BAD_PUNCT_SEQ.search(text).group(0)}")
    if RE_SPACE_BEFORE_PUNCT.search(text):
        m = RE_SPACE_BEFORE_PUNCT.search(text)
        if not (l0_domain == 11 and any(ch in m.group(0) for ch in ".:")):
            defects.append(f"SPACE_BEFORE_PUNCT:{m.group(0)!r}")
    if "&" in text and RE_HTML_ENTITY.search(text):
        defects.append("HTML_ENTITY")
    if "{" in text or "[" in text:
        if RE_LATEX_SUB_SUP.search(text):
            defects.append("RAW_LATEX")
        if RE_UNRESOLVED_TPL.search(text):
            defects.append("UNRESOLVED_TPL")
    if "?" in text and RE_CORRUPT_QMARK.search(text):
        defects.append("CORRUPT_QMARK")
    if "  " in text or text != text.strip():
        defects.append("DOUBLE_SPACE")
    if "--" in text and "---" not in text and "-->" not in text:
        defects.append("DOUBLE_DASH")
    if re.search(r"[?!][A-Za-z]|[a-z]{2,}\.[A-Z][a-z]{2,}", text):
        if not re.search(r"Pharm\.D|Pub\.L|P!nk|Node\.js|Vue\.js|Next\.js|React\.js|D3\.js", text):
            defects.append("MISSING_SPACE_SENTENCE")

    for dw in RE_DOUBLE_WORD.finditer(text):
        rp = dw.group(0)
        if rp in ("in In", "on On", "for For", "of Of", "to To", "from From", "at At", "by By", "with With", "IS is", "for FOR", "Is Is", "The The"):
            continue
        if rp == "the The" and re.search(r"the The The\b|band|album|song", text, re.I):
            continue
        if re.search(r'throw-?in in soccer|back in in soccer|The The|"Is Is"|\bIs Is\b', text, re.I):
            continue
        defects.append(f"DOUBLE_WORD:{rp}")
        break

    for am in RE_A_VOWEL.finditer(text):
        w = am.group(2)
        if RE_A_VOWEL_EXCEPT.match(w) or re.match(r"^U[A-Z]+$", w) or "A esmorga" in text:
            continue
        before = text[max(0, am.start() - 18) : am.start()]
        if RE_LABEL_BEFORE_A.search(before):
            continue
        if am.group(1) == "A" and w[0].isupper() and am.start() > 0 and not re.search(r'[.?!:\n"“]\s*$', text[: am.start()]):
            continue
        defects.append(f"ARTICLE_A_VOWEL:{am.group(0)}")
        break

    for am in RE_AN_CONSONANT.finditer(text):
        w = am.group(2)
        if RE_AN_CONSONANT_EXCEPT.match(w) or re.match(r"^[FHLMNRSX][A-Z0-9-]+$", w):
            continue
        if w[0].isupper() and not RE_AN_CONS_NAT.match(w):
            continue
        defects.append(f"ARTICLE_AN_CONSONANT:{am.group(0)}")
        break

    if text.count("(") != text.count(")"):
        defects.append("UNMATCHED_PARENS")
    if text.count('"') % 2 != 0 and not re.search(r'\d"', text):
        defects.append("UNMATCHED_DQUOTE")

    return defects


def check_clue_leaks(q: Dict[str, Any], clue_text: str) -> List[str]:
    """Check whether a single clue string leaks the answer or breaks Gauntlet/Calibrator rules."""
    leaks: List[str] = []
    arch = q.get("archetype", "")
    l0 = int(q.get("l0Domain", 0))
    qid = int(q.get("qid", 0))
    ans = str(q.get("answerCorrect", "")).strip()
    ans_low = ans.lower()
    cl_low = clue_text.lower()

    if arch in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS") and l0 != 11:
        if len(ans_low) >= 4 and ans_low in cl_low:
            leaks.append(f"CLUE_EXACT_LEAK:{ans}")
    if arch == "CALIBRATOR_DIAL" and qid >= 50001:
        ex = (q.get("calibratorExt") or {}).get("exactVal")
        if ex is not None and re.search(rf"(?<![0-9.]){re.escape(str(ex))}(?![0-9.])", clue_text):
            leaks.append(f"CAL_EXACT_LEAK_clue:{ex}")
    if arch == "GAUNTLET_SHATTER":
        if any(g in cl_low for g in ("statement is true", "statement is false", "is a myth", "urban myth")):
            leaks.append("GAUNTLET_GIVEAWAY_CLUE")
    return leaks


def check_question_leaks(q: Dict[str, Any], prompt: str, clues: Sequence[str]) -> List[str]:
    """Exact mirror of rt_dates_and_copy_audit.mjs leak rules + Calibrator/Gauntlet guards."""
    leaks: List[str] = []
    arch = q.get("archetype", "")
    l0 = int(q.get("l0Domain", 0))
    qid = int(q.get("qid", 0))
    ans = str(q.get("answerCorrect", "")).strip()
    ans_low = ans.lower()
    p_low = prompt.lower()

    if arch in ("SIGHTLINE_LOCK", "HERO_ARTIFACT_SYNTHESIS") and l0 != 11:
        if len(ans_low) >= 4 and ans_low in p_low:
            leaks.append(f"STEM_EXACT_LEAK:{ans}")
        stripped = re.sub(r"^(?:the|a|an|republic of|kingdom of|state of|city of)\s+", "", ans_low, flags=re.I).strip()
        if len(stripped) >= 5 and stripped in p_low and has_word_stem(p_low, stripped) and qid != 16:
            leaks.append(f"STEM_CORE_LEAK:{stripped}")

        ans_tokens = [t for t in re.split(r"[^a-z0-9]+", stripped) if len(t) >= 4 and t not in LEAK_STOPWORDS]
        if len(ans_tokens) >= 2:
            all_in = all(has_word_stem(p_low, singular_stem(t)) for t in ans_tokens)
            dist_texts = [
                (d["text"] if isinstance(d, dict) else str(d)).lower()
                for d in (q.get("distractors") or [])
            ]
            dist_all = any(
                len([t for t in re.split(r"[^a-z0-9]+", dt) if len(t) >= 4 and t not in LEAK_STOPWORDS]) >= 2
                and all(
                    has_word_stem(p_low, singular_stem(t))
                    for t in re.split(r"[^a-z0-9]+", dt)
                    if len(t) >= 4 and t not in LEAK_STOPWORDS
                )
                for dt in dist_texts
            )
            if all_in and not dist_all:
                leaks.append(f"SELF_ANSWERING_TOKENS:{ans_tokens}")

        for ci, cl in enumerate(clues):
            if len(ans_low) >= 4 and ans_low in str(cl).lower():
                leaks.append(f"CLUE{ci}_EXACT_LEAK:{ans}")

    if arch == "CALIBRATOR_DIAL":
        cext = q.get("calibratorExt") or {}
        unit = str(cext.get("unit", ""))
        ex = cext.get("exactVal")
        if ex is not None and qid >= 50001:
            ex_s = str(ex)
            for lbl, txt in [("prompt", prompt), ("clue0", clues[0] if len(clues) > 0 else ""), ("clue1", clues[1] if len(clues) > 1 else "")]:
                if re.search(rf"(?<![0-9.]){re.escape(ex_s)}(?![0-9.])", txt):
                    leaks.append(f"CAL_EXACT_LEAK_{lbl}:{ex_s}")
        if RE_YEAR_UNIT.match(unit) or RE_YEAR_PROMPT_CUE.search(str(q.get("prompt", ""))):
            if not (RE_YEAR_UNIT.match(unit) or RE_YEAR_PROMPT_CUE.search(prompt)):
                leaks.append("LOST_YEAR_CUE")

    if arch == "GAUNTLET_SHATTER":
        for ci, cl in enumerate(clues):
            clow = str(cl).lower()
            if any(g in clow for g in ("statement is true", "statement is false", "is a myth", "urban myth")):
                leaks.append(f"GAUNTLET_GIVEAWAY_CLUE{ci}")

    return leaks


def pick_variant(qid: int, variants: Sequence[str], salt: int = 0) -> str:
    # Deterministic FNV-style mix so adjacent QIDs rotate evenly across variants
    h = ((qid * 2654435761) ^ (salt * 40503)) & 0xFFFFFFFF
    return variants[h % len(variants)]


# =============================================================================
# 2. GOLD VENUE PACKS (`gold_venue_packs.json`) BESPOKE EDITORIAL REWRITES
# =============================================================================

# All 61 >185-char prompts tightened cleanly to <= 180 chars + 20 formulaic openers
GOLD_PROMPT_UPGRADES: Dict[int, str] = {
    # --- 61 Over-185-Char Prompts (49 Venue Qs + 12 Boss Chain Steps) ---
    50162: "To preserve ancient carpentry across millennia, Japan's sacred Ise Grand Shrine is dismantled and rebuilt from fresh hinoki cypress on an adjacent plot every how many years?",
    50191: "Begun in May 2019 with Emperor Naruhito's accession, Japan's 'Reiwa' ('beautiful harmony') era was the first drawn from a native classic—which 8th-century anthology?",
    50196: "Running across Japan's Shinkansen network since 1992, the UrEDAS early-warning system cuts power seconds before destructive seismic S-waves arrive by detecting what faster wave?",
    50247: "With chisels strapped to his crippled wrists, which 18th-century Minas Gerais master carved Congonhas's twelve soapstone Prophets and Ouro Preto's baroque churches?",
    50260: "Spanning the Paraná River along the Brazil–Paraguay border, which 14-gigawatt binational dam has generated more cumulative clean electricity since 1984 than any other?",
    50261: "Launched commercially in 2003 after the 1975 Pró-Álcool drive, Brazil's 'flex-fuel' cars seamlessly adjust ignition to run on gasoline blended with ethanol from what crop?",
    50267: "Championed by archaeologist Niède Guidon in arid Piauí, which northeastern Brazilian national park protects over 1,000 sandstone shelters filled with prehistoric rock art?",
    50268: "Along Amazonian river bluffs, pre-Columbian societies engineered self-regenerating dark soils rich in charcoal, bone, and pottery shards—known in Portuguese as what?",
    50272: "Hailing from Minas Gerais, crisp-chewy Brazilian 'pão de queijo' cheese puffs are naturally gluten-free because they use not wheat flour, but starch from what root?",
    50275: "Bursting onto the 1958 Sweden tournament with six knockout goals at age seventeen, Pelé (Edson Arantes do Nascimento) remains the only man to win how many World Cups?",
    50276: "Driving a McLaren stuck in sixth gear through pouring rain in 1991, which three-time Brazilian Formula 1 World Champion claimed an iconic home victory at Interlagos?",
    50277: "Invented on Copacabana Beach in 1965 by Octavio de Moraes to dodge a beach ban on ball games without nets, what acrobatic Rio sport plays volleyball with no hands or arms?",
    50278: "Opened on New Year's Eve 1896 deep in the rainforest 1,450 km upriver from the Atlantic, Manaus's pink-domed Teatro Amazonas was financed by a boom in what resource?",
    50284: "Launched by Brazil's Central Bank in November 2020, what free 24/7 QR-and-alias instant payment rail surpassed cash and cards across 150 million Brazilians in three years?",
    50290: "Linking Rio's bohemian Lapa and hilltop Santa Teresa neighborhoods, Escadaria Selarón was hand-covered over 23 years by Chilean artist Jorge Selarón in 2,000+ vivid what?",
    50298: "Pairing João Gilberto's whispered voice and syncopated guitar with a Tom Jobim / Vinícius de Moraes tune, in what year did 'Chega de Saudade' launch Bossa Nova in Rio?",
    50321: "Working in 11th-century Fatimid Cairo—even feigning madness under Caliph al-Hakim—which physicist wrote the seven-volume 'Book of Optics' proving light enters the eye?",
    50322: "Chief physician at Cairo's Al-Mansuri Hospital in 1242 CE—three centuries before William Harvey—who first described pulmonary blood circulation between heart and lungs?",
    50327: "Unearthed in Middle Egypt in 1887, the 14th-century BCE 'Amarna Letters' show pharaohs corresponding with Babylonian, Hittite, and Canaanite kings in what lingua franca?",
    50334: "Begun in 1176 CE on a limestone spur of Cairo's Muqattam Hills to guard against Crusader raids, the city's commanding Citadel was founded by which Ayyubid sultan?",
    50337: "Leading Alexandria's Neoplatonist school in the late 4th century, which famed female mathematician and astronomer edited Ptolemy's 'Almagest' and built brass astrolabes?",
    50340: "In Egypt's Western Desert southwest of Fayyum, which UNESCO 'Valley of the Whales' preserves hundreds of 40-million-year-old Basilosaurus skeletons with tiny hind legs?",
    50349: "Grown in the alluvial Nile Delta since Muhammad Ali Pasha's 1820s reforms with French engineer Jumel, why is genuine 'Giza' Egyptian cotton prized over upland cotton?",
    50351: "From 'Hollywood on the Nile' (Studio Misr, 1935), Egyptian cinema won global auteur fame through which Alexandria-born director of 'Cairo Station' (1958) and 'Destiny'?",
    50361: "Nicknamed 'The King' by Apollo crews who orbited the Moon sending Arabic greetings to Cairo, which Egyptian-American geologist chaired NASA's Lunar Landing Site Committee?",
    50366: "Carved in 196 BCE under Ptolemy V and found near Rashid in 1799, the Rosetta Stone repeats one Memphis decree across Ancient Greek and which TWO distinct Egyptian scripts?",
    50372: "Realizing hieroglyphs fused phonetic signs AND ideograms ('Je tiens mon affaire!'), in what year did Jean-François Champollion read his 'Lettre à M. Dacier' unlocking them?",
    50377: "Chronicling Cairene life in 'Palace Walk' and 'Children of Gebelawi,' in what year did Naguib Mahfouz become the first Arabic-language Nobel laureate in Literature?",
    50401: "At Reykjavik's seaside Höfði House in October 1986, Reagan and Gorbachev nearly abolished all ballistic nuclear missiles before deadlocking over which U.S. program?",
    50410: "Coined in 1964 to avoid raw loanwords, Icelandic fused 'tala' ('number') with 'völva' (Eddic prophetess) to create 'tölva'—the modern Icelandic word for what?",
    50411: "Blanketing ~8% of Iceland across active subglacial calderas like Grímsvötn and Bárðarbunga, which 7,700-km² ice cap is Europe's largest glacier by volume outside Svalbard?",
    50424: "Pioneered in Iceland's Westfjords by Fertram Sigurjónsson, Kerecis heals severe human burns and chronic wounds using omega-3-rich tissue grafts harvested sustainably from what?",
    50431: "Trained as a cellist in Reykjavik, which Icelandic composer swept the 2020 Oscar, Golden Globe, BAFTA, AND Emmy for her haunting cello scores to 'Joker' and 'Chernobyl'?",
    50437: "Near Laugarvatn and Mývatn, bakers bury sealed pots of sweet rye dough ('rúgbrauð') in boiling volcanic sand for 24 hours to steam-bake crustless loaves called what?",
    50451: "According to 'Íslendingabók' and volcanic tephra ice-core dating (~871±2), in what traditional year CE did Ingólfur Arnarson found permanent settlement at Reykjavik?",
    50457: "Completed in 1974 when southern glacial outwash bridges closed the final gap, roughly how many kilometers long is Route 1 ('Þjóðvegur 1'—Iceland's circular Ring Road)?",
    50489: "Built across the 350-meter Marina Channel mouth in 2008, Singapore's Marina Barrage works as a tidal flood barrier, water-sports hub, AND downtown's 15th freshwater what?",
    50503: "Sitting just 1.3° (~140 km) north of the Equator, why has Singapore recorded virtually ZERO direct typhoon landfalls in modern history (barring tiny 2001 Storm Vamei)?",
    50515: "Unseeded in Huelva in December 2021—upsetting Olympic champion Viktor Axelsen in round one—who became Singapore's first BWF Badminton World Champion in men's singles?",
    50519: "Composed in 1958 by Minangkabau-born Zubir Said—featured on the reverse of every Portrait-Series Singapore banknote—what Malay phrase titles Singapore's national anthem?",
    50540: "Inscribed in 2015 as Singapore's first UNESCO World Heritage Site—the only tropical botanic garden listed—in what year were the Singapore Botanic Gardens founded at Tanglin?",
    50541: "Purifying used water via microfiltration, reverse osmosis, and UV to beat WHO standards, in what year did PUB officially launch 'NEWater' to the Singapore public?",
    50562: "Ratified by major space powers since 1967, the Outer Space Treaty's Article II bars national sovereignty over the Moon and celestial bodies AND prohibits putting what in orbit?",
    50610: "When Magellan–Elcano chronicler Antonio Pigafetta reached Cape Verde in 1522 without missing a single log entry, why did shore calendars read Thursday instead of Wednesday?",
    50612: "Under Article VI of the 1959 Antarctic Treaty, all land and ice shelves south of what whole parallel of South latitude fall under demilitarized international science governance?",
    50616: "Echoing David Hilbert's 1900 Paris list a century later, how many $1-million 'Millennium Prize Problems' did the Clay Mathematics Institute unveil in Paris in May 2000?",
    50617: "Uniting 730 delegates from 44 Allied nations in New Hampshire to charter the IMF and World Bank (IBRD), in what year did the Bretton Woods Monetary Conference convene?",
    50620: "Measured from cosmic microwave background acoustic peaks by ESA's Planck observatory, how many billion years old (to one decimal place) is our observable universe?",
    50621: "Standardized by NIST in FIPS 180-2 to secure TLS, Git commits, and Merkle ledgers worldwide, how many binary bits long is a 64-hex-character SHA-2 cryptographic digest?",
    50650: "Built around 1713 by London clockmakers George Graham and Thomas Tompion, the mechanical Solar System model took its name from Charles Boyle, holder of which Irish peerage?",
    50659: "In mathematical origami, Kawasaki's Theorem states a single-vertex crease pattern folds flat if and only if the alternating corner angles around the vertex sum to how many degrees?",
    50660: "Paired with Kawasaki's rule, Jun Maekawa's Theorem proves that at any flat-folded origami vertex, Mountain folds and Valley folds always differ in count by what exact integer?",
    50661: "Launched by JAXA in May 2010 using diagonal origami unfolding and spin, which Venus-bound craft became the first interplanetary spacecraft propelled purely by sunlight?",
    50665: "Buried 1,000 meters beneath Mount Ikeno in Gifu, Japan's Super-Kamiokande observatory hunts ghostly neutrinos inside a steel tank holding 50,000 tonnes of what?",
    50669: "Found in northeastern Brazil by prospector Heitor Dimas Barbosa in 1989, ultra-rare 'Paraíba tourmaline' glows electric neon turquoise thanks to lattice traces of which metal?",
    50670: "During WWII and early computing, clear 'lasca' rock crystals from Minas Gerais were strategic cargo because sliced wafers vibrate at exact radio frequencies via what effect?",
    50673: "Based in São José dos Campos, which Brazilian space agency pioneered open-access satellite rainforest monitoring (PRODES and real-time DETER alerts) as the global standard?",
    50675: "Oscar Niemeyer's 16-column Cathedral of Brasília and cooling towers achieve double-curved strength from straight rebar because a one-sheet hyperboloid is what kind of surface?",
    50676: "Setting the tempo of every capoeira roda, which single-wire Brazilian musical bow presses a stone or coin ('dobrão') against steel wire amplified by a dried calabash gourd?",
    50677: "What knotted oval loop—meaning 'that which the sun encircles' ('shenu')—gave Thomas Young and Champollion the breakthrough clue that enclosed Rosetta glyphs spelled royal names?",
    50679: "With no magnetic compass in 2560 BCE, Old Kingdom astronomers aligned Khufu's Great Pyramid within 3/60ths of a degree of true North using a palm-rib sight and plumb pair called what?",

    # --- 20 Formulaic "In what year..." / "What is the..." Gold Venue Openers ---
    50051: "Celebrated each August 1 as Switzerland's founding, the Federal Charter of Uri, Schwyz, and Unterwalden was sealed in what year CE?",
    50052: "Towering inside the Monte Rosa massif as Switzerland's highest summit, Dufourspitze reaches what elevation in meters?",
    50054: "Via a landmark national referendum, male Swiss voters finally approved federal women's suffrage in what year?",
    50055: "At CERN in Geneva, the ATLAS and CMS collaborations jointly announced the discovery of the Higgs boson in what year?",
    50056: "Releasing World Wide Web server and browser code royalty-free into the public domain, CERN opened the modern Web in what year?",
    50061: "Gathering at the Congress of Vienna, Europe's great powers formally recognized Switzerland's 'perpetual armed neutrality' in what year?",
    50062: "Swiss typeface designer Max Miedinger crafted Neue Haas Grotesk—soon celebrated worldwide as Helvetica—in what year?",
    50131: "Triumphing at Hastings and accepting the crown in Westminster Abbey on Christmas Day, William the Conqueror seized England in what year?",
    50133: "Voting to anchor global time and navigation at London's Greenwich Observatory as 0° longitude, the International Meridian Conference met in what year?",
    50136: "As English fireships and Atlantic gales scattered the Spanish Armada, Queen Elizabeth I rallied her troops at Tilbury in what year?",
    50137: "Carrying the world's first underground rail passengers between Paddington and Farringdon, London's Metropolitan Railway opened in what year?",
    50163: "Joining Japanese temple beams and fine furniture with interlocking timber joints—zero nails, screws, or glue—this traditional carpentry art goes by what name?",
    50211: "Ending the Tokugawa Shogunate and relocating Japan's imperial capital from Kyoto to newly renamed Tokyo, the Meiji Restoration arrived in what year?",
    50212: "Victorious on the fog-shrouded field of Sekigahara, Tokugawa Ieyasu unified Japan on the eve of the Edo shogunate in what year?",
    50215: "Striking Tokyo and Yokohama at lunchtime on September 1, the devastating Great Kanto Earthquake hit Japan in what year?",
    50218: "Isolating glutamic acid from kombu broth at Tokyo Imperial University, chemist Kikunae Ikeda coined the fifth basic taste, 'umami,' in what year?",
    50453: "Meeting at Reykjavik's Höfði House for the dramatic summit that catalyzed Cold War nuclear reductions, Reagan and Gorbachev conferred in what year?",
    50459: "Unleashing fine volcanic glass ash that grounded over 100,000 European flights for a week in April, Iceland's Eyjafjallajökull erupted in what year?",
    50461: "Reykjavik-born novelist Halldór Laxness became Iceland's sole Nobel Prize laureate in Literature in what year?",
    50531: "Ending Dutch claims to Singapore and drawing the maritime frontier down the Strait, Britain and the Netherlands signed the Treaty of London in what year?",
    # Unblock pre-existing self-answering tokens ('chip' + 'fish') on Gold QID 50115 so 712/712 Gold items pass live isCleanShardCandidate!
    50115: "Which iconic 1860s British takeaway pairing united battered Atlantic seafood from East London's Sephardic Jewish community with Belgian-style fried potatoes?",
}

GOLD_CLUE1_UPGRADES: Dict[int, str] = {
    50377: "Narrow the dial to the closing years of the 1980s.",
    50452: "Dial right near the midpoint of the 1940s, as WWII entered its final stretch.",
    50461: "Pinpoint the middle of the 1950s—one year before the Suez Crisis.",
    50531: "Target the opening half of the 1820s, shortly after Raffles's landing.",
    50618: "Aim for the closing years of the 1640s, ending three decades of European war.",
}

# =============================================================================
# 3. EXACT TYPO & MID-SENTENCE BLANK FIXES IN `questions.json`
# =============================================================================

EXACT_PROMPT_FIXES: Dict[int, str] = {
    3426: "Name the first commercially available microprocessor, released by Intel in 1971.",
    9124: "Featured in myths across antiquity, the Pleiades open star cluster is famously counted for how many bright naked-eye stars?",
    9132: "Tracing a bright 'W' across the northern night sky, which constellation is named for a boastful queen of Greek myth?",
    9136: "Relative to its orbital plane around the Sun, Earth's rotational axis tilts at roughly what angle?",
    9138: "Solar sunspot activity surges and ebbs in a regular cycle—roughly how many years separate consecutive peaks?",
    9189: "If 960 mg of the antibacterial drug Cotrimoxazole is prescribed every 12 hours, what is the total daily dose in grams?",
    9546: "In the decimal number system, what does the notation MSD refer to?",
    11657: "Spot the outlier: among these enzymes, which is NOT zinc-dependent?",
    11963: "In psychology, the classic remark 'You tripped, but I was pushed' best illustrates which phenomenon?",
    13365: "On the Celsius (Centigrade) scale, what temperature equals a comfortable room reading of 68°F?",
    16892: "You can turn right on red in LA.",
}

# =============================================================================
# 4. STRUCTURED FACT-TEMPLATE UPGRADES (C3 CAPITALS/CURRENCIES + C4 3935..4964)
# =============================================================================


def upgrade_structured_prompt(q: Dict[str, Any]) -> Optional[str]:
    qid = int(q["qid"])
    p = str(q["prompt"]).strip()
    arch = q.get("archetype", "")

    # 1. World Capitals (C2 + C3)
    m = re.match(r"^What is the (?:official )?capital(?: city)? of ([^?]+)\?$", p)
    if m and arch == "SIGHTLINE_LOCK":
        country = m.group(1).strip()
        return pick_variant(qid, [
            f"Serving as the seat of government for {country}, which city is its official capital?",
            f"On a diplomatic atlas, which city anchors {country} as its national capital?",
            f"{country} governs from which official capital city?",
            f"Point to the Meridian map: name the official capital of {country}.",
            f"Which city holds official status as the national capital of {country}?",
            f"Name the seat of government and official capital city of {country}.",
        ], salt=11)

    # 2. World Currencies (C2 + C3)
    m = re.match(r"^What is the (?:official national currency|basic unit of currency) (?:of|for) ([^?]+)\?$", p)
    if m and arch == "SIGHTLINE_LOCK":
        country = m.group(1).strip()
        return pick_variant(qid, [
            f"Central bankers in {country} issue which official national currency?",
            f"In {country}, everyday commerce is denominated in which official currency?",
            f"Which official monetary unit circulates as the national currency of {country}?",
            f"Travelers exchanging money in {country} pay in which official national currency?",
            f"Name the official national currency used across {country}.",
        ], salt=13)

    # 3. Periodic Table Symbol -> Element (100 Qs in C4)
    m = re.match(r"^Which chemical element is represented by the periodic table symbol '([^']+)'\?$", p)
    if m:
        sym = m.group(1)
        return pick_variant(qid, [
            f"On the IUPAC periodic table, the symbol '{sym}' designates which chemical element?",
            f"Chemists shorthand this element on the periodic table with the symbol '{sym}'—name it.",
            f"Which element claims the official periodic-table symbol '{sym}'?",
            f"In chemical formulas, the symbol '{sym}' stands for which element?",
            f"Spot the element behind the IUPAC periodic-table symbol '{sym}'.",
            f"Periodic-table notation assigns the symbol '{sym}' to which chemical element?",
        ], salt=17)

    # 4. Periodic Table Atomic Number (36 Qs in C4, CALIBRATOR_DIAL)
    m = re.match(r"^What is the atomic number \(proton count\) of the element ([^?]+)\?$", p)
    if m:
        elem = m.group(1).strip()
        return pick_variant(qid, [
            f"Dial in the atomic number—the exact proton count—of {elem}.",
            f"Every neutral atom of {elem} carries how many protons (its atomic number)?",
            f"On the periodic table, what exact atomic number (proton count) belongs to {elem}?",
            f"Pinpoint {elem}'s atomic number: how many protons sit inside its nucleus?",
            f"Calibrate the periodic-table proton count (atomic number) of {elem}.",
        ], salt=19)

    # 5. Melting Point (15 Qs in C4, CALIBRATOR_DIAL)
    m = re.match(r"^At approximately what temperature in °C does pure ([^?]+) melt\?$", p)
    if m:
        elem = m.group(1).strip()
        return pick_variant(qid, [
            f"Calibrate the melting point of pure {elem} in degrees Celsius (°C).",
            f"In °C, at roughly what temperature does solid {elem} melt into liquid?",
            f"Pinpoint the melting temperature (°C) of pure {elem}.",
            f"Pure {elem} transitions from solid to liquid at roughly what temperature in °C?",
        ], salt=23)

    # 6. Nobel Prize Field (89 Qs in C4)
    m = re.match(r"^In which Nobel Prize field was (.+?) honored in (\d{4})\?$", p)
    if m:
        name, yr = m.group(1).strip(), m.group(2)
        return pick_variant(qid, [
            f"In {yr}, the Nobel committee honored {name} in which prize discipline?",
            f"{name} claimed a {yr} Nobel Prize in which category?",
            f"Which Nobel Prize discipline recognized {name}'s work in {yr}?",
            f"Honored by the Nobel committee in {yr}, {name} won in which field?",
            f"Stockholm or Oslo celebrated {name} in {yr}—in which Nobel category?",
        ], salt=29)

    # 7. Nobel Prize Year (47 Qs in C4, CALIBRATOR_DIAL — MUST keep year cue!)
    m = re.match(r"^In what year was (.+?) awarded the Nobel Prize in ([^?]+)\?$", p)
    if m:
        name, field = m.group(1).strip(), m.group(2).strip()
        return pick_variant(qid, [
            f"Pinpoint the year {name} received the Nobel Prize in {field}.",
            f"In which calendar year did {name} win the Nobel Prize in {field}?",
            f"Dial in the exact year the Nobel committee honored {name} in {field}.",
            f"What year saw {name} awarded the Nobel Prize in {field}?",
            f"Calibrate the year {name} captured the Nobel Prize in {field}.",
        ], salt=31)

    # 8. World Bank Population (71 Qs in C4, CALIBRATOR_DIAL)
    m = re.match(r"^Approximately how many million people live in (.+?) \(World Bank 2025\)\?$", p)
    if m:
        country = m.group(1).strip()
        return pick_variant(qid, [
            f"Calibrate the population of {country} in millions (World Bank 2025).",
            f"Per World Bank 2025 estimates, roughly how many million residents call {country} home?",
            f"Dial in {country}'s population to the nearest million (World Bank 2025).",
            f"How many million people live across {country} according to World Bank 2025 figures?",
            f"Pinpoint the demographic scale of {country} in millions (World Bank 2025).",
        ], salt=37)

    # 9. Country Area (60 Qs in C4, CALIBRATOR_DIAL)
    m = re.match(r"^What is the total area of (.+?) in thousands of square kilometers\?$", p)
    if m:
        country = m.group(1).strip()
        return pick_variant(qid, [
            f"Calibrate {country}'s total surface area in thousands of square kilometers.",
            f"Across land and inland water, {country} spans how many thousands of square kilometers?",
            f"Dial in the geographic footprint of {country} in thousands of square kilometers.",
            f"On a cartographic ledger, how many thousands of square kilometers make up {country}?",
            f"Pinpoint {country}'s total area in thousands of square kilometers.",
        ], salt=41)

    # 10. Country Land Borders (34 Qs in C4, CALIBRATOR_DIAL)
    m = re.match(r"^How many sovereign countries share a land border with ([^?]+)\?$", p)
    if m:
        country = m.group(1).strip()
        return pick_variant(qid, [
            f"Tracing {country}'s frontier on a political map, how many sovereign neighbors share its land border?",
            f"How many UN sovereign states border {country} directly by land?",
            f"Count {country}'s direct terrestrial neighbors: how many sovereign countries share a land border?",
            f"Dial in the exact number of sovereign nations sharing a land frontier with {country}.",
        ], salt=43)

    # 11. Nth Prime (C4, CALIBRATOR_DIAL)
    m = re.match(r"^What is the (\d+(?:st|nd|rd|th)) prime number \(counting 2 as the 1st prime\)\?$", p)
    if m:
        ord_s = m.group(1)
        return pick_variant(qid, [
            f"Counting 2 as the 1st prime, dial in the {ord_s} prime number.",
            f"Starting the prime sequence at 2, which integer lands in the {ord_s} spot?",
            f"Pinpoint the {ord_s} prime number along the number line (with 2 as 1st).",
        ], salt=47)

    # 12. Arabic -> Roman Numerals (14 Qs in C4)
    m = re.match(r"^How is the Arabic integer (\d+) written in standard subtractive Roman numerals\?$", p)
    if m:
        num = m.group(1)
        return pick_variant(qid, [
            f"Carved onto a classical marble pediment, how is {num} written in standard Roman numerals?",
            f"Translate the integer {num} into standard subtractive Roman numerals.",
            f"In classical Roman notation, which subtractive numeral represents {num}?",
        ], salt=53)

    # 13. Decimal -> Hexadecimal (13 Qs in C4)
    m = re.match(r"^What is the hexadecimal \(base-16\) representation of the decimal number (\d+)\?$", p)
    if m:
        num = m.group(1)
        return pick_variant(qid, [
            f"Convert decimal {num} into its hexadecimal (base-16) representation.",
            f"In base-16 programmer notation, how is the decimal integer {num} written?",
            f"Express decimal {num} in hexadecimal (base-16).",
        ], salt=59)

    # 14. Fibonacci (9 Qs in C4, CALIBRATOR_DIAL)
    m = re.match(r"^In the Fibonacci sequence starting 1, 1, 2, 3, 5\.\.\., what is the (\d+(?:st|nd|rd|th)) term\?$", p)
    if m:
        ord_s = m.group(1)
        return pick_variant(qid, [
            f"Beginning 1, 1, 2, 3, 5…, dial in the {ord_s} term of the Fibonacci sequence.",
            f"Adding each pair to forge the next (1, 1, 2, 3, 5…), what is the {ord_s} Fibonacci number?",
            f"Calibrate the {ord_s} term in the classic Fibonacci sequence (starting 1, 1, 2, 3, 5…).",
        ], salt=61)

    # 15. Powers of 2 (C4, CALIBRATOR_DIAL)
    m = re.match(r"^What exact integer value equals 2 raised to the power of (\d+) \(2\^\d+\)\?$", p)
    if m:
        exp = m.group(1)
        return pick_variant(qid, [
            f"In binary powers, dial in the exact integer value of 2^{exp}.",
            f"Doubling cleanly {exp} times from 1, what exact integer equals 2^{exp}?",
            f"Calibrate the exact value of 2 raised to the power of {exp} (2^{exp}).",
        ], salt=67)

    # 16. Polygon Interior Angles (C4, CALIBRATOR_DIAL)
    m = re.match(r"^What is the sum of the interior angles of a simple ([^?]+)\?$", p)
    if m:
        poly = m.group(1).strip()
        return pick_variant(qid, [
            f"In Euclidean geometry, the interior angles of a simple {poly} sum to how many degrees?",
            f"Calibrate the total interior angle sum (in degrees) of a simple {poly}.",
        ], salt=71)

    # 17. Combinatorics C(n, r) (C4, CALIBRATOR_DIAL)
    m = re.match(r"^How many distinct (\d+)-member committees can be chosen from (\d+) people \(C\((\d+),(\d+)\)\)\?$", p)
    if m:
        r_v, n_v = m.group(1), m.group(2)
        return pick_variant(qid, [
            f"Ignoring order, how many distinct {r_v}-person committees can be drawn from {n_v} candidates—C({n_v},{r_v})?",
            f"Evaluate C({n_v},{r_v}): how many unordered {r_v}-member teams can be picked from {n_v} people?",
        ], salt=73)

    # 18. TCP/UDP Ports (12 Qs in C4)
    m = re.match(r"^What is the standard default TCP/UDP port number assigned to ([^?]+)\?$", p)
    if m:
        proto = m.group(1).strip()
        return pick_variant(qid, [
            f"Network engineers route {proto} traffic by default through which standard TCP/UDP port?",
            f"IANA assigns which classic default TCP/UDP port number to {proto}?",
            f"Which well-known default TCP/UDP port serves {proto}?",
        ], salt=79)

    # 19. Programming Language Release Year (11 Qs in C4, CALIBRATOR_DIAL — keep year cue!)
    m = re.match(r"^In what year did the programming language (.+?) make its first public release\?$", p)
    if m:
        lang = m.group(1).strip()
        return pick_variant(qid, [
            f"Pinpoint the year the programming language {lang} made its first public debut.",
            f"In which calendar year was the programming language {lang} first released publicly?",
            f"Dial in the release year when {lang} first entered the computing world.",
        ], salt=83)

    # 20. Physics SI Units (15 Qs in C4)
    m = re.match(r"^Which SI derived unit measures ([^?]+)\?$", p)
    if m:
        qty = m.group(1).strip()
        return pick_variant(qid, [
            f"In the International System (SI), which derived unit quantifies {qty}?",
            f"Physicists express {qty} using which official SI derived unit?",
            f"Name the SI derived unit dedicated to measuring {qty}.",
        ], salt=89)

    # 21. Greek -> Roman Deity (15 Qs in C4)
    m = re.match(r"^Who is the Roman mythological counterpart to the Greek deity ([^?]+)\?$", p)
    if m:
        deity = m.group(1).strip()
        return pick_variant(qid, [
            f"In Roman mythology, which deity corresponds to the Greek figure {deity}?",
            f"Crossing from Olympus to Rome, {deity} took on which Roman mythological identity?",
            f"Name the Roman counterpart to the Greek deity {deity}.",
        ], salt=97)

    # 22. World Gastronomy Dish -> Country (22 Qs in C4)
    m = re.match(r"^Which country is most famously associated with the traditional dish ([^?]+)\?$", p)
    if m:
        dish = m.group(1).strip()
        return pick_variant(qid, [
            f"Culinary maps link the classic dish {dish} most famously with which country?",
            f"Which nation's culinary heritage is celebrated for the traditional dish {dish}?",
            f"Order authentic {dish} in its homeland—which country claims it?",
        ], salt=101)

    # 23. History / Space Milestones (C4, CALIBRATOR_DIAL — keep year cue!)
    m = re.match(r"^In what year(?: CE)? did this historic turning point occur: (.+?)\?$", p)
    if m:
        ev = m.group(1).strip().rstrip(".")
        ev = ev[0].upper() + ev[1:] if ev else ev
        return pick_variant(qid, [
            f"Pinpoint the year CE of this historic turning point: {ev}.",
            f"Calibrate the exact calendar year CE when this milestone unfolded: {ev}.",
        ], salt=103)
    m = re.match(r"^In what year was the milestone achieved: (.+?)\?$", p)
    if m:
        ev = m.group(1).strip().rstrip(".")
        ev = ev[0].upper() + ev[1:] if ev else ev
        return pick_variant(qid, [
            f"Dial in the exact calendar year of this spaceflight milestone: {ev}.",
            f"Pinpoint the year humanity achieved this orbital milestone: {ev}.",
        ], salt=107)

    # 24. CODEX_DUAL_RING trailing colon cleanup + opener diversification
    if arch == "CODEX_DUAL_RING":
        if p.endswith(":"):
            return p[:-1] + "."
        m = re.match(r"^Align each (African|Asian|European|American) nation \(([^)]+)\) with its official capital city\.$", p)
        if m:
            reg, nats = m.group(1), m.group(2)
            return pick_variant(qid, [
                f"Lock each {reg} nation ({nats}) onto its official capital city.",
                f"Pair each {reg} capital with its sovereign homeland ({nats}).",
                f"Link each {reg} state ({nats}) to its diplomatic capital.",
                f"Chart each {reg} nation ({nats}) alongside its official capital.",
            ], salt=109)
        m = re.match(r"^Align each element \(([^)]+)\) with its official IUPAC chemical symbol\.$", p)
        if m:
            elems = m.group(1)
            return pick_variant(qid, [
                f"Lock each element ({elems}) onto its official IUPAC periodic-table symbol.",
                f"Pair each chemical element ({elems}) with its official symbol.",
                f"Link {elems} to their exact IUPAC periodic-table symbols.",
            ], salt=113)
        m = re.match(r"^Match each Nobel laureate \(([^)]+)\) to their prize category\.$", p)
        if m:
            names = m.group(1)
            return pick_variant(qid, [
                f"Lock each Nobel laureate ({names}) onto their prize discipline.",
                f"Pair these Nobel laureates ({names}) with their honored categories.",
                f"Link each laureate ({names}) to the Nobel Prize field they won.",
            ], salt=127)
        m = re.match(r"^Match each nation \(([^)]+)\) to its official national currency\.$", p)
        if m:
            nats = m.group(1)
            return pick_variant(qid, [
                f"Lock each country ({nats}) onto its official national currency.",
                f"Pair each nation ({nats}) with the official currency it issues.",
            ], salt=131)

    return None


# =============================================================================
# 5. GENERAL QUIZ-BOWL & BARE-FRAGMENT EDITORIAL UPGRADES (C2, C3, C5)
# =============================================================================

DANGLING_END_WORDS = {
    "for", "of", "in", "to", "by", "from", "with", "at", "on", "as", "about",
    "into", "through", "over", "under", "between", "against", "during", "upon",
    "called", "named", "termed", "known", "used", "made", "found", "located",
    "measured", "written", "spoken", "played", "worn", "born", "from", "out",
    "off", "up", "down", "after", "before",
}

SAFE_WHAT_ENDING_WORDS = {
    "of", "by", "in", "on", "for", "from", "with", "as", "into", "through",
    "between", "about", "during", "under", "over", "against", "toward",
    "towards", "within", "without", "upon", "via", "called", "named", "termed",
    "labeled", "titled", "exhibiting", "producing", "causing", "forming",
    "creating", "making", "using", "containing", "involving", "including",
    "representing", "indicating", "measuring", "describing", "defining",
    "explaining", "showing", "requiring", "providing", "supplying", "make",
    "produce", "produces", "cause", "causes", "form", "forms", "create",
    "creates", "use", "uses", "contain", "contains", "involve", "involves",
    "include", "includes", "orbit", "orbits", "eat", "eats", "consume",
    "consumes", "absorb", "absorbs", "release", "releases", "emit", "emits",
    "reflect", "reflects", "transmit", "transmits", "carry", "carries",
    "store", "stores", "convert", "converts", "generate", "generates",
    "support", "supports", "prevent", "prevents", "control", "controls",
    "regulate", "regulates", "determine", "determines", "measure", "measures",
    "represent", "represents", "mean", "means", "equal", "equals",
    "is", "are", "was", "were", "be", "becomes", "become", "became",
}

# Preposition 'to' phrases that take a noun object (NOT infinitive verb)
NOUN_OBJECT_TO_VERBS = {
    "refers", "refer", "referred", "leads", "lead", "led", "due", "belongs",
    "belong", "compared", "adapted", "exposed", "converted", "similar",
    "equal", "equals", "proportional", "related", "connected", "attached",
    "opposed", "assigned", "applied", "rise", "closest", "nearest", "native",
    "unique", "essential", "vital", "key", "attributed", "linked", "tied",
    "corresponds", "correspond", "contributes", "contribute", "responds",
    "respond", "reacts", "react", "binds", "bind", "adheres", "adhere",
    "dedicated", "devoted", "subject", "prone", "sensitive", "vulnerable",
    "resistant", "immune", "equivalent", "identical", "parallel", "adjacent",
    "perpendicular", "tangent", "inverse", "contrary", "prior", "next", "indifferent",
}


def _lower_first_safe(s: str) -> str:
    """Lowercase first character only if it is not a proper-noun/acronym opener."""
    if not s:
        return s
    w = s.split()[0]
    if len(w) >= 2 and w[0].isupper() and w[1].isupper():
        return s
    if w in ("I", "I'm", "I've", "God", "Earth", "Mars", "Venus", "Jupiter", "Saturn", "Mercury", "Uranus", "Neptune", "Pluto", "Sun", "Moon", "DNA", "RNA", "ATP", "SQL", "CSS", "HTML", "HTTP", "TCP", "UDP", "CPU", "GPU", "RAM", "LED", "MRI", "GPS", "NASA", "NATO", "UNESCO", "WHO", "IMF", "EU", "UN", "UK", "US", "U.S.", "USA", "FIFA", "NBA", "NFL", "MLB", "NHL", "WWE", "UFC"):
        return s
    # Keep capitalized if likely proper noun (not a common function word)
    common_lower = {
        "the", "a", "an", "all", "every", "each", "some", "most", "many", "both",
        "when", "while", "if", "in", "on", "at", "by", "for", "from", "to", "with",
        "during", "after", "before", "under", "over", "between", "through", "as",
        "our", "your", "their", "its", "this", "that", "these", "those", "one", "two",
        "three", "four", "five", "plants", "animals", "cells", "humans", "people",
        "water", "air", "light", "heat", "sound", "energy", "matter", "force",
        "gravity", "blood", "bone", "skin", "muscle", "morning", "extensive",
        "salespeople", "electrons", "protons", "neutrons", "atoms", "molecules",
        "stars", "planets", "rocks", "soils", "waves", "gases", "liquids", "solids",
        "metals", "acids", "bases", "salts", "enzymes", "proteins", "vitamins",
        "minerals", "hormones", "bacteria", "viruses", "fungi", "insects", "birds",
        "fish", "mammals", "reptiles", "amphibians", "trees", "flowers", "seeds",
        "roots", "leaves", "stems", "ecosystems", "populations", "communities",
        "organisms", "species", "genes", "chromosomes", "mutations", "fossils",
        "volcanoes", "earthquakes", "glaciers", "rivers", "oceans", "clouds",
        "winds", "storms", "hurricanes", "tornadoes", "seasons", "eclipses",
        "tides", "markets", "firms", "consumers", "producers", "prices", "costs",
        "profits", "taxes", "tariffs", "budgets", "banks", "loans", "stocks",
        "bonds", "courts", "laws", "rights", "voters", "citizens", "leaders",
        "nations", "states", "governments", "treaties", "wars", "battles",
        "artists", "writers", "poets", "composers", "directors", "actors",
        "players", "teams", "coaches", "athletes", "computers", "programs",
        "networks", "servers", "routers", "algorithms", "databases", "circuits",
        "engines", "motors", "batteries", "magnets", "mirrors", "lenses",
        "prisms", "lasers", "satellites", "rockets", "telescopes", "microscopes",
    }
    if w.lower().rstrip(".,;:") in common_lower:
        return s[0].lower() + s[1:]
    return s


def upgrade_fragment_stem(q: Dict[str, Any]) -> Optional[str]:
    """Upgrade bare incomplete fragments ending in '...' or ':' in C5."""
    qid = int(q["qid"])
    p = str(q["prompt"]).strip()
    cat = str(q.get("l1Category", "")).strip() or DOMAIN_NAMES.get(int(q["l0Domain"]), "General Knowledge")
    ans = str(q.get("answerCorrect", "")).strip()

    if not (p.endswith("...") or p.endswith(":")):
        return None
    # Skip Codex or already-complete question ending in ':' (fix ': ' -> '?' on Q-words!)
    if q.get("archetype") == "CODEX_DUAL_RING":
        return None

    stem = p[:-3].rstrip() if p.endswith("...") else p[:-1].rstrip()
    if len(stem) < 8:
        return None

    # Special case: "All of the following ... EXCEPT:" / "except..."
    m = re.match(r"^All of the following (.+?)\s+except$", stem, re.I)
    if m:
        body = m.group(1).strip()
        return pick_variant(qid, [
            f"Spot the lone exception: three choices {body}—which one does NOT?",
            f"Find the outlier: every listed choice fits ({body}) EXCEPT which one?",
            f"Three of these {body}—pinpoint the single exception.",
        ], salt=137)

    # Special case: interrogative ending with ':' or '...' instead of '?' (including mid-sentence "which of the following...")
    if re.match(r"^(?:Which|What|Who|Where|When|Why|How|In which|In what|Of the following)\b", stem, re.I):
        return None
    if re.search(r"\b(?:which of the following|which of these)\b", stem, re.I) and "?" not in stem:
        cleaned = re.sub(r"\bwhich of the following\b", "which listed", stem, flags=re.I)
        return cleaned.rstrip(".,;:") + "?"
    # If stem already contains a complete question ending in '?', do not tack on '____.'
    if "?" in stem:
        return None

    # Special case: "The famous Drake equation attempts to answer the following question:"
    if re.search(r"\bthe following (?:question|statement|problem|claim|rule|principle|equation)$", stem, re.I):
        cleaned = re.sub(r"\bthe following (question|statement|problem|claim|rule|principle|equation)$", r"which \1", stem, flags=re.I)
        return cleaned + "?"

    # Check if answer starts with temporal/method/reason preposition (when stem ends on noun/clause)
    words = stem.split()
    last_w = words[-1].lower().strip(",;\"'()")
    prev_w = words[-2].lower().strip(",;\"'()") if len(words) >= 2 else ""

    # Case 1: "... is/are/was/were called the/a/an" or "... is the/a/an"
    m_art = re.match(r"^(.+\b(?:is|are|was|were|called|named|termed|known as|classified as|referred to as|example of|type of|form of|part of|process of|result of|fallacy of|unit of measurement is|cause of))\s+(?:the|an?)$", stem, re.I)
    if m_art:
        head = m_art.group(1).strip()
        # Only drop trailing article cleanly when head ends in a safe head word
        hw = head.split()[-1].lower()
        if hw in SAFE_WHAT_ENDING_WORDS:
            return pick_variant(qid, [
                f"{head} what?",
                f"In {cat}, {_lower_first_safe(head)} what?",
            ], salt=139)

    # Case 2: Ends with "to" — distinguish noun-object "to" vs infinitive "to"
    if last_w == "to":
        if prev_w in NOUN_OBJECT_TO_VERBS or (len(words) >= 3 and " ".join(words[-3:-1]).lower() in ("gives rise", "give rise", "gave rise", "in order")):
            if len(words) >= 3 and " ".join(words[-3:-1]).lower() == "in order":
                return f"{stem} accomplish what?"
            if prev_w in NOUN_OBJECT_TO_VERBS:
                return f"{stem} what?"
        # Infinitive "to" (e.g. "A bird builds a nest to..." -> "Shelter its offspring")
        if re.match(r"^(?:The |A |An )", stem):
            return pick_variant(qid, [
                f"Complete this {cat} principle: {stem} ____.",
                f"Lock in the missing finish ({cat}): {stem} ____.",
                f"Fill the blank: {stem} ____.",
            ], salt=149)

    # Case 3: Ends cleanly on a safe preposition, copula, or transitive verb -> "... what?"
    if last_w in SAFE_WHAT_ENDING_WORDS:
        # Guard: if answer starts with a preposition like "During...", "Via...", "By...", don't do "is what?" awkwardly
        if last_w in ("is", "are", "was", "were", "be") and re.match(r"^(?:Via|During|Before|After|Because|Since|When|Where|By|Through|At|In|On|Under|Over)\b", ans, re.I):
            pass  # fall through to clean Jeopardy blank frame
        else:
            # Make short fragments feel rich & Meridian-framed, keep long ones concise!
            if len(stem) <= 95:
                return pick_variant(qid, [
                    f"{stem} what?",
                    f"In {cat}, {_lower_first_safe(stem)} what?",
                    f"{stem} what?",
                ], salt=151)
            return f"{stem} what?"

    # Case 4: Colon/ellipsis after complete clause with method/temporal/causal answer
    if re.match(r"^(?:Via|Through|By using|By means of)\b", ans, re.I) and len(stem) <= 135:
        return f"{stem} — by what mechanism?"
    if re.match(r"^(?:During|Before|After|At the|In the first|In the second|In the third|On a \d)", ans, re.I) and len(stem) <= 145:
        return f"{stem} — when or on what timescale?"
    if re.match(r"^(?:Because|Since|Due to)\b", ans, re.I) and len(stem) <= 145:
        return f"{stem} — for what reason?"

    # Case 5: General clause/predicate completion (modals like 'will', 'must', 'most likely', nouns, etc.)
    if len(stem) <= 135:
        return pick_variant(qid, [
            f"Complete this {cat} clue: {stem} ____.",
            f"Fill the {cat} blank: {stem} ____.",
            f"Lock in the right completion: {stem} ____.",
            f"Finish this {cat} statement: {stem} ____.",
        ], salt=157)
    return f"{stem} ____."


def upgrade_quiz_bowl_prompt(q: Dict[str, Any]) -> Optional[str]:
    """Upgrade flat, repetitive quiz-bowl/database stems across C2, C3, C5."""
    qid = int(q["qid"])
    p = str(q["prompt"]).strip()
    arch = q.get("archetype", "")
    cat = str(q.get("l1Category", "")).strip() or DOMAIN_NAMES.get(int(q["l0Domain"]), "General Knowledge")

    if arch not in ("SIGHTLINE_LOCK", "CALIBRATOR_DIAL"):
        return None

    # First normalize interrogatives ending in ':' or '...'
    if re.match(r"^(?:Which|What|Who|Where|When|Why|How|In which|In what|Of the following)\b", p, re.I):
        if p.endswith(":"):
            p = p[:-1].rstrip() + "?"
        elif p.endswith("..."):
            p = p[:-3].rstrip() + "?"

    # 1. "Which author wrote '...'?" (83 Qs)
    m = re.match(r"^Which author wrote (.+)\?$", p)
    if m:
        work = m.group(1).strip()
        return pick_variant(qid, [
            f"Literary history credits {work} to which author?",
            f"Whose pen gave the world {work}?",
            f"Name the author who wrote {work}.",
            f"Which writer brought {work} into print?",
            f"On library shelves, {work} bears which author's name?",
        ], salt=163)

    # 2. "With which sport is X associated?" (30 Qs)
    m = re.match(r"^With which sport is (.+?) associated\?$", p)
    if m:
        person = m.group(1).strip()
        return pick_variant(qid, [
            f"{person} forged an enduring reputation in which sport?",
            f"Name the sport closely linked with {person}.",
            f"In competitive athletics, {person} rose to fame in which sport?",
            f"Which sport made {person} a headline figure?",
        ], salt=167)

    # 3. "Which philosopher famously said '...'?" (26 Qs)
    m = re.match(r"^Which philosopher famously said (.+)\?$", p)
    if m:
        quote = m.group(1).strip()
        return pick_variant(qid, [
            f"Attribute this enduring philosophical line: {quote}.",
            f"Which thinker left posterity the famous words {quote}?",
            f"Whose philosophy gave us the line {quote}?",
        ], salt=173)

    # 4. "Which actor played (the role of) X in Y?" (17+ Qs)
    m = re.match(r"^Which actor played (?:the role of )?(.+?) in (.+)\?$", p)
    if m:
        char, work = m.group(1).strip(), m.group(2).strip()
        return pick_variant(qid, [
            f"On screen in {work}, which actor portrayed {char}?",
            f"Who stepped into the role of {char} in {work}?",
            f"Name the actor who brought {char} to life in {work}.",
        ], salt=179)

    # 5. "Which director directed X?" (13+ Qs)
    m = re.match(r"^Which director directed (.+)\?$", p)
    if m:
        film = m.group(1).strip()
        return pick_variant(qid, [
            f"Who sat in the director's chair for {film}?",
            f"Which filmmaker helmed {film}?",
            f"Behind the camera, who directed {film}?",
        ], salt=181)

    # 6. "Name the movie that matches the following plot summary: ..."
    m = re.match(r"^Name the movie that matches the following plot summary:\s*(.+)$", p)
    if m:
        summ = m.group(1).strip().rstrip(".")
        return pick_variant(qid, [
            f"Identify the film behind this synopsis: {summ}.",
            f"Which movie unfolds with this plot: {summ}?",
        ], salt=191)

    # 7. "What is the name of (the) X?" / "What was the name of (the) X?" (130+ Qs)
    m = re.match(r"^What (is|was) the name of (.+)\?$", p)
    if m:
        tense, rest = m.group(1), m.group(2).strip()
        last_w = rest.split()[-1].lower().strip(".,;\"'()")
        if last_w not in DANGLING_END_WORDS:
            if tense == "is":
                return pick_variant(qid, [
                    f"Name {rest}.",
                    f"Identify {rest}.",
                    f"By what name do we know {rest}?",
                ], salt=193)
            return pick_variant(qid, [
                f"Name {rest}.",
                f"What title identified {rest}?",
                f"Identify {rest}.",
            ], salt=197)

    # 8. "What is the word for X?" / "What is the term (used) (for|when) X?"
    m = re.match(r"^What is the word for (.+)\?$", p)
    if m:
        defn = m.group(1).strip()
        return pick_variant(qid, [
            f"Name the exact word describing {defn}.",
            f"In lexicon lore, which word denotes {defn}?",
            f"Which term specifically names {defn}?",
        ], salt=199)
    m = re.match(r"^What is the term (used )?(for|when) (.+)\?$", p)
    if m:
        prep, defn = m.group(2), m.group(3).strip()
        if prep == "for":
            return pick_variant(qid, [
                f"Identify the precise term for {defn}.",
                f"What specialized term denotes {defn}?",
                f"Name the exact term used for {defn}.",
            ], salt=211)
        return pick_variant(qid, [
            f"What specialized term applies when {defn}?",
            f"Name the exact term used when {defn}.",
        ], salt=223)

    # 9. "What type/kind of <N> is <X>?" (115+ Qs)
    m = re.match(r"^What (?:type|kind) of ([a-zA-Z -]{2,28}) is (.+)\?$", p)
    if m:
        noun, subj = m.group(1).strip(), m.group(2).strip()
        last_w = subj.split()[-1].lower().strip(".,;\"'()")
        if last_w not in DANGLING_END_WORDS and len(subj) <= 85:
            return pick_variant(qid, [
                f"Classify {subj}: it is which type of {noun}?",
                f"In {cat}, {subj} belongs to which variety of {noun}?",
                f"Which kind of {noun} is {subj}?",
            ], salt=227)

    # 10. "In which country is X?" / "Where in the world X?"
    m = re.match(r"^In which country is (.+)\?$", p)
    if m:
        place = m.group(1).strip()
        last_w = place.split()[-1].lower().strip(".,;\"'()")
        if last_w not in DANGLING_END_WORDS:
            return pick_variant(qid, [
                f"Place it on the Meridian map: which country is home to {place}?",
                f"Which nation hosts {place}?",
                f"Travel to which country to find {place}?",
            ], salt=229)
    m = re.match(r"^Where in the world ((?:is|are|was|were|do|does|did|can|would)\b.+)\?$", p)
    if m:
        rest = m.group(1).strip()
        return pick_variant(qid, [
            f"Pinpoint on the globe: where {rest}?",
            f"Trace it on the world map: where {rest}?",
        ], salt=233)

    # 11. "Which of the following ..." (852 Qs across all 12 domains!)
    m = re.match(r"^Which of the following best describes (.+)\?$", p)
    if m:
        body = m.group(1).strip()
        return pick_variant(qid, [
            f"Pinpoint the statement that best captures {body}.",
            f"Which description most accurately defines {body}?",
            f"Spot the option that best explains {body}.",
        ], salt=239)
    m = re.match(r"^Which of the following is NOT (.+)\?$", p)
    if m:
        body = m.group(1).strip()
        return pick_variant(qid, [
            f"Spot the outlier: which option is NOT {body}?",
            f"Find the odd one out—which choice is NOT {body}?",
            f"Three choices fit—which one is NOT {body}?",
        ], salt=241)
    m = re.match(r"^Which of the following is (?:an? )?example of (.+)\?$", p)
    if m:
        body = m.group(1).strip()
        return pick_variant(qid, [
            f"Among these choices, which exemplifies {body}?",
            f"Spot the genuine example of {body}.",
            f"Identify the clear example of {body}.",
        ], salt=251)
    m = re.match(
        r"^Which of the following (is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should|best|most|least|[a-z]+s) (.+)\?$",
        p,
    )
    if m:
        v, rest = m.group(1), m.group(2).strip()
        # Distinguish plural nouns ("planets", "moons", "items", "cavities", "entities", "elements") from 3rd-person verbs ("shifts", "causes", "contains")
        finite_aux = (
            "is", "are", "was", "were", "has", "have", "had", "does", "do", "did",
            "can", "could", "will", "would", "may", "might", "must", "should", "best", "most", "least",
        )
        known_verbs_s = (
            "involves", "contains", "produces", "causes", "describes", "represents", "shows",
            "lists", "explains", "shifts", "increases", "decreases", "reduces", "creates",
            "forms", "gives", "makes", "takes", "requires", "allows", "prevents", "occurs",
            "happens", "belongs", "refers", "leads", "results", "depends", "differs", "uses",
            "helps", "keeps", "moves", "changes", "converts", "transfers", "absorbs", "releases",
            "emits", "reflects", "conducts", "acts", "serves", "works", "plays", "grows",
            "lives", "feeds", "eats", "holds", "carries", "stores", "breaks", "builds",
            "measures", "determines", "controls", "regulates", "affects", "influences",
            "indicates", "suggests", "demonstrates", "illustrates", "provides", "supplies",
            "supports", "protects", "separates", "connects", "links", "combines", "matches",
            "applies", "follows", "precedes", "begins", "ends", "starts", "stops", "runs",
            "passes", "travels", "flows", "rises", "falls", "drops", "remains", "stays",
            "becomes", "appears", "seems", "tends", "needs", "lacks", "includes", "excludes",
            "consists", "comprises", "violates", "satisfies", "maximizes", "minimizes",
        )
        if v in finite_aux or v in known_verbs_s:
            return pick_variant(qid, [
                f"Among these choices, which {v} {rest}?",
                f"Pinpoint the option that {v} {rest}." if v not in ("best", "most", "least") else f"Among these options, which {v} {rest}?",
                f"From the choices shown, which {v} {rest}?",
                f"Spot the match: which option {v} {rest}?",
            ], salt=257)
    # Non-greedy verb-free plural NP before an explicit finite auxiliary (NEVER 'best'/'most'/'least' alone!)
    m = re.match(
        r"^Which of the following ([a-zA-Z][a-zA-Z0-9' -]{1,36}?)\s+((?:is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should)\b.+)\?$",
        p,
    )
    if m:
        np, rest = m.group(1).strip(), m.group(2).strip()
        if not re.search(r"\b(?:is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should|best|most|least|that|which|who|where|when|the|a|an)\b", np, re.I):
            return pick_variant(qid, [
                f"Among these {np}, which {rest}?",
                f"Comparing these {np}, which {rest}?",
                f"From these {np}, which {rest}?",
                f"Looking at these {np}, which {rest}?",
            ], salt=263)

    # 12. Mid-sentence "Which of the following ..." (71 Qs — keep interrogative form matching '?')
    if "Which of the following " in p:
        repl = pick_variant(qid, [
            "Among these choices, which ",
            "From the options shown, which ",
            "Among these options, which ",
        ], salt=269)
        return p.replace("Which of the following ", repl, 1)

    # 13. "In which of the following ..." / "Of the following ..." / "Select the best ..."
    m = re.match(r"^In which of the following (.+)\?$", p)
    if m:
        return pick_variant(qid, [
            f"Among these options, in which {m.group(1).strip()}?",
            f"Pinpoint the case in which {m.group(1).strip()}.",
        ], salt=271)
    m = re.match(r"^Of the following ([^,]+),\s*(.+)\?$", p)
    if m:
        return pick_variant(qid, [
            f"Among these {m.group(1).strip()}, {m.group(2).strip()}?",
            f"Comparing these {m.group(1).strip()}, {m.group(2).strip()}?",
        ], salt=277)
    m = re.match(r"^Select the best (.+)\.$", p)
    if m:
        return pick_variant(qid, [
            f"Pinpoint the strongest {m.group(1).strip()}.",
            f"Identify the most accurate {m.group(1).strip()}.",
        ], salt=281)

    # 14. "Which of these ..." (481 Qs across C2, C3, C5!)
    m = re.match(
        r"^Which of these (is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should|best|most|least|provides|provide|warms|warm|causes|cause|contains|contain|produces|produce|shows|show|explains|explain|describes|describe|represents|represent|helps|help|allows|allow|prevents|prevent|gives|give|makes|make|forms|form|uses|use|keeps|keep|moves|move|changes|change|converts|convert|absorbs|absorb|releases|release|occurs|occur|happens|happen|belongs|belong|refers|refer|leads|lead|results|result|depends|depend|requires|require|affects|affect|increases|increase|decreases|decrease|reduces|reduce|separates|separate|connects|connect|determines|determine|measures|measure|controls|control|supports|support|protects|protect) (.+)\?$",
        p,
    )
    if m:
        v, rest = m.group(1), m.group(2).strip()
        return pick_variant(qid, [
            f"Among these choices, which {v} {rest}?",
            f"Spot the choice that {v} {rest}." if v not in ("best", "most", "least") else f"Among these options, which {v} {rest}?",
            f"From the four options, which {v} {rest}?",
        ], salt=283)
    m = re.match(
        r"^Which of these ([a-zA-Z][a-zA-Z -]{1,30}?)\s+((?:is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should)\b.+)\?$",
        p,
    )
    if m:
        np, rest = m.group(1).strip(), m.group(2).strip()
        if not re.search(r"\b(?:is|are|was|were|has|have|had|does|do|did|can|could|will|would|may|might|must|should|best|most|least|that|which|who|where|when|the|a|an)\b", np, re.I):
            return pick_variant(qid, [
                f"Among these {np}, which {rest}?",
                f"Comparing these {np}, which {rest}?",
                f"From these {np}, which {rest}?",
            ], salt=293)

    # 15. General "What is the <NP>?" / "What was the <NP>?" / "Who is/was the <NP>?"
    # (Skip QID <= 832 handcrafted Gold Master stems so we don't flatten custom prose!)
    if qid > 832:
        m = re.match(r"^What is the (.+)\?$", p)
        if m:
            rest = m.group(1).strip()
            last_w = rest.split()[-1].lower().strip(".,;\"'()")
            if last_w not in DANGLING_END_WORDS and not re.search(r"\b(?:called|known as|used for|made of)\b", rest, re.I):
                if arch == "CALIBRATOR_DIAL":
                    return pick_variant(qid, [
                        f"Calibrate the {rest}.",
                        f"Dial in the {rest}.",
                        f"Pinpoint the {rest}.",
                    ], salt=307)
                if re.search(r"\bname\b", rest, re.I):
                    return pick_variant(qid, [
                        f"Identify the {rest}.",
                        f"Give the {rest}.",
                        f"In {cat}, identify the {rest}.",
                    ], salt=311)
                return pick_variant(qid, [
                    f"Identify the {rest}.",
                    f"Name the {rest}.",
                    f"In {cat}, identify the {rest}.",
                    f"Pinpoint the {rest}.",
                ], salt=311)

        m = re.match(r"^What was the (.+)\?$", p)
        if m:
            rest = m.group(1).strip()
            last_w = rest.split()[-1].lower().strip(".,;\"'()")
            if last_w not in DANGLING_END_WORDS and re.search(r"\b(?:first|last|only|former|ancient|original|main|primary|\d{4}|century|war|battle)\b", rest, re.I):
                if re.search(r"\bname\b", rest, re.I):
                    return pick_variant(qid, [
                        f"Recall the {rest}.",
                        f"Identify the {rest}.",
                    ], salt=313)
                return pick_variant(qid, [
                    f"Name the {rest}.",
                    f"Recall the {rest}.",
                    f"Identify the {rest}.",
                ], salt=313)

        m = re.match(r"^Who (is|was) the (.+)\?$", p)
        if m:
            tense, rest = m.group(1), m.group(2).strip()
            last_w = rest.split()[-1].lower().strip(".,;\"'()")
            if last_w not in DANGLING_END_WORDS:
                if re.search(r"\bname\b", rest, re.I):
                    return f"Identify the {rest}."
                if tense == "is":
                    return pick_variant(qid, [
                        f"Name the {rest}.",
                        f"Identify the {rest}.",
                    ], salt=317)
                return pick_variant(qid, [
                    f"Identify the figure who served as the {rest}.",
                    f"Name the {rest}.",
                ], salt=331)

    return None


# =============================================================================
# 6. BOOLQ `GAUNTLET_SHATTER` (C6: 13719..20165) POLISH + DECLARATIVE CONVERTER
# =============================================================================

CURATED_PROPER_NOUNS: Dict[str, str] = {
    "america": "America",
    "american": "American",
    "england": "England",
    "english": "English",
    "britain": "Britain",
    "british": "British",
    "france": "France",
    "french": "French",
    "germany": "Germany",
    "german": "German",
    "japan": "Japan",
    "japanese": "Japanese",
    "china": "China",
    "chinese": "Chinese",
    "india": "India",
    "indian": "Indian",
    "russia": "Russia",
    "russian": "Russian",
    "spain": "Spain",
    "spanish": "Spanish",
    "italy": "Italy",
    "italian": "Italian",
    "canada": "Canada",
    "canadian": "Canadian",
    "australia": "Australia",
    "australian": "Australian",
    "mexico": "Mexico",
    "mexican": "Mexican",
    "brazil": "Brazil",
    "brazilian": "Brazilian",
    "ireland": "Ireland",
    "irish": "Irish",
    "scotland": "Scotland",
    "scottish": "Scottish",
    "wales": "Wales",
    "welsh": "Welsh",
    "croatia": "Croatia",
    "croatian": "Croatian",
    "europe": "Europe",
    "european": "European",
    "asia": "Asia",
    "asian": "Asian",
    "africa": "Africa",
    "african": "African",
    "antarctica": "Antarctica",
    "london": "London",
    "paris": "Paris",
    "tokyo": "Tokyo",
    "berlin": "Berlin",
    "rome": "Rome",
    "moscow": "Moscow",
    "beijing": "Beijing",
    "california": "California",
    "texas": "Texas",
    "florida": "Florida",
    "chicago": "Chicago",
    "hollywood": "Hollywood",
    "disney": "Disney",
    "marvel": "Marvel",
    "netflix": "Netflix",
    "google": "Google",
    "microsoft": "Microsoft",
    "facebook": "Facebook",
    "youtube": "YouTube",
    "xbox": "Xbox",
    "playstation": "PlayStation",
    "nintendo": "Nintendo",
    "pokemon": "Pokémon",
    "bible": "Bible",
    "christmas": "Christmas",
    "easter": "Easter",
    "halloween": "Halloween",
    "olympics": "Olympics",
    "olympic": "Olympic",
    "nba": "NBA",
    "nfl": "NFL",
    "mlb": "MLB",
    "nhl": "NHL",
    "fifa": "FIFA",
    "ncaa": "NCAA",
    "nasa": "NASA",
    "fbi": "FBI",
    "cia": "CIA",
    "nato": "NATO",
    "icc": "ICC",
    "usa": "USA",
    "uk": "UK",
    "eu": "EU",
    "wwii": "WWII",
    "ww2": "WWII",
    "wwi": "WWI",
    "ww1": "WWI",
    "alsation": "Alsatian",
    "iceland": "Iceland",
    "icelandic": "Icelandic",
    "norway": "Norway",
    "norwegian": "Norwegian",
    "sweden": "Sweden",
    "swedish": "Swedish",
    "denmark": "Denmark",
    "danish": "Danish",
    "finland": "Finland",
    "finnish": "Finnish",
    "poland": "Poland",
    "polish": "Polish",
    "greece": "Greece",
    "greek": "Greek",
    "egypt": "Egypt",
    "egyptian": "Egyptian",
    "israel": "Israel",
    "israeli": "Israeli",
    "iran": "Iran",
    "iraq": "Iraq",
    "korea": "Korea",
    "korean": "Korean",
    "vietnam": "Vietnam",
    "thailand": "Thailand",
    "indonesia": "Indonesia",
    "philippines": "Philippines",
    "argentina": "Argentina",
    "chile": "Chile",
    "colombia": "Colombia",
    "peru": "Peru",
    "cuba": "Cuba",
    "jamaica": "Jamaica",
    "haiti": "Haiti",
    "kenya": "Kenya",
    "nigeria": "Nigeria",
    "ghana": "Ghana",
    "morocco": "Morocco",
    "algeria": "Algeria",
    "switzerland": "Switzerland",
    "swiss": "Swiss",
    "austria": "Austria",
    "austrian": "Austrian",
    "belgium": "Belgium",
    "belgian": "Belgian",
    "netherlands": "Netherlands",
    "dutch": "Dutch",
    "portugal": "Portugal",
    "portuguese": "Portuguese",
    "hungary": "Hungary",
    "ukraine": "Ukraine",
    "ukrainian": "Ukrainian",
    "pakistan": "Pakistan",
    "bangladesh": "Bangladesh",
    "singapore": "Singapore",
    "malaysia": "Malaysia",
    "taiwan": "Taiwan",
    "ps2": "PS2",
    "ps3": "PS3",
    "ps4": "PS4",
    "ps5": "PS5",
    "nyc": "NYC",
}

MULTIWORD_PROPER_FIXES: List[Tuple[str, str]] = [
    ("wii u", "Wii U"),
    ("hall of fame", "Hall of Fame"),
    ("prime minister", "Prime Minister"),
    ("house of commons", "House of Commons"),
    ("house of lords", "House of Lords"),
    ("european economic area", "European Economic Area"),
    ("european union", "European Union"),
    ("united states", "United States"),
    ("united kingdom", "United Kingdom"),
    ("new york", "New York"),
    ("new zealand", "New Zealand"),
    ("south america", "South America"),
    ("north america", "North America"),
    ("central america", "Central America"),
    ("south africa", "South Africa"),
    ("south korea", "South Korea"),
    ("north korea", "North Korea"),
    ("dominican republic", "Dominican Republic"),
    ("puerto rico", "Puerto Rico"),
    ("atlantic ocean", "Atlantic Ocean"),
    ("pacific ocean", "Pacific Ocean"),
    ("indian ocean", "Indian Ocean"),
    ("arctic ocean", "Arctic Ocean"),
    ("mother's day", "Mother's Day"),
    ("father's day", "Father's Day"),
    ("valentine's day", "Valentine's Day"),
    ("new year's day", "New Year's Day"),
    ("new year's eve", "New Year's Eve"),
    ("civil war", "Civil War"),
    ("cold war", "Cold War"),
    ("world war", "World War"),
    ("super bowl", "Super Bowl"),
    ("world cup", "World Cup"),
    ("world series", "World Series"),
    ("harry potter", "Harry Potter"),
    ("star wars", "Star Wars"),
    ("game of thrones", "Game of Thrones"),
    ("lord of the rings", "Lord of the Rings"),
    ("golden boot", "Golden Boot"),
    ("supreme court", "Supreme Court"),
    ("white house", "White House"),
    ("windows movie maker", "Windows Movie Maker"),
    ("world trade center", "World Trade Center"),
    ("world trade centers", "World Trade Centers"),
    ("popeye the sailor man", "Popeye the Sailor Man"),
    ("are you the one", "Are You the One?"),
    ("my name is earl", "My Name Is Earl"),
    ("mr pibb", "Mr. Pibb"),
    ("pibb xtra", "Pibb Xtra"),
    ("first order", "First Order"),
    ("haroun and the sea of stories", "Haroun and the Sea of Stories"),
    ("prince george's county", "Prince George's County"),
    ("coke studio", "Coke Studio"),
    ("dodge ram", "Dodge Ram"),
    ("sesame street", "Sesame Street"),
    ("burger king", "Burger King"),
    ("al kaline", "Al Kaline"),
    ("to sir with love", "To Sir, with Love"),
]

# Negative polarity items that break declarative inversion ("Is there any X?" -> *"There is any X.")
RE_NPI = re.compile(r"\b(?:any|anyone|anybody|anything|anywhere|anymore|any more|ever|yet|at all|either|whatsoever)\b", re.I)

# Verbs/auxiliaries that indicate a clause (so <NP> is NOT a simple noun phrase)
RE_CLAUSE_VERB = re.compile(
    r"\b(?:is|are|was|were|be|been|being|do|does|did|have|has|had|can|could|will|would|shall|should|may|might|must|going|supposed|allowed|able|still|actually|really|considered)\b",
    re.I,
)


def restore_boolq_casing_and_grammar(prompt: str, why: str) -> str:
    """Fix slang, broken auxiliaries, stray ' The ', and lowercase proper nouns using Wikipedia whyExplanation."""
    s = prompt.strip()

    # 1. Text-speak & grammar fixes
    # Fix standalone lowercase 'u' -> 'you' ONLY when preceded by modal/verb (not 'Wii u')
    s = re.sub(r"\b(Can|Could|Do|Did|Will|Would|Should|May|Are|Have|If|When|Where)\s+u\b", r"\1 you", s)
    s = re.sub(r"\bur\b", "your", s)
    s = re.sub(r"\bi-(\d+)\b", r"I-\1", s)
    s = re.sub(r"\bsuch thing as\b", "such a thing as", s, flags=re.I)
    s = re.sub(r"\b(Does|Did)\s+((?:the\s+)?[A-Za-z0-9'-]+(?:\s+[A-Za-z0-9'-]+)?)\s+has\b", r"\1 \2 have", s)
    s = re.sub(r"\bpenalty shoot out\b", "penalty shootout", s, flags=re.I)
    # Strip noisy trailing "yes or no?" from raw web queries
    s = re.sub(r"\s+yes or no\?$", "?", s, flags=re.I)
    # Fix "in la?" -> "in LA?" when Wikipedia explains Los Angeles / Louisiana
    if re.search(r"\bin la\?$", s) and re.search(r"\b(?:Los Angeles|Louisiana|LA)\b", why or ""):
        s = re.sub(r"\bin la\?$", "in LA?", s)

    # 2. Multi-word proper nouns (case-insensitive)
    for lo_pat, proper in MULTIWORD_PROPER_FIXES:
        if lo_pat in s.lower():
            # Preserve exact casing replacement
            s = re.sub(rf"\b{re.escape(lo_pat)}\b", proper, s, flags=re.I)

    # 3. Single-word curated proper nouns/acronyms (only when lowercase in prompt)
    def _cap_curated(m: re.Match) -> str:
        w = m.group(0)
        wl = w.lower()
        if wl in CURATED_PROPER_NOUNS and w != CURATED_PROPER_NOUNS[wl]:
            return CURATED_PROPER_NOUNS[wl]
        return w

    s = re.sub(r"\b[a-z][a-z0-9]{1,}\b", _cap_curated, s)

    # 4. Harvest ground-truth multi-word & single-word capitalized proper nouns from Wikipedia `why`!
    why_body = re.sub(r"^(?:TRUE|FALSE):\s*", "", why or "")
    # 4a. Multi-word Proper Noun Phrases (2-4 capitalized words, e.g. "South America", "Al Kaline", "Prince George's County")
    phrase_in_why: Dict[str, str] = {}
    for m in re.finditer(r"\b([A-Z][A-Za-z'-]+(?:\s+(?:of|the|and|in|on|for|de|la|del|da|di)?\s*[A-Z][A-Za-z'-]+){1,3})\b", why_body):
        phr = m.group(1)
        pl = phr.lower()
        if pl not in phrase_in_why and len(pl) >= 5:
            # Skip sentence-initial common openers like "The United" -> keep only if doesn't start with bare The/A/An/In/On/As/At/By/For/If/It/This/That/There/Both/Some/Many/Most/Each/All/When/While
            first_tok = phr.split()[0]
            if first_tok not in ("The", "A", "An", "In", "On", "As", "At", "By", "For", "If", "It", "This", "That", "There", "Both", "Some", "Many", "Most", "Each", "All", "When", "While", "After", "Before", "During", "Under", "Over", "From", "With", "However", "Although", "Because", "Since", "Also", "Yes", "No"):
                phrase_in_why[pl] = phr
    for pl, phr in sorted(phrase_in_why.items(), key=lambda kv: -len(kv[0])):
        if pl in s.lower() and phr not in s:
            s = re.sub(rf"\b{re.escape(pl)}\b", phr, s, flags=re.I)

    # 4b. Single-word mid-sentence capitalized proper nouns
    cap_in_why: Dict[str, str] = {}
    for m in re.finditer(r"(?<=[a-z,]\s)([A-Z][A-Za-z'-]{2,})\b", why_body):
        tok = m.group(1)
        tl = tok.lower()
        if tl not in cap_in_why and not re.search(rf"\b{re.escape(tl)}\b", why_body):
            cap_in_why[tl] = tok

    if cap_in_why:
        def _cap_from_why(m: re.Match) -> str:
            w = m.group(0)
            if w in cap_in_why:
                return cap_in_why[w]
            return w

        s = re.sub(r"\b[a-z][a-z'-]{2,}\b", _cap_from_why, s)

    # 5. Fix stray mid-sentence capitalized ' The ' (e.g. 'Is Elder Scrolls Online The same as Skyrim?')
    def _fix_stray_the(m: re.Match) -> str:
        nxt = m.group(1)
        if f"The {nxt}" in why_body:
            return m.group(0)
        return f" the {nxt}"

    s = re.sub(r"(?<=[\w'\)])\s+The\s+([A-Za-z]+)", _fix_stray_the, s)

    return polish_whitespace_punct(s)


def convert_boolq_to_gauntlet_claim(prompt: str) -> Optional[str]:
    """Convert 100% grammatically airtight Yes/No BoolQ questions into crisp Gauntlet verification claims."""
    p = prompt.strip()
    if not p.endswith("?"):
        return None
    body = p[:-1].strip()
    if RE_NPI.search(body):
        return None

    # 1. "Is there such a thing as <X>?" -> "There is such a thing as <X>."
    m = re.match(r"^Is there such a thing as (.+)$", body)
    if m:
        return f"There is such a thing as {m.group(1).strip()}."

    # 2. "Is there a/an <X>?" -> "There is a/an <X>."
    m = re.match(r"^Is there (an? .+)$", body)
    if m:
        return f"There is {m.group(1).strip()}."

    # 3. "Are there <X>?" (no NPI, not starting with 'still' alone) -> "There are <X>."
    m = re.match(r"^Are there (.+)$", body)
    if m and not re.match(r"^(?:any|more|still)\b", m.group(1), re.I):
        return f"There are {m.group(1).strip()}."

    # 4. "Is it true that <X>?" -> "<X>."
    m = re.match(r"^Is it true that (.+)$", body, re.I)
    if m:
        rest = m.group(1).strip()
        return rest[0].upper() + rest[1:] + "."

    # 5. "Is it <adj> to/for/that <X>?" -> "It is <adj> to/for/that <X>."
    m = re.match(
        r"^Is it (possible|legal|illegal|safe|normal|common|rare|necessary|mandatory|required|healthy|dangerous|allowed|permitted|forbidden|true) (to|for|that) (.+)$",
        body,
    )
    if m:
        return f"It is {m.group(1)} {m.group(2)} {m.group(3).strip()}."

    # 6. "Can you <X>?" -> "You can <X>." (clean subject = 'You', no NPI)
    m = re.match(r"^Can you ([a-z].+)$", body)
    if m and not re.search(r"\b(?:still|really|actually)\b", m.group(1), re.I):
        return f"You can {m.group(1).strip()}."

    # 7. "Is/Are <NP> <clear copular predicate>?" -> "<NP> is/are <predicate>."
    m = re.match(
        r"^(Is|Are) ([^?]+?)\s+((?:the same(?: thing)? as|part of|a part of|based on|located in|made of|made from|owned by|legal tender in|in the Hall of Fame|a member of|members of|the capital of|the largest|the tallest|the oldest|the longest|the highest|the smallest|the fastest|the only|bigger than|older than|larger than|higher than|longer than|closer to|farther from|heavier than|faster than|older|younger|taller|shorter|wider|deeper)\b.*)$",
        body,
    )
    if m:
        aux, subj, pred = m.group(1).lower(), m.group(2).strip(), m.group(3).strip()
        words_s = subj.split()
        if 1 <= len(words_s) <= 6 and not RE_CLAUSE_VERB.search(subj):
            if aux == "is" and " and " in subj.lower() and pred.lower().startswith("the same"):
                verb = "are"
            else:
                verb = aux
            subj_cap = subj[0].upper() + subj[1:]
            return f"{subj_cap} {verb} {pred}."

    # 8. "Is <clean short NP> a/an <NOUN PHRASE>?"
    m = re.match(r"^Is ([^?]+?)\s+(an? [A-Za-z].+)$", body)
    if m:
        subj, pred = m.group(1).strip(), m.group(2).strip()
        words_s = subj.split()
        if (
            1 <= len(words_s) <= 5
            and not RE_CLAUSE_VERB.search(subj)
            and not re.match(r"^(?:there|it|that|this|he|she|one)\b", subj, re.I)
            and not re.search(r"\b(?:in|on|at|to|for|with|from|by|of)\s*$", pred, re.I)
            and not re.search(r"\b(?:real|true)\s+(?:person|place|story|thing)\b", pred, re.I)
        ):
            subj_cap = subj[0].upper() + subj[1:]
            return f"{subj_cap} is {pred}."

    # 9. "Was/Were <clean short NP> <clear predicate>?"
    m = re.match(
        r"^(Was|Were) ([^?]+?)\s+((?:the first|the last|the only|the tallest|the largest|the oldest|based on|filmed in|shot in|born in|written by|directed by|part of|a real|a member of|located in|built in|founded in)\b.+)$",
        body,
    )
    if m:
        aux, subj, pred = m.group(1).lower(), m.group(2).strip(), m.group(3).strip()
        if 1 <= len(subj.split()) <= 5 and not RE_CLAUSE_VERB.search(subj):
            subj_cap = subj[0].upper() + subj[1:]
            return f"{subj_cap} {aux} {pred}."

    return None


# =============================================================================
# 7. GENERIC FALLBACK `clues` & `whyExplanation` UPGRADES (ALL 12 DOMAINS!)
# =============================================================================

DOMAIN_CLUE0_TEMPLATES: Dict[int, List[str]] = {
    0: [
        "Place this {cat} question in its exact historical era and theater.",
        "Anchor the chronology in {cat}: match the ruler, treaty, or turning point.",
        "Think like a {cat} archivist—separate genuine period facts from later anachronisms.",
        "Trace cause and era within {cat} to rule out misplaced historical decoys.",
    ],
    1: [
        "Apply core {cat} principles—check the governing mechanism or physical law.",
        "Look beneath the surface in {cat}: match the exact property, scale, or reaction.",
        "Test each choice against established {cat} theory and measurement units.",
        "In {cat}, isolate the precise scientific principle at work in this clue.",
    ],
    2: [
        "Visualize the Meridian atlas for {cat}—check continent, latitude, and borders.",
        "Anchor this {cat} clue by region, landform, or geopolitical capital.",
        "Orient yourself on the {cat} map to eliminate geographically distant decoys.",
        "Cross-check physical and political boundaries in {cat} before locking in.",
    ],
    3: [
        "Match movement, medium, and era within {cat} to isolate the authentic work.",
        "In {cat}, distinguish the creator's signature style from neighboring schools.",
        "Anchor this {cat} clue by artistic period, structure, or provenance.",
        "Recall the patronage, technique, and master behind this {cat} landmark.",
    ],
    4: [
        "Place this {cat} milestone in its decade, studio, or cultural scene.",
        "Cross-check title, cast, and creator within {cat} to clear look-alike decoys.",
        "Think broadcast trivia for {cat}—separate the true credit from close peers.",
        "Anchor the release era and franchise history in {cat} before locking in.",
    ],
    5: [
        "Check rulebook, venue, and championship record in {cat}.",
        "Anchor this {cat} clue by era, league, and career milestone.",
        "Think like a {cat} historian—separate verified records from rival contenders.",
        "Verify the competition format, scoring rule, or athlete legacy in {cat}.",
    ],
    6: [
        "Trace architecture, protocol, or engineering lineage in {cat}.",
        "In {cat}, check the exact specification, layer, or inventor behind the system.",
        "Distinguish the true technical standard from adjacent jargon in {cat}.",
        "Evaluate how the hardware, code, or network actually operates in {cat}.",
    ],
    7: [
        "Check taxonomy, anatomy, or ecological niche within {cat}.",
        "In {cat}, match the biological structure to its exact physiological function.",
        "Separate true {cat} mechanisms from common textbook misconceptions.",
        "Trace the organism, cell process, or habitat clue embedded in {cat}.",
    ],
    8: [
        "Weigh the institutional rule, doctrine, or empirical finding in {cat}.",
        "In {cat}, distinguish the exact technical definition from everyday usage.",
        "Check jurisdiction, economic mechanism, or behavioral model in {cat}.",
        "Separate the verified {cat} principle from plausible-sounding policy decoys.",
    ],
    9: [
        "Check traditional ingredients, regional origin, and technique in {cat}.",
        "In {cat}, match the signature craft method or culinary staple to its source.",
        "Distinguish authentic {cat} heritage from modern fusion look-alikes.",
        "Trace region, flavor profile, and material craft within {cat}.",
    ],
    10: [
        "Anchor this {cat} clue in its canonical text, pantheon, or philosophical school.",
        "In {cat}, match the character, author, or doctrine to its primary source.",
        "Separate the authentic {cat} tradition from neighboring myths or thinkers.",
        "Recall the literary movement, symbolic motif, or treatise tested in {cat}.",
    ],
    11: [
        "Verify the formal definition, theorem, or exact calculation in {cat}.",
        "In {cat}, test boundary cases and check the logical structure step by step.",
        "Eliminate choices that violate parity, order of magnitude, or formal rules in {cat}.",
        "Work cleanly from axioms and invariants to lock the exact {cat} result.",
    ],
}

GAUNTLET_CLUE0_TEMPLATES: Dict[int, List[str]] = {
    0: [
        "Historical ledger check ({cat}): test whether the stated timeline and link actually hold.",
        "Weigh this {cat} claim carefully—watch for famous myths or off-by-one-era swaps.",
        "Inspect the historical record for {cat} before choosing VERIFY or DEBUNK.",
    ],
    1: [
        "Scientific reality check ({cat}): test the claim against physical law and verified data.",
        "Evaluate this {cat} proposition strictly—watch for widespread textbook myths.",
        "Cross-check the underlying {cat} mechanism before locking VERIFY or DEBUNK.",
    ],
    2: [
        "Atlas check ({cat}): test the stated border, sovereignty, or geographic claim.",
        "Examine the map closely for {cat}—watch for common capital or jurisdiction traps.",
        "Verify the real-world geography behind this {cat} statement before locking in.",
    ],
    3: [
        "Curator's check ({cat}): verify authorship, origin, or architectural attribution.",
        "Test this {cat} claim against the verified museum and architectural record.",
        "Watch for misattributed works or swapped styles in this {cat} check.",
    ],
    4: [
        "Broadcast archive check ({cat}): confirm the exact credit, canon, or release fact.",
        "Weigh this {cat} claim carefully—watch for franchise mix-ups and pop-culture myths.",
        "Verify the true production or story record in {cat} before locking in.",
    ],
    5: [
        "Official rulebook check ({cat}): confirm whether the rule, stat, or honor really stands.",
        "Test this {cat} claim against league bylaws and verified championship records.",
        "Watch for narrow rule exceptions or swapped records in this {cat} check.",
    ],
    6: [
        "Spec-sheet check ({cat}): verify whether the standard, feature, or compatibility truly holds.",
        "Evaluate this {cat} claim strictly—watch for version limits or platform exceptions.",
        "Test the real engineering record in {cat} before locking VERIFY or DEBUNK.",
    ],
    7: [
        "Field-guide check ({cat}): verify the species trait, classification, or biological rule.",
        "Weigh this {cat} claim carefully—watch for folk myths versus real taxonomy.",
        "Check biological reality in {cat} before locking VERIFY or DEBUNK.",
    ],
    8: [
        "Statute & civic check ({cat}): confirm whether the legal, civic, or institutional rule holds.",
        "Examine this {cat} claim closely—jurisdiction and statutory scope often flip the verdict.",
        "Weigh official law and precedent in {cat} before locking VERIFY or DEBUNK.",
    ],
    9: [
        "Culinary & craft check ({cat}): verify the ingredient, regional rule, or botanical truth.",
        "Test this {cat} claim against authentic culinary and material standards.",
        "Watch for popular kitchen myths or label confusion in this {cat} check.",
    ],
    10: [
        "Canon check ({cat}): verify what the primary text, myth, or tradition actually says.",
        "Weigh this {cat} claim carefully—later adaptations often differ from the original text.",
        "Check canonical {cat} lore before locking VERIFY or DEBUNK.",
    ],
    11: [
        "Formal logic check ({cat}): test the claim against strict definitions and edge cases.",
        "Examine every quantifier in this {cat} statement—one counterexample flips it FALSE.",
        "Verify the exact mathematical rule in {cat} before locking VERIFY or DEBUNK.",
    ],
}

GAUNTLET_CLUE1_TEMPLATES: List[str] = [
    "Check every qualifier—words like 'always,' 'only,' or 'same' often decide the verdict.",
    "Distinguish official status or formal rules from casual everyday assumptions.",
    "Verify both halves of the relationship: one swapped name or scope detail turns it FALSE.",
    "Pause for edge cases—jurisdiction, version boundaries, and taxonomic technicalities matter.",
    "Test whether the claim holds strictly on the record rather than merely by popular reputation.",
    "Check whether two closely related concepts are genuinely identical or legally distinct.",
]


def build_structural_clue1(qid: int, ans: str, arch: str, prompt: str) -> str:
    """Bug-free, broadcast-worthy Meridian Clue 2 (NEVER calls digits 'letters' or '1 characters'!)."""
    if arch == "GAUNTLET_SHATTER":
        return pick_variant(qid, GAUNTLET_CLUE1_TEMPLATES, salt=401)

    a = ans.strip()
    if not a:
        return "Eliminate options that clash with the core definition in the clue."

    words = a.split()
    n_words = len(words)
    first_ch = a[0]

    # Numeric or symbolic opener (e.g. "365 days", "100°C", "3%", "12", "-5", "$100", "0x1A")
    if not first_ch.isalpha():
        if re.match(r"^[+-]?\d+\.\d+$", a):
            return pick_variant(qid, [
                "Expect a decimal numerical value rather than a whole integer.",
                "Pinpoint the exact decimal figure among the choices.",
            ], salt=407)
        if re.match(r"^[+-]?\d+$", a):
            digits = len(re.sub(r"[^0-9]", "", a))
            if digits == 1:
                return pick_variant(qid, [
                    "Expect a single-digit numerical answer.",
                    "Pinpoint a one-digit exact value among the choices.",
                ], salt=409)
            if digits == 2:
                return pick_variant(qid, [
                    "Expect a two-digit numerical value.",
                    "Narrow your focus to a two-digit number.",
                ], salt=419)
            return pick_variant(qid, [
                f"Look for a {digits}-digit exact numerical figure.",
                f"The verified result is a {digits}-digit numeric value.",
            ], salt=421)
        if re.search(r"[°%$€£]|(?:km|cm|mm|kg|mg|m/s|hz|volts?|watts?|grams?|liters?|days?|years?|seconds?|minutes?|hours?|bits?|bytes?|miles?|feet|light-years?)", a, re.I):
            return pick_variant(qid, [
                "Look for a measured quantity pairing a number with its exact unit.",
                "Check both numerical scale and unit label to isolate the right figure.",
                "The target answer combines a specific figure with its unit of measurement.",
            ], salt=431)
        return pick_variant(qid, [
            "Look for a numeric or symbolic expression rather than a prose phrase.",
            "Pinpoint the exact quantitative or symbolic notation among the options.",
            "Compare signs, ratios, and numerical magnitude carefully before locking in.",
        ], salt=433)

    # Pure alphabetic single word (or clean hyphenated word)
    init = first_ch.upper()
    alpha_only = re.sub(r"[^A-Za-z]", "", a)
    if n_words == 1:
        if len(alpha_only) >= 3 and len(a) == len(alpha_only):
            n_ch = len(a)
            return pick_variant(qid, [
                f"One-word answer: {n_ch} letters, opening with '{init}'.",
                f"Pinpoint a single {n_ch}-letter term starting with '{init}'.",
                f"Look for a {n_ch}-letter entry filed under '{init}'.",
                f"Single-word target beginning with '{init}' ({n_ch} letters).",
            ], salt=439)
        if len(a) >= 2:
            return pick_variant(qid, [
                f"Single-term answer beginning with '{init}'.",
                f"Look for a compact one-token entry starting with '{init}'.",
            ], salt=443)
        return "Look for a single-letter symbol or notation."

    # Multi-word alphabetic answer
    if n_words <= 4:
        w_label = {2: "Two-word", 3: "Three-word", 4: "Four-word"}[n_words]
        return pick_variant(qid, [
            f"{w_label} answer opening with the letter '{init}'.",
            f"Look for a {n_words}-word choice starting with '{init}'.",
            f"Pinpoint the {n_words}-word entry led by '{init}'.",
            f"{w_label} term — its opening word begins with '{init}'.",
        ], salt=449)

    # Longer phrase answer (5+ words — e.g. ARC/MMLU conceptual explanations)
    return pick_variant(qid, [
        f"Expect a full descriptive phrase ({n_words} words) opening with '{init}'.",
        f"Look for a concise {n_words}-word explanation beginning with '{init}'.",
        f"Pinpoint the {n_words}-word statement led by '{init}'.",
    ], salt=457)


def extract_safe_c2_clue_from_why(q: Dict[str, Any]) -> Optional[str]:
    """For C2 items with generic 'Filed under ...' clue[0], extract a non-leaking second sentence from whyExplanation if safe!"""
    why = str(q.get("whyExplanation", "")).strip()
    if not why or len(why) < 40:
        return None
    # Split on sentence boundary
    parts = re.split(r"(?<=[.!?])\s+", why)
    if len(parts) < 2:
        return None
    for cand in parts[1:]:
        cand = cand.strip()
        if 28 <= len(cand) <= 145:
            # Verify ZERO answer leak & ZERO text defects
            if not check_question_leaks(q, str(q["prompt"]), [cand]) and not check_text_defects(cand, int(q["l0Domain"])):
                return cand
    return None


def extract_entity_for_gauntlet_clue(prompt: str) -> Optional[str]:
    """Pull a clean proper-noun anchor from a Gauntlet prompt (mid-sentence capitalized entity)."""
    generic_single = {
        "true", "false", "yes", "no", "verify", "debunk", "the", "this", "that", "there",
        "day", "station", "studio", "war", "city", "state", "park", "king", "queen", "man",
        "woman", "season", "movie", "series", "time", "world", "house", "street", "county",
        "ocean", "river", "island", "book", "game", "show", "law", "act", "cup", "bowl",
        "award", "prize", "hall", "school", "college", "center", "centre", "tower", "bridge",
        "club", "team", "league", "order", "empire", "republic", "union", "church", "court",
    }
    m = re.search(r"(?<=[a-z]\s)([A-Z][A-Za-z0-9'-]+(?:\s+(?:of|the|in)?\s*[A-Z][A-Za-z0-9'-]+){0,2})", prompt)
    if not m:
        return None
    ent = m.group(1).strip().rstrip("?.,;:")
    if len(ent) < 3 or len(ent) > 36:
        return None
    if ent.lower() in generic_single:
        return None
    return ent


def upgrade_clues_and_why(q: Dict[str, Any], new_prompt: str) -> Tuple[List[str], str, bool, bool]:
    """Upgrade generic fallback clues and whyExplanation across all cohorts. Returns (clues, why, clues_changed, why_changed)."""
    qid = int(q["qid"])
    l0 = int(q["l0Domain"])
    arch = q.get("archetype", "")
    cat = str(q.get("l1Category", "")).strip() or DOMAIN_NAMES.get(l0, "General Knowledge")
    ans = str(q.get("answerCorrect", "")).strip()

    old_clues = [str(c) for c in (q.get("clues") or ["", ""])]
    while len(old_clues) < 2:
        old_clues.append("")
    c0, c1 = old_clues[0], old_clues[1]
    old_why = str(q.get("whyExplanation", "")).strip()
    new_c0, new_c1, new_why = c0, c1, old_why

    # --- A. Upgrade generic clue[0] ---
    is_gen_c0 = (
        c0.startswith("Topic sector:")
        or c0.startswith("Lightning check (")
        or c0.startswith("Filed under ")
        or c0.startswith("Dossier: ")
        or (c0.startswith("Verified ") and "dossier" in c0)
    )
    if is_gen_c0:
        if arch == "GAUNTLET_SHATTER":
            ent = extract_entity_for_gauntlet_clue(new_prompt)
            if ent and (qid % 3 != 0):
                cand = pick_variant(qid, [
                    f"Focus on {ent} within {cat}: test whether the stated relationship truly holds.",
                    f"Cross-check the verified {cat} record on {ent} before locking VERIFY or DEBUNK.",
                    f"Put {ent} under the {cat} lens—separate confirmed fact from plausible myth.",
                ], salt=503)
            else:
                cand = pick_variant(qid, GAUNTLET_CLUE0_TEMPLATES.get(l0, GAUNTLET_CLUE0_TEMPLATES[8]), salt=509).format(cat=cat)
            new_c0 = polish_whitespace_punct(cand)
        else:
            mined = extract_safe_c2_clue_from_why(q) if c0.startswith("Filed under ") else None
            if mined:
                new_c0 = polish_whitespace_punct(mined)
            else:
                m_sub = re.match(r"^Filed under ([^;]+);", c0)
                m_dos = re.match(r"^Verified .+ dossier \(([^)]+)\);", c0)
                sub_lbl = (m_sub.group(1).strip() if m_sub else (m_dos.group(1).strip() if m_dos else "")).strip()
                if re.search(r"\b(?:NOT|EXCEPT|outlier|exception)\b", new_prompt):
                    cand = pick_variant(qid, [
                        f"Elimination test in {cat}: three options share a rule—isolate the lone mismatch.",
                        f"Scan all four {cat} choices for the single exception that breaks the pattern.",
                    ], salt=521)
                elif sub_lbl and sub_lbl.lower() != cat.lower() and not check_clue_leaks(q, sub_lbl):
                    cand = pick_variant(qid, [
                        f"Narrow your {cat} lens to {sub_lbl}—match the exact defining trait.",
                        f"Anchor this {cat} clue in {sub_lbl} to separate the true match from close decoys.",
                        f"Focus on {sub_lbl} within {cat} and test each choice for precision.",
                    ], salt=523)
                else:
                    tpls = DOMAIN_CLUE0_TEMPLATES.get(l0, DOMAIN_CLUE0_TEMPLATES[8])
                    cand = tpls[0].format(cat=cat)
                    for off in range(len(tpls)):
                        trial = polish_whitespace_punct(pick_variant(qid, tpls, salt=541 + off).format(cat=cat))
                        if not check_text_defects(trial, l0) and not check_clue_leaks(q, trial):
                            cand = trial
                            break
                new_c0 = polish_whitespace_punct(cand)

    # --- B. Upgrade generic clue[1] ---
    is_gen_c1 = (
        bool(re.search(r"verified answer (?:beginning|starting) with", c1))
        or c1.startswith("Watch for subtle exceptions")
        or c1.startswith("The verified numeric answer")
        or c1.startswith("Single-word term beginning with")
        or c1.startswith("Check exact names, definitions")
        or c1.startswith("Rule out decoys that conflict")
    )
    if is_gen_c1:
        new_c1 = polish_whitespace_punct(build_structural_clue1(qid, ans, arch, new_prompt))
    elif c1.strip() == "Citation focus.":
        new_c1 = pick_variant(qid, [
            "Match this laureate's lifetime achievement to the exact Nobel prize discipline.",
            "Distinguish between the scientific, literary, diplomatic, and economic Nobel committees.",
            "Recall the signature breakthrough or body of work behind this Nobel honor.",
        ], salt=547)

    # --- C. Upgrade generic whyExplanation ---
    # 1. C5: "Verified answer: <ANS> (<Cat>)."
    if old_why.startswith("Verified answer:"):
        cand_why = pick_variant(qid, [
            f"Confirmed in {cat}: \"{ans}\" is the precise match for this clue.",
            f"The {cat} ledger locks in \"{ans}\" as the accurate answer.",
            f"In {cat}, \"{ans}\" stands as the exact verified solution.",
            f"Meridian's {cat} record confirms \"{ans}\"—setting it apart from the three decoys.",
            f"The verified {cat} match is \"{ans}\".",
            f"Within {cat}, \"{ans}\" directly satisfies the principle tested here.",
        ], salt=601)
        new_why = polish_whitespace_punct(cand_why)

    # 2. C3: "The verified answer is <ANS>, cataloged under <Cat> (<Sub>) in the Open Trivia archive."
    elif old_why.startswith("The verified answer is ") and "cataloged under " in old_why:
        m_w = re.match(r"^The verified answer is (.+?), cataloged under (.+?)(?: in the Open Trivia archive)?\.?$", old_why)
        sub_ctx = m_w.group(2).strip() if m_w else cat
        cand_why = pick_variant(qid, [
            f"Confirmed under {sub_ctx}: \"{ans}\" is the exact match.",
            f"Meridian's {sub_ctx} archive locks in \"{ans}\" as the verified answer.",
            f"In {sub_ctx}, \"{ans}\" stands as the accurate solution.",
            f"The verified {sub_ctx} record confirms \"{ans}\".",
        ], salt=607)
        new_why = polish_whitespace_punct(cand_why)

    # 3. C2 Gauntlet: "Verified TRUE/FALSE (<Cat>): The statement '...' matches/contradicts..."
    elif re.match(r"^Verified (TRUE|FALSE) \(([^)]+)\):\s*", old_why):
        m_tf = re.match(r"^Verified (TRUE|FALSE) \(([^)]+)\):\s*(.+)$", old_why)
        verdict, vcat, rest = m_tf.group(1), m_tf.group(2), m_tf.group(3).strip()
        if verdict == "TRUE":
            cand_why = pick_variant(qid, [
                f"Confirmed TRUE ({vcat}): the claim stands on the verified record.",
                f"Verified TRUE in {vcat}: {rest}",
            ], salt=613)
        else:
            cand_why = pick_variant(qid, [
                f"Debunked — FALSE ({vcat}): {rest}",
                f"False on the {vcat} record: {rest}",
            ], salt=617)
        new_why = polish_whitespace_punct(cand_why)

    # Transactional safety check on new_c0, new_c1, new_why (independently from prompt)!
    if new_c0 != c0:
        if check_text_defects(new_c0, l0) or check_clue_leaks(q, new_c0):
            new_c0 = c0
    if new_c1 != c1:
        if check_text_defects(new_c1, l0) or check_clue_leaks(q, new_c1):
            new_c1 = c1
    if new_why != old_why:
        if check_text_defects(new_why, l0):
            new_why = old_why

    new_clues = [new_c0, new_c1] + old_clues[2:]
    return new_clues, new_why, (new_clues != old_clues), (new_why != old_why)


# =============================================================================
# 8. MASTER TRANSFORMATION PIPELINES
# =============================================================================


def upgrade_questions_json(data: Dict[str, Any]) -> Dict[str, Any]:
    qs = data["questions"]
    stats = {
        "total": len(qs),
        "prompts_upgraded": 0,
        "clues_upgraded": 0,
        "why_upgraded": 0,
        "any_upgraded": 0,
        "by_domain_prompt": Counter(),
        "by_domain_clues": Counter(),
        "by_domain_why": Counter(),
        "by_domain_any": Counter(),
        "by_domain_total": Counter(),
        "samples_by_domain": defaultdict(list),
    }

    for q in qs:
        qid = int(q["qid"])
        l0 = int(q["l0Domain"])
        arch = q.get("archetype", "")
        stats["by_domain_total"][l0] += 1

        orig_prompt = str(q["prompt"])
        orig_clues = list(q.get("clues") or [])
        orig_why = str(q.get("whyExplanation", ""))
        cand_prompt: Optional[str] = None

        if qid not in PROTECTED_PROMPT_QIDS:
            if qid in EXACT_PROMPT_FIXES:
                cand_prompt = EXACT_PROMPT_FIXES[qid]
            elif arch == "GAUNTLET_SHATTER" and qid >= 13719:
                polished = restore_boolq_casing_and_grammar(orig_prompt, orig_why)
                decl = convert_boolq_to_gauntlet_claim(polished)
                cand_prompt = decl if decl else (polished if polished != orig_prompt else None)
            else:
                cand_prompt = upgrade_structured_prompt(q)
                if cand_prompt is None:
                    cand_prompt = upgrade_fragment_stem(q)
                if cand_prompt is None:
                    cand_prompt = upgrade_quiz_bowl_prompt(q)

        final_prompt = orig_prompt
        if cand_prompt is not None:
            cand_prompt = polish_whitespace_punct(cand_prompt)
            # Enforce MUST_END_QMARK_QIDS
            if qid in MUST_END_QMARK_QIDS and not cand_prompt.endswith("?"):
                cand_prompt = orig_prompt
            # Enforce length, zero text defects, zero answer leaks, year cue preservation
            is_yr = RE_YEAR_PROMPT_CUE.search(orig_prompt) is not None or RE_YEAR_UNIT.match(str((q.get("calibratorExt") or {}).get("unit", ""))) is not None
            if (
                cand_prompt != orig_prompt
                and len(cand_prompt) <= MAX_PROMPT_LEN
                and not check_text_defects(cand_prompt, l0, is_year_ctx=is_yr)
                and not check_question_leaks(q, cand_prompt, orig_clues)
            ):
                final_prompt = cand_prompt

        prompt_changed = final_prompt != orig_prompt
        if prompt_changed:
            q["prompt"] = final_prompt

        new_clues, new_why, clues_changed, why_changed = upgrade_clues_and_why(q, final_prompt)
        if clues_changed:
            q["clues"] = new_clues
        if why_changed:
            q["whyExplanation"] = new_why

        if prompt_changed:
            stats["prompts_upgraded"] += 1
            stats["by_domain_prompt"][l0] += 1
        if clues_changed:
            stats["clues_upgraded"] += 1
            stats["by_domain_clues"][l0] += 1
        if why_changed:
            stats["why_upgraded"] += 1
            stats["by_domain_why"][l0] += 1
        if prompt_changed or clues_changed or why_changed:
            stats["any_upgraded"] += 1
            stats["by_domain_any"][l0] += 1

        if prompt_changed and len(stats["samples_by_domain"][l0]) < 5:
            stats["samples_by_domain"][l0].append({
                "qid": qid,
                "archetype": arch,
                "before_prompt": orig_prompt,
                "after_prompt": final_prompt,
                "before_why": orig_why[:90],
                "after_why": new_why[:90],
            })

    return stats


def upgrade_gold_venue_packs(gdata: Dict[str, Any]) -> Dict[str, Any]:
    stats = {
        "total": 0,
        "prompts_upgraded": 0,
        "clues_upgraded": 0,
        "over185_before": 0,
        "over185_after": 0,
        "by_domain_prompt": Counter(),
        "by_domain_total": Counter(),
        "samples": [],
    }

    all_items: List[Dict[str, Any]] = list(gdata.get("questions") or [])
    for bc in gdata.get("bossChains") or []:
        all_items.extend(bc.get("steps") or [])

    stats["total"] = len(all_items)

    for q in all_items:
        qid = int(q["qid"])
        l0 = int(q["l0Domain"])
        stats["by_domain_total"][l0] += 1
        orig_prompt = str(q["prompt"])
        if len(orig_prompt) > MAX_PROMPT_LEN:
            stats["over185_before"] += 1

        cand_prompt: Optional[str] = GOLD_PROMPT_UPGRADES.get(qid)
        # Also diversify repetitive Codex openers in Gold Venue Packs
        if cand_prompt is None and q.get("archetype") == "CODEX_DUAL_RING":
            if orig_prompt.startswith("Match each ") and (qid % 3 == 0):
                cand_prompt = "Lock each " + orig_prompt[len("Match each "):]
            elif orig_prompt.startswith("Align each ") and (qid % 3 == 1):
                cand_prompt = "Link each " + orig_prompt[len("Align each "):]

        if cand_prompt is not None:
            cand_prompt = polish_whitespace_punct(cand_prompt)
            is_yr = RE_YEAR_PROMPT_CUE.search(orig_prompt) is not None or RE_YEAR_UNIT.match(str((q.get("calibratorExt") or {}).get("unit", ""))) is not None
            defects = check_text_defects(cand_prompt, l0, is_year_ctx=is_yr)
            leaks = check_question_leaks(q, cand_prompt, q.get("clues") or [])
            assert len(cand_prompt) <= MAX_PROMPT_LEN, f"Gold QID {qid} still > {MAX_PROMPT_LEN}: {len(cand_prompt)}"
            assert not defects, f"Gold QID {qid} prompt defect {defects}: {cand_prompt}"
            assert not leaks, f"Gold QID {qid} prompt leak {leaks}: {cand_prompt}"
            if cand_prompt != orig_prompt:
                q["prompt"] = cand_prompt
                stats["prompts_upgraded"] += 1
                stats["by_domain_prompt"][l0] += 1
                if len(stats["samples"]) < 12:
                    stats["samples"].append({
                        "qid": qid,
                        "domain": l0,
                        "before": orig_prompt,
                        "after": cand_prompt,
                    })

        if len(str(q["prompt"])) > MAX_PROMPT_LEN:
            stats["over185_after"] += 1

        # Upgrade stubby Gold Venue clues (syncing both clues[1] and clueTiers[2].clueText!)
        if qid in GOLD_CLUE1_UPGRADES:
            new_c1 = polish_whitespace_punct(GOLD_CLUE1_UPGRADES[qid])
            assert not check_text_defects(new_c1, l0), f"Gold QID {qid} clue1 defect: {new_c1}"
            assert not check_question_leaks(q, str(q["prompt"]), [q["clues"][0], new_c1]), f"Gold QID {qid} clue1 leak"
            if q["clues"][1] != new_c1:
                q["clues"][1] = new_c1
                if isinstance(q.get("clueTiers"), list) and len(q["clueTiers"]) >= 3:
                    q["clueTiers"][2]["clueText"] = new_c1
                stats["clues_upgraded"] += 1

    return stats


# =============================================================================
# 9. EXHAUSTIVE VERIFIER & PARITY CHECKER
# =============================================================================


def md5_bytes(b: bytes) -> str:
    return hashlib.md5(b).hexdigest()


def is_clean_runtime_candidate(q: Dict[str, Any]) -> bool:
    """Exact parity mirror of `isCleanShardCandidate` in `src/forge/ShardDecoder.ts`."""
    if q.get("archetype") != "SIGHTLINE_LOCK":
        return True
    l0 = int(q.get("l0Domain", 0))
    ans_low = str(q.get("answerCorrect", "")).strip().lower()
    if not ans_low or ans_low in ("unknown", "n/a", "none") or RE_LETTER_REF_OPTION.match(ans_low):
        return False
    dist_lows = [
        str(d["text"] if isinstance(d, dict) else d).strip().lower()
        for d in (q.get("distractors") or [])
    ]
    if any(RE_LETTER_REF_OPTION.match(dt) for dt in dist_lows):
        return False
    if l0 != 11 and len(ans_low) >= 3:
        p_low = str(q.get("prompt", "")).lower()
        if len(ans_low) >= 4 and ans_low in p_low:
            return False
        for cl in (q.get("clues") or []):
            if len(ans_low) >= 4 and ans_low in str(cl).lower():
                return False
        stripped = re.sub(r"^(?:the|a|an|republic of|kingdom of|state of|city of)\s+", "", ans_low, flags=re.I).strip()
        if len(stripped) >= 5 and stripped in p_low and int(q.get("qid", 0)) != 16:
            return False
        ans_toks = [t for t in re.split(r"[^a-z0-9]+", stripped) if len(t) >= 4 and t not in LEAK_STOPWORDS]
        if len(ans_toks) >= 2 and all(has_word_stem(p_low, singular_stem(t)) for t in ans_toks):
            dist_all = any(
                len([t for t in re.split(r"[^a-z0-9]+", dt) if len(t) >= 4 and t not in LEAK_STOPWORDS]) >= 2
                and all(has_word_stem(p_low, singular_stem(t)) for t in re.split(r"[^a-z0-9]+", dt) if len(t) >= 4 and t not in LEAK_STOPWORDS)
                for dt in dist_lows
            )
            if not dist_all:
                return False
    return True


def verify_all_outputs(before_playable_qids: Optional[Set[int]] = None) -> Tuple[bool, Dict[str, Any]]:
    errors: List[str] = []

    pub_q_path = PUB_DATA / "questions.json"
    pub_gz_path = PUB_DATA / "questions.json.gz"
    godot_q_path = GODOT_DATA / "questions.json"
    godot_gz_path = GODOT_DATA / "questions.json.gz"
    gold_path = PUB_DATA / "gold_venue_packs.json"

    pub_q_bytes = pub_q_path.read_bytes()
    pub_gz_bytes = pub_gz_path.read_bytes()
    godot_q_bytes = godot_q_path.read_bytes()
    godot_gz_bytes = godot_gz_path.read_bytes()

    if md5_bytes(pub_q_bytes) != md5_bytes(godot_q_bytes):
        errors.append("MD5 mismatch: public/data/questions.json != godot/data/questions.json")
    if md5_bytes(pub_gz_bytes) != md5_bytes(godot_gz_bytes):
        errors.append("MD5 mismatch: public/data/questions.json.gz != godot/data/questions.json.gz")
    if md5_bytes(gzip.decompress(pub_gz_bytes)) != md5_bytes(pub_q_bytes):
        errors.append("Gzip mismatch: gunzip(public/data/questions.json.gz) != public/data/questions.json")

    qdata = json.loads(pub_q_bytes.decode("utf-8"))
    qs = qdata["questions"]
    if len(qs) != 20165:
        errors.append(f"Expected 20,165 questions in questions.json, found {len(qs)}")

    gdata = json.loads(gold_path.read_bytes().decode("utf-8"))
    g_all = list(gdata.get("questions") or [])
    for bc in gdata.get("bossChains") or []:
        g_all.extend(bc.get("steps") or [])
    if len(g_all) != 712:
        errors.append(f"Expected 712 Gold Venue items, found {len(g_all)}")

    defect_counts: Counter[str] = Counter()
    max_q_len = 0
    max_g_len = 0
    residual_verified_why = 0
    residual_topic_sector = 0
    residual_lightning_check = 0
    residual_letter_digit_bug = 0
    residual_citation_stub = 0
    playable_count = 0

    for src_name, items in (("questions.json", qs), ("gold_venue_packs.json", g_all)):
        for q in items:
            qid = int(q["qid"])
            l0 = int(q["l0Domain"])
            p = str(q["prompt"])
            clues = [str(c) for c in (q.get("clues") or [])]
            why = str(q.get("whyExplanation", ""))
            ans = str(q.get("answerCorrect", ""))
            is_yr = RE_YEAR_PROMPT_CUE.search(p) is not None or RE_YEAR_UNIT.match(str((q.get("calibratorExt") or {}).get("unit", ""))) is not None

            if src_name == "questions.json":
                max_q_len = max(max_q_len, len(p))
            else:
                max_g_len = max(max_g_len, len(p))
            if len(p) > MAX_PROMPT_LEN:
                defect_counts["PROMPT_OVER_185"] += 1
                if len(errors) < 30:
                    errors.append(f"{src_name} QID {qid}: prompt len {len(p)} > {MAX_PROMPT_LEN}")

            if src_name == "questions.json" and qid in MUST_END_QMARK_QIDS and not p.endswith("?"):
                defect_counts["MISSING_QMARK_REQUIRED"] += 1
                errors.append(f"QID {qid} must end with '?'")

            if why.startswith("Verified answer:"):
                residual_verified_why += 1
            if clues and clues[0].startswith("Topic sector:"):
                residual_topic_sector += 1
            if clues and clues[0].startswith("Lightning check ("):
                residual_lightning_check += 1
            if len(clues) > 1 and re.search(r"beginning with the letter '\d'", clues[1]):
                residual_letter_digit_bug += 1
            if len(clues) > 1 and clues[1].strip() == "Citation focus.":
                residual_citation_stub += 1

            for fname, txt in [("prompt", p), ("why", why)] + [(f"clue{i}", c) for i, c in enumerate(clues)]:
                for d in check_text_defects(txt, l0, is_year_ctx=is_yr):
                    k = d.split(":")[0]
                    defect_counts[k] += 1
                    if len(errors) < 30:
                        errors.append(f"{src_name} QID {qid} {fname}: {d} -> {txt[:100]!r}")

            playable = is_clean_runtime_candidate(q)
            if playable:
                playable_count += 1
                for lk in check_question_leaks(q, p, clues):
                    k = lk.split(":")[0]
                    defect_counts[k] += 1
                    if len(errors) < 30:
                        errors.append(f"{src_name} QID {qid}: {lk}")
            elif before_playable_qids is not None and qid in before_playable_qids:
                defect_counts["NEW_PLAYABILITY_REGRESSION"] += 1
                errors.append(f"{src_name} QID {qid}: became unplayable after rewrite!")

            # Verify no broken letter-ref MCQ options
            for opt in [ans] + [(d["text"] if isinstance(d, dict) else str(d)) for d in (q.get("distractors") or [])]:
                if RE_LETTER_REF_OPTION.match(opt.strip()):
                    defect_counts["BROKEN_LETTER_REF_OPTION"] += 1
                    errors.append(f"{src_name} QID {qid}: broken letter-ref option {opt!r}")

            # Verify Gold clueTiers sync
            if src_name == "gold_venue_packs.json" and isinstance(q.get("clueTiers"), list) and len(q["clueTiers"]) >= 3:
                if q["clueTiers"][1].get("clueText") != clues[0] or q["clueTiers"][2].get("clueText") != clues[1]:
                    defect_counts["GOLD_CLUETIERS_DESYNC"] += 1
                    errors.append(f"Gold QID {qid}: clueTiers out of sync with clues")

    summary = {
        "questions_count": len(qs),
        "gold_count": len(g_all),
        "playable_count": playable_count,
        "max_prompt_len_questions": max_q_len,
        "max_prompt_len_gold": max_g_len,
        "md5_questions_json": md5_bytes(pub_q_bytes),
        "md5_questions_gz": md5_bytes(pub_gz_bytes),
        "parity_ok": (
            md5_bytes(pub_q_bytes) == md5_bytes(godot_q_bytes)
            and md5_bytes(pub_gz_bytes) == md5_bytes(godot_gz_bytes)
            and md5_bytes(gzip.decompress(pub_gz_bytes)) == md5_bytes(pub_q_bytes)
        ),
        "residual_verified_why": residual_verified_why,
        "residual_topic_sector": residual_topic_sector,
        "residual_lightning_check": residual_lightning_check,
        "residual_letter_digit_bug": residual_letter_digit_bug,
        "residual_citation_stub": residual_citation_stub,
        "defect_counts": dict(defect_counts),
        "errors": errors,
    }
    return (len(errors) == 0 and sum(defect_counts.values()) == 0), summary


def assert_invariance(before_qs: List[Dict[str, Any]], after_qs: List[Dict[str, Any]], label: str) -> None:
    assert len(before_qs) == len(after_qs), f"{label}: count changed {len(before_qs)} -> {len(after_qs)}"
    immutable_keys = (
        "qid", "l0Domain", "l1Category", "l2Subcategory", "archetype",
        "irtB", "answerCorrect", "distractors", "calibratorExt",
        "codexExt", "gauntletExt", "heroRelicId", "glyphId",
    )
    for b, a in zip(before_qs, after_qs):
        for k in immutable_keys:
            if b.get(k) != a.get(k):
                raise AssertionError(f"{label} QID {b.get('qid')}: immutable field '{k}' modified!")


def main() -> int:
    parser = argparse.ArgumentParser(description="Upgrade Tier-1 & Gold Venue stems/clues/explanations to Jeopardy/Meridian craft")
    parser.add_argument("--verify", action="store_true", help="Verify existing files without modifying anything")
    parser.add_argument("--samples-out", type=str, default=None, help="Optional JSON path to save before/after samples & metrics")
    args = parser.parse_args()

    if args.verify:
        ok, summ = verify_all_outputs()
        print(json.dumps(summ, indent=2, ensure_ascii=False))
        return 0 if ok else 1

    print("=" * 78)
    print("WORLD'S SMARTEST — TIER-1 & GOLD VENUE JEOPARDY EDITORIAL UPGRADE")
    print("=" * 78)

    pub_q_path = PUB_DATA / "questions.json"
    pub_gz_path = PUB_DATA / "questions.json.gz"
    godot_q_path = GODOT_DATA / "questions.json"
    godot_gz_path = GODOT_DATA / "questions.json.gz"
    gold_path = PUB_DATA / "gold_venue_packs.json"

    qdata = json.loads(pub_q_path.read_text(encoding="utf-8"))
    q_before = copy.deepcopy(qdata["questions"])
    before_playable = {int(q["qid"]) for q in q_before if is_clean_runtime_candidate(q)}
    q_stats = upgrade_questions_json(qdata)
    assert_invariance(q_before, qdata["questions"], "questions.json")

    gdata = json.loads(gold_path.read_text(encoding="utf-8"))
    g_before = copy.deepcopy(list(gdata.get("questions") or []) + [s for bc in (gdata.get("bossChains") or []) for s in (bc.get("steps") or [])])
    before_playable |= {int(q["qid"]) for q in g_before if is_clean_runtime_candidate(q)}
    g_stats = upgrade_gold_venue_packs(gdata)
    g_after = list(gdata.get("questions") or []) + [s for bc in (gdata.get("bossChains") or []) for s in (bc.get("steps") or [])]
    assert_invariance(g_before, g_after, "gold_venue_packs.json")

    # Serialize & sync byte-identically across public/data and godot/data!
    raw_q_bytes = json.dumps(qdata, ensure_ascii=False, indent=2).encode("utf-8")
    gz_q_bytes = gzip.compress(raw_q_bytes, compresslevel=9, mtime=0)
    pub_q_path.write_bytes(raw_q_bytes)
    pub_gz_path.write_bytes(gz_q_bytes)
    if GODOT_DATA.exists():
        godot_q_path.write_bytes(raw_q_bytes)
        godot_gz_path.write_bytes(gz_q_bytes)

    raw_g_bytes = json.dumps(gdata, ensure_ascii=False, indent=2).encode("utf-8")
    gold_path.write_bytes(raw_g_bytes)

    ok, summ = verify_all_outputs(before_playable_qids=before_playable)

    print(f"\n[questions.json] Total: {q_stats['total']:,} | Prompts upgraded: {q_stats['prompts_upgraded']:,} | Clues upgraded: {q_stats['clues_upgraded']:,} | Why upgraded: {q_stats['why_upgraded']:,} | Any field upgraded: {q_stats['any_upgraded']:,}")
    print("\nPer-Domain Upgrade Counts (0..11):")
    print(f"  {'Dom':>3} | {'Domain Name':22s} | {'Total':>5} | {'Prompts':>7} | {'Clues':>6} | {'Why':>6} | {'Any':>6}")
    for d in range(12):
        print(
            f"  {d:3d} | {DOMAIN_NAMES[d]:22s} | {q_stats['by_domain_total'][d]:5d} | "
            f"{q_stats['by_domain_prompt'][d]:7d} | {q_stats['by_domain_clues'][d]:6d} | "
            f"{q_stats['by_domain_why'][d]:6d} | {q_stats['by_domain_any'][d]:6d}"
        )

    print(f"\n[gold_venue_packs.json] Total: {g_stats['total']} | Prompts upgraded: {g_stats['prompts_upgraded']} | Clues upgraded: {g_stats['clues_upgraded']} | >185 chars: {g_stats['over185_before']} -> {g_stats['over185_after']}")
    print(f"\n[VERIFY] parity_ok={summ['parity_ok']} | max_prompt_len(Q)={summ['max_prompt_len_questions']} | max_prompt_len(Gold)={summ['max_prompt_len_gold']}")
    print(f"  MD5 questions.json    : {summ['md5_questions_json']}")
    print(f"  MD5 questions.json.gz : {summ['md5_questions_gz']}")
    print(f"  Residual boilerplate  : VerifiedWhy={summ['residual_verified_why']}, TopicSector={summ['residual_topic_sector']}, LightningCheck={summ['residual_lightning_check']}, DigitLetterBug={summ['residual_letter_digit_bug']}")
    print(f"  Defect counts         : {summ['defect_counts']}")

    if args.samples_out:
        out_obj = {
            "q_stats": {
                k: (dict(v) if isinstance(v, (Counter, defaultdict)) else v)
                for k, v in q_stats.items()
            },
            "g_stats": {
                k: (dict(v) if isinstance(v, (Counter, defaultdict)) else v)
                for k, v in g_stats.items()
            },
            "verify": summ,
        }
        Path(args.samples_out).write_text(json.dumps(out_obj, indent=2, ensure_ascii=False), encoding="utf-8")

    if not ok:
        print("\n[FAIL] Verification errors:")
        for e in summ["errors"]:
            print("  -", e)
        return 1

    print("\n[PASS] 100% CLEAN — ALL TIER-1 & GOLD VENUE CHECKS PASSED!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
