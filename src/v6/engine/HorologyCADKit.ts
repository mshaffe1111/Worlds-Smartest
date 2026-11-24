// ============================================================================
// WORLD'S SMARTEST v6.0 — Horology CAD Kit, Procedural PBR Factory & Physics
// Reusable high-precision Three.js WebGL2 procedural 3D builders shared across
// Stage Worlds, 100 Contraption Boards, 100 Question Toys, Trophies & Relics.
// ============================================================================

import * as THREE from 'three';
import type { HonorAwardDefinitionV6, RelicDefinitionV6 } from '../contracts_v6';

// ----------------------------------------------------------------------------
// 1. Deterministic Noise & Procedural PBR Texture Factory (Albedo + Sobel Normal + Roughness)
// ----------------------------------------------------------------------------

export type ProceduralSurfaceKindV6 =
  | 'MAHOGANY_PLANKS'
  | 'CARRARA_MARBLE'
  | 'NERO_GOLD_MARBLE'
  | 'EMERALD_FELT'
  | 'WALNUT_BURL'
  | 'TEAK_DECK'
  | 'WRINKLE_OLIVE_STEEL'
  | 'URUSHI_KINTSUGI'
  | 'HAMMERED_COPPER'
  | 'VERDIGRIS_COPPER'
  | 'WET_BASALT'
  | 'ALABASTER_STONE'
  | 'PLEATED_VELVET'
  | 'COTES_DE_GENEVE'
  | 'BRAIDED_CLOTH_WIRE'
  | 'PIER_TIMBER';

export interface ProceduralPbrTextureSet {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

const pbrTextureCache = new Map<string, ProceduralPbrTextureSet>();
const SHARED_TEXTURE_FLAG = '__v6SharedPbrTex';

function fract(v: number): number {
  return v - Math.floor(v);
}

function hash2D(ix: number, iy: number, seed: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123;
  return fract(n);
}

/** Seamless tileable 2D value noise on period `period`. */
function tileNoise(u: number, v: number, period: number, seed: number): number {
  const x = u * period;
  const y = v * period;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const ix0 = ((x0 % period) + period) % period;
  const iy0 = ((y0 % period) + period) % period;
  const ix1 = (ix0 + 1) % period;
  const iy1 = (iy0 + 1) % period;

  const n00 = hash2D(ix0, iy0, seed);
  const n10 = hash2D(ix1, iy0, seed);
  const n01 = hash2D(ix0, iy1, seed);
  const n11 = hash2D(ix1, iy1, seed);

  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

function tileFbm(u: number, v: number, basePeriod: number, octaves: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let period = basePeriod;
  for (let i = 0; i < octaves; i++) {
    sum += tileNoise(u, v, period, seed + i * 19.3) * amp;
    norm += amp;
    amp *= 0.5;
    period *= 2;
  }
  return sum / norm;
}

/** Tileable cellular Voronoi distance (for hammered copper peen dimples & basalt pores). */
function tileVoronoi(u: number, v: number, cells: number, seed: number): { d1: number; d2: number; cellId: number } {
  const x = u * cells;
  const y = v * cells;
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  let d1 = 99;
  let d2 = 99;
  let cellId = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      const gx = ((cx + ox) % cells + cells) % cells;
      const gy = ((cy + oy) % cells + cells) % cells;
      const px = cx + ox + 0.15 + 0.7 * hash2D(gx, gy, seed);
      const py = cy + oy + 0.15 + 0.7 * hash2D(gx, gy, seed + 53.1);
      const dx = px - x;
      const dy = py - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < d1) {
        d2 = d1;
        d1 = dist;
        cellId = hash2D(gx, gy, seed + 101.7);
      } else if (dist < d2) {
        d2 = dist;
      }
    }
  }
  return { d1, d2, cellId };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function createCanvas(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

function buildNormalCanvasFromHeight(height: Float32Array, size: number, strength: number): HTMLCanvasElement {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  const mask = size - 1;

  for (let y = 0; y < size; y++) {
    const ym = (y - 1) & mask;
    const yp = (y + 1) & mask;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1) & mask;
      const xp = (x + 1) & mask;

      const tl = height[ym * size + xm];
      const tc = height[ym * size + x];
      const tr = height[ym * size + xp];
      const ml = height[y * size + xm];
      const mr = height[y * size + xp];
      const bl = height[yp * size + xm];
      const bc = height[yp * size + x];
      const br = height[yp * size + xp];

      const gx = (tr + 2 * mr + br) - (tl + 2 * ml + bl);
      const gy = (bl + 2 * bc + br) - (tl + 2 * tc + tr);

      let nx = -gx * strength;
      let ny = -gy * strength;
      let nz = 1.0;
      const invLen = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx *= invLen;
      ny *= invLen;
      nz *= invLen;

      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  repeatX: number,
  repeatY: number,
  isColor: boolean,
  anisotropy: number
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = Math.max(1, Math.min(16, anisotropy));
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_TEXTURE_FLAG] = true;
  return tex;
}

/**
 * Generates or retrieves cached deterministic seamless PBR texture sets
 * (Albedo + Sobel Tangent-Space Normal Map + Micro-Roughness Map).
 */
export function getProceduralPbrTextureSet(
  kind: ProceduralSurfaceKindV6,
  options?: {
    repeatX?: number;
    repeatY?: number;
    size?: 256 | 512;
    anisotropy?: number;
  }
): ProceduralPbrTextureSet {
  const repeatX = options?.repeatX ?? 1;
  const repeatY = options?.repeatY ?? 1;
  const size = options?.size ?? 256;
  const anisotropy = options?.anisotropy ?? 8;
  const cacheKey = `${kind}_${size}_${repeatX}x${repeatY}`;
  const cached = pbrTextureCache.get(cacheKey);
  if (cached) return cached;

  const albedoCanvas = createCanvas(size);
  const roughCanvas = createCanvas(size);
  const aCtx = albedoCanvas.getContext('2d')!;
  const rCtx = roughCanvas.getContext('2d')!;
  const aImg = aCtx.createImageData(size, size);
  const rImg = rCtx.createImageData(size, size);
  const height = new Float32Array(size * size);

  let normalStrength = 2.4;

  for (let py = 0; py < size; py++) {
    const v = py / size;
    for (let px = 0; px < size; px++) {
      const u = px / size;
      const pIdx = py * size + px;
      const rgbaIdx = pIdx * 4;

      let r = 128;
      let g = 128;
      let b = 128;
      let h = 0.5;
      let rough = 0.5;

      switch (kind) {
        case 'MAHOGANY_PLANKS': {
          normalStrength = 0.58;
          const planks = 7;
          const plankRow = Math.floor(v * planks);
          const localV = fract(v * planks);
          const stagger = (plankRow % 2) * 0.5 + hash2D(plankRow, 7, 11) * 0.28;
          const localU = fract(u + stagger);
          const plankTone = 0.86 + 0.28 * hash2D(plankRow, Math.floor(u + stagger), 3);

          // Satin French-polished Broadway stage planks — fine hairline seams, zero choppy brick-bump
          const grooveV = smoothstep(0.0, 0.022, localV) * smoothstep(0.0, 0.022, 1.0 - localV);
          const grooveU = smoothstep(0.0, 0.008, localU) * smoothstep(0.0, 0.008, 1.0 - localU);
          const groove = 0.25 + 0.75 * grooveV * grooveU;

          const warp = tileFbm(u, v, 3, 3, 17) * 0.1;
          const grain = Math.sin((localV * 10 + warp * 14 + tileFbm(u * 0.5, v * 3, 6, 3, 29) * 2.2) * Math.PI);
          const fineFiber = tileNoise(u, v, 24, 41);
          const polish = tileFbm(u, v, 4, 3, 88);

          const woodVal = clamp01(0.5 + 0.22 * grain + 0.06 * fineFiber);
          r = lerp(42, 134, woodVal) * plankTone * groove;
          g = lerp(19, 64, woodVal) * plankTone * groove;
          b = lerp(11, 34, woodVal) * plankTone * groove;
          h = 0.52 + 0.14 * groove + 0.06 * grain;
          rough = lerp(0.24, 0.44, clamp01(0.32 + polish * 0.38 + (1 - groove) * 0.35));
          break;
        }

        case 'CARRARA_MARBLE': {
          normalStrength = 1.25;
          const w1 = tileFbm(u, v, 3, 4, 13);
          const w2 = tileFbm(u + w1 * 0.42, v + w1 * 0.3, 4, 4, 31);
          const veinWave = Math.abs(Math.sin((u * 3.0 + v * 2.0 + w2 * 3.5) * Math.PI));
          const primaryVein = Math.pow(1.0 - veinWave, 5.2);
          const secondaryWave = Math.abs(Math.sin((u * 5.0 - v * 4.0 + w1 * 4.2) * Math.PI));
          const fineVein = Math.pow(1.0 - secondaryWave, 10.5) * 0.72;
          const goldTrace = Math.pow(1.0 - Math.abs(Math.sin((u * 2.0 - v * 3.0 + w2 * 3.8) * Math.PI)), 18.0);
          const vein = clamp01(primaryVein * 0.92 + fineVein);
          const baseCloud = tileFbm(u, v, 6, 3, 55);

          // Rich museum Carrara tone (205..224 ivory base with unmistakable slate-blue & subtle gold veins!)
          r = lerp(222 - baseCloud * 20, 102, vein) + goldTrace * 58;
          g = lerp(218 - baseCloud * 18, 109, vein) + goldTrace * 44;
          b = lerp(213 - baseCloud * 15, 124, vein) + goldTrace * 12;
          h = 0.6 - vein * 0.22 + baseCloud * 0.04;
          rough = lerp(0.18, 0.44, clamp01(vein * 0.75 + baseCloud * 0.2));
          break;
        }

        case 'NERO_GOLD_MARBLE': {
          normalStrength = 2.0;
          const w1 = tileFbm(u, v, 4, 4, 101);
          const w2 = tileFbm(u + w1 * 0.42, v - w1 * 0.31, 4, 4, 119);
          const fracture = Math.abs(Math.sin((u * 2.0 + v * 3.0 + w2 * 3.6) * Math.PI));
          const goldVein = Math.pow(1.0 - fracture, 16.0);
          const whiteFracture = Math.abs(Math.sin((u * 4.0 - v * 2.0 + w1 * 3.0) * Math.PI));
          const calciteVein = Math.pow(1.0 - whiteFracture, 22.0) * 0.55;
          const darkCloud = tileFbm(u, v, 6, 3, 142);

          r = lerp(18 + darkCloud * 16, 238, goldVein) + calciteVein * 90;
          g = lerp(18 + darkCloud * 15, 192, goldVein) + calciteVein * 86;
          b = lerp(22 + darkCloud * 18, 76, goldVein) + calciteVein * 82;
          h = 0.58 - goldVein * 0.14 - calciteVein * 0.18 + darkCloud * 0.05;
          rough = lerp(0.12, 0.34, clamp01(darkCloud * 0.35 + (1 - goldVein) * 0.15));
          break;
        }

        case 'EMERALD_FELT': {
          normalStrength = 2.6;
          const twill = ((px + py) & 3) < 2 ? 0.55 : 0.45;
          const micro = tileNoise(u, v, 128, 71);
          const macroWear = tileFbm(u, v, 4, 3, 73);
          const fuzz = clamp01(twill * 0.45 + micro * 0.55);

          r = lerp(10, 26, fuzz) + macroWear * 8;
          g = lerp(74, 114, fuzz) + macroWear * 14;
          b = lerp(49, 74, fuzz) + macroWear * 8;
          h = 0.4 + fuzz * 0.45 + macroWear * 0.1;
          rough = lerp(0.84, 0.96, clamp01(0.5 + micro * 0.5));
          break;
        }

        case 'WALNUT_BURL': {
          normalStrength = 2.2;
          const swirlX = tileFbm(u, v, 4, 4, 211);
          const swirlY = tileFbm(u + 0.3, v + 0.7, 4, 4, 223);
          const rings = Math.sin((swirlX * 9.5 + swirlY * 7.5) * Math.PI) * 0.5 + 0.5;
          const knots = tileVoronoi(u, v, 5, 229);
          const knotRing = Math.sin(knots.d1 * 28.0) * 0.5 + 0.5;
          const vMix = clamp01(rings * 0.65 + knotRing * 0.35);

          r = lerp(42, 112, vMix);
          g = lerp(22, 62, vMix);
          b = lerp(12, 34, vMix);
          h = 0.48 + vMix * 0.25;
          rough = lerp(0.22, 0.38, 1 - vMix);
          break;
        }

        case 'TEAK_DECK': {
          normalStrength = 3.6;
          const planks = 8;
          const row = Math.floor(v * planks);
          const lv = fract(v * planks);
          const caulk = smoothstep(0.0, 0.055, lv) * smoothstep(0.0, 0.055, 1.0 - lv);
          const butt = smoothstep(0.0, 0.018, fract(u * 2 + (row % 2) * 0.5));
          const seam = caulk * butt;
          const tone = 0.84 + 0.32 * hash2D(row, Math.floor(u * 2), 91);
          const grain = tileFbm(u, v * 4, 8, 3, 97);

          r = lerp(24, 134 * tone, seam) * (0.8 + 0.3 * grain);
          g = lerp(20, 92 * tone, seam) * (0.8 + 0.3 * grain);
          b = lerp(17, 50 * tone, seam) * (0.8 + 0.3 * grain);
          h = seam * (0.62 + 0.22 * grain);
          rough = lerp(0.42, 0.72, clamp01((1 - seam) * 0.5 + grain * 0.45));
          break;
        }

        case 'WRINKLE_OLIVE_STEEL': {
          normalStrength = 1.25;
          const fine = tileNoise(u, v, 48, 307);
          const pebble = tileFbm(u, v, 16, 3, 311);
          const panelU = smoothstep(0.0, 0.022, fract(u * 2)) * smoothstep(0.0, 0.022, 1 - fract(u * 2));
          const panelV = smoothstep(0.0, 0.022, fract(v * 2)) * smoothstep(0.0, 0.022, 1 - fract(v * 2));
          const panel = panelU * panelV;
          const bump = clamp01(pebble * 0.65 + fine * 0.35);

          r = lerp(48, 76, bump) * (0.52 + 0.48 * panel);
          g = lerp(56, 86, bump) * (0.52 + 0.48 * panel);
          b = lerp(46, 70, bump) * (0.52 + 0.48 * panel);
          h = panel * (0.48 + bump * 0.35);
          rough = lerp(0.52, 0.72, clamp01(0.3 + fine * 0.45));
          break;
        }

        case 'URUSHI_KINTSUGI': {
          normalStrength = 1.65;
          const warp = tileFbm(u, v, 3, 3, 401);
          const vor = tileVoronoi(u + warp * 0.11, v + warp * 0.11, 3, 409);
          const edgeDist = vor.d2 - vor.d1;
          const kintsugi = 1.0 - smoothstep(0.008, 0.028, edgeDist);
          const vermilionPanel = vor.cellId > 0.72 ? 1.0 : 0.0;
          const lacquerDepth = tileFbm(u, v, 6, 2, 419);

          const baseR = lerp(18, 152, vermilionPanel) + lacquerDepth * 8;
          const baseG = lerp(14, 26, vermilionPanel) + lacquerDepth * 4;
          const baseB = lerp(17, 20, vermilionPanel) + lacquerDepth * 4;

          const goldGrain = tileNoise(u, v, 48, 431);
          r = lerp(baseR, 246 - goldGrain * 20, kintsugi);
          g = lerp(baseG, 200 - goldGrain * 16, kintsugi);
          b = lerp(baseB, 78 - goldGrain * 12, kintsugi);
          h = 0.52 + kintsugi * (0.22 + goldGrain * 0.06);
          rough = lerp(0.08 + lacquerDepth * 0.04, 0.24 + goldGrain * 0.08, kintsugi);
          break;
        }

        case 'HAMMERED_COPPER':
        case 'VERDIGRIS_COPPER': {
          normalStrength = 1.65;
          const vor = tileVoronoi(u, v, 10, 503);
          const dimple = clamp01(1.0 - vor.d1 * 1.15);
          const ridge = smoothstep(0.0, 0.16, vor.d2 - vor.d1);
          const micro = tileFbm(u, v, 12, 3, 509);
          const patinaMask =
            kind === 'VERDIGRIS_COPPER'
              ? clamp01((1.0 - ridge) * 0.72 + tileFbm(u, v, 6, 3, 521) * 0.68 - 0.22)
              : clamp01((1.0 - ridge) * 0.16);

          const copR = lerp(152, 218, dimple * 0.55 + micro * 0.45);
          const copG = lerp(80, 134, dimple * 0.55 + micro * 0.45);
          const copB = lerp(46, 84, dimple * 0.55 + micro * 0.45);

          r = lerp(copR, 68, patinaMask);
          g = lerp(copG, 164, patinaMask);
          b = lerp(copB, 144, patinaMask);
          h = 0.42 + (1.0 - dimple * 0.35) * 0.36 + micro * 0.06;
          rough = lerp(0.28, 0.7, clamp01(patinaMask * 0.8 + micro * 0.22));
          break;
        }

        case 'WET_BASALT': {
          normalStrength = 2.0;
          const slabU = smoothstep(0.0, 0.025, fract(u * 3)) * smoothstep(0.0, 0.025, 1 - fract(u * 3));
          const slabV = smoothstep(0.0, 0.025, fract(v * 3)) * smoothstep(0.0, 0.025, 1 - fract(v * 3));
          const slab = slabU * slabV;
          const rock = tileFbm(u, v, 8, 4, 601);
          const pores = tileVoronoi(u, v, 20, 607);
          const poreDip = smoothstep(0.08, 0.26, pores.d1);
          const puddle = smoothstep(0.48, 0.68, tileFbm(u, v, 3, 3, 619));

          const shade = (0.4 + 0.6 * slab) * (0.76 + 0.24 * poreDip);
          r = lerp(24, 52, rock) * shade * (1 - puddle * 0.22);
          g = lerp(33, 68, rock) * shade * (1 - puddle * 0.16);
          b = lerp(40, 78, rock) * shade * (1 - puddle * 0.12);
          h = slab * lerp(rock * 0.65 + poreDip * 0.25, 0.5, puddle * 0.78);
          rough = lerp(0.68, 0.12, puddle);
          break;
        }

        case 'ALABASTER_STONE': {
          normalStrength = 1.25;
          const cloud = tileFbm(u, v, 4, 4, 701);
          const w2 = tileFbm(u + cloud * 0.35, v - cloud * 0.28, 4, 4, 719);
          const veinA = Math.pow(1 - Math.abs(Math.sin((u * 2.0 + v * 3.0 + w2 * 3.2) * Math.PI)), 5.8);
          const veinB = Math.pow(1 - Math.abs(Math.sin((u * 4.0 - v * 2.0 + cloud * 3.8) * Math.PI)), 12.0) * 0.65;
          const vein = clamp01(veinA + veinB);
          const copperFleck = Math.pow(1 - Math.abs(Math.sin((u * 3.0 + v * 4.0 + w2 * 2.8) * Math.PI)), 16.0);

          // Rich twilight alabaster stone (never clips to flat white; veins & copper flecks shine!)
          r = lerp(206 - cloud * 24, 114, vein) + copperFleck * 46;
          g = lerp(204 - cloud * 22, 120, vein) + copperFleck * 26;
          b = lerp(218 - cloud * 18, 146, vein) + copperFleck * 14;
          h = 0.58 - vein * 0.18 + cloud * 0.06;
          rough = lerp(0.2, 0.44, cloud * 0.55 + vein * 0.35);
          break;
        }

        case 'PLEATED_VELVET': {
          normalStrength = 4.6;
          const folds = Math.sin(u * Math.PI * 14.0 + tileFbm(u, v, 3, 2, 809) * 0.7) * 0.5 + 0.5;
          const subFold = Math.sin(u * Math.PI * 28.0) * 0.15;
          const nap = tileNoise(u, v, 128, 811);
          const f = clamp01(folds + subFold);

          r = lerp(42, 168, f) + nap * 8;
          g = lerp(5, 22, f) + nap * 3;
          b = lerp(10, 36, f) + nap * 4;
          h = 0.15 + f * 0.78 + nap * 0.05;
          rough = lerp(0.76, 0.94, 1 - f * 0.5);
          break;
        }

        case 'COTES_DE_GENEVE': {
          normalStrength = 0.65;
          const band = fract(u * 8);
          const arc = Math.sin((band * 1.0 + Math.sin(v * Math.PI * 6) * 0.06) * Math.PI);
          const microBrush = tileNoise(u, v, 32, 907);
          const sheen = clamp01(arc * 0.75 + microBrush * 0.25);

          r = lerp(194, 238, sheen);
          g = lerp(154, 198, sheen);
          b = lerp(100, 140, sheen);
          h = 0.46 + arc * 0.18 + microBrush * 0.04;
          rough = lerp(0.18, 0.32, 1 - sheen);
          break;
        }

        case 'BRAIDED_CLOTH_WIRE': {
          normalStrength = 4.0;
          const diagA = Math.sin((u * 16 + v * 16) * Math.PI * 2) * 0.5 + 0.5;
          const diagB = Math.sin((u * 16 - v * 16) * Math.PI * 2) * 0.5 + 0.5;
          const weave = Math.max(diagA, diagB);
          const thread = tileNoise(u, v, 128, 977);

          r = lerp(150, 242, weave) - thread * 14;
          g = lerp(150, 242, weave) - thread * 14;
          b = lerp(150, 242, weave) - thread * 14;
          h = 0.25 + weave * 0.68 + thread * 0.06;
          rough = lerp(0.72, 0.92, 1 - weave * 0.4);
          break;
        }

        case 'PIER_TIMBER': {
          normalStrength = 3.8;
          const planks = 7;
          const row = Math.floor(v * planks);
          const lv = fract(v * planks);
          const gap = smoothstep(0.0, 0.05, lv) * smoothstep(0.0, 0.05, 1 - lv);
          const damp = smoothstep(0.42, 0.72, tileFbm(u, v, 3, 3, 1013));
          const grain = tileFbm(u, v * 4, 8, 3, 1021);
          const shade = (0.76 + 0.34 * hash2D(row, 3, 1031)) * (0.22 + 0.78 * gap);

          r = lerp(34, 72, grain) * shade * (1 - damp * 0.22);
          g = lerp(38, 76, grain) * shade * (1 - damp * 0.16);
          b = lerp(46, 86, grain) * shade * (1 - damp * 0.12);
          h = gap * (0.48 + grain * 0.42);
          rough = lerp(0.66, 0.16, damp);
          break;
        }
      }

      aImg.data[rgbaIdx] = Math.round(clamp01(r / 255) * 255);
      aImg.data[rgbaIdx + 1] = Math.round(clamp01(g / 255) * 255);
      aImg.data[rgbaIdx + 2] = Math.round(clamp01(b / 255) * 255);
      aImg.data[rgbaIdx + 3] = 255;

      const rByte = Math.round(clamp01(rough) * 255);
      rImg.data[rgbaIdx] = rByte;
      rImg.data[rgbaIdx + 1] = rByte;
      rImg.data[rgbaIdx + 2] = rByte;
      rImg.data[rgbaIdx + 3] = 255;

      height[pIdx] = clamp01(h);
    }
  }

  aCtx.putImageData(aImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);
  const normalCanvas = buildNormalCanvasFromHeight(height, size, normalStrength);

  const set: ProceduralPbrTextureSet = {
    map: finalizeTexture(albedoCanvas, repeatX, repeatY, true, anisotropy),
    normalMap: finalizeTexture(normalCanvas, repeatX, repeatY, false, anisotropy),
    roughnessMap: finalizeTexture(roughCanvas, repeatX, repeatY, false, anisotropy),
  };
  pbrTextureCache.set(cacheKey, set);
  return set;
}

export function disposeProceduralTextureCache(): void {
  for (const set of pbrTextureCache.values()) {
    set.map.dispose();
    set.normalMap.dispose();
    set.roughnessMap.dispose();
  }
  pbrTextureCache.clear();
}

/**
 * Recursively disposes geometries, materials, and non-shared textures under a 3D object tree.
 */
export function disposeObject3DTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const mat of mats) {
      const m = mat as THREE.MeshStandardMaterial & Record<string, unknown>;
      const texKeys = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap', 'bumpMap'];
      for (const k of texKeys) {
        const tex = m[k] as THREE.Texture | undefined;
        if (tex && typeof tex.dispose === 'function') {
          const ud = tex.userData as Record<string, unknown> | undefined;
          if (!ud || !ud[SHARED_TEXTURE_FLAG]) {
            tex.dispose();
          }
        }
      }
      mat.dispose();
    }
  });
}

// ----------------------------------------------------------------------------
// 2. Involute Brass Gear Builder (`createInvoluteBrassGear`)
// ----------------------------------------------------------------------------

export interface InvoluteGearOptionsV6 {
  radius?: number;
  teeth?: number;
  thickness?: number;
  boreRadius?: number;
  spokes?: number;
  metalColorHex?: number;
  hubColorHex?: number;
  roughness?: number;
  metalness?: number;
  bevelSize?: number;
  includeRubyBearing?: boolean;
  includeBluedBolts?: boolean;
}

export function createInvoluteBrassGear(opts: InvoluteGearOptionsV6 = {}): THREE.Group {
  const radius = opts.radius ?? 0.65;
  const teeth = Math.max(8, Math.round(opts.teeth ?? 24));
  const thickness = opts.thickness ?? 0.1;
  const boreRadius = opts.boreRadius ?? radius * 0.18;
  const spokes = opts.spokes ?? (radius >= 0.4 ? 5 : 0);
  const metalColorHex = opts.metalColorHex ?? 0xd8a84a;
  const hubColorHex = opts.hubColorHex ?? 0xb88635;
  const roughness = opts.roughness ?? 0.24;
  const metalness = opts.metalness ?? 0.94;
  const bevelSize = opts.bevelSize ?? Math.min(0.018, thickness * 0.18);

  const group = new THREE.Group();
  group.name = 'InvoluteBrassGear';

  const addendum = (Math.PI * radius) / (teeth * 1.95);
  const dedendum = addendum * 1.18;
  const rootR = Math.max(boreRadius + 0.04, radius - dedendum);
  const tipR = radius + addendum;
  const pitchR = radius;
  const step = (Math.PI * 2) / teeth;

  const shape = new THREE.Shape();
  for (let i = 0; i < teeth; i++) {
    const baseA = i * step;
    const a0 = baseA;
    const a1 = baseA + step * 0.16;
    const a2 = baseA + step * 0.24;
    const a3 = baseA + step * 0.44;
    const a4 = baseA + step * 0.52;
    const a5 = baseA + step * 0.68;

    const p0x = Math.cos(a0) * rootR;
    const p0y = Math.sin(a0) * rootR;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);

    // Involute flank rise -> tip land -> trailing involute flank -> root valley
    shape.lineTo(Math.cos(a1) * pitchR, Math.sin(a1) * pitchR);
    shape.lineTo(Math.cos(a2) * tipR, Math.sin(a2) * tipR);
    shape.lineTo(Math.cos(a3) * tipR, Math.sin(a3) * tipR);
    shape.lineTo(Math.cos(a4) * pitchR, Math.sin(a4) * pitchR);
    shape.lineTo(Math.cos(a5) * rootR, Math.sin(a5) * rootR);
  }
  shape.closePath();

  // Central bore cutout
  if (boreRadius > 0.01) {
    const bore = new THREE.Path();
    bore.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
    shape.holes.push(bore);
  }

  // Weight-reduction spoked cutouts
  const innerWebR = Math.max(boreRadius * 1.85, rootR * 0.34);
  const outerWebR = rootR * 0.78;
  if (spokes >= 3 && outerWebR - innerWebR > 0.08) {
    const sector = (Math.PI * 2) / spokes;
    const margin = Math.min(0.18, sector * 0.2);
    for (let s = 0; s < spokes; s++) {
      const aStart = s * sector + margin;
      const aEnd = (s + 1) * sector - margin;
      if (aEnd <= aStart) continue;
      const hole = new THREE.Path();
      const arcSegs = 6;
      hole.moveTo(Math.cos(aStart) * innerWebR, Math.sin(aStart) * innerWebR);
      for (let k = 0; k <= arcSegs; k++) {
        const a = lerp(aStart, aEnd, k / arcSegs);
        hole.lineTo(Math.cos(a) * outerWebR, Math.sin(a) * outerWebR);
      }
      for (let k = arcSegs; k >= 0; k--) {
        const a = lerp(aStart, aEnd, k / arcSegs);
        hole.lineTo(Math.cos(a) * innerWebR, Math.sin(a) * innerWebR);
      }
      hole.closePath();
      shape.holes.push(hole);
    }
  }

  const pbr = getProceduralPbrTextureSet('COTES_DE_GENEVE', { repeatX: 2, repeatY: 2, size: 256 });
  const gearGeom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 2,
    curveSegments: 10,
  });
  gearGeom.translate(0, 0, -thickness * 0.5);
  gearGeom.rotateX(-Math.PI * 0.5);

  const gearMat = new THREE.MeshStandardMaterial({
    color: metalColorHex,
    roughness,
    metalness,
    normalMap: pbr.normalMap,
    normalScale: new THREE.Vector2(0.18, 0.18),
    roughnessMap: pbr.roughnessMap,
  });

  const gearMesh = new THREE.Mesh(gearGeom, gearMat);
  gearMesh.castShadow = true;
  gearMesh.receiveShadow = true;
  group.add(gearMesh);

  // Chamfered brass hub collar
  const hubMat = new THREE.MeshStandardMaterial({
    color: hubColorHex,
    roughness: Math.max(0.14, roughness - 0.05),
    metalness: 0.96,
  });
  const hubOuterR = Math.max(boreRadius * 1.65, radius * 0.24);
  const hubMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(hubOuterR * 0.92, hubOuterR, thickness * 1.48, 24),
    hubMat
  );
  hubMesh.castShadow = true;
  hubMesh.receiveShadow = true;
  group.add(hubMesh);

  // Thermally-blued Swiss horology bolts around the hub
  if (opts.includeBluedBolts !== false && radius >= 0.26) {
    const boltMat = new THREE.MeshStandardMaterial({
      color: 0x264c8f,
      roughness: 0.16,
      metalness: 0.95,
    });
    const boltGeom = new THREE.CylinderGeometry(radius * 0.028, radius * 0.028, thickness * 1.68, 8);
    const boltCount = Math.max(3, spokes || 4);
    const boltR = (boreRadius + hubOuterR) * 0.55;
    for (let b = 0; b < boltCount; b++) {
      const a = (b / boltCount) * Math.PI * 2;
      const bolt = new THREE.Mesh(boltGeom, boltMat);
      bolt.position.set(Math.cos(a) * boltR, 0, Math.sin(a) * boltR);
      group.add(bolt);
    }
  }

  // Optional synthetic horological ruby jewel bearing
  if (opts.includeRubyBearing) {
    const rubyMat = new THREE.MeshPhysicalMaterial({
      color: 0xb8103c,
      emissive: 0x400414,
      emissiveIntensity: 0.55,
      roughness: 0.08,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 1.0,
    });
    const ruby = new THREE.Mesh(
      new THREE.TorusGeometry(Math.max(0.03, boreRadius * 0.72), Math.max(0.015, thickness * 0.28), 12, 24),
      rubyMat
    );
    ruby.rotation.x = Math.PI * 0.5;
    ruby.position.y = thickness * 0.62;
    group.add(ruby);
  }

  return group;
}

// ----------------------------------------------------------------------------
// 3. Beveled Crystal Hex Builder (`createBeveledCrystalHex`)
// ----------------------------------------------------------------------------

export interface BeveledCrystalHexOptionsV6 {
  radius?: number;
  height?: number;
  crystalColorHex?: number;
  emissiveHex?: number;
  emissiveIntensity?: number;
  trimMetalHex?: number;
  roughness?: number;
  includeChainLugs?: boolean;
}

export function createBeveledCrystalHex(opts: BeveledCrystalHexOptionsV6 = {}): THREE.Group {
  const radius = opts.radius ?? 0.52;
  const height = opts.height ?? 0.16;
  const crystalColorHex = opts.crystalColorHex ?? 0x1e6091;
  const emissiveHex = opts.emissiveHex ?? 0x0a2540;
  const emissiveIntensity = opts.emissiveIntensity ?? 0.32;
  const trimMetalHex = opts.trimMetalHex ?? 0xdeb052;
  const roughness = opts.roughness ?? 0.12;

  const group = new THREE.Group();
  group.name = 'BeveledCrystalHex';

  // Build hexagonal crystal core with crisp architectural crown bevel
  const hexShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * (radius * 0.88);
    const y = Math.sin(a) * (radius * 0.88);
    if (i === 0) hexShape.moveTo(x, y);
    else hexShape.lineTo(x, y);
  }
  hexShape.closePath();

  const crystalGeom = new THREE.ExtrudeGeometry(hexShape, {
    depth: height * 0.7,
    bevelEnabled: true,
    bevelThickness: height * 0.24,
    bevelSize: radius * 0.08,
    bevelSegments: 2,
  });
  crystalGeom.rotateX(-Math.PI * 0.5);
  crystalGeom.translate(0, height * 0.14, 0);

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: crystalColorHex,
    emissive: emissiveHex,
    emissiveIntensity,
    roughness,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    reflectivity: 0.96,
    ior: 1.54,
  });

  const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
  crystalMesh.castShadow = true;
  crystalMesh.receiveShadow = true;
  group.add(crystalMesh);

  // Outer brass socket bezel frame
  const bezelShape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) bezelShape.moveTo(x, y);
    else bezelShape.lineTo(x, y);
  }
  bezelShape.closePath();

  const innerCut = new THREE.Path();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * (radius * 0.87);
    const y = Math.sin(a) * (radius * 0.87);
    if (i === 0) innerCut.moveTo(x, y);
    else innerCut.lineTo(x, y);
  }
  innerCut.closePath();
  bezelShape.holes.push(innerCut);

  const bezelGeom = new THREE.ExtrudeGeometry(bezelShape, {
    depth: height * 0.72,
    bevelEnabled: true,
    bevelThickness: height * 0.08,
    bevelSize: radius * 0.02,
    bevelSegments: 2,
  });
  bezelGeom.rotateX(-Math.PI * 0.5);

  const trimMat = new THREE.MeshStandardMaterial({
    color: trimMetalHex,
    roughness: 0.22,
    metalness: 0.94,
  });
  const bezelMesh = new THREE.Mesh(bezelGeom, trimMat);
  bezelMesh.castShadow = true;
  bezelMesh.receiveShadow = true;
  group.add(bezelMesh);

  // Optional corner iron/brass chain anchor lugs
  if (opts.includeChainLugs) {
    const lugGeom = new THREE.TorusGeometry(radius * 0.075, radius * 0.022, 8, 16);
    for (let i = 0; i < 6; i += 2) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const lug = new THREE.Mesh(lugGeom, trimMat);
      lug.position.set(Math.cos(a) * (radius * 0.98), height * 0.45, Math.sin(a) * (radius * 0.98));
      lug.rotation.y = -a;
      group.add(lug);
    }
  }

  return group;
}

// ----------------------------------------------------------------------------
// 4. Braided Cloth Wire Builder (`createBraidedClothWire`)
// ----------------------------------------------------------------------------

export interface BraidedClothWireOptionsV6 {
  start?: [number, number, number];
  end?: [number, number, number];
  sag?: number;
  arcOffset?: [number, number, number];
  radius?: number;
  colorHex?: number;
  terminalMetalHex?: number;
  tubularSegments?: number;
}

export interface BraidedClothWireHandleV6 {
  group: THREE.Group;
  setCut(cut: boolean): void;
  isCut(): boolean;
}

export function createBraidedClothWire(opts: BraidedClothWireOptionsV6 = {}): BraidedClothWireHandleV6 {
  const start = new THREE.Vector3(...(opts.start ?? [-0.7, 0.05, 0]));
  const end = new THREE.Vector3(...(opts.end ?? [0.7, 0.05, 0]));
  const radius = opts.radius ?? 0.036;
  const colorHex = opts.colorHex ?? 0xc42830;
  const terminalMetalHex = opts.terminalMetalHex ?? 0xd8a84e;
  const tubularSegments = opts.tubularSegments ?? 28;
  const sag = opts.sag ?? 0.22;

  const group = new THREE.Group();
  group.name = 'BraidedClothWire';

  const mid = start.clone().lerp(end, 0.5);
  mid.y += sag;
  if (opts.arcOffset) {
    mid.x += opts.arcOffset[0];
    mid.y += opts.arcOffset[1];
    mid.z += opts.arcOffset[2];
  }

  const p1 = start.clone().lerp(mid, 0.55);
  const p2 = end.clone().lerp(mid, 0.55);

  const intactCurve = new THREE.CatmullRomCurve3([start, p1, mid, p2, end]);
  const braidPbr = getProceduralPbrTextureSet('BRAIDED_CLOTH_WIRE', { repeatX: 12, repeatY: 2, size: 256 });

  const wireMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    map: braidPbr.map,
    normalMap: braidPbr.normalMap,
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughnessMap: braidPbr.roughnessMap,
    roughness: 0.85,
    metalness: 0.04,
  });

  const intactMesh = new THREE.Mesh(
    new THREE.TubeGeometry(intactCurve, tubularSegments, radius, 10, false),
    wireMat
  );
  intactMesh.castShadow = true;
  intactMesh.receiveShadow = true;
  group.add(intactMesh);

  // Pre-built snipped halves with gleaming exposed copper strands
  const cutGroup = new THREE.Group();
  cutGroup.visible = false;

  const cutLeftEnd = mid.clone().lerp(start, 0.16).add(new THREE.Vector3(-0.04, 0.08, 0.07));
  const cutRightEnd = mid.clone().lerp(end, 0.16).add(new THREE.Vector3(0.04, 0.06, -0.07));
  const leftCurve = new THREE.CatmullRomCurve3([start, p1, cutLeftEnd]);
  const rightCurve = new THREE.CatmullRomCurve3([end, p2, cutRightEnd]);

  const leftHalf = new THREE.Mesh(
    new THREE.TubeGeometry(leftCurve, Math.floor(tubularSegments * 0.5), radius, 10, false),
    wireMat
  );
  const rightHalf = new THREE.Mesh(
    new THREE.TubeGeometry(rightCurve, Math.floor(tubularSegments * 0.5), radius, 10, false),
    wireMat
  );
  leftHalf.castShadow = true;
  rightHalf.castShadow = true;
  cutGroup.add(leftHalf, rightHalf);

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xe68449,
    roughness: 0.22,
    metalness: 0.96,
  });
  const tipGeom = new THREE.CylinderGeometry(radius * 0.48, radius * 0.62, radius * 2.2, 8);
  const leftTip = new THREE.Mesh(tipGeom, copperMat);
  leftTip.position.copy(cutLeftEnd);
  leftTip.rotation.z = Math.PI * 0.4;
  const rightTip = new THREE.Mesh(tipGeom, copperMat);
  rightTip.position.copy(cutRightEnd);
  rightTip.rotation.z = -Math.PI * 0.4;
  cutGroup.add(leftTip, rightTip);
  group.add(cutGroup);

  // Crimped brass terminal ferrules & binding posts at start & end
  const ferruleMat = new THREE.MeshStandardMaterial({
    color: terminalMetalHex,
    roughness: 0.24,
    metalness: 0.94,
  });
  const ferruleGeom = new THREE.CylinderGeometry(radius * 1.48, radius * 1.65, radius * 3.4, 14);
  const startFerrule = new THREE.Mesh(ferruleGeom, ferruleMat);
  startFerrule.position.copy(start);
  startFerrule.castShadow = true;
  const endFerrule = new THREE.Mesh(ferruleGeom, ferruleMat);
  endFerrule.position.copy(end);
  endFerrule.castShadow = true;
  group.add(startFerrule, endFerrule);

  let cutState = false;
  return {
    group,
    setCut(cut: boolean) {
      cutState = cut;
      intactMesh.visible = !cut;
      cutGroup.visible = cut;
    },
    isCut() {
      return cutState;
    },
  };
}

// ----------------------------------------------------------------------------
// 5. Borosilicate IN-18 Nixie Tube Display (`createNixieTubeDisplay`)
// ----------------------------------------------------------------------------

export interface NixieTubeOptionsV6 {
  initialValue?: string;
  tubeCount?: number;
  scale?: number;
  glowColorCss?: string;
}

export interface NixieTubeDisplayHandleV6 {
  group: THREE.Group;
  setValue(text: string): void;
  setGlowIntensity(intensity: number): void;
  dispose(): void;
}

function drawNixieDigitCanvas(
  canvas: HTMLCanvasElement,
  char: string,
  glowColorCss: string
): void {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Soft warm neon plasma bloom halo inside the borosilicate capsule
  const radGrad = ctx.createRadialGradient(w * 0.5, h * 0.52, 8, w * 0.5, h * 0.52, w * 0.44);
  radGrad.addColorStop(0, 'rgba(255, 118, 28, 0.58)');
  radGrad.addColorStop(0.55, 'rgba(255, 74, 14, 0.24)');
  radGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 186px "JetBrains Mono", "Consolas", ui-monospace, monospace';

  // Warm multi-layer glowing orange neon cathode digit (unmistakable at both close-up and stage scale!)
  const ch = (char || '0').slice(0, 1);
  ctx.shadowColor = glowColorCss;
  ctx.shadowBlur = 34;
  ctx.fillStyle = glowColorCss;
  ctx.fillText(ch, w * 0.5, h * 0.54);

  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ff9d3b';
  ctx.fillText(ch, w * 0.5, h * 0.54);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff5d6';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffbd59';
  ctx.strokeText(ch, w * 0.5, h * 0.54);
  ctx.fillText(ch, w * 0.5, h * 0.54);
  ctx.restore();
}

export function createNixieTubeDisplay(opts: NixieTubeOptionsV6 = {}): NixieTubeDisplayHandleV6 {
  const initialValue = opts.initialValue ?? '69';
  const tubeCount = Math.max(1, opts.tubeCount ?? initialValue.length);
  const scale = opts.scale ?? 1.0;
  const glowColorCss = opts.glowColorCss ?? '#ff5e12';

  const group = new THREE.Group();
  group.name = 'NixieTubeDisplay';
  group.scale.setScalar(scale);

  const spacing = 0.34;
  const totalWidth = (tubeCount - 1) * spacing + 0.42;

  // Brushed gunmetal steel plinth chassis
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x262925,
    roughness: 0.42,
    metalness: 0.78,
  });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(totalWidth, 0.11, 0.38), chassisMat);
  chassis.position.y = 0.055;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd49c48,
    roughness: 0.26,
    metalness: 0.92,
  });
  const bakeliteMat = new THREE.MeshStandardMaterial({
    color: 0x171413,
    roughness: 0.35,
    metalness: 0.15,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff5ec,
    roughness: 0.06,
    metalness: 0.02,
    transparent: true,
    opacity: 0.28,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    depthWrite: false,
  });
  const meshCageMat = new THREE.MeshStandardMaterial({
    color: 0x3b312a,
    roughness: 0.55,
    metalness: 0.82,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  });

  // Lathe borosilicate glass dome profile (authentic IN-18 bulb with top exhaust pip)
  const glassPts = [
    new THREE.Vector2(0.115, 0.0),
    new THREE.Vector2(0.118, 0.34),
    new THREE.Vector2(0.11, 0.42),
    new THREE.Vector2(0.065, 0.475),
    new THREE.Vector2(0.022, 0.5),
    new THREE.Vector2(0.015, 0.555),
    new THREE.Vector2(0.0, 0.562),
  ];
  const glassGeom = new THREE.LatheGeometry(glassPts, 24);
  const cageGeom = new THREE.CylinderGeometry(0.095, 0.095, 0.34, 10, 4, true);
  const socketGeom = new THREE.CylinderGeometry(0.128, 0.136, 0.075, 20);
  const collarGeom = new THREE.TorusGeometry(0.125, 0.012, 8, 24);
  const digitPlaneGeom = new THREE.PlaneGeometry(0.21, 0.31);

  const digitCanvases: HTMLCanvasElement[] = [];
  const digitTextures: THREE.CanvasTexture[] = [];
  const digitMats: THREE.MeshBasicMaterial[] = [];

  for (let i = 0; i < tubeCount; i++) {
    const x = (i - (tubeCount - 1) * 0.5) * spacing;
    const tubeGroup = new THREE.Group();
    tubeGroup.position.set(x, 0.11, 0);

    const socket = new THREE.Mesh(socketGeom, bakeliteMat);
    socket.position.y = 0.038;
    tubeGroup.add(socket);

    const collar = new THREE.Mesh(collarGeom, brassTrimMat);
    collar.rotation.x = Math.PI * 0.5;
    collar.position.y = 0.075;
    tubeGroup.add(collar);

    const cage = new THREE.Mesh(cageGeom, meshCageMat);
    cage.position.y = 0.255;
    tubeGroup.add(cage);

    const canvas = createCanvas(256);
    const ch = initialValue.padStart(tubeCount, '0')[i] ?? '0';
    drawNixieDigitCanvas(canvas, ch, glowColorCss);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const digitMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    const digitMesh = new THREE.Mesh(digitPlaneGeom, digitMat);
    digitMesh.position.set(0, 0.265, 0.03);
    digitMesh.renderOrder = 3;
    tubeGroup.add(digitMesh);

    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.position.y = 0.07;
    glass.renderOrder = 4;
    tubeGroup.add(glass);

    group.add(tubeGroup);
    digitCanvases.push(canvas);
    digitTextures.push(tex);
    digitMats.push(digitMat);
  }

  return {
    group,
    setValue(text: string) {
      const padded = text.padStart(tubeCount, ' ').slice(-tubeCount);
      for (let i = 0; i < tubeCount; i++) {
        drawNixieDigitCanvas(digitCanvases[i], padded[i] ?? '0', glowColorCss);
        digitTextures[i].needsUpdate = true;
      }
    },
    setGlowIntensity(intensity: number) {
      const clamped = clamp01(intensity);
      for (const m of digitMats) {
        m.opacity = 0.25 + clamped * 0.75;
      }
    },
    dispose() {
      for (const t of digitTextures) t.dispose();
      disposeObject3DTree(group);
    },
  };
}

// ----------------------------------------------------------------------------
// 6. Sculpted Championship Trophy Builder (`createSculptedTrophyMesh`)
// ----------------------------------------------------------------------------

type MaterialTierV6 = HonorAwardDefinitionV6['materialTier'];

function createTierMaterial(tier: MaterialTierV6): THREE.MeshPhysicalMaterial {
  switch (tier) {
    case 'CAST_BRONZE':
      return new THREE.MeshPhysicalMaterial({
        color: 0xb67a42,
        roughness: 0.3,
        metalness: 0.9,
        clearcoat: 0.2,
      });
    case 'CLOISONNE_ENAMEL':
      return new THREE.MeshPhysicalMaterial({
        color: 0x1c5e8a,
        emissive: 0x091c2b,
        emissiveIntensity: 0.22,
        roughness: 0.12,
        metalness: 0.22,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
      });
    case 'STERLING_SILVER':
      return new THREE.MeshPhysicalMaterial({
        color: 0xe6ebf2,
        roughness: 0.14,
        metalness: 0.97,
        clearcoat: 0.35,
      });
    case 'GOLD_24K':
      return new THREE.MeshPhysicalMaterial({
        color: 0xf7c94f,
        roughness: 0.15,
        metalness: 0.98,
        clearcoat: 0.4,
      });
    case 'OBSIDIAN_RUBY':
      return new THREE.MeshPhysicalMaterial({
        color: 0x17141a,
        emissive: 0x520618,
        emissiveIntensity: 0.35,
        roughness: 0.08,
        metalness: 0.38,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
      });
  }
}

function createEngravedPlaqueTexture(title: string, subtitle?: string): THREE.CanvasTexture {
  const canvas = createCanvas(512);
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 512, 160);
  grad.addColorStop(0, '#c89b44');
  grad.addColorStop(0.5, '#f4d37e');
  grad.addColorStop(1, '#9c7128');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#3a250a';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 140);

  ctx.fillStyle = '#231606';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 32px "Cinzel", Georgia, serif';
  ctx.fillText(title.toUpperCase().slice(0, 24), 256, subtitle ? 64 : 82);
  if (subtitle) {
    ctx.font = '600 20px "Inter", sans-serif';
    ctx.fillStyle = '#3d280c';
    ctx.fillText(subtitle.slice(0, 34), 256, 110);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface SculptedTrophyOptionsV6 {
  materialTier?: MaterialTierV6;
  sculptArchetype?: string;
  engravingTitle?: string;
  engravingSubtitle?: string;
  scale?: number;
}

export function createSculptedTrophyMesh(opts: SculptedTrophyOptionsV6 = {}): THREE.Group {
  const tier = opts.materialTier ?? 'GOLD_24K';
  const archetype = (opts.sculptArchetype ?? 'CHALICE').toUpperCase();
  const scale = opts.scale ?? 1.0;

  const group = new THREE.Group();
  group.name = `SculptedTrophy_${archetype}`;
  group.scale.setScalar(scale);

  // Stepped Nero-Gold Marble Plinth
  const marblePbr = getProceduralPbrTextureSet('NERO_GOLD_MARBLE', { repeatX: 1, repeatY: 1, size: 256 });
  const plinthMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: marblePbr.map,
    normalMap: marblePbr.normalMap,
    roughnessMap: marblePbr.roughnessMap,
    roughness: 0.24,
    metalness: 0.1,
  });

  const baseTier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.14, 8), plinthMat);
  baseTier1.position.y = 0.07;
  baseTier1.castShadow = true;
  baseTier1.receiveShadow = true;
  group.add(baseTier1);

  const baseTier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.37, 0.16, 8), plinthMat);
  baseTier2.position.y = 0.22;
  baseTier2.castShadow = true;
  group.add(baseTier2);

  // Engraved brass plaque mounted on plinth front
  if (opts.engravingTitle) {
    const plaqueTex = createEngravedPlaqueTexture(opts.engravingTitle, opts.engravingSubtitle);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.28,
      metalness: 0.84,
    });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.11, 0.025), plaqueMat);
    plaque.position.set(0, 0.21, 0.34);
    group.add(plaque);
  }

  const primaryMat = createTierMaterial(tier);
  const accentGoldMat = new THREE.MeshStandardMaterial({
    color: tier === 'STERLING_SILVER' ? 0xf6cf62 : 0xe3b149,
    roughness: 0.18,
    metalness: 0.96,
  });
  const rubyMat = new THREE.MeshPhysicalMaterial({
    color: 0xd11542,
    emissive: 0x540418,
    emissiveIntensity: 0.5,
    roughness: 0.07,
    metalness: 0.08,
    clearcoat: 1.0,
  });

  // Sculptural upper form based on archetype keyword
  if (archetype.includes('TOURBILLON') || archetype.includes('GEAR') || archetype.includes('CLOCK')) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.32, 16), accentGoldMat);
    stem.position.y = 0.46;
    group.add(stem);

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 14, 36), primaryMat);
    outerRing.position.y = 0.96;
    outerRing.castShadow = true;
    group.add(outerRing);

    const gear = createInvoluteBrassGear({
      radius: 0.26,
      teeth: 18,
      thickness: 0.055,
      spokes: 5,
      includeRubyBearing: true,
      metalColorHex: tier === 'STERLING_SILVER' ? 0xdde5ef : 0xf4c44e,
    });
    gear.rotation.x = Math.PI * 0.5;
    gear.position.y = 0.96;
    group.add(gear);
  } else if (archetype.includes('CROWN') || archetype.includes('SOVEREIGN')) {
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.28, 24), primaryMat);
    pedestal.position.y = 0.44;
    group.add(pedestal);

    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.27, 0.24, 24, 1, true), primaryMat);
    band.material.side = THREE.DoubleSide;
    band.position.y = 0.72;
    group.add(band);

    const spireGeom = new THREE.ConeGeometry(0.065, 0.34, 6);
    const orbGeom = new THREE.SphereGeometry(0.042, 12, 12);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const spire = new THREE.Mesh(spireGeom, accentGoldMat);
      spire.position.set(Math.cos(a) * 0.31, 0.95, Math.sin(a) * 0.31);
      spire.rotation.z = -Math.cos(a) * 0.16;
      spire.rotation.x = Math.sin(a) * 0.16;
      group.add(spire);
      const jewel = new THREE.Mesh(orbGeom, i % 2 === 0 ? rubyMat : accentGoldMat);
      jewel.position.set(Math.cos(a) * 0.34, 1.13, Math.sin(a) * 0.34);
      group.add(jewel);
    }
  } else if (archetype.includes('GLOBE') || archetype.includes('SEXTANT') || archetype.includes('ASTROLABE')) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.15, 0.3, 16), accentGoldMat);
    stem.position.y = 0.45;
    group.add(stem);

    const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.032, 12, 32), accentGoldMat);
    meridian.position.y = 0.94;
    group.add(meridian);

    const ecliptic = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 10, 32), primaryMat);
    ecliptic.position.y = 0.94;
    ecliptic.rotation.set(0.55, 0.45, 0);
    group.add(ecliptic);

    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 20), primaryMat);
    globe.position.y = 0.94;
    globe.castShadow = true;
    group.add(globe);
  } else if (archetype.includes('OBELISK') || archetype.includes('DETONATOR') || archetype.includes('TOWER')) {
    const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.24, 0.92, 4), primaryMat);
    obelisk.position.y = 0.76;
    obelisk.rotation.y = Math.PI * 0.25;
    obelisk.castShadow = true;
    group.add(obelisk);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 4), accentGoldMat);
    cap.position.y = 1.33;
    cap.rotation.y = Math.PI * 0.25;
    group.add(cap);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 10, 28), accentGoldMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = 0.56;
    group.add(ring);
  } else {
    // Classic museum-sculpted Championship Chalice with twin scroll handles
    const lathePts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.22, 0.0),
      new THREE.Vector2(0.16, 0.08),
      new THREE.Vector2(0.075, 0.22),
      new THREE.Vector2(0.11, 0.34),
      new THREE.Vector2(0.075, 0.46),
      new THREE.Vector2(0.24, 0.62),
      new THREE.Vector2(0.33, 0.86),
      new THREE.Vector2(0.36, 1.02),
      new THREE.Vector2(0.32, 1.04),
      new THREE.Vector2(0.27, 0.86),
      new THREE.Vector2(0.12, 0.6),
      new THREE.Vector2(0.0, 0.56),
    ];
    const cup = new THREE.Mesh(new THREE.LatheGeometry(lathePts, 32), primaryMat);
    cup.position.y = 0.3;
    cup.castShadow = true;
    cup.receiveShadow = true;
    group.add(cup);

    // Twin Art Deco curved trophy handles
    const handleCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.31, 1.18, 0),
      new THREE.Vector3(-0.5, 1.05, 0),
      new THREE.Vector3(-0.44, 0.78, 0),
      new THREE.Vector3(-0.18, 0.72, 0),
    ]);
    const handleCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.31, 1.18, 0),
      new THREE.Vector3(0.5, 1.05, 0),
      new THREE.Vector3(0.44, 0.78, 0),
      new THREE.Vector3(0.18, 0.72, 0),
    ]);
    group.add(
      new THREE.Mesh(new THREE.TubeGeometry(handleCurveL, 18, 0.03, 10, false), accentGoldMat),
      new THREE.Mesh(new THREE.TubeGeometry(handleCurveR, 18, 0.03, 10, false), accentGoldMat)
    );

    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), rubyMat);
    gem.position.set(0, 0.98, 0.32);
    group.add(gem);
  }

  return group;
}

// ----------------------------------------------------------------------------
// 7. Cast Relief & Cloisonné Medal Builder (`createCastMedalMesh`)
// ----------------------------------------------------------------------------

export interface CastMedalOptionsV6 {
  materialTier?: MaterialTierV6;
  enamelColorHex?: number;
  ribbonColorHex?: number;
  emblemKind?: 'STAR' | 'CROWN' | 'GEAR' | 'COMPASS' | 'HEX';
  scale?: number;
}

export function createCastMedalMesh(opts: CastMedalOptionsV6 = {}): THREE.Group {
  const tier = opts.materialTier ?? 'CLOISONNE_ENAMEL';
  const enamelColorHex = opts.enamelColorHex ?? 0x9c1b30;
  const ribbonColorHex = opts.ribbonColorHex ?? 0x7d1424;
  const emblemKind = opts.emblemKind ?? 'STAR';
  const scale = opts.scale ?? 1.0;

  const group = new THREE.Group();
  group.name = `CastMedal_${emblemKind}`;
  group.scale.setScalar(scale);

  const metalMat =
    tier === 'CLOISONNE_ENAMEL'
      ? createTierMaterial('GOLD_24K')
      : createTierMaterial(tier);

  const enamelMat = new THREE.MeshPhysicalMaterial({
    color: enamelColorHex,
    roughness: 0.1,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });

  // Medallion cast disc
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.075, 36), metalMat);
  disc.rotation.x = Math.PI * 0.5;
  disc.castShadow = true;
  group.add(disc);

  // Knurled outer reeded bezel rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.415, 0.042, 12, 36), metalMat);
  rim.castShadow = true;
  group.add(rim);

  // Cloisonné recessed enamel face (front & back)
  const enamelFace = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.084, 32), enamelMat);
  enamelFace.rotation.x = Math.PI * 0.5;
  group.add(enamelFace);

  // Raised relief centerpiece emblem
  if (emblemKind === 'GEAR') {
    const miniGear = createInvoluteBrassGear({
      radius: 0.21,
      teeth: 12,
      thickness: 0.035,
      spokes: 0,
      includeBluedBolts: false,
      metalColorHex: 0xf7cf62,
    });
    miniGear.rotation.x = Math.PI * 0.5;
    miniGear.position.z = 0.045;
    group.add(miniGear);
  } else if (emblemKind === 'HEX') {
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 6), metalMat);
    hex.rotation.x = Math.PI * 0.5;
    hex.position.z = 0.046;
    group.add(hex);
  } else if (emblemKind === 'COMPASS') {
    const needle = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), metalMat);
    needle.scale.set(0.38, 1.0, 0.18);
    needle.position.z = 0.046;
    group.add(needle);
    const cross = needle.clone();
    cross.rotation.z = Math.PI * 0.5;
    group.add(cross);
  } else {
    // 5-pointed sculpted relief star
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI * 0.5;
      const rad = i % 2 === 0 ? 0.25 : 0.105;
      const x = Math.cos(a) * rad;
      const y = Math.sin(a) * rad;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();
    const starGeom = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 2,
    });
    const star = new THREE.Mesh(starGeom, metalMat);
    star.position.z = 0.035;
    group.add(star);
  }

  // Top suspension bail ring & silk grosgrain ribbon drape
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 10, 20), metalMat);
  bail.position.y = 0.48;
  group.add(bail);

  const claspBar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.055, 0.05), metalMat);
  claspBar.position.y = 0.58;
  group.add(claspBar);

  const ribbonMat = new THREE.MeshStandardMaterial({
    color: ribbonColorHex,
    roughness: 0.82,
    metalness: 0.05,
  });
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.022), ribbonMat);
  ribbon.position.y = 0.84;
  group.add(ribbon);

  const goldStripeMat = new THREE.MeshStandardMaterial({
    color: 0xeec254,
    roughness: 0.42,
    metalness: 0.72,
  });
  for (const sx of [-0.12, 0.12]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.482, 0.025), goldStripeMat);
    stripe.position.set(sx, 0.84, 0);
    group.add(stripe);
  }

  return group;
}

// ----------------------------------------------------------------------------
// 8. All 12 Backstage Relic 3D Artifact Builders (`createRelicArtifactMesh`)
// ----------------------------------------------------------------------------

export type RelicArchetypeV6 = RelicDefinitionV6['meshArchetype'];

export function createRelicArtifactMesh(
  archetype: RelicArchetypeV6,
  opts: { rarity?: RelicDefinitionV6['rarity']; scale?: number } = {}
): THREE.Group {
  const scale = opts.scale ?? 1.0;
  const rarity = opts.rarity ?? 'GOLD';
  const group = new THREE.Group();
  group.name = `Relic_${archetype}`;
  group.scale.setScalar(scale);

  const primaryHex =
    rarity === 'CONTRABAND'
      ? 0xe03252
      : rarity === 'GOLD'
        ? 0xf2c24e
        : rarity === 'STERLING'
          ? 0xdce4ee
          : 0xc99646;

  const brassMat = new THREE.MeshStandardMaterial({
    color: primaryHex,
    roughness: 0.22,
    metalness: 0.94,
  });
  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x2a2d32,
    roughness: 0.45,
    metalness: 0.82,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff8f0,
    roughness: 0.06,
    metalness: 0.02,
    transparent: true,
    opacity: 0.34,
    clearcoat: 1.0,
  });
  const glowAmberMat = new THREE.MeshStandardMaterial({
    color: 0xffa838,
    emissive: 0xff6b14,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });

  switch (archetype) {
    case 'VACUUM_TUBE': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.14, 20), darkIronMat);
      base.position.y = 0.07;
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8), darkIronMat);
      plate.position.y = 0.32;
      const filament = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), glowAmberMat);
      filament.position.y = 0.32;
      const bulb = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.26, 8, 20), glassMat);
      bulb.position.y = 0.36;
      group.add(base, plate, filament, bulb);
      break;
    }

    case 'LUCKY_COIN': {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.055, 32), brassMat);
      coin.rotation.x = Math.PI * 0.5;
      coin.position.y = 0.36;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.028, 10, 32), brassMat);
      rim.position.y = 0.36;
      const hole = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), glowAmberMat);
      hole.scale.set(1, 1, 0.25);
      hole.position.y = 0.36;
      group.add(coin, rim, hole);
      break;
    }

    case 'VINTAGE_MIC': {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.07, 20), darkIronMat);
      foot.position.y = 0.035;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.42, 12), brassMat);
      pole.position.y = 0.25;
      const cage = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.16, 8, 18), brassMat);
      cage.position.y = 0.58;
      const ribMat = darkIronMat;
      for (let i = -2; i <= 2; i++) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.138, 0.011, 8, 20), ribMat);
        rib.rotation.x = Math.PI * 0.5;
        rib.position.y = 0.58 + i * 0.048;
        group.add(rib);
      }
      group.add(foot, pole, cage);
      break;
    }

    case 'ASTROLABE': {
      const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.026, 10, 32), brassMat);
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 10, 28), brassMat);
      const r3 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.016, 8, 24), darkIronMat);
      r1.position.y = r2.position.y = r3.position.y = 0.38;
      r2.rotation.set(0.7, 0.5, 0);
      r3.rotation.set(-0.5, 1.1, 0.4);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), glowAmberMat);
      core.position.y = 0.38;
      group.add(r1, r2, r3, core);
      break;
    }

    case 'POCKET_WATCH': {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.11, 28), brassMat);
      body.rotation.x = Math.PI * 0.5;
      body.position.y = 0.34;
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xf7f2e4, roughness: 0.25, metalness: 0.05 });
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.116, 24), faceMat);
      face.rotation.x = Math.PI * 0.5;
      face.position.y = 0.34;
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12), brassMat);
      crown.position.y = 0.65;
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 20), brassMat);
      bow.position.y = 0.72;
      group.add(body, face, crown, bow);
      break;
    }

    case 'TUNING_FORK': {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.28, 12), brassMat);
      handle.position.y = 0.14;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.11, 0.72, 0),
        new THREE.Vector3(-0.11, 0.36, 0),
        new THREE.Vector3(0, 0.26, 0),
        new THREE.Vector3(0.11, 0.36, 0),
        new THREE.Vector3(0.11, 0.72, 0),
      ]);
      const prongs = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.028, 10, false), brassMat);
      group.add(handle, prongs);
      break;
    }

    case 'PRISM_LENS': {
      const prismMat = new THREE.MeshPhysicalMaterial({
        color: 0xdff6ff,
        emissive: 0x1a486e,
        emissiveIntensity: 0.35,
        roughness: 0.04,
        metalness: 0.05,
        clearcoat: 1.0,
        ior: 1.65,
      });
      const prism = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.44, 3), prismMat);
      prism.position.y = 0.36;
      const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.06, 3), brassMat);
      frame.position.y = 0.12;
      const topFrame = frame.clone();
      topFrame.position.y = 0.6;
      group.add(prism, frame, topFrame);
      break;
    }

    case 'MAGNET_HORSESHOE': {
      const redMat = new THREE.MeshStandardMaterial({ color: 0xc22030, roughness: 0.32, metalness: 0.55 });
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e7ee, roughness: 0.18, metalness: 0.96 });
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.18, 0.14, 0),
        new THREE.Vector3(-0.2, 0.45, 0),
        new THREE.Vector3(0, 0.64, 0),
        new THREE.Vector3(0.2, 0.45, 0),
        new THREE.Vector3(0.18, 0.14, 0),
      ]);
      const arch = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.068, 12, false), redMat);
      const tipL = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.14, 14), silverMat);
      tipL.position.set(-0.18, 0.08, 0);
      const tipR = tipL.clone();
      tipR.position.x = 0.18;
      group.add(arch, tipL, tipR);
      break;
    }

    case 'NIXIE_VALVE': {
      const nixie = createNixieTubeDisplay({ initialValue: '7', tubeCount: 1, scale: 1.15 });
      group.add(nixie.group);
      break;
    }

    case 'GOLD_DICE': {
      const dieA = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), brassMat);
      dieA.position.set(-0.14, 0.22, 0.04);
      dieA.rotation.set(0.35, 0.6, 0.2);
      const dieB = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), brassMat);
      dieB.position.set(0.18, 0.17, -0.08);
      dieB.rotation.set(-0.2, -0.5, 0.4);
      group.add(dieA, dieB);
      break;
    }

    case 'TELEGRAPH_KEY': {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.64), darkIronMat);
      slab.position.y = 0.035;
      const fulcrum = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.1), brassMat);
      fulcrum.position.set(0, 0.14, -0.05);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.52), brassMat);
      arm.position.set(0, 0.24, 0.04);
      arm.rotation.x = -0.14;
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.06, 20), darkIronMat);
      knob.position.set(0, 0.24, 0.26);
      group.add(slab, fulcrum, arm, knob);
      break;
    }

    case 'CROWN_SEAL': {
      const sealHandle = new THREE.Mesh(new THREE.LatheGeometry([
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(0.24, 0.0),
        new THREE.Vector2(0.22, 0.08),
        new THREE.Vector2(0.09, 0.18),
        new THREE.Vector2(0.07, 0.38),
        new THREE.Vector2(0.16, 0.54),
        new THREE.Vector2(0.11, 0.68),
        new THREE.Vector2(0.0, 0.72),
      ], 24), brassMat);
      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), glowAmberMat);
      jewel.position.y = 0.76;
      group.add(sealHandle, jewel);
      break;
    }
  }

  group.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return group;
}

// ----------------------------------------------------------------------------
// 9. Sculpted Brushed-Brass & Obsidian Presenter Podium (`createPresenterPodiumMesh`)
// ----------------------------------------------------------------------------

export interface PresenterPodiumOptionsV6 {
  trimMetalHex?: number;
  accentJewelHex?: number;
  scale?: number;
}

export interface PresenterPodiumHandleV6 {
  group: THREE.Group;
  setPalette(trimMetalHex: number, accentJewelHex: number): void;
}

/**
 * Builds the prestige sculpted Brushed-Brass & Mirror-Obsidian Presenter Podium
 * with fluted vertical brass columns, beveled lectern crown, warm reading-lamp glow,
 * and twin curved brass gooseneck broadcast microphones.
 */
export function createPresenterPodiumMesh(opts: PresenterPodiumOptionsV6 = {}): PresenterPodiumHandleV6 {
  const trimMetalHex = opts.trimMetalHex ?? 0xd9a74a;
  const accentJewelHex = opts.accentJewelHex ?? 0xf4be4e;
  const scale = opts.scale ?? 1.0;

  const group = new THREE.Group();
  group.name = 'SculptedPresenterPodium';
  group.scale.setScalar(scale);

  const brassMat = new THREE.MeshPhysicalMaterial({
    color: trimMetalHex,
    roughness: 0.2,
    metalness: 0.96,
    clearcoat: 0.35,
    clearcoatRoughness: 0.14,
  });
  const brushedGoldTrimMat = new THREE.MeshStandardMaterial({
    color: trimMetalHex,
    roughness: 0.28,
    metalness: 0.92,
  });
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f1014,
    roughness: 0.08,
    metalness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
  });
  const darkMicMeshMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e24,
    roughness: 0.45,
    metalness: 0.85,
  });
  const lampGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff0cc,
    emissive: accentJewelHex,
    emissiveIntensity: 2.2,
    roughness: 0.2,
  });

  // 1. Stepped Chamfered Brass & Obsidian Plinth Base (Y = 0 .. 0.16)
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.07, 0.72), brassMat);
  basePlate.position.y = 0.035;
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  group.add(basePlate);

  const baseStep = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.09, 0.58), obsidianMat);
  baseStep.position.y = 0.115;
  baseStep.castShadow = true;
  baseStep.receiveShadow = true;
  group.add(baseStep);

  const baseCollar = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.028, 0.62), brassMat);
  baseCollar.position.y = 0.168;
  group.add(baseCollar);

  // 2. Mirror-Obsidian Curved/Faceted Central Column Body (Y = 0.18 .. 1.24)
  const coreBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 1.06, 0.46), obsidianMat);
  coreBody.position.y = 0.71;
  coreBody.castShadow = true;
  coreBody.receiveShadow = true;
  group.add(coreBody);

  // Inset curved obsidian front shield panel
  const frontShield = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.02, 16, 1, false, -0.75, 1.5), obsidianMat);
  frontShield.position.set(0, 0.71, 0.08);
  frontShield.castShadow = true;
  group.add(frontShield);

  // Subtle brass horizontal inlay accents on obsidian plinth
  for (const py of [0.24, 1.18]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.022, 0.5), brushedGoldTrimMat);
    strip.position.y = py;
    group.add(strip);
  }

  // 3. Four Vertical Fluted Brushed-Brass Side Columns flanking the Obsidian Centerpiece
  const colGeom = new THREE.CylinderGeometry(0.068, 0.072, 1.06, 16);
  const colPositions: Array<[number, number]> = [
    [-0.36, 0.18],
    [-0.27, 0.21],
    [0.27, 0.21],
    [0.36, 0.18],
    [-0.34, -0.18],
    [0.34, -0.18],
  ];
  for (const [cx, cz] of colPositions) {
    const col = new THREE.Mesh(colGeom, brassMat);
    col.position.set(cx, 0.71, cz);
    col.castShadow = true;
    col.receiveShadow = true;
    group.add(col);
  }

  // Side obsidian wings neatly capping left/right profiles
  for (const sx of [-0.39, 0.39]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.04, 0.42), obsidianMat);
    wing.position.set(sx, 0.71, 0);
    group.add(wing);
  }

  // 4. Flared Beveled Brushed-Brass Lectern Crown & Desk Deck (Y = 1.24 .. 1.40)
  const neckCollar = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.045, 0.62), brassMat);
  neckCollar.position.y = 1.26;
  neckCollar.castShadow = true;
  group.add(neckCollar);

  const lecternTop = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.075, 0.74), brassMat);
  lecternTop.position.y = 1.32;
  lecternTop.castShadow = true;
  lecternTop.receiveShadow = true;
  group.add(lecternTop);

  // Sloped obsidian script pad + warm amber reading-light bar tucked under lip
  const scriptPad = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.03, 0.56), obsidianMat);
  scriptPad.position.set(0, 1.365, -0.02);
  scriptPad.rotation.x = 0.14;
  group.add(scriptPad);

  const lipRim = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.026, 0.036), lampGlowMat);
  lipRim.position.set(0, 1.352, 0.34);
  group.add(lipRim);

  // 5. Twin Graceful Curved Brass Gooseneck Broadcast Microphones!
  for (const sign of [-1, 1] as const) {
    const mountCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.04, 14), brassMat);
    mountCollar.position.set(sign * 0.34, 1.375, 0.16);
    group.add(mountCollar);

    const neckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.34, 1.39, 0.16),
      new THREE.Vector3(sign * 0.36, 1.56, 0.14),
      new THREE.Vector3(sign * 0.28, 1.71, 0.09),
      new THREE.Vector3(sign * 0.16, 1.77, 0.04),
    ]);
    const neckMesh = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 20, 0.011, 8, false), brassMat);
    neckMesh.castShadow = true;
    group.add(neckMesh);

    // Condenser mic capsule + dark acoustic windscreen tip angled smoothly inward
    const micHead = new THREE.Group();
    micHead.position.set(sign * 0.145, 1.778, 0.035);
    micHead.rotation.z = sign * 1.12;
    micHead.rotation.y = sign * 0.25;

    const capsuleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.015, 0.07, 12), brassMat);
    const windscreen = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.042, 6, 12), darkMicMeshMat);
    windscreen.position.y = 0.052;
    micHead.add(capsuleBody, windscreen);
    group.add(micHead);
  }

  return {
    group,
    setPalette(newTrimHex: number, newAccentHex: number) {
      brassMat.color.setHex(newTrimHex);
      brushedGoldTrimMat.color.setHex(newTrimHex);
      lampGlowMat.emissive.setHex(newAccentHex);
    },
  };
}

// ----------------------------------------------------------------------------
// 10. Second-Order Sub-Stepped Spring Kinematics (`SpringDamper1D`, `SpringDamper3D`)
// ----------------------------------------------------------------------------

export class SpringDamper1D {
  public value: number;
  public target: number;
  public velocity = 0;
  public stiffness: number;
  public dampingRatio: number;

  constructor(initial = 0, stiffness = 120, dampingRatio = 0.92) {
    this.value = initial;
    this.target = initial;
    this.stiffness = stiffness;
    this.dampingRatio = dampingRatio;
  }

  public snap(val: number): void {
    this.value = val;
    this.target = val;
    this.velocity = 0;
  }

  public impulse(deltaVel: number): void {
    this.velocity += deltaVel;
  }

  public update(dtSec: number): number {
    const clamped = Math.min(0.05, Math.max(0, dtSec));
    const steps = clamped > 0.018 ? 2 : 1;
    const h = clamped / steps;
    const c = 2 * this.dampingRatio * Math.sqrt(this.stiffness);
    for (let i = 0; i < steps; i++) {
      const force = (this.target - this.value) * this.stiffness - this.velocity * c;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }

  public isSettled(epsilon = 0.001): boolean {
    return Math.abs(this.target - this.value) < epsilon && Math.abs(this.velocity) < epsilon;
  }
}

export class SpringDamper3D {
  public readonly current: THREE.Vector3;
  public readonly target: THREE.Vector3;
  public readonly velocity = new THREE.Vector3();
  public stiffness: number;
  public dampingRatio: number;

  constructor(
    initial: THREE.Vector3 | [number, number, number] = [0, 0, 0],
    stiffness = 95,
    dampingRatio = 0.94
  ) {
    this.current = Array.isArray(initial) ? new THREE.Vector3(...initial) : initial.clone();
    this.target = this.current.clone();
    this.stiffness = stiffness;
    this.dampingRatio = dampingRatio;
  }

  public setTarget(x: number, y: number, z: number): void {
    this.target.set(x, y, z);
  }

  public snap(x: number, y: number, z: number): void {
    this.current.set(x, y, z);
    this.target.set(x, y, z);
    this.velocity.set(0, 0, 0);
  }

  public impulse(vx: number, vy: number, vz: number): void {
    this.velocity.x += vx;
    this.velocity.y += vy;
    this.velocity.z += vz;
  }

  public update(dtSec: number): THREE.Vector3 {
    const clamped = Math.min(0.05, Math.max(0, dtSec));
    const steps = clamped > 0.018 ? 2 : 1;
    const h = clamped / steps;
    const c = 2 * this.dampingRatio * Math.sqrt(this.stiffness);

    for (let i = 0; i < steps; i++) {
      const fx = (this.target.x - this.current.x) * this.stiffness - this.velocity.x * c;
      const fy = (this.target.y - this.current.y) * this.stiffness - this.velocity.y * c;
      const fz = (this.target.z - this.current.z) * this.stiffness - this.velocity.z * c;
      this.velocity.x += fx * h;
      this.velocity.y += fy * h;
      this.velocity.z += fz * h;
      this.current.x += this.velocity.x * h;
      this.current.y += this.velocity.y * h;
      this.current.z += this.velocity.z * h;
    }
    return this.current;
  }
}

// ----------------------------------------------------------------------------
// 10. GPU Ballistic Ember & Spark Burst System (`GpuSparkBurst`)
// ----------------------------------------------------------------------------

export class GpuSparkBurst {
  public readonly points: THREE.Points;
  private readonly maxParticles: number;
  private readonly positions: Float32Array;
  private readonly velocities: Float32Array;
  private readonly ages: Float32Array;
  private readonly lifetimes: Float32Array;
  private readonly sizes: Float32Array;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private cursor = 0;
  public floorY = 0.02;
  public gravity = -9.8;

  constructor(maxParticles = 320) {
    this.maxParticles = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.ages = new Float32Array(maxParticles);
    this.lifetimes = new Float32Array(maxParticles);
    this.sizes = new Float32Array(maxParticles);

    for (let i = 0; i < maxParticles; i++) {
      this.ages[i] = 999;
      this.lifetimes[i] = 1;
      this.sizes[i] = 0;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aLifeRatio', new THREE.BufferAttribute(new Float32Array(maxParticles), 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 3) },
      },
      vertexShader: /* glsl */ `
        attribute float aLifeRatio;
        attribute float aSize;
        varying float vLife;
        uniform float uPixelRatio;
        void main() {
          vLife = aLifeRatio;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (18.0 / max(1.0, -mvPos.z));
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vLife;
        void main() {
          if (vLife <= 0.001) discard;
          vec2 c = gl_PointCoord - 0.5;
          float r2 = dot(c, c);
          if (r2 > 0.25) discard;
          float core = exp(-r2 * 18.0);
          // Physical blackbody cooling ramp: white-hot -> molten gold -> ember crimson
          vec3 colHot = vec3(1.0, 0.96, 0.82);
          vec3 colMid = vec3(1.0, 0.58, 0.14);
          vec3 colCool = vec3(0.85, 0.14, 0.04);
          vec3 col = vLife > 0.5
            ? mix(colMid, colHot, (vLife - 0.5) * 2.0)
            : mix(colCool, colMid, vLife * 2.0);
          gl_FragColor = vec4(col * (1.25 + core), core * vLife);
        }
      `,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = 'GpuSparkBurst';
  }

  public emit(
    origin: THREE.Vector3 | [number, number, number],
    count = 36,
    speed = 4.2,
    upwardBias = 0.65
  ): void {
    const ox = Array.isArray(origin) ? origin[0] : origin.x;
    const oy = Array.isArray(origin) ? origin[1] : origin.y;
    const oz = Array.isArray(origin) ? origin[2] : origin.z;

    for (let k = 0; k < count; k++) {
      const idx = this.cursor;
      this.cursor = (this.cursor + 1) % this.maxParticles;

      const theta = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.2 + upwardBias) * Math.PI * 0.45;
      const spd = speed * (0.45 + Math.random() * 0.85);

      this.positions[idx * 3] = ox + (Math.random() - 0.5) * 0.06;
      this.positions[idx * 3 + 1] = oy + (Math.random() - 0.5) * 0.06;
      this.positions[idx * 3 + 2] = oz + (Math.random() - 0.5) * 0.06;

      this.velocities[idx * 3] = Math.cos(theta) * Math.cos(elev) * spd;
      this.velocities[idx * 3 + 1] = Math.sin(elev) * spd;
      this.velocities[idx * 3 + 2] = Math.sin(theta) * Math.cos(elev) * spd;

      this.ages[idx] = 0;
      this.lifetimes[idx] = 0.45 + Math.random() * 0.65;
      this.sizes[idx] = 4.5 + Math.random() * 6.5;
    }
  }

  public update(dtSec: number): void {
    const dt = Math.min(0.05, Math.max(0, dtSec));
    const lifeAttr = this.geometry.getAttribute('aLifeRatio') as THREE.BufferAttribute;
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const sizeAttr = this.geometry.getAttribute('aSize') as THREE.BufferAttribute;
    const drag = Math.exp(-1.4 * dt);

    let anyAlive = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.ages[i] >= this.lifetimes[i]) {
        lifeAttr.setX(i, 0);
        continue;
      }
      anyAlive = true;
      this.ages[i] += dt;
      const lifeRatio = clamp01(1 - this.ages[i] / this.lifetimes[i]);
      lifeAttr.setX(i, lifeRatio);

      const p3 = i * 3;
      this.velocities[p3] *= drag;
      this.velocities[p3 + 1] = this.velocities[p3 + 1] * drag + this.gravity * dt;
      this.velocities[p3 + 2] *= drag;

      this.positions[p3] += this.velocities[p3] * dt;
      this.positions[p3 + 1] += this.velocities[p3 + 1] * dt;
      this.positions[p3 + 2] += this.velocities[p3 + 2] * dt;

      // Stage floor elastic spark bounce
      if (this.positions[p3 + 1] < this.floorY) {
        this.positions[p3 + 1] = this.floorY;
        this.velocities[p3 + 1] = Math.abs(this.velocities[p3 + 1]) * 0.42;
        this.velocities[p3] *= 0.72;
        this.velocities[p3 + 2] *= 0.72;
      }
    }

    if (anyAlive) {
      posAttr.needsUpdate = true;
      lifeAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
    }
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
