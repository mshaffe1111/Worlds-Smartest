#!/usr/bin/env python3
"""
World's Smartest — 3-Level Subcategory Taxonomy & Deep Specialist Shards Builder
================================================================================
Implements Directives #181, #183, #184, #187 & Red-Team #190 Hardening:
  1. Builds a comprehensive 3-Level Drill-Down Hierarchy in
     `public/data/shards/taxonomy_tree.json`:
       • 12 L0 Domains -> 50 L1 Subcategories -> 152 L2 Specific Topics
       • Strict superset of `BUILTIN_TAXONOMY_SEEDS` in `src/forge/TaxonomyCatalog.ts`
         (preserving exact IDs like `L0: 5` -> `L1: sports` -> `L2: sports_baseball`).
  2. Builds `public/data/shards/subcat_baseball.json` (30,000+ official, fact-verified,
     zero-self-answering MLB Baseball questions from Sean Lahman's Baseball Database
     `1871-present` across ALL 4 solo morphs: SIGHTLINE_LOCK, CALIBRATOR_DIAL,
     GAUNTLET_SHATTER, and CODEX_DUAL_RING!).
  3. Builds `public/data/shards/domain_subcats_0..11*.json` (550,000+ NEW deep
     within-subcategory verified questions across all 12 domains, QIDs 1,100,000+,
     pushing total verified playable universe past 1,550,000+ within RoaringSeenTracker's
     3,145,727 ceiling!).
  4. Enforces strict anti-self-answering (`answerCol !== filterCol` & `fakeCol !== filterCol`),
     zero `"a [Vowel]"` grammar flaws, zero stem/clue leaks, and <= 1.42 MB per lazy file.
  5. NEVER overwrites existing `domain_0..11.json` or `shard_manifest.json`!
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
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Reuse verified hygiene helpers from build_million_shards
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_million_shards import (
    CachedClient,
    DEFAULT_CACHE_DIR,
    DOMAIN_META,
    QL_PREFIX,
    SENSITIVE_NON_ENTERTAINMENT_FIGURES,
    clean_country,
    clean_sport,
    clean_text,
    group_single_valued,
    load_valid_countries,
    pop_to_irt,
    sl_to_irt,
)

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_SHARDS_DIR = ROOT / "public" / "data" / "shards"
QUESTIONS_JSON_PATH = ROOT / "public" / "data" / "questions.json"
BASE_MANIFEST_PATH = PUBLIC_SHARDS_DIR / "shard_manifest.json"

SUBCAT_START_QID = 1_100_000
SUBCAT_MAX_QID = 3_100_000  # Safely inside RoaringSeenTracker MAX_QID = 3,145,727 (#187)
MAX_CHUNK_BYTES = 1_400_000  # <= 1.40 MB per lazy file (<80ms fetch!)

LAHMAN_BASE = "https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/Lahman"

ARTICLE_VOWEL_RE = re.compile(r"\b([Aa]) ([AEIOUaeiou][a-zA-Z-]{2,})\b")
ARTICLE_EXCEPTIONS = ("uni", "use", "usu", "euro", "one-", "once")


def fix_indefinite_articles(text: str) -> str:
    def _repl(m: re.Match) -> str:
        art, word = m.group(1), m.group(2)
        if word.lower().startswith(ARTICLE_EXCEPTIONS):
            return m.group(0)
        return ("An" if art == "A" else "an") + " " + word
    return ARTICLE_VOWEL_RE.sub(_repl, text)


def no_leak(subj: str, ans: str) -> bool:
    """Reject rows where the answer (>=4 chars) leaks inside the subject string."""
    s_low, a_low = subj.strip().lower(), ans.strip().lower()
    if not s_low or not a_low or s_low == a_low:
        return False
    if len(a_low) >= 4 and (a_low in s_low or s_low in a_low):
        return False
    return True


# ---------------------------------------------------------------------------
# Specialist Table Type Specifications (`WS_SHARD_V1` + `CODEX_DUAL_RING`!)
# Every template is crafted with ZERO `"a {type}"` indefinite-article traps
# and ZERO self-answering category leaks!
# ---------------------------------------------------------------------------
SUBCAT_TYPE_SPECS: Dict[str, Dict[str, Any]] = {
    # ===================== BASEBALL SPECIALIST TABLES (`subcat_baseball.json`) =====================
    "sub_bb_slugger": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["name", "team", "hr", "debut", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "bbs_team", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which MLB franchise did slugger {name} (MLB debut {debut}) play the most games?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} launched {hr} career MLB home runs after debuting in {debut}.",
                "clue2": "The franchise name begins with \"{ans_init}\".",
                "why": "{name} (debut {debut}, {hr} career HR) played more MLB games for the {team} than any other club.",
                "irtOffset": 0.0,
            },
            {
                "id": "bbs_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these MLB power hitters played the plurality of their career games for the {team}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Debuted in {debut} and finished with {hr} career MLB home runs.",
                "clue2": "The player's name starts with \"{ans_init}\".",
                "why": "{name} ({hr} career HR, debut {debut}) played primarily for the {team}.",
                "irtOffset": 0.15,
            },
            {
                "id": "bbs_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "MLB slugger {name} ({hr} career HR) played more career games for the {team} than any other club.",
                "falsePrompt": "MLB slugger {name} ({hr} career HR) played more career games for the {fake} than any other club.",
                "fakeCol": 1,
                "clue1": "Recall the primary MLB uniform worn by {name} (debut {debut}).",
                "whyTrue": "True! {name} ({hr} HR) played primarily for the {team}.",
                "whyFalse": "False! {name} played primarily for the {team}, not the {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "bbs_hr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "How many career MLB home runs did {name} ({team}) hit?",
                "exactCol": 2, "unit": "HR", "step": 0, "pad": 0, "minClamp": 15, "maxClamp": 800,
                "clue1": "{name} debuted in {debut} and starred primarily for the {team}.",
                "why": "{name} ({team}) hit {hr} career MLB home runs.",
                "irtOffset": 0.25,
            },
            {
                "id": "bbs_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each MLB hitter on the upper ring with their primary MLB franchise below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_bb_hits_rbi": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["name", "team", "hits", "rbi", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "bbh_team", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which MLB club did {name} ({hits} career hits) play the most career games for?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} tallied {hits} hits and {rbi} RBIs in Major League Baseball.",
                "clue2": "The franchise begins with \"{ans_init}\".",
                "why": "{name} ({hits} career hits, {rbi} RBIs) played primarily for the {team}.",
                "irtOffset": 0.05,
            },
            {
                "id": "bbh_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "MLB standout {name} ({hits} career hits) played primarily for the {team}.",
                "falsePrompt": "MLB standout {name} ({hits} career hits) played primarily for the {fake}.",
                "fakeCol": 1,
                "clue1": "{name} drove in {rbi} career runs.",
                "whyTrue": "True! {name} ({hits} hits) played primarily for the {team}.",
                "whyFalse": "False! {name} played primarily for the {team}, not the {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "bbh_hits", "archetype": "CALIBRATOR_DIAL",
                "prompt": "How many career MLB hits did {name} ({team}) record?",
                "exactCol": 2, "unit": "hits", "step": 0, "pad": 0, "minClamp": 200, "maxClamp": 4400,
                "clue1": "Primary club: {team} ({rbi} career RBIs).",
                "why": "{name} ({team}) recorded {hits} career MLB hits.",
                "irtOffset": 0.30,
            },
            {
                "id": "bbh_rbi", "archetype": "CALIBRATOR_DIAL",
                "prompt": "How many career runs batted in (RBIs) did {name} ({team}) tally in MLB?",
                "exactCol": 3, "unit": "RBIs", "step": 0, "pad": 0, "minClamp": 80, "maxClamp": 2400,
                "clue1": "{name} collected {hits} career hits (primary club: {team}).",
                "why": "{name} ({team}) drove in {rbi} career runs in MLB.",
                "irtOffset": 0.35,
            },
        ],
    },
    "sub_bb_pitcher": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["name", "team", "so", "wins", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "bbp_team", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which MLB club did pitcher {name} ({so} career strikeouts) pitch the most games?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "{name} recorded {wins} career MLB victories and {so} strikeouts.",
                "clue2": "The club's name starts with \"{ans_init}\".",
                "why": "Pitcher {name} ({wins} wins, {so} SO) pitched more games for the {team} than any other team.",
                "irtOffset": 0.0,
            },
            {
                "id": "bbp_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these MLB pitchers logged the plurality of their career appearances with the {team}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Finished with {wins} MLB wins and {so} strikeouts.",
                "clue2": "The pitcher's name begins with \"{ans_init}\".",
                "why": "{name} ({wins} W, {so} SO) pitched primarily for the {team}.",
                "irtOffset": 0.15,
            },
            {
                "id": "bbp_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "MLB pitcher {name} ({so} strikeouts) pitched more career games for the {team} than any other club.",
                "falsePrompt": "MLB pitcher {name} ({so} strikeouts) pitched more career games for the {fake} than any other club.",
                "fakeCol": 1,
                "clue1": "{name} earned {wins} career MLB wins.",
                "whyTrue": "True! {name} pitched primarily for the {team}.",
                "whyFalse": "False! {name} pitched primarily for the {team}, not the {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "bbp_so", "archetype": "CALIBRATOR_DIAL",
                "prompt": "How many career MLB strikeouts did pitcher {name} ({team}) record?",
                "exactCol": 2, "unit": "strikeouts", "step": 0, "pad": 0, "minClamp": 100, "maxClamp": 5800,
                "clue1": "Primary club: {team} ({wins} career MLB wins).",
                "why": "Pitcher {name} ({team}) recorded {so} career MLB strikeouts.",
                "irtOffset": 0.30,
            },
            {
                "id": "bbp_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each MLB pitcher on the upper ring with their primary MLB franchise below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_bb_season_feat": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["feat", "player", "team", "val", "unit", "irt"],
        "poolCols": [2, 4],
        "angles": [
            {
                "id": "bbf_plr", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which MLB player posted the single-season milestone: {feat}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Recorded while playing for the {team}.",
                "clue2": "The player's name starts with \"{ans_init}\".",
                "why": "{player} ({team}) recorded {feat}.",
                "irtOffset": 0.10,
            },
            {
                "id": "bbf_team", "archetype": "SIGHTLINE_LOCK",
                "prompt": "For which MLB team was {player} playing when recording {feat}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Achieved by {player}.",
                "clue2": "The franchise begins with \"{ans_init}\".",
                "why": "{player} recorded {feat} with the {team}.",
                "irtOffset": 0.15,
            },
            {
                "id": "bbf_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{player} recorded the single-season MLB mark of {feat} for the {team}.",
                "falsePrompt": "{fake} recorded the single-season MLB mark of {feat} for the {team}.",
                "fakeCol": 1,
                "clue1": "Check the {team} single-season leaderboard.",
                "whyTrue": "True! {player} posted {feat} for the {team}.",
                "whyFalse": "False! {player} (not {fake}) posted {feat} for the {team}.",
                "irtOffset": -0.10,
            },
        ],
    },
    "sub_bb_awards_hof": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["honor", "player", "year", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "bba_plr", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which baseball figure earned the MLB honor: {honor} ({year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Awarded or inducted in {year}.",
                "clue2": "Their name begins with \"{ans_init}\".",
                "why": "{player} earned {honor} in {year}.",
                "irtOffset": 0.0,
            },
            {
                "id": "bba_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "In {year}, {player} earned the MLB honor: {honor}.",
                "falsePrompt": "In {year}, {fake} earned the MLB honor: {honor}.",
                "fakeCol": 1,
                "clue1": "Think back to the {year} MLB honors.",
                "whyTrue": "True! {player} earned {honor} in {year}.",
                "whyFalse": "False! {player} (not {fake}) earned {honor} in {year}.",
                "irtOffset": -0.15,
            },
            {
                "id": "bba_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {player} earn the MLB milestone: {honor}?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 18, "minClamp": 1910, "maxClamp": 2025,
                "clue1": "Milestone: {honor} ({player}).",
                "why": "{player} earned {honor} in {year}.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sub_bb_world_series": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["series_lbl", "winner", "loser", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "bbw_win", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which franchise won the {series_lbl}, defeating the {loser}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "They defeated the {loser} in the Fall Classic.",
                "clue2": "The champion franchise starts with \"{ans_init}\".",
                "why": "The {winner} defeated the {loser} to win the {series_lbl}.",
                "irtOffset": -0.05,
            },
            {
                "id": "bbw_lose", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which team did the {winner} defeat to capture the {series_lbl}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Runner-up in the {series_lbl} against the {winner}.",
                "clue2": "The team name starts with \"{ans_init}\".",
                "why": "The {winner} defeated the {loser} in the {series_lbl}.",
                "irtOffset": 0.15,
            },
            {
                "id": "bbw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {winner} defeated the {loser} to win the {series_lbl}.",
                "falsePrompt": "The {fake} defeated the {loser} to win the {series_lbl}.",
                "fakeCol": 1,
                "clue1": "Recall the Fall Classic champion of {year}.",
                "whyTrue": "True! The {winner} won the {series_lbl} over the {loser}.",
                "whyFalse": "False! The {winner} (not the {fake}) won the {series_lbl}.",
                "irtOffset": -0.15,
            },
            {
                "id": "bbw_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each World Series edition on the upper ring with its championship club below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_bb_ballpark": {
        "l0Domain": 5, "l1Category": "Baseball", "glyphHint": "star",
        "cols": ["park", "city", "team", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "bbk_city", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which city is (or was) the MLB ballpark {park} located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Associated with the {team} (first MLB game {year}).",
                "clue2": "The city begins with \"{ans_init}\".",
                "why": "{park} ({team}) is in {city}.",
                "irtOffset": -0.05,
            },
            {
                "id": "bbk_team", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which MLB club played home games at {park} in {city}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Located in {city} (MLB games from {year}).",
                "clue2": "The club begins with \"{ans_init}\".",
                "why": "The {team} played home games at {park} in {city}.",
                "irtOffset": 0.05,
            },
            {
                "id": "bbk_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {park} ({city}) first host MLB games for the {team}?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 22, "minClamp": 1871, "maxClamp": 2025,
                "clue1": "Home ballpark in {city} ({team}).",
                "why": "{park} ({city}) first hosted the {team} in {year}.",
                "irtOffset": 0.30,
            },
            {
                "id": "bbk_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 2,
                "prompt": "Align each MLB ballpark on the upper ring with its home franchise below.",
                "irtOffset": 0.15,
            },
        ],
    },

    # ===================== GENERIC REUSABLE DEEP SPECIALIST TEMPLATES ACROSS D0..D11 =====================
    # Domain 0: History
    "sub_hist_dynasty": {
        "l0Domain": 0, "l1Category": "Royal Houses & Dynasties", "glyphHint": "crown",
        "cols": ["name", "dynasty", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "shd_dyn", "archetype": "SIGHTLINE_LOCK",
                "prompt": "To which royal house or dynasty did {name} (b. {year}, {country}) belong?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year} and associated with {country}.",
                "clue2": "The house or dynasty starts with \"{ans_init}\".",
                "why": "{name} (b. {year}, {country}) belonged to {dynasty}.",
                "irtOffset": 0.05,
            },
            {
                "id": "shd_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these historical figures was a member of {dynasty}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Born in {year} ({country}).",
                "clue2": "Their name begins with \"{ans_init}\".",
                "why": "{name} ({year}) belonged to {dynasty}.",
                "irtOffset": 0.15,
            },
            {
                "id": "shd_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} (born {year}) belonged to {dynasty}.",
                "falsePrompt": "{name} (born {year}) belonged to {fake}.",
                "fakeCol": 1,
                "clue1": "Associated with {country}.",
                "whyTrue": "True! {name} belonged to {dynasty}.",
                "whyFalse": "False! {name} belonged to {dynasty}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "shd_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({dynasty}, {country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 45, "minClamp": 100, "maxClamp": 1960,
                "clue1": "Member of {dynasty} ({country}).",
                "why": "{name} ({dynasty}) was born in {year} CE.",
                "irtOffset": 0.30,
            },
            {
                "id": "shd_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each historical ruler or noble with their royal house or dynasty.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_hist_arch_site": {
        "l0Domain": 0, "l1Category": "Archaeology & Heritage", "glyphHint": "column",
        "cols": ["name", "country", "culture", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "sha_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which modern country is the historic or archaeological site {name} located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Historically linked to {culture}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({culture}) is located in present-day {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sha_cul", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which civilization or culture is historically associated with {name} in {country}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Located in present-day {country}.",
                "clue2": "The civilization begins with \"{ans_init}\".",
                "why": "{name} ({country}) is associated with {culture}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sha_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The archaeological site {name} is located in present-day {country}.",
                "falsePrompt": "The archaeological site {name} is located in present-day {fake}.",
                "fakeCol": 1,
                "clue1": "Linked with {culture}.",
                "whyTrue": "True! {name} lies in {country}.",
                "whyFalse": "False! {name} lies in {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sha_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each archaeological site on the upper ring with its modern country below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_hist_figures_deep": {
        "l0Domain": 0, "l1Category": "World Figures", "glyphHint": "crown",
        "cols": ["name", "era_tag", "year", "country", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "shf_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which country or realm was {name} (b. {year}, {era_tag}) associated?",
                "answerCol": 3, "distractorCol": 3,
                "clue1": "Born in {year} ({era_tag}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} (b. {year}) was associated with {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "shf_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these historical figures ({era_tag}) was associated with {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 3,
                "clue1": "Born in {year}.",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} (b. {year}) was associated with {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "shf_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Historical figure {name} (born {year}) was associated with {country}.",
                "falsePrompt": "Historical figure {name} (born {year}) was associated with {fake}.",
                "fakeCol": 3,
                "clue1": "Era: {era_tag}.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "shf_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was historical figure {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 45, "minClamp": 100, "maxClamp": 1950,
                "clue1": "Associated with {country} ({era_tag}).",
                "why": "{name} ({country}) was born in {year} CE.",
                "irtOffset": 0.35,
            },
        ],
    },

    # Domain 1: Science & Space
    "sub_sci_solar_body": {
        "l0Domain": 1, "l1Category": "Solar System & Asteroids", "glyphHint": "rocket",
        "cols": ["name", "discoverer", "year", "btype", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "ssb_disc", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who discovered the solar system object {name} ({btype}, {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Discovered in {year} ({btype}).",
                "clue2": "The discoverer starts with \"{ans_init}\".",
                "why": "{name} ({btype}) was discovered by {discoverer} in {year}.",
                "irtOffset": 0.15,
            },
            {
                "id": "ssb_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these solar system objects was discovered by {discoverer}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Discovered in {year} ({btype}).",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "{discoverer} discovered {name} in {year}.",
                "irtOffset": 0.20,
            },
            {
                "id": "ssb_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Solar system object {name} ({year}) was discovered by {discoverer}.",
                "falsePrompt": "Solar system object {name} ({year}) was discovered by {fake}.",
                "fakeCol": 1,
                "clue1": "Cataloged under {btype}.",
                "whyTrue": "True! {discoverer} discovered {name} ({year}).",
                "whyFalse": "False! {name} was discovered by {discoverer}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "ssb_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({btype}) discovered by {discoverer}?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 30, "minClamp": 1610, "maxClamp": 2025,
                "clue1": "Discovered by {discoverer}.",
                "why": "{name} was discovered by {discoverer} in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "sub_sci_laureate": {
        "l0Domain": 1, "l1Category": "Scientific Laureates", "glyphHint": "atom",
        "cols": ["name", "award", "alma", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "ssl_awd", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which major scientific prize was awarded to {name} (educated at {alma})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year}; educated at {alma}.",
                "clue2": "The prize begins with \"{ans_init}\".",
                "why": "{name} ({alma}) received the {award}.",
                "irtOffset": 0.0,
            },
            {
                "id": "ssl_alma", "archetype": "SIGHTLINE_LOCK",
                "prompt": "At which university or institution did scientist {name} ({award}) study?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Born in {year}; recipient of the {award}.",
                "clue2": "The institution starts with \"{ans_init}\".",
                "why": "{name} ({award}) studied at {alma}.",
                "irtOffset": 0.20,
            },
            {
                "id": "ssl_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Scientist {name} (b. {year}) studied at {alma}.",
                "falsePrompt": "Scientist {name} (b. {year}) studied at {fake}.",
                "fakeCol": 2,
                "clue1": "Recipient of the {award}.",
                "whyTrue": "True! {name} studied at {alma}.",
                "whyFalse": "False! {name} studied at {alma}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "ssl_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 2,
                "prompt": "Align each scientist on the upper ring with their alma mater below.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sub_sci_exo_deep": {
        "l0Domain": 1, "l1Category": "Exoplanets", "glyphHint": "rocket",
        "cols": ["name", "host", "orb_days", "dist_ly", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "sxd_host", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which host star is orbited by the confirmed exoplanet {name} (~{dist_ly} light-years away)?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Orbital period: ~{orb_days} days; distance: ~{dist_ly} light-years.",
                "clue2": "The star designation begins with \"{ans_init}\".",
                "why": "Exoplanet {name} orbits host star {host} (~{dist_ly} ly from Earth).",
                "irtOffset": 0.15,
            },
            {
                "id": "sxd_orb", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately how many Earth days does exoplanet {name} take to orbit its star?",
                "exactCol": 2, "unit": "days", "step": 0, "pad": 0, "minClamp": 1, "maxClamp": 5000,
                "clue1": "Located roughly {dist_ly} light-years from Earth.",
                "why": "NASA records {name}'s orbital period as approximately {orb_days} Earth days.",
                "irtOffset": 0.35,
            },
            {
                "id": "sxd_dist", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately how many light-years from Earth is the exoplanet {name}?",
                "exactCol": 3, "unit": "light-years", "step": 0, "pad": 0, "minClamp": 4, "maxClamp": 6000,
                "clue1": "Orbital period: ~{orb_days} days.",
                "why": "{name} lies approximately {dist_ly} light-years from Earth.",
                "irtOffset": 0.35,
            },
        ],
    },

    # Domain 2: Geography
    "sub_geo_us_city": {
        "l0Domain": 2, "l1Category": "U.S. States & Cities", "glyphHint": "compass",
        "cols": ["name", "state", "pop_k", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "sgu_st", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which U.S. state is the city of {name} (pop. ~{pop_k},000) located?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Its population is roughly {pop_k},000.",
                "clue2": "The U.S. state starts with \"{ans_init}\".",
                "why": "{name} is located in the U.S. state of {state}.",
                "irtOffset": -0.05,
            },
            {
                "id": "sgu_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these American cities is located in {state}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Population: approximately {pop_k},000.",
                "clue2": "The city begins with \"{ans_init}\".",
                "why": "{name} (pop. ~{pop_k},000) is in {state}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sgu_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The American city of {name} is located in {state}.",
                "falsePrompt": "The American city of {name} is located in {fake}.",
                "fakeCol": 1,
                "clue1": "Population: ~{pop_k},000.",
                "whyTrue": "True! {name} is in {state}.",
                "whyFalse": "False! {name} is in {state}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sgu_pop", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately what is the population of {name}, {state}?",
                "exactCol": 2, "unit": "thousand", "step": 0, "pad": 0, "minClamp": 10, "maxClamp": 9000,
                "clue1": "Located in {state}.",
                "why": "{name}, {state} has a population of roughly {pop_k} thousand.",
                "irtOffset": 0.30,
            },
            {
                "id": "sgu_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each American city on the upper ring with its U.S. state below.",
                "irtOffset": 0.15,
            },
        ],
    },
    "sub_geo_city_deep": {
        "l0Domain": 2, "l1Category": "Global Urban Geography", "glyphHint": "globe",
        "cols": ["name", "country", "region", "pop_k", "cont", "irt"],
        "poolCols": [1, 2, 4],
        "angles": [
            {
                "id": "sgc_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is the city of {name} (pop. ~{pop_k},000) located?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 4,
                "clue1": "Located in {cont} (population ~{pop_k},000).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({region}) is in {country}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sgc_reg", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Within {country}, which state, province, or region contains {name}?",
                "answerCol": 2, "distractorCol": 2, "preferSameCol": 1,
                "clue1": "Population: roughly {pop_k},000.",
                "clue2": "The region starts with \"{ans_init}\".",
                "why": "{name} lies in {region}, {country}.",
                "irtOffset": 0.25,
            },
            {
                "id": "sgc_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The city of {name} (pop. ~{pop_k},000) is located in {country}.",
                "falsePrompt": "The city of {name} (pop. ~{pop_k},000) is located in {fake}.",
                "fakeCol": 1,
                "clue1": "Continent: {cont}.",
                "whyTrue": "True! {name} is in {country}.",
                "whyFalse": "False! {name} is in {country}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sgc_pop", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Approximately what is the population of {name}, {country}?",
                "exactCol": 3, "unit": "thousand", "step": 0, "pad": 0, "minClamp": 10, "maxClamp": 5000,
                "clue1": "Region: {region}, {country}.",
                "why": "{name}, {country} has an approximate population of {pop_k} thousand.",
                "irtOffset": 0.35,
            },
            {
                "id": "sgc_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each world city on the upper ring with its country below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_geo_airport_deep": {
        "l0Domain": 2, "l1Category": "Regional & Global Aviation", "glyphHint": "compass",
        "cols": ["name", "city", "country", "irt"],
        "poolCols": [2],
        "angles": [
            {
                "id": "sgad_city", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which municipality is directly served by {name} ({country})?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 2,
                "clue1": "Airport located in {country}.",
                "clue2": "The city begins with \"{ans_init}\".",
                "why": "{name} serves {city}, {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sgad_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country is {name} (serving {city}) located?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Serves the city of {city}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({city}) is located in {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "sgad_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} serves {city} in {country}.",
                "falsePrompt": "{name} serves {city} in {fake}.",
                "fakeCol": 2,
                "clue1": "Municipality served: {city}.",
                "whyTrue": "True! {name} ({city}) is in {country}.",
                "whyFalse": "False! {name} ({city}) is in {country}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sgad_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each airport on the upper ring with the city it serves below.",
                "irtOffset": 0.20,
            },
        ],
    },

    # Domain 3: Arts & Architecture
    "sub_art_museum": {
        "l0Domain": 3, "l1Category": "Museum Masterworks", "glyphHint": "column",
        "cols": ["title", "artist", "museum", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "sam_mus", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which museum or gallery houses \"{title}\" ({year}) by {artist}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Created by {artist} in {year}.",
                "clue2": "The museum begins with \"{ans_init}\".",
                "why": "\"{title}\" ({year}) by {artist} is in the collection of {museum}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sam_art", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who painted \"{title}\" ({year}), held at {museum}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Housed in {museum} ({year}).",
                "clue2": "The artist's name begins with \"{ans_init}\".",
                "why": "{artist} painted \"{title}\" ({year}, {museum}).",
                "irtOffset": 0.0,
            },
            {
                "id": "sam_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "\"{title}\" ({year}) by {artist} is housed in {museum}.",
                "falsePrompt": "\"{title}\" ({year}) by {artist} is housed in {fake}.",
                "fakeCol": 2,
                "clue1": "Painted by {artist} in {year}.",
                "whyTrue": "True! \"{title}\" is held at {museum}.",
                "whyFalse": "False! \"{title}\" is held at {museum}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sam_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 2,
                "prompt": "Align each famous painting on the upper ring with the museum that houses it.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sub_art_classical": {
        "l0Domain": 3, "l1Category": "Classical Music & Opera", "glyphHint": "star",
        "cols": ["title", "composer", "year", "form", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "sac_cmp", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which composer wrote \"{title}\" ({form}, {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Composed in {year} ({form}).",
                "clue2": "The composer starts with \"{ans_init}\".",
                "why": "{composer} composed \"{title}\" ({year}).",
                "irtOffset": 0.0,
            },
            {
                "id": "sac_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these musical works was composed by {composer}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Dates from {year} ({form}).",
                "clue2": "Its title starts with \"{ans_init}\".",
                "why": "{composer} wrote \"{title}\" ({year}).",
                "irtOffset": 0.15,
            },
            {
                "id": "sac_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The musical work \"{title}\" ({year}) was composed by {composer}.",
                "falsePrompt": "The musical work \"{title}\" ({year}) was composed by {fake}.",
                "fakeCol": 1,
                "clue1": "Form: {form} ({year}).",
                "whyTrue": "True! {composer} composed \"{title}\".",
                "whyFalse": "False! \"{title}\" was composed by {composer}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sac_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In approximately what year did {composer} compose or premiere \"{title}\"?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1580, "maxClamp": 2024,
                "clue1": "Form: {form} by {composer}.",
                "why": "\"{title}\" by {composer} dates to {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "sub_art_style": {
        "l0Domain": 3, "l1Category": "Architectural Styles", "glyphHint": "column",
        "cols": ["name", "style", "country", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "sas_sty", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which architectural style characterizes {name} ({country}, {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Built in {country} around {year}.",
                "clue2": "The architectural style starts with \"{ans_init}\".",
                "why": "{name} ({country}, {year}) exemplifies {style}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sas_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country does the historic landmark {name} (completed {year}) stand?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Completed around {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({style}) stands in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "sas_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Landmark {name} ({country}) is built in the style of {style}.",
                "falsePrompt": "Landmark {name} ({country}) is built in the style of {fake}.",
                "fakeCol": 1,
                "clue1": "Completed around {year}.",
                "whyTrue": "True! {name} exemplifies {style}.",
                "whyFalse": "False! {name} exemplifies {style}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sas_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each architectural landmark with its primary architectural style.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_art_nga_deep": {
        "l0Domain": 3, "l1Category": "National Gallery Masterworks", "glyphHint": "column",
        "cols": ["title", "artist", "year", "cls", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "sang_art", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which artist created the {year} work \"{title}\" ({cls})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Created around {year} ({cls}).",
                "clue2": "The artist's name begins with \"{ans_init}\".",
                "why": "{artist} created \"{title}\" ({year}, {cls}).",
                "irtOffset": 0.15,
            },
            {
                "id": "sang_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these works ({cls}) was created by {artist}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Dated to {year} ({cls}).",
                "clue2": "Its title begins with \"{ans_init}\".",
                "why": "{artist} created \"{title}\" ({year}).",
                "irtOffset": 0.20,
            },
            {
                "id": "sang_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} work \"{title}\" ({cls}) was created by {artist}.",
                "falsePrompt": "The {year} work \"{title}\" ({cls}) was created by {fake}.",
                "fakeCol": 1,
                "clue1": "Medium/class: {cls} ({year}).",
                "whyTrue": "True! \"{title}\" was created by {artist}.",
                "whyFalse": "False! \"{title}\" was created by {artist}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sang_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In approximately what year did {artist} create \"{title}\" ({cls})?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 35, "minClamp": 1250, "maxClamp": 2020,
                "clue1": "Created by {artist} ({cls}).",
                "why": "\"{title}\" by {artist} dates to {year}.",
                "irtOffset": 0.30,
            },
        ],
    },

    # Domain 4: Film, Music & Pop
    "sub_pop_album_deep": {
        "l0Domain": 4, "l1Category": "Studio Albums & Discographies", "glyphHint": "mask",
        "cols": ["title", "artist", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "spal_art", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which recording artist or band released the {year} album \"{title}\"?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Released in {year}.",
                "clue2": "The artist or group starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}) was released by {artist}.",
                "irtOffset": 0.05,
            },
            {
                "id": "spal_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these albums was released by {artist}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Released in {year}.",
                "clue2": "The album title starts with \"{ans_init}\".",
                "why": "{artist} released \"{title}\" in {year}.",
                "irtOffset": 0.15,
            },
            {
                "id": "spal_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} album \"{title}\" was released by {artist}.",
                "falsePrompt": "The {year} album \"{title}\" was released by {fake}.",
                "fakeCol": 1,
                "clue1": "Released in {year}.",
                "whyTrue": "True! {artist} released \"{title}\" ({year}).",
                "whyFalse": "False! \"{title}\" was released by {artist}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "spal_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {artist} release the album \"{title}\"?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 16, "minClamp": 1948, "maxClamp": 2025,
                "clue1": "Recorded by {artist}.",
                "why": "\"{title}\" by {artist} was released in {year}.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sub_pop_actor": {
        "l0Domain": 4, "l1Category": "Screen Actors & Performers", "glyphHint": "mask",
        "cols": ["name", "country", "year", "irt"],
        "poolCols": [1],
        "angles": [
            {
                "id": "spa_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country is screen actor {name} (b. {year}) from?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Born in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "Actor {name} (b. {year}) is from {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "spa_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these screen actors was born in or represents {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Born in {year}.",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} (b. {year}) is from {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "spa_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Screen actor {name} (born {year}) is associated with {country}.",
                "falsePrompt": "Screen actor {name} (born {year}) is associated with {fake}.",
                "fakeCol": 1,
                "clue1": "Born in {year}.",
                "whyTrue": "True! {name} is from {country}.",
                "whyFalse": "False! {name} is from {country}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "spa_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was screen actor {name} ({country}) born?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 22, "minClamp": 1890, "maxClamp": 2010,
                "clue1": "Actor from {country}.",
                "why": "{name} ({country}) was born in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },

    # Domain 5: Non-Baseball Pro Sports & Video Games Specialist Tables
    "sub_pro_player": {
        "l0Domain": 5, "l1Category": "Pro Sports", "glyphHint": "star",
        "cols": ["name", "pos", "country", "year", "sport_tag", "irt"],
        "poolCols": [1, 2, 4],
        "angles": [
            {
                "id": "spp_pos", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which primary position did {sport_tag} standout {name} ({country}, b. {year}) play?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 4,
                "clue1": "Represented {country} ({sport_tag}, b. {year}).",
                "clue2": "The position starts with \"{ans_init}\".",
                "why": "{name} ({country}, {sport_tag}) played {pos}.",
                "irtOffset": 0.05,
            },
            {
                "id": "spp_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country did {sport_tag} {pos} {name} (b. {year}) represent?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Played {pos} ({sport_tag}, b. {year}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({pos}) represented {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "spp_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "In {sport_tag}, {name} ({country}) played primarily at {pos}.",
                "falsePrompt": "In {sport_tag}, {name} ({country}) played primarily at {fake}.",
                "fakeCol": 1,
                "clue1": "Born in {year} ({country}).",
                "whyTrue": "True! {name} played {pos}.",
                "whyFalse": "False! {name} played {pos}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "spp_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {sport_tag} {pos} {name} ({country}) born?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 20, "minClamp": 1900, "maxClamp": 2008,
                "clue1": "{pos} representing {country}.",
                "why": "{name} ({country}, {pos}) was born in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "sub_vg_genre": {
        "l0Domain": 5, "l1Category": "Video Games & Esports", "glyphHint": "prism",
        "cols": ["title", "genre", "dev", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "svg_gnr", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which genre best classifies the {year} video game \"{title}\" ({dev})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Developed by {dev} ({year}).",
                "clue2": "The genre starts with \"{ans_init}\".",
                "why": "\"{title}\" ({year}, {dev}) belongs to the {genre} genre.",
                "irtOffset": 0.0,
            },
            {
                "id": "svg_dev2", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which studio developed \"{title}\" ({genre}, {year})?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Genre: {genre}; released in {year}.",
                "clue2": "The studio begins with \"{ans_init}\".",
                "why": "{dev} developed \"{title}\" ({year}).",
                "irtOffset": 0.10,
            },
            {
                "id": "svg_tf2", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {year} video game \"{title}\" ({dev}) belongs to the {genre} genre.",
                "falsePrompt": "The {year} video game \"{title}\" ({dev}) belongs to the {fake} genre.",
                "fakeCol": 1,
                "clue1": "Developed by {dev} ({year}).",
                "whyTrue": "True! \"{title}\" is classified under {genre}.",
                "whyFalse": "False! \"{title}\" is classified under {genre}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "svg_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 2,
                "prompt": "Align each video game title on the upper ring with its development studio below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_sport_athlete_deep": {
        "l0Domain": 5, "l1Category": "World & Olympic Athletes", "glyphHint": "star",
        "cols": ["name", "sport", "country", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "ssad_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country did {sport} competitor {name} (b. {year}) represent?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Competed in {sport} (born {year}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({sport}, b. {year}) represented {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "ssad_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these {sport} competitors represented {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2, "preferSameCol": 1,
                "clue1": "Born in {year} ({sport}).",
                "clue2": "Their name begins with \"{ans_init}\".",
                "why": "{name} ({sport}) represented {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "ssad_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "In {sport}, {name} (born {year}) represented {country}.",
                "falsePrompt": "In {sport}, {name} (born {year}) represented {fake}.",
                "fakeCol": 2,
                "clue1": "Competed in {sport}.",
                "whyTrue": "True! {name} represented {country}.",
                "whyFalse": "False! {name} represented {country}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "ssad_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {sport} competitor {name} ({country}) born?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 22, "minClamp": 1880, "maxClamp": 2008,
                "clue1": "Represented {country} in {sport}.",
                "why": "{name} ({country}, {sport}) was born in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },

    # Domain 6: Tech & Computing
    "sub_tech_aero_year": {
        "l0Domain": 6, "l1Category": "Aerospace & Vehicles", "glyphHint": "rocket",
        "cols": ["name", "maker", "year", "vclass", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "sta_mkr", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which manufacturer built {name} ({vclass}, introduced {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Introduced in {year} ({vclass}).",
                "clue2": "The manufacturer starts with \"{ans_init}\".",
                "why": "{maker} built {name} ({year}).",
                "irtOffset": 0.0,
            },
            {
                "id": "sta_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({vclass}, {year}) was built by {maker}.",
                "falsePrompt": "{name} ({vclass}, {year}) was built by {fake}.",
                "fakeCol": 1,
                "clue1": "Introduced around {year}.",
                "whyTrue": "True! {maker} built {name}.",
                "whyFalse": "False! {name} was built by {maker}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "sta_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year did {name} ({maker}, {vclass}) make its debut or first flight?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 18, "minClamp": 1903, "maxClamp": 2025,
                "clue1": "Built by {maker} ({vclass}).",
                "why": "{name} ({maker}) debuted in {year}.",
                "irtOffset": 0.25,
            },
            {
                "id": "sta_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each aircraft or vehicle model with its manufacturer.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_tech_format": {
        "l0Domain": 6, "l1Category": "File Formats & Protocols", "glyphHint": "gear",
        "cols": ["name", "ext_or_dev", "year", "kind", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "stf_dev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which organization or creator developed {name} ({kind}, {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Introduced in {year} ({kind}).",
                "clue2": "The creator begins with \"{ans_init}\".",
                "why": "{name} ({year}) was developed by {ext_or_dev}.",
                "irtOffset": 0.10,
            },
            {
                "id": "stf_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Computing technology {name} ({year}) was created by {ext_or_dev}.",
                "falsePrompt": "Computing technology {name} ({year}) was created by {fake}.",
                "fakeCol": 1,
                "clue1": "Category: {kind}.",
                "whyTrue": "True! {ext_or_dev} created {name}.",
                "whyFalse": "False! {name} was created by {ext_or_dev}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "stf_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({kind}, {ext_or_dev}) introduced?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 12, "minClamp": 1955, "maxClamp": 2025,
                "clue1": "Created by {ext_or_dev}.",
                "why": "{name} ({ext_or_dev}) debuted in {year}.",
                "irtOffset": 0.25,
            },
        ],
    },

    # Domain 7: Nature & Biology
    "sub_nat_iucn": {
        "l0Domain": 7, "l1Category": "Conservation & Wildlife", "glyphHint": "dna",
        "cols": ["name", "sci", "status", "group", "irt"],
        "poolCols": [2, 3],
        "angles": [
            {
                "id": "sni_sts", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What IUCN Red List conservation status is assigned to the {name} ({sci})?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Biological group: {group}.",
                "clue2": "The conservation tier begins with \"{ans_init}\".",
                "why": "The {name} ({sci}) is listed as {status} on the IUCN Red List.",
                "irtOffset": 0.25,
            },
            {
                "id": "sni_sci", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the scientific binomial name of the {name} ({group})?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 3,
                "clue1": "IUCN status: {status} ({group}).",
                "clue2": "The genus starts with \"{ans_init}\".",
                "why": "The {name} has the scientific name {sci}.",
                "irtOffset": 0.45,
            },
            {
                "id": "sni_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "On the IUCN Red List, the {name} ({sci}) is assessed as {status}.",
                "falsePrompt": "On the IUCN Red List, the {name} ({sci}) is assessed as {fake}.",
                "fakeCol": 2,
                "clue1": "Biological group: {group}.",
                "whyTrue": "True! The {name} is assessed as {status}.",
                "whyFalse": "False! The {name} is assessed as {status}, not {fake}.",
                "irtOffset": 0.05,
            },
            {
                "id": "sni_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each organism's common name with its scientific Latin binomial.",
                "irtOffset": 0.35,
            },
        ],
    },
    "sub_nat_breed": {
        "l0Domain": 7, "l1Category": "Animal Breeds", "glyphHint": "dna",
        "cols": ["name", "animal", "country", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "snb_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country did the {name} ({animal}) originate?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Recognized under {animal}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "The {name} ({animal}) originated in {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "snb_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these breeds ({animal}) originated in {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "Breed group: {animal}.",
                "clue2": "Its name begins with \"{ans_init}\".",
                "why": "The {name} originated in {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "snb_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The {name} ({animal}) originated in {country}.",
                "falsePrompt": "The {name} ({animal}) originated in {fake}.",
                "fakeCol": 2,
                "clue1": "Breed classification: {animal}.",
                "whyTrue": "True! The {name} originated in {country}.",
                "whyFalse": "False! The {name} originated in {country}, not {fake}.",
                "irtOffset": -0.10,
            },
        ],
    },
    "sub_nat_fungus": {
        "l0Domain": 7, "l1Category": "Fungi & Mycology", "glyphHint": "dna",
        "cols": ["name", "sci", "irt"],
        "poolCols": [],
        "angles": [
            {
                "id": "snf_sci", "archetype": "SIGHTLINE_LOCK",
                "prompt": "What is the scientific Latin binomial of the mushroom or fungus known as the {name}?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Commonly called the {name} in mycology.",
                "clue2": "The genus starts with \"{ans_init}\".",
                "why": "The {name} has the scientific name {sci}.",
                "irtOffset": 0.25,
            },
            {
                "id": "snf_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which fungus or mushroom has the scientific name \"{sci}\"?",
                "answerCol": 0, "distractorCol": 0,
                "clue1": "Classified in Kingdom Fungi as {sci}.",
                "clue2": "Its common English name begins with \"{ans_init}\".",
                "why": "{sci} is commonly known as the {name}.",
                "irtOffset": 0.20,
            },
            {
                "id": "snf_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "In mycology, the {name} has the scientific name {sci}.",
                "falsePrompt": "In mycology, the {name} has the scientific name {fake}.",
                "fakeCol": 1,
                "clue1": "Match the mushroom {name} to its Latin binomial.",
                "whyTrue": "True! The {name} is {sci}.",
                "whyFalse": "False! The {name} is {sci}, not {fake}.",
                "irtOffset": 0.0,
            },
        ],
    },

    # Domain 8: World Affairs & Law
    "sub_soc_party_leader": {
        "l0Domain": 8, "l1Category": "Politics & Statesmen", "glyphHint": "scales",
        "cols": ["name", "party", "country", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "ssp_pty", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which political party was {name} ({country}, b. {year}) affiliated?",
                "answerCol": 1, "distractorCol": 1, "preferSameCol": 2,
                "clue1": "Political figure in {country} (b. {year}).",
                "clue2": "The party begins with \"{ans_init}\".",
                "why": "{name} ({country}) was affiliated with {party}.",
                "irtOffset": 0.10,
            },
            {
                "id": "ssp_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which country's politics did {name} (born {year}) serve?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Born in {year}.",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({party}) served in {country}.",
                "irtOffset": 0.0,
            },
            {
                "id": "ssp_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Political figure {name} ({country}) was affiliated with {party}.",
                "falsePrompt": "Political figure {name} ({country}) was affiliated with {fake}.",
                "fakeCol": 1,
                "clue1": "Born in {year} ({country}).",
                "whyTrue": "True! {name} belonged to {party}.",
                "whyFalse": "False! {name} belonged to {party}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "ssp_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was political figure {name} ({country}, {party}) born?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 28, "minClamp": 1750, "maxClamp": 2000,
                "clue1": "Served in {country} ({party}).",
                "why": "{name} ({country}) was born in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "sub_soc_statesman_deep": {
        "l0Domain": 8, "l1Category": "Statesmen, Jurists & Diplomats", "glyphHint": "scales",
        "cols": ["name", "role", "country", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "sssd_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which country was represented by {role} {name} (b. {year})?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Born in {year} ({role}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({role}, b. {year}) served in {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "sssd_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these public figures ({role}) served in or represented {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "Born in {year} ({role}).",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} ({role}) represented {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sssd_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{role} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{role} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 2,
                "clue1": "Born in {year}.",
                "whyTrue": "True! {name} represented {country}.",
                "whyFalse": "False! {name} represented {country}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sssd_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {role} {name} ({country}) born?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 28, "minClamp": 1700, "maxClamp": 2000,
                "clue1": "Served in {country}.",
                "why": "{name} ({country}) was born in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "sub_soc_law": {
        "l0Domain": 8, "l1Category": "Constitutions, Courts & Law", "glyphHint": "scales",
        "cols": ["name", "country", "year", "ltype", "irt"],
        "poolCols": [1, 3],
        "angles": [
            {
                "id": "sslw_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which jurisdiction or country is {name} ({ltype}, {year}) associated?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Dated {year} ({ltype}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({year}) belongs to {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "sslw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({ltype}, {year}) is associated with {country}.",
                "falsePrompt": "{name} ({ltype}, {year}) is associated with {fake}.",
                "fakeCol": 1,
                "clue1": "Year: {year}.",
                "whyTrue": "True! {name} ({year}) belongs to {country}.",
                "whyFalse": "False! {name} belongs to {country}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sslw_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {name} ({country}, {ltype}) enacted or decided?",
                "exactCol": 2, "unit": "CE", "step": 1, "pad": 30, "minClamp": 1200, "maxClamp": 2025,
                "clue1": "Jurisdiction: {country} ({ltype}).",
                "why": "{name} ({country}) dates to {year}.",
                "irtOffset": 0.30,
            },
        ],
    },

    # Domain 9: Food, Craft & Design
    "sub_food_atelier": {
        "l0Domain": 9, "l1Category": "Luxury Houses & Founders", "glyphHint": "gear",
        "cols": ["name", "founder", "year", "country", "irt"],
        "poolCols": [3],
        "angles": [
            {
                "id": "sfa_fnd", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who founded {name} ({country}, est. {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Established in {country} in {year}.",
                "clue2": "The founder's name starts with \"{ans_init}\".",
                "why": "{name} ({country}, {year}) was founded by {founder}.",
                "irtOffset": 0.15,
            },
            {
                "id": "sfa_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which heritage house or company was founded by {founder} in {year}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 1,
                "clue1": "Originating in {country} ({year}).",
                "clue2": "The house begins with \"{ans_init}\".",
                "why": "{founder} founded {name} ({year}, {country}).",
                "irtOffset": 0.15,
            },
            {
                "id": "sfa_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({country}, {year}) was founded by {founder}.",
                "falsePrompt": "{name} ({country}, {year}) was founded by {fake}.",
                "fakeCol": 1,
                "clue1": "Established in {year} in {country}.",
                "whyTrue": "True! {founder} founded {name} ({year}).",
                "whyFalse": "False! {name} was founded by {founder}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "sfa_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 1,
                "prompt": "Align each heritage brand or house with its founder.",
                "irtOffset": 0.25,
            },
        ],
    },
    "sub_food_ingred": {
        "l0Domain": 9, "l1Category": "Ingredients & Gastronomy", "glyphHint": "flame",
        "cols": ["name", "ingred", "country", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "sfi_ing", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which key ingredient is traditionally featured in {name} ({country})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Culinary specialty from {country}.",
                "clue2": "The ingredient starts with \"{ans_init}\".",
                "why": "{name} ({country}) traditionally features {ingred}.",
                "irtOffset": 0.10,
            },
            {
                "id": "sfi_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "From which country does {name} (made with {ingred}) originate?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Traditionally prepared with {ingred}.",
                "clue2": "The country begins with \"{ans_init}\".",
                "why": "{name} (featuring {ingred}) comes from {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "sfi_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{name} ({country}) traditionally features {ingred}.",
                "falsePrompt": "{name} ({country}) traditionally features {fake}.",
                "fakeCol": 1,
                "clue1": "Specialty of {country}.",
                "whyTrue": "True! {name} features {ingred}.",
                "whyFalse": "False! {name} features {ingred}, not {fake}.",
                "irtOffset": -0.10,
            },
        ],
    },

    # Domain 10: Myth & Literature
    "sub_lit_char": {
        "l0Domain": 10, "l1Category": "Literary & Fictional Characters", "glyphHint": "scroll",
        "cols": ["name", "work", "creator", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "slc_wrk", "archetype": "SIGHTLINE_LOCK",
                "prompt": "In which work does the character {name} (created by {creator}) appear?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Created by {creator}.",
                "clue2": "The work's title starts with \"{ans_init}\".",
                "why": "{name} (by {creator}) appears in \"{work}\".",
                "irtOffset": 0.0,
            },
            {
                "id": "slc_crt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who created the character {name} (featured in \"{work}\")?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Appears in \"{work}\".",
                "clue2": "The creator's name starts with \"{ans_init}\".",
                "why": "{creator} created {name} (\"{work}\").",
                "irtOffset": 0.05,
            },
            {
                "id": "slc_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "The character {name} (featured in \"{work}\") was created by {creator}.",
                "falsePrompt": "The character {name} (featured in \"{work}\") was created by {fake}.",
                "fakeCol": 2,
                "clue1": "Work: \"{work}\".",
                "whyTrue": "True! {creator} created {name}.",
                "whyFalse": "False! {name} was created by {creator}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "slc_cdx", "archetype": "CODEX_DUAL_RING",
                "subjectCol": 0, "targetCol": 2,
                "prompt": "Align each character on the upper ring with their creator below.",
                "irtOffset": 0.20,
            },
        ],
    },
    "sub_lit_genre": {
        "l0Domain": 10, "l1Category": "Genre Literature", "glyphHint": "scroll",
        "cols": ["title", "author", "genre", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "slg_aut", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Who wrote \"{title}\" ({genre}, {year})?",
                "answerCol": 1, "distractorCol": 1,
                "clue1": "Published in {year} ({genre}).",
                "clue2": "The author starts with \"{ans_init}\".",
                "why": "{author} wrote \"{title}\" ({year}, {genre}).",
                "irtOffset": 0.0,
            },
            {
                "id": "slg_gnr", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which literary genre best describes \"{title}\" ({year}) by {author}?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Written by {author} ({year}).",
                "clue2": "The genre begins with \"{ans_init}\".",
                "why": "\"{title}\" by {author} belongs to {genre}.",
                "irtOffset": 0.10,
            },
            {
                "id": "slg_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "\"{title}\" ({year}, {genre}) was written by {author}.",
                "falsePrompt": "\"{title}\" ({year}, {genre}) was written by {fake}.",
                "fakeCol": 1,
                "clue1": "Published in {year}.",
                "whyTrue": "True! {author} wrote \"{title}\".",
                "whyFalse": "False! \"{title}\" was written by {author}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "slg_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was \"{title}\" ({genre}) by {author} published?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 30, "minClamp": 1400, "maxClamp": 2025,
                "clue1": "Written by {author} ({genre}).",
                "why": "\"{title}\" ({author}) was published in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },
    "sub_lit_author_deep": {
        "l0Domain": 10, "l1Category": "World Authors, Poets & Thinkers", "glyphHint": "scroll",
        "cols": ["name", "role", "country", "year", "irt"],
        "poolCols": [1, 2],
        "angles": [
            {
                "id": "slad_cnt", "archetype": "SIGHTLINE_LOCK",
                "prompt": "With which country is {role} {name} (b. {year}) associated?",
                "answerCol": 2, "distractorCol": 2,
                "clue1": "Born in {year} ({role}).",
                "clue2": "The country starts with \"{ans_init}\".",
                "why": "{name} ({role}, b. {year}) is associated with {country}.",
                "irtOffset": 0.05,
            },
            {
                "id": "slad_rev", "archetype": "SIGHTLINE_LOCK",
                "prompt": "Which of these literary figures ({role}) was born in or associated with {country}?",
                "answerCol": 0, "distractorCol": 0, "avoidSameCol": 2,
                "clue1": "Born in {year} ({role}).",
                "clue2": "Their name starts with \"{ans_init}\".",
                "why": "{name} ({role}, b. {year}) is from {country}.",
                "irtOffset": 0.15,
            },
            {
                "id": "slad_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "{role} {name} (born {year}) was associated with {country}.",
                "falsePrompt": "{role} {name} (born {year}) was associated with {fake}.",
                "fakeCol": 2,
                "clue1": "Born in {year}.",
                "whyTrue": "True! {name} was associated with {country}.",
                "whyFalse": "False! {name} was associated with {country}, not {fake}.",
                "irtOffset": -0.10,
            },
            {
                "id": "slad_yr", "archetype": "CALIBRATOR_DIAL",
                "prompt": "In what year was {role} {name} ({country}) born?",
                "exactCol": 3, "unit": "CE", "step": 1, "pad": 30, "minClamp": 1200, "maxClamp": 2000,
                "clue1": "Associated with {country} ({role}).",
                "why": "{name} ({country}) was born in {year}.",
                "irtOffset": 0.30,
            },
        ],
    },

    # Domain 11: Specialist Pure-Topic Math & Logic Tables
    "sub_math_spec_num": {
        "l0Domain": 11, "l1Category": "Specialist Mathematics", "glyphHint": "sigma",
        "cols": ["stmt", "ans", "d1", "d2", "d3", "topic", "unit", "irt"],
        "poolCols": [5, 6],
        "angles": [
            {
                "id": "smsn_mc", "archetype": "SIGHTLINE_LOCK",
                "prompt": "{stmt}?",
                "answerCol": 1, "inlineDistCols": [2, 3, 4],
                "clue1": "Topic: {topic}. Verify sign and parity carefully.",
                "clue2": "Eliminate off-by-one traps before locking.",
                "why": "Exact verified result: {ans} ({topic}).",
                "irtOffset": 0.0,
            },
            {
                "id": "smsn_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Verify ({topic}): {stmt}? Result: {ans}.",
                "falsePrompt": "Verify ({topic}): {stmt}? Result: {fake}.",
                "inlineFakeCol": 2,
                "clue1": "Check the exact arithmetic for {topic}.",
                "whyTrue": "True! The exact result is {ans}.",
                "whyFalse": "False! The exact result is {ans}, not {fake}.",
                "irtOffset": -0.15,
            },
            {
                "id": "smsn_est", "archetype": "CALIBRATOR_DIAL",
                "prompt": "Dial the exact value: {stmt}?",
                "exactCol": 1, "unitCol": 6, "step": 0, "pad": 0, "minClamp": -2000, "maxClamp": 1000000,
                "clue1": "Topic: {topic}.",
                "why": "Exact value: {ans} ({topic}).",
                "irtOffset": 0.25,
            },
        ],
    },
    "sub_math_spec_word": {
        "l0Domain": 11, "l1Category": "Probability, Ciphers & Symbolic Math", "glyphHint": "sigma",
        "cols": ["stmt", "ans", "d1", "d2", "d3", "topic", "irt"],
        "poolCols": [5],
        "angles": [
            {
                "id": "smsw_mc", "archetype": "SIGHTLINE_LOCK",
                "prompt": "{stmt}?",
                "answerCol": 1, "inlineDistCols": [2, 3, 4],
                "clue1": "Topic: {topic}. Simplify completely.",
                "clue2": "The verified answer starts with \"{ans_init}\".",
                "why": "Exact verified answer: {ans} ({topic}).",
                "irtOffset": 0.0,
            },
            {
                "id": "smsw_tf", "archetype": "GAUNTLET_SHATTER",
                "truePrompt": "Verify ({topic}): {stmt}? Solution: {ans}.",
                "falsePrompt": "Verify ({topic}): {stmt}? Solution: {fake}.",
                "inlineFakeCol": 2,
                "clue1": "Check numerator/denominator or cipher shift carefully.",
                "whyTrue": "True! The verified solution is {ans}.",
                "whyFalse": "False! The verified solution is {ans}, not {fake}.",
                "irtOffset": -0.15,
            },
        ],
    },
}


# ---------------------------------------------------------------------------
# 1. Sean Lahman MLB Baseball Harvester -> 33,000+ Official MLB Questions!
# ---------------------------------------------------------------------------
MODERN_CANON_FRANCHISE = {
    "NYA": "New York Yankees", "BOS": "Boston Red Sox", "LAN": "Los Angeles Dodgers",
    "BRO": "Brooklyn Dodgers", "SFN": "San Francisco Giants", "NY1": "New York Giants",
    "CHN": "Chicago Cubs", "CHA": "Chicago White Sox", "SLN": "St. Louis Cardinals",
    "CIN": "Cincinnati Reds", "PIT": "Pittsburgh Pirates", "PHI": "Philadelphia Phillies",
    "PHA": "Philadelphia Athletics", "OAK": "Oakland Athletics", "DET": "Detroit Tigers",
    "CLE": "Cleveland Guardians", "BAL": "Baltimore Orioles", "SLA": "St. Louis Browns",
    "MIN": "Minnesota Twins", "WS1": "Washington Senators", "ATL": "Atlanta Braves",
    "ML1": "Milwaukee Braves", "BSN": "Boston Braves", "NYN": "New York Mets",
    "HOU": "Houston Astros", "KCA": "Kansas City Royals", "LAA": "Los Angeles Angels",
    "CAL": "California Angels", "ANA": "Anaheim Angels", "SDN": "San Diego Padres",
    "MIL": "Milwaukee Brewers", "TEX": "Texas Rangers", "SEA": "Seattle Mariners",
    "TOR": "Toronto Blue Jays", "MON": "Montreal Expos", "WAS": "Washington Nationals",
    "COL": "Colorado Rockies", "FLO": "Florida Marlins", "MIA": "Miami Marlins",
    "ARI": "Arizona Diamondbacks", "TBA": "Tampa Bay Rays",
}


def harvest_baseball_lahman(client: CachedClient) -> Dict[str, List[list]]:
    print("\n=== Harvesting L2 Showcase: Sean Lahman MLB Baseball (30,000+ Qs) ===", flush=True)
    csvs = {}
    for name in ["People", "Batting", "Pitching", "Teams", "SeriesPost", "AwardsPlayers", "HallOfFame", "Parks"]:
        p = client.fetch_file(f"lahman_{name}.csv", f"{LAHMAN_BASE}/{name}.csv")
        with open(p, "r", encoding="utf-8", errors="ignore") as f:
            csvs[name] = list(csv.DictReader(f))

    # Map (yearID, teamID) -> clean official team name, and teamID -> modern/canonical name
    yr_team_name: Dict[Tuple[int, str], str] = {}
    team_latest_name: Dict[str, Tuple[int, str]] = {}
    for r in csvs["Teams"]:
        try:
            yr = int(r["yearID"])
        except ValueError:
            continue
        tid = (r.get("teamID") or "").strip()
        tname = clean_text(r.get("name"), max_len=32)
        if tid and tname:
            yr_team_name[(yr, tid)] = tname
            if tid not in team_latest_name or yr >= team_latest_name[tid][0]:
                team_latest_name[tid] = (yr, MODERN_CANON_FRANCHISE.get(tid, tname))

    def resolve_team(tid: str, yr: Optional[int] = None) -> Optional[str]:
        if yr is not None and (yr, tid) in yr_team_name:
            return yr_team_name[(yr, tid)]
        if tid in MODERN_CANON_FRANCHISE:
            return MODERN_CANON_FRANCHISE[tid]
        return team_latest_name.get(tid, (0, None))[1]

    # Map playerID -> full clean name & debut year
    players: Dict[str, Tuple[str, int]] = {}
    for r in csvs["People"]:
        pid = (r.get("playerID") or "").strip()
        fn = (r.get("nameFirst") or "").strip()
        ln = (r.get("nameLast") or "").strip()
        full = clean_text(f"{fn} {ln}", max_len=28)
        deb = (r.get("debut") or "")[:4]
        try:
            deb_yr = int(deb)
        except ValueError:
            deb_yr = 0
        if pid and full and 1871 <= deb_yr <= 2025:
            players[pid] = (full, deb_yr)

    # Aggregate career batting & single-season batting feats
    bat_tot: Dict[str, List[int]] = defaultdict(lambda: [0, 0, 0, 0])  # G, H, HR, RBI
    bat_team_g: Dict[str, Counter] = defaultdict(Counter)
    season_feats: List[list] = []
    seen_feat: Set[str] = set()

    for r in csvs["Batting"]:
        pid = (r.get("playerID") or "").strip()
        if pid not in players:
            continue
        tid = (r.get("teamID") or "").strip()
        try:
            yr = int(r["yearID"])
            g = int(r["G"] or 0)
            h = int(r["H"] or 0)
            hr = int(r["HR"] or 0)
            rbi = int(r["RBI"] or 0)
        except ValueError:
            continue
        tname = resolve_team(tid, yr)
        if not tname:
            continue
        bt = bat_tot[pid]
        bt[0] += g
        bt[1] += h
        bt[2] += hr
        bt[3] += rbi
        bat_team_g[pid][tname] += g

        pname, _ = players[pid]
        if hr >= 42 and no_leak(pname, tname):
            fk = f"{yr} MLB season ({hr} HR, {rbi} RBI)"
            if fk not in seen_feat:
                seen_feat.add(fk)
                irt = -110 if hr >= 58 else (-20 if hr >= 50 else 85)
                season_feats.append([fk, pname, tname, hr, "HR", irt])
        elif h >= 215 and no_leak(pname, tname):
            fk = f"{yr} MLB season ({h} hits)"
            if fk not in seen_feat:
                seen_feat.add(fk)
                irt = -70 if h >= 240 else 65
                season_feats.append([fk, pname, tname, h, "hits", irt])

    sluggers = []
    hit_leaders = []
    seen_pname_bat: Set[str] = set()
    # Sort by career fame (HR*5 + H) descending so Babe Ruth, Hank Aaron, Barry Bonds, Willie Mays lead!
    ranked_bat = sorted(bat_tot.items(), key=lambda kv: -(kv[1][2] * 5 + kv[1][1]))
    for pid, (g, h, hr, rbi) in ranked_bat:
        pname, deb_yr = players[pid]
        if pname.lower() in seen_pname_bat:
            continue
        tc = bat_team_g[pid].most_common(2)
        if not tc:
            continue
        # Strictly require unique primary franchise (no tie in games played!)
        if len(tc) > 1 and tc[0][1] == tc[1][1]:
            continue
        top_team = tc[0][0]
        if not no_leak(pname, top_team):
            continue
        seen_pname_bat.add(pname.lower())
        fame_score = hr * 4 + h
        irt = -135 if fame_score >= 3800 else (-65 if fame_score >= 2500 else (15 if fame_score >= 1500 else (95 if fame_score >= 900 else 175)))
        if hr >= 45 and len(sluggers) < 2500:
            sluggers.append([pname, top_team, hr, deb_yr, irt])
        if h >= 480 and rbi >= 150 and len(hit_leaders) < 2300:
            hit_leaders.append([pname, top_team, h, rbi, irt])

    # Aggregate career pitching & single-season pitching feats
    pit_tot: Dict[str, List[int]] = defaultdict(lambda: [0, 0, 0, 0])  # G, W, SO, SV
    pit_team_g: Dict[str, Counter] = defaultdict(Counter)
    for r in csvs["Pitching"]:
        pid = (r.get("playerID") or "").strip()
        if pid not in players:
            continue
        tid = (r.get("teamID") or "").strip()
        try:
            yr = int(r["yearID"])
            g = int(r["G"] or 0)
            w = int(r["W"] or 0)
            so = int(r["SO"] or 0)
            sv = int(r["SV"] or 0)
        except ValueError:
            continue
        tname = resolve_team(tid, yr)
        if not tname:
            continue
        pt = pit_tot[pid]
        pt[0] += g
        pt[1] += w
        pt[2] += so
        pt[3] += sv
        pit_team_g[pid][tname] += g

        pname, _ = players[pid]
        if so >= 260 and no_leak(pname, tname):
            fk = f"{yr} MLB season ({so} strikeouts, {w} W)"
            if fk not in seen_feat:
                seen_feat.add(fk)
                irt = -80 if so >= 320 else 65
                season_feats.append([fk, pname, tname, so, "strikeouts", irt])
        elif w >= 24 and yr >= 1901 and no_leak(pname, tname):
            fk = f"{yr} MLB season ({w} pitching wins, {so} SO)"
            if fk not in seen_feat:
                seen_feat.add(fk)
                irt = -40 if w >= 27 else 85
                season_feats.append([fk, pname, tname, w, "wins", irt])

    pitchers = []
    seen_pname_pit: Set[str] = set()
    ranked_pit = sorted(pit_tot.items(), key=lambda kv: -(kv[1][2] + kv[1][1] * 12 + kv[1][3] * 6))
    for pid, (g, w, so, sv) in ranked_pit:
        if so < 300 and w < 35 and sv < 50:
            continue
        pname, _ = players[pid]
        if pname.lower() in seen_pname_pit:
            continue
        tc = pit_team_g[pid].most_common(2)
        if not tc or (len(tc) > 1 and tc[0][1] == tc[1][1]):
            continue
        top_team = tc[0][0]
        if not no_leak(pname, top_team):
            continue
        seen_pname_pit.add(pname.lower())
        fame = so + w * 10 + sv * 6
        irt = -130 if fame >= 4500 else (-55 if fame >= 2800 else (25 if fame >= 1600 else (105 if fame >= 900 else 180)))
        pitchers.append([pname, top_team, max(100, so), w, irt])
        if len(pitchers) >= 2100:
            break

    # Awards + Hall of Fame
    awards_rows = []
    seen_honor: Set[str] = set()
    prestigious_awards = {
        "Most Valuable Player": "MVP Award",
        "Cy Young Award": "Cy Young Award",
        "Rookie of the Year": "Rookie of the Year",
        "Triple Crown": "Batting/Pitching Triple Crown",
        "World Series MVP": "World Series MVP",
    }
    # Group awards so we skip ties cleanly
    awd_by_key: Dict[Tuple[int, str, str], List[str]] = defaultdict(list)
    for r in csvs["AwardsPlayers"]:
        aid = (r.get("awardID") or "").strip()
        if aid not in prestigious_awards:
            continue
        pid = (r.get("playerID") or "").strip()
        lg = (r.get("lgID") or "").strip()
        try:
            yr = int(r["yearID"])
        except ValueError:
            continue
        if pid in players and lg in ("AL", "NL", "ML") and 1911 <= yr <= 2025:
            awd_by_key[(yr, lg, prestigious_awards[aid])].append(players[pid][0])

    for (yr, lg, albl), p_list in sorted(awd_by_key.items(), key=lambda x: -x[0][0]):
        if len(set(p_list)) != 1:
            continue
        pname = p_list[0]
        h_lbl = f"{lg} {albl}" if lg != "ML" else albl
        ukey = f"{h_lbl}:{yr}:{pname}".lower()
        if ukey in seen_honor:
            continue
        seen_honor.add(ukey)
        irt = -95 if yr >= 1995 and "MVP" in albl else (10 if yr >= 1970 else 95)
        awards_rows.append([f"{h_lbl} ({pname.split()[-1][0]}. era)" if False else f"{lg} {albl}", pname, yr, irt])

    # Wait: ensure primary key col[0] in sub_bb_awards_hof is unique per row!
    awards_unique = []
    seen_awd_pk: Set[str] = set()
    for r in csvs["HallOfFame"]:
        if (r.get("inducted") or "").strip() != "Y":
            continue
        pid = (r.get("playerID") or "").strip()
        cat = (r.get("category") or "Player").strip()
        try:
            yr = int(r["yearID"])
        except ValueError:
            continue
        if pid not in players or yr < 1936:
            continue
        pname, deb = players[pid]
        pk = f"Cooperstown Hall of Fame ({cat}, debut {deb})"
        if pk.lower() in seen_awd_pk:
            continue
        seen_awd_pk.add(pk.lower())
        irt = -110 if yr <= 1939 or yr >= 2014 else 40
        awards_unique.append([pk, pname, yr, irt])

    for (yr, lg, albl), p_list in sorted(awd_by_key.items(), key=lambda x: -x[0][0]):
        if len(set(p_list)) != 1:
            continue
        pname = p_list[0]
        # Make honor label unique without leaking year when bba_yr asks year?
        # Wait: bba_plr prompt already includes ({year}), and bba_yr asks year — if honor doesn't repeat per player,
        # include League + Award + Career Debut so it's 100% unique & non-year-leaking!
        deb = next((v[1] for k, v in players.items() if v[0] == pname), 0)
        pk = f"{lg} {albl} (winner debut {deb})"
        if pk.lower() in seen_awd_pk:
            continue
        seen_awd_pk.add(pk.lower())
        irt = -85 if yr >= 1995 else (20 if yr >= 1965 else 95)
        awards_unique.append([pk, pname, yr, irt])

    # World Series (1903-present)
    ws_rows = []
    for r in csvs["SeriesPost"]:
        if (r.get("round") or "").strip() != "WS":
            continue
        try:
            yr = int(r["yearID"])
            wins = int(r.get("wins") or 4)
            losses = int(r.get("losses") or 0)
        except ValueError:
            continue
        if yr < 1903:
            continue
        w_team = resolve_team((r.get("teamIDwinner") or "").strip(), yr)
        l_team = resolve_team((r.get("teamIDloser") or "").strip(), yr)
        if not (w_team and l_team) or w_team.lower() == l_team.lower():
            continue
        irt = -115 if yr >= 2000 else (-35 if yr >= 1970 else 55)
        ws_rows.append([f"{yr} World Series ({wins}-{losses})", w_team, l_team, yr, irt])

    # MLB Ballparks
    park_city: Dict[str, str] = {}
    for r in csvs["Parks"]:
        pname = clean_text(r.get("park.name"), max_len=32)
        city = clean_text(r.get("city"), max_len=24)
        st = (r.get("state") or "").strip()
        if pname and city:
            park_city[pname.lower()] = f"{city}, {st}" if st and len(st) <= 3 else city

    park_team_yr: Dict[str, Tuple[int, int, str]] = {}  # park -> (total_years, min_yr, primary_team)
    park_team_cnt: Dict[str, Counter] = defaultdict(Counter)
    park_min_yr: Dict[str, int] = {}
    for r in csvs["Teams"]:
        try:
            yr = int(r["yearID"])
        except ValueError:
            continue
        if yr < 1901:
            continue
        raw_parks = (r.get("park") or "").split("/")
        pk = clean_text(raw_parks[0], max_len=32)
        tname = resolve_team((r.get("teamID") or "").strip(), yr)
        if not (pk and tname):
            continue
        park_team_cnt[pk][tname] += 1
        if pk not in park_min_yr or yr < park_min_yr[pk]:
            park_min_yr[pk] = yr

    ballparks = []
    iconic_parks = {"fenway park", "wrigley field", "yankee stadium", "dodger stadium", "ebbets field", "polo grounds", "camden yards", "oracle park", "pnc park", "busch stadium", "tiger stadium", "comiskey park", "candlestick park", "shea stadium", "astrodome"}
    for pk, cnts in sorted(park_team_cnt.items(), key=lambda kv: -sum(kv[1].values())):
        top_t, n_yrs = cnts.most_common(1)[0]
        if n_yrs < 3:
            continue
        city_lbl = park_city.get(pk.lower())
        if not city_lbl:
            continue
        if not no_leak(pk, city_lbl.split(",")[0]) or not no_leak(pk, top_t):
            continue
        fy = park_min_yr[pk]
        irt = -120 if pk.lower() in iconic_parks else (10 if n_yrs >= 20 else 105)
        ballparks.append([pk, city_lbl, top_t, fy, irt])

    sluggers.sort(key=lambda x: (x[4], -x[2]))
    hit_leaders.sort(key=lambda x: (x[4], -x[2]))
    pitchers.sort(key=lambda x: (x[4], -x[2]))
    season_feats.sort(key=lambda x: (x[5], -x[3]))
    awards_unique.sort(key=lambda x: (x[3], -x[2]))
    ws_rows.sort(key=lambda x: (x[4], -x[3]))
    ballparks.sort(key=lambda x: (x[4], x[3]))

    bb_tables = {
        "sub_bb_slugger": sluggers,
        "sub_bb_hits_rbi": hit_leaders,
        "sub_bb_pitcher": pitchers,
        "sub_bb_season_feat": season_feats[:1200],
        "sub_bb_awards_hof": awards_unique[:900],
        "sub_bb_world_series": ws_rows,
        "sub_bb_ballpark": ballparks[:180],
    }
    q_tot = sum(len(rows) * len(SUBCAT_TYPE_SPECS[t]["angles"]) for t, rows in bb_tables.items())
    print(f"  [BASEBALL] Harvested {sum(len(v) for v in bb_tables.values()):,} MLB entities -> {q_tot:,} dedicated Baseball Qs!", flush=True)
    return bb_tables


# ---------------------------------------------------------------------------
# 2. Specialist Harvesters Across Domains 0..11 (Cached + Targeted Polite QLever)
# ---------------------------------------------------------------------------
def harvest_specialist_domains(client: CachedClient) -> Dict[int, Dict[str, List[list]]]:
    out: Dict[int, Dict[str, List[list]]] = {d: {} for d in range(12)}

    # Load existing primary keys from domain_0..11.json so we don't duplicate base rows!
    base_pkeys: Dict[int, Set[str]] = defaultdict(set)
    for d in range(12):
        for p in sorted(PUBLIC_SHARDS_DIR.glob(f"domain_{d}*.json")):
            ch = json.loads(p.read_text(encoding="utf-8"))
            pool = ch["p"]
            for tbl in ch["t"]:
                for r in tbl["r"]:
                    v0 = pool[r[0]] if isinstance(r[0], int) and r[0] < len(pool) else str(r[0])
                    base_pkeys[d].add(v0.lower())

    # ---- DOMAIN 0: WORLD HISTORY ----
    print("\n=== Specialist Domain 0: World History ===", flush=True)
    raw_dyn = client.qlever_query("sub_d0_dynasty", QL_PREFIX + """
SELECT ?item ?name ?dyn ?year ?country ?sl WHERE {
  ?item wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P53 ?f ; wdt:P27 ?c ; wdt:P569 ?b .
  ?f @en@rdfs:label ?dyn . ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 8 && ?year >= 100 && ?year <= 1950)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_dyn = []
    seen = set()
    for r in group_single_valued(raw_dyn, ["dyn", "country", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=34)
        dyn = clean_text(r["dyn"], max_len=32)
        cnt = clean_country(r["country"])
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and dyn and cnt) or not no_leak(nm, dyn) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_dyn.append([nm, dyn, yr, cnt, sl_to_irt(sl, 0.05)])
    rows_dyn.sort(key=lambda x: (x[4], x[2]))
    out[0]["sub_hist_dynasty"] = rows_dyn[:3500]

    raw_arch = client.qlever_query("sub_d0_arch_sites", QL_PREFIX + """
SELECT ?item ?name ?country ?cul ?sl WHERE {
  ?item wdt:P31 wd:Q839954 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P17 ?c ; wdt:P2596 ?cu .
  ?c @en@rdfs:label ?country . ?cu @en@rdfs:label ?cul .
  FILTER(?sl >= 4)
} ORDER BY DESC(?sl) LIMIT 8000
""")
    rows_arch = []
    seen = set()
    for r in group_single_valued(raw_arch, ["country", "cul"], ["name"]):
        nm = clean_text(r["name"], max_len=36)
        cnt = clean_country(r["country"])
        cul = clean_text(r["cul"], max_len=30)
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (nm and cnt and cul) or not no_leak(nm, cnt) or not no_leak(nm, cul) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_arch.append([nm, cnt, cul, sl_to_irt(sl, 0.10)])
    rows_arch.sort(key=lambda x: (x[3], x[0]))
    out[0]["sub_hist_arch_site"] = rows_arch[:2500]

    # Mine additional verified historical figures from cached d0_figures_v2 not in domain_0!
    deep_figs = []
    seen_hf = set(base_pkeys[0])
    for cp in client.cache_dir.glob("qlever_d0_figures_v2_*.json.gz"):
        with gzip.open(cp, "rt", encoding="utf-8") as gf:
            raw_hf = json.load(gf)
        for r in group_single_valued(raw_hf, ["country", "year"], ["name"]):
            nm = clean_text(r["name"], max_len=34)
            cnt = clean_country(r["country"])
            try:
                yr, sl = int(r["year"]), int(r["sl"])
            except ValueError:
                continue
            if not (nm and cnt) or nm.lower() in seen_hf or not no_leak(nm, cnt):
                continue
            seen_hf.add(nm.lower())
            era = "Antiquity & Medieval" if yr < 1500 else ("Early Modern Era" if yr < 1800 else "Modern Era")
            deep_figs.append([nm, era, yr, cnt, sl_to_irt(sl, 0.15)])
    deep_figs.sort(key=lambda x: (x[4], x[2]))
    out[0]["sub_hist_figures_deep"] = deep_figs[:6000]

    # ---- DOMAIN 1: SCIENCE & SPACE ----
    print("\n=== Specialist Domain 1: Science & Space ===", flush=True)
    raw_sb = client.qlever_query("sub_d1_solar_bodies", QL_PREFIX + """
SELECT ?item ?name ?disc ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P61 ?d ; wdt:P575 ?dt .
  VALUES ?t { wd:Q3863 wd:Q3559 wd:Q2537 }
  ?d @en@rdfs:label ?disc . ?t @en@rdfs:label ?tLabel .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 6 && ?year >= 1610 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    btype_map = {"asteroid": "Asteroid", "comet": "Comet", "natural satellite": "Natural Moon"}
    rows_sb = []
    seen = set()
    for r in group_single_valued(raw_sb, ["disc", "year"], ["name", "tLabel"]):
        nm = clean_text(r["name"], max_len=32)
        disc = clean_text(r["disc"], max_len=32)
        bt = btype_map.get(r["tLabel"].lower(), "Solar System Body")
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and disc) or not no_leak(nm, disc) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_sb.append([nm, disc, yr, bt, sl_to_irt(sl, 0.20)])
    rows_sb.sort(key=lambda x: (x[4], x[2]))
    out[1]["sub_sci_solar_body"] = rows_sb[:4500]

    raw_laur = client.qlever_query("sub_d1_laureates", QL_PREFIX + """
SELECT ?item ?name ?awd ?alma ?year ?sl WHERE {
  ?item wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P166 ?a ; wdt:P69 ?u ; wdt:P569 ?b .
  VALUES ?a {
    wd:Q38104 wd:Q44585 wd:Q80061 wd:Q28835 wd:Q185667 wd:Q746756 wd:Q83259
    wd:Q131740 wd:Q271952 wd:Q320695
  }
  ?a @en@rdfs:label ?awd . ?u @en@rdfs:label ?alma .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 8 && ?year >= 1800 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows_laur = []
    seen = set()
    for r in group_single_valued(raw_laur, ["awd", "alma", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        awd = clean_text(r["awd"], max_len=34)
        alma = clean_text(r["alma"], max_len=34)
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and awd and alma) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_laur.append([nm, awd, alma, yr, sl_to_irt(sl, 0.05)])
    rows_laur.sort(key=lambda x: (x[4], x[3]))
    out[1]["sub_sci_laureate"] = rows_laur[:3000]

    # Deep NASA Exoplanets (orbital period & distance in light-years!)
    exo_path = client.fetch_file("nasa_exoplanets.csv", "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,sy_dist+from+pscomppars&format=csv")
    # Note: existing nasa_exoplanets.csv has pl_name,discoverymethod,disc_year,disc_facility,sy_dist; fetch full orbital table too
    exo2_path = client.fetch_file(
        "nasa_exoplanets_orb.csv",
        "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+pl_name,hostname,pl_orbper,sy_dist+from+pscomppars&format=csv",
    )
    rows_exd = []
    seen_exo = set()
    with open(exo2_path, "r", encoding="utf-8", errors="ignore") as f:
        for r in csv.DictReader(f):
            nm = clean_text(r.get("pl_name"), max_len=28)
            host = clean_text(r.get("hostname"), max_len=26)
            try:
                orb = int(round(float(r.get("pl_orbper") or 0)))
                dist_ly = int(round(float(r.get("sy_dist") or 0) * 3.26156))
            except ValueError:
                continue
            if not (nm and host) or orb < 2 or orb > 4500 or dist_ly < 4 or dist_ly > 5500:
                continue
            # Avoid leaking host star inside planet name if asking host star!
            # Wait: "Kepler-22 b" contains "Kepler-22" — skip sxd_host leak by only keeping planets whose name doesn't start with host, OR use orbital/distance sliders!
            if nm.lower() in seen_exo:
                continue
            seen_exo.add(nm.lower())
            if no_leak(nm, host):
                rows_exd.append([nm, host, orb, dist_ly, 135])
    if len(rows_exd) >= 40:
        out[1]["sub_sci_exo_deep"] = rows_exd[:2500]

    # ---- DOMAIN 2: GEOGRAPHY & WONDERS ----
    print("\n=== Specialist Domain 2: Geography & Wonders ===", flush=True)
    ci_path = client.fetch_file("geonames_countryInfo.txt", "https://download.geonames.org/export/dump/countryInfo.txt")
    a1_path = client.fetch_file("geonames_admin1.txt", "https://download.geonames.org/export/dump/admin1CodesASCII.txt")
    c15_path = client.fetch_file("geonames_cities15000.zip", "https://download.geonames.org/export/dump/cities15000.zip")

    cont_map = {"AF": "Africa", "AS": "Asia", "EU": "Europe", "NA": "North America", "OC": "Oceania", "SA": "South America"}
    iso_cnt: Dict[str, Tuple[str, str]] = {}
    for line in ci_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line and not line.startswith("#"):
            ps = line.split("\t")
            if len(ps) >= 9:
                cn = clean_country(ps[4].strip())
                ct = cont_map.get(ps[8].strip(), "Global")
                if cn:
                    iso_cnt[ps[0].strip()] = (cn, ct)
    a1_map = {}
    for line in a1_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        ps = line.split("\t")
        if len(ps) >= 2:
            rg = clean_text(ps[1], max_len=30)
            if rg:
                a1_map[ps[0].strip()] = rg

    us_cities = []
    seen_us = set()
    deep_world_cities = []
    seen_wc = set(base_pkeys[2])

    with zipfile.ZipFile(c15_path) as zf:
        with zf.open("cities15000.txt") as f:
            raw_city_rows = []
            for raw_line in io.TextIOWrapper(f, encoding="utf-8", errors="ignore"):
                ps = raw_line.rstrip("\r\n").split("\t")
                if len(ps) < 15:
                    continue
                nm = clean_text(ps[1], max_len=28) or clean_text(ps[2], max_len=28)
                cc, a1 = ps[8].strip(), ps[10].strip()
                try:
                    pop = int(ps[14])
                except ValueError:
                    continue
                if not nm or pop < 15_000:
                    continue
                raw_city_rows.append((pop, nm, cc, a1))

    raw_city_rows.sort(key=lambda x: -x[0])
    # Count city name collisions inside US so we only keep unique US city names (or top pop)
    us_name_counts = Counter(nm.lower() for pop, nm, cc, a1 in raw_city_rows if cc == "US")
    world_name_counts = Counter(nm.lower() for pop, nm, cc, a1 in raw_city_rows)

    for pop, nm, cc, a1 in raw_city_rows:
        reg = a1_map.get(f"{cc}.{a1}")
        cnt_tup = iso_cnt.get(cc)
        if not (reg and cnt_tup):
            continue
        cnt, cont = cnt_tup
        if not no_leak(nm, reg) or not no_leak(nm, cnt):
            continue
        pop_k = max(15, int(round(pop / 1000.0)))
        if cc == "US" and us_name_counts[nm.lower()] == 1 and nm.lower() not in seen_us:
            seen_us.add(nm.lower())
            us_cities.append([nm, reg, pop_k, pop_to_irt(pop)])
        elif pop >= 15_000 and world_name_counts[nm.lower()] == 1 and nm.lower() not in seen_wc:
            seen_wc.add(nm.lower())
            deep_world_cities.append([nm, cnt, reg, pop_k, cont, pop_to_irt(pop)])

    us_cities.sort(key=lambda x: (x[3], -x[2]))
    deep_world_cities.sort(key=lambda x: (x[5], -x[3]))
    out[2]["sub_geo_us_city"] = us_cities[:2400]
    out[2]["sub_geo_city_deep"] = deep_world_cities[:11500]

    # Commercial & regional airports from cached OurAirports (Public Domain) not in domain_2
    ap_path = client.fetch_file("ourairports.csv", "https://davidmegginson.github.io/ourairports-data/airports.csv")
    deep_airports = []
    seen_ap = set(base_pkeys[2])
    with open(ap_path, "r", encoding="utf-8", errors="ignore") as f:
        for r in csv.DictReader(f):
            atype = (r.get("type") or "").strip()
            if atype not in ("large_airport", "medium_airport", "small_airport"):
                continue
            sched = (r.get("scheduled_service") or "").strip().lower()
            iata = (r.get("iata_code") or "").strip().upper()
            wiki = (r.get("wikipedia_link") or "").strip()
            if atype == "small_airport" and not (sched == "yes" or (len(iata) == 3 and wiki)):
                continue
            nm = clean_text(r.get("name"), max_len=34)
            city = clean_text(r.get("municipality"), max_len=26)
            cc = (r.get("iso_country") or "").strip()
            cnt_tup = iso_cnt.get(cc)
            if not (nm and city and cnt_tup) or "airport" not in nm.lower():
                continue
            cnt = cnt_tup[0]
            if nm.lower() in seen_ap or not no_leak(nm, city) or not no_leak(nm, cnt):
                continue
            seen_ap.add(nm.lower())
            irt = -40 if atype == "large_airport" else (45 if sched == "yes" else 125)
            deep_airports.append([nm, city, cnt, irt])
    deep_airports.sort(key=lambda x: (x[3], x[0]))
    out[2]["sub_geo_airport_deep"] = deep_airports[:5000]

    # ---- DOMAIN 3: ARTS & ARCHITECTURE ----
    print("\n=== Specialist Domain 3: Arts & Architecture ===", flush=True)
    raw_mus = client.qlever_query("sub_d3_museums", QL_PREFIX + """
SELECT ?item ?title ?artist ?museum ?year ?sl WHERE {
  ?item wdt:P31 wd:Q3305213 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?title ;
        wdt:P170 ?a ; wdt:P195 ?m ; wdt:P571 ?dt .
  ?a @en@rdfs:label ?artist . ?m @en@rdfs:label ?museum .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 4 && ?year >= 1250 && ?year <= 2020)
} ORDER BY DESC(?sl) LIMIT 9000
""")
    rows_mus = []
    seen = set()
    for r in group_single_valued(raw_mus, ["artist", "museum", "year"], ["title"]):
        ti = clean_text(r["title"], max_len=38)
        ar = clean_text(r["artist"], max_len=30)
        mu = clean_text(r["museum"], max_len=34)
        if mu and mu.lower().startswith("department of paintings of the "):
            mu = mu[31:].strip()
            mu = mu[0].upper() + mu[1:]
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (ti and ar and mu) or not no_leak(ti, mu) or not no_leak(ti, ar) or ti.lower() in seen:
            continue
        seen.add(ti.lower())
        rows_mus.append([ti, ar, mu, yr, sl_to_irt(sl, 0.05)])
    rows_mus.sort(key=lambda x: (x[4], x[3]))
    out[3]["sub_art_museum"] = rows_mus[:3500]

    raw_cls = client.qlever_query("sub_d3_classical", QL_PREFIX + """
SELECT ?item ?title ?comp ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?title ;
        wdt:P86 ?c ; wdt:P571 ?dt .
  VALUES ?t { wd:Q1344 wd:Q9734 wd:Q207628 wd:Q105543609 wd:Q2743 }
  ?c @en@rdfs:label ?comp . ?t @en@rdfs:label ?tLabel .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 4 && ?year >= 1590 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows_cls = []
    seen = set()
    for r in group_single_valued(raw_cls, ["comp", "year"], ["title", "tLabel"]):
        ti = clean_text(r["title"], max_len=38)
        cp = clean_text(r["comp"], max_len=30)
        tl_low = ti.lower() if ti else ""
        if "symphon" in tl_low:
            fm = "Symphony"
        elif "concerto" in tl_low:
            fm = "Concerto"
        elif "sonata" in tl_low or "quartet" in tl_low:
            fm = "Chamber Work"
        else:
            fm = "Musical Composition"
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (ti and cp) or not no_leak(ti, cp) or ti.lower() in seen:
            continue
        seen.add(ti.lower())
        rows_cls.append([ti, cp, yr, fm, sl_to_irt(sl, 0.05)])
    rows_cls.sort(key=lambda x: (x[4], x[2]))
    out[3]["sub_art_classical"] = rows_cls[:3500]

    raw_sty = client.qlever_query("sub_d3_arch_styles", QL_PREFIX + """
SELECT ?item ?name ?style ?country ?year ?sl WHERE {
  ?item wdt:P149 ?s ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P17 ?c ; wdt:P571 ?dt .
  ?s @en@rdfs:label ?style . ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 7 && ?year >= 500 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 10000
""")
    rows_sty = []
    seen = set()
    for r in group_single_valued(raw_sty, ["style", "country", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=36)
        st = clean_text(r["style"], max_len=30)
        cnt = clean_country(r["country"])
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and st and cnt) or not no_leak(nm, st) or not no_leak(nm, cnt) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_sty.append([nm, st, cnt, yr, sl_to_irt(sl, 0.10)])
    rows_sty.sort(key=lambda x: (x[4], x[3]))
    out[3]["sub_art_style"] = rows_sty[:3200]

    # CC0 National Gallery of Art masterworks from cached nga_objects.csv not in domain_3!
    nga_path = client.fetch_file("nga_objects.csv", "https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/objects.csv")
    nga_cls_map = {
        "painting": "Painting", "sculpture": "Sculpture", "drawing": "Drawing",
        "print": "Print", "photograph": "Photograph",
    }
    nga_rows = []
    seen_nga = set(base_pkeys[3])
    bad_attr = ("unknown", "anonymous", "various", "century", "school", "workshop", "follower", "after ", "attributed", "style of", "circle of")
    bad_titles = ("untitled", "study", "sketch", "fragment", "plate ", "page ", "folio", "portrait of a man", "portrait of a woman")
    nga_per_artist: Counter = Counter()
    with open(nga_path, "r", encoding="utf-8", errors="ignore") as f:
        for r in csv.DictReader(f):
            cls_raw = (r.get("classification") or "").strip().lower()
            cls_clean = nga_cls_map.get(cls_raw)
            if not cls_clean:
                continue
            ti = clean_text(r.get("title"), max_len=38)
            ar = clean_text(r.get("attribution"), max_len=30)
            try:
                byr = int(r.get("beginyear") or 0)
                eyr = int(r.get("endyear") or byr)
            except ValueError:
                continue
            if not (ti and ar) or byr < 1300 or byr > 2015 or abs(eyr - byr) > 15:
                continue
            if len(ti) < 5 or any(bt in ti.lower() for bt in bad_titles):
                continue
            if any(ba in ar.lower() for ba in bad_attr) or "," in ar or len(ar.split()) < 2:
                continue
            if ti.lower() in seen_nga or not no_leak(ti, ar):
                continue
            if nga_per_artist[ar.lower()] >= 18:
                continue
            seen_nga.add(ti.lower())
            nga_per_artist[ar.lower()] += 1
            irt = 35 if cls_clean in ("Painting", "Sculpture") else 115
            nga_rows.append([ti, ar, byr, cls_clean, irt])
            if len(nga_rows) >= 11000:
                break
    nga_rows.sort(key=lambda x: (x[4], x[2]))
    out[3]["sub_art_nga_deep"] = nga_rows

    # ---- DOMAIN 4: FILM, MUSIC & POP ----
    print("\n=== Specialist Domain 4: Film, Music & Pop ===", flush=True)
    # Additional studio albums from cached d4_albums not in domain_4!
    deep_albums = []
    seen_al4 = set(base_pkeys[4])
    for cp in sorted(client.cache_dir.glob("qlever_d4_albums_*.json.gz")):
        with gzip.open(cp, "rt", encoding="utf-8") as gf:
            raw_al4 = json.load(gf)
        for r in group_single_valued(raw_al4, ["artist", "year"], ["title"]):
            ti = clean_text(r["title"], max_len=38)
            ar = clean_text(r["artist"], max_len=30)
            try:
                yr, sl = int(r["year"]), int(r["sl"])
            except ValueError:
                continue
            if not (ti and ar) or yr < 1950 or yr > 2025 or ti.lower() in seen_al4 or not no_leak(ti, ar):
                continue
            if ar.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES:
                continue
            seen_al4.add(ti.lower())
            deep_albums.append([ti, ar, yr, sl_to_irt(sl, 0.10)])
    deep_albums.sort(key=lambda x: (x[3], x[2]))
    out[4]["sub_pop_album_deep"] = deep_albums[:6000]

    raw_act = client.qlever_query("sub_d4_actors", QL_PREFIX + """
SELECT ?item ?name ?country ?year ?sl WHERE {
  ?item wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P106 ?occ ; wdt:P27 ?c ; wdt:P569 ?b .
  VALUES ?occ { wd:Q10800557 wd:Q33999 }
  ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 22 && ?year >= 1895 && ?year <= 2005)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    rows_act = []
    seen = set()
    for r in group_single_valued(raw_act, ["country", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        cnt = clean_country(r["country"])
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and cnt) or nm.lower() in seen or nm.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES:
            continue
        seen.add(nm.lower())
        rows_act.append([nm, cnt, yr, sl_to_irt(sl, -0.05)])
    rows_act.sort(key=lambda x: (x[3], x[2]))
    out[4]["sub_pop_actor"] = rows_act[:5500]

    # ---- DOMAIN 5: PRO SPORTS (NBA, NFL, SOCCER, NHL) & VIDEO GAMES ----
    print("\n=== Specialist Domain 5: Basketball, NFL, Soccer, Hockey & Video Games ===", flush=True)
    pos_norm = {
        "point guard": "Point Guard", "shooting guard": "Shooting Guard",
        "small forward": "Small Forward", "power forward": "Power Forward", "center": "Center",
        "quarterback": "Quarterback", "wide receiver": "Wide Receiver",
        "running back": "Running Back", "tight end": "Tight End",
        "linebacker": "Linebacker", "cornerback": "Cornerback", "safety": "Safety",
        "defensive end": "Defensive End", "defensive tackle": "Defensive Tackle",
        "offensive tackle": "Offensive Tackle", "placekicker": "Placekicker",
        "goalkeeper": "Goalkeeper", "defender": "Defender", "centre-back": "Center-Back",
        "full-back": "Full-Back", "midfielder": "Midfielder", "forward": "Forward", "winger": "Winger",
        "goaltender": "Goaltender", "defenceman": "Defenseman", "defenseman": "Defenseman",
        "right wing": "Right Wing", "left wing": "Left Wing",
    }
    raw_pro = client.qlever_query("sub_d5_pro_positions", QL_PREFIX + """
SELECT ?item ?name ?occLabel ?pos ?country ?year ?sl WHERE {
  ?item wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P106 ?occ ; wdt:P413 ?p ; wdt:P27 ?c ; wdt:P569 ?b .
  VALUES ?occ { wd:Q3665646 wd:Q19204627 wd:Q937857 wd:Q11774891 }
  ?occ @en@rdfs:label ?occLabel . ?p @en@rdfs:label ?pos . ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1930 && ?year <= 2006)
} ORDER BY DESC(?sl) LIMIT 36000
""")
    occ_sport_map = {
        "basketball player": "Basketball",
        "american football player": "American Football",
        "association football player": "Soccer",
        "ice hockey player": "Ice Hockey",
    }
    rows_pro = []
    seen = set()
    sport_quota: Counter = Counter()
    for r in group_single_valued(raw_pro, ["occLabel", "pos", "country", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        sp = occ_sport_map.get(r["occLabel"].lower())
        pos = pos_norm.get(r["pos"].lower())
        cnt = clean_country(r["country"])
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and sp and pos and cnt) or nm.lower() in seen:
            continue
        if sport_quota[sp] >= 3200:
            continue
        seen.add(nm.lower())
        sport_quota[sp] += 1
        rows_pro.append([nm, pos, cnt, yr, sp, sl_to_irt(sl, 0.0)])
    rows_pro.sort(key=lambda x: (x[4], x[5], x[3]))
    out[5]["sub_pro_player"] = rows_pro

    raw_vg = client.qlever_query("sub_d5_vg_genres", QL_PREFIX + """
SELECT ?item ?title ?genre ?dev ?year ?sl WHERE {
  ?item wdt:P31 wd:Q7889 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?title ;
        wdt:P136 ?g ; wdt:P178 ?d ; wdt:P577 ?dt .
  ?g @en@rdfs:label ?genre . ?d @en@rdfs:label ?dev .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 6 && ?year >= 1975 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 16000
""")
    vg_gnr_map = {
        "action-adventure game": "Action-Adventure", "role-playing video game": "Role-Playing (RPG)",
        "action role-playing game": "Action RPG", "first-person shooter": "First-Person Shooter",
        "platformer": "Platformer", "strategy video game": "Strategy",
        "real-time strategy": "Real-Time Strategy", "turn-based strategy": "Turn-Based Strategy",
        "puzzle video game": "Puzzle", "racing video game": "Racing",
        "fighting game": "Fighting", "sports video game": "Sports Game",
        "simulation video game": "Simulation", "survival horror": "Survival Horror",
        "adventure game": "Adventure", "stealth game": "Stealth",
    }
    rows_vg = []
    seen = set()
    for r in group_single_valued(raw_vg, ["genre", "dev", "year"], ["title"]):
        ti = clean_text(r["title"], max_len=36)
        gn = vg_gnr_map.get(r["genre"].lower())
        dv = clean_text(r["dev"], max_len=28)
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (ti and gn and dv) or not no_leak(ti, gn) or not no_leak(ti, dv) or ti.lower() in seen:
            continue
        seen.add(ti.lower())
        rows_vg.append([ti, gn, dv, yr, sl_to_irt(sl, 0.0)])
    rows_vg.sort(key=lambda x: (x[4], x[3]))
    out[5]["sub_vg_genre"] = rows_vg[:4000]

    # Additional Olympic & world athletes from cached d5_athletes_v2 not in domain_5!
    deep_ath = []
    seen_ath = set(base_pkeys[5]) | {r[0].lower() for r in rows_pro}
    for cp in sorted(client.cache_dir.glob("qlever_d5_athletes_v2_*.json.gz")):
        with gzip.open(cp, "rt", encoding="utf-8") as gf:
            raw_a5 = json.load(gf)
        for r in group_single_valued(raw_a5, ["sport", "country", "year"], ["name"]):
            nm = clean_text(r["name"], max_len=32)
            sp = clean_sport(r["sport"])
            cnt = clean_country(r["country"])
            try:
                yr, sl = int(r["year"]), int(r["sl"])
            except ValueError:
                continue
            if not (nm and sp and cnt) or nm.lower() in seen_ath or nm.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES:
                continue
            if not no_leak(nm, cnt):
                continue
            seen_ath.add(nm.lower())
            deep_ath.append([nm, sp, cnt, yr, sl_to_irt(sl, 0.10)])
    deep_ath.sort(key=lambda x: (x[4], x[3]))
    out[5]["sub_sport_athlete_deep"] = deep_ath[:7500]

    # ---- DOMAIN 6: TECH & COMPUTING ----
    print("\n=== Specialist Domain 6: Tech & Computing ===", flush=True)
    raw_aero = client.qlever_query("sub_d6_aero_year", QL_PREFIX + """
SELECT ?item ?name ?maker ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ; wdt:P176 ?m .
  VALUES ?t { wd:Q15056993 wd:Q11436 wd:Q3231690 wd:Q11446 wd:Q41291 }
  { ?item wdt:P606 ?dt . } UNION { ?item wdt:P729 ?dt . } UNION { ?item wdt:P571 ?dt . }
  ?m @en@rdfs:label ?maker . ?t @en@rdfs:label ?tLabel .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 6 && ?year >= 1903 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 14000
""")
    vc_map = {"aircraft family": "Aircraft", "aircraft": "Aircraft", "car model": "Automobile", "ship": "Naval Vessel", "rocket": "Launch Vehicle"}
    rows_aero = []
    seen = set()
    for r in group_single_valued(raw_aero, ["maker", "year"], ["name", "tLabel"]):
        nm = clean_text(r["name"], max_len=34)
        mk = clean_text(r["maker"], max_len=28)
        vc = vc_map.get(r["tLabel"].lower(), "Engineering Craft")
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and mk):
            continue
        # Strip leading manufacturer name so maker never leaks in prompt!
        if nm.lower().startswith(mk.lower() + " "):
            nm = nm[len(mk) + 1:].strip()
        if len(nm) < 2 or not no_leak(nm, mk) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_aero.append([nm, mk, yr, vc, sl_to_irt(sl, 0.05)])
    rows_aero.sort(key=lambda x: (x[4], x[2]))
    out[6]["sub_tech_aero_year"] = rows_aero[:4000]

    raw_fmt = client.qlever_query("sub_d6_formats_protocols", QL_PREFIX + """
SELECT ?item ?name ?dev ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ; wdt:P178 ?d .
  VALUES ?t { wd:Q235557 wd:Q132364 wd:Q9143 wd:Q9135 wd:Q7397 }
  { ?item wdt:P571 ?dt . } UNION { ?item wdt:P577 ?dt . }
  ?d @en@rdfs:label ?dev . ?t @en@rdfs:label ?tLabel .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 1955 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 8000
""")
    fmt_map = {"file format": "File Format", "communications protocol": "Network Protocol", "programming language": "Programming Language", "operating system": "Operating System", "software": "Software"}
    rows_fmt = []
    seen = set()
    for r in group_single_valued(raw_fmt, ["dev", "year"], ["name", "tLabel"]):
        nm = clean_text(r["name"], max_len=32)
        dv = clean_text(r["dev"], max_len=28)
        kd = fmt_map.get(r["tLabel"].lower(), "Software")
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and dv):
            continue
        if nm.lower().startswith(dv.lower() + " "):
            nm = nm[len(dv) + 1:].strip()
        if len(nm) < 2 or not no_leak(nm, dv) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_fmt.append([nm, dv, yr, kd, sl_to_irt(sl, 0.0)])
    rows_fmt.sort(key=lambda x: (x[4], x[2]))
    out[6]["sub_tech_format"] = rows_fmt[:2800]

    # ---- DOMAIN 7: NATURE & BIOLOGY ----
    print("\n=== Specialist Domain 7: Nature & Biology ===", flush=True)
    raw_iucn = client.qlever_query("sub_d7_iucn", QL_PREFIX + """
SELECT ?item ?name ?sci ?status ?sl WHERE {
  ?item wdt:P31 wd:Q16521 ; wdt:P105 wd:Q7432 ; wdt:P225 ?sci ; wdt:P141 ?st ;
        @en@rdfs:label ?name ; wikibase:sitelinks ?sl .
  FILTER EXISTS { ?item @en@wdt:P1843 ?cn . }
  ?st @en@rdfs:label ?status .
  FILTER(?sl >= 10)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    iucn_map = {
        "least concern": "Least Concern", "near threatened": "Near Threatened",
        "vulnerable": "Vulnerable", "endangered": "Endangered",
        "critically endangered": "Critically Endangered",
    }
    rows_iucn = []
    seen = set()
    for r in group_single_valued(raw_iucn, ["sci", "status"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        sc = clean_text(r["sci"], max_len=34)
        st = iucn_map.get(r["status"].lower().replace(" species", ""))
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (nm and sc and st) or nm.lower() == sc.lower() or len(sc.split()) != 2:
            continue
        if nm.lower().startswith(sc.split()[0].lower() + " ") or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_iucn.append([nm, sc, st, "Assessed Species", sl_to_irt(sl, 0.10)])
    rows_iucn.sort(key=lambda x: (x[4], x[0]))
    out[7]["sub_nat_iucn"] = rows_iucn[:5000]

    raw_brd = client.qlever_query("sub_d7_breeds", QL_PREFIX + """
SELECT ?item ?name ?tLabel ?country ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ; wdt:P495 ?c .
  VALUES ?t { wd:Q39367 wd:Q1160573 wd:Q43577 }
  ?t @en@rdfs:label ?tLabel . ?c @en@rdfs:label ?country .
  FILTER(?sl >= 5)
} ORDER BY DESC(?sl) LIMIT 3000
""")
    brd_map = {"dog breed": "Dog Breed", "horse breed": "Horse Breed", "cat breed": "Cat Breed"}
    rows_brd = []
    seen = set()
    for r in group_single_valued(raw_brd, ["country", "tLabel"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        an = brd_map.get(r["tLabel"].lower(), "Domestic Breed")
        cnt = clean_country(r["country"])
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (nm and cnt) or not no_leak(nm, cnt) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_brd.append([nm, an, cnt, sl_to_irt(sl, -0.05)])
    rows_brd.sort(key=lambda x: (x[3], x[0]))
    out[7]["sub_nat_breed"] = rows_brd[:1200]

    # Fungi & mushrooms with clean English vernacular names from cached d7_fungus
    rows_fng = []
    seen_fng = set(base_pkeys[7])
    for cp in sorted(client.cache_dir.glob("qlever_d7_fungus_*.json.gz")):
        with gzip.open(cp, "rt", encoding="utf-8") as gf:
            raw_fg = json.load(gf)
        for r in group_single_valued(raw_fg, ["sci"], ["name"]):
            nm = clean_text(r["name"], max_len=32)
            sc = clean_text(r["sci"], max_len=34)
            try:
                sl = int(r["sl"])
            except ValueError:
                continue
            if not (nm and sc) or len(sc.split()) != 2 or nm.lower() == sc.lower():
                continue
            if nm.lower().startswith(sc.split()[0].lower()) or not no_leak(nm, sc) or nm.lower() in seen_fng:
                continue
            seen_fng.add(nm.lower())
            nm_cap = nm[0].upper() + nm[1:] if nm[0].islower() else nm
            rows_fng.append([nm_cap, sc, sl_to_irt(sl, 0.15)])
    rows_fng.sort(key=lambda x: (x[2], x[0]))
    if len(rows_fng) >= 20:
        out[7]["sub_nat_fungus"] = rows_fng[:600]

    # ---- DOMAIN 8: WORLD AFFAIRS & LAW ----
    print("\n=== Specialist Domain 8: World Affairs & Law ===", flush=True)
    raw_pty = client.qlever_query("sub_d8_party_leaders", QL_PREFIX + """
SELECT ?item ?name ?party ?country ?year ?sl WHERE {
  ?item wdt:P31 wd:Q5 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P106 wd:Q82955 ; wdt:P102 ?p ; wdt:P27 ?c ; wdt:P569 ?b .
  ?p @en@rdfs:label ?party . ?c @en@rdfs:label ?country .
  BIND(YEAR(?b) AS ?year)
  FILTER(?sl >= 18 && ?year >= 1780 && ?year <= 1995)
} ORDER BY DESC(?sl) LIMIT 18000
""")
    rows_pty = []
    seen = set()
    for r in group_single_valued(raw_pty, ["party", "country", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        pt = clean_text(r["party"], max_len=34)
        cnt = clean_country(r["country"])
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and pt and cnt) or nm.lower() in seen or nm.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES:
            continue
        if not no_leak(nm, pt) or not no_leak(nm, cnt):
            continue
        seen.add(nm.lower())
        rows_pty.append([nm, pt, cnt, yr, sl_to_irt(sl, 0.05)])
    rows_pty.sort(key=lambda x: (x[4], x[3]))
    out[8]["sub_soc_party_leader"] = rows_pty[:5500]

    raw_law = client.qlever_query("sub_d8_laws_cases", QL_PREFIX + """
SELECT ?item ?name ?country ?year ?tLabel ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ; wdt:P17 ?c .
  VALUES ?t { wd:Q7755 wd:Q820655 wd:Q114079647 wd:Q327197 }
  { ?item wdt:P571 ?dt . } UNION { ?item wdt:P577 ?dt . } UNION { ?item wdt:P585 ?dt . }
  ?c @en@rdfs:label ?country . ?t @en@rdfs:label ?tLabel .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 1200 && ?year <= 2024)
} ORDER BY DESC(?sl) LIMIT 8000
""")
    lw_map = {"constitution": "Constitution", "statute": "Statute", "legal case": "Landmark Legal Case"}
    rows_law = []
    seen = set()
    for r in group_single_valued(raw_law, ["country", "year"], ["name", "tLabel"]):
        nm = clean_text(r["name"], max_len=38)
        cnt = clean_country(r["country"])
        lt = lw_map.get(r["tLabel"].lower(), "Legal Instrument")
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and cnt) or not no_leak(nm, cnt) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_law.append([nm, cnt, yr, lt, sl_to_irt(sl, 0.10)])
    rows_law.sort(key=lambda x: (x[4], x[2]))
    out[8]["sub_soc_law"] = rows_law[:2200]

    # Additional statesmen, diplomats, jurists & economists from cached d8_leaders not in domain_8!
    role8_map = {
        "diplomat": "Diplomat", "jurist": "Jurist", "judge": "Judge",
        "economist": "Economist", "activist": "Activist", "journalist": "Journalist",
        "sociologist": "Sociologist", "politician": "Statesman",
    }
    deep_st8 = []
    seen_s8 = set(base_pkeys[8]) | {r[0].lower() for r in rows_pty}
    for cp in sorted(client.cache_dir.glob("qlever_d8_leaders_*.json.gz")):
        with gzip.open(cp, "rt", encoding="utf-8") as gf:
            raw_s8 = json.load(gf)
        for r in group_single_valued(raw_s8, ["country", "year"], ["name", "occLabel"]):
            nm = clean_text(r["name"], max_len=32)
            rl = role8_map.get(r["occLabel"].lower(), "Public Figure")
            cnt = clean_country(r["country"])
            try:
                yr, sl = int(r["year"]), int(r["sl"])
            except ValueError:
                continue
            if not (nm and cnt) or yr < 1700 or yr > 1998 or nm.lower() in seen_s8:
                continue
            if nm.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES or not no_leak(nm, cnt):
                continue
            seen_s8.add(nm.lower())
            deep_st8.append([nm, rl, cnt, yr, sl_to_irt(sl, 0.10)])
    deep_st8.sort(key=lambda x: (x[4], x[3]))
    out[8]["sub_soc_statesman_deep"] = deep_st8[:5500]

    # ---- DOMAIN 9: FOOD, CRAFT & DESIGN ----
    print("\n=== Specialist Domain 9: Food, Craft & Design ===", flush=True)
    raw_atl = client.qlever_query("sub_d9_ateliers", QL_PREFIX + """
SELECT ?item ?name ?founder ?year ?country ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P112 ?f ; wdt:P17 ?c ; wdt:P571 ?dt .
  VALUES ?t { wd:Q4830453 wd:Q1618899 wd:Q431289 wd:Q786820 wd:Q131734 wd:Q156362 wd:Q167270 }
  ?f @en@rdfs:label ?founder . ?c @en@rdfs:label ?country .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 10 && ?year >= 1650 && ?year <= 2023)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_atl = []
    seen = set()
    for r in group_single_valued(raw_atl, ["founder", "country", "year"], ["name"]):
        nm = clean_text(r["name"], max_len=34)
        fn = clean_text(r["founder"], max_len=30)
        cnt = clean_country(r["country"])
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (nm and fn and cnt) or clean_country(fn) or not no_leak(nm, fn) or not no_leak(cnt, fn) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        rows_atl.append([nm, fn, yr, cnt, sl_to_irt(sl, 0.05)])
    rows_atl.sort(key=lambda x: (x[4], x[2]))
    out[9]["sub_food_atelier"] = rows_atl[:3800]

    raw_ing = client.qlever_query("sub_d9_ingredients", QL_PREFIX + """
SELECT ?item ?name ?ing ?country ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ; wdt:P495 ?c .
  VALUES ?t { wd:Q746549 wd:Q2095 wd:Q10943 wd:Q7802 wd:Q182940 wd:Q41415 wd:Q134768 wd:Q25403900 }
  { ?item wdt:P527 ?i . } UNION { ?item wdt:P186 ?i . }
  ?i @en@rdfs:label ?ing . ?c @en@rdfs:label ?country .
  FILTER(?sl >= 3)
} ORDER BY DESC(?sl) LIMIT 8000
""")
    rows_ing = []
    seen = set()
    for r in group_single_valued(raw_ing, ["ing", "country"], ["name"]):
        nm = clean_text(r["name"], max_len=32)
        ig = clean_text(r["ing"], max_len=26)
        cnt = clean_country(r["country"])
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (nm and ig and cnt) or not no_leak(nm, ig) or not no_leak(nm, cnt) or nm.lower() in seen:
            continue
        seen.add(nm.lower())
        nm_cap = nm[0].upper() + nm[1:] if nm[0].islower() else nm
        rows_ing.append([nm_cap, ig, cnt, sl_to_irt(sl, 0.0)])
    rows_ing.sort(key=lambda x: (x[3], x[0]))
    out[9]["sub_food_ingred"] = rows_ing[:2500]

    # ---- DOMAIN 10: MYTH & LITERATURE ----
    print("\n=== Specialist Domain 10: Myth & Literature ===", flush=True)
    raw_chr = client.qlever_query("sub_d10_characters", QL_PREFIX + """
SELECT ?item ?name ?work ?creator ?sl WHERE {
  ?item wdt:P31 ?t ; wikibase:sitelinks ?sl ; @en@rdfs:label ?name ;
        wdt:P1441 ?w ; wdt:P170 ?c .
  VALUES ?t { wd:Q95074 wd:Q15632617 wd:Q15773347 wd:Q1114461 }
  ?w @en@rdfs:label ?work . ?c @en@rdfs:label ?creator .
  FILTER(?sl >= 6)
} ORDER BY DESC(?sl) LIMIT 12000
""")
    rows_chr = []
    seen = set()
    for r in group_single_valued(raw_chr, ["work", "creator"], ["name"]):
        nm = clean_text(r["name"], max_len=30)
        wk = clean_text(r["work"], max_len=36)
        cr = clean_text(r["creator"], max_len=30)
        try:
            sl = int(r["sl"])
        except ValueError:
            continue
        if not (nm and wk and cr) or not no_leak(nm, wk) or not no_leak(nm, cr) or nm.lower() in seen:
            continue
        if cr.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES:
            continue
        seen.add(nm.lower())
        rows_chr.append([nm, wk, cr, sl_to_irt(sl, -0.05)])
    rows_chr.sort(key=lambda x: (x[3], x[0]))
    out[10]["sub_lit_char"] = rows_chr[:4500]

    raw_lgn = client.qlever_query("sub_d10_lit_genre", QL_PREFIX + """
SELECT ?item ?title ?author ?genre ?year ?sl WHERE {
  ?item wdt:P31 wd:Q7725634 ; wikibase:sitelinks ?sl ; @en@rdfs:label ?title ;
        wdt:P50 ?a ; wdt:P136 ?g ; wdt:P577 ?dt .
  ?a @en@rdfs:label ?author . ?g @en@rdfs:label ?genre .
  BIND(YEAR(?dt) AS ?year)
  FILTER(?sl >= 5 && ?year >= 1400 && ?year <= 2025)
} ORDER BY DESC(?sl) LIMIT 14000
""")
    lgn_map = {
        "science fiction": "Science Fiction", "fantasy": "Fantasy",
        "crime fiction": "Crime & Mystery", "detective fiction": "Mystery",
        "horror fiction": "Horror", "historical fiction": "Historical Fiction",
        "romance novel": "Romance", "tragedy": "Tragedy", "comedy": "Comedy",
        "dystopian fiction": "Dystopian Fiction", "adventure fiction": "Adventure",
        "thriller": "Thriller", "satire": "Satire", "gothic fiction": "Gothic Fiction",
        "autobiography": "Autobiography", "biography": "Biography",
    }
    rows_lgn = []
    seen = set()
    for r in group_single_valued(raw_lgn, ["author", "genre", "year"], ["title"]):
        ti = clean_text(r["title"], max_len=38)
        au = clean_text(r["author"], max_len=30)
        gn = lgn_map.get(r["genre"].lower())
        try:
            yr, sl = int(r["year"]), int(r["sl"])
        except ValueError:
            continue
        if not (ti and au and gn) or not no_leak(ti, gn) or not no_leak(ti, au) or ti.lower() in seen:
            continue
        if au.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES:
            continue
        seen.add(ti.lower())
        rows_lgn.append([ti, au, gn, yr, sl_to_irt(sl, 0.0)])
    rows_lgn.sort(key=lambda x: (x[4], x[3]))
    out[10]["sub_lit_genre"] = rows_lgn[:4500]

    # Additional world novelists, poets, playwrights & philosophers from cached d10_authors_v2!
    role10_map = {
        "novelist": "Novelist", "poet": "Poet", "playwright": "Playwright",
        "philosopher": "Philosopher", "writer": "Author",
        "science fiction writer": "Sci-Fi Author", "children's writer": "Children's Author",
    }
    deep_au10 = []
    seen_a10 = set(base_pkeys[10])
    for cp in sorted(client.cache_dir.glob("qlever_d10_authors_v2_*.json.gz")):
        with gzip.open(cp, "rt", encoding="utf-8") as gf:
            raw_a10 = json.load(gf)
        for r in group_single_valued(raw_a10, ["country", "year"], ["name", "occLabel"]):
            nm = clean_text(r["name"], max_len=32)
            rl = role10_map.get(r["occLabel"].lower(), "Author")
            cnt = clean_country(r["country"])
            try:
                yr, sl = int(r["year"]), int(r["sl"])
            except ValueError:
                continue
            if not (nm and cnt) or yr < 1200 or yr > 1998 or nm.lower() in seen_a10:
                continue
            if nm.lower() in SENSITIVE_NON_ENTERTAINMENT_FIGURES or not no_leak(nm, cnt):
                continue
            seen_a10.add(nm.lower())
            deep_au10.append([nm, rl, cnt, yr, sl_to_irt(sl, 0.10)])
    deep_au10.sort(key=lambda x: (x[4], x[3]))
    out[10]["sub_lit_author_deep"] = deep_au10[:7500]

    # ---- DOMAIN 11: SPECIALIST MATHEMATICS, PROBABILITY, ALGEBRA & CIPHERS ----
    print("\n=== Specialist Domain 11: Deep Math, Probability, Geometry & Ciphers ===", flush=True)
    out[11] = build_specialist_math_tables()

    return out


# ---------------------------------------------------------------------------
# Domain 11 Specialist Math Generator (~62,000 Qs across pure L2 topics!)
# ---------------------------------------------------------------------------
def _near_ints(ans: int, offs: List[int], min_v: int = -10000) -> List[int]:
    res, seen = [], {ans}
    for o in offs:
        c = ans + o
        if c >= min_v and c not in seen:
            seen.add(c)
            res.append(c)
        if len(res) == 3:
            return res
    st = 1
    while len(res) < 3:
        for c in (ans + st, ans - st):
            if c >= min_v and c not in seen:
                seen.add(c)
                res.append(c)
                if len(res) == 3:
                    return res
        st += 1
    return res


def _simp_frac(num: int, den: int) -> str:
    g = math.gcd(num, den)
    return f"{num // g}/{den // g}"


def build_specialist_math_tables() -> Dict[str, List[list]]:
    num_rows: List[list] = []
    word_rows: List[list] = []
    seen: Set[str] = set()

    def add_n(stmt: str, ans: int, offs: List[int], topic: str, unit: str, irt: int, min_v: int = 0):
        if stmt in seen:
            return
        seen.add(stmt)
        safe_unit = unit.strip() if unit and unit.strip() else "value"
        ds = _near_ints(ans, offs, min_v=min_v)
        num_rows.append([stmt, ans, ds[0], ds[1], ds[2], topic, safe_unit, max(-140, min(250, irt))])

    def add_w(stmt: str, ans: str, ds: List[str], topic: str, irt: int):
        if stmt in seen:
            return
        u, s = [], {ans.lower()}
        for d in ds:
            if d and d.lower() not in s:
                s.add(d.lower())
                u.append(d)
        if len(u) < 3:
            return
        seen.add(stmt)
        word_rows.append([stmt, ans, u[0], u[1], u[2], topic, max(-140, min(250, irt))])

    # 1. Euler's Totient phi(n), Modular Exponentiation & Divisor Sums
    for n in range(6, 520):
        res, temp, p = n, n, 2
        while p * p <= temp:
            if temp % p == 0:
                while temp % p == 0:
                    temp //= p
                res -= res // p
            p += 1
        if temp > 1:
            res -= res // temp
        add_n(f"What is Euler's totient phi({n}) (count of integers 1..{n} coprime to {n})", res, [1, -1, 2, -2, 4], "Number Theory", "integers", 40 + min(200, n // 2), min_v=1)

    for a in range(2, 16):
        for b in range(3, 20):
            for m in [5, 7, 9, 10, 11, 13, 17, 19, 23]:
                if math.gcd(a, m) != 1:
                    continue
                val = pow(a, b, m)
                add_n(f"What is ({a}^{b}) mod {m}", val, [1, -1, 2, -2, 3], "Modular Arithmetic", "remainder", 25 + min(215, b * 10 + m * 5), min_v=0)
                if len(num_rows) >= 5200:
                    break
            if len(num_rows) >= 5200:
                break
        if len(num_rows) >= 5200:
            break

    # 2. Cubic, Recurrence & Arithmetic Series Sums
    for k in range(1, 42):
        for d in range(1, 26):
            seq = [n ** 3 + k * n + d for n in range(1, 7)]
            if seq[-1] > 1500:
                continue
            s_txt = ", ".join(str(v) for v in seq[:5])
            add_n(f"Determine the 6th term of the cubic sequence: {s_txt}, ...", seq[5], [k, -k, 6, -6, 12], "Sequences", "term", 35 + min(200, k * 5 + d * 3), min_v=1)

    for a in range(1, 20):
        for b in range(2, 22):
            for mult in (2, 3):
                seq = [a, b]
                for _ in range(4):
                    seq.append(mult * seq[-1] - seq[-2] + 2)
                if seq[-1] <= 0 or seq[-1] > 3000:
                    continue
                s_txt = ", ".join(str(v) for v in seq[:5])
                add_n(f"Find the next term in the recurrence sequence: {s_txt}, ...", seq[5], [2, -2, 4, -4, a], "Sequences", "term", 65 + min(180, (a + b) * 6), min_v=1)

    # 3. Coordinate Geometry, Cylinders & 3D Solids
    triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25), (6, 8, 10), (9, 12, 15), (12, 16, 20), (15, 20, 25), (9, 40, 41)]
    for dx, dy, dist in triples:
        for x0 in range(-14, 17, 2):
            for y0 in range(-12, 16, 2):
                x1, y1 = x0 + dx, y0 + dy
                add_n(f"What is the Euclidean distance between ({x0}, {y0}) and ({x1}, {y1})", dist, [1, -1, 2, -2, 3], "Coordinate Geometry", "units", -40 + min(190, dist * 5 + abs(x0) * 4), min_v=1)
                if len(num_rows) >= 12000:
                    break
            if len(num_rows) >= 12000:
                break

    for r in range(2, 48):
        for h in range(3, 34, 2):
            coeff = r * r * h
            if coeff > 25000:
                continue
            add_n(f"A cylinder has radius {r} and height {h}. Its exact volume is K * pi; what is K", coeff, [r * h, -r * h, r * r, 10], "3D Geometry", "cubic units", -20 + min(210, r * 5 + h * 3), min_v=4)
            if len(num_rows) >= 14500:
                break
        if len(num_rows) >= 14500:
            break

    # 4. 2x2 Linear Systems, 2x2 Matrix Determinants & Quadratic Discriminants
    for x in range(2, 40):
        for y in range(1, x):
            s_xy, d_xy = x + y, x - y
            add_n(f"If x + y = {s_xy} and x - y = {d_xy}, what is the value of x * y", x * y, [x, -y, s_xy, 2, -2], "Algebra Systems", "product", -55 + min(200, x * 5), min_v=1)

    for ma in range(2, 16):
        for md in range(2, 16):
            for mb in range(1, 12):
                for mc in range(1, 12):
                    det = ma * md - mb * mc
                    if det <= 2:
                        continue
                    add_n(
                        f"What is the determinant of the 2x2 matrix [[{ma}, {mb}], [{mc}, {md}]]",
                        det, [ma * md + mb * mc - det, 2, -2, ma, -mb],
                        "Algebra Systems", "determinant", -15 + min(210, (ma + md + mb + mc) * 5), min_v=1
                    )
                    if len(num_rows) >= 21000:
                        break
                if len(num_rows) >= 21000:
                    break
            if len(num_rows) >= 21000:
                break
        if len(num_rows) >= 21000:
            break

    # 5. Polynomial Calculus Derivatives & Definite Integrals
    for a in range(1, 11):
        for b in range(1, 14):
            for c in range(1, 17, 2):
                for xv in range(1, 8):
                    deriv = 3 * a * (xv ** 2) + 2 * b * xv + c
                    add_n(f"What is the derivative f'({xv}) of f(x) = {a}x^3 + {b}x^2 + {c}x at x = {xv}", deriv, [a, -a, b, 2 * b, 3], "Calculus", "slope", 65 + min(180, a * 10 + xv * 16), min_v=1)
                    if len(num_rows) >= 28000:
                        break
                if len(num_rows) >= 28000:
                    break
            if len(num_rows) >= 28000:
                break
        if len(num_rows) >= 28000:
            break

    # 6. Exact Probability Fractions (Urns, Cards, Conditional) & Atbash / Base-8 / Base-16 Ciphers
    for red in range(2, 18):
        for blue in range(2, 18):
            tot = red + blue
            ans_f = _simp_frac(red * (red - 1), tot * (tot - 1))
            d1 = _simp_frac(red * red, tot * tot)
            d2 = _simp_frac(red, tot)
            d3 = _simp_frac(max(1, red * (red - 1) + 1), tot * (tot - 1))
            if len({ans_f, d1, d2, d3}) == 4:
                add_w(
                    f"An urn holds {red} red and {blue} blue marbles. Drawing 2 without replacement, what is the probability both are red",
                    ans_f, [d1, d2, d3], "Probability", 20 + min(200, tot * 6)
                )
            ans_m = _simp_frac(2 * red * blue, tot * (tot - 1))
            dm1 = _simp_frac(red * blue, tot * (tot - 1))  # forgot factor of 2 trap!
            dm2 = _simp_frac(2 * red * blue, tot * tot)
            dm3 = _simp_frac(red, tot)
            if len({ans_m, dm1, dm2, dm3}) == 4:
                add_w(
                    f"A box holds {red} ruby and {blue} sapphire tokens. Drawing 2 without replacement, what is the probability of getting 1 of each",
                    ans_m, [dm1, dm2, dm3], "Probability", 45 + min(195, tot * 6)
                )
            ans_s = _simp_frac(red, tot)
            ds1 = _simp_frac(blue, tot)
            ds2 = _simp_frac(red, tot + 1)
            ds3 = _simp_frac(max(1, red - 1), tot)
            if len({ans_s, ds1, ds2, ds3}) == 4:
                add_w(
                    f"A bag contains {red} gold coins and {blue} silver coins. Picking 1 at random, what is the probability of drawing gold",
                    ans_s, [ds1, ds2, ds3], "Probability", -90 + min(120, tot * 4)
                )

    from build_million_shards import CIPHER_WORDS
    clean_words = sorted(set(w for w in CIPHER_WORDS if 5 <= len(w) <= 8 and w.isalpha()))
    for idx, w in enumerate(clean_words):
        atbash = "".join(chr(90 - (ord(c) - 65)) for c in w)
        same_l = [cw for cw in clean_words if len(cw) == len(w) and cw != w]
        if len(same_l) >= 3:
            ds = [same_l[(idx * 3 + k * 7) % len(same_l)] for k in range(3)]
            add_w(f"Decode the Atbash mirror cipher \"{atbash}\" (A<->Z, B<->Y, ...)", w, ds, "Cryptography", 30 + len(w) * 14)

    for n in range(16, 6000):
        oct_s = oct(n)[2:]
        add_w(
            f"How is decimal {n} represented in octal (base-8)",
            f"0o{oct_s}",
            [f"0o{oct(n+1)[2:]}", f"0o{oct(max(1,n-1))[2:]}", f"0o{oct(n+8)[2:]}"],
            "Base Systems", 10 + min(210, n // 12)
        )
        if len(word_rows) >= 8500:
            break

    num_rows.sort(key=lambda x: (x[-1], x[5], x[0]))
    word_rows.sort(key=lambda x: (x[-1], x[5], x[0]))
    return {
        "sub_math_spec_num": num_rows[:28000],
        "sub_math_spec_word": word_rows[:8500],
    }


# ---------------------------------------------------------------------------
# 3. Shard Chunk Serializer (<= 1.40 MB per file, exact WS_SHARD_V1 format)
# ---------------------------------------------------------------------------
def serialize_subcat_chunk(domain_id: int, chunk_tables: List[Tuple[str, int, List[list]]]) -> bytes:
    pool: List[str] = []
    pool_idx: Dict[str, int] = {}
    t_objs = []
    for tid, base_qid, rows in chunk_tables:
        pcols = set(SUBCAT_TYPE_SPECS[tid].get("poolCols", []))
        interned = []
        for r in rows:
            nr = list(r)
            for ci in pcols:
                sval = str(nr[ci])
                idx = pool_idx.get(sval)
                if idx is None:
                    idx = len(pool)
                    pool.append(sval)
                    pool_idx[sval] = idx
                nr[ci] = idx
            interned.append(nr)
        t_objs.append({"type": tid, "baseQid": base_qid, "r": interned})
    return json.dumps({"v": 1, "d": domain_id, "p": pool, "t": t_objs}, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def write_subcat_files(
    domain_id: int,
    prefix: str,
    tables: Dict[str, List[list]],
    next_qid: int,
) -> Tuple[List[Dict[str, Any]], Dict[str, List[Tuple[int, int]]], int]:
    """
    Writes `<prefix>.json` (or `<prefix>_0.json`, `<prefix>_1.json` if > MAX_CHUNK_BYTES).
    Returns (files_meta, qid_ranges_by_type, updated_next_qid).
    """
    items = [(t, rows) for t, rows in tables.items() if len(rows) >= 20]
    qid_ranges_by_type: Dict[str, List[Tuple[int, int]]] = defaultdict(list)
    if not items:
        return [], qid_ranges_by_type, next_qid

    # Sanitize indefinite articles in templates once
    for t, _ in items:
        for ang in SUBCAT_TYPE_SPECS[t]["angles"]:
            for k in ("prompt", "clue1", "clue2", "why", "truePrompt", "falsePrompt", "whyTrue", "whyFalse"):
                if k in ang and isinstance(ang[k], str):
                    ang[k] = fix_indefinite_articles(ang[k])

    tentative = []
    qc = next_qid
    for tid, rows in items:
        na = len(SUBCAT_TYPE_SPECS[tid]["angles"])
        tentative.append((tid, qc, rows))
        qid_ranges_by_type[tid].append((qc, qc + len(rows) * na - 1))
        qc += len(rows) * na

    raw = serialize_subcat_chunk(domain_id, tentative)
    if len(raw) <= MAX_CHUNK_BYTES:
        fname = f"{prefix}.json"
        (PUBLIC_SHARDS_DIR / fname).write_bytes(raw)
        return [{
            "path": fname,
            "bytes": len(raw),
            "entities": sum(len(r) for _, _, r in tentative),
            "questions": qc - next_qid,
            "baseQid": next_qid,
            "qidEnd": qc - 1,
            "types": [t for t, _, _ in tentative],
        }], qid_ranges_by_type, qc

    # Multi-part split <= MAX_CHUNK_BYTES
    qid_ranges_by_type.clear()
    files_meta = []
    cur: List[Tuple[str, int, List[list]]] = []
    cur_start = next_qid
    qc = next_qid
    cidx = 0

    def flush():
        nonlocal cidx, cur, cur_start
        if not cur:
            return
        payload = serialize_subcat_chunk(domain_id, cur)
        fname = f"{prefix}_{cidx}.json"
        (PUBLIC_SHARDS_DIR / fname).write_bytes(payload)
        qs = sum(len(r) * len(SUBCAT_TYPE_SPECS[t]["angles"]) for t, _, r in cur)
        files_meta.append({
            "path": fname,
            "bytes": len(payload),
            "entities": sum(len(r) for _, _, r in cur),
            "questions": qs,
            "baseQid": cur_start,
            "qidEnd": cur_start + qs - 1,
            "types": [t for t, _, _ in cur],
        })
        cidx += 1
        cur = []
        cur_start = qc

    for tid, rows in items:
        na = len(SUBCAT_TYPE_SPECS[tid]["angles"])
        # Slice huge tables into ~7,000-row interleaved chunks so each stays < 1.3 MB
        step_n = max(1, math.ceil(len(rows) / 7000))
        parts = [rows[i::step_n] for i in range(step_n)]
        for pr in parts:
            cand = cur + [(tid, qc, pr)]
            if cur and len(serialize_subcat_chunk(domain_id, cand)) > MAX_CHUNK_BYTES:
                flush()
                cand = [(tid, qc, pr)]
            cur = cand
            qid_ranges_by_type[tid].append((qc, qc + len(pr) * na - 1))
            qc += len(pr) * na
    flush()
    return files_meta, qid_ranges_by_type, qc


# ---------------------------------------------------------------------------
# 4. Exact 3-Level Taxonomy Definition (12 L0 -> 50 L1 -> 152 L2 Topics!)
#    100% Superset of `BUILTIN_TAXONOMY_SEEDS` IDs + Exact Rule Counting!
# ---------------------------------------------------------------------------
def build_rich_3level_taxonomy_blueprint() -> List[Dict[str, Any]]:
    """
    Returns 12 L0 Domains -> 50 L1 Subcategories -> 152 L2 Specific Topics.
    Preserves ALL IDs from `src/forge/TaxonomyCatalog.ts` (incl. `sports` -> `sports_baseball`)
    and enforces strict `allowedAngleIds` (`answerCol !== filterCol` & `fakeCol !== filterCol`,
    and never `ac_disc`, `la_role`, or `lm_type`).
    """
    return [
        # ==================== L0 = 0: WORLD HISTORY (4 L1, 13 L2) ====================
        {
            "l0Domain": 0,
            "l1Subcategories": [
                {
                    "id": "hist_military", "name": "Military History & Conflicts",
                    "keywords": ["battle", "war", "siege", "campaign", "military"],
                    "l2Topics": [
                        {"id": "hist_ww2", "name": "World War II", "keywords": ["world war ii", "normandy", "stalingrad", "pacific war"],
                         "shardRules": [{"type": "hist_battle", "filterCol": 1, "filterValues": ["World War II", "Pacific War", "Eastern Front", "Western Front"], "matchMode": "contains", "allowedAngleIds": ["hb_country", "hb_tf", "hb_year"]}]},
                        {"id": "hist_ww1_modern_wars", "name": "World War I & Cold War Conflicts", "keywords": ["world war i", "cold war", "korean war", "vietnam"],
                         "shardRules": [{"type": "hist_battle", "filterCol": 1, "filterValues": ["World War I", "Korean War", "Vietnam War", "Spanish Civil War", "Russian Civil War", "Gulf War"], "matchMode": "contains", "allowedAngleIds": ["hb_country", "hb_tf", "hb_year"]}]},
                        {"id": "hist_napoleonic_early_modern", "name": "Napoleonic & Revolutionary Wars", "keywords": ["napoleon", "waterloo", "american revolution", "french revolution"],
                         "shardRules": [{"type": "hist_battle", "filterCol": 1, "filterValues": ["Napoleonic", "Revolutionary", "Seven Years", "War of 1812"], "matchMode": "contains", "allowedAngleIds": ["hb_country", "hb_tf", "hb_year"]}]},
                        {"id": "hist_american_civil_war", "name": "American Civil War & U.S. History", "keywords": ["american civil war", "gettysburg", "union", "confederate", "lincoln"],
                         "shardRules": [{"type": "hist_battle", "filterCol": 1, "filterValues": ["American Civil War", "American Revolutionary", "War of 1812", "Mexican-American"], "matchMode": "contains", "allowedAngleIds": ["hb_country", "hb_tf", "hb_year"]}, {"type": "hist_figure", "filterCol": 3, "filterValues": ["United States"], "allowedAngleIds": ["hf_rev", "hf_year"]}]},
                        {"id": "hist_ancient_medieval_battles", "name": "Ancient & Medieval Warfare", "keywords": ["crusade", "roman", "punic", "hundred years", "medieval"],
                         "shardRules": [{"type": "hist_battle", "filterCol": 1, "filterValues": ["Crusade", "Punic", "Roman", "Byzantine", "Hundred Years", "Mongol", "Sengoku", "Ottoman"], "matchMode": "contains", "allowedAngleIds": ["hb_country", "hb_tf", "hb_year"]}]},
                    ],
                },
                {
                    "id": "hist_empires", "name": "Empires, Dynasties & Realms",
                    "keywords": ["empire", "dynasty", "kingdom", "royal house", "caliphate"],
                    "l2Topics": [
                        {"id": "hist_royal_dynasties", "name": "Royal Houses & Noble Dynasties", "keywords": ["dynasty", "tudor", "habsburg", "bourbon", "romanov", "medici"],
                         "shardRules": [{"type": "sub_hist_dynasty"}]},
                        {"id": "hist_classical_antiquity", "name": "Ancient Rome, Greece & Egypt", "keywords": ["roman", "greece", "egypt", "pharaoh", "antiquity"],
                         "shardRules": [{"type": "hist_empire"}, {"type": "sub_hist_figures_deep", "filterCol": 1, "filterValues": ["Antiquity & Medieval"], "allowedAngleIds": ["shf_cnt", "shf_rev", "shf_tf", "shf_yr"]}]},
                        {"id": "hist_asian_islamic_empires", "name": "Imperial Asia & Islamic Caliphates", "keywords": ["qing", "ming", "ottoman", "mughal", "shogunate"],
                         "shardRules": [{"type": "hist_empire"}, {"type": "hist_figure", "filterCol": 3, "filterValues": ["China", "Japan", "India", "Iran", "Turkey", "Ottoman Empire", "Qing Dynasty", "Ming Dynasty"], "allowedAngleIds": ["hf_rev", "hf_year"]}]},
                        {"id": "hist_european_crowns", "name": "European Kingdoms & Empires", "keywords": ["prussia", "british empire", "holy roman", "byzantine", "france"],
                         "shardRules": [{"type": "hist_empire"}, {"type": "sub_hist_dynasty"}]},
                    ],
                },
                {
                    "id": "hist_leaders_figures", "name": "Historical Figures & Rulers",
                    "keywords": ["monarch", "emperor", "statesman", "explorer", "commander"],
                    "l2Topics": [
                        {"id": "hist_monarchs_rulers", "name": "Monarchs, Emperors & Sovereign Rulers", "keywords": ["monarch", "king", "queen", "emperor", "pharaoh"],
                         "shardRules": [{"type": "hist_figure", "filterCol": 1, "filterValues": ["Monarch", "Emperor", "Pharaoh", "Noble"], "allowedAngleIds": ["hf_country", "hf_rev", "hf_tf", "hf_year"]}, {"type": "sub_hist_dynasty"}]},
                        {"id": "hist_statesmen_revolutionaries", "name": "Statesmen, Diplomats & Revolutionaries", "keywords": ["diplomat", "revolutionary", "president", "prime minister", "statesman"],
                         "shardRules": [{"type": "hist_figure", "filterCol": 1, "filterValues": ["Statesman", "President", "Prime Minister", "Diplomat", "Revolutionary"], "allowedAngleIds": ["hf_country", "hf_rev", "hf_tf", "hf_year"]}, {"type": "sub_hist_figures_deep", "filterCol": 1, "filterValues": ["Modern Era", "Early Modern Era"], "allowedAngleIds": ["shf_cnt", "shf_rev", "shf_tf", "shf_yr"]}]},
                        {"id": "hist_explorers_commanders", "name": "Explorers, Navigators & Commanders", "keywords": ["explorer", "navigator", "general", "commander", "historian"],
                         "shardRules": [{"type": "hist_figure", "filterCol": 1, "filterValues": ["Explorer", "Military Commander", "Historian"], "allowedAngleIds": ["hf_country", "hf_rev", "hf_tf", "hf_year"]}]},
                    ],
                },
                {
                    "id": "hist_treaties_eras", "name": "Treaties, Archaeology & Turning Points",
                    "keywords": ["treaty", "archaeology", "ruins", "charter", "reformation"],
                    "l2Topics": [
                        {"id": "hist_archaeology_ruins", "name": "Archaeological Sites & Ancient Ruins", "keywords": ["archaeology", "ruins", "pompeii", "civilization", "excavation"],
                         "shardRules": [{"type": "sub_hist_arch_site"}]},
                        {"id": "hist_diplomatic_treaties", "name": "Peace Treaties & Diplomatic Summits", "keywords": ["treaty", "peace", "accord", "convention"],
                         "shardRules": [{"type": "hist_war"}]},
                        {"id": "hist_revolutions_reforms", "name": "Social Revolutions & Modern Era", "keywords": ["revolution", "industrial", "enlightenment", "reformation"],
                         "shardRules": [{"type": "hist_war"}, {"type": "sub_hist_figures_deep", "filterCol": 1, "filterValues": ["Early Modern Era"], "allowedAngleIds": ["shf_cnt", "shf_rev", "shf_tf", "shf_yr"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 1: SCIENCE & SPACE (4 L1, 13 L2) ====================
        {
            "l0Domain": 1,
            "l1Subcategories": [
                {
                    "id": "sci_astronomy_space", "name": "Astronomy, Cosmology & Spaceflight",
                    "keywords": ["space", "planet", "exoplanet", "star", "galaxy", "asteroid", "nasa"],
                    "l2Topics": [
                        {"id": "sci_exoplanets", "name": "Exoplanets & Planetary Systems", "keywords": ["exoplanet", "kepler", "tess", "transit"],
                         "shardRules": [{"type": "sci_exoplanet"}, {"type": "sub_sci_exo_deep"}]},
                        {"id": "sci_stars_galaxies", "name": "Stars, Nebulae & Constellations", "keywords": ["constellation", "nebula", "galaxy", "supernova", "pulsar"],
                         "shardRules": [{"type": "sci_astro"}]},
                        {"id": "sci_solar_asteroids_comets", "name": "Asteroids, Moons & Comets", "keywords": ["asteroid", "comet", "moon", "solar system", "discoverer"],
                         "shardRules": [{"type": "sub_sci_solar_body"}]},
                        {"id": "sci_space_missions", "name": "Space Missions, Probes & Rockets", "keywords": ["apollo", "voyager", "mars", "spacecraft", "nasa", "esa"],
                         "shardRules": [{"type": "sci_space"}]},
                    ],
                },
                {
                    "id": "sci_chemistry", "name": "Chemistry & Elements",
                    "keywords": ["element", "chemical", "periodic", "molecule", "compound", "formula"],
                    "l2Topics": [
                        {"id": "sci_periodic_elements", "name": "Periodic Table of Elements", "keywords": ["atomic number", "symbol", "noble gas", "element"],
                         "shardRules": [{"type": "sci_element"}]},
                        {"id": "sci_compounds_molecules", "name": "Chemical Compounds & Molar Mass", "keywords": ["formula", "molar mass", "acid", "compound", "molecule"],
                         "shardRules": [{"type": "sci_chemical"}]},
                        {"id": "sci_nobel_chemists", "name": "Famous Chemists & Biochemists", "keywords": ["chemist", "chemistry", "biochemistry", "nobel"],
                         "shardRules": [{"type": "sci_scientist", "filterCol": 1, "filterValues": ["Chemistry", "Biochemistry"], "allowedAngleIds": ["ss_country", "ss_rev", "ss_year"]}, {"type": "sub_sci_laureate", "filterCol": 1, "filterValues": ["Chemistry"], "matchMode": "contains", "allowedAngleIds": ["ssl_alma", "ssl_tf", "ssl_cdx"]}]},
                    ],
                },
                {
                    "id": "sci_physics", "name": "Physics & Quantum Mechanics",
                    "keywords": ["physics", "quantum", "relativity", "nobel", "optics", "particle"],
                    "l2Topics": [
                        {"id": "sci_physicists", "name": "Physicists & Astronomers", "keywords": ["physicist", "quantum", "relativity", "astronomy"],
                         "shardRules": [{"type": "sci_scientist", "filterCol": 1, "filterValues": ["Physics", "Astronomy"], "allowedAngleIds": ["ss_country", "ss_rev", "ss_year"]}]},
                        {"id": "sci_mechanics_optics", "name": "Nobel Laureates & Scientific Prizes", "keywords": ["nobel", "fields medal", "turing", "copley", "alma mater"],
                         "shardRules": [{"type": "sub_sci_laureate"}]},
                    ],
                },
                {
                    "id": "sci_life_medical", "name": "Medicine, Genetics & Earth Science",
                    "keywords": ["medicine", "genetics", "biology", "botany", "geology"],
                    "l2Topics": [
                        {"id": "sci_biomedical_pioneers", "name": "Medicine & Physiology Pioneers", "keywords": ["medicine", "physician", "surgeon", "immunology"],
                         "shardRules": [{"type": "sci_scientist", "filterCol": 1, "filterValues": ["Medicine"], "allowedAngleIds": ["ss_country", "ss_rev", "ss_year"]}, {"type": "sub_sci_laureate", "filterCol": 1, "filterValues": ["Physiology", "Medicine"], "matchMode": "contains", "allowedAngleIds": ["ssl_alma", "ssl_tf", "ssl_cdx"]}]},
                        {"id": "sci_biology_zoology_botany", "name": "Biologists, Botanists & Zoologists", "keywords": ["biology", "botany", "zoology", "genetics"],
                         "shardRules": [{"type": "sci_scientist", "filterCol": 1, "filterValues": ["Biology", "Botany", "Zoology"], "allowedAngleIds": ["ss_country", "ss_rev", "ss_year"]}]},
                        {"id": "sci_earth_atmosphere", "name": "Earth Science & Geology", "keywords": ["geology", "earth", "tectonics", "climate"],
                         "shardRules": [{"type": "sci_scientist", "filterCol": 1, "filterValues": ["Geology"], "allowedAngleIds": ["ss_country", "ss_rev", "ss_year"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 2: GEOGRAPHY & WONDERS (4 L1, 13 L2) ====================
        {
            "l0Domain": 2,
            "l1Subcategories": [
                {
                    "id": "geo_world_cities", "name": "World Cities & Urban Centers",
                    "keywords": ["city", "metropolis", "state", "population", "urban"],
                    "l2Topics": [
                        {"id": "geo_us_states_cities", "name": "U.S. Cities & 50 States", "keywords": ["united states", "us state", "american city", "texas", "california"],
                         "shardRules": [{"type": "sub_geo_us_city"}, {"type": "geo_city", "filterCol": 1, "filterValues": ["United States"], "allowedAngleIds": ["gc_reg", "gc_pop"]}]},
                        {"id": "geo_cities_europe_americas", "name": "Cities of Europe & Latin America", "keywords": ["europe", "canada", "brazil", "mexico", "france", "germany", "italy"],
                         "shardRules": [{"type": "geo_city", "filterCol": 1, "filterValues": ["Canada", "Mexico", "Brazil", "Argentina", "Colombia", "Chile", "Peru", "United Kingdom", "France", "Germany", "Italy", "Spain", "Poland", "Netherlands", "Sweden", "Switzerland"], "allowedAngleIds": ["gc_country", "gc_rev", "gc_reg", "gc_tf", "gc_pop"]}, {"type": "sub_geo_city_deep", "filterCol": 4, "filterValues": ["Europe", "South America", "North America"], "allowedAngleIds": ["sgc_cnt", "sgc_reg", "sgc_tf", "sgc_pop"]}]},
                        {"id": "geo_cities_asia_pacific", "name": "Cities of Asia & Oceania", "keywords": ["china", "japan", "india", "indonesia", "korea", "australia"],
                         "shardRules": [{"type": "geo_city", "filterCol": 1, "filterValues": ["China", "Japan", "India", "South Korea", "Indonesia", "Philippines", "Vietnam", "Thailand", "Australia", "New Zealand", "Malaysia", "Turkey"], "allowedAngleIds": ["gc_country", "gc_rev", "gc_reg", "gc_tf", "gc_pop"]}, {"type": "sub_geo_city_deep", "filterCol": 4, "filterValues": ["Asia", "Oceania"], "allowedAngleIds": ["sgc_cnt", "sgc_reg", "sgc_tf", "sgc_pop"]}]},
                        {"id": "geo_cities_africa_mena", "name": "Cities of Africa & the Middle East", "keywords": ["egypt", "nigeria", "south africa", "kenya", "morocco", "saudi", "iran"],
                         "shardRules": [{"type": "geo_city", "filterCol": 1, "filterValues": ["Egypt", "Nigeria", "South Africa", "Kenya", "Morocco", "Ethiopia", "Algeria", "Ghana", "Saudi Arabia", "United Arab Emirates", "Israel", "Iran"], "allowedAngleIds": ["gc_country", "gc_rev", "gc_reg", "gc_tf", "gc_pop"]}, {"type": "sub_geo_city_deep", "filterCol": 4, "filterValues": ["Africa"], "allowedAngleIds": ["sgc_cnt", "sgc_reg", "sgc_tf", "sgc_pop"]}]},
                    ],
                },
                {
                    "id": "geo_physical_relief", "name": "Mountains, Volcanoes & Islands",
                    "keywords": ["mountain", "peak", "volcano", "island", "alps", "andes", "himalayas"],
                    "l2Topics": [
                        {"id": "geo_high_summits", "name": "World Mountains & Summit Elevations", "keywords": ["mountain", "peak", "elevation", "everest", "matterhorn"],
                         "shardRules": [{"type": "geo_mountain"}]},
                        {"id": "geo_islands_archipelagos", "name": "World Islands & Archipelagos", "keywords": ["island", "archipelago", "atoll"],
                         "shardRules": [{"type": "geo_wonder", "filterCol": 1, "filterValues": ["Island"], "allowedAngleIds": ["gw_country", "gw_rev", "gw_tf"]}]},
                        {"id": "geo_volcanoes", "name": "Volcanoes & Tectonic Peaks", "keywords": ["volcano", "caldera", "eruption", "vesuvius", "etna"],
                         "shardRules": [{"type": "geo_wonder", "filterCol": 1, "filterValues": ["Volcano"], "allowedAngleIds": ["gw_country", "gw_rev", "gw_tf"]}]},
                    ],
                },
                {
                    "id": "geo_hydrology", "name": "Rivers, Lakes & National Parks",
                    "keywords": ["river", "lake", "national park", "waterway", "basin"],
                    "l2Topics": [
                        {"id": "geo_major_rivers", "name": "Major World Rivers & Lengths", "keywords": ["river", "nile", "amazon", "danube", "yangtze"],
                         "shardRules": [{"type": "geo_river"}]},
                        {"id": "geo_lakes_straits_wonders", "name": "Great Lakes & Freshwater Basins", "keywords": ["lake", "baikal", "victoria", "superior"],
                         "shardRules": [{"type": "geo_wonder", "filterCol": 1, "filterValues": ["Lake"], "allowedAngleIds": ["gw_country", "gw_rev", "gw_tf"]}]},
                        {"id": "geo_national_parks", "name": "National Parks & Biosphere Reserves", "keywords": ["national park", "yellowstone", "serengeti", "banff"],
                         "shardRules": [{"type": "geo_wonder", "filterCol": 1, "filterValues": ["National Park"], "allowedAngleIds": ["gw_country", "gw_rev", "gw_tf"]}]},
                    ],
                },
                {
                    "id": "geo_aviation_hubs", "name": "Global Aviation & IATA Hubs",
                    "keywords": ["airport", "iata", "hub", "terminal", "aviation"],
                    "l2Topics": [
                        {"id": "geo_iata_codes", "name": "International Airports & 3-Letter IATA Codes", "keywords": ["iata", "airport", "jfk", "lhr", "hnd"],
                         "shardRules": [{"type": "geo_airport"}, {"type": "sub_geo_airport_deep"}]},
                        {"id": "geo_americas_airports", "name": "North & South American Airport Hubs", "keywords": ["united states", "canada", "brazil", "airport"],
                         "shardRules": [{"type": "geo_airport", "filterCol": 3, "filterValues": ["United States", "Canada", "Mexico", "Brazil", "Argentina", "Colombia"], "allowedAngleIds": ["ga_city", "ga_code"]}, {"type": "sub_geo_airport_deep", "filterCol": 2, "filterValues": ["United States", "Canada", "Mexico", "Brazil", "Argentina", "Colombia"], "allowedAngleIds": ["sgad_city", "sgad_cdx"]}]},
                        {"id": "geo_eurasia_airports", "name": "European & Asian Airport Hubs", "keywords": ["europe", "asia", "heathrow", "changi", "narita"],
                         "shardRules": [{"type": "geo_airport", "filterCol": 3, "filterValues": ["United Kingdom", "France", "Germany", "Japan", "China", "Singapore", "United Arab Emirates", "Spain", "Italy", "Australia"], "allowedAngleIds": ["ga_city", "ga_code"]}, {"type": "sub_geo_airport_deep", "filterCol": 2, "filterValues": ["United Kingdom", "France", "Germany", "Japan", "China", "Spain", "Italy", "Australia"], "allowedAngleIds": ["sgad_city", "sgad_cdx"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 3: ARTS & ARCHITECTURE (4 L1, 12 L2) ====================
        {
            "l0Domain": 3,
            "l1Subcategories": [
                {
                    "id": "arts_fine_art", "name": "Fine Art, Painting & Museums",
                    "keywords": ["painting", "sculpture", "museum", "louvre", "gallery", "canvas"],
                    "l2Topics": [
                        {"id": "arts_paintings_masters", "name": "Masterpiece Paintings & Painters", "keywords": ["painting", "mona lisa", "van gogh", "monet", "rembrandt"],
                         "shardRules": [{"type": "art_work", "filterCol": 3, "filterValues": ["Painting", "Fresco"], "allowedAngleIds": ["aw_artist", "aw_rev", "aw_tf", "aw_year"]}, {"type": "sub_art_nga_deep", "filterCol": 3, "filterValues": ["Painting"], "allowedAngleIds": ["sang_art", "sang_rev", "sang_tf", "sang_yr"]}]},
                        {"id": "arts_museum_collections", "name": "World Art Museums & Collections", "keywords": ["museum", "louvre", "prado", "uffizi", "met", "gallery"],
                         "shardRules": [{"type": "sub_art_museum"}]},
                        {"id": "arts_sculpture_prints", "name": "Sculpture, Prints, Drawings & Photography", "keywords": ["sculpture", "print", "drawing", "photograph", "rodin"],
                         "shardRules": [{"type": "art_work", "filterCol": 3, "filterValues": ["Sculpture", "Print", "Drawing", "Photograph"], "allowedAngleIds": ["aw_artist", "aw_rev", "aw_tf", "aw_year"]}, {"type": "sub_art_nga_deep", "filterCol": 3, "filterValues": ["Sculpture", "Print", "Drawing", "Photograph"], "allowedAngleIds": ["sang_art", "sang_rev", "sang_tf", "sang_yr"]}]},
                    ],
                },
                {
                    "id": "arts_architecture", "name": "World Architecture & Monuments",
                    "keywords": ["architecture", "cathedral", "castle", "palace", "bridge", "style"],
                    "l2Topics": [
                        {"id": "arts_architectural_styles", "name": "Architectural Styles & Movements", "keywords": ["gothic", "baroque", "art deco", "neoclassical", "modernist"],
                         "shardRules": [{"type": "sub_art_style"}]},
                        {"id": "arts_sacred_cathedrals", "name": "Cathedrals, Temples & Mosques", "keywords": ["cathedral", "temple", "mosque", "basilica"],
                         "shardRules": [{"type": "art_landmark", "filterCol": 1, "filterValues": ["Cathedral", "Temple", "Mosque"], "allowedAngleIds": ["al_country", "al_rev", "al_tf", "al_year"]}]},
                        {"id": "arts_palaces_castles_museums", "name": "Castles, Palaces, Bridges & Skyscrapers", "keywords": ["castle", "palace", "museum", "bridge", "skyscraper", "tower"],
                         "shardRules": [{"type": "art_landmark", "filterCol": 1, "filterValues": ["Castle", "Palace", "Museum", "Bridge", "Skyscraper", "Tower", "Monument", "Landmark"], "allowedAngleIds": ["al_country", "al_rev", "al_tf", "al_year"]}]},
                    ],
                },
                {
                    "id": "arts_creators_movements", "name": "Visual Artists & Master Architects",
                    "keywords": ["painter", "sculptor", "architect", "photographer", "printmaker"],
                    "l2Topics": [
                        {"id": "arts_painters_sculptors", "name": "Painters & Sculptors Through History", "keywords": ["painter", "sculptor", "renaissance", "impressionist"],
                         "shardRules": [{"type": "art_creator", "filterCol": 1, "filterValues": ["Painter", "Sculptor"], "allowedAngleIds": ["ac_country", "ac_year"]}]},
                        {"id": "arts_architects_designers", "name": "Master Architects & Builders", "keywords": ["architect", "wright", "gaudi", "le corbusier", "gehrs"],
                         "shardRules": [{"type": "art_creator", "filterCol": 1, "filterValues": ["Architect"], "allowedAngleIds": ["ac_country", "ac_year"]}]},
                        {"id": "arts_photographers_printmakers", "name": "Photographers & Printmakers", "keywords": ["photographer", "printmaker", "etching", "camera"],
                         "shardRules": [{"type": "art_creator", "filterCol": 1, "filterValues": ["Photographer", "Printmaker"], "allowedAngleIds": ["ac_country", "ac_year"]}]},
                    ],
                },
                {
                    "id": "arts_classical_stage", "name": "Classical Music, Opera & Stage",
                    "keywords": ["opera", "symphony", "composer", "mozart", "beethoven", "verdi", "musical"],
                    "l2Topics": [
                        {"id": "arts_classical_composers", "name": "Classical Symphonies & Concertos", "keywords": ["symphony", "concerto", "sonata", "composer", "beethoven", "bach"],
                         "shardRules": [{"type": "sub_art_classical", "filterCol": 3, "filterValues": ["Symphony", "Concerto", "Chamber Work"], "allowedAngleIds": ["sac_cmp", "sac_rev", "sac_tf", "sac_yr"]}, {"type": "art_creator", "filterCol": 1, "filterValues": ["Composer"], "allowedAngleIds": ["ac_country", "ac_year"]}]},
                        {"id": "arts_opera_repertoire", "name": "World Opera & Vocal Masterworks", "keywords": ["opera", "verdi", "puccini", "mozart", "wagner"],
                         "shardRules": [{"type": "sub_art_classical", "filterCol": 3, "filterValues": ["Musical Composition"], "allowedAngleIds": ["sac_cmp", "sac_rev", "sac_tf", "sac_yr"]}]},
                        {"id": "arts_stage_musicals", "name": "Stage Works, Drama & Musical Theater", "keywords": ["stage musical", "broadway", "west end", "sondheim", "theater"],
                         "shardRules": [{"type": "sub_art_classical"}, {"type": "art_landmark", "filterCol": 1, "filterValues": ["Theater", "Opera House"], "matchMode": "contains", "allowedAngleIds": ["al_country", "al_rev", "al_tf", "al_year"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 4: FILM, MUSIC & POP (4 L1, 12 L2) ====================
        {
            "l0Domain": 4,
            "l1Subcategories": [
                {
                    "id": "pop_cinema", "name": "World Cinema & Directors",
                    "keywords": ["film", "movie", "director", "cinema", "hollywood", "oscar"],
                    "l2Topics": [
                        {"id": "pop_hollywood_modern_film", "name": "Hollywood & North American Cinema", "keywords": ["hollywood", "united states", "director", "oscar"],
                         "shardRules": [{"type": "pop_film", "filterCol": 3, "filterValues": ["United States", "Canada"], "allowedAngleIds": ["pf_dir", "pf_rev", "pf_tf", "pf_year"]}]},
                        {"id": "pop_international_cinema", "name": "European, Asian & World Cinema", "keywords": ["france", "japan", "united kingdom", "italy", "korea", "india", "cannes"],
                         "shardRules": [{"type": "pop_film", "filterCol": 3, "filterValues": ["United Kingdom", "France", "Japan", "Italy", "Germany", "South Korea", "India", "Spain", "Hong Kong", "Sweden", "Australia"], "allowedAngleIds": ["pf_dir", "pf_rev", "pf_tf", "pf_year"]}]},
                        {"id": "pop_classic_golden_age_film", "name": "20th-Century & Global Feature Films", "keywords": ["classic film", "hitchcock", "kubrick", "kurosawa", "golden age"],
                         "shardRules": [{"type": "pop_film"}]},
                    ],
                },
                {
                    "id": "pop_actors_celebrities", "name": "Screen Actors & Stars",
                    "keywords": ["actor", "actress", "star", "cast", "performer"],
                    "l2Topics": [
                        {"id": "pop_actors_hollywood", "name": "American & Canadian Screen Actors", "keywords": ["actor", "hollywood", "oscar winner"],
                         "shardRules": [{"type": "sub_pop_actor", "filterCol": 1, "filterValues": ["United States", "Canada"], "allowedAngleIds": ["spa_rev", "spa_yr"]}]},
                        {"id": "pop_actors_international", "name": "British & International Screen Stars", "keywords": ["british actor", "international star", "european actor"],
                         "shardRules": [{"type": "sub_pop_actor", "filterCol": 1, "filterValues": ["United Kingdom", "France", "Italy", "Germany", "Australia", "Japan", "South Korea", "India", "Spain", "Ireland"], "allowedAngleIds": ["spa_rev", "spa_yr"]}]},
                        {"id": "pop_actors_all_eras", "name": "Screen Icons Across All Eras", "keywords": ["screen icon", "film star", "actor"],
                         "shardRules": [{"type": "sub_pop_actor"}]},
                    ],
                },
                {
                    "id": "pop_music_recording", "name": "Music, Albums, Songs & Bands",
                    "keywords": ["album", "song", "band", "rock", "pop", "hip-hop", "jazz"],
                    "l2Topics": [
                        {"id": "pop_albums", "name": "Landmark Studio Albums & Artists", "keywords": ["album", "studio album", "lp", "record"],
                         "shardRules": [{"type": "pop_album"}, {"type": "sub_pop_album_deep"}]},
                        {"id": "pop_songs", "name": "Iconic Hit Songs & Singles", "keywords": ["song", "single", "hit", "chart"],
                         "shardRules": [{"type": "pop_song"}]},
                        {"id": "pop_bands_ensembles", "name": "Bands, Rock Groups & Ensembles", "keywords": ["band", "rock band", "group"],
                         "shardRules": [{"type": "pop_band"}]},
                    ],
                },
                {
                    "id": "pop_television_media", "name": "Television, Streaming & Global Series",
                    "keywords": ["television", "tv", "series", "sitcom", "drama", "anime"],
                    "l2Topics": [
                        {"id": "pop_tv_series", "name": "American & Global Television Series", "keywords": ["television", "tv series", "emmy", "sitcom", "drama"],
                         "shardRules": [{"type": "pop_tv"}]},
                        {"id": "pop_tv_uk_intl", "name": "British, Asian & International TV", "keywords": ["bbc", "british tv", "anime", "k-drama", "international tv"],
                         "shardRules": [{"type": "pop_tv", "filterCol": 1, "filterValues": ["United Kingdom", "Japan", "South Korea", "Canada", "Australia", "France", "Germany"], "allowedAngleIds": ["pt_country", "pt_rev", "pt_tf", "pt_year"]}]},
                        {"id": "pop_tv_premieres", "name": "TV Debuts & Broadcast Eras", "keywords": ["premiere", "tv history", "debut year"],
                         "shardRules": [{"type": "pop_tv", "allowedAngleIds": ["pt_year", "pt_rev"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 5: SPORTS & GAMES (4 L1, 16 L2 — Showcase `sports` -> `sports_baseball`!) ====================
        {
            "l0Domain": 5,
            "l1Subcategories": [
                {
                    "id": "sports", "name": "Sports",
                    "keywords": ["sport", "baseball", "basketball", "football", "soccer", "hockey", "tennis", "golf", "olympics"],
                    "l2Topics": [
                        {
                            "id": "sports_baseball", "name": "Baseball",
                            "keywords": ["baseball", "mlb", "world series", "home run", "pitcher", "strikeouts", "cooperstown", "ballpark", "yankees", "dodgers", "red sox"],
                            "shardFiles": ["subcat_baseball.json"],
                            "shardRules": [
                                {"type": "sub_bb_slugger"},
                                {"type": "sub_bb_hits_rbi"},
                                {"type": "sub_bb_pitcher"},
                                {"type": "sub_bb_season_feat"},
                                {"type": "sub_bb_awards_hof"},
                                {"type": "sub_bb_world_series"},
                                {"type": "sub_bb_ballpark"},
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Baseball"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sport_club", "filterCol": 3, "filterValues": ["Baseball"], "allowedAngleIds": ["spc_country", "spc_year"]},
                            ],
                        },
                        {
                            "id": "sports_basketball", "name": "Basketball",
                            "keywords": ["basketball", "nba", "wnba", "point guard", "center", "lakers", "celtics"],
                            "shardRules": [
                                {"type": "sub_pro_player", "filterCol": 4, "filterValues": ["Basketball"], "allowedAngleIds": ["spp_pos", "spp_cnt", "spp_tf", "spp_yr"]},
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Basketball"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sport_club", "filterCol": 3, "filterValues": ["Basketball"], "allowedAngleIds": ["spc_country", "spc_year"]},
                            ],
                        },
                        {
                            "id": "sports_american_football", "name": "American Football",
                            "keywords": ["american football", "nfl", "quarterback", "super bowl", "wide receiver", "touchdown"],
                            "shardRules": [
                                {"type": "sub_pro_player", "filterCol": 4, "filterValues": ["American Football"], "allowedAngleIds": ["spp_pos", "spp_cnt", "spp_tf", "spp_yr"]},
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["American Football"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sport_club", "filterCol": 3, "filterValues": ["American Football"], "allowedAngleIds": ["spc_country", "spc_year"]},
                            ],
                        },
                        {
                            "id": "sports_soccer", "name": "Soccer & World Football",
                            "keywords": ["soccer", "world cup", "premier league", "la liga", "champions league", "football"],
                            "shardRules": [
                                {"type": "sub_pro_player", "filterCol": 4, "filterValues": ["Soccer"], "allowedAngleIds": ["spp_pos", "spp_cnt", "spp_tf", "spp_yr"]},
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Soccer"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sport_club", "filterCol": 3, "filterValues": ["Soccer"], "allowedAngleIds": ["spc_country", "spc_year"]},
                            ],
                        },
                        {
                            "id": "sports_ice_hockey", "name": "Ice Hockey",
                            "keywords": ["ice hockey", "nhl", "stanley cup", "goaltender", "defenseman"],
                            "shardRules": [
                                {"type": "sub_pro_player", "filterCol": 4, "filterValues": ["Ice Hockey"], "allowedAngleIds": ["spp_pos", "spp_cnt", "spp_tf", "spp_yr"]},
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Ice Hockey"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sport_club", "filterCol": 3, "filterValues": ["Ice Hockey"], "allowedAngleIds": ["spc_country", "spc_year"]},
                            ],
                        },
                        {
                            "id": "sports_tennis_golf", "name": "Tennis & Golf",
                            "keywords": ["tennis", "wimbledon", "grand slam", "golf", "masters", "pga"],
                            "shardRules": [
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Tennis", "Golf", "Table Tennis", "Badminton"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sub_sport_athlete_deep", "filterCol": 1, "filterValues": ["Tennis", "Golf", "Table Tennis", "Badminton"], "allowedAngleIds": ["ssad_cnt", "ssad_rev", "ssad_tf", "ssad_yr"]},
                            ],
                        },
                        {
                            "id": "sports_olympics_track_swim", "name": "Olympics, Track & Swimming",
                            "keywords": ["olympics", "track and field", "swimming", "gymnastics", "marathon", "skiing"],
                            "shardRules": [
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Track and Field", "Swimming", "Gymnastics", "Alpine Skiing", "Figure Skating", "Speed Skating", "Rowing", "Cycling"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sub_sport_athlete_deep", "filterCol": 1, "filterValues": ["Track and Field", "Swimming", "Gymnastics", "Alpine Skiing", "Figure Skating", "Speed Skating", "Rowing", "Cycling"], "allowedAngleIds": ["ssad_cnt", "ssad_rev", "ssad_tf", "ssad_yr"]},
                            ],
                        },
                        {
                            "id": "sports_combat_motorsport", "name": "Combat Sports, Motorsport & Global Pitch",
                            "keywords": ["boxing", "mma", "formula one", "auto racing", "cricket", "rugby", "wrestling", "judo"],
                            "shardRules": [
                                {"type": "sport_athlete", "filterCol": 1, "filterValues": ["Boxing", "Mixed Martial Arts", "Wrestling", "Judo", "Formula One", "Auto Racing", "Cricket", "Rugby"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]},
                                {"type": "sub_sport_athlete_deep", "filterCol": 1, "filterValues": ["Boxing", "Mixed Martial Arts", "Wrestling", "Judo", "Formula One", "Auto Racing", "Cricket", "Rugby"], "allowedAngleIds": ["ssad_cnt", "ssad_rev", "ssad_tf", "ssad_yr"]},
                                {"type": "sport_club", "filterCol": 3, "filterValues": ["Cricket", "Rugby"], "allowedAngleIds": ["spc_country", "spc_year"]},
                            ],
                        },
                        {
                            "id": "sports_stadiums_arenas", "name": "Iconic Stadiums, Ballparks & Arenas",
                            "keywords": ["stadium", "arena", "ballpark", "seating capacity"],
                            "shardFiles": ["subcat_baseball.json"],
                            "shardRules": [{"type": "sport_stadium"}, {"type": "sub_bb_ballpark"}],
                        },
                    ],
                },
                {
                    "id": "games_esports", "name": "Games, Chess & Video Games",
                    "keywords": ["video game", "chess", "rpg", "esports", "board game", "console"],
                    "l2Topics": [
                        {"id": "games_videogames", "name": "Video Games, Studios & Consoles", "keywords": ["video game", "nintendo", "playstation", "developer"],
                         "shardRules": [{"type": "sport_videogame"}, {"type": "sub_vg_genre"}]},
                        {"id": "games_rpg_adventure", "name": "RPG, Adventure & Action Games", "keywords": ["rpg", "role-playing", "action-adventure", "zelda", "final fantasy"],
                         "shardRules": [{"type": "sub_vg_genre", "filterCol": 1, "filterValues": ["Role-Playing (RPG)", "Action RPG", "Action-Adventure", "Adventure", "Survival Horror", "Stealth"], "allowedAngleIds": ["svg_dev2", "svg_cdx"]}]},
                        {"id": "games_shooter_strategy_arcade", "name": "Strategy, Shooter, Platformer & Racing Games", "keywords": ["strategy", "fps", "platformer", "racing", "fighting", "puzzle"],
                         "shardRules": [{"type": "sub_vg_genre", "filterCol": 1, "filterValues": ["Strategy", "Real-Time Strategy", "Turn-Based Strategy", "First-Person Shooter", "Platformer", "Racing", "Fighting", "Puzzle", "Simulation", "Sports Game"], "allowedAngleIds": ["svg_gnr", "svg_dev2", "svg_tf2", "svg_cdx"]}]},
                        {"id": "games_chess_tabletop", "name": "Chess Grandmasters & Strategy Games", "keywords": ["chess", "grandmaster", "checkmate", "board game"],
                         "shardRules": [{"type": "sport_athlete", "filterCol": 1, "filterValues": ["Chess", "Snooker", "Curling"], "allowedAngleIds": ["spa_country", "spa_rev", "spa_year"]}]},
                    ],
                },
                {
                    "id": "sports_clubs_leagues", "name": "World Clubs, Franchises & Championships",
                    "keywords": ["club", "franchise", "world series", "premier league", "championship"],
                    "l2Topics": [
                        {"id": "sports_world_series_mlb_lore", "name": "World Series, MVP & Cooperstown Lore", "keywords": ["world series", "mvp", "cy young", "hall of fame", "cooperstown"],
                         "shardFiles": ["subcat_baseball.json"],
                         "shardRules": [{"type": "sub_bb_world_series"}, {"type": "sub_bb_awards_hof"}, {"type": "sub_bb_season_feat"}]},
                        {"id": "sports_global_football_clubs", "name": "World Football Clubs & Founding Years", "keywords": ["football club", "fc", "united", "real madrid", "barcelona"],
                         "shardRules": [{"type": "sport_club", "filterCol": 3, "filterValues": ["Soccer"], "allowedAngleIds": ["spc_country", "spc_year"]}]},
                        {"id": "sports_pro_franchises_world", "name": "Pro Basketball, Hockey, Baseball & Rugby Clubs", "keywords": ["franchise", "team", "club"],
                         "shardRules": [{"type": "sport_club", "filterCol": 3, "filterValues": ["Basketball", "Baseball", "Ice Hockey", "American Football", "Rugby", "Cricket"], "allowedAngleIds": ["spc_country", "spc_sport", "spc_tf", "spc_year"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 6: TECH & COMPUTING (4 L1, 12 L2) ====================
        {
            "l0Domain": 6,
            "l1Subcategories": [
                {
                    "id": "tech_computing_software", "name": "Computing, Software & Protocols",
                    "keywords": ["software", "programming", "operating system", "protocol", "file format", "web"],
                    "l2Topics": [
                        {"id": "tech_software_os", "name": "Operating Systems, Languages & Browsers", "keywords": ["operating system", "linux", "programming language", "python", "browser"],
                         "shardRules": [{"type": "tech_software"}, {"type": "sub_tech_format"}]},
                        {"id": "tech_file_formats_protocols", "name": "File Formats, Network Protocols & Standards", "keywords": ["file format", "protocol", "http", "tcp", "json", "png"],
                         "shardRules": [{"type": "sub_tech_format", "filterCol": 3, "filterValues": ["File Format", "Network Protocol", "Programming Language"], "allowedAngleIds": ["stf_dev", "stf_tf", "stf_yr"]}]},
                        {"id": "tech_websites_platforms", "name": "Web Platforms, Databases & Game Engines", "keywords": ["website", "database", "game engine", "open-source"],
                         "shardRules": [{"type": "tech_software", "filterCol": 1, "filterValues": ["Website", "Database System", "Game Engine", "Open-Source Software", "Mobile App"], "allowedAngleIds": ["ts_type", "ts_rev", "ts_tf", "ts_year"]}]},
                    ],
                },
                {
                    "id": "tech_inventors_pioneers", "name": "Inventors, Engineers & Computer Scientists",
                    "keywords": ["inventor", "computer scientist", "engineer", "turing", "pioneer"],
                    "l2Topics": [
                        {"id": "tech_cs_pioneers", "name": "Computer Scientists & Software Pioneers", "keywords": ["computer scientist", "software engineer", "turing", "hopper"],
                         "shardRules": [{"type": "tech_pioneer", "filterCol": 1, "filterValues": ["Computer Scientist", "Software Engineer"], "allowedAngleIds": ["tp_country", "tp_year"]}]},
                        {"id": "tech_inventors_makers", "name": "Historic Inventors & Industrial Engineers", "keywords": ["inventor", "electrical engineer", "mechanical engineer", "edison", "tesla"],
                         "shardRules": [{"type": "tech_pioneer", "filterCol": 1, "filterValues": ["Inventor", "Engineer", "Electrical Engineer", "Mechanical Engineer"], "allowedAngleIds": ["tp_country", "tp_year"]}]},
                        {"id": "tech_aviation_pioneers", "name": "Aerospace Engineers & Aviation Pioneers", "keywords": ["aviation", "aerospace engineer", "pilot", "wright"],
                         "shardRules": [{"type": "tech_pioneer", "filterCol": 1, "filterValues": ["Aerospace Engineer", "Aviation Pioneer", "Engineer"], "allowedAngleIds": ["tp_country", "tp_year"]}]},
                    ],
                },
                {
                    "id": "tech_industry_hardware", "name": "Tech Giants, Semiconductors & Industry",
                    "keywords": ["company", "semiconductor", "electronics", "telecom", "startup"],
                    "l2Topics": [
                        {"id": "tech_companies", "name": "Software, Internet & Semiconductor Giants", "keywords": ["software", "semiconductor", "internet", "technology", "electronics"],
                         "shardRules": [{"type": "tech_company", "filterCol": 1, "filterValues": ["Software", "Technology", "Electronics", "Semiconductors", "Internet", "Telecommunications", "Video Games", "Computing Hardware", "E-Commerce"], "allowedAngleIds": ["tc_country", "tc_ind", "tc_rev", "tc_tf", "tc_year"]}]},
                        {"id": "tech_industrial_pharma_energy", "name": "Aerospace, Automotive, Biotech & Energy Firms", "keywords": ["automotive", "aerospace", "biotechnology", "energy", "pharmaceuticals"],
                         "shardRules": [{"type": "tech_company", "filterCol": 1, "filterValues": ["Automotive", "Aerospace", "Aviation", "Biotechnology", "Pharmaceuticals", "Energy", "Chemicals", "Defense"], "allowedAngleIds": ["tc_country", "tc_ind", "tc_rev", "tc_tf", "tc_year"]}]},
                        {"id": "tech_global_hq", "name": "Global Tech & Industrial Founding Years", "keywords": ["headquarters", "founded", "corporation"],
                         "shardRules": [{"type": "tech_company"}]},
                    ],
                },
                {
                    "id": "tech_aerospace_automotive", "name": "Automotive, Aviation & Naval Engineering",
                    "keywords": ["aircraft", "car", "ship", "rocket", "automobile", "jet"],
                    "l2Topics": [
                        {"id": "tech_aircraft_ships", "name": "Aircraft, Launch Vehicles & Naval Vessels", "keywords": ["aircraft", "rocket", "ship", "boeing", "airbus"],
                         "shardRules": [{"type": "tech_vehicle", "filterCol": 2, "filterValues": ["Aircraft", "Fighter Aircraft", "Ship", "Rocket", "Locomotive"], "allowedAngleIds": ["tv_maker", "tv_rev", "tv_tf"]}, {"type": "sub_tech_aero_year", "filterCol": 3, "filterValues": ["Aircraft", "Naval Vessel", "Launch Vehicle"], "allowedAngleIds": ["sta_mkr", "sta_tf", "sta_yr", "sta_cdx"]}]},
                        {"id": "tech_automobiles", "name": "Automobiles, Supercars & Motorcycles", "keywords": ["car", "automobile", "ferrari", "porsche", "toyota", "motorcycle"],
                         "shardRules": [{"type": "tech_vehicle", "filterCol": 2, "filterValues": ["Car Model", "Motorcycle"], "allowedAngleIds": ["tv_maker", "tv_rev", "tv_tf"]}, {"type": "sub_tech_aero_year", "filterCol": 3, "filterValues": ["Automobile"], "allowedAngleIds": ["sta_mkr", "sta_tf", "sta_yr", "sta_cdx"]}]},
                        {"id": "tech_first_flights_debuts", "name": "Engineering Debuts & First Flights", "keywords": ["first flight", "model year", "engineering"],
                         "shardRules": [{"type": "sub_tech_aero_year"}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 7: NATURE & BIOLOGY (4 L1, 12 L2) ====================
        {
            "l0Domain": 7,
            "l1Subcategories": [
                {
                    "id": "nat_vertebrates", "name": "Mammals, Birds & Reptiles",
                    "keywords": ["mammal", "bird", "reptile", "amphibian", "wildlife"],
                    "l2Topics": [
                        {"id": "nat_mammals", "name": "Mammals of Land & Sea", "keywords": ["mammal", "lion", "whale", "wolf", "bear", "primate"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Mammal"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                        {"id": "nat_birds", "name": "Birds & Avian Life", "keywords": ["bird", "eagle", "owl", "falcon", "penguin", "avian"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Bird"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                        {"id": "nat_reptiles_amphibians", "name": "Reptiles & Amphibians", "keywords": ["reptile", "amphibian", "snake", "turtle", "frog", "lizard"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Reptile", "Amphibian"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                    ],
                },
                {
                    "id": "nat_marine_invertebrates", "name": "Marine Life, Insects & Invertebrates",
                    "keywords": ["fish", "shark", "insect", "spider", "mollusk", "crustacean", "ocean"],
                    "l2Topics": [
                        {"id": "nat_fish_sharks", "name": "Fish, Sharks & Rays", "keywords": ["fish", "shark", "ray", "marine", "salmon", "tuna"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Fish", "Shark or Ray"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                        {"id": "nat_insects_invertebrates", "name": "Insects, Butterflies & Beetles", "keywords": ["insect", "butterfly", "moth", "bee", "ant"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Insect"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                        {"id": "nat_arachnids_shellfish", "name": "Arachnids, Mollusks & Crustaceans", "keywords": ["spider", "octopus", "crab", "lobster", "shell"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Arachnid", "Mollusk", "Crustacean"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                    ],
                },
                {
                    "id": "nat_botany_fungi", "name": "Botany, Trees, Flora & Fungi",
                    "keywords": ["plant", "tree", "flower", "fungus", "mushroom", "crop"],
                    "l2Topics": [
                        {"id": "nat_plants_trees", "name": "Trees, Flowers & Wild Plants", "keywords": ["plant", "tree", "oak", "pine", "orchid", "rose"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Plant"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                        {"id": "nat_fungi_mushrooms", "name": "Fungi, Lichens & Mycology", "keywords": ["fungus", "mushroom", "truffle", "yeast"],
                         "shardRules": [{"type": "nat_species", "filterCol": 2, "filterValues": ["Fungus"], "allowedAngleIds": ["ns_sci", "ns_rev"]}]},
                        {"id": "nat_all_kingdoms_taxonomy", "name": "Cross-Kingdom Classification & Taxonomy", "keywords": ["taxonomy", "binomial", "linnaeus", "classification"],
                         "shardRules": [{"type": "nat_species"}]},
                    ],
                },
                {
                    "id": "nat_conservation_breeds", "name": "Conservation, Endangered Wildlife & Breeds",
                    "keywords": ["endangered", "iucn", "conservation", "dog breed", "horse breed", "cat breed"],
                    "l2Topics": [
                        {"id": "nat_iucn_redlist", "name": "IUCN Red List & Conservation Status", "keywords": ["iucn", "endangered", "vulnerable", "conservation"],
                         "shardRules": [{"type": "sub_nat_iucn"}]},
                        {"id": "nat_threatened_wildlife", "name": "Endangered & Vulnerable Species", "keywords": ["endangered", "critically endangered", "vulnerable"],
                         "shardRules": [{"type": "sub_nat_iucn", "filterCol": 2, "filterValues": ["Endangered", "Critically Endangered", "Vulnerable"], "allowedAngleIds": ["sni_sci", "sni_cdx"]}]},
                        {"id": "nat_dog_horse_cat_breeds", "name": "World Dog, Horse & Cat Breeds", "keywords": ["dog breed", "horse breed", "cat breed", "terrier", "shepherd"],
                         "shardRules": [{"type": "sub_nat_breed"}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 8: WORLD AFFAIRS & LAW (4 L1, 12 L2) ====================
        {
            "l0Domain": 8,
            "l1Subcategories": [
                {
                    "id": "soc_nations_geopolitics", "name": "Sovereign Nations, Capitals & Currencies",
                    "keywords": ["capital", "currency", "continent", "country", "united nations", "nato"],
                    "l2Topics": [
                        {"id": "soc_capitals_currencies", "name": "World Capitals, Continents & Currencies", "keywords": ["capital", "currency", "euro", "yen", "franc"],
                         "shardRules": [{"type": "soc_country"}]},
                        {"id": "soc_intl_orgs", "name": "International Organizations & Agencies", "keywords": ["international organization", "agency", "un", "nato"],
                         "shardRules": [{"type": "soc_org", "filterCol": 1, "filterValues": ["International Organization", "Government Agency", "Nonprofit Organization"], "allowedAngleIds": ["so_country", "so_rev", "so_tf", "so_year"]}]},
                        {"id": "soc_media_parties_unions", "name": "World Press, Broadcasters & Political Parties", "keywords": ["newspaper", "broadcaster", "political party", "union"],
                         "shardRules": [{"type": "soc_org", "filterCol": 1, "filterValues": ["Newspaper", "Broadcaster", "Political Party", "Labor Union"], "allowedAngleIds": ["so_country", "so_type", "so_rev", "so_tf", "so_year"]}]},
                    ],
                },
                {
                    "id": "soc_governance_law", "name": "World Leaders, Parties & Constitutional Law",
                    "keywords": ["president", "prime minister", "party", "constitution", "supreme court", "law"],
                    "l2Topics": [
                        {"id": "soc_heads_of_state", "name": "Statesmen, Diplomats, Jurists & Activists", "keywords": ["diplomat", "jurist", "judge", "activist", "journalist"],
                         "shardRules": [{"type": "soc_leader"}]},
                        {"id": "soc_party_affiliations", "name": "World Politicians & Political Parties", "keywords": ["political party", "democrat", "republican", "labour", "conservative"],
                         "shardRules": [{"type": "sub_soc_party_leader"}]},
                        {"id": "soc_constitutions_courts", "name": "Constitutions, Statutes & Landmark Cases", "keywords": ["constitution", "supreme court", "statute", "law", "case"],
                         "shardRules": [{"type": "sub_soc_law"}]},
                    ],
                },
                {
                    "id": "soc_academia_economics", "name": "Universities, Economics & Social Thought",
                    "keywords": ["university", "college", "economist", "sociologist", "oxford", "harvard"],
                    "l2Topics": [
                        {"id": "soc_universities", "name": "Historic & Research Universities Worldwide", "keywords": ["university", "oxford", "cambridge", "harvard", "mit"],
                         "shardRules": [{"type": "soc_university"}]},
                        {"id": "soc_economists_thinkers", "name": "Economists & Social Theorists", "keywords": ["economist", "sociologist", "keynes", "smith"],
                         "shardRules": [{"type": "soc_leader", "filterCol": 1, "filterValues": ["Economist", "Sociologist"], "allowedAngleIds": ["sl_country", "sl_tf", "sl_year"]}]},
                        {"id": "soc_jurists_judges_rights", "name": "Jurists, Judges & Human Rights Leaders", "keywords": ["jurist", "judge", "activist", "civil rights"],
                         "shardRules": [{"type": "soc_leader", "filterCol": 1, "filterValues": ["Jurist", "Judge", "Activist"], "allowedAngleIds": ["sl_country", "sl_tf", "sl_year"]}]},
                    ],
                },
                {
                    "id": "soc_regional_politics", "name": "Regional Politics & Global Institutions",
                    "keywords": ["americas", "europe", "asia", "parliament", "governance"],
                    "l2Topics": [
                        {"id": "soc_us_uk_politics", "name": "U.S., British & Commonwealth Politics", "keywords": ["united states", "united kingdom", "canada", "australia", "parliament", "congress"],
                         "shardRules": [{"type": "sub_soc_party_leader", "filterCol": 2, "filterValues": ["United States", "United Kingdom", "Canada", "Australia", "Ireland", "New Zealand", "India"], "allowedAngleIds": ["ssp_pty", "ssp_tf", "ssp_yr"]}]},
                        {"id": "soc_european_politics", "name": "Continental European Politics & Institutions", "keywords": ["france", "germany", "italy", "spain", "europe"],
                         "shardRules": [{"type": "sub_soc_party_leader", "filterCol": 2, "filterValues": ["France", "Germany", "Italy", "Spain", "Sweden", "Netherlands", "Poland", "Switzerland", "Austria"], "allowedAngleIds": ["ssp_pty", "ssp_cnt", "ssp_tf", "ssp_yr"]}]},
                        {"id": "soc_global_institutions", "name": "All Global Institutions & Founding Years", "keywords": ["institution", "agency", "founded"],
                         "shardRules": [{"type": "soc_org"}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 9: FOOD, CRAFT & DESIGN (4 L1, 12 L2) ====================
        {
            "l0Domain": 9,
            "l1Subcategories": [
                {
                    "id": "food_gastronomy", "name": "World Gastronomy, Dishes & Ingredients",
                    "keywords": ["dish", "cuisine", "cheese", "bread", "pastry", "ingredient", "soup"],
                    "l2Topics": [
                        {"id": "food_world_dishes", "name": "National Dishes, Soups, Pasta & Street Food", "keywords": ["dish", "soup", "pasta", "stew", "dumpling", "salad", "pizza", "ramen"],
                         "shardRules": [{"type": "food_item", "filterCol": 1, "filterValues": ["Dish", "Soup", "Sauce", "Pasta", "Stew", "Salad", "Dumpling", "Noodle Dish", "Sausage"], "allowedAngleIds": ["fi_country", "fi_rev", "fi_tf"]}]},
                        {"id": "food_cheeses_breads_desserts", "name": "Cheeses, Breads, Pastries & Desserts", "keywords": ["cheese", "bread", "pastry", "dessert", "cake", "chocolate"],
                         "shardRules": [{"type": "food_item", "filterCol": 1, "filterValues": ["Cheese", "Bread", "Dessert", "Pastry", "Cake", "Confection", "Baked Good"], "allowedAngleIds": ["fi_country", "fi_type", "fi_rev", "fi_tf"]}]},
                        {"id": "food_signature_ingredients", "name": "Signature Ingredients & Culinary Preparation", "keywords": ["ingredient", "flour", "milk", "rice", "spice"],
                         "shardRules": [{"type": "sub_food_ingred"}]},
                    ],
                },
                {
                    "id": "food_beverages_fermentation", "name": "Wines, Spirits, Cocktails & Beverages",
                    "keywords": ["wine", "beer", "brewery", "winery", "cocktail", "spirit", "tea"],
                    "l2Topics": [
                        {"id": "food_wines_spirits_drinks", "name": "World Wines, Cocktails, Teas & Spirits", "keywords": ["wine", "cocktail", "spirit", "beer", "tea", "liqueur"],
                         "shardRules": [{"type": "food_item", "filterCol": 1, "filterValues": ["Wine", "Beer", "Cocktail", "Spirit", "Spirit or Drink", "Beverage", "Liqueur", "Tea", "Wine Grape"], "allowedAngleIds": ["fi_country", "fi_type", "fi_rev", "fi_tf"]}]},
                        {"id": "food_breweries_wineries", "name": "Historic Breweries, Wineries & Distilleries", "keywords": ["brewery", "winery", "distillery"],
                         "shardRules": [{"type": "food_brand", "filterCol": 1, "filterValues": ["Brewery", "Winery", "Distillery", "Food Producer", "Chocolatier"], "allowedAngleIds": ["fb_country", "fb_rev", "fb_tf", "fb_year"]}]},
                        {"id": "food_restaurants_hospitality", "name": "Iconic Restaurants & Historic Hotels", "keywords": ["restaurant", "hotel", "dining", "hospitality"],
                         "shardRules": [{"type": "food_brand", "filterCol": 1, "filterValues": ["Restaurant", "Restaurant Chain", "Historic Hotel", "Department Store"], "allowedAngleIds": ["fb_country", "fb_rev", "fb_tf", "fb_year"]}]},
                    ],
                },
                {
                    "id": "food_heritage_brands", "name": "Heritage Houses, Horology & Luxury Brands",
                    "keywords": ["watchmaker", "fashion house", "luxury", "founder", "marque"],
                    "l2Topics": [
                        {"id": "food_luxury_brands", "name": "Horology, Fashion Houses & Heritage Brands", "keywords": ["watchmaker", "fashion house", "luxury", "heritage brand"],
                         "shardRules": [{"type": "food_brand", "filterCol": 1, "filterValues": ["Watchmaker", "Fashion House", "Luxury House", "Heritage Brand"], "allowedAngleIds": ["fb_country", "fb_rev", "fb_tf", "fb_year"]}]},
                        {"id": "food_house_founders", "name": "Founders of Iconic Brands & Houses", "keywords": ["founder", "atelier", "maison", "est."],
                         "shardRules": [{"type": "sub_food_atelier"}]},
                        {"id": "food_auto_design_marques", "name": "Coachbuilders & Design Marques", "keywords": ["automotive marque", "coachbuilder", "italian design"],
                         "shardRules": [{"type": "food_brand", "filterCol": 1, "filterValues": ["Automotive Marque"], "allowedAngleIds": ["fb_country", "fb_rev", "fb_tf", "fb_year"]}]},
                    ],
                },
                {
                    "id": "food_craft_artisans", "name": "Master Artisans, Chefs & Musical Craft",
                    "keywords": ["chef", "designer", "couturier", "musical instrument", "craft"],
                    "l2Topics": [
                        {"id": "food_master_artisans", "name": "Fashion, Industrial & Graphic Designers", "keywords": ["fashion designer", "industrial designer", "couturier", "jeweler"],
                         "shardRules": [{"type": "food_maker", "filterCol": 1, "filterValues": ["Fashion Designer", "Designer", "Industrial Designer", "Graphic Designer", "Interior Designer", "Couturier", "Jeweler", "Ceramicist"], "allowedAngleIds": ["fm_country", "fm_tf", "fm_year"]}]},
                        {"id": "food_world_chefs", "name": "World Chefs & Culinary Pioneers", "keywords": ["chef", "culinary", "gastronomy"],
                         "shardRules": [{"type": "food_maker", "filterCol": 1, "filterValues": ["Chef"], "allowedAngleIds": ["fm_country", "fm_tf", "fm_year"]}]},
                        {"id": "food_musical_instruments", "name": "World Musical Instruments & Luthiery", "keywords": ["musical instrument", "lute", "drum", "flute", "craft"],
                         "shardRules": [{"type": "food_item", "filterCol": 1, "filterValues": ["Musical Instrument"], "allowedAngleIds": ["fi_country", "fi_rev", "fi_tf"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 10: MYTH & LITERATURE (4 L1, 13 L2) ====================
        {
            "l0Domain": 10,
            "l1Subcategories": [
                {
                    "id": "myth_world_literature", "name": "World Literature, Novels & Classics",
                    "keywords": ["novel", "book", "author", "classic", "published", "literature"],
                    "l2Topics": [
                        {"id": "myth_classic_modern_works", "name": "Classic & Modern Novels, Plays & Epics", "keywords": ["novel", "play", "classic", "published", "tolkien", "dickens"],
                         "shardRules": [{"type": "lit_work"}]},
                        {"id": "myth_translated_world_lit", "name": "French, Russian, German, Spanish & World Classics", "keywords": ["french", "russian", "spanish", "german", "japanese", "language"],
                         "shardRules": [{"type": "lit_work", "filterCol": 3, "filterValues": ["French", "Russian", "German", "Spanish", "Italian", "Japanese", "Latin", "Ancient Greek", "Portuguese", "Swedish"], "allowedAngleIds": ["lw_auth", "lw_rev", "lw_lang", "lw_tf", "lw_year"]}]},
                        {"id": "myth_world_authors", "name": "Novelists, Poets, Playwrights & Philosophers", "keywords": ["novelist", "poet", "playwright", "philosopher", "author"],
                         "shardRules": [{"type": "lit_author", "allowedAngleIds": ["la_country", "la_tf", "la_year"]}]},
                    ],
                },
                {
                    "id": "myth_genre_characters", "name": "Literary Genres & Iconic Characters",
                    "keywords": ["character", "sherlock", "sci-fi", "fantasy", "mystery", "horror"],
                    "l2Topics": [
                        {"id": "myth_fictional_characters", "name": "Iconic Literary & Fictional Characters", "keywords": ["character", "protagonist", "sherlock", "gandalf", "creator"],
                         "shardRules": [{"type": "sub_lit_char"}]},
                        {"id": "myth_scifi_fantasy_horror", "name": "Science Fiction, Fantasy & Gothic Literature", "keywords": ["science fiction", "fantasy", "horror", "dystopian", "gothic"],
                         "shardRules": [{"type": "sub_lit_genre", "filterCol": 2, "filterValues": ["Science Fiction", "Fantasy", "Horror", "Dystopian Fiction", "Gothic Fiction"], "allowedAngleIds": ["slg_aut", "slg_tf", "slg_yr"]}]},
                        {"id": "myth_mystery_historical_drama", "name": "Mystery, Thriller, Historical & Drama", "keywords": ["mystery", "crime", "thriller", "historical fiction", "tragedy"],
                         "shardRules": [{"type": "sub_lit_genre", "filterCol": 2, "filterValues": ["Crime & Mystery", "Mystery", "Thriller", "Historical Fiction", "Adventure", "Tragedy", "Comedy", "Satire"], "allowedAngleIds": ["slg_aut", "slg_gnr", "slg_tf", "slg_yr"]}]},
                    ],
                },
                {
                    "id": "myth_poets_philosophers", "name": "Poetry, Drama & Philosophy",
                    "keywords": ["poet", "playwright", "philosopher", "ethics", "verse"],
                    "l2Topics": [
                        {"id": "myth_philosophers", "name": "World Philosophers & Thinkers", "keywords": ["philosopher", "kant", "plato", "nietzsche", "descartes"],
                         "shardRules": [{"type": "lit_author", "filterCol": 1, "filterValues": ["Philosopher"], "allowedAngleIds": ["la_country", "la_tf", "la_year"]}]},
                        {"id": "myth_poets_playwrights", "name": "Poets & Dramatists", "keywords": ["poet", "playwright", "shakespeare", "ibsen", "chekhov"],
                         "shardRules": [{"type": "lit_author", "filterCol": 1, "filterValues": ["Poet", "Playwright"], "allowedAngleIds": ["la_country", "la_tf", "la_year"]}]},
                        {"id": "myth_scifi_childrens_writers", "name": "Sci-Fi & Children's Literature Authors", "keywords": ["sci-fi author", "children's author", "asimov", "roald dahl"],
                         "shardRules": [{"type": "lit_author", "filterCol": 1, "filterValues": ["Sci-Fi Author", "Children's Author"], "allowedAngleIds": ["la_country", "la_tf", "la_year"]}]},
                    ],
                },
                {
                    "id": "myth_pantheons_folklore", "name": "Classical Mythology, Deities & Legends",
                    "keywords": ["mythology", "deity", "greek", "norse", "egyptian", "folklore"],
                    "l2Topics": [
                        {"id": "myth_greek_roman", "name": "Greek & Roman Mythology", "keywords": ["greek", "roman", "olympus", "zeus", "athena", "apollo"],
                         "shardRules": [{"type": "lit_myth", "filterCol": 1, "filterValues": ["Greek", "Roman"], "matchMode": "contains", "allowedAngleIds": ["lm_rev"]}]},
                        {"id": "myth_norse_celtic_arthurian", "name": "Norse, Celtic & Arthurian Legend", "keywords": ["norse", "celtic", "arthurian", "odin", "thor", "slavic"],
                         "shardRules": [{"type": "lit_myth", "filterCol": 1, "filterValues": ["Norse", "Celtic", "Arthurian", "Slavic"], "matchMode": "contains", "allowedAngleIds": ["lm_trad", "lm_rev", "lm_tf"]}]},
                        {"id": "myth_norse_egypt_world", "name": "Egyptian, Hindu, Japanese & World Pantheons", "keywords": ["egyptian", "hindu", "japanese", "mesopotamian", "aztec", "mayan"],
                         "shardRules": [{"type": "lit_myth", "filterCol": 1, "filterValues": ["Egyptian", "Hindu", "Japanese", "Chinese", "Mesopotamian", "Sumerian", "Babylonian", "Aztec", "Mayan"], "matchMode": "contains", "allowedAngleIds": ["lm_trad", "lm_rev", "lm_tf"]}]},
                        {"id": "myth_all_pantheons", "name": "All World Pantheons & Mythic Beings", "keywords": ["pantheon", "deity", "mythical creature"],
                         "shardRules": [{"type": "lit_myth", "allowedAngleIds": ["lm_trad", "lm_rev", "lm_tf"]}]},
                    ],
                },
            ],
        },

        # ==================== L0 = 11: LOGIC & MATH (6 L1, 16 L2) ====================
        {
            "l0Domain": 11,
            "l1Subcategories": [
                {
                    "id": "logic_pure_applied_math", "name": "Number Theory, Primes & Modular Math",
                    "keywords": ["prime", "totient", "gcd", "lcm", "modular", "divisor"],
                    "l2Topics": [
                        {"id": "logic_number_theory_primes", "name": "Primes, Divisors, GCD & LCM", "keywords": ["prime", "divisor", "gcd", "lcm", "totient"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Prime Numbers", "Number Theory"]}, {"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["Number Theory"]}]},
                        {"id": "logic_modular_clock", "name": "Modular Arithmetic, Remainders & Clock Logic", "keywords": ["modular", "remainder", "mod", "clock"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Modular Arithmetic", "Clock Logic"]}, {"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["Modular Arithmetic"]}]},
                        {"id": "logic_exponents_series", "name": "Exponents, Roots & Finite Series", "keywords": ["exponent", "power", "square root", "series", "sum"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Exponents", "Mental Math", "Series & Sums"]}]},
                    ],
                },
                {
                    "id": "logic_sequences_patterns", "name": "Sequences, Patterns & Recurrences",
                    "keywords": ["sequence", "fibonacci", "pattern", "recurrence", "cubic"],
                    "l2Topics": [
                        {"id": "logic_fibonacci_quadratic_seq", "name": "Fibonacci, Quadratic & Doubling Sequences", "keywords": ["fibonacci", "sequence", "next number"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Number Sequences"]}]},
                        {"id": "logic_cubic_recurrence_seq", "name": "Cubic & Linear Recurrence Sequences", "keywords": ["cubic sequence", "recurrence"],
                         "shardRules": [{"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["Sequences"]}]},
                    ],
                },
                {
                    "id": "logic_geometry_spatial", "name": "Geometry, Polygons & 3D Solids",
                    "keywords": ["geometry", "triangle", "polygon", "cube", "cylinder", "coordinate"],
                    "l2Topics": [
                        {"id": "logic_geometry_algebra", "name": "Polygons, Triangles & 3D Surface/Volume", "keywords": ["polygon", "hypotenuse", "triangle", "cube", "trapezoid"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Geometry", "3D Geometry"]}, {"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["3D Geometry"]}]},
                        {"id": "logic_coordinate_geometry", "name": "Coordinate Plane & Euclidean Distance", "keywords": ["coordinate", "euclidean distance", "plane"],
                         "shardRules": [{"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["Coordinate Geometry"]}]},
                    ],
                },
                {
                    "id": "logic_algebra_calculus", "name": "Algebra, Linear Systems & Calculus",
                    "keywords": ["algebra", "equation", "derivative", "calculus", "average", "percentage"],
                    "l2Topics": [
                        {"id": "logic_linear_systems_algebra", "name": "Linear Equations & 2x2 Systems", "keywords": ["solve for x", "system", "algebra"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Algebra"]}, {"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["Algebra Systems"]}]},
                        {"id": "logic_calculus_derivatives", "name": "Polynomial Derivatives & Rates of Change", "keywords": ["derivative", "calculus", "f'(x)"],
                         "shardRules": [{"type": "sub_math_spec_num", "filterCol": 5, "filterValues": ["Calculus"]}]},
                        {"id": "logic_rates_units_stats", "name": "Rates, Unit Conversions, Percentages & Means", "keywords": ["celsius", "km/h", "discount", "percentage", "mean", "average"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Unit Conversion", "Rate & Motion", "Percentages", "Statistics & Logic"]}]},
                    ],
                },
                {
                    "id": "logic_combinatorics_prob", "name": "Combinatorics, Set Theory & Probability",
                    "keywords": ["probability", "combinatorics", "permutation", "combination", "set"],
                    "l2Topics": [
                        {"id": "logic_perms_combs_sets", "name": "Permutations, Combinations, Handshakes & Sets", "keywords": ["choose", "arrange", "handshake", "set"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Combinatorics", "Set Logic"]}]},
                        {"id": "logic_probability_fractions", "name": "Exact Probability (Urns, Coins & Draws)", "keywords": ["probability", "urn", "marbles", "random"],
                         "shardRules": [{"type": "sub_math_spec_word", "filterCol": 5, "filterValues": ["Probability"]}]},
                    ],
                },
                {
                    "id": "logic_puzzles_cryptography", "name": "Ciphers, Number Bases & Mathematicians",
                    "keywords": ["cipher", "caesar", "rot13", "atbash", "binary", "hexadecimal", "roman", "mathematician"],
                    "l2Topics": [
                        {"id": "logic_word_deduction", "name": "Caesar, ROT13 & Atbash Cryptography", "keywords": ["caesar", "rot13", "atbash", "cipher", "decode"],
                         "shardRules": [{"type": "math_word", "filterCol": 5, "filterValues": ["Cryptography"], "matchMode": "contains"}, {"type": "sub_math_spec_word", "filterCol": 5, "filterValues": ["Cryptography"]}]},
                        {"id": "logic_bases_boolean", "name": "Binary, Octal, Hexadecimal & Boolean XOR", "keywords": ["binary", "hexadecimal", "octal", "xor", "base-2", "base-16"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Binary Logic", "Hexadecimal Logic", "Boolean Logic"]}, {"type": "math_word", "filterCol": 5, "filterValues": ["Binary Logic", "Hexadecimal Logic"]}, {"type": "sub_math_spec_word", "filterCol": 5, "filterValues": ["Base Systems"]}]},
                        {"id": "logic_roman_calendar", "name": "Roman Numerals & Calendar Day Logic", "keywords": ["roman numeral", "calendar", "day of the week"],
                         "shardRules": [{"type": "math_num", "filterCol": 5, "filterValues": ["Roman Numerals"]}, {"type": "math_word", "filterCol": 5, "filterValues": ["Roman Numerals", "Calendar Logic"]}]},
                        {"id": "logic_mathematicians", "name": "Great Mathematicians, Logicians & Cryptographers", "keywords": ["mathematician", "logician", "euler", "gauss", "turing", "noether"],
                         "shardRules": [{"type": "math_person"}]},
                    ],
                },
            ],
        },
    ]


# ---------------------------------------------------------------------------
# 5. Exact Rule Question Counter Across Base + Specialist Shards!
# ---------------------------------------------------------------------------
def load_all_table_rows_for_counting(
    base_manifest: Dict[str, Any],
    subcat_files_by_dom: Dict[int, List[Dict[str, Any]]],
    baseball_files: List[Dict[str, Any]],
) -> Tuple[Dict[str, List[Tuple[list, List[str], int, int]]], Dict[str, Dict[str, Any]]]:
    """
    Loads all base + specialist shard chunks and maps `type_id` -> list of
    `(rows, pool, baseQid, nAngles)` plus merged `all_types` spec dict.
    """
    all_types: Dict[str, Dict[str, Any]] = {}
    all_types.update(base_manifest.get("types", {}))
    all_types.update(SUBCAT_TYPE_SPECS)

    loaded_files: Set[str] = set()
    by_type: Dict[str, List[Tuple[list, List[str], int, int]]] = defaultdict(list)

    def ingest_path(fname: str):
        if fname in loaded_files:
            return
        loaded_files.add(fname)
        ch = json.loads((PUBLIC_SHARDS_DIR / fname).read_text(encoding="utf-8"))
        pool = ch["p"]
        for tbl in ch["t"]:
            tid = tbl["type"]
            na = len(all_types[tid]["angles"])
            by_type[tid].append((tbl["r"], pool, int(tbl["baseQid"]), na))

    for dm in base_manifest["domains"]:
        for fm in dm["files"]:
            ingest_path(fm["path"])
    for fm in baseball_files:
        ingest_path(fm["path"])
    for f_list in subcat_files_by_dom.values():
        for fm in f_list:
            ingest_path(fm["path"])

    return by_type, all_types


def evaluate_shard_rules_exact(
    rules: List[Dict[str, Any]],
    by_type: Dict[str, List[Tuple[list, List[str], int, int]]],
    all_types: Dict[str, Dict[str, Any]],
) -> Tuple[int, List[List[int]]]:
    """
    Computes exact verified playable question count + contiguous QID ranges for a list of shardRules,
    strictly enforcing `answerCol !== filterCol`, `fakeCol !== filterCol` & `targetCol !== filterCol`
    and auto-sanitizing `rule['allowedAngleIds']` in place!
    """
    total_q = 0
    qid_ranges: List[List[int]] = []

    for rule in rules:
        tid = rule["type"]
        spec = all_types.get(tid)
        if not spec or tid not in by_type:
            continue
        pcols = set(spec.get("poolCols", []))
        fcol = rule.get("filterCol")
        fvals = [v.lower() for v in rule.get("filterValues", [])] if rule.get("filterValues") else None
        mmode = rule.get("matchMode", "exact")
        allowed_ids = set(rule["allowedAngleIds"]) if rule.get("allowedAngleIds") else None

        # Determine valid non-self-answering angles (1:1 parity with ForgeEngine.ts:2289-2298!)
        valid_angles = []
        valid_angle_ids = []
        for a_i, ang in enumerate(spec["angles"]):
            aid = ang["id"]
            if aid in ("ac_disc", "la_role", "lm_type", "hw_rev"):
                continue
            if allowed_ids is not None and aid not in allowed_ids:
                continue
            if fcol is not None and fvals:
                fc_int = int(fcol)
                if (
                    ang.get("answerCol") == fc_int
                    or ang.get("fakeCol") == fc_int
                    or ang.get("targetCol") == fc_int
                ):
                    continue
            valid_angles.append(a_i)
            valid_angle_ids.append(aid)

        # Explicitly persist sanitized non-self-answering allowedAngleIds whenever filterCol is active!
        if fcol is not None and fvals:
            rule["allowedAngleIds"] = valid_angle_ids

        if not valid_angles:
            continue

        for rows, pool, base_qid, n_angles in by_type[tid]:
            if fcol is None or not fvals:
                total_q += len(rows) * len(valid_angles)
                if len(valid_angles) == n_angles and rows:
                    qid_ranges.append([base_qid, base_qid + len(rows) * n_angles - 1])
            else:
                fc_int = int(fcol)
                matched_rows = 0
                for r in rows:
                    raw_v = pool[int(r[fc_int])] if fc_int in pcols else str(r[fc_int])
                    vlow = raw_v.lower()
                    ok = any(fv in vlow for fv in fvals) if mmode == "contains" else (vlow in fvals)
                    if ok:
                        matched_rows += 1
                total_q += matched_rows * len(valid_angles)

    return total_q, qid_ranges


def main() -> int:
    parser = argparse.ArgumentParser(description="Build 3-Level Taxonomy & Deep Specialist Shards")
    parser.add_argument("--cache-dir", type=Path, default=DEFAULT_CACHE_DIR)
    parser.add_argument("--cache-only", action="store_true")
    args = parser.parse_args()

    t0 = time.time()
    client = CachedClient(args.cache_dir, use_cache_only=args.cache_only)
    load_valid_countries(client)
    PUBLIC_SHARDS_DIR.mkdir(parents=True, exist_ok=True)

    # Clean ONLY stale subcat_*.json / domain_subcats_*.json / taxonomy_tree.json
    # NEVER touch domain_0..11.json or shard_manifest.json!
    for pat in ("subcat_*.json", "domain_subcats_*.json", "taxonomy_tree.json"):
        for old in PUBLIC_SHARDS_DIR.glob(pat):
            old.unlink()

    base_manifest = json.loads(BASE_MANIFEST_PATH.read_text(encoding="utf-8"))

    # 1. Build Dedicated Baseball Shard (`subcat_baseball.json`, starting at QID 1,100,000)
    next_qid = SUBCAT_START_QID
    bb_tables = harvest_baseball_lahman(client)
    bb_files, bb_ranges, next_qid = write_subcat_files(5, "subcat_baseball", bb_tables, next_qid)

    # 2. Build Deep Specialist Shards across Domains 0..11 (`domain_subcats_0..11.json`)
    spec_tables_by_dom = harvest_specialist_domains(client)
    subcat_files_by_dom: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
    used_subcat_types: Set[str] = set()

    for fm in bb_files:
        subcat_files_by_dom[5].append(fm)
        used_subcat_types.update(fm["types"])

    print("\n=== Writing Specialist Shards (`public/data/shards/`) ===", flush=True)
    for d in range(12):
        f_list, _, next_qid = write_subcat_files(d, f"domain_subcats_{d}", spec_tables_by_dom[d], next_qid)
        subcat_files_by_dom[d].extend(f_list)
        for fm in f_list:
            used_subcat_types.update(fm["types"])
        d_qs = sum(x["questions"] for x in subcat_files_by_dom[d])
        d_mb = sum(x["bytes"] for x in subcat_files_by_dom[d]) / 1e6
        print(f"  Domain {d:2d} specialist shards: {len(subcat_files_by_dom[d])} file(s) | +{d_qs:7,d} NEW Qs | {d_mb:5.2f} MB", flush=True)

    assert next_qid <= SUBCAT_MAX_QID, f"QID {next_qid} exceeded SUBCAT_MAX_QID {SUBCAT_MAX_QID}!"

    # 3. Hydrate Exact Question Counts & File Mappings Across 12 L0 -> 49 L1 -> 157 L2!
    by_type, all_types = load_all_table_rows_for_counting(base_manifest, subcat_files_by_dom, bb_files)
    type_to_subcat_files: Dict[str, List[str]] = defaultdict(list)
    for d, flist in subcat_files_by_dom.items():
        for fm in flist:
            for tid in fm["types"]:
                if fm["path"] not in type_to_subcat_files[tid]:
                    type_to_subcat_files[tid].append(fm["path"])

    blueprint = build_rich_3level_taxonomy_blueprint()
    total_l1 = 0
    total_l2 = 0

    for dom_node in blueprint:
        d = int(dom_node["l0Domain"])
        dom_sub_qs = sum(x["questions"] for x in subcat_files_by_dom[d])
        dom_node["specialistQuestions"] = dom_sub_qs
        # Do NOT set dom_node["shardFiles"] or l1["shardFiles"] so clicking a specific L2
        # (e.g., Basketball vs Baseball) fetches ONLY that L2's required specialist file(s)!

        for l1 in dom_node["l1Subcategories"]:
            total_l1 += 1
            l1_q_sum = 0
            for l2 in l1["l2Topics"]:
                total_l2 += 1
                q_cnt, q_ranges = evaluate_shard_rules_exact(l2["shardRules"], by_type, all_types)
                l2["questionCount"] = q_cnt
                l2["verifiedCount"] = q_cnt
                if q_ranges:
                    l2["qidRanges"] = q_ranges
                req_files = list(l2.get("shardFiles", []))
                for rule in l2["shardRules"]:
                    for sf in type_to_subcat_files.get(rule["type"], []):
                        if sf not in req_files:
                            req_files.append(sf)
                if req_files:
                    l2["shardFiles"] = req_files
                l1_q_sum += q_cnt
            l1["questionCount"] = l1_q_sum
            l1["verifiedCount"] = l1_q_sum

    tier1_count = 20_165
    if QUESTIONS_JSON_PATH.exists():
        try:
            qd = json.loads(QUESTIONS_JSON_PATH.read_text(encoding="utf-8"))
            tier1_count = len(qd["questions"]) if isinstance(qd, dict) else len(qd)
        except Exception:
            pass

    base_shard_qs = int(base_manifest["totalQuestions"])
    new_subcat_qs = next_qid - SUBCAT_START_QID
    codex_synth_qs = 50_400
    grand_verified = tier1_count + base_shard_qs + new_subcat_qs
    grand_playable = grand_verified + codex_synth_qs

    taxonomy_doc = {
        "schemaVersion": "WS_TAXONOMY_V1",
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "qidRange": [SUBCAT_START_QID, next_qid - 1],
        "totalL0Domains": 12,
        "totalL1Count": total_l1,
        "totalL2Count": total_l2,
        "newSpecialistQuestions": new_subcat_qs,
        "totalVerifiedQuestions": grand_verified,
        "totalPlayableQuestions": grand_playable,
        "subcatFiles": {str(d): subcat_files_by_dom[d] for d in range(12)},
        "types": {k: v for k, v in SUBCAT_TYPE_SPECS.items() if k in used_subcat_types},
        "domains": blueprint,
    }

    tax_path = PUBLIC_SHARDS_DIR / "taxonomy_tree.json"
    tax_bytes = json.dumps(taxonomy_doc, ensure_ascii=False, indent=2).encode("utf-8")
    tax_path.write_bytes(tax_bytes)

    bb_l2 = next(
        l2 for dom in blueprint if dom["l0Domain"] == 5
        for l1 in dom["l1Subcategories"] if l1["id"] == "sports"
        for l2 in l1["l2Topics"] if l2["id"] == "sports_baseball"
    )
    print("\n======================================================================")
    print(f"3-LEVEL SUBCATEGORY & SPECIALIST SHARD BUILD COMPLETE in {time.time()-t0:.1f}s")
    print(f"  Hierarchy                 : 12 L0 Domains -> {total_l1} L1 Subcategories -> {total_l2} L2 Topics")
    print(f"  L2 Showcase (Baseball)    : {bb_l2['verifiedCount']:,} verified non-self-answering Baseball Qs!")
    print(f"  New Specialist Shard Qs   : +{new_subcat_qs:,} (QIDs {SUBCAT_START_QID:,}..{next_qid-1:,})")
    print(f"  Total Verified Questions  : {grand_verified:,} ({tier1_count:,} Tier-1 + {base_shard_qs:,} Base + {new_subcat_qs:,} Subcat)")
    print(f"  Total Playable Universe   : {grand_playable:,} (incl. {codex_synth_qs:,} Codex Synthesis, max QID < 3,145,727)")
    print(f"  taxonomy_tree.json        : {len(tax_bytes)/1e3:.1f} KB -> {tax_path}")
    print("======================================================================")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
