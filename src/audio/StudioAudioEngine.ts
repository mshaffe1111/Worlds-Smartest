// ============================================================================
// WORLD'S SMARTEST — Clean Studio Audio Engine (ZERO Procedural Oscillators!)
// Plays:
//  1) All 144 Studio-Mastered Neural VO Clips (./assets/voice/*.mp3)
//  2) Crisp Physical Horological Foley Samples (./assets/audio/sfx_*.{mp3,wav})
//  3) Verified Acoustic Room-Air Venue Beds ONLY if explicitly toggled ON
//     (STRICT DEFAULT: AMBIENCE OFF!)
// ============================================================================

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
  | 'streak_5';

export type MusicCueId = 'ambient' | 'tension' | 'mystery' | 'finale';

export interface StudioAudioManifest {
  musicApproved?: boolean;
  defaultMusicEnabled?: boolean;
  music?: Partial<Record<MusicCueId, string>>;
  roomTone?: string | null;
  sfx?: Partial<Record<string, string>>;
}

const SFX_STORAGE_KEY = 'ws_studio_sfx_enabled_v2';
const MUSIC_STORAGE_KEY = 'ws_studio_music_enabled_v2';
const AMBIENCE_V2_STORAGE_KEY = 'ws_ambience_enabled_v2';
const VOICE_STORAGE_KEY = 'ws_studio_voice_enabled_v2';

// Exact 10 microphone-recorded horological Foley cues in public/assets/audio/
const SFX_CANDIDATES: Record<SfxCueId, string[]> = {
  ui_tap: ['./assets/audio/sfx_ui_tap.mp3', './assets/audio/sfx_ui_tap.wav'],
  spin_tick: ['./assets/audio/sfx_spin_tick.mp3', './assets/audio/sfx_spin_tick.wav'],
  sightline_snap: ['./assets/audio/sfx_sightline_snap.mp3', './assets/audio/sfx_sightline_snap.wav'],
  shutter_peel: ['./assets/audio/sfx_shutter_peel.mp3', './assets/audio/sfx_shutter_peel.wav'],
  glass_shatter: ['./assets/audio/sfx_glass_shatter.mp3', './assets/audio/sfx_glass_shatter.wav'],
  overclock_charge: ['./assets/audio/sfx_overclock_charge.mp3', './assets/audio/sfx_overclock_charge.wav'],
  vault_thunk: ['./assets/audio/sfx_vault_thunk.mp3', './assets/audio/sfx_vault_thunk.wav'],
  gold_resonance: ['./assets/audio/sfx_gold_resonance.mp3', './assets/audio/sfx_gold_resonance.wav'],
  backfire_fracture: ['./assets/audio/sfx_backfire_fracture.mp3', './assets/audio/sfx_backfire_fracture.wav'],
  passport_stamp: ['./assets/audio/sfx_passport_stamp.mp3', './assets/audio/sfx_passport_stamp.wav'],
  cutscene_whoosh: ['./assets/audio/sfx_shutter_peel.mp3', './assets/audio/sfx_shutter_peel.wav'],
  streak_1: ['./assets/audio/sfx_gold_resonance.mp3'],
  streak_2: ['./assets/audio/sfx_gold_resonance.mp3'],
  streak_3: ['./assets/audio/sfx_gold_resonance.mp3'],
  streak_4: ['./assets/audio/sfx_gold_resonance.mp3'],
  streak_5: ['./assets/audio/sfx_gold_resonance.mp3'],
};

// Loudness-calibrated against exact 48kHz PCM peak/RMS profiles of public/assets/audio/sfx_*.mp3
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
  streak_1: 0.42,
  streak_2: 0.44,
  streak_3: 0.45,
  streak_4: 0.47,
  streak_5: 0.49,
};

// Rapid-duplicate dedupe windows (prevents phase flanging & +6dB double-triggers on lock/tap)
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
  streak_1: 75,
  streak_2: 75,
  streak_3: 75,
  streak_4: 75,
  streak_5: 75,
};

// Equal-loudness room-air trim per venue bed (all 5 beds sit at uniform ~-30 dBFS floor)
const VENUE_AMBIENCE_VOLUME_SCALE: Record<string, number> = {
  './assets/audio/ambience_chamber_room.mp3': 1.0,
  './assets/audio/ambience_cairo_vault_air.mp3': 0.94,
  './assets/audio/ambience_ocean_storm_air.mp3': 0.94,
  './assets/audio/ambience_tokyo_neon_rain.mp3': 0.84,
  './assets/audio/ambience_london_rain.mp3': 0.76,
};

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
  private sfxBuffers = new Map<SfxCueId, AudioBuffer>();
  private urlBuffers = new Map<string, AudioBuffer>();
  private loadingUrlPromises = new Map<string, Promise<AudioBuffer | null>>();
  private failedUrls = new Set<string>();

  private sfxEnabled: boolean;
  private voiceEnabled: boolean;
  private musicEnabled: boolean;
  private musicApproved = false;
  private manifestLoaded = false;
  private manifest: StudioAudioManifest = {};

  private currentVoiceEl: HTMLAudioElement | null = null;
  private currentVoiceId = '';
  private voiceToken = 0;
  private pendingVoiceRequest: { url: string; onEnded?: () => void } | null = null;
  private voiceAnalyser: AnalyserNode | null = null;
  private voiceAnalyserData: Uint8Array<ArrayBuffer> | null = null;
  private voiceSourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

  private musicEl: HTMLAudioElement | null = null;
  private musicToken = 0;
  private musicFadeRaf = 0;
  private currentMusicCue: MusicCueId = 'ambient';
  private activeVenueAmbienceUrl = './assets/audio/ambience_chamber_room.mp3';
  private baseMusicVolume = 0.28;
  private isVoiceDucking = false;

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
    // Strict default AMBIENCE: OFF — user may opt in to warm acoustic room-tone in Vault Drawer!
    this.musicApproved = true;
    this.manifest = {
      musicApproved: true,
      defaultMusicEnabled: false,
      roomTone: './assets/audio/ambience_chamber_room.mp3',
    };
    this.musicEnabled = this.readAmbienceStorage(false);

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

  private readAmbienceStorage(fallback: boolean): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const v2 = window.localStorage.getItem(AMBIENCE_V2_STORAGE_KEY);
        if (v2 === '1' || v2 === 'true') return true;
        if (v2 === '0' || v2 === 'false') return false;
        const legacy = window.localStorage.getItem(MUSIC_STORAGE_KEY);
        if (legacy === 'true' || legacy === '1') return true;
        if (legacy === 'false' || legacy === '0') return false;
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

  /** Soft broadcast safety limiter on the SFX bus so simultaneous Foley layers never clip above 0 dBFS */
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

  public async initManifestAndPrewarm(): Promise<void> {
    if (this.manifestLoaded) return;
    this.manifestLoaded = true;
    if (this.unlocked) {
      this.prewarmCoreBuffers();
    }
  }

  private prewarmCoreBuffers(): void {
    // Prewarm all 10 unique physical Foley buffers quietly after first user gesture (zero pre-gesture AudioContext warning!)
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
        const contentType = resp.headers.get('content-type') ?? '';
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
    // Check already-decoded shared URL buffers immediately (streak_1..5 / cutscene_whoosh!)
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
      this.writeBoolStorage(MUSIC_STORAGE_KEY, false);
      this.writeRawStorage(AMBIENCE_V2_STORAGE_KEY, '0');
      this.stopMusic();
      this.notifyChange();
      return false;
    }
    this.musicEnabled = Boolean(enabled);
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

  // --------------------------------------------------------------------------
  // Physical Foley Playback (Zero Synthesizers!)
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
    const maxDeferMs = cue === 'spin_tick' ? 180 : 1200;
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
      // Subtle +/-2% natural micro-variation on watch-escapement ticks so repeats never sound robotic
      const naturalJitter = cue === 'spin_tick' ? 0.98 + Math.random() * 0.04 : 1.0;
      source.playbackRate.value = Math.max(0.5, Math.min(1.6, (rate ?? 1.0) * naturalJitter));

      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, SFX_VOLUMES[cue] * volumeScale));

      source.connect(gain);
      gain.connect(this.getSfxOutputNode(ctx));
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

        // Sustain smoothly across the measured -17.7 dBFS harmonic plateau (~0.56s..0.76s)
        // snapped to exact rising zero-crossings so holding past 1.05s never cuts out or clicks!
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
        // Prefer spec cancelAndHoldAtTime to avoid Safari/Chrome intrinsic-value jump clicks!
        const param = gain.gain as AudioParam & {
          cancelAndHoldAtTime?: (cancelTime: number) => AudioParam;
        };
        if (typeof param.cancelAndHoldAtTime === 'function') {
          param.cancelAndHoldAtTime(t);
        } else {
          const frac = Math.max(0, Math.min(1, (t - startT) / 0.81));
          const approxCurrent = 0.18 + (SFX_VOLUMES.overclock_charge - 0.18) * frac;
          param.cancelScheduledValues(t);
          param.setValueAtTime(Math.max(0.0001, approxCurrent), t);
        }
        param.linearRampToValueAtTime(0.0001, t + 0.045);

        if (this.ctx.state === 'running') {
          src.stop(t + 0.055);
        } else {
          // If AudioContext is suspended/interrupted, stop immediately so it never resumes later!
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

  public playStreakFanfare(streak: number): void {
    if (!this.sfxEnabled) return;
    const clamped = Math.max(1, Math.min(5, Math.floor(streak))) as 1 | 2 | 3 | 4 | 5;
    if (streak >= 2) {
      this.playSfx(`streak_${clamped}`, { rate: 1.0 + (clamped - 1) * 0.045 });
    } else {
      this.playSfx('gold_resonance');
    }
  }

  // --------------------------------------------------------------------------
  // Neural Voice Acting (144 Mastered Clips in ./assets/voice/*.mp3)
  // --------------------------------------------------------------------------

  public playVoice(clipOrUrl: string, onEnded?: () => void): void {
    const url = normalizeAssetUrl(clipOrUrl);
    if (this.disposed || !url) {
      onEnded?.();
      return;
    }

    // Guarantees ZERO overlapping VO lines and invalidates any previous in-flight play() Promise!
    this.stopVoice();
    const myToken = ++this.voiceToken;

    if (!this.voiceEnabled) {
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
        // Strictly ignore events from a superseded/stopped audio element!
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
          // If stopVoice() or a newer playVoice() already superseded this clip, DO NOTHING!
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

  public stopVoice(): void {
    // Advance token FIRST so any error/AbortError fired by unloading src is 100% ignored!
    ++this.voiceToken;
    this.pendingVoiceRequest = null;

    const el = this.currentVoiceEl;
    this.currentVoiceEl = null;
    this.currentVoiceId = '';

    if (el) {
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
      const srcNode = this.voiceSourceMap.get(el);
      if (srcNode) {
        try {
          srcNode.disconnect();
        } catch {
          // Already disconnected
        }
      }
    }
    this.setVoiceDucking(false);
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
    // Never route HTMLAudioElement into a suspended AudioContext (silences pre-unlock output per #145)
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
        this.voiceSourceMap.set(audioEl, src);
        src.connect(this.voiceAnalyser);
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
    // Natural speech cadence fallback if analyser hasn't unlocked yet
    const t = nowMs() * 0.012;
    return 0.25 + 0.35 * Math.abs(Math.sin(t) * Math.cos(t * 0.63));
  }

  /**
   * Switches the subtle venue-matched acoustic room-air bed (only audible when user toggles AMBIENCE: ON).
   */
  public setVenueAmbience(venueCode: string): void {
    const code = (venueCode || 'ch').toLowerCase();
    const map: Record<string, string> = {
      ch: './assets/audio/ambience_chamber_room.mp3',
      studio: './assets/audio/ambience_chamber_room.mp3',
      gb: './assets/audio/ambience_london_rain.mp3',
      br: './assets/audio/ambience_london_rain.mp3',
      jp: './assets/audio/ambience_tokyo_neon_rain.mp3',
      sg: './assets/audio/ambience_tokyo_neon_rain.mp3',
      eg: './assets/audio/ambience_cairo_vault_air.mp3',
      is: './assets/audio/ambience_cairo_vault_air.mp3',
      ledger: './assets/audio/ambience_cairo_vault_air.mp3',
      global: './assets/audio/ambience_ocean_storm_air.mp3',
    };
    this.activeVenueAmbienceUrl = map[code] ?? './assets/audio/ambience_chamber_room.mp3';
    this.manifest.roomTone = this.activeVenueAmbienceUrl;
    if (this.isMusicEnabled()) {
      this.syncMusicPlayback();
    }
  }

  // --------------------------------------------------------------------------
  // Studio Room-Tone Bed (Strictly Opt-In, Default OFF & Loudness-Matched)
  // --------------------------------------------------------------------------

  public setMusicCue(cue: MusicCueId): void {
    this.currentMusicCue = cue;
    if (this.isMusicEnabled()) {
      this.syncMusicPlayback();
    }
  }

  private resolveMusicUrl(cue: MusicCueId): string | null {
    if (!this.musicApproved) return null;
    const mapped =
      this.manifest.music?.[cue] ?? this.manifest.music?.ambient ?? this.manifest.roomTone;
    return mapped ? normalizeAssetUrl(mapped) : null;
  }

  private getTargetMusicVolume(url?: string): number {
    const cueUrl = url ?? this.musicEl?.dataset?.cueUrl ?? this.activeVenueAmbienceUrl;
    const trim = VENUE_AMBIENCE_VOLUME_SCALE[cueUrl] ?? 1.0;
    const duckFactor = this.isVoiceDucking ? 0.34 : 1.0;
    return Math.max(0, Math.min(1, this.baseMusicVolume * trim * duckFactor));
  }

  private cancelMusicFade(): void {
    if (this.musicFadeRaf !== 0 && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.musicFadeRaf);
      this.musicFadeRaf = 0;
    }
  }

  private rampMusicVolumeTo(targetVol: number, durationMs: number): void {
    const el = this.musicEl;
    if (!el) return;
    this.cancelMusicFade();
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

    if (this.musicEl && this.musicEl.dataset.cueUrl === url) {
      this.rampMusicVolumeTo(this.getTargetMusicVolume(url), 180);
      if (this.musicEl.paused && this.unlocked) {
        void this.musicEl.play().catch(() => {});
      }
      return;
    }

    this.stopMusic();
    const myMusicToken = ++this.musicToken;
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
          // Graceful fallback to verified Geneva chamber room-tone if a venue bed fails to load
          if (url !== './assets/audio/ambience_chamber_room.mp3') {
            el.src = './assets/audio/ambience_chamber_room.mp3';
            el.dataset.cueUrl = './assets/audio/ambience_chamber_room.mp3';
            if (this.unlocked && this.isMusicEnabled()) {
              void el.play().catch(() => {});
              this.rampMusicVolumeTo(
                this.getTargetMusicVolume('./assets/audio/ambience_chamber_room.mp3'),
                240,
              );
            }
          }
        },
        { once: true },
      );
      this.musicEl = el;
      if (this.unlocked) {
        void el
          .play()
          .then(() => {
            if (myMusicToken === this.musicToken && this.musicEl === el) {
              this.rampMusicVolumeTo(this.getTargetMusicVolume(url), 240);
            }
          })
          .catch(() => {});
      } else {
        el.volume = this.getTargetMusicVolume(url);
      }
    } catch {
      this.musicEl = null;
    }
  }

  private setVoiceDucking(ducking: boolean): void {
    if (this.isVoiceDucking === ducking) return;
    this.isVoiceDucking = ducking;
    if (this.musicEl) {
      this.rampMusicVolumeTo(this.getTargetMusicVolume(), ducking ? 160 : 360);
    }
  }

  public stopMusic(): void {
    ++this.musicToken;
    this.cancelMusicFade();
    const el = this.musicEl;
    this.musicEl = null;
    if (el) {
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
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.stopVoice();
    this.stopMusic();
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
