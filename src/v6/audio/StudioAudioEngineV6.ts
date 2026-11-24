// ============================================================================
// WORLD'S SMARTEST v6.0 — Principal Broadcast Studio Audio Engine
// ============================================================================
// Rupert-Neve 5-Bus WebAudio Architecture (ZERO procedural tone generators!):
//  1) Seamless Dual-Deck Equal-Power Cosine Crossfade (750ms) across all 14
//     `SymphonyTrackIdV6` movements (`./assets/audio/v6/music/<trackId>.mp3`
//     with resilient zero-gap fallback if a movement is still loading).
//  2) Real-Time Broadcast Gain Bus Graph bound live to `BroadcastOptionsStateV6`:
//       - `masterGain`   (Master Output Fader)
//       - `symphonyGain` (Symphonic Score Fader + `musicEnabled` gate)
//       - `foleyGain`    (Horological Foley Fader + `sfxEnabled` gate)
//       - `voiceGain`    (Cast & Host VO Fader)
//       - `ambienceGain` (Stage Room-Air & Audience Bus Fader)
//  3) BBC Speech-Priority Auto-Voice Ducking (`-9.5dB` smooth envelope on
//     Symphony, `-7.5dB` on Ambience/Crowd; `65ms` attack, `110ms` hold,
//     `420ms` natural orchestral bloom release; Foley stays 100% crisp).
//  4) Live Per-Bus Time-Domain Float32 RMS VU Metering (`getChannelLevels()`)
//     with Stereo L/R splitters and authentic IEC 60268-17 needle ballistics
//     so the 4-Bay Broadcast Options Console VU meters bounce to real audio!
//  5) All 33 `FoleySfxIdV6` 48kHz / 192kbps acoustic studio cues with dedupe
//     windows, optional stereo spatial panning, and natural micro-variation
//     restricted strictly to unpitched mechanical horology ticks.
// ============================================================================

import type {
  BroadcastOptionsStateV6,
  FoleySfxIdV6,
  StageWorldIdV6,
  SymphonyTrackIdV6,
} from '../contracts_v6';

export const ALL_SYMPHONY_TRACK_IDS_V6: readonly SymphonyTrackIdV6[] = [
  'curtain_overture',
  'geneva_horology',
  'riviera_caprice',
  'explorer_odyssey',
  'bunker_espionage',
  'kyoto_nocturne',
  'carnival_accelerando',
  'bathysphere_cathedral',
  'astral_storm_presto',
  'colosseum_finale',
  'backstage_velvet',
  'trophy_hall_majesty',
  'trapdoor_survival_blitz',
  'crown_victory_fanfare',
] as const;

export const ALL_FOLEY_SFX_IDS_V6: readonly FoleySfxIdV6[] = [
  'ui_brass_tap',
  'neve_fader_detent',
  'rotary_knob_click',
  'brass_gear_detent',
  'optical_beam_lock',
  'crystal_hex_claim',
  'iron_chain_shatter',
  'wire_cutter_snip',
  'nixie_spark_crackle',
  'cryptex_stone_tumbler',
  'globe_pin_ruby_click',
  'paddle_spring_slam',
  'trapdoor_hinge_drop',
  'pneumatic_piston_slam',
  'velvet_trunk_clasp',
  'foil_card_flick',
  'relic_pedestal_hum',
  'trophy_pedestal_chime',
  'medal_enamel_clink',
  'screw_rival_slam',
  'twist_siren_chime',
  'clock_horology_tick',
  'clock_escapement_urgent',
  'vault_heavy_unlock',
  'chip_stack_riffle',
  'crowd_warm_applause',
  'crowd_studio_roar',
  'crowd_collective_gasp',
  'streak_chord_1',
  'streak_chord_2',
  'streak_chord_3',
  'streak_chord_4',
  'streak_fanfare_5',
] as const;

export const STAGE_TO_SYMPHONY_TRACK_V6: Readonly<Record<StageWorldIdV6, SymphonyTrackIdV6>> = {
  STAGE_01_VAUDEVILLE_PALACE: 'curtain_overture',
  STAGE_02_GENEVA_CONSERVATORY: 'geneva_horology',
  STAGE_03_MONTE_CARLO_SALON: 'riviera_caprice',
  STAGE_04_CARTOGRAPHIC_ROTUNDA: 'explorer_odyssey',
  STAGE_05_ANALOG_BUNKER_1969: 'bunker_espionage',
  STAGE_06_KYOTO_LACQUER_PAVILION: 'kyoto_nocturne',
  STAGE_07_CARNIVAL_CURIOSITIES: 'carnival_accelerando',
  STAGE_08_SUNKEN_BATHYSPHERE: 'bathysphere_cathedral',
  STAGE_09_ASTRAL_OBSERVATORY: 'astral_storm_presto',
  STAGE_10_SOVEREIGN_COLOSSEUM: 'colosseum_finale',
};

export const STAGE_TO_AMBIENCE_URL_V6: Readonly<Record<StageWorldIdV6, string>> = {
  STAGE_01_VAUDEVILLE_PALACE: './assets/audio/ambience_chamber_room.mp3',
  STAGE_02_GENEVA_CONSERVATORY: './assets/audio/ambience_chamber_room.mp3',
  STAGE_03_MONTE_CARLO_SALON: './assets/audio/ambience_chamber_room.mp3',
  STAGE_04_CARTOGRAPHIC_ROTUNDA: './assets/audio/ambience_london_rain.mp3',
  STAGE_05_ANALOG_BUNKER_1969: './assets/audio/ambience_cairo_vault_air.mp3',
  STAGE_06_KYOTO_LACQUER_PAVILION: './assets/audio/ambience_tokyo_neon_rain.mp3',
  STAGE_07_CARNIVAL_CURIOSITIES: './assets/audio/ambience_ocean_storm_air.mp3',
  STAGE_08_SUNKEN_BATHYSPHERE: './assets/audio/ambience_ocean_storm_air.mp3',
  STAGE_09_ASTRAL_OBSERVATORY: './assets/audio/ambience_london_rain.mp3',
  STAGE_10_SOVEREIGN_COLOSSEUM: './assets/audio/ambience_cairo_vault_air.mp3',
};

// Graceful fallback orchestral themes when a v6 symphony MP3 is unavailable or still downloading
const SYMPHONY_FALLBACK_URLS: Readonly<Record<SymphonyTrackIdV6, string>> = {
  curtain_overture: './assets/audio/music_title_showtime.mp3',
  geneva_horology: './assets/audio/themes/theme_stage1_oakridge.mp3',
  riviera_caprice: './assets/audio/themes/theme_branch_velvet.mp3',
  explorer_odyssey: './assets/audio/themes/theme_stage5_london.mp3',
  bunker_espionage: './assets/audio/music_thinking_bed.mp3',
  kyoto_nocturne: './assets/audio/themes/theme_stage6_tokyo.mp3',
  carnival_accelerando: './assets/audio/music_board_groove.mp3',
  bathysphere_cathedral: './assets/audio/themes/theme_stage7_cairo.mp3',
  astral_storm_presto: './assets/audio/themes/theme_stage3_broadcast.mp3',
  colosseum_finale: './assets/audio/themes/theme_stage8_finale.mp3',
  backstage_velvet: './assets/audio/music_greenroom_lounge.mp3',
  trophy_hall_majesty: './assets/audio/themes/theme_branch_redemption.mp3',
  trapdoor_survival_blitz: './assets/audio/music_finale_tension.mp3',
  crown_victory_fanfare: './assets/audio/music_title_showtime.mp3',
};

// Equal-loudness trim per movement (calibrated for -15.0 LUFS broadcast stems)
const SYMPHONY_TRACK_TRIM: Readonly<Record<SymphonyTrackIdV6, number>> = {
  curtain_overture: 0.94,
  geneva_horology: 0.92,
  riviera_caprice: 0.92,
  explorer_odyssey: 0.94,
  bunker_espionage: 0.90,
  kyoto_nocturne: 0.90,
  carnival_accelerando: 0.95,
  bathysphere_cathedral: 0.92,
  astral_storm_presto: 0.96,
  colosseum_finale: 0.98,
  backstage_velvet: 0.86,
  trophy_hall_majesty: 0.90,
  trapdoor_survival_blitz: 0.98,
  crown_victory_fanfare: 1.0,
};

// Per-cue broadcast gain trim calibrated against 48kHz / 192kbps mastered levels
const FOLEY_TRIM: Readonly<Record<FoleySfxIdV6, number>> = {
  ui_brass_tap: 0.56,
  neve_fader_detent: 0.58,
  rotary_knob_click: 0.64,
  brass_gear_detent: 0.68,
  optical_beam_lock: 0.74,
  crystal_hex_claim: 0.76,
  iron_chain_shatter: 0.86,
  wire_cutter_snip: 0.82,
  nixie_spark_crackle: 0.76,
  cryptex_stone_tumbler: 0.80,
  globe_pin_ruby_click: 0.72,
  paddle_spring_slam: 0.84,
  trapdoor_hinge_drop: 0.92,
  pneumatic_piston_slam: 0.86,
  velvet_trunk_clasp: 0.74,
  foil_card_flick: 0.70,
  relic_pedestal_hum: 0.66,
  trophy_pedestal_chime: 0.82,
  medal_enamel_clink: 0.74,
  screw_rival_slam: 0.92,
  twist_siren_chime: 0.84,
  clock_horology_tick: 0.60,
  clock_escapement_urgent: 0.76,
  vault_heavy_unlock: 0.88,
  chip_stack_riffle: 0.74,
  crowd_warm_applause: 0.72,
  crowd_studio_roar: 0.80,
  crowd_collective_gasp: 0.76,
  streak_chord_1: 0.72,
  streak_chord_2: 0.76,
  streak_chord_3: 0.80,
  streak_chord_4: 0.84,
  streak_fanfare_5: 0.90,
};

// Rapid-duplicate dedupe windows (ms) preventing comb-filtering / +6dB stack spikes
const FOLEY_DEDUPE_MS: Readonly<Record<FoleySfxIdV6, number>> = {
  ui_brass_tap: 28,
  neve_fader_detent: 24,
  rotary_knob_click: 28,
  brass_gear_detent: 32,
  optical_beam_lock: 75,
  crystal_hex_claim: 70,
  iron_chain_shatter: 120,
  wire_cutter_snip: 55,
  nixie_spark_crackle: 65,
  cryptex_stone_tumbler: 70,
  globe_pin_ruby_click: 45,
  paddle_spring_slam: 48,
  trapdoor_hinge_drop: 240,
  pneumatic_piston_slam: 85,
  velvet_trunk_clasp: 95,
  foil_card_flick: 45,
  relic_pedestal_hum: 140,
  trophy_pedestal_chime: 180,
  medal_enamel_clink: 75,
  screw_rival_slam: 220,
  twist_siren_chime: 260,
  clock_horology_tick: 180,
  clock_escapement_urgent: 200,
  vault_heavy_unlock: 180,
  chip_stack_riffle: 60,
  crowd_warm_applause: 420,
  crowd_studio_roar: 480,
  crowd_collective_gasp: 380,
  streak_chord_1: 90,
  streak_chord_2: 90,
  streak_chord_3: 90,
  streak_chord_4: 90,
  streak_fanfare_5: 140,
};

// Micro-rate jitter (+/- 1.5%) allowed ONLY on unpitched horology/mechanical ticks
const UNPITCHED_MICRO_JITTER_CUES = new Set<FoleySfxIdV6>([
  'ui_brass_tap',
  'neve_fader_detent',
  'rotary_knob_click',
  'brass_gear_detent',
  'clock_horology_tick',
  'chip_stack_riffle',
  'foil_card_flick',
]);

// Audience reactions route into Ambience/Crowd bus so BBC voice ducking attenuates them cleanly
const AUDIENCE_FOLEY_CUES = new Set<FoleySfxIdV6>([
  'crowd_warm_applause',
  'crowd_studio_roar',
  'crowd_collective_gasp',
]);

// Core Rupert-Neve broadcast mixing constants
const SYMPHONY_CROSSFADE_SEC = 0.75; // Exact 750ms equal-power cosine dual-deck crossfade
const AMBIENCE_CROSSFADE_SEC = 0.90;
const SYMPHONY_BUS_NOMINAL_TRIM = 0.52;
const AMBIENCE_BUS_NOMINAL_TRIM = 0.34;
const VOICE_DUCK_SYMPHONY_DB = -9.5; // BBC Speech-Priority -9.5 dB attenuation
const VOICE_DUCK_SYMPHONY_LINEAR = Math.pow(10, VOICE_DUCK_SYMPHONY_DB / 20); // ~0.334965
const VOICE_DUCK_AMBIENCE_DB = -7.5;
const VOICE_DUCK_AMBIENCE_LINEAR = Math.pow(10, VOICE_DUCK_AMBIENCE_DB / 20); // ~0.421697
const DUCK_ATTACK_SEC = 0.065;
const DUCK_HOLD_MS = 110;
const DUCK_RELEASE_SEC = 0.42;
const FADER_SMOOTH_TAU_SEC = 0.018;
const VOICE_STOP_FADE_MS = 80;

export type BroadcastAudioOptionsSliceV6 = Pick<
  BroadcastOptionsStateV6,
  | 'masterVolume'
  | 'symphonyVolume'
  | 'foleyVolume'
  | 'voiceVolume'
  | 'ambienceVolume'
  | 'autoVoiceDucking'
  | 'musicEnabled'
  | 'sfxEnabled'
>;

export const DEFAULT_BROADCAST_AUDIO_OPTIONS_V6: Readonly<BroadcastAudioOptionsSliceV6> = {
  masterVolume: 0.90,
  symphonyVolume: 0.78,
  foleyVolume: 0.88,
  voiceVolume: 0.94,
  ambienceVolume: 0.55,
  autoVoiceDucking: true,
  musicEnabled: true,
  sfxEnabled: true,
};

export interface FoleyPlayOptionsV6 {
  volumeScale?: number;
  rate?: number;
  pan?: number;
  force?: boolean;
}

export interface ChannelLevelsV6 {
  master: number;
  masterL: number;
  masterR: number;
  symphony: number;
  symphonyL: number;
  symphonyR: number;
  foley: number;
  voice: number;
  ambience: number;
  masterDb: number;
  symphonyDb: number;
  foleyDb: number;
  voiceDb: number;
  ambienceDb: number;
  isVoiceDucking: boolean;
  duckAttenuationDb: number;
}

interface ActiveDeckV6 {
  id: string;
  url: string;
  source: AudioBufferSourceNode;
  gain: GainNode;
  targetGain: number;
  cleanupTimer: ReturnType<typeof setTimeout> | null;
}

interface ActiveVoiceSessionV6 {
  url: string;
  element: HTMLAudioElement;
  source: MediaElementAudioSourceNode | null;
  gain: GainNode | null;
  onEnded?: () => void;
}

const COSINE_CURVE_POINTS = 64;

function buildCosineFadeInCurve(targetPeak: number): Float32Array {
  const curve = new Float32Array(COSINE_CURVE_POINTS);
  const peak = Math.max(0.0001, targetPeak);
  for (let i = 0; i < COSINE_CURVE_POINTS; i++) {
    const u = i / (COSINE_CURVE_POINTS - 1);
    // Equal-power sine/cosine law: sin(u * pi / 2)
    curve[i] = Math.max(0.0001, Math.sin(u * Math.PI * 0.5) * peak);
  }
  return curve;
}

function buildCosineFadeOutCurve(startPeak: number): Float32Array {
  const curve = new Float32Array(COSINE_CURVE_POINTS);
  const peak = Math.max(0.0001, startPeak);
  for (let i = 0; i < COSINE_CURVE_POINTS; i++) {
    const u = i / (COSINE_CURVE_POINTS - 1);
    // Equal-power cosine law: cos(u * pi / 2) -> sin^2 + cos^2 === 1.0 (0 dB midpoint dip!)
    curve[i] = Math.max(0.0001, Math.cos(u * Math.PI * 0.5) * peak);
  }
  return curve;
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function rmsToDb(rms: number): number {
  if (rms <= 1e-5) return -60;
  return Math.max(-60, Math.min(0, 20 * Math.log10(rms)));
}

/**
 * Calibrated analog broadcast VU meter mapping (-48 dBFS -> 0.0, -3 dBFS -> 1.0)
 * so Rupert-Neve console needles sit naturally in the golden -12..-3 dB sweep zone.
 */
function dbToVu01(db: number): number {
  if (db <= -48) return 0;
  const norm = (db + 48) / 45;
  return Math.max(0, Math.min(1, Math.pow(norm, 1.15)));
}

function smoothAudioParam(
  param: AudioParam,
  target: number,
  now: number,
  tauSec: number,
  isRunning: boolean,
): void {
  const safeTarget = Math.max(0, target);
  try {
    if (!isRunning || tauSec <= 0.001) {
      param.cancelScheduledValues(now);
      param.setValueAtTime(safeTarget, now);
      return;
    }
    const ext = param as AudioParam & { cancelAndHoldAtTime?: (t: number) => AudioParam };
    if (typeof ext.cancelAndHoldAtTime === 'function') {
      ext.cancelAndHoldAtTime(now);
    } else {
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
    }
    param.setTargetAtTime(safeTarget, now, tauSec);
  } catch {
    try {
      param.value = safeTarget;
    } catch {
      // Ignore read-only param errors in stub environments
    }
  }
}

export class StudioAudioEngineV6 {
  private ctx: AudioContext | null = null;

  // Rupert-Neve 5-Bus Gain Nodes
  private masterGain: GainNode | null = null;
  private symphonyGain: GainNode | null = null;
  private symphonyDuckGain: GainNode | null = null;
  private foleyGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private ambienceDuckGain: GainNode | null = null;

  // Broadcast Master Dynamics Chain
  private masterGlueCompressor: DynamicsCompressorNode | null = null;
  private masterCeilingLimiter: DynamicsCompressorNode | null = null;

  // Per-Bus Real-Time RMS Analysers (Zero per-frame allocations!)
  private masterAnalyserL: AnalyserNode | null = null;
  private masterAnalyserR: AnalyserNode | null = null;
  private symphonyAnalyserL: AnalyserNode | null = null;
  private symphonyAnalyserR: AnalyserNode | null = null;
  private foleyAnalyser: AnalyserNode | null = null;
  private voiceAnalyser: AnalyserNode | null = null;
  private ambienceAnalyser: AnalyserNode | null = null;
  private scratchTimeDomain: Float32Array<ArrayBuffer> = new Float32Array(new ArrayBuffer(256 * 4));

  // IEC 60268-17 analog VU needle ballistic state
  private vuState = {
    masterL: 0,
    masterR: 0,
    symphonyL: 0,
    symphonyR: 0,
    foley: 0,
    voice: 0,
    ambience: 0,
    lastSampleMs: 0,
  };

  // Decoded AudioBuffer cache + deduplicated in-flight fetch map
  private urlBuffers = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>();
  private failedUrls = new Set<string>();
  private foleyBuffers = new Map<FoleySfxIdV6, AudioBuffer>();
  private lastFoleyPlayMs = new Map<FoleySfxIdV6, number>();

  // Dual-Deck Symphony & Ambience playback state
  private activeSymphonyDeck: ActiveDeckV6 | null = null;
  private fadingDecks = new Set<ActiveDeckV6>();
  private currentSymphonyTrack: SymphonyTrackIdV6 | null = null;
  private desiredSymphonyTrack: SymphonyTrackIdV6 = 'curtain_overture';
  private symphonyToken = 0;

  private activeAmbienceDeck: ActiveDeckV6 | null = null;
  private desiredAmbienceUrl: string | null = null;
  private ambienceToken = 0;

  // Voice playback & BBC -9.5dB Auto-Voice Ducking state
  private activeVoice: ActiveVoiceSessionV6 | null = null;
  private voiceToken = 0;
  private isVoiceDuckingActive = false;
  private manualVoiceDucking = false;
  private duckReleaseTimer: ReturnType<typeof setTimeout> | null = null;
  private currentSymphonyDuckLinear = 1.0;
  private currentAmbienceDuckLinear = 1.0;

  // Bound Broadcast Options State
  private options: BroadcastAudioOptionsSliceV6 = { ...DEFAULT_BROADCAST_AUDIO_OPTIONS_V6 };

  private unlocked = false;
  private disposed = false;
  private listeners = new Set<() => void>();
  private boundUnlockHandler: (() => void) | null = null;

  constructor(initialOptions?: Partial<BroadcastOptionsStateV6>) {
    if (initialOptions) {
      this.applyOptions(initialOptions);
    }
    this.attachUnlockListeners();
  }

  // --------------------------------------------------------------------------
  // Lifecycle & Gesture Unlock
  // --------------------------------------------------------------------------

  public onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitChange(): void {
    for (const cb of this.listeners) {
      try {
        cb();
      } catch {
        // Keep listeners isolated
      }
    }
  }

  private attachUnlockListeners(): void {
    if (typeof window === 'undefined') return;
    const onGesture = () => {
      this.unlock();
    };
    this.boundUnlockHandler = onGesture;
    const opts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener('pointerdown', onGesture, opts);
    window.addEventListener('touchstart', onGesture, opts);
    window.addEventListener('touchend', onGesture, opts);
    window.addEventListener('click', onGesture, opts);
    window.addEventListener('keydown', onGesture, opts);
  }

  public unlock(): void {
    if (this.disposed) return;
    const wasUnlocked = this.unlocked;
    this.unlocked = true;
    const ctx = this.ensureGraph();
    if (ctx && this.isSuspended(ctx)) {
      void ctx.resume().catch(() => {});
    }
    if (!wasUnlocked) {
      this.prewarmPriorityFoley();
      if (this.options.musicEnabled && this.desiredSymphonyTrack && !this.activeSymphonyDeck) {
        void this.playSymphony(this.desiredSymphonyTrack);
      }
      if (this.options.musicEnabled && this.desiredAmbienceUrl && !this.activeAmbienceDeck) {
        void this.startAmbienceUrl(this.desiredAmbienceUrl);
      }
    }
  }

  public isUnlocked(): boolean {
    return this.unlocked;
  }

  private isSuspended(ctx: AudioContext): boolean {
    const state = ctx.state as string;
    return state === 'suspended' || state === 'interrupted';
  }

  // --------------------------------------------------------------------------
  // Rupert-Neve 5-Bus WebAudio Signal Graph Construction
  // --------------------------------------------------------------------------

  private createBusAnalyser(ctx: AudioContext): AnalyserNode | null {
    try {
      if (typeof ctx.createAnalyser !== 'function') return null;
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      node.smoothingTimeConstant = 0.0; // Custom IEC VU ballistics computed directly on float32 RMS
      return node;
    } catch {
      return null;
    }
  }

  private ensureGraph(): AudioContext | null {
    if (this.disposed || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxCtor) return null;
      try {
        this.ctx = new AudioCtxCtor();
      } catch {
        this.ctx = null;
        return null;
      }
    }

    const ctx = this.ctx;
    if (this.masterGain) {
      if (this.unlocked && this.isSuspended(ctx)) {
        void ctx.resume().catch(() => {});
      }
      return ctx;
    }

    try {
      // Master output gain + Rupert-Neve broadcast glue + brickwall safety limiter
      const masterGain = ctx.createGain();
      masterGain.gain.value = clamp01(this.options.masterVolume);

      let postMasterNode: AudioNode = masterGain;
      if (typeof ctx.createDynamicsCompressor === 'function') {
        const glue = ctx.createDynamicsCompressor();
        glue.threshold.value = -8.0;
        glue.knee.value = 12.0;
        glue.ratio.value = 3.0;
        glue.attack.value = 0.008;
        glue.release.value = 0.14;

        const ceiling = ctx.createDynamicsCompressor();
        ceiling.threshold.value = -1.5;
        ceiling.knee.value = 2.0;
        ceiling.ratio.value = 18.0;
        ceiling.attack.value = 0.0015;
        ceiling.release.value = 0.055;

        masterGain.connect(glue);
        glue.connect(ceiling);
        this.masterGlueCompressor = glue;
        this.masterCeilingLimiter = ceiling;
        postMasterNode = ceiling;
      }

      postMasterNode.connect(ctx.destination);

      // Stereo L/R Master VU meter tap
      const mAnaL = this.createBusAnalyser(ctx);
      const mAnaR = this.createBusAnalyser(ctx);
      if (mAnaL && mAnaR && typeof ctx.createChannelSplitter === 'function') {
        const split = ctx.createChannelSplitter(2);
        postMasterNode.connect(split);
        split.connect(mAnaL, 0);
        split.connect(mAnaR, 1);
        this.masterAnalyserL = mAnaL;
        this.masterAnalyserR = mAnaR;
      } else if (mAnaL) {
        postMasterNode.connect(mAnaL);
        this.masterAnalyserL = mAnaL;
        this.masterAnalyserR = mAnaL;
      }

      // Bus 1: Symphony (Dual-Deck -> symphonyDuckGain -> symphonyGain -> Master + Stereo VU tap)
      const symphonyDuckGain = ctx.createGain();
      symphonyDuckGain.gain.value = this.currentSymphonyDuckLinear;
      const symphonyGain = ctx.createGain();
      symphonyGain.gain.value = this.computeSymphonyBusGain();
      symphonyDuckGain.connect(symphonyGain);
      symphonyGain.connect(masterGain);

      const sAnaL = this.createBusAnalyser(ctx);
      const sAnaR = this.createBusAnalyser(ctx);
      if (sAnaL && sAnaR && typeof ctx.createChannelSplitter === 'function') {
        const sSplit = ctx.createChannelSplitter(2);
        symphonyGain.connect(sSplit);
        sSplit.connect(sAnaL, 0);
        sSplit.connect(sAnaR, 1);
        this.symphonyAnalyserL = sAnaL;
        this.symphonyAnalyserR = sAnaR;
      } else if (sAnaL) {
        symphonyGain.connect(sAnaL);
        this.symphonyAnalyserL = sAnaL;
        this.symphonyAnalyserR = sAnaL;
      }

      // Bus 2: Horology Foley (33 tactile cues -> foleyGain -> Master + VU tap; never voice-ducked!)
      const foleyGain = ctx.createGain();
      foleyGain.gain.value = this.computeFoleyBusGain();
      foleyGain.connect(masterGain);
      const fAna = this.createBusAnalyser(ctx);
      if (fAna) {
        foleyGain.connect(fAna);
        this.foleyAnalyser = fAna;
      }

      // Bus 3: Host & Cast Voice (voice -> voiceGain -> Master + VU tap)
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = clamp01(this.options.voiceVolume);
      voiceGain.connect(masterGain);
      const vAna = this.createBusAnalyser(ctx);
      if (vAna) {
        voiceGain.connect(vAna);
        this.voiceAnalyser = vAna;
      }

      // Bus 4: Stage Room Ambience & Live Audience Crowd (ambienceDuckGain -> ambienceGain -> Master + VU tap)
      const ambienceDuckGain = ctx.createGain();
      ambienceDuckGain.gain.value = this.currentAmbienceDuckLinear;
      const ambienceGain = ctx.createGain();
      ambienceGain.gain.value = this.computeAmbienceBusGain();
      ambienceDuckGain.connect(ambienceGain);
      ambienceGain.connect(masterGain);
      const aAna = this.createBusAnalyser(ctx);
      if (aAna) {
        ambienceGain.connect(aAna);
        this.ambienceAnalyser = aAna;
      }

      this.masterGain = masterGain;
      this.symphonyDuckGain = symphonyDuckGain;
      this.symphonyGain = symphonyGain;
      this.foleyGain = foleyGain;
      this.voiceGain = voiceGain;
      this.ambienceDuckGain = ambienceDuckGain;
      this.ambienceGain = ambienceGain;
    } catch {
      return null;
    }

    if (this.unlocked && this.isSuspended(ctx)) {
      void ctx.resume().catch(() => {});
    }
    return ctx;
  }

  private computeSymphonyBusGain(): number {
    if (!this.options.musicEnabled) return 0;
    return clamp01(this.options.symphonyVolume) * SYMPHONY_BUS_NOMINAL_TRIM;
  }

  private computeFoleyBusGain(): number {
    if (!this.options.sfxEnabled) return 0;
    return clamp01(this.options.foleyVolume);
  }

  private computeAmbienceBusGain(): number {
    if (!this.options.musicEnabled && !this.options.sfxEnabled) return 0;
    return clamp01(this.options.ambienceVolume) * AMBIENCE_BUS_NOMINAL_TRIM;
  }

  // --------------------------------------------------------------------------
  // Broadcast Options Console Real-Time Binding (`BroadcastOptionsStateV6`)
  // --------------------------------------------------------------------------

  public applyOptions(partial: Partial<BroadcastOptionsStateV6>): void {
    const prevMusicEnabled = this.options.musicEnabled;
    const prevAutoDuck = this.options.autoVoiceDucking;

    if (partial.masterVolume !== undefined) {
      this.options.masterVolume = clamp01(partial.masterVolume);
    }
    if (partial.symphonyVolume !== undefined) {
      this.options.symphonyVolume = clamp01(partial.symphonyVolume);
    }
    if (partial.foleyVolume !== undefined) {
      this.options.foleyVolume = clamp01(partial.foleyVolume);
    }
    if (partial.voiceVolume !== undefined) {
      this.options.voiceVolume = clamp01(partial.voiceVolume);
    }
    if (partial.ambienceVolume !== undefined) {
      this.options.ambienceVolume = clamp01(partial.ambienceVolume);
    }
    if (partial.autoVoiceDucking !== undefined) {
      this.options.autoVoiceDucking = Boolean(partial.autoVoiceDucking);
    }
    if (partial.musicEnabled !== undefined) {
      this.options.musicEnabled = Boolean(partial.musicEnabled);
    }
    if (partial.sfxEnabled !== undefined) {
      this.options.sfxEnabled = Boolean(partial.sfxEnabled);
    }

    this.syncBusGainsToContext();

    if (prevAutoDuck !== this.options.autoVoiceDucking) {
      this.recomputeVoiceDuckingEnvelope();
    }

    if (prevMusicEnabled !== this.options.musicEnabled) {
      if (!this.options.musicEnabled) {
        this.stopSymphony(false);
        this.stopAmbience(false);
      } else if (this.unlocked) {
        if (this.desiredSymphonyTrack) {
          void this.playSymphony(this.desiredSymphonyTrack);
        }
        if (this.desiredAmbienceUrl) {
          void this.startAmbienceUrl(this.desiredAmbienceUrl);
        }
      }
    }

    this.emitChange();
  }

  public getOptions(): BroadcastAudioOptionsSliceV6 {
    return { ...this.options };
  }

  private syncBusGainsToContext(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const running = this.ctx.state === 'running';

    if (this.masterGain) {
      smoothAudioParam(this.masterGain.gain, clamp01(this.options.masterVolume), now, FADER_SMOOTH_TAU_SEC, running);
    }
    if (this.symphonyGain) {
      smoothAudioParam(this.symphonyGain.gain, this.computeSymphonyBusGain(), now, FADER_SMOOTH_TAU_SEC, running);
    }
    if (this.foleyGain) {
      smoothAudioParam(this.foleyGain.gain, this.computeFoleyBusGain(), now, FADER_SMOOTH_TAU_SEC, running);
    }
    if (this.voiceGain) {
      smoothAudioParam(this.voiceGain.gain, clamp01(this.options.voiceVolume), now, FADER_SMOOTH_TAU_SEC, running);
    }
    if (this.ambienceGain) {
      smoothAudioParam(this.ambienceGain.gain, this.computeAmbienceBusGain(), now, FADER_SMOOTH_TAU_SEC, running);
    }
    if (this.activeVoice && !this.activeVoice.source) {
      // HTMLAudio fallback element not yet attached to WebAudio graph
      try {
        this.activeVoice.element.volume = clamp01(this.options.voiceVolume * this.options.masterVolume);
      } catch {
        // Ignore
      }
    }
  }

  // --------------------------------------------------------------------------
  // Live Per-Bus RMS VU Meter Telemetry (`getChannelLevels()`)
  // --------------------------------------------------------------------------

  private measureAnalyserRms(analyser: AnalyserNode | null): number {
    if (!analyser || !this.ctx || this.ctx.state !== 'running') return 0;
    try {
      const len = analyser.fftSize;
      if (this.scratchTimeDomain.length < len) {
        this.scratchTimeDomain = new Float32Array(new ArrayBuffer(len * 4));
      }
      analyser.getFloatTimeDomainData(this.scratchTimeDomain);
      let sumSq = 0;
      for (let i = 0; i < len; i++) {
        const s = this.scratchTimeDomain[i];
        sumSq += s * s;
      }
      return Math.sqrt(sumSq / len);
    } catch {
      return 0;
    }
  }

  private stepBallisticNeedle(prev: number, target: number, dtSec: number): number {
    // Classic analog VU needle ballistics: brisk 45ms attack, silky 260ms return
    const tau = target >= prev ? 0.045 : 0.26;
    const alpha = 1 - Math.exp(-Math.max(0.004, Math.min(0.12, dtSec)) / tau);
    const next = prev + (target - prev) * alpha;
    return next < 0.0015 && target < 0.0015 ? 0 : Math.max(0, Math.min(1, next));
  }

  /**
   * Computes live real-time RMS & calibrated VU needle deflection [0..1] across every
   * Rupert-Neve console bus (`master`, `symphony`, `foley`, `voice`, `ambience`).
   * Safe to invoke every `requestAnimationFrame` with zero heap allocations!
   */
  public getChannelLevels(): ChannelLevelsV6 {
    const tNow = nowMs();
    const dtSec = this.vuState.lastSampleMs > 0 ? (tNow - this.vuState.lastSampleMs) / 1000 : 1 / 60;
    this.vuState.lastSampleMs = tNow;

    const rmsML = this.measureAnalyserRms(this.masterAnalyserL);
    const rmsMR = this.measureAnalyserRms(this.masterAnalyserR);
    const rmsSL = this.measureAnalyserRms(this.symphonyAnalyserL);
    const rmsSR = this.measureAnalyserRms(this.symphonyAnalyserR);
    const rmsF = this.measureAnalyserRms(this.foleyAnalyser);
    const rmsV = this.measureAnalyserRms(this.voiceAnalyser);
    const rmsA = this.measureAnalyserRms(this.ambienceAnalyser);

    const dbML = rmsToDb(rmsML);
    const dbMR = rmsToDb(rmsMR);
    const dbSL = rmsToDb(rmsSL);
    const dbSR = rmsToDb(rmsSR);
    const dbF = rmsToDb(rmsF);
    const dbV = rmsToDb(rmsV);
    const dbA = rmsToDb(rmsA);

    this.vuState.masterL = this.stepBallisticNeedle(this.vuState.masterL, dbToVu01(dbML), dtSec);
    this.vuState.masterR = this.stepBallisticNeedle(this.vuState.masterR, dbToVu01(dbMR), dtSec);
    this.vuState.symphonyL = this.stepBallisticNeedle(this.vuState.symphonyL, dbToVu01(dbSL), dtSec);
    this.vuState.symphonyR = this.stepBallisticNeedle(this.vuState.symphonyR, dbToVu01(dbSR), dtSec);
    this.vuState.foley = this.stepBallisticNeedle(this.vuState.foley, dbToVu01(dbF), dtSec);
    this.vuState.voice = this.stepBallisticNeedle(this.vuState.voice, dbToVu01(dbV), dtSec);
    this.vuState.ambience = this.stepBallisticNeedle(this.vuState.ambience, dbToVu01(dbA), dtSec);

    const masterDb = Math.max(dbML, dbMR);
    const symphonyDb = Math.max(dbSL, dbSR);

    return {
      master: 0.5 * (this.vuState.masterL + this.vuState.masterR),
      masterL: this.vuState.masterL,
      masterR: this.vuState.masterR,
      symphony: 0.5 * (this.vuState.symphonyL + this.vuState.symphonyR),
      symphonyL: this.vuState.symphonyL,
      symphonyR: this.vuState.symphonyR,
      foley: this.vuState.foley,
      voice: this.vuState.voice,
      ambience: this.vuState.ambience,
      masterDb,
      symphonyDb,
      foleyDb: dbF,
      voiceDb: dbV,
      ambienceDb: dbA,
      isVoiceDucking: this.isVoiceDuckingActive,
      duckAttenuationDb: this.isVoiceDuckingActive ? VOICE_DUCK_SYMPHONY_DB : 0,
    };
  }

  // --------------------------------------------------------------------------
  // Buffer Loader (Deduplicated, Resilient against SPA HTML 200 fallbacks)
  // --------------------------------------------------------------------------

  private async fetchAndDecode(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
    const cached = this.urlBuffers.get(url);
    if (cached) return cached;
    if (this.failedUrls.has(url)) return null;

    const inflight = this.loadingPromises.get(url);
    if (inflight) return inflight;
    if (typeof fetch !== 'function') return null;

    const task = (async (): Promise<AudioBuffer | null> => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          this.failedUrls.add(url);
          return null;
        }
        const ctype = resp.headers?.get?.('content-type') ?? '';
        if (ctype.includes('text/html')) {
          this.failedUrls.add(url);
          return null;
        }
        const raw = await resp.arrayBuffer();
        if (raw.byteLength < 64) {
          this.failedUrls.add(url);
          return null;
        }
        const decoded = await ctx.decodeAudioData(raw.slice(0));
        this.urlBuffers.set(url, decoded);
        return decoded;
      } catch {
        this.failedUrls.add(url);
        return null;
      } finally {
        this.loadingPromises.delete(url);
      }
    })();

    this.loadingPromises.set(url, task);
    return task;
  }

  private getFoleyUrl(id: FoleySfxIdV6): string {
    return `./assets/audio/v6/sfx/${id}.mp3`;
  }

  private getSymphonyCandidateUrls(trackId: SymphonyTrackIdV6): string[] {
    const primary = `./assets/audio/v6/music/${trackId}.mp3`;
    const fallback = SYMPHONY_FALLBACK_URLS[trackId];
    return fallback && fallback !== primary ? [primary, fallback] : [primary];
  }

  public prewarmPriorityFoley(): void {
    const priority: FoleySfxIdV6[] = [
      'ui_brass_tap',
      'neve_fader_detent',
      'rotary_knob_click',
      'brass_gear_detent',
      'wire_cutter_snip',
      'globe_pin_ruby_click',
      'paddle_spring_slam',
      'clock_horology_tick',
      'clock_escapement_urgent',
      'streak_chord_1',
      'streak_chord_2',
      'streak_chord_3',
      'streak_chord_4',
      'streak_fanfare_5',
    ];
    for (const id of priority) {
      void this.loadFoleyBuffer(id);
    }
  }

  public async prewarmAllFoley(): Promise<void> {
    await Promise.all(ALL_FOLEY_SFX_IDS_V6.map((id) => this.loadFoleyBuffer(id)));
  }

  private async loadFoleyBuffer(id: FoleySfxIdV6): Promise<AudioBuffer | null> {
    const existing = this.foleyBuffers.get(id);
    if (existing) return existing;
    const ctx = this.ensureGraph();
    if (!ctx) return null;
    const decoded = await this.fetchAndDecode(ctx, this.getFoleyUrl(id));
    if (decoded) {
      this.foleyBuffers.set(id, decoded);
    }
    return decoded;
  }

  // --------------------------------------------------------------------------
  // Dual-Deck Equal-Power Cosine Crossfade Symphony Engine (14 Movements)
  // --------------------------------------------------------------------------

  public getCurrentSymphonyTrack(): SymphonyTrackIdV6 | null {
    return this.currentSymphonyTrack;
  }

  public getDesiredSymphonyTrack(): SymphonyTrackIdV6 {
    return this.desiredSymphonyTrack;
  }

  /**
   * Seamless 750ms equal-power cosine dual-deck crossfade to any of the 14
   * `SymphonyTrackIdV6` orchestral movements. Keeps the active deck playing
   * smoothly while the incoming movement loads (zero silent gap!).
   */
  public async playSymphony(
    trackId: SymphonyTrackIdV6,
    opts?: { crossfadeMs?: number; loop?: boolean },
  ): Promise<boolean> {
    this.desiredSymphonyTrack = trackId;
    if (this.disposed || !this.options.musicEnabled) {
      return false;
    }

    // Wait cleanly for first user gesture before starting audio output
    if (!this.unlocked) {
      return false;
    }

    if (this.activeSymphonyDeck && this.activeSymphonyDeck.id === trackId) {
      if (this.ctx && this.isSuspended(this.ctx)) {
        void this.ctx.resume().catch(() => {});
      }
      return true;
    }

    const ctx = this.ensureGraph();
    if (!ctx || !this.symphonyDuckGain) return false;

    const myToken = ++this.symphonyToken;
    const candidates = this.getSymphonyCandidateUrls(trackId);
    let buffer: AudioBuffer | null = null;
    let resolvedUrl = candidates[0];

    for (const url of candidates) {
      const decoded = await this.fetchAndDecode(ctx, url);
      if (decoded) {
        buffer = decoded;
        resolvedUrl = url;
        break;
      }
    }

    if (this.disposed || myToken !== this.symphonyToken || !this.options.musicEnabled || !buffer) {
      return false;
    }

    if (this.isSuspended(ctx)) {
      void ctx.resume().catch(() => {});
    }

    const fadeSec = Math.max(0.05, (opts?.crossfadeMs ?? SYMPHONY_CROSSFADE_SEC * 1000) / 1000);
    const prevDeck = this.activeSymphonyDeck;
    const now = ctx.currentTime;
    const targetTrim = SYMPHONY_TRACK_TRIM[trackId] ?? 0.92;

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = opts?.loop ?? (trackId !== 'crown_victory_fanfare');
      source.loopStart = 0;
      source.loopEnd = buffer.duration;

      const deckGain = ctx.createGain();
      if (ctx.state === 'running') {
        const fadeInCurve = buildCosineFadeInCurve(targetTrim);
        deckGain.gain.setValueAtTime(0.0001, now);
        deckGain.gain.setValueCurveAtTime(fadeInCurve, now, fadeSec);
      } else {
        deckGain.gain.value = targetTrim;
      }

      source.connect(deckGain);
      deckGain.connect(this.symphonyDuckGain);

      const nextDeck: ActiveDeckV6 = {
        id: trackId,
        url: resolvedUrl,
        source,
        gain: deckGain,
        targetGain: targetTrim,
        cleanupTimer: null,
      };

      source.onended = () => {
        if (this.activeSymphonyDeck === nextDeck) {
          this.activeSymphonyDeck = null;
        }
        this.fadingDecks.delete(nextDeck);
        try {
          source.disconnect();
          deckGain.disconnect();
        } catch {
          // Ignore teardown errors
        }
      };

      // Fade out previous deck on the exact complementary cosine curve (sin^2 + cos^2 == 1)
      if (prevDeck) {
        this.activeSymphonyDeck = null;
        this.retireDeckWithCosineFade(prevDeck, fadeSec);
      }

      source.start(now);
      this.activeSymphonyDeck = nextDeck;
      this.currentSymphonyTrack = trackId;
      this.emitChange();
      return true;
    } catch {
      return false;
    }
  }

  /** Convenience helper for the Broadcast Options Console 14-Track Audition Turntable. */
  public auditionSymphonyTrack(trackId: SymphonyTrackIdV6): Promise<boolean> {
    this.unlock();
    return this.playSymphony(trackId, { crossfadeMs: SYMPHONY_CROSSFADE_SEC * 1000, loop: true });
  }

  /** Crossfades both the bespoke Stage World symphony movement and matching acoustic room air. */
  public enterStageWorld(stageId: StageWorldIdV6): void {
    const trackId = STAGE_TO_SYMPHONY_TRACK_V6[stageId];
    const ambUrl = STAGE_TO_AMBIENCE_URL_V6[stageId];
    if (trackId) {
      void this.playSymphony(trackId);
    }
    if (ambUrl) {
      this.setStageAmbienceUrl(ambUrl);
    }
  }

  public stopSymphony(immediate = false): void {
    ++this.symphonyToken;
    const deck = this.activeSymphonyDeck;
    this.activeSymphonyDeck = null;
    this.currentSymphonyTrack = null;
    if (deck) {
      this.retireDeckWithCosineFade(deck, immediate ? 0 : 0.24);
    }
    if (immediate) {
      this.flushFadingDecks();
    }
    this.emitChange();
  }

  // --------------------------------------------------------------------------
  // Stage Acoustic Room-Air Ambience Bus
  // --------------------------------------------------------------------------

  public setStageAmbience(stageId: StageWorldIdV6): void {
    const url = STAGE_TO_AMBIENCE_URL_V6[stageId];
    if (url) {
      this.setStageAmbienceUrl(url);
    }
  }

  public setStageAmbienceUrl(url: string): void {
    this.desiredAmbienceUrl = url;
    if (this.unlocked && this.options.musicEnabled) {
      void this.startAmbienceUrl(url);
    }
  }

  private async startAmbienceUrl(url: string): Promise<void> {
    if (this.disposed || !this.options.musicEnabled || !this.unlocked) return;
    if (this.activeAmbienceDeck && this.activeAmbienceDeck.url === url) return;

    const ctx = this.ensureGraph();
    if (!ctx || !this.ambienceDuckGain) return;

    const myToken = ++this.ambienceToken;
    const buf = await this.fetchAndDecode(ctx, url);
    if (this.disposed || myToken !== this.ambienceToken || !this.options.musicEnabled || !buf) {
      return;
    }

    const now = ctx.currentTime;
    const prev = this.activeAmbienceDeck;
    try {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = 0;
      src.loopEnd = buf.duration;

      const gain = ctx.createGain();
      if (ctx.state === 'running') {
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.setValueCurveAtTime(buildCosineFadeInCurve(1.0), now, AMBIENCE_CROSSFADE_SEC);
      } else {
        gain.gain.value = 1.0;
      }

      src.connect(gain);
      gain.connect(this.ambienceDuckGain);

      const deck: ActiveDeckV6 = {
        id: url,
        url,
        source: src,
        gain,
        targetGain: 1.0,
        cleanupTimer: null,
      };
      src.onended = () => {
        if (this.activeAmbienceDeck === deck) {
          this.activeAmbienceDeck = null;
        }
        this.fadingDecks.delete(deck);
        try {
          src.disconnect();
          gain.disconnect();
        } catch {
          // Ignore
        }
      };

      if (prev) {
        this.activeAmbienceDeck = null;
        this.retireDeckWithCosineFade(prev, AMBIENCE_CROSSFADE_SEC);
      }

      src.start(now);
      this.activeAmbienceDeck = deck;
    } catch {
      // Ignore gracefully
    }
  }

  public stopAmbience(immediate = false): void {
    ++this.ambienceToken;
    const deck = this.activeAmbienceDeck;
    this.activeAmbienceDeck = null;
    if (deck) {
      this.retireDeckWithCosineFade(deck, immediate ? 0 : 0.25);
    }
  }

  private retireDeckWithCosineFade(deck: ActiveDeckV6, fadeSec: number): void {
    const teardown = () => {
      if (deck.cleanupTimer !== null) {
        clearTimeout(deck.cleanupTimer);
        deck.cleanupTimer = null;
      }
      this.fadingDecks.delete(deck);
      try {
        deck.source.stop();
      } catch {
        // Already stopped
      }
      try {
        deck.source.disconnect();
        deck.gain.disconnect();
      } catch {
        // Already disconnected
      }
    };

    if (!this.ctx || fadeSec <= 0.005 || this.ctx.state !== 'running') {
      teardown();
      return;
    }

    this.fadingDecks.add(deck);
    try {
      const now = this.ctx.currentTime;
      const startVal = Math.max(0.0001, Math.min(deck.targetGain, deck.gain.gain.value || deck.targetGain));
      const fadeOutCurve = buildCosineFadeOutCurve(startVal);
      deck.gain.gain.cancelScheduledValues(now);
      deck.gain.gain.setValueAtTime(startVal, now);
      deck.gain.gain.setValueCurveAtTime(fadeOutCurve, now, fadeSec);
      deck.source.stop(now + fadeSec + 0.03);
      deck.cleanupTimer = setTimeout(teardown, Math.ceil(fadeSec * 1000) + 60);
    } catch {
      teardown();
    }
  }

  private flushFadingDecks(): void {
    for (const deck of [...this.fadingDecks]) {
      if (deck.cleanupTimer !== null) {
        clearTimeout(deck.cleanupTimer);
        deck.cleanupTimer = null;
      }
      try {
        deck.source.stop();
        deck.source.disconnect();
        deck.gain.disconnect();
      } catch {
        // Ignore
      }
    }
    this.fadingDecks.clear();
  }

  // --------------------------------------------------------------------------
  // 33 Acoustic Horology Foley & 5 Orchestral Streak Cues
  // --------------------------------------------------------------------------

  public playFoley(id: FoleySfxIdV6, opts?: FoleyPlayOptionsV6): void {
    if (this.disposed || !this.options.sfxEnabled) return;

    const tMs = nowMs();
    if (!opts?.force) {
      const minGap = FOLEY_DEDUPE_MS[id] ?? 30;
      const prev = this.lastFoleyPlayMs.get(id) ?? -Infinity;
      if (tMs - prev < minGap) return;
    }
    this.lastFoleyPlayMs.set(id, tMs);

    const ctx = this.ensureGraph();
    if (!ctx) return;

    const cached = this.foleyBuffers.get(id);
    if (cached) {
      this.triggerFoleyBuffer(ctx, cached, id, opts);
      return;
    }

    const requestedAt = tMs;
    const maxDeferMs = UNPITCHED_MICRO_JITTER_CUES.has(id) ? 180 : 1200;
    void this.loadFoleyBuffer(id).then((buf) => {
      if (this.disposed || !buf || !this.ctx || !this.options.sfxEnabled) return;
      if (nowMs() - requestedAt > maxDeferMs) return;
      this.triggerFoleyBuffer(this.ctx, buf, id, opts);
    });
  }

  private triggerFoleyBuffer(
    ctx: AudioContext,
    buffer: AudioBuffer,
    id: FoleySfxIdV6,
    opts?: FoleyPlayOptionsV6,
  ): void {
    try {
      if (this.unlocked && this.isSuspended(ctx)) {
        void ctx.resume().catch(() => {});
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const jitter = UNPITCHED_MICRO_JITTER_CUES.has(id)
        ? 0.985 + Math.random() * 0.03
        : 1.0;
      const rate = Math.max(0.5, Math.min(1.6, (opts?.rate ?? 1.0) * jitter));
      source.playbackRate.value = rate;

      const cueGain = ctx.createGain();
      const baseTrim = FOLEY_TRIM[id] ?? 0.72;
      cueGain.gain.value = Math.max(0, Math.min(1.5, baseTrim * (opts?.volumeScale ?? 1.0)));

      const destBus = AUDIENCE_FOLEY_CUES.has(id)
        ? (this.ambienceDuckGain ?? this.foleyGain ?? ctx.destination)
        : (this.foleyGain ?? ctx.destination);

      let panner: StereoPannerNode | null = null;
      if (
        opts?.pan !== undefined &&
        Math.abs(opts.pan) > 0.02 &&
        typeof ctx.createStereoPanner === 'function'
      ) {
        panner = ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, opts.pan));
        source.connect(cueGain);
        cueGain.connect(panner);
        panner.connect(destBus);
      } else {
        source.connect(cueGain);
        cueGain.connect(destBus);
      }

      source.onended = () => {
        try {
          source.disconnect();
          cueGain.disconnect();
          panner?.disconnect();
        } catch {
          // Already cleaned up
        }
      };

      source.start(0);
    } catch {
      // Never throw on transient playback glitches
    }
  }

  /** Plays the matching ascending real-orchestra streak stinger (1..5 -> Cmaj9..Cmaj13 Fanfare). */
  public playStreak(streakCount: number): void {
    const clamped = Math.max(1, Math.min(5, Math.floor(streakCount)));
    const map: Record<number, FoleySfxIdV6> = {
      1: 'streak_chord_1',
      2: 'streak_chord_2',
      3: 'streak_chord_3',
      4: 'streak_chord_4',
      5: 'streak_fanfare_5',
    };
    this.playFoley(map[clamped], { rate: 1.0 });
  }

  /** Plays the Geneva horology countdown cadence (`<= 2s` urgent double-pulse, `3..6s` crisp tick). */
  public playCountdownTick(secondsLeft: number): void {
    if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) return;
    const sec = Math.ceil(secondsLeft);
    if (sec <= 2) {
      this.playFoley('clock_escapement_urgent', { volumeScale: sec === 1 ? 1.08 : 0.96 });
    } else if (sec <= 6) {
      this.playFoley('clock_horology_tick', { volumeScale: 0.84 + (6 - sec) * 0.05 });
    }
  }

  // --------------------------------------------------------------------------
  // BBC Speech-Priority Auto-Voice Ducking (-9.5 dB Smooth Envelope) & Voice Bus
  // --------------------------------------------------------------------------

  public setVoiceDucking(active: boolean): void {
    this.manualVoiceDucking = Boolean(active);
    this.recomputeVoiceDuckingEnvelope();
  }

  public isVoiceDucking(): boolean {
    return this.isVoiceDuckingActive;
  }

  private recomputeVoiceDuckingEnvelope(): void {
    const voiceActive = this.manualVoiceDucking || this.isVoicePlaying();
    const shouldDuck = Boolean(this.options.autoVoiceDucking && voiceActive);

    if (shouldDuck) {
      if (this.duckReleaseTimer !== null) {
        clearTimeout(this.duckReleaseTimer);
        this.duckReleaseTimer = null;
      }
      this.applyDuckingGains(true);
      return;
    }

    if (!this.isVoiceDuckingActive) return;

    // If autoVoiceDucking toggle was explicitly switched OFF, restore immediately without hold
    if (!this.options.autoVoiceDucking) {
      if (this.duckReleaseTimer !== null) {
        clearTimeout(this.duckReleaseTimer);
        this.duckReleaseTimer = null;
      }
      this.applyDuckingGains(false);
      return;
    }

    // BBC natural hold (110ms) before smooth 420ms orchestral swell back to 0 dB
    if (this.duckReleaseTimer === null) {
      this.duckReleaseTimer = setTimeout(() => {
        this.duckReleaseTimer = null;
        const stillNeedsDuck =
          this.options.autoVoiceDucking && (this.manualVoiceDucking || this.isVoicePlaying());
        if (!stillNeedsDuck) {
          this.applyDuckingGains(false);
        }
      }, DUCK_HOLD_MS);
    }
  }

  private applyDuckingGains(ducked: boolean): void {
    if (this.isVoiceDuckingActive === ducked) return;
    this.isVoiceDuckingActive = ducked;

    const targetSym = ducked ? VOICE_DUCK_SYMPHONY_LINEAR : 1.0;
    const targetAmb = ducked ? VOICE_DUCK_AMBIENCE_LINEAR : 1.0;
    this.currentSymphonyDuckLinear = targetSym;
    this.currentAmbienceDuckLinear = targetAmb;

    if (this.ctx) {
      const now = this.ctx.currentTime;
      const running = this.ctx.state === 'running';
      const tau = ducked ? DUCK_ATTACK_SEC / 2.2 : DUCK_RELEASE_SEC / 2.6;
      if (this.symphonyDuckGain) {
        smoothAudioParam(this.symphonyDuckGain.gain, targetSym, now, tau, running);
      }
      if (this.ambienceDuckGain) {
        smoothAudioParam(this.ambienceDuckGain.gain, targetAmb, now, tau, running);
      }
    }

    this.emitChange();
  }

  public isVoicePlaying(): boolean {
    const el = this.activeVoice?.element;
    return Boolean(el && !el.paused && !el.ended);
  }

  /**
   * Plays a studio-recorded host/cast voice clip routed through `voiceGain` + `voiceAnalyser`,
   * engaging BBC `-9.5 dB` auto-voice ducking on the symphonic score automatically.
   */
  public playVoiceUrl(url: string, onEnded?: () => void): void {
    const cleanUrl = url.trim();
    if (this.disposed || !cleanUrl) {
      onEnded?.();
      return;
    }

    this.stopVoice(false);
    const myToken = ++this.voiceToken;

    if (this.options.voiceVolume <= 0.001 || this.options.masterVolume <= 0.001) {
      if (onEnded) {
        queueMicrotask(() => {
          if (!this.disposed && myToken === this.voiceToken) onEnded();
        });
      }
      return;
    }

    try {
      const el = new Audio(cleanUrl);
      el.preload = 'auto';
      el.crossOrigin = 'anonymous';
      el.volume = 1.0;

      let source: MediaElementAudioSourceNode | null = null;
      let vGain: GainNode | null = null;

      const ctx = this.unlocked ? this.ensureGraph() : null;
      if (ctx && this.voiceGain && ctx.state === 'running') {
        try {
          source = ctx.createMediaElementSource(el);
          vGain = ctx.createGain();
          vGain.gain.value = 1.0;
          source.connect(vGain);
          vGain.connect(this.voiceGain);
        } catch {
          source = null;
          vGain = null;
          el.volume = clamp01(this.options.voiceVolume * this.options.masterVolume);
        }
      } else {
        el.volume = clamp01(this.options.voiceVolume * this.options.masterVolume);
      }

      const session: ActiveVoiceSessionV6 = { url: cleanUrl, element: el, source, gain: vGain, onEnded };
      this.activeVoice = session;
      this.recomputeVoiceDuckingEnvelope();

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (this.activeVoice === session) {
          this.activeVoice = null;
          this.teardownVoiceNodes(session);
          this.recomputeVoiceDuckingEnvelope();
        }
        if (myToken === this.voiceToken && !this.disposed) {
          onEnded?.();
        }
      };

      el.addEventListener('ended', finish, { once: true });
      el.addEventListener('error', finish, { once: true });

      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          finish();
        });
      }
    } catch {
      this.recomputeVoiceDuckingEnvelope();
      onEnded?.();
    }
  }

  public stopVoice(immediate = false): void {
    ++this.voiceToken;
    const session = this.activeVoice;
    this.activeVoice = null;

    if (session) {
      if (immediate || session.element.paused || session.element.ended) {
        this.teardownVoiceNodes(session);
      } else {
        if (session.gain && this.ctx && this.ctx.state === 'running') {
          smoothAudioParam(session.gain.gain, 0.0001, this.ctx.currentTime, VOICE_STOP_FADE_MS / 3000, true);
        } else {
          try {
            session.element.volume = 0;
          } catch {
            // Ignore
          }
        }
        setTimeout(() => {
          this.teardownVoiceNodes(session);
        }, VOICE_STOP_FADE_MS + 10);
      }
    }

    this.recomputeVoiceDuckingEnvelope();
  }

  private teardownVoiceNodes(session: ActiveVoiceSessionV6): void {
    try {
      session.element.pause();
      session.element.removeAttribute?.('src');
      session.element.load?.();
    } catch {
      // Ignore
    }
    try {
      session.gain?.disconnect();
      session.source?.disconnect();
    } catch {
      // Ignore
    }
  }

  // --------------------------------------------------------------------------
  // Clean Teardown
  // --------------------------------------------------------------------------

  public dispose(): void {
    this.disposed = true;
    if (this.duckReleaseTimer !== null) {
      clearTimeout(this.duckReleaseTimer);
      this.duckReleaseTimer = null;
    }

    this.stopVoice(true);
    this.stopSymphony(true);
    this.stopAmbience(true);
    this.flushFadingDecks();
    this.listeners.clear();

    if (typeof window !== 'undefined' && this.boundUnlockHandler) {
      const opts: AddEventListenerOptions = { passive: true, capture: true };
      window.removeEventListener('pointerdown', this.boundUnlockHandler, opts);
      window.removeEventListener('touchstart', this.boundUnlockHandler, opts);
      window.removeEventListener('touchend', this.boundUnlockHandler, opts);
      window.removeEventListener('click', this.boundUnlockHandler, opts);
      window.removeEventListener('keydown', this.boundUnlockHandler, opts);
      this.boundUnlockHandler = null;
    }

    for (const node of [
      this.masterGain,
      this.symphonyGain,
      this.symphonyDuckGain,
      this.foleyGain,
      this.voiceGain,
      this.ambienceGain,
      this.ambienceDuckGain,
      this.masterGlueCompressor,
      this.masterCeilingLimiter,
      this.masterAnalyserL,
      this.masterAnalyserR,
      this.symphonyAnalyserL,
      this.symphonyAnalyserR,
      this.foleyAnalyser,
      this.voiceAnalyser,
      this.ambienceAnalyser,
    ]) {
      try {
        node?.disconnect();
      } catch {
        // Ignore
      }
    }

    this.masterGain = null;
    this.symphonyGain = null;
    this.symphonyDuckGain = null;
    this.foleyGain = null;
    this.voiceGain = null;
    this.ambienceGain = null;
    this.ambienceDuckGain = null;
    this.masterGlueCompressor = null;
    this.masterCeilingLimiter = null;
    this.masterAnalyserL = null;
    this.masterAnalyserR = null;
    this.symphonyAnalyserL = null;
    this.symphonyAnalyserR = null;
    this.foleyAnalyser = null;
    this.voiceAnalyser = null;
    this.ambienceAnalyser = null;

    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

let sharedEngineV6: StudioAudioEngineV6 | null = null;

export function getSharedStudioAudioEngineV6(
  initialOptions?: Partial<BroadcastOptionsStateV6>,
): StudioAudioEngineV6 {
  if (!sharedEngineV6) {
    sharedEngineV6 = new StudioAudioEngineV6(initialOptions);
  } else if (initialOptions) {
    sharedEngineV6.applyOptions(initialOptions);
  }
  return sharedEngineV6;
}
