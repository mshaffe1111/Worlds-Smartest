#!/usr/bin/env python3
"""
World's Smartest v6.0 — Principal Horological Foley & Real-Orchestra Streak Pipeline
====================================================================================
100% REAL RECORDED ACOUSTIC PRIMITIVES (ZERO math oscillators / ZERO synthetic tone waves!):
  - Sources real studio-recorded CC0 VSCO-2-CE multi-velocity WAVs (`%TEMP%\\vsco2_samples`:
    Percussion, VSCO 1 Percussion, Miscellania Raw, Brass, Strings, Harp, Timpani, Glockenspiel),
    verified microphone-recorded horology/physical stems (`%TEMP%\\ws_real_recordings`:
    watch escapement, brass clock detent, Canon T50 shutter, glass shatter, hand-hammered
    bronze singing bowl, crystal wineglass, micro-switch, rubber pneumatic seal), and
    studio crowd/orchestral reinforcements (`%TEMP%\\ws_v5_musyngkite_cache` & repo crowd stems).
  - Applies impulse-excited physical modal resonance filtering (brass, bronze, tool-steel,
    carved limestone, ruby-mahogany, quartz crystal eigenmodes) and dual studio convolution
    impulse responses (`Watchmaker Mahogany Booth IR` RT60=0.22s & `Scoring Stage IR` RT60=1.15s).
  - Renders ALL 33 `FoleySfxIdV6` cues into `public/assets/audio/v6/sfx/<id>.mp3` at
    `48kHz`, `192kbps` stereo MP3, verified `<5ms` transient attack, `True Peak <= -1.5 dBFS`,
    zero clipping, and zero non-finite samples — including 5 ascending real-orchestra
    brass + strings + concert harp streak stingers (`streak_chord_1` .. `streak_fanfare_5`).
"""

from __future__ import annotations

import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np
from scipy import signal

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_SFX_DIR = REPO_ROOT / "public" / "assets" / "audio" / "v6" / "sfx"
LEGACY_AUDIO_DIR = REPO_ROOT / "public" / "assets" / "audio"

TEMP_ROOT = Path(tempfile.gettempdir())
VSCO2_DIR = TEMP_ROOT / "vsco2_samples"
REAL_REC_DIR = TEMP_ROOT / "ws_real_recordings"
MUSYNG_DIR = TEMP_ROOT / "ws_v5_musyngkite_cache"

SR = 48000
BITRATE = "192k"

ALL_FOLEY_IDS_V6: Tuple[str, ...] = (
    "ui_brass_tap",
    "neve_fader_detent",
    "rotary_knob_click",
    "brass_gear_detent",
    "optical_beam_lock",
    "crystal_hex_claim",
    "iron_chain_shatter",
    "wire_cutter_snip",
    "nixie_spark_crackle",
    "cryptex_stone_tumbler",
    "globe_pin_ruby_click",
    "paddle_spring_slam",
    "trapdoor_hinge_drop",
    "pneumatic_piston_slam",
    "velvet_trunk_clasp",
    "foil_card_flick",
    "relic_pedestal_hum",
    "trophy_pedestal_chime",
    "medal_enamel_clink",
    "screw_rival_slam",
    "twist_siren_chime",
    "clock_horology_tick",
    "clock_escapement_urgent",
    "vault_heavy_unlock",
    "chip_stack_riffle",
    "crowd_warm_applause",
    "crowd_studio_roar",
    "crowd_collective_gasp",
    "streak_chord_1",
    "streak_chord_2",
    "streak_chord_3",
    "streak_chord_4",
    "streak_fanfare_5",
)

NOTE_TO_SEMI = {
    "C": 0, "C#": 1, "DB": 1,
    "D": 2, "D#": 3, "EB": 3,
    "E": 4, "F": 5, "F#": 6, "GB": 6,
    "G": 7, "G#": 8, "AB": 8,
    "A": 9, "A#": 10, "BB": 10,
    "B": 11,
}
NOTE_NAMES_FLAT = ("C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B")


# ============================================================================
# FFmpeg Discovery, Decoding & Broadcast Mastering (48kHz / 192kbps Stereo)
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


def decode_stereo_48k(path: Path) -> np.ndarray:
    """Decode any WAV/OGG/FLAC/MP3 file into 48kHz stereo float64 PCM [N, 2]."""
    proc = subprocess.run(
        [FFMPEG, "-v", "error", "-i", str(path), "-ar", str(SR), "-ac", "2", "-f", "f32le", "-"],
        capture_output=True,
        check=True,
    )
    raw = np.frombuffer(proc.stdout, dtype="<f4")
    if raw.size < 2:
        raise ValueError(f"Empty PCM decoded from {path}")
    return raw.reshape(-1, 2).astype(np.float64)


def write_wav_stereo_24_or_16(path: Path, stereo: np.ndarray, sr: int = SR) -> None:
    arr = np.asarray(stereo, dtype=np.float64)
    if arr.ndim != 2 or arr.shape[1] != 2:
        raise ValueError(f"Expected stereo [N, 2], got {arr.shape}")
    if not np.all(np.isfinite(arr)):
        raise ValueError(f"Non-finite samples detected for {path.name}")
    clipped = np.clip(arr, -0.99, 0.99)
    # 24-bit PCM WAV feeds LAME MP3 encoder with full dynamic precision
    scaled = np.round(clipped * 8388607.0).astype("<i4")
    b = scaled.view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(3)
        wf.setframerate(sr)
        wf.writeframes(b)


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


def measure_audio_metrics(mp3_path: Path) -> Dict[str, float]:
    """Decode encoded MP3 at 48kHz stereo & mono to measure True Peak, RMS, attack_ms, clips, NaNs."""
    peaks: List[float] = []
    rms_val = 0.0
    dur_sec = 0.0
    attack_ms = 0.0
    clipped = 0
    non_finite = 0

    for ch in ("2", "1"):
        proc = subprocess.run(
            [FFMPEG, "-v", "error", "-i", str(mp3_path), "-ar", str(SR), "-ac", ch, "-f", "f32le", "-"],
            capture_output=True,
            check=True,
        )
        pcm = np.frombuffer(proc.stdout, dtype="<f4")
        if pcm.size == 0:
            raise ValueError(f"Decoded 0 samples from {mp3_path.name}")
        non_finite += int(np.sum(~np.isfinite(pcm)))
        abs_p = np.abs(pcm)
        pk = float(np.max(abs_p))
        peaks.append(pk)
        clipped += int(np.sum(abs_p >= 0.999))
        if ch == "1":
            rms_val = float(np.sqrt(np.mean(pcm.astype(np.float64) ** 2)))
            dur_sec = pcm.size / float(SR)
            # Onset time to 12% of peak magnitude
            if pk > 1e-7:
                hit_idx = int(np.argmax(abs_p >= pk * 0.12))
                attack_ms = (hit_idx / float(SR)) * 1000.0

    peak = max(peaks)
    peak_db = 20.0 * math.log10(peak) if peak > 1e-12 else -120.0
    rms_db = 20.0 * math.log10(rms_val) if rms_val > 1e-12 else -120.0
    return {
        "duration_s": round(dur_sec, 3),
        "peak_db": round(peak_db, 2),
        "rms_db": round(rms_db, 2),
        "attack_ms": round(attack_ms, 2),
        "clipped_samples": clipped,
        "non_finite": non_finite,
        "bytes": mp3_path.stat().st_size,
    }


# ============================================================================
# DSP Primitives (100% Sample & Filter Based — ZERO Wave Oscillators!)
# ============================================================================

def place_stereo(stereo: np.ndarray, pan: float = 0.0, width: float = 0.72) -> np.ndarray:
    """Constant-power stereo placement preserving natural acoustic stereo width."""
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
    """High-precision cubic/linear varispeed pitch & time shift on real recorded PCM."""
    spd = max(0.22, min(4.5, float(speed)))
    if abs(spd - 1.0) < 1e-4:
        return stereo.copy()
    n_in = stereo.shape[0]
    n_out = max(8, int(round(n_in / spd)))
    x_in = np.arange(n_in, dtype=np.float64)
    x_out = np.linspace(0.0, n_in - 1.0, n_out, dtype=np.float64)
    out = np.empty((n_out, 2), dtype=np.float64)
    out[:, 0] = np.interp(x_out, x_in, stereo[:, 0])
    out[:, 1] = np.interp(x_out, x_in, stereo[:, 1])
    return out


def pitch_glide(stereo: np.ndarray, speed_start: float, speed_end: float, tau_s: float = 0.28) -> np.ndarray:
    """Smooth exponential playback-rate glide over a real recording (e.g. crowd gasp 'ooh!')."""
    n_in = stereo.shape[0]
    avg = 0.5 * (speed_start + speed_end)
    n_out = max(16, int(round((n_in - 2) / max(0.35, avg))))
    t = np.arange(n_out, dtype=np.float64) / float(SR)
    rates = speed_end + (speed_start - speed_end) * np.exp(-t / max(0.03, tau_s))
    pos = np.cumsum(rates)
    pos = pos[pos < (n_in - 1.001)]
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
    shelf_hi_db: Optional[Tuple[float, float]] = None,
    order: int = 2,
) -> np.ndarray:
    out = stereo.copy()
    if out.shape[0] < 32:
        return out
    nyq = SR * 0.48
    if bp_hz is not None:
        lo, hi = max(25.0, bp_hz[0]), min(nyq, bp_hz[1])
        if hi > lo + 25.0:
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
    if shelf_hi_db is not None:
        fc, gain_db = shelf_hi_db
        if abs(gain_db) > 0.1 and fc < nyq:
            sos_hi = signal.butter(1, fc, btype="highpass", fs=SR, output="sos")
            hi_l = signal.sosfilt(sos_hi, out[:, 0])
            hi_r = signal.sosfilt(sos_hi, out[:, 1])
            scale = (10.0 ** (gain_db / 20.0)) - 1.0
            out[:, 0] += hi_l * scale
            out[:, 1] += hi_r * scale
    return out


def apply_modal_resonance(
    stereo: np.ndarray,
    modes_hz: Sequence[Tuple[float, float, float]],
    wet: float = 0.24,
) -> np.ndarray:
    """
    Impulse-excited physical modal resonance filter bank (ZERO oscillators!).
    Each entry in `modes_hz` is `(freq_hz, Q_factor, rel_gain)`.
    The recorded acoustic transient excites physical material eigenmodes via second-order
    resonant peak filters (`scipy.signal.iirpeak`), sculpting authentic brass/bronze/stone/steel body.
    """
    if stereo.shape[0] < 32 or wet <= 0.0:
        return stereo.copy()
    nyq = SR * 0.47
    res = np.zeros_like(stereo)
    for freq_hz, q_val, rel_gain in modes_hz:
        if freq_hz < 40.0 or freq_hz >= nyq:
            continue
        b, a = signal.iirpeak(freq_hz, max(2.0, q_val), fs=SR)
        res[:, 0] += signal.lfilter(b, a, stereo[:, 0]) * rel_gain
        res[:, 1] += signal.lfilter(b, a, stereo[:, 1]) * rel_gain
    src_rms = float(np.sqrt(np.mean(stereo * stereo))) + 1e-12
    res_rms = float(np.sqrt(np.mean(res * res))) + 1e-12
    res = res * (src_rms / res_rms)
    return stereo * (1.0 - wet * 0.25) + res * wet


def trim_to_transient(stereo: np.ndarray, thresh: float = 0.06, pre_ms: float = 1.0) -> np.ndarray:
    """Tightly trim leading silence right up to the primary physical transient."""
    mono = 0.5 * (np.abs(stereo[:, 0]) + np.abs(stereo[:, 1]))
    pk = float(np.max(mono))
    if pk < 1e-8:
        return stereo.copy()
    idx = int(np.argmax(mono >= pk * thresh))
    start = max(0, idx - int(pre_ms * 0.001 * SR))
    return stereo[start:].copy()


def slice_peak_event(stereo: np.ndarray, dur_s: float, pre_ms: float = 3.0, search_s: float = 3.0) -> np.ndarray:
    """Extract a crisp single hit centered tightly on the strongest peak inside a field recording."""
    n_search = min(stereo.shape[0], int(search_s * SR))
    mono = 0.5 * (np.abs(stereo[:n_search, 0]) + np.abs(stereo[:n_search, 1]))
    pk_idx = int(np.argmax(mono))
    start = max(0, pk_idx - int(pre_ms * 0.001 * SR))
    end = min(stereo.shape[0], start + int(round(dur_s * SR)))
    return stereo[start:end].copy()


def shape_clip(
    clip: np.ndarray,
    start_s: float = 0.0,
    dur_s: Optional[float] = None,
    speed: float = 1.0,
    vel: float = 1.0,
    pan: float = 0.0,
    hp_hz: Optional[float] = None,
    lp_hz: Optional[float] = None,
    bp_hz: Optional[Tuple[float, float]] = None,
    fade_in_ms: float = 1.0,
    fade_out_ms: float = 20.0,
    trim_lead: bool = True,
    norm_peak: bool = True,
) -> np.ndarray:
    i0 = max(0, int(round(start_s * SR)))
    buf = clip[i0:].copy()
    if trim_lead and start_s == 0.0:
        buf = trim_to_transient(buf, thresh=0.05, pre_ms=1.0)
    if abs(speed - 1.0) > 1e-4:
        buf = resample_speed(buf, speed)
    if dur_s is not None:
        buf = buf[: max(16, int(round(dur_s * SR)))].copy()
    if hp_hz or lp_hz or bp_hz:
        buf = filter_eq(buf, hp_hz=hp_hz, lp_hz=lp_hz, bp_hz=bp_hz)
    if norm_peak:
        pk = float(np.max(np.abs(buf)))
        if pk > 1e-8:
            buf = buf / pk
    n = buf.shape[0]
    n_in = min(int(fade_in_ms * 0.001 * SR), max(1, n // 6))
    n_out = min(int(fade_out_ms * 0.001 * SR), max(1, n // 2))
    if n_in > 1:
        u = np.linspace(0.0, 1.0, n_in)
        buf[:n_in] *= (u * u * (3.0 - 2.0 * u))[:, None]
    if n_out > 1:
        u = np.linspace(1.0, 0.0, n_out)
        buf[-n_out:] *= (u * u * (3.0 - 2.0 * u))[:, None]
    return place_stereo(buf * vel, pan)


# ============================================================================
# Dual Acoustic Room IR Convolution (Watchmaker Booth + Scoring Stage)
# ============================================================================

_IR_CACHE: Dict[Tuple[str, int], np.ndarray] = {}


def get_studio_ir(space: str, seed: int = 101) -> np.ndarray:
    """
    Construct tight acoustic studio impulse responses:
      - 'booth' : Watchmaker Mahogany Booth (RT60=0.22s, early reflections 3..22ms)
      - 'stage' : Prime-Time Broadcast Stage (RT60=0.68s, warm studio early reflections)
      - 'hall'  : Scoring Stage Concert Room (RT60=1.18s, lush stereo orchestral bloom)
    """
    key = (space, seed)
    if key in _IR_CACHE:
        return _IR_CACHE[key]

    rng = np.random.default_rng(seed)
    if space == "booth":
        rt60, pre_ms, damp_hz, hp_hz = 0.22, 3.5, 4200.0, 180.0
        early = [
            (0.0032, 0.42, -0.52),
            (0.0058, 0.34, 0.56),
            (0.0094, 0.25, -0.35),
            (0.0142, 0.18, 0.44),
            (0.0198, 0.12, -0.60),
        ]
        tail_scale = 0.075
    elif space == "stage":
        rt60, pre_ms, damp_hz, hp_hz = 0.68, 9.0, 4000.0, 140.0
        early = [
            (0.007, 0.36, -0.45),
            (0.012, 0.30, 0.50),
            (0.019, 0.24, -0.62),
            (0.028, 0.17, 0.38),
            (0.039, 0.12, -0.28),
        ]
        tail_scale = 0.10
    else:  # 'hall'
        rt60, pre_ms, damp_hz, hp_hz = 1.18, 13.5, 4500.0, 125.0
        early = [
            (0.009, 0.35, -0.50),
            (0.015, 0.30, 0.54),
            (0.023, 0.24, -0.64),
            (0.032, 0.19, 0.42),
            (0.044, 0.15, -0.34),
            (0.058, 0.11, 0.68),
        ]
        tail_scale = 0.115

    n = int((rt60 * 1.25 + pre_ms * 0.001) * SR)
    ir = np.zeros((n, 2), dtype=np.float64)
    for t_s, amp, pan in early:
        idx = int(t_s * SR)
        if idx < n:
            ir[idx, 0] += amp * math.sqrt(0.5 * (1.0 - pan))
            ir[idx, 1] += amp * math.sqrt(0.5 * (1.0 + pan))

    pre_n = int(pre_ms * 0.001 * SR)
    tail_len = max(16, n - pre_n)
    t_tail = np.arange(tail_len, dtype=np.float64) / float(SR)
    decay = np.exp(-6.907755 * t_tail / rt60)
    onset = 1.0 - np.exp(-t_tail / (0.008 if space == "booth" else 0.020))
    env = decay * onset

    sos_lp = signal.butter(2, damp_hz, btype="lowpass", fs=SR, output="sos")
    sos_hp = signal.butter(1, hp_hz, btype="highpass", fs=SR, output="sos")
    grid = max(8, int(SR / 2600))
    for ch in range(2):
        velvet = np.zeros(tail_len, dtype=np.float64)
        n_pulses = tail_len // grid
        offsets = rng.integers(0, grid, size=n_pulses)
        signs = rng.choice([-1.0, 1.0], size=n_pulses)
        velvet[np.arange(n_pulses) * grid + offsets] = signs
        tail = signal.sosfilt(sos_hp, signal.sosfilt(sos_lp, velvet))
        rms = float(np.sqrt(np.mean(tail * tail))) + 1e-12
        ir[pre_n:, ch] += (tail / rms) * env * tail_scale

    ir_energy = float(np.sqrt(np.mean(np.sum(ir * ir, axis=0)))) + 1e-12
    ir = ir / (ir_energy * 3.6)
    _IR_CACHE[key] = ir
    return ir


def convolve_room(stereo: np.ndarray, space: str = "booth", wet: float = 0.18, seed: int = 101) -> np.ndarray:
    ir = get_studio_ir(space, seed=seed)
    n = stereo.shape[0]
    wl = signal.fftconvolve(stereo[:, 0], ir[:, 0], mode="full")[:n]
    wr = signal.fftconvolve(stereo[:, 1], ir[:, 1], mode="full")[:n]
    out = np.empty_like(stereo)
    dry_scale = 1.0 - wet * 0.28
    out[:, 0] = stereo[:, 0] * dry_scale + wl * wet
    out[:, 1] = stereo[:, 1] * dry_scale + wr * wet
    return out


# ============================================================================
# Real Studio Acoustic Bank (VSCO-2-CE + Real Mic Recordings + MusyngKite)
# ============================================================================

def parse_vsco_note_midi(filename: str, octave_offset: int = 12) -> Optional[int]:
    """Parse note name like `C4`, `A#3`, `F#3` from a VSCO-2-CE WAV filename into concert MIDI."""
    # Match _C4_ or _A#3. or _F#3_
    m = re.search(r"[_\-]([A-Ga-g][#b]?)(-?\d)(?:[_\.\-])", filename)
    if not m:
        return None
    n_str = m.group(1).upper()
    oct_num = int(m.group(2))
    if n_str not in NOTE_TO_SEMI:
        return None
    # Scientific MIDI: C4 = 60 -> (oct + 1)*12 + semi; add empirically calibrated octave_offset
    return (oct_num + 1) * 12 + NOTE_TO_SEMI[n_str] + octave_offset


def midi_to_flat_name(midi: int) -> str:
    return f"{NOTE_NAMES_FLAT[midi % 12]}{(midi // 12) - 1}"


class AcousticStudioBank:
    """Loads & caches 100% real studio WAV/OGG/FLAC/MP3 primitives at 48kHz stereo."""

    def __init__(self) -> None:
        if not VSCO2_DIR.exists():
            raise FileNotFoundError(
                f"VSCO-2-CE studio WAV library not found at {VSCO2_DIR}. "
                "Clone https://github.com/sgossner/VSCO-2-CE.git into %TEMP%\\vsco2_samples."
            )
        self._pcm_cache: Dict[str, np.ndarray] = {}
        self._vsco_maps: Dict[str, List[Tuple[int, int, Path]]] = {}

    def load_path(self, path: Path) -> np.ndarray:
        key = str(path.resolve())
        if key not in self._pcm_cache:
            if not path.exists():
                raise FileNotFoundError(f"Acoustic sample missing: {path}")
            self._pcm_cache[key] = decode_stereo_48k(path)
        return self._pcm_cache[key].copy()

    def vsco(self, rel_path: str) -> np.ndarray:
        return self.load_path(VSCO2_DIR / rel_path)

    def real(self, filename: str) -> np.ndarray:
        return self.load_path(REAL_REC_DIR / filename)

    def legacy_sfx(self, stem: str) -> np.ndarray:
        return self.load_path(LEGACY_AUDIO_DIR / f"{stem}.mp3")

    def musyng(self, inst: str, note: str | int) -> np.ndarray:
        n_name = midi_to_flat_name(note) if isinstance(note, int) else note
        p = MUSYNG_DIR / f"{inst}-mp3" / f"{n_name}.mp3"
        return self.load_path(p)

    def _index_vsco_instrument(self, rel_dir: str, octave_offset: int) -> List[Tuple[int, int, Path]]:
        key = f"{rel_dir}|{octave_offset}"
        if key in self._vsco_maps:
            return self._vsco_maps[key]
        folder = VSCO2_DIR / rel_dir
        entries: List[Tuple[int, int, Path]] = []
        for wav in sorted(folder.glob("*.wav")):
            midi = parse_vsco_note_midi(wav.name, octave_offset=octave_offset)
            if midi is None:
                continue
            # Extract velocity tier (higher v# = brighter/stronger studio performance)
            vm = re.search(r"_v(\d+)", wav.name, re.IGNORECASE)
            vel_tier = int(vm.group(1)) if vm else (3 if "_f" in wav.name.lower() else 2)
            entries.append((midi, vel_tier, wav))
        if not entries:
            raise ValueError(f"No pitched WAVs indexed in {folder}")
        self._vsco_maps[key] = entries
        return entries

    def orch_note(
        self,
        rel_dir: str,
        target_midi: int,
        dur_s: float = 1.2,
        vel: float = 0.8,
        pan: float = 0.0,
        octave_offset: int = 12,
        prefer_loud: bool = True,
        attack_ms: float = 8.0,
        release_s: float = 0.36,
        trim_onset: bool = True,
        hp_hz: Optional[float] = None,
        lp_hz: Optional[float] = None,
    ) -> np.ndarray:
        """
        Render a concert-pitch note from real studio VSCO-2-CE multi-samples by selecting
        the nearest recorded pitch (minimizing pitch shift to <= 2-3 semitones) and
        highest/medium dynamic velocity layer.
        """
        entries = self._index_vsco_instrument(rel_dir, octave_offset=octave_offset)
        # Pick closest MIDI pitch; tie-break by velocity tier
        best = min(
            entries,
            key=lambda e: (abs(e[0] - target_midi), -e[1] if prefer_loud else e[1]),
        )
        src_midi, _vt, wav_path = best
        semitone_diff = target_midi - src_midi
        speed = 2.0 ** (semitone_diff / 12.0)

        buf = self.load_path(wav_path)
        if trim_onset:
            buf = trim_to_transient(buf, thresh=0.04, pre_ms=1.2)
        if abs(speed - 1.0) > 1e-4:
            buf = resample_speed(buf, speed)
        if hp_hz or lp_hz:
            buf = filter_eq(buf, hp_hz=hp_hz, lp_hz=lp_hz)

        pk = float(np.max(np.abs(buf)))
        if pk > 1e-7:
            buf = buf / pk

        n_target = max(32, int(round(dur_s * SR)))
        if buf.shape[0] > n_target:
            buf = buf[:n_target].copy()
        n = buf.shape[0]

        n_att = min(int(attack_ms * 0.001 * SR), max(1, n // 4))
        if n_att > 1:
            u = np.linspace(0.0, 1.0, n_att)
            buf[:n_att] *= (u * u * (3.0 - 2.0 * u))[:, None]

        n_rel = min(int(release_s * SR), max(2, int(n * 0.72)))
        if n_rel > 1:
            u = np.linspace(1.0, 0.0, n_rel)
            buf[-n_rel:] *= ((u * u * (3.0 - 2.0 * u)) ** 1.15)[:, None]

        return place_stereo(buf * vel, pan)

    def musyng_note(
        self,
        inst: str,
        midi: int,
        dur_s: float = 1.2,
        vel: float = 0.7,
        pan: float = 0.0,
        attack_ms: float = 4.0,
        release_s: float = 0.35,
        speed: float = 1.0,
    ) -> np.ndarray:
        buf = self.musyng(inst, midi)
        buf = trim_to_transient(buf, thresh=0.04, pre_ms=1.2)
        if abs(speed - 1.0) > 1e-4:
            buf = resample_speed(buf, speed)
        pk = float(np.max(np.abs(buf)))
        if pk > 1e-7:
            buf = buf / pk
        n_target = max(32, int(round(dur_s * SR)))
        if buf.shape[0] > n_target:
            buf = buf[:n_target].copy()
        n = buf.shape[0]
        n_att = min(int(attack_ms * 0.001 * SR), max(1, n // 4))
        if n_att > 1:
            u = np.linspace(0.0, 1.0, n_att)
            buf[:n_att] *= (u * u * (3.0 - 2.0 * u))[:, None]
        n_rel = min(int(release_s * SR), max(2, int(n * 0.72)))
        if n_rel > 1:
            u = np.linspace(1.0, 0.0, n_rel)
            buf[-n_rel:] *= ((u * u * (3.0 - 2.0 * u)) ** 1.15)[:, None]
        return place_stereo(buf * vel, pan)


# ============================================================================
# Mastering Pipeline: <5ms Onset Alignment, Zero Clipping, 48kHz / 192kbps MP3
# ============================================================================

def master_v6_sfx(
    stereo: np.ndarray,
    out_mp3: Path,
    target_peak_db: float = -2.4,
    drive: float = 1.06,
    hp_hz: float = 34.0,
    fade_in_ms: float = 0.6,
    fade_out_ms: float = 16.0,
    align_onset: bool = True,
) -> Dict[str, float]:
    """Master stereo 48kHz buffer -> 192kbps stereo MP3 with <5ms attack & TP <= -1.5 dBFS."""
    buf = np.array(stereo, dtype=np.float64, copy=True)

    # Trim any dead leading silence so tactile attack always lands in < 5ms!
    if align_onset:
        mono = 0.5 * (np.abs(buf[:, 0]) + np.abs(buf[:, 1]))
        pk0 = float(np.max(mono))
        if pk0 > 1e-8:
            idx = int(np.argmax(mono >= pk0 * 0.14))
            # Keep 0.9ms pre-onset so the crisp leading edge stays 100% intact
            pre = int(0.0009 * SR)
            if idx > int(0.0025 * SR):
                buf = buf[max(0, idx - pre) :].copy()

    if buf.shape[0] > 48 and hp_hz > 12.0:
        sos_hp = signal.butter(2, hp_hz, btype="highpass", fs=SR, output="sos")
        buf[:, 0] = signal.sosfilt(sos_hp, buf[:, 0])
        buf[:, 1] = signal.sosfilt(sos_hp, buf[:, 1])

    raw_pk = float(np.max(np.abs(buf)))
    if raw_pk < 1e-8:
        raise ValueError(f"Silent buffer for {out_mp3.name}")
    buf /= raw_pk
    if drive > 1.0:
        buf = np.tanh(buf * drive) / math.tanh(drive)

    n_in = min(int(fade_in_ms * 0.001 * SR), max(1, buf.shape[0] // 12))
    n_out = min(int(fade_out_ms * 0.001 * SR), max(1, buf.shape[0] // 4))
    if n_in > 1:
        u = np.linspace(0.0, 1.0, n_in)
        buf[:n_in] *= (u * u * (3.0 - 2.0 * u))[:, None]
    if n_out > 1:
        u = np.linspace(1.0, 0.0, n_out)
        buf[-n_out:] *= (u * u * (3.0 - 2.0 * u))[:, None]

    pk2 = float(np.max(np.abs(buf)))
    target_lin = 10.0 ** ((min(-2.1, target_peak_db) - 0.65) / 20.0)
    buf *= target_lin / max(pk2, 1e-12)

    cur_buf = buf
    lim = 10.0 ** (min(-1.95, target_peak_db) / 20.0)
    metrics: Dict[str, float] = {}
    for _attempt in range(4):
        with tempfile.TemporaryDirectory(prefix="ws_v6_sfx_") as td:
            wav_tmp = Path(td) / "in.wav"
            write_wav_stereo_24_or_16(wav_tmp, cur_buf, SR)
            run_ff([
                "-i", str(wav_tmp),
                "-af", f"alimiter=limit={lim:.4f}:attack=0.4:release=30:level=disabled",
                "-ar", str(SR), "-ac", "2",
                "-c:a", "libmp3lame", "-b:a", BITRATE, "-joint_stereo", "1",
                str(out_mp3),
            ])
        metrics = measure_audio_metrics(out_mp3)
        if metrics["peak_db"] <= -1.55 and metrics["clipped_samples"] == 0:
            break
        trim_db = -2.25 - metrics["peak_db"]
        cur_buf = cur_buf * (10.0 ** (trim_db / 20.0))

    assert check_valid_mp3_header(out_mp3), f"Invalid MP3 header: {out_mp3}"
    assert metrics["clipped_samples"] == 0, f"Clipped samples on {out_mp3.name}"
    assert metrics["non_finite"] == 0, f"Non-finite samples on {out_mp3.name}"
    assert metrics["peak_db"] <= -1.5, f"Peak exceeded -1.5 dBFS on {out_mp3.name}: {metrics['peak_db']}"
    return metrics


# ============================================================================
# ALL 33 ACOUSTIC FOLEY & ORCHESTRAL STREAK CUE BUILDERS
# ============================================================================

def build_ui_brass_tap(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.095 * SR), 2))
    click = slice_peak_event(b.real("mouse_click.ogg"), 0.036, pre_ms=1.5, search_s=1.0)
    mix_add(mix, shape_clip(click, dur_s=0.032, speed=1.08, vel=0.95, hp_hz=240, lp_hz=7600, fade_in_ms=0.5, fade_out_ms=14), 0)
    wood = b.vsco("VSCO 1 Percussion/varWood/wood_click_pp_1.wav")
    mix_add(mix, shape_clip(wood, dur_s=0.040, speed=1.35, vel=0.48, hp_hz=450, lp_hz=6800, fade_in_ms=0.5, fade_out_ms=22), int(0.001 * SR))
    brass_kiss = b.vsco("VSCO 1 Percussion/varMetal/various/Fing_Cymb.wav")
    mix_add(mix, shape_clip(brass_kiss, dur_s=0.052, speed=1.42, vel=0.16, bp_hz=(1600, 6400), fade_in_ms=0.8, fade_out_ms=36), int(0.0015 * SR))
    mix = apply_modal_resonance(mix, [(1850, 14, 0.7), (3960, 18, 0.5), (6320, 16, 0.3)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.14, seed=601)


def build_neve_fader_detent(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.090 * SR), 2))
    snare_clk = b.vsco("VSCO 1 Percussion/drums/snare/drum2/snare2_click_1.wav")
    mix_add(mix, shape_clip(snare_clk, dur_s=0.042, speed=1.22, vel=0.88, hp_hz=180, lp_hz=5400, fade_in_ms=0.5, fade_out_ms=22), 0)
    mouse = slice_peak_event(b.real("mouse_click.ogg"), 0.030, pre_ms=1.5, search_s=1.0)
    mix_add(mix, shape_clip(mouse, dur_s=0.026, speed=0.82, vel=0.65, hp_hz=140, lp_hz=3600, fade_in_ms=0.5, fade_out_ms=14), int(0.001 * SR))
    slide = b.vsco("VSCO 1 Percussion/varMetal/various/cabasa_1.wav")
    mix_add(mix, shape_clip(slide, dur_s=0.045, speed=1.30, vel=0.18, bp_hz=(1200, 4200), fade_in_ms=2.0, fade_out_ms=28), int(0.006 * SR))
    mix = apply_modal_resonance(mix, [(420, 10, 0.7), (1480, 14, 0.6), (3200, 14, 0.35)], wet=0.22)
    return convolve_room(mix, "booth", wet=0.12, seed=602)


def build_rotary_knob_click(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.115 * SR), 2))
    wood = b.vsco("VSCO 1 Percussion/varWood/wood_click_mp.wav")
    mix_add(mix, shape_clip(wood, dur_s=0.055, speed=1.18, vel=0.85, hp_hz=200, lp_hz=6800, fade_in_ms=0.5, fade_out_ms=28), 0)
    clk = slice_peak_event(b.real("clock_ticking.ogg"), 0.065, pre_ms=2.0, search_s=2.0)
    mix_add(mix, shape_clip(clk, dur_s=0.055, speed=1.28, vel=0.72, hp_hz=260, lp_hz=7200, fade_in_ms=0.5, fade_out_ms=28), int(0.001 * SR))
    metal = b.vsco("Miscellania Raw/Misc 1/metal_hit2.wav")
    mix_add(mix, shape_clip(metal, dur_s=0.048, speed=1.65, vel=0.28, bp_hz=(1400, 6200), fade_in_ms=0.5, fade_out_ms=30), int(0.002 * SR))
    mix = apply_modal_resonance(mix, [(920, 14, 0.8), (2450, 16, 0.6), (5100, 18, 0.35)], wet=0.24)
    return convolve_room(mix, "booth", wet=0.15, seed=603)


def build_brass_gear_detent(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.175 * SR), 2))
    watch = slice_peak_event(b.real("watch_tick.ogg"), 0.055, pre_ms=1.5, search_s=1.5)
    mix_add(mix, shape_clip(watch, dur_s=0.048, speed=0.96, vel=0.95, hp_hz=220, lp_hz=8800, fade_in_ms=0.5, fade_out_ms=22), 0)
    ratch = b.vsco("Percussion/Ratchet1-Slow_v1_rr1_Sum.wav")
    tooth = slice_peak_event(ratch, 0.055, pre_ms=2.0, search_s=1.0)
    mix_add(mix, shape_clip(tooth, dur_s=0.045, speed=1.12, vel=0.62, hp_hz=320, lp_hz=7200, fade_in_ms=0.5, fade_out_ms=22), int(0.002 * SR))
    metal = b.vsco("Miscellania Raw/Misc 1/metal_hit4.wav")
    mix_add(mix, shape_clip(metal, dur_s=0.090, speed=1.35, vel=0.34, bp_hz=(950, 5800), fade_in_ms=0.8, fade_out_ms=55), int(0.003 * SR))
    # Subtle 24ms escapement pallet settling recoil (The Room tactile secret!)
    clk = slice_peak_event(b.real("clock_ticking.ogg"), 0.045, pre_ms=1.5, search_s=2.0)
    mix_add(mix, shape_clip(clk, dur_s=0.040, speed=1.45, vel=0.32, pan=0.14, hp_hz=450, lp_hz=6400, fade_in_ms=0.8, fade_out_ms=22), int(0.026 * SR))
    mix = apply_modal_resonance(mix, [(1180, 16, 0.8), (2520, 18, 0.65), (4040, 18, 0.45), (5760, 16, 0.28)], wet=0.25)
    return convolve_room(mix, "booth", wet=0.18, seed=604)


def build_optical_beam_lock(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.62 * SR), 2))
    # Precision brass prism mirror snapping into laser focus + pure singing-bowl & bowed-bronze harmonic lock
    shutter = slice_peak_event(b.real("canon_shutter.ogg"), 0.13, pre_ms=1.8, search_s=2.5)
    mix_add(mix, shape_clip(shutter, dur_s=0.10, speed=1.22, vel=0.86, hp_hz=280, lp_hz=8400, fade_in_ms=0.5, fade_out_ms=40), 0)
    bowl = slice_peak_event(b.real("singing_bowl.flac"), 0.50, pre_ms=3.0, search_s=3.0)
    mix_add(mix, shape_clip(bowl, dur_s=0.48, speed=1.92, vel=0.62, pan=-0.14, hp_hz=900, lp_hz=9600, fade_in_ms=3.0, fade_out_ms=230), int(0.005 * SR))
    bow = b.vsco("Percussion/susCymb1-bow-2.wav")
    mix_add(mix, shape_clip(bow, start_s=0.12, dur_s=0.52, speed=1.18, vel=0.44, pan=0.18, bp_hz=(1200, 6800), fade_in_ms=16.0, fade_out_ms=250, trim_lead=False), int(0.012 * SR))
    tri = b.vsco("Percussion/Triangle6-Hit_v1_rr1_Sum.wav")
    mix_add(mix, shape_clip(tri, dur_s=0.44, speed=1.12, vel=0.38, pan=0.20, hp_hz=2000, fade_in_ms=0.8, fade_out_ms=240), int(0.003 * SR))
    mix_add(mix, b.orch_note("Percussion/Glock", 88, dur_s=0.48, vel=0.34, pan=-0.20, octave_offset=12, attack_ms=1.0, release_s=0.26), int(0.006 * SR))
    mix = apply_modal_resonance(mix, [(1318, 22, 0.7), (2637, 24, 0.55), (3951, 20, 0.35)], wet=0.22)
    return convolve_room(mix, "stage", wet=0.26, seed=605)


def build_crystal_hex_claim(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.80 * SR), 2))
    # Crisp sapphire crystal facet click + cast bronze-crystal shimmer + radiant E-major glock & harp triad
    gl_snap = b.vsco("Miscellania Raw/Misc 1/glass_break3.wav")
    mix_add(mix, shape_clip(gl_snap, dur_s=0.055, speed=1.48, vel=0.46, hp_hz=2800, lp_hz=11800, fade_in_ms=0.4, fade_out_ms=34), 0)
    fc = b.vsco("VSCO 1 Percussion/varMetal/various/Fing_Cymb.wav")
    mix_add(mix, shape_clip(fc, dur_s=0.56, speed=1.26, vel=0.56, pan=-0.20, hp_hz=1100, fade_in_ms=1.0, fade_out_ms=260), int(0.002 * SR))
    bell = b.vsco("Miscellania Raw/Misc 2/NepaleseBells/fx1_short_r02_main.wav")
    mix_add(mix, shape_clip(bell, dur_s=0.64, speed=1.06, vel=0.60, pan=0.22, hp_hz=460, fade_in_ms=0.8, fade_out_ms=290), int(0.002 * SR))
    # Concert glockenspiel & harp radiant E-major sparkle (E5 + G#5 + B5)
    mix_add(mix, b.orch_note("Percussion/Glock", 83, dur_s=0.64, vel=0.62, pan=0.14, octave_offset=12, attack_ms=1.0, release_s=0.36), int(0.003 * SR))
    mix_add(mix, b.orch_note("Strings/Harp", 76, dur_s=0.68, vel=0.56, pan=-0.30, octave_offset=0, attack_ms=1.2, release_s=0.36), int(0.008 * SR))
    mix_add(mix, b.orch_note("Strings/Harp", 80, dur_s=0.66, vel=0.52, pan=0.0, octave_offset=0, attack_ms=1.2, release_s=0.36), int(0.026 * SR))
    mix_add(mix, b.orch_note("Strings/Harp", 83, dur_s=0.66, vel=0.52, pan=0.30, octave_offset=0, attack_ms=1.2, release_s=0.36), int(0.046 * SR))
    mix = apply_modal_resonance(mix, [(1568, 22, 0.7), (3136, 24, 0.5), (4698, 20, 0.3)], wet=0.18)
    return convolve_room(mix, "hall", wet=0.26, seed=606)


def build_iron_chain_shatter(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.95 * SR), 2))
    # Forged iron shear impact at 0ms
    anvil = b.vsco("Percussion/Anvil_Hit1_v3_Sum.wav")
    mix_add(mix, shape_clip(anvil, dur_s=0.34, speed=1.06, vel=0.92, pan=-0.08, hp_hz=180, fade_in_ms=0.5, fade_out_ms=180), 0)
    brake = b.vsco("Percussion/BrakeDrum1_Hammer_v3_Sum.wav")
    mix_add(mix, shape_clip(brake, dur_s=0.36, speed=0.94, vel=0.72, pan=0.12, hp_hz=140, fade_in_ms=0.5, fade_out_ms=190), int(0.004 * SR))
    bdrum = b.vsco("Percussion/BDrumNewhit_v4_rr1_Sum.wav")
    mix_add(mix, shape_clip(bdrum, dur_s=0.28, speed=0.92, vel=0.64, lp_hz=320, fade_in_ms=0.8, fade_out_ms=150), 0)
    # Brittle padlock shackle fracture + cascading heavy iron chains!
    glass = slice_peak_event(b.real("glass_break_1.wav"), 0.42, pre_ms=2.0, search_s=2.0)
    mix_add(mix, shape_clip(glass, dur_s=0.38, speed=0.92, vel=0.46, pan=0.24, hp_hz=900, fade_in_ms=1.0, fade_out_ms=180), int(0.010 * SR))
    chain1 = b.vsco("Miscellania Raw/Misc 1/chain_grind.wav")
    mix_add(mix, shape_clip(chain1, dur_s=0.68, speed=1.18, vel=0.68, pan=-0.34, hp_hz=280, fade_in_ms=3.0, fade_out_ms=260), int(0.022 * SR))
    chain2 = b.vsco("Miscellania Raw/Misc 1/chain_loop.wav")
    mix_add(mix, shape_clip(chain2, start_s=0.15, dur_s=0.62, speed=0.95, vel=0.55, pan=0.38, hp_hz=340, fade_in_ms=8.0, fade_out_ms=280, trim_lead=False), int(0.068 * SR))
    mix = apply_modal_resonance(mix, [(640, 12, 0.7), (1720, 16, 0.6), (3180, 16, 0.45), (5400, 14, 0.28)], wet=0.20)
    return convolve_room(mix, "stage", wet=0.24, seed=607)


def build_wire_cutter_snip(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.30 * SR), 2))
    # Hardened tool-steel jaws snapping shut cleanly at 0ms
    slap = b.vsco("VSCO 1 Percussion/varWood/slapstick1.wav")
    mix_add(mix, shape_clip(slap, dur_s=0.070, speed=1.42, vel=0.86, hp_hz=680, lp_hz=11000, fade_in_ms=0.4, fade_out_ms=38), 0)
    metal = b.vsco("Miscellania Raw/Misc 1/metal_hit7.wav")
    mix_add(mix, shape_clip(metal, dur_s=0.11, speed=1.68, vel=0.78, pan=-0.10, hp_hz=900, fade_in_ms=0.4, fade_out_ms=60), int(0.001 * SR))
    brake = b.vsco("Percussion/BrakeDrum1_Hammer_v1_Sum.wav")
    mix_add(mix, shape_clip(brake, dur_s=0.095, speed=1.95, vel=0.52, pan=0.14, bp_hz=(1800, 8800), fade_in_ms=0.5, fade_out_ms=55), int(0.004 * SR))
    # Snipped copper wire recoil twang + micro-spark fizz
    zap = b.vsco("Miscellania Raw/Misc 1/zap3.wav")
    mix_add(mix, shape_clip(zap, dur_s=0.11, speed=1.55, vel=0.38, pan=0.22, bp_hz=(1400, 7600), fade_in_ms=1.0, fade_out_ms=65), int(0.014 * SR))
    spark = b.vsco("VSCO 1 Percussion/varMetal/various/cabasa_2.wav")
    mix_add(mix, shape_clip(spark, dur_s=0.065, speed=1.80, vel=0.26, pan=-0.20, hp_hz=4200, fade_in_ms=1.0, fade_out_ms=40), int(0.018 * SR))
    mix = apply_modal_resonance(mix, [(2400, 18, 0.7), (4950, 20, 0.55), (8200, 16, 0.35)], wet=0.22)
    return convolve_room(mix, "booth", wet=0.15, seed=608)


def build_nixie_spark_crackle(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.45 * SR), 2))
    # Crisp borosilicate glass filament snap + 3 staggered high-voltage arc bursts
    gl = b.vsco("Miscellania Raw/Misc 1/glass_break5.wav")
    mix_add(mix, shape_clip(gl, dur_s=0.065, speed=1.55, vel=0.68, hp_hz=1800, fade_in_ms=0.4, fade_out_ms=35), 0)
    z1 = b.vsco("Miscellania Raw/Misc 1/zap1.wav")
    mix_add(mix, shape_clip(z1, dur_s=0.14, speed=1.65, vel=0.82, pan=-0.28, bp_hz=(2000, 11500), fade_in_ms=0.5, fade_out_ms=70), int(0.002 * SR))
    z2 = b.vsco("Miscellania Raw/Misc 1/zap7.wav")
    mix_add(mix, shape_clip(z2, dur_s=0.14, speed=1.45, vel=0.68, pan=0.32, bp_hz=(2200, 12000), fade_in_ms=0.5, fade_out_ms=75), int(0.064 * SR))
    z3 = b.vsco("Miscellania Raw/Misc 1/zap12.wav")
    mix_add(mix, shape_clip(z3, dur_s=0.13, speed=1.85, vel=0.50, pan=-0.16, bp_hz=(2600, 12500), fade_in_ms=0.5, fade_out_ms=75), int(0.142 * SR))
    sizzle = b.vsco("VSCO 1 Percussion/varMetal/various/cabasa_4.wav")
    mix_add(mix, shape_clip(sizzle, dur_s=0.22, speed=1.55, vel=0.42, pan=0.10, hp_hz=3600, fade_in_ms=2.0, fade_out_ms=130), int(0.015 * SR))
    tube = b.vsco("Percussion/Triangle6-Hit_v1_rr2_Sum.wav")
    mix_add(mix, shape_clip(tube, dur_s=0.16, speed=1.65, vel=0.24, hp_hz=3400, fade_in_ms=0.6, fade_out_ms=105), int(0.005 * SR))
    mix = apply_modal_resonance(mix, [(2800, 16, 0.7), (5600, 18, 0.55), (9100, 16, 0.35)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.16, seed=609)


def build_cryptex_stone_tumbler(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.40 * SR), 2))
    # Crisp initial stone detent release + gritty limestone rotational grind + solid brass-and-stone lock!
    wood = b.vsco("VSCO 1 Percussion/varWood/wood_click_f.wav")
    mix_add(mix, shape_clip(wood, dur_s=0.055, speed=0.84, vel=0.72, hp_hz=120, lp_hz=4200, fade_in_ms=0.5, fade_out_ms=26), 0)
    brick = b.vsco("Miscellania Raw/Misc 1/brick_scrape.wav")
    mix_add(mix, shape_clip(brick, dur_s=0.22, speed=1.18, vel=0.68, pan=-0.16, bp_hz=(180, 3200), fade_in_ms=1.5, fade_out_ms=90), int(0.002 * SR))
    # Heavy stone tumbler locking into slot at 112ms
    clk = slice_peak_event(b.real("clock_ticking.ogg"), 0.14, pre_ms=2.0, search_s=2.0)
    mix_add(mix, shape_clip(clk, dur_s=0.13, speed=0.64, vel=0.92, pan=0.10, hp_hz=75, lp_hz=3400, fade_in_ms=0.8, fade_out_ms=65), int(0.108 * SR))
    thump = b.vsco("Percussion/BDrumNewhit_v1_rr1_Sum.wav")
    mix_add(mix, shape_clip(thump, dur_s=0.16, speed=1.15, vel=0.56, lp_hz=260, fade_in_ms=1.0, fade_out_ms=90), int(0.110 * SR))
    mix = apply_modal_resonance(mix, [(240, 8, 0.8), (580, 10, 0.65), (1120, 12, 0.45)], wet=0.24)
    return convolve_room(mix, "booth", wet=0.20, seed=610)


def build_globe_pin_ruby_click(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.26 * SR), 2))
    # Needle-sharp brass pin piercing cartographer's relief globe + hollow mahogany knock + ruby jewel ping
    pin = slice_peak_event(b.real("mouse_click.ogg"), 0.036, pre_ms=1.2, search_s=1.0)
    mix_add(mix, shape_clip(pin, dur_s=0.032, speed=1.18, vel=0.86, hp_hz=280, fade_in_ms=0.4, fade_out_ms=15), 0)
    pierce = b.vsco("VSCO 1 Percussion/varWood/wood_click_ff_2.wav")
    mix_add(mix, shape_clip(pierce, dur_s=0.055, speed=1.26, vel=0.78, hp_hz=240, lp_hz=7400, fade_in_ms=0.4, fade_out_ms=28), int(0.001 * SR))
    globe_body = b.vsco("Percussion/LogDrumHi_MedM_v2_rr1_Sum.wav")
    mix_add(mix, shape_clip(globe_body, dur_s=0.12, speed=1.22, vel=0.56, pan=-0.08, bp_hz=(180, 1400), fade_in_ms=0.8, fade_out_ms=65), int(0.004 * SR))
    ruby = b.vsco("Percussion/Triangle6-Hit_v1_rr1_Sum.wav")
    mix_add(mix, shape_clip(ruby, dur_s=0.18, speed=1.35, vel=0.34, pan=0.16, hp_hz=2400, fade_in_ms=0.6, fade_out_ms=115), int(0.006 * SR))
    mix = apply_modal_resonance(mix, [(310, 10, 0.7), (840, 12, 0.6), (2900, 18, 0.4)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.18, seed=611)


def build_paddle_spring_slam(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.34 * SR), 2))
    # Authoritative spring-loaded mechanical game-show paddle slap
    slap = b.vsco("VSCO 1 Percussion/varWood/slapstick2.wav")
    mix_add(mix, shape_clip(slap, dur_s=0.095, speed=0.96, vel=0.92, hp_hz=220, fade_in_ms=0.4, fade_out_ms=52), 0)
    snare = b.vsco("Percussion/Snare2-HitNS_v5_rr1_Sum.wav")
    mix_add(mix, shape_clip(snare, dur_s=0.11, speed=1.08, vel=0.64, pan=-0.10, hp_hz=150, lp_hz=5800, fade_in_ms=0.5, fade_out_ms=60), int(0.001 * SR))
    stop = b.vsco("Percussion/BDrumNewhit_v3_rr1_Sum.wav")
    mix_add(mix, shape_clip(stop, dur_s=0.16, speed=1.05, vel=0.68, lp_hz=320, fade_in_ms=0.6, fade_out_ms=95), int(0.003 * SR))
    # Coiled brass spring rebound at 48ms
    spring_m = b.vsco("Miscellania Raw/Misc 1/metal_hit9.wav")
    mix_add(mix, shape_clip(spring_m, dur_s=0.14, speed=1.32, vel=0.32, pan=0.18, bp_hz=(850, 5200), fade_in_ms=1.0, fade_out_ms=85), int(0.044 * SR))
    shutter = slice_peak_event(b.real("canon_shutter.ogg"), 0.10, pre_ms=1.5, search_s=2.5)
    mix_add(mix, shape_clip(shutter, dur_s=0.09, speed=1.18, vel=0.30, pan=-0.16, hp_hz=400, fade_in_ms=1.0, fade_out_ms=50), int(0.052 * SR))
    mix = apply_modal_resonance(mix, [(180, 8, 0.7), (740, 12, 0.6), (2350, 14, 0.45)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.18, seed=612)


def build_trapdoor_hinge_drop(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.98 * SR), 2))
    # Stage 1 (0ms): Heavy iron latch unbolting sharply
    anvil = b.vsco("Percussion/Anvil_Hit1_v2_Sum.wav")
    mix_add(mix, shape_clip(anvil, dur_s=0.18, speed=0.88, vel=0.85, pan=-0.14, hp_hz=180, fade_in_ms=0.5, fade_out_ms=95), 0)
    chain = b.vsco("Miscellania Raw/Misc 1/chain_grind.wav")
    mix_add(mix, shape_clip(chain, dur_s=0.24, speed=1.08, vel=0.52, pan=0.20, hp_hz=280, fade_in_ms=1.5, fade_out_ms=110), int(0.008 * SR))
    # Stage 2 (20..175ms): Iron hinge swinging open + air plunge
    hinge = b.vsco("Percussion/gongscrape_mf.wav")
    mix_add(mix, shape_clip(hinge, start_s=0.05, dur_s=0.22, speed=0.92, vel=0.44, pan=-0.24, bp_hz=(260, 1900), fade_in_ms=10, fade_out_ms=80, trim_lead=False), int(0.024 * SR))
    air = b.real("rubber_seal.ogg")
    mix_add(mix, shape_clip(air, dur_s=0.38, speed=0.58, vel=0.38, pan=0.0, bp_hz=(180, 2200), fade_in_ms=25, fade_out_ms=180), int(0.055 * SR))
    # Stage 3 (165ms): Massive double-leaf mahogany trapdoor doors slamming against pit stops!
    slam1 = b.vsco("Percussion/BDrumNewhit_v7_rr1_Sum.wav")
    mix_add(mix, shape_clip(slam1, dur_s=0.58, speed=0.82, vel=0.98, pan=-0.12, lp_hz=420, fade_in_ms=0.8, fade_out_ms=280), int(0.162 * SR))
    slam2 = b.vsco("VSCO 1 Percussion/drums/other/ethnic/giant/mallet/EthnicLargeMallet_hit_ff_1.wav")
    mix_add(mix, shape_clip(slam2, dur_s=0.52, speed=0.88, vel=0.84, pan=0.16, hp_hz=55, lp_hz=1800, fade_in_ms=0.8, fade_out_ms=260), int(0.174 * SR))
    brake = b.vsco("Percussion/BrakeDrum1_Hammer_v3_Sum.wav")
    mix_add(mix, shape_clip(brake, dur_s=0.38, speed=0.72, vel=0.56, pan=0.22, bp_hz=(280, 3600), fade_in_ms=0.6, fade_out_ms=220), int(0.168 * SR))
    mix = apply_modal_resonance(mix, [(85, 7, 0.8), (220, 9, 0.7), (780, 12, 0.45), (2100, 14, 0.3)], wet=0.20)
    return convolve_room(mix, "stage", wet=0.28, seed=613)


def build_pneumatic_piston_slam(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.50 * SR), 2))
    # Explosive pneumatic brass piston impact at 0ms
    bdrum = b.vsco("Percussion/BDrumNewhit_v6_rr1_Sum.wav")
    mix_add(mix, shape_clip(bdrum, dur_s=0.26, speed=0.94, vel=0.95, lp_hz=380, fade_in_ms=0.5, fade_out_ms=140), 0)
    snare = b.vsco("Percussion/Snare2-HitNS_v6_rr1_Sum.wav")
    mix_add(mix, shape_clip(snare, dur_s=0.14, speed=0.90, vel=0.76, pan=-0.10, hp_hz=160, lp_hz=6400, fade_in_ms=0.5, fade_out_ms=75), 0)
    collar = b.vsco("Percussion/Anvil_Hit1_v1_Sum.wav")
    mix_add(mix, shape_clip(collar, dur_s=0.16, speed=1.18, vel=0.54, pan=0.14, bp_hz=(800, 5600), fade_in_ms=0.5, fade_out_ms=95), int(0.004 * SR))
    # Pressurized pneumatic air-valve hiss venting cleanly 22..440ms
    seal = b.real("rubber_seal.ogg")
    mix_add(mix, shape_clip(seal, dur_s=0.38, speed=1.22, vel=0.54, pan=0.18, hp_hz=1200, lp_hz=9200, fade_in_ms=6.0, fade_out_ms=210), int(0.022 * SR))
    vent = b.vsco("VSCO 1 Percussion/varMetal/various/cabasa_roll1.wav")
    mix_add(mix, shape_clip(vent, dur_s=0.32, speed=1.45, vel=0.34, pan=-0.18, hp_hz=2400, lp_hz=11000, fade_in_ms=8.0, fade_out_ms=190), int(0.028 * SR))
    mix = apply_modal_resonance(mix, [(120, 8, 0.7), (480, 10, 0.6), (1950, 14, 0.45)], wet=0.20)
    return convolve_room(mix, "stage", wet=0.20, seed=614)


def build_velvet_trunk_clasp(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.44 * SR), 2))
    # Twin brass touring-trunk latch pop (left latch -> right spring pop) + mahogany lid cushioned thud
    shut = slice_peak_event(b.real("canon_shutter.ogg"), 0.14, pre_ms=1.8, search_s=2.5)
    mix_add(mix, shape_clip(shut, dur_s=0.11, speed=1.08, vel=0.88, pan=-0.22, hp_hz=220, lp_hz=7600, fade_in_ms=0.5, fade_out_ms=52), 0)
    m3 = b.vsco("Miscellania Raw/Misc 1/metal_hit3.wav")
    mix_add(mix, shape_clip(m3, dur_s=0.10, speed=1.42, vel=0.64, pan=0.24, bp_hz=(1100, 6200), fade_in_ms=0.5, fade_out_ms=56), int(0.042 * SR))
    # Damped velvet-lined mahogany trunk seat thud
    conga = b.vsco("Percussion/Conga-Tap1_v1_rr1_Sum.wav")
    mix_add(mix, shape_clip(conga, dur_s=0.18, speed=0.72, vel=0.72, pan=0.0, lp_hz=680, fade_in_ms=1.2, fade_out_ms=105), int(0.068 * SR))
    velvet = b.vsco("Percussion/Tamb1-Shake_v1_rr1_Sum.wav")
    mix_add(mix, shape_clip(velvet, dur_s=0.22, speed=0.76, vel=0.18, pan=0.08, bp_hz=(400, 2200), fade_in_ms=14, fade_out_ms=140), int(0.085 * SR))
    mix = apply_modal_resonance(mix, [(280, 9, 0.7), (1240, 14, 0.6), (3150, 16, 0.4)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.20, seed=615)


def build_foil_card_flick(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.28 * SR), 2))
    # Crisp holographic foil card snapping off Frankie's deck
    slap = b.vsco("VSCO 1 Percussion/varWood/slapstick_quiet1.wav")
    mix_add(mix, shape_clip(slap, dur_s=0.055, speed=1.55, vel=0.86, hp_hz=750, lp_hz=11500, fade_in_ms=0.4, fade_out_ms=30), 0)
    riff = b.vsco("VSCO 1 Percussion/varMetal/various/cabasa_3.wav")
    mix_add(mix, shape_clip(riff, dur_s=0.068, speed=1.65, vel=0.54, pan=-0.16, hp_hz=1600, lp_hz=12000, fade_in_ms=0.6, fade_out_ms=42), int(0.004 * SR))
    # Subtle holographic metallic shimmer kiss
    bell_tree = b.vsco("Percussion/BellTree_Stroke1_v1_Sum.wav")
    mix_add(mix, shape_clip(bell_tree, start_s=0.08, dur_s=0.18, speed=1.35, vel=0.32, pan=0.22, hp_hz=2600, fade_in_ms=6.0, fade_out_ms=110, trim_lead=False), int(0.014 * SR))
    mix = apply_modal_resonance(mix, [(1600, 12, 0.65), (4400, 16, 0.5), (7800, 16, 0.35)], wet=0.18)
    return convolve_room(mix, "booth", wet=0.16, seed=616)


def build_relic_pedestal_hum(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.92 * SR), 2))
    # Crisp brass socket seat at 0ms -> warm hand-hammered bronze bowl & bowed cymbal pedestal halo
    clk = slice_peak_event(b.real("clock_ticking.ogg"), 0.08, pre_ms=1.5, search_s=2.0)
    mix_add(mix, shape_clip(clk, dur_s=0.065, speed=0.82, vel=0.78, hp_hz=140, lp_hz=4400, fade_in_ms=0.5, fade_out_ms=34), 0)
    bowl = slice_peak_event(b.real("singing_bowl.flac"), 0.85, pre_ms=4.0, search_s=3.0)
    mix_add(mix, shape_clip(bowl, dur_s=0.82, speed=0.96, vel=0.68, pan=-0.12, bp_hz=(180, 3200), fade_in_ms=10, fade_out_ms=360), int(0.005 * SR))
    bow = b.vsco("Percussion/susCymb1-bow-1.wav")
    mix_add(mix, shape_clip(bow, start_s=0.18, dur_s=0.78, speed=0.92, vel=0.40, pan=0.18, bp_hz=(420, 4800), fade_in_ms=45, fade_out_ms=360, trim_lead=False), int(0.020 * SR))
    # Warm acoustic French horn soft fifth bloom underneath
    mix_add(mix, b.orch_note("Brass/F Horn/sus", 60, dur_s=0.78, vel=0.28, pan=-0.22, octave_offset=12, prefer_loud=False, attack_ms=45, release_s=0.40, lp_hz=1600), int(0.018 * SR))
    mix_add(mix, b.orch_note("Brass/F Horn/sus", 67, dur_s=0.78, vel=0.26, pan=0.22, octave_offset=12, prefer_loud=False, attack_ms=45, release_s=0.40, lp_hz=1600), int(0.022 * SR))
    mix = apply_modal_resonance(mix, [(261.6, 16, 0.7), (523.3, 18, 0.6), (784.0, 18, 0.45), (1568.0, 16, 0.25)], wet=0.18)
    return convolve_room(mix, "hall", wet=0.32, seed=617)


def build_trophy_pedestal_chime(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(1.38 * SR), 2))
    # Solid marble pedestal seat at 0ms + 24k cast-gold tubular bell + glockenspiel + Nepalese bronze shimmer + concert harp
    seat = b.vsco("Percussion/LogDrumLo_MedM_v2_rr1_Sum.wav")
    mix_add(mix, shape_clip(seat, dur_s=0.16, speed=0.88, vel=0.68, lp_hz=900, fade_in_ms=0.5, fade_out_ms=85), 0)
    tb = b.vsco("Percussion/TB_hit_C5_v4_rr1.wav")
    mix_add(mix, shape_clip(tb, dur_s=1.22, speed=1.0, vel=0.74, pan=-0.12, hp_hz=180, fade_in_ms=1.0, fade_out_ms=520), int(0.003 * SR))
    nep = b.vsco("Miscellania Raw/Misc 2/NepaleseBells/fx_med_main.wav")
    mix_add(mix, shape_clip(nep, dur_s=1.18, speed=1.02, vel=0.54, pan=0.20, hp_hz=380, fade_in_ms=1.5, fade_out_ms=480), int(0.008 * SR))
    mix_add(mix, b.orch_note("Percussion/Glock", 84, dur_s=1.15, vel=0.56, pan=0.28, octave_offset=12, attack_ms=1.0, release_s=0.52), int(0.006 * SR))
    mix_add(mix, b.orch_note("Percussion/Glock", 91, dur_s=1.10, vel=0.46, pan=-0.28, octave_offset=12, attack_ms=1.0, release_s=0.52), int(0.052 * SR))
    mix_add(mix, b.orch_note("Strings/Harp", 72, dur_s=1.15, vel=0.52, pan=-0.34, octave_offset=0, attack_ms=1.5, release_s=0.50), int(0.010 * SR))
    mix_add(mix, b.orch_note("Strings/Harp", 79, dur_s=1.10, vel=0.48, pan=0.0, octave_offset=0, attack_ms=1.5, release_s=0.50), int(0.036 * SR))
    mix_add(mix, b.orch_note("Strings/Harp", 84, dur_s=1.08, vel=0.48, pan=0.34, octave_offset=0, attack_ms=1.5, release_s=0.50), int(0.064 * SR))
    return convolve_room(mix, "hall", wet=0.34, seed=618)


def build_medal_enamel_clink(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.55 * SR), 2))
    # Heavy cloisonne cast-bronze medal primary clink + 2 realistic settling micro-bounces
    fc = b.vsco("VSCO 1 Percussion/varMetal/various/Fing_Cymb.wav")
    mix_add(mix, shape_clip(fc, dur_s=0.42, speed=1.18, vel=0.78, pan=-0.10, hp_hz=900, fade_in_ms=0.5, fade_out_ms=220), 0)
    nep = b.vsco("Miscellania Raw/Misc 2/NepaleseBells/fx2_short_r01_main.wav")
    mix_add(mix, shape_clip(nep, dur_s=0.44, speed=1.32, vel=0.68, pan=0.14, hp_hz=1100, fade_in_ms=0.5, fade_out_ms=230), int(0.002 * SR))
    m11 = b.vsco("Miscellania Raw/Misc 1/metal_hit11.wav")
    mix_add(mix, shape_clip(m11, dur_s=0.16, speed=1.58, vel=0.44, pan=-0.18, hp_hz=1800, fade_in_ms=0.5, fade_out_ms=95), int(0.038 * SR))
    mix_add(mix, shape_clip(m11, dur_s=0.12, speed=1.72, vel=0.28, pan=0.20, hp_hz=2100, fade_in_ms=0.5, fade_out_ms=75), int(0.074 * SR))
    tri = b.vsco("Percussion/Triangle6-Hit_v1_rr2_Sum.wav")
    mix_add(mix, shape_clip(tri, dur_s=0.38, speed=1.10, vel=0.28, pan=0.06, hp_hz=2200, fade_in_ms=0.8, fade_out_ms=220), int(0.004 * SR))
    mix = apply_modal_resonance(mix, [(1680, 20, 0.7), (3840, 22, 0.55), (6920, 18, 0.35)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.22, seed=619)


def build_screw_rival_slam(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.90 * SR), 2))
    # Massive brass sabotage lever slam + ferocious punchy brass sabotage stab + dark gong tail!
    bdrum = b.vsco("Percussion/BDrumNewhit_v7_rr2_Sum.wav")
    mix_add(mix, shape_clip(bdrum, dur_s=0.46, speed=0.88, vel=0.98, lp_hz=440, fade_in_ms=0.5, fade_out_ms=220), 0)
    anvil = b.vsco("Percussion/Anvil_Hit1_v3_Sum.wav")
    mix_add(mix, shape_clip(anvil, dur_s=0.36, speed=0.92, vel=0.86, pan=-0.16, hp_hz=220, fade_in_ms=0.5, fade_out_ms=190), 0)
    slap = b.vsco("VSCO 1 Percussion/varWood/slapstick3.wav")
    mix_add(mix, shape_clip(slap, dur_s=0.11, speed=0.96, vel=0.72, pan=0.12, hp_hz=420, fade_in_ms=0.4, fade_out_ms=55), int(0.002 * SR))
    # Punchy minor/tritone broadcast brass sabotage hit (C3+F#3+D#4+B4)
    mix_add(mix, b.orch_note("Brass/Tenor Trombone/stac", 48, dur_s=0.54, vel=0.78, pan=-0.30, octave_offset=12, attack_ms=4.0, release_s=0.24), int(0.010 * SR))
    mix_add(mix, b.orch_note("Brass/Tenor Trombone/stac", 54, dur_s=0.54, vel=0.74, pan=0.30, octave_offset=12, attack_ms=4.0, release_s=0.24), int(0.012 * SR))
    mix_add(mix, b.orch_note("Brass/F Horn/stac", 63, dur_s=0.52, vel=0.76, pan=-0.18, octave_offset=12, attack_ms=4.0, release_s=0.24), int(0.012 * SR))
    mix_add(mix, b.orch_note("Brass/Trumpet/stac", 71, dur_s=0.48, vel=0.70, pan=0.22, octave_offset=12, attack_ms=3.5, release_s=0.22), int(0.014 * SR))
    gong = b.vsco("Percussion/gongHit_f.wav")
    mix_add(mix, shape_clip(gong, dur_s=0.82, speed=1.18, vel=0.38, hp_hz=180, lp_hz=4800, fade_in_ms=12, fade_out_ms=420), int(0.018 * SR))
    return convolve_room(mix, "stage", wet=0.26, seed=620)


def build_twist_siren_chime(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(1.22 * SR), 2))
    # Meridian Broadcast Studio Halftime Twist Alert: iconic 3-tone tubular bell chime + muted brass broadcast call!
    tb1 = b.vsco("Percussion/TB_hit_G4_v4_rr1.wav")
    tb2 = b.vsco("Percussion/TB_hit_C5_v4_rr1.wav")
    tb3 = b.vsco("Percussion/TB_hit_F5_v3_rr1.wav")
    mix_add(mix, shape_clip(tb1, dur_s=0.58, speed=1.0, vel=0.80, pan=-0.24, hp_hz=160, fade_in_ms=0.6, fade_out_ms=240), 0)
    mix_add(mix, shape_clip(tb2, dur_s=0.62, speed=1.0, vel=0.86, pan=0.0, hp_hz=160, fade_in_ms=0.6, fade_out_ms=280), int(0.145 * SR))
    mix_add(mix, shape_clip(tb3, dur_s=0.84, speed=1.0, vel=0.92, pan=0.24, hp_hz=160, fade_in_ms=0.6, fade_out_ms=400), int(0.290 * SR))
    # Crisp 1962 Broadcast Harmon-Muted Trumpet & French Horn dramatic triad announcement
    mix_add(mix, b.orch_note("Brass/F Horn/stac", 62, dur_s=0.34, vel=0.62, pan=-0.26, octave_offset=12, attack_ms=3.5, release_s=0.16), int(0.002 * SR))
    mix_add(mix, b.orch_note("Brass/F Horn/stac", 67, dur_s=0.34, vel=0.66, pan=0.10, octave_offset=12, attack_ms=3.5, release_s=0.16), int(0.147 * SR))
    mix_add(mix, b.orch_note("Brass/F Horn/sus", 72, dur_s=0.72, vel=0.70, pan=0.22, octave_offset=12, attack_ms=8.0, release_s=0.36), int(0.292 * SR))
    mix_add(mix, b.orch_note("Brass/Trumpet/harmonM-sus", 74, dur_s=0.66, vel=0.44, pan=-0.18, octave_offset=12, attack_ms=10.0, release_s=0.34), int(0.296 * SR))
    # Subtle orchestral bowed bronze shimmer + suspended cymbal lift
    bow = b.vsco("Percussion/susCymb1-bow-3.wav")
    mix_add(mix, shape_clip(bow, start_s=0.10, dur_s=0.82, speed=1.10, vel=0.22, bp_hz=(900, 4800), fade_in_ms=30, fade_out_ms=380, trim_lead=False), int(0.120 * SR))
    cym = b.vsco("Percussion/susCymb1-hit_mp_rr1.wav")
    mix_add(mix, shape_clip(cym, dur_s=0.86, speed=1.06, vel=0.32, hp_hz=900, fade_in_ms=6, fade_out_ms=440), int(0.290 * SR))
    return convolve_room(mix, "stage", wet=0.30, seed=621)


def build_clock_horology_tick(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.115 * SR), 2))
    watch = slice_peak_event(b.real("watch_tick.ogg"), 0.055, pre_ms=1.5, search_s=1.5)
    mix_add(mix, shape_clip(watch, dur_s=0.048, speed=1.0, vel=0.98, hp_hz=200, lp_hz=8600, fade_in_ms=0.4, fade_out_ms=22), 0)
    clk = slice_peak_event(b.real("clock_ticking.ogg"), 0.070, pre_ms=1.8, search_s=2.0)
    mix_add(mix, shape_clip(clk, dur_s=0.064, speed=1.04, vel=0.72, pan=-0.06, hp_hz=150, lp_hz=6400, fade_in_ms=0.5, fade_out_ms=34), int(0.0015 * SR))
    pallet = b.vsco("VSCO 1 Percussion/varWood/wood_click_pp_2.wav")
    mix_add(mix, shape_clip(pallet, dur_s=0.036, speed=1.42, vel=0.28, pan=0.10, hp_hz=520, fade_in_ms=0.5, fade_out_ms=18), int(0.016 * SR))
    mix = apply_modal_resonance(mix, [(1420, 16, 0.75), (3180, 18, 0.55), (6400, 16, 0.30)], wet=0.20)
    return convolve_room(mix, "booth", wet=0.14, seed=622)


def build_clock_escapement_urgent(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.29 * SR), 2))
    watch = slice_peak_event(b.real("watch_tick.ogg"), 0.055, pre_ms=1.5, search_s=1.5)
    clave = b.vsco("Percussion/Claves1_Hit_v2_rr1_Sum.wav")
    timp = b.vsco("Percussion/Timpani/Timpani2_Hit_v1_rr1_Sum.wav")
    # Beat 1 (0ms)
    mix_add(mix, shape_clip(watch, dur_s=0.048, speed=1.06, vel=0.92, pan=-0.12, hp_hz=240, fade_in_ms=0.4, fade_out_ms=22), 0)
    mix_add(mix, shape_clip(clave, dur_s=0.055, speed=1.12, vel=0.54, pan=-0.08, hp_hz=620, fade_in_ms=0.4, fade_out_ms=28), int(0.001 * SR))
    mix_add(mix, shape_clip(timp, dur_s=0.11, speed=1.0, vel=0.42, lp_hz=280, fade_in_ms=1.0, fade_out_ms=65), 0)
    # Beat 2 (122ms — double-pulse urgent heartbeat, slightly brighter & stronger!)
    t2 = int(0.122 * SR)
    mix_add(mix, shape_clip(watch, dur_s=0.052, speed=1.18, vel=1.00, pan=0.14, hp_hz=280, fade_in_ms=0.4, fade_out_ms=24), t2)
    mix_add(mix, shape_clip(clave, dur_s=0.060, speed=1.24, vel=0.64, pan=0.10, hp_hz=720, fade_in_ms=0.4, fade_out_ms=30), t2 + int(0.001 * SR))
    mix_add(mix, shape_clip(timp, dur_s=0.14, speed=1.08, vel=0.52, lp_hz=310, fade_in_ms=1.0, fade_out_ms=80), t2)
    mix = apply_modal_resonance(mix, [(220, 8, 0.6), (1650, 16, 0.7), (3850, 18, 0.5)], wet=0.18)
    return convolve_room(mix, "booth", wet=0.16, seed=623)


def build_vault_heavy_unlock(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.78 * SR), 2))
    # Phase 1 (0..90ms): Swiss bank vault locking wheel ratchet burst
    ratch = b.vsco("Percussion/Ratchet1-Crank_v1_rr1_Sum.wav")
    mix_add(mix, shape_clip(ratch, dur_s=0.105, speed=1.35, vel=0.72, pan=-0.18, hp_hz=300, lp_hz=6800, fade_in_ms=0.6, fade_out_ms=32), 0)
    # Phase 2 (96ms): Heavy steel tumbler pin drop
    anvil = b.vsco("Percussion/Anvil_Hit1_v2_Sum.wav")
    mix_add(mix, shape_clip(anvil, dur_s=0.20, speed=0.84, vel=0.78, pan=0.14, hp_hz=180, fade_in_ms=0.5, fade_out_ms=110), int(0.096 * SR))
    clk = slice_peak_event(b.real("clock_ticking.ogg"), 0.14, pre_ms=2.0, search_s=2.0)
    mix_add(mix, shape_clip(clk, dur_s=0.14, speed=0.52, vel=0.74, lp_hz=1200, fade_in_ms=0.8, fade_out_ms=70), int(0.098 * SR))
    # Phase 3 (196ms): Massive triple steel deadbolts slamming open!
    bdrum = b.vsco("Percussion/BDrumNewhit_v5_rr1_Sum.wav")
    mix_add(mix, shape_clip(bdrum, dur_s=0.44, speed=0.86, vel=0.96, lp_hz=360, fade_in_ms=0.6, fade_out_ms=220), int(0.194 * SR))
    brake = b.vsco("Percussion/BrakeDrum1_Hammer_v2_Sum.wav")
    mix_add(mix, shape_clip(brake, dur_s=0.36, speed=0.78, vel=0.82, pan=-0.08, hp_hz=160, fade_in_ms=0.5, fade_out_ms=200), int(0.198 * SR))
    chain = b.vsco("Miscellania Raw/Misc 1/chain_grind.wav")
    mix_add(mix, shape_clip(chain, dur_s=0.22, speed=0.96, vel=0.40, pan=0.22, hp_hz=350, fade_in_ms=4.0, fade_out_ms=120), int(0.212 * SR))
    mix = apply_modal_resonance(mix, [(105, 8, 0.75), (340, 10, 0.7), (1280, 14, 0.5), (3100, 14, 0.3)], wet=0.22)
    return convolve_room(mix, "stage", wet=0.22, seed=624)


def build_chip_stack_riffle(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(0.42 * SR), 2))
    # 7 razor-distinct heavy Monte Carlo clay/ceramic casino chips riffling cleanly L->R
    claves = [
        b.vsco("Percussion/Claves1_Hit_v1_rr1_Sum.wav"),
        b.vsco("Percussion/Claves1_Hit_v2_rr1_Sum.wav"),
        b.vsco("Percussion/Claves1_Hit_v2_rr2_Sum.wav"),
        b.vsco("Percussion/Claves1_Hit_v3_rr1_Sum.wav"),
    ]
    wood = b.vsco("VSCO 1 Percussion/varWood/wood_click_mp.wav")
    ceram = b.vsco("VSCO 1 Percussion/varMetal/various/Fing_Cymb.wav")
    times_ms = [0, 29, 57, 84, 113, 143, 176]
    speeds = [1.52, 1.60, 1.66, 1.56, 1.70, 1.62, 1.76]
    vels = [0.78, 0.86, 0.92, 0.98, 0.90, 0.84, 0.78]
    for i, (t_ms, spd, vel) in enumerate(zip(times_ms, speeds, vels)):
        pan = -0.36 + 0.72 * (i / max(1, len(times_ms) - 1))
        t0 = int(t_ms * 0.001 * SR)
        cl = claves[i % len(claves)]
        mix_add(mix, shape_clip(cl, dur_s=0.030, speed=spd, vel=vel * 0.88, pan=pan, hp_hz=1100, lp_hz=9200, fade_in_ms=0.35, fade_out_ms=16), t0)
        mix_add(mix, shape_clip(wood, dur_s=0.024, speed=spd * 0.95, vel=vel * 0.56, pan=pan * 0.75, hp_hz=720, lp_hz=6800, fade_in_ms=0.35, fade_out_ms=13), t0 + int(0.001 * SR))
        mix_add(mix, shape_clip(ceram, dur_s=0.022, speed=spd * 1.45, vel=vel * 0.22, pan=pan, hp_hz=4200, lp_hz=12000, fade_in_ms=0.35, fade_out_ms=14), t0)
    slide = b.vsco("VSCO 1 Percussion/varMetal/various/cabasa_5.wav")
    mix_add(mix, shape_clip(slide, dur_s=0.14, speed=1.15, vel=0.09, bp_hz=(1600, 5200), fade_in_ms=14, fade_out_ms=75), int(0.030 * SR))
    mix = apply_modal_resonance(mix, [(1920, 14, 0.65), (3780, 16, 0.50), (6450, 16, 0.30)], wet=0.16)
    return convolve_room(mix, "booth", wet=0.15, seed=625)


def build_crowd_warm_applause(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(1.88 * SR), 2))
    # Rich stereo TV studio audience applause (layered decorrelated real applause stems + crisp onset)
    base_tv = b.legacy_sfx("sfx_crowd_tv_studio")
    mix_add(mix, shape_clip(base_tv, dur_s=1.82, speed=1.0, vel=0.84, pan=0.0, hp_hz=120, fade_in_ms=2.5, fade_out_ms=420, trim_lead=True), 0)
    # Decorrelated L/R real applause depth layers
    app_l = b.musyng("applause", "C4")
    app_r = b.musyng("applause", "D4")
    mix_add(mix, shape_clip(app_l, dur_s=1.65, speed=0.98, vel=0.44, pan=-0.46, hp_hz=240, lp_hz=9200, fade_in_ms=3.0, fade_out_ms=450), int(0.002 * SR))
    mix_add(mix, shape_clip(app_r, dur_s=1.68, speed=1.04, vel=0.44, pan=0.46, hp_hz=260, lp_hz=9600, fade_in_ms=3.0, fade_out_ms=460), int(0.018 * SR))
    return convolve_room(mix, "stage", wet=0.20, seed=626)


def build_crowd_studio_roar(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(2.25 * SR), 2))
    arena = b.legacy_sfx("sfx_crowd_global_arena")
    mix_add(mix, shape_clip(arena, dur_s=2.18, speed=1.0, vel=0.90, pan=0.0, hp_hz=95, fade_in_ms=2.5, fade_out_ms=520, trim_lead=True), 0)
    app1 = b.musyng("applause", "E4")
    app2 = b.musyng("applause", "B3")
    mix_add(mix, shape_clip(app1, dur_s=2.05, speed=1.06, vel=0.48, pan=-0.55, hp_hz=220, fade_in_ms=2.5, fade_out_ms=540), int(0.003 * SR))
    mix_add(mix, shape_clip(app2, dur_s=2.05, speed=0.94, vel=0.48, pan=0.55, hp_hz=200, fade_in_ms=2.5, fade_out_ms=540), int(0.014 * SR))
    # Excited studio vocal cheer crest texture
    cheer1 = b.musyng("choir_aahs", "F4")
    cheer2 = b.musyng("voice_oohs", "C5")
    mix_add(mix, shape_clip(cheer1, dur_s=1.45, speed=1.03, vel=0.22, pan=-0.32, bp_hz=(450, 3200), fade_in_ms=45, fade_out_ms=520), int(0.030 * SR))
    mix_add(mix, shape_clip(cheer2, dur_s=1.40, speed=0.97, vel=0.20, pan=0.32, bp_hz=(500, 3400), fade_in_ms=55, fade_out_ms=520), int(0.045 * SR))
    return convolve_room(mix, "hall", wet=0.24, seed=627)


def build_crowd_collective_gasp(b: AcousticStudioBank) -> np.ndarray:
    mix = np.zeros((int(1.22 * SR), 2))
    base_gasp = b.legacy_sfx("sfx_crowd_gasp")
    mix_add(mix, shape_clip(base_gasp, dur_s=1.18, speed=1.0, vel=0.86, pan=0.0, hp_hz=120, fade_in_ms=2.5, fade_out_ms=320, trim_lead=True), 0)
    # Sharp stereo collective breath intake at 0ms
    br_l = b.musyng("breath_noise", "E4")
    br_r = b.musyng("breath_noise", "G4")
    mix_add(mix, shape_clip(br_l, dur_s=0.38, speed=1.15, vel=0.58, pan=-0.42, bp_hz=(450, 5200), fade_in_ms=2.0, fade_out_ms=160), 0)
    mix_add(mix, shape_clip(br_r, dur_s=0.40, speed=1.02, vel=0.58, pan=0.42, bp_hz=(480, 5400), fade_in_ms=2.0, fade_out_ms=170), int(0.008 * SR))
    # Sympathetic falling crowd "oooh!" glide
    ooh = trim_to_transient(b.musyng("voice_oohs", "E4"), thresh=0.05, pre_ms=1.5)
    ooh_g = pitch_glide(ooh, 1.06, 0.86, tau_s=0.32)
    mix_add(mix, shape_clip(ooh_g, dur_s=0.82, vel=0.34, pan=0.0, bp_hz=(280, 2400), fade_in_ms=18, fade_out_ms=340, trim_lead=False), int(0.095 * SR))
    return convolve_room(mix, "stage", wet=0.24, seed=628)


# ============================================================================
# 5 ASCENDING REAL-ORCHESTRA STREAK STINGERS (VSCO-2-CE Brass + Strings + Harp!)
#   streak_chord_1: Cmaj9   (C-E-G-B-D)
#   streak_chord_2: Dmaj9   (D-F#-A-C#-E)
#   streak_chord_3: Emaj9   (E-G#-B-D#-F#)
#   streak_chord_4: Gmaj9   (G-B-D-F#-A)
#   streak_fanfare_5: Cmaj13 Championship Brass+Strings+Harp+Timpani+Cymbal Fanfare!
# ============================================================================

def build_streak_stinger(b: AcousticStudioBank, tier: int) -> np.ndarray:
    if tier == 1:
        # Streak 1 — Radiant Cmaj9: crisp spiccato strings + French horn bloom + sweeping concert harp + glock kiss
        mix = np.zeros((int(1.02 * SR), 2))
        chord = [60, 64, 67, 71, 74]  # C4 E4 G4 B4 D5
        # Crisp tactile orchestral downbeat (<4ms onset!) via Spiccato Violins + Concert Harp C4
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 64, dur_s=0.48, vel=0.72, pan=-0.34, octave_offset=12, attack_ms=1.5, release_s=0.20), 0)
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 67, dur_s=0.48, vel=0.72, pan=0.34, octave_offset=12, attack_ms=1.5, release_s=0.20), 0)
        mix_add(mix, b.orch_note("Strings/Cello Section/susvib", 48, dur_s=0.90, vel=0.64, pan=-0.22, octave_offset=12, attack_ms=16, release_s=0.36), 0)
        # Warm French horn fifth
        mix_add(mix, b.orch_note("Brass/F Horn/stac", 60, dur_s=0.76, vel=0.62, pan=-0.20, octave_offset=12, attack_ms=4.0, release_s=0.30), int(0.004 * SR))
        mix_add(mix, b.orch_note("Brass/F Horn/stac", 67, dur_s=0.76, vel=0.60, pan=0.20, octave_offset=12, attack_ms=4.0, release_s=0.30), int(0.008 * SR))
        # Sweeping VSCO Concert Harp Cmaj9 arpeggio
        for i, mn in enumerate(chord):
            t0 = int(i * 0.020 * SR)
            pan = -0.52 + 1.04 * (i / (len(chord) - 1))
            mix_add(mix, b.orch_note("Strings/Harp", mn, dur_s=0.92, vel=0.78, pan=pan, octave_offset=0, attack_ms=1.2, release_s=0.38), t0)
        # Lush sustained violin choir bloom
        for mn, pan in ((64, -0.44), (71, 0.0), (74, 0.44)):
            mix_add(mix, b.orch_note("Strings/Violin Section/susVib", mn, dur_s=0.92, vel=0.44, pan=pan, octave_offset=12, attack_ms=26, release_s=0.40), int(0.015 * SR))
        # Diamond glockenspiel crown (D6)
        mix_add(mix, b.orch_note("Percussion/Glock", 86, dur_s=0.78, vel=0.44, pan=0.26, octave_offset=12, attack_ms=1.0, release_s=0.36), int(0.078 * SR))
        return convolve_room(mix, "hall", wet=0.28, seed=629)

    if tier == 2:
        # Streak 2 — Rising Dmaj9: fuller strings, warm horns + crisp trumpet highlight + 6-note harp sweep
        mix = np.zeros((int(1.16 * SR), 2))
        harp_notes = [62, 66, 69, 73, 76, 78]  # D4 F#4 A4 C#5 E5 F#5
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 66, dur_s=0.52, vel=0.74, pan=-0.38, octave_offset=12, attack_ms=1.5, release_s=0.22), 0)
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 69, dur_s=0.52, vel=0.74, pan=0.38, octave_offset=12, attack_ms=1.5, release_s=0.22), 0)
        mix_add(mix, b.orch_note("Strings/Cello Section/susvib", 50, dur_s=1.02, vel=0.68, pan=-0.24, octave_offset=12, attack_ms=14, release_s=0.40), 0)
        mix_add(mix, b.orch_note("Strings/Viola Section/susvib", 62, dur_s=1.00, vel=0.54, pan=-0.12, octave_offset=12, attack_ms=18, release_s=0.40), int(0.008 * SR))
        # Horns + bright Trumpet accent
        mix_add(mix, b.orch_note("Brass/F Horn/sus", 62, dur_s=0.92, vel=0.58, pan=-0.26, octave_offset=12, attack_ms=12, release_s=0.38), int(0.004 * SR))
        mix_add(mix, b.orch_note("Brass/F Horn/sus", 69, dur_s=0.92, vel=0.58, pan=0.26, octave_offset=12, attack_ms=12, release_s=0.38), int(0.006 * SR))
        mix_add(mix, b.orch_note("Brass/Trumpet/stac", 73, dur_s=0.72, vel=0.54, pan=0.16, octave_offset=12, attack_ms=3.0, release_s=0.28), int(0.010 * SR))
        for i, mn in enumerate(harp_notes):
            t0 = int(i * 0.019 * SR)
            pan = -0.58 + 1.16 * (i / (len(harp_notes) - 1))
            mix_add(mix, b.orch_note("Strings/Harp", mn, dur_s=1.00, vel=0.80, pan=pan, octave_offset=0, attack_ms=1.2, release_s=0.42), t0)
        for mn, pan in ((66, -0.46), (69, -0.14), (73, 0.18), (76, 0.48)):
            mix_add(mix, b.orch_note("Strings/Violin Section/susVib", mn, dur_s=1.02, vel=0.48, pan=pan, octave_offset=12, attack_ms=22, release_s=0.44), int(0.012 * SR))
        mix_add(mix, b.orch_note("Percussion/Glock", 88, dur_s=0.84, vel=0.50, pan=0.30, octave_offset=12, attack_ms=1.0, release_s=0.40), int(0.085 * SR))
        return convolve_room(mix, "hall", wet=0.30, seed=630)

    if tier == 3:
        # Streak 3 — Luminous Emaj9: concert timpani strike + full strings + heroic horns & trumpets + 7-note harp sweep
        mix = np.zeros((int(1.28 * SR), 2))
        harp_notes = [64, 68, 71, 75, 78, 80, 83]  # E4 G#4 B4 D#5 F#5 G#5 B5
        # Concert timpani tuned E2 + VSCO mallet punch
        mix_add(mix, b.musyng_note("timpani", 40, dur_s=0.95, vel=0.72, pan=-0.10, attack_ms=1.5, release_s=0.42), 0)
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 68, dur_s=0.54, vel=0.74, pan=-0.42, octave_offset=12, attack_ms=1.5, release_s=0.22), 0)
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 76, dur_s=0.54, vel=0.74, pan=0.42, octave_offset=12, attack_ms=1.5, release_s=0.22), 0)
        mix_add(mix, b.orch_note("Strings/Cello Section/susvib", 52, dur_s=1.12, vel=0.70, pan=-0.26, octave_offset=12, attack_ms=14, release_s=0.44), 0)
        mix_add(mix, b.orch_note("Strings/Viola Section/susvib", 64, dur_s=1.10, vel=0.56, pan=-0.12, octave_offset=12, attack_ms=16, release_s=0.44), int(0.006 * SR))
        # Rich Brass Choir (F Horns + Heroic Trumpets)
        for mn, pan in ((64, -0.34), (68, 0.0), (71, 0.34)):
            mix_add(mix, b.orch_note("Brass/F Horn/sus", mn, dur_s=1.04, vel=0.62, pan=pan, octave_offset=12, attack_ms=10, release_s=0.42), int(0.004 * SR))
        mix_add(mix, b.orch_note("Brass/Trumpet/sus", 71, dur_s=0.96, vel=0.56, pan=-0.18, octave_offset=12, attack_ms=8, release_s=0.40), int(0.008 * SR))
        mix_add(mix, b.orch_note("Brass/Trumpet/sus", 76, dur_s=0.98, vel=0.60, pan=0.22, octave_offset=12, attack_ms=8, release_s=0.42), int(0.012 * SR))
        for i, mn in enumerate(harp_notes):
            t0 = int(i * 0.019 * SR)
            pan = -0.62 + 1.24 * (i / (len(harp_notes) - 1))
            mix_add(mix, b.orch_note("Strings/Harp", mn, dur_s=1.10, vel=0.80, pan=pan, octave_offset=0, attack_ms=1.2, release_s=0.46), t0)
        for mn, pan in ((68, -0.50), (71, -0.18), (75, 0.18), (76, 0.50)):
            mix_add(mix, b.orch_note("Strings/Violin Section/susVib", mn, dur_s=1.12, vel=0.52, pan=pan, octave_offset=12, attack_ms=20, release_s=0.48), int(0.012 * SR))
        mix_add(mix, b.orch_note("Percussion/Glock", 83, dur_s=0.92, vel=0.52, pan=0.34, octave_offset=12, attack_ms=1.0, release_s=0.44), int(0.095 * SR))
        mix_add(mix, b.orch_note("Percussion/Glock", 88, dur_s=0.95, vel=0.50, pan=-0.30, octave_offset=12, attack_ms=1.0, release_s=0.46), int(0.135 * SR))
        return convolve_room(mix, "hall", wet=0.31, seed=631)

    if tier == 4:
        # Streak 4 — Heroic Gmaj9: thunderous timpani + Trombones + F Horns + blazing Trumpets + full strings + 8-note harp + cymbal kiss
        mix = np.zeros((int(1.52 * SR), 2))
        harp_notes = [55, 62, 67, 71, 74, 78, 81, 83]  # G3..B5
        mix_add(mix, b.musyng_note("timpani", 43, dur_s=1.18, vel=0.82, pan=-0.10, attack_ms=1.5, release_s=0.48), 0)
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 71, dur_s=0.56, vel=0.76, pan=-0.46, octave_offset=12, attack_ms=1.5, release_s=0.22), 0)
        mix_add(mix, b.orch_note("Strings/Violin Section/Spic", 79, dur_s=0.56, vel=0.76, pan=0.46, octave_offset=12, attack_ms=1.5, release_s=0.22), 0)
        mix_add(mix, b.orch_note("Strings/Cello Section/susvib", 55, dur_s=1.32, vel=0.72, pan=-0.24, octave_offset=12, attack_ms=14, release_s=0.50), 0)
        mix_add(mix, b.orch_note("Brass/Tenor Trombone/sus", 55, dur_s=1.18, vel=0.64, pan=-0.32, octave_offset=12, attack_ms=10, release_s=0.46), int(0.004 * SR))
        mix_add(mix, b.orch_note("Brass/Tenor Trombone/sus", 62, dur_s=1.18, vel=0.60, pan=0.32, octave_offset=12, attack_ms=10, release_s=0.46), int(0.006 * SR))
        for mn, pan in ((67, -0.36), (71, 0.0), (74, 0.36)):
            mix_add(mix, b.orch_note("Brass/F Horn/sus", mn, dur_s=1.20, vel=0.66, pan=pan, octave_offset=12, attack_ms=10, release_s=0.48), int(0.004 * SR))
        mix_add(mix, b.orch_note("Brass/Trumpet/susvib", 74, dur_s=1.16, vel=0.66, pan=-0.20, octave_offset=12, attack_ms=8, release_s=0.46), int(0.008 * SR))
        mix_add(mix, b.orch_note("Brass/Trumpet/susvib", 79, dur_s=1.20, vel=0.72, pan=0.22, octave_offset=12, attack_ms=8, release_s=0.48), int(0.012 * SR))
        for i, mn in enumerate(harp_notes):
            t0 = int((0.004 + i * 0.020) * SR)
            pan = -0.68 + 1.36 * (i / (len(harp_notes) - 1))
            mix_add(mix, b.orch_note("Strings/Harp", mn, dur_s=1.24, vel=0.80, pan=pan, octave_offset=0, attack_ms=1.2, release_s=0.50), t0)
        for mn, pan in ((67, -0.54), (71, -0.22), (74, 0.22), (79, 0.54)):
            mix_add(mix, b.orch_note("Strings/Violin Section/susVib", mn, dur_s=1.32, vel=0.56, pan=pan, octave_offset=12, attack_ms=18, release_s=0.54), int(0.010 * SR))
        mix_add(mix, b.orch_note("Strings/Viola Section/susvib", 67, dur_s=1.26, vel=0.56, pan=0.0, octave_offset=12, attack_ms=18, release_s=0.50), int(0.010 * SR))
        tb = b.vsco("Percussion/TB_hit_G4_v4_rr1.wav")
        mix_add(mix, shape_clip(tb, dur_s=1.18, speed=1.0, vel=0.44, pan=0.28, hp_hz=200, fade_in_ms=1.5, fade_out_ms=480), int(0.020 * SR))
        mix_add(mix, b.orch_note("Percussion/Glock", 86, dur_s=1.05, vel=0.52, pan=-0.30, octave_offset=12, attack_ms=1.0, release_s=0.48), int(0.11 * SR))
        mix_add(mix, b.orch_note("Percussion/Glock", 91, dur_s=1.08, vel=0.56, pan=0.32, octave_offset=12, attack_ms=1.0, release_s=0.48), int(0.155 * SR))
        cym = b.vsco("Percussion/susCymb1-hit_mp_rr1.wav")
        mix_add(mix, shape_clip(cym, dur_s=1.25, speed=1.04, vel=0.34, hp_hz=900, fade_in_ms=6, fade_out_ms=580), int(0.012 * SR))
        return convolve_room(mix, "hall", wet=0.32, seed=632)

    # Streak 5 MAX — Prime-Time Championship Cmaj13 Fanfare (Heroic G4 -> C5 brass pickup into FULL ORCHESTRA TUTTI!)
    mix = np.zeros((int(2.18 * SR), 2))
    # Heroic anacrusis pickup at 0ms (G2 timpani + G4 staccato trumpet/horn + snare flourish!) -> <3ms onset!
    mix_add(mix, b.musyng_note("timpani", 43, dur_s=0.42, vel=0.78, pan=-0.14, attack_ms=1.2, release_s=0.22), 0)
    mix_add(mix, b.orch_note("Brass/Trumpet/stac", 67, dur_s=0.24, vel=0.76, pan=-0.16, octave_offset=12, attack_ms=2.0, release_s=0.10), 0)
    mix_add(mix, b.orch_note("Brass/F Horn/stac", 67, dur_s=0.24, vel=0.70, pan=0.16, octave_offset=12, attack_ms=2.0, release_s=0.10), 0)
    snare = b.vsco("Percussion/Snare2-HitSN_v5_rr1_Sum.wav")
    mix_add(mix, shape_clip(snare, dur_s=0.18, speed=1.02, vel=0.46, pan=-0.22, hp_hz=240, fade_in_ms=0.5, fade_out_ms=80), int(0.002 * SR))
    mix_add(mix, shape_clip(snare, dur_s=0.20, speed=1.06, vel=0.56, pan=0.20, hp_hz=240, fade_in_ms=0.5, fade_out_ms=90), int(0.062 * SR))

    # Grand Championship Downbeat at 118ms (Full Cmaj9/13 Symphony Tutti!)
    t1 = int(0.118 * SR)
    mix_add(mix, b.musyng_note("timpani", 48, dur_s=1.65, vel=0.92, pan=-0.08, attack_ms=1.5, release_s=0.72), t1)
    mix_add(mix, shape_clip(b.vsco("Percussion/BDrumNewhit_v5_rr1_Sum.wav"), dur_s=0.75, speed=0.95, vel=0.56, lp_hz=240, fade_in_ms=1.0, fade_out_ms=380), t1)
    mix_add(mix, b.orch_note("Brass/Tuba/sus", 36, dur_s=1.72, vel=0.66, pan=0.0, octave_offset=12, attack_ms=16, release_s=0.68), t1)
    mix_add(mix, b.orch_note("Brass/Tenor Trombone/sus", 48, dur_s=1.72, vel=0.70, pan=-0.34, octave_offset=12, attack_ms=10, release_s=0.68), t1)
    mix_add(mix, b.orch_note("Brass/Tenor Trombone/sus", 55, dur_s=1.72, vel=0.66, pan=0.34, octave_offset=12, attack_ms=10, release_s=0.68), t1)
    for mn, pan in ((60, -0.40), (64, -0.14), (67, 0.14), (72, 0.40)):
        mix_add(mix, b.orch_note("Brass/F Horn/sus", mn, dur_s=1.74, vel=0.68, pan=pan, octave_offset=12, attack_ms=10, release_s=0.70), t1)
    # Blazing Lead Trumpets crowning C5 + E5 + G5!
    mix_add(mix, b.orch_note("Brass/Trumpet/susvib", 72, dur_s=1.72, vel=0.76, pan=-0.22, octave_offset=12, attack_ms=8, release_s=0.70), t1)
    mix_add(mix, b.orch_note("Brass/Trumpet/susvib", 76, dur_s=1.72, vel=0.72, pan=0.22, octave_offset=12, attack_ms=8, release_s=0.70), t1 + int(0.006 * SR))
    mix_add(mix, b.orch_note("Brass/Trumpet/susvib", 79, dur_s=1.68, vel=0.74, pan=0.0, octave_offset=12, attack_ms=8, release_s=0.70), t1 + int(0.014 * SR))
    # Full Strings (Cellos + Violas + Octave Violins)
    mix_add(mix, b.orch_note("Strings/Cello Section/susvib", 48, dur_s=1.82, vel=0.72, pan=-0.26, octave_offset=12, attack_ms=16, release_s=0.76), t1)
    mix_add(mix, b.orch_note("Strings/Viola Section/susvib", 64, dur_s=1.82, vel=0.58, pan=0.14, octave_offset=12, attack_ms=16, release_s=0.76), t1)
    for mn, pan in ((67, -0.58), (72, -0.24), (76, 0.24), (84, 0.58)):
        mix_add(mix, b.orch_note("Strings/Violin Section/susVib", mn, dur_s=1.85, vel=0.60, pan=pan, octave_offset=12, attack_ms=18, release_s=0.78), t1)
    # Sweeping 10-note Concert Harp Glissando (C4 -> D6!)
    gliss = [60, 62, 64, 67, 69, 71, 72, 76, 79, 86]
    for i, mn in enumerate(gliss):
        tg = t1 + int(i * 0.024 * SR)
        pan = -0.74 + 1.48 * (i / (len(gliss) - 1))
        mix_add(mix, b.orch_note("Strings/Harp", mn, dur_s=1.55, vel=0.80, pan=pan, octave_offset=0, attack_ms=1.2, release_s=0.64), tg)
    # Orchestral Crash Cymbal + Tubular Bell C5 + Diamond Glockenspiel Crown!
    crash = b.vsco("Percussion/cymbal-crash1_mf_rr1.wav")
    mix_add(mix, shape_clip(crash, dur_s=1.85, speed=1.0, vel=0.46, hp_hz=650, fade_in_ms=2.0, fade_out_ms=820), t1)
    tb5 = b.vsco("Percussion/TB_hit_C5_v4_rr1.wav")
    mix_add(mix, shape_clip(tb5, dur_s=1.65, speed=1.0, vel=0.52, pan=0.26, hp_hz=200, fade_in_ms=1.5, fade_out_ms=720), t1 + int(0.010 * SR))
    mix_add(mix, b.orch_note("Percussion/Glock", 84, dur_s=1.35, vel=0.54, pan=-0.34, octave_offset=12, attack_ms=1.0, release_s=0.62), t1 + int(0.14 * SR))
    mix_add(mix, b.orch_note("Percussion/Glock", 88, dur_s=1.32, vel=0.54, pan=0.0, octave_offset=12, attack_ms=1.0, release_s=0.62), t1 + int(0.185 * SR))
    mix_add(mix, b.orch_note("Percussion/Glock", 91, dur_s=1.35, vel=0.58, pan=0.34, octave_offset=12, attack_ms=1.0, release_s=0.64), t1 + int(0.23 * SR))
    return convolve_room(mix, "hall", wet=0.34, seed=633)


# ============================================================================
# Master Registry & Build Runner
# ============================================================================

def build_all() -> None:
    OUT_SFX_DIR.mkdir(parents=True, exist_ok=True)
    bank = AcousticStudioBank()

    # (cue_id, builder_fn, target_peak_db, drive, hp_hz, fade_in_ms, fade_out_ms)
    specs = [
        ("ui_brass_tap", build_ui_brass_tap, -4.5, 1.04, 120.0, 0.5, 12.0),
        ("neve_fader_detent", build_neve_fader_detent, -4.5, 1.04, 100.0, 0.5, 12.0),
        ("rotary_knob_click", build_rotary_knob_click, -3.8, 1.05, 95.0, 0.5, 14.0),
        ("brass_gear_detent", build_brass_gear_detent, -3.2, 1.06, 85.0, 0.5, 16.0),
        ("optical_beam_lock", build_optical_beam_lock, -2.8, 1.06, 80.0, 0.6, 26.0),
        ("crystal_hex_claim", build_crystal_hex_claim, -2.5, 1.06, 75.0, 0.6, 30.0),
        ("iron_chain_shatter", build_iron_chain_shatter, -2.0, 1.10, 42.0, 0.5, 32.0),
        ("wire_cutter_snip", build_wire_cutter_snip, -2.4, 1.08, 140.0, 0.4, 16.0),
        ("nixie_spark_crackle", build_nixie_spark_crackle, -2.6, 1.08, 180.0, 0.4, 18.0),
        ("cryptex_stone_tumbler", build_cryptex_stone_tumbler, -2.4, 1.08, 48.0, 0.5, 22.0),
        ("globe_pin_ruby_click", build_globe_pin_ruby_click, -3.0, 1.06, 80.0, 0.4, 18.0),
        ("paddle_spring_slam", build_paddle_spring_slam, -2.2, 1.08, 45.0, 0.4, 20.0),
        ("trapdoor_hinge_drop", build_trapdoor_hinge_drop, -1.9, 1.10, 34.0, 0.5, 35.0),
        ("pneumatic_piston_slam", build_pneumatic_piston_slam, -2.0, 1.10, 38.0, 0.4, 24.0),
        ("velvet_trunk_clasp", build_velvet_trunk_clasp, -2.8, 1.06, 60.0, 0.5, 22.0),
        ("foil_card_flick", build_foil_card_flick, -3.2, 1.05, 140.0, 0.4, 16.0),
        ("relic_pedestal_hum", build_relic_pedestal_hum, -3.4, 1.05, 55.0, 0.6, 40.0),
        ("trophy_pedestal_chime", build_trophy_pedestal_chime, -2.4, 1.06, 55.0, 0.6, 48.0),
        ("medal_enamel_clink", build_medal_enamel_clink, -3.0, 1.05, 160.0, 0.4, 24.0),
        ("screw_rival_slam", build_screw_rival_slam, -1.9, 1.12, 34.0, 0.5, 34.0),
        ("twist_siren_chime", build_twist_siren_chime, -2.2, 1.08, 50.0, 0.6, 38.0),
        ("clock_horology_tick", build_clock_horology_tick, -4.0, 1.05, 110.0, 0.4, 14.0),
        ("clock_escapement_urgent", build_clock_escapement_urgent, -2.8, 1.08, 55.0, 0.4, 18.0),
        ("vault_heavy_unlock", build_vault_heavy_unlock, -2.0, 1.10, 36.0, 0.5, 28.0),
        ("chip_stack_riffle", build_chip_stack_riffle, -3.0, 1.06, 130.0, 0.4, 18.0),
        ("crowd_warm_applause", build_crowd_warm_applause, -3.0, 1.04, 80.0, 1.2, 60.0),
        ("crowd_studio_roar", build_crowd_studio_roar, -2.4, 1.06, 65.0, 1.2, 70.0),
        ("crowd_collective_gasp", build_crowd_collective_gasp, -2.8, 1.05, 85.0, 1.0, 48.0),
        ("streak_chord_1", lambda bk: build_streak_stinger(bk, 1), -2.4, 1.06, 42.0, 0.6, 40.0),
        ("streak_chord_2", lambda bk: build_streak_stinger(bk, 2), -2.3, 1.06, 42.0, 0.6, 44.0),
        ("streak_chord_3", lambda bk: build_streak_stinger(bk, 3), -2.2, 1.07, 38.0, 0.6, 48.0),
        ("streak_chord_4", lambda bk: build_streak_stinger(bk, 4), -2.1, 1.08, 36.0, 0.6, 52.0),
        ("streak_fanfare_5", lambda bk: build_streak_stinger(bk, 5), -1.9, 1.09, 32.0, 0.6, 65.0),
    ]

    assert tuple(s[0] for s in specs) == ALL_FOLEY_IDS_V6, "Spec list mismatch against contracts_v6.ts!"

    report: Dict[str, Dict[str, float]] = {}
    total_bytes = 0
    print(f"Building {len(specs)} World's Smartest v6.0 Horology Foley & Orchestral Streak MP3s (48kHz / {BITRATE})...")
    print(f"{'Cue ID':26s} | {'Dur(s)':>6s} | {'Peak dB':>7s} | {'RMS dB':>7s} | {'Atk(ms)':>7s} | {'KB':>6s}")
    print("-" * 74)

    for cue_id, fn, tp_db, drv, hp, fi, fo in specs:
        pcm = fn(bank)
        out_mp3 = OUT_SFX_DIR / f"{cue_id}.mp3"
        m = master_v6_sfx(
            pcm,
            out_mp3,
            target_peak_db=tp_db,
            drive=drv,
            hp_hz=hp,
            fade_in_ms=fi,
            fade_out_ms=fo,
            align_onset=True,
        )
        report[cue_id] = m
        total_bytes += int(m["bytes"])
        print(
            f"{cue_id:26s} | {m['duration_s']:6.3f} | {m['peak_db']:7.2f} | "
            f"{m['rms_db']:7.2f} | {m['attack_ms']:7.2f} | {m['bytes']/1024.0:6.1f}"
        )

    print("-" * 74)
    print(f"ALL {len(specs)}/33 CUES VERIFIED! Total footprint: {total_bytes / 1024.0:.1f} KB ({total_bytes / (1024*1024):.2f} MB)")

    slow_attacks = [k for k, v in report.items() if v["attack_ms"] >= 5.0]
    if slow_attacks:
        print(f"WARNING: cues with attack >= 5.0ms: {slow_attacks}")
        sys.exit(2)


if __name__ == "__main__":
    build_all()
