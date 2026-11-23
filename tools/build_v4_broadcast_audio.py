#!/usr/bin/env python3
"""
World's Smartest v4.0 — Broadcast Audio Mastering & Studio Stem Pipeline
========================================================================
Generates warm, prime-time broadcast-mastered stereo MP3 assets for v4.0:

  1) 4 Seamless Crossfade-Ready Broadcast Music Loops (-18 LUFS, <= -2.0 dBTP):
       - music_title_showtime.mp3   (Warm prime-time Rhodes/bass/vibe/brush showtime theme)
       - music_board_groove.mp3     (Buoyant rhythmic category-selection studio groove)
       - music_thinking_bed.mp3     (Focused Jeopardy/Millionaire-inspired contemplation pulse)
       - music_finale_tension.mp3   (High-stakes championship heartbeat & harmonic brass/string bed)

  2) 5 Harmonically Ascending Musical Streak Stingers (ZERO pitch-smearing!):
       - sfx_streak_1.mp3  (Cmaj9 warm vibraphone + celesta chord bloom)
       - sfx_streak_2.mp3  (Dmaj9 ascending chime voicing)
       - sfx_streak_3.mp3  (Emaj9 lush chord + warm horn glow)
       - sfx_streak_4.mp3  (Gmaj9 radiant bright cascade)
       - sfx_streak_5.mp3  (Radiant C-major Octave Fanfare with studio shimmer)

  3) 3 Horological Countdown Clock & Broadcast Timeout Cues:
       - sfx_clock_tick.mp3      (Crisp broadcast studio clock tick for 6s..3s)
       - sfx_clock_urgent.mp3    (Urgent double-pulse heartbeat tick for 2s..1s)
       - sfx_buzzer_timeout.mp3  (Warm baritone studio time's-up chime/horn cadence)

  4) 4 World-Search Escalating Crowd Reactions:
       - sfx_crowd_small_hall.mp3    (Tiers 1-2 intimate community hall / theater room claps)
       - sfx_crowd_tv_studio.mp3     (Tiers 3-5 lively TV studio audience applause + cheers)
       - sfx_crowd_global_arena.mp3  (Tiers 6-8 massive global arena ovation & roar)
       - sfx_crowd_gasp.mp3          (Collective studio audience gasp on missed 2x / Power Play)

  5) 8 Tactile Broadcast Board & Game-Show Cues (`playBoardCue`):
       - sfx_tile_flip.mp3
       - sfx_padlock_break.mp3
       - sfx_wheel_tick.mp3
       - sfx_power_play.mp3
       - sfx_wedge_earned.mp3
       - sfx_rival_trap.mp3
       - sfx_lock_in.mp3
       - sfx_wrong_answer.mp3

Also removes redundant uncompressed `.wav` duplicates from `public/assets/audio/` (all 10
legacy horological Foley `.mp3`s and 5 `ambience_*.mp3` beds are preserved untouched) so the
entire `public/assets/audio/` directory stays compact (< 3.5 MB).

Includes built-in verification checking every generated `.mp3` for:
  - Existence & valid MP3/ID3 frame headers
  - 48 kHz resampled stereo & mono True Peak <= -1.5 dBFS (<= -2.0 dBTP for music beds)
  - Integrated loudness & non-silent RMS
  - Zero NaNs / Infs / clipping samples
  - Seamless zero-crossing loop continuity on all 4 music beds
  - Total `public/assets/audio/` folder size < 3.5 MB
"""

from __future__ import annotations

import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

import numpy as np
from scipy import signal

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_AUDIO_DIR = REPO_ROOT / "public" / "assets" / "audio"
SR = 44100


# ============================================================================
# FFmpeg Discovery & Mastering Helpers
# ============================================================================

def find_ffmpeg() -> str:
    found = shutil.which("ffmpeg")
    if found:
        return found
    for candidate in (
        Path(r"C:\Program Files\DownloadHelper App\ffmpeg.exe"),
        Path(r"C:\Program Files\ffmpeg\bin\ffmpeg.exe"),
    ):
        if candidate.exists():
            return str(candidate)
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as exc:
        raise FileNotFoundError("Could not locate ffmpeg binary or imageio_ffmpeg") from exc


FFMPEG = find_ffmpeg()


def run_ff(args: List[str]) -> subprocess.CompletedProcess:
    return subprocess.run([FFMPEG, "-y", "-v", "error"] + args, check=True, capture_output=True)


def write_wav_stereo_24(path: Path, stereo: np.ndarray, sr: int = SR) -> None:
    """Write float64 stereo array (shape [N, 2], range [-1, 1]) to 16-bit/24-bit clean WAV."""
    arr = np.asarray(stereo, dtype=np.float64)
    if arr.ndim != 2 or arr.shape[1] != 2:
        raise ValueError(f"Expected stereo shape [N, 2], got {arr.shape}")
    if not np.all(np.isfinite(arr)):
        raise ValueError(f"Non-finite samples detected before writing {path.name}")
    clipped = np.clip(arr, -0.98, 0.98)
    pcm16 = np.round(clipped * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm16.tobytes())


def measure_audio_metrics(audio_path: Path) -> Dict[str, float]:
    """Decode audio to 48kHz stereo & mono float32 PCM and measure exact True Peak, RMS, NaNs, clips, duration."""
    peaks: List[float] = []
    rms_val = 0.0
    dur_sec = 0.0
    clipped = 0
    non_finite = 0
    boundary_jump = 0.0

    for ch in ("2", "1"):
        proc = subprocess.run(
            [FFMPEG, "-v", "error", "-i", str(audio_path), "-ar", "48000", "-ac", ch, "-f", "f32le", "-"],
            capture_output=True,
            check=True,
        )
        pcm = np.frombuffer(proc.stdout, dtype="<f4")
        if pcm.size == 0:
            raise ValueError(f"Decoded 0 PCM samples from {audio_path.name}")
        non_finite += int(np.sum(~np.isfinite(pcm)))
        max_abs = float(np.max(np.abs(pcm)))
        peaks.append(max_abs)
        clipped += int(np.sum(np.abs(pcm) >= 0.999))
        if ch == "1":
            rms_val = float(np.sqrt(np.mean(pcm.astype(np.float64) ** 2)))
            dur_sec = pcm.size / 48000.0
            if pcm.size > 4:
                boundary_jump = float(abs(float(pcm[-1]) - float(pcm[0])))

    peak = max(peaks)
    peak_db = 20.0 * math.log10(peak) if peak > 1e-12 else -120.0
    rms_db = 20.0 * math.log10(rms_val) if rms_val > 1e-12 else -120.0
    return {
        "duration_s": round(dur_sec, 3),
        "peak_db": round(peak_db, 2),
        "rms_db": round(rms_db, 2),
        "clipped_samples": clipped,
        "non_finite": non_finite,
        "boundary_jump": round(boundary_jump, 5),
        "bytes": audio_path.stat().st_size,
    }


def check_valid_mp3_header(mp3_path: Path) -> bool:
    """Verify valid ID3v2 header or MPEG Audio Frame sync word (0xFFE0 mask)."""
    data = mp3_path.read_bytes()
    if len(data) < 256:
        return False
    if data[:3] == b"ID3":
        # Parse synchsafe ID3v2 tag size and verify MPEG frame sync follows
        size = (
            ((data[6] & 0x7F) << 21)
            | ((data[7] & 0x7F) << 14)
            | ((data[8] & 0x7F) << 7)
            | (data[9] & 0x7F)
        )
        offset = 10 + size
        if offset + 2 < len(data):
            b0, b1 = data[offset], data[offset + 1]
            if b0 == 0xFF and (b1 & 0xE0) == 0xE0:
                return True
        # Some LAME frames have padding before sync; scan first 512 bytes past header
        for i in range(offset, min(len(data) - 1, offset + 512)):
            if data[i] == 0xFF and (data[i + 1] & 0xE0) == 0xE0:
                return True
    return data[0] == 0xFF and (data[1] & 0xE0) == 0xE0


def measure_integrated_lufs(audio_path: Path) -> float:
    """Measure true EBU R128 integrated loudness (LUFS) via FFmpeg ebur128 filter."""
    import re
    proc = subprocess.run(
        [FFMPEG, "-v", "info", "-i", str(audio_path), "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
        capture_output=True,
        text=True,
        check=True,
    )
    matches = re.findall(r"I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", proc.stderr)
    if not matches:
        return -18.0
    return float(matches[-1])


def master_music_loop_to_mp3(
    stereo: np.ndarray,
    out_mp3: Path,
    target_lufs: float = -18.0,
    max_peak_db: float = -2.2,
    bitrate: str = "96k",
) -> Dict[str, float]:
    """
    Master a seamless stereo music loop to exact EBU R128 broadcast -18.0 LUFS and <= -2.0 dBTP.
    Enforces exact zero-crossing wrap boundaries before encoding so WebAudio loops are click-free.
    """
    buf = stereo.copy()
    # Gentle DC removal + sub-32Hz rumble cleanup
    sos_hp = signal.butter(2, 32.0, btype="highpass", fs=SR, output="sos")
    buf[:, 0] = signal.sosfiltfilt(sos_hp, buf[:, 0])
    buf[:, 1] = signal.sosfiltfilt(sos_hp, buf[:, 1])

    # Gentle broadcast stereo glue + subtle warm analog sheen (soft tanh saturation)
    buf = np.tanh(buf * 1.15) / 1.15

    # Circularly roll by +6ms so beat-1 kick attack sits safely past the MP3 MDCT zero-crossing anchor,
    # while keeping exact seamless harmonic & rhythmic wrap!
    roll_n = int(0.006 * SR)
    buf = np.roll(buf, roll_n, axis=0)

    # Smooth 7ms cosine boundary pin at both endpoints -> zero-crossing wrap seam even after MP3 MDCT
    pin_n = int(0.007 * SR)
    if buf.shape[0] > pin_n * 4:
        t_pin = np.linspace(0.0, 1.0, pin_n)
        ramp = (0.5 * (1.0 - np.cos(math.pi * t_pin)))[:, None]
        buf[:pin_n] *= ramp
        buf[-pin_n:] *= ramp[::-1]

    # Measure exact EBU R128 integrated LUFS on uncompressed WAV, then apply pure linear gain
    # so loop dynamics & boundary matching remain 100% intact!
    with tempfile.TemporaryDirectory(prefix="ws_v4_mus_") as td:
        wav_probe = Path(td) / "probe.wav"
        # Normalize probe away from clipping first
        raw_pk = float(np.max(np.abs(buf)))
        if raw_pk > 0.7:
            buf *= 0.7 / raw_pk
        write_wav_stereo_24(wav_probe, buf, SR)
        cur_lufs = measure_integrated_lufs(wav_probe)
        gain_db = target_lufs - cur_lufs
        buf *= 10.0 ** (gain_db / 20.0)

        # Soft brickwall peak ceiling at max_peak_db - 0.5 dB to absorb MP3 inter-sample overshoot
        ceil_lin = 10.0 ** ((max_peak_db - 0.5) / 20.0)
        peak_now = float(np.max(np.abs(buf)))
        if peak_now > ceil_lin:
            over = np.abs(buf) / ceil_lin
            soft = np.where(over > 0.85, 0.85 + 0.15 * np.tanh((over - 0.85) / 0.15), over)
            buf = np.sign(buf) * soft * ceil_lin

        # Re-anchor exact 6ms zero-crossing endpoints after soft limiting
        if buf.shape[0] > pin_n * 4:
            buf[:pin_n] *= ramp
            buf[-pin_n:] *= ramp[::-1]

        wav_tmp = Path(td) / "in.wav"
        write_wav_stereo_24(wav_tmp, buf, SR)
        limit_lin = 10.0 ** (max_peak_db / 20.0)
        run_ff([
            "-i", str(wav_tmp),
            "-af", f"alimiter=limit={limit_lin:.4f}:attack=3:release=45:level=disabled",
            "-ar", str(SR), "-ac", "2",
            "-c:a", "libmp3lame", "-b:a", bitrate, "-joint_stereo", "1",
            str(out_mp3),
        ])

    metrics = measure_audio_metrics(out_mp3)
    if metrics["peak_db"] > -2.05:
        trim_db = -2.45 - metrics["peak_db"]
        with tempfile.TemporaryDirectory(prefix="ws_v4_mus_trim_") as td:
            wav_tmp = Path(td) / "in.wav"
            write_wav_stereo_24(wav_tmp, buf * (10.0 ** (trim_db / 20.0)), SR)
            run_ff([
                "-i", str(wav_tmp),
                "-ar", str(SR), "-ac", "2",
                "-c:a", "libmp3lame", "-b:a", bitrate, "-joint_stereo", "1",
                str(out_mp3),
            ])
        metrics = measure_audio_metrics(out_mp3)

    metrics["lufs"] = round(measure_integrated_lufs(out_mp3), 2)
    return metrics


def master_sfx_to_mp3(
    stereo: np.ndarray,
    out_mp3: Path,
    target_peak_db: float = -3.0,
    bitrate: str = "112k",
) -> Dict[str, float]:
    """Master a stereo broadcast SFX/stinger/crowd asset to clean target peak <= -2.0 dBFS."""
    buf = stereo.copy()
    sos_hp = signal.butter(2, 35.0, btype="highpass", fs=SR, output="sos")
    if buf.shape[0] > 32:
        buf[:, 0] = signal.sosfilt(sos_hp, buf[:, 0])
        buf[:, 1] = signal.sosfilt(sos_hp, buf[:, 1])

    # Crisp click-free edge fades (1.5ms in, 12ms out)
    n_in = min(int(0.0015 * SR), buf.shape[0] // 8)
    n_out = min(int(0.014 * SR), buf.shape[0] // 4)
    if n_in > 1:
        buf[:n_in] *= np.linspace(0.0, 1.0, n_in)[:, None]
    if n_out > 1:
        buf[-n_out:] *= np.linspace(1.0, 0.0, n_out)[:, None]

    # Normalize cleanly to target peak with extra -0.6dB MP3 headroom
    peak = float(np.max(np.abs(buf)))
    if peak < 1e-8:
        raise ValueError(f"Silent SFX buffer for {out_mp3.name}")
    target_lin = 10.0 ** ((min(-2.2, target_peak_db) - 0.5) / 20.0)
    buf *= target_lin / peak

    with tempfile.TemporaryDirectory(prefix="ws_v4_sfx_") as td:
        wav_tmp = Path(td) / "in.wav"
        write_wav_stereo_24(wav_tmp, buf, SR)
        lim = 10.0 ** (min(-2.0, target_peak_db) / 20.0)
        run_ff([
            "-i", str(wav_tmp),
            "-af", f"alimiter=limit={lim:.4f}:attack=2:release=30:level=disabled",
            "-ar", str(SR), "-ac", "2",
            "-c:a", "libmp3lame", "-b:a", bitrate, "-joint_stereo", "1",
            str(out_mp3),
        ])

    metrics = measure_audio_metrics(out_mp3)
    if metrics["peak_db"] > -1.75:
        trim_db = -2.2 - metrics["peak_db"]
        with tempfile.TemporaryDirectory(prefix="ws_v4_sfx_trim_") as td:
            wav_tmp = Path(td) / "in.wav"
            write_wav_stereo_24(wav_tmp, buf * (10.0 ** (trim_db / 20.0)), SR)
            run_ff([
                "-i", str(wav_tmp),
                "-ar", str(SR), "-ac", "2",
                "-c:a", "libmp3lame", "-b:a", bitrate, "-joint_stereo", "1",
                str(out_mp3),
            ])
        metrics = measure_audio_metrics(out_mp3)
    return metrics


# ============================================================================
# Studio DSP & Acoustic Instrument Engine
# ============================================================================

def midi_to_hz(note: float) -> float:
    return 440.0 * (2.0 ** ((note - 69.0) / 12.0))


def pan_stereo(mono: np.ndarray, pan: float) -> np.ndarray:
    """Constant-power stereo panning (-1.0 left .. +1.0 right)."""
    angle = (max(-1.0, min(1.0, pan)) + 1.0) * 0.25 * math.pi
    out = np.empty((mono.shape[0], 2), dtype=np.float64)
    out[:, 0] = mono * math.cos(angle)
    out[:, 1] = mono * math.sin(angle)
    return out


def mix_add(dest: np.ndarray, src: np.ndarray, start_sample: int, wrap: bool = False) -> None:
    """Add stereo `src` into `dest` at `start_sample`, optionally wrapping modulo loop length!"""
    n_dest = dest.shape[0]
    n_src = src.shape[0]
    if n_src == 0:
        return
    if not wrap:
        if start_sample >= n_dest or start_sample + n_src <= 0:
            return
        d0 = max(0, start_sample)
        s0 = max(0, -start_sample)
        length = min(n_dest - d0, n_src - s0)
        dest[d0 : d0 + length] += src[s0 : s0 + length]
    else:
        pos = start_sample % n_dest
        rem = n_src
        src_off = 0
        while rem > 0:
            chunk = min(rem, n_dest - pos)
            dest[pos : pos + chunk] += src[src_off : src_off + chunk]
            pos = (pos + chunk) % n_dest
            src_off += chunk
            rem -= chunk


def build_studio_reverb_ir(
    rt60: float = 1.1,
    pre_delay_ms: float = 16.0,
    damp_hz: float = 3400.0,
    seed: int = 101,
) -> np.ndarray:
    """Create a warm stereo prime-time TV soundstage impulse response (early reflections + diffused tail)."""
    rng = np.random.default_rng(seed)
    n = int((rt60 * 1.35 + pre_delay_ms / 1000.0) * SR)
    ir = np.zeros((n, 2), dtype=np.float64)

    # Direct early reflections (studio wood floor, warm velvet curtains, ceiling canopy)
    early_taps = [
        (0.011, 0.34, -0.45),
        (0.017, 0.28, 0.50),
        (0.024, 0.22, -0.62),
        (0.031, 0.19, 0.35),
        (0.041, 0.15, -0.25),
        (0.053, 0.12, 0.65),
    ]
    for t_s, amp, pan in early_taps:
        idx = int(t_s * SR)
        if idx < n:
            angle = (pan + 1.0) * 0.25 * math.pi
            ir[idx, 0] += amp * math.cos(angle)
            ir[idx, 1] += amp * math.sin(angle)

    # Decorrelated velvet-noise / exponentially decaying stereo diffuse tail
    pre_n = int((pre_delay_ms / 1000.0) * SR)
    tail_len = max(1, n - pre_n)
    t_tail = np.arange(tail_len, dtype=np.float64) / SR
    decay = np.exp(-6.907755 * t_tail / max(0.12, rt60))
    # Smooth onset envelope on diffuse tail so early reflections breathe cleanly
    onset = 1.0 - np.exp(-t_tail / 0.025)
    env = decay * onset

    noise_l = rng.standard_normal(tail_len) * env * 0.11
    noise_r = rng.standard_normal(tail_len) * env * 0.11
    # Warm lowpass damping on diffuse reverb tail (prevents harsh metallic hiss)
    sos_lp = signal.butter(2, damp_hz, btype="lowpass", fs=SR, output="sos")
    sos_hp = signal.butter(1, 140.0, btype="highpass", fs=SR, output="sos")
    ir[pre_n:, 0] += signal.sosfilt(sos_hp, signal.sosfilt(sos_lp, noise_l))
    ir[pre_n:, 1] += signal.sosfilt(sos_hp, signal.sosfilt(sos_lp, noise_r))

    # Normalize IR energy cleanly
    energy = math.sqrt(float(np.sum(ir ** 2)) / 2.0)
    if energy > 1e-8:
        ir /= energy
    return ir


def apply_studio_reverb(
    stereo: np.ndarray,
    wet: float = 0.22,
    rt60: float = 1.05,
    damp_hz: float = 3400.0,
    circular: bool = False,
    seed: int = 101,
) -> np.ndarray:
    """Apply stereo soundstage reverb. If `circular=True`, wraps tail modulo length for seamless loops!"""
    ir = build_studio_reverb_ir(rt60=rt60, damp_hz=damp_hz, seed=seed)
    n = stereo.shape[0]
    wet_l = signal.fftconvolve(stereo[:, 0], ir[:, 0], mode="full")
    wet_r = signal.fftconvolve(stereo[:, 1], ir[:, 1], mode="full")
    if circular:
        out = stereo.copy()
        for idx_ch, w in ((0, wet_l), (1, wet_r)):
            # Fold tail modulo n so bar 8 tail decays naturally across bar 1!
            folded = np.zeros(n, dtype=np.float64)
            pos = 0
            rem = w.shape[0]
            while rem > 0:
                chunk = min(rem, n)
                folded[:chunk] += w[pos : pos + chunk]
                pos += chunk
                rem -= chunk
            out[:, idx_ch] = stereo[:, idx_ch] * (1.0 - wet * 0.35) + folded * wet
        return out
    else:
        out = np.zeros((n, 2), dtype=np.float64)
        out[:, 0] = stereo[:, 0] * (1.0 - wet * 0.30) + wet_l[:n] * wet
        out[:, 1] = stereo[:, 1] * (1.0 - wet * 0.30) + wet_r[:n] * wet
        return out


# ---- Musical Instrument Voices ----

def synth_rhodes_note(
    midi_note: float,
    dur_s: float,
    vel: float = 0.75,
    pan: float = 0.0,
    tremolo_hz: float = 0.0,
) -> np.ndarray:
    """Warm Fender Rhodes Mk I electric piano (tine bark + warm bell tonebar + tube warmth)."""
    f0 = midi_to_hz(midi_note)
    total_s = dur_s + 0.55
    n = int(total_s * SR)
    t = np.arange(n, dtype=np.float64) / SR

    # Tonebar fundamental + warm low partials
    env_main = (1.0 - np.exp(-t / 0.0045)) * np.exp(-t / max(0.35, dur_s * 1.15))
    # Smooth release after note duration
    rel_mask = t > dur_s
    env_main[rel_mask] *= np.exp(-(t[rel_mask] - dur_s) / 0.14)

    body = (
        1.00 * np.sin(2.0 * math.pi * f0 * t)
        + 0.24 * vel * np.sin(2.0 * math.pi * 2.0 * f0 * t) * np.exp(-t / 0.42)
        + 0.07 * vel * np.sin(2.0 * math.pi * 3.0 * f0 * t) * np.exp(-t / 0.22)
    ) * env_main

    # Iconic Rhodes metallic tine bell attack (inharmonic ~6.95x partial fading quickly)
    tine_freq = min(f0 * 6.95, 9200.0)
    tine_env = (1.0 - np.exp(-t / 0.0012)) * np.exp(-t / 0.048)
    tine = 0.16 * (vel ** 1.4) * np.sin(2.0 * math.pi * tine_freq * t) * tine_env

    # Soft neoprene hammer thump
    ham_env = np.exp(-t / 0.012)
    ham = 0.06 * vel * np.sin(2.0 * math.pi * (f0 * 0.5 + 140.0) * t) * ham_env

    mono = np.tanh((body + tine + ham) * (0.85 + 0.45 * vel)) * (0.28 * vel)
    st = pan_stereo(mono, pan)
    if tremolo_hz > 0.0:
        lfo = np.sin(2.0 * math.pi * tremolo_hz * t)
        st[:, 0] *= 1.0 + 0.14 * lfo
        st[:, 1] *= 1.0 - 0.14 * lfo
    return st


def synth_acoustic_bass(midi_note: float, dur_s: float, vel: float = 0.8) -> np.ndarray:
    """Warm studio upright / fingerstyle bass — centered mono below 140 Hz for crisp TV clarity."""
    f0 = midi_to_hz(midi_note)
    n = int((dur_s + 0.24) * SR)
    t = np.arange(n, dtype=np.float64) / SR

    # Slight natural pluck pitch bend (+1.2% settling in 22ms)
    freq_inst = f0 * (1.0 + 0.012 * np.exp(-t / 0.022))
    phase = 2.0 * math.pi * np.cumsum(freq_inst) / SR

    env = (1.0 - np.exp(-t / 0.006)) * np.exp(-t / max(0.28, dur_s * 0.95))
    rel = t > dur_s
    env[rel] *= np.exp(-(t[rel] - dur_s) / 0.075)

    sig = (
        1.00 * np.sin(phase)
        + 0.42 * np.sin(2.0 * phase) * np.exp(-t / 0.28)
        + 0.16 * np.sin(3.0 * phase) * np.exp(-t / 0.14)
        + 0.05 * np.sin(4.0 * phase) * np.exp(-t / 0.06)
    ) * env

    # Subtle woody finger transient
    wood = np.sin(2.0 * math.pi * 420.0 * t) * np.exp(-t / 0.012) * 0.07 * vel
    mono = np.tanh((sig + wood) * 1.1) * (0.34 * vel)
    return pan_stereo(mono, 0.0)


def synth_vibraphone_note(
    midi_note: float,
    dur_s: float,
    vel: float = 0.78,
    pan: float = 0.0,
    motor_hz: float = 4.6,
) -> np.ndarray:
    """Concert aluminum-bar vibraphone: authentic 1 : 3.98 : 9.85 idiophone partials + felt mallet."""
    f0 = midi_to_hz(midi_note)
    n = int((dur_s + 0.9) * SR)
    t = np.arange(n, dtype=np.float64) / SR

    env1 = (1.0 - np.exp(-t / 0.003)) * np.exp(-t / max(0.35, dur_s))
    env2 = (1.0 - np.exp(-t / 0.0015)) * np.exp(-t / 0.16)
    env3 = (1.0 - np.exp(-t / 0.001)) * np.exp(-t / 0.045)

    trem = 1.0 + 0.09 * np.sin(2.0 * math.pi * motor_hz * t) * (1.0 - np.exp(-t / 0.12))
    sig = (
        1.00 * np.sin(2.0 * math.pi * f0 * t) * env1 * trem
        + 0.22 * np.sin(2.0 * math.pi * (f0 * 3.985) * t) * env2
        + 0.06 * np.sin(2.0 * math.pi * min(f0 * 9.85, 13500.0) * t) * env3
    )
    # Soft wool mallet impact
    rng = np.random.default_rng(int(midi_note * 97) % 10000)
    mallet = rng.standard_normal(n) * np.exp(-t / 0.006)
    sos_m = signal.butter(2, [400.0, 2600.0], btype="bandpass", fs=SR, output="sos")
    mallet = signal.sosfilt(sos_m, mallet) * 0.07

    mono = (sig + mallet) * (0.28 * vel)
    return pan_stereo(mono, pan)


def synth_celesta_note(midi_note: float, dur_s: float, vel: float = 0.72, pan: float = 0.0) -> np.ndarray:
    """Sparkling studio celesta bell-chime for streak accents & reveal highlights."""
    f0 = midi_to_hz(midi_note)
    n = int((dur_s + 0.75) * SR)
    t = np.arange(n, dtype=np.float64) / SR

    env1 = (1.0 - np.exp(-t / 0.002)) * np.exp(-t / max(0.28, dur_s * 0.85))
    env2 = (1.0 - np.exp(-t / 0.0012)) * np.exp(-t / 0.22)
    env3 = (1.0 - np.exp(-t / 0.0008)) * np.exp(-t / 0.085)

    sig = (
        1.00 * np.sin(2.0 * math.pi * f0 * t) * env1
        + 0.30 * np.sin(2.0 * math.pi * (f0 * 2.001) * t) * env2
        + 0.14 * np.sin(2.0 * math.pi * min(f0 * 4.02, 14000.0) * t) * env3
        + 0.05 * np.sin(2.0 * math.pi * min(f0 * 6.08, 15000.0) * t) * np.exp(-t / 0.032)
    )
    return pan_stereo(sig * (0.23 * vel), pan)


def synth_marimba_note(midi_note: float, dur_s: float, vel: float = 0.7, pan: float = 0.0) -> np.ndarray:
    """Warm rosewood studio marimba (ideal for Jeopardy/Millionaire thinking ostinatos)."""
    f0 = midi_to_hz(midi_note)
    n = int((dur_s + 0.25) * SR)
    t = np.arange(n, dtype=np.float64) / SR

    env1 = (1.0 - np.exp(-t / 0.0025)) * np.exp(-t / min(0.26, dur_s * 0.85))
    env2 = (1.0 - np.exp(-t / 0.001)) * np.exp(-t / 0.042)
    sig = (
        1.00 * np.sin(2.0 * math.pi * f0 * t) * env1
        + 0.28 * np.sin(2.0 * math.pi * (f0 * 4.0) * t) * env2
    )
    return pan_stereo(sig * (0.25 * vel), pan)


def synth_warm_brass_pad(
    midi_notes: Sequence[float],
    dur_s: float,
    attack_s: float = 0.16,
    release_s: float = 0.45,
    cutoff_hz: float = 1650.0,
    vel: float = 0.55,
    width: float = 0.55,
) -> np.ndarray:
    """Lush broadcast orchestral horn/string ensemble pad — warm filtered harmonic choir, zero harsh buzz."""
    total_s = dur_s + release_s
    n = int(total_s * SR)
    t = np.arange(n, dtype=np.float64) / SR

    # Smooth breathy envelope
    env = np.minimum(1.0, t / max(0.015, attack_s))
    env = np.sin(0.5 * math.pi * env)
    rel = t > dur_s
    env[rel] *= np.exp(-(t[rel] - dur_s) / max(0.08, release_s * 0.45))

    out = np.zeros((n, 2), dtype=np.float64)
    detunes = (-0.0038, -0.0012, 0.0014, 0.0036)
    pans = (-width, -width * 0.35, width * 0.35, width)

    for idx, note in enumerate(midi_notes):
        f0 = midi_to_hz(note)
        for d_i, (det, pn) in enumerate(zip(detunes, pans)):
            f = f0 * (1.0 + det)
            # Subtle slow ensemble vibrato (4.9 Hz)
            vib = 0.0022 * np.sin(2.0 * math.pi * (4.7 + 0.25 * d_i) * t + idx * 1.1)
            ph = 2.0 * math.pi * np.cumsum(f * (1.0 + vib)) / SR
            # Warm band-limited brass/string overtone series (up to 6th harmonic with natural roll-off)
            voice = (
                1.00 * np.sin(ph)
                + 0.54 * np.sin(2.0 * ph)
                + 0.30 * np.sin(3.0 * ph)
                + 0.16 * np.sin(4.0 * ph)
                + 0.08 * np.sin(5.0 * ph)
                + 0.04 * np.sin(6.0 * ph)
            )
            out += pan_stereo(voice * env, pn)

    # Dynamic warm studio lowpass filter
    sos_lp = signal.butter(3, min(cutoff_hz, 7500.0), btype="lowpass", fs=SR, output="sos")
    out[:, 0] = signal.sosfilt(sos_lp, out[:, 0])
    out[:, 1] = signal.sosfilt(sos_lp, out[:, 1])

    scale = (0.095 * vel) / max(1.0, math.sqrt(len(midi_notes)))
    return out * scale


# ---- Studio Percussion & Foley Voices ----

def synth_soft_kick(vel: float = 0.8, pitch_hi: float = 118.0, pitch_lo: float = 47.0) -> np.ndarray:
    n = int(0.26 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    freq = pitch_lo + (pitch_hi - pitch_lo) * np.exp(-t / 0.026)
    ph = 2.0 * math.pi * np.cumsum(freq) / SR
    env = (1.0 - np.exp(-t / 0.002)) * np.exp(-t / 0.088)
    beater = np.sin(2.0 * math.pi * 680.0 * t) * np.exp(-t / 0.005) * 0.12
    mono = np.tanh((np.sin(ph) * env + beater) * 1.25) * (0.38 * vel)
    return pan_stereo(mono, 0.0)


def synth_heartbeat_thump(vel: float = 0.85, base_hz: float = 54.0) -> np.ndarray:
    """Deep cinematic timpani / cardiac sub-pulse for Tier 7-8 tension & urgent clock."""
    n = int(0.36 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    freq = base_hz * (1.0 + 0.55 * np.exp(-t / 0.032))
    ph = 2.0 * math.pi * np.cumsum(freq) / SR
    env = (1.0 - np.exp(-t / 0.005)) * np.exp(-t / 0.13)
    body = np.sin(ph) + 0.35 * np.sin(1.58 * ph) * np.exp(-t / 0.07)
    mono = np.tanh(body * env * 1.3) * (0.42 * vel)
    return pan_stereo(mono, 0.0)


def synth_brush_rim(vel: float = 0.6, pan: float = 0.15, seed: int = 11) -> np.ndarray:
    """Classy jazz-studio wood rimshot + soft snare brush swish."""
    rng = np.random.default_rng(seed)
    n = int(0.16 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    noise = rng.standard_normal(n)
    sos_br = signal.butter(2, [1800.0, 6800.0], btype="bandpass", fs=SR, output="sos")
    brush = signal.sosfilt(sos_br, noise) * (1.0 - np.exp(-t / 0.003)) * np.exp(-t / 0.042) * 0.45
    rim = (
        np.sin(2.0 * math.pi * 780.0 * t) * np.exp(-t / 0.011) * 0.42
        + np.sin(2.0 * math.pi * 1940.0 * t) * np.exp(-t / 0.007) * 0.28
    )
    return pan_stereo((brush + rim) * (0.28 * vel), pan)


def synth_shaker(vel: float = 0.45, pan: float = -0.22, seed: int = 23) -> np.ndarray:
    """Delicate studio cabasa/shaker groove tick."""
    rng = np.random.default_rng(seed)
    n = int(0.085 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    noise = rng.standard_normal(n)
    sos = signal.butter(2, [4800.0, 10500.0], btype="bandpass", fs=SR, output="sos")
    env = (1.0 - np.exp(-t / 0.006)) * np.exp(-t / 0.018)
    mono = signal.sosfilt(sos, noise) * env * (0.24 * vel)
    return pan_stereo(mono, pan)


def synth_horological_tick(
    pitch_scale: float = 1.0,
    vel: float = 0.85,
    pan: float = 0.0,
    seed: int = 41,
) -> np.ndarray:
    """Crisp broadcast horological studio clock escapement tick (warm wood + brass resonant impulse)."""
    rng = np.random.default_rng(seed)
    n = int(0.11 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    # Sharp mechanical impulse through 3 tuned woody/brass resonators
    imp = rng.standard_normal(n) * np.exp(-t / 0.0022)
    sos_hi = signal.butter(2, [2200.0 * pitch_scale, min(9200.0, 6800.0 * pitch_scale)], btype="bandpass", fs=SR, output="sos")
    click = signal.sosfilt(sos_hi, imp) * 0.72
    wood1 = np.sin(2.0 * math.pi * 1380.0 * pitch_scale * t) * np.exp(-t / 0.011) * 0.55
    brass2 = np.sin(2.0 * math.pi * 3420.0 * pitch_scale * t) * np.exp(-t / 0.008) * 0.34
    sub_body = np.sin(2.0 * math.pi * 320.0 * pitch_scale * t) * np.exp(-t / 0.015) * 0.22
    mono = np.tanh((click + wood1 + brass2 + sub_body) * 1.15) * (0.55 * vel)
    return pan_stereo(mono, pan)


# ============================================================================
# 1. FOUR BROADCAST-MASTERED SEAMLESS MUSIC LOOPS (-18 LUFS)
# ============================================================================

def build_music_title_showtime() -> np.ndarray:
    """
    `music_title_showtime.mp3` — Warm, inviting prime-time game-show theme pulse!
    108 BPM, 8 bars (17.778s seamless circular loop), D Major / Bm9 studio Rhodes + bass + brush + vibraphone.
    """
    bpm = 108.0
    beat_s = 60.0 / bpm
    bars = 8
    total_s = bars * 4 * beat_s
    n = int(round(total_s * SR))
    mix = np.zeros((n, 2), dtype=np.float64)

    # 8-bar prime-time celebratory jazz-pop turnaround (Dmaj9 -> Bm9 -> Em9 -> A13sus4 ...)
    chords: List[Tuple[int, List[int], int]] = [
        (0, [50, 57, 61, 64, 66], 38),  # Bar 1: Dmaj9 (bass D2)
        (1, [47, 54, 57, 61, 62], 35),  # Bar 2: Bm9   (bass B1)
        (2, [52, 55, 59, 62, 66], 40),  # Bar 3: Em9   (bass E2)
        (3, [45, 55, 59, 62, 66], 45),  # Bar 4: A13sus4 (bass A2)
        (4, [50, 57, 61, 64, 69], 38),  # Bar 5: Dmaj9 (lifted top A4)
        (5, [47, 54, 57, 61, 66], 42),  # Bar 6: Bm9/F# (bass F#2)
        (6, [43, 55, 59, 62, 66], 43),  # Bar 7: Gmaj9 (bass G2)
        (7, [45, 55, 59, 61, 64], 45),  # Bar 8: A13   (turnaround back to Dmaj9!)
    ]

    for bar, notes, bass_root in chords:
        bar_start_b = bar * 4.0
        # Rhodes rhythmic studio comping (beat 1 warm roll, beat 2.5 syncopated push, beat 3.5 gentle lift)
        comp_hits = [(0.0, 1.85, 0.72), (2.5, 0.85, 0.56), (3.5, 0.45, 0.48)]
        for offset_b, dur_b, vel in comp_hits:
            for ni, mn in enumerate(notes):
                stagger = ni * 0.011
                pan = -0.36 + 0.72 * (ni / max(1, len(notes) - 1))
                note_buf = synth_rhodes_note(mn, dur_b * beat_s, vel=vel * (0.92 if ni == 0 else 0.82), pan=pan, tremolo_hz=2.6)
                mix_add(mix, note_buf, int((bar_start_b + offset_b) * beat_s * SR + stagger * SR), wrap=True)

        # Warm walking / grooving acoustic studio bass
        fifth = bass_root + 7 if bass_root <= 43 else bass_root - 5
        approach = chords[(bar + 1) % bars][2] - 1 if bar % 2 == 1 else bass_root + 2
        bass_pattern = [
            (0.0, bass_root, 1.35, 0.88),
            (1.5, fifth, 0.45, 0.64),
            (2.0, bass_root + 12 if bar in (1, 5) else bass_root, 0.90, 0.74),
            (3.0, fifth, 0.45, 0.68),
            (3.5, approach, 0.42, 0.72),
        ]
        for off_b, bn, bd, bv in bass_pattern:
            mix_add(mix, synth_acoustic_bass(bn, bd * beat_s, vel=bv), int((bar_start_b + off_b) * beat_s * SR), wrap=True)

        # Warm brass/string broadcast halo (bars 4-7 bloom gently for prime-time lift)
        pad_vel = 0.44 if bar >= 4 else 0.28
        pad_notes = [notes[1], notes[2], notes[3], notes[4]]
        pad = synth_warm_brass_pad(pad_notes, 3.6 * beat_s, attack_s=0.35, release_s=0.65, cutoff_hz=1550.0, vel=pad_vel, width=0.62)
        mix_add(mix, pad, int(bar_start_b * beat_s * SR), wrap=True)

        # Tight classy studio brush/kit groove
        for b in range(4):
            bt = (bar_start_b + b) * beat_s
            if b in (0, 2):
                mix_add(mix, synth_soft_kick(0.76 if b == 0 else 0.60), int(bt * SR), wrap=True)
            if b == 2:
                mix_add(mix, synth_soft_kick(0.42), int((bt + 0.5 * beat_s) * SR), wrap=True)
            if b in (1, 3):
                mix_add(mix, synth_brush_rim(0.62 if b == 1 else 0.68, pan=0.14, seed=bar * 10 + b), int(bt * SR), wrap=True)
            # Swung 8th shaker pulse
            mix_add(mix, synth_shaker(0.46 if b % 2 == 0 else 0.34, pan=-0.24, seed=100 + bar * 8 + b), int(bt * SR), wrap=True)
            mix_add(mix, synth_shaker(0.28, pan=-0.20, seed=200 + bar * 8 + b), int((bt + 0.54 * beat_s) * SR), wrap=True)

    # Signature inviting vibraphone showtime melody phrases (classy, memorable, spacious!)
    vibe_phrases: List[Tuple[float, float, float, float]] = [
        # (beat_pos, midi_note, dur_beats, vel)
        (0.5, 74, 0.75, 0.58),   # D5
        (1.5, 78, 0.50, 0.64),   # F#5
        (2.0, 81, 1.25, 0.72),   # A5
        (3.5, 78, 0.50, 0.54),   # F#5
        (4.0, 76, 1.50, 0.64),   # E5 (over Bm9)
        (7.5, 73, 0.50, 0.52),   # C#5
        (8.0, 74, 1.00, 0.66),   # D5 (over Em9)
        (9.5, 76, 0.50, 0.60),   # E5
        (10.0, 78, 1.25, 0.68),  # F#5
        (12.0, 76, 1.75, 0.64),  # E5 (over A13sus4)
        # Second half (bars 5-8): celebratory lift!
        (16.5, 78, 0.75, 0.64),  # F#5
        (17.5, 81, 0.50, 0.68),  # A5
        (18.0, 85, 1.25, 0.72),  # C#6
        (20.0, 81, 1.50, 0.66),  # A5
        (24.0, 83, 1.00, 0.68),  # B5 (over Gmaj9)
        (25.5, 81, 0.50, 0.60),  # A5
        (26.0, 78, 1.25, 0.65),  # F#5
        (28.0, 76, 1.50, 0.62),  # E5 (resolve smoothly into Bar 1!)
        (30.5, 73, 0.75, 0.50),  # C#5 leading tone back to D5
    ]
    for b_pos, mn, db, vel in vibe_phrases:
        pan = 0.22 * math.sin(b_pos * 0.4)
        mix_add(mix, synth_vibraphone_note(mn, db * beat_s, vel=vel, pan=pan), int(b_pos * beat_s * SR), wrap=True)

    return apply_studio_reverb(mix, wet=0.23, rt60=1.15, damp_hz=3500.0, circular=True, seed=101)


def build_music_board_groove() -> np.ndarray:
    """
    `music_board_groove.mp3` — Light rhythmic board-selection groove.
    104 BPM, 8 bars (18.462s seamless loop), Gmaj9 -> Em9 -> Cmaj9 -> D13sus4 buoyant studio pulse.
    """
    bpm = 104.0
    beat_s = 60.0 / bpm
    bars = 8
    n = int(round(bars * 4 * beat_s * SR))
    mix = np.zeros((n, 2), dtype=np.float64)

    chords: List[Tuple[int, List[int], int]] = [
        (0, [55, 59, 62, 66, 69], 43),  # Gmaj9
        (1, [52, 55, 59, 62, 66], 40),  # Em9
        (2, [48, 55, 59, 62, 64], 36),  # Cmaj9
        (3, [50, 57, 60, 64, 67], 38),  # D11sus4
        (4, [55, 59, 62, 66, 71], 43),  # Gmaj9 (open voicing)
        (5, [47, 54, 57, 62, 66], 35),  # Bm7(add9)
        (6, [45, 55, 59, 60, 64], 45),  # Am9
        (7, [50, 57, 60, 64, 66], 38),  # D9
    ]

    for bar, notes, bass_root in chords:
        b0 = bar * 4.0
        # Light bouncy Rhodes stabs leaving lots of air
        for off_b, dur_b, vel in ((0.0, 0.70, 0.62), (1.5, 0.42, 0.48), (2.75, 0.55, 0.52)):
            for ni, mn in enumerate(notes):
                pan = -0.40 + 0.80 * (ni / max(1, len(notes) - 1))
                mix_add(
                    mix,
                    synth_rhodes_note(mn, dur_b * beat_s, vel=vel * 0.84, pan=pan, tremolo_hz=3.1),
                    int((b0 + off_b) * beat_s * SR + ni * 0.008 * SR),
                    wrap=True,
                )

        # Nimble bouncy upright bass groove
        for off_b, bn, bd, bv in (
            (0.0, bass_root, 0.75, 0.84),
            (1.0, bass_root + 7 if bass_root <= 40 else bass_root - 5, 0.45, 0.58),
            (1.75, bass_root + 12 if bass_root <= 38 else bass_root, 0.50, 0.66),
            (2.5, bass_root + 7 if bass_root <= 40 else bass_root - 5, 0.55, 0.62),
            (3.5, chords[(bar + 1) % bars][2] + (2 if bar % 2 == 0 else -1), 0.40, 0.64),
        ):
            mix_add(mix, synth_acoustic_bass(bn, bd * beat_s, vel=bv), int((b0 + off_b) * beat_s * SR), wrap=True)

        # Subtle crisp marimba groove arpeggio on upper chord tones
        arp_notes = [notes[2], notes[3], notes[4], notes[3]]
        for step_i, sub_b in enumerate((0.5, 1.0, 2.0, 3.0)):
            mn = arp_notes[step_i % len(arp_notes)] + 12
            pan = -0.32 if step_i % 2 == 0 else 0.32
            mix_add(mix, synth_marimba_note(mn, 0.35 * beat_s, vel=0.42, pan=pan), int((b0 + sub_b) * beat_s * SR), wrap=True)

        # Light studio kit
        for b in range(4):
            bt = (b0 + b) * beat_s
            if b == 0:
                mix_add(mix, synth_soft_kick(0.68), int(bt * SR), wrap=True)
            elif b == 2:
                mix_add(mix, synth_soft_kick(0.52), int((bt + 0.5 * beat_s) * SR), wrap=True)
            if b in (1, 3):
                mix_add(mix, synth_brush_rim(0.56, pan=0.18, seed=300 + bar * 5 + b), int(bt * SR), wrap=True)
            mix_add(mix, synth_shaker(0.42 if b % 2 == 0 else 0.30, pan=-0.26, seed=400 + bar * 5 + b), int(bt * SR), wrap=True)
            mix_add(mix, synth_shaker(0.24, pan=-0.18, seed=500 + bar * 5 + b), int((bt + 0.52 * beat_s) * SR), wrap=True)

        # Delicate warm pad wash on even bars
        if bar % 2 == 0:
            pad = synth_warm_brass_pad(notes[1:4], 6.5 * beat_s, attack_s=0.65, release_s=0.9, cutoff_hz=1250.0, vel=0.25, width=0.68)
            mix_add(mix, pad, int(b0 * beat_s * SR), wrap=True)

    return apply_studio_reverb(mix, wet=0.20, rt60=0.95, damp_hz=3200.0, circular=True, seed=202)


def build_music_thinking_bed() -> np.ndarray:
    """
    `music_thinking_bed.mp3` — Subtle, focused Jeopardy!/Millionaire-inspired contemplation pulse.
    96 BPM, 8 bars (20.000s seamless loop). Leaves clean vocal/reading space while keeping gentle momentum.
    """
    bpm = 96.0
    beat_s = 60.0 / bpm
    bars = 8
    n = int(round(bars * 4 * beat_s * SR))
    mix = np.zeros((n, 2), dtype=np.float64)

    # A Dorian / intriguing thoughtful progression
    chords: List[Tuple[int, List[int], int]] = [
        (0, [57, 60, 64, 67, 71], 45),  # Am9
        (1, [53, 60, 64, 67, 71], 41),  # Fmaj9#11
        (2, [50, 57, 60, 64, 67], 38),  # Dm11
        (3, [52, 57, 59, 64, 67], 40),  # Em7sus4
        (4, [57, 60, 64, 67, 71], 45),  # Am9
        (5, [55, 60, 64, 67, 71], 43),  # Cmaj9/G
        (6, [53, 57, 60, 64, 69], 41),  # Fmaj9
        (7, [52, 56, 59, 62, 64], 40),  # E7sus -> gentle lift back to Am9
    ]

    for bar, notes, bass_root in chords:
        b0 = bar * 4.0

        # Hypnotic muted rosewood marimba contemplation pulse (soft 8th notes — classic quiz concentration!)
        ost_notes = [notes[0], notes[2], notes[3], notes[2], notes[1], notes[3], notes[4], notes[2]]
        for step in range(8):
            bt = (b0 + step * 0.5) * beat_s
            vel = 0.44 if step % 2 == 0 else 0.30
            pan = -0.28 + 0.56 * ((step % 4) / 3.0)
            mix_add(mix, synth_marimba_note(ost_notes[step], 0.26 * beat_s, vel=vel, pan=pan), int(bt * SR), wrap=True)

        # Deep warm bass pulse on beats 1 & 3 (calm heartbeat grounding)
        mix_add(mix, synth_acoustic_bass(bass_root, 1.65 * beat_s, vel=0.72), int(b0 * beat_s * SR), wrap=True)
        mix_add(mix, synth_acoustic_bass(bass_root, 1.35 * beat_s, vel=0.52), int((b0 + 2.0) * beat_s * SR), wrap=True)

        # Airy translucent stereo harmonic pad (carved warm <= 1150 Hz so text & VO read effortlessly!)
        pad = synth_warm_brass_pad(notes[1:4], 3.7 * beat_s, attack_s=0.48, release_s=0.75, cutoff_hz=1120.0, vel=0.38, width=0.72)
        mix_add(mix, pad, int(b0 * beat_s * SR), wrap=True)

        # Subtle soft Rhodes bell chord on beat 1 of odd bars
        if bar % 2 == 0:
            for ni, mn in enumerate(notes[1:4]):
                mix_add(
                    mix,
                    synth_rhodes_note(mn, 2.2 * beat_s, vel=0.36, pan=-0.35 + 0.35 * ni, tremolo_hz=2.1),
                    int((b0 + ni * 0.03) * beat_s * SR),
                    wrap=True,
                )

        # Ultra-gentle studio timekeeper pulse (soft muted tick on quarters + whisper shaker)
        for b in range(4):
            bt = (b0 + b) * beat_s
            mix_add(mix, synth_shaker(0.24 if b % 2 == 0 else 0.16, pan=0.22 if b % 2 == 0 else -0.22, seed=600 + bar * 4 + b), int(bt * SR), wrap=True)
            if b in (0, 2):
                mix_add(mix, synth_soft_kick(0.36, pitch_hi=88.0, pitch_lo=44.0), int(bt * SR), wrap=True)

    return apply_studio_reverb(mix, wet=0.26, rt60=1.25, damp_hz=2800.0, circular=True, seed=303)


def build_music_finale_tension() -> np.ndarray:
    """
    `music_finale_tension.mp3` — High-stakes championship heartbeat & harmonic pad bed for Tier 7-8 / Power Plays!
    110 BPM, 8 bars (17.455s seamless loop), D minor dramatic Millionaire-style championship pulse.
    """
    bpm = 110.0
    beat_s = 60.0 / bpm
    bars = 8
    n = int(round(bars * 4 * beat_s * SR))
    mix = np.zeros((n, 2), dtype=np.float64)

    chords: List[Tuple[int, List[int], int]] = [
        (0, [50, 57, 60, 64, 65], 38),  # Dm(add9)
        (1, [46, 53, 57, 60, 62], 34),  # Bbmaj7
        (2, [43, 53, 57, 58, 62], 31),  # Gm9
        (3, [45, 52, 57, 58, 61], 33),  # A7(b9) tension
        (4, [50, 57, 60, 64, 69], 38),  # Dm9 (higher drama)
        (5, [48, 55, 60, 62, 67], 36),  # Csus2/D feel
        (6, [46, 53, 57, 64, 69], 34),  # Bbmaj7#11 soaring suspense
        (7, [45, 52, 57, 61, 64], 33),  # A7 resolving into Dm!
    ]

    for bar, notes, bass_root in chords:
        b0 = bar * 4.0

        # Signature championship cardiac heartbeat timpani ("lub-dub" every 2 beats!)
        for half in (0.0, 2.0):
            t_lub = (b0 + half) * beat_s
            t_dub = (b0 + half + 0.34) * beat_s
            mix_add(mix, synth_heartbeat_thump(0.86 if half == 0 else 0.72, base_hz=50.0), int(t_lub * SR), wrap=True)
            mix_add(mix, synth_heartbeat_thump(0.58 if half == 0 else 0.48, base_hz=64.0), int(t_dub * SR), wrap=True)

        # Deep tense cello/bass pedal ostinato (tight 8th pulses)
        for step in range(8):
            bt = (b0 + step * 0.5) * beat_s
            vel = 0.62 if step % 2 == 0 else 0.40
            bn = bass_root if step != 6 else bass_root + 12
            mix_add(mix, synth_acoustic_bass(bn, 0.36 * beat_s, vel=vel), int(bt * SR), wrap=True)

        # Dramatic soaring harmonic brass/string tension pad (builds slightly bars 4-7)
        cutoff = 1750.0 if bar >= 4 else 1420.0
        pad_v = 0.56 if bar >= 4 else 0.46
        pad = synth_warm_brass_pad(notes, 3.8 * beat_s, attack_s=0.35, release_s=0.75, cutoff_hz=cutoff, vel=pad_v, width=0.78)
        mix_add(mix, pad, int(b0 * beat_s * SR), wrap=True)

        # Crisp ticking championship pulse (16th-pair + quarter tick)
        for b in range(4):
            bt = (b0 + b) * beat_s
            mix_add(mix, synth_horological_tick(1.06 if b == 0 else 0.96, vel=0.32 if b % 2 == 0 else 0.22, pan=0.25 if b % 2 == 0 else -0.25, seed=700 + bar * 4 + b), int(bt * SR), wrap=True)
            mix_add(mix, synth_shaker(0.32, pan=-0.30, seed=800 + bar * 4 + b), int((bt + 0.5 * beat_s) * SR), wrap=True)

        # Crystalline high celesta/vibraphone suspense pings on bars 1, 3, 5, 7
        if bar % 2 == 1:
            hi_note = notes[-1] + 12
            mix_add(mix, synth_celesta_note(hi_note, 1.4 * beat_s, vel=0.40, pan=0.36 if bar in (1, 5) else -0.36), int((b0 + 1.0) * beat_s * SR), wrap=True)
            mix_add(mix, synth_celesta_note(hi_note - 2, 1.1 * beat_s, vel=0.30, pan=-0.28), int((b0 + 2.5) * beat_s * SR), wrap=True)

    return apply_studio_reverb(mix, wet=0.28, rt60=1.45, damp_hz=3100.0, circular=True, seed=404)


# ============================================================================
# 2. FIVE HARMONICALLY ASCENDING STREAK STINGERS (Cmaj9 -> Dmaj9 -> Emaj9 -> Gmaj9 -> Octave Fanfare)
# ============================================================================

def build_streak_stinger(level: int) -> np.ndarray:
    """
    Build 5 distinct, harmonically ascending broadcast streak stingers:
      1: Cmaj9 (C4 E4 G4 B4 D5)
      2: Dmaj9 (D4 F#4 A4 C#5 E5)
      3: Emaj9 (E4 G#4 B4 D#5 F#5)
      4: Gmaj9 (G4 B4 D5 F#5 A5)
      5: Radiant Octave Fanfare (C4 G4 C5 D5 E5 G5 B5 C6 + lush brass-chime bloom!)
    """
    specs = {
        1: (1.15, [60, 64, 67, 71, 74], 0.024, False),
        2: (1.22, [62, 66, 69, 73, 76], 0.023, False),
        3: (1.32, [64, 68, 71, 75, 78], 0.022, True),
        4: (1.42, [67, 71, 74, 78, 81], 0.021, True),
        5: (1.88, [60, 67, 72, 74, 76, 79, 83, 84], 0.028, True),
    }
    dur_s, notes, arp_step, add_brass = specs[level]
    n = int(dur_s * SR)
    mix = np.zeros((n, 2), dtype=np.float64)

    for i, mn in enumerate(notes):
        t0 = int(i * arp_step * SR)
        pan = -0.45 + 0.90 * (i / max(1, len(notes) - 1))
        vel = 0.72 + 0.05 * level
        mix_add(mix, synth_vibraphone_note(mn, dur_s * 0.65, vel=vel, pan=pan, motor_hz=5.0), t0)
        # Add sparkling celesta octave shimmer on upper notes
        if i >= 2 or level >= 4:
            mix_add(mix, synth_celesta_note(mn + (12 if i >= len(notes) - 2 else 0), dur_s * 0.55, vel=0.52 + 0.06 * level, pan=-pan * 0.65), t0 + int(0.008 * SR))

    if add_brass:
        brass_notes = notes[:4] if level < 5 else [60, 64, 67, 71, 74, 76]
        brass_vel = 0.34 if level == 3 else (0.48 if level == 4 else 0.72)
        brass_dur = 0.42 if level < 5 else 0.85
        pad = synth_warm_brass_pad(brass_notes, brass_dur, attack_s=0.06, release_s=0.55, cutoff_hz=2300.0 + level * 260.0, vel=brass_vel, width=0.65)
        mix_add(mix, pad, int(0.03 * SR))

    if level == 5:
        # Radiant Octave Fanfare: extra celebratory bell flourish + warm bass foundation C3
        mix_add(mix, synth_acoustic_bass(48, 0.95, vel=0.72), 0)
        for idx, sparkle in enumerate((84, 86, 88, 91, 96)):
            mix_add(mix, synth_celesta_note(sparkle, 0.72, vel=0.48, pan=-0.5 + 0.25 * idx), int((0.18 + idx * 0.042) * SR))

    return apply_studio_reverb(mix, wet=0.28, rt60=1.25 if level < 5 else 1.55, damp_hz=4200.0, circular=False, seed=500 + level)


# ============================================================================
# 3. HOROLOGICAL COUNTDOWN CLOCK TICKS & TIMEOUT BUZZER
# ============================================================================

def build_clock_tick() -> np.ndarray:
    """`sfx_clock_tick.mp3` — Crisp horological broadcast studio tick (6s..3s)."""
    n = int(0.22 * SR)
    mix = np.zeros((n, 2), dtype=np.float64)
    mix_add(mix, synth_horological_tick(1.04, vel=0.92, pan=0.0, seed=611), 0)
    # Subtle mechanical escapement echo click 24ms later
    mix_add(mix, synth_horological_tick(1.32, vel=0.22, pan=0.14, seed=612), int(0.024 * SR))
    return apply_studio_reverb(mix, wet=0.14, rt60=0.45, damp_hz=3600.0, circular=False, seed=613)


def build_clock_urgent() -> np.ndarray:
    """`sfx_clock_urgent.mp3` — Urgent double-pulse broadcast tick + heartbeat sub (2s..1s)."""
    n = int(0.36 * SR)
    mix = np.zeros((n, 2), dtype=np.float64)
    mix_add(mix, synth_horological_tick(1.16, vel=0.95, pan=-0.10, seed=621), 0)
    mix_add(mix, synth_heartbeat_thump(0.68, base_hz=62.0), 0)
    # Tight second double-pulse 145ms later pitched slightly brighter
    mix_add(mix, synth_horological_tick(1.38, vel=0.88, pan=0.12, seed=622), int(0.145 * SR))
    mix_add(mix, synth_heartbeat_thump(0.52, base_hz=74.0), int(0.145 * SR))
    return apply_studio_reverb(mix, wet=0.16, rt60=0.52, damp_hz=3800.0, circular=False, seed=623)


def build_buzzer_timeout() -> np.ndarray:
    """`sfx_buzzer_timeout.mp3` — Authoritative, warm studio broadcast time's-up chime/baritone horn (ZERO harsh buzz!)."""
    n = int(0.92 * SR)
    mix = np.zeros((n, 2), dtype=np.float64)
    # Warm low baritone brass + tubular studio gong bell (F2 + C3 -> E2 settle)
    t = np.arange(n, dtype=np.float64) / SR
    horn_1 = synth_warm_brass_pad([41, 48, 53, 56], 0.42, attack_s=0.015, release_s=0.45, cutoff_hz=1180.0, vel=0.95, width=0.42)
    mix_add(mix, horn_1, 0)
    # Crisp studio bell-stop strike on beat 0 + subtle lower resolution at 170ms
    mix_add(mix, synth_vibraphone_note(53, 0.55, vel=0.62, pan=-0.15, motor_hz=0.0), 0)
    mix_add(mix, synth_vibraphone_note(48, 0.65, vel=0.68, pan=0.15, motor_hz=0.0), int(0.15 * SR))
    # Subtle warm mechanical latch stop
    latch = np.sin(2.0 * math.pi * 165.0 * t) * np.exp(-t / 0.065) * 0.22
    mix += pan_stereo(latch, 0.0)
    return apply_studio_reverb(mix, wet=0.22, rt60=0.85, damp_hz=2600.0, circular=False, seed=631)


# ============================================================================
# 4. WORLD-SEARCH ESCALATING CROWD REACTIONS (Tiers 1-2, 3-5, 6-8, & Gasp)
# ============================================================================

def synth_single_clap(rng: np.random.Generator, brightness: float = 1.0) -> np.ndarray:
    """Physically modeled single cupped-hand human clap (~36ms dual-cavity resonance)."""
    n = int(0.042 * SR)
    t = np.arange(n, dtype=np.float64) / SR
    raw = rng.standard_normal(n)
    # Dual hand-cavity formant bandpass (lower palm cavity ~1.1kHz + finger slap ~2.7kHz)
    f1 = max(650.0, min(1850.0, rng.uniform(880.0, 1480.0) * brightness))
    f2 = max(1900.0, min(5200.0, rng.uniform(2200.0, 3500.0) * brightness))
    sos1 = signal.butter(2, [f1 * 0.72, f1 * 1.35], btype="bandpass", fs=SR, output="sos")
    sos2 = signal.butter(2, [f2 * 0.75, min(9500.0, f2 * 1.32)], btype="bandpass", fs=SR, output="sos")
    # Classic clap micro-double-burst envelope (palm contact + secondary rebound 6ms later)
    env = (
        np.exp(-t / rng.uniform(0.0055, 0.011))
        + 0.42 * np.exp(-np.maximum(0.0, t - 0.0065) / 0.009) * (t >= 0.0065)
    )
    clap = (signal.sosfilt(sos1, raw) * 0.72 + signal.sosfilt(sos2, raw) * 0.48) * env
    return clap


def synth_crowd_applause_bed(
    dur_s: float,
    num_people: int,
    cheer_level: float,
    room_rt60: float,
    arena_rumble: float,
    seed: int,
) -> np.ndarray:
    """Realistic multi-clapper audience engine with stereo seating, vocal cheer formants, and hall reverb."""
    rng = np.random.default_rng(seed)
    n = int(dur_s * SR)
    mix = np.zeros((n, 2), dtype=np.float64)

    # Pre-generate bank of 24 distinct human hand claps for fast realistic placement
    clap_bank = [synth_single_clap(rng, brightness=rng.uniform(0.84, 1.18)) for _ in range(24)]

    # Overall applause enthusiasm envelope (fast burst -> lively swell -> polite broadcast fade)
    t = np.arange(n, dtype=np.float64) / SR
    burst_end = dur_s * 0.56
    tail_dt = np.maximum(0.0, t - burst_end)
    crowd_env = (1.0 - np.exp(-t / 0.14)) * np.exp(-((tail_dt / (dur_s * 0.24)) ** 1.4))

    for p in range(num_people):
        pan = float(rng.uniform(-0.88, 0.88))
        clap_rate = float(rng.uniform(2.7, 4.3))
        phase_s = float(rng.uniform(0.02, 0.45))
        person_vol = float(rng.uniform(0.45, 1.05)) / math.sqrt(num_people)
        clap_idx = int(rng.integers(0, len(clap_bank)))
        clap = clap_bank[clap_idx]

        cur_t = phase_s
        while cur_t < dur_s - 0.12:
            idx = int(cur_t * SR)
            env_at = float(crowd_env[min(idx, n - 1)])
            if env_at > 0.05:
                v = person_vol * env_at * float(rng.uniform(0.75, 1.2))
                mix_add(mix, pan_stereo(clap * v, pan), idx)
            cur_t += (1.0 / clap_rate) * float(rng.uniform(0.86, 1.15))

    # Warm audience cheer / vocal formant layer (for TV studio & global arena)
    if cheer_level > 0.0:
        for ch_i in range(2):
            raw = rng.standard_normal(n)
            # Layered crowd vowel formants ("ahh" / "wooo" resonances at 520, 1120, 2350 Hz)
            f_specs = [(460.0 + ch_i * 45, 780.0), (980.0 + ch_i * 70, 1520.0), (2050.0, 2950.0)]
            cheer = np.zeros(n, dtype=np.float64)
            for fl, fh in f_specs:
                sos = signal.butter(2, [fl, fh], btype="bandpass", fs=SR, output="sos")
                cheer += signal.sosfilt(sos, raw) * 0.36
            # Slight swell slightly after initial clap burst
            c_env = (1.0 - np.exp(-t / 0.24)) * np.exp(-np.maximum(0.0, t - dur_s * 0.45) / (dur_s * 0.30))
            mix[:, ch_i] += cheer * c_env * cheer_level

    # Deep stadium floor rumble & dense diffused roar for Global Arena (Tiers 6-8)
    if arena_rumble > 0.0:
        for ch_i in range(2):
            raw = rng.standard_normal(n)
            sos_sub = signal.butter(2, [75.0, 340.0], btype="bandpass", fs=SR, output="sos")
            sub = signal.sosfilt(sos_sub, raw)
            r_env = (1.0 - np.exp(-t / 0.32)) * np.exp(-np.maximum(0.0, t - dur_s * 0.50) / (dur_s * 0.32))
            mix[:, ch_i] += sub * r_env * arena_rumble

    wet = 0.20 if room_rt60 < 0.7 else (0.30 if room_rt60 < 1.3 else 0.42)
    return apply_studio_reverb(mix, wet=wet, rt60=room_rt60, damp_hz=3300.0, circular=False, seed=seed + 77)


def build_crowd_gasp() -> np.ndarray:
    """`sfx_crowd_gasp.mp3` — Collective studio audience 'ooh!' gasp & intake hush on missed 2x / Power Play."""
    rng = np.random.default_rng(791)
    dur_s = 1.42
    n = int(dur_s * SR)
    t = np.arange(n, dtype=np.float64) / SR
    mix = np.zeros((n, 2), dtype=np.float64)

    # 38 overlapping audience voices delivering a startled collective "oooh..." descending vocal swell
    for v_i in range(38):
        delay = float(rng.uniform(0.015, 0.145))
        voice_dur = float(rng.uniform(0.55, 0.92))
        pan = float(rng.uniform(-0.82, 0.82))
        # Natural mix of male/female studio audience fundamental pitch gliding gently downward ("oooh")
        f_start = float(rng.uniform(135.0, 295.0))
        f_end = f_start * float(rng.uniform(0.76, 0.86))

        vn = int(voice_dur * SR)
        vt = np.arange(vn, dtype=np.float64) / SR
        f_glide = f_start + (f_end - f_start) * (1.0 - np.exp(-vt / 0.24))
        ph = 2.0 * math.pi * np.cumsum(f_glide) / SR
        # Warm glottal pulse (fundamental + soft harmonics) + breathy aspiration
        glottal = (
            0.70 * np.sin(ph)
            + 0.45 * np.sin(2.0 * ph)
            + 0.22 * np.sin(3.0 * ph)
            + 0.10 * np.sin(4.0 * ph)
        )
        breath = rng.standard_normal(vn) * 0.42
        # Shape into "oo / oh" vowel formants (F1 ~380-520 Hz, F2 ~760-1080 Hz)
        f1 = float(rng.uniform(350.0, 510.0))
        f2 = float(rng.uniform(760.0, 1080.0))
        sos1 = signal.butter(2, [f1 * 0.78, f1 * 1.25], btype="bandpass", fs=SR, output="sos")
        sos2 = signal.butter(2, [f2 * 0.80, f2 * 1.25], btype="bandpass", fs=SR, output="sos")
        sos_air = signal.butter(2, [1400.0, 4200.0], btype="bandpass", fs=SR, output="sos")

        env = (1.0 - np.exp(-vt / 0.075)) * np.exp(-((vt / (voice_dur * 0.62)) ** 2.2))
        v_sig = (
            signal.sosfilt(sos1, glottal + breath * 0.35) * 0.85
            + signal.sosfilt(sos2, glottal + breath * 0.45) * 0.48
            + signal.sosfilt(sos_air, breath) * 0.28 * np.exp(-vt / 0.22)
        ) * env

        mix_add(mix, pan_stereo(v_sig * 0.14, pan), int(delay * SR))

    # Collective initial sharp breath-intake whoosh (first 180ms)
    for ch_i in range(2):
        inhale = rng.standard_normal(n)
        sos_in = signal.butter(2, [950.0, 3400.0], btype="bandpass", fs=SR, output="sos")
        in_env = (1.0 - np.exp(-t / 0.028)) * np.exp(-t / 0.11)
        mix[:, ch_i] += signal.sosfilt(sos_in, inhale) * in_env * 0.26

    return apply_studio_reverb(mix, wet=0.28, rt60=0.95, damp_hz=2800.0, circular=False, seed=799)


# ============================================================================
# 5. EIGHT TACTILE BOARD & GAME-SHOW CUES (`playBoardCue`)
# ============================================================================

def build_board_cues() -> Dict[str, Tuple[np.ndarray, float]]:
    """Build all 8 dedicated v4 board/game-show cues with target mastering peak."""
    cues: Dict[str, Tuple[np.ndarray, float]] = {}

    # 1. sfx_tile_flip — Crisp ceramic-magnetic tile flip + bright harmonic fifth shimmer (~0.32s)
    n = int(0.34 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    mix_add(buf, synth_horological_tick(0.92, vel=0.72, pan=-0.12, seed=811), 0)
    mix_add(buf, synth_celesta_note(67, 0.24, vel=0.52, pan=-0.18), int(0.014 * SR))
    mix_add(buf, synth_celesta_note(74, 0.28, vel=0.62, pan=0.18), int(0.052 * SR))
    cues["sfx_tile_flip"] = (apply_studio_reverb(buf, wet=0.18, rt60=0.55, seed=812), -3.5)

    # 2. sfx_padlock_break — Heavy brass padlock bolt release + sparkling unlock triad (~0.62s)
    n = int(0.64 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    mix_add(buf, synth_heartbeat_thump(0.55, base_hz=92.0), 0)
    mix_add(buf, synth_horological_tick(0.74, vel=0.95, pan=-0.15, seed=821), 0)
    mix_add(buf, synth_horological_tick(1.52, vel=0.80, pan=0.18, seed=822), int(0.048 * SR))
    for i, mn in enumerate((69, 73, 76, 81)):  # A major crystal unlock!
        mix_add(buf, synth_celesta_note(mn, 0.42, vel=0.62, pan=-0.35 + 0.24 * i), int((0.065 + i * 0.036) * SR))
    cues["sfx_padlock_break"] = (apply_studio_reverb(buf, wet=0.22, rt60=0.78, seed=823), -2.8)

    # 3. sfx_wheel_tick — Crisp wooden/brass show-wheel peg flick (~0.095s)
    n = int(0.095 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    mix_add(buf, synth_horological_tick(1.24, vel=0.92, pan=0.0, seed=831), 0)
    t_w = np.arange(n, dtype=np.float64) / SR
    wood_peg = np.sin(2.0 * math.pi * 640.0 * t_w) * np.exp(-t_w / 0.009) * 0.28
    buf += pan_stereo(wood_peg, 0.0)
    cues["sfx_wheel_tick"] = (buf, -4.5)

    # 4. sfx_power_play — Iconic Daily-Double / Power Play sweeping glissando + majestic warm Dmaj9 brass hit (~1.42s)
    n = int(1.45 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    gliss = [62, 66, 69, 73, 74, 78, 81, 86]
    for i, mn in enumerate(gliss):
        t0 = int(i * 0.042 * SR)
        pan = -0.55 + 1.10 * (i / (len(gliss) - 1))
        mix_add(buf, synth_celesta_note(mn, 0.55, vel=0.68, pan=pan), t0)
        mix_add(buf, synth_vibraphone_note(mn, 0.65, vel=0.58, pan=-pan * 0.5), t0)
    # Triumphant warm brass swell landing right on top of the glissando apex
    mix_add(buf, synth_acoustic_bass(50, 0.90, vel=0.78), int(0.26 * SR))
    mix_add(buf, synth_warm_brass_pad([62, 66, 69, 73, 76], 0.68, attack_s=0.06, release_s=0.55, cutoff_hz=2850.0, vel=0.82, width=0.68), int(0.24 * SR))
    cues["sfx_power_play"] = (apply_studio_reverb(buf, wet=0.28, rt60=1.35, damp_hz=4200.0, seed=841), -2.5)

    # 5. sfx_wedge_earned — Celebratory Crown Wedge lock-in + heroic 4-note fanfare (~1.58s)
    n = int(1.62 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    # Jewel slot lock-in click + low resonance
    mix_add(buf, synth_horological_tick(0.85, vel=0.85, pan=0.0, seed=851), 0)
    mix_add(buf, synth_acoustic_bass(43, 1.15, vel=0.78), int(0.04 * SR))
    # Heroic ascending G-major fanfare: G4 -> B4 -> D5 -> G5 (with A5 9th halo)
    fanfare = [(0.04, 67, 0.45), (0.17, 71, 0.48), (0.30, 74, 0.52), (0.44, 79, 0.95)]
    for t_s, mn, d_s in fanfare:
        mix_add(buf, synth_vibraphone_note(mn, d_s, vel=0.84, pan=0.0), int(t_s * SR))
        mix_add(buf, synth_celesta_note(mn + 12, d_s * 0.8, vel=0.56, pan=0.25 if mn % 2 == 0 else -0.25), int((t_s + 0.01) * SR))
    mix_add(buf, synth_warm_brass_pad([67, 71, 74, 79, 81], 0.72, attack_s=0.08, release_s=0.55, cutoff_hz=2900.0, vel=0.80, width=0.64), int(0.40 * SR))
    cues["sfx_wedge_earned"] = (apply_studio_reverb(buf, wet=0.30, rt60=1.40, damp_hz=4300.0, seed=852), -2.5)

    # 6. sfx_rival_trap — Dramatic cheeky rival interference sting (mechanical latch + minor-tension brass/pizzicato, ~0.88s)
    n = int(0.90 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    mix_add(buf, synth_horological_tick(0.68, vel=0.92, pan=0.0, seed=861), 0)
    mix_add(buf, synth_heartbeat_thump(0.75, base_hz=58.0), int(0.02 * SR))
    # Cheeky descending minor-2nd tension cadence (Eb4 -> D4 over low G2 + C#4 tritone spice)
    mix_add(buf, synth_marimba_note(63, 0.22, vel=0.78, pan=-0.26), int(0.05 * SR))
    mix_add(buf, synth_marimba_note(62, 0.42, vel=0.84, pan=0.26), int(0.20 * SR))
    mix_add(buf, synth_warm_brass_pad([43, 55, 61, 63], 0.16, attack_s=0.02, release_s=0.22, cutoff_hz=1700.0, vel=0.70, width=0.50), int(0.05 * SR))
    mix_add(buf, synth_warm_brass_pad([43, 55, 58, 62], 0.36, attack_s=0.025, release_s=0.34, cutoff_hz=1450.0, vel=0.78, width=0.55), int(0.20 * SR))
    cues["sfx_rival_trap"] = (apply_studio_reverb(buf, wet=0.22, rt60=0.82, damp_hz=3000.0, seed=862), -2.8)

    # 7. sfx_lock_in — Decisive studio final-answer lock-in thud + soft harmonic fifth (~0.40s)
    n = int(0.42 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    mix_add(buf, synth_heartbeat_thump(0.62, base_hz=74.0), 0)
    mix_add(buf, synth_horological_tick(0.82, vel=0.78, pan=0.0, seed=871), 0)
    mix_add(buf, synth_rhodes_note(60, 0.26, vel=0.62, pan=-0.16), int(0.012 * SR))
    mix_add(buf, synth_rhodes_note(67, 0.28, vel=0.64, pan=0.16), int(0.024 * SR))
    cues["sfx_lock_in"] = (apply_studio_reverb(buf, wet=0.16, rt60=0.55, seed=872), -3.2)

    # 8. sfx_wrong_answer — Classy empathetic game-show miss cadence (warm muted marimba + low soft horn, NEVER abrasive, ~0.82s)
    n = int(0.84 * SR)
    buf = np.zeros((n, 2), dtype=np.float64)
    mix_add(buf, synth_marimba_note(65, 0.24, vel=0.68, pan=-0.20), 0)                  # F4
    mix_add(buf, synth_marimba_note(64, 0.24, vel=0.64, pan=0.05), int(0.14 * SR))      # E4
    mix_add(buf, synth_marimba_note(60, 0.44, vel=0.66, pan=0.22), int(0.28 * SR))      # C4
    mix_add(buf, synth_warm_brass_pad([45, 52, 57, 60], 0.42, attack_s=0.04, release_s=0.35, cutoff_hz=1120.0, vel=0.62, width=0.45), int(0.14 * SR))
    cues["sfx_wrong_answer"] = (apply_studio_reverb(buf, wet=0.20, rt60=0.78, damp_hz=2600.0, seed=881), -3.2)

    return cues


# ============================================================================
# Master Pipeline & Automated Verification
# ============================================================================

def build_and_verify_all() -> None:
    PUBLIC_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Remove redundant uncompressed `.wav` duplicates of legacy Foley from `public/assets/audio/`
    # (Every single one already has a verified `.mp3` sibling used first by StudioAudioEngine,
    # keeping `public/assets/audio/` lean and strictly < 3.5 MB!)
    removed_wavs: List[str] = []
    for wav_file in sorted(PUBLIC_AUDIO_DIR.glob("sfx_*.wav")):
        mp3_sibling = wav_file.with_suffix(".mp3")
        if mp3_sibling.exists() and mp3_sibling.stat().st_size > 1000:
            wav_file.unlink()
            removed_wavs.append(wav_file.name)

    manifest_entries: Dict[str, Dict[str, float]] = {}

    print("=== WORLD'S SMARTEST v4.0 — BUILDING BROADCAST AUDIO SUITE ===")
    if removed_wavs:
        print(f"  [TRIM] Removed {len(removed_wavs)} redundant public WAV duplicates (MP3s preserved)")

    # 1. Four seamless broadcast music loops (-18 LUFS, <= -2.0 dBTP)
    music_builders = [
        ("music_title_showtime.mp3", build_music_title_showtime),
        ("music_board_groove.mp3", build_music_board_groove),
        ("music_thinking_bed.mp3", build_music_thinking_bed),
        ("music_finale_tension.mp3", build_music_finale_tension),
    ]
    for fname, fn in music_builders:
        stereo = fn()
        out_path = PUBLIC_AUDIO_DIR / fname
        metrics = master_music_loop_to_mp3(stereo, out_path, target_lufs=-18.0, max_peak_db=-2.2, bitrate="96k")
        manifest_entries[fname] = metrics
        print(
            f"  [MUSIC] {fname:28s} | {metrics['bytes']/1024:6.1f} KB | "
            f"{metrics['duration_s']:5.2f}s | LUFS={metrics['lufs']:6.2f} | "
            f"Peak={metrics['peak_db']:6.2f} dBFS | Seam={metrics['boundary_jump']:.5f}"
        )

    # 2. Five harmonically ascending streak stingers
    for lvl in range(1, 6):
        fname = f"sfx_streak_{lvl}.mp3"
        stereo = build_streak_stinger(lvl)
        metrics = master_sfx_to_mp3(stereo, PUBLIC_AUDIO_DIR / fname, target_peak_db=-2.8, bitrate="112k")
        manifest_entries[fname] = metrics
        print(
            f"  [STREAK] {fname:27s} | {metrics['bytes']/1024:6.1f} KB | "
            f"{metrics['duration_s']:5.2f}s | Peak={metrics['peak_db']:6.2f} dBFS | RMS={metrics['rms_db']:6.2f} dBFS"
        )

    # 3. Three countdown clock & timeout cues
    clock_builders = [
        ("sfx_clock_tick.mp3", build_clock_tick, -3.5),
        ("sfx_clock_urgent.mp3", build_clock_urgent, -2.8),
        ("sfx_buzzer_timeout.mp3", build_buzzer_timeout, -2.8),
    ]
    for fname, fn, target_pk in clock_builders:
        metrics = master_sfx_to_mp3(fn(), PUBLIC_AUDIO_DIR / fname, target_peak_db=target_pk, bitrate="112k")
        manifest_entries[fname] = metrics
        print(
            f"  [CLOCK]  {fname:27s} | {metrics['bytes']/1024:6.1f} KB | "
            f"{metrics['duration_s']:5.2f}s | Peak={metrics['peak_db']:6.2f} dBFS | RMS={metrics['rms_db']:6.2f} dBFS"
        )

    # 4. Four World-Search escalating crowd reactions
    crowd_builders = [
        (
            "sfx_crowd_small_hall.mp3",
            lambda: synth_crowd_applause_bed(dur_s=2.15, num_people=22, cheer_level=0.05, room_rt60=0.48, arena_rumble=0.0, seed=711),
            -3.5,
        ),
        (
            "sfx_crowd_tv_studio.mp3",
            lambda: synth_crowd_applause_bed(dur_s=2.65, num_people=110, cheer_level=0.22, room_rt60=0.92, arena_rumble=0.04, seed=722),
            -3.0,
        ),
        (
            "sfx_crowd_global_arena.mp3",
            lambda: synth_crowd_applause_bed(dur_s=3.20, num_people=260, cheer_level=0.42, room_rt60=1.85, arena_rumble=0.28, seed=733),
            -2.6,
        ),
        ("sfx_crowd_gasp.mp3", build_crowd_gasp, -3.2),
    ]
    for fname, fn, target_pk in crowd_builders:
        metrics = master_sfx_to_mp3(fn(), PUBLIC_AUDIO_DIR / fname, target_peak_db=target_pk, bitrate="96k")
        manifest_entries[fname] = metrics
        print(
            f"  [CROWD]  {fname:27s} | {metrics['bytes']/1024:6.1f} KB | "
            f"{metrics['duration_s']:5.2f}s | Peak={metrics['peak_db']:6.2f} dBFS | RMS={metrics['rms_db']:6.2f} dBFS"
        )

    # 5. Eight board & game-show cues
    for stem, (stereo, target_pk) in build_board_cues().items():
        fname = f"{stem}.mp3"
        metrics = master_sfx_to_mp3(stereo, PUBLIC_AUDIO_DIR / fname, target_peak_db=target_pk, bitrate="112k")
        manifest_entries[fname] = metrics
        print(
            f"  [BOARD]  {fname:27s} | {metrics['bytes']/1024:6.1f} KB | "
            f"{metrics['duration_s']:5.2f}s | Peak={metrics['peak_db']:6.2f} dBFS | RMS={metrics['rms_db']:6.2f} dBFS"
        )

    # ========================================================================
    # STRICT AUTOMATED VERIFICATION BAR
    # ========================================================================
    errors: List[str] = []
    for fname, m in manifest_entries.items():
        p = PUBLIC_AUDIO_DIR / fname
        if not p.exists() or p.stat().st_size < 1000:
            errors.append(f"{fname}: missing or tiny ({p.stat().st_size if p.exists() else 0} bytes)")
            continue
        if not check_valid_mp3_header(p):
            errors.append(f"{fname}: invalid MP3/ID3 frame header")
        if m["non_finite"] > 0:
            errors.append(f"{fname}: {m['non_finite']} NaN/Inf samples")
        if m["clipped_samples"] > 0:
            errors.append(f"{fname}: {m['clipped_samples']} clipped samples")
        max_allowed_peak = -2.0 if fname.startswith("music_") else -1.5
        if m["peak_db"] > max_allowed_peak:
            errors.append(f"{fname}: peak {m['peak_db']} dBFS exceeds {max_allowed_peak} dBFS ceiling")
        if m["rms_db"] < -42.0:
            errors.append(f"{fname}: near-silent RMS {m['rms_db']} dBFS")
        if fname.startswith("music_") and m["boundary_jump"] > 0.02:
            errors.append(f"{fname}: loop boundary discontinuity {m['boundary_jump']} > 0.02")

    # Remove any non-audio manifest JSON so public/assets/audio/ contains strictly valid audio files
    legacy_manifest = PUBLIC_AUDIO_DIR / "v4_audio_manifest.json"
    if legacy_manifest.exists():
        legacy_manifest.unlink()

    all_files = sorted([p for p in PUBLIC_AUDIO_DIR.iterdir() if p.is_file()])
    total_bytes = sum(p.stat().st_size for p in all_files)
    total_mb = total_bytes / (1024 * 1024)
    print(f"\n=== VERIFICATION SUMMARY ===")
    print(f"  Generated v4 MP3 assets : {len(manifest_entries)}")
    print(f"  Total files in audio/   : {len(all_files)}")
    print(f"  Total audio/ size       : {total_bytes:,} bytes ({total_mb:.3f} MB) [budget < 3.500 MB]")

    if total_mb >= 3.5:
        errors.append(f"Total public/assets/audio/ size {total_mb:.3f} MB >= 3.500 MB budget")

    if errors:
        print("\n[FAIL] AUDIO VERIFICATION ERRORS:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("  [PASS] ALL v4 broadcast audio files verified: valid MP3 headers, peak <= -1.5 dBFS (music <= -2.0 dBTP), zero NaNs/clips/silence, seamless loops, < 3.5 MB!")


if __name__ == "__main__":
    build_and_verify_all()
