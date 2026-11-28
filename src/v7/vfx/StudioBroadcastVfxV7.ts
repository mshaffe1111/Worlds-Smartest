// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master — 1966 Living Color)
// Ultra-HD 60fps Canvas2D Broadcast Celebration, Score Popups & Studio Juice VFX
// (`src/v7/vfx/StudioBroadcastVfxV7.ts`)
//
// Craft Lineage: 1966 NBC/CBS "In Living Color" Optical Titling (Saul Bass ·
// Morton Goldsholl · Goodson-Todman), zero AI boxes, zero DOM bloat, demand-
// driven 60fps RAF idling at 0% CPU when quiet, and Retina DPR crispness across
// Mobile Portrait (360..430px), Mobile Landscape, Tablet & Desktop.
// ============================================================================

export type ConfettiIntensityV7 = 'MEDIUM' | 'JACKPOT';

export type ScorePopToneV7 =
  | 'GOLD'
  | 'PEACOCK'
  | 'TANGERINE'
  | 'CERISE'
  | 'EMERALD'
  | 'VERMILION'
  | 'JACKPOT';

export interface VfxOriginPointV7 {
  readonly xPx?: number;
  readonly yPx?: number;
}

export interface AudienceBulbFlashOptionsV7 {
  readonly count?: number;
  readonly durationMs?: number;
  readonly intensity?: number;
}

export interface GoldenSparkleTrailOptionsV7 {
  /** Number of sweeping golden comet trails (default: 2 on mobile portrait, 2 otherwise; max 6). */
  readonly count?: number;
  /** Sweep duration in milliseconds (default: 980ms). */
  readonly durationMs?: number;
  /** Color theme for trail ribbons & shed stardust (default: `'GOLD'`). */
  readonly palette?: 'GOLD' | 'LIVING_COLOR';
}

export interface StudioBroadcastVfxOptionsV7 {
  /** Existing overlay canvas; defaults to `#vfx-canvas` if found, otherwise creates one. */
  readonly canvas?: HTMLCanvasElement | null;
  /** Parent container used when creating a new canvas (defaults to `document.body`). */
  readonly container?: HTMLElement | null;
  /** CSS z-index for the non-interactive overlay canvas (default: `85`). */
  readonly zIndex?: number;
  /** Honors accessibility preference by softening motion density & flash cadence. */
  readonly reducedMotion?: boolean;
  /** Upper clamp on backing store pixel ratio for 60fps mobile fill-rate (default: `2.5`). */
  readonly maxDpr?: number;
  /** When true (default), manages an automatic demand-driven rAF loop. */
  readonly autoAnimate?: boolean;
}

export interface StudioBroadcastVfxTelemetryV7 {
  readonly activeConfetti: number;
  readonly activeScorePops: number;
  readonly activeFlashbulbs: number;
  readonly activeSparkles: number;
  readonly activeSparkleTrails: number;
  readonly activeWaves: number;
  readonly isLoopRunning: boolean;
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly dpr: number;
  readonly reducedMotion: boolean;
  readonly lastFrameMs: number;
  readonly avgFrameMs: number;
  readonly mobileBudgetThrottled: boolean;
}

// ----------------------------------------------------------------------------
// 1966 "In Living Color" Canonical Foil & Optical Broadcast Palettes
// ----------------------------------------------------------------------------

interface FoilSwatch {
  readonly frontLight: string;
  readonly frontMid: string;
  readonly frontDark: string;
  readonly backColor: string;
  readonly glintColor: string;
}

const LIVING_COLOR_FOILS: readonly FoilSwatch[] = [
  // Living Color Peacock Teal (#0096A6 / #22C7D8) + Spun Aluminum Back
  {
    frontLight: '#6FF2FF',
    frontMid: '#18BDD0',
    frontDark: '#007B8A',
    backColor: '#D6E2EC',
    glintColor: '#E8FEFF',
  },
  // Harvest Marquee Gold (#F4A91F / #FFD56B) + Burnished Gold Back
  {
    frontLight: '#FFF0AD',
    frontMid: '#FFD04D',
    frontDark: '#D9860A',
    backColor: '#C48418',
    glintColor: '#FFFBE6',
  },
  // Atomic Carnaby Tangerine (#FF6738) + Warm Gold Laminate Back
  {
    frontLight: '#FFB08A',
    frontMid: '#FF6738',
    frontDark: '#CC3E14',
    backColor: '#F5C453',
    glintColor: '#FFF2DC',
  },
  // Mod Pop Cerise (#E63B7A) + Broadcast Cream Foil Back
  {
    frontLight: '#FF8AB8',
    frontMid: '#E63B7A',
    frontDark: '#B01E56',
    backColor: '#F7EEDB',
    glintColor: '#FFEBF3',
  },
  // CBS Royal Cobalt (#1E56C5) + Brushed Aluminum Back
  {
    frontLight: '#82B1FF',
    frontMid: '#2B67DF',
    frontDark: '#143C94',
    backColor: '#DCE6F2',
    glintColor: '#EDF4FF',
  },
  // RCA Warm Broadcast Cream / Satin Gold Leaf
  {
    frontLight: '#FFF9E8',
    frontMid: '#F7EEDB',
    frontDark: '#D9C296',
    backColor: '#F4A91F',
    glintColor: '#FFFDF5',
  },
];

interface ScoreToneSpec {
  readonly gradTop: string;
  readonly gradMid: string;
  readonly gradBot: string;
  readonly outline: string;
  readonly extrude: string;
  readonly extrudeRim: string;
  readonly glowRgba: string;
  readonly rayPrimary: string;
  readonly raySecondary: string;
  readonly sublineFill: string;
  readonly sparkleColors: readonly string[];
  readonly rayCount: number;
  readonly lifetimeSec: number;
}

const SCORE_TONE_SPECS: Record<ScorePopToneV7, ScoreToneSpec> = {
  GOLD: {
    gradTop: '#FFF8D6',
    gradMid: '#FFD56B',
    gradBot: '#EA9610',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#9C5E08',
    glowRgba: 'rgba(255, 213, 107, 0.44)',
    rayPrimary: 'rgba(255, 213, 107, 0.50)',
    raySecondary: 'rgba(247, 238, 219, 0.30)',
    sublineFill: '#FFF4D4',
    sparkleColors: ['#FFD56B', '#FFF6D8', '#FF9F1C'],
    rayCount: 8,
    lifetimeSec: 1.48,
  },
  PEACOCK: {
    gradTop: '#E4FEFF',
    gradMid: '#3BE0F0',
    gradBot: '#008B99',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#005661',
    glowRgba: 'rgba(34, 199, 216, 0.48)',
    rayPrimary: 'rgba(34, 199, 216, 0.56)',
    raySecondary: 'rgba(255, 213, 107, 0.42)',
    sublineFill: '#FFF3C9',
    sparkleColors: ['#22C7D8', '#FFD56B', '#F7EEDB'],
    rayCount: 12,
    lifetimeSec: 1.72,
  },
  TANGERINE: {
    gradTop: '#FFF0D6',
    gradMid: '#FF8652',
    gradBot: '#E64617',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#94280A',
    glowRgba: 'rgba(255, 103, 56, 0.48)',
    rayPrimary: 'rgba(255, 103, 56, 0.54)',
    raySecondary: 'rgba(255, 213, 107, 0.42)',
    sublineFill: '#FFF1D6',
    sparkleColors: ['#FF6738', '#FFD56B', '#FFF5E0'],
    rayCount: 10,
    lifetimeSec: 1.62,
  },
  CERISE: {
    gradTop: '#FFE8F1',
    gradMid: '#FF6AA4',
    gradBot: '#D42668',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#8A1241',
    glowRgba: 'rgba(230, 59, 122, 0.48)',
    rayPrimary: 'rgba(230, 59, 122, 0.56)',
    raySecondary: 'rgba(255, 213, 107, 0.40)',
    sublineFill: '#FFF4E6',
    sparkleColors: ['#E63B7A', '#FFD56B', '#22C7D8'],
    rayCount: 12,
    lifetimeSec: 1.72,
  },
  EMERALD: {
    gradTop: '#E6FFF0',
    gradMid: '#4CE68A',
    gradBot: '#15994E',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#0C6332',
    glowRgba: 'rgba(52, 211, 120, 0.48)',
    rayPrimary: 'rgba(52, 211, 120, 0.55)',
    raySecondary: 'rgba(255, 213, 107, 0.42)',
    sublineFill: '#FFF5D6',
    sparkleColors: ['#34D378', '#FFD56B', '#F7EEDB'],
    rayCount: 12,
    lifetimeSec: 1.72,
  },
  VERMILION: {
    gradTop: '#FFE7E5',
    gradMid: '#FF6B61',
    gradBot: '#CC2820',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#7D1712',
    glowRgba: 'rgba(224, 62, 54, 0.42)',
    rayPrimary: 'rgba(224, 62, 54, 0.42)',
    raySecondary: 'rgba(255, 168, 122, 0.28)',
    sublineFill: '#FFECEB',
    sparkleColors: ['#FF6B61', '#FFD56B'],
    rayCount: 8,
    lifetimeSec: 1.42,
  },
  JACKPOT: {
    gradTop: '#FFFCE0',
    gradMid: '#FFD56B',
    gradBot: '#FF6738',
    outline: '#141B29',
    extrude: '#3E2012',
    extrudeRim: '#008694',
    glowRgba: 'rgba(255, 213, 107, 0.62)',
    rayPrimary: 'rgba(255, 213, 107, 0.66)',
    raySecondary: 'rgba(34, 199, 216, 0.50)',
    sublineFill: '#FFF7E0',
    sparkleColors: ['#FFD56B', '#22C7D8', '#FF6738', '#E63B7A', '#F7EEDB'],
    rayCount: 16,
    lifetimeSec: 2.05,
  },
};

const HEADLINE_FONT_STACK =
  "'Caprasimo', 'Fraunces', Georgia, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', serif";
const SUBLINE_FONT_STACK =
  "'Michroma', 'Jost', 'Plus Jakarta Sans', -apple-system, sans-serif";

// ----------------------------------------------------------------------------
// Internal Particle & Animation State Structures
// ----------------------------------------------------------------------------

type ConfettiShapeKind = 'RIBBON' | 'ATOMIC_STAR' | 'MARQUEE_STAR' | 'FOIL_DIAMOND';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  terminalVy: number;
  size: number;
  aspect: number;
  shape: ConfettiShapeKind;
  swatch: FoilSwatch;
  pitch: number;
  yaw: number;
  roll: number;
  vPitch: number;
  vYaw: number;
  vRoll: number;
  flutterPhase: number;
  flutterFreq: number;
  flutterAmp: number;
  curlAmp: number;
  age: number;
  maxAge: number;
  canGlint: boolean;
}

interface PopupTextSegment {
  readonly text: string;
  readonly isColorEmoji: boolean;
}

interface FloatingScorePop {
  x: number;
  y: number;
  startY: number;
  risePx: number;
  halfW: number;
  headline: string;
  subline: string;
  tone: ScorePopToneV7;
  age: number;
  maxAge: number;
  tiltDir: number;
  starburstAngle: number;
  starburstSpin: number;
  // Cached layout & typography metrics (computed once per viewport width — zero per-frame measureText/regex!)
  cachedViewportW: number;
  cachedHeadlinePx: number;
  cachedSublinePx: number;
  cachedSegments: readonly PopupTextSegment[];
  cachedSegWidths: readonly number[];
  cachedTotalHeadW: number;
  cachedSubMeasure: number;
}

interface AudienceFlashbulb {
  x: number;
  y: number;
  delaySec: number;
  age: number;
  durationSec: number;
  maxRadius: number;
  spikeLength: number;
  lensTiltRad: number;
  intensity: number;
  warmTint: string;
}

interface OpticalSparkle {
  kind: 'SPARKLE' | 'RING';
  x: number;
  y: number;
  vx: number;
  vy: number;
  drag: number;
  size: number;
  endSize: number;
  angle: number;
  vAngle: number;
  color: string;
  age: number;
  maxAge: number;
}

interface GoldenSparkleTrail {
  x0: number;
  y0: number;
  cx: number;
  cy: number;
  x1: number;
  y1: number;
  delaySec: number;
  age: number;
  durationSec: number;
  ribbonColor: string;
  coreColor: string;
  dustColors: readonly string[];
  emitAccumSec: number;
  history: Array<{ x: number; y: number }>;
  apexBurstDone: boolean;
}

interface ScheduledWave {
  delaySec: number;
  fire: () => void;
}

// ----------------------------------------------------------------------------
// Utility Math Helpers
// ----------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function easeOutCubic(t: number): number {
  const inv = 1 - clamp(t, 0, 1);
  return 1 - inv * inv * inv;
}

function easeOutQuart(t: number): number {
  const inv = 1 - clamp(t, 0, 1);
  return 1 - inv * inv * inv * inv;
}

// Precomputed unit-circle star vertices (zero Math.cos/sin inside 60fps loops)
const ATOMIC_STAR4_COS = Float32Array.from({ length: 8 }, (_, i) =>
  Math.cos((i * Math.PI) / 4),
);
const ATOMIC_STAR4_SIN = Float32Array.from({ length: 8 }, (_, i) =>
  Math.sin((i * Math.PI) / 4),
);
const STAR5_COS = Float32Array.from({ length: 10 }, (_, i) =>
  Math.cos(-Math.PI / 2 + (i * Math.PI) / 5),
);
const STAR5_SIN = Float32Array.from({ length: 10 }, (_, i) =>
  Math.sin(-Math.PI / 2 + (i * Math.PI) / 5),
);

function swapRemove<T>(arr: T[], index: number): void {
  const lastIdx = arr.length - 1;
  if (index !== lastIdx) {
    arr[index] = arr[lastIdx];
  }
  arr.pop();
}

// ----------------------------------------------------------------------------
// Master 1966 Broadcast VFX Controller (`StudioBroadcastVfxV7`)
// ----------------------------------------------------------------------------

export class StudioBroadcastVfxV7 {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly ownsCanvas: boolean;
  private readonly maxDpr: number;
  private readonly autoAnimate: boolean;

  private viewportW = 390;
  private viewportH = 844;
  private dpr = 1;
  private reducedMotion: boolean;

  private readonly confetti: ConfettiParticle[] = [];
  private readonly scorePops: FloatingScorePop[] = [];
  private readonly flashbulbs: AudienceFlashbulb[] = [];
  private readonly sparkles: OpticalSparkle[] = [];
  private readonly sparkleTrails: GoldenSparkleTrail[] = [];
  private readonly pendingWaves: ScheduledWave[] = [];

  private rafId: number | null = null;
  private lastRafMs = 0;
  private lastFrameMs = 0;
  private avgFrameMs = 0;
  private mobileBudgetThrottled = false;
  private disposed = false;

  private readonly detachListeners: Array<() => void> = [];

  constructor(options: StudioBroadcastVfxOptionsV7 = {}) {
    this.maxDpr = clamp(options.maxDpr ?? 2.5, 1, 3);
    this.autoAnimate = options.autoAnimate ?? true;
    this.reducedMotion =
      options.reducedMotion ??
      (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false);

    // Resolve existing `#vfx-canvas` or mint a clean DOM-free overlay canvas
    let resolvedCanvas: HTMLCanvasElement | null = options.canvas ?? null;
    if (!resolvedCanvas && typeof document !== 'undefined') {
      const existing = document.getElementById('vfx-canvas');
      if (existing instanceof HTMLCanvasElement) {
        resolvedCanvas = existing;
      }
    }

    if (resolvedCanvas) {
      this.canvas = resolvedCanvas;
      this.ownsCanvas = false;
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'ws7-studio-vfx-canvas';
      this.ownsCanvas = true;
      const mountParent = options.container ?? document.body;
      mountParent.appendChild(this.canvas);
    }

    this.applyCanvasOverlayStyles(options.zIndex ?? 85);
    // CRITICAL: Never pass `desynchronized: true` on a transparent full-screen overlay canvas!
    // DirectComposition / mobile GPU swapchains composite `desynchronized` 2D canvases with an
    // opaque black backing buffer, turning the entire screen black when celebration VFX draw.
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
    });

    this.resize();
    this.bindViewportListeners();
    this.prewarmBroadcastFonts();
  }

  // --------------------------------------------------------------------------
  // Public Broadcast VFX API
  // --------------------------------------------------------------------------

  /**
   * Launches metallic 1966 Living Color Peacock/Gold/Tangerine/Cerise ribbon
   * and atomic-star confetti with 3D tumblespin physics & studio light glints.
   */
  public burstLivingColorConfetti(
    intensity: ConfettiIntensityV7 = 'MEDIUM',
    origin?: VfxOriginPointV7,
  ): void {
    if (this.disposed) return;

    const isCompact = this.viewportW < 520;
    const motionFactor = this.reducedMotion ? 0.36 : 1.0;

    if (intensity === 'MEDIUM') {
      const hasExplicitOrigin =
        origin &&
        typeof origin.xPx === 'number' &&
        Number.isFinite(origin.xPx) &&
        typeof origin.yPx === 'number' &&
        Number.isFinite(origin.yPx);

      if (hasExplicitOrigin) {
        const ox = clamp(origin!.xPx!, 24, this.viewportW - 24);
        const oy = clamp(origin!.yPx!, 40, this.viewportH - 36);
        const fountainCount = Math.round((isCompact ? 42 : 56) * motionFactor);
        this.spawnConfettiFountain(ox, oy, fountainCount, 0.92);

        // Framing studio wing accent sparks
        const wingCount = Math.round((isCompact ? 12 : 18) * motionFactor);
        this.spawnSideCannon('LEFT', wingCount, 0.72);
        this.spawnSideCannon('RIGHT', wingCount, 0.72);
        this.burstTileSparkleRing(ox, oy, 'GOLD');
      } else {
        const wingCount = Math.round((isCompact ? 26 : 36) * motionFactor);
        const centerCount = Math.round((isCompact ? 16 : 24) * motionFactor);
        this.spawnSideCannon('LEFT', wingCount, 0.92);
        this.spawnSideCannon('RIGHT', wingCount, 0.92);
        this.spawnConfettiFountain(
          this.viewportW * 0.5,
          this.viewportH * 0.44,
          centerCount,
          0.78,
        );
      }

      this.ensureLoopRunning();
      return;
    }

    // JACKPOT: Multi-wave 1966 Prime-Time Finale Celebration!
    const wave1Wing = Math.round((isCompact ? 34 : 48) * motionFactor);
    const wave1Center = Math.round((isCompact ? 26 : 38) * motionFactor);
    this.spawnSideCannon('LEFT', wave1Wing, 1.15);
    this.spawnSideCannon('RIGHT', wave1Wing, 1.15);
    this.spawnConfettiFountain(
      this.viewportW * 0.5,
      this.viewportH * 0.62,
      wave1Center,
      1.18,
    );
    this.burstTileSparkleRing(
      this.viewportW * 0.5,
      this.viewportH * 0.42,
      'JACKPOT',
    );

    // Wave 2 (+210ms): Overhead Studio 6A Catwalk Shimmer Cascade
    this.pendingWaves.push({
      delaySec: 0.21,
      fire: () => {
        const catwalkCount = Math.round((isCompact ? 44 : 64) * motionFactor);
        this.spawnCatwalkCascade(catwalkCount);
      },
    });

    // Wave 3 (+480ms): Twin Upper Boom Encore Pop
    if (!this.reducedMotion) {
      this.pendingWaves.push({
        delaySec: 0.48,
        fire: () => {
          const boomCount = isCompact ? 22 : 34;
          this.spawnConfettiFountain(
            this.viewportW * 0.24,
            this.viewportH * 0.32,
            boomCount,
            0.88,
          );
          this.spawnConfettiFountain(
            this.viewportW * 0.76,
            this.viewportH * 0.32,
            boomCount,
            0.88,
          );
        },
      });
    }

    this.ensureLoopRunning();
  }

  /**
   * Spawns a bold extruded 1966 `Caprasimo`/`Michroma` kinetic broadcast score
   * popup (`+$450!`, `★ 2X SECRET SQUARE!`, `🔒 VAULT UNLOCKED!`) with spring
   * overshoot, optical starburst halo, specular sweep, and mobile safe clamping.
   * Zero rectangular boxes!
   */
  public spawnFloatingScorePop(
    xPx: number,
    yPx: number,
    headline: string,
    subline = '',
    tone: ScorePopToneV7 = 'GOLD',
  ): void {
    if (this.disposed) return;

    const cleanHeadline = headline.trim();
    if (!cleanHeadline) return;
    const cleanSubline = subline.trim().toUpperCase();

    const spec = SCORE_TONE_SPECS[tone] ?? SCORE_TONE_SPECS.GOLD;
    const vw = this.viewportW;
    const vh = this.viewportH;

    // Fallback to centered golden broadcast framing if coordinates are non-finite
    let targetX = Number.isFinite(xPx) ? xPx : vw * 0.5;
    let targetY = Number.isFinite(yPx) ? yPx : vh * 0.42;

    // Clamp vertically below top scorebug and above bottom thumb-safe edge
    const minY = Math.min(vh * 0.32, Math.max(82, vh * 0.14));
    const maxY = Math.max(minY + 32, vh - Math.max(66, vh * 0.11));
    targetY = clamp(targetY, minY, maxY);

    // Measure widths of both headline and subline (including peak 1.22x spring overshoot!)
    const { headlinePx, sublinePx } = this.computePopupFontSizes(
      cleanHeadline,
      cleanSubline,
    );
    const springHeadroom = this.reducedMotion ? 1.04 : 1.22;
    const estHalfW =
      Math.max(
        this.estimateTextHalfWidth(cleanHeadline, headlinePx, HEADLINE_FONT_STACK, '400'),
        cleanSubline
          ? this.estimateTextHalfWidth(cleanSubline, sublinePx, SUBLINE_FONT_STACK, '700') + 24
          : 0,
      ) * springHeadroom;
    const edgePad = Math.max(16, vw * 0.035);
    if (estHalfW * 2 + edgePad * 2 >= vw) {
      targetX = vw * 0.5;
    } else {
      targetX = clamp(targetX, edgePad + estHalfW, vw - edgePad - estHalfW);
    }

    // De-overlap against active score pops using exact horizontal & vertical bounding boxes
    for (let attempt = 0; attempt < 5; attempt++) {
      let collided = false;
      for (const existing of this.scorePops) {
        if (existing.age > existing.maxAge * 0.72) continue;
        const dx = Math.abs(existing.x - targetX);
        const dy = Math.abs(existing.y - targetY);
        const minHorizGap = existing.halfW + estHalfW + 14;
        if (dx < minHorizGap && dy < 74) {
          collided = true;
          const nextUp = targetY - 78;
          targetY = nextUp >= minY ? nextUp : clamp(targetY + 78, minY, maxY);
          break;
        }
      }
      if (!collided) break;
    }

    // Cap simultaneous popups so fast streaks stay razor-clean
    if (this.scorePops.length >= 6) {
      this.scorePops.shift();
    }

    const risePx = this.reducedMotion
      ? 24
      : clamp(vh * 0.075, 44, 72);

    const newPop: FloatingScorePop = {
      x: targetX,
      y: targetY,
      startY: targetY,
      risePx,
      halfW: estHalfW,
      headline: cleanHeadline,
      subline: cleanSubline,
      tone,
      age: 0,
      maxAge: spec.lifetimeSec,
      tiltDir: Math.random() < 0.5 ? -1 : 1,
      starburstAngle: randRange(0, Math.PI / 4),
      starburstSpin: (Math.random() < 0.5 ? 1 : -1) * randRange(0.28, 0.52),
      cachedViewportW: -1,
      cachedHeadlinePx: headlinePx,
      cachedSublinePx: sublinePx,
      cachedSegments: this.splitEmojiSegments(cleanHeadline),
      cachedSegWidths: [],
      cachedTotalHeadW: 0,
      cachedSubMeasure: 0,
    };
    this.ensurePopupMetrics(newPop);
    this.scorePops.push(newPop);

    // Shed crisp 4-point optical sparkles around the kinetic title
    const sparkleCount = this.reducedMotion
      ? 4
      : tone === 'JACKPOT'
        ? 16
        : tone === 'GOLD' || tone === 'VERMILION'
          ? 8
          : 12;
    this.spawnOpticalSparkles(
      targetX,
      targetY,
      sparkleCount,
      spec.sparkleColors,
      tone === 'JACKPOT' ? 1.25 : 0.95,
    );

    if (
      tone === 'PEACOCK' ||
      tone === 'EMERALD' ||
      tone === 'CERISE' ||
      tone === 'JACKPOT'
    ) {
      this.sparkles.push({
        kind: 'RING',
        x: targetX,
        y: targetY,
        vx: 0,
        vy: 0,
        drag: 1,
        size: 16,
        endSize: clamp(vw * 0.24, 76, 138),
        angle: 0,
        vAngle: 0,
        color: spec.gradMid,
        age: 0,
        maxAge: 0.46,
      });
    }

    this.ensureLoopRunning();
  }

  /**
   * Fires warm 1966 magnesium tungsten camera flashbulb pops around the live
   * Studio 6A audience periphery (keeping the central 72% board & clue crystal-clear).
   */
  public flashStudioAudienceBulbs(
    options: AudienceBulbFlashOptionsV7 = {},
  ): void {
    if (this.disposed) return;

    const baseCount = options.count ?? (this.viewportW < 520 ? 11 : 16);
    const count = this.reducedMotion
      ? Math.max(4, Math.round(baseCount * 0.35))
      : clamp(baseCount, 4, 32);
    const spreadSec = clamp((options.durationMs ?? 920) * 0.001, 0.25, 2.8);
    const intensity = clamp(options.intensity ?? 1.0, 0.4, 1.4);

    const vw = this.viewportW;
    const vh = this.viewportH;
    const isPortrait = vh > vw;

    const placed: Array<{ x: number; y: number }> = [];
    const minSpacing = Math.min(vw, vh) * 0.11;

    for (let i = 0; i < count; i++) {
      let bx = 0;
      let by = 0;

      for (let tries = 0; tries < 8; tries++) {
        const pt = this.samplePeripheryBulbPoint(vw, vh, isPortrait, i);
        bx = pt.x;
        by = pt.y;
        const tooClose = placed.some(
          (p) => Math.hypot(p.x - bx, p.y - by) < minSpacing,
        );
        if (!tooClose) break;
      }

      placed.push({ x: bx, y: by });

      // Front-loaded camera-volley rhythm: immediate pop burst + organic ripple
      const normalizedIdx = count > 1 ? i / (count - 1) : 0;
      const delaySec =
        i < 2
          ? randRange(0, 0.045)
          : clamp(
              Math.pow(normalizedIdx, 0.88) * spreadSec + randRange(-0.04, 0.06),
              0,
              spreadSec,
            );

      const scaleFactor = clamp(Math.min(vw, vh) / 560, 0.72, 1.28);
      const bulbWarmth = pickRandom([
        '#FFD56B',
        '#FFE49E',
        '#FFC44D',
        '#FFF0C2',
      ]);

      this.flashbulbs.push({
        x: bx,
        y: by,
        delaySec,
        age: 0,
        durationSec: this.reducedMotion
          ? randRange(0.45, 0.62)
          : randRange(0.30, 0.46),
        maxRadius: randRange(46, 86) * scaleFactor * intensity,
        spikeLength: randRange(36, 78) * scaleFactor * intensity,
        lensTiltRad: randRange(-0.22, 0.22),
        intensity: randRange(0.78, 1.08) * intensity,
        warmTint: bulbWarmth,
      });
    }

    // Cap total queued bulbs to keep rapid double-triggers crisp
    const maxBulbs = 48;
    if (this.flashbulbs.length > maxBulbs) {
      this.flashbulbs.splice(0, this.flashbulbs.length - maxBulbs);
    }

    this.ensureLoopRunning();
  }

  /**
   * Triggers a tight 1966 atomic starburst ring & metallic gleam around a
   * specific board tile or interactive screen point.
   */
  public burstTileSparkleRing(
    xPx: number,
    yPx: number,
    tone: ScorePopToneV7 = 'GOLD',
  ): void {
    if (this.disposed) return;
    const x = Number.isFinite(xPx) ? clamp(xPx, 16, this.viewportW - 16) : this.viewportW * 0.5;
    const y = Number.isFinite(yPx) ? clamp(yPx, 16, this.viewportH - 16) : this.viewportH * 0.5;
    const spec = SCORE_TONE_SPECS[tone] ?? SCORE_TONE_SPECS.GOLD;

    this.sparkles.push({
      kind: 'RING',
      x,
      y,
      vx: 0,
      vy: 0,
      drag: 1,
      size: 10,
      endSize: clamp(Math.min(this.viewportW, this.viewportH) * 0.16, 54, 108),
      angle: 0,
      vAngle: 0,
      color: spec.gradMid,
      age: 0,
      maxAge: 0.42,
    });

    this.spawnOpticalSparkles(
      x,
      y,
      this.reducedMotion ? 4 : 11,
      spec.sparkleColors,
      0.85,
    );
    this.ensureLoopRunning();
  }

  /**
   * Launches subtle sweeping 1966 golden stardust comet trails framing the
   * studio stage wings (tailored especially for tall Mobile Portrait victories
   * while keeping center headlines & modals 100% unobstructed).
   */
  public launchGoldenSparkleTrails(
    options: GoldenSparkleTrailOptionsV7 = {},
  ): void {
    if (this.disposed) return;

    const vw = this.viewportW;
    const vh = this.viewportH;
    const isPortrait = vh > vw;
    const count = this.reducedMotion
      ? 2
      : clamp(options.count ?? (isPortrait ? 4 : 2), 1, 6);
    const baseDurationSec = clamp(
      (options.durationMs ?? (this.reducedMotion ? 1250 : 960)) * 0.001,
      0.45,
      2.2,
    );
    const palette = options.palette ?? 'GOLD';
    const goldDust: readonly string[] = ['#FFF9DC', '#FFD56B', '#F4A91F'];
    const livingDust: readonly string[] = ['#FFF9DC', '#FFD56B', '#22C7D8', '#FF9B6A'];

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1; // -1 = left wing, +1 = right wing
      const waveIdx = Math.floor(i / 2);
      const xStart =
        side < 0
          ? vw * randRange(0.05, 0.13)
          : vw * randRange(0.87, 0.95);
      const yStart = vh * randRange(0.84, 0.93);

      // Sweeping mid-century S/C-curve hugging stage periphery toward upper crown
      const xCtrl =
        side < 0
          ? vw * (isPortrait ? randRange(0.04, 0.14) : randRange(0.10, 0.20))
          : vw * (isPortrait ? randRange(0.86, 0.96) : randRange(0.80, 0.90));
      const yCtrl = vh * randRange(0.42, 0.56);

      const xEnd =
        side < 0
          ? vw * (isPortrait ? randRange(0.24, 0.38) : randRange(0.26, 0.36))
          : vw * (isPortrait ? randRange(0.62, 0.76) : randRange(0.64, 0.74));
      const yEnd = vh * randRange(0.13, 0.23);

      const useLivingAccent = palette === 'LIVING_COLOR' && waveIdx >= 1;
      this.sparkleTrails.push({
        x0: xStart,
        y0: yStart,
        cx: xCtrl,
        cy: yCtrl,
        x1: xEnd,
        y1: yEnd,
        delaySec: waveIdx * 0.26 + (i % 2) * 0.04,
        age: 0,
        durationSec: baseDurationSec * randRange(0.92, 1.08),
        ribbonColor: useLivingAccent ? '#22C7D8' : '#FFD56B',
        coreColor: '#FFFDF2',
        dustColors: useLivingAccent ? livingDust : goldDust,
        emitAccumSec: 0,
        history: [],
        apexBurstDone: false,
      });
    }

    if (this.sparkleTrails.length > 10) {
      this.sparkleTrails.splice(0, this.sparkleTrails.length - 10);
    }

    this.ensureLoopRunning();
  }

  /**
   * Convenience celebration sequence for Episode Wins & Daily Broadcast triumphs.
   * Automatically pairs subtle sweeping golden sparkle trails on Mobile Portrait.
   */
  public celebrateEpisodeWin(headline?: string, subline?: string): void {
    if (this.disposed) return;
    const isMobilePortrait = this.viewportH > this.viewportW && this.viewportW <= 600;
    this.burstLivingColorConfetti('JACKPOT');
    this.flashStudioAudienceBulbs({ count: 22, durationMs: 1450, intensity: 1.15 });
    if (isMobilePortrait) {
      this.launchGoldenSparkleTrails({
        count: 4,
        durationMs: 1020,
        palette: 'GOLD',
      });
    } else {
      this.launchGoldenSparkleTrails({
        count: 2,
        durationMs: 940,
        palette: 'GOLD',
      });
    }
    if (headline) {
      this.spawnFloatingScorePop(
        this.viewportW * 0.5,
        this.viewportH * 0.34,
        headline,
        subline ?? 'IN LIVING COLOR CHAMPION',
        'JACKPOT',
      );
    }
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = Boolean(enabled);
  }

  /** Resizes the backing canvas to match the current viewport & mobile-tuned Retina DPR. */
  public resize(): void {
    if (this.disposed || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    const docEl = typeof document !== 'undefined' ? document.documentElement : null;
    const rawW = vv?.width ?? docEl?.clientWidth ?? window.innerWidth;
    const rawH = vv?.height ?? docEl?.clientHeight ?? window.innerHeight;
    const cssW = Math.max(1, Math.round(rawW));
    const cssH = Math.max(1, Math.round(rawH));
    // Cap compact mobile portrait backing scale at <= 2.0 to save 36% GPU fill-rate at 60fps
    const effectiveMaxDpr = cssW <= 520 ? Math.min(this.maxDpr, 2.0) : this.maxDpr;
    const nextDpr = clamp(window.devicePixelRatio || 1, 1, effectiveMaxDpr);

    this.viewportW = cssW;
    this.viewportH = cssH;
    this.dpr = nextDpr;

    const targetW = Math.max(1, Math.round(cssW * nextDpr));
    const targetH = Math.max(1, Math.round(cssH * nextDpr));
    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  /**
   * Clears active floating text popups immediately (e.g. when a question card or
   * backstage modal opens) while keeping ambient celebration confetti, sparkles,
   * golden trails, and studio flashbulbs running cleanly underneath/around it.
   */
  public clearTransientPopups(): void {
    if (this.disposed || this.scorePops.length === 0) return;
    this.scorePops.length = 0;

    if (!this.hasActiveEffects()) {
      this.stopLoop();
      this.clearCanvasSurface();
    } else {
      // Repaint immediately so cleared text never lingers for even one frame over a modal
      this.renderFrame();
    }
  }

  /** Immediately clears all live particles, popups, flashes, and pending waves. */
  public clear(): void {
    this.confetti.length = 0;
    this.scorePops.length = 0;
    this.flashbulbs.length = 0;
    this.sparkles.length = 0;
    this.sparkleTrails.length = 0;
    this.pendingWaves.length = 0;
    this.mobileBudgetThrottled = false;
    this.avgFrameMs = 0;
    this.lastFrameMs = 0;
    this.stopLoop();
    this.clearCanvasSurface();
  }

  /**
   * Advances simulation and renders one crisp frame. Can be invoked directly
   * for deterministic testing or frame-capture snapshots.
   */
  public step(dtSec: number): void {
    if (this.disposed) return;
    const dt = clamp(Number.isFinite(dtSec) ? dtSec : 1 / 60, 0, 0.05);
    const t0 = performance.now();
    this.advanceSimulation(dt);
    this.renderFrame();
    this.recordFrameCostMs(performance.now() - t0);
  }

  public getTelemetry(): StudioBroadcastVfxTelemetryV7 {
    return {
      activeConfetti: this.confetti.length,
      activeScorePops: this.scorePops.length,
      activeFlashbulbs: this.flashbulbs.length,
      activeSparkles: this.sparkles.length,
      activeSparkleTrails: this.sparkleTrails.length,
      activeWaves: this.pendingWaves.length,
      isLoopRunning: this.rafId !== null,
      canvasWidth: this.viewportW,
      canvasHeight: this.viewportH,
      dpr: this.dpr,
      reducedMotion: this.reducedMotion,
      lastFrameMs: Number(this.lastFrameMs.toFixed(2)),
      avgFrameMs: Number(this.avgFrameMs.toFixed(2)),
      mobileBudgetThrottled: this.mobileBudgetThrottled,
    };
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clear();

    for (const unsub of this.detachListeners) {
      unsub();
    }
    this.detachListeners.length = 0;

    if (this.ownsCanvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }

  // --------------------------------------------------------------------------
  // Canvas Lifecycle & Demand-Driven 60fps Loop
  // --------------------------------------------------------------------------

  private applyCanvasOverlayStyles(zIndex: number): void {
    const s = this.canvas.style;
    s.display = 'none';
    s.position = 'fixed';
    s.top = '0';
    s.left = '0';
    s.width = '100vw';
    s.height = '100dvh';
    s.pointerEvents = 'none';
    s.background = 'transparent';
    s.zIndex = String(zIndex);
    s.margin = '0';
    s.padding = '0';
    this.canvas.setAttribute('aria-hidden', 'true');
  }

  private bindViewportListeners(): void {
    if (typeof window === 'undefined') return;
    const onResize = (): void => {
      this.resize();
      if (this.hasActiveEffects()) {
        this.renderFrame();
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    this.detachListeners.push(() => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', onResize, { passive: true });
      this.detachListeners.push(() => {
        vv.removeEventListener('resize', onResize);
      });
    }
  }

  private prewarmBroadcastFonts(): void {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    try {
      void document.fonts.load("400 42px 'Caprasimo'");
      void document.fonts.load("400 16px 'Michroma'");
    } catch {
      // Non-critical if Font Loading API is restricted
    }
  }

  private hasActiveEffects(): boolean {
    return (
      this.confetti.length > 0 ||
      this.scorePops.length > 0 ||
      this.flashbulbs.length > 0 ||
      this.sparkles.length > 0 ||
      this.sparkleTrails.length > 0 ||
      this.pendingWaves.length > 0
    );
  }

  private ensureLoopRunning(): void {
    if (this.disposed) return;
    if (this.canvas.style.display !== 'block') {
      this.canvas.style.display = 'block';
    }
    if (!this.autoAnimate) return;
    if (this.rafId !== null) return;
    this.lastRafMs = performance.now();
    this.rafId = window.requestAnimationFrame(this.onRafTick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.canvas.style.display !== 'none') {
      this.canvas.style.display = 'none';
    }
  }

  private readonly onRafTick = (nowMs: number): void => {
    this.rafId = null;
    if (this.disposed) return;

    const dtSec = clamp((nowMs - this.lastRafMs) * 0.001, 0.001, 0.05);
    this.lastRafMs = nowMs;

    const frameStart = performance.now();
    this.advanceSimulation(dtSec);
    this.renderFrame();
    this.recordFrameCostMs(performance.now() - frameStart);

    if (this.hasActiveEffects()) {
      this.rafId = window.requestAnimationFrame(this.onRafTick);
    } else {
      this.clearCanvasSurface();
      this.canvas.style.display = 'none';
    }
  };

  /**
   * Tracks VFX CPU/Canvas2D frame cost against the 60fps mobile budget
   * (leaving >= 7ms headroom for Three.js WebGL2 inside a 16.6ms frame).
   */
  private recordFrameCostMs(frameMs: number): void {
    this.lastFrameMs = frameMs;
    this.avgFrameMs =
      this.avgFrameMs === 0 ? frameMs : this.avgFrameMs * 0.85 + frameMs * 0.15;

    if (!this.mobileBudgetThrottled && this.avgFrameMs > 9.5) {
      this.mobileBudgetThrottled = true;
      const cap = this.getMaxConfettiCap();
      if (this.confetti.length > cap) {
        this.confetti.length = cap;
      }
    } else if (this.mobileBudgetThrottled && this.avgFrameMs < 5.8) {
      this.mobileBudgetThrottled = false;
    }
  }

  private isCompactMobilePortrait(): boolean {
    return this.viewportH > this.viewportW && this.viewportW <= 560;
  }

  private clearCanvasSurface(): void {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // --------------------------------------------------------------------------
  // Confetti Cannon & Sparkle Spawners
  // --------------------------------------------------------------------------

  private getMaxConfettiCap(): number {
    if (this.reducedMotion) return 75;
    if (this.mobileBudgetThrottled) return this.viewportW <= 560 ? 95 : 150;
    return this.isCompactMobilePortrait() ? 145 : this.viewportW < 640 ? 175 : 250;
  }

  private getMaxSparklesCap(): number {
    if (this.reducedMotion) return 48;
    if (this.mobileBudgetThrottled) return 64;
    return this.isCompactMobilePortrait() ? 88 : 135;
  }

  private pickConfettiShape(): ConfettiShapeKind {
    const r = Math.random();
    if (r < 0.36) return 'RIBBON';
    if (r < 0.62) return 'ATOMIC_STAR';
    if (r < 0.80) return 'MARQUEE_STAR';
    return 'FOIL_DIAMOND';
  }

  private pushConfetti(p: ConfettiParticle): void {
    const cap = this.getMaxConfettiCap();
    if (this.confetti.length >= cap) {
      // Recycle oldest confetti piece to keep frame times rock-solid
      this.confetti.shift();
    }
    this.confetti.push(p);
  }

  private spawnSideCannon(
    side: 'LEFT' | 'RIGHT',
    count: number,
    powerScale: number,
  ): void {
    const vw = this.viewportW;
    const vh = this.viewportH;
    const isLeft = side === 'LEFT';
    const originX = isLeft ? vw * 0.04 : vw * 0.96;
    const originY = vh * randRange(0.64, 0.78);
    const speedNorm = clamp(Math.hypot(vw, vh) / 960, 0.72, 1.35) * powerScale;

    for (let i = 0; i < count; i++) {
      // Aim upward and across center-stage arc
      const baseAngle = isLeft
        ? randRange(-Math.PI * 0.44, -Math.PI * 0.16)
        : randRange(-Math.PI * 0.84, -Math.PI * 0.56);
      const speed = randRange(460, 960) * speedNorm;
      const shape = this.pickConfettiShape();
      const scale = clamp(vw / 500, 0.82, 1.24);

      this.pushConfetti({
        x: originX + randRange(-14, 14),
        y: originY + randRange(-26, 26),
        vx: Math.cos(baseAngle) * speed,
        vy: Math.sin(baseAngle) * speed,
        gravity: randRange(420, 610) * (this.reducedMotion ? 0.65 : 1),
        drag: randRange(1.75, 2.55),
        terminalVy: randRange(108, 195),
        size: (shape === 'RIBBON' ? randRange(15, 24) : randRange(7.5, 13)) * scale,
        aspect: shape === 'RIBBON' ? randRange(0.24, 0.34) : randRange(0.65, 1.0),
        shape,
        swatch: pickRandom(LIVING_COLOR_FOILS),
        pitch: randRange(0, Math.PI * 2),
        yaw: randRange(0, Math.PI * 2),
        roll: randRange(0, Math.PI * 2),
        vPitch: randRange(-9.5, 9.5) * (this.reducedMotion ? 0.4 : 1),
        vYaw: randRange(-8.5, 8.5) * (this.reducedMotion ? 0.4 : 1),
        vRoll: randRange(-5.5, 5.5) * (this.reducedMotion ? 0.4 : 1),
        flutterPhase: randRange(0, Math.PI * 2),
        flutterFreq: randRange(3.4, 6.2),
        flutterAmp: randRange(38, 86),
        curlAmp: randRange(2.2, 4.6),
        age: 0,
        maxAge: randRange(2.4, 3.85),
        canGlint: Math.random() < 0.58,
      });
    }
  }

  private spawnConfettiFountain(
    x: number,
    y: number,
    count: number,
    powerScale: number,
  ): void {
    const speedNorm =
      clamp(Math.hypot(this.viewportW, this.viewportH) / 960, 0.72, 1.32) *
      powerScale;
    const scale = clamp(this.viewportW / 500, 0.82, 1.24);

    for (let i = 0; i < count; i++) {
      const angle = randRange(-Math.PI * 0.92, -Math.PI * 0.08);
      const speed = randRange(260, 720) * speedNorm;
      const shape = this.pickConfettiShape();

      this.pushConfetti({
        x: x + randRange(-18, 18),
        y: y + randRange(-12, 12),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randRange(40, 140),
        gravity: randRange(430, 620) * (this.reducedMotion ? 0.65 : 1),
        drag: randRange(1.9, 2.75),
        terminalVy: randRange(112, 198),
        size: (shape === 'RIBBON' ? randRange(15, 24) : randRange(7.5, 13.5)) * scale,
        aspect: shape === 'RIBBON' ? randRange(0.24, 0.35) : randRange(0.65, 1.0),
        shape,
        swatch: pickRandom(LIVING_COLOR_FOILS),
        pitch: randRange(0, Math.PI * 2),
        yaw: randRange(0, Math.PI * 2),
        roll: randRange(0, Math.PI * 2),
        vPitch: randRange(-10, 10) * (this.reducedMotion ? 0.4 : 1),
        vYaw: randRange(-9, 9) * (this.reducedMotion ? 0.4 : 1),
        vRoll: randRange(-6, 6) * (this.reducedMotion ? 0.4 : 1),
        flutterPhase: randRange(0, Math.PI * 2),
        flutterFreq: randRange(3.6, 6.4),
        flutterAmp: randRange(36, 82),
        curlAmp: randRange(2.4, 4.8),
        age: 0,
        maxAge: randRange(2.2, 3.65),
        canGlint: Math.random() < 0.65,
      });
    }
  }

  private spawnCatwalkCascade(count: number): void {
    const vw = this.viewportW;
    const scale = clamp(vw / 500, 0.84, 1.26);

    for (let i = 0; i < count; i++) {
      const shape = this.pickConfettiShape();
      this.pushConfetti({
        x: randRange(vw * 0.05, vw * 0.95),
        y: randRange(-32, -6),
        vx: randRange(-75, 75),
        vy: randRange(65, 220),
        gravity: randRange(310, 460) * (this.reducedMotion ? 0.65 : 1),
        drag: randRange(1.4, 2.2),
        terminalVy: randRange(125, 215),
        size: (shape === 'RIBBON' ? randRange(17, 27) : randRange(8, 14)) * scale,
        aspect: shape === 'RIBBON' ? randRange(0.22, 0.33) : randRange(0.68, 1.0),
        shape,
        swatch: pickRandom(LIVING_COLOR_FOILS),
        pitch: randRange(0, Math.PI * 2),
        yaw: randRange(0, Math.PI * 2),
        roll: randRange(0, Math.PI * 2),
        vPitch: randRange(-8.5, 8.5) * (this.reducedMotion ? 0.4 : 1),
        vYaw: randRange(-7.5, 7.5) * (this.reducedMotion ? 0.4 : 1),
        vRoll: randRange(-4.5, 4.5) * (this.reducedMotion ? 0.4 : 1),
        flutterPhase: randRange(0, Math.PI * 2),
        flutterFreq: randRange(3.2, 5.8),
        flutterAmp: randRange(44, 96),
        curlAmp: randRange(2.6, 5.0),
        age: 0,
        maxAge: randRange(2.6, 4.2),
        canGlint: Math.random() < 0.64,
      });
    }
  }

  private spawnOpticalSparkles(
    x: number,
    y: number,
    count: number,
    colors: readonly string[],
    power: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + randRange(-0.28, 0.28);
      const speed = randRange(75, 215) * power;
      this.sparkles.push({
        kind: 'SPARKLE',
        x: x + Math.cos(ang) * randRange(8, 28),
        y: y + Math.sin(ang) * randRange(6, 18),
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - randRange(12, 42),
        drag: randRange(2.6, 4.2),
        size: randRange(5.5, 12.5) * power,
        endSize: 0,
        angle: randRange(0, Math.PI / 2),
        vAngle: randRange(-3.5, 3.5),
        color: pickRandom(colors),
        age: 0,
        maxAge: randRange(0.45, 0.82),
      });
    }
    const sparkleCap = this.getMaxSparklesCap();
    if (this.sparkles.length > sparkleCap) {
      this.sparkles.splice(0, this.sparkles.length - sparkleCap);
    }
  }

  private samplePeripheryBulbPoint(
    vw: number,
    vh: number,
    isPortrait: boolean,
    index: number,
  ): { x: number; y: number } {
    // Distribute evenly around left wing, right wing, bottom audience pit, and top balcony corners
    // while strictly preserving the central 72% Board & Question sightline.
    const zoneRoll = (index % 7) + Math.random() * 0.4;

    if (zoneRoll < 2.2) {
      // Left studio audience orchestra wing
      return {
        x: randRange(vw * 0.025, vw * (isPortrait ? 0.13 : 0.16)),
        y: randRange(vh * 0.16, vh * 0.88),
      };
    }
    if (zoneRoll < 4.4) {
      // Right studio audience orchestra wing
      return {
        x: randRange(vw * (isPortrait ? 0.87 : 0.84), vw * 0.975),
        y: randRange(vh * 0.16, vh * 0.88),
      };
    }
    if (zoneRoll < 6.0) {
      // Front-row lower audience rim
      return {
        x: randRange(vw * 0.08, vw * 0.92),
        y: randRange(vh * 0.86, vh * 0.965),
      };
    }
    // Upper studio balcony corners (left or right of top scorebug center)
    const onLeft = Math.random() < 0.5;
    return {
      x: onLeft
        ? randRange(vw * 0.03, vw * 0.22)
        : randRange(vw * 0.78, vw * 0.97),
      y: randRange(vh * 0.085, vh * 0.175),
    };
  }

  // --------------------------------------------------------------------------
  // Simulation Physics Step
  // --------------------------------------------------------------------------

  private advanceSimulation(dt: number): void {
    // 1. Fire any due choreographed waves
    for (let i = this.pendingWaves.length - 1; i >= 0; i--) {
      const w = this.pendingWaves[i];
      w.delaySec -= dt;
      if (w.delaySec <= 0) {
        this.pendingWaves.splice(i, 1);
        w.fire();
      }
    }

    // 2. Step 3D-tumbling metallic confetti particles (O(1) swap-and-pop removal)
    const bottomExitY = this.viewportH + 46;
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const p = this.confetti[i];
      p.age += dt;
      if (p.age >= p.maxAge || p.y > bottomExitY) {
        swapRemove(this.confetti, i);
        continue;
      }

      // Exponential aerodynamic drag
      const dragFactor = Math.exp(-p.drag * dt);
      p.vx *= dragFactor;
      p.vy *= dragFactor;

      // Gravity tempered by flat-side aerodynamic lift (cos(pitch) face resistance)
      const flatFactor = Math.abs(Math.cos(p.pitch));
      const effectiveGravity = p.gravity * (0.68 + 0.32 * (1 - flatFactor));
      p.vy = Math.min(p.terminalVy, p.vy + effectiveGravity * dt);

      // Gentle buoyant lateral paper/foil flutter
      const flutterVelocityX =
        Math.sin(p.age * p.flutterFreq + p.flutterPhase) * p.flutterAmp;

      p.x += (p.vx + flutterVelocityX) * dt;
      p.y += p.vy * dt;

      // 3D tumble angles
      p.pitch += p.vPitch * dt;
      p.yaw += p.vYaw * dt;
      p.roll += p.vRoll * dt;
    }

    // 3. Step kinetic floating score popups (preserves paint order)
    for (let i = this.scorePops.length - 1; i >= 0; i--) {
      const pop = this.scorePops[i];
      pop.age += dt;
      if (pop.age >= pop.maxAge) {
        this.scorePops.splice(i, 1);
        continue;
      }
      const progress = clamp(pop.age / pop.maxAge, 0, 1);
      pop.y = pop.startY - pop.risePx * easeOutCubic(progress);
      pop.starburstAngle += pop.starburstSpin * dt;
    }

    // 4. Step studio periphery camera flashbulbs (O(1) swap-and-pop)
    for (let i = this.flashbulbs.length - 1; i >= 0; i--) {
      const b = this.flashbulbs[i];
      if (b.delaySec > 0) {
        b.delaySec -= dt;
        continue;
      }
      b.age += dt;
      if (b.age >= b.durationSec) {
        swapRemove(this.flashbulbs, i);
      }
    }

    // 5. Step optical sparkles & starburst rings (O(1) swap-and-pop)
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.age += dt;
      if (sp.age >= sp.maxAge) {
        swapRemove(this.sparkles, i);
        continue;
      }
      if (sp.kind === 'SPARKLE') {
        const d = Math.exp(-sp.drag * dt);
        sp.vx *= d;
        sp.vy *= d;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.angle += sp.vAngle * dt;
      }
    }

    // 6. Step sweeping golden stage-wing sparkle trails
    const mobilePortrait = this.isCompactMobilePortrait();
    const sparkleCap = this.getMaxSparklesCap();
    for (let i = this.sparkleTrails.length - 1; i >= 0; i--) {
      const tr = this.sparkleTrails[i];
      if (tr.delaySec > 0) {
        tr.delaySec -= dt;
        continue;
      }
      tr.age += dt;
      const tailFadePad = 0.28;
      if (tr.age >= tr.durationSec + tailFadePad) {
        this.sparkleTrails.splice(i, 1);
        continue;
      }

      const rawU = clamp(tr.age / tr.durationSec, 0, 1);
      const u = easeOutCubic(rawU);
      const inv = 1 - u;
      const px = inv * inv * tr.x0 + 2 * inv * u * tr.cx + u * u * tr.x1;
      const py = inv * inv * tr.y0 + 2 * inv * u * tr.cy + u * u * tr.y1;

      if (rawU < 1) {
        tr.history.push({ x: px, y: py });
        const maxTrailPts = this.reducedMotion ? 9 : mobilePortrait ? 14 : 18;
        if (tr.history.length > maxTrailPts) {
          tr.history.shift();
        }

        // Shed delicate golden stardust motes along the curve wake
        tr.emitAccumSec += dt;
        const emitInterval = this.reducedMotion
          ? 0.085
          : mobilePortrait || this.mobileBudgetThrottled
            ? 0.045
            : 0.032;
        while (tr.emitAccumSec >= emitInterval) {
          tr.emitAccumSec -= emitInterval;
          if (this.sparkles.length < sparkleCap) {
            this.sparkles.push({
              kind: 'SPARKLE',
              x: px + randRange(-5, 5),
              y: py + randRange(-5, 5),
              vx: randRange(-26, 26),
              vy: randRange(-14, 34),
              drag: 2.8,
              size: randRange(3.8, 7.6),
              endSize: 0,
              angle: randRange(0, Math.PI / 2),
              vAngle: randRange(-4, 4),
              color: pickRandom(tr.dustColors),
              age: 0,
              maxAge: randRange(0.36, 0.64),
            });
          }
        }
      } else {
        // Taper off ribbon tail once comet reaches crown apex
        if (tr.history.length > 0) {
          tr.history.shift();
        }
        if (!tr.apexBurstDone) {
          tr.apexBurstDone = true;
          this.spawnOpticalSparkles(
            tr.x1,
            tr.y1,
            this.reducedMotion ? 3 : 6,
            tr.dustColors,
            0.52,
          );
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Ultra-HD 60fps Canvas2D Rendering Pipeline
  // --------------------------------------------------------------------------

  private renderFrame(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    this.clearCanvasSurface();

    // Layer 1: Studio Audience Camera Flashbulbs (soft periphery rim light & tungsten stars)
    if (this.flashbulbs.length > 0) {
      this.renderAudienceFlashbulbs(ctx);
    }

    // Layer 2: Sweeping Golden Stage-Wing Sparkle Trails
    if (this.sparkleTrails.length > 0) {
      this.renderGoldenSparkleTrails(ctx);
    }

    // Layer 3: Metallic 1966 Living Color Confetti (3D tumblespin + studio light glints)
    if (this.confetti.length > 0) {
      this.renderConfettiLayer(ctx);
    }

    // Layer 4: Optical Starburst Rings & Sparkle Motes
    if (this.sparkles.length > 0) {
      this.renderSparklesLayer(ctx);
    }

    // Layer 5: Bold Extruded Caprasimo / Michroma Kinetic Score Popups (topmost)
    if (this.scorePops.length > 0) {
      this.renderScorePopsLayer(ctx);
    }
  }

  // ---- Layer 2: Sweeping 1966 Golden Stardust Comet Trails ----

  private renderGoldenSparkleTrails(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const tr of this.sparkleTrails) {
      if (tr.delaySec > 0 || tr.history.length < 2) continue;

      const rawU = clamp(tr.age / tr.durationSec, 0, 1);
      const tailFade =
        tr.age > tr.durationSec
          ? clamp(1 - (tr.age - tr.durationSec) / 0.28, 0, 1)
          : 1;
      const baseAlpha = clamp(tr.age / 0.08, 0, 1) * tailFade * 0.72;
      if (baseAlpha <= 0.02) continue;

      const pts = tr.history;
      // Draw smoothly tapered luminous ribbon segments from tail to comet head
      for (let i = 1; i < pts.length; i++) {
        const segT = i / (pts.length - 1);
        const pPrev = pts[i - 1];
        const pCurr = pts[i];

        // Soft warm outer golden halo ribbon
        ctx.strokeStyle = tr.ribbonColor;
        ctx.globalAlpha = baseAlpha * segT * segT * 0.55;
        ctx.lineWidth = 1.4 + segT * 5.2;
        ctx.beginPath();
        ctx.moveTo(pPrev.x, pPrev.y);
        ctx.lineTo(pCurr.x, pCurr.y);
        ctx.stroke();

        // Crisp incandescent core filament
        ctx.strokeStyle = tr.coreColor;
        ctx.globalAlpha = baseAlpha * segT * 0.85;
        ctx.lineWidth = 0.8 + segT * 2.0;
        ctx.beginPath();
        ctx.moveTo(pPrev.x, pPrev.y);
        ctx.lineTo(pCurr.x, pCurr.y);
        ctx.stroke();
      }

      // 4-Point Atomic Star Comet Tip while actively sweeping
      if (rawU < 0.98) {
        const head = pts[pts.length - 1];
        const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 18);
        headGlow.addColorStop(0, `rgba(255, 253, 240, ${(baseAlpha * 0.95).toFixed(3)})`);
        headGlow.addColorStop(0.42, `rgba(255, 213, 107, ${(baseAlpha * 0.55).toFixed(3)})`);
        headGlow.addColorStop(1, 'rgba(255, 213, 107, 0)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(tr.age * 3.8);
        ctx.globalAlpha = clamp(baseAlpha * 1.15, 0, 1);
        ctx.fillStyle = tr.coreColor;
        this.traceAtomicStar4(ctx, 11.5, 2.4);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // ---- Layer 1: 1966 Studio Audience Camera Flashbulbs ----

  private renderAudienceFlashbulbs(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    let aggregateEdgeBloom = 0;

    for (const b of this.flashbulbs) {
      if (b.delaySec > 0) continue;

      const u = clamp(b.age / b.durationSec, 0, 1);
      // Physical magnesium filament curve: blazing 24ms strike -> smooth warm amber decay
      let env: number;
      if (u < 0.08) {
        const k = u / 0.08;
        env = k * (2 - k);
      } else if (u < 0.22) {
        env = 1.0 - ((u - 0.08) / 0.14) * 0.14;
      } else {
        const decayU = (u - 0.22) / 0.78;
        env = 0.86 * Math.exp(-4.6 * decayU) * (1 - decayU * 0.25);
      }

      const alpha = clamp(env * b.intensity, 0, 1);
      if (alpha <= 0.01) continue;

      aggregateEdgeBloom = Math.min(0.10, aggregateEdgeBloom + alpha * 0.022);

      // Outer 2700K atmospheric tungsten corona
      const outerR = b.maxRadius * (0.68 + 0.42 * easeOutQuart(u));
      const outerGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, outerR);
      outerGrad.addColorStop(0, `rgba(255, 252, 236, ${(0.88 * alpha).toFixed(3)})`);
      outerGrad.addColorStop(0.24, `rgba(255, 220, 128, ${(0.56 * alpha).toFixed(3)})`);
      outerGrad.addColorStop(0.58, `rgba(255, 168, 52, ${(0.20 * alpha).toFixed(3)})`);
      outerGrad.addColorStop(1, 'rgba(255, 150, 36, 0)');

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, outerR, 0, Math.PI * 2);
      ctx.fill();

      // Vintage RCA TK-41 camera-lens anamorphic star diffraction spikes
      const spikeLen = b.spikeLength * (0.55 + 0.55 * env);
      const spikeThick = Math.max(1.4, 3.2 * env);

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.lensTiltRad);

      // Primary 4-point horizontal/vertical flare needles
      this.drawDiffractionNeedle(ctx, spikeLen * 1.18, spikeThick, alpha * 0.92, '#FFFDF4');
      ctx.rotate(Math.PI / 2);
      this.drawDiffractionNeedle(ctx, spikeLen * 0.92, spikeThick * 0.9, alpha * 0.84, b.warmTint);

      // Secondary 45-degree diagonal glass flares
      ctx.rotate(Math.PI / 4);
      this.drawDiffractionNeedle(ctx, spikeLen * 0.56, spikeThick * 0.65, alpha * 0.54, b.warmTint);
      ctx.rotate(Math.PI / 2);
      this.drawDiffractionNeedle(ctx, spikeLen * 0.56, spikeThick * 0.65, alpha * 0.54, b.warmTint);

      // Blinding pinpoint filament core
      const coreR = Math.max(2.5, 7.5 * env);
      ctx.fillStyle = `rgba(255, 254, 245, ${clamp(alpha * 1.1, 0, 1).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Ultra-subtle warm tungsten kiss along the studio periphery frame
    if (aggregateEdgeBloom > 0.015) {
      const cx = this.viewportW * 0.5;
      const cy = this.viewportH * 0.5;
      const innerR = Math.min(this.viewportW, this.viewportH) * 0.36;
      const outerR = Math.hypot(cx, cy) * 1.05;
      const rimGrad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
      rimGrad.addColorStop(0, 'rgba(255, 213, 107, 0)');
      rimGrad.addColorStop(0.75, 'rgba(255, 213, 107, 0)');
      rimGrad.addColorStop(1, `rgba(255, 214, 118, ${aggregateEdgeBloom.toFixed(3)})`);
      ctx.fillStyle = rimGrad;
      ctx.fillRect(0, 0, this.viewportW, this.viewportH);
    }

    ctx.restore();
  }

  private drawDiffractionNeedle(
    ctx: CanvasRenderingContext2D,
    halfLength: number,
    halfThickness: number,
    alpha: number,
    color: string,
  ): void {
    if (alpha <= 0.02 || halfLength < 2) return;
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-halfLength, 0);
    ctx.quadraticCurveTo(0, -halfThickness, halfLength, 0);
    ctx.quadraticCurveTo(0, halfThickness, -halfLength, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ---- Layer 3: Metallic 1966 Living Color Confetti (zero save/restore matrix fast-path) ----

  private renderConfettiLayer(ctx: CanvasRenderingContext2D): void {
    const dpr = this.dpr;
    const allowGlintFlashes = !this.reducedMotion && !this.mobileBudgetThrottled;
    ctx.save();
    ctx.lineWidth = 1.15;

    for (const p of this.confetti) {
      const lifeRatio = p.age / p.maxAge;
      const fadeIn = clamp(p.age / 0.08, 0, 1);
      const fadeOut = lifeRatio > 0.76 ? clamp(1 - (lifeRatio - 0.76) / 0.24, 0, 1) : 1;
      const alpha = fadeIn * fadeOut;
      if (alpha <= 0.015) continue;

      // 3D tumbling surface normal projected toward studio camera & overhead key light
      const cosPitch = Math.cos(p.pitch);
      const cosYaw = Math.cos(p.yaw);
      const facing = cosPitch * cosYaw; // -1 .. +1 (front vs metallic back)
      const absFacing = Math.abs(facing);
      const isFront = facing >= 0;

      // Specular key-light reflection peak when angled ~35deg toward Studio 6A Fresnel bank
      const keyAlign = 1 - Math.min(1, Math.abs(absFacing - 0.76) / 0.22);
      const glintStrength = p.canGlint ? keyAlign * keyAlign : 0;

      const scaleX = Math.max(0.18, Math.abs(cosYaw));
      const scaleY = Math.max(0.16, Math.abs(cosPitch));
      const skewX = Math.sin(p.yaw) * 0.22;
      const skewY = Math.sin(p.pitch) * 0.16;

      // Direct 2D affine matrix: dpr * Translate(x,y) * Rotate(roll) * ShearScale (zero ctx.save/restore!)
      const cr = Math.cos(p.roll);
      const sr = Math.sin(p.roll);
      const m00 = scaleX;
      const m10 = skewY * scaleX;
      const m01 = skewX * scaleY;
      const m11 = scaleY;
      ctx.setTransform(
        (cr * m00 - sr * m10) * dpr,
        (sr * m00 + cr * m10) * dpr,
        (cr * m01 - sr * m11) * dpr,
        (sr * m01 + cr * m11) * dpr,
        p.x * dpr,
        p.y * dpr,
      );
      ctx.globalAlpha = alpha;

      // Select shaded foil color based on 3D tilt angle
      let fillStyle: string;
      if (!isFront) {
        fillStyle = glintStrength > 0.58 ? p.swatch.glintColor : p.swatch.backColor;
      } else if (glintStrength > 0.62) {
        fillStyle = p.swatch.glintColor;
      } else if (absFacing > 0.68) {
        fillStyle = p.swatch.frontLight;
      } else if (absFacing > 0.34) {
        fillStyle = p.swatch.frontMid;
      } else {
        fillStyle = p.swatch.frontDark;
      }

      ctx.fillStyle = fillStyle;

      switch (p.shape) {
        case 'RIBBON': {
          const halfLen = p.size * 0.55;
          const halfW = Math.max(2.1, p.size * p.aspect * 0.5);
          const wave = Math.sin(p.age * 10 + p.flutterPhase) * p.curlAmp;
          ctx.beginPath();
          ctx.moveTo(-halfLen, -halfW);
          ctx.quadraticCurveTo(0, -halfW + wave, halfLen, -halfW - wave * 0.45);
          ctx.lineTo(halfLen, halfW - wave * 0.45);
          ctx.quadraticCurveTo(0, halfW + wave, -halfLen, halfW);
          ctx.closePath();
          ctx.fill();

          // Crisp spun-foil specular highlight rib
          if (isFront && glintStrength > 0.25) {
            ctx.strokeStyle = p.swatch.glintColor;
            ctx.globalAlpha = alpha * 0.55;
            ctx.beginPath();
            ctx.moveTo(-halfLen * 0.78, 0);
            ctx.quadraticCurveTo(0, wave, halfLen * 0.78, -wave * 0.4);
            ctx.stroke();
          }
          break;
        }
        case 'ATOMIC_STAR': {
          this.traceAtomicStar4(ctx, p.size * 0.72, p.size * 0.21);
          ctx.fill();
          break;
        }
        case 'MARQUEE_STAR': {
          this.traceFivePointStar(ctx, p.size * 0.66, p.size * 0.29);
          ctx.fill();
          break;
        }
        case 'FOIL_DIAMOND': {
          const w = p.size * 0.46;
          const h = p.size * 0.66;
          ctx.beginPath();
          ctx.moveTo(0, -h);
          ctx.lineTo(w, 0);
          ctx.lineTo(0, h);
          ctx.lineTo(-w, 0);
          ctx.closePath();
          ctx.fill();
          break;
        }
      }

      // Studio light-glint optical cross-flash on peak metallic catchlight!
      if (allowGlintFlashes && glintStrength > 0.78) {
        const sparkAlpha = clamp((glintStrength - 0.78) / 0.22, 0, 1) * alpha * 0.9;
        if (sparkAlpha > 0.1) {
          ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
          ctx.globalCompositeOperation = 'lighter';
          const gLen = p.size * 0.74 * (0.65 + 0.5 * sparkAlpha);
          this.drawDiffractionNeedle(ctx, gLen, 1.3, sparkAlpha, p.swatch.glintColor);
          ctx.setTransform(0, dpr, -dpr, 0, p.x * dpr, p.y * dpr);
          this.drawDiffractionNeedle(ctx, gLen * 0.85, 1.2, sparkAlpha * 0.88, '#FFFDF5');
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }

    ctx.restore();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private traceAtomicStar4(
    ctx: CanvasRenderingContext2D,
    outerR: number,
    innerR: number,
  ): void {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = (i & 1) === 0 ? outerR : innerR;
      const px = ATOMIC_STAR4_COS[i] * r;
      const py = ATOMIC_STAR4_SIN[i] * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  private traceFivePointStar(
    ctx: CanvasRenderingContext2D,
    outerR: number,
    innerR: number,
  ): void {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = (i & 1) === 0 ? outerR : innerR;
      const px = STAR5_COS[i] * r;
      const py = STAR5_SIN[i] * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  // ---- Layer 3: Optical Starburst Rings & Sparkle Motes ----

  private renderSparklesLayer(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const sp of this.sparkles) {
      const u = clamp(sp.age / sp.maxAge, 0, 1);

      if (sp.kind === 'RING') {
        const radius = sp.size + (sp.endSize - sp.size) * easeOutQuart(u);
        const alpha = (1 - u) * (1 - u) * 0.82;
        if (alpha <= 0.01) continue;

        ctx.strokeStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(1.2, 4.2 * (1 - u));
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner crisp tungsten ring echo
        if (u < 0.72) {
          ctx.strokeStyle = '#FFF7D6';
          ctx.globalAlpha = alpha * 0.55;
          ctx.lineWidth = Math.max(0.9, 2.0 * (1 - u));
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, radius * 0.74, 0, Math.PI * 2);
          ctx.stroke();
        }
        continue;
      }

      // 4-Point Atomic Optical Sparkle Mote
      const popIn = clamp(u / 0.18, 0, 1);
      const fadeOut = 1 - u;
      const scale = popIn * (0.4 + 0.6 * fadeOut);
      const alpha = popIn * fadeOut * 0.95;
      if (alpha <= 0.02) continue;

      ctx.save();
      ctx.translate(sp.x, sp.y);
      ctx.rotate(sp.angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = sp.color;
      this.traceAtomicStar4(ctx, sp.size * scale, sp.size * scale * 0.22);
      ctx.fill();

      // Bright pinpoint white-cream center
      ctx.fillStyle = '#FFFDF5';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.1, sp.size * scale * 0.2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // ---- Layer 4: Bold Extruded Caprasimo / Michroma Kinetic Score Popups ----

  private computePopupFontSizes(
    headline: string,
    subline: string,
  ): { headlinePx: number; sublinePx: number } {
    const baseScale = clamp(Math.min(this.viewportW, this.viewportH * 1.05) / 420, 0.84, 1.36);
    let headlinePx = Math.round(38 * baseScale);
    let sublinePx = Math.max(13, Math.round(13.5 * baseScale));
    // Reserve headroom for the 1.22x spring overshoot peak + bold 3D outline extrusion
    const springFactor = this.reducedMotion ? 1.05 : 1.23;
    const maxAllowedW = Math.max(170, (this.viewportW - 44) / springFactor);

    // Gently fit wide headlines & sublines inside narrow 360px phones (zero clipping even at peak bounce!)
    if (this.ctx) {
      this.ctx.font = `400 ${headlinePx}px ${HEADLINE_FONT_STACK}`;
      const measuredHeadW = this.ctx.measureText(headline).width + headlinePx * 0.28;
      if (measuredHeadW > maxAllowedW) {
        headlinePx = Math.max(18, Math.floor(headlinePx * (maxAllowedW / measuredHeadW)));
      }

      if (subline) {
        this.ctx.font = `700 ${sublinePx}px ${SUBLINE_FONT_STACK}`;
        const measuredSubW = this.ctx.measureText(subline).width + 16;
        const maxSubW = Math.max(165, (this.viewportW - 52) / springFactor);
        if (measuredSubW > maxSubW) {
          sublinePx = Math.max(11, Number((sublinePx * (maxSubW / measuredSubW)).toFixed(1)));
        }
      }
    } else if (headline.length > 14 && this.viewportW < 420) {
      headlinePx = Math.max(20, Math.round(headlinePx * 0.72));
    }

    return { headlinePx, sublinePx };
  }

  private estimateTextHalfWidth(
    text: string,
    fontPx: number,
    fontStack: string,
    weight: string,
  ): number {
    if (this.ctx) {
      this.ctx.save();
      this.ctx.font = `${weight} ${fontPx}px ${fontStack}`;
      const w = this.ctx.measureText(text).width;
      this.ctx.restore();
      return w * 0.5 + 14;
    }
    return text.length * fontPx * 0.31 + 14;
  }

  private splitEmojiSegments(text: string): PopupTextSegment[] {
    // Isolate extended-pictographic emoji (e.g. 🔒, 🎭, ❓, 🔥, 🏆) so color glyphs
    // get a single crisp broadcast shadow rather than smeared 5-step cel duplicates.
    // Text symbols like ★ (U+2605) remain styled with full 3D extruded metallic fill!
    const regex = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;
    const parts: PopupTextSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          isColorEmoji: false,
        });
      }
      parts.push({ text: match[0], isColorEmoji: true });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex), isColorEmoji: false });
    }
    return parts.length > 0 ? parts : [{ text, isColorEmoji: false }];
  }

  private ensurePopupMetrics(pop: FloatingScorePop): void {
    if (pop.cachedViewportW === this.viewportW && pop.cachedSegWidths.length > 0) {
      return;
    }
    const { headlinePx, sublinePx } = this.computePopupFontSizes(
      pop.headline,
      pop.subline,
    );
    pop.cachedViewportW = this.viewportW;
    pop.cachedHeadlinePx = headlinePx;
    pop.cachedSublinePx = sublinePx;

    if (this.ctx) {
      this.ctx.save();
      this.ctx.font = `400 ${headlinePx}px ${HEADLINE_FONT_STACK}`;
      const widths = pop.cachedSegments.map((seg) => this.ctx!.measureText(seg.text).width);
      pop.cachedSegWidths = widths;
      pop.cachedTotalHeadW = widths.reduce((acc, w) => acc + w, 0);

      if (pop.subline) {
        this.ctx.font = `700 ${sublinePx}px ${SUBLINE_FONT_STACK}`;
        pop.cachedSubMeasure = this.ctx.measureText(pop.subline).width;
      } else {
        pop.cachedSubMeasure = 0;
      }
      this.ctx.restore();
    } else {
      const widths = pop.cachedSegments.map((seg) => seg.text.length * headlinePx * 0.6);
      pop.cachedSegWidths = widths;
      pop.cachedTotalHeadW = widths.reduce((acc, w) => acc + w, 0);
      pop.cachedSubMeasure = pop.subline ? pop.subline.length * sublinePx * 0.62 : 0;
    }
  }

  private renderScorePopsLayer(ctx: CanvasRenderingContext2D): void {
    const fastMobileGlow = this.isCompactMobilePortrait() || this.mobileBudgetThrottled;
    ctx.save();

    for (const pop of this.scorePops) {
      const spec = SCORE_TONE_SPECS[pop.tone] ?? SCORE_TONE_SPECS.GOLD;
      const t = pop.age;
      const life = clamp(t / pop.maxAge, 0, 1);

      // Underdamped harmonic spring overshoot (0.18 -> 1.23 -> 0.96 -> 1.00)
      let scale: number;
      let rotRad: number;
      if (this.reducedMotion) {
        scale = 0.9 + 0.1 * easeOutCubic(clamp(t / 0.22, 0, 1));
        rotRad = 0;
      } else {
        const springEnv = Math.exp(-8.8 * t);
        const springScale =
          1 + springEnv * (-0.82 * Math.cos(19.2 * t) + 0.36 * Math.sin(19.2 * t));
        // Gentle buoyant lift-off scale in final dissolve
        const exitLift = life > 0.74 ? 1 + ((life - 0.74) / 0.26) * 0.08 : 1;
        scale = Math.max(0.15, springScale * exitLift);
        rotRad =
          pop.tiltDir *
          0.088 *
          Math.exp(-7.4 * t) *
          Math.cos(14.8 * t);
      }

      const fadeIn = clamp(t / 0.09, 0, 1);
      const fadeOut = life > 0.72 ? clamp(1 - (life - 0.72) / 0.28, 0, 1) : 1;
      const alpha = fadeIn * fadeOut;
      if (alpha <= 0.015) continue;

      this.ensurePopupMetrics(pop);
      const headlinePx = pop.cachedHeadlinePx;
      const sublinePx = pop.cachedSublinePx;
      const segments = pop.cachedSegments;
      const segWidths = pop.cachedSegWidths;
      const totalHeadW = pop.cachedTotalHeadW;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(pop.x, pop.y);
      ctx.rotate(rotRad);
      ctx.scale(scale, scale);

      // 1. Radiant 1966 Atomic Starburst Light Halo (ZERO rectangular boxes!)
      this.renderOpticalStarburstBehindText(ctx, pop, spec, headlinePx);

      // 2. Bold Extruded 3D Caprasimo Broadcast Headline (cached emoji-safe segments)
      ctx.font = `400 ${headlinePx}px ${HEADLINE_FONT_STACK}`;
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;

      const halfH = headlinePx * 0.52;
      const textGrad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      textGrad.addColorStop(0, spec.gradTop);
      textGrad.addColorStop(0.48, spec.gradMid);
      textGrad.addColorStop(1, spec.gradBot);

      let gleamGrad: CanvasGradient | null = null;
      if (!this.reducedMotion && t >= 0.10 && t <= 0.62) {
        const sweepU = (t - 0.10) / 0.52;
        const sweepSpan = Math.max(80, totalHeadW * 0.68);
        const sx = -sweepSpan + sweepU * (sweepSpan * 2);
        gleamGrad = ctx.createLinearGradient(sx - 44, -halfH, sx + 44, halfH);
        gleamGrad.addColorStop(0, 'rgba(255, 253, 240, 0)');
        gleamGrad.addColorStop(0.45, 'rgba(255, 253, 240, 0.72)');
        gleamGrad.addColorStop(0.55, 'rgba(255, 253, 240, 0.72)');
        gleamGrad.addColorStop(1, 'rgba(255, 253, 240, 0)');
      }

      ctx.textAlign = 'left';
      let cursorX = -totalHeadW * 0.5;
      const extrudeSteps = fastMobileGlow ? 4 : 5;
      const stepX = Math.max(0.85, headlinePx * 0.024);
      const stepY = Math.max(1.1, headlinePx * 0.032);

      for (let idx = 0; idx < segments.length; idx++) {
        const seg = segments[idx];
        const segW = segWidths[idx];

        if (seg.isColorEmoji) {
          // Single crisp cel-shadowed render so color glyphs never smear
          ctx.save();
          ctx.shadowColor = spec.extrude;
          ctx.shadowOffsetX = stepX * 3.2;
          ctx.shadowOffsetY = stepY * 3.2;
          ctx.shadowBlur = 0;
          ctx.fillText(seg.text, cursorX, 0);
          ctx.restore();
        } else {
          // Broadcast optical glow behind text (zero-blur fast halo on mobile portrait!)
          if (fastMobileGlow) {
            ctx.strokeStyle = spec.glowRgba;
            ctx.lineWidth = Math.max(11, headlinePx * 0.34);
            ctx.strokeText(seg.text, cursorX + stepX * 1.5, stepY * 1.5);
          } else {
            ctx.save();
            ctx.shadowColor = spec.glowRgba;
            ctx.shadowBlur = Math.round(headlinePx * 0.55);
            ctx.fillStyle = spec.outline;
            ctx.fillText(seg.text, cursorX, 0);
            ctx.restore();
          }

          // Stepped solid 3D mid-century cel extrusion
          ctx.lineWidth = Math.max(5.5, headlinePx * 0.175);
          for (let s = extrudeSteps; s >= 1; s--) {
            ctx.strokeStyle = s === 1 ? spec.extrudeRim : spec.extrude;
            ctx.fillStyle = s === 1 ? spec.extrudeRim : spec.extrude;
            ctx.strokeText(seg.text, cursorX + stepX * s, stepY * s);
            ctx.fillText(seg.text, cursorX + stepX * s, stepY * s);
          }

          // Crisp heavy Kodalith broadcast outline for >12:1 contrast on any backdrop
          ctx.strokeStyle = spec.outline;
          ctx.lineWidth = Math.max(5.2, headlinePx * 0.165);
          ctx.strokeText(seg.text, cursorX, 0);

          // Vibrant vertical metallic Living Color gradient fill
          ctx.fillStyle = textGrad;
          ctx.fillText(seg.text, cursorX, 0);

          // Animated diagonal metallic specular sheen sweeping across the headline face
          if (gleamGrad) {
            ctx.fillStyle = gleamGrad;
            ctx.fillText(seg.text, cursorX, 0);
          }
        }

        cursorX += segW;
      }

      // 3. Crisp Tracked Michroma Broadcast Subline + Tapered Speed-Rules (No Box!)
      if (pop.subline) {
        const subY = headlinePx * 0.74;
        ctx.textAlign = 'center';
        ctx.font = `700 ${sublinePx}px ${SUBLINE_FONT_STACK}`;
        const subMeasure = pop.cachedSubMeasure;

        // Subtle tapered horizontal broadcast speed-rules flanking the subline
        const ruleReveal = easeOutCubic(clamp(t / 0.24, 0, 1));
        const ruleGap = subMeasure * 0.5 + 10;
        const ruleLen = clamp(this.viewportW * 0.08, 18, 38) * ruleReveal;
        if (ruleLen > 3 && ruleGap + ruleLen < this.viewportW * 0.48) {
          this.drawTaperedSpeedRule(ctx, -ruleGap - ruleLen, -ruleGap, subY, spec.gradMid);
          this.drawTaperedSpeedRule(ctx, ruleGap, ruleGap + ruleLen, subY, spec.gradMid);
        }

        // Subline broadcast drop shadow + outline + warm cream fill
        ctx.lineWidth = Math.max(4.0, sublinePx * 0.34);
        ctx.strokeStyle = spec.outline;
        ctx.strokeText(pop.subline, 1.2, subY + 1.8);
        ctx.strokeText(pop.subline, 0, subY);

        ctx.fillStyle = spec.sublineFill;
        ctx.fillText(pop.subline, 0, subY);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private renderOpticalStarburstBehindText(
    ctx: CanvasRenderingContext2D,
    pop: FloatingScorePop,
    spec: ScoreToneSpec,
    headlinePx: number,
  ): void {
    const burstU = clamp(pop.age / 0.72, 0, 1);
    if (burstU >= 1) return;

    const burstAlpha = (1 - burstU) * (1 - burstU) * 0.92;
    const expand = 0.45 + 0.72 * easeOutQuart(burstU);
    const outerLen = headlinePx * (pop.tone === 'JACKPOT' ? 2.45 : 1.9) * expand;
    const innerR = headlinePx * 0.28 * expand;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = burstAlpha;

    // Soft warm studio radial back-glow
    const glowR = outerLen * 0.92;
    const radial = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
    radial.addColorStop(0, spec.glowRgba);
    radial.addColorStop(0.55, 'rgba(255, 213, 107, 0.08)');
    radial.addColorStop(1, 'rgba(255, 213, 107, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Alternating long/short 1966 geometric starburst darts
    ctx.rotate(pop.starburstAngle);
    const rays = spec.rayCount;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      const isMajor = i % 2 === 0;
      const rTip = isMajor ? outerLen : outerLen * 0.64;
      const halfSpread = isMajor ? 0.085 : 0.055;

      ctx.fillStyle = isMajor ? spec.rayPrimary : spec.raySecondary;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * rTip, Math.sin(a) * rTip);
      ctx.lineTo(
        Math.cos(a - halfSpread) * innerR,
        Math.sin(a - halfSpread) * innerR,
      );
      ctx.lineTo(
        Math.cos(a + halfSpread) * innerR,
        Math.sin(a + halfSpread) * innerR,
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawTaperedSpeedRule(
    ctx: CanvasRenderingContext2D,
    xStart: number,
    xEnd: number,
    y: number,
    color: string,
  ): void {
    const isLeft = xEnd < 0;
    const innerX = isLeft ? xEnd : xStart;
    const outerX = isLeft ? xStart : xEnd;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(outerX, y);
    ctx.lineTo(innerX, y - 1.6);
    ctx.lineTo(innerX, y + 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
