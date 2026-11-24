#!/usr/bin/env python3
"""
World's Smartest v5.0 — 10-Voice Broadcast Cast VO Production Pipeline
======================================================================
Generates 132 studio-mastered spoken voice clips across Host Max Sterling,
Producer Sam, and all 8 Tour Challengers using `edge-tts` neural voices +
FFmpeg broadcast mastering (`-15.5 LUFS`, `TP <= -1.5 dBTP`, crisp de-essing,
and tight silence trim).

Outputs (STRICT 1:1 parity):
  - `public/assets/voice/v5/*.mp3` (132 mono 44.1 kHz 64 kbps MP3 clips)
  - `public/data/v5_voice_manifest.json` (`VoiceManifestV5` contract)

Usage:
  python tools/build_v5_cast_voiceover.py
  python tools/build_v5_cast_voiceover.py --skip-existing
  python tools/build_v5_cast_voiceover.py --only vo_cold_1 vo_frankie_walkout
"""

from __future__ import annotations

import argparse
import asyncio
import datetime as dt
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_VOICE_DIR = REPO_ROOT / "public" / "assets" / "voice" / "v5"
MANIFEST_PATH = REPO_ROOT / "public" / "data" / "v5_voice_manifest.json"

# ============================================================================
# 1. 10 DISTINCT CAST VOICE PROFILES (edge-tts + Per-Voice Broadcast EQ)
# ============================================================================
ACTORS: Dict[str, Dict[str, str]] = {
    "max_sterling": {
        "voice": "en-US-AndrewMultilingualNeural",
        "rate": "+4%",
        "pitch": "+0Hz",
        "profile": "broadcast_host",
    },
    "producer_sam": {
        "voice": "en-US-AriaNeural",
        "rate": "+3%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
    },
    "frankie_russo": {
        "voice": "en-US-GuyNeural",
        "rate": "+2%",
        "pitch": "-3Hz",
        "profile": "grit_baritone",
    },
    "denise_park": {
        "voice": "en-GB-SoniaNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_crisp",
    },
    "trevor_blake": {
        "voice": "en-US-ChristopherNeural",
        "rate": "+5%",
        "pitch": "+0Hz",
        "profile": "broadcast_host",
    },
    "priya_nair": {
        "voice": "en-IN-NeerjaNeural",
        "rate": "+2%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
    },
    "alistair_finch": {
        "voice": "en-GB-RyanNeural",
        "rate": "-4%",
        "pitch": "-2Hz",
        "profile": "broadcast_baritone",
    },
    "kenji_takahashi": {
        "voice": "en-US-BrianNeural",
        "rate": "+1%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
    },
    "nadia_al_mansoor": {
        "voice": "en-GB-LibbyNeural",
        "rate": "-3%",
        "pitch": "+0Hz",
        "profile": "broadcast_crisp",
    },
    "viktor_volkov": {
        "voice": "en-GB-ThomasNeural",
        "rate": "-7%",
        "pitch": "-4Hz",
        "profile": "commanding_bass",
    },
}

# Silky de-essed broadcast mastering chains:
#  1) Tight leading/trailing silence trim + click-free 8ms in / 12ms out edge fades
#  2) Highpass rumble cut + character-matched vocal presence EQ + 6.2-8.3 kHz de-essing
#  3) Gentle broadcast vocal compression -> EBU R128 loudnorm (-15.5 LUFS, TP=-2.2 dBTP)
#  4) Safety lookahead limiter capping MP3 psychoacoustic peaks strictly <= -1.5 dBTP
def _build_filter_chain(eq_stage: str, limiter_limit: float = 0.72) -> str:
    return (
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-46dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.04:start_threshold=-48dB,"
        "afade=t=in:d=0.012,areverse,afade=t=in:d=0.008,"
        f"{eq_stage},"
        "acompressor=threshold=-20dB:ratio=2.35:attack=11:release=115:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.2:LRA=7,"
        f"alimiter=limit={limiter_limit:.2f}:attack=3:release=50:level=disabled,"
        "apad=pad_dur=0.06"
    )


EQ_STAGES: Dict[str, str] = {
    "broadcast_host": (
        "highpass=f=78,equalizer=f=190:t=q:w=1.1:g=1.8,equalizer=f=3100:t=q:w=1.4:g=1.5,"
        "equalizer=f=6200:t=q:w=1.8:g=-3.0,equalizer=f=8200:t=q:w=1.6:g=-2.6,lowpass=f=9600"
    ),
    "broadcast_crisp": (
        "highpass=f=84,equalizer=f=230:t=q:w=1.2:g=1.4,equalizer=f=3200:t=q:w=1.5:g=1.3,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.2,equalizer=f=8300:t=q:w=1.6:g=-2.8,lowpass=f=9600"
    ),
    "grit_baritone": (
        "highpass=f=74,equalizer=f=185:t=q:w=1.0:g=2.3,equalizer=f=2800:t=q:w=1.4:g=1.4,"
        "equalizer=f=6200:t=q:w=1.8:g=-2.8,equalizer=f=8100:t=q:w=1.6:g=-2.5,lowpass=f=9400"
    ),
    "broadcast_baritone": (
        "highpass=f=76,equalizer=f=195:t=q:w=1.1:g=2.0,equalizer=f=2900:t=q:w=1.4:g=1.3,"
        "equalizer=f=6200:t=q:w=1.8:g=-2.9,equalizer=f=8200:t=q:w=1.6:g=-2.6,lowpass=f=9500"
    ),
    "commanding_bass": (
        "highpass=f=70,equalizer=f=165:t=q:w=1.0:g=2.6,equalizer=f=2600:t=q:w=1.3:g=1.4,"
        "equalizer=f=6100:t=q:w=1.8:g=-2.8,equalizer=f=8000:t=q:w=1.6:g=-2.4,lowpass=f=9200"
    ),
}

# ============================================================================
# 2. CANONICAL 132-CLIP V5 CAST VOICE SCRIPT
# ============================================================================
# Tuple: (clip_id, speaker, transcript, spoken_override)
ClipSpec = Tuple[str, str, str, Optional[str]]

V5_VOICE_CLIPS: List[ClipSpec] = [
    # ------------------------------------------------------------------------
    # A. COLD OPEN BEATS (6 clips: vo_cold_1..6)
    # ------------------------------------------------------------------------
    (
        "vo_cold_1",
        "max_sterling",
        "Rain on the pavement, forty-two folding chairs, and every network on Earth hunting for one unstoppable mind. Welcome to the $10,000,000 World's Smartest Open Call!",
        "Rain on the pavement, forty-two folding chairs, and every network on Earth hunting for one unstoppable mind. Welcome to the ten million dollar World's Smartest Open Call!",
    ),
    (
        "vo_cold_2",
        "producer_sam",
        "Hold still while I clip your mic—I'm Sam, your backstage producer. Your Tour Trunk holds every ticket, rival dossier, and lucky charm you'll earn on the climb.",
        None,
    ),
    (
        "vo_cold_3",
        "frankie_russo",
        "Well look what the storm blew into Oakridge. Name's Frankie Russo—forty-seven straight Tuesday nights unbeaten, and I'm not handing over my apron tonight.",
        None,
    ),
    (
        "vo_cold_4",
        "max_sterling",
        "Take a breath on every question—you always get a free 2-second read-in before the clock starts. Use your brass 50/50 or Clue coins, or flip that 2x Double Down switch when you're feeling fearless.",
        "Take a breath on every question—you always get a free two-second read-in before the clock starts. Use your brass fifty-fifty or Clue coins, or flip that two-times Double Down switch when you're feeling fearless.",
    ),
    (
        "vo_cold_5",
        "max_sterling",
        "Watch the board—some tiles wire you into cable switchboards, analog speed dials, or sealed clues. Light up all six Crown Wedges and the stage is practically yours.",
        None,
    ),
    (
        "vo_cold_6",
        "max_sterling",
        "Sign your Contestant Pass, step into the spotlight, and let's show Oakridge what an underdog looks like. Lights up—we are live!",
        None,
    ),
    # ------------------------------------------------------------------------
    # B. GREEN-ROOM WELCOME & PRODUCER SAM BRIEFINGS (6 clips: vo_sam_1..6)
    # ------------------------------------------------------------------------
    (
        "vo_sam_1",
        "producer_sam",
        "Welcome to your Green Room! Flip open the Tour Trunk to pin your next stop, check your brass luggage tags, and answer any backstage phone calls before curtain.",
        None,
    ),
    (
        "vo_sam_2",
        "producer_sam",
        "Hey, shake off the loss—on this tour, nobody goes home after one rough broadcast. The Late-Night Redemption Circuit is open, and everybody loves a wildcard comeback.",
        None,
    ),
    (
        "vo_sam_3",
        "producer_sam",
        "Three backers want your signature: Oakridge Independent, Apex Network, and the Velvet Society. Nail their on-air Showman Dares and watch your bankroll and ratings explode.",
        None,
    ),
    (
        "vo_sam_4",
        "producer_sam",
        "Quick producer tip: earn a rival's respect backstage and they'll gift you their signature Podium Lucky Charm. Slot up to three trinkets right onto your stage ledge.",
        None,
    ),
    (
        "vo_sam_5",
        "producer_sam",
        "Eyes on the red Screw Rival buzzer on your podium. Spot your opponent's weakest subject, slam it, and steal their points if they choke—just watch out, they get one too.",
        None,
    ),
    (
        "vo_sam_6",
        "producer_sam",
        "One point four billion viewers locked onto the simulcast, Grandmaster Viktor Volkov already at his podium, and your mic check is crystal clear. Go win the crown.",
        None,
    ),
    # ------------------------------------------------------------------------
    # C. MAX STERLING GAMEPLAY CALLOUTS (40 clips across 16 categories)
    # ------------------------------------------------------------------------
    # 1. board_welcome (3)
    (
        "vo_max_board_welcome_1",
        "max_sterling",
        "Fresh stage, gleaming brass, and a board loaded with surprises! Pick your opening tile and set the tempo.",
        None,
    ),
    (
        "vo_max_board_welcome_2",
        "max_sterling",
        "Look at that board—chains, wedges, and plenty of ways to steal the spotlight. Where are we diving in first?",
        None,
    ),
    (
        "vo_max_board_welcome_3",
        "max_sterling",
        "Cameras are rolling, the crowd is leaning in, and every single tile is live. Claim your first square!",
        None,
    ),
    # 2. read_in_tip (2)
    (
        "vo_max_read_in_tip_1",
        "max_sterling",
        "No rush on the jump—use that free 2-second read-in to soak up the clue before the shot clock moves.",
        "No rush on the jump—use that free two-second read-in to soak up the clue before the shot clock moves.",
    ),
    (
        "vo_max_read_in_tip_2",
        "max_sterling",
        "Remember, the clock gives you two smooth seconds to read clean before it ticks. Trust your instincts!",
        None,
    ),
    # 3. double_down (3)
    (
        "vo_max_double_down_1",
        "max_sterling",
        "Oh, you threw the brass 2x Double Down switch! Double the points, double the nerve—let's see if it pays!",
        "Oh, you threw the brass two-times Double Down switch! Double the points, double the nerve—let's see if it pays!",
    ),
    (
        "vo_max_double_down_2",
        "max_sterling",
        "Double Down armed and glowing! Fortune favors the bold on prime-time television!",
        None,
    ),
    (
        "vo_max_double_down_3",
        "max_sterling",
        "2x Double Down cashed clean! You pushed all the chips in and cleared the whole table!",
        "Two-times Double Down cashed clean! You pushed all the chips in and cleared the whole table!",
    ),
    # 4. power_play (3)
    (
        "vo_max_power_play_1",
        "max_sterling",
        "Power Play on the board! Set your brass wager dial and show this audience what fearless looks like!",
        None,
    ),
    (
        "vo_max_power_play_2",
        "max_sterling",
        "High-stakes Power Play! One crisp answer here can flip the entire scoreboard upside down.",
        None,
    ),
    (
        "vo_max_power_play_3",
        "max_sterling",
        "Boom! Power Play locked and cashed—the whole studio just felt that shockwave!",
        None,
    ),
    # 5. chain_shatter (3)
    (
        "vo_max_chain_shatter_1",
        "max_sterling",
        "Listen to those iron chains snap! Padlock shattered in sparks, and fresh high-value tiles just blew wide open!",
        None,
    ),
    (
        "vo_max_chain_shatter_2",
        "max_sterling",
        "Chain reaction! You cracked that vault wide open and unlocked the next tier of the board!",
        None,
    ),
    (
        "vo_max_chain_shatter_3",
        "max_sterling",
        "Sparks flying across the stage—those heavy brass locks didn't stand a chance!",
        None,
    ),
    # 6. stage_sweep (3)
    (
        "vo_max_stage_sweep_1",
        "max_sterling",
        "Stage Sweep Jackpot! You cleared the entire line—three hundred bonus points and a crown jewel straight to your podium!",
        None,
    ),
    (
        "vo_max_stage_sweep_2",
        "max_sterling",
        "Clean sweep across the board! Ring the bells, drop the jackpot, and watch that score surge!",
        None,
    ),
    (
        "vo_max_stage_sweep_3",
        "max_sterling",
        "Full line cleared in style! That Stage Sweep Jackpot just turned this broadcast into your highlight reel!",
        None,
    ),
    # 7. screw_slammed (3)
    (
        "vo_max_screw_slammed_1",
        "max_sterling",
        "Red buzzer slammed! You just hit Screw Rival—forcing them straight into the spotlight on a brutal tile!",
        None,
    ),
    (
        "vo_max_screw_slammed_2",
        "max_sterling",
        "Oh, that is deliciously cold! Screw Rival fired—if they choke right here, those points are all yours!",
        None,
    ),
    (
        "vo_max_screw_slammed_3",
        "max_sterling",
        "Sound the alarms! Screw Rival is live—let's see how your opponent handles an ambush under hot lights!",
        None,
    ),
    # 8. streak_3 (2)
    (
        "vo_max_streak_3_1",
        "max_sterling",
        "Three in a row! The podium lights are warming up and you've officially found your groove!",
        None,
    ),
    (
        "vo_max_streak_3_2",
        "max_sterling",
        "Hat trick on the stage! Three straight hits and the audience is starting to buzz!",
        None,
    ),
    # 9. streak_4 (2)
    (
        "vo_max_streak_4_1",
        "max_sterling",
        "Four straight answers without blinking! Somebody check the buzzer—this contestant is running red-hot!",
        None,
    ),
    (
        "vo_max_streak_4_2",
        "max_sterling",
        "Four in a row! You're reading this board like you wrote the questions yourself!",
        None,
    ),
    # 10. streak_5 (2)
    (
        "vo_max_streak_5_1",
        "max_sterling",
        "Five straight! Call the fire marshal—this is an all-time prime-time clinic!",
        None,
    ),
    (
        "vo_max_streak_5_2",
        "max_sterling",
        "Five in a row and completely unstoppable! The whole broadcast crew is on their feet!",
        None,
    ),
    # 11. buzzer_beater (2)
    (
        "vo_max_buzzer_beater_1",
        "max_sterling",
        "Right at the buzzer! My cardiologist is sending you the invoice for that one!",
        None,
    ),
    (
        "vo_max_buzzer_beater_2",
        "max_sterling",
        "Locked in with a heartbeat left! Do you just enjoy giving the control room gray hair?",
        None,
    ),
    # 12. tough_miss (3)
    (
        "vo_max_tough_miss_1",
        "max_sterling",
        "Ouch, tricky curveball! Shake it off—even champions drop a clue before the comeback.",
        None,
    ),
    (
        "vo_max_tough_miss_2",
        "max_sterling",
        "Close call on that one! Dust off the podium, grab the next tile, and steal the momentum right back.",
        None,
    ),
    (
        "vo_max_tough_miss_3",
        "max_sterling",
        "Hey, the board bites back sometimes! Deep breath—there are plenty of points still waiting out there.",
        None,
    ),
    # 13. match_win (3)
    (
        "vo_max_match_win_1",
        "max_sterling",
        "Lights, cameras, triumph! You owned this stage from the first tile to the final bell!",
        None,
    ),
    (
        "vo_max_match_win_2",
        "max_sterling",
        "What a finish! The crowd is roaring, the scoreboard is yours, and the tour moves forward!",
        None,
    ),
    (
        "vo_max_match_win_3",
        "max_sterling",
        "Unbelievable performance! Stamp the tour trunk—another venue conquered in pure showtime style!",
        None,
    ),
    # 14. redemption (2)
    (
        "vo_max_redemption_1",
        "max_sterling",
        "Tough break under the bright lights, challenger—but every great Cinderella story starts on the late-night Redemption Circuit!",
        None,
    ),
    (
        "vo_max_redemption_2",
        "max_sterling",
        "Don't hang your head for a second! Hit the Redemption run, sharpen your edge, and come back ready for a rematch!",
        None,
    ),
    # 15. wedge_earned (2)
    (
        "vo_max_wedge_earned_1",
        "max_sterling",
        "Another glowing Crown Wedge snapped into your medallion! That centerpiece is starting to look dangerously expensive!",
        None,
    ),
    (
        "vo_max_wedge_earned_2",
        "max_sterling",
        "Crown Wedge secured! Keep filling those jewel slots and nobody on this stage can catch you!",
        None,
    ),
    # 16. ending_crown (2)
    (
        "vo_max_ending_crown_1",
        "max_sterling",
        "One point four billion witnesses, $10,000,000, and one undisputed champion—ladies and gentlemen, the World's Smartest!",
        "One point four billion witnesses, ten million dollars, and one undisputed champion—ladies and gentlemen, the World's Smartest!",
    ),
    (
        "vo_max_ending_crown_2",
        "max_sterling",
        "From forty-two folding chairs in Oakridge to the summit of the world—take your bow, champion, history is yours!",
        None,
    ),
    # ------------------------------------------------------------------------
    # D. ALL 8 CHALLENGERS (8 x 10 = 80 clips)
    # Suffixes: walkout, reply_bold, reply_respect, reply_witty, trap_taunt,
    #           screw_taunt, screwed_react, ally_call, win, defeat
    # ------------------------------------------------------------------------
    # --- 1. Frankie "Last Call" Russo (Tier 1: Oakridge Community Hall) ---
    (
        "vo_frankie_walkout",
        "frankie_russo",
        "Grab a stool, kid—I've won forty-seven straight Tuesday nights at Oakridge, and I pour trivia faster than draft beer.",
        None,
    ),
    (
        "vo_frankie_reply_bold",
        "frankie_russo",
        "Whoa, big talk for somebody who just walked in out of the rain! Alright, let's see if your buzzer backs up that swagger.",
        None,
    ),
    (
        "vo_frankie_reply_respect",
        "frankie_russo",
        "Hey, appreciate the respect, pal. Good manners won't save you on sports or movies, though—may the sharpest mind buy the next round.",
        None,
    ),
    (
        "vo_frankie_reply_witty",
        "frankie_russo",
        "Ha! Okay, a wise guy—I like that! Save some of that comedy for when my pub regulars start cheering.",
        None,
    ),
    (
        "vo_frankie_trap_taunt",
        "frankie_russo",
        "Last call on your favorite column, pal! That side of the bar is officially closed for the night.",
        None,
    ),
    (
        "vo_frankie_screw_taunt",
        "frankie_russo",
        "Incoming Screw, kid! Let's see how you handle a heavy pour from my side of the board!",
        None,
    ),
    (
        "vo_frankie_screwed_react",
        "frankie_russo",
        "Whoa, hey! You hit me with the red buzzer on chemistry?! Alright, alright, you play dirty—I respect it!",
        None,
    ),
    (
        "vo_frankie_ally_call",
        "frankie_russo",
        "Hey kid, it's Frankie calling from Oakridge! Slip my lucky bar coaster onto your podium—it'll eat the sting on your first missed Double Down. Go knock 'em dead!",
        None,
    ),
    (
        "vo_frankie_win",
        "frankie_russo",
        "Still the heavyweight champ of Oakridge! Keep your chin up though—you've got real spark for this game.",
        None,
    ),
    (
        "vo_frankie_defeat",
        "frankie_russo",
        "You took the belt right off my apron! Go tear up the big city and tell 'em Oakridge sent you!",
        None,
    ),
    # --- 2. Denise Park (Tier 2: Downtown Lyric Theater) ---
    (
        "vo_denise_walkout",
        "denise_park",
        "Sit up straight, eyes on the board, and do remember it is 'fewer' points, not 'less.' Thirty-four years of AP History taught me to spot a bluffer instantly.",
        "Sit up straight, eyes on the board, and do remember it is fewer points, not less. Thirty-four years of A. P. History taught me to spot a bluffer instantly.",
    ),
    (
        "vo_denise_reply_bold",
        "denise_park",
        "Confidence without footnotes is merely noise. Let us see whether your study habits match your volume.",
        None,
    ),
    (
        "vo_denise_reply_respect",
        "denise_park",
        "Refreshing poise—and punctual too. I shall still grade you on a ruthless curve, of course, but you have my full attention.",
        None,
    ),
    (
        "vo_denise_reply_witty",
        "denise_park",
        "Clever remark—I would give it a B-plus for wit, though the Lyric Theater scoreboard only grades precision.",
        None,
    ),
    (
        "vo_denise_trap_taunt",
        "denise_park",
        "Pop quiz! I've planted a fresh bounty right where your syllabus looks weakest. No notes and no whispering.",
        None,
    ),
    (
        "vo_denise_screw_taunt",
        "denise_park",
        "Consider this a surprise midterm. I'm sending you straight into the deep end with a Screw!",
        None,
    ),
    (
        "vo_denise_screwed_react",
        "denise_park",
        "Goodness—did you truly just Screw your elder on pop tech?! Cheeky, tactical, and frankly well timed.",
        None,
    ),
    (
        "vo_denise_ally_call",
        "denise_park",
        "Denise Park here—put down your coffee and listen closely. Take my red fountain pen for your podium; it'll cross out a bad decoy on History and Literature. Make me proud.",
        None,
    ),
    (
        "vo_denise_win",
        "denise_park",
        "Class dismissed! Review your timelines, rest your nerves, and come retake the midterm whenever you're ready.",
        None,
    ),
    (
        "vo_denise_defeat",
        "denise_park",
        "Crisp, thorough, and properly earned. Put me down for a front-row seat when you hit national television!",
        None,
    ),
    # --- 3. Trevor "14-Day" Blake (Tier 3: Channel 7 Studio B) ---
    (
        "vo_trevor_walkout",
        "trevor_blake",
        "Careful staring straight at the teeth—my dentist calls this shade Broadcast White. Fourteen straight days on Channel 7, baby, and camera two loves a winner!",
        None,
    ),
    (
        "vo_trevor_reply_bold",
        "trevor_blake",
        "Ooh, spicy! Producers, tell me we got that soundbite in HD—nothing boosts afternoon ratings like a cocky rookie!",
        "Ooh, spicy! Producers, tell me we got that soundbite in H. D.—nothing boosts afternoon ratings like a cocky rookie!",
    ),
    (
        "vo_trevor_reply_respect",
        "trevor_blake",
        "Hey, class act! I love a challenger who appreciates fourteen days of pure daytime television charisma. Let's put on a show!",
        None,
    ),
    (
        "vo_trevor_reply_witty",
        "trevor_blake",
        "Haha, okay, watch it—stealing my punchlines on my own set is technically a Channel 7 violation!",
        None,
    ),
    (
        "vo_trevor_trap_taunt",
        "trevor_blake",
        "Commercial break on your safety blanket! I checked your stats backstage and locked you onto your shaky spot!",
        None,
    ),
    (
        "vo_trevor_screw_taunt",
        "trevor_blake",
        "Zoom in, camera three! Dropping the Screw buzzer right on your worst category—smile for the folks at home!",
        None,
    ),
    (
        "vo_trevor_screwed_react",
        "trevor_blake",
        "Wait—cut to a wide shot, don't zoom on my face! You seriously Screwed me on live television?!",
        None,
    ),
    (
        "vo_trevor_ally_call",
        "trevor_blake",
        "Yo, it's Trevor! Look, I smuggled my lucky studio hot mic to your dressing room—clip it to your podium and every hot streak prints bonus points. Own that prime-time feed!",
        None,
    ),
    (
        "vo_trevor_win",
        "trevor_blake",
        "Day fifteen in the books, baby! Don't worry, the Channel 7 gift mug actually keeps coffee pretty warm.",
        None,
    ),
    (
        "vo_trevor_defeat",
        "trevor_blake",
        "Wait, my fourteen-day streak is over?! Go win the whole prime-time deal so I can brag I lost to a legend!",
        None,
    ),
    # --- 4. Dr. Priya Nair (Tier 4: Starlight Prime-Time Center) ---
    (
        "vo_priya_walkout",
        "priya_nair",
        "I work twelve-hour trauma shifts and finish Sunday crosswords in ink. Under prime-time lights, thirty seconds on a shot clock feels like a spa day.",
        None,
    ),
    (
        "vo_priya_reply_bold",
        "priya_nair",
        "Elevated heart rate, bold posture—let's see if your accuracy holds steady once the clock drops under five seconds.",
        None,
    ),
    (
        "vo_priya_reply_respect",
        "priya_nair",
        "I appreciate steady composure under pressure. Clean vitals, fast buzzers, zero wasted motion—let's play a sharp match.",
        None,
    ),
    (
        "vo_priya_reply_witty",
        "priya_nair",
        "Good—humor lowers cortisol. You're going to need that calm once I start prescribing tiles from the tough wing.",
        None,
    ),
    (
        "vo_priya_trap_taunt",
        "priya_nair",
        "Putting your comfort column into quarantine for one turn. Try diagnosing a different corner of the board.",
        None,
    ),
    (
        "vo_priya_screw_taunt",
        "priya_nair",
        "Prescribing one heavy Screw straight to your weakest chart metric. Take immediately before the buzzer sounds.",
        None,
    ),
    (
        "vo_priya_screwed_react",
        "priya_nair",
        "Sharp triage—targeting my sports blind spot with the Screw! Fine, pulse is steady; let's see what I've got.",
        None,
    ),
    (
        "vo_priya_ally_call",
        "priya_nair",
        "Hi, it's Dr. Priya Nair. Keep my adrenaline charm on your podium—when the shot clock gets tight, it rewards cool nerves with a big clutch surge. Watch Viktor's late-game traps.",
        "Hi, it's Doctor Priya Nair. Keep my adrenaline charm on your podium—when the shot clock gets tight, it rewards cool nerves with a big clutch surge. Watch Viktor's late-game traps.",
    ),
    (
        "vo_priya_win",
        "priya_nair",
        "Clean match and steady execution. Catch your breath, hydrate, and come take another shot whenever you're ready.",
        None,
    ),
    (
        "vo_priya_defeat",
        "priya_nair",
        "You actually out-calmed an ER surgeon in front of ten million viewers. Go give London a proper headache!",
        "You actually out-calmed an E. R. surgeon in front of ten million viewers. Go give London a proper headache!",
    ),
    # --- 5. Lord Alistair Finch (Tier 5: Grand Rotunda Hall, London) ---
    (
        "vo_alistair_walkout",
        "alistair_finch",
        "Good evening from London. Do forgive me if I blink at pop-culture clues—at Oxford we still regard television as a noisy passing fad.",
        None,
    ),
    (
        "vo_alistair_reply_bold",
        "alistair_finch",
        "Ah, bracing bravado. How charmingly bold—let us observe how it fares beneath London's marble dome.",
        None,
    ),
    (
        "vo_alistair_reply_respect",
        "alistair_finch",
        "Splendid manners—a rare tonic in modern broadcasting. I shall pour the tea before systematically dismantling your lead.",
        None,
    ),
    (
        "vo_alistair_reply_witty",
        "alistair_finch",
        "Ha! Remarkably dry—nearly Oxford standard. Do keep that up; it makes losing much more civilized.",
        None,
    ),
    (
        "vo_alistair_trap_taunt",
        "alistair_finch",
        "I am placing a polite 'Closed for Tea' placard across your favorite column. Do explore the classics instead.",
        "I am placing a polite Closed for Tea placard across your favorite column. Do explore the classics instead.",
    ),
    (
        "vo_alistair_screw_taunt",
        "alistair_finch",
        "Terribly sorry, old sport, but I've just depressed the Screw buzzer. Enjoy a wonderfully inconvenient category.",
        None,
    ),
    (
        "vo_alistair_screwed_react",
        "alistair_finch",
        "Good heavens—ambushed by the red buzzer on modern computing?! Dreadfully unsporting... and rather brilliant.",
        None,
    ),
    (
        "vo_alistair_ally_call",
        "alistair_finch",
        "Alistair Finch calling from Oxford. Do borrow my grandfather's brass pocketwatch for your podium—eight extra seconds on the clock works wonders against Tokyo and Giza.",
        None,
    ),
    (
        "vo_alistair_win",
        "alistair_finch",
        "A spirited engagement! Do stay for tea; our scones are considerably gentler than my History selections.",
        None,
    ),
    (
        "vo_alistair_defeat",
        "alistair_finch",
        "Well played indeed! You have thoroughly ruined my evening and earned my complete admiration.",
        None,
    ),
    # --- 6. Kenji "Zero-Lag" Takahashi (Tier 6: Shibuya Sky-Dome, Tokyo) ---
    (
        "vo_kenji_walkout",
        "kenji_takahashi",
        "Two hundred million viewers across Shibuya tonight. I read three moves ahead on a shogi board, and five turns ahead on this stage—let's run a speedrun.",
        None,
    ),
    (
        "vo_kenji_reply_bold",
        "kenji_takahashi",
        "High-aggression opening. Interesting—most players hesitate under Tokyo lights, so let's test your reaction frames.",
        None,
    ),
    (
        "vo_kenji_reply_respect",
        "kenji_takahashi",
        "Respect acknowledged. Clean rivalry sharpens both players—let's give Shibuya the cleanest match of the tournament.",
        None,
    ),
    (
        "vo_kenji_reply_witty",
        "kenji_takahashi",
        "Nice counter-quip—fast latency on the mic too. Let's see if your fingers match your sense of timing.",
        None,
    ),
    (
        "vo_kenji_trap_taunt",
        "kenji_takahashi",
        "Column frozen! Consider your favorite comfort strategy officially patched out for the next turn.",
        None,
    ),
    (
        "vo_kenji_screw_taunt",
        "kenji_takahashi",
        "Deploying the Screw on your lowest career win rate. Clock's live—show me your counterplay.",
        None,
    ),
    (
        "vo_kenji_screwed_react",
        "kenji_takahashi",
        "Whoa—frame-perfect Screw timing right on fine arts! Okay, respect, you actually studied my tape.",
        None,
    ),
    (
        "vo_kenji_ally_call",
        "kenji_takahashi",
        "Hey, it's Kenji from Shibuya. Plug my cyber link charm onto your podium—if you lock answers inside six seconds, you'll stack massive speed surges. Outpace Viktor early.",
        None,
    ),
    (
        "vo_kenji_win",
        "kenji_takahashi",
        "Checkmate under the neon. You pushed my tempo harder than anyone this season—run it back anytime.",
        None,
    ),
    (
        "vo_kenji_defeat",
        "kenji_takahashi",
        "You actually outpaced me in my own dome?! Pure skill. Go take that $10,000,000 world crown!",
        "You actually outpaced me in my own dome?! Pure skill. Go take that ten million dollar world crown!",
    ),
    # --- 7. Nadia Al-Mansoor (Tier 7: Great Starlight Pavilion at Giza) ---
    (
        "vo_nadia_walkout",
        "nadia_al_mansoor",
        "Welcome beneath the stars of Giza. I watched every tape of your climb from Oakridge—half a billion people are awake tonight, so hold nothing back.",
        None,
    ),
    (
        "vo_nadia_reply_bold",
        "nadia_al_mansoor",
        "Fearless under desert starlight—good. Hesitation never survives the World Semifinals.",
        None,
    ),
    (
        "vo_nadia_reply_respect",
        "nadia_al_mansoor",
        "Thank you, challenger. To face a mind that plays with honor is the finest gift this stage can offer.",
        None,
    ),
    (
        "vo_nadia_reply_witty",
        "nadia_al_mansoor",
        "A sharp smile before battle—I like it. Keep that lightness when the clues grow deep.",
        None,
    ),
    (
        "vo_nadia_trap_taunt",
        "nadia_al_mansoor",
        "I have closed your favorite doorway for one turn. Step into another room of the palace and show me your range.",
        None,
    ),
    (
        "vo_nadia_screw_taunt",
        "nadia_al_mansoor",
        "I memorized your weak patterns before we shook hands. Here is my Screw—prove to Giza you outgrew them.",
        None,
    ),
    (
        "vo_nadia_screwed_react",
        "nadia_al_mansoor",
        "Well struck! Hitting my pop-sports weakness with the Screw right on cue—you read the board like a master.",
        None,
    ),
    (
        "vo_nadia_ally_call",
        "nadia_al_mansoor",
        "Nadia here, calling from Cairo. Set my brass astrolabe on your podium—it amplifies every Crown Wedge you claim. Against Viktor Volkov, never surrender the center rows.",
        None,
    ),
    (
        "vo_nadia_win",
        "nadia_al_mansoor",
        "What a semifinal! No challenger has pushed my memory this close beneath the pyramids.",
        None,
    ),
    (
        "vo_nadia_defeat",
        "nadia_al_mansoor",
        "Magnificent—you didn't just know the answers, you commanded the entire stage. Go defeat Viktor Volkov before the world!",
        None,
    ),
    # --- 8. Grandmaster Viktor Volkov (Tier 8: 1.4B Live Global Finale) ---
    (
        "vo_viktor_walkout",
        "viktor_volkov",
        "Three world titles, zero compromises, and one point four billion eyes watching tonight. From forty-two folding chairs to my stage—show me you belong here.",
        None,
    ),
    (
        "vo_viktor_reply_bold",
        "viktor_volkov",
        "Boldness is common backstage and rare beneath the Championship lights. Let the scoreboard settle which of us blinks first.",
        None,
    ),
    (
        "vo_viktor_reply_respect",
        "viktor_volkov",
        "A challenger with discipline and poise. Good—the World Crown deserves a duel worthy of history, not theatrics.",
        None,
    ),
    (
        "vo_viktor_reply_witty",
        "viktor_volkov",
        "Humor at $10,000,000—impressive nerve. Let us see whether your wit survives a six-column gauntlet.",
        "Humor at ten million dollars—impressive nerve. Let us see whether your wit survives a six-column gauntlet.",
    ),
    (
        "vo_viktor_trap_taunt",
        "viktor_volkov",
        "Your comfort column is sealed. A true World Champion conquers every discipline on this board.",
        None,
    ),
    (
        "vo_viktor_screw_taunt",
        "viktor_volkov",
        "No hiding in the Finale. I am pressing the Screw buzzer—face your hardest subject in front of the planet.",
        None,
    ),
    (
        "vo_viktor_screwed_react",
        "viktor_volkov",
        "So—you dare fire the Screw at the defending Champion. Bold move... let us see if it holds.",
        None,
    ),
    (
        "vo_viktor_ally_call",
        "viktor_volkov",
        "This is Viktor Volkov. Few rivals earn my respect before the Finale, challenger. Guard your edges, watch the Power Play traps, and bring me your absolute finest game.",
        None,
    ),
    (
        "vo_viktor_win",
        "viktor_volkov",
        "The crown remains mine—by the narrowest margin of my career. Return when you are ready; I will be waiting.",
        None,
    ),
    (
        "vo_viktor_defeat",
        "viktor_volkov",
        "One point four billion witnesses just watched history turn. Stand tall, champion—the World Crown is unmistakably yours.",
        None,
    ),
]


# ============================================================================
# 3. FFMPEG LOCATOR, LOUDNESS / DURATION PROBE & ASYNC SYNTHESIS PIPELINE
# ============================================================================
def find_ffmpeg() -> str:
    try:
        import imageio_ffmpeg

        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and Path(exe).exists():
            return exe
    except Exception:
        pass
    found = shutil.which("ffmpeg")
    if found:
        return found
    for folder in (
        Path(r"C:\Program Files\ffmpeg\bin"),
        Path(r"C:\ffmpeg\bin"),
        Path(r"C:\Program Files\DownloadHelper App"),
    ):
        cand = folder / "ffmpeg.exe"
        if cand.exists():
            return str(cand)
    raise FileNotFoundError("Could not locate ffmpeg via imageio_ffmpeg or PATH")


def probe_mp3_metrics(ffmpeg_bin: str, mp3_path: Path) -> Tuple[float, float, float]:
    """Returns (duration_sec, integrated_lufs, true_peak_dbfs) via FFmpeg ebur128."""
    proc = subprocess.run(
        [ffmpeg_bin, "-i", str(mp3_path), "-af", "ebur128=peak=true", "-f", "null", "-"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    stderr = proc.stderr

    dur_sec = 0.0
    m_dur = re.search(r"Duration:\s*(\d+):(\d+):([\d.]+)", stderr)
    if m_dur:
        dur_sec = int(m_dur.group(1)) * 3600 + int(m_dur.group(2)) * 60 + float(m_dur.group(3))

    lufs_v = -15.5
    tp_v = -2.2
    in_summary = False
    for line in stderr.splitlines():
        if "Summary:" in line:
            in_summary = True
            continue
        if in_summary:
            m_i = re.search(r"^\s*I:\s*([-\d.]+)\s*LUFS", line)
            if m_i:
                lufs_v = float(m_i.group(1))
            m_p = re.search(r"^\s*Peak:\s*([-\d.]+)\s*dBFS", line)
            if m_p:
                tp_v = float(m_p.group(1))

    if dur_sec <= 0.05:
        raise RuntimeError(f"Could not read valid duration for {mp3_path.name}")
    return round(dur_sec, 2), round(lufs_v, 1), round(tp_v, 2)


def master_raw_to_mp3(
    ffmpeg_bin: str,
    raw_mp3: Path,
    out_mp3: Path,
    eq_stage: str,
) -> Tuple[float, float, float]:
    """Masters raw TTS MP3 to -15.5 LUFS & strictly TP <= -1.5 dBTP."""
    for limiter_limit in (0.72, 0.64, 0.56):
        chain = _build_filter_chain(eq_stage, limiter_limit=limiter_limit)
        subprocess.run(
            [
                ffmpeg_bin,
                "-y",
                "-v",
                "error",
                "-i",
                str(raw_mp3),
                "-af",
                chain,
                "-ar",
                "44100",
                "-ac",
                "1",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "64k",
                "-write_xing",
                "1",
                str(out_mp3),
            ],
            check=True,
        )
        dur, lufs, tp = probe_mp3_metrics(ffmpeg_bin, out_mp3)
        if tp <= -1.5:
            return dur, lufs, tp
    raise RuntimeError(f"Clip {out_mp3.name} exceeded true-peak cap (-1.5 dBTP): {tp:.2f} dBTP")


async def synth_one_clip(
    spec: ClipSpec,
    tmp_dir: Path,
    tts_sem: asyncio.Semaphore,
    ffmpeg_sem: asyncio.Semaphore,
    ffmpeg_bin: str,
    skip_existing: bool,
) -> Dict[str, Any]:
    import edge_tts

    clip_id, speaker, transcript, spoken_override = spec
    actor = ACTORS[speaker]
    eq_stage = EQ_STAGES[actor["profile"]]
    fname = f"{clip_id}.mp3"
    out_mp3 = OUT_VOICE_DIR / fname
    rel_url = f"./assets/voice/v5/{fname}"

    if skip_existing and out_mp3.exists() and out_mp3.stat().st_size > 2000:
        async with ffmpeg_sem:
            dur, lufs, tp = await asyncio.to_thread(probe_mp3_metrics, ffmpeg_bin, out_mp3)
        if tp <= -1.5:
            print(f"  [KEEP] {fname:32s} | {speaker:16s} | {dur:5.2f}s | {lufs:5.1f} LUFS | TP {tp:5.2f} dBTP")
            return {
                "clipId": clip_id,
                "speaker": speaker,
                "url": rel_url,
                "transcript": transcript,
                "durationSec": dur,
                "_lufs": lufs,
                "_tp": tp,
                "_bytes": out_mp3.stat().st_size,
            }

    raw_mp3 = tmp_dir / f"raw_{fname}"
    tts_text = spoken_override or transcript

    async with tts_sem:
        last_err: Optional[Exception] = None
        for attempt in range(5):
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
                last_err = RuntimeError("Empty or truncated edge-tts output")
            except Exception as exc:
                last_err = exc
                await asyncio.sleep(1.0 + attempt * 1.2)
        if last_err is not None or not raw_mp3.exists():
            raise RuntimeError(f"Failed edge-tts synthesis for {clip_id}: {last_err}")

    async with ffmpeg_sem:
        dur, lufs, tp = await asyncio.to_thread(
            master_raw_to_mp3, ffmpeg_bin, raw_mp3, out_mp3, eq_stage
        )

    size_bytes = out_mp3.stat().st_size
    if size_bytes < 2000:
        raise RuntimeError(f"Mastered clip {fname} unexpectedly tiny ({size_bytes} bytes)")

    print(
        f"  [VO]   {fname:32s} | {speaker:16s} | {dur:5.2f}s | {size_bytes:6d} B | {lufs:5.1f} LUFS | TP {tp:5.2f} dBTP"
    )
    return {
        "clipId": clip_id,
        "speaker": speaker,
        "url": rel_url,
        "transcript": transcript,
        "durationSec": dur,
        "_lufs": lufs,
        "_tp": tp,
        "_bytes": size_bytes,
    }


def validate_script_catalog() -> None:
    seen: set[str] = set()
    for clip_id, speaker, transcript, _spoken in V5_VOICE_CLIPS:
        assert clip_id not in seen, f"Duplicate clipId: {clip_id}"
        seen.add(clip_id)
        assert speaker in ACTORS, f"Unknown speaker {speaker} on {clip_id}"
        assert transcript.strip(), f"Empty transcript on {clip_id}"
        # Guard against year-commas like 1,969 or 2,024 (currency like $10,000,000 is fine)
        assert not re.search(r"(?<!\$)\b[12],\d{3}\b", transcript), f"Year-comma found in {clip_id}: {transcript}"
    assert len(V5_VOICE_CLIPS) >= 120, f"Need >= 120 clips, got {len(V5_VOICE_CLIPS)}"


async def build_all(skip_existing: bool, only_ids: Optional[List[str]]) -> None:
    validate_script_catalog()
    OUT_VOICE_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)

    ffmpeg_bin = find_ffmpeg()
    target_specs = V5_VOICE_CLIPS
    if only_ids:
        only_set = set(only_ids)
        target_specs = [s for s in V5_VOICE_CLIPS if s[0] in only_set]
        if not target_specs:
            raise ValueError(f"No matching clipIds for --only: {only_ids}")

    print(f"[V5 VO] Building {len(target_specs)} / {len(V5_VOICE_CLIPS)} broadcast-mastered cast clips...")
    print(f"[V5 VO] FFmpeg: {ffmpeg_bin}")

    tts_sem = asyncio.Semaphore(5)
    ffmpeg_sem = asyncio.Semaphore(4)

    with tempfile.TemporaryDirectory(prefix="ws_v5_vo_") as td:
        results = await asyncio.gather(
            *(
                synth_one_clip(spec, Path(td), tts_sem, ffmpeg_sem, ffmpeg_bin, skip_existing)
                for spec in target_specs
            )
        )

    # If --only was used, merge with existing manifest entries so manifest stays complete
    existing_clips: Dict[str, Dict[str, Any]] = {}
    if only_ids and MANIFEST_PATH.exists():
        old_data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        existing_clips = dict(old_data.get("clips", {}))

    for r in results:
        existing_clips[r["clipId"]] = {
            "clipId": r["clipId"],
            "speaker": r["speaker"],
            "url": r["url"],
            "transcript": r["transcript"],
            "durationSec": r["durationSec"],
        }

    # Remove any stale orphan MP3s when running a full build
    expected_ids = {s[0] for s in V5_VOICE_CLIPS}
    if not only_ids:
        for mp3 in OUT_VOICE_DIR.glob("*.mp3"):
            if mp3.stem not in expected_ids:
                mp3.unlink()
                print(f"  [CLEAN] Removed stale orphan clip: {mp3.name}")

    ordered_clips = {
        spec[0]: existing_clips[spec[0]]
        for spec in V5_VOICE_CLIPS
        if spec[0] in existing_clips
    }

    manifest = {
        "version": "5.0",
        "generatedAtIso": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "clips": ordered_clips,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Strict 1:1 verification between disk MP3s and manifest
    disk_stems = sorted(p.stem for p in OUT_VOICE_DIR.glob("*.mp3"))
    manifest_ids = sorted(ordered_clips.keys())
    if not only_ids:
        assert disk_stems == manifest_ids, (
            f"1:1 parity mismatch! Disk={len(disk_stems)}, Manifest={len(manifest_ids)}, "
            f"MissingOnDisk={set(manifest_ids) - set(disk_stems)}, "
            f"OrphansOnDisk={set(disk_stems) - set(manifest_ids)}"
        )

    total_bytes = sum((OUT_VOICE_DIR / f"{cid}.mp3").stat().st_size for cid in manifest_ids)
    max_tp = max(r["_tp"] for r in results)
    avg_lufs = sum(r["_lufs"] for r in results) / len(results)
    print(
        f"[DONE] {len(manifest_ids)} v5 voice clips verified 1:1 with {MANIFEST_PATH.name} "
        f"| Total: {total_bytes / (1024 * 1024):.2f} MB | Avg LUFS: {avg_lufs:.1f} | Max TP: {max_tp:.2f} dBTP"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Build World's Smartest v5.0 10-voice cast VO catalog.")
    parser.add_argument("--skip-existing", action="store_true", help="Keep already-mastered valid MP3s")
    parser.add_argument("--only", nargs="+", help="Regenerate specific clipIds only")
    args = parser.parse_args()
    asyncio.run(build_all(skip_existing=args.skip_existing, only_ids=args.only))


if __name__ == "__main__":
    main()
