#!/usr/bin/env python3
"""
World's Smartest v5.0 — Stage & Story-Branch Real-Instrument Symphonies
=======================================================================
100% REAL RECORDED ACOUSTIC & REGIONAL INSTRUMENTS — ZERO math/sine oscillators!

Fetches & caches authentic recorded MusyngKite SoundFont instrument notes:
  https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/<instrument>-mp3/<Note>.mp3

Composes, humanizes (expressive conductor rubato, Viennese 3/4 waltz lilt,
2 AM triplet swing, asymmetric phrasing, antecedent-consequent motif dialogue,
per-string strum stagger, venue-bespoke stereo convolution acoustics), renders
circularly for zero-click seamless looping, broadcast-masters via imageio_ffmpeg
two-pass EBU R128 (`loudnorm=I=-17.5:TP=-1.8:LRA=9`, `128k` stereo MP3 ~260-350 kB),
and generates `public/data/v5_stage_themes_manifest.json`:

  1. public/assets/audio/themes/theme_stage1_oakridge.mp3   (104 BPM, 4/4, 9 bars)
  2. public/assets/audio/themes/theme_stage3_broadcast.mp3  (120 BPM, 4/4, 10 bars)
  3. public/assets/audio/themes/theme_stage5_london.mp3     (112 BPM, 4/4, 9 bars)
  4. public/assets/audio/themes/theme_stage6_tokyo.mp3      (126 BPM, 5/4, 8 bars)
  5. public/assets/audio/themes/theme_stage7_cairo.mp3      (108 BPM, 4/4 3+3+2, 9 bars)
  6. public/assets/audio/themes/theme_stage8_finale.mp3     (132 BPM, 4/4, 11 bars)
  7. public/assets/audio/themes/theme_branch_redemption.mp3 (88 BPM, 4/4 swing, 7 bars)
  8. public/assets/audio/themes/theme_branch_velvet.mp3     (138 BPM, 3/4 waltz, 15 bars)
"""

from __future__ import annotations

import concurrent.futures
import json
import math
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import wave
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Dict, List, Optional, Sequence, Tuple

import imageio_ffmpeg
import numpy as np
from scipy import signal

# ============================================================================
# Paths, Constants & Acoustic Instrument Calibration
# ============================================================================

REPO_ROOT = Path(__file__).resolve().parent.parent
THEMES_OUT_DIR = REPO_ROOT / "public" / "assets" / "audio" / "themes"
MANIFEST_OUT_PATH = REPO_ROOT / "public" / "data" / "v5_stage_themes_manifest.json"
CACHE_DIR = Path(tempfile.gettempdir()) / "ws_v5_musyngkite_symphony_cache"
SOUNDFONT_BASE = (
    "https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite"
)
SR = 44100
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
NOTE_TO_SEMITONE = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
    "E": 4, "Fb": 4, "E#": 5, "F": 5, "F#": 6, "Gb": 6,
    "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10,
    "B": 11, "Cb": 11, "B#": 0,
}

# Sustained bowed / blown instruments that crossfade seamlessly past ~2.1s
SUSTAINABLE_INSTRUMENTS = {
    "string_ensemble_1",
    "string_ensemble_2",
    "tremolo_strings",
    "cello",
    "contrabass",
    "french_horn",
    "trumpet",
    "trombone",
    "muted_trumpet",
    "brass_section",
    "flute",
    "oboe",
    "clarinet",
    "bassoon",
    "shakuhachi",
}

# Plucked / struck instruments that preserve natural acoustic decay tail past gate
RINGOUT_INSTRUMENTS = {
    "pizzicato_strings",
    "orchestral_harp",
    "acoustic_grand_piano",
    "harpsichord",
    "acoustic_guitar_nylon",
    "koto",
    "celesta",
    "vibraphone",
    "marimba",
    "tubular_bells",
    "timpani",
    "taiko_drum",
}

# Empirically measured RMS gain calibration across all 26 real MusyngKite instruments
INSTRUMENT_GAIN: Dict[str, float] = {
    "string_ensemble_1": 1.05,
    "string_ensemble_2": 2.35,
    "tremolo_strings": 1.32,
    "pizzicato_strings": 2.95,
    "cello": 1.75,
    "contrabass": 1.25,
    "french_horn": 1.95,
    "trumpet": 1.55,
    "trombone": 2.15,
    "muted_trumpet": 3.55,
    "brass_section": 2.10,
    "flute": 1.72,
    "oboe": 2.10,
    "clarinet": 1.68,
    "bassoon": 2.15,
    "orchestral_harp": 2.40,
    "acoustic_grand_piano": 2.55,
    "harpsichord": 2.35,
    "acoustic_guitar_nylon": 3.25,
    "koto": 1.78,
    "shakuhachi": 1.18,
    "celesta": 1.72,
    "vibraphone": 1.95,
    "marimba": 1.65,
    "tubular_bells": 1.78,
    "timpani": 1.48,
    "taiko_drum": 1.55,
}

# Default stereo stage placement (-1.0 left .. +1.0 right)
STAGE_PAN: Dict[str, float] = {
    "string_ensemble_1": -0.26,
    "string_ensemble_2": 0.14,
    "tremolo_strings": 0.18,
    "pizzicato_strings": 0.22,
    "cello": 0.30,
    "contrabass": 0.24,
    "french_horn": -0.26,
    "trumpet": 0.22,
    "trombone": 0.38,
    "muted_trumpet": -0.10,
    "brass_section": 0.16,
    "flute": -0.18,
    "oboe": 0.14,
    "clarinet": -0.20,
    "bassoon": 0.24,
    "orchestral_harp": -0.46,
    "acoustic_grand_piano": -0.26,
    "harpsichord": -0.34,
    "acoustic_guitar_nylon": -0.28,
    "koto": -0.24,
    "shakuhachi": 0.12,
    "celesta": 0.30,
    "vibraphone": 0.28,
    "marimba": 0.22,
    "tubular_bells": 0.20,
    "timpani": -0.06,
    "taiko_drum": 0.04,
}

# Reverb hall send ratio per instrument (front soloists intimate, back brass/bells lush)
HALL_SEND: Dict[str, float] = {
    "string_ensemble_1": 0.24,
    "string_ensemble_2": 0.30,
    "tremolo_strings": 0.32,
    "pizzicato_strings": 0.18,
    "cello": 0.18,
    "contrabass": 0.09,
    "french_horn": 0.34,
    "trumpet": 0.28,
    "trombone": 0.28,
    "muted_trumpet": 0.22,
    "brass_section": 0.30,
    "flute": 0.28,
    "oboe": 0.24,
    "clarinet": 0.22,
    "bassoon": 0.18,
    "orchestral_harp": 0.30,
    "acoustic_grand_piano": 0.20,
    "harpsichord": 0.22,
    "acoustic_guitar_nylon": 0.22,
    "koto": 0.26,
    "shakuhachi": 0.34,
    "celesta": 0.32,
    "vibraphone": 0.28,
    "marimba": 0.16,
    "tubular_bells": 0.40,
    "timpani": 0.20,
    "taiko_drum": 0.16,
}

# Transparent high-pass filter per instrument to prevent low-mid orchestral mud
SECTION_HPF_HZ: Dict[str, float] = {
    "flute": 240.0,
    "oboe": 210.0,
    "clarinet": 145.0,
    "shakuhachi": 200.0,
    "celesta": 260.0,
    "vibraphone": 150.0,
    "marimba": 110.0,
    "koto": 120.0,
    "harpsichord": 115.0,
    "acoustic_guitar_nylon": 85.0,
    "orchestral_harp": 95.0,
    "pizzicato_strings": 90.0,
    "tremolo_strings": 195.0,
    "string_ensemble_1": 95.0,
    "string_ensemble_2": 95.0,
    "trumpet": 180.0,
    "muted_trumpet": 220.0,
    "tubular_bells": 145.0,
    "acoustic_grand_piano": 65.0,
    "french_horn": 85.0,
    "trombone": 62.0,
    "brass_section": 75.0,
    "bassoon": 55.0,
    "cello": 50.0,
    "contrabass": 34.0,
    "timpani": 36.0,
    "taiko_drum": 36.0,
}

# Vintage ribbon-mic low-pass rolloff for bright Harmon-muted brass warmth
SECTION_LPF_HZ: Dict[str, float] = {
    "muted_trumpet": 3400.0,
}

# Subtle leading-silence trim cap (ms) for sharp percussive/plucked attacks only
LEADING_TRIM_MAX_MS: Dict[str, float] = {
    "koto": 5.0,
    "harpsichord": 3.0,
    "celesta": 3.0,
    "marimba": 4.0,
    "taiko_drum": 4.0,
    "timpani": 5.0,
    "pizzicato_strings": 8.0,
    "acoustic_guitar_nylon": 10.0,
    "vibraphone": 6.0,
    "acoustic_grand_piano": 5.0,
}

# ============================================================================
# Pitch Helpers & Pure Polynomial Curves (ZERO trig / math oscillators!)
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
    """C1-smooth Hermite ramp 0..1 using pure algebra (zero trig calls)."""
    if n <= 0:
        return np.zeros(0, dtype=np.float64)
    if n == 1:
        return np.ones(1, dtype=np.float64)
    t = np.linspace(0.0, 1.0, n, dtype=np.float64)
    return t * t * (3.0 - 2.0 * t)


def equal_power_pan(pan: float) -> Tuple[float, float]:
    """Exact equal-power stereo panning using sqrt((1 +- p)/2) (zero trig calls)."""
    p = max(-1.0, min(1.0, float(pan)))
    u = 0.5 * (p + 1.0)
    return math.sqrt(1.0 - u), math.sqrt(u)


def phrase_curve(u: float, knots: Sequence[Tuple[float, float]]) -> float:
    """Piecewise Hermite smoothstep interpolation over (beat_frac, value) knots."""
    if not knots:
        return 0.0
    if u <= knots[0][0]:
        return knots[0][1]
    for i in range(len(knots) - 1):
        x0, y0 = knots[i]
        x1, y1 = knots[i + 1]
        if u <= x1:
            if x1 <= x0:
                return y1
            t = (u - x0) / (x1 - x0)
            s = t * t * (3.0 - 2.0 * t)
            return y0 + (y1 - y0) * s
    return knots[-1][1]


# ============================================================================
# Musical Event & Venue Acoustic Models
# ============================================================================

@dataclass
class NoteEvent:
    instrument: str
    note: str
    beat: float          # start beat (0-based; wraps circularly)
    dur: float           # duration in beats
    vel: float = 0.78    # dynamics 0.0..1.30
    pan: Optional[float] = None
    attack_ms: Optional[float] = None
    release_ms: Optional[float] = None
    swell: float = 0.0   # 0.0 = natural, 0.25..0.55 = expressive bow/breath swell
    humanize_ms: float = 6.0
    staccato: bool = False
    grace_offset_ms: float = 0.0  # explicit strum / ornament offset in ms


@dataclass
class VenueAcoustics:
    name: str
    rt60_s: float
    early_taps_ms: List[Tuple[float, float, float]]  # (delay_ms, gain_l, gain_r)
    lpf_hz: float
    hpf_hz: float
    wet_scale: float
    warmth_shelf_db: float = 0.0
    air_shelf_db: float = 0.0


@dataclass
class ThemeSpec:
    theme_id: str
    filename: str
    title: str
    subtitle: str
    story_emotion: str
    bpm: float
    time_signature: str
    beats_per_bar: int
    total_bars: int
    key_mode: str
    form_description: str
    tier_numbers: List[int]
    lanes: List[str]
    acts: List[int]
    cities: List[str]
    rivals: List[str]
    acoustics: VenueAcoustics
    rubato_knots_ms: List[Tuple[float, float]] = field(default_factory=list)
    dynamic_knots: List[Tuple[float, float]] = field(default_factory=list)
    swing_ratio: float = 0.50       # 0.50 straight; 0.62 smoky triplet swing
    waltz_lilt_ms: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    seed: int = 101
    builder: Optional[Callable[[], List[NoteEvent]]] = None


# ============================================================================
# MusyngKite Real Sample Cache & Decoder
# ============================================================================

class MusyngKiteBank:
    """Downloads, caches, and decodes authentic stereo MusyngKite instrument notes."""

    def __init__(self, cache_dir: Path = CACHE_DIR) -> None:
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._pcm_cache: Dict[Tuple[str, str], np.ndarray] = {}

    def _sample_path(self, instrument: str, note: str) -> Path:
        inst_dir = self.cache_dir / instrument
        inst_dir.mkdir(parents=True, exist_ok=True)
        return inst_dir / f"{canonical_note(note)}.mp3"

    def _download_one(self, instrument: str, note_canon: str) -> Path:
        path = self._sample_path(instrument, note_canon)
        if path.exists() and path.stat().st_size > 1000:
            return path
        url = f"{SOUNDFONT_BASE}/{instrument}-mp3/{note_canon}.mp3"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "WorldsSmartest-v5-StageSymphonies/1.0"},
        )
        last_err: Optional[Exception] = None
        for _ in range(3):
            try:
                with urllib.request.urlopen(req, timeout=25) as resp:
                    data = resp.read()
                if len(data) < 800:
                    raise RuntimeError(f"Short response ({len(data)}B) for {url}")
                tmp = path.with_suffix(".mp3.tmp")
                tmp.write_bytes(data)
                tmp.replace(path)
                return path
            except Exception as exc:
                last_err = exc
        raise RuntimeError(f"Failed downloading {url}: {last_err}")

    def prefetch(self, events: Sequence[NoteEvent]) -> int:
        pairs = sorted({(ev.instrument, canonical_note(ev.note)) for ev in events})
        missing = [
            pair for pair in pairs
            if not (self._sample_path(pair[0], pair[1]).exists()
                    and self._sample_path(pair[0], pair[1]).stat().st_size > 1000)
        ]
        if missing:
            print(f"  [fetch] Downloading {len(missing)} real MusyngKite notes...", flush=True)
            with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
                futs = [pool.submit(self._download_one, inst, nt) for inst, nt in missing]
                for fut in concurrent.futures.as_completed(futs):
                    fut.result()
        return len(pairs)

    def get_pcm(self, instrument: str, note: str) -> np.ndarray:
        nt = canonical_note(note)
        key = (instrument, nt)
        if key in self._pcm_cache:
            return self._pcm_cache[key]

        path = self._download_one(instrument, nt)
        cmd = [
            FFMPEG, "-v", "error", "-i", str(path),
            "-f", "f32le", "-acodec", "pcm_f32le",
            "-ar", str(SR), "-ac", "2", "pipe:1",
        ]
        proc = subprocess.run(cmd, capture_output=True, check=True)
        pcm = np.frombuffer(proc.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)

        # Trim only tiny MP3 encoder dead air on percussive/plucked attacks
        max_trim_ms = LEADING_TRIM_MAX_MS.get(instrument, 0.0)
        if max_trim_ms > 0.0 and len(pcm) > 512:
            env = np.max(np.abs(pcm), axis=1)
            pk = float(np.max(env))
            if pk > 1e-6:
                first_hit = int(np.argmax(env > pk * 0.03))
                trim = min(first_hit, int(max_trim_ms * SR / 1000.0))
                if trim > 16:
                    pcm = pcm[trim:].copy()

        # Section HPF + optional vintage LPF for warm, transparent orchestral separation
        hpf_hz = SECTION_HPF_HZ.get(instrument, 40.0)
        if hpf_hz > 25.0 and len(pcm) > 64:
            sos = signal.butter(2, hpf_hz / (0.5 * SR), btype="highpass", output="sos")
            pcm = signal.sosfilt(sos, pcm, axis=0)
        lpf_hz = SECTION_LPF_HZ.get(instrument, 0.0)
        if lpf_hz > 200.0 and len(pcm) > 64:
            sos_lp = signal.butter(2, lpf_hz / (0.5 * SR), btype="lowpass", output="sos")
            pcm = signal.sosfilt(sos_lp, pcm, axis=0)

        self._pcm_cache[key] = pcm
        return pcm


# ============================================================================
# Sustain Extension, Venue Convolution IR & Circular Mix Engine
# ============================================================================

def extend_sustain(pcm: np.ndarray, target_samples: int) -> np.ndarray:
    """Seamlessly extend sustained real recordings via polynomial equal-power loop."""
    if len(pcm) >= target_samples:
        return pcm[:target_samples].copy()
    body_start = min(int(0.55 * SR), len(pcm) // 4)
    body_end = min(int(1.85 * SR), int(len(pcm) * 0.78))
    if body_end - body_start < int(0.40 * SR):
        out = np.zeros((target_samples, 2), dtype=np.float64)
        out[:len(pcm)] = pcm
        return out

    body = pcm[body_start:body_end]
    xf = min(int(0.18 * SR), len(body) // 3)
    stride = len(body) - xf
    s = smoothstep(xf)[:, None]
    fade_in = np.sqrt(s)
    fade_out = np.sqrt(1.0 - s)

    out = np.zeros((target_samples, 2), dtype=np.float64)
    head_len = min(body_end, target_samples)
    out[:head_len] = pcm[:head_len]
    cursor = body_end - xf

    while cursor < target_samples:
        rem = target_samples - cursor
        chunk_len = min(len(body), rem)
        ov = min(xf, chunk_len)
        out[cursor:cursor + ov] = (
            out[cursor:cursor + ov] * fade_out[:ov]
            + body[:ov] * fade_in[:ov]
        )
        if chunk_len > ov:
            out[cursor + ov:cursor + chunk_len] = body[ov:chunk_len]
        cursor += stride
    return out


def build_venue_ir(acoustics: VenueAcoustics, seed: int) -> np.ndarray:
    """Generate physical early-reflection + filtered air-absorbed late reverb IR (ZERO trig)."""
    rng = np.random.default_rng(seed + 9001)
    ir_len = int(min(2.6, max(1.0, acoustics.rt60_s * 1.45)) * SR)
    ir = np.zeros((ir_len, 2), dtype=np.float64)

    # Direct impulse + wall/ceiling early reflections
    ir[0, :] = 0.0  # pure wet send (dry path kept separate)
    for delay_ms, gl, gr in acoustics.early_taps_ms:
        idx = int(delay_ms * SR / 1000.0)
        if 0 < idx < ir_len:
            ir[idx, 0] += gl
            ir[idx, 1] += gr

    # Smooth velvet-Gaussian diffuse tail with authentic exponential air decay
    t = np.arange(ir_len, dtype=np.float64) / SR
    tau = max(0.18, acoustics.rt60_s / 6.907755)
    onset_s = 0.022
    build = np.clip((t - onset_s) / 0.045, 0.0, 1.0)
    build_env = build * build * (3.0 - 2.0 * build)
    decay = np.exp(-np.maximum(0.0, t - onset_s) / tau) * build_env

    noise_l = rng.standard_normal(ir_len)
    noise_r = rng.standard_normal(ir_len)
    # Cross-couple slightly for cohesive acoustic room image
    tail = np.stack([
        (0.84 * noise_l + 0.16 * noise_r) * decay,
        (0.84 * noise_r + 0.16 * noise_l) * decay,
    ], axis=1)

    # Dual-band air absorption (highs decay faster than mids, like real halls)
    sos_lo = signal.butter(2, acoustics.hpf_hz / (0.5 * SR), btype="highpass", output="sos")
    sos_hi = signal.butter(2, acoustics.lpf_hz / (0.5 * SR), btype="lowpass", output="sos")
    tail = signal.sosfilt(sos_hi, signal.sosfilt(sos_lo, tail, axis=0), axis=0)

    # Secondary softer warm tail for wood/stone bloom
    tau_warm = tau * 1.22
    decay_warm = np.exp(-np.maximum(0.0, t - onset_s) / tau_warm) * build_env
    sos_warm = signal.butter(2, min(1400.0, acoustics.lpf_hz * 0.45) / (0.5 * SR), btype="lowpass", output="sos")
    warm_tail = np.stack([
        rng.standard_normal(ir_len) * decay_warm,
        rng.standard_normal(ir_len) * decay_warm,
    ], axis=1)
    warm_tail = signal.sosfilt(sos_warm, signal.sosfilt(sos_lo, warm_tail, axis=0), axis=0)

    ir += 0.24 * tail + 0.16 * warm_tail
    norm = float(np.sqrt(np.sum(ir ** 2))) + 1e-12
    ir = (ir / norm) * (1.25 * acoustics.wet_scale)
    return ir


def circular_convolve_stereo(wet: np.ndarray, ir: np.ndarray) -> np.ndarray:
    """Exact circular stereo FFT convolution so reverb tails wrap seamlessly across the loop."""
    n = len(wet)
    ir_pad = np.zeros((n, 2), dtype=np.float64)
    m = min(n, len(ir))
    ir_pad[:m] = ir[:m]
    out = np.zeros((n, 2), dtype=np.float64)
    for ch in range(2):
        X = np.fft.rfft(wet[:, ch])
        H = np.fft.rfft(ir_pad[:, ch])
        out[:, ch] = np.fft.irfft(X * H, n=n)
    return out


def apply_shelving_polish(audio: np.ndarray, warmth_db: float, air_db: float) -> np.ndarray:
    """Gentle mastering warmth (low-mid shelf) and sheen (high air shelf) via IIR filters."""
    out = audio.copy()
    if abs(warmth_db) > 0.05:
        sos = signal.butter(2, 260.0 / (0.5 * SR), btype="lowpass", output="sos")
        low = signal.sosfilt(sos, out, axis=0)
        gain = 10.0 ** (warmth_db / 20.0) - 1.0
        out = out + low * gain
    if abs(air_db) > 0.05:
        sos = signal.butter(2, 4800.0 / (0.5 * SR), btype="highpass", output="sos")
        hi = signal.sosfilt(sos, out, axis=0)
        gain = 10.0 ** (air_db / 20.0) - 1.0
        out = out + hi * gain
    return out


def render_theme(spec: ThemeSpec, bank: MusyngKiteBank) -> Tuple[np.ndarray, List[str]]:
    """Render one complete symphonic theme circularly with expressive humanization."""
    assert spec.builder is not None
    events = spec.builder()
    bank.prefetch(events)

    total_beats = spec.total_bars * spec.beats_per_bar
    sec_per_beat = 60.0 / spec.bpm
    loop_sec = total_beats * sec_per_beat
    loop_samples = int(round(loop_sec * SR))

    dry_bus = np.zeros((loop_samples, 2), dtype=np.float64)
    wet_bus = np.zeros((loop_samples, 2), dtype=np.float64)
    rng = np.random.default_rng(spec.seed)
    used_instruments = sorted({ev.instrument for ev in events})

    for ev in events:
        pcm = bank.get_pcm(ev.instrument, ev.note)
        inst_gain = INSTRUMENT_GAIN.get(ev.instrument, 1.5)

        # Compute expressive beat time: swing + Viennese waltz lilt + conductor rubato + micro-jitter
        beat_pos = ev.beat % total_beats
        beat_in_bar = beat_pos % spec.beats_per_bar
        frac_in_beat = beat_pos - math.floor(beat_pos)

        # Authentic triplet swing for off-beat eighth notes when swing_ratio != 0.50
        swing_shift_beats = 0.0
        if abs(spec.swing_ratio - 0.50) > 1e-4 and 0.35 < frac_in_beat < 0.65:
            # Map 0.5 -> swing_ratio smoothly
            swing_shift_beats = (spec.swing_ratio - 0.50) * (1.0 - abs(frac_in_beat - 0.50) / 0.15)

        # Viennese / Baroque 3/4 waltz lilt per beat-in-bar
        waltz_ms = 0.0
        if spec.beats_per_bar == 3 and any(abs(x) > 1e-4 for x in spec.waltz_lilt_ms):
            b_idx = int(math.floor(beat_in_bar)) % 3
            waltz_ms = spec.waltz_lilt_ms[b_idx]

        # Conductor rubato breathing curve (anchored to 0ms at loop boundary 0.0 and 1.0)
        u_loop = beat_pos / total_beats
        rubato_ms = phrase_curve(u_loop, spec.rubato_knots_ms) if spec.rubato_knots_ms else 0.0

        # Conductor macro-dynamic phrase curve + deterministic performer nuance
        dyn_scale = phrase_curve(u_loop, spec.dynamic_knots) if spec.dynamic_knots else 1.0
        jitter_ms = float(rng.normal(0.0, ev.humanize_ms * 0.48))
        jitter_ms = max(-ev.humanize_ms * 1.4, min(ev.humanize_ms * 1.4, jitter_ms))
        vel_nuance = float(rng.uniform(0.95, 1.05)) * dyn_scale

        start_sec = (
            (beat_pos + swing_shift_beats) * sec_per_beat
            + (rubato_ms + waltz_ms + jitter_ms + ev.grace_offset_ms) / 1000.0
        )
        start_idx = int(round(start_sec * SR)) % loop_samples

        # Gate and tail durations
        gate_sec = max(0.05, ev.dur * sec_per_beat * (0.58 if ev.staccato else 1.0))
        is_ringout = ev.instrument in RINGOUT_INSTRUMENTS
        is_sustain = ev.instrument in SUSTAINABLE_INSTRUMENTS

        if ev.release_ms is not None:
            rel_sec = ev.release_ms / 1000.0
        elif ev.staccato:
            rel_sec = 0.065
        elif is_ringout:
            rel_sec = min(1.35, max(0.45, gate_sec * 0.65))
        else:
            rel_sec = min(0.24, max(0.085, gate_sec * 0.28))

        if ev.attack_ms is not None:
            atk_sec = ev.attack_ms / 1000.0
        elif ev.instrument in ("string_ensemble_2", "tremolo_strings"):
            atk_sec = 0.045
        elif ev.instrument in ("french_horn", "cello", "oboe", "shakuhachi", "muted_trumpet"):
            atk_sec = 0.018
        else:
            atk_sec = 0.004

        if is_ringout:
            total_sec = min(len(pcm) / SR, gate_sec + rel_sec)
            note_samples = max(64, int(round(total_sec * SR)))
            clip = pcm[:note_samples].copy()
        else:
            note_samples = max(64, int(round((gate_sec + rel_sec) * SR)))
            if is_sustain and note_samples > len(pcm):
                clip = extend_sustain(pcm, note_samples)
            else:
                clip = pcm[:min(len(pcm), note_samples)].copy()
                note_samples = len(clip)

        # Build expressive amplitude envelope (zero trig)
        env = np.ones(note_samples, dtype=np.float64)
        atk_n = min(note_samples // 3, max(8, int(round(atk_sec * SR))))
        env[:atk_n] *= smoothstep(atk_n)

        rel_n = min(note_samples - atk_n, max(16, int(round(rel_sec * SR))))
        if rel_n > 0:
            env[note_samples - rel_n:] *= (1.0 - smoothstep(rel_n))

        # Expressive orchestral bow/breath swell across held notes
        if ev.swell > 0.01 and note_samples > int(0.18 * SR):
            t_norm = np.linspace(0.0, 1.0, note_samples, dtype=np.float64)
            # Asymmetric hump peaking around 58% into the note (human musical phrase)
            peak_pos = 0.58
            rise = np.clip(t_norm / peak_pos, 0.0, 1.0)
            fall = np.clip((1.0 - t_norm) / (1.0 - peak_pos), 0.0, 1.0)
            hump = np.where(
                t_norm <= peak_pos,
                rise * rise * (3.0 - 2.0 * rise),
                fall * fall * (3.0 - 2.0 * fall),
            )
            swell_curve = (1.0 - ev.swell * 0.55) + (ev.swell * 0.90) * hump
            env *= swell_curve

        # Velocity, calibration gain & equal-power stereo panning
        pan = STAGE_PAN.get(ev.instrument, 0.0) if ev.pan is None else ev.pan
        # Gentle organic pitch-dependent stereo spread for keyboards & plucked harps/koto
        if ev.instrument in ("acoustic_grand_piano", "harpsichord", "orchestral_harp", "koto", "celesta"):
            midi_val = note_to_midi(ev.note)
            pan = max(-0.82, min(0.82, pan + (midi_val - 60) * 0.008))

        gl, gr = equal_power_pan(pan)
        gain = (ev.vel * vel_nuance) * inst_gain
        shaped = clip * (env * gain)[:, None]
        # Preserve stereo micro-image of recorded sample while placing on concert stage
        mono_s = 0.5 * (shaped[:, 0] + shaped[:, 1])
        side_s = 0.5 * (shaped[:, 0] - shaped[:, 1])
        placed = np.stack([
            mono_s * gl + side_s * 0.42,
            mono_s * gr - side_s * 0.42,
        ], axis=1)

        send = HALL_SEND.get(ev.instrument, 0.22)
        dry_gain = 1.0 - 0.18 * send

        # Circular placement into mix buffers (wraps seamlessly past loop_samples!)
        end_idx = start_idx + note_samples
        if end_idx <= loop_samples:
            dry_bus[start_idx:end_idx] += placed * dry_gain
            wet_bus[start_idx:end_idx] += placed * send
        else:
            first = loop_samples - start_idx
            rem = note_samples - first
            dry_bus[start_idx:loop_samples] += placed[:first] * dry_gain
            wet_bus[start_idx:loop_samples] += placed[:first] * send
            # Handle notes longer than a single wrap safely
            off = first
            while rem > 0:
                take = min(loop_samples, rem)
                dry_bus[:take] += placed[off:off + take] * dry_gain
                wet_bus[:take] += placed[off:off + take] * send
                off += take
                rem -= take

    # Circular stereo venue acoustics convolution
    ir = build_venue_ir(spec.acoustics, spec.seed)
    wet_rev = circular_convolve_stereo(wet_bus, ir)
    mix = dry_bus + wet_rev

    # Clean sub-rumble filter (32 Hz) + subtle venue EQ polish applied circularly
    # by prefixing the tail so sample 0 begins in exact steady-state filter memory
    sos_sub = signal.butter(2, 32.0 / (0.5 * SR), btype="highpass", output="sos")
    warm_prefix = min(SR // 2, loop_samples)
    doubled = np.vstack([mix[loop_samples - warm_prefix:], mix])
    doubled = signal.sosfilt(sos_sub, doubled, axis=0)
    doubled = apply_shelving_polish(
        doubled, spec.acoustics.warmth_shelf_db, spec.acoustics.air_shelf_db
    )
    mix = doubled[warm_prefix:].copy()

    # Transparent musical bus headroom normalization + gentle soft-knee ceiling
    rms = float(np.sqrt(np.mean(mix ** 2))) + 1e-12
    mix = mix * (0.145 / rms)
    mix = np.where(
        np.abs(mix) > 0.85,
        np.sign(mix) * (0.85 + 0.12 * np.tanh((np.abs(mix) - 0.85) / 0.12)),
        mix,
    )

    # Seamless 10ms linear-boundary continuity polish across wrap point (zero click!)
    xf_n = int(0.010 * SR)
    delta = mix[0] - mix[-1]
    ramp = smoothstep(xf_n)[:, None]
    mix[:xf_n] -= 0.5 * delta * (1.0 - ramp)
    mix[-xf_n:] += 0.5 * delta * ramp

    return mix, used_instruments


# ============================================================================
# Two-Pass EBU R128 Broadcast Mastering & MP3 Verification via imageio_ffmpeg
# ============================================================================

def write_wav_16bit(path: Path, pcm: np.ndarray) -> None:
    clipped = np.clip(pcm, -0.995, 0.995)
    int16 = np.round(clipped * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(int16.tobytes())


def parse_loudnorm_json(stderr_text: str) -> Dict[str, float]:
    matches = re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", stderr_text, flags=re.DOTALL)
    if not matches:
        raise RuntimeError(f"Could not parse loudnorm JSON from ffmpeg stderr:\n{stderr_text[-800:]}")
    raw = json.loads(matches[-1])
    out: Dict[str, float] = {}
    for k, v in raw.items():
        try:
            out[k] = float(v)
        except (TypeError, ValueError):
            pass
    return out


def master_to_mp3(pcm: np.ndarray, out_mp3: Path) -> Dict[str, float]:
    """Circular steady-state 2-pass EBU R128 loudnorm (`I=-17.5:TP=-1.8:LRA=9`) + 128k MP3."""
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    loop_n = len(pcm)
    pre_n = min(int(2.5 * SR), loop_n)
    post_n = min(int(0.5 * SR), loop_n)

    with tempfile.TemporaryDirectory(prefix="ws_v5_master_") as td:
        td_path = Path(td)
        wav_path = td_path / "premaster.wav"
        write_wav_16bit(wav_path, pcm)

        # Pass 1: measure loudness on exact single cycle
        p1 = subprocess.run(
            [
                FFMPEG, "-y", "-hide_banner", "-i", str(wav_path),
                "-af", "loudnorm=I=-17.5:TP=-1.8:LRA=9:print_format=json",
                "-f", "null", "-",
            ],
            capture_output=True, text=True, check=True,
        )
        m1 = parse_loudnorm_json(p1.stderr)

        # Circularly wrap prefix+body+suffix so loudnorm & alimiter run in exact steady-state
        wrapped_wav = td_path / "wrapped.wav"
        wrapped_pcm = np.vstack([pcm[loop_n - pre_n:], pcm, pcm[:post_n]])
        write_wav_16bit(wrapped_wav, wrapped_pcm)

        ln_filter = (
            f"loudnorm=I=-17.5:TP=-1.8:LRA=9:linear=true"
            f":measured_I={m1['input_i']:.2f}"
            f":measured_LRA={m1['input_lra']:.2f}"
            f":measured_TP={m1['input_tp']:.2f}"
            f":measured_thresh={m1['input_thresh']:.2f}"
            f":offset={m1.get('target_offset', 0.0):.2f},"
            f"alimiter=limit=0.794:attack=3:release=40:level=false"
        )
        p2 = subprocess.run(
            [
                FFMPEG, "-y", "-hide_banner", "-v", "error", "-i", str(wrapped_wav),
                "-af", ln_filter,
                "-f", "f32le", "-acodec", "pcm_f32le",
                "-ar", str(SR), "-ac", "2", "pipe:1",
            ],
            capture_output=True, check=True,
        )
        mastered_full = np.frombuffer(p2.stdout, dtype=np.float32).reshape(-1, 2).astype(np.float64)
        mastered = mastered_full[pre_n:pre_n + loop_n].copy()

        # Subtle 8ms zero-crossing micro-taper so libmp3lame MDCT edges loop with zero click
        edge_n = int(0.008 * SR)
        taper = smoothstep(edge_n)[:, None]
        mastered[:edge_n] *= taper
        mastered[-edge_n:] *= (1.0 - taper)

        final_wav = td_path / "mastered.wav"
        write_wav_16bit(final_wav, mastered)

        # Encode compact 128k stereo MP3
        subprocess.run(
            [
                FFMPEG, "-y", "-hide_banner", "-v", "error", "-i", str(final_wav),
                "-c:a", "libmp3lame", "-b:a", "128k",
                "-ar", str(SR), "-ac", "2",
                str(out_mp3),
            ],
            capture_output=True, text=True, check=True,
        )

        # Post-encode verification: measure actual decoded MP3 EBU R128 loudness & True Peak
        p_ver = subprocess.run(
            [
                FFMPEG, "-y", "-hide_banner", "-i", str(out_mp3),
                "-af", "loudnorm=I=-17.5:TP=-1.8:LRA=9:print_format=json",
                "-f", "null", "-",
            ],
            capture_output=True, text=True, check=True,
        )
        m_final = parse_loudnorm_json(p_ver.stderr)

        # Decode final MP3 PCM to verify seamless boundary continuity and exact duration
        dec = subprocess.run(
            [
                FFMPEG, "-v", "error", "-i", str(out_mp3),
                "-f", "f32le", "-acodec", "pcm_f32le",
                "-ar", str(SR), "-ac", "2", "pipe:1",
            ],
            capture_output=True, check=True,
        )
        dec_pcm = np.frombuffer(dec.stdout, dtype=np.float32).reshape(-1, 2)
        dur_s = len(dec_pcm) / SR
        seam_jump = float(np.max(np.abs(dec_pcm[0] - dec_pcm[-1])))
        head_rms = float(np.sqrt(np.mean(dec_pcm[:int(0.5 * SR)] ** 2)))
        tail_rms = float(np.sqrt(np.mean(dec_pcm[-int(0.5 * SR):] ** 2)))
        size_bytes = out_mp3.stat().st_size

        # Verify valid MP3 header (ID3v2 tag or MPEG-1 Layer III frame sync 0xFF 0xFB / 0xFA)
        hdr = out_mp3.read_bytes()[:4]
        valid_mp3 = (hdr[:3] == b"ID3") or (hdr[0] == 0xFF and (hdr[1] & 0xE0) == 0xE0)
        if not valid_mp3:
            raise RuntimeError(f"Invalid MP3 header on {out_mp3}: {hdr!r}")
        if m_final["input_tp"] > -1.5:
            raise RuntimeError(
                f"True peak exceeded -1.5 dBFS on {out_mp3.name}: {m_final['input_tp']:.2f} dBFS"
            )
        if seam_jump > 0.015:
            raise RuntimeError(
                f"Loop seam discontinuity too large on {out_mp3.name}: {seam_jump:.4f}"
            )

        return {
            "size_bytes": size_bytes,
            "size_kb": round(size_bytes / 1024.0, 1),
            "duration_sec": round(dur_s, 3),
            "integrated_lufs": round(m_final["input_i"], 2),
            "true_peak_dbfs": round(m_final["input_tp"], 2),
            "lra_lu": round(m_final["input_lra"], 2),
            "seam_delta": round(seam_jump, 5),
            "head_tail_rms_ratio": round(head_rms / (tail_rms + 1e-9), 3),
            "valid_mp3_header": True,
        }


# ============================================================================
# Composition Helper Primitives (Arpeggios, Strums, Glissandos, Phrase Lines)
# ============================================================================

def add_strum(
    evts: List[NoteEvent],
    instrument: str,
    notes: Sequence[str],
    beat: float,
    dur: float,
    vel: float = 0.72,
    stagger_ms: float = 16.0,
    downstroke: bool = True,
    pan: Optional[float] = None,
    staccato: bool = False,
) -> None:
    ordered = list(notes) if downstroke else list(reversed(notes))
    for i, nt in enumerate(ordered):
        evts.append(NoteEvent(
            instrument=instrument,
            note=nt,
            beat=beat,
            dur=dur,
            vel=vel * (0.94 + 0.03 * i),
            pan=pan,
            staccato=staccato,
            grace_offset_ms=i * stagger_ms,
            humanize_ms=4.5,
        ))


def add_melody(
    evts: List[NoteEvent],
    instrument: str,
    phrase: Sequence[Tuple[float, str, float, float]],
    swell: float = 0.22,
    pan: Optional[float] = None,
    humanize_ms: float = 6.5,
    staccato: bool = False,
) -> None:
    """Add an expressive melody phrase: list of (beat, note, dur, vel)."""
    for beat, nt, dur, vel in phrase:
        evts.append(NoteEvent(
            instrument=instrument,
            note=nt,
            beat=beat,
            dur=dur,
            vel=vel,
            swell=swell if dur >= 0.75 else 0.0,
            pan=pan,
            humanize_ms=humanize_ms,
            staccato=staccato,
        ))


def add_glissando(
    evts: List[NoteEvent],
    instrument: str,
    notes: Sequence[str],
    start_beat: float,
    span_beats: float,
    vel_start: float = 0.50,
    vel_end: float = 0.88,
    pan: Optional[float] = None,
) -> None:
    n = len(notes)
    if n == 0:
        return
    step = span_beats / max(1, n)
    for i, nt in enumerate(notes):
        u = i / max(1, n - 1)
        vel = vel_start + (vel_end - vel_start) * u
        evts.append(NoteEvent(
            instrument=instrument,
            note=nt,
            beat=start_beat + i * step,
            dur=max(0.45, span_beats * 0.75),
            vel=vel,
            pan=pan,
            humanize_ms=2.5,
        ))


# ============================================================================
# SYMPHONY 1: STAGE 1-2 — OAKRIDGE HALL & LYRIC THEATER (Hometown Underdog)
# 104 BPM | 4/4 | 9 bars (4+5 asymmetric folk-chamber period) | G Major / E minor
# ============================================================================

def compose_stage1_oakridge() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 9-bar harmonic journey (ZERO 4-chord AI loop!):
    # Bar 0: Gmaj9   | Bar 1: Bm7/F#  | Bar 2: Em9     | Bar 3: Cmaj7#11 (half cadence)
    # Bar 4: Am9     | Bar 5: D9sus4  | Bar 6: Bm7->Em | Bar 7: Fmaj7 (warm bVII!) | Bar 8: D13sus4 -> D9
    guitar_bars = [
        ("G2",  ["G2", "D3", "B3", "A3", "D3", "F#3", "B3", "D4"]),   # 0: Gmaj9
        ("F#2", ["F#2", "D3", "A3", "B3", "D3", "F#3", "A3", "D4"]),  # 1: Bm7/F#
        ("E2",  ["E2", "B2", "G3", "F#3", "B2", "E3", "G3", "B3"]),   # 2: Em9
        ("C3",  ["C3", "G3", "B3", "E4", "G3", "F#3", "B3", "E4"]),   # 3: Cmaj7#11
        ("A2",  ["A2", "E3", "B3", "C4", "E3", "G3", "B3", "E4"]),    # 4: Am9
        ("D3",  ["D3", "A3", "C4", "E4", "A3", "G3", "C4", "E4"]),    # 5: D9sus4
        ("B2",  ["B2", "F#3", "A3", "D4", "E2", "B2", "G3", "B3"]),   # 6: Bm7 -> Em
        ("F2",  ["F2", "C3", "A3", "E4", "C3", "G3", "A3", "C4"]),    # 7: Fmaj7 (hometown lift!)
        ("D3",  ["D3", "A3", "C4", "G4", "A3", "F#3", "C4", "E4"]),   # 8: D13sus4 -> D9
    ]
    for bar, (_, pat) in enumerate(guitar_bars):
        b0 = bar * 4.0
        for step, nt in enumerate(pat):
            vel = 0.72 if step in (0, 4) else (0.58 if step in (2, 6) else 0.48)
            evts.append(NoteEvent(
                "acoustic_guitar_nylon", nt, b0 + step * 0.5,
                dur=1.25 if step in (0, 4) else 0.72,
                vel=vel, pan=-0.30, humanize_ms=6.5,
            ))
        # Warm brushed chord strum on beat 1 of odd bars and bar 7 surprise
        if bar in (0, 3, 4, 7):
            chord = {
                0: ["G3", "B3", "D4", "F#4"],
                3: ["C3", "G3", "B3", "E4"],
                4: ["A3", "C4", "E4", "G4"],
                7: ["F3", "A3", "C4", "E4"],
            }[bar]
            add_strum(evts, "acoustic_guitar_nylon", chord, b0, 2.0, vel=0.52, stagger_ms=19.0, pan=-0.26)

    # Woody upright contrabass — conversational walking bass with pickup turns
    bass_line = [
        (0.0, "G2", 1.5, 0.80), (1.5, "D2", 0.5, 0.62), (2.0, "G2", 1.5, 0.72), (3.5, "G2", 0.5, 0.60),
        (4.0, "F#2", 1.5, 0.78), (5.5, "B2", 0.5, 0.64), (6.0, "F#2", 1.25, 0.70), (7.5, "F2", 0.5, 0.62),
        (8.0, "E2", 1.5, 0.80), (9.5, "B2", 0.5, 0.62), (10.0, "E2", 1.5, 0.72), (11.5, "D2", 0.5, 0.62),
        (12.0, "C2", 2.0, 0.80), (14.0, "G2", 1.0, 0.68), (15.0, "B2", 1.0, 0.64),
        (16.0, "A2", 1.5, 0.82), (17.5, "E2", 0.5, 0.64), (18.0, "A2", 1.0, 0.74), (19.0, "G2", 1.0, 0.68),
        (20.0, "D2", 1.5, 0.82), (21.5, "A2", 0.5, 0.65), (22.0, "D2", 1.0, 0.74), (23.0, "C2", 1.0, 0.68),
        (24.0, "B1", 1.5, 0.80), (25.5, "F#2", 0.5, 0.64), (26.0, "E2", 1.5, 0.80), (27.5, "E2", 0.5, 0.62),
        (28.0, "F2", 2.0, 0.84), (30.0, "C2", 1.0, 0.72), (31.0, "E2", 1.0, 0.68),
        (32.0, "D2", 1.75, 0.82), (33.75, "A2", 0.75, 0.68), (34.5, "D2", 1.0, 0.76), (35.5, "F#2", 0.5, 0.70),
    ]
    add_melody(
        evts, "contrabass",
        [(b, nt, d, v * 0.80) for b, nt, d, v in bass_line],
        swell=0.0, pan=0.22, humanize_ms=5.5,
    )

    # Clarinet — cozy, scrappy hometown A-melody (bars 0-3) + playful B-section harmony echo (bars 6-8)
    clarinet_a = [
        (0.5, "D5", 0.5, 0.72), (1.0, "E5", 0.75, 0.78), (1.75, "G5", 1.25, 0.84), (3.0, "F#5", 0.5, 0.74), (3.5, "D5", 0.5, 0.70),
        (4.0, "B4", 1.5, 0.78), (5.5, "A4", 0.5, 0.68), (6.0, "B4", 1.0, 0.74), (7.0, "D5", 1.0, 0.76),
        (8.0, "B4", 0.75, 0.76), (8.75, "G4", 0.75, 0.70), (9.5, "A4", 0.5, 0.72), (10.0, "B4", 1.25, 0.80), (11.25, "D5", 0.75, 0.75),
        (12.0, "E5", 1.5, 0.84), (13.5, "D5", 0.5, 0.72), (14.0, "B4", 1.5, 0.74),
        # Clarinet joins solo cello in affectionate thirds for bars 7-8 turnaround!
        (28.0, "E5", 1.0, 0.76), (29.0, "C5", 0.75, 0.72), (29.75, "A4", 1.25, 0.74), (31.0, "C5", 1.0, 0.76),
        (32.0, "D5", 1.5, 0.80), (33.5, "B4", 0.5, 0.70), (34.0, "A4", 1.25, 0.72), (35.25, "B4", 0.75, 0.74),
    ]
    add_melody(evts, "clarinet", clarinet_a, swell=0.22, pan=-0.18, humanize_ms=7.0)

    # Expressive Solo Cello — countermelody responses (bars 1, 3) then soaring B-section lead (bars 4-8)
    cello_voice = [
        # Warm answering sighs under clarinet
        (2.0, "B3", 1.0, 0.60), (3.0, "A3", 1.0, 0.56),
        (6.0, "F#3", 1.0, 0.62), (7.0, "G3", 1.0, 0.64),
        (10.0, "G3", 1.0, 0.64), (11.0, "F#3", 1.0, 0.62),
        (13.5, "G3", 0.5, 0.64), (14.0, "A3", 1.25, 0.72), (15.25, "B3", 0.75, 0.76),
        # Cello takes the spotlight (bars 4-8: scrappy underdog pride & warmth!)
        (16.0, "C4", 1.25, 0.86), (17.25, "E4", 0.75, 0.88), (18.0, "G4", 1.25, 0.92), (19.25, "F#4", 0.75, 0.82),
        (20.0, "E4", 1.0, 0.84), (21.0, "D4", 0.75, 0.78), (21.75, "E4", 0.75, 0.80), (22.5, "G4", 1.5, 0.88),
        (24.0, "F#4", 1.0, 0.86), (25.0, "D4", 1.0, 0.78), (26.0, "E4", 1.25, 0.84), (27.25, "G4", 0.75, 0.86),
        (28.0, "A4", 1.5, 0.92), (29.5, "G4", 0.5, 0.80), (30.0, "E4", 1.0, 0.82), (31.0, "C4", 1.0, 0.78),
        (32.0, "D4", 1.75, 0.84), (33.75, "C4", 0.75, 0.74), (34.5, "B3", 0.75, 0.72), (35.25, "A3", 0.75, 0.70),
    ]
    add_melody(evts, "cello", cello_voice, swell=0.34, pan=0.28, humanize_ms=7.5)

    # Acoustic Grand Piano — intimate parlor voicings & warm twinkling commentary
    piano_chords = [
        (0.0, ["B3", "D4", "F#4", "A4"], 2.0, 0.54),
        (2.5, ["A4", "G4"], 0.75, 0.48),
        (4.0, ["A3", "D4", "F#4"], 2.0, 0.52),
        (8.0, ["G3", "B3", "D4", "F#4"], 2.5, 0.54),
        (12.0, ["G3", "B3", "E4", "F#4"], 2.5, 0.58),
        (16.0, ["G3", "B3", "C4", "E4"], 2.0, 0.62),
        (18.5, ["E4", "G4", "B4"], 1.5, 0.56),
        (20.0, ["G3", "C4", "E4", "A4"], 2.0, 0.62),
        (22.5, ["F#4", "A4", "C5"], 1.5, 0.56),
        (24.0, ["A3", "D4", "F#4"], 1.75, 0.60),
        (26.0, ["G3", "B3", "D4", "G4"], 1.75, 0.62),
        (28.0, ["A3", "C4", "E4", "G4"], 2.5, 0.66),
        (32.0, ["G3", "C4", "E4", "A4"], 2.0, 0.64),
        (34.0, ["F#3", "C4", "E4", "A4"], 1.75, 0.60),
    ]
    for b, ch, dur, vel in piano_chords:
        add_strum(evts, "acoustic_grand_piano", ch, b, dur, vel=vel, stagger_ms=17.0, pan=-0.16)

    # Piano right-hand parlor fills
    piano_fills = [
        (3.25, "A5", 0.35, 0.46), (3.62, "G5", 0.38, 0.44),
        (15.0, "G5", 0.45, 0.52), (15.5, "F#5", 0.45, 0.50),
        (30.5, "G5", 0.5, 0.56), (31.0, "A5", 0.5, 0.60), (31.5, "G5", 0.5, 0.54),
        (35.0, "F#5", 0.5, 0.52), (35.5, "E5", 0.5, 0.48),
    ]
    add_melody(evts, "acoustic_grand_piano", piano_fills, swell=0.0, pan=-0.12, humanize_ms=5.0)

    # Gentle wooden marimba pulse during the joyful B-section lift (bars 4-8)
    for bar in range(4, 9):
        b0 = bar * 4.0
        m_notes = {
            4: ("A3", "E4", "C4"), 5: ("D4", "G4", "E4"), 6: ("B3", "F#4", "G4"),
            7: ("F3", "C4", "A4"), 8: ("D4", "A4", "F#4"),
        }[bar]
        evts.append(NoteEvent("marimba", m_notes[0], b0 + 1.0, 0.4, 0.42, pan=0.26))
        evts.append(NoteEvent("marimba", m_notes[1], b0 + 2.5, 0.4, 0.46, pan=0.30))
        evts.append(NoteEvent("marimba", m_notes[2], b0 + 3.5, 0.4, 0.40, pan=0.24))

    return evts


# ============================================================================
# SYMPHONY 2: STAGE 3-4 — CHANNEL 7 & PRIME-TIME BROADCAST
# 120 BPM | 4/4 | 10 bars (4+4+2 live-TV showcase arc) | Bb Major -> Db/Eb Lydian
# ============================================================================

def compose_stage3_broadcast() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 10-bar broadcast harmonic arc (4+4+2 asymmetric showtime!):
    # 0: Bbmaj9 | 1: Gm9 | 2: Ebmaj9#11 | 3: F9sus4 -> F13
    # 4: Dbmaj9 (chromatic mediant surprise!) | 5: Eb6/9 | 6: Cm9 | 7: F13
    # 8: Gbmaj7 -> Ab13 | 9: Bb/F -> F13b9 (live broadcast countdown ramp!)

    # Driving orchestral contrabass + timpani punctuation
    bass_prog = [
        (0.0, "Bb1", 1.25, 0.86), (1.5, "F2", 0.5, 0.72), (2.0, "Bb1", 0.75, 0.78), (2.75, "C2", 0.75, 0.76), (3.5, "D2", 0.5, 0.74),
        (4.0, "G1", 1.25, 0.86), (5.5, "D2", 0.5, 0.72), (6.0, "G2", 0.75, 0.78), (6.75, "F2", 0.75, 0.74), (7.5, "E2", 0.5, 0.72),
        (8.0, "Eb2", 1.25, 0.86), (9.5, "Bb2", 0.5, 0.74), (10.0, "Eb2", 1.0, 0.78), (11.0, "E2", 1.0, 0.76),
        (12.0, "F2", 1.25, 0.86), (13.5, "C2", 0.5, 0.72), (14.0, "F2", 1.0, 0.80), (15.0, "Eb2", 1.0, 0.74),
        (16.0, "Db2", 1.5, 0.88), (17.5, "Ab2", 0.5, 0.76), (18.0, "Db2", 1.25, 0.80), (19.25, "D2", 0.75, 0.76),
        (20.0, "Eb2", 1.5, 0.88), (21.5, "Bb2", 0.5, 0.76), (22.0, "Eb2", 1.25, 0.80), (23.25, "D2", 0.75, 0.76),
        (24.0, "C2", 1.25, 0.86), (25.5, "G2", 0.5, 0.74), (26.0, "C2", 1.25, 0.80), (27.25, "Eb2", 0.75, 0.76),
        (28.0, "F2", 1.5, 0.88), (29.5, "C2", 0.5, 0.74), (30.0, "F2", 1.0, 0.82), (31.0, "F#2", 1.0, 0.80),
        (32.0, "Gb2", 1.75, 0.90), (34.0, "Ab2", 1.75, 0.92),
        (36.0, "F2", 1.5, 0.90), (37.5, "C2", 0.5, 0.78), (38.0, "F2", 1.0, 0.88), (39.0, "A2", 1.0, 0.84),
    ]
    add_melody(evts, "contrabass", bass_prog, swell=0.0, pan=0.20, humanize_ms=4.5)

    # Punchy broadcast timpani hits + bar 9 crescendo roll
    timp_hits = [
        (0.0, "Bb2", 0.75, 0.88), (2.5, "F2", 0.5, 0.66),
        (4.0, "G2", 0.75, 0.82), (8.0, "Eb2", 0.75, 0.84), (11.5, "F2", 0.5, 0.72),
        (12.0, "F2", 0.75, 0.84), (15.5, "Ab2", 0.5, 0.72),
        (16.0, "Db2", 0.85, 0.90), (20.0, "Eb2", 0.85, 0.88),
        (24.0, "C2", 0.75, 0.84), (28.0, "F2", 0.75, 0.88),
        (32.0, "Gb2", 0.85, 0.92), (34.0, "Ab2", 0.85, 0.94),
        (36.0, "F2", 0.75, 0.92),
    ]
    for b, nt, d, v in timp_hits:
        evts.append(NoteEvent("timpani", nt, b, d, v, pan=-0.06, humanize_ms=3.5))
    # Live-TV timpani build roll across bar 9 beats 2..4
    for i in range(8):
        evts.append(NoteEvent(
            "timpani", "F2" if i % 2 == 0 else "Bb2",
            38.0 + i * 0.25, 0.30, 0.52 + i * 0.06, pan=-0.06, humanize_ms=2.5,
        ))

    # Bright prime-time Brass Section + Solo Trumpet fanfare & call-and-response stabs
    trumpet_lead = [
        (0.0, "F5", 0.5, 0.86), (0.5, "D5", 0.5, 0.78), (1.0, "Bb4", 0.5, 0.76), (1.5, "C5", 0.5, 0.80), (2.0, "D5", 0.5, 0.84), (2.5, "F5", 1.25, 0.92),
        (4.5, "G5", 0.5, 0.88), (5.0, "F5", 0.5, 0.82), (5.5, "D5", 1.0, 0.84), (6.5, "C5", 0.5, 0.76), (7.0, "Bb4", 0.75, 0.78),
        (8.0, "C5", 0.5, 0.80), (8.5, "D5", 0.5, 0.84), (9.0, "G5", 1.0, 0.90), (10.0, "A5", 0.75, 0.92), (10.75, "G5", 0.75, 0.86),
        (12.0, "F5", 1.25, 0.90), (13.5, "D5", 0.5, 0.80), (14.0, "C5", 1.25, 0.84),
        # Brass answers strings in bars 4-7 with gleaming syncopated stabs
        (18.5, "Ab5", 0.4, 0.86), (19.0, "F5", 0.6, 0.84),
        (22.5, "Bb5", 0.4, 0.90), (23.0, "G5", 0.6, 0.86),
        (26.5, "G5", 0.4, 0.84), (27.0, "Eb5", 0.6, 0.82),
        (28.0, "F5", 0.75, 0.88), (28.75, "G5", 0.75, 0.90), (29.5, "A5", 1.0, 0.94),
        # Broadcast Tag (bars 8-9)
        (32.0, "Bb5", 0.75, 0.94), (32.75, "Ab5", 0.75, 0.88), (33.5, "Gb5", 0.5, 0.84),
        (34.0, "Ab5", 0.75, 0.92), (34.75, "Bb5", 0.75, 0.95), (35.5, "C6", 0.5, 0.94),
        (36.0, "Bb5", 1.25, 0.96), (37.5, "F5", 0.5, 0.84), (38.0, "G5", 0.75, 0.90), (38.75, "A5", 1.0, 0.94),
    ]
    add_melody(evts, "trumpet", trumpet_lead, swell=0.14, pan=0.22, humanize_ms=4.5)

    # Brass section rhythmic chords + French horn noble inner lines
    brass_stabs = [
        (0.0, ["D4", "F4", "A4", "C5"], 0.65, 0.68, True),
        (2.5, ["D4", "F4", "A4", "C5"], 0.90, 0.74, False),
        (4.5, ["D4", "F4", "A4", "Bb4"], 0.65, 0.66, True),
        (8.0, ["G3", "Bb3", "D4", "A4"], 0.85, 0.70, False),
        (12.0, ["Eb4", "G4", "Bb4", "C5"], 0.85, 0.72, False),
        (14.5, ["Eb4", "G4", "A4", "D5"], 0.65, 0.74, True),
        (16.0, ["F3", "Ab3", "C4", "Eb4"], 1.50, 0.68, False),
        (20.0, ["G3", "Bb3", "C4", "F4"], 1.50, 0.70, False),
        (24.0, ["Eb3", "G3", "Bb3", "D4"], 1.25, 0.68, False),
        (28.0, ["Eb4", "G4", "A4", "D5"], 1.25, 0.76, False),
        (32.0, ["Db4", "F4", "Gb4", "Bb4"], 1.50, 0.78, False),
        (34.0, ["Eb4", "Gb4", "Ab4", "C5"], 1.50, 0.82, False),
        (36.0, ["D4", "F4", "Bb4"], 1.00, 0.84, False),
        (38.0, ["Eb4", "Gb4", "A4", "D5"], 1.50, 0.86, False),
    ]
    for b, ch, d, v, stac in brass_stabs:
        for nt in ch:
            evts.append(NoteEvent("brass_section", nt, b, d, v * 0.76, pan=0.14, staccato=stac, humanize_ms=5.0))

    horn_counter = [
        (1.0, "D4", 1.5, 0.68), (2.5, "C4", 1.5, 0.66),
        (5.0, "Bb3", 1.5, 0.66), (6.5, "A3", 1.5, 0.64),
        (9.0, "A4", 1.5, 0.72), (10.5, "G4", 1.5, 0.70),
        (13.0, "C4", 1.5, 0.72), (14.5, "D4", 1.5, 0.74),
        (16.0, "Eb4", 2.0, 0.76), (18.0, "F4", 2.0, 0.78),
        (20.0, "G4", 2.0, 0.80), (22.0, "F4", 2.0, 0.76),
        (24.0, "D4", 2.0, 0.74), (26.0, "Eb4", 2.0, 0.78),
        (28.0, "C4", 2.0, 0.80), (30.0, "D4", 2.0, 0.82),
        (32.0, "Db4", 2.0, 0.84), (34.0, "Eb4", 2.0, 0.86),
        (36.0, "F4", 2.0, 0.86), (38.0, "Gb4", 2.0, 0.88),
    ]
    add_melody(evts, "french_horn", horn_counter, swell=0.28, pan=-0.24, humanize_ms=6.0)

    # Soaring Strings taking the triumphant chromatic-mediant lead in bars 4-7 + lush pad throughout
    strings_soar = [
        (0.0, "D5", 2.0, 0.70), (2.0, "F5", 2.0, 0.74),
        (4.0, "G5", 2.0, 0.72), (6.0, "F5", 2.0, 0.70),
        (8.0, "G5", 2.0, 0.76), (10.0, "A5", 2.0, 0.78),
        (12.0, "G5", 2.0, 0.76), (14.0, "A5", 2.0, 0.78),
        # Chromatic mediant lift! Strings soar front-and-center
        (16.0, "Ab5", 1.5, 0.90), (17.5, "Gb5", 0.5, 0.82), (18.0, "F5", 1.0, 0.86), (19.0, "Eb5", 1.0, 0.84),
        (20.0, "G5", 1.5, 0.92), (21.5, "F5", 0.5, 0.84), (22.0, "Eb5", 1.0, 0.86), (23.0, "D5", 1.0, 0.84),
        (24.0, "Eb5", 1.25, 0.88), (25.25, "F5", 0.75, 0.86), (26.0, "G5", 1.25, 0.90), (27.25, "Bb5", 0.75, 0.92),
        (28.0, "A5", 2.0, 0.92), (30.0, "G5", 2.0, 0.88),
        (32.0, "Bb5", 2.0, 0.92), (34.0, "C6", 2.0, 0.94),
        (36.0, "Bb5", 2.0, 0.92), (38.0, "A5", 2.0, 0.94),
    ]
    add_melody(evts, "string_ensemble_1", strings_soar, swell=0.30, pan=-0.26, humanize_ms=6.5)

    # Warm lush string_ensemble_2 inner harmony bed
    pad_chords = [
        (0.0, ["F4", "A4", "C5"], 4.0), (4.0, ["F4", "A4", "Bb4"], 4.0),
        (8.0, ["G4", "Bb4", "D5"], 4.0), (12.0, ["G4", "A4", "C5"], 4.0),
        (16.0, ["F4", "Ab4", "C5"], 4.0), (20.0, ["G4", "Bb4", "C5"], 4.0),
        (24.0, ["G4", "Bb4", "D5"], 4.0), (28.0, ["G4", "A4", "D5"], 4.0),
        (32.0, ["F4", "Bb4", "Db5"], 2.0), (34.0, ["Gb4", "C5", "Eb5"], 2.0),
        (36.0, ["F4", "Bb4", "D5"], 2.0), (38.0, ["Gb4", "A4", "Eb5"], 2.0),
    ]
    for b, ch, d in pad_chords:
        for nt in ch:
            evts.append(NoteEvent("string_ensemble_2", nt, b, d, 0.56, pan=0.14, swell=0.32, humanize_ms=8.0))

    # Sparkling Vibraphone — shimmering prime-time studio electricity!
    vibe_bars = [
        (0.0,  ["C5", "D5", "F5", "A5", "D5", "F5", "A5", "C6"]),
        (4.0,  ["A4", "Bb4", "D5", "F5", "Bb4", "D5", "F5", "A5"]),
        (8.0,  ["G4", "Bb4", "D5", "F5", "A5", "G5", "D5", "Bb4"]),
        (12.0, ["G4", "Bb4", "C5", "Eb5", "G5", "A5", "D5", "C5"]),
        (16.0, ["Eb5", "F5", "Ab5", "C6", "Ab5", "F5", "Eb5", "C5"]),
        (20.0, ["F5", "G5", "Bb5", "C6", "Bb5", "G5", "F5", "C5"]),
        (24.0, ["D5", "Eb5", "G5", "Bb5", "G5", "Eb5", "D5", "Bb4"]),
        (28.0, ["G4", "A4", "C5", "D5", "G5", "A5", "C6", "D6"]),
        (32.0, ["Db5", "F5", "Gb5", "Bb5", "Eb5", "Gb5", "Ab5", "C6"]),
        (36.0, ["D5", "F5", "Bb5", "D6", "Eb5", "Gb5", "A5", "C6"]),
    ]
    for b0, arp in vibe_bars:
        for i, nt in enumerate(arp):
            vel = 0.72 if i in (0, 3, 6) else 0.54
            evts.append(NoteEvent("vibraphone", nt, b0 + i * 0.5, 1.15, vel, pan=0.26, humanize_ms=5.0))

    # Agile Flute celebratory broadcast runs answering the brass
    flute_runs = [
        (3.0, ["D6", "C6", "Bb5", "A5"], 0.25),
        (7.0, ["C6", "D6", "F6", "G6"], 0.25),
        (11.0, ["A5", "Bb5", "C6", "D6"], 0.25),
        (15.0, ["C6", "D6", "Eb6", "F6"], 0.25),
        (19.0, ["C6", "Db6", "Eb6", "F6"], 0.25),
        (23.0, ["D6", "Eb6", "F6", "G6"], 0.25),
        (31.0, ["G5", "A5", "Bb5", "C6"], 0.25),
        (39.0, ["C6", "D6", "Eb6", "F6"], 0.25),
    ]
    for b0, run, step in flute_runs:
        for i, nt in enumerate(run):
            evts.append(NoteEvent("flute", nt, b0 + i * step, step * 1.35, 0.74 + 0.04 * i, pan=-0.18, humanize_ms=4.0))

    return evts


# ============================================================================
# SYMPHONY 3: STAGE 5 — GRAND ROTUNDA, LONDON (Lord Alistair Finch)
# 112 BPM | 4/4 | 9 bars (4+5 Baroque-Edwardian invention) | D Minor -> F Major -> A7
# ============================================================================

def compose_stage5_london() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 9-bar aristocratic chromatic descent & relative-major modulation:
    # 0: Dm | 1: A7/C# | 2: Dm/C | 3: G7/B (witty Baroque question)
    # 4: Bbmaj7 | 5: F/A | 6: Gm7 -> C7 | 7: Eø7 -> Dm/F | 8: A7sus4 -> A7 (poised cadence!)

    # Aristocratic Harpsichord continuo — Baroque arpeggios + mordents
    harp_bars = [
        (0.0,  ["D4", "F4", "A4", "D5", "A4", "F4", "E4", "A4"]),   # Dm
        (4.0,  ["C#4", "E4", "G4", "A4", "E4", "G4", "A4", "C#5"]), # A7/C#
        (8.0,  ["C4", "F4", "A4", "D5", "A4", "F4", "D4", "F4"]),   # Dm/C
        (12.0, ["B3", "D4", "F4", "G4", "D4", "F4", "G4", "B4"]),   # G7/B
        (16.0, ["Bb3", "D4", "F4", "A4", "F4", "D4", "F4", "Bb4"]), # Bbmaj7
        (20.0, ["A3", "C4", "F4", "A4", "F4", "C4", "E4", "A4"]),   # F/A
        (24.0, ["G3", "Bb3", "D4", "F4", "C4", "E4", "G4", "Bb4"]), # Gm7 -> C7
        (28.0, ["E3", "G3", "Bb3", "D4", "F3", "A3", "D4", "F4"]),  # Eø7 -> Dm/F
        (32.0, ["A3", "D4", "E4", "A4", "C#4", "E4", "G4", "A4"]),  # A7sus4 -> A7
    ]
    for b0, pat in harp_bars:
        for i, nt in enumerate(pat):
            vel = 0.72 if i in (0, 4) else 0.54
            evts.append(NoteEvent("harpsichord", nt, b0 + i * 0.5, 0.55, vel, pan=-0.34, humanize_ms=4.5))
    # Crisp Baroque harpsichord ornament flourish at bar 8
    for i, nt in enumerate(["A5", "G5", "F5", "E5", "D5", "C#5", "E5", "A4"]):
        evts.append(NoteEvent("harpsichord", nt, 34.0 + i * 0.25, 0.30, 0.66 - i * 0.02, pan=-0.30, humanize_ms=3.0))

    # Solo Oboe — witty, aristocratic Edwardian melody (Voice 1 of counterpoint)
    oboe_mel = [
        (0.0, "A4", 0.5, 0.78), (0.5, "D5", 0.75, 0.84), (1.25, "F5", 0.75, 0.88), (2.0, "E5", 0.5, 0.82), (2.5, "D5", 0.5, 0.78), (3.0, "F5", 0.5, 0.84), (3.5, "E5", 0.5, 0.80),
        (4.0, "C#5", 1.0, 0.84), (5.0, "E5", 0.5, 0.82), (5.5, "G5", 1.0, 0.88), (6.5, "F5", 0.5, 0.80), (7.0, "E5", 1.0, 0.78),
        (8.0, "F5", 0.75, 0.86), (8.75, "E5", 0.25, 0.74), (9.0, "D5", 0.5, 0.80), (9.5, "C5", 0.5, 0.76), (10.0, "D5", 1.0, 0.84), (11.0, "A4", 1.0, 0.76),
        (12.0, "B4", 0.75, 0.80), (12.75, "D5", 0.75, 0.84), (13.5, "F5", 0.5, 0.86), (14.0, "E5", 1.25, 0.82),
        # Bars 4-8: soaring Edwardian nobility with mordent turns
        (16.0, "F5", 1.0, 0.88), (17.0, "D5", 0.5, 0.80), (17.5, "Bb4", 0.5, 0.76), (18.0, "A4", 1.0, 0.82), (19.0, "D5", 1.0, 0.86),
        (20.0, "C5", 1.25, 0.86), (21.25, "A4", 0.75, 0.78), (22.0, "F5", 1.0, 0.88), (23.0, "E5", 1.0, 0.84),
        (24.0, "D5", 0.5, 0.84), (24.5, "Bb4", 0.5, 0.78), (25.0, "G4", 0.5, 0.76), (25.5, "A4", 0.5, 0.80), (26.0, "Bb4", 0.75, 0.84), (26.75, "C5", 0.75, 0.86), (27.5, "E5", 0.5, 0.84),
        (28.0, "G5", 1.0, 0.92), (29.0, "F5", 0.5, 0.84), (29.5, "E5", 0.5, 0.82), (30.0, "D5", 1.0, 0.88), (31.0, "F5", 1.0, 0.86),
        (32.0, "E5", 1.5, 0.90), (33.5, "D5", 0.5, 0.80), (34.0, "C#5", 1.5, 0.84),
    ]
    add_melody(evts, "oboe", oboe_mel, swell=0.22, pan=0.14, humanize_ms=5.5)

    # Solo Bassoon — independent contrapuntal sparring partner (Voice 2: move & counter-move!)
    bassoon_ct = [
        (0.0, "D3", 1.0, 0.80), (1.0, "A2", 1.0, 0.74), (2.0, "D3", 0.5, 0.76), (2.5, "E3", 0.5, 0.78), (3.0, "F3", 0.5, 0.80), (3.5, "D3", 0.5, 0.76),
        (4.0, "C#3", 1.0, 0.80), (5.0, "A2", 0.5, 0.74), (5.5, "B2", 0.5, 0.76), (6.0, "C#3", 1.0, 0.82), (7.0, "A2", 1.0, 0.76),
        (8.0, "C3", 1.0, 0.80), (9.0, "A2", 0.5, 0.74), (9.5, "G2", 0.5, 0.74), (10.0, "F2", 0.5, 0.76), (10.5, "A2", 0.5, 0.78), (11.0, "D3", 1.0, 0.82),
        (12.0, "B2", 1.0, 0.80), (13.0, "G2", 1.0, 0.76), (14.0, "B2", 0.5, 0.78), (14.5, "C3", 0.5, 0.80), (15.0, "D3", 0.5, 0.82), (15.5, "C3", 0.5, 0.78),
        (16.0, "Bb2", 1.0, 0.82), (17.0, "F3", 0.5, 0.82), (17.5, "G3", 0.5, 0.84), (18.0, "F3", 1.0, 0.82), (19.0, "Bb2", 1.0, 0.78),
        (20.0, "A2", 1.0, 0.82), (21.0, "C3", 0.5, 0.80), (21.5, "F3", 0.5, 0.84), (22.0, "A3", 1.0, 0.86), (23.0, "G3", 1.0, 0.82),
        (24.0, "G2", 1.0, 0.80), (25.0, "Bb2", 0.5, 0.78), (25.5, "D3", 0.5, 0.80), (26.0, "C3", 1.0, 0.82), (27.0, "G2", 1.0, 0.78),
        (28.0, "E2", 1.0, 0.82), (29.0, "G2", 0.5, 0.80), (29.5, "Bb2", 0.5, 0.82), (30.0, "F2", 1.0, 0.84), (31.0, "A2", 1.0, 0.82),
        (32.0, "A2", 1.0, 0.86), (33.0, "E3", 1.0, 0.84), (34.0, "A2", 1.0, 0.86), (35.0, "G2", 0.5, 0.78), (35.5, "E2", 0.5, 0.76),
    ]
    add_melody(evts, "bassoon", bassoon_ct, swell=0.16, pan=0.24, humanize_ms=5.0)

    # Crisp Pizzicato + Chamber Strings framing the Baroque hall
    string_chords = [
        (0.0, ["D4", "F4", "A4"], True), (4.0, ["C#4", "E4", "A4"], True),
        (8.0, ["C4", "F4", "A4"], True), (12.0, ["B3", "F4", "G4"], True),
        (16.0, ["Bb3", "D4", "F4"], False), (20.0, ["A3", "C4", "F4"], False),
        (24.0, ["Bb3", "D4", "G4"], False), (26.0, ["C4", "E4", "Bb4"], False),
        (28.0, ["Bb3", "E4", "G4"], False), (30.0, ["A3", "D4", "F4"], False),
        (32.0, ["A3", "D4", "E4"], False), (34.0, ["A3", "C#4", "G4"], False),
    ]
    for b, ch, pizz_only in string_chords:
        dur = 2.0 if b >= 24.0 else 4.0
        if pizz_only:
            for beat_off in (0.0, 1.0, 2.0, 3.0):
                for nt in ch:
                    evts.append(NoteEvent(
                        "pizzicato_strings", nt, b + beat_off, 0.45,
                        0.66 if beat_off in (0.0, 2.0) else 0.50, pan=0.18, humanize_ms=4.5,
                    ))
        else:
            for nt in ch:
                evts.append(NoteEvent("string_ensemble_1", nt, b, dur, 0.62, pan=-0.22, swell=0.26, humanize_ms=6.0))
                evts.append(NoteEvent("pizzicato_strings", nt, b, 0.5, 0.52, pan=0.20, humanize_ms=4.0))

    # Grounded Cello bassline doubling Baroque harmonic pillars
    cello_pillars = [
        (0.0, "D2", 3.5), (4.0, "C#2", 3.5), (8.0, "C2", 3.5), (12.0, "B1", 3.5),
        (16.0, "Bb1", 3.8), (20.0, "A1", 3.8), (24.0, "G1", 1.9), (26.0, "C2", 1.9),
        (28.0, "E2", 1.9), (30.0, "F2", 1.9), (32.0, "A1", 3.8),
    ]
    for b, nt, d in cello_pillars:
        evts.append(NoteEvent("cello", nt, b, d, 0.72, pan=0.28, swell=0.20, humanize_ms=5.5))

    # Stately Edwardian French Horns entering with prestige across bars 4-8
    horn_noble = [
        (16.0, "F3", 2.0, 0.72), (16.0, "D4", 2.0, 0.68),
        (18.0, "F3", 2.0, 0.74), (18.0, "Bb3", 2.0, 0.70),
        (20.0, "C4", 2.0, 0.76), (20.0, "F3", 2.0, 0.72),
        (22.0, "A3", 2.0, 0.72), (22.0, "F3", 2.0, 0.70),
        (24.0, "G3", 2.0, 0.76), (24.0, "D4", 2.0, 0.72),
        (26.0, "G3", 2.0, 0.76), (26.0, "E4", 2.0, 0.72),
        (28.0, "Bb3", 2.0, 0.80), (30.0, "A3", 2.0, 0.80),
        (32.0, "A3", 2.0, 0.82), (32.0, "E4", 2.0, 0.76),
        (34.0, "A3", 1.8, 0.84), (34.0, "E4", 1.8, 0.78),
    ]
    add_melody(evts, "french_horn", horn_noble, swell=0.34, pan=-0.26, humanize_ms=6.5)

    return evts


# ============================================================================
# SYMPHONY 4: STAGE 6 — SHIBUYA RAIN-LIT SKY-DOME, TOKYO (Kenji Takahashi)
# 126 BPM | 5/4 (3+2 cyber-symphonic pulse!) | 8 bars = 40 beats | E Hirajoshi
# ============================================================================

def compose_stage6_tokyo() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 8 bars in 5/4 (grouped 3+2 = beats 0..2.5 + 3..4.5 per bar)
    # E Hirajoshi scale: E - F# - G - B - C
    # 0: Em9 | 1: Cmaj7#11/E | 2: Em(add9) | 3: Bsus4/F#
    # 4: Am9 | 5: Gmaj7/B    | 6: Cmaj7#11 | 7: B7sus4 -> B7(b9)

    koto_patterns = [
        # 10 eighth-notes per 5/4 bar (6 + 4 cyber-Hirajoshi cascade!)
        ["E4", "G4", "B4", "C5", "B4", "G4", "E5", "C5", "B4", "F#4"],  # 0: Em9
        ["C4", "G4", "B4", "E5", "F#5", "E5", "B4", "G4", "C5", "B4"],  # 1: Cmaj7#11/E
        ["E4", "F#4", "G4", "B4", "E5", "G5", "F#5", "E5", "B4", "G4"], # 2: Em(add9)
        ["F#4", "B4", "C5", "E5", "F#5", "E5", "B4", "F#4", "B3", "E4"],# 3: Bsus4/F#
        ["A3", "E4", "G4", "B4", "C5", "E5", "C5", "B4", "G4", "E4"],   # 4: Am9
        ["B3", "D4", "G4", "B4", "F#5", "G5", "F#5", "D5", "B4", "G4"], # 5: Gmaj7/B
        ["C4", "G4", "B4", "E5", "G5", "F#5", "E5", "B4", "G4", "E4"],  # 6: Cmaj7#11
        ["B3", "F#4", "A4", "B4", "E5", "F#5", "E5", "C5", "B4", "F#4"],# 7: B7sus4
    ]
    for bar, pat in enumerate(koto_patterns):
        b0 = bar * 5.0
        for i, nt in enumerate(pat):
            # 3+2 metric accents on steps 0, 3, 6, 8
            vel = 0.84 if i == 0 else (0.76 if i == 6 else (0.68 if i in (3, 8) else 0.56))
            evts.append(NoteEvent("koto", nt, b0 + i * 0.5, 0.95, vel, pan=-0.24, humanize_ms=3.5))
        # Crisp low koto thumb-pluck on beat 1 & beat 4 (3+2)
        low_root = ["E3", "C3", "E3", "F#3", "A2", "B2", "C3", "B2"][bar]
        evts.append(NoteEvent("koto", low_root, b0 + 0.0, 1.6, 0.84, pan=-0.30, humanize_ms=3.0))
        evts.append(NoteEvent("koto", low_root, b0 + 3.0, 1.3, 0.74, pan=-0.28, humanize_ms=3.0))

    # Breathy Shakuhachi — authentic Japanese 'ma' (spacious breathy phrases & grace inflections)
    shaku_phrase = [
        # Bar 0-1: poised breathy call
        (0.5, "F#4", 0.20, 0.58), (0.70, "G4", 1.80, 0.80), (2.75, "B4", 1.75, 0.88),
        (5.5, "C5", 1.50, 0.86), (7.0, "B4", 1.00, 0.78), (8.0, "G4", 1.50, 0.74),
        # Bar 2-3: piercing high answer across Shibuya rain
        (10.5, "B4", 0.25, 0.66), (10.75, "E5", 1.75, 0.90), (12.5, "F#5", 0.50, 0.84), (13.0, "E5", 1.50, 0.84),
        (15.5, "C5", 0.50, 0.78), (16.0, "B4", 2.25, 0.86), (18.5, "F#4", 1.00, 0.72),
        # Bar 4-5: soaring B-section cry in Am9 -> Gmaj7
        (20.0, "E5", 1.50, 0.92), (21.5, "G5", 1.00, 0.94), (22.5, "F#5", 0.50, 0.84), (23.0, "E5", 1.50, 0.86),
        (25.0, "D5", 1.00, 0.82), (26.0, "B4", 1.50, 0.84), (27.5, "G4", 1.75, 0.78),
        # Bar 6-7: resolute cyber-duel summit returning to E
        (30.5, "B4", 0.50, 0.80), (31.0, "E5", 1.50, 0.92), (32.5, "G5", 0.50, 0.90), (33.0, "F#5", 1.50, 0.88),
        (35.0, "E5", 1.50, 0.88), (36.5, "C5", 0.50, 0.80), (37.0, "B4", 2.25, 0.86),
    ]
    add_melody(evts, "shakuhachi", shaku_phrase, swell=0.38, pan=0.14, humanize_ms=7.0)

    # Neon Rain-Drop Celesta on the 2-beat tail of each 5/4 bar
    celesta_drops = [
        (3.0, ["E6", "B5", "G5", "F#5"]), (8.0, ["F#6", "E6", "B5", "G5"]),
        (13.0, ["G6", "F#6", "E6", "B5"]), (18.0, ["F#6", "C6", "B5", "F#5"]),
        (23.0, ["E6", "C6", "B5", "G5"]), (28.0, ["F#6", "D6", "B5", "G5"]),
        (33.0, ["G6", "E6", "B5", "G5"]), (38.0, ["F#6", "E6", "C6", "B5"]),
    ]
    for b0, drops in celesta_drops:
        for i, nt in enumerate(drops):
            evts.append(NoteEvent("celesta", nt, b0 + i * 0.5, 0.85, 0.64 - i * 0.04, pan=0.32, humanize_ms=4.0))

    # Rapid Spiccato/Pizzicato strings + cyber Tremolo Strings swells
    bass_roots = ["E2", "E2", "E2", "F#2", "A1", "B1", "C2", "B1"]
    trem_chords = [
        ["B4", "E5"], ["B4", "F#5"], ["G4", "E5"], ["B4", "F#5"],
        ["C5", "E5"], ["B4", "F#5"], ["B4", "G5"], ["C5", "F#5"],
    ]
    for bar in range(8):
        b0 = bar * 5.0
        root = bass_roots[bar]
        # Contrabass locking 3+2 pulse
        evts.append(NoteEvent("contrabass", root, b0 + 0.0, 2.75, 0.82, pan=0.20, humanize_ms=4.0))
        evts.append(NoteEvent("contrabass", root, b0 + 3.0, 1.80, 0.76, pan=0.20, humanize_ms=4.0))

        # Rapid spiccato eighth-note string_ensemble_1 + pizzicato engine
        spic_note = ["E4", "E4", "G4", "F#4", "E4", "D4", "E4", "F#4"][bar]
        for step in range(10):
            if step in (0, 2, 3, 5, 6, 8, 9):
                v = 0.66 if step in (0, 6) else 0.50
                evts.append(NoteEvent("string_ensemble_1", spic_note, b0 + step * 0.5, 0.28, v, staccato=True, pan=-0.28, humanize_ms=3.5))
                evts.append(NoteEvent("pizzicato_strings", spic_note, b0 + step * 0.5, 0.35, v * 0.88, pan=0.22, humanize_ms=3.5))

        # Cyber-symphonic tremolo string tension (brighter in bars 4-7)
        t_vel = 0.54 if bar < 4 else 0.72
        for nt in trem_chords[bar]:
            evts.append(NoteEvent("tremolo_strings", nt, b0, 4.9, t_vel, swell=0.32, pan=0.16, humanize_ms=6.0))

        # Disciplined Taiko Drum 5/4 (3+2) groove
        evts.append(NoteEvent("taiko_drum", "E2", b0 + 0.0, 0.65, 0.92, pan=0.04, humanize_ms=3.0))
        evts.append(NoteEvent("taiko_drum", "B2", b0 + 1.5, 0.35, 0.56, pan=0.08, humanize_ms=3.0))
        evts.append(NoteEvent("taiko_drum", "E2", b0 + 2.5, 0.35, 0.62, pan=0.02, humanize_ms=3.0))
        evts.append(NoteEvent("taiko_drum", "G2", b0 + 3.0, 0.60, 0.84, pan=0.04, humanize_ms=3.0))
        evts.append(NoteEvent("taiko_drum", "B2", b0 + 4.5, 0.35, 0.66 if bar != 7 else 0.82, pan=0.08, humanize_ms=3.0))
        if bar in (3, 7):
            # Crisp double-taiko fill on final beat of phrase
            evts.append(NoteEvent("taiko_drum", "G2", b0 + 4.0, 0.30, 0.76, pan=0.04, humanize_ms=2.5))
            evts.append(NoteEvent("taiko_drum", "E2", b0 + 4.25, 0.30, 0.80, pan=0.04, humanize_ms=2.5))

    return evts


# ============================================================================
# SYMPHONY 5: STAGE 7 — GREAT STARLIGHT PAVILION, GIZA (Nadia Al-Mansoor)
# 108 BPM | 4/4 (3+3+2 Maqsum desert pulse) | 9 bars (4+5) | D Hijaz (Phrygian Dominant)
# ============================================================================

def compose_stage7_cairo() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # D Hijaz scale: D - Eb - F# - G - A - Bb - C
    # 9-bar desert starlight journey:
    # 0: D5 (drone) | 1: EbMaj7/D | 2: D5 | 3: Cm7/D (hypnotic Giza mirage)
    # 4: Gm9        | 5: EbMaj7   | 6: D/F# | 7: BbMaj7 -> Gm6 | 8: A7b9/D -> D

    # Deep Cello + Contrabass monumental Giza pedal shifting in bars 4-8
    pedal_bars = [
        (0.0, "D2", "A2", 4.0), (4.0, "D2", "Bb2", 4.0), (8.0, "D2", "A2", 4.0), (12.0, "D2", "G2", 4.0),
        (16.0, "G1", "D2", 4.0), (20.0, "Eb2", "Bb2", 4.0), (24.0, "F#2", "D3", 4.0),
        (28.0, "Bb1", "F2", 2.0), (30.0, "G1", "D2", 2.0), (32.0, "A1", "E2", 4.0),
    ]
    for b, root, fifth, d in pedal_bars:
        evts.append(NoteEvent("contrabass", root, b, d, 0.62, pan=0.20, swell=0.22, humanize_ms=6.0))
        evts.append(NoteEvent("cello", root, b, d, 0.54, pan=0.28, swell=0.28, humanize_ms=6.5))
        evts.append(NoteEvent("cello", fifth, b, d, 0.50, pan=0.32, swell=0.30, humanize_ms=7.0))

    # Plucked Nylon Guitar (oud feel) + Concert Harp (qanun shimmer) on 3+3+2 desert grid!
    oud_chords = [
        ["D3", "A3", "D4", "F#4", "A4", "F#4", "Eb4", "D4"],  # 0: D Hijaz
        ["D3", "Bb3", "Eb4", "G4", "Bb4", "G4", "Eb4", "D4"], # 1: Eb/D
        ["D3", "A3", "F#4", "G4", "A4", "F#4", "Eb4", "A3"],  # 2: D Hijaz
        ["D3", "G3", "C4", "Eb4", "G4", "F#4", "Eb4", "C4"],  # 3: Cm/D
        ["G2", "D3", "A3", "Bb3", "D4", "G4", "F#4", "D4"],   # 4: Gm9
        ["Eb3", "Bb3", "D4", "G4", "Bb4", "G4", "D4", "Bb3"], # 5: EbMaj7
        ["F#3", "A3", "D4", "F#4", "A4", "F#4", "Eb4", "D4"], # 6: D/F#
        ["Bb2", "F3", "A3", "D4", "G2", "D3", "Bb3", "E4"],   # 7: BbMaj7 -> Gm6
        ["A2", "E3", "Bb3", "C#4", "E4", "G4", "Eb4", "A3"],  # 8: A7b9
    ]
    for bar, pat in enumerate(oud_chords):
        b0 = bar * 4.0
        for i, nt in enumerate(pat):
            # Accent 3+3+2 pulses (0, 3, 6)
            vel = 0.78 if i in (0, 3, 6) else 0.56
            evts.append(NoteEvent("acoustic_guitar_nylon", nt, b0 + i * 0.5, 0.90, vel, pan=-0.26, humanize_ms=5.5))
        # Starlight Concert Harp sweeps on downbeats & 3+3+2 peaks
        add_strum(evts, "orchestral_harp", pat[:4], b0, 2.2, vel=0.58, stagger_ms=24.0, pan=-0.42)
        if bar in (1, 3, 5, 7, 8):
            add_strum(evts, "orchestral_harp", pat[3:7], b0 + 1.5, 1.8, vel=0.54, stagger_ms=22.0, downstroke=False, pan=-0.46)

    # Evocative Modal Solo Oboe — authentic Hijaz augmented-second ornaments!
    oboe_hijaz = [
        (0.0, "A4", 1.25, 0.84), (1.25, "Bb4", 0.25, 0.76), (1.5, "A4", 0.5, 0.80), (2.0, "G4", 0.5, 0.78), (2.5, "F#4", 0.75, 0.86), (3.25, "Eb4", 0.75, 0.82),
        (4.0, "D4", 1.5, 0.82), (5.5, "Eb4", 0.5, 0.76), (6.0, "F#4", 1.0, 0.84), (7.0, "G4", 1.0, 0.80),
        (8.0, "A4", 1.0, 0.86), (9.0, "C5", 0.5, 0.84), (9.5, "Bb4", 0.5, 0.80), (10.0, "A4", 0.75, 0.84), (10.75, "F#4", 0.75, 0.86), (11.5, "Eb4", 0.5, 0.78),
        (12.0, "G4", 1.5, 0.84), (13.5, "F#4", 0.5, 0.80), (14.0, "Eb4", 1.25, 0.78),
        # Bars 4-8: Desert Pavilion Starlight climax (Oboe + Flute duet)
        (16.0, "Bb4", 1.5, 0.88), (17.5, "A4", 0.5, 0.82), (18.0, "G4", 1.0, 0.84), (19.0, "D5", 1.0, 0.90),
        (20.0, "Eb5", 1.25, 0.92), (21.25, "D5", 0.75, 0.84), (22.0, "Bb4", 1.0, 0.84), (23.0, "G4", 1.0, 0.80),
        (24.0, "A4", 1.0, 0.88), (25.0, "F#4", 0.5, 0.84), (25.5, "G4", 0.5, 0.84), (26.0, "A4", 1.25, 0.90), (27.25, "C5", 0.75, 0.86),
        (28.0, "D5", 1.5, 0.92), (29.5, "C5", 0.5, 0.82), (30.0, "Bb4", 1.0, 0.86), (31.0, "G4", 1.0, 0.82),
        (32.0, "A4", 1.25, 0.88), (33.25, "Bb4", 0.25, 0.78), (33.5, "A4", 0.5, 0.82), (34.0, "G4", 0.75, 0.80), (34.75, "F#4", 0.75, 0.84), (35.5, "Eb4", 0.5, 0.78),
    ]
    add_melody(evts, "oboe", oboe_hijaz, swell=0.34, pan=0.14, humanize_ms=7.0)

    # Shimmering Concert Flute — ethereal starlight answers & high Hijaz harmonies
    flute_starlight = [
        (5.5, "G5", 0.5, 0.68), (6.0, "A5", 1.0, 0.76), (7.0, "Bb5", 1.0, 0.74),
        (13.0, "C6", 0.5, 0.72), (13.5, "Bb5", 0.5, 0.70), (14.0, "A5", 1.5, 0.76),
        # Duet soaring above oboe in bars 4-8
        (16.0, "D5", 1.5, 0.76), (17.5, "C5", 0.5, 0.72), (18.0, "Bb5", 1.5, 0.82), (19.5, "A5", 0.5, 0.76),
        (20.0, "G5", 1.5, 0.84), (21.5, "F#5", 0.5, 0.78), (22.0, "G5", 1.0, 0.80), (23.0, "Bb5", 1.0, 0.82),
        (24.0, "A5", 1.5, 0.86), (25.5, "Bb5", 0.5, 0.80), (26.0, "A5", 1.0, 0.84), (27.0, "F#5", 1.0, 0.82),
        (28.0, "F5", 1.5, 0.82), (29.5, "Eb5", 0.5, 0.76), (30.0, "D5", 1.5, 0.82),
        (32.5, "E5", 0.5, 0.74), (33.0, "G5", 1.0, 0.80), (34.0, "F#5", 1.5, 0.82),
    ]
    add_melody(evts, "flute", flute_starlight, swell=0.32, pan=-0.20, humanize_ms=6.5)

    # Golden French Horn desert-horizon swells
    horn_swells = [
        (8.0, "D3", 3.8, 0.72), (8.0, "A3", 3.8, 0.68),
        (16.0, "G3", 3.8, 0.78), (16.0, "D4", 3.8, 0.74),
        (20.0, "Eb3", 3.8, 0.80), (20.0, "Bb3", 3.8, 0.76),
        (24.0, "F#3", 3.8, 0.80), (24.0, "D4", 3.8, 0.76),
        (28.0, "F3", 2.0, 0.82), (30.0, "G3", 2.0, 0.82),
        (32.0, "A3", 3.8, 0.86), (32.0, "E4", 3.8, 0.78),
    ]
    add_melody(evts, "french_horn", horn_swells, swell=0.45, pan=-0.26, humanize_ms=7.0)

    # Deep Desert Percussion (Taiko + Timpani) on authentic 3+3+2 Maqsum rhythm!
    for bar in range(9):
        b0 = bar * 4.0
        t_root = ["D2", "Eb2", "D2", "D2", "G2", "Eb2", "D2", "Bb2", "A2"][bar]
        # Dum - tak - Dum - tak (0.0, 1.5, 2.5, 3.0)
        evts.append(NoteEvent("taiko_drum", "D2", b0 + 0.0, 0.65, 0.86, pan=0.04, humanize_ms=4.0))
        evts.append(NoteEvent("timpani", t_root, b0 + 0.0, 0.85, 0.76, pan=-0.08, humanize_ms=4.5))
        evts.append(NoteEvent("taiko_drum", "A2", b0 + 1.5, 0.40, 0.64, pan=0.10, humanize_ms=4.0))
        evts.append(NoteEvent("taiko_drum", "D2", b0 + 2.5, 0.45, 0.68, pan=0.02, humanize_ms=4.0))
        evts.append(NoteEvent("taiko_drum", "A2", b0 + 3.0, 0.45, 0.72, pan=0.08, humanize_ms=4.0))
        if bar in (3, 7, 8):
            evts.append(NoteEvent("timpani", t_root, b0 + 3.5, 0.45, 0.74, pan=-0.08, humanize_ms=3.5))

    return evts


# ============================================================================
# SYMPHONY 6: STAGE 8 — 1.4-BILLION WORLDWIDE SIMULCAST FINALE (Viktor Volkov)
# 132 BPM | 4/4 | 11 bars (4+4+3 colossal climax) | C Minor -> Ab -> Eb -> G7
# ============================================================================

def compose_stage8_finale() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 11-bar epic championship symphony (4 + 4 + 3 towering cadence):
    # 0: Cm   | 1: Ab/C  | 2: Fm7/C | 3: G7/B
    # 4: Ab   | 5: Bb    | 6: Eb/G  | 7: Fm9
    # 8: DbMaj7 (epic Neapolitan!) | 9: Dø7 -> G7sus4 | 10: G7 (grand finale return!)

    chords = [
        ("C2", "G2", ["C4", "Eb4", "G4"]),   # 0: Cm
        ("C2", "Ab2", ["C4", "Eb4", "Ab4"]), # 1: Ab/C
        ("C2", "F2", ["C4", "F4", "Ab4"]),   # 2: Fm/C
        ("B1", "G2", ["B3", "D4", "G4"]),    # 3: G7/B
        ("Ab1", "Eb2", ["C4", "Eb4", "Ab4"]),# 4: Ab
        ("Bb1", "F2", ["D4", "F4", "Bb4"]),  # 5: Bb
        ("G1", "Eb2", ["Eb4", "G4", "Bb4"]), # 6: Eb/G
        ("F1", "C2", ["C4", "Eb4", "G4"]),   # 7: Fm9
        ("Db2", "Ab2", ["Db4", "F4", "Ab4"]),# 8: DbMaj7 (Neapolitan blaze!)
        ("D2", "Ab2", ["C4", "F4", "Ab4"]),  # 9: Dø7
        ("G1", "D2", ["B3", "F4", "G4"]),    # 10: G7
    ]

    # Driving low strings (contrabass + cello) + thunderous trombones + timpani
    for bar, (root, fifth, tri) in enumerate(chords):
        b0 = bar * 4.0
        # Colossal Contrabass & Trombone foundation
        evts.append(NoteEvent("contrabass", root, b0, 3.85, 0.90, pan=0.22, humanize_ms=4.5))
        evts.append(NoteEvent("trombone", root if note_to_midi(root) >= 40 else fifth, b0, 3.6, 0.84, swell=0.24, pan=0.36, humanize_ms=5.0))
        evts.append(NoteEvent("trombone", tri[0], b0, 3.6, 0.74, swell=0.24, pan=0.38, humanize_ms=5.5))

        # Urgent driving Cello 8th-note championship ostinato
        for step in range(8):
            c_nt = root if step in (0, 3, 6) else fifth
            vel = 0.84 if step in (0, 3, 6) else 0.64
            evts.append(NoteEvent("cello", c_nt, b0 + step * 0.5, 0.42, vel, staccato=True, pan=0.28, humanize_ms=3.5))

        # Double String Ensembles (ensemble 2 lush body + tremolo intensity in climax)
        for nt in tri:
            evts.append(NoteEvent("string_ensemble_2", nt, b0, 3.9, 0.72, swell=0.28, pan=0.14, humanize_ms=6.0))
        if bar >= 4:
            high_nt = midi_to_musyngkite(note_to_midi(tri[2]) + 12)
            evts.append(NoteEvent("tremolo_strings", high_nt, b0, 3.9, 0.62 if bar < 8 else 0.78, swell=0.30, pan=0.18, humanize_ms=5.0))

        # Thunderous Timpani + Taiko championship percussion
        t_nt = ["C2", "Ab2", "F2", "G2", "Ab2", "Bb2", "Eb2", "F2", "Db2", "D2", "G2"][bar]
        evts.append(NoteEvent("timpani", t_nt, b0 + 0.0, 0.80, 0.94, pan=-0.06, humanize_ms=3.0))
        evts.append(NoteEvent("taiko_drum", "C2", b0 + 0.0, 0.60, 0.86, pan=0.04, humanize_ms=3.0))
        evts.append(NoteEvent("timpani", t_nt, b0 + 1.5, 0.50, 0.76, pan=-0.06, humanize_ms=3.5))
        evts.append(NoteEvent("taiko_drum", "G2", b0 + 2.5, 0.45, 0.74, pan=0.06, humanize_ms=3.5))
        evts.append(NoteEvent("timpani", t_nt, b0 + 3.0, 0.60, 0.84, pan=-0.06, humanize_ms=3.0))

    # Climax timpani crescendo roll on bar 10 beats 2..4
    for i in range(8):
        evts.append(NoteEvent("timpani", "G2" if i % 2 == 0 else "C2", 42.0 + i * 0.25, 0.30, 0.60 + i * 0.055, pan=-0.06, humanize_ms=2.0))

    # Blazing Heroic Main Theme — Trumpets + French Horns + Violin Ensemble 1 in octaves!
    heroic_melody = [
        (0.0, "C5", 1.25, 0.94), (1.25, "G4", 0.75, 0.84), (2.0, "Eb5", 1.0, 0.94), (3.0, "D5", 1.0, 0.90),
        (4.0, "C5", 1.5, 0.94), (5.5, "Bb4", 0.5, 0.84), (6.0, "Ab4", 1.0, 0.88), (7.0, "G4", 1.0, 0.86),
        (8.0, "Ab4", 1.25, 0.90), (9.25, "C5", 0.75, 0.88), (10.0, "F5", 1.0, 0.96), (11.0, "Eb5", 1.0, 0.92),
        (12.0, "D5", 2.0, 0.96), (14.0, "B4", 1.0, 0.86), (15.0, "D5", 1.0, 0.90),
        # Bars 4-7: 1.4-Billion-Viewer Global Elevation!
        (16.0, "Eb5", 1.25, 0.96), (17.25, "F5", 0.75, 0.92), (18.0, "G5", 1.0, 0.98), (19.0, "Ab5", 1.0, 1.00),
        (20.0, "F5", 1.5, 0.96), (21.5, "Eb5", 0.5, 0.88), (22.0, "D5", 1.0, 0.92), (23.0, "F5", 1.0, 0.94),
        (24.0, "G5", 1.5, 0.98), (25.5, "F5", 0.5, 0.90), (26.0, "Eb5", 1.0, 0.94), (27.0, "Bb5", 1.0, 1.00),
        (28.0, "Ab5", 1.5, 0.98), (29.5, "G5", 0.5, 0.90), (30.0, "F5", 1.0, 0.92), (31.0, "Eb5", 1.0, 0.90),
        # Bars 8-10: Towering 3-Bar Neapolitan Championship Climax!
        (32.0, "F5", 1.5, 0.98), (33.5, "Gb5", 0.5, 0.92), (34.0, "Ab5", 2.0, 1.02),
        (36.0, "Ab5", 1.5, 1.00), (37.5, "G5", 0.5, 0.92), (38.0, "F5", 1.0, 0.94), (39.0, "D5", 1.0, 0.92),
        (40.0, "G5", 2.0, 1.02), (42.0, "F5", 1.0, 0.94), (43.0, "D5", 1.0, 0.96),
    ]
    add_melody(evts, "trumpet", heroic_melody, swell=0.18, pan=0.22, humanize_ms=4.5)
    add_melody(evts, "string_ensemble_1", [
        (b, midi_to_musyngkite(note_to_midi(nt) + 12) if note_to_midi(nt) <= 77 else nt, d, v * 0.92)
        for b, nt, d, v in heroic_melody
    ], swell=0.24, pan=-0.26, humanize_ms=5.5)
    add_melody(evts, "french_horn", [
        (b, midi_to_musyngkite(note_to_midi(nt) - 12), d, v * 0.94)
        for b, nt, d, v in heroic_melody
    ], swell=0.26, pan=-0.24, humanize_ms=5.5)

    # Brass Section fanfare punctuation hits on monumental transitions
    for b, ch in [
        (0.0, ["C4", "G4", "C5"]), (12.0, ["G3", "B3", "D4", "G4"]),
        (16.0, ["Ab3", "Eb4", "Ab4"]), (24.0, ["G3", "Eb4", "G4"]),
        (32.0, ["Db4", "F4", "Ab4"]), (40.0, ["G3", "B3", "D4", "G4"]),
    ]:
        for nt in ch:
            evts.append(NoteEvent("brass_section", nt, b, 1.4, 0.72, pan=0.12, humanize_ms=4.5))

    # Sweeping Concert Harp Glissandos at dramatic structural seams!
    add_glissando(evts, "orchestral_harp", ["C3", "D3", "Eb3", "G3", "Ab3", "C4", "D4", "Eb4", "G4", "Ab4", "C5", "Eb5"], 14.5, 1.5, 0.56, 0.92, pan=-0.46)
    add_glissando(evts, "orchestral_harp", ["F3", "Ab3", "C4", "Db4", "F4", "Ab4", "C5", "Db5", "F5", "Ab5"], 30.5, 1.5, 0.58, 0.94, pan=-0.46)
    add_glissando(evts, "orchestral_harp", ["G3", "B3", "D4", "F4", "G4", "B4", "D5", "F5", "G5", "B5", "C6"], 42.5, 1.5, 0.62, 0.96, pan=-0.46)

    # Cathedral Tubular Bells tolling world-championship gravitas!
    for b, nt, v in [
        (0.0, "C4", 0.90), (8.0, "F4", 0.84), (12.0, "G4", 0.88),
        (16.0, "Ab4", 0.92), (24.0, "Eb4", 0.90), (32.0, "Db4", 0.92), (40.0, "G4", 0.96),
    ]:
        evts.append(NoteEvent("tubular_bells", nt, b, 3.2, v, pan=0.20, humanize_ms=4.0))

    return evts


# ============================================================================
# SYMPHONY 7: BRANCH — LATE-NIGHT UNDERDOG REDEMPTION CIRCUIT
# 88 BPM | 4/4 (smoky swung 12/8 feel) | 7 bars (4+3 asymmetric 2 AM noir!) | C Dorian Noir
# ============================================================================

def compose_branch_redemption() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 7-bar asymmetric smoky comeback chord progression (ZERO square 4-bar loop!):
    # 0: Cm9 | 1: F13/C | 2: Abmaj7#11 | 3: G7#9 (2 AM bruised question)
    # 4: Fm9 | 5: Dø7   | 6: G7alt (gritty 3-bar resolve home to C!)

    # Walking Upright Contrabass — authentic smoky 2 AM jazz bassline with swung skip-notes
    walk = [
        (0.0, "C2", 0.95, 0.86), (1.0, "D2", 0.95, 0.78), (2.0, "Eb2", 0.95, 0.82), (3.0, "E2", 0.75, 0.78), (3.5, "E2", 0.45, 0.62),
        (4.0, "F2", 0.95, 0.84), (5.0, "G2", 0.95, 0.78), (6.0, "A2", 0.95, 0.82), (7.0, "G2", 0.95, 0.78),
        (8.0, "Ab1", 0.95, 0.86), (9.0, "Bb1", 0.95, 0.78), (10.0, "C2", 0.95, 0.82), (11.0, "Ab1", 0.95, 0.78),
        (12.0, "G1", 0.95, 0.88), (13.0, "B1", 0.95, 0.80), (14.0, "D2", 0.95, 0.82), (15.0, "F#2", 0.75, 0.78), (15.5, "G2", 0.45, 0.66),
        (16.0, "F2", 0.95, 0.86), (17.0, "G2", 0.95, 0.80), (18.0, "Ab2", 0.95, 0.84), (19.0, "Eb2", 0.95, 0.78),
        (20.0, "D2", 0.95, 0.86), (21.0, "F2", 0.95, 0.80), (22.0, "Ab2", 0.95, 0.84), (23.0, "C2", 0.95, 0.78),
        (24.0, "G1", 0.95, 0.88), (25.0, "Ab1", 0.95, 0.82), (26.0, "B1", 0.95, 0.84), (27.0, "D2", 0.65, 0.80), (27.5, "G1", 0.45, 0.74),
    ]
    add_melody(evts, "contrabass", walk, swell=0.0, pan=0.18, humanize_ms=6.5)

    # Moody Low Grand Piano — dark rootless jazz voicings with swung human comping
    piano_comps = [
        (0.0,  ["Eb3", "G3", "Bb3", "D4"], 2.2, 0.62),
        (2.5,  ["Eb3", "G3", "Bb3", "D4"], 1.1, 0.50),
        (4.0,  ["Eb3", "A3", "D4", "G4"], 2.0, 0.60),
        (6.5,  ["Eb3", "G3", "A3", "D4"], 1.2, 0.52),
        (8.0,  ["G3", "C4", "D4", "G4"], 2.4, 0.64),
        (10.5, ["G3", "C4", "Eb4"], 1.1, 0.52),
        (12.0, ["F3", "B3", "Eb4", "Bb4"], 2.0, 0.64),
        (14.5, ["F3", "Ab3", "B3", "E4"], 1.2, 0.56),
        (16.0, ["Eb3", "G3", "Ab3", "C4"], 2.2, 0.64),
        (18.5, ["G3", "Ab3", "C4", "Eb4"], 1.1, 0.54),
        (20.0, ["F3", "Ab3", "C4", "D4"], 2.2, 0.64),
        (22.5, ["F3", "Ab3", "C4", "G4"], 1.1, 0.56),
        (24.0, ["F3", "Ab3", "B3", "Eb4"], 1.8, 0.66),
        (26.5, ["F3", "Ab3", "B3", "E4"], 1.2, 0.60),
    ]
    for b, ch, d, v in piano_comps:
        add_strum(evts, "acoustic_grand_piano", ch, b, d, vel=v, stagger_ms=22.0, pan=-0.26)

    # Sparse moody piano right-hand rainy-window drops
    piano_drops = [
        (3.0, "G4", 0.7, 0.48), (3.5, "F4", 0.5, 0.44),
        (11.0, "D5", 0.7, 0.50), (11.5, "C5", 0.5, 0.46),
        (19.0, "G4", 0.7, 0.50), (23.0, "Eb5", 0.8, 0.52), (27.0, "D5", 0.7, 0.48),
    ]
    add_melody(evts, "acoustic_grand_piano", piano_drops, swell=0.0, pan=-0.20, humanize_ms=7.0)

    # Smoky Muted Trumpet — unhurried, soulful 2 AM comeback melody with expressive space!
    muted_lead = [
        # Bars 0-1: Smoky, blue-lit entrance
        (0.5, "G4", 0.5, 0.74), (1.0, "Bb4", 0.5, 0.78), (1.5, "C5", 1.5, 0.86), (3.0, "Eb5", 0.5, 0.84), (3.5, "D5", 0.5, 0.78),
        (4.0, "C5", 1.25, 0.82), (5.25, "A4", 0.75, 0.76), (6.0, "G4", 1.5, 0.74),
        # Bars 2-3: Defiant bruised lift on Abmaj7#11 -> G7#9
        (8.5, "D5", 1.25, 0.88), (9.75, "C5", 0.75, 0.80), (10.5, "G4", 1.0, 0.76),
        (12.0, "Bb4", 1.0, 0.84), (13.0, "Ab4", 0.5, 0.78), (13.5, "G4", 1.75, 0.80),
        # Bars 4-6: Gritty underdog comeback heart (3-bar asymmetric consequent!)
        (16.5, "G4", 0.5, 0.78), (17.0, "Ab4", 0.5, 0.82), (17.5, "C5", 1.5, 0.90), (19.0, "Eb5", 1.0, 0.88),
        (20.0, "D5", 1.0, 0.86), (21.0, "C5", 0.5, 0.82), (21.5, "Ab4", 1.5, 0.82),
        (23.5, "G4", 0.5, 0.78), (24.0, "B4", 1.25, 0.86), (25.25, "Ab4", 0.75, 0.80), (26.0, "G4", 1.5, 0.78),
    ]
    add_melody(evts, "muted_trumpet", muted_lead, swell=0.34, pan=-0.10, humanize_ms=8.5)

    # Lonely Solo Cello — soulful 2 AM human counterpoint weaving beneath muted trumpet
    cello_noir = [
        (0.0, "G3", 2.0, 0.66), (2.0, "F3", 1.5, 0.62),
        (4.5, "Eb3", 1.5, 0.66), (6.0, "D3", 1.75, 0.68),
        (8.0, "C3", 2.0, 0.70), (10.0, "D3", 1.5, 0.72), (11.5, "Eb3", 0.5, 0.70),
        (12.0, "D3", 1.5, 0.74), (13.5, "F3", 1.5, 0.76), (15.0, "G3", 1.0, 0.74),
        (16.0, "Ab3", 2.0, 0.78), (18.0, "G3", 1.5, 0.74),
        (20.0, "F3", 1.5, 0.76), (21.5, "Ab3", 1.5, 0.80), (23.0, "C4", 1.0, 0.82),
        (24.0, "B3", 2.0, 0.80), (26.0, "Ab3", 1.0, 0.74), (27.0, "G3", 1.0, 0.72),
    ]
    add_melody(evts, "cello", cello_noir, swell=0.40, pan=0.30, humanize_ms=8.0)

    # Whisper-quiet low string_ensemble_2 midnight haze (barely-there warmth)
    for b, ch, d in [
        (0.0, ["C3", "G3"], 4.0), (4.0, ["C3", "A3"], 4.0),
        (8.0, ["C3", "G3"], 4.0), (12.0, ["B2", "F3"], 4.0),
        (16.0, ["C3", "Ab3"], 4.0), (20.0, ["D3", "Ab3"], 4.0), (24.0, ["B2", "F3"], 4.0),
    ]:
        for nt in ch:
            evts.append(NoteEvent("string_ensemble_2", nt, b, d, 0.34, pan=0.14, swell=0.38, humanize_ms=9.0))

    return evts


# ============================================================================
# SYMPHONY 8: BRANCH — SECRET VELVET SOCIETY SALONS (Wax-Sealed Branch)
# 138 BPM | 3/4 Candlelight Baroque Waltz | 15 bars (4+4+4+3) | F# Minor / A Major
# ============================================================================

def compose_branch_velvet() -> List[NoteEvent]:
    evts: List[NoteEvent] = []
    # 15-bar mysterious 3/4 Baroque Waltz (4 + 4 + 4 + 3 asymmetric salon intrigue!):
    # 0: F#m    | 1: C#7/E# | 2: F#m/E  | 3: B7/D#
    # 4: Bm7    | 5: E7     | 6: Amaj7  | 7: C#7/G#
    # 8: Dmaj7  | 9: Bm6    | 10: G#ø7  | 11: C#7
    # 12: Dmaj7 | 13: G#ø7  | 14: C#7b9 (3-bar wax-sealed deceptive turn back to F#m!)

    waltz_bars = [
        ("F#2", ["A3", "C#4", "F#4"], ["F#3", "A3", "C#4", "F#4", "A4", "C#5"]),   # 0: F#m
        ("F2",  ["G#3", "B3", "C#4"], ["F3", "G#3", "C#4", "F4", "G#4", "B4"]),    # 1: C#7/E# (E#=F)
        ("E2",  ["A3", "C#4", "F#4"], ["E3", "A3", "C#4", "F#4", "A4", "C#5"]),    # 2: F#m/E
        ("D#2", ["A3", "B3", "F#4"],  ["D#3", "A3", "B3", "F#4", "A4", "B4"]),     # 3: B7/D#
        ("B1",  ["A3", "D4", "F#4"],  ["B2", "F#3", "A3", "D4", "F#4", "A4"]),     # 4: Bm7
        ("E2",  ["G#3", "B3", "D4"],  ["E3", "G#3", "B3", "D4", "G#4", "B4"]),     # 5: E7
        ("A1",  ["G#3", "C#4", "E4"], ["A2", "E3", "G#3", "C#4", "E4", "G#4"]),    # 6: Amaj7
        ("G#2", ["F3", "B3", "C#4"],  ["G#2", "F3", "B3", "C#4", "F4", "G#4"]),    # 7: C#7/G#
        ("D2",  ["F#3", "A3", "C#4"], ["D3", "A3", "C#4", "F#4", "A4", "C#5"]),    # 8: Dmaj7
        ("B1",  ["G#3", "D4", "F#4"], ["B2", "F#3", "G#3", "D4", "F#4", "G#4"]),   # 9: Bm6
        ("G#2", ["F#3", "B3", "D4"],  ["G#2", "D3", "F#3", "B3", "D4", "F#4"]),    # 10: G#ø7
        ("C#2", ["F3", "G#3", "B3"],  ["C#3", "G#3", "B3", "F4", "G#4", "B4"]),    # 11: C#7
        ("D2",  ["F#3", "A3", "C#4"], ["D3", "A3", "C#4", "F#4", "A4", "D5"]),     # 12: Dmaj7
        ("G#2", ["F#3", "B3", "D4"],  ["G#2", "D3", "F#3", "B3", "D4", "F#4"]),    # 13: G#ø7
        ("C#2", ["F3", "G#3", "D4"],  ["C#3", "G#3", "B3", "D4", "F4", "G#4"]),    # 14: C#7b9
    ]

    for bar, (bass, mid, arp) in enumerate(waltz_bars):
        b0 = bar * 3.0
        # Bassoon sly velvet waltz bass on beat 1 (+ subtle walking pickup on beat 3)
        evts.append(NoteEvent("bassoon", bass, b0 + 0.0, 1.35, 0.84, pan=0.22, humanize_ms=5.5))
        evts.append(NoteEvent("bassoon", arp[1], b0 + 2.0, 0.85, 0.62, pan=0.24, humanize_ms=6.0))

        # Clandestine Pizzicato Strings 3/4 'oom-pah-pah' candlelight tiptoe
        evts.append(NoteEvent("pizzicato_strings", arp[0], b0 + 0.0, 0.55, 0.72, pan=0.18, humanize_ms=4.5))
        for beat_off, v_mult in ((1.0, 0.64), (2.0, 0.52)):
            for nt in mid:
                evts.append(NoteEvent("pizzicato_strings", nt, b0 + beat_off, 0.45, v_mult, pan=0.22, humanize_ms=5.0))

        # Harpsichord aristocratic Baroque waltz comping + delicate arpeggio filigree
        add_strum(evts, "harpsichord", mid, b0 + 1.0, 0.75, vel=0.58, stagger_ms=14.0, pan=-0.34)
        add_strum(evts, "harpsichord", mid, b0 + 2.0, 0.65, vel=0.46, stagger_ms=12.0, pan=-0.34)
        if bar in (3, 7, 11, 14):
            # Ornate Baroque harpsichord cadential cascade
            for i, nt in enumerate(arp[:6]):
                evts.append(NoteEvent("harpsichord", nt, b0 + i * 0.5, 0.55, 0.56 + 0.03 * i, pan=-0.32, humanize_ms=3.5))

        # Concert Harp flowing candlelight sweeps on odd/structural measures
        if bar % 2 == 0 or bar in (13, 14):
            add_glissando(evts, "orchestral_harp", arp, b0, 2.5, 0.54, 0.76, pan=-0.46)
        else:
            add_strum(evts, "orchestral_harp", arp[:4], b0, 2.2, vel=0.60, stagger_ms=24.0, pan=-0.46)

        # Warm hushed solo cello counter-voice during the dark salon confession (bars 8-14)
        if bar >= 8:
            c_nt = ["F#3", "G#3", "B3", "G#3", "A3", "B3", "C#4"][bar - 8]
            evts.append(NoteEvent("cello", c_nt, b0, 2.8, 0.66, swell=0.34, pan=0.30, humanize_ms=6.5))

    # Celesta — hypnotic, glistening 3/4 Candlelight Waltz Theme (wax-sealed mystery!)
    celesta_waltz = [
        # Bars 0-3 (A): Delicate questioning F# minor waltz
        (0.0, "C#5", 1.0, 0.80), (1.0, "F#5", 1.0, 0.86), (2.0, "A5", 1.0, 0.90),
        (3.0, "G#5", 1.5, 0.86), (4.5, "F#5", 0.5, 0.76), (5.0, "F5", 1.0, 0.82),  # F5 = E#5!
        (6.0, "F#5", 1.0, 0.84), (7.0, "C#5", 1.0, 0.78), (8.0, "A4", 1.0, 0.74),
        (9.0, "B4", 1.5, 0.80), (10.5, "C#5", 0.5, 0.76), (11.0, "D#5", 1.0, 0.82),
        # Bars 4-7 (B): Luminous A-major chandelier glimpse
        (12.0, "D5", 1.0, 0.84), (13.0, "F#5", 1.0, 0.88), (14.0, "A5", 1.0, 0.92),
        (15.0, "G#5", 1.0, 0.88), (16.0, "B5", 1.0, 0.92), (17.0, "D6", 1.0, 0.90),
        (18.0, "C#6", 1.5, 0.92), (19.5, "B5", 0.5, 0.82), (20.0, "A5", 1.0, 0.86),
        (21.0, "G#5", 2.0, 0.86), (23.0, "F5", 1.0, 0.80),
        # Bars 8-11 (C): Clandestine descent
        (24.0, "F#5", 1.0, 0.88), (25.0, "A5", 1.0, 0.90), (26.0, "C#6", 1.0, 0.94),
        (27.0, "B5", 1.5, 0.90), (28.5, "A5", 0.5, 0.82), (29.0, "G#5", 1.0, 0.84),
        (30.0, "F#5", 1.0, 0.86), (31.0, "D5", 1.0, 0.82), (32.0, "B4", 1.0, 0.78),
        (33.0, "C#5", 1.5, 0.84), (34.5, "F5", 0.5, 0.78), (35.0, "G#5", 1.0, 0.86),
        # Bars 12-14 (3-bar wax-sealed deceptive turn!)
        (36.0, "A5", 1.5, 0.90), (37.5, "G#5", 0.5, 0.82), (38.0, "F#5", 1.0, 0.84),
        (39.0, "D5", 1.0, 0.82), (40.0, "B4", 1.0, 0.78), (41.0, "F#5", 1.0, 0.84),
        (42.0, "F5", 1.5, 0.86), (43.5, "D5", 0.5, 0.78), (44.0, "C#5", 1.0, 0.80),
    ]
    add_melody(evts, "celesta", celesta_waltz, swell=0.0, pan=0.24, humanize_ms=5.5)

    # Whispered Oboe echo during bars 4-11 adding velvet-salon human sigh
    oboe_whisper = [
        (12.0, "F#4", 2.0, 0.56), (14.0, "A4", 1.0, 0.58),
        (15.0, "B4", 2.0, 0.60), (17.0, "G#4", 1.0, 0.56),
        (18.0, "A4", 2.5, 0.62), (21.0, "G#4", 2.5, 0.58),
        (24.0, "A4", 2.0, 0.62), (26.0, "F#4", 1.0, 0.58),
        (27.0, "G#4", 2.0, 0.60), (30.0, "F#4", 2.5, 0.60),
        (33.0, "F4", 2.5, 0.58),
    ]
    add_melody(evts, "oboe", oboe_whisper, swell=0.34, pan=-0.12, humanize_ms=6.5)

    return evts


# ============================================================================
# Venue Acoustic Profiles & Complete 8-Theme Master Registry
# ============================================================================

THEMES: List[ThemeSpec] = [
    ThemeSpec(
        theme_id="theme_stage1_oakridge",
        filename="theme_stage1_oakridge.mp3",
        title="Oakridge Hall & Lyric Warmth",
        subtitle="Hometown Underdog — Tiers 1–2",
        story_emotion="Cozy scrappy warmth, acoustic parlor heart, underdog optimism",
        bpm=104.0,
        time_signature="4/4",
        beats_per_bar=4,
        total_bars=9,
        key_mode="G Major / E minor warmth (bVII Fmaj7 lift)",
        form_description="9-bar asymmetric chamber period (4-bar clarinet antecedent + 5-bar solo cello consequent & bVII turnaround)",
        tier_numbers=[1, 2],
        lanes=["MAIN_STAGE", "SPONSOR_SHOWCASE", "RIVAL_GRUDGE"],
        acts=[1],
        cities=["OAKRIDGE, BROOKLYN", "DOWNTOWN CIVIC"],
        rivals=["frankie_russo", "denise_park"],
        acoustics=VenueAcoustics(
            name="Oakridge Timber Community Hall",
            rt60_s=0.95,
            early_taps_ms=[(11.0, 0.24, 0.16), (19.0, 0.14, 0.22), (31.0, 0.16, 0.12), (47.0, 0.10, 0.14)],
            lpf_hz=4200.0, hpf_hz=140.0, wet_scale=0.82, warmth_shelf_db=1.2, air_shelf_db=0.4,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.22, -10.0), (0.44, 14.0), (0.68, -8.0), (0.88, 18.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.84), (0.24, 0.88), (0.44, 0.78), (0.68, 1.12), (0.85, 1.18), (0.95, 0.92), (1.0, 0.84)],
        swing_ratio=0.525,
        seed=101,
        builder=compose_stage1_oakridge,
    ),
    ThemeSpec(
        theme_id="theme_stage3_broadcast",
        filename="theme_stage3_broadcast.mp3",
        title="Channel 7 Prime-Time Breakthrough",
        subtitle="Televised Breakthrough — Tiers 3–4",
        story_emotion="Gleaming live-TV electricity, brass showmanship, prime-time momentum",
        bpm=120.0,
        time_signature="4/4",
        beats_per_bar=4,
        total_bars=10,
        key_mode="Bb Major -> Db Major chromatic mediant -> Eb Lydian",
        form_description="10-bar prime-time showcase arc (4-bar brass fanfare + 4-bar soaring string chromatic-mediant lift + 2-bar live-TV tag)",
        tier_numbers=[3, 4],
        lanes=["MAIN_STAGE", "SPONSOR_SHOWCASE", "RIVAL_GRUDGE"],
        acts=[2],
        cities=["REGIONAL TV CENTER", "NATIONAL NETWORK", "STARLIGHT BACKSTAGE"],
        rivals=["trevor_blake", "priya_nair"],
        acoustics=VenueAcoustics(
            name="Starlight Live Broadcast Soundstage",
            rt60_s=0.82,
            early_taps_ms=[(9.0, 0.22, 0.18), (17.0, 0.16, 0.22), (27.0, 0.14, 0.12), (39.0, 0.10, 0.11)],
            lpf_hz=5600.0, hpf_hz=170.0, wet_scale=0.78, warmth_shelf_db=0.5, air_shelf_db=1.2,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.38, 8.0), (0.42, -6.0), (0.78, 10.0), (0.94, -5.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.90), (0.28, 0.82), (0.45, 1.06), (0.72, 1.12), (0.90, 1.24), (1.0, 0.90)],
        swing_ratio=0.515,
        seed=202,
        builder=compose_stage3_broadcast,
    ),
    ThemeSpec(
        theme_id="theme_stage5_london",
        filename="theme_stage5_london.mp3",
        title="Grand Rotunda Counterpoint",
        subtitle="Grand Rotunda, London — Lord Alistair Finch",
        story_emotion="Witty Edwardian intellect, razor-sharp Baroque duel, aristocratic poise",
        bpm=112.0,
        time_signature="4/4",
        beats_per_bar=4,
        total_bars=9,
        key_mode="D Minor -> F Major -> Bb Major -> A7",
        form_description="9-bar asymmetric contrapuntal invention (4-bar chromatic-bass oboe/bassoon sparring + 5-bar Edwardian horn-crowned development)",
        tier_numbers=[5],
        lanes=["MAIN_STAGE", "SPONSOR_SHOWCASE", "RIVAL_GRUDGE"],
        acts=[3],
        cities=["LONDON, UK", "WESTMINSTER, LONDON"],
        rivals=["alistair_finch"],
        acoustics=VenueAcoustics(
            name="Grand Rotunda Oak & Marble Hall",
            rt60_s=1.24,
            early_taps_ms=[(14.0, 0.24, 0.15), (24.0, 0.14, 0.24), (38.0, 0.16, 0.13), (56.0, 0.11, 0.13)],
            lpf_hz=4900.0, hpf_hz=150.0, wet_scale=0.88, warmth_shelf_db=0.6, air_shelf_db=1.0,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.25, -8.0), (0.44, 16.0), (0.72, -6.0), (0.91, 20.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.82), (0.36, 0.78), (0.52, 1.08), (0.82, 1.18), (0.95, 0.92), (1.0, 0.82)],
        swing_ratio=0.50,
        seed=303,
        builder=compose_stage5_london,
    ),
    ThemeSpec(
        theme_id="theme_stage6_tokyo",
        filename="theme_stage6_tokyo.mp3",
        title="Shibuya Rain-Lit Sky-Dome",
        subtitle="Shibuya Sky-Dome, Tokyo — Kenji Takahashi",
        story_emotion="Sleek cyber-symphonic precision, rain-glass stillness, agile odd-meter focus",
        bpm=126.0,
        time_signature="5/4",
        beats_per_bar=5,
        total_bars=8,
        key_mode="E Hirajoshi (E-F#-G-B-C) / A Hirajoshi",
        form_description="8-bar 5/4 (3+2) cyber-symphonic Hirajoshi cycle: koto cascades & celesta rain beneath meditative shakuhachi 'ma' phrasing",
        tier_numbers=[6],
        lanes=["MAIN_STAGE", "SPONSOR_SHOWCASE", "RIVAL_GRUDGE"],
        acts=[3],
        cities=["SHIBUYA, TOKYO"],
        rivals=["kenji_takahashi"],
        acoustics=VenueAcoustics(
            name="Shibuya Glass & Steel Sky-Dome",
            rt60_s=1.36,
            early_taps_ms=[(15.0, 0.22, 0.18), (28.0, 0.16, 0.22), (44.0, 0.14, 0.16), (63.0, 0.11, 0.11)],
            lpf_hz=6400.0, hpf_hz=160.0, wet_scale=0.92, warmth_shelf_db=0.2, air_shelf_db=1.4,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.46, 12.0), (0.52, -6.0), (0.92, 10.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.80), (0.28, 0.76), (0.48, 0.92), (0.68, 1.18), (0.88, 1.12), (1.0, 0.80)],
        swing_ratio=0.50,
        seed=404,
        builder=compose_stage6_tokyo,
    ),
    ThemeSpec(
        theme_id="theme_stage7_cairo",
        filename="theme_stage7_cairo.mp3",
        title="Great Starlight Pavilion at Giza",
        subtitle="Great Starlight Pavilion, Giza — Nadia Al-Mansoor",
        story_emotion="Desert starlight grandeur, ancient astronomical poise, modal mystique",
        bpm=108.0,
        time_signature="4/4 (3+3+2 Maqsum)",
        beats_per_bar=4,
        total_bars=9,
        key_mode="D Hijaz (Phrygian Dominant: D-Eb-F#-G-A-Bb-C)",
        form_description="9-bar asymmetric modal starlight arc (4-bar Giza pedal & ornamented oboe call + 5-bar oboe/flute/horn constellation elevation)",
        tier_numbers=[7],
        lanes=["MAIN_STAGE", "SPONSOR_SHOWCASE", "RIVAL_GRUDGE"],
        acts=[4],
        cities=["GIZA, EGYPT", "CAIRO, EGYPT"],
        rivals=["nadia_al_mansoor"],
        acoustics=VenueAcoustics(
            name="Giza Open-Air Sandstone Starlight Pavilion",
            rt60_s=1.54,
            early_taps_ms=[(18.0, 0.22, 0.14), (33.0, 0.14, 0.22), (51.0, 0.15, 0.13), (74.0, 0.12, 0.12)],
            lpf_hz=4500.0, hpf_hz=135.0, wet_scale=0.96, warmth_shelf_db=0.4, air_shelf_db=1.0,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.20, 12.0), (0.44, 18.0), (0.70, -10.0), (0.90, 16.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.78), (0.34, 0.84), (0.48, 1.06), (0.76, 1.22), (0.92, 0.94), (1.0, 0.78)],
        swing_ratio=0.50,
        seed=505,
        builder=compose_stage7_cairo,
    ),
    ThemeSpec(
        theme_id="theme_stage8_finale",
        filename="theme_stage8_finale.mp3",
        title="1.4-Billion Worldwide Simulcast",
        subtitle="Global Championship Finale — Grandmaster Viktor Volkov",
        story_emotion="Colossal full-orchestra championship climax, towering brass majesty, historic stakes",
        bpm=132.0,
        time_signature="4/4",
        beats_per_bar=4,
        total_bars=11,
        key_mode="C Minor -> Ab Major -> Eb Major -> Db Neapolitan -> G7",
        form_description="11-bar symphonic summit (4-bar heroic brass anthem + 4-bar global simulcast ascent + 3-bar Neapolitan cathedral-bell climax)",
        tier_numbers=[8],
        lanes=["MAIN_STAGE", "SPONSOR_SHOWCASE", "RIVAL_GRUDGE"],
        acts=[5],
        cities=["WORLDWIDE SIMULCAST"],
        rivals=["viktor_volkov"],
        acoustics=VenueAcoustics(
            name="Grand Global Symphony Concert Hall",
            rt60_s=1.72,
            early_taps_ms=[(16.0, 0.24, 0.16), (29.0, 0.16, 0.24), (46.0, 0.16, 0.14), (68.0, 0.13, 0.12)],
            lpf_hz=5400.0, hpf_hz=135.0, wet_scale=1.02, warmth_shelf_db=0.9, air_shelf_db=1.1,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.35, 8.0), (0.72, -6.0), (0.91, 14.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.86), (0.30, 0.82), (0.55, 1.08), (0.82, 1.26), (0.95, 1.12), (1.0, 0.86)],
        swing_ratio=0.50,
        seed=606,
        builder=compose_stage8_finale,
    ),
    ThemeSpec(
        theme_id="theme_branch_redemption",
        filename="theme_branch_redemption.mp3",
        title="2 AM Underdog Redemption Circuit",
        subtitle="Fail-Forward Redemption Branch",
        story_emotion="Gritty 2 AM diner-and-basement jazz heart, bruised pride, quiet comeback fire",
        bpm=88.0,
        time_signature="4/4 (12/8 triplet swing)",
        beats_per_bar=4,
        total_bars=7,
        key_mode="C Minor / C Dorian Noir (G7#9 -> G7alt)",
        form_description="7-bar asymmetric noir blues-chamber period (4-bar smoky muted-trumpet confession + 3-bar cello/bass defiant turnaround)",
        tier_numbers=[1, 2, 3, 4, 5, 6, 7, 8],
        lanes=["REDEMPTION_GRIT"],
        acts=[1, 2, 3, 4, 5],
        cities=["BROOKLYN, NY", "SOHO, LONDON", "SHINJUKU, TOKYO", "CAIRO, EGYPT", "GENEVA, SWITZERLAND"],
        rivals=[],
        acoustics=VenueAcoustics(
            name="2 AM Brick-Walled Cellar Jazz Lounge",
            rt60_s=0.70,
            early_taps_ms=[(8.0, 0.24, 0.18), (15.0, 0.16, 0.22), (24.0, 0.12, 0.10), (34.0, 0.08, 0.09)],
            lpf_hz=3600.0, hpf_hz=130.0, wet_scale=0.72, warmth_shelf_db=1.2, air_shelf_db=-0.6,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.28, 18.0), (0.56, 24.0), (0.78, -10.0), (0.92, 16.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.82), (0.30, 0.92), (0.52, 0.78), (0.74, 1.18), (0.92, 0.94), (1.0, 0.82)],
        swing_ratio=0.62,
        seed=707,
        builder=compose_branch_redemption,
    ),
    ThemeSpec(
        theme_id="theme_branch_velvet",
        filename="theme_branch_velvet.mp3",
        title="Candlelight Salon Waltz",
        subtitle="Secret Velvet Society Salons — Wax-Sealed Branch",
        story_emotion="Mysterious 3/4 candlelight elegance, whispered conspiracy, baroque parlor intrigue",
        bpm=138.0,
        time_signature="3/4",
        beats_per_bar=3,
        total_bars=15,
        key_mode="F# Minor -> A Major -> C#7b9",
        form_description="15-bar asymmetric 3/4 Baroque waltz (4+4+4+3) with Viennese beat-2 lilt, celesta/harp shimmer & wry bassoon counterpoint",
        tier_numbers=[1, 2, 3, 4, 5, 6, 7, 8],
        lanes=["VELVET_SALON"],
        acts=[1, 2, 3, 4, 5],
        cities=["BROOKLYN HEIGHTS", "OXFORD, UK", "KYOTO, JAPAN", "ALEXANDRIA, EGYPT", "GENEVA, SWITZERLAND"],
        rivals=[],
        acoustics=VenueAcoustics(
            name="Velvet Cloister Candlelight Parlor",
            rt60_s=1.38,
            early_taps_ms=[(13.0, 0.23, 0.17), (23.0, 0.15, 0.23), (37.0, 0.15, 0.14), (55.0, 0.11, 0.12)],
            lpf_hz=5200.0, hpf_hz=155.0, wet_scale=0.92, warmth_shelf_db=0.7, air_shelf_db=1.1,
        ),
        rubato_knots_ms=[(0.0, 0.0), (0.27, 14.0), (0.53, -10.0), (0.80, 16.0), (0.94, 22.0), (1.0, 0.0)],
        dynamic_knots=[(0.0, 0.82), (0.26, 0.78), (0.50, 1.10), (0.76, 1.18), (0.92, 0.84), (1.0, 0.82)],
        swing_ratio=0.50,
        waltz_lilt_ms=(0.0, -14.0, 10.0),
        seed=808,
        builder=compose_branch_velvet,
    ),
]


# ============================================================================
# CLI Build Pipeline & Manifest Generator
# ============================================================================

def verify_zero_oscillators() -> None:
    """Self-audit this script to confirm zero procedural oscillator synthesis."""
    src = Path(__file__).read_text(encoding="utf-8")
    banned = [
        r"\b" + "np" + r"\." + "s" + "in\b",
        r"\b" + "numpy" + r"\." + "s" + "in\b",
        r"\b" + "math" + r"\." + "s" + "in\b",
        r"\b" + "saw" + "tooth\b",
        r"\b" + "squ" + r"are\(",
        r"\b" + "chi" + r"rp\(",
    ]
    code_lines = [ln for ln in src.splitlines() if not ln.strip().startswith("#")]
    body = "\n".join(code_lines)
    for pat in banned:
        if re.search(pat, body):
            raise RuntimeError(f"Zero-oscillator violation detected for pattern {pat}")


def main() -> int:
    verify_zero_oscillators()
    THEMES_OUT_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    bank = MusyngKiteBank()
    manifest_themes = []
    all_instruments = set()
    total_bytes = 0

    print("=" * 78)
    print("WORLD'S SMARTEST v5.0 — STAGE & STORY-BRANCH REAL-INSTRUMENT SYMPHONIES")
    print("=" * 78)

    for idx, spec in enumerate(THEMES, 1):
        out_mp3 = THEMES_OUT_DIR / spec.filename
        print(
            f"\n[{idx}/8] Composing {spec.filename} "
            f"({spec.bpm:.0f} BPM, {spec.time_signature}, {spec.total_bars} bars)...",
            flush=True,
        )
        pcm, used_insts = render_theme(spec, bank)
        all_instruments.update(used_insts)
        metrics = master_to_mp3(pcm, out_mp3)
        total_bytes += metrics["size_bytes"]

        print(
            f"  [ok] {spec.filename}: {metrics['duration_sec']:.2f}s | "
            f"{metrics['size_kb']:.1f} kB | I={metrics['integrated_lufs']:.2f} LUFS | "
            f"TP={metrics['true_peak_dbfs']:.2f} dBFS | LRA={metrics['lra_lu']:.2f} LU | "
            f"seam={metrics['seam_delta']:.4f} | instruments={len(used_insts)}",
            flush=True,
        )

        manifest_themes.append({
            "id": spec.theme_id,
            "file": f"./assets/audio/themes/{spec.filename}",
            "filename": spec.filename,
            "title": spec.title,
            "subtitle": spec.subtitle,
            "storyEmotion": spec.story_emotion,
            "bpm": spec.bpm,
            "timeSignature": spec.time_signature,
            "beatsPerBar": spec.beats_per_bar,
            "totalBars": spec.total_bars,
            "keyMode": spec.key_mode,
            "form": spec.form_description,
            "venueAcoustics": spec.acoustics.name,
            "instruments": used_insts,
            "routing": {
                "tiers": spec.tier_numbers,
                "lanes": spec.lanes,
                "acts": spec.acts,
                "cities": spec.cities,
                "rivals": spec.rivals,
                "priority": 100 if any(ln in ("REDEMPTION_GRIT", "VELVET_SALON") for ln in spec.lanes) else 50,
            },
            "audio": {
                "format": "mp3",
                "bitrateKbps": 128,
                "sampleRateHz": SR,
                "channels": 2,
                "seamlessLoop": True,
                "durationSec": metrics["duration_sec"],
                "sizeBytes": metrics["size_bytes"],
                "sizeKb": metrics["size_kb"],
                "integratedLufs": metrics["integrated_lufs"],
                "truePeakDbfs": metrics["true_peak_dbfs"],
                "lraLu": metrics["lra_lu"],
                "seamDelta": metrics["seam_delta"],
                "recommendedVolumeScale": 0.92,
            },
        })

    manifest = {
        "schemaVersion": "5.0.0",
        "generator": "tools/build_v5_stage_symphonies.py",
        "soundfontSource": SOUNDFONT_BASE,
        "oscillatorCount": 0,
        "broadcastTarget": {
            "loudnorm": "I=-17.5:TP=-1.8:LRA=9",
            "maxTruePeakDbfs": -1.5,
            "bitrate": "128k",
            "sampleRateHz": SR,
            "channels": 2,
        },
        "summary": {
            "themeCount": len(manifest_themes),
            "uniqueRealInstruments": len(all_instruments),
            "instrumentRoster": sorted(all_instruments),
            "totalSizeBytes": total_bytes,
            "totalSizeKb": round(total_bytes / 1024.0, 1),
        },
        "laneOverrides": {
            "REDEMPTION_GRIT": "theme_branch_redemption",
            "VELVET_SALON": "theme_branch_velvet",
        },
        "tierDefaults": {
            "1": "theme_stage1_oakridge",
            "2": "theme_stage1_oakridge",
            "3": "theme_stage3_broadcast",
            "4": "theme_stage3_broadcast",
            "5": "theme_stage5_london",
            "6": "theme_stage6_tokyo",
            "7": "theme_stage7_cairo",
            "8": "theme_stage8_finale",
        },
        "themes": manifest_themes,
    }

    MANIFEST_OUT_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print("\n" + "=" * 78)
    print(
        f"DONE: Built {len(manifest_themes)} real-instrument stage symphonies "
        f"({len(all_instruments)} MusyngKite instruments, {total_bytes / 1024.0:.1f} kB total, "
        f"0 math oscillators)"
    )
    print(f"Manifest written: {MANIFEST_OUT_PATH}")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
