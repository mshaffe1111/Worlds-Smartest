// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Living Color Master)
// `src/v7/engine/LitTrophyVaultV7.ts`
//  - `TROPHY_CATALOG_V7[36]` — 1:1 Canonical IDs `trophy_s1_01`..`trophy_s4_36`
//    with 36 UNMISTAKABLY DISTINCT, ZERO-CLONE 1966 Mid-Century 3D Sculptures,
//    honest live-trigger unlock goals, and 4 Rarity Tiers (Bronze Medal,
//    Silver Medal, Gold Trophy, Platinum Crown) across 4 Category Groups.
//  - `getTrophyDisplayMetaV7(trophyId)` + `getTrophyCatalogSummaryV7(...)` for
//    *Balatro* / *Astro Bot* grind-worthy gallery tabs, rarity badges & progress!
//  - `LitTrophyVaultRendererV7` — Museum-grade 1966 NBC/CBS "In Living Color"
//    Revolving Prize Turntable:
//      * Peacock Navy & CBS Royal Cobalt curved studio cyclorama + overhead
//        volumetric studio spotlight cone + 4-point jewelers' specular rig
//      * Chasing `#11` warm 2700K tungsten marquee bulbs (cool sapphire on locked)
//      * Clearcoated walnut & cobalt turntable + plush tier-colored Velvet Cushion
//        + braided brass bullion piping + front-mounted Engraved Brass Nameplate
//      * Grounded radial contact shadows, floating RCA TK-41 specular sparkle
//        glints, mysterious dark-gunmetal locked silhouettes & drag-to-inspect!
// ============================================================================

import * as THREE from 'three';
import type { TrophySpecV7 } from '../contracts_v7';
import {
  SHARED_CAD_TEX_FLAG,
  create24KGoldMaterial,
  createAnodizedAluminumMaterial,
  createBluedSteelMaterial,
  createBorosilicateGlassMaterial,
  createChamferedArch,
  createChamferedBox,
  createFilletedShaft,
  createGrandFeuEnamelMaterial,
  createNotchedBezel,
  createPlatinumMaterial,
  createSmoothBeveledRing,
  createTurnedOrb,
  createWalnutMaterial,
  disposeObject3DTree,
} from './HorologicalCAD';

// ----------------------------------------------------------------------------
// 0. Exported Progression Metadata Types & Board/Difficulty Mastery Stamps
// ----------------------------------------------------------------------------

export type TrophyTierBadgeV7 =
  | 'BRONZE MEDAL'
  | 'SILVER MEDAL'
  | 'GOLD TROPHY'
  | 'PLATINUM CROWN';

export type TrophyCategoryGroupV7 =
  | 'SHOWMANSHIP'
  | 'BOARD MASTERY'
  | 'SCOUTING & WIT'
  | 'CHAMPIONSHIP DYNASTY';

export type TrophyMilestoneTagV7 =
  | 'QUICK-WIN'
  | 'STAGE'
  | 'SKILL'
  | 'SCOUTING'
  | 'DYNASTY';

export interface TrophyDisplayMetaV7 {
  readonly trophyId: string;
  readonly tierBadge: TrophyTierBadgeV7;
  readonly categoryGroup: TrophyCategoryGroupV7;
  readonly grindHint: string;
  readonly accentHex: string;
  readonly formLabel: string;
  readonly rarityPoints: number;
  readonly milestoneTag: TrophyMilestoneTagV7;
}

export interface TrophyCatalogSummaryV7 {
  readonly unlockedCount: number;
  readonly totalCount: number;
  readonly completionPct: number;
  readonly earnedPoints: number;
  readonly totalPoints: number;
  readonly rankTitle: string;
  readonly byTier: Readonly<Record<TrophyTierBadgeV7, { unlocked: number; total: number }>>;
  readonly byGroup: Readonly<Record<TrophyCategoryGroupV7, { unlocked: number; total: number }>>;
}

// ----------------------------------------------------------------------------
// 1. Shared Deterministic 1966 Living Color Procedural Textures (DOM-Free!)
// ----------------------------------------------------------------------------

let cachedShowcaseCycTex: THREE.DataTexture | null = null;
let cachedAcryliteStageTex: THREE.DataTexture | null = null;
let cachedContactShadowDataTex: THREE.DataTexture | null = null;
let cachedSparkleGlintTex: THREE.DataTexture | null = null;
let cachedSpotlightBeamTex: THREE.DataTexture | null = null;
let cachedFallbackPlaqueTex: THREE.DataTexture | null = null;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generates a 512x512 sRGB curved soundstage cyclorama texture in authentic
 * 1966 NBC/CBS "In Living Color" Peacock Navy (`#0B1D30`), CBS Royal Cobalt
 * (`#1E56C5`), and Peacock Teal (`#0096A6`) with theater-curtain pleats and
 * warm overhead spotlight pool.
 */
function getLivingColorCycloramaTexture(): THREE.DataTexture {
  if (cachedShowcaseCycTex) return cachedShowcaseCycTex;

  const size = 512;
  const bytes = new Uint8Array(size * size * 4);

  for (let py = 0; py < size; py++) {
    const v = py / (size - 1);
    for (let px = 0; px < size; px++) {
      const u = px / (size - 1);
      const dx = (u - 0.5) * 2.0;
      const dy = (v - 0.48) * 2.0;
      const radial = Math.sqrt(dx * dx * 0.82 + dy * dy * 0.92);

      const centerGlow = Math.pow(clamp01(1.0 - radial * 0.76), 1.6);
      const tealHalo = Math.pow(clamp01(1.0 - Math.abs(radial - 0.34) * 2.3), 2.0) * 0.4;
      const warmSpot = Math.pow(clamp01(1.0 - radial * 1.28), 2.6) * 0.28;

      const pleatWave = 0.5 + 0.5 * Math.sin(u * Math.PI * 42.0);
      const pleatMod = 0.93 + 0.12 * pleatWave * (0.35 + 0.65 * centerGlow);

      let r = lerp(10, 32, centerGlow) + tealHalo * 8 + warmSpot * 110;
      let g = lerp(26, 92, centerGlow) + tealHalo * 144 + warmSpot * 82;
      let b = lerp(46, 206, centerGlow) + tealHalo * 158 + warmSpot * 32;

      const horizonLift = Math.pow(clamp01(1.0 - Math.abs(v - 0.22) * 3.0), 2.0) * 0.2;
      r = (r + horizonLift * 20) * pleatMod;
      g = (g + horizonLift * 58) * pleatMod;
      b = (b + horizonLift * 116) * pleatMod;

      const i4 = (py * size + px) * 4;
      bytes[i4] = Math.min(255, Math.max(0, Math.round(r)));
      bytes[i4 + 1] = Math.min(255, Math.max(0, Math.round(g)));
      bytes[i4 + 2] = Math.min(255, Math.max(0, Math.round(b)));
      bytes[i4 + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedShowcaseCycTex = tex;
  return tex;
}

/** Frosted backlit Living Color Acrylite radial stage diffuser texture (DOM-free). */
function getBacklitAcryliteStageTexture(): THREE.DataTexture {
  if (cachedAcryliteStageTex) return cachedAcryliteStageTex;

  const size = 256;
  const bytes = new Uint8Array(size * size * 4);
  for (let py = 0; py < size; py++) {
    const dy = (py / (size - 1) - 0.5) * 2.0;
    for (let px = 0; px < size; px++) {
      const dx = (px / (size - 1) - 0.5) * 2.0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const core = clamp01(1.0 - dist * 0.8);
      const ring = Math.pow(clamp01(1.0 - Math.abs(dist - 0.72) * 6.0), 2.0) * 0.24;
      const radialSunburst = (0.5 + 0.5 * Math.cos(angle * 16.0)) * 0.08 * clamp01(dist * 1.4);
      const lum = clamp01(0.56 + 0.42 * Math.pow(core, 1.3) + ring + radialSunburst);
      const vByte = Math.round(lum * 255);
      const i4 = (py * size + px) * 4;
      bytes[i4] = vByte;
      bytes[i4 + 1] = vByte;
      bytes[i4 + 2] = Math.min(255, vByte + 10);
      bytes[i4 + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedAcryliteStageTex = tex;
  return tex;
}

/** 100% DOM-free soft radial contact AO shadow texture (deep peacock-navy shadow). */
function getVaultContactShadowTexture(): THREE.DataTexture {
  if (cachedContactShadowDataTex) return cachedContactShadowDataTex;

  const size = 128;
  const bytes = new Uint8Array(size * size * 4);
  for (let py = 0; py < size; py++) {
    const dy = (py / (size - 1) - 0.5) * 2.0;
    for (let px = 0; px < size; px++) {
      const dx = (px / (size - 1) - 0.5) * 2.0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const falloff = clamp01(1.0 - dist);
      const alpha = Math.pow(falloff, 2.05) * 0.92;
      const i4 = (py * size + px) * 4;
      bytes[i4] = 5;
      bytes[i4 + 1] = 12;
      bytes[i4 + 2] = 26;
      bytes[i4 + 3] = Math.round(alpha * 255);
    }
  }

  const tex = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedContactShadowDataTex = tex;
  return tex;
}

/** 100% DOM-free 4-point + 45°-secondary RCA TK-41 jewelers' specular sparkle sprite. */
function getSpecularSparkleTexture(): THREE.DataTexture {
  if (cachedSparkleGlintTex) return cachedSparkleGlintTex;

  const size = 128;
  const bytes = new Uint8Array(size * size * 4);
  for (let py = 0; py < size; py++) {
    const dy = (py / (size - 1) - 0.5) * 2.0;
    for (let px = 0; px < size; px++) {
      const dx = (px / (size - 1) - 0.5) * 2.0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const edgeFade = Math.pow(clamp01(1.0 - dist), 1.45);
      const core = Math.exp(-dist * dist * 16.0);
      // Primary horizontal & vertical lens star flares
      const rayH = Math.exp(-Math.abs(dy) * 22.0) * Math.exp(-Math.abs(dx) * 2.8);
      const rayV = Math.exp(-Math.abs(dx) * 22.0) * Math.exp(-Math.abs(dy) * 2.8);
      // Secondary 45-degree diagonal glints
      const u45 = (dx + dy) * 0.7071;
      const v45 = (dx - dy) * 0.7071;
      const diagA = Math.exp(-Math.abs(u45) * 28.0) * Math.exp(-Math.abs(v45) * 5.2) * 0.42;
      const diagB = Math.exp(-Math.abs(v45) * 28.0) * Math.exp(-Math.abs(u45) * 5.2) * 0.42;

      const intensity = clamp01((core * 1.15 + (rayH + rayV) * 0.85 + diagA + diagB) * edgeFade);
      const i4 = (py * size + px) * 4;
      bytes[i4] = 255;
      bytes[i4 + 1] = Math.round(lerp(222, 255, core));
      bytes[i4 + 2] = Math.round(lerp(150, 244, core));
      bytes[i4 + 3] = Math.round(intensity * 255);
    }
  }

  const tex = new THREE.DataTexture(bytes, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedSparkleGlintTex = tex;
  return tex;
}

/** 100% DOM-free smooth vertical falloff gradient for the overhead studio spotlight cone. */
function getSpotlightBeamTexture(): THREE.DataTexture {
  if (cachedSpotlightBeamTex) return cachedSpotlightBeamTex;

  const w = 64;
  const h = 128;
  const bytes = new Uint8Array(w * h * 4);
  for (let py = 0; py < h; py++) {
    const v = py / (h - 1); // 0 bottom -> 1 top
    // Soft bell that fades cleanly to 0 at both top and bottom edges
    const vertFade = Math.sin(v * Math.PI) * (0.35 + 0.65 * v);
    for (let px = 0; px < w; px++) {
      const u = px / (w - 1);
      const shimmer = 0.85 + 0.15 * Math.sin(u * Math.PI * 10.0);
      const alpha = clamp01(vertFade * shimmer * 0.24);
      const i4 = (py * w + px) * 4;
      bytes[i4] = 255;
      bytes[i4 + 1] = 240;
      bytes[i4 + 2] = 204;
      bytes[i4 + 3] = Math.round(alpha * 255);
    }
  }

  const tex = new THREE.DataTexture(bytes, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedSpotlightBeamTex = tex;
  return tex;
}

/** Fallback brushed-brass DataTexture for Node/SSR environments where Canvas 2D is absent. */
function getFallbackBrassPlaqueTexture(): THREE.DataTexture {
  if (cachedFallbackPlaqueTex) return cachedFallbackPlaqueTex;
  const w = 64;
  const h = 32;
  const bytes = new Uint8Array(w * h * 4);
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const border = px < 3 || px >= w - 3 || py < 3 || py >= h - 3;
      const streak = 0.92 + 0.08 * Math.sin(py * 1.9 + px * 0.15);
      const i4 = (py * w + px) * 4;
      bytes[i4] = Math.round((border ? 196 : 244) * streak);
      bytes[i4 + 1] = Math.round((border ? 148 : 196) * streak);
      bytes[i4 + 2] = Math.round((border ? 58 : 88) * streak);
      bytes[i4 + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(bytes, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  (tex.userData as Record<string, unknown>)[SHARED_CAD_TEX_FLAG] = true;
  cachedFallbackPlaqueTex = tex;
  return tex;
}

/**
 * Generates an embossed, brushed-brass front presentation nameplate texture displaying
 * the trophy's tier ribbon, engraved motto (`spec.engraving`), and corner brass rivets.
 * Disposed per trophy (no `SHARED_CAD_TEX_FLAG`) when Canvas 2D is active.
 */
function createEngravedPlaqueTexture(
  spec: TrophySpecV7,
  meta: TrophyDisplayMetaV7,
  unlocked: boolean,
): THREE.Texture {
  if (typeof document === 'undefined') {
    return getFallbackBrassPlaqueTexture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (!ctx) return getFallbackBrassPlaqueTexture();

  // Tier-tailored brushed metal sheen gradient (high-contrast museum engraving!)
  const grad = ctx.createLinearGradient(0, 0, 512, 192);
  if (!unlocked) {
    grad.addColorStop(0.0, '#13243a');
    grad.addColorStop(0.5, '#1e3a5c');
    grad.addColorStop(1.0, '#0f1d30');
  } else if (meta.tierBadge === 'PLATINUM CROWN') {
    grad.addColorStop(0.0, '#aebfd4');
    grad.addColorStop(0.48, '#e3eef9');
    grad.addColorStop(1.0, '#8ea4bf');
  } else if (meta.tierBadge === 'GOLD TROPHY') {
    grad.addColorStop(0.0, '#9e6814');
    grad.addColorStop(0.48, '#e8b548');
    grad.addColorStop(1.0, '#87550d');
  } else if (meta.tierBadge === 'SILVER MEDAL') {
    grad.addColorStop(0.0, '#8ba0b8');
    grad.addColorStop(0.5, '#cedced');
    grad.addColorStop(1.0, '#7288a2');
  } else {
    grad.addColorStop(0.0, '#8f4d1a');
    grad.addColorStop(0.5, '#d18442');
    grad.addColorStop(1.0, '#753c12');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 192);

  // Subtle horizontal brushed-metal lathe lines
  ctx.strokeStyle = unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(130,200,240,0.08)';
  ctx.lineWidth = 1;
  for (let y = 4; y < 192; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Deep etched museum border
  const ink = unlocked ? '#120a02' : '#8fd2f8';
  ctx.strokeStyle = ink;
  ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, 492, 172);
  ctx.lineWidth = 2.5;
  ctx.strokeRect(21, 21, 470, 150);

  // 4 embossed corner rivets
  const rivets: readonly [number, number][] = [
    [33, 33],
    [479, 33],
    [33, 159],
    [479, 159],
  ];
  for (const [rx, ry] of rivets) {
    ctx.beginPath();
    ctx.arc(rx, ry, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = unlocked ? '#2b1804' : '#0b1829';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rx - 1.5, ry - 1.5, 4, 0, Math.PI * 2);
    ctx.fillStyle = unlocked ? '#ffe7a0' : '#63b8e8';
    ctx.fill();
  }

  // Tier Header Band
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = unlocked ? '#241202' : '#7ac7f0';
  ctx.font = '900 24px "Trebuchet MS", "Arial Black", sans-serif';
  const topLabel = unlocked
    ? `★ ${meta.tierBadge} · S0${spec.season} ★`
    : `LOCKED SILHOUETTE · S0${spec.season}`;
  ctx.fillText(topLabel, 256, 52, 420);

  // Ornamental divider
  ctx.strokeStyle = unlocked ? 'rgba(24,12,2,0.55)' : 'rgba(122,199,240,0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(64, 76);
  ctx.lineTo(448, 76);
  ctx.stroke();

  // Bold Deep-Etched Engraved Motto
  ctx.fillStyle = unlocked ? '#0e0701' : '#e6f4ff';
  ctx.font = '900 34px Georgia, "Times New Roman", serif';
  ctx.fillText(unlocked ? spec.engraving : 'UNLOCK TO REVEAL', 256, 118, 434);

  // Crisp form label footer
  ctx.fillStyle = unlocked ? 'rgba(20,10,2,0.82)' : 'rgba(155,212,245,0.85)';
  ctx.font = '800 18px "Trebuchet MS", sans-serif';
  ctx.fillText(meta.formLabel.toUpperCase(), 256, 154, 410);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a grounded contact shadow disc mesh (`depthWrite: false`, `polygonOffset`)
 * tagged `__excludeFromEnvelope = true` so camera framing never zooms out for floor shadows.
 */
function createVaultContactShadowMesh(
  radius: number,
  opacity: number,
  yPos: number,
  name: string,
): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geom.rotateX(-Math.PI * 0.5);
  const mat = new THREE.MeshBasicMaterial({
    map: getVaultContactShadowTexture(),
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = yPos;
  mesh.renderOrder = 1;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.name = name;
  (mesh.userData as Record<string, unknown>).__excludeFromEnvelope = true;
  return mesh;
}

/**
 * Precision arbitrary-radius sculpted Mid-Century diamond starburst (ZERO 0.35m clamp!).
 */
function createSculptedStarburstMini(opts: {
  radius: number;
  rays?: number;
  depth?: number;
  primaryMat: THREE.Material;
  accentMat: THREE.Material;
  orbMat?: THREE.Material;
  tipBeads?: boolean;
  name?: string;
}): THREE.Group {
  const r = Math.max(0.05, opts.radius);
  const rays = Math.max(6, Math.round(opts.rays ?? 10));
  const depth = Math.max(0.014, opts.depth ?? r * 0.18);
  const bevel = Math.min(depth * 0.32, Math.max(0.0025, r * 0.025));

  const makeRayGeom = (len: number, halfW: number): THREE.ExtrudeGeometry => {
    const s = new THREE.Shape();
    s.moveTo(0, r * 0.14);
    s.lineTo(halfW, len * 0.3);
    s.lineTo(0, len);
    s.lineTo(-halfW, len * 0.3);
    s.closePath();
    const coreD = Math.max(0.004, depth - bevel * 2);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: coreD,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
    });
    g.translate(0, 0, -coreD * 0.5);
    g.computeVertexNormals();
    return g;
  };

  const group = new THREE.Group();
  group.name = opts.name ?? 'SculptedStarburstMini';

  const longGeom = makeRayGeom(r, r * 0.115);
  const shortGeom = makeRayGeom(r * 0.72, r * 0.082);

  for (let i = 0; i < rays; i++) {
    const isMajor = i % 2 === 0;
    const angle = (i / rays) * Math.PI * 2;
    const ray = new THREE.Mesh(
      isMajor ? longGeom : shortGeom,
      isMajor ? opts.primaryMat : opts.accentMat,
    );
    ray.rotation.z = angle;
    ray.castShadow = true;
    group.add(ray);

    if (opts.tipBeads && isMajor) {
      const bead = createTurnedOrb({
        radius: Math.max(0.01, r * 0.075),
        radialSegments: 20,
        material: opts.orbMat ?? opts.accentMat,
      });
      bead.position.set(-Math.sin(angle) * (r * 1.03), Math.cos(angle) * (r * 1.03), 0);
      group.add(bead);
    }
  }

  const hub = createTurnedOrb({
    radius: Math.max(0.022, r * 0.24),
    heightScale: 0.72,
    radialSegments: 28,
    material: opts.orbMat ?? opts.accentMat,
  });
  hub.rotation.x = Math.PI * 0.5;
  group.add(hub);

  return group;
}

/**
 * Plush domed Royal Velvet Cushion Pillow (`LatheGeometry` w/ tucked corded base groove).
 */
function createVelvetCushionMesh(
  radius: number,
  height: number,
  material: THREE.Material,
  name = 'RoyalVelvetPresentationCushion',
): THREE.Mesh {
  const pts: THREE.Vector2[] = [];
  const steps = 20;
  pts.push(new THREE.Vector2(0, 0));
  pts.push(new THREE.Vector2(radius * 0.94, 0));
  // Lower tuck & plump velvet side bulge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const phi = t * Math.PI * 0.5;
    const bulge = Math.sin(t * Math.PI) * radius * 0.06;
    const rx = Math.cos(phi) * radius * 0.96 + bulge;
    const ry = height * 0.22 + Math.sin(phi) * height * 0.78;
    pts.push(new THREE.Vector2(Math.max(0, i === steps ? 0 : rx), ry));
  }
  const geom = new THREE.LatheGeometry(pts, 48);
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Evaluates a warm 3-circuit 1966 mechanical cam-chaser bulb intensity (`2700K`
 * `#11` tungsten filament thermal rise & incandescent afterglow).
 */
function sampleChasingMarqueeBulbIntensity(
  bulbIndex: number,
  totalBulbs: number,
  timeSec: number,
  speedHz = 2.1,
  locked = false,
): number {
  const phase = ((bulbIndex / Math.max(1, totalBulbs)) * 3.0 - timeSec * speedHz) % 1.0;
  const wrapped = phase < 0 ? phase + 1.0 : phase;
  const wave = 0.5 + 0.5 * Math.cos(wrapped * Math.PI * 2.0);
  if (locked) {
    return 0.28 + 0.72 * Math.pow(wave, 2.0);
  }
  return 0.48 + 1.88 * Math.pow(wave, 2.15);
}

// ----------------------------------------------------------------------------
// 2. Shared 256px 1966 "In Living Color" Studio Lightbox IBL (`PMREMGenerator`)
//    (Preserves canonical `bakeWarmTungstenIblV7` export signature!)
// ----------------------------------------------------------------------------

export function bakeWarmTungstenIblV7(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const studioScene = new THREE.Scene();
  studioScene.background = new THREE.Color(0x0b1d30);

  const addStudioSoftboxDisc = (
    radius: number,
    hex: number,
    intensity: number,
    pos: [number, number, number],
  ) => {
    const discShape = new THREE.Shape();
    discShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    const geom = new THREE.ShapeGeometry(discShape, 36);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(hex).multiplyScalar(intensity),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0.65, 0);
    studioScene.add(mesh);
  };

  // Overhead 3200K quartz-tungsten jewelers' grid bank (balanced — zero washout!)
  addStudioSoftboxDisc(6.8, 0xfff2dc, 2.75, [0, 9.6, 1.8]);
  // Crisp narrow specular ribbon for razor highlights across turned metals
  addStudioSoftboxDisc(2.4, 0xffffff, 3.6, [1.8, 8.2, 4.5]);
  // Key 24K Harvest Marquee Gold specular reflector (front-right)
  addStudioSoftboxDisc(4.8, 0xffcc55, 2.95, [6.6, 5.2, 6.2]);
  // Living Color Peacock Cyan cross-wash bank (front-left)
  addStudioSoftboxDisc(4.8, 0x00c8de, 2.25, [-6.8, 4.8, 5.4]);
  // CBS Royal Cobalt studio cyclorama rim reflector (back-left)
  addStudioSoftboxDisc(5.4, 0x1b4fb8, 2.15, [-5.6, 3.8, -6.5]);
  // Atomic Carnaby Tangerine / Gold kicker strip (back-right)
  addStudioSoftboxDisc(4.8, 0xf27636, 1.95, [5.6, 3.6, -6.2]);
  // Deep Peacock Midnight stage floor bounce (rich dark reflections, ZERO pastel pink!)
  addStudioSoftboxDisc(9.5, 0x0c2448, 1.15, [0, -4.5, 0]);

  const rt = pmrem.fromScene(studioScene, 0.028);
  disposeObject3DTree(studioScene);
  pmrem.dispose();
  return rt;
}

// ----------------------------------------------------------------------------
// 3. Canonical 36-Award Catalog (`TROPHY_CATALOG_V7` — `trophy_s1_01`..`trophy_s4_36`)
//    Every single trophy's title, rule, and grindHint matches live game unlocks!
// ----------------------------------------------------------------------------

export const TROPHY_CATALOG_V7: readonly TrophySpecV7[] = [
  // ======================== SEASON 1 (01 .. 09) ========================
  {
    trophyId: 'trophy_s1_01',
    season: 1,
    name: 'Studio 6A Debut Ribbon Mic',
    subtitle: 'Season 1 Opening Broadcast Medal',
    engraving: 'FIRST LIVE CUE — IBC 6A',
    unlockRuleText: 'Win your opening broadcast episode in Studio 6A.',
    materialTier: 'GOLD_24K',
    sculptKind: 'RIBBON_MIC',
  },
  {
    trophyId: 'trophy_s1_02',
    season: 1,
    name: 'Crossfader Gold LP Platter',
    subtitle: 'Daytime Funk Showband Medal',
    engraving: '112 BPM — ZERO DEAD AIR',
    unlockRuleText: 'Claim victory on the Studio 6A Daytime Funk Crossfader stage.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'TURNTABLE_PLATTER',
  },
  {
    trophyId: 'trophy_s1_03',
    season: 1,
    name: 'Coast-to-Coast Hex Starburst',
    subtitle: 'Primetime Jubilee Silver Medal',
    engraving: 'HEX BRIDGE CONNECTED',
    unlockRuleText: 'Defeat the Champion on the Primetime Jubilee Hex-Bridge stage.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'HEX_STARBURST',
  },
  {
    trophyId: 'trophy_s1_04',
    season: 1,
    name: 'Golden Big Prize Wheel',
    subtitle: '1966 Burbank Pop-Art Carnival Medal',
    engraving: 'PRIZE FLAPPER LOCKED',
    unlockRuleText: 'Defeat your Rival on the 1966 Burbank Pop-Art Prize Wheel stage.',
    materialTier: 'GOLD_24K',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s1_05',
    season: 1,
    name: 'Amber Chalk Truce Medallion',
    subtitle: 'Contestant Solidarity Honor',
    engraving: 'TRUCE HONORED ON AIR',
    unlockRuleText: 'Respect your Rival’s Amber Chalk Truce tile and still win the episode.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'ISOLATION_RELAY',
  },
  {
    trophyId: 'trophy_s1_06',
    season: 1,
    name: 'Klaxon Myth-Breaker Bell',
    subtitle: 'Sharp-Eyed Fact-Checker Medal',
    engraving: 'FAKE FACT EXPOSED',
    unlockRuleText: 'Spot the true bogus myth on a Klaxon Trap clue without taking the bait.',
    materialTier: 'GOLD_24K',
    sculptKind: 'WURLITZER_LYRE',
  },
  {
    trophyId: 'trophy_s1_07',
    season: 1,
    name: 'Vernier Dial Dead-Center',
    subtitle: 'Precision Estimation Medal',
    engraving: 'ZERO TOLERANCE LOCK',
    unlockRuleText: 'Lock a Vernier Estimation Dial showcase right on dead-center (99%+).',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'LARSON_OSCILLOSCOPE',
  },
  {
    trophyId: 'trophy_s1_08',
    season: 1,
    name: 'Row-C Aisle Opera Glasses',
    subtitle: 'Live Studio Vigilance Medal',
    engraving: 'CAUGHT THE AISLE TELL',
    unlockRuleText: 'Spot a live Control-Booth tell and bust a rigging attempt on air.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ROULETTE_ASTROLABE',
  },
  {
    trophyId: 'trophy_s1_09',
    season: 1,
    name: 'Season One Purse Chalice',
    subtitle: 'Quarter-Purse Championship Cup',
    engraving: 'THREE PURSE SEALS CLEAR',
    unlockRuleText: 'Clear Season 1 (Ep 22) and retire your first three Network Purse seals.',
    materialTier: 'GOLD_24K',
    sculptKind: 'ESCAPEMENT_CROWN',
  },

  // ======================== SEASON 2 (10 .. 18) ========================
  {
    trophyId: 'trophy_s2_10',
    season: 2,
    name: 'Glass Isolation Booth Dome',
    subtitle: '1964 Soundproof Stage Medal',
    engraving: '64K BOOTH — SOUNDPROOF',
    unlockRuleText: 'Prevail inside the sealed 1964 Glass Isolation Booth broadcast.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ISOLATION_RELAY',
  },
  {
    trophyId: 'trophy_s2_11',
    season: 2,
    name: 'Apollo Color Vectorscope',
    subtitle: '1967 Master Control Medal',
    engraving: 'LIVING COLOR LOCKED',
    unlockRuleText: 'Triumph inside the 1967 Apollo Color Master Control Pavilion.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'LARSON_OSCILLOSCOPE',
  },
  {
    trophyId: 'trophy_s2_12',
    season: 2,
    name: 'Steel Pier Wurlitzer Lyre',
    subtitle: 'Atlantic City Roadshow Medal',
    engraving: 'BOARDWALK FANFARE CUP',
    unlockRuleText: 'Win the Atlantic City Steel Pier boardwalk roadshow broadcast.',
    materialTier: 'GOLD_24K',
    sculptKind: 'WURLITZER_LYRE',
  },
  {
    trophyId: 'trophy_s2_13',
    season: 2,
    name: 'Canary Envelope Brazier',
    subtitle: 'Uncorrupted Contestant Medal',
    engraving: 'SHADY TIP INCINERATED',
    unlockRuleText: 'Refuse and burn a poisoned backstage Canary envelope before stepping onstage.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'SUBPOENA_PENDULUM',
  },
  {
    trophyId: 'trophy_s2_14',
    season: 2,
    name: 'Cartographer’s Relief Globe',
    subtitle: '3D World-Atlas Precision Trophy',
    engraving: 'PINPOINT MERIDIAN HIT',
    unlockRuleText: 'Pin a 3D Relief Globe showcase target within dead-center (99%+) precision.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'GEODESIC_ARMILLARY',
  },
  {
    trophyId: 'trophy_s2_15',
    season: 2,
    name: 'Toby’s Brass Knife-Switch',
    subtitle: 'Brotherhood of the Booth Medal',
    engraving: 'BOOTH TRAP DISARMED',
    unlockRuleText: 'Pull Toby’s Mercy Switch to disarm a trap, or reach +3 Rival Trust.',
    materialTier: 'GOLD_24K',
    sculptKind: 'RIBBON_MIC',
  },
  {
    trophyId: 'trophy_s2_16',
    season: 2,
    name: 'Cyanotype Inspector’s Loupe',
    subtitle: 'Prussian-Blue Blueprint Medal',
    engraving: 'CUTAWAY ZONE PINNED',
    unlockRuleText: 'Identify the exact engineering cutaway on a Cyanotype Loupe showcase.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'LARSON_OSCILLOSCOPE',
  },
  {
    trophyId: 'trophy_s2_17',
    season: 2,
    name: 'First-Shutter Iris Camera',
    subtitle: '2X Instant-Call Gold Trophy',
    engraving: 'SOLVED ON SHUTTER ONE',
    unlockRuleText: 'Solve a Four-Shutter Photo Reel on the very first clue (2X bonus).',
    materialTier: 'GOLD_24K',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s2_18',
    season: 2,
    name: 'Season Two Split-Flap Diadem',
    subtitle: 'Midpoint Champion Trophy',
    engraving: 'SIX PURSE SEALS CLEAR',
    unlockRuleText: 'Complete Season 2 (Ep 45) or retire six Network Buyout Purse seals.',
    materialTier: 'GOLD_24K',
    sculptKind: 'HEX_STARBURST',
  },

  // ======================== SEASON 3 (19 .. 27) ========================
  {
    trophyId: 'trophy_s3_19',
    season: 3,
    name: 'Monte Carlo Riviera Roulette',
    subtitle: '1969 Salle Privée Gold Trophy',
    engraving: 'RIVIERA HIGH-ROLLER',
    unlockRuleText: 'Defeat the Monte Carlo Casino Champion by a margin of $400 or more.',
    materialTier: 'GOLD_24K',
    sculptKind: 'ROULETTE_ASTROLABE',
  },
  {
    trophyId: 'trophy_s3_20',
    season: 3,
    name: 'World’s Fair Unisphere Spire',
    subtitle: 'Flushing Meadows Rotunda Trophy',
    engraving: 'SOLAR MERIDIAN CROWN',
    unlockRuleText: 'Prevail inside the 1965 World’s Fair Geodesic Rotunda broadcast.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'GEODESIC_ARMILLARY',
  },
  {
    trophyId: 'trophy_s3_21',
    season: 3,
    name: 'Channel 83 Pirate Klystron',
    subtitle: 'Offshore 50kW UHF Trophy',
    engraving: '50KW FREE-AIR SIGNAL',
    unlockRuleText: 'Win aboard the storm-tossed Channel 83 Offshore Pirate UHF Barge.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'PIRATE_KLYSTRON',
  },
  {
    trophyId: 'trophy_s3_22',
    season: 3,
    name: 'VIP Balcony Laurel Wreath',
    subtitle: 'Allied Champions’ Acclamation',
    engraving: 'BALCONY STANDING OVATION',
    unlockRuleText: 'Reach Season 4 with at least +1 Rival Trust cheering from the VIP Balcony.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'TURNTABLE_PLATTER',
  },
  {
    trophyId: 'trophy_s3_23',
    season: 3,
    name: 'Compliance Fresnel Spotlight',
    subtitle: 'Standards & Practices Trophy',
    engraving: 'RIGGING CAUGHT & BEATEN',
    unlockRuleText: 'Bust a live Control-Booth tell AND go on to win that same episode.',
    materialTier: 'GOLD_24K',
    sculptKind: 'ISOLATION_RELAY',
  },
  {
    trophyId: 'trophy_s3_24',
    season: 3,
    name: 'Conspiracy Red-String Pinwheel',
    subtitle: 'Lateral Detective Silver Medal',
    engraving: 'THREE CLUES LINKED',
    unlockRuleText: 'Lasso the exact matching triad on a Conspiracy Lasso showcase board.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ROULETTE_ASTROLABE',
  },
  {
    trophyId: 'trophy_s3_25',
    season: 3,
    name: 'Lightning Blitz Bolt Trophy',
    subtitle: 'Sudden-Death Speed Medal',
    engraving: 'CLUTCH UNDER THE CLOCK',
    unlockRuleText: 'Nail two or more rapid-fire answers during a Lightning Blitz finale.',
    materialTier: 'GOLD_24K',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s3_26',
    season: 3,
    name: 'Golden Exit Studio 6A Key',
    subtitle: 'Honorable Rival Farewell Trophy',
    engraving: 'WALKED OFF WITH HONOR',
    unlockRuleText: 'Win a sympathetic Rival’s Golden Exit milestone broadcast (Ep 28, 34, or 40).',
    materialTier: 'GOLD_24K',
    sculptKind: 'WURLITZER_LYRE',
  },
  {
    trophyId: 'trophy_s3_27',
    season: 3,
    name: 'Hour-Eleven Coup Clock Arch',
    subtitle: 'Season Three Finale Trophy',
    engraving: 'THE BOOTH CHANGES HANDS',
    unlockRuleText: 'Survive the Episode 45 Hour-11 Control-Booth Coup into Season 4.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'SUBPOENA_PENDULUM',
  },

  // ======================== SEASON 4 (28 .. 36) ========================
  {
    trophyId: 'trophy_s4_28',
    season: 4,
    name: 'Pharma Canopy Caduceus Prism',
    subtitle: 'Regime A Resistance Trophy',
    engraving: 'RX CANOPY OVERCOME',
    unlockRuleText: 'Win a Season 4 broadcast under Roz Korman’s Pharma Canopy regime.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'HEX_STARBURST',
  },
  {
    trophyId: 'trophy_s4_29',
    season: 4,
    name: 'Pirate UHF Broadcast Spire',
    subtitle: 'Regime B Signal Sovereign Trophy',
    engraving: 'UHF CARRIER SEIZED',
    unlockRuleText: 'Win under Grant Bellamy’s Pirate UHF regime or Ending V takeover.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'PIRATE_KLYSTRON',
  },
  {
    trophyId: 'trophy_s4_30',
    season: 4,
    name: 'Vera’s Forensic Balance Scales',
    subtitle: 'Regime C Audit Commendation',
    engraving: '4000K — NOTHING HIDDEN',
    unlockRuleText: 'Win a stark Forensic Audit episode under Vera Karp’s worklights.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ESCAPEMENT_CROWN',
  },
  {
    trophyId: 'trophy_s4_31',
    season: 4,
    name: 'Five-Slot Steamer Prop Trunk',
    subtitle: 'Synergy Collector Silver Medal',
    engraving: 'FULL FIVE-RELIC TRUNK',
    unlockRuleText: 'Equip all 5 Backstage Prop Trunk slots simultaneously with studio relics.',
    materialTier: 'GOLD_24K',
    sculptKind: 'TURNTABLE_PLATTER',
  },
  {
    trophyId: 'trophy_s4_32',
    season: 4,
    name: 'Clean $250K Safe-Cracker Vault',
    subtitle: 'Unblemished Network Buyout Crown',
    engraving: '$250,000 — ZERO SHADY CASH',
    unlockRuleText: 'Retire all 12 Network Buyout seals with $0 Backstage Contraband cash.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'RIBBON_MIC',
  },
  {
    trophyId: 'trophy_s4_33',
    season: 4,
    name: 'Shadow Syndicate Diamond Signet',
    subtitle: 'Back-Room High-Roller Crown',
    engraving: 'UNTOUCHABLE SYNDICATE',
    unlockRuleText: 'Stack $5,000+ in Backstage Contraband cash with zero Booth Arrests.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s4_34',
    season: 4,
    name: 'Grand Jury Subpoena Press',
    subtitle: 'Whistleblower Finale Crown',
    engraving: 'EXHIBIT A — LIVE ON AIR',
    unlockRuleText: 'Deliver Vera Karp’s Whistleblower Finale Ending on Episode 90.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'SUBPOENA_PENDULUM',
  },
  {
    trophyId: 'trophy_s4_35',
    season: 4,
    name: 'Returning-Champion Sovereign Crown',
    subtitle: '38th-Floor Penthouse Champion',
    engraving: 'FIFTY MILLION WATCHING',
    unlockRuleText: 'Defeat the final Champion inside the 38th-Floor Executive Penthouse.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'ESCAPEMENT_CROWN',
  },
  {
    trophyId: 'trophy_s4_36',
    season: 4,
    name: 'World’s Smartest Grand Masterpiece',
    subtitle: '90-Episode $250,000 Grand Slam',
    engraving: 'LIVE IN LIVING COLOR',
    unlockRuleText: 'Win Episode 90 and complete the entire 90-Episode Grand Broadcast.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'GEODESIC_ARMILLARY',
  },
] as const;

export const TROPHY_BY_ID_V7: ReadonlyMap<string, TrophySpecV7> = new Map(
  TROPHY_CATALOG_V7.map((t) => [t.trophyId, t]),
);

export function getTrophySpecV7(trophyId: string): TrophySpecV7 | undefined {
  return TROPHY_BY_ID_V7.get(trophyId);
}

// ----------------------------------------------------------------------------
// 3B. Rich Progression Metadata (`getTrophyDisplayMetaV7`, `getTrophyCatalogSummaryV7`)
// ----------------------------------------------------------------------------

const TIER_POINTS_MAP: Readonly<Record<TrophyTierBadgeV7, number>> = {
  'BRONZE MEDAL': 25,
  'SILVER MEDAL': 50,
  'GOLD TROPHY': 100,
  'PLATINUM CROWN': 250,
};

function makeDisplayMeta(
  trophyId: string,
  tierBadge: TrophyTierBadgeV7,
  categoryGroup: TrophyCategoryGroupV7,
  accentHex: string,
  formLabel: string,
  milestoneTag: TrophyMilestoneTagV7,
  grindHint: string,
): TrophyDisplayMetaV7 {
  return {
    trophyId,
    tierBadge,
    categoryGroup,
    grindHint,
    accentHex,
    formLabel,
    rarityPoints: TIER_POINTS_MAP[tierBadge],
    milestoneTag,
  };
}

const TROPHY_DISPLAY_META_LIST_V7: readonly TrophyDisplayMetaV7[] = [
  // SEASON 1
  makeDisplayMeta(
    'trophy_s1_01',
    'BRONZE MEDAL',
    'SHOWMANSHIP',
    '#E09145',
    'RCA 44-BX Ribbon Mic',
    'QUICK-WIN',
    'Quick Win: Beat Carmen Delgado in Episode 1 at Studio 6A.',
  ),
  makeDisplayMeta(
    'trophy_s1_02',
    'BRONZE MEDAL',
    'SHOWMANSHIP',
    '#00A8B5',
    'Gold Transcription LP Deck',
    'QUICK-WIN',
    'Quick Win: Outbank any Champion on the Studio 6A Daytime Funk board.',
  ),
  makeDisplayMeta(
    'trophy_s1_03',
    'SILVER MEDAL',
    'BOARD MASTERY',
    '#00B8C9',
    '12-Ray Atomic Hex Starburst',
    'STAGE',
    'Conquer the Primetime Jubilee Coast-to-Coast Hex Bridge stage.',
  ),
  makeDisplayMeta(
    'trophy_s1_04',
    'SILVER MEDAL',
    'BOARD MASTERY',
    '#F4A91F',
    'Miniature Golden Big Wheel',
    'STAGE',
    'Beat the Rival on the 1966 Burbank Pop-Art Prize Wheel stage.',
  ),
  makeDisplayMeta(
    'trophy_s1_05',
    'BRONZE MEDAL',
    'SCOUTING & WIT',
    '#F2B632',
    'Ribbon-Hung Handshake Medallion',
    'SKILL',
    'Leave a glowing Amber Truce tile untouched all game and still win.',
  ),
  makeDisplayMeta(
    'trophy_s1_06',
    'BRONZE MEDAL',
    'SCOUTING & WIT',
    '#FF6738',
    'Brass Studio Bell & Twin Horns',
    'QUICK-WIN',
    'Quick Win: Spot the real myth on any "Spot the Myth" Klaxon clue!',
  ),
  makeDisplayMeta(
    'trophy_s1_07',
    'BRONZE MEDAL',
    'SCOUTING & WIT',
    '#38BDF8',
    'Precision Vernier Tuning Dial',
    'SKILL',
    'Dial in a dead-center (99%+) answer on an Estimation Dial showcase.',
  ),
  makeDisplayMeta(
    'trophy_s1_08',
    'SILVER MEDAL',
    'SCOUTING & WIT',
    '#E63B7A',
    'Brass Studio Opera Binoculars',
    'SCOUTING',
    'Spot a live Row-C or lighting tell and press BUST BOOTH during air!',
  ),
  makeDisplayMeta(
    'trophy_s1_09',
    'GOLD TROPHY',
    'CHAMPIONSHIP DYNASTY',
    '#FFD166',
    'Two-Handled 24K Loving Cup',
    'DYNASTY',
    'Clear Season 1 (Ep 22) and unlock 3 Network Buyout Purse seals.',
  ),

  // SEASON 2
  makeDisplayMeta(
    'trophy_s2_10',
    'SILVER MEDAL',
    'BOARD MASTERY',
    '#60A5FA',
    'Crystal Glass Isolation Booth',
    'STAGE',
    'Defeat your Rival inside the sealed 1964 Glass Isolation Booth.',
  ),
  makeDisplayMeta(
    'trophy_s2_11',
    'SILVER MEDAL',
    'BOARD MASTERY',
    '#22D3EE',
    '1967 RCA Color Vectorscope CRT',
    'STAGE',
    'Win a broadcast in the 1967 Apollo Color Master Control Pavilion.',
  ),
  makeDisplayMeta(
    'trophy_s2_12',
    'SILVER MEDAL',
    'SHOWMANSHIP',
    '#F59E0B',
    '7-Pipe Wurlitzer Organ Lyre',
    'STAGE',
    'Claim the boardwalk crown on the Atlantic City Steel Pier stage.',
  ),
  makeDisplayMeta(
    'trophy_s2_13',
    'BRONZE MEDAL',
    'SCOUTING & WIT',
    '#FB923C',
    'Ceremonial Flame Brazier Urn',
    'SCOUTING',
    'When a shady backstage Canary envelope appears, choose BURN.',
  ),
  makeDisplayMeta(
    'trophy_s2_14',
    'GOLD TROPHY',
    'SCOUTING & WIT',
    '#00B4D8',
    'Tilted 23.5° Relief Desk Globe',
    'SKILL',
    'Drop the brass pin dead-on (99%+) on a 3D World Relief Globe clue.',
  ),
  makeDisplayMeta(
    'trophy_s2_15',
    'SILVER MEDAL',
    'SCOUTING & WIT',
    '#FACC15',
    'Con-Ed Dual-Blade Knife Switch',
    'SCOUTING',
    'Pull Toby’s Mercy Switch to disarm a rigging trap or earn +3 Trust.',
  ),
  makeDisplayMeta(
    'trophy_s2_16',
    'BRONZE MEDAL',
    'SCOUTING & WIT',
    '#3B82F6',
    'Brass Jeweler’s Loupe & Scroll',
    'SKILL',
    'Solve any Prussian-blue Cyanotype Cutaway blueprint showcase clue.',
  ),
  makeDisplayMeta(
    'trophy_s2_17',
    'GOLD TROPHY',
    'SHOWMANSHIP',
    '#F4A91F',
    '35mm Broadcast Iris & Film Reel',
    'SKILL',
    'Call a Four-Shutter Photo Reel right on Shutter One for a 2X hit!',
  ),
  makeDisplayMeta(
    'trophy_s2_18',
    'GOLD TROPHY',
    'CHAMPIONSHIP DYNASTY',
    '#34D399',
    'Solari Split-Flap Sunrise Diadem',
    'DYNASTY',
    'Reach Episode 46 or retire 6 Network Purse seals in Campaign.',
  ),

  // SEASON 3
  makeDisplayMeta(
    'trophy_s3_19',
    'GOLD TROPHY',
    'BOARD MASTERY',
    '#E63B7A',
    'Riviera Spinning Roulette Bowl',
    'STAGE',
    'Outscore the Monte Carlo Casino Champion by at least $400.',
  ),
  makeDisplayMeta(
    'trophy_s3_20',
    'GOLD TROPHY',
    'BOARD MASTERY',
    '#2DD4BF',
    'Flushing Meadows Unisphere Spire',
    'STAGE',
    'Win a Season 3 broadcast under the 1965 World’s Fair Rotunda.',
  ),
  makeDisplayMeta(
    'trophy_s3_21',
    'GOLD TROPHY',
    'BOARD MASTERY',
    '#A78BFA',
    '50kW Helical Vacuum Klystron',
    'STAGE',
    'Prevail aboard the offshore Channel 83 Pirate UHF Broadcast Barge.',
  ),
  makeDisplayMeta(
    'trophy_s3_22',
    'SILVER MEDAL',
    'SHOWMANSHIP',
    '#10B981',
    '24K Broadcast Laurel Wreath',
    'SCOUTING',
    'Keep +1 or higher Trust with Carmen, Toby, Inez, or Dotty into S4.',
  ),
  makeDisplayMeta(
    'trophy_s3_23',
    'GOLD TROPHY',
    'SCOUTING & WIT',
    '#FBBF24',
    'Mole-Richardson Barn-Door Fresnel',
    'SCOUTING',
    'Expose a live rigging tell mid-episode AND lock in the victory.',
  ),
  makeDisplayMeta(
    'trophy_s3_24',
    'SILVER MEDAL',
    'SCOUTING & WIT',
    '#F43F5E',
    '3-Pin Red-Yarn Evidence Board',
    'SKILL',
    'Loop the true matching triad of 3 clues on a Conspiracy Lasso showcase.',
  ),
  makeDisplayMeta(
    'trophy_s3_25',
    'BRONZE MEDAL',
    'SHOWMANSHIP',
    '#38BDF8',
    'Atomic Lightning Bolt & Stopwatch',
    'QUICK-WIN',
    'Quick Win: Chain 2+ right answers during any Lightning Blitz!',
  ),
  makeDisplayMeta(
    'trophy_s3_26',
    'GOLD TROPHY',
    'SHOWMANSHIP',
    '#F59E0B',
    'Ornate Ceremonial Key to 6A',
    'DYNASTY',
    'Win Carmen (Ep 28), Toby (Ep 34), or Inez’s (Ep 40) Golden Exit!',
  ),
  makeDisplayMeta(
    'trophy_s3_27',
    'GOLD TROPHY',
    'CHAMPIONSHIP DYNASTY',
    '#C084FC',
    'Hour-11 Clock Arch & Pendulum',
    'DYNASTY',
    'Play through Episode 45 to witness and survive the Booth Coup.',
  ),

  // SEASON 4
  makeDisplayMeta(
    'trophy_s4_28',
    'GOLD TROPHY',
    'BOARD MASTERY',
    '#06B6D4',
    'Twin-Helix Crystal Caduceus',
    'STAGE',
    'Defeat a Season 4 rival while Roz Korman runs the Pharma Canopy.',
  ),
  makeDisplayMeta(
    'trophy_s4_29',
    'GOLD TROPHY',
    'BOARD MASTERY',
    '#8B5CF6',
    'Empire Broadcast Needle Tower',
    'STAGE',
    'Win a broadcast under Grant Bellamy’s Pirate UHF Coup regime.',
  ),
  makeDisplayMeta(
    'trophy_s4_30',
    'GOLD TROPHY',
    'BOARD MASTERY',
    '#E2E8F0',
    'Forensic Scales of Justice',
    'STAGE',
    'Triumph under Vera Karp’s stark 4000K Forensic Audit regime.',
  ),
  makeDisplayMeta(
    'trophy_s4_31',
    'SILVER MEDAL',
    'SHOWMANSHIP',
    '#F59E0B',
    'Open 5-Gem Steamer Prop Trunk',
    'SKILL',
    'Buy studio props backstage and fill all 5 Prop Trunk slots at once.',
  ),
  makeDisplayMeta(
    'trophy_s4_32',
    'PLATINUM CROWN',
    'CHAMPIONSHIP DYNASTY',
    '#38BDF8',
    'Open Circular Bank Vault Door',
    'DYNASTY',
    'Play 100% clean ($0 shady cash) and retire all 12 Purse seals!',
  ),
  makeDisplayMeta(
    'trophy_s4_33',
    'PLATINUM CROWN',
    'CHAMPIONSHIP DYNASTY',
    '#F43F5E',
    'Emerald-Cut Diamond Signet & Chips',
    'DYNASTY',
    'Bank $5,000+ in Backstage Shadow cash with zero Booth Arrests.',
  ),
  makeDisplayMeta(
    'trophy_s4_34',
    'PLATINUM CROWN',
    'CHAMPIONSHIP DYNASTY',
    '#60A5FA',
    'Cast-Brass Notary Seal Press',
    'DYNASTY',
    'Complete Episode 90 on Vera Karp’s Whistleblower Finale path.',
  ),
  makeDisplayMeta(
    'trophy_s4_35',
    'PLATINUM CROWN',
    'CHAMPIONSHIP DYNASTY',
    '#FFD166',
    'Imperial 8-Spire Sovereign Crown',
    'DYNASTY',
    'Beat the Final Champion in the 38th-Floor Executive Penthouse.',
  ),
  makeDisplayMeta(
    'trophy_s4_36',
    'PLATINUM CROWN',
    'CHAMPIONSHIP DYNASTY',
    '#FDE047',
    '$250K Celestial Peacock Armillary',
    'DYNASTY',
    'Conquer Episode 90 to claim the Grand 90-Episode Masterpiece!',
  ),
] as const;

export const TROPHY_DISPLAY_META_BY_ID_V7: ReadonlyMap<string, TrophyDisplayMetaV7> = new Map(
  TROPHY_DISPLAY_META_LIST_V7.map((m) => [m.trophyId, m]),
);

/**
 * Returns grind-worthy display metadata (`tierBadge`, `categoryGroup`, `grindHint`,
 * `accentHex`, `formLabel`, `rarityPoints`, `milestoneTag`) for any canonical trophy ID.
 */
export function getTrophyDisplayMetaV7(trophyId: string): TrophyDisplayMetaV7 {
  return TROPHY_DISPLAY_META_BY_ID_V7.get(trophyId) ?? TROPHY_DISPLAY_META_LIST_V7[0];
}

/** Computes live Trophy Vault completion counters, points, rank title & breakdowns. */
export function getTrophyCatalogSummaryV7(
  unlockedIds: Iterable<string>,
): TrophyCatalogSummaryV7 {
  const unlockedSet = new Set(unlockedIds);
  const byTier: Record<TrophyTierBadgeV7, { unlocked: number; total: number }> = {
    'BRONZE MEDAL': { unlocked: 0, total: 0 },
    'SILVER MEDAL': { unlocked: 0, total: 0 },
    'GOLD TROPHY': { unlocked: 0, total: 0 },
    'PLATINUM CROWN': { unlocked: 0, total: 0 },
  };
  const byGroup: Record<TrophyCategoryGroupV7, { unlocked: number; total: number }> = {
    SHOWMANSHIP: { unlocked: 0, total: 0 },
    'BOARD MASTERY': { unlocked: 0, total: 0 },
    'SCOUTING & WIT': { unlocked: 0, total: 0 },
    'CHAMPIONSHIP DYNASTY': { unlocked: 0, total: 0 },
  };

  let unlockedCount = 0;
  let earnedPoints = 0;
  let totalPoints = 0;

  for (const spec of TROPHY_CATALOG_V7) {
    const meta = getTrophyDisplayMetaV7(spec.trophyId);
    const isOpen = unlockedSet.has(spec.trophyId);
    byTier[meta.tierBadge].total += 1;
    byGroup[meta.categoryGroup].total += 1;
    totalPoints += meta.rarityPoints;
    if (isOpen) {
      unlockedCount += 1;
      earnedPoints += meta.rarityPoints;
      byTier[meta.tierBadge].unlocked += 1;
      byGroup[meta.categoryGroup].unlocked += 1;
    }
  }

  const totalCount = TROPHY_CATALOG_V7.length;
  const completionPct = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);
  const rankTitle =
    unlockedCount >= 34
      ? 'LIVING COLOR IMMORTAL'
      : unlockedCount >= 24
        ? 'NETWORK SOVEREIGN'
        : unlockedCount >= 14
          ? 'SWEEPS WEEK HEADLINER'
          : unlockedCount >= 6
            ? 'RETURNING CHAMPION'
            : unlockedCount >= 1
              ? 'STUDIO 6A CONTENDER'
              : 'FRESH STAND-IN';

  return {
    unlockedCount,
    totalCount,
    completionPct,
    earnedPoints,
    totalPoints,
    rankTitle,
    byTier,
    byGroup,
  };
}

// ----------------------------------------------------------------------------
// 4. Museum Material Palette & 36 Bespoke Sculptures (`buildTrophySculptureV7`)
// ----------------------------------------------------------------------------

export interface BuiltTrophySculptureV7 {
  readonly spec: TrophySpecV7;
  readonly root: THREE.Group;
  readonly turntableGroup: THREE.Group;
  update(dtSec: number): void;
  dispose(): void;
}

interface TrophyPaletteV7 {
  readonly primary: THREE.Material;
  readonly secondary: THREE.Material;
  readonly jewel: THREE.Material;
  readonly dichroic: THREE.Material;
  readonly crimson: THREE.Material;
  readonly gold: THREE.Material;
  readonly chrome: THREE.Material;
  readonly walnut: THREE.Material;
  readonly velvet: THREE.Material;
  readonly glass: THREE.Material;
  readonly glow: THREE.Material;
  readonly emerald: THREE.Material;
  readonly obsidian: THREE.Material;
  readonly studioBlack: THREE.Material;
  readonly copper: THREE.Material;
  readonly manila: THREE.Material;
  readonly sapphireDeep: THREE.Material;
}

function getSeasonLivingColorHex(season: TrophySpecV7['season']): number {
  switch (season) {
    case 1:
      return 0x00a4b4; // Living Color Peacock Teal
    case 2:
      return 0x16b35a; // Emerald Tote Lamp
    case 3:
      return 0xf4a91f; // Harvest Marquee Gold
    case 4:
      return 0xff6738; // Atomic Carnaby Tangerine
  }
}

function getTierVelvetHex(tier: TrophyTierBadgeV7): { base: number; sheen: number } {
  switch (tier) {
    case 'BRONZE MEDAL':
      return { base: 0x4d0b1e, sheen: 0xa82848 }; // Deep Studio Burgundy Velvet
    case 'SILVER MEDAL':
      return { base: 0x0b1d47, sheen: 0x3b76d6 }; // Deep CBS Midnight Cobalt Velvet
    case 'GOLD TROPHY':
      return { base: 0x063532, sheen: 0x1aa89c }; // Deep Peacock Emerald Velvet
    case 'PLATINUM CROWN':
      return { base: 0x2a0944, sheen: 0x8f46cc }; // Deep Imperial Broadcast Plum Velvet
  }
}

function createTrophyPalette(
  spec: TrophySpecV7,
  meta: TrophyDisplayMetaV7,
  unlocked: boolean,
  envMap: THREE.Texture | null,
): TrophyPaletteV7 {
  const seasonHex = getSeasonLivingColorHex(spec.season);
  const accentHexNum = Number.parseInt(meta.accentHex.replace('#', ''), 16) || seasonHex;

  if (!unlocked) {
    // Dramatic *Smash Bros. Melee* / *Astro Bot* Silhouetted Mystery Casting:
    // Satin midnight-cobalt gunmetal with a crisp peacock rim sheen so every unique
    // silhouette reads unmistakably while screaming "LOCKED — UNLOCK ME TO SEE MY GOLD!"
    const lockedPrimary = new THREE.MeshPhysicalMaterial({
      color: 0x1a3150,
      metalness: 0.76,
      roughness: 0.3,
      clearcoat: 0.45,
      clearcoatRoughness: 0.22,
      iridescence: 0.5,
      iridescenceIOR: 1.38,
      envMap,
      envMapIntensity: 1.45,
    });
    const lockedSecondary = new THREE.MeshPhysicalMaterial({
      color: 0x2b4a70,
      metalness: 0.82,
      roughness: 0.25,
      clearcoat: 0.48,
      clearcoatRoughness: 0.18,
      envMap,
      envMapIntensity: 1.55,
    });
    const lockedJewel = new THREE.MeshPhysicalMaterial({
      color: 0x13385c,
      metalness: 0.45,
      roughness: 0.22,
      clearcoat: 0.72,
      emissive: 0x104168,
      emissiveIntensity: 0.32,
      envMap,
      envMapIntensity: 1.35,
    });
    const lockedDark = new THREE.MeshPhysicalMaterial({
      color: 0x0e1d32,
      metalness: 0.65,
      roughness: 0.36,
      clearcoat: 0.3,
      envMap,
      envMapIntensity: 1.15,
    });
    const lockedGlass = createBorosilicateGlassMaterial(0x64a8d0, 0.22, envMap);
    const lockedVelvet = new THREE.MeshPhysicalMaterial({
      color: 0x0d192b,
      metalness: 0.04,
      roughness: 0.88,
      sheen: 0.65,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0x2e5d86),
      envMap,
      envMapIntensity: 0.55,
    });
    const lockedGlow = new THREE.MeshStandardMaterial({
      color: 0x7ac7f0,
      emissive: 0x2f88c2,
      emissiveIntensity: 0.72,
      roughness: 0.2,
      metalness: 0.2,
    });
    return {
      primary: lockedPrimary,
      secondary: lockedSecondary,
      jewel: lockedJewel,
      dichroic: lockedJewel,
      crimson: lockedSecondary,
      gold: lockedSecondary,
      chrome: lockedSecondary,
      walnut: lockedDark,
      velvet: lockedVelvet,
      glass: lockedGlass,
      glow: lockedGlow,
      emerald: lockedJewel,
      obsidian: lockedDark,
      studioBlack: lockedDark,
      copper: lockedSecondary,
      manila: lockedPrimary,
      sapphireDeep: lockedDark,
    };
  }

  // UNLOCKED MUSEUM-GRADE 1966 LUXURY METALS, ENAMELS & PEACOCK DICHROIC CRYSTAL!
  const bronzeMetal = new THREE.MeshPhysicalMaterial({
    color: 0xd07d38,
    metalness: 0.92,
    roughness: 0.2,
    clearcoat: 0.38,
    clearcoatRoughness: 0.11,
    envMap,
    envMapIntensity: 1.65,
  });
  const silverMetal = new THREE.MeshPhysicalMaterial({
    color: 0xd6e3f2,
    metalness: 0.95,
    roughness: 0.14,
    clearcoat: 0.45,
    clearcoatRoughness: 0.08,
    envMap,
    envMapIntensity: 1.75,
  });
  const gold24K = new THREE.MeshPhysicalMaterial({
    color: 0xf6be42,
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 0.42,
    clearcoatRoughness: 0.08,
    reflectivity: 1.0,
    envMap,
    envMapIntensity: 1.75,
  });
  const copper = new THREE.MeshPhysicalMaterial({
    color: 0xdc6d32,
    metalness: 0.94,
    roughness: 0.17,
    clearcoat: 0.38,
    envMap,
    envMapIntensity: 1.7,
  });
  const platinum = createPlatinumMaterial(envMap);
  const cobaltSteel = createBluedSteelMaterial(0x1644a8, envMap);
  const chrome = createAnodizedAluminumMaterial(envMap);
  const walnut = createWalnutMaterial(envMap);

  const jewel = createGrandFeuEnamelMaterial(accentHexNum, envMap);
  const emerald = createGrandFeuEnamelMaterial(0x0c9e56, envMap);
  const crimson = createGrandFeuEnamelMaterial(0xc4183a, envMap);
  const glass = createBorosilicateGlassMaterial(0xdcf4ff, 0.22, envMap);

  const obsidian = new THREE.MeshPhysicalMaterial({
    color: 0x0b0f18,
    metalness: 0.08,
    roughness: 0.26,
    clearcoat: 0.45,
    clearcoatRoughness: 0.16,
    envMap,
    envMapIntensity: 0.75,
  });
  const studioBlack = new THREE.MeshPhysicalMaterial({
    color: 0x202630,
    metalness: 0.45,
    roughness: 0.34,
    clearcoat: 0.28,
    envMap,
    envMapIntensity: 1.2,
  });
  const manila = new THREE.MeshStandardMaterial({
    color: 0xdcc596,
    metalness: 0.04,
    roughness: 0.65,
    envMap,
    envMapIntensity: 0.65,
  });
  const sapphireDeep = new THREE.MeshPhysicalMaterial({
    color: 0x0b2d5e,
    metalness: 0.24,
    roughness: 0.11,
    clearcoat: 0.95,
    clearcoatRoughness: 0.05,
    iridescence: 0.85,
    iridescenceIOR: 1.45,
    envMap,
    envMapIntensity: 1.65,
  });

  // Rich Peacock Dichroic Crystal — deep gemstone color + live peacock/gold iridescence!
  const dichroic = new THREE.MeshPhysicalMaterial({
    color: meta.tierBadge === 'PLATINUM CROWN' ? 0x168cc4 : 0x008b9e,
    metalness: 0.16,
    roughness: 0.08,
    transmission: 0.36,
    thickness: 0.45,
    ior: 1.62,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    iridescence: 1.0,
    iridescenceIOR: 1.44,
    iridescenceThicknessRange: [200, 560],
    envMap,
    envMapIntensity: 1.85,
  });

  const glow = new THREE.MeshStandardMaterial({
    color: 0xffefc4,
    emissive: accentHexNum,
    emissiveIntensity: 1.15,
    roughness: 0.16,
    metalness: 0.14,
    envMap,
    envMapIntensity: 0.95,
  });

  const velSpec = getTierVelvetHex(meta.tierBadge);
  const velvet = new THREE.MeshPhysicalMaterial({
    color: velSpec.base,
    metalness: 0.02,
    roughness: 0.9,
    sheen: 0.9,
    sheenRoughness: 0.46,
    sheenColor: new THREE.Color(velSpec.sheen),
    envMap,
    envMapIntensity: 0.45,
  });

  let primary: THREE.Material = gold24K;
  let secondary: THREE.Material = cobaltSteel;
  if (meta.tierBadge === 'BRONZE MEDAL') {
    primary = bronzeMetal;
    secondary = gold24K;
  } else if (meta.tierBadge === 'SILVER MEDAL') {
    primary = silverMetal;
    secondary = cobaltSteel;
  } else if (meta.tierBadge === 'GOLD TROPHY') {
    primary = gold24K;
    secondary = spec.materialTier === 'BLUED_STEEL_GOLD' ? cobaltSteel : chrome;
  } else {
    primary = platinum;
    secondary = gold24K;
  }

  return {
    primary,
    secondary,
    jewel,
    dichroic,
    crimson,
    gold: gold24K,
    chrome,
    walnut,
    velvet,
    glass,
    glow,
    emerald,
    obsidian,
    studioBlack,
    copper,
    manila,
    sapphireDeep,
  };
}

// ----------------------------------------------------------------------------
// 4B. 36 UNMISTAKABLY DISTINCT MUSEUM SCULPTURE BUILDERS (`trophy_s1_01`..`s4_36`)
//     Each returns an optional kinetic animation callback `(timeSec, dtSec) => void`.
//     Coordinate origin `y = 0` is the top crown of the Velvet Presentation Cushion!
//     Keep height in `0.0 .. 0.86` and radial extent `<= 0.37` for crisp framing!
// ----------------------------------------------------------------------------

type KineticCallback = (timeSec: number, dtSec: number) => void;

function addTurnedFootStem(
  sculpt: THREE.Group,
  height: number,
  radius: number,
  mat: THREE.Material,
  collarMat: THREE.Material,
): void {
  const foot = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: radius * 2.4,
    innerRadius: radius * 0.85,
    thickness: 0.028,
    bevel: 0.006,
    material: collarMat,
  });
  foot.position.y = 0.012;

  const shaft = createFilletedShaft({
    radius,
    topRadius: radius * 0.84,
    height,
    baseCollarFlare: radius * 0.72,
    neckCollarFlare: radius * 0.52,
    anglageBevel: 0.007,
    radialSegments: 48,
    material: mat,
  });
  sculpt.add(foot, shaft);
}

/** #01 — Classic 1966 RCA 44-BX Ribbon Broadcast Microphone w/ ON AIR Beacon */
function buildSculpt_01_RibbonMic(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.19, 0.056, p.secondary, p.gold);

  const yoke = createChamferedArch({
    innerRadius: 0.195,
    outerRadius: 0.242,
    depth: 0.044,
    arcAngle: Math.PI * 1.14,
    startAngle: -Math.PI * 0.07,
    material: p.gold,
  });
  yoke.position.y = 0.45;
  yoke.rotation.z = Math.PI;

  for (const side of [-1, 1]) {
    const screw = createTurnedOrb({ radius: 0.034, heightScale: 0.8, material: p.chrome });
    screw.position.set(side * 0.235, 0.47, 0);
    sculpt.add(screw);
  }

  // Elongated diamond-pill RCA 44-BX ribbon mesh capsule
  const capsule = createFilletedShaft({
    radius: 0.122,
    topRadius: 0.118,
    height: 0.41,
    baseCollarFlare: 0.014,
    neckCollarFlare: 0.014,
    anglageBevel: 0.014,
    radialSegments: 48,
    centered: true,
    material: p.primary,
  });
  capsule.position.y = 0.46;

  const topDome = createTurnedOrb({
    radius: 0.12,
    heightScale: 0.65,
    hemiOnly: true,
    material: p.chrome,
  });
  topDome.position.y = 0.66;

  const bottomDome = createTurnedOrb({
    radius: 0.12,
    heightScale: 0.58,
    hemiOnly: true,
    material: p.chrome,
  });
  bottomDome.rotation.z = Math.PI;
  bottomDome.position.y = 0.26;

  // 7 precision horizontal acoustic chrome louver fins + crimson center badge
  for (let i = -3; i <= 3; i++) {
    const louver = createNotchedBezel({
      notchShape: 'HEX',
      outerRadius: 0.152 - Math.abs(i) * 0.007,
      innerRadius: 0.112,
      thickness: 0.02,
      bevel: 0.005,
      material: i === 0 ? p.crimson : p.gold,
    });
    louver.position.y = 0.46 + i * 0.052;
    sculpt.add(louver);
  }

  // Top glowing crimson "ON AIR" pilot dome + halo
  const tallyCollar = createFilletedShaft({
    radius: 0.042,
    height: 0.04,
    anglageBevel: 0.005,
    radialSegments: 32,
    material: p.gold,
  });
  tallyCollar.position.y = 0.72;
  const tallyGem = createTurnedOrb({ radius: 0.044, material: p.glow });
  tallyGem.position.y = 0.775;

  sculpt.add(yoke, capsule, topDome, bottomDome, tallyCollar, tallyGem);
  return (t) => {
    const s = 1.0 + Math.sin(t * 3.4) * 0.06;
    tallyGem.scale.setScalar(s);
  };
}

/** #02 — Tilted 45° Broadcast Gold Transcription LP Turntable + Twin Console Faders */
function buildSculpt_02_FunkTurntable(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.17, 0.06, p.secondary, p.gold);

  // Twin upright studio console fader rails flanking the base
  for (const sx of [-0.18, 0.18]) {
    const rail = createChamferedBox({
      width: 0.044,
      height: 0.13,
      depth: 0.052,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      cornerRadius: 0.01,
      material: p.walnut,
    });
    rail.position.set(sx, 0.075, 0.07);
    const knob = createChamferedBox({
      width: 0.056,
      height: 0.032,
      depth: 0.046,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: sx < 0 ? p.crimson : p.jewel,
    });
    knob.position.set(sx, sx < 0 ? 0.105 : 0.068, 0.095);
    sculpt.add(rail, knob);
  }

  const tiltedDeck = new THREE.Group();
  tiltedDeck.position.set(0, 0.47, -0.01);
  tiltedDeck.rotation.x = 0.84;

  const bezel = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.34,
    innerRadius: 0.298,
    thickness: 0.042,
    material: p.chrome,
  });

  const lpSpinGroup = new THREE.Group();
  // Authentic deep jet-obsidian grooved 1966 vinyl LP inside gleaming 24K Gold bezel!
  const disc = createFilletedShaft({
    radius: 0.305,
    height: 0.036,
    anglageBevel: 0.007,
    radialSegments: 64,
    centered: true,
    material: p.obsidian,
  });
  lpSpinGroup.add(disc);

  for (const gr of [0.165, 0.202, 0.238, 0.274]) {
    const groove = new THREE.Mesh(
      new THREE.TorusGeometry(gr, 0.0045, 12, 56),
      p.gold,
    );
    groove.rotation.x = Math.PI * 0.5;
    groove.position.y = 0.022;
    lpSpinGroup.add(groove);
  }

  const label = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.125,
    innerRadius: 0.026,
    thickness: 0.052,
    material: p.crimson,
  });
  const spindle = createFilletedShaft({
    radius: 0.02,
    topRadius: 0.011,
    height: 0.095,
    anglageBevel: 0.004,
    radialSegments: 32,
    centered: true,
    material: p.gold,
  });
  spindle.position.y = 0.036;
  lpSpinGroup.add(label, spindle);

  const gimbalPivot = new THREE.Group();
  gimbalPivot.position.set(0.255, 0.045, -0.175);
  const gimbalPost = createFilletedShaft({
    radius: 0.04,
    height: 0.072,
    anglageBevel: 0.006,
    radialSegments: 32,
    material: p.secondary,
  });
  const armCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.06, 0),
    new THREE.Vector3(-0.035, 0.088, 0.2),
    new THREE.Vector3(-0.165, 0.052, 0.34),
  ]);
  const armTube = new THREE.Mesh(
    new THREE.TubeGeometry(armCurve, 24, 0.013, 12, false),
    p.chrome,
  );
  const headshell = createTurnedOrb({
    radius: 0.026,
    heightScale: 0.62,
    material: p.crimson,
  });
  headshell.position.set(-0.165, 0.046, 0.345);
  gimbalPivot.add(gimbalPost, armTube, headshell);

  tiltedDeck.add(bezel, lpSpinGroup, gimbalPivot);
  sculpt.add(tiltedDeck);

  return (t, dt) => {
    lpSpinGroup.rotation.y += dt * 1.4;
    gimbalPivot.rotation.y = Math.sin(t * 1.5) * 0.09;
  };
}

/** #03 — 1966 Goodson-Todman 12-Ray Atomic Hex Starburst & Orbiting Electron Ring */
function buildSculpt_03_HexStarburst(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.18, 0.052, p.secondary, p.gold);

  const cy = 0.47;
  const hexFrame = createNotchedBezel({
    notchShape: 'HEX',
    outerRadius: 0.225,
    innerRadius: 0.14,
    thickness: 0.06,
    material: p.primary,
  });
  hexFrame.rotation.x = Math.PI * 0.5;
  hexFrame.position.y = cy;

  const star = createSculptedStarburstMini({
    radius: 0.335,
    rays: 12,
    depth: 0.042,
    primaryMat: p.gold,
    accentMat: p.chrome,
    orbMat: p.dichroic,
    tipBeads: true,
    name: 'HexStarburst12Ray',
  });
  star.position.y = cy;

  const orbitA = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.011, 14, 56), p.gold);
  orbitA.position.y = cy;
  orbitA.rotation.set(0.76, 0.32, 0.2);

  const orbitB = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.009, 14, 56), p.dichroic);
  orbitB.position.y = cy;
  orbitB.rotation.set(-0.68, -0.45, -0.25);

  sculpt.add(hexFrame, star, orbitA, orbitB);
  return (t) => {
    orbitA.rotation.y = 0.32 + t * 0.72;
    orbitB.rotation.x = -0.68 + t * 0.52;
  };
}

/** #04 — Miniature Spinning 1966 Golden Big Prize Wheel w/ Animated Clicker Flapper */
function buildSculpt_04_BigPrizeWheel(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Twin scrolled studio A-frame stanchions seated directly on velvet cushion!
  const wheelY = 0.45;
  for (const side of [-1, 1]) {
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.22, 0.01, 0.06),
      new THREE.Vector3(side * 0.29, 0.22, 0.03),
      new THREE.Vector3(side * 0.27, 0.45, 0.0),
    ]);
    const leg = new THREE.Mesh(
      new THREE.TubeGeometry(legCurve, 20, 0.022, 14, false),
      p.secondary,
    );
    const footOrb = createTurnedOrb({ radius: 0.032, heightScale: 0.6, material: p.gold });
    footOrb.position.set(side * 0.22, 0.018, 0.06);
    sculpt.add(leg, footOrb);
  }

  const wheelSpin = new THREE.Group();
  wheelSpin.position.y = wheelY;

  const outerRim = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.295,
    innerRadius: 0.22,
    thickness: 0.056,
    material: p.primary,
  });
  outerRim.rotation.x = Math.PI * 0.5;

  const innerWheelPlate = createFilletedShaft({
    radius: 0.225,
    height: 0.036,
    anglageBevel: 0.006,
    radialSegments: 48,
    centered: true,
    material: p.jewel,
  });
  innerWheelPlate.rotation.x = Math.PI * 0.5;
  wheelSpin.add(outerRim, innerWheelPlate);

  // 12 radial wedge spoke dividers + 12 perimeter chrome pegs
  const spokeCount = 12;
  for (let i = 0; i < spokeCount; i++) {
    const a = (i / spokeCount) * Math.PI * 2;
    const spoke = createFilletedShaft({
      radius: 0.01,
      height: 0.23,
      anglageBevel: 0.003,
      radialSegments: 16,
      material: i % 2 === 0 ? p.gold : p.chrome,
    });
    spoke.rotation.z = a - Math.PI * 0.5;
    spoke.position.z = 0.018;
    wheelSpin.add(spoke);

    const peg = createTurnedOrb({
      radius: 0.017,
      radialSegments: 18,
      material: i % 3 === 0 ? p.crimson : p.gold,
    });
    peg.position.set(Math.cos(a) * 0.268, Math.sin(a) * 0.268, 0.034);
    wheelSpin.add(peg);
  }

  const centerHub = createTurnedOrb({ radius: 0.065, heightScale: 0.72, material: p.gold });
  centerHub.rotation.x = Math.PI * 0.5;
  centerHub.position.z = 0.025;
  wheelSpin.add(centerHub);

  // Overhead arch holding the live-clicking leather/brass prize flapper
  const topBridge = createChamferedArch({
    innerRadius: 0.295,
    outerRadius: 0.34,
    depth: 0.038,
    arcAngle: Math.PI * 0.9,
    startAngle: Math.PI * 0.05,
    material: p.gold,
  });
  topBridge.position.y = wheelY;

  const flapperPivot = new THREE.Group();
  flapperPivot.position.set(0, wheelY + 0.33, 0.036);
  const flapperHub = createTurnedOrb({ radius: 0.03, material: p.chrome });
  const flapperBlade = createFilletedShaft({
    radius: 0.02,
    topRadius: 0.005,
    height: 0.1,
    anglageBevel: 0.004,
    radialSegments: 24,
    material: p.crimson,
  });
  flapperBlade.rotation.z = Math.PI;
  flapperPivot.add(flapperHub, flapperBlade);

  sculpt.add(wheelSpin, topBridge, flapperPivot);
  return (t, dt) => {
    wheelSpin.rotation.z -= dt * 0.78;
    flapperPivot.rotation.z = -Math.abs(Math.sin(t * 4.8)) * 0.28;
  };
}

/** #05 — Hanging Ceremonial Enameled Truce Medallion on Ribbed V-Chevron Ribbon Stand */
function buildSculpt_05_TruceMedallion(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Arched brass museum medal easel cradle seated directly on velvet cushion!
  const archFrame = createChamferedArch({
    innerRadius: 0.26,
    outerRadius: 0.305,
    depth: 0.04,
    arcAngle: Math.PI * 1.06,
    startAngle: -Math.PI * 0.03,
    material: p.gold,
  });
  archFrame.position.y = 0.44;

  for (const sx of [-0.282, 0.282]) {
    const leg = createFilletedShaft({
      radius: 0.024,
      height: 0.45,
      baseCollarFlare: 0.02,
      neckCollarFlare: 0.012,
      anglageBevel: 0.006,
      radialSegments: 28,
      material: p.gold,
    });
    leg.position.set(sx, 0.0, 0);
    sculpt.add(leg);
  }

  // Draped crimson enamel V-ribbon hanger suspended from top bar
  const ribbonPendulum = new THREE.Group();
  ribbonPendulum.position.set(0, 0.72, 0);

  const drapeShape = new THREE.Shape();
  drapeShape.moveTo(-0.115, 0);
  drapeShape.lineTo(0.115, 0);
  drapeShape.lineTo(0.088, -0.22);
  drapeShape.lineTo(0, -0.275);
  drapeShape.lineTo(-0.088, -0.22);
  drapeShape.closePath();
  const drapeGeom = new THREE.ExtrudeGeometry(drapeShape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  drapeGeom.translate(0, 0, -0.01);
  const drapeMesh = new THREE.Mesh(drapeGeom, p.crimson);

  // Gold bar clasp at top of ribbon
  const claspBar = createChamferedBox({
    width: 0.26,
    height: 0.044,
    depth: 0.042,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    cornerRadius: 0.008,
    material: p.gold,
  });

  // Heavy double-sided wax-seal medallion disc hanging below ribbon
  const medalRim = createNotchedBezel({
    notchShape: 'WAX_SEAL',
    outerRadius: 0.205,
    innerRadius: 0.135,
    thickness: 0.048,
    material: p.primary,
  });
  medalRim.rotation.x = Math.PI * 0.5;
  medalRim.position.y = -0.45;

  const medalCore = createFilletedShaft({
    radius: 0.145,
    height: 0.036,
    anglageBevel: 0.006,
    radialSegments: 48,
    centered: true,
    material: p.jewel,
  });
  medalCore.rotation.x = Math.PI * 0.5;
  medalCore.position.y = -0.45;

  // Two interlocking golden friendship/truce rings in the medal center!
  for (const offset of [-0.045, 0.045]) {
    const link = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.014, 14, 40), p.gold);
    link.position.set(offset, -0.45, offset > 0 ? 0.026 : -0.026);
    link.rotation.y = offset > 0 ? 0.35 : -0.35;
    ribbonPendulum.add(link);
  }

  ribbonPendulum.add(claspBar, drapeMesh, medalRim, medalCore);
  sculpt.add(archFrame, ribbonPendulum);

  return (t) => {
    ribbonPendulum.rotation.z = Math.sin(t * 1.8) * 0.045;
  };
}

/** #06 — Twin-Horn Brass Studio Klaxon Desk Bell w/ Live Tapping Striker */
function buildSculpt_06_KlaxonBell(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Broad stepped walnut desk plate directly on cushion
  const deskSlab = createChamferedBox({
    width: 0.44,
    height: 0.068,
    depth: 0.24,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    cornerRadius: 0.025,
    material: p.walnut,
  });
  deskSlab.position.y = 0.038;

  // Heavy turned brass studio quiz-desk strike dome (LatheGeometry bell curve!)
  const domePts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.185, 0.0),
    new THREE.Vector2(0.195, 0.024),
    new THREE.Vector2(0.182, 0.095),
    new THREE.Vector2(0.145, 0.165),
    new THREE.Vector2(0.075, 0.205),
    new THREE.Vector2(0.0, 0.215),
  ];
  const domeGeom = new THREE.LatheGeometry(domePts, 48);
  domeGeom.computeVertexNormals();
  const bellDome = new THREE.Mesh(domeGeom, p.primary);
  bellDome.position.y = 0.07;

  // Top push-plunger button
  const plunger = createFilletedShaft({
    radius: 0.036,
    topRadius: 0.044,
    height: 0.075,
    anglageBevel: 0.007,
    radialSegments: 32,
    material: p.crimson,
  });
  plunger.position.y = 0.28;

  // Twin flared Art-Deco Klaxon Myth Horns arching upward on left & right!
  const hornProfile = [
    new THREE.Vector2(0.018, 0.0),
    new THREE.Vector2(0.024, 0.12),
    new THREE.Vector2(0.045, 0.22),
    new THREE.Vector2(0.095, 0.29),
    new THREE.Vector2(0.105, 0.305),
    new THREE.Vector2(0.088, 0.305),
    new THREE.Vector2(0.038, 0.21),
    new THREE.Vector2(0.014, 0.02),
  ];
  const hornGeom = new THREE.LatheGeometry(hornProfile, 36);
  hornGeom.computeVertexNormals();

  for (const side of [-1, 1]) {
    const hornPost = createFilletedShaft({
      radius: 0.026,
      height: 0.28,
      baseCollarFlare: 0.012,
      anglageBevel: 0.005,
      radialSegments: 24,
      material: p.gold,
    });
    hornPost.position.set(side * 0.17, 0.065, -0.02);

    const hornMesh = new THREE.Mesh(hornGeom, p.gold);
    hornMesh.position.set(side * 0.17, 0.35, -0.02);
    hornMesh.rotation.z = -side * 0.88;
    hornMesh.rotation.x = 0.22;

    const mouthJewel = createTurnedOrb({ radius: 0.028, material: p.glow });
    mouthJewel.position.set(side * 0.28, 0.47, 0.02);

    sculpt.add(hornPost, hornMesh, mouthJewel);
  }

  // Spring-mounted overhead bell striker hammer
  const hammerPivot = new THREE.Group();
  hammerPivot.position.set(0, 0.56, -0.04);
  const hammerArm = createFilletedShaft({
    radius: 0.012,
    height: 0.2,
    anglageBevel: 0.003,
    radialSegments: 16,
    material: p.chrome,
  });
  hammerArm.rotation.z = Math.PI;
  const hammerHead = createTurnedOrb({ radius: 0.042, material: p.gold });
  hammerHead.position.y = -0.19;
  hammerPivot.add(hammerArm, hammerHead);

  const overheadArch = createChamferedArch({
    innerRadius: 0.165,
    outerRadius: 0.21,
    depth: 0.038,
    arcAngle: Math.PI,
    material: p.secondary,
  });
  overheadArch.position.set(0, 0.36, -0.02);

  sculpt.add(deskSlab, bellDome, plunger, overheadArch, hammerPivot);
  return (t) => {
    hammerPivot.rotation.z = Math.sin(t * 4.5) * 0.18;
  };
}

/** #07 — Precision Illuminated 1966 Vernier Tuning Dial w/ Live Hunting Sweep Needle */
function buildSculpt_07_VernierCaliber(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Angled heavy instrument console base + dual knurled tuning knobs
  const baseBlock = createChamferedBox({
    width: 0.38,
    height: 0.12,
    depth: 0.22,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    cornerRadius: 0.02,
    material: p.secondary,
  });
  baseBlock.position.y = 0.065;

  for (const kx of [-0.125, 0.125]) {
    const knob = createNotchedBezel({
      notchShape: 'VERNIER',
      outerRadius: 0.052,
      innerRadius: 0.014,
      thickness: 0.042,
      bevel: 0.005,
      material: p.gold,
    });
    knob.rotation.x = Math.PI * 0.5;
    knob.position.set(kx, 0.065, 0.115);
    sculpt.add(knob);
  }

  // Upright tilted circular micrometer vernier dial face
  const dialGroup = new THREE.Group();
  dialGroup.position.set(0, 0.45, -0.01);
  dialGroup.rotation.x = -0.16;

  const outerBezel = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.315,
    innerRadius: 0.245,
    thickness: 0.064,
    material: p.primary,
  });
  outerBezel.rotation.x = Math.PI * 0.5;

  const dialFace = createFilletedShaft({
    radius: 0.255,
    height: 0.036,
    anglageBevel: 0.006,
    radialSegments: 48,
    centered: true,
    material: p.sapphireDeep,
  });
  dialFace.rotation.x = Math.PI * 0.5;

  // Concentric precision 24K gold target rings + 12 radial studio graduation pips!
  for (const r of [0.195, 0.125]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0085, 12, 48), p.gold);
    ring.position.z = 0.026;
    dialGroup.add(ring);
  }
  for (let tick = 0; tick < 12; tick++) {
    const a = (tick / 12) * Math.PI * 2;
    const pip = createTurnedOrb({
      radius: tick === 3 ? 0.018 : 0.012,
      material: tick % 3 === 0 ? p.gold : p.chrome,
    });
    pip.position.set(Math.cos(a) * 0.225, Math.sin(a) * 0.225, 0.028);
    dialGroup.add(pip);
  }

  // 12 o'clock glowing dead-center bullseye ruby pip
  const bullseyePip = createTurnedOrb({ radius: 0.026, material: p.glow });
  bullseyePip.position.set(0, 0.23, 0.038);

  // Sweeping precision indicator needle
  const needlePivot = new THREE.Group();
  needlePivot.position.z = 0.044;
  const needleHub = createTurnedOrb({ radius: 0.042, heightScale: 0.65, material: p.gold });
  needleHub.rotation.x = Math.PI * 0.5;
  const needleBlade = createFilletedShaft({
    radius: 0.016,
    topRadius: 0.004,
    height: 0.215,
    anglageBevel: 0.003,
    radialSegments: 16,
    material: p.crimson,
  });
  needlePivot.add(needleHub, needleBlade);

  dialGroup.add(outerBezel, dialFace, bullseyePip, needlePivot);
  sculpt.add(baseBlock, dialGroup);

  return (t) => {
    // Smoothly sweeps & locks briefly onto 12 o'clock dead-center!
    const sweep = Math.sin(t * 1.45);
    needlePivot.rotation.z = sweep * sweep * sweep * 0.55;
  };
}

/** #08 — 1966 Brass & Mother-of-Pearl Studio Opera Glasses (Twin-Barrel Binoculars) */
function buildSculpt_08_OperaBinoculars(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Swept swan-neck brass presentation stand supporting tilted twin opera barrels!
  const standCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, -0.05),
    new THREE.Vector3(0, 0.2, -0.08),
    new THREE.Vector3(0, 0.39, 0.0),
  ]);
  const standNeck = new THREE.Mesh(
    new THREE.TubeGeometry(standCurve, 24, 0.028, 16, false),
    p.gold,
  );
  const standFoot = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.14,
    innerRadius: 0.04,
    thickness: 0.032,
    material: p.gold,
  });
  standFoot.position.set(0, 0.015, -0.04);

  const binoGroup = new THREE.Group();
  binoGroup.position.set(0, 0.47, 0.02);
  binoGroup.rotation.x = -0.32;

  for (const bx of [-0.145, 0.145]) {
    const barrel = createFilletedShaft({
      radius: 0.072,
      topRadius: 0.108,
      height: 0.34,
      baseCollarFlare: 0.016,
      neckCollarFlare: 0.018,
      anglageBevel: 0.009,
      radialSegments: 48,
      centered: true,
      material: p.primary,
    });
    barrel.rotation.x = Math.PI * 0.5;
    barrel.position.x = bx;

    // Enamel wrap grip band around middle of each barrel
    const grip = createFilletedShaft({
      radius: 0.096,
      topRadius: 0.104,
      height: 0.145,
      anglageBevel: 0.006,
      radialSegments: 48,
      centered: true,
      material: p.crimson,
    });
    grip.rotation.x = Math.PI * 0.5;
    grip.position.x = bx;

    // Deep sculpted brass lens hood rim framing dark sapphire optical objective glass!
    const lensRim = createNotchedBezel({
      notchShape: 'VERNIER',
      outerRadius: 0.118,
      innerRadius: 0.088,
      thickness: 0.042,
      bevel: 0.006,
      material: p.gold,
    });
    lensRim.rotation.x = Math.PI * 0.5;
    lensRim.position.set(bx, 0, 0.172);

    const objLens = createTurnedOrb({
      radius: 0.092,
      heightScale: 0.36,
      hemiOnly: true,
      material: p.sapphireDeep,
    });
    objLens.rotation.x = Math.PI * 0.5;
    objLens.position.set(bx, 0, 0.16);

    // Turned eyepiece cup at rear
    const eyeCup = createNotchedBezel({
      notchShape: 'SCALLOP',
      outerRadius: 0.08,
      innerRadius: 0.042,
      thickness: 0.032,
      bevel: 0.006,
      material: p.gold,
    });
    eyeCup.rotation.x = Math.PI * 0.5;
    eyeCup.position.set(bx, 0, -0.175);

    binoGroup.add(barrel, grip, lensRim, objLens, eyeCup);
  }

  // Articulated central focusing bridge + knurled focus wheel
  const bridge = createChamferedBox({
    width: 0.24,
    height: 0.044,
    depth: 0.068,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.gold,
  });
  const focusWheel = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.056,
    innerRadius: 0.018,
    thickness: 0.065,
    bevel: 0.006,
    material: p.chrome,
  });
  focusWheel.rotation.x = Math.PI * 0.5;
  focusWheel.position.set(0, 0.03, 0.04);

  // Classic lorgnette side folding handle extending dramatically down-right!
  const lorgnette = createFilletedShaft({
    radius: 0.018,
    topRadius: 0.014,
    height: 0.28,
    baseCollarFlare: 0.012,
    anglageBevel: 0.005,
    radialSegments: 24,
    material: p.gold,
  });
  lorgnette.position.set(0.255, -0.22, -0.02);
  lorgnette.rotation.z = 0.28;

  binoGroup.add(bridge, focusWheel, lorgnette);
  sculpt.add(standFoot, standNeck, binoGroup);

  return (t) => {
    focusWheel.rotation.y = t * 1.1;
  };
}

/** #09 — Grand Two-Handled 24K Loving-Cup Broadcast Chalice w/ 3 Purse Seals */
function buildSculpt_09_SeasonOneChalice(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Lathe-turned grand fluted Championship Loving-Cup silhouette
  const cupPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.165, 0.0),
    new THREE.Vector2(0.155, 0.045),
    new THREE.Vector2(0.075, 0.09),
    new THREE.Vector2(0.052, 0.165),
    new THREE.Vector2(0.088, 0.225), // sculptural stem knop
    new THREE.Vector2(0.05, 0.285),
    new THREE.Vector2(0.135, 0.365),
    new THREE.Vector2(0.205, 0.51),
    new THREE.Vector2(0.228, 0.67),
    new THREE.Vector2(0.255, 0.72), // flared chalice lip
    new THREE.Vector2(0.232, 0.735),
    new THREE.Vector2(0.188, 0.65),
    new THREE.Vector2(0.115, 0.44),
    new THREE.Vector2(0.0, 0.4),
  ];
  const cupGeom = new THREE.LatheGeometry(cupPts, 56);
  cupGeom.computeVertexNormals();
  const chalice = new THREE.Mesh(cupGeom, p.primary);
  chalice.castShadow = true;

  // Twin sweeping S-scroll loving-cup handles (`TubeGeometry`)
  for (const side of [-1, 1]) {
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.22, 0.67, 0),
      new THREE.Vector3(side * 0.345, 0.68, 0),
      new THREE.Vector3(side * 0.325, 0.5, 0),
      new THREE.Vector3(side * 0.235, 0.41, 0),
      new THREE.Vector3(side * 0.155, 0.36, 0),
    ]);
    const handle = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 28, 0.022, 14, false),
      p.gold,
    );
    sculpt.add(handle);
  }

  // 3 raised Peacock Enamel Network Purse Seals orbiting the cup belly
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const seal = createNotchedBezel({
      notchShape: 'WAX_SEAL',
      outerRadius: 0.062,
      innerRadius: 0.024,
      thickness: 0.028,
      bevel: 0.005,
      material: p.jewel,
    });
    seal.position.set(Math.sin(a) * 0.215, 0.54, Math.cos(a) * 0.215);
    seal.lookAt(Math.sin(a) * 2.0, 0.54, Math.cos(a) * 2.0);
    seal.rotateX(Math.PI * 0.5);
    sculpt.add(seal);
  }

  // Floating radiant golden finial orb hovering in the open chalice mouth
  const crownOrb = createTurnedOrb({ radius: 0.072, material: p.dichroic });
  crownOrb.position.y = 0.72;

  sculpt.add(chalice, crownOrb);
  return (t) => {
    crownOrb.position.y = 0.72 + Math.sin(t * 2.2) * 0.018;
  };
}

/** #10 — Miniature 1964 Soundproof Glass Isolation Booth w/ Twin Glowing Relays */
function buildSculpt_10_IsolationBooth(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Octagonal brass booth floor deck seated directly on velvet cushion
  const floorRing = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.265,
    innerRadius: 0.04,
    thickness: 0.045,
    material: p.gold,
  });
  floorRing.position.y = 0.022;

  // Interior twin copper/cobalt solenoid coils + tiny contestant mic stand
  for (const cx of [-0.095, 0.095]) {
    const coil = createFilletedShaft({
      radius: 0.056,
      height: 0.34,
      baseCollarFlare: 0.014,
      neckCollarFlare: 0.014,
      anglageBevel: 0.007,
      radialSegments: 36,
      material: p.secondary,
    });
    coil.position.set(cx, 0.045, 0);
    const coilCap = createTurnedOrb({ radius: 0.036, heightScale: 0.65, material: p.glow });
    coilCap.position.set(cx, 0.4, 0);
    sculpt.add(coil, coilCap);
  }

  const innerArch = createChamferedArch({
    innerRadius: 0.075,
    outerRadius: 0.135,
    depth: 0.046,
    arcAngle: Math.PI,
    material: p.gold,
  });
  innerArch.position.y = 0.41;

  // 4 slender chrome booth corner mullions around the crystal glass dome
  for (let m = 0; m < 4; m++) {
    const a = (m / 4) * Math.PI * 2 + Math.PI * 0.25;
    const mullion = createFilletedShaft({
      radius: 0.012,
      height: 0.52,
      anglageBevel: 0.003,
      radialSegments: 16,
      material: p.chrome,
    });
    mullion.position.set(Math.cos(a) * 0.235, 0.04, Math.sin(a) * 0.235);
    sculpt.add(mullion);
  }

  // Crystal Borosilicate Bell-Jar Cylinder + Turned Dome Cap
  const glassWall = createFilletedShaft({
    radius: 0.232,
    height: 0.49,
    baseCollarFlare: 0.008,
    neckCollarFlare: 0.004,
    anglageBevel: 0.006,
    radialSegments: 56,
    material: p.glass,
    castShadow: false,
  });
  glassWall.position.y = 0.045;

  const glassDome = createTurnedOrb({
    radius: 0.232,
    heightScale: 0.68,
    hemiOnly: true,
    radialSegments: 56,
    material: p.glass,
    castShadow: false,
  });
  glassDome.position.y = 0.53;

  // Top soundproof ventilation cap & beacon seated flush on brass collar
  const ventCap = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.125,
    innerRadius: 0.04,
    thickness: 0.036,
    material: p.primary,
  });
  ventCap.position.y = 0.678;
  const beaconCollar = createFilletedShaft({
    radius: 0.048,
    topRadius: 0.038,
    height: 0.036,
    anglageBevel: 0.005,
    radialSegments: 24,
    material: p.gold,
  });
  beaconCollar.position.y = 0.688;
  const beacon = createTurnedOrb({ radius: 0.042, material: p.crimson });
  beacon.position.y = 0.74;

  // Miniature contestant desk & gold desk mic inside the booth center!
  const miniDesk = createChamferedBox({
    width: 0.12,
    height: 0.16,
    depth: 0.09,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.walnut,
  });
  miniDesk.position.set(0, 0.125, 0.06);
  const miniMic = createTurnedOrb({ radius: 0.024, material: p.gold });
  miniMic.position.set(0, 0.24, 0.06);

  sculpt.add(floorRing, innerArch, miniDesk, miniMic, glassWall, glassDome, ventCap, beaconCollar, beacon);
  return (t) => {
    beacon.scale.setScalar(1.0 + Math.sin(t * 2.8) * 0.07);
  };
}

/** #11 — 1967 RCA Color Vectorscope CRT Monitor on Splayed Mid-Century Tripod Legs */
function buildSculpt_11_ColorVectorscope(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // 3 splayed Mid-Century chrome tripod legs directly on cushion
  for (let l = 0; l < 3; l++) {
    const a = (l / 3) * Math.PI * 2 + Math.PI / 6;
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 0.22, 0.015, Math.sin(a) * 0.22),
      new THREE.Vector3(Math.cos(a) * 0.13, 0.17, Math.sin(a) * 0.13),
      new THREE.Vector3(Math.cos(a) * 0.08, 0.28, Math.sin(a) * 0.08),
    ]);
    const leg = new THREE.Mesh(
      new THREE.TubeGeometry(legCurve, 16, 0.02, 12, false),
      p.chrome,
    );
    sculpt.add(leg);
  }

  // Rounded retro television cabinet housing (`createChamferedBox`)
  const cabinet = createChamferedBox({
    width: 0.54,
    height: 0.44,
    depth: 0.28,
    bevelThickness: 0.024,
    bevelSize: 0.024,
    cornerRadius: 0.08,
    material: p.primary,
  });
  cabinet.position.set(0, 0.48, -0.02);

  // Recessed rounded CRT bezel ring + glowing phosphor screen
  const screenBezel = createChamferedBox({
    width: 0.42,
    height: 0.31,
    depth: 0.05,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    cornerRadius: 0.06,
    material: p.gold,
  });
  screenBezel.position.set(0, 0.51, 0.115);

  const screenPlate = createChamferedBox({
    width: 0.36,
    height: 0.25,
    depth: 0.032,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    cornerRadius: 0.048,
    material: p.dichroic,
  });
  screenPlate.position.set(0, 0.51, 0.13);

  // 3D Glowing Harmonic Lissajous Signal Trace popping off the CRT face!
  const wavePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 32; i++) {
    const u = i / 32;
    const x = lerp(-0.145, 0.145, u);
    const y = 0.51 + Math.sin(u * Math.PI * 3.0) * 0.082;
    wavePts.push(new THREE.Vector3(x, y, 0.158));
  }
  const waveTube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wavePts), 36, 0.013, 10, false),
    p.glow,
  );

  // 3 lower front RGB color-gain tuning knobs
  for (let k = -1; k <= 1; k++) {
    const knob = createTurnedOrb({ radius: 0.026, heightScale: 0.72, material: k === 0 ? p.crimson : p.gold });
    knob.rotation.x = Math.PI * 0.5;
    knob.position.set(k * 0.11, 0.315, 0.135);
    sculpt.add(knob);
  }

  // Twin V-shaped 1966 rabbit-ear TV dipole antennas on top!
  for (const side of [-1, 1]) {
    const ant = createFilletedShaft({
      radius: 0.01,
      topRadius: 0.005,
      height: 0.24,
      anglageBevel: 0.003,
      radialSegments: 14,
      material: p.chrome,
    });
    ant.position.set(side * 0.03, 0.69, -0.02);
    ant.rotation.z = -side * 0.55;
    const tip = createTurnedOrb({ radius: 0.02, material: p.gold });
    tip.position.set(side * 0.155, 0.89, -0.02);
    sculpt.add(ant, tip);
  }

  sculpt.add(cabinet, screenBezel, screenPlate, waveTube);
  return (t) => {
    waveTube.position.z = Math.sin(t * 3.2) * 0.008;
  };
}

/** #12 — Atlantic City Showband Golden Lyre & 7 Graduated Cathedral Organ Pipes */
function buildSculpt_12_WurlitzerLyre(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.14, 0.056, p.secondary, p.gold);

  const crossbar = createChamferedBox({
    width: 0.44,
    height: 0.058,
    depth: 0.095,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    cornerRadius: 0.018,
    material: p.jewel,
  });
  crossbar.position.y = 0.165;

  const lyreArms = createChamferedArch({
    innerRadius: 0.215,
    outerRadius: 0.285,
    depth: 0.052,
    arcAngle: Math.PI * 1.36,
    startAngle: -Math.PI * 0.18,
    material: p.primary,
  });
  lyreArms.position.y = 0.46;
  lyreArms.rotation.z = Math.PI;

  // 7 graduated fluted cathedral showband organ pipes
  for (let i = -3; i <= 3; i++) {
    const pipeH = 0.49 - Math.abs(i) * 0.056;
    const pipe = createFilletedShaft({
      radius: 0.022,
      topRadius: 0.028,
      height: pipeH,
      baseCollarFlare: 0.006,
      neckCollarFlare: 0.009,
      anglageBevel: 0.005,
      radialSegments: 32,
      material: i === 0 ? p.gold : i % 2 === 0 ? p.chrome : p.primary,
    });
    pipe.position.set(i * 0.056, 0.19, 0);
    sculpt.add(pipe);
  }

  // Boardwalk starburst finial at crown
  const crownStar = createSculptedStarburstMini({
    radius: 0.115,
    rays: 8,
    depth: 0.03,
    primaryMat: p.gold,
    accentMat: p.jewel,
    orbMat: p.glow,
  });
  crownStar.position.y = 0.77;

  sculpt.add(crossbar, lyreArms, crownStar);
  return (t) => {
    crownStar.rotation.z = Math.sin(t * 1.2) * 0.15;
  };
}

/** #13 — Ceremonial Tripod Flame Brazier Urn & Sculpted 3-Tongue Crystal Flame */
function buildSculpt_13_CanaryBrazier(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // 3 arched bronze tripod legs seated directly on velvet cushion
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 0.21, 0.015, Math.sin(a) * 0.21),
      new THREE.Vector3(Math.cos(a) * 0.15, 0.16, Math.sin(a) * 0.15),
      new THREE.Vector3(Math.cos(a) * 0.19, 0.34, Math.sin(a) * 0.19),
    ]);
    const leg = new THREE.Mesh(
      new THREE.TubeGeometry(legCurve, 20, 0.024, 14, false),
      p.primary,
    );
    const claw = createTurnedOrb({ radius: 0.032, heightScale: 0.65, material: p.gold });
    claw.position.set(Math.cos(a) * 0.21, 0.02, Math.sin(a) * 0.21);
    sculpt.add(leg, claw);
  }

  // Wide fluted Art-Deco brazier fire-bowl (LatheGeometry)
  const bowlPts = [
    new THREE.Vector2(0.0, 0.22),
    new THREE.Vector2(0.09, 0.235),
    new THREE.Vector2(0.18, 0.29),
    new THREE.Vector2(0.245, 0.39),
    new THREE.Vector2(0.268, 0.43),
    new THREE.Vector2(0.228, 0.43),
    new THREE.Vector2(0.165, 0.34),
    new THREE.Vector2(0.0, 0.31),
  ];
  const bowlGeom = new THREE.LatheGeometry(bowlPts, 48);
  bowlGeom.computeVertexNormals();
  const bowl = new THREE.Mesh(bowlGeom, p.primary);

  const bowlRim = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.275,
    innerRadius: 0.215,
    thickness: 0.032,
    material: p.gold,
  });
  bowlRim.position.y = 0.425;

  // Sculpted 3-tongue glowing crystal flame rising cleanly out of the urn!
  const flameGroup = new THREE.Group();
  flameGroup.position.y = 0.38;

  const makeFlameTongue = (h: number, w: number, mat: THREE.Material): THREE.Mesh => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(w, h * 0.28, w * 0.55, h * 0.62);
    s.quadraticCurveTo(w * 0.2, h * 0.85, 0, h);
    s.quadraticCurveTo(-w * 0.3, h * 0.72, -w * 0.72, h * 0.42);
    s.quadraticCurveTo(-w * 0.9, h * 0.16, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.028,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 3,
    });
    g.translate(0, 0, -0.014);
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  };

  const mainFlame = makeFlameTongue(0.41, 0.115, p.glow);
  const leftFlame = makeFlameTongue(0.29, 0.082, p.crimson);
  leftFlame.position.set(-0.07, 0.02, 0.02);
  leftFlame.rotation.set(0.08, 0.45, 0.22);
  const rightFlame = makeFlameTongue(0.31, 0.085, p.jewel);
  rightFlame.position.set(0.075, 0.02, -0.02);
  rightFlame.rotation.set(-0.08, -0.5, -0.2);

  flameGroup.add(mainFlame, leftFlame, rightFlame);
  sculpt.add(bowl, bowlRim, flameGroup);

  return (t) => {
    flameGroup.scale.y = 1.0 + Math.sin(t * 4.2) * 0.055;
    flameGroup.rotation.y = Math.sin(t * 1.9) * 0.12;
  };
}

/** #14 — Tilted 23.5° Mid-Century Desk Globe in Meridian Cradle w/ Jeweled Map Pin */
function buildSculpt_14_ReliefGlobe(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.16, 0.055, p.gold, p.secondary);

  const centerY = 0.49;
  // Swept C-shaped graduated brass meridian cradle
  const meridianC = createChamferedArch({
    innerRadius: 0.25,
    outerRadius: 0.298,
    depth: 0.04,
    arcAngle: Math.PI * 1.18,
    startAngle: -Math.PI * 0.59,
    material: p.gold,
  });
  meridianC.position.y = centerY;
  meridianC.rotation.z = -0.35;

  // Authentic 23.5° axial tilt globe assembly
  const axialTiltGroup = new THREE.Group();
  axialTiltGroup.position.y = centerY;
  axialTiltGroup.rotation.z = -0.41; // 23.5 degrees

  const polarAxis = createFilletedShaft({
    radius: 0.014,
    height: 0.56,
    anglageBevel: 0.004,
    radialSegments: 20,
    centered: true,
    material: p.gold,
  });

  const spinGlobe = new THREE.Group();
  const oceanSphere = createTurnedOrb({
    radius: 0.21,
    equatorialRib: 0.006,
    radialSegments: 56,
    material: p.secondary,
  });
  spinGlobe.add(oceanSphere);

  // Raised golden latitude & longitude relief bands
  for (const latY of [-0.105, 0, 0.105]) {
    const latR = Math.sqrt(Math.max(0.01, 0.212 * 0.212 - latY * latY));
    const latBand = new THREE.Mesh(
      new THREE.TorusGeometry(latR, 0.007, 12, 48),
      p.gold,
    );
    latBand.rotation.x = Math.PI * 0.5;
    latBand.position.y = latY;
    spinGlobe.add(latBand);
  }
  for (let lon = 0; lon < 3; lon++) {
    const lonBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.214, 0.006, 12, 48),
      p.primary,
    );
    lonBand.rotation.y = (lon / 3) * Math.PI;
    spinGlobe.add(lonBand);
  }

  // Oversized Crimson-Jeweled Cartographer's Pin planted boldly on the northern hemisphere!
  const pinGroup = new THREE.Group();
  pinGroup.position.set(0.11, 0.16, 0.075);
  pinGroup.rotation.set(0.32, 0, -0.58);
  const pinNeedle = createFilletedShaft({
    radius: 0.008,
    topRadius: 0.018,
    height: 0.135,
    anglageBevel: 0.003,
    radialSegments: 18,
    material: p.gold,
  });
  const pinHead = createTurnedOrb({ radius: 0.052, material: p.crimson });
  pinHead.position.y = 0.15;
  pinGroup.add(pinNeedle, pinHead);
  spinGlobe.add(pinGroup);

  axialTiltGroup.add(polarAxis, spinGlobe);
  sculpt.add(meridianC, axialTiltGroup);

  return (_t, dt) => {
    spinGlobe.rotation.y += dt * 0.65;
  };
}

/** #15 — 1966 Con-Ed Dual-Blade Brass Knife Switch w/ Rocking Bakelite T-Handle */
function buildSculpt_15_MercyKnifeSwitch(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Grounded walnut & brass electrical mounting cradle bolted directly onto velvet cushion!
  const mountSlab = createChamferedBox({
    width: 0.46,
    height: 0.072,
    depth: 0.24,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    cornerRadius: 0.018,
    material: p.walnut,
  });
  mountSlab.position.y = 0.038;
  for (const bx of [-0.17, 0.17]) {
    const bracket = createChamferedBox({
      width: 0.055,
      height: 0.14,
      depth: 0.15,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.gold,
    });
    bracket.position.set(bx, 0.095, -0.02);
    sculpt.add(bracket);
  }
  sculpt.add(mountSlab);

  // Tilted slate-cobalt porcelain breaker board seated cleanly inside mounting brackets
  const boardGroup = new THREE.Group();
  boardGroup.position.set(0, 0.42, 0.01);
  boardGroup.rotation.x = -0.26;

  const breakerSlab = createChamferedBox({
    width: 0.44,
    height: 0.62,
    depth: 0.068,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    cornerRadius: 0.026,
    material: p.sapphireDeep,
  });
  boardGroup.add(breakerSlab);

  // 4 ribbed ceramic insulator terminals (top & bottom pairs)
  for (const sx of [-0.12, 0.12]) {
    for (const sy of [-0.18, 0.18]) {
      const insulator = createFilletedShaft({
        radius: 0.044,
        topRadius: 0.036,
        height: 0.085,
        baseCollarFlare: 0.01,
        neckCollarFlare: 0.008,
        anglageBevel: 0.006,
        radialSegments: 32,
        material: p.chrome,
      });
      insulator.rotation.x = Math.PI * 0.5;
      insulator.position.set(sx, sy, 0.035);
      boardGroup.add(insulator);

      const jaw = createChamferedBox({
        width: 0.038,
        height: 0.072,
        depth: 0.075,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        material: p.gold,
      });
      jaw.position.set(sx, sy, 0.105);
      boardGroup.add(jaw);
    }
  }

  // Hinged twin burnished copper throw blades + turned Crimson Bakelite T-handle!
  const throwPivot = new THREE.Group();
  throwPivot.position.set(0, -0.18, 0.125);
  throwPivot.rotation.x = 0.52;

  for (const sx of [-0.12, 0.12]) {
    const blade = createChamferedBox({
      width: 0.024,
      height: 0.41,
      depth: 0.052,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.copper,
    });
    blade.position.set(sx, 0.205, 0);
    throwPivot.add(blade);
  }

  const insulatedCrossbar = createChamferedBox({
    width: 0.34,
    height: 0.046,
    depth: 0.046,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.walnut,
  });
  insulatedCrossbar.position.y = 0.4;

  const handleNeck = createFilletedShaft({
    radius: 0.024,
    topRadius: 0.036,
    height: 0.16,
    baseCollarFlare: 0.008,
    neckCollarFlare: 0.01,
    anglageBevel: 0.006,
    radialSegments: 32,
    material: p.crimson,
  });
  handleNeck.rotation.x = Math.PI * 0.5;
  handleNeck.position.set(0, 0.4, 0.02);

  const handleKnob = createTurnedOrb({ radius: 0.048, material: p.crimson });
  handleKnob.position.set(0, 0.4, 0.195);

  throwPivot.add(insulatedCrossbar, handleNeck, handleKnob);
  boardGroup.add(throwPivot);
  sculpt.add(boardGroup);

  return (t) => {
    throwPivot.rotation.x = 0.48 + Math.sin(t * 1.9) * 0.18;
  };
}

/** #16 — Jeweler's Angled Brass Magnifying Loupe & Rolled Blueprint Scroll */
function buildSculpt_16_BlueprintLoupe(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Rolled Prussian-Blue Blueprint Cylinder Scroll resting cleanly in front-left (ZERO clipping!)
  const scrollGroup = new THREE.Group();
  scrollGroup.position.set(-0.07, 0.072, 0.115);
  scrollGroup.rotation.set(0, 0.28, Math.PI * 0.5);

  const paperRoll = createFilletedShaft({
    radius: 0.064,
    height: 0.42,
    hollowInnerRadius: 0.03,
    anglageBevel: 0.006,
    radialSegments: 48,
    centered: true,
    material: p.sapphireDeep,
  });
  for (const capY of [-0.19, 0, 0.19]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.011, 14, 40), p.gold);
    band.rotation.x = Math.PI * 0.5;
    band.position.y = capY;
    scrollGroup.add(band);
  }
  scrollGroup.add(paperRoll);

  // Sculpted brass rest socket on rear-right holding the magnifying glass handle cleanly
  const socketBase = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.088,
    innerRadius: 0.032,
    thickness: 0.044,
    material: p.gold,
  });
  socketBase.position.set(0.15, 0.022, -0.05);

  // Oversized Dramatic Brass Magnifying Glass angled proudly above the scroll!
  const loupeGroup = new THREE.Group();
  loupeGroup.position.set(-0.03, 0.53, -0.04);
  loupeGroup.rotation.set(-0.14, 0.16, 0.34);

  const lensRing = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.24,
    innerRadius: 0.18,
    thickness: 0.054,
    material: p.primary,
  });
  lensRing.rotation.x = Math.PI * 0.5;

  const convexLens = createTurnedOrb({
    radius: 0.185,
    heightScale: 0.3,
    radialSegments: 48,
    material: p.dichroic,
    castShadow: false,
  });
  convexLens.rotation.x = Math.PI * 0.5;

  const ferrule = createFilletedShaft({
    radius: 0.03,
    height: 0.075,
    anglageBevel: 0.005,
    radialSegments: 28,
    material: p.gold,
  });
  ferrule.position.y = -0.305;

  const handleGrip = createFilletedShaft({
    radius: 0.04,
    topRadius: 0.028,
    height: 0.26,
    baseCollarFlare: 0.012,
    neckCollarFlare: 0.008,
    anglageBevel: 0.008,
    radialSegments: 32,
    material: p.walnut,
  });
  handleGrip.position.y = -0.545;

  loupeGroup.add(lensRing, convexLens, ferrule, handleGrip);
  sculpt.add(scrollGroup, socketBase, loupeGroup);

  return (t) => {
    loupeGroup.rotation.z = 0.34 + Math.sin(t * 1.4) * 0.03;
  };
}

/** #17 — 1966 35mm Broadcast Iris Shutter Aperture & Spinning Film Sprocket Reel */
function buildSculpt_17_CameraShutter(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.14, 0.056, p.secondary, p.gold);

  const cy = 0.48;
  // Heavy knurled camera lens barrel
  const barrel = createFilletedShaft({
    radius: 0.245,
    topRadius: 0.265,
    height: 0.16,
    hollowInnerRadius: 0.195,
    anglageBevel: 0.01,
    radialSegments: 56,
    centered: true,
    material: p.secondary,
  });
  barrel.rotation.x = Math.PI * 0.5;
  barrel.position.y = cy;

  const frontRing = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.285,
    innerRadius: 0.205,
    thickness: 0.058,
    material: p.primary,
  });
  frontRing.rotation.x = Math.PI * 0.5;
  frontRing.position.set(0, cy, 0.055);

  // 6 overlapping sculpted curved iris shutter blades!
  const irisGroup = new THREE.Group();
  irisGroup.position.set(0, cy, 0.052);
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0.05, 0.02);
  bladeShape.quadraticCurveTo(0.16, 0.06, 0.195, 0.14);
  bladeShape.lineTo(0.14, 0.18);
  bladeShape.quadraticCurveTo(0.06, 0.11, 0.05, 0.02);
  const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });

  for (let b = 0; b < 6; b++) {
    const blade = new THREE.Mesh(bladeGeom, b % 2 === 0 ? p.gold : p.chrome);
    blade.rotation.z = (b / 6) * Math.PI * 2;
    irisGroup.add(blade);
  }

  const eyeLens = createTurnedOrb({
    radius: 0.095,
    heightScale: 0.5,
    material: p.dichroic,
  });
  eyeLens.rotation.x = Math.PI * 0.5;
  eyeLens.position.set(0, cy, 0.025);

  // Offset spinning 35mm movie film reel perched behind top-right!
  const reelGroup = new THREE.Group();
  reelGroup.position.set(0.21, 0.68, -0.09);
  const reelDisc = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.145,
    innerRadius: 0.036,
    thickness: 0.036,
    material: p.gold,
  });
  reelDisc.rotation.x = Math.PI * 0.5;
  reelGroup.add(reelDisc);
  for (let h = 0; h < 5; h++) {
    const a = (h / 5) * Math.PI * 2;
    const pip = createTurnedOrb({ radius: 0.02, material: p.crimson });
    pip.position.set(Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0.02);
    reelGroup.add(pip);
  }

  sculpt.add(barrel, frontRing, irisGroup, eyeLens, reelGroup);
  return (t, dt) => {
    reelGroup.rotation.z -= dt * 0.9;
    irisGroup.rotation.z = Math.sin(t * 1.8) * 0.22;
  };
}

/** #18 — Solari Split-Flap Sunrise Championship Half-Crown Diadem */
function buildSculpt_18_SplitFlapCrown(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Twin winged fluted Art-Deco risers supporting a sweeping sunrise arc of 6 Solari flaps!
  const baseBar = createChamferedBox({
    width: 0.42,
    height: 0.085,
    depth: 0.14,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    cornerRadius: 0.02,
    material: p.secondary,
  });
  baseBar.position.y = 0.048;

  const diademArc = createChamferedArch({
    innerRadius: 0.16,
    outerRadius: 0.245,
    depth: 0.068,
    arcAngle: Math.PI * 1.04,
    startAngle: -Math.PI * 0.02,
    material: p.primary,
  });
  diademArc.position.y = 0.14;

  // 6 radiating dual-tone Solari Split-Flap tablets anchored cleanly via brass radial struts!
  const flapPivots: THREE.Group[] = [];
  for (let f = 0; f < 6; f++) {
    const angle = Math.PI * 0.1 + (f / 5) * Math.PI * 0.8;
    const fx = Math.cos(angle) * 0.24;
    const fy = 0.15 + Math.sin(angle) * 0.24;

    const pivot = new THREE.Group();
    pivot.position.set(fx, fy, 0);
    pivot.rotation.z = angle - Math.PI * 0.5;

    const strut = createFilletedShaft({
      radius: 0.014,
      height: 0.095,
      anglageBevel: 0.004,
      radialSegments: 16,
      material: p.gold,
    });
    const lowerFlap = createChamferedBox({
      width: 0.094,
      height: 0.056,
      depth: 0.028,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.manila,
    });
    lowerFlap.position.y = 0.088;
    const upperFlap = createChamferedBox({
      width: 0.094,
      height: 0.058,
      depth: 0.028,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: f % 2 === 0 ? p.emerald : p.sapphireDeep,
    });
    upperFlap.position.y = 0.148;

    const splitBar = createFilletedShaft({
      radius: 0.008,
      height: 0.106,
      anglageBevel: 0.003,
      radialSegments: 14,
      centered: true,
      material: p.gold,
    });
    splitBar.rotation.z = Math.PI * 0.5;
    splitBar.position.set(0, 0.118, 0.012);

    pivot.add(strut, lowerFlap, upperFlap, splitBar);
    sculpt.add(pivot);
    flapPivots.push(pivot);
  }

  // Central rising chrome chevron spire & crowning emerald gem
  const centerSpire = createFilletedShaft({
    radius: 0.044,
    topRadius: 0.012,
    height: 0.38,
    anglageBevel: 0.006,
    radialSegments: 32,
    material: p.gold,
  });
  centerSpire.position.y = 0.16;
  const centerGem = createTurnedOrb({ radius: 0.058, material: p.dichroic });
  centerGem.position.y = 0.36;

  sculpt.add(baseBar, diademArc, centerSpire, centerGem);
  return (t) => {
    for (let i = 0; i < flapPivots.length; i++) {
      flapPivots[i].rotation.x = Math.sin(t * 2.4 + i * 0.7) * 0.12;
    }
  };
}

/** #19 — Tilted 1969 Monte Carlo Roulette Bowl w/ Spinning 4-Arm Turret & Orbiting Ivory Ball */
function buildSculpt_19_MonteCarloRoulette(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Low heavy sculpted pedestal cradle
  const cradleStem = createFilletedShaft({
    radius: 0.105,
    topRadius: 0.075,
    height: 0.17,
    baseCollarFlare: 0.045,
    neckCollarFlare: 0.025,
    anglageBevel: 0.008,
    radialSegments: 48,
    material: p.walnut,
  });

  const tiltedBowl = new THREE.Group();
  tiltedBowl.position.set(0, 0.44, 0);
  tiltedBowl.rotation.x = 0.68;

  // Concave lathe-turned walnut & brass roulette dish
  const dishPts = [
    new THREE.Vector2(0.0, -0.05),
    new THREE.Vector2(0.18, -0.045),
    new THREE.Vector2(0.32, 0.01),
    new THREE.Vector2(0.355, 0.088),
    new THREE.Vector2(0.328, 0.105),
    new THREE.Vector2(0.285, 0.055),
    new THREE.Vector2(0.18, 0.018),
    new THREE.Vector2(0.0, 0.012),
  ];
  const dishGeom = new THREE.LatheGeometry(dishPts, 56);
  dishGeom.computeVertexNormals();
  const dish = new THREE.Mesh(dishGeom, p.walnut);

  const outerRim = createSmoothBeveledRing({
    innerRadius: 0.3,
    outerRadius: 0.362,
    thickness: 0.032,
    material: p.gold,
  });
  outerRim.position.y = 0.09;

  // Spinning inner pocket rotor: 12 alternating Crimson / Obsidian + Emerald Zero pockets!
  const rotorGroup = new THREE.Group();
  rotorGroup.position.y = 0.034;

  const pocketBed = createFilletedShaft({
    radius: 0.258,
    height: 0.026,
    anglageBevel: 0.005,
    radialSegments: 48,
    centered: true,
    material: p.gold,
  });
  rotorGroup.add(pocketBed);

  for (let w = 0; w < 12; w++) {
    const a = (w / 12) * Math.PI * 2;
    const pocketMat = w === 0 ? p.emerald : w % 2 === 0 ? p.crimson : p.obsidian;
    const pocketBlock = createChamferedBox({
      width: 0.088,
      height: 0.028,
      depth: 0.082,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: pocketMat,
    });
    pocketBlock.position.set(Math.cos(a) * 0.2, 0.016, Math.sin(a) * 0.2);
    pocketBlock.rotation.y = -a;
    rotorGroup.add(pocketBlock);
  }

  const innerRing = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.15,
    innerRadius: 0.055,
    thickness: 0.046,
    material: p.gold,
  });

  const turretPost = createFilletedShaft({
    radius: 0.048,
    topRadius: 0.022,
    height: 0.19,
    anglageBevel: 0.006,
    radialSegments: 36,
    material: p.primary,
  });
  const turretFinial = createTurnedOrb({ radius: 0.036, material: p.gold });
  turretFinial.position.y = 0.195;

  for (let arm = 0; arm < 4; arm++) {
    const a = (arm / 4) * Math.PI * 2;
    const spoke = createFilletedShaft({
      radius: 0.012,
      height: 0.14,
      anglageBevel: 0.003,
      radialSegments: 16,
      material: p.gold,
    });
    spoke.rotation.z = Math.PI * 0.5;
    spoke.rotation.y = a;
    spoke.position.set(Math.cos(a) * 0.02, 0.125, -Math.sin(a) * 0.02);
    const knob = createTurnedOrb({ radius: 0.022, material: p.gold });
    knob.position.set(Math.cos(a) * 0.15, 0.125, -Math.sin(a) * 0.15);
    rotorGroup.add(spoke, knob);
  }
  rotorGroup.add(innerRing, turretPost, turretFinial);

  // Orbiting ivory/pearl ball riding counter-clockwise around the outer track!
  const ballOrbit = new THREE.Group();
  const ivoryBall = createTurnedOrb({ radius: 0.026, material: p.chrome });
  ivoryBall.position.set(0.285, 0.072, 0);
  ballOrbit.add(ivoryBall);

  tiltedBowl.add(dish, outerRim, rotorGroup, ballOrbit);
  sculpt.add(cradleStem, tiltedBowl);

  return (_t, dt) => {
    rotorGroup.rotation.y += dt * 0.9;
    ballOrbit.rotation.y -= dt * 2.1;
  };
}

/** #20 — 1964–65 Flushing Meadows World's Fair Unisphere & Orbiting Sputnik Satellites */
function buildSculpt_20_WorldsFairUnisphere(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Grounded Flushing Meadows Reflecting Pool Basin seated flush at y = 0.0!
  const poolRim = createSmoothBeveledRing({
    innerRadius: 0.165,
    outerRadius: 0.235,
    thickness: 0.044,
    material: p.gold,
  });
  poolRim.position.y = 0.022;
  const poolWater = createFilletedShaft({
    radius: 0.175,
    height: 0.028,
    anglageBevel: 0.005,
    radialSegments: 48,
    material: p.sapphireDeep,
  });
  poolWater.position.y = 0.006;
  const centerPed = createFilletedShaft({
    radius: 0.055,
    topRadius: 0.036,
    height: 0.25,
    baseCollarFlare: 0.025,
    anglageBevel: 0.006,
    radialSegments: 32,
    material: p.chrome,
  });
  sculpt.add(poolRim, poolWater, centerPed);

  // Iconic Space-Age 3-fin curved parabolic tripod fountain supports anchored into the pool!
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const fin = createChamferedArch({
      innerRadius: 0.11,
      outerRadius: 0.162,
      depth: 0.028,
      arcAngle: Math.PI * 0.72,
      startAngle: Math.PI * 0.04,
      material: p.chrome,
    });
    fin.position.y = 0.02;
    fin.rotation.y = a;
    sculpt.add(fin);
  }

  const cy = 0.48;
  // Unisphere open stainless-steel latitude/longitude wire-cage sphere!
  const latticeGroup = new THREE.Group();
  latticeGroup.position.y = cy;

  const coreGem = createTurnedOrb({ radius: 0.115, material: p.dichroic });
  latticeGroup.add(coreGem);

  for (let m = 0; m < 4; m++) {
    const mer = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.011, 14, 56), p.chrome);
    mer.rotation.y = (m / 4) * Math.PI;
    latticeGroup.add(mer);
  }
  for (const latY of [-0.11, 0, 0.11]) {
    const latR = Math.sqrt(Math.max(0.01, 0.22 * 0.22 - latY * latY));
    const lat = new THREE.Mesh(new THREE.TorusGeometry(latR, 0.009, 12, 48), p.gold);
    lat.rotation.x = Math.PI * 0.5;
    lat.position.y = latY;
    latticeGroup.add(lat);
  }

  // 3 tilted intersecting orbital satellite rings with tiny orbiting gold Sputnik pearls!
  const satOrbits: THREE.Group[] = [];
  const tilts: readonly [number, number, number][] = [
    [0.58, 0.2, 0.3],
    [-0.64, 1.1, -0.22],
    [0.32, 2.2, 0.72],
  ];
  for (let o = 0; o < 3; o++) {
    const og = new THREE.Group();
    og.position.y = cy;
    og.rotation.set(...tilts[o]);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.31 - o * 0.018, 0.01, 12, 60),
      o === 0 ? p.primary : p.gold,
    );
    const sat = createTurnedOrb({ radius: 0.025, material: p.glow });
    sat.position.set(0.31 - o * 0.018, 0, 0);
    og.add(ring, sat);
    sculpt.add(og);
    satOrbits.push(og);
  }

  sculpt.add(latticeGroup);
  return (_t, dt) => {
    latticeGroup.rotation.y += dt * 0.4;
    satOrbits[0].rotation.z += dt * 0.85;
    satOrbits[1].rotation.z -= dt * 0.7;
    satOrbits[2].rotation.z += dt * 0.6;
  };
}

/** #21 — Channel 83 50kW Offshore Vacuum Klystron Tube, Helical RF Coil & UHF Dipole */
function buildSculpt_21_PirateKlystron(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Stacked ribbed copper-gold RF resonator cooling cavities seated on a flared deck
  for (let c = 0; c < 4; c++) {
    const fin = createNotchedBezel({
      notchShape: 'VERNIER',
      outerRadius: 0.215 - c * 0.018,
      innerRadius: 0.08,
      thickness: 0.032,
      bevel: 0.006,
      material: c % 2 === 0 ? p.primary : p.secondary,
    });
    fin.position.y = 0.04 + c * 0.068;
    sculpt.add(fin);
  }

  const centralCore = createFilletedShaft({
    radius: 0.1,
    height: 0.28,
    anglageBevel: 0.006,
    radialSegments: 36,
    material: p.chrome,
  });

  // Helical gold waveguide coil spiraling tightly around the vacuum glass tube
  const helixPts: THREE.Vector3[] = [];
  const steps = 44;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * Math.PI * 6.0;
    helixPts.push(new THREE.Vector3(Math.cos(a) * 0.158, 0.31 + t * 0.32, Math.sin(a) * 0.158));
  }
  const helix = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), 56, 0.013, 12, false),
    p.gold,
  );

  // Tall borosilicate vacuum envelope + glowing violet/peacock plasma cathode inside
  const bulb = createTurnedOrb({
    radius: 0.132,
    heightScale: 1.55,
    radialSegments: 48,
    material: p.glass,
    castShadow: false,
  });
  bulb.position.y = 0.48;

  const cathode = createFilletedShaft({
    radius: 0.056,
    topRadius: 0.042,
    height: 0.24,
    anglageBevel: 0.008,
    radialSegments: 32,
    centered: true,
    material: p.glow,
  });
  cathode.position.y = 0.48;

  // Spinning top UHF bowtie dipole antenna halo!
  const antennaGroup = new THREE.Group();
  antennaGroup.position.y = 0.72;
  const mast = createFilletedShaft({
    radius: 0.02,
    height: 0.09,
    anglageBevel: 0.004,
    radialSegments: 20,
    material: p.gold,
  });
  const uhfRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.011, 14, 48), p.chrome);
  uhfRing.rotation.x = Math.PI * 0.5;
  uhfRing.position.y = 0.05;
  const dipoleBar = createFilletedShaft({
    radius: 0.011,
    height: 0.36,
    anglageBevel: 0.003,
    radialSegments: 16,
    centered: true,
    material: p.gold,
  });
  dipoleBar.rotation.z = Math.PI * 0.5;
  dipoleBar.position.y = 0.05;
  antennaGroup.add(mast, uhfRing, dipoleBar);

  sculpt.add(centralCore, helix, bulb, cathode, antennaGroup);
  return (_t, dt) => {
    antennaGroup.rotation.y += dt * 1.15;
  };
}

/** #22 — Sculpted 24K Broadcast Laurel Wreath Framing a Floating VIP Enamel Crest */
function buildSculpt_22_LaurelWreath(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Sculpted ceremonial tie-bow base resting directly on the velvet cushion
  const bowCenter = createTurnedOrb({ radius: 0.055, heightScale: 0.78, material: p.crimson });
  bowCenter.position.y = 0.09;
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.018, 12, 32), p.crimson);
    loop.position.set(side * 0.085, 0.09, 0.015);
    loop.rotation.set(0.2, side * 0.4, side * 0.3);
    sculpt.add(loop);
  }

  const cy = 0.44;
  // Twin sweeping golden boughs forming an unmistakable open circular Laurel Wreath!
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.036, 0.045, 0, 0.115);
  leafShape.quadraticCurveTo(-0.036, 0.045, 0, 0);
  const leafGeom = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
  leafGeom.translate(0, 0, -0.007);
  leafGeom.computeVertexNormals();

  for (const side of [-1, 1]) {
    const boughPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const a = -Math.PI * 0.48 + t * Math.PI * 0.88;
      boughPts.push(new THREE.Vector3(side * Math.cos(a) * 0.27, cy + Math.sin(a) * 0.32, 0));
    }
    const bough = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(boughPts), 28, 0.015, 12, false),
      p.gold,
    );
    sculpt.add(bough);

    // 8 paired angled golden laurel leaves sprouting along each bough!
    for (let l = 1; l <= 8; l++) {
      const t = l / 9;
      const a = -Math.PI * 0.46 + t * Math.PI * 0.84;
      const bx = side * Math.cos(a) * 0.27;
      const by = cy + Math.sin(a) * 0.32;
      for (const tilt of [-0.45, 0.45]) {
        const leaf = new THREE.Mesh(leafGeom, l % 2 === 0 ? p.primary : p.gold);
        leaf.position.set(bx, by, tilt * 0.025);
        leaf.rotation.z = side * (a - Math.PI * 0.5) + tilt;
        leaf.rotation.y = tilt * 0.6;
        sculpt.add(leaf);
      }
    }
  }

  // Floating rotating VIP Diamond Medallion inside the open wreath!
  const vipCrest = new THREE.Group();
  vipCrest.position.y = cy;
  const diamondShape = new THREE.Shape();
  diamondShape.moveTo(0, 0.165);
  diamondShape.lineTo(0.125, 0);
  diamondShape.lineTo(0, -0.165);
  diamondShape.lineTo(-0.125, 0);
  diamondShape.closePath();
  const diamondGeom = new THREE.ExtrudeGeometry(diamondShape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  });
  diamondGeom.translate(0, 0, -0.016);
  const diamondMesh = new THREE.Mesh(diamondGeom, p.dichroic);
  const innerStar = createSculptedStarburstMini({
    radius: 0.095,
    rays: 8,
    depth: 0.044,
    primaryMat: p.gold,
    accentMat: p.emerald,
  });
  vipCrest.add(diamondMesh, innerStar);

  sculpt.add(bowCenter, vipCrest);
  return (t) => {
    vipCrest.position.y = cy + Math.sin(t * 2.1) * 0.02;
    vipCrest.rotation.y = Math.sin(t * 1.3) * 0.25;
  };
}

/** #23 — Miniature 1966 Mole-Richardson Studio Fresnel Spotlight w/ 4 Hinged Barn-Doors */
function buildSculpt_23_FresnelSpotlight(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.16, 0.052, p.chrome, p.gold);

  // Heavy studio U-yoke stirrup
  const yoke = createChamferedArch({
    innerRadius: 0.195,
    outerRadius: 0.238,
    depth: 0.042,
    arcAngle: Math.PI * 1.12,
    startAngle: -Math.PI * 0.06,
    material: p.gold,
  });
  yoke.position.y = 0.44;
  yoke.rotation.z = Math.PI;

  // Tilted finned cylindrical lamp housing + stepped Fresnel glass + 4 angled barn-doors!
  const lampGroup = new THREE.Group();
  lampGroup.position.y = 0.46;
  lampGroup.rotation.x = -0.22;

  const housing = createFilletedShaft({
    radius: 0.165,
    topRadius: 0.175,
    height: 0.29,
    baseCollarFlare: 0.016,
    neckCollarFlare: 0.018,
    anglageBevel: 0.01,
    radialSegments: 48,
    centered: true,
    material: p.studioBlack,
  });
  housing.rotation.x = Math.PI * 0.5;
  lampGroup.add(housing);

  // 4 gleaming 24K gold heat-sink cooling rib rings around the matte charcoal lamp barrel!
  for (let r = -1; r <= 2; r++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.182, 0.011, 12, 40), p.gold);
    rib.position.z = r * 0.06 - 0.03;
    lampGroup.add(rib);
  }

  // Concentric stepped crystal Fresnel bullseye lens glowing warm amber
  const lensCore = createTurnedOrb({ radius: 0.145, heightScale: 0.38, hemiOnly: true, material: p.glow });
  lensCore.rotation.x = Math.PI * 0.5;
  lensCore.position.z = 0.145;
  for (const fr of [0.058, 0.105, 0.142]) {
    const fRing = new THREE.Mesh(new THREE.TorusGeometry(fr, 0.0085, 12, 40), p.gold);
    fRing.position.z = 0.162;
    lampGroup.add(fRing);
  }
  lampGroup.add(lensCore);

  // 4 authentic matte-black Mole-Richardson Barn-Door Flaps edged in gold splayed forward!
  const flapAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  for (const fa of flapAngles) {
    const flapPivot = new THREE.Group();
    flapPivot.rotation.z = fa;
    const flap = createChamferedBox({
      width: 0.23,
      height: 0.145,
      depth: 0.02,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.studioBlack,
    });
    flap.position.set(0, 0.23, 0.22);
    flap.rotation.x = 0.62;
    const trim = createChamferedBox({
      width: 0.24,
      height: 0.022,
      depth: 0.024,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.gold,
    });
    trim.position.set(0, 0.285, 0.258);
    trim.rotation.x = 0.62;
    flapPivot.add(flap, trim);
    lampGroup.add(flapPivot);
  }

  sculpt.add(yoke, lampGroup);
  return (t) => {
    lampGroup.rotation.x = -0.22 + Math.sin(t * 1.6) * 0.07;
  };
}

/** #24 — Sleuth's 3-Pin Red-Yarn Conspiracy Triad Evidence Board & Detective Badge */
function buildSculpt_24_ConspiracyLasso(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Tilted beveled walnut & brass detective corkboard tablet resting on studio easel feet
  const boardGroup = new THREE.Group();
  boardGroup.position.set(0, 0.41, 0);
  boardGroup.rotation.x = -0.22;

  const frame = createChamferedBox({
    width: 0.54,
    height: 0.46,
    depth: 0.056,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    cornerRadius: 0.022,
    material: p.gold,
  });
  const corkField = createChamferedBox({
    width: 0.46,
    height: 0.38,
    depth: 0.036,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.walnut,
  });
  corkField.position.z = 0.018;
  boardGroup.add(frame, corkField);

  // 3 Crimson-Pinned Triad Clue Cards linked by red yarn + 1 unlinked silver-pinned decoy!
  const pinCoords: readonly [number, number, boolean][] = [
    [-0.14, 0.105, true],
    [0.14, 0.115, true],
    [-0.08, -0.105, true],
    [0.145, -0.105, false],
  ];
  const yarnPts: THREE.Vector3[] = [];
  for (let i = 0; i < pinCoords.length; i++) {
    const [px, py, isTriad] = pinCoords[i];
    const card = createChamferedBox({
      width: 0.135,
      height: 0.1,
      depth: 0.02,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.manila,
    });
    card.position.set(px, py, 0.044);
    card.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.09;

    const pinStem = createFilletedShaft({
      radius: 0.01,
      height: 0.055,
      anglageBevel: 0.003,
      radialSegments: 16,
      material: p.gold,
    });
    pinStem.rotation.x = Math.PI * 0.5;
    pinStem.position.set(px, py + 0.022, 0.045);

    const pinCap = createTurnedOrb({ radius: 0.034, material: isTriad ? p.crimson : p.chrome });
    pinCap.position.set(px, py + 0.022, 0.102);

    boardGroup.add(card, pinStem, pinCap);
    if (isTriad) {
      yarnPts.push(new THREE.Vector3(px, py + 0.022, 0.088));
    }
  }
  // Close the 3-card detective triad triangle loop in bold crimson cord!
  yarnPts.push(yarnPts[0].clone());
  const yarnLoop = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(yarnPts, false, 'catmullrom', 0.12), 48, 0.013, 10, false),
    p.crimson,
  );

  // Brass detective star crest crowning the top frame
  const topStar = createSculptedStarburstMini({
    radius: 0.11,
    rays: 6,
    depth: 0.034,
    primaryMat: p.gold,
    accentMat: p.crimson,
  });
  topStar.position.set(0, 0.27, 0.02);

  // Grounded brass studio easel crossbar + twin front & rear easel legs flush at y = 0.0!
  const easelBar = createChamferedBox({
    width: 0.42,
    height: 0.036,
    depth: 0.16,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.gold,
  });
  easelBar.position.set(0, 0.018, 0.0);
  sculpt.add(easelBar);
  for (const sx of [-0.16, 0.16]) {
    const foot = createFilletedShaft({
      radius: 0.022,
      height: 0.36,
      anglageBevel: 0.005,
      radialSegments: 20,
      material: p.gold,
    });
    foot.position.set(sx, 0.015, -0.05);
    foot.rotation.x = 0.2;
    sculpt.add(foot);
  }

  boardGroup.add(yarnLoop, topStar);
  sculpt.add(boardGroup);
  return (t) => {
    topStar.rotation.z = Math.sin(t * 2.0) * 0.14;
  };
}

/** #25 — Jagged 1966 Atomic Lightning Bolt Piercing a Split-Second Studio Stopwatch */
function buildSculpt_25_LightningBolt(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Compact studio stopwatch cradle seated flush on cushion
  const cradle = createChamferedBox({
    width: 0.26,
    height: 0.068,
    depth: 0.16,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    cornerRadius: 0.018,
    material: p.walnut,
  });
  cradle.position.y = 0.036;
  sculpt.add(cradle);

  // Brushed-chrome & deep-sapphire split-second studio chronograph stopwatch
  const watchGroup = new THREE.Group();
  watchGroup.position.set(-0.04, 0.35, -0.02);
  watchGroup.rotation.set(-0.14, 0.14, 0.1);

  const watchRing = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.268,
    innerRadius: 0.205,
    thickness: 0.072,
    material: p.chrome,
  });
  watchRing.rotation.x = Math.PI * 0.5;

  const watchFace = createFilletedShaft({
    radius: 0.215,
    height: 0.04,
    anglageBevel: 0.006,
    radialSegments: 48,
    centered: true,
    material: p.sapphireDeep,
  });
  watchFace.rotation.x = Math.PI * 0.5;

  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const pip = createTurnedOrb({ radius: h % 3 === 0 ? 0.016 : 0.01, material: p.gold });
    pip.position.set(Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0.028);
    watchGroup.add(pip);
  }

  for (const a of [-0.52, 0, 0.52]) {
    const pusher = createFilletedShaft({
      radius: a === 0 ? 0.032 : 0.022,
      topRadius: a === 0 ? 0.042 : 0.028,
      height: a === 0 ? 0.095 : 0.075,
      anglageBevel: 0.005,
      radialSegments: 24,
      material: a === 0 ? p.gold : p.crimson,
    });
    pusher.position.set(Math.sin(a) * 0.275, Math.cos(a) * 0.275, 0);
    pusher.rotation.z = -a;
    watchGroup.add(pusher);
  }

  const secHand = new THREE.Group();
  secHand.position.z = 0.04;
  const handBlade = createFilletedShaft({
    radius: 0.01,
    topRadius: 0.004,
    height: 0.185,
    anglageBevel: 0.003,
    radialSegments: 14,
    material: p.crimson,
  });
  secHand.add(handBlade);
  watchGroup.add(watchRing, watchFace, secHand);

  // Sleek, razor-sharp 3-zig Atomic 24K Gold Lightning Bolt slicing diagonally past the dial!
  const boltShape = new THREE.Shape();
  boltShape.moveTo(0.16, 0.82);
  boltShape.lineTo(0.01, 0.53);
  boltShape.lineTo(0.11, 0.52);
  boltShape.lineTo(-0.07, 0.25);
  boltShape.lineTo(0.03, 0.24);
  boltShape.lineTo(-0.12, 0.04);
  boltShape.lineTo(0.13, 0.31);
  boltShape.lineTo(0.03, 0.32);
  boltShape.lineTo(0.21, 0.58);
  boltShape.lineTo(0.12, 0.59);
  boltShape.lineTo(0.24, 0.8);
  boltShape.closePath();
  const boltGeom = new THREE.ExtrudeGeometry(boltShape, {
    depth: 0.038,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.009,
    bevelSegments: 3,
  });
  boltGeom.translate(0, 0, -0.019);
  boltGeom.computeVertexNormals();
  const boltMesh = new THREE.Mesh(boltGeom, p.gold);
  boltMesh.position.set(0.09, 0.02, 0.075);

  sculpt.add(watchGroup, boltMesh);
  return (_t, dt) => {
    secHand.rotation.z -= dt * 3.2;
  };
}

/** #26 — Ornate Ceremonial Brass Skeleton Key to Studio 6A */
function buildSculpt_26_GoldenExitKey(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Low notched presentation collar gripping the standing ceremonial key
  const keyHolder = createNotchedBezel({
    notchShape: 'HEX',
    outerRadius: 0.16,
    innerRadius: 0.045,
    thickness: 0.04,
    material: p.secondary,
  });
  keyHolder.position.y = 0.02;

  const keyGroup = new THREE.Group();
  keyGroup.position.y = 0.03;

  // Fluted vertical key barrel shaft with decorative mid-rings
  const barrel = createFilletedShaft({
    radius: 0.034,
    topRadius: 0.03,
    height: 0.54,
    baseCollarFlare: 0.022,
    neckCollarFlare: 0.024,
    anglageBevel: 0.007,
    radialSegments: 40,
    material: p.primary,
  });
  for (const ry of [0.16, 0.36, 0.5]) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.012, 12, 32), p.gold);
    collar.rotation.x = Math.PI * 0.5;
    collar.position.y = ry;
    keyGroup.add(collar);
  }

  // Precision step-notched Studio 6A ward bit teeth jutting sharply right!
  const bitBlock = createChamferedBox({
    width: 0.165,
    height: 0.18,
    depth: 0.038,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.gold,
  });
  bitBlock.position.set(0.11, 0.18, 0);
  const toothUpper = createChamferedBox({
    width: 0.09,
    height: 0.055,
    depth: 0.048,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.chrome,
  });
  toothUpper.position.set(0.16, 0.255, 0);
  const toothLower = createChamferedBox({
    width: 0.08,
    height: 0.055,
    depth: 0.048,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.chrome,
  });
  toothLower.position.set(0.155, 0.115, 0);

  // Ornate Trefoil Art-Deco Bow Handle crowning the top of the key!
  const bowOuter = createNotchedBezel({
    notchShape: 'WAX_SEAL',
    outerRadius: 0.215,
    innerRadius: 0.125,
    thickness: 0.052,
    material: p.primary,
  });
  bowOuter.rotation.x = Math.PI * 0.5;
  bowOuter.position.y = 0.68;

  for (const sx of [-0.145, 0.145]) {
    const lobe = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.016, 12, 32), p.gold);
    lobe.position.set(sx, 0.65, 0);
    keyGroup.add(lobe);
  }
  const bowGem = createTurnedOrb({ radius: 0.074, heightScale: 0.72, material: p.dichroic });
  bowGem.rotation.x = Math.PI * 0.5;
  bowGem.position.y = 0.68;

  keyGroup.add(barrel, bitBlock, toothUpper, toothLower, bowOuter, bowGem);
  sculpt.add(keyHolder, keyGroup);

  return (t) => {
    bowGem.scale.setScalar(1.0 + Math.sin(t * 2.4) * 0.05);
  };
}

/** #27 — Hour-Eleven Coup Twin-Column Portal Arch, 11-O'Clock Dial & Swinging Pendulum */
function buildSculpt_27_HourElevenClock(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Twin fluted Corinthian-Moderne columns on a grand stepped threshold
  const threshold = createChamferedBox({
    width: 0.54,
    height: 0.06,
    depth: 0.22,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    cornerRadius: 0.02,
    material: p.secondary,
  });
  threshold.position.y = 0.032;

  for (const px of [-0.23, 0.23]) {
    const col = createFilletedShaft({
      radius: 0.036,
      topRadius: 0.032,
      height: 0.44,
      baseCollarFlare: 0.02,
      neckCollarFlare: 0.02,
      anglageBevel: 0.007,
      radialSegments: 36,
      material: p.primary,
    });
    col.position.set(px, 0.055, 0);
    sculpt.add(col);
  }

  const arch = createChamferedArch({
    innerRadius: 0.195,
    outerRadius: 0.275,
    depth: 0.072,
    material: p.primary,
  });
  arch.position.y = 0.48;

  // Keystone 11-o'clock golden dial face crowning the arch apex
  const clockRim = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.11,
    innerRadius: 0.068,
    thickness: 0.052,
    bevel: 0.006,
    material: p.gold,
  });
  clockRim.rotation.x = Math.PI * 0.5;
  clockRim.position.set(0, 0.72, 0.03);
  const clockFace = createFilletedShaft({
    radius: 0.075,
    height: 0.036,
    anglageBevel: 0.004,
    radialSegments: 32,
    centered: true,
    material: p.jewel,
  });
  clockFace.rotation.x = Math.PI * 0.5;
  clockFace.position.set(0, 0.72, 0.03);

  // Swinging ceremonial wax-seal pendulum beneath the arch!
  const pendPivot = new THREE.Group();
  pendPivot.position.set(0, 0.65, 0);
  const rod = createFilletedShaft({
    radius: 0.014,
    height: 0.36,
    anglageBevel: 0.004,
    radialSegments: 20,
    material: p.gold,
  });
  rod.position.y = -0.36;
  const bobSeal = createNotchedBezel({
    notchShape: 'WAX_SEAL',
    outerRadius: 0.125,
    innerRadius: 0.032,
    thickness: 0.054,
    material: p.crimson,
  });
  bobSeal.rotation.x = Math.PI * 0.5;
  bobSeal.position.y = -0.37;
  const bobCore = createTurnedOrb({ radius: 0.048, material: p.gold });
  bobCore.position.y = -0.37;

  pendPivot.add(rod, bobSeal, bobCore);
  sculpt.add(threshold, arch, clockRim, clockFace, pendPivot);

  return (t) => {
    pendPivot.rotation.z = Math.sin(t * 2.4) * 0.19;
  };
}

/** #28 — Roz Korman's Pharma Canopy Twin-Helix Crystal Caduceus & Swept Sponsor Wings */
function buildSculpt_28_PharmaCaduceus(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  addTurnedFootStem(sculpt, 0.13, 0.058, p.gold, p.secondary);

  // Tall faceted cyan-dichroic central crystal staff
  const staff = createFilletedShaft({
    radius: 0.044,
    topRadius: 0.032,
    height: 0.66,
    baseCollarFlare: 0.016,
    neckCollarFlare: 0.014,
    anglageBevel: 0.008,
    radialSegments: 8, // crisply octagonal faceted crystal rod!
    material: p.dichroic,
  });
  staff.position.y = 0.12;

  // Dual counter-intertwining golden caduceus DNA/serpent helices!
  for (const phase of [0, Math.PI]) {
    const pts: THREE.Vector3[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = phase + t * Math.PI * 4.5;
      const r = 0.125 * (0.65 + 0.35 * Math.sin(t * Math.PI));
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0.18 + t * 0.46, Math.sin(a) * r));
    }
    const ribbon = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.017, 12, false),
      phase === 0 ? p.gold : p.chrome,
    );
    sculpt.add(ribbon);
  }

  // Swept Art-Deco aluminum/gold wings spreading heroically near the summit!
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.quadraticCurveTo(0.14, 0.11, 0.34, 0.125);
  wingShape.lineTo(0.28, 0.045);
  wingShape.lineTo(0.24, 0.015);
  wingShape.lineTo(0.18, -0.025);
  wingShape.quadraticCurveTo(0.08, -0.04, 0, -0.055);
  wingShape.closePath();
  const wingGeom = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.007,
    bevelSegments: 2,
  });
  wingGeom.translate(0, 0, -0.012);
  wingGeom.computeVertexNormals();

  const wingsGroup = new THREE.Group();
  wingsGroup.position.y = 0.65;
  const rightWing = new THREE.Mesh(wingGeom, p.primary);
  const leftWing = new THREE.Mesh(wingGeom, p.primary);
  leftWing.scale.x = -1;
  wingsGroup.add(rightWing, leftWing);

  const apexOrb = createTurnedOrb({ radius: 0.062, material: p.glow });
  apexOrb.position.y = 0.78;

  sculpt.add(staff, wingsGroup, apexOrb);
  return (t) => {
    wingsGroup.rotation.y = Math.sin(t * 1.6) * 0.08;
  };
}

/** #29 — 1966 Empire State Broadcast Needle Tower & Pulsing Signal Wave Halos */
function buildSculpt_29_BroadcastTower(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Grounded circular foundation plate + 4 Eiffel-Moderne curved steel lattice legs!
  const towerPad = createSmoothBeveledRing({
    innerRadius: 0.14,
    outerRadius: 0.24,
    thickness: 0.036,
    material: p.gold,
  });
  towerPad.position.y = 0.018;
  sculpt.add(towerPad);

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
    const nextA = ((i + 1) / 4) * Math.PI * 2 + Math.PI * 0.25;
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(a) * 0.21, 0.015, Math.sin(a) * 0.21),
      new THREE.Vector3(Math.cos(a) * 0.12, 0.24, Math.sin(a) * 0.12),
      new THREE.Vector3(Math.cos(a) * 0.055, 0.5, Math.sin(a) * 0.055),
    ]);
    const leg = new THREE.Mesh(
      new THREE.TubeGeometry(legCurve, 20, 0.018, 12, false),
      p.primary,
    );
    // Diagonal steel truss cross-brace between adjacent legs!
    const brace = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(a) * 0.185, 0.07, Math.sin(a) * 0.185),
          new THREE.Vector3(Math.cos(nextA) * 0.12, 0.25, Math.sin(nextA) * 0.12),
        ]),
        8,
        0.009,
        8,
        false,
      ),
      p.chrome,
    );
    sculpt.add(leg, brace);
  }

  const lowerDeck = createNotchedBezel({
    notchShape: 'HEX',
    outerRadius: 0.16,
    innerRadius: 0.06,
    thickness: 0.036,
    material: p.gold,
  });
  lowerDeck.position.y = 0.26;
  const upperDeck = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.12,
    innerRadius: 0.04,
    thickness: 0.038,
    material: p.sapphireDeep,
  });
  upperDeck.position.y = 0.5;

  const needle = createFilletedShaft({
    radius: 0.034,
    topRadius: 0.008,
    height: 0.34,
    anglageBevel: 0.005,
    radialSegments: 32,
    material: p.chrome,
  });
  needle.position.y = 0.5;
  const beacon = createTurnedOrb({ radius: 0.045, material: p.glow });
  beacon.position.y = 0.84;

  // 3 tilted concentric broadcast signal halos rising around the mast!
  const waveRings: THREE.Mesh[] = [];
  for (let w = 0; w < 3; w++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.105 + w * 0.056, 0.011, 14, 48),
      w === 1 ? p.jewel : p.gold,
    );
    ring.rotation.set(Math.PI * 0.5 + 0.18, 0, w * 0.25);
    ring.position.y = 0.58 + w * 0.085;
    sculpt.add(ring);
    waveRings.push(ring);
  }

  sculpt.add(lowerDeck, upperDeck, needle, beacon);
  return (t) => {
    for (let i = 0; i < waveRings.length; i++) {
      const phase = (t * 0.72 + i / 3) % 1.0;
      waveRings[i].position.y = 0.55 + phase * 0.27;
      const sc = 0.72 + phase * 0.52;
      waveRings[i].scale.set(sc, sc, 1);
    }
  };
}

/** #30 — Vera Karp's Precision Forensic Scales of Broadcast Justice */
function buildSculpt_30_ForensicScales(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Tall fluted column seated on stepped judicial plinth
  addTurnedFootStem(sculpt, 0.66, 0.042, p.chrome, p.gold);

  const finial = createTurnedOrb({ radius: 0.048, material: p.gold });
  finial.position.y = 0.715;

  // Rocking horizontal judicial balance beam (`pivot` at y = 0.63)
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 0.63;

  const beamBar = createFilletedShaft({
    radius: 0.018,
    topRadius: 0.012,
    height: 0.58,
    anglageBevel: 0.004,
    radialSegments: 24,
    centered: true,
    material: p.gold,
  });
  beamBar.rotation.z = Math.PI * 0.5;
  beamPivot.add(beamBar);

  const panHangers: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const endTip = createTurnedOrb({ radius: 0.026, material: p.gold });
    endTip.position.x = side * 0.295;
    beamPivot.add(endTip);

    const hanger = new THREE.Group();
    hanger.position.set(side * 0.275, 0, 0);

    // 3 fine suspension chains from beam hook down to brass weighing pan
    for (let c = 0; c < 3; c++) {
      const a = (c / 3) * Math.PI * 2;
      const chainCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(a) * 0.095, -0.27, Math.sin(a) * 0.095),
      ]);
      const chain = new THREE.Mesh(
        new THREE.TubeGeometry(chainCurve, 8, 0.0055, 8, false),
        p.gold,
      );
      hanger.add(chain);
    }

    // Concave turned brass weighing dish
    const pan = createTurnedOrb({
      radius: 0.11,
      heightScale: 0.42,
      hemiOnly: true,
      radialSegments: 36,
      material: p.primary,
    });
    pan.rotation.z = Math.PI;
    pan.position.y = -0.265;

    // Contrasting forensic weights resting inside each pan (Truth Sapphire vs Gold Weight!)
    const weight =
      side < 0
        ? createTurnedOrb({ radius: 0.046, material: p.dichroic })
        : createFilletedShaft({
            radius: 0.036,
            topRadius: 0.028,
            height: 0.075,
            anglageBevel: 0.005,
            radialSegments: 28,
            material: p.gold,
          });
    weight.position.y = side < 0 ? -0.25 : -0.285;

    hanger.add(pan, weight);
    beamPivot.add(hanger);
    panHangers.push(hanger);
  }

  sculpt.add(finial, beamPivot);
  return (t) => {
    const tilt = Math.sin(t * 1.5) * 0.12;
    beamPivot.rotation.z = tilt;
    // Keep hanging pans plumb vertical under gravity!
    panHangers[0].rotation.z = -tilt;
    panHangers[1].rotation.z = -tilt;
  };
}

/** #31 — Open Brass-Bound 1966 Steamer Prop Trunk Overflowing w/ 5 Glowing Relic Gems */
function buildSculpt_31_FiveSlotTrunk(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Lower steamer trunk body seated proudly on the velvet cushion!
  const chest = createChamferedBox({
    width: 0.48,
    height: 0.25,
    depth: 0.32,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    cornerRadius: 0.016,
    material: p.walnut,
  });
  chest.position.y = 0.135;

  // Heavy 24K brass strapping bands & front lock hasp
  for (const bx of [-0.175, 0.175]) {
    const strap = createChamferedBox({
      width: 0.044,
      height: 0.268,
      depth: 0.34,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.gold,
    });
    strap.position.set(bx, 0.135, 0);
    sculpt.add(strap);
  }
  const hasp = createChamferedBox({
    width: 0.088,
    height: 0.095,
    depth: 0.038,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.gold,
  });
  hasp.position.set(0, 0.195, 0.165);

  // Royal velvet tray inside the open trunk holding 5 gleaming multi-colored Relic Gems!
  const tray = createChamferedBox({
    width: 0.42,
    height: 0.04,
    depth: 0.26,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    material: p.secondary,
  });
  tray.position.y = 0.255;

  const gemMats = [p.crimson, p.dichroic, p.gold, p.emerald, p.glow];
  const gems: THREE.Object3D[] = [];
  for (let g = 0; g < 5; g++) {
    const gx = (g - 2) * 0.082;
    const gz = (g % 2 === 0 ? 1 : -1) * 0.032;
    const gem = createTurnedOrb({
      radius: 0.044,
      heightScale: 1.32,
      radialSegments: 8, // faceted diamond jewel cut!
      material: gemMats[g],
    });
    gem.position.set(gx, 0.315 + (g === 2 ? 0.03 : 0), gz);
    sculpt.add(gem);
    gems.push(gem);
  }

  // Hinged domed trunk lid propped open dramatically at 58°!
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.26, -0.155);
  lidPivot.rotation.x = -1.04;

  const lidShell = createChamferedBox({
    width: 0.48,
    height: 0.13,
    depth: 0.32,
    bevelThickness: 0.016,
    bevelSize: 0.016,
    cornerRadius: 0.032,
    material: p.primary,
  });
  lidShell.position.set(0, 0.06, 0.155);
  for (const bx of [-0.175, 0.175]) {
    const lidStrap = createChamferedBox({
      width: 0.044,
      height: 0.145,
      depth: 0.336,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      material: p.gold,
    });
    lidStrap.position.set(bx, 0.06, 0.155);
    lidPivot.add(lidStrap);
  }
  lidPivot.add(lidShell);

  sculpt.add(chest, hasp, tray, lidPivot);
  return (t) => {
    for (let i = 0; i < gems.length; i++) {
      gems[i].position.y = 0.32 + (i === 2 ? 0.03 : 0) + Math.sin(t * 2.6 + i * 1.1) * 0.016;
      gems[i].rotation.y = t * 1.2 + i;
    }
  };
}

/** #32 — Safe-Cracker's Open Circular $250K Bank Vault Door w/ 6 Locking Bolts & Spinning Wheel */
function buildSculpt_32_BrassVaultDoor(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Heavy architectural steel vault frame cradle seated directly on velvet cushion
  const sill = createChamferedBox({
    width: 0.56,
    height: 0.072,
    depth: 0.22,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    material: p.secondary,
  });
  sill.position.y = 0.036;

  // Massive side crane-hinge pillar on left
  const hingePillar = createFilletedShaft({
    radius: 0.044,
    height: 0.62,
    baseCollarFlare: 0.018,
    neckCollarFlare: 0.018,
    anglageBevel: 0.008,
    radialSegments: 32,
    material: p.gold,
  });
  hingePillar.position.set(-0.265, 0.055, 0.02);

  // Monumental thick beveled circular Platinum & Gold Bank Vault Door!
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0.035, 0.42, 0.01);
  doorGroup.rotation.y = -0.18;

  const doorOuter = createNotchedBezel({
    notchShape: 'VERNIER',
    outerRadius: 0.315,
    innerRadius: 0.23,
    thickness: 0.125,
    material: p.primary,
  });
  doorOuter.rotation.x = Math.PI * 0.5;

  const doorCore = createFilletedShaft({
    radius: 0.24,
    height: 0.105,
    anglageBevel: 0.012,
    radialSegments: 56,
    centered: true,
    material: p.secondary,
  });
  doorCore.rotation.x = Math.PI * 0.5;

  // 6 heavy radiating chrome locking bolt cylinders protruding from the perimeter!
  for (let b = 0; b < 6; b++) {
    const a = (b / 6) * Math.PI * 2 + Math.PI / 6;
    const bolt = createFilletedShaft({
      radius: 0.025,
      height: 0.12,
      anglageBevel: 0.005,
      radialSegments: 24,
      material: p.chrome,
    });
    bolt.position.set(Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0);
    bolt.rotation.z = a - Math.PI * 0.5;
    doorGroup.add(bolt);
  }

  // Glowing emerald "$250K PAID IN FULL" heart crystal behind the spinning combination wheel
  const vaultJewel = createTurnedOrb({ radius: 0.088, heightScale: 0.55, material: p.emerald });
  vaultJewel.rotation.x = Math.PI * 0.5;
  vaultJewel.position.z = 0.05;

  // Spinning 3-spoke 24K Gold Captain's Vault Combination Wheel!
  const wheelSpin = new THREE.Group();
  wheelSpin.position.z = 0.115;
  const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 16, 48), p.gold);
  const wheelHub = createTurnedOrb({ radius: 0.044, heightScale: 0.72, material: p.gold });
  wheelHub.rotation.x = Math.PI * 0.5;
  wheelSpin.add(wheelRing, wheelHub);

  for (let s = 0; s < 3; s++) {
    const a = (s / 3) * Math.PI * 2;
    const spoke = createFilletedShaft({
      radius: 0.015,
      height: 0.19,
      anglageBevel: 0.004,
      radialSegments: 16,
      material: p.gold,
    });
    spoke.rotation.z = a - Math.PI * 0.5;
    const grip = createTurnedOrb({ radius: 0.026, material: p.primary });
    grip.position.set(Math.cos(a) * 0.195, Math.sin(a) * 0.195, 0);
    wheelSpin.add(spoke, grip);
  }

  doorGroup.add(doorOuter, doorCore, vaultJewel, wheelSpin);
  sculpt.add(sill, hingePillar, doorGroup);

  return (t) => {
    wheelSpin.rotation.z = Math.sin(t * 1.35) * 1.1;
  };
}

/** #33 — Shadow Syndicate Giant Cut-Diamond Signet Ring & Staggered High-Roller Chip Stack */
function buildSculpt_33_SyndicateSignet(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Staggered horizontal stack of 3 notched Monte Carlo House-Marker Chips as a flat base!
  const chipSpecs: readonly { x: number; y: number; z: number; mat: THREE.Material }[] = [
    { x: -0.04, y: 0.022, z: 0.02, mat: p.obsidian },
    { x: 0.03, y: 0.062, z: -0.02, mat: p.crimson },
    { x: -0.01, y: 0.102, z: 0.01, mat: p.gold },
  ];
  for (const cs of chipSpecs) {
    const chip = createNotchedBezel({
      notchShape: 'VERNIER',
      outerRadius: 0.215,
      innerRadius: 0.135,
      thickness: 0.038,
      bevel: 0.006,
      material: cs.mat,
    });
    const chipCore = createFilletedShaft({
      radius: 0.142,
      height: 0.03,
      anglageBevel: 0.004,
      radialSegments: 40,
      centered: true,
      material: cs.mat === p.gold ? p.crimson : p.gold,
    });
    const cg = new THREE.Group();
    cg.position.set(cs.x, cs.y, cs.z);
    cg.add(chip, chipCore);
    sculpt.add(cg);
  }

  // Monumental upright 24K Gold Signet Championship Ring seated cleanly ATOP the chip stack!
  const ringGroup = new THREE.Group();
  ringGroup.position.set(0.0, 0.37, 0.01);
  ringGroup.rotation.set(-0.12, -0.28, -0.06);

  const ringShank = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.048, 20, 56), p.gold);
  ringShank.scale.set(1.0, 1.06, 1.32);

  // Sculpted platinum claw-prong crown bezel atop the ring!
  const crownSetting = createNotchedBezel({
    notchShape: 'HEX',
    outerRadius: 0.158,
    innerRadius: 0.09,
    thickness: 0.084,
    material: p.primary,
  });
  crownSetting.position.y = 0.242;

  // Giant faceted Emerald-Cut / Dichroic Solitaire Gemstone!
  const diamondTop = createFilletedShaft({
    radius: 0.138,
    topRadius: 0.074,
    height: 0.122,
    anglageBevel: 0.008,
    radialSegments: 8,
    material: p.dichroic,
  });
  diamondTop.position.y = 0.288;
  const diamondPavilion = createFilletedShaft({
    radius: 0.022,
    topRadius: 0.138,
    height: 0.108,
    anglageBevel: 0.006,
    radialSegments: 8,
    material: p.dichroic,
  });
  diamondPavilion.position.y = 0.18;

  for (let pr = 0; pr < 4; pr++) {
    const a = (pr / 4) * Math.PI * 2 + Math.PI * 0.25;
    const prong = createFilletedShaft({
      radius: 0.018,
      topRadius: 0.012,
      height: 0.138,
      anglageBevel: 0.004,
      radialSegments: 16,
      material: p.gold,
    });
    prong.position.set(Math.cos(a) * 0.128, 0.248, Math.sin(a) * 0.128);
    ringGroup.add(prong);
  }

  ringGroup.add(ringShank, crownSetting, diamondTop, diamondPavilion);
  sculpt.add(ringGroup);

  return (t) => {
    diamondTop.rotation.y = t * 0.55;
    diamondPavilion.rotation.y = t * 0.55;
  };
}

/** #34 — 1966 Cast-Brass & Cobalt Notary Seal Embossing Press & Wax Ribbon Seal (3/4 Profile!) */
function buildSculpt_34_SubpoenaEmbosser(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Orient press at dramatic +58° side-3/4 angle so the iconic curved C-throat & pumping lever shine!
  const pressAssembly = new THREE.Group();
  pressAssembly.rotation.y = 1.02;

  const bed = createChamferedBox({
    width: 0.24,
    height: 0.088,
    depth: 0.44,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    cornerRadius: 0.032,
    material: p.sapphireDeep,
  });
  bed.position.y = 0.05;

  const throat = createChamferedArch({
    innerRadius: 0.145,
    outerRadius: 0.23,
    depth: 0.088,
    arcAngle: Math.PI * 1.1,
    startAngle: -Math.PI * 0.55,
    material: p.primary,
  });
  throat.rotation.y = Math.PI * 0.5;
  throat.position.set(0, 0.29, -0.05);

  const waxSeal = createNotchedBezel({
    notchShape: 'WAX_SEAL',
    outerRadius: 0.128,
    innerRadius: 0.032,
    thickness: 0.034,
    material: p.crimson,
  });
  waxSeal.position.set(0, 0.11, 0.13);

  const upperDie = createFilletedShaft({
    radius: 0.068,
    height: 0.14,
    baseCollarFlare: 0.012,
    anglageBevel: 0.007,
    radialSegments: 36,
    material: p.gold,
  });
  upperDie.position.set(0, 0.25, 0.13);

  const leverPivot = new THREE.Group();
  leverPivot.position.set(0, 0.48, 0.08);
  const leverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.14, -0.11),
    new THREE.Vector3(0, 0.27, -0.24),
  ]);
  const leverArm = new THREE.Mesh(
    new THREE.TubeGeometry(leverCurve, 22, 0.026, 14, false),
    p.gold,
  );
  const gripBall = createTurnedOrb({ radius: 0.068, material: p.walnut });
  gripBall.position.set(0, 0.285, -0.255);
  const pivotAxle = createFilletedShaft({
    radius: 0.032,
    height: 0.14,
    anglageBevel: 0.006,
    radialSegments: 24,
    centered: true,
    material: p.chrome,
  });
  pivotAxle.rotation.z = Math.PI * 0.5;

  leverPivot.add(leverArm, gripBall, pivotAxle);
  pressAssembly.add(bed, throat, waxSeal, upperDie, leverPivot);
  sculpt.add(pressAssembly);

  return (t) => {
    const press = 0.5 + 0.5 * Math.sin(t * 1.8);
    leverPivot.rotation.x = press * 0.22;
    upperDie.position.y = 0.25 - press * 0.045;
  };
}

/** #35 — Imperial 8-Spire Returning-Champion Broadcast Sovereign Crown */
function buildSculpt_35_SovereignCrown(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  const baseBand = createNotchedBezel({
    notchShape: 'WAX_SEAL',
    outerRadius: 0.305,
    innerRadius: 0.215,
    thickness: 0.11,
    material: p.primary,
  });
  baseBand.position.y = 0.125;

  const goldFiligreeBand = new THREE.Mesh(new THREE.TorusGeometry(0.282, 0.018, 16, 64), p.gold);
  goldFiligreeBand.rotation.x = Math.PI * 0.5;
  goldFiligreeBand.position.y = 0.125;

  // Deep royal crimson velvet imperial inner cap dome visible between the gold spires!
  const capDome = createTurnedOrb({
    radius: 0.215,
    heightScale: 1.15,
    hemiOnly: true,
    radialSegments: 48,
    material: p.crimson,
  });
  capDome.position.y = 0.16;

  // 8 alternating tall platinum & 24K gold imperial crown spires topped with Living Color pearls!
  const spireCount = 8;
  for (let s = 0; s < spireCount; s++) {
    const a = (s / spireCount) * Math.PI * 2;
    const isMajor = s % 2 === 0;
    const h = isMajor ? 0.34 : 0.25;
    const spire = createFilletedShaft({
      radius: isMajor ? 0.032 : 0.025,
      topRadius: 0.01,
      height: h,
      anglageBevel: 0.005,
      radialSegments: 28,
      material: isMajor ? p.gold : p.primary,
    });
    spire.position.set(Math.cos(a) * 0.258, 0.17, Math.sin(a) * 0.258);

    const pearl = createTurnedOrb({
      radius: isMajor ? 0.032 : 0.024,
      material: isMajor ? p.dichroic : p.crimson,
    });
    pearl.position.set(Math.cos(a) * 0.258, 0.18 + h, Math.sin(a) * 0.258);

    // Cabochon jewel inlaid around the lower crown band
    const bandGem = createTurnedOrb({
      radius: 0.026,
      heightScale: 0.72,
      material: isMajor ? p.crimson : p.dichroic,
    });
    bandGem.position.set(Math.cos(a) * 0.295, 0.125, Math.sin(a) * 0.295);
    sculpt.add(spire, pearl, bandGem);
  }

  // Twin crossing imperial sovereign arches rising over the crown
  for (const rotY of [0, Math.PI * 0.5]) {
    const rib = createChamferedArch({
      innerRadius: 0.215,
      outerRadius: 0.265,
      depth: 0.038,
      arcAngle: Math.PI,
      material: p.gold,
    });
    rib.position.y = 0.39;
    rib.rotation.y = rotY;
    sculpt.add(rib);
  }

  // Spinning Living Color Starburst + Sovereign Dichroic Monde Orb at the apex!
  const crownStar = createSculptedStarburstMini({
    radius: 0.17,
    rays: 12,
    depth: 0.036,
    primaryMat: p.gold,
    accentMat: p.primary,
    orbMat: p.dichroic,
  });
  crownStar.position.y = 0.48;

  const mondeOrb = createTurnedOrb({ radius: 0.068, material: p.dichroic });
  mondeOrb.position.y = 0.725;
  const apexFinial = createTurnedOrb({ radius: 0.034, material: p.glow });
  apexFinial.position.y = 0.815;

  sculpt.add(baseBand, goldFiligreeBand, capDome, crownStar, mondeOrb, apexFinial);
  return (_t, dt) => {
    crownStar.rotation.z += dt * 0.65;
  };
}

/** #36 — World's Smartest $250,000 Grand Masterpiece: Celestial Obelisk, Tri-Gimbal Armillary & 6-Plume Living Color Peacock Fan! */
function buildSculpt_36_GrandMasterpiece(sculpt: THREE.Group, p: TrophyPaletteV7): KineticCallback {
  // Monumental octagonal platinum & gold stepped master plinth
  const stepA = createNotchedBezel({
    notchShape: 'HEX',
    outerRadius: 0.24,
    innerRadius: 0.08,
    thickness: 0.055,
    material: p.gold,
  });
  stepA.position.y = 0.028;

  // Soaring deep-sapphire faceted Broadcast Obelisk rising through the center!
  const obelisk = createFilletedShaft({
    radius: 0.092,
    topRadius: 0.022,
    height: 0.68,
    baseCollarFlare: 0.036,
    anglageBevel: 0.009,
    radialSegments: 6,
    material: p.sapphireDeep,
  });
  obelisk.position.y = 0.05;

  // 6 Wide Iconic NBC "In Living Color" Peacock Plumage Feathers fanning triumphantly behind!
  const plumeShape = new THREE.Shape();
  plumeShape.moveTo(0, 0);
  plumeShape.quadraticCurveTo(0.064, 0.25, 0.048, 0.46);
  plumeShape.quadraticCurveTo(0, 0.55, -0.048, 0.46);
  plumeShape.quadraticCurveTo(-0.064, 0.25, 0, 0);
  const plumeGeom = new THREE.ExtrudeGeometry(plumeShape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  plumeGeom.translate(0, 0, -0.009);
  plumeGeom.computeVertexNormals();

  const plumeMats = [p.gold, p.copper, p.crimson, p.sapphireDeep, p.dichroic, p.emerald];
  const plumeGroup = new THREE.Group();
  plumeGroup.position.set(0, 0.19, -0.095);
  for (let f = 0; f < 6; f++) {
    const angle = lerp(-1.12, 1.12, f / 5);
    const feather = new THREE.Mesh(plumeGeom, plumeMats[f]);
    feather.rotation.z = angle;
    const tipOrb = createTurnedOrb({ radius: 0.026, material: p.gold });
    tipOrb.position.set(-Math.sin(angle) * 0.49, Math.cos(angle) * 0.49, 0.012);
    plumeGroup.add(feather, tipOrb);
  }

  // 3 Counter-Rotating Celestial Armillary Rings encircling the crystal obelisk!
  const cy = 0.44;
  const gimbals: THREE.Mesh[] = [];
  const ringMats = [p.primary, p.gold, p.dichroic];
  for (let r = 0; r < 3; r++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.285 - r * 0.042, 0.016, 16, 64),
      ringMats[r],
    );
    ring.position.y = cy;
    ring.rotation.set(0.45 + r * 0.72, r * 0.9, 0.25);
    sculpt.add(ring);
    gimbals.push(ring);
  }

  // Blazing 16-Ray Sovereign Sunburst crowning the entire Masterpiece!
  const apexSunburst = createSculptedStarburstMini({
    radius: 0.165,
    rays: 16,
    depth: 0.036,
    primaryMat: p.gold,
    accentMat: p.primary,
    orbMat: p.glow,
    tipBeads: true,
  });
  apexSunburst.position.y = 0.73;

  sculpt.add(stepA, obelisk, plumeGroup, apexSunburst);
  return (_t, dt) => {
    gimbals[0].rotation.y += dt * 0.42;
    gimbals[1].rotation.x += dt * 0.58;
    gimbals[2].rotation.z -= dt * 0.72;
    apexSunburst.rotation.z += dt * 0.48;
  };
}

/** 1:1 Dispatch Map from all 36 canonical `trophyId`s to 36 distinct sculptures! */
const SCULPTURE_BUILDERS_BY_ID_V7: Readonly<
  Record<string, (sculpt: THREE.Group, p: TrophyPaletteV7) => KineticCallback | void>
> = {
  trophy_s1_01: buildSculpt_01_RibbonMic,
  trophy_s1_02: buildSculpt_02_FunkTurntable,
  trophy_s1_03: buildSculpt_03_HexStarburst,
  trophy_s1_04: buildSculpt_04_BigPrizeWheel,
  trophy_s1_05: buildSculpt_05_TruceMedallion,
  trophy_s1_06: buildSculpt_06_KlaxonBell,
  trophy_s1_07: buildSculpt_07_VernierCaliber,
  trophy_s1_08: buildSculpt_08_OperaBinoculars,
  trophy_s1_09: buildSculpt_09_SeasonOneChalice,
  trophy_s2_10: buildSculpt_10_IsolationBooth,
  trophy_s2_11: buildSculpt_11_ColorVectorscope,
  trophy_s2_12: buildSculpt_12_WurlitzerLyre,
  trophy_s2_13: buildSculpt_13_CanaryBrazier,
  trophy_s2_14: buildSculpt_14_ReliefGlobe,
  trophy_s2_15: buildSculpt_15_MercyKnifeSwitch,
  trophy_s2_16: buildSculpt_16_BlueprintLoupe,
  trophy_s2_17: buildSculpt_17_CameraShutter,
  trophy_s2_18: buildSculpt_18_SplitFlapCrown,
  trophy_s3_19: buildSculpt_19_MonteCarloRoulette,
  trophy_s3_20: buildSculpt_20_WorldsFairUnisphere,
  trophy_s3_21: buildSculpt_21_PirateKlystron,
  trophy_s3_22: buildSculpt_22_LaurelWreath,
  trophy_s3_23: buildSculpt_23_FresnelSpotlight,
  trophy_s3_24: buildSculpt_24_ConspiracyLasso,
  trophy_s3_25: buildSculpt_25_LightningBolt,
  trophy_s3_26: buildSculpt_26_GoldenExitKey,
  trophy_s3_27: buildSculpt_27_HourElevenClock,
  trophy_s4_28: buildSculpt_28_PharmaCaduceus,
  trophy_s4_29: buildSculpt_29_BroadcastTower,
  trophy_s4_30: buildSculpt_30_ForensicScales,
  trophy_s4_31: buildSculpt_31_FiveSlotTrunk,
  trophy_s4_32: buildSculpt_32_BrassVaultDoor,
  trophy_s4_33: buildSculpt_33_SyndicateSignet,
  trophy_s4_34: buildSculpt_34_SubpoenaEmbosser,
  trophy_s4_35: buildSculpt_35_SovereignCrown,
  trophy_s4_36: buildSculpt_36_GrandMasterpiece,
};

/** Fallback dispatch by `sculptKind` in case a custom non-catalog spec is ever passed. */
const FALLBACK_BUILDERS_BY_KIND_V7: Readonly<
  Record<TrophySpecV7['sculptKind'], (sculpt: THREE.Group, p: TrophyPaletteV7) => KineticCallback | void>
> = {
  RIBBON_MIC: buildSculpt_01_RibbonMic,
  TURNTABLE_PLATTER: buildSculpt_02_FunkTurntable,
  HEX_STARBURST: buildSculpt_03_HexStarburst,
  VAUDEVILLE_RATCHET: buildSculpt_04_BigPrizeWheel,
  ISOLATION_RELAY: buildSculpt_10_IsolationBooth,
  LARSON_OSCILLOSCOPE: buildSculpt_11_ColorVectorscope,
  WURLITZER_LYRE: buildSculpt_12_WurlitzerLyre,
  ROULETTE_ASTROLABE: buildSculpt_19_MonteCarloRoulette,
  GEODESIC_ARMILLARY: buildSculpt_20_WorldsFairUnisphere,
  PIRATE_KLYSTRON: buildSculpt_21_PirateKlystron,
  ESCAPEMENT_CROWN: buildSculpt_35_SovereignCrown,
  SUBPOENA_PENDULUM: buildSculpt_27_HourElevenClock,
};

// ----------------------------------------------------------------------------
// 4C. `buildTrophySculptureV7` — Luxury Marquee Turntable + Velvet Cushion +
//     Engraved Brass Nameplate + Contact Shadows + Specular Sparkle Glints!
// ----------------------------------------------------------------------------

interface SparkleGlintTrack {
  readonly sprite: THREE.Sprite;
  readonly baseRadius: number;
  readonly baseY: number;
  readonly phase: number;
  readonly speed: number;
  readonly baseScale: number;
}

export function buildTrophySculptureV7(
  spec: TrophySpecV7,
  envMap: THREE.Texture | null = null,
  opts: { unlocked?: boolean; scale?: number } = {},
): BuiltTrophySculptureV7 {
  const unlocked = opts.unlocked ?? true;
  const meta = getTrophyDisplayMetaV7(spec.trophyId);
  const root = new THREE.Group();
  root.name = `LitTrophy_${spec.trophyId}`;
  root.scale.setScalar(opts.scale ?? 1.0);

  const seasonHex = getSeasonLivingColorHex(spec.season);
  const walnutMat = createWalnutMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const goldTrimMat = create24KGoldMaterial(envMap);
  const cobaltBandMat = createBluedSteelMaterial(0x1746a2, envMap);
  const palette = createTrophyPalette(spec, meta, unlocked, envMap);

  // --------------------------------------------------------------------------
  // A. Grounded Contact Shadow + Stationary 1966 Marquee Drum (`y = 0..0.072`)
  // --------------------------------------------------------------------------
  const floorContactShadow = createVaultContactShadowMesh(
    0.66,
    0.62,
    0.002,
    'TurntableFloorContactShadowAO',
  );
  root.add(floorContactShadow);

  const outerWalnutCollar = createFilletedShaft({
    radius: 0.455,
    topRadius: 0.435,
    height: 0.068,
    baseCollarFlare: 0.026,
    neckCollarFlare: 0.016,
    anglageBevel: 0.008,
    radialSegments: 64,
    material: walnutMat,
    name: 'PrizeTurntableWalnutSkirt',
  });
  const cobaltMarqueeChannel = createFilletedShaft({
    radius: 0.442,
    height: 0.038,
    baseCollarFlare: 0.01,
    neckCollarFlare: 0.012,
    anglageBevel: 0.005,
    radialSegments: 64,
    material: cobaltBandMat,
    name: 'PrizeTurntableCobaltChannel',
  });
  cobaltMarqueeChannel.position.y = 0.026;
  root.add(outerWalnutCollar, cobaltMarqueeChannel);

  // 18 Chasing `#11` Marquee Bulbs (Warm 2700K tungsten when unlocked; cool sapphire on locked!)
  const plinthBulbMats: THREE.MeshStandardMaterial[] = [];
  const plinthBulbCount = 18;
  const socketRadius = 0.456;
  const bulbRadius = 0.474;
  for (let i = 0; i < plinthBulbCount; i++) {
    const angle = (i / plinthBulbCount) * Math.PI * 2;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    const socket = createNotchedBezel({
      notchShape: 'SCALLOP',
      outerRadius: 0.027,
      innerRadius: 0.014,
      thickness: 0.016,
      bevel: 0.004,
      material: unlocked ? goldTrimMat : aluminumMat,
      name: `PlinthMarqueeSocket_${i}`,
    });
    socket.position.set(sinA * socketRadius, 0.045, cosA * socketRadius);
    socket.lookAt(sinA * 2.0, 0.045, cosA * 2.0);
    socket.rotateX(Math.PI * 0.5);
    root.add(socket);

    const bulbMat = new THREE.MeshStandardMaterial({
      color: unlocked ? 0xfff6dc : 0xcde7f8,
      emissive: unlocked ? 0xffc857 : 0x3b8ec4,
      emissiveIntensity: unlocked ? 1.2 : 0.48,
      roughness: 0.12,
      metalness: 0.04,
      envMap,
      envMapIntensity: 0.9,
    });
    const bulb = createTurnedOrb({
      radius: 0.02,
      radialSegments: 24,
      material: bulbMat,
      castShadow: false,
      receiveShadow: false,
      name: `PlinthMarqueeBulb11_${i}`,
    });
    bulb.position.set(sinA * bulbRadius, 0.045, cosA * bulbRadius);
    root.add(bulb);
    plinthBulbMats.push(bulbMat);
  }

  // --------------------------------------------------------------------------
  // B. Clearcoated Revolving Prize Turntable + Plush Velvet Cushion + Engraved Plaque
  // --------------------------------------------------------------------------
  const turntableGroup = new THREE.Group();
  turntableGroup.name = 'ClearcoatedRevolvingPrizePlinthGroup';
  turntableGroup.position.y = 0.066;
  root.add(turntableGroup);

  const clearcoatedPlinthMat = new THREE.MeshPhysicalMaterial({
    color: unlocked ? 0x0d2654 : 0x11223a,
    metalness: 0.24,
    roughness: 0.16,
    clearcoat: 0.9,
    clearcoatRoughness: 0.07,
    reflectivity: 0.96,
    envMap,
    envMapIntensity: 1.35,
  });

  const revolvingPlinthDeck = createFilletedShaft({
    radius: 0.395,
    topRadius: 0.382,
    height: 0.088,
    baseCollarFlare: 0.02,
    neckCollarFlare: 0.014,
    anglageBevel: 0.008,
    radialSegments: 64,
    material: clearcoatedPlinthMat,
    name: 'ClearcoatedRevolvingPlinthDeck',
  });

  // Streamlined brushed aluminum waist fillet + smooth beveled 24K museum rim (zero noisy cog stripes!)
  const aluminumTrimRing = createSmoothBeveledRing({
    innerRadius: 0.376,
    outerRadius: 0.412,
    thickness: 0.018,
    material: aluminumMat,
    name: 'PlinthAnodizedAluminumRing',
  });
  aluminumTrimRing.position.y = 0.018;

  const vernierCrownRim = createSmoothBeveledRing({
    innerRadius: 0.344,
    outerRadius: 0.404,
    thickness: 0.028,
    material: unlocked ? (meta.tierBadge === 'SILVER MEDAL' ? aluminumMat : goldTrimMat) : aluminumMat,
    name: 'Plinth24KVernierCrown',
  });
  vernierCrownRim.position.y = 0.078;

  // Subtly Backlit Frosted Living Color Acrylite Stage Rim (calm glow — zero white washout!)
  const acryliteDiffTex = getBacklitAcryliteStageTexture();
  const accentHexNum = Number.parseInt(meta.accentHex.replace('#', ''), 16) || seasonHex;
  const backlitAcryliteTopMat = new THREE.MeshPhysicalMaterial({
    color: unlocked ? 0x1b3a66 : 0x182f4c,
    map: acryliteDiffTex,
    emissive: unlocked ? accentHexNum : 0x1c466e,
    emissiveMap: acryliteDiffTex,
    emissiveIntensity: unlocked ? 0.32 : 0.18,
    metalness: 0.08,
    roughness: 0.2,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    reflectivity: 0.92,
    envMap,
    envMapIntensity: 1.1,
  });
  const acryliteStageDisc = createFilletedShaft({
    radius: 0.344,
    height: 0.02,
    baseCollarFlare: 0.004,
    neckCollarFlare: 0.004,
    anglageBevel: 0.005,
    radialSegments: 64,
    material: backlitAcryliteTopMat,
    name: 'BacklitAcryliteTopStage',
  });
  acryliteStageDisc.position.y = 0.084;

  // Stepped American Walnut Trophy Base Collar + Plush Tier-Colored Velvet Cushion!
  const walnutTrophyCollar = createFilletedShaft({
    radius: 0.282,
    topRadius: 0.264,
    height: 0.036,
    baseCollarFlare: 0.016,
    neckCollarFlare: 0.01,
    anglageBevel: 0.006,
    radialSegments: 56,
    material: walnutMat,
    name: 'WalnutTrophyPedestalCollar',
  });
  walnutTrophyCollar.position.y = 0.1;

  const velvetCushion = createVelvetCushionMesh(
    0.258,
    0.048,
    palette.velvet,
    'TierMatchedVelvetCushion',
  );
  velvetCushion.position.y = 0.13;

  // Gilded braided bullion cord piping hugging the cushion perimeter!
  const cushionCord = new THREE.Mesh(
    new THREE.TorusGeometry(0.256, 0.011, 14, 56),
    unlocked ? goldTrimMat : aluminumMat,
  );
  cushionCord.rotation.x = Math.PI * 0.5;
  cushionCord.position.y = 0.138;
  cushionCord.name = 'VelvetCushionBullionPiping';

  // Inner contact shadow seated gently on the velvet cushion crown right under the sculpture!
  const cushionContactShadow = createVaultContactShadowMesh(
    0.22,
    0.55,
    0.178,
    'CushionSculptureContactShadowAO',
  );

  // Front-Mounted Angled Engraved Brass Presentation Nameplate (glare-free readable museum etching!)
  const plaqueTex = createEngravedPlaqueTexture(spec, meta, unlocked);
  const plaqueBezel = createChamferedBox({
    width: 0.295,
    height: 0.106,
    depth: 0.022,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    cornerRadius: 0.01,
    material: unlocked ? goldTrimMat : aluminumMat,
    name: 'EngravedBrassPlaqueFrame',
  });
  const plaqueFaceMat = new THREE.MeshStandardMaterial({
    map: plaqueTex,
    metalness: unlocked ? 0.26 : 0.22,
    roughness: unlocked ? 0.44 : 0.48,
    envMap,
    envMapIntensity: 0.72,
  });
  const plaqueFace = new THREE.Mesh(new THREE.PlaneGeometry(0.268, 0.092), plaqueFaceMat);
  plaqueFace.position.z = 0.012;
  plaqueFace.name = 'EngravedBrassPlaqueFace';

  const plaqueHolder = new THREE.Group();
  plaqueHolder.name = 'EngravedNameplateAssembly';
  plaqueHolder.position.set(0, 0.118, 0.316);
  plaqueHolder.rotation.x = -0.34; // tilted cleanly toward the camera without catching overhead glare!
  plaqueHolder.add(plaqueBezel, plaqueFace);

  // 1..4 Season Honors Cabochon Pips inlaid cleanly along the rear plinth arc
  for (let s = 0; s < spec.season; s++) {
    const spread = (s - (spec.season - 1) * 0.5) * 0.24;
    const pip = createTurnedOrb({
      radius: 0.018,
      heightScale: 0.65,
      material: unlocked ? palette.glow : aluminumMat,
    });
    pip.position.set(Math.sin(spread) * 0.325, 0.11, -Math.cos(spread) * 0.325);
    turntableGroup.add(pip);
  }

  turntableGroup.add(
    revolvingPlinthDeck,
    aluminumTrimRing,
    vernierCrownRim,
    acryliteStageDisc,
    walnutTrophyCollar,
    velvetCushion,
    cushionCord,
    cushionContactShadow,
    plaqueHolder,
  );

  // --------------------------------------------------------------------------
  // C. Bespoke 1-of-36 Museum Sculpture Seated on Velvet Cushion (`y = 0.172`)
  // --------------------------------------------------------------------------
  const sculpt = new THREE.Group();
  sculpt.name = `SculptureCenterpiece_${spec.trophyId}_${spec.sculptKind}`;
  sculpt.position.y = 0.172;
  turntableGroup.add(sculpt);

  const builderFn =
    SCULPTURE_BUILDERS_BY_ID_V7[spec.trophyId] ?? FALLBACK_BUILDERS_BY_KIND_V7[spec.sculptKind];
  const updateKineticSubparts = builderFn(sculpt, palette) ?? null;

  // --------------------------------------------------------------------------
  // D. Floating RCA TK-41 Specular Sparkle Glints (Tier-Scaled on Unlocked Awards!)
  // --------------------------------------------------------------------------
  const sparkleTracks: SparkleGlintTrack[] = [];
  if (unlocked) {
    const sparkleCount =
      meta.tierBadge === 'PLATINUM CROWN'
        ? 12
        : meta.tierBadge === 'GOLD TROPHY'
          ? 8
          : meta.tierBadge === 'SILVER MEDAL'
            ? 5
            : 4;
    const sparkleTex = getSpecularSparkleTexture();
    for (let i = 0; i < sparkleCount; i++) {
      const glintColor =
        meta.tierBadge === 'PLATINUM CROWN' && i % 2 === 1
          ? 0x7ef2ff
          : meta.tierBadge === 'SILVER MEDAL'
            ? 0xe8f5ff
            : 0xffe48c;
      const mat = new THREE.SpriteMaterial({
        map: sparkleTex,
        color: glintColor,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.renderOrder = 6;
      const phase = (i / sparkleCount) * Math.PI * 2;
      const baseRadius = 0.24 + (i % 3) * 0.075;
      const baseY = 0.34 + ((i * 0.19) % 0.62);
      const baseScale = meta.tierBadge === 'PLATINUM CROWN' ? 0.13 : 0.1;
      sprite.position.set(Math.cos(phase) * baseRadius, baseY, Math.sin(phase) * baseRadius);
      sprite.scale.set(baseScale, baseScale, 1);
      root.add(sprite);
      sparkleTracks.push({
        sprite,
        baseRadius,
        baseY,
        phase,
        speed: 0.55 + (i % 4) * 0.22,
        baseScale,
      });
    }
  }

  // Graceful 5.5 RPM showcase rotation speed (museum-luxury tempo!)
  const TURNTABLE_RAD_PER_SEC = (5.5 * Math.PI * 2) / 60;
  let elapsedSec = 0;

  return {
    spec,
    root,
    turntableGroup,
    update(dtSec: number): void {
      const clampedDt = Math.min(0.05, Math.max(0, dtSec));
      elapsedSec += clampedDt;
      turntableGroup.rotation.y += clampedDt * TURNTABLE_RAD_PER_SEC;

      for (let i = 0; i < plinthBulbMats.length; i++) {
        plinthBulbMats[i].emissiveIntensity = sampleChasingMarqueeBulbIntensity(
          i,
          plinthBulbMats.length,
          elapsedSec,
          unlocked ? 2.15 : 1.15,
          !unlocked,
        );
      }

      for (let i = 0; i < sparkleTracks.length; i++) {
        const st = sparkleTracks[i];
        const angle = st.phase + elapsedSec * st.speed * 0.45;
        const twinkle = Math.pow(0.5 + 0.5 * Math.sin(elapsedSec * (2.6 + st.speed) + st.phase * 2.3), 2.4);
        st.sprite.position.set(
          Math.cos(angle) * st.baseRadius,
          st.baseY + Math.sin(elapsedSec * 1.4 + st.phase) * 0.035,
          Math.sin(angle) * st.baseRadius,
        );
        const s = st.baseScale * (0.45 + 0.85 * twinkle);
        st.sprite.scale.set(s, s, 1);
        st.sprite.material.opacity = 0.12 + 0.78 * twinkle;
      }

      updateKineticSubparts?.(elapsedSec, clampedDt);
    },
    dispose(): void {
      disposeObject3DTree(root);
    },
  };
}

// ----------------------------------------------------------------------------
// 5. `LitTrophyVaultRendererV7` — Dedicated 1966 NBC/CBS "In Living Color"
//    Revolving Prize Showcase Studio (4-Point Jewelers' Rig + Spotlight Cone +
//    Interactive Drag-to-Inspect!)
// ----------------------------------------------------------------------------

export interface LitTrophyVaultRendererConfigV7 {
  container: HTMLElement;
  sharedEnvMap?: THREE.Texture | null;
  initialTrophyId?: string;
  unlocked?: boolean;
}

interface BuiltShowcaseStudioBackdrop {
  readonly group: THREE.Group;
  readonly archBulbMats: THREE.MeshStandardMaterial[];
  readonly starburstRosette: THREE.Group;
  readonly spotlightConeMat: THREE.MeshBasicMaterial;
}

function buildLivingColorShowcaseBackdrop(
  envMap: THREE.Texture | null,
): BuiltShowcaseStudioBackdrop {
  const group = new THREE.Group();
  group.name = 'LivingColor1966PrizeShowcaseStudioSet';

  const goldMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const cobaltArchMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e56c5,
    metalness: 0.25,
    roughness: 0.18,
    clearcoat: 0.85,
    clearcoatRoughness: 0.09,
    envMap,
    envMapIntensity: 1.45,
  });

  // 1. Curved Peacock Navy & CBS Royal Cobalt Soundstage Cyclorama Alcove
  const cycProfile = [
    new THREE.Vector2(3.15, -0.85),
    new THREE.Vector2(3.15, 2.85),
  ];
  const cycGeom = new THREE.LatheGeometry(cycProfile, 64, Math.PI * 0.62, Math.PI * 0.76);
  const cycMat = new THREE.MeshBasicMaterial({
    map: getLivingColorCycloramaTexture(),
    side: THREE.BackSide,
    toneMapped: false,
  });
  const cycWall = new THREE.Mesh(cycGeom, cycMat);
  cycWall.position.set(0, 0.25, 0.75);
  cycWall.name = 'PeacockCobaltStudioCyclorama';
  group.add(cycWall);

  // 2. Deep Glossy Peacock Midnight Studio Stage Floor (rich navy — zero salmon glare!)
  const stageDeckMat = new THREE.MeshPhysicalMaterial({
    color: 0x091c3a,
    metalness: 0.22,
    roughness: 0.22,
    clearcoat: 0.78,
    clearcoatRoughness: 0.12,
    reflectivity: 0.88,
    envMap,
    envMapIntensity: 0.95,
  });
  const stageDeck = createFilletedShaft({
    radius: 2.45,
    height: 0.08,
    baseCollarFlare: 0.02,
    neckCollarFlare: 0.01,
    anglageBevel: 0.008,
    radialSegments: 64,
    material: stageDeckMat,
    castShadow: false,
    receiveShadow: true,
    name: 'LivingColorGlossyStageFloor',
  });
  stageDeck.position.y = -0.08;
  group.add(stageDeck);

  for (const ringR of [0.58, 0.78, 1.04]) {
    const floorBrassInlay = new THREE.Mesh(
      new THREE.TorusGeometry(ringR, ringR === 0.78 ? 0.008 : 0.006, 12, 64),
      ringR === 1.04 ? aluminumMat : goldMat,
    );
    floorBrassInlay.rotation.x = Math.PI * 0.5;
    floorBrassInlay.position.y = 0.002;
    group.add(floorBrassInlay);
  }

  // 3. Subtle Overhead Volumetric Studio Spotlight Cone washing the turntable!
  const beamGeom = new THREE.CylinderGeometry(0.24, 0.84, 2.25, 40, 1, true);
  const spotlightConeMat = new THREE.MeshBasicMaterial({
    map: getSpotlightBeamTexture(),
    color: 0xffeec4,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const beamMesh = new THREE.Mesh(beamGeom, spotlightConeMat);
  beamMesh.position.set(0, 1.12, -0.06);
  beamMesh.renderOrder = 2;
  beamMesh.name = 'OverheadStudioSpotlightCone';
  group.add(beamMesh);

  // 4. Sculpted CBS Royal Cobalt Proscenium Arch + 15 Chasing `#11` Warm Tungsten Marquee Bulbs
  const archCenterY = 0.38;
  const archZ = -1.04;
  const cobaltProscenium = createChamferedArch({
    innerRadius: 0.86,
    outerRadius: 1.02,
    depth: 0.075,
    arcAngle: Math.PI * 1.14,
    startAngle: -Math.PI * 0.07,
    material: cobaltArchMat,
    name: 'CobaltShowcaseProsceniumArch',
  });
  cobaltProscenium.position.set(0, archCenterY, archZ);

  const innerGoldTrim = createChamferedArch({
    innerRadius: 0.822,
    outerRadius: 0.865,
    depth: 0.088,
    arcAngle: Math.PI * 1.14,
    startAngle: -Math.PI * 0.07,
    material: aluminumMat,
    name: 'AnodizedShowcaseInnerArch',
  });
  innerGoldTrim.position.set(0, archCenterY, archZ + 0.01);
  group.add(cobaltProscenium, innerGoldTrim);

  const archBulbMats: THREE.MeshStandardMaterial[] = [];
  const archBulbCount = 15;
  const bulbArcSpan = Math.PI * 1.06;
  const bulbArcStart = -Math.PI * 0.03;
  const bulbOrbitR = 0.94;
  for (let i = 0; i < archBulbCount; i++) {
    const a = bulbArcStart + (i / (archBulbCount - 1)) * bulbArcSpan;
    const bx = Math.cos(a) * bulbOrbitR;
    const by = archCenterY + Math.sin(a) * bulbOrbitR;

    const socket = createNotchedBezel({
      notchShape: 'SCALLOP',
      outerRadius: 0.04,
      innerRadius: 0.02,
      thickness: 0.022,
      bevel: 0.005,
      material: goldMat,
      name: `ArchMarqueeSocket_${i}`,
    });
    socket.rotation.x = Math.PI * 0.5;
    socket.position.set(bx, by, archZ + 0.042);

    const bMat = new THREE.MeshStandardMaterial({
      color: 0xfff7e0,
      emissive: 0xffcb5c,
      emissiveIntensity: 1.25,
      roughness: 0.12,
      metalness: 0.04,
    });
    const bulb = createTurnedOrb({
      radius: 0.03,
      radialSegments: 20,
      material: bMat,
      castShadow: false,
      receiveShadow: false,
      name: `ArchMarqueeBulb11_${i}`,
    });
    bulb.position.set(bx, by, archZ + 0.062);

    group.add(socket, bulb);
    archBulbMats.push(bMat);
  }

  // 5. Flat Architectural Peacock-Cobalt Upstage Starburst Relief (NO distracting center orb!)
  const calmCobaltRosetteMat = new THREE.MeshPhysicalMaterial({
    color: 0x103568,
    metalness: 0.28,
    roughness: 0.42,
    clearcoat: 0.25,
    envMap,
    envMapIntensity: 0.6,
  });
  const calmTealRosetteMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c4b66,
    metalness: 0.24,
    roughness: 0.42,
    clearcoat: 0.25,
    envMap,
    envMapIntensity: 0.6,
  });
  const starburstRosette = createSculptedStarburstMini({
    radius: 0.82,
    rays: 16,
    depth: 0.022,
    primaryMat: calmCobaltRosetteMat,
    accentMat: calmTealRosetteMat,
    orbMat: calmCobaltRosetteMat,
    name: 'UpstageLivingColorStarburst',
  });
  // Flatten the upstage center hub completely so open-frame trophies (#22/#27/#30/#33) stay razor-clear!
  const rosetteHub = starburstRosette.children[starburstRosette.children.length - 1];
  if (rosetteHub) rosetteHub.visible = false;
  starburstRosette.position.set(0, 0.48, -1.72);
  group.add(starburstRosette);

  return { group, archBulbMats, starburstRosette, spotlightConeMat };
}

interface SweptRadialSlice {
  readonly r: number;
  readonly y: number;
}

/**
 * Extracts a 24-slice 360°-swept cylindrical envelope `(r, y)` of a trophy tree
 * (skipping floor/cushion contact shadows tagged `__excludeFromEnvelope`) so
 * `frameCameraToActiveEnvelope` guarantees exact `76%–82%` viewport fill (`0%` clipping)!
 */
function measureTrophySweptEnvelope(root: THREE.Object3D): SweptRadialSlice[] {
  root.updateMatrixWorld(true);
  let minY = Infinity;
  let maxY = -Infinity;
  const v = new THREE.Vector3();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if ((mesh.userData as Record<string, unknown>).__excludeFromEnvelope === true) return;
    const pos = mesh.geometry.getAttribute('position');
    if (!pos) return;
    for (let i = 0; i < pos.count; i += 2) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
  });

  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || maxY <= minY) {
    return [
      { r: 0.48, y: 0.0 },
      { r: 0.36, y: 1.05 },
    ];
  }

  const bins = 24;
  const maxRadii = new Float32Array(bins);
  const spanY = Math.max(0.01, maxY - minY);

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if ((mesh.userData as Record<string, unknown>).__excludeFromEnvelope === true) return;
    const pos = mesh.geometry.getAttribute('position');
    if (!pos) return;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      const r = Math.hypot(v.x, v.z);
      const idx = Math.min(bins - 1, Math.max(0, Math.floor(((v.y - minY) / spanY) * bins)));
      if (r > maxRadii[idx]) maxRadii[idx] = r;
    }
  });

  const slices: SweptRadialSlice[] = [
    { r: maxRadii[0], y: minY },
    { r: maxRadii[bins - 1], y: maxY },
  ];
  for (let b = 0; b < bins; b++) {
    const yMid = minY + ((b + 0.5) / bins) * spanY;
    slices.push({ r: maxRadii[b], y: yMid });
  }
  return slices;
}

export class LitTrophyVaultRendererV7 {
  public readonly container: HTMLElement;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly envMap: THREE.Texture;

  private readonly ownedEnvRT: THREE.WebGLRenderTarget;
  private readonly studioBackdrop: BuiltShowcaseStudioBackdrop;
  private readonly marqueeFrontGlow: THREE.PointLight;
  private readonly resizeObserver: ResizeObserver | null = null;
  private activeBuilt: BuiltTrophySculptureV7 | null = null;
  private activeEnvelope: SweptRadialSlice[] = [];
  private activeUnlocked = true;
  private rafId: number | null = null;
  private lastNowMs = 0;
  private studioElapsedSec = 0;
  private isDisposed = false;

  // Interactive Smash-Bros-style drag-to-rotate inspection state
  private isDragging = false;
  private dragLastX = 0;
  private dragAngularVel = 0;
  private readonly onPointerDownBound: (e: PointerEvent) => void;
  private readonly onPointerMoveBound: (e: PointerEvent) => void;
  private readonly onPointerUpBound: () => void;

  constructor(config: LitTrophyVaultRendererConfigV7) {
    this.container = config.container;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.setClearColor(0x0b1d30, 1.0);
    this.renderer.setPixelRatio(
      Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.0),
    );
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.cursor = 'grab';
    this.renderer.domElement.style.touchAction = 'pan-y';
    this.container.appendChild(this.renderer.domElement);

    // Always bake a context-local PMREM studio environment map on THIS WebGL2 context!
    // Never bind a RenderTarget texture (`config.sharedEnvMap`) owned by another WebGLRenderer context.
    this.ownedEnvRT = bakeWarmTungstenIblV7(this.renderer);
    this.envMap = this.ownedEnvRT.texture;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1d30);
    this.scene.environment = this.envMap;
    this.scene.environmentIntensity = 1.32;

    // ------------------------------------------------------------------------
    // 4-Point Museum Jewelers' Studio Lighting Rig (Rich Contrast, Zero Washout!)
    // ------------------------------------------------------------------------
    // 1) Warm 3200K Quartz-Tungsten Key Light (front-right high)
    const warmKeyLight = new THREE.DirectionalLight(0xfff0d4, 2.2);
    warmKeyLight.position.set(2.55, 3.65, 3.35);

    // 2) Living Color Peacock Cyan Studio Cross-Fill Light (front-left)
    const cyanFillLight = new THREE.DirectionalLight(0x00cce4, 1.2);
    cyanFillLight.position.set(-2.85, 1.9, 2.45);

    // 3) 24K Harvest Marquee Gold Back-Rim Specular Kicker (crisp silhouette halo!)
    const goldRimLight = new THREE.DirectionalLight(0xffbd38, 2.35);
    goldRimLight.position.set(-1.55, 3.25, -2.85);

    // 4) Overhead Crisp White Jewelers' Crown Highlight (sparks bevel edges cleanly)
    const crownSpecLight = new THREE.DirectionalLight(0xffffff, 0.92);
    crownSpecLight.position.set(0.65, 4.6, 1.65);

    // Clean TV Warm Cream sky + deep Peacock Cobalt stage bounce
    const studioHemi = new THREE.HemisphereLight(0xfff2dc, 0x0c2452, 0.64);

    // Dynamic front-plinth tungsten / sapphire bounce light (updates with unlocked state!)
    this.marqueeFrontGlow = new THREE.PointLight(0xffcf6e, 0.56, 3.2, 1.6);
    this.marqueeFrontGlow.position.set(0, 0.36, 0.86);

    this.scene.add(
      warmKeyLight,
      cyanFillLight,
      goldRimLight,
      crownSpecLight,
      studioHemi,
      this.marqueeFrontGlow,
    );

    this.studioBackdrop = buildLivingColorShowcaseBackdrop(this.envMap);
    this.scene.add(this.studioBackdrop.group);

    const w = Math.max(64, this.container.clientWidth || 180);
    const h = Math.max(64, this.container.clientHeight || 158);
    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 25);
    this.camera.position.set(0, 0.96, 2.55);
    this.camera.lookAt(0, 0.54, 0);
    this.resize(w, h);

    // Interactive pointer drag-to-spin inspection (mouse & touch friendly!)
    this.onPointerDownBound = (e: PointerEvent) => {
      this.isDragging = true;
      this.dragLastX = e.clientX;
      this.dragAngularVel = 0;
      this.renderer.domElement.style.cursor = 'grabbing';
      try {
        this.renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic events may not carry active pointer capture
      }
    };
    this.onPointerMoveBound = (e: PointerEvent) => {
      if (!this.isDragging || !this.activeBuilt) return;
      const dx = e.clientX - this.dragLastX;
      this.dragLastX = e.clientX;
      const deltaRad = dx * 0.012;
      this.activeBuilt.turntableGroup.rotation.y += deltaRad;
      this.dragAngularVel = deltaRad * 32.0;
    };
    this.onPointerUpBound = () => {
      this.isDragging = false;
      this.renderer.domElement.style.cursor = 'grab';
    };
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDownBound);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMoveBound);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUpBound);
    this.renderer.domElement.addEventListener('pointercancel', this.onPointerUpBound);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        if (this.isDisposed) return;
        for (const entry of entries) {
          const cw = entry.contentRect.width;
          const ch = entry.contentRect.height;
          if (cw >= 32 && ch >= 32) {
            this.resize(cw, ch);
            if (this.rafId === null) {
              this.renderFrameNow(0);
            }
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }

    this.setTrophy(config.initialTrophyId ?? 'trophy_s1_01', config.unlocked ?? true);
  }

  private frameCameraToActiveEnvelope(): void {
    if (this.activeEnvelope.length === 0) return;

    const TARGET_FILL = 0.79;
    const elevRad = (11.5 * Math.PI) / 180;
    const sinE = Math.sin(elevRad);
    const cosE = Math.cos(elevRad);

    let lookY = 0.54;
    let dist = 2.55;
    const probe = new THREE.Vector3();

    for (let iter = 0; iter < 8; iter++) {
      this.camera.position.set(0, lookY + dist * sinE, dist * cosE);
      this.camera.lookAt(0, lookY, 0);
      this.camera.updateMatrixWorld(true);

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (let i = 0; i < this.activeEnvelope.length; i++) {
        const { r, y } = this.activeEnvelope[i];
        const candidates: readonly [number, number, number][] = [
          [0, y, r],
          [0, y, -r],
          [r, y, 0],
          [r * 0.96, y, r * 0.28],
        ];
        for (let c = 0; c < candidates.length; c++) {
          probe.set(candidates[c][0], candidates[c][1], candidates[c][2]).project(this.camera);
          if (probe.x < minX) minX = probe.x;
          if (probe.x > maxX) maxX = probe.x;
          if (probe.y < minY) minY = probe.y;
          if (probe.y > maxY) maxY = probe.y;
        }
      }

      const fillX = (maxX - minX) * 0.5;
      const fillY = (maxY - minY) * 0.5;
      const dominantFill = Math.max(0.05, fillX, fillY);
      const midNdcY = (minY + maxY) * 0.5;

      const halfVertWorld = dist * Math.tan((this.camera.fov * Math.PI) / 360);
      lookY += midNdcY * halfVertWorld * 0.88;
      dist = Math.min(4.8, Math.max(1.42, dist * (dominantFill / TARGET_FILL)));
    }

    this.camera.position.set(0, lookY + dist * sinE, dist * cosE);
    this.camera.lookAt(0, lookY, 0);
    this.camera.updateMatrixWorld(true);
  }

  public setTrophy(trophyId: string, unlocked = true): TrophySpecV7 {
    const spec = getTrophySpecV7(trophyId) ?? TROPHY_CATALOG_V7[0];
    this.activeUnlocked = unlocked;
    if (this.activeBuilt) {
      this.scene.remove(this.activeBuilt.root);
      this.activeBuilt.dispose();
      this.activeBuilt = null;
    }
    this.activeBuilt = buildTrophySculptureV7(spec, this.envMap, { unlocked });
    // Start at a flattering hero 3/4 front angle so the engraved nameplate & sculpture pop immediately!
    this.activeBuilt.turntableGroup.rotation.y = -0.24;
    this.dragAngularVel = 0;

    // Tune spotlight cone & plinth bounce light dramatically between Unlocked Gold & Locked Mystery!
    this.marqueeFrontGlow.color.setHex(unlocked ? 0xffcb62 : 0x4ba8e6);
    this.marqueeFrontGlow.intensity = unlocked ? 0.58 : 0.42;
    this.studioBackdrop.spotlightConeMat.color.setHex(unlocked ? 0xffeec4 : 0x7ac7f0);
    this.studioBackdrop.spotlightConeMat.opacity = unlocked ? 0.26 : 0.18;

    this.scene.add(this.activeBuilt.root);
    this.activeEnvelope = measureTrophySweptEnvelope(this.activeBuilt.root);
    this.frameCameraToActiveEnvelope();
    this.renderFrameNow(0);
    return spec;
  }

  /** Sets turntable yaw rotation explicitly (useful for hero inspections & studio renders). */
  public setYawAngle(radians: number): void {
    if (this.activeBuilt) {
      this.activeBuilt.turntableGroup.rotation.y = radians;
      this.renderer.render(this.scene, this.camera);
    }
  }

  public resize(width: number, height: number): void {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const aspect = w / h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = aspect;
    this.camera.fov = 32;
    this.camera.updateProjectionMatrix();
    this.frameCameraToActiveEnvelope();
  }

  public renderFrameNow(dtSec = 1 / 60): void {
    if (this.isDisposed) return;
    const clampedDt = Math.min(0.05, Math.max(0, dtSec));
    this.studioElapsedSec += clampedDt;

    if (this.activeBuilt) {
      if (this.isDragging) {
        // Keep kinetic subparts & bulbs alive while user drags, without fighting drag yaw
        const savedYaw = this.activeBuilt.turntableGroup.rotation.y;
        this.activeBuilt.update(clampedDt);
        this.activeBuilt.turntableGroup.rotation.y = savedYaw;
      } else {
        this.activeBuilt.update(clampedDt);
        if (Math.abs(this.dragAngularVel) > 0.005) {
          this.activeBuilt.turntableGroup.rotation.y += this.dragAngularVel * clampedDt;
          this.dragAngularVel *= Math.pow(0.08, clampedDt);
        } else {
          this.dragAngularVel = 0;
        }
      }
    }

    const archBulbs = this.studioBackdrop.archBulbMats;
    for (let i = 0; i < archBulbs.length; i++) {
      archBulbs[i].emissiveIntensity = sampleChasingMarqueeBulbIntensity(
        i,
        archBulbs.length,
        this.studioElapsedSec,
        this.activeUnlocked ? 1.85 : 1.05,
        !this.activeUnlocked,
      );
      archBulbs[i].emissive.setHex(this.activeUnlocked ? 0xffcb5c : 0x3b8ec4);
    }
    this.studioBackdrop.starburstRosette.rotation.z = -this.studioElapsedSec * 0.085;

    this.renderer.render(this.scene, this.camera);
  }

  public start(): void {
    if (this.isDisposed || this.rafId !== null) return;
    this.lastNowMs = performance.now();
    const tick = (nowMs: number) => {
      if (this.isDisposed) return;
      this.rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastNowMs) * 0.001));
      this.lastNowMs = nowMs;
      this.renderFrameNow(dt);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDownBound);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMoveBound);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUpBound);
    this.renderer.domElement.removeEventListener('pointercancel', this.onPointerUpBound);
    if (this.activeBuilt) {
      this.scene.remove(this.activeBuilt.root);
      this.activeBuilt.dispose();
      this.activeBuilt = null;
    }
    this.scene.remove(this.studioBackdrop.group);
    disposeObject3DTree(this.studioBackdrop.group);
    this.ownedEnvRT.dispose();
    this.renderer.dispose();
    try {
      this.renderer.forceContextLoss();
    } catch {
      // Context may already be lost in headless/unmounted teardown
    }
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
