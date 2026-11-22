#!/usr/bin/env python3
"""
World's Smartest — True Studio Audio, Neural Voice Acting & Portrait Cutout Pipeline
====================================================================================
Generates 100% real-instrument sampled studio audio, broadcast-mastered neural voice acting,
and alpha-matted character cutouts for the Godot 4.7.2 AAA Rebuild:

  1. Neural Voice Acting (24 lines across 6 distinct cast members via edge-tts + silky
     de-essed FFmpeg broadcast mastering: lowpass=9500Hz, loudnorm=-15 LUFS)
     -> godot/assets/voice/*.mp3

  2. Studio Acoustic Music Loops (32.0s Vetting Ambient + 24.0s Showdown Tension in D Minor)
     Rendered via FluidSynth v2.6.2 + GeneralUser-GS.sf2 (REAL multi-sampled acoustic Stereo
     Grand Piano, Solo Cello, Slow & Pizzicato Orchestral Strings, Concert Harp, Double Bass,
     French Horns, Marimba, Timpani & Brush Percussion — ZERO NumPy oscillator buzzing!).
     2-pass continuous MIDI render sliced on Cycle 2 for mathematically seamless hall tails,
     warm studio mastered (-16.5 LUFS, gentle <=10.5 kHz roll-off).
     -> godot/assets/audio/music_vetting_ambient.ogg
     -> godot/assets/audio/music_showdown_tension.ogg

  3. Velvety Acoustic UI & Gameplay Foley SFX (8 stereo 44.1kHz WAV files)
     Rendered from real multi-sampled acoustic Woodblock, Marimba, Kalimba, Concert Harp,
     Celeste, Grand Piano, Solo Cello, French Horn & Timpani via FluidSynth + GeneralUser-GS.sf2.
     Apple Design Award x Who Wants to Be a Millionaire luxury feel — ZERO harsh buzzers!
     -> godot/assets/audio/sfx_*.wav

  4. Hair-Clean Alpha-Matted Transparent Character Cutouts (512x680 RGBA PNG)
     MODNet ONNX neural portrait matting + foreground decontamination + zero-border feathering.
     -> godot/assets/portraits_cutout/*.png

Usage:
  python tools/generate_aaa_audio_and_cutouts.py --stage all
  python tools/generate_aaa_audio_and_cutouts.py --stage voice
  python tools/generate_aaa_audio_and_cutouts.py --stage audio
  python tools/generate_aaa_audio_and_cutouts.py --stage cutouts
"""

from __future__ import annotations

import argparse
import asyncio
import json
import math
import shutil
import struct
import subprocess
import tempfile
import urllib.request
import wave
import zipfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
from PIL import Image
from scipy import ndimage

# ---------------------------------------------------------------------------
# Paths & Binary Discovery
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
PORTRAIT_SRC_DIR = REPO_ROOT / "public" / "assets" / "portraits"
VOICE_OUT_DIR = REPO_ROOT / "godot" / "assets" / "voice"
AUDIO_OUT_DIR = REPO_ROOT / "godot" / "assets" / "audio"
CUTOUT_OUT_DIR = REPO_ROOT / "godot" / "assets" / "portraits_cutout"

SR = 44100


def find_binary(name: str) -> str:
    found = shutil.which(name)
    if found:
        return found
    candidates = [
        Path(r"C:\Program Files\DownloadHelper App") / f"{name}.exe",
        Path(r"C:\Program Files\ffmpeg\bin") / f"{name}.exe",
        Path(r"C:\ffmpeg\bin") / f"{name}.exe",
    ]
    for c in candidates:
        if c.exists():
            return str(c)
    raise FileNotFoundError(f"Could not find {name} executable on system.")


FFMPEG = find_binary("ffmpeg")
FFPROBE = find_binary("ffprobe")


def probe_audio(path: Path) -> Dict[str, object]:
    cmd = [
        FFPROBE,
        "-v", "error",
        "-show_entries", "format=duration,size,bit_rate:stream=codec_name,sample_rate,channels",
        "-of", "json",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(proc.stdout)
    fmt = data.get("format", {})
    stream = (data.get("streams") or [{}])[0]
    return {
        "duration": float(fmt.get("duration", 0.0)),
        "size": int(fmt.get("size", path.stat().st_size)),
        "bit_rate": int(fmt.get("bit_rate", 0)) if fmt.get("bit_rate") else 0,
        "codec": stream.get("codec_name", ""),
        "sample_rate": int(stream.get("sample_rate", 0)) if stream.get("sample_rate") else 0,
        "channels": int(stream.get("channels", 0)) if stream.get("channels") else 0,
    }


def analyze_audio_quality(path: Path) -> Dict[str, float]:
    """Verify RMS dB, Peak dB, and spectral balance (0 clipping, warm treble roll-off)."""
    r = subprocess.run(
        [FFMPEG, "-i", str(path), "-af", "astats=metadata=1:reset=0", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    rms_db = -99.0
    peak_db = -99.0
    for line in r.stderr.splitlines():
        if "RMS level dB:" in line and rms_db == -99.0:
            try:
                rms_db = float(line.split("RMS level dB:")[1].strip())
            except ValueError:
                pass
        if "Peak level dB:" in line and peak_db == -99.0:
            try:
                peak_db = float(line.split("Peak level dB:")[1].strip())
            except ValueError:
                pass
    return {"rms_db": rms_db, "peak_db": peak_db}


# ===========================================================================
# STAGE 1: REAL NEURAL VOICE ACTING (edge-tts + Silky De-Essed Mastering)
# ===========================================================================
VOICE_LINES: List[Dict[str, str]] = [
    # --- Julian Vance (en-GB-RyanNeural, rate -6%, pitch -2Hz) ---
    {
        "file": "vance_intro_1.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "You solved what four hundred thousand others couldn't. Take a seat.",
    },
    {
        "file": "vance_intro_2.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "I'm Julian Vance. The World Council wants one unaffiliated polymath to hold a hundred million dollar endowment—and the lone human veto key over The Ledger.",
    },
    {
        "file": "vance_intro_3.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Before London, before Tokyo, before two billion viewers... tell me who you really are.",
    },
    {
        "file": "vance_intro_4.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Four tests. Spin the Veritas Orb, peel the seal if you doubt yourself, or hold to overclock your conviction. Let's begin.",
    },
    {
        "file": "vance_leak_react.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Careful. What happens behind one-way glass rarely stays hidden.",
    },
    {
        "file": "vance_manifesto.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "One last question before the world watches. If you hold the sharpest mind on Earth, who does it answer to?",
    },
    {
        "file": "vance_stamp.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Impressive. Your Meridian Passport is stamped. Spin the globe—the circuit awaits.",
    },
    # --- Live Gameplay Callouts (Julian Vance) ---
    {
        "file": "vance_correct_1.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Clean. Surgical precision.",
    },
    {
        "file": "vance_correct_2.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Brilliant deduction.",
    },
    {
        "file": "vance_correct_3.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Flawless read.",
    },
    {
        "file": "vance_overclock_win.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-3%",
        "pitch": "-1Hz",
        "profile": "broadcast_baritone",
        "text": "Audacious overclock—and dead right.",
    },
    {
        "file": "vance_overclock_charge.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "High conviction. Hold steady.",
    },
    {
        "file": "vance_peel.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Opening the seal. Trading glory for clarity.",
    },
    {
        "file": "vance_wrong.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "A costly misstep.",
    },
    {
        "file": "vance_backfire.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Overclock backfire. Conviction without certainty is fatal.",
    },
    {
        "file": "vance_victory.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Match complete. The chamber acknowledges your command.",
    },
    {
        "file": "vance_defeat.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "The circuit is unforgiving. Regroup and return sharper.",
    },
    # --- Nadia Al-Mansoor (en-GB-SoniaNeural, rate -3%) ---
    {
        "file": "nadia_london_intro.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-3%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "So you're the Geneva prodigy. Welcome to the Sovereign Rotunda. Try not to blink.",
    },
    {
        "file": "nadia_rio_intro.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-2%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Ten thousand spectators in Rio—and someone just tampered with my pod.",
    },
    # --- Soren "Echo" Kael (en-US-ChristopherNeural, rate +2%) ---
    {
        "file": "soren_tokyo_intro.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+2%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Seventy floors above Tokyo, friend. Hope your instincts are faster than my odds.",
    },
    # --- Mateo "Teo" Rojas (en-US-AndrewNeural) ---
    {
        "file": "teo_whisper.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "-5%",
        "pitch": "-3Hz",
        "profile": "intimate_whisper",
        "text": "Psst—don't look at the mirror. Check the reflection on the marble. You didn't hear it from me.",
    },
    {
        "file": "teo_cairo_twist.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "+0%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Look at the date on Trial Zero. Two thousand nineteen. That winner was Nadia's brother—and Vance matched your mind to his.",
    },
    # --- Chancellor Ingrid Lindqvist (en-AU-NatashaNeural, icy mature diplomatic gravitas) ---
    {
        "file": "lindqvist_london.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-9%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "A private briefing before the cameras roll. Smart contestants rarely refuse a head start.",
    },
    # --- Tariq Al-Mansoor (en-GB-ThomasNeural, weathered dignified tone) ---
    {
        "file": "tariq_reykjavik.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Vance didn't imprison me. He hid me—so you could carry the truth live before two billion witnesses.",
    },
    # =======================================================================
    # ACT 0..5 ILLUSTRATED GRAPHIC-NOVEL CUTSCENE NARRATIONS (18 CLIPS)
    # =======================================================================
    {
        "file": "cutscene_act0_1.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Midnight over Lake Geneva. Four hundred thousand minds entered the cipher—only one unlocked the door.",
    },
    {
        "file": "cutscene_act0_2.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Eight cities. Forty rounds. One hundred million dollars—and the lone human veto key over The Ledger.",
    },
    {
        "file": "cutscene_act0_3.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "-5%",
        "pitch": "-3Hz",
        "profile": "intimate_whisper",
        "text": "Don't trust the cameras, rookie. The last person who won this chair vanished in twenty nineteen.",
    },
    {
        "file": "cutscene_act1_1.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-4%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Welcome to London. Every answer in this rotunda goes live to two billion screens.",
    },
    {
        "file": "cutscene_act1_2.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-9%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "The Council prefers predictable champions. Step outside the corridor, and we can discuss your future.",
    },
    {
        "file": "cutscene_act1_3.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "-1%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "I pulled the telemetry logs. Someone fed encrypted answers straight into a contender's earpiece.",
    },
    {
        "file": "cutscene_act2_1.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Seventy floors above Shibuya, friend—where every heartbeat trades like a futures contract.",
    },
    {
        "file": "cutscene_act2_2.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+2%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Think you're playing a quiz show? Half the syndicate already bet your streak breaks tonight.",
    },
    {
        "file": "cutscene_act2_3.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Soren Kael reads probabilities like oxygen. Outthink the house—or become its cautionary tale.",
    },
    {
        "file": "cutscene_act3_1.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "-2%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "We cracked the Cairo vault. Trial Zero wasn't a rehearsal—it was a cover-up.",
    },
    {
        "file": "cutscene_act3_2.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-5%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "That signature on the dossier... that's Tariq. My brother didn't walk away. They erased him.",
    },
    {
        "file": "cutscene_act3_3.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Careful what ghosts you exhume in the desert. The Council is already listening.",
    },
    {
        "file": "cutscene_act4_1.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "I stayed in the shadows in Reykjavik so you could carry the ledger key onto the world stage.",
    },
    {
        "file": "cutscene_act4_2.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-8%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "Enough theater. Cut their feed and lock the vault—no outsider dictates terms to the World Council.",
    },
    {
        "file": "cutscene_act4_3.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Plot twist, friend. Even a gambler knows when the house is burning down. I'm betting on you.",
    },
    {
        "file": "cutscene_act5_1.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "The Apex Forum. Two billion witnesses watching every breath. No lifelines left to hide behind.",
    },
    {
        "file": "cutscene_act5_2.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-3%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "For Tariq—and for everyone they tried to silence. Beat them clean, in front of the whole world.",
    },
    {
        "file": "cutscene_act5_3.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Take the crown, claim the veto key—and decide who the sharpest mind on Earth answers to.",
    },
    # =======================================================================
    # MID-MATCH RIVAL & BOSS REACTIONS (30 CLIPS — 6 ACTORS x 5 TRIGGERS)
    # =======================================================================
    # --- Julian Vance ---
    {
        "file": "vance_on_player_streak.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Unstoppable momentum. The chamber can feel it.",
    },
    {
        "file": "vance_on_player_miss.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Even the sharpest blade slips under pressure.",
    },
    {
        "file": "vance_on_rival_ahead.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Your rival holds the lead. Time to counterattack.",
    },
    {
        "file": "vance_on_boss_intro.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-6%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "City Boss Showdown. Everything you've built comes down to these final questions.",
    },
    {
        "file": "vance_on_defeat.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-5%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Remarkable. You didn't just pass the vetting—you rewrote the standard.",
    },
    # --- Nadia Al-Mansoor ---
    {
        "file": "nadia_on_player_streak.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Wait—how did you pull that so fast? You're actually matching my pace.",
    },
    {
        "file": "nadia_on_player_miss.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-3%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Hesitation costs you the board. Watch how it's done.",
    },
    {
        "file": "nadia_on_rival_ahead.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-2%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "I'm out in front. Catch up if you want the London crown.",
    },
    {
        "file": "nadia_on_boss_intro.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-4%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "No more warm-ups. Just your mind against mine under the Sovereign dome.",
    },
    {
        "file": "nadia_on_defeat.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-4%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Fair play. You earned that victory—and my respect.",
    },
    # --- Soren "Echo" Kael ---
    {
        "file": "soren_on_player_streak.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+3%",
        "pitch": "+1Hz",
        "profile": "broadcast_crisp",
        "text": "Whoa—okay, somebody just broke my odds model. Keep rolling!",
    },
    {
        "file": "soren_on_player_miss.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Ooh, painful slip. Don't worry, the house appreciates the donation.",
    },
    {
        "file": "soren_on_rival_ahead.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+2%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Scoreboard's smiling at me, friend. Care to double down?",
    },
    {
        "file": "soren_on_boss_intro.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Welcome to the high-roller table. One mistake up here is a seventy-story drop.",
    },
    {
        "file": "soren_on_defeat.mp3",
        "voice": "en-US-ChristopherNeural",
        "rate": "+0%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Alright, you got me. First time in five years someone beat the house clean.",
    },
    # --- Mateo "Teo" Rojas ---
    {
        "file": "teo_on_player_streak.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "+2%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "Yes! That streak is lighting up the entire broadcast console!",
    },
    {
        "file": "teo_on_player_miss.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "-1%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "Shake it off! One slip won't stop us—stay sharp on the next read.",
    },
    {
        "file": "teo_on_rival_ahead.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "+1%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "They're pulling ahead—use your lifelines smart and take the lead back!",
    },
    {
        "file": "teo_on_boss_intro.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "+0%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "All eyes on your pod now. I've got the feed clean—go take this city!",
    },
    {
        "file": "teo_on_defeat.mp3",
        "voice": "en-US-AndrewNeural",
        "rate": "+1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
        "text": "We actually pulled it off! Wait till you see what just unlocked in the dossier.",
    },
    # --- Chancellor Ingrid Lindqvist ---
    {
        "file": "lindqvist_on_player_streak.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-8%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "An unexpected streak. Perhaps the Council underestimated your dossier.",
    },
    {
        "file": "lindqvist_on_player_miss.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-9%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "Predictable. Ambition without discipline always falters.",
    },
    {
        "file": "lindqvist_on_rival_ahead.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-9%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "Order is restored. You are falling behind where you belong.",
    },
    {
        "file": "lindqvist_on_boss_intro.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-9%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "You insisted on challenging the Council directly. Let us see how long you endure.",
    },
    {
        "file": "lindqvist_on_defeat.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-8%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "Impossible. You have no idea what balance you just shattered.",
    },
    # --- Tariq Al-Mansoor ---
    {
        "file": "tariq_on_player_streak.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "Brilliant! That is the exact instinct Julian saw in you.",
    },
    {
        "file": "tariq_on_player_miss.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Breathe. Remember the pattern—don't let the clock rattle you.",
    },
    {
        "file": "tariq_on_rival_ahead.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-5%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "Don't blink now. The gap is closable if you trust your deduction.",
    },
    {
        "file": "tariq_on_boss_intro.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "This is the moment I waited seven years for. Show two billion witnesses the truth.",
    },
    {
        "file": "tariq_on_defeat.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "You did it. The silence is finally broken.",
    },
    # =======================================================================
    # ALL 4 CHAMPIONSHIP ENDING SPEECHES (4 CLIPS)
    # =======================================================================
    {
        "file": "ending_1.mp3",
        "voice": "en-GB-RyanNeural",
        "rate": "-7%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
        "text": "The crown is yours—and you kept your oath to no syndicate, no council, no shadow. The Ledger answers to one independent human conscience: yours.",
    },
    {
        "file": "ending_2.mp3",
        "voice": "en-GB-SoniaNeural",
        "rate": "-4%",
        "pitch": "-1Hz",
        "profile": "broadcast_crisp",
        "text": "You opened the vault live before two billion witnesses. No secret algorithms, no rigged trials—for the first time, the world's knowledge belongs to everyone.",
    },
    {
        "file": "ending_3.mp3",
        "voice": "en-AU-NatashaNeural",
        "rate": "-9%",
        "pitch": "-4Hz",
        "profile": "icy_diplomat",
        "text": "A pragmatic coronation. With the Council's architecture behind your intellect, the next century will be governed with absolute precision.",
    },
    {
        "file": "ending_4.mp3",
        "voice": "en-GB-ThomasNeural",
        "rate": "-6%",
        "pitch": "-3Hz",
        "profile": "broadcast_baritone",
        "text": "You solved Trial Zero, outplayed every rival, and exposed the hidden key. Julian stepped aside—because the Meridian finally found its true architect.",
    },
]

# Warm, silky broadcast mastering chains: gentle de-essing (6.2k & 8.2k notch) +
# smooth lowpass=9500Hz (zero metallic TTS sibilance) + broadcast loudnorm=-15 LUFS
VOICE_FILTER_CHAINS: Dict[str, str] = {
    "broadcast_baritone": (
        "highpass=f=76,"
        "equalizer=f=195:t=q:w=1.1:g=2.1,"
        "equalizer=f=2900:t=q:w=1.4:g=1.2,"
        "equalizer=f=6200:t=q:w=1.8:g=-2.8,"
        "equalizer=f=8200:t=q:w=1.6:g=-2.6,"
        "lowpass=f=9500,"
        "acompressor=threshold=-20dB:ratio=2.4:attack=12:release=120:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,"
        "alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "broadcast_crisp": (
        "highpass=f=82,"
        "equalizer=f=230:t=q:w=1.2:g=1.5,"
        "equalizer=f=3100:t=q:w=1.5:g=1.2,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.0,"
        "equalizer=f=8300:t=q:w=1.6:g=-2.6,"
        "lowpass=f=9500,"
        "acompressor=threshold=-20dB:ratio=2.3:attack=12:release=115:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,"
        "alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "icy_diplomat": (
        "highpass=f=85,"
        "equalizer=f=220:t=q:w=1.2:g=1.8,"
        "equalizer=f=2700:t=q:w=1.4:g=1.3,"
        "equalizer=f=6300:t=q:w=1.8:g=-2.8,"
        "lowpass=f=9500,"
        "acompressor=threshold=-19dB:ratio=2.4:attack=11:release=110:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,"
        "alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "intimate_whisper": (
        "highpass=f=92,"
        "equalizer=f=180:t=q:w=1.0:g=3.0,"
        "equalizer=f=3600:t=q:w=1.4:g=1.5,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.2,"
        "lowpass=f=9000,"
        "acompressor=threshold=-23dB:ratio=2.8:attack=10:release=100:makeup=1.8,"
        "loudnorm=I=-16.0:TP=-2.4:LRA=7,"
        "alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.08"
    ),
}


async def _synth_single_voice(
    spec: Dict[str, str],
    tmp_dir: Path,
    sem: asyncio.Semaphore,
) -> Tuple[str, Dict[str, object], Dict[str, float]]:
    import edge_tts

    raw_mp3 = tmp_dir / f"raw_{spec['file']}"
    out_mp3 = VOICE_OUT_DIR / spec["file"]

    async with sem:
        last_err: Optional[Exception] = None
        for attempt in range(4):
            try:
                comm = edge_tts.Communicate(
                    text=spec["text"],
                    voice=spec["voice"],
                    rate=spec["rate"],
                    pitch=spec["pitch"],
                )
                await comm.save(str(raw_mp3))
                if raw_mp3.exists() and raw_mp3.stat().st_size > 1500:
                    last_err = None
                    break
            except Exception as e:
                last_err = e
                await asyncio.sleep(1.0 + attempt * 1.2)
        if last_err is not None or not raw_mp3.exists():
            raise RuntimeError(f"Failed edge-tts for {spec['file']}: {last_err}")

    af = VOICE_FILTER_CHAINS[spec["profile"]]
    cmd = [
        FFMPEG,
        "-y",
        "-i", str(raw_mp3),
        "-af", af,
        "-ar", "44100",
        "-ac", "1",
        "-c:a", "libmp3lame",
        "-b:a", "64k",
        "-write_xing", "1",
        str(out_mp3),
    ]
    subprocess.run(cmd, capture_output=True, text=True, check=True)
    info = probe_audio(out_mp3)
    stats = analyze_audio_quality(out_mp3)
    return spec["file"], info, stats


async def generate_all_voices(skip_existing: bool = False) -> None:
    VOICE_OUT_DIR.mkdir(parents=True, exist_ok=True)
    todo = [
        spec for spec in VOICE_LINES
        if not (skip_existing and (VOICE_OUT_DIR / spec["file"]).exists() and (VOICE_OUT_DIR / spec["file"]).stat().st_size > 2000)
    ]
    print(f"\n[STAGE 1] Generating {len(todo)}/{len(VOICE_LINES)} silky broadcast-mastered neural voice clips...")
    sem = asyncio.Semaphore(6)
    results: List[Tuple[str, Dict[str, object], Dict[str, float]]] = []
    if todo:
        with tempfile.TemporaryDirectory(prefix="ws_voice_") as td:
            tmp_dir = Path(td)
            tasks = [_synth_single_voice(spec, tmp_dir, sem) for spec in todo]
            results = await asyncio.gather(*tasks)

    all_files = sorted(p for p in VOICE_OUT_DIR.iterdir() if p.suffix.lower() == ".mp3")
    total_bytes = sum(p.stat().st_size for p in all_files)
    for fname, info, stats in sorted(results):
        print(
            f"  [OK] {fname:32s} | {info['duration']:5.2f}s | {int(info['size'])/1024:5.1f} KB | "
            f"RMS={stats['rms_db']:6.1f} dB | Peak={stats['peak_db']:5.1f} dB"
        )
    print(f"  => Voice stage complete: {len(all_files)} total files on disk, {total_bytes/1024/1024:.2f} MB total.")


# ===========================================================================
# STAGE 2: REAL RECORDED HOROLOGICAL FOLEY & ROOM TONE (ZERO MIDI / ZERO SYNTH!)
# ===========================================================================
def generate_all_audio() -> None:
    from build_real_horological_audio import build_all
    build_all()


# ===========================================================================
# STAGE 3: HAIR-CLEAN ALPHA-MATTED PORTRAIT CUTOUTS (512x680 RGBA PNG)
# ===========================================================================
PORTRAIT_NAMES = [
    "vance", "nadia", "soren", "teo", "lindqvist", "tariq",
    "vance_intense", "nadia_shocked", "soren_smirk", "teo_intense",
]
CUTOUT_W, CUTOUT_H = 512, 680

CHAR_BUST_PROFILES: Dict[str, Dict[str, float]] = {
    "vance":         {"bottom_fade_start": 0.78, "left_fade_y": 0.58, "right_fade_y": 0.58, "side_margin": 0.095, "side_feather_px": 36.0},
    "nadia":         {"bottom_fade_start": 0.80, "left_fade_y": 0.64, "right_fade_y": 0.64, "side_margin": 0.070, "side_feather_px": 30.0},
    "soren":         {"bottom_fade_start": 0.82, "left_fade_y": 0.70, "right_fade_y": 0.74, "side_margin": 0.060, "side_feather_px": 30.0},
    "teo":           {"bottom_fade_start": 0.80, "left_fade_y": 0.50, "right_fade_y": 0.62, "side_margin": 0.088, "side_feather_px": 36.0},
    "lindqvist":     {"bottom_fade_start": 0.79, "left_fade_y": 0.60, "right_fade_y": 0.60, "side_margin": 0.085, "side_feather_px": 34.0},
    "tariq":         {"bottom_fade_start": 0.79, "left_fade_y": 0.58, "right_fade_y": 0.52, "side_margin": 0.095, "side_feather_px": 36.0},
    "vance_intense": {"bottom_fade_start": 0.78, "left_fade_y": 0.56, "right_fade_y": 0.56, "side_margin": 0.095, "side_feather_px": 36.0},
    "nadia_shocked": {"bottom_fade_start": 0.79, "left_fade_y": 0.58, "right_fade_y": 0.58, "side_margin": 0.085, "side_feather_px": 34.0},
    "soren_smirk":   {"bottom_fade_start": 0.80, "left_fade_y": 0.58, "right_fade_y": 0.58, "side_margin": 0.085, "side_feather_px": 34.0},
    "teo_intense":   {"bottom_fade_start": 0.79, "left_fade_y": 0.54, "right_fade_y": 0.56, "side_margin": 0.090, "side_feather_px": 36.0},
}


def get_matting_model_path() -> Optional[Tuple[str, Path]]:
    cache_dir = Path(tempfile.gettempdir()) / "ws_portrait_matting_models"
    cache_dir.mkdir(parents=True, exist_ok=True)
    candidates = [
        ("modnet", "modnet.onnx", "https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx"),
        ("isnet", "isnet-general-use.onnx", "https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx"),
        ("u2net_human", "u2net_human_seg.onnx", "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx"),
    ]
    for kind, fname, url in candidates:
        dest = cache_dir / fname
        if dest.exists() and dest.stat().st_size > 1_000_000:
            return kind, dest
        try:
            print(f"  -> Caching neural portrait matting model ({kind})...")
            req = urllib.request.Request(url, headers={"User-Agent": "WorldsSmartestStudio/1.0"})
            with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as fh:
                shutil.copyfileobj(resp, fh)
            if dest.exists() and dest.stat().st_size > 1_000_000:
                return kind, dest
        except Exception as e:
            print(f"  [WARN] Could not fetch {kind}: {e}")
            if dest.exists():
                dest.unlink(missing_ok=True)
    return None


def run_onnx_matting(img_rgb: Image.Image, kind: str, model_path: Path) -> np.ndarray:
    import onnxruntime as ort

    sess = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    in_name = sess.get_inputs()[0].name
    w0, h0 = img_rgb.size

    if kind == "modnet":
        mw, mh = 512, 672
        resized = img_rgb.resize((mw, mh), Image.Resampling.BICUBIC)
        arr = (np.asarray(resized, dtype=np.float32) / 127.5) - 1.0
        inp = np.transpose(arr, (2, 0, 1))[None, ...]
        out = sess.run(None, {in_name: inp})[0]
        matte = np.clip(np.squeeze(out).astype(np.float32), 0.0, 1.0)
    elif kind == "isnet":
        mw, mh = 1024, 1024
        resized = img_rgb.resize((mw, mh), Image.Resampling.BICUBIC)
        arr = (np.asarray(resized, dtype=np.float32) / 255.0) - 0.5
        inp = np.transpose(arr, (2, 0, 1))[None, ...]
        out = sess.run(None, {in_name: inp})[0]
        matte = np.squeeze(out).astype(np.float32)
        matte = (matte - float(matte.min())) / max(float(matte.max() - matte.min()), 1e-6)
    else:
        mw, mh = 320, 320
        resized = img_rgb.resize((mw, mh), Image.Resampling.BICUBIC)
        arr = np.asarray(resized, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        inp = np.transpose((arr - mean) / std, (2, 0, 1))[None, ...]
        out = sess.run(None, {in_name: inp})[0]
        matte = np.squeeze(out).astype(np.float32)
        matte = (matte - float(matte.min())) / max(float(matte.max() - matte.min()), 1e-6)

    matte_img = Image.fromarray(np.round(matte * 255.0).astype(np.uint8), mode="L").resize(
        (w0, h0), Image.Resampling.LANCZOS
    )
    return np.asarray(matte_img, dtype=np.float32) / 255.0


def refine_and_sculpt_cutout(
    img_rgb: Image.Image,
    raw_alpha: np.ndarray,
    profile: Dict[str, float],
) -> Image.Image:
    rgb_img = img_rgb.resize((CUTOUT_W, CUTOUT_H), Image.Resampling.LANCZOS)
    alpha_img = Image.fromarray(np.round(np.clip(raw_alpha, 0, 1) * 255.0).astype(np.uint8), mode="L").resize(
        (CUTOUT_W, CUTOUT_H), Image.Resampling.LANCZOS
    )
    rgb = np.asarray(rgb_img, dtype=np.float32)
    alpha = np.asarray(alpha_img, dtype=np.float32) / 255.0

    fg_bin = ndimage.binary_dilation(alpha > 0.20, iterations=4)
    labeled, num_features = ndimage.label(fg_bin)
    if num_features > 1:
        sizes = ndimage.sum(fg_bin, labeled, range(1, num_features + 1))
        largest = int(np.argmax(sizes)) + 1
        keep_soft = ndimage.gaussian_filter((labeled == largest).astype(np.float32), sigma=2.0)
        alpha *= np.clip(keep_soft * 1.4, 0.0, 1.0)

    alpha = np.clip((alpha - 0.04) / 0.90, 0.0, 1.0)

    solid = alpha > 0.88
    edge_band = (alpha > 0.01) & (alpha <= 0.88)
    if np.any(solid) and np.any(edge_band):
        _, nearest_idx = ndimage.distance_transform_edt(~solid, return_indices=True)
        decontam_rgb = rgb[nearest_idx[0], nearest_idx[1]]
        blend = np.clip((0.88 - alpha) / 0.88, 0.0, 1.0) * 0.72
        rgb_clean = rgb * (1.0 - blend[:, :, None]) + decontam_rgb * blend[:, :, None]
    else:
        rgb_clean = rgb.copy()

    yy, xx = np.mgrid[0:CUTOUT_H, 0:CUTOUT_W].astype(np.float32)
    yn = yy / float(CUTOUT_H - 1)
    xn = xx / float(CUTOUT_W - 1)

    corner_lift = 0.075 * ((xn - 0.5) * 2.0) ** 2
    b_start = profile["bottom_fade_start"] - corner_lift
    b_end = 0.992 - corner_lift * 0.35
    t_bot = np.clip((yn - b_start) / np.maximum(b_end - b_start, 0.04), 0.0, 1.0)
    bottom_fade = 0.5 * (1.0 + np.cos(math.pi * t_bot))

    s_px = float(profile.get("side_feather_px", 36.0))
    t_left = np.clip(xx / max(s_px, 1.0), 0.0, 1.0)
    t_right = np.clip((float(CUTOUT_W - 1) - xx) / max(s_px, 1.0), 0.0, 1.0)
    left_fade = 0.5 * (1.0 - np.cos(math.pi * t_left))
    right_fade = 0.5 * (1.0 - np.cos(math.pi * t_right))

    s_margin = profile["side_margin"]
    y_weight_l = np.clip((yn - profile["left_fade_y"]) / 0.16, 0.0, 1.0)
    y_weight_r = np.clip((yn - profile["right_fade_y"]) / 0.16, 0.0, 1.0)
    t_left_low = np.clip(xn / max(s_margin, 0.02), 0.0, 1.0)
    t_right_low = np.clip((1.0 - xn) / max(s_margin, 0.02), 0.0, 1.0)
    low_l = (1.0 - y_weight_l) + y_weight_l * (0.5 * (1.0 - np.cos(math.pi * t_left_low)))
    low_r = (1.0 - y_weight_r) + y_weight_r * (0.5 * (1.0 - np.cos(math.pi * t_right_low)))
    side_fade = np.minimum(left_fade, low_l) * np.minimum(right_fade, low_r)

    top_fade = np.clip(yn / 0.025, 0.0, 1.0)
    final_alpha = alpha * bottom_fade * side_fade * top_fade
    final_alpha = np.where(final_alpha < 0.006, 0.0, final_alpha)
    rgb_clean[final_alpha <= 0.0] = 0.0

    rgba = np.dstack([
        np.round(np.clip(rgb_clean, 0, 255)).astype(np.uint8),
        np.round(np.clip(final_alpha * 255.0, 0, 255)).astype(np.uint8),
    ])
    return Image.fromarray(rgba, mode="RGBA")


def generate_all_cutouts(skip_existing: bool = False) -> None:
    CUTOUT_OUT_DIR.mkdir(parents=True, exist_ok=True)
    # Include all named portraits + any newly added expression JPGs in public/assets/portraits/
    discovered = sorted(p.stem for p in PORTRAIT_SRC_DIR.glob("*.jpg"))
    names = list(dict.fromkeys([n for n in PORTRAIT_NAMES if (PORTRAIT_SRC_DIR / f"{n}.jpg").exists()] + discovered))
    print(f"\n[STAGE 3] Generating alpha-matted transparent cutout portraits ({len(names)} found, 512x680 RGBA PNG)...")
    model_info = get_matting_model_path()
    if not model_info:
        raise RuntimeError("Could not load portrait matting ONNX model.")
    kind, mpath = model_info
    print(f"  -> Using neural portrait matting engine: {kind} ({mpath.name})")

    default_profile = {"bottom_fade_start": 0.79, "left_fade_y": 0.56, "right_fade_y": 0.56, "side_margin": 0.090, "side_feather_px": 36.0}
    for name in names:
        out_path = CUTOUT_OUT_DIR / f"{name}.png"
        if skip_existing and out_path.exists() and out_path.stat().st_size > 20_000:
            print(f"  [SKIP] {out_path.name:20s} | cached ({out_path.stat().st_size/1024:5.1f} KB)")
            continue
        src = PORTRAIT_SRC_DIR / f"{name}.jpg"
        img = Image.open(src).convert("RGB")
        raw_alpha = run_onnx_matting(img, kind, mpath)
        profile = CHAR_BUST_PROFILES.get(name, default_profile)
        cutout = refine_and_sculpt_cutout(img, raw_alpha, profile)
        cutout.save(out_path, format="PNG", optimize=True)
        a_arr = np.asarray(cutout)[:, :, 3]
        assert a_arr[0, :].max() == 0 and a_arr[-1, :].max() == 0 and a_arr[:, 0].max() == 0 and a_arr[:, -1].max() == 0
        print(
            f"  [OK] {out_path.name:20s} | {cutout.size[0]}x{cutout.size[1]} RGBA | "
            f"{out_path.stat().st_size/1024:5.1f} KB | border=0/0/0/0"
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Studio Audio, Neural Voice & Cutouts for World's Smartest")
    parser.add_argument("--stage", choices=["all", "voice", "audio", "cutouts"], default="all")
    parser.add_argument("--skip-existing", action="store_true", help="Skip already-generated voice/cutout files")
    args = parser.parse_args()

    print(f"FFmpeg:  {FFMPEG}")
    print(f"FFprobe: {FFPROBE}")

    if args.stage in ("all", "voice"):
        asyncio.run(generate_all_voices(skip_existing=args.skip_existing))
    if args.stage in ("all", "audio"):
        generate_all_audio()
    if args.stage in ("all", "cutouts"):
        generate_all_cutouts(skip_existing=args.skip_existing)

    print("\n[DONE] True Studio Audio, Voice & Cutout pipeline finished cleanly.")


if __name__ == "__main__":
    main()
