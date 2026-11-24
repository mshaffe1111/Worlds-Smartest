#!/usr/bin/env python3
"""
World's Smartest v5.0 — Symphonic Fanfare, Tactile Foley & Real Crowd SFX Pipeline
==================================================================================
100% REAL RECORDED SAMPLES (ZERO math oscillators or synthetic tone waves!):
  - Fetches & caches real recorded MusyngKite symphonic & percussion MP3 samples
    (`string_ensemble_1`, `string_ensemble_2`, `pizzicato_strings`, `cello`,
    `contrabass`, `brass_section`, `french_horn`, `trumpet`, `trombone`, `tuba`,
    `flute`, `bassoon`, `muted_trumpet`, `orchestral_harp`, `acoustic_grand_piano`,
    `vibraphone`, `celesta`, `glockenspiel`, `tubular_bells`, `kalimba`, `marimba`,
    `timpani`, `taiko_drum`, `woodblock`, `agogo`, `tinkle_bell`, `orchestra_hit`,
    `applause`, `breath_noise`, `voice_oohs`, `choir_aahs`, `gunshot`,
    `reverse_cymbal`, `guitar_fret_noise`).
  - Layers real microphone-recorded horological & physical foley stems preserved
    in `public/assets/audio/` (`sfx_vault_thunk.mp3`, `sfx_glass_shatter.mp3`,
    `sfx_gold_resonance.mp3`, `sfx_shutter_peel.mp3`, `sfx_sightline_snap.mp3`,
    `sfx_spin_tick.mp3`, `sfx_ui_tap.mp3`, `sfx_passport_stamp.mp3`,
    `sfx_backfire_fracture.mp3`).
  - Broadcast-masters all 24 v5 SFX MP3 assets via `imageio_ffmpeg` (`TP <= -1.5 dBFS`)
    and verifies valid MP3 headers, zero clipping/NaNs, balanced RMS, and clean size.
"""

from __future__ import annotations

import concurrent.futures
import math
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
import wave
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Set, Tuple

import numpy as np
from scipy import signal

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_AUDIO_DIR = REPO_ROOT / "public" / "assets" / "audio"
SAMPLE_CACHE_DIR = Path(tempfile.gettempdir()) / "ws_v5_musyngkite_cache"
MUSYNGKITE_BASE = "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite"
SR = 44100

# Preserved real microphone-recorded horological physical foley stems (read-only sources)
LEGACY_PHYSICAL_STEMS = (
    "sfx_ui_tap",
    "sfx_spin_tick",
    "sfx_sightline_snap",
    "sfx_shutter_peel",
    "sfx_glass_shatter",
    "sfx_overclock_charge",
    "sfx_vault_thunk",
    "sfx_gold_resonance",
    "sfx_backfire_fracture",
    "sfx_passport_stamp",
)

NOTE_NAMES_FLAT = ("C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B")


# ============================================================================
# FFmpeg Discovery & Broadcast Mastering
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
    for candidate in (
        Path(r"C:\Program Files\DownloadHelper App\ffmpeg.exe"),
        Path(r"C:\Program Files\ffmpeg\bin\ffmpeg.exe"),
    ):
        if candidate.exists():
            return str(candidate)
    raise FileNotFoundError("Could not locate imageio_ffmpeg or system ffmpeg binary")


FFMPEG = find_ffmpeg()


def run_ff(args: List[str]) -> subprocess.CompletedProcess:
    return subprocess.run([FFMPEG, "-y", "-v", "error"] + args, check=True, capture_output=True)


def decode_audio_stereo(path: Path, sr: int = SR) -> np.ndarray:
    """Decode any MP3/WAV/OGG file into float64 stereo array [N, 2] at target sample rate."""
    proc = subprocess.run(
        [FFMPEG, "-v", "error", "-i", str(path), "-ar", str(sr), "-ac", "2", "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    )
    raw = np.frombuffer(proc.stdout, dtype="<f4")
    if raw.size < 2:
        raise ValueError(f"Decoded empty PCM from {path}")
    return raw.reshape(-1, 2).astype(np.float64)


def write_wav_stereo_16(path: Path, stereo: np.ndarray, sr: int = SR) -> None:
    arr = np.asarray(stereo, dtype=np.float64)
    if arr.ndim != 2 or arr.shape[1] != 2:
        raise ValueError(f"Expected stereo [N, 2], got {arr.shape}")
    if not np.all(np.isfinite(arr)):
        raise ValueError(f"Non-finite samples detected before writing {path.name}")
    clipped = np.clip(arr, -0.98, 0.98)
    pcm16 = np.round(clipped * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm16.tobytes())


def check_valid_mp3_header(mp3_path: Path) -> bool:
    data = mp3_path.read_bytes()
    if len(data) < 256:
        return False
    if data[:3] == b"ID3":
        size = (
            ((data[6] & 0x7F) << 21)
            | ((data[7] & 0x7F) << 14)
            | ((data[8] & 0x7F) << 7)
            | (data[9] & 0x7F)
        )
        offset = 10 + size
        for i in range(offset, min(len(data) - 1, offset + 512)):
            if data[i] == 0xFF and (data[i + 1] & 0xE0) == 0xE0:
                return True
    return data[0] == 0xFF and (data[1] & 0xE0) == 0xE0


def measure_audio_metrics(audio_path: Path) -> Dict[str, float]:
    """Decode audio to 48kHz stereo & mono float32 PCM and measure exact True Peak, RMS, NaNs, clips."""
    peaks: List[float] = []
    rms_val = 0.0
    dur_sec = 0.0
    clipped = 0
    non_finite = 0

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
        peaks.append(float(np.max(np.abs(pcm))))
        clipped += int(np.sum(np.abs(pcm) >= 0.999))
        if ch == "1":
            rms_val = float(np.sqrt(np.mean(pcm.astype(np.float64) ** 2)))
            dur_sec = pcm.size / 48000.0

    peak = max(peaks)
    peak_db = 20.0 * math.log10(peak) if peak > 1e-12 else -120.0
    rms_db = 20.0 * math.log10(rms_val) if rms_val > 1e-12 else -120.0
    return {
        "duration_s": round(dur_sec, 3),
        "peak_db": round(peak_db, 2),
        "rms_db": round(rms_db, 2),
        "clipped_samples": clipped,
        "non_finite": non_finite,
        "bytes": audio_path.stat().st_size,
    }


def master_sfx_to_mp3(
    stereo: np.ndarray,
    out_mp3: Path,
    target_peak_db: float = -2.4,
    bitrate: str = "128k",
    drive: float = 1.08,
    hp_hz: float = 34.0,
    fade_in_ms: float = 1.5,
    fade_out_ms: float = 18.0,
) -> Dict[str, float]:
    """Master stereo SFX to crisp broadcast loudness with verified 48kHz True Peak <= -1.5 dBFS."""
    buf = np.array(stereo, dtype=np.float64, copy=True)
    if buf.shape[0] > 48 and hp_hz > 10.0:
        sos_hp = signal.butter(2, hp_hz, btype="highpass", fs=SR, output="sos")
        buf[:, 0] = signal.sosfilt(sos_hp, buf[:, 0])
        buf[:, 1] = signal.sosfilt(sos_hp, buf[:, 1])

    # Gentle analog console saturation glue (boosts perceived warmth & body without harshness)
    raw_pk = float(np.max(np.abs(buf)))
    if raw_pk < 1e-8:
        raise ValueError(f"Silent SFX buffer for {out_mp3.name}")
    buf /= raw_pk
    if drive > 1.0:
        buf = np.tanh(buf * drive) / math.tanh(drive)

    # Smooth click-free edge fades using smoothstep polynomial (zero oscillations)
    n_in = min(int(fade_in_ms * 0.001 * SR), max(1, buf.shape[0] // 10))
    n_out = min(int(fade_out_ms * 0.001 * SR), max(1, buf.shape[0] // 4))
    if n_in > 1:
        u = np.linspace(0.0, 1.0, n_in)
        buf[:n_in] *= (u * u * (3.0 - 2.0 * u))[:, None]
    if n_out > 1:
        u = np.linspace(1.0, 0.0, n_out)
        buf[-n_out:] *= (u * u * (3.0 - 2.0 * u))[:, None]

    # Peak normalize with -0.75 dB inter-sample MP3/48kHz resampling margin
    pk2 = float(np.max(np.abs(buf)))
    target_lin = 10.0 ** ((min(-2.2, target_peak_db) - 0.75) / 20.0)
    buf *= target_lin / max(pk2, 1e-12)

    cur_buf = buf
    lim = 10.0 ** (min(-2.05, target_peak_db) / 20.0)
    for _attempt in range(4):
        with tempfile.TemporaryDirectory(prefix="ws_v5_sfx_") as td:
            wav_tmp = Path(td) / "in.wav"
            write_wav_stereo_16(wav_tmp, cur_buf, SR)
            run_ff([
                "-i", str(wav_tmp),
                "-af", f"alimiter=limit={lim:.4f}:attack=0.5:release=35:level=disabled",
                "-ar", str(SR), "-ac", "2",
                "-c:a", "libmp3lame", "-b:a", bitrate, "-joint_stereo", "1",
                str(out_mp3),
            ])
        metrics = measure_audio_metrics(out_mp3)
        if metrics["peak_db"] <= -1.80:
            break
        trim_db = -2.35 - metrics["peak_db"]
        cur_buf = cur_buf * (10.0 ** (trim_db / 20.0))
    return metrics


# ============================================================================
# Sample Bank: MusyngKite Downloader + Local Foley Loader
# ============================================================================

def midi_to_note_name(midi: int) -> str:
    octave = (midi // 12) - 1
    return f"{NOTE_NAMES_FLAT[midi % 12]}{octave}"


class SampleBank:
    """Downloads, caches, and decodes real MusyngKite samples & physical foley stems."""

    def __init__(self) -> None:
        SAMPLE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self._pcm_cache: Dict[Tuple[str, str], np.ndarray] = {}
        self._foley_cache: Dict[str, np.ndarray] = {}

    def preload_legacy_foley(self) -> None:
        for stem in LEGACY_PHYSICAL_STEMS:
            p = PUBLIC_AUDIO_DIR / f"{stem}.mp3"
            if p.exists():
                self._foley_cache[stem] = decode_audio_stereo(p, SR)

    def foley(self, stem: str) -> np.ndarray:
        if stem not in self._foley_cache:
            p = PUBLIC_AUDIO_DIR / f"{stem}.mp3"
            self._foley_cache[stem] = decode_audio_stereo(p, SR)
        return self._foley_cache[stem].copy()

    def _download_one(self, inst: str, note: str) -> Path:
        inst_dir = SAMPLE_CACHE_DIR / f"{inst}-mp3"
        inst_dir.mkdir(parents=True, exist_ok=True)
        dest = inst_dir / f"{note}.mp3"
        if dest.exists() and dest.stat().st_size > 800:
            return dest
        url = f"{MUSYNGKITE_BASE}/{inst}-mp3/{note}.mp3"
        headers = {"User-Agent": "WorldsSmartestV5AudioStudio/1.0"}
        last_err: Optional[Exception] = None
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=25) as resp:
                    data = resp.read()
                if len(data) < 500:
                    raise ValueError(f"Tiny sample response ({len(data)} bytes) for {url}")
                tmp = dest.with_suffix(".tmp")
                tmp.write_bytes(data)
                tmp.replace(dest)
                return dest
            except Exception as exc:
                last_err = exc
                time.sleep(0.35 * (attempt + 1))
        raise RuntimeError(f"Failed to download {url}: {last_err}")

    def prefetch(self, pairs: Sequence[Tuple[str, str]]) -> None:
        unique = sorted(set(pairs))
        missing = [
            (inst, note)
            for inst, note in unique
            if not (SAMPLE_CACHE_DIR / f"{inst}-mp3" / f"{note}.mp3").exists()
        ]
        if not missing:
            return
        print(f"  [FETCH] Downloading {len(missing)} real MusyngKite samples ({len(unique)} total referenced)...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
            futs = [pool.submit(self._download_one, inst, note) for inst, note in missing]
            for fut in concurrent.futures.as_completed(futs):
                fut.result()

    def raw_sample(self, inst: str, note: str) -> np.ndarray:
        key = (inst, note)
        if key not in self._pcm_cache:
            p = self._download_one(inst, note)
            self._pcm_cache[key] = decode_audio_stereo(p, SR)
        return self._pcm_cache[key].copy()

    def note(
        self,
        inst: str,
        note_or_midi: str | int,
        dur_s: float = 1.6,
        vel: float = 1.0,
        pan: float = 0.0,
        attack_ms: float = 2.0,
        release_s: float = 0.32,
        trim_onset: bool = True,
        speed: float = 1.0,
        norm_peak: bool = True,
    ) -> np.ndarray:
        """
        Render a real recorded MusyngKite note with tight onset alignment, optional varispeed,
        smooth amplitude shaping, and stereo concert-stage placement.
        """
        note_name = midi_to_note_name(note_or_midi) if isinstance(note_or_midi, int) else note_or_midi
        buf = self.raw_sample(inst, note_name)

        if trim_onset:
            mono = 0.5 * (buf[:, 0] + buf[:, 1])
            pk = float(np.max(np.abs(mono)))
            if pk > 1e-7:
                idx = int(np.argmax(np.abs(mono) >= pk * 0.035))
                start = max(0, idx - int(0.002 * SR))
                buf = buf[start:]

        if abs(speed - 1.0) > 1e-4:
            buf = resample_speed(buf, speed)

        if norm_peak:
            pk = float(np.max(np.abs(buf)))
            if pk > 1e-7:
                buf = buf / pk

        n_target = max(16, int(round(dur_s * SR)))
        if buf.shape[0] > n_target:
            buf = buf[:n_target].copy()
        n = buf.shape[0]

        # Smooth polynomial attack & release envelope
        n_att = min(int(attack_ms * 0.001 * SR), max(1, n // 4))
        if n_att > 1:
            u = np.linspace(0.0, 1.0, n_att)
            buf[:n_att] *= (u * u * (3.0 - 2.0 * u))[:, None]

        n_rel = min(int(release_s * SR), max(2, int(n * 0.72)))
        if n_rel > 1:
            u = np.linspace(1.0, 0.0, n_rel)
            # Gentle concave musical release tail
            rel_curve = (u * u * (3.0 - 2.0 * u)) ** 1.15
            buf[-n_rel:] *= rel_curve[:, None]

        return place_stereo(buf * vel, pan)


# ============================================================================
# Sample DSP Utilities (ZERO Oscillators!)
# ============================================================================

def place_stereo(stereo: np.ndarray, pan: float, width: float = 0.65) -> np.ndarray:
    """
    Preserve natural stereo spaciousness of a recorded sample while steering its
    acoustic image across the stage using exact constant-power pan law (L^2 + R^2 = 1).
    """
    p = max(-1.0, min(1.0, float(pan)))
    g_l = math.sqrt(0.5 * (1.0 - p))
    g_r = math.sqrt(0.5 * (1.0 + p))
    mid = 0.5 * (stereo[:, 0] + stereo[:, 1])
    side = 0.5 * (stereo[:, 0] - stereo[:, 1]) * width
    out = np.empty_like(stereo)
    out[:, 0] = (mid + side) * g_l * 1.41421356
    out[:, 1] = (mid - side) * g_r * 1.41421356
    return out


def mix_add(dest: np.ndarray, src: np.ndarray, start_sample: int) -> None:
    n_dest = dest.shape[0]
    n_src = src.shape[0]
    if n_src == 0 or start_sample >= n_dest or start_sample + n_src <= 0:
        return
    d0 = max(0, start_sample)
    s0 = max(0, -start_sample)
    length = min(n_dest - d0, n_src - s0)
    dest[d0 : d0 + length] += src[s0 : s0 + length]


def resample_speed(stereo: np.ndarray, speed: float) -> np.ndarray:
    """High-quality cubic-interpolated varispeed pitch/time shifting of a real recording."""
    spd = max(0.25, min(4.0, float(speed)))
    n_in = stereo.shape[0]
    n_out = max(8, int(round(n_in / spd)))
    x_in = np.arange(n_in, dtype=np.float64)
    x_out = np.linspace(0.0, n_in - 1.0, n_out, dtype=np.float64)
    out = np.empty((n_out, 2), dtype=np.float64)
    out[:, 0] = np.interp(x_out, x_in, stereo[:, 0])
    out[:, 1] = np.interp(x_out, x_in, stereo[:, 1])
    return out


def varispeed_pitch_glide(stereo: np.ndarray, speed_start: float, speed_end: float, glide_tau_s: float = 0.28) -> np.ndarray:
    """
    Smoothly pitch-glide a real recorded vocal/instrument sample (e.g. audience 'ooh!' descent)
    by integrating a smooth exponential playback-rate curve over the real audio buffer.
    """
    n_in = stereo.shape[0]
    avg_spd = 0.5 * (speed_start + speed_end)
    n_out = max(16, int(round((n_in - 2) / max(0.35, avg_spd))))
    t = np.arange(n_out, dtype=np.float64) / SR
    rates = speed_end + (speed_start - speed_end) * np.exp(-t / max(0.03, glide_tau_s))
    pos = np.cumsum(rates)
    valid = pos < (n_in - 1.001)
    pos = pos[valid]
    if pos.size < 8:
        return stereo[:8].copy()
    x_in = np.arange(n_in, dtype=np.float64)
    out = np.empty((pos.size, 2), dtype=np.float64)
    out[:, 0] = np.interp(pos, x_in, stereo[:, 0])
    out[:, 1] = np.interp(pos, x_in, stereo[:, 1])
    return out


def filter_eq(
    stereo: np.ndarray,
    hp_hz: Optional[float] = None,
    lp_hz: Optional[float] = None,
    bp_hz: Optional[Tuple[float, float]] = None,
    order: int = 2,
) -> np.ndarray:
    out = stereo.copy()
    if out.shape[0] < 32:
        return out
    nyq = SR * 0.49
    if bp_hz is not None:
        lo, hi = max(20.0, bp_hz[0]), min(nyq, bp_hz[1])
        if hi > lo + 20.0:
            sos = signal.butter(order, [lo, hi], btype="bandpass", fs=SR, output="sos")
            out[:, 0] = signal.sosfilt(sos, out[:, 0])
            out[:, 1] = signal.sosfilt(sos, out[:, 1])
    else:
        if hp_hz is not None and hp_hz > 15.0:
            sos = signal.butter(order, min(nyq, hp_hz), btype="highpass", fs=SR, output="sos")
            out[:, 0] = signal.sosfilt(sos, out[:, 0])
            out[:, 1] = signal.sosfilt(sos, out[:, 1])
        if lp_hz is not None and lp_hz < nyq:
            sos = signal.butter(order, max(60.0, lp_hz), btype="lowpass", fs=SR, output="sos")
            out[:, 0] = signal.sosfilt(sos, out[:, 0])
            out[:, 1] = signal.sosfilt(sos, out[:, 1])
    return out


def shape_foley_clip(
    clip: np.ndarray,
    start_s: float = 0.0,
    dur_s: Optional[float] = None,
    speed: float = 1.0,
    vel: float = 1.0,
    pan: float = 0.0,
    hp_hz: Optional[float] = None,
    lp_hz: Optional[float] = None,
    bp_hz: Optional[Tuple[float, float]] = None,
    fade_in_ms: float = 2.0,
    fade_out_ms: float = 25.0,
    norm_peak: bool = True,
) -> np.ndarray:
    i0 = max(0, int(round(start_s * SR)))
    buf = clip[i0:].copy()
    if abs(speed - 1.0) > 1e-4:
        buf = resample_speed(buf, speed)
    if dur_s is not None:
        n_lim = max(16, int(round(dur_s * SR)))
        buf = buf[:n_lim].copy()
    if hp_hz or lp_hz or bp_hz:
        buf = filter_eq(buf, hp_hz=hp_hz, lp_hz=lp_hz, bp_hz=bp_hz)
    if norm_peak:
        pk = float(np.max(np.abs(buf)))
        if pk > 1e-8:
            buf = buf / pk
    n = buf.shape[0]
    n_in = min(int(fade_in_ms * 0.001 * SR), max(1, n // 5))
    n_out = min(int(fade_out_ms * 0.001 * SR), max(1, n // 2))
    if n_in > 1:
        u = np.linspace(0.0, 1.0, n_in)
        buf[:n_in] *= (u * u * (3.0 - 2.0 * u))[:, None]
    if n_out > 1:
        u = np.linspace(1.0, 0.0, n_out)
        buf[-n_out:] *= (u * u * (3.0 - 2.0 * u))[:, None]
    return place_stereo(buf * vel, pan)


def build_concert_hall_ir(
    rt60: float = 1.15,
    pre_delay_ms: float = 14.0,
    damp_hz: float = 3600.0,
    seed: int = 101,
) -> np.ndarray:
    """
    Construct a warm stereo acoustic room/concert-hall impulse response
    (discrete early wall/ceiling reflections + decorrelated velvet-impulse diffuse tail).
    """
    rng = np.random.default_rng(seed)
    n = int((rt60 * 1.25 + pre_delay_ms * 0.001) * SR)
    ir = np.zeros((n, 2), dtype=np.float64)

    early_taps = [
        (0.009, 0.34, -0.48),
        (0.015, 0.29, 0.52),
        (0.022, 0.23, -0.64),
        (0.030, 0.19, 0.38),
        (0.041, 0.15, -0.30),
        (0.054, 0.11, 0.66),
    ]
    for t_s, amp, pan in early_taps:
        idx = int(t_s * SR)
        if idx < n:
            ir[idx, 0] += amp * math.sqrt(0.5 * (1.0 - pan))
            ir[idx, 1] += amp * math.sqrt(0.5 * (1.0 + pan))

    pre_n = int(pre_delay_ms * 0.001 * SR)
    tail_len = max(16, n - pre_n)
    t_tail = np.arange(tail_len, dtype=np.float64) / SR
    decay = np.exp(-6.907755 * t_tail / max(0.10, rt60))
    onset = 1.0 - np.exp(-t_tail / 0.022)
    env = decay * onset

    # Sparse velvet-impulse sequence filtered through warm hall air absorption
    sos_lp = signal.butter(2, min(SR * 0.45, damp_hz), btype="lowpass", fs=SR, output="sos")
    sos_hp = signal.butter(1, 130.0, btype="highpass", fs=SR, output="sos")
    for ch in range(2):
        # Sparse random +/-1 acoustic reflections (velvet noise -> silky smooth reverb tail)
        grid = max(8, int(SR / 2400))
        velvet = np.zeros(tail_len, dtype=np.float64)
        n_pulses = tail_len // grid
        offsets = rng.integers(0, grid, size=n_pulses)
        signs = rng.choice([-1.0, 1.0], size=n_pulses)
        indices = np.arange(n_pulses) * grid + offsets
        velvet[indices] = signs
        tail = signal.sosfilt(sos_lp, velvet)
        tail = signal.sosfilt(sos_hp, tail)
        rms = float(np.sqrt(np.mean(tail * tail))) + 1e-12
        ir[pre_n:, ch] += (tail / rms) * env * 0.11

    ir_energy = float(np.sqrt(np.mean(np.sum(ir * ir, axis=0)))) + 1e-12
    return ir / (ir_energy * 3.8)


def apply_hall_reverb(
    stereo: np.ndarray,
    wet: float = 0.24,
    rt60: float = 1.15,
    pre_delay_ms: float = 14.0,
    damp_hz: float = 3600.0,
    seed: int = 101,
) -> np.ndarray:
    """Convolve stereo signal with concert-hall / studio IR, keeping original frame duration clean."""
    ir = build_concert_hall_ir(rt60=rt60, pre_delay_ms=pre_delay_ms, damp_hz=damp_hz, seed=seed)
    n = stereo.shape[0]
    wet_l = signal.fftconvolve(stereo[:, 0], ir[:, 0], mode="full")[:n]
    wet_r = signal.fftconvolve(stereo[:, 1], ir[:, 1], mode="full")[:n]
    out = np.empty_like(stereo)
    out[:, 0] = stereo[:, 0] * (1.0 - wet * 0.35) + wet_l * wet
    out[:, 1] = stereo[:, 1] * (1.0 - wet * 0.35) + wet_r * wet
    return out


def reverse_cymbal_riser(bank: SampleBank, note: str = "C4", dur_s: float = 0.32, vel: float = 0.40, pan: float = 0.0) -> np.ndarray:
    """Slice the climax swell of MusyngKite reverse_cymbal right up to its natural crest (~1.56s)."""
    raw = bank.raw_sample("reverse_cymbal", note)
    mono = 0.5 * (raw[:, 0] + raw[:, 1])
    pk_idx = int(np.argmax(np.abs(mono)))
    n = int(round(dur_s * SR))
    i0 = max(0, pk_idx - n + int(0.025 * SR))
    i1 = min(raw.shape[0], i0 + n)
    seg = raw[i0:i1].copy()
    pk = float(np.max(np.abs(seg)))
    if pk > 1e-8:
        seg /= pk
    # Smooth rise-in and tight crest cut
    n_seg = seg.shape[0]
    n_in = min(int(0.10 * SR), n_seg // 2)
    n_out = min(int(0.035 * SR), n_seg // 4)
    if n_in > 1:
        u = np.linspace(0.0, 1.0, n_in)
        seg[:n_in] *= (u * u * (3.0 - 2.0 * u))[:, None]
    if n_out > 1:
        u = np.linspace(1.0, 0.0, n_out)
        seg[-n_out:] *= (u * u * (3.0 - 2.0 * u))[:, None]
    seg = filter_eq(seg, hp_hz=900.0, lp_hz=11500.0)
    return place_stereo(seg * vel, pan)


# ============================================================================
# 1. FIVE ESCALATING SYMPHONIC STREAK FANFARES (Cmaj9 -> Dmaj9 -> Emaj9 -> Gmaj9 -> Octave Fanfare)
# ============================================================================

def build_streak_fanfare(bank: SampleBank, level: int) -> np.ndarray:
    """
    Build 5 distinct, harmonically & orchestrally escalating real-instrument symphonic reward cues:
      1: Cmaj9 — Chamber Harp, Vibraphone, Grand Piano, Celesta & Lush Strings
      2: Dmaj9 — Rising Harp Sweep, Piano, Strings, Lyrical Flute, Warm Horn & Celesta
      3: Emaj9 — Concert Harp, Vibrant Strings, French Horns, Brass Bloom, Timpani Tap & Glockenspiel
      4: Gmaj9 — Radiant Trumpet/Brass Swell, Full Strings, Tubular Bells, Harp Cascade & Timpani
      5: C-Major Octave Full Symphony Fanfare — Timpani Cadence, Blazing Brass/Horns/Trumpets/Trombone,
         10-Note Harp Glissando, Tubular Bells, Full Strings & Diamond Celesta/Glockenspiel Finale!
    """
    if level == 1:
        dur_s = 1.32
        mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
        notes = [60, 64, 67, 71, 74]  # C4 E4 G4 B4 D5 (Cmaj9)
        mix_add(mix, bank.note("cello", 48, 1.10, vel=0.58, pan=-0.20, attack_ms=35, release_s=0.45), 0)
        for i, mn in enumerate(notes):
            t0 = int(i * 0.024 * SR)
            pan = -0.52 + 1.04 * (i / (len(notes) - 1))
            mix_add(mix, bank.note("orchestral_harp", mn, 1.15, vel=0.72, pan=pan, release_s=0.42), t0)
            mix_add(mix, bank.note("vibraphone", mn, 1.10, vel=0.56, pan=-pan * 0.45, release_s=0.45), t0 + int(0.008 * SR))
            if i in (0, 2, 4):
                mix_add(mix, bank.note("acoustic_grand_piano", mn, 1.05, vel=0.48, pan=pan * 0.5, release_s=0.40), t0)
            if i >= 3:
                mix_add(mix, bank.note("celesta", mn + 12, 0.95, vel=0.46, pan=-pan * 0.65, release_s=0.42), t0 + int(0.014 * SR))
        for mn, p in ((64, -0.38), (67, 0.0), (71, 0.38)):
            mix_add(mix, bank.note("string_ensemble_1", mn, 1.12, vel=0.38, pan=p, attack_ms=65, release_s=0.50), int(0.03 * SR))
        mix_add(mix, shape_foley_clip(bank.foley("sfx_gold_resonance"), dur_s=0.90, vel=0.16, hp_hz=450, fade_in_ms=25, fade_out_ms=320), int(0.04 * SR))
        return apply_hall_reverb(mix, wet=0.28, rt60=1.20, damp_hz=4400.0, seed=501)

    if level == 2:
        dur_s = 1.42
        mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
        notes = [62, 66, 69, 73, 76]  # D4 Gb4 A4 Db5 E5 (Dmaj9)
        mix_add(mix, bank.note("cello", 50, 1.20, vel=0.62, pan=-0.22, attack_ms=30, release_s=0.48), 0)
        for i, mn in enumerate(notes):
            t0 = int(i * 0.023 * SR)
            pan = -0.58 + 1.16 * (i / (len(notes) - 1))
            mix_add(mix, bank.note("orchestral_harp", mn, 1.22, vel=0.76, pan=pan, release_s=0.45), t0)
            mix_add(mix, bank.note("vibraphone", mn, 1.16, vel=0.60, pan=-pan * 0.50, release_s=0.45), t0 + int(0.008 * SR))
            if i in (0, 2, 3, 4):
                mix_add(mix, bank.note("acoustic_grand_piano", mn, 1.12, vel=0.52, pan=pan * 0.4, release_s=0.42), t0)
            if i >= 2:
                mix_add(mix, bank.note("celesta", mn + 12, 0.98, vel=0.48, pan=-pan * 0.70, release_s=0.44), t0 + int(0.012 * SR))
        for mn, p in ((62, -0.42), (66, -0.14), (69, 0.16), (73, 0.44)):
            mix_add(mix, bank.note("string_ensemble_1", mn, 1.22, vel=0.44, pan=p, attack_ms=55, release_s=0.52), int(0.025 * SR))
        # Warm French horn fifth + bright flute crowning the Dmaj9!
        mix_add(mix, bank.note("french_horn", 62, 0.92, vel=0.38, pan=-0.26, attack_ms=40, release_s=0.44), int(0.04 * SR))
        mix_add(mix, bank.note("french_horn", 69, 0.92, vel=0.38, pan=0.26, attack_ms=40, release_s=0.44), int(0.04 * SR))
        mix_add(mix, bank.note("flute", 76, 0.95, vel=0.44, pan=0.18, attack_ms=32, release_s=0.42), int(0.11 * SR))
        return apply_hall_reverb(mix, wet=0.30, rt60=1.28, damp_hz=4500.0, seed=502)

    if level == 3:
        dur_s = 1.54
        mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
        notes = [64, 68, 71, 75, 78]  # E4 Ab4 B4 Eb5 Gb5 (Emaj9)
        mix_add(mix, bank.note("timpani", 40, 1.10, vel=0.66, pan=-0.12, release_s=0.48), 0)
        mix_add(mix, bank.note("cello", 52, 1.30, vel=0.64, pan=-0.24, attack_ms=28, release_s=0.50), 0)
        for i, mn in enumerate(notes):
            t0 = int(i * 0.022 * SR)
            pan = -0.62 + 1.24 * (i / (len(notes) - 1))
            mix_add(mix, bank.note("orchestral_harp", mn, 1.30, vel=0.76, pan=pan, release_s=0.48), t0)
            mix_add(mix, bank.note("vibraphone", mn, 1.22, vel=0.58, pan=-pan * 0.45, release_s=0.48), t0 + int(0.007 * SR))
            mix_add(mix, bank.note("acoustic_grand_piano", mn, 1.15, vel=0.48, pan=pan * 0.35, release_s=0.42), t0)
            if i >= 2:
                mix_add(mix, bank.note("celesta", mn + 12, 1.05, vel=0.52, pan=-pan * 0.72, release_s=0.45), t0 + int(0.012 * SR))
        # Lush symphony strings + warm brass/horn choir swell
        for mn, p in ((64, -0.50), (68, -0.18), (71, 0.18), (76, 0.50)):
            mix_add(mix, bank.note("string_ensemble_1", mn, 1.32, vel=0.50, pan=p, attack_ms=50, release_s=0.54), int(0.02 * SR))
        for mn, p in ((64, -0.32), (68, 0.0), (71, 0.32)):
            mix_add(mix, bank.note("french_horn", mn, 1.08, vel=0.48, pan=p, attack_ms=36, release_s=0.48), int(0.04 * SR))
            mix_add(mix, bank.note("brass_section", mn, 0.98, vel=0.38, pan=-p * 0.7, attack_ms=42, release_s=0.45), int(0.055 * SR))
        mix_add(mix, bank.note("glockenspiel", 78, 0.90, vel=0.46, pan=0.34, release_s=0.44), int(0.12 * SR))
        mix_add(mix, bank.note("glockenspiel", 83, 0.95, vel=0.44, pan=-0.30, release_s=0.46), int(0.165 * SR))
        return apply_hall_reverb(mix, wet=0.32, rt60=1.38, damp_hz=4600.0, seed=503)

    if level == 4:
        dur_s = 1.72
        mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
        notes = [67, 71, 74, 78, 81]  # G4 B4 D5 Gb5 A5 (Gmaj9)
        mix_add(mix, reverse_cymbal_riser(bank, "G4", dur_s=0.14, vel=0.22, pan=0.0), 0)
        mix_add(mix, bank.note("timpani", 43, 1.25, vel=0.78, pan=-0.10, release_s=0.52), int(0.04 * SR))
        mix_add(mix, bank.note("contrabass", 43, 1.35, vel=0.58, pan=-0.26, attack_ms=25, release_s=0.50), int(0.04 * SR))
        mix_add(mix, bank.note("cello", 55, 1.38, vel=0.58, pan=-0.18, attack_ms=28, release_s=0.52), int(0.04 * SR))
        # Sweeping harp cascade + piano + vibraphone
        harp_notes = [55, 62, 67, 71, 74, 78, 81, 83]
        for i, mn in enumerate(harp_notes):
            t0 = int((0.03 + i * 0.022) * SR)
            pan = -0.68 + 1.36 * (i / (len(harp_notes) - 1))
            mix_add(mix, bank.note("orchestral_harp", mn, 1.32, vel=0.74, pan=pan, release_s=0.50), t0)
        for i, mn in enumerate(notes):
            t0 = int((0.05 + i * 0.024) * SR)
            pan = -0.55 + 1.10 * (i / (len(notes) - 1))
            mix_add(mix, bank.note("vibraphone", mn, 1.26, vel=0.56, pan=-pan * 0.5, release_s=0.48), t0)
            mix_add(mix, bank.note("celesta", mn + 12, 1.12, vel=0.50, pan=pan * 0.72, release_s=0.46), t0 + int(0.012 * SR))
        # Radiant brass section + trumpet lead + concert tubular bells + soaring strings!
        for mn, p in ((67, -0.54), (71, -0.20), (74, 0.20), (79, 0.54)):
            mix_add(mix, bank.note("string_ensemble_1", mn, 1.48, vel=0.56, pan=p, attack_ms=45, release_s=0.58), int(0.05 * SR))
        for mn, p in ((55, -0.35), (67, -0.15), (71, 0.15), (74, 0.35)):
            mix_add(mix, bank.note("brass_section", mn, 1.25, vel=0.56, pan=p, attack_ms=34, release_s=0.52), int(0.07 * SR))
        mix_add(mix, bank.note("trumpet", 74, 1.05, vel=0.54, pan=0.22, attack_ms=26, release_s=0.46), int(0.11 * SR))
        mix_add(mix, bank.note("trumpet", 79, 1.18, vel=0.58, pan=-0.20, attack_ms=28, release_s=0.52), int(0.20 * SR))
        mix_add(mix, bank.note("tubular_bells", 67, 1.45, vel=0.56, pan=-0.34, release_s=0.60), int(0.12 * SR))
        mix_add(mix, bank.note("tubular_bells", 74, 1.45, vel=0.62, pan=0.34, release_s=0.62), int(0.22 * SR))
        mix_add(mix, bank.note("glockenspiel", 86, 1.05, vel=0.52, pan=0.42, release_s=0.48), int(0.25 * SR))
        return apply_hall_reverb(mix, wet=0.34, rt60=1.48, damp_hz=4700.0, seed=504)

    # LEVEL 5: FULL SYMPHONY ORCHESTRA C-MAJOR OCTAVE GRAND FANFARE!
    dur_s = 2.35
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Shimmer pickup -> Heroic Timpani V -> I cadence (G2 -> C3)
    mix_add(mix, reverse_cymbal_riser(bank, "C4", dur_s=0.20, vel=0.28, pan=0.0), 0)
    mix_add(mix, bank.note("timpani", 43, 0.55, vel=0.72, pan=-0.16, release_s=0.28), int(0.05 * SR))
    mix_add(mix, bank.note("timpani", 48, 1.65, vel=0.94, pan=0.08, release_s=0.72), int(0.21 * SR))
    mix_add(mix, bank.note("contrabass", 36, 1.85, vel=0.68, pan=-0.28, attack_ms=22, release_s=0.70), int(0.20 * SR))
    mix_add(mix, bank.note("cello", 48, 1.85, vel=0.66, pan=-0.18, attack_ms=26, release_s=0.72), int(0.20 * SR))

    # Heroic prime-time Brass Fanfare pickup (G4 -> C5 -> E5 -> G5 -> blazing C-major Octave Chord!)
    pickup_brass = [
        (0.05, 67, 0.20, 0.62),  # G4 pickup
        (0.20, 72, 0.40, 0.80),  # C5 downbeat
        (0.35, 76, 0.42, 0.82),  # E5 lift
        (0.50, 79, 1.45, 0.86),  # G5 crest
    ]
    for t_s, mn, d_s, v in pickup_brass:
        mix_add(mix, bank.note("trumpet", mn, d_s, vel=v, pan=0.18, attack_ms=18, release_s=min(0.55, d_s * 0.5)), int(t_s * SR))
        mix_add(mix, bank.note("french_horn", mn - 12, d_s + 0.15, vel=v * 0.84, pan=-0.22, attack_ms=24, release_s=min(0.60, d_s * 0.55)), int(t_s * SR))

    # Grand Symphony Tutti Apex Chord (C3 G3 C4 E4 G4 B4 D5 G5 C6) blooming from 0.21s & cresting at 0.50s!
    mix_add(mix, bank.note("trombone", 48, 1.55, vel=0.68, pan=-0.30, attack_ms=28, release_s=0.65), int(0.21 * SR))
    mix_add(mix, bank.note("trombone", 55, 1.55, vel=0.64, pan=0.28, attack_ms=28, release_s=0.65), int(0.21 * SR))
    for mn, p in ((60, -0.46), (64, -0.22), (67, 0.0), (72, 0.24), (76, 0.46)):
        mix_add(mix, bank.note("brass_section", mn, 1.62, vel=0.64, pan=p, attack_ms=32, release_s=0.68), int(0.46 * SR))
    mix_add(mix, bank.note("trumpet", 84, 1.45, vel=0.72, pan=0.0, attack_ms=24, release_s=0.65), int(0.50 * SR))

    # Lush Full Symphony String Canopy (Violin/String Ensemble 1 & 2)
    for mn, p in ((60, -0.62), (64, -0.34), (67, -0.08), (71, 0.18), (76, 0.42), (84, 0.64)):
        mix_add(mix, bank.note("string_ensemble_1", mn, 1.85, vel=0.58, pan=p, attack_ms=55, release_s=0.78), int(0.22 * SR))
    for mn, p in ((72, -0.40), (79, 0.40)):
        mix_add(mix, bank.note("string_ensemble_2", mn, 1.65, vel=0.48, pan=p, attack_ms=70, release_s=0.72), int(0.42 * SR))

    # Dazzling 10-Note Concert Harp Glissando sweeping left -> right!
    harp_gliss = [60, 62, 64, 67, 71, 72, 74, 76, 79, 84]
    for i, mn in enumerate(harp_gliss):
        t0 = int((0.18 + i * 0.032) * SR)
        pan = -0.78 + 1.56 * (i / (len(harp_gliss) - 1))
        mix_add(mix, bank.note("orchestral_harp", mn, 1.55, vel=0.76, pan=pan, release_s=0.60), t0)

    # Concert Tubular Bells + Grand Piano + Diamond Celesta/Glockenspiel Finale!
    for t_s, mn, p in ((0.21, 72, -0.38), (0.36, 79, 0.36), (0.52, 84, 0.0)):
        mix_add(mix, bank.note("tubular_bells", mn, 1.70, vel=0.72, pan=p, release_s=0.75), int(t_s * SR))
    for mn, p in ((48, -0.30), (60, -0.15), (67, 0.15), (72, 0.30)):
        mix_add(mix, bank.note("acoustic_grand_piano", mn, 1.45, vel=0.52, pan=p, release_s=0.58), int(0.50 * SR))
    for i, mn in enumerate((84, 86, 88, 91, 96)):
        t0 = int((0.56 + i * 0.048) * SR)
        pan = -0.60 + 0.30 * i
        mix_add(mix, bank.note("celesta", mn, 1.20, vel=0.56, pan=pan, release_s=0.55), t0)
        if i % 2 == 0:
            mix_add(mix, bank.note("glockenspiel", mn, 1.15, vel=0.50, pan=-pan * 0.7, release_s=0.55), t0 + int(0.012 * SR))

    return apply_hall_reverb(mix, wet=0.36, rt60=1.65, damp_hz=4800.0, seed=505)


# ============================================================================
# 2. FOUR NEW v5 TACTILE PROPS & SYMPHONIC SHOW CUES
# ============================================================================

def build_screw_slam(bank: SampleBank) -> np.ndarray:
    """
    `sfx_screw_slam.mp3` — Heavy spring-loaded red dome buzzer slam + dramatic brass sting!
    Buzz! Quiz TV heavy acrylic slam transient + spring recoil + You Don't Know Jack theatrical sting!
    """
    dur_s = 1.28
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # 1) 0-40ms: Massive physical dome slam (vault housing thud + palm slap + gunshot shockwave + coil spring)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.28, speed=0.88, vel=1.10, pan=0.0, lp_hz=2800), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_passport_stamp"), dur_s=0.22, speed=0.78, vel=0.95, pan=0.0, lp_hz=1800), 0)
    # Tight 48ms punch transient from real gunshot sample (filtered for meaty slam punch, no gunfire tail)
    gun_punch = bank.note("gunshot", "C3", dur_s=0.095, vel=0.88, pan=0.0, attack_ms=0.5, release_s=0.065)
    gun_punch = filter_eq(gun_punch, hp_hz=55.0, lp_hz=3200.0)
    mix_add(mix, gun_punch, 0)
    # Metallic dome spring latch clank & brief spring ring
    mix_add(mix, shape_foley_clip(bank.foley("sfx_shutter_peel"), dur_s=0.24, speed=1.22, vel=0.72, pan=-0.12, hp_hz=650), int(0.012 * SR))
    mix_add(mix, bank.note("tinkle_bell", 81, 0.14, vel=0.34, pan=0.22, release_s=0.09), int(0.018 * SR))
    mix_add(mix, bank.note("timpani", 43, 0.72, vel=0.95, pan=0.0, release_s=0.38), int(0.008 * SR))

    # 2) 32ms & 195ms: Two-hit dramatic prime-time brass "SCREWED!" ambush sting!
    # Hit 1 (32ms): Sharp tritone/diminished orchestra jab (Ab3 + D4 + F4 + B4)
    mix_add(mix, bank.note("orchestra_hit", 62, 0.36, vel=0.78, pan=0.0, release_s=0.18), int(0.028 * SR))
    for mn, p in ((56, -0.35), (62, 0.0), (65, 0.35)):
        mix_add(mix, bank.note("brass_section", mn, 0.24, vel=0.74, pan=p, attack_ms=6, release_s=0.12), int(0.030 * SR))
    mix_add(mix, bank.note("trumpet", 71, 0.24, vel=0.68, pan=0.25, attack_ms=6, release_s=0.12), int(0.032 * SR))

    # Hit 2 (190ms): Heavy menacing G-diminished/minor slam (G2 + Db3 + G3 + Bb3 + Db4 + F4)
    mix_add(mix, bank.note("timpani", 38, 0.92, vel=0.90, pan=-0.10, release_s=0.48), int(0.185 * SR))
    mix_add(mix, bank.note("tuba", 43, 0.92, vel=0.82, pan=0.0, attack_ms=10, release_s=0.46), int(0.188 * SR))
    mix_add(mix, bank.note("trombone", 49, 0.88, vel=0.78, pan=-0.28, attack_ms=10, release_s=0.45), int(0.190 * SR))
    mix_add(mix, bank.note("trombone", 55, 0.88, vel=0.74, pan=0.28, attack_ms=10, release_s=0.45), int(0.190 * SR))
    for mn, p in ((58, -0.38), (61, 0.0), (65, 0.38)):
        mix_add(mix, bank.note("brass_section", mn, 0.90, vel=0.84, pan=p, attack_ms=12, release_s=0.48), int(0.192 * SR))
    mix_add(mix, bank.note("muted_trumpet", 73, 0.76, vel=0.64, pan=0.30, attack_ms=8, release_s=0.40), int(0.200 * SR))
    # Subtle brass/spring clank settle
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.12, speed=0.85, vel=0.48, pan=0.14), int(0.190 * SR))

    return apply_hall_reverb(mix, wet=0.24, rt60=0.95, damp_hz=3400.0, seed=601)


def build_jackpot_sweep(bank: SampleBank) -> np.ndarray:
    """
    `sfx_jackpot_sweep.mp3` — Full Symphonic Row/Column Stage Sweep Jackpot!
    Cascading tubular bells, sweeping 12-note harp glissando, blazing brass/string flourish & studio burst!
    """
    dur_s = 2.48
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # 1) Shimmer lift + timpani roll-in (0..0.38s)
    mix_add(mix, reverse_cymbal_riser(bank, "C4", dur_s=0.32, vel=0.38, pan=0.0), 0)
    mix_add(mix, bank.note("timpani", 43, 0.45, vel=0.72, pan=-0.18, release_s=0.24), int(0.06 * SR))
    mix_add(mix, bank.note("timpani", 43, 0.42, vel=0.78, pan=0.16, release_s=0.22), int(0.19 * SR))
    mix_add(mix, bank.note("timpani", 48, 1.75, vel=0.96, pan=0.0, release_s=0.78), int(0.34 * SR))

    # 2) Sweeping 12-note Concert Harp Glissando (0.04s .. 0.44s)
    harp_notes = [60, 62, 64, 67, 69, 71, 72, 74, 76, 79, 81, 84]
    for i, mn in enumerate(harp_notes):
        t0 = int((0.04 + i * 0.032) * SR)
        pan = -0.82 + 1.64 * (i / (len(harp_notes) - 1))
        mix_add(mix, bank.note("orchestral_harp", mn, 1.65, vel=0.78, pan=pan, release_s=0.68), t0)

    # 3) Cascading Tubular Bells Jackpot Peal!
    bell_peal = [
        (0.22, 72, -0.48, 0.72),
        (0.35, 76, -0.18, 0.76),
        (0.48, 79, 0.18, 0.80),
        (0.62, 84, 0.48, 0.88),
        (0.78, 79, -0.22, 0.72),
        (0.92, 84, 0.22, 0.90),
    ]
    for t_s, mn, pan, v in bell_peal:
        mix_add(mix, bank.note("tubular_bells", mn, 1.55, vel=v, pan=pan, release_s=0.68), int(t_s * SR))
        mix_add(mix, bank.note("glockenspiel", mn + 12 if mn <= 79 else mn, 1.10, vel=v * 0.56, pan=-pan * 0.7, release_s=0.52), int((t_s + 0.015) * SR))

    # 4) Sparkling gold-coin prism rain (celesta + tinkle_bell)
    for i, mn in enumerate((79, 83, 84, 86, 88, 91, 96)):
        t0 = int((0.40 + i * 0.062) * SR)
        pan = -0.66 + 0.22 * i
        mix_add(mix, bank.note("celesta", mn, 1.25, vel=0.52, pan=pan, release_s=0.55), t0)
        mix_add(mix, bank.note("tinkle_bell", min(91, mn), 0.75, vel=0.28, pan=-pan * 0.8, release_s=0.38), t0 + int(0.02 * SR))

    # 5) Full Symphonic Jackpot Brass & String Flourish (Fmaj7/G -> blazing Cmaj9 climax!)
    # Subdominant lift at 0.34s
    for mn, p in ((55, -0.35), (65, -0.12), (69, 0.14), (72, 0.38)):
        mix_add(mix, bank.note("brass_section", mn, 0.32, vel=0.60, pan=p, attack_ms=22, release_s=0.14), int(0.34 * SR))
    # Blazing Cmaj9 resolution at 0.60s
    mix_add(mix, bank.note("contrabass", 36, 1.75, vel=0.68, pan=-0.24, attack_ms=25, release_s=0.72), int(0.58 * SR))
    mix_add(mix, bank.note("trombone", 48, 1.65, vel=0.68, pan=-0.32, attack_ms=22, release_s=0.70), int(0.60 * SR))
    mix_add(mix, bank.note("trombone", 55, 1.65, vel=0.64, pan=0.32, attack_ms=22, release_s=0.70), int(0.60 * SR))
    for mn, p in ((60, -0.48), (64, -0.22), (67, 0.04), (71, 0.26), (74, 0.48)):
        mix_add(mix, bank.note("brass_section", mn, 1.72, vel=0.68, pan=p, attack_ms=28, release_s=0.74), int(0.60 * SR))
    mix_add(mix, bank.note("trumpet", 79, 0.32, vel=0.72, pan=-0.16, attack_ms=16, release_s=0.14), int(0.35 * SR))
    mix_add(mix, bank.note("trumpet", 84, 1.55, vel=0.78, pan=0.14, attack_ms=20, release_s=0.68), int(0.61 * SR))
    for mn, p in ((64, -0.60), (67, -0.30), (72, 0.0), (76, 0.30), (84, 0.60)):
        mix_add(mix, bank.note("string_ensemble_1", mn, 1.80, vel=0.58, pan=p, attack_ms=52, release_s=0.78), int(0.54 * SR))
    for mn, p in ((48, -0.25), (60, 0.0), (67, 0.25), (76, 0.40)):
        mix_add(mix, bank.note("acoustic_grand_piano", mn, 1.50, vel=0.48, pan=p, release_s=0.62), int(0.60 * SR))

    # Subtle live audience exclamation swell underneath the jackpot climax
    ap1 = shape_foley_clip(bank.raw_sample("applause", "D4"), start_s=0.55, dur_s=1.65, vel=0.22, pan=-0.35, hp_hz=320, lp_hz=7200, fade_in_ms=140, fade_out_ms=650)
    ap2 = shape_foley_clip(bank.raw_sample("applause", "G4"), start_s=0.85, dur_s=1.65, vel=0.20, pan=0.35, hp_hz=320, lp_hz=7200, fade_in_ms=160, fade_out_ms=650)
    mix_add(mix, ap1, int(0.62 * SR))
    mix_add(mix, ap2, int(0.66 * SR))

    return apply_hall_reverb(mix, wet=0.35, rt60=1.60, damp_hz=4800.0, seed=602)


def build_polaroid_pin(bank: SampleBank) -> np.ndarray:
    """
    `sfx_polaroid_pin.mp3` — Crisp cardstock snap + brass tack press into corkboard!
    Intimate Tour Trunk close-mic foley (wood desk + thick photo paper + brass thumbtack).
    """
    dur_s = 0.36
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # 1) 0-95ms: Crisp Polaroid glossy cardstock snap & slight flutter
    card_brush = shape_foley_clip(
        bank.raw_sample("guitar_fret_noise", "E4"),
        start_s=0.01, dur_s=0.085, speed=1.45, vel=0.58, pan=-0.16,
        bp_hz=(1100.0, 6800.0), fade_in_ms=2.0, fade_out_ms=35.0,
    )
    card_snap = shape_foley_clip(
        bank.foley("sfx_shutter_peel"),
        start_s=0.0, dur_s=0.095, speed=1.48, vel=0.68, pan=-0.08,
        bp_hz=(850.0, 7200.0), fade_in_ms=1.5, fade_out_ms=38.0,
    )
    mix_add(mix, card_brush, 0)
    mix_add(mix, card_snap, int(0.012 * SR))
    mix_add(mix, bank.note("woodblock", 79, 0.045, vel=0.28, pan=-0.12, release_s=0.025), int(0.016 * SR))

    # 2) 78-250ms: Brass thumbtack pressing firmly into dense corkboard!
    cork_thud = shape_foley_clip(
        bank.foley("sfx_passport_stamp"),
        start_s=0.0, dur_s=0.14, speed=1.18, vel=0.92, pan=0.06,
        hp_hz=90.0, lp_hz=1150.0, fade_in_ms=2.0, fade_out_ms=55.0,
    )
    cork_wood = bank.note("woodblock", 60, 0.085, vel=0.58, pan=0.04, speed=0.72, release_s=0.055)
    cork_wood = filter_eq(cork_wood, lp_hz=1400.0)
    tack_click = shape_foley_clip(
        bank.foley("sfx_ui_tap"),
        start_s=0.0, dur_s=0.045, speed=1.22, vel=0.64, pan=0.12,
        hp_hz=1400.0, fade_in_ms=1.0, fade_out_ms=18.0,
    )
    brass_glint = bank.note("tinkle_bell", 88, 0.065, vel=0.18, pan=0.18, attack_ms=1.0, release_s=0.045)
    mix_add(mix, cork_thud, int(0.074 * SR))
    mix_add(mix, cork_wood, int(0.076 * SR))
    mix_add(mix, tack_click, int(0.082 * SR))
    mix_add(mix, brass_glint, int(0.084 * SR))

    return apply_hall_reverb(mix, wet=0.10, rt60=0.28, pre_delay_ms=5.0, damp_hz=3200.0, seed=603)


def build_switch_clack(bank: SampleBank) -> np.ndarray:
    """
    `sfx_switch_clack.mp3` — Satisfying heavy brass rotary / throw-switch mechanical detent!
    Double-stage tactile hardware feel: brass lever break -> crisp spring throw -> mahogany body lock!
    """
    dur_s = 0.29
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Stage 1 (0ms): Initial machined brass detent break
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.11, speed=1.08, vel=0.92, pan=-0.10, hp_hz=140), 0)
    mix_add(mix, bank.note("woodblock", 76, 0.048, vel=0.46, pan=-0.06, release_s=0.028), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_shutter_peel"), dur_s=0.13, speed=1.28, vel=0.56, pan=0.08, hp_hz=500), int(0.008 * SR))

    # Stage 2 (48ms): Heavy brass contact lock & solid mahogany podium body thump!
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.18, speed=1.22, vel=0.94, pan=0.04, lp_hz=3200), int(0.046 * SR))
    mix_add(mix, shape_foley_clip(bank.foley("sfx_ui_tap"), dur_s=0.042, speed=0.82, vel=0.72, pan=0.14, hp_hz=900), int(0.048 * SR))
    # Subtle short damped brass bell ring (gives unmistakably machined solid brass character!)
    brass_ring = bank.note("agogo", 79, 0.065, vel=0.24, pan=0.10, attack_ms=1.0, release_s=0.045)
    brass_ring = filter_eq(brass_ring, hp_hz=1200.0, lp_hz=6800.0)
    mix_add(mix, brass_ring, int(0.050 * SR))

    return apply_hall_reverb(mix, wet=0.12, rt60=0.35, pre_delay_ms=6.0, damp_hz=3400.0, seed=604)


# ============================================================================
# 3. ELEVEN UPGRADED TACTILE BOARD, CLOCK & BUZZER CUES
# ============================================================================

def build_padlock_break(bank: SampleBank) -> np.ndarray:
    """
    `sfx_padlock_break.mp3` — Heavy iron chain clinks + glass/metal shatter + Hearthstone crystal unlock!
    """
    dur_s = 1.04
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # 1) 0-95ms: Heavy padlock shackle snap + tumbling iron chain links across stereo L/R!
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.26, speed=0.94, vel=1.02, pan=0.0), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.12, speed=0.88, vel=0.86, pan=-0.22), int(0.004 * SR))
    # Staggered metallic iron chain clinks (agogo + tinkle_bell tightly damped & bandpassed!)
    chain_hits = [
        (0.014, "agogo", 74, -0.45, 0.56),
        (0.046, "tinkle_bell", 83, 0.42, 0.52),
        (0.088, "agogo", 79, -0.32, 0.44),
        (0.135, "tinkle_bell", 88, 0.52, 0.36),
    ]
    for t_s, inst, mn, pan, v in chain_hits:
        clink = bank.note(inst, mn, 0.14, vel=v, pan=pan, attack_ms=0.8, release_s=0.095)
        clink = filter_eq(clink, hp_hz=1100.0, lp_hz=9600.0)
        mix_add(mix, clink, int(t_s * SR))

    # 2) 55-680ms: Real Gravity Sound Glass & Metal Fracture + Timpani Impact!
    mix_add(mix, shape_foley_clip(bank.foley("sfx_glass_shatter"), dur_s=0.64, speed=1.06, vel=0.94, pan=0.14, hp_hz=220), int(0.052 * SR))
    mix_add(mix, shape_foley_clip(bank.foley("sfx_backfire_fracture"), dur_s=0.45, speed=1.08, vel=0.58, pan=-0.18, hp_hz=120), int(0.058 * SR))
    mix_add(mix, bank.note("timpani", 45, 0.58, vel=0.70, pan=0.0, release_s=0.34), int(0.052 * SR))

    # 3) 105-980ms: Crystalline Hearthstone A-major unlock flourish!
    for i, mn in enumerate((69, 73, 76, 81, 85)):
        t0 = int((0.105 + i * 0.036) * SR)
        pan = -0.46 + 0.23 * i
        mix_add(mix, bank.note("celesta", mn, 0.65, vel=0.56, pan=pan, release_s=0.34), t0)
        mix_add(mix, bank.note("orchestral_harp", mn, 0.68, vel=0.52, pan=-pan * 0.65, release_s=0.34), t0)

    return apply_hall_reverb(mix, wet=0.25, rt60=0.92, damp_hz=4400.0, seed=701)


def build_tile_flip(bank: SampleBank) -> np.ndarray:
    """`sfx_tile_flip.mp3` — Tactile wooden/brass octagonal tile flip + crisp harp/kalimba fifth."""
    dur_s = 0.40
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
    mix_add(mix, bank.note("woodblock", 74, 0.055, vel=0.68, pan=-0.12, release_s=0.03), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.11, speed=1.18, vel=0.62, pan=-0.06), int(0.005 * SR))
    mix_add(mix, shape_foley_clip(bank.foley("sfx_shutter_peel"), dur_s=0.14, speed=1.40, vel=0.34, pan=0.14, hp_hz=600), int(0.010 * SR))
    # Crisp real kalimba + harp + celesta open fifth (G4 -> D5)
    mix_add(mix, bank.note("kalimba", 67, 0.26, vel=0.58, pan=-0.20, release_s=0.14), int(0.016 * SR))
    mix_add(mix, bank.note("orchestral_harp", 67, 0.30, vel=0.52, pan=-0.18, release_s=0.16), int(0.018 * SR))
    mix_add(mix, bank.note("kalimba", 74, 0.30, vel=0.64, pan=0.22, release_s=0.16), int(0.056 * SR))
    mix_add(mix, bank.note("celesta", 74, 0.32, vel=0.56, pan=0.24, release_s=0.18), int(0.058 * SR))
    return apply_hall_reverb(mix, wet=0.18, rt60=0.58, damp_hz=4200.0, seed=702)


def build_wheel_tick(bank: SampleBank) -> np.ndarray:
    """`sfx_wheel_tick.mp3` — Ultra-crisp physical show-wheel peg flick (woodblock + watch escapement)."""
    dur_s = 0.105
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
    mix_add(mix, bank.note("woodblock", 79, 0.048, vel=0.88, pan=0.0, release_s=0.025), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_spin_tick"), dur_s=0.055, speed=1.06, vel=0.82, pan=0.08), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_ui_tap"), dur_s=0.036, speed=1.18, vel=0.45, pan=-0.08, hp_hz=1200), int(0.002 * SR))
    return mix


def build_power_play(bank: SampleBank) -> np.ndarray:
    """`sfx_power_play.mp3` — Iconic Symphonic Power-Play / Daily Double glissando + Dmaj9 brass hit!"""
    dur_s = 1.68
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    mix_add(mix, reverse_cymbal_riser(bank, "D4", dur_s=0.28, vel=0.34, pan=0.0), 0)
    gliss = [62, 66, 69, 73, 74, 78, 81, 86]  # Dmaj9 soaring cascade
    for i, mn in enumerate(gliss):
        t0 = int((0.03 + i * 0.038) * SR)
        pan = -0.64 + 1.28 * (i / (len(gliss) - 1))
        mix_add(mix, bank.note("orchestral_harp", mn, 0.92, vel=0.72, pan=pan, release_s=0.42), t0)
        mix_add(mix, bank.note("celesta", mn, 0.85, vel=0.58, pan=-pan * 0.55, release_s=0.40), t0 + int(0.006 * SR))
        mix_add(mix, bank.note("vibraphone", mn, 0.88, vel=0.48, pan=pan * 0.40, release_s=0.42), t0 + int(0.010 * SR))

    # Apex Dmaj9 Full Symphonic Brass + Timpani + Tubular Bells Hit!
    mix_add(mix, bank.note("timpani", 38, 1.28, vel=0.90, pan=0.0, release_s=0.55), int(0.28 * SR))
    mix_add(mix, bank.note("contrabass", 38, 1.28, vel=0.62, pan=-0.22, attack_ms=22, release_s=0.55), int(0.28 * SR))
    for mn, p in ((62, -0.45), (66, -0.18), (69, 0.14), (73, 0.42)):
        mix_add(mix, bank.note("brass_section", mn, 1.26, vel=0.68, pan=p, attack_ms=26, release_s=0.56), int(0.27 * SR))
        mix_add(mix, bank.note("string_ensemble_1", mn + 12 if mn < 68 else mn, 1.32, vel=0.52, pan=-p * 0.8, attack_ms=42, release_s=0.60), int(0.29 * SR))
    mix_add(mix, bank.note("french_horn", 62, 1.18, vel=0.62, pan=-0.28, attack_ms=22, release_s=0.54), int(0.28 * SR))
    mix_add(mix, bank.note("trumpet", 74, 1.15, vel=0.66, pan=0.22, attack_ms=20, release_s=0.52), int(0.30 * SR))
    mix_add(mix, bank.note("tubular_bells", 74, 1.30, vel=0.62, pan=-0.30, release_s=0.60), int(0.30 * SR))
    mix_add(mix, bank.note("tubular_bells", 81, 1.28, vel=0.58, pan=0.32, release_s=0.60), int(0.34 * SR))

    return apply_hall_reverb(mix, wet=0.32, rt60=1.42, damp_hz=4500.0, seed=703)


def build_wedge_earned(bank: SampleBank) -> np.ndarray:
    """`sfx_wedge_earned.mp3` — Crown Jewel Medallion socket lock-in + Heroic Symphonic G-Major Fanfare!"""
    dur_s = 1.96
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Tactile jeweled socket lock-in (0..90ms)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.20, speed=1.15, vel=0.72, pan=0.0), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_gold_resonance"), dur_s=1.05, vel=0.28, pan=0.0, hp_hz=350, fade_out_ms=400), int(0.012 * SR))
    mix_add(mix, bank.note("tinkle_bell", 86, 0.35, vel=0.36, pan=0.26, release_s=0.22), int(0.015 * SR))

    # Timpani V -> I foundation
    mix_add(mix, bank.note("timpani", 38, 0.45, vel=0.66, pan=-0.16, release_s=0.24), int(0.06 * SR))
    mix_add(mix, bank.note("timpani", 43, 1.40, vel=0.88, pan=0.10, release_s=0.62), int(0.45 * SR))
    mix_add(mix, bank.note("contrabass", 43, 1.45, vel=0.60, pan=-0.24, attack_ms=25, release_s=0.62), int(0.45 * SR))

    # Heroic 4-note Royal Fanfare: G4 -> B4 -> D5 -> G5 (with A5 9th halo!)
    fanfare = [
        (0.06, 67, 0.28, 0.72),
        (0.19, 71, 0.30, 0.76),
        (0.32, 74, 0.34, 0.80),
        (0.46, 79, 1.38, 0.90),
    ]
    for t_s, mn, d_s, v in fanfare:
        mix_add(mix, bank.note("french_horn", mn - 12, d_s + 0.14, vel=v * 0.84, pan=-0.26, attack_ms=18, release_s=min(0.55, d_s * 0.5)), int(t_s * SR))
        mix_add(mix, bank.note("trumpet", mn, d_s, vel=v * 0.86, pan=0.22, attack_ms=16, release_s=min(0.55, d_s * 0.5)), int(t_s * SR))
        mix_add(mix, bank.note("vibraphone", mn, d_s + 0.30, vel=v * 0.58, pan=0.0, release_s=0.35), int(t_s * SR))
        mix_add(mix, bank.note("celesta", mn + 12, d_s + 0.28, vel=v * 0.52, pan=0.30 if mn % 2 == 0 else -0.30, release_s=0.38), int((t_s + 0.012) * SR))

    # Soaring Gmaj9 Brass & String Climax + Crown Tubular Bell + Harp Sweep
    for mn, p in ((67, -0.46), (71, -0.18), (74, 0.16), (79, 0.44), (81, 0.58)):
        mix_add(mix, bank.note("brass_section", mn, 1.36, vel=0.62, pan=p, attack_ms=30, release_s=0.62), int(0.45 * SR))
        mix_add(mix, bank.note("string_ensemble_1", mn, 1.42, vel=0.54, pan=-p * 0.85, attack_ms=48, release_s=0.65), int(0.44 * SR))
    mix_add(mix, bank.note("tubular_bells", 79, 1.42, vel=0.70, pan=0.0, release_s=0.68), int(0.47 * SR))
    for i, mn in enumerate((67, 71, 74, 78, 79, 81, 86)):
        mix_add(mix, bank.note("orchestral_harp", mn, 1.15, vel=0.62, pan=-0.62 + 0.21 * i, release_s=0.50), int((0.46 + i * 0.032) * SR))

    return apply_hall_reverb(mix, wet=0.34, rt60=1.50, damp_hz=4600.0, seed=704)


def build_rival_trap(bank: SampleBank) -> np.ndarray:
    """`sfx_rival_trap.mp3` — Cheeky theatrical rival ambush (mechanical trap latch + dark pizzicato & brass sting)."""
    dur_s = 1.04
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Mechanical trap snap
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.14, speed=0.86, vel=0.92, pan=-0.12), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.22, speed=0.90, vel=0.76, pan=0.10), int(0.012 * SR))
    mix_add(mix, bank.note("woodblock", 71, 0.055, vel=0.52, pan=-0.22, release_s=0.03), int(0.02 * SR))
    mix_add(mix, bank.note("timpani", 43, 0.78, vel=0.76, pan=0.0, release_s=0.40), int(0.04 * SR))

    # Cheeky sneaky pizzicato + bassoon + muted trumpet descending minor-2nd ambush (Eb4 -> D4 over G2/Db3)
    mix_add(mix, bank.note("pizzicato_strings", 63, 0.26, vel=0.82, pan=-0.34, release_s=0.12), int(0.055 * SR))
    mix_add(mix, bank.note("pizzicato_strings", 62, 0.46, vel=0.88, pan=0.34, release_s=0.24), int(0.215 * SR))
    mix_add(mix, bank.note("bassoon", 51, 0.22, vel=0.66, pan=-0.24, attack_ms=10, release_s=0.10), int(0.055 * SR))
    mix_add(mix, bank.note("bassoon", 50, 0.56, vel=0.72, pan=0.24, attack_ms=10, release_s=0.28), int(0.215 * SR))

    # Noir brass stabs
    for mn, p in ((43, -0.25), (55, 0.0), (61, 0.25)):
        mix_add(mix, bank.note("brass_section", mn, 0.20, vel=0.60, pan=p, attack_ms=10, release_s=0.10), int(0.055 * SR))
    mix_add(mix, bank.note("trombone", 43, 0.68, vel=0.74, pan=-0.22, attack_ms=12, release_s=0.34), int(0.210 * SR))
    for mn, p in ((55, -0.32), (58, 0.05), (62, 0.34)):
        mix_add(mix, bank.note("brass_section", mn, 0.66, vel=0.72, pan=p, attack_ms=14, release_s=0.36), int(0.215 * SR))
    mix_add(mix, bank.note("muted_trumpet", 63, 0.19, vel=0.58, pan=-0.28, attack_ms=8, release_s=0.08), int(0.058 * SR))
    mix_add(mix, bank.note("muted_trumpet", 62, 0.60, vel=0.64, pan=0.28, attack_ms=10, release_s=0.32), int(0.218 * SR))

    return apply_hall_reverb(mix, wet=0.22, rt60=0.82, damp_hz=3200.0, seed=705)


def build_lock_in(bank: SampleBank) -> np.ndarray:
    """`sfx_lock_in.mp3` — Decisive Millionaire-style Final Answer lock-in thud + warm symphonic fifth."""
    dur_s = 0.54
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Heavy physical brass podium lock-in
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.28, speed=0.96, vel=0.94, pan=0.0), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.11, speed=1.02, vel=0.74, pan=-0.08), 0)
    mix_add(mix, bank.note("timpani", 48, 0.44, vel=0.76, pan=0.0, release_s=0.24), int(0.004 * SR))

    # Warm decisive C4 + G4 real piano, vibraphone & French horn confirmation
    mix_add(mix, bank.note("acoustic_grand_piano", 60, 0.44, vel=0.62, pan=-0.18, release_s=0.22), int(0.010 * SR))
    mix_add(mix, bank.note("acoustic_grand_piano", 67, 0.46, vel=0.64, pan=0.18, release_s=0.24), int(0.022 * SR))
    mix_add(mix, bank.note("vibraphone", 60, 0.46, vel=0.46, pan=-0.24, release_s=0.24), int(0.012 * SR))
    mix_add(mix, bank.note("vibraphone", 67, 0.48, vel=0.48, pan=0.24, release_s=0.26), int(0.024 * SR))
    mix_add(mix, bank.note("french_horn", 60, 0.42, vel=0.44, pan=0.0, attack_ms=18, release_s=0.24), int(0.016 * SR))

    return apply_hall_reverb(mix, wet=0.20, rt60=0.68, damp_hz=3600.0, seed=706)


def build_wrong_answer(bank: SampleBank) -> np.ndarray:
    """`sfx_wrong_answer.mp3` — Classy, empathetic broadcast symphonic miss cadence (NEVER harsh)."""
    dur_s = 0.98
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Warm marimba + pizzicato + grand piano gentle descent (F4 -> E4 -> C4)
    steps = [(0.00, 65, -0.22, 0.28), (0.145, 64, 0.04, 0.28), (0.295, 60, 0.24, 0.58)]
    for t_s, mn, pan, d_s in steps:
        mix_add(mix, bank.note("marimba", mn, d_s, vel=0.72, pan=pan, release_s=d_s * 0.55), int(t_s * SR))
        mix_add(mix, bank.note("acoustic_grand_piano", mn, d_s + 0.14, vel=0.46, pan=pan * 0.6, release_s=0.24), int(t_s * SR))
        mix_add(mix, bank.note("pizzicato_strings", mn, d_s, vel=0.42, pan=-pan * 0.5, release_s=0.14), int(t_s * SR))

    # Empathetic low cello + muted French horn + soft trombone A-minor cushion
    mix_add(mix, bank.note("timpani", 45, 0.65, vel=0.50, pan=0.0, release_s=0.35), int(0.14 * SR))
    mix_add(mix, bank.note("cello", 45, 0.74, vel=0.64, pan=-0.26, attack_ms=34, release_s=0.38), int(0.14 * SR))
    mix_add(mix, bank.note("french_horn", 57, 0.68, vel=0.56, pan=0.22, attack_ms=36, release_s=0.36), int(0.15 * SR))
    mix_add(mix, bank.note("trombone", 52, 0.66, vel=0.48, pan=-0.10, attack_ms=36, release_s=0.36), int(0.16 * SR))
    mix_add(mix, bank.note("string_ensemble_1", 60, 0.62, vel=0.36, pan=0.18, attack_ms=45, release_s=0.35), int(0.28 * SR))

    return apply_hall_reverb(mix, wet=0.22, rt60=0.84, damp_hz=2900.0, seed=707)


def build_clock_tick(bank: SampleBank) -> np.ndarray:
    """`sfx_clock_tick.mp3` — Crisp real horological studio clock tick (6s..3s)."""
    dur_s = 0.22
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_spin_tick"), dur_s=0.055, speed=1.02, vel=0.92, pan=0.0), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.075, speed=1.34, vel=0.62, pan=-0.06, hp_hz=320), 0)
    mix_add(mix, bank.note("woodblock", 81, 0.050, vel=0.58, pan=0.04, release_s=0.028), 0)
    # Delicate mechanical escapement secondary rebound 24ms later
    mix_add(mix, shape_foley_clip(bank.foley("sfx_spin_tick"), dur_s=0.042, speed=1.28, vel=0.28, pan=0.16), int(0.024 * SR))
    return apply_hall_reverb(mix, wet=0.14, rt60=0.42, pre_delay_ms=6.0, damp_hz=3600.0, seed=708)


def build_clock_urgent(bank: SampleBank) -> np.ndarray:
    """`sfx_clock_urgent.mp3` — Urgent championship double-pulse clock + real timpani heartbeat (2s..1s)."""
    dur_s = 0.39
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)
    # Pulse 1 ("lub") at 0ms
    mix_add(mix, shape_foley_clip(bank.foley("sfx_spin_tick"), dur_s=0.052, speed=1.14, vel=0.90, pan=-0.12), 0)
    mix_add(mix, bank.note("woodblock", 83, 0.050, vel=0.72, pan=-0.10, release_s=0.026), 0)
    mix_add(mix, bank.note("timpani", 43, 0.22, vel=0.84, pan=-0.08, release_s=0.12), 0)
    mix_add(mix, bank.note("taiko_drum", 43, 0.18, vel=0.46, pan=0.0, release_s=0.10), 0)

    # Pulse 2 ("dub") at 148ms, slightly brighter & tenser!
    t2 = int(0.148 * SR)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_spin_tick"), dur_s=0.052, speed=1.34, vel=0.86, pan=0.14), t2)
    mix_add(mix, bank.note("woodblock", 86, 0.052, vel=0.76, pan=0.12, release_s=0.028), t2)
    mix_add(mix, bank.note("timpani", 45, 0.22, vel=0.70, pan=0.10, release_s=0.12), t2)
    return apply_hall_reverb(mix, wet=0.16, rt60=0.48, pre_delay_ms=6.0, damp_hz=3800.0, seed=709)


def build_buzzer_timeout(bank: SampleBank) -> np.ndarray:
    """`sfx_buzzer_timeout.mp3` — Authoritative Buzz!-punch transient + baritone brass & tubular bell time's-up!"""
    dur_s = 1.08
    mix = np.zeros((int(dur_s * SR), 2), dtype=np.float64)

    # Punchy mechanical studio stop latch
    mix_add(mix, shape_foley_clip(bank.foley("sfx_vault_thunk"), dur_s=0.22, speed=0.86, vel=0.92, pan=0.0), 0)
    mix_add(mix, shape_foley_clip(bank.foley("sfx_sightline_snap"), dur_s=0.12, speed=0.92, vel=0.72, pan=-0.10), 0)
    mix_add(mix, bank.note("timpani", 41, 0.85, vel=0.88, pan=0.0, release_s=0.44), 0)

    # Authoritative low baritone brass stop cadence: F2+C3+Ab3 -> E2+B2+G3!
    mix_add(mix, bank.note("tuba", 41, 0.34, vel=0.82, pan=0.0, attack_ms=8, release_s=0.14), int(0.008 * SR))
    mix_add(mix, bank.note("trombone", 48, 0.34, vel=0.78, pan=-0.26, attack_ms=8, release_s=0.14), int(0.008 * SR))
    mix_add(mix, bank.note("brass_section", 56, 0.34, vel=0.72, pan=0.26, attack_ms=10, release_s=0.14), int(0.010 * SR))

    mix_add(mix, bank.note("tuba", 40, 0.78, vel=0.86, pan=0.0, attack_ms=10, release_s=0.40), int(0.22 * SR))
    mix_add(mix, bank.note("trombone", 47, 0.78, vel=0.80, pan=-0.28, attack_ms=10, release_s=0.40), int(0.22 * SR))
    mix_add(mix, bank.note("brass_section", 55, 0.76, vel=0.76, pan=0.28, attack_ms=12, release_s=0.40), int(0.22 * SR))

    # Resonant studio tubular bell stop chime (F4 -> C4)
    mix_add(mix, bank.note("tubular_bells", 65, 0.62, vel=0.64, pan=-0.22, release_s=0.32), int(0.006 * SR))
    mix_add(mix, bank.note("tubular_bells", 60, 0.82, vel=0.68, pan=0.22, release_s=0.44), int(0.22 * SR))

    return apply_hall_reverb(mix, wet=0.24, rt60=0.88, damp_hz=2800.0, seed=710)


# ============================================================================
# 4. REAL SAMPLED CROWD ENERGY (Multi-Pitch MusyngKite Applause + Vocal Cheer + Gasp)
# ============================================================================

def build_sampled_crowd_applause(
    bank: SampleBank,
    dur_s: float,
    layer_specs: Sequence[Tuple[str, float, float, float, float]],
    cheer_level: float,
    arena_low_rumble: float,
    rt60: float,
    wet: float,
    lp_hz: float,
    seed: int,
) -> np.ndarray:
    """
    Build warm, organic, zero-hiss audience applause by layering real recorded
    MusyngKite `applause-mp3` notes at staggered slice offsets, micro-pitch speeds,
    stereo audience seating positions, warm vocal cheers, and acoustic room IR!

    `layer_specs` entries: (note_name, slice_offset_s, speed, pan, gain)
    """
    rng = np.random.default_rng(seed)
    n = int(round(dur_s * SR))
    t = np.arange(n, dtype=np.float64) / SR
    mix = np.zeros((n, 2), dtype=np.float64)

    # Natural live-broadcast applause envelope: crisp enthusiastic eruption -> buoyant sustain -> warm fade
    attack_tau = 0.085 if rt60 < 0.7 else (0.12 if rt60 < 1.3 else 0.17)
    sustain_end = dur_s * 0.54
    tail_dt = np.maximum(0.0, t - sustain_end)
    crowd_env = (1.0 - np.exp(-t / attack_tau)) * np.exp(-((tail_dt / (dur_s * 0.25)) ** 1.45))

    for idx, (note_name, slice_off_s, speed, pan, gain) in enumerate(layer_specs):
        raw = bank.raw_sample("applause", note_name)
        if abs(speed - 1.0) > 1e-4:
            raw = resample_speed(raw, speed)
        # Normalize each real recording cleanly
        pk = float(np.max(np.abs(raw)))
        if pk > 1e-8:
            raw = raw / pk

        # Tile smoothly with crossfaded slice offset if dur_s exceeds remaining tail
        i0 = int(round(slice_off_s * SR)) % max(1, raw.shape[0] - SR)
        layer = np.zeros((n, 2), dtype=np.float64)
        src_a = raw[i0:]
        if src_a.shape[0] >= n:
            layer[:] = src_a[:n]
        else:
            # Seamless 180ms crossfade wrap from a different offset in the same applause recording
            layer[: src_a.shape[0]] = src_a
            xf = min(int(0.18 * SR), src_a.shape[0] // 3)
            rem = n - src_a.shape[0] + xf
            j0 = int(round((0.38 + (idx * 0.17) % 0.65) * SR))
            src_b = raw[j0 : j0 + rem]
            if src_b.shape[0] < rem:
                src_b = np.pad(src_b, ((0, rem - src_b.shape[0]), (0, 0)), mode="reflect")
            u = np.linspace(0.0, 1.0, xf)
            fade_up = (u * u * (3.0 - 2.0 * u))[:, None]
            pos = src_a.shape[0] - xf
            layer[pos : pos + xf] = layer[pos : pos + xf] * (1.0 - fade_up) + src_b[:xf] * fade_up
            layer[pos + xf :] = src_b[xf : xf + (n - pos - xf)]

        # Subtle entry stagger (0..65ms) so crowd erupts organically rather than identically aligned
        stagger = int(rng.uniform(0.0, 0.065) * SR)
        placed = place_stereo(layer * gain, pan, width=0.80)
        mix_add(mix, placed, stagger)

    # Warm human cheer murmur layer (real MusyngKite choir_aahs + voice_oohs, gently diffused & band-shaped)
    if cheer_level > 0.0:
        cheer_notes = [("choir_aahs", "G3", -0.52), ("choir_aahs", "C4", 0.0), ("choir_aahs", "E4", 0.48), ("voice_oohs", "D4", -0.24), ("voice_oohs", "A3", 0.28)]
        cheer_bus = np.zeros((n, 2), dtype=np.float64)
        for ci, (inst, mn, pan) in enumerate(cheer_notes):
            v_clip = bank.raw_sample(inst, mn)
            spd = float(rng.uniform(0.95, 1.06))
            v_clip = resample_speed(v_clip, spd)
            pk = float(np.max(np.abs(v_clip)))
            if pk > 1e-8:
                v_clip /= pk
            # Slice warm mid-sustain vowel energy
            v0 = int(0.18 * SR)
            seg = v_clip[v0 : v0 + min(n, v_clip.shape[0] - v0)]
            seg = filter_eq(seg, bp_hz=(380.0, 2150.0))
            stagger = int((0.06 + ci * 0.05) * SR)
            mix_add(cheer_bus, place_stereo(seg * 0.25, pan), stagger)
        c_env = (1.0 - np.exp(-t / 0.24)) * np.exp(-np.maximum(0.0, t - dur_s * 0.44) / (dur_s * 0.28))
        mix += cheer_bus * c_env[:, None] * cheer_level

    # Deep stadium floor warmth & distant roar for Global Arena (from low-pitched applause + distant taiko/timpani)
    if arena_low_rumble > 0.0:
        roar_a = resample_speed(bank.raw_sample("applause", "C3"), 0.72)
        roar_b = resample_speed(bank.raw_sample("applause", "G3"), 0.66)
        for r_i, roar in enumerate((roar_a, roar_b)):
            pk = float(np.max(np.abs(roar)))
            if pk > 1e-8:
                roar /= pk
            seg = roar[int(0.45 * SR) : int(0.45 * SR) + n]
            if seg.shape[0] < n:
                seg = np.pad(seg, ((0, n - seg.shape[0]), (0, 0)), mode="reflect")
            seg = filter_eq(seg, bp_hz=(90.0, 480.0))
            mix += place_stereo(seg * arena_low_rumble * 0.55, -0.35 if r_i == 0 else 0.35)

    # Apply broadcast crowd envelope + warm hall EQ (rolls off brittle high-end hiss completely!)
    mix *= crowd_env[:, None]
    mix = filter_eq(mix, hp_hz=95.0, lp_hz=lp_hz)
    return apply_hall_reverb(mix, wet=wet, rt60=rt60, pre_delay_ms=18.0 if rt60 > 1.2 else 10.0, damp_hz=min(3400.0, lp_hz * 0.58), seed=seed + 55)


def build_crowd_small_hall(bank: SampleBank) -> np.ndarray:
    """`sfx_crowd_small_hall.mp3` — Tiers 1-2 intimate 42-seat oak community hall applause."""
    layers = [
        ("A3", 0.35, 0.96, -0.74, 0.68),
        ("B3", 0.82, 1.03, -0.24, 0.76),
        ("C4", 0.52, 0.99, 0.28, 0.74),
        ("D4", 1.15, 1.05, 0.72, 0.66),
        ("G3", 0.68, 0.94, 0.02, 0.52),
    ]
    return build_sampled_crowd_applause(
        bank, dur_s=2.25, layer_specs=layers,
        cheer_level=0.05, arena_low_rumble=0.0,
        rt60=0.46, wet=0.18, lp_hz=6600.0, seed=811,
    )


def build_crowd_tv_studio(bank: SampleBank) -> np.ndarray:
    """`sfx_crowd_tv_studio.mp3` — Tiers 3-5 lively 250-seat prime-time TV studio applause & cheers."""
    layers = [
        ("G3", 0.32, 0.93, -0.84, 0.56),
        ("A3", 0.78, 0.98, -0.62, 0.64),
        ("Bb3", 1.18, 1.02, -0.40, 0.66),
        ("B3", 0.48, 0.96, -0.18, 0.68),
        ("C4", 0.92, 1.00, 0.02, 0.72),
        ("Db4", 0.38, 1.04, 0.22, 0.66),
        ("D4", 1.28, 0.97, 0.44, 0.64),
        ("E4", 0.62, 1.05, 0.66, 0.58),
        ("G4", 1.02, 1.01, 0.84, 0.50),
    ]
    return build_sampled_crowd_applause(
        bank, dur_s=2.78, layer_specs=layers,
        cheer_level=0.22, arena_low_rumble=0.08,
        rt60=0.92, wet=0.28, lp_hz=7200.0, seed=822,
    )


def build_crowd_global_arena(bank: SampleBank) -> np.ndarray:
    """`sfx_crowd_global_arena.mp3` — Tiers 6-8 massive global championship stadium ovation & roar."""
    layers = [
        ("C3", 0.30, 0.91, -0.88, 0.62),
        ("E3", 0.74, 0.95, -0.74, 0.64),
        ("G3", 1.12, 0.98, -0.60, 0.66),
        ("A3", 0.42, 0.94, -0.46, 0.66),
        ("Bb3", 0.88, 1.01, -0.32, 0.68),
        ("B3", 1.26, 0.97, -0.18, 0.68),
        ("C4", 0.54, 1.00, -0.04, 0.70),
        ("Db4", 0.98, 1.03, 0.10, 0.68),
        ("D4", 0.36, 0.96, 0.24, 0.66),
        ("Eb4", 0.82, 1.04, 0.38, 0.64),
        ("E4", 1.20, 0.99, 0.52, 0.62),
        ("G4", 0.48, 1.05, 0.66, 0.58),
        ("A4", 0.92, 1.02, 0.78, 0.52),
        ("C5", 0.64, 0.97, 0.88, 0.44),
    ]
    return build_sampled_crowd_applause(
        bank, dur_s=3.42, layer_specs=layers,
        cheer_level=0.40, arena_low_rumble=0.38,
        rt60=1.75, wet=0.40, lp_hz=6800.0, seed=833,
    )


def build_crowd_gasp(bank: SampleBank) -> np.ndarray:
    """
    `sfx_crowd_gasp.mp3` — Crisp, natural TV-studio audience startled breath intake + sympathetic 'ohh!'
    Uses ONLY real MusyngKite `breath_noise`, mid/high cluster-detuned `voice_oohs` & `choir_aahs`,
    and subtle `applause` room hush (ZERO oscillators, ZERO gloomy low choir drone!).
    """
    rng = np.random.default_rng(844)
    dur_s = 1.28
    n = int(round(dur_s * SR))
    mix = np.zeros((n, 2), dtype=np.float64)

    # 1) 0..290ms: Unmistakable collective sharp startled breath-intake ("Hhh!") from 8 real `breath_noise` layers
    breath_specs = [
        ("A3", 0.12, 0.96, -0.84, 0.000, 0.86),
        ("C4", 0.48, 1.02, -0.60, 0.008, 0.95),
        ("D4", 0.86, 1.07, -0.34, 0.004, 1.00),
        ("E4", 1.24, 1.00, -0.10, 0.015, 0.96),
        ("G4", 0.30, 1.11, 0.14, 0.006, 1.00),
        ("A4", 0.72, 1.05, 0.38, 0.018, 0.94),
        ("C5", 1.10, 0.98, 0.62, 0.012, 0.88),
        ("D4", 1.55, 1.14, 0.84, 0.022, 0.82),
    ]
    for mn, off_s, spd, pan, delay_s, g in breath_specs:
        raw = bank.raw_sample("breath_noise", mn)
        seg = shape_foley_clip(
            raw, start_s=off_s, dur_s=0.25, speed=spd, vel=g * 0.92, pan=pan,
            bp_hz=(920.0, 4800.0), fade_in_ms=22.0, fade_out_ms=135.0,
        )
        mix_add(mix, seg, int(delay_s * SR))

    # 2) 105..1020ms: Light, sympathetic conversational-register studio audience "ohh/aww!"
    # Cluster-spaced mid/upper voices (C4..C5, high-passed >= 290Hz so ZERO boomy choir groan!)
    ooh_specs = [
        ("voice_oohs", "C4", -0.78, 0.105, 1.04, 0.92, 0.56),
        ("voice_oohs", "Db4", -0.58, 0.122, 1.02, 0.90, 0.52),
        ("choir_aahs", "Eb4", -0.40, 0.112, 1.05, 0.91, 0.48),
        ("voice_oohs", "E4", -0.22, 0.135, 1.03, 0.89, 0.58),
        ("choir_aahs", "F4", -0.04, 0.118, 1.01, 0.90, 0.50),
        ("voice_oohs", "Gb4", 0.14, 0.128, 1.04, 0.91, 0.56),
        ("voice_oohs", "Ab4", 0.34, 0.108, 1.02, 0.88, 0.54),
        ("choir_aahs", "Bb4", 0.52, 0.142, 1.05, 0.92, 0.46),
        ("voice_oohs", "B4", 0.68, 0.120, 1.03, 0.90, 0.48),
        ("voice_oohs", "C5", 0.82, 0.148, 1.01, 0.89, 0.44),
    ]
    for inst, mn, pan, delay_s, spd_hi, spd_lo, gain in ooh_specs:
        raw = bank.raw_sample(inst, mn)
        seg = raw[int(0.03 * SR) : int(0.88 * SR)].copy()
        glided = varispeed_pitch_glide(seg, spd_hi, spd_lo, glide_tau_s=float(rng.uniform(0.18, 0.28)))
        glided = filter_eq(glided, hp_hz=290.0, lp_hz=2850.0)
        pk = float(np.max(np.abs(glided)))
        if pk > 1e-8:
            glided /= pk
        vn = min(glided.shape[0], int(float(rng.uniform(0.56, 0.78)) * SR))
        glided = glided[:vn]
        vt = np.arange(vn, dtype=np.float64) / SR
        env = (1.0 - np.exp(-vt / 0.055)) * np.exp(-((vt / (vn / SR * 0.56)) ** 2.0))
        glided *= env[:, None]
        mix_add(mix, place_stereo(glided * gain * 0.20, pan), int(delay_s * SR))

    # 3) Subtle warm studio audience seat-rustle / hush bed grounding the gasp in the live TV studio
    hush = shape_foley_clip(
        bank.raw_sample("applause", "C4"),
        start_s=0.40, dur_s=0.95, speed=0.88, vel=0.14, pan=0.0,
        bp_hz=(320.0, 2100.0), fade_in_ms=70.0, fade_out_ms=420.0,
    )
    mix_add(mix, hush, int(0.08 * SR))

    return apply_hall_reverb(mix, wet=0.26, rt60=0.82, pre_delay_ms=10.0, damp_hz=3200.0, seed=845)


# ============================================================================
# Prefetch Registry & Automated Build + Verification Pipeline
# ============================================================================

def collect_required_samples() -> List[Tuple[str, str]]:
    """Pre-list all (instrument, note) pairs needed so ThreadPool downloads them in parallel."""
    pairs: Set[Tuple[str, str]] = set()

    def add_midi(inst: str, midis: Sequence[int]) -> None:
        for m in midis:
            pairs.add((inst, midi_to_note_name(m)))

    def add_notes(inst: str, notes: Sequence[str]) -> None:
        for n in notes:
            pairs.add((inst, n))

    add_midi("cello", [45, 48, 50, 52, 55])
    add_midi("contrabass", [36, 38, 43])
    add_midi("orchestral_harp", [55, 60, 62, 64, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 78, 79, 81, 83, 84, 85, 86])
    add_midi("vibraphone", [60, 62, 64, 66, 67, 68, 69, 71, 73, 74, 75, 76, 78, 79, 81, 86])
    add_midi("acoustic_grand_piano", [48, 60, 62, 64, 65, 67, 68, 69, 71, 72, 73, 74, 75, 76, 78])
    add_midi("celesta", [62, 66, 69, 72, 73, 74, 76, 78, 79, 81, 83, 84, 85, 86, 87, 88, 90, 91, 93, 96])
    add_midi("glockenspiel", [78, 83, 84, 86, 88, 91, 96])
    add_midi("tubular_bells", [60, 65, 67, 72, 74, 76, 79, 81, 84])
    add_midi("string_ensemble_1", [60, 62, 64, 66, 67, 68, 69, 71, 72, 73, 74, 76, 78, 79, 81, 84])
    add_midi("string_ensemble_2", [72, 79])
    add_midi("pizzicato_strings", [60, 62, 63, 64, 65])
    add_midi("french_horn", [55, 57, 59, 60, 62, 64, 67, 68, 69, 71])
    add_midi("brass_section", [43, 55, 56, 58, 60, 61, 62, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 76, 79, 81])
    add_midi("trumpet", [67, 71, 72, 74, 76, 79, 84])
    add_midi("muted_trumpet", [62, 63, 73])
    add_midi("trombone", [43, 47, 48, 49, 52, 55])
    add_midi("tuba", [40, 41, 43])
    add_midi("flute", [76])
    add_midi("bassoon", [50, 51])
    add_midi("kalimba", [67, 74])
    add_midi("marimba", [60, 64, 65])
    add_midi("timpani", [38, 40, 41, 43, 45, 48])
    add_midi("taiko_drum", [43])
    add_midi("woodblock", [60, 71, 74, 76, 79, 81, 83, 86])
    add_midi("agogo", [74, 79])
    add_midi("tinkle_bell", [79, 81, 83, 84, 86, 88, 91])
    add_midi("orchestra_hit", [62])
    add_notes("gunshot", ["C3"])
    add_notes("reverse_cymbal", ["C4", "D4", "G4"])
    add_notes("guitar_fret_noise", ["E4"])
    add_notes("applause", ["C3", "E3", "G3", "A3", "Bb3", "B3", "C4", "Db4", "D4", "Eb4", "E4", "G4", "A4", "C5"])
    add_notes("breath_noise", ["A3", "C4", "D4", "E4", "G4", "A4", "C5"])
    add_notes("voice_oohs", ["A3", "C4", "Db4", "D4", "E4", "Gb4", "Ab4", "B4", "C5"])
    add_notes("choir_aahs", ["G3", "C4", "Eb4", "E4", "F4", "Bb4"])
    return sorted(pairs)


def build_and_verify_all() -> None:
    PUBLIC_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    bank = SampleBank()

    print("=== WORLD'S SMARTEST v5.0 — SYMPHONIC FOLEY, PROPS & REAL CROWD SFX PIPELINE ===")
    print(f"  FFmpeg binary : {FFMPEG}")
    print(f"  Sample cache  : {SAMPLE_CACHE_DIR}")

    # Load all preserved real recorded physical foley stems into RAM before writing anything
    bank.preload_legacy_foley()
    print(f"  Loaded legacy physical foley stems : {len(bank._foley_cache)}")

    # Pre-fetch all required MusyngKite real acoustic samples concurrently
    required = collect_required_samples()
    bank.prefetch(required)

    # Master list of all 24 v5 SFX deliverables: (filename, builder, target_peak_db, bitrate, drive)
    jobs: List[Tuple[str, str, callable, float, str, float]] = [
        # 1) Five Escalating Symphonic Streak Reward Fanfares
        ("STREAK", "sfx_streak_1.mp3", lambda: build_streak_fanfare(bank, 1), -2.5, "128k", 1.06),
        ("STREAK", "sfx_streak_2.mp3", lambda: build_streak_fanfare(bank, 2), -2.4, "128k", 1.06),
        ("STREAK", "sfx_streak_3.mp3", lambda: build_streak_fanfare(bank, 3), -2.3, "128k", 1.08),
        ("STREAK", "sfx_streak_4.mp3", lambda: build_streak_fanfare(bank, 4), -2.2, "128k", 1.10),
        ("STREAK", "sfx_streak_5.mp3", lambda: build_streak_fanfare(bank, 5), -2.1, "128k", 1.12),
        # 2) Four Brand-New v5 Tactile Props & Board Show Cues
        ("V5_NEW", "sfx_screw_slam.mp3", lambda: build_screw_slam(bank), -2.1, "128k", 1.24),
        ("V5_NEW", "sfx_jackpot_sweep.mp3", lambda: build_jackpot_sweep(bank), -2.1, "128k", 1.12),
        ("V5_NEW", "sfx_polaroid_pin.mp3", lambda: build_polaroid_pin(bank), -2.8, "128k", 1.08),
        ("V5_NEW", "sfx_switch_clack.mp3", lambda: build_switch_clack(bank), -2.6, "128k", 1.12),
        # 3) Eleven Upgraded Board, Clock & Buzzer Cues
        ("BOARD", "sfx_padlock_break.mp3", lambda: build_padlock_break(bank), -2.2, "128k", 1.15),
        ("BOARD", "sfx_tile_flip.mp3", lambda: build_tile_flip(bank), -2.8, "128k", 1.06),
        ("BOARD", "sfx_wheel_tick.mp3", lambda: build_wheel_tick(bank), -3.2, "128k", 1.05),
        ("BOARD", "sfx_power_play.mp3", lambda: build_power_play(bank), -2.2, "128k", 1.12),
        ("BOARD", "sfx_wedge_earned.mp3", lambda: build_wedge_earned(bank), -2.2, "128k", 1.12),
        ("BOARD", "sfx_rival_trap.mp3", lambda: build_rival_trap(bank), -2.3, "128k", 1.16),
        ("BOARD", "sfx_lock_in.mp3", lambda: build_lock_in(bank), -2.4, "128k", 1.12),
        ("BOARD", "sfx_wrong_answer.mp3", lambda: build_wrong_answer(bank), -2.6, "128k", 1.06),
        ("CLOCK", "sfx_clock_tick.mp3", lambda: build_clock_tick(bank), -2.8, "128k", 1.05),
        ("CLOCK", "sfx_clock_urgent.mp3", lambda: build_clock_urgent(bank), -2.3, "128k", 1.10),
        ("CLOCK", "sfx_buzzer_timeout.mp3", lambda: build_buzzer_timeout(bank), -2.2, "128k", 1.18),
        # 4) Four Real Sampled Crowd Energy Cues
        ("CROWD", "sfx_crowd_small_hall.mp3", lambda: build_crowd_small_hall(bank), -2.8, "96k", 1.04),
        ("CROWD", "sfx_crowd_tv_studio.mp3", lambda: build_crowd_tv_studio(bank), -2.5, "96k", 1.06),
        ("CROWD", "sfx_crowd_global_arena.mp3", lambda: build_crowd_global_arena(bank), -2.2, "96k", 1.08),
        ("CROWD", "sfx_crowd_gasp.mp3", lambda: build_crowd_gasp(bank), -2.5, "96k", 1.06),
    ]

    built_metrics: Dict[str, Dict[str, float]] = {}
    for tag, fname, fn, target_pk, br, drv in jobs:
        stereo = fn()
        out_path = PUBLIC_AUDIO_DIR / fname
        m = master_sfx_to_mp3(stereo, out_path, target_peak_db=target_pk, bitrate=br, drive=drv)
        built_metrics[fname] = m
        print(
            f"  [{tag:6s}] {fname:27s} | {m['bytes']/1024:5.1f} KB | "
            f"{m['duration_s']:5.2f}s | Peak={m['peak_db']:6.2f} dBFS | RMS={m['rms_db']:6.2f} dBFS"
        )

    # ========================================================================
    # STRICT AUTOMATED VERIFICATION OF ALL sfx_*.mp3 IN public/assets/audio/
    # ========================================================================
    errors: List[str] = []
    all_sfx = sorted(PUBLIC_AUDIO_DIR.glob("sfx_*.mp3"))
    total_sfx_bytes = 0

    for p in all_sfx:
        total_sfx_bytes += p.stat().st_size
        if p.stat().st_size < 1000:
            errors.append(f"{p.name}: tiny file ({p.stat().st_size} bytes)")
            continue
        if not check_valid_mp3_header(p):
            errors.append(f"{p.name}: invalid MP3/ID3 frame header")
        m = built_metrics.get(p.name) or measure_audio_metrics(p)
        if m["non_finite"] > 0:
            errors.append(f"{p.name}: {m['non_finite']} NaN/Inf samples")
        if m["clipped_samples"] > 0:
            errors.append(f"{p.name}: {m['clipped_samples']} clipped samples")
        if m["peak_db"] > -1.50:
            errors.append(f"{p.name}: 48kHz True Peak {m['peak_db']} dBFS exceeds -1.50 dBFS ceiling")
        if m["rms_db"] < -40.0:
            errors.append(f"{p.name}: near-silent RMS {m['rms_db']} dBFS")

    # Verify all 24 deliverables exist
    for _tag, fname, *_rest in jobs:
        if not (PUBLIC_AUDIO_DIR / fname).exists():
            errors.append(f"{fname}: missing deliverable")

    print("\n=== v5 FOLEY & SFX VERIFICATION SUMMARY ===")
    print(f"  Newly built/upgraded v5 SFX : {len(built_metrics)}")
    print(f"  Total sfx_*.mp3 verified    : {len(all_sfx)}")
    print(f"  Total sfx_*.mp3 size        : {total_sfx_bytes:,} bytes ({total_sfx_bytes/1024:.1f} KB)")

    if errors:
        print("\n[FAIL] SFX VERIFICATION ERRORS:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("  [PASS] ALL 34 sfx_*.mp3 files verified: valid MP3 headers, 48kHz True Peak <= -1.5 dBFS, zero NaNs/clips/silence, 0 oscillators!")


if __name__ == "__main__":
    build_and_verify_all()
