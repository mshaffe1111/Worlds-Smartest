// ============================================================================
// WORLD'S SMARTEST v5.0 — Broadcast Studio Audio Engine (ZERO Procedural Oscillators!)
// Plays:
//  1) Adaptive Prime-Time Symphonic Score (ON by default via `ws_v4_music_enabled`,
//     seamless WebAudio dual-deck crossfades, -17.5 LUFS mastered stereo MP3 loops,
//     including v5 `'greenroom'` backstage chamber nocturne)
//  2) Harmonically Ascending Symphonic Streak Stingers (Cmaj9 -> Dmaj9 -> Emaj9 -> Gmaj9 -> Fanfare)
//  3) Horological Countdown Clock Ticks, Urgent Double-Pulse & Broadcast Timeout Chime
//  4) World-Search Escalating Crowd Energy (Small Hall -> TV Studio -> Global Arena + Gasp)
//  5) Tactile Board & v5 Stage Prop Cues (`playBoardCue`: `screw_slam`, `jackpot_sweep`,
//     `polaroid_pin`, `switch_clack` + all v4/v3 Foley cues)
//  6) Click-Free Voice Engine (80ms smooth ramp-down in `stopVoice()`, dual Music 0.30x [-10dB]
//     + Crowd 0.35x WebAudio voice ducking, lazy-cached `v5_voice_manifest.json` via
//     `playV5Voice()` & non-repeating `playRandomHostCategoryVoice()`, plus v4 `playVerifiedVoice()`)
// ============================================================================

import type { VoiceClipEntryV5, VoiceManifestV5 } from '../v5/contracts_v5';

export type SfxCueId =
  | 'ui_tap'
  | 'spin_tick'
  | 'sightline_snap'
  | 'shutter_peel'
  | 'glass_shatter'
  | 'overclock_charge'
  | 'vault_thunk'
  | 'gold_resonance'
  | 'backfire_fracture'
  | 'passport_stamp'
  | 'cutscene_whoosh'
  | 'streak_1'
  | 'streak_2'
  | 'streak_3'
  | 'streak_4'
  | 'streak_5'
  | 'clock_tick'
  | 'clock_urgent'
  | 'buzzer_timeout'
  | 'crowd_small_hall'
  | 'crowd_tv_studio'
  | 'crowd_global_arena'
  | 'crowd_gasp'
  | 'tile_flip'
  | 'padlock_break'
  | 'wheel_tick'
  | 'power_play'
  | 'wedge_earned'
  | 'rival_trap'
  | 'lock_in'
  | 'wrong_answer'
  | 'screw_slam'
  | 'jackpot_sweep'
  | 'polaroid_pin'
  | 'switch_clack';

export type MusicCueId =
  | 'title'
  | 'greenroom'
  | 'board'
  | 'thinking'
  | 'tension'
  | 'finale'
  | 'ambient'
  | 'mystery';

export type AudienceReactionKind = 'applause' | 'roar' | 'gasp';

export type BoardCueKind =
  | 'tile_flip'
  | 'padlock_break'
  | 'wheel_tick'
  | 'power_play'
  | 'wedge_earned'
  | 'rival_trap'
  | 'lock_in'
  | 'wrong_answer'
  | 'screw_slam'
  | 'jackpot_sweep'
  | 'polaroid_pin'
  | 'switch_clack';

export type HostVoiceCategoryV5 =
  | 'board_welcome'
  | 'read_in_tip'
  | 'double_down'
  | 'power_play'
  | 'chain_shatter'
  | 'stage_sweep'
  | 'screw_slammed'
  | 'streak_3'
  | 'streak_4'
  | 'streak_5'
  | 'buzzer_beater'
  | 'tough_miss'
  | 'match_win'
  | 'redemption'
  | 'wedge_earned'
  | 'ending_crown';

export interface StudioAudioManifest {
  musicApproved?: boolean;
  defaultMusicEnabled?: boolean;
  music?: Partial<Record<MusicCueId, string>>;
  roomTone?: string | null;
  sfx?: Partial<Record<string, string>>;
  verifiedVoiceTranscripts?: Record<string, string>;
}

const SFX_STORAGE_KEY = 'ws_studio_sfx_enabled_v2';
const VOICE_STORAGE_KEY = 'ws_studio_voice_enabled_v2';
const V4_MUSIC_STORAGE_KEY = 'ws_v4_music_enabled';
const MUSIC_STORAGE_KEY = 'ws_studio_music_enabled_v2';
const AMBIENCE_V2_STORAGE_KEY = 'ws_ambience_enabled_v2';

// Exact broadcast ducking ratios during Host / Challenger VO playback
const VOICE_DUCK_MUSIC_GAIN = 0.30;
const VOICE_DUCK_CROWD_GAIN = 0.35;
const VOICE_STOP_FADE_MS = 80;
const MUSIC_CROSSFADE_MS = 650;

// Broadcast-mastered stereo MP3 assets in public/assets/audio/
const SFX_CANDIDATES: Record<SfxCueId, string[]> = {
  ui_tap: ['./assets/audio/sfx_ui_tap.mp3'],
  spin_tick: ['./assets/audio/sfx_spin_tick.mp3'],
  sightline_snap: ['./assets/audio/sfx_sightline_snap.mp3'],
  shutter_peel: ['./assets/audio/sfx_shutter_peel.mp3'],
  glass_shatter: ['./assets/audio/sfx_glass_shatter.mp3'],
  overclock_charge: ['./assets/audio/sfx_overclock_charge.mp3'],
  vault_thunk: ['./assets/audio/sfx_vault_thunk.mp3'],
  gold_resonance: ['./assets/audio/sfx_gold_resonance.mp3'],
  backfire_fracture: ['./assets/audio/sfx_backfire_fracture.mp3'],
  passport_stamp: ['./assets/audio/sfx_passport_stamp.mp3'],
  cutscene_whoosh: ['./assets/audio/sfx_shutter_peel.mp3'],
  // 5 distinct harmonically ascending musical reward stingers (ZERO pitch-smear!)
  streak_1: ['./assets/audio/sfx_streak_1.mp3'],
  streak_2: ['./assets/audio/sfx_streak_2.mp3'],
  streak_3: ['./assets/audio/sfx_streak_3.mp3'],
  streak_4: ['./assets/audio/sfx_streak_4.mp3'],
  streak_5: ['./assets/audio/sfx_streak_5.mp3'],
  // Horological countdown clock & timeout chime
  clock_tick: ['./assets/audio/sfx_clock_tick.mp3'],
  clock_urgent: ['./assets/audio/sfx_clock_urgent.mp3'],
  buzzer_timeout: ['./assets/audio/sfx_buzzer_timeout.mp3'],
  // World-Search escalating audience reactions
  crowd_small_hall: ['./assets/audio/sfx_crowd_small_hall.mp3'],
  crowd_tv_studio: ['./assets/audio/sfx_crowd_tv_studio.mp3'],
  crowd_global_arena: ['./assets/audio/sfx_crowd_global_arena.mp3'],
  crowd_gasp: ['./assets/audio/sfx_crowd_gasp.mp3'],
  // Tactile v4 game-show board cues
  tile_flip: ['./assets/audio/sfx_tile_flip.mp3'],
  padlock_break: ['./assets/audio/sfx_padlock_break.mp3'],
  wheel_tick: ['./assets/audio/sfx_wheel_tick.mp3'],
  power_play: ['./assets/audio/sfx_power_play.mp3'],
  wedge_earned: ['./assets/audio/sfx_wedge_earned.mp3'],
  rival_trap: ['./assets/audio/sfx_rival_trap.mp3'],
  lock_in: ['./assets/audio/sfx_lock_in.mp3'],
  wrong_answer: ['./assets/audio/sfx_wrong_answer.mp3'],
  // Tactile v5 stage prop & jackpot cues
  screw_slam: ['./assets/audio/sfx_screw_slam.mp3'],
  jackpot_sweep: ['./assets/audio/sfx_jackpot_sweep.mp3'],
  polaroid_pin: ['./assets/audio/sfx_polaroid_pin.mp3'],
  switch_clack: ['./assets/audio/sfx_switch_clack.mp3'],
};

// Loudness-calibrated against exact 48kHz PCM peak/RMS profiles of public/assets/audio/*.mp3
const SFX_VOLUMES: Record<SfxCueId, number> = {
  ui_tap: 0.48,
  spin_tick: 0.44,
  sightline_snap: 0.54,
  shutter_peel: 0.62,
  glass_shatter: 0.64,
  overclock_charge: 0.56,
  vault_thunk: 0.68,
  gold_resonance: 0.44,
  backfire_fracture: 0.64,
  passport_stamp: 0.70,
  cutscene_whoosh: 0.54,
  streak_1: 0.56,
  streak_2: 0.58,
  streak_3: 0.60,
  streak_4: 0.62,
  streak_5: 0.66,
  clock_tick: 0.54,
  clock_urgent: 0.62,
  buzzer_timeout: 0.64,
  crowd_small_hall: 0.56,
  crowd_tv_studio: 0.62,
  crowd_global_arena: 0.66,
  crowd_gasp: 0.62,
  tile_flip: 0.54,
  padlock_break: 0.62,
  wheel_tick: 0.48,
  power_play: 0.66,
  wedge_earned: 0.68,
  rival_trap: 0.62,
  lock_in: 0.58,
  wrong_answer: 0.58,
  screw_slam: 0.72,
  jackpot_sweep: 0.70,
  polaroid_pin: 0.56,
  switch_clack: 0.54,
};

// Rapid-duplicate dedupe windows (prevents phase flanging & +6dB double-triggers)
const CUE_DEDUPE_MS: Record<SfxCueId, number> = {
  ui_tap: 35,
  spin_tick: 34,
  sightline_snap: 45,
  shutter_peel: 65,
  glass_shatter: 65,
  overclock_charge: 90,
  vault_thunk: 90,
  gold_resonance: 75,
  backfire_fracture: 75,
  passport_stamp: 90,
  cutscene_whoosh: 75,
  streak_1: 80,
  streak_2: 80,
  streak_3: 80,
  streak_4: 80,
  streak_5: 80,
  clock_tick: 220,
  clock_urgent: 240,
  buzzer_timeout: 320,
  crowd_small_hall: 450,
  crowd_tv_studio: 450,
  crowd_global_arena: 450,
  crowd_gasp: 420,
  tile_flip: 55,
  padlock_break: 90,
  wheel_tick: 32,
  power_play: 220,
  wedge_earned: 220,
  rival_trap: 160,
  lock_in: 85,
  wrong_answer: 140,
  screw_slam: 220,
  jackpot_sweep: 260,
  polaroid_pin: 65,
  switch_clack: 55,
};

const CROWD_CUES = new Set<SfxCueId>([
  'crowd_small_hall',
  'crowd_tv_studio',
  'crowd_global_arena',
  'crowd_gasp',
]);

// Equal-loudness broadcast trim per music stem & venue room-air bed
const MUSIC_TRACK_VOLUME_SCALE: Record<string, number> = {
  './assets/audio/music_title_showtime.mp3': 1.0,
  './assets/audio/music_greenroom_lounge.mp3': 0.88,
  './assets/audio/music_board_groove.mp3': 0.90,
  './assets/audio/music_thinking_bed.mp3': 0.82,
  './assets/audio/music_finale_tension.mp3': 0.94,
  './assets/audio/ambience_chamber_room.mp3': 0.72,
  './assets/audio/ambience_cairo_vault_air.mp3': 0.68,
  './assets/audio/ambience_ocean_storm_air.mp3': 0.68,
  './assets/audio/ambience_tokyo_neon_rain.mp3': 0.60,
  './assets/audio/ambience_london_rain.mp3': 0.54,
};

const DEFAULT_V4_MUSIC_MAP: Record<Exclude<MusicCueId, 'ambient'>, string> = {
  title: './assets/audio/music_title_showtime.mp3',
  greenroom: './assets/audio/music_greenroom_lounge.mp3',
  board: './assets/audio/music_board_groove.mp3',
  thinking: './assets/audio/music_thinking_bed.mp3',
  tension: './assets/audio/music_finale_tension.mp3',
  finale: './assets/audio/music_finale_tension.mp3',
  mystery: './assets/audio/music_thinking_bed.mp3',
};

const V5_VOICE_MANIFEST_URL = './data/v5_voice_manifest.json';

const V5_HOST_CATEGORY_ALIASES: Record<string, HostVoiceCategoryV5> = {
  board_welcome: 'board_welcome',
  welcome: 'board_welcome',
  episode_intro: 'board_welcome',
  read_in: 'read_in_tip',
  read_in_tip: 'read_in_tip',
  double_down: 'double_down',
  double_down_win: 'double_down',
  double_down_arm: 'double_down',
  double_down_hype: 'double_down',
  power_play: 'power_play',
  power_play_win: 'power_play',
  power_play_stakes: 'power_play',
  chain_shatter: 'chain_shatter',
  padlock_break: 'chain_shatter',
  shatter: 'chain_shatter',
  stage_sweep: 'stage_sweep',
  jackpot_sweep: 'stage_sweep',
  line_sweep: 'stage_sweep',
  sweep: 'stage_sweep',
  screw_slammed: 'screw_slammed',
  screw_slam: 'screw_slammed',
  screw_rival: 'screw_slammed',
  screw: 'screw_slammed',
  streak_3: 'streak_3',
  streak3: 'streak_3',
  streak_4: 'streak_4',
  streak4: 'streak_4',
  streak_hot: 'streak_4',
  streak_5: 'streak_5',
  streak5: 'streak_5',
  streak_5_plus: 'streak_5',
  buzzer_beater: 'buzzer_beater',
  clutch: 'buzzer_beater',
  tough_miss: 'tough_miss',
  gentle_miss: 'tough_miss',
  miss: 'tough_miss',
  double_down_blow: 'tough_miss',
  power_play_miss: 'tough_miss',
  match_win: 'match_win',
  victory: 'match_win',
  win: 'match_win',
  redemption: 'redemption',
  underdog_redemption: 'redemption',
  match_loss: 'redemption',
  loss: 'redemption',
  wedge_earned: 'wedge_earned',
  crown_wedge_earned: 'wedge_earned',
  wedge: 'wedge_earned',
  ending_crown: 'ending_crown',
  finale_win: 'ending_crown',
};

interface ActiveMusicDeck {
  url: string;
  source: AudioBufferSourceNode;
  gain: GainNode;
  cleanupTimer: ReturnType<typeof setTimeout> | null;
}

interface LegacyAudioFadeState {
  el: HTMLAudioElement;
  rafId: number;
  timerId: ReturnType<typeof setTimeout> | null;
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function normalizeAssetUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('res://')) {
    return `./${trimmed.slice('res://'.length)}`;
  }
  if (trimmed.startsWith('/assets/')) {
    return `.${trimmed}`;
  }
  if (trimmed.startsWith('assets/')) {
    return `./${trimmed}`;
  }
  if (trimmed.startsWith('./') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Bare clip ID -> voice MP3
  if (!trimmed.includes('/')) {
    const withExt =
      trimmed.endsWith('.mp3') || trimmed.endsWith('.wav') || trimmed.endsWith('.ogg')
        ? trimmed
        : `${trimmed}.mp3`;
    return `./assets/voice/${withExt}`;
  }
  return `./${trimmed}`;
}

function normalizeTranscriptText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeTranscriptSimilarity(subtitleText: string, expectedText: string): number {
  const normA = normalizeTranscriptText(subtitleText);
  const normB = normalizeTranscriptText(expectedText);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  const wordsA = normA.split(' ');
  const wordsB = normB.split(' ');
  const lenRatio = Math.min(wordsA.length, wordsB.length) / Math.max(wordsA.length, wordsB.length);
  if (lenRatio < 0.55) return lenRatio * 0.5;

  const countsB = new Map<string, number>();
  for (const w of wordsB) {
    countsB.set(w, (countsB.get(w) ?? 0) + 1);
  }
  let matched = 0;
  for (const w of wordsA) {
    const rem = countsB.get(w) ?? 0;
    if (rem > 0) {
      matched += 1;
      countsB.set(w, rem - 1);
    }
  }
  const union = wordsA.length + wordsB.length - matched;
  const jaccard = union > 0 ? matched / union : 0;
  const containment = matched / Math.max(wordsA.length, wordsB.length);
  return 0.5 * jaccard + 0.5 * containment;
}

function isLegacyV1V2VoiceUrl(normalizedUrl: string): boolean {
  const lower = normalizedUrl.toLowerCase();
  if (!lower.includes('/assets/voice/')) return false;
  if (lower.includes('/assets/voice/v5/')) return false;
  const basename = lower.slice(lower.lastIndexOf('/') + 1);
  return !basename.startsWith('v4_') && !basename.startsWith('vo_');
}

/**
 * Safely ramps a WebAudio AudioParam without Safari/Chrome intrinsic-value discontinuity clicks.
 */
function rampAudioParam(
  param: AudioParam,
  targetValue: number,
  currentTime: number,
  durationSec: number,
  fallbackCurrentValue?: number,
): void {
  const safeTarget = Math.max(0.0001, targetValue);
  const ext = param as AudioParam & {
    cancelAndHoldAtTime?: (cancelTime: number) => AudioParam;
  };
  if (typeof ext.cancelAndHoldAtTime === 'function') {
    ext.cancelAndHoldAtTime(currentTime);
  } else {
    const startVal = Math.max(0.0001, fallbackCurrentValue ?? param.value);
    param.cancelScheduledValues(currentTime);
    param.setValueAtTime(startVal, currentTime);
  }
  if (durationSec <= 0.001) {
    param.setValueAtTime(safeTarget, currentTime);
  } else {
    param.linearRampToValueAtTime(safeTarget, currentTime + durationSec);
  }
}

/**
 * Finds nearest rising zero-crossings around [targetStartSec, targetEndSec] on channel 0
 * so looped sustain segments (such as MAX Overclock hold) cycle with zero boundary clicks.
 */
function findZeroCrossingLoopPoints(
  buffer: AudioBuffer,
  targetStartSec: number,
  targetEndSec: number,
): { loopStart: number; loopEnd: number } | null {
  const dur = buffer.duration;
  if (!Number.isFinite(dur) || dur < 0.4) return null;
  const clampedStart = Math.max(0.05, Math.min(dur * 0.65, targetStartSec));
  const clampedEnd = Math.max(clampedStart + 0.12, Math.min(dur - 0.04, targetEndSec));
  if (clampedEnd - clampedStart < 0.1) return null;

  try {
    if (typeof buffer.getChannelData !== 'function' || buffer.numberOfChannels < 1) {
      return { loopStart: clampedStart, loopEnd: clampedEnd };
    }
    const ch = buffer.getChannelData(0);
    const sr = buffer.sampleRate || 48000;
    const searchRadius = Math.floor(sr * 0.025); // +/- 25ms search window

    const snapRisingZero = (sec: number): number => {
      const center = Math.max(1, Math.min(ch.length - 2, Math.floor(sec * sr)));
      const lo = Math.max(1, center - searchRadius);
      const hi = Math.min(ch.length - 2, center + searchRadius);
      let bestIdx = center;
      let bestScore = Infinity;
      for (let i = lo; i <= hi; i++) {
        if (ch[i - 1] <= 0 && ch[i] >= 0) {
          const dist = Math.abs(i - center);
          const mag = Math.abs(ch[i]) * 500;
          const score = dist + mag;
          if (score < bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }
      }
      return bestIdx / sr;
    };

    const s = snapRisingZero(clampedStart);
    const e = snapRisingZero(clampedEnd);
    if (e - s >= 0.08) {
      return { loopStart: s, loopEnd: e };
    }
    return { loopStart: clampedStart, loopEnd: clampedEnd };
  } catch {
    return { loopStart: clampedStart, loopEnd: clampedEnd };
  }
}

export class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxMasterNode: AudioNode | null = null;
  private musicMasterGain: GainNode | null = null;
  private musicDuckGain: GainNode | null = null;
  private crowdDuckGain: GainNode | null = null;

  private sfxBuffers = new Map<SfxCueId, AudioBuffer>();
  private urlBuffers = new Map<string, AudioBuffer>();
  private loadingUrlPromises = new Map<string, Promise<AudioBuffer | null>>();
  private failedUrls = new Set<string>();

  private sfxEnabled: boolean;
  private voiceEnabled: boolean;
  private musicEnabled: boolean;
  private musicApproved = true;
  private manifestLoaded = false;
  private manifest: StudioAudioManifest = {};

  private currentVoiceEl: HTMLAudioElement | null = null;
  private currentVoiceId = '';
  private voiceToken = 0;
  private pendingVoiceRequest: { url: string; onEnded?: () => void } | null = null;
  private voiceAnalyser: AnalyserNode | null = null;
  private voiceAnalyserData: Uint8Array<ArrayBuffer> | null = null;
  private voiceSourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
  private voiceGainMap = new WeakMap<HTMLAudioElement, GainNode>();
  private retiringVoiceCleanups = new Map<HTMLAudioElement, () => void>();
  private verifiedVoiceTranscripts = new Map<string, string>();
  private lastBlockedVoiceReason: string | null = null;
  private v5VoiceManifest: VoiceManifestV5 | null = null;
  private v5VoiceManifestPromise: Promise<VoiceManifestV5 | null> | null = null;
  private v5HostCategoryHistory = new Map<string, string[]>();

  // WebAudio dual-deck crossfade music state (+ HTMLAudio fallback for minimal environments)
  private activeMusicDeck: ActiveMusicDeck | null = null;
  private fadingMusicDecks = new Set<ActiveMusicDeck>();
  private musicEl: HTMLAudioElement | null = null;
  private fadingMusicEls = new Set<LegacyAudioFadeState>();
  private musicToken = 0;
  private musicFadeRaf = 0;
  private currentMusicCue: MusicCueId = 'title';
  private activeVenueAmbienceUrl = './assets/audio/ambience_chamber_room.mp3';
  private baseMusicVolume = 0.40;
  private isVoiceDucking = false;
  private currentMusicDuckScalar = 1.0;
  private currentCrowdDuckScalar = 1.0;

  private activeChargeSource: AudioBufferSourceNode | null = null;
  private activeChargeGain: GainNode | null = null;
  private chargeStartAudioTime = 0;
  private chargeToken = 0;
  private lastCuePlayMs = new Map<SfxCueId, number>();
  private unlocked = false;
  private disposed = false;

  private boundUnlockHandler: (() => void) | null = null;
  private boundVisibilityHandler: (() => void) | null = null;
  private boundBlurHandler: (() => void) | null = null;

  private onStateChangedListeners = new Set<() => void>();

  constructor() {
    this.sfxEnabled = this.readBoolStorage(SFX_STORAGE_KEY, true);
    this.voiceEnabled = this.readBoolStorage(VOICE_STORAGE_KEY, true);

    // World's Smartest v4.0: Broadcast score & studio energy ON by default (`ws_v4_music_enabled`),
    // while strictly honoring any explicit user mute/toggle preference!
    this.musicApproved = true;
    this.manifest = {
      musicApproved: true,
      defaultMusicEnabled: true,
      music: { ...DEFAULT_V4_MUSIC_MAP },
      roomTone: './assets/audio/ambience_chamber_room.mp3',
    };
    this.musicEnabled = this.readV4MusicStorage(true);

    this.attachGestureAndLifecycleListeners();
    void this.initManifestAndPrewarm();
  }

  private readBoolStorage(key: string, fallback: boolean): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val === 'true' || val === '1') return true;
        if (val === 'false' || val === '0') return false;
      }
    } catch {
      // Ignore private mode restrictions
    }
    return fallback;
  }

  private readV4MusicStorage(fallback: boolean): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const v4 = window.localStorage.getItem(V4_MUSIC_STORAGE_KEY);
        if (v4 === 'true' || v4 === '1') return true;
        if (v4 === 'false' || v4 === '0') return false;
      }
    } catch {
      // Ignore private mode restrictions
    }
    return fallback;
  }

  private writeBoolStorage(key: string, value: boolean): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value ? 'true' : 'false');
      }
    } catch {
      // Ignore write errors
    }
  }

  private writeRawStorage(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore write errors
    }
  }

  public onChange(listener: () => void): () => void {
    this.onStateChangedListeners.add(listener);
    return () => this.onStateChangedListeners.delete(listener);
  }

  private notifyChange(): void {
    for (const fn of this.onStateChangedListeners) {
      fn();
    }
  }

  private isContextSuspended(ctx: AudioContext): boolean {
    const st = ctx.state as string;
    return st === 'suspended' || st === 'interrupted';
  }

  private attachGestureAndLifecycleListeners(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.disposed) return;
      const wasUnlocked = this.unlocked;
      this.unlocked = true;
      const ctx = this.ensureContext();
      if (!wasUnlocked) {
        this.prewarmCoreBuffers();
      }
      if (ctx && this.isContextSuspended(ctx)) {
        void ctx
          .resume()
          .then(() => {
            if (!this.disposed && this.currentVoiceEl && !this.currentVoiceEl.paused) {
              this.attachVoiceAnalyser(this.currentVoiceEl);
            }
          })
          .catch(() => {});
      } else if (this.currentVoiceEl && !this.currentVoiceEl.paused) {
        this.attachVoiceAnalyser(this.currentVoiceEl);
      }
      if (this.pendingVoiceRequest && this.voiceEnabled) {
        const req = this.pendingVoiceRequest;
        this.pendingVoiceRequest = null;
        this.playVoice(req.url, req.onEnded);
      }
      if (this.musicEnabled && this.musicApproved) {
        this.syncMusicPlayback();
      }
    };

    this.boundUnlockHandler = unlock;
    // Capture-phase listeners cover iOS Safari (touchend/click), Android Chrome (pointerdown/touchstart), & Desktop (keydown)
    const capturePassive: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener('pointerdown', unlock, capturePassive);
    window.addEventListener('touchstart', unlock, capturePassive);
    window.addEventListener('touchend', unlock, capturePassive);
    window.addEventListener('click', unlock, capturePassive);
    window.addEventListener('keydown', unlock, capturePassive);

    const onHiddenOrBlur = () => {
      this.stopOverclockCharge();
    };
    this.boundBlurHandler = onHiddenOrBlur;
    window.addEventListener('blur', onHiddenOrBlur, { passive: true });
    window.addEventListener('pagehide', onHiddenOrBlur, { passive: true });

    if (typeof document !== 'undefined') {
      const onVis = () => {
        if (document.hidden) {
          this.stopOverclockCharge();
        }
      };
      this.boundVisibilityHandler = onVis;
      document.addEventListener('visibilitychange', onVis);
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.disposed || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
          this.sfxMasterNode = null;
          this.musicMasterGain = null;
          this.musicDuckGain = null;
          this.crowdDuckGain = null;
        } catch {
          this.ctx = null;
        }
      }
    }
    if (this.ctx && this.isContextSuspended(this.ctx) && this.unlocked) {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Soft broadcast safety limiter on the master output bus so simultaneous layers never clip above 0 dBFS */
  private getSfxOutputNode(ctx: AudioContext): AudioNode {
    if (this.sfxMasterNode) return this.sfxMasterNode;
    try {
      if (typeof ctx.createDynamicsCompressor === 'function') {
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -4;
        comp.knee.value = 6;
        comp.ratio.value = 6;
        comp.attack.value = 0.003;
        comp.release.value = 0.08;
        comp.connect(ctx.destination);
        this.sfxMasterNode = comp;
        return comp;
      }
    } catch {
      // Fall back directly to ctx.destination in minimal environments
    }
    this.sfxMasterNode = ctx.destination;
    return ctx.destination;
  }

  /** Dedicated Crowd SFX bus with smooth WebAudio voice ducking (0.35x when Host/Challenger speaks) */
  private getCrowdOutputNode(ctx: AudioContext): AudioNode {
    if (this.crowdDuckGain) return this.crowdDuckGain;
    try {
      const duckGain = ctx.createGain();
      duckGain.gain.value = this.currentCrowdDuckScalar;
      duckGain.connect(this.getSfxOutputNode(ctx));
      this.crowdDuckGain = duckGain;
      return duckGain;
    } catch {
      return this.getSfxOutputNode(ctx);
    }
  }

  /** Dedicated Broadcast Music bus with master trim + smooth WebAudio voice ducking (0.30x when VO speaks) */
  private getMusicInputNode(ctx: AudioContext): AudioNode | null {
    if (this.musicDuckGain && this.musicMasterGain) {
      return this.musicDuckGain;
    }
    try {
      const duckGain = ctx.createGain();
      duckGain.gain.value = this.currentMusicDuckScalar;
      const masterGain = ctx.createGain();
      masterGain.gain.value = this.baseMusicVolume;
      duckGain.connect(masterGain);
      masterGain.connect(this.getSfxOutputNode(ctx));
      this.musicDuckGain = duckGain;
      this.musicMasterGain = masterGain;
      return duckGain;
    } catch {
      return null;
    }
  }

  public async initManifestAndPrewarm(): Promise<void> {
    if (this.manifestLoaded) return;
    this.manifestLoaded = true;
    void this.loadVoiceTranscriptRegistry();
    if (this.unlocked) {
      this.prewarmCoreBuffers();
    }
  }

  private async loadVoiceTranscriptRegistry(): Promise<void> {
    if (typeof fetch !== 'function') return;
    try {
      const resp = await fetch('./assets/voice/vo_wave2_manifest.json');
      if (!resp.ok) return;
      const contentType = resp.headers?.get?.('content-type') ?? '';
      if (contentType.includes('text/html')) return;
      const data = (await resp.json()) as {
        clips?: Array<{ url?: string; file?: string; id?: string; text?: string }>;
      };
      if (!Array.isArray(data?.clips)) return;
      for (const clip of data.clips) {
        if (!clip?.text) continue;
        if (clip.url) {
          this.verifiedVoiceTranscripts.set(normalizeAssetUrl(clip.url), clip.text);
        }
        if (clip.file) {
          this.verifiedVoiceTranscripts.set(normalizeAssetUrl(clip.file), clip.text);
        }
        if (clip.id) {
          this.verifiedVoiceTranscripts.set(normalizeAssetUrl(clip.id), clip.text);
        }
      }
    } catch {
      // Manifest unavailable in offline/test harness — playVerifiedVoice still enforces strict guards
    }
  }

  private prewarmCoreBuffers(): void {
    // Prewarm core tactile Foley & v4 broadcast cues quietly after first user gesture
    const coreCues: SfxCueId[] = [
      'ui_tap',
      'spin_tick',
      'sightline_snap',
      'shutter_peel',
      'glass_shatter',
      'overclock_charge',
      'vault_thunk',
      'gold_resonance',
      'backfire_fracture',
      'passport_stamp',
      'streak_1',
      'streak_2',
      'streak_3',
      'streak_4',
      'streak_5',
      'clock_tick',
      'clock_urgent',
      'buzzer_timeout',
      'tile_flip',
      'padlock_break',
      'wheel_tick',
      'lock_in',
      'wrong_answer',
      'power_play',
      'wedge_earned',
      'rival_trap',
      'screw_slam',
      'jackpot_sweep',
      'polaroid_pin',
      'switch_clack',
    ];
    for (const cue of coreCues) {
      void this.loadCueBuffer(cue);
    }
  }

  private getCandidateUrls(cue: SfxCueId): string[] {
    const custom = this.manifest.sfx?.[cue] ?? this.manifest.sfx?.[`sfx_${cue}`];
    if (custom) {
      return [normalizeAssetUrl(custom), ...SFX_CANDIDATES[cue]];
    }
    return SFX_CANDIDATES[cue];
  }

  private async fetchAndDecodeUrl(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
    const cachedUrl = this.urlBuffers.get(url);
    if (cachedUrl) return cachedUrl;
    if (this.failedUrls.has(url)) return null;

    const inflight = this.loadingUrlPromises.get(url);
    if (inflight) return inflight;

    const loadPromise = (async (): Promise<AudioBuffer | null> => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) {
          this.failedUrls.add(url);
          return null;
        }
        const contentType = resp.headers?.get?.('content-type') ?? '';
        if (contentType.includes('text/html')) {
          // Vite SPA fallback 200 HTML -> not an audio file!
          this.failedUrls.add(url);
          return null;
        }
        const arrayBuf = await resp.arrayBuffer();
        if (arrayBuf.byteLength < 64) {
          this.failedUrls.add(url);
          return null;
        }
        const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
        this.urlBuffers.set(url, decoded);
        return decoded;
      } catch {
        this.failedUrls.add(url);
        return null;
      } finally {
        this.loadingUrlPromises.delete(url);
      }
    })();

    this.loadingUrlPromises.set(url, loadPromise);
    return loadPromise;
  }

  private async loadCueBuffer(cue: SfxCueId): Promise<AudioBuffer | null> {
    const existing = this.sfxBuffers.get(cue);
    if (existing) return existing;

    const ctx = this.ensureContext();
    if (!ctx) return null;

    const candidates = this.getCandidateUrls(cue);
    for (const url of candidates) {
      const shared = this.urlBuffers.get(url);
      if (shared) {
        this.sfxBuffers.set(cue, shared);
        return shared;
      }
    }

    for (const url of candidates) {
      if (this.failedUrls.has(url)) continue;
      const decoded = await this.fetchAndDecodeUrl(ctx, url);
      if (decoded) {
        this.sfxBuffers.set(cue, decoded);
        return decoded;
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Toggles & Public Status
  // --------------------------------------------------------------------------

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = Boolean(enabled);
    this.writeBoolStorage(SFX_STORAGE_KEY, this.sfxEnabled);
    if (!this.sfxEnabled) {
      this.stopOverclockCharge();
    }
    // Voice acting follows master sound/SFX toggle unless separately controlled
    this.voiceEnabled = this.sfxEnabled;
    this.writeBoolStorage(VOICE_STORAGE_KEY, this.voiceEnabled);
    if (!this.voiceEnabled) {
      this.stopVoice();
    }
    this.notifyChange();
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.voiceEnabled = Boolean(enabled);
    this.writeBoolStorage(VOICE_STORAGE_KEY, this.voiceEnabled);
    if (!this.voiceEnabled) {
      this.stopVoice();
    }
    this.notifyChange();
  }

  public isMusicAvailable(): boolean {
    return this.musicApproved;
  }

  public isMusicEnabled(): boolean {
    return this.musicApproved && this.musicEnabled;
  }

  public isMasterAudioActive(): boolean {
    return this.sfxEnabled || this.voiceEnabled || this.isMusicEnabled();
  }

  public setMusicEnabled(enabled: boolean): boolean {
    if (!this.musicApproved) {
      this.musicEnabled = false;
      this.writeBoolStorage(V4_MUSIC_STORAGE_KEY, false);
      this.writeBoolStorage(MUSIC_STORAGE_KEY, false);
      this.writeRawStorage(AMBIENCE_V2_STORAGE_KEY, '0');
      this.stopMusic();
      this.notifyChange();
      return false;
    }
    this.musicEnabled = Boolean(enabled);
    this.writeBoolStorage(V4_MUSIC_STORAGE_KEY, this.musicEnabled);
    this.writeBoolStorage(MUSIC_STORAGE_KEY, this.musicEnabled);
    this.writeRawStorage(AMBIENCE_V2_STORAGE_KEY, this.musicEnabled ? '1' : '0');
    this.syncMusicPlayback();
    this.notifyChange();
    return this.musicEnabled;
  }

  public toggleMusic(): boolean {
    return this.setMusicEnabled(!this.isMusicEnabled());
  }

  public toggleSfx(): boolean {
    this.setSfxEnabled(!this.sfxEnabled);
    return this.sfxEnabled;
  }

  public getCurrentMusicCue(): MusicCueId {
    return this.currentMusicCue;
  }

  public isVoiceDucked(): boolean {
    return this.isVoiceDucking;
  }

  public getVoiceDuckGains(): { music: number; crowd: number } {
    return {
      music: this.currentMusicDuckScalar,
      crowd: this.currentCrowdDuckScalar,
    };
  }

  // --------------------------------------------------------------------------
  // Broadcast SFX, Musical Streaks, Clock Ticks, Crowd & Board Cues
  // --------------------------------------------------------------------------

  public playSfx(
    cue: SfxCueId,
    options?: { rate?: number; volumeScale?: number; force?: boolean },
  ): void {
    if (this.disposed || !this.sfxEnabled) return;

    const tMs = nowMs();
    if (!options?.force) {
      const minGap = CUE_DEDUPE_MS[cue] ?? 35;
      const prevMs = this.lastCuePlayMs.get(cue) ?? -Infinity;
      if (tMs - prevMs < minGap) return;
    }
    this.lastCuePlayMs.set(cue, tMs);

    const ctx = this.ensureContext();
    const cached =
      this.sfxBuffers.get(cue) ??
      this.getCandidateUrls(cue)
        .map((u) => this.urlBuffers.get(u))
        .find((b): b is AudioBuffer => Boolean(b));

    if (ctx && cached) {
      this.sfxBuffers.set(cue, cached);
      this.triggerBuffer(ctx, cached, cue, options?.rate, options?.volumeScale);
      return;
    }

    // Await shared in-flight decode Promise (never drops first-tap SFX during prewarm!)
    const requestedAt = tMs;
    const maxDeferMs = cue === 'spin_tick' || cue === 'wheel_tick' ? 180 : 1200;
    void this.loadCueBuffer(cue).then((buf) => {
      if (this.disposed || !buf || !this.ctx || !this.sfxEnabled) return;
      if (nowMs() - requestedAt > maxDeferMs) return;
      this.triggerBuffer(this.ctx, buf, cue, options?.rate, options?.volumeScale);
    });
  }

  private triggerBuffer(
    ctx: AudioContext,
    buffer: AudioBuffer,
    cue: SfxCueId,
    rate?: number,
    volumeScale = 1.0,
  ): void {
    try {
      if (this.isContextSuspended(ctx)) {
        void ctx.resume().catch(() => {});
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // Subtle +/-2% natural micro-variation ONLY on mechanical escapement ticks so repeats stay organic
      const naturalJitter = cue === 'spin_tick' ? 0.98 + Math.random() * 0.04 : 1.0;
      source.playbackRate.value = Math.max(0.5, Math.min(1.6, (rate ?? 1.0) * naturalJitter));

      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, SFX_VOLUMES[cue] * volumeScale));

      const destNode = CROWD_CUES.has(cue)
        ? this.getCrowdOutputNode(ctx)
        : this.getSfxOutputNode(ctx);

      source.connect(gain);
      gain.connect(destNode);
      source.onended = () => {
        try {
          source.disconnect();
          gain.disconnect();
        } catch {
          // Ignore teardown errors
        }
      };
      source.start(0);
    } catch {
      // Ignore playback errors cleanly
    }
  }

  /**
   * True harmonically ascending musical streak reward progression (ZERO microtonal pitch-smearing!):
   *   1: Cmaj9 | 2: Dmaj9 | 3: Emaj9 | 4: Gmaj9 | 5+: Radiant Octave Fanfare
   */
  public playStreakFanfare(streak: number): void {
    if (this.disposed || !this.sfxEnabled) return;
    const clamped = Math.max(1, Math.min(5, Math.floor(streak))) as 1 | 2 | 3 | 4 | 5;
    this.playSfx(`streak_${clamped}`, { rate: 1.0 });
  }

  /**
   * Horological studio countdown clock & timeout cadence:
   *   - 6s..3s : crisp studio clock tick (`sfx_clock_tick.mp3`)
   *   - 2s..1s : urgent double-pulse heartbeat tick (`sfx_clock_urgent.mp3`)
   *   - <= 0s  : warm broadcast timeout chime (`sfx_buzzer_timeout.mp3`)
   */
  public playCountdownTick(secondsLeft: number): void {
    if (this.disposed || !this.sfxEnabled || !Number.isFinite(secondsLeft)) return;
    if (secondsLeft <= 0) {
      this.playSfx('buzzer_timeout');
      return;
    }
    const sec = Math.ceil(secondsLeft);
    if (sec <= 2) {
      this.playSfx('clock_urgent', { volumeScale: sec === 1 ? 1.08 : 0.96 });
      return;
    }
    if (sec <= 6) {
      // Subtle organic urgency swell from 6s -> 3s without pitch distortion
      const swell = 0.80 + (6 - sec) * 0.06;
      this.playSfx('clock_tick', { volumeScale: swell });
    }
  }

  /**
   * World-Search escalating audience energy (routed through dedicated Crowd Duck Bus = 0.35x during VO!):
   *   - Tiers 1–2: intimate room claps (`sfx_crowd_small_hall.mp3`)
   *   - Tiers 3–5: lively TV studio applause (`sfx_crowd_tv_studio.mp3`)
   *   - Tiers 6–8: massive global arena ovation (`sfx_crowd_global_arena.mp3`)
   *   - kind='gasp': collective studio audience gasp (`sfx_crowd_gasp.mp3`)
   */
  public playAudienceReaction(tierNumber: number, kind: AudienceReactionKind = 'applause'): void {
    if (this.disposed || !this.sfxEnabled) return;
    const tier = Math.max(1, Math.min(8, Math.floor(Number.isFinite(tierNumber) ? tierNumber : 1)));

    if (kind === 'gasp') {
      const scale = tier >= 6 ? 1.05 : tier >= 3 ? 0.96 : 0.86;
      this.playSfx('crowd_gasp', { volumeScale: scale });
      return;
    }

    const roarBoost = kind === 'roar' ? 1.15 : 1.0;
    if (tier <= 2) {
      this.playSfx('crowd_small_hall', { volumeScale: roarBoost });
    } else if (tier <= 5) {
      this.playSfx('crowd_tv_studio', { volumeScale: roarBoost });
    } else {
      this.playSfx('crowd_global_arena', { volumeScale: roarBoost });
    }
  }

  /**
   * Tactile v4 board & game-show cues (`tile_flip`, `padlock_break`, `wheel_tick`,
   * `power_play`, `wedge_earned`, `rival_trap`, `lock_in`, `wrong_answer`).
   */
  public playBoardCue(kind: BoardCueKind): void {
    if (this.disposed || !this.sfxEnabled) return;
    if (kind === 'wheel_tick') {
      const pegJitter = 0.97 + Math.random() * 0.06;
      this.playSfx('wheel_tick', { rate: pegJitter });
      return;
    }
    this.playSfx(kind);
  }

  /**
   * Starts physical Overclock charge Foley swell while holding the Overclock bar.
   * Ramps pitch smoothly across the 810ms Conviction curve and sustains seamlessly at
   * zero-crossing loop points if held at MAX (6.0x) until release/cancel/timeout/modal/back.
   */
  public startOverclockCharge(): void {
    if (this.disposed || !this.sfxEnabled) return;
    this.stopOverclockCharge();
    const myToken = ++this.chargeToken;

    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.isContextSuspended(ctx)) {
      void ctx.resume().catch(() => {});
    }

    const buf =
      this.sfxBuffers.get('overclock_charge') ??
      this.getCandidateUrls('overclock_charge')
        .map((u) => this.urlBuffers.get(u))
        .find((b): b is AudioBuffer => Boolean(b));

    const launch = (audioBuf: AudioBuffer) => {
      if (this.disposed || !this.sfxEnabled || myToken !== this.chargeToken) return;
      try {
        if (this.isContextSuspended(ctx)) {
          void ctx.resume().catch(() => {});
        }
        const t = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = audioBuf;

        const loopPts = findZeroCrossingLoopPoints(audioBuf, 0.56, 0.76);
        if (loopPts) {
          src.loop = true;
          src.loopStart = loopPts.loopStart;
          src.loopEnd = loopPts.loopEnd;
        }

        src.playbackRate.setValueAtTime(0.92, t);
        src.playbackRate.linearRampToValueAtTime(1.42, t + 0.81);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.linearRampToValueAtTime(SFX_VOLUMES.overclock_charge, t + 0.81);

        src.connect(gain);
        gain.connect(this.getSfxOutputNode(ctx));
        src.onended = () => {
          try {
            src.disconnect();
            gain.disconnect();
          } catch {
            // Already disconnected
          }
        };
        src.start(0);
        this.activeChargeSource = src;
        this.activeChargeGain = gain;
        this.chargeStartAudioTime = t;
      } catch {
        // Ignore
      }
    };

    if (buf) {
      this.sfxBuffers.set('overclock_charge', buf);
      launch(buf);
    } else {
      void this.loadCueBuffer('overclock_charge').then((loaded) => {
        if (loaded && myToken === this.chargeToken) {
          launch(loaded);
        }
      });
    }
  }

  /** Smoothly and immediately stops Overclock charge Foley (click-free 45ms fade on hardware clock) */
  public stopOverclockCharge(): void {
    ++this.chargeToken;
    const src = this.activeChargeSource;
    const gain = this.activeChargeGain;
    const startT = this.chargeStartAudioTime;
    this.activeChargeSource = null;
    this.activeChargeGain = null;

    if (src && gain && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        const frac = Math.max(0, Math.min(1, (t - startT) / 0.81));
        const approxCurrent = 0.18 + (SFX_VOLUMES.overclock_charge - 0.18) * frac;
        rampAudioParam(gain.gain, 0.0001, t, 0.045, approxCurrent);

        if (this.ctx.state === 'running') {
          src.stop(t + 0.055);
        } else {
          src.stop();
          src.disconnect();
          gain.disconnect();
        }
      } catch {
        try {
          src.stop();
          src.disconnect();
          gain.disconnect();
        } catch {
          // Ignore already-stopped source
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Verified Neural Voice Acting + Smooth 80ms Fade-Out + Dual Ducking
  // --------------------------------------------------------------------------

  public registerVerifiedVoiceTranscript(clipOrUrl: string, transcript: string): void {
    const url = normalizeAssetUrl(clipOrUrl);
    if (url && transcript.trim()) {
      this.verifiedVoiceTranscripts.set(url, transcript.trim());
    }
  }

  public getLastBlockedVoiceReason(): string | null {
    return this.lastBlockedVoiceReason;
  }

  /**
   * Voice integrity guard: verifies that `voiceUrl`'s recorded transcript matches `subtitleText`
   * (and optional `transcriptExpectation`) so mismatched legacy v1/v2 `.mp3` clips can NEVER
   * play over v4 World Tour lines!
   *
   * Returns `true` if verified and playback was initiated; `false` if blocked (still fires `onEnded`).
   */
  public playVerifiedVoice(
    voiceUrl: string | null | undefined,
    subtitleText: string,
    transcriptExpectation?: string,
    onEnded?: () => void,
  ): boolean {
    const fireEndedAsync = () => {
      if (onEnded) {
        queueMicrotask(() => {
          if (!this.disposed) onEnded();
        });
      }
    };

    if (this.disposed || !voiceUrl || !voiceUrl.trim() || !subtitleText || !subtitleText.trim()) {
      this.lastBlockedVoiceReason = 'empty_url_or_subtitle';
      fireEndedAsync();
      return false;
    }

    const normalizedUrl = normalizeAssetUrl(voiceUrl);
    const knownTranscript = this.verifiedVoiceTranscripts.get(normalizedUrl);

    // 1. If we know the recorded transcript for this clip from manifest/registry, subtitle MUST match it!
    if (knownTranscript !== undefined) {
      if (computeTranscriptSimilarity(subtitleText, knownTranscript) < 0.78) {
        this.lastBlockedVoiceReason = `manifest_mismatch:${normalizedUrl}`;
        fireEndedAsync();
        return false;
      }
    }

    // 2. If caller passed an explicit transcript expectation, subtitle MUST match it!
    if (transcriptExpectation !== undefined) {
      if (
        !transcriptExpectation.trim() ||
        computeTranscriptSimilarity(subtitleText, transcriptExpectation) < 0.78
      ) {
        this.lastBlockedVoiceReason = `expectation_mismatch:${normalizedUrl}`;
        fireEndedAsync();
        return false;
      }
    }

    // 3. Fail-closed guard for legacy v1/v2 story `.mp3` clips in `./assets/voice/` (non-`v4_` filenames):
    //    NEVER allow an unverified v1/v2 recording to play over v4 subtitles without a verified transcript match!
    if (isLegacyV1V2VoiceUrl(normalizedUrl)) {
      if (knownTranscript === undefined && transcriptExpectation === undefined) {
        this.lastBlockedVoiceReason = `unverified_legacy_v1v2_clip:${normalizedUrl}`;
        fireEndedAsync();
        return false;
      }
    }

    this.lastBlockedVoiceReason = null;
    this.playVoice(normalizedUrl, onEnded);
    return true;
  }

  /**
   * Lazily loads & caches `public/data/v5_voice_manifest.json` (`VoiceManifestV5`).
   * Hydrates `verifiedVoiceTranscripts` for all 132 v5 cast clips on first load.
   */
  public async loadV5VoiceManifest(): Promise<VoiceManifestV5 | null> {
    if (this.v5VoiceManifest) return this.v5VoiceManifest;
    if (this.v5VoiceManifestPromise) return this.v5VoiceManifestPromise;
    if (typeof fetch !== 'function') return null;

    const loader = (async (): Promise<VoiceManifestV5 | null> => {
      try {
        const resp = await fetch(V5_VOICE_MANIFEST_URL);
        if (!resp.ok) return null;
        const contentType = resp.headers?.get?.('content-type') ?? '';
        if (contentType.includes('text/html')) return null;
        const data = (await resp.json()) as VoiceManifestV5;
        if (!data || !data.clips || typeof data.clips !== 'object') return null;

        this.v5VoiceManifest = data;
        for (const entry of Object.values(data.clips)) {
          if (entry?.url && entry?.transcript) {
            this.verifiedVoiceTranscripts.set(normalizeAssetUrl(entry.url), entry.transcript);
          }
        }
        return data;
      } catch {
        return null;
      } finally {
        if (!this.v5VoiceManifest) {
          this.v5VoiceManifestPromise = null;
        }
      }
    })();

    this.v5VoiceManifestPromise = loader;
    return loader;
  }

  private resolveV5ClipEntry(manifest: VoiceManifestV5, rawClipId: string): VoiceClipEntryV5 | null {
    const trimmed = rawClipId.trim();
    if (!trimmed) return null;

    let cleanId = trimmed;
    const slashIdx = cleanId.lastIndexOf('/');
    if (slashIdx >= 0) {
      cleanId = cleanId.slice(slashIdx + 1);
    }
    if (cleanId.toLowerCase().endsWith('.mp3')) {
      cleanId = cleanId.slice(0, -4);
    }

    const direct = manifest.clips[cleanId];
    if (direct) return direct;

    // Resilient suffix alias resolution for peer callers (`_intro` -> `_walkout`, `_clap_*` -> `_reply_*`, etc.)
    const aliasRules: ReadonlyArray<[RegExp, string]> = [
      [/_intro$/, '_walkout'],
      [/_clap_bold$/, '_reply_bold'],
      [/_clap_respect$/, '_reply_respect'],
      [/_clap_witty$/, '_reply_witty'],
      [/_trap$/, '_trap_taunt'],
      [/_screwed$/, '_screwed_react'],
      [/^vo_cold_open_(\d+)$/, 'vo_cold_$1'],
      [/^vo_sam_brief_(\d+)$/, 'vo_sam_$1'],
    ];
    for (const [pattern, replacement] of aliasRules) {
      if (pattern.test(cleanId)) {
        const candidate = cleanId.replace(pattern, replacement);
        if (manifest.clips[candidate]) {
          return manifest.clips[candidate];
        }
      }
    }

    return null;
  }

  /** Returns cached metadata for a v5 voice clip if `v5_voice_manifest.json` has been loaded. */
  public getV5VoiceClipMeta(clipId: string): VoiceClipEntryV5 | null {
    if (!this.v5VoiceManifest || !clipId) return null;
    return this.resolveV5ClipEntry(this.v5VoiceManifest, clipId);
  }

  /**
   * Plays a studio-mastered v5 cast voice clip from `public/data/v5_voice_manifest.json`
   * with lazy-cached manifest lookup, optional `expectedSubstring` transcript guard,
   * -10dB WebAudio music ducking, and 80ms click-free fade handoff.
   */
  public async playV5Voice(
    clipId: string,
    expectedSubstring?: string,
    onEnded?: () => void,
  ): Promise<boolean> {
    const fireEndedAsync = () => {
      if (onEnded) {
        queueMicrotask(() => {
          if (!this.disposed) onEnded();
        });
      }
    };

    if (this.disposed || !clipId || !clipId.trim()) {
      this.lastBlockedVoiceReason = 'v5_empty_clip_id';
      fireEndedAsync();
      return false;
    }

    const manifest = await this.loadV5VoiceManifest();
    if (this.disposed || !manifest) {
      this.lastBlockedVoiceReason = 'v5_manifest_unavailable';
      fireEndedAsync();
      return false;
    }

    const entry = this.resolveV5ClipEntry(manifest, clipId);
    if (!entry || !entry.url) {
      this.lastBlockedVoiceReason = `v5_clip_not_found:${clipId}`;
      fireEndedAsync();
      return false;
    }

    if (expectedSubstring !== undefined && expectedSubstring.trim().length > 0) {
      const normSub = normalizeTranscriptText(expectedSubstring);
      const normTranscript = normalizeTranscriptText(entry.transcript);
      const isSubstringMatch = normSub.length > 0 && normTranscript.includes(normSub);
      const similarity = isSubstringMatch
        ? 1.0
        : computeTranscriptSimilarity(expectedSubstring, entry.transcript);
      if (!isSubstringMatch && similarity < 0.6) {
        this.lastBlockedVoiceReason = `v5_transcript_mismatch:${entry.clipId}`;
        fireEndedAsync();
        return false;
      }
    }

    if (!this.voiceEnabled) {
      this.lastBlockedVoiceReason = 'voice_disabled';
      fireEndedAsync();
      return false;
    }

    this.lastBlockedVoiceReason = null;
    this.playVoice(entry.url, onEnded);
    return true;
  }

  /**
   * Plays a non-repeating random Host Max Sterling voice clip for the requested gameplay
   * category (Hades-style anti-fatigue ring buffer; supports lowercase v5 categories AND
   * v4 `SituationalQuipCategory` uppercase aliases).
   */
  public async playRandomHostCategoryVoice(
    category: HostVoiceCategoryV5 | string,
    onEnded?: () => void,
  ): Promise<boolean> {
    if (this.disposed || !category || !category.trim()) {
      if (onEnded) {
        queueMicrotask(() => {
          if (!this.disposed) onEnded();
        });
      }
      return false;
    }

    const manifest = await this.loadV5VoiceManifest();
    if (this.disposed || !manifest) {
      if (onEnded) {
        queueMicrotask(() => {
          if (!this.disposed) onEnded();
        });
      }
      return false;
    }

    const rawKey = category.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const canonical: string = V5_HOST_CATEGORY_ALIASES[rawKey] ?? rawKey;
    const prefix = `vo_max_${canonical}_`;
    const exactId = `vo_max_${canonical}`;

    const candidates = Object.values(manifest.clips).filter(
      (c) =>
        c.speaker === 'max_sterling' &&
        (c.clipId.startsWith(prefix) || c.clipId === exactId),
    );

    if (candidates.length === 0) {
      this.lastBlockedVoiceReason = `v5_host_category_empty:${category}`;
      if (onEnded) {
        queueMicrotask(() => {
          if (!this.disposed) onEnded();
        });
      }
      return false;
    }

    const seen = this.v5HostCategoryHistory.get(canonical) ?? [];
    let fresh = candidates.filter((c) => !seen.includes(c.clipId));
    if (fresh.length === 0) {
      // Exhausted category pool: reset ring while avoiding immediate back-to-back repeat
      const lastClip = seen[seen.length - 1];
      seen.length = 0;
      fresh =
        candidates.length > 1 && lastClip
          ? candidates.filter((c) => c.clipId !== lastClip)
          : candidates;
    }

    const picked = fresh[Math.floor(Math.random() * fresh.length) % fresh.length];
    seen.push(picked.clipId);
    this.v5HostCategoryHistory.set(canonical, seen);

    return this.playV5Voice(picked.clipId, undefined, onEnded);
  }

  public playVoice(clipOrUrl: string, onEnded?: () => void): void {
    const url = normalizeAssetUrl(clipOrUrl);
    if (this.disposed || !url) {
      onEnded?.();
      return;
    }

    // Smoothly retire any previous VO line (80ms click-free fade, keeping ducking steady during handoff)
    this.stopVoiceInternal(false, this.voiceEnabled);
    const myToken = ++this.voiceToken;

    if (!this.voiceEnabled) {
      this.setVoiceDucking(false);
      if (onEnded) {
        queueMicrotask(() => {
          if (myToken === this.voiceToken && !this.disposed) {
            onEnded();
          }
        });
      }
      return;
    }

    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.92;
      this.currentVoiceEl = audio;
      this.currentVoiceId = url;
      this.setVoiceDucking(true);
      this.attachVoiceAnalyser(audio);

      let endedCalled = false;
      const finish = () => {
        if (endedCalled) return;
        endedCalled = true;
        if (myToken !== this.voiceToken) return;
        if (this.currentVoiceEl === audio) {
          this.currentVoiceEl = null;
          this.currentVoiceId = '';
          this.setVoiceDucking(false);
        }
        onEnded?.();
      };

      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', finish, { once: true });

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (myToken !== this.voiceToken || this.disposed) return;

          // Browser blocked autoplay prior to first user click — queue cleanly for first gesture!
          if (!this.unlocked && this.voiceEnabled) {
            if (this.currentVoiceEl === audio) {
              this.currentVoiceEl = null;
              this.currentVoiceId = '';
              this.setVoiceDucking(false);
            }
            this.pendingVoiceRequest = { url, onEnded };
          } else {
            finish();
          }
        });
      }
    } catch {
      if (myToken === this.voiceToken) {
        this.currentVoiceEl = null;
        this.currentVoiceId = '';
        this.setVoiceDucking(false);
        onEnded?.();
      }
    }
  }

  /**
   * Stops active VO playback cleanly with a smooth 80ms click-free ramp-down (ZERO hard 0ms chop!).
   * Pass `immediate = true` only for synchronous teardown (e.g. `dispose()`).
   */
  public stopVoice(immediate = false): void {
    this.stopVoiceInternal(immediate, false);
  }

  private finalizeVoiceElementTeardown(el: HTMLAudioElement): void {
    this.retiringVoiceCleanups.delete(el);
    try {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        // Ignore unseekable state
      }
      if (typeof el.removeAttribute === 'function') {
        el.removeAttribute('src');
      } else {
        el.src = '';
      }
      if (typeof el.load === 'function') {
        el.load();
      }
    } catch {
      // Ignore teardown errors
    }
    const gainNode = this.voiceGainMap.get(el);
    if (gainNode) {
      try {
        gainNode.disconnect();
      } catch {
        // Already disconnected
      }
    }
    const srcNode = this.voiceSourceMap.get(el);
    if (srcNode) {
      try {
        srcNode.disconnect();
      } catch {
        // Already disconnected
      }
    }
  }

  private stopVoiceInternal(immediate: boolean, keepDucking: boolean): void {
    // Advance token FIRST so any late error/ended event from a retiring clip is 100% ignored!
    ++this.voiceToken;
    this.pendingVoiceRequest = null;

    const el = this.currentVoiceEl;
    this.currentVoiceEl = null;
    this.currentVoiceId = '';

    if (el) {
      if (immediate || el.paused || el.ended) {
        this.finalizeVoiceElementTeardown(el);
      } else {
        // Smooth 80ms click-free ramp-down on WebAudio GainNode + HTMLAudioElement volume!
        const gainNode = this.voiceGainMap.get(el);
        if (gainNode && this.ctx && this.ctx.state === 'running') {
          try {
            rampAudioParam(gainNode.gain, 0.0001, this.ctx.currentTime, VOICE_STOP_FADE_MS / 1000, 1.0);
          } catch {
            // Fall through to HTMLAudio volume ramp
          }
        }

        const startVol = Math.max(0, Math.min(1, Number.isFinite(el.volume) ? el.volume : 0.92));
        const fadeStartMs = nowMs();
        let finished = false;
        let stepTimer: ReturnType<typeof setTimeout> | null = null;
        let deadlineTimer: ReturnType<typeof setTimeout> | null = null;

        const finishNow = () => {
          if (finished) return;
          finished = true;
          if (stepTimer !== null) {
            clearTimeout(stepTimer);
            stepTimer = null;
          }
          if (deadlineTimer !== null) {
            clearTimeout(deadlineTimer);
            deadlineTimer = null;
          }
          try {
            el.volume = 0;
          } catch {
            // Ignore read-only volume
          }
          this.finalizeVoiceElementTeardown(el);
        };

        this.retiringVoiceCleanups.set(el, finishNow);

        const tickFade = () => {
          if (finished) return;
          const elapsed = nowMs() - fadeStartMs;
          const frac = Math.max(0, 1 - elapsed / VOICE_STOP_FADE_MS);
          try {
            el.volume = Math.max(0, Math.min(1, startVol * frac));
          } catch {
            // Ignore
          }
          if (elapsed >= VOICE_STOP_FADE_MS) {
            finishNow();
          } else {
            stepTimer = setTimeout(tickFade, 16);
          }
        };
        stepTimer = setTimeout(tickFade, 16);
        deadlineTimer = setTimeout(finishNow, VOICE_STOP_FADE_MS + 4);
      }
    }

    if (!keepDucking) {
      this.setVoiceDucking(false);
    }
  }

  public isVoicePlaying(): boolean {
    return Boolean(this.currentVoiceEl && !this.currentVoiceEl.paused && !this.currentVoiceEl.ended);
  }

  public getCurrentVoiceUrl(): string {
    return this.currentVoiceId;
  }

  public getActiveVoiceElement(): HTMLAudioElement | null {
    return this.currentVoiceEl;
  }

  private attachVoiceAnalyser(audioEl: HTMLAudioElement): void {
    // Never route HTMLAudioElement into a suspended AudioContext (silences pre-unlock output)
    if (!this.unlocked) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    try {
      if (!this.voiceAnalyser) {
        this.voiceAnalyser = ctx.createAnalyser();
        this.voiceAnalyser.fftSize = 128;
        this.voiceAnalyser.smoothingTimeConstant = 0.76;
        this.voiceAnalyserData = new Uint8Array(
          new ArrayBuffer(this.voiceAnalyser.frequencyBinCount),
        );
      }
      let src = this.voiceSourceMap.get(audioEl);
      if (!src) {
        src = ctx.createMediaElementSource(audioEl);
        const vGain = ctx.createGain();
        vGain.gain.value = 1.0;
        this.voiceSourceMap.set(audioEl, src);
        this.voiceGainMap.set(audioEl, vGain);
        src.connect(vGain);
        vGain.connect(this.voiceAnalyser);
        this.voiceAnalyser.connect(ctx.destination);
      }
    } catch {
      // Safe fallback if MediaElementSource cannot attach
    }
  }

  /**
   * Real-time [0..1] voice speaking amplitude for CharacterStageActor 2.5D rim-light & lip/breath pulse!
   */
  public getVoiceAmplitude01(): number {
    if (!this.isVoicePlaying()) return 0;
    if (this.voiceAnalyser && this.voiceAnalyserData) {
      try {
        this.voiceAnalyser.getByteFrequencyData(this.voiceAnalyserData);
        let sum = 0;
        const bins = Math.min(28, this.voiceAnalyserData.length);
        for (let i = 1; i < bins; i++) {
          sum += this.voiceAnalyserData[i];
        }
        const avg = sum / Math.max(1, bins - 1) / 255;
        if (avg > 0.01) {
          return Math.min(1, avg * 2.1);
        }
      } catch {
        // Fallback below
      }
    }
    const t = nowMs() * 0.012;
    return 0.25 + 0.35 * Math.abs(Math.sin(t) * Math.cos(t * 0.63));
  }

  // --------------------------------------------------------------------------
  // Adaptive Broadcast Score & Smooth Crossfaded Music Engine
  // --------------------------------------------------------------------------

  /**
   * Updates venue-matched acoustic room-air bed (used when `currentMusicCue === 'ambient'`).
   * Supports both legacy venue codes (`ch`, `gb`, `jp`, `eg`, `global`) and v4 `VenueStageThemeId`s.
   */
  public setVenueAmbience(venueCode: string): void {
    const code = (venueCode || 'ch').toLowerCase();
    const map: Record<string, string> = {
      ch: './assets/audio/ambience_chamber_room.mp3',
      studio: './assets/audio/ambience_chamber_room.mp3',
      tier1_community_hall: './assets/audio/ambience_chamber_room.mp3',
      tier1_oakridge: './assets/audio/ambience_chamber_room.mp3',
      tier2_civic_theater: './assets/audio/ambience_chamber_room.mp3',
      tier2_lyric: './assets/audio/ambience_chamber_room.mp3',
      tier3_regional_tv: './assets/audio/ambience_chamber_room.mp3',
      tier3_channel7: './assets/audio/ambience_chamber_room.mp3',
      tier4_national_arena: './assets/audio/ambience_chamber_room.mp3',
      tier4_primetime: './assets/audio/ambience_chamber_room.mp3',
      gb: './assets/audio/ambience_london_rain.mp3',
      br: './assets/audio/ambience_london_rain.mp3',
      tier5_london_rotunda: './assets/audio/ambience_london_rain.mp3',
      tier5_london: './assets/audio/ambience_london_rain.mp3',
      jp: './assets/audio/ambience_tokyo_neon_rain.mp3',
      sg: './assets/audio/ambience_tokyo_neon_rain.mp3',
      tier6_tokyo_skydome: './assets/audio/ambience_tokyo_neon_rain.mp3',
      tier6_tokyo: './assets/audio/ambience_tokyo_neon_rain.mp3',
      eg: './assets/audio/ambience_cairo_vault_air.mp3',
      is: './assets/audio/ambience_cairo_vault_air.mp3',
      ledger: './assets/audio/ambience_cairo_vault_air.mp3',
      tier7_cairo_pavilion: './assets/audio/ambience_cairo_vault_air.mp3',
      tier7_cairo: './assets/audio/ambience_cairo_vault_air.mp3',
      global: './assets/audio/ambience_ocean_storm_air.mp3',
      tier8_global_finale: './assets/audio/ambience_ocean_storm_air.mp3',
      tier8_finale: './assets/audio/ambience_ocean_storm_air.mp3',
    };
    this.activeVenueAmbienceUrl = map[code] ?? './assets/audio/ambience_chamber_room.mp3';
    this.manifest.roomTone = this.activeVenueAmbienceUrl;
    if (this.isMusicEnabled() && this.currentMusicCue === 'ambient') {
      this.syncMusicPlayback();
    }
  }

  /**
   * Smoothly crossfades to the requested broadcast music stem:
   *   - `'title'`     -> Grand Symphonic Overture (`music_title_showtime.mp3`)
   *   - `'greenroom'` -> Warm Chamber Symphony Nocturne (`music_greenroom_lounge.mp3`)
   *   - `'board'`     -> Scherzo Podium Promenade (`music_board_groove.mp3`)
   *   - `'thinking'`  -> Symphonic Clockwork Suspense (`music_thinking_bed.mp3`)
   *   - `'tension'`   -> 1.4-Billion Championship Symphony (`music_finale_tension.mp3`)
   *   - `'finale'`    -> 1.4-Billion Championship Symphony (`music_finale_tension.mp3`)
   *   - `'mystery'`   -> Focused contemplation bed (`music_thinking_bed.mp3`)
   *   - `'ambient'`   -> Venue-matched acoustic room-air bed
   */
  public setMusicCue(cue: MusicCueId): void {
    this.currentMusicCue = cue;
    if (this.isMusicEnabled()) {
      this.syncMusicPlayback();
    }
  }

  private resolveMusicUrl(cue: MusicCueId): string | null {
    if (!this.musicApproved) return null;
    if (cue === 'ambient') {
      const room = this.manifest.roomTone ?? this.activeVenueAmbienceUrl;
      return room ? normalizeAssetUrl(room) : null;
    }
    const mapped =
      this.manifest.music?.[cue] ??
      DEFAULT_V4_MUSIC_MAP[cue] ??
      this.manifest.roomTone ??
      this.activeVenueAmbienceUrl;
    return mapped ? normalizeAssetUrl(mapped) : null;
  }

  private getTrackScale(url: string): number {
    return MUSIC_TRACK_VOLUME_SCALE[url] ?? 0.90;
  }

  private getTargetFallbackMusicVolume(url?: string): number {
    const cueUrl = url ?? this.musicEl?.dataset?.cueUrl ?? this.activeVenueAmbienceUrl;
    const trim = this.getTrackScale(cueUrl);
    return Math.max(0, Math.min(1, this.baseMusicVolume * trim * this.currentMusicDuckScalar));
  }

  /**
   * Smoothly ducks BOTH music (`0.30x`) and crowd beds (`0.35x`) via WebAudio gain transitions
   * whenever Host Max Sterling or a Challenger speaks.
   */
  public setVoiceDucking(ducking: boolean): void {
    if (this.isVoiceDucking === ducking) return;
    this.isVoiceDucking = ducking;
    const targetMusic = ducking ? VOICE_DUCK_MUSIC_GAIN : 1.0;
    const targetCrowd = ducking ? VOICE_DUCK_CROWD_GAIN : 1.0;
    const prevMusic = this.currentMusicDuckScalar;
    const prevCrowd = this.currentCrowdDuckScalar;
    this.currentMusicDuckScalar = targetMusic;
    this.currentCrowdDuckScalar = targetCrowd;

    const fadeSec = ducking ? 0.14 : 0.36;
    if (this.ctx) {
      const t = this.ctx.currentTime;
      if (this.musicDuckGain) {
        try {
          if (this.ctx.state === 'running') {
            rampAudioParam(this.musicDuckGain.gain, targetMusic, t, fadeSec, prevMusic);
          } else {
            this.musicDuckGain.gain.value = targetMusic;
          }
        } catch {
          this.musicDuckGain.gain.value = targetMusic;
        }
      }
      if (this.crowdDuckGain) {
        try {
          if (this.ctx.state === 'running') {
            rampAudioParam(
              this.crowdDuckGain.gain,
              targetCrowd,
              t,
              ducking ? 0.12 : 0.34,
              prevCrowd,
            );
          } else {
            this.crowdDuckGain.gain.value = targetCrowd;
          }
        } catch {
          this.crowdDuckGain.gain.value = targetCrowd;
        }
      }
    }

    if (this.musicEl) {
      this.rampFallbackMusicVolumeTo(this.getTargetFallbackMusicVolume(), ducking ? 150 : 360);
    }
  }

  private cancelFallbackMusicFade(): void {
    if (this.musicFadeRaf !== 0 && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.musicFadeRaf);
      this.musicFadeRaf = 0;
    }
  }

  private rampFallbackMusicVolumeTo(targetVol: number, durationMs: number): void {
    const el = this.musicEl;
    if (!el) return;
    this.cancelFallbackMusicFade();
    const clampedTarget = Math.max(0, Math.min(1, targetVol));
    if (durationMs <= 0 || typeof requestAnimationFrame !== 'function') {
      el.volume = clampedTarget;
      return;
    }
    const startVol = el.volume;
    if (Math.abs(clampedTarget - startVol) < 0.005) {
      el.volume = clampedTarget;
      return;
    }
    const startMs = nowMs();
    const token = this.musicToken;
    const step = () => {
      if (token !== this.musicToken || this.musicEl !== el || this.disposed) {
        this.musicFadeRaf = 0;
        return;
      }
      const u = Math.max(0, Math.min(1, (nowMs() - startMs) / durationMs));
      el.volume = Math.max(0, Math.min(1, startVol + (clampedTarget - startVol) * u));
      if (u < 1) {
        this.musicFadeRaf = requestAnimationFrame(step);
      } else {
        this.musicFadeRaf = 0;
      }
    };
    this.musicFadeRaf = requestAnimationFrame(step);
  }

  private retireWebAudioDeck(deck: ActiveMusicDeck, fadeMs: number): void {
    const cleanup = () => {
      if (deck.cleanupTimer !== null) {
        clearTimeout(deck.cleanupTimer);
        deck.cleanupTimer = null;
      }
      this.fadingMusicDecks.delete(deck);
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

    if (!this.ctx || fadeMs <= 0 || this.ctx.state !== 'running') {
      cleanup();
      return;
    }

    this.fadingMusicDecks.add(deck);
    try {
      const t = this.ctx.currentTime;
      const fadeSec = fadeMs / 1000;
      rampAudioParam(deck.gain.gain, 0.0001, t, fadeSec, this.getTrackScale(deck.url));
      deck.source.stop(t + fadeSec + 0.025);
      deck.cleanupTimer = setTimeout(cleanup, fadeMs + 45);
    } catch {
      cleanup();
    }
  }

  private retireFallbackAudioElement(el: HTMLAudioElement, fadeMs: number): void {
    const teardown = () => {
      try {
        el.pause();
        if (typeof el.removeAttribute === 'function') {
          el.removeAttribute('src');
        } else {
          el.src = '';
        }
        if (typeof el.load === 'function') {
          el.load();
        }
      } catch {
        // Ignore
      }
    };

    if (fadeMs <= 0 || el.paused) {
      teardown();
      return;
    }

    const startVol = Math.max(0, Math.min(1, el.volume));
    const steps = 6;
    const stepMs = Math.max(16, Math.floor(fadeMs / steps));
    let i = 0;
    const state: LegacyAudioFadeState = { el, rafId: 0, timerId: null };
    this.fadingMusicEls.add(state);

    const tick = () => {
      i += 1;
      try {
        el.volume = Math.max(0, startVol * (1 - i / steps));
      } catch {
        // Ignore
      }
      if (i >= steps) {
        this.fadingMusicEls.delete(state);
        teardown();
      } else {
        state.timerId = setTimeout(tick, stepMs);
      }
    };
    state.timerId = setTimeout(tick, stepMs);
  }

  private syncMusicPlayback(): void {
    if (this.disposed || !this.isMusicEnabled()) {
      this.stopMusic();
      return;
    }
    const url = this.resolveMusicUrl(this.currentMusicCue);
    if (!url) {
      this.stopMusic();
      return;
    }

    // Do not attempt audio start before first user gesture; unlock listener calls syncMusicPlayback()!
    if (!this.unlocked) {
      return;
    }

    // Already playing this exact stem on WebAudio deck? Keep seamless!
    if (this.activeMusicDeck && this.activeMusicDeck.url === url) {
      if (this.ctx && this.isContextSuspended(this.ctx)) {
        void this.ctx.resume().catch(() => {});
      }
      return;
    }

    // Already playing this exact stem on HTMLAudio fallback?
    if (this.musicEl && this.musicEl.dataset.cueUrl === url) {
      this.rampFallbackMusicVolumeTo(this.getTargetFallbackMusicVolume(url), 180);
      if (this.musicEl.paused) {
        void this.musicEl.play().catch(() => {});
      }
      return;
    }

    const myMusicToken = ++this.musicToken;
    const ctx = this.ensureContext();
    const musicBus = ctx ? this.getMusicInputNode(ctx) : null;

    // Prefer gapless WebAudio BufferSource dual-deck crossfade when AudioContext & fetch exist!
    if (ctx && musicBus && typeof fetch === 'function') {
      void this.startWebAudioMusicDeck(ctx, musicBus, url, myMusicToken);
      return;
    }

    this.startFallbackHtmlAudioMusic(url, myMusicToken);
  }

  private async startWebAudioMusicDeck(
    ctx: AudioContext,
    musicBus: AudioNode,
    url: string,
    myToken: number,
  ): Promise<void> {
    let buf = await this.fetchAndDecodeUrl(ctx, url);
    let effectiveUrl = url;
    if (!buf && url !== './assets/audio/ambience_chamber_room.mp3') {
      effectiveUrl = './assets/audio/ambience_chamber_room.mp3';
      buf = await this.fetchAndDecodeUrl(ctx, effectiveUrl);
    }
    if (this.disposed || myToken !== this.musicToken || !this.isMusicEnabled()) return;
    if (!buf) {
      // Fallback gracefully to HTMLAudioElement if WebAudio decode failed
      this.startFallbackHtmlAudioMusic(url, myToken);
      return;
    }

    try {
      if (this.isContextSuspended(ctx)) {
        void ctx.resume().catch(() => {});
      }

      const prevDeck = this.activeMusicDeck;
      const hadPrev = Boolean(prevDeck || this.musicEl);
      const fadeMs = hadPrev ? MUSIC_CROSSFADE_MS : 360;
      const fadeSec = fadeMs / 1000;

      if (prevDeck) {
        this.activeMusicDeck = null;
        this.retireWebAudioDeck(prevDeck, fadeMs);
      }
      if (this.musicEl) {
        const oldEl = this.musicEl;
        this.musicEl = null;
        this.cancelFallbackMusicFade();
        this.retireFallbackAudioElement(oldEl, fadeMs);
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = 0;
      src.loopEnd = buf.duration;

      const deckGain = ctx.createGain();
      const targetScale = this.getTrackScale(effectiveUrl);
      const t = ctx.currentTime;
      if (ctx.state === 'running') {
        deckGain.gain.setValueAtTime(0.0001, t);
        deckGain.gain.linearRampToValueAtTime(targetScale, t + fadeSec);
      } else {
        deckGain.gain.value = targetScale;
      }

      src.connect(deckGain);
      deckGain.connect(musicBus);

      const deck: ActiveMusicDeck = {
        url: effectiveUrl,
        source: src,
        gain: deckGain,
        cleanupTimer: null,
      };
      src.onended = () => {
        if (this.activeMusicDeck === deck) {
          this.activeMusicDeck = null;
        }
        this.fadingMusicDecks.delete(deck);
        try {
          src.disconnect();
          deckGain.disconnect();
        } catch {
          // Ignore
        }
      };

      src.start(0);
      this.activeMusicDeck = deck;
    } catch {
      this.startFallbackHtmlAudioMusic(effectiveUrl, myToken);
    }
  }

  private startFallbackHtmlAudioMusic(url: string, myMusicToken: number): void {
    const prevEl = this.musicEl;
    const fadeMs = prevEl ? MUSIC_CROSSFADE_MS : 280;
    if (prevEl) {
      this.musicEl = null;
      this.cancelFallbackMusicFade();
      this.retireFallbackAudioElement(prevEl, fadeMs);
    }

    try {
      const el = new Audio(url);
      el.loop = true;
      el.preload = 'auto';
      el.dataset.cueUrl = url;
      el.volume = 0;
      el.addEventListener(
        'error',
        () => {
          if (myMusicToken !== this.musicToken || this.musicEl !== el || this.disposed) return;
          if (url !== './assets/audio/ambience_chamber_room.mp3') {
            el.src = './assets/audio/ambience_chamber_room.mp3';
            el.dataset.cueUrl = './assets/audio/ambience_chamber_room.mp3';
            if (this.unlocked && this.isMusicEnabled()) {
              void el.play().catch(() => {});
              this.rampFallbackMusicVolumeTo(
                this.getTargetFallbackMusicVolume('./assets/audio/ambience_chamber_room.mp3'),
                260,
              );
            }
          }
        },
        { once: true },
      );
      this.musicEl = el;
      void el
        .play()
        .then(() => {
          if (myMusicToken === this.musicToken && this.musicEl === el) {
            this.rampFallbackMusicVolumeTo(this.getTargetFallbackMusicVolume(url), fadeMs);
          }
        })
        .catch(() => {});
    } catch {
      this.musicEl = null;
    }
  }

  public stopMusic(immediate = false): void {
    ++this.musicToken;
    this.cancelFallbackMusicFade();

    const fadeMs = immediate ? 0 : 180;
    if (this.activeMusicDeck) {
      const deck = this.activeMusicDeck;
      this.activeMusicDeck = null;
      this.retireWebAudioDeck(deck, fadeMs);
    }
    if (immediate) {
      for (const deck of [...this.fadingMusicDecks]) {
        if (deck.cleanupTimer !== null) clearTimeout(deck.cleanupTimer);
        try {
          deck.source.stop();
          deck.source.disconnect();
          deck.gain.disconnect();
        } catch {
          // Ignore
        }
      }
      this.fadingMusicDecks.clear();
    }

    const el = this.musicEl;
    this.musicEl = null;
    if (el) {
      this.retireFallbackAudioElement(el, fadeMs);
    }
    if (immediate) {
      for (const st of [...this.fadingMusicEls]) {
        if (st.timerId !== null) clearTimeout(st.timerId);
        try {
          st.el.pause();
          st.el.removeAttribute?.('src');
          st.el.load?.();
        } catch {
          // Ignore
        }
      }
      this.fadingMusicEls.clear();
    }
  }

  public dispose(): void {
    this.disposed = true;
    // Synchronously flush any retiring VO fade timers before closing context
    for (const finishFn of [...this.retiringVoiceCleanups.values()]) {
      finishFn();
    }
    this.retiringVoiceCleanups.clear();

    this.stopVoice(true);
    this.stopMusic(true);
    this.stopOverclockCharge();
    this.onStateChangedListeners.clear();

    if (typeof window !== 'undefined') {
      if (this.boundUnlockHandler) {
        const capturePassive: AddEventListenerOptions = { passive: true, capture: true };
        window.removeEventListener('pointerdown', this.boundUnlockHandler, capturePassive);
        window.removeEventListener('touchstart', this.boundUnlockHandler, capturePassive);
        window.removeEventListener('touchend', this.boundUnlockHandler, capturePassive);
        window.removeEventListener('click', this.boundUnlockHandler, capturePassive);
        window.removeEventListener('keydown', this.boundUnlockHandler, capturePassive);
        this.boundUnlockHandler = null;
      }
      if (this.boundBlurHandler) {
        window.removeEventListener('blur', this.boundBlurHandler);
        window.removeEventListener('pagehide', this.boundBlurHandler);
        this.boundBlurHandler = null;
      }
    }
    if (typeof document !== 'undefined' && this.boundVisibilityHandler) {
      document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
      this.boundVisibilityHandler = null;
    }

    for (const node of [this.musicDuckGain, this.musicMasterGain, this.crowdDuckGain]) {
      if (node) {
        try {
          node.disconnect();
        } catch {
          // Ignore
        }
      }
    }
    this.musicDuckGain = null;
    this.musicMasterGain = null;
    this.crowdDuckGain = null;

    if (this.sfxMasterNode && this.ctx && this.sfxMasterNode !== this.ctx.destination) {
      try {
        this.sfxMasterNode.disconnect();
      } catch {
        // Ignore
      }
    }
    this.sfxMasterNode = null;
    if (this.voiceAnalyser) {
      try {
        this.voiceAnalyser.disconnect();
      } catch {
        // Ignore
      }
      this.voiceAnalyser = null;
      this.voiceAnalyserData = null;
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
