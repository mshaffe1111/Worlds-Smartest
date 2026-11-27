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
import { StudioVoiceBankV8 } from './StudioVoiceBankV8';
import { CartoonFoleyAndShowpieceSfxV8 } from './CartoonFoleyAndShowpieceSfxV8';

export type ShowbandSceneIdV7 = StageWorldIdV7 | 'GREEN_ROOM' | 'TRAPDOOR_BLITZ';

export type CheatTellChannelV7 = 'ROW_C_GLINT' | 'SOLENOID_SPARK' | 'FRESNEL_LAMP';

export type ShowbandBusIdV7 = 'master' | 'music' | 'sfx' | 'crowd' | 'ambience';

export type SongChartVariantIdV7 = 0 | 1 | 2 | 3 | 4;

export type BandReactionKindV7 =
  | 'LEAD_CHANGE'
  | 'HOT_STREAK'
  | 'CLUTCH_POINT'
  | 'RIVAL_FUMBLE'
  | 'LINE_JACKPOT';

export type LifelineCueKindV7 = 'FIFTY_FIFTY' | 'AUDIENCE_POLL' | 'FREE_SWAP';

export type TrophyTierAudioIdV7 = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export const SONG_CHART_TITLES_V7: Readonly<Record<SongChartVariantIdV7, string>> = {
  0: 'Chart 0: Tijuana Brass Bounce (Herb Alpert / Dating Game 16-Bar)',
  1: 'Chart 1: 30 Rock Big-Band Swing Strut (Doc Severinsen / Take Ten 16-Bar)',
  2: 'Chart 2: Sunset Strip Bossa Nova (Quincy Jones / 1966 Hollywood Bossa 16-Bar)',
  3: 'Chart 3: Burbank Soul-Organ Go-Go (Booker T. / Laugh-In Leslie B3 16-Bar)',
  4: 'Chart 4: Midnight Penthouse Showstopper (Prime-Time Double-Dollars 16-Bar)',
};

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
  voiceVolume: 88,
  hapticsEnabled: true,
  reducedMotion: false,
  highContrastBadges: false,
  questionTimerMode: 30,
  autoPlayShowIntro: true,
  muteAutoQuestionTips: false,
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

const MAX_CONCURRENT_VOICES = 96;
const AMBIENCE_GRAIN_SR = 16000;
const SHOWBAND_LOOP_BARS = 16;

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
  extraStopNodes?: AudioScheduledSourceNode[];
  extraGainNodes?: GainNode[];
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

/** C1-continuous unity-gain soft-knee ceiling shaper (exact 1.0x linear below `kneeStart`, smooth tanh cap at `maxOut`). */
function createUnityKneeCeilingCurve(
  kneeStart = 0.46,
  maxOut = 0.68,
  samples = 1024,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(samples);
  const span = Math.max(0.05, maxOut - kneeStart);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    const ax = Math.abs(x);
    if (ax <= kneeStart) {
      curve[i] = x;
    } else {
      const sign = x < 0 ? -1 : 1;
      curve[i] = sign * (kneeStart + span * Math.tanh((ax - kneeStart) / span));
    }
  }
  return curve;
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
  public readonly voices: StudioVoiceBankV8;
  public readonly showpieceFoley: CartoonFoleyAndShowpieceSfxV8;

  public masterBus: GainNode | null = null;
  public musicBus: GainNode | null = null;
  public sfxBus: GainNode | null = null;
  public crowdBus: GainNode | null = null;
  public ambienceBus: GainNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;

  private readonly samplePack = new SamplePackLoaderV7();

  private ctx: AudioContext | null = null;
  private rhythmFrontInput: GainNode | null = null;
  private musicSanctuaryFilter: BiquadFilterNode | null = null;
  private musicSanctuaryGain: GainNode | null = null;
  private ribbonWarmShelf: BiquadFilterNode | null = null;
  private ribbonWoodBodyPeak: BiquadFilterNode | null = null;
  private ribbonUpperMidDip: BiquadFilterNode | null = null;
  private ribbonTopRolloff: BiquadFilterNode | null = null;
  private musicTapeShaper: WaveShaperNode | null = null;
  private musicStingerDuckGain: GainNode | null = null;
  private chamberPreDelay: DelayNode | null = null;
  private studioChamberConvolver: ConvolverNode | null = null;
  private chamberWarmLp: BiquadFilterNode | null = null;
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

  // Small hardware-only buffers (Stage 09 UHF barge static, 1966 Monoscope RF sync-loss static, hover backup click)
  private uhfCreakBuffer: AudioBuffer | null = null;
  private monoscopeStaticBuffer: AudioBuffer | null = null;
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

  // Sequencer, 16-bar A-A-B-A song chart rotation & voice pool
  private readonly activeVoices: ActiveVoiceHandle[] = [];
  private isMusicRunning = false;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextSubstepTime = 0;
  private currentBarIndex = 0;
  private currentSubstepInBar = 0;
  private songChartVariant: SongChartVariantIdV7 = 0;
  private explicitChartOverride = false;
  private stageSwitchCounter = 0;
  private ambienceBed: AmbienceBedNodes | null = null;
  private ambienceBedScene: ShowbandSceneIdV7 | null = null;
  private ambienceBedHasCrowd = false;
  private unlockInFlight: Promise<void> | null = null;
  private samplesReadyCompleted = false;

  // Censor mic continuous transformer hold state
  private censorHold: CensorHoldNodes | null = null;
  private censorHoldActive = false;
  private censorCharge01 = 0;

  // Micro-dedupe & cross-cue musical phrasing timestamps
  private lastHoverMs = -100;
  private lastDetentMs = -100;
  private lastWheelPegMs = -100;
  private slowWheelPegCount = 0;
  private lastSplitFlapWallMs = -1000;
  private splitFlapBurstStep = 0;
  private pylMelodyCursor = 0;
  private lastExplicitChartSetMs = -1e9;
  private lastBandReactionTime = -10;
  private lastCorrectRevealTime = -10;
  private lastWrongRevealTime = -10;
  private lastCeremonyFanfareTime = -10;
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
    this.voices = new StudioVoiceBankV8({
      initialVolume: this.settings.voiceVolume ?? 88,
      duckDb: -5.0,
      onDuckMusic: (durSec, db) => {
        const duckFactor = Math.max(0.28, Math.min(0.85, Math.pow(10, db / 20)));
        this.duckMusicForStinger(duckFactor, durSec, 0.72);
      },
    });
    this.showpieceFoley = new CartoonFoleyAndShowpieceSfxV8(
      () => this.ctx,
      () => this.sfxBus,
      () => this.crowdBus,
      this.samplePack,
    );

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

    // Up-front dry studio pocket input for Electric Bass, Upright Bass, Kick & Snare (tight front-to-back depth!)
    this.rhythmFrontInput = ctx.createGain();
    this.rhythmFrontInput.gain.value = 1.0;

    // Clue-Reading Sanctuary Peaking EQ (-7.0dB @ 1.8kHz) + -6.5dB calm reading bed attenuation
    this.musicSanctuaryFilter = ctx.createBiquadFilter();
    this.musicSanctuaryFilter.type = 'peaking';
    this.musicSanctuaryFilter.frequency.value = 1800;
    this.musicSanctuaryFilter.Q.value = 0.85;
    this.musicSanctuaryFilter.gain.value = this.clueSanctuaryActive ? -7.0 : 0.0;

    this.musicSanctuaryGain = ctx.createGain();
    this.musicSanctuaryGain.gain.value = this.clueSanctuaryActive ? 0.37 : 1.0;

    // Authentic 1966 Bill Putnam / Bones Howe Console EQ:
    // +2.8 dB @ 105 Hz (tight bass & kick foundation), -2.2 dB @ 235 Hz (clears boxy low-mid mud!),
    // -1.0 dB @ 3,400 Hz (preserves natural guitar string, piano hammer & snare snap!),
    // -4.0 dB @ 5,500 Hz (silky vintage ribbon top rolloff without dulling articulation)!
    this.ribbonWarmShelf = ctx.createBiquadFilter();
    this.ribbonWarmShelf.type = 'lowshelf';
    this.ribbonWarmShelf.frequency.value = 105;
    this.ribbonWarmShelf.gain.value = 2.8;

    this.ribbonWoodBodyPeak = ctx.createBiquadFilter();
    this.ribbonWoodBodyPeak.type = 'peaking';
    this.ribbonWoodBodyPeak.frequency.value = 235;
    this.ribbonWoodBodyPeak.Q.value = 1.05;
    this.ribbonWoodBodyPeak.gain.value = -2.2;

    this.ribbonUpperMidDip = ctx.createBiquadFilter();
    this.ribbonUpperMidDip.type = 'peaking';
    this.ribbonUpperMidDip.frequency.value = 3400;
    this.ribbonUpperMidDip.Q.value = 0.90;
    this.ribbonUpperMidDip.gain.value = -1.0;

    this.ribbonTopRolloff = ctx.createBiquadFilter();
    this.ribbonTopRolloff.type = 'highshelf';
    this.ribbonTopRolloff.frequency.value = 5500;
    this.ribbonTopRolloff.gain.value = -4.0;

    this.musicTapeShaper = ctx.createWaveShaper();
    this.musicTapeShaper.curve = createWarmTubeSaturationCurve(1.06, 512);
    this.musicTapeShaper.oversample = '2x';

    // Broadcast engineer fader duck node for big fanfares, bells, buzzers & wheel spins
    this.musicStingerDuckGain = ctx.createGain();
    this.musicStingerDuckGain.gain.value = 1.0;

    // Stereo 1.45s Wooden Chamber Convolution Reverb with 22ms Tape Pre-Delay, 220Hz De-Mud HPF & <2,800Hz Damping!
    this.chamberPreDelay = ctx.createDelay(0.05);
    this.chamberPreDelay.delayTime.value = 0.022;

    const chamberIr = this.buildStudioChamberImpulse(ctx);
    this.chamberIrBytes = chamberIr.length * chamberIr.numberOfChannels * 4;
    this.studioChamberConvolver = ctx.createConvolver();
    this.studioChamberConvolver.buffer = chamberIr;

    this.chamberWarmLp = ctx.createBiquadFilter();
    this.chamberWarmLp.type = 'lowpass';
    this.chamberWarmLp.frequency.value = 2850;
    this.chamberWarmLp.Q.value = 0.7;

    this.musicDryGain = ctx.createGain();
    this.musicDryGain.gain.value = 1.03;
    this.musicWetGain = ctx.createGain();
    this.musicWetGain.gain.value = 0.28;

    // Subtle studio room glue send from SFX bus (puts bells & brass stingers in the same room!)
    this.sfxChamberSend = ctx.createGain();
    this.sfxChamberSend.gain.value = 0.13;

    // Open-Crest Broadcast Glue Compressor (high -10.5dB threshold so rhythm groove NEVER pumps — >=10.5 dB crest!)
    this.broadcastGlueComp = ctx.createDynamicsCompressor();
    this.broadcastGlueComp.threshold.value = -10.5;
    this.broadcastGlueComp.knee.value = 12.0;
    this.broadcastGlueComp.ratio.value = 1.75;
    this.broadcastGlueComp.attack.value = 0.028;
    this.broadcastGlueComp.release.value = 0.22;

    const makeupGain = ctx.createGain();
    makeupGain.gain.value = 0.68;

    // Brickwall Safety Limiter + Unity-Knee True-Peak Ceiling Shaper (preserves >=11 dB acoustic crest factor while capping peaks <= -2.4 dBFS!)
    this.brickwallLimiter = ctx.createDynamicsCompressor();
    this.brickwallLimiter.threshold.value = -4.2;
    this.brickwallLimiter.knee.value = 2.0;
    this.brickwallLimiter.ratio.value = 20.0;
    this.brickwallLimiter.attack.value = 0.001;
    this.brickwallLimiter.release.value = 0.085;

    this.ceilingShaper = ctx.createWaveShaper();
    this.ceilingShaper.curve = createUnityKneeCeilingCurve(0.56, 0.76, 1024);
    this.ceilingShaper.oversample = '2x';

    // Real 1024-sample AnalyserNode on Master Chain
    this.masterAnalyser = ctx.createAnalyser();
    this.masterAnalyser.fftSize = 1024;
    this.masterAnalyser.smoothingTimeConstant = 0.0;

    // Wire 3D Front-to-Back Music Stage:
    // - `rhythmFrontInput` (Bass Guitar, Upright Bass, Kick, Snare) -> Sanctuary Gain -> 4-Band Ribbon EQ -> Dry Up-Front!
    // - `musicSanctuaryFilter` (Guitars L, Keys R, Horns/Strings) -> Sanctuary Gain -> 4-Band Ribbon EQ + 22ms Chamber Room!
    const roomChamberSend = ctx.createGain();
    roomChamberSend.gain.value = 1.0;
    const frontSubtleRoomSend = ctx.createGain();
    frontSubtleRoomSend.gain.value = 0.08;

    this.musicSanctuaryFilter.connect(roomChamberSend);
    this.rhythmFrontInput.connect(frontSubtleRoomSend);

    this.musicSanctuaryFilter.connect(this.musicSanctuaryGain);
    this.rhythmFrontInput.connect(this.musicSanctuaryGain);

    this.musicSanctuaryGain.connect(this.ribbonWarmShelf);
    this.ribbonWarmShelf.connect(this.ribbonWoodBodyPeak);
    this.ribbonWoodBodyPeak.connect(this.ribbonUpperMidDip);
    this.ribbonUpperMidDip.connect(this.ribbonTopRolloff);
    this.ribbonTopRolloff.connect(this.musicTapeShaper);
    this.musicTapeShaper.connect(this.musicStingerDuckGain);

    // Room Chamber Return (22ms Pre-Delay -> 230Hz Abbey-Road De-Mud HPF -> 1.45s Wooden Convolver -> <2,850Hz Warm Damping)
    const preDuckMix = ctx.createGain();
    preDuckMix.gain.value = 1.0;
    const chamberDeMudHp = ctx.createBiquadFilter();
    chamberDeMudHp.type = 'highpass';
    chamberDeMudHp.frequency.value = 230;

    this.musicTapeShaper.disconnect();
    this.musicStingerDuckGain.disconnect();
    this.musicTapeShaper.connect(this.musicDryGain);
    this.musicDryGain.connect(preDuckMix);

    roomChamberSend.connect(this.chamberPreDelay);
    frontSubtleRoomSend.connect(this.chamberPreDelay);
    this.chamberPreDelay.connect(chamberDeMudHp);
    chamberDeMudHp.connect(this.studioChamberConvolver);
    this.studioChamberConvolver.connect(this.chamberWarmLp);
    this.chamberWarmLp.connect(this.musicWetGain);
    this.musicWetGain.connect(preDuckMix);

    preDuckMix.connect(this.musicStingerDuckGain);
    this.musicStingerDuckGain.connect(this.musicBus);

    // Subtle chamber send for SFX stingers into same studio room
    this.sfxBus.connect(this.sfxChamberSend);
    this.sfxChamberSend.connect(this.studioChamberConvolver);

    // Wire 5 XAG Buses -> C1 Pre-Master Transient Guard (<= -3.3 dBFS) -> Master -> Glue -> Limiter -> Ceiling -> Analyser -> Destination
    const preMasterSum = ctx.createGain();
    preMasterSum.gain.value = 1.0;
    const preMasterGuard = ctx.createWaveShaper();
    preMasterGuard.curve = createUnityKneeCeilingCurve(0.54, 0.74, 1024);
    preMasterGuard.oversample = '2x';

    this.musicBus.connect(preMasterSum);
    this.sfxBus.connect(preMasterSum);
    this.crowdBus.connect(preMasterSum);
    this.ambienceBus.connect(preMasterSum);
    preMasterSum.connect(preMasterGuard);
    preMasterGuard.connect(this.masterBus);

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
    this.voices.attachAudioGraph(ctx, preMasterSum);

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

    // Classic Jimmy Smith / 1966 CBS Studio Organ registration: 88 8400 000 smoky lower-drawbar body!
    const realWarm = new Float32Array(17);
    const imagWarm = new Float32Array(17);
    imagWarm[1] = 0.96; // 16'
    imagWarm[2] = 1.00; // 8'
    imagWarm[3] = 0.86; // 5-1/3'
    imagWarm[4] = 0.48; // 4'
    imagWarm[6] = 0.14; // 2-2/3'
    imagWarm[8] = 0.09; // 2'
    imagWarm[10] = 0.03; // 1-3/5'
    imagWarm[12] = 0.02; // 1-1/3'
    imagWarm[16] = 0.03; // 1'
    this.hammondWarmWave = ctx.createPeriodicWave(realWarm, imagWarm, {
      disableNormalization: false,
    });

    // Punchier Booker T. / Soul-Jazz registration: 88 8630 002 (thick low-mid growl, silky top!)
    const realSoul = new Float32Array(17);
    const imagSoul = new Float32Array(17);
    imagSoul[1] = 0.98;
    imagSoul[2] = 1.00;
    imagSoul[3] = 0.90;
    imagSoul[4] = 0.62;
    imagSoul[6] = 0.36;
    imagSoul[8] = 0.16;
    imagSoul[10] = 0.08;
    imagSoul[12] = 0.05;
    imagSoul[16] = 0.10;
    this.hammondPercWave = ctx.createPeriodicWave(realSoul, imagSoul, {
      disableNormalization: false,
    });

    // Shared Stereo Leslie 122 Rotary Speaker Cabinet (anchored Stage Right w/ wide stereo swirl!)
    const input = ctx.createGain();
    input.gain.value = 1.0;

    // Warm 6550 Leslie tube preamp coloration + smoky 1,750 Hz wooden horn cabinet rolloff
    const preampDrive = ctx.createWaveShaper();
    preampDrive.curve = createWarmTubeSaturationCurve(1.55, 512);

    const hornCabinetLp = ctx.createBiquadFilter();
    hornCabinetLp.type = 'lowpass';
    hornCabinetLp.frequency.value = 1750;
    hornCabinetLp.Q.value = 0.72;

    const hornBodyPeak = ctx.createBiquadFilter();
    hornBodyPeak.type = 'peaking';
    hornBodyPeak.frequency.value = 620;
    hornBodyPeak.Q.value = 0.85;
    hornBodyPeak.gain.value = 3.2;

    // Stereo Dual-Channel Doppler Delay Lines (L & R opposite rotor phase, Stage-Right keyboardist perspective!)
    const delayL = ctx.createDelay(0.02);
    const delayR = ctx.createDelay(0.02);
    delayL.delayTime.value = 0.0028;
    delayR.delayTime.value = 0.0028;

    const ampL = ctx.createGain();
    const ampR = ctx.createGain();
    ampL.gain.value = 0.62;
    ampR.gain.value = 0.92;

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
    const dur = 1.52;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(2, len, sr);
    const left = buf.getChannelData(0);
    const right = buf.getChannelData(1);
    const rngL = createSeededNoise(0x19664342);
    const rngR = createSeededNoise(0x19665354);

    const earlyL = [
      [0.014, 0.36],
      [0.029, -0.24],
      [0.047, 0.19],
      [0.066, -0.14],
    ];
    const earlyR = [
      [0.019, 0.35],
      [0.034, -0.25],
      [0.052, 0.18],
      [0.071, -0.13],
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
      const preDelayEnv = Math.min(1, t / 0.018);
      const dampAlpha = 0.21 * Math.exp(-t * 1.25) + 0.04;
      const decay = Math.exp(-t / 0.46) * preDelayEnv;
      lpL += dampAlpha * (rngL() - lpL);
      lpR += dampAlpha * (rngR() - lpR);
      left[i] = (left[i] + lpL * decay * 0.33) * 0.86;
      right[i] = (right[i] + lpR * decay * 0.33) * 0.86;
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

    // 3. 1966 RCA Monoscope "SIGNAL JAMMED" RF Snow & 60Hz Horizontal-Hold Tear Burst (0.38s)
    {
      const sr = 24000;
      const len = Math.round(0.38 * sr);
      const buf = ctx.createBuffer(1, len, sr);
      const ch = buf.getChannelData(0);
      const rng = createSeededNoise(0x19665a4e);
      let bp = 0;
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const u = i / len;
        const env = Math.min(1, t / 0.008) * Math.pow(1 - u * 0.72, 1.35);
        // 60Hz NTSC vertical/horizontal sync-loss tear gate + crisp RF snow!
        const syncGate = 0.62 + 0.38 * Math.sign(Math.sin(2 * Math.PI * 60 * t + 0.4 * Math.sin(2 * Math.PI * 19 * t)));
        const w = rng();
        lp += 0.46 * (w - lp);
        bp += 0.12 * (lp - bp);
        const rfBand = lp - bp;
        const arc = Math.abs(w) > 0.88 ? w * 0.45 : 0;
        ch[i] = clamp(env * syncGate * (rfBand * 1.35 + arc), -0.95, 0.95);
      }
      this.monoscopeStaticBuffer = buf;
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
    if (this.disposed) return;
    const ctx = this.ensureAudioGraph();
    if (!ctx) return;

    // Detach window gesture listeners immediately if context is already running (#245 #10)
    if ((ctx.state as string) === 'running' && this.detachUnlockListeners) {
      this.detachUnlockListeners();
      this.detachUnlockListeners = null;
    }

    // Fast idempotent exit when already unlocked, samples decoded & music running (zero ambience churn!)
    if (
      (ctx.state as string) === 'running' &&
      this.samplesReadyCompleted &&
      this.isMusicRunning
    ) {
      this.rebuildStageAmbienceBed(false);
      return;
    }

    if (this.unlockInFlight) {
      return this.unlockInFlight;
    }

    this.unlockInFlight = (async () => {
      try {
        if (ctx.state === 'suspended') {
          try {
            await ctx.resume();
          } catch {
            // Browser may require gesture; auto-unlock listener will retry
          }
        }

        if ((ctx.state as string) === 'running' && this.detachUnlockListeners) {
          this.detachUnlockListeners();
          this.detachUnlockListeners = null;
        }

        if (!this.samplesReadyCompleted) {
          await this.waitForSamplesReady();
          this.samplesReadyCompleted = true;
        }
        void this.voices.warmPreloadCoreCues(ctx);

        if (!this.isMusicRunning && !this.disposed) {
          this.startMusic();
        } else if (this.isMusicRunning && !this.disposed) {
          // Only upgrades ambience bed if crowd sample wasn't decoded yet; never churns an active bed!
          this.rebuildStageAmbienceBed(false);
        }
      } finally {
        this.unlockInFlight = null;
      }
    })();

    return this.unlockInFlight;
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
   * unlock + full real studio sample loading before capturing, and computes
   * true stereo width, crest factor, 3-band spectral balance & dead-air metrics!).
   */
  public async recordMasterAudioSamples(
    durationMs = 4000,
    onCueSchedule?: () => void,
  ): Promise<{
    sampleRate: number;
    samples: number[];
    stats: SamplePackStatsV7;
    stereoMetrics?: {
      rmsDb: number;
      peakDb: number;
      crestDb: number;
      stereoWidthRatio: number;
      stereoSideRmsDb: number;
      lowSub300Db: number;
      mid300To3kDb: number;
      airAbove3kDb: number;
      maxDeadAirMs: number;
    };
  }> {
    await this.unlock();
    const ctx = this.getAudioContext();
    const bus = this.masterAnalyser ?? this.masterBus;
    if (!ctx || !bus) {
      return { sampleRate: 44100, samples: [], stats: this.getSamplePackStats() };
    }

    const sr = ctx.sampleRate || 48000;
    const proc = ctx.createScriptProcessor(2048, 2, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    const collected: number[] = [];

    let sumMidSq = 0;
    let sumSideSq = 0;
    let peakAbs = 0;
    let lp300 = 0;
    let lp3000 = 0;
    const alpha300 = 1 - Math.exp((-2 * Math.PI * 300) / sr);
    const alpha3000 = 1 - Math.exp((-2 * Math.PI * 3000) / sr);
    let sumLowSq = 0;
    let sumMidBandSq = 0;
    let sumAirSq = 0;
    let curQuietSamples = 0;
    let maxQuietSamples = 0;

    proc.onaudioprocess = (ev) => {
      const chL = ev.inputBuffer.getChannelData(0);
      const chR = ev.inputBuffer.numberOfChannels > 1 ? ev.inputBuffer.getChannelData(1) : chL;
      for (let i = 0; i < chL.length; i++) {
        const l = chL[i];
        const r = chR[i];
        const mono = 0.5 * (l + r);
        const side = 0.5 * (l - r);
        collected.push(Number(mono.toFixed(5)));

        const absM = Math.max(Math.abs(l), Math.abs(r));
        if (absM > peakAbs) peakAbs = absM;
        sumMidSq += mono * mono;
        sumSideSq += side * side;

        lp300 += alpha300 * (mono - lp300);
        lp3000 += alpha3000 * (mono - lp3000);
        const bandLow = lp300;
        const bandMid = lp3000 - lp300;
        const bandAir = mono - lp3000;
        sumLowSq += bandLow * bandLow;
        sumMidBandSq += bandMid * bandMid;
        sumAirSq += bandAir * bandAir;

        if (absM < 0.002) {
          curQuietSamples++;
          if (curQuietSamples > maxQuietSamples) maxQuietSamples = curQuietSamples;
        } else {
          curQuietSamples = 0;
        }
      }
    };

    bus.connect(proc);
    proc.connect(mute);
    mute.connect(ctx.destination);

    try {
      if (onCueSchedule) {
        onCueSchedule();
      }

      await sleepMs(durationMs);
    } finally {
      proc.onaudioprocess = null;
      try {
        bus.disconnect(proc);
      } catch {
        // ignore
      }
      try {
        proc.disconnect();
      } catch {
        // ignore
      }
      try {
        mute.disconnect();
      } catch {
        // ignore
      }
    }

    const n = Math.max(1, collected.length);
    const toDb = (lin: number) => Number((lin > 1e-6 ? 20 * Math.log10(lin) : -100).toFixed(2));
    const midRms = Math.sqrt(sumMidSq / n);
    const sideRms = Math.sqrt(sumSideSq / n);
    const rmsDb = toDb(midRms);
    const peakDb = toDb(peakAbs);

    return {
      sampleRate: Math.round(sr),
      samples: collected,
      stats: this.getSamplePackStats(),
      stereoMetrics: {
        rmsDb,
        peakDb,
        crestDb: Number((peakDb - rmsDb).toFixed(2)),
        stereoWidthRatio: Number((midRms > 1e-6 ? sideRms / midRms : 0).toFixed(3)),
        stereoSideRmsDb: toDb(sideRms),
        lowSub300Db: toDb(Math.sqrt(sumLowSq / n)),
        mid300To3kDb: toDb(Math.sqrt(sumMidBandSq / n)),
        airAbove3kDb: toDb(Math.sqrt(sumAirSq / n)),
        maxDeadAirMs: Number(((maxQuietSamples / sr) * 1000).toFixed(1)),
      },
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
    if (typeof next.voiceVolume === 'number') {
      this.voices.setVoiceVolume(clamp(next.voiceVolume, 0, 100));
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

  public setVoiceVolume(volume0to100: number): void {
    this.applySettings({ voiceVolume: clamp(volume0to100, 0, 100) });
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

  public isAudioUnlocked(): boolean {
    return Boolean(this.ctx && this.ctx.state === 'running');
  }

  public getCurrentBarIndex(): number {
    return this.currentBarIndex;
  }

  /** Jumps cleanly to any bar `0..15` in the 16-bar A-A-B-A cycle (e.g. Bar 8 B-section bridge). */
  public seekToBar(barIndex: number): void {
    const wrapped = ((Math.floor(barIndex) % SHOWBAND_LOOP_BARS) + SHOWBAND_LOOP_BARS) % SHOWBAND_LOOP_BARS;
    this.currentBarIndex = wrapped;
    this.currentSubstepInBar = 0;
    if (this.ctx) {
      this.nextSubstepTime = Math.max(this.ctx.currentTime + 0.015, this.nextSubstepTime);
    }
  }

  /**
   * Selects one of the 5 distinct 1966 16-bar Showband Song Charts (`0..4`) and
   * rotates the 3 *Think!* chamber clue beds (`0..2`). Calling with no argument
   * smoothly auto-advances to the next song chart (e.g. Act-3 Double-Dollars!).
   */
  public setSongChartVariant(variantIdx?: number): void {
    const nextIdx =
      typeof variantIdx === 'number' && Number.isFinite(variantIdx)
        ? (((Math.floor(variantIdx) % 5) + 5) % 5)
        : ((this.songChartVariant + 1) % 5);
    this.songChartVariant = nextIdx as SongChartVariantIdV7;
    this.explicitChartOverride = true;
    this.lastExplicitChartSetMs = this.nowWallMs();

    if (this.ctx && this.leslieBus && !this.clueSanctuaryActive) {
      const fast = this.songChartVariant === 3 || this.songChartVariant === 4 || (this.currentBarIndex >= 8 && this.currentBarIndex <= 11);
      this.leslieBus.setFast(fast, this.ctx.currentTime);
    }
  }

  public getSongChartVariant(): SongChartVariantIdV7 {
    return this.songChartVariant;
  }

  public getSongChartTitle(): string {
    return SONG_CHART_TITLES_V7[this.songChartVariant];
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
        if (victim.extraGainNodes) {
          for (const eg of victim.extraGainNodes) {
            try {
              eg.gain.cancelScheduledValues(now);
              eg.gain.setValueAtTime(0, now);
            } catch {
              // ignore
            }
          }
        }
        victim.gainNode.gain.cancelScheduledValues(now);
        victim.gainNode.gain.setTargetAtTime(0.0001, now, 0.002);
        victim.stopNode.stop(now + 0.009);
        if (victim.extraStopNodes) {
          for (const extra of victim.extraStopNodes) {
            try {
              extra.stop(now + 0.009);
            } catch {
              // ignore
            }
          }
        }
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
    wahSweep?: boolean;
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
    if (opts.wahSweep) {
      // Authentic 1966 Studio Rubber Plunger-Mute "WAH-uh!" Formant Sweep!
      const openAt = startAt + Math.min(0.095, playDur * 0.34);
      const wahPeak = ctx.createBiquadFilter();
      wahPeak.type = 'peaking';
      wahPeak.Q.setValueAtTime(2.6, startAt);
      wahPeak.gain.setValueAtTime(8.5, startAt);
      wahPeak.frequency.setValueAtTime(480, startAt);
      wahPeak.frequency.exponentialRampToValueAtTime(1820, openAt);
      wahPeak.frequency.exponentialRampToValueAtTime(440, endAt);

      const wahLp = ctx.createBiquadFilter();
      wahLp.type = 'lowpass';
      wahLp.Q.setValueAtTime(1.3, startAt);
      wahLp.frequency.setValueAtTime(820, startAt);
      wahLp.frequency.exponentialRampToValueAtTime(3100, openAt);
      wahLp.frequency.exponentialRampToValueAtTime(640, endAt);

      tail.connect(wahPeak);
      wahPeak.connect(wahLp);
      tail = wahLp;
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
      wahSweep?: boolean;
    },
  ): void {
    const pick = this.samplePack.pickZoneWithFallback(instrumentId, midiNote);
    if (!pick) return;

    const isFrontPocket =
      instrumentId === 'electric_bass' ||
      instrumentId === 'upright_bass' ||
      instrumentId === 'clean_guitar' ||
      instrumentId === 'jazz_guitar' ||
      instrumentId === 'electric_piano' ||
      instrumentId === 'grand_piano' ||
      instrumentId === 'timpani';
    const dest =
      opts?.dest ??
      (isFrontPocket
        ? (this.rhythmFrontInput ?? this.musicSanctuaryFilter)
        : this.musicSanctuaryFilter);
    const endRate =
      typeof opts?.bendToMidi === 'number'
        ? Math.pow(2, (opts.bendToMidi - pick.rootMidi) / 12)
        : undefined;

    const defaultAttack = instrumentId === 'strings' ? 0.065 : 0.002;
    const defaultRelease =
      instrumentId === 'strings'
        ? 0.22
        : instrumentId === 'trumpet' || instrumentId === 'brass' || instrumentId === 'muted_trumpet'
          ? 0.055
          : instrumentId === 'electric_bass' || instrumentId === 'upright_bass'
            ? 0.085
            : 0.12;

    // 1966 Bill Putnam Mix Clarity:
    // - One Master Bassist owns 40-145Hz (`0 Hz` HPF + `920..1,150 Hz` articulate pluck/finger snap!)
    // - Left Guitar & Right Rhodes/Steinway sit up-front (`rhythmFrontInput`), high-passed at `155-165 Hz` with open `4,100-4,600 Hz` string/hammer clarity!
    // - Horns/Saxes high-pass at `140-180 Hz` so `120-260 Hz` stays 100% mud-free!
    const defaultHighpass =
      instrumentId === 'clean_guitar' || instrumentId === 'jazz_guitar'
        ? 165
        : instrumentId === 'electric_piano' || instrumentId === 'grand_piano'
          ? 155
          : instrumentId === 'trumpet' || instrumentId === 'muted_trumpet' || instrumentId === 'vibraphone' || instrumentId === 'marimba'
            ? 185
            : instrumentId === 'brass' || instrumentId === 'tenor_sax' || instrumentId === 'strings'
              ? 160
              : instrumentId === 'trombone'
                ? 115
                : instrumentId === 'baritone_sax'
                  ? 88
                  : undefined;

    const defaultLowpass =
      !opts?.dest
        ? instrumentId === 'electric_bass'
          ? 920
          : instrumentId === 'upright_bass'
            ? 1120
            : instrumentId === 'baritone_sax'
              ? 2750
              : instrumentId === 'trombone'
                ? 2950
                : instrumentId === 'jazz_guitar'
                  ? 4100
                  : instrumentId === 'clean_guitar'
                    ? 4500
                    : instrumentId === 'electric_piano'
                      ? 4300
                      : instrumentId === 'grand_piano'
                        ? 4600
                        : instrumentId === 'tenor_sax'
                          ? 3400
                          : instrumentId === 'marimba' || instrumentId === 'vibraphone'
                            ? 3500
                            : instrumentId === 'strings'
                              ? 3200
                              : instrumentId === 'brass' || instrumentId === 'muted_trumpet'
                                ? 3450
                                : instrumentId === 'trumpet'
                                  ? 3650
                                  : instrumentId === 'glockenspiel' || instrumentId === 'tubular_bell'
                                    ? 4200
                                    : undefined
        : undefined;

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
      priority: opts?.priority ?? (isFrontPocket ? 3 : 2),
      lowpassHz: opts?.lowpassHz ?? defaultLowpass,
      highpassHz: opts?.highpassHz ?? defaultHighpass,
      wahSweep: opts?.wahSweep,
      pan: opts?.pan,
    });
  }

  /** Plays a real Boston Jazz Drum Kit recording (`virtuosity_drums` / `VCSL` CC0) with 1966 Hal Blaine tape warmth. */
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
    const isMusicDrum = !opts?.dest;
    const isCoreKit =
      drumId === 'kick' ||
      drumId === 'snare_stick' ||
      drumId === 'snare_brush' ||
      drumId === 'snare_rim' ||
      drumId === 'tom_mid';
    const isBrightCymbal =
      drumId === 'ride' ||
      drumId === 'hihat_closed' ||
      drumId === 'hihat_pedal' ||
      drumId === 'tambourine' ||
      drumId === 'shaker' ||
      drumId === 'crash' ||
      drumId === 'cowbell';

    // Crisp Hal Blaine Drum Pocket: tight felt kick (1,150Hz), articulate snare/brushes (+1.8dB), silky ride/hats (4,600Hz)!
    const gainScale = isMusicDrum
      ? drumId === 'kick'
        ? 1.18
        : drumId === 'snare_brush' || drumId === 'snare_stick' || drumId === 'snare_rim'
          ? 1.24
          : drumId === 'ride' || drumId === 'hihat_pedal' || drumId === 'hihat_closed'
            ? 0.88
            : isBrightCymbal
              ? 0.72
              : 1.05
      : 1.0;

    const defaultDrumLp = isMusicDrum
      ? drumId === 'kick'
        ? 1150
        : drumId === 'tom_mid' || drumId === 'bongo_lo'
          ? 2800
          : drumId === 'bongo_hi' || drumId === 'cowbell'
            ? 3400
            : drumId === 'snare_brush' || drumId === 'snare_rim' || drumId === 'snare_stick'
              ? 4800
              : drumId === 'ride' || drumId === 'hihat_closed' || drumId === 'hihat_pedal' || drumId === 'shaker' || drumId === 'tambourine'
                ? 4750
                : drumId === 'crash'
                  ? 4900
                  : undefined
      : undefined;

    const targetDest =
      opts?.dest ??
      (isCoreKit
        ? (this.rhythmFrontInput ?? this.musicSanctuaryFilter)
        : this.musicSanctuaryFilter);

    this.triggerBuffer({
      buffer: buf,
      dest: targetDest,
      when,
      gain: gain * gainScale,
      playbackRate: opts?.playbackRate ?? 1.0,
      durationSec: opts?.durationSec,
      attackSec: 0.001,
      releaseSec: 0.04,
      priority: opts?.priority ?? (drumId === 'kick' ? 2 : 1),
      pan: opts?.pan,
      lowpassHz: opts?.lowpassHz ?? defaultDrumLp,
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
      this.clueSanctuaryActive ? 0.37 : 1.0,
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
      this.currentBarIndex = (this.currentBarIndex + 1) % SHOWBAND_LOOP_BARS;
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

  private defaultChartForScene(sceneId: ShowbandSceneIdV7, episodeRotation: number): SongChartVariantIdV7 {
    switch (sceneId) {
      case 'GREEN_ROOM':
        return 0; // Chart 0: Tijuana Brass Bounce
      case 'STAGE_01_IBC_DAYTIME_FUNK':
        // Episode 1 starts on Chart 1 (30 Rock Big-Band Swing Strut) so entering from Title immediately plays a fresh tune, then rotates!
        return ((1 + episodeRotation) % 5) as SongChartVariantIdV7;
      case 'STAGE_02_IBC_PRIMETIME_JUBILEE':
        return ((4 + episodeRotation) % 5) as SongChartVariantIdV7;
      case 'STAGE_03_1926_VAUDEVILLE_PIT':
        return 3; // Chart 3: Burbank Soul-Organ Go-Go
      case 'STAGE_06_ATLANTIC_CITY_PIER':
        return ((0 + episodeRotation) % 5) as SongChartVariantIdV7;
      case 'STAGE_08_WORLDS_FAIR_GEODESIC':
        return 2; // Chart 2: Sunset Strip Bossa-Exotica
      case 'STAGE_10_SOVEREIGN_SANCTUM':
        return 4; // Chart 4: Midnight Penthouse Showstopper
      default:
        return (episodeRotation % 5) as SongChartVariantIdV7;
    }
  }

  public setScene(sceneId: ShowbandSceneIdV7): void {
    if (!(sceneId in SHOWBAND_SCENE_SPECS_V7)) return;
    if (sceneId !== 'TRAPDOOR_BLITZ') {
      this.baseStageBeforeBlitz = sceneId;
    }

    // Auto-rotate song chart across episode stage entrances while preserving synchronous pre-stage setSongChartVariant() calls!
    if (sceneId === 'GREEN_ROOM') {
      if (this.nowWallMs() - this.lastExplicitChartSetMs >= 250) {
        this.explicitChartOverride = false;
        this.songChartVariant = 0;
      }
    } else if (sceneId !== 'TRAPDOOR_BLITZ') {
      const rot = this.stageSwitchCounter;
      this.stageSwitchCounter += 1;
      if (this.nowWallMs() - this.lastExplicitChartSetMs >= 250) {
        this.explicitChartOverride = false;
        this.songChartVariant = this.defaultChartForScene(sceneId, rot);
      }
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

  private rebuildStageAmbienceBed(force = true): void {
    const ctx = this.ctx;
    if (!ctx || !this.ambienceBus || !this.crowdBus || !this.isMusicRunning) return;

    const activeStage =
      this.currentScene === 'TRAPDOOR_BLITZ'
        ? this.baseStageBeforeBlitz
        : this.currentScene;
    const isSealed = this.isSealedVaultScene(this.currentScene);
    const crowdBuf = this.samplePack.getCrowd('applause_warm');
    const willHaveCrowd = !isSealed && Boolean(crowdBuf);

    // Guard (#245 #10): Never tear down and respawn an already-running ambience bed for the same stage!
    if (
      !force &&
      this.ambienceBed &&
      this.ambienceBedScene === activeStage &&
      (this.ambienceBedHasCrowd || !willHaveCrowd)
    ) {
      return;
    }

    if (this.ambienceBed) {
      this.ambienceBed.stopAll(0.28);
      this.ambienceBed = null;
      this.ambienceBedScene = null;
      this.ambienceBedHasCrowd = false;
    }

    const now = ctx.currentTime;
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

    this.ambienceBedScene = activeStage;
    this.ambienceBedHasCrowd = willHaveCrowd;
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
      this.rebuildStageAmbienceBed(true);
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
      this.ambienceBedScene = null;
      this.ambienceBedHasCrowd = false;
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
      // Gentle calming tempo shift (~98 BPM) when Merv Griffin *Think!* bed is active on non-blitz stages;
      // subtle +4 BPM adrenaline lift when Chart 4 (Midnight Penthouse Showstopper) is active in Double-Dollars!
      const chartBoost =
        !this.clueSanctuaryActive &&
        this.currentScene !== 'TRAPDOOR_BLITZ' &&
        this.explicitChartOverride &&
        this.songChartVariant === 4
          ? 4
          : 0;
      const effectiveBpm =
        this.clueSanctuaryActive && this.currentScene !== 'TRAPDOOR_BLITZ'
          ? Math.min(spec.bpm, 98)
          : spec.bpm + chartBoost;
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
        this.currentBarIndex = (this.currentBarIndex + 1) % SHOWBAND_LOOP_BARS;
      }
    }
  }

  /**
   * Iconic 16-Bar (`A-A-B-A`) Merv Griffin *"Think!"* / Score Productions Chamber Thinking Beds!
   * Rotates across 3 evolving chamber clue beds (`0: Classic Vibe & Felt Piano`,
   * `1: Cool Jazz Guitar & Marimba Lounge`, `2: Late-Night Celesta & Strings Salon`)
   * with a warm Bars 8–11 Subdominant Chamber Bridge and feather-light turnaround whispers!
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
    const thinkVariant = this.songChartVariant % 3;
    const isBridge = barIdx >= 8 && barIdx <= 11;

    // 16-Bar A-A-B-A *Think!* Harmonic Cycle (with warm Bars 8-11 IVmaj7 -> ivm6 -> iii7 -> V13sus4 Bridge!)
    const progRoots = isMajor
      ? [0, 9, 2, 7, 0, 9, 2, 0, 5, 5, 4, 7, 0, 9, 2, 7]
      : [0, 8, 5, 7, 0, 3, 2, 7, 5, 10, 3, 7, 0, 8, 2, 7];
    const progVoicings: ReadonlyArray<readonly [number, number, number]> = isMajor
      ? [
          [4, 7, 9],  // 0: I6
          [3, 7, 10], // 1: vi7
          [3, 7, 10], // 2: ii7
          [4, 7, 10], // 3: V7
          [4, 7, 11], // 4: Imaj7
          [3, 7, 10], // 5: vi7
          [3, 7, 10], // 6: ii7
          [4, 10, 14], // 7: I9 (leads into IVmaj7 bridge!)
          [4, 7, 11], // 8: IVmaj7 (Bridge!)
          [3, 7, 9],  // 9: ivm6
          [3, 7, 10], // 10: iii7
          [5, 9, 10], // 11: V13sus4
          [4, 7, 9],  // 12: I6
          [4, 7, 10], // 13: VI7
          [3, 7, 14], // 14: ii9
          [5, 9, 10], // 15: V13sus4
        ]
      : [
          [3, 7, 10], // 0: im7
          [4, 7, 11], // 1: bVImaj7
          [3, 7, 10], // 2: ivm7
          [4, 10, 13], // 3: V7b9
          [3, 7, 14], // 4: im9
          [4, 7, 11], // 5: bIIImaj7
          [3, 6, 10], // 6: iim7b5
          [4, 10, 13], // 7: V7b9
          [3, 7, 14], // 8: ivm9 (Bridge!)
          [4, 7, 10], // 9: bVII9
          [4, 7, 11], // 10: bIIImaj7
          [4, 10, 13], // 11: V7b9
          [3, 7, 14], // 12: im9
          [4, 7, 11], // 13: bVImaj7
          [3, 6, 10], // 14: iim7b5
          [4, 10, 13], // 15: V7b9
        ];

    const deg = progRoots[barIdx];
    const tones = progVoicings[barIdx];
    const bassRoot = root - 12 + (deg > 6 ? deg - 12 : deg);
    const eBassRoot = bassRoot >= 38 ? bassRoot - 12 : bassRoot;
    const chordBase = root + (deg > 7 ? deg - 12 : deg);
    const gtrBase = chordBase - 12; // Warm E2..G3 guitarist register (Left -0.46)
    const keysBase = chordBase - 12; // Warm C2..G3 Rhodes/Steinway register (Right +0.44)

    // 1. Warm Fingerstyle Electric Bass Guitar + Upright Bass Pocket (Center-Front, <=540 Hz)
    if (thinkVariant === 1 || isBridge) {
      if (step % 4 === 0 && step < 16) {
        const walk = [0, tones[0], 7, barIdx === 11 ? 9 : 5][step / 4];
        this.playInstrument('electric_bass', eBassRoot + walk, when, sixteenthSec * 4.4, 0.30, {
          pan: -0.04,
          lowpassHz: 520,
        });
        this.playInstrument('upright_bass', bassRoot + walk, when + 0.003, sixteenthSec * 4.0, 0.17, {
          pan: 0.03,
          lowpassHz: 600,
        });
      }
    } else if (step === 0 || step === 8 || step === 14) {
      const semi = step === 0 ? 0 : step === 8 ? 7 : tones[0];
      const dur = step === 14 ? sixteenthSec * 2.4 : sixteenthSec * 5.8;
      this.playInstrument('electric_bass', eBassRoot + semi, when, dur, step === 14 ? 0.22 : 0.31, {
        pan: -0.04,
        lowpassHz: 520,
      });
      if (step !== 14) {
        this.playInstrument('upright_bass', bassRoot + semi, when + 0.003, dur, 0.18, {
          pan: 0.03,
          lowpassHz: 600,
        });
      }
    }

    // 2. Smoky Slow-Leslie Hammond B3 Pad + Dedicated Left Guitarist (`-0.46`) & Right Keyboardist (`+0.44`)!
    if (step === 0) {
      this.playHammondChord(
        [keysBase + tones[0], keysBase + tones[1], chordBase + tones[2]],
        when,
        barDur * 0.92,
        0.048,
        { fastLeslie: false, keyClick: false },
      );
      if (isBridge || thinkVariant === 2) {
        this.playInstrument('strings', chordBase + tones[0] - 12, when, barDur * 0.96, 0.085, {
          pan: -0.32,
          highpassHz: 160,
          lowpassHz: 1950,
        });
        this.playInstrument('strings', chordBase + tones[2] - 12, when, barDur * 0.96, 0.078, {
          pan: 0.32,
          highpassHz: 160,
          lowpassHz: 1950,
        });
      }
    }

    // Dedicated Studio Guitarist on Stage Left (`pan: -0.46`) gently comping warm chords on every *Think!* bed!
    if (step === 2 || step === 10 || (thinkVariant === 1 && (step === 4 || step === 12))) {
      const gtrInst = thinkVariant === 2 ? 'clean_guitar' : 'jazz_guitar';
      this.playInstrument(gtrInst, gtrBase + tones[0], t, sixteenthSec * 4.2, 0.155, {
        pan: -0.46,
        lowpassHz: 1950,
      });
      this.playInstrument(gtrInst, gtrBase + tones[2], t + 0.012, sixteenthSec * 4.2, 0.135, {
        pan: -0.40,
        lowpassHz: 1950,
      });
    }

    // Dedicated Studio Keyboardist on Stage Right (`pan: +0.44`) playing warm 1966 Fender Rhodes & Felt Piano!
    if (step === 0 || step === 6 || (isBridge && step === 12)) {
      this.playInstrument('electric_piano', keysBase + tones[0], t, sixteenthSec * 5.4, 0.165, {
        pan: 0.44,
        lowpassHz: 2050,
      });
      this.playInstrument('electric_piano', chordBase + tones[1], t + 0.010, sixteenthSec * 5.2, 0.14, {
        pan: 0.38,
        lowpassHz: 2050,
      });
      if (step === 0) {
        this.playInstrument('grand_piano', keysBase + tones[2], when + 0.008, sixteenthSec * 5.6, 0.125, {
          pan: 0.34,
          lowpassHz: 1850,
        });
      }
    }

    // 3. Warm Midrange Chamber Melody & Counter-Lines (F3..F4 — ZERO shrill high bells!)
    const thinkBridgeBar = barIdx - 8; // 0..3 when isBridge
    if (thinkVariant === 0) {
      // Bed 0: Classic 1966 Merv *Think!* Warm Low-Mid Vibraphone + Tenor Sax Counter-Whisper
      if (step === 0 || step === 4 || step === 8 || step === 12) {
        const beat = step / 4;
        const vibeMel = isBridge
          ? [
              [9, 12, 16, 12],
              [14, 12, 8, 12],
              [12, 11, 14, 11],
              [9, 10, 12, 16],
            ][thinkBridgeBar][beat]
          : isMajor
            ? [12, 16, 12, 7][beat]
            : [12, 15, 12, 7][beat];
        const rawVibe = root + (!isBridge && barIdx % 2 === 1 && beat === 1 ? vibeMel - 2 : vibeMel);
        const targetVibe = rawVibe > 67 ? rawVibe - 12 : rawVibe;
        this.playInstrument(
          'vibraphone',
          targetVibe,
          when + humanizeOffset(barIdx, step, 1, 0.003),
          sixteenthSec * 4.2,
          beat === 0 ? 0.135 : 0.105,
          { pan: 0.18, lowpassHz: 2250 },
        );
      }
      if ((isBridge || barIdx % 2 === 1) && step === 6) {
        this.playInstrument('tenor_sax', chordBase + tones[0], t, sixteenthSec * 5.4, 0.115, {
          pan: -0.18,
          lowpassHz: 1950,
        });
      }
    } else if (thinkVariant === 1) {
      // Bed 1: Score Productions Wes Montgomery Thumb-Guitar & Woody Low Marimba Lounge
      if (isBridge ? (step === 0 || step === 4 || step === 8 || step === 12) : (step === 0 || step === 6 || step === 10)) {
        const idx = isBridge ? (step / 4) % 3 : step === 0 ? 0 : step === 6 ? 1 : 2;
        const rawNote = chordBase + tones[idx];
        const note = rawNote > 65 ? rawNote - 12 : rawNote;
        this.playInstrument('jazz_guitar', note, t, sixteenthSec * 4.4, 0.145, { pan: -0.34, lowpassHz: 2050 });
        this.playInstrument('marimba', note, t + 0.006, sixteenthSec * 3.6, 0.115, { pan: 0.22, lowpassHz: 2100 });
      }
    } else {
      // Bed 2: Late-Night Fender Rhodes, Tenor Sax & Baritone Sax Lounge Salon
      if (isBridge ? (step === 2 || step === 8 || step === 14) : (step === 0 || step === 8)) {
        const idx = step === 0 ? 1 : step === 8 ? 2 : 0;
        const melNote = chordBase + tones[idx];
        this.playInstrument('tenor_sax', melNote > 65 ? melNote - 12 : melNote, t, sixteenthSec * 5.2, 0.125, {
          pan: -0.16,
          lowpassHz: 2050,
        });
        this.playInstrument('vibraphone', melNote > 67 ? melNote - 12 : melNote, t + 0.005, sixteenthSec * 4.8, 0.105, {
          pan: 0.24,
          lowpassHz: 2200,
        });
      }
      if (step === 0 && barIdx % 2 === 0) {
        this.playInstrument('baritone_sax', bassRoot, when, sixteenthSec * 6.0, 0.105, {
          pan: -0.24,
          lowpassHz: 1750,
        });
      }
    }

    // 4. Soft Felt Kick + Feather-Light Brush Timekeeper
    if (step === 0) {
      this.playDrum('kick', when, 0.13, { pan: 0, lowpassHz: 720 });
    }
    if (step === 4 || step === 12) {
      this.playDrum('snare_brush', when, 0.085, { pan: -0.10, lowpassHz: 2800 });
      this.playDrum('hihat_pedal', when, 0.042, { pan: -0.20, lowpassHz: 3200 });
    }
    if (thinkVariant === 1 && step % 4 === 2) {
      this.playDrum('bongo_lo', t, 0.058, { pan: 0.20, lowpassHz: 1900 });
    } else if (step === 8) {
      this.playDrum('snare_rim', when, 0.052, { pan: -0.12, lowpassHz: 2400 });
    }
    if ((barIdx === 3 || barIdx === 7 || barIdx === 11 || barIdx === 15) && step === 14) {
      this.playDrum('tom_mid', t, 0.075, { playbackRate: 0.92, pan: 0.16, lowpassHz: 1850 });
      this.playDrum('snare_brush', t + sixteenthSec * 0.5, 0.068, { pan: -0.12, lowpassHz: 2600 });
    }
  }

  /**
   * Authentic 1966 Hal Blaine / Ed Shaughnessy Studio Drummer Turnaround Fills
   * on Bars 3, 7 (Bridge Launch!), 11 (Bridge Exit!), and 15 (16-Bar Showband Turnaround!).
   */
  private scheduleShowbandTurnaroundFill(
    barIdx: number,
    step: number,
    stepsPerBar: number,
    when: number,
    swungWhen: number,
    sixteenthSec: number,
    style: 'SWING' | 'BOSSA' | 'GOGO' | 'NOIR',
  ): void {
    if (barIdx !== 3 && barIdx !== 7 && barIdx !== 11 && barIdx !== 15) return;
    const end4 = stepsPerBar - 4; // 12 in 4/4, 16 in 5/4
    const end2 = stepsPerBar - 2; // 14 in 4/4, 18 in 5/4
    const end6 = stepsPerBar - 6; // 10 in 4/4, 14 in 5/4
    const scale = style === 'NOIR' ? 0.72 : 1.0;

    if (barIdx === 3) {
      // Bar 3 (A1 -> A2): Crisp snare/rim + bongo wink
      if (step === end4) {
        this.playDrum(style === 'BOSSA' ? 'bongo_hi' : 'snare_rim', when, 0.12 * scale, { pan: 0.16 });
      } else if (step === end2) {
        this.playDrum(style === 'NOIR' ? 'snare_brush' : 'snare_stick', swungWhen, 0.14 * scale, { pan: -0.10 });
        this.playDrum('bongo_lo', swungWhen + 0.006, 0.11 * scale, { pan: 0.24 });
      }
    } else if (barIdx === 7) {
      // Bar 7 (A2 -> Bars 8-11 Soaring Bridge Launch!): Snare -> High Tom -> Low Tom + Kick!
      if (step === end6) {
        this.playDrum('snare_stick', swungWhen, 0.14 * scale, { pan: -0.14 });
      } else if (step === end4) {
        this.playDrum('tom_mid', when, 0.16 * scale, { playbackRate: 1.16, pan: -0.06 });
        this.playDrum('bongo_hi', when + 0.005, 0.11 * scale, { pan: 0.26 });
      } else if (step === end2) {
        this.playDrum('tom_mid', swungWhen, 0.17 * scale, { playbackRate: 0.90, pan: 0.18 });
        this.playDrum('kick', swungWhen, 0.15 * scale, { pan: 0 });
      }
    } else if (barIdx === 11) {
      // Bar 11 (Bridge -> A3 Homeward Break!): Syncopated Krupa/Shaughnessy tom-bongo-snare whip!
      if (step === end6) {
        this.playDrum('bongo_hi', swungWhen, 0.13 * scale, { pan: 0.24 });
        this.playDrum('snare_stick', swungWhen, 0.13 * scale, { pan: -0.12 });
      } else if (step === end4) {
        this.playDrum('tom_mid', when, 0.16 * scale, { playbackRate: 1.08, pan: 0.08 });
      } else if (step === end2) {
        this.playDrum('snare_stick', swungWhen, 0.18 * scale, { pan: -0.10 });
        this.playDrum('kick', swungWhen, 0.15 * scale, { pan: 0 });
      }
    } else if (barIdx === 15) {
      // Bar 15 (16-Bar Grand Showband Turnaround!): Cascading snare + dual-pitched toms + bongos!
      if (step === end6) {
        this.playDrum('snare_stick', swungWhen, 0.15 * scale, { pan: -0.14 });
      } else if (step === end4) {
        this.playDrum('tom_mid', when, 0.17 * scale, { playbackRate: 1.18, pan: -0.12 });
        this.playDrum('bongo_hi', when + 0.004, 0.12 * scale, { pan: 0.28 });
      } else if (step === end2) {
        this.playDrum('tom_mid', swungWhen, 0.18 * scale, { playbackRate: 0.88, pan: 0.18 });
        this.playDrum('snare_stick', swungWhen + 0.008, 0.17 * scale, { pan: -0.08 });
        this.playDrum('kick', swungWhen, 0.16 * scale, { pan: 0 });
      }
    }
  }

  /**
   * 5-Song 16-Bar (`A1 - A2 - B - A3`) 1966 Network Showband Chart Performer!
   * Plays genuinely distinct 1966 band compositions with soaring Bars 8–11 Bridges:
   * - `0`: *Tijuana Brass Bounce* (Herb Alpert / Dating Game trumpets + marimba)
   * - `1`: *30 Rock Big-Band Swing Strut* (Doc Severinsen / Take Ten walking swing)
   * - `2`: *Sunset Strip Bossa Nova* (Quincy Jones / Sergio Mendes '66 bossa clave)
   * - `3`: *Burbank Soul-Organ Go-Go* (Booker T. / Laugh-In fast-Leslie B3 & mod beat)
   * - `4`: *Midnight Penthouse Showstopper* (High-Stakes Prime-Time Double-Dollars!)
   */
  private scheduleMultiChart16BarShowband(opts: {
    chart: SongChartVariantIdV7;
    scene: ShowbandSceneIdV7;
    barIdx: number;
    step: number;
    stepsPerBar: number;
    when: number;
    t: number;
    sixteenthSec: number;
    barDur: number;
    root: number;
    bassRoot: number;
    chordBase: number;
    chordTones: readonly [number, number, number];
  }): void {
    const {
      chart,
      scene,
      barIdx,
      step,
      stepsPerBar,
      when,
      t,
      sixteenthSec,
      barDur,
      root,
      bassRoot,
      chordBase,
      chordTones,
    } = opts;
    const isBridge = barIdx >= 8 && barIdx <= 11;
    const isFinalA = barIdx >= 12;
    const phraseBar = barIdx % 4; // 0..3 inside each 4-bar section

    // Authentic 1966 Bill Putnam / Bones Howe 5-Musician Studio Separation (#240):
    // - ONE Master Bassist per chart (Chart 0/3/4 = Fender Precision `electric_bass` solo; Chart 1/2 = Ray Brown `upright_bass` solo; ZERO dual-bass phase mud!).
    // - `gtrBase`:   F3..C4 (53..60) crisp Left Guitarist (`pan: -0.48`, +2.2 dB up-front dry pocket)!
    // - `keysBase`:  F3..D4 (53..62) clear Right Rhodes / Steinway Keyboardist (`pan: +0.46`, +2.2 dB up-front dry pocket)!
    // - `warmHorn`:  marcato/staccato midrange brass & reeds (`F3..Bb4`) with -4 dB pad trim so the 4-piece rhythm section breathes with >=10.5 dB crest!
    const eBassRoot = bassRoot >= 38 ? bassRoot - 12 : bassRoot;
    const gtrBase = chordBase;
    const keysBase = chordBase;
    const warmHorn = (m: number): number => (m > 70 ? m - 12 : m);

    // Whisper-tucked orchestral string sheen (-4.5 dB trim, 220Hz HPF so zero low-mid mud!)
    if (step === 0) {
      if (
        scene === 'STAGE_02_IBC_PRIMETIME_JUBILEE' ||
        scene === 'STAGE_08_WORLDS_FAIR_GEODESIC' ||
        scene === 'STAGE_10_SOVEREIGN_SANCTUM' ||
        (isBridge && (chart === 2 || chart === 4))
      ) {
        const strGain = isBridge ? 0.068 : 0.056;
        this.playInstrument('strings', chordBase + chordTones[0] - 12, when, barDur * 0.78, strGain, {
          pan: -0.34,
          highpassHz: 220,
          lowpassHz: 2350,
        });
        this.playInstrument('strings', chordBase + chordTones[2] - 12, when, barDur * 0.78, strGain * 0.9, {
          pan: 0.34,
          highpassHz: 220,
          lowpassHz: 2350,
        });
      }
      if (barIdx === 0 || barIdx === 8 || barIdx === 12) {
        this.playDrum('crash', when, barIdx === 8 ? 0.095 : 0.078, {
          pan: -0.28,
          durationSec: 0.92,
        });
      }
    }
    if (scene === 'STAGE_06_ATLANTIC_CITY_PIER' && (step === 0 || step === 6 || step === 10)) {
      this.playDrum('bongo_lo', t, 0.115, { pan: 0.26 });
    }
    if (scene === 'STAGE_08_WORLDS_FAIR_GEODESIC' && (step === 2 || step === 10)) {
      const exoNote = warmHorn(chordBase + chordTones[step === 2 ? 1 : 2]);
      this.playInstrument('vibraphone', exoNote, t, sixteenthSec * 3.4, 0.105, {
        pan: step === 2 ? -0.34 : 0.34,
      });
    }

    // ========================================================================
    // BESPOKE 5-CHART B-SECTION BRIDGES (Bars 8-11: IVmaj7 -> ivm6 -> iii7 -> V13)!
    // Crystal-Clear 5-Musician Separation: 1 Solo Bassist, Crisp Kit, Left Guitar (-0.48), Right Keys (+0.46), Marcato Horns!
    // ========================================================================
    if (isBridge) {
      // 1. SINGLE MASTER BASSIST PER CHART (Chart 1 & 2 = Upright Bass Solo; Chart 0, 3 & 4 = Electric Bass Solo!)
      if (chart === 2) {
        if (step === 0 || step === 6 || step === 8 || step === 14) {
          const bossaBr = step === 0 ? 0 : step === 6 ? chordTones[0] : step === 8 ? 7 : phraseBar === 3 ? 9 : 4;
          const bDur = step === 0 || step === 8 ? sixteenthSec * 3.8 : sixteenthSec * 2.0;
          this.playInstrument('upright_bass', bassRoot + bossaBr, when + humanizeOffset(barIdx, step, 8, 0.003), bDur, step === 0 ? 0.36 : 0.29, { pan: -0.02 });
        }
      } else if (chart === 1) {
        if (step % 4 === 0 && step < 16) {
          const swingBridgeClimbs: ReadonlyArray<readonly [number, number, number, number]> = [
            [0, 4, 7, 9],
            [0, 3, 7, 6],
            [0, 3, 6, 7],
            [0, 4, 7, 11],
          ];
          const bSemi = swingBridgeClimbs[phraseBar][step / 4];
          this.playInstrument('upright_bass', bassRoot + bSemi, when + humanizeOffset(barIdx, step, 8, 0.003), sixteenthSec * 3.0, step === 0 ? 0.37 : 0.31, { pan: -0.02 });
        }
      } else {
        if (step % 4 === 0 && step < 16) {
          const elecBridgeClimbs: ReadonlyArray<readonly [number, number, number, number]> = [
            [0, 4, 7, 9],
            [0, 3, 7, 6],
            [0, 3, 7, 10],
            [0, 4, 7, 9],
          ];
          const bSemi = elecBridgeClimbs[phraseBar][step / 4];
          this.playInstrument('electric_bass', eBassRoot + bSemi, when + humanizeOffset(barIdx, step, 8, 0.003), sixteenthSec * 2.9, step === 0 ? 0.36 : 0.30, { pan: -0.03 });
        } else if ((chart === 0 || chart === 3) && (step === 6 || step === 14)) {
          // Carol Kaye / Duck Dunn syncopated eighth-note bass pickup!
          this.playInstrument('electric_bass', eBassRoot + (step === 6 ? 7 : 12), t, sixteenthSec * 1.65, 0.25, { pan: -0.03 });
        }
      }

      // 2. Right-Channel Fender Rhodes & Steinway Comping (`pan: +0.46`, +2.2 dB) + Tucked Rhythmic Hammond B3 Stabs (-4 dB)!
      if ((chart === 3 && (step === 0 || step === 6 || step === 12)) || (chart !== 3 && step === 0 && phraseBar % 2 === 0)) {
        this.playHammondChord(
          [keysBase + chordTones[0], keysBase + chordTones[1], keysBase + chordTones[2]],
          t,
          sixteenthSec * 2.8,
          chart === 3 ? 0.052 : 0.042,
          { soulful: true, fastLeslie: true, keyClick: true },
        );
      }
      if (step === 0 || step === 6 || step === 12) {
        this.playInstrument('electric_piano', keysBase + chordTones[0], t, sixteenthSec * 3.1, 0.245, { pan: 0.46 });
        this.playInstrument('electric_piano', keysBase + chordTones[2], t + 0.007, sixteenthSec * 2.9, 0.205, { pan: 0.40 });
        if (step !== 6) {
          this.playInstrument('grand_piano', keysBase + chordTones[1], t + 0.005, sixteenthSec * 2.8, 0.21, { pan: 0.36 });
        }
      }

      // 3. Dedicated Left-Channel Guitarist (`pan: -0.48`, +2.2 dB) + Crisp Hal Blaine Drum Pocket
      if (chart === 2) {
        if (step === 0 || step === 8) this.playDrum('kick', when, 0.24);
        if (step === 0 || step === 6 || step === 12) this.playDrum('snare_rim', when, 0.165, { pan: -0.12 });
        if (step % 2 === 0) this.playDrum('shaker', when, step % 4 === 0 ? 0.075 : 0.048, { pan: -0.24 });
        if (step === 4 || step === 10 || step === 14) this.playDrum(step === 10 ? 'bongo_hi' : 'bongo_lo', when, 0.13, { pan: 0.24 });
        if (step === 0 || step === 4 || step === 6 || step === 10 || step === 12) {
          this.playInstrument('jazz_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.5, 0.25, { pan: -0.48 });
          this.playInstrument('jazz_guitar', gtrBase + chordTones[2], when + 0.008, sixteenthSec * 2.4, 0.21, { pan: -0.40 });
        }
      } else if (chart === 3) {
        if (step === 0 || step === 6 || step === 8) this.playDrum('kick', t, step === 0 ? 0.27 : 0.20);
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.21, { pan: -0.10 });
          this.playDrum('tambourine', when + 0.004, 0.095, { pan: 0.30 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.0, 0.275, { pan: -0.48 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[1], when + 0.006, sixteenthSec * 1.9, 0.225, { pan: -0.42 });
        }
        if (step === 2 || step === 10) {
          this.playInstrument('clean_guitar', gtrBase + chordTones[2], t, sixteenthSec * 1.8, 0.22, { pan: -0.48 });
          this.playDrum('bongo_lo', t, 0.125, { pan: 0.24 });
        }
        if (step % 2 === 0) this.playDrum('hihat_closed', t, step % 4 === 0 ? 0.09 : 0.06, { pan: -0.22 });
      } else {
        if (step === 0 || step === 8) this.playDrum('kick', when, step === 0 ? 0.26 : 0.19);
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.135 : 0.09, { pan: 0.26, durationSec: 0.38 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('hihat_pedal', when, 0.125, { pan: -0.20 });
          this.playDrum(chart === 4 ? 'snare_stick' : 'snare_brush', when, 0.20, { pan: -0.10 });
        }
        // Freddie Green / Tommy Tedesco crisp rhythm guitar chucks on Stage Left (`-0.48`)!
        if (step % 4 === 0 || (chart === 0 && (step === 6 || step === 14))) {
          const gInst = chart === 1 ? 'jazz_guitar' : 'clean_guitar';
          this.playInstrument(gInst, gtrBase + chordTones[0], t, sixteenthSec * 2.1, 0.255, { pan: -0.48 });
          this.playInstrument('jazz_guitar', gtrBase + chordTones[2], t + 0.007, sixteenthSec * 2.0, 0.21, { pan: -0.40 });
        }
      }

      // 4. Five Marcato/Staccato 1966 Bridge Melodies (Crisp Horn Punch + Breathing Gaps for Rhythm Section!)
      if (chart === 0) {
        const tijBridge: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
          { 0: [9, 5, 2.0], 4: [12, 9, 1.7], 6: [16, 12, 2.8] },
          { 0: [14, 8, 2.0], 4: [12, 8, 1.7], 6: [8, 5, 2.8] },
          { 0: [7, 4, 2.0], 4: [11, 7, 1.7], 6: [14, 11, 2.8] },
          { 0: [9, 4, 2.1], 4: [10, 5, 2.1], 8: [12, 7, 2.2], 12: [16, 10, 2.6] },
        ];
        const hit0 = tijBridge[phraseBar][step];
        if (hit0) {
          const [leadS, harmS, d16] = hit0;
          const dur = sixteenthSec * d16;
          const leadM = warmHorn(root + leadS);
          const harmM = warmHorn(root + harmS);
          this.playInstrument('trumpet', leadM, t, dur, 0.15, { pan: 0.16 });
          this.playInstrument('muted_trumpet', harmM, t + 0.006, dur * 0.92, 0.12, { pan: -0.14 });
          this.playInstrument('marimba', leadM, t, dur * 0.85, 0.145, { pan: 0.26 });
          this.playInstrument('trombone', root + harmS - 12, t + 0.005, dur * 0.85, 0.105, { pan: -0.22 });
        }
        if (phraseBar < 3 && step === 14) {
          const ansDur = sixteenthSec * 1.8;
          this.playInstrument('tenor_sax', chordBase + chordTones[0], t, ansDur, 0.135, { pan: -0.18 });
          this.playInstrument('trombone', chordBase + chordTones[0] - 12, t + 0.005, ansDur, 0.11, { pan: -0.26 });
          this.playInstrument('baritone_sax', bassRoot + chordTones[0], t + 0.006, ansDur, 0.105, { pan: 0.20 });
        }
      } else if (chart === 1) {
        const saxSoli: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [5, 1.9], 2: [9, 1.7], 6: [12, 2.6] },
          { 0: [8, 1.9], 2: [12, 1.7], 6: [14, 2.6] },
          { 0: [7, 1.9], 2: [11, 1.7], 6: [14, 2.6] },
          { 0: [9, 2.2], 4: [12, 2.2], 8: [14, 2.2], 12: [16, 2.6] },
        ];
        const sx = saxSoli[phraseBar][step];
        if (sx) {
          const [semi, d16] = sx;
          const dur = sixteenthSec * d16;
          this.playInstrument('tenor_sax', warmHorn(root + semi), t, dur, 0.155, { pan: -0.16 });
          this.playInstrument('baritone_sax', bassRoot + (semi % 12), t + 0.006, dur * 0.88, 0.11, { pan: -0.26 });
          this.playInstrument('vibraphone', warmHorn(root + semi), t + 0.004, dur * 0.95, 0.13, { pan: 0.24 });
          if (phraseBar === 3) {
            this.playInstrument('brass', warmHorn(root + semi), t, dur * 0.9, 0.135, { pan: 0.18 });
            this.playInstrument('trombone', root + semi - 12, t + 0.006, dur * 0.85, 0.11, { pan: 0.24 });
          }
        }
        if (phraseBar < 3 && step === 14) {
          const kickDur = sixteenthSec * 1.8;
          this.playInstrument('brass', chordBase + chordTones[0], t, kickDur, 0.135, { pan: 0.20 });
          this.playInstrument('trombone', chordBase + chordTones[0] - 12, t, kickDur, 0.11, { pan: -0.22 });
          this.playInstrument('baritone_sax', bassRoot + 7, t, kickDur, 0.105, { pan: 0.26 });
        }
      } else if (chart === 2) {
        const bossaBridge: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
          { 0: [16, 9, 4.2], 8: [12, 5, 4.2] },
          { 0: [14, 8, 4.2], 8: [8, 5, 4.2] },
          { 0: [11, 7, 4.2], 8: [14, 7, 4.2] },
          { 0: [16, 9, 2.8], 6: [14, 10, 2.6], 12: [12, 7, 2.8] },
        ];
        const bBr = bossaBridge[phraseBar][step];
        if (bBr) {
          const [leadS, saxS, d16] = bBr;
          const dur = sixteenthSec * d16;
          this.playInstrument('tenor_sax', warmHorn(root + leadS), when, dur, 0.155, { pan: -0.16 });
          this.playInstrument('muted_trumpet', warmHorn(root + saxS), when + 0.008, dur * 0.92, 0.125, { pan: 0.18 });
          this.playInstrument('vibraphone', warmHorn(root + leadS), when + 0.005, dur, 0.125, { pan: 0.26 });
        }
      } else if (chart === 3) {
        const organSolo: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [9, 2.0], 4: [12, 1.6], 6: [14, 2.2], 10: [16, 2.4] },
          { 0: [14, 2.0], 4: [12, 1.6], 6: [8, 2.2], 10: [5, 2.4] },
          { 0: [7, 2.0], 4: [11, 1.6], 6: [12, 2.2], 10: [14, 2.4] },
          { 0: [9, 1.9], 4: [10, 1.9], 8: [12, 2.0], 12: [16, 2.4] },
        ];
        const orgNote = organSolo[phraseBar][step];
        if (orgNote) {
          const [semi, d16] = orgNote;
          const oMidi = warmHorn(root + semi);
          this.playHammondB3Note(oMidi, t, sixteenthSec * d16, 0.062, {
            soulful: true,
            fastLeslie: true,
            keyClick: true,
          });
          this.playInstrument('electric_piano', oMidi, t + 0.004, sixteenthSec * d16 * 0.9, 0.215, { pan: 0.44 });
        }
        if (step === 14) {
          const stDur = sixteenthSec * 1.75;
          this.playInstrument('baritone_sax', bassRoot + chordTones[0], t, stDur, 0.12, { pan: -0.24 });
          this.playInstrument('trombone', chordBase + chordTones[0] - 12, t + 0.004, stDur, 0.115, { pan: -0.18 });
          this.playInstrument('tenor_sax', chordBase + chordTones[2], t + 0.006, stDur, 0.13, { pan: 0.20 });
          this.playInstrument('brass', chordBase + chordTones[0], t, stDur, 0.125, { pan: 0.16 });
        }
      } else {
        if (step === 0 || (phraseBar === 3 && (step === 8 || step === 12))) {
          this.playInstrument('timpani', bassRoot + (step >= 8 ? 7 : 0), when, sixteenthSec * 3.0, 0.175, { pan: -0.12 });
        }
        const penthouseBridge: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
          { 0: [12, 5, 2.5], 6: [16, 9, 2.2], 10: [17, 12, 3.0] },
          { 0: [14, 8, 2.6], 6: [12, 5, 2.2], 10: [8, 5, 2.8] },
          { 0: [11, 4, 2.5], 6: [12, 7, 2.2], 10: [14, 11, 3.0] },
          { 0: [10, 4, 2.2], 4: [12, 7, 2.2], 8: [16, 9, 2.3], 12: [19, 12, 2.6] },
        ];
        const pBr = penthouseBridge[phraseBar][step];
        if (pBr) {
          const [leadS, lowS, d16] = pBr;
          const dur = sixteenthSec * d16;
          this.playInstrument('trumpet', warmHorn(root + leadS), t, dur, 0.15, { pan: 0.18 });
          this.playInstrument('brass', warmHorn(root + lowS), t + 0.005, dur * 0.9, 0.135, { pan: -0.22 });
          this.playInstrument('trombone', root + lowS - 12, t + 0.008, dur * 0.85, 0.115, { pan: 0.24 });
          this.playInstrument('baritone_sax', bassRoot + (lowS % 12), t + 0.006, dur * 0.85, 0.11, { pan: -0.26 });
        }
      }

      this.scheduleShowbandTurnaroundFill(
        barIdx,
        step,
        stepsPerBar,
        when,
        t,
        sixteenthSec,
        chart === 2 ? 'BOSSA' : chart === 3 ? 'GOGO' : 'SWING',
      );
      return;
    }

    // ========================================================================
    // A-Sections (Bars 0-3 `A1`, Bars 4-7 `A2`, Bars 12-15 `A3` Climactic Return):
    // ========================================================================
    const section8Idx = isFinalA ? phraseBar + 4 : barIdx;

    // Marcato A3 Climactic Homeward Horn & Sax Tag on Bars 14-15
    if (isFinalA && barIdx >= 14 && (step === 0 || step === 10)) {
      const tagSemi = barIdx === 14 ? (step === 0 ? 9 : 14) : (step === 0 ? 16 : 12);
      this.playInstrument('tenor_sax', warmHorn(root + tagSemi), t, sixteenthSec * 2.2, 0.13, { pan: -0.22 });
      this.playInstrument('trombone', root + tagSemi - 12, t + 0.005, sixteenthSec * 2.0, 0.105, { pan: 0.24 });
    }

    switch (chart) {
      case 0: {
        // CHART 0: Tijuana Brass & Wrecking Crew Bounce (Title & Daytime Studio 6A!)
        // 1. SOLO MASTER BASSIST: Carol Kaye Fender Precision Electric Bass (Zero Dual-Bass Mud!)
        if (step === 0 || step === 4 || step === 8 || step === 12) {
          const walkIntervals = [0, chordTones[0], 7, phraseBar === 3 ? 11 : 9];
          const bSemi = walkIntervals[step / 4];
          this.playInstrument(
            'electric_bass',
            eBassRoot + bSemi,
            when + humanizeOffset(barIdx, step, 1, 0.003),
            sixteenthSec * 2.85,
            step === 0 ? 0.36 : 0.30,
            { pan: -0.03 },
          );
        } else if (step === 6 || step === 14) {
          // Syncopated Wrecking Crew 8th-note bass octave/fifth bounce!
          this.playInstrument('electric_bass', eBassRoot + (step === 6 ? 7 : 12), t, sixteenthSec * 1.6, 0.24, { pan: -0.03 });
        }

        // 2. Crisp Hal Blaine Kick + Articulate Brush/Ride/Bongo Pocket
        if (step === 0 || step === 8 || (step === 6 && phraseBar % 2 === 1)) {
          this.playDrum('kick', t, step === 0 ? 0.26 : 0.19, { pan: 0 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.13 : 0.088, { pan: 0.26, durationSec: 0.38 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('hihat_pedal', when, 0.125, { pan: -0.20 });
          this.playDrum('snare_brush', when, 0.205, { pan: -0.10 });
          if (barIdx >= 4) {
            this.playDrum('bongo_lo', when + 0.005, 0.125, { pan: 0.26 });
          }
        }

        // 3. DEDICATED LEFT GUITARIST (`pan: -0.48`, +2.2 dB): Tommy Tedesco / Al Caiola Crisp Comp Chucks!
        if (step === 2 || step === 4 || step === 6 || step === 10 || step === 12 || step === 14) {
          const isBackbeat = step === 4 || step === 12;
          this.playInstrument(
            isBackbeat ? 'clean_guitar' : 'jazz_guitar',
            gtrBase + chordTones[0],
            t,
            sixteenthSec * (isBackbeat ? 1.9 : 1.7),
            isBackbeat ? 0.265 : 0.215,
            { pan: -0.48 },
          );
          if (isBackbeat || step === 6) {
            this.playInstrument('jazz_guitar', gtrBase + chordTones[2], t + 0.008, sixteenthSec * 1.85, 0.215, { pan: -0.40 });
          }
        }

        // 4. DEDICATED RIGHT KEYBOARDIST (`pan: +0.46`, +2.2 dB): Larry Knechtel Fender Rhodes + Steinway!
        if (step === 0 || step === 6 || step === 10) {
          this.playInstrument('electric_piano', keysBase + chordTones[0], t, sixteenthSec * 2.8, step === 0 ? 0.255 : 0.215, { pan: 0.46 });
          this.playInstrument('electric_piano', keysBase + chordTones[1], t + 0.008, sixteenthSec * 2.6, 0.21, { pan: 0.40 });
          if (step !== 10) {
            this.playInstrument('grand_piano', keysBase + chordTones[2], t + 0.005, sixteenthSec * 2.7, 0.205, { pan: 0.36 });
          }
        }
        // Tucked short B3 accent only on Bar 0/4/12 downbeat (-4.5 dB, never a continuous pad!)
        if (step === 0 && phraseBar % 2 === 0) {
          this.playHammondChord(
            [keysBase + chordTones[0], keysBase + chordTones[1]],
            when,
            sixteenthSec * 2.6,
            0.040,
            { fastLeslie: isFinalA, keyClick: true },
          );
        }

        // 5. STACCATO / MARCATO TIJUANA HORNS & WOODY MARIMBA (Crisp Notes + Open Pocket Gaps!)
        const tijuanaLead: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
          { 0: [4, 0, 2.0], 4: [7, 4, 1.5], 6: [9, 4, 2.2], 10: [7, 4, 2.5] },
          { 0: [4, 0, 2.6], 6: [2, -3, 1.5], 8: [0, -3, 2.4] },
          { 0: [5, 2, 2.0], 4: [9, 5, 1.5], 6: [7, 2, 2.2], 10: [5, 2, 2.5] },
          { 0: [7, 4, 2.6], 6: [5, 2, 1.5], 8: [4, -1, 2.3] },
          { 0: [7, 4, 2.0], 4: [9, 4, 1.5], 6: [12, 7, 2.3], 10: [11, 7, 2.5] },
          { 0: [9, 4, 2.6], 6: [7, 1, 1.5], 8: [4, 1, 2.4] },
          { 0: [5, 2, 2.0], 4: [9, 5, 1.5], 6: [7, 2, 2.2], 10: [5, 2, 2.4] },
          { 0: [4, 0, 2.2], 4: [7, 4, 1.9] },
        ];
        const hit = tijuanaLead[section8Idx][step];
        if (hit) {
          const [leadSemi, harmSemi, dur16] = hit;
          const noteDur = sixteenthSec * dur16;
          const leadMidi = warmHorn(root + leadSemi);
          const harmMidi = warmHorn(root + harmSemi);
          this.playInstrument('trumpet', leadMidi, t, noteDur, 0.148, { pan: 0.16 });
          this.playInstrument('muted_trumpet', harmMidi, t + 0.007, noteDur * 0.92, 0.118, { pan: -0.14 });
          this.playInstrument('marimba', leadMidi, t, noteDur * 0.85, 0.145, { pan: 0.26 });
        }
        if (phraseBar === 3 && barIdx !== 15 && step === 12) {
          this.playInstrument('brass', chordBase + chordTones[0], when, sixteenthSec * 1.9, 0.135, { pan: -0.24 });
          this.playInstrument('trombone', chordBase + chordTones[0] - 12, when, sixteenthSec * 1.9, 0.11, { pan: 0.22 });
          this.playInstrument('baritone_sax', bassRoot + chordTones[0], when + 0.006, sixteenthSec * 1.9, 0.105, { pan: -0.28 });
        } else if (barIdx === 15 && (step === 8 || step === 12 || step === 14)) {
          const punchDur = step === 14 ? sixteenthSec * 2.6 : sixteenthSec * 1.6;
          const shift = step === 14 ? 2 : 0;
          this.playInstrument('brass', chordBase + chordTones[0] + shift, t, punchDur, 0.155, { pan: -0.26 });
          this.playInstrument('trombone', chordBase - 5 + shift, t, punchDur, 0.125, { pan: 0.24 });
          this.playInstrument('baritone_sax', bassRoot + shift, t, punchDur, 0.12, { pan: -0.28 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'SWING');
        break;
      }

      case 1: {
        // CHART 1: 30 Rock Big-Band Swing Strut (Count Basie / Doc Severinsen / Freddie Green 16-Bar!)
        // 1. SOLO MASTER BASSIST: Ray Brown Walking Acoustic Upright Bass (Zero Electric Bass Doubling!)
        if (step % 4 === 0) {
          const walkSeq = [0, chordTones[0], 7, phraseBar % 2 === 0 ? 9 : chordTones[2] - 1];
          const wSemi = walkSeq[step / 4];
          this.playInstrument(
            'upright_bass',
            bassRoot + wSemi,
            when + humanizeOffset(barIdx, step, 2, 0.003),
            sixteenthSec * 3.05,
            step === 0 ? 0.37 : 0.31,
            { pan: -0.02 },
          );
        }
        if (step === 0 || step === 8 || (step === 10 && phraseBar % 2 === 1)) {
          this.playDrum('kick', t, step === 0 ? 0.24 : 0.17, { pan: 0 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.14 : 0.095, { pan: 0.26, durationSec: 0.40 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('hihat_pedal', when, 0.13, { pan: -0.20 });
          this.playDrum('snare_brush', when, 0.205, { pan: -0.12 });
        }

        // 2. DEDICATED LEFT GUITARIST (`pan: -0.48`, +2.2 dB): Freddie Green 4-to-the-Bar Rhythm Guitar Chucks!
        if (step % 4 === 0) {
          this.playInstrument('jazz_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.0, 0.275, { pan: -0.48 });
          this.playInstrument('jazz_guitar', gtrBase + chordTones[2], when + 0.006, sixteenthSec * 1.95, 0.225, { pan: -0.40 });
        } else if (step === 14 && phraseBar % 2 === 0) {
          this.playInstrument('clean_guitar', gtrBase + chordTones[1], t, sixteenthSec * 1.7, 0.215, { pan: -0.46 });
        }

        // 3. DEDICATED RIGHT KEYBOARDIST (`pan: +0.46`, +2.2 dB): Count Basie Steinway Comping + Fender Rhodes!
        if (step === 0 || step === 6 || (step === 10 && phraseBar % 2 === 0) || (step === 12 && phraseBar % 2 === 1)) {
          this.playInstrument('grand_piano', keysBase + chordTones[0], t, sixteenthSec * 2.8, 0.255, { pan: 0.46 });
          this.playInstrument('grand_piano', keysBase + chordTones[2], t + 0.008, sixteenthSec * 2.7, 0.215, { pan: 0.40 });
          this.playInstrument('electric_piano', keysBase + chordTones[1], t + 0.005, sixteenthSec * 2.8, 0.215, { pan: 0.42 });
        }
        if (step === 0 && (phraseBar === 3 || isFinalA)) {
          this.playHammondChord(
            [keysBase + chordTones[0], keysBase + chordTones[1]],
            when,
            sixteenthSec * 2.8,
            0.042,
            { fastLeslie: true, keyClick: true },
          );
        }

        // 4. Marcato Sax & Muted-Brass Swing Phrases (Count Basie Space Between Stabs!)
        const swingStrutHook: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [7, 2.0], 6: [9, 1.9], 10: [12, 2.7] },
          { 0: [9, 2.2], 6: [7, 1.7], 10: [4, 2.5] },
          { 0: [5, 2.0], 6: [7, 1.9], 10: [9, 2.6] },
          { 0: [7, 2.2], 4: [5, 1.7], 8: [4, 2.3] },
          { 0: [7, 2.0], 6: [11, 1.9], 10: [14, 2.7] },
          { 0: [12, 2.2], 6: [9, 1.7], 10: [6, 2.5] },
          { 0: [5, 2.0], 4: [7, 1.7], 8: [9, 2.2], 12: [7, 2.0] },
          { 0: [4, 2.2], 6: [7, 1.9], 10: [12, 2.4] },
        ];
        const mHit = swingStrutHook[section8Idx][step];
        if (mHit) {
          const [semi, dur16] = mHit;
          const melMidi = warmHorn(root + semi);
          this.playInstrument('tenor_sax', melMidi, t, sixteenthSec * dur16, 0.155, { pan: -0.16 });
          this.playInstrument('vibraphone', melMidi, t + 0.004, sixteenthSec * dur16 * 0.98, 0.135, { pan: 0.24 });
          this.playInstrument(isFinalA ? 'trumpet' : 'muted_trumpet', melMidi, t + 0.006, sixteenthSec * dur16 * 0.9, 0.125, { pan: 0.18 });
        }
        if (phraseBar === 3 && step === 14) {
          this.playInstrument('brass', chordBase + chordTones[0], t, sixteenthSec * 1.9, 0.14, { pan: -0.24 });
          this.playInstrument('trombone', chordBase - 5, t, sixteenthSec * 1.9, 0.115, { pan: 0.22 });
          this.playInstrument('baritone_sax', bassRoot + 7, t, sixteenthSec * 1.9, 0.11, { pan: -0.28 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'SWING');
        break;
      }

      case 2: {
        // CHART 2: Sunset Strip Bossa Nova (Quincy Jones / Sergio Mendes / Joao Gilberto 16-Bar!)
        // 1. SOLO MASTER BASSIST: Warm Acoustic Upright Bass Bossa Pulse (Zero Electric Bass Doubling!)
        if (step === 0 || step === 6 || step === 8 || step === 14) {
          const bossaBass = step === 0 ? 0 : step === 6 ? 7 : step === 8 ? 7 : chordTones[0];
          const bDur = step === 0 || step === 8 ? sixteenthSec * 3.8 : sixteenthSec * 1.9;
          this.playInstrument('upright_bass', bassRoot + bossaBass, when + humanizeOffset(barIdx, step, 5, 0.003), bDur, step === 0 ? 0.36 : 0.29, { pan: -0.02 });
        }
        if (step === 0 || step === 8) {
          this.playDrum('kick', when, step === 0 ? 0.23 : 0.17);
        }
        const claveSteps = phraseBar % 2 === 0 ? [0, 6, 12] : [2, 8, 12];
        if (claveSteps.includes(step)) {
          this.playDrum('snare_rim', when, 0.175, { pan: -0.14 });
        }
        if (step % 2 === 0) {
          this.playDrum('shaker', when, step % 4 === 0 ? 0.075 : 0.048, { pan: -0.24 });
        }
        if (step === 4 || step === 10 || step === 14) {
          this.playDrum(step === 10 ? 'bongo_hi' : 'bongo_lo', when, 0.125, { pan: 0.26 });
        }

        // DEDICATED LEFT GUITARIST (`pan: -0.48`, +2.2 dB): Joao Gilberto Syncopated Bossa Chords!
        if (step === 0 || step === 4 || step === 6 || step === 10 || step === 14) {
          this.playInstrument('jazz_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.3, 0.265, { pan: -0.48 });
          this.playInstrument('jazz_guitar', gtrBase + chordTones[2], when + 0.007, sixteenthSec * 2.2, 0.22, { pan: -0.40 });
        }

        // DEDICATED RIGHT KEYBOARDIST (`pan: +0.46`, +2.2 dB): Sergio Mendes Fender Rhodes + Steinway!
        if (step === 0 || step === 6 || step === 12) {
          this.playInstrument('electric_piano', keysBase + chordTones[1], when + 0.004, sixteenthSec * 3.2, 0.25, { pan: 0.46 });
          this.playInstrument('grand_piano', keysBase + chordTones[2], when + 0.009, sixteenthSec * 3.0, 0.21, { pan: 0.38 });
        }

        // Airy Stan Getz Tenor Sax + Muted Trumpet + Vibraphone
        const bossaHook: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [9, 2.6], 6: [7, 2.0], 10: [4, 2.8] },
          { 2: [4, 2.0], 6: [7, 2.2], 10: [9, 2.8] },
          { 0: [10, 2.6], 6: [9, 2.0], 10: [5, 2.8] },
          { 2: [7, 2.2], 6: [9, 2.2], 10: [12, 2.8] },
          { 0: [12, 2.6], 6: [11, 2.0], 10: [7, 2.8] },
          { 2: [9, 2.2], 6: [6, 2.2], 10: [4, 2.8] },
          { 0: [5, 2.4], 6: [9, 2.2], 10: [7, 2.6] },
          { 0: [4, 2.6], 6: [7, 2.0], 10: [9, 2.5] },
        ];
        const bNote = bossaHook[section8Idx][step];
        if (bNote) {
          const [semi, dur16] = bNote;
          const mel = warmHorn(root + semi);
          const dur = sixteenthSec * dur16;
          this.playInstrument('tenor_sax', mel, when, dur, 0.155, { pan: -0.16 });
          this.playInstrument('muted_trumpet', mel, when + 0.006, dur * 0.92, 0.12, { pan: 0.16 });
          this.playInstrument('vibraphone', mel, when + 0.004, dur, 0.125, { pan: 0.26 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, when, sixteenthSec, 'BOSSA');
        break;
      }

      case 3: {
        // CHART 3: Burbank Soul-Organ Go-Go (Booker T. & The M.G.'s / Stax Rhythm Section 16-Bar!)
        // 1. SOLO MASTER BASSIST: Duck Dunn / Jamerson Syncopated Fender Bass (Zero Upright Doubling!)
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 10 || step === 12 || step === 14) {
          const gogoMap: Record<number, number> = {
            0: 0,
            4: chordTones[0],
            6: 7,
            8: 0,
            10: 7,
            12: phraseBar % 2 === 0 ? 9 : 5,
            14: 7,
          };
          const bSemi = gogoMap[step] ?? 0;
          const isMain = step % 4 === 0;
          this.playInstrument(
            'electric_bass',
            eBassRoot + bSemi,
            t + humanizeOffset(barIdx, step, 4, 0.003),
            isMain ? sixteenthSec * 2.4 : sixteenthSec * 1.6,
            step === 0 ? 0.37 : isMain ? 0.31 : 0.24,
            { pan: -0.03 },
          );
        }

        // 2. Al Jackson Jr. Tight Stax Kick & Snare Backbeat Pocket
        if (step === 0 || step === 6 || step === 8) {
          this.playDrum('kick', t, step === 0 ? 0.27 : 0.20);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.215, { pan: -0.10 });
          this.playDrum('tambourine', when + 0.004, 0.095, { pan: 0.30 });
        }
        if (step % 2 === 0) {
          this.playDrum('hihat_closed', t, step % 4 === 0 ? 0.095 : 0.062, { pan: -0.22 });
        }
        if (step === 2 || step === 10) {
          this.playDrum('bongo_lo', t, 0.12, { pan: 0.24 });
        }

        // 3. DEDICATED LEFT GUITARIST (`pan: -0.48`, +2.2 dB): Steve Cropper Clean Telecaster Backbeat Chops & Riffs!
        if (step === 4 || step === 12) {
          this.playInstrument('clean_guitar', gtrBase + chordTones[0], when, sixteenthSec * 1.85, 0.285, { pan: -0.48 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[1], when + 0.006, sixteenthSec * 1.8, 0.235, { pan: -0.40 });
        } else if (step === 2 || step === 6 || step === 14) {
          const riffSemi = step === 2 ? 0 : step === 6 ? chordTones[0] : 7;
          this.playInstrument('clean_guitar', gtrBase + riffSemi, t, sixteenthSec * 1.75, 0.23, { pan: -0.48 });
        }

        // 4. DEDICATED RIGHT KEYBOARDIST (`pan: +0.46`, +2.2 dB): Booker T. Short Percussive B3 Stabs (-4 dB) + Fender Rhodes!
        if (step === 0 || step === 6 || step === 10 || (step === 12 && phraseBar % 2 === 1)) {
          this.playHammondChord(
            [keysBase + chordTones[0], keysBase + chordTones[1], keysBase + chordTones[2]],
            t,
            sixteenthSec * 2.2,
            0.052,
            { soulful: true, fastLeslie: true, keyClick: true },
          );
          this.playInstrument('electric_piano', keysBase + chordTones[0], t + 0.004, sixteenthSec * 2.6, 0.255, { pan: 0.46 });
          this.playInstrument('electric_piano', keysBase + chordTones[2], t + 0.009, sixteenthSec * 2.5, 0.21, { pan: 0.40 });
        }

        // 5. Staccato Memphis Horns (Tight Punchy Hits + Open Funk Pocket!)
        const burbankHook: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [4, 1.8], 4: [7, 1.4], 6: [9, 2.0], 10: [7, 2.1] },
          { 0: [4, 2.1], 6: [2, 1.4], 8: [0, 2.1] },
          { 0: [5, 1.8], 4: [9, 1.4], 6: [7, 2.0], 10: [5, 2.1] },
          { 0: [4, 2.0], 6: [7, 1.7], 10: [11, 2.0] },
          { 0: [12, 1.9], 4: [11, 1.4], 6: [9, 2.0], 10: [7, 2.1] },
          { 0: [9, 2.1], 6: [7, 1.4], 8: [4, 2.1] },
          { 0: [5, 1.8], 4: [7, 1.4], 6: [9, 2.0], 10: [7, 2.0] },
          { 0: [4, 2.0], 6: [7, 1.8], 10: [12, 2.1] },
        ];
        const bHit = burbankHook[section8Idx][step];
        if (bHit) {
          const [semi, dur16] = bHit;
          const melMidi = warmHorn(root + semi);
          this.playInstrument('tenor_sax', melMidi, t, sixteenthSec * dur16, 0.148, { pan: 0.16 });
          this.playInstrument('trombone', melMidi - 12, t + 0.005, sixteenthSec * dur16 * 0.88, 0.11, { pan: -0.18 });
          this.playInstrument('marimba', melMidi, t, sixteenthSec * dur16 * 0.85, 0.13, { pan: 0.26 });
        }
        if (phraseBar === 3 && step === 14) {
          this.playInstrument('baritone_sax', bassRoot + chordTones[0], t, sixteenthSec * 1.8, 0.12, { pan: -0.26 });
          this.playInstrument('trombone', chordBase - 5, t, sixteenthSec * 1.8, 0.115, { pan: 0.22 });
          this.playInstrument('brass', chordBase + chordTones[0], t, sixteenthSec * 1.8, 0.13, { pan: -0.20 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'GOGO');
        break;
      }

      case 4: {
        // CHART 4: Midnight Penthouse Showstopper (Prime-Time Gala / Double-Dollars Wrecking Crew!)
        // 1. SOLO MASTER BASSIST: Fender Precision Electric Bass + Timpani Downbeat Accent
        if (step === 0 && phraseBar % 2 === 0) {
          this.playInstrument('timpani', bassRoot, when, sixteenthSec * 3.0, 0.165, { pan: -0.12 });
          this.playHammondChord(
            [keysBase + chordTones[0], keysBase + chordTones[1], keysBase + chordTones[2]],
            when,
            sixteenthSec * 2.8,
            0.046,
            { soulful: true, fastLeslie: true, keyClick: true },
          );
        }
        if (step % 4 === 0 || step === 6 || step === 14) {
          const w = step === 6 ? 7 : step === 14 ? 12 : [0, chordTones[0], 7, phraseBar === 3 ? 11 : 9][step / 4];
          const isBeat = step % 4 === 0;
          this.playInstrument('electric_bass', eBassRoot + w, t + humanizeOffset(barIdx, step, 9, 0.003), isBeat ? sixteenthSec * 2.85 : sixteenthSec * 1.65, step === 0 ? 0.36 : isBeat ? 0.30 : 0.24, { pan: -0.03 });
        }
        if (step === 0 || step === 8) {
          this.playDrum('kick', when, step === 0 ? 0.26 : 0.19);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.205, { pan: -0.10 });
          this.playDrum('hihat_pedal', when, 0.12, { pan: -0.20 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.13 : 0.088, { pan: 0.26, durationSec: 0.38 });
        }

        // DEDICATED LEFT GUITARIST (`pan: -0.48`, +2.2 dB) & RIGHT KEYBOARDIST (`pan: +0.46`, +2.2 dB)
        if (step === 0 || step === 4 || step === 8 || step === 12 || step === 14) {
          this.playInstrument('clean_guitar', gtrBase + chordTones[0], t, sixteenthSec * 2.0, 0.255, { pan: -0.48 });
          if (step === 4 || step === 12) {
            this.playInstrument('jazz_guitar', gtrBase + chordTones[2], when + 0.007, sixteenthSec * 2.0, 0.215, { pan: -0.40 });
          }
        }
        if (step === 0 || step === 6 || step === 12) {
          this.playInstrument('grand_piano', keysBase + chordTones[0], t, sixteenthSec * 2.9, 0.245, { pan: 0.46 });
          this.playInstrument('electric_piano', keysBase + chordTones[1], t + 0.007, sixteenthSec * 2.9, 0.23, { pan: 0.40 });
        }

        const showstopperLead: ReadonlyArray<Record<number, readonly [number, number]>> = [
          { 0: [4, 2.4], 6: [7, 2.0], 10: [12, 2.8] },
          { 0: [9, 2.6], 8: [7, 2.4] },
          { 0: [5, 2.4], 6: [9, 2.0], 10: [12, 2.8] },
          { 0: [7, 2.4], 8: [9, 2.0], 12: [12, 2.2] },
          { 0: [12, 2.4], 6: [11, 2.0], 10: [9, 2.8] },
          { 0: [9, 2.6], 8: [6, 2.4] },
          { 0: [5, 2.2], 6: [7, 1.9], 10: [9, 2.6] },
          { 0: [7, 2.2], 8: [12, 1.9], 12: [16, 2.4] },
        ];
        const sHit = showstopperLead[section8Idx][step];
        if (sHit) {
          const [semi, dur16] = sHit;
          const leadMidi = warmHorn(root + semi);
          const dur = sixteenthSec * dur16;
          this.playInstrument('trumpet', leadMidi, t, dur, 0.15, { pan: 0.18 });
          this.playInstrument('brass', warmHorn(leadMidi - 5), t + 0.005, dur * 0.9, 0.135, { pan: -0.22 });
          this.playInstrument('trombone', root + semi - 12, t + 0.007, dur * 0.85, 0.115, { pan: 0.24 });
          this.playInstrument('baritone_sax', bassRoot + (semi % 12), t + 0.006, dur * 0.85, 0.11, { pan: -0.26 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'SWING');
        break;
      }
    }
  }

  /**
   * 16-Bar (`A-A-B-A`, ~32s full song cycle!) 1966 Living Color Network Showband
   * Orchestrator across all 12 scenes & 5 rotating Song Charts!
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

    const barIdx = bar % SHOWBAND_LOOP_BARS;

    // When reading a clue (except high-urgency Trapdoor Blitz), glide seamlessly into 16-bar *Think!* bed
    if (this.clueSanctuaryActive && scene !== 'TRAPDOOR_BLITZ') {
      this.scheduleMervThinkBed(spec, barIdx, step, stepsPerBar, when, sixteenthSec);
      return;
    }

    const root = spec.rootMidi;
    const barDur = sixteenthSec * stepsPerBar;
    const isBridge = barIdx >= 8 && barIdx <= 11;
    const phraseBar = barIdx % 4;

    // Full 16-Bar (`A1 - A2 - B - A3`) 1966 Studio Jazz & Showband Harmonic Progressions!
    // Major:
    //   A1 (0..3):  I6 | vi7 | ii7 | V13
    //   A2 (4..7):  Imaj7 | VI7 | ii7 | I9 (V9/IV launching into Bridge!)
    //   B  (8..11): IVmaj7 | ivm6 | iii7 | V13 (Soaring Subdominant/Chromatic Bridge!)
    //   A3 (12..15): I6 | VI7 | ii9 | V13 (Climactic Return & Big-Band Turnaround!)
    const majorRoots = [0, 9, 2, 7, 0, 9, 2, 0, 5, 5, 4, 7, 0, 9, 2, 7];
    const majorVoicings: ReadonlyArray<readonly [number, number, number]> = [
      [4, 7, 9],   // 0: I6
      [3, 7, 10],  // 1: vi7
      [3, 7, 10],  // 2: ii7
      [4, 9, 10],  // 3: V13
      [4, 7, 11],  // 4: Imaj7
      [4, 7, 10],  // 5: VI7
      [3, 7, 10],  // 6: ii7
      [4, 10, 14], // 7: I9 (secondary dominant into IVmaj7!)
      [4, 7, 11],  // 8: IVmaj7 (Soaring Bridge!)
      [3, 7, 9],   // 9: ivm6
      [3, 7, 10],  // 10: iii7
      [4, 9, 10],  // 11: V13
      [4, 7, 9],   // 12: I6
      [4, 7, 10],  // 13: VI7
      [3, 7, 14],  // 14: ii9
      [4, 9, 10],  // 15: V13
    ];

    // Noir / Suspense 16-Bar (`A1 - A2 - B - A3`):
    //   A1 (0..3):  im9 | bVImaj7 | ivm7 | V7b9
    //   A2 (4..7):  im7 | bIIImaj7 | iim7b5 | V7b9
    //   B  (8..11): ivm9 | bVII9 | bIIImaj7 | V7b9 (Cinematic Noir/Spy Bridge!)
    //   A3 (12..15): im9 | bVImaj7 | iim7b5 | V7b9
    const noirRoots = [0, 8, 5, 7, 0, 3, 2, 7, 5, 10, 3, 7, 0, 8, 2, 7];
    const noirVoicings: ReadonlyArray<readonly [number, number, number]> = [
      [3, 7, 14],  // 0: im9
      [4, 7, 11],  // 1: bVImaj7
      [3, 7, 10],  // 2: ivm7
      [4, 10, 13], // 3: V7b9
      [3, 7, 10],  // 4: im7
      [4, 7, 11],  // 5: bIIImaj7
      [3, 6, 10],  // 6: iim7b5
      [4, 10, 13], // 7: V7b9
      [3, 7, 14],  // 8: ivm9 (Bridge!)
      [4, 7, 10],  // 9: bVII9
      [4, 7, 11],  // 10: bIIImaj7
      [4, 10, 13], // 11: V7b9
      [3, 7, 14],  // 12: im9
      [4, 7, 11],  // 13: bVImaj7
      [3, 6, 10],  // 14: iim7b5
      [4, 10, 13], // 15: V7b9
    ];

    const isMajor = spec.motifMode === 'MAJOR_6';
    const degShift = (isMajor ? majorRoots : noirRoots)[barIdx];
    const chordTones = (isMajor ? majorVoicings : noirVoicings)[barIdx];
    const bassRoot = root - 12 + (degShift > 6 ? degShift - 12 : degShift);
    const eBassRoot = bassRoot >= 38 ? bassRoot - 12 : bassRoot;
    const chordBase = root + (degShift > 7 ? degShift - 12 : degShift);
    const gtrBase = chordBase;
    const keysBase = chordBase;
    const warmOuter = (m: number): number => (m > 70 ? m - 12 : m);

    // Authentic 59% jazz swing ratio on off-beat eighth notes (steps 2, 6, 10, 14)
    const swingOffset = step % 4 === 2 ? sixteenthSec * 0.34 : 0;
    const t = when + swingOffset;

    switch (scene) {
      case 'GREEN_ROOM':
      case 'STAGE_01_IBC_DAYTIME_FUNK':
      case 'STAGE_02_IBC_PRIMETIME_JUBILEE':
      case 'STAGE_03_1926_VAUDEVILLE_PIT':
      case 'STAGE_06_ATLANTIC_CITY_PIER': {
        this.scheduleMultiChart16BarShowband({
          chart: this.songChartVariant,
          scene,
          barIdx,
          step,
          stepsPerBar,
          when,
          t,
          sixteenthSec,
          barDur,
          root,
          bassRoot,
          chordBase,
          chordTones,
        });
        break;
      }

      case 'STAGE_04_1958_ISOLATION_VAULT': {
        if (step === 0) {
          this.playInstrument('timpani', bassRoot, when, sixteenthSec * 4.4, isBridge ? 0.18 : 0.15, { pan: -0.14, lowpassHz: 480 });
          this.playInstrument('strings', chordBase - 12, when, barDur * 0.85, isBridge ? 0.075 : 0.062, { pan: -0.32, highpassHz: 210, lowpassHz: 2050 });
          this.playInstrument('strings', chordBase + chordTones[0] - 12, when, barDur * 0.85, isBridge ? 0.068 : 0.056, { pan: 0.32, highpassHz: 210, lowpassHz: 2050 });
          this.playHammondChord([keysBase + chordTones[0], keysBase + chordTones[1]], when, sixteenthSec * 3.4, isBridge ? 0.042 : 0.034, {
            fastLeslie: isBridge,
          });
        }
        if (isBridge ? step % 4 === 0 : step === 0 || step === 8) {
          const climb = isBridge ? [0, chordTones[0], 7, 10][step / 4] : step === 8 ? 7 : 0;
          this.playInstrument('upright_bass', bassRoot + climb, when, sixteenthSec * 3.6, 0.35, { pan: -0.02 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_brush', when, 0.145, { pan: -0.14, lowpassHz: 3200 });
          this.playInstrument('jazz_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.8, 0.225, { pan: -0.48 });
          this.playInstrument('electric_piano', keysBase + chordTones[1], when + 0.008, sixteenthSec * 3.2, 0.22, { pan: 0.46 });
        }
        if (isBridge) {
          const isoBridge: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
            { 0: [12, 3, 3.6], 8: [10, 7, 3.8] },
            { 0: [14, 7, 3.6], 8: [10, 4, 3.8] },
            { 0: [11, 4, 3.6], 8: [7, 0, 3.8] },
            { 0: [10, 4, 2.8], 6: [13, 7, 2.8], 12: [16, 10, 3.0] },
          ];
          const ib = isoBridge[phraseBar][step];
          if (ib) {
            const [trpS, saxS, d16] = ib;
            this.playInstrument('muted_trumpet', warmOuter(chordBase + trpS), t, sixteenthSec * d16, 0.14, { pan: 0.18 });
            this.playInstrument('tenor_sax', warmOuter(chordBase + saxS), t + 0.008, sixteenthSec * d16, 0.145, { pan: -0.20 });
          }
        } else if (barIdx % 2 === 0 && (step === 6 || step === 10)) {
          const noirSemi = step === 6 ? chordTones[0] : chordTones[1];
          this.playInstrument('muted_trumpet', warmOuter(chordBase + noirSemi), t, sixteenthSec * 3.2, 0.135, { pan: 0.18 });
        } else if (barIdx % 2 === 1 && (step === 4 || step === 10)) {
          const saxSemi = step === 4 ? chordTones[2] : chordTones[0];
          this.playInstrument('tenor_sax', warmOuter(chordBase + saxSemi), t, sixteenthSec * 3.4, 0.145, { pan: -0.18 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'NOIR');
        break;
      }

      case 'STAGE_05_1984_LARSON_CRT_LAB': {
        if (step === 0 || (isBridge && step === 6)) {
          if (step === 0) this.playDrum('kick', when, 0.25);
          this.playHammondChord(
            [keysBase + chordTones[0], keysBase + chordTones[1], keysBase + chordTones[2]],
            t,
            sixteenthSec * 2.8,
            0.048,
            { soulful: true, fastLeslie: isBridge || phraseBar === 3, keyClick: true },
          );
        }
        if (isBridge ? step % 4 === 0 : step === 0 || step === 6 || step === 8 || step === 12) {
          const walk = isBridge ? [0, chordTones[0], 7, 10][step / 4] : step === 12 ? 7 : 0;
          this.playInstrument('electric_bass', eBassRoot + walk, t, sixteenthSec * 2.8, 0.35, { pan: -0.03 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_rim', when, 0.195, { pan: -0.12 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.2, 0.245, { pan: -0.48 });
        }
        if (step % 2 === 0) {
          this.playDrum('hihat_closed', t, step % 4 === 0 ? 0.09 : 0.06, { pan: 0.20 });
        }
        if (step === 2 || step === 10) {
          this.playInstrument('electric_piano', keysBase + chordTones[1], t, sixteenthSec * 3.0, 0.235, { pan: 0.46 });
          this.playInstrument('grand_piano', keysBase + chordTones[0], t + 0.006, sixteenthSec * 2.8, 0.195, { pan: 0.38 });
        }
        if (isBridge) {
          const apolloBr: ReadonlyArray<Record<number, readonly [number, number]>> = [
            { 0: [7, 2.6], 6: [10, 2.2], 12: [14, 2.6] },
            { 0: [12, 2.8], 6: [10, 2.2], 12: [7, 2.6] },
            { 0: [11, 2.6], 6: [7, 2.2], 12: [4, 2.6] },
            { 0: [4, 2.2], 4: [7, 2.2], 8: [10, 2.2], 12: [13, 2.5] },
          ];
          const ab = apolloBr[phraseBar][step];
          if (ab) {
            this.playInstrument('tenor_sax', warmOuter(chordBase + ab[0]), t, sixteenthSec * ab[1], 0.155, { pan: -0.18 });
            this.playInstrument('jazz_guitar', warmOuter(chordBase + ab[0]), t + 0.006, sixteenthSec * ab[1] * 0.85, 0.205, { pan: -0.44 });
          }
          if (step === 8 && phraseBar < 3) {
            this.playInstrument('baritone_sax', bassRoot + chordTones[0], t, sixteenthSec * 2.0, 0.115, { pan: 0.22 });
          }
        } else if (barIdx % 2 === 1 && (step === 0 || step === 6)) {
          this.playInstrument('tenor_sax', warmOuter(chordBase + (step === 0 ? 10 : 7)), t, sixteenthSec * 2.8, 0.15, { pan: -0.16 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'NOIR');
        break;
      }

      case 'STAGE_07_1969_MONTE_CARLO_CASINO': {
        const spyBass: Record<number, number> = isBridge
          ? { 0: 0, 4: chordTones[0], 8: 7, 12: 10, 16: 7 }
          : { 0: 0, 6: 0, 12: 5, 16: 3 };
        if (step in spyBass && step < stepsPerBar) {
          this.playInstrument('upright_bass', bassRoot + spyBass[step], when, sixteenthSec * 3.0, step === 0 ? 0.37 : 0.31, { pan: -0.02 });
          if (step === 0 || step === 12) {
            this.playDrum('kick', when, step === 0 ? 0.24 : 0.18);
          }
        }
        if (step === 0) {
          this.playInstrument('strings', chordBase + chordTones[0] - 12, when, barDur * 0.82, isBridge ? 0.072 : 0.06, { pan: -0.34, highpassHz: 210 });
          this.playInstrument('strings', chordBase + chordTones[2] - 12, when, barDur * 0.82, isBridge ? 0.066 : 0.055, { pan: 0.34, highpassHz: 210 });
          this.playHammondChord([keysBase + chordTones[0], keysBase + chordTones[1]], when, sixteenthSec * 3.0, isBridge ? 0.045 : 0.036, {
            soulful: true,
            fastLeslie: isBridge,
          });
        }
        if (step === 0 || step === 6 || (step === 12 && step < stepsPerBar)) {
          this.playInstrument('jazz_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.6, 0.245, { pan: -0.48 });
          this.playInstrument('electric_piano', keysBase + chordTones[1], when + 0.006, sixteenthSec * 3.0, 0.235, { pan: 0.46 });
          if (step !== 6) {
            this.playInstrument('grand_piano', keysBase + chordTones[2], when + 0.010, sixteenthSec * 2.8, 0.20, { pan: 0.38 });
          }
        }
        if (step === 0 || step === 6 || step === 12 || (step === 16 && step < stepsPerBar)) {
          this.playDrum(step === 12 ? 'bongo_hi' : 'bongo_lo', when, 0.13, { pan: 0.24 });
        }
        if (step % 4 === 0 && step < stepsPerBar) {
          this.playDrum('ride', when, 0.11, { pan: 0.26, durationSec: 0.34 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_rim', when, 0.165, { pan: -0.12 });
        }
        if (isBridge && step < stepsPerBar) {
          const mcBridge: ReadonlyArray<Record<number, readonly [number, number]>> = [
            { 0: [14, 3.0], 6: [12, 2.8], 12: [10, 2.8], 16: [7, 2.6] },
            { 0: [10, 3.0], 6: [14, 2.8], 12: [16, 2.8], 16: [14, 2.6] },
            { 0: [11, 3.0], 6: [14, 2.8], 12: [16, 2.8], 16: [11, 2.6] },
            { 0: [7, 2.6], 6: [10, 2.6], 12: [13, 2.8], 16: [16, 2.6] },
          ];
          const mcb = mcBridge[phraseBar][step];
          if (mcb) {
            const [semi, d16] = mcb;
            this.playInstrument('muted_trumpet', warmOuter(chordBase + semi), when, sixteenthSec * d16, 0.145, { pan: 0.18 });
            this.playInstrument('tenor_sax', warmOuter(chordBase + semi - 12), when + 0.006, sixteenthSec * d16, 0.15, { pan: -0.18 });
            if (step === 0 || step === 12) {
              this.playInstrument('baritone_sax', bassRoot + chordTones[0], when, sixteenthSec * 2.4, 0.115, { pan: -0.26 });
            }
          }
        } else if (barIdx % 2 === 0 && (step === 0 || step === 6 || step === 12)) {
          const spyMel = step === 0 ? 15 : step === 6 ? 14 : 12;
          this.playInstrument('muted_trumpet', warmOuter(chordBase + spyMel), when, sixteenthSec * 2.6, 0.14, { pan: 0.18 });
          this.playInstrument('vibraphone', warmOuter(chordBase + spyMel), when, sixteenthSec * 3.0, 0.125, { pan: 0.24 });
        } else if (barIdx % 2 === 1 && (step === 6 || step === 12)) {
          const loungeAns = step === 6 ? chordTones[2] : chordTones[0];
          this.playInstrument('tenor_sax', warmOuter(chordBase + loungeAns), when, sixteenthSec * 3.0, 0.15, { pan: -0.16 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, when, sixteenthSec, 'BOSSA');
        break;
      }

      case 'STAGE_08_WORLDS_FAIR_GEODESIC': {
        if (this.explicitChartOverride) {
          this.scheduleMultiChart16BarShowband({
            chart: this.songChartVariant,
            scene,
            barIdx,
            step,
            stepsPerBar,
            when,
            t,
            sixteenthSec,
            barDur,
            root,
            bassRoot,
            chordBase,
            chordTones,
          });
          break;
        }
        if (step === 0) {
          this.playDrum('kick', when, 0.24);
          this.playInstrument('strings', chordBase + chordTones[0] - 12, when, barDur * 0.85, isBridge ? 0.072 : 0.06, { pan: -0.36, highpassHz: 210 });
          this.playInstrument('strings', chordBase + chordTones[2] - 12, when, barDur * 0.85, isBridge ? 0.066 : 0.055, { pan: 0.36, highpassHz: 210 });
          this.playHammondChord([keysBase + chordTones[0], keysBase + chordTones[1]], when, sixteenthSec * 3.0, 0.042, {
            fastLeslie: true,
          });
        }
        if (isBridge ? step % 4 === 0 : step === 0 || step === 8) {
          const walk = isBridge ? [0, chordTones[0], 7, 9][step / 4] : step === 8 ? 7 : 0;
          this.playInstrument('upright_bass', bassRoot + walk, when, sixteenthSec * 3.6, 0.36, { pan: -0.02 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_brush', when, 0.175, { pan: -0.12 });
          this.playDrum('bongo_lo', when + 0.008, 0.125, { pan: 0.26 });
          this.playInstrument('jazz_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.5, 0.245, { pan: -0.48 });
        }
        if (step === 0 || step === 6) {
          this.playInstrument('electric_piano', keysBase + chordTones[1], t, sixteenthSec * 3.2, 0.24, { pan: 0.46 });
        }
        if (step === 2 || step === 6 || step === 10 || step === 14) {
          const tone = warmOuter(chordBase + chordTones[Math.floor(step / 4) % 3]);
          const isLeft = step === 2 || step === 10;
          this.playInstrument(isLeft ? 'marimba' : 'vibraphone', tone, t, sixteenthSec * 3.0, 0.135, {
            pan: isLeft ? -0.32 : 0.32,
          });
        }
        if (isBridge) {
          const wfBridge: ReadonlyArray<Record<number, readonly [number, number, number]>> = [
            { 0: [9, 5, -0.32], 6: [12, 9, 0.32], 10: [16, 12, -0.28] },
            { 0: [14, 8, 0.32], 6: [12, 8, -0.32], 10: [8, 5, 0.28] },
            { 0: [7, 4, -0.32], 6: [11, 7, 0.32], 10: [14, 11, -0.28] },
            { 0: [11, 5, 0.32], 4: [12, 7, -0.32], 8: [14, 9, 0.32], 12: [16, 11, 0] },
          ];
          const wfb = wfBridge[phraseBar][step];
          if (wfb) {
            const [leadS, harmS, panPos] = wfb;
            this.playInstrument('muted_trumpet', warmOuter(root + leadS), t, sixteenthSec * 2.6, 0.145, { pan: panPos });
            this.playInstrument('tenor_sax', warmOuter(root + harmS), t + 0.005, sixteenthSec * 2.6, 0.145, { pan: -panPos });
            this.playInstrument('trombone', root + harmS - 12, t + 0.008, sixteenthSec * 2.4, 0.115, { pan: -panPos * 0.7 });
          }
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'BOSSA');
        break;
      }

      case 'STAGE_09_CHANNEL_83_UHF_BARGE': {
        if (step === 0 || step === 6) {
          this.playHammondChord(
            [keysBase + chordTones[0], keysBase + chordTones[1], keysBase + chordTones[2]],
            t,
            sixteenthSec * 2.4,
            0.052,
            { soulful: true, fastLeslie: true, keyClick: true },
          );
          this.playInstrument('electric_piano', keysBase + chordTones[0], t + 0.005, sixteenthSec * 2.8, 0.245, { pan: 0.46 });
        }
        if (isBridge ? step % 4 === 0 : step === 0 || step === 6 || step === 8 || step === 14) {
          const walk = isBridge ? [0, chordTones[0], 7, 10][step / 4] : step === 6 ? 3 : step === 14 ? 7 : 0;
          this.playInstrument('electric_bass', eBassRoot + walk, t, sixteenthSec * 2.5, step === 0 ? 0.37 : 0.30, { pan: -0.03 });
        }
        if (step === 0 || step === 10) {
          this.playDrum('kick', t, step === 0 ? 0.27 : 0.20);
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.21, { pan: -0.12 });
          this.playDrum('hihat_pedal', when, 0.12, { pan: -0.20 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.0, 0.27, { pan: -0.48 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[1], when + 0.007, sixteenthSec * 1.9, 0.22, { pan: -0.40 });
        }
        if (step === 0 || step === 4 || step === 6 || step === 8 || step === 12 || step === 14) {
          this.playDrum('ride', t, step % 4 === 0 ? 0.125 : 0.085, { pan: 0.26, durationSec: 0.36 });
        }
        if (isBridge) {
          const uhfBr: ReadonlyArray<Record<number, readonly [number, number]>> = [
            { 0: [7, 2.0], 4: [10, 1.8], 6: [12, 2.6] },
            { 0: [14, 2.0], 4: [12, 1.8], 6: [10, 2.6] },
            { 0: [11, 2.0], 4: [14, 1.8], 6: [16, 2.6] },
            { 0: [7, 2.0], 4: [10, 2.0], 8: [13, 2.2], 12: [16, 2.5] },
          ];
          const ub = uhfBr[phraseBar][step];
          if (ub) {
            this.playInstrument('tenor_sax', warmOuter(chordBase + ub[0]), t, sixteenthSec * ub[1], 0.155, { pan: 0.18 });
            this.playInstrument('clean_guitar', warmOuter(chordBase + ub[0]), t + 0.006, sixteenthSec * ub[1] * 0.85, 0.225, { pan: -0.44 });
          }
          if (phraseBar < 3 && step === 14) {
            this.playInstrument('baritone_sax', bassRoot + chordTones[0], t, sixteenthSec * 1.9, 0.125, { pan: -0.24 });
            this.playInstrument('trombone', chordBase - 5, t, sixteenthSec * 1.9, 0.115, { pan: 0.22 });
          }
        } else if (barIdx % 2 === 0 && (step === 0 || step === 6 || step === 10)) {
          const blues = step === 0 ? 3 : step === 6 ? 5 : 7;
          this.playInstrument('tenor_sax', warmOuter(chordBase + blues), t, sixteenthSec * 2.5, 0.15, { pan: 0.18 });
        } else if (barIdx % 2 === 1 && (step === 2 || step === 8 || step === 12)) {
          const gtrRiff = step === 2 ? 7 : step === 8 ? 5 : 3;
          this.playInstrument('clean_guitar', warmOuter(chordBase + gtrRiff), t, sixteenthSec * 2.2, 0.225, { pan: -0.44 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'GOGO');
        break;
      }

      case 'STAGE_10_SOVEREIGN_SANCTUM': {
        if (this.explicitChartOverride) {
          this.scheduleMultiChart16BarShowband({
            chart: this.songChartVariant,
            scene,
            barIdx,
            step,
            stepsPerBar,
            when,
            t,
            sixteenthSec,
            barDur,
            root,
            bassRoot,
            chordBase,
            chordTones,
          });
          break;
        }
        if (step === 0) {
          this.playInstrument('timpani', bassRoot, when, sixteenthSec * 3.6, 0.18);
          this.playDrum('kick', when, 0.26);
          this.playInstrument('strings', chordBase + chordTones[0] - 12, when, barDur * 0.85, isBridge ? 0.075 : 0.064, { pan: -0.34, highpassHz: 210 });
          this.playInstrument('strings', chordBase + chordTones[2] - 12, when, barDur * 0.85, isBridge ? 0.068 : 0.058, { pan: 0.34, highpassHz: 210 });
          this.playInstrument('brass', chordBase + chordTones[0], when, sixteenthSec * 2.8, 0.135, { pan: -0.24 });
          this.playInstrument('trombone', chordBase - 5, when, sixteenthSec * 2.8, 0.115, { pan: 0.24 });
          this.playInstrument('baritone_sax', bassRoot, when, sixteenthSec * 2.8, 0.11, { pan: -0.28 });
          this.playHammondChord([keysBase + chordTones[0], keysBase + chordTones[1]], when, sixteenthSec * 3.0, 0.044, {
            soulful: true,
            fastLeslie: true,
            keyClick: true,
          });
        }
        if (isBridge ? step % 4 === 0 : step === 0 || step === 8) {
          const walk = isBridge ? [0, chordTones[0], 7, 10][step / 4] : step === 8 ? 7 : 0;
          this.playInstrument('upright_bass', bassRoot + walk, when, sixteenthSec * 3.8, 0.37, { pan: -0.02 });
        }
        if (step % 4 === 0) {
          const pNotes = [0, chordTones[0], chordTones[1], chordTones[2]];
          this.playInstrument('grand_piano', keysBase + pNotes[step / 4], when, sixteenthSec * 3.0, 0.235, { pan: 0.46 });
          this.playInstrument('electric_piano', keysBase + pNotes[step / 4], when + 0.006, sixteenthSec * 2.9, 0.21, { pan: 0.38 });
          this.playInstrument('clean_guitar', gtrBase + chordTones[0], when, sixteenthSec * 2.2, 0.245, { pan: -0.48 });
        }
        if (isBridge) {
          const sovBr: ReadonlyArray<Record<number, readonly [number, number]>> = [
            { 0: [7, 2.8], 6: [10, 2.4], 10: [14, 3.0] },
            { 0: [14, 2.8], 6: [10, 2.4], 10: [7, 3.0] },
            { 0: [11, 2.8], 6: [14, 2.4], 10: [16, 3.0] },
            { 0: [7, 2.4], 4: [10, 2.4], 8: [13, 2.5], 12: [16, 2.8] },
          ];
          const sb = sovBr[phraseBar][step];
          if (sb) {
            this.playInstrument('trumpet', warmOuter(chordBase + sb[0]), t, sixteenthSec * sb[1], 0.15, { pan: 0.18 });
            this.playInstrument('tenor_sax', warmOuter(chordBase + sb[0]), t + 0.006, sixteenthSec * sb[1], 0.15, { pan: -0.20 });
            if (phraseBar === 3) {
              this.playInstrument('timpani', bassRoot + (step >= 8 ? 7 : 0), when, sixteenthSec * 2.8, 0.175, { pan: -0.14 });
            }
          }
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.20, { pan: -0.10 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, t, sixteenthSec, 'SWING');
        break;
      }

      case 'TRAPDOOR_BLITZ': {
        if (step === 0 || step === 8) {
          this.playDrum('kick', when, 0.27);
          this.playInstrument('timpani', bassRoot + (step === 8 ? 7 : 0), when, sixteenthSec * 3.2, 0.19);
        }
        if (step === 0) {
          this.playHammondChord([keysBase + chordTones[0], keysBase + chordTones[2]], when, barDur * 0.82, 0.082, {
            soulful: true,
            fastLeslie: true,
            keyClick: true,
          });
          this.playInstrument('brass', chordBase + chordTones[0], when, sixteenthSec * 3.8, 0.18, { pan: -0.26 });
          this.playInstrument('baritone_sax', bassRoot + chordTones[0], when, sixteenthSec * 3.8, 0.185, { pan: 0.26 });
        }
        if (step % 2 === 0) {
          const ost = isBridge
            ? [0, 3, 5, 7, 10, 7, 5, 3][(step / 2) % 8]
            : step === 6 || step === 14
              ? 7
              : step === 10
                ? 3
                : 0;
          this.playInstrument('electric_bass', eBassRoot + ost, when, sixteenthSec * 2.1, 0.38, { pan: -0.04 });
          if (step % 4 === 0) {
            this.playInstrument('clean_guitar', gtrBase + ost, when, sixteenthSec * 2.4, 0.20, { pan: -0.46 });
            this.playInstrument('electric_piano', keysBase + chordTones[0], when, sixteenthSec * 2.6, 0.18, { pan: 0.44 });
          }
          this.playDrum('hihat_closed', when, step % 4 === 0 ? 0.09 : 0.055, { pan: 0.22 });
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare_stick', when, 0.18, { pan: -0.10 });
          this.playDrum('bongo_lo', when, 0.115, { pan: 0.26 });
        }
        if (isBridge) {
          const blitzBr: ReadonlyArray<Record<number, number>> = [
            { 0: 7, 6: 10, 12: 14 },
            { 0: 14, 6: 10, 12: 7 },
            { 0: 11, 6: 14, 12: 16 },
            { 0: 7, 4: 10, 8: 13, 12: 16 },
          ];
          const bbSemi = blitzBr[phraseBar][step];
          if (typeof bbSemi === 'number') {
            this.playInstrument('tenor_sax', warmOuter(chordBase + bbSemi), when, sixteenthSec * 2.8, 0.19, { pan: 0.20 });
            this.playInstrument('trombone', chordBase + chordTones[0] - 12, when, sixteenthSec * 2.8, 0.18, { pan: -0.22 });
          }
        } else if (barIdx % 2 === 1 && (step === 6 || step === 12 || step === 14)) {
          this.playInstrument('muted_trumpet', warmOuter(root + (step === 14 ? 10 : 7)), when, sixteenthSec * 2.2, 0.17, { pan: 0.18 });
          this.playInstrument('tenor_sax', root + 3, when, sixteenthSec * 2.2, 0.175, { pan: -0.20 });
        }
        this.scheduleShowbandTurnaroundFill(barIdx, step, stepsPerBar, when, when, sixteenthSec, 'GOGO');
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
   * Iconic 3-note 30-Rock vibraphone/chime network ID -> timpani roll -> dual Tijuana
   * trumpets & brass section flourish -> stereo strings + bell tree + fast-Leslie B3 + walk-on roar!
   */
  public playTitleShowtimeFanfare(): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.22, 2.05, 0.78);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // 0. Iconic 1966 3-Note Network Living-Color Chime Pickup (C5 -> A5 -> F5!)
    const networkIdChimes = [
      { dt: 0.00, midi: 72, pan: -0.26 },
      { dt: 0.09, midi: 81, pan: 0.0 },
      { dt: 0.18, midi: 77, pan: 0.26 },
    ];
    for (const ch of networkIdChimes) {
      this.playInstrument('vibraphone', ch.midi, now + ch.dt, 0.46, 0.23, { dest: sfx, pan: ch.pan, priority: 3 });
      this.playInstrument('tubular_bell', ch.midi, now + ch.dt + 0.005, 0.52, 0.14, { dest: sfx, pan: -ch.pan * 0.6, priority: 2 });
    }

    // 1. Exciting opening timpani pick-up & snare rim snap
    this.playInstrument('timpani', 48, now + 0.10, 0.35, 0.26, { dest: sfx, pan: -0.15, priority: 3 });
    this.playInstrument('timpani', 53, now + 0.22, 0.45, 0.30, { dest: sfx, pan: 0.15, priority: 3 });
    this.playDrum('snare_stick', now + 0.25, 0.22, { dest: sfx, pan: -0.10, priority: 3 });

    // 2. Iconic ascending 1966 TV Living Color Brass + Dual Trumpets in 3rds!
    const fanfareBeats = [
      { dt: 0.27, lead: 72, harm: 69, brass: 60, dur: 0.18 }, // C5 / A4
      { dt: 0.42, lead: 74, harm: 70, brass: 62, dur: 0.18 }, // D5 / Bb4
      { dt: 0.57, lead: 76, harm: 72, brass: 64, dur: 0.19 }, // E5 / C5
      { dt: 0.74, lead: 77, harm: 72, brass: 65, dur: 1.12 }, // F5!! (Grand Living Color Hold!)
    ];

    for (const b of fanfareBeats) {
      const at = now + b.dt;
      this.playInstrument('trumpet', b.lead, at, b.dur, 0.26, { dest: sfx, pan: 0.22, priority: 3 });
      this.playInstrument('trumpet', b.harm, at + 0.008, b.dur * 0.96, 0.19, { dest: sfx, pan: -0.22, priority: 3 });
      this.playInstrument('brass', b.brass, at, b.dur, 0.24, { dest: sfx, pan: 0, priority: 3 });
      this.playInstrument('trombone', b.brass - 12, at, b.dur, 0.20, { dest: sfx, pan: -0.26, priority: 3 });
    }

    // 3. Downbeat Finale Explosion (t + 0.74s): Crash + Stereo Strings + Piano + Glockenspiel + Bell Tree + Hammond B3!
    const climax = now + 0.74;
    this.playDrum('crash', climax, 0.23, { dest: sfx, pan: -0.30, durationSec: 1.55, priority: 3 });
    this.playInstrument('timpani', 53, climax, 0.92, 0.30, { dest: sfx, priority: 3 });
    this.playInstrument('strings', 69, climax, 1.15, 0.14, { dest: sfx, pan: -0.34, highpassHz: 240, priority: 2 });
    this.playInstrument('strings', 77, climax, 1.15, 0.13, { dest: sfx, pan: 0.34, highpassHz: 240, priority: 2 });
    this.playFoley('sleigh_sparkle', climax + 0.02, 0.25, { dest: sfx, pan: 0.32, priority: 3 });

    const sparkleNotes = [65, 69, 72, 74, 77, 81];
    for (let i = 0; i < sparkleNotes.length; i++) {
      this.playInstrument('grand_piano', sparkleNotes[i], climax + i * 0.038, 0.7, 0.16, {
        dest: sfx,
        pan: -0.28 + i * 0.1,
        priority: 2,
      });
      this.playInstrument('glockenspiel', Math.min(MIDI_C6, sparkleNotes[i] + 12), climax + 0.06 + i * 0.045, 0.65, 0.13, {
        dest: sfx,
        pan: 0.26,
        priority: 2,
      });
    }

    this.playHammondChord([65, 69, 72, 74], climax, 1.35, 0.082, {
      soulful: true,
      fastLeslie: true,
      keyClick: true,
    });

    // 4. Roaring Live Studio 6A Audience Walk-On Applause & Cheers!
    this.playCrowd('applause_big', now + 0.48, 0.34, { durationSec: 2.6, attackSec: 0.15 });
    this.playCrowd('cheer_hurray', now + 0.74, 0.25, { durationSec: 2.1, attackSec: 0.12 });
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
      // Comical 1966 *Let's Make a Deal* Plunger-Muted Trombone Section wah-wah-waaaah + crowd groan/laugh!
      const zonk = [
        { dt: 0.0, midi: 58, bend: 57, dur: 0.26 },
        { dt: 0.26, midi: 57, bend: 56, dur: 0.26 },
        { dt: 0.52, midi: 56, bend: 51, dur: 0.68 },
      ];
      for (const z of zonk) {
        this.playInstrument('trombone', z.midi, revealAt + z.dt, z.dur, 0.34, {
          dest: sfx,
          bendToMidi: z.bend,
          wahSweep: true,
          pan: -0.14,
          priority: 3,
        });
        this.playInstrument('muted_trumpet', z.midi + 12, revealAt + z.dt + 0.008, z.dur * 0.92, 0.22, {
          dest: sfx,
          bendToMidi: z.bend + 12,
          wahSweep: true,
          pan: 0.18,
          priority: 2,
        });
      }
      this.playCrowd('cheer_hurray', revealAt + 0.06, 0.24, {
        durationSec: 0.80,
        playbackRate: 0.68,
        lowpassHz: 980,
      });
      this.playCrowd('studio_laugh', revealAt + 0.30, 0.34, { durationSec: 2.2 });
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

  /**
   * Crisp 3-impulse motorized Trilon spindle *clack-clack-lock* + warm studio chime
   * when tapping a board tile!
   */
  public playTileSelectFlip(): void {
    this.haptics.lockThunk();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const microJitter = ((Math.round(this.nowWallMs()) % 5) - 2) * 0.014;

    // Impulse 1 (t+0ms): Motorized Trilon brass spindle release clack + prism air whirr
    this.playFoley('mechanical_clack', now, GAIN_TILE_SELECT_LINEAR, {
      dest: sfx,
      playbackRate: 1.18 + microJitter,
      durationSec: 0.058,
      pan: -0.14,
      priority: 3,
    });
    this.playFoley('brush_sweep', now + 0.018, 0.095, {
      dest: sfx,
      playbackRate: 1.52,
      durationSec: 0.075,
      lowpassHz: 2350,
      priority: 2,
    });

    // Impulse 2 (t+46ms): Mid-rotation prism detent clack
    this.playFoley('flap_click', now + 0.046, GAIN_TILE_SELECT_LINEAR * 0.88, {
      dest: sfx,
      playbackRate: 1.08 + microJitter,
      durationSec: 0.045,
      pan: 0.02,
      priority: 3,
    });
    this.playInstrument('woodblock', 76, now + 0.046, 0.048, 0.105, {
      dest: sfx,
      lowpassHz: 2700,
      priority: 2,
    });

    // Impulse 3 (t+94ms): Solid solenoid stop lock!
    this.playFoley('mechanical_clack', now + 0.094, GAIN_TILE_SELECT_LINEAR * 0.98, {
      dest: sfx,
      playbackRate: 0.86 + microJitter,
      durationSec: 0.072,
      lowpassHz: 2650,
      pan: 0.14,
      priority: 3,
    });

    // Warm 2-note harmonically locked studio vibraphone + glockenspiel confirmation chime
    const rootMidi = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;
    this.playInstrument('vibraphone', rootMidi + 7, now + 0.042, 0.32, 0.185, {
      dest: sfx,
      pan: 0.10,
      priority: 3,
    });
    this.playInstrument('vibraphone', rootMidi + 12, now + 0.092, 0.36, 0.20, {
      dest: sfx,
      pan: 0.18,
      priority: 3,
    });
    this.playInstrument('glockenspiel', Math.min(MIDI_C6, rootMidi + 12), now + 0.095, 0.30, 0.095, {
      dest: sfx,
      pan: -0.12,
      lowpassHz: 4800,
      priority: 2,
    });
  }

  /** Motorized 3-sided Trilon tile flip + solenoid latch + warm vibraphone confirmation. */
  public playTileSelect(): void {
    this.playTileSelectFlip();
  }

  /**
   * Studio Desk Answer Lock-In Sting:
   * - Normal (`isClutch = false`, `~450ms`): Snappy Bakelite studio button latch +
   *   warm muted vibraphone/brass/piano anticipation chord.
   * - Clutch (`isClutch = true`, `~900ms`, close Turns 8–10 / `$500` Vault / Secret Square):
   *   Dramatic *Millionaire / $64,000*-style double timpani heartbeat pulse +
   *   rising snare-brush suspense roll + tense muted horn & strings hold!
   */
  public playAnswerLockInSting(isClutch = false): void {
    if (isClutch) {
      this.haptics.peel(3);
    } else {
      this.haptics.lockThunk();
    }

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi;

    if (!isClutch) {
      // Normal (~450ms): Crisp Bakelite push-button switch + muted vibraphone/brass lock chord
      this.duckMusicForStinger(0.56, 0.36, 0.28);
      this.playFoley('flap_click', now, 0.18, {
        dest: sfx,
        playbackRate: 1.24,
        durationSec: 0.036,
        priority: 3,
      });
      this.playFoley('mechanical_clack', now + 0.012, 0.135, {
        dest: sfx,
        playbackRate: 1.06,
        durationSec: 0.055,
        lowpassHz: 2800,
        priority: 3,
      });

      const chordAt = now + 0.024;
      this.playInstrument('vibraphone', root + 19, chordAt, 0.42, 0.135, {
        dest: sfx,
        pan: 0.18,
        lowpassHz: 3200,
        priority: 3,
      });
      this.playInstrument('vibraphone', root + 24, chordAt + 0.016, 0.41, 0.115, {
        dest: sfx,
        pan: -0.14,
        lowpassHz: 3200,
        priority: 2,
      });
      this.playInstrument('muted_trumpet', root + 19, chordAt + 0.010, 0.38, 0.11, {
        dest: sfx,
        pan: 0.12,
        lowpassHz: 2450,
        priority: 3,
      });
      this.playInstrument('brass', root + 7, chordAt + 0.012, 0.39, 0.105, {
        dest: sfx,
        pan: -0.18,
        lowpassHz: 2100,
        priority: 2,
      });
      this.playInstrument('grand_piano', root + 12, chordAt + 0.008, 0.40, 0.095, {
        dest: sfx,
        pan: -0.22,
        lowpassHz: 2100,
        priority: 2,
      });
      return;
    }

    // Clutch (~900ms): Dramatic studio lights-down timpani heartbeat + snare-brush roll + tense muted horns!
    this.duckMusicForStinger(0.24, 0.90, 0.46);
    this.playFoley('mechanical_clack', now, 0.25, {
      dest: sfx,
      playbackRate: 0.92,
      durationSec: 0.068,
      priority: 3,
    });
    this.playFoley('flap_click', now + 0.014, 0.20, {
      dest: sfx,
      playbackRate: 1.18,
      durationSec: 0.038,
      priority: 3,
    });

    // Double Timpani Heartbeat Pulse ("LUB-DUB... LUB-DUB!") + Low Upright Bass Pedal
    this.playInstrument('upright_bass', root - 12, now + 0.02, 0.85, 0.23, {
      dest: sfx,
      lowpassHz: 440,
      priority: 3,
    });
    const heartbeats = [
      { dt: 0.02, midi: root, gain: 0.26, pan: -0.14 },
      { dt: 0.19, midi: root + 7, gain: 0.29, pan: 0.14 },
      { dt: 0.49, midi: root, gain: 0.25, pan: -0.14 },
      { dt: 0.65, midi: root + 7, gain: 0.30, pan: 0.14 },
    ];
    for (const hb of heartbeats) {
      this.playInstrument('timpani', hb.midi, now + hb.dt, 0.32, hb.gain, {
        dest: sfx,
        pan: hb.pan,
        lowpassHz: 620,
        priority: 3,
      });
    }

    // Crescendoing 7-stroke snare-brush suspense roll across 800ms
    const rollSteps = 7;
    for (let i = 0; i < rollSteps; i++) {
      const u = i / (rollSteps - 1);
      const at = now + 0.05 + i * 0.108;
      this.playDrum('snare_brush', at, 0.075 + u * 0.105, {
        dest: sfx,
        playbackRate: 0.96 + u * 0.16,
        durationSec: 0.16,
        pan: (i % 2 === 0 ? -1 : 1) * 0.12,
        lowpassHz: 3600,
        priority: 2,
      });
    }
    this.playFoley('brush_sweep', now + 0.12, 0.13, {
      dest: sfx,
      playbackRate: 0.92,
      durationSec: 0.72,
      lowpassHz: 2500,
      priority: 2,
    });

    // Tense ~860ms Muted Trumpet + Brass + Trombone + Strings Open-5ths Suspense Hold!
    this.playInstrument('muted_trumpet', root + 19, now + 0.04, 0.84, 0.195, {
      dest: sfx,
      pan: 0.20,
      lowpassHz: 2600,
      priority: 3,
    });
    this.playInstrument('brass', root + 7, now + 0.05, 0.83, 0.18, {
      dest: sfx,
      pan: -0.22,
      lowpassHz: 2200,
      priority: 3,
    });
    this.playInstrument('trombone', root, now + 0.06, 0.82, 0.175, {
      dest: sfx,
      pan: -0.26,
      lowpassHz: 1950,
      priority: 3,
    });
    this.playInstrument('strings', root + 14, now + 0.08, 0.80, 0.13, {
      dest: sfx,
      pan: 0.28,
      highpassHz: 260,
      priority: 2,
    });
    this.playInstrument('vibraphone', root + 24, now + 0.04, 0.84, 0.15, {
      dest: sfx,
      pan: -0.18,
      priority: 2,
    });
  }

  /**
   * Live 1966 Doc Severinsen / Milton DeLugg Studio Band Reactions During Big Moments!
   * - `LEAD_CHANGE`: Punchy ascending big-band brass walk-up + crash!
   * - `HOT_STREAK`: Soulful fast-Leslie Hammond B3 palm gliss + high trumpet shake + applause!
   * - `CLUTCH_POINT`: Tight dramatic timpani + tubular bell + horn stinger!
   * - `RIVAL_FUMBLE`: Cheeky muted-trumpet/trombone *bada-bump* + snare rimshot + crowd *Ooh!*
   * - `LINE_JACKPOT`: Full prime-time showband jackpot fanfare + bell tree + roaring cheer!
   */
  public playBandReaction(kind: BandReactionKindV7): void {
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const rawNow = ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi;

    // Natural studio bandleader phrasing when paired back-to-back with a bell or wrong buzzer:
    let now = rawNow;
    if (kind === 'RIVAL_FUMBLE' && rawNow - this.lastWrongRevealTime < 0.42) {
      now = rawNow + 0.36; // Let Edwards AC buzzer ring first, then hit the cheeky rimshot rib!
    } else if (
      (kind === 'LEAD_CHANGE' || kind === 'HOT_STREAK' || kind === 'LINE_JACKPOT') &&
      rawNow - this.lastCorrectRevealTime < 0.48
    ) {
      now = rawNow + 0.18; // Let solenoid DING! pop cleanly before the horn section erupts!
    }
    if (kind === 'LEAD_CHANGE' || kind === 'HOT_STREAK' || kind === 'LINE_JACKPOT') {
      this.lastBandReactionTime = rawNow;
    }

    switch (kind) {
      case 'LEAD_CHANGE': {
        this.haptics.goldResonance();
        this.duckMusicForStinger(0.32, 0.95, 0.45);

        // 4-step punchy big-band horn & bass walk-up + crash cymbal!
        const walkUp = [
          { dt: 0.00, semi: 0, dur: 0.12 },
          { dt: 0.10, semi: 4, dur: 0.12 },
          { dt: 0.20, semi: 7, dur: 0.12 },
          { dt: 0.31, semi: 12, dur: 0.56 },
        ];
        this.playDrum('snare_stick', now + 0.00, 0.18, { dest: sfx, pan: -0.12, priority: 3 });
        this.playDrum('tom_mid', now + 0.20, 0.18, { dest: sfx, playbackRate: 1.12, priority: 2 });

        for (const w of walkUp) {
          const at = now + w.dt;
          this.playInstrument('trumpet', root + 12 + w.semi, at, w.dur, 0.175, { dest: sfx, pan: 0.22, priority: 3 });
          this.playInstrument('brass', root + 12 + w.semi - 5, at, w.dur, 0.15, { dest: sfx, pan: -0.22, priority: 3 });
          this.playInstrument('trombone', root + w.semi, at, w.dur, 0.135, { dest: sfx, pan: -0.26, priority: 2 });
          this.playInstrument('upright_bass', root - 12 + w.semi, at, w.dur * 1.1, 0.17, { dest: sfx, priority: 2 });
        }

        const hitAt = now + 0.31;
        this.playDrum('crash', hitAt, 0.15, { dest: sfx, pan: -0.28, durationSec: 1.15, priority: 3 });
        this.playDrum('kick', hitAt, 0.15, { dest: sfx, priority: 3 });
        this.playCrowd('cheer_hurray', now + 0.28, 0.165, { durationSec: 1.5, attackSec: 0.10 });
        break;
      }

      case 'HOT_STREAK': {
        this.haptics.correctBloom();
        this.duckMusicForStinger(0.34, 1.10, 0.48);

        // 1. Soulful Booker T. / Jimmy Smith Fast-Leslie Hammond B3 Upward Palm Glissando!
        const glissSemis = [5, 7, 9, 10, 12, 16];
        for (let i = 0; i < glissSemis.length; i++) {
          this.playHammondB3Note(root + 12 + glissSemis[i], now + i * 0.028, 0.12, 0.052, {
            soulful: true,
            fastLeslie: i === 0 ? true : undefined,
            keyClick: i === 0 || i === glissSemis.length - 1,
          });
        }
        const organHoldAt = now + 0.18;
        this.playHammondChord([root + 12, root + 16, root + 19, root + 21], organHoldAt, 0.78, 0.058, {
          soulful: true,
          fastLeslie: true,
          keyClick: true,
        });

        // 2. Exuberant Doc Severinsen High Trumpet Lip-Trill Shake + Tambourine & Snare!
        const shakeNotes = [19, 21, 19, 21, 24];
        for (let i = 0; i < shakeNotes.length; i++) {
          const isLast = i === shakeNotes.length - 1;
          this.playInstrument(
            'trumpet',
            root + 12 + shakeNotes[i],
            now + 0.14 + i * 0.068,
            isLast ? 0.52 : 0.095,
            isLast ? 0.175 : 0.145,
            { dest: sfx, pan: 0.20, priority: 3 },
          );
        }
        this.playInstrument('tenor_sax', root + 16, organHoldAt, 0.65, 0.145, { dest: sfx, pan: -0.20, priority: 2 });
        this.playDrum('snare_stick', organHoldAt, 0.14, { dest: sfx, pan: -0.10, priority: 3 });
        this.playDrum('tambourine', organHoldAt + 0.02, 0.125, { dest: sfx, pan: 0.32, priority: 2 });
        this.playCrowd('applause_warm', now + 0.20, 0.205, { durationSec: 1.9, attackSec: 0.10 });
        this.playCrowd('cheer_hurray', now + 0.30, 0.15, { durationSec: 1.6, attackSec: 0.12 });
        break;
      }

      case 'CLUTCH_POINT': {
        this.haptics.peel(2);
        this.duckMusicForStinger(0.32, 0.82, 0.42);

        // Tight, high-drama "THIS CLUE FOR THE SHOW!" timpani + horn + tubular bell stinger
        this.playInstrument('timpani', root + 7, now, 0.24, 0.27, { dest: sfx, pan: -0.16, priority: 3 });
        this.playDrum('snare_rim', now + 0.07, 0.18, { dest: sfx, priority: 2 });
        const hitAt = now + 0.14;
        this.playInstrument('timpani', root, hitAt, 0.62, 0.30, { dest: sfx, pan: 0.14, priority: 3 });
        this.playInstrument('brass', root + 12, hitAt, 0.60, 0.22, { dest: sfx, pan: -0.24, priority: 3 });
        this.playInstrument('trombone', root + 7, hitAt, 0.60, 0.20, { dest: sfx, pan: 0.24, priority: 3 });
        this.playInstrument('muted_trumpet', root + 19, hitAt + 0.01, 0.58, 0.20, { dest: sfx, pan: 0.16, priority: 3 });
        this.playInstrument('tubular_bell', Math.min(MIDI_C6, root + 24), hitAt, 0.68, 0.16, {
          dest: sfx,
          pan: 0.28,
          priority: 2,
        });
        break;
      }

      case 'RIVAL_FUMBLE': {
        this.haptics.sightlineSnap();
        this.duckMusicForStinger(0.38, 0.85, 0.40);

        // Cheeky Tonight-Show / Match-Game muted-trumpet & trombone "bada-bump!" + rimshot + crowd Ooh!
        this.playInstrument('muted_trumpet', root + 16, now, 0.10, 0.21, { dest: sfx, pan: 0.20, priority: 3 });
        this.playInstrument('trombone', root + 4, now, 0.10, 0.19, { dest: sfx, pan: -0.20, priority: 2 });

        this.playInstrument('muted_trumpet', root + 15, now + 0.11, 0.10, 0.21, { dest: sfx, pan: 0.20, priority: 3 });
        this.playInstrument('trombone', root + 3, now + 0.11, 0.10, 0.19, { dest: sfx, pan: -0.20, priority: 2 });

        this.playInstrument('muted_trumpet', root + 12, now + 0.22, 0.24, 0.22, {
          dest: sfx,
          bendToMidi: root + 14,
          pan: 0.20,
          priority: 3,
        });
        this.playInstrument('trombone', root, now + 0.22, 0.26, 0.21, {
          dest: sfx,
          bendToMidi: root + 2,
          pan: -0.20,
          priority: 3,
        });

        // Classic studio snare-rimshot ("ba-dum-TSS!") at t+0.39s!
        this.playDrum('tom_mid', now + 0.34, 0.18, { dest: sfx, playbackRate: 0.94, pan: -0.10, priority: 3 });
        this.playDrum('snare_stick', now + 0.42, 0.22, { dest: sfx, pan: -0.06, priority: 3 });
        this.playDrum('snare_rim', now + 0.425, 0.20, { dest: sfx, priority: 3 });
        this.playDrum('ride', now + 0.43, 0.18, { dest: sfx, playbackRate: 1.16, durationSec: 0.42, pan: 0.26, priority: 2 });

        // Warm studio audience "Ooooh!" + playful chuckle!
        this.playCrowd('cheer_hurray', now + 0.20, 0.20, {
          durationSec: 1.05,
          playbackRate: 0.84,
          lowpassHz: 1750,
          attackSec: 0.08,
        });
        this.playCrowd('studio_laugh', now + 0.36, 0.20, { durationSec: 1.45, attackSec: 0.10 });
        break;
      }

      case 'LINE_JACKPOT': {
        this.haptics.goldResonance();
        this.duckMusicForStinger(0.24, 1.65, 0.65);

        // Full 1966 Prime-Time Showband Jackpot Fanfare + Bell Tree + Cash Bell + Roaring Cheer!
        this.playInstrument('timpani', root, now, 0.30, 0.26, { dest: sfx, priority: 3 });
        const fanfare = [
          { dt: 0.00, lead: 7, harm: 4, dur: 0.12 },
          { dt: 0.10, lead: 9, harm: 5, dur: 0.12 },
          { dt: 0.20, lead: 12, harm: 9, dur: 0.13 },
          { dt: 0.32, lead: 16, harm: 12, dur: 0.14 },
          { dt: 0.46, lead: 19, harm: 16, dur: 0.92 },
        ];
        for (const f of fanfare) {
          const at = now + f.dt;
          this.playInstrument('trumpet', root + 12 + f.lead, at, f.dur, 0.25, { dest: sfx, pan: 0.22, priority: 3 });
          this.playInstrument('trumpet', root + 12 + f.harm, at + 0.006, f.dur * 0.95, 0.18, { dest: sfx, pan: -0.18, priority: 3 });
          this.playInstrument('brass', root + f.lead, at, f.dur, 0.21, { dest: sfx, pan: -0.26, priority: 2 });
          this.playInstrument('trombone', root + f.harm - 5, at, f.dur, 0.18, { dest: sfx, pan: 0.26, priority: 2 });
        }

        const climax = now + 0.46;
        this.playDrum('crash', climax, 0.22, { dest: sfx, pan: -0.28, durationSec: 1.35, priority: 3 });
        this.playFoley('sleigh_sparkle', climax + 0.01, 0.26, { dest: sfx, pan: 0.30, priority: 3 });
        this.playFoley('cash_register_bell', climax + 0.04, 0.25, { dest: sfx, priority: 3 });
        this.playHammondChord([root + 12, root + 16, root + 19, root + 21], climax, 1.05, 0.075, {
          soulful: true,
          fastLeslie: true,
          keyClick: true,
        });

        this.playCrowd('applause_big', now + 0.26, 0.34, { durationSec: 2.5, attackSec: 0.12 });
        this.playCrowd('cheer_hurray', now + 0.46, 0.28, { durationSec: 2.1, attackSec: 0.10 });
        break;
      }
    }
  }

  /**
   * Tactile 20-Wedge 1966 Studio Big Wheel peg-flapper click:
   * - Fast spin (`speed01 >= 0.30`): brisk velocity-pitched leather/nickel peg clicks + wooden rim body.
   * - Final decelerating pegs (`speed01 < 0.30`): spring-steel & oxblood-leather flapper subtly
   *   TIGHTENS in pitch & double-impulse snap tension across the final 3 pegs (`peg 1 -> 2 -> 3`)!
   */
  public playBigWheelPegTick(speed01 = 0.7): void {
    const wall = this.nowWallMs();
    if (wall - this.lastWheelPegMs < 11) return;
    const gapMs = wall - this.lastWheelPegMs;
    this.lastWheelPegMs = wall;

    const s = clamp(speed01, 0, 1);
    if (s >= 0.30 || gapMs > 1600) {
      this.slowWheelPegCount = 0;
    } else {
      this.slowWheelPegCount = Math.min(4, this.slowWheelPegCount + 1);
    }

    this.haptics.spinTick();

    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    // Gentle TV Twist control-booth bed dip while the Big Wheel is spinning so every peg click pops!
    this.duckMusicForStinger(0.36, 0.42, 0.45);

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const jitter = ((Math.round(wall) % 5) - 2) * 0.007;

    if (s >= 0.30) {
      // High/medium velocity spin: smooth aerodynamic flapper click + warm wooden rim
      this.playFoley('flap_click', now, 0.20 + s * 0.09, {
        dest: sfx,
        playbackRate: 0.92 + s * 0.42 + jitter,
        durationSec: 0.036,
        pan: -0.08,
        lowpassHz: 2900 + s * 1300,
        priority: 3,
      });
      this.playInstrument('woodblock', Math.round(72 + s * 7), now + 0.002, 0.050, 0.13 + s * 0.06, {
        dest: sfx,
        pan: 0.08,
        lowpassHz: 2500 + s * 1000,
        priority: 2,
      });
      return;
    }

    // Final 3+ decelerating pegs (`s < 0.30`): spring-steel flapper bends taut and SNAPS tighter on each peg!
    const tightIdx = Math.min(3, Math.max(1, this.slowWheelPegCount)); // 1 -> 2 -> 3!
    // Pre-bend leather rub against brass peg (t+0ms)
    this.playFoley('flap_click', now, 0.18 + tightIdx * 0.03, {
      dest: sfx,
      playbackRate: 0.96 + tightIdx * 0.09 + jitter,
      durationSec: 0.026,
      pan: -0.10,
      lowpassHz: 3100 + tightIdx * 420,
      priority: 3,
    });
    // Taut spring-steel release SNAP-THOCK as wheel barely crests the peg (t+15ms)!
    const snapAt = now + 0.015;
    this.playFoley('mechanical_clack', snapAt, 0.20 + tightIdx * 0.035, {
      dest: sfx,
      playbackRate: 0.94 + tightIdx * 0.08,
      durationSec: 0.054,
      pan: 0.06,
      lowpassHz: 2600 + tightIdx * 380,
      priority: 3,
    });
    this.playInstrument('woodblock', 73 + tightIdx * 2, snapAt, 0.058, 0.15 + tightIdx * 0.02, {
      dest: sfx,
      pan: 0.10,
      lowpassHz: 2800 + tightIdx * 300,
      priority: 2,
    });
    // Subtle damped spring-steel harmonic ring tightening upward (`79 -> 81 -> 83`)
    this.playInstrument('vibraphone', 77 + tightIdx * 2, snapAt + 0.002, 0.080, 0.09 + tightIdx * 0.018, {
      dest: sfx,
      pan: -0.06,
      highpassHz: 600,
      priority: 2,
    });
  }

  /**
   * Vintage 1966 Vacuum-Tube TV Broadcast 1kHz Monoscope Test-Tone Carrier Power-Down Plunge!
   * Sweeps a bold, warm tube-saturated 1000Hz NBC calibration carrier + 120Hz sync hum
   * sharply down to 92Hz when the Studio Signal Jams on a `-40%` Monoscope Zonk!
   */
  private playBroadcastCarrierDrop(when: number, durationSec = 0.38): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfxBus || !this.allocateVoiceSlot(3)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const endAt = startAt + durationSec;

    const oscCarrier = ctx.createOscillator();
    const oscHum = ctx.createOscillator();
    oscCarrier.type = 'sawtooth';
    oscHum.type = 'sawtooth';

    // Classic 1000Hz NBC Monoscope test tone holding briefly (65ms) then plunging as breaker trips!
    oscCarrier.frequency.setValueAtTime(1000, startAt);
    oscCarrier.frequency.setValueAtTime(985, startAt + 0.065);
    oscCarrier.frequency.exponentialRampToValueAtTime(92, endAt);
    oscHum.frequency.setValueAtTime(240, startAt);
    oscHum.frequency.exponentialRampToValueAtTime(52, endAt);

    const gHum = ctx.createGain();
    gHum.gain.setValueAtTime(0.42, startAt);

    const shaper = ctx.createWaveShaper();
    if (this.warmTubeCurve) shaper.curve = this.warmTubeCurve;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2650, startAt);
    lp.frequency.exponentialRampToValueAtTime(380, endAt);
    lp.Q.setValueAtTime(1.8, startAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(0.32, startAt + 0.010);
    env.gain.setValueAtTime(0.28, startAt + durationSec * 0.62);
    env.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscCarrier.connect(shaper);
    oscHum.connect(gHum);
    gHum.connect(shaper);
    shaper.connect(lp);
    lp.connect(env);
    env.connect(this.sfxBus);

    oscCarrier.start(startAt);
    oscHum.start(startAt);
    oscCarrier.stop(endAt + 0.01);
    oscHum.stop(endAt + 0.01);

    this.activeVoices.push({
      priority: 3,
      startTime: startAt,
      endTime: endAt,
      gainNode: env,
      stopNode: oscCarrier,
      extraStopNodes: [oscHum],
      stopped: false,
    });
  }

  /**
   * 1966 RCA Monoscope "PLEASE STAND BY — SIGNAL JAMMED" Studio Gremlin Zonk!
   * Bold 1kHz broadcast carrier plunge + 60Hz NTSC RF sync-loss static crash + heavy
   * breaker trip + fat plunger-muted brass section *WAH - WAH - WAH - WAAAAAH!* +
   * collective studio audience gasp/groan ("Awwww!") & hearty laughter!
   */
  public playStudioGremlinZonk(): void {
    this.haptics.backfireFracture();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    // Dramatic studio band drop-out (0.12) when SIGNAL JAMMED flashes on the CRT!
    this.duckMusicForStinger(0.12, 2.25, 0.72);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;

    // 1. Bold 1966 Broadcast Carrier Plunge + RF Sync-Loss Static Crash + Breaker Slam (0.00s..0.38s)!
    this.playBroadcastCarrierDrop(now, 0.38);
    this.playEdwardsAcWrongBuzzer(now, 0.22);
    this.playDrum('kick', now, 0.32, { dest: sfx, playbackRate: 0.92, lowpassHz: 380, priority: 3 });
    this.playFoley('mechanical_clack', now + 0.008, 0.32, {
      dest: sfx,
      playbackRate: 0.76,
      durationSec: 0.09,
      priority: 3,
    });
    if (this.monoscopeStaticBuffer) {
      this.triggerBuffer({
        buffer: this.monoscopeStaticBuffer,
        dest: sfx,
        when: now + 0.005,
        gain: 0.28,
        playbackRate: 1.0,
        endPlaybackRate: 0.72,
        durationSec: 0.36,
        highpassHz: 240,
        lowpassHz: 3400,
        priority: 3,
      });
    }
    this.playInstrument('jazz_guitar', 54, now + 0.04, 0.20, 0.24, {
      dest: sfx,
      bendToMidi: 65,
      pan: -0.24,
      priority: 3,
    });
    const gremlinScramble = [
      { dt: 0.03, drum: 'bongo_hi', marimba: 76, pan: 0.26 },
      { dt: 0.10, drum: 'cowbell', marimba: 72, pan: -0.24 },
      { dt: 0.18, drum: 'tom_mid', marimba: 67, pan: 0.24 },
      { dt: 0.26, drum: 'bongo_lo', marimba: 62, pan: -0.18 },
    ];
    for (const g of gremlinScramble) {
      this.playDrum(g.drum, now + g.dt, 0.20, {
        dest: sfx,
        playbackRate: 1.12,
        pan: g.pan,
        priority: 2,
      });
      this.playInstrument('marimba', g.marimba, now + g.dt + 0.008, 0.11, 0.20, {
        dest: sfx,
        pan: -g.pan,
        priority: 2,
      });
    }

    // 2. Fat Plunger-Muted Studio Brass Section "WAH - WAH - WAH - WAAAAAAAH!" (0.38s..1.85s)!
    // Real formant-swept `wahSweep: true` slide trombone + sub-bass trombone + plunger muted trumpet!
    const wahWah = [
      { dt: 0.38, midi: 58, bend: 57, dur: 0.24, gain: 0.38 },
      { dt: 0.63, midi: 57, bend: 56, dur: 0.24, gain: 0.38 },
      { dt: 0.88, midi: 56, bend: 55, dur: 0.25, gain: 0.39 },
      { dt: 1.14, midi: 55, bend: 49, dur: 0.76, gain: 0.42 },
    ];
    for (const w of wahWah) {
      const at = now + w.dt;
      this.playInstrument('trombone', w.midi, at, w.dur, w.gain, {
        dest: sfx,
        bendToMidi: w.bend,
        wahSweep: true,
        pan: -0.12,
        priority: 3,
      });
      this.playInstrument('trombone', w.midi - 12, at + 0.005, w.dur, w.gain * 0.62, {
        dest: sfx,
        bendToMidi: w.bend - 12,
        lowpassHz: 1400,
        pan: -0.24,
        priority: 2,
      });
      this.playInstrument('muted_trumpet', w.midi + 12, at + 0.008, w.dur * 0.94, w.gain * 0.66, {
        dest: sfx,
        bendToMidi: w.bend + 12,
        wahSweep: true,
        pan: 0.18,
        priority: 3,
      });
    }
    this.playInstrument('timpani', 46, now + 1.15, 0.55, 0.26, {
      dest: sfx,
      bendToMidi: 41,
      lowpassHz: 520,
      priority: 2,
    });

    // 3. Surprised collective studio audience Gasp + Groan ("Ooooh / Awwww!") -> hearty studio laughter!
    this.playCrowd('cheer_hurray', now + 0.10, 0.24, {
      durationSec: 0.42,
      playbackRate: 0.92,
      lowpassHz: 2100,
      attackSec: 0.03,
      releaseSec: 0.22,
    });
    this.playCrowd('cheer_hurray', now + 0.22, 0.30, {
      durationSec: 0.96,
      playbackRate: 0.68,
      lowpassHz: 980,
      attackSec: 0.06,
      releaseSec: 0.38,
    });
    this.playCrowd('studio_laugh', now + 0.60, 0.38, {
      durationSec: 2.35,
      attackSec: 0.08,
    });
  }

  /**
   * 1966 Studio Lifeline Cues:
   * - `FIFTY_FIFTY`: Twin solenoid relay chop (`CHOP-CHOP!`) + ascending wooden xylophone/marimba zip!
   * - `AUDIENCE_POLL`: Warm 300-seat studio crowd murmur swell + rising Solari tote ticks + bell lock!
   */
  public playLifelineCue(kind: LifelineCueKindV7): void {
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    if (kind === 'FIFTY_FIFTY') {
      this.haptics.sightlineSnap();
      this.duckMusicForStinger(0.36, 0.48, 0.30);

      // Twin heavy studio relay chops knocking out two wrong option lamps!
      const relays = [
        { dt: 0.00, rate: 0.94, pan: -0.28 },
        { dt: 0.13, rate: 1.08, pan: 0.28 },
      ];
      for (const r of relays) {
        const at = now + r.dt;
        this.playFoley('mechanical_clack', at, 0.27, {
          dest: sfx,
          playbackRate: r.rate,
          durationSec: 0.068,
          pan: r.pan,
          priority: 3,
        });
        this.playDrum('snare_rim', at + 0.006, 0.17, {
          dest: sfx,
          playbackRate: r.rate * 1.18,
          pan: r.pan,
          priority: 2,
        });
        this.playFoley('flap_click', at + 0.014, 0.18, {
          dest: sfx,
          playbackRate: r.rate * 1.35,
          durationSec: 0.032,
          pan: r.pan,
          priority: 2,
        });
      }

      // Snappy 5-note upper-register xylophone (marimba + glockenspiel) zip!
      const zipSemis = [0, 4, 7, 12, 16];
      for (let i = 0; i < zipSemis.length; i++) {
        const at = now + 0.045 + i * 0.038;
        const midi = Math.min(MIDI_C6, root + zipSemis[i]);
        const pan = -0.28 + (i / (zipSemis.length - 1)) * 0.56;
        this.playInstrument('marimba', midi, at, 0.15, 0.22, {
          dest: sfx,
          pan,
          priority: 3,
        });
        this.playInstrument('glockenspiel', midi, at + 0.004, 0.16, 0.13, {
          dest: sfx,
          pan: -pan * 0.5,
          priority: 2,
        });
      }
      return;
    }

    if (kind === 'FREE_SWAP') {
      this.haptics.sightlineSnap();
      this.duckMusicForStinger(0.38, 0.56, 0.34);

      // Crisp cue-card slide whoosh + Solari flip + 4-note rising marimba/trumpet fresh-card chime!
      this.playFoley('brush_sweep', now, 0.22, {
        dest: sfx,
        playbackRate: 1.45,
        durationSec: 0.11,
        pan: -0.22,
        priority: 3,
      });
      this.playFoley('mechanical_clack', now + 0.06, 0.24, {
        dest: sfx,
        playbackRate: 1.12,
        durationSec: 0.055,
        pan: 0.16,
        priority: 3,
      });
      const swapSemis = [0, 5, 9, 12];
      for (let i = 0; i < swapSemis.length; i++) {
        const at = now + 0.05 + i * 0.052;
        const m = Math.min(MIDI_C6, root + swapSemis[i]);
        this.playInstrument('marimba', m, at, 0.20, 0.21, {
          dest: sfx,
          pan: -0.20 + i * 0.14,
          priority: 3,
        });
        this.playInstrument('vibraphone', m, at + 0.008, 0.26, 0.16, {
          dest: sfx,
          pan: 0.20 - i * 0.12,
          priority: 2,
        });
      }
      this.playFoley('typewriter_bell', now + 0.26, 0.22, {
        dest: sfx,
        playbackRate: 1.14,
        priority: 3,
      });
      return;
    }

    // AUDIENCE_POLL: Warm studio crowd voting murmur swell + rising Solari tote ticks + bell lock!
    this.haptics.peel(2);
    this.duckMusicForStinger(0.42, 1.12, 0.45);

    this.playCrowd('applause_warm', now, 0.24, {
      durationSec: 1.05,
      playbackRate: 0.72,
      lowpassHz: 1380,
      attackSec: 0.14,
      releaseSec: 0.36,
    });
    this.playCrowd('studio_clap', now + 0.08, 0.15, {
      durationSec: 0.85,
      playbackRate: 0.86,
      lowpassHz: 1850,
      attackSec: 0.12,
      releaseSec: 0.30,
    });

    // 9 accelerating & rising Solari split-flap tote counter ticks
    const tickScale = [0, 2, 4, 5, 7, 9, 11, 12, 16];
    for (let i = 0; i < tickScale.length; i++) {
      const u = i / (tickScale.length - 1);
      const at = now + 0.07 + i * 0.074;
      this.playFoley('flap_click', at, 0.16 + u * 0.06, {
        dest: sfx,
        playbackRate: 0.96 + u * 0.48,
        durationSec: 0.035,
        pan: -0.24 + u * 0.48,
        priority: 3,
      });
      this.playInstrument('vibraphone', Math.min(MIDI_C6, root + tickScale[i]), at, 0.18, 0.12 + u * 0.05, {
        dest: sfx,
        pan: -0.20 + u * 0.40,
        lowpassHz: 3200,
        priority: 2,
      });
    }

    // Crisp Tote Percentage Lock Bell at t+0.76s!
    const lockAt = now + 0.76;
    this.playFoley('typewriter_bell', lockAt, 0.28, {
      dest: sfx,
      playbackRate: 1.08,
      priority: 3,
    });
    this.playFoley('cash_register_bell', lockAt + 0.02, 0.20, {
      dest: sfx,
      playbackRate: 1.12,
      durationSec: 0.45,
      priority: 3,
    });
    this.playInstrument('vibraphone', root + 12, lockAt, 0.46, 0.18, { dest: sfx, pan: 0.18, priority: 3 });
    this.playInstrument('glockenspiel', Math.min(MIDI_C6, root + 16), lockAt + 0.015, 0.44, 0.14, {
      dest: sfx,
      pan: -0.18,
      priority: 2,
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

  /**
   * 1966 Studio 6A Chasing Light-Board Bounce Tick (Press-Your-Luck Perimeter Light Jump!):
   * Crisp solenoid lamp relay click + joyful pentatonic wooden xylophone/marimba & vibraphone
   * light-jump melody panning dynamically around the 12-square perimeter!
   */
  public playPressYourLuckBounceTick(stepIdx?: number): void {
    this.haptics.spinTick();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    // Gentle TV Twist control-booth bed dip while the 12-square light-board cursor bounces!
    this.duckMusicForStinger(0.38, 0.34, 0.42);

    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const idx =
      typeof stepIdx === 'number' && Number.isFinite(stepIdx)
        ? Math.max(0, Math.floor(stepIdx))
        : this.pylMelodyCursor++;
    const bounceMel = [0, 4, 7, 9, 12, 16, 12, 9, 7, 4, 9, 14];
    const semi = bounceMel[idx % bounceMel.length];
    const rootMidi = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;
    const noteMidi = Math.min(MIDI_C6, rootMidi + semi);
    const panPos = Math.sin((idx % 12) * ((Math.PI * 2) / 12)) * 0.32;

    this.playFoley('flap_click', now, 0.21, {
      dest: sfx,
      playbackRate: 1.12 + (idx % 4) * 0.06,
      durationSec: 0.034,
      pan: panPos,
      priority: 2,
    });
    this.playInstrument('marimba', noteMidi, now + 0.002, 0.105, 0.21, {
      dest: sfx,
      pan: panPos,
      priority: 2,
    });
    this.playInstrument('vibraphone', noteMidi, now + 0.004, 0.12, 0.13, {
      dest: sfx,
      pan: -panPos * 0.5,
      lowpassHz: 3400,
      priority: 1,
    });
  }

  /**
   * Authentic Solari split-flap leaf flutter clack — automatically weaving a
   * joyful Studio 6A pitched xylophone/vibraphone light-jump tone whenever fired
   * in a rapid Press-Your-Luck lightboard bounce burst (`45..240ms` cadence)!
   */
  public playSplitFlapTick(): void {
    const wall = this.nowWallMs();
    const gap = wall - this.lastSplitFlapWallMs;
    this.lastSplitFlapWallMs = wall;

    if (gap >= 42 && gap <= 245 && !this.clueSanctuaryActive) {
      this.splitFlapBurstStep += 1;
      if (this.splitFlapBurstStep >= 2) {
        this.playPressYourLuckBounceTick(this.splitFlapBurstStep - 2);
        return;
      }
    } else if (gap > 245) {
      this.splitFlapBurstStep = 0;
    }

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
      this.playInstrument('trombone', 50, now + 0.02, 0.65, 0.20, {
        dest: sfx,
        bendToMidi: 45,
        priority: 3,
      });
      this.playCrowd('studio_laugh', now + 0.14, 0.22, { durationSec: 2.0 });
      return;
    }

    if (isCorrect) {
      this.lastCorrectRevealTime = now;
      const bandFanfareAlreadyActive = now - this.lastBandReactionTime < 0.12;
      if (isSealed) {
        // Sealed Vault: Pure horological bronze bell & vibraphone chord (ZERO studio crowd!)
        const vaultChord = [0, 4, 7, 11, 14];
        for (let i = 0; i < vaultChord.length; i++) {
          this.playInstrument(i % 2 === 0 ? 'glockenspiel' : 'vibraphone', Math.min(MIDI_C6, rootMidi + vaultChord[i]), now + i * 0.045, 0.68, 0.165 - i * 0.015, {
            dest: sfx,
            pan: -0.24 + i * 0.12,
            priority: 3,
          });
        }
        this.playFoley('typewriter_bell', now, 0.18, { dest: sfx, priority: 3 });
      } else {
        // Live 1966 TV Studio: Authentic Solenoid Bell DING! + Upbeat Brass/Vibes Sting + Real Applause!
        // Calibrated -2.6 dB headroom so peak sits comfortably <= -3.3 dBFS (0.68) with zero hot transients!
        this.playFoley('typewriter_bell', now, 0.23, { dest: sfx, playbackRate: 1.04, priority: 3 });
        this.playInstrument('glockenspiel', Math.min(MIDI_C6, rootMidi + 12), now, 0.55, 0.145, {
          dest: sfx,
          pan: 0.20,
          priority: 3,
        });

        // Skip redundant small 3-note sting only when a full Band Reaction (Jackpot/Lead/Streak) fired in the same frame!
        if (!bandFanfareAlreadyActive) {
          const sting = [
            { dt: 0.04, lead: 7, harm: 4, dur: 0.18 },
            { dt: 0.15, lead: 9, harm: 7, dur: 0.18 },
            { dt: 0.26, lead: 12, harm: 9, dur: 0.62 },
          ];
          for (const s of sting) {
            this.playInstrument('trumpet', rootMidi + s.lead, now + s.dt, s.dur, 0.175, {
              dest: sfx,
              pan: 0.22,
              priority: 3,
            });
            this.playInstrument('brass', rootMidi + s.harm, now + s.dt, s.dur, 0.16, {
              dest: sfx,
              pan: -0.22,
              priority: 3,
            });
            this.playInstrument('vibraphone', rootMidi + s.lead, now + s.dt, s.dur * 1.2, 0.14, {
              dest: sfx,
              pan: 0.28,
              priority: 2,
            });
          }

          // Warm live studio audience applause!
          this.playCrowd('applause_warm', now + 0.10, 0.245, { durationSec: 2.1, attackSec: 0.11 });
        }
      }
    } else {
      this.lastWrongRevealTime = now;
      // Authentic 1960s Edwards AC Magnetic Studio Wrong Buzzer (`BRZZZT!`) + muted trombone sigh
      this.playEdwardsAcWrongBuzzer(now, 0.44);
      this.playInstrument('trombone', rootMidi - 5, now + 0.10, 0.22, 0.155, { dest: sfx, pan: -0.18, priority: 3 });
      this.playInstrument('trombone', rootMidi - 8, now + 0.24, 0.36, 0.17, { dest: sfx, pan: -0.18, priority: 3 });

      if (!isSealed) {
        // Gentle, brief sympathetic studio audience reaction (low-passed warm crowd murmur)
        this.playCrowd('studio_laugh', now + 0.16, 0.105, {
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
    env.gain.linearRampToValueAtTime(0.245, startAt + 0.012);
    env.gain.setValueAtTime(0.225, Math.max(startAt + 0.04, endAt - 0.05));
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
      extraStopNodes: [oscB, oscSub, rattleOsc],
      extraGainNodes: [rattleDepth],
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
      extraStopNodes: [oscB],
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

    this.playInstrument('glockenspiel', upperMidi, now, 0.20, 0.135 * Math.max(0.32, upperWeight), {
      dest: sfx,
      pan: 0.14,
      priority: 2,
    });
    this.playInstrument('vibraphone', lowerMidi, now, 0.22, 0.135 * Math.max(0.32, lowerWeight), {
      dest: sfx,
      pan: -0.14,
      priority: 1,
    });
    this.playFoley('flap_click', now, 0.09, {
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

  /**
   * 4-Tier Differentiated 1966 Trophy, Medal & Unlockable Turntable Fanfares!
   * Supports `'BRONZE'`, `'SILVER'`, `'GOLD'` (default), and `'PLATINUM'` (or full tier badge strings)
   * so grinding Medals, Trophies & Sovereign Crowns feels progressively more exhilarating!
   */
  public playTrophyUnlockChime(tier?: TrophyTierAudioIdV7 | string): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    const rawTier = String(tier ?? 'GOLD').toUpperCase();
    const resolvedTier: TrophyTierAudioIdV7 = rawTier.includes('PLATINUM')
      ? 'PLATINUM'
      : rawTier.includes('SILVER')
        ? 'SILVER'
        : rawTier.includes('BRONZE')
          ? 'BRONZE'
          : 'GOLD';

    // Bandleader phrasing: if fired in the exact same ceremony frame as `playEpisodeCeremonyFanfare`,
    // stagger +1.16s as a sparkling 1–2 encore punctuation in the exact stage key (`root`)!
    const inCeremonyFrame = ctx.currentTime - this.lastCeremonyFanfareTime < 0.25;
    const now = inCeremonyFrame ? ctx.currentTime + 1.16 : ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    if (resolvedTier === 'BRONZE') {
      // Crisp enameled bronze medal pin clasp + 3-note vibraphone/muted-trumpet salute!
      if (inCeremonyFrame) {
        this.duckMusicForStinger(0.20, 2.55, 0.75);
      } else {
        this.duckMusicForStinger(0.52, 0.55, 0.32);
      }
      this.playFoley('flap_click', now, 0.22, { dest: sfx, playbackRate: 1.25, durationSec: 0.032, priority: 3 });
      const bSemis = [0, 4, 7];
      for (let i = 0; i < bSemis.length; i++) {
        this.playInstrument('vibraphone', Math.min(MIDI_C6, root + bSemis[i]), now + 0.02 + i * 0.065, 0.45, 0.22, {
          dest: sfx,
          pan: -0.18 + i * 0.18,
          priority: 3,
        });
      }
      this.playInstrument('muted_trumpet', Math.min(MIDI_C6, root + 7), now + 0.15, 0.38, 0.19, { dest: sfx, pan: 0.16, priority: 2 });
      if (!inCeremonyFrame) {
        this.playCrowd('studio_clap', now + 0.14, 0.18, { durationSec: 1.1 });
      }
      return;
    }

    if (resolvedTier === 'SILVER') {
      // Gleaming silver medallion tubular bell + 4-note glockenspiel/trumpet fanfare!
      if (inCeremonyFrame) {
        this.duckMusicForStinger(0.20, 2.75, 0.78);
      } else {
        this.duckMusicForStinger(0.42, 0.85, 0.40);
      }
      this.playInstrument('tubular_bell', Math.min(MIDI_C6, root + 7), now, 0.72, 0.17, { dest: sfx, pan: -0.22, priority: 3 });
      const sSemis = [0, 4, 7, 12];
      for (let i = 0; i < sSemis.length; i++) {
        this.playInstrument(i < 2 ? 'vibraphone' : 'glockenspiel', Math.min(MIDI_C6, root + sSemis[i]), now + i * 0.055, 0.58, 0.21, {
          dest: sfx,
          pan: -0.24 + i * 0.16,
          priority: 3,
        });
      }
      this.playFoley('sleigh_sparkle', now + 0.08, 0.20, { dest: sfx, priority: 2 });
      this.playInstrument('trumpet', Math.min(MIDI_C6, root + 12), now + 0.18, 0.52, 0.21, { dest: sfx, pan: 0.20, priority: 3 });
      this.playInstrument('brass', root, now + 0.18, 0.52, 0.20, { dest: sfx, pan: -0.20, priority: 2 });
      if (!inCeremonyFrame) {
        this.playCrowd('applause_warm', now + 0.18, 0.22, { durationSec: 1.45 });
      }
      return;
    }

    if (resolvedTier === 'PLATINUM') {
      // Grand Platinum Sovereign Crown Turntable Fanfare: Timpani + Steinway + Octave Trumpets + Leslie B3 + Ovation!
      if (inCeremonyFrame) {
        this.duckMusicForStinger(0.20, 3.10, 0.82);
      } else {
        this.duckMusicForStinger(0.24, 1.65, 0.65);
      }
      this.playInstrument('timpani', root - 12, now, 0.45, 0.27, { dest: sfx, priority: 3 });
      const pSemis = [0, 4, 7, 9, 12, 16, 19];
      for (let i = 0; i < pSemis.length; i++) {
        const at = now + i * 0.048;
        const pMidi = Math.min(MIDI_C6, root + pSemis[i]);
        this.playInstrument('grand_piano', pMidi, at, 0.68, 0.16, { dest: sfx, pan: -0.28 + i * 0.09, priority: 2 });
        this.playInstrument('glockenspiel', pMidi, at + 0.01, 0.68, 0.18, { dest: sfx, pan: 0.26 - i * 0.08, priority: 3 });
      }
      const crownAt = now + 0.34;
      this.playDrum('crash', crownAt, 0.21, { dest: sfx, pan: -0.28, durationSec: 1.35, priority: 3 });
      this.playInstrument('tubular_bell', Math.min(MIDI_C6, root + 12), crownAt, 0.95, 0.18, { dest: sfx, pan: 0.28, priority: 3 });
      this.playInstrument('trumpet', Math.min(MIDI_C6, root + 16), crownAt, 0.85, 0.25, { dest: sfx, pan: 0.22, priority: 3 });
      this.playInstrument('trumpet', Math.min(MIDI_C6, root + 12), crownAt + 0.006, 0.85, 0.19, { dest: sfx, pan: -0.18, priority: 3 });
      this.playInstrument('brass', root + 4, crownAt, 0.85, 0.22, { dest: sfx, pan: -0.24, priority: 2 });
      this.playInstrument('strings', Math.min(MIDI_C6, root + 12), crownAt, 0.95, 0.14, { dest: sfx, pan: 0.32, highpassHz: 240, priority: 2 });
      this.playFoley('sleigh_sparkle', crownAt + 0.02, 0.26, { dest: sfx, priority: 3 });
      this.playFoley('cash_register_bell', crownAt + 0.04, 0.22, { dest: sfx, priority: 2 });
      this.playHammondChord([root, root + 4, root + 7, root + 9], crownAt, 1.0, 0.075, {
        soulful: true,
        fastLeslie: true,
        keyClick: true,
      });
      if (!inCeremonyFrame) {
        this.playCrowd('applause_big', now + 0.22, 0.32, { durationSec: 2.3, attackSec: 0.10 });
        this.playCrowd('cheer_hurray', now + 0.36, 0.26, { durationSec: 1.9, attackSec: 0.10 });
      }
      return;
    }

    // Default GOLD TROPHY: Rich 6-note vibraphone/glockenspiel arpeggio + dual-trumpet & brass 6/9 triumph!
    if (inCeremonyFrame) {
      this.duckMusicForStinger(0.20, 2.85, 0.80);
    } else {
      this.duckMusicForStinger(0.32, 1.05, 0.48);
    }
    const gSemis = [0, 4, 7, 12, 16, 19];
    for (let i = 0; i < gSemis.length; i++) {
      this.playInstrument(i < 2 ? 'vibraphone' : 'glockenspiel', Math.min(MIDI_C6, root + gSemis[i]), now + i * 0.055, 0.65, 0.22, {
        dest: sfx,
        pan: -0.25 + i * 0.1,
        priority: 3,
      });
    }
    this.playFoley('sleigh_sparkle', now + 0.08, 0.24, { dest: sfx, priority: 3 });
    this.playFoley('cash_register_bell', now + 0.24, 0.20, { dest: sfx, priority: 2 });
    this.playInstrument('brass', root, now + 0.24, 0.65, 0.23, { dest: sfx, pan: -0.22, priority: 3 });
    this.playInstrument('trumpet', Math.min(MIDI_C6, root + 12), now + 0.26, 0.65, 0.22, { dest: sfx, pan: 0.22, priority: 3 });
    this.playInstrument('trumpet', Math.min(MIDI_C6, root + 7), now + 0.27, 0.62, 0.16, { dest: sfx, pan: -0.16, priority: 2 });
    if (!inCeremonyFrame) {
      this.playCrowd('applause_warm', now + 0.22, 0.26, { durationSec: 1.8 });
    }
  }

  public playMedalRibbonChime(tier: TrophyTierAudioIdV7 | string = 'BRONZE'): void {
    this.playTrophyUnlockChime(tier);
  }

  /**
   * Certified 1966 Network Winner's Check Ceremony & Broadcast Sign-Off Fanfare!
   * - `didWin = true`: Perforated check-voucher snap + notary emboss + vintage cash-register bell ->
   *   timpani pickup -> 5-step dual-trumpet & contrary-motion trombone climb + Steinway grand piano
   *   upward glissando + stereo strings, tubular bells, bell tree & fast-Leslie B3 Standing Ovation!
   * - `didWin = false`: Dignified 1966 Prime-Time Parting-Gifts Hollywood cadence + warm studio applause!
   */
  public playWinnersCheckCeremony(didWin = true): void {
    this.playEpisodeCeremonyFanfare(didWin);
  }

  /**
   * 1966 Network Television Opening Title Sequence Fanfare (`playBroadcastShowIntroV8`):
   * Iconic 3-note Living Color vibraphone/glockenspiel NBC-style chime (`G4-E5-C5`)
   * blossoming into a joyful Herb Alpert / Milton DeLugg dual-trumpet & big-band
   * Studio 6A showtime fanfare + live 300-seat audience applause!
   */
  public playBroadcastShowIntroFanfare(): void {
    this.haptics.goldResonance();
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.28, 2.25, 0.85);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    // 1. Classic 3-note "In Living Color" vibraphone + tubular bell chime (G - E - C)
    const peacockNotes = [
      { dt: 0.02, semi: 2, pan: -0.24 },
      { dt: 0.28, semi: 11, pan: 0.0 },
      { dt: 0.54, semi: 7, pan: 0.24 },
    ];
    for (const n of peacockNotes) {
      const m = Math.min(MIDI_C6, root + n.semi);
      this.playInstrument('vibraphone', m, now + n.dt, 0.65, 0.22, {
        dest: sfx,
        pan: n.pan,
        priority: 3,
      });
      this.playInstrument('glockenspiel', m, now + n.dt + 0.008, 0.55, 0.14, {
        dest: sfx,
        pan: -n.pan * 0.5,
        priority: 2,
      });
    }
    this.playFoley('sleigh_sparkle', now + 0.56, 0.22, { dest: sfx, priority: 2 });

    // 2. Studio 6A Crane Reveal Big-Band Brass & Trumpet Swell + Warm Applause!
    const brassHits = [
      { dt: 0.86, lead: 7, harm: 4, dur: 0.22 },
      { dt: 1.06, lead: 9, harm: 5, dur: 0.22 },
      { dt: 1.26, lead: 12, harm: 7, dur: 0.78 },
    ];
    for (const h of brassHits) {
      const at = now + h.dt;
      this.playInstrument('trumpet', Math.min(MIDI_C6, root + h.lead), at, h.dur, 0.21, {
        dest: sfx,
        pan: 0.20,
        priority: 3,
      });
      this.playInstrument('brass', root + h.harm, at, h.dur, 0.20, {
        dest: sfx,
        pan: -0.20,
        priority: 3,
      });
      this.playInstrument('trombone', root + h.harm - 12, at, h.dur, 0.18, {
        dest: sfx,
        pan: -0.26,
        priority: 2,
      });
    }
    this.playDrum('crash', now + 1.26, 0.19, { dest: sfx, pan: -0.24, durationSec: 1.2, priority: 2 });
    this.playHammondChord([root, root + 4, root + 7, root + 9], now + 1.26, 0.95, 0.07, {
      soulful: true,
      fastLeslie: true,
      keyClick: true,
    });
    this.playCrowd('applause_big', now + 0.92, 0.28, { durationSec: 2.6, attackSec: 0.14 });
  }

  /**
   * Warm 1966 Prime-Time Closing Credits Sign-Off Cadence (`play1966EndCreditsV8`).
   */
  public playEndCreditsTheme(): void {
    const ctx = this.wakeContextSync();
    if (!ctx || !this.sfxBus) return;

    this.duckMusicForStinger(0.42, 1.9, 0.78);
    const now = ctx.currentTime;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    const signoff = [
      { dt: 0.00, semi: 4, dur: 0.28 },
      { dt: 0.24, semi: 7, dur: 0.28 },
      { dt: 0.48, semi: 9, dur: 0.30 },
      { dt: 0.74, semi: 12, dur: 1.05 },
    ];
    for (const s of signoff) {
      const at = now + s.dt;
      const m = Math.min(MIDI_C6, root + s.semi);
      this.playInstrument('trumpet', m, at, s.dur, 0.18, { dest: sfx, pan: 0.18, priority: 3 });
      this.playInstrument('tenor_sax', m - 5, at + 0.006, s.dur, 0.17, { dest: sfx, pan: -0.18, priority: 2 });
      this.playInstrument('grand_piano', m, at, s.dur * 1.15, 0.15, { dest: sfx, pan: -0.08, priority: 2 });
      this.playInstrument('strings', m, at, s.dur * 1.2, 0.13, { dest: sfx, pan: 0.26, highpassHz: 240, priority: 2 });
    }
    this.playCrowd('applause_warm', now + 0.18, 0.25, { durationSec: 2.8, attackSec: 0.16 });
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

    this.duckMusicForStinger(0.20, didWin ? 2.45 : 1.65, 0.80);
    const now = ctx.currentTime;
    this.lastCeremonyFanfareTime = now;
    const sfx = this.sfxBus;
    const root = SHOWBAND_SCENE_SPECS_V7[this.currentScene].rootMidi + 12;

    if (didWin) {
      // 1. Certified 1966 Winner's Check Voucher Perforation Snap + Notary Stamp + Cash Bell (t+0.00..0.14s)!
      this.playFoley('brush_sweep', now, 0.19, {
        dest: sfx,
        playbackRate: 1.68,
        durationSec: 0.085,
        highpassHz: 600,
        pan: -0.18,
        priority: 3,
      });
      this.playFoley('mechanical_clack', now + 0.045, 0.24, {
        dest: sfx,
        playbackRate: 0.86,
        durationSec: 0.075,
        pan: 0.14,
        priority: 3,
      });
      this.playFoley('cash_register_bell', now + 0.07, 0.25, {
        dest: sfx,
        playbackRate: 1.04,
        priority: 3,
      });

      // 2. Timpani Roll Pickup -> 5-Step Dual-Trumpet & Contrary-Motion Trombone Prime-Time Fanfare!
      this.playInstrument('timpani', root - 19, now + 0.08, 0.26, 0.24, { dest: sfx, pan: -0.14, priority: 3 });
      this.playInstrument('timpani', root - 12, now + 0.18, 0.35, 0.27, { dest: sfx, pan: 0.14, priority: 3 });
      this.playDrum('snare_stick', now + 0.17, 0.20, { dest: sfx, pan: -0.10, priority: 2 });

      const winNotes = [
        { dt: 0.18, lead: 0, harm: -5, tromb: -12, dur: 0.13 },
        { dt: 0.30, lead: 4, harm: 0, tromb: -8, dur: 0.13 },
        { dt: 0.42, lead: 7, harm: 4, tromb: -5, dur: 0.13 },
        { dt: 0.54, lead: 9, harm: 5, tromb: -3, dur: 0.15 },
        { dt: 0.68, lead: 12, harm: 9, tromb: 0, dur: 1.25 },
      ];
      for (const n of winNotes) {
        const at = now + n.dt;
        this.playInstrument('trumpet', root + n.lead, at, n.dur, 0.26, { dest: sfx, pan: 0.22, priority: 3 });
        this.playInstrument('trumpet', root + n.harm, at + 0.006, n.dur * 0.96, 0.18, { dest: sfx, pan: -0.18, priority: 3 });
        this.playInstrument('brass', root + n.harm, at, n.dur, 0.22, { dest: sfx, pan: -0.24, priority: 3 });
        this.playInstrument('trombone', root + n.tromb, at, n.dur, 0.19, { dest: sfx, pan: -0.28, priority: 2 });
      }

      // 3. Sweeping Steinway Grand Piano Glissando into Grand Standing Ovation Climax (t+0.68s)!
      const climax = now + 0.68;
      const pianoGliss = [0, 4, 7, 9, 12, 16];
      for (let i = 0; i < pianoGliss.length; i++) {
        this.playInstrument('grand_piano', root + pianoGliss[i], climax - 0.16 + i * 0.032, 0.72, 0.15, {
          dest: sfx,
          pan: -0.30 + i * 0.11,
          priority: 2,
        });
      }

      this.playDrum('crash', climax, 0.23, { dest: sfx, pan: -0.28, durationSec: 1.50, priority: 3 });
      this.playInstrument('timpani', root - 12, climax, 0.90, 0.28, { dest: sfx, priority: 3 });
      this.playInstrument('tubular_bell', Math.min(MIDI_C6, root + 12), climax + 0.01, 1.10, 0.16, {
        dest: sfx,
        pan: 0.30,
        priority: 2,
      });
      this.playInstrument('strings', root + 4, climax, 1.20, 0.14, { dest: sfx, pan: -0.32, highpassHz: 240, priority: 2 });
      this.playInstrument('strings', root + 12, climax, 1.20, 0.13, { dest: sfx, pan: 0.32, highpassHz: 240, priority: 2 });
      this.playFoley('sleigh_sparkle', climax + 0.02, 0.26, { dest: sfx, pan: 0.28, priority: 3 });
      this.playHammondChord([root, root + 4, root + 7, root + 9], climax, 1.35, 0.078, {
        soulful: true,
        fastLeslie: true,
        keyClick: true,
      });

      this.playCrowd('applause_warm', now + 0.22, 0.24, { durationSec: 1.4, attackSec: 0.08 });
      this.playCrowd('applause_big', now + 0.48, 0.36, { durationSec: 3.1, attackSec: 0.16 });
      this.playCrowd('cheer_hurray', now + 0.70, 0.29, { durationSec: 2.5, attackSec: 0.12 });
    } else {
      // Dignified 1966 Prime-Time "Parting Gifts" Hollywood Sign-Off Cadence (lands warmly on tonic I6!)
      const loseNotes = [
        { dt: 0.00, semi: 7, sax: -1, dur: 0.28 },
        { dt: 0.26, semi: 4, sax: -3, dur: 0.28 },
        { dt: 0.52, semi: 2, sax: -5, dur: 0.30 },
        { dt: 0.80, semi: 0, sax: -8, dur: 0.92 },
      ];
      for (const n of loseNotes) {
        const at = now + n.dt;
        this.playInstrument('muted_trumpet', root + n.semi, at, n.dur, 0.21, { dest: sfx, pan: 0.18, priority: 3 });
        this.playInstrument('tenor_sax', root + n.sax, at + 0.006, n.dur * 1.05, 0.19, { dest: sfx, pan: -0.18, priority: 2 });
        this.playInstrument('trombone', root + n.semi - 12, at, n.dur, 0.19, { dest: sfx, pan: -0.24, priority: 2 });
        this.playInstrument('grand_piano', root + n.semi - 5, at, n.dur * 1.2, 0.15, { dest: sfx, pan: -0.10, priority: 2 });
      }
      this.playInstrument('strings', root + 4, now + 0.80, 0.90, 0.12, { dest: sfx, pan: 0.28, highpassHz: 240, priority: 2 });
      this.playCrowd('applause_warm', now + 0.58, 0.22, { durationSec: 1.85, lowpassHz: 4600 });
    }
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.voices.stopCurrentVoice(0.015);
    this.setCensorMicHold(false, 0);
    this.stopMusic();
    this.leslieBus?.dispose();
    this.leslieBus = null;
    this.detachUnlockListeners?.();
    this.detachUnlockListeners = null;

    for (const v of this.activeVoices) {
      v.stopped = true;
      try {
        v.stopNode.stop();
      } catch {
        // ignore
      }
      if (v.extraStopNodes) {
        for (const extra of v.extraStopNodes) {
          try {
            extra.stop();
          } catch {
            // ignore
          }
        }
      }
    }
    this.activeVoices.length = 0;

    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export default ShowbandAudioEngineV7;
