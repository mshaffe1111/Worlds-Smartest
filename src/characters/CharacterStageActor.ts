// ============================================================================
// WORLD'S SMARTEST — 2.5D Layered Living Character Stage Actor
// Implements docs/PITCH_BIBLE.md §2.5 & §5.1 ("Zero Static PNG Stickers!")
//
// Renders all 6 recurring characters (vance, nadia, soren, teo, lindqvist, tariq)
// across all 10 alpha-matted cutouts (public/assets/portraits_cutout/*.png) on a
// high-DPI 60fps HTML5 2D Canvas with:
//   • Seamless 14-strip 2.5D scanline mesh warp (independent chest breathing
//     + cervical-pivoted organic micro-head-sway & speaking syllable nods)
//   • Autonomous natural eye-blinks & specular iris catchlights
//   • Smooth 260ms emotional cross-dissolve (neutral, intense, shocked, smirk)
//     with per-emotion camera lean/recoil spring physics
//   • Real-time WebAudio AnalyserNode + decoded PCM envelope voice-amplitude
//     rim-lighting & speaking pulse synced to StudioAudioEngine VO playback
//   • Dramatic broadcast entrance & exit slides
//   • Sub-pixel anchor projection hook for CharacterTellsChoreographer
// ============================================================================

import type { CastMemberId } from '../narrative/InkBlackboard';
import type { CharacterExpression } from '../narrative/RivalAI';

/**
 * Structural contract satisfied natively by `StudioAudioEngine` (`src/audio/StudioAudioEngine.ts`).
 */
export interface StudioVoiceAudioLike {
  isVoicePlaying(): boolean;
  getCurrentVoiceUrl(): string;
  getVoiceAmplitude01?(): number;
  getActiveVoiceElement?(): HTMLAudioElement | null;
}

export type ActorFramingMode = 'auto' | 'close-up' | 'bust';

export type ActorEntranceDirection = 'left' | 'right' | 'bottom' | 'fade' | 'none';

export type ActorMoodTint = 'default' | 'gold' | 'cyan' | 'crimson' | 'emerald' | 'platinum';

export interface NormalizedPoint {
  /** 0..1 across 512px source width */
  x: number;
  /** 0..1 across 680px source height */
  y: number;
}

export interface CharacterAnatomyRig {
  id: CastMemberId;
  displayName: string;
  accentHex: string;
  rimSecondaryHex: string;
  leftEye: NormalizedPoint;
  rightEye: NormalizedPoint;
  mouthCenter: NormalizedPoint;
  jawContour: NormalizedPoint;
  /** Normalized Y (0..1) where shoulders transition into neck/head */
  neckPivotY: number;
  /** Base calm respiratory frequency in Hz */
  breathRateHz: number;
  /** Organic head micro-sway amplitude (normalized to 100px render width) */
  swayAmpRatio: number;
  /** Character-specific prop/tell anchor points in 512x680 normalized space */
  anchors: {
    rightEarStylus?: NormalizedPoint;
    leftLapelPin?: NormalizedPoint;
    leftCufflink?: NormalizedPoint;
    earCuff?: NormalizedPoint;
    smirkCorner?: NormalizedPoint;
    earpiece?: NormalizedPoint;
    knuckleCoin?: NormalizedPoint;
    wristDisplay?: NormalizedPoint;
    spectacleBridge?: NormalizedPoint;
    collarClasp?: NormalizedPoint;
  };
  cutouts: Record<CharacterExpression, string>;
}

export const CHARACTER_ANATOMY_RIGS: Record<CastMemberId, CharacterAnatomyRig> = {
  vance: {
    id: 'vance',
    displayName: 'Julian Vance',
    accentHex: '#e8c474',
    rimSecondaryHex: '#528be0',
    leftEye: { x: 0.408, y: 0.306 },
    rightEye: { x: 0.590, y: 0.306 },
    mouthCenter: { x: 0.498, y: 0.468 },
    jawContour: { x: 0.498, y: 0.506 },
    neckPivotY: 0.54,
    breathRateHz: 0.22,
    swayAmpRatio: 0.017,
    anchors: {
      rightEarStylus: { x: 0.278, y: 0.342 },
      leftLapelPin: { x: 0.732, y: 0.788 },
      leftCufflink: { x: 0.758, y: 0.875 },
    },
    cutouts: {
      neutral: './assets/portraits_cutout/vance.png',
      smirk: './assets/portraits_cutout/vance.png',
      intense: './assets/portraits_cutout/vance_intense.png',
      shocked: './assets/portraits_cutout/vance_intense.png',
    },
  },
  nadia: {
    id: 'nadia',
    displayName: 'Nadia Al-Mansoor',
    accentHex: '#48b8f0',
    rimSecondaryHex: '#f0b856',
    leftEye: { x: 0.512, y: 0.316 },
    rightEye: { x: 0.674, y: 0.322 },
    mouthCenter: { x: 0.596, y: 0.458 },
    jawContour: { x: 0.484, y: 0.488 },
    neckPivotY: 0.53,
    breathRateHz: 0.25,
    swayAmpRatio: 0.019,
    anchors: {
      earCuff: { x: 0.304, y: 0.352 },
      smirkCorner: { x: 0.534, y: 0.456 },
    },
    cutouts: {
      neutral: './assets/portraits_cutout/nadia.png',
      smirk: './assets/portraits_cutout/nadia.png',
      intense: './assets/portraits_cutout/nadia.png',
      shocked: './assets/portraits_cutout/nadia_shocked.png',
    },
  },
  soren: {
    id: 'soren',
    displayName: 'Soren "Echo" Kael',
    accentHex: '#5ce1e6',
    rimSecondaryHex: '#f0c259',
    leftEye: { x: 0.516, y: 0.296 },
    rightEye: { x: 0.666, y: 0.304 },
    mouthCenter: { x: 0.578, y: 0.408 },
    jawContour: { x: 0.535, y: 0.458 },
    neckPivotY: 0.49,
    breathRateHz: 0.28,
    swayAmpRatio: 0.023,
    anchors: {
      earpiece: { x: 0.345, y: 0.322 },
      knuckleCoin: { x: 0.730, y: 0.562 },
    },
    cutouts: {
      neutral: './assets/portraits_cutout/soren.png',
      smirk: './assets/portraits_cutout/soren_smirk.png',
      intense: './assets/portraits_cutout/soren_smirk.png',
      shocked: './assets/portraits_cutout/soren.png',
    },
  },
  teo: {
    id: 'teo',
    displayName: 'Mateo "Teo" Rojas',
    accentHex: '#38c793',
    rimSecondaryHex: '#f09d46',
    leftEye: { x: 0.506, y: 0.296 },
    rightEye: { x: 0.654, y: 0.304 },
    mouthCenter: { x: 0.560, y: 0.422 },
    jawContour: { x: 0.510, y: 0.468 },
    neckPivotY: 0.50,
    breathRateHz: 0.27,
    swayAmpRatio: 0.021,
    anchors: {
      earpiece: { x: 0.346, y: 0.302 },
      wristDisplay: { x: 0.682, y: 0.870 },
    },
    cutouts: {
      neutral: './assets/portraits_cutout/teo.png',
      smirk: './assets/portraits_cutout/teo.png',
      intense: './assets/portraits_cutout/teo_intense.png',
      shocked: './assets/portraits_cutout/teo_intense.png',
    },
  },
  lindqvist: {
    id: 'lindqvist',
    displayName: 'Chancellor Ingrid Lindqvist',
    accentHex: '#d4a853',
    rimSecondaryHex: '#c4dcfa',
    leftEye: { x: 0.424, y: 0.304 },
    rightEye: { x: 0.596, y: 0.304 },
    mouthCenter: { x: 0.506, y: 0.440 },
    jawContour: { x: 0.506, y: 0.488 },
    neckPivotY: 0.52,
    breathRateHz: 0.19,
    swayAmpRatio: 0.013,
    anchors: {
      spectacleBridge: { x: 0.508, y: 0.300 },
    },
    cutouts: {
      neutral: './assets/portraits_cutout/lindqvist.png',
      smirk: './assets/portraits_cutout/lindqvist.png',
      intense: './assets/portraits_cutout/lindqvist.png',
      shocked: './assets/portraits_cutout/lindqvist.png',
    },
  },
  tariq: {
    id: 'tariq',
    displayName: 'Tariq Al-Mansoor',
    accentHex: '#f2c166',
    rimSecondaryHex: '#39d49a',
    leftEye: { x: 0.356, y: 0.336 },
    rightEye: { x: 0.534, y: 0.336 },
    mouthCenter: { x: 0.435, y: 0.478 },
    jawContour: { x: 0.440, y: 0.535 },
    neckPivotY: 0.55,
    breathRateHz: 0.21,
    swayAmpRatio: 0.016,
    anchors: {
      collarClasp: { x: 0.432, y: 0.692 },
    },
    cutouts: {
      neutral: './assets/portraits_cutout/tariq.png',
      smirk: './assets/portraits_cutout/tariq.png',
      intense: './assets/portraits_cutout/tariq.png',
      shocked: './assets/portraits_cutout/tariq.png',
    },
  },
};

export interface ProjectedStageMetrics {
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
  timeSec: number;
  dtSec: number;
  actorId: CastMemberId;
  expression: CharacterExpression;
  rig: CharacterAnatomyRig;
  voiceAmplitude: number;
  speechFormant: number;
  isSpeaking: boolean;
  breathPhase01: number;
  /** Projects normalized (0..1) 512x680 cutout coordinate into live deformed CSS-pixel canvas space */
  projectAnchor: (
    nx: number,
    ny: number,
    options?: { clampMarginPx?: number },
  ) => { x: number; y: number; scale: number };
}

export type StageOverlayLayerCallback = (
  ctx: CanvasRenderingContext2D,
  metrics: ProjectedStageMetrics,
) => void;

export interface CharacterStageActorOptions {
  initialActor?: CastMemberId;
  initialExpression?: CharacterExpression;
  framing?: ActorFramingMode;
  audioEngine?: StudioVoiceAudioLike | null;
  /**
   * 'actor-or-cinema' (default): pulses when VO matches `${actorId}_*` OR `cutscene_*` / `ending_*`.
   * 'strict-actor': pulses only when VO filename starts with `${actorId}_`.
   * 'any-voice': pulses whenever any VO is playing on the attached StudioAudioEngine.
   */
  voiceMatchMode?: 'actor-or-cinema' | 'strict-actor' | 'any-voice';
  showBackdropHalo?: boolean;
  showSpeakingWaveBadge?: boolean;
  ariaLabel?: string;
}

// ----------------------------------------------------------------------------
// Shared Singleton Cutout Cache & Alpha Rim-Silhouette Generator
// ----------------------------------------------------------------------------

const CUTOUT_IMAGE_CACHE = new Map<string, HTMLImageElement>();
const CUTOUT_LOAD_PROMISES = new Map<string, Promise<HTMLImageElement | null>>();
const TINT_SILHOUETTE_CACHE = new Map<string, HTMLCanvasElement>();

function resolveAssetHref(relPath: string): string {
  if (!relPath) return '';
  if (relPath.startsWith('http://') || relPath.startsWith('https://') || relPath.startsWith('data:')) {
    return relPath;
  }
  const clean = relPath.startsWith('res://')
    ? `./${relPath.slice('res://'.length)}`
    : relPath.startsWith('/assets/')
      ? `.${relPath}`
      : relPath.startsWith('assets/')
        ? `./${relPath}`
        : relPath;
  try {
    if (typeof document !== 'undefined') {
      return new URL(clean, document.baseURI || window.location.href).href;
    }
  } catch {
    // Fallback to relative string
  }
  return clean;
}

export function preloadCharacterCutouts(actors?: CastMemberId[]): Promise<void> {
  if (typeof Image === 'undefined') return Promise.resolve();
  const list = actors ?? (['vance', 'nadia', 'soren', 'teo', 'lindqvist', 'tariq'] as CastMemberId[]);
  const uniqueUrls = new Set<string>();
  for (const id of list) {
    const rig = CHARACTER_ANATOMY_RIGS[id];
    if (!rig) continue;
    uniqueUrls.add(rig.cutouts.neutral);
    uniqueUrls.add(rig.cutouts.intense);
    uniqueUrls.add(rig.cutouts.shocked);
    uniqueUrls.add(rig.cutouts.smirk);
  }
  const jobs: Array<Promise<HTMLImageElement | null>> = [];
  for (const rawUrl of uniqueUrls) {
    jobs.push(loadCutoutImage(rawUrl));
  }
  return Promise.allSettled(jobs).then(() => undefined);
}

function loadCutoutImage(rawUrl: string): Promise<HTMLImageElement | null> {
  const resolved = resolveAssetHref(rawUrl);
  const cached = CUTOUT_IMAGE_CACHE.get(resolved);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }
  const existingPromise = CUTOUT_LOAD_PROMISES.get(resolved);
  if (existingPromise) return existingPromise;

  const p = new Promise<HTMLImageElement | null>((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      CUTOUT_IMAGE_CACHE.set(resolved, img);
      CUTOUT_LOAD_PROMISES.delete(resolved);
      resolve(img);
    };
    img.onerror = () => {
      CUTOUT_LOAD_PROMISES.delete(resolved);
      resolve(null);
    };
    img.src = resolved;
  });

  CUTOUT_LOAD_PROMISES.set(resolved, p);
  return p;
}

function getTintedSilhouetteCanvas(img: HTMLImageElement, hexColor: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || img.naturalWidth <= 0) return null;
  const key = `${img.src}::${hexColor}`;
  const existing = TINT_SILHOUETTE_CACHE.get(key);
  if (existing) return existing;

  // Half-resolution silhouette (256x340) gives naturally soft studio rim-light falloff & saves VRAM
  const w = Math.max(64, Math.round(img.naturalWidth * 0.5));
  const h = Math.max(85, Math.round(img.naturalHeight * 0.5));
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  if (!octx) return null;

  octx.clearRect(0, 0, w, h);
  octx.drawImage(img, 0, 0, w, h);
  octx.globalCompositeOperation = 'source-in';
  octx.fillStyle = hexColor;
  octx.fillRect(0, 0, w, h);
  octx.globalCompositeOperation = 'source-over';

  // Cap cache size cleanly
  if (TINT_SILHOUETTE_CACHE.size > 48) {
    const firstKey = TINT_SILHOUETTE_CACHE.keys().next().value;
    if (firstKey) TINT_SILHOUETTE_CACHE.delete(firstKey);
  }
  TINT_SILHOUETTE_CACHE.set(key, off);
  return off;
}

// ----------------------------------------------------------------------------
// Dual-Path WebAudio AnalyserNode + Offline PCM Voice Envelope Extractor
// ----------------------------------------------------------------------------

interface AttachedElementTap {
  analyser: AnalyserNode;
  timeData: Uint8Array<ArrayBuffer>;
  freqData: Uint8Array<ArrayBuffer>;
}

interface DecodedVoiceEnvelope {
  sampleRateHz: number;
  rmsFrames: Float32Array;
  formantFrames: Float32Array;
}

const ELEMENT_ANALYSER_MAP = new WeakMap<HTMLAudioElement, AttachedElementTap>();
const VOICE_ENVELOPE_CACHE = new Map<string, DecodedVoiceEnvelope>();
const VOICE_ENVELOPE_PENDING = new Set<string>();

function ensureDecodedVoiceEnvelope(voiceUrl: string): void {
  if (!voiceUrl || typeof window === 'undefined') return;
  const resolved = resolveAssetHref(voiceUrl);
  if (VOICE_ENVELOPE_CACHE.has(resolved) || VOICE_ENVELOPE_PENDING.has(resolved)) return;

  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  if (!OfflineCtx) return;

  VOICE_ENVELOPE_PENDING.add(resolved);
  void (async () => {
    try {
      const resp = await fetch(resolved);
      if (!resp.ok) return;
      const contentType = resp.headers.get('content-type') ?? '';
      if (contentType.includes('text/html')) return;
      const buf = await resp.arrayBuffer();
      if (buf.byteLength < 128) return;

      // Passive 1-frame OfflineAudioContext decodes MP3 PCM cleanly even before user gesture unlock!
      const decoderCtx = new OfflineCtx(1, 1, 22050);
      const audioBuf = await decoderCtx.decodeAudioData(buf.slice(0));
      const ch = audioBuf.getChannelData(0);
      const sr = audioBuf.sampleRate;
      const envHz = 60;
      const hop = Math.max(1, Math.floor(sr / envHz));
      const frameCount = Math.max(1, Math.ceil(ch.length / hop));
      const rmsFrames = new Float32Array(frameCount);
      const formantFrames = new Float32Array(frameCount);

      let peak = 0.001;
      for (let f = 0; f < frameCount; f++) {
        const start = f * hop;
        const end = Math.min(ch.length, start + hop);
        let sumSq = 0;
        let zeroCrossings = 0;
        let prev = ch[start] ?? 0;
        for (let i = start; i < end; i++) {
          const s = ch[i];
          sumSq += s * s;
          if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) {
            zeroCrossings += 1;
          }
          prev = s;
        }
        const n = Math.max(1, end - start);
        const rms = Math.sqrt(sumSq / n);
        rmsFrames[f] = rms;
        if (rms > peak) peak = rms;
        // Consonant / sibilant presence indicator via normalized zero-crossing rate
        const zcr = zeroCrossings / n;
        formantFrames[f] = Math.min(1, zcr * 4.5);
      }

      // Normalize RMS frames cleanly so quiet & loud neural clips both drive crisp 0..1 rim light
      const invPeak = 1 / Math.max(0.04, peak * 0.85);
      for (let f = 0; f < frameCount; f++) {
        rmsFrames[f] = Math.min(1, Math.pow(rmsFrames[f] * invPeak, 0.78));
      }

      VOICE_ENVELOPE_CACHE.set(resolved, {
        sampleRateHz: envHz,
        rmsFrames,
        formantFrames,
      });
    } catch {
      // Ignore decode failure gracefully; synthetic syllable fallback handles it
    } finally {
      VOICE_ENVELOPE_PENDING.delete(resolved);
    }
  })();
}

function sampleStudioVoiceTelemetry(audio: StudioVoiceAudioLike): {
  playing: boolean;
  url: string;
  amplitude: number;
  formant: number;
} {
  const playing = audio.isVoicePlaying();
  const url = audio.getCurrentVoiceUrl();
  if (!playing || !url) {
    return { playing: false, url: '', amplitude: 0, formant: 0 };
  }

  const resolved = resolveAssetHref(url);
  ensureDecodedVoiceEnvelope(url);
  const env = VOICE_ENVELOPE_CACHE.get(resolved);
  const activeEl =
    typeof audio.getActiveVoiceElement === 'function'
      ? audio.getActiveVoiceElement()
      : ((audio as unknown as { currentVoiceEl?: HTMLAudioElement | null }).currentVoiceEl ?? null);

  // Sample-accurate decoded 60Hz PCM waveform envelope (honors exact dramatic pauses between words!)
  if (env && activeEl) {
    const tSec = Math.max(0, activeEl.currentTime || 0);
    const exactIdx = tSec * env.sampleRateHz;
    const i0 = Math.min(env.rmsFrames.length - 1, Math.max(0, Math.floor(exactIdx)));
    const i1 = Math.min(env.rmsFrames.length - 1, i0 + 1);
    const frac = exactIdx - Math.floor(exactIdx);
    return {
      playing: true,
      url,
      amplitude: env.rmsFrames[i0] * (1 - frac) + env.rmsFrames[i1] * frac,
      formant: env.formantFrames[i0] * (1 - frac) + env.formantFrames[i1] * frac,
    };
  }

  // Instant <15ms warmup via StudioAudioEngine's live WebAudio AnalyserNode while PCM decodes
  if (typeof audio.getVoiceAmplitude01 === 'function') {
    const liveAmp = Math.max(0, Math.min(1, audio.getVoiceAmplitude01()));
    return {
      playing: true,
      url,
      amplitude: liveAmp,
      formant: Math.min(1, liveAmp * 0.85),
    };
  }

  // Internal bridge inspection (strictly non-destructive: never creates/hijacks if ctx isn't running!)
  const internals = audio as unknown as {
    ctx?: AudioContext | null;
    currentVoiceEl?: HTMLAudioElement | null;
  };
  const voiceEl = internals.currentVoiceEl ?? null;
  const ctx = internals.ctx ?? null;

  // Path 1: Live WebAudio AnalyserNode when AudioContext is actively running
  if (ctx && ctx.state === 'running' && voiceEl && !voiceEl.paused) {
    let tap = ELEMENT_ANALYSER_MAP.get(voiceEl);
    if (!tap) {
      try {
        const srcNode = ctx.createMediaElementSource(voiceEl);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.68;
        srcNode.connect(analyser);
        analyser.connect(ctx.destination);
        tap = {
          analyser,
          timeData: new Uint8Array(new ArrayBuffer(analyser.fftSize)),
          freqData: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
        };
        ELEMENT_ANALYSER_MAP.set(voiceEl, tap);
      } catch {
        tap = undefined;
      }
    }

    if (tap) {
      tap.analyser.getByteTimeDomainData(tap.timeData);
      tap.analyser.getByteFrequencyData(tap.freqData);
      let sumSq = 0;
      for (let i = 0; i < tap.timeData.length; i++) {
        const centered = (tap.timeData[i] - 128) / 128;
        sumSq += centered * centered;
      }
      const rms = Math.sqrt(sumSq / tap.timeData.length);
      const amp = Math.min(1, Math.pow(rms * 3.6, 0.8));

      // Mid-band vocal formants (~350Hz - 2800Hz)
      let bandSum = 0;
      const startBin = 2;
      const endBin = Math.min(tap.freqData.length, 18);
      for (let b = startBin; b < endBin; b++) {
        bandSum += tap.freqData[b] / 255;
      }
      const formant = Math.min(1, (bandSum / Math.max(1, endBin - startBin)) * 1.45);
      return { playing: true, url, amplitude: amp, formant };
    }
  }

  // Fallback: Natural syllable cadence during initial <20ms decode warmup
  const nowSec = performance.now() * 0.001;
  const syllable =
    0.45 +
    0.28 * Math.sin(nowSec * 27.0) +
    0.18 * Math.sin(nowSec * 43.0 + 1.1) +
    0.12 * Math.cos(nowSec * 13.5);
  const gate = Math.sin(nowSec * 6.4) > -0.55 ? 1 : 0.18;
  return {
    playing: true,
    url,
    amplitude: Math.max(0, Math.min(1, syllable * gate)),
    formant: 0.5,
  };
}

// ----------------------------------------------------------------------------
// CharacterStageActor Main Class
// ----------------------------------------------------------------------------

interface DustMote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
}

const MESH_STRIPS = 14;

export class CharacterStageActor {
  private readonly rootEl: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;

  private actorId: CastMemberId;
  private expression: CharacterExpression;
  private prevExpression: CharacterExpression;
  private crossfade01 = 1; // 0 -> 1 over 260ms

  private framing: ActorFramingMode;
  private voiceMatchMode: 'actor-or-cinema' | 'strict-actor' | 'any-voice';
  private showBackdropHalo: boolean;
  private showSpeakingWaveBadge: boolean;
  private moodTint: ActorMoodTint = 'default';

  private audioEngine: StudioVoiceAudioLike | null = null;
  private externalAnalyser: AnalyserNode | null = null;
  private externalAnalyserBuf: Uint8Array<ArrayBuffer> | null = null;
  private manualVoiceAmplitude: number | null = null;
  private speakingOverride: boolean | null = null;

  private smoothVoiceAmp = 0;
  private smoothFormant = 0;
  private isCurrentlySpeaking = false;

  // Entrance / Exit & Emotion Spring Physics
  private slideOffsetX = 0; // normalized -1.2 .. +1.2 of canvas width
  private slideOffsetY = 0;
  private slideVelocityX = 0;
  private slideVelocityY = 0;
  private stageAlpha = 1;
  private targetStageAlpha = 1;

  private emotionScaleImpulse = 0;
  private emotionRecoilY = 0;
  private emotionTiltRad = 0;

  // Autonomous Blink State
  private nextBlinkAtSec = 2.4;
  private blinkProgress = -1; // -1 = open, 0..1 = blink curve

  // Overlay Hooks (used by CharacterTellsChoreographer)
  private overlayCallbacks = new Set<StageOverlayLayerCallback>();

  // Viewport & Loop Management
  private resizeObserver: ResizeObserver | null = null;
  private cssWidth = 64;
  private cssHeight = 64;
  private dpr = 1;
  private rafId = 0;
  private lastFrameMs = 0;
  private elapsedSec = 0;
  private seedPhase: number;
  private disposed = false;

  // Latest computed layout rect for sub-pixel anchor projection
  private lastDrawRect = { x: 0, y: 0, w: 64, h: 85, headSwayX: 0, headNodY: 0, breathY: 0, breathScaleX: 1 };

  private readonly motes: DustMote[] = [];

  constructor(options: CharacterStageActorOptions = {}) {
    this.actorId = options.initialActor ?? 'vance';
    this.expression = options.initialExpression ?? 'neutral';
    this.prevExpression = this.expression;
    this.framing = options.framing ?? 'auto';
    this.voiceMatchMode = options.voiceMatchMode ?? 'actor-or-cinema';
    this.showBackdropHalo = options.showBackdropHalo ?? true;
    this.showSpeakingWaveBadge = options.showSpeakingWaveBadge ?? true;
    this.audioEngine = options.audioEngine ?? null;
    this.seedPhase = (this.actorId.charCodeAt(0) * 1.37) % 6.28;

    for (let i = 0; i < 8; i++) {
      this.motes.push({
        x: ((i * 0.37 + 0.13) % 1),
        y: ((i * 0.53 + 0.21) % 1),
        r: 0.9 + (i % 3) * 0.65,
        vx: (i % 2 === 0 ? 1 : -1) * (0.012 + (i % 4) * 0.005),
        vy: -(0.018 + (i % 3) * 0.009),
        alpha: 0.16 + (i % 4) * 0.07,
        phase: i * 1.15,
      });
    }

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'ws-char-stage-actor';
    this.rootEl.style.cssText =
      'position:relative;width:100%;height:100%;overflow:hidden;pointer-events:none;display:block;contain: content;';
    if (options.ariaLabel) {
      this.rootEl.setAttribute('role', 'img');
      this.rootEl.setAttribute('aria-label', options.ariaLabel);
    }

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ws-char-stage-canvas';
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    this.rootEl.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    void preloadCharacterCutouts([this.actorId]);
    // Prewarm remaining cast in idle background
    setTimeout(() => {
      if (!this.disposed) void preloadCharacterCutouts();
    }, 120);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.syncCanvasDimensions();
      });
      this.resizeObserver.observe(this.rootEl);
    }
  }

  /** Returns the persistent wrapper element (`width:100%; height:100%`) */
  public getElement(): HTMLElement {
    return this.rootEl;
  }

  /**
   * Mounts (or seamlessly re-parents with zero blink/reload) into any DOM slot!
   */
  public mount(container: HTMLElement, options?: { entrance?: ActorEntranceDirection }): this {
    if (this.disposed) return this;
    if (this.rootEl.parentElement !== container) {
      container.replaceChildren(this.rootEl);
    }
    this.syncCanvasDimensions();
    if (options?.entrance && options.entrance !== 'none') {
      this.playEntrance(options.entrance);
    }
    this.ensureLoopRunning();
    return this;
  }

  public unmount(): void {
    this.stopLoop();
    this.rootEl.remove();
  }

  public attachAudioEngine(audio: StudioVoiceAudioLike | null): this {
    this.audioEngine = audio;
    return this;
  }

  public attachAnalyserNode(analyser: AnalyserNode | null): this {
    this.externalAnalyser = analyser;
    this.externalAnalyserBuf = analyser
      ? new Uint8Array(new ArrayBuffer(analyser.fftSize))
      : null;
    return this;
  }

  public setVoiceMatchMode(mode: 'actor-or-cinema' | 'strict-actor' | 'any-voice'): this {
    this.voiceMatchMode = mode;
    return this;
  }

  public setFraming(framing: ActorFramingMode): this {
    this.framing = framing;
    return this;
  }

  public setMoodTint(tint: ActorMoodTint): this {
    this.moodTint = tint;
    return this;
  }

  public setManualVoiceAmplitude(amplitude01: number | null): void {
    this.manualVoiceAmplitude =
      amplitude01 === null ? null : Math.max(0, Math.min(1, amplitude01));
  }

  public setSpeakingOverride(speaking: boolean | null): void {
    this.speakingOverride = speaking;
  }

  public getActorId(): CastMemberId {
    return this.actorId;
  }

  public getExpression(): CharacterExpression {
    return this.expression;
  }

  public isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  public getVoiceAmplitude(): number {
    return this.smoothVoiceAmp;
  }

  /**
   * Updates actor & emotional expression.
   * - Changing actorId plays a crisp broadcast entrance slide unless `entrance: 'none'`.
   * - Changing expression on the same actor triggers a smooth 260ms cross-dissolve + micro-blink!
   */
  public setActor(
    actorId: string,
    expression: string = 'neutral',
    options?: { entrance?: ActorEntranceDirection; immediate?: boolean },
  ): void {
    const normalizedActor = normalizeCastId(actorId);
    const normalizedExpr = normalizeExpression(expression);
    const actorChanged = normalizedActor !== this.actorId;
    const exprChanged = normalizedExpr !== this.expression;

    if (actorChanged) {
      this.actorId = normalizedActor;
      this.prevExpression = normalizedExpr;
      this.expression = normalizedExpr;
      this.crossfade01 = 1;
      this.seedPhase = (normalizedActor.charCodeAt(0) * 1.37) % 6.28;
      void preloadCharacterCutouts([normalizedActor]);

      if (!options?.immediate) {
        const dir = options?.entrance ?? 'left';
        if (dir !== 'none') {
          this.playEntrance(dir);
        }
      }
      this.applyEmotionImpulse(normalizedExpr, Boolean(options?.immediate));
    } else if (exprChanged) {
      this.prevExpression = this.expression;
      this.expression = normalizedExpr;
      this.crossfade01 = options?.immediate ? 1 : 0;
      if (!options?.immediate) {
        this.triggerMicroBlink();
      }
      this.applyEmotionImpulse(normalizedExpr, Boolean(options?.immediate));
    }

    this.ensureLoopRunning();
  }

  public setExpression(expression: CharacterExpression | string, immediate = false): void {
    this.setActor(this.actorId, expression, { immediate });
  }

  public triggerMicroBlink(): void {
    this.blinkProgress = 0;
    this.nextBlinkAtSec = this.elapsedSec + 2.8 + Math.random() * 3.4;
  }

  public playEntrance(direction: ActorEntranceDirection = 'left'): void {
    if (direction === 'none') return;
    this.stageAlpha = 0.15;
    this.targetStageAlpha = 1;
    if (direction === 'left') {
      this.slideOffsetX = -0.42;
      this.slideVelocityX = 0;
    } else if (direction === 'right') {
      this.slideOffsetX = 0.42;
      this.slideVelocityX = 0;
    } else if (direction === 'bottom') {
      this.slideOffsetY = 0.35;
      this.slideVelocityY = 0;
    }
    this.ensureLoopRunning();
  }

  public playExit(direction: ActorEntranceDirection = 'right', durationMs = 240): Promise<void> {
    this.targetStageAlpha = 0;
    if (direction === 'left') this.slideVelocityX = -2.4;
    else if (direction === 'right') this.slideVelocityX = 2.4;
    else if (direction === 'bottom') this.slideVelocityY = 2.2;
    this.ensureLoopRunning();
    return new Promise((resolve) => {
      setTimeout(() => resolve(), Math.max(40, durationMs));
    });
  }

  /**
   * Registers a custom 60fps canvas overlay callback (used by CharacterTellsChoreographer
   * to render gleaming cufflink glints, amber eye-glints, smart-lens flashes & stylus ripples
   * pinned directly onto the breathing/swaying character!).
   */
  public addOverlayLayer(fn: StageOverlayLayerCallback): () => void {
    this.overlayCallbacks.add(fn);
    this.ensureLoopRunning();
    return () => {
      this.overlayCallbacks.delete(fn);
    };
  }

  public projectNormalizedAnchor(
    nx: number,
    ny: number,
    options?: { clampMarginPx?: number },
  ): { x: number; y: number; scale: number } {
    const r = this.lastDrawRect;
    const rig = CHARACTER_ANATOMY_RIGS[this.actorId];
    const headWeight = computeHeadInfluence(ny, rig.neckPivotY);
    const localScaleX = 1 + (r.breathScaleX - 1) * (1 - headWeight * 0.65);

    let x = r.x + r.w * 0.5 + (nx - 0.5) * r.w * localScaleX + r.headSwayX * headWeight;
    let y = r.y + ny * r.h + r.breathY * (1 - headWeight * 0.25) + r.headNodY * headWeight;

    if (typeof options?.clampMarginPx === 'number' && this.cssWidth > 0 && this.cssHeight > 0) {
      const m = Math.min(options.clampMarginPx, Math.min(this.cssWidth, this.cssHeight) * 0.25);
      x = Math.max(m, Math.min(this.cssWidth - m, x));
      y = Math.max(m, Math.min(this.cssHeight - m, y));
    }

    return {
      x,
      y,
      scale: r.w / 512,
    };
  }

  public dispose(): void {
    this.disposed = true;
    this.stopLoop();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.overlayCallbacks.clear();
    this.rootEl.remove();
  }

  // --------------------------------------------------------------------------
  // Internal Physics & Rendering Pipeline
  // --------------------------------------------------------------------------

  private applyEmotionImpulse(expr: CharacterExpression, immediate: boolean): void {
    if (immediate) {
      this.emotionScaleImpulse = 0;
      this.emotionRecoilY = 0;
      this.emotionTiltRad = 0;
      return;
    }
    switch (expr) {
      case 'shocked':
        this.emotionScaleImpulse = -0.042;
        this.emotionRecoilY = 3.2;
        this.emotionTiltRad = -0.024;
        break;
      case 'intense':
        this.emotionScaleImpulse = 0.032;
        this.emotionRecoilY = -1.4;
        this.emotionTiltRad = 0.012;
        break;
      case 'smirk':
        this.emotionScaleImpulse = 0.016;
        this.emotionRecoilY = -0.8;
        this.emotionTiltRad = 0.022;
        break;
      case 'neutral':
      default:
        this.emotionScaleImpulse = 0;
        this.emotionRecoilY = 0;
        this.emotionTiltRad = 0;
        break;
    }
  }

  private syncCanvasDimensions(): void {
    if (!this.rootEl.isConnected) return;
    const rect = this.rootEl.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || this.rootEl.clientWidth || 64));
    const h = Math.max(1, Math.round(rect.height || this.rootEl.clientHeight || 64));
    const nextDpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    if (w !== this.cssWidth || h !== this.cssHeight || nextDpr !== this.dpr) {
      this.cssWidth = w;
      this.cssHeight = h;
      this.dpr = nextDpr;
      this.canvas.width = Math.max(1, Math.round(w * nextDpr));
      this.canvas.height = Math.max(1, Math.round(h * nextDpr));
    }
  }

  private ensureLoopRunning(): void {
    if (this.disposed || this.rafId !== 0) return;
    this.lastFrameMs = performance.now();
    const tick = (now: number) => {
      if (this.disposed) {
        this.rafId = 0;
        return;
      }
      // Auto-pause cleanly when detached from DOM (zero leaked RAF loops across HUD rebuilds!)
      if (!this.rootEl.isConnected) {
        this.rafId = 0;
        return;
      }

      const dt = Math.min(0.064, Math.max(0.001, (now - this.lastFrameMs) / 1000));
      this.lastFrameMs = now;
      this.elapsedSec += dt;

      this.stepPhysicsAndVoice(dt);
      this.renderFrame(dt);

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private stepPhysicsAndVoice(dt: number): void {
    // 1. Cross-dissolve progression (260ms smooth cubic)
    if (this.crossfade01 < 1) {
      this.crossfade01 = Math.min(1, this.crossfade01 + dt / 0.26);
    }

    // 2. Entrance / Exit spring-damper
    const springK = 26;
    const damp = Math.exp(-10.5 * dt);
    if (this.targetStageAlpha > 0.5) {
      this.slideVelocityX = (this.slideVelocityX - this.slideOffsetX * springK * dt) * damp;
      this.slideVelocityY = (this.slideVelocityY - this.slideOffsetY * springK * dt) * damp;
      this.slideOffsetX += this.slideVelocityX * dt;
      this.slideOffsetY += this.slideVelocityY * dt;
      if (Math.abs(this.slideOffsetX) < 0.0015 && Math.abs(this.slideVelocityX) < 0.01) {
        this.slideOffsetX = 0;
        this.slideVelocityX = 0;
      }
      if (Math.abs(this.slideOffsetY) < 0.0015 && Math.abs(this.slideVelocityY) < 0.01) {
        this.slideOffsetY = 0;
        this.slideVelocityY = 0;
      }
    } else {
      // Exiting slide
      this.slideOffsetX += this.slideVelocityX * dt;
      this.slideOffsetY += this.slideVelocityY * dt;
    }

    this.stageAlpha += (this.targetStageAlpha - this.stageAlpha) * Math.min(1, dt * 12);

    // Decay emotion pose impulses smoothly toward expression resting posture
    const poseDecay = Math.exp(-5.5 * dt);
    this.emotionScaleImpulse *= poseDecay;
    this.emotionRecoilY *= poseDecay;
    this.emotionTiltRad *= poseDecay;

    // 3. Autonomous Eye-Blink State Machine
    if (this.blinkProgress >= 0) {
      this.blinkProgress += dt / 0.145; // crisp 145ms human blink
      if (this.blinkProgress >= 1) {
        this.blinkProgress = -1;
      }
    } else if (this.elapsedSec >= this.nextBlinkAtSec) {
      this.blinkProgress = 0;
      this.nextBlinkAtSec = this.elapsedSec + 3.1 + ((Math.sin(this.elapsedSec * 7.3) + 1) * 1.65);
    }

    // 4. Real-Time Voice Amplitude & Speaking Detection
    let targetAmp = 0;
    let targetFormant = 0;
    let speaking = false;

    if (this.manualVoiceAmplitude !== null) {
      targetAmp = this.manualVoiceAmplitude;
      targetFormant = targetAmp * 0.7;
      speaking = this.speakingOverride ?? targetAmp > 0.04;
    } else if (this.externalAnalyser && this.externalAnalyserBuf) {
      this.externalAnalyser.getByteTimeDomainData(this.externalAnalyserBuf);
      let sumSq = 0;
      for (let i = 0; i < this.externalAnalyserBuf.length; i++) {
        const c = (this.externalAnalyserBuf[i] - 128) / 128;
        sumSq += c * c;
      }
      targetAmp = Math.min(1, Math.sqrt(sumSq / this.externalAnalyserBuf.length) * 3.5);
      targetFormant = targetAmp * 0.75;
      speaking = this.speakingOverride ?? targetAmp > 0.035;
    } else if (this.audioEngine) {
      const sample = sampleStudioVoiceTelemetry(this.audioEngine);
      if (sample.playing && this.doesVoiceClipMatchActor(sample.url)) {
        targetAmp = sample.amplitude;
        targetFormant = sample.formant;
        speaking = true;
      }
    }

    if (this.speakingOverride !== null) {
      speaking = this.speakingOverride;
      if (speaking && targetAmp < 0.08) {
        const t = this.elapsedSec;
        targetAmp = 0.25 + 0.22 * Math.abs(Math.sin(t * 21)) + 0.15 * Math.sin(t * 9.5);
      }
    }

    this.isCurrentlySpeaking = speaking;
    const rate = targetAmp > this.smoothVoiceAmp ? 26 : 11;
    this.smoothVoiceAmp += (targetAmp - this.smoothVoiceAmp) * Math.min(1, dt * rate);
    this.smoothFormant += (targetFormant - this.smoothFormant) * Math.min(1, dt * 18);
  }

  private doesVoiceClipMatchActor(url: string): boolean {
    if (this.voiceMatchMode === 'any-voice') return true;
    const lower = url.toLowerCase();
    const file = lower.split('/').pop() ?? lower;
    // Matches both Wave-1 (`vance_intro_1.mp3`) and Wave-2 (`london_lindqvist_offer_1.mp3`,
    // `callout_soren_coin_freeze.mp3`, `singapore_betrayal_nadia.mp3`, etc.)
    const tokenPattern = new RegExp(`(^|_)${this.actorId}(_|\\.)`);
    if (tokenPattern.test(file)) return true;
    if (this.voiceMatchMode === 'actor-or-cinema') {
      if (file.startsWith('cutscene_') || file.startsWith('ending_')) {
        return true;
      }
    }
    return false;
  }

  private resolveMoodAccent(rig: CharacterAnatomyRig): { primary: string; secondary: string } {
    switch (this.moodTint) {
      case 'crimson':
        return { primary: '#ff4f64', secondary: '#b8253b' };
      case 'gold':
        return { primary: '#fae098', secondary: '#d8af57' };
      case 'cyan':
        return { primary: '#56d4f5', secondary: '#2c88c9' };
      case 'emerald':
        return { primary: '#39d49a', secondary: '#1c8c64' };
      case 'platinum':
        return { primary: '#eef4ff', secondary: '#9bb5d6' };
      case 'default':
      default:
        if (this.expression === 'shocked') {
          return { primary: '#ff7082', secondary: rig.accentHex };
        }
        return { primary: rig.accentHex, secondary: rig.rimSecondaryHex };
    }
  }

  private renderFrame(dt: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    // Lazy sync if mounted before layout settled
    if (this.cssWidth <= 2 || this.cssHeight <= 2) {
      this.syncCanvasDimensions();
    }

    const w = this.cssWidth;
    const h = this.cssHeight;
    const rig = CHARACTER_ANATOMY_RIGS[this.actorId];
    const colors = this.resolveMoodAccent(rig);

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (this.stageAlpha <= 0.01) {
      ctx.restore();
      return;
    }
    ctx.globalAlpha = Math.max(0, Math.min(1, this.stageAlpha));

    // 1. Backdrop Sovereign Spotlight Halo & Drifting Bokeh Motes
    if (this.showBackdropHalo) {
      this.drawBackdropAtmosphere(ctx, w, h, colors.primary, colors.secondary, dt);
    }

    // 2. Compute Adaptive Framing & Organic 2.5D Deformation Parameters
    const aspect = w / Math.max(1, h);
    const useCloseUp =
      this.framing === 'close-up' ||
      (this.framing === 'auto' && (h < 92 || aspect > 0.92));

    let baseW: number;
    let baseH: number;
    let focusY: number;

    if (useCloseUp) {
      // Upper-bust framing so facial acting, eyes, glasses & ear tells read sharply even at 38-64px!
      const coverScale = Math.max(w / 512, h / (680 * 0.68));
      baseW = 512 * coverScale * 1.04;
      baseH = 680 * coverScale * 1.04;
      focusY = 0.33;
    } else {
      // Full Sovereign stage bust showing head, collar, lapels, cufflinks & wrist gear
      const fitScale = Math.max(w / 512, h / 680);
      baseW = 512 * fitScale * 1.02;
      baseH = 680 * fitScale * 1.02;
      focusY = 0.47;
    }

    // Persistent emotional resting posture
    const restingScale =
      this.expression === 'intense'
        ? 1.024
        : this.expression === 'smirk'
          ? 1.012
          : this.expression === 'shocked'
            ? 0.988
            : 1.0;

    const totalZoom = restingScale + this.emotionScaleImpulse + this.smoothVoiceAmp * 0.014;
    const drawW = baseW * totalZoom;
    const drawH = baseH * totalZoom;

    const drawX = (w - drawW) * 0.5 + this.slideOffsetX * w;
    const drawY = h * 0.42 - drawH * focusY + this.slideOffsetY * h + this.emotionRecoilY;

    // Continuous respiratory cycle (accelerates subtly under intense/shocked emotion)
    const emotionBreathMult =
      this.expression === 'shocked' ? 1.55 : this.expression === 'intense' ? 1.28 : 1.0;
    const t = this.elapsedSec + this.seedPhase;
    const breathWave = Math.sin(t * Math.PI * 2 * rig.breathRateHz * emotionBreathMult);
    const breath01 = (breathWave + 1) * 0.5;

    const breathY = -breathWave * Math.max(0.8, drawH * 0.0085);
    const breathScaleX = 1 + breath01 * 0.011;

    // Organic dual-harmonic head micro-sway + syllable speaking nods
    const swayPx = drawW * rig.swayAmpRatio;
    const headSwayX =
      Math.sin(t * 1.15) * swayPx * 0.68 +
      Math.cos(t * 0.63 + 1.4) * swayPx * 0.38 +
      (this.expression === 'smirk' ? drawW * 0.008 : 0);

    const speakingNodY = this.isCurrentlySpeaking
      ? Math.sin(this.elapsedSec * 19.5) * this.smoothVoiceAmp * Math.max(0.9, drawH * 0.009)
      : 0;
    const headNodY =
      Math.sin(t * 0.89 + 0.7) * (swayPx * 0.48) +
      speakingNodY;

    this.lastDrawRect = {
      x: drawX,
      y: drawY,
      w: drawW,
      h: drawH,
      headSwayX,
      headNodY,
      breathY,
      breathScaleX,
    };

    // 3. Load Current (& Previous Cross-Dissolve) Cutouts
    const curImg = this.getReadyImage(rig.cutouts[this.expression]);
    const prevImg =
      this.crossfade01 < 1 && rig.cutouts[this.prevExpression] !== rig.cutouts[this.expression]
        ? this.getReadyImage(rig.cutouts[this.prevExpression])
        : null;

    if (curImg) {
      // 3A. WebAudio Voice-Amplitude Rim-Light Silhouette Pass (behind cutout)
      const rimStrength = 0.22 + this.smoothVoiceAmp * 0.78 + (this.expression === 'intense' ? 0.14 : 0);
      this.drawVoiceRimSilhouette(
        ctx,
        curImg,
        drawX,
        drawY,
        drawW,
        drawH,
        rig.neckPivotY,
        headSwayX,
        headNodY,
        breathY,
        breathScaleX,
        colors.primary,
        colors.secondary,
        rimStrength,
      );

      // 3B. Seamless 14-Strip 2.5D Scanline Mesh Cutout Draw (with smooth cross-dissolve)
      const easeFade = easeOutCubic(this.crossfade01);
      if (prevImg && easeFade < 0.999) {
        this.drawWarpedCutoutMesh(
          ctx,
          prevImg,
          drawX,
          drawY,
          drawW,
          drawH,
          rig.neckPivotY,
          headSwayX,
          headNodY,
          breathY,
          breathScaleX,
          1 - easeFade * 0.85,
        );
      }

      this.drawWarpedCutoutMesh(
        ctx,
        curImg,
        drawX,
        drawY,
        drawW,
        drawH,
        rig.neckPivotY,
        headSwayX,
        headNodY,
        breathY,
        breathScaleX,
        prevImg ? easeFade : 1,
      );

      // 3C. Autonomous Eye-Blink & Specular Iris Catchlights
      this.drawEyeLifeAndBlink(ctx, rig, colors.primary);
    } else {
      // Instant stylized monogram silhouette placeholder during initial <20ms image decode
      this.drawLoadingSilhouette(ctx, w, h, rig, colors.primary);
    }

    // 4. Diegetic Tell Overlays (Cufflink glint, Amber eye glint, Smart-lens flash, Stylus ripple...)
    if (this.overlayCallbacks.size > 0) {
      const metrics: ProjectedStageMetrics = {
        canvasWidth: w,
        canvasHeight: h,
        dpr: this.dpr,
        timeSec: this.elapsedSec,
        dtSec: dt,
        actorId: this.actorId,
        expression: this.expression,
        rig,
        voiceAmplitude: this.smoothVoiceAmp,
        speechFormant: this.smoothFormant,
        isSpeaking: this.isCurrentlySpeaking,
        breathPhase01: breath01,
        projectAnchor: (nx, ny, opts) => this.projectNormalizedAnchor(nx, ny, opts),
      };
      for (const cb of this.overlayCallbacks) {
        ctx.save();
        cb(ctx, metrics);
        ctx.restore();
      }
    }

    // 5. Subtle Bottom Vignette & Live Speaking Waveform Rim Ring
    this.drawForegroundBroadcastFinish(ctx, w, h, colors.primary);

    ctx.restore();
  }

  private getReadyImage(rawUrl: string): HTMLImageElement | null {
    const resolved = resolveAssetHref(rawUrl);
    const cached = CUTOUT_IMAGE_CACHE.get(resolved);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      return cached;
    }
    void loadCutoutImage(rawUrl);
    return null;
  }

  private drawBackdropAtmosphere(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    primaryHex: string,
    secondaryHex: string,
    dt: number,
  ): void {
    const cx = w * 0.5;
    const cy = h * 0.38;
    const radius = Math.max(w, h) * (0.68 + this.smoothVoiceAmp * 0.14);

    const grad = ctx.createRadialGradient(cx, cy, radius * 0.06, cx, cy, radius);
    grad.addColorStop(0, hexToRgba(primaryHex, 0.24 + this.smoothVoiceAmp * 0.24));
    grad.addColorStop(0.55, hexToRgba(secondaryHex, 0.10 + this.smoothVoiceAmp * 0.08));
    grad.addColorStop(1, 'rgba(8, 11, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle floating Sovereign studio dust motes
    if (w >= 48 && h >= 48) {
      ctx.fillStyle = primaryHex;
      for (const m of this.motes) {
        m.x = (m.x + m.vx * dt + 1) % 1;
        m.y = (m.y + m.vy * dt + 1) % 1;
        const twinkle = 0.5 + 0.5 * Math.sin(this.elapsedSec * 2.4 + m.phase);
        ctx.globalAlpha = this.stageAlpha * m.alpha * twinkle * (0.7 + this.smoothVoiceAmp * 0.6);
        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = this.stageAlpha;
    }
  }

  private drawVoiceRimSilhouette(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    drawX: number,
    drawY: number,
    drawW: number,
    drawH: number,
    neckPivotY: number,
    headSwayX: number,
    headNodY: number,
    breathY: number,
    breathScaleX: number,
    primaryHex: string,
    secondaryHex: string,
    rimStrength: number,
  ): void {
    const leftRim = getTintedSilhouetteCanvas(img, primaryHex);
    const rightRim = getTintedSilhouetteCanvas(img, secondaryHex);
    if (!leftRim && !rightRim) return;

    const rimOffsetPx = Math.max(1.2, Math.min(4.8, drawW * (0.014 + this.smoothVoiceAmp * 0.022)));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    if (leftRim) {
      this.drawWarpedCutoutMesh(
        ctx,
        leftRim,
        drawX - rimOffsetPx,
        drawY - rimOffsetPx * 0.35,
        drawW,
        drawH,
        neckPivotY,
        headSwayX,
        headNodY,
        breathY,
        breathScaleX,
        Math.min(0.82, rimStrength * 0.62),
      );
    }
    if (rightRim) {
      this.drawWarpedCutoutMesh(
        ctx,
        rightRim,
        drawX + rimOffsetPx,
        drawY - rimOffsetPx * 0.25,
        drawW,
        drawH,
        neckPivotY,
        headSwayX,
        headNodY,
        breathY,
        breathScaleX,
        Math.min(0.68, rimStrength * 0.46),
      );
    }

    ctx.restore();
  }

  /**
   * 14-Strip Seamless 2.5D Scanline Mesh Warp:
   * Grounds the shoulders in respiratory expansion while smoothly pivoting
   * the upper neck & head with zero seam lines!
   */
  private drawWarpedCutoutMesh(
    ctx: CanvasRenderingContext2D,
    source: HTMLImageElement | HTMLCanvasElement,
    drawX: number,
    drawY: number,
    drawW: number,
    drawH: number,
    neckPivotY: number,
    headSwayX: number,
    headNodY: number,
    breathY: number,
    breathScaleX: number,
    alpha: number,
  ): void {
    if (alpha <= 0.004) return;
    const srcW = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const srcH = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    if (srcW <= 0 || srcH <= 0) return;

    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = prevAlpha * Math.max(0, Math.min(1, alpha));

    const invStrips = 1 / MESH_STRIPS;
    const overlapDst = 0.65; // prevents sub-pixel hairline gaps between strips

    for (let i = 0; i < MESH_STRIPS; i++) {
      const ny0 = i * invStrips;
      const ny1 = (i + 1) * invStrips;
      const nyMid = (ny0 + ny1) * 0.5;

      const headWeight = computeHeadInfluence(nyMid, neckPivotY);
      const stripScaleX = 1 + (breathScaleX - 1) * (1 - headWeight * 0.65);
      const stripW = drawW * stripScaleX;

      // Subtle tilt shear on head strips for natural 2.5D cranial poise
      const tiltShearX =
        headWeight * (neckPivotY - nyMid) * drawH * (this.emotionTiltRad + (headSwayX / Math.max(40, drawW)) * 0.32);

      const stripX = drawX + (drawW - stripW) * 0.5 + headSwayX * headWeight + tiltShearX;
      const stripOffsetY = breathY * (1 - headWeight * 0.25) + headNodY * headWeight;

      const sy = ny0 * srcH;
      const sh = (ny1 - ny0) * srcH;
      const dy = drawY + ny0 * drawH + stripOffsetY;
      const dh = (ny1 - ny0) * drawH + (i < MESH_STRIPS - 1 ? overlapDst : 0);

      ctx.drawImage(source, 0, sy, srcW, sh, stripX, dy, stripW, dh);
    }

    ctx.globalAlpha = prevAlpha;
  }

  private drawEyeLifeAndBlink(
    ctx: CanvasRenderingContext2D,
    rig: CharacterAnatomyRig,
    accentHex: string,
  ): void {
    const left = this.projectNormalizedAnchor(rig.leftEye.x, rig.leftEye.y);
    const right = this.projectNormalizedAnchor(rig.rightEye.x, rig.rightEye.y);
    const eyeRadius = Math.max(1.3, left.scale * 13.5);

    // Subtle iris specular life catchlight when eyes are open
    if (this.blinkProgress < 0) {
      const shimmer = 0.28 + 0.16 * Math.sin(this.elapsedSec * 3.1) + this.smoothVoiceAmp * 0.22;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = hexToRgba(
        this.expression === 'intense' || this.expression === 'smirk' ? accentHex : '#fff8e8',
        shimmer,
      );
      const dotR = Math.max(0.75, eyeRadius * 0.19);
      ctx.beginPath();
      ctx.arc(left.x - eyeRadius * 0.15, left.y - eyeRadius * 0.14, dotR, 0, Math.PI * 2);
      ctx.arc(right.x - eyeRadius * 0.15, right.y - eyeRadius * 0.14, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Smooth anatomical eyelid sweep during 145ms blink
    const lidClose = Math.sin(Math.min(1, Math.max(0, this.blinkProgress)) * Math.PI);
    if (lidClose <= 0.05) return;

    ctx.save();
    ctx.fillStyle = `rgba(22, 16, 15, ${(0.76 * lidClose).toFixed(3)})`;
    for (const eye of [left, right]) {
      ctx.beginPath();
      ctx.ellipse(
        eye.x,
        eye.y,
        eyeRadius * 1.18,
        Math.max(0.6, eyeRadius * 0.56 * lidClose),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  private drawForegroundBroadcastFinish(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    primaryHex: string,
  ): void {
    // Soft bottom stage ground shadow so feathered cutouts sit naturally inside dark bezels
    const bottomH = Math.max(8, h * 0.22);
    const bGrad = ctx.createLinearGradient(0, h - bottomH, 0, h);
    bGrad.addColorStop(0, 'rgba(8, 11, 18, 0)');
    bGrad.addColorStop(1, 'rgba(8, 11, 18, 0.58)');
    ctx.fillStyle = bGrad;
    ctx.fillRect(0, h - bottomH, w, bottomH);

    // Frameless Live WebAudio Speaking Bottom Hairline Sweep & Equalizer Micro-Bars (Zero Box Frame!)
    if (this.smoothVoiceAmp > 0.035) {
      const pulseAlpha = Math.min(0.92, 0.28 + this.smoothVoiceAmp * 0.72);
      ctx.save();
      const lineGrad = ctx.createLinearGradient(0, h - 1, w, h - 1);
      lineGrad.addColorStop(0, hexToRgba(primaryHex, 0));
      lineGrad.addColorStop(0.22, hexToRgba(primaryHex, pulseAlpha));
      lineGrad.addColorStop(0.78, hexToRgba(primaryHex, pulseAlpha));
      lineGrad.addColorStop(1, hexToRgba(primaryHex, 0));
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, h - 1.5, w, 1.5);

      if (this.showSpeakingWaveBadge && w >= 42 && h >= 42) {
        const barCount = 5;
        const barGap = 2.5;
        const barW = 2;
        const totalW = barCount * barW + (barCount - 1) * barGap;
        const startX = w - totalW - 5;
        const baseY = h - 4;

        ctx.fillStyle = hexToRgba(primaryHex, 0.92);
        for (let b = 0; b < barCount; b++) {
          const wave =
            0.3 +
            0.7 *
              Math.abs(
                Math.sin(this.elapsedSec * (14 + b * 3.7) + b * 0.9) *
                  (0.55 + this.smoothFormant * 0.45),
              );
          const barH = Math.max(2, (3 + this.smoothVoiceAmp * 9) * wave);
          ctx.fillRect(startX + b * (barW + barGap), baseY - barH, barW, barH);
        }
      }
      ctx.restore();
    }
  }

  private drawLoadingSilhouette(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    rig: CharacterAnatomyRig,
    primaryHex: string,
  ): void {
    ctx.save();
    ctx.fillStyle = hexToRgba(primaryHex, 0.18);
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.36, Math.min(w, h) * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.84, w * 0.34, h * 0.26, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = hexToRgba(primaryHex, 0.65);
    ctx.font = `700 ${Math.max(10, Math.round(Math.min(w, h) * 0.22))}px Cinzel, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rig.displayName.charAt(0), w * 0.5, h * 0.5);
    ctx.restore();
  }
}

// ----------------------------------------------------------------------------
// Pure Math & Color Helpers
// ----------------------------------------------------------------------------

function computeHeadInfluence(ny: number, neckPivotY: number): number {
  // Smooth C1 Hermite transition across neck band [neckPivotY - 0.08 .. neckPivotY + 0.08]
  const bandHalf = 0.085;
  const raw = (neckPivotY + bandHalf - ny) / (bandHalf * 2);
  const t = Math.max(0, Math.min(1, raw));
  return t * t * (3 - 2 * t);
}

function easeOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  const inv = 1 - c;
  return 1 - inv * inv * inv;
}

export function normalizeCastId(raw: string): CastMemberId {
  const clean = (raw || 'vance').trim().toLowerCase();
  if (
    clean === 'vance' ||
    clean === 'nadia' ||
    clean === 'soren' ||
    clean === 'teo' ||
    clean === 'lindqvist' ||
    clean === 'tariq'
  ) {
    return clean;
  }
  if (clean.includes('nadia')) return 'nadia';
  if (clean.includes('soren') || clean.includes('echo')) return 'soren';
  if (clean.includes('teo') || clean.includes('mateo')) return 'teo';
  if (clean.includes('lindqvist') || clean.includes('ingrid')) return 'lindqvist';
  if (clean.includes('tariq')) return 'tariq';
  return 'vance';
}

export function normalizeExpression(raw: string): CharacterExpression {
  const clean = (raw || 'neutral').trim().toLowerCase();
  if (clean === 'intense' || clean === 'tense' || clean === 'focused' || clean === 'angry') {
    return 'intense';
  }
  if (clean === 'shocked' || clean === 'rattled' || clean === 'surprised') {
    return 'shocked';
  }
  if (clean === 'smirk' || clean === 'confident' || clean === 'impressed' || clean === 'smile') {
    return 'smirk';
  }
  return 'neutral';
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '').trim();
  const a = Math.max(0, Math.min(1, alpha));
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) || 216;
    const g = parseInt(clean[1] + clean[1], 16) || 175;
    const b = parseInt(clean[2] + clean[2], 16) || 87;
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
  }
  const r = parseInt(clean.slice(0, 2), 16) || 216;
  const g = parseInt(clean.slice(2, 4), 16) || 175;
  const b = parseInt(clean.slice(4, 6), 16) || 87;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}
