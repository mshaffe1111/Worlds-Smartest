#!/usr/bin/env python3
"""
World's Smartest — Wave-2 Neural Voice Acting Expansion (68 New Clips -> 144 Total!)
====================================================================================
Generates 68 studio-mastered neural VO clips via edge-tts + silky de-essed FFmpeg
broadcast mastering (lowpass=9500Hz, loudnorm=-15.5 LUFS, strict TP <= -1.1 dBTP)
into `public/assets/voice/` (and `godot/assets/voice/`) and emits
`public/assets/voice/vo_wave2_manifest.json`.
"""

from __future__ import annotations

import asyncio
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_VOICE_DIR = REPO_ROOT / "public" / "assets" / "voice"
GODOT_VOICE_DIR = REPO_ROOT / "godot" / "assets" / "voice"

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
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "broadcast_crisp": (
        "highpass=f=82,equalizer=f=230:t=q:w=1.2:g=1.5,equalizer=f=3100:t=q:w=1.5:g=1.2,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.0,equalizer=f=8300:t=q:w=1.6:g=-2.6,lowpass=f=9500,"
        "acompressor=threshold=-20dB:ratio=2.3:attack=12:release=115:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "icy_diplomat": (
        "highpass=f=85,equalizer=f=220:t=q:w=1.2:g=1.8,equalizer=f=2700:t=q:w=1.4:g=1.3,"
        "equalizer=f=6300:t=q:w=1.8:g=-2.8,lowpass=f=9500,"
        "acompressor=threshold=-19dB:ratio=2.4:attack=11:release=110:makeup=1.4,"
        "loudnorm=I=-15.5:TP=-2.4:LRA=8,alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.07"
    ),
    "intimate_whisper": (
        "highpass=f=92,equalizer=f=180:t=q:w=1.0:g=3.0,equalizer=f=3600:t=q:w=1.4:g=1.5,"
        "equalizer=f=6400:t=q:w=1.8:g=-3.2,lowpass=f=9000,"
        "acompressor=threshold=-23dB:ratio=2.8:attack=10:release=100:makeup=1.8,"
        "loudnorm=I=-16.0:TP=-2.4:LRA=7,alimiter=limit=0.77:attack=3:release=50:level=disabled,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-48dB,"
        "areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-50dB,areverse,"
        "apad=pad_dur=0.08"
    ),
}

# (file, actor, category, venue, expression, optional_profile, text)
WAVE2_SPECS: List[Tuple[str, str, str, str, str, Optional[str], str]] = [
    # --- 4 Persona Stamp Ceremonies ---
    ("vance_persona_maverick.mp3", "vance", "persona_stamp", "ch", "neutral", None,
     "High risk, fearless Overclocks, zero hesitation. Your Meridian Passport is stamped: The Maverick."),
    ("vance_persona_diplomat.mp3", "vance", "persona_stamp", "ch", "neutral", None,
     "Measured judgment, strategic alliances, composure under fire. Your Meridian Passport is stamped: The Diplomat."),
    ("vance_persona_analyst.mp3", "vance", "persona_stamp", "ch", "neutral", None,
     "Methodical clue-peeling, surgical precision, zero wasted motion. Your Meridian Passport is stamped: The Analyst."),
    ("vance_persona_prodigy.mp3", "vance", "persona_stamp", "ch", "intense", None,
     "Cold instinct at three-point-zero, razor accuracy, unshakable nerve. Your Meridian Passport is stamped: The Prodigy."),

    # --- Stage 1 London: Trial 00 & Lindqvist Briefing (8) ---
    ("london_lindqvist_offer_1.mp3", "lindqvist", "stage_drama", "gb", "neutral", None,
     "Close the door. Every champion before you understood that brilliance requires institutional protection."),
    ("london_lindqvist_offer_2.mp3", "lindqvist", "stage_drama", "gb", "neutral", None,
     "Take this redaction cipher, and your opening decoy shatters automatically. Burn it, and you walk out alone."),
    ("london_lindqvist_accept.mp3", "lindqvist", "stage_drama", "gb", "neutral", None,
     "Wise choice. Sovereign Bloc favors minds who recognize leverage."),
    ("london_lindqvist_burn.mp3", "lindqvist", "stage_drama", "gb", "intense", None,
     "Sentimental defiance. Remember this moment when the Rotunda turns cold."),
    ("london_nadia_trial00_1.mp3", "nadia", "stage_drama", "gb", "shocked", None,
     "Hold on—did you see the brass serial under my Rotunda plinth? Trial Double-Zero, dated twenty nineteen."),
    ("london_nadia_trial00_2.mp3", "nadia", "stage_drama", "gb", "shocked", None,
     "The Council swore Geneva this year was the first Meridian Trial. Why did my brother's handwriting mark this vault?"),
    ("london_teo_corridor_1.mp3", "teo", "stage_drama", "gb", "intense", "intimate_whisper",
     "Keep your voice down! Lindqvist's security detail just swept the green room looking for that Trial Zero plate."),
    ("london_vance_rotunda_1.mp3", "vance", "stage_drama", "gb", "neutral", None,
     "The Sovereign Rotunda is live. Two minds enter the armillary beam—only one claims the British visa."),

    # --- Stage 2 Tokyo: Soren 0.8s Telemetry & Live Jammer (8) ---
    ("tokyo_soren_backstage_1.mp3", "soren", "stage_drama", "jp", "smirk", None,
     "Nice view from the seventy-second floor, right? Down there is Shibuya—up here, information is currency."),
    ("tokyo_soren_telemetry_1.mp3", "teo", "stage_drama", "jp", "intense", None,
     "Look at this packet trace—Soren's locking answers in zero-point-eight seconds. Faster than human optic nerve latency!"),
    ("tokyo_soren_confront_1.mp3", "soren", "stage_drama", "jp", "smirk", None,
     "Caught my Horizon earpiece, did you? Name your price: share my probability lens, or trigger a live jammer and fly blind with me."),
    ("tokyo_soren_blackmail.mp3", "soren", "stage_drama", "jp", "smirk", None,
     "Smart business. Keep my secret, and my odds overlay is yours for the rest of the circuit."),
    ("tokyo_soren_jammer.mp3", "soren", "stage_drama", "jp", "smirk", None,
     "You actually fired the jammer live?! Crimson lights, sealed shutters—alright, let's see raw instinct!"),
    ("tokyo_vance_fracture.mp3", "vance", "stage_drama", "jp", "intense", None,
     "Signal anomaly detected in Sector Seven. Peeling shutters locked—we are live in Twist Fracture."),
    ("tokyo_soren_aftermath.mp3", "soren", "stage_drama", "jp", "neutral", None,
     "No feed, no odds, just pure nerve—and you still beat me. Listen: whoever bankrolled my feed answers to Cairo."),
    ("tokyo_teo_decrypt.mp3", "teo", "stage_drama", "jp", "intense", None,
     "Soren's encrypted relay bounces straight through a dormant diplomatic node beneath the Cairo Citadel."),

    # --- Rio Sabotage (4) ---
    ("rio_nadia_sabotage_1.mp3", "nadia", "stage_drama", "br", "shocked", None,
     "My Prism clamps are surging—someone spiked my pod's voltage! If I let go now, my shield shatters!"),
    ("rio_nadia_saved.mp3", "nadia", "stage_drama", "br", "neutral", None,
     "You burned your own Prism Shield to stabilize my pod... I won't forget this. From here to the Apex, we're allies."),
    ("rio_nadia_nemesis.mp3", "nadia", "stage_drama", "br", "shocked", None,
     "You watched my pod burn just to take the number-one seed. Fine—from now on, I target your weakest domain every match."),
    ("rio_teo_trace.mp3", "teo", "stage_drama", "br", "intense", None,
     "That voltage spike didn't come from the arena—it was triggered with a Council override key."),

    # --- Cairo Meridian Zero 99.4% Tariq Reveal (5) ---
    ("cairo_teo_match_1.mp3", "teo", "stage_drama", "eg", "intense", None,
     "Stop everything. Look at Julian Vance's private psychometric ledger: ninety-nine-point-four percent cognitive match."),
    ("cairo_nadia_tariq_1.mp3", "nadia", "stage_drama", "eg", "shocked", None,
     "Tariq Al-Mansoor... my brother won Trial Zero seven years ago—and refused to hand the Ledger veto key to Lindqvist."),
    ("cairo_vance_confess_1.mp3", "vance", "stage_drama", "eg", "intense", None,
     "I didn't recruit you by chance. Yours was the only mind on Earth capable of finishing what Tariq began."),
    ("cairo_fork_whistleblower.mp3", "teo", "stage_drama", "eg", "intense", None,
     "Broadcasting the Cairo files live! Two billion people just saw the Trial Zero cover-up!"),
    ("cairo_fork_insider.mp3", "vance", "stage_drama", "eg", "intense", None,
     "Hold the files close. Play the Council from the inside, and we take their entire board apart."),

    # --- Reykjavik Trojan Horse (5) ---
    ("reykjavik_tariq_reveal_1.mp3", "tariq", "stage_drama", "is", "neutral", None,
     "Step into the light. Yes—it's really me. Seven winters beneath the basalt caldera, waiting for a mind like yours."),
    ("reykjavik_tariq_trojan_1.mp3", "tariq", "stage_drama", "is", "neutral", None,
     "Julian staged my disappearance when Lindqvist ordered me silenced. Together, we built this Championship as a Trojan Horse."),
    ("reykjavik_vance_trojan_1.mp3", "vance", "stage_drama", "is", "intense", None,
     "Once two billion viewers crown you live at the Apex Forum, not even the World Council can erase the keyholder."),
    ("reykjavik_lindqvist_raid.mp3", "lindqvist", "stage_drama", "is", "intense", None,
     "Geothermal array located. Enjoy your reunion while it lasts—Singapore will separate pretenders from rulers."),
    ("reykjavik_tariq_gift.mp3", "tariq", "stage_drama", "is", "neutral", None,
     "Take my Cryo-Core cipher. Whatever happens in Singapore, do not let Lindqvist seize the Master Ledger."),

    # --- Singapore Betrayal (4) ---
    ("singapore_lindqvist_trap.mp3", "lindqvist", "stage_drama", "sg", "neutral", None,
     "Did you truly believe every ally in your corner was immune to price? Step forward and show them."),
    ("singapore_betrayal_soren.mp3", "soren", "stage_drama", "sg", "smirk", None,
     "Nothing personal, friend—the Council cleared my syndicate slate. Beat me clean, and I'll still hand you the override."),
    ("singapore_betrayal_nadia.mp3", "nadia", "stage_drama", "sg", "shocked", None,
     "Lindqvist promised me Tariq's freedom if I stop you tonight. Forgive me—family comes first."),
    ("singapore_betrayal_teo.mp3", "teo", "stage_drama", "sg", "intense", None,
     "They threatened my family in Geneva... I'm sorry! Solve the seal fast before my lockout finishes!"),

    # --- Apex Forum 3-Phase Vance Showdown (6) ---
    ("apex_vance_phase1.mp3", "vance", "stage_drama", "global", "intense", None,
     "Phase One: Gauntlet Shield Break. Prove your speed matches your conviction before the entire planet."),
    ("apex_vance_phase2.mp3", "vance", "stage_drama", "global", "intense", None,
     "Phase Two: Master Ledger Synthesis. Three interlocking historical and scientific truths—one single key."),
    ("apex_vance_phase3.mp3", "vance", "stage_drama", "global", "intense", None,
     "Final Phase: Sovereign Sudden Death. No shields, no redactions—just your mind against the architect of the Meridian."),
    ("apex_lindqvist_panic.mp3", "lindqvist", "stage_drama", "global", "intense", None,
     "Cut the satellite uplink! Do not let them unlock the Master Ledger on an open broadcast!"),
    ("apex_tariq_uplink.mp3", "tariq", "stage_drama", "global", "neutral", None,
     "Too late, Chancellor! Teo and I hard-locked every relay from Reykjavik to Tokyo—the whole world is watching!"),
    ("apex_vance_pass_torch.mp3", "vance", "stage_drama", "global", "neutral", None,
     "Seven years of shadow end tonight. The Veritas Prism is yours, Challenger. Make your final decree."),

    # --- 24 Modular Tier-2 Live Gameplay Callouts ---
    ("callout_vance_cold_instinct_1.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Cold Instinct at three-point-zero—ruthless."),
    ("callout_vance_cold_instinct_2.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Zero peel, pure conviction. Masterful."),
    ("callout_vance_tier2_peel_1.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Tier-Two Peel—trading multiplier for lateral clarity."),
    ("callout_vance_tier3_peel_1.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Blueprint Core exposed. Decoys shattered."),
    ("callout_vance_overclock_bold_1.mp3", "vance", "gameplay_callout", "any", "intense", None,
     "Bold Overclock! Six-times stakes on the line."),
    ("callout_vance_overclock_cancel.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Bluff Echo! Pulled back from the edge just in time."),
    ("callout_vance_calibrator_pinhole.mp3", "vance", "gameplay_callout", "any", "intense", None,
     "Pinhole tolerance—dead center on the chronometer!"),
    ("callout_vance_codex_lock.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Dual rings aligned. The cryptex yields."),
    ("callout_vance_gauntlet_sweep.mp3", "vance", "gameplay_callout", "any", "intense", None,
     "Clean Gauntlet shatter. Reflexes like lightning."),
    ("callout_vance_relic_latch.mp3", "vance", "gameplay_callout", "any", "neutral", None,
     "Relic latch unlocked. One step closer to the core."),
    ("callout_vance_final_question.mp3", "vance", "gameplay_callout", "any", "intense", None,
     "Final Prism on the table. Everything rides on this lock."),
    ("callout_nadia_overclock_taunt.mp3", "nadia", "gameplay_callout", "any", "neutral", None,
     "Overclocking against me? You'd better be dead certain."),
    ("callout_nadia_peel_taunt.mp3", "nadia", "gameplay_callout", "any", "neutral", None,
     "Peeling the seal already? Playing it safe, I see."),
    ("callout_nadia_impressed.mp3", "nadia", "gameplay_callout", "any", "shocked", None,
     "Okay—locking Cold Instinct on that domain was genuinely sharp."),
    ("callout_soren_bluff_1.mp3", "soren", "gameplay_callout", "any", "smirk", None,
     "My coin says you're bluffing that Overclock."),
    ("callout_soren_coin_freeze.mp3", "soren", "gameplay_callout", "any", "smirk", None,
     "Coin stopped spinning, friend. That means I already know it cold."),
    ("callout_soren_respect.mp3", "soren", "gameplay_callout", "any", "smirk", None,
     "Three-times Cold Instinct?! You're wrecking the spread!"),
    ("callout_teo_hint_nudge.mp3", "teo", "gameplay_callout", "any", "neutral", None,
     "If the wording looks tricky, pull the Brass Crown once for the lateral clue!"),
    ("callout_teo_bullseye.mp3", "teo", "gameplay_callout", "any", "neutral", None,
     "Dead bullseye on the dial! Look at that telemetry spike!"),
    ("callout_teo_shield_warn.mp3", "teo", "gameplay_callout", "any", "intense", None,
     "Careful—one Prism Shield left! Don't force a blind Overclock!"),
    ("callout_lindqvist_cold.mp3", "lindqvist", "gameplay_callout", "any", "neutral", None,
     "Impressive precision. Almost worthy of Council clearance."),
    ("callout_lindqvist_scorn.mp3", "lindqvist", "gameplay_callout", "any", "neutral", None,
     "Reckless wagering is the mark of an amateur."),
    ("callout_tariq_steady.mp3", "tariq", "gameplay_callout", "any", "neutral", None,
     "Trust the first connection your mind sees—don't second-guess it."),
    ("callout_tariq_triumph.mp3", "tariq", "gameplay_callout", "any", "neutral", None,
     "Flawless synthesis! That's how you outthink the Ledger."),
]


def find_bin(name: str) -> str:
    found = shutil.which(name)
    if found:
        return found
    p = Path(r"C:\Program Files\DownloadHelper App") / f"{name}.exe"
    if p.exists():
        return str(p)
    raise FileNotFoundError(name)


FFMPEG = find_bin("ffmpeg")
FFPROBE = find_bin("ffprobe")


async def synth_clip(
    entry: Tuple[str, str, str, str, str, Optional[str], str],
    tmp_dir: Path,
    sem: asyncio.Semaphore,
) -> Dict[str, object]:
    import edge_tts

    fname, actor_id, category, venue, expression, prof_override, text = entry
    actor = ACTORS[actor_id]
    profile = prof_override or actor["profile"]
    out_pub = PUBLIC_VOICE_DIR / fname
    out_god = GODOT_VOICE_DIR / fname
    raw_mp3 = tmp_dir / f"raw_{fname}"

    def probe_eb(p: Path) -> Tuple[float, float]:
        eb = subprocess.run(
            [FFMPEG, "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"],
            capture_output=True, text=True,
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

    # Reuse existing compliant file on disk if already generated with TP <= -1.1 dBTP!
    if out_pub.exists() and out_pub.stat().st_size > 2000:
        lufs, tp = probe_eb(out_pub)
        if tp <= -1.1:
            if not out_god.exists():
                shutil.copy2(out_pub, out_god)
            pr = subprocess.run(
                [FFPROBE, "-v", "error", "-show_entries", "format=duration,size", "-of", "json", str(out_pub)],
                capture_output=True, text=True, check=True,
            )
            fmt = json.loads(pr.stdout)["format"]
            return {
                "id": Path(fname).stem, "file": fname, "url": f"/assets/voice/{fname}",
                "actor": actor_id, "voice": actor["voice"], "category": category,
                "venue": venue, "expression": expression,
                "duration_s": round(float(fmt["duration"]), 2), "size_bytes": int(fmt["size"]),
                "lufs": round(lufs, 1), "true_peak_db": round(tp, 2), "text": text,
            }

    async with sem:
        for attempt in range(4):
            try:
                comm = edge_tts.Communicate(
                    text=text,
                    voice=actor["voice"],
                    rate=actor["rate"],
                    pitch=actor["pitch"],
                )
                await comm.save(str(raw_mp3))
                if raw_mp3.exists() and raw_mp3.stat().st_size > 1500:
                    break
            except Exception:
                await asyncio.sleep(1.0 + attempt)

    chain = VOICE_FILTER_CHAINS[profile].replace("limit=0.77", "limit=0.68")
    subprocess.run(
        [
            FFMPEG, "-y", "-v", "error",
            "-i", str(raw_mp3),
            "-af", chain,
            "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k", "-write_xing", "1",
            str(out_pub),
        ],
        check=True,
    )
    shutil.copy2(out_pub, out_god)
    lufs, tp = probe_eb(out_pub)

    pr = subprocess.run(
        [FFPROBE, "-v", "error", "-show_entries", "format=duration,size", "-of", "json", str(out_pub)],
        capture_output=True, text=True, check=True,
    )
    fmt = json.loads(pr.stdout)["format"]

    return {
        "id": Path(fname).stem,
        "file": fname,
        "url": f"/assets/voice/{fname}",
        "actor": actor_id,
        "voice": actor["voice"],
        "category": category,
        "venue": venue,
        "expression": expression,
        "duration_s": round(float(fmt["duration"]), 2),
        "size_bytes": int(fmt["size"]),
        "lufs": round(lufs, 1),
        "true_peak_db": round(tp, 2),
        "text": text,
    }


async def main() -> None:
    PUBLIC_VOICE_DIR.mkdir(parents=True, exist_ok=True)
    GODOT_VOICE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Generating {len(WAVE2_SPECS)} Wave-2 neural VO clips...")
    sem = asyncio.Semaphore(6)
    with tempfile.TemporaryDirectory(prefix="ws_vo_w2_") as td:
        items = await asyncio.gather(*(synth_clip(s, Path(td), sem) for s in WAVE2_SPECS))

    all_mp3s = sorted(PUBLIC_VOICE_DIR.glob("*.mp3"))
    max_tp = max(float(x["true_peak_db"]) for x in items)
    assert max_tp <= -1.0, f"True peak exceeded -1.0 dBTP: {max_tp}"

    manifest = {
        "schemaVersion": "2.0.0",
        "wave2Count": len(items),
        "totalVoiceFilesOnDisk": len(all_mp3s),
        "maxTruePeakDb": max_tp,
        "clips": items,
        "byId": {str(x["id"]): x for x in items},
    }
    manifest_path = PUBLIC_VOICE_DIR / "vo_wave2_manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(
        f"[DONE] Wave-2 VO complete: {len(items)} new clips, {len(all_mp3s)} total MP3s on disk, "
        f"maxTP={max_tp:.2f} dBTP -> {manifest_path}"
    )


if __name__ == "__main__":
    asyncio.run(main())
