// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Living Color Master)
// `src/v7/engine/LitTrophyVaultV7.ts`
//  - `TROPHY_CATALOG_V7[36]` — 1:1 Canonical IDs `trophy_s1_01`..`trophy_s4_36`
//    (9 per Season across all 12 `sculptKind` broadcast & horological archetypes)
//  - `LitTrophyVaultRendererV7` — Radiant 1966 NBC/CBS "In Living Color"
//    Revolving Prize Turntable (*Sale of the Century* showcase style):
//      * Peacock Navy (`#0D2238`) & CBS Royal Cobalt (`#1E56C5`) curved studio
//        cyclorama & starburst proscenium backdrop (zero brown gloom!)
//      * Chasing `#11` warm 2700K tungsten marquee bulbs around both the
//        revolving turntable drum and studio showcase arch
//      * Clearcoated revolving plinth (`clearcoat: 0.85`) w/ backlit Living
//        Color Acrylite top stage & 24K Harvest Gold vernier crown
//      * 3-point Warm / Cyan / Gold studio lighting across all 36 sculpted
//        awards with zero primitive boxes!
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
  createFilletedShaft,
  createGrandFeuEnamelMaterial,
  createMidCenturyStarburst,
  createNotchedBezel,
  createPlatinumMaterial,
  createTurnedOrb,
  createWalnutMaterial,
  disposeObject3DTree,
} from './HorologicalCAD';

// ----------------------------------------------------------------------------
// 0. Shared Deterministic 1966 Living Color Procedural Textures (DOM-Free!)
// ----------------------------------------------------------------------------

let cachedShowcaseCycTex: THREE.DataTexture | null = null;
let cachedAcryliteStageTex: THREE.DataTexture | null = null;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generates a 512x512 sRGB curved soundstage cyclorama texture in authentic
 * 1966 NBC/CBS "In Living Color" Peacock Navy (`#0D2238`), Burbank Peacock
 * (`#12394A`), CBS Royal Cobalt (`#1E56C5`), and Peacock Teal (`#0096A6`)
 * with subtle vertical broadcast curtain pleats and center spotlight bloom.
 */
function getLivingColorCycloramaTexture(): THREE.DataTexture {
  if (cachedShowcaseCycTex) return cachedShowcaseCycTex;

  const size = 512;
  const bytes = new Uint8Array(size * size * 4);

  for (let py = 0; py < size; py++) {
    const v = py / (size - 1); // 0 = bottom, 1 = top
    for (let px = 0; px < size; px++) {
      const u = px / (size - 1); // 0 .. 1 across arc
      const dx = (u - 0.5) * 2.0;
      const dy = (v - 0.46) * 2.0;
      const radial = Math.sqrt(dx * dx * 0.85 + dy * dy * 0.95);

      // Center CBS Royal Cobalt & Peacock Teal studio cove pool -> 30 Rock Peacock Navy surround
      const centerGlow = Math.pow(clamp01(1.0 - radial * 0.78), 1.65);
      const tealHalo = Math.pow(clamp01(1.0 - Math.abs(radial - 0.34) * 2.4), 2.0) * 0.36;
      const warmSpot = Math.pow(clamp01(1.0 - radial * 1.35), 2.8) * 0.24;

      // Subtle vertical 1966 network studio traveler-curtain / louver shimmer
      const pleatWave = 0.5 + 0.5 * Math.sin(u * Math.PI * 38.0);
      const pleatMod = 0.94 + 0.11 * pleatWave * (0.35 + 0.65 * centerGlow);

      // Base: Unified 1966 Midnight Navy (#0B1D30 -> 11, 29, 48)
      // Mid: CBS Royal Cobalt (#1E56C5 -> 30, 86, 197)
      // Highlight: Living Color Peacock Teal (#0096A6 -> 0, 150, 166) + Harvest Gold kiss (#F4A91F)
      let r = lerp(11, 30, centerGlow) + tealHalo * 6 + warmSpot * 98;
      let g = lerp(29, 88, centerGlow) + tealHalo * 134 + warmSpot * 74;
      let b = lerp(48, 202, centerGlow) + tealHalo * 150 + warmSpot * 28;

      // Upper studio grid soft falloff & lower cobalt horizon sheen
      const horizonLift = Math.pow(clamp01(1.0 - Math.abs(v - 0.24) * 3.2), 2.0) * 0.18;
      r = (r + horizonLift * 18) * pleatMod;
      g = (g + horizonLift * 54) * pleatMod;
      b = (b + horizonLift * 110) * pleatMod;

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

/**
 * Generates a 256x256 frosted backlit Acrylite radial diffuser texture for the
 * revolving prize plinth top plate (100% safe in both Browser and Node).
 */
function getBacklitAcryliteStageTexture(): THREE.DataTexture {
  if (cachedAcryliteStageTex) return cachedAcryliteStageTex;

  const size = 256;
  const bytes = new Uint8Array(size * size * 4);
  for (let py = 0; py < size; py++) {
    const dy = (py / (size - 1) - 0.5) * 2.0;
    for (let px = 0; px < size; px++) {
      const dx = (px / (size - 1) - 0.5) * 2.0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const core = clamp01(1.0 - dist * 0.82);
      const ring = Math.pow(clamp01(1.0 - Math.abs(dist - 0.68) * 5.5), 2.0) * 0.22;
      const lum = clamp01(0.58 + 0.42 * Math.pow(core, 1.35) + ring);
      const vByte = Math.round(lum * 255);
      const i4 = (py * size + px) * 4;
      bytes[i4] = vByte;
      bytes[i4 + 1] = vByte;
      bytes[i4 + 2] = Math.min(255, vByte + 8);
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

/**
 * Sculpted diamond-kite 1966 Mid-Century starburst ray geometry (`ExtrudeGeometry`
 * with 3-segment bevel — zero rectangular stick boxes!).
 */
function createSculptedStarburstRayGeometry(
  length: number,
  halfWidth: number,
  depth = 0.046,
): THREE.ExtrudeGeometry {
  const bevel = 0.008;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.04);
  shape.lineTo(halfWidth, length * 0.28);
  shape.lineTo(0, length);
  shape.lineTo(-halfWidth, length * 0.28);
  shape.closePath();

  const coreDepth = Math.max(0.006, depth - bevel * 2);
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: coreDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  });
  geom.translate(0, 0, -coreDepth * 0.5);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Evaluates a warm 3-circuit 1966 mechanical cam-chaser bulb intensity (`2700K`
 * `#11` tungsten filament thermal rise & incandescent afterglow — never harsh digital!).
 */
function sampleChasingMarqueeBulbIntensity(
  bulbIndex: number,
  totalBulbs: number,
  timeSec: number,
  speedHz = 2.1,
): number {
  const phase = ((bulbIndex / Math.max(1, totalBulbs)) * 3.0 - timeSec * speedHz) % 1.0;
  const wrapped = phase < 0 ? phase + 1.0 : phase;
  const wave = 0.5 + 0.5 * Math.cos(wrapped * Math.PI * 2.0);
  // Warm 2700K filament stays softly lit at 0.42 baseline and blazes to 2.25 on peak
  return 0.42 + 1.83 * Math.pow(wave, 2.2);
}

// ----------------------------------------------------------------------------
// 1. Shared 256px 1966 "In Living Color" Studio Lightbox IBL (`PMREMGenerator`)
//    (Preserves canonical `bakeWarmTungstenIblV7` export signature!)
// ----------------------------------------------------------------------------

export function bakeWarmTungstenIblV7(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const studioScene = new THREE.Scene();
  // Unified 1966 Midnight Navy (#0B1D30) surround (ZERO dark-brown gloom!)
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

  // Overhead 3200K warm quartz-tungsten studio grid bank
  addStudioSoftboxDisc(7.5, 0xfff2dc, 3.85, [0, 9.4, 1.4]);
  // Key 24K Harvest Marquee Gold specular reflector (front-right)
  addStudioSoftboxDisc(5.2, 0xffd166, 4.15, [6.6, 5.2, 6.0]);
  // Living Color Peacock Cyan cross-wash bank (front-left)
  addStudioSoftboxDisc(5.2, 0x00d4e8, 3.15, [-6.8, 4.8, 5.4]);
  // CBS Royal Cobalt studio cyclorama rim reflector (back-left)
  addStudioSoftboxDisc(5.8, 0x1e56c5, 2.85, [-5.6, 3.8, -6.5]);
  // Atomic Carnaby Tangerine / Gold kicker strip (back-right)
  addStudioSoftboxDisc(5.4, 0xff8547, 2.65, [5.6, 3.6, -6.2]);
  // Glossy Peacock & Royal Cobalt stage floor bounce (zero brown mud!)
  addStudioSoftboxDisc(9.5, 0x184676, 1.85, [0, -4.5, 0]);

  const rt = pmrem.fromScene(studioScene, 0.03);
  disposeObject3DTree(studioScene);
  pmrem.dispose();
  return rt;
}

// ----------------------------------------------------------------------------
// 2. Canonical 36-Award Catalog (`TROPHY_CATALOG_V7` — `trophy_s1_01`..`trophy_s4_36`)
// ----------------------------------------------------------------------------

export const TROPHY_CATALOG_V7: readonly TrophySpecV7[] = [
  // ======================== SEASON 1 (01 .. 09) ========================
  {
    trophyId: 'trophy_s1_01',
    season: 1,
    name: 'Studio 6A Tally Ribbon',
    subtitle: 'Season 1 Debut Honors',
    engraving: 'FIRST LIVE CUE — IBC 6A',
    unlockRuleText: 'Win your opening broadcast episode in Studio 6A.',
    materialTier: 'GOLD_24K',
    sculptKind: 'RIBBON_MIC',
  },
  {
    trophyId: 'trophy_s1_02',
    season: 1,
    name: 'Funk Crossfader Platter',
    subtitle: 'Daytime Rhythm Laureate',
    engraving: '112 BPM — ZERO DEAD AIR',
    unlockRuleText: 'Win a Crossfader Boost match without dropping your streak.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'TURNTABLE_PLATTER',
  },
  {
    trophyId: 'trophy_s1_03',
    season: 1,
    name: 'Sweeps Week Starburst',
    subtitle: 'Primetime Jubilee Citation',
    engraving: 'HEX BRIDGE CONNECTED',
    unlockRuleText: 'Complete a continuous Hex-Bridge chain across the Jubilee board.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'HEX_STARBURST',
  },
  {
    trophyId: 'trophy_s1_04',
    season: 1,
    name: 'Burbank Pop-Art Prize Wheel',
    subtitle: '1966 Carnival Stage Medal',
    engraving: 'PRIZE FLAPPER LOCKED',
    unlockRuleText: 'Defeat your Rival inside the 1966 Burbank Pop-Art Carnival.',
    materialTier: 'GOLD_24K',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s1_05',
    season: 1,
    name: 'Amber Chalk Handshake',
    subtitle: 'Contestant Solidarity Seal',
    engraving: 'TRUCE RESPECTED — +0.35X',
    unlockRuleText: 'Honor every Amber Chalk Truce tile across a full match and win.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'ISOLATION_RELAY',
  },
  {
    trophyId: 'trophy_s1_06',
    season: 1,
    name: 'First Shutter Clincher',
    subtitle: 'Lateral Pinning Distinction',
    engraving: 'CALLED ON SHUTTER ONE',
    unlockRuleText: 'Solve a Four-Shutter Reel showcase round on the first clue.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'LARSON_OSCILLOSCOPE',
  },
  {
    trophyId: 'trophy_s1_07',
    season: 1,
    name: 'Klaxon Myth-Breaker',
    subtitle: 'Night Fact-Checker Order',
    engraving: 'OBVIOUS BAIT REJECTED',
    unlockRuleText: 'Dodge a Klaxon Myth trap and nail the true lateral answer.',
    materialTier: 'GOLD_24K',
    sculptKind: 'WURLITZER_LYRE',
  },
  {
    trophyId: 'trophy_s1_08',
    season: 1,
    name: 'Row-C Program Spotter',
    subtitle: 'Sharp-Eyed Studio Vigilance',
    engraving: 'CAUGHT THE AISLE GLINT',
    unlockRuleText: 'Spot the Row-C Rolled-Program Glint during a live booth tell.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ROULETTE_ASTROLABE',
  },
  {
    trophyId: 'trophy_s1_09',
    season: 1,
    name: 'Season One Purse Seal',
    subtitle: 'Quarter-Purse Milestone',
    engraving: 'THREE PURSE SEALS CLEAR',
    unlockRuleText: 'Clear Season 1 and retire your first three Network Purse segments.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'ESCAPEMENT_CROWN',
  },

  // ======================== SEASON 2 (10 .. 18) ========================
  {
    trophyId: 'trophy_s2_10',
    season: 2,
    name: 'Isolation Booth Relay Key',
    subtitle: '1964 Glass Booth Award',
    engraving: '64K BOOTH — SOUNDPROOFED',
    unlockRuleText: 'Prevail inside a sealed 1964 Glass Isolation Booth broadcast.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ISOLATION_RELAY',
  },
  {
    trophyId: 'trophy_s2_11',
    season: 2,
    name: 'Apollo Color-Ring Trace',
    subtitle: '1967 Master Control Distinction',
    engraving: 'MEMORY FLASH CAPTURED',
    unlockRuleText: 'Score a Memory-Ring bonus inside the 1967 Apollo Color Control Pavilion.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'LARSON_OSCILLOSCOPE',
  },
  {
    trophyId: 'trophy_s2_12',
    season: 2,
    name: 'Steel Pier Wurlitzer Lyre',
    subtitle: 'Atlantic City Roadshow Cup',
    engraving: 'BOARDWALK PINBALL WIZARD',
    unlockRuleText: 'Win an Atlantic City Pier roadshow match with Bumper Ricochet.',
    materialTier: 'GOLD_24K',
    sculptKind: 'WURLITZER_LYRE',
  },
  {
    trophyId: 'trophy_s2_13',
    season: 2,
    name: 'Canary Note Incinerator',
    subtitle: 'Uncorrupted Contestant Citation',
    engraving: 'POISONED FIX BURNED',
    unlockRuleText: 'Burn a poisoned backstage Canary note before stepping onstage.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'SUBPOENA_PENDULUM',
  },
  {
    trophyId: 'trophy_s2_14',
    season: 2,
    name: 'Broadcast Dial Dead-Center',
    subtitle: 'Precision Estimation Laureate',
    engraving: 'ZERO TOLERANCE ERROR',
    unlockRuleText: 'Lock an Estimation Dial showcase on the exact target value.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'GEODESIC_ARMILLARY',
  },
  {
    trophyId: 'trophy_s2_15',
    season: 2,
    name: 'Toby’s Mercy Switch',
    subtitle: 'Brotherhood of the Booth',
    engraving: 'EARNED +3 RIVAL TRUST',
    unlockRuleText: 'Reach maximum trust (+3) with Toby Okafor or Carmen Delgado.',
    materialTier: 'GOLD_24K',
    sculptKind: 'RIBBON_MIC',
  },
  {
    trophyId: 'trophy_s2_16',
    season: 2,
    name: 'Lightning Blitz Survivor',
    subtitle: 'Sudden-Death Broadcast Medal',
    engraving: 'FIVE FOR FIVE AT THE BRINK',
    unlockRuleText: 'Survive a high-speed Lightning Blitz round with 100% accuracy.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s2_17',
    season: 2,
    name: 'Solenoid Spark Arrester',
    subtitle: 'Counter-Rigging Engineering',
    engraving: 'BOOTH RIGGING DISARMED',
    unlockRuleText: 'Conquer a rigged Control-Booth Gambit tile without missing.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'PIRATE_KLYSTRON',
  },
  {
    trophyId: 'trophy_s2_18',
    season: 2,
    name: 'Season Two Half-Crown',
    subtitle: 'Midpoint Sovereign Medallion',
    engraving: 'SIX PURSE SEALS RETIRED',
    unlockRuleText: 'Complete Season 2 and unlock the 1965 World’s Fair & Riviera tour.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'HEX_STARBURST',
  },

  // ======================== SEASON 3 (19 .. 27) ========================
  {
    trophyId: 'trophy_s3_19',
    season: 3,
    name: 'Monte Carlo Natural Nine',
    subtitle: '1969 Salle Privée Trophy',
    engraving: 'FIVE-FOUR RIVIERA SWEEP',
    unlockRuleText: 'Win in the 1969 Monte Carlo Casino by over $2,500.',
    materialTier: 'GOLD_24K',
    sculptKind: 'ROULETTE_ASTROLABE',
  },
  {
    trophyId: 'trophy_s3_20',
    season: 3,
    name: 'Meridian Armillary Sphere',
    subtitle: 'World’s Fair Rotunda Award',
    engraving: 'SOLAR MERIDIAN ALIGNED',
    unlockRuleText: 'Claim three Solar Meridian Sweep bonus tiles in one episode.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'GEODESIC_ARMILLARY',
  },
  {
    trophyId: 'trophy_s3_21',
    season: 3,
    name: 'Channel 83 Klystron Valve',
    subtitle: 'Offshore Pirate UHF Citation',
    engraving: '50KW INTERNATIONAL WATERS',
    unlockRuleText: 'Prevail aboard the storm-tossed Channel 83 UHF Barge.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'PIRATE_KLYSTRON',
  },
  {
    trophyId: 'trophy_s3_22',
    season: 3,
    name: 'VIP Jury Laurel Wreath',
    subtitle: 'Balcony Acclamation Order',
    engraving: 'SIX LOGES IN EMERALD BOON',
    unlockRuleText: 'Earn an active VIP Jury Boon blessing during Primetime play.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'TURNTABLE_PLATTER',
  },
  {
    trophyId: 'trophy_s3_23',
    season: 3,
    name: 'Compliance Fresnel Witness',
    subtitle: 'Standards & Practices Citation',
    engraving: '8MS TUNGSTEN FLASH LOGGED',
    unlockRuleText: 'Win a match after exposing a live Compliance Fresnel tell.',
    materialTier: 'GOLD_24K',
    sculptKind: 'ISOLATION_RELAY',
  },
  {
    trophyId: 'trophy_s3_24',
    season: 3,
    name: 'Cartographer’s Meridian Pin',
    subtitle: '3D Relief Globe Mastery',
    engraving: 'WITHIN ONE HUNDRED KM',
    unlockRuleText: 'Pin three 3D Relief Globe targets within top-tier precision.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'ROULETTE_ASTROLABE',
  },
  {
    trophyId: 'trophy_s3_25',
    season: 3,
    name: 'Cyanotype Loupe Inspector',
    subtitle: 'Prussian-Blue Blueprint Prize',
    engraving: 'CUTAWAY ZONE IDENTIFIED',
    unlockRuleText: 'Identify five consecutive Cyanotype cutaway zones cleanly.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'LARSON_OSCILLOSCOPE',
  },
  {
    trophyId: 'trophy_s3_26',
    season: 3,
    name: 'Golden Exit Send-Off',
    subtitle: 'Graceful Rival Retirement',
    engraving: 'WALKED OFF WITH HONOR',
    unlockRuleText: 'Complete a sympathetic Rival’s Golden Exit milestone match.',
    materialTier: 'GOLD_24K',
    sculptKind: 'WURLITZER_LYRE',
  },
  {
    trophyId: 'trophy_s3_27',
    season: 3,
    name: 'Hour-Eleven Coup Seal',
    subtitle: 'Season Three Finale Medallion',
    engraving: 'THE BOOTH CHANGES HANDS',
    unlockRuleText: 'Survive the Hour-11 Booth Coup pivot into Season 4.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'SUBPOENA_PENDULUM',
  },

  // ======================== SEASON 4 (28 .. 36) ========================
  {
    trophyId: 'trophy_s4_28',
    season: 4,
    name: 'Pharma Canopy Interceptor',
    subtitle: 'Regime A Resistance Medal',
    engraving: 'RX CYAN OVERTHROWN',
    unlockRuleText: 'Win a high-stakes match under Roz Korman’s Pharma Coup regime.',
    materialTier: 'GRAND_FEU_ENAMEL',
    sculptKind: 'HEX_STARBURST',
  },
  {
    trophyId: 'trophy_s4_29',
    season: 4,
    name: 'Pirate Carrier Sovereign',
    subtitle: 'Regime B Broadcast Medal',
    engraving: 'UHF VIOLET SIGNAL LOCKED',
    unlockRuleText: 'Win a high-stakes match under Grant Bellamy’s UHF Coup regime.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'PIRATE_KLYSTRON',
  },
  {
    trophyId: 'trophy_s4_30',
    season: 4,
    name: 'Vera’s Forensic Worklight',
    subtitle: 'Regime C Audit Commendation',
    engraving: '4000K — NOTHING HIDDEN',
    unlockRuleText: 'Win a forensic audit match under Vera Karp’s stripped worklights.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'ESCAPEMENT_CROWN',
  },
  {
    trophyId: 'trophy_s4_31',
    season: 4,
    name: 'Five-Slot Trunk Virtuoso',
    subtitle: 'Synergy Mathemagician Cup',
    engraving: 'CHIPS X MULT HARMONIC',
    unlockRuleText: 'Equip a full 5-relic Prop Trunk with dual Foil multipliers.',
    materialTier: 'GOLD_24K',
    sculptKind: 'TURNTABLE_PLATTER',
  },
  {
    trophyId: 'trophy_s4_32',
    season: 4,
    name: 'Clean Quarter-Million Ledger',
    subtitle: 'Unblemished Network Buyout',
    engraving: '$250,000 — ZERO CONTRABAND',
    unlockRuleText: 'Retire all 12 Brass Lien segments on the Clean Purse track.',
    materialTier: 'GOLD_24K',
    sculptKind: 'RIBBON_MIC',
  },
  {
    trophyId: 'trophy_s4_33',
    season: 4,
    name: 'House Marker Syndicate',
    subtitle: 'Shadow Trunk High-Roller',
    engraving: 'CONTRABAND LEDGER SETTLED',
    unlockRuleText: 'Conquer the Contraband House Marker route without getting arrested.',
    materialTier: 'PLATINUM_ONYX',
    sculptKind: 'VAUDEVILLE_RATCHET',
  },
  {
    trophyId: 'trophy_s4_34',
    season: 4,
    name: 'Stage-10 Network Subpoena',
    subtitle: 'Whistle-Blower Grand Jury Seal',
    engraving: 'EXHIBIT A — BOOTH LEDGER',
    unlockRuleText: 'Deliver the Stage-10 Network Rigging Ledger with Vera Karp.',
    materialTier: 'BLUED_STEEL_GOLD',
    sculptKind: 'SUBPOENA_PENDULUM',
  },
  {
    trophyId: 'trophy_s4_35',
    season: 4,
    name: 'Studio 6A Sovereign Crown',
    subtitle: '38th-Floor Penthouse Victor',
    engraving: 'FIFTY MILLION WATCHING',
    unlockRuleText: 'Defeat the final champion inside the 38th-Floor Executive Penthouse.',
    materialTier: 'GOLD_24K',
    sculptKind: 'ESCAPEMENT_CROWN',
  },
  {
    trophyId: 'trophy_s4_36',
    season: 4,
    name: 'World’s Smartest Sovereign',
    subtitle: 'Complete 90-Episode Grand Slam',
    engraving: 'LIVE IN LIVING COLOR',
    unlockRuleText: 'Complete Episode 90 and unlock the Grand Broadcast Masterpiece.',
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
// 3. 1966 "In Living Color" Revolving Prize Plinth & 36 Sculpted Awards
// ----------------------------------------------------------------------------

export interface BuiltTrophySculptureV7 {
  readonly spec: TrophySpecV7;
  readonly root: THREE.Group;
  readonly turntableGroup: THREE.Group;
  update(dtSec: number): void;
  dispose(): void;
}

function getSeasonLivingColorHex(season: TrophySpecV7['season']): number {
  switch (season) {
    case 1:
      return 0x0096a6; // Living Color Peacock Teal
    case 2:
      return 0x16a34a; // Emerald Tote Lamp
    case 3:
      return 0xf4a91f; // Harvest Marquee Gold
    case 4:
      return 0xff6738; // Atomic Carnaby Tangerine
  }
}

function getSculptureMaterials(
  tier: TrophySpecV7['materialTier'],
  season: TrophySpecV7['season'],
  unlocked: boolean,
  envMap: THREE.Texture | null,
) {
  const seasonHex = getSeasonLivingColorHex(season);

  if (!unlocked) {
    // Locked showcase gleams in satin Silver-Chrome, Champagne Gold & Peacock Ice Enamel!
    const lockedPrimary = new THREE.MeshPhysicalMaterial({
      color: 0xb8cae0,
      metalness: 0.88,
      roughness: 0.2,
      clearcoat: 0.55,
      clearcoatRoughness: 0.14,
      envMap,
      envMapIntensity: 1.75,
    });
    const lockedSecondary = new THREE.MeshPhysicalMaterial({
      color: 0xdcc084,
      metalness: 0.9,
      roughness: 0.18,
      clearcoat: 0.5,
      clearcoatRoughness: 0.14,
      envMap,
      envMapIntensity: 1.8,
    });
    const lockedJewel = createGrandFeuEnamelMaterial(0x2a6f97, envMap);
    return {
      primary: lockedPrimary,
      secondary: lockedSecondary,
      jewel: lockedJewel,
      accentMetal: createAnodizedAluminumMaterial(envMap),
    };
  }

  // Crisp 24K Broadcast Gold (#FFD166), CBS Royal Cobalt (#1E56C5), Living Color Enamel & Mirror Platinum!
  const gold24K = new THREE.MeshPhysicalMaterial({
    color: 0xffd166,
    metalness: 0.95,
    roughness: 0.14,
    clearcoat: 0.42,
    clearcoatRoughness: 0.08,
    reflectivity: 1.0,
    envMap,
    envMapIntensity: 1.75,
  });
  const cobaltSteel = createBluedSteelMaterial(0x1e56c5, envMap);
  const enamel = createGrandFeuEnamelMaterial(seasonHex, envMap);
  const ceriseEnamel = createGrandFeuEnamelMaterial(
    season === 4 ? 0xe63b7a : season === 1 ? 0xff6738 : 0x0096a6,
    envMap,
  );
  const platinum = createPlatinumMaterial(envMap);
  const midnightSapphire = new THREE.MeshPhysicalMaterial({
    color: 0x143872, // Royal Cobalt-Sapphire Lacquer (zero muddy black-brown!)
    metalness: 0.28,
    roughness: 0.12,
    clearcoat: 0.92,
    clearcoatRoughness: 0.06,
    envMap,
    envMapIntensity: 1.65,
  });

  switch (tier) {
    case 'GOLD_24K':
      return {
        primary: gold24K,
        secondary: cobaltSteel,
        jewel: enamel,
        accentMetal: platinum,
      };
    case 'BLUED_STEEL_GOLD':
      return {
        primary: cobaltSteel,
        secondary: gold24K,
        jewel: enamel,
        accentMetal: platinum,
      };
    case 'GRAND_FEU_ENAMEL':
      return {
        primary: enamel,
        secondary: gold24K,
        jewel: ceriseEnamel,
        accentMetal: cobaltSteel,
      };
    case 'PLATINUM_ONYX':
      return {
        primary: platinum,
        secondary: gold24K,
        jewel: midnightSapphire,
        accentMetal: enamel,
      };
  }
}

export function buildTrophySculptureV7(
  spec: TrophySpecV7,
  envMap: THREE.Texture | null = null,
  opts: { unlocked?: boolean; scale?: number } = {},
): BuiltTrophySculptureV7 {
  const unlocked = opts.unlocked ?? true;
  const root = new THREE.Group();
  root.name = `LitTrophy_${spec.trophyId}`;
  root.scale.setScalar(opts.scale ?? 1.0);

  const seasonHex = getSeasonLivingColorHex(spec.season);
  const walnutMat = createWalnutMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const goldTrimMat = create24KGoldMaterial(envMap);
  const cobaltBandMat = createBluedSteelMaterial(0x1746a2, envMap);
  const glassMat = createBorosilicateGlassMaterial(0xeaf6ff, 0.34, envMap);
  const mats = getSculptureMaterials(spec.materialTier, spec.season, unlocked, envMap);

  // --------------------------------------------------------------------------
  // A. Stationary 1966 *Sale of the Century* Marquee Turntable Drum (`y = 0..0.072`)
  // --------------------------------------------------------------------------
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

  // 18 Chasing `#11` Warm 2700K Tungsten Marquee Bulbs ringed around stationary skirt!
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
      material: goldTrimMat,
      name: `PlinthMarqueeSocket_${i}`,
    });
    socket.position.set(sinA * socketRadius, 0.045, cosA * socketRadius);
    socket.lookAt(sinA * 2.0, 0.045, cosA * 2.0);
    socket.rotateX(Math.PI * 0.5);
    root.add(socket);

    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfff6dc,
      emissive: 0xffc857,
      emissiveIntensity: 1.15,
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
  // B. Clearcoated Revolving Prize Plinth (`clearcoat: 0.85`, spinning at 6rpm!)
  // --------------------------------------------------------------------------
  const turntableGroup = new THREE.Group();
  turntableGroup.name = 'ClearcoatedRevolvingPrizePlinthGroup';
  turntableGroup.position.y = 0.066;
  root.add(turntableGroup);

  // Explicit `clearcoat: 0.85` 1966 Royal Cobalt / Peacock Lacquer Revolving Plinth!
  const clearcoatedPlinthMat = new THREE.MeshPhysicalMaterial({
    color: unlocked ? 0x164698 : 0x223e60,
    metalness: 0.22,
    roughness: 0.15,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    reflectivity: 0.96,
    envMap,
    envMapIntensity: 1.65,
  });

  const revolvingPlinthDeck = createFilletedShaft({
    radius: 0.395,
    topRadius: 0.38,
    height: 0.088,
    baseCollarFlare: 0.022,
    neckCollarFlare: 0.018,
    anglageBevel: 0.008,
    radialSegments: 64,
    material: clearcoatedPlinthMat,
    name: 'ClearcoatedRevolvingPlinthDeck',
  });

  const aluminumTrimRing = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.416,
    innerRadius: 0.378,
    thickness: 0.022,
    material: aluminumMat,
    name: 'PlinthAnodizedAluminumRing',
  });
  aluminumTrimRing.position.y = 0.02;

  const vernierCrownRim = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.405,
    innerRadius: 0.348,
    thickness: 0.034,
    material: goldTrimMat,
    name: 'Plinth24KVernierCrown',
  });
  vernierCrownRim.position.y = 0.076;

  // Backlit Frosted Living Color Acrylite Top Prize Stage (`clearcoat: 0.85`)
  const acryliteDiffTex = getBacklitAcryliteStageTexture();
  const acryliteTopHex = unlocked ? seasonHex : 0x4b8bb2;
  const backlitAcryliteTopMat = new THREE.MeshPhysicalMaterial({
    color: unlocked ? 0xf7eedb : 0xdceef5,
    map: acryliteDiffTex,
    emissive: acryliteTopHex,
    emissiveMap: acryliteDiffTex,
    emissiveIntensity: unlocked ? 0.62 : 0.34,
    metalness: 0.04,
    roughness: 0.16,
    clearcoat: 0.85,
    clearcoatRoughness: 0.07,
    reflectivity: 0.95,
    envMap,
    envMapIntensity: 1.4,
  });
  const acryliteStageDisc = createFilletedShaft({
    radius: 0.342,
    height: 0.02,
    baseCollarFlare: 0.004,
    neckCollarFlare: 0.004,
    anglageBevel: 0.005,
    radialSegments: 64,
    material: backlitAcryliteTopMat,
    name: 'BacklitAcryliteTopStage',
  });
  acryliteStageDisc.position.y = 0.084;

  turntableGroup.add(revolvingPlinthDeck, aluminumTrimRing, vernierCrownRim, acryliteStageDisc);

  // --------------------------------------------------------------------------
  // C. Sculptural Centerpiece Stem + Season Collar Rings (`y = 0.096` above plinth)
  // --------------------------------------------------------------------------
  const sculpt = new THREE.Group();
  sculpt.name = `SculptureCenterpiece_${spec.sculptKind}`;
  sculpt.position.y = 0.096;
  turntableGroup.add(sculpt);

  const stemBaseMedallion = createNotchedBezel({
    notchShape:
      spec.season === 1
        ? 'HEX'
        : spec.season === 2
          ? 'VERNIER'
          : spec.season === 3
            ? 'SCALLOP'
            : 'WAX_SEAL',
    outerRadius: 0.185,
    innerRadius: 0.075,
    thickness: 0.036,
    material: goldTrimMat,
    name: 'StemSeasonCrestMedallion',
  });
  stemBaseMedallion.position.y = 0.016;
  sculpt.add(stemBaseMedallion);

  const stem = createFilletedShaft({
    radius: 0.068,
    topRadius: 0.056,
    height: 0.24,
    baseCollarFlare: 0.055,
    neckCollarFlare: 0.042,
    anglageBevel: 0.008,
    radialSegments: 48,
    material: mats.secondary,
    name: 'TrophyTurnedPedestalStem',
  });
  sculpt.add(stem);

  // 1..4 Season Honors Collar Rings along the stem so each Season reads unmistakably
  for (let sRing = 0; sRing < spec.season; sRing++) {
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.082 - sRing * 0.003, 0.009, 14, 40),
      mats.jewel,
    );
    ringMesh.rotation.x = Math.PI * 0.5;
    ringMesh.position.y = 0.078 + sRing * 0.034;
    sculpt.add(ringMesh);
  }

  // Optional secondary live kinetic callbacks per sculpture archetype
  let updateKineticSubparts: ((timeSec: number, dtSec: number) => void) | null = null;

  switch (spec.sculptKind) {
    case 'RIBBON_MIC': {
      // Iconic 1966 NBC/RCA 44-BX Ribbon Broadcast Microphone w/ Yoke & Crown Crest
      const yoke = createChamferedArch({
        innerRadius: 0.215,
        outerRadius: 0.265,
        depth: 0.048,
        arcAngle: Math.PI * 1.12,
        startAngle: -Math.PI * 0.06,
        material: mats.secondary,
      });
      yoke.position.y = 0.56;
      yoke.rotation.z = Math.PI;

      for (const side of [-1, 1]) {
        const thumbscrew = createTurnedOrb({
          radius: 0.036,
          heightScale: 0.85,
          material: goldTrimMat,
        });
        thumbscrew.position.set(side * 0.255, 0.58, 0);
        sculpt.add(thumbscrew);
      }

      const pillBody = createFilletedShaft({
        radius: 0.135,
        height: 0.44,
        baseCollarFlare: 0.015,
        neckCollarFlare: 0.015,
        anglageBevel: 0.014,
        radialSegments: 48,
        centered: true,
        material: mats.primary,
      });
      pillBody.position.y = 0.57;

      const topDome = createTurnedOrb({
        radius: 0.132,
        heightScale: 0.62,
        hemiOnly: true,
        material: mats.accentMetal,
      });
      topDome.position.y = 0.78;

      for (let i = -2; i <= 2; i++) {
        const louver = createNotchedBezel({
          notchShape: 'HEX',
          outerRadius: 0.162,
          innerRadius: 0.125,
          thickness: 0.026,
          material: i === 0 ? mats.jewel : mats.secondary,
        });
        louver.position.y = 0.57 + i * 0.068;
        sculpt.add(louver);
      }

      const crestRing = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.082,
        innerRadius: 0.032,
        thickness: 0.032,
        material: mats.jewel,
      });
      crestRing.rotation.x = Math.PI * 0.5;
      crestRing.position.y = 0.84;
      const crestPearl = createTurnedOrb({ radius: 0.04, material: goldTrimMat });
      crestPearl.position.y = 0.84;

      sculpt.add(yoke, pillBody, topDome, crestRing, crestPearl);
      break;
    }

    case 'TURNTABLE_PLATTER': {
      // 1966 Showband Gold Transcription LP Platter & Live Tracking Tonearm
      const tiltedDeck = new THREE.Group();
      tiltedDeck.position.y = 0.58;
      tiltedDeck.rotation.x = 0.82;

      const outerBezel = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.365,
        innerRadius: 0.322,
        thickness: 0.045,
        material: mats.secondary,
      });

      const disc = createFilletedShaft({
        radius: 0.33,
        height: 0.052,
        anglageBevel: 0.008,
        radialSegments: 64,
        centered: true,
        material: mats.primary,
      });

      // Concentric LP micro-groove light-catching rings
      for (const gr of [0.21, 0.255, 0.298]) {
        const groove = new THREE.Mesh(
          new THREE.TorusGeometry(gr, 0.0045, 12, 56),
          mats.accentMetal,
        );
        groove.rotation.x = Math.PI * 0.5;
        groove.position.y = 0.028;
        tiltedDeck.add(groove);
      }

      const labelSeal = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.138,
        innerRadius: 0.032,
        thickness: 0.068,
        material: mats.jewel,
      });
      const spindle = createFilletedShaft({
        radius: 0.024,
        topRadius: 0.014,
        height: 0.11,
        anglageBevel: 0.004,
        radialSegments: 48,
        centered: true,
        material: goldTrimMat,
      });
      spindle.position.y = 0.04;

      const gimbalPivot = new THREE.Group();
      gimbalPivot.position.set(0.27, 0.05, -0.18);
      const gimbalBase = createFilletedShaft({
        radius: 0.046,
        height: 0.075,
        anglageBevel: 0.006,
        radialSegments: 48,
        material: mats.secondary,
      });
      const tonearmCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.065, 0),
        new THREE.Vector3(-0.04, 0.09, 0.22),
        new THREE.Vector3(-0.18, 0.055, 0.37),
      ]);
      const tonearm = new THREE.Mesh(
        new THREE.TubeGeometry(tonearmCurve, 24, 0.015, 14, false),
        mats.accentMetal,
      );
      const headshell = createTurnedOrb({
        radius: 0.028,
        heightScale: 0.65,
        material: mats.jewel,
      });
      headshell.position.set(-0.18, 0.048, 0.375);
      gimbalPivot.add(gimbalBase, tonearm, headshell);

      tiltedDeck.add(outerBezel, disc, labelSeal, spindle, gimbalPivot);

      const topCrest = createMidCenturyStarburst({
        radius: 0.09,
        rays: 8,
        depth: 0.032,
        primaryMat: goldTrimMat,
        accentMat: mats.jewel,
      });
      topCrest.position.set(0, 0.85, -0.08);

      sculpt.add(tiltedDeck, topCrest);

      updateKineticSubparts = (timeSec) => {
        gimbalPivot.rotation.y = Math.sin(timeSec * 1.4) * 0.08;
      };
      break;
    }

    case 'HEX_STARBURST': {
      // 1966 NBC / Goodson-Todman Atomic Starburst w/ Sculpted Kite Rays (Zero boxy sticks!)
      const centerY = 0.54;
      const hexRing = createNotchedBezel({
        notchShape: 'HEX',
        outerRadius: 0.235,
        innerRadius: 0.145,
        thickness: 0.064,
        material: mats.primary,
      });
      hexRing.rotation.x = Math.PI * 0.5;
      hexRing.position.y = centerY;

      const coreOrb = createTurnedOrb({ radius: 0.112, material: mats.jewel });
      coreOrb.position.y = centerY;

      const rayCount = 12;
      const majorRayGeom = createSculptedStarburstRayGeometry(0.345, 0.034, 0.042);
      const minorRayGeom = createSculptedStarburstRayGeometry(0.255, 0.025, 0.034);

      for (let i = 0; i < rayCount; i++) {
        const isMajor = i % 2 === 0;
        const a = (i / rayCount) * Math.PI * 2;
        const ray = new THREE.Mesh(
          isMajor ? majorRayGeom : minorRayGeom,
          isMajor ? mats.secondary : mats.accentMetal,
        );
        ray.position.set(0, centerY, 0);
        ray.rotation.z = a;
        ray.castShadow = true;
        sculpt.add(ray);

        if (isMajor) {
          const tipOrb = createTurnedOrb({
            radius: 0.024,
            material: mats.jewel,
          });
          tipOrb.position.set(-Math.sin(a) * 0.36, centerY + Math.cos(a) * 0.36, 0);
          sculpt.add(tipOrb);
        }
      }

      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.295, 0.012, 16, 56),
        goldTrimMat,
      );
      orbitRing.position.y = centerY;
      orbitRing.rotation.set(0.72, 0.38, 0.25);

      sculpt.add(hexRing, coreOrb, orbitRing);
      updateKineticSubparts = (timeSec) => {
        orbitRing.rotation.y = 0.38 + timeSec * 0.65;
      };
      break;
    }

    case 'VAUDEVILLE_RATCHET': {
      // 1966 Burbank Pop-Art Kaleidoscope Prize Wheel, Chrome Pegs & Live Flapper Clicker (Zero 1926 gears!)
      const cradleArch = createChamferedArch({
        innerRadius: 0.275,
        outerRadius: 0.34,
        depth: 0.052,
        arcAngle: Math.PI * 1.18,
        startAngle: -Math.PI * 0.09,
        material: mats.secondary,
      });
      cradleArch.position.y = 0.59;
      cradleArch.rotation.z = Math.PI;

      const prizeWheelGroup = new THREE.Group();
      prizeWheelGroup.position.y = 0.59;

      const outerWheelRim = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.275,
        innerRadius: 0.21,
        thickness: 0.058,
        material: mats.primary,
      });
      outerWheelRim.rotation.x = Math.PI * 0.5;

      const innerColorRing = createNotchedBezel({
        notchShape: 'HEX',
        outerRadius: 0.21,
        innerRadius: 0.115,
        thickness: 0.048,
        material: mats.jewel,
      });
      innerColorRing.rotation.x = Math.PI * 0.5;

      const wheelStar = createMidCenturyStarburst({
        radius: 0.195,
        rays: 10,
        depth: 0.042,
        primaryMat: goldTrimMat,
        accentMat: mats.accentMetal,
      });

      const pegCount = 12;
      for (let p = 0; p < pegCount; p++) {
        const a = (p / pegCount) * Math.PI * 2;
        const peg = createTurnedOrb({
          radius: 0.019,
          material: p % 2 === 0 ? goldTrimMat : mats.accentMetal,
        });
        peg.position.set(Math.cos(a) * 0.258, Math.sin(a) * 0.258, 0.032);
        prizeWheelGroup.add(peg);
      }

      prizeWheelGroup.add(outerWheelRim, innerColorRing, wheelStar);

      // Top 1966 Broadcast Prize-Wheel Flapper Pointer
      const flapperPivot = new THREE.Group();
      flapperPivot.position.set(0, 0.92, 0.034);
      const flapperHub = createTurnedOrb({ radius: 0.036, material: goldTrimMat });
      const flapperTongue = createFilletedShaft({
        radius: 0.022,
        topRadius: 0.007,
        height: 0.11,
        anglageBevel: 0.004,
        radialSegments: 48,
        material: mats.jewel,
      });
      flapperTongue.rotation.z = Math.PI;
      flapperPivot.add(flapperHub, flapperTongue);

      sculpt.add(cradleArch, prizeWheelGroup, flapperPivot);
      updateKineticSubparts = (timeSec, dtSec) => {
        prizeWheelGroup.rotation.z += dtSec * 0.65;
        flapperPivot.rotation.z = Math.abs(Math.sin(timeSec * 4.2)) * 0.22;
      };
      break;
    }

    case 'ISOLATION_RELAY': {
      // 1958 Soundproof Booth Twin Solenoid Coils, Curved Yoke & Crystal Bell Jar
      const basePlate = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.24,
        innerRadius: 0.05,
        thickness: 0.036,
        material: mats.secondary,
      });
      basePlate.position.y = 0.24;

      for (const cx of [-0.115, 0.115]) {
        const coil = createFilletedShaft({
          radius: 0.072,
          height: 0.34,
          baseCollarFlare: 0.018,
          neckCollarFlare: 0.018,
          anglageBevel: 0.008,
          radialSegments: 48,
          material: mats.primary,
        });
        coil.position.set(cx, 0.255, 0);

        const poleJewel = createTurnedOrb({
          radius: 0.042,
          heightScale: 0.65,
          material: mats.jewel,
        });
        poleJewel.position.set(cx, 0.615, 0);
        sculpt.add(coil, poleJewel);
      }

      const armatureArch = createChamferedArch({
        innerRadius: 0.09,
        outerRadius: 0.155,
        depth: 0.058,
        arcAngle: Math.PI,
        material: mats.accentMetal,
      });
      armatureArch.position.y = 0.63;

      const finialBell = createTurnedOrb({
        radius: 0.088,
        hemiOnly: true,
        material: goldTrimMat,
      });
      finialBell.position.y = 0.79;

      // Crystal-clear Borosilicate Glass Bell-Jar Enclosure + Turned Dome Crown
      const glassCylinder = createFilletedShaft({
        radius: 0.265,
        height: 0.46,
        baseCollarFlare: 0.01,
        neckCollarFlare: 0.004,
        anglageBevel: 0.008,
        radialSegments: 64,
        material: glassMat,
        castShadow: false,
      });
      glassCylinder.position.y = 0.25;

      const glassCrown = createTurnedOrb({
        radius: 0.265,
        heightScale: 0.72,
        hemiOnly: true,
        radialSegments: 64,
        material: glassMat,
        castShadow: false,
      });
      glassCrown.position.y = 0.7;

      sculpt.add(basePlate, armatureArch, finialBell, glassCylinder, glassCrown);
      break;
    }

    case 'LARSON_OSCILLOSCOPE': {
      // 1966 RCA Color Vectorscope Bezel & Live Sweeping Lissajous Signal Trace
      const hood = createFilletedShaft({
        radius: 0.31,
        topRadius: 0.34,
        height: 0.14,
        hollowInnerRadius: 0.245,
        anglageBevel: 0.01,
        radialSegments: 64,
        centered: true,
        material: mats.secondary,
      });
      hood.rotation.x = Math.PI * 0.5;
      hood.position.y = 0.58;

      const bezel = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.355,
        innerRadius: 0.255,
        thickness: 0.065,
        material: mats.primary,
      });
      bezel.rotation.x = Math.PI * 0.5;
      bezel.position.set(0, 0.58, 0.045);

      const screen = createFilletedShaft({
        radius: 0.25,
        height: 0.04,
        anglageBevel: 0.006,
        radialSegments: 64,
        centered: true,
        material: mats.jewel,
      });
      screen.rotation.x = Math.PI * 0.5;
      screen.position.y = 0.58;

      // Crosshair reticle ring + glowing harmonic wave tube
      const graticuleRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.165, 0.006, 12, 48),
        mats.accentMetal,
      );
      graticuleRing.position.set(0, 0.58, 0.032);

      const waveCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.205, 0.58, 0.052),
        new THREE.Vector3(-0.11, 0.71, 0.058),
        new THREE.Vector3(0.0, 0.45, 0.062),
        new THREE.Vector3(0.11, 0.71, 0.058),
        new THREE.Vector3(0.205, 0.58, 0.052),
      ]);
      const waveTrace = new THREE.Mesh(
        new THREE.TubeGeometry(waveCurve, 32, 0.017, 14, false),
        goldTrimMat,
      );

      const vectorHub = createTurnedOrb({ radius: 0.032, material: mats.accentMetal });
      vectorHub.position.set(0, 0.58, 0.065);

      sculpt.add(hood, bezel, screen, graticuleRing, waveTrace, vectorHub);
      break;
    }

    case 'WURLITZER_LYRE': {
      // Atlantic City Showband Golden Lyre & 7 Graduated Fanfare Organ Pipes
      const crossbar = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.245,
        innerRadius: 0.06,
        thickness: 0.04,
        material: mats.jewel,
      });
      crossbar.position.y = 0.245;

      const lyreFrame = createChamferedArch({
        innerRadius: 0.22,
        outerRadius: 0.298,
        depth: 0.056,
        arcAngle: Math.PI * 1.32,
        startAngle: -Math.PI * 0.16,
        material: mats.secondary,
      });
      lyreFrame.position.y = 0.53;
      lyreFrame.rotation.z = Math.PI;

      for (let p = -3; p <= 3; p++) {
        const pipeH = 0.47 - Math.abs(p) * 0.052;
        const pipe = createFilletedShaft({
          radius: 0.023,
          topRadius: 0.028,
          height: pipeH,
          baseCollarFlare: 0.006,
          neckCollarFlare: 0.008,
          anglageBevel: 0.005,
          radialSegments: 48,
          material: p === 0 ? goldTrimMat : mats.primary,
        });
        pipe.position.set(p * 0.055, 0.26, 0);
        sculpt.add(pipe);
      }

      const crownStar = createMidCenturyStarburst({
        radius: 0.095,
        rays: 8,
        depth: 0.034,
        primaryMat: goldTrimMat,
        accentMat: mats.jewel,
      });
      crownStar.position.set(0, 0.825, 0);

      sculpt.add(crossbar, lyreFrame, crownStar);
      break;
    }

    case 'ROULETTE_ASTROLABE': {
      // 1969 Monte Carlo Riviera Wheel & Celestial Astrolabe Gimbal
      const centerY = 0.57;
      const outerMeridian = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.355,
        innerRadius: 0.285,
        thickness: 0.05,
        material: mats.primary,
      });
      outerMeridian.rotation.x = Math.PI * 0.5;
      outerMeridian.position.y = centerY;

      const innerWheelGroup = new THREE.Group();
      innerWheelGroup.position.y = centerY;
      innerWheelGroup.rotation.set(0.62, 0.35, 0.24);

      const pocketRing = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.265,
        innerRadius: 0.175,
        thickness: 0.048,
        material: mats.secondary,
      });

      const turretSpindle = createFilletedShaft({
        radius: 0.045,
        topRadius: 0.022,
        height: 0.16,
        anglageBevel: 0.006,
        radialSegments: 48,
        centered: true,
        material: goldTrimMat,
      });

      const ivoryBall = createTurnedOrb({
        radius: 0.024,
        material: mats.accentMetal,
      });
      ivoryBall.position.set(0.215, 0.032, 0);

      innerWheelGroup.add(pocketRing, turretSpindle, ivoryBall);

      const jewelCore = createTurnedOrb({ radius: 0.095, material: mats.jewel });
      jewelCore.position.y = centerY;

      sculpt.add(outerMeridian, innerWheelGroup, jewelCore);
      updateKineticSubparts = (_timeSec, dtSec) => {
        innerWheelGroup.rotation.y += dtSec * 0.75;
      };
      break;
    }

    case 'GEODESIC_ARMILLARY': {
      // 1964-65 World's Fair Unisphere & 3-Axis Rotating Solar Armillary
      const centerY = 0.55;
      const gimbals: THREE.Mesh[] = [];
      for (let r = 0; r < 3; r++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.31 - r * 0.045, 0.019, 18, 64),
          r === 0 ? mats.primary : r === 1 ? mats.secondary : goldTrimMat,
        );
        ring.position.y = centerY;
        ring.rotation.set(r * 0.78 + 0.35, r * 0.95, 0.32);
        sculpt.add(ring);
        gimbals.push(ring);
      }

      const horizonBand = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.345,
        innerRadius: 0.308,
        thickness: 0.03,
        material: mats.accentMetal,
      });
      horizonBand.position.y = centerY;
      horizonBand.rotation.z = 0.22;

      const earthOrb = createTurnedOrb({
        radius: 0.13,
        equatorialRib: 0.012,
        material: mats.jewel,
      });
      earthOrb.position.y = centerY;

      const polarSpire = createFilletedShaft({
        radius: 0.02,
        topRadius: 0.008,
        height: 0.095,
        anglageBevel: 0.004,
        radialSegments: 48,
        material: goldTrimMat,
      });
      polarSpire.position.y = centerY + 0.275;

      sculpt.add(horizonBand, earthOrb, polarSpire);
      updateKineticSubparts = (_timeSec, dtSec) => {
        gimbals[1].rotation.y += dtSec * 0.55;
        gimbals[2].rotation.x += dtSec * 0.42;
      };
      break;
    }

    case 'PIRATE_KLYSTRON': {
      // Channel 83 50kW Broadcast Klystron Valve, Helical RF Coil & UHF Dipole Halos
      for (let c = 0; c < 3; c++) {
        const cavity = createFilletedShaft({
          radius: 0.165 - c * 0.018,
          height: 0.105,
          baseCollarFlare: 0.02,
          neckCollarFlare: 0.02,
          anglageBevel: 0.008,
          radialSegments: 48,
          material: c % 2 === 0 ? mats.primary : mats.secondary,
        });
        cavity.position.y = 0.24 + c * 0.135;
        sculpt.add(cavity);
      }

      // Helical copper/gold RF waveguide coil around glass vacuum envelope
      const helixPts: THREE.Vector3[] = [];
      const helixSteps = 36;
      for (let h = 0; h <= helixSteps; h++) {
        const t = h / helixSteps;
        const a = t * Math.PI * 5.0;
        helixPts.push(new THREE.Vector3(Math.cos(a) * 0.168, 0.58 + t * 0.26, Math.sin(a) * 0.168));
      }
      const helixCoil = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), 48, 0.012, 12, false),
        goldTrimMat,
      );

      const glassBulb = createTurnedOrb({
        radius: 0.145,
        heightScale: 1.42,
        radialSegments: 48,
        material: glassMat,
        castShadow: false,
      });
      glassBulb.position.y = 0.72;

      const anodeCore = createTurnedOrb({ radius: 0.072, material: mats.jewel });
      anodeCore.position.y = 0.72;

      const uhfHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.23, 0.012, 16, 56),
        mats.accentMetal,
      );
      uhfHalo.rotation.x = Math.PI * 0.5;
      uhfHalo.position.y = 0.89;

      sculpt.add(helixCoil, glassBulb, anodeCore, uhfHalo);
      break;
    }

    case 'ESCAPEMENT_CROWN': {
      // 1966 Prime-Time Sovereign Broadcast Crown & Live Spinning Living-Color Starburst
      const crownRing = createNotchedBezel({
        notchShape: 'WAX_SEAL',
        outerRadius: 0.33,
        innerRadius: 0.215,
        thickness: 0.095,
        material: mats.primary,
      });
      crownRing.position.y = 0.39;

      const royalStarburst = createMidCenturyStarburst({
        radius: 0.225,
        rays: 12,
        depth: 0.045,
        primaryMat: goldTrimMat,
        accentMat: mats.jewel,
      });
      royalStarburst.position.y = 0.62;

      for (const rotY of [0, Math.PI * 0.5]) {
        const crownRib = createChamferedArch({
          innerRadius: 0.225,
          outerRadius: 0.27,
          depth: 0.036,
          arcAngle: Math.PI,
          material: mats.secondary,
        });
        crownRib.position.y = 0.58;
        crownRib.rotation.y = rotY;
        sculpt.add(crownRib);
      }

      const spireCount = 8;
      for (let s = 0; s < spireCount; s++) {
        const a = (s / spireCount) * Math.PI * 2;
        const spire = createFilletedShaft({
          radius: 0.032,
          topRadius: 0.011,
          height: 0.27,
          anglageBevel: 0.005,
          radialSegments: 48,
          material: s % 2 === 0 ? mats.secondary : goldTrimMat,
        });
        spire.position.set(Math.cos(a) * 0.27, 0.43, Math.sin(a) * 0.27);

        const pearl = createTurnedOrb({
          radius: 0.024,
          material: mats.jewel,
        });
        pearl.position.set(Math.cos(a) * 0.27, 0.715, Math.sin(a) * 0.27);
        sculpt.add(spire, pearl);
      }

      const sovereignOrb = createTurnedOrb({ radius: 0.058, material: mats.jewel });
      sovereignOrb.position.y = 0.88;

      sculpt.add(crownRing, royalStarburst, sovereignOrb);
      updateKineticSubparts = (_timeSec, dtSec) => {
        royalStarburst.rotation.z += dtSec * 0.55;
      };
      break;
    }

    case 'SUBPOENA_PENDULUM': {
      // Grand Jury Twin Fluted Columns, Vaulted Arch & Live Harmonic Wax-Seal Pendulum
      for (const px of [-0.285, 0.285]) {
        const pillar = createFilletedShaft({
          radius: 0.038,
          topRadius: 0.034,
          height: 0.34,
          baseCollarFlare: 0.016,
          neckCollarFlare: 0.016,
          anglageBevel: 0.006,
          radialSegments: 48,
          material: mats.secondary,
        });
        pillar.position.set(px, 0.24, 0);
        sculpt.add(pillar);
      }

      const arch = createChamferedArch({
        innerRadius: 0.245,
        outerRadius: 0.325,
        depth: 0.068,
        material: mats.primary,
      });
      arch.position.y = 0.57;

      const witnessPlinth = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.29,
        innerRadius: 0.06,
        thickness: 0.04,
        material: mats.secondary,
      });
      witnessPlinth.position.y = 0.24;

      const pendulumPivot = new THREE.Group();
      pendulumPivot.position.set(0, 0.82, 0);

      const pivotJewel = createTurnedOrb({ radius: 0.038, material: mats.jewel });
      const rod = createFilletedShaft({
        radius: 0.018,
        height: 0.38,
        anglageBevel: 0.004,
        radialSegments: 48,
        material: goldTrimMat,
      });
      rod.position.y = -0.38;

      const sealBob = createNotchedBezel({
        notchShape: 'WAX_SEAL',
        outerRadius: 0.145,
        innerRadius: 0.028,
        thickness: 0.062,
        material: mats.primary,
      });
      sealBob.rotation.x = Math.PI * 0.5;
      sealBob.position.y = -0.39;

      const bobCore = createTurnedOrb({ radius: 0.052, material: mats.jewel });
      bobCore.position.y = -0.39;

      pendulumPivot.add(pivotJewel, rod, sealBob, bobCore);
      sculpt.add(witnessPlinth, arch, pendulumPivot);

      updateKineticSubparts = (timeSec) => {
        pendulumPivot.rotation.z = Math.sin(timeSec * 2.3) * 0.16;
      };
      break;
    }
  }

  // Exact 6rpm angular speed: (6 * 2 * PI) / 60 = PI / 5 rad/sec
  const SIX_RPM_RAD_PER_SEC = (6 * Math.PI * 2) / 60;
  let elapsedSec = 0;

  return {
    spec,
    root,
    turntableGroup,
    update(dtSec: number): void {
      const clampedDt = Math.min(0.05, Math.max(0, dtSec));
      elapsedSec += clampedDt;
      turntableGroup.rotation.y += clampedDt * SIX_RPM_RAD_PER_SEC;

      // Animate all 18 chasing `#11` warm 2700K tungsten marquee bulbs around the plinth!
      for (let i = 0; i < plinthBulbMats.length; i++) {
        plinthBulbMats[i].emissiveIntensity = sampleChasingMarqueeBulbIntensity(
          i,
          plinthBulbMats.length,
          elapsedSec,
          2.25,
        );
      }

      updateKineticSubparts?.(elapsedSec, clampedDt);
    },
    dispose(): void {
      disposeObject3DTree(root);
    },
  };
}

// ----------------------------------------------------------------------------
// 4. `LitTrophyVaultRendererV7` — Dedicated 1966 NBC/CBS "In Living Color"
//    Revolving Prize Showcase Studio (Peacock Navy & Cobalt + 3-Point Rig!)
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
}

function buildLivingColorShowcaseBackdrop(
  envMap: THREE.Texture | null,
): BuiltShowcaseStudioBackdrop {
  const group = new THREE.Group();
  group.name = 'LivingColor1966PrizeShowcaseStudioSet';

  const goldMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const cobaltArchMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e56c5, // CBS Royal Cobalt
    metalness: 0.25,
    roughness: 0.18,
    clearcoat: 0.85,
    clearcoatRoughness: 0.09,
    envMap,
    envMapIntensity: 1.45,
  });

  // 1. Curved Peacock Navy & CBS Royal Cobalt Soundstage Cyclorama Alcove (`LatheGeometry`, 0 boxes!)
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

  // 2. Glossy Clearcoated (`clearcoat: 0.85`) Peacock Navy & Cobalt Studio Stage Floor + Brass Inlay Rings
  const stageDeckMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f2d56,
    metalness: 0.24,
    roughness: 0.16,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    reflectivity: 0.94,
    envMap,
    envMapIntensity: 1.35,
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

  for (const ringR of [0.58, 0.78]) {
    const floorBrassInlay = new THREE.Mesh(
      new THREE.TorusGeometry(ringR, 0.007, 12, 64),
      goldMat,
    );
    floorBrassInlay.rotation.x = Math.PI * 0.5;
    floorBrassInlay.position.y = 0.002;
    group.add(floorBrassInlay);
  }

  // 3. Sculpted CBS Royal Cobalt Proscenium Arch + 15 Chasing `#11` Warm Tungsten Marquee Bulbs
  const archCenterY = 0.36;
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

  // 4. Upstage Goodson-Todman / NBC Living Color Starburst Medallion
  const peacockEnamelMat = createGrandFeuEnamelMaterial(0x0096a6, envMap);
  const starburstRosette = createMidCenturyStarburst({
    radius: 0.62,
    rays: 16,
    depth: 0.036,
    primaryMat: goldMat,
    accentMat: peacockEnamelMat,
    name: 'UpstageLivingColorStarburst',
  });
  starburstRosette.position.set(0, 0.46, -1.28);
  group.add(starburstRosette);

  return { group, archBulbMats, starburstRosette };
}

interface SweptRadialSlice {
  readonly r: number;
  readonly y: number;
}

/**
 * Extracts a 24-slice 360°-swept cylindrical envelope `(r, y)` of a trophy tree
 * so `frameCameraToTrophyEnvelope` guarantees exact `72%–82%` viewport fill
 * (`78.5%` target) and `0%` clipping across ALL rotation angles and aspect ratios!
 */
function measureTrophySweptEnvelope(root: THREE.Object3D): SweptRadialSlice[] {
  root.updateMatrixWorld(true);
  let minY = Infinity;
  let maxY = -Infinity;
  const v = new THREE.Vector3();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
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
      { r: 0.36, y: 1.08 },
    ];
  }

  const bins = 24;
  const maxRadii = new Float32Array(bins);
  const spanY = Math.max(0.01, maxY - minY);

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
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

  private readonly ownedEnvRT: THREE.WebGLRenderTarget | null = null;
  private readonly studioBackdrop: BuiltShowcaseStudioBackdrop;
  private readonly resizeObserver: ResizeObserver | null = null;
  private activeBuilt: BuiltTrophySculptureV7 | null = null;
  private activeEnvelope: SweptRadialSlice[] = [];
  private rafId: number | null = null;
  private lastNowMs = 0;
  private studioElapsedSec = 0;
  private isDisposed = false;

  constructor(config: LitTrophyVaultRendererConfigV7) {
    this.container = config.container;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.26;
    this.renderer.setClearColor(0x0b1d30, 1.0); // Unified 1966 Midnight Navy (#0B1D30)!
    this.renderer.setPixelRatio(
      Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.0),
    );
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);

    if (config.sharedEnvMap) {
      this.envMap = config.sharedEnvMap;
    } else {
      this.ownedEnvRT = bakeWarmTungstenIblV7(this.renderer);
      this.envMap = this.ownedEnvRT.texture;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1d30);
    this.scene.environment = this.envMap;
    this.scene.environmentIntensity = 2.05;

    // ------------------------------------------------------------------------
    // 3-Point Warm / Cyan / Gold 1966 Network TV Studio Lighting Rig
    // ------------------------------------------------------------------------
    // 1) Warm 3200K Quartz-Tungsten Key Light (front-right high)
    const warmKeyLight = new THREE.DirectionalLight(0xfff0d4, 3.45);
    warmKeyLight.position.set(2.5, 3.55, 3.25);

    // 2) Living Color Peacock Cyan Studio Cross-Fill Light (front-left)
    const cyanFillLight = new THREE.DirectionalLight(0x00d4e8, 2.35);
    cyanFillLight.position.set(-2.75, 1.85, 2.45);

    // 3) 24K Harvest Marquee Gold Back-Rim Kicker Light (upstage rim)
    const goldRimLight = new THREE.DirectionalLight(0xffb830, 3.15);
    goldRimLight.position.set(-1.65, 3.15, -2.75);

    // Clean TV Warm Cream sky + CBS Royal Cobalt stage floor bounce (ZERO brown!)
    const studioHemi = new THREE.HemisphereLight(0xfff4e0, 0x143b78, 1.25);

    // Subtle warm marquee tungsten front-plinth glow
    const marqueeFrontGlow = new THREE.PointLight(0xffcf6e, 0.85, 3.2, 1.6);
    marqueeFrontGlow.position.set(0, 0.34, 0.78);

    this.scene.add(warmKeyLight, cyanFillLight, goldRimLight, studioHemi, marqueeFrontGlow);

    // Add 1966 Peacock Navy & Cobalt Revolving Showcase Studio Backdrop + Chasing `#11` Arch
    this.studioBackdrop = buildLivingColorShowcaseBackdrop(this.envMap);
    this.scene.add(this.studioBackdrop.group);

    const w = Math.max(64, this.container.clientWidth || 180);
    const h = Math.max(64, this.container.clientHeight || 158);
    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 25);
    this.camera.position.set(0, 0.96, 2.55);
    this.camera.lookAt(0, 0.54, 0);
    this.resize(w, h);

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

    // Target 78.5% dominant frame fill (`72%–82%` window) with dead-center vertical balance & 0% clipping!
    const TARGET_FILL = 0.785;
    const elevRad = (10.5 * Math.PI) / 180;
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
        // Sample worst-case 360° points around horizontal circle of radius `r` at height `y`
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

      // Recenter vertically in world space and scale camera distance proportionally
      const halfVertWorld = dist * Math.tan((this.camera.fov * Math.PI) / 360);
      lookY += midNdcY * halfVertWorld * 0.88;
      dist = Math.min(4.8, Math.max(1.45, dist * (dominantFill / TARGET_FILL)));
    }

    this.camera.position.set(0, lookY + dist * sinE, dist * cosE);
    this.camera.lookAt(0, lookY, 0);
    this.camera.updateMatrixWorld(true);
  }

  public setTrophy(trophyId: string, unlocked = true): TrophySpecV7 {
    const spec = getTrophySpecV7(trophyId) ?? TROPHY_CATALOG_V7[0];
    if (this.activeBuilt) {
      this.scene.remove(this.activeBuilt.root);
      this.activeBuilt.dispose();
      this.activeBuilt = null;
    }
    this.activeBuilt = buildTrophySculptureV7(spec, this.envMap, { unlocked });
    this.scene.add(this.activeBuilt.root);
    this.activeEnvelope = measureTrophySweptEnvelope(this.activeBuilt.root);
    this.frameCameraToActiveEnvelope();
    this.renderFrameNow(0);
    return spec;
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

    this.activeBuilt?.update(clampedDt);

    // Animate the 15 chasing `#11` warm tungsten arch bulbs & slow upstage starburst shimmer!
    const archBulbs = this.studioBackdrop.archBulbMats;
    for (let i = 0; i < archBulbs.length; i++) {
      archBulbs[i].emissiveIntensity = sampleChasingMarqueeBulbIntensity(
        i,
        archBulbs.length,
        this.studioElapsedSec,
        1.85,
      );
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
    if (this.activeBuilt) {
      this.scene.remove(this.activeBuilt.root);
      this.activeBuilt.dispose();
      this.activeBuilt = null;
    }
    this.scene.remove(this.studioBackdrop.group);
    disposeObject3DTree(this.studioBackdrop.group);
    this.ownedEnvRT?.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
