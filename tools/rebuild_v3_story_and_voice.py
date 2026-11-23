#!/usr/bin/env python3
"""
World's Smartest v3.0 — Prestige Mystery Story Overhaul & Matched Neural VO Pipeline
====================================================================================
Reproducibly applies "The Last Puzzle of Dr. Mara Sato" (Knives Out x The Queen's Gambit)
across:
  1. `public/data/campaign_20hr.json`
     - Relaxed progressive difficulty curve (`ch` 30s [-1.85,-0.85] -> `global` 15s [1.45,2.8])
     - All 6 Act Cutscenes (`act0_invitation` .. `act5_apex_finale`) & `voice_manifest`
     - Grounded, witty, character-driven dialogue across Geneva (`ch_1..5`), London (`gb_1..5`),
       and Tokyo (`jp_1..5`), plus aligned hub taglines & 12 evidence clues
  2. `public/data/narrative_wave2.json`
     - Refreshed 4 Persona Stamp Ceremonies (plain-English, Mara Sato flavor)
     - Synced Geneva / London / Tokyo Backstage Interrogations
  3. `public/assets/voice/*.mp3` (+ `vo_wave2_manifest.json` metadata sync)
     - Regenerates ONLY the 33 rewritten `.mp3` clips in-place via `edge-tts` + silky
       de-essed FFmpeg broadcast mastering (`loudnorm=-15.5 LUFS`, `TP <= -1.1 dBTP`),
       keeping the exact 144-file voice catalog intact so audio matches subtitles 100%!

Usage:
  python tools/rebuild_v3_story_and_voice.py            # Story JSONs + 33 Neural VO MP3s
  python tools/rebuild_v3_story_and_voice.py --story-only
  python tools/rebuild_v3_story_and_voice.py --voice-only
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
CAMPAIGN_PATH = REPO_ROOT / "public" / "data" / "campaign_20hr.json"
WAVE2_PATH = REPO_ROOT / "public" / "data" / "narrative_wave2.json"
PUBLIC_VOICE_DIR = REPO_ROOT / "public" / "assets" / "voice"
GODOT_VOICE_DIR = REPO_ROOT / "godot" / "assets" / "voice"
VO_WAVE2_MANIFEST_PATH = PUBLIC_VOICE_DIR / "vo_wave2_manifest.json"

# ============================================================================
# 1. VOICE ACTOR PROFILES & BROADCAST MASTERING CHAINS
# ============================================================================
ACTORS: Dict[str, Dict[str, str]] = {
    "vance":     {"voice": "en-GB-RyanNeural",        "rate": "-6%", "pitch": "-2Hz", "profile": "broadcast_baritone"},
    "nadia":     {"voice": "en-GB-SoniaNeural",       "rate": "-3%", "pitch": "-1Hz", "profile": "broadcast_crisp"},
    "soren":     {"voice": "en-US-ChristopherNeural", "rate": "+2%", "pitch": "+0Hz", "profile": "broadcast_crisp"},
    "teo":       {"voice": "en-US-AndrewNeural",      "rate": "+0%", "pitch": "-1Hz", "profile": "broadcast_crisp"},
    "lindqvist": {"voice": "en-AU-NatashaNeural",     "rate": "-9%", "pitch": "-4Hz", "profile": "icy_diplomat"},
    "tariq":     {"voice": "en-GB-ThomasNeural",      "rate": "-6%", "pitch": "-3Hz", "profile": "broadcast_baritone"},
}

VOICE_FILTER_CHAINS: Dict[str, str] = {
    "broadcast_baritone": (
        "highpass=f=76,equalizer=f=195:t=q:w=1.1:g=2.1,equalizer=f=2900:t=q:w=1.4:g=1.2,"
        "equalizer=f=6200:t=q:w=1.8:g=-2.8,equalizer=f=8200:t=q:w=1.6:g=-2.6,lowpass=f=9500,"
        "acompressor=threshold=-20dB:ratio=2.4:attack=12:release=120:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,alimiter=limit=0.68:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "broadcast_crisp": (
        "highpass=f=82,equalizer=f=230:t=q:w=1.2:g=1.5,equalizer=f=3100:t=q:w=1.5:g=1.2,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.0,equalizer=f=8300:t=q:w=1.6:g=-2.6,lowpass=f=9500,"
        "acompressor=threshold=-20dB:ratio=2.3:attack=12:release=115:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,alimiter=limit=0.68:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "icy_diplomat": (
        "highpass=f=85,equalizer=f=220:t=q:w=1.2:g=1.8,equalizer=f=2700:t=q:w=1.4:g=1.3,"
        "equalizer=f=6300:t=q:w=1.8:g=-2.8,lowpass=f=9500,"
        "acompressor=threshold=-19dB:ratio=2.4:attack=11:release=110:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,alimiter=limit=0.68:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "intimate_whisper": (
        "highpass=f=92,equalizer=f=180:t=q:w=1.0:g=3.0,equalizer=f=3600:t=q:w=1.4:g=1.5,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.2,lowpass=f=9000,"
        "acompressor=threshold=-23dB:ratio=2.8:attack=10:release=100:makeup=1.8,"
        "loudnorm=I=-16.0:TP=-2.4:LRA=7,alimiter=limit=0.68:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.08"
    ),
}

# ============================================================================
# 2. CANONICAL V3 REWRITTEN VOICE SCRIPT (33 EXISTING CLIPS — 100% VERBATIM!)
# ============================================================================
# (clip_id, speaker, profile_override, display_text, spoken_text_override)
V3_VOICE_CLIPS: List[Tuple[str, str, Optional[str], str, Optional[str]]] = [
    # --- Act 0 Cutscene (3) ---
    (
        "cutscene_act0_1", "vance", None,
        "Three weeks ago, legendary puzzle-maker Dr. Mara Sato passed away—leaving one final riddle tucked inside Sunday papers and public archives. Four hundred thousand people tried it, and your 2:14 AM answer earned a seat on Lake Geneva.",
        None,
    ),
    (
        "cutscene_act0_2", "vance", None,
        "I'm Julian Vance, Mara's longtime co-creator. Rather than hand her hundred-million-dollar Meridian Archive to a committee, she built an eight-city tournament—betting everything on one agile, curious mind.",
        None,
    ),
    (
        "cutscene_act0_3", "teo", "broadcast_crisp",
        "Relax, the Geneva warmup is the fun part. I'm Teo—audio engineer and official espresso smuggler. Mara built these first four questions just to see how you think—though... weird. Her private terminal just woke up the second you walked in.",
        None,
    ),
    # --- Act 1 Cutscene: London (3) ---
    (
        "cutscene_act1_1", "nadia", None,
        "Welcome to London. I'm Nadia Al-Mansoor. Mara Sato designed this rotunda with a glass floor so nothing stays buried—though the board seems awfully nervous about what's underneath.",
        None,
    ),
    (
        "cutscene_act1_2", "lindqvist", None,
        "A charming warmup in Geneva, truly. Yet Mara's archive holds diplomatic secrets too delicate for chance. Join me in the corridor—let us speak like adults.",
        None,
    ),
    (
        "cutscene_act1_3", "teo", None,
        "Hey—while everyone was clinking champagne glasses, I checked the 2019 build logs. Mara ran a secret dress rehearsal seven years ago, and somebody scrubbed the winner's name.",
        "Hey—while everyone was clinking champagne glasses, I checked the twenty nineteen build logs. Mara ran a secret dress rehearsal seven years ago, and somebody scrubbed the winner's name.",
    ),
    # --- Act 2 Cutscene: Tokyo (3) ---
    (
        "cutscene_act2_1", "soren", None,
        "Seventy floors above Shibuya, friend—welcome to my neighborhood. I'm Soren Kael, card counter turned probability trader, and Mara invited me strictly to give the board heartburn.",
        None,
    ),
    (
        "cutscene_act2_2", "soren", None,
        "Word from London is you actually read the footnotes. Careful up here—half the trading floor already has side bets on whether your streak survives tonight.",
        None,
    ),
    (
        "cutscene_act2_3", "vance", None,
        "Soren Kael counts cards faster than most people blink. Keep your cool, read his silver coin, and remember why Mara put you in that chair.",
        None,
    ),
    # --- Act 3 Cutscene: Cairo (3) ---
    (
        "cutscene_act3_1", "teo", None,
        "Okay, deep breath—we're inside Mara's sealed Cairo vault. Trial Zero wasn't a test run. It was the first time someone beat Lindqvist's board fair and square.",
        None,
    ),
    (
        "cutscene_act3_2", "nadia", None,
        "That handwriting in Mara's ledger... that's Tariq. My brother won her 2019 prototype—and the week he refused to sell out, the board made him vanish from the record.",
        "That handwriting in Mara's ledger... that's Tariq. My brother won her twenty nineteen prototype—and the week he refused to sell out, the board made him vanish from the record.",
    ),
    (
        "cutscene_act3_3", "vance", None,
        "Mara hid this room for seven years waiting for someone sharp enough to find it. Read the whole page before you judge me—Lindqvist's lawyers are already landing.",
        None,
    ),
    # --- Act 4 Cutscene: Singapore (3) ---
    (
        "cutscene_act4_1", "tariq", None,
        "Mara and Julian kept me off the grid in Reykjavik for seven winters so we could build a contest too public to rig. Now you carry her final key to the stage.",
        None,
    ),
    (
        "cutscene_act4_2", "lindqvist", None,
        "Enough charming detective work. Invoke Article Nine and seal the archive—Dr. Sato's whim will not hand global stewardship to an amateur.",
        None,
    ),
    (
        "cutscene_act4_3", "soren", None,
        "Plot twist, friend. Even a card shark knows when the house is dealing from the bottom of the deck. Consider my chips all-in on you.",
        None,
    ),
    # --- Act 5 Cutscene: Apex Forum (3) ---
    (
        "cutscene_act5_1", "vance", None,
        "The Apex Forum. Two billion witnesses watching live, exactly as Mara drafted on a napkin seven years ago. No committees, no back rooms—just the questions.",
        None,
    ),
    (
        "cutscene_act5_2", "nadia", None,
        "For Tariq, for Mara, and for everyone who stayed up until two in the morning chasing a good clue. Beat Julian clean—in front of the whole world.",
        None,
    ),
    (
        "cutscene_act5_3", "vance", None,
        "Take the chair across from me, claim Mara's veto key, and decide what the sharpest mind on Earth leaves behind.",
        None,
    ),
    # --- Geneva Prologue & Early City Story Clips (11) ---
    (
        "vance_intro_1", "vance", None,
        "Welcome to Dr. Mara Sato's study. You solved her Sunday cipher from home—so grab a chair, take a breath, and let's start easy.",
        None,
    ),
    (
        "vance_intro_2", "vance", None,
        "Mara spent forty years building the Meridian Archive with me—and Chancellor Lindqvist's board has spent three weeks trying to lock it away. Let's open with a classic warmup.",
        None,
    ),
    (
        "vance_intro_3", "vance", None,
        "Before London, before Tokyo, before the board tries to box you into a biography—tell me your name, and how you like to think.",
        None,
    ),
    (
        "vance_intro_4", "vance", None,
        "Last warmup—Mara's favorite brass toy, the Closest-Year Dial. Even a close estimate scores points, so trust your gut.",
        None,
    ),
    (
        "teo_whisper", "teo", "broadcast_crisp",
        "Whoa—hang on. Mara's desk monitor just flashed an old margin note from the night she died, right next to Question Two. Looks like she left a clue... and a timestamp.",
        None,
    ),
    (
        "vance_leak_react", "vance", None,
        "Well spotted. Mara hated shortcuts almost as much as she loved leaving breadcrumbs in the margins. Let's keep going.",
        None,
    ),
    (
        "vance_manifesto", "vance", None,
        "Between us—if you win Mara's archive and a hundred million dollars, who should knowledge answer to? Institutions, the public, or one independent mind?",
        None,
    ),
    (
        "vance_stamp", "vance", None,
        "Splendid warmup. Your Meridian Passport is officially stamped—and the world tour opens ahead of you.",
        None,
    ),
    (
        "nadia_london_intro", "nadia", None,
        "So you're the 2:14 AM solver who won Mara's Geneva seat. Welcome to the Sovereign Rotunda—let's see if you're as sharp under London lights.",
        None,
    ),
    (
        "soren_tokyo_intro", "soren", None,
        "Seventy floors above Shibuya, friend. Mara told me you'd be fun to play against—hope your instincts move faster than my odds.",
        None,
    ),
    (
        "lindqvist_london", "lindqvist", None,
        "A quiet word before the broadcast begins. Dr. Sato loved clever games, yet serious archives require steady hands.",
        None,
    ),
    # --- 4 Persona Stamp Ceremonies (Wave-2, jargon-free Mara Sato refresh) ---
    (
        "vance_persona_maverick", "vance", None,
        "Fearless double-downs, sharp instinct, zero hesitation. Mara would have loved you. Your Meridian Passport is stamped: The Maverick.",
        None,
    ),
    (
        "vance_persona_diplomat", "vance", None,
        "Warm composure, clever diplomacy, calm under the lights. Mara would have loved you. Your Meridian Passport is stamped: The Diplomat.",
        None,
    ),
    (
        "vance_persona_analyst", "vance", None,
        "Patient deduction, smart use of clues, zero wasted motion. Mara would have loved you. Your Meridian Passport is stamped: The Analyst.",
        None,
    ),
    (
        "vance_persona_prodigy", "vance", None,
        "Effortless precision, razor speed, unshakable poise. Mara would have loved you. Your Meridian Passport is stamped: The Prodigy.",
        None,
    ),
]

CLIP_TEXT_BY_ID: Dict[str, str] = {row[0]: row[3] for row in V3_VOICE_CLIPS}
CLIP_SPOKEN_BY_ID: Dict[str, Optional[str]] = {row[0]: row[4] for row in V3_VOICE_CLIPS}

# ============================================================================
# 3. RELAXED PROGRESSIVE DIFFICULTY CURVE (ALL 8 HUBS / 96 MISSIONS)
# ============================================================================
HUB_DIFFICULTY_CURVE: List[Dict[str, Any]] = [
    {"hub": "ch",     "label": "EASY · WARMUP", "irt_b": [-1.85, -0.85], "timer_sec": 30, "rival_acc": 0.35},
    {"hub": "gb",     "label": "EASY+",         "irt_b": [-1.45, -0.35], "timer_sec": 26, "rival_acc": 0.44},
    {"hub": "jp",     "label": "MEDIUM",        "irt_b": [-0.95,  0.15], "timer_sec": 24, "rival_acc": 0.52},
    {"hub": "br",     "label": "MEDIUM+",       "irt_b": [-0.45,  0.65], "timer_sec": 22, "rival_acc": 0.62},
    {"hub": "eg",     "label": "CHALLENGING",   "irt_b": [ 0.05,  1.10], "timer_sec": 20, "rival_acc": 0.70},
    {"hub": "is",     "label": "HARD",          "irt_b": [ 0.55,  1.55], "timer_sec": 18, "rival_acc": 0.76},
    {"hub": "sg",     "label": "EXPERT",        "irt_b": [ 1.00,  2.05], "timer_sec": 16, "rival_acc": 0.82},
    {"hub": "global", "label": "GENIUS",        "irt_b": [ 1.45,  2.80], "timer_sec": 15, "rival_acc": 0.87},
]
HUB_CURVE_BY_ID: Dict[str, Dict[str, Any]] = {x["hub"]: x for x in HUB_DIFFICULTY_CURVE}

# Per-slot IRT ramp inside each hub (slots 1..5 + side dossiers)
MISSION_IRT_SCHEDULES: Dict[str, Dict[str, List[float]]] = {
    "ch": {
        "1": [-1.85, -1.35], "2": [-1.75, -1.20], "3": [-1.60, -1.05],
        "4": [-1.45, -0.95], "5": [-1.35, -0.85], "side": [-1.65, -0.90],
    },
    "gb": {
        "1": [-1.45, -0.95], "2": [-1.30, -0.80], "3": [-1.15, -0.65],
        "4": [-0.95, -0.50], "5": [-0.80, -0.35], "side": [-1.20, -0.45],
    },
    "jp": {
        "1": [-0.95, -0.45], "2": [-0.80, -0.30], "3": [-0.65, -0.15],
        "4": [-0.45,  0.00], "5": [-0.30,  0.15], "side": [-0.75,  0.05],
    },
    "br": {
        "1": [-0.45,  0.05], "2": [-0.30,  0.20], "3": [-0.15,  0.35],
        "4": [ 0.00,  0.50], "5": [ 0.15,  0.65], "side": [-0.25,  0.55],
    },
    "eg": {
        "1": [ 0.05,  0.50], "2": [ 0.20,  0.65], "3": [ 0.35,  0.80],
        "4": [ 0.50,  0.95], "5": [ 0.65,  1.10], "side": [ 0.20,  1.00],
    },
    "is": {
        "1": [ 0.55,  0.95], "2": [ 0.70,  1.10], "3": [ 0.85,  1.25],
        "4": [ 1.00,  1.40], "5": [ 1.15,  1.55], "side": [ 0.70,  1.45],
    },
    "sg": {
        "1": [ 1.00,  1.42], "2": [ 1.15,  1.58], "3": [ 1.30,  1.74],
        "4": [ 1.45,  1.90], "5": [ 1.60,  2.05], "side": [ 1.15,  1.95],
    },
    "global": {
        "1": [ 1.45,  1.95], "2": [ 1.65,  2.20], "3": [ 1.85,  2.45],
        "4": [ 2.05,  2.68], "5": [ 2.20,  2.80], "side": [ 1.72,  2.58],
    },
}

# ============================================================================
# 4. ACT CUTSCENES METADATA & LINES (SYNCED WITH MotionCinemaDirector.ts)
# ============================================================================
ACT_CUTSCENE_UPDATES: Dict[str, Dict[str, Any]] = {
    "act0_invitation": {
        "title": "ACT 0 · THE LAST PUZZLE OF DR. MARA SATO",
        "location": "Lake Geneva, Switzerland · Dr. Mara Sato’s Study",
        "lines": [
            ("cutscene_act0_1", "vance", "neutral"),
            ("cutscene_act0_2", "vance", "intense"),
            ("cutscene_act0_3", "teo",   "neutral"),
        ],
    },
    "act1_london_leak": {
        "title": "ACT I · MARA’S MISSING CHAPTER",
        "location": "London, United Kingdom · The Sovereign Rotunda",
        "lines": [
            ("cutscene_act1_1", "nadia",     "neutral"),
            ("cutscene_act1_2", "lindqvist", "neutral"),
            ("cutscene_act1_3", "teo",       "intense"),
        ],
    },
    "act2_tokyo_confrontation": {
        "title": "ACT II · ODDS IN THE NEON RAIN",
        "location": "Tokyo, Japan · The Horizon Sky Pavilion",
        "lines": [
            ("cutscene_act2_1", "soren", "smirk"),
            ("cutscene_act2_2", "soren", "smirk"),
            ("cutscene_act2_3", "vance", "intense"),
        ],
    },
    "act3_cairo_vault": {
        "title": "ACT III · TRIAL ZERO",
        "location": "Giza Plateau, Egypt · 38 Meters Below the Solar Hall",
        "lines": [
            ("cutscene_act3_1", "teo",   "intense"),
            ("cutscene_act3_2", "nadia", "shocked"),
            ("cutscene_act3_3", "vance", "intense"),
        ],
    },
    "act4_singapore_betrayal": {
        "title": "ACT IV · THE BOARD’S COUNTER-MOVE",
        "location": "Singapore · 90 Floors Above the Meridian Archive",
        "lines": [
            ("cutscene_act4_1", "tariq",     "neutral"),
            ("cutscene_act4_2", "lindqvist", "neutral"),
            ("cutscene_act4_3", "soren",     "smirk"),
        ],
    },
    "act5_apex_finale": {
        "title": "ACT V · MARA’S FINAL TABLE",
        "location": "International Waters · Two Billion Live Witnesses",
        "lines": [
            ("cutscene_act5_1", "vance", "intense"),
            ("cutscene_act5_2", "nadia", "neutral"),
            ("cutscene_act5_3", "vance", "intense"),
        ],
    },
}

HUB_TAGLINES: Dict[str, str] = {
    "ch": "Dr. Mara Sato's lakeside study—five joyful warmup rounds introducing the world tour and a curious 2:14 AM note.",
    "gb": "London's glass-floored Rotunda, Nadia Al-Mansoor's razor wit, and a sealed 2019 archive drawer the board won't discuss.",
    "jp": "Seventy floors above Shibuya with witty card shark Soren Kael—where fast minds clash over a mysterious live feed.",
    "br": "Ten thousand cheering fans under Rio's twilight canopy—until podium sabotage reveals how far the board will go.",
    "eg": "Thirty-eight meters beneath Giza lies Mara's buried 2019 vault—and the truth about Nadia's brother Tariq.",
    "is": "Northern lights over volcanic steam—where a ghost from Mara's 2019 prototype flips the entire mystery on its head.",
    "sg": "Ninety stories above the global archive, Chancellor Lindqvist calls an emergency vote and every alliance faces the fire.",
    "global": "Two billion live witnesses. One floating marble table. Outthink Julian Vance and claim Mara Sato's Final Key.",
}

EVIDENCE_CLUE_UPDATES: Dict[str, Tuple[str, str]] = {
    "clue_01_summons": (
        "Mara's 2:14 AM Qualifier Slip",
        "Julian Vance's lakeside dossier flags your 2:14 AM solution as a 99.4% match to Dr. Mara Sato's 2019 prototype champion.",
    ),
    "clue_02_watch_scratch": (
        "Mara's Margin Note & Watch",
        "Dr. Sato's monitor note matches an engraving inside Julian's pocket watch: 'TRIAL ZERO — DO NOT LET THEM ERASE ANOTHER.'",
    ),
    "clue_03_drawer_00": (
        "Drawer 00 Floor Stamp",
        "Sealed mahogany drawers beneath Mara's London glass floor prove she ran a secret 2019 prototype contest seven years ago.",
    ),
    "clue_04_wax_briefing": (
        "Lindqvist's Wax Envelope",
        "Chancellor Lindqvist's backroom folder bears a 2019 board seal—linking her directly to burying Mara's first champion.",
    ),
    "clue_05_horizon_chip": (
        "Tokyo Earpiece Wafer",
        "Soren's sub-vocal earpiece ran through Horizon servers—whose backup log also pinged buried coordinates beneath Giza.",
    ),
    "clue_06_trial00_photo": (
        "Engraved Trophy Notch",
        "Etched inside London's bronze trophy: 'A.M. — 2019.' Nadia froze on sight—it belongs to her missing brother Tariq.",
    ),
    "clue_07_psychometric_match": (
        "Cairo Twin-Mind Dossier",
        "Pulled from Mara's buried Giza vault: Tariq Al-Mansoor won Trial Zero, uncovered board rigging, and shares your 99.4% reasoning profile.",
    ),
    "clue_08_rio_burnt_relay": (
        "Rio Burnt Podium Relay",
        "Nadia's podium was spiked with Horizon chips—yet Soren's dead-still coin tell proved someone else framed him.",
    ),
    "clue_09_rescue_code": (
        "Mara & Vance's Rescue Code",
        "Julian's 'erasure' stamp on Tariq's 2019 file wasn't a betrayal—it was the safe-house code Mara used to spirit Tariq to safety.",
    ),
    "clue_10_sovereign_receipt": (
        "Sovereign Frame-Job Receipt",
        "Found inside Singapore's archive core: Lindqvist's proxies bought Horizon hardware to frame Soren and cut Nadia in Rio.",
    ),
    "clue_11_caldera_log": (
        "Tariq's Seven-Year Ice Log",
        "Tariq has been alive in Iceland for seven years, quietly helping Mara and Julian build a broadcast tournament too public to bury.",
    ),
    "clue_12_trojan_blueprint": (
        "Mara's Final Napkin Charter",
        "The full puzzle solved: put one unbought mind live before two billion people holding Mara's Master Key so no committee can silence them.",
    ),
}

# ============================================================================
# 5. POLISHED GENEVA / LONDON / TOKYO CORE MISSIONS (ch_1..5, gb_1..5, jp_1..5)
# ============================================================================
# Preserves ALL mission IDs, choice IDs, effects, requires, branch_flags, clues!
MISSION_STORY_UPDATES: Dict[str, Dict[str, Any]] = {
    "ch_1": {
        "title": "Welcome to Mara's Study",
        "subtitle": "Warmup 1 · Dr. Mara Sato's Study, Geneva",
        "pass_goal": "Enjoy 4 classic warmup questions to settle in and start your World Tour.",
        "mutator_brief": "Easy warmup: tap your answer and click LOCK ANSWER. Use Hint, 50/50, or 2x Double Down anytime!",
        "cliffhanger_hook": "On the monitor beside you, Dr. Mara Sato's private terminal wakes with a 2:14 AM note.",
        "pre": {
            "ch_1_b1": {
                "text": CLIP_TEXT_BY_ID["vance_intro_1"],
                "voice_clip": "res://assets/voice/vance_intro_1.mp3",
                "tell_hint": "Julian slides an espresso across the walnut—thumb brushing his left brass cufflink.",
            },
            "ch_1_b2": {
                "text": CLIP_TEXT_BY_ID["vance_intro_3"],
                "voice_clip": "res://assets/voice/vance_intro_3.mp3",
                "tell_hint": "Mara's brass press waits beside your leather passport and 2:14 AM qualifier slip.",
            },
        },
        "choices": {
            "ch_1_origin_academic": {
                "label": "Curious Scholar",
                "response_line": "Mara adored anyone who checked the footnotes—especially the ones committees hoped nobody would read.",
            },
            "ch_1_origin_polymath": {
                "label": "Self-Taught Polymath",
                "response_line": "No pedigree, no sponsor, no script. Mara specifically built the Sunday qualifier for minds like yours.",
            },
            "ch_1_origin_strategist": {
                "label": "Sharp Strategist",
                "response_line": "Careful now—you read the room as closely as the puzzle. Soren Kael is going to enjoy meeting you.",
            },
        },
        "post": {
            "ch_1_post": {
                "text": "Clean, effortless, and right on the button. Now let's see what caught Teo's eye on Mara's desk.",
                "voice_clip": "res://assets/voice/vance_correct_1.mp3",
            },
        },
    },
    "ch_2": {
        "title": "Mara's Margin Note",
        "subtitle": "Warmup 2 · Dr. Mara Sato's Study, Geneva",
        "pass_goal": "Answer warmup trivia cleanly—try tapping Hint or 50/50 whenever you want an extra clue.",
        "mutator_brief": "Easy warmup: tap HINT for a helpful clue, or 50/50 to cross out two wrong choices.",
        "cliffhanger_hook": "Julian glances at the monitor, smiles wryly, and dims the study lamps for Mara's personal question.",
        "pre": {
            "ch_2_b1": {
                "text": CLIP_TEXT_BY_ID["teo_whisper"],
                "voice_clip": "res://assets/voice/teo_whisper.mp3",
                "tell_hint": "Teo points at the glowing margin note on Mara's monitor—more puzzled than secretive.",
            },
            "ch_2_b2": {
                "text": CLIP_TEXT_BY_ID["vance_leak_react"],
                "voice_clip": "res://assets/voice/vance_leak_react.mp3",
                "tell_hint": "Julian notices the glowing monitor with an amused eyebrow raise.",
            },
        },
        "choices": {
            "ch_2_exploit": {
                "label": "Read Mara's Margin Note",
                "response_line": "Quick eyes—though Mara's footnote wasn't just a hint. It asked why 2019's winner never got his trophy.",
            },
            "ch_2_flag": {
                "label": "Point It Out to Julian",
                "response_line": "Refreshing candor. Chancellor Lindqvist's auditors read every Geneva log—they'll appreciate that.",
            },
            "ch_2_clean": {
                "label": "Leave It Untouched & Solve Clean",
                "response_line": "You solved it purely on your own wits without throwing Teo under the bus. Mara would have applauded.",
            },
        },
        "post": {
            "ch_2_post": {
                "text": "Smart use of clues is half the craft. Now step under the warm amber lights—Mara left one personal question.",
                "voice_clip": "res://assets/voice/vance_peel.mp3",
            },
        },
    },
    "ch_3": {
        "title": "Mara's Will & Charter",
        "subtitle": "Warmup 3 · Dr. Mara Sato's Study, Geneva",
        "pass_goal": "Try tapping 2x Double Down whenever you feel confident to double your points!",
        "mutator_brief": "Easy warmup: when you know an answer cold, tap 2x DOUBLE DOWN for double points (+600)!",
        "cliffhanger_hook": "Julian sets down Mara's antique brass dial—time for the Closest-Year warmup.",
        "pre": {
            "ch_3_b1": {
                "text": CLIP_TEXT_BY_ID["vance_intro_2"],
                "voice_clip": "res://assets/voice/vance_intro_2.mp3",
                "tell_hint": "Julian speaks warmly of Mara, his voice cooling slightly at Lindqvist's name.",
            },
            "ch_3_b2": {
                "text": CLIP_TEXT_BY_ID["vance_manifesto"],
                "voice_clip": "res://assets/voice/vance_manifesto.mp3",
                "tell_hint": "Mara's brass charter recorder clicks softly on the walnut desk.",
            },
        },
        "choices": {
            "ch_3_manifesto_council": {
                "label": "Trusted Institutions",
                "response_line": "Measured and diplomatic. Let's hope the board lives up to that trust once the cameras switch off.",
            },
            "ch_3_manifesto_public": {
                "label": "Everyone — Open to the World",
                "response_line": "Spoken like Mara herself. Just expect a few icy stares from the folks upstairs who prefer locked drawers.",
            },
            "ch_3_manifesto_self": {
                "label": "An Independent Mind",
                "response_line": "Fearless. The last person who gave me that exact answer won our 2019 prototype—ah, story for another city.",
            },
        },
        "post": {
            "ch_3_post": {
                "text": "Bold call—and dead right. Let's finish Geneva's warmup with Mara's favorite brass instrument.",
                "voice_clip": "res://assets/voice/vance_overclock_win.mp3",
            },
        },
    },
    "ch_4": {
        "title": "The Closest-Year Dial",
        "subtitle": "Warmup 4 · Dr. Mara Sato's Study, Geneva",
        "pass_goal": "Test your instincts on dates and trivia—even close guesses score points on the dial!",
        "mutator_brief": "Easy warmup: drag the year slider or tap -1 / +1. Wide tolerance rewards smart estimates!",
        "cliffhanger_hook": "Mara's brass press warms up—one final Geneva celebration opens London and Tokyo on the World Globe.",
        "pre": {
            "ch_4_b1": {
                "text": CLIP_TEXT_BY_ID["vance_intro_4"],
                "voice_clip": "res://assets/voice/vance_intro_4.mp3",
                "tell_hint": "Julian spins the engraved brass dial across Mara's desk with genuine fondness.",
            },
            "ch_4_b2": {
                "text": "Also, pick your favorite starting edge before we stamp your passport—you'll carry it into every city ahead.",
                "voice_clip": None,
                "tell_hint": "Teo grins from the audio console, holding up two freshly printed credential cards.",
            },
        },
        "choices": {
            "ch_4_maverick_tune": {
                "label": "Bold Double-Down Edge",
                "response_line": "A card player's nerve paired with a scholar's curiosity. Engraved straight into your passport.",
            },
            "ch_4_diplomat_tune": {
                "label": "Extra Calm & Time Edge",
                "response_line": "Two extra heartbeats of breathing room beat frantic guessing every single day of the week.",
            },
        },
        "post": {
            "ch_4_post": {
                "text": "Brilliant deduction. One celebratory Geneva finale unlocks your first flight on the World Globe.",
                "voice_clip": "res://assets/voice/vance_correct_2.mp3",
            },
        },
    },
    "ch_5": {
        "title": "Geneva Finale: Choose Your Flight",
        "subtitle": "Stage 1 Finale · Dr. Mara Sato's Study, Geneva",
        "pass_goal": "Complete Geneva's celebratory warmup round to stamp your passport and pick London or Tokyo.",
        "mutator_brief": "Stage 1 Finale: friendly pace, classic questions, and your first World Tour boarding pass!",
        "cliffhanger_hook": "As your boarding pass prints, Teo notices two VIP rivals already studying your Geneva warmup tape.",
        "pre": {
            "ch_5_b1": {
                "text": CLIP_TEXT_BY_ID["vance_stamp"],
                "voice_clip": "res://assets/voice/vance_stamp.mp3",
                "tell_hint": "Warm crimson wax seals your Geneva Visa beside Mara's astrolabe crest.",
            },
            "ch_5_b2": {
                "text": "London wants you first. Tokyo wants you first. Pick your departure—and whichever city waits will study your tape.",
                "voice_clip": "res://assets/voice/vance_victory.mp3",
                "tell_hint": "Golden flight arcs shimmer across the brass globe toward London and Tokyo.",
            },
        },
        "choices": {
            "ch_5_fly_london": {
                "label": "Fly to London First",
                "response_line": "Wheels up for London in forty minutes. Say hello to Nadia—and do mind the glass floor tiles.",
            },
            "ch_5_fly_tokyo": {
                "label": "Fly to Tokyo First",
                "response_line": "Bold detour. Soren Kael loves high-altitude company—just keep an eye on his silver coin.",
            },
        },
        "post": {
            "ch_5_post": {
                "text": "Warmup complete and Geneva stamped. Mara's eight-city tour officially begins.",
                "voice_clip": "res://assets/voice/vance_victory.mp3",
            },
        },
    },
    # --- LONDON (gb_1..gb_5) ---
    "gb_1": {
        "title": "Arrival in London",
        "subtitle": "Round 1 · The Sovereign Rotunda, London",
        "pass_goal": "Warm up in London against acoustic engineer Nadia Al-Mansoor.",
        "mutator_brief": "Stage 2 London: welcoming pace with History, Arts, and World Culture flavor!",
        "cliffhanger_hook": "Beneath your shoes, through Mara's glass floor, a locked mahogany drawer reads: 'TRIAL ZERO — 2019.'",
        "pre": {
            "gb_1_b1": {
                "text": CLIP_TEXT_BY_ID["nadia_london_intro"],
                "voice_clip": "res://assets/voice/nadia_london_intro.mp3",
                "tell_hint": "Nadia offers a sharp, polite smile—her eyes flicking once toward the sealed glass floor.",
            },
            "gb_1_b2": {
                "text": "Welcome to Mara's London Rotunda. Relax, trust your instincts, and show the crowd Geneva was no fluke.",
                "voice_clip": "res://assets/voice/london_vance_rotunda_1.mp3",
                "tell_hint": "Rain patters softly on the Victorian dome overhead as the round begins.",
            },
        },
        "choices": {
            "gb_1_salute_nadia": {
                "label": "Admire Her Acoustic Engineering",
                "response_line": "Flattery won't slow my buzzer—though you definitely do better homework than the London press.",
            },
            "gb_1_call_tell": {
                "label": "Tease Her About Her Quick Blink",
                "response_line": "Oh, you're already reading tells? Careful—I've been studying this stage since Mara designed it.",
            },
        },
        "post": {
            "gb_1_post": {
                "text": "Better than advertised. Hey—before security clears the room, look straight down through the floor glass.",
                "voice_clip": None,
            },
        },
    },
    "gb_2": {
        "title": "The Glass Floor Archive",
        "subtitle": "Round 2 · The Sovereign Rotunda, London",
        "pass_goal": "Keep your cool across London's second round while uncovering Mara's 2019 archive clue.",
        "pre": {
            "gb_2_b1": {
                "text": "Keep your voice down—Lindqvist's security detail just swept the green room looking for that 2019 Trial Zero plate under your heel.",
                "voice_clip": "res://assets/voice/london_teo_corridor_1.mp3",
                "tell_hint": "Teo pretends to check a cable while pointing subtly at the plaque under the glass.",
            },
            "gb_2_b2": {
                "text": "The board swore Geneva this year was the first Meridian contest. Why is my brother's handwriting stamped under Mara's floor?",
                "voice_clip": "res://assets/voice/london_nadia_trial00_2.mp3",
                "tell_hint": "Nadia's poise slips for half a second—this isn't just a tournament to her.",
            },
        },
        "choices": {
            "gb_2_scan_drawer": {
                "label": "Snap a Quick Photo of the Label",
                "response_line": "Got it—'TRIAL ZERO · SEALED BY BOARD VOTE.' Mara left that glass transparent on purpose.",
            },
            "gb_2_keep_poise": {
                "label": "Keep Your Hands Visible & Stay Cool",
                "response_line": "Smart poker face—though secrets Mara buried under glass never stay quiet for long.",
            },
        },
        "post": {
            "gb_2_post": {
                "text": "Heads up—Chancellor Lindqvist just cleared the tea lounge and asked for you by name.",
                "voice_clip": None,
            },
        },
    },
    "gb_3": {
        "title": "Lindqvist's Tea-Room Offer",
        "subtitle": "Round 3 · The Sovereign Rotunda, London",
        "pre": {
            "gb_3_b1": {
                "text": CLIP_TEXT_BY_ID["lindqvist_london"],
                "voice_clip": "res://assets/voice/lindqvist_london.mp3",
                "tell_hint": "Lindqvist sets down her teacup and slides a wax-sealed folder across the walnut.",
            },
            "gb_3_b2": {
                "text": "Take this redaction cipher, and your opening decoy shatters automatically. Burn it, and you walk out alone.",
                "voice_clip": "res://assets/voice/london_lindqvist_offer_2.mp3",
                "tell_hint": "She removes her platinum glasses—cool, patient, and utterly convinced everyone has a price.",
            },
        },
        "choices": {
            "gb_3_accept_briefing": {
                "label": "Accept the Sealed Folder",
                "response_line": "Sensible. Institutions have long memories for people who appreciate steady hands.",
            },
            "gb_3_burn_briefing": {
                "label": "Decline & Burn It Unopened",
                "response_line": "Very theatrical—just like Mara. Remember this evening when the Rotunda turns chilly.",
            },
        },
        "post": {
            "gb_3_post": {
                "text": "Midnight, Arch 14 under Camden Lock. Come see trivia night with zero board members and twice the espresso.",
                "voice_clip": None,
            },
        },
    },
    "gb_4": {
        "title": "Camden Underground Salon",
        "subtitle": "Round 4 · Arch 14 Underground, London",
        "pre": {
            "gb_4_b1": {
                "text": "Welcome to Mara's favorite pub quiz cellar under Camden Lock. No cameras, no lawyers—just sharp minds and friendly wagers.",
                "voice_clip": None,
                "tell_hint": "String lights glow over brick arches as London's sharpest puzzle-solvers cheer from the booths.",
            },
            "gb_4_b2": {
                "text": "Well, well—Mara's 2:14 AM prodigy slumming it underground. Care to test your nerve without training wheels?",
                "voice_clip": None,
                "tell_hint": "Soren leans against a brick arch, flipping a silver coin with a warm grin.",
            },
        },
        "choices": {
            "gb_4_claim_vault_clue_1": {
                "label": "Claim the Stolen 2019 Manifest",
                "response_line": "'ERASED BY BOARD VOTE.' Fold that into your passport—it's the first real key to Mara's puzzle.",
            },
            "gb_4_buy_nadia_tape": {
                "label": "Trade for Nadia's Research Notes",
                "response_line": "Clever play. Nadia isn't here for the hundred million—she's tracing her missing brother Tariq.",
            },
        },
        "post": {
            "gb_4_post": {
                "text": "Clean sweep. Hope we meet seventy floors up in Tokyo—assuming Nadia lets you leave London alive.",
                "voice_clip": None,
            },
        },
    },
    "gb_5": {
        "title": "London Finale: Face Nadia",
        "subtitle": "City Boss · The Sovereign Rotunda, London",
        "pre": {
            "gb_5_b1": {
                "text": "No more warm-ups. Just your mind against mine under Mara's Sovereign dome—show London you earned your chair.",
                "voice_clip": "res://assets/voice/nadia_on_boss_intro.mp3",
                "tell_hint": "Nadia squares her shoulders—fierce focus, zero malice, pure Queen's Gambit poise.",
            },
            "gb_5_b2": {
                "text": "City Boss Showdown. Win the London Armillary Trophy and carry its secret onto your next flight.",
                "voice_clip": "res://assets/voice/vance_on_boss_intro.mp3",
                "tell_hint": "Julian taps his silver pen beside his ear—quietly rooting for a clean duel.",
            },
        },
        "choices": {
            "gb_5_show_notch": {
                "label": "Show Nadia the 'A.M. — 2019' Engraving",
                "response_line": "Nadia's breath catches. 'That's Tariq's handwriting... Not another word on air. Meet me after the lights drop.'",
            },
            "gb_5_hide_notch": {
                "label": "Quietly Pocket the Engraving for Later",
                "response_line": "You keep the discovery shielded from Lindqvist's cameras while the Rotunda erupts in applause.",
            },
        },
        "post": {
            "gb_5_post": {
                "text": "London belongs to you. Seventy floors of neon rain—and Soren Kael—await in Tokyo.",
                "voice_clip": "res://assets/voice/vance_victory.mp3",
            },
        },
    },
    # --- TOKYO (jp_1..jp_5) ---
    "jp_1": {
        "title": "Neon Speed Qualifier",
        "subtitle": "Round 1 · The Horizon Sky Pavilion, Tokyo",
        "pre": {
            "jp_1_b1": {
                "text": CLIP_TEXT_BY_ID["soren_tokyo_intro"],
                "voice_clip": "res://assets/voice/soren_tokyo_intro.mp3",
                "tell_hint": "Rain streaks the Shibuya glass as Soren rolls a silver coin across his fingers.",
            },
            "jp_1_b2": {
                "text": "Horizon prizes quick reflexes, yet Mara always said calm accuracy beats reckless haste. Enjoy Tokyo.",
                "voice_clip": "res://assets/voice/vance_correct_1.mp3",
                "tell_hint": "Julian smiles warmly from the host podium.",
            },
        },
        "choices": {
            "jp_1_match_pace": {
                "label": "Match Soren's Tempo",
                "response_line": "Now we're having fun! Nothing ruins a seventy-story view like overthinking.",
            },
            "jp_1_watch_hands": {
                "label": "Stay Calm & Read His Coin Tell",
                "response_line": "Watch the silver all you want, detective—you still have to beat my split times.",
            },
        },
        "post": {
            "jp_1_post": {
                "text": "Whoa—check the packet log. Soren locked Question Four in zero-point-eight seconds. Nobody reads that fast.",
                "voice_clip": "res://assets/voice/tokyo_soren_telemetry_1.mp3",
            },
        },
    },
    "jp_2": {
        "title": "Tracing the Hidden Signal",
        "subtitle": "Round 2 · The Horizon Sky Pavilion, Tokyo",
        "pre": {
            "jp_2_b1": {
                "text": "Found it—there's a narrowband signal piggybacking on the bullet-train dampeners straight into Soren's collar.",
                "voice_clip": None,
                "tell_hint": "Teo holds up his tablet waveform, genuinely impressed by the sheer audacity of the rig.",
            },
            "jp_2_b2": {
                "text": "Nice view from the seventy-second floor, right? Down there is Shibuya—up here, information is currency.",
                "voice_clip": "res://assets/voice/tokyo_soren_backstage_1.mp3",
                "tell_hint": "Soren's coin spins fast—he knows you've noticed something.",
            },
        },
        "choices": {
            "jp_2_log_packet": {
                "label": "Save Clean Proof of the Signal",
                "response_line": "Packet log archived. Now step onto the rain terrace holding every card in the deck.",
            },
            "jp_2_clone_key": {
                "label": "Mirror Horizon's Odds Channel",
                "response_line": "Teo raises an eyebrow. 'Careful whose shortcuts you borrow—Mara's will has an ethics clause.'",
            },
        },
        "post": {
            "jp_2_post": {
                "text": "Hang on—how did you beat my split on Question Six without a feed? Step onto the terrace. Let's talk.",
                "voice_clip": None,
            },
        },
    },
    "jp_3": {
        "title": "Soren's Earpiece Crisis",
        "subtitle": "Round 3 · Sky Terrace & Stage, Tokyo",
        "pre": {
            "jp_3_b1": {
                "text": "Caught my Horizon earpiece, did you? Name your price: share my probability lens, or fire a live jammer and play me straight up.",
                "voice_clip": "res://assets/voice/tokyo_soren_confront_1.mp3",
                "tell_hint": "For the first time all night, Soren's silver coin freezes completely flat.",
            },
            "jp_3_b2": {
                "text": "Your call—cut a quiet deal for Horizon's edge, or let me kill his signal live on air and watch him play on pure nerve.",
                "voice_clip": None,
                "tell_hint": "Teo hovers one finger over the broadcast RF cutoff switch.",
            },
        },
        "choices": {
            "jp_3_blackmail_soren": {
                "label": "Share Soren's Probability Lens",
                "response_line": "Smart business, friend. Keep my debt off Lindqvist's desk, and my odds overlay is yours.",
            },
            "jp_3_fire_jammer": {
                "label": "Kill the Signal Live & Play Fair!",
                "response_line": "Static sweeps the pavilion—Soren's earpiece goes dead, and to everyone's shock, he breaks into a huge grin!",
            },
        },
        "post": {
            "jp_3_post": {
                "text": "A live signal jam at seventy stories. Tokyo has never been sharper.",
                "voice_clip": "res://assets/voice/vance_overclock_win.mp3",
            },
        },
    },
    "jp_4": {
        "title": "Skyline Code Breach",
        "subtitle": "Round 4 · The Horizon Sky Pavilion, Tokyo",
        "pre": {
            "jp_4_b1": {
                "text": "Plot twist—Soren's encrypted relay wasn't just streaming odds. It bounced through a dormant vault thirty-eight meters beneath Cairo.",
                "voice_clip": "res://assets/voice/tokyo_teo_decrypt.mp3",
                "tell_hint": "Teo zooms into a subterranean map stamped with Mara Sato's 2019 architectural seal.",
            },
            "jp_4_b2": {
                "text": "Look at the co-signer stamp beside Mara's name. That's Julian Vance's Geneva key—why is he pointing us toward Giza?",
                "voice_clip": None,
                "tell_hint": "Nadia studies the decrypted header—her skepticism of Julian deepening into real curiosity.",
            },
        },
        "choices": {
            "jp_4_copy_coords": {
                "label": "Share the Buried Cairo Blueprint",
                "response_line": "Coordinates saved—thirty-eight meters beneath Cairo's Solar Hall waits Mara's sealed 2019 chamber.",
            },
            "jp_4_purge_trace": {
                "label": "Keep the Coordinates Private for Now",
                "response_line": "Horizon's sweep hits empty air—though Cairo just became a much trickier chess match.",
            },
        },
        "post": {
            "jp_4_post": {
                "text": "A card shark with nothing left to hide is twice as fun to play. Ready for Soren's finale?",
                "voice_clip": None,
            },
        },
    },
    "jp_5": {
        "title": "Tokyo Finale: Face Soren",
        "subtitle": "City Boss · The Horizon Sky Pavilion, Tokyo",
        "pre": {
            "jp_5_b1": {
                "text": "No feed, no odds engine, no excuses—just you, me, and Mara's Origami Trophy seventy stories up.",
                "voice_clip": "res://assets/voice/soren_on_boss_intro.mp3",
                "tell_hint": "Soren grins with genuine respect—tucking his earpiece into his pocket and spinning his coin.",
            },
            "jp_5_b2": {
                "text": "City Boss Showdown. Outthink Tokyo's sharpest gambler and book your ticket for Rio.",
                "voice_clip": "res://assets/voice/vance_on_boss_intro.mp3",
                "tell_hint": "Shibuya's skyline blazes gold through the rain behind the stage.",
            },
        },
        "choices": {
            "jp_5_return_coin": {
                "label": "Slide Soren's Silver Coin Back Across the Table",
                "response_line": "He catches it mid-spin with an honest laugh. 'Watch Rio, friend. Someone on the board is gunning for Nadia.'",
            },
            "jp_5_pocket_coin": {
                "label": "Keep the Coin as Your Tokyo Souvenir",
                "response_line": "Tokyo cheers—while Horizon's syndicate director quietly snaps his tablet shut in the glass box.",
            },
        },
        "post": {
            "jp_5_post": {
                "text": "Act One complete. Ten thousand cheering fans wait under Rio's twilight glass canopy.",
                "voice_clip": "res://assets/voice/vance_victory.mp3",
            },
        },
    },
}


# ============================================================================
# 6. JSON UPDATERS
# ============================================================================
def update_campaign_20hr() -> None:
    data = json.loads(CAMPAIGN_PATH.read_text(encoding="utf-8"))

    # Tagline & Progressive Difficulty Curve
    data["tagline"] = "Dr. Mara Sato left one last puzzle—and eight cities to decide who inherits the truth."
    data["design_pillars"]["progressive_difficulty_curve"] = HUB_DIFFICULTY_CURVE

    # Hubs taglines + difficulty labels
    for hub in data.get("hubs", []):
        hid = hub.get("id")
        if hid in HUB_TAGLINES:
            hub["tagline"] = HUB_TAGLINES[hid]
        if hid in HUB_CURVE_BY_ID:
            hub["difficulty_label"] = HUB_CURVE_BY_ID[hid]["label"]

    # Evidence board clues (preserve exact 12 IDs)
    for cl in data.get("evidence_board", {}).get("clues", []):
        cid = cl.get("id")
        if cid in EVIDENCE_CLUE_UPDATES:
            cl["title"], cl["summary"] = EVIDENCE_CLUE_UPDATES[cid]

    # Act Cutscenes (all 6 acts synced verbatim)
    for cs in data.get("act_cutscenes", []):
        cs_id = cs.get("id")
        if cs_id not in ACT_CUTSCENE_UPDATES:
            continue
        spec = ACT_CUTSCENE_UPDATES[cs_id]
        cs["title"] = spec["title"]
        cs["location"] = spec["location"]
        new_lines = []
        old_by_id = {ln["id"]: ln for ln in cs.get("lines", [])}
        for line_id, spk, expr in spec["lines"]:
            prev = dict(old_by_id.get(line_id, {}))
            prev["id"] = line_id
            prev["speaker"] = spk
            prev["expression"] = expr
            prev["voice_clip"] = f"res://assets/voice/{line_id}.mp3"
            prev["text"] = CLIP_TEXT_BY_ID[line_id]
            spoken = CLIP_SPOKEN_BY_ID.get(line_id)
            if spoken:
                prev["tts_text"] = spoken
            else:
                prev.pop("tts_text", None)
            new_lines.append(prev)
        cs["lines"] = new_lines

    # Voice Manifest sync (cutscene_clips + story_clips)
    vm = data.get("voice_manifest", {})
    for clip in vm.get("cutscene_clips", []):
        cid = clip.get("id")
        if cid in CLIP_TEXT_BY_ID:
            clip["text"] = CLIP_TEXT_BY_ID[cid]
    for clip in vm.get("story_clips", []):
        cid = clip.get("id")
        if cid in CLIP_TEXT_BY_ID:
            clip["text"] = CLIP_TEXT_BY_ID[cid]

    # Relax timers & IRT across ALL 96 missions + polish ch/gb/jp stories
    for m in data.get("missions", []):
        mid = m["id"]
        hid = m["hub_id"]
        curve = HUB_CURVE_BY_ID.get(hid)
        if curve:
            m["time_per_question_sec"] = curve["timer_sec"]
            sched = MISSION_IRT_SCHEDULES.get(hid, {})
            if m.get("optional_side_mission"):
                if "side" in sched:
                    m["irt_b_range"] = list(sched["side"])
                m["difficulty_label"] = f"{curve['label']} · DOSSIER OP"
            else:
                slot_key = str(m.get("rhythm_slot", 1))
                if slot_key in sched:
                    m["irt_b_range"] = list(sched[slot_key])
                m["difficulty_label"] = curve["label"]

        # Avoid playing Geneva intro voice clips on late-game non-Geneva beats
        if mid == "global_1":
            for b in m.get("dialogue_beats", []):
                if b.get("id") == "global_1_b1":
                    b["voice_clip"] = "res://assets/voice/vance_on_boss_intro.mp3"
                elif b.get("id") == "global_1_b2":
                    b["voice_clip"] = "res://assets/voice/teo_on_boss_intro.mp3"
        elif mid == "br_s7":
            for b in m.get("dialogue_beats", []):
                if b.get("id") == "br_s7_b1":
                    b["voice_clip"] = "res://assets/voice/vance_victory.mp3"

        # Apply bespoke Mara Sato dialogue polish on ch_1..5, gb_1..5, jp_1..5
        if mid in MISSION_STORY_UPDATES:
            upd = MISSION_STORY_UPDATES[mid]
            for field in ("title", "subtitle", "pass_goal", "mutator_brief", "cliffhanger_hook"):
                if field in upd:
                    m[field] = upd[field]
            pre_map = upd.get("pre", {})
            for b in m.get("dialogue_beats", []):
                if b["id"] in pre_map:
                    for k, v in pre_map[b["id"]].items():
                        b[k] = v
            post_map = upd.get("post", {})
            for b in m.get("post_match_beats", []):
                if b["id"] in post_map:
                    for k, v in post_map[b["id"]].items():
                        b[k] = v
            ch_map = upd.get("choices", {})
            for ch in m.get("choices", []):
                if ch["id"] in ch_map:
                    for k, v in ch_map[ch["id"]].items():
                        ch[k] = v

    serialized = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    CAMPAIGN_PATH.write_text(serialized, encoding="utf-8")
    godot_campaign = REPO_ROOT / "godot" / "data" / "campaign_20hr.json"
    if godot_campaign.parent.exists():
        godot_campaign.write_text(serialized, encoding="utf-8")
    print(f"[OK] Updated {CAMPAIGN_PATH} (all 6 cutscenes, 96 mission curves, ch/gb/jp stories, clues)")


def _patch_ch_backstage_conv(conv: Dict[str, Any]) -> None:
    cid = conv.get("id")
    nodes = conv.get("nodes", [])
    node_list = nodes if isinstance(nodes, list) else list(nodes.values())
    by_id = {n.get("id"): n for n in node_list}

    if cid == "ch_backstage_vance_summons":
        conv["title"] = "Espresso in Mara's Study"
        conv["locationLabel"] = "Dr. Mara Sato's Study · Geneva"
        if "n1" in by_id:
            by_id["n1"]["text"] = CLIP_TEXT_BY_ID["vance_intro_1"]
            by_id["n1"]["tellHint"] = "Julian pours two espressos beside Mara's 2019 notebook—thumb briefly brushing his left cufflink."
            for o in by_id["n1"].get("options") or by_id["n1"].get("choices") or []:
                if o.get("id") == "ask_why_outsider":
                    o["label"] = "Ask why Mara hid her qualifier in Sunday newspapers"
                    if "responseText" in o:
                        o["responseText"] = CLIP_TEXT_BY_ID["vance_intro_3"]
                elif o.get("id") == "ask_about_endowment":
                    o["label"] = "Ask why Lindqvist's board is fighting Mara's will"
                    if "responseText" in o:
                        o["responseText"] = CLIP_TEXT_BY_ID["vance_intro_2"]
        if "n2_outsider" in by_id:
            by_id["n2_outsider"]["text"] = CLIP_TEXT_BY_ID["vance_intro_3"]
            by_id["n2_outsider"]["tellHint"] = "He taps his silver pen twice—genuinely pleased you read between the lines."
        if "n2_stakes" in by_id:
            by_id["n2_stakes"]["text"] = CLIP_TEXT_BY_ID["vance_intro_2"]
            by_id["n2_stakes"]["tellHint"] = "His fingers rest lightly on Mara's engraved brass pocket watch."
        if "n3_close" in by_id:
            by_id["n3_close"]["text"] = CLIP_TEXT_BY_ID["vance_manifesto"]
            by_id["n3_close"]["tellHint"] = "Julian opens the velvet case holding Mara's brass astrolabe."

    elif cid == "ch_backstage_teo_control_booth":
        conv["title"] = "Espresso in the Control Corridor"
        conv["locationLabel"] = "Mara Sato Studio Console · Geneva"
        if "n1" in by_id:
            by_id["n1"]["expression"] = "neutral"
            by_id["n1"]["portraitUrl"] = "assets/portraits_cutout/teo.png"
            by_id["n1"]["text"] = CLIP_TEXT_BY_ID["teo_whisper"]
            by_id["n1"]["tellHint"] = "Teo adjusts your lapel mic while glancing quizzically at Mara's waking terminal."
            for o in by_id["n1"].get("options") or by_id["n1"].get("choices") or []:
                if o.get("id") == "confront_teo_test":
                    o["label"] = '"Was Mara\'s monitor note a glitch—or did she schedule it for tonight?"'
                elif o.get("id") == "ask_2019_rumor":
                    o["label"] = '"Mara\'s footnote mentioned a 2019 winner. Give me a name."'
        if "n2_vance_enter" in by_id:
            by_id["n2_vance_enter"]["text"] = CLIP_TEXT_BY_ID["vance_leak_react"]
            by_id["n2_vance_enter"]["tellHint"] = "Julian leans against the doorframe with an amused, knowing half-smile."
            for o in by_id["n2_vance_enter"].get("options") or by_id["n2_vance_enter"].get("choices") or []:
                if o.get("id") == "stand_ground_vance":
                    o["label"] = 'Hold Julian\'s gaze—"Then tell me what happened in Mara\'s 2019 prototype."'

    elif cid == "ch_backstage_lindqvist_vetting":
        if "n1" in by_id:
            by_id["n1"]["text"] = "Dr. Sato always did have a flair for eccentric wills. Tell me plainly why an outsider belongs inside the Meridian Archive."
        if "n4_close" in by_id:
            by_id["n4_close"]["text"] = "Ask Julian who co-signed Mara's original vault blueprints. He knows far more about 2019 than he lets on."

    elif cid == "ch_backstage_nadia_soren_lounge":
        if "n1" in by_id:
            by_id["n1"]["text"] = "So you're the 2:14 AM solver from Mara's Sunday cipher. Care to tell us which university or hedge fund secretly sponsors you?"
        if "n3" in by_id:
            by_id["n3"]["text"] = "Just keep your eyes open in London. Word is Mara ran a quiet prototype seven years ago—and the board scrubbed the winner."

    elif cid == "gb_backstage_vance_orrery_memory":
        if "n1" in by_id:
            by_id["n1"]["text"] = "Mara built this celestial orrery with her own hands—three centuries of mechanics reminding committees they do not own the stars."

    elif cid == "jp_backstage_lindqvist_tokyo_envoy":
        if "n1" in by_id:
            by_id["n1"]["text"] = "Now you see Horizon Collective without Mara's romantic nostalgia. Pure velocity worshipped without institutional brakes."


def update_narrative_wave2() -> None:
    w2 = json.loads(WAVE2_PATH.read_text(encoding="utf-8"))

    # 1. Sync 4 Persona Ceremonies (preserve startingPerkId = CLEAN_HANDS on PRODIGY!)
    for p in w2.get("persona_ceremonies", []):
        cid = p.get("voiceClipId")
        if cid in CLIP_TEXT_BY_ID:
            p["text"] = CLIP_TEXT_BY_ID[cid]

    # 2. Sync backstage_hubs, backstage_hubs_all, backstage_conversations
    for conv in (w2.get("backstage_hubs") or {}).values():
        if isinstance(conv, dict):
            _patch_ch_backstage_conv(conv)
    for conv_list in (w2.get("backstage_hubs_all") or {}).values():
        if isinstance(conv_list, list):
            for conv in conv_list:
                if isinstance(conv, dict):
                    _patch_ch_backstage_conv(conv)
    for conv in w2.get("backstage_conversations", []):
        if isinstance(conv, dict):
            _patch_ch_backstage_conv(conv)

    WAVE2_PATH.write_text(json.dumps(w2, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[OK] Updated {WAVE2_PATH} (4 persona ceremonies + Geneva/London/Tokyo backstage scenes)")


# ============================================================================
# 7. NEURAL VOICE REGENERATION (edge-tts + De-Essed FFmpeg Broadcast Mastering)
# ============================================================================
def find_bin(name: str) -> str:
    found = shutil.which(name)
    if found:
        return found
    for folder in (
        Path(r"C:\Program Files\DownloadHelper App"),
        Path(r"C:\Program Files\ffmpeg\bin"),
        Path(r"C:\ffmpeg\bin"),
    ):
        cand = folder / f"{name}.exe"
        if cand.exists():
            return str(cand)
    raise FileNotFoundError(f"Could not locate {name}.exe")


def probe_ebur128(ffmpeg_bin: str, mp3_path: Path) -> Tuple[float, float]:
    eb = subprocess.run(
        [ffmpeg_bin, "-i", str(mp3_path), "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    lufs_v, tp_v = -16.0, -2.5
    for line in reversed(eb.stderr.splitlines()):
        if "Peak:" in line and "dBFS" in line and tp_v == -2.5:
            m = re.search(r"Peak:\s*([-\d.]+)\s*dBFS", line)
            if m:
                tp_v = float(m.group(1))
        if re.search(r"^\s*I:\s*[-\d.]+\s*LUFS", line) and lufs_v == -16.0:
            m = re.search(r"I:\s*([-\d.]+)\s*LUFS", line)
            if m:
                lufs_v = float(m.group(1))
    return lufs_v, tp_v


async def synth_one_clip(
    spec: Tuple[str, str, Optional[str], str, Optional[str]],
    tmp_dir: Path,
    sem: asyncio.Semaphore,
    ffmpeg_bin: str,
    ffprobe_bin: str,
) -> Dict[str, Any]:
    import edge_tts

    clip_id, speaker, prof_override, display_text, spoken_override = spec
    actor = ACTORS[speaker]
    profile = prof_override or actor["profile"]
    fname = f"{clip_id}.mp3"
    out_pub = PUBLIC_VOICE_DIR / fname
    out_god = GODOT_VOICE_DIR / fname
    raw_mp3 = tmp_dir / f"raw_{fname}"

    tts_text = spoken_override or display_text
    async with sem:
        last_err: Optional[Exception] = None
        for attempt in range(4):
            try:
                comm = edge_tts.Communicate(
                    text=tts_text,
                    voice=actor["voice"],
                    rate=actor["rate"],
                    pitch=actor["pitch"],
                )
                await comm.save(str(raw_mp3))
                if raw_mp3.exists() and raw_mp3.stat().st_size > 1500:
                    last_err = None
                    break
            except Exception as exc:
                last_err = exc
                await asyncio.sleep(1.2 + attempt)
        if last_err is not None or not raw_mp3.exists():
            raise RuntimeError(f"Failed edge-tts synthesis for {clip_id}: {last_err}")

    chain = VOICE_FILTER_CHAINS[profile]
    subprocess.run(
        [
            ffmpeg_bin, "-y", "-v", "error",
            "-i", str(raw_mp3),
            "-af", chain,
            "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k", "-write_xing", "1",
            str(out_pub),
        ],
        check=True,
    )
    if GODOT_VOICE_DIR.exists():
        shutil.copy2(out_pub, out_god)

    lufs, tp = probe_ebur128(ffmpeg_bin, out_pub)
    pr = subprocess.run(
        [ffprobe_bin, "-v", "error", "-show_entries", "format=duration,size", "-of", "json", str(out_pub)],
        capture_output=True,
        text=True,
        check=True,
    )
    fmt = json.loads(pr.stdout)["format"]
    dur = round(float(fmt["duration"]), 2)
    size = int(fmt["size"])
    if tp > -1.0:
        raise RuntimeError(f"Clip {fname} exceeded true-peak cap (-1.0 dBTP): {tp:.2f} dBTP")

    print(f"  [VO] {fname:28s} | {speaker:9s} | {dur:5.2f}s | {size:6d} B | {lufs:5.1f} LUFS | TP {tp:5.2f} dBTP")
    return {
        "id": clip_id,
        "file": fname,
        "speaker": speaker,
        "duration_s": dur,
        "size_bytes": size,
        "lufs": round(lufs, 1),
        "true_peak_db": round(tp, 2),
        "text": display_text,
    }


async def regenerate_voice_clips() -> None:
    ffmpeg_bin = find_bin("ffmpeg")
    ffprobe_bin = find_bin("ffprobe")
    print(f"[VO] Regenerating {len(V3_VOICE_CLIPS)} rewritten neural voice clips via edge-tts + FFmpeg...")
    sem = asyncio.Semaphore(5)
    with tempfile.TemporaryDirectory(prefix="ws_v3_vo_") as td:
        results = await asyncio.gather(
            *(synth_one_clip(spec, Path(td), sem, ffmpeg_bin, ffprobe_bin) for spec in V3_VOICE_CLIPS)
        )

    res_by_id = {r["id"]: r for r in results}

    # Sync Wave-2 manifest entries for the 4 regenerated persona clips
    if VO_WAVE2_MANIFEST_PATH.exists():
        manifest = json.loads(VO_WAVE2_MANIFEST_PATH.read_text(encoding="utf-8"))
        for entry in manifest.get("clips", []):
            cid = entry.get("id")
            if cid in res_by_id:
                r = res_by_id[cid]
                entry["duration_s"] = r["duration_s"]
                entry["size_bytes"] = r["size_bytes"]
                entry["lufs"] = r["lufs"]
                entry["true_peak_db"] = r["true_peak_db"]
                entry["text"] = r["text"]
                if "byId" in manifest and cid in manifest["byId"]:
                    manifest["byId"][cid] = dict(entry)
        all_mp3s = sorted(PUBLIC_VOICE_DIR.glob("*.mp3"))
        manifest["totalVoiceFilesOnDisk"] = len(all_mp3s)
        VO_WAVE2_MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        print(f"[OK] Synced {VO_WAVE2_MANIFEST_PATH} (totalVoiceFilesOnDisk={len(all_mp3s)})")

    total_mp3s = len(list(PUBLIC_VOICE_DIR.glob("*.mp3")))
    assert total_mp3s == 144, f"Expected exactly 144 MP3 files in {PUBLIC_VOICE_DIR}, found {total_mp3s}!"
    print(f"[DONE] All {len(results)} v3 voice clips mastered cleanly ({total_mp3s} total MP3s on disk).")


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild v3.0 Mara Sato story JSONs and matched neural VO clips.")
    parser.add_argument("--story-only", action="store_true", help="Only update campaign_20hr.json & narrative_wave2.json")
    parser.add_argument("--voice-only", action="store_true", help="Only regenerate the 33 matched .mp3 voice clips")
    args = parser.parse_args()

    run_story = not args.voice_only
    run_voice = not args.story_only

    if run_story:
        update_campaign_20hr()
        update_narrative_wave2()
    if run_voice:
        asyncio.run(regenerate_voice_clips())


if __name__ == "__main__":
    main()
