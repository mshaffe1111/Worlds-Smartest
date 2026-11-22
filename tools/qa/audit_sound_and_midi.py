#!/usr/bin/env python3
"""
REDTEAM-FUN-UX-AUDIO — Pillar 1: Sound, VO, Foley, Room-Air & Zero-MIDI Audit
Read-only audit script writing diagnostic JSON summary to stdout.
"""
import json
import math
import os
import re
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
SRC = ROOT / "src"

def scan_midi_and_oscillators():
    midi_files = []
    for base in [SRC, PUBLIC]:
        for p in base.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".mid", ".midi", ".kar", ".rmi", ".sf2", ".xm", ".mod", ".it", ".s3m"}:
                midi_files.append(str(p.relative_to(ROOT)))

    synth_patterns = [
        (r"\bcreateOscillator\b", "WebAudio Oscillator"),
        (r"\bOscillatorNode\b", "WebAudio OscillatorNode"),
        (r"\bcreatePeriodicWave\b", "WebAudio PeriodicWave"),
        (r"\bTone\.Synth\b|\bTone\.PolySynth\b", "Tone.js Synth"),
        (r"\brequestMIDIAccess\b", "WebMIDI API"),
        (r"\.mid\b|\.midi\b", "MIDI file reference"),
    ]
    code_hits = []
    for p in SRC.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".ts", ".tsx", ".js", ".mjs", ".css", ".html"}:
            txt = p.read_text(encoding="utf-8", errors="replace")
            for lineno, line in enumerate(txt.splitlines(), 1):
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("*"):
                    continue
                for pat, label in synth_patterns:
                    if re.search(pat, line):
                        code_hits.append({
                            "file": str(p.relative_to(ROOT)),
                            "line": lineno,
                            "label": label,
                            "snippet": stripped[:140],
                        })
    return {"midiFiles": midi_files, "synthCodeHits": code_hits}


def find_ffmpeg() -> str:
    import shutil
    found = shutil.which("ffmpeg")
    if found:
        return found
    for c in [
        Path(r"C:\Program Files\DownloadHelper App\ffmpeg.exe"),
        Path(r"C:\Program Files\ffmpeg\bin\ffmpeg.exe"),
    ]:
        if c.exists():
            return str(c)
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


FFMPEG_EXE = find_ffmpeg()


def probe_audio_pcm(filepath: Path):
    """Uses ffmpeg to decode audio to 48kHz mono f32le PCM to measure exact peak dBFS, RMS dBFS, clipping samples, silence, and duration."""
    cmd = [
        FFMPEG_EXE, "-v", "error", "-i", str(filepath),
        "-f", "f32le", "-acodec", "pcm_f32le", "-ac", "1", "-ar", "48000", "pipe:1"
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0 or len(proc.stdout) == 0:
        return {
            "ok": False,
            "error": proc.stderr.decode("utf-8", errors="replace")[:200],
        }
    raw = proc.stdout
    n_samples = len(raw) // 4
    if n_samples == 0:
        return {"ok": False, "error": "0 decoded samples"}

    # Unpack in chunks to stay fast and low-memory
    max_abs = 0.0
    sum_sq = 0.0
    clipped_samples = 0
    chunk_floats = 65536
    mv = memoryview(raw)
    for offset in range(0, n_samples * 4, chunk_floats * 4):
        sub = mv[offset:min(n_samples * 4, offset + chunk_floats * 4)]
        cnt = len(sub) // 4
        vals = struct.unpack(f"<{cnt}f", sub)
        local_max = max(abs(x) for x in vals)
        if local_max > max_abs:
            max_abs = local_max
        sum_sq += sum(x * x for x in vals)
        clipped_samples += sum(1 for x in vals if abs(x) >= 0.999)

    dur_sec = n_samples / 48000.0
    peak_db = 20.0 * math.log10(max_abs) if max_abs > 1e-12 else -120.0
    rms = math.sqrt(sum_sq / n_samples)
    rms_db = 20.0 * math.log10(rms) if rms > 1e-12 else -120.0

    return {
        "ok": True,
        "durationSec": round(dur_sec, 3),
        "peakDb": round(peak_db, 2),
        "rmsDb": round(rms_db, 2),
        "clippedSamples": clipped_samples,
        "bytes": filepath.stat().st_size,
    }


def check_all_audio_files():
    voice_dir = PUBLIC / "assets" / "voice"
    audio_dir = PUBLIC / "assets" / "audio"

    vo_mp3s = sorted(voice_dir.glob("*.mp3"))
    manifest_path = voice_dir / "vo_wave2_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}

    vo_results = []
    vo_issues = []
    max_vo_peak = -120.0
    min_vo_dur = 999.0

    for mp3 in vo_mp3s:
        info = probe_audio_pcm(mp3)
        info["file"] = mp3.name
        vo_results.append(info)
        if not info.get("ok"):
            vo_issues.append({"file": mp3.name, "issue": f"Decode failed: {info.get('error')}"})
            continue
        if info["peakDb"] > max_vo_peak:
            max_vo_peak = info["peakDb"]
        if info["durationSec"] < min_vo_dur:
            min_vo_dur = info["durationSec"]
        if info["clippedSamples"] > 0 or info["peakDb"] > -0.3:
            vo_issues.append({"file": mp3.name, "issue": f"High peak/clipping: {info['peakDb']} dBFS ({info['clippedSamples']} clipped)"})
        if info["rmsDb"] < -48.0:
            vo_issues.append({"file": mp3.name, "issue": f"Near-silent VO: {info['rmsDb']} dBFS RMS"})
        if info["durationSec"] < 0.35:
            vo_issues.append({"file": mp3.name, "issue": f"Suspiciously short VO: {info['durationSec']}s"})

    # Check audio_dir (10 Foley mp3/wav + 5 ambience beds)
    sfx_files = sorted([p for p in audio_dir.iterdir() if p.is_file()])
    sfx_results = []
    sfx_issues = []
    for f in sfx_files:
        info = probe_audio_pcm(f)
        info["file"] = f.name
        sfx_results.append(info)
        if not info.get("ok"):
            sfx_issues.append({"file": f.name, "issue": f"Decode failed: {info.get('error')}"})
            continue
        if info["clippedSamples"] > 0 or info["peakDb"] > -0.1:
            sfx_issues.append({"file": f.name, "issue": f"Clipping/True-peak spike: {info['peakDb']} dBFS ({info['clippedSamples']} clipped)"})
        if f.name.startswith("ambience_"):
            if info["durationSec"] < 15.0:
                sfx_issues.append({"file": f.name, "issue": f"Short ambience loop: {info['durationSec']}s"})
            if info["rmsDb"] > -18.0 or info["rmsDb"] < -45.0:
                sfx_issues.append({"file": f.name, "issue": f"Ambience RMS out of room-air range: {info['rmsDb']} dBFS"})

    # Cross-check references in JSON & TS
    referenced_voice = set()
    for json_path in [PUBLIC / "data" / "campaign_20hr.json", PUBLIC / "data" / "narrative_wave2.json"]:
        if json_path.exists():
            raw = json_path.read_text(encoding="utf-8")
            for m in re.findall(r'assets/voice/([a-zA-Z0-9_\-]+\.(?:mp3|wav|ogg))', raw):
                referenced_voice.add(m)
    for ts_path in SRC.rglob("*.ts"):
        raw = ts_path.read_text(encoding="utf-8", errors="replace")
        for m in re.findall(r'assets/voice/([a-zA-Z0-9_\-]+\.(?:mp3|wav|ogg))', raw):
            referenced_voice.add(m)
        for m in re.findall(r"playVoice\(\s*['\"]([a-zA-Z0-9_\-]+)['\"]", raw):
            referenced_voice.add(f"{m}.mp3")

    existing_voice_names = {p.name for p in vo_mp3s}
    missing_voice_refs = sorted(referenced_voice - existing_voice_names)
    unreferenced_voice_files = sorted(existing_voice_names - referenced_voice)

    return {
        "voCount": len(vo_mp3s),
        "manifestWave2Count": manifest.get("wave2Count"),
        "maxVoPeakDb": round(max_vo_peak, 2),
        "minVoDurationSec": round(min_vo_dur, 3),
        "voIssues": vo_issues,
        "audioDirFileCount": len(sfx_files),
        "ambienceBeds": [r for r in sfx_results if r["file"].startswith("ambience_")],
        "foleyFiles": [r for r in sfx_results if r["file"].startswith("sfx_")],
        "sfxIssues": sfx_issues,
        "missingVoiceRefs": missing_voice_refs,
        "unreferencedVoiceCount": len(unreferenced_voice_files),
        "unreferencedVoiceSample": unreferenced_voice_files[:30],
    }


def main():
    midi_scan = scan_midi_and_oscillators()
    audio_audit = check_all_audio_files()
    out = {
        "midiAndSynthScan": midi_scan,
        "audioAudit": audio_audit,
    }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
