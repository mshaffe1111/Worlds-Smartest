// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/engine/HorologicalCAD.ts`
// Zero Raw BoxGeometry / SphereGeometry / CylinderGeometry Props!
// Parametric Horological CAD Builders (Three.js 0.172):
//  - `createChamferedBox` (ExtrudeGeometry w/ 3-seg bevel >= 0.008m)
//  - `createFilletedShaft` (48-seg LatheGeometry w/ C1 collars & 45° anglage)
//  - `createInvoluteGear` (20° pressure-angle involute teeth + blued-steel arbor)
//  - `createNotchedBezel` (HEX | SCALLOP | VERNIER | WAX_SEAL domain bezels)
//  - `createAntiMoireFloorMaterial` (1024x1024 mipmapped DataTexture w/ 16x
//    anisotropy + onBeforeCompile `fwidth(vWorldPos.xz)` derivative filtering)
// ============================================================================

import * as THREE from 'three';
import type { DomainVisualSpecV7 } from '../contracts_v7';

export const SHARED_CAD_TEX_FLAG = '__wsV7SharedCadTex';

export type NotchBezelShapeV7 = DomainVisualSpecV7['notchShape'];

export type AntiMoireFloorKindV7 =
  | 'PARQUET'
  | 'GRANITE'
  | 'HERRINGBONE_OAK'
  | 'TOURMALINE_BAIZE'
  | 'DIAMOND_PLATE_STEEL'
  | 'BELGIAN_ASTROLABE_MARBLE';

// ----------------------------------------------------------------------------
// 1. Deterministic Math & Procedural Noise Utilities
// ----------------------------------------------------------------------------

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function fract(v: number): number {
  return v - Math.floor(v);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1e-6));
  return t * t * (3 - 2 * t);
}

function hash2D(ix: number, iy: number, seed: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123;
  return fract(n);
}

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

// ----------------------------------------------------------------------------
// 2. `createChamferedBox` — ExtrudeGeometry w/ 3-Segment Anglage Bevel >= 0.008m
// ----------------------------------------------------------------------------

export interface ChamferedBoxOptionsV7 {
  width: number;
  height: number;
  depth: number;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  cornerRadius?: number;
  material?: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
}

export function createChamferedBoxGeometry(opts: Omit<ChamferedBoxOptionsV7, 'material' | 'castShadow' | 'receiveShadow' | 'name'>): THREE.ExtrudeGeometry {
  const bevelThickness = Math.max(0.008, opts.bevelThickness ?? 0.012);
  const bevelSize = Math.max(0.008, opts.bevelSize ?? 0.012);
  const bevelSegments = Math.max(3, Math.round(opts.bevelSegments ?? 3));

  const innerHalfW = Math.max(0.003, opts.width * 0.5 - bevelSize);
  const innerHalfH = Math.max(0.003, opts.height * 0.5 - bevelSize);
  const coreDepth = Math.max(0.003, opts.depth - bevelThickness * 2);
  const r = Math.min(Math.max(0, opts.cornerRadius ?? 0), Math.min(innerHalfW, innerHalfH) * 0.65);

  const shape = new THREE.Shape();
  if (r > 0.001) {
    shape.moveTo(-innerHalfW + r, -innerHalfH);
    shape.lineTo(innerHalfW - r, -innerHalfH);
    shape.quadraticCurveTo(innerHalfW, -innerHalfH, innerHalfW, -innerHalfH + r);
    shape.lineTo(innerHalfW, innerHalfH - r);
    shape.quadraticCurveTo(innerHalfW, innerHalfH, innerHalfW - r, innerHalfH);
    shape.lineTo(-innerHalfW + r, innerHalfH);
    shape.quadraticCurveTo(-innerHalfW, innerHalfH, -innerHalfW, innerHalfH - r);
    shape.lineTo(-innerHalfW, -innerHalfH + r);
    shape.quadraticCurveTo(-innerHalfW, -innerHalfH, -innerHalfW + r, -innerHalfH);
  } else {
    shape.moveTo(-innerHalfW, -innerHalfH);
    shape.lineTo(innerHalfW, -innerHalfH);
    shape.lineTo(innerHalfW, innerHalfH);
    shape.lineTo(-innerHalfW, innerHalfH);
    shape.closePath();
  }

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreDepth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments: r > 0.001 ? 8 : 2,
  });
  geom.translate(0, 0, -coreDepth * 0.5);
  geom.computeVertexNormals();
  return geom;
}

export function createChamferedBox(opts: ChamferedBoxOptionsV7): THREE.Mesh {
  const geom = createChamferedBoxGeometry(opts);
  const mat =
    opts.material ??
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.22,
    });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = opts.name ?? 'HorologicalChamferedBox';
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  return mesh;
}

// ----------------------------------------------------------------------------
// 3. `createFilletedShaft` — 48-Seg LatheGeometry w/ C1 Collars & 45° Anglage
// ----------------------------------------------------------------------------

export interface FilletedShaftOptionsV7 {
  radius: number;
  height: number;
  topRadius?: number;
  baseCollarFlare?: number; // Radial flare of bottom C1 collar (default 0.18 * radius)
  neckCollarFlare?: number; // Radial flare of top C1 collar (default 0.14 * radius)
  anglageBevel?: number; // 45° edge chamfer size (default >= 0.008m when height permits)
  radialSegments?: number; // Enforced >= 48
  centered?: boolean; // If true, centered at y=0; if false (default), rests on y=0!
  hollowInnerRadius?: number; // Optional recessed top cup/bore
  material?: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
}

export function createFilletedShaftGeometry(
  opts: Omit<FilletedShaftOptionsV7, 'material' | 'castShadow' | 'receiveShadow' | 'name'>,
): THREE.LatheGeometry {
  const rMidBottom = Math.max(0.004, opts.radius);
  const rMidTop = Math.max(0.004, opts.topRadius ?? opts.radius);
  const h = Math.max(0.012, opts.height);
  const segments = Math.max(48, Math.round(opts.radialSegments ?? 48));

  const bevel = Math.min(h * 0.14, Math.max(0.004, opts.anglageBevel ?? Math.max(0.008, rMidBottom * 0.08)));
  const baseFlare = opts.baseCollarFlare ?? rMidBottom * 0.18;
  const neckFlare = opts.neckCollarFlare ?? rMidTop * 0.14;

  const rBaseOuter = rMidBottom + baseFlare;
  const rNeckOuter = rMidTop + neckFlare;

  const collarH = Math.min(h * 0.22, Math.max(bevel * 1.8, h * 0.11));
  const filletSamples = 5;
  const pts: THREE.Vector2[] = [];

  // Center bottom -> 45° bottom anglage bevel -> base collar outer land
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(Math.max(0.001, rBaseOuter - bevel), 0));
  pts.push(new THREE.Vector2(rBaseOuter, bevel));

  // Smooth C1 cosine-eased fillet from base collar into main shaft
  const baseCollarTopY = Math.min(h * 0.36, bevel + collarH);
  for (let i = 0; i <= filletSamples; i++) {
    const t = i / filletSamples;
    const c1 = 0.5 - 0.5 * Math.cos(t * Math.PI); // Zero-tangent C1 entry & exit!
    const rad = lerp(rBaseOuter, rMidBottom, c1);
    const y = lerp(bevel * 1.35, baseCollarTopY, t);
    pts.push(new THREE.Vector2(rad, y));
  }

  // Smooth C1 cosine-eased fillet from main shaft into top neck collar
  const neckCollarBotY = Math.max(baseCollarTopY + h * 0.04, h - bevel - collarH);
  for (let i = 0; i <= filletSamples; i++) {
    const t = i / filletSamples;
    const c1 = 0.5 - 0.5 * Math.cos(t * Math.PI);
    const rad = lerp(rMidTop, rNeckOuter, c1);
    const y = lerp(neckCollarBotY, Math.max(neckCollarBotY, h - bevel * 1.35), t);
    pts.push(new THREE.Vector2(rad, y));
  }

  // Top 45° anglage bevel -> top cap (or recessed bore)
  pts.push(new THREE.Vector2(rNeckOuter, Math.max(bevel, h - bevel)));
  const topInnerLand = Math.max(0.001, rNeckOuter - bevel);
  pts.push(new THREE.Vector2(topInnerLand, h));

  if (opts.hollowInnerRadius && opts.hollowInnerRadius > 0.002 && opts.hollowInnerRadius < topInnerLand) {
    const boreR = opts.hollowInnerRadius;
    const boreDepth = Math.min(h * 0.75, rMidTop * 0.85);
    pts.push(new THREE.Vector2(boreR + bevel * 0.5, h));
    pts.push(new THREE.Vector2(boreR, h - bevel * 0.5));
    pts.push(new THREE.Vector2(boreR, Math.max(bevel, h - boreDepth)));
    pts.push(new THREE.Vector2(0, Math.max(bevel, h - boreDepth)));
  } else {
    pts.push(new THREE.Vector2(0, h));
  }

  const geom = new THREE.LatheGeometry(pts, segments);
  if (opts.centered) {
    geom.translate(0, -h * 0.5, 0);
  }
  geom.computeVertexNormals();
  return geom;
}

export function createFilletedShaft(opts: FilletedShaftOptionsV7): THREE.Mesh {
  const geom = createFilletedShaftGeometry(opts);
  const mat =
    opts.material ??
    new THREE.MeshStandardMaterial({
      color: 0xd8a84a,
      metalness: 0.94,
      roughness: 0.2,
    });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = opts.name ?? 'HorologicalFilletedShaft';
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  return mesh;
}

/**
 * Turned 48-segment horological sphere/bulb/dome via `LatheGeometry`
 * (replaces raw `SphereGeometry` across lenses, domes, lamps, and globes).
 */
export function createTurnedOrb(opts: {
  radius: number;
  heightScale?: number;
  hemiOnly?: boolean;
  equatorialRib?: number;
  radialSegments?: number;
  material?: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
  name?: string;
}): THREE.Mesh {
  const r = Math.max(0.005, opts.radius);
  const hScale = opts.heightScale ?? 1.0;
  const segs = Math.max(48, opts.radialSegments ?? 48);
  const rib = opts.equatorialRib ?? r * 0.035;
  const profileSteps = 24;
  const pts: THREE.Vector2[] = [];

  const startPhi = opts.hemiOnly ? 0 : -Math.PI * 0.5;
  const endPhi = Math.PI * 0.5;
  if (opts.hemiOnly) {
    pts.push(new THREE.Vector2(0, 0));
  }

  for (let i = 0; i <= profileSteps; i++) {
    const t = i / profileSteps;
    const phi = lerp(startPhi, endPhi, t);
    const eqBand = Math.exp(-Math.pow(phi / 0.14, 2)) * rib;
    const rx = i === profileSteps || (!opts.hemiOnly && i === 0) ? 0 : Math.cos(phi) * r + eqBand;
    const ry = Math.sin(phi) * r * hScale;
    pts.push(new THREE.Vector2(Math.max(0, rx), ry));
  }

  const geom = new THREE.LatheGeometry(pts, segs);
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(
    geom,
    opts.material ??
      new THREE.MeshStandardMaterial({
        color: 0xffd166,
        metalness: 0.95,
        roughness: 0.16,
      }),
  );
  mesh.name = opts.name ?? 'HorologicalTurnedOrb';
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? true;
  return mesh;
}

/**
 * Parametric chamfered arch / curved rib builder via `ExtrudeGeometry` w/ 3-seg bevels.
 */
export function createChamferedArch(opts: {
  innerRadius: number;
  outerRadius: number;
  depth: number;
  arcAngle?: number;
  startAngle?: number;
  bevel?: number;
  material?: THREE.Material;
  name?: string;
}): THREE.Mesh {
  const rIn = Math.max(0.02, opts.innerRadius);
  const rOut = Math.max(rIn + 0.03, opts.outerRadius);
  const bevel = Math.max(0.008, opts.bevel ?? 0.012);
  const arc = opts.arcAngle ?? Math.PI;
  const startA = opts.startAngle ?? 0;
  const steps = Math.max(24, Math.round((arc / Math.PI) * 32));

  const shape = new THREE.Shape();
  for (let i = 0; i <= steps; i++) {
    const a = startA + (i / steps) * arc;
    const x = Math.cos(a) * (rOut - bevel);
    const y = Math.sin(a) * (rOut - bevel);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const a = startA + (i / steps) * arc;
    const x = Math.cos(a) * (rIn + bevel);
    const y = Math.sin(a) * (rIn + bevel);
    shape.lineTo(x, y);
  }
  shape.closePath();

  const coreDepth = Math.max(0.004, opts.depth - bevel * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  });
  geom.translate(0, 0, -coreDepth * 0.5);
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geom,
    opts.material ??
      new THREE.MeshStandardMaterial({
        color: 0xc9963e,
        metalness: 0.9,
        roughness: 0.25,
      }),
  );
  mesh.name = opts.name ?? 'HorologicalChamferedArch';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ----------------------------------------------------------------------------
// 4. `createInvoluteGear` — True 20° Pressure Angle Teeth + Blued-Steel Arbor
// ----------------------------------------------------------------------------

export interface InvoluteGearOptionsV7 {
  pitchRadius?: number;
  teeth?: number;
  thickness?: number;
  spokes?: number;
  gearColorHex?: number;
  arborColorHex?: number;
  arborLength?: number;
  roughness?: number;
  metalness?: number;
  name?: string;
}

export function createInvoluteGear(opts: InvoluteGearOptionsV7 = {}): THREE.Group {
  const pitchR = Math.max(0.08, opts.pitchRadius ?? 0.5);
  const teeth = Math.max(8, Math.round(opts.teeth ?? 24));
  const thickness = Math.max(0.024, opts.thickness ?? 0.08);
  const spokes = opts.spokes ?? (pitchR >= 0.22 ? 5 : 0);
  const gearColorHex = opts.gearColorHex ?? 0xe2b44c;
  const arborColorHex = opts.arborColorHex ?? 0x1e4488; // Thermally-blued Swiss steel
  const arborLength = opts.arborLength ?? thickness * 2.35;

  const group = new THREE.Group();
  group.name = opts.name ?? 'HorologicalInvoluteGear20Deg';

  // Standard 20° pressure angle involute tooth geometry
  const pressureAngle = (20 * Math.PI) / 180;
  const moduleM = (2 * pitchR) / teeth;
  const addendum = moduleM * 0.95;
  const dedendum = moduleM * 1.18;
  const tipR = pitchR + addendum;
  const rootR = Math.max(pitchR * 0.28, pitchR - dedendum);
  const baseR = Math.max(rootR, pitchR * Math.cos(pressureAngle));

  const invAtPitch = Math.tan(pressureAngle) - pressureAngle;
  const halfToothPitchAngle = Math.PI / (2 * teeth) + invAtPitch;
  const maxInvoluteT = Math.sqrt(Math.max(0, (tipR / baseR) * (tipR / baseR) - 1));
  const pitchStep = (Math.PI * 2) / teeth;

  const shape = new THREE.Shape();
  const flankSamples = 5;

  for (let i = 0; i < teeth; i++) {
    const centerA = i * pitchStep;
    const rootValleyStart = centerA - pitchStep * 0.5;
    const rootFlankStart = centerA - halfToothPitchAngle;

    const rx0 = Math.cos(rootValleyStart) * rootR;
    const ry0 = Math.sin(rootValleyStart) * rootR;
    if (i === 0) shape.moveTo(rx0, ry0);
    else shape.lineTo(rx0, ry0);

    // Root fillet entry
    shape.lineTo(Math.cos(rootFlankStart) * rootR, Math.sin(rootFlankStart) * rootR);

    // Leading 20° involute curve: r(t) = baseR * sqrt(1 + t^2), theta(t) = t - atan(t)
    for (let s = 0; s <= flankSamples; s++) {
      const t = (s / flankSamples) * maxInvoluteT;
      const r = baseR * Math.sqrt(1 + t * t);
      const invAngle = t - Math.atan(t);
      const a = centerA - halfToothPitchAngle + invAngle;
      shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }

    // Trailing 20° involute curve mirrored symmetrically
    for (let s = flankSamples; s >= 0; s--) {
      const t = (s / flankSamples) * maxInvoluteT;
      const r = baseR * Math.sqrt(1 + t * t);
      const invAngle = t - Math.atan(t);
      const a = centerA + halfToothPitchAngle - invAngle;
      shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }

    const rootFlankEnd = centerA + halfToothPitchAngle;
    shape.lineTo(Math.cos(rootFlankEnd) * rootR, Math.sin(rootFlankEnd) * rootR);
  }
  shape.closePath();

  // Central arbor bore
  const boreR = Math.max(0.018, pitchR * 0.16);
  const boreHole = new THREE.Path();
  boreHole.absarc(0, 0, boreR, 0, Math.PI * 2, true);
  shape.holes.push(boreHole);

  // Horological spoked wheel cutouts
  const innerWebR = Math.max(boreR * 1.9, rootR * 0.34);
  const outerWebR = rootR * 0.78;
  if (spokes >= 3 && outerWebR - innerWebR > 0.035) {
    const sector = (Math.PI * 2) / spokes;
    const spokeHalfAng = Math.min(0.19, sector * 0.19);
    const arcSegs = 8;
    for (let s = 0; s < spokes; s++) {
      const a0 = s * sector + spokeHalfAng;
      const a1 = (s + 1) * sector - spokeHalfAng;
      if (a1 <= a0) continue;
      const cut = new THREE.Path();
      cut.moveTo(Math.cos(a0) * innerWebR, Math.sin(a0) * innerWebR);
      for (let k = 0; k <= arcSegs; k++) {
        const a = lerp(a0, a1, k / arcSegs);
        cut.lineTo(Math.cos(a) * outerWebR, Math.sin(a) * outerWebR);
      }
      for (let k = arcSegs; k >= 0; k--) {
        const a = lerp(a0, a1, k / arcSegs);
        cut.lineTo(Math.cos(a) * innerWebR, Math.sin(a) * innerWebR);
      }
      cut.closePath();
      shape.holes.push(cut);
    }
  }

  const bevel = Math.max(0.008, Math.min(0.016, thickness * 0.2));
  const coreDepth = Math.max(0.004, thickness - bevel * 2);
  const gearGeom = new THREE.ExtrudeGeometry(shape, {
    depth: coreDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: Math.min(bevel, moduleM * 0.18),
    bevelSegments: 3,
    curveSegments: 12,
  });
  gearGeom.translate(0, 0, -coreDepth * 0.5);
  gearGeom.computeVertexNormals();

  const gearMat = new THREE.MeshStandardMaterial({
    color: gearColorHex,
    metalness: opts.metalness ?? 0.95,
    roughness: opts.roughness ?? 0.18,
  });
  const gearMesh = new THREE.Mesh(gearGeom, gearMat);
  gearMesh.castShadow = true;
  gearMesh.receiveShadow = true;
  group.add(gearMesh);

  // Turned 48-seg thermally-blued Swiss steel arbor along Z axis
  const bluedMat = createBluedSteelMaterial(arborColorHex);
  const arborMesh = createFilletedShaft({
    radius: boreR * 1.06,
    height: arborLength,
    baseCollarFlare: boreR * 0.38,
    neckCollarFlare: boreR * 0.38,
    anglageBevel: 0.008,
    radialSegments: 48,
    centered: true,
    material: bluedMat,
    name: 'BluedSteelArbor',
  });
  arborMesh.rotation.x = Math.PI * 0.5;
  group.add(arborMesh);

  // Blued-steel collet ring & retaining pins
  const colletR = boreR * 1.52;
  const pinCount = Math.max(3, spokes || 4);
  for (let p = 0; p < pinCount; p++) {
    const a = (p / pinCount) * Math.PI * 2;
    const pin = createFilletedShaft({
      radius: Math.max(0.006, pitchR * 0.025),
      height: thickness * 1.32,
      anglageBevel: 0.004,
      radialSegments: 48,
      centered: true,
      material: bluedMat,
      name: 'BluedRetainingScrew',
    });
    pin.rotation.x = Math.PI * 0.5;
    pin.position.set(Math.cos(a) * colletR, Math.sin(a) * colletR, 0);
    group.add(pin);
  }

  return group;
}

// ----------------------------------------------------------------------------
// 5. `createNotchedBezel` — HEX | SCALLOP | VERNIER | WAX_SEAL Domain Bezels
// ----------------------------------------------------------------------------

export interface NotchedBezelOptionsV7 {
  notchShape: NotchBezelShapeV7;
  outerRadius?: number;
  innerRadius?: number;
  thickness?: number;
  bevel?: number;
  material?: THREE.Material;
  colorHex?: number;
  name?: string;
}

export function createNotchedBezelGeometry(
  notchShape: NotchBezelShapeV7,
  outerRadius = 0.34,
  innerRadius = 0.25,
  thickness = 0.055,
  bevelOverride?: number,
): THREE.ExtrudeGeometry {
  const bevel = Math.max(0.008, bevelOverride ?? 0.009);
  const rOut = Math.max(0.05, outerRadius - bevel);
  const rIn = Math.max(0.015, Math.min(rOut - 0.018, innerRadius + bevel * 0.4));

  const shape = new THREE.Shape();

  if (notchShape === 'HEX') {
    // 6-sided precision hex-nut bezel w/ chamfered flats
    const corners = 6;
    const sub = 4;
    const total = corners * sub;
    for (let i = 0; i < total; i++) {
      const idx = Math.floor(i / sub);
      const frac = (i % sub) / sub;
      const a0 = (idx / corners) * Math.PI * 2 + Math.PI / 6;
      const a1 = ((idx + 1) / corners) * Math.PI * 2 + Math.PI / 6;
      const t = clamp01((frac - 0.06) / 0.88);
      const x = lerp(Math.cos(a0) * rOut, Math.cos(a1) * rOut, t);
      const y = lerp(Math.sin(a0) * rOut, Math.sin(a1) * rOut, t);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
  } else if (notchShape === 'SCALLOP') {
    // 12-flute scalloped horological crown bezel
    const samples = 96;
    const lobes = 12;
    for (let i = 0; i < samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      const flute = Math.cos(a * lobes) * 0.5 + 0.5;
      const r = rOut * (0.91 + 0.09 * flute);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
  } else if (notchShape === 'VERNIER') {
    // 24-notch micrometer vernier index bezel
    const notches = 24;
    const step = (Math.PI * 2) / notches;
    for (let i = 0; i < notches; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.32;
      const a2 = a0 + step * 0.42;
      const a3 = a0 + step * 0.88;
      const rValley = rOut * 0.925;
      const rPeak = rOut;
      if (i === 0) shape.moveTo(Math.cos(a0) * rValley, Math.sin(a0) * rValley);
      else shape.lineTo(Math.cos(a0) * rValley, Math.sin(a0) * rValley);
      shape.lineTo(Math.cos(a1) * rValley, Math.sin(a1) * rValley);
      shape.lineTo(Math.cos(a2) * rPeak, Math.sin(a2) * rPeak);
      shape.lineTo(Math.cos(a3) * rPeak, Math.sin(a3) * rPeak);
    }
    shape.closePath();
  } else {
    // 'WAX_SEAL' — 8-lobe ceremonial wax-seal crest bezel
    const samples = 96;
    for (let i = 0; i < samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      const swell =
        0.92 +
        0.065 * Math.sin(a * 8 + 0.4) +
        0.025 * Math.cos(a * 5 - 0.8);
      const r = rOut * swell;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
  }

  if (rIn > 0.01) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }

  const coreDepth = Math.max(0.004, thickness - bevel * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geom.translate(0, 0, -coreDepth * 0.5);
  geom.rotateX(-Math.PI * 0.5);
  geom.computeVertexNormals();
  return geom;
}

export function createNotchedBezel(opts: NotchedBezelOptionsV7): THREE.Mesh {
  const geom = createNotchedBezelGeometry(
    opts.notchShape,
    opts.outerRadius,
    opts.innerRadius,
    opts.thickness,
    opts.bevel,
  );
  const mat =
    opts.material ??
    new THREE.MeshStandardMaterial({
      color: opts.colorHex ?? 0xe2b44c,
      metalness: 0.93,
      roughness: 0.2,
    });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = opts.name ?? `NotchedBezel_${opts.notchShape}`;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ----------------------------------------------------------------------------
// 6. `createAntiMoireFloorMaterial` — 1024x1024 Mipmapped DataTexture (16x) +
//    `onBeforeCompile` `fwidth(vWorldPos.xz)` Derivative Anti-Aliasing (0 Moiré!)
// ----------------------------------------------------------------------------

interface CachedFloorTextures {
  albedo: THREE.DataTexture;
  normal: THREE.DataTexture;
  roughness: THREE.DataTexture;
  meanHex: number;
  baseRoughness: number;
  baseMetalness: number;
  gridDensity: number;
}

const floorTextureCache = new Map<AntiMoireFloorKindV7, CachedFloorTextures>();

function buildAntiMoireFloorTextures(kind: AntiMoireFloorKindV7): CachedFloorTextures {
  const cached = floorTextureCache.get(kind);
  if (cached) return cached;

  const size = 1024;
  const totalPixels = size * size;
  const albedoBytes = new Uint8Array(totalPixels * 4);
  const roughBytes = new Uint8Array(totalPixels * 4);
  const normalBytes = new Uint8Array(totalPixels * 4);
  const heightField = new Float32Array(totalPixels);

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let normalStrength = 1.1;
  let baseRoughness = 0.36;
  let baseMetalness = 0.08;
  let gridDensity = 2.4;

  for (let py = 0; py < size; py++) {
    const v = py / size;
    for (let px = 0; px < size; px++) {
      const u = px / size;
      const idx = py * size + px;
      const i4 = idx * 4;

      let r = 64;
      let g = 58;
      let b = 52;
      let h = 0.5;
      let rough = 0.42;

      switch (kind) {
        case 'PARQUET': {
          // Gleaming 1966 NBC Studio 6A Honey-Teak Broadcast Parquet (warm sunlit satin!)
          normalStrength = 0.65;
          baseRoughness = 0.21;
          baseMetalness = 0.08;
          gridDensity = 2.6;
          const tiles = 4;
          const tx = Math.floor(u * tiles);
          const ty = Math.floor(v * tiles);
          const flip = (tx + ty) & 1;
          const lu = fract(u * tiles);
          const lv = fract(v * tiles);
          const stripCoord = flip ? lu : lv;
          const alongCoord = flip ? lv : lu;
          const strips = 5;
          const stripIdx = Math.floor(stripCoord * strips);
          const sf = fract(stripCoord * strips);
          const seamA = smoothstep(0.0, 0.036, sf) * smoothstep(0.0, 0.036, 1.0 - sf);
          const seamB = smoothstep(0.0, 0.015, alongCoord) * smoothstep(0.0, 0.015, 1.0 - alongCoord);
          const seam = 0.84 + 0.16 * seamA * seamB;
          const tone = 0.93 + 0.14 * hash2D(tx * 7 + stripIdx, ty * 11, 19);
          const grain = tileFbm(u * 2.0, v * 2.0, 8, 3, 23);
          r = lerp(84, 122, grain) * tone * seam;
          g = lerp(48, 72, grain) * tone * seam;
          b = lerp(26, 42, grain) * tone * seam;
          h = 0.48 + 0.07 * seam + 0.03 * grain;
          rough = lerp(0.18, 0.27, 1.0 - seam * 0.6 + grain * 0.14);
          break;
        }

        case 'GRANITE': {
          // 1965 World's Fair Glossy Mid-Century Space-Age Starburst Terrazzo!
          normalStrength = 0.6;
          baseRoughness = 0.19;
          baseMetalness = 0.14;
          gridDensity = 2.2;
          const slabs = 3;
          const su = fract(u * slabs);
          const sv = fract(v * slabs);
          const brassDivider =
            1.0 -
            smoothstep(0.0, 0.012, su) *
              smoothstep(0.0, 0.012, 1 - su) *
              smoothstep(0.0, 0.012, sv) *
              smoothstep(0.0, 0.012, 1 - sv);
          const macro = tileFbm(u, v, 6, 4, 41);
          const chipA = Math.pow(tileNoise(u, v, 42, 47), 3.0);
          const chipB = Math.pow(tileNoise(u, v, 68, 53), 4.0);
          const baseR = lerp(42, 74, macro) + chipA * 68 + chipB * 92;
          const baseG = lerp(74, 116, macro) + chipA * 76 + chipB * 88;
          const baseB = lerp(108, 154, macro) + chipA * 84 + chipB * 64;
          r = lerp(baseR, 236, brassDivider * 0.88);
          g = lerp(baseG, 194, brassDivider * 0.88);
          b = lerp(baseB, 96, brassDivider * 0.88);
          h = 0.46 + (1.0 - brassDivider) * 0.1 + chipA * 0.05;
          rough = lerp(0.18, 0.26, (1 - chipB) * 0.55) * (1.0 - brassDivider * 0.25);
          break;
        }

        case 'HERRINGBONE_OAK': {
          // Sunlit 1964 Broadway & Studio 5B Glossy Lacquered Teak Herringbone!
          normalStrength = 0.68;
          baseRoughness = 0.21;
          baseMetalness = 0.08;
          gridDensity = 3.0;
          const freq = 5;
          const rotU = (u + v) * freq;
          const rotV = (u - v) * freq;
          const cellU = Math.floor(rotU);
          const cellV = Math.floor(rotV);
          const parity = (cellU + cellV) & 1;
          const pCoord = parity ? fract(rotU * 2) : fract(rotV * 2);
          const lCoord = parity ? fract(rotV * 0.5) : fract(rotU * 0.5);
          const bevelSeam =
            smoothstep(0.0, 0.045, pCoord) *
            smoothstep(0.0, 0.045, 1 - pCoord) *
            smoothstep(0.0, 0.028, lCoord) *
            smoothstep(0.0, 0.028, 1 - lCoord);
          const plankVar = 0.89 + 0.22 * hash2D(cellU, cellV, 71);
          const fiber = tileFbm(u * 2, v * 2, 12, 3, 79);
          const seamMix = 0.64 + 0.36 * bevelSeam;
          r = lerp(66, 114, fiber) * plankVar * seamMix;
          g = lerp(40, 72, fiber) * plankVar * seamMix;
          b = lerp(28, 50, fiber) * plankVar * seamMix;
          h = 0.46 + bevelSeam * 0.18 + fiber * 0.06;
          rough = lerp(0.19, 0.28, 1.0 - bevelSeam * 0.6);
          break;
        }

        case 'TOURMALINE_BAIZE': {
          // 1966 CBS Jubilee & Monte Carlo Glossy Emerald-Teal Inlaid Brass Terrazzo!
          normalStrength = 0.7;
          baseRoughness = 0.22;
          baseMetalness = 0.14;
          gridDensity = 2.4;
          const border = Math.min(Math.min(u, 1 - u), Math.min(v, 1 - v));
          const brassInlay =
            smoothstep(0.036, 0.044, border) * (1.0 - smoothstep(0.052, 0.06, border));
          const diagA = Math.abs(fract(u + v) - 0.5);
          const fineBrass = 1.0 - smoothstep(0.005, 0.011, diagA);
          const marble = tileFbm(u, v, 7, 3, 109);
          const speckle = tileNoise(u, v, 64, 103);
          const emeraldR = lerp(16, 36, marble * 0.65 + speckle * 0.35);
          const emeraldG = lerp(92, 144, marble * 0.65 + speckle * 0.35);
          const emeraldB = lerp(96, 142, marble * 0.65 + speckle * 0.35);
          const inlayMask = clamp01(brassInlay + fineBrass * 0.45);
          r = lerp(emeraldR, 240, inlayMask);
          g = lerp(emeraldG, 192, inlayMask);
          b = lerp(emeraldB, 84, inlayMask);
          h = 0.46 + marble * 0.08 + inlayMask * 0.16;
          rough = lerp(0.24, 0.16, inlayMask);
          break;
        }

        case 'DIAMOND_PLATE_STEEL': {
          // 1966 RCA Color Control Studio & Pirate Ship Glossy Cobalt-Teal Deck w/ Brushed Chrome Strips!
          normalStrength = 0.75;
          baseRoughness = 0.22;
          baseMetalness = 0.32;
          gridDensity = 3.0;
          const cells = 10;
          const cx = Math.floor(u * cells);
          const cy = Math.floor(v * cells);
          const fu = fract(u * cells) - 0.5;
          const fv = fract(v * cells) - 0.5;
          const alt = (cx + cy) & 1;
          const rx = (fu + fv) * 0.7071;
          const ry = (fu - fv) * 0.7071;
          const lugLen = alt ? Math.abs(rx) : Math.abs(ry);
          const lugWid = alt ? Math.abs(ry) : Math.abs(rx);
          const diamond = 1.0 - smoothstep(0.16, 0.26, lugLen * 0.72 + lugWid * 1.9);
          const brushed = tileFbm(u, v, 14, 3, 137);
          const seam =
            smoothstep(0.0, 0.014, fract(u * 2)) *
            smoothstep(0.0, 0.014, 1 - fract(u * 2)) *
            smoothstep(0.0, 0.014, fract(v * 2)) *
            smoothstep(0.0, 0.014, 1 - fract(v * 2));
          const chromeStrip = 1.0 - seam;
          const steelBase = lerp(42, 76, brushed * 0.55 + diamond * 0.45);
          r = lerp(steelBase * 0.65, 198, chromeStrip * 0.72);
          g = lerp(steelBase * 1.05, 224, chromeStrip * 0.72);
          b = lerp(steelBase * 1.48, 242, chromeStrip * 0.72);
          h = 0.44 + seam * (0.12 + diamond * 0.2) + chromeStrip * 0.08;
          rough = lerp(0.25, 0.17, clamp01(diamond * 0.6 + chromeStrip));
          break;
        }

        case 'BELGIAN_ASTROLABE_MARBLE': {
          // 1966 38th-Floor Executive Penthouse Glossy Midnight-Sapphire & 24K Gold Astrolabe Marble!
          normalStrength = 0.72;
          baseRoughness = 0.18;
          baseMetalness = 0.18;
          gridDensity = 2.0;
          const dx = u - 0.5;
          const dy = v - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ringA = 1.0 - smoothstep(0.004, 0.011, Math.abs(dist - 0.36));
          const ringB = 1.0 - smoothstep(0.003, 0.009, Math.abs(dist - 0.22));
          const diagRay =
            dist > 0.06 && dist < 0.44
              ? 1.0 - smoothstep(0.003, 0.008, Math.min(Math.abs(dx), Math.abs(dy)))
              : 0;
          const brassAstrolabe = clamp01(ringA + ringB + diagRay * 0.85);

          const w1 = tileFbm(u, v, 4, 4, 181);
          const w2 = tileFbm(u + w1 * 0.35, v - w1 * 0.28, 5, 4, 193);
          const veinWave = Math.abs(Math.sin((u * 2.5 + v * 3.0 + w2 * 3.4) * Math.PI));
          const goldVein = Math.pow(1.0 - veinWave, 14.0);
          const cloud = tileFbm(u, v, 8, 3, 199);

          const mR = lerp(24 + cloud * 24, 232, goldVein * 0.76);
          const mG = lerp(42 + cloud * 32, 192, goldVein * 0.76);
          const mB = lerp(74 + cloud * 48, 96, goldVein * 0.76);
          r = lerp(mR, 246, brassAstrolabe);
          g = lerp(mG, 202, brassAstrolabe);
          b = lerp(mB, 92, brassAstrolabe);
          h = 0.5 - goldVein * 0.08 + brassAstrolabe * 0.14 + cloud * 0.04;
          rough = lerp(0.19 + cloud * 0.06, 0.15, brassAstrolabe);
          break;
        }
      }

      const rb = Math.round(clamp01(r / 255) * 255);
      const gb = Math.round(clamp01(g / 255) * 255);
      const bb = Math.round(clamp01(b / 255) * 255);
      albedoBytes[i4] = rb;
      albedoBytes[i4 + 1] = gb;
      albedoBytes[i4 + 2] = bb;
      albedoBytes[i4 + 3] = 255;

      sumR += rb;
      sumG += gb;
      sumB += bb;

      const roughByte = Math.round(clamp01(rough) * 255);
      roughBytes[i4] = roughByte;
      roughBytes[i4 + 1] = roughByte;
      roughBytes[i4 + 2] = roughByte;
      roughBytes[i4 + 3] = 255;

      heightField[idx] = clamp01(h);
    }
  }

  // Sobel normal generation across 1024x1024 seamless wrap
  const mask = size - 1;
  for (let y = 0; y < size; y++) {
    const ym = (y - 1) & mask;
    const yp = (y + 1) & mask;
    for (let x = 0; x < size; x++) {
      const xm = (x - 1) & mask;
      const xp = (x + 1) & mask;
      const tl = heightField[ym * size + xm];
      const tc = heightField[ym * size + x];
      const tr = heightField[ym * size + xp];
      const ml = heightField[y * size + xm];
      const mr = heightField[y * size + xp];
      const bl = heightField[yp * size + xm];
      const bc = heightField[yp * size + x];
      const br = heightField[yp * size + xp];

      const gx = tr + 2 * mr + br - (tl + 2 * ml + bl);
      const gy = bl + 2 * bc + br - (tl + 2 * tc + tr);
      let nx = -gx * normalStrength;
      let ny = -gy * normalStrength;
      let nz = 1.0;
      const inv = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx *= inv;
      ny *= inv;
      nz *= inv;

      const i4 = (y * size + x) * 4;
      normalBytes[i4] = Math.round((nx * 0.5 + 0.5) * 255);
      normalBytes[i4 + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalBytes[i4 + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalBytes[i4 + 3] = 255;
    }
  }

  const configureDataTex = (bytes: Uint8Array, isColor: boolean): THREE.DataTexture => {
    const tex = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 16;
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.needsUpdate = true;
    (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
    return tex;
  };

  const meanR = Math.round(sumR / totalPixels);
  const meanG = Math.round(sumG / totalPixels);
  const meanB = Math.round(sumB / totalPixels);
  const meanHex = (meanR << 16) | (meanG << 8) | meanB;

  const built: CachedFloorTextures = {
    albedo: configureDataTex(albedoBytes, true),
    normal: configureDataTex(normalBytes, false),
    roughness: configureDataTex(roughBytes, false),
    meanHex,
    baseRoughness,
    baseMetalness,
    gridDensity,
  };
  floorTextureCache.set(kind, built);
  return built;
}

export interface AntiMoireFloorOptionsV7 {
  repeatX?: number;
  repeatY?: number;
  tintHex?: number;
  envMapIntensity?: number;
  envMap?: THREE.Texture | null;
  clearcoat?: number;
  baseRoughness?: number;
}

export function createAntiMoireFloorMaterial(
  kind: AntiMoireFloorKindV7,
  opts: AntiMoireFloorOptionsV7 = {},
): THREE.MeshPhysicalMaterial {
  const texSet = buildAntiMoireFloorTextures(kind);
  const repeatX = opts.repeatX ?? 7;
  const repeatY = opts.repeatY ?? 7;

  // Clone lightweight texture wrappers sharing the same 1024x1024 GPU mipmap buffer when custom repeats are used
  const map = texSet.albedo.clone();
  map.repeat.set(repeatX, repeatY);
  map.needsUpdate = true;
  (map.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = false;

  const normalMap = texSet.normal.clone();
  normalMap.repeat.set(repeatX, repeatY);
  normalMap.needsUpdate = true;
  (normalMap.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = false;

  const roughnessMap = texSet.roughness.clone();
  roughnessMap.repeat.set(repeatX, repeatY);
  roughnessMap.needsUpdate = true;
  (roughnessMap.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = false;

  const tintColor = new THREE.Color(opts.tintHex ?? 0xffffff);
  const meanColor = new THREE.Color(texSet.meanHex).multiply(tintColor);

  // Polished 1966 Glossy Broadcast Stage Floor (`roughness: 0.18..0.26`, `clearcoat: 0.65`)
  // with Toksvig/fwidth derivative anti-moiré suppression at glancing far-stage angles!
  const mat = new THREE.MeshPhysicalMaterial({
    color: tintColor,
    map,
    normalMap,
    normalScale: new THREE.Vector2(0.11, 0.11),
    roughnessMap,
    roughness: Math.min(0.26, Math.max(0.18, opts.baseRoughness ?? texSet.baseRoughness)),
    metalness: Math.min(0.24, texSet.baseMetalness),
    clearcoat: opts.clearcoat ?? 0.65,
    clearcoatRoughness: 0.12,
    reflectivity: 0.92,
    envMap: opts.envMap ?? null,
    envMapIntensity: opts.envMapIntensity ?? 1.15,
  });

  const gridDensity = texSet.gridDensity;
  mat.customProgramCacheKey = () => `ws_v7_antimoire_glossy_floor_${kind}`;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uMeanFloorColor = { value: meanColor };
    shader.uniforms.uGridDensity = { value: gridDensity };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec3 vWorldPos;
        `,
      )
      .replace(
        '#include <project_vertex>',
        /* glsl */ `
        #include <project_vertex>
        vec4 wsFloorPos = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          wsFloorPos = instanceMatrix * wsFloorPos;
        #endif
        wsFloorPos = modelMatrix * wsFloorPos;
        vWorldPos = wsFloorPos.xyz;
        `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec3 vWorldPos;
        uniform vec3 uMeanFloorColor;
        uniform float uGridDensity;
        `,
      )
      .replace(
        '#include <map_fragment>',
        /* glsl */ `
        #include <map_fragment>
        vec2 fwFloor = fwidth( vWorldPos.xz * uGridDensity );
        float floorFootprint = max( fwFloor.x, fwFloor.y );
        float moireSuppress = smoothstep( 0.18, 0.82, floorFootprint );
        diffuseColor.rgb = mix( diffuseColor.rgb, uMeanFloorColor, moireSuppress * 0.88 );
        `,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        /* glsl */ `
        #include <roughnessmap_fragment>
        vec2 fwRough = fwidth( vWorldPos.xz * uGridDensity );
        float toksvigFade = smoothstep( 0.18, 0.84, max( fwRough.x, fwRough.y ) );
        roughnessFactor = clamp( mix( roughnessFactor, max( roughnessFactor, 0.42 ), toksvigFade * 0.72 ), 0.16, 0.86 );
        `,
      );
  };

  return mat;
}

// ----------------------------------------------------------------------------
// 7. Canonical 1960s Living Color & Horological PBR Materials + Sculpted Set CAD
// ----------------------------------------------------------------------------

export function create24KGoldMaterial(envMap?: THREE.Texture | null): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffd166,
    metalness: 0.92,
    roughness: 0.22,
    envMap: envMap ?? null,
    envMapIntensity: 1.45,
  });
}

export function createBluedSteelMaterial(hex = 0x1e56c5, envMap?: THREE.Texture | null): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: hex,
    metalness: 0.88,
    roughness: 0.18,
    envMap: envMap ?? null,
    envMapIntensity: 1.55,
  });
}

export function createGrandFeuEnamelMaterial(hex: number, envMap?: THREE.Texture | null): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness: 0.08,
    roughness: 0.11,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95,
    envMap: envMap ?? null,
    envMapIntensity: 1.45,
  });
}

export function createPlatinumMaterial(envMap?: THREE.Texture | null): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xf2f6fc,
    metalness: 0.95,
    roughness: 0.14,
    envMap: envMap ?? null,
    envMapIntensity: 1.75,
  });
}

export function createAnodizedAluminumMaterial(envMap?: THREE.Texture | null): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xe4ebf4,
    metalness: 0.9,
    roughness: 0.22,
    clearcoat: 0.42,
    clearcoatRoughness: 0.16,
    envMap: envMap ?? null,
    envMapIntensity: 1.55,
  });
}

export function createObsidianMaterial(envMap?: THREE.Texture | null): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0x162438, // Rich 1966 Broadcast Midnight Slate (never dead brown-black mud!)
    metalness: 0.24,
    roughness: 0.14,
    clearcoat: 0.92,
    clearcoatRoughness: 0.08,
    envMap: envMap ?? null,
    envMapIntensity: 1.38,
  });
}

export function createWalnutMaterial(envMap?: THREE.Texture | null): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0x764124, // Sunlit 1966 American Teak/Walnut Veneer (never dark Victorian mud!)
    metalness: 0.06,
    roughness: 0.24,
    clearcoat: 0.72,
    clearcoatRoughness: 0.14,
    envMap: envMap ?? null,
    envMapIntensity: 1.15,
  });
}

let cachedAcryliteDiffuserTex: THREE.CanvasTexture | null = null;
function getAcryliteDiffuserTexture(): THREE.CanvasTexture {
  if (cachedAcryliteDiffuserTex) return cachedAcryliteDiffuserTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    // Backlit 1966 frosted Acrylite diffuser glow (bright warm core + soft architectural bezel edge)
    const grad = ctx.createRadialGradient(128, 124, 16, 128, 128, 168);
    grad.addColorStop(0.0, '#ffffff');
    grad.addColorStop(0.58, '#eef3f8');
    grad.addColorStop(0.86, '#bcc8d6');
    grad.addColorStop(1.0, '#8d9cb0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle frosted translucent mid-century horizontal light-tube rib shading
    ctx.fillStyle = 'rgba(255, 255, 255, 0.075)';
    for (let y = 16; y < 256; y += 32) {
      ctx.fillRect(0, y, 256, 10);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedAcryliteDiffuserTex = tex;
  return tex;
}

export function createAcrylitePanelMaterial(
  hex: number,
  emissiveIntensity = 0.72,
  envMap?: THREE.Texture | null,
): THREE.MeshPhysicalMaterial {
  const diffTex = getAcryliteDiffuserTexture();
  return new THREE.MeshPhysicalMaterial({
    color: hex,
    map: diffTex,
    emissive: hex,
    emissiveMap: diffTex,
    emissiveIntensity,
    metalness: 0.04,
    roughness: 0.16,
    clearcoat: 0.96,
    clearcoatRoughness: 0.07,
    reflectivity: 0.95,
    envMap: envMap ?? null,
    envMapIntensity: 1.35,
  });
}

let cachedVolumetricConeTex: THREE.CanvasTexture | null = null;
function getVolumetricConeTexture(): THREE.CanvasTexture {
  if (cachedVolumetricConeTex) return cachedVolumetricConeTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    // Smooth Pixar-grade studio spotlight beam falloff (soft top origin -> luminous shaft -> feathered floor fade)
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, 'rgba(255,255,255,0.0)');
    grad.addColorStop(0.12, 'rgba(255,255,255,0.72)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.34)');
    grad.addColorStop(0.82, 'rgba(255,255,255,0.11)');
    grad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedVolumetricConeTex = tex;
  return tex;
}

export function createVolumetricLightCone(opts: {
  topRadius: number;
  bottomRadius: number;
  height: number;
  colorHex: number;
  opacity?: number;
  name?: string;
}): { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial } {
  const geom = new THREE.CylinderGeometry(
    Math.max(0.05, opts.topRadius),
    Math.max(0.15, opts.bottomRadius),
    Math.max(0.5, opts.height),
    36,
    1,
    true,
  );
  const material = new THREE.MeshBasicMaterial({
    color: opts.colorHex,
    map: getVolumetricConeTexture(),
    transparent: true,
    opacity: opts.opacity ?? 0.095,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, material);
  mesh.name = opts.name ?? 'VolumetricStudioSpotCone';
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = 3;
  return { mesh, material };
}

/** Sculpted 1966 Mid-Century Atomic Starburst (`ExtrudeGeometry` tapered kite rays + turned central orb). */
export function createMidCenturyStarburst(opts: {
  radius?: number;
  rays?: number;
  depth?: number;
  primaryMat?: THREE.Material;
  accentMat?: THREE.Material;
  bulbMat?: THREE.Material;
  name?: string;
} = {}): THREE.Group {
  const radius = Math.max(0.35, opts.radius ?? 1.15);
  const rays = Math.max(8, Math.round(opts.rays ?? 12));
  const depth = Math.max(0.03, opts.depth ?? 0.065);
  const primaryMat = opts.primaryMat ?? create24KGoldMaterial();
  const accentMat = opts.accentMat ?? createAnodizedAluminumMaterial();

  const group = new THREE.Group();
  group.name = opts.name ?? 'MidCenturyStarburst1966';

  // Sculpted diamond-tapered starburst ray shape (no primitive boxes!)
  const makeRayGeom = (len: number, halfW: number): THREE.ExtrudeGeometry => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.08);
    s.lineTo(halfW, len * 0.24);
    s.lineTo(0, len);
    s.lineTo(-halfW, len * 0.24);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: Math.max(0.01, depth - 0.016),
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
    });
    g.translate(0, 0, -(depth - 0.016) * 0.5);
    g.computeVertexNormals();
    return g;
  };

  const longRayGeom = makeRayGeom(radius, radius * 0.075);
  const shortRayGeom = makeRayGeom(radius * 0.72, radius * 0.055);

  for (let i = 0; i < rays; i++) {
    const isMajor = i % 2 === 0;
    const angle = (i / rays) * Math.PI * 2;
    const rayMesh = new THREE.Mesh(
      isMajor ? longRayGeom : shortRayGeom,
      isMajor ? primaryMat : accentMat,
    );
    rayMesh.rotation.z = angle;
    rayMesh.castShadow = false;
    group.add(rayMesh);

    if (opts.bulbMat && isMajor) {
      const tipOrb = createTurnedOrb({
        radius: Math.max(0.032, radius * 0.048),
        radialSegments: 24,
        material: opts.bulbMat,
        castShadow: false,
        receiveShadow: false,
      });
      const tipDist = radius * 1.02;
      tipOrb.position.set(-Math.sin(angle) * tipDist, Math.cos(angle) * tipDist, 0.02);
      group.add(tipOrb);
    }
  }

  // Turned satin-brass hub medallion
  const hubRing = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: radius * 0.25,
    innerRadius: radius * 0.14,
    thickness: depth * 1.25,
    material: primaryMat,
  });
  hubRing.rotation.x = Math.PI * 0.5;
  const hubCore = createTurnedOrb({
    radius: radius * 0.16,
    heightScale: 0.65,
    radialSegments: 32,
    material: opts.bulbMat ?? accentMat,
    castShadow: false,
  });
  hubCore.rotation.x = Math.PI * 0.5;
  hubCore.position.z = depth * 0.32;
  group.add(hubRing, hubCore);

  return group;
}

/** Curved Mid-Century Parabolic Light Cove Arch (`ExtrudeGeometry` smooth quadratic parabola + bevel). */
export function createCurvedParabolicCove(opts: {
  spanWidth: number;
  archHeight: number;
  depth: number;
  thickness: number;
  material?: THREE.Material;
  name?: string;
}): THREE.Mesh {
  const hw = Math.max(0.4, opts.spanWidth * 0.5);
  const h = Math.max(0.5, opts.archHeight);
  const t = Math.max(0.08, opts.thickness);
  const steps = 28;

  const shape = new THREE.Shape();
  for (let i = 0; i <= steps; i++) {
    const s = (i / steps) * 2 - 1; // -1 .. +1
    const x = s * hw;
    const y = h * (1 - s * s);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const innerHw = Math.max(0.2, hw - t);
  const innerH = Math.max(0.2, h - t);
  for (let i = steps; i >= 0; i--) {
    const s = (i / steps) * 2 - 1;
    const x = s * innerHw;
    const y = Math.max(0, innerH * (1 - s * s));
    shape.lineTo(x, y);
  }
  shape.closePath();

  const bevel = 0.014;
  const coreD = Math.max(0.02, opts.depth - bevel * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreD,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  });
  geom.translate(0, 0, -coreD * 0.5);
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, opts.material ?? createAnodizedAluminumMaterial());
  mesh.name = opts.name ?? 'ParabolicLightCove1966';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Tapered 1966 Mid-Century Chasing `#11` Incandescent Marquee Pillar bolted to `y = 0.00m`. */
export function createChasingMarqueePillar(opts: {
  height: number;
  bulbCount?: number;
  bodyMat: THREE.Material;
  trimMat: THREE.Material;
  boltMat: THREE.Material;
  bulbHex?: number;
  name?: string;
}): { group: THREE.Group; bulbMats: THREE.MeshStandardMaterial[] } {
  const h = Math.max(1.2, opts.height);
  const bulbCount = Math.max(4, opts.bulbCount ?? 9);
  const group = new THREE.Group();
  group.name = opts.name ?? 'ChasingMarqueePillar1966';

  // Sculpted circular brass-bolted base plinth resting flush on y = 0.00m
  const baseFlange = createFilletedShaft({
    radius: 0.21,
    topRadius: 0.16,
    height: 0.12,
    baseCollarFlare: 0.03,
    neckCollarFlare: 0.015,
    anglageBevel: 0.01,
    radialSegments: 36,
    material: opts.trimMat,
  });
  group.add(baseFlange);

  // Sleek tapered fluted Mid-Century column shaft
  const shaft = createFilletedShaft({
    radius: 0.125,
    topRadius: 0.155,
    height: h - 0.12,
    baseCollarFlare: 0.02,
    neckCollarFlare: 0.035,
    anglageBevel: 0.01,
    radialSegments: 36,
    material: opts.bodyMat,
  });
  shaft.position.y = 0.12;
  group.add(shaft);

  // Brass finial crown orb
  const crown = createTurnedOrb({
    radius: 0.145,
    heightScale: 0.72,
    radialSegments: 32,
    material: opts.trimMat,
    castShadow: false,
  });
  crown.position.y = h + 0.08;
  group.add(crown);

  // Vertical recessed anodized marquee track with `#11` warm 2700K chasing tungsten bulbs
  const bulbHex = opts.bulbHex ?? 0xffd56b;
  const bulbMats: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < bulbCount; i++) {
    const t = (i + 0.5) / bulbCount;
    const by = 0.34 + t * (h - 0.56);
    const localR = lerp(0.128, 0.154, t);

    const socketRing = createNotchedBezel({
      notchShape: 'SCALLOP',
      outerRadius: 0.056,
      innerRadius: 0.034,
      thickness: 0.028,
      material: opts.trimMat,
    });
    socketRing.rotation.x = Math.PI * 0.5;
    socketRing.position.set(0, by, localR + 0.01);
    group.add(socketRing);

    const bMat = new THREE.MeshStandardMaterial({
      color: 0xfff6dc,
      emissive: bulbHex,
      emissiveIntensity: 0.9,
      roughness: 0.12,
      metalness: 0.05,
    });
    const bulb = createTurnedOrb({
      radius: 0.044,
      radialSegments: 20,
      material: bMat,
      castShadow: false,
      receiveShadow: false,
    });
    bulb.position.set(0, by, localR + 0.038);
    group.add(bulb);
    bulbMats.push(bMat);
  }

  return { group, bulbMats };
}

/** Smooth beveled circular satin-brass / anodized floor ring (ZERO cog teeth!). */
export function createSmoothBeveledRing(opts: {
  innerRadius: number;
  outerRadius: number;
  thickness?: number;
  bevel?: number;
  segments?: number;
  material?: THREE.Material;
  name?: string;
}): THREE.Mesh {
  const rIn = Math.max(0.05, opts.innerRadius);
  const rOut = Math.max(rIn + 0.03, opts.outerRadius);
  const thickness = Math.max(0.008, opts.thickness ?? 0.016);
  const bevel = Math.min(thickness * 0.35, Math.max(0.003, opts.bevel ?? 0.005));
  const segs = Math.max(48, opts.segments ?? 72);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut - bevel, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn + bevel, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const coreD = Math.max(0.003, thickness - bevel * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreD,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: segs,
  });
  geom.translate(0, 0, -coreD * 0.5);
  geom.rotateX(-Math.PI * 0.5);
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, opts.material ?? create24KGoldMaterial());
  mesh.name = opts.name ?? 'SmoothBroadcastFloorRing';
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}

/** Sculpted 1960s Googie / World's Fair Boomerang Swept Wing Pylon (ZERO boxy slabs!). */
export function createMidCenturyBoomerangPylon(opts: {
  height: number;
  sweepX: number;
  thickness?: number;
  depth?: number;
  material?: THREE.Material;
  name?: string;
}): THREE.Mesh {
  const h = Math.max(1.0, opts.height);
  const sx = opts.sweepX;
  const t = Math.max(0.12, opts.thickness ?? 0.28);
  const d = Math.max(0.08, opts.depth ?? 0.16);

  const shape = new THREE.Shape();
  shape.moveTo(-t * 0.6, 0);
  shape.quadraticCurveTo(sx * 0.72, h * 0.45, sx * 0.18, h);
  shape.lineTo(sx * 0.18 + t * 0.42, h);
  shape.quadraticCurveTo(sx * 0.72 + t, h * 0.46, t * 0.65, 0);
  shape.closePath();

  const bevel = 0.014;
  const coreD = Math.max(0.02, d - bevel * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreD,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 20,
  });
  geom.translate(0, 0, -coreD * 0.5);
  geom.computeVertexNormals();

  const mesh = new THREE.Mesh(geom, opts.material ?? createAnodizedAluminumMaterial());
  mesh.name = opts.name ?? 'GoogieBoomerangPylon1966';
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Bakes a bright, ultra-clean 256px 1966 "In Living Color" Network Soundstage IBL
 * (`PMREMGenerator`): 3200K warm overhead softboxes + Peacock Teal & Harvest Gold
 * studio cove bounce + clean sunlit floor reflection (ZERO dark muddy brown!).
 */
export function createLivingColorBroadcastIbl(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const studioScene = new THREE.Scene();
  studioScene.background = new THREE.Color(0x132b42); // Rich 1966 30-Rock Studio Navy!

  const addSoftbox = (
    w: number,
    h: number,
    hex: number,
    intensity: number,
    pos: [number, number, number],
  ) => {
    const geom = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(hex).multiplyScalar(intensity),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0.8, 0);
    studioScene.add(mesh);
  };

  // Overhead 300-footcandle 3200K quartz-tungsten studio grid banks
  addSoftbox(15, 15, 0xfff0d4, 3.6, [0, 9.5, 1.2]);
  // Key warm-gold broadcast specular strip (right front)
  addSoftbox(10, 6.5, 0xffd56e, 3.8, [6.8, 5.4, 6.0]);
  // Crisp cool-cream fill bank (left front)
  addSoftbox(10, 6.5, 0xe8f6ff, 3.0, [-6.8, 5.0, 5.4]);
  // Living Color Peacock Teal & Harvest Gold upstage cove rim bounce
  addSoftbox(12, 5.5, 0x00c8dc, 2.35, [-5.6, 3.6, -6.6]);
  addSoftbox(12, 5.5, 0xffb347, 2.55, [5.6, 3.6, -6.6]);
  // Glossy sunlit teak/navy studio floor bounce
  addSoftbox(18, 18, 0x264b68, 1.5, [0, -4.6, 0]);

  const rt = pmrem.fromScene(studioScene, 0.03);
  disposeObject3DTree(studioScene);
  pmrem.dispose();
  return rt;
}

export function createBorosilicateGlassMaterial(
  tintHex = 0xeef7ff,
  opacity = 0.34,
  envMap?: THREE.Texture | null,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: tintHex,
    metalness: 0.04,
    roughness: 0.06,
    transparent: true,
    opacity,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 1.0,
    depthWrite: false,
    envMap: envMap ?? null,
    envMapIntensity: 1.5,
  });
}

// ----------------------------------------------------------------------------
// 8. Spring Kinematics, HDR Solenoid Spark Emitter & Clean Tree Disposal
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
}

export class HdrSolenoidSparkBurst {
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

  constructor(maxParticles = 240) {
    this.maxParticles = maxParticles;
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.ages = new Float32Array(maxParticles).fill(999);
    this.lifetimes = new Float32Array(maxParticles).fill(1);
    this.sizes = new Float32Array(maxParticles);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aLifeRatio', new THREE.BufferAttribute(new Float32Array(maxParticles), 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));

    // HDR 2.8+ linear luminance so Solenoid Sparks trigger selective 1.15 bloom
    // and remain at 100% HDR luminance even during -55% card aperture dimming!
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: 1.5 },
      },
      vertexShader: /* glsl */ `
        attribute float aLifeRatio;
        attribute float aSize;
        varying float vLife;
        uniform float uPixelRatio;
        void main() {
          vLife = aLifeRatio;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio * (16.0 / max(1.0, -mvPos.z));
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
          vec3 colHot = vec3(2.9, 2.5, 1.8);
          vec3 colCopper = vec3(2.4, 1.15, 0.28);
          vec3 hdr = mix(colCopper, colHot, vLife) * (0.9 + core * 1.4);
          gl_FragColor = vec4(hdr, core * vLife);
        }
      `,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = 'HdrSolenoidSparkBurst';
  }

  public setPixelRatio(dpr: number): void {
    this.material.uniforms.uPixelRatio.value = Math.min(2.5, Math.max(1.0, dpr));
  }

  public emit(origin: THREE.Vector3 | [number, number, number], count = 28, speed = 3.6): void {
    const ox = Array.isArray(origin) ? origin[0] : origin.x;
    const oy = Array.isArray(origin) ? origin[1] : origin.y;
    const oz = Array.isArray(origin) ? origin[2] : origin.z;

    for (let k = 0; k < count; k++) {
      const idx = this.cursor;
      this.cursor = (this.cursor + 1) % this.maxParticles;

      const theta = Math.random() * Math.PI * 2;
      const elev = (Math.random() * 0.7 + 0.15) * Math.PI * 0.5;
      const spd = speed * (0.45 + Math.random() * 0.85);

      this.positions[idx * 3] = ox + (Math.random() - 0.5) * 0.05;
      this.positions[idx * 3 + 1] = oy + (Math.random() - 0.5) * 0.05;
      this.positions[idx * 3 + 2] = oz + (Math.random() - 0.5) * 0.05;

      this.velocities[idx * 3] = Math.cos(theta) * Math.cos(elev) * spd;
      this.velocities[idx * 3 + 1] = Math.sin(elev) * spd;
      this.velocities[idx * 3 + 2] = Math.sin(theta) * Math.cos(elev) * spd;

      this.ages[idx] = 0;
      this.lifetimes[idx] = 0.28 + Math.random() * 0.42;
      this.sizes[idx] = 4.0 + Math.random() * 5.5;
    }
  }

  public update(dtSec: number): void {
    const dt = Math.min(0.05, Math.max(0, dtSec));
    const lifeAttr = this.geometry.getAttribute('aLifeRatio') as THREE.BufferAttribute;
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const sizeAttr = this.geometry.getAttribute('aSize') as THREE.BufferAttribute;
    const drag = Math.exp(-2.2 * dt);

    let anyAlive = false;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.ages[i] >= this.lifetimes[i]) {
        lifeAttr.setX(i, 0);
        continue;
      }
      anyAlive = true;
      this.ages[i] += dt;
      lifeAttr.setX(i, clamp01(1 - this.ages[i] / this.lifetimes[i]));

      const p3 = i * 3;
      this.velocities[p3] *= drag;
      this.velocities[p3 + 1] = this.velocities[p3 + 1] * drag - 9.8 * dt;
      this.velocities[p3 + 2] *= drag;

      this.positions[p3] += this.velocities[p3] * dt;
      this.positions[p3 + 1] += this.velocities[p3 + 1] * dt;
      this.positions[p3 + 2] += this.velocities[p3 + 2] * dt;

      if (this.positions[p3 + 1] < 0.02) {
        this.positions[p3 + 1] = 0.02;
        this.velocities[p3 + 1] = Math.abs(this.velocities[p3 + 1]) * 0.35;
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
      const rec = mat as unknown as Record<string, unknown>;
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap']) {
        const tex = rec[k] as THREE.Texture | undefined;
        if (tex && typeof tex.dispose === 'function') {
          const ud = tex.userData as Record<string, unknown> | undefined;
          if (!ud || !ud[SHARED_CAD_TEX_FLAG]) {
            tex.dispose();
          }
        }
      }
      mat.dispose();
    }
  });
}

export function disposeHorologicalFloorCache(): void {
  for (const entry of floorTextureCache.values()) {
    entry.albedo.dispose();
    entry.normal.dispose();
    entry.roughness.dispose();
  }
  floorTextureCache.clear();
  if (cachedAcryliteDiffuserTex) {
    cachedAcryliteDiffuserTex.dispose();
    cachedAcryliteDiffuserTex = null;
  }
  if (cachedVolumetricConeTex) {
    cachedVolumetricConeTex.dispose();
    cachedVolumetricConeTex = null;
  }
}
