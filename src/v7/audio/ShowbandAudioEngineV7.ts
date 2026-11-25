// ============================================================================
// WORLD'S SMARTEST: 1966 LIVING COLOR STUDIO ORCHESTRA & PHYSICAL FOLEY ENGINE
// `src/v7/audio/ShowbandAudioEngineV7.ts`
//
// - 79 Real Recorded Acoustic Studio Multi-Samples (`public/assets/v7/audio/`):
//   MusyngKite real trumpets, studio brass, trombones, muted trumpet, tenor sax,
//   plucked upright double bass, Steinway grand piano, vibraphone, marimba,
//   hollowbody jazz guitar, stereo studio strings, glockenspiel, tubular bells,
//   woodblock & timpani + CC0 Boston Jazz Drums + Wikimedia Commons live studio
//   audience applause/cheers/laughter & mechanical bells/typewriter clacks.
// - Authentic 9-Drawbar Hammond B3 Tonewheel Organ + Shared Stereo Leslie 122
//   Dual-Rotor Speaker Cabinet (the true 1960s studio organ!)
// - 1966 RCA 44-BX Ribbon Mic Tilt + 1.35s Capitol Wooden Chamber Convolver +
//   Warm Analog Tape Saturation + 5 Live XAG Gain Buses (`master`, `music`,
//   `sfx`, `crowd`, `ambience`) + True 1024-Sample ANSI 300ms VU Ballistics.
// - Joyful 1966 Herb Alpert *Tijuana Brass* / *Dating Game* / *Take Ten* Swing
//   on Title & Daytime; Merv Griffin *Think!* calm chamber groove on Question
//   Open (`clueSanctuaryActive`); full 12-Scene Broadcast Score + Physical
//   Studio Foley, Edwards AC Wrong Buzzer, and TV Twist Showpiece Fanfares!
// ============================================================================

import type {
  BroadcastSettingsV7,
  CoupRegimeIdV7,
  StageWorldIdV7,
} from '../contracts_v7';
import { HapticsEngine, type IHapticsEngine } from '../../audio/HapticsEngine';
import {
  SamplePackLoaderV7,
  type AcousticInstrumentIdV7,
  type SamplePackStatsV7,
} from './SamplePackLoaderV7';

export type ShowbandSceneIdV7 = StageWorldIdV7 | 'GREEN_ROOM' | 'TRAPDOOR_BLITZ';

export type CheatTellChannelV7 = 'ROW_C_GLINT' | 'SOLENOID_SPARK' | 'FRESNEL_LAMP';

export type ShowbandBusIdV7 = 'master' | 'music' | 'sfx' | 'crowd' | 'ambience';

export interface BallisticVuStateV7 {
  /** Ballistic VU level in dB relative to 0 VU = -14 dBFS (clamped [-20, +3.5]). */
  vuDb: number;
  /** Physical D'Arsonval needle deflection angle in degrees (-45° rest, +18° @ 0 VU, +44° @ +3 VU). */
  needleAngleDeg: number;
  /** Ruby overload jewel state with true 1.200s peak hold. */
  peakLedActive: boolean;
}

export interface ShowbandSceneSpecV7 {
  readonly sceneId: ShowbandSceneIdV7;
  readonly bpm: number;
  readonly timeSig: '4/4' | '5/4';
  readonly isSealedVault: boolean;
  readonly rootMidi: number;
  readonly motifMode: 'MAJOR_6' | 'NOIR_B6';
  readonly styleSummary: string;
}

export const DEFAULT_BROADCAST_SETTINGS_V7: Readonly<BroadcastSettingsV7> = {
  masterVolume: 88,
  musicVolume: 80,
  sfxVolume: 90,
  crowdVolume: 78,
  ambienceVolume: 72,
  hapticsEnabled: true,
  reducedMotion: false,
  highContrastBadges: false,
};

export const SHOWBAND_SCENE_SPECS_V7: Readonly<
  Record<ShowbandSceneIdV7, ShowbandSceneSpecV7>
> = {
  GREEN_ROOM: {
    sceneId: 'GREEN_ROOM',
    bpm: 118,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 53, // F3
    motifMode: 'MAJOR_6',
    styleSummary:
      '1966 NBC Title Showband — Tijuana Brass Trumpets, Marimba, Hammond B3 Leslie & Walking Bass (118 BPM)',
  },
  STAGE_01_IBC_DAYTIME_FUNK: {
    sceneId: 'STAGE_01_IBC_DAYTIME_FUNK',
    bpm: 120,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 53, // F3
    motifMode: 'MAJOR_6',
    styleSummary:
      '1966 Studio 6A Daytime Swing — Take Ten / Dating Game Brass, Vibraphone, Piano, Hammond B3 & Jazz Kit (120 BPM)',
  },
  STAGE_02_IBC_PRIMETIME_JUBILEE: {
    sceneId: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    bpm: 122,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 50, // D3
    motifMode: 'MAJOR_6',
    styleSummary:
      '1966 CBS Primetime Jubilee — Big Band Brass, Stereo Strings, Grand Piano & Glockenspiel (122 BPM)',
  },
  STAGE_03_1926_VAUDEVILLE_PIT: {
    sceneId: 'STAGE_03_1926_VAUDEVILLE_PIT',
    bpm: 124,
    timeSig: '4/4',
    isSealedVault: true,
    rootMidi: 48, // C3
    motifMode: 'MAJOR_6',
    styleSummary:
      '1966 Burbank Pop-Art Go-Go — Fast-Leslie Hammond B3 Organ, Punchy Brass, Marimba & Mod Swing Beat (124 BPM)',
  },
  STAGE_04_1958_ISOLATION_VAULT: {
    sceneId: 'STAGE_04_1958_ISOLATION_VAULT',
    bpm: 94,
    timeSig: '4/4',
    isSealedVault: true,
    rootMidi: 48, // C3
    motifMode: 'NOIR_B6',
    styleSummary:
      '1964 Isolation Booth Suspense — Muted Trumpet, Tenor Sax, Trembling Strings, Vibraphone & Timpani (94 BPM)',
  },
  STAGE_05_1984_LARSON_CRT_LAB: {
    sceneId: 'STAGE_05_1984_LARSON_CRT_LAB',
    bpm: 108,
    timeSig: '4/4',
    isSealedVault: true,
    rootMidi: 45, // A2
    motifMode: 'NOIR_B6',
    styleSummary:
      '1967 Apollo Color Control Pavilion — Hammond B3 Leslie, Tenor Sax, Vibraphone, Grand Piano & Tight Rim Kit (108 BPM)',
  },
  STAGE_06_ATLANTIC_CITY_PIER: {
    sceneId: 'STAGE_06_ATLANTIC_CITY_PIER',
    bpm: 122,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 55, // G3
    motifMode: 'MAJOR_6',
    styleSummary:
      '1964 Steel Pier Big Band — Boardwalk Brass, Dual Trumpets, Tenor Sax, Marimba, Bongos & Swing Kit (122 BPM)',
  },
  STAGE_07_1969_MONTE_CARLO_CASINO: {
    sceneId: 'STAGE_07_1969_MONTE_CARLO_CASINO',
    bpm: 140,
    timeSig: '5/4',
    isSealedVault: false,
    rootMidi: 55, // G3
    motifMode: 'NOIR_B6',
    styleSummary:
      '1969 Monte Carlo 5/4 Spy Lounge — Lalo Schifrin Bass Ostinato, Grand Piano, Muted Trumpet, Vibraphone & Bongos (140 BPM)',
  },
  STAGE_08_WORLDS_FAIR_GEODESIC: {
    sceneId: 'STAGE_08_WORLDS_FAIR_GEODESIC',
    bpm: 114,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 58, // Bb3
    motifMode: 'MAJOR_6',
    styleSummary:
      '1965 World’s Fair Space-Age Exotica — Vibraphone, Marimba, Glockenspiel, Stereo Strings & Bongos (114 BPM)',
  },
  STAGE_09_CHANNEL_83_UHF_BARGE: {
    sceneId: 'STAGE_09_CHANNEL_83_UHF_BARGE',
    bpm: 114,
    timeSig: '4/4',
    isSealedVault: true,
    rootMidi: 52, // E3
    motifMode: 'NOIR_B6',
    styleSummary:
      '1967 Pirate Channel 83 Beat — Soul-Jazz Hammond B3 Leslie, Tenor Sax, Hollowbody Guitar & Snappy Backbeat (114 BPM)',
  },
  STAGE_10_SOVEREIGN_SANCTUM: {
    sceneId: 'STAGE_10_SOVEREIGN_SANCTUM',
    bpm: 112,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 50, // D3
    motifMode: 'NOIR_B6',
    styleSummary:
      'Grand Finale Broadcast Showdown — Timpani, Full Brass & Trombones, Stereo Strings, Grand Piano & Tubular Bells (112 BPM)',
  },
  TRAPDOOR_BLITZ: {
    sceneId: 'TRAPDOOR_BLITZ',
    bpm: 148,
    timeSig: '4/4',
    isSealedVault: false,
    rootMidi: 50, // D3
    motifMode: 'NOIR_B6',
    styleSummary:
      '148 BPM Lightning Round Chase — Driving Upright Bass, Timpani, Sharp Brass Stabs, Hammond B3 & Snare (148 BPM)',
  },
};

// ----------------------------------------------------------------------------
// Psychoacoustic Constants & Calibrated Levels
// ----------------------------------------------------------------------------

const MAX_CONCURRENT_VOICES = 52;
const AMBIENCE_GRAIN_SR = 16000;

/** 0 VU = -14.0 dBFS RMS (0.19952623 linear RMS). */
const VU_ZERO_DBFS = -14.0;
const VU_ZERO_LINEAR_RMS = Math.pow(10, VU_ZERO_DBFS / 20);
/** ANSI C16.5 300ms 99% settling time => tau = 0.300 / ln(100) = 0.065144s. */
const ANSI_VU_TAU_SEC = 0.300 / Math.log(100);
const PEAK_JEWEL_HOLD_SEC = 1.2;
const PEAK_JEWEL_THRESHOLD_LINEAR = Math.pow(10, -4.0 / 20);

/** Slider 20ms smoothing: 3 * tau ~= 19.8ms. */
const SLIDER_SMOOTH_TAU_SEC = 0.0066;

/** Exact calibrated hover/select foley gains. */
const GAIN_TILE_HOVER_LINEAR = Math.pow(10, -18.5 / 20);
const GAIN_TILE_SELECT_LINEAR = Math.pow(10, -11.5 / 20);

/** Shepard bell ceiling strictly <= C6 (MIDI 84 = 1046.502 Hz). */
const MIDI_C5 = 72;
const MIDI_C6 = 84;

interface ActiveVoiceHandle {
  priority: 1 | 2 | 3;
  startTime: number;
  endTime: number;
  gainNode: GainNode;
  stopNode: AudioScheduledSourceNode;
  stopped: boolean;
}

interface CensorHoldNodes {
  oscSub: OscillatorNode;
  oscCore: OscillatorNode;
  flutterOsc: OscillatorNode;
  flutterGain: GainNode;
  lowpass: BiquadFilterNode;
  shaper: WaveShaperNode;
  envGain: GainNode;
}

interface AmbienceBedNodes {
  stopAll: (fadeOutSec: number) => void;
}

interface LeslieCabinetBus {
  input: GainNode;
  rotorLfo: OscillatorNode;
  tremLfo: OscillatorNode;
  fastMode: boolean;
  setFast: (fast: boolean, now: number) => void;
  dispose: () => void;
}

// ----------------------------------------------------------------------------
// Deterministic Math & Pitch Utilities
// ----------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return v < min ? min : v > max ? max : v;
}

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Perceptually natural broadcast fader curve: 0 -> 0.0, 100 -> 1.0, monotonic. */
function sliderToGain(vol0to100: number): number {
  const u = clamp(vol0to100, 0, 100) / 100;
  if (u <= 0.0001) return 0;
  return Math.pow(u, 1.45);
}

/** Deterministic xorshift32 PRNG returning [-1, +1] for reproducible IRs & ambience. */
function createSeededNoise(seed: number): () => number {
  let state = seed >>> 0 || 0x57535637;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x80000000 - 1.0;
  };
}

/** Deterministic micro-humanization offset in [-rangeSec, +rangeSec]. */
function humanizeOffset(bar: number, step: number, salt: number, rangeSec = 0.0045): number {
  const h = Math.sin(bar * 12.9898 + step * 78.233 + salt * 37.719) * 43758.5453;
  const frac = h - Math.floor(h);
  return (frac * 2 - 1) * rangeSec;
}

/** Soft-ceiling tanh WaveShaper curve strictly bounded at -1.0 dBTP (0.89125). */
function createBrickwallCeilingCurve(
  ceilingLinear = 0.89125,
  samples = 1024,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(samples);
  const invCeil = 1 / ceilingLinear;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    curve[i] = ceilingLinear * Math.tanh(x * invCeil * 1.10);
  }
  return curve;
}

function createWarmTubeSaturationCurve(
  drive = 1.65,
  samples = 512,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(samples);
  const norm = 1 / Math.tanh(drive);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    const asym = x + 0.065 * x * x - 0.065;
    curve[i] = Math.tanh(asym * drive) * norm * 0.96;
  }
  return curve;
}

function resolveAudioContextCtor(): typeof AudioContext | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Main Engine: `ShowbandAudioEngineV7`
// ============================================================================

export class ShowbandAudioEngineV7 {
  public readonly haptics: IHapticsEngine;

  public masterBus: GainNode | null = null;
  public musicBus: GainNode | null = null;
  public sfxBus: GainNode | null = null;
  public crowdBus: GainNode | null = null;
  public ambienceBus: GainNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;

  private readonly samplePack = new SamplePackLoaderV7();

  private ctx: AudioContext | null = null;
  private musicSanctuaryFilter: BiquadFilterNode | null = null;
  private musicSanctuaryGain: GainNode | null = null;
  private ribbonWarmShelf: BiquadFilterNode | null = null;
  private ribbonTopRolloff: BiquadFilterNode | null = null;
  private musicTapeShaper: WaveShaperNode | null = null;
  private musicStingerDuckGain: GainNode | null = null;
  private studioChamberConvolver: ConvolverNode | null = null;
  private musicDryGain: GainNode | null = null;
  private musicWetGain: GainNode | null = null;
  private sfxChamberSend: GainNode | null = null;
  private broadcastGlueComp: DynamicsCompressorNode | null = null;
  private brickwallLimiter: DynamicsCompressorNode | null = null;
  private ceilingShaper: WaveShaperNode | null = null;
  private warmTubeCurve: Float32Array<ArrayBuffer> | null = null;

  // Authentic 9-Drawbar Hammond B3 Tonewheel + Stereo Leslie 122 Cabinet
  private hammondWarmWave: PeriodicWave | null = null;
  private hammondPercWave: PeriodicWave | null = null;
  private leslieBus: LeslieCabinetBus | null = null;

  // Small hardware-only buffers (Stage 09 UHF barge static + tiny hover micro-click fallback)
  private uhfCreakBuffer: AudioBuffer | null = null;
  private fallbackClickBuffer: AudioBuffer | null = null;
  private chamberIrBytes = 0;

  private settings: BroadcastSettingsV7;
  private currentScene: ShowbandSceneIdV7 = 'STAGE_01_IBC_DAYTIME_FUNK';
  private baseStageBeforeBlitz: ShowbandSceneIdV7 = 'STAGE_01_IBC_DAYTIME_FUNK';
  private coupRegime: CoupRegimeIdV7 = 'NONE';
  private clueSanctuaryActive = false;
  private bellamySpiteChopActive = false;

  // True 1024-sample master VU telemetry state
  private readonly vuTimeDomainBuf = new Float32Array(1024);
  private ballisticVuLinear = 0;
  private peakHoldRemainingSec = 0;

  // Sequencer & voice pool
  private readonly activeVoices: ActiveVoiceHandle[] = [];
  private isMusicRunning = false;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextSubstepTime = 0;
  private currentBarIndex = 0;
  private currentSubstepInBar = 0;
  private ambienceBed: AmbienceBedNodes | null = null;

  // Censor mic continuous transformer hold state
  private censorHold: CensorHoldNodes | null = null;
  private censorHoldActive = false;
  private censorCharge01 = 0;

  // Micro-dedupe timestamps (ms)
  private lastHoverMs = -100;
  private lastDetentMs = -100;
  private detachUnlockListeners: (() => void) | null = null;
  private disposed = false;

  constructor(
    initialSettings?: Partial<BroadcastSettingsV7>,
    haptics?: IHapticsEngine,
  ) {
    this.settings = {
      ...DEFAULT_BROADCAST_SETTINGS_V7,
      ...(initialSettings ?? {}),
    };
    this.haptics = haptics ?? new HapticsEngine();
    this.haptics.setEnabled(this.settings.hapticsEnabled);

    this.ensureAudioGraph();
    this.installAutoUnlockListeners();
    if (typeof globalThis !== 'undefined') {
      (globalThis as unknown as { __WS_V7_AUDIO__?: ShowbandAudioEngineV7 }).__WS_V7_AUDIO__ = this;
    }
  }

  // --------------------------------------------------------------------------
  // 1. WebAudio Studio Broadcast Chain + Hammond B3/Leslie + Sample Preload
  // --------------------------------------------------------------------------

  private ensureAudioGraph(): AudioContext | null {
    if (this.disposed) return null;
    if (this.ctx) return this.ctx;

    const AudioCtx = resolveAudioContextCtor();
    if (!AudioCtx) return null;

    let ctx: AudioContext;
    try {
      ctx = new AudioCtx({ latencyHint: 'interactive' });
    } catch {
      try {
        ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    this.ctx = ctx;
    this.warmTubeCurve = createWarmTubeSaturationCurve(1.65, 512);

    // 5 Independent Live XAG Gain Buses
    this.masterBus = ctx.createGain();
    this.musicBus = ctx.createGain();
    this.sfxBus = ctx.createGain();
    this.crowdBus = ctx.createGain();
    this.ambienceBus = ctx.createGain();

    // Clue-Reading Sanctuary Peaking EQ (-7.0dB @ 1.8kHz) + -6.5dB calm reading bed attenuation
    this.musicSanctuaryFilter = ctx.createBiquadFilter();
    this.musicSanctuaryFilter.type = 'peaking';
    this.musicSanctuaryFilter.frequency.value = 1800;
    this.musicSanctuaryFilter.Q.value = 0.85;
    this.musicSanctuaryFilter.gain.value = this.clueSanctuaryActive ? -7.0 : 0.0;

    this.musicSanctuaryGain = ctx.createGain();
    this.musicSanctuaryGain.gain.value = this.clueSanctuaryActive ? 0.47 : 1.0;

    // 1966 RCA 44-BX Ribbon Microphone Studio Coloration (warm 220Hz wood + silky 6.2kHz rolloff)
    this.ribbonWarmShelf = ctx.createBiquadFilter();
    this.ribbonWarmShelf.type = 'lowshelf';
    this.ribbonWarmShelf.frequency.value = 220;
    this.ribbonWarmShelf.gain.value = 1.8;

    this.ribbonTopRolloff = ctx.createBiquadFilter();
    this.ribbonTopRolloff.type = 'highshelf';
    this.ribbonTopRolloff.frequency.value = 6200;
    this.ribbonTopRolloff.gain.value = -2.2;

    this.musicTapeShaper = ctx.createWaveShaper();
    this.musicTapeShaper.curve = createWarmTubeSaturationCurve(1.12, 512);
    this.musicTapeShaper.oversample = '2x';

    // Broadcast engineer fader duck node for big fanfares, bells, buzzers & wheel spins
    this.musicStingerDuckGain = ctx.createGain();
    this.musicStingerDuckGain.gain.value = 1.0;

    // Stereo 1.35s Capitol Concrete/Wood Studio A Chamber Convolution Reverb
    const chamberIr = this.buildStudioChamberImpulse(ctx);
    this.chamberIrBytes = chamberIr.length * chamberIr.numberOfChannels * 4;
    this.studioChamberConvolver = ctx.createConvolver();
    this.studioChamberConvolver.buffer = chamberIr;

    this.musicDryGain = ctx.createGain();
    this.musicDryGain.gain.value = 0.72;
    this.musicWetGain = ctx.createGain();
    this.musicWetGain.gain.value = 0.24;

    // Subtle studio room glue send from SFX bus (puts bells & brass stingers in the same room!)
    this.sfxChamberSend = ctx.createGain();
    this.sfxChamberSend.gain.value = 0.15;

    // Broadcast Master Glue Compressor (-14 LUFS cohesion, zero VU overload)
    this.broadcastGlueComp = ctx.createDynamicsCompressor();
    this.broadcastGlueComp.threshold.value = -16.5;
    this.broadcastGlueComp.knee.value = 10.0;
    this.broadcastGlueComp.ratio.value = 2.4;
    this.broadcastGlueComp.attack.value = 0.012;
    this.broadcastGlueComp.release.value = 0.18;

    const makeupGain = ctx.createGain();
    makeupGain.gain.value = 0.90;

    // Brickwall Safety Limiter + True-Peak Ceiling Shaper (trimmed -3dB so VU cruises cleanly around -2..0 VU!)
    this.brickwallLimiter = ctx.createDynamicsCompressor();
    this.brickwallLimiter.threshold.value = -5.0;
    this.brickwallLimiter.knee.value = 2.0;
    this.brickwallLimiter.ratio.value = 20.0;
    this.brickwallLimiter.attack.value = 0.001;
    this.brickwallLimiter.release.value = 0.085;

    this.ceilingShaper = ctx.createWaveShaper();
    this.ceilingShaper.curve = createBrickwallCeilingCurve(0.615, 1024);
    this.ceilingShaper.oversample = '2x';

    // Real 1024-sample AnalyserNode on Master Chain
    this.masterAnalyser = ctx.createAnalyser();
    this.masterAnalyser.fftSize = 1024;
    this.masterAnalyser.smoothingTimeConstant = 0.0;

    // Wire Music Path: Sanctuary EQ -> Sanctuary -6.5dB Duck -> RCA Ribbon EQ -> Tape Warmth -> Stinger Duck -> Dry + Chamber -> MusicBus
    this.musicSanctuaryFilter.connect(this.musicSanctuaryGain);
    this.musicSanctuaryGain.connect(this.ribbonWarmShelf);
    this.ribbonWarmShelf.connect(this.ribbonTopRolloff);
    this.ribbonTopRolloff.connect(this.musicTapeShaper);
    this.musicTapeShaper.connect(this.musicStingerDuckGain);

    this.musicStingerDuckGain.connect(this.musicDryGain);
    this.musicDryGain.connect(this.musicBus);
    this.musicStingerDuckGain.connect(this.studioChamberConvolver);
    this.studioChamberConvolver.connect(this.musicWetGain);
    this.musicWetGain.connect(this.musicBus);

    // Subtle chamber send for SFX stingers into same studio room
    this.sfxBus.connect(this.sfxChamberSend);
    this.sfxChamberSend.connect(this.studioChamberConvolver);

    // Wire 5 XAG Buses -> Master -> Glue -> Limiter -> Ceiling -> Analyser -> Destination
    this.musicBus.connect(this.masterBus);
    this.sfxBus.connect(this.masterBus);
    this.crowdBus.connect(this.masterBus);
    this.ambienceBus.connect(this.masterBus);

    this.masterBus.connect(this.broadcastGlueComp);
    this.broadcastGlueComp.connect(makeupGain);
    makeupGain.connect(this.brickwallLimiter);
    this.brickwallLimiter.connect(this.ceilingShaper);
    this.ceilingShaper.connect(this.masterAnalyser);
    this.masterAnalyser.connect(ctx.destination);

    // Apply initial gain slider values immediately
    const now = ctx.currentTime;
    this.masterBus.gain.setValueAtTime(sliderToGain(this.settings.masterVolume), now);
    this.musicBus.gain.setValueAtTime(sliderToGain(this.settings.musicVolume), now);
    this.sfxBus.gain.setValueAtTime(sliderToGain(this.settings.sfxVolume), now);
    this.crowdBus.gain.setValueAtTime(sliderToGain(this.settings.crowdVolume), now);
    this.ambienceBus.gain.setValueAtTime(sliderToGain(this.settings.ambienceVolume), now);

    // Build Authentic 9-Drawbar Hammond B3 Tonewheel Waves + Stereo Leslie 122 Rotary Cabinet
    this.initHammondB3AndLeslie(ctx);

    // Build tiny utility hardware buffers (UHF barge static + hover backup click)
    this.buildHardwareUtilityBuffers(ctx);

    // Immediately begin streaming & decoding all 79 real studio MP3 samples in background
    void this.samplePack.loadCoreAndBackgroundAll(ctx);

    return ctx;
  }

  /**
   * Builds authentic 1966 Hammond B3 9-Drawbar additive tonewheel PeriodicWaves
   * (`16', 5-1/3', 8', 4', 2-2/3', 2', 1-3/5', 1-1/3', 1'` = harmonics
   * `1, 3, 2, 4, 6, 8, 10, 12, 16` relative to the `16'` sub-octave fundamental!)
   * routed through a shared Stereo Leslie 122 Dual-Rotor Doppler & AM cabinet.
   */
  private initHammondB3AndLeslie(ctx: AudioContext): void {
    if (!this.musicSanctuaryFilter) return;

    // Classic Jimmy Smith / 1966 CBS Studio Organ registration: 88 8000 000 + soft upper sheen
    // Harmonic indices relative to 16' sub-fundamental (noteFreq * 0.5):
    // 1 = 16', 2 = 8', 3 = 5-1/3', 4 = 4', 6 = 2-2/3', 8 = 2', 10 = 1-3/5', 12 = 1-1/3', 16 = 1'
    const realWarm = new Float32Array(17);
    const imagWarm = new Float32Array(17);
    imagWarm[1] = 0.85; // 16'
    imagWarm[2] = 1.00; // 8'
    imagWarm[3] = 0.72; // 5-1/3'
    imagWarm[4] = 0.42; // 4'
    imagWarm[6] = 0.16; // 2-2/3'
    imagWarm[8] = 0.12; // 2'
    imagWarm[10] = 0.05; // 1-3/5'
    imagWarm[12] = 0.04; // 1-1/3'
    imagWarm[16] = 0.06; // 1'
    this.hammondWarmWave = ctx.createPeriodicWave(realWarm, imagWarm, {
      disableNormalization: false,
    });

    // Punchier Booker T. / Soul-Jazz registration: 88 8640 004
    const realSoul = new Float32Array(17);
    const imagSoul = new Float32Array(17);
    imagSoul[1] = 0.90;
    imagSoul[2] = 1.00;
    imagSoul[3] = 0.84;
    imagSoul[4] = 0.68;
    imagSoul[6] = 0.44;
    imagSoul[8] = 0.24;
    imagSoul[10] = 0.12;
    imagSoul[12] = 0.08;
    imagSoul[16] = 0.22;
    this.hammondPercWave = ctx.createPeriodicWave(realSoul, imagSoul, {
      disableNormalization: false,
    });

    // Shared Stereo Leslie 122 Rotary Speaker Cabinet
    const input = ctx.createGain();
    input.gain.value = 1.0;

    // Warm 6550 Leslie tube preamp coloration + wooden horn cabinet lowpass
    const preampDrive = ctx.createWaveShaper();
    preampDrive.curve = createWarmTubeSaturationCurve(1.45, 512);

    const hornCabinetLp = ctx.createBiquadFilter();
    hornCabinetLp.type = 'lowpass';
    hornCabinetLp.frequency.value = 2650;
    hornCabinetLp.Q.value = 0.75;

    const hornBodyPeak = ctx.createBiquadFilter();
    hornBodyPeak.type = 'peaking';
    hornBodyPeak.frequency.value = 780;
    hornBodyPeak.Q.value = 0.9;
    hornBodyPeak.gain.value = 2.4;

    // Stereo Dual-Channel Doppler Delay Lines (L & R opposite rotor phase!)
    const delayL = ctx.createDelay(0.02);
    const delayR = ctx.createDelay(0.02);
    delayL.delayTime.value = 0.0028;
    delayR.delayTime.value = 0.0028;

    const ampL = ctx.createGain();
    const ampR = ctx.createGain();
    ampL.gain.value = 0.76;
    ampR.gain.value = 0.76;

    // Rotary Horn Doppler LFO (0.85 Hz Chorale <-> 5.9 Hz Tremolo!)
    const rotorLfo = ctx.createOscillator();
    rotorLfo.type = 'sine';
    rotorLfo.frequency.value = 1.15;

    const dopplerDepthL = ctx.createGain();
    const dopplerDepthR = ctx.createGain();
    dopplerDepthL.gain.value = 0.00055;
    dopplerDepthR.gain.value = -0.00055;

    // Stereo Amplitude Swirl LFO (horn sweeping past left & right studio mics)
    const tremLfo = ctx.createOscillator();
    tremLfo.type = 'sine';
    tremLfo.frequency.value = 1.15;

    const tremDepthL = ctx.createGain();
    const tremDepthR = ctx.createGain();
    tremDepthL.gain.value = 0.22;
    tremDepthR.gain.value = -0.22;

    const merger = ctx.createChannelMerger(2);

    input.connect(preampDrive);
    preampDrive.connect(hornBodyPeak);
    hornBodyPeak.connect(hornCabinetLp);

    hornCabinetLp.connect(delayL);
    hornCabinetLp.connect(delayR);
    delayL.connect(ampL);
    delayR.connect(ampR);
    ampL.connect(merger, 0, 0);
    ampR.connect(merger, 0, 1);
    merger.connect(this.musicSanctuaryFilter);

    rotorLfo.connect(dopplerDepthL);
    rotorLfo.connect(dopplerDepthR);
    dopplerDepthL.connect(delayL.delayTime);
    dopplerDepthR.connect(delayR.delayTime);

    tremLfo.connect(tremDepthL);
    tremLfo.connect(tremDepthR);
    tremDepthL.connect(ampL.gain);
    tremDepthR.connect(ampR.gain);

    rotorLfo.start();
    tremLfo.start();

    const bus: LeslieCabinetBus = {
      input,
      rotorLfo,
      tremLfo,
      fastMode: false,
      setFast: (fast: boolean, now: number) => {
        if (bus.fastMode === fast) return;
        bus.fastMode = fast;
        // Authentic physical Leslie motor inertia spin-up/down (~0.8s)
        const targetHz = fast ? 5.85 : 0.92;
        rotorLfo.frequency.setTargetAtTime(targetHz, now, 0.35);
        tremLfo.frequency.setTargetAtTime(targetHz, now, 0.35);
      },
      dispose: () => {
        try {
          rotorLfo.stop();
          tremLfo.stop();
          input.disconnect();
          merger.disconnect();
        } catch {
          // ignore
        }
      },
    };
    this.leslieBus = bus;
  }

  /**
   * 1.35s true-stereo 1966 Capitol/RCA Studio A wooden chamber impulse response:
   * crisp early walnut reflections (12ms..56ms) + warm < 3.4kHz diffuse tail.
   */
  private buildStudioChamberImpulse(ctx: AudioContext): AudioBuffer {
    const sr = ctx.sampleRate || 48000;
    const dur = 1.35;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(2, len, sr);
    const left = buf.getChannelData(0);
    const right = buf.getChannelData(1);
    const rngL = createSeededNoise(0x19664342);
    const rngR = createSeededNoise(0x19665354);

    const earlyL = [
      [0.012, 0.34],
      [0.025, -0.22],
      [0.041, 0.17],
      [0.055, -0.12],
    ];
    const earlyR = [
      [0.016, 0.32],
      [0.029, -0.23],
      [0.044, 0.16],
      [0.059, -0.11],
    ];
    for (const [sec, amp] of earlyL) {
      const idx = Math.min(len - 1, Math.floor(sec * sr));
      left[idx] += amp;
    }
    for (const [sec, amp] of earlyR) {
      const idx = Math.min(len - 1, Math.floor(sec * sr));
      right[idx] += amp;
    }

    let lpL = 0;
    let lpR = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const preDelayEnv = Math.min(1, t / 0.014);
      const dampAlpha = 0.28 * Math.exp(-t * 1.35) + 0.05;
      const decay = Math.exp(-t / 0.38) * preDelayEnv;
      lpL += dampAlpha * (rngL() - lpL);
      lpR += dampAlpha * (rngR() - lpR);
      left[i] = (left[i] + lpL * decay * 0.30) * 0.85;
      right[i] = (right[i] + lpR * decay * 0.30) * 0.85;
    }
    return buf;
  }

  private buildHardwareUtilityBuffers(ctx: AudioContext): void {
    // 1. Stage 09 Offshore Barge Hull Creak & UHF Carrier Static Grain
    {
      const len = Math.round(0.24 * AMBIENCE_GRAIN_SR);
      const buf = ctx.createBuffer(1, len, AMBIENCE_GRAIN_SR);
      const ch = buf.getChannelData(0);
      const rng = createSeededNoise(0x55484638);
      let staticLp = 0;
      for (let i = 0; i < len; i++) {
        const loopPhase = (2 * Math.PI * i) / len;
        const creak =
          0.20 *
          (0.5 + 0.5 * Math.sin(loopPhase)) *
          (Math.sin(loopPhase * 39 + 0.7 * Math.sin(loopPhase * 3)) +
            0.5 * Math.sin(loopPhase * 61));
        const crackle = rng();
        staticLp += 0.34 * (crackle - staticLp);
        const burst = Math.abs(crackle) > 0.92 ? crackle * 0.25 : 0;
        ch[i] = creak + staticLp * 0.12 + burst * 0.15;
      }
      this.uhfCreakBuffer = buf;
    }

    // 2. Ultra-clean 3.4ms mechanical Bakelite micro-tick (used only before MP3s finish decoding)
    {
      const sr = ctx.sampleRate || 48000;
      const len = Math.max(32, Math.round(0.0034 * sr));
      const buf = ctx.createBuffer(1, len, sr);
      const ch = buf.getChannelData(0);
      let peak = 1e-6;
      for (let i = 0; i < len; i++) {
        const u = i / (len - 1);
        const t = i / sr;
        const cosEnv = 0.5 * (1 - Math.cos(2 * Math.PI * u));
        const s =
          cosEnv *
          (0.56 * Math.sin(2 * Math.PI * 1180 * t) +
            0.34 * Math.sin(2 * Math.PI * 1940 * t + 0.4) +
            0.16 * Math.sin(2 * Math.PI * 2680 * t + 1.1));
        ch[i] = s;
        if (Math.abs(s) > peak) peak = Math.abs(s);
      }
      for (let i = 0; i < len; i++) ch[i] /= peak;
      this.fallbackClickBuffer = buf;
    }
  }

  private installAutoUnlockListeners(): void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return;
    }
    const onGesture = (): void => {
      void this.unlock();
    };
    window.addEventListener('pointerdown', onGesture, { passive: true });
    window.addEventListener('keydown', onGesture, { passive: true });
    window.addEventListener('touchstart', onGesture, { passive: true });
    this.detachUnlockListeners = () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      window.removeEventListener('touchstart', onGesture);
    };
  }

  /**
   * Unlocks WebAudio on user gesture, AWAITS full real studio sample decoding
   * (so `recordMasterAudioSamples()` and first-beat playback ALWAYS use real
   * recorded acoustic instruments, drums, foley, and crowd!), and starts music.
   */
  public async unlock(): Promise<void> {
    const ctx = this.ensureAudioGraph();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Browser may require gesture; auto-unlock listener will retry
      }
    }

    // Await Tier-1 core studio samples + allow brief window for Tier-2 orchestral samples
    await this.waitForSamplesReady();

    if (!this.isMusicRunning && !this.disposed) {
      this.startMusic();
    } else if (this.isMusicRunning && !this.disposed) {
      // Refresh ambience bed once real crowd samples are decoded
      this.rebuildStageAmbienceBed();
    }
  }

  public async waitForSamplesReady(timeoutMs = 2600): Promise<void> {
    const ctx = this.ensureAudioGraph();
    if (!ctx) return;
    await this.samplePack.loadCoreAndBackgroundAll(ctx);
    await Promise.race([this.samplePack.waitForAll(ctx), sleepMs(timeoutMs)]);
  }

  public getSamplePackStats(): SamplePackStatsV7 {
    return this.samplePack.getStats();
  }

  public async resume(): Promise<void> {
    return this.unlock();
  }

  public async init(): Promise<void> {
    return this.unlock();
  }

  private wakeContextSync(): AudioContext | null {
    const ctx = this.ensureAudioGraph();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /**
   * Convenience master bus PCM recorder directly on the audio engine (awaits
   * unlock + full real studio sample loading before capturing!).
   */
  public async recordMasterAudioSamples(
    durationMs = 4000,
    onCueSchedule?: () => void,
  ): Promise<{ sampleRate: number; samples: number[]; stats: SamplePackStatsV7 }> {
    await this.unlock();
    const ctx = this.getAudioContext();
    const bus = this.masterAnalyser ?? this.masterBus;
    if (!ctx || !bus) {
      return { sampleRate: 44100, samples: [], stats: this.getSamplePackStats() };
    }

    const proc = ctx.createScriptProcessor(2048, 2, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    const collected: number[] = [];

    proc.onaudioprocess = (ev) => {
      const chL = ev.inputBuffer.getChannelData(0);
      const chR = ev.inputBuffer.numberOfChannels > 1 ? ev.inputBuffer.getChannelData(1) : chL;
      for (let i = 0; i < chL.length; i++) {
        const mono = 0.5 * (chL[i] + chR[i]);
        collected.push(Number(mono.toFixed(5)));
      }
    };

    bus.connect(proc);
    proc.connect(mute);
    mute.connect(ctx.destination);

    if (onCueSchedule) {
      onCueSchedule();
    }

    await sleepMs(durationMs);

    try {
      bus.disconnect(proc);
      proc.disconnect();
      mute.disconnect();
    } catch {
      // ignore
    }

    return {
      sampleRate: Math.round(ctx.sampleRate),
      samples: collected,
      stats: this.getSamplePackStats(),
    };
  }

  // --------------------------------------------------------------------------
  // 2. 5 Live XAG Gain Buses & True 300ms Ballistic VU Meter (`0 VU = -14 dBFS`)
  // --------------------------------------------------------------------------

  public applySettings(next: Partial<BroadcastSettingsV7>): void {
    this.settings = {
      ...this.settings,
      ...next,
    };
    if (typeof next.hapticsEnabled === 'boolean') {
      this.haptics.setEnabled(next.hapticsEnabled);
    }

    const ctx = this.ensureAudioGraph();
    if (!ctx) return;
    const now = ctx.currentTime;

    this.masterBus?.gain.setTargetAtTime(
      sliderToGain(this.settings.masterVolume),
      now,
      SLIDER_SMOOTH_TAU_SEC,
    );
    this.musicBus?.gain.setTargetAtTime(
      sliderToGain(this.settings.musicVolume),
      now,
      SLIDER_SMOOTH_TAU_SEC,
    );
    this.sfxBus?.gain.setTargetAtTime(
      sliderToGain(this.settings.sfxVolume),
      now,
      SLIDER_SMOOTH_TAU_SEC,
    );
    this.crowdBus?.gain.setTargetAtTime(
      sliderToGain(this.settings.crowdVolume),
      now,
      SLIDER_SMOOTH_TAU_SEC,
    );
    this.ambienceBus?.gain.setTargetAtTime(
      sliderToGain(this.settings.ambienceVolume),
      now,
      SLIDER_SMOOTH_TAU_SEC,
    );
  }

  public updateSettings(next: Partial<BroadcastSettingsV7>): void {
    this.applySettings(next);
  }

  public setMasterVolume(volume0to100: number): void {
    this.applySettings({ masterVolume: clamp(volume0to100, 0, 100) });
  }

  public setMusicVolume(volume0to100: number): void {
    this.applySettings({ musicVolume: clamp(volume0to100, 0, 100) });
  }

  public setSfxVolume(volume0to100: number): void {
    this.applySettings({ sfxVolume: clamp(volume0to100, 0, 100) });
  }

  public setCrowdVolume(volume0to100: number): void {
    this.applySettings({ crowdVolume: clamp(volume0to100, 0, 100) });
  }

  public setAmbienceVolume(volume0to100: number): void {
    this.applySettings({ ambienceVolume: clamp(volume0to100, 0, 100) });
  }

  public getSettings(): BroadcastSettingsV7 {
    return { ...this.settings };
  }

  public getBallisticVuState(dtSec = 1 / 60): BallisticVuStateV7 {
    const dt = clamp(dtSec > 0 ? dtSec : 1 / 60, 0.001, 0.25);

    if (this.isMusicRunning) {
      this.pumpShowbandLookahead();
    }

    let rms = 0;
    let samplePeak = 0;

    if (this.masterAnalyser && this.ctx && this.ctx.state === 'running') {
      this.masterAnalyser.getFloatTimeDomainData(this.vuTimeDomainBuf);
      let sumSq = 0;
      const n = this.vuTimeDomainBuf.length;
      for (let i = 0; i < n; i++) {
        const s = this.vuTimeDomainBuf[i];
        sumSq += s * s;
        const abs = s < 0 ? -s : s;
        if (abs > samplePeak) samplePeak = abs;
      }
      rms = Math.sqrt(sumSq / n);
    }

    const targetVuLinear = rms / VU_ZERO_LINEAR_RMS;
    const alpha = 1 - Math.exp(-dt / ANSI_VU_TAU_SEC);
    this.ballisticVuLinear += alpha * (targetVuLinear - this.ballisticVuLinear);

    if (samplePeak >= PEAK_JEWEL_THRESHOLD_LINEAR) {
      this.peakHoldRemainingSec = PEAK_JEWEL_HOLD_SEC;
    } else {
      this.peakHoldRemainingSec = Math.max(0, this.peakHoldRemainingSec - dt);
    }

    const vuDb = clamp(20 * Math.log10(Math.max(this.ballisticVuLinear, 0.1)), -20, 3.5);
    const needleAngleDeg = clamp(-45 + 63 * Math.min(this.ballisticVuLinear, 1.4286), -45, 45);

    return {
      vuDb,
      needleAngleDeg,
      peakLedActive: this.peakHoldRemainingSec > 0,
    };
  }

  public getBakedKernelBytes(): number {
    return this.samplePack.getStats().decodedBytes + this.chamberIrBytes;
  }

  public getActiveVoiceCount(): number {
    this.pruneExpiredVoices();
    return this.activeVoices.length;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  // --------------------------------------------------------------------------
  // 3. Voice Pool Manager & Real Studio Sample Players
  // --------------------------------------------------------------------------

  private pruneExpiredVoices(): void {
    if (!this.ctx) {
      this.activeVoices.length = 0;
      return;
    }
    const now = this.ctx.currentTime;
    let writeIdx = 0;
    for (let i = 0; i < this.activeVoices.length; i++) {
      const v = this.activeVoices[i];
      if (!v.stopped && v.endTime > now + 0.004) {
        this.activeVoices[writeIdx++] = v;
      }
    }
    this.activeVoices.length = writeIdx;
  }

  private allocateVoiceSlot(priority: 1 | 2 | 3): boolean {
    if (!this.ctx) return false;
    this.pruneExpiredVoices();

    while (this.activeVoices.length >= MAX_CONCURRENT_VOICES) {
      let victimIdx = -1;
      let bestPriority = 99;
      let earliestEnd = Infinity;

      for (let i = 0; i < this.activeVoices.length; i++) {
        const v = this.activeVoices[i];
        if (
          v.priority < bestPriority ||
          (v.priority === bestPriority && v.endTime < earliestEnd)
        ) {
          bestPriority = v.priority;
          earliestEnd = v.endTime;
          victimIdx = i;
        }
      }

      if (victimIdx === -1 || bestPriority > priority) {
        return false;
      }

      const victim = this.activeVoices[victimIdx];
      victim.stopped = true;
      const now = this.ctx.currentTime;
      try {
        victim.gainNode.gain.cancelScheduledValues(now);
        victim.gainNode.gain.setTargetAtTime(0.0001, now, 0.002);
        victim.stopNode.stop(now + 0.009);
      } catch {
        // ignore
      }
      this.activeVoices.splice(victimIdx, 1);
    }

    return true;
  }

  /**
   * Core real AudioBuffer player with smooth musical ADSR release gating,
   * optional highpass/lowpass tone-shaping, pitch-glide, offset slicing & stereo pan.
   */
  private triggerBuffer(opts: {
    buffer: AudioBuffer | null;
    dest: AudioNode | null;
    when: number;
    gain: number;
    playbackRate?: number;
    endPlaybackRate?: number;
    offsetSec?: number;
    durationSec?: number;
    attackSec?: number;
    releaseSec?: number;
    priority: 1 | 2 | 3;
    lowpassHz?: number;
    highpassHz?: number;
    pan?: number;
    loop?: boolean;
  }): void {
    const ctx = this.ctx;
    const buf = opts.buffer;
    const dest = opts.dest;
    if (!ctx || !buf || !dest || opts.gain <= 0.0002) return;
    if (!this.allocateVoiceSlot(opts.priority)) return;

    const rate = clamp(opts.playbackRate ?? 1.0, 0.25, 4.0);
    const offset = clamp(opts.offsetSec ?? 0, 0, Math.max(0, buf.duration - 0.01));
    const maxPlayableDur = opts.loop
      ? Math.max(0.04, opts.durationSec ?? buf.duration)
      : Math.max(0.012, (buf.duration - offset) / rate);
    const playDur = opts.durationSec
      ? Math.min(opts.loop ? opts.durationSec : maxPlayableDur, Math.max(0.014, opts.durationSec))
      : maxPlayableDur;

    const startAt = Math.max(ctx.currentTime, opts.when);
    const endAt = startAt + playDur;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = Boolean(opts.loop);
    src.playbackRate.setValueAtTime(rate, startAt);
    if (opts.endPlaybackRate && Math.abs(opts.endPlaybackRate - rate) > 0.002) {
      src.playbackRate.exponentialRampToValueAtTime(
        clamp(opts.endPlaybackRate, 0.25, 4.0),
        endAt,
      );
    }

    const envGain = ctx.createGain();
    const attack = Math.min(opts.attackSec ?? 0.003, playDur * 0.35);
    const release = Math.min(opts.releaseSec ?? 0.055, playDur * 0.65);

    if (attack > 0.002) {
      envGain.gain.setValueAtTime(0.0001, startAt);
      envGain.gain.linearRampToValueAtTime(opts.gain, startAt + attack);
    } else {
      envGain.gain.setValueAtTime(opts.gain, startAt);
    }

    if (opts.durationSec || opts.loop || release > 0.02) {
      const fadeStart = Math.max(startAt + attack + 0.002, endAt - release);
      envGain.gain.setValueAtTime(opts.gain, fadeStart);
      envGain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    }

    let tail: AudioNode = src;
    if (opts.highpassHz && opts.highpassHz > 25) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(opts.highpassHz, startAt);
      tail.connect(hp);
      tail = hp;
    }
    if (opts.lowpassHz && opts.lowpassHz > 120) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(opts.lowpassHz, startAt);
      tail.connect(lp);
      tail = lp;
    }
    if (
      typeof opts.pan === 'number' &&
      Math.abs(opts.pan) > 0.01 &&
      typeof ctx.createStereoPanner === 'function'
    ) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(opts.pan, -1, 1), startAt);
      tail.connect(panner);
      tail = panner;
    }

    tail.connect(envGain);
    envGain.connect(dest);

    src.start(startAt, offset);
    src.stop(endAt + 0.012);

    this.activeVoices.push({
      priority: opts.priority,
      startTime: startAt,
      endTime: endAt,
      gainNode: envGain,
      stopNode: src,
      stopped: false,
    });
  }

  /** Plays a real decoded multi-sampled acoustic studio instrument note. */
  private playInstrument(
    instrumentId: AcousticInstrumentIdV7,
    midiNote: number,
    when: number,
    durationSec: number,
    gain: number,
    opts?: {
      dest?: AudioNode | null;
      pan?: number;
      lowpassHz?: number;
      highpassHz?: number;
      attackSec?: number;
      releaseSec?: number;
      priority?: 1 | 2 | 3;
      bendToMidi?: number;
    },
  ): void {
    const pick = this.samplePack.pickZoneWithFallback(instrumentId, midiNote);
    if (!pick) return;

    const dest = opts?.dest ?? this.musicSanctuaryFilter;
    const endRate =
      typeof opts?.bendToMidi === 'number'
        ? Math.pow(2, (opts.bendToMidi - pick.rootMidi) / 12)
        : undefined;

    const defaultAttack = instrumentId === 'strings' ? 0.065 : 0.003;
    const defaultRelease =
      instrumentId === 'strings'
        ? 0.24
        : instrumentId === 'trumpet' || instrumentId === 'brass' || instrumentId === 'muted_trumpet'
          ? 0.065
          : instrumentId === 'upright_bass'
            ? 0.095
            : 0.14;

    this.triggerBuffer({
      buffer: pick.buffer,
      dest,
      when,
      gain,
      playbackRate: pick.playbackRate,
      endPlaybackRate: endRate,
      durationSec,
      attackSec: opts?.attackSec ?? defaultAttack,
      releaseSec: opts?.releaseSec ?? defaultRelease,
      priority: opts?.priority ?? 2,
      lowpassHz: opts?.lowpassHz,
      highpassHz: opts?.highpassHz,
      pan: opts?.pan,
    });
  }

  /** Plays a real Boston Jazz Drum Kit recording (`virtuosity_drums` / `VCSL` CC0). */
  private playDrum(
    drumId: string,
    when: number,
    gain: number,
    opts?: {
      dest?: AudioNode | null;
      playbackRate?: number;
      durationSec?: number;
      pan?: number;
      lowpassHz?: number;
      highpassHz?: number;
      priority?: 1 | 2 | 3;
    },
  ): void {
    const buf = this.samplePack.getDrum(drumId);
    if (!buf) return;
    this.triggerBuffer({
      buffer: buf,
      dest: opts?.dest ?? this.musicSanctuaryFilter,
      when,
      gain,
      playbackRate: opts?.playbackRate ?? 1.0,
      durationSec: opts?.durationSec,
      attackSec: 0.001,
      releaseSec: 0.04,
      priority: opts?.priority ?? 1,
      pan: opts?.pan,
      lowpassHz: opts?.lowpassHz,
      highpassHz: opts?.highpassHz,
    });
  }

  /** Plays a real Wikimedia Commons / VCSL physical mechanical studio foley recording. */
  private playFoley(
    foleyId: string,
    when: number,
    gain: number,
    opts?: {
      dest?: AudioNode | null;
      playbackRate?: number;
      offsetSec?: number;
      durationSec?: number;
      pan?: number;
      lowpassHz?: number;
      highpassHz?: number;
      priority?: 1 | 2 | 3;
    },
  ): boolean {
    const buf = this.samplePack.getFoley(foleyId);
    if (!buf) return false;
    this.triggerBuffer({
      buffer: buf,
      dest: opts?.dest ?? this.sfxBus,
      when,
      gain,
      playbackRate: opts?.playbackRate ?? 1.0,
      offsetSec: opts?.offsetSec,
      durationSec: opts?.durationSec,
      attackSec: 0.001,
      releaseSec: 0.03,
      priority: opts?.priority ?? 3,
      pan: opts?.pan,
      lowpassHz: opts?.lowpassHz,
      highpassHz: opts?.highpassHz,
    });
    return true;
  }

  /** Plays real Wikimedia Commons / MusyngKite live studio audience reactions (NEVER in sealed vaults!). */
  private playCrowd(
    crowdId: 'applause_warm' | 'applause_big' | 'cheer_hurray' | 'studio_laugh' | 'studio_clap',
    when: number,
    gain: number,
    opts?: {
      durationSec?: number;
      playbackRate?: number;
      lowpassHz?: number;
      highpassHz?: number;
      attackSec?: number;
      releaseSec?: number;
      forceEvenIfSealed?: boolean;
    },
  ): void {
    if (!opts?.forceEvenIfSealed && this.isSealedVaultScene()) return;
    const buf =
      this.samplePack.getCrowd(crowdId) ??
      this.samplePack.getCrowd('applause_warm') ??
      this.samplePack.getCrowd('studio_clap');
    if (!buf || !this.crowdBus) return;

    this.triggerBuffer({
      buffer: buf,
      dest: this.crowdBus,
      when,
      gain,
      playbackRate: opts?.playbackRate ?? 1.0,
      durationSec: opts?.durationSec ?? Math.min(2.6, buf.duration),
      attackSec: opts?.attackSec ?? 0.06,
      releaseSec: opts?.releaseSec ?? 0.45,
      priority: 2,
      lowpassHz: opts?.lowpassHz ?? 7600,
      highpassHz: opts?.highpassHz ?? 110,
    });
  }

  /**
   * Authentic 9-Drawbar Hammond B3 Tonewheel Voice routed into the Stereo Leslie 122 Cabinet!
   * Includes subtle 3rd-harmonic percussive key-click on chord attacks.
   */
  private playHammondB3Note(
    midiNote: number,
    when: number,
    durationSec: number,
    gain: number,
    opts?: {
      soulful?: boolean;
      keyClick?: boolean;
      fastLeslie?: boolean;
      dest?: AudioNode | null;
      priority?: 1 | 2 | 3;
    },
  ): void {
    const ctx = this.ctx;
    const wave = opts?.soulful ? this.hammondPercWave : this.hammondWarmWave;
    const targetDest = opts?.dest ?? this.leslieBus?.input ?? this.musicSanctuaryFilter;
    if (!ctx || !wave || !targetDest || gain <= 0.0002) return;
    if (!this.allocateVoiceSlot(opts?.priority ?? 1)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.08, durationSec);
    const endAt = startAt + dur;

    if (typeof opts?.fastLeslie === 'boolean' && this.leslieBus) {
      this.leslieBus.setFast(opts.fastLeslie, startAt);
    }

    // Tonewheel fundamental is 16' sub-octave (0.5x written note frequency)
    const noteHz = midiToHz(midiNote);
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(noteHz * 0.5, startAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(gain, startAt + 0.012);
    const relStart = Math.max(startAt + 0.02, endAt - Math.min(0.11, dur * 0.35));
    env.gain.setValueAtTime(gain * 0.92, relStart);
    env.gain.exponentialRampToValueAtTime(0.0001, endAt);

    osc.connect(env);
    env.connect(targetDest);

    osc.start(startAt);
    osc.stop(endAt + 0.015);

    this.activeVoices.push({
      priority: opts?.priority ?? 1,
      startTime: startAt,
      endTime: endAt,
      gainNode: env,
      stopNode: osc,
      stopped: false,
    });

    // Classic Hammond B3 3rd-harmonic percussive key-click chirp (short 34ms harmonic ping)
    if (opts?.keyClick && this.allocateVoiceSlot(1)) {
      const pOsc = ctx.createOscillator();
      pOsc.type = 'sine';
      pOsc.frequency.setValueAtTime(noteHz * 3.0, startAt);
      const pEnv = ctx.createGain();
      pEnv.gain.setValueAtTime(0.0001, startAt);
      pEnv.gain.linearRampToValueAtTime(gain * 0.32, startAt + 0.003);
      pEnv.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.042);
      pOsc.connect(pEnv);
      pEnv.connect(targetDest);
      pOsc.start(startAt);
      pOsc.stop(startAt + 0.048);

      this.activeVoices.push({
        priority: 1,
        startTime: startAt,
        endTime: startAt + 0.048,
        gainNode: pEnv,
        stopNode: pOsc,
        stopped: false,
      });
    }
  }

  private playHammondChord(
    midiNotes: readonly number[],
    when: number,
    durationSec: number,
    gainPerVoice: number,
    opts?: { soulful?: boolean; keyClick?: boolean; fastLeslie?: boolean; dest?: AudioNode | null },
  ): void {
    for (let i = 0; i < midiNotes.length; i++) {
      this.playHammondB3Note(midiNotes[i], when + i * 0.007, durationSec, gainPerVoice, {
        soulful: opts?.soulful,
        keyClick: i === midiNotes.length - 1 && Boolean(opts?.keyClick),
        fastLeslie: i === 0 ? opts?.fastLeslie : undefined,
        dest: opts?.dest,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Clue-Reading Sanctuary, Stage Worlds, Sealed Vaults & Bellamy Spite Chop
  // --------------------------------------------------------------------------

  /**
   * Smoothly engages `-7.0dB` peaking EQ carve (`1,800Hz`, `Q=0.85`) AND
   * transitions the live band into a soothing Merv Griffin *Think!* chamber groove
   * so players read questions calmly for 30–35 seconds without brass clutter!
   */
  public setClueSanctuaryActive(active: boolean): void {
    this.clueSanctuaryActive = Boolean(active);
    const ctx = this.ensureAudioGraph();
    if (!ctx || !this.musicSanctuaryFilter) return;

    const now = ctx.currentTime;
    this.musicSanctuaryFilter.gain.setTargetAtTime(
      this.clueSanctuaryActive ? -7.0 : 0.0,
      now,
      0.045,
    );
    this.musicSanctuaryGain?.gain.setTargetAtTime(
      this.clueSanctuaryActive ? 0.47 : 1.0,
      now,
      0.065,
    );
    if (this.leslieBus && this.clueSanctuaryActive) {
      this.leslieBus.setFast(false, now);
    }
  }

  public isClueSanctuaryActive(): boolean {
    return this.clueSanctuaryActive;
  }

  public setBellamySpiteChop(active: boolean): void {
    const next = Boolean(active);
    if (this.bellamySpiteChopActive === next) return;
    this.bellamySpiteChopActive = next;
    if (
      this.currentScene === 'STAGE_07_1969_MONTE_CARLO_CASINO' &&
      this.currentSubstepInBar >= 16 &&
      next
    ) {
      this.currentSubstepInBar = 0;
      this.currentBarIndex = (this.currentBarIndex + 1) % 8;
    }
  }

  public isBellamySpiteChopActive(): boolean {
    return this.bellamySpiteChopActive;
  }

  public setCoupRegime(regime: CoupRegimeIdV7): void {
    this.coupRegime = regime;
  }

  public getCoupRegime(): CoupRegimeIdV7 {
    return this.coupRegime;
  }

  public setScene(sceneId: ShowbandSceneIdV7): void {
    if (!(sceneId in SHOWBAND_SCENE_SPECS_V7)) return;
    if (sceneId !== 'TRAPDOOR_BLITZ') {
      this.baseStageBeforeBlitz = sceneId;
    }
    if (this.currentScene === sceneId && this.isMusicRunning) return;

    this.currentScene = sceneId;
    this.currentBarIndex = 0;
    this.currentSubstepInBar = 0;

    const ctx = this.wakeContextSync();
    if (ctx) {
      this.nextSubstepTime = ctx.currentTime + 0.025;
      this.rebuildStageAmbienceBed();
      if (!this.isMusicRunning) {
        this.startMusic();
      }
    }
  }

  public setStageWorld(stageId: StageWorldIdV7): void {
    this.setScene(stageId);
  }

  public enterGreenRoom(): void {
    this.setScene('GREEN_ROOM');
  }

  public setTrapdoorBlitzActive(active: boolean): void {
    if (active) {
      this.setScene('TRAPDOOR_BLITZ');
    } else if (this.currentScene === 'TRAPDOOR_BLITZ') {
      this.setScene(this.baseStageBeforeBlitz);
    }
  }

  public getCurrentScene(): ShowbandSceneIdV7 {
    return this.currentScene;
  }

  public getCurrentBpm(): number {
    return SHOWBAND_SCENE_SPECS_V7[this.currentScene].bpm;
  }

  public getCurrentTimeSignature(): '4/4' | '5/4' {
    if (
      this.currentScene === 'STAGE_07_1969_MONTE_CARLO_CASINO' &&
      !this.bellamySpiteChopActive
    ) {
      return '5/4';
    }
    return '4/4';
  }

  public getCurrentBarDurationSec(): number {
    const bpm = this.getCurrentBpm();
    const beatsPerBar = this.getCurrentTimeSignature() === '5/4' ? 5 : 4;
    return (beatsPerBar * 60) / bpm;
  }

  public isSealedVaultScene(sceneId: ShowbandSceneIdV7 = this.currentScene): boolean {
    if (sceneId === 'TRAPDOOR_BLITZ') {
      return SHOWBAND_SCENE_SPECS_V7[this.baseStageBeforeBlitz].isSealedVault;
    }
    return SHOWBAND_SCENE_SPECS_V7[sceneId].isSealedVault;
  }

  // --------------------------------------------------------------------------
  // 5. Stage Room Tone & Sealed-Vault Zero-Crowd Ambience Bed
  // --------------------------------------------------------------------------

  private rebuildStageAmbienceBed(): void {
    if (this.ambienceBed) {
      this.ambienceBed.stopAll(0.28);
      this.ambienceBed = null;
    }
    const ctx = this.ctx;
    if (!ctx || !this.ambienceBus || !this.crowdBus || !this.isMusicRunning) return;

    const now = ctx.currentTime;
    const activeStage =
      this.currentScene === 'TRAPDOOR_BLITZ'
        ? this.baseStageBeforeBlitz
        : this.currentScene;
    const isSealed = this.isSealedVaultScene(this.currentScene);
    const stopCallbacks: Array<(fadeSec: number) => void> = [];

    if (activeStage === 'STAGE_04_1958_ISOLATION_VAULT') {
      // 1958 Isolation Vault 60Hz/120Hz AC transformer room hum (ZERO studio crowd!)
      const osc60 = ctx.createOscillator();
      osc60.type = 'sine';
      osc60.frequency.setValueAtTime(60, now);
      const osc120 = ctx.createOscillator();
      osc120.type = 'triangle';
      osc120.frequency.setValueAtTime(120, now);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(240, now);

      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.0001, now);
      humGain.gain.linearRampToValueAtTime(0.036, now + 0.35);

      const g120 = ctx.createGain();
      g120.gain.setValueAtTime(0.25, now);

      osc60.connect(lp);
      osc120.connect(g120);
      g120.connect(lp);
      lp.connect(humGain);
      humGain.connect(this.ambienceBus);

      osc60.start(now);
      osc120.start(now);

      stopCallbacks.push((fadeSec) => {
        const t = ctx.currentTime;
        humGain.gain.cancelScheduledValues(t);
        humGain.gain.setTargetAtTime(0.0001, t, Math.max(0.02, fadeSec * 0.3));
        osc60.stop(t + fadeSec + 0.05);
        osc120.stop(t + fadeSec + 0.05);
      });
    } else if (activeStage === 'STAGE_09_CHANNEL_83_UHF_BARGE' && this.uhfCreakBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.uhfCreakBuffer;
      src.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2200, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.055, now + 0.35);

      src.connect(lp);
      lp.connect(g);
      g.connect(this.ambienceBus);
      src.start(now);

      stopCallbacks.push((fadeSec) => {
        const t = ctx.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(0.0001, t, Math.max(0.02, fadeSec * 0.3));
        src.stop(t + fadeSec + 0.05);
      });
    } else if (activeStage === 'STAGE_05_1984_LARSON_CRT_LAB') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.020, now + 0.3);
      osc.connect(g);
      g.connect(this.ambienceBus);
      osc.start(now);

      stopCallbacks.push((fadeSec) => {
        const t = ctx.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setTargetAtTime(0.0001, t, Math.max(0.02, fadeSec * 0.3));
        osc.stop(t + fadeSec + 0.05);
      });
    }

    // Live Broadcast Audience Stages ONLY: Warm carpeted 1966 studio room presence (NEVER in sealed vaults!)
    const crowdBuf = this.samplePack.getCrowd('applause_warm');
    if (!isSealed && crowdBuf) {
      const src = ctx.createBufferSource();
      src.buffer = crowdBuf;
      src.loop = true;
      src.playbackRate.setValueAtTime(0.58, now);

      const hallLp = ctx.createBiquadFilter();
      hallLp.type = 'lowpass';
      hallLp.frequency.setValueAtTime(420, now);

      const hallGain = ctx.createGain();
      hallGain.gain.setValueAtTime(0.0001, now);
      hallGain.gain.linearRampToValueAtTime(0.018, now + 0.5);

      src.connect(hallLp);
      hallLp.connect(hallGain);
      hallGain.connect(this.ambienceBus);
      src.start(now);

      stopCallbacks.push((fadeSec) => {
        const t = ctx.currentTime;
        hallGain.gain.cancelScheduledValues(t);
        hallGain.gain.setTargetAtTime(0.0001, t, Math.max(0.02, fadeSec * 0.3));
        src.stop(t + fadeSec + 0.05);
      });
    }

    this.ambienceBed = {
      stopAll: (fadeSec: number) => {
        for (const fn of stopCallbacks) {
          try {
            fn(fadeSec);
          } catch {
            // Safe cleanup
          }
        }
      },
    };
  }

  // --------------------------------------------------------------------------
  // 6. Real Sampled 1966 TV Showband Sequencer (All 12 Scenes + *Think!* Bed)
  // --------------------------------------------------------------------------

  public startMusic(): void {
    if (this.disposed) return;
    const ctx = this.ensureAudioGraph();
    if (!ctx) return;

    if (!this.isMusicRunning) {
      this.isMusicRunning = true;
      this.nextSubstepTime = ctx.currentTime + 0.025;
      this.rebuildStageAmbienceBed();
    }

    if (!this.schedulerTimer) {
      this.schedulerTimer = setInterval(() => {
        this.pumpShowbandLookahead();
      }, 26);
    }
  }

  public stopMusic(): void {
    this.isMusicRunning = false;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.ambienceBed) {
      this.ambienceBed.stopAll(0.18);
      this.ambienceBed = null;
    }
  }

  public isPlaying(): boolean {
    return this.isMusicRunning;
  }

  private pumpShowbandLookahead(): void {
    const ctx = this.ctx;
    if (!ctx || !this.musicSanctuaryFilter || !this.isMusicRunning || this.disposed) {
      return;
    }
    if (ctx.state !== 'running') {
      this.nextSubstepTime = ctx.currentTime + 0.025;
      return;
    }

    const now = ctx.currentTime;
    if (this.nextSubstepTime < now - 0.14) {
      this.nextSubstepTime = now + 0.015;
    }

    const lookaheadHorizon = now + 0.12;
    let guard = 0;
    while (this.nextSubstepTime < lookaheadHorizon && guard < 12) {
      guard++;
      const spec = SHOWBAND_SCENE_SPECS_V7[this.currentScene];
      const substepsPerBar = this.getCurrentTimeSignature() === '5/4' ? 20 : 16;
      // Gentle calming tempo shift (~98 BPM) when Merv Griffin *Think!* bed is active on non-blitz stages
      const effectiveBpm =
        this.clueSanctuaryActive && this.currentScene !== 'TRAPDOOR_BLITZ'
          ? Math.min(spec.bpm, 98)
          : spec.bpm;
      const sixteenthSec = 60 / effectiveBpm / 4;

      this.scheduleSceneSubstep(
        this.currentScene,
        spec,
        this.currentBarIndex,
        this.currentSubstepInBar,
        substepsPerBar,
        this.nextSubstepTime,
        sixteenthSec,
      );

      this.nextSubstepTime += sixteenthSec;
      this.currentSubstepInBar++;
      if (this.currentSubstepInBar >= substepsPerBar) {
        this.currentSubstepInBar = 0;
        this.currentBarIndex = (this.currentBarIndex + 1) % 8;
      }
    }
  }

  /**
   * Iconic Merv Griffin *"Think!"* / Score Productions Gentle 30-Second Thinking Bed
   * Played automatically whenever `clueSanctuaryActive === true` on non-Blitz stages!
   * Soft pizzicato upright bass, delicate real vibraphone + Steinway grand piano
   * chime pulse, whisper-quiet brushed snare & woodblock, and creamy slow-Leslie Hammond B3.
   */
  private scheduleMervThinkBed(
    spec: ShowbandSceneSpecV7,
    barIdx: number,
    step: number,
    stepsPerBar: number,
    when: number,
    sixteenthSec: number,
  ): void {
    const isMajor = spec.motifMode === 'MAJOR_6';
    const root = spec.rootMidi; // e.g., F3 = 53
    const barDur = sixteenthSec * stepsPerBar;
    const swing = step % 4 === 2 ? sixteenthSec * 0.24 : 0;
    const t = when + swing;

    // Classic gentle 8-bar *Think!* I6 - vi7 - ii7 - V7 turnaround (or moody minor equivalent)
    const progRoots = isMajor ? [0, 9, 2, 7, 0, 9, 2, 7] : [0, 8, 5, 7, 0, 3, 2, 7];
    const progVoicings: ReadonlyArray<readonly [number, number, number]> = isMajor
      ? [
          [4, 7, 9],  // I6
          [3, 7, 10], // vi7
          [3, 7, 10], // ii7
          [4, 7, 10], // V7
          [4, 7, 11], // Imaj7
          [3, 7, 10], // vi7
          [3, 7, 10], // ii7
          [5, 9, 10], // V13sus4
        ]
      : [
          [3, 7, 10], // im7
          [4, 7, 11], // bVImaj7
          [3, 7, 10], // ivm7
          [4, 10, 13], // V7b9
          [3, 7, 14], // im9
          [4, 7, 11], // bIIImaj7
          [3, 6, 10], // iim7b5
          [4, 10, 13], // V7b9
        ];

    const deg = progRoots[barIdx];
    const tones = progVoicings[barIdx];
    const bassRoot = root - 12 + (deg > 6 ? deg - 12 : deg);
    const chordBase = root + (deg > 7 ? deg - 12 : deg);

    // 1. Soft two-beat pizzicato upright bass (Beats 1 & 3)
    if (step === 0 || step === 8) {
      const note = bassRoot + (step === 8 ? 7 : 0);
      this.playInstrument('upright_bass', note, when, sixteenthSec * 5.8, 0.21, {
        pan: 0,
        lowpassHz: 680,
      });
    }

    // 2. Whisper-warm slow-Leslie Hammond B3 pad on bar downbeat
    if (step === 0) {
      this.playHammondChord(
        [chordBase + tones[0], chordBase + tones[1]],
        when,
        barDur * 0.90,
        0.028,
        { fastLeslie: false, keyClick: false },
      );
    }

    // 3. Signature *Think!* delicate Vibraphone + Felt Grand Piano quarter-note chime figure
    if (step === 0 || step === 4 || step === 8 || step === 12) {
      const beat = step / 4;
      const vibeMel = isMajor
        ? [12, 16, 12, 7][beat] // C -> E -> C -> G gentle *Think!* contour!
        : [12, 15, 12, 7][beat];
      const targetVibe = root + 12 + (barIdx % 2 === 1 && beat === 1 ? vibeMel - 2 : vibeMel);
      this.playInstrument(
        'vibraphone',
        targetVibe,
        when + humanizeOffset(barIdx, step, 1, 0.003),
        sixteenthSec * 3.8,
        beat === 0 ? 0.135 : 0.105,
        { pan: 0.24, lowpassHz: 3100 },
      );

      // Gentle Steinway piano chord whisper on 1 & 3
      if (beat === 0 || beat === 2) {
        this.playInstrument('grand_piano', chordBase + tones[0], when + 0.004, sixteenthSec * 5.0, 0.082, {
          pan: -0.26,
          lowpassHz: 1850,
        });
        this.playInstrument('grand_piano', chordBase + tones[2], when + 0.012, sixteenthSec * 5.0, 0.070, {
          pan: -0.20,
          lowpassHz: 1850,
        });
      }
    }

    // 4. Crisp, feather-light woodblock & wire-brush snare timekeeper
    if (step === 4 || step === 12) {
      this.playDrum('snare_brush', when, 0.078, { pan: -0.14, lowpassHz: 3400 });
      this.playDrum('hihat_pedal', when, 0.052, { pan: -0.22, lowpassHz: 4000 });
    }
    if (step === 0 || step === 8 || step === 14) {
      this.playInstrument(
        'woodblock',
        step === 0 ? 79 : 72,
        t,
        0.09,
        step === 14 ? 0.036 : 0.056,
        { pan: 0.18, lowpassHz: 2500 },
      );
    }
  }

  /**
   * 8-Bar 1966 Living Color Network Showband Orchestrator across all 12 scenes!
   * Every melodic, rhythmic, and harmonic voice is driven by real decoded studio
   * multi-samples + genuine 9-drawbar Hammond B3/Leslie.
   */
  private scheduleSceneSubstep(
    scene: ShowbandSceneIdV7,
    spec: ShowbandSceneSpecV7,
    bar: number,
    step: number,
    stepsPerBar: number,
    when: number,
    sixteenthSec: number,
  ): void {
    if (!this.musicSanctuaryFilter) return;

    const barIdx = bar % 8;

    // When reading a clue (except high-urgency Trapdoor Blitz), glide seamlessly into *Think!* bed
    if (this.clueSanctuaryActive && scene !== 'TRAPDOOR_BLITZ') {
      this.scheduleMervThinkBed(spec, barIdx, step, stepsPerBar, when, sixteenthSec);
      return;
    }

    const root = spec.rootMidi;
    const barDur = sixteenthSec * stepsPerBar;

    // Real 1960s studio jazz & TV showband 8-bar harmonic progressions
    // Major: F6 | Dm7 | Gm7 | C13 | Fmaj7 | D7 | Gm7 | C9 (transposed to scene root!)
    const majorRoots = [0, 9, 2, 7, 0, 9, 2, 7];
    const majorVoicings: ReadonlyArray<readonly [number, number, number]> = [
      [4, 7, 9],  // I6
      [3, 7, 10], // vi7
      [3, 7, 10], // ii7
      [4, 9, 10], // V13
      [4, 7, 11], // Imaj7
      [4, 7, 10], // VI7 (sunny secondary dominant!)
      [3, 7, 10], // ii7
      [4, 10, 14], // V9
    ];

    // Noir / Suspense: im9 | bVImaj7 | ivm7 | V7b9 | im7 | bIIImaj7 | iim7b5 | V7b9
    const noirRoots = [0, 8, 5, 7, 0, 3, 2, 7];
    const noirVoicings: ReadonlyArray<readonly [number, number, number]> = [
      [3, 7, 14],  // im9
      [4, 7, 11],  // bVImaj7
      [3, 7, 10],  // ivm7
      [4, 10, 13], // V7b9
      [3, 7, 10],  // im7
      [4, 7, 11],  // bIIImaj7
      [3, 6, 10],  // iim7b5
      [4, 10, 13], // V7b9
    ];

    const isMajor = spec.motifMode === 'MAJOR_6';
    const degShift = (isMajor ? majorRoots : noirRoots)[barIdx];
    const chordTones = (isMajor ? majorVoicings : noirVoicings)[barIdx];
    const bassRoot = root - 12 + (degShift > 6 ? degShift - 12 : degShift);
    const chordBase = root + (degShift > 7 ? degShift - 12 : degShift);

    // Authentic 59% jazz swing ratio on off-beat eighth notes (steps 2, 6, 10, 14)
    const swingOffset = step % 4 === 2 ? sixteenthSec * 0.34 : 0;
    const t = when + swingOffset;

    switch (scene) {
      case 'GREEN_ROOM': {
        // ====================================================================
        // TITLE SCREEN / LIVING COLOR HUB: Herb Alpert *Tijuana Brass* /
        // *The Dating Game* / *Take Ten* Joyful Upbeat Swing (118 BPM, F Maj)
        // ====================================================================

        // 1. Bouncy Real Upright Double Bass (2-beat / walking swing!)
        if (step === 0 || step === 4 || step === 8 || step === 12) {
          const walkIntervals = [0, chordTones[0], 7, barIdx === 7 ? 11 : 9];
          const bassNote = bassRoot + walkIntervals[step / 4];
          this.playInstrument(
            'upright_bass',
            bassNote,
            when + humanizeOffset(barIdx, step, 1, 0.003),
            sixteenthSec * 3.5,
            step === 0 ? 0.28 : 0.24,
            { pan: 0 },
          );
        }

        // 2. Real Boston Jazz Kit + Tambourine
        if (step === 0 || step === 8) {
          this.playDrum('kick', when, step === 0 ? 0.19 : 0.14, { pan: 0 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.145 : 0.098, {
            pan: 0.32,
            durationSec: 0.42,
          });
        }
        if (step === 4 || step === 12) {
          this.playDrum('hihat_pedal', when, 0.14, { pan: -0.24 });
          this.playDrum('snare_brush', when, 0.15, { pan: -0.12 });
          if (barIdx >= 4) {
            this.playDrum('tambourine', when + 0.004, 0.11, { pan: 0.36 });
          }
        }
        if (barIdx === 0 && step === 0) {
          this.playDrum('crash', when, 0.12, { pan: -0.32, durationSec: 1.1 });
        }

        // 3. Crisp Hollowbody Jazz Guitar *chunk* on 2 & 4 + Steinway Piano Comping
        if (step === 4 || step === 12) {
          this.playInstrument('jazz_guitar', chordBase + chordTones[0], when, sixteenthSec * 2.2, 0.13, {
            pan: -0.32,
          });
          this.playInstrument('jazz_guitar', chordBase + chordTones[2], when + 0.009, sixteenthSec * 2.2, 0.11, {
            pan: -0.26,
          });
        }
        if (step === 0 || step === 6) {
          for (let i = 0; i < 3; i++) {
            this.playInstrument(
              'grand_piano',
              chordBase + chordTones[i],
              t + i * 0.010,
              sixteenthSec * 4.0,
              step === 0 ? 0.125 : 0.095,
              { pan: -0.28 + i * 0.06 },
            );
          }
        }

        // 4. Warm 9-Drawbar Hammond B3 + Stereo Leslie 122 Pad
        if (step === 0) {
          this.playHammondChord(
            [chordBase + chordTones[0], chordBase + chordTones[1], chordBase + chordTones[2]],
            when,
            barDur * 0.86,
            0.038,
            { fastLeslie: barIdx >= 4, keyClick: barIdx % 2 === 0 },
          );
        }

        // 5. Catchy 8-Bar Herb Alpert *Tijuana Brass* Dual-Trumpet + Marimba Hook!
        // Consonant harmonies locked 1:1 to F6 | Dm7 | Gm7 | C13 | Fmaj7 | D7 | Gm7 | C9:
        const tijuanaLead: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
          // [leadOffset, harmonyOffset, durSixteenths] relative to F4 (65)
          { 0: [4, 0, 3.0], 4: [7, 4, 2.0], 6: [9, 4, 3.2], 10: [7, 4, 4.0] },  // Bar 0 (F6): A/F, C/A, D/A, C/A!
          { 0: [4, 0, 4.2], 6: [2, -3, 2.0], 8: [0, -3, 3.8] },                  // Bar 1 (Dm7): A/F, G/D, F/D!
          { 0: [5, 2, 3.0], 4: [9, 5, 2.0], 6: [7, 2, 3.2], 10: [5, 2, 4.0] },   // Bar 2 (Gm7): Bb/G, D/Bb, C/G, Bb/G!
          { 0: [7, 4, 4.2], 6: [5, 2, 2.0], 8: [4, -1, 3.6] },                   // Bar 3 (C13): C/A, Bb/G, A/E!
          { 0: [7, 4, 3.0], 4: [9, 4, 2.0], 6: [12, 7, 3.4], 10: [11, 7, 4.0] }, // Bar 4 (Fmaj7): C/A, D/A, F/C, E/C!
          { 0: [9, 4, 4.2], 6: [7, 1, 2.0], 8: [4, 1, 3.8] },                    // Bar 5 (D7): D/A, C/F#, A/F#!
          { 0: [5, 2, 3.0], 4: [9, 5, 2.0], 6: [7, 2, 3.2], 10: [5, 2, 3.8] },   // Bar 6 (Gm7): Bb/G, D/Bb, C/G, Bb/G!
          { 0: [4, -1, 3.4], 4: [2, -1, 2.8] },                                  // Bar 7 (C9): A/E, G/E -> Big Band Turnaround!
        ];

        const hit = tijuanaLead[barIdx][step];
        if (hit) {
          const [leadSemi, harmSemi, dur16] = hit;
          const noteDur = sixteenthSec * dur16;
          const leadMidi = root + 12 + leadSemi;
          const harmMidi = root + 12 + harmSemi;

          // Bright Tijuana Lead Trumpet + Harmony Trumpet in sweet 3rds/6ths!
          this.playInstrument('trumpet', leadMidi, t, noteDur, 0.21, { pan: 0.22 });
          this.playInstrument('trumpet', harmMidi, t + 0.008, noteDur * 0.94, 0.145, { pan: -0.18 });
          // Sunny wooden Marimba doubling the melody for authentic *Dating Game* bounce!
          this.playInstrument('marimba', leadMidi, t, noteDur * 0.88, 0.185, { pan: 0.34 });
        }

        // Punchy Big-Band Brass & Tenor Sax Answer Stabs on Bar 1, 3, 5 & iconic Bar 7 Turnaround!
        if ((barIdx === 1 || barIdx === 3 || barIdx === 5) && step === 12) {
          this.playInstrument('brass', chordBase + chordTones[0], when, sixteenthSec * 3.0, 0.19, { pan: -0.30 });
          this.playInstrument('brass', chordBase + chordTones[2], when, sixteenthSec * 3.0, 0.17, { pan: 0.30 });
          this.playInstrument('tenor_sax', chordBase + chordTones[1], when + 0.006, sixteenthSec * 3.2, 0.16, { pan: 0.12 });
          this.playDrum('snare_stick', when, 0.16, { pan: -0.10 });
        } else if (barIdx === 7 && (step === 8 || step === 12 || step === 14)) {
          // Iconic 1966 "BAP - BAP - BA-DAAA!" Turnaround
          const punchDur = step === 14 ? sixteenthSec * 3.8 : sixteenthSec * 1.9;
          const shift = step === 14 ? 2 : 0;
          this.playInstrument('brass', chordBase + chordTones[0] + shift, t, punchDur, 0.23, { pan: -0.32 });
          this.playInstrument('brass', chordBase + chordTones[2] + shift, t, punchDur, 0.21, { pan: 0.32 });
          this.playInstrument('trombone', chordBase - 5 + shift, t, punchDur, 0.19, { pan: -0.22 });
          this.playDrum('snare_stick', t, 0.20, { pan: -0.08 });
        }
        break;
      }

      case 'STAGE_01_IBC_DAYTIME_FUNK': {
        // ====================================================================
        // STUDIO 6A LIVING COLOR DAYTIME: *Jeopardy! '64 Take Ten* /
        // *Hollywood Squares* / *Match Game* Swing Showband (120 BPM, F Maj)
        // ====================================================================

        // 1. Four-to-the-bar Walking Acoustic Upright Double Bass
        if (step % 4 === 0) {
          const walkSeq = [0, chordTones[0], 7, barIdx % 2 === 0 ? 9 : chordTones[2] - 1];
          this.playInstrument(
            'upright_bass',
            bassRoot + walkSeq[step / 4],
            when + humanizeOffset(barIdx, step, 2, 0.003),
            sixteenthSec * 3.65,
            step === 0 ? 0.26 : 0.22,
            { pan: 0 },
          );
        }

        // 2. Swinging Real Jazz Drum Kit
        if (step === 0 || (step === 10 && barIdx % 2 === 1)) {
          this.playDrum('kick', t, step === 0 ? 0.18 : 0.12, { pan: 0 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.15 : 0.098, {
            pan: 0.30,
            durationSec: 0.44,
          });
        }
        if (step === 4 || step === 12) {
          this.playDrum('hihat_pedal', when, 0.14, { pan: -0.22 });
          this.playDrum('snare_brush', when, 0.15, { pan: -0.14 });
        }
        if (step === 14 && barIdx % 2 === 1) {
          this.playDrum('snare_rim', t, 0.10, { pan: -0.16 });
        }

        // 3. Steinway Grand Piano + Hollowbody Jazz Guitar Syncopated Comping
        if (step === 0 || step === 6 || (step === 12 && barIdx % 2 === 1)) {
          for (let i = 0; i < 3; i++) {
            this.playInstrument(
              'grand_piano',
              chordBase + chordTones[i],
              t + i * 0.011,
              sixteenthSec * 4.2,
              step === 0 ? 0.13 : 0.10,
              { pan: -0.30 + i * 0.08 },
            );
          }
        }
        if (step === 4 || step === 12) {
          this.playInstrument('jazz_guitar', chordBase + chordTones[0], when, sixteenthSec * 2.4, 0.12, {
            pan: -0.26,
          });
        }

        // 4. Creamy Hammond B3 + Stereo Leslie 122 Cushion
        if (step === 0) {
          this.playHammondChord(
            [chordBase + chordTones[0], chordBase + chordTones[1], chordBase + chordTones[2]],
            when,
            barDur * 0.88,
            0.038,
            { fastLeslie: barIdx === 3 || barIdx === 7, keyClick: true },
          );
        }

        // 5. Sparkling Vibraphone + Muted Trumpet / Tenor Sax *Take Ten* Theme
        const takeTenHook: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [7, 3.0], 6: [9, 3.0], 10: [12, 4.5] },
          { 0: [9, 3.5], 6: [7, 2.5], 10: [4, 4.0] },
          { 0: [5, 3.0], 6: [7, 3.0], 10: [9, 4.2] },
          { 0: [7, 3.5], 4: [5, 2.5], 8: [4, 3.5] },
          { 0: [7, 3.0], 6: [11, 3.0], 10: [14, 4.5] },
          { 0: [12, 3.5], 6: [9, 2.5], 10: [6, 4.0] },
          { 0: [5, 3.0], 4: [7, 2.5], 8: [9, 3.5], 12: [7, 3.0] },
          { 0: [4, 3.5], 6: [7, 3.0] },
        ];

        const mHit = takeTenHook[barIdx][step];
        if (mHit) {
          const [semi, dur16] = mHit;
          const melMidi = root + 12 + semi;
          this.playInstrument('vibraphone', melMidi, t, sixteenthSec * dur16 * 1.15, 0.21, {
            pan: 0.28,
          });
          if (barIdx < 4) {
            this.playInstrument('muted_trumpet', melMidi, t + 0.005, sixteenthSec * dur16, 0.16, {
              pan: 0.16,
            });
          } else {
            this.playInstrument('tenor_sax', melMidi - 12, t + 0.005, sixteenthSec * dur16, 0.19, {
              pan: -0.16,
            });
            this.playInstrument('trumpet', melMidi, t, sixteenthSec * dur16 * 0.9, 0.14, {
              pan: 0.20,
            });
          }
        }

        // Brass Section Swell Punctuation on Bars 3 & 7
        if ((barIdx === 3 || barIdx === 7) && (step === 10 || step === 14)) {
          this.playInstrument('brass', chordBase + chordTones[0], t, sixteenthSec * 2.8, 0.20, { pan: -0.32 });
          this.playInstrument('brass', chordBase + chordTones[2], t, sixteenthSec * 2.8, 0.18, { pan: 0.32 });
          if (barIdx === 7 && step === 14) {
            this.playDrum('snare_stick', t, 0.17, { pan: -0.10 });
          }
        }
        break;
      }

      case 'STAGE_02_IBC_PRIMETIME_JUBILEE': {
        // ====================================================================
        // 1966 CBS PRIMETIME JUBILEE GALA: Silky Stereo Strings, Big Brass & Piano
        // ====================================================================
        if (step === 0) {
          this.playDrum('kick', when, 0.17);
          if (barIdx === 0 || barIdx === 4) {
            this.playDrum('crash', when, 0.12, { pan: -0.30, durationSec: 1.15 });
          }
          // Silky high-passed studio strings float above the walking bass
          this.playInstrument('strings', chordBase + chordTones[0], when, barDur * 0.98, 0.11, {
            pan: -0.30,
            highpassHz: 220,
          });
          this.playInstrument('strings', chordBase + chordTones[2], when, barDur * 0.98, 0.10, {
            pan: 0.30,
            highpassHz: 220,
          });
          this.playHammondChord([chordBase + chordTones[0], chordBase + chordTones[1]], when, barDur * 0.85, 0.030);
        }
        if (step % 4 === 0) {
          const w = [0, chordTones[0], 7, barIdx === 7 ? 11 : 9][step / 4];
          this.playInstrument('upright_bass', bassRoot + w, when + humanizeOffset(barIdx, step, 3, 0.003), sixteenthSec * 3.6, step === 0 ? 0.25 : 0.21);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.13, { pan: -0.14 });
          this.playDrum('hihat_pedal', when, 0.12, { pan: -0.22 });
          this.playDrum('tambourine', when, 0.095, { pan: 0.34 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.135 : 0.088, { pan: 0.28, durationSec: 0.40 });
        }
        // Breezy Hollywood Grand Piano jazz comping + sparkling fills
        if (step === 0 || step === 6) {
          for (let i = 0; i < 3; i++) {
            this.playInstrument('grand_piano', chordBase + chordTones[i], t + i * 0.011, sixteenthSec * 4.2, step === 0 ? 0.12 : 0.095, {
              pan: -0.26 + i * 0.08,
            });
          }
        }
        // Glamorous 8-bar CBS Primetime Gala Brass + Trumpet + Glockenspiel theme (D Major!)
        const jubileeLead: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [4, 4.0], 6: [7, 3.2], 10: [12, 4.8] },    // Bar 0 (D6): F#-A-D!
          { 0: [9, 4.5], 8: [7, 3.8] },                   // Bar 1 (Bm7): B-A!
          { 0: [5, 3.8], 6: [9, 3.2], 10: [11, 4.5] },    // Bar 2 (Em7): G-B-C#!
          { 0: [7, 4.0], 8: [9, 3.0], 12: [11, 3.0] },    // Bar 3 (A13): A-B-C#!
          { 0: [12, 4.0], 6: [11, 3.2], 10: [9, 4.5] },   // Bar 4 (Dmaj7): D-C#-B!
          { 0: [7, 4.5], 8: [4, 3.8] },                   // Bar 5 (B7): A-F#!
          { 0: [5, 3.5], 6: [7, 3.0], 10: [9, 4.0] },     // Bar 6 (Em7): G-A-B!
          { 0: [7, 3.5], 8: [9, 2.8], 12: [12, 3.5] },    // Bar 7 (A9): Gala Turnaround!
        ];
        const jHit = jubileeLead[barIdx][step];
        if (jHit) {
          const [semi, dur16] = jHit;
          const leadMidi = root + 12 + semi;
          this.playInstrument('trumpet', leadMidi, t, sixteenthSec * dur16, 0.18, { pan: 0.22 });
          this.playInstrument('brass', leadMidi - 5, t + 0.006, sixteenthSec * dur16, 0.15, { pan: -0.24 });
          if (step === 0 || step === 10) {
            this.playInstrument('glockenspiel', Math.min(MIDI_C6, leadMidi + 12), t, sixteenthSec * 4.8, 0.095, { pan: 0.34 });
          }
          if (barIdx === 3 || barIdx === 7) {
            this.playInstrument('trombone', root + semi, t, sixteenthSec * dur16, 0.14, { pan: -0.28 });
          }
        }
        break;
      }

      case 'STAGE_03_1926_VAUDEVILLE_PIT': {
        // ====================================================================
        // 1966 BURBANK POP-ART GO-GO ORGAN & BRASS (*Laugh-In / Dating Game* Mod!)
        // ====================================================================
        // 1. Punchy Fast-Leslie Hammond B3 Go-Go Syncopated Riff!
        if (step === 0 || step === 6 || (step === 12 && barIdx % 2 === 1)) {
          this.playHammondChord(
            [chordBase + chordTones[0], chordBase + chordTones[1], chordBase + chordTones[2]],
            t,
            step === 0 ? sixteenthSec * 4.8 : sixteenthSec * 5.2,
            0.044,
            { soulful: true, fastLeslie: true, keyClick: true },
          );
        }
        // 2. Bouncy 1966 Go-Go Upright Bass + Funky Hollowbody Guitar Chops
        if (step === 0 || step === 4 || step === 8 || step === 12) {
          const gogoBass = [0, chordTones[0], 7, barIdx % 2 === 0 ? 9 : 5][step / 4];
          this.playInstrument('upright_bass', bassRoot + gogoBass, when + humanizeOffset(barIdx, step, 4, 0.003), sixteenthSec * 3.4, step === 0 ? 0.25 : 0.21);
        }
        if (step === 4 || step === 12) {
          this.playInstrument('jazz_guitar', chordBase + chordTones[0], when, sixteenthSec * 2.0, 0.125, { pan: -0.32 });
          this.playInstrument('jazz_guitar', chordBase + chordTones[2], when + 0.008, sixteenthSec * 2.0, 0.11, { pan: -0.24 });
        }
        // 3. Infectious 1966 Mod Go-Go Drum & Percussion Groove (Kick, Snare, Tambourine, Bongos!)
        if (step === 0 || step === 6 || step === 8) {
          this.playDrum('kick', t, step === 0 ? 0.19 : 0.13);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.16, { pan: -0.12 });
          this.playDrum('tambourine', when + 0.004, 0.13, { pan: 0.34 });
        }
        if (step % 2 === 0) {
          this.playDrum('hihat_closed', t, step % 4 === 0 ? 0.105 : 0.068, { pan: -0.24 });
        }
        if (step === 2 || step === 10 || step === 14) {
          this.playDrum(step === 10 ? 'bongo_hi' : 'bongo_lo', t, 0.125, { pan: 0.26 });
        }
        // 4. Playful 8-Bar Burbank Pop-Art Brass + Muted Trumpet + Wooden Marimba Hook!
        const burbankHook: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [4, 2.6], 4: [7, 2.0], 6: [9, 3.0], 10: [7, 3.2] },   // Bar 0 (C6): E-G-A-G!
          { 0: [4, 3.2], 6: [2, 2.0], 8: [0, 3.2] },                  // Bar 1 (Am7): E-D-C!
          { 0: [5, 2.6], 4: [9, 2.0], 6: [7, 3.0], 10: [5, 3.2] },   // Bar 2 (Dm7): F-A-G-F!
          { 0: [4, 3.0], 6: [7, 2.5], 10: [11, 3.0] },                // Bar 3 (G13): E-G-B!
          { 0: [12, 2.8], 4: [11, 2.0], 6: [9, 3.0], 10: [7, 3.2] }, // Bar 4 (Cmaj7): C-B-A-G!
          { 0: [9, 3.2], 6: [7, 2.0], 8: [4, 3.2] },                  // Bar 5 (A7): A-G-E!
          { 0: [5, 2.6], 4: [7, 2.0], 6: [9, 3.0], 10: [7, 3.0] },   // Bar 6 (Dm7): F-G-A-G!
          { 0: [4, 3.0], 6: [2, 2.4] },                               // Bar 7 (G9) -> Brass Go-Go Punch!
        ];
        const bHit = burbankHook[barIdx][step];
        if (bHit) {
          const [semi, dur16] = bHit;
          const melMidi = root + 12 + semi;
          this.playInstrument(barIdx < 4 ? 'muted_trumpet' : 'trumpet', melMidi, t, sixteenthSec * dur16, 0.175, { pan: 0.22 });
          this.playInstrument('marimba', melMidi, t, sixteenthSec * dur16 * 0.9, 0.17, { pan: 0.34 });
        }
        if ((barIdx === 3 || barIdx === 7) && (step === 10 || step === 14)) {
          this.playInstrument('brass', chordBase + chordTones[0], t, sixteenthSec * 2.5, 0.18, { pan: -0.26 });
          this.playInstrument('brass', chordBase + chordTones[2], t, sixteenthSec * 2.5, 0.16, { pan: 0.26 });
          this.playInstrument('trombone', chordBase - 5, t, sixteenthSec * 2.8, 0.16, { pan: -0.22 });
        }
        break;
      }

      case 'STAGE_04_1958_ISOLATION_VAULT': {
        // ====================================================================
        // 1964 "$64,000" ISOLATION BOOTH SUSPENSE NOIR (Sealed Vault, ZERO Crowd!)
        // ====================================================================
        if (step === 0) {
          this.playInstrument('timpani', bassRoot + 12, when, sixteenthSec * 5.2, 0.17, { pan: -0.18, lowpassHz: 480 });
          this.playInstrument('strings', chordBase, when, barDur * 1.0, 0.115, { pan: -0.32, highpassHz: 240, lowpassHz: 2200 });
          this.playInstrument('strings', chordBase + chordTones[0], when, barDur * 1.0, 0.10, { pan: 0.32, highpassHz: 240, lowpassHz: 2200 });
        }
        if (step === 0 || step === 8) {
          this.playInstrument('upright_bass', bassRoot + (step === 8 ? 7 : 0), when, sixteenthSec * 5.6, 0.23, { lowpassHz: 680 });
          this.playInstrument('woodblock', step === 0 ? 79 : 72, when, 0.08, 0.068, { pan: 0.20, lowpassHz: 2400 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_brush', when, 0.095, { pan: -0.16, lowpassHz: 3200 });
          this.playDrum('ride', when, 0.065, { pan: 0.26, durationSec: 0.34, lowpassHz: 4200 });
          const v = step === 4 ? chordTones[2] : chordTones[1];
          this.playInstrument('vibraphone', chordBase + v + 12, when, sixteenthSec * 5.6, 0.135, { pan: 0.26 });
        }
        // Expressive Mancini / Hitchcock 2-note noir muted trumpet & tenor sax sighs
        if (barIdx % 2 === 0 && (step === 6 || step === 10)) {
          const noirSemi = step === 6 ? chordTones[0] + 12 : chordTones[1] + 12;
          this.playInstrument('muted_trumpet', chordBase + noirSemi, t, sixteenthSec * 4.8, 0.145, {
            pan: 0.18,
            lowpassHz: 2650,
          });
        } else if (barIdx % 2 === 1 && (step === 4 || step === 10)) {
          const saxSemi = step === 4 ? chordTones[2] : chordTones[0];
          this.playInstrument('tenor_sax', chordBase + saxSemi, t, sixteenthSec * 5.2, 0.155, {
            pan: -0.20,
            lowpassHz: 2800,
          });
        }
        break;
      }

      case 'STAGE_05_1984_LARSON_CRT_LAB': {
        // ====================================================================
        // 1967 APOLLO COLOR CONTROL PAVILION (Hammond B3, Sax, Vibes, Rim Kit)
        // ====================================================================
        if (step === 0) {
          this.playDrum('kick', when, 0.18);
          this.playHammondChord(
            [chordBase + chordTones[0], chordBase + chordTones[1], chordBase + chordTones[2]],
            when,
            barDur * 0.90,
            0.044,
            { soulful: true, fastLeslie: barIdx % 4 === 3, keyClick: true },
          );
        }
        if (step === 0 || step === 6 || step === 8 || step === 12) {
          this.playInstrument('upright_bass', bassRoot + (step === 12 ? 7 : 0), t, sixteenthSec * 3.4, 0.25);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_rim', when, 0.15, { pan: -0.14 });
        }
        if (step % 2 === 0) {
          this.playDrum('hihat_closed', t, step % 4 === 0 ? 0.10 : 0.068, { pan: 0.22 });
        }
        if (step === 2 || step === 10) {
          const n = chordTones[step === 2 ? 1 : 2] + 12;
          this.playInstrument('vibraphone', chordBase + n, t, sixteenthSec * 4.8, 0.14, { pan: 0.28 });
          this.playInstrument('grand_piano', chordBase + chordTones[0], t, sixteenthSec * 3.8, 0.11, { pan: -0.26 });
        }
        if (barIdx % 2 === 1 && (step === 0 || step === 6)) {
          this.playInstrument('tenor_sax', chordBase + (step === 0 ? 10 : 7), t, sixteenthSec * 4.6, 0.165, {
            pan: -0.16,
          });
        }
        break;
      }

      case 'STAGE_06_ATLANTIC_CITY_PIER': {
        // ====================================================================
        // 1964 STEEL PIER BIG BAND: Boardwalk Brass, Dual Trumpets, Bongos & Swing!
        // ====================================================================
        if (step === 0 || step === 4 || step === 8 || step === 12) {
          const pierWalk = [0, chordTones[0], 7, barIdx === 7 ? 11 : 9][step / 4];
          this.playInstrument('upright_bass', bassRoot + pierWalk, when + humanizeOffset(barIdx, step, 6, 0.003), sixteenthSec * 3.5, step === 0 ? 0.25 : 0.21);
        }
        if (step === 0 || step === 8) {
          this.playDrum('kick', when, step === 0 ? 0.18 : 0.13);
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.13 : 0.088, { pan: 0.30, durationSec: 0.42 });
        }
        // Breezy Steel Pier Bongos, Shaker & Snappy Backbeat
        if (step === 0 || step === 6 || step === 10) {
          this.playDrum('bongo_hi', t, 0.13, { pan: 0.28 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('bongo_lo', t, 0.115, { pan: 0.22 });
          this.playDrum('snare_rim', when, 0.135, { pan: -0.12 });
          this.playInstrument('jazz_guitar', chordBase + chordTones[0], when, sixteenthSec * 2.2, 0.125, { pan: -0.32 });
          this.playInstrument('jazz_guitar', chordBase + chordTones[1], when + 0.008, sixteenthSec * 2.2, 0.11, { pan: -0.25 });
        }
        if (step % 2 === 0) {
          this.playDrum('shaker', t, step % 4 === 0 ? 0.085 : 0.058, { pan: -0.28 });
        }
        if (step === 0) {
          this.playHammondChord([chordBase + chordTones[0], chordBase + chordTones[2]], when, barDur * 0.84, 0.032);
        }
        // Full 8-bar consonant Steel Pier Big Band Brass + Dual Trumpets + Marimba (G Major!)
        // Locked 1:1 to G6 | Em7 | Am7 | D13 | Gmaj7 | E7 | Am7 | D9:
        const pierBigBand: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
          { 0: [4, 0, 3.0], 4: [7, 4, 2.2], 6: [9, 4, 3.2], 10: [7, 4, 3.8] },  // Bar 0 (G6): B/G, D/B, E/B, D/B!
          { 0: [4, 0, 3.8], 6: [2, -3, 2.2], 8: [0, -3, 3.6] },                  // Bar 1 (Em7): B/G, A/E, G/E!
          { 0: [5, 2, 3.0], 4: [9, 5, 2.2], 6: [7, 2, 3.2], 10: [5, 2, 3.8] },   // Bar 2 (Am7): C/A, E/C, D/A, C/A!
          { 0: [7, 4, 3.8], 6: [5, 2, 2.2], 8: [4, -1, 3.4] },                   // Bar 3 (D13): D/B, C/A, B/F#!
          { 0: [7, 4, 3.0], 4: [9, 4, 2.2], 6: [12, 7, 3.4], 10: [11, 7, 3.8] }, // Bar 4 (Gmaj7): D/B, E/B, G/D, F#/D!
          { 0: [9, 4, 3.8], 6: [7, 1, 2.2], 8: [4, 1, 3.6] },                    // Bar 5 (E7): E/B, D/G#, B/G#!
          { 0: [5, 2, 3.0], 4: [9, 5, 2.2], 6: [7, 2, 3.2], 10: [5, 2, 3.6] },   // Bar 6 (Am7): C/A, E/C, D/A, C/A!
          { 0: [4, -1, 3.2], 4: [2, -1, 2.8] },                                  // Bar 7 (D9) -> Big Band Swell!
        ];
        const pHit = pierBigBand[barIdx][step];
        if (pHit) {
          const [leadSemi, harmSemi, dur16] = pHit;
          const lead = root + 12 + leadSemi;
          const harm = root + 12 + harmSemi;
          this.playInstrument('trumpet', lead, t, sixteenthSec * dur16, 0.17, { pan: 0.22 });
          this.playInstrument('trumpet', harm, t + 0.007, sixteenthSec * dur16 * 0.94, 0.12, { pan: -0.18 });
          this.playInstrument('marimba', lead, t, sixteenthSec * dur16 * 0.86, 0.155, { pan: 0.34 });
        }
        // Big-band Brass + Tenor Sax + Trombone Boardwalk Swells on Bars 3 & 7
        if ((barIdx === 3 || barIdx === 7) && (step === 10 || step === 14)) {
          this.playInstrument('brass', chordBase + chordTones[0], t, sixteenthSec * 2.8, 0.17, { pan: -0.28 });
          this.playInstrument('tenor_sax', chordBase + chordTones[2], t, sixteenthSec * 3.0, 0.16, { pan: 0.24 });
          this.playInstrument('trombone', chordBase - 5, t, sixteenthSec * 2.8, 0.15, { pan: -0.22 });
        }
        break;
      }

      case 'STAGE_07_1969_MONTE_CARLO_CASINO': {
        // ====================================================================
        // 1969 MONTE CARLO 5/4 SPY LOUNGE (Lalo Schifrin w/ Live 5/4 -> 4/4 Chop!)
        // ====================================================================
        const spyBass: Record<number, number> = { 0: 0, 6: 0, 12: 5, 16: 3 };
        if (step in spyBass && step < stepsPerBar) {
          this.playInstrument('upright_bass', bassRoot + spyBass[step], when, sixteenthSec * 3.4, step === 0 ? 0.26 : 0.22);
          this.playDrum('kick', when, step === 0 ? 0.17 : 0.12);
        }
        if (step === 0) {
          this.playInstrument('strings', chordBase + chordTones[0], when, barDur * 0.92, 0.105, { pan: -0.34, highpassHz: 230 });
          this.playInstrument('strings', chordBase + chordTones[2], when, barDur * 0.92, 0.095, { pan: 0.34, highpassHz: 230 });
        }
        // Sleek Casino Royale Grand Piano & Hollowbody Guitar Lounge Comping on Beats 1 & 4
        if (step === 0 || (step === 12 && step < stepsPerBar)) {
          this.playInstrument('grand_piano', chordBase + chordTones[0], when, sixteenthSec * 4.2, 0.115, { pan: -0.28 });
          this.playInstrument('grand_piano', chordBase + chordTones[2], when + 0.010, sixteenthSec * 4.2, 0.10, { pan: -0.20 });
          this.playInstrument('jazz_guitar', chordBase + chordTones[1], when + 0.006, sixteenthSec * 3.4, 0.105, { pan: -0.34 });
        }
        // Signature spy bongos & shaker on 5/4 pulse
        if (step === 0 || step === 6 || step === 12 || (step === 16 && step < stepsPerBar)) {
          this.playDrum(step === 12 ? 'bongo_hi' : 'bongo_lo', when, 0.135, { pan: 0.26 });
        }
        if (step % 2 === 0 && step < stepsPerBar) {
          this.playDrum('shaker', when, step % 4 === 0 ? 0.08 : 0.052, { pan: -0.26 });
        }
        if (step % 4 === 0 && step < stepsPerBar) {
          this.playDrum('ride', when, 0.105, { pan: 0.30, durationSec: 0.34 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_rim', when, 0.115, { pan: -0.14 });
        }
        // Suave 1969 Riviera Spy Melody: Muted Trumpet + Vibraphone + Smoky Tenor Sax answer!
        if (barIdx % 2 === 0 && (step === 0 || step === 6 || step === 12)) {
          const spyMel = step === 0 ? 15 : step === 6 ? 14 : 12;
          this.playInstrument('muted_trumpet', chordBase + spyMel, when, sixteenthSec * 3.8, 0.165, { pan: 0.22 });
          this.playInstrument('vibraphone', chordBase + spyMel, when, sixteenthSec * 4.4, 0.14, { pan: -0.22 });
        } else if (barIdx % 2 === 1 && (step === 6 || step === 12)) {
          const loungeAns = step === 6 ? chordTones[2] : chordTones[0];
          this.playInstrument('tenor_sax', chordBase + loungeAns, when, sixteenthSec * 4.5, 0.155, { pan: 0.18 });
          this.playInstrument('vibraphone', chordBase + loungeAns + 12, when, sixteenthSec * 4.4, 0.12, { pan: -0.24 });
        }
        if (barIdx % 4 === 3 && (step === 0 || step === 12)) {
          this.playInstrument('brass', chordBase + chordTones[0], when, sixteenthSec * 3.0, 0.16, { pan: -0.28 });
        }
        break;
      }

      case 'STAGE_08_WORLDS_FAIR_GEODESIC': {
        // ====================================================================
        // 1965 WORLD'S FAIR SPACE-AGE EXOTICA (Esquivel / Stereo Vibes & Strings)
        // ====================================================================
        if (step === 0) {
          this.playDrum('kick', when, 0.16);
          this.playInstrument('strings', chordBase + chordTones[0], when, barDur * 0.98, 0.11, { pan: -0.38, highpassHz: 220 });
          this.playInstrument('strings', chordBase + chordTones[2], when, barDur * 0.98, 0.10, { pan: 0.38, highpassHz: 220 });
          this.playHammondChord([chordBase + chordTones[0], chordBase + chordTones[1]], when, barDur * 0.88, 0.036, {
            fastLeslie: true,
          });
        }
        if (step === 0 || step === 8) {
          this.playInstrument('upright_bass', bassRoot + (step === 8 ? 7 : 0), when, sixteenthSec * 6.0, 0.25);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_brush', when, 0.12, { pan: -0.14 });
          this.playDrum('bongo_hi', when + 0.008, 0.12, { pan: 0.34 });
        }
        if (step === 2 || step === 6 || step === 10 || step === 14) {
          // Ping-pong stereo Marimba & Vibraphone exotica cascade!
          const tone = chordTones[(step / 4) % 3] + 12;
          const isLeft = step === 2 || step === 10;
          this.playInstrument(isLeft ? 'marimba' : 'vibraphone', chordBase + tone, t, sixteenthSec * 4.2, 0.155, {
            pan: isLeft ? -0.38 : 0.38,
          });
        }
        if (barIdx % 2 === 0 && (step === 0 || step === 8)) {
          this.playInstrument('glockenspiel', chordBase + 24 + (step === 8 ? 7 : 4), when, sixteenthSec * 5.2, 0.12, {
            pan: 0.30,
          });
        }
        if (barIdx === 3 && step === 12) {
          this.playInstrument('brass', chordBase + chordTones[2], when, sixteenthSec * 3.4, 0.17, { pan: 0 });
        }
        break;
      }

      case 'STAGE_09_CHANNEL_83_UHF_BARGE': {
        // ====================================================================
        // 1967 PIRATE CHANNEL 83 BEAT: Soul-Jazz Hammond B3, Sax & Guitar Groove!
        // ====================================================================
        if (step === 0 || step === 6) {
          this.playHammondChord(
            [chordBase + chordTones[0], chordBase + chordTones[1], chordBase + chordTones[2]],
            t,
            step === 0 ? sixteenthSec * 4.8 : sixteenthSec * 6.8,
            0.044,
            { soulful: true, fastLeslie: true, keyClick: true },
          );
        }
        if (step === 0 || step === 6 || step === 8 || step === 14) {
          const walk = step === 6 ? 3 : step === 14 ? 7 : 0;
          this.playInstrument('upright_bass', bassRoot + walk, t, sixteenthSec * 3.3, step === 0 ? 0.25 : 0.21);
        }
        if (step === 0 || step === 10) {
          this.playDrum('kick', t, step === 0 ? 0.18 : 0.13);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.16, { pan: -0.14 });
          this.playDrum('hihat_pedal', when, 0.13, { pan: -0.24 });
          if (barIdx >= 4) {
            this.playDrum('tambourine', when + 0.005, 0.105, { pan: 0.34 });
          }
          this.playInstrument('jazz_guitar', chordBase + chordTones[0], when, sixteenthSec * 2.4, 0.135, {
            pan: -0.30,
          });
          this.playInstrument('jazz_guitar', chordBase + chordTones[2], when + 0.008, sixteenthSec * 2.4, 0.115, {
            pan: -0.22,
          });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.125 : 0.082, { pan: 0.30, durationSec: 0.38 });
        }
        // Offshore Soul-Beat Tenor Sax + Hollowbody Guitar Call-and-Response!
        if (barIdx % 2 === 0 && (step === 0 || step === 6 || step === 10)) {
          const blues = step === 0 ? 3 : step === 6 ? 5 : 7;
          this.playInstrument('tenor_sax', chordBase + blues + 12, t, sixteenthSec * 3.8, 0.17, {
            pan: 0.22,
          });
        } else if (barIdx % 2 === 1 && (step === 2 || step === 8 || step === 12)) {
          const gtrRiff = step === 2 ? 7 : step === 8 ? 5 : 3;
          this.playInstrument('jazz_guitar', chordBase + gtrRiff + 12, t, sixteenthSec * 3.2, 0.15, {
            pan: -0.24,
          });
        }
        break;
      }

      case 'STAGE_10_SOVEREIGN_SANCTUM': {
        // ====================================================================
        // GRAND FINALE SHOWDOWN: Timpani, Full Brass, Stereo Strings & Piano
        // ====================================================================
        if (step === 0) {
          this.playInstrument('timpani', bassRoot + 12, when, sixteenthSec * 4.8, 0.21);
          this.playDrum('kick', when, 0.18);
          this.playInstrument('strings', chordBase + chordTones[0], when, barDur * 0.98, 0.12, { pan: -0.34, highpassHz: 220 });
          this.playInstrument('strings', chordBase + chordTones[2], when, barDur * 0.98, 0.11, { pan: 0.34, highpassHz: 220 });
          this.playInstrument('brass', chordBase + chordTones[0], when, barDur * 0.68, 0.16, { pan: -0.26 });
          this.playInstrument('trombone', chordBase - 5, when, barDur * 0.68, 0.15, { pan: 0.26 });
          if (barIdx === 0 || barIdx === 4) {
            this.playInstrument('tubular_bell', root + 24, when, barDur * 0.90, 0.12, { pan: 0.32 });
            this.playDrum('crash', when, 0.12, { pan: -0.28, durationSec: 1.20 });
          }
        }
        if (step === 0 || step === 8) {
          this.playInstrument('upright_bass', bassRoot + (step === 8 ? 7 : 0), when, sixteenthSec * 6.8, 0.26);
        }
        if (step % 4 === 0) {
          const pNotes = [0, chordTones[0], chordTones[1], chordTones[2] + 12];
          this.playInstrument('grand_piano', chordBase + pNotes[step / 4], when, sixteenthSec * 4.4, 0.14, {
            pan: -0.18,
          });
          this.playInstrument('woodblock', step % 8 === 0 ? 79 : 72, when, 0.08, 0.072, { pan: 0.22 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.15, { pan: -0.12 });
        }
        break;
      }

      case 'TRAPDOOR_BLITZ': {
        // ====================================================================
        // 148 BPM LIGHTNING ROUND CHASE: Driving Bass, Timpani, Sharp Brass!
        // ====================================================================
        if (step === 0 || step === 8) {
          this.playDrum('kick', when, 0.21);
          this.playInstrument('timpani', bassRoot + 12 + (step === 8 ? 7 : 0), when, sixteenthSec * 3.2, 0.17);
        }
        if (step === 0) {
          this.playHammondChord([chordBase + chordTones[0], chordBase + chordTones[2]], when, barDur * 0.82, 0.048, {
            soulful: true,
            fastLeslie: true,
            keyClick: true,
          });
          this.playInstrument('brass', chordBase + chordTones[0], when, sixteenthSec * 3.8, 0.18, { pan: -0.30 });
          this.playInstrument('brass', chordBase + chordTones[2], when, sixteenthSec * 3.8, 0.16, { pan: 0.30 });
        }
        if (step % 2 === 0) {
          const ost = step === 6 || step === 14 ? 7 : step === 10 ? 3 : 0;
          this.playInstrument('upright_bass', bassRoot + ost, when, sixteenthSec * 2.0, 0.25);
          this.playDrum('hihat_closed', when, step % 4 === 0 ? 0.115 : 0.075, { pan: 0.24 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.18, { pan: -0.12 });
          this.playDrum('cowbell', when, 0.105, { pan: 0.32 });
        }
        if ((barIdx % 2 === 1) && (step === 6 || step === 12 || step === 14)) {
          this.playInstrument('trumpet', root + 12 + (step === 14 ? 10 : 7), when, sixteenthSec * 2.2, 0.18, {
            pan: 0.20,
          });
          this.playInstrument('tenor_sax', root + 12 + 3, when, sixteenthSec * 2.2, 0.15, { pan: -0.20 });
        }
        break;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. Physical Studio Board Foley, TV Twist Fanfares & Real Crowd Cues
  // --------------------------------------------------------------------------

  private nowWallMs(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  /**
   * Classic 1966 NBC Control Booth Fader Duck: smoothly dips the live band
   * bed whenever a major fanfare, prize wheel, bell, or buzzer hits so there
   * is ZERO harmonic clutter or limiter pumping!
   */
  private duckMusicForStinger(
    duckGain = 0.34,
    holdSec = 1.2,
    recoverSec = 0.55,
  ): void {
    const ctx = this.ctx;
    const node = this.musicStingerDuckGain;
    if (!ctx || !node) return;
    const now = ctx.currentTime;
    try {
      node.gain.cancelScheduledValues(now);
      node.gain.setTargetAtTime(clamp(duckGain, 0.12, 1.0), now, 0.025);
      node.gain.setTargetAtTime(1.0, now + Math.max(0.15, holdSec), Math.max(0.08, recoverSec * 0.38));
    } catch {
      // ignore
    }
  }

  /**
   * 1966 NBC/CBS "IN LIVING COLOR — LIVE FROM STUDIO 6A!" Opening Showband Fanfare!
   * Real timpani roll -> dual Tijuana trumpets & brass section flourish -> crash +
   * shimmering bell tree + Hammond B3 Leslie chord + roaring walk-on studio applause!
   */
  public playTitleShowtimeFanfare(): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.24, 1.85, 0.75);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // 1. Exciting opening timpani pick-up & snare rim snap
    this.playInstrument('timpani', 48, now, 0.35, 0.28, { dest: sfx, pan: -0.15, priority: 3 });
    this.playInstrument('timpani', 53, now + 0.11, 0.45, 0.32, { dest: sfx, pan: 0.15, priority: 3 });
    this.playDrum('snare_stick', now + 0.16, 0.24, { dest: sfx, pan: -0.10, priority: 3 });

    // 2. Iconic ascending 1966 TV Living Color Brass + Dual Trumpets in 3rds!
    // F Major fanfare: C4 -> F4 -> A4 -> C5 -> D5 -> F5!!
    const fanfareBeats = [
      { dt: 0.18, lead: 72, harm: 69, brass: 60, dur: 0.19 }, // C5 / A4
      { dt: 0.33, lead: 74, harm: 70, brass: 62, dur: 0.19 }, // D5 / Bb4
      { dt: 0.48, lead: 76, harm: 72, brass: 64, dur: 0.20 }, // E5 / C5
      { dt: 0.65, lead: 77, harm: 72, brass: 65, dur: 1.05 }, // F5!! (Grand Living Color Hold!)
    ];

    for (const b of fanfareBeats) {
      const at = now + b.dt;
      this.playInstrument('trumpet', b.lead, at, b.dur, 0.28, { dest: sfx, pan: 0.22, priority: 3 });
      this.playInstrument('trumpet', b.harm, at + 0.008, b.dur * 0.96, 0.20, { dest: sfx, pan: -0.22, priority: 3 });
      this.playInstrument('brass', b.brass, at, b.dur, 0.26, { dest: sfx, pan: 0, priority: 3 });
      this.playInstrument('trombone', b.brass - 12, at, b.dur, 0.22, { dest: sfx, pan: -0.26, priority: 3 });
    }

    // 3. Downbeat Finale Explosion (t + 0.65s): Crash + Grand Piano + Glockenspiel + Bell Tree + Hammond B3!
    const climax = now + 0.65;
    this.playDrum('crash', climax, 0.24, { dest: sfx, pan: -0.30, durationSec: 1.5, priority: 3 });
    this.playInstrument('timpani', 53, climax, 0.9, 0.32, { dest: sfx, priority: 3 });
    this.playFoley('sleigh_sparkle', climax + 0.02, 0.24, { dest: sfx, pan: 0.32, priority: 3 });

    const sparkleNotes = [65, 69, 72, 74, 77, 81];
    for (let i = 0; i < sparkleNotes.length; i++) {
      this.playInstrument('grand_piano', sparkleNotes[i], climax + i * 0.038, 0.7, 0.17, {
        dest: sfx,
        pan: -0.28 + i * 0.1,
        priority: 2,
      });
      this.playInstrument('glockenspiel', Math.min(MIDI_C6, sparkleNotes[i] + 12), climax + 0.06 + i * 0.045, 0.65, 0.14, {
        dest: sfx,
        pan: 0.26,
        priority: 2,
      });
    }

    this.playHammondChord([65, 69, 72, 74], climax, 1.35, 0.085, {
      soulful: true,
      fastLeslie: true,
      keyClick: true,
    });

    // 4. Roaring Live Studio 6A Audience Walk-On Applause & Cheers!
    this.playCrowd('applause_big', now + 0.42, 0.34, { durationSec: 2.6, attackSec: 0.15 });
    this.playCrowd('cheer_hurray', now + 0.68, 0.24, { durationSec: 2.1, attackSec: 0.12 });
  }

  /**
   * Iconic 1960s *Daily Double / Secret Square* Discovery Fanfare!
   * Warbling rapid real Vibraphone + Glockenspiel arpeggio + Bell Tree sparkle +
   * brass chord punch + excited studio crowd reaction!
   */
  public playSecretSquareFanfare(): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.32, 1.25, 0.55);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // Iconic warbling *Daily Double* ascending sparkle sweep!
    const sweepMidi = [65, 69, 72, 74, 77, 81, 84, 81, 84];
    for (let i = 0; i < sweepMidi.length; i++) {
      const at = now + i * 0.052;
      this.playInstrument('vibraphone', sweepMidi[i], at, 0.48, 0.26, {
        dest: sfx,
        pan: -0.28 + (i / sweepMidi.length) * 0.56,
        priority: 3,
      });
      this.playInstrument('glockenspiel', Math.min(MIDI_C6, sweepMidi[i]), at + 0.012, 0.42, 0.18, {
        dest: sfx,
        pan: 0.24,
        priority: 3,
      });
    }

    // Bell tree glitter + warm vintage bell ping + punchy brass chord
    this.playFoley('sleigh_sparkle', now + 0.08, 0.28, { dest: sfx, pan: 0.30, priority: 3 });
    this.playFoley('typewriter_bell', now + 0.42, 0.24, { dest: sfx, playbackRate: 1.08, priority: 3 });

    const chordAt = now + 0.44;
    this.playInstrument('brass', 65, chordAt, 0.65, 0.26, { dest: sfx, pan: -0.24, priority: 3 });
    this.playInstrument('brass', 69, chordAt, 0.65, 0.24, { dest: sfx, pan: 0.24, priority: 3 });
    this.playInstrument('trumpet', 77, chordAt, 0.68, 0.24, { dest: sfx, pan: 0.15, priority: 3 });

    // Studio audience excited cheer & warm applause!
    this.playCrowd('cheer_hurray', now + 0.22, 0.28, { durationSec: 2.0, attackSec: 0.08 });
    this.playCrowd('applause_warm', now + 0.35, 0.24, { durationSec: 2.2, attackSec: 0.12 });
  }

  /**
   * Authentic 1960s *Let's Make a Deal / Prize Wheel* Mystery Curtain Spin!
   * 13 real wooden/mechanical peg-flapper clicks decelerating smoothly over ~1.1s,
   * landing in a celebratory reveal fanfare (or comical trombone Zonk + studio laugh!).
   */
  public playMysteryCurtainSpin(
    outcome: 'BONUS' | 'DOUBLE' | 'SWAP' | 'ZONK' = 'BONUS',
  ): void {
    this.haptics.peel(2);
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.28, 1.85, 0.65);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // 13 decelerating wheel peg clicks (36ms -> 150ms spacing)
    let cursor = 0;
    const pegCount = 13;
    for (let i = 0; i < pegCount; i++) {
      const progress = i / (pegCount - 1);
      const stepMs = 36 + Math.pow(progress, 2.2) * 116;
      const at = now + cursor;
      const rate = 1.18 - progress * 0.28;
      this.playFoley('flap_click', at, 0.22, {
        dest: sfx,
        playbackRate: rate,
        durationSec: 0.055,
        pan: (i % 2 === 0 ? -1 : 1) * 0.12,
        priority: 3,
      });
      this.playInstrument('woodblock', i % 2 === 0 ? 79 : 74, at, 0.06, 0.14, {
        dest: sfx,
        pan: 0.08,
        priority: 2,
      });
      cursor += stepMs / 1000;
    }

    const revealAt = now + cursor + 0.05;

    if (outcome === 'ZONK') {
      // Comical 1960s *Let's Make a Deal* Zonk descending real trombone wah-wah-waaaah!
      const zonk = [
        { dt: 0.0, midi: 58, bend: 57, dur: 0.28 },
        { dt: 0.28, midi: 57, bend: 56, dur: 0.28 },
        { dt: 0.56, midi: 56, bend: 53, dur: 0.65 },
      ];
      for (const z of zonk) {
        this.playInstrument('trombone', z.midi, revealAt + z.dt, z.dur, 0.30, {
          dest: sfx,
          bendToMidi: z.bend,
          priority: 3,
        });
      }
      this.playCrowd('studio_laugh', revealAt + 0.18, 0.32, { durationSec: 2.2 });
    } else {
      // Exciting Mystery Curtain Prize Reveal!
      this.playFoley('cash_register_bell', revealAt, 0.28, { dest: sfx, priority: 3 });
      this.playInstrument('brass', 65, revealAt, 0.55, 0.26, { dest: sfx, pan: -0.24, priority: 3 });
      this.playInstrument('trumpet', 72, revealAt + 0.03, 0.55, 0.26, { dest: sfx, pan: 0.24, priority: 3 });
      this.playInstrument('trumpet', 77, revealAt + 0.08, 0.62, 0.28, { dest: sfx, pan: 0.12, priority: 3 });
      this.playFoley('sleigh_sparkle', revealAt + 0.04, 0.24, { dest: sfx, priority: 2 });
      this.playCrowd('applause_warm', revealAt + 0.08, 0.30, { durationSec: 2.0 });
    }
  }

  /**
   * Locked Vault Unlock:
   * Heavy safe tumbler clicks -> heavy steel bolt drop -> spring latch ping ->
   * triumphant brass + cash-register bell + warm studio applause!
   */
  public playVaultUnlock(): void {
    this.haptics.lockThunk();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.30, 1.20, 0.50);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // 3 heavy mechanical safe dial tumbler clicks
    const tumblers = [
      { dt: 0.0, rate: 0.72 },
      { dt: 0.095, rate: 0.84 },
      { dt: 0.19, rate: 0.96 },
    ];
    for (const tb of tumblers) {
      this.playFoley('mechanical_clack', now + tb.dt, 0.28, {
        dest: sfx,
        playbackRate: tb.rate,
        durationSec: 0.09,
        lowpassHz: 2400,
        priority: 3,
      });
    }

    // Heavy vault bolt release thud + bright latch bell
    const latchAt = now + 0.28;
    this.playInstrument('timpani', 48, latchAt, 0.32, 0.32, { dest: sfx, lowpassHz: 600, priority: 3 });
    this.playFoley('cash_register_bell', latchAt + 0.03, 0.30, { dest: sfx, priority: 3 });

    // Celebratory Vault Open Brass & Vibraphone Flourish
    const fanfare = [65, 69, 72, 77];
    for (let i = 0; i < fanfare.length; i++) {
      this.playInstrument('vibraphone', fanfare[i], latchAt + 0.05 + i * 0.045, 0.65, 0.24, {
        dest: sfx,
        pan: -0.2 + i * 0.14,
        priority: 3,
      });
    }
    this.playInstrument('brass', 65, latchAt + 0.12, 0.60, 0.25, { dest: sfx, pan: -0.22, priority: 3 });
    this.playInstrument('trumpet', 77, latchAt + 0.16, 0.62, 0.24, { dest: sfx, pan: 0.22, priority: 3 });
    this.playCrowd('applause_warm', latchAt + 0.18, 0.28, { durationSec: 1.9 });
  }

  /**
   * Iconic 1960s *Sale of the Century* Instant Bargain Bell (*DING-DING-DING!*):
   * Authentic double-strike vintage cash-register / prize shopkeeper bell + lively trumpet chime!
   */
  public playInstantBargainBell(): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.32, 0.95, 0.45);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // Double-strike authentic vintage brass cash register & carriage bells!
    this.playFoley('cash_register_bell', now, 0.34, { dest: sfx, playbackRate: 1.0, priority: 3 });
    this.playFoley('typewriter_bell', now + 0.17, 0.30, { dest: sfx, playbackRate: 1.12, priority: 3 });
    this.playFoley('typewriter_bell', now + 0.34, 0.32, { dest: sfx, playbackRate: 1.26, priority: 3 });

    // Sparkling glockenspiel + jaunty 2-note trumpet bargain sting
    this.playInstrument('glockenspiel', 79, now + 0.04, 0.45, 0.18, { dest: sfx, pan: 0.24, priority: 3 });
    this.playInstrument('glockenspiel', 84, now + 0.22, 0.55, 0.20, { dest: sfx, pan: -0.24, priority: 3 });
    this.playInstrument('trumpet', 74, now + 0.20, 0.16, 0.20, { dest: sfx, pan: 0.16, priority: 3 });
    this.playInstrument('trumpet', 79, now + 0.34, 0.42, 0.24, { dest: sfx, pan: 0.16, priority: 3 });
    this.playCrowd('cheer_hurray', now + 0.28, 0.22, { durationSec: 1.6 });
  }

  /** Crisp Bakelite/relay board tile hover detent click (`-18.5 dBFS`). */
  public playTileHover(): void {
    const wall = this.nowWallMs();
    if (wall - this.lastHoverMs < 24) return;
    this.lastHoverMs = wall;

    this.haptics.spinTick();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const rate = 1.32 + ((Math.round(wall) % 7) * 0.015);
    const played = this.playFoley('flap_click', ctx.currentTime, GAIN_TILE_HOVER_LINEAR, {
      playbackRate: rate,
      durationSec: 0.026,
      lowpassHz: 3100,
      priority: 2,
    });
    if (!played && this.fallbackClickBuffer) {
      this.triggerBuffer({
        buffer: this.fallbackClickBuffer,
        dest: this.sfxBus,
        when: ctx.currentTime,
        gain: GAIN_TILE_HOVER_LINEAR,
        playbackRate: 1.0,
        priority: 2,
      });
    }
  }

  /** Motorized 3-sided Trilon tile flip + solenoid latch + warm vibraphone confirmation. */
  public playTileSelect(): void {
    this.haptics.lockThunk();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // 1. Motorized Trilon flip clack-whirr-CLACK!
    this.playFoley('mechanical_clack', now, GAIN_TILE_SELECT_LINEAR, {
      dest: sfx,
      playbackRate: 1.12,
      durationSec: 0.085,
      priority: 3,
    });
    this.playFoley('brush_sweep', now + 0.025, 0.12, {
      dest: sfx,
      playbackRate: 1.45,
      durationSec: 0.09,
      lowpassHz: 2400,
      priority: 2,
    });
    this.playFoley('flap_click', now + 0.082, GAIN_TILE_SELECT_LINEAR * 0.95, {
      dest: sfx,
      playbackRate: 0.88,
      durationSec: 0.065,
      priority: 3,
    });

    // 2. Warm studio vibraphone selection confirmation note
    const rootMidi = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;
    this.playInstrument('vibraphone', rootMidi + 7, now + 0.035, 0.34, 0.22, {
      dest: sfx,
      pan: 0.12,
      priority: 3,
    });
  }

  /** Heavy copper knife-switch blade throw + porcelain base thud. */
  public playKnifeSwitch(): void {
    this.haptics.sightlineSnap();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    this.playFoley('mechanical_clack', now, 0.30, { dest: sfx, playbackRate: 0.82, durationSec: 0.11, priority: 3 });
    this.playDrum('snare_rim', now + 0.018, 0.22, { dest: sfx, playbackRate: 0.92, priority: 3 });
    this.playInstrument('timpani', 48, now + 0.022, 0.16, 0.24, { dest: sfx, lowpassHz: 480, priority: 3 });
  }

  /** Pneumatic studio tube air rush + brass spike slam (`isSpike = true`). */
  public playPneumaticWhoosh(isSpike = false): void {
    this.haptics.peel(isSpike ? 3 : 1);
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    this.playFoley('brush_sweep', now, isSpike ? 0.30 : 0.22, {
      dest: sfx,
      playbackRate: isSpike ? 1.18 : 0.86,
      durationSec: isSpike ? 0.26 : 0.22,
      highpassHz: 260,
      lowpassHz: isSpike ? 3400 : 2100,
      priority: 3,
    });
    if (isSpike) {
      this.playInstrument('brass', 58, now + 0.06, 0.24, 0.26, { dest: sfx, priority: 3 });
      this.playInstrument('timpani', 48, now + 0.065, 0.22, 0.24, { dest: sfx, priority: 3 });
    }
  }

  /** Precision vernier brass gear detent click. */
  public playDialDetent(): void {
    const wall = this.nowWallMs();
    if (wall - this.lastDetentMs < 18) return;
    this.lastDetentMs = wall;

    this.haptics.spinTick();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const jitter = 0.96 + ((Math.round(wall) % 9) * 0.009);
    const played = this.playFoley('flap_click', ctx.currentTime, 0.18, {
      playbackRate: 1.42 * jitter,
      durationSec: 0.032,
      lowpassHz: 3200,
      priority: 2,
    });
    if (!played) {
      this.playInstrument('woodblock', 79, ctx.currentTime, 0.04, 0.14, { dest: this.sfxBus, priority: 2 });
    }
  }

  /** Hardened steel cutter jaw bite + damped copper wire twang. */
  public playWireSnip(): void {
    this.haptics.shatterPlate();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    this.playDrum('hihat_closed', now, 0.26, { dest: sfx, playbackRate: 1.18, durationSec: 0.045, priority: 3 });
    this.playFoley('flap_click', now + 0.008, 0.24, { dest: sfx, playbackRate: 1.5, durationSec: 0.04, priority: 3 });
    this.playInstrument('jazz_guitar', 67, now + 0.018, 0.14, 0.22, {
      dest: sfx,
      bendToMidi: 63,
      priority: 3,
    });
  }

  /** Brittle vermilion wax-seal crack + scattering crystalline micro-shards. */
  public playWaxSealShatter(): void {
    this.haptics.shatterPlate();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    this.playDrum('snare_rim', now, 0.26, { dest: sfx, playbackRate: 1.22, priority: 3 });
    const delays = [0.012, 0.034, 0.058, 0.082];
    const pitches = [79, 83, 81, 84];
    for (let i = 0; i < delays.length; i++) {
      this.playFoley('flap_click', now + delays[i], 0.18 - i * 0.025, {
        dest: sfx,
        playbackRate: 1.35 + i * 0.14,
        durationSec: 0.035,
        priority: 2,
      });
      this.playInstrument('glockenspiel', pitches[i], now + delays[i], 0.12, 0.14 - i * 0.02, {
        dest: sfx,
        pan: (i % 2 === 0 ? -1 : 1) * 0.25,
        priority: 2,
      });
    }
  }

  /** Heavy desk rubber-stamp emboss for Contestant Waiver & Fact-Checker `[VOID]`. */
  public playRubberStamp(): void {
    this.haptics.passportStamp();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    this.playDrum('kick', now, 0.30, { dest: sfx, playbackRate: 1.25, lowpassHz: 420, priority: 3 });
    this.playFoley('mechanical_clack', now + 0.01, 0.24, { dest: sfx, playbackRate: 0.78, durationSec: 0.08, priority: 3 });
    this.playDrum('snare_brush', now + 0.015, 0.16, { dest: sfx, durationSec: 0.07, priority: 2 });
  }

  /** Authentic Solari split-flap leaf flutter clack! */
  public playSplitFlapTick(): void {
    this.haptics.uiTap();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const rate = 1.06 + ((Math.round(now * 1000) % 5) * 0.03);
    const played = this.playFoley('flap_click', now, 0.20, {
      playbackRate: rate,
      durationSec: 0.042,
      priority: 2,
    });
    if (!played) {
      this.playInstrument('woodblock', 74, now, 0.04, 0.14, { dest: this.sfxBus, priority: 2 });
    }
  }

  /**
   * Final 5-Second Broadcast Studio Clock:
   * Crisp alternating real rosewood woodblock (`F5 -> C5`) + subtle upright bass
   * heartbeat pulse on `3.. 2.. 1..` + bright bell accent on final tick!
   */
  public playCountdownTick(secondsLeft: number): void {
    const sec = Math.max(0, Math.round(secondsLeft));
    if (sec > 5) return;

    if (sec <= 1) {
      this.haptics.peel(2);
    } else {
      this.haptics.spinTick();
    }

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const urgency = clamp((6 - sec) / 5, 0.25, 1.0);
    const isEven = sec % 2 === 0;

    // Alternating crisp real woodblock tick-tock (F5 = 77 / C5 = 72)
    this.playInstrument('woodblock', isEven ? 77 : 72, now, 0.11, 0.24 + 0.10 * urgency, {
      dest: sfx,
      pan: isEven ? -0.10 : 0.10,
      priority: 3,
    });

    // Subtle heartbeat acoustic bass / timpani thump on final 3 seconds
    if (sec <= 3) {
      this.playInstrument('upright_bass', 41, now, 0.22, 0.24 + 0.08 * urgency, {
        dest: sfx,
        lowpassHz: 420,
        priority: 3,
      });
    }

    // Final warning bell ping on 1 & 0
    if (sec <= 1) {
      this.playInstrument('tubular_bell', sec === 0 ? 72 : 77, now, 0.34, 0.22, {
        dest: sfx,
        priority: 3,
      });
    }
  }

  /**
   * Post-Answer Broadcast Theater Payoff:
   * - `isKlaxon`: Iconic *QI* Myth-Trap dual-reed foghorn + discordant trombone + crowd laugh!
   * - `isCorrect === true`: Authentic Solenoid Tone-Bar Bell (`DING!`) + upbeat 3-chord
   *   real brass/trumpet/vibraphone fanfare sting + warm live studio audience applause
   *   (OR dry horological bronze bell chord with ZERO crowd in sealed vaults!).
   * - `isCorrect === false`: Authentic 1960s Edwards AC Magnetic Studio Buzzer (`BRZZZT!`)
   *   + muted trombone gentle descend + brief sympathetic studio murmur (non-sealed).
   */
  public playAnswerReveal(isCorrect: boolean, isKlaxon = false): void {
    if (isKlaxon) {
      this.haptics.backfireFracture();
    } else if (isCorrect) {
      this.haptics.correctBloom();
    } else {
      this.haptics.wrongThud(false);
    }

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus || !this.crowdBus) return;

    this.duckMusicForStinger(isCorrect ? 0.36 : 0.26, isCorrect ? 1.05 : 0.78, 0.48);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const isSealed = this.isSealedVaultScene();
    const rootMidi = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    if (isKlaxon) {
      this.playKlaxonMythHorn(now, 0.72);
      this.playInstrument('trombone', 50, now + 0.02, 0.65, 0.28, {
        dest: sfx,
        bendToMidi: 45,
        priority: 3,
      });
      this.playCrowd('studio_laugh', now + 0.14, 0.30, { durationSec: 2.0 });
      return;
    }

    if (isCorrect) {
      if (isSealed) {
        // Sealed Vault: Pure horological bronze bell & vibraphone chord (ZERO studio crowd!)
        const vaultChord = [0, 4, 7, 11, 14];
        for (let i = 0; i < vaultChord.length; i++) {
          this.playInstrument(i % 2 === 0 ? 'glockenspiel' : 'vibraphone', Math.min(MIDI_C6, rootMidi + vaultChord[i]), now + i * 0.045, 0.68, 0.22 - i * 0.02, {
            dest: sfx,
            pan: -0.24 + i * 0.12,
            priority: 3,
          });
        }
        this.playFoley('typewriter_bell', now, 0.24, { dest: sfx, priority: 3 });
      } else {
        // Live 1966 TV Studio: Authentic Solenoid Bell DING! + Upbeat Brass/Vibes Sting + Real Applause!
        this.playFoley('typewriter_bell', now, 0.32, { dest: sfx, playbackRate: 1.04, priority: 3 });
        this.playInstrument('glockenspiel', Math.min(MIDI_C6, rootMidi + 12), now, 0.55, 0.20, {
          dest: sfx,
          pan: 0.20,
          priority: 3,
        });

        // Upbeat 3-beat major-6/9 showband victory sting!
        const sting = [
          { dt: 0.04, lead: 7, harm: 4, dur: 0.18 },
          { dt: 0.15, lead: 9, harm: 7, dur: 0.18 },
          { dt: 0.26, lead: 12, harm: 9, dur: 0.62 },
        ];
        for (const s of sting) {
          this.playInstrument('trumpet', rootMidi + s.lead, now + s.dt, s.dur, 0.24, {
            dest: sfx,
            pan: 0.22,
            priority: 3,
          });
          this.playInstrument('brass', rootMidi + s.harm, now + s.dt, s.dur, 0.22, {
            dest: sfx,
            pan: -0.22,
            priority: 3,
          });
          this.playInstrument('vibraphone', rootMidi + s.lead, now + s.dt, s.dur * 1.2, 0.19, {
            dest: sfx,
            pan: 0.28,
            priority: 2,
          });
        }

        // Warm live studio audience applause!
        this.playCrowd('applause_warm', now + 0.08, 0.34, { durationSec: 2.1, attackSec: 0.07 });
      }
    } else {
      // Authentic 1960s Edwards AC Magnetic Studio Wrong Buzzer (`BRZZZT!`) + muted trombone sigh
      this.playEdwardsAcWrongBuzzer(now, 0.44);
      this.playInstrument('trombone', rootMidi - 5, now + 0.10, 0.22, 0.20, { dest: sfx, pan: -0.18, priority: 3 });
      this.playInstrument('trombone', rootMidi - 8, now + 0.24, 0.36, 0.22, { dest: sfx, pan: -0.18, priority: 3 });

      if (!isSealed) {
        // Gentle, brief sympathetic studio audience reaction (low-passed warm crowd murmur)
        this.playCrowd('studio_laugh', now + 0.16, 0.13, {
          durationSec: 0.85,
          playbackRate: 0.84,
          lowpassHz: 1150,
        });
      }
    }
  }

  /**
   * Authentic 1960s Edwards AC Magnetic Studio Game-Show Wrong Buzzer (`BRZZZT!`):
   * Real physical 60Hz/120Hz electro-mechanical vibrating armature reed through
   * warm asymmetric saturation & Bakelite resonator cabinet (320Hz..1,450Hz) —
   * unmistakable raspy 1966 TV studio buzzer, NEVER an 8-bit square beep!
   */
  private playEdwardsAcWrongBuzzer(when: number, durationSec: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus || !this.allocateVoiceSlot(3)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const endAt = startAt + durationSec;

    // Physical 60Hz AC solenoid drives an iron armature at 120Hz + 180Hz harmonic reed rasp!
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscB.type = 'sawtooth';
    oscSub.type = 'sawtooth';
    oscA.frequency.setValueAtTime(118.5, startAt);
    oscB.frequency.setValueAtTime(124.2, startAt); // Beating armature reed rasp!
    oscSub.frequency.setValueAtTime(180.0, startAt); // Authentic 3rd-harmonic AC coil buzz!

    // 32Hz mechanical clapper AM flutter
    const rattleOsc = ctx.createOscillator();
    rattleOsc.type = 'sine';
    rattleOsc.frequency.setValueAtTime(32, startAt);
    const rattleDepth = ctx.createGain();
    rattleDepth.gain.setValueAtTime(0.09, startAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = createWarmTubeSaturationCurve(3.6, 512);

    // Bakelite & brass horn housing resonance (warm low-mid focus, zero piercing highs!)
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(105, startAt);

    const cabinetBp = ctx.createBiquadFilter();
    cabinetBp.type = 'peaking';
    cabinetBp.frequency.setValueAtTime(560, startAt);
    cabinetBp.Q.setValueAtTime(1.35, startAt);
    cabinetBp.gain.setValueAtTime(6.0, startAt);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1650, startAt);
    lp.Q.setValueAtTime(1.1, startAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(0.33, startAt + 0.012);
    env.gain.setValueAtTime(0.30, Math.max(startAt + 0.04, endAt - 0.05));
    env.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscA.connect(shaper);
    oscB.connect(shaper);
    oscSub.connect(shaper);
    shaper.connect(hp);
    hp.connect(cabinetBp);
    cabinetBp.connect(lp);
    lp.connect(env);

    rattleOsc.connect(rattleDepth);
    rattleDepth.connect(env.gain);
    env.connect(this.sfxBus);

    oscA.start(startAt);
    oscB.start(startAt);
    oscSub.start(startAt);
    rattleOsc.start(startAt);

    oscA.stop(endAt + 0.01);
    oscB.stop(endAt + 0.01);
    oscSub.stop(endAt + 0.01);
    rattleOsc.stop(endAt + 0.01);

    this.activeVoices.push({
      priority: 3,
      startTime: startAt,
      endTime: endAt,
      gainNode: env,
      stopNode: oscA,
      stopped: false,
    });
  }

  private playKlaxonMythHorn(when: number, durationSec: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus || !this.allocateVoiceSlot(3)) return;

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscB.type = 'sawtooth';

    oscA.frequency.setValueAtTime(466.16, when);
    oscA.frequency.exponentialRampToValueAtTime(349.23, when + 0.14);
    oscA.frequency.setValueAtTime(415.30, when + 0.28);
    oscA.frequency.exponentialRampToValueAtTime(311.13, when + durationSec);

    oscB.frequency.setValueAtTime(392.00, when);
    oscB.frequency.exponentialRampToValueAtTime(293.66, when + 0.14);
    oscB.frequency.setValueAtTime(349.23, when + 0.28);
    oscB.frequency.exponentialRampToValueAtTime(261.63, when + durationSec);

    const hornLp = ctx.createBiquadFilter();
    hornLp.type = 'lowpass';
    hornLp.frequency.setValueAtTime(2050, when);
    hornLp.Q.setValueAtTime(1.5, when);

    const shaper = ctx.createWaveShaper();
    if (this.warmTubeCurve) shaper.curve = this.warmTubeCurve;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, when);
    env.gain.linearRampToValueAtTime(0.26, when + 0.025);
    env.gain.setValueAtTime(0.24, when + durationSec - 0.08);
    env.gain.linearRampToValueAtTime(0.0001, when + durationSec);

    oscA.connect(hornLp);
    oscB.connect(hornLp);
    hornLp.connect(shaper);
    shaper.connect(env);
    env.connect(this.sfxBus);

    oscA.start(when);
    oscB.start(when);
    oscA.stop(when + durationSec + 0.01);
    oscB.stop(when + durationSec + 0.01);

    this.activeVoices.push({
      priority: 3,
      startTime: when,
      endTime: when + durationSec,
      gainNode: env,
      stopNode: oscA,
      stopped: false,
    });
  }

  /**
   * Shepard-folded `<= C6` (`1046.50 Hz`) real glockenspiel + vibraphone bell cascade
   * paired with Solari split-flap ticks as `$Cash` rolls onto the scoreboard!
   */
  public playScoreCascadeTick(stepIndex: number): void {
    const idx = Math.max(0, Math.floor(stepIndex));
    this.haptics.spinTick();

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const scaleOffsets = [0, 2, 4, 6, 7, 9, 11];
    const semiInOctave = scaleOffsets[idx % scaleOffsets.length];
    const upperMidi = Math.min(MIDI_C6, MIDI_C5 + semiInOctave);
    const lowerMidi = upperMidi - 12;

    const phase01 = semiInOctave / 12;
    const upperWeight = Math.cos(phase01 * Math.PI * 0.5);
    const lowerWeight = Math.sin(phase01 * Math.PI * 0.5);

    this.playInstrument('glockenspiel', upperMidi, now, 0.20, 0.18 * Math.max(0.32, upperWeight), {
      dest: sfx,
      pan: 0.14,
      priority: 2,
    });
    this.playInstrument('vibraphone', lowerMidi, now, 0.22, 0.18 * Math.max(0.32, lowerWeight), {
      dest: sfx,
      pan: -0.14,
      priority: 1,
    });
    this.playFoley('flap_click', now, 0.12, {
      dest: sfx,
      playbackRate: 1.1 + (idx % 4) * 0.05,
      durationSec: 0.03,
      priority: 1,
    });
  }

  /**
   * Continuous Censor Mic / Overclock Hold:
   * `110Hz -> 520Hz` `< 2.1kHz` warm broadcast transformer overload — ZERO piercing sine whistle!
   */
  public setCensorMicHold(active: boolean, charge01 = 0): void {
    const c = clamp(charge01, 0, 1);
    this.censorCharge01 = c;

    if (!active) {
      this.censorHoldActive = false;
      if (this.censorHold && this.ctx) {
        const nodes = this.censorHold;
        this.censorHold = null;
        const now = this.ctx.currentTime;
        try {
          nodes.envGain.gain.cancelScheduledValues(now);
          nodes.envGain.gain.setTargetAtTime(0.0001, now, 0.012);
          nodes.oscSub.stop(now + 0.05);
          nodes.oscCore.stop(now + 0.05);
          nodes.flutterOsc.stop(now + 0.05);
        } catch {
          // Safe teardown
        }
      }
      return;
    }

    this.censorHoldActive = true;
    this.haptics.overclockPulse(c);

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;
    const now = ctx.currentTime;
    const targetHz = 110 + (520 - 110) * c;

    if (!this.censorHold) {
      const oscSub = ctx.createOscillator();
      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(targetHz * 0.5, now);

      const oscCore = ctx.createOscillator();
      oscCore.type = 'sawtooth';
      oscCore.frequency.setValueAtTime(targetHz, now);

      const flutterOsc = ctx.createOscillator();
      flutterOsc.type = 'sine';
      flutterOsc.frequency.setValueAtTime(24, now);
      const flutterGain = ctx.createGain();
      flutterGain.gain.setValueAtTime(0.02 + 0.08 * c, now);

      const shaper = ctx.createWaveShaper();
      if (this.warmTubeCurve) shaper.curve = this.warmTubeCurve;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1150 + 800 * c, now);
      lowpass.Q.setValueAtTime(1.1, now);

      const envGain = ctx.createGain();
      envGain.gain.setValueAtTime(0.001, now);
      envGain.gain.setTargetAtTime(0.14 + 0.11 * c, now, 0.025);

      oscSub.connect(shaper);
      oscCore.connect(shaper);
      shaper.connect(lowpass);
      lowpass.connect(envGain);
      flutterOsc.connect(flutterGain);
      flutterGain.connect(envGain.gain);
      envGain.connect(this.sfxBus);

      oscSub.start(now);
      oscCore.start(now);
      flutterOsc.start(now);

      this.censorHold = {
        oscSub,
        oscCore,
        flutterOsc,
        flutterGain,
        lowpass,
        shaper,
        envGain,
      };
    } else {
      this.censorHold.oscSub.frequency.setTargetAtTime(targetHz * 0.5, now, 0.022);
      this.censorHold.oscCore.frequency.setTargetAtTime(targetHz, now, 0.022);
      this.censorHold.flutterGain.gain.setTargetAtTime(0.02 + 0.08 * c, now, 0.025);
      this.censorHold.lowpass.frequency.setTargetAtTime(1150 + 800 * c, now, 0.025);
      this.censorHold.envGain.gain.setTargetAtTime(0.14 + 0.11 * c, now, 0.025);
    }
  }

  public isCensorMicHoldActive(): boolean {
    return this.censorHoldActive;
  }

  public getCensorMicCharge(): number {
    return this.censorCharge01;
  }

  // --------------------------------------------------------------------------
  // 8. 3 Mono-Phone-Audible (300Hz-3kHz) Cheat Tells & Booth Arrest Siren
  // --------------------------------------------------------------------------

  public playCheatTell(channel: CheatTellChannelV7): void {
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    switch (channel) {
      case 'ROW_C_GLINT': {
        this.haptics.uiTap();
        this.playInstrument('glockenspiel', 76, now, 0.14, 0.22, { dest: sfx, priority: 3 });
        this.playInstrument('glockenspiel', 83, now + 0.072, 0.18, 0.24, { dest: sfx, priority: 3 });
        break;
      }

      case 'SOLENOID_SPARK': {
        this.haptics.spinTick();
        for (let i = 0; i < 3; i++) {
          const t = now + i * 0.0416;
          this.playFoley('flap_click', t, 0.24, {
            dest: sfx,
            playbackRate: 1.35 + i * 0.12,
            durationSec: 0.032,
            priority: 3,
          });
          this.playBandPocketTone({
            freqHz: 640 + i * 210,
            when: t,
            durationSec: 0.028,
            gain: 0.16,
            wave: 'sawtooth',
          });
        }
        break;
      }

      case 'FRESNEL_LAMP': {
        this.haptics.sightlineSnap();
        this.playFoley('mechanical_clack', now, 0.22, { dest: sfx, playbackRate: 1.05, durationSec: 0.04, priority: 3 });
        this.playBandPocketTone({
          freqHz: 440,
          when: now + 0.015,
          durationSec: 0.24,
          gain: 0.16,
          wave: 'triangle',
        });
        this.playBandPocketTone({
          freqHz: 660,
          when: now + 0.025,
          durationSec: 0.22,
          gain: 0.13,
          wave: 'sine',
        });
        break;
      }
    }
  }

  private playBandPocketTone(opts: {
    freqHz: number;
    when: number;
    durationSec: number;
    gain: number;
    wave: OscillatorType;
  }): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus || !this.allocateVoiceSlot(3)) return;

    const osc = ctx.createOscillator();
    osc.type = opts.wave;
    osc.frequency.setValueAtTime(clamp(opts.freqHz, 320, 2750), opts.when);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(300, opts.when);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2850, opts.when);

    const env = ctx.createGain();
    const endAt = opts.when + opts.durationSec;
    env.gain.setValueAtTime(0.001, opts.when);
    env.gain.linearRampToValueAtTime(opts.gain, opts.when + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, endAt);

    osc.connect(hp);
    hp.connect(lp);
    lp.connect(env);
    env.connect(this.sfxBus);

    osc.start(opts.when);
    osc.stop(endAt + 0.006);

    this.activeVoices.push({
      priority: 3,
      startTime: opts.when,
      endTime: endAt,
      gainNode: env,
      stopNode: osc,
      stopped: false,
    });
  }

  /** Standards & Practices / Vera Karp Booth Arrest Siren + Rapid Mechanical Studio Bell! */
  public playBoothArrestSiren(): void {
    this.haptics.backfireFracture();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    if (this.allocateVoiceSlot(3)) {
      const dur = 0.88;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      for (let c = 0; c < 4; c++) {
        const t0 = now + c * 0.21;
        osc.frequency.setValueAtTime(440.0, t0);
        osc.frequency.exponentialRampToValueAtTime(587.33, t0 + 0.10);
        osc.frequency.exponentialRampToValueAtTime(440.0, t0 + 0.205);
      }

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2350, now);
      lp.Q.setValueAtTime(1.5, now);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.001, now);
      env.gain.linearRampToValueAtTime(0.24, now + 0.02);
      env.gain.setValueAtTime(0.22, now + dur - 0.08);
      env.gain.linearRampToValueAtTime(0.0001, now + dur);

      osc.connect(lp);
      lp.connect(env);
      env.connect(sfx);

      osc.start(now);
      osc.stop(now + dur + 0.01);

      this.activeVoices.push({
        priority: 3,
        startTime: now,
        endTime: now + dur,
        gainNode: env,
        stopNode: osc,
        stopped: false,
      });
    }

    for (let b = 0; b < 5; b++) {
      this.playFoley('typewriter_bell', now + b * 0.15, 0.22, {
        dest: sfx,
        playbackRate: 1.24,
        durationSec: 0.14,
        priority: 2,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 9. Match Loop Ceremony, Rival Turn, Trophies & Clean Teardown
  // --------------------------------------------------------------------------

  /** Distinct tactile audio beat when the Rival visibly claims a board tile. */
  public playRivalTileClaim(): void {
    this.haptics.uiTap();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    this.playFoley('mechanical_clack', now, 0.24, { dest: sfx, playbackRate: 0.88, durationSec: 0.08, priority: 2 });
    this.playInstrument('muted_trumpet', 62, now + 0.03, 0.14, 0.20, { dest: sfx, pan: 0.18, priority: 2 });
    this.playInstrument('trombone', 55, now + 0.12, 0.18, 0.18, { dest: sfx, pan: -0.18, priority: 2 });
  }

  public playRivalClaim(): void {
    this.playRivalTileClaim();
  }

  /** Crisp UI Bakelite studio button micro-tap. */
  public playUiTap(): void {
    this.haptics.uiTap();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const played = this.playFoley('flap_click', ctx.currentTime, 0.15, {
      playbackRate: 1.28,
      durationSec: 0.028,
      lowpassHz: 3200,
      priority: 2,
    });
    if (!played && this.fallbackClickBuffer) {
      this.triggerBuffer({
        buffer: this.fallbackClickBuffer,
        dest: this.sfxBus,
        when: ctx.currentTime,
        gain: 0.14,
        playbackRate: 1.15,
        priority: 2,
      });
    }
  }

  /** Living Color Prize Turntable Trophy Unlock Fanfare! */
  public playTrophyUnlockChime(): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const notes = [65, 69, 72, 77, 81, 84];
    for (let i = 0; i < notes.length; i++) {
      this.playInstrument(i < 2 ? 'vibraphone' : 'glockenspiel', notes[i], now + i * 0.055, 0.65, 0.22, {
        dest: sfx,
        pan: -0.25 + i * 0.1,
        priority: 3,
      });
    }
    this.playFoley('sleigh_sparkle', now + 0.08, 0.24, { dest: sfx, priority: 3 });
    this.playInstrument('brass', 65, now + 0.24, 0.65, 0.24, { dest: sfx, pan: -0.22, priority: 3 });
    this.playInstrument('trumpet', 77, now + 0.28, 0.65, 0.22, { dest: sfx, pan: 0.22, priority: 3 });
    this.playCrowd('applause_warm', now + 0.22, 0.26, { durationSec: 1.8 });
  }

  /** Episode Win / Loss Ceremony Fanfare proclaiming the 1966 Broadcast Winner! */
  public playEpisodeCeremonyFanfare(didWin: boolean): void {
    if (didWin) {
      this.haptics.goldResonance();
    } else {
      this.haptics.wrongThud(false);
    }

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.22, didWin ? 2.2 : 1.5, 0.75);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    if (didWin) {
      // Grand Living Color Winner's Broadcast Fanfare + Standing Ovation Roar!
      this.playInstrument('timpani', 48, now, 0.35, 0.28, { dest: sfx, priority: 3 });
      const winNotes = [
        { dt: 0.0, semi: 0, dur: 0.14 },
        { dt: 0.12, semi: 4, dur: 0.14 },
        { dt: 0.24, semi: 7, dur: 0.14 },
        { dt: 0.36, semi: 9, dur: 0.16 },
        { dt: 0.50, semi: 12, dur: 1.15 },
      ];
      for (const n of winNotes) {
        const at = now + n.dt;
        this.playInstrument('trumpet', root + n.semi, at, n.dur, 0.28, { dest: sfx, pan: 0.20, priority: 3 });
        this.playInstrument('brass', root + n.semi - 5, at, n.dur, 0.24, { dest: sfx, pan: -0.22, priority: 3 });
        this.playInstrument('trombone', root + n.semi - 12, at, n.dur, 0.20, { dest: sfx, pan: -0.28, priority: 3 });
      }
      const climax = now + 0.50;
      this.playDrum('crash', climax, 0.24, { dest: sfx, pan: -0.28, durationSec: 1.45, priority: 3 });
      this.playFoley('sleigh_sparkle', climax + 0.02, 0.26, { dest: sfx, priority: 3 });
      this.playFoley('cash_register_bell', climax + 0.05, 0.24, { dest: sfx, priority: 3 });
      this.playHammondChord([root, root + 4, root + 7, root + 9], climax, 1.4, 0.08, {
        soulful: true,
        fastLeslie: true,
        keyClick: true,
      });

      this.playCrowd('applause_big', now + 0.32, 0.38, { durationSec: 3.0, attackSec: 0.14 });
      this.playCrowd('cheer_hurray', now + 0.54, 0.30, { durationSec: 2.5, attackSec: 0.12 });
    } else {
      // Classy 1966 game-show "Tough Break" sign-off cadence
      const loseNotes = [
        { dt: 0.0, semi: 7, dur: 0.26 },
        { dt: 0.24, semi: 5, dur: 0.26 },
        { dt: 0.48, semi: 3, dur: 0.28 },
        { dt: 0.74, semi: 0, dur: 0.80 },
      ];
      for (const n of loseNotes) {
        const at = now + n.dt;
        this.playInstrument('muted_trumpet', root + n.semi, at, n.dur, 0.22, { dest: sfx, pan: 0.18, priority: 3 });
        this.playInstrument('trombone', root + n.semi - 12, at, n.dur, 0.22, { dest: sfx, pan: -0.20, priority: 3 });
        this.playInstrument('grand_piano', root + n.semi - 5, at, n.dur * 1.2, 0.16, { dest: sfx, pan: -0.10, priority: 2 });
      }
      this.playCrowd('applause_warm', now + 0.55, 0.18, { durationSec: 1.6, lowpassHz: 4200 });
    }
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.setCensorMicHold(false, 0);
    this.stopMusic();
    this.leslieBus?.dispose();
    this.leslieBus = null;
    this.detachUnlockListeners?.();
    this.detachUnlockListeners = null;

    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
    this.activeVoices.length = 0;
  }
}

export default ShowbandAudioEngineV7;
