// ============================================================================
// WORLD'S SMARTEST v6.0 — Interactive Zero-Scroll Toy Stage Renderer A
// Renders Toys 001–050 across Families I–V:
//   I.   DEFUSAL_ELIMINATION       (001–010) — Snip/Smash/Drop/Flip 3 Wrongs + Live Sparks
//   II.  ATLAS_RELIEF_SPATIAL      (011–020) — Live 4K Three.js Shaded-Relief Globe
//   III. DIALS_CRYPTEX_LOCKS       (021–030) — 3D Brass Cryptex, Vault Dial, 270° Tacho, Caliper
//   IV.  RAPID_PADDLES_REFLEX      (031–040) — Dual Spring Paddles, Pistons, Chicken, Conveyor
//   V.   PROGRESSIVE_AUDIO_REVEAL  (041–050) — 4-Clue Jackpot, Iris, Redaction, Darkroom, Year-Vise
//
// ZERO-SCROLL LAW:
//   - Portrait (360x640..430x932 / Tablet): Top Prompt Header <= 22% | Tactile Gadget 78%
//   - Landscape Phone (660x340 / 844x390): Automatic Split-Stage (38.5% Left Prompt / 61.5% Right Gadget)
//   - Native OS Retina flat DOM typography (zero SVG text blur, zero glass-blur CSS, zero native sliders, zero emojis)
// ============================================================================

import type {
  CalibratedClueV6,
  FoilTrickCardV6,
  FoleySfxIdV6,
  GeoCoordV6,
  StageAtmosphereThemeV6,
  ToyDefinitionV6,
  ToyResolutionV6,
} from '../contracts_v6';
import {
  AtlasReliefGlobe3DV6,
  computeAntipode,
  computeBearingDeg,
  formatCoordShort,
  haversineDistanceKm,
  type GeoPointV6,
} from './AtlasReliefGlobe3DV6';
import {
  TOY_CATALOG_001_TO_050,
  getToySpec001To050ById,
  getToySpec001To050ByNumber,
  type ToySpec001To050V6,
} from './ToyCatalog001To050';

export type ToyFoilAssistKindV6 = 'DEFUSE_ONE_WIRE' | 'REVEAL_HINT' | 'ADD_TIME';

export interface ToyStageMountOptionsV6 {
  /** Active Stage World palette so every toy harmonizes with Stages 01–10. */
  stageTheme?: StageAtmosphereThemeV6;
  /** Optional timer override (seconds). */
  timeLimitSeconds?: number;
  /** Optional bonus seconds added onto baseSeconds (compatible with UnifiedToyManagerV6). */
  timerBonusSeconds?: number;
  /** Base chips awarded on full accuracy before relic multipliers (default 400). */
  baseChips?: number;
  /** Optional active rival display name. */
  rivalName?: string;
  /** Optional custom base URL for 4K globe textures. */
  globeTextureBasePath?: string;
  /** Plays canonical Horology Foley SFX via StudioAudioEngineV6. */
  onPlayFoley?: (sfx: FoleySfxIdV6) => void;
  /** Alias for onPlayFoley (direct UnifiedToyManagerV6 compatibility). */
  onSfx?: (sfx: FoleySfxIdV6) => void;
  /** Optional callback when player triggers a hint assist. */
  onHintUsed?: () => void;
  /** Mid-toy interactive hook for Frankie/Julian reactive broadcast quips. */
  onInterimAction?: (actionTag: string, detail?: string) => void;
  /** Fires exactly once when the toy finishes (win, miss, or timeout). */
  onResolve: (result: ToyResolutionV6) => void;
}

export interface ToyStageHandleV6 {
  readonly toyId: string;
  readonly toyNumber: number;
  readonly toySpec: ToyDefinitionV6;
  /** Reveals a diegetic hint or locks one cryptex ring. */
  triggerHint(): void;
  /** Direct FoilTrickCardV6 handler (compatible with UnifiedToyManagerV6). */
  applyFoilEffect(effectKind: FoilTrickCardV6['effectKind']): boolean;
  /** Shorthand assist hook for Foil Dirty-Trick Cards. */
  applyFoilAssist(kind: ToyFoilAssistKindV6): boolean;
  /** Gracefully expires the shot clock and resolves immediately. */
  forceTimeout(): void;
  /** Live remaining seconds on the shot clock. */
  getSecondsRemaining(): number;
  /** Zero-leak disposal of WebGL globe, Canvas2D spark loop, timers, and listeners. */
  dispose(): void;
}

// ============================================================================
// UTILITY HELPERS (ZERO COMMAS IN 4-DIGIT YEARS, SAFE HTML, WORLD GAZETTEER)
// ============================================================================

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function formatStageNumber(val: number, unit = '', isYearHint = false): string {
  const safe = Number.isFinite(val) ? val : 0;
  const cleanUnit = unit.trim();
  const looksYear =
    isYearHint ||
    ((cleanUnit === '' || /^(ce|ad|yr|year)$/i.test(cleanUnit)) &&
      Number.isInteger(safe) &&
      safe >= 500 &&
      safe <= 2200);
  const numStr = looksYear
    ? String(Math.round(safe))
    : Number.isInteger(safe)
      ? safe.toLocaleString('en-US')
      : Number(safe.toFixed(1)).toLocaleString('en-US');
  if (!cleanUnit) return numStr;
  if (cleanUnit === '%' || cleanUnit === '°' || cleanUnit === '°C' || cleanUnit === '°F') {
    return `${numStr}${cleanUnit}`;
  }
  return `${numStr} ${cleanUnit}`;
}

/** Deterministic integer hash for stable clue-driven layouts (no jitter on re-render). */
function stableHash(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Curated real-world landmarks fallback when a non-geo clue gets routed to a Family II Atlas toy. */
const FALLBACK_LANDMARKS: ReadonlyArray<GeoCoordV6 & { keywords: readonly string[] }> = [
  { lat: 48.8566, lng: 2.3522, regionHint: 'Western Europe', landmarkLabel: 'Paris, France', keywords: ['paris', 'france', 'eiffel', 'louvre', 'seine', 'napoleon'] },
  { lat: 51.5074, lng: -0.1278, regionHint: 'British Isles', landmarkLabel: 'London, UK', keywords: ['london', 'uk', 'britain', 'england', 'thames', 'shakespeare', 'big ben'] },
  { lat: 41.9028, lng: 12.4964, regionHint: 'Mediterranean', landmarkLabel: 'Rome, Italy', keywords: ['rome', 'italy', 'colosseum', 'vatican', 'caesar', 'renaissance', 'venice'] },
  { lat: 37.9838, lng: 23.7275, regionHint: 'Aegean Sea', landmarkLabel: 'Athens, Greece', keywords: ['athens', 'greece', 'parthenon', 'olympus', 'sparta', 'zeus', 'homer'] },
  { lat: 30.0444, lng: 31.2357, regionHint: 'North Africa', landmarkLabel: 'Cairo, Egypt', keywords: ['cairo', 'egypt', 'nile', 'pyramid', 'giza', 'pharaoh', 'cleopatra'] },
  { lat: 35.6762, lng: 139.6503, regionHint: 'East Asia', landmarkLabel: 'Tokyo, Japan', keywords: ['tokyo', 'japan', 'fuji', 'kyoto', 'samurai', 'nintendo', 'sushi'] },
  { lat: 39.9042, lng: 116.4074, regionHint: 'East Asia', landmarkLabel: 'Beijing, China', keywords: ['beijing', 'china', 'great wall', 'shanghai', 'yangtze', 'dynasty'] },
  { lat: 27.1751, lng: 78.0421, regionHint: 'South Asia', landmarkLabel: 'Agra, India', keywords: ['india', 'taj mahal', 'delhi', 'mumbai', 'ganges', 'himalaya', 'everest'] },
  { lat: 40.7128, lng: -74.006, regionHint: 'North America', landmarkLabel: 'New York, USA', keywords: ['new york', 'usa', 'america', 'manhattan', 'liberty', 'broadway', 'hollywood'] },
  { lat: 38.9072, lng: -77.0369, regionHint: 'North America', landmarkLabel: 'Washington, D.C.', keywords: ['washington', 'lincoln', 'president', 'congress', 'nasa', 'apollo'] },
  { lat: -22.9068, lng: -43.1729, regionHint: 'South America', landmarkLabel: 'Rio de Janeiro, Brazil', keywords: ['brazil', 'rio', 'amazon', 'samba', 'andes', 'machu picchu', 'peru'] },
  { lat: -33.8688, lng: 151.2093, regionHint: 'Oceania', landmarkLabel: 'Sydney, Australia', keywords: ['australia', 'sydney', 'outback', 'reef', 'kangaroo', 'zealand'] },
  { lat: 46.2044, lng: 6.1432, regionHint: 'Central Europe', landmarkLabel: 'Geneva, Switzerland', keywords: ['switzerland', 'geneva', 'alps', 'cern', 'zurich', 'watch'] },
  { lat: 43.7384, lng: 7.4246, regionHint: 'French Riviera', landmarkLabel: 'Monte Carlo, Monaco', keywords: ['monaco', 'monte carlo', 'casino', 'riviera'] },
  { lat: 64.1466, lng: -21.9426, regionHint: 'North Atlantic', landmarkLabel: 'Reykjavik, Iceland', keywords: ['iceland', 'reykjavik', 'viking', 'nordic', 'norway', 'sweden', 'aurora'] },
  { lat: -1.2921, lng: 36.8219, regionHint: 'East Africa', landmarkLabel: 'Nairobi, Kenya', keywords: ['africa', 'kenya', 'kilimanjaro', 'serengeti', 'sahara', 'safari'] },
  { lat: 19.4326, lng: -99.1332, regionHint: 'Mesoamerica', landmarkLabel: 'Mexico City, Mexico', keywords: ['mexico', 'aztec', 'maya', 'chichen', 'taco'] },
  { lat: 55.7558, lng: 37.6173, regionHint: 'Eurasia', landmarkLabel: 'Moscow, Russia', keywords: ['russia', 'moscow', 'kremlin', 'siberia', 'tchaikovsky'] },
  { lat: 41.0082, lng: 28.9784, regionHint: 'Anatolia', landmarkLabel: 'Istanbul, Turkey', keywords: ['istanbul', 'turkey', 'ottoman', 'bosporus', 'constantinople'] },
  { lat: 11.3733, lng: 142.5917, regionHint: 'Western Pacific', landmarkLabel: 'Mariana Trench', keywords: ['mariana', 'trench', 'pacific', 'challenger', 'ocean', 'deep'] },
];

const OCEAN_BASIN_PRESETS: ReadonlyArray<{ name: string; lat: number; lng: number; depthM: number }> = [
  { name: 'Mariana Trench', lat: 11.37, lng: 142.59, depthM: 10984 },
  { name: 'Puerto Rico Trench', lat: 19.7, lng: -66.5, depthM: 8376 },
  { name: 'Java Trench', lat: -10.3, lng: 109.9, depthM: 7290 },
  { name: 'South Sandwich Trench', lat: -55.4, lng: -25.9, depthM: 8266 },
];

const MOUNTAIN_PEAK_PRESETS: ReadonlyArray<{ name: string; lat: number; lng: number; elevM: number }> = [
  { name: 'Mount Everest (Himalayas)', lat: 27.988, lng: 86.925, elevM: 8849 },
  { name: 'Aconcagua (Andes)', lat: -32.653, lng: -70.011, elevM: 6961 },
  { name: 'Denali (Alaska Range)', lat: 63.069, lng: -151.007, elevM: 6190 },
  { name: 'Kilimanjaro (East Africa)', lat: -3.067, lng: 37.355, elevM: 5895 },
];

function resolveGeoTargetForClue(clue: CalibratedClueV6): GeoCoordV6 {
  if (
    clue.geoTarget &&
    Number.isFinite(clue.geoTarget.lat) &&
    Number.isFinite(clue.geoTarget.lng)
  ) {
    return clue.geoTarget;
  }
  const blob = `${clue.prompt} ${clue.choices[clue.correctIndex] ?? ''} ${clue.categoryLabel}`.toLowerCase();
  for (const lm of FALLBACK_LANDMARKS) {
    if (lm.keywords.some((kw) => blob.includes(kw))) {
      return { lat: lm.lat, lng: lm.lng, regionHint: lm.regionHint, landmarkLabel: lm.landmarkLabel };
    }
  }
  const pick = FALLBACK_LANDMARKS[stableHash(`${clue.qid}:${clue.prompt}`) % FALLBACK_LANDMARKS.length];
  return { lat: pick.lat, lng: pick.lng, regionHint: pick.regionHint, landmarkLabel: pick.landmarkLabel };
}

function resolveCryptexWordForClue(clue: CalibratedClueV6): string {
  if (clue.cryptexWord) {
    const clean = clue.cryptexWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length >= 4 && clean.length <= 8) return clean;
  }
  const answer = clue.choices[clue.correctIndex] ?? 'GOLD';
  const words = answer
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && w.length <= 8);
  if (words.length > 0) return words[0];
  const compact = answer.toUpperCase().replace(/[^A-Z]/g, '');
  if (compact.length >= 4) return compact.slice(0, Math.min(7, compact.length));
  return (compact + 'ATLAS').slice(0, 5);
}

function resolveNumericSpecForClue(clue: CalibratedClueV6): {
  target: number;
  min: number;
  max: number;
  unit: string;
  isYear: boolean;
} {
  if (typeof clue.numericTarget === 'number' && Number.isFinite(clue.numericTarget)) {
    const target = clue.numericTarget;
    const min =
      typeof clue.numericMin === 'number' && clue.numericMin < target
        ? clue.numericMin
        : Math.floor(target - Math.max(25, Math.abs(target) * 0.25));
    const max =
      typeof clue.numericMax === 'number' && clue.numericMax > target
        ? clue.numericMax
        : Math.ceil(target + Math.max(25, Math.abs(target) * 0.25));
    const unit = clue.numericUnit ?? '';
    const isYear =
      (unit === '' || /^(ce|ad|year)$/i.test(unit)) &&
      Number.isInteger(target) &&
      target >= 1000 &&
      target <= 2150;
    return { target, min, max, unit, isYear };
  }
  // Extract a year or integer from the correct answer if present
  const ans = clue.choices[clue.correctIndex] ?? '';
  const numMatch = /\b(\d{1,5})\b/.exec(ans.replace(/,/g, ''));
  if (numMatch) {
    const target = Number(numMatch[1]);
    const isYear = target >= 1000 && target <= 2150;
    const span = isYear ? 60 : Math.max(20, Math.round(target * 0.45));
    return {
      target,
      min: isYear ? Math.max(1000, target - span) : Math.max(0, target - span),
      max: isYear ? Math.min(2030, target + span) : target + span,
      unit: isYear ? '' : '',
      isYear,
    };
  }
  // Graceful fallback: map 4-choice index to 1..400 numeric target scale or 1969 fallback
  const fallbackTarget = 1920 + ((stableHash(`${clue.qid}`) % 100));
  return { target: fallbackTarget, min: 1900, max: 2025, unit: '', isYear: true };
}

function resolveProgressiveHints(clue: CalibratedClueV6): [string, string, string, string] {
  if (clue.progressiveHints && clue.progressiveHints.length === 4) {
    return clue.progressiveHints;
  }
  const ans = clue.choices[clue.correctIndex] ?? '';
  const firstLetter = ans.trim().charAt(0).toUpperCase() || 'A';
  const words = ans.trim().split(/\s+/).length;
  const wrongA = clue.choices.find((_, i) => i !== clue.correctIndex) ?? 'a rival choice';
  return [
    `Domain dossier: ${clue.categoryLabel}${clue.subcategoryLabel ? ` — ${clue.subcategoryLabel}` : ''}.`,
    `Intel confirm: NOT "${wrongA}".`,
    `Structure check: ${words === 1 ? 'Single word' : `${words} words`}, ${ans.length} characters.`,
    `Final lock: Begins with "${firstLetter}..."`,
  ];
}

function resolveBinaryPairForClue(clue: CalibratedClueV6): {
  optionA: string;
  optionB: string;
  items: Array<{ text: string; bucket: 0 | 1 }>;
} {
  if (clue.binaryPair && clue.binaryPair.items.length >= 2) {
    return {
      optionA: clue.binaryPair.optionA,
      optionB: clue.binaryPair.optionB,
      items: clue.binaryPair.items.slice(0, 5),
    };
  }
  const truth = clue.choices[clue.correctIndex] ?? 'Correct';
  const decoys = clue.choices.filter((_, i) => i !== clue.correctIndex);
  const items: Array<{ text: string; bucket: 0 | 1 }> = [
    { text: truth, bucket: 0 },
    ...(decoys.slice(0, 3).map((d) => ({ text: d, bucket: 1 as const }))),
  ];
  // Deterministic interleave so truth isn't always first
  const seed = stableHash(`${clue.qid}:bin`);
  const ordered = [...items].sort(
    (a, b) => (stableHash(`${seed}:${a.text}`) % 97) - (stableHash(`${seed}:${b.text}`) % 97),
  );
  return {
    optionA: 'MATCHES CLUE',
    optionB: 'DECOY',
    items: ordered,
  };
}

function ensureFourChoices(clue: CalibratedClueV6): { choices: string[]; correctIndex: number } {
  const choices = [...clue.choices];
  while (choices.length < 4) {
    choices.push(`Option ${String.fromCharCode(65 + choices.length)}`);
  }
  const idx = clamp(clue.correctIndex, 0, choices.length - 1);
  return { choices: choices.slice(0, 4), correctIndex: idx };
}

// ============================================================================
// LIVE CANVAS2D PHYSICAL SPARK & SHARD FX ENGINE (NON-BLOCKING OVERLAY)
// ============================================================================

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  gravity: number;
  kind: 'SPARK' | 'SHARD' | 'SMOKE' | 'RING';
}

class StageParticleOverlay {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly particles: SparkParticle[] = [];
  private rafId = 0;
  private lastMs = 0;
  private disposed = false;

  constructor(host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'v6ta-fx-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  public resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(10, parent.clientWidth);
    const h = Math.max(10, parent.clientHeight);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  public burstAtElement(
    el: HTMLElement,
    kind: SparkParticle['kind'] = 'SPARK',
    colors: readonly string[] = ['#ffd76e', '#ff9436', '#ffffff'],
    count = 22,
  ): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const cx = er.left - pr.left + er.width * 0.5;
    const cy = er.top - pr.top + er.height * 0.5;
    this.burst(cx, cy, kind, colors, count);
  }

  public burst(
    x: number,
    y: number,
    kind: SparkParticle['kind'] = 'SPARK',
    colors: readonly string[] = ['#ffd76e', '#ff9436', '#ffffff'],
    count = 22,
  ): void {
    if (this.disposed) return;
    this.resize();
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const spd =
        kind === 'SMOKE'
          ? 18 + Math.random() * 34
          : kind === 'SHARD'
            ? 90 + Math.random() * 190
            : 110 + Math.random() * 240;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: kind === 'SMOKE' ? -35 - Math.random() * 55 : Math.sin(ang) * spd - 45,
        size: kind === 'SMOKE' ? 5 + Math.random() * 7 : kind === 'SHARD' ? 3.5 + Math.random() * 4 : 2 + Math.random() * 2.6,
        life: 0,
        maxLife: kind === 'SMOKE' ? 0.85 + Math.random() * 0.4 : 0.45 + Math.random() * 0.35,
        color: colors[i % colors.length],
        gravity: kind === 'SMOKE' ? -24 : 420,
        kind,
      });
    }
    if (kind === 'SPARK' || kind === 'RING') {
      this.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        size: 14,
        life: 0,
        maxLife: 0.38,
        color: colors[0] ?? '#ffd76e',
        gravity: 0,
        kind: 'RING',
      });
    }
    if (!this.rafId) {
      this.lastMs = performance.now();
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private readonly loop = (nowMs: number): void => {
    if (this.disposed) return;
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastMs) / 1000));
    this.lastMs = nowMs;
    const ctx = this.ctx;
    if (!ctx) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      const t = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - t);
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === 'RING') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5 * alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + t * 56, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'SPARK') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.032, p.y - p.vy * 0.032);
        ctx.stroke();
      } else if (p.kind === 'SHARD') {
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 7);
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size * 0.72);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + t * 1.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (this.particles.length > 0) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.rafId = 0;
    }
  };

  public dispose(): void {
    this.disposed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.canvas.remove();
  }
}

// ============================================================================
// SCOPED ZERO-SCROLL ULTRA-HD RETINA STYLES (INJECTED ONCE)
// ============================================================================

const STYLE_ID = 'v6-toy-stage-a-styles';

function ensureStylesInjected(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.v6ta-root {
  --v6ta-accent: #eab95c;
  --v6ta-glow: #4be5a4;
  --v6ta-danger: #ff4a5e;
  --v6ta-surface: rgba(13, 18, 29, 0.96);
  --v6ta-chassis: linear-gradient(160deg, #1b212c 0%, #0b0f17 100%);
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-rows: minmax(0, 22%) minmax(0, 78%);
  background: #070b13;
  color: #f8f4e8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
  box-sizing: border-box;
  user-select: none;
  touch-action: manipulation;
}
.v6ta-root *, .v6ta-root *::before, .v6ta-root *::after {
  box-sizing: border-box;
}
.v6ta-root.is-landscape-split {
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: minmax(195px, 38.5%) minmax(0, 61.5%);
}
@media (orientation: landscape) and (max-height: 540px) {
  .v6ta-root {
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(195px, 38.5%) minmax(0, 61.5%);
  }
}

/* ---------- TOP / LEFT RETINA PROMPT HEADER (<= 22% Portrait / 38.5% Landscape) ---------- */
.v6ta-header {
  position: relative;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(3px, 0.6dvh, 7px);
  padding: clamp(6px, 1dvh, 11px) clamp(10px, 2.2vw, 18px);
  background: linear-gradient(180deg, rgba(16, 22, 35, 0.97) 0%, rgba(10, 14, 24, 0.98) 100%);
  border-bottom: 1px solid rgba(234, 185, 92, 0.34);
  z-index: 4;
}
.v6ta-root.is-landscape-split .v6ta-header {
  justify-content: space-between;
  border-bottom: none;
  border-right: 1px solid rgba(234, 185, 92, 0.34);
  padding: clamp(8px, 2dvh, 14px) clamp(10px, 1.8vw, 16px);
}
.v6ta-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 20px;
  flex-shrink: 0;
}
.v6ta-meta-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.v6ta-cat-tag {
  font-size: clamp(9px, 2vw, 10.5px);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #110d05;
  background: linear-gradient(135deg, #f6d57d 0%, #d29f42 100%);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 118px;
  flex-shrink: 1;
}
.v6ta-callout {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(10px, 2.3vw, 12px);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--v6ta-accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v6ta-nixie-clock {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: clamp(11px, 2.6vw, 14px);
  font-weight: 800;
  color: #ffb957;
  background: #140b06;
  padding: 2px 8px;
  border-radius: 5px;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(255, 148, 42, 0.28);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}
.v6ta-nixie-clock.is-urgent {
  color: #ff5666;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 70, 90, 0.55);
}
.v6ta-prompt {
  margin: 0;
  font-size: clamp(13px, 3.3vw, 17px);
  line-height: 1.25;
  font-weight: 700;
  color: #fffdf7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.v6ta-root.is-landscape-split .v6ta-prompt {
  font-size: clamp(13px, 1.9vw, 17px);
  -webkit-line-clamp: 6;
  line-height: 1.3;
}
.v6ta-tip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 16px;
}
.v6ta-micro-tip {
  font-size: clamp(10.5px, 2.4vw, 12px);
  color: #c2cadb;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v6ta-root.is-landscape-split .v6ta-micro-tip {
  white-space: normal;
  line-height: 1.25;
}
.v6ta-timer-rail {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
}
.v6ta-timer-fill {
  height: 100%;
  width: 100%;
  transform-origin: left center;
  background: linear-gradient(90deg, #4be5a4 0%, #f5cb66 65%, #ff4a5e 100%);
  transition: transform 0.1s linear;
}

/* ---------- DEDICATED 78% / 61.5% TACTILE GADGET STAGE ---------- */
.v6ta-stage {
  position: relative;
  min-height: 0;
  min-width: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--v6ta-chassis);
  display: flex;
  flex-direction: column;
  padding: clamp(8px, 1.3dvh, 14px) clamp(8px, 2vw, 16px);
  gap: clamp(6px, 1dvh, 10px);
}
.v6ta-fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 20;
}

/* ---------- SHARED SCULPTED BRASS / STEEL HARDWARE CONTROLS ---------- */
.v6ta-brass-btn {
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #161006;
  background: linear-gradient(180deg, #fae092 0%, #dca848 52%, #b58027 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65), 0 4px 12px rgba(0, 0, 0, 0.55);
  border-radius: 10px;
  min-height: clamp(38px, 6dvh, 48px);
  padding: 0 16px;
  font-size: clamp(12px, 2.8vw, 15px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.09s ease, filter 0.12s ease;
}
.v6ta-brass-btn:active:not(:disabled) {
  transform: translateY(2px) scale(0.985);
}
.v6ta-brass-btn:disabled {
  opacity: 0.44;
  cursor: not-allowed;
  filter: grayscale(0.45);
}
.v6ta-steel-btn {
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  color: #f8f3e6;
  background: linear-gradient(180deg, #323b4a 0%, #1d232e 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 3px 10px rgba(0, 0, 0, 0.5);
  border-radius: 9px;
  min-height: clamp(36px, 5.5dvh, 46px);
  padding: 6px 12px;
  font-size: clamp(12px, 2.8vw, 14px);
  transition: transform 0.09s ease, background 0.12s ease;
}
.v6ta-steel-btn:active:not(:disabled) {
  transform: translateY(2px) scale(0.98);
}
.v6ta-choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(6px, 1dvh, 10px);
  width: 100%;
  min-height: 0;
}
.v6ta-choice-plaque {
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: clamp(40px, 6.2dvh, 54px);
  padding: 6px 10px;
  border-radius: 10px;
  text-align: left;
  color: #faf6eb;
  font-family: 'Inter', sans-serif;
  font-size: clamp(12px, 2.9vw, 14.5px);
  font-weight: 700;
  line-height: 1.18;
  background: linear-gradient(180deg, #273041 0%, #161c28 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 3px 0 0 var(--v6ta-accent), 0 4px 10px rgba(0, 0, 0, 0.45);
  transition: transform 0.1s ease, background 0.14s ease, box-shadow 0.14s ease;
  overflow: hidden;
}
.v6ta-choice-plaque:active:not(:disabled) {
  transform: scale(0.98);
}
.v6ta-choice-plaque.is-selected {
  background: linear-gradient(180deg, #3c341d 0%, #241d0f 100%);
  box-shadow: inset 0 0 0 1.5px #f5ce74, 0 0 14px rgba(245, 206, 116, 0.3);
}
.v6ta-choice-plaque.is-correct {
  background: linear-gradient(180deg, #164b37 0%, #0d2e22 100%);
  box-shadow: inset 3px 0 0 #4be5a4, 0 0 16px rgba(75, 229, 164, 0.35);
}
.v6ta-choice-plaque.is-wrong {
  background: linear-gradient(180deg, #521a24 0%, #2e0d13 100%);
  box-shadow: inset 3px 0 0 #ff4a5e;
  opacity: 0.72;
}
.v6ta-choice-plaque.is-dimmed {
  opacity: 0.35;
  filter: saturate(0.3);
}
.v6ta-key-badge {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: linear-gradient(180deg, #f3cd76 0%, #b9862d 100%);
  color: #161005;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.v6ta-choice-text {
  min-width: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ---------- FAMILY I: DEFUSAL BRIEFCASE / HAZARDS (Toys 001–010) ---------- */
.v6ta-defusal-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1dvh, 10px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.22) 100%);
  border-radius: 14px;
  padding: clamp(8px, 1.2dvh, 12px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -2px 12px rgba(0, 0, 0, 0.65);
  position: relative;
  overflow: hidden;
}
.v6ta-defusal-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
}
.v6ta-led-strip {
  display: flex;
  align-items: center;
  gap: 6px;
}
.v6ta-led {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #232833;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.9);
  transition: background 0.18s ease, box-shadow 0.18s ease;
}
.v6ta-led.is-safe {
  background: #3ee89e;
  box-shadow: 0 0 10px #3ee89e, inset 0 1px 2px #ffffff;
}
.v6ta-led.is-boom {
  background: #ff3e50;
  box-shadow: 0 0 12px #ff3e50;
}
.v6ta-defusal-counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(11px, 2.5vw, 13px);
  font-weight: 800;
  color: #f4cd74;
  letter-spacing: 0.06em;
}
.v6ta-defusal-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: clamp(6px, 1dvh, 10px);
}
.v6ta-defusal-grid.is-2x2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
}
.v6ta-hazard-item {
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  position: relative;
  min-height: 0;
  width: 100%;
  height: 100%;
  border-radius: 11px;
  padding: 6px 10px;
  color: #fffaf0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  background: linear-gradient(180deg, #2b323f 0%, #171c25 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.52);
  overflow: hidden;
  transition: transform 0.14s ease, opacity 0.2s ease, filter 0.2s ease;
}
.v6ta-hazard-item:active:not(:disabled) {
  transform: scale(0.985);
}
.v6ta-hazard-item.is-eliminated {
  opacity: 0.56;
  background: linear-gradient(180deg, #122720 0%, #0a1712 100%);
  box-shadow: inset 0 0 0 1.5px rgba(72, 232, 162, 0.45);
}
.v6ta-hazard-item.is-truth-survived {
  background: linear-gradient(180deg, #1b5139 0%, #0e3122 100%);
  box-shadow: inset 0 0 0 2px #4be5a4, 0 0 22px rgba(75, 229, 164, 0.45);
}
.v6ta-hazard-item.is-detonated {
  background: linear-gradient(180deg, #691724 0%, #310910 100%);
  box-shadow: inset 0 0 0 2px #ff4757, 0 0 24px rgba(255, 71, 87, 0.6);
}
.v6ta-wire-visual {
  position: relative;
  width: clamp(66px, 18vw, 108px);
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.v6ta-wire-cable {
  width: 100%;
  height: 13px;
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.28) 0px,
    rgba(255, 255, 255, 0.28) 4px,
    rgba(0, 0, 0, 0.34) 4px,
    rgba(0, 0, 0, 0.34) 8px
  );
  box-shadow: inset 0 2px 3px rgba(255, 255, 255, 0.45), 0 4px 8px rgba(0, 0, 0, 0.72);
  transition: transform 0.2s ease, opacity 0.2s ease;
  position: relative;
}
.v6ta-wire-cable::before, .v6ta-wire-cable::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 7px;
  height: 17px;
  border-radius: 2px;
  background: linear-gradient(180deg, #f3ce74 0%, #9b6f22 100%);
}
.v6ta-wire-cable::before { left: -2px; }
.v6ta-wire-cable::after { right: -2px; }
.v6ta-hazard-item.is-eliminated .v6ta-wire-cable {
  background: transparent;
  box-shadow: none;
}
.v6ta-hazard-item.is-eliminated .v6ta-wire-cable::before {
  transform: rotate(-18deg) translateX(-2px);
}
.v6ta-hazard-item.is-eliminated .v6ta-wire-cable::after {
  transform: rotate(18deg) translateX(2px);
}
.v6ta-hazard-label {
  flex: 1;
  min-width: 0;
  font-size: clamp(12.5px, 3.1vw, 15.5px);
  font-weight: 700;
  line-height: 1.18;
  color: #fffdf7;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.v6ta-verb-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(9.5px, 2.2vw, 11px);
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(242, 202, 112, 0.16);
  color: #f5d27a;
  box-shadow: inset 0 0 0 1px rgba(242, 202, 112, 0.36);
  white-space: nowrap;
  flex-shrink: 0;
}
.v6ta-hazard-item.is-eliminated .v6ta-verb-pill {
  background: rgba(62, 232, 158, 0.2);
  color: #56f0aa;
  box-shadow: inset 0 0 0 1px rgba(86, 240, 170, 0.55);
}
.v6ta-hazard-item.is-detonated .v6ta-verb-pill {
  background: rgba(255, 71, 87, 0.25);
  color: #ff808b;
  box-shadow: inset 0 0 0 1px rgba(255, 71, 87, 0.6);
}
/* Candle flame, breaker switch, fuse spark, balloon, trapdoor accents */
.v6ta-prop-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  background: rgba(0, 0, 0, 0.35);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.7);
}
.v6ta-flame {
  width: 14px;
  height: 20px;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 50% 72%, #fff8d6 0%, #ffb73b 55%, #ff541f 100%);
  box-shadow: 0 0 12px #ff9a2e;
  animation: v6ta-flicker 0.6s infinite alternate ease-in-out;
}
.v6ta-hazard-item.is-eliminated .v6ta-flame {
  opacity: 0.14;
  animation: none;
  background: #6c7382;
  box-shadow: none;
  transform: scale(0.5);
}
@keyframes v6ta-flicker {
  from { transform: scaleY(0.92) skewX(-3deg); }
  to { transform: scaleY(1.08) skewX(3deg); }
}
.v6ta-breaker-toggle {
  width: 24px;
  height: 14px;
  border-radius: 7px;
  background: #23d68b;
  position: relative;
  transition: background 0.16s ease;
}
.v6ta-breaker-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff9ec;
  transition: transform 0.16s ease;
}
.v6ta-hazard-item.is-eliminated .v6ta-breaker-toggle {
  background: #3d4554;
}
.v6ta-hazard-item.is-eliminated .v6ta-breaker-toggle::after {
  transform: translateX(-10px);
}
.v6ta-fuse-spark {
  position: absolute;
  right: 4px;
  top: -3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0%, #ffd25a 45%, #ff4518 100%);
  box-shadow: 0 0 14px #ff7b29;
  animation: v6ta-fuse-burn 12s linear forwards;
}
.v6ta-hazard-item.is-eliminated .v6ta-fuse-spark {
  display: none;
}
@keyframes v6ta-fuse-burn {
  from { transform: translateX(0); }
  to { transform: translateX(-54px); }
}

/* ---------- FAMILY II: 3D RELIEF ATLAS STAGE (Toys 011–020) ---------- */
.v6ta-atlas-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.v6ta-globe-viewport {
  flex: 1;
  min-height: 0;
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 45%, #112d4e 0%, #050d1a 78%);
  box-shadow: inset 0 0 0 1px rgba(232, 194, 110, 0.28), inset 0 0 42px rgba(0, 0, 0, 0.65);
}
.v6ta-globe-hud-top {
  position: absolute;
  top: 7px;
  left: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  z-index: 5;
}
.v6ta-coord-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(10px, 2.3vw, 12px);
  font-weight: 700;
  color: #f6d57f;
  background: rgba(8, 15, 28, 0.88);
  padding: 3px 9px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(235, 198, 114, 0.4);
}
.v6ta-atlas-controls {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.v6ta-atlas-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---------- FAMILY III: CRYPTEX / DIALS / CALIPER / MARQUEE (Toys 021–030) ---------- */
.v6ta-cryptex-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: clamp(6px, 1.2dvh, 12px);
  padding: clamp(6px, 1dvh, 12px);
  background: radial-gradient(ellipse at 50% 40%, #2d1f12 0%, #100a06 90%);
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(236, 194, 108, 0.28), inset 0 0 36px rgba(0, 0, 0, 0.72);
}
.v6ta-cryptex-cylinder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 1.1vw, 9px);
  padding: 8px 10px;
  border-radius: 14px;
  background: linear-gradient(180deg, #4b341c 0%, #8f6831 20%, #d4a652 48%, #775321 82%, #34210f 100%);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.7), inset 0 2px 3px rgba(255, 240, 195, 0.45);
  max-width: 100%;
}
.v6ta-cryptex-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: clamp(36px, 10.5vw, 56px);
  border-radius: 9px;
  background: linear-gradient(180deg, #3b2a14 0%, #a57b37 22%, #f4d27e 50%, #99702d 78%, #2d1e0d 100%);
  box-shadow: inset 2px 0 3px rgba(255, 245, 210, 0.35), inset -2px 0 4px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.65);
  overflow: hidden;
  touch-action: none;
  cursor: ns-resize;
}
.v6ta-ring-step {
  appearance: none;
  border: none;
  width: 100%;
  height: clamp(22px, 3.8dvh, 30px);
  background: rgba(18, 12, 5, 0.42);
  color: rgba(255, 232, 178, 0.78);
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(10px, 2.3vw, 12px);
  font-weight: 700;
  cursor: pointer;
}
.v6ta-ring-active {
  width: 100%;
  height: clamp(42px, 7.6dvh, 58px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(20px, 5vw, 30px);
  font-weight: 800;
  color: #160d03;
  text-shadow: 0 1px 0 rgba(255, 245, 210, 0.72);
  box-shadow: inset 0 2px 0 rgba(0, 0, 0, 0.32), inset 0 -2px 0 rgba(0, 0, 0, 0.32);
  background: linear-gradient(180deg, #f8df96 0%, #e1b252 55%, #c59134 100%);
}
.v6ta-dial-arena {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.v6ta-dial-canvas-box {
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v6ta-nixie-big {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(22px, 6vw, 34px);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffbc58;
  background: #140b06;
  padding: 5px 18px;
  border-radius: 10px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.95), 0 0 18px rgba(255, 160, 56, 0.32);
  font-variant-numeric: tabular-nums;
}
.v6ta-custom-rail {
  position: relative;
  width: 100%;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(180deg, #1b222c 0%, #0d1118 100%);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.9), inset 0 0 0 1px rgba(235, 196, 112, 0.35);
  touch-action: none;
  cursor: ew-resize;
  overflow: hidden;
}
.v6ta-custom-rail-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, rgba(235, 190, 96, 0.22), rgba(235, 190, 96, 0.55));
  pointer-events: none;
}
.v6ta-custom-thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 28px;
  margin-left: -14px;
  border-radius: 7px;
  background: linear-gradient(180deg, #fae094 0%, #c69134 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

/* ---------- FAMILY IV: SPRING PADDLES & REFLEX (Toys 031–040) ---------- */
.v6ta-reflex-shell {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(6px, 1.2dvh, 10px);
}
.v6ta-reflex-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, #1e2436 0%, #101420 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 0 28px rgba(0, 0, 0, 0.65);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.v6ta-reflex-item-text {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(18px, 5vw, 28px);
  font-weight: 800;
  color: #fffaf0;
  line-height: 1.18;
}
.v6ta-paddle-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(8px, 2vw, 14px);
  flex-shrink: 0;
}
.v6ta-spring-paddle {
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  position: relative;
  min-height: clamp(64px, 14dvh, 108px);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fffdf7;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(13px, 3.4vw, 18px);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-align: center;
  transition: transform 0.08s cubic-bezier(0.2, 1.4, 0.4, 1);
}
.v6ta-spring-paddle.is-left {
  background: linear-gradient(180deg, #1c659c 0%, #10395c 62%, #0a2238 100%);
  box-shadow: inset 0 2px 0 rgba(160, 224, 255, 0.48), 0 7px 0 #071828, 0 12px 20px rgba(0, 0, 0, 0.6);
}
.v6ta-spring-paddle.is-right {
  background: linear-gradient(180deg, #a8283e 0%, #6b1525 62%, #420c16 100%);
  box-shadow: inset 0 2px 0 rgba(255, 175, 188, 0.45), 0 7px 0 #2b070e, 0 12px 20px rgba(0, 0, 0, 0.6);
}
.v6ta-spring-paddle:active:not(:disabled),
.v6ta-spring-paddle.is-slammed {
  transform: translateY(6px);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5), 0 1px 0 #080d14;
}
.v6ta-piston-bay {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-items: end;
  padding-top: 8px;
}
.v6ta-piston-col {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
}
.v6ta-piston-head {
  appearance: none;
  border: none;
  cursor: pointer;
  width: 100%;
  min-height: 62%;
  border-radius: 12px 12px 6px 6px;
  padding: 8px 6px;
  background: linear-gradient(180deg, #f3cd74 0%, #a97827 24%, #2d3442 26%, #181d27 100%);
  color: #fffaf0;
  font-family: 'Inter', sans-serif;
  font-size: clamp(11px, 2.5vw, 13.5px);
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
  transition: transform 0.24s cubic-bezier(0.25, 1.35, 0.45, 1), filter 0.2s ease;
}
.v6ta-piston-head.is-retracted {
  transform: translateY(34%);
  filter: brightness(0.62);
}

/* ---------- FAMILY V: PROGRESSIVE REVEAL / IRIS / DARKROOM / VISE (Toys 041–050) ---------- */
.v6ta-reveal-deck {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(5px, 0.9dvh, 8px);
}
.v6ta-clue-stack {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 5px;
}
.v6ta-shutter-row {
  position: relative;
  border-radius: 9px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: linear-gradient(180deg, #24201b 0%, #161310 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.v6ta-shutter-row.is-open {
  background: linear-gradient(90deg, rgba(242, 202, 110, 0.16) 0%, rgba(25, 31, 44, 0.95) 100%);
  box-shadow: inset 3px 0 0 #f2ca6e;
}
.v6ta-shutter-text {
  font-size: clamp(11px, 2.6vw, 13.5px);
  font-weight: 600;
  color: #f8f2e4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.v6ta-pot-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(10.5px, 2.4vw, 12.5px);
  font-weight: 800;
  color: #4be5a4;
  white-space: nowrap;
  flex-shrink: 0;
}
.v6ta-darkroom-plate {
  flex: 1;
  min-height: 0;
  position: relative;
  border-radius: 12px;
  background: #140809;
  overflow: hidden;
  touch-action: none;
  cursor: crosshair;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 10px 14px;
  box-shadow: inset 0 0 0 1px rgba(235, 190, 96, 0.3);
}
.v6ta-darkroom-mask {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: background 0.04s linear;
}
.v6ta-result-ribbon {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: clamp(12px, 2.8vw, 14.5px);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  z-index: 30;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.72);
  animation: v6ta-pop-in 0.22s ease-out;
}
.v6ta-result-ribbon.is-win {
  background: linear-gradient(90deg, #124833 0%, #1c6b4c 100%);
  color: #ecfff6;
  box-shadow: inset 0 0 0 1.5px #4be5a4, 0 8px 24px rgba(0, 0, 0, 0.72);
}
.v6ta-result-ribbon.is-miss {
  background: linear-gradient(90deg, #54141f 0%, #781c2b 100%);
  color: #fff0f2;
  box-shadow: inset 0 0 0 1.5px #ff5468, 0 8px 24px rgba(0, 0, 0, 0.72);
}
@keyframes v6ta-pop-in {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`;
  document.head.appendChild(style);
}

// ============================================================================
// INTERNAL STAGE CONTEXT SHARED ACROSS ALL 5 MECHANICAL ENGINES
// ============================================================================

interface EngineMountContext {
  spec: ToySpec001To050V6;
  clue: CalibratedClueV6;
  stageEl: HTMLElement;
  tipEl: HTMLElement;
  fx: StageParticleOverlay;
  options: ToyStageMountOptionsV6;
  getRemainingSec: () => number;
  isResolved: () => boolean;
  playFoley: (sfx: FoleySfxIdV6) => void;
  emitInterim: (tag: string, detail?: string) => void;
  finish: (
    correct: boolean,
    accuracyRatio: number,
    specificActionTag: string,
    bannerText: string,
    multDeltaOverride?: number,
  ) => void;
  registerCleanup: (fn: () => void) => void;
  registerFoilHandler: (fn: (kind: ToyFoilAssistKindV6) => boolean) => void;
  registerTimeoutDraft: (fn: () => void) => void;
}

// ============================================================================
// ENGINE I: DEFUSAL & ELIMINATION (Toys 001–010)
// Disable all 3 WRONG hazards -> Truth survives! Hit truth -> Instant Boom!
// ============================================================================

const WIRE_COLORS = ['#e04252', '#3388ee', '#eab338', '#2eb872'];
const BALLOON_COLORS = ['#e84a5f', '#3c91e6', '#f4b942', '#9b5de5'];

function mountDefusalEngine(ctx: EngineMountContext): void {
  const { spec, clue, stageEl, fx } = ctx;
  const { choices, correctIndex } = ensureFourChoices(clue);
  const eliminated = new Set<number>();

  const use2x2 =
    spec.mode === 'DEFUSAL_TRAPDOOR_TILES' ||
    spec.mode === 'DEFUSAL_STATUE_SMASH' ||
    spec.mode === 'DEFUSAL_CARNIVAL_BALLOONS' ||
    spec.mode === 'DEFUSAL_SABOTEUR_PODS';

  const shell = document.createElement('div');
  shell.className = 'v6ta-defusal-shell';
  shell.innerHTML = `
    <div class="v6ta-defusal-status">
      <div class="v6ta-led-strip" aria-label="Safe eliminations">
        <span class="v6ta-led" data-led="0"></span>
        <span class="v6ta-led" data-led="1"></span>
        <span class="v6ta-led" data-led="2"></span>
      </div>
      <div class="v6ta-defusal-counter" data-counter>0 / 3 CLEARED</div>
    </div>
    <div class="v6ta-defusal-grid ${use2x2 ? 'is-2x2' : ''}" data-grid></div>
  `;
  stageEl.appendChild(shell);

  const gridEl = shell.querySelector('[data-grid]') as HTMLElement;
  const counterEl = shell.querySelector('[data-counter]') as HTMLElement;
  const leds = Array.from(shell.querySelectorAll<HTMLElement>('[data-led]'));
  const buttons: HTMLButtonElement[] = [];

  function buildPropVisualHtml(index: number): string {
    switch (spec.mode) {
      case 'DEFUSAL_BOMB_WIRES':
        return `<div class="v6ta-wire-visual"><div class="v6ta-wire-cable" style="background-color:${WIRE_COLORS[index % 4]}"></div></div>`;
      case 'DEFUSAL_RIGGED_FUSE':
        return `<div class="v6ta-wire-visual"><div class="v6ta-wire-cable" style="background-color:#9e7b47"><span class="v6ta-fuse-spark"></span></div></div>`;
      case 'DEFUSAL_CIRCUIT_BREAKERS':
        return `<div class="v6ta-prop-icon"><div class="v6ta-breaker-toggle"></div></div>`;
      case 'DEFUSAL_DECOY_CANDLES':
        return `<div class="v6ta-prop-icon"><div class="v6ta-flame"></div></div>`;
      case 'DEFUSAL_CARNIVAL_BALLOONS':
        return `<div class="v6ta-prop-icon" style="border-radius:50%;background:radial-gradient(circle at 35% 30%, #ffffff55, ${BALLOON_COLORS[index % 4]});"><span style="font-size:11px;font-weight:800;color:#fff">${String.fromCharCode(65 + index)}</span></div>`;
      case 'DEFUSAL_CROCODILE_TEETH':
        return `<div class="v6ta-prop-icon" style="background:linear-gradient(180deg,#fffef6 0%,#ded4bc 100%);border-radius:6px 6px 12px 12px;color:#1d2b24;font-weight:900;font-size:12px;">T${index + 1}</div>`;
      default:
        return `<div class="v6ta-prop-icon" style="box-shadow:inset 0 0 0 1px ${spec.chassisTheme.metalAccent}55;color:${spec.chassisTheme.metalAccent};font-family:'JetBrains Mono',monospace;font-weight:800;font-size:12px;">0${index + 1}</div>`;
    }
  }

  function triggerHazard(idx: number, fromFoil = false): void {
    if (ctx.isResolved() || eliminated.has(idx)) return;
    const btn = buttons[idx];
    const pill = btn.querySelector<HTMLElement>('[data-pill]');

    if (idx === correctIndex) {
      // Catastrophic hit on the true answer!
      btn.classList.add('is-detonated');
      if (pill) pill.textContent = 'TRUTH HIT!';
      leds.forEach((l) => l.classList.add('is-boom'));
      ctx.playFoley('nixie_spark_crackle');
      fx.burstAtElement(btn, 'SPARK', ['#ff3e50', '#ff9f43', '#ffffff'], 34);
      ctx.finish(
        false,
        eliminated.size * 0.2,
        `defusal_hit_truth_${spec.toyNumber}`,
        `DETONATED! "${choices[correctIndex]}" was the truth.`,
      );
      return;
    }

    // Safe elimination of a wrong hazard!
    eliminated.add(idx);
    btn.classList.add('is-eliminated');
    btn.disabled = true;
    if (pill) pill.textContent = `✓ ${spec.safeTag}`;

    const count = eliminated.size;
    if (leds[count - 1]) leds[count - 1].classList.add('is-safe');
    counterEl.textContent = `${count} / 3 CLEARED`;

    ctx.playFoley(spec.foleyInteract);
    const fxKind =
      spec.mode === 'DEFUSAL_STATUE_SMASH'
        ? 'SHARD'
        : spec.mode === 'DEFUSAL_DECOY_CANDLES'
          ? 'SMOKE'
          : 'SPARK';
    const fxColors =
      fxKind === 'SMOKE'
        ? ['#d6dce8', '#98a3b8', '#ffffff']
        : fxKind === 'SHARD'
          ? ['#f3d285', '#c8a366', '#ffffff']
          : ['#ffd76e', '#ff9436', '#4be5a4'];
    fx.burstAtElement(btn, fxKind, fxColors, 22);
    ctx.emitInterim(fromFoil ? 'foil_defuse_wire' : `defused_${count}_of_3`, choices[idx]);

    if (count >= 3) {
      const survivor = buttons[correctIndex];
      survivor.classList.add('is-truth-survived');
      const survPill = survivor.querySelector<HTMLElement>('[data-pill]');
      if (survPill) survPill.textContent = '✓ TRUTH';
      ctx.playFoley(spec.foleyLock);
      fx.burstAtElement(survivor, 'RING', ['#4be5a4', '#ffd76e', '#ffffff'], 26);
      ctx.finish(
        true,
        1.0,
        `defusal_cleared_${spec.toyNumber}`,
        `DEFUSED! Truth preserved: "${choices[correctIndex]}"`,
        0.5,
      );
    }
  }

  for (let i = 0; i < choices.length; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v6ta-hazard-item';
    btn.innerHTML = `
      ${buildPropVisualHtml(i)}
      <span class="v6ta-hazard-label">${escapeHtml(choices[i])}</span>
      <span class="v6ta-verb-pill" data-pill>${escapeHtml(spec.verbTag)}</span>
    `;
    btn.addEventListener('click', () => triggerHazard(i));
    gridEl.appendChild(btn);
    buttons.push(btn);
  }

  ctx.registerFoilHandler((kind) => {
    if (kind === 'DEFUSE_ONE_WIRE' && !ctx.isResolved()) {
      const candidates = [0, 1, 2, 3].filter((i) => i !== correctIndex && !eliminated.has(i));
      if (candidates.length > 0) {
        triggerHazard(candidates[0], true);
        return true;
      }
    }
    return false;
  });

  ctx.registerTimeoutDraft(() => {
    buttons[correctIndex]?.classList.add('is-truth-survived');
    ctx.finish(
      false,
      eliminated.size * 0.25,
      `defusal_timeout_${spec.toyNumber}`,
      `TIME UP! Truth was "${choices[correctIndex]}".`,
    );
  });
}

// ============================================================================
// ENGINE II: ULTRA-HD 3D SHADED-RELIEF ATLAS SPATIAL (Toys 011–020)
// Powered live by Three.js AtlasReliefGlobe3DV6 + 4K Natural Earth Relief WebP
// ============================================================================

function mountAtlasSpatialEngine(ctx: EngineMountContext): void {
  const { spec, clue, stageEl, fx } = ctx;
  const targetGeo = resolveGeoTargetForClue(clue);
  const { choices, correctIndex } = ensureFourChoices(clue);

  const wrap = document.createElement('div');
  wrap.className = 'v6ta-atlas-wrap';
  wrap.innerHTML = `
    <div class="v6ta-globe-viewport" data-globe-host>
      <div class="v6ta-globe-hud-top">
        <span class="v6ta-coord-pill" data-left-hud>${escapeHtml(targetGeo.regionHint ?? '4K RELIEF ATLAS')}</span>
        <span class="v6ta-coord-pill" data-right-hud>SPIN &amp; TAP</span>
      </div>
    </div>
    <div class="v6ta-atlas-controls" data-controls></div>
  `;
  stageEl.appendChild(wrap);

  const globeHost = wrap.querySelector('[data-globe-host]') as HTMLElement;
  const leftHud = wrap.querySelector('[data-left-hud]') as HTMLElement;
  const rightHud = wrap.querySelector('[data-right-hud]') as HTMLElement;
  const controlsEl = wrap.querySelector('[data-controls]') as HTMLElement;

  const isPinDropMode =
    spec.mode === 'ATLAS_PIN_DROP' || spec.mode === 'ATLAS_ANTIPODE_GUESS';
  const actualPinTarget: GeoPointV6 =
    spec.mode === 'ATLAS_ANTIPODE_GUESS'
      ? computeAntipode(targetGeo.lat, targetGeo.lng)
      : { lat: targetGeo.lat, lng: targetGeo.lng };

  // Start offset from the answer so the initial camera never spoils a pin-drop!
  const startFocus: GeoPointV6 =
    spec.mode === 'ATLAS_LANDMARK_ORBIT'
      ? { lat: targetGeo.lat, lng: targetGeo.lng }
      : spec.mode === 'ATLAS_ANTIPODE_GUESS'
        ? { lat: targetGeo.lat, lng: targetGeo.lng }
        : {
            lat: clamp(targetGeo.lat * 0.35 + 14, -50, 55),
            lng: ((targetGeo.lng + 95 + 180) % 360) - 180,
          };

  const globe = new AtlasReliefGlobe3DV6(globeHost, {
    textureBasePath: ctx.options.globeTextureBasePath,
    initialFocus: startFocus,
    initialDistance: spec.mode === 'ATLAS_LANDMARK_ORBIT' ? 2.25 : 2.88,
    allowPinDrop: isPinDropMode,
    idleSpinSpeed: isPinDropMode ? 0.032 : 0.045,
    brassTrimHex: ctx.options.stageTheme?.materials.trimMetalHex ?? 0xdcb563,
    onPinDrop: (coord) => {
      ctx.playFoley('globe_pin_ruby_click');
      rightHud.textContent = formatCoordShort(coord.lat, coord.lng);
      if (lockPinBtn) lockPinBtn.disabled = false;
      ctx.emitInterim('globe_pin_placed', formatCoordShort(coord.lat, coord.lng));
    },
  });
  ctx.registerCleanup(() => globe.dispose());

  let lockPinBtn: HTMLButtonElement | null = null;

  // --- Mode-Specific 3D Globe Setup & Tactile Controls ---
  if (isPinDropMode) {
    if (spec.mode === 'ATLAS_ANTIPODE_GUESS') {
      globe.setAntipodeOrigin(targetGeo.lat, targetGeo.lng);
      leftHud.textContent = `ORIGIN: ${targetGeo.landmarkLabel ?? formatCoordShort(targetGeo.lat, targetGeo.lng)}`;
      rightHud.textContent = 'SPIN 180° & PIN';
    } else {
      leftHud.textContent = targetGeo.regionHint ? `HINT: ${targetGeo.regionHint}` : '4K RELIEF GLOBE';
      rightHud.textContent = 'TAP TO DROP RUBY PIN';
    }

    const row = document.createElement('div');
    row.className = 'v6ta-atlas-row';
    row.innerHTML = `
      <button type="button" class="v6ta-steel-btn" data-recenter style="flex:0 0 auto;">CENTER</button>
      <button type="button" class="v6ta-brass-btn" data-lock style="flex:1;" disabled>${escapeHtml(spec.verbTag)}</button>
    `;
    controlsEl.appendChild(row);

    const recenterBtn = row.querySelector('[data-recenter]') as HTMLButtonElement;
    lockPinBtn = row.querySelector('[data-lock]') as HTMLButtonElement;

    recenterBtn.addEventListener('click', () => {
      ctx.playFoley('ui_brass_tap');
      globe.flyTo(20, 0, 2.95, 0.55);
    });

    const lockCurrentPin = (): void => {
      if (ctx.isResolved()) return;
      const guess = globe.getGuessPin();
      if (!guess) return;
      const score = globe.revealTarget(actualPinTarget.lat, actualPinTarget.lng, {
        fromCoord: guess,
        bullseyeKm: spec.mode === 'ATLAS_ANTIPODE_GUESS' ? 280 : 140,
        decayScaleKm: spec.mode === 'ATLAS_ANTIPODE_GUESS' ? 2400 : 1950,
      });
      const won = score.points >= 320;
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(globeHost, 'RING', won ? ['#ffd76e', '#4be5a4'] : ['#ff5263', '#ffb74d'], 24);
      rightHud.textContent = `${score.distanceKm.toLocaleString('en-US')} km • ${score.points}/1000`;
      ctx.finish(
        won,
        score.accuracyRatio,
        score.tierLabel === 'BULLSEYE' ? 'bullseye_globe' : `globe_${score.tierLabel.toLowerCase()}`,
        `${score.tierLabel}! ${score.distanceKm.toLocaleString('en-US')} km away (${score.points} pts) — ${targetGeo.landmarkLabel ?? formatCoordShort(actualPinTarget.lat, actualPinTarget.lng)}`,
        score.tierLabel === 'BULLSEYE' ? 1.0 : won ? 0.35 : 0,
      );
    };

    lockPinBtn.addEventListener('click', lockCurrentPin);
    ctx.registerTimeoutDraft(() => {
      if (globe.getGuessPin()) {
        lockCurrentPin();
      } else {
        globe.revealTarget(actualPinTarget.lat, actualPinTarget.lng, { fromCoord: null });
        ctx.finish(false, 0, 'globe_timeout', `TIME UP! Target: ${targetGeo.landmarkLabel ?? formatCoordShort(actualPinTarget.lat, actualPinTarget.lng)}`);
      }
    });
    return;
  }

  // --- Toy 13: Latitude Equator-to-Pole Slider ---
  if (spec.mode === 'ATLAS_LATITUDE_SLIDER') {
    let latVal = 0;
    globe.setLatitudeRing(latVal);
    globe.flyTo(12, targetGeo.lng, 3.05, 0.6);
    leftHud.textContent = targetGeo.landmarkLabel ?? 'LATITUDE SWEEP';
    rightHud.textContent = '0° EQUATOR';

    controlsEl.innerHTML = `
      <div class="v6ta-custom-rail" data-rail>
        <div class="v6ta-custom-rail-fill" data-fill style="width:50%"></div>
        <div class="v6ta-custom-thumb" data-thumb style="left:50%"></div>
      </div>
      <div class="v6ta-atlas-row">
        <button type="button" class="v6ta-steel-btn" data-step="-5">-5°</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1">${escapeHtml(spec.verbTag)}</button>
        <button type="button" class="v6ta-steel-btn" data-step="5">+5°</button>
      </div>
    `;
    const rail = controlsEl.querySelector('[data-rail]') as HTMLElement;
    const fill = controlsEl.querySelector('[data-fill]') as HTMLElement;
    const thumb = controlsEl.querySelector('[data-thumb]') as HTMLElement;
    const lockBtn = controlsEl.querySelector('[data-lock]') as HTMLButtonElement;

    const updateLat = (nextLat: number, playTick = false): void => {
      latVal = Math.round(clamp(nextLat, -75, 75));
      const pct = ((latVal + 75) / 150) * 100;
      fill.style.width = `${pct}%`;
      thumb.style.left = `${pct}%`;
      rightHud.textContent = latVal === 0 ? '0° EQUATOR' : `${Math.abs(latVal)}° ${latVal > 0 ? 'NORTH' : 'SOUTH'}`;
      globe.setLatitudeRing(latVal);
      if (playTick) ctx.playFoley('neve_fader_detent');
    };

    const setFromClientX = (clientX: number): void => {
      const rect = rail.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      updateLat(-75 + ratio * 150, false);
    };
    let dragging = false;
    rail.addEventListener('pointerdown', (e) => {
      dragging = true;
      rail.setPointerCapture(e.pointerId);
      setFromClientX(e.clientX);
      ctx.playFoley('neve_fader_detent');
    });
    rail.addEventListener('pointermove', (e) => {
      if (dragging) setFromClientX(e.clientX);
    });
    rail.addEventListener('pointerup', () => { dragging = false; });

    controlsEl.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((b) => {
      b.addEventListener('click', () => updateLat(latVal + Number(b.dataset.step), true));
    });

    const commitLat = (): void => {
      if (ctx.isResolved()) return;
      const errDeg = Math.abs(latVal - targetGeo.lat);
      const acc = clamp(1 - errDeg / 38, 0, 1);
      const won = errDeg <= 16;
      globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: null });
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      ctx.finish(
        won,
        acc,
        'atlas_latitude_locked',
        `${won ? 'LOCKED!' : 'OFF PARALLEL!'} True lat: ${Math.abs(targetGeo.lat).toFixed(1)}°${targetGeo.lat >= 0 ? 'N' : 'S'} (off by ${errDeg.toFixed(1)}°)`,
        errDeg <= 5 ? 0.6 : 0,
      );
    };
    lockBtn.addEventListener('click', commitLat);
    ctx.registerTimeoutDraft(commitLat);
    return;
  }

  // --- Toy 17: Time-Zone Sun Terminator ---
  if (spec.mode === 'ATLAS_SUN_TERMINATOR') {
    let utcOffset = 0;
    const targetUtc = Math.round(clamp(targetGeo.lng / 15, -11, 12));
    globe.setSolarMeridian(0);
    globe.flyTo(15, 0, 3.05, 0.5);
    leftHud.textContent = targetGeo.landmarkLabel ?? 'SOLAR TERMINATOR';
    rightHud.textContent = 'UTC +0';

    controlsEl.innerHTML = `
      <div class="v6ta-custom-rail" data-rail>
        <div class="v6ta-custom-rail-fill" data-fill style="width:48%"></div>
        <div class="v6ta-custom-thumb" data-thumb style="left:48%"></div>
      </div>
      <div class="v6ta-atlas-row">
        <button type="button" class="v6ta-steel-btn" data-step="-1">-1h</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1">${escapeHtml(spec.verbTag)}</button>
        <button type="button" class="v6ta-steel-btn" data-step="1">+1h</button>
      </div>
    `;
    const rail = controlsEl.querySelector('[data-rail]') as HTMLElement;
    const fill = controlsEl.querySelector('[data-fill]') as HTMLElement;
    const thumb = controlsEl.querySelector('[data-thumb]') as HTMLElement;
    const lockBtn = controlsEl.querySelector('[data-lock]') as HTMLButtonElement;

    const setUtc = (next: number, tick = false): void => {
      utcOffset = Math.round(clamp(next, -11, 12));
      const pct = ((utcOffset + 11) / 23) * 100;
      fill.style.width = `${pct}%`;
      thumb.style.left = `${pct}%`;
      rightHud.textContent = `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset} (${utcOffset * 15}°)`;
      globe.setSolarMeridian(utcOffset * 15);
      globe.flyTo(15, utcOffset * 15, 3.05, 0.35);
      if (tick) ctx.playFoley('rotary_knob_click');
    };
    let dragging = false;
    rail.addEventListener('pointerdown', (e) => {
      dragging = true;
      rail.setPointerCapture(e.pointerId);
      const r = rail.getBoundingClientRect();
      setUtc(-11 + clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1) * 23, true);
    });
    rail.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const r = rail.getBoundingClientRect();
      setUtc(-11 + clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1) * 23, false);
    });
    rail.addEventListener('pointerup', () => { dragging = false; });
    controlsEl.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((b) => {
      b.addEventListener('click', () => setUtc(utcOffset + Number(b.dataset.step), true));
    });

    const commitSolar = (): void => {
      if (ctx.isResolved()) return;
      const diffHrs = Math.abs(utcOffset - targetUtc);
      const won = diffHrs <= 2;
      const acc = clamp(1 - diffHrs / 6, 0, 1);
      globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: null });
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      ctx.finish(
        won,
        acc,
        'atlas_solar_locked',
        `${won ? 'SOLAR SYNC!' : 'OUT OF ZONE!'} Target sits near UTC ${targetUtc >= 0 ? '+' : ''}${targetUtc} (off by ${diffHrs}h)`,
      );
    };
    lockBtn.addEventListener('click', commitSolar);
    ctx.registerTimeoutDraft(commitSolar);
    return;
  }

  // --- Toy 16: Compass Bearing Lock ---
  if (spec.mode === 'ATLAS_COMPASS_BEARING') {
    const origin: GeoPointV6 = { lat: 51.5074, lng: -0.1278 }; // London Prime Observatory
    const trueBearing = Math.round(
      computeBearingDeg(origin.lat, origin.lng, targetGeo.lat, targetGeo.lng),
    );
    let bearing = 0;
    globe.setReferenceMarkers(
      [{ id: 'origin', lat: origin.lat, lng: origin.lng, colorHex: 0x56d8ff }],
      null,
    );
    globe.flyTo(origin.lat, origin.lng, 2.95, 0.5);
    leftHud.textContent = 'FROM LONDON PRIME MERIDIAN';
    rightHud.textContent = '0° N';

    const dirLabel = (deg: number): string => {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      return dirs[Math.round(((deg % 360) / 45)) % 8];
    };

    controlsEl.innerHTML = `
      <div class="v6ta-custom-rail" data-rail>
        <div class="v6ta-custom-rail-fill" data-fill style="width:0%"></div>
        <div class="v6ta-custom-thumb" data-thumb style="left:0%"></div>
      </div>
      <div class="v6ta-atlas-row">
        <button type="button" class="v6ta-steel-btn" data-step="-15">-15°</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1">${escapeHtml(spec.verbTag)}</button>
        <button type="button" class="v6ta-steel-btn" data-step="15">+15°</button>
      </div>
    `;
    const rail = controlsEl.querySelector('[data-rail]') as HTMLElement;
    const fill = controlsEl.querySelector('[data-fill]') as HTMLElement;
    const thumb = controlsEl.querySelector('[data-thumb]') as HTMLElement;
    const lockBtn = controlsEl.querySelector('[data-lock]') as HTMLButtonElement;

    const setBearing = (deg: number, tick = false): void => {
      bearing = ((Math.round(deg) % 360) + 360) % 360;
      const pct = (bearing / 360) * 100;
      fill.style.width = `${pct}%`;
      thumb.style.left = `${pct}%`;
      rightHud.textContent = `${bearing}° ${dirLabel(bearing)}`;
      if (tick) ctx.playFoley('brass_gear_detent');
    };
    let dragging = false;
    rail.addEventListener('pointerdown', (e) => {
      dragging = true;
      rail.setPointerCapture(e.pointerId);
      const r = rail.getBoundingClientRect();
      setBearing(clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1) * 359, true);
    });
    rail.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const r = rail.getBoundingClientRect();
      setBearing(clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1) * 359, false);
    });
    rail.addEventListener('pointerup', () => { dragging = false; });
    controlsEl.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((b) => {
      b.addEventListener('click', () => setBearing(bearing + Number(b.dataset.step), true));
    });

    const commitBearing = (): void => {
      if (ctx.isResolved()) return;
      const rawDiff = Math.abs(bearing - trueBearing);
      const errDeg = Math.min(rawDiff, 360 - rawDiff);
      const won = errDeg <= 35;
      const acc = clamp(1 - errDeg / 90, 0, 1);
      globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: origin });
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      ctx.finish(
        won,
        acc,
        'atlas_compass_locked',
        `${won ? 'ON COURSE!' : 'OFF BEARING!'} True heading: ${trueBearing}° ${dirLabel(trueBearing)} (off by ${errDeg}°)`,
      );
    };
    lockBtn.addEventListener('click', commitBearing);
    ctx.registerTimeoutDraft(commitBearing);
    return;
  }

  // --- Toy 18: 4-Quadrant Hemisphere Sorter ---
  if (spec.mode === 'ATLAS_HEMISPHERE_SORT') {
    const trueQuad: 'NW' | 'NE' | 'SW' | 'SE' = `${targetGeo.lat >= 0 ? 'N' : 'S'}${targetGeo.lng >= 0 ? 'E' : 'W'}` as 'NW' | 'NE' | 'SW' | 'SE';
    globe.setHemisphereHighlight(null);
    leftHud.textContent = targetGeo.landmarkLabel ?? 'EQUATOR × PRIME MERIDIAN';
    rightHud.textContent = 'SELECT QUADRANT';

    const quads: ReadonlyArray<{ id: 'NW' | 'NE' | 'SW' | 'SE'; label: string }> = [
      { id: 'NW', label: 'NORTH-WEST (NW)' },
      { id: 'NE', label: 'NORTH-EAST (NE)' },
      { id: 'SW', label: 'SOUTH-WEST (SW)' },
      { id: 'SE', label: 'SOUTH-EAST (SE)' },
    ];
    const grid = document.createElement('div');
    grid.className = 'v6ta-choice-grid';
    controlsEl.appendChild(grid);

    quads.forEach((q) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v6ta-choice-plaque';
      btn.innerHTML = `<span class="v6ta-key-badge">${q.id}</span><span class="v6ta-choice-text">${q.label}</span>`;
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        globe.setHemisphereHighlight(q.id);
        globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: null });
        const won = q.id === trueQuad;
        btn.classList.add(won ? 'is-correct' : 'is-wrong');
        ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
        ctx.finish(
          won,
          won ? 1 : 0,
          'atlas_hemisphere_pick',
          `${won ? 'LOCKED!' : 'WRONG HEMISPHERE!'} ${targetGeo.landmarkLabel ?? 'Target'} is in ${trueQuad}.`,
        );
      });
      grid.appendChild(btn);
    });
    ctx.registerTimeoutDraft(() => {
      globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: null });
      ctx.finish(false, 0, 'atlas_hemisphere_timeout', `TIME UP! Correct quadrant: ${trueQuad}.`);
    });
    return;
  }

  // --- Toys 12, 14, 15, 20: Visual 3D Spatial Choice Toys (Flight Duel, Trench, Peak, Orbit Zoom) ---
  if (spec.mode === 'ATLAS_LANDMARK_ORBIT') {
    globe.setOrbitLandmark(targetGeo.lat, targetGeo.lng);
    leftHud.textContent = 'LOW-ORBIT RECONNAISSANCE';
    rightHud.textContent = targetGeo.regionHint ?? 'ORBITING...';
  } else if (spec.mode === 'ATLAS_TRENCH_PLUNGE') {
    globe.setReferenceMarkers(
      OCEAN_BASIN_PRESETS.map((o, i) => ({ id: `t${i}`, lat: o.lat, lng: o.lng, colorHex: 0x3ee2ff })),
    );
    globe.flyTo(11, 142, 2.95, 0.7);
    leftHud.textContent = 'BATHYMETRY SONAR';
    rightHud.textContent = 'DEEP OCEAN RELIEF';
  } else if (spec.mode === 'ATLAS_PEAK_PICK') {
    globe.setReferenceMarkers(
      MOUNTAIN_PEAK_PRESETS.map((p, i) => ({ id: `p${i}`, lat: p.lat, lng: p.lng, colorHex: 0xffd564 })),
    );
    globe.flyTo(28, 87, 2.75, 0.7);
    leftHud.textContent = 'ALPINE RELIEF SCAN';
    rightHud.textContent = '3D ELEVATION BUMP';
  } else {
    // ATLAS_FLIGHT_DUEL: Show 2 pulsing great-circle arcs from London to target vs distant decoy
    const origin = { lat: 40.7128, lng: -74.006 };
    const decoy = FALLBACK_LANDMARKS[(stableHash(`${clue.qid}:duel`) + 5) % FALLBACK_LANDMARKS.length];
    globe.setReferenceMarkers(
      [
        { id: 'a', lat: targetGeo.lat, lng: targetGeo.lng, colorHex: 0x56d8ff },
        { id: 'b', lat: decoy.lat, lng: decoy.lng, colorHex: 0xffd260 },
      ],
      origin,
    );
    const dTrue = Math.round(haversineDistanceKm(origin.lat, origin.lng, targetGeo.lat, targetGeo.lng));
    leftHud.textContent = 'GREAT-CIRCLE FLIGHT ARCS';
    rightHud.textContent = `ARC ~${dTrue.toLocaleString('en-US')} km`;
  }

  const grid = document.createElement('div');
  grid.className = 'v6ta-choice-grid';
  controlsEl.appendChild(grid);
  const plaques: HTMLButtonElement[] = [];

  choices.forEach((choiceText, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v6ta-choice-plaque';
    btn.innerHTML = `<span class="v6ta-key-badge">${String.fromCharCode(65 + idx)}</span><span class="v6ta-choice-text">${escapeHtml(choiceText)}</span>`;
    btn.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const won = idx === correctIndex;
      btn.classList.add(won ? 'is-correct' : 'is-wrong');
      if (!won && plaques[correctIndex]) plaques[correctIndex].classList.add('is-correct');
      globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: null });
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(btn, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 20);
      ctx.finish(
        won,
        won ? 1.0 : 0,
        `atlas_spatial_${spec.toyNumber}`,
        `${won ? 'CARTOLOGY MASTER!' : 'MISSED!'} Answer: "${choices[correctIndex]}"`,
      );
    });
    grid.appendChild(btn);
    plaques.push(btn);
  });

  ctx.registerTimeoutDraft(() => {
    if (plaques[correctIndex]) plaques[correctIndex].classList.add('is-correct');
    globe.revealTarget(targetGeo.lat, targetGeo.lng, { fromCoord: null });
    ctx.finish(false, 0, `atlas_timeout_${spec.toyNumber}`, `TIME UP! Answer: "${choices[correctIndex]}"`);
  });
}

// ============================================================================
// ENGINE III: HOROLOGICAL DIALS, CRYPTEX & MECHANICAL LOCKS (Toys 021–030)
// ============================================================================

function mountDialsCryptexEngine(ctx: EngineMountContext): void {
  const { spec, clue, stageEl, fx } = ctx;
  const { choices, correctIndex } = ensureFourChoices(clue);

  // --- Toy 21: 3D Brass Cryptex Ring Tumbler ---
  if (spec.mode === 'DIAL_CRYPTEX_RINGS') {
    const targetWord = resolveCryptexWordForClue(clue);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seed = stableHash(`${clue.qid}:${targetWord}`);

    // Each ring has 6 crisp engraved letters (true letter + 5 plausible decoys) so spelling feels snappy & fun!
    const ringWheels: string[][] = [];
    const ringIndices: number[] = [];
    for (let i = 0; i < targetWord.length; i++) {
      const trueCh = targetWord[i];
      const wheel = [trueCh];
      let cursor = (seed + i * 17 + trueCh.charCodeAt(0)) % 26;
      while (wheel.length < 6) {
        const candidate = alphabet[cursor % 26];
        if (!wheel.includes(candidate)) wheel.push(candidate);
        cursor += 5;
      }
      // Deterministic shuffle & start on a wrong letter (offset 1..5) so player actively spins rings!
      wheel.sort((a, b) => ((stableHash(`${seed}:${i}:${a}`) % 31) - (stableHash(`${seed}:${i}:${b}`) % 31)));
      const trueIdx = wheel.indexOf(trueCh);
      const startIdx = (trueIdx + 1 + ((seed + i) % 5)) % wheel.length;
      ringWheels.push(wheel);
      ringIndices.push(startIdx);
    }

    const shell = document.createElement('div');
    shell.className = 'v6ta-cryptex-stage';
    shell.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;color:#e7c372;text-transform:uppercase;">
        ALIGN ${targetWord.length} ENGRAVED BRASS RINGS
      </div>
      <div class="v6ta-cryptex-cylinder" data-cyl></div>
      <div class="v6ta-atlas-row" style="width:100%;max-width:440px;">
        <button type="button" class="v6ta-steel-btn" data-hint-ring>HINT LETTER</button>
        <button type="button" class="v6ta-brass-btn" data-unlock style="flex:1;">${escapeHtml(spec.verbTag)} CRYPTEX</button>
      </div>
    `;
    stageEl.appendChild(shell);

    const cylEl = shell.querySelector('[data-cyl]') as HTMLElement;
    const unlockBtn = shell.querySelector('[data-unlock]') as HTMLButtonElement;
    const hintBtn = shell.querySelector('[data-hint-ring]') as HTMLButtonElement;
    let hintsUsed = 0;

    const ringNodes: Array<{ prevEl: HTMLElement; activeEl: HTMLElement; nextEl: HTMLElement; colEl: HTMLElement }> = [];

    const renderRing = (i: number): void => {
      const wheel = ringWheels[i];
      const idx = ringIndices[i];
      const prev = wheel[(idx - 1 + wheel.length) % wheel.length];
      const curr = wheel[idx];
      const next = wheel[(idx + 1) % wheel.length];
      ringNodes[i].prevEl.textContent = prev;
      ringNodes[i].activeEl.textContent = curr;
      ringNodes[i].nextEl.textContent = next;
    };

    const stepRing = (i: number, delta: number): void => {
      if (ctx.isResolved()) return;
      const len = ringWheels[i].length;
      ringIndices[i] = (ringIndices[i] + delta + len) % len;
      renderRing(i);
      ctx.playFoley('cryptex_stone_tumbler');
    };

    for (let i = 0; i < targetWord.length; i++) {
      const col = document.createElement('div');
      col.className = 'v6ta-cryptex-ring';
      col.innerHTML = `
        <button type="button" class="v6ta-ring-step" data-up aria-label="Previous letter"></button>
        <div class="v6ta-ring-active" data-curr></div>
        <button type="button" class="v6ta-ring-step" data-dn aria-label="Next letter"></button>
      `;
      const prevEl = col.querySelector('[data-up]') as HTMLElement;
      const activeEl = col.querySelector('[data-curr]') as HTMLElement;
      const nextEl = col.querySelector('[data-dn]') as HTMLElement;
      prevEl.addEventListener('click', () => stepRing(i, -1));
      nextEl.addEventListener('click', () => stepRing(i, 1));
      activeEl.addEventListener('click', () => stepRing(i, 1));

      // Vertical flick/drag support on each cylindrical brass drum!
      let startY = 0;
      let dragging = false;
      col.addEventListener('pointerdown', (e) => {
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        dragging = true;
        startY = e.clientY;
        col.setPointerCapture(e.pointerId);
      });
      col.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dy = e.clientY - startY;
        if (Math.abs(dy) >= 22) {
          stepRing(i, dy > 0 ? -1 : 1);
          startY = e.clientY;
        }
      });
      col.addEventListener('pointerup', () => { dragging = false; });

      cylEl.appendChild(col);
      ringNodes.push({ prevEl, activeEl, nextEl, colEl: col });
      renderRing(i);
    }

    const revealOneRing = (): boolean => {
      if (ctx.isResolved()) return false;
      for (let i = 0; i < targetWord.length; i++) {
        const trueIdx = ringWheels[i].indexOf(targetWord[i]);
        if (ringIndices[i] !== trueIdx) {
          ringIndices[i] = trueIdx;
          renderRing(i);
          hintsUsed += 1;
          ctx.playFoley('optical_beam_lock');
          fx.burstAtElement(ringNodes[i].colEl, 'SPARK', ['#ffd76e', '#4be5a4'], 14);
          return true;
        }
      }
      return false;
    };
    hintBtn.addEventListener('click', () => {
      if (hintsUsed >= Math.max(1, targetWord.length - 2)) {
        hintBtn.disabled = true;
        return;
      }
      revealOneRing();
      if (hintsUsed >= Math.max(1, targetWord.length - 2)) hintBtn.disabled = true;
    });
    ctx.registerFoilHandler((kind) => (kind === 'REVEAL_HINT' ? revealOneRing() : false));

    const evaluateCryptex = (): void => {
      if (ctx.isResolved()) return;
      const attempt = ringIndices.map((idx, i) => ringWheels[i][idx]).join('');
      let matches = 0;
      for (let i = 0; i < targetWord.length; i++) {
        if (attempt[i] === targetWord[i]) matches += 1;
      }
      const won = attempt === targetWord;
      const acc = won ? Math.max(0.55, 1 - hintsUsed * 0.14) : (matches / targetWord.length) * 0.4;
      ctx.playFoley(won ? 'vault_heavy_unlock' : 'nixie_spark_crackle');
      fx.burstAtElement(cylEl, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 26);
      ctx.finish(
        won,
        acc,
        won ? 'cryptex_solved' : 'cryptex_jammed',
        won ? `CRYPTEX CRACKED! "${targetWord}" unlocked!` : `LOCK JAMMED! Code was "${targetWord}".`,
        won && hintsUsed === 0 ? 0.65 : 0,
      );
    };
    unlockBtn.addEventListener('click', evaluateCryptex);
    ctx.registerTimeoutDraft(evaluateCryptex);
    return;
  }

  // --- Toy 23 (270° Brass Tachometer) & Toy 29 (Vernier Caliper) & Toy 27 (4-Wheel Combo Padlock) ---
  if (
    spec.mode === 'DIAL_TACHOMETER_270' ||
    spec.mode === 'DIAL_VERNIER_CALIPER' ||
    spec.mode === 'DIAL_COMBO_PADLOCK'
  ) {
    const numSpec = resolveNumericSpecForClue(clue);
    const span = Math.max(1, numSpec.max - numSpec.min);
    const winRadius = Math.max(2, Math.round(span * 0.14));
    const bullseyeRadius = Math.max(1, Math.round(span * 0.04));
    // Start cleanly offset away from true value so zero spoiler!
    const mid = Math.round((numSpec.min + numSpec.max) * 0.5);
    let currentVal =
      Math.abs(mid - numSpec.target) < winRadius * 1.3
        ? clamp(
            numSpec.target + (numSpec.target > mid ? -Math.round(span * 0.3) : Math.round(span * 0.3)),
            numSpec.min,
            numSpec.max,
          )
        : mid;

    const arena = document.createElement('div');
    arena.className = 'v6ta-dial-arena';

    if (spec.mode === 'DIAL_COMBO_PADLOCK') {
      // 4-Digit Numerical Padlock Shackle Tumbler
      const targetStr = String(clamp(Math.round(numSpec.target), 0, 9999)).padStart(4, '0');
      const digits = String(clamp(Math.round(currentVal), 0, 9999))
        .padStart(4, '0')
        .split('')
        .map(Number);

      arena.innerHTML = `
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#e7c372;letter-spacing:0.1em;">
          WIN WITHIN ±${winRadius} ${escapeHtml(numSpec.unit)}
        </div>
        <div class="v6ta-cryptex-cylinder" data-wheels></div>
        <button type="button" class="v6ta-brass-btn" data-lock style="width:100%;max-width:340px;">${escapeHtml(spec.verbTag)}</button>
      `;
      stageEl.appendChild(arena);
      const wheelsEl = arena.querySelector('[data-wheels]') as HTMLElement;
      const lockBtn = arena.querySelector('[data-lock]') as HTMLButtonElement;

      const updateDigitEls: HTMLElement[] = [];
      for (let d = 0; d < 4; d++) {
        const col = document.createElement('div');
        col.className = 'v6ta-cryptex-ring';
        col.innerHTML = `
          <button type="button" class="v6ta-ring-step" data-up>▲</button>
          <div class="v6ta-ring-active" data-val>${digits[d]}</div>
          <button type="button" class="v6ta-ring-step" data-dn>▼</button>
        `;
        const valEl = col.querySelector('[data-val]') as HTMLElement;
        updateDigitEls.push(valEl);
        const nudge = (delta: number): void => {
          if (ctx.isResolved()) return;
          digits[d] = (digits[d] + delta + 10) % 10;
          valEl.textContent = String(digits[d]);
          ctx.playFoley('cryptex_stone_tumbler');
        };
        col.querySelector('[data-up]')?.addEventListener('click', () => nudge(1));
        col.querySelector('[data-dn]')?.addEventListener('click', () => nudge(-1));
        wheelsEl.appendChild(col);
      }

      const commitPadlock = (): void => {
        if (ctx.isResolved()) return;
        const guessNum = Number(digits.join(''));
        const err = Math.abs(guessNum - numSpec.target);
        const won = err <= winRadius;
        const acc = clamp(1 - err / Math.max(1, winRadius * 2.4), 0, 1);
        ctx.playFoley(won ? 'vault_heavy_unlock' : 'nixie_spark_crackle');
        fx.burstAtElement(wheelsEl, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
        ctx.finish(
          won,
          acc,
          'padlock_dialed',
          `${won ? 'SHACKLE POPPED!' : 'LOCKED SHUT!'} Target: ${targetStr} (you dialed ${digits.join('')})`,
          err <= bullseyeRadius ? 0.75 : 0,
        );
      };
      lockBtn.addEventListener('click', commitPadlock);
      ctx.registerTimeoutDraft(commitPadlock);
      return;
    }

    // 270° Brass Tachometer Canvas OR Vernier Caliper Scale
    const isTacho = spec.mode === 'DIAL_TACHOMETER_270';
    const bigStep = Math.max(5, Math.round(span / 16));
    arena.innerHTML = `
      <div class="v6ta-dial-canvas-box" data-visual></div>
      <div class="v6ta-nixie-big" data-readout>${escapeHtml(formatStageNumber(currentVal, numSpec.unit, numSpec.isYear))}</div>
      ${isTacho ? '' : `
      <div class="v6ta-custom-rail" data-rail style="max-width:480px;">
        <div class="v6ta-custom-rail-fill" data-fill></div>
        <div class="v6ta-custom-thumb" data-thumb></div>
      </div>`}
      <div class="v6ta-atlas-row" style="width:100%;max-width:480px;">
        <button type="button" class="v6ta-steel-btn" data-step="${-bigStep}">-${bigStep}</button>
        <button type="button" class="v6ta-steel-btn" data-step="-1">-1</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1;">${escapeHtml(spec.verbTag)}</button>
        <button type="button" class="v6ta-steel-btn" data-step="1">+1</button>
        <button type="button" class="v6ta-steel-btn" data-step="${bigStep}">+${bigStep}</button>
      </div>
    `;
    stageEl.appendChild(arena);

    const visualBox = arena.querySelector('[data-visual]') as HTMLElement;
    const readoutEl = arena.querySelector('[data-readout]') as HTMLElement;
    const lockBtn = arena.querySelector('[data-lock]') as HTMLButtonElement;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:pointer;';
    visualBox.appendChild(canvas);

    let revealed = false;

    const drawGauge = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(120, visualBox.clientWidth);
      const h = Math.max(90, visualBox.clientHeight);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const c = canvas.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);

      const ratio = clamp((currentVal - numSpec.min) / span, 0, 1);

      if (isTacho) {
        const cx = w * 0.5;
        const cy = h * 0.57;
        const rad = Math.max(36, Math.min(w * 0.42, h * 0.48));
        const startA = Math.PI * 0.75;
        const sweepA = Math.PI * 1.5;

        // Brushed-brass outer bezel
        const bezelGrad = c.createRadialGradient(cx, cy, rad * 0.78, cx, cy, rad * 1.06);
        bezelGrad.addColorStop(0, '#10151f');
        bezelGrad.addColorStop(0.84, '#242c3c');
        bezelGrad.addColorStop(0.92, '#ecc674');
        bezelGrad.addColorStop(1, '#7e591d');
        c.fillStyle = bezelGrad;
        c.beginPath();
        c.arc(cx, cy, rad * 1.04, 0, Math.PI * 2);
        c.fill();

        // Track arc
        c.strokeStyle = 'rgba(255,255,255,0.14)';
        c.lineWidth = Math.max(6, rad * 0.09);
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx, cy, rad * 0.82, startA, startA + sweepA);
        c.stroke();

        // Active glowing brass/amber progress arc
        const valA = startA + ratio * sweepA;
        c.strokeStyle = '#f3ca6b';
        c.lineWidth = Math.max(6, rad * 0.09);
        c.beginPath();
        c.arc(cx, cy, rad * 0.82, startA, valA);
        c.stroke();

        // Tick marks
        for (let t = 0; t <= 24; t++) {
          const ta = startA + (t / 24) * sweepA;
          const major = t % 6 === 0;
          c.strokeStyle = major ? '#f5d27a' : 'rgba(245,210,122,0.38)';
          c.lineWidth = major ? 2.2 : 1;
          c.beginPath();
          c.moveTo(cx + Math.cos(ta) * rad * (major ? 0.64 : 0.71), cy + Math.sin(ta) * rad * (major ? 0.64 : 0.71));
          c.lineTo(cx + Math.cos(ta) * rad * 0.76, cy + Math.sin(ta) * rad * 0.76);
          c.stroke();
        }

        // Reveal green target zone if finished
        if (revealed) {
          const tMin = clamp((numSpec.target - winRadius - numSpec.min) / span, 0, 1);
          const tMax = clamp((numSpec.target + winRadius - numSpec.min) / span, 0, 1);
          c.strokeStyle = '#3ee89e';
          c.lineWidth = Math.max(8, rad * 0.11);
          c.beginPath();
          c.arc(cx, cy, rad * 0.82, startA + tMin * sweepA, startA + tMax * sweepA);
          c.stroke();
        }

        // Tapered illuminated brass needle
        c.save();
        c.translate(cx, cy);
        c.rotate(valA);
        c.fillStyle = '#ff6b4a';
        c.beginPath();
        c.moveTo(-rad * 0.14, -3.5);
        c.lineTo(rad * 0.78, 0);
        c.lineTo(-rad * 0.14, 3.5);
        c.closePath();
        c.fill();
        c.restore();

        // Spun brass center hub
        c.fillStyle = '#f2cc72';
        c.beginPath();
        c.arc(cx, cy, Math.max(8, rad * 0.12), 0, Math.PI * 2);
        c.fill();
      } else {
        // Vernier Caliper Brass Beam + Sliding Jaw
        const pad = 22;
        const barY = h * 0.44;
        const barW = Math.max(80, w - pad * 2);
        c.fillStyle = '#252c38';
        c.fillRect(pad, barY - 12, barW, 24);
        c.strokeStyle = '#e5be6a';
        c.lineWidth = 1.5;
        c.strokeRect(pad, barY - 12, barW, 24);

        for (let i = 0; i <= 40; i++) {
          const tx = pad + (i / 40) * barW;
          const major = i % 5 === 0;
          c.strokeStyle = major ? '#f3cd76' : 'rgba(243,205,118,0.4)';
          c.beginPath();
          c.moveTo(tx, barY - 12);
          c.lineTo(tx, barY - 12 + (major ? 14 : 7));
          c.stroke();
        }

        // Fixed left jaw
        c.fillStyle = '#d7ab50';
        c.fillRect(pad - 6, barY - 26, 12, 64);

        // Sliding right jaw
        const jawX = pad + ratio * barW;
        c.fillStyle = '#f8dd94';
        c.fillRect(jawX - 7, barY - 26, 14, 64);

        // Illuminated span between jaws
        c.fillStyle = 'rgba(86, 212, 245, 0.28)';
        c.fillRect(pad + 6, barY + 12, Math.max(0, jawX - pad - 13), 24);

        if (revealed) {
          const trueX = pad + clamp((numSpec.target - numSpec.min) / span, 0, 1) * barW;
          c.strokeStyle = '#4be5a4';
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(trueX, barY - 32);
          c.lineTo(trueX, barY + 42);
          c.stroke();
        }
      }
    };

    const syncUI = (tick = false): void => {
      currentVal = Math.round(clamp(currentVal, numSpec.min, numSpec.max));
      readoutEl.textContent = formatStageNumber(currentVal, numSpec.unit, numSpec.isYear);
      const pct = ((currentVal - numSpec.min) / span) * 100;
      const fill = arena.querySelector<HTMLElement>('[data-fill]');
      const thumb = arena.querySelector<HTMLElement>('[data-thumb]');
      if (fill) fill.style.width = `${pct}%`;
      if (thumb) thumb.style.left = `${pct}%`;
      drawGauge();
      if (tick) ctx.playFoley(spec.foleyInteract);
    };

    // Pointer drag directly on 270° gauge or caliper
    let dragging = false;
    const handlePointer = (clientX: number, clientY: number): void => {
      const r = canvas.getBoundingClientRect();
      if (isTacho) {
        const cx = r.left + r.width * 0.5;
        const cy = r.top + r.height * 0.57;
        let ang = Math.atan2(clientY - cy, clientX - cx);
        if (ang < Math.PI * 0.5) ang += Math.PI * 2;
        const ratio = clamp((ang - Math.PI * 0.75) / (Math.PI * 1.5), 0, 1);
        currentVal = numSpec.min + ratio * span;
      } else {
        const ratio = clamp((clientX - r.left - 22) / Math.max(1, r.width - 44), 0, 1);
        currentVal = numSpec.min + ratio * span;
      }
      syncUI(false);
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (ctx.isResolved()) return;
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      handlePointer(e.clientX, e.clientY);
      ctx.playFoley(spec.foleyInteract);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (dragging) handlePointer(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });

    const railEl = arena.querySelector<HTMLElement>('[data-rail]');
    if (railEl) {
      let rDrag = false;
      const setRail = (cx: number): void => {
        const r = railEl.getBoundingClientRect();
        currentVal = numSpec.min + clamp((cx - r.left) / Math.max(1, r.width), 0, 1) * span;
        syncUI(false);
      };
      railEl.addEventListener('pointerdown', (e) => {
        if (ctx.isResolved()) return;
        rDrag = true;
        railEl.setPointerCapture(e.pointerId);
        setRail(e.clientX);
        ctx.playFoley(spec.foleyInteract);
      });
      railEl.addEventListener('pointermove', (e) => { if (rDrag) setRail(e.clientX); });
      railEl.addEventListener('pointerup', () => { rDrag = false; });
    }

    arena.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        currentVal += Number(btn.dataset.step);
        syncUI(true);
      });
    });

    const ro = new ResizeObserver(() => drawGauge());
    ro.observe(visualBox);
    ctx.registerCleanup(() => ro.disconnect());
    requestAnimationFrame(() => syncUI(false));

    const commitNumeric = (): void => {
      if (ctx.isResolved()) return;
      revealed = true;
      drawGauge();
      const err = Math.abs(currentVal - numSpec.target);
      const won = err <= winRadius;
      const bullseye = err <= bullseyeRadius;
      const acc = clamp(1 - err / Math.max(1, winRadius * 2.2), 0, 1);
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(readoutEl, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
      ctx.finish(
        won,
        acc,
        bullseye ? 'dial_bullseye' : won ? 'dial_hit' : 'dial_miss',
        `${bullseye ? 'BULLSEYE!' : won ? 'LOCKED IN!' : 'OUT OF RANGE!'} Exact: ${formatStageNumber(numSpec.target, numSpec.unit, numSpec.isYear)} (off by ${err})`,
        bullseye ? 0.85 : won ? 0.25 : 0,
      );
    };
    lockBtn.addEventListener('click', commitNumeric);
    ctx.registerTimeoutDraft(commitNumeric);
    return;
  }

  // --- Toy 25: Missing-Vowel Marquee Bulbs ---
  if (spec.mode === 'DIAL_MARQUEE_VOWELS') {
    const word = resolveCryptexWordForClue(clue);
    const vowelPositions: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if ('AEIOU'.includes(word[i])) vowelPositions.push(i);
    }
    // Guarantee at least 1 missing slot even on rare consonant-heavy acronyms
    if (vowelPositions.length === 0) vowelPositions.push(Math.floor(word.length / 2));

    const filled: string[] = [];
    const shell = document.createElement('div');
    shell.className = 'v6ta-cryptex-stage';
    shell.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#ffe082;letter-spacing:0.12em;">
        BROADWAY MARQUEE — FILL ${vowelPositions.length} MISSING LETTER${vowelPositions.length > 1 ? 'S' : ''}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;" data-marquee></div>
      <div style="display:flex;gap:8px;justify-content:center;width:100%;" data-vowels></div>
      <div class="v6ta-atlas-row" style="width:100%;max-width:360px;">
        <button type="button" class="v6ta-steel-btn" data-clear>CLEAR</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1;" disabled>${escapeHtml(spec.verbTag)}</button>
      </div>
    `;
    stageEl.appendChild(shell);
    const marqueeEl = shell.querySelector('[data-marquee]') as HTMLElement;
    const vowelsEl = shell.querySelector('[data-vowels]') as HTMLElement;
    const clearBtn = shell.querySelector('[data-clear]') as HTMLButtonElement;
    const lockBtn = shell.querySelector('[data-lock]') as HTMLButtonElement;

    const renderMarquee = (): void => {
      let slotIdx = 0;
      marqueeEl.innerHTML = '';
      for (let i = 0; i < word.length; i++) {
        const isMissing = vowelPositions.includes(i);
        const tile = document.createElement('div');
        const filledChar = isMissing ? filled[slotIdx] : word[i];
        const isNext = isMissing && slotIdx === filled.length;
        if (isMissing) slotIdx += 1;
        tile.style.cssText = `
          width:clamp(34px,9vw,48px);height:clamp(42px,8dvh,54px);border-radius:8px;
          display:flex;align-items:center;justify-content:center;
          font-family:'Cinzel',serif;font-weight:800;font-size:clamp(18px,4.8vw,26px);
          background:${isMissing ? (filledChar ? 'linear-gradient(180deg,#ffe48a,#d69a2c)' : '#1e0c11') : 'linear-gradient(180deg,#3a1e26,#200f14)'};
          color:${isMissing && filledChar ? '#180e04' : '#fff8e2'};
          box-shadow:${isNext ? 'inset 0 0 0 2px #ffe082, 0 0 14px rgba(255,224,130,0.55)' : 'inset 0 0 0 1px rgba(248,210,116,0.4)'};
        `;
        tile.textContent = filledChar ?? '_';
        marqueeEl.appendChild(tile);
      }
      lockBtn.disabled = filled.length < vowelPositions.length;
    };

    const keys = Array.from(new Set(['A', 'E', 'I', 'O', 'U', ...vowelPositions.map((p) => word[p])]));
    keys.forEach((ch) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'v6ta-brass-btn';
      b.style.cssText = 'min-width:44px;padding:0 12px;border-radius:50%;aspect-ratio:1/1;';
      b.textContent = ch;
      b.addEventListener('click', () => {
        if (ctx.isResolved() || filled.length >= vowelPositions.length) return;
        filled.push(ch);
        ctx.playFoley('ui_brass_tap');
        renderMarquee();
      });
      vowelsEl.appendChild(b);
    });

    clearBtn.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      filled.length = 0;
      ctx.playFoley('ui_brass_tap');
      renderMarquee();
    });

    const commitMarquee = (): void => {
      if (ctx.isResolved()) return;
      const expected = vowelPositions.map((p) => word[p]).join('');
      const attempt = filled.join('');
      const won = attempt === expected;
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(marqueeEl, won ? 'RING' : 'SPARK', won ? ['#ffe082', '#4be5a4'] : ['#ff5263'], 24);
      ctx.finish(won, won ? 1 : 0, 'marquee_vowels', won ? `LIGHTS UP! "${word}"!` : `DARK MARQUEE! Answer was "${word}".`);
    };
    lockBtn.addEventListener('click', commitMarquee);
    ctx.registerTimeoutDraft(commitMarquee);
    renderMarquee();
    return;
  }

  // --- Toy 26: Anagram Brass Tile Rail ---
  if (spec.mode === 'DIAL_ANAGRAM_RAIL') {
    const word = resolveCryptexWordForClue(clue);
    const seed = stableHash(`${clue.qid}:anagram`);
    const pool = word.split('').map((ch, idx) => ({ ch, id: idx, used: false }));
    pool.sort((a, b) => (stableHash(`${seed}:${a.id}:${a.ch}`) % 53) - (stableHash(`${seed}:${b.id}:${b.ch}`) % 53));
    // Ensure scrambled differs from target if possible
    if (pool.map((p) => p.ch).join('') === word && pool.length > 1) {
      [pool[0], pool[1]] = [pool[1], pool[0]];
    }
    const placed: number[] = [];

    const shell = document.createElement('div');
    shell.className = 'v6ta-cryptex-stage';
    shell.innerHTML = `
      <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;" data-rail></div>
      <div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap;" data-tray></div>
      <div class="v6ta-atlas-row" style="width:100%;max-width:360px;">
        <button type="button" class="v6ta-steel-btn" data-reset>RESET</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1;" disabled>${escapeHtml(spec.verbTag)}</button>
      </div>
    `;
    stageEl.appendChild(shell);
    const railEl = shell.querySelector('[data-rail]') as HTMLElement;
    const trayEl = shell.querySelector('[data-tray]') as HTMLElement;
    const resetBtn = shell.querySelector('[data-reset]') as HTMLButtonElement;
    const lockBtn = shell.querySelector('[data-lock]') as HTMLButtonElement;

    const renderAnagram = (): void => {
      railEl.innerHTML = '';
      for (let i = 0; i < word.length; i++) {
        const slot = document.createElement('button');
        slot.type = 'button';
        const poolIdx = placed[i];
        slot.style.cssText = `
          border:none;width:clamp(36px,10vw,50px);height:clamp(42px,8dvh,54px);border-radius:8px;
          font-family:'Cinzel',serif;font-weight:800;font-size:clamp(18px,4.5vw,25px);cursor:pointer;
          background:${poolIdx !== undefined ? 'linear-gradient(180deg,#f6d782,#c48f31)' : 'rgba(0,0,0,0.45)'};
          color:${poolIdx !== undefined ? '#160d03' : '#6c6455'};
          box-shadow:inset 0 0 0 1px rgba(235,196,112,0.42);
        `;
        slot.textContent = poolIdx !== undefined ? pool[poolIdx].ch : '·';
        if (poolIdx !== undefined) {
          slot.addEventListener('click', () => {
            if (ctx.isResolved()) return;
            pool[poolIdx].used = false;
            placed.splice(i, 1);
            ctx.playFoley('medal_enamel_clink');
            renderAnagram();
          });
        }
        railEl.appendChild(slot);
      }

      trayEl.innerHTML = '';
      pool.forEach((tile, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'v6ta-steel-btn';
        btn.style.cssText = `
          width:clamp(38px,10.5vw,52px);height:clamp(42px,7.5dvh,52px);padding:0;
          font-family:'Cinzel',serif;font-weight:800;font-size:clamp(17px,4.5vw,24px);
          opacity:${tile.used ? 0.25 : 1};
        `;
        btn.disabled = tile.used;
        btn.textContent = tile.ch;
        btn.addEventListener('click', () => {
          if (ctx.isResolved() || tile.used) return;
          tile.used = true;
          placed.push(idx);
          ctx.playFoley('medal_enamel_clink');
          renderAnagram();
        });
        trayEl.appendChild(btn);
      });
      lockBtn.disabled = placed.length < word.length;
    };

    resetBtn.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      pool.forEach((p) => { p.used = false; });
      placed.length = 0;
      renderAnagram();
    });

    const commitAnagram = (): void => {
      if (ctx.isResolved()) return;
      const attempt = placed.map((i) => pool[i].ch).join('');
      const won = attempt === word;
      ctx.playFoley(won ? 'vault_heavy_unlock' : 'nixie_spark_crackle');
      fx.burstAtElement(railEl, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
      ctx.finish(won, won ? 1 : 0, 'anagram_rail', won ? `UNSCRAMBLED! "${word}"!` : `SCRAMBLED! Answer was "${word}".`);
    };
    lockBtn.addEventListener('click', commitAnagram);
    ctx.registerTimeoutDraft(commitAnagram);
    renderAnagram();
    return;
  }

  // --- Toys 22 (Rotary Vault), 24 (Split-Flap), 28 (Cash Register), 30 (Telegraph Key) ---
  let selectedIdx = 0;
  const shell = document.createElement('div');
  shell.className = 'v6ta-cryptex-stage';

  if (spec.mode === 'DIAL_SPLIT_FLAP') {
    shell.innerHTML = `
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#f2ca68;letter-spacing:0.14em;">SOLARI DEPARTURE FLAP 01 / 04</div>
      <div style="width:100%;max-width:460px;padding:16px 14px;border-radius:10px;background:linear-gradient(180deg,#181b21 0%,#121419 49%,#07080a 50%,#1b1f26 100%);box-shadow:inset 0 0 0 1px rgba(242,202,104,0.35),0 10px 24px rgba(0,0,0,0.7);text-align:center;font-family:'JetBrains Mono',monospace;font-size:clamp(16px,4.5vw,24px);font-weight:800;color:#ffe082;letter-spacing:0.06em;" data-flap>${escapeHtml(choices[0].toUpperCase())}</div>
      <div class="v6ta-atlas-row" style="width:100%;max-width:460px;">
        <button type="button" class="v6ta-steel-btn" data-prev style="flex:0 0 auto;">◀ FLIP</button>
        <button type="button" class="v6ta-brass-btn" data-lock style="flex:1;">${escapeHtml(spec.verbTag)}</button>
        <button type="button" class="v6ta-steel-btn" data-next style="flex:0 0 auto;">FLIP ▶</button>
      </div>
    `;
    stageEl.appendChild(shell);
    const flapEl = shell.querySelector('[data-flap]') as HTMLElement;
    const stepFlap = (d: number): void => {
      if (ctx.isResolved()) return;
      selectedIdx = (selectedIdx + d + 4) % 4;
      flapEl.textContent = choices[selectedIdx].toUpperCase();
      flapEl.style.transform = 'scaleY(0.84)';
      setTimeout(() => { flapEl.style.transform = 'scaleY(1)'; }, 70);
      ctx.playFoley('brass_gear_detent');
    };
    shell.querySelector('[data-prev]')?.addEventListener('click', () => stepFlap(-1));
    shell.querySelector('[data-next]')?.addEventListener('click', () => stepFlap(1));
    const commitFlap = (): void => {
      if (ctx.isResolved()) return;
      const won = selectedIdx === correctIndex;
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(flapEl, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 22);
      ctx.finish(won, won ? 1 : 0, 'split_flap_locked', won ? `BOARDING! "${choices[correctIndex]}"!` : `WRONG GATE! Answer: "${choices[correctIndex]}".`);
    };
    shell.querySelector('[data-lock]')?.addEventListener('click', commitFlap);
    ctx.registerTimeoutDraft(commitFlap);
    return;
  }

  // --- Toy 22: Genuine 360° Rotatable Brushed-Steel & Brass Safe-Vault Dial ---
  if (spec.mode === 'DIAL_ROTARY_VAULT') {
    let dialAngle = -Math.PI * 0.5; // points straight up at slot 0 initially
    let activeSector = 0;

    shell.innerHTML = `
      <div class="v6ta-dial-canvas-box" data-vault-box style="max-height:54%;"></div>
      <div class="v6ta-choice-grid" style="max-width:460px;" data-grid></div>
      <button type="button" class="v6ta-brass-btn" data-lock style="width:100%;max-width:460px;">${escapeHtml(spec.verbTag)} VAULT</button>
    `;
    stageEl.appendChild(shell);

    const vaultBox = shell.querySelector('[data-vault-box]') as HTMLElement;
    const gridEl = shell.querySelector('[data-grid]') as HTMLElement;
    const lockBtn = shell.querySelector('[data-lock]') as HTMLButtonElement;
    const dialCanvas = document.createElement('canvas');
    dialCanvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab;';
    vaultBox.appendChild(dialCanvas);
    const btns: HTMLButtonElement[] = [];

    const drawVaultDial = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(120, vaultBox.clientWidth);
      const h = Math.max(96, vaultBox.clientHeight);
      if (dialCanvas.width !== Math.round(w * dpr) || dialCanvas.height !== Math.round(h * dpr)) {
        dialCanvas.width = Math.round(w * dpr);
        dialCanvas.height = Math.round(h * dpr);
      }
      const c = dialCanvas.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const rad = Math.max(36, Math.min(w, h) * 0.44);

      // Outer steel vault ring
      const outerGrad = c.createRadialGradient(cx, cy, rad * 0.6, cx, cy, rad * 1.05);
      outerGrad.addColorStop(0, '#161b23');
      outerGrad.addColorStop(0.84, '#2a323f');
      outerGrad.addColorStop(0.93, '#e8c26d');
      outerGrad.addColorStop(1, '#6f5019');
      c.fillStyle = outerGrad;
      c.beginPath();
      c.arc(cx, cy, rad * 1.02, 0, Math.PI * 2);
      c.fill();

      // Rotating inner brass wheel with 40 knurled ticks
      c.save();
      c.translate(cx, cy);
      c.rotate(dialAngle);
      for (let t = 0; t < 40; t++) {
        const a = (t / 40) * Math.PI * 2;
        const major = t % 10 === 0;
        c.strokeStyle = major ? '#fae094' : 'rgba(240,206,120,0.45)';
        c.lineWidth = major ? 2.5 : 1.1;
        c.beginPath();
        c.moveTo(Math.cos(a) * rad * (major ? 0.56 : 0.67), Math.sin(a) * rad * (major ? 0.56 : 0.67));
        c.lineTo(Math.cos(a) * rad * 0.8, Math.sin(a) * rad * 0.8);
        c.stroke();
      }
      // Illuminated ruby pointer notch on wheel
      c.fillStyle = '#4be5a4';
      c.beginPath();
      c.moveTo(rad * 0.86, 0);
      c.lineTo(rad * 0.62, -6);
      c.lineTo(rad * 0.62, 6);
      c.closePath();
      c.fill();

      // Knurled brass center boss
      c.fillStyle = '#e5be68';
      c.beginPath();
      c.arc(0, 0, rad * 0.24, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // 4 cardinal stop pips (0=Top, 1=Right, 2=Bottom, 3=Left)
      const stopAngles = [-Math.PI * 0.5, 0, Math.PI * 0.5, Math.PI];
      stopAngles.forEach((sa, idx) => {
        const active = idx === activeSector;
        c.fillStyle = active ? '#4be5a4' : '#e6c270';
        c.beginPath();
        c.arc(cx + Math.cos(sa) * rad * 0.92, cy + Math.sin(sa) * rad * 0.92, active ? 6 : 4, 0, Math.PI * 2);
        c.fill();
      });
    };

    const setSector = (idx: number, syncAngle = true, tick = true): void => {
      activeSector = ((idx % 4) + 4) % 4;
      if (syncAngle) dialAngle = [-Math.PI * 0.5, 0, Math.PI * 0.5, Math.PI][activeSector];
      btns.forEach((b, j) => b.classList.toggle('is-selected', j === activeSector));
      drawVaultDial();
      if (tick) ctx.playFoley('rotary_knob_click');
    };

    let dragging = false;
    const handleDialPointer = (clientX: number, clientY: number): void => {
      const r = dialCanvas.getBoundingClientRect();
      const ang = Math.atan2(clientY - (r.top + r.height * 0.5), clientX - (r.left + r.width * 0.5));
      dialAngle = ang;
      // Map angle to nearest of 4 cardinal stops (-pi/2 -> 0, 0 -> 1, pi/2 -> 2, pi -> 3)
      const shifted = ((ang + Math.PI * 0.75) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const nextSec = Math.floor(shifted / (Math.PI * 0.5)) % 4;
      if (nextSec !== activeSector) {
        setSector(nextSec, false, true);
      } else {
        drawVaultDial();
      }
    };
    dialCanvas.addEventListener('pointerdown', (e) => {
      if (ctx.isResolved()) return;
      dragging = true;
      dialCanvas.setPointerCapture(e.pointerId);
      handleDialPointer(e.clientX, e.clientY);
    });
    dialCanvas.addEventListener('pointermove', (e) => {
      if (dragging) handleDialPointer(e.clientX, e.clientY);
    });
    dialCanvas.addEventListener('pointerup', () => { dragging = false; });

    choices.forEach((ch, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `v6ta-choice-plaque ${idx === 0 ? 'is-selected' : ''}`;
      b.innerHTML = `<span class="v6ta-key-badge">${idx * 25}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        setSector(idx, true, true);
      });
      gridEl.appendChild(b);
      btns.push(b);
    });

    const ro = new ResizeObserver(() => drawVaultDial());
    ro.observe(vaultBox);
    ctx.registerCleanup(() => ro.disconnect());
    requestAnimationFrame(() => drawVaultDial());

    const commitVault = (): void => {
      if (ctx.isResolved()) return;
      const won = activeSector === correctIndex;
      btns[activeSector]?.classList.add(won ? 'is-correct' : 'is-wrong');
      if (!won) btns[correctIndex]?.classList.add('is-correct');
      ctx.playFoley(won ? 'vault_heavy_unlock' : 'nixie_spark_crackle');
      fx.burstAtElement(vaultBox, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 26);
      ctx.finish(won, won ? 1 : 0, 'rotary_vault_cracked', won ? `VAULT OPEN! "${choices[correctIndex]}"!` : `BOLTS LOCKED! Answer: "${choices[correctIndex]}".`);
    };
    lockBtn.addEventListener('click', commitVault);
    ctx.registerTimeoutDraft(commitVault);
    return;
  }

  // Cash Register Keys (28) & Telegraph Key (30)
  const isCashRegister = spec.mode === 'DIAL_CASH_REGISTER';
  const isTelegraph = spec.mode === 'DIAL_TELEGRAPH_KEY';
  shell.innerHTML = `
    <div style="width:100%;max-width:460px;padding:10px 14px;border-radius:10px;background:#11151d;box-shadow:inset 0 0 0 1px rgba(242,202,104,0.34);display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#eab95c;letter-spacing:0.1em;">${isCashRegister ? 'POP-UP FLAG' : isTelegraph ? 'MORSE CHANNEL' : 'VAULT TUMBLER'}</span>
      <span style="font-family:'Cinzel',serif;font-weight:800;font-size:clamp(13px,3.2vw,16px);color:#fffaf0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" data-active-disp>${escapeHtml(choices[0])}</span>
    </div>
    <div class="v6ta-choice-grid" style="max-width:460px;" data-grid></div>
    <button type="button" class="v6ta-brass-btn" data-lock style="width:100%;max-width:460px;">${escapeHtml(spec.verbTag)}</button>
  `;
  stageEl.appendChild(shell);
  const dispEl = shell.querySelector('[data-active-disp]') as HTMLElement;
  const gridEl = shell.querySelector('[data-grid]') as HTMLElement;
  const lockBtn = shell.querySelector('[data-lock]') as HTMLButtonElement;
  const btns: HTMLButtonElement[] = [];

  const commitSelection = (idx: number): void => {
    if (ctx.isResolved()) return;
    const won = idx === correctIndex;
    btns[idx]?.classList.add(won ? 'is-correct' : 'is-wrong');
    if (!won) btns[correctIndex]?.classList.add('is-correct');
    ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
    fx.burstAtElement(btns[idx] ?? shell, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 22);
    ctx.finish(won, won ? 1 : 0, `dial_${spec.toyNumber}`, won ? `${spec.safeTag} "${choices[correctIndex]}"!` : `MISSED! Truth: "${choices[correctIndex]}".`);
  };

  choices.forEach((ch, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `v6ta-choice-plaque ${idx === 0 ? 'is-selected' : ''}`;
    b.innerHTML = `<span class="v6ta-key-badge">${isTelegraph ? `CH${idx + 1}` : isCashRegister ? `$${idx + 1}` : `${idx * 25}`}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      selectedIdx = idx;
      btns.forEach((el, j) => el.classList.toggle('is-selected', j === idx));
      dispEl.textContent = ch;
      ctx.playFoley(spec.foleyInteract);
      if (isCashRegister) {
        commitSelection(idx);
      }
    });
    gridEl.appendChild(b);
    btns.push(b);
  });

  if (isCashRegister) {
    lockBtn.style.display = 'none';
  } else {
    lockBtn.addEventListener('click', () => commitSelection(selectedIdx));
  }
  ctx.registerTimeoutDraft(() => commitSelection(selectedIdx));
}

// ============================================================================
// ENGINE IV: RAPID PADDLES & WARIOWARE REFLEX (Toys 031–040)
// ============================================================================

function mountReflexPaddlesEngine(ctx: EngineMountContext): void {
  const { spec, clue, stageEl, fx } = ctx;
  const { choices, correctIndex } = ensureFourChoices(clue);

  // --- Toys 31 (DIS OR DAT Spring Paddles), 34 (Conveyor Sorter), 40 (Hot-Mic Blitz) ---
  if (
    spec.mode === 'REFLEX_SPRING_PADDLES' ||
    spec.mode === 'REFLEX_CONVEYOR_SORT' ||
    spec.mode === 'REFLEX_HOT_MIC_BLITZ'
  ) {
    const pair = resolveBinaryPairForClue(clue);
    const items = pair.items.slice(0, 4);
    let idx = 0;
    let hits = 0;
    let streak = 0;

    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    shell.innerHTML = `
      <div class="v6ta-reflex-card" data-card>
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;font-family:'JetBrains Mono',monospace;font-size:11px;color:#eab95c;">
          <span data-progress>ITEM 1 / ${items.length}</span>
          <span data-streak style="color:#4be5a4;">STREAK x0</span>
        </div>
        <div class="v6ta-reflex-item-text" data-item>${escapeHtml(items[0].text)}</div>
        <div style="font-size:11px;color:#b8c2d6;" data-feedback>${spec.mode === 'REFLEX_CONVEYOR_SORT' ? 'CONVEYOR MOVING — SHUNT LEFT OR RIGHT' : spec.mode === 'REFLEX_HOT_MIC_BLITZ' ? 'VU METER HOT — SLAM ON AIR OR CUT!' : 'SLAM THE MATCHING SPRING PADDLE'}</div>
      </div>
      <div class="v6ta-paddle-row">
        <button type="button" class="v6ta-spring-paddle is-left" data-bucket="0">
          <span style="font-size:10px;opacity:0.75;letter-spacing:0.14em;">◀ LEFT PADDLE</span>
          <span>${escapeHtml(pair.optionA)}</span>
        </button>
        <button type="button" class="v6ta-spring-paddle is-right" data-bucket="1">
          <span style="font-size:10px;opacity:0.75;letter-spacing:0.14em;">RIGHT PADDLE ▶</span>
          <span>${escapeHtml(pair.optionB)}</span>
        </button>
      </div>
    `;
    stageEl.appendChild(shell);

    const cardEl = shell.querySelector('[data-card]') as HTMLElement;
    const progressEl = shell.querySelector('[data-progress]') as HTMLElement;
    const streakEl = shell.querySelector('[data-streak]') as HTMLElement;
    const itemEl = shell.querySelector('[data-item]') as HTMLElement;
    const fbEl = shell.querySelector('[data-feedback]') as HTMLElement;

    const handleSlam = (bucket: 0 | 1, btnEl: HTMLElement): void => {
      if (ctx.isResolved() || idx >= items.length) return;
      const cur = items[idx];
      const ok = cur.bucket === bucket;
      btnEl.classList.add('is-slammed');
      setTimeout(() => btnEl.classList.remove('is-slammed'), 110);

      if (ok) {
        hits += 1;
        streak += 1;
        ctx.playFoley('paddle_spring_slam');
        fx.burstAtElement(btnEl, 'SPARK', ['#4be5a4', '#ffd76e', '#ffffff'], 16);
        fbEl.textContent = `✓ CLEAN HIT!`;
        fbEl.style.color = '#4be5a4';
      } else {
        streak = 0;
        ctx.playFoley('nixie_spark_crackle');
        fx.burstAtElement(btnEl, 'SPARK', ['#ff4a5e', '#ffb74d'], 14);
        fbEl.textContent = `✕ BELONGS TO "${cur.bucket === 0 ? pair.optionA : pair.optionB}"`;
        fbEl.style.color = '#ff7280';
      }
      streakEl.textContent = `STREAK x${streak}`;
      idx += 1;

      if (idx >= items.length) {
        const ratio = hits / items.length;
        const won = ratio >= 0.75;
        ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
        ctx.finish(
          won,
          ratio,
          `paddles_${hits}_of_${items.length}`,
          `${won ? 'COMBO CLEAR!' : 'STUMBLED!'} ${hits}/${items.length} slammed clean!`,
          hits === items.length ? 0.6 : 0,
        );
      } else {
        progressEl.textContent = `ITEM ${idx + 1} / ${items.length}`;
        itemEl.textContent = items[idx].text;
        cardEl.style.transform = 'scale(0.97)';
        setTimeout(() => { cardEl.style.transform = 'scale(1)'; }, 85);
      }
    };

    shell.querySelectorAll<HTMLButtonElement>('[data-bucket]').forEach((b) => {
      b.addEventListener('click', () => handleSlam(Number(b.dataset.bucket) as 0 | 1, b));
    });

    ctx.registerTimeoutDraft(() => {
      const ratio = hits / Math.max(1, items.length);
      ctx.finish(ratio >= 0.75, ratio, 'paddles_timeout', `TIME UP! Scored ${hits}/${items.length}.`);
    });
    return;
  }

  // --- Toy 32: Pneumatic Whack-the-Truth Pistons ---
  if (spec.mode === 'REFLEX_PNEUMATIC_PISTONS') {
    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    const bay = document.createElement('div');
    bay.className = 'v6ta-piston-bay';
    shell.appendChild(bay);
    stageEl.appendChild(shell);

    const heads: HTMLButtonElement[] = [];
    choices.forEach((ch, idx) => {
      const col = document.createElement('div');
      col.className = 'v6ta-piston-col';
      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'v6ta-piston-head';
      head.innerHTML = `<span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#ffd264;margin-bottom:4px;">CYL 0${idx + 1}</span><span>${escapeHtml(ch)}</span>`;
      head.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const won = idx === correctIndex;
        const poppedBonus = !head.classList.contains('is-retracted');
        ctx.playFoley(won ? 'pneumatic_piston_slam' : 'nixie_spark_crackle');
        fx.burstAtElement(head, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 22);
        ctx.finish(
          won,
          won ? (poppedBonus ? 1.0 : 0.85) : 0,
          'pneumatic_piston_hit',
          won ? `WHACKED! "${choices[correctIndex]}"!` : `MISSED PISTON! Truth: "${choices[correctIndex]}".`,
          won && poppedBonus ? 0.45 : 0,
        );
      });
      col.appendChild(head);
      bay.appendChild(col);
      heads.push(head);
    });

    let cycle = 0;
    const interval = window.setInterval(() => {
      if (ctx.isResolved()) return;
      cycle += 1;
      heads.forEach((h, i) => {
        const up = (cycle + i) % 2 === 0;
        h.classList.toggle('is-retracted', !up);
      });
    }, 680);
    ctx.registerCleanup(() => window.clearInterval(interval));
    ctx.registerTimeoutDraft(() => {
      ctx.finish(false, 0, 'pistons_timeout', `TIME UP! Truth: "${choices[correctIndex]}".`);
    });
    return;
  }

  // --- Toy 33: Buzzer Chicken (Stop Before Redline!) ---
  if (spec.mode === 'REFLEX_BUZZER_CHICKEN') {
    let selectedIdx: number | null = null;
    let heat = 0.06; // climbs toward 1.0 redline!
    let busted = false;

    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    shell.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:5px;padding:8px 12px;border-radius:10px;background:#16090b;box-shadow:inset 0 0 0 1px rgba(255,90,104,0.35);">
        <div style="display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:800;">
          <span style="color:#ffd264;" data-pot>POT: $120</span>
          <span style="color:#ff5468;" data-heat>REDLINE 6%</span>
        </div>
        <div style="height:14px;border-radius:7px;background:#261014;overflow:hidden;">
          <div data-bar style="height:100%;width:6%;background:linear-gradient(90deg,#4be5a4 0%,#ffd25a 68%,#ff3648 100%);"></div>
        </div>
      </div>
      <div class="v6ta-choice-grid" data-grid></div>
      <button type="button" class="v6ta-brass-btn" data-slam disabled>PICK ANSWER, THEN SLAM STOP!</button>
    `;
    stageEl.appendChild(shell);

    const potEl = shell.querySelector('[data-pot]') as HTMLElement;
    const heatEl = shell.querySelector('[data-heat]') as HTMLElement;
    const barEl = shell.querySelector('[data-bar]') as HTMLElement;
    const gridEl = shell.querySelector('[data-grid]') as HTMLElement;
    const slamBtn = shell.querySelector('[data-slam]') as HTMLButtonElement;
    const btns: HTMLButtonElement[] = [];

    choices.forEach((ch, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'v6ta-choice-plaque';
      b.innerHTML = `<span class="v6ta-key-badge">${String.fromCharCode(65 + idx)}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
      b.addEventListener('click', () => {
        if (ctx.isResolved() || busted) return;
        selectedIdx = idx;
        btns.forEach((el, j) => el.classList.toggle('is-selected', j === idx));
        slamBtn.disabled = false;
        slamBtn.textContent = `SLAM STOP (${Math.round(heat * 100)}% HEAT)!`;
        ctx.playFoley('ui_brass_tap');
      });
      gridEl.appendChild(b);
      btns.push(b);
    });

    const interval = window.setInterval(() => {
      if (ctx.isResolved()) return;
      heat = Math.min(1.0, heat + 0.015);
      barEl.style.width = `${Math.round(heat * 100)}%`;
      potEl.textContent = `POT: $${Math.round(120 + heat * 880)}`;
      heatEl.textContent = `REDLINE ${Math.round(heat * 100)}%`;
      if (selectedIdx !== null) {
        slamBtn.textContent = `SLAM STOP ($${Math.round(120 + heat * 880)})!`;
      }
      if (heat >= 1.0) {
        busted = true;
        ctx.playFoley('nixie_spark_crackle');
        fx.burstAtElement(barEl, 'SPARK', ['#ff3648', '#ffb74d'], 28);
        ctx.finish(false, 0, 'chicken_redline_bust', `REDLINED! Boiler blew! Truth: "${choices[correctIndex]}".`);
      }
    }, 120);
    ctx.registerCleanup(() => window.clearInterval(interval));

    const commitChicken = (): void => {
      if (ctx.isResolved() || selectedIdx === null) return;
      const won = selectedIdx === correctIndex;
      const clutch = heat >= 0.72;
      ctx.playFoley(won ? 'screw_rival_slam' : 'nixie_spark_crackle');
      fx.burstAtElement(slamBtn, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
      ctx.finish(
        won,
        won ? clamp(0.45 + heat * 0.55, 0.45, 1.0) : 0,
        clutch ? 'chicken_clutch' : 'chicken_stopped',
        won ? `${clutch ? 'ICE COLD CLUTCH!' : 'STOPPED!'} Banked at ${Math.round(heat * 100)}% heat!` : `WRONG ANSWER! Truth: "${choices[correctIndex]}".`,
        won && clutch ? 0.85 : 0,
      );
    };
    slamBtn.addEventListener('click', commitChicken);
    ctx.registerTimeoutDraft(() => {
      if (selectedIdx !== null) commitChicken();
      else ctx.finish(false, 0, 'chicken_timeout', `TIME UP! Truth: "${choices[correctIndex]}".`);
    });
    return;
  }

  // --- Toy 37: Guillotine True/False Lever ---
  if (spec.mode === 'REFLEX_GUILLOTINE_LEVER') {
    const showTruth = stableHash(`${clue.qid}:guillotine`) % 2 === 0;
    const decoyIdx = (correctIndex + 1) % 4;
    const claimText = choices[showTruth ? correctIndex : decoyIdx];

    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    shell.innerHTML = `
      <div class="v6ta-reflex-card">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#eab95c;letter-spacing:0.14em;">PROPOSED ANSWER ON THE BLOCK</div>
        <div class="v6ta-reflex-item-text">"${escapeHtml(claimText)}"</div>
        <div style="font-size:12px;color:#c2cadb;">Does this match the clue — or SLICE IT as a myth?</div>
      </div>
      <div class="v6ta-paddle-row">
        <button type="button" class="v6ta-spring-paddle is-left" data-tf="true">
          <span style="font-size:10px;opacity:0.8;">SPARE BLADE</span>
          <span>TRUE MATCH</span>
        </button>
        <button type="button" class="v6ta-spring-paddle is-right" data-tf="false">
          <span style="font-size:10px;opacity:0.8;">DROP GUILLOTINE</span>
          <span>SLICE MYTH</span>
        </button>
      </div>
    `;
    stageEl.appendChild(shell);
    shell.querySelectorAll<HTMLButtonElement>('[data-tf]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const pickedTrue = b.dataset.tf === 'true';
        const won = pickedTrue === showTruth;
        ctx.playFoley(won ? 'trapdoor_hinge_drop' : 'nixie_spark_crackle');
        fx.burstAtElement(b, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 22);
        ctx.finish(
          won,
          won ? 1 : 0,
          'guillotine_verdict',
          won ? `CLEAN VERDICT! Truth: "${choices[correctIndex]}".` : `WRONG CUT! Truth was "${choices[correctIndex]}".`,
        );
      });
    });
    ctx.registerTimeoutDraft(() => {
      ctx.finish(false, 0, 'guillotine_timeout', `TIME UP! Truth was "${choices[correctIndex]}".`);
    });
    return;
  }

  // --- Toy 38: 3-Cup Brass Shell Track ---
  if (spec.mode === 'REFLEX_THREE_CUP_SHELL') {
    const cupChoices = [choices[correctIndex]];
    for (let i = 0; i < choices.length && cupChoices.length < 3; i++) {
      if (i !== correctIndex) cupChoices.push(choices[i]);
    }
    // Positions 0, 1, 2 hold cupIds 0, 1, 2 (cupId 0 is truth!)
    const order = [0, 1, 2];
    const seed = stableHash(`${clue.qid}:cups`);
    if (seed % 3 === 1) [order[0], order[1]] = [order[1], order[0]];
    if (seed % 3 === 2) [order[0], order[2]] = [order[2], order[0]];

    let shuffling = true;
    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    shell.innerHTML = `
      <div style="text-align:center;font-family:'JetBrains Mono',monospace;font-size:12px;color:#ffd264;letter-spacing:0.1em;" data-status>WATCH THE TRUTH MEDALLION...</div>
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:center;" data-cups></div>
    `;
    stageEl.appendChild(shell);
    const statusEl = shell.querySelector('[data-status]') as HTMLElement;
    const cupsEl = shell.querySelector('[data-cups]') as HTMLElement;

    const cupEls: HTMLButtonElement[] = [];
    for (let slot = 0; slot < 3; slot++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v6ta-steel-btn';
      btn.style.cssText = `
        height:clamp(92px,24dvh,156px);border-radius:42% 42% 14px 14px;
        background:linear-gradient(160deg,#fae194 0%,#b88227 52%,#5a3c0e 100%);
        color:#180f04;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
        transition:transform 0.28s ease;
      `;
      const cid = order[slot];
      btn.innerHTML = `<span style="font-family:'Cinzel',serif;font-weight:900;font-size:13px;">CUP ${slot + 1}</span><span data-label style="font-size:11px;font-weight:800;background:#120d05;color:#f8e8c0;padding:3px 6px;border-radius:5px;max-width:92%;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(cupChoices[cid])}</span>`;
      btn.addEventListener('click', () => {
        if (shuffling || ctx.isResolved()) return;
        const currentCid = order[slot];
        const won = currentCid === 0;
        cupEls.forEach((el, s) => {
          const lbl = el.querySelector<HTMLElement>('[data-label]');
          if (lbl) {
            lbl.style.opacity = '1';
            lbl.textContent = cupChoices[order[s]];
          }
        });
        ctx.playFoley(won ? 'trophy_pedestal_chime' : 'nixie_spark_crackle');
        fx.burstAtElement(btn, won ? 'RING' : 'SPARK', won ? ['#ffd76e', '#4be5a4'] : ['#ff5263'], 24);
        ctx.finish(won, won ? 1 : 0, 'shell_cup_pick', won ? `EAGLE EYE! Found "${choices[correctIndex]}"!` : `SLEIGHT OF HAND! Truth was "${choices[correctIndex]}".`);
      });
      cupsEl.appendChild(btn);
      cupEls.push(btn);
    }

    // Brief 1.1s peek -> cover labels -> 3 crisp swaps!
    const t1 = window.setTimeout(() => {
      if (ctx.isResolved()) return;
      cupEls.forEach((el) => {
        const lbl = el.querySelector<HTMLElement>('[data-label]');
        if (lbl) lbl.textContent = '???';
      });
      statusEl.textContent = 'SHUFFLING BRASS CUPS...';
      let swaps = 0;
      const swapInt = window.setInterval(() => {
        if (ctx.isResolved()) {
          window.clearInterval(swapInt);
          return;
        }
        const a = swaps % 3;
        const b = (swaps + 1) % 3;
        [order[a], order[b]] = [order[b], order[a]];
        cupEls[a].style.transform = 'translateY(-10px)';
        cupEls[b].style.transform = 'translateY(10px)';
        ctx.playFoley('chip_stack_riffle');
        setTimeout(() => {
          cupEls[a].style.transform = '';
          cupEls[b].style.transform = '';
        }, 160);
        swaps += 1;
        if (swaps >= 4) {
          window.clearInterval(swapInt);
          shuffling = false;
          statusEl.textContent = 'LIFT THE CUP HIDING THE TRUTH!';
        }
      }, 310);
      ctx.registerCleanup(() => window.clearInterval(swapInt));
    }, 1100);
    ctx.registerCleanup(() => window.clearTimeout(t1));
    ctx.registerTimeoutDraft(() => {
      ctx.finish(false, 0, 'shell_timeout', `TIME UP! Truth: "${choices[correctIndex]}".`);
    });
    return;
  }

  // --- Toy 35: Falling Crate Catch (Descending Factory Crates + Brass Rail Catch Cart) ---
  if (spec.mode === 'REFLEX_CRATE_CATCH') {
    let cartLane = 1;
    let fallProgress = 0.08; // 0..1 descending
    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    shell.innerHTML = `
      <div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;position:relative;padding:6px;border-radius:12px;background:rgba(0,0,0,0.34);overflow:hidden;" data-shafts></div>
      <div class="v6ta-atlas-row">
        <button type="button" class="v6ta-steel-btn" data-move="-1">◀ CART</button>
        <button type="button" class="v6ta-brass-btn" data-catch style="flex:1;">CATCH LANE 2</button>
        <button type="button" class="v6ta-steel-btn" data-move="1">CART ▶</button>
      </div>
    `;
    stageEl.appendChild(shell);
    const shaftsEl = shell.querySelector('[data-shafts]') as HTMLElement;
    const catchBtn = shell.querySelector('[data-catch]') as HTMLButtonElement;
    const crates: HTMLElement[] = [];
    const cartDots: HTMLElement[] = [];

    choices.forEach((ch, idx) => {
      const col = document.createElement('div');
      col.style.cssText = 'position:relative;height:100%;display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;border-radius:8px;background:rgba(255,255,255,0.03);';
      const crate = document.createElement('div');
      crate.style.cssText = `
        position:absolute;left:3px;right:3px;top:6%;padding:6px 5px;border-radius:7px;
        background:linear-gradient(180deg,#8c6334 0%,#523719 100%);
        box-shadow:inset 0 0 0 1px #e5bd6c,0 6px 12px rgba(0,0,0,0.6);
        font-size:clamp(10px,2.4vw,12px);font-weight:800;text-align:center;color:#fff8e6;line-height:1.15;
        transition:top 0.14s linear;
      `;
      crate.textContent = ch;
      const cart = document.createElement('div');
      cart.style.cssText = `
        height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;
        font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:800;
        background:${idx === cartLane ? 'linear-gradient(180deg,#fae094,#b98427)' : 'rgba(255,255,255,0.06)'};
        color:${idx === cartLane ? '#160d03' : '#7b8498'};
      `;
      cart.textContent = idx === cartLane ? 'CART' : `L${idx + 1}`;
      col.appendChild(crate);
      col.appendChild(cart);
      col.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        cartLane = idx;
        syncCart();
        ctx.playFoley('brass_gear_detent');
      });
      shaftsEl.appendChild(col);
      crates.push(crate);
      cartDots.push(cart);
    });

    const syncCart = (): void => {
      cartDots.forEach((el, i) => {
        const active = i === cartLane;
        el.style.background = active ? 'linear-gradient(180deg,#fae094,#b98427)' : 'rgba(255,255,255,0.06)';
        el.style.color = active ? '#160d03' : '#7b8498';
        el.textContent = active ? 'CART' : `L${i + 1}`;
      });
      catchBtn.textContent = `CATCH: ${choices[cartLane].slice(0, 18)}`;
    };
    syncCart();

    shell.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        cartLane = clamp(cartLane + Number(b.dataset.move), 0, 3);
        syncCart();
        ctx.playFoley('brass_gear_detent');
      });
    });

    const commitCatch = (): void => {
      if (ctx.isResolved()) return;
      const won = cartLane === correctIndex;
      ctx.playFoley(won ? 'pneumatic_piston_slam' : 'nixie_spark_crackle');
      fx.burstAtElement(crates[cartLane] ?? shaftsEl, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
      ctx.finish(won, won ? 1 : 0, 'falling_crate_catch', won ? `CAUGHT CLEAN! "${choices[correctIndex]}"!` : `CRASHED! Truth crate was "${choices[correctIndex]}".`);
    };
    catchBtn.addEventListener('click', commitCatch);

    const fallInt = window.setInterval(() => {
      if (ctx.isResolved()) return;
      fallProgress = Math.min(0.68, fallProgress + 0.015);
      crates.forEach((cr, i) => {
        const jitter = (i % 2 === 0 ? 0 : 0.04);
        cr.style.top = `${Math.round(clamp(fallProgress + jitter, 0.04, 0.68) * 100)}%`;
      });
    }, 150);
    ctx.registerCleanup(() => window.clearInterval(fallInt));
    ctx.registerTimeoutDraft(commitCatch);
    return;
  }

  // --- Toy 39: Live Canvas2D Pinball Flipper Target ---
  if (spec.mode === 'REFLEX_PINBALL_FLIPPER') {
    let aimIdx = 0;
    let launched = false;
    let ballX = 0.5;
    let ballY = 0.86;
    let targetX = 0.25;
    let targetY = 0.28;

    const shell = document.createElement('div');
    shell.className = 'v6ta-reflex-shell';
    shell.innerHTML = `
      <div class="v6ta-dial-canvas-box" data-pin-box style="border-radius:12px;background:radial-gradient(circle at 50% 30%,#231a40 0%,#0b0818 90%);box-shadow:inset 0 0 0 1px rgba(245,204,110,0.34);overflow:hidden;"></div>
      <div class="v6ta-choice-grid" data-grid></div>
      <div class="v6ta-atlas-row">
        <button type="button" class="v6ta-brass-btn" data-fire="L" style="flex:1;">◀ LEFT FLIPPER</button>
        <button type="button" class="v6ta-brass-btn" data-fire="R" style="flex:1;">RIGHT FLIPPER ▶</button>
      </div>
    `;
    stageEl.appendChild(shell);
    const pinBox = shell.querySelector('[data-pin-box]') as HTMLElement;
    const gridEl = shell.querySelector('[data-grid]') as HTMLElement;
    const pinCanvas = document.createElement('canvas');
    pinCanvas.style.cssText = 'width:100%;height:100%;display:block;';
    pinBox.appendChild(pinCanvas);

    const bumperCoords = [
      { x: 0.2, y: 0.34 },
      { x: 0.4, y: 0.24 },
      { x: 0.6, y: 0.24 },
      { x: 0.8, y: 0.34 },
    ];
    const btns: HTMLButtonElement[] = [];

    const drawPinball = (): void => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(120, pinBox.clientWidth);
      const h = Math.max(80, pinBox.clientHeight);
      if (pinCanvas.width !== Math.round(w * dpr) || pinCanvas.height !== Math.round(h * dpr)) {
        pinCanvas.width = Math.round(w * dpr);
        pinCanvas.height = Math.round(h * dpr);
      }
      const c = pinCanvas.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);

      // Dashed laser aim trajectory from ball to aimed bumper
      const aim = bumperCoords[aimIdx];
      c.save();
      c.strokeStyle = 'rgba(84,228,255,0.45)';
      c.setLineDash([4, 4]);
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(ballX * w, ballY * h);
      c.lineTo(aim.x * w, aim.y * h);
      c.stroke();
      c.restore();

      // 4 glowing brass bumpers
      bumperCoords.forEach((bp, i) => {
        const bx = bp.x * w;
        const by = bp.y * h;
        const selected = i === aimIdx;
        c.fillStyle = selected ? '#54e4ff' : '#e8c16b';
        c.beginPath();
        c.arc(bx, by, selected ? 17 : 14, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#120d21';
        c.beginPath();
        c.arc(bx, by, 10, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#fffaf0';
        c.font = 'bold 11px JetBrains Mono, monospace';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(`B${i + 1}`, bx, by);
      });

      // Left & Right Brass Flippers
      c.strokeStyle = '#f5cc6e';
      c.lineWidth = 7;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(w * 0.24, h * 0.84);
      c.lineTo(w * 0.44, launched ? h * 0.76 : h * 0.9);
      c.moveTo(w * 0.76, h * 0.84);
      c.lineTo(w * 0.56, launched ? h * 0.76 : h * 0.9);
      c.stroke();

      // Chrome steel ball
      const bGrad = c.createRadialGradient(ballX * w - 2, ballY * h - 2, 1, ballX * w, ballY * h, 8);
      bGrad.addColorStop(0, '#ffffff');
      bGrad.addColorStop(0.5, '#cbd5e6');
      bGrad.addColorStop(1, '#4c566a');
      c.fillStyle = bGrad;
      c.beginPath();
      c.arc(ballX * w, ballY * h, 8, 0, Math.PI * 2);
      c.fill();
    };

    const fireBall = (targetIdx: number): void => {
      if (launched || ctx.isResolved()) return;
      aimIdx = targetIdx;
      launched = true;
      targetX = bumperCoords[targetIdx].x;
      targetY = bumperCoords[targetIdx].y;
      ctx.playFoley('paddle_spring_slam');
      let step = 0;
      const anim = window.setInterval(() => {
        step += 1;
        const t = Math.min(1, step / 10);
        ballX = 0.5 + (targetX - 0.5) * t;
        ballY = 0.86 + (targetY - 0.86) * t;
        drawPinball();
        if (t >= 1) {
          window.clearInterval(anim);
          const won = targetIdx === correctIndex;
          btns[targetIdx]?.classList.add(won ? 'is-correct' : 'is-wrong');
          if (!won) btns[correctIndex]?.classList.add('is-correct');
          ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
          fx.burstAtElement(pinBox, won ? 'RING' : 'SPARK', won ? ['#54e4ff', '#ffd76e'] : ['#ff5263'], 26);
          ctx.finish(won, won ? 1 : 0, 'pinball_bumper_hit', won ? `BUMPER JACKPOT! "${choices[correctIndex]}"!` : `DRAINED! Truth was "${choices[correctIndex]}".`);
        }
      }, 24);
      ctx.registerCleanup(() => window.clearInterval(anim));
    };

    choices.forEach((ch, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `v6ta-choice-plaque ${idx === 0 ? 'is-selected' : ''}`;
      b.innerHTML = `<span class="v6ta-key-badge">B${idx + 1}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
      b.addEventListener('click', () => {
        if (launched || ctx.isResolved()) return;
        aimIdx = idx;
        btns.forEach((el, j) => el.classList.toggle('is-selected', j === idx));
        drawPinball();
        ctx.playFoley('ui_brass_tap');
      });
      gridEl.appendChild(b);
      btns.push(b);
    });

    shell.querySelectorAll<HTMLButtonElement>('[data-fire]').forEach((fb) => {
      fb.addEventListener('click', () => fireBall(aimIdx));
    });
    const ro = new ResizeObserver(() => drawPinball());
    ro.observe(pinBox);
    ctx.registerCleanup(() => ro.disconnect());
    requestAnimationFrame(() => drawPinball());
    ctx.registerTimeoutDraft(() => fireBall(aimIdx));
    return;
  }

  // --- Toy 36: Quick-Draw Sheriff Paddles ---
  let drawReady = false;
  const shell = document.createElement('div');
  shell.className = 'v6ta-reflex-shell';
  shell.innerHTML = `
    <div style="text-align:center;font-family:'Cinzel',serif;font-weight:800;font-size:clamp(12px,3vw,16px);color:#ffd264;padding:6px;border-radius:8px;background:rgba(0,0,0,0.35);" data-banner>HOLD STEADY... WAIT FOR DRAW!</div>
    <div class="v6ta-choice-grid" style="flex:1;align-items:stretch;" data-grid></div>
  `;
  stageEl.appendChild(shell);
  const bannerEl = shell.querySelector('[data-banner]') as HTMLElement;
  const gridEl = shell.querySelector('[data-grid]') as HTMLElement;
  const btns: HTMLButtonElement[] = [];

  const drawDelay = 1100 + (stableHash(`${clue.qid}:draw`) % 900);
  const t = window.setTimeout(() => {
    if (ctx.isResolved()) return;
    drawReady = true;
    bannerEl.textContent = 'DRAW! SLAP THE TRUE BADGE NOW!';
    bannerEl.style.color = '#4be5a4';
    ctx.playFoley('twist_siren_chime');
  }, drawDelay);
  ctx.registerCleanup(() => window.clearTimeout(t));

  choices.forEach((ch, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'v6ta-choice-plaque';
    b.innerHTML = `<span class="v6ta-key-badge">${String.fromCharCode(65 + idx)}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      if (!drawReady) {
        ctx.playFoley('nixie_spark_crackle');
        bannerEl.textContent = 'FALSE START! WAIT FOR DRAW!';
        bannerEl.style.color = '#ff5468';
        return;
      }
      const won = idx === correctIndex;
      b.classList.add(won ? 'is-correct' : 'is-wrong');
      if (!won) btns[correctIndex]?.classList.add('is-correct');
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(b, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
      ctx.finish(won, won ? 1 : 0, `reflex_${spec.toyNumber}`, won ? `${spec.safeTag} "${choices[correctIndex]}"!` : `MISSED! Truth: "${choices[correctIndex]}".`);
    });
    gridEl.appendChild(b);
    btns.push(b);
  });

  ctx.registerTimeoutDraft(() => {
    btns[correctIndex]?.classList.add('is-correct');
    ctx.finish(false, 0, `reflex_timeout_${spec.toyNumber}`, `TIME UP! Truth: "${choices[correctIndex]}".`);
  });
}

// ============================================================================
// ENGINE V: PROGRESSIVE UNMASKING & AUDIO REVEAL (Toys 041–050)
// ============================================================================

function mountProgressiveRevealEngine(ctx: EngineMountContext): void {
  const { spec, clue, stageEl, fx } = ctx;
  const { choices, correctIndex } = ensureFourChoices(clue);
  const hints = resolveProgressiveHints(clue);

  // --- Toy 47: Year-Vise Narrowing Clamp (Tighter Jaws = Bigger Multiplier!) ---
  if (spec.mode === 'REVEAL_YEAR_VISE_CLAMP') {
    const numSpec = resolveNumericSpecForClue(clue);
    const span = Math.max(10, numSpec.max - numSpec.min);
    let lowVal = Math.round(numSpec.min + span * 0.12);
    let highVal = Math.round(numSpec.max - span * 0.12);

    const shell = document.createElement('div');
    shell.className = 'v6ta-cryptex-stage';
    shell.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;max-width:480px;font-family:'JetBrains Mono',monospace;font-size:12px;">
        <span style="color:#56d8ff;" data-range></span>
        <span style="color:#4be5a4;font-weight:800;" data-mult>×1.2 MULT</span>
      </div>
      <div style="position:relative;width:100%;max-width:480px;height:48px;border-radius:10px;background:#121721;box-shadow:inset 0 2px 8px #000;overflow:hidden;" data-bar>
        <div data-jaw-band style="position:absolute;top:0;bottom:0;background:linear-gradient(90deg,rgba(75,229,164,0.28),rgba(242,202,110,0.38),rgba(75,229,164,0.28));box-shadow:inset 4px 0 0 #f3cd76,inset -4px 0 0 #f3cd76;"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:100%;max-width:480px;">
        <button type="button" class="v6ta-steel-btn" data-adj="low:-">L ◀</button>
        <button type="button" class="v6ta-steel-btn" data-adj="low:+">L ▶</button>
        <button type="button" class="v6ta-steel-btn" data-adj="high:-">◀ R</button>
        <button type="button" class="v6ta-steel-btn" data-adj="high:+">R ▶</button>
      </div>
      <button type="button" class="v6ta-brass-btn" data-lock style="width:100%;max-width:480px;">${escapeHtml(spec.verbTag)}</button>
    `;
    stageEl.appendChild(shell);

    const rangeEl = shell.querySelector('[data-range]') as HTMLElement;
    const multEl = shell.querySelector('[data-mult]') as HTMLElement;
    const bandEl = shell.querySelector('[data-jaw-band]') as HTMLElement;
    const lockBtn = shell.querySelector('[data-lock]') as HTMLButtonElement;
    const step = Math.max(2, Math.round(span / 18));

    const updateVise = (): void => {
      lowVal = clamp(lowVal, numSpec.min, highVal - step);
      highVal = clamp(highVal, lowVal + step, numSpec.max);
      const leftPct = ((lowVal - numSpec.min) / span) * 100;
      const rightPct = ((numSpec.max - highVal) / span) * 100;
      bandEl.style.left = `${leftPct}%`;
      bandEl.style.right = `${rightPct}%`;
      const widthFrac = (highVal - lowVal) / span;
      const mult = clamp(2.6 - widthFrac * 1.65, 1.0, 2.5);
      rangeEl.textContent = `${formatStageNumber(lowVal, numSpec.unit, numSpec.isYear)} — ${formatStageNumber(highVal, numSpec.unit, numSpec.isYear)}`;
      multEl.textContent = `×${mult.toFixed(2)} MULT`;
    };
    updateVise();

    shell.querySelectorAll<HTMLButtonElement>('[data-adj]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const [side, dir] = (b.dataset.adj ?? '').split(':');
        const delta = dir === '+' ? step : -step;
        if (side === 'low') lowVal += delta;
        else highVal += delta;
        ctx.playFoley('brass_gear_detent');
        updateVise();
      });
    });

    const commitVise = (): void => {
      if (ctx.isResolved()) return;
      const inside = numSpec.target >= lowVal && numSpec.target <= highVal;
      const widthFrac = (highVal - lowVal) / span;
      const acc = inside ? clamp(1.12 - widthFrac * 0.65, 0.45, 1.0) : 0;
      const multBonus = inside ? Number(clamp(1.6 - widthFrac * 1.4, 0.1, 1.5).toFixed(2)) : 0;
      ctx.playFoley(inside ? 'vault_heavy_unlock' : 'nixie_spark_crackle');
      fx.burstAtElement(bandEl, inside ? 'RING' : 'SPARK', inside ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 24);
      ctx.finish(
        inside,
        acc,
        'year_vise_clamped',
        inside
          ? `CLAMPED! ${formatStageNumber(numSpec.target, numSpec.unit, numSpec.isYear)} trapped inside your jaws (+${multBonus}×)!`
          : `SLIPPED OUT! Exact value was ${formatStageNumber(numSpec.target, numSpec.unit, numSpec.isYear)}.`,
        multBonus,
      );
    };
    lockBtn.addEventListener('click', commitVise);
    ctx.registerTimeoutDraft(commitVise);
    return;
  }

  // --- Toys 45 (Darkroom Searchlight) & 46 (Detective Magnifying Loupe) ---
  if (spec.mode === 'REVEAL_DARKROOM_SEARCHLIGHT' || spec.mode === 'REVEAL_MAGNIFYING_LOUPE') {
    const isLoupe = spec.mode === 'REVEAL_MAGNIFYING_LOUPE';
    const deck = document.createElement('div');
    deck.className = 'v6ta-reveal-deck';
    deck.innerHTML = `
      <div class="v6ta-darkroom-plate" data-plate style="${isLoupe ? 'background:#1b1711;' : ''}">
        ${hints.slice(0, 3).map((h, i) => `<div style="font-size:clamp(11px,2.7vw,13.5px);font-weight:700;color:${isLoupe ? '#f4dfaf' : '#ffcf9e'};">INTEL 0${i + 1}: ${escapeHtml(h)}</div>`).join('')}
        <div class="v6ta-darkroom-mask" data-mask></div>
      </div>
      <div class="v6ta-choice-grid" data-grid></div>
    `;
    stageEl.appendChild(deck);
    const plate = deck.querySelector('[data-plate]') as HTMLElement;
    const mask = deck.querySelector('[data-mask]') as HTMLElement;
    const grid = deck.querySelector('[data-grid]') as HTMLElement;

    const updateSpotlight = (px: number, py: number): void => {
      mask.style.background = isLoupe
        ? `radial-gradient(circle 66px at ${px}px ${py}px, rgba(255,220,120,0.08) 0%, rgba(16,13,9,0.92) 78%)`
        : `radial-gradient(circle 72px at ${px}px ${py}px, rgba(255,140,60,0.06) 0%, rgba(12,4,5,0.96) 76%)`;
    };
    updateSpotlight(95, 55);

    const track = (e: PointerEvent): void => {
      const r = plate.getBoundingClientRect();
      updateSpotlight(clamp(e.clientX - r.left, 0, r.width), clamp(e.clientY - r.top, 0, r.height));
    };
    plate.addEventListener('pointerdown', (e) => {
      plate.setPointerCapture(e.pointerId);
      track(e);
      ctx.playFoley('optical_beam_lock');
    });
    plate.addEventListener('pointermove', (e) => {
      if (e.buttons > 0 || e.pointerType === 'mouse') track(e);
    });

    const btns: HTMLButtonElement[] = [];
    choices.forEach((ch, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'v6ta-choice-plaque';
      b.innerHTML = `<span class="v6ta-key-badge">${String.fromCharCode(65 + idx)}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const won = idx === correctIndex;
        mask.style.background = 'transparent';
        b.classList.add(won ? 'is-correct' : 'is-wrong');
        if (!won) btns[correctIndex]?.classList.add('is-correct');
        ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
        fx.burstAtElement(b, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 22);
        ctx.finish(won, won ? 1 : 0, `reveal_beam_${spec.toyNumber}`, won ? `${spec.safeTag} "${choices[correctIndex]}"!` : `MISSED! Answer: "${choices[correctIndex]}".`);
      });
      grid.appendChild(b);
      btns.push(b);
    });
    ctx.registerTimeoutDraft(() => {
      mask.style.background = 'transparent';
      btns[correctIndex]?.classList.add('is-correct');
      ctx.finish(false, 0, `reveal_timeout_${spec.toyNumber}`, `TIME UP! Answer: "${choices[correctIndex]}".`);
    });
    return;
  }

  // --- Toy 48: Quote Missing-Word Archival Parchment Rubber Stamp ---
  if (spec.mode === 'REVEAL_QUOTE_STAMP') {
    const deck = document.createElement('div');
    deck.className = 'v6ta-reveal-deck';
    deck.innerHTML = `
      <div style="flex:1;min-height:0;border-radius:12px;padding:12px 14px;background:linear-gradient(180deg,#f2e5c6 0%,#dec99a 100%);color:#1e160c;box-shadow:inset 0 0 0 2px #9c7430,0 8px 20px rgba(0,0,0,0.55);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px;text-align:center;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.16em;color:#6e4f1e;font-weight:800;">ARCHIVAL TRANSCRIPT — STAMP TO CERTIFY</span>
        <div style="font-family:'Cinzel',serif;font-weight:800;font-size:clamp(13px,3.2vw,16px);line-height:1.25;">${escapeHtml(hints[0])}</div>
        <div data-stamp-box style="min-width:160px;padding:6px 16px;border-radius:6px;border:2px dashed #8a2c2c;font-family:'Cinzel',serif;font-weight:900;font-size:clamp(14px,3.8vw,20px);color:#9e1d26;letter-spacing:0.08em;">[ STAMP WORD ]</div>
      </div>
      <div class="v6ta-choice-grid" data-grid></div>
    `;
    stageEl.appendChild(deck);
    const stampBox = deck.querySelector('[data-stamp-box]') as HTMLElement;
    const gridEl = deck.querySelector('[data-grid]') as HTMLElement;
    const btns: HTMLButtonElement[] = [];

    choices.forEach((ch, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'v6ta-choice-plaque';
      b.innerHTML = `<span class="v6ta-key-badge">INK</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const won = idx === correctIndex;
        stampBox.textContent = ch.toUpperCase();
        stampBox.style.borderStyle = 'solid';
        stampBox.style.transform = 'rotate(-2deg) scale(1.04)';
        stampBox.style.color = won ? '#136b42' : '#a81c28';
        stampBox.style.borderColor = won ? '#136b42' : '#a81c28';
        b.classList.add(won ? 'is-correct' : 'is-wrong');
        if (!won) btns[correctIndex]?.classList.add('is-correct');
        ctx.playFoley(won ? 'medal_enamel_clink' : 'nixie_spark_crackle');
        fx.burstAtElement(stampBox, won ? 'RING' : 'SPARK', won ? ['#4be5a4', '#ffd76e'] : ['#ff5263'], 22);
        ctx.finish(won, won ? 1 : 0, 'quote_word_stamped', won ? `SEALED! "${choices[correctIndex]}" certified!` : `REJECTED! Correct stamp: "${choices[correctIndex]}".`);
      });
      gridEl.appendChild(b);
      btns.push(b);
    });
    ctx.registerTimeoutDraft(() => {
      btns[correctIndex]?.classList.add('is-correct');
      ctx.finish(false, 0, 'quote_stamp_timeout', `TIME UP! Correct stamp: "${choices[correctIndex]}".`);
    });
    return;
  }

  // --- Toys 41 (4-Clue Jackpot), 42 (Symphony Ear), 43 (Camera Iris), 44 (Redaction Peel), 49 (Suspect Lineup), 50 (Riddle Cylinder) ---
  const pots = [1000, 750, 500, 250];
  let revealedCount = 1;
  const deck = document.createElement('div');
  deck.className = 'v6ta-reveal-deck';

  const revealBtnLabel =
    spec.mode === 'REVEAL_CAMERA_IRIS'
      ? 'OPEN APERTURE'
      : spec.mode === 'REVEAL_REDACTION_PEEL'
        ? 'PEEL CENSOR STRIP'
        : spec.mode === 'REVEAL_SYMPHONY_EAR'
          ? 'DROP NEEDLE / NEXT PHRASE'
          : spec.mode === 'REVEAL_RIDDLE_CYLINDER'
            ? 'CRANK CYLINDER'
            : spec.mode === 'REVEAL_SUSPECT_LINEUP'
              ? 'WITNESS SPOTLIGHT'
              : 'REVEAL NEXT CLUE';

  deck.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0;">
      <span style="font-family:'JetBrains Mono',monospace;font-size:clamp(11px,2.8vw,14px);font-weight:800;color:#4be5a4;" data-pot>JACKPOT POT: $1,000</span>
      <button type="button" class="v6ta-steel-btn" style="min-height:32px;padding:4px 10px;font-size:11px;" data-more>${revealBtnLabel} (-$250)</button>
    </div>
    <div class="v6ta-clue-stack" data-stack></div>
    <div class="v6ta-choice-grid" data-grid></div>
  `;
  stageEl.appendChild(deck);

  const potEl = deck.querySelector('[data-pot]') as HTMLElement;
  const moreBtn = deck.querySelector('[data-more]') as HTMLButtonElement;
  const stackEl = deck.querySelector('[data-stack]') as HTMLElement;
  const gridEl = deck.querySelector('[data-grid]') as HTMLElement;

  const renderShutters = (): void => {
    const curPot = pots[Math.min(revealedCount - 1, 3)];
    potEl.textContent = `JACKPOT POT: $${curPot.toLocaleString('en-US')}`;
    moreBtn.disabled = revealedCount >= 4;
    if (revealedCount >= 4) moreBtn.textContent = 'ALL 4 CLUES OPEN';
    stackEl.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const open = i < revealedCount;
      const row = document.createElement('div');
      row.className = `v6ta-shutter-row ${open ? 'is-open' : ''}`;
      const lockedText =
        spec.mode === 'REVEAL_REDACTION_PEEL'
          ? '██████████ CLASSIFIED ██████████'
          : spec.mode === 'REVEAL_CAMERA_IRIS'
            ? `APERTURE f/${[16, 8, 4, 1.4][i]} — LOCKED`
            : `CLUE #${i + 1} — SHUTTER CLOSED`;
      row.innerHTML = `
        <span class="v6ta-shutter-text">${open ? escapeHtml(hints[i]) : lockedText}</span>
        <span class="v6ta-pot-badge" style="color:${open ? '#f4cd74' : '#6c7588'};">$${pots[i]}</span>
      `;
      if (!open) {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => revealNext());
      }
      stackEl.appendChild(row);
    }
  };

  const revealNext = (): boolean => {
    if (ctx.isResolved() || revealedCount >= 4) return false;
    revealedCount += 1;
    ctx.playFoley(spec.foleyInteract);
    renderShutters();
    return true;
  };
  moreBtn.addEventListener('click', () => revealNext());
  ctx.registerFoilHandler((kind) => (kind === 'REVEAL_HINT' ? revealNext() : false));
  renderShutters();

  const btns: HTMLButtonElement[] = [];
  choices.forEach((ch, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'v6ta-choice-plaque';
    b.innerHTML = `<span class="v6ta-key-badge">${spec.mode === 'REVEAL_QUOTE_STAMP' ? 'INK' : String.fromCharCode(65 + idx)}</span><span class="v6ta-choice-text">${escapeHtml(ch)}</span>`;
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const won = idx === correctIndex;
      const potRatio = pots[Math.min(revealedCount - 1, 3)] / 1000;
      b.classList.add(won ? 'is-correct' : 'is-wrong');
      if (!won) btns[correctIndex]?.classList.add('is-correct');
      ctx.playFoley(won ? spec.foleyLock : 'nixie_spark_crackle');
      fx.burstAtElement(b, won ? 'RING' : 'SPARK', won ? ['#ffd76e', '#4be5a4'] : ['#ff5263'], 24);
      ctx.finish(
        won,
        won ? potRatio : 0,
        `reveal_clue_${revealedCount}_of_4`,
        won
          ? `${spec.safeTag} Locked on Clue #${revealedCount} for $${pots[revealedCount - 1]}!`
          : `MISSED! Answer was "${choices[correctIndex]}".`,
        won && revealedCount === 1 ? 0.75 : 0,
      );
    });
    gridEl.appendChild(b);
    btns.push(b);
  });

  ctx.registerTimeoutDraft(() => {
    btns[correctIndex]?.classList.add('is-correct');
    ctx.finish(false, 0, `reveal_timeout_${spec.toyNumber}`, `TIME UP! Answer was "${choices[correctIndex]}".`);
  });
}

// ============================================================================
// PUBLIC MASTER ENTRYPOINT: mountToyStageA (Toys 001–050)
// ============================================================================

export function resolveToySpecA(toy: ToyDefinitionV6 | string | number): ToySpec001To050V6 {
  if (typeof toy === 'number') {
    return getToySpec001To050ByNumber(toy) ?? TOY_CATALOG_001_TO_050[0];
  }
  if (typeof toy === 'string') {
    return getToySpec001To050ById(toy) ?? TOY_CATALOG_001_TO_050[0];
  }
  return (
    getToySpec001To050ById(toy.toyId) ??
    getToySpec001To050ByNumber(toy.toyNumber) ??
    TOY_CATALOG_001_TO_050[0]
  );
}

/**
 * Mounts any of Question Toys `001–050` cleanly into `container` with strict
 * zero-scroll layout budgeting, automatic Phone Landscape Split-Stage, Stage World
 * theme adaptation, Canvas2D physical sparks, and full 4K 3D Relief Globe support.
 */
export function mountToyStageA(
  container: HTMLElement,
  toyInput: ToyDefinitionV6 | string | number,
  clue: CalibratedClueV6,
  options: ToyStageMountOptionsV6,
): ToyStageHandleV6 {
  ensureStylesInjected();
  const spec = resolveToySpecA(toyInput);
  const totalSec = Math.max(
    5,
    options.timeLimitSeconds ?? (spec.baseSeconds + (options.timerBonusSeconds ?? 0)),
  );
  const baseChips = options.baseChips ?? 400;

  // Build Root Zero-Scroll Shell
  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'v6ta-root';
  root.dataset.toyId = spec.toyId;
  root.dataset.toyNumber = String(spec.toyNumber);
  root.dataset.toyFamily = spec.family;

  // Inherit Stage World Theme seamlessly if provided
  const accentCss = options.stageTheme?.hudTheme.accentCss ?? spec.chassisTheme.metalAccent;
  root.style.setProperty('--v6ta-accent', accentCss);
  root.style.setProperty('--v6ta-glow', spec.chassisTheme.glowColor);
  root.style.setProperty('--v6ta-danger', spec.chassisTheme.dangerColor);
  root.style.setProperty('--v6ta-chassis', spec.chassisTheme.primaryBg);

  const starText = `★ ${clue.difficultyScore.toFixed(1)}`;
  root.innerHTML = `
    <header class="v6ta-header">
      <div class="v6ta-meta-row">
        <div class="v6ta-meta-left">
          <span class="v6ta-cat-tag">${escapeHtml(clue.categoryLabel)} · ${starText}</span>
          <span class="v6ta-callout">${escapeHtml(spec.actionCallout)}</span>
        </div>
        <div class="v6ta-nixie-clock" data-clock>${totalSec.toFixed(1)}s</div>
      </div>
      <p class="v6ta-prompt">${escapeHtml(clue.prompt)}</p>
      <div class="v6ta-tip-row">
        <span class="v6ta-micro-tip" data-tip>${escapeHtml(spec.microTip)}</span>
      </div>
      <div class="v6ta-timer-rail"><div class="v6ta-timer-fill" data-timer-fill></div></div>
    </header>
    <section class="v6ta-stage" data-stage></section>
  `;
  container.appendChild(root);

  const clockEl = root.querySelector('[data-clock]') as HTMLElement;
  const fillEl = root.querySelector('[data-timer-fill]') as HTMLElement;
  const tipEl = root.querySelector('[data-tip]') as HTMLElement;
  const stageEl = root.querySelector('[data-stage]') as HTMLElement;
  const fx = new StageParticleOverlay(stageEl);

  // Automatic container-aware Landscape Split-Stage switching (660x340 & 844x390!)
  const syncResponsiveSplit = (): void => {
    const w = root.clientWidth || window.innerWidth;
    const h = root.clientHeight || window.innerHeight;
    const landscapeSplit = w >= 540 && h <= 540 && w / Math.max(1, h) >= 1.32;
    root.classList.toggle('is-landscape-split', landscapeSplit);
    fx.resize();
  };
  syncResponsiveSplit();
  const resizeObserver = new ResizeObserver(syncResponsiveSplit);
  resizeObserver.observe(root);

  let remainingSec = totalSec;
  let resolved = false;
  let disposed = false;
  let lastTickWhole = Math.ceil(totalSec);
  const cleanups: Array<() => void> = [];
  let foilHandler: ((kind: ToyFoilAssistKindV6) => boolean) | null = null;
  let timeoutDraftHandler: (() => void) | null = null;

  const playFoley = (sfx: FoleySfxIdV6): void => {
    if (disposed) return;
    if (options.onPlayFoley) options.onPlayFoley(sfx);
    else if (options.onSfx) options.onSfx(sfx);
  };

  const finish = (
    correct: boolean,
    accuracyRatio: number,
    specificActionTag: string,
    bannerText: string,
    multDeltaOverride?: number,
  ): void => {
    if (resolved || disposed) return;
    resolved = true;
    window.clearInterval(clockInterval);

    const safeAcc = clamp(accuracyRatio, 0, 1);
    const speedBonus = correct ? Math.round((remainingSec / totalSec) * 140) : 0;
    const chipsEarned = correct
      ? Math.max(50, Math.round(baseChips * (0.45 + 0.55 * safeAcc)) + speedBonus)
      : 0;
    const multDelta =
      multDeltaOverride !== undefined ? multDeltaOverride : correct ? 0.25 : 0;

    // Crisp zero-scroll overlay reveal ribbon inside gadget stage
    const ribbon = document.createElement('div');
    ribbon.className = `v6ta-result-ribbon ${correct ? 'is-win' : 'is-miss'}`;
    ribbon.innerHTML = `
      <span>${escapeHtml(bannerText)}</span>
      <span style="font-family:'JetBrains Mono',monospace;white-space:nowrap;">${correct ? `+${chipsEarned} CHIPS` : 'TRAPDOOR!'}</span>
    `;
    stageEl.appendChild(ribbon);

    if (clue.wittyHostAside) {
      tipEl.textContent = clue.wittyHostAside;
      tipEl.style.color = '#f5d27a';
    }

    options.onResolve({
      correct,
      accuracyRatio: safeAcc,
      secondsRemaining: Number(remainingSec.toFixed(2)),
      chipsEarned,
      multDelta,
      specificActionTag,
    });
  };

  // Shot clock ticking smoothly at 10Hz
  let lastClockMs = performance.now();
  const clockInterval = window.setInterval(() => {
    if (resolved || disposed) return;
    const now = performance.now();
    const dt = (now - lastClockMs) / 1000;
    lastClockMs = now;
    remainingSec = Math.max(0, remainingSec - dt);

    clockEl.textContent = `${remainingSec.toFixed(1)}s`;
    clockEl.classList.toggle('is-urgent', remainingSec <= 4.5);
    fillEl.style.transform = `scaleX(${clamp(remainingSec / totalSec, 0, 1)})`;

    const whole = Math.ceil(remainingSec);
    if (whole < lastTickWhole && whole <= 5 && whole > 0) {
      playFoley('clock_escapement_urgent');
    }
    lastTickWhole = whole;

    if (remainingSec <= 0) {
      if (timeoutDraftHandler) timeoutDraftHandler();
      else finish(false, 0, `timeout_${spec.toyNumber}`, 'TIME EXPIRED!');
    }
  }, 100);

  const engineCtx: EngineMountContext = {
    spec,
    clue,
    stageEl,
    tipEl,
    fx,
    options,
    getRemainingSec: () => remainingSec,
    isResolved: () => resolved,
    playFoley,
    emitInterim: (tag, detail) => options.onInterimAction?.(tag, detail),
    finish,
    registerCleanup: (fn) => cleanups.push(fn),
    registerFoilHandler: (fn) => { foilHandler = fn; },
    registerTimeoutDraft: (fn) => { timeoutDraftHandler = fn; },
  };

  // Dispatch to the exact Mechanical Family Engine
  switch (spec.family) {
    case 'DEFUSAL_ELIMINATION':
      mountDefusalEngine(engineCtx);
      break;
    case 'ATLAS_RELIEF_SPATIAL':
      mountAtlasSpatialEngine(engineCtx);
      break;
    case 'DIALS_CRYPTEX_LOCKS':
      mountDialsCryptexEngine(engineCtx);
      break;
    case 'RAPID_PADDLES_REFLEX':
      mountReflexPaddlesEngine(engineCtx);
      break;
    case 'PROGRESSIVE_AUDIO_REVEAL':
      mountProgressiveRevealEngine(engineCtx);
      break;
    default:
      mountDefusalEngine(engineCtx);
      break;
  }

  const applyFoilAssistInternal = (kind: ToyFoilAssistKindV6): boolean => {
    if (resolved || disposed) return false;
    if (kind === 'ADD_TIME') {
      remainingSec = Math.min(totalSec + 8, remainingSec + 6);
      playFoley('foil_card_flick');
      return true;
    }
    if (foilHandler && foilHandler(kind)) {
      if (kind === 'REVEAL_HINT') options.onHintUsed?.();
      return true;
    }
    if (kind === 'REVEAL_HINT') {
      const hints = resolveProgressiveHints(clue);
      tipEl.textContent = `HINT: ${hints[2]}`;
      tipEl.style.color = '#56d8ff';
      playFoley('foil_card_flick');
      options.onHintUsed?.();
      return true;
    }
    return false;
  };

  return {
    toyId: spec.toyId,
    toyNumber: spec.toyNumber,
    toySpec: spec,
    triggerHint: () => {
      applyFoilAssistInternal('REVEAL_HINT');
    },
    applyFoilEffect: (effectKind: FoilTrickCardV6['effectKind']): boolean => {
      if (effectKind === 'DEFUSE_ONE_WIRE') return applyFoilAssistInternal('DEFUSE_ONE_WIRE');
      if (effectKind === 'FREEZE_NODE') return applyFoilAssistInternal('ADD_TIME');
      if (effectKind === 'REVEAL_MOLE') return applyFoilAssistInternal('REVEAL_HINT');
      return false;
    },
    applyFoilAssist: applyFoilAssistInternal,
    forceTimeout: () => {
      if (resolved || disposed) return;
      remainingSec = 0;
      clockEl.textContent = '0.0s';
      fillEl.style.transform = 'scaleX(0)';
      if (timeoutDraftHandler) timeoutDraftHandler();
      else finish(false, 0, `forced_timeout_${spec.toyNumber}`, 'TIME EXPIRED!');
    },
    getSecondsRemaining: () => Number(remainingSec.toFixed(2)),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      window.clearInterval(clockInterval);
      resizeObserver.disconnect();
      for (const fn of cleanups) {
        try {
          fn();
        } catch {
          // ignore cleanup errors on unmount
        }
      }
      fx.dispose();
      if (root.parentElement === container) {
        container.removeChild(root);
      }
    },
  };
}
