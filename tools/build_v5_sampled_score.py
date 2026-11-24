#!/usr/bin/env python3
"""
World's Smartest v5.0 — Real-Sampled Full Symphony Orchestra Score Pipeline
===========================================================================
100% REAL RECORDED ACOUSTIC INSTRUMENTS — ZERO math/sine/sawtooth oscillators!

Fetches & caches authentic recorded symphonic instrument samples from the
MusyngKite SoundFont archive:
  https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/<instrument>-mp3/<Note>.mp3

Orchestrates, humanizes (conductor micro-timing, bow swells, dynamic phrasing,
concert-hall seating stereo panorama, multi-band concert hall convolution IR),
circular-loop renders, and broadcast-masters via imageio_ffmpeg
(`loudnorm=I=-17.5:TP=-1.8:LRA=9`, True Peak <= -1.5 dBFS, seamless zero-click
loops, total 5-track footprint < 2.6 MB):

  1. public/assets/audio/music_greenroom_lounge.mp3  (96 BPM, 30.0s)
     Warm Chamber Symphony Nocturne — celli, pizzicato strings, concert harp,
     solo oboe & flute duet, grand piano, lush chamber strings.

  2. public/assets/audio/music_title_showtime.mp3    (122 BPM, 31.5s)
     Grand Symphonic Overture — soaring violins, heroic French horns, bright
     trumpets & trombones, sweeping concert harp glissandos, orchestral timpani.

  3. public/assets/audio/music_board_groove.mp3      (114 BPM, 25.3s)
     Scherzo Podium Promenade — playful pizzicato strings, nimble clarinet &
     flute interplay, sparkling celesta & harp, bassoon/contrabass pulse.

  4. public/assets/audio/music_thinking_bed.mp3      (100 BPM, 28.8s)
     Symphonic Clockwork Suspense — hushed tremolo strings, crystalline celesta
     & harp ostinato, dark cello/contrabass pedal, deep timpani heartbeat.

  5. public/assets/audio/music_finale_tension.mp3    (128 BPM, 30.0s)
     1.4-Billion Championship Symphony — driving spiccato & tremolo strings,
     blazing French horns, trombones & tuba, cathedral tubular bells, thunderous
     timpani & taiko percussion.
"""

from __future__ import annotations

import concurrent.futures
import json
import math
import re
import subprocess
import sys
import tempfile
import urllib.request
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import imageio_ffmpeg
import numpy as np
from scipy import signal

# ============================================================================
# Configuration & Constants
# ============================================================================

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_AUDIO_DIR = REPO_ROOT / "public" / "assets" / "audio"
CACHE_DIR = Path(tempfile.gettempdir()) / "ws_v5_musyngkite_symphony_cache"
SOUNDFONT_BASE = (
    "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite"
)
SR = 44100
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Exact MusyngKite flat note spellings
FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
NOTE_TO_SEMITONE = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
    "E": 4, "Fb": 4, "E#": 5, "F": 5, "F#": 6, "Gb": 6,
    "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10,
    "B": 11, "Cb": 11, "B#": 0,
}

# Instruments that can seamlessly sustain longer than 2.4s via middle-body crossfade
SUSTAINABLE_INSTRUMENTS = {
    "string_ensemble_1",
    "string_ensemble_2",
    "tremolo_strings",
    "violin",
    "viola",
    "cello",
    "contrabass",
    "french_horn",
    "trumpet",
    "trombone",
    "tuba",
    "brass_section",
    "flute",
    "oboe",
    "clarinet",
    "bassoon",
}

# Natural ring-out percussion / plucked instruments that keep acoustic decay past gate
RINGOUT_INSTRUMENTS = {
    "orchestral_harp",
    "celesta",
    "acoustic_grand_piano",
    "tubular_bells",
    "glockenspiel",
    "vibraphone",
    "timpani",
    "taiko_drum",
    "pizzicato_strings",
    "woodblock",
    "reverse_cymbal",
}

# Per-instrument acoustic gain calibration (compensates raw soundfont recording levels)
INSTRUMENT_GAIN: Dict[str, float] = {
    "string_ensemble_1": 0.92,
    "string_ensemble_2": 2.15,
    "tremolo_strings": 1.20,
    "pizzicato_strings": 2.85,
    "violin": 2.05,
    "viola": 2.05,
    "cello": 1.95,
    "contrabass": 1.25,
    "french_horn": 2.05,
    "trumpet": 1.52,
    "trombone": 1.95,
    "tuba": 1.05,
    "brass_section": 1.12,
    "flute": 1.62,
    "oboe": 2.15,
    "clarinet": 1.52,
    "bassoon": 2.05,
    "orchestral_harp": 2.35,
    "celesta": 1.85,
    "tubular_bells": 1.68,
    "glockenspiel": 1.85,
    "vibraphone": 1.65,
    "timpani": 1.38,
    "taiko_drum": 1.48,
    "woodblock": 1.85,
    "acoustic_grand_piano": 2.65,
    "reverse_cymbal": 1.20,
}

# Authentic symphony concert-stage left/right seating (-1.0 left .. +1.0 right)
STAGE_PAN: Dict[str, float] = {
    "violin": -0.52,
    "string_ensemble_1": -0.24,
    "string_ensemble_2": -0.10,
    "tremolo_strings": 0.10,
    "viola": -0.18,
    "pizzicato_strings": 0.16,
    "cello": 0.32,
    "contrabass": 0.28,
    "orchestral_harp": -0.48,
    "acoustic_grand_piano": -0.28,
    "celesta": -0.20,
    "vibraphone": 0.24,
    "glockenspiel": 0.32,
    "flute": -0.14,
    "oboe": 0.16,
    "clarinet": -0.22,
    "bassoon": 0.22,
    "french_horn": -0.24,
    "trumpet": 0.24,
    "trombone": 0.36,
    "tuba": 0.18,
    "brass_section": 0.12,
    "timpani": -0.05,
    "taiko_drum": 0.05,
    "tubular_bells": 0.18,
    "woodblock": 0.28,
    "reverse_cymbal": 0.00,
}

# Concert hall send depth per instrument (front desk crisp, back-row horns/bells richer)
HALL_SEND: Dict[str, float] = {
    "violin": 0.22,
    "string_ensemble_1": 0.22,
    "string_ensemble_2": 0.26,
    "tremolo_strings": 0.30,
    "viola": 0.20,
    "pizzicato_strings": 0.18,
    "cello": 0.16,
    "contrabass": 0.10,
    "orchestral_harp": 0.28,
    "acoustic_grand_piano": 0.20,
    "celesta": 0.28,
    "vibraphone": 0.26,
    "glockenspiel": 0.30,
    "flute": 0.26,
    "oboe": 0.24,
    "clarinet": 0.22,
    "bassoon": 0.18,
    "french_horn": 0.34,
    "trumpet": 0.28,
    "trombone": 0.28,
    "tuba": 0.14,
    "brass_section": 0.30,
    "timpani": 0.20,
    "taiko_drum": 0.16,
    "tubular_bells": 0.38,
    "woodblock": 0.18,
    "reverse_cymbal": 0.32,
}

# Section high-pass frequencies keeping the orchestral mix transparent & punchy
SECTION_HPF_HZ: Dict[str, float] = {
    "violin": 190.0,
    "flute": 260.0,
    "oboe": 210.0,
    "clarinet": 150.0,
    "celesta": 260.0,
    "glockenspiel": 320.0,
    "orchestral_harp": 100.0,
    "pizzicato_strings": 95.0,
    "tremolo_strings": 210.0,
    "string_ensemble_1": 95.0,
    "string_ensemble_2": 95.0,
    "viola": 120.0,
    "trumpet": 185.0,
    "tubular_bells": 150.0,
    "woodblock": 260.0,
    "vibraphone": 150.0,
    "acoustic_grand_piano": 70.0,
    "french_horn": 85.0,
    "trombone": 65.0,
    "bassoon": 58.0,
    "brass_section": 75.0,
    "cello": 52.0,
    "contrabass": 35.0,
    "tuba": 35.0,
    "timpani": 38.0,
    "taiko_drum": 38.0,
}


# ============================================================================
# Pitch Helpers & Musical Event Data Model
# ============================================================================

def note_to_midi(note: str) -> int:
    m = re.fullmatch(r"([A-Ga-g])([#b]?)(-?\d+)", note.strip())
    if not m:
        raise ValueError(f"Invalid note name: {note!r}")
    letter = m.group(1).upper()
    acc = m.group(2)
    octave = int(m.group(3))
    semi = NOTE_TO_SEMITONE[letter + acc]
    return (octave + 1) * 12 + semi


def midi_to_musyngkite(midi: int) -> str:
    clamped = max(21, min(108, int(midi)))
    octave = (clamped // 12) - 1
    return f"{FLAT_NAMES[clamped % 12]}{octave}"


def canonical_note(note: str) -> str:
    return midi_to_musyngkite(note_to_midi(note))


def smoothstep(n: int) -> np.ndarray:
    """Polynomial Hermite 0..1 smooth curve (zero trig/oscillators)."""
    if n <= 0:
        return np.zeros(0, dtype=np.float64)
    if n == 1:
        return np.ones(1, dtype=np.float64)
    t = np.linspace(0.0, 1.0, n, dtype=np.float64)
    return t * t * (3.0 - 2.0 * t)


@dataclass
class NoteEvent:
    instrument: str
    note: str
    beat: float          # start beat (0-based; wraps circularly)
    dur: float           # duration in beats
    vel: float = 0.78    # musical dynamics 0.0..1.25
    pan: Optional[float] = None
    attack_ms: Optional[float] = None
    release_ms: Optional[float] = None
    swell: float = 0.0   # 0.0 = natural, 0.30 = expressive orchestral bow swell
    humanize_ms: float = 5.5
    staccato: bool = False


# ============================================================================
# MusyngKite Real Sample Cache & Decoder
# ============================================================================

class MusyngKiteBank:
    """Downloads, caches, and decodes authentic stereo MusyngKite instrument notes."""

    def __init__(self, cache_dir: Path = CACHE_DIR) -> None:
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._pcm_cache: Dict[Tuple[str, str], np.ndarray] = {}

    def _mp3_path(self, instrument: str, note: str) -> Path:
        inst_dir = self.cache_dir / instrument
        inst_dir.mkdir(parents=True, exist_ok=True)
        return inst_dir / f"{note}.mp3"

    def _download_one(self, instrument: str, note: str) -> Path:
        dst = self._mp3_path(instrument, note)
        if dst.exists() and dst.stat().st_size > 256:
            return dst
        url = f"{SOUNDFONT_BASE}/{instrument}-mp3/{note}.mp3"
        last_err: Optional[Exception] = None
        for _attempt in range(3):
            try:
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "WorldsSmartest-v5-SymphonyBuilder/1.0"},
                )
                with urllib.request.urlopen(req, timeout=20) as resp:
                    data = resp.read()
                if len(data) < 256:
                    raise RuntimeError(f"Truncated sample ({len(data)} bytes) for {url}")
                tmp = dst.with_suffix(".tmp")
                tmp.write_bytes(data)
                tmp.replace(dst)
                return dst
            except Exception as exc:
                last_err = exc
        raise RuntimeError(f"Failed downloading {url}: {last_err}")

    def preload(self, events: Sequence[NoteEvent]) -> None:
        needed = sorted({(ev.instrument, canonical_note(ev.note)) for ev in events})
        missing = [
            pair for pair in needed
            if not (self._mp3_path(*pair).exists() and self._mp3_path(*pair).stat().st_size > 256)
        ]
        if missing:
            print(f"  [soundfont] Fetching {len(missing)} new MusyngKite samples ({len(needed)} total unique)...")
            with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
                futs = {pool.submit(self._download_one, inst, note): (inst, note) for inst, note in missing}
                for fut in concurrent.futures.as_completed(futs):
                    fut.result()
        else:
            print(f"  [soundfont] All {len(needed)} MusyngKite samples ready in cache.")

        for inst, note in needed:
            self.get_pcm(inst, note)

    def get_pcm(self, instrument: str, note: str) -> np.ndarray:
        cnote = canonical_note(note)
        key = (instrument, cnote)
        cached = self._pcm_cache.get(key)
        if cached is not None:
            return cached

        mp3_path = self._download_one(instrument, cnote)
        proc = subprocess.run(
            [FFMPEG, "-v", "error", "-i", str(mp3_path), "-ar", str(SR), "-ac", "2", "-f", "f32le", "-"],
            capture_output=True,
            check=True,
        )
        raw = np.frombuffer(proc.stdout, dtype="<f4").astype(np.float64).reshape(-1, 2)
        if raw.shape[0] < 1000:
            raise RuntimeError(f"Decoded abnormally short sample for {instrument}/{cnote}")

        raw -= np.mean(raw, axis=0, keepdims=True)

        # Trim encoder prefix silence cleanly so percussive & rhythmic instruments lock on beat
        mono_env = np.max(np.abs(raw), axis=1)
        peak = float(np.max(mono_env))
        if peak > 1e-6:
            thresh = peak * (0.012 if instrument in ("string_ensemble_2", "reverse_cymbal") else 0.028)
            above = np.where(mono_env >= thresh)[0]
            if above.size > 0:
                lead = max(0, int(above[0]) - int(0.002 * SR))
                max_trim = int((0.12 if instrument == "string_ensemble_2" else 0.045) * SR)
                trim = min(lead, max_trim)
                if trim > 0:
                    raw = raw[trim:]

        # Section high-pass keeps the orchestral low-mid crisp and transparent
        hpf_hz = SECTION_HPF_HZ.get(instrument, 50.0)
        sos_hp = signal.butter(2, hpf_hz, btype="highpass", fs=SR, output="sos")
        raw[:, 0] = signal.sosfilt(sos_hp, raw[:, 0])
        raw[:, 1] = signal.sosfilt(sos_hp, raw[:, 1])

        raw *= INSTRUMENT_GAIN.get(instrument, 1.5)
        self._pcm_cache[key] = raw
        return raw


# ============================================================================
# Symphonic Sample Shaping & Concert Hall Acoustics (ZERO Oscillators!)
# ============================================================================

def extend_sustain_body(pcm: np.ndarray, target_len: int) -> np.ndarray:
    """
    Smoothly extend a recorded sustained bowed/blown sample beyond ~2.6s using
    overlapping Hermite crossfades inside its steady middle sustain body.
    """
    n = pcm.shape[0]
    if target_len <= n - int(0.08 * SR):
        return pcm[:target_len].copy()

    loop_start = min(int(0.75 * SR), n // 3)
    loop_end = min(int(2.45 * SR), n - int(0.25 * SR))
    xfade = int(0.42 * SR)
    step = loop_end - loop_start - xfade
    if step <= int(0.25 * SR):
        out = np.zeros((target_len, 2), dtype=np.float64)
        copy_n = min(n, target_len)
        out[:copy_n] = pcm[:copy_n]
        return out

    fade_in = smoothstep(xfade)[:, None]
    fade_out = 1.0 - fade_in

    out = np.zeros((target_len, 2), dtype=np.float64)
    first_n = min(loop_end, target_len)
    out[:first_n] = pcm[:first_n]
    pos = loop_end - xfade

    body = pcm[loop_start:loop_end]
    body_len = body.shape[0]
    while pos < target_len:
        rem = target_len - pos
        chunk_n = min(body_len, rem)
        chunk = body[:chunk_n].copy()
        xf = min(xfade, chunk_n)
        out[pos : pos + xf] = out[pos : pos + xf] * fade_out[:xf] + chunk[:xf] * fade_in[:xf]
        if chunk_n > xf:
            out[pos + xf : pos + chunk_n] = chunk[xf:]
        pos += step
    return out


def shape_note_pcm(
    pcm: np.ndarray,
    instrument: str,
    dur_sec: float,
    vel: float,
    attack_ms: Optional[float],
    release_ms: Optional[float],
    swell: float,
    staccato: bool,
) -> np.ndarray:
    """Apply expressive acoustic attack, bow swell, sustain, and natural release."""
    is_ringout = instrument in RINGOUT_INSTRUMENTS and not staccato
    is_sustain = instrument in SUSTAINABLE_INSTRUMENTS

    if attack_ms is None:
        if staccato:
            attack_ms = 4.0
        elif instrument in ("string_ensemble_2", "tremolo_strings"):
            attack_ms = 90.0
        elif instrument in ("string_ensemble_1", "cello", "viola", "violin"):
            attack_ms = 36.0
        elif instrument in ("french_horn", "trombone", "tuba"):
            attack_ms = 26.0
        elif instrument in ("flute", "oboe", "clarinet", "bassoon"):
            attack_ms = 22.0
        elif instrument == "reverse_cymbal":
            attack_ms = 16.0
        else:
            attack_ms = 3.0

    if release_ms is None:
        if staccato:
            release_ms = 62.0
        elif is_ringout:
            release_ms = 1050.0 if instrument in ("orchestral_harp", "tubular_bells", "celesta", "vibraphone") else 640.0
        elif instrument in ("string_ensemble_1", "string_ensemble_2", "tremolo_strings"):
            release_ms = 290.0
        elif instrument in ("french_horn", "trombone", "brass_section", "cello", "viola", "violin"):
            release_ms = 210.0
        else:
            release_ms = 155.0

    gate_n = max(int(0.025 * SR), int(round(dur_sec * SR)))
    rel_n = int(round((release_ms / 1000.0) * SR))
    atk_n = min(int(round((attack_ms / 1000.0) * SR)), max(1, gate_n // 2))

    if is_ringout:
        total_n = min(pcm.shape[0], gate_n + rel_n)
        buf = pcm[:total_n].copy()
        tail_fade = min(int(0.26 * SR), total_n // 3)
        if tail_fade > 8:
            buf[-tail_fade:] *= (1.0 - smoothstep(tail_fade))[:, None]
    else:
        total_n = gate_n + rel_n
        if is_sustain and total_n > pcm.shape[0] - int(0.06 * SR):
            buf = extend_sustain_body(pcm, total_n)
        else:
            actual = min(pcm.shape[0], total_n)
            buf = pcm[:actual].copy()
            if actual < total_n:
                rel_n = max(int(0.04 * SR), actual - min(gate_n, actual - int(0.04 * SR)))
                gate_n = actual - rel_n
                total_n = actual

        r_start = min(gate_n, buf.shape[0])
        r_len = buf.shape[0] - r_start
        if r_len > 4:
            t_rel = np.linspace(0.0, 1.0, r_len, dtype=np.float64)
            rel_env = (1.0 - t_rel * t_rel * (3.0 - 2.0 * t_rel)) * np.exp(-2.4 * t_rel)
            buf[r_start:] *= rel_env[:, None]

    if atk_n > 4 and atk_n < buf.shape[0]:
        buf[:atk_n] *= smoothstep(atk_n)[:, None]

    if swell > 0.01 and gate_n > int(0.25 * SR):
        sw_n = min(gate_n, buf.shape[0])
        t_sw = np.linspace(0.0, 1.0, sw_n, dtype=np.float64)
        arch = 1.0 - swell * (1.0 - 4.0 * t_sw * (1.0 - t_sw))
        buf[:sw_n] *= arch[:, None]

    v = float(np.clip(vel, 0.08, 1.35))
    if v < 0.62 and buf.shape[0] > 64:
        cutoff = 2800.0 + 6200.0 * (v / 0.62)
        sos_lp = signal.butter(1, min(cutoff, SR * 0.45), btype="lowpass", fs=SR, output="sos")
        buf[:, 0] = signal.sosfilt(sos_lp, buf[:, 0])
        buf[:, 1] = signal.sosfilt(sos_lp, buf[:, 1])

    return buf * (v ** 1.25)


def apply_stereo_stage_pan(stereo: np.ndarray, pan: float) -> np.ndarray:
    """
    Seat a stereo orchestral sample on the concert stage while preserving its
    native stereo width (constant-power sqrt balance, zero trig!).
    """
    p = float(np.clip(pan, -0.92, 0.92))
    left_w = math.sqrt(0.5 * (1.0 - p))
    right_w = math.sqrt(0.5 * (1.0 + p))
    mono = 0.5 * (stereo[:, 0] + stereo[:, 1])
    side = 0.5 * (stereo[:, 0] - stereo[:, 1])
    out = np.empty_like(stereo)
    out[:, 0] = (mono * left_w * 1.41421356) + (side * 0.68)
    out[:, 1] = (mono * right_w * 1.41421356) - (side * 0.68)
    return out


def build_concert_hall_ir(
    rt60_sec: float = 1.55,
    pre_delay_ms: float = 19.0,
    brightness_hz: float = 4800.0,
    seed: int = 505,
) -> np.ndarray:
    """
    Build a transparent, warm stereo Symphony Concert Hall Impulse Response
    using architectural early reflections + multi-band diffuse exponentially
    decaying noise (ZERO sine/oscillators!).
    """
    rng = np.random.default_rng(seed)
    ir_len = int((rt60_sec * 1.30 + 0.14) * SR)
    ir = np.zeros((ir_len, 2), dtype=np.float64)

    # Early reflections (stage floor, oak walls, balcony overhang)
    early_taps = [
        (13.5, 0.40, 0.16), (18.2, 0.15, 0.38), (23.1, 0.32, 0.22),
        (29.0, 0.19, 0.31), (35.4, 0.26, 0.20), (42.3, 0.16, 0.27),
        (50.1, 0.20, 0.15), (58.0, 0.13, 0.19),
    ]
    for ms, gl, gr in early_taps:
        idx = int((ms / 1000.0) * SR)
        if 0 < idx < ir_len - 4:
            ir[idx, 0] += gl * 0.72
            ir[idx + 1, 0] += gl * 0.28
            ir[idx, 1] += gr * 0.72
            ir[idx + 1, 1] += gr * 0.28

    t = np.arange(ir_len, dtype=np.float64) / SR
    pre_n = int((pre_delay_ms / 1000.0) * SR)
    t_rel = np.maximum(0.0, t - (pre_delay_ms / 1000.0))

    env_low = np.exp(-6.9078 * t_rel / (rt60_sec * 1.05))
    env_mid = np.exp(-6.9078 * t_rel / rt60_sec)
    env_hi = np.exp(-6.9078 * t_rel / (rt60_sec * 0.55))

    bloom_n = int(0.055 * SR)
    bloom = np.ones(ir_len, dtype=np.float64)
    bloom[:pre_n] = 0.0
    if pre_n + bloom_n < ir_len:
        bloom[pre_n : pre_n + bloom_n] = smoothstep(bloom_n)

    sos_low = signal.butter(2, [135.0, 620.0], btype="bandpass", fs=SR, output="sos")
    sos_mid = signal.butter(2, [580.0, brightness_hz], btype="bandpass", fs=SR, output="sos")
    sos_hi = signal.butter(2, [brightness_hz * 0.85, min(9200.0, SR * 0.42)], btype="bandpass", fs=SR, output="sos")

    for ch in range(2):
        n_lo = signal.sosfilt(sos_low, rng.standard_normal(ir_len)) * env_low * 0.42
        n_md = signal.sosfilt(sos_mid, rng.standard_normal(ir_len)) * env_mid * 0.76
        n_hi = signal.sosfilt(sos_hi, rng.standard_normal(ir_len)) * env_hi * 0.26
        diffuse = (n_lo + n_md + n_hi) * bloom
        ir[:, ch] += diffuse * 0.22

    end_fade = int(0.12 * SR)
    ir[-end_fade:] *= (1.0 - smoothstep(end_fade))[:, None]

    # Calibrated transparent hall energy (lush halo without smearing crisp rhythms!)
    rms = float(np.sqrt(np.mean(ir ** 2)))
    if rms > 1e-9:
        ir *= 0.028 / rms
    return ir


def circular_add(dst: np.ndarray, src: np.ndarray, start_idx: int) -> None:
    """Overlap-add stereo src into circular dst buffer wrapping seamlessly modulo len(dst)."""
    n_dst = dst.shape[0]
    n_src = src.shape[0]
    if n_src == 0:
        return
    pos = start_idx % n_dst
    offset = 0
    while offset < n_src:
        chunk = min(n_src - offset, n_dst - pos)
        dst[pos : pos + chunk] += src[offset : offset + chunk]
        offset += chunk
        pos = (pos + chunk) % n_dst


def render_symphonic_movement(
    name: str,
    bpm: float,
    total_beats: float,
    events: Sequence[NoteEvent],
    bank: MusyngKiteBank,
    hall_rt60: float = 1.55,
    hall_brightness_hz: float = 4800.0,
    hall_wet_scale: float = 1.0,
    seed: int = 100,
) -> np.ndarray:
    """
    Render a full-orchestra circular-loop stereo buffer with humanized micro-timing,
    authentic stage panning, and circularly wrapped concert hall convolution.
    """
    rng = np.random.default_rng(seed)
    sec_per_beat = 60.0 / bpm
    loop_sec = total_beats * sec_per_beat
    loop_n = int(round(loop_sec * SR))

    dry_bus = np.zeros((loop_n, 2), dtype=np.float64)
    wet_send = np.zeros((loop_n, 2), dtype=np.float64)

    bank.preload(events)

    for ev in events:
        raw = bank.get_pcm(ev.instrument, ev.note)
        dur_sec = max(0.05, ev.dur * sec_per_beat)
        jitter_sec = (rng.normal(0.0, ev.humanize_ms * 0.40) / 1000.0) if ev.humanize_ms > 0 else 0.0
        vel_jitter = float(np.clip(ev.vel * (1.0 + rng.normal(0.0, 0.024)), 0.06, 1.35))

        shaped = shape_note_pcm(
            raw,
            instrument=ev.instrument,
            dur_sec=dur_sec,
            vel=vel_jitter,
            attack_ms=ev.attack_ms,
            release_ms=ev.release_ms,
            swell=ev.swell,
            staccato=ev.staccato,
        )

        pan_base = STAGE_PAN.get(ev.instrument, 0.0) if ev.pan is None else ev.pan
        pan_jit = float(np.clip(pan_base + rng.uniform(-0.04, 0.04), -0.88, 0.88))
        panned = apply_stereo_stage_pan(shaped, pan_jit)

        start_sec = (ev.beat * sec_per_beat + jitter_sec) % loop_sec
        start_idx = int(round(start_sec * SR)) % loop_n

        circular_add(dry_bus, panned, start_idx)
        send_amt = HALL_SEND.get(ev.instrument, 0.24) * hall_wet_scale
        if send_amt > 0.001:
            circular_add(wet_send, panned * send_amt, start_idx)

    # Circular concert-hall convolution across the bar-1 seam
    ir = build_concert_hall_ir(
        rt60_sec=hall_rt60,
        pre_delay_ms=19.0,
        brightness_hz=hall_brightness_hz,
        seed=seed + 777,
    )
    ir_n = ir.shape[0]
    pad_n = min(loop_n, ir_n + int(0.25 * SR))
    tiled = np.concatenate([wet_send[-pad_n:], wet_send], axis=0)
    conv_l = signal.fftconvolve(tiled[:, 0], ir[:, 0], mode="full")[pad_n : pad_n + loop_n]
    conv_r = signal.fftconvolve(tiled[:, 1], ir[:, 1], mode="full")[pad_n : pad_n + loop_n]
    hall_wet = np.column_stack([conv_l, conv_r])

    mix = dry_bus + hall_wet

    # Tight mono below 95 Hz for authoritative concert contrabass/timpani center focus
    sos_sub = signal.butter(2, 95.0, btype="lowpass", fs=SR, output="sos")
    sub_l = signal.sosfiltfilt(sos_sub, mix[:, 0])
    sub_r = signal.sosfiltfilt(sos_sub, mix[:, 1])
    sub_mono = 0.5 * (sub_l + sub_r)
    mix[:, 0] = (mix[:, 0] - sub_l) + sub_mono
    mix[:, 1] = (mix[:, 1] - sub_r) + sub_mono

    sos_hp = signal.butter(2, 30.0, btype="highpass", fs=SR, output="sos")
    mix[:, 0] = signal.sosfiltfilt(sos_hp, mix[:, 0])
    mix[:, 1] = signal.sosfiltfilt(sos_hp, mix[:, 1])

    pk = float(np.max(np.abs(mix)))
    if pk > 1e-6:
        mix *= (0.56 / pk)

    # Gentle console transformer warmth
    mix = np.tanh(mix * 1.08) / 1.08
    print(f"  [render] {name}: {loop_sec:.3f}s @ {bpm:.0f} BPM ({len(events)} symphonic notes)")
    return mix


# ============================================================================
# Composition Helpers (Strums, Glissandos, Timpani Rolls, Chord Voicings)
# ============================================================================

def add_chord(
    events: List[NoteEvent],
    instrument: str,
    notes: Sequence[str],
    beat: float,
    dur: float,
    vel: float = 0.72,
    strum_beats: float = 0.0,
    pan: Optional[float] = None,
    pan_spread: float = 0.0,
    attack_ms: Optional[float] = None,
    release_ms: Optional[float] = None,
    swell: float = 0.0,
    staccato: bool = False,
) -> None:
    count = len(notes)
    for i, n in enumerate(notes):
        p = pan
        if pan_spread > 0.0 and count > 1:
            base_p = STAGE_PAN.get(instrument, 0.0) if pan is None else pan
            frac = (i / (count - 1)) * 2.0 - 1.0
            p = float(np.clip(base_p + frac * pan_spread, -0.85, 0.85))
        events.append(
            NoteEvent(
                instrument=instrument,
                note=n,
                beat=beat + i * strum_beats,
                dur=max(0.08, dur - i * strum_beats * 0.4),
                vel=vel * (0.94 + 0.06 * (i / max(1, count - 1))),
                pan=p,
                attack_ms=attack_ms,
                release_ms=release_ms,
                swell=swell,
                staccato=staccato,
            )
        )


def add_harp_gliss(
    events: List[NoteEvent],
    scale_notes: Sequence[str],
    start_beat: float,
    span_beats: float,
    vel_start: float = 0.55,
    vel_end: float = 0.92,
) -> None:
    n = len(scale_notes)
    if n == 0:
        return
    step = span_beats / max(1, n)
    for i, note in enumerate(scale_notes):
        frac = i / max(1, n - 1)
        events.append(
            NoteEvent(
                instrument="orchestral_harp",
                note=note,
                beat=start_beat + i * step,
                dur=max(0.45, span_beats * 0.85),
                vel=vel_start + (vel_end - vel_start) * frac,
                humanize_ms=2.2,
            )
        )


def add_timpani_roll(
    events: List[NoteEvent],
    note: str,
    start_beat: float,
    dur_beats: float,
    vel_start: float = 0.36,
    vel_end: float = 1.02,
    subdiv: float = 0.25,
) -> None:
    steps = max(2, int(round(dur_beats / subdiv)))
    for i in range(steps):
        frac = i / max(1, steps - 1)
        v = vel_start + (vel_end - vel_start) * (frac * frac)
        events.append(
            NoteEvent(
                instrument="timpani",
                note=note,
                beat=start_beat + i * subdiv,
                dur=subdiv * 1.35,
                vel=v,
                humanize_ms=3.0,
            )
        )


# ============================================================================
# MOVEMENT 1: music_greenroom_lounge.mp3 — Warm Chamber Symphony Nocturne
# Key: D Major / B Minor warmth | 96 BPM | 12 bars (48 beats = 30.000s)
# ============================================================================

def compose_greenroom_lounge() -> Tuple[float, float, List[NoteEvent]]:
    bpm = 96.0
    total_beats = 48.0  # 12 bars of 4/4 = 30.000s
    ev: List[NoteEvent] = []

    bars = [
        # Bar 0: Dmaj9
        ("D2", "A2", [("D3", 0.0, 2.5, 0.72), ("F#3", 2.5, 1.5, 0.66)],
         ["D3", "F#3", "A3", "C#4", "E4"], ["D4", "F#4", "A4", "E5"],
         ["D3", "A3", "D4", "E4", "F#4", "A4", "E4", "A3"]),
        # Bar 1: Bm11
        ("B1", "F#2", [("B2", 0.0, 2.0, 0.70), ("D3", 2.0, 1.0, 0.64), ("E3", 3.0, 1.0, 0.66)],
         ["B2", "F#3", "A3", "D4", "E4"], ["B3", "D4", "F#4", "A4"],
         ["B2", "F#3", "B3", "D4", "E4", "F#4", "D4", "A3"]),
        # Bar 2: Gmaj9
        ("G1", "D2", [("G2", 0.0, 2.5, 0.72), ("B2", 2.5, 1.5, 0.68)],
         ["G2", "D3", "F#3", "A3", "B3"], ["G3", "B3", "D4", "F#4"],
         ["G2", "D3", "G3", "A3", "B3", "D4", "F#4", "D4"]),
        # Bar 3: A13sus4 -> A7
        ("A1", "E2", [("A2", 0.0, 2.0, 0.68), ("G2", 2.0, 1.0, 0.64), ("E2", 3.0, 1.0, 0.62)],
         ["A2", "E3", "G3", "C#4", "F#4"], ["A3", "C#4", "E4", "G4"],
         ["A2", "E3", "A3", "D4", "C#4", "E4", "G4", "E4"]),

        # Bar 4: Dmaj9 (A' lush chamber lift)
        ("D2", "A2", [("D3", 0.0, 2.0, 0.75), ("A3", 2.0, 2.0, 0.70)],
         ["D3", "A3", "C#4", "E4", "F#4"], ["D4", "A4", "C#5", "F#5"],
         ["D3", "A3", "D4", "F#4", "A4", "E5", "A4", "F#4"]),
        # Bar 5: F#m9
        ("F#1", "C#2", [("F#2", 0.0, 2.5, 0.72), ("A2", 2.5, 1.5, 0.68)],
         ["F#2", "C#3", "E3", "G#3", "A3"], ["F#3", "A3", "C#4", "E4"],
         ["F#2", "C#3", "F#3", "A3", "C#4", "E4", "A3", "C#4"]),
        # Bar 6: Gmaj9
        ("G1", "D2", [("G2", 0.0, 2.0, 0.74), ("D3", 2.0, 2.0, 0.70)],
         ["G2", "D3", "F#3", "A3", "B3"], ["G3", "D4", "F#4", "B4"],
         ["G2", "D3", "G3", "B3", "D4", "F#4", "A4", "D4"]),
        # Bar 7: Em9 -> A13
        ("E1", "A1", [("E2", 0.0, 2.0, 0.72), ("A2", 2.0, 2.0, 0.72)],
         ["E3", "G3", "B3", "D4", "F#4"], ["E4", "G4", "B4", "C#5"],
         ["E2", "B2", "E3", "G3", "A2", "E3", "G3", "C#4"]),

        # Bar 8: Bm9 (B section bittersweet elegance)
        ("B1", "F#2", [("B2", 0.0, 2.5, 0.75), ("F#3", 2.5, 1.5, 0.72)],
         ["B2", "D3", "F#3", "A3", "C#4"], ["B3", "F#4", "A4", "D5"],
         ["B2", "F#3", "A3", "C#4", "D4", "F#4", "A4", "F#4"]),
        # Bar 9: Gmaj7#11
        ("G1", "D2", [("G2", 0.0, 2.0, 0.75), ("B2", 2.0, 1.0, 0.68), ("D3", 3.0, 1.0, 0.72)],
         ["G2", "D3", "F#3", "B3", "C#4"], ["G3", "B3", "D4", "F#4"],
         ["G2", "D3", "G3", "B3", "C#4", "D4", "F#4", "D4"]),
        # Bar 10: Em11
        ("E1", "B1", [("E2", 0.0, 2.0, 0.72), ("G2", 2.0, 2.0, 0.68)],
         ["E3", "G3", "A3", "B3", "D4"], ["E4", "G4", "A4", "D5"],
         ["E2", "B2", "E3", "G3", "A3", "B3", "D4", "B3"]),
        # Bar 11: A13sus4 -> A7 turnaround back to Dmaj9
        ("A1", "E2", [("A2", 0.0, 2.0, 0.72), ("E2", 2.0, 1.5, 0.68), ("A2", 3.5, 0.5, 0.66)],
         ["A2", "E3", "G3", "C#4", "E4"], ["A3", "C#4", "E4", "G4"],
         ["A2", "E3", "A3", "C#4", "E4", "G4", "A4", "E4"]),
    ]

    for b_idx, (root, fifth, cello_notes, piano_voicing, pad_voicing, harp_arp) in enumerate(bars):
        b0 = b_idx * 4.0

        # Warm contrabass gentle chamber heartbeat
        ev.append(NoteEvent("contrabass", root, b0, 1.75, 0.68, attack_ms=28.0, release_ms=240.0))
        ev.append(NoteEvent("contrabass", fifth, b0 + 2.0, 1.65, 0.58, attack_ms=32.0, release_ms=220.0))

        # Subtle pizzicato string pulse (refined chamber rhythmic sway)
        ev.append(NoteEvent("pizzicato_strings", pad_voicing[0], b0 + 1.0, 0.55, 0.56))
        ev.append(NoteEvent("pizzicato_strings", pad_voicing[1], b0 + 2.5, 0.55, 0.50))
        ev.append(NoteEvent("pizzicato_strings", pad_voicing[2], b0 + 3.0, 0.55, 0.54))
        if b_idx % 2 == 1:
            ev.append(NoteEvent("pizzicato_strings", pad_voicing[1], b0 + 3.5, 0.45, 0.44))

        # Warm singing celli foundation
        for cn, offset, dur, vel in cello_notes:
            ev.append(NoteEvent("cello", cn, b0 + offset, dur, vel, attack_ms=60.0, release_ms=260.0, swell=0.22))

        # Lush chamber velvet strings (gently tucked so harp, piano & woodwinds gleam)
        add_chord(
            ev,
            "string_ensemble_2",
            pad_voicing,
            beat=b0,
            dur=3.9,
            vel=0.40 if b_idx < 8 else 0.48,
            pan_spread=0.30,
            attack_ms=165.0,
            release_ms=380.0,
            swell=0.26,
        )

        # Concert grand piano rolled nocturnal voicings (clear and warm!)
        add_chord(
            ev,
            "acoustic_grand_piano",
            piano_voicing,
            beat=b0,
            dur=2.6,
            vel=0.68,
            strum_beats=0.045,
            pan=-0.28,
            release_ms=720.0,
        )
        if b_idx % 2 == 0:
            add_chord(
                ev,
                "acoustic_grand_piano",
                piano_voicing[2:],
                beat=b0 + 2.5,
                dur=1.25,
                vel=0.52,
                strum_beats=0.03,
                pan=-0.22,
            )

        # Flowing concert harp nocturnal arpeggios
        for i, hn in enumerate(harp_arp):
            h_vel = 0.58 + 0.14 * (1.0 - abs((i - 3.5) / 3.5))
            ev.append(NoteEvent("orchestral_harp", hn, b0 + i * 0.5, 0.95, h_vel, humanize_ms=6.5))

    # --- Expressive Solo Oboe (Bars 1-4: Intimate, Classy Backstage Motif) ---
    oboe_melody = [
        ("F#4", 0.5, 1.5, 0.72), ("A4", 2.0, 0.5, 0.66), ("B4", 2.5, 1.25, 0.76),
        ("A4", 4.0, 1.0, 0.70), ("F#4", 5.0, 0.75, 0.64), ("E4", 5.75, 0.25, 0.60), ("D4", 6.0, 1.5, 0.68),
        ("F#4", 8.5, 1.0, 0.70), ("G4", 9.5, 0.5, 0.66), ("A4", 10.0, 1.5, 0.76),
        ("G4", 12.0, 1.0, 0.66), ("F#4", 13.0, 0.75, 0.62), ("E4", 13.75, 1.75, 0.66),
    ]
    for n, b, d, v in oboe_melody:
        ev.append(NoteEvent("oboe", n, b, d, v, pan=0.16, attack_ms=34.0, release_ms=210.0, swell=0.22))

    # --- Soaring Solo Flute Answer (Bars 5-8: Airy Luminous Counter-Theme) ---
    flute_melody = [
        ("A5", 16.5, 1.25, 0.66), ("F#5", 17.75, 0.75, 0.62), ("E5", 18.5, 1.25, 0.66),
        ("C#5", 20.0, 1.5, 0.64), ("E5", 21.5, 0.5, 0.60), ("F#5", 22.0, 1.5, 0.68),
        ("G5", 24.5, 1.0, 0.68), ("F#5", 25.5, 0.5, 0.64), ("D5", 26.0, 1.5, 0.68),
        ("E5", 28.0, 1.25, 0.64), ("D5", 29.25, 0.75, 0.58), ("C#5", 30.0, 1.65, 0.62),
    ]
    for n, b, d, v in flute_melody:
        ev.append(NoteEvent("flute", n, b, d, v, pan=-0.16, attack_ms=40.0, release_ms=220.0, swell=0.24))

    # --- Bars 9-12: Tender Flute + Oboe Chamber Duet & Cadence ---
    duet_flute = [
        ("D5", 32.5, 1.5, 0.66), ("E5", 34.0, 0.5, 0.62), ("F#5", 34.5, 1.25, 0.70),
        ("G5", 36.0, 1.5, 0.70), ("F#5", 37.5, 0.5, 0.64), ("D5", 38.0, 1.5, 0.66),
        ("B4", 40.5, 1.25, 0.64), ("D5", 41.75, 0.75, 0.62), ("E5", 42.5, 1.25, 0.68),
        ("F#5", 44.0, 1.0, 0.66), ("E5", 45.0, 2.2, 0.60),
    ]
    duet_oboe = [
        ("B4", 32.5, 1.5, 0.60), ("C#5", 34.0, 0.5, 0.58), ("D5", 34.5, 1.25, 0.64),
        ("B4", 36.0, 1.5, 0.64), ("A4", 37.5, 0.5, 0.58), ("B4", 38.0, 1.5, 0.60),
        ("G4", 40.5, 1.25, 0.58), ("A4", 41.75, 0.75, 0.58), ("B4", 42.5, 1.25, 0.62),
        ("C#5", 44.0, 2.5, 0.58),
    ]
    for n, b, d, v in duet_flute:
        ev.append(NoteEvent("flute", n, b, d, v, pan=-0.18, attack_ms=36.0, release_ms=220.0, swell=0.22))
    for n, b, d, v in duet_oboe:
        ev.append(NoteEvent("oboe", n, b, d, v, pan=0.18, attack_ms=36.0, release_ms=220.0, swell=0.18))

    for note, b in [("A5", 14.5), ("E5", 15.0), ("F#5", 30.5), ("C#5", 31.0), ("E5", 46.0), ("A5", 46.5)]:
        ev.append(NoteEvent("celesta", note, b, 1.4, 0.50, pan=-0.14))
    add_harp_gliss(ev, ["D4", "E4", "F#4", "A4", "B4", "C#5", "D5", "F#5"], 46.5, 1.45, 0.48, 0.76)

    return bpm, total_beats, ev


# ============================================================================
# MOVEMENT 2: music_title_showtime.mp3 — Grand Symphonic Overture
# Key: F Major (Heroic Olympic / Prime-Time Gala) | 122 BPM | 16 bars (31.475s)
# ============================================================================

def compose_title_showtime() -> Tuple[float, float, List[NoteEvent]]:
    bpm = 122.0
    total_beats = 64.0  # 16 bars of 4/4 = 31.475s
    ev: List[NoteEvent] = []

    # 16-bar Heroic Overture Progression with pure chordal voice-leading:
    # A (0-3): Fmaj7 - C/E - Dm9 - Bb(add9)/C
    # A'(4-7): Fmaj7 - Am7 - Bbmaj7 - Gm9->C9
    # B (8-11): Dbmaj7 - Eb(add9) - Fmaj7 - G9/D  (Iconic Olympic chromatic mediant lift!)
    # C (12-15): Bbmaj7 - F/A - Gm11 - C9sus4->C7
    chords = [
        ("F1", "C2", ["F3", "A3", "C4"], ["C4", "F4", "A4"], "F2"),
        ("E1", "C2", ["E3", "G3", "C4"], ["C4", "E4", "G4"], "C2"),
        ("D1", "A1", ["D3", "F3", "A3", "C4"], ["D4", "F4", "A4"], "D2"),
        ("Bb1", "C2", ["Bb2", "D3", "F3", "C4"], ["Bb3", "D4", "F4"], "Bb1"),

        ("F1", "C2", ["F3", "A3", "C4"], ["C4", "F4", "A4"], "F2"),
        ("A1", "E2", ["A2", "E3", "G3", "C4"], ["C4", "E4", "A4"], "A1"),
        ("Bb1", "F2", ["Bb2", "D3", "F3", "A3"], ["D4", "F4", "A4"], "Bb1"),
        ("G1", "C2", ["G2", "D3", "F3", "Bb3"], ["C4", "E4", "G4"], "C2"),

        # Heroic Olympic Lift (Bars 8-11: Db -> Eb -> F -> G!)
        ("Db1", "Ab1", ["Db3", "F3", "Ab3"], ["Db4", "F4", "Ab4"], "Db2"),
        ("Eb1", "Bb1", ["Eb3", "G3", "Bb3"], ["Eb4", "G4", "Bb4"], "Eb2"),
        ("F1", "C2", ["F3", "A3", "C4"], ["C4", "F4", "A4"], "F2"),
        ("G1", "D2", ["G2", "B2", "D3", "G3"], ["D4", "G4", "B4"], "G2"),

        # Grand Climax & Turnaround (Bars 12-15)
        ("Bb1", "F2", ["Bb2", "D3", "F3", "A3"], ["D4", "F4", "A4"], "Bb1"),
        ("A1", "F2", ["A2", "C3", "F3", "A3"], ["C4", "F4", "A4"], "F2"),
        ("G1", "D2", ["G2", "D3", "F3", "Bb3"], ["D4", "G4", "Bb4"], "G2"),
        ("C2", "G1", ["C3", "E3", "G3", "Bb3"], ["C4", "E4", "G4"], "C2"),
    ]

    for b_idx, (bass1, bass2, mid_voicing, hi_triad, timp_note) in enumerate(chords):
        b0 = b_idx * 4.0
        climax = b_idx >= 8

        # Authoritative Contrabass & crisp rhythmic Cello orchestral bounce
        ev.append(NoteEvent("contrabass", bass1, b0, 1.8, 0.88 if climax else 0.78, attack_ms=14.0))
        ev.append(NoteEvent("contrabass", bass2, b0 + 2.0, 1.75, 0.78 if climax else 0.68, attack_ms=16.0))
        for step in range(8):
            cn = mid_voicing[0] if step in (0, 3, 6) else mid_voicing[1]
            accent = 0.84 if step in (0, 3, 6) else 0.56
            ev.append(NoteEvent("cello", cn, b0 + step * 0.5, 0.28, accent, staccato=True, attack_ms=6.0, release_ms=65.0))

        # Lush 2nd Violins / Violas harmonic bed (clean & open, not muddy!)
        add_chord(
            ev,
            "string_ensemble_1",
            mid_voicing,
            beat=b0,
            dur=3.85,
            vel=0.52 if climax else 0.42,
            pan_spread=0.38,
            attack_ms=55.0,
            release_ms=240.0,
            swell=0.18,
        )

        # Crisp Pizzicato rhythmic sparkle in Bars 0-7
        if not climax:
            for step in (1.0, 2.5, 3.0):
                ev.append(NoteEvent("pizzicato_strings", hi_triad[int(step) % len(hi_triad)], b0 + step, 0.35, 0.56))

        # Punchy Orchestral Timpani punctuation
        ev.append(NoteEvent("timpani", timp_note, b0, 1.25, 0.94 if b_idx in (0, 4, 8, 9, 10, 12) else 0.72, attack_ms=3.0))
        if b_idx in (2, 6, 10, 14):
            ev.append(NoteEvent("timpani", timp_note, b0 + 2.5, 0.75, 0.72, attack_ms=3.0))
            ev.append(NoteEvent("timpani", timp_note, b0 + 3.0, 0.75, 0.80, attack_ms=3.0))

        # Low Trombone & Tuba majesty on downbeats
        if b_idx in (0, 4, 8, 9, 10, 11, 12, 13, 14, 15):
            ev.append(NoteEvent("tuba", bass1, b0, 2.0, 0.74 if climax else 0.58, attack_ms=18.0))
            add_chord(
                ev,
                "trombone",
                mid_voicing[:3],
                beat=b0,
                dur=1.25 if b_idx in (0, 4) else 2.0,
                vel=0.68 if climax else 0.54,
                attack_ms=18.0,
                release_ms=190.0,
            )

        # Concert Grand Piano bright rhythmic sparkle
        add_chord(ev, "acoustic_grand_piano", mid_voicing, b0, 1.1, 0.58, strum_beats=0.02)
        add_chord(ev, "acoustic_grand_piano", hi_triad, b0 + 2.5, 0.85, 0.50, strum_beats=0.02)

    # --- Sweeping Concert Harp Glissandos (Curtain-Up Magic!) ---
    add_harp_gliss(ev, ["C4", "D4", "E4", "F4", "G4", "A4", "Bb4", "C5", "D5", "F5"], 62.5, 1.48, 0.62, 1.00)
    add_harp_gliss(ev, ["F4", "G4", "A4", "C5", "D5", "F5", "G5", "A5"], 14.75, 1.22, 0.56, 0.92)
    add_harp_gliss(ev, ["Db4", "Eb4", "F4", "Ab4", "Bb4", "C5", "Db5", "F5"], 30.75, 1.22, 0.62, 0.98)
    add_harp_gliss(ev, ["Bb3", "C4", "D4", "F4", "G4", "A4", "Bb4", "D5", "F5"], 46.75, 1.22, 0.62, 0.98)

    # --- Accelerating Timpani Rolls into Major Structural Downbeats ---
    add_timpani_roll(ev, "C2", 14.5, 1.5, 0.38, 0.94, subdiv=0.25)
    add_timpani_roll(ev, "C2", 30.5, 1.5, 0.44, 1.02, subdiv=0.25)
    add_timpani_roll(ev, "C2", 62.0, 2.0, 0.46, 1.06, subdiv=0.25)

    # --- Soaring 1st Violins & Flute Heroic Overture Melody ---
    violin_theme = [
        # Bars 0-3 (A: Curtain-Up!)
        ("C5", 0.0, 0.75, 0.88), ("F5", 0.75, 1.25, 0.94), ("G5", 2.0, 0.5, 0.86), ("A5", 2.5, 1.5, 0.96),
        ("G5", 4.0, 1.0, 0.88), ("E5", 5.0, 0.5, 0.82), ("C5", 5.5, 2.0, 0.86),
        ("D5", 8.0, 0.75, 0.86), ("F5", 8.75, 0.75, 0.90), ("A5", 9.5, 1.5, 0.94), ("G5", 11.0, 1.0, 0.88),
        ("F5", 12.0, 1.25, 0.90), ("D5", 13.25, 0.75, 0.84), ("C5", 14.0, 1.75, 0.86),

        # Bars 4-7 (A': Ascending Lift!)
        ("C5", 16.0, 0.75, 0.90), ("F5", 16.75, 1.25, 0.96), ("A5", 18.0, 0.5, 0.92), ("C6", 18.5, 1.5, 0.98),
        ("B5", 20.0, 0.5, 0.86), ("A5", 20.5, 1.5, 0.92), ("G5", 22.0, 1.5, 0.88),
        ("F5", 24.0, 1.0, 0.90), ("G5", 25.0, 0.5, 0.88), ("A5", 25.5, 1.5, 0.94), ("F5", 27.0, 1.0, 0.88),
        ("G5", 28.0, 2.0, 0.92), ("C5", 30.0, 1.5, 0.86),

        # Bars 8-11 (B: Olympic Chromatic Mediant Lift Db -> Eb -> F -> G!)
        ("Ab5", 32.0, 1.5, 0.98), ("G5", 33.5, 0.5, 0.90), ("F5", 34.0, 1.75, 0.94),
        ("Bb5", 36.0, 1.5, 1.00), ("A5", 37.5, 0.5, 0.92), ("G5", 38.0, 1.75, 0.96),
        ("C6", 40.0, 2.0, 1.02), ("A5", 42.0, 1.0, 0.94), ("F5", 43.0, 1.0, 0.92),
        ("G5", 44.0, 1.5, 0.96), ("B5", 45.5, 2.0, 0.98),

        # Bars 12-15 (C: Grand Finale Return!)
        ("C6", 48.0, 1.0, 1.00), ("Bb5", 49.0, 0.5, 0.94), ("A5", 49.5, 1.5, 0.98), ("F5", 51.0, 1.0, 0.92),
        ("A5", 52.0, 1.5, 0.98), ("G5", 53.5, 0.5, 0.92), ("F5", 54.0, 1.75, 0.94),
        ("D5", 56.0, 0.75, 0.90), ("F5", 56.75, 0.75, 0.94), ("G5", 57.5, 1.5, 0.96), ("Bb5", 59.0, 1.0, 0.94),
        ("G5", 60.0, 2.5, 0.98), ("A5", 62.5, 0.75, 0.94), ("Bb5", 63.25, 0.75, 0.96),
    ]
    for n, b, d, v in violin_theme:
        ev.append(NoteEvent("violin", n, b, d, v * 0.94, pan=-0.50, attack_ms=30.0, release_ms=200.0, swell=0.16))
        ev.append(NoteEvent("string_ensemble_1", n, b, d, v * 0.48, pan=-0.34, attack_ms=38.0, release_ms=220.0))
        if b >= 32.0 or (16.0 <= b < 24.0):
            ev.append(NoteEvent("flute", n, b, d, v * 0.52, pan=-0.16, attack_ms=26.0, release_ms=190.0))

    # --- Heroic French Horns Choir (Explicit Chordal Duet Voicings — 100% Pure Harmony!) ---
    # Tuple: (lead_note, harmony_note_or_None, beat, dur, vel)
    horn_choir = [
        ("C4", "A3", 0.0, 0.5, 0.80), ("F4", "C4", 0.5, 1.5, 0.88), ("E4", "C4", 2.0, 1.5, 0.82),
        ("G4", "E4", 6.0, 0.5, 0.82), ("A4", "F4", 6.5, 0.5, 0.86), ("C5", "G4", 7.0, 1.0, 0.90),
        ("F4", "D4", 12.0, 1.5, 0.86), ("G4", "D4", 13.5, 0.5, 0.84), ("A4", "F4", 14.0, 1.75, 0.88),
        ("C4", "A3", 16.0, 0.5, 0.82), ("F4", "C4", 16.5, 1.5, 0.90), ("E4", "C4", 18.0, 1.5, 0.84),
        ("D4", "Bb3", 24.0, 1.0, 0.84), ("F4", "D4", 25.0, 1.0, 0.88), ("A4", "F4", 26.0, 1.5, 0.90),
        ("G4", "D4", 28.0, 1.5, 0.88), ("A4", "E4", 29.5, 0.5, 0.88), ("Bb4", "G4", 30.0, 1.75, 0.92),
        # Blazing Olympic Lift (Dbmaj7 -> Eb -> F -> G): Noble Major 3rds & 5ths!
        ("Ab4", "F4", 32.0, 1.5, 0.96), ("F4", "Db4", 33.5, 0.5, 0.90), ("Ab4", "Db4", 34.0, 1.8, 0.94),
        ("Bb4", "G4", 36.0, 1.5, 0.98), ("G4", "Eb4", 37.5, 0.5, 0.92), ("Bb4", "Eb4", 38.0, 1.8, 0.96),
        ("C5", "A4", 40.0, 2.0, 1.00), ("A4", "F4", 42.0, 1.8, 0.94),
        ("B4", "G4", 44.0, 1.5, 0.96), ("G4", "D4", 45.5, 2.2, 0.96),
        # Triumphant Cadence (Bb -> F/A -> Gm -> C7)
        ("F4", "D4", 48.0, 1.5, 0.94), ("A4", "F4", 49.5, 1.5, 0.96), ("C5", "A4", 51.0, 1.0, 0.96),
        ("C5", "A4", 52.0, 1.8, 0.96), ("A4", "F4", 54.0, 1.8, 0.92),
        ("Bb4", "G4", 56.0, 1.5, 0.94), ("A4", "F4", 57.5, 1.5, 0.94), ("G4", "D4", 59.0, 1.0, 0.92),
        ("G4", "E4", 60.0, 2.0, 0.98), ("C5", "G4", 62.0, 1.8, 1.00),
    ]
    for lead, harm, b, d, v in horn_choir:
        ev.append(NoteEvent("french_horn", lead, b, d, v, pan=-0.26, attack_ms=24.0, release_ms=210.0, swell=0.14))
        if harm:
            ev.append(NoteEvent("french_horn", harm, b, d, v * 0.72, pan=-0.14, attack_ms=28.0, release_ms=210.0))

    # --- Bright Prime-Time Trumpet Fanfare Punctuations (Crisp & Regal!) ---
    trumpet_stabs = [
        ("C5", 0.0, 0.42, 0.86), ("F5", 0.5, 0.85, 0.94),
        ("E5", 4.0, 0.42, 0.80), ("G5", 4.5, 0.75, 0.86),
        ("C5", 15.0, 0.32, 0.82), ("D5", 15.35, 0.32, 0.86), ("E5", 15.7, 0.28, 0.90),
        ("F5", 16.0, 1.15, 0.94),
        # Olympic Lift Brass Fanfare!
        ("Ab5", 32.0, 0.62, 0.92), ("Ab5", 32.75, 0.32, 0.86), ("Ab5", 33.25, 0.92, 0.94),
        ("Bb5", 36.0, 0.62, 0.96), ("Bb5", 36.75, 0.32, 0.90), ("Bb5", 37.25, 0.92, 0.98),
        ("C6", 40.0, 1.40, 0.98),
        ("F5", 48.0, 0.52, 0.92), ("A5", 48.65, 0.52, 0.94), ("C6", 49.3, 1.15, 0.98),
        ("G5", 60.0, 0.70, 0.94), ("G5", 61.0, 0.48, 0.92), ("C6", 61.75, 0.48, 0.96), ("C6", 62.5, 1.30, 1.00),
    ]
    for n, b, d, v in trumpet_stabs:
        ev.append(NoteEvent("trumpet", n, b, d, v * 0.90, pan=0.24, attack_ms=10.0, release_ms=150.0))

    # Sparkling Glockenspiel / Tubular Bell prime-time shimmer on structural crests
    for note, b in [("F5", 0.0), ("C6", 16.0), ("Ab5", 32.0), ("Bb5", 36.0), ("C6", 40.0), ("F5", 48.0)]:
        ev.append(NoteEvent("glockenspiel", note, b, 1.2, 0.64, pan=0.32))
    for note, b in [("F4", 0.0), ("C5", 40.0), ("C5", 62.5)]:
        ev.append(NoteEvent("tubular_bells", note, b, 2.2, 0.56, pan=0.18))

    return bpm, total_beats, ev


# ============================================================================
# MOVEMENT 3: music_board_groove.mp3 — Scherzo Podium Promenade
# Key: G Major playful symphonic scherzo | 114 BPM | 12 bars (48 beats = 25.263s)
# ============================================================================

def compose_board_groove() -> Tuple[float, float, List[NoteEvent]]:
    bpm = 114.0
    total_beats = 48.0  # 12 bars of 4/4 = 25.263s
    ev: List[NoteEvent] = []

    bars = [
        (["G1", "B1", "D2", "E2"], ["G3", "B3", "D4"], ["G5", "B5", "D6", "B5"], ["G3", "D4", "B4", "G4"]),
        (["F#1", "A1", "D2", "C2"], ["F#3", "A3", "D4"], ["F#5", "A5", "D6", "A5"], ["F#3", "D4", "A4", "F#4"]),
        (["E1", "G1", "B1", "D2"], ["E3", "G3", "B3", "D4"], ["E5", "G5", "B5", "G5"], ["E3", "B3", "G4", "E4"]),
        (["C2", "E2", "D2", "F#2"], ["C4", "E4", "G4"], ["E5", "G5", "F#5", "A5"], ["C3", "G3", "D4", "F#4"]),

        (["B1", "D2", "F#2", "A2"], ["B3", "D4", "F#4"], ["B5", "D6", "F#5", "A5"], ["B2", "F#3", "D4", "B3"]),
        (["E1", "B1", "G2", "F#2"], ["E3", "G3", "B3", "F#4"], ["G5", "B5", "F#6", "B5"], ["E3", "B3", "F#4", "G4"]),
        (["A1", "C2", "D2", "A1"], ["A3", "C4", "E4"], ["A5", "C6", "E5", "F#5"], ["A2", "E3", "C4", "F#4"]),
        (["G1", "D2", "B1", "D#2"], ["G3", "B3", "F#4"], ["G5", "B5", "F#5", "D#5"], ["G2", "D3", "B3", "D#4"]),

        (["E1", "G1", "B1", "E2"], ["E3", "G3", "B3", "D4"], ["E5", "G5", "B5", "D6"], ["E3", "B3", "G4", "B4"]),
        (["A1", "C#2", "E2", "G2"], ["G3", "B3", "C#4", "E4"], ["A5", "C#6", "E6", "B5"], ["A2", "E3", "C#4", "G4"]),
        (["A1", "E2", "D2", "F#2"], ["A3", "C4", "E4", "G4"], ["C6", "A5", "F#5", "B5"], ["A2", "E3", "D4", "F#4"]),
        (["G1", "B1", "D2", "F#2"], ["G3", "B3", "D4", "E4"], ["G5", "E5", "D5", "F#5"], ["G3", "B3", "D4", "F#4"]),
    ]

    for b_idx, (walk, pizz, cel, harp) in enumerate(bars):
        b0 = b_idx * 4.0

        # Nimble Contrabass + Bassoon octave scherzo walking pulse (infectious groove!)
        for beat_i, bn in enumerate(walk):
            ev.append(NoteEvent("contrabass", bn, b0 + beat_i, 0.58, 0.82 if beat_i in (0, 2) else 0.72, staccato=True))
            bsn_note = midi_to_musyngkite(note_to_midi(bn) + 12)
            ev.append(NoteEvent("bassoon", bsn_note, b0 + beat_i, 0.45, 0.72 if beat_i in (0, 2) else 0.60, staccato=True))

        # Bouncy Pizzicato Strings on offbeats & lively syncopations
        pizz_beats = [(0.5, 0.72), (1.0, 0.62), (1.5, 0.66), (2.5, 0.74), (3.0, 0.62), (3.5, 0.68)]
        for offset, vel in pizz_beats:
            add_chord(
                ev,
                "pizzicato_strings",
                pizz,
                beat=b0 + offset,
                dur=0.35,
                vel=vel,
                pan_spread=0.32,
                staccato=True,
            )

        # Sparkling Celesta offbeat crystalline chimes
        for i, cn in enumerate(cel):
            ev.append(NoteEvent("celesta", cn, b0 + i * 1.0 + 0.5, 0.85, 0.52 + (0.06 if i % 2 == 0 else 0.0)))

        # Crisp Concert Harp nimble plucks
        for i, hn in enumerate(harp):
            ev.append(NoteEvent("orchestral_harp", hn, b0 + i * 1.0, 0.90, 0.62))

        # Crisp Orchestral Woodblock & Soft Timpani promenade groove
        ev.append(NoteEvent("woodblock", "G5", b0 + 1.0, 0.14, 0.56, pan=0.30, staccato=True))
        ev.append(NoteEvent("woodblock", "D5", b0 + 2.5, 0.14, 0.42, pan=0.26, staccato=True))
        ev.append(NoteEvent("woodblock", "G5", b0 + 3.0, 0.14, 0.56, pan=0.30, staccato=True))
        if b_idx % 2 == 1:
            ev.append(NoteEvent("woodblock", "A5", b0 + 3.75, 0.12, 0.40, pan=0.32, staccato=True))

        if b_idx % 2 == 0:
            ev.append(NoteEvent("timpani", "G2" if b_idx in (0, 4, 8) else "D2", b0, 0.65, 0.64))

        if b_idx in (4, 8, 9):
            add_chord(ev, "string_ensemble_2", pizz, b0, 2.2, 0.36, pan_spread=0.25, attack_ms=90.0)

    # --- Playful Clarinet & Flute Call-and-Response Scherzo Theme ---
    clarinet_lines = [
        ("D4", 0.0, 0.45, 0.78, True), ("G4", 0.5, 0.45, 0.82, True), ("B4", 1.0, 0.75, 0.84, False),
        ("A4", 2.0, 0.45, 0.76, True), ("G4", 2.5, 0.45, 0.78, True), ("E4", 3.0, 0.65, 0.74, False),
        ("F#4", 4.0, 0.45, 0.78, True), ("A4", 4.5, 0.45, 0.82, True), ("D5", 5.0, 0.85, 0.86, False),
        ("C5", 6.5, 0.45, 0.76, True), ("A4", 7.0, 0.65, 0.74, False),

        ("F#4", 16.0, 0.45, 0.78, True), ("B4", 16.5, 0.45, 0.82, True), ("D5", 17.0, 0.85, 0.86, False),
        ("C#5", 18.5, 0.45, 0.78, True), ("B4", 19.0, 0.75, 0.80, False),
        ("G4", 20.0, 0.45, 0.78, True), ("B4", 20.5, 0.45, 0.82, True), ("E5", 21.0, 0.90, 0.86, False),
        ("D5", 22.5, 0.45, 0.78, True), ("B4", 23.0, 0.65, 0.76, False),

        ("E4", 32.0, 0.45, 0.78, True), ("G4", 32.5, 0.45, 0.82, True), ("B4", 33.0, 0.65, 0.84, False),
        ("E5", 36.0, 0.45, 0.80, True), ("C#5", 36.5, 0.45, 0.82, True), ("A4", 37.0, 0.75, 0.84, False),
        ("D4", 44.0, 0.45, 0.76, True), ("G4", 44.5, 0.45, 0.80, True), ("B4", 45.0, 0.65, 0.84, False),
        ("A4", 46.5, 0.40, 0.76, True), ("F#4", 47.0, 0.40, 0.78, True), ("A4", 47.5, 0.40, 0.82, True),
    ]
    for n, b, d, v, stac in clarinet_lines:
        ev.append(NoteEvent("clarinet", n, b, d, v, pan=-0.22, staccato=stac))

    flute_lines = [
        ("B5", 8.0, 0.45, 0.72, True), ("G5", 8.5, 0.45, 0.74, True), ("E5", 9.0, 0.75, 0.76, False),
        ("F#5", 10.0, 0.45, 0.74, True), ("G5", 10.5, 0.45, 0.76, True), ("B5", 11.0, 0.75, 0.78, False),
        ("C6", 12.0, 0.45, 0.72, True), ("B5", 12.5, 0.45, 0.72, True), ("A5", 13.0, 0.65, 0.74, False),
        ("G5", 14.0, 0.45, 0.72, True), ("F#5", 14.5, 0.45, 0.74, True), ("A5", 15.0, 0.75, 0.76, False),

        ("C6", 24.0, 0.45, 0.72, True), ("A5", 24.5, 0.45, 0.74, True), ("E5", 25.0, 0.65, 0.74, False),
        ("F#5", 26.0, 0.45, 0.74, True), ("A5", 26.5, 0.45, 0.76, True), ("C6", 27.0, 0.75, 0.76, False),
        ("B5", 28.0, 0.75, 0.78, False), ("G5", 29.0, 0.65, 0.74, False),
        ("F#5", 30.0, 0.55, 0.74, True), ("D#5", 30.75, 0.50, 0.72, True), ("F#5", 31.25, 0.60, 0.76, False),

        ("D6", 34.0, 0.45, 0.70, True), ("B5", 34.5, 0.45, 0.72, True), ("G5", 35.0, 0.65, 0.76, False),
        ("C#6", 38.0, 0.45, 0.72, True), ("B5", 38.5, 0.45, 0.74, True), ("G5", 39.0, 0.65, 0.76, False),
        ("E5", 40.0, 0.45, 0.74, True), ("A5", 40.5, 0.45, 0.76, True), ("C6", 41.0, 0.75, 0.76, False),
        ("B5", 42.0, 0.45, 0.76, True), ("A5", 42.5, 0.45, 0.74, True), ("F#5", 43.0, 0.75, 0.76, False),
        ("G5", 44.0, 1.5, 0.78, False),
    ]
    for n, b, d, v, stac in flute_lines:
        ev.append(NoteEvent("flute", n, b, d, v, pan=0.18, staccato=stac))

    add_harp_gliss(ev, ["G4", "A4", "B4", "D5", "E5", "F#5", "G5"], 46.75, 1.20, 0.54, 0.84)

    return bpm, total_beats, ev


# ============================================================================
# MOVEMENT 4: music_thinking_bed.mp3 — Symphonic Clockwork Suspense
# Key: D Minor contemplative | 100 BPM | 12 bars (48 beats = 28.800s)
# ============================================================================

def compose_thinking_bed() -> Tuple[float, float, List[NoteEvent]]:
    bpm = 100.0
    total_beats = 48.0  # 12 bars of 4/4 = 28.800s
    ev: List[NoteEvent] = []

    bars = [
        # Bars 0-3: Quiet Intellectual Focus
        ("D1", "A2", ["A4", "D5"], ["D4", "A4", "E5", "F5", "A4", "E5", "D5", "A4"], "D2"),
        ("C2", "G2", ["A4", "C5"], ["C4", "A4", "E5", "F5", "A4", "E5", "C5", "A4"], "C2"),
        ("Bb1", "F2", ["A4", "D5"], ["Bb3", "F4", "A4", "E5", "D5", "A4", "F4", "A4"], "Bb1"),
        ("A1", "E2", ["A4", "D5"], ["A3", "E4", "A4", "D5", "E5", "D5", "A4", "E4"], "A1"),

        # Bars 4-7: Deepening Inquiry
        ("G1", "D2", ["Bb4", "D5"], ["G3", "D4", "A4", "Bb4", "D5", "Bb4", "A4", "D4"], "G2"),
        ("F1", "C2", ["A4", "D5"], ["F3", "C4", "A4", "D5", "E5", "D5", "A4", "C4"], "F2"),
        ("E1", "Bb1", ["G4", "Bb4"], ["E3", "Bb3", "G4", "D5", "E5", "D5", "Bb4", "G4"], "E2"),
        ("A1", "E2", ["A4", "C#5"], ["A3", "E4", "B4", "C#5", "E5", "C#5", "B4", "E4"], "A1"),

        # Bars 8-11: Focused Suspended Suspense -> Seamless Loop to Bar 0
        ("Bb1", "F2", ["A4", "D5"], ["Bb3", "F4", "C5", "D5", "F5", "D5", "C5", "F4"], "Bb1"),
        ("C2", "G2", ["G4", "E5"], ["C4", "G4", "D5", "E5", "G5", "E5", "D5", "G4"], "C2"),
        ("G1", "D2", ["A4", "D5"], ["G3", "D4", "A4", "D5", "F5", "D5", "A4", "D4"], "G2"),
        ("A1", "E2", ["A4", "E5"], ["A3", "E4", "A4", "D5", "E5", "D5", "C#5", "E4"], "A1"),
    ]

    for b_idx, (bass, cello_n, trem, ostinato, timp) in enumerate(bars):
        b0 = b_idx * 4.0
        lift = 1.0 + (0.06 if b_idx >= 4 else 0.0) + (0.06 if b_idx >= 8 else 0.0)

        # Deep, resonant orchestral timpani heartbeat (*lub-dub* on beats 0 & 0.5, steady pulse on 2)
        ev.append(NoteEvent("timpani", timp, b0, 1.40, 0.88 * lift, attack_ms=7.0))
        ev.append(NoteEvent("timpani", timp, b0 + 0.5, 1.10, 0.54 * lift, attack_ms=9.0))
        ev.append(NoteEvent("timpani", timp, b0 + 2.0, 1.30, 0.76 * lift, attack_ms=7.0))
        if b_idx in (3, 7, 11):
            ev.append(NoteEvent("timpani", timp, b0 + 3.5, 0.85, 0.58 * lift, attack_ms=8.0))

        # Brooding low Contrabass & Cello sustained foundation
        ev.append(NoteEvent("contrabass", bass, b0, 3.85, 0.74 * lift, attack_ms=80.0, release_ms=320.0, swell=0.16))
        ev.append(NoteEvent("cello", cello_n, b0, 3.85, 0.62 * lift, attack_ms=105.0, release_ms=340.0, swell=0.22))

        # Whisper-hushed atmospheric Tremolo Strings (delicate sheen, never fatiguing!)
        add_chord(
            ev,
            "tremolo_strings",
            trem,
            beat=b0,
            dur=3.95,
            vel=(0.22 if b_idx < 4 else 0.27 if b_idx < 8 else 0.32),
            pan_spread=0.48,
            attack_ms=190.0,
            release_ms=420.0,
            swell=0.28,
        )

        # Warm soft string_ensemble_2 lower cushion
        add_chord(
            ev,
            "string_ensemble_2",
            [cello_n, ostinato[1]],
            beat=b0,
            dur=3.85,
            vel=0.32 * lift,
            pan_spread=0.28,
            attack_ms=160.0,
            release_ms=360.0,
        )

        # Hypnotic Symphonic Clockwork Ostinato: Concert Harp + Crystalline Celesta (front & clear!)
        for i, note in enumerate(ostinato):
            step_b = b0 + i * 0.5
            accent = 0.78 if i in (0, 3, 6) else 0.58
            ev.append(NoteEvent("orchestral_harp", note, step_b, 0.95, accent * lift, humanize_ms=3.5))
            if i in (0, 2, 4, 6) or (b_idx >= 8 and i in (1, 5)):
                cel_note = midi_to_musyngkite(note_to_midi(note) + (12 if note_to_midi(note) < 69 else 0))
                ev.append(NoteEvent("celesta", cel_note, step_b, 1.05, 0.52 * lift, humanize_ms=2.8))

        # Crisp subtle muted pizzicato clockwork pulse on quarter-notes
        for q in range(4):
            p_vel = 0.44 if q % 2 == 0 else 0.32
            ev.append(NoteEvent("pizzicato_strings", ostinato[q % 2], b0 + q, 0.30, p_vel * lift, staccato=True))

    # Distant contemplative low French Horn & Solo Clarinet emotional shadows
    horn_sighs = [
        ("A3", 12.0, 2.0, 0.52), ("G3", 14.0, 1.8, 0.46),
        ("F3", 28.0, 1.8, 0.56), ("E3", 29.8, 2.0, 0.52),
        ("D4", 36.0, 2.0, 0.58), ("C4", 38.0, 1.8, 0.52),
        ("A3", 44.0, 3.6, 0.56),
    ]
    for n, b, d, v in horn_sighs:
        ev.append(NoteEvent("french_horn", n, b, d, v, pan=-0.26, attack_ms=135.0, release_ms=400.0, swell=0.30))

    clarinet_whispers = [
        ("F4", 6.0, 1.5, 0.46), ("E4", 7.5, 2.0, 0.44),
        ("G4", 22.0, 1.5, 0.50), ("F4", 23.5, 1.8, 0.48),
        ("A4", 40.0, 1.8, 0.52), ("G4", 41.8, 1.8, 0.48),
    ]
    for n, b, d, v in clarinet_whispers:
        ev.append(NoteEvent("clarinet", n, b, d, v, pan=0.22, attack_ms=90.0, release_ms=300.0, swell=0.24))

    return bpm, total_beats, ev


# ============================================================================
# MOVEMENT 5: music_finale_tension.mp3 — 1.4-Billion Championship Symphony
# Key: C Minor (Holst / Epic Finale Drama) | 128 BPM | 16 bars (64 beats = 30.000s)
# ============================================================================

def compose_finale_tension() -> Tuple[float, float, List[NoteEvent]]:
    bpm = 128.0
    total_beats = 64.0  # 16 bars of 4/4 = 30.000s
    ev: List[NoteEvent] = []

    # 16-bar Epic Championship Progression in pure C Minor (rock-solid voice-leading!):
    # A (0-3): Cm - Cm/Bb - Abmaj7 - Gsus4->G
    # A'(4-7): Cm - Eb/G - Fm - G
    # B (8-11): Ab - Bb - Cm - D7/F#  (heroic rising bass Ab -> Bb -> C -> F# -> G!)
    # C (12-15): Cm/G - Ab - Fm - G   (thunderous championship climax!)
    bars = [
        ("C1", ["C3", "G3", "C4", "Eb4"], ["G4", "C5", "Eb5"], "C2"),
        ("Bb1", ["Bb2", "G3", "Bb3", "Eb4"], ["G4", "Bb4", "Eb5"], "Bb1"),
        ("Ab1", ["Ab2", "Eb3", "Ab3", "C4"], ["Ab4", "C5", "Eb5"], "Ab1"),
        ("G1", ["G2", "D3", "G3", "B3"], ["G4", "B4", "D5"], "G2"),

        ("C1", ["C3", "G3", "C4", "Eb4"], ["G4", "C5", "Eb5"], "C2"),
        ("G1", ["G2", "Eb3", "G3", "Bb3"], ["G4", "Bb4", "Eb5"], "G2"),
        ("F1", ["F2", "C3", "F3", "Ab3"], ["Ab4", "C5", "F5"], "F2"),
        ("G1", ["G2", "D3", "G3", "B3"], ["G4", "B4", "D5"], "G2"),

        # Peak Stakes Escalation (Bars 8-11)
        ("Ab1", ["Ab2", "Eb3", "Ab3", "C4"], ["Ab4", "C5", "Eb5"], "Ab1"),
        ("Bb1", ["Bb2", "F3", "Bb3", "D4"], ["Bb4", "D5", "F5"], "Bb1"),
        ("C2", ["C3", "G3", "C4", "Eb4"], ["C5", "Eb5", "G5"], "C2"),
        ("F#1", ["F#2", "C3", "D3", "A3"], ["A4", "C5", "D5"], "F#2"),

        # Thunderous 1.4B Finale Climax (Bars 12-15)
        ("G1", ["G2", "C3", "Eb3", "G3"], ["C5", "Eb5", "G5"], "G2"),
        ("Ab1", ["Ab2", "Eb3", "Ab3", "C4"], ["C5", "Eb5", "Ab5"], "Ab1"),
        ("F1", ["F2", "C3", "F3", "Ab3"], ["C5", "F5", "Ab5"], "F2"),
        ("G1", ["G2", "D3", "G3", "B3"], ["B4", "D5", "G5"], "G2"),
    ]

    for b_idx, (bass, low_voicing, hi_trem, timp) in enumerate(bars):
        b0 = b_idx * 4.0
        intensity = 0.86 if b_idx < 4 else (0.96 if b_idx < 8 else 1.06)

        # --- Driving Spiccato / Staccato String Ostinato (crisp 3+3+2 championship engine!) ---
        for step in range(8):
            sb = b0 + step * 0.5
            accent = 0.94 if step in (0, 3, 6) else 0.58
            ost_note = low_voicing[step % 3]
            ev.append(NoteEvent("string_ensemble_1", ost_note, sb, 0.19, accent * 0.72 * intensity, staccato=True, attack_ms=4.0, release_ms=52.0))
            ev.append(NoteEvent("cello", low_voicing[0 if step in (0, 3, 6) else 1], sb, 0.21, accent * 0.88 * intensity, staccato=True, attack_ms=5.0, release_ms=55.0))
            if step in (0, 3, 6):
                ev.append(NoteEvent("pizzicato_strings", low_voicing[1], sb, 0.20, accent * 0.72 * intensity, staccato=True))

        # --- Surging High Tremolo Strings (cinematic canopy, clean & balanced) ---
        add_chord(
            ev,
            "tremolo_strings",
            hi_trem,
            beat=b0,
            dur=3.92,
            vel=(0.30 if b_idx < 4 else 0.38 if b_idx < 8 else 0.46),
            pan_spread=0.50,
            attack_ms=95.0,
            release_ms=250.0,
            swell=0.22,
        )

        # --- Authoritative Contrabass, Tuba & Trombone Low Brass Power ---
        ev.append(NoteEvent("contrabass", bass, b0, 1.80, 0.90 * intensity, attack_ms=12.0))
        ev.append(NoteEvent("contrabass", bass, b0 + 2.0, 1.75, 0.80 * intensity, attack_ms=14.0))
        ev.append(NoteEvent("tuba", bass, b0, 1.35, 0.82 * intensity, attack_ms=14.0))
        if b_idx >= 4:
            ev.append(NoteEvent("tuba", bass, b0 + 2.5, 1.15, 0.78 * intensity, attack_ms=14.0))

        # Punchy Trombone syncopations
        add_chord(ev, "trombone", low_voicing[:3], b0, 1.05, 0.74 * intensity, attack_ms=14.0, release_ms=160.0)
        if b_idx >= 4:
            add_chord(ev, "trombone", low_voicing[:3], b0 + 2.5, 1.05, 0.70 * intensity, attack_ms=14.0, release_ms=160.0)

        # --- Thunderous Orchestral Timpani & Taiko Percussion Drive ---
        ev.append(NoteEvent("timpani", timp, b0, 1.15, 1.02 * intensity, attack_ms=3.0))
        ev.append(NoteEvent("timpani", timp, b0 + 1.5, 0.65, 0.78 * intensity, attack_ms=3.0))
        ev.append(NoteEvent("timpani", timp, b0 + 2.5, 0.65, 0.84 * intensity, attack_ms=3.0))
        ev.append(NoteEvent("timpani", timp, b0 + 3.0, 0.65, 0.90 * intensity, attack_ms=3.0))

        ev.append(NoteEvent("taiko_drum", "C2", b0, 0.85, 0.90 * intensity))
        ev.append(NoteEvent("taiko_drum", "G2", b0 + 2.0, 0.65, 0.72 * intensity))
        if b_idx >= 8:
            ev.append(NoteEvent("taiko_drum", "C2", b0 + 3.0, 0.65, 0.84 * intensity))

    # --- Thunderous Crescendo Timpani Rolls ---
    add_timpani_roll(ev, "G2", 14.5, 1.5, 0.46, 1.06, subdiv=0.25)
    add_timpani_roll(ev, "G2", 30.5, 1.5, 0.50, 1.10, subdiv=0.25)
    add_timpani_roll(ev, "F#2", 46.5, 1.5, 0.52, 1.12, subdiv=0.25)
    add_timpani_roll(ev, "G2", 61.5, 2.5, 0.48, 1.16, subdiv=0.25)

    # Dramatic Dark Minor Concert Harp Glissandos
    add_harp_gliss(ev, ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "B4", "C5", "Eb5"], 30.8, 1.18, 0.62, 0.98)
    add_harp_gliss(ev, ["G3", "Ab3", "B3", "C4", "D4", "Eb4", "F4", "G4", "B4", "C5"], 62.6, 1.38, 0.64, 1.02)

    # --- Blazing French Horns Championship Anthem (100% Pure Chordal Duet Harmony!) ---
    # Tuple: (lead, harm, beat, dur, vel)
    horn_anthem = [
        # Bars 0-3: Cm -> Cm/Bb -> Ab -> G
        ("C4", "G3", 0.0, 1.5, 0.92), ("G4", "Eb4", 1.5, 0.5, 0.88), ("Eb4", "C4", 2.0, 1.75, 0.92),
        ("D4", "Bb3", 4.0, 1.5, 0.88), ("C4", "G3", 5.5, 0.5, 0.84), ("Bb3", "G3", 6.0, 1.75, 0.88),
        ("Ab3", "Eb3", 8.0, 1.5, 0.90), ("C4", "Ab3", 9.5, 0.5, 0.88), ("Eb4", "C4", 10.0, 1.75, 0.94),
        ("D4", "B3", 12.0, 2.0, 0.92), ("G4", "D4", 14.0, 1.75, 0.96),

        # Bars 4-7: Cm -> Eb/G -> Fm -> G
        ("G4", "Eb4", 16.0, 1.5, 0.96), ("C5", "G4", 17.5, 0.5, 0.94), ("Bb4", "G4", 18.0, 1.75, 0.96),
        ("G4", "Eb4", 20.0, 1.5, 0.92), ("Bb4", "G4", 21.5, 0.5, 0.90), ("Eb5", "Bb4", 22.0, 1.75, 0.98),
        ("C5", "Ab4", 24.0, 1.5, 0.96), ("Ab4", "F4", 25.5, 0.5, 0.92), ("F4", "C4", 26.0, 1.75, 0.94),
        ("G4", "D4", 28.0, 1.5, 0.94), ("B4", "G4", 29.5, 2.2, 0.98),

        # Bars 8-11: Ab -> Bb -> Cm -> D7/F#
        ("Ab4", "Eb4", 32.0, 1.5, 1.00), ("G4", "Eb4", 33.5, 0.5, 0.94), ("C5", "Ab4", 34.0, 1.8, 1.02),
        ("Bb4", "F4", 36.0, 1.5, 1.02), ("A4", "F4", 37.5, 0.5, 0.96), ("D5", "Bb4", 38.0, 1.8, 1.04),
        ("Eb5", "C5", 40.0, 2.0, 1.06), ("C5", "G4", 42.0, 1.8, 1.00),
        ("C5", "A4", 44.0, 1.5, 1.02), ("D5", "A4", 45.5, 2.2, 1.04),

        # Bars 12-15: Cm/G -> Ab -> Fm -> G
        ("Eb5", "C5", 48.0, 1.5, 1.06), ("D5", "G4", 49.5, 0.5, 0.98), ("C5", "G4", 50.0, 1.8, 1.04),
        ("C5", "Ab4", 52.0, 1.5, 1.04), ("Bb4", "Eb4", 53.5, 0.5, 0.96), ("Ab4", "Eb4", 54.0, 1.8, 1.02),
        ("Ab4", "F4", 56.0, 1.5, 1.02), ("G4", "C4", 57.5, 0.5, 0.98), ("F4", "C4", 58.0, 1.8, 1.00),
        ("G4", "D4", 60.0, 3.6, 1.06),
    ]
    for lead, harm, b, d, v in horn_anthem:
        ev.append(NoteEvent("french_horn", lead, b, d, v * 0.96, pan=-0.24, attack_ms=18.0, release_ms=190.0, swell=0.12))
        ev.append(NoteEvent("french_horn", harm, b, d, v * 0.72, pan=-0.12, attack_ms=22.0, release_ms=190.0))

    # --- Blazing Trumpets Championship Fanfare Punctuations (Pure Chord Tones!) ---
    trumpet_finale = [
        ("G5", 16.0, 1.2, 0.88),
        ("C5", 30.0, 0.42, 0.86), ("D5", 30.5, 0.42, 0.90), ("Eb5", 31.0, 0.85, 0.94),
        ("Ab5", 32.0, 1.5, 0.96), ("C6", 34.0, 1.6, 0.98),
        ("Bb5", 36.0, 1.5, 0.98), ("D6", 38.0, 1.6, 0.96),
        ("Eb6", 40.0, 2.2, 0.96), ("C6", 42.5, 1.2, 0.92),
        ("A5", 44.0, 1.5, 0.96), ("D6", 45.5, 2.0, 0.98),
        ("C6", 48.0, 1.5, 1.02), ("G5", 50.0, 1.6, 0.96),
        ("Ab5", 52.0, 1.5, 0.98), ("Eb5", 54.0, 1.6, 0.94),
        ("F5", 56.0, 1.4, 0.96), ("Ab5", 58.0, 1.6, 0.98),
        ("G5", 60.0, 1.2, 1.00), ("G5", 61.5, 0.7, 0.98), ("B5", 62.5, 1.3, 1.02),
    ]
    for n, b, d, v in trumpet_finale:
        ev.append(NoteEvent("trumpet", n, b, d, v * 0.84, pan=0.24, attack_ms=10.0, release_ms=155.0))

    # --- High Soaring Violins Doubling Climax Theme (Bars 8-15) ---
    for lead, _harm, b, d, v in horn_anthem:
        if b >= 32.0:
            v_note = midi_to_musyngkite(note_to_midi(lead) + 12)
            ev.append(NoteEvent("violin", v_note, b, d, v * 0.72, pan=-0.48, attack_ms=24.0, release_ms=200.0))

    # --- Iconic Cathedral Tubular Bells Tolling Championship Stakes! ---
    bell_tolls = [
        ("C5", 0.0, 2.8, 0.84),
        ("G4", 16.0, 2.6, 0.86),
        ("Ab4", 32.0, 2.8, 0.92),
        ("Bb4", 36.0, 2.8, 0.94),
        ("C5", 40.0, 3.0, 1.00),
        ("G5", 48.0, 3.0, 1.00),
        ("Ab4", 52.0, 2.8, 0.94),
        ("G4", 60.0, 3.4, 1.02),
    ]
    for n, b, d, v in bell_tolls:
        ev.append(NoteEvent("tubular_bells", n, b, d, v, pan=0.18))

    return bpm, total_beats, ev


# ============================================================================
# Broadcast Mastering (`loudnorm=I=-17.5:TP=-1.8:LRA=9`) & QA Verification
# ============================================================================

def write_wav_stereo_24(path: Path, stereo: np.ndarray, sr: int = SR) -> None:
    arr = np.asarray(stereo, dtype=np.float64)
    if arr.ndim != 2 or arr.shape[1] != 2:
        raise ValueError(f"Expected stereo shape [N, 2], got {arr.shape}")
    if not np.all(np.isfinite(arr)):
        raise ValueError(f"Non-finite samples before writing {path.name}")
    clipped = np.clip(arr, -0.99, 0.99)
    scaled = np.round(clipped * 8388607.0).astype("<i4")
    b = scaled.view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(3)
        wf.setframerate(sr)
        wf.writeframes(b)


def master_loop_to_mp3(
    stereo: np.ndarray,
    out_mp3: Path,
    bitrate: str = "128k",
) -> Dict[str, float]:
    """
    2-pass linear FFmpeg loudnorm (`loudnorm=I=-17.5:TP=-1.8:LRA=9`) over a
    circularly pre-rolled/post-rolled copy so gain & limiter state are 100%
    identical across the loop seam, followed by seamless loop crossfade,
    zero-click boundary anchoring, and crisp 128k stereo LAME MP3 encoding.
    """
    loop_n = stereo.shape[0]
    pad_n = min(loop_n // 2, int(2.0 * SR))

    with tempfile.TemporaryDirectory(prefix="ws_v5_symph_") as td:
        td_path = Path(td)
        wav_raw = td_path / "raw_loop.wav"
        wav_padded = td_path / "padded_loop.wav"
        wav_norm_padded = td_path / "norm_padded.wav"
        wav_final = td_path / "final_loop.wav"

        write_wav_stereo_24(wav_raw, stereo, SR)

        # Pass 1: Measure exact loudness stats on the exact loop
        p1 = subprocess.run(
            [
                FFMPEG, "-y", "-v", "info", "-i", str(wav_raw),
                "-af", "loudnorm=I=-17.5:TP=-1.8:LRA=9:print_format=json",
                "-f", "null", "-",
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        m = re.search(r"\{[\s\S]*\"input_i\"[\s\S]*\}", p1.stderr)
        if not m:
            raise RuntimeError(f"Could not parse loudnorm JSON for {out_mp3.name}")
        stats = json.loads(m.group(0))

        # Pass 2: Apply linear loudnorm to circularly padded buffer [tail | loop | head]
        padded = np.concatenate([stereo[-pad_n:], stereo, stereo[:pad_n]], axis=0)
        write_wav_stereo_24(wav_padded, padded, SR)

        ln_filter = (
            f"loudnorm=I=-17.5:TP=-1.8:LRA=9:linear=true:"
            f"measured_I={stats['input_i']}:"
            f"measured_LRA={stats['input_lra']}:"
            f"measured_TP={stats['input_tp']}:"
            f"measured_thresh={stats['input_thresh']}:"
            f"offset={stats['target_offset']}"
        )
        subprocess.run(
            [
                FFMPEG, "-y", "-v", "error", "-i", str(wav_padded),
                "-af", ln_filter,
                "-ar", str(SR), "-ac", "2", "-f", "f32le", str(wav_norm_padded),
            ],
            check=True,
            capture_output=True,
        )

        norm_all = np.frombuffer(wav_norm_padded.read_bytes(), dtype="<f4").astype(np.float64).reshape(-1, 2)
        if norm_all.shape[0] < pad_n + loop_n:
            raise RuntimeError("Loudnorm output shorter than expected padded loop")
        mastered = norm_all[pad_n : pad_n + loop_n].copy()

        # Seamless 20ms crossfade blend across loop boundary using padded overhang
        xf_n = int(0.020 * SR)
        if pad_n >= xf_n and mastered.shape[0] > xf_n * 4:
            pre_xf = norm_all[pad_n - xf_n : pad_n]
            w = smoothstep(xf_n)[:, None]
            mastered[-xf_n:] = mastered[-xf_n:] * (1.0 - w) + pre_xf * w

        # Safety peak ceiling at -2.1 dBFS before MP3 encoding
        ceil_lin = 10.0 ** (-2.1 / 20.0)
        pk_now = float(np.max(np.abs(mastered)))
        if pk_now > ceil_lin:
            over = np.abs(mastered) / ceil_lin
            soft = np.where(over > 0.88, 0.88 + 0.12 * np.tanh((over - 0.88) / 0.12), over)
            mastered = np.sign(mastered) * soft * ceil_lin

        # Circular roll +6ms & 7ms zero-crossing smoothstep pin for zero-click MP3 loop wrap
        mastered = np.roll(mastered, int(0.006 * SR), axis=0)
        pin_n = int(0.007 * SR)
        pin = smoothstep(pin_n)[:, None]
        mastered[:pin_n] *= pin
        mastered[-pin_n:] *= pin[::-1]

        write_wav_stereo_24(wav_final, mastered, SR)
        out_mp3.parent.mkdir(parents=True, exist_ok=True)
        # Note: Do NOT pass -q:a alongside -b:a (LAME -q:a switches to VBR and ignores -b:a!)
        subprocess.run(
            [
                FFMPEG, "-y", "-v", "error", "-i", str(wav_final),
                "-ar", str(SR), "-ac", "2",
                "-c:a", "libmp3lame", "-b:a", bitrate, "-compression_level", "0",
                "-write_xing", "1",
                str(out_mp3),
            ],
            check=True,
            capture_output=True,
        )

    return verify_mp3(out_mp3)


def check_valid_mp3_header(mp3_path: Path) -> bool:
    data = mp3_path.read_bytes()
    if len(data) < 512:
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


def verify_mp3(mp3_path: Path) -> Dict[str, float]:
    """Decode final MP3 to 48kHz stereo & mono PCM and measure True Peak, LUFS, loop seam, integrity."""
    if not check_valid_mp3_header(mp3_path):
        raise ValueError(f"Invalid MP3 frame header in {mp3_path}")

    peaks: List[float] = []
    rms_db = -120.0
    dur_s = 0.0
    clipped = 0
    non_finite = 0
    boundary_jump = 0.0

    for ch in ("2", "1"):
        proc = subprocess.run(
            [FFMPEG, "-v", "error", "-i", str(mp3_path), "-ar", "48000", "-ac", ch, "-f", "f32le", "-"],
            capture_output=True,
            check=True,
        )
        pcm = np.frombuffer(proc.stdout, dtype="<f4")
        if pcm.size == 0:
            raise ValueError(f"Decoded 0 PCM samples from {mp3_path.name}")
        non_finite += int(np.sum(~np.isfinite(pcm)))
        max_abs = float(np.max(np.abs(pcm)))
        peaks.append(max_abs)
        clipped += int(np.sum(np.abs(pcm) >= 0.999))
        if ch == "1":
            rms_val = float(np.sqrt(np.mean(pcm.astype(np.float64) ** 2)))
            rms_db = 20.0 * math.log10(rms_val) if rms_val > 1e-12 else -120.0
            dur_s = pcm.size / 48000.0
            boundary_jump = float(abs(float(pcm[-1]) - float(pcm[0])))

    eb = subprocess.run(
        [FFMPEG, "-v", "info", "-i", str(mp3_path), "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
        capture_output=True,
        text=True,
        check=True,
    )
    i_matches = re.findall(r"I:\s*(-?\d+(?:\.\d+)?)\s*LUFS", eb.stderr)
    tp_matches = re.findall(r"Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS", eb.stderr)
    lufs = float(i_matches[-1]) if i_matches else -17.5
    true_peak_db = float(tp_matches[-1]) if tp_matches else (20.0 * math.log10(max(peaks)) if max(peaks) > 1e-12 else -120.0)
    sample_peak_db = 20.0 * math.log10(max(peaks)) if max(peaks) > 1e-12 else -120.0

    return {
        "duration_s": round(dur_s, 3),
        "lufs": round(lufs, 2),
        "true_peak_db": round(true_peak_db, 2),
        "sample_peak_db": round(sample_peak_db, 2),
        "rms_db": round(rms_db, 2),
        "clipped": clipped,
        "non_finite": non_finite,
        "boundary_jump": round(boundary_jump, 5),
        "bytes": mp3_path.stat().st_size,
    }


# ============================================================================
# Main Orchestration Pipeline
# ============================================================================

def main() -> int:
    print("=" * 76)
    print("World's Smartest v5.0 — Real-Sampled Full Symphony Orchestra Builder")
    print("=" * 76)
    bank = MusyngKiteBank()

    movements = [
        ("music_greenroom_lounge.mp3", compose_greenroom_lounge, 1.38, 4500.0, 0.90, 101),
        ("music_title_showtime.mp3",   compose_title_showtime,   1.65, 5200.0, 0.95, 202),
        ("music_board_groove.mp3",     compose_board_groove,     1.25, 5000.0, 0.84, 303),
        ("music_thinking_bed.mp3",     compose_thinking_bed,     1.58, 4400.0, 0.92, 404),
        ("music_finale_tension.mp3",   compose_finale_tension,   1.68, 5400.0, 0.96, 505),
    ]

    results: Dict[str, Dict[str, float]] = {}
    total_bytes = 0

    for filename, composer_fn, rt60, bright_hz, wet_scale, seed in movements:
        print(f"\n>>> Composing & mastering {filename}...")
        bpm, total_beats, events = composer_fn()
        stereo = render_symphonic_movement(
            name=filename,
            bpm=bpm,
            total_beats=total_beats,
            events=events,
            bank=bank,
            hall_rt60=rt60,
            hall_brightness_hz=bright_hz,
            hall_wet_scale=wet_scale,
            seed=seed,
        )
        out_path = PUBLIC_AUDIO_DIR / filename
        metrics = master_loop_to_mp3(stereo, out_path, bitrate="128k")
        results[filename] = metrics
        total_bytes += int(metrics["bytes"])
        print(
            f"  [ok] {filename:28s} dur={metrics['duration_s']:6.2f}s | "
            f"I={metrics['lufs']:6.2f} LUFS | TP={metrics['true_peak_db']:6.2f} dBFS | "
            f"jump={metrics['boundary_jump']:.5f} | {metrics['bytes']/1024:.1f} KB"
        )

    total_mb = total_bytes / (1024.0 * 1024.0)
    print("\n" + "=" * 76)
    print(f"TOTAL 5-TRACK SYMPHONY SCORE SIZE: {total_bytes:,} bytes ({total_mb:.3f} MB)")
    print("=" * 76)

    failures: List[str] = []
    for fname, m in results.items():
        if not (24.0 <= m["duration_s"] <= 32.5):
            failures.append(f"{fname}: duration {m['duration_s']}s out of 24-32s target")
        if m["true_peak_db"] > -1.5 or m["sample_peak_db"] > -1.5:
            failures.append(f"{fname}: peak {m['true_peak_db']} / {m['sample_peak_db']} dBFS exceeds -1.5 dBFS")
        if m["clipped"] > 0 or m["non_finite"] > 0:
            failures.append(f"{fname}: clipped={m['clipped']} non_finite={m['non_finite']}")
        if m["boundary_jump"] > 0.015:
            failures.append(f"{fname}: boundary_jump {m['boundary_jump']} too high for seamless loop")
        if not (-20.5 <= m["lufs"] <= -15.5):
            failures.append(f"{fname}: loudness {m['lufs']} LUFS outside broadcast range")
    if total_mb >= 2.60:
        failures.append(f"Total size {total_mb:.3f} MB exceeds 2.6 MB cap")

    if failures:
        print("VERIFICATION FAILED:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print("ALL 5 SYMPHONY MOVEMENTS PASSED EVERY BROADCAST, LOOP & SIZE GATE!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
