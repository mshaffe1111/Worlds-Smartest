// ============================================================================
// WORLD'S SMARTEST v5.0 — High-Z-Index Theatrical Stage VFX Engine
// Renders above the board & stage UI (`#vfx-canvas`, fixed, z-index: 65) at
// locked 60fps (DPR <= 2, prefers-reduced-motion aware) with zero pointer lock.
// Implements `StageVfxApiV5` from `src/v5/contracts_v5.ts`.
// ============================================================================

import type { WedgeColorId } from '../v4/contracts';
import type {
  ShatterArcTargetV5,
  StageVfxApiV5,
  TierNumberV5,
} from './contracts_v5';

export type StageMoodIntensityV5 = 'calm' | 'board' | 'hotseat' | 'jackpot';

export interface StageVfxDiagnosticsV5 {
  readonly mounted: boolean;
  readonly reducedMotion: boolean;
  readonly tier: TierNumberV5;
  readonly intensity: StageMoodIntensityV5;
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  readonly activeParticles: number;
  readonly activeEffects: number;
}

interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

interface TierMoodSpec {
  readonly primary: RgbColor;
  readonly secondary: RgbColor;
  readonly mote: RgbColor;
  readonly beamCount: number;
  readonly baseMotes: number;
  readonly sweepRate: number;
}

interface WedgeCrystalPalette {
  readonly core: string;
  readonly mid: string;
  readonly deep: string;
  readonly prism: string;
  readonly spriteKey: GlowSpriteKey;
}

type GlowSpriteKey =
  | 'whiteHot'
  | 'gold'
  | 'amber'
  | 'crimson'
  | 'emerald'
  | 'sapphire'
  | 'magenta'
  | 'orange'
  | 'violet'
  | 'dustMote';

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  warmth: number; // 0 = tier mote tint, 1 = pure warm gold
}

interface StageBeam {
  anchorNormX: number;
  baseAngle: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  widthScale: number;
  isSecondary: boolean;
}

interface LightningVertex {
  x: number;
  y: number;
}

interface ChainArcEffect {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  delay: number;
  elapsed: number;
  travelDur: number;
  duration: number;
  impactFired: boolean;
  reseedTimer: number;
  mainBolt: LightningVertex[];
  branchBolt: LightningVertex[];
}

interface MetallicDebris {
  kind: 'chain_link' | 'shackle' | 'padlock_left' | 'padlock_right';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  tumble: number;
  vTumble: number;
  scale: number;
  age: number;
  life: number;
  isHotFracture: boolean;
}

interface SparkParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  size: number;
  age: number;
  life: number;
  mode: 'hot_metal' | 'crimson_amber' | 'prism_star' | 'gold_glint';
  colorHex: string;
  coreHex: string;
  twinklePhase: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  delay: number;
  age: number;
  life: number;
  startR: number;
  endR: number;
  lineWidth: number;
  color: string;
  innerColor?: string;
  style: 'flash' | 'brass_notched' | 'crimson' | 'jewel';
}

interface RadialFlare {
  x: number;
  y: number;
  age: number;
  life: number;
  maxRadius: number;
  spriteKey: GlowSpriteKey;
  intensity: number;
}

interface ScrewSpotlightEffect {
  targetX: number;
  targetY: number;
  byPlayer: boolean;
  age: number;
  life: number;
  primaryHex: string;
  accentHex: string;
}

interface KineticStampEffect {
  x: number;
  y: number;
  title: string;
  subtitle: string;
  byPlayer: boolean;
  age: number;
  life: number;
  tiltRad: number;
}

interface WedgeCometEffect {
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  destX: number;
  destY: number;
  wedge: WedgeColorId;
  palette: WedgeCrystalPalette;
  age: number;
  duration: number;
  spin: number;
  sparkAccum: number;
  trail: Array<{ x: number; y: number }>;
  arrived: boolean;
}

interface JackpotSweepEffect {
  headline: string;
  pointsText: string;
  age: number;
  duration: number;
}

interface FoilConfetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  angle: number;
  vAngle: number;
  tilt: number;
  vTilt: number;
  swayPhase: number;
  swayFreq: number;
  swayAmp: number;
  terminalVy: number;
  age: number;
  life: number;
  baseHex: string;
  lightHex: string;
  darkHex: string;
  shape: 'ribbon' | 'foil_rect' | 'diamond';
}

interface ConfettiEmitter {
  remainingSec: number;
  spawnAccum: number;
  ratePerSec: number;
}

// ============================================================================
// PALETTES & TUNING CONSTANTS
// ============================================================================

const TIER_MOOD_SPECS: Readonly<Record<TierNumberV5, TierMoodSpec>> = {
  1: {
    primary: { r: 255, g: 204, b: 112 },
    secondary: { r: 238, g: 146, b: 68 },
    mote: { r: 255, g: 224, b: 152 },
    beamCount: 2,
    baseMotes: 18,
    sweepRate: 0.22,
  },
  2: {
    primary: { r: 248, g: 199, b: 94 },
    secondary: { r: 232, g: 102, b: 142 },
    mote: { r: 255, g: 222, b: 158 },
    beamCount: 3,
    baseMotes: 22,
    sweepRate: 0.27,
  },
  3: {
    primary: { r: 86, g: 186, b: 255 },
    secondary: { r: 245, g: 200, b: 96 },
    mote: { r: 226, g: 238, b: 255 },
    beamCount: 3,
    baseMotes: 24,
    sweepRate: 0.32,
  },
  4: {
    primary: { r: 255, g: 212, b: 102 },
    secondary: { r: 92, g: 164, b: 255 },
    mote: { r: 255, g: 232, b: 170 },
    beamCount: 4,
    baseMotes: 28,
    sweepRate: 0.36,
  },
  5: {
    primary: { r: 250, g: 216, b: 124 },
    secondary: { r: 64, g: 222, b: 164 },
    mote: { r: 255, g: 236, b: 182 },
    beamCount: 4,
    baseMotes: 30,
    sweepRate: 0.38,
  },
  6: {
    primary: { r: 78, g: 222, b: 255 },
    secondary: { r: 244, g: 112, b: 182 },
    mote: { r: 232, g: 246, b: 255 },
    beamCount: 5,
    baseMotes: 34,
    sweepRate: 0.44,
  },
  7: {
    primary: { r: 255, g: 192, b: 82 },
    secondary: { r: 82, g: 146, b: 255 },
    mote: { r: 255, g: 224, b: 154 },
    beamCount: 5,
    baseMotes: 36,
    sweepRate: 0.46,
  },
  8: {
    primary: { r: 255, g: 224, b: 122 },
    secondary: { r: 94, g: 178, b: 255 },
    mote: { r: 255, g: 244, b: 198 },
    beamCount: 6,
    baseMotes: 42,
    sweepRate: 0.54,
  },
};

const INTENSITY_MODIFIERS: Readonly<
  Record<
    StageMoodIntensityV5,
    {
      readonly beamAlpha: number;
      readonly moteScale: number;
      readonly moteAlpha: number;
      readonly speedMult: number;
      readonly beamLength: number;
    }
  >
> = {
  calm: {
    beamAlpha: 0.052,
    moteScale: 0.72,
    moteAlpha: 0.38,
    speedMult: 0.55,
    beamLength: 0.46,
  },
  board: {
    beamAlpha: 0.078,
    moteScale: 1.0,
    moteAlpha: 0.5,
    speedMult: 0.9,
    beamLength: 0.56,
  },
  hotseat: {
    beamAlpha: 0.098,
    moteScale: 1.15,
    moteAlpha: 0.58,
    speedMult: 1.25,
    beamLength: 0.64,
  },
  jackpot: {
    beamAlpha: 0.135,
    moteScale: 1.4,
    moteAlpha: 0.74,
    speedMult: 1.7,
    beamLength: 0.74,
  },
};

const WEDGE_CRYSTAL_PALETTES: Readonly<Record<WedgeColorId, WedgeCrystalPalette>> = {
  GOLD_HISTORY: {
    core: '#fffbe0',
    mid: '#f6c44c',
    deep: '#9e6508',
    prism: '#ffe38c',
    spriteKey: 'gold',
  },
  SAPPHIRE_GEO: {
    core: '#e3f6ff',
    mid: '#46a8ff',
    deep: '#0c4899',
    prism: '#93d5ff',
    spriteKey: 'sapphire',
  },
  EMERALD_SCIENCE: {
    core: '#e0fff0',
    mid: '#34d993',
    deep: '#0a6d45',
    prism: '#82f5c5',
    spriteKey: 'emerald',
  },
  MAGENTA_POP: {
    core: '#ffe6f0',
    mid: '#f26498',
    deep: '#8e1244',
    prism: '#ffa3c6',
    spriteKey: 'magenta',
  },
  ORANGE_SPORTS: {
    core: '#fff1db',
    mid: '#ff9347',
    deep: '#a63c08',
    prism: '#ffc48a',
    spriteKey: 'orange',
  },
  VIOLET_ARTS: {
    core: '#f3e6ff',
    mid: '#b47cff',
    deep: '#531f9e',
    prism: '#d7b5ff',
    spriteKey: 'violet',
  },
};

const CONFETTI_FOIL_PALETTE: ReadonlyArray<{
  readonly base: string;
  readonly light: string;
  readonly dark: string;
  readonly weight: number;
}> = [
  // Rich burnished & bright broadcast gold (primary hero foil)
  { base: '#f7c443', light: '#fff6c4', dark: '#a66d0c', weight: 0.27 },
  { base: '#ffd95e', light: '#fffbe0', dark: '#bd8317', weight: 0.17 },
  // Royal broadcast emerald foil
  { base: '#1fd689', light: '#9effd3', dark: '#0b7045', weight: 0.25 },
  // Prime-time broadcast sapphire foil
  { base: '#3399ff', light: '#b3deff', dark: '#0f4aa3', weight: 0.25 },
  // Warm champagne pearl & rose-gold accent glints
  { base: '#ffe7b3', light: '#ffffff', dark: '#c79e54', weight: 0.04 },
  { base: '#f0527d', light: '#ffc2d4', dark: '#8c173d', weight: 0.02 },
];

const GOLD_RIBBON_PALETTE: ReadonlyArray<{
  readonly base: string;
  readonly light: string;
  readonly dark: string;
}> = [
  { base: '#f7c548', light: '#fff8d1', dark: '#9e6508' },
  { base: '#ffda6b', light: '#ffffff', dark: '#b87d14' },
  { base: '#f0a629', light: '#ffeba8', dark: '#8a4c05' },
  { base: '#ffe999', light: '#ffffff', dark: '#b38524' },
];

const MAX_SPARKS = 340;
const MAX_DEBRIS = 96;
const MAX_CONFETTI = 260;
const MAX_ARCS = 24;
const MAX_SHOCKWAVES = 20;
const MAX_FLARES = 24;
const MAX_COMETS = 12;
const MAX_STAMPS = 6;
const MAX_SPOTLIGHTS = 6;
const MAX_JACKPOTS = 3;

const DISPLAY_FONT_STACK = '"Cinzel", Georgia, "Times New Roman", serif';
const UI_FONT_STACK = '"Inter", system-ui, -apple-system, sans-serif';

// ============================================================================
// UTILITY MATH & EASING HELPERS
// ============================================================================

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function easeOutCubic(t: number): number {
  const u = 1 - clamp(t, 0, 1);
  return 1 - u * u * u;
}

function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutBack(t: number, overshoot = 1.70158): number {
  const x = clamp(t, 0, 1) - 1;
  return 1 + (overshoot + 1) * x * x * x + overshoot * x * x;
}

function finiteOr(val: number, fallback: number): number {
  return Number.isFinite(val) ? val : fallback;
}

function rgbaStr(c: RgbColor, alpha: number): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${clamp(alpha, 0, 1).toFixed(4)})`;
}

function buildJaggedBolt(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  segments: number,
  jitterPx: number,
): LightningVertex[] {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;

  const verts: LightningVertex[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    let bx = x0 + dx * t;
    let by = y0 + dy * t;
    if (i > 0 && i < segments) {
      const env = Math.sin(t * Math.PI);
      const offset = randRange(-jitterPx, jitterPx) * env;
      bx += nx * offset;
      by += ny * offset;
    }
    verts.push({ x: bx, y: by });
  }
  return verts;
}

function pickWeightedConfettiColor(): { base: string; light: string; dark: string } {
  let r = Math.random();
  for (let i = 0; i < CONFETTI_FOIL_PALETTE.length; i++) {
    const entry = CONFETTI_FOIL_PALETTE[i];
    r -= entry.weight;
    if (r <= 0) {
      return entry;
    }
  }
  return CONFETTI_FOIL_PALETTE[0];
}

function makeGlowSprite(
  innerRgba: string,
  midRgba: string,
  outerRgba: string,
  size = 64,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const gctx = off.getContext('2d');
  if (!gctx) return null;
  const half = size * 0.5;
  const grad = gctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, innerRgba);
  grad.addColorStop(0.28, midRgba);
  grad.addColorStop(0.65, outerRgba);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, size, size);
  return off;
}

/**
 * Pre-bakes a silky per-pixel analytical volumetric theater spotlight cone
 * using C2-continuous lateral falloff `(1 - u^2)^3` and smooth longitudinal
 * attenuation — zero polygon edges and zero scanline banding!
 */
function makeVolumetricBeamSprite(
  rgb: RgbColor,
  coreRgb: RgbColor,
  width = 128,
  height = 256,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const bctx = off.getContext('2d');
  if (!bctx) return null;

  const img = bctx.createImageData(width, height);
  const data = img.data;
  const halfW = width * 0.5;
  const invHalfW = 1 / halfW;
  const invMaxY = 1 / Math.max(1, height - 1);

  for (let py = 0; py < height; py++) {
    const ty = py * invMaxY;
    const coneRadius = lerp(0.11, 0.96, Math.pow(ty, 0.88));
    const invCone = 1 / coneRadius;
    const entry = ty < 0.05 ? ty / 0.05 : 1;
    const tail = Math.pow(1 - ty, 1.5);
    const longFade = entry * tail;
    const rowOffset = py * width * 4;

    for (let px = 0; px < width; px++) {
      const nx = (px + 0.5 - halfW) * invHalfW;
      const u = Math.abs(nx) * invCone;
      if (u >= 1) continue;

      const s = 1 - u * u;
      const lateral = s * s * s;
      const alpha = longFade * lateral;
      if (alpha <= 0.001) continue;

      const coreBase = Math.max(0, 1 - u * 1.65);
      const coreMix = coreBase * coreBase;
      const idx = rowOffset + px * 4;
      data[idx] = Math.round(lerp(rgb.r, coreRgb.r, coreMix));
      data[idx + 1] = Math.round(lerp(rgb.g, coreRgb.g, coreMix));
      data[idx + 2] = Math.round(lerp(rgb.b, coreRgb.b, coreMix));
      data[idx + 3] = clamp(Math.round(alpha * 255), 0, 255);
    }
  }

  bctx.putImageData(img, 0, 0);
  return off;
}

function traceRoundedStadium(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const hw = w * 0.5;
  const hh = h * 0.5;
  const r = Math.min(hw, hh);
  ctx.beginPath();
  ctx.moveTo(-hw + r, -hh);
  ctx.lineTo(hw - r, -hh);
  ctx.arc(hw - r, 0, r, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.lineTo(-hw + r, hh);
  ctx.arc(-hw + r, 0, r, Math.PI * 0.5, Math.PI * 1.5);
  ctx.closePath();
}

function traceOctagonBadge(
  ctx: CanvasRenderingContext2D,
  hw: number,
  hh: number,
  chamfer: number,
): void {
  const c = Math.min(chamfer, hw * 0.45, hh * 0.48);
  ctx.beginPath();
  ctx.moveTo(-hw + c, -hh);
  ctx.lineTo(hw - c, -hh);
  ctx.lineTo(hw, -hh + c);
  ctx.lineTo(hw, hh - c);
  ctx.lineTo(hw - c, hh);
  ctx.lineTo(-hw + c, hh);
  ctx.lineTo(-hw, hh - c);
  ctx.lineTo(-hw, -hh + c);
  ctx.closePath();
}

function traceFourPointStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ============================================================================
// MAIN ENGINE: StageVfxCanvasV5
// ============================================================================

export class StageVfxCanvasV5 implements StageVfxApiV5 {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private mounted = false;

  private width = 1280;
  private height = 800;
  private dpr = 1;

  private rafId: number | null = null;
  private lastFrameMs = 0;
  private clockSec = 0;
  private pageHidden = false;

  private reducedMotion = false;
  private reducedMotionQuery: MediaQueryList | null = null;

  // Mood state (smoothly interpolated on transition)
  private tier: TierNumberV5 = 1;
  private intensity: StageMoodIntensityV5 = 'board';
  private curPrimary: RgbColor = { ...TIER_MOOD_SPECS[1].primary };
  private curSecondary: RgbColor = { ...TIER_MOOD_SPECS[1].secondary };
  private curMote: RgbColor = { ...TIER_MOOD_SPECS[1].mote };
  private curBeamAlpha = INTENSITY_MODIFIERS.board.beamAlpha;
  private curMoteAlpha = INTENSITY_MODIFIERS.board.moteAlpha;
  private curSpeedMult = INTENSITY_MODIFIERS.board.speedMult;
  private curBeamLength = INTENSITY_MODIFIERS.board.beamLength;

  // Ambient stage elements
  private motes: DustMote[] = [];
  private beams: StageBeam[] = [];

  // Active theatrical VFX pools
  private arcs: ChainArcEffect[] = [];
  private debris: MetallicDebris[] = [];
  private sparks: SparkParticle[] = [];
  private shockwaves: ShockwaveRing[] = [];
  private flares: RadialFlare[] = [];
  private screwSpotlights: ScrewSpotlightEffect[] = [];
  private stamps: KineticStampEffect[] = [];
  private comets: WedgeCometEffect[] = [];
  private jackpots: JackpotSweepEffect[] = [];
  private confetti: FoilConfetti[] = [];
  private emitters: ConfettiEmitter[] = [];

  // Pre-baked additive glow & feathered volumetric spotlight sprites
  private sprites: Partial<Record<GlowSpriteKey, HTMLCanvasElement>> = {};
  private beamSprites: Map<string, HTMLCanvasElement> = new Map();

  // Bound listeners
  private readonly handleResizeBound: () => void;
  private readonly handleVisibilityBound: () => void;
  private readonly handleMotionChangeBound: (ev: MediaQueryListEvent) => void;
  private readonly tickBound: (nowMs: number) => void;

  constructor() {
    this.handleResizeBound = () => this.syncViewportSize();
    this.handleVisibilityBound = () => this.onVisibilityChange();
    this.handleMotionChangeBound = (ev: MediaQueryListEvent) => {
      this.reducedMotion = ev.matches;
      this.rebalanceAmbientEntities();
      this.ensureLoopRunning();
    };
    this.tickBound = (nowMs: number) => this.tick(nowMs);
  }

  // --------------------------------------------------------------------------
  // LIFECYCLE
  // --------------------------------------------------------------------------

  public mount(canvas: HTMLCanvasElement): void {
    if (this.mounted && this.canvas !== canvas) {
      this.dispose();
    }

    this.canvas = canvas;
    this.enforceOverlayStyles(canvas);

    // IMPORTANT: Never pass `desynchronized: true` here! On Android Chrome / mobile GPUs,
    // `desynchronized: true` promotes a fullscreen z-index:65 canvas to a direct-scanout
    // hardware overlay plane whose clearRect() scans out as OPAQUE BLACK over #ui-root!
    this.ctx =
      canvas.getContext('2d', { alpha: true }) ??
      canvas.getContext('2d');

    if (!this.ctx) {
      this.mounted = false;
      return;
    }

    if (!this.mounted) {
      this.bindSystemListeners();
      this.buildGlowSpriteBank();
    }

    this.mounted = true;
    this.pageHidden =
      typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false;
    this.syncViewportSize();
    this.snapMoodToTarget();
    this.rebalanceAmbientEntities();
    this.lastFrameMs = typeof performance !== 'undefined' ? performance.now() : 0;
    this.ensureLoopRunning();
  }

  public dispose(): void {
    if (this.rafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.unbindSystemListeners();

    if (this.ctx && this.canvas) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.arcs = [];
    this.debris = [];
    this.sparks = [];
    this.shockwaves = [];
    this.flares = [];
    this.screwSpotlights = [];
    this.stamps = [];
    this.comets = [];
    this.jackpots = [];
    this.confetti = [];
    this.emitters = [];
    this.motes = [];
    this.beams = [];
    this.sprites = {};
    this.beamSprites.clear();

    this.ctx = null;
    this.canvas = null;
    this.mounted = false;
  }

  public getDiagnostics(): StageVfxDiagnosticsV5 {
    this.refreshReducedMotion();
    return {
      mounted: this.mounted,
      reducedMotion: this.reducedMotion,
      tier: this.tier,
      intensity: this.intensity,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      activeParticles: this.sparks.length + this.debris.length + this.confetti.length,
      activeEffects:
        this.arcs.length +
        this.shockwaves.length +
        this.flares.length +
        this.screwSpotlights.length +
        this.stamps.length +
        this.comets.length +
        this.jackpots.length +
        this.emitters.length,
    };
  }

  // --------------------------------------------------------------------------
  // PUBLIC StageVfxApiV5 METHODS
  // --------------------------------------------------------------------------

  public setStageMood(
    tier: TierNumberV5,
    intensity: StageMoodIntensityV5,
  ): void {
    this.refreshReducedMotion();
    const safeTier = clamp(Math.round(tier), 1, 8) as TierNumberV5;
    this.tier = safeTier;
    this.intensity = intensity;
    if (this.mounted) {
      this.rebalanceAmbientEntities();
      this.ensureLoopRunning();
    }
  }

  public fireChainShatter(
    originX: number,
    originY: number,
    unlockedTargets: readonly ShatterArcTargetV5[],
  ): void {
    if (!this.mounted) return;
    this.refreshReducedMotion();
    const ox = finiteOr(originX, this.width * 0.5);
    const oy = finiteOr(originY, this.height * 0.5);

    const targets: ShatterArcTargetV5[] =
      unlockedTargets.length > 0
        ? unlockedTargets.map((t) => ({
            xPx: finiteOr(t.xPx, ox),
            yPx: finiteOr(t.yPx, oy),
          }))
        : [{ xPx: ox, yPx: oy }];

    // Origin charge flash, shockwave & immediate hot spark kick on frame 0
    this.pushFlare({
      x: ox,
      y: oy,
      age: 0,
      life: 0.34,
      maxRadius: this.reducedMotion ? 56 : 92,
      spriteKey: 'whiteHot',
      intensity: 0.95,
    });
    this.pushShockwave({
      x: ox,
      y: oy,
      delay: 0,
      age: 0,
      life: 0.36,
      startR: 8,
      endR: this.reducedMotion ? 44 : 68,
      lineWidth: 2.6,
      color: 'rgba(255, 224, 128, 0.9)',
      style: 'flash',
    });

    const originSparks = this.reducedMotion ? 6 : 16;
    for (let s = 0; s < originSparks; s++) {
      const ang = randRange(0, Math.PI * 2);
      const spd = this.reducedMotion ? randRange(45, 95) : randRange(95, 290);
      this.pushSpark({
        x: ox + randRange(-6, 6),
        y: oy + randRange(-6, 6),
        prevX: ox,
        prevY: oy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - randRange(40, 120),
        gravity: 560,
        drag: 0.96,
        size: randRange(1.4, 2.8),
        age: 0,
        life: randRange(0.28, 0.54),
        mode: 'hot_metal',
        colorHex: '#ffbe3d',
        coreHex: '#fffef2',
        twinklePhase: 0,
      });
    }

    const targetCount = targets.length;
    const staggerStep = this.reducedMotion ? 0.015 : Math.min(0.048, 0.16 / Math.max(1, targetCount));

    for (let i = 0; i < targetCount; i++) {
      const target = targets[i];
      const dist = Math.hypot(target.xPx - ox, target.yPx - oy);
      const isSameSpot = dist < 10;

      if (isSameSpot) {
        this.triggerChainImpactBurst(target.xPx, target.yPx, targetCount);
        continue;
      }

      const segments = clamp(Math.round(dist / 22), 7, 18);
      const jitter = this.reducedMotion ? 6 : clamp(dist * 0.085, 10, 26);
      const travelDur = this.reducedMotion ? 0.045 : clamp(0.055 + dist * 0.00014, 0.058, 0.105);

      this.pushArc({
        originX: ox,
        originY: oy,
        targetX: target.xPx,
        targetY: target.yPx,
        delay: i * staggerStep,
        elapsed: 0,
        travelDur,
        duration: this.reducedMotion ? 0.28 : 0.42,
        impactFired: false,
        reseedTimer: 0,
        mainBolt: buildJaggedBolt(ox, oy, target.xPx, target.yPx, segments, jitter),
        branchBolt: buildJaggedBolt(
          ox,
          oy,
          target.xPx,
          target.yPx,
          Math.max(5, Math.round(segments * 0.7)),
          jitter * 1.45,
        ),
      });
    }

    this.ensureLoopRunning();
  }

  public fireScrewSlam(
    targetX: number,
    targetY: number,
    byPlayer: boolean,
  ): void {
    if (!this.mounted) return;
    this.refreshReducedMotion();
    const tx = clamp(finiteOr(targetX, this.width * 0.5), 16, Math.max(16, this.width - 16));
    const ty = clamp(finiteOr(targetY, this.height * 0.5), 16, Math.max(16, this.height - 16));

    const primaryHex = byPlayer ? '#ff2c42' : '#e61938';
    const accentHex = byPlayer ? '#ffc247' : '#ff7b2e';

    // 1. Overhead dramatic crimson/amber spotlight beam
    this.pushScrewSpotlight({
      targetX: tx,
      targetY: ty,
      byPlayer,
      age: 0,
      life: this.reducedMotion ? 0.85 : 1.25,
      primaryHex,
      accentHex,
    });

    // 2. Impact flash + expanding concentric brass & crimson shockwave rings
    this.pushFlare({
      x: tx,
      y: ty,
      age: 0,
      life: 0.42,
      maxRadius: this.reducedMotion ? 74 : 138,
      spriteKey: 'crimson',
      intensity: 1.0,
    });
    this.pushFlare({
      x: tx,
      y: ty,
      age: 0,
      life: 0.26,
      maxRadius: this.reducedMotion ? 48 : 84,
      spriteKey: 'amber',
      intensity: 0.95,
    });

    this.pushShockwave({
      x: tx,
      y: ty,
      delay: 0,
      age: 0,
      life: 0.46,
      startR: 12,
      endR: this.reducedMotion ? 86 : 148,
      lineWidth: 4.0,
      color: 'rgba(255, 210, 96, 0.95)',
      innerColor: 'rgba(255, 250, 224, 0.95)',
      style: 'brass_notched',
    });

    this.pushShockwave({
      x: tx,
      y: ty,
      delay: 0.065,
      age: 0,
      life: 0.56,
      startR: 16,
      endR: this.reducedMotion ? 104 : 178,
      lineWidth: 3.4,
      color: byPlayer ? 'rgba(255, 56, 76, 0.9)' : 'rgba(235, 32, 62, 0.92)',
      style: 'crimson',
    });

    if (!this.reducedMotion) {
      this.pushShockwave({
        x: tx,
        y: ty,
        delay: 0.14,
        age: 0,
        life: 0.54,
        startR: 14,
        endR: 126,
        lineWidth: 2.2,
        color: 'rgba(255, 192, 74, 0.85)',
        style: 'flash',
      });
    }

    // 3. Hot crimson/amber impact spark shower
    const sparkCount = this.reducedMotion ? 10 : 34;
    for (let i = 0; i < sparkCount; i++) {
      const ang = randRange(0, Math.PI * 2);
      const spd = this.reducedMotion ? randRange(70, 150) : randRange(130, 420);
      const isCrimson = i % 3 === 0;
      this.pushSpark({
        x: tx + randRange(-8, 8),
        y: ty + randRange(-8, 8),
        prevX: tx,
        prevY: ty,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - randRange(40, 130),
        gravity: 540,
        drag: 0.955,
        size: randRange(1.8, 3.6),
        age: 0,
        life: randRange(0.36, 0.72),
        mode: 'crimson_amber',
        colorHex: isCrimson ? primaryHex : accentHex,
        coreHex: '#fff4d4',
        twinklePhase: randRange(0, Math.PI * 2),
      });
    }

    // 4. Kinetic "SCREWED!" stage stamp burst clamped safely inside viewport
    const marginX = Math.min(126, this.width * 0.34);
    const marginY = Math.min(76, this.height * 0.18);
    const stampX = clamp(tx, marginX, Math.max(marginX, this.width - marginX));
    const stampY = clamp(ty - 8, marginY, Math.max(marginY, this.height - marginY));

    this.pushStamp({
      x: stampX,
      y: stampY,
      title: 'SCREWED!',
      subtitle: byPlayer ? 'RIVAL LOCKED IN' : 'RIVAL AMBUSH',
      byPlayer,
      age: 0,
      life: this.reducedMotion ? 1.15 : 1.45,
      tiltRad: byPlayer ? -0.11 : 0.1,
    });

    this.ensureLoopRunning();
  }

  public fireWedgeCrystal(x: number, y: number, wedge: WedgeColorId): void {
    if (!this.mounted) return;
    this.refreshReducedMotion();
    const sx = finiteOr(x, this.width * 0.5);
    const sy = finiteOr(y, this.height * 0.65);
    const palette = WEDGE_CRYSTAL_PALETTES[wedge] ?? WEDGE_CRYSTAL_PALETTES.GOLD_HISTORY;

    const dest = this.resolveWedgeTargetPoint();
    const midX = (sx + dest.x) * 0.5;
    const midY = (sy + dest.y) * 0.5;
    // Expressive outward curve toward whichever side gives the grandest theatrical arc
    const lateralDir = sx < dest.x ? -1 : 1;
    const curveSpread = clamp(Math.abs(sy - dest.y) * 0.34, 48, 165);
    const ctrlX = clamp(midX + lateralDir * curveSpread, 32, Math.max(32, this.width - 32));
    const ctrlY = Math.max(36, midY - clamp(Math.abs(sy - dest.y) * 0.18, 28, 96));

    // Launch flash at the earned tile
    this.pushFlare({
      x: sx,
      y: sy,
      age: 0,
      life: 0.36,
      maxRadius: this.reducedMotion ? 48 : 82,
      spriteKey: palette.spriteKey,
      intensity: 0.95,
    });
    this.pushShockwave({
      x: sx,
      y: sy,
      delay: 0,
      age: 0,
      life: 0.38,
      startR: 6,
      endR: this.reducedMotion ? 42 : 66,
      lineWidth: 2.5,
      color: palette.prism,
      style: 'jewel',
    });

    if (this.reducedMotion) {
      // Gentle direct arrival flare without high-speed cross-screen streaking
      this.triggerWedgeArrivalBurst(dest.x, dest.y, palette, true);
    } else {
      this.pushComet({
        startX: sx,
        startY: sy,
        ctrlX,
        ctrlY,
        destX: dest.x,
        destY: dest.y,
        wedge,
        palette,
        age: 0,
        duration: 0.78,
        spin: randRange(0, Math.PI * 2),
        sparkAccum: 0,
        trail: [{ x: sx, y: sy }],
        arrived: false,
      });
    }

    this.ensureLoopRunning();
  }

  public fireLineJackpotSweep(pointsLabel: string): void {
    if (!this.mounted) return;
    this.refreshReducedMotion();
    const raw = (pointsLabel || '').trim();
    let headline = 'STAGE LINE JACKPOT!';
    let pointsText = '+300 PTS';

    if (raw.length > 0) {
      if (/jackpot/i.test(raw)) {
        const splitMatch = raw.match(/^(.*?jackpot!?)\s*(.*)$/i);
        if (splitMatch && splitMatch[2].trim().length > 0) {
          headline = splitMatch[1].trim().toUpperCase();
          pointsText = splitMatch[2].trim().toUpperCase();
        } else {
          headline = raw.toUpperCase();
          pointsText = '';
        }
      } else {
        pointsText = raw.toUpperCase();
      }
    }

    this.pushJackpot({
      headline,
      pointsText,
      age: 0,
      duration: this.reducedMotion ? 1.8 : 2.55,
    });

    // Radiant center flare behind marquee entrance
    const bannerY = clamp(this.height * 0.28, 96, 260);
    this.pushFlare({
      x: this.width * 0.5,
      y: bannerY,
      age: 0,
      life: 0.65,
      maxRadius: Math.min(this.width * 0.45, 260),
      spriteKey: 'gold',
      intensity: 0.85,
    });

    // Glittering gold ribbon shower across the stage
    const ribbonCount = this.reducedMotion ? 18 : 76;
    for (let i = 0; i < ribbonCount; i++) {
      const gold = GOLD_RIBBON_PALETTE[i % GOLD_RIBBON_PALETTE.length];
      const spawnX = randRange(this.width * 0.05, this.width * 0.95);
      const spawnY = randRange(-140, -10);
      this.pushConfetti({
        x: spawnX,
        y: spawnY,
        vx: randRange(-52, 52),
        vy: randRange(70, 210),
        width: randRange(7, 13),
        height: randRange(14, 26),
        angle: randRange(0, Math.PI * 2),
        vAngle: randRange(-5.5, 5.5),
        tilt: randRange(0, Math.PI * 2),
        vTilt: randRange(5, 11),
        swayPhase: randRange(0, Math.PI * 2),
        swayFreq: randRange(2.4, 4.8),
        swayAmp: randRange(26, 68),
        terminalVy: randRange(125, 225),
        age: 0,
        life: randRange(2.2, 3.6),
        baseHex: gold.base,
        lightHex: gold.light,
        darkHex: gold.dark,
        shape: i % 3 === 0 ? 'diamond' : 'ribbon',
      });
    }

    // Golden sparkle glints popping along the marquee span
    const glintCount = this.reducedMotion ? 8 : 26;
    for (let i = 0; i < glintCount; i++) {
      const gx = this.width * 0.5 + randRange(-Math.min(220, this.width * 0.38), Math.min(220, this.width * 0.38));
      const gy = bannerY + randRange(-36, 36);
      this.pushSpark({
        x: gx,
        y: gy,
        prevX: gx,
        prevY: gy,
        vx: randRange(-85, 85),
        vy: randRange(-110, 45),
        gravity: 130,
        drag: 0.96,
        size: randRange(2.4, 5.2),
        age: 0,
        life: randRange(0.55, 1.15),
        mode: 'gold_glint',
        colorHex: '#ffd863',
        coreHex: '#ffffff',
        twinklePhase: randRange(0, Math.PI * 2),
      });
    }

    this.ensureLoopRunning();
  }

  public fireConfettiOvation(durationMs = 3600): void {
    if (!this.mounted) return;
    this.refreshReducedMotion();
    const clampedMs = clamp(finiteOr(durationMs, 3600), 800, 12000);
    const durSec = clampedMs / 1000;

    if (this.reducedMotion) {
      // Tasteful low-motion golden/emerald/sapphire shimmer shower
      const count = 26;
      for (let i = 0; i < count; i++) {
        const col = pickWeightedConfettiColor();
        this.pushConfetti({
          x: randRange(this.width * 0.06, this.width * 0.94),
          y: randRange(-20, this.height * 0.25),
          vx: randRange(-12, 12),
          vy: randRange(36, 68),
          width: randRange(7, 11),
          height: randRange(10, 16),
          angle: randRange(0, Math.PI * 2),
          vAngle: randRange(-0.8, 0.8),
          tilt: randRange(0, Math.PI * 2),
          vTilt: randRange(1.2, 2.5),
          swayPhase: randRange(0, Math.PI * 2),
          swayFreq: randRange(0.9, 1.6),
          swayAmp: randRange(6, 16),
          terminalVy: randRange(42, 74),
          age: 0,
          life: Math.min(2.6, durSec),
          baseHex: col.base,
          lightHex: col.light,
          darkHex: col.dark,
          shape: i % 3 === 0 ? 'diamond' : 'foil_rect',
        });
      }
      this.ensureLoopRunning();
      return;
    }

    // 1. Twin prime-time stage cannons firing inward from bottom-left & bottom-right
    const cannonCount = 46;
    for (let side = 0; side < 2; side++) {
      const isLeft = side === 0;
      const originX = isLeft ? this.width * 0.06 : this.width * 0.94;
      const originY = this.height * 0.96;
      for (let i = 0; i < cannonCount; i++) {
        const col = pickWeightedConfettiColor();
        const launchAngle = isLeft
          ? randRange(-Math.PI * 0.44, -Math.PI * 0.2)
          : randRange(-Math.PI * 0.8, -Math.PI * 0.56);
        const speed = randRange(420, Math.min(920, this.height * 1.15));
        this.pushConfetti({
          x: originX + randRange(-12, 12),
          y: originY + randRange(-12, 12),
          vx: Math.cos(launchAngle) * speed,
          vy: Math.sin(launchAngle) * speed,
          width: randRange(7, 13),
          height: randRange(11, 22),
          angle: randRange(0, Math.PI * 2),
          vAngle: randRange(-7.5, 7.5),
          tilt: randRange(0, Math.PI * 2),
          vTilt: randRange(5.5, 12.5),
          swayPhase: randRange(0, Math.PI * 2),
          swayFreq: randRange(2.2, 4.8),
          swayAmp: randRange(28, 76),
          terminalVy: randRange(115, 215),
          age: 0,
          life: randRange(2.8, 4.6),
          baseHex: col.base,
          lightHex: col.light,
          darkHex: col.dark,
          shape: i % 4 === 0 ? 'diamond' : i % 2 === 0 ? 'ribbon' : 'foil_rect',
        });
      }
    }

    // 2. Overhead sustained broadcast foil cascade for the full ovation duration
    const sustainedRate = this.width < 520 ? 34 : 52;
    this.emitters.push({
      remainingSec: Math.max(0.4, durSec - 0.55),
      spawnAccum: 0,
      ratePerSec: sustainedRate,
    });
    if (this.emitters.length > 4) {
      this.emitters.splice(0, this.emitters.length - 4);
    }

    this.ensureLoopRunning();
  }

  // --------------------------------------------------------------------------
  // INTERNAL SETUP & LISTENERS
  // --------------------------------------------------------------------------

  private enforceOverlayStyles(canvas: HTMLCanvasElement): void {
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '65';
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';
    canvas.style.background = 'transparent';
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';
    canvas.setAttribute('aria-hidden', 'true');
  }

  private bindSystemListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResizeBound, { passive: true });
      window.visualViewport?.addEventListener('resize', this.handleResizeBound, {
        passive: true,
      });

      if (typeof window.matchMedia === 'function') {
        this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reducedMotion = this.reducedMotionQuery.matches;
        if (typeof this.reducedMotionQuery.addEventListener === 'function') {
          this.reducedMotionQuery.addEventListener('change', this.handleMotionChangeBound);
        }
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityBound);
    }
  }

  private unbindSystemListeners(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResizeBound);
      window.visualViewport?.removeEventListener('resize', this.handleResizeBound);
    }
    if (this.reducedMotionQuery && typeof this.reducedMotionQuery.removeEventListener === 'function') {
      this.reducedMotionQuery.removeEventListener('change', this.handleMotionChangeBound);
    }
    this.reducedMotionQuery = null;

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityBound);
    }
  }

  private onVisibilityChange(): void {
    if (typeof document === 'undefined') return;
    this.pageHidden = document.visibilityState === 'hidden';
    if (!this.pageHidden && this.mounted) {
      this.lastFrameMs = typeof performance !== 'undefined' ? performance.now() : 0;
      this.ensureLoopRunning();
    }
  }

  private refreshReducedMotion(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const matches = this.reducedMotionQuery
      ? this.reducedMotionQuery.matches
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (matches !== this.reducedMotion) {
      this.reducedMotion = matches;
      if (this.mounted) {
        this.rebalanceAmbientEntities();
      }
    }
  }

  private getVolumetricBeamSprite(
    cacheKey: string,
    rgb: RgbColor,
    coreRgb: RgbColor,
  ): HTMLCanvasElement | null {
    const existing = this.beamSprites.get(cacheKey);
    if (existing) return existing;
    const built = makeVolumetricBeamSprite(rgb, coreRgb, 128, 256);
    if (built) {
      this.beamSprites.set(cacheKey, built);
    }
    return built;
  }

  private syncViewportSize(): void {
    if (!this.canvas || typeof window === 'undefined') return;
    const vw = Math.max(1, Math.round(window.innerWidth || this.canvas.clientWidth || 1280));
    const vh = Math.max(1, Math.round(window.innerHeight || this.canvas.clientHeight || 800));
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = vw;
    this.height = vh;
    this.dpr = nextDpr;

    const targetW = Math.max(1, Math.round(vw * nextDpr));
    const targetH = Math.max(1, Math.round(vh * nextDpr));

    if (this.canvas.width !== targetW || this.canvas.height !== targetH) {
      this.canvas.width = targetW;
      this.canvas.height = targetH;
    }

    if (this.ctx) {
      this.ctx.setTransform(nextDpr, 0, 0, nextDpr, 0, 0);
    }

    // Reposition any motes that fell outside after orientation change
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      if (m.x > vw + 20) m.x = randRange(0, vw);
      if (m.y > vh + 20) m.y = randRange(0, vh);
    }
  }

  private buildGlowSpriteBank(): void {
    const entries: Array<[GlowSpriteKey, string, string, string]> = [
      ['whiteHot', 'rgba(255,255,250,1)', 'rgba(255,236,176,0.7)', 'rgba(255,190,72,0.18)'],
      ['gold', 'rgba(255,246,204,0.95)', 'rgba(247,197,72,0.6)', 'rgba(218,142,24,0.14)'],
      ['amber', 'rgba(255,232,175,0.95)', 'rgba(255,156,42,0.62)', 'rgba(210,82,16,0.15)'],
      ['crimson', 'rgba(255,214,218,0.92)', 'rgba(255,46,74,0.62)', 'rgba(180,14,40,0.14)'],
      ['emerald', 'rgba(222,255,240,0.95)', 'rgba(52,217,147,0.62)', 'rgba(12,135,84,0.14)'],
      ['sapphire', 'rgba(224,244,255,0.95)', 'rgba(70,168,255,0.62)', 'rgba(18,86,196,0.14)'],
      ['magenta', 'rgba(255,224,238,0.95)', 'rgba(242,100,152,0.62)', 'rgba(156,22,78,0.14)'],
      ['orange', 'rgba(255,238,214,0.95)', 'rgba(255,147,71,0.62)', 'rgba(184,64,12,0.14)'],
      ['violet', 'rgba(242,226,255,0.95)', 'rgba(180,124,255,0.62)', 'rgba(96,38,186,0.14)'],
      ['dustMote', 'rgba(255,248,216,0.95)', 'rgba(255,222,138,0.42)', 'rgba(245,196,81,0.08)'],
    ];

    for (let i = 0; i < entries.length; i++) {
      const [key, c0, c1, c2] = entries[i];
      const sprite = makeGlowSprite(c0, c1, c2, 64);
      if (sprite) {
        this.sprites[key] = sprite;
      }
    }
  }

  private snapMoodToTarget(): void {
    const spec = TIER_MOOD_SPECS[this.tier];
    const mod = INTENSITY_MODIFIERS[this.intensity];
    this.curPrimary = { ...spec.primary };
    this.curSecondary = { ...spec.secondary };
    this.curMote = { ...spec.mote };
    this.curBeamAlpha = mod.beamAlpha;
    this.curMoteAlpha = mod.moteAlpha;
    this.curSpeedMult = mod.speedMult;
    this.curBeamLength = mod.beamLength;
  }

  private rebalanceAmbientEntities(): void {
    const spec = TIER_MOOD_SPECS[this.tier];
    const mod = INTENSITY_MODIFIERS[this.intensity];

    // Configure top volumetric spotlights
    const targetBeams = this.reducedMotion ? Math.min(2, spec.beamCount) : spec.beamCount;
    const nextBeams: StageBeam[] = [];
    for (let i = 0; i < targetBeams; i++) {
      const frac = targetBeams === 1 ? 0.5 : i / (targetBeams - 1);
      // Anchor across upper stage rig (0.08 .. 0.92) angled slightly inward toward center stage
      const anchorNormX = lerp(0.08, 0.92, frac);
      const inwardBias = (0.5 - anchorNormX) * 0.56;
      nextBeams.push({
        anchorNormX,
        baseAngle: Math.PI * 0.5 + inwardBias,
        swayAmp: this.reducedMotion ? 0 : randRange(0.09, 0.17),
        swaySpeed: spec.sweepRate * randRange(0.72, 1.28),
        phase: i * 1.47 + randRange(0, 0.7),
        widthScale: randRange(0.85, 1.18),
        isSecondary: i % 2 === 1,
      });
    }
    this.beams = nextBeams;

    // Configure golden drifting stage dust motes
    const mobileFactor = this.width < 560 ? 0.72 : 1.0;
    const desiredMotes = this.reducedMotion
      ? 6
      : clamp(Math.round(spec.baseMotes * mod.moteScale * mobileFactor), 12, 56);

    while (this.motes.length < desiredMotes) {
      this.motes.push(this.createDustMote(true));
    }
    if (this.motes.length > desiredMotes) {
      this.motes.length = desiredMotes;
    }
  }

  private createDustMote(randomY: boolean): DustMote {
    // Concentrate motes gracefully across upper & lateral theatrical space
    const ySpan = this.height * 0.86;
    return {
      x: randRange(0, this.width),
      y: randomY ? randRange(0, ySpan) : randRange(ySpan * 0.72, this.height + 12),
      vx: randRange(-10, 10),
      vy: randRange(-18, -5),
      radius: randRange(1.2, 3.1),
      alpha: randRange(0.24, 0.78),
      twinklePhase: randRange(0, Math.PI * 2),
      twinkleSpeed: randRange(1.1, 2.8),
      warmth: Math.random() < 0.7 ? 1 : 0,
    };
  }

  private resolveWedgeTargetPoint(): { x: number; y: number } {
    const defaultPoint = {
      x: this.width * 0.5,
      y: clamp(this.height * 0.22, 74, 195),
    };

    if (typeof document === 'undefined') return defaultPoint;

    try {
      const el = document.querySelector<HTMLElement>(
        '[data-vfx-wedge-target], .v5-wedge-medallion, .v5-stage-medallion, .ws4-crown-ring',
      );
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          rect.width > 12 &&
          rect.height > 12 &&
          rect.top >= -10 &&
          rect.top < this.height * 0.55
        ) {
          return {
            x: clamp(rect.left + rect.width * 0.5, 24, Math.max(24, this.width - 24)),
            y: clamp(rect.top + rect.height * 0.5, 24, Math.max(24, this.height * 0.55)),
          };
        }
      }
    } catch {
      // Fall back safely to top-center of the stage
    }
    return defaultPoint;
  }

  // --------------------------------------------------------------------------
  // POOL INSERTION HELPERS (Capped for guaranteed 60fps under heavy bursts)
  // --------------------------------------------------------------------------

  private pushArc(arc: ChainArcEffect): void {
    if (this.arcs.length >= MAX_ARCS) this.arcs.shift();
    this.arcs.push(arc);
  }

  private pushDebris(item: MetallicDebris): void {
    if (this.debris.length >= MAX_DEBRIS) this.debris.shift();
    this.debris.push(item);
  }

  private pushSpark(spark: SparkParticle): void {
    if (this.sparks.length >= MAX_SPARKS) this.sparks.shift();
    this.sparks.push(spark);
  }

  private pushShockwave(ring: ShockwaveRing): void {
    if (this.shockwaves.length >= MAX_SHOCKWAVES) this.shockwaves.shift();
    this.shockwaves.push(ring);
  }

  private pushFlare(flare: RadialFlare): void {
    if (this.flares.length >= MAX_FLARES) this.flares.shift();
    this.flares.push(flare);
  }

  private pushScrewSpotlight(spot: ScrewSpotlightEffect): void {
    if (this.screwSpotlights.length >= MAX_SPOTLIGHTS) this.screwSpotlights.shift();
    this.screwSpotlights.push(spot);
  }

  private pushStamp(stamp: KineticStampEffect): void {
    if (this.stamps.length >= MAX_STAMPS) this.stamps.shift();
    this.stamps.push(stamp);
  }

  private pushComet(comet: WedgeCometEffect): void {
    if (this.comets.length >= MAX_COMETS) this.comets.shift();
    this.comets.push(comet);
  }

  private pushJackpot(jp: JackpotSweepEffect): void {
    if (this.jackpots.length >= MAX_JACKPOTS) this.jackpots.shift();
    this.jackpots.push(jp);
  }

  private pushConfetti(piece: FoilConfetti): void {
    if (this.confetti.length >= MAX_CONFETTI) this.confetti.shift();
    this.confetti.push(piece);
  }

  // --------------------------------------------------------------------------
  // BURST SUB-EMITTERS
  // --------------------------------------------------------------------------

  private triggerChainImpactBurst(x: number, y: number, totalTargets: number): void {
    const densityScale = totalTargets > 3 ? 0.65 : totalTargets > 1 ? 0.85 : 1.0;

    // Blazing white-gold strike flash + brass shockwave ring
    this.pushFlare({
      x,
      y,
      age: 0,
      life: 0.36,
      maxRadius: this.reducedMotion ? 52 : 96,
      spriteKey: 'whiteHot',
      intensity: 1.0,
    });
    this.pushFlare({
      x,
      y,
      age: 0,
      life: 0.48,
      maxRadius: this.reducedMotion ? 64 : 118,
      spriteKey: 'amber',
      intensity: 0.82,
    });
    this.pushShockwave({
      x,
      y,
      delay: 0,
      age: 0,
      life: 0.38,
      startR: 8,
      endR: this.reducedMotion ? 52 : 84,
      lineWidth: 3.0,
      color: 'rgba(255, 214, 92, 0.95)',
      innerColor: 'rgba(255, 252, 232, 0.92)',
      style: 'flash',
    });

    if (this.reducedMotion) {
      // Clean minimal golden unlock shimmer in reduced-motion mode
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + randRange(-0.15, 0.15);
        this.pushSpark({
          x,
          y,
          prevX: x,
          prevY: y,
          vx: Math.cos(ang) * randRange(45, 95),
          vy: Math.sin(ang) * randRange(45, 95),
          gravity: 80,
          drag: 0.92,
          size: randRange(2.0, 3.0),
          age: 0,
          life: 0.38,
          mode: 'hot_metal',
          colorHex: '#ffd257',
          coreHex: '#fffbe6',
          twinklePhase: 0,
        });
      }
      return;
    }

    // 1. Broken brass padlock U-shackle shooting upward
    const shackleDir = Math.random() < 0.5 ? -1 : 1;
    this.pushDebris({
      kind: 'shackle',
      x: x + randRange(-6, 6),
      y: y - 10,
      vx: shackleDir * randRange(80, 190),
      vy: randRange(-390, -250),
      angle: randRange(-0.4, 0.4),
      vAngle: shackleDir * randRange(9, 16),
      tumble: randRange(0, Math.PI),
      vTumble: randRange(5, 10),
      scale: randRange(0.95, 1.15),
      age: 0,
      life: randRange(0.95, 1.28),
      isHotFracture: true,
    });

    // 2. Fractured left & right brass padlock halves bursting apart
    this.pushDebris({
      kind: 'padlock_left',
      x: x - 6,
      y: y + 2,
      vx: randRange(-230, -110),
      vy: randRange(-300, -160),
      angle: randRange(-0.3, 0.2),
      vAngle: randRange(-13, -6.5),
      tumble: randRange(0, Math.PI * 0.4),
      vTumble: randRange(4, 8),
      scale: randRange(0.92, 1.12),
      age: 0,
      life: randRange(0.92, 1.24),
      isHotFracture: true,
    });
    this.pushDebris({
      kind: 'padlock_right',
      x: x + 6,
      y: y + 2,
      vx: randRange(110, 230),
      vy: randRange(-300, -160),
      angle: randRange(-0.2, 0.3),
      vAngle: randRange(6.5, 13),
      tumble: randRange(0, Math.PI * 0.4),
      vTumble: randRange(4, 8),
      scale: randRange(0.92, 1.12),
      age: 0,
      life: randRange(0.92, 1.24),
      isHotFracture: true,
    });

    // 3. Spinning 2D-shaded metallic chain links flying along the diagonal X-chains
    const linkCount = Math.max(6, Math.round(10 * densityScale));
    for (let i = 0; i < linkCount; i++) {
      // Bias slightly along the 4 diagonal chain axes for authentic unwrapping feel
      const diagAxis = ((i % 4) * Math.PI) / 2 + Math.PI * 0.25 + randRange(-0.42, 0.42);
      const speed = randRange(155, 390);
      this.pushDebris({
        kind: 'chain_link',
        x: x + Math.cos(diagAxis) * randRange(6, 22),
        y: y + Math.sin(diagAxis) * randRange(6, 22),
        vx: Math.cos(diagAxis) * speed,
        vy: Math.sin(diagAxis) * speed - randRange(120, 250),
        angle: diagAxis,
        vAngle: randRange(-15, 15),
        tumble: randRange(0, Math.PI * 2),
        vTumble: randRange(6, 14),
        scale: randRange(0.82, 1.18),
        age: 0,
        life: randRange(0.84, 1.24),
        isHotFracture: i < 4,
      });
    }

    // 4. Hot white -> gold -> orange metallurgy spark shower
    const sparkCount = Math.max(18, Math.round(36 * densityScale));
    for (let i = 0; i < sparkCount; i++) {
      const ang = randRange(0, Math.PI * 2);
      const spd = randRange(110, 470);
      this.pushSpark({
        x: x + randRange(-10, 10),
        y: y + randRange(-10, 10),
        prevX: x,
        prevY: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - randRange(70, 210),
        gravity: randRange(620, 860),
        drag: randRange(0.955, 0.98),
        size: randRange(1.4, 3.1),
        age: 0,
        life: randRange(0.32, 0.78),
        mode: 'hot_metal',
        colorHex: '#ffaa2b',
        coreHex: '#fffef2',
        twinklePhase: randRange(0, Math.PI * 2),
      });
    }
  }

  private triggerWedgeArrivalBurst(
    x: number,
    y: number,
    palette: WedgeCrystalPalette,
    gentle: boolean,
  ): void {
    this.pushFlare({
      x,
      y,
      age: 0,
      life: 0.56,
      maxRadius: gentle ? 72 : 126,
      spriteKey: palette.spriteKey,
      intensity: 1.0,
    });
    this.pushFlare({
      x,
      y,
      age: 0,
      life: 0.34,
      maxRadius: gentle ? 42 : 76,
      spriteKey: 'whiteHot',
      intensity: 0.95,
    });
    this.pushShockwave({
      x,
      y,
      delay: 0,
      age: 0,
      life: 0.48,
      startR: 10,
      endR: gentle ? 64 : 112,
      lineWidth: 3.2,
      color: palette.prism,
      innerColor: palette.core,
      style: 'jewel',
    });
    this.pushShockwave({
      x,
      y,
      delay: 0.08,
      age: 0,
      life: 0.52,
      startR: 12,
      endR: gentle ? 52 : 88,
      lineWidth: 2.2,
      color: 'rgba(255, 224, 118, 0.88)',
      style: 'flash',
    });

    const sparkleCount = gentle ? 10 : 30;
    for (let i = 0; i < sparkleCount; i++) {
      const ang = (i / sparkleCount) * Math.PI * 2 + randRange(-0.2, 0.2);
      const spd = gentle ? randRange(40, 110) : randRange(95, 310);
      this.pushSpark({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - (gentle ? 15 : 40),
        gravity: gentle ? 80 : 210,
        drag: 0.95,
        size: randRange(2.4, 5.4),
        age: 0,
        life: randRange(0.45, 0.92),
        mode: 'prism_star',
        colorHex: i % 3 === 0 ? '#ffe58f' : palette.prism,
        coreHex: palette.core,
        twinklePhase: randRange(0, Math.PI * 2),
      });
    }
  }

  // --------------------------------------------------------------------------
  // FRAME LOOP
  // --------------------------------------------------------------------------

  private hasActiveDynamicEffects(): boolean {
    return (
      this.arcs.length > 0 ||
      this.debris.length > 0 ||
      this.sparks.length > 0 ||
      this.shockwaves.length > 0 ||
      this.flares.length > 0 ||
      this.screwSpotlights.length > 0 ||
      this.stamps.length > 0 ||
      this.comets.length > 0 ||
      this.jackpots.length > 0 ||
      this.confetti.length > 0 ||
      this.emitters.length > 0
    );
  }

  private ensureLoopRunning(): void {
    if (!this.mounted || this.pageHidden) return;
    if (this.rafId !== null) return;
    if (typeof requestAnimationFrame !== 'function') return;
    this.lastFrameMs = typeof performance !== 'undefined' ? performance.now() : 0;
    this.rafId = requestAnimationFrame(this.tickBound);
  }

  private tick(nowMs: number): void {
    this.rafId = null;
    if (!this.mounted || !this.ctx || !this.canvas) return;
    if (this.pageHidden) return;

    const rawDt = this.lastFrameMs > 0 ? (nowMs - this.lastFrameMs) / 1000 : 1 / 60;
    this.lastFrameMs = nowMs;
    const dt = clamp(rawDt, 0.001, 0.05);
    this.clockSec += dt;

    this.update(dt);
    this.render(this.ctx);

    // In reduced-motion mode, stop RAF once transient bursts finish so idle CPU = 0%
    if (this.reducedMotion && !this.hasActiveDynamicEffects()) {
      return;
    }

    this.rafId = requestAnimationFrame(this.tickBound);
  }

  // --------------------------------------------------------------------------
  // SIMULATION UPDATE
  // --------------------------------------------------------------------------

  private update(dt: number): void {
    // 1. Smoothly lerp stage mood parameters (theater dimmer console feel)
    const spec = TIER_MOOD_SPECS[this.tier];
    const mod = INTENSITY_MODIFIERS[this.intensity];
    const moodBlend = 1 - Math.exp(-dt * 3.4);

    this.curPrimary = {
      r: lerp(this.curPrimary.r, spec.primary.r, moodBlend),
      g: lerp(this.curPrimary.g, spec.primary.g, moodBlend),
      b: lerp(this.curPrimary.b, spec.primary.b, moodBlend),
    };
    this.curSecondary = {
      r: lerp(this.curSecondary.r, spec.secondary.r, moodBlend),
      g: lerp(this.curSecondary.g, spec.secondary.g, moodBlend),
      b: lerp(this.curSecondary.b, spec.secondary.b, moodBlend),
    };
    this.curMote = {
      r: lerp(this.curMote.r, spec.mote.r, moodBlend),
      g: lerp(this.curMote.g, spec.mote.g, moodBlend),
      b: lerp(this.curMote.b, spec.mote.b, moodBlend),
    };
    this.curBeamAlpha = lerp(this.curBeamAlpha, mod.beamAlpha, moodBlend);
    this.curMoteAlpha = lerp(this.curMoteAlpha, mod.moteAlpha, moodBlend);
    this.curSpeedMult = lerp(this.curSpeedMult, mod.speedMult, moodBlend);
    this.curBeamLength = lerp(this.curBeamLength, mod.beamLength, moodBlend);

    // 2. Ambient stage dust motes
    if (!this.reducedMotion) {
      const speedScale = 0.55 + this.curSpeedMult * 0.45;
      for (let i = 0; i < this.motes.length; i++) {
        const m = this.motes[i];
        m.twinklePhase += dt * m.twinkleSpeed * speedScale;
        m.x += (m.vx + Math.sin(this.clockSec * 0.6 + m.twinklePhase) * 6) * dt * speedScale;
        m.y += m.vy * dt * speedScale;

        if (m.y < -14) {
          m.y = this.height * 0.88 + randRange(0, 30);
          m.x = randRange(0, this.width);
        } else if (m.x < -16) {
          m.x = this.width + 12;
        } else if (m.x > this.width + 16) {
          m.x = -12;
        }
      }
    }

    // 3. Electric chain shatter arcs
    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      if (a.delay > 0) {
        a.delay -= dt;
        continue;
      }
      a.elapsed += dt;
      if (!a.impactFired && a.elapsed >= a.travelDur) {
        a.impactFired = true;
        this.triggerChainImpactBurst(a.targetX, a.targetY, Math.max(1, this.arcs.length));
      }
      if (!this.reducedMotion) {
        a.reseedTimer += dt;
        if (a.reseedTimer >= 0.045) {
          a.reseedTimer = 0;
          const dist = Math.hypot(a.targetX - a.originX, a.targetY - a.originY);
          const segs = clamp(Math.round(dist / 22), 7, 18);
          const jitter = clamp(dist * 0.085, 10, 26);
          a.mainBolt = buildJaggedBolt(a.originX, a.originY, a.targetX, a.targetY, segs, jitter);
          a.branchBolt = buildJaggedBolt(
            a.originX,
            a.originY,
            a.targetX,
            a.targetY,
            Math.max(5, Math.round(segs * 0.7)),
            jitter * 1.45,
          );
        }
      }
      if (a.elapsed >= a.duration) {
        this.arcs.splice(i, 1);
      }
    }

    // 4. Spinning 2D-shaded chain links & padlock debris
    const gravity = 980;
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.age += dt;
      if (d.age >= d.life || d.y > this.height + 90) {
        this.debris.splice(i, 1);
        continue;
      }
      const dragPow = Math.pow(0.985, dt * 60);
      d.vx *= dragPow;
      d.vy = d.vy * dragPow + gravity * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.angle += d.vAngle * dt;
      d.tumble += d.vTumble * dt;
    }

    // 5. Sparks & prism sparkles
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.age += dt;
      if (s.age >= s.life) {
        this.sparks.splice(i, 1);
        continue;
      }
      s.prevX = s.x;
      s.prevY = s.y;
      const dragPow = Math.pow(s.drag, dt * 60);
      s.vx *= dragPow;
      s.vy = s.vy * dragPow + s.gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.twinklePhase += dt * 14;
    }

    // 6. Shockwave rings
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const r = this.shockwaves[i];
      if (r.delay > 0) {
        r.delay -= dt;
        continue;
      }
      r.age += dt;
      if (r.age >= r.life) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 7. Radial additive flares
    for (let i = this.flares.length - 1; i >= 0; i--) {
      const f = this.flares[i];
      f.age += dt;
      if (f.age >= f.life) {
        this.flares.splice(i, 1);
      }
    }

    // 8. Screw slam spotlights
    for (let i = this.screwSpotlights.length - 1; i >= 0; i--) {
      const sp = this.screwSpotlights[i];
      sp.age += dt;
      if (sp.age >= sp.life) {
        this.screwSpotlights.splice(i, 1);
      }
    }

    // 9. Kinetic stage stamps ("SCREWED!")
    for (let i = this.stamps.length - 1; i >= 0; i--) {
      const st = this.stamps[i];
      st.age += dt;
      if (st.age >= st.life) {
        this.stamps.splice(i, 1);
      }
    }

    // 10. Wedge crystal comets
    for (let i = this.comets.length - 1; i >= 0; i--) {
      const c = this.comets[i];
      c.age += dt;
      c.spin += dt * 9.5;
      const t = easeInOutCubic(c.age / c.duration);
      const omt = 1 - t;
      const px = omt * omt * c.startX + 2 * omt * t * c.ctrlX + t * t * c.destX;
      const py = omt * omt * c.startY + 2 * omt * t * c.ctrlY + t * t * c.destY;

      c.trail.push({ x: px, y: py });
      if (c.trail.length > 26) c.trail.shift();

      c.sparkAccum += dt * 62;
      while (c.sparkAccum >= 1) {
        c.sparkAccum -= 1;
        this.pushSpark({
          x: px + randRange(-7, 7),
          y: py + randRange(-7, 7),
          prevX: px,
          prevY: py,
          vx: randRange(-48, 48),
          vy: randRange(-36, 52),
          gravity: 115,
          drag: 0.94,
          size: randRange(2.0, 4.6),
          age: 0,
          life: randRange(0.32, 0.65),
          mode: 'prism_star',
          colorHex: Math.random() < 0.35 ? '#fff1b5' : c.palette.prism,
          coreHex: c.palette.core,
          twinklePhase: randRange(0, Math.PI * 2),
        });
      }

      if (c.age >= c.duration) {
        if (!c.arrived) {
          c.arrived = true;
          this.triggerWedgeArrivalBurst(c.destX, c.destY, c.palette, false);
        }
        this.comets.splice(i, 1);
      }
    }

    // 11. Line jackpot sweeps
    for (let i = this.jackpots.length - 1; i >= 0; i--) {
      const jp = this.jackpots[i];
      jp.age += dt;
      if (jp.age >= jp.duration) {
        this.jackpots.splice(i, 1);
      }
    }

    // 12. Confetti emitters & 3D foil physics
    for (let i = this.emitters.length - 1; i >= 0; i--) {
      const em = this.emitters[i];
      em.remainingSec -= dt;
      em.spawnAccum += em.ratePerSec * dt;
      while (em.spawnAccum >= 1) {
        em.spawnAccum -= 1;
        const col = pickWeightedConfettiColor();
        this.pushConfetti({
          x: randRange(this.width * 0.03, this.width * 0.97),
          y: randRange(-26, -6),
          vx: randRange(-44, 44),
          vy: randRange(50, 155),
          width: randRange(7, 13),
          height: randRange(11, 21),
          angle: randRange(0, Math.PI * 2),
          vAngle: randRange(-6, 6),
          tilt: randRange(0, Math.PI * 2),
          vTilt: randRange(4.5, 11.5),
          swayPhase: randRange(0, Math.PI * 2),
          swayFreq: randRange(2.0, 4.6),
          swayAmp: randRange(24, 68),
          terminalVy: randRange(110, 210),
          age: 0,
          life: randRange(3.1, 4.8),
          baseHex: col.base,
          lightHex: col.light,
          darkHex: col.dark,
          shape: Math.random() < 0.25 ? 'diamond' : Math.random() < 0.55 ? 'ribbon' : 'foil_rect',
        });
      }
      if (em.remainingSec <= 0) {
        this.emitters.splice(i, 1);
      }
    }

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const p = this.confetti[i];
      p.age += dt;
      if (p.age >= p.life || p.y > this.height + 50) {
        this.confetti.splice(i, 1);
        continue;
      }

      p.swayPhase += p.swayFreq * dt;
      // Aerodynamic horizontal damping + upward cannon gravity settling smoothly into flutter terminal velocity
      const hDrag = Math.pow(0.965, dt * 60);
      p.vx *= hDrag;
      if (p.vy < p.terminalVy) {
        p.vy = Math.min(p.terminalVy, p.vy + 640 * dt);
      } else {
        p.vy = lerp(p.vy, p.terminalVy, 1 - Math.exp(-dt * 2.5));
      }

      const flutterVx = Math.sin(p.swayPhase) * p.swayAmp;
      p.x += (p.vx + flutterVx) * dt;
      p.y += p.vy * dt;
      p.angle += p.vAngle * dt;
      p.tilt += p.vTilt * dt;
    }
  }

  // --------------------------------------------------------------------------
  // RENDERING PIPELINE (Strict layered depth above board & UI)
  // --------------------------------------------------------------------------

  private render(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    // Layer 1: Subtle volumetric top stage spotlights & drifting golden dust motes
    this.renderAmbientSpotlights(ctx);
    this.renderDustMotes(ctx);

    // Layer 2: Jackpot twin searchlights (behind marquee & bursts)
    if (this.jackpots.length > 0) {
      this.renderJackpotSearchlights(ctx);
    }

    // Layer 3: Screw slam overhead crimson/amber spotlight cones
    if (this.screwSpotlights.length > 0) {
      this.renderScrewSpotlights(ctx);
    }

    // Layer 4: Additive radial impact flares & expanding shockwaves
    if (this.flares.length > 0) {
      this.renderFlares(ctx);
    }
    if (this.shockwaves.length > 0) {
      this.renderShockwaves(ctx);
    }

    // Layer 5: Jagged golden-white electric chain shatter arcs
    if (this.arcs.length > 0) {
      this.renderChainArcs(ctx);
    }

    // Layer 6: Wedge crystal comet trails & faceted jewels
    if (this.comets.length > 0) {
      this.renderWedgeComets(ctx);
    }

    // Layer 7: Physical spinning 2D-shaded chain links & padlock fragments
    if (this.debris.length > 0) {
      this.renderMetallicDebris(ctx);
    }

    // Layer 8: Glittering foil confetti & gold ribbon shower
    if (this.confetti.length > 0) {
      this.renderFoilConfetti(ctx);
    }

    // Layer 9: Hot sparks, prism stars, and gold glints (additive pop)
    if (this.sparks.length > 0) {
      this.renderSparks(ctx);
    }

    // Layer 10: Foreground kinetic stage stamps ("SCREWED!") & Gold Jackpot Marquee
    if (this.stamps.length > 0) {
      this.renderKineticStamps(ctx);
    }
    if (this.jackpots.length > 0) {
      this.renderJackpotMarquees(ctx);
    }
  }

  private renderAmbientSpotlights(ctx: CanvasRenderingContext2D): void {
    if (this.beams.length === 0 || this.curBeamAlpha <= 0.002) return;

    const spec = TIER_MOOD_SPECS[this.tier];
    const primaryBeam = this.getVolumetricBeamSprite(
      `tier_${this.tier}_pri`,
      spec.primary,
      {
        r: Math.min(255, spec.primary.r + 36),
        g: Math.min(255, spec.primary.g + 36),
        b: Math.min(255, spec.primary.b + 36),
      },
    );
    const secondaryBeam = this.getVolumetricBeamSprite(
      `tier_${this.tier}_sec`,
      spec.secondary,
      {
        r: Math.min(255, spec.secondary.r + 36),
        g: Math.min(255, spec.secondary.g + 36),
        b: Math.min(255, spec.secondary.b + 36),
      },
    );

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const beamLen = this.height * this.curBeamLength;
    const baseConeWidth = clamp(this.width * 0.34, 130, 380);

    for (let i = 0; i < this.beams.length; i++) {
      const b = this.beams[i];
      const ox = b.anchorNormX * this.width;
      const oy = -24;
      const sway = this.reducedMotion
        ? 0
        : Math.sin(this.clockSec * b.swaySpeed * this.curSpeedMult + b.phase) * b.swayAmp;
      const ang = b.baseAngle + sway;
      const alpha = clamp(this.curBeamAlpha * (b.isSecondary ? 1.55 : 1.85), 0, 0.32);

      const sprite = b.isSecondary ? secondaryBeam : primaryBeam;
      if (sprite) {
        const drawW = baseConeWidth * b.widthScale;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(ang - Math.PI * 0.5);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, -drawW * 0.5, 0, drawW, beamLen);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private renderDustMotes(ctx: CanvasRenderingContext2D): void {
    if (this.motes.length === 0) return;
    const moteSprite = this.sprites.dustMote;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      const twinkle = this.reducedMotion ? 0.8 : 0.45 + 0.55 * Math.sin(m.twinklePhase);
      // Fade motes softly near bottom edge so lower buttons stay crisp
      const vertFade = clamp(1 - (m.y - this.height * 0.65) / (this.height * 0.35), 0.15, 1);
      const a = m.alpha * twinkle * this.curMoteAlpha * vertFade;
      if (a <= 0.015) continue;

      if (moteSprite && m.warmth > 0.5) {
        const drawR = m.radius * 3.4;
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.drawImage(moteSprite, m.x - drawR, m.y - drawR, drawR * 2, drawR * 2);
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = rgbaStr(this.curMote, a);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderJackpotSearchlights(ctx: CanvasRenderingContext2D): void {
    const goldBeam = this.getVolumetricBeamSprite(
      'jackpot_gold_beam',
      { r: 255, g: 204, b: 74 },
      { r: 255, g: 250, b: 214 },
    );
    if (!goldBeam) return;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.jackpots.length; i++) {
      const jp = this.jackpots[i];
      const t = clamp(jp.age / jp.duration, 0, 1);
      const env =
        t < 0.12
          ? easeOutCubic(t / 0.12)
          : t > 0.78
            ? 1 - easeInOutCubic((t - 0.78) / 0.22)
            : 1;

      const beamLen = Math.hypot(this.width, this.height) * 1.18;
      const coneW = clamp(this.width * 0.36, 150, 390);
      const sweepOsc = this.reducedMotion ? 0 : Math.sin(jp.age * 3.4);

      const origins = [
        {
          x: this.width * 0.08,
          y: this.height + 28,
          angle: -Math.PI * 0.33 + sweepOsc * 0.28,
        },
        {
          x: this.width * 0.92,
          y: this.height + 28,
          angle: -Math.PI * 0.67 - sweepOsc * 0.28,
        },
      ];

      for (let s = 0; s < origins.length; s++) {
        const o = origins[s];
        ctx.save();
        ctx.translate(o.x, o.y);
        ctx.rotate(o.angle - Math.PI * 0.5);
        ctx.globalAlpha = clamp(0.42 * env, 0, 0.55);
        ctx.drawImage(goldBeam, -coneW * 0.5, 0, coneW, beamLen);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private renderScrewSpotlights(ctx: CanvasRenderingContext2D): void {
    const crimsonBeam = this.getVolumetricBeamSprite(
      'screw_crimson_beam',
      { r: 255, g: 46, b: 68 },
      { r: 255, g: 196, b: 92 },
    );

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.screwSpotlights.length; i++) {
      const sp = this.screwSpotlights[i];
      const t = clamp(sp.age / sp.life, 0, 1);
      const slamProg = easeOutCubic(Math.min(1, sp.age / 0.11));
      const fadeOut = t < 0.52 ? 1 : 1 - easeInOutCubic((t - 0.52) / 0.48);

      // Anchor spotlight high overhead, slightly angled toward stage center
      const topX = lerp(sp.targetX, this.width * 0.5, 0.22);
      const topY = -32;
      const dx = sp.targetX - topX;
      const dy = sp.targetY - topY;
      const fullLen = Math.hypot(dx, dy) || 1;
      const ang = Math.atan2(dy, dx);
      const curLen = fullLen * (0.2 + 0.98 * slamProg);
      const coneW = clamp(this.width * 0.32, 118, 220) * (0.85 + 0.15 * slamProg);

      if (crimsonBeam) {
        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(ang - Math.PI * 0.5);
        ctx.globalAlpha = clamp(0.62 * fadeOut, 0, 0.72);
        ctx.drawImage(crimsonBeam, -coneW * 0.5, 0, coneW, curLen);
        ctx.restore();
      }

      // Grounded elliptical spotlight pool right under the target tile
      if (slamProg > 0.6) {
        const poolAlpha = fadeOut * ((slamProg - 0.6) / 0.4);
        const rx = coneW * 0.48;
        const ry = rx * 0.56;
        ctx.save();
        ctx.translate(sp.targetX, sp.targetY);
        ctx.scale(1, ry / rx);
        const poolGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        poolGrad.addColorStop(0, `rgba(255, 224, 134, ${(0.44 * poolAlpha).toFixed(4)})`);
        poolGrad.addColorStop(0.5, `rgba(255, 48, 68, ${(0.28 * poolAlpha).toFixed(4)})`);
        poolGrad.addColorStop(1, 'rgba(255, 48, 68, 0)');
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private renderFlares(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.flares.length; i++) {
      const f = this.flares[i];
      const t = clamp(f.age / f.life, 0, 1);
      const grow = easeOutCubic(Math.min(1, t * 3.2));
      const fade = 1 - easeInOutCubic(t);
      const r = f.maxRadius * (0.25 + 0.75 * grow);
      const sprite = this.sprites[f.spriteKey] ?? this.sprites.gold;

      if (sprite) {
        ctx.globalAlpha = clamp(fade * f.intensity, 0, 1);
        ctx.drawImage(sprite, f.x - r, f.y - r, r * 2, r * 2);
      } else {
        ctx.globalAlpha = clamp(fade * f.intensity * 0.65, 0, 1);
        ctx.fillStyle = '#ffe28a';
        ctx.beginPath();
        ctx.arc(f.x, f.y, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderShockwaves(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (let i = 0; i < this.shockwaves.length; i++) {
      const r = this.shockwaves[i];
      if (r.delay > 0) continue;
      const t = clamp(r.age / r.life, 0, 1);
      const eased = easeOutCubic(t);
      const radius = lerp(r.startR, r.endR, eased);
      const alpha = 1 - t * t;
      const lw = Math.max(0.8, r.lineWidth * (1 - t * 0.65));

      ctx.globalCompositeOperation = r.style === 'brass_notched' ? 'source-over' : 'lighter';
      ctx.globalAlpha = clamp(alpha, 0, 1);

      if (r.style === 'brass_notched') {
        // Double-rimmed burnished brass shockwave with radial tick marks
        ctx.strokeStyle = r.color;
        ctx.lineWidth = lw + 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = r.innerColor ?? '#fff5d1';
        ctx.lineWidth = Math.max(1, lw * 0.45);
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(2, radius - 4), 0, Math.PI * 2);
        ctx.stroke();

        // 12 crisp brass compass ticks rotating outward
        const tickCount = 12;
        const rotOffset = t * 0.45;
        ctx.strokeStyle = '#ffd970';
        ctx.lineWidth = Math.max(1.1, lw * 0.55);
        ctx.beginPath();
        for (let k = 0; k < tickCount; k++) {
          const a = (k / tickCount) * Math.PI * 2 + rotOffset;
          const r0 = Math.max(2, radius - 7);
          const r1 = radius + 5;
          ctx.moveTo(r.x + Math.cos(a) * r0, r.y + Math.sin(a) * r0);
          ctx.lineTo(r.x + Math.cos(a) * r1, r.y + Math.sin(a) * r1);
        }
        ctx.stroke();
      } else {
        ctx.strokeStyle = r.color;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        if (r.innerColor) {
          ctx.strokeStyle = r.innerColor;
          ctx.lineWidth = Math.max(0.8, lw * 0.42);
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  private renderChainArcs(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < this.arcs.length; i++) {
      const a = this.arcs[i];
      if (a.delay > 0) continue;

      const travelFrac = clamp(a.elapsed / a.travelDur, 0, 1);
      const lifeFrac = clamp(a.elapsed / a.duration, 0, 1);
      const fade = lifeFrac < 0.45 ? 1 : 1 - easeInOutCubic((lifeFrac - 0.45) / 0.55);
      if (fade <= 0.01) continue;

      // Secondary plasma tendril
      if (!this.reducedMotion && a.branchBolt.length > 1) {
        this.strokePolylineSlice(ctx, a.branchBolt, travelFrac);
        ctx.strokeStyle = `rgba(255, 190, 62, ${(0.36 * fade).toFixed(4)})`;
        ctx.lineWidth = 4.2;
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 245, 206, ${(0.62 * fade).toFixed(4)})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // Main golden-white electric arc (3-pass luminous bloom)
      if (a.mainBolt.length > 1) {
        this.strokePolylineSlice(ctx, a.mainBolt, travelFrac);
        ctx.strokeStyle = `rgba(255, 166, 36, ${(0.38 * fade).toFixed(4)})`;
        ctx.lineWidth = 11.5;
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 224, 114, ${(0.84 * fade).toFixed(4)})`;
        ctx.lineWidth = 4.4;
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 254, 244, ${(1.0 * fade).toFixed(4)})`;
        ctx.lineWidth = 1.75;
        ctx.stroke();
      }

      // Glowing bolt head while zipping toward target
      if (travelFrac < 1 && a.mainBolt.length > 1) {
        const headIdx = Math.min(
          a.mainBolt.length - 1,
          Math.floor(travelFrac * (a.mainBolt.length - 1)),
        );
        const head = a.mainBolt[headIdx];
        const sprite = this.sprites.whiteHot;
        if (sprite) {
          ctx.globalAlpha = fade;
          ctx.drawImage(sprite, head.x - 24, head.y - 24, 48, 48);
          ctx.globalAlpha = 1;
        }
      }
    }

    ctx.restore();
  }

  private strokePolylineSlice(
    ctx: CanvasRenderingContext2D,
    pts: readonly LightningVertex[],
    fraction: number,
  ): void {
    const maxSeg = (pts.length - 1) * clamp(fraction, 0, 1);
    const whole = Math.floor(maxSeg);
    const rem = maxSeg - whole;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= whole && i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    if (rem > 0.001 && whole + 1 < pts.length) {
      const p0 = pts[whole];
      const p1 = pts[whole + 1];
      ctx.lineTo(lerp(p0.x, p1.x, rem), lerp(p0.y, p1.y, rem));
    }
  }

  private renderMetallicDebris(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < this.debris.length; i++) {
      const d = this.debris[i];
      const t = clamp(d.age / d.life, 0, 1);
      const alpha = t < 0.72 ? 1 : 1 - (t - 0.72) / 0.28;
      if (alpha <= 0.01) continue;

      const tumbleScaleY = Math.max(0.28, Math.abs(Math.cos(d.tumble)));
      const hotGlow = d.isHotFracture ? clamp(1 - d.age / 0.36, 0, 1) : 0;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(d.x, d.y);
      ctx.rotate(d.angle);
      ctx.scale(d.scale, d.scale * tumbleScaleY);

      if (d.kind === 'chain_link') {
        this.drawChainLink2D(ctx, hotGlow);
      } else if (d.kind === 'shackle') {
        this.drawBrokenShackle2D(ctx, hotGlow);
      } else {
        this.drawPadlockHalf2D(ctx, d.kind === 'padlock_left', hotGlow);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private drawChainLink2D(ctx: CanvasRenderingContext2D, hotGlow: number): void {
    // 2D-shaded forged steel/iron oval chain link with metallic bevel & specular ridge
    traceRoundedStadium(ctx, 20, 11);
    ctx.strokeStyle = '#181e29';
    ctx.lineWidth = 5.4;
    ctx.stroke();

    const metalGrad = ctx.createLinearGradient(-10, -6, 10, 6);
    metalGrad.addColorStop(0, '#495468');
    metalGrad.addColorStop(0.32, '#c8d3e4');
    metalGrad.addColorStop(0.55, '#6d7a90');
    metalGrad.addColorStop(0.82, '#e2d0a8');
    metalGrad.addColorStop(1, '#394252');
    ctx.strokeStyle = metalGrad;
    ctx.lineWidth = 3.4;
    ctx.stroke();

    // Crisp top specular gleam
    ctx.beginPath();
    ctx.moveTo(-5.5, -5.2);
    ctx.lineTo(5.5, -5.2);
    ctx.strokeStyle = 'rgba(255, 250, 232, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Cooling molten fracture edge where the chain snapped
    if (hotGlow > 0.02) {
      ctx.fillStyle = `rgba(255, 196, 68, ${hotGlow.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(9.5, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBrokenShackle2D(ctx: CanvasRenderingContext2D, hotGlow: number): void {
    // Snapped arched padlock U-shackle
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(-8, -1);
    ctx.arc(0, -1, 8, Math.PI, 0, false);
    ctx.lineTo(8, 5); // snapped shorter on right leg

    ctx.strokeStyle = '#1d1c22';
    ctx.lineWidth = 6.2;
    ctx.stroke();

    const shackleGrad = ctx.createLinearGradient(-9, -9, 9, 10);
    shackleGrad.addColorStop(0, '#6a7486');
    shackleGrad.addColorStop(0.38, '#f0f4fa');
    shackleGrad.addColorStop(0.7, '#9ca6b8');
    shackleGrad.addColorStop(1, '#d9b56c');
    ctx.strokeStyle = shackleGrad;
    ctx.lineWidth = 3.8;
    ctx.stroke();

    // Inner gleam highlight
    ctx.beginPath();
    ctx.arc(0, -1, 7.6, Math.PI * 1.12, Math.PI * 1.88, false);
    ctx.strokeStyle = 'rgba(255, 252, 240, 0.9)';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    if (hotGlow > 0.02) {
      ctx.fillStyle = `rgba(255, 184, 58, ${hotGlow.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(8, 5.5, 3.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPadlockHalf2D(
    ctx: CanvasRenderingContext2D,
    isLeft: boolean,
    hotGlow: number,
  ): void {
    // Sculpted solid brass padlock half with jagged fracture seam and keyhole notch
    const dir = isLeft ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(dir * 10, -10);
    ctx.lineTo(dir * 12, -7);
    ctx.lineTo(dir * 12, 8);
    ctx.lineTo(dir * 9, 11);
    ctx.lineTo(0, 11);
    // Jagged split fracture down the centerline
    ctx.lineTo(dir * 2.4, 5);
    ctx.lineTo(dir * -0.8, 1);
    ctx.lineTo(dir * 2.2, -3);
    ctx.lineTo(dir * -0.5, -6.5);
    ctx.closePath();

    const brassGrad = ctx.createLinearGradient(dir * 12, -10, 0, 11);
    brassGrad.addColorStop(0, '#fff2b0');
    brassGrad.addColorStop(0.32, '#f2c146');
    brassGrad.addColorStop(0.72, '#b97b16');
    brassGrad.addColorStop(1, '#754608');
    ctx.fillStyle = brassGrad;
    ctx.fill();

    ctx.strokeStyle = '#3d2204';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Inner beveled brass highlight line
    ctx.strokeStyle = 'rgba(255, 248, 204, 0.72)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(dir * 9.5, -8.2);
    ctx.lineTo(dir * 9.5, 7.2);
    ctx.stroke();

    // Half keyhole recess along fracture seam
    ctx.fillStyle = '#241406';
    ctx.beginPath();
    ctx.arc(dir * 0.4, -1.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    if (hotGlow > 0.02) {
      ctx.strokeStyle = `rgba(255, 226, 118, ${(hotGlow * 0.9).toFixed(3)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(dir * 2.2, -3);
      ctx.lineTo(dir * 2.4, 5);
      ctx.lineTo(0, 11);
      ctx.stroke();
    }
  }

  private renderWedgeComets(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (let i = 0; i < this.comets.length; i++) {
      const c = this.comets[i];
      const pts = c.trail;
      if (pts.length < 2) continue;

      // 1. Luminous tapered comet ribbon
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let j = 1; j < pts.length; j++) {
        const frac = j / (pts.length - 1);
        const p0 = pts[j - 1];
        const p1 = pts[j];

        // Outer colored bloom
        ctx.strokeStyle = c.palette.mid;
        ctx.globalAlpha = frac * frac * 0.55;
        ctx.lineWidth = 3 + frac * 14;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // Bright prism core
        ctx.strokeStyle = c.palette.core;
        ctx.globalAlpha = frac * frac * 0.92;
        ctx.lineWidth = 1.2 + frac * 5.2;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      // 2. Additive jewel halo at comet head
      const head = pts[pts.length - 1];
      const sprite = this.sprites[c.palette.spriteKey] ?? this.sprites.gold;
      if (sprite) {
        ctx.globalAlpha = 0.95;
        ctx.drawImage(sprite, head.x - 42, head.y - 42, 84, 84);
      }

      // 3. Spinning 2D-faceted gemstone crystal
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(c.spin);

      const r = 13.5;
      // Outer diamond silhouette
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.lineTo(r * 0.92, 0);
      ctx.lineTo(0, r * 1.25);
      ctx.lineTo(-r * 0.92, 0);
      ctx.closePath();
      ctx.fillStyle = c.palette.deep;
      ctx.fill();

      // Upper-left bright facet
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.lineTo(0, 0);
      ctx.lineTo(-r * 0.92, 0);
      ctx.closePath();
      ctx.fillStyle = c.palette.core;
      ctx.fill();

      // Upper-right luminous mid facet
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.lineTo(r * 0.92, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = c.palette.prism;
      ctx.fill();

      // Lower-left mid facet
      ctx.beginPath();
      ctx.moveTo(-r * 0.92, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, r * 1.25);
      ctx.closePath();
      ctx.fillStyle = c.palette.mid;
      ctx.fill();

      // Crisp golden-white bezel edge
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25);
      ctx.lineTo(r * 0.92, 0);
      ctx.lineTo(0, r * 1.25);
      ctx.lineTo(-r * 0.92, 0);
      ctx.closePath();
      ctx.strokeStyle = '#fff9df';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Specular 4-point star glint across the gemstone
      ctx.globalCompositeOperation = 'lighter';
      traceFourPointStar(ctx, -2, -3, 14, 2.2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  private renderFoilConfetti(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < this.confetti.length; i++) {
      const p = this.confetti[i];
      const t = clamp(p.age / p.life, 0, 1);
      const alpha = t < 0.78 ? 1 : 1 - (t - 0.78) / 0.22;
      if (alpha <= 0.01) continue;

      const cosTilt = Math.cos(p.tilt);
      const scaleY = Math.max(0.18, Math.abs(cosTilt));
      // Foil catches overhead spotlights sharply at near-normal angle while letting jewel hues shine
      const specularHit = Math.abs(cosTilt) > 0.94;
      const fillHex = specularHit
        ? p.lightHex
        : cosTilt >= 0
          ? p.baseHex
          : p.darkHex;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(1, scaleY);

      ctx.fillStyle = fillHex;
      if (p.shape === 'diamond') {
        const hw = p.width * 0.62;
        const hh = p.height * 0.55;
        ctx.beginPath();
        ctx.moveTo(0, -hh);
        ctx.lineTo(hw, 0);
        ctx.lineTo(0, hh);
        ctx.lineTo(-hw, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        // Slightly curved metallic celebration ribbon
        const hw = p.width * 0.45;
        const hh = p.height * 0.52;
        ctx.beginPath();
        ctx.moveTo(-hw, -hh);
        ctx.quadraticCurveTo(hw * 0.7, 0, -hw * 0.6, hh);
        ctx.lineTo(hw, hh);
        ctx.quadraticCurveTo(hw * 1.4, 0, hw * 0.7, -hh);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-p.width * 0.5, -p.height * 0.5, p.width, p.height);
      }

      if (specularHit) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private renderSparks(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = 0; i < this.sparks.length; i++) {
      const s = this.sparks[i];
      const t = clamp(s.age / s.life, 0, 1);
      const alpha = 1 - t * t;
      if (alpha <= 0.015) continue;

      if (s.mode === 'prism_star' || s.mode === 'gold_glint') {
        const pulse = 0.6 + 0.4 * Math.sin(s.twinklePhase);
        const r = s.size * (1.2 - t * 0.55) * (0.85 + 0.35 * pulse);
        ctx.globalAlpha = clamp(alpha * pulse, 0, 1);
        traceFourPointStar(ctx, s.x, s.y, r * 1.85, r * 0.36);
        ctx.fillStyle = s.colorHex;
        ctx.fill();

        traceFourPointStar(ctx, s.x, s.y, r * 0.95, r * 0.22);
        ctx.fillStyle = s.coreHex;
        ctx.fill();
        continue;
      }

      // Physical velocity-streaked hot sparks (white-hot -> gold -> ember orange)
      const dx = s.x - s.prevX;
      const dy = s.y - s.prevY;
      const tailMult = s.mode === 'hot_metal' ? 3.8 : 2.8;
      const tailX = s.x - dx * tailMult;
      const tailY = s.y - dy * tailMult;

      let outerColor = s.colorHex;
      if (s.mode === 'hot_metal') {
        outerColor =
          t < 0.24 ? '#fff6cc' : t < 0.58 ? '#ffc93c' : t < 0.82 ? '#ff6d1c' : '#cf2e0a';
      }

      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.strokeStyle = outerColor;
      ctx.lineWidth = s.size * (1.35 - t * 0.55);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      // White-hot spark tip during first 60% of life
      if (t < 0.6) {
        ctx.strokeStyle = s.coreHex;
        ctx.lineWidth = Math.max(0.9, s.size * 0.52);
        ctx.beginPath();
        ctx.moveTo(lerp(tailX, s.x, 0.5), lerp(tailY, s.y, 0.5));
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private renderKineticStamps(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (let i = 0; i < this.stamps.length; i++) {
      const st = this.stamps[i];
      const t = clamp(st.age / st.life, 0, 1);

      // Balatro-style elastic slam entrance + impact micro-wobble + clean exit
      let scale = 1;
      let alpha = 1;
      let wobble = 0;

      if (this.reducedMotion) {
        scale = t < 0.15 ? lerp(0.9, 1, easeOutCubic(t / 0.15)) : 1;
        alpha = t > 0.78 ? 1 - (t - 0.78) / 0.22 : 1;
      } else {
        if (st.age < 0.14) {
          const p = st.age / 0.14;
          scale = lerp(2.25, 1.0, easeOutBack(p, 1.35));
          alpha = clamp(p * 2.2, 0, 1);
        } else if (t > 0.74) {
          const p = (t - 0.74) / 0.26;
          scale = lerp(1.0, 1.14, easeInOutCubic(p));
          alpha = 1 - p;
        } else {
          const settleT = clamp((st.age - 0.14) / 0.26, 0, 1);
          wobble = Math.sin(settleT * Math.PI * 5) * 0.08 * (1 - settleT);
        }
      }

      if (alpha <= 0.01) continue;

      const compact = this.width < 460;
      const hw = compact ? 92 : 114;
      const hh = compact ? 34 : 41;

      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.translate(st.x, st.y);
      ctx.rotate(st.tiltRad + wobble);
      ctx.scale(scale, scale);

      // 1. Subtle radial starburst spikes behind the stamp
      if (st.age < 0.55) {
        const burstAlpha = clamp(1 - st.age / 0.55, 0, 1) * 0.65;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = st.byPlayer
          ? `rgba(255, 194, 72, ${burstAlpha.toFixed(3)})`
          : `rgba(255, 62, 82, ${burstAlpha.toFixed(3)})`;
        const spikes = 12;
        ctx.beginPath();
        for (let k = 0; k < spikes * 2; k++) {
          const a = (k / (spikes * 2)) * Math.PI * 2;
          const rx = k % 2 === 0 ? hw * 1.28 : hw * 0.92;
          const ry = k % 2 === 0 ? hh * 1.55 : hh * 1.02;
          const px = Math.cos(a) * rx;
          const py = Math.sin(a) * ry;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 2. Sculpted drop shadow & beveled burnished-brass octagon plaque
      ctx.save();
      ctx.translate(0, 5);
      traceOctagonBadge(ctx, hw + 4, hh + 4, 14);
      ctx.fillStyle = 'rgba(10, 4, 8, 0.72)';
      ctx.fill();
      ctx.restore();

      const outerBrass = ctx.createLinearGradient(-hw, -hh, hw, hh);
      outerBrass.addColorStop(0, '#fff2b0');
      outerBrass.addColorStop(0.28, '#f0ba40');
      outerBrass.addColorStop(0.55, '#965d0d');
      outerBrass.addColorStop(0.8, '#ffdc75');
      outerBrass.addColorStop(1, '#7a4708');
      traceOctagonBadge(ctx, hw + 3, hh + 3, 13);
      ctx.fillStyle = outerBrass;
      ctx.fill();

      // Inner crimson enamel plate
      const crimsonFill = ctx.createLinearGradient(0, -hh, 0, hh);
      crimsonFill.addColorStop(0, st.byPlayer ? '#cc1836' : '#a80f2b');
      crimsonFill.addColorStop(0.5, st.byPlayer ? '#8c0c22' : '#6e081b');
      crimsonFill.addColorStop(1, '#470411');
      traceOctagonBadge(ctx, hw - 2.5, hh - 2.5, 11);
      ctx.fillStyle = crimsonFill;
      ctx.fill();

      // Inner gold pinstripe border
      traceOctagonBadge(ctx, hw - 6, hh - 6, 9);
      ctx.strokeStyle = 'rgba(255, 224, 128, 0.75)';
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // Four brass corner rivets
      const rivetOffsets: Array<[number, number]> = [
        [-hw + 14, -hh + 11],
        [hw - 14, -hh + 11],
        [-hw + 14, hh - 11],
        [hw - 14, hh - 11],
      ];
      for (let k = 0; k < rivetOffsets.length; k++) {
        const [rx, ry] = rivetOffsets[k];
        ctx.fillStyle = '#ffdf7e';
        ctx.beginPath();
        ctx.arc(rx, ry, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Embossed "SCREWED!" metallic gold display text
      const titlePx = compact ? 24 : 30;
      ctx.font = `800 ${titlePx}px ${DISPLAY_FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = 'rgba(26, 4, 8, 0.9)';
      ctx.fillText(st.title, 0, -2.5);

      const textGrad = ctx.createLinearGradient(0, -titlePx * 0.55, 0, titlePx * 0.55);
      textGrad.addColorStop(0, '#fffce8');
      textGrad.addColorStop(0.45, '#ffd866');
      textGrad.addColorStop(1, '#e89522');
      ctx.fillStyle = textGrad;
      ctx.fillText(st.title, 0, -5);

      // Subtle tracked brass subtitle
      ctx.font = `700 ${compact ? 9.5 : 10.5}px ${UI_FONT_STACK}`;
      ctx.fillStyle = '#ffe5a8';
      ctx.fillText(st.subtitle, 0, hh - (compact ? 11 : 13));

      // 4. Specular diagonal light sheen sweeping across the stamp
      const sheenT = (st.age - 0.18) / 0.42;
      if (sheenT > 0 && sheenT < 1) {
        ctx.save();
        traceOctagonBadge(ctx, hw - 2.5, hh - 2.5, 11);
        ctx.clip();
        const sx = lerp(-hw * 1.4, hw * 1.4, sheenT);
        const sheenGrad = ctx.createLinearGradient(sx - 28, -hh, sx + 28, hh);
        sheenGrad.addColorStop(0, 'rgba(255,255,255,0)');
        sheenGrad.addColorStop(0.5, 'rgba(255,250,220,0.48)');
        sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sheenGrad;
        ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private renderJackpotMarquees(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    for (let i = 0; i < this.jackpots.length; i++) {
      const jp = this.jackpots[i];
      const t = clamp(jp.age / jp.duration, 0, 1);

      let scale = 1;
      let alpha = 1;
      let slideY = 0;

      if (this.reducedMotion) {
        alpha = t < 0.12 ? t / 0.12 : t > 0.8 ? 1 - (t - 0.8) / 0.2 : 1;
      } else if (jp.age < 0.26) {
        const p = jp.age / 0.26;
        scale = lerp(0.58, 1.0, easeOutBack(p, 1.5));
        alpha = clamp(p * 1.8, 0, 1);
        slideY = lerp(-24, 0, easeOutCubic(p));
      } else if (t > 0.78) {
        const p = (t - 0.78) / 0.22;
        scale = lerp(1.0, 1.06, easeInOutCubic(p));
        alpha = 1 - p;
        slideY = lerp(0, -18, easeInOutCubic(p));
      }

      if (alpha <= 0.01) continue;

      const compact = this.width < 520;
      const bannerW = clamp(this.width - 44, 268, compact ? 342 : 540);
      const bannerH = jp.pointsText ? (compact ? 82 : 96) : compact ? 60 : 72;
      const hw = bannerW * 0.5;
      const hh = bannerH * 0.5;
      const cx = this.width * 0.5;
      const cy = clamp(this.height * 0.28, 86, 240) + slideY;

      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // 1. Sculpted outer shadow
      ctx.save();
      ctx.translate(0, 7);
      traceOctagonBadge(ctx, hw + 5, hh + 5, 18);
      ctx.fillStyle = 'rgba(4, 10, 22, 0.74)';
      ctx.fill();
      ctx.restore();

      // 2. Heavy metallic double-beveled brass marquee bezel + art-deco winged tips
      const bezelGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      bezelGrad.addColorStop(0, '#fff5bd');
      bezelGrad.addColorStop(0.22, '#f5c245');
      bezelGrad.addColorStop(0.5, '#9e660f');
      bezelGrad.addColorStop(0.78, '#ffe07a');
      bezelGrad.addColorStop(1, '#824d09');

      // Pointed stage side-wings flanking left & right edges (fit cleanly inside viewport)
      const wingReach = compact ? 10 : 18;
      for (const side of [-1, 1] as const) {
        ctx.beginPath();
        ctx.moveTo(side * (hw - 2), -hh * 0.42);
        ctx.lineTo(side * (hw + wingReach), 0);
        ctx.lineTo(side * (hw - 2), hh * 0.42);
        ctx.closePath();
        ctx.fillStyle = bezelGrad;
        ctx.fill();
        ctx.strokeStyle = '#3b2104';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      traceOctagonBadge(ctx, hw + 4, hh + 4, 17);
      ctx.fillStyle = bezelGrad;
      ctx.fill();

      // 3. Royal emerald-obsidian stage marquee face
      const faceGrad = ctx.createLinearGradient(0, -hh, 0, hh);
      faceGrad.addColorStop(0, '#0f3d30');
      faceGrad.addColorStop(0.5, '#07241e');
      faceGrad.addColorStop(1, '#041413');
      traceOctagonBadge(ctx, hw - 4, hh - 4, 14);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      // Inner gold pinstripe
      traceOctagonBadge(ctx, hw - 9, hh - 9, 11);
      ctx.strokeStyle = 'rgba(255, 222, 118, 0.72)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 4. Chasing warm theater marquee bulbs along top & bottom bezels
      const bulbCols = compact ? 10 : 14;
      const chaseIdx = Math.floor(jp.age * 10);
      for (let b = 0; b < bulbCols; b++) {
        const bx = lerp(-hw + 22, hw - 22, b / (bulbCols - 1));
        for (let row = 0; row < 2; row++) {
          const by = row === 0 ? -hh + 1.5 : hh - 1.5;
          const lit = this.reducedMotion || (b + row + chaseIdx) % 2 === 0;
          ctx.fillStyle = lit ? '#fff8d4' : '#9c6e1c';
          ctx.beginPath();
          ctx.arc(bx, by, lit ? 2.6 : 1.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Metallic gold marquee typography (always 100% inside banner width)
      const hasPoints = jp.pointsText.length > 0;
      const headSize = compact ? 18 : 26;
      ctx.font = `800 ${headSize}px ${DISPLAY_FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const headY = hasPoints ? (compact ? -13 : -16) : 0;
      const maxTextW = bannerW - 44;

      // Carved dark shadow
      ctx.fillStyle = 'rgba(3, 12, 10, 0.92)';
      ctx.fillText(jp.headline, 0, headY + 2.5, maxTextW);

      const goldTextGrad = ctx.createLinearGradient(0, headY - headSize * 0.5, 0, headY + headSize * 0.5);
      goldTextGrad.addColorStop(0, '#fffce6');
      goldTextGrad.addColorStop(0.42, '#ffd966');
      goldTextGrad.addColorStop(0.85, '#e89e24');
      goldTextGrad.addColorStop(1, '#fff0ad');
      ctx.fillStyle = goldTextGrad;
      ctx.fillText(jp.headline, 0, headY, maxTextW);

      if (hasPoints) {
        const ptsSize = compact ? 20 : 25;
        ctx.font = `800 ${ptsSize}px ${DISPLAY_FONT_STACK}`;
        const ptsY = compact ? 15 : 18;

        ctx.fillStyle = 'rgba(3, 12, 10, 0.9)';
        ctx.fillText(jp.pointsText, 0, ptsY + 2, maxTextW);

        ctx.fillStyle = '#fff5c7';
        ctx.fillText(jp.pointsText, 0, ptsY, maxTextW);
      }

      // 6. Sweeping diagonal specular sheen across the marquee
      const sheenCycle = (jp.age * 1.15) % 1.4;
      if (!this.reducedMotion && sheenCycle < 0.75) {
        ctx.save();
        traceOctagonBadge(ctx, hw - 4, hh - 4, 14);
        ctx.clip();
        const sx = lerp(-hw * 1.3, hw * 1.3, sheenCycle / 0.75);
        const sheen = ctx.createLinearGradient(sx - 44, -hh, sx + 44, hh);
        sheen.addColorStop(0, 'rgba(255,255,255,0)');
        sheen.addColorStop(0.5, 'rgba(255,248,206,0.34)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sheen;
        ctx.fillRect(-hw, -hh, bannerW, bannerH);
        ctx.restore();
      }

      // 7. Twinkling star glints at marquee corners
      if (!this.reducedMotion) {
        ctx.globalCompositeOperation = 'lighter';
        const glintPulse = 0.65 + 0.35 * Math.sin(jp.age * 11);
        ctx.fillStyle = `rgba(255, 250, 214, ${(0.9 * glintPulse).toFixed(3)})`;
        traceFourPointStar(ctx, -hw + 14, -hh + 14, 13 * glintPulse, 2.2);
        ctx.fill();
        traceFourPointStar(ctx, hw - 14, hh - 14, 11 * (1.3 - glintPulse * 0.4), 2.0);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

export function createStageVfxCanvasV5(): StageVfxCanvasV5 {
  return new StageVfxCanvasV5();
}

export default StageVfxCanvasV5;
