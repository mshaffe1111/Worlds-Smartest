// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master — Wave 2 Ultra-HD)
// `src/v7/engine/StageWorldsV7.ts`
// All 10 Bespoke 1966 "IN LIVING COLOR" Soundstages + 3 Live Booth Coup Regimes
//  - Zero copy-paste walls, zero occluded hero sets, zero giant floor cogs!
//  - Every stage (STAGE_01..STAGE_10) owns unmistakable 1960s architectural wings,
//    open center proscenium, sculptural hero centerpiece & gradient cyclorama
//  - Glossy clearcoated broadcast stage floor + smooth beveled brass/neon rings
//    + warm/cool dual additive studio light pools + gentle volumetric spot sweep
//  - Live animated twin 1966 RCA TK-41 pedestal cameras w/ alternating tally cuts!
// ============================================================================

import * as THREE from 'three';
import type {
  CoupRegimeIdV7,
  StageWorldIdV7,
  StageWorldSpecV7,
} from '../contracts_v7';
import {
  type AntiMoireFloorKindV7,
  create24KGoldMaterial,
  createAcrylitePanelMaterial,
  createAnodizedAluminumMaterial,
  createAntiMoireFloorMaterial,
  createBluedSteelMaterial,
  createBorosilicateGlassMaterial,
  createChamferedArch,
  createChamferedBox,
  createChasingMarqueePillar,
  createCurvedParabolicCove,
  createFilletedShaft,
  createGrandFeuEnamelMaterial,
  createInvoluteGear,
  createMidCenturyBoomerangPylon,
  createMidCenturyStarburst,
  createNotchedBezel,
  createObsidianMaterial,
  createSmoothBeveledRing,
  createTurnedOrb,
  createVolumetricLightCone,
  createWalnutMaterial,
  disposeObject3DTree,
} from './HorologicalCAD';

// ----------------------------------------------------------------------------
// 1. Canonical 1966 Living Color Specs for All 10 Soundstages
// ----------------------------------------------------------------------------

export const STAGE_WORLD_SPECS_V7: Record<StageWorldIdV7, StageWorldSpecV7> = {
  STAGE_01_IBC_DAYTIME_FUNK: {
    stageId: 'STAGE_01_IBC_DAYTIME_FUNK',
    code: 'STG-01',
    name: '30 Rock Studio 6A — 1966 Living Color',
    eraLabel: '1966 NBC Living Color',
    subtitle: 'Peacock Acrylite Fan Pavilion, Sunlit Walnut Slats & Chasing Marquee',
    isSealedVault: false,
    bpm: 108,
    timeSig: '4/4',
    keyLightHex: 0xfff0d6,
    coveLightHex: 0x00bcd0,
    cycBaseHex: 0x0d3650,
    floorBaseHex: 0x6f4325,
    tableBedHex: 0x10283d,
    trimVeneerHex: '#6E3B23',
    trimAccentHex: '#F4A91F',
  },
  STAGE_02_IBC_PRIMETIME_JUBILEE: {
    stageId: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    code: 'STG-02',
    name: 'CBS Television City — Primetime Jubilee',
    eraLabel: '1966 Primetime Sweeps',
    subtitle: '24K Atomic Starburst Rotunda, Carnaby Cerise & Harvest Gold Chevrons',
    isSealedVault: false,
    bpm: 122,
    timeSig: '4/4',
    keyLightHex: 0xfff3dc,
    coveLightHex: 0xffb830,
    cycBaseHex: 0x1a245e,
    floorBaseHex: 0x12665e,
    tableBedHex: 0x172448,
    trimVeneerHex: '#2C2558',
    trimAccentHex: '#FFD166',
  },
  STAGE_03_1926_VAUDEVILLE_PIT: {
    stageId: 'STAGE_03_1926_VAUDEVILLE_PIT',
    code: 'STG-03',
    name: '1966 Burbank Pop-Art Carnival',
    eraLabel: '1966 Burbank Pop-Art',
    subtitle: 'Mondrian Color Shutters, Flower-Power Starbursts & Carnaby Blocks',
    isSealedVault: false,
    bpm: 132,
    timeSig: '4/4',
    keyLightHex: 0xfff2da,
    coveLightHex: 0xe63b7a,
    cycBaseHex: 0x16244e,
    floorBaseHex: 0x6e4228,
    tableBedHex: 0x0b1d30,
    trimVeneerHex: '#6E3B23',
    trimAccentHex: '#F4A91F',
  },
  STAGE_04_1958_ISOLATION_VAULT: {
    stageId: 'STAGE_04_1958_ISOLATION_VAULT',
    code: 'STG-04',
    name: '1964 "$64,000" Teak & Teal Isolation Booth',
    eraLabel: '1964 Network Isolation',
    subtitle: 'Sunlit American Teak Mullions, Peacock Teal Acoustic Glass & Relay Desk',
    isSealedVault: true,
    bpm: 98,
    timeSig: '4/4',
    keyLightHex: 0xf7f4eb,
    coveLightHex: 0x0096a6,
    cycBaseHex: 0x0b2c40,
    floorBaseHex: 0x6b4024,
    tableBedHex: 0x0b1d30,
    trimVeneerHex: '#6E3B23',
    trimAccentHex: '#0096A6',
  },
  STAGE_05_1984_LARSON_CRT_LAB: {
    stageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    code: 'STG-05',
    name: '1967 Apollo-Era Master Color Control Pavilion',
    eraLabel: '1967 Apollo Broadcast Era',
    subtitle: 'Curved Cream & Cobalt Consoles, Orbital Telemetry & RCA Color Bars',
    isSealedVault: false,
    bpm: 126,
    timeSig: '4/4',
    keyLightHex: 0xf4f8ff,
    coveLightHex: 0x1e56c5,
    cycBaseHex: 0x0b1d30,
    floorBaseHex: 0x1e4472,
    tableBedHex: 0x0b1d30,
    trimVeneerHex: '#1E56C5',
    trimAccentHex: '#FF6738',
  },
  STAGE_06_ATLANTIC_CITY_PIER: {
    stageId: 'STAGE_06_ATLANTIC_CITY_PIER',
    code: 'STG-06',
    name: 'Atlantic City Steel Pier Pavilion',
    eraLabel: '1965 Boardwalk Roadshow',
    subtitle: 'Gilded Wurlitzer Pipe Fan, Riviera Turquoise Coves & Carnival Arches',
    isSealedVault: false,
    bpm: 128,
    timeSig: '4/4',
    keyLightHex: 0xffeece,
    coveLightHex: 0x00c2b8,
    cycBaseHex: 0x0c405c,
    floorBaseHex: 0x744728,
    tableBedHex: 0x102d42,
    trimVeneerHex: '#6A3820',
    trimAccentHex: '#FFD166',
  },
  STAGE_07_1969_MONTE_CARLO_CASINO: {
    stageId: 'STAGE_07_1969_MONTE_CARLO_CASINO',
    code: 'STG-07',
    name: '1969 Monte Carlo Royale',
    eraLabel: '1969 Riviera High Stakes',
    subtitle: 'Ken Adam Ivory-Gold Ribs, Crystal Baccarat Sunburst & Emerald Terrazzo',
    isSealedVault: false,
    bpm: 118,
    timeSig: '5/4',
    keyLightHex: 0xfff0d4,
    coveLightHex: 0x00cf96,
    cycBaseHex: 0x0d2e50,
    floorBaseHex: 0x106458,
    tableBedHex: 0x0f2c3a,
    trimVeneerHex: '#144240',
    trimAccentHex: '#F4C144',
  },
  STAGE_08_WORLDS_FAIR_GEODESIC: {
    stageId: 'STAGE_08_WORLDS_FAIR_GEODESIC',
    code: 'STG-08',
    name: '1965 World’s Fair Pavilion of Tomorrow',
    eraLabel: '1965 Flushing Meadows',
    subtitle: 'Alabaster Unisphere Arches, Googie Boomerang Pylons & Orbiting Dish',
    isSealedVault: false,
    bpm: 120,
    timeSig: '4/4',
    keyLightHex: 0xf4f9ff,
    coveLightHex: 0x00c4f4,
    cycBaseHex: 0x113d74,
    floorBaseHex: 0x355c82,
    tableBedHex: 0x132c4e,
    trimVeneerHex: '#1B4272',
    trimAccentHex: '#52CCFF',
  },
  STAGE_09_CHANNEL_83_UHF_BARGE: {
    stageId: 'STAGE_09_CHANNEL_83_UHF_BARGE',
    code: 'STG-09',
    name: 'Offshore Pirate Radio Ship — M/V Cassandra',
    eraLabel: '1967 Swingin’ High Seas',
    subtitle: 'Spun Aluminum Bridge, Glowing 50kW Klystron Tubes & Ocean Portholes',
    isSealedVault: false,
    bpm: 134,
    timeSig: '4/4',
    keyLightHex: 0xfff0d8,
    coveLightHex: 0x00def0,
    cycBaseHex: 0x0b344e,
    floorBaseHex: 0x224864,
    tableBedHex: 0x0f2b3e,
    trimVeneerHex: '#183C54',
    trimAccentHex: '#00E5FF',
  },
  STAGE_10_SOVEREIGN_SANCTUM: {
    stageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    code: 'STG-10',
    name: 'Network Executive Penthouse — 38th Floor 30 Rock',
    eraLabel: '1966 Midnight Finale',
    subtitle: 'Champagne Skyline Lancet Windows, 24K Escapement & Astrolabe Marble',
    isSealedVault: true,
    bpm: 108,
    timeSig: '5/4',
    keyLightHex: 0xffecc4,
    coveLightHex: 0xf4a91f,
    cycBaseHex: 0x122446,
    floorBaseHex: 0x1c3456,
    tableBedHex: 0x14223d,
    trimVeneerHex: '#23304E',
    trimAccentHex: '#FFD166',
  },
};

const STAGE_FLOOR_MAP_V7: Record<StageWorldIdV7, AntiMoireFloorKindV7> = {
  STAGE_01_IBC_DAYTIME_FUNK: 'PARQUET',
  STAGE_02_IBC_PRIMETIME_JUBILEE: 'TOURMALINE_BAIZE',
  STAGE_03_1926_VAUDEVILLE_PIT: 'HERRINGBONE_OAK',
  STAGE_04_1958_ISOLATION_VAULT: 'HERRINGBONE_OAK',
  STAGE_05_1984_LARSON_CRT_LAB: 'DIAMOND_PLATE_STEEL',
  STAGE_06_ATLANTIC_CITY_PIER: 'PARQUET',
  STAGE_07_1969_MONTE_CARLO_CASINO: 'TOURMALINE_BAIZE',
  STAGE_08_WORLDS_FAIR_GEODESIC: 'GRANITE',
  STAGE_09_CHANNEL_83_UHF_BARGE: 'DIAMOND_PLATE_STEEL',
  STAGE_10_SOVEREIGN_SANCTUM: 'BELGIAN_ASTROLABE_MARBLE',
};

interface StagePaletteTriad {
  readonly acrylite: readonly [number, number, number];
  readonly cycZenith: string;
  readonly cycMid: string;
  readonly cycHorizon: string;
  readonly ringGlowHex: number;
  readonly warmPoolHex: number;
  readonly coolPoolHex: number;
  readonly spotTintHex: number;
  readonly signText: string;
}

const STAGE_LIVING_COLOR_PALETTES: Record<StageWorldIdV7, StagePaletteTriad> = {
  STAGE_01_IBC_DAYTIME_FUNK: {
    acrylite: [0x00b4c8, 0xf6b224, 0xe8427c],
    cycZenith: '#0a223b',
    cycMid: '#0e4c68',
    cycHorizon: '#168a9c',
    ringGlowHex: 0x00d8ec,
    warmPoolHex: 0xffd888,
    coolPoolHex: 0x20d8ee,
    spotTintHex: 0xffe4a8,
    signText: 'ON THE AIR · IN LIVING COLOR',
  },
  STAGE_02_IBC_PRIMETIME_JUBILEE: {
    acrylite: [0xf6b224, 0xe83b7c, 0x00bcd4],
    cycZenith: '#131646',
    cycMid: '#2c2574',
    cycHorizon: '#8a346e',
    ringGlowHex: 0xffc845,
    warmPoolHex: 0xffcb62,
    coolPoolHex: 0xe84890,
    spotTintHex: 0xffe0a0,
    signText: 'CBS JUBILEE · IN LIVING COLOR',
  },
  STAGE_03_1926_VAUDEVILLE_PIT: {
    acrylite: [0xe63b7a, 0xf4a91f, 0x0096a6],
    cycZenith: '#0b1d30',
    cycMid: '#242b6b',
    cycHorizon: '#c8346c',
    ringGlowHex: 0xe63b7a,
    warmPoolHex: 0xf4a91f,
    coolPoolHex: 0x0096a6,
    spotTintHex: 0xf7eedb,
    signText: 'BURBANK POP · IN LIVING COLOR',
  },
  STAGE_04_1958_ISOLATION_VAULT: {
    acrylite: [0x0096a6, 0xf4a91f, 0x1e56c5],
    cycZenith: '#0b1d30',
    cycMid: '#0d4456',
    cycHorizon: '#0096a6',
    ringGlowHex: 0x00b8c8,
    warmPoolHex: 0xf4a91f,
    coolPoolHex: 0x00b4c8,
    spotTintHex: 0xf7eedb,
    signText: 'ISOLATION BOOTH · IN LIVING COLOR',
  },
  STAGE_05_1984_LARSON_CRT_LAB: {
    acrylite: [0x1e56c5, 0xff6738, 0x0096a6],
    cycZenith: '#0b1d30',
    cycMid: '#153a7c',
    cycHorizon: '#1e56c5',
    ringGlowHex: 0x38c8ff,
    warmPoolHex: 0xff6738,
    coolPoolHex: 0x1e88e5,
    spotTintHex: 0xf7eedb,
    signText: 'APOLLO CONTROL · IN LIVING COLOR',
  },
  STAGE_06_ATLANTIC_CITY_PIER: {
    acrylite: [0x00bcc8, 0xff7838, 0xf8c230],
    cycZenith: '#0a2b44',
    cycMid: '#0f5672',
    cycHorizon: '#e07a44',
    ringGlowHex: 0xffa642,
    warmPoolHex: 0xffb858,
    coolPoolHex: 0x16d2de,
    spotTintHex: 0xffe4b4,
    signText: 'STEEL PIER · IN LIVING COLOR',
  },
  STAGE_07_1969_MONTE_CARLO_CASINO: {
    acrylite: [0x00c892, 0xf4c144, 0x1e68d4],
    cycZenith: '#0a203e',
    cycMid: '#10466c',
    cycHorizon: '#128a7c',
    ringGlowHex: 0x26e8b0,
    warmPoolHex: 0xffde7c,
    coolPoolHex: 0x18e0a8,
    spotTintHex: 0xfff0c6,
    signText: 'MONTE CARLO · IN LIVING COLOR',
  },
  STAGE_08_WORLDS_FAIR_GEODESIC: {
    acrylite: [0x00bef4, 0xf6bc2e, 0xff6b35],
    cycZenith: '#0d2654',
    cycMid: '#185496',
    cycHorizon: '#2098cc',
    ringGlowHex: 0x4cd8ff,
    warmPoolHex: 0xffcf6a,
    coolPoolHex: 0x38d0ff,
    spotTintHex: 0xe6f4ff,
    signText: 'WORLD’S FAIR · IN LIVING COLOR',
  },
  STAGE_09_CHANNEL_83_UHF_BARGE: {
    acrylite: [0x00d8ea, 0xff6738, 0xffd147],
    cycZenith: '#082238',
    cycMid: '#0e4e6e',
    cycHorizon: '#148da4',
    ringGlowHex: 0x00ebff,
    warmPoolHex: 0xff8d4c,
    coolPoolHex: 0x10e8ff,
    spotTintHex: 0xcff8ff,
    signText: 'CHANNEL 83 · PIRATE LIVING COLOR',
  },
  STAGE_10_SOVEREIGN_SANCTUM: {
    acrylite: [0xf4a91f, 0x00b4c8, 0xe63b7a],
    cycZenith: '#0d1936',
    cycMid: '#1b3162',
    cycHorizon: '#704c2a',
    ringGlowHex: 0xffcf54,
    warmPoolHex: 0xffd166,
    coolPoolHex: 0x2cb4dc,
    spotTintHex: 0xffe6b0,
    signText: 'PENTHOUSE 38 · IN LIVING COLOR',
  },
};

// ----------------------------------------------------------------------------
// 2. Built Stage Handle & Sub-Component Contracts
// ----------------------------------------------------------------------------

export interface BuiltStageWorldV7 {
  readonly stageId: StageWorldIdV7;
  readonly spec: StageWorldSpecV7;
  readonly root: THREE.Group;
  triggerFresnelTell(isRubySpite?: boolean): void;
  triggerRowCGlint(active: boolean): void;
  getRowCColliderMesh(): THREE.Mesh;
  setVipJuryState(boonActive: boolean, baneActive: boolean): void;
  setCoupRegime(regime: CoupRegimeIdV7): void;
  getActiveCoupRegime(): CoupRegimeIdV7;
  setApertureDimFactor(factor: number): void;
  setWingSpanX(halfSpanMeters: number, wingZ?: number): void;
  setMarqueeCrownY?(yMeters: number): void;
  setPortraitFraming?(isPortrait: boolean): void;
  update(dtSec: number, elapsedSec: number): void;
  dispose(): void;
}

// Helper: floor-bolted sculpted satin-brass mounting shoe resting flush on y = 0.00m
function createFloorShoe(
  width: number,
  depth: number,
  height: number,
  metalMat: THREE.Material,
  boltMat: THREE.Material,
): THREE.Group {
  const g = new THREE.Group();
  const plate = createChamferedBox({
    width,
    height,
    depth,
    cornerRadius: Math.min(width, depth) * 0.16,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
    material: metalMat,
    name: 'FloorAnchorShoe',
  });
  plate.position.y = height * 0.5;
  g.add(plate);

  const bx = width * 0.34;
  const bz = depth * 0.34;
  for (const [sx, sz] of [
    [-bx, -bz],
    [bx, -bz],
    [-bx, bz],
    [bx, bz],
  ] as const) {
    const bolt = createFilletedShaft({
      radius: 0.024,
      height: height * 0.52,
      anglageBevel: 0.006,
      radialSegments: 24,
      material: boltMat,
      name: 'FloorAnchorBolt',
    });
    bolt.position.set(sx, height, sz);
    g.add(bolt);
  }
  return g;
}

// Procedural 512x512 Radiant 1966 Living Color Broadcast Cyclorama Gradient Texture
function createCycloramaGradientTexture(
  stageId: StageWorldIdV7,
  palette: StagePaletteTriad,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const vGrad = ctx.createLinearGradient(0, 0, 0, 512);
    vGrad.addColorStop(0.0, palette.cycZenith);
    vGrad.addColorStop(0.38, palette.cycMid);
    vGrad.addColorStop(0.76, palette.cycHorizon);
    vGrad.addColorStop(0.95, '#ffda88');
    vGrad.addColorStop(1.0, palette.cycHorizon);
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Stage-distinct theatrical backdrop atmosphere!
    if (stageId === 'STAGE_10_SOVEREIGN_SANCTUM') {
      // Distant glittering 1966 Manhattan skyline silhouette glow along horizon
      ctx.fillStyle = 'rgba(10, 18, 42, 0.42)';
      const heights = [120, 185, 145, 240, 165, 290, 210, 175, 255, 190, 140, 220, 150, 130];
      const bw = 512 / heights.length;
      for (let i = 0; i < heights.length; i++) {
        const bh = heights[i];
        ctx.fillRect(i * bw + 2, 512 - bh, bw - 4, bh);
        ctx.fillStyle = 'rgba(255, 222, 135, 0.48)';
        for (let wy = 512 - bh + 12; wy < 485; wy += 16) {
          for (let wx = i * bw + 7; wx < (i + 1) * bw - 9; wx += 9) {
            if ((i * 7 + wy) % 3 !== 0) ctx.fillRect(wx, wy, 4, 6);
          }
        }
        ctx.fillStyle = 'rgba(10, 18, 42, 0.42)';
      }
    } else if (stageId === 'STAGE_08_WORLDS_FAIR_GEODESIC') {
      // Subtle starry flushing-meadows sky dome specks + sweeping blue searchlights
      ctx.fillStyle = 'rgba(220, 248, 255, 0.42)';
      for (let s = 0; s < 70; s++) {
        const sx = (s * 97) % 512;
        const sy = (s * 53) % 240;
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Theatrical 1966 NBC/CBS light-fan rays blooming upward from stage center
    ctx.save();
    ctx.translate(256, 468);
    const rayCount = stageId === 'STAGE_02_IBC_PRIMETIME_JUBILEE' ? 7 : 5;
    for (let i = -rayCount; i <= rayCount; i++) {
      ctx.save();
      ctx.rotate(i * (0.86 / rayCount));
      const rayGrad = ctx.createLinearGradient(0, 0, 0, -470);
      rayGrad.addColorStop(0.0, 'rgba(255, 240, 200, 0.24)');
      rayGrad.addColorStop(0.45, 'rgba(255, 232, 185, 0.08)');
      rayGrad.addColorStop(1.0, 'rgba(255, 232, 185, 0.0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-38, -470);
      ctx.lineTo(38, -470);
      ctx.lineTo(12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    const horizonGlow = ctx.createRadialGradient(256, 470, 24, 256, 470, 290);
    horizonGlow.addColorStop(0.0, 'rgba(255, 234, 178, 0.36)');
    horizonGlow.addColorStop(0.55, 'rgba(255, 215, 130, 0.11)');
    horizonGlow.addColorStop(1.0, 'rgba(255, 215, 130, 0.0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 140, 512, 372);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// Soft radial additive spotlight reflection pool texture for the glossy stage floor
function createFloorLightPoolTexture(innerRgba: string, midRgba: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 126);
    grad.addColorStop(0.0, innerRgba);
    grad.addColorStop(0.45, midRgba);
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ----------------------------------------------------------------------------
// 3. Stepped Borosilicate Compliance Fresnel Lamp (Right Wing Stanchion)
// ----------------------------------------------------------------------------

function buildComplianceFresnelLamp(envMap: THREE.Texture) {
  const group = new THREE.Group();
  group.name = 'ComplianceFresnelLamp';

  const brassMat = create24KGoldMaterial(envMap);
  const housingMat = createAnodizedAluminumMaterial(envMap);

  const yokeBase = createChamferedBox({
    width: 0.44,
    height: 0.08,
    depth: 0.24,
    cornerRadius: 0.04,
    material: brassMat,
  });
  group.add(yokeBase);

  for (const sx of [-0.19, 0.19]) {
    const arm = createChamferedBox({
      width: 0.05,
      height: 0.38,
      depth: 0.08,
      cornerRadius: 0.015,
      material: brassMat,
    });
    arm.position.set(sx, 0.2, 0);
    group.add(arm);
  }

  const head = new THREE.Group();
  head.position.set(0, 0.26, 0.04);
  head.rotation.set(0.18, -0.24, 0);
  group.add(head);

  const barrel = createFilletedShaft({
    radius: 0.16,
    height: 0.34,
    baseCollarFlare: 0.025,
    neckCollarFlare: 0.03,
    anglageBevel: 0.01,
    radialSegments: 48,
    centered: true,
    material: housingMat,
    name: 'FresnelBarrel',
  });
  barrel.rotation.x = Math.PI * 0.5;
  head.add(barrel);

  const fresnelPts: THREE.Vector2[] = [
    new THREE.Vector2(0, 0.042),
    new THREE.Vector2(0.038, 0.042),
    new THREE.Vector2(0.04, 0.024),
    new THREE.Vector2(0.076, 0.036),
    new THREE.Vector2(0.078, 0.018),
    new THREE.Vector2(0.114, 0.03),
    new THREE.Vector2(0.116, 0.012),
    new THREE.Vector2(0.148, 0.024),
    new THREE.Vector2(0.15, 0.0),
    new THREE.Vector2(0, 0.0),
  ];
  const lensGeom = new THREE.LatheGeometry(fresnelPts, 48);
  lensGeom.rotateX(Math.PI * 0.5);
  lensGeom.computeVertexNormals();

  const filamentMat = new THREE.MeshStandardMaterial({
    color: 0xffe8ba,
    emissive: 0xffb340,
    emissiveIntensity: 0.34,
    roughness: 0.1,
    metalness: 0.05,
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8f7ff,
    emissive: 0xffb340,
    emissiveIntensity: 0.22,
    roughness: 0.08,
    metalness: 0.02,
    transparent: true,
    opacity: 0.84,
    clearcoat: 1.0,
    envMap,
    envMapIntensity: 1.6,
  });

  const lensMesh = new THREE.Mesh(lensGeom, lensMat);
  lensMesh.position.z = 0.175;
  head.add(lensMesh);

  const innerCore = createTurnedOrb({
    radius: 0.095,
    material: filamentMat,
    castShadow: false,
    name: 'FresnelFilamentCore',
  });
  innerCore.position.z = 0.14;
  head.add(innerCore);

  for (const [bx, by, rotX, rotY] of [
    [0, 0.18, -0.38, 0],
    [0, -0.18, 0.38, 0],
    [-0.18, 0, 0, 0.38],
    [0.18, 0, 0, -0.38],
  ] as const) {
    const leaf = createChamferedBox({
      width: bx === 0 ? 0.24 : 0.03,
      height: by === 0 ? 0.24 : 0.03,
      depth: 0.11,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3,
      material: housingMat,
    });
    leaf.position.set(bx, by, 0.23);
    leaf.rotation.set(rotX, rotY, 0);
    head.add(leaf);
  }

  return { group, filamentMat, lensMat };
}

// ----------------------------------------------------------------------------
// 4. Mid-Century Velvet Row-C Risers + Clickable Rolled-Program HDR Glint
// ----------------------------------------------------------------------------

function buildRowCAcousticRisers(spec: StageWorldSpecV7, envMap: THREE.Texture) {
  const group = new THREE.Group();
  group.name = 'RowCAcousticRisers';

  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0xa81f48,
    roughness: 0.68,
    metalness: 0.06,
    envMap,
    envMapIntensity: 0.65,
  });
  const walnutMat = createWalnutMaterial(envMap);
  const brassMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);

  const tiers = [
    { z: -6.95, h: 0.52, d: 0.62 },
    { z: -7.58, h: 0.98, d: 0.64 },
    { z: -8.22, h: 1.44, d: 0.66 },
  ];

  for (let t = 0; t < tiers.length; t++) {
    const tier = tiers[t];
    const plinth = createChamferedBox({
      width: 2.85,
      height: tier.h,
      depth: tier.d,
      cornerRadius: 0.05,
      bevelThickness: 0.014,
      bevelSize: 0.014,
      bevelSegments: 3,
      material: walnutMat,
    });
    plinth.position.set(0, tier.h * 0.5, tier.z);
    group.add(plinth);

    const cushion = createChamferedBox({
      width: 2.76,
      height: 0.09,
      depth: tier.d * 0.86,
      cornerRadius: 0.04,
      bevelThickness: 0.014,
      bevelSize: 0.014,
      bevelSegments: 3,
      material: velvetMat,
    });
    cushion.position.set(0, tier.h + 0.045, tier.z);
    group.add(cushion);

    const brassNosing = createChamferedBox({
      width: 2.86,
      height: 0.036,
      depth: 0.045,
      material: brassMat,
    });
    brassNosing.position.set(0, tier.h + 0.02, tier.z + tier.d * 0.48);
    group.add(brassNosing);

    const noStudioGallery =
      spec.isSealedVault ||
      spec.stageId === 'STAGE_05_1984_LARSON_CRT_LAB' ||
      spec.stageId === 'STAGE_09_CHANNEL_83_UHF_BARGE';

    for (let s = 0; s < 4; s++) {
      const sx = -1.02 + s * 0.68;
      if (noStudioGallery) {
        const consolePod = createFilletedShaft({
          radius: 0.16,
          topRadius: 0.14,
          height: 0.28,
          anglageBevel: 0.008,
          radialSegments: 32,
          material: aluminumMat,
        });
        consolePod.position.set(sx, tier.h + 0.09, tier.z - 0.06);
        group.add(consolePod);
      } else {
        const seatBack = createChamferedBox({
          width: 0.52,
          height: 0.36,
          depth: 0.09,
          cornerRadius: 0.11,
          material: velvetMat,
        });
        seatBack.position.set(sx, tier.h + 0.25, tier.z - 0.16);
        seatBack.rotation.x = -0.14;
        group.add(seatBack);
      }
    }
  }

  const glintAnchor = new THREE.Group();
  glintAnchor.name = 'RowCRolledProgramAnchor';
  glintAnchor.position.set(0.62, 1.62, -7.42);
  group.add(glintAnchor);

  const programMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff8e8,
    emissive: 0x8be9ff,
    emissiveIntensity: 0.14,
    roughness: 0.12,
    metalness: 0.15,
    clearcoat: 1.0,
    envMap,
    envMapIntensity: 1.6,
  });

  const rolledProgram = createFilletedShaft({
    radius: 0.075,
    height: 0.52,
    baseCollarFlare: 0.012,
    neckCollarFlare: 0.012,
    anglageBevel: 0.008,
    radialSegments: 36,
    centered: true,
    material: programMat,
    name: 'RolledProgramScroll',
  });
  rolledProgram.rotation.set(0.35, 0.22, Math.PI * 0.38);
  glintAnchor.add(rolledProgram);

  const brassBand = createNotchedBezel({
    notchShape: 'SCALLOP',
    outerRadius: 0.095,
    innerRadius: 0.068,
    thickness: 0.06,
    material: brassMat,
  });
  brassBand.rotation.copy(rolledProgram.rotation);
  glintAnchor.add(brassBand);

  const glintFlareMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x9ef0ff,
    emissiveIntensity: 0.0,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });

  const glintGroup = new THREE.Group();
  glintGroup.visible = false;
  const flareOrb = createTurnedOrb({
    radius: 0.13,
    material: glintFlareMat,
    castShadow: false,
    receiveShadow: false,
  });
  const rayH = createChamferedBox({
    width: 0.68,
    height: 0.036,
    depth: 0.036,
    material: glintFlareMat,
    castShadow: false,
    receiveShadow: false,
  });
  const rayV = createChamferedBox({
    width: 0.036,
    height: 0.68,
    depth: 0.036,
    material: glintFlareMat,
    castShadow: false,
    receiveShadow: false,
  });
  glintGroup.add(flareOrb, rayH, rayV);
  glintGroup.position.set(0, 0.08, 0.12);
  glintAnchor.add(glintGroup);

  const colliderMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const colliderMesh = createChamferedBox({
    width: 2.5,
    height: 2.2,
    depth: 1.5,
    material: colliderMat,
    castShadow: false,
    receiveShadow: false,
    name: 'RowCGlintCollider',
  });
  colliderMesh.position.set(0.35, 1.55, -7.42);
  colliderMesh.userData.interactiveKind = 'ROW_C_GLINT';
  colliderMesh.userData.stageId = spec.stageId;
  group.add(colliderMesh);

  return {
    group,
    programMat,
    glintFlareMat,
    glintGroup,
    colliderMesh,
  };
}

// ----------------------------------------------------------------------------
// 5. 6 Cantilevered Smoked-Glass VIP Jury Loges + Boon/Bane Crests (Upstage Right)
// ----------------------------------------------------------------------------

function buildVipJuryLoges(envMap: THREE.Texture) {
  const group = new THREE.Group();
  group.name = 'VipJuryLoges';

  const brassMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const slateMat = createObsidianMaterial(envMap);
  const smokedGlassMat = createBorosilicateGlassMaterial(0x1f4a68, 0.44, envMap);
  const bluedMat = createBluedSteelMaterial(0x1e56c5, envMap);

  const boonMat = new THREE.MeshStandardMaterial({
    color: 0x00c892,
    emissive: 0x00c892,
    emissiveIntensity: 0.34,
    roughness: 0.18,
    metalness: 0.4,
    envMap,
  });
  const baneMat = new THREE.MeshStandardMaterial({
    color: 0xff6738,
    emissive: 0xff6738,
    emissiveIntensity: 0.34,
    roughness: 0.18,
    metalness: 0.4,
    envMap,
  });

  const colXs = [-1.05, 0, 1.05];
  for (const cx of colXs) {
    const shoe = createFloorShoe(0.42, 0.42, 0.08, brassMat, bluedMat);
    shoe.position.set(cx, 0, -7.85);
    group.add(shoe);

    const col = createFilletedShaft({
      radius: 0.09,
      height: 1.98,
      baseCollarFlare: 0.03,
      neckCollarFlare: 0.03,
      anglageBevel: 0.01,
      radialSegments: 36,
      material: aluminumMat,
    });
    col.position.set(cx, 0.08, -7.85);
    group.add(col);

    for (let tierIdx = 0; tierIdx < 2; tierIdx++) {
      const ly = 0.72 + tierIdx * 0.72;
      const lz = -7.35 - tierIdx * 0.18;

      const deck = createChamferedBox({
        width: 0.88,
        height: 0.11,
        depth: 0.72,
        cornerRadius: 0.08,
        material: slateMat,
      });
      deck.position.set(cx, ly, lz);
      group.add(deck);

      const brassTrim = createChamferedBox({
        width: 0.91,
        height: 0.04,
        depth: 0.74,
        cornerRadius: 0.08,
        material: brassMat,
      });
      brassTrim.position.set(cx, ly + 0.06, lz);
      group.add(brassTrim);

      const glassFront = createChamferedBox({
        width: 0.86,
        height: 0.28,
        depth: 0.035,
        cornerRadius: 0.04,
        material: smokedGlassMat,
        castShadow: false,
      });
      glassFront.position.set(cx, ly + 0.22, lz + 0.33);
      group.add(glassFront);

      const topRail = createChamferedBox({
        width: 0.9,
        height: 0.032,
        depth: 0.05,
        cornerRadius: 0.016,
        material: brassMat,
      });
      topRail.position.set(cx, ly + 0.37, lz + 0.33);
      group.add(topRail);

      if (tierIdx === 1) {
        const laurelArch = createChamferedArch({
          innerRadius: 0.09,
          outerRadius: 0.15,
          depth: 0.04,
          arcAngle: Math.PI * 1.35,
          startAngle: -Math.PI * 0.175,
          bevel: 0.008,
          material: boonMat,
          name: 'VipBoonLaurelCrown',
        });
        laurelArch.position.set(cx, ly + 0.16, lz + 0.37);
        laurelArch.rotation.z = Math.PI;
        group.add(laurelArch);
      } else {
        const gavelGroup = new THREE.Group();
        gavelGroup.position.set(cx, ly + 0.16, lz + 0.37);
        const handle = createFilletedShaft({
          radius: 0.02,
          height: 0.18,
          anglageBevel: 0.004,
          radialSegments: 24,
          centered: true,
          material: baneMat,
        });
        const mallet = createFilletedShaft({
          radius: 0.042,
          height: 0.14,
          anglageBevel: 0.006,
          radialSegments: 24,
          centered: true,
          material: baneMat,
        });
        mallet.rotation.z = Math.PI * 0.5;
        mallet.position.y = -0.07;
        gavelGroup.add(handle, mallet);
        group.add(gavelGroup);
      }
    }
  }

  return { group, boonMat, baneMat };
}

// ----------------------------------------------------------------------------
// 6. All 10 Unmistakable Bespoke 1966 Architectural Hero Worlds & Wing Sets!
//    (ZERO Copy-Paste Walls — Every Stage Commands Center Stage at z = -5.4m!)
// ----------------------------------------------------------------------------

interface BuiltBespokeStageSet {
  readonly group: THREE.Group;
  readonly dimmableAcryliteMats: THREE.MeshPhysicalMaterial[];
  readonly chasingBulbGroups: THREE.MeshStandardMaterial[][];
  readonly update: (dtSec: number, elapsedSec: number) => void;
}

function buildBespokeStageArchitectureAndHero(
  stageId: StageWorldIdV7,
  envMap: THREE.Texture,
): BuiltBespokeStageSet {
  const group = new THREE.Group();
  group.name = `BespokeArchitectureAndHero_${stageId}`;

  const palette = STAGE_LIVING_COLOR_PALETTES[stageId];
  const goldMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const bluedMat = createBluedSteelMaterial(0x1e56c5, envMap);
  const walnutMat = createWalnutMaterial(envMap);
  const glassMat = createBorosilicateGlassMaterial(0xdff4ff, 0.34, envMap);
  const acMats = palette.acrylite.map((hex) => createAcrylitePanelMaterial(hex, 0.84, envMap));
  const dimmableAcryliteMats: THREE.MeshPhysicalMaterial[] = [...acMats];
  const chasingBulbGroups: THREE.MeshStandardMaterial[][] = [];
  const bulbGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e2,
    emissive: 0xffd166,
    emissiveIntensity: 1.35,
    roughness: 0.12,
  });

  // Helper to attach chasing bulbs along a curved arch radius
  const addArchBulbs = (
    parent: THREE.Object3D,
    radius: number,
    count: number,
    zOff: number,
    centerY: number,
    bulbHex = 0xffd56b,
  ) => {
    const mats: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < count; i++) {
      const a = 0.14 * Math.PI + (i / Math.max(1, count - 1)) * (0.72 * Math.PI);
      const bm = new THREE.MeshStandardMaterial({
        color: 0xfff8e4,
        emissive: bulbHex,
        emissiveIntensity: 1.0,
        roughness: 0.12,
      });
      const bulb = createTurnedOrb({
        radius: 0.048,
        radialSegments: 16,
        material: bm,
        castShadow: false,
      });
      bulb.position.set(Math.cos(a) * radius, centerY + Math.sin(a) * radius, zOff);
      parent.add(bulb);
      mats.push(bm);
    }
    chasingBulbGroups.push(mats);
  };

  switch (stageId) {
    case 'STAGE_01_IBC_DAYTIME_FUNK': {
      // 30 ROCK STUDIO 6A: Unobstructed 7-Feather NBC Living Color Peacock Fan + Sunlit Walnut Wings w/ Twin Spinning Hex Finials!
      const peacockColors = [0x0096a6, 0x16a34a, 0xf4a91f, 0xff6738, 0xe63b7a, 0x1e56c5, 0x0096a6];
      const featherGroup = new THREE.Group();
      featherGroup.position.set(0, 0.34, -5.48);

      // Regal low-profile 24K Gold & Walnut Scalloped Peacock Plinth at y = 0..0.68m (zero center pole cutting through starburst!)
      const fanPlinthBase = createFilletedShaft({
        radius: 0.86,
        topRadius: 0.68,
        height: 0.32,
        anglageBevel: 0.012,
        radialSegments: 48,
        material: walnutMat,
      });
      fanPlinthBase.position.y = -0.34;
      const fanGoldCap = createSmoothBeveledRing({
        innerRadius: 0.36,
        outerRadius: 0.76,
        thickness: 0.06,
        material: goldMat,
      });
      fanGoldCap.position.y = -0.01;
      const fanHubOrb = createTurnedOrb({
        radius: 0.36,
        heightScale: 0.56,
        material: goldMat,
      });
      fanHubOrb.position.y = 0.08;
      featherGroup.add(fanPlinthBase, fanGoldCap, fanHubOrb);

      for (let i = 0; i < 7; i++) {
        const angle = ((i - 3) / 3) * 0.96;
        const fMat = createAcrylitePanelMaterial(peacockColors[i], 0.82, envMap);
        dimmableAcryliteMats.push(fMat);

        const pivot = new THREE.Group();
        pivot.rotation.z = -angle;

        const spine = createFilletedShaft({
          radius: 0.03,
          height: 2.52,
          anglageBevel: 0.005,
          radialSegments: 20,
          material: goldMat,
        });
        const plumeFrame = createChamferedBox({
          width: 0.44,
          height: 1.48,
          depth: 0.08,
          cornerRadius: 0.18,
          material: goldMat,
        });
        plumeFrame.position.set(0, 2.02, 0);
        const plumeGlow = createChamferedBox({
          width: 0.36,
          height: 1.38,
          depth: 0.045,
          cornerRadius: 0.14,
          material: fMat,
          castShadow: false,
        });
        plumeGlow.position.set(0, 2.02, 0.04);

        pivot.add(spine, plumeFrame, plumeGlow);
        featherGroup.add(pivot);
      }
      group.add(featherGroup);

      // Sunlit American Walnut Slatted Studio 6A Acoustic Wing Screens + Twin Spinning Acrylite Hex Finials!
      const wingSpinners: THREE.Group[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.55, 0, -4.35);
        wing.rotation.y = -side * 0.34;
        wing.add(createFloorShoe(2.4, 0.45, 0.09, goldMat, bluedMat));

        const cove = createCurvedParabolicCove({
          spanWidth: 2.35,
          archHeight: 3.15,
          depth: 0.22,
          thickness: 0.17,
          material: walnutMat,
        });
        wing.add(cove);

        for (let s = -4; s <= 4; s++) {
          const slatH = 2.68 - Math.abs(s) * 0.16;
          const slat = createFilletedShaft({
            radius: 0.038,
            height: slatH,
            anglageBevel: 0.006,
            radialSegments: 20,
            material: s % 3 === 0 ? goldMat : walnutMat,
          });
          slat.position.set(s * 0.23, 0.09, 0.02);
          wing.add(slat);
        }

        // Backlit frosted Acrylite mid-century medallions mounted cleanly on the walnut ribs
        for (let m = 0; m < 2; m++) {
          const ring = createNotchedBezel({
            notchShape: 'HEX',
            outerRadius: 0.36,
            innerRadius: 0.24,
            thickness: 0.07,
            material: goldMat,
          });
          ring.rotation.x = Math.PI * 0.5;
          ring.position.set((m === 0 ? -0.45 : 0.45) * side, 1.35 + m * 0.65, 0.1);
          const lens = createFilletedShaft({
            radius: 0.25,
            height: 0.04,
            radialSegments: 24,
            centered: true,
            material: acMats[(m + (side > 0 ? 1 : 0)) % 3],
            castShadow: false,
          });
          lens.rotation.x = Math.PI * 0.5;
          lens.position.copy(ring.position);
          wing.add(ring, lens);
        }

        // Sculpted spinning Living Color starburst-hex lantern crowning each wing cleanly outside center!
        const spinner = createMidCenturyStarburst({
          radius: 0.54,
          rays: 12,
          depth: 0.055,
          primaryMat: goldMat,
          accentMat: acMats[side > 0 ? 1 : 0],
          bulbMat: bulbGlowMat,
        });
        spinner.position.set(0, 2.52, 0.14);
        wing.add(spinner);
        wingSpinners.push(spinner);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          featherGroup.rotation.z = Math.sin(elapsed * 0.45) * 0.035;
          for (let i = 0; i < wingSpinners.length; i++) {
            wingSpinners[i].rotation.z = elapsed * (i === 0 ? 0.34 : -0.34);
          }
        },
      };
    }

    case 'STAGE_02_IBC_PRIMETIME_JUBILEE': {
      // CBS TELEVISION CITY JUBILEE: Giant Counter-Rotating 24K Starburst Rotunda + Stepped Cerise/Gold Chevrons!
      const rotunda = new THREE.Group();
      rotunda.position.set(0, 0, -5.35);

      for (const sx of [-1.55, 1.55]) {
        const shoe = createFloorShoe(0.55, 0.55, 0.1, goldMat, bluedMat);
        shoe.position.x = sx;
        const pylon = createFilletedShaft({
          radius: 0.11,
          topRadius: 0.14,
          height: 2.05,
          anglageBevel: 0.01,
          radialSegments: 36,
          material: aluminumMat,
        });
        pylon.position.set(sx, 0.1, 0);
        rotunda.add(shoe, pylon);
      }

      const outerHalo = new THREE.Group();
      outerHalo.position.set(0, 1.72, 0);
      const outerStar = createMidCenturyStarburst({
        radius: 1.72,
        rays: 16,
        depth: 0.08,
        primaryMat: goldMat,
        accentMat: acMats[1], // Carnaby Cerise
        bulbMat: bulbGlowMat,
      });
      const haloRing = createSmoothBeveledRing({
        innerRadius: 1.38,
        outerRadius: 1.54,
        thickness: 0.09,
        material: goldMat,
      });
      haloRing.rotation.x = Math.PI * 0.5;
      outerHalo.add(outerStar, haloRing);

      const innerHalo = new THREE.Group();
      innerHalo.position.set(0, 1.72, 0.12);
      const turqRing = createNotchedBezel({
        notchShape: 'SCALLOP',
        outerRadius: 0.96,
        innerRadius: 0.72,
        thickness: 0.09,
        material: acMats[2], // Electric Turquoise
      });
      turqRing.rotation.x = Math.PI * 0.5;
      const innerGear = createInvoluteGear({
        pitchRadius: 0.58,
        teeth: 20,
        thickness: 0.08,
        spokes: 6,
      });
      innerHalo.add(turqRing, innerGear);
      rotunda.add(outerHalo, innerHalo);
      group.add(rotunda);

      // Stepped Hollywood-Squares / CBS Jubilee Wing Light Chevrons (totally distinct from Stage 1!)
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.55, 0, -4.4);
        wing.rotation.y = -side * 0.34;
        wing.add(createFloorShoe(2.4, 0.5, 0.1, goldMat, bluedMat));

        for (let step = 0; step < 3; step++) {
          const sx = (step - 1) * 0.74;
          const h = 2.75 - Math.abs(step - 1) * 0.42;
          const frame = createChamferedBox({
            width: 0.64,
            height: h,
            depth: 0.14,
            cornerRadius: 0.14,
            material: goldMat,
          });
          frame.position.set(sx, h * 0.5 + 0.1, 0);
          const panel = createChamferedBox({
            width: 0.52,
            height: h - 0.16,
            depth: 0.06,
            cornerRadius: 0.1,
            material: acMats[(step + (side > 0 ? 1 : 0)) % 3],
            castShadow: false,
          });
          panel.position.set(sx, h * 0.5 + 0.1, 0.07);
          wing.add(frame, panel);
        }
        addArchBulbs(wing, 1.32, 9, 0.14, 1.75, 0xffd166);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          outerHalo.rotation.z = elapsed * 0.28;
          innerHalo.rotation.z = -elapsed * 0.52;
        },
      };
    }

    case 'STAGE_03_1926_VAUDEVILLE_PIT': {
      // 1966 BURBANK POP-ART CARNIVAL (*Laugh-In* / *Dating Game*):
      // Mondrian Pop-Art Joke-Wall Shutters + Flower-Power Starbursts — ZERO 1926 gears!
      const tvCreamMat = new THREE.MeshPhysicalMaterial({
        color: 0xf7eedb,
        roughness: 0.22,
        metalness: 0.04,
        clearcoat: 0.78,
        envMap,
      });
      const popHexes = [0xe63b7a, 0xf4a91f, 0x0096a6, 0xff6738, 0x1e56c5];
      const popMats = popHexes.map((hex) => createAcrylitePanelMaterial(hex, 0.88, envMap));
      dimmableAcryliteMats.push(...popMats);

      const center = new THREE.Group();
      center.position.set(0, 0, -5.75);
      center.add(createFloorShoe(4.1, 0.52, 0.1, goldMat, bluedMat));

      // Bold Sculpted Mondrian Pop-Art Cream Arch Surround (`z = -0.05`)
      const mondrianArch = createCurvedParabolicCove({
        spanWidth: 4.5,
        archHeight: 3.15,
        depth: 0.24,
        thickness: 0.22,
        material: tvCreamMat,
      });
      center.add(mondrianArch);
      addArchBulbs(center, 2.02, 13, 0.14, 1.18, 0xf4a91f);

      // 6 Animated Pop-Art Hinged Shutters (Laugh-In Joke Wall!) swinging open on rhythm
      const shutterPivots: THREE.Group[] = [];
      const shutterSpecs: ReadonlyArray<{ x: number; y: number; w: number; h: number; cIdx: number; dir: number }> = [
        { x: -1.18, y: 0.82, w: 0.74, h: 0.72, cIdx: 0, dir: 1 },
        { x: 0.0, y: 0.82, w: 0.82, h: 0.72, cIdx: 1, dir: -1 },
        { x: 1.18, y: 0.82, w: 0.74, h: 0.72, cIdx: 2, dir: -1 },
        { x: -1.04, y: 1.72, w: 0.72, h: 0.72, cIdx: 3, dir: 1 },
        { x: 0.0, y: 1.78, w: 0.84, h: 0.76, cIdx: 4, dir: 1 },
        { x: 1.04, y: 1.72, w: 0.72, h: 0.72, cIdx: 0, dir: -1 },
      ];

      for (let i = 0; i < shutterSpecs.length; i++) {
        const sp = shutterSpecs[i];
        const bezel = createChamferedBox({
          width: sp.w + 0.12,
          height: sp.h + 0.12,
          depth: 0.1,
          cornerRadius: 0.1,
          material: tvCreamMat,
        });
        bezel.position.set(sp.x, sp.y, -0.04);

        const innerStar = createMidCenturyStarburst({
          radius: Math.min(sp.w, sp.h) * 0.42,
          rays: 10,
          depth: 0.04,
          primaryMat: goldMat,
          accentMat: popMats[(sp.cIdx + 2) % popMats.length],
        });
        innerStar.position.set(sp.x, sp.y, 0.01);

        // Hinged Pop-Art shutter door mounted on side edge so it physically pops open!
        const hingeX = sp.x + (sp.dir > 0 ? -sp.w * 0.5 : sp.w * 0.5);
        const hinge = new THREE.Group();
        hinge.position.set(hingeX, sp.y, 0.06);
        const door = createChamferedBox({
          width: sp.w,
          height: sp.h,
          depth: 0.055,
          cornerRadius: 0.08,
          material: popMats[sp.cIdx],
          castShadow: false,
        });
        door.position.x = sp.dir > 0 ? sp.w * 0.5 : -sp.w * 0.5;
        hinge.add(door);
        center.add(bezel, innerStar, hinge);
        shutterPivots.push(hinge);
      }
      group.add(center);

      // Flanking 1966 Carnaby Flower-Power Starburst Sculptures on Tulip Stems (Dating Game vibe!)
      const flowerHeads: THREE.Group[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.6, 0, -4.35);
        wing.rotation.y = -side * 0.34;
        wing.add(createFloorShoe(2.1, 0.48, 0.1, goldMat, bluedMat));

        const positions: ReadonlyArray<[number, number, number, number]> = [
          [-0.65, 2.35, 0.72, 0],
          [0.08, 1.62, 0.58, 1],
          [0.68, 2.55, 0.66, 2],
        ];
        for (const [fx, fy, fr, ci] of positions) {
          const stem = createFilletedShaft({
            radius: 0.042,
            height: fy - 0.1,
            radialSegments: 24,
            material: tvCreamMat,
          });
          stem.position.set(fx, 0.1, 0);
          const flower = createMidCenturyStarburst({
            radius: fr,
            rays: 12,
            depth: 0.07,
            primaryMat: popMats[(ci + (side > 0 ? 1 : 0)) % popMats.length],
            accentMat: popMats[(ci + 3) % popMats.length],
            bulbMat: bulbGlowMat,
          });
          flower.position.set(fx, fy, 0.08);
          wing.add(stem, flower);
          flowerHeads.push(flower);
        }
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          for (let i = 0; i < shutterPivots.length; i++) {
            const sp = shutterSpecs[i];
            const wave = Math.max(0, Math.sin(elapsed * 1.05 + i * 1.15));
            shutterPivots[i].rotation.y = -sp.dir * wave * 0.78;
          }
          for (let f = 0; f < flowerHeads.length; f++) {
            flowerHeads[f].rotation.z = elapsed * (f % 2 === 0 ? 0.32 : -0.28);
          }
        },
      };
    }

    case 'STAGE_04_1958_ISOLATION_VAULT': {
      // 1964 "$64,000" TEAK & TEAL GLASS ISOLATION BOOTH:
      // Sunlit American Teak Mullions + Peacock Teal Acoustic Glass Pods + Teak-Brass Relay Desk!
      const tealGlassMat = createBorosilicateGlassMaterial(0x00b4c8, 0.36, envMap);
      const tvCreamMat = new THREE.MeshPhysicalMaterial({
        color: 0xf7eedb,
        roughness: 0.24,
        metalness: 0.04,
        clearcoat: 0.72,
        envMap,
      });

      const center = new THREE.Group();
      center.position.set(0, 0, -5.62);

      for (const bx of [-1.58, 1.58]) {
        const floorPlinth = createFilletedShaft({
          radius: 0.72,
          height: 0.14,
          anglageBevel: 0.012,
          radialSegments: 40,
          material: walnutMat,
        });
        floorPlinth.position.set(bx, 0, 0);

        const brassTrimRing = createSmoothBeveledRing({
          innerRadius: 0.64,
          outerRadius: 0.75,
          thickness: 0.03,
          material: goldMat,
        });
        brassTrimRing.position.set(bx, 0.14, 0);

        const teakCanopy = createFilletedShaft({
          radius: 0.76,
          topRadius: 0.66,
          height: 0.22,
          anglageBevel: 0.012,
          radialSegments: 40,
          material: walnutMat,
        });
        teakCanopy.position.set(bx, 2.28, 0);

        const tealGlowRing = createFilletedShaft({
          radius: 0.68,
          height: 0.09,
          radialSegments: 40,
          material: acMats[0], // Peacock Teal Halo Canopy
          castShadow: false,
        });
        tealGlowRing.position.set(bx, 2.22, 0);

        // 4 Sunlit American Teak & Brass Mullions framing the curved teal acoustic glass!
        for (let p = 0; p < 4; p++) {
          const a = (p / 4) * Math.PI * 2 + Math.PI * 0.25;
          const post = createFilletedShaft({
            radius: 0.044,
            height: 2.14,
            anglageBevel: 0.008,
            radialSegments: 24,
            material: p % 2 === 0 ? walnutMat : goldMat,
          });
          post.position.set(bx + Math.cos(a) * 0.64, 0.14, Math.sin(a) * 0.64);
          center.add(post);
        }

        const curvedTealGlass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.62, 0.62, 2.12, 40, 1, true),
          tealGlassMat,
        );
        curvedTealGlass.position.set(bx, 1.2, 0);

        const beacon = createTurnedOrb({
          radius: 0.125,
          material: acMats[1], // Harvest Gold ON-AIR Isolation Beacon
          castShadow: false,
        });
        beacon.position.set(bx, 2.58, 0);
        center.add(floorPlinth, brassTrimRing, teakCanopy, tealGlowRing, curvedTealGlass, beacon);
      }

      // Central Sunlit Teak & Warm Cream Broadcast Solenoid Console
      const rackShoe = createFloorShoe(0.98, 0.56, 0.1, goldMat, bluedMat);
      const rackBody = createChamferedBox({
        width: 0.84,
        height: 2.08,
        depth: 0.36,
        cornerRadius: 0.1,
        material: walnutMat,
      });
      rackBody.position.y = 1.12;
      const creamDialFace = createChamferedBox({
        width: 0.66,
        height: 1.78,
        depth: 0.04,
        cornerRadius: 0.07,
        material: tvCreamMat,
      });
      creamDialFace.position.set(0, 1.14, 0.17);
      center.add(rackShoe, rackBody, creamDialFace);

      const relayBars: THREE.Mesh[] = [];
      for (let r = 0; r < 6; r++) {
        const bar = createChamferedBox({
          width: 0.52,
          height: 0.072,
          depth: 0.08,
          cornerRadius: 0.025,
          material: r % 2 === 0 ? acMats[0] : goldMat,
        });
        bar.position.set(0, 0.48 + r * 0.27, 0.22);
        center.add(bar);
        relayBars.push(bar);
      }
      group.add(center);

      // Sunlit Teak & Backlit Peacock Teal Mid-Century Acoustic Slat Wings
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.65, 0, -4.35);
        wing.rotation.y = -side * 0.32;
        wing.add(createFloorShoe(2.4, 0.46, 0.09, goldMat, bluedMat));
        const wingArch = createCurvedParabolicCove({
          spanWidth: 2.38,
          archHeight: 3.05,
          depth: 0.22,
          thickness: 0.18,
          material: walnutMat,
        });
        wing.add(wingArch);
        for (let f = -3; f <= 3; f++) {
          const fin = createFilletedShaft({
            radius: 0.048,
            height: 2.65 - Math.abs(f) * 0.16,
            radialSegments: 20,
            material: f % 2 === 0 ? walnutMat : goldMat,
          });
          fin.position.set(f * 0.3, 0.09, 0.02);
          wing.add(fin);
        }
        const tealColumn = createFilletedShaft({
          radius: 0.11,
          height: 2.42,
          radialSegments: 24,
          material: acMats[0],
          castShadow: false,
        });
        tealColumn.position.set(0, 0.12, 0.2);
        wing.add(tealColumn);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          for (let i = 0; i < relayBars.length; i++) {
            const snap = Math.sin(elapsed * (5.2 + i * 1.1) + i * 1.6) > 0.2 ? 0.14 : -0.14;
            relayBars[i].rotation.z = snap;
          }
        },
      };
    }

    case 'STAGE_05_1984_LARSON_CRT_LAB': {
      // 1967 APOLLO-ERA MASTER COLOR CONTROL PAVILION:
      // Sweeping Warm TV Cream & Royal Cobalt Mission Consoles + RCA Color Strips + Spinning Telemetry Armillary (ZERO 1984 CRTs!)
      const tvCreamMat = new THREE.MeshPhysicalMaterial({
        color: 0xf7eedb,
        roughness: 0.2,
        metalness: 0.06,
        clearcoat: 0.85,
        envMap,
      });
      const cobaltEnamelMat = createGrandFeuEnamelMaterial(0x1e56c5, envMap);
      const rcaBarHexes = [0x0096a6, 0xf4a91f, 0xff6738, 0xe63b7a, 0x1e56c5];
      const rcaBarMats = rcaBarHexes.map((hex) => createAcrylitePanelMaterial(hex, 0.9, envMap));
      dimmableAcryliteMats.push(...rcaBarMats);

      const center = new THREE.Group();
      center.position.set(0, 0, -5.85);

      // Sweeping Curved 1967 Apollo Control Amphitheater Arch in Warm Cream & Royal Cobalt
      const apolloArchOuter = createCurvedParabolicCove({
        spanWidth: 4.8,
        archHeight: 3.15,
        depth: 0.28,
        thickness: 0.24,
        material: tvCreamMat,
      });
      const apolloArchCobalt = createCurvedParabolicCove({
        spanWidth: 4.25,
        archHeight: 2.82,
        depth: 0.16,
        thickness: 0.14,
        material: cobaltEnamelMat,
      });
      apolloArchCobalt.position.z = 0.06;
      center.add(apolloArchOuter, apolloArchCobalt);

      // Curved Lower Master Control Console Desk w/ Illuminated 1967 RCA Color-Bar Indicator Modules
      const consoleArcGroup = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const norm = (i - 2) / 2;
        const angle = norm * 0.44;
        const x = Math.sin(angle) * 2.15;
        const z = (1 - Math.cos(angle)) * 1.15;
        const pod = createChamferedBox({
          width: 0.82,
          height: 0.92,
          depth: 0.42,
          cornerRadius: 0.12,
          material: tvCreamMat,
        });
        pod.position.set(x, 0.48, z);
        pod.rotation.y = -angle;

        const colorStrip = createChamferedBox({
          width: 0.66,
          height: 0.36,
          depth: 0.05,
          cornerRadius: 0.07,
          material: rcaBarMats[i % rcaBarMats.length],
          castShadow: false,
        });
        colorStrip.position.set(0, 0.14, 0.21);
        pod.add(colorStrip);
        consoleArcGroup.add(pod);
      }
      center.add(consoleArcGroup);

      // Central 1967 Apollo Broadcast Satellite Telemetry Armillary (Triple Counter-Rotating Orbital Rings!)
      const armillaryPivot = new THREE.Group();
      armillaryPivot.position.set(0, 1.88, -0.02);
      const coreOrb = createTurnedOrb({
        radius: 0.32,
        material: rcaBarMats[0], // Glowing Peacock Teal Earth/Signal Core
        castShadow: false,
      });
      const orbitRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.032, 16, 48), goldMat);
      const orbitRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.028, 16, 48), rcaBarMats[2]);
      orbitRing2.rotation.x = Math.PI * 0.38;
      const orbitRing3 = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.026, 16, 48), tvCreamMat);
      orbitRing3.rotation.set(-0.42, 0.55, 0);
      armillaryPivot.add(coreOrb, orbitRing1, orbitRing2, orbitRing3);
      center.add(armillaryPivot);
      group.add(center);

      // Flanking 1967 Apollo Cream-and-Cobalt Analog Broadcast Vectorscope Wings
      const vectorRings: THREE.Mesh[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.3);
        wing.rotation.y = -side * 0.36;
        const arch = createCurvedParabolicCove({
          spanWidth: 2.35,
          archHeight: 3.0,
          depth: 0.24,
          thickness: 0.18,
          material: tvCreamMat,
        });
        const scopeBezel = createSmoothBeveledRing({
          innerRadius: 0.58,
          outerRadius: 0.74,
          thickness: 0.1,
          material: goldMat,
        });
        scopeBezel.rotation.x = Math.PI * 0.5;
        scopeBezel.position.set(0, 1.56, 0.08);
        const scopeGlass = createFilletedShaft({
          radius: 0.58,
          height: 0.04,
          radialSegments: 32,
          centered: true,
          material: side < 0 ? rcaBarMats[0] : rcaBarMats[1],
          castShadow: false,
        });
        scopeGlass.rotation.x = Math.PI * 0.5;
        scopeGlass.position.set(0, 1.56, 0.06);
        const sweepRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.026, 12, 32), rcaBarMats[2]);
        sweepRing.position.set(0, 1.56, 0.14);
        vectorRings.push(sweepRing);
        wing.add(arch, scopeBezel, scopeGlass, sweepRing);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          orbitRing1.rotation.y = elapsed * 0.65;
          orbitRing2.rotation.z = -elapsed * 0.48;
          orbitRing3.rotation.y = -elapsed * 0.35;
          orbitRing3.rotation.x = -0.42 + Math.sin(elapsed * 0.5) * 0.2;
          for (let r = 0; r < vectorRings.length; r++) {
            vectorRings[r].rotation.z = elapsed * (r === 0 ? 0.75 : -0.75);
          }
        },
      };
    }

    case 'STAGE_06_ATLANTIC_CITY_PIER': {
      // 1965 ATLANTIC CITY STEEL PIER: Gilded Wurlitzer Organ Pipe Fan + Sunburst Boardwalk Carnival Arches!
      const center = new THREE.Group();
      center.position.set(0, 0, -5.3);

      const bandstand = createChamferedBox({
        width: 4.05,
        height: 0.72,
        depth: 0.88,
        cornerRadius: 0.2,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 3,
        material: walnutMat,
      });
      bandstand.position.y = 0.36;
      const brassBelt = createChamferedBox({
        width: 4.12,
        height: 0.09,
        depth: 0.92,
        cornerRadius: 0.2,
        material: goldMat,
      });
      brassBelt.position.y = 0.74;
      const inlayStrip = createChamferedBox({
        width: 3.65,
        height: 0.16,
        depth: 0.05,
        cornerRadius: 0.06,
        material: acMats[0],
        castShadow: false,
      });
      inlayStrip.position.set(0, 0.36, 0.45);
      center.add(bandstand, brassBelt, inlayStrip);

      const pipes: THREE.Mesh[] = [];
      for (let i = 0; i < 15; i++) {
        const norm = Math.abs(i - 7) / 7;
        const px = (i - 7) * 0.25;
        const pipeH = 2.38 - norm * 1.05;
        const pipeR = 0.088 - norm * 0.03;
        const pipe = createFilletedShaft({
          radius: pipeR,
          height: pipeH,
          baseCollarFlare: 0.018,
          neckCollarFlare: 0.024,
          anglageBevel: 0.008,
          radialSegments: 28,
          material: i % 3 === 0 ? aluminumMat : goldMat,
        });
        pipe.position.set(px, 0.78, (1 - norm) * 0.08);
        center.add(pipe);
        pipes.push(pipe);
      }

      const pierArch = createCurvedParabolicCove({
        spanWidth: 4.5,
        archHeight: 3.2,
        depth: 0.24,
        thickness: 0.18,
        material: acMats[1], // Sunset Tangerine
      });
      pierArch.position.set(0, 0.06, -0.35);
      center.add(pierArch);
      addArchBulbs(center, 2.05, 13, -0.18, 1.25, 0xffd166);
      group.add(center);

      // Boardwalk Carnival Ferris-Starburst Wing Arches
      const ferrisStars: THREE.Group[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.35);
        wing.rotation.y = -side * 0.34;
        const carnivalArch = createCurvedParabolicCove({
          spanWidth: 2.4,
          archHeight: 3.05,
          depth: 0.22,
          thickness: 0.18,
          material: goldMat,
        });
        const oceanWavePanel = createChamferedArch({
          innerRadius: 0.1,
          outerRadius: 1.05,
          depth: 0.06,
          material: acMats[0],
        });
        oceanWavePanel.position.set(0, 0.95, -0.04);
        const ferrisStar = createMidCenturyStarburst({
          radius: 0.86,
          rays: 12,
          primaryMat: goldMat,
          accentMat: acMats[2],
          bulbMat: bulbGlowMat,
        });
        ferrisStar.position.set(0, 1.85, 0.14);
        ferrisStars.push(ferrisStar);
        wing.add(carnivalArch, oceanWavePanel, ferrisStar);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          for (let i = 0; i < pipes.length; i++) {
            pipes[i].scale.y = 1 + Math.sin(elapsed * 3.2 + i * 0.55) * 0.018;
          }
          for (let s = 0; s < ferrisStars.length; s++) {
            ferrisStars[s].rotation.z = elapsed * (s === 0 ? 0.32 : -0.32);
          }
        },
      };
    }

    case 'STAGE_07_1969_MONTE_CARLO_CASINO': {
      // 1969 MONTE CARLO ROYALE: Soaring Ken Adam Ivory-Marble & 24K Gold Parabolic Rotunda + Spinning Baccarat Chandelier!
      const ivoryMarbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xf6eedd,
        roughness: 0.2,
        metalness: 0.06,
        clearcoat: 0.88,
        envMap,
      });

      const center = new THREE.Group();
      center.position.set(0, 0, -6.05);

      const archPortal = createCurvedParabolicCove({
        spanWidth: 4.35,
        archHeight: 3.15,
        depth: 0.34,
        thickness: 0.28,
        material: ivoryMarbleMat,
      });
      const innerEmerald = createCurvedParabolicCove({
        spanWidth: 3.72,
        archHeight: 2.8,
        depth: 0.14,
        thickness: 0.12,
        material: acMats[0],
      });
      innerEmerald.position.z = 0.04;
      center.add(archPortal, innerEmerald);

      const luminaire = new THREE.Group();
      luminaire.position.set(0, 1.84, 0.02);
      const octRing = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.88,
        innerRadius: 0.6,
        thickness: 0.2,
        material: goldMat,
      });
      const crystalStar = createMidCenturyStarburst({
        radius: 0.94,
        rays: 12,
        primaryMat: goldMat,
        accentMat: glassMat,
        bulbMat: bulbGlowMat,
      });
      crystalStar.rotation.x = Math.PI * 0.5;
      const crystalCore = createTurnedOrb({
        radius: 0.45,
        heightScale: 0.54,
        material: glassMat,
      });
      luminaire.add(octRing, crystalStar, crystalCore);
      center.add(luminaire);

      for (const [tx, tz] of [
        [-1.18, -0.2],
        [1.18, -0.2],
        [-0.95, 0.55],
        [0.95, 0.55],
      ] as const) {
        const floorLug = createFloorShoe(0.24, 0.24, 0.07, goldMat, bluedMat);
        floorLug.position.set(tx, 0, tz);
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(tx, 0.07, tz),
          new THREE.Vector3(tx * 0.72, 1.82, 0.22 + (tz - 0.15) * 0.4),
        ]);
        const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.016, 8, false), goldMat);
        center.add(floorLug, cable);
      }
      group.add(center);

      // Sweeping Ken Adam Cantilevered Ivory-Gold Wing Ribs + Riviera Emerald Alcoves
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.35);
        wing.rotation.y = -side * 0.36;
        for (let r = 0; r < 3; r++) {
          const rib = createMidCenturyBoomerangPylon({
            height: 3.15 - r * 0.22,
            sweepX: -side * (0.72 + r * 0.12),
            thickness: 0.22,
            depth: 0.24,
            material: r === 1 ? goldMat : ivoryMarbleMat,
          });
          rib.position.set((r - 1) * 0.72, 0, -r * 0.12);
          wing.add(rib);
        }
        const alcove = createChamferedArch({
          innerRadius: 0.12,
          outerRadius: 0.88,
          depth: 0.08,
          material: acMats[0],
        });
        alcove.position.set(0, 1.25, -0.18);
        wing.add(alcove);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          luminaire.rotation.y = elapsed * 0.38;
        },
      };
    }

    case 'STAGE_08_WORLDS_FAIR_GEODESIC': {
      // 1965 WORLD'S FAIR PAVILION OF TOMORROW: Alabaster Unisphere Arches + Googie Boomerang Pylons + Orbiting Beacon Dish!
      const alabasterMat = new THREE.MeshPhysicalMaterial({
        color: 0xf6f9fe,
        roughness: 0.18,
        metalness: 0.08,
        clearcoat: 0.88,
        envMap,
      });

      const center = new THREE.Group();
      center.position.set(0, 0, -6.28);

      for (let i = -2; i <= 2; i++) {
        const arch = createChamferedArch({
          innerRadius: 2.35,
          outerRadius: 2.55,
          depth: 0.15,
          material: i % 2 === 0 ? goldMat : alabasterMat,
        });
        arch.position.set(0, 0.04, -0.42);
        arch.rotation.y = i * 0.28;
        center.add(arch);
      }

      const yokeShoe = createFloorShoe(1.55, 1.25, 0.12, aluminumMat, goldMat);
      center.add(yokeShoe);
      const azimuthYoke = new THREE.Group();
      azimuthYoke.position.y = 0.12;
      center.add(azimuthYoke);

      for (const yx of [-0.58, 0.58]) {
        const arm = createFilletedShaft({
          radius: 0.085,
          topRadius: 0.065,
          height: 1.56,
          anglageBevel: 0.01,
          radialSegments: 28,
          material: goldMat,
        });
        arm.position.set(yx, 0, 0);
        azimuthYoke.add(arm);
      }

      const dishPts: THREE.Vector2[] = [];
      for (let k = 0; k <= 16; k++) {
        const r = (k / 16) * 1.44;
        dishPts.push(new THREE.Vector2(r, r * r * 0.26));
      }
      const dishGeom = new THREE.LatheGeometry(dishPts, 48);
      dishGeom.rotateX(Math.PI * 0.5);
      dishGeom.computeVertexNormals();
      const dishMat = new THREE.MeshPhysicalMaterial({
        color: 0xffd166,
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 0.45,
        side: THREE.DoubleSide,
        envMap,
      });

      const dishPivot = new THREE.Group();
      dishPivot.position.y = 1.58;
      const dishMesh = new THREE.Mesh(dishGeom, dishMat);
      const orbitA = new THREE.Mesh(new THREE.TorusGeometry(1.58, 0.032, 16, 48), acMats[0]);
      const orbitB = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.026, 14, 48), acMats[1]);
      orbitB.rotation.set(0.55, 0.4, 0);
      const orbitC = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.026, 14, 48), acMats[2]);
      orbitC.rotation.set(-0.55, -0.4, 0);

      const feedHorn = createFilletedShaft({
        radius: 0.055,
        height: 0.7,
        anglageBevel: 0.008,
        radialSegments: 28,
        material: aluminumMat,
      });
      feedHorn.rotation.x = Math.PI * 0.5;
      feedHorn.position.z = 0.36;
      const feedTip = createTurnedOrb({ radius: 0.095, material: acMats[0], castShadow: false });
      feedTip.position.z = 0.72;
      dishPivot.add(dishMesh, orbitA, orbitB, orbitC, feedHorn, feedTip);
      azimuthYoke.add(dishPivot);
      group.add(center);

      // Iconic 1965 Flushing Meadows Googie Boomerang Wing Pylons + Satellite Spheres
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.65, 0, -4.35);
        wing.rotation.y = -side * 0.3;
        const boomA = createMidCenturyBoomerangPylon({
          height: 3.35,
          sweepX: side * 0.95,
          thickness: 0.26,
          depth: 0.2,
          material: alabasterMat,
        });
        const boomB = createMidCenturyBoomerangPylon({
          height: 2.65,
          sweepX: -side * 0.65,
          thickness: 0.18,
          depth: 0.16,
          material: goldMat,
        });
        boomB.position.set(-side * 0.55, 0, 0.12);
        const satOrb = createTurnedOrb({
          radius: 0.24,
          material: acMats[side > 0 ? 0 : 1],
          castShadow: false,
        });
        satOrb.position.set(side * 0.26, 3.45, 0);
        const satRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.022, 12, 32), goldMat);
        satRing.position.copy(satOrb.position);
        satRing.rotation.set(1.15, side * 0.35, 0);
        wing.add(boomA, boomB, satOrb, satRing);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          azimuthYoke.rotation.y = Math.sin(elapsed * 0.45) * 0.34;
          dishPivot.rotation.x = -0.16 + Math.cos(elapsed * 0.62) * 0.1;
          orbitA.rotation.z = elapsed * 0.45;
          orbitB.rotation.z = -elapsed * 0.55;
          orbitC.rotation.z = elapsed * 0.5;
        },
      };
    }

    case 'STAGE_09_CHANNEL_83_UHF_BARGE': {
      // 1967 OFFSHORE PIRATE RADIO SHIP (M/V CASSANDRA): Curved Bridge Bulkhead, 5 Ocean Portholes, Glowing 50kW Klystrons & Lattice Radio Masts!
      const center = new THREE.Group();
      center.position.set(0, 0, -5.52);

      const bulkhead = createCurvedParabolicCove({
        spanWidth: 4.7,
        archHeight: 2.85,
        depth: 0.28,
        thickness: 0.34,
        material: aluminumMat,
      });
      bulkhead.position.set(0, 0.04, -0.4);
      center.add(bulkhead);

      const waveBars: THREE.Mesh[] = [];
      for (let p = 0; p < 5; p++) {
        const px = (p - 2) * 0.82;
        const py = 1.72 + (1 - Math.abs(p - 2) * 0.22) * 0.26;
        const bezel = createNotchedBezel({
          notchShape: 'HEX',
          outerRadius: 0.26,
          innerRadius: 0.18,
          thickness: 0.08,
          material: goldMat,
        });
        bezel.rotation.x = Math.PI * 0.5;
        bezel.position.set(px, py, -0.24);
        const seaDisc = createFilletedShaft({
          radius: 0.18,
          height: 0.04,
          radialSegments: 24,
          centered: true,
          material: acMats[0], // Electric Turquoise Sea Glow
          castShadow: false,
        });
        seaDisc.rotation.x = Math.PI * 0.5;
        seaDisc.position.set(px, py, -0.25);
        center.add(bezel, seaDisc);
        waveBars.push(seaDisc);
      }

      for (const kx of [-1.32, 1.32]) {
        const shoe = createFloorShoe(0.64, 0.64, 0.12, goldMat, bluedMat);
        shoe.position.set(kx, 0, 0.18);
        const cavity = createFilletedShaft({
          radius: 0.21,
          height: 0.72,
          anglageBevel: 0.012,
          radialSegments: 32,
          material: goldMat,
        });
        cavity.position.set(kx, 0.12, 0.18);
        const tubeCore = createFilletedShaft({
          radius: 0.13,
          height: 1.02,
          anglageBevel: 0.008,
          radialSegments: 28,
          material: acMats[1], // Glowing Atomic Tangerine Klystron
        });
        tubeCore.position.set(kx, 0.84, 0.18);
        const glassJacket = createFilletedShaft({
          radius: 0.18,
          height: 1.12,
          anglageBevel: 0.01,
          radialSegments: 28,
          material: glassMat,
          castShadow: false,
        });
        glassJacket.position.set(kx, 0.82, 0.18);
        center.add(shoe, cavity, tubeCore, glassJacket);
      }

      const clinoDial = createNotchedBezel({
        notchShape: 'VERNIER',
        outerRadius: 0.45,
        innerRadius: 0.34,
        thickness: 0.08,
        material: goldMat,
      });
      clinoDial.rotation.x = Math.PI * 0.5;
      clinoDial.position.set(0, 1.02, 0.16);
      const clinoNeedle = createChamferedBox({
        width: 0.055,
        height: 0.6,
        depth: 0.05,
        cornerRadius: 0.02,
        material: acMats[0],
      });
      clinoNeedle.position.set(0, 1.02, 0.21);
      center.add(clinoDial, clinoNeedle);
      group.add(center);

      // Slanted Offshore Radio Broadcast Lattice Masts + Strobing Beacons on Wings
      const beaconMats: THREE.MeshStandardMaterial[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.6, 0, -4.35);
        wing.add(createFloorShoe(0.85, 0.85, 0.12, goldMat, bluedMat));
        const mast = createFilletedShaft({
          radius: 0.12,
          topRadius: 0.04,
          height: 3.35,
          anglageBevel: 0.008,
          radialSegments: 24,
          material: aluminumMat,
        });
        mast.position.y = 0.12;
        mast.rotation.z = -side * 0.14;
        wing.add(mast);

        for (let r = 0; r < 3; r++) {
          const coil = new THREE.Mesh(
            new THREE.TorusGeometry(0.46 - r * 0.1, 0.028, 12, 32),
            r % 2 === 0 ? acMats[0] : goldMat,
          );
          coil.rotation.x = Math.PI * 0.5;
          coil.position.set(side * (0.14 + r * 0.1), 1.15 + r * 0.72, 0);
          wing.add(coil);
        }

        const strobeMat = new THREE.MeshStandardMaterial({
          color: 0xff6738,
          emissive: 0xff521b,
          emissiveIntensity: 1.5,
          roughness: 0.12,
        });
        const strobe = createTurnedOrb({ radius: 0.15, material: strobeMat, castShadow: false });
        strobe.position.set(side * 0.46, 3.45, 0);
        wing.add(strobe);
        beaconMats.push(strobeMat);
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          const swell = Math.sin(elapsed * 1.45) * 0.25;
          clinoNeedle.rotation.z = swell;
          for (let i = 0; i < waveBars.length; i++) {
            waveBars[i].rotation.z = swell * 0.8;
          }
          for (let b = 0; b < beaconMats.length; b++) {
            beaconMats[b].emissiveIntensity = 0.45 + Math.pow(0.5 + 0.5 * Math.sin(elapsed * 3.8 + b * Math.PI), 2) * 1.85;
          }
        },
      };
    }

    case 'STAGE_10_SOVEREIGN_SANCTUM': {
      // 1966 NETWORK EXECUTIVE PENTHOUSE (38TH FLOOR 30 ROCK): Manhattan Skyline Lancet Bays + 24K Escapement + Mercury Pendulum!
      const mercuryMat = new THREE.MeshPhysicalMaterial({
        color: 0xf2f7ff,
        metalness: 0.98,
        roughness: 0.06,
        clearcoat: 1.0,
        envMap,
        envMapIntensity: 2.0,
      });

      const center = new THREE.Group();
      center.position.set(0, 0, -5.62);

      const wellCurb = createSmoothBeveledRing({
        innerRadius: 0.68,
        outerRadius: 0.98,
        thickness: 0.14,
        material: goldMat,
      });
      wellCurb.position.y = 0.07;
      center.add(wellCurb);

      for (const bx of [-1.62, 1.62]) {
        const shoe = createFloorShoe(0.62, 0.62, 0.12, goldMat, bluedMat);
        shoe.position.set(bx, 0, 0);
        const flutedPillar = createFilletedShaft({
          radius: 0.18,
          topRadius: 0.14,
          height: 2.75,
          anglageBevel: 0.012,
          radialSegments: 36,
          material: goldMat,
        });
        flutedPillar.position.set(bx, 0.12, 0);
        const lancetGlow = createFilletedShaft({
          radius: 0.085,
          height: 2.35,
          anglageBevel: 0.008,
          radialSegments: 24,
          material: bx < 0 ? acMats[0] : acMats[1],
          castShadow: false,
        });
        lancetGlow.position.set(bx * 0.78, 0.25, -0.22);
        center.add(shoe, flutedPillar, lancetGlow);
      }

      const grahamArch = createChamferedArch({
        innerRadius: 1.28,
        outerRadius: 1.62,
        depth: 0.3,
        material: goldMat,
      });
      grahamArch.position.y = 1.68;
      center.add(grahamArch);

      const escapeWheel = createInvoluteGear({
        pitchRadius: 0.62,
        teeth: 30,
        thickness: 0.09,
        spokes: 6,
      });
      escapeWheel.position.set(0, 1.68, 0.14);
      center.add(escapeWheel);

      const pendulumGroup = new THREE.Group();
      pendulumGroup.position.set(0, 1.94, 0.24);
      const rod = createFilletedShaft({
        radius: 0.032,
        height: 1.62,
        anglageBevel: 0.006,
        radialSegments: 28,
        material: aluminumMat,
      });
      rod.position.y = -1.62;
      const mercuryBob = createFilletedShaft({
        radius: 0.23,
        height: 0.44,
        anglageBevel: 0.012,
        radialSegments: 36,
        material: mercuryMat,
      });
      mercuryBob.position.y = -1.76;
      pendulumGroup.add(rod, mercuryBob);
      center.add(pendulumGroup);
      group.add(center);

      // Towering Art-Deco Champagne-Gold & Midnight-Sapphire Manhattan Penthouse Window Bay Wings
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.35);
        wing.rotation.y = -side * 0.34;
        const decoArch = createCurvedParabolicCove({
          spanWidth: 2.5,
          archHeight: 3.35,
          depth: 0.26,
          thickness: 0.2,
          material: goldMat,
        });
        wing.add(decoArch);
        for (let l = -1; l <= 1; l++) {
          const lh = l === 0 ? 2.55 : 2.05;
          const bay = createChamferedBox({
            width: 0.52,
            height: lh,
            depth: 0.05,
            cornerRadius: 0.16,
            material: acMats[(l + 2) % 3],
            castShadow: false,
          });
          bay.position.set(l * 0.64, lh * 0.5 + 0.14, -0.02);
          const mullion = createFilletedShaft({
            radius: 0.032,
            height: lh + 0.1,
            radialSegments: 20,
            material: goldMat,
          });
          mullion.position.set(l * 0.64, 0.12, 0.04);
          wing.add(bay, mullion);
        }
        group.add(wing);
      }

      return {
        group,
        dimmableAcryliteMats,
        chasingBulbGroups,
        update: (_dt, elapsed) => {
          const swing = Math.sin(elapsed * Math.PI * 0.9) * 0.26;
          pendulumGroup.rotation.z = swing;
          const beatSteps = Math.floor(elapsed * 1.8);
          const beatFrac = elapsed * 1.8 - beatSteps;
          const quantized = beatSteps + Math.min(1, beatFrac * 4.5);
          escapeWheel.rotation.z = -quantized * ((Math.PI * 2) / 30);
        },
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 7. Complete Ultra-HD 1966 Living Color Soundstage Builder (`buildStageWorldV7`)
// ----------------------------------------------------------------------------

export function buildStageWorldV7(
  stageId: StageWorldIdV7,
  envMap: THREE.Texture,
): BuiltStageWorldV7 {
  const spec = STAGE_WORLD_SPECS_V7[stageId];
  const palette = STAGE_LIVING_COLOR_PALETTES[stageId];
  const root = new THREE.Group();
  root.name = `StageWorldV7_${stageId}`;

  const goldMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const bluedMat = createBluedSteelMaterial(0x1e56c5, envMap);
  const walnutMat = createWalnutMaterial(envMap);
  const trussMat = new THREE.MeshPhysicalMaterial({
    color: 0x263a52,
    metalness: 0.86,
    roughness: 0.26,
    clearcoat: 0.35,
    envMap,
    envMapIntensity: 1.3,
  });

  // --------------------------------------------------------------------------
  // 1) Glossy Clearcoated Broadcast Stage Floor (`y = 0.00m`) + Anti-Moiré
  // --------------------------------------------------------------------------
  const floorKind = STAGE_FLOOR_MAP_V7[stageId];
  const floorMat = createAntiMoireFloorMaterial(floorKind, {
    repeatX: 7,
    repeatY: 7,
    envMap,
    envMapIntensity: 1.25,
    clearcoat: 0.68,
    baseRoughness: 0.21,
  });
  const floorGeom = new THREE.PlaneGeometry(40, 36);
  floorGeom.rotateX(-Math.PI * 0.5);
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.position.set(0, 0, -4.5);
  floorMesh.receiveShadow = true;
  floorMesh.name = 'SoundstageAntiMoireFloor';
  root.add(floorMesh);

  // --------------------------------------------------------------------------
  // 2) Radiant Gradient Curved Hard Cyclorama (`z = -14.8m`) + Grazing Floor Cove
  // --------------------------------------------------------------------------
  const cycTex = createCycloramaGradientTexture(stageId, palette);
  const cycGeom = new THREE.CylinderGeometry(
    16.4,
    16.4,
    14.5,
    56,
    1,
    true,
    Math.PI * 0.62,
    Math.PI * 0.76,
  );
  const cycMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: cycTex,
    emissive: 0xffffff,
    emissiveMap: cycTex,
    emissiveIntensity: 0.56,
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.BackSide,
  });
  const cycMesh = new THREE.Mesh(cycGeom, cycMat);
  cycMesh.position.set(0, 7.1, 1.5);
  cycMesh.name = 'CurvedHardCyclorama';
  root.add(cycMesh);

  const coveBarMat = new THREE.MeshStandardMaterial({
    color: spec.coveLightHex,
    emissive: spec.coveLightHex,
    emissiveIntensity: 1.15,
    roughness: 0.2,
  });
  const coveArcGeom = new THREE.TorusGeometry(14.8, 0.12, 14, 56, Math.PI * 0.72);
  coveArcGeom.rotateX(Math.PI * 0.5);
  coveArcGeom.rotateY(Math.PI * 0.14 + Math.PI);
  const coveTrough = new THREE.Mesh(coveArcGeom, coveBarMat);
  coveTrough.position.set(0, 0.08, 1.5);
  root.add(coveTrough);

  // --------------------------------------------------------------------------
  // 3) Sleek Smooth-Ring Broadcast Stage Medallion (ZERO Floor Cog!) + Warm/Cool Light Pools
  // --------------------------------------------------------------------------
  const floorAccentGroup = new THREE.Group();
  floorAccentGroup.name = 'GlossyStageMedallionAndLightPools';

  const stageMedallionMat = new THREE.MeshPhysicalMaterial({
    color: spec.tableBedHex,
    roughness: 0.16,
    metalness: 0.16,
    clearcoat: 0.9,
    clearcoatRoughness: 0.07,
    envMap,
    envMapIntensity: 1.3,
  });
  const stageDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(2.74, 2.78, 0.01, 64),
    stageMedallionMat,
  );
  stageDisc.position.set(0, 0.005, -0.05);
  stageDisc.receiveShadow = true;

  // Sleek smooth beveled satin-brass outer bezel (NO cog notches!)
  const brassRingInner = createSmoothBeveledRing({
    innerRadius: 2.74,
    outerRadius: 2.86,
    thickness: 0.014,
    material: goldMat,
    name: 'StudioFloorBrassRingOuter',
  });
  brassRingInner.position.set(0, 0.008, -0.05);

  const floorRingGlowMat = new THREE.MeshStandardMaterial({
    color: palette.ringGlowHex,
    emissive: palette.ringGlowHex,
    emissiveIntensity: 1.05,
    roughness: 0.16,
  });
  const neonRingA = new THREE.Mesh(new THREE.RingGeometry(2.6, 2.67, 72), floorRingGlowMat);
  neonRingA.rotation.x = -Math.PI * 0.5;
  neonRingA.position.set(0, 0.012, -0.05);

  const neonRingB = new THREE.Mesh(new THREE.RingGeometry(3.64, 3.72, 72), floorRingGlowMat);
  neonRingB.rotation.x = -Math.PI * 0.5;
  neonRingB.position.set(0, 0.011, -0.05);

  const brassRingFar = createSmoothBeveledRing({
    innerRadius: 3.74,
    outerRadius: 3.84,
    thickness: 0.01,
    material: aluminumMat,
    name: 'StudioFloorAluminumRingOuter',
  });
  brassRingFar.position.set(0, 0.007, -0.05);

  // Rich dual Warm (3200K key) + Cool (stage Living Color rim) floor specular light pools (calibrated for rich non-washed studio depth!)
  const poolTexSoft = createFloorLightPoolTexture(
    'rgba(255, 255, 255, 0.28)',
    'rgba(255, 255, 255, 0.08)',
  );
  const poolMatWarm = new THREE.MeshBasicMaterial({
    color: palette.warmPoolHex,
    map: poolTexSoft,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const centerPool = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 7.6), poolMatWarm);
  centerPool.rotation.x = -Math.PI * 0.5;
  centerPool.position.set(0, 0.014, -0.35);

  const poolMatCoolL = new THREE.MeshBasicMaterial({
    color: palette.coolPoolHex,
    map: poolTexSoft,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const leftPool = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 5.8), poolMatCoolL);
  leftPool.rotation.x = -Math.PI * 0.5;
  leftPool.position.set(-3.3, 0.013, -3.5);

  const poolMatWarmR = new THREE.MeshBasicMaterial({
    color: palette.warmPoolHex,
    map: poolTexSoft,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const rightPool = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 5.8), poolMatWarmR);
  rightPool.rotation.x = -Math.PI * 0.5;
  rightPool.position.set(3.3, 0.013, -3.5);

  floorAccentGroup.add(
    stageDisc,
    brassRingInner,
    neonRingA,
    neonRingB,
    brassRingFar,
    centerPool,
    leftPool,
    rightPool,
  );
  root.add(floorAccentGroup);

  // --------------------------------------------------------------------------
  // 4) Layer 1 Lateral Wing Trusses + Compliance Fresnel Lamp
  // --------------------------------------------------------------------------
  const buildLateralTruss = (name: string): THREE.Group => {
    const tg = new THREE.Group();
    tg.name = name;
    const shoe = createFloorShoe(0.62, 0.62, 0.12, goldMat, bluedMat);
    tg.add(shoe);

    for (const [cx, cz] of [
      [-0.16, -0.16],
      [0.16, -0.16],
      [-0.16, 0.16],
      [0.16, 0.16],
    ] as const) {
      const chord = createFilletedShaft({
        radius: 0.032,
        height: 4.8,
        anglageBevel: 0.006,
        radialSegments: 24,
        material: trussMat,
      });
      chord.position.set(cx, 0.12, cz);
      tg.add(chord);
    }

    for (let r = 0; r < 7; r++) {
      const collar = createChamferedBox({
        width: 0.42,
        height: 0.055,
        depth: 0.42,
        cornerRadius: 0.06,
        material: goldMat,
      });
      collar.position.y = 0.48 + r * 0.62;
      tg.add(collar);
    }
    return tg;
  };

  const leftWingTruss = buildLateralTruss('LeftWingTruss');
  const rightWingTruss = buildLateralTruss('RightWingTruss');
  leftWingTruss.position.set(-7.6, 0, -4.8);
  rightWingTruss.position.set(7.6, 0, -4.8);
  root.add(leftWingTruss, rightWingTruss);

  const fresnel = buildComplianceFresnelLamp(envMap);
  fresnel.group.position.set(-0.24, 1.72, 0.24);
  rightWingTruss.add(fresnel.group);

  // --------------------------------------------------------------------------
  // 5) Layer 2 Upstage Props (`z <= -6.2m`): Row-C Risers & VIP Jury Loges
  // --------------------------------------------------------------------------
  const rowC = buildRowCAcousticRisers(spec, envMap);
  rowC.group.position.set(-3.55, 0, 1.15);
  root.add(rowC.group);

  const vipJury = buildVipJuryLoges(envMap);
  vipJury.group.position.set(3.65, 0, 1.15);
  root.add(vipJury.group);

  // --------------------------------------------------------------------------
  // 6) Bespoke Stage-Specific 1966 Architecture & Unobstructed Hero Setpiece!
  // --------------------------------------------------------------------------
  const bespokeSet = buildBespokeStageArchitectureAndHero(stageId, envMap);
  root.add(bespokeSet.group);

  // --------------------------------------------------------------------------
  // 7) Framing Marquee Pillars + Sliding "ON THE AIR · IN LIVING COLOR" Crown
  //    + Animated Twin 1966 RCA TK-41 Color Pedestal Cameras (Live Tally Cuts!)
  // --------------------------------------------------------------------------
  const framingGroup = new THREE.Group();
  framingGroup.name = 'LivingColorMarqueeAndCameras';

  const chasingBulbGroups: THREE.MeshStandardMaterial[][] = [...bespokeSet.chasingBulbGroups];
  const innerMarqueePillars: THREE.Group[] = [];

  for (const side of [-1, 1] as const) {
    const innerPillar = createChasingMarqueePillar({
      height: 2.75,
      bulbCount: 8,
      bodyMat: stageId === 'STAGE_01_IBC_DAYTIME_FUNK' || stageId === 'STAGE_06_ATLANTIC_CITY_PIER' ? walnutMat : aluminumMat,
      trimMat: goldMat,
      boltMat: bluedMat,
      bulbHex: 0xffd56b,
      name: side < 0 ? 'InnerMarqueePillarL' : 'InnerMarqueePillarR',
    });
    innerPillar.group.position.set(side * 2.02, 0, -4.52);
    innerPillar.group.rotation.y = -side * 0.14;
    framingGroup.add(innerPillar.group);
    innerMarqueePillars.push(innerPillar.group);
    chasingBulbGroups.push(innerPillar.bulbMats);
  }

  // Clean telescopic satin-brass floor-bolted support struts terminating FLUSH into the bottom
  // of the marquee sign frame (NEVER poking out above the sign like antennas!)
  const marqueeStrutShoes: THREE.Group[] = [];
  for (const rx of [-0.84, 0.84]) {
    const railShoe = createFloorShoe(0.22, 0.22, 0.06, goldMat, bluedMat);
    railShoe.position.set(rx, 0, -4.52);
    framingGroup.add(railShoe);
    marqueeStrutShoes.push(railShoe);
  }

  const marqueeCrownGroup = new THREE.Group();
  marqueeCrownGroup.name = 'OnTheAirLivingColorCrown';
  marqueeCrownGroup.position.set(0, 1.92, -4.46);

  const signSupportLegs: THREE.Mesh[] = [];
  for (const rx of [-0.84, 0.84]) {
    const leg = createFilletedShaft({
      radius: 0.022,
      height: 1.0,
      anglageBevel: 0.004,
      radialSegments: 20,
      material: goldMat,
    });
    leg.scale.y = 1.66;
    leg.position.set(rx, -0.2 - 1.66, -0.06);
    marqueeCrownGroup.add(leg);
    signSupportLegs.push(leg);
  }

  const crownStarburstBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff8df,
    emissive: 0xffd56b,
    emissiveIntensity: 1.25,
    roughness: 0.12,
  });
  const crownStarburst = createMidCenturyStarburst({
    radius: 0.84,
    rays: 16,
    depth: 0.05,
    primaryMat: goldMat,
    accentMat: aluminumMat,
    bulbMat: crownStarburstBulbMat,
    name: 'CenterLivingColorStarburst',
  });
  crownStarburst.position.set(0, 0.04, -0.15);
  marqueeCrownGroup.add(crownStarburst);

  // Ultra-HD 1024x256 Milk-Glass Illuminated Marquee Sign (Deep Velvety NBC Crimson — ZERO pink washout!)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 1024;
  signCanvas.height = 256;
  const sctx = signCanvas.getContext('2d');
  if (sctx) {
    sctx.fillStyle = '#F7EEDB';
    sctx.fillRect(0, 0, 1024, 256);

    const bandGrad = sctx.createLinearGradient(0, 18, 0, 238);
    bandGrad.addColorStop(0.0, '#B81428');
    bandGrad.addColorStop(0.55, '#8F0C1E');
    bandGrad.addColorStop(1.0, '#640715');
    sctx.fillStyle = bandGrad;
    sctx.fillRect(18, 18, 988, 220);

    const stripeColors = ['#0096A6', '#22C55E', '#F4A91F', '#FF6738', '#E63B7A', '#1E56C5'];
    const segW = 948 / stripeColors.length;
    for (let i = 0; i < stripeColors.length; i++) {
      sctx.fillStyle = stripeColors[i];
      sctx.fillRect(38 + i * segW, 206, segW + 1, 14);
    }

    sctx.strokeStyle = '#F4A91F';
    sctx.lineWidth = 6;
    sctx.strokeRect(30, 30, 964, 196);

    sctx.fillStyle = '#FFF8E7';
    sctx.font = '900 50px "Jost", "Futura", "Century Gothic", "Trebuchet MS", Arial, sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.shadowColor = 'rgba(11, 29, 48, 0.72)';
    sctx.shadowBlur = 10;
    sctx.shadowOffsetY = 4;
    sctx.fillText(palette.signText, 512, 120);
  }
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  signTex.anisotropy = 16;

  const signFaceMat = new THREE.MeshStandardMaterial({
    map: signTex,
    emissiveMap: signTex,
    emissive: 0xffffff,
    emissiveIntensity: 0.56,
    roughness: 0.22,
  });

  const signFrame = createChamferedBox({
    width: 1.96,
    height: 0.44,
    depth: 0.12,
    cornerRadius: 0.08,
    material: goldMat,
  });
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(1.84, 0.34), signFaceMat);
  signFace.position.set(0, 0, 0.068);
  signFrame.add(signFace);

  const signBulbMats: THREE.MeshStandardMaterial[] = [];
  for (let b = 0; b < 7; b++) {
    const bx = -0.78 + b * 0.26;
    for (const by of [0.215, -0.215]) {
      const bm = new THREE.MeshStandardMaterial({
        color: 0xfff8e2,
        emissive: 0xffd56b,
        emissiveIntensity: 1.1,
        roughness: 0.12,
      });
      const orb = createTurnedOrb({
        radius: 0.025,
        radialSegments: 16,
        material: bm,
        castShadow: false,
        receiveShadow: false,
      });
      orb.position.set(bx, by, 0.064);
      signFrame.add(orb);
      signBulbMats.push(bm);
    }
  }
  chasingBulbGroups.push(signBulbMats);
  marqueeCrownGroup.add(signFrame);
  framingGroup.add(marqueeCrownGroup);

  // Twin Live-Sweeping 1966 RCA TK-41 Color Pedestal Cameras w/ Alternating ON-AIR Tally Cuts!
  const camBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x265c82,
    roughness: 0.24,
    metalness: 0.62,
    clearcoat: 0.78,
    envMap,
  });

  const camTurretHeads: THREE.Group[] = [];
  const camBaseYaw: number[] = [];
  const camTallyMats: THREE.MeshStandardMaterial[] = [];

  for (const side of [-1, 1] as const) {
    const tkCam = new THREE.Group();
    tkCam.position.set(side * 3.16, 0, -2.85);
    const baseYaw = -side * 0.54;
    tkCam.rotation.y = baseYaw;

    const dollyBase = createNotchedBezel({
      notchShape: 'HEX',
      outerRadius: 0.42,
      innerRadius: 0.12,
      thickness: 0.09,
      material: aluminumMat,
    });
    dollyBase.position.y = 0.045;
    const pedColumn = createFilletedShaft({
      radius: 0.11,
      height: 1.08,
      baseCollarFlare: 0.03,
      neckCollarFlare: 0.03,
      anglageBevel: 0.008,
      radialSegments: 32,
      material: aluminumMat,
    });
    pedColumn.position.y = 0.09;

    const steeringRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.022, 16, 36),
      goldMat,
    );
    steeringRing.rotation.x = Math.PI * 0.5;
    steeringRing.position.y = 0.96;

    // Articulated Pan-Tilt Camera Head Turret!
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.38, 0.04);

    const headHousing = createChamferedBox({
      width: 0.36,
      height: 0.42,
      depth: 0.68,
      cornerRadius: 0.09,
      material: camBodyMat,
    });
    const sideBadge = createChamferedBox({
      width: 0.38,
      height: 0.12,
      depth: 0.46,
      cornerRadius: 0.04,
      material: goldMat,
    });
    sideBadge.position.z = -0.02;

    const turretDisc = createFilletedShaft({
      radius: 0.15,
      height: 0.06,
      anglageBevel: 0.006,
      radialSegments: 32,
      centered: true,
      material: aluminumMat,
    });
    turretDisc.rotation.x = Math.PI * 0.5;
    turretDisc.position.set(0, -0.02, 0.36);

    const primeLens = createFilletedShaft({
      radius: 0.065,
      height: 0.22,
      anglageBevel: 0.006,
      radialSegments: 28,
      centered: true,
      material: bluedMat,
    });
    primeLens.rotation.x = Math.PI * 0.5;
    primeLens.position.set(0, 0.02, 0.46);

    const tallyMat = new THREE.MeshStandardMaterial({
      color: 0xff2840,
      emissive: 0xff1e38,
      emissiveIntensity: side < 0 ? 2.15 : 0.35,
      roughness: 0.14,
    });
    const tallyLamp = createTurnedOrb({
      radius: 0.048,
      material: tallyMat,
      castShadow: false,
    });
    tallyLamp.position.set(0, 0.25, 0.24);

    headPivot.add(headHousing, sideBadge, turretDisc, primeLens, tallyLamp);
    tkCam.add(dollyBase, pedColumn, steeringRing, headPivot);
    framingGroup.add(tkCam);

    camTurretHeads.push(headPivot);
    camBaseYaw.push(0);
    camTallyMats.push(tallyMat);
  }

  root.add(framingGroup);

  // --------------------------------------------------------------------------
  // 8) Soft Additive Sweeping Overhead Volumetric Studio Spotlight Cones
  // --------------------------------------------------------------------------
  const volCones: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    baseOpacity: number;
    baseRotZ: number;
    phase: number;
  }> = [];
  const coneSpecs: ReadonlyArray<{
    pos: [number, number, number];
    rot: [number, number, number];
    topR: number;
    botR: number;
    h: number;
    hex: number;
    opacity: number;
  }> = [
    { pos: [0, 3.6, -0.4], rot: [0.06, 0, 0], topR: 0.45, botR: 3.1, h: 7.4, hex: palette.spotTintHex, opacity: 0.068 },
    { pos: [-2.6, 3.8, -2.8], rot: [0.08, 0, -0.22], topR: 0.35, botR: 2.35, h: 7.6, hex: palette.coolPoolHex, opacity: 0.058 },
    { pos: [2.6, 3.8, -2.8], rot: [0.08, 0, 0.22], topR: 0.35, botR: 2.35, h: 7.6, hex: palette.warmPoolHex, opacity: 0.058 },
  ];

  for (let i = 0; i < coneSpecs.length; i++) {
    const cs = coneSpecs[i];
    const cone = createVolumetricLightCone({
      topRadius: cs.topR,
      bottomRadius: cs.botR,
      height: cs.h,
      colorHex: cs.hex,
      opacity: cs.opacity,
      name: `OverheadStudioSpotCone_${i}`,
    });
    cone.mesh.position.set(...cs.pos);
    cone.mesh.rotation.set(...cs.rot);
    root.add(cone.mesh);
    volCones.push({
      mesh: cone.mesh,
      mat: cone.material,
      baseOpacity: cs.opacity,
      baseRotZ: cs.rot[2],
      phase: i * 1.9,
    });
  }

  // --------------------------------------------------------------------------
  // 9) 3 Live Booth Coup Regime Architectural Overlays (`z = -9.5m .. -12.5m`)
  // --------------------------------------------------------------------------
  const rozGroup = new THREE.Group();
  rozGroup.name = 'CoupRegimeA_RozPharma';
  rozGroup.visible = false;
  for (const sx of [-4.6, 4.6]) {
    const shoe = createFloorShoe(0.48, 0.48, 0.1, goldMat, bluedMat);
    shoe.position.set(sx, 0, -9.8);
    const post = createFilletedShaft({
      radius: 0.08,
      height: 3.1,
      anglageBevel: 0.008,
      radialSegments: 32,
      material: goldMat,
    });
    post.position.set(sx, 0.1, -9.8);
    rozGroup.add(shoe, post);
  }
  const rozCanopyBar = createChamferedBox({
    width: 9.6,
    height: 0.22,
    depth: 0.22,
    cornerRadius: 0.06,
    material: goldMat,
  });
  rozCanopyBar.position.set(0, 3.15, -9.8);
  rozGroup.add(rozCanopyBar);

  const rozBulbMats: THREE.MeshStandardMaterial[] = [];
  for (let b = 0; b < 16; b++) {
    const hex = b % 2 === 0 ? 0xe63b7a : 0xffc233;
    const bMat = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: 0.45,
      roughness: 0.15,
    });
    const bulb = createTurnedOrb({ radius: 0.095, material: bMat, castShadow: false });
    bulb.position.set((b - 7.5) * 0.58, 3.0, -9.68);
    rozGroup.add(bulb);
    rozBulbMats.push(bMat);
  }
  root.add(rozGroup);

  const bellamyGroup = new THREE.Group();
  bellamyGroup.name = 'CoupRegimeB_BellamyUHF';
  bellamyGroup.visible = false;
  const bellamySpot = createVolumetricLightCone({
    topRadius: 0.35,
    bottomRadius: 2.45,
    height: 5.8,
    colorHex: 0xb388ff,
    opacity: 0.12,
  });
  bellamySpot.mesh.position.set(0, 2.9, -0.4);
  bellamyGroup.add(bellamySpot.mesh);

  const uhfScanBars: THREE.Mesh[] = [];
  const uhfBarMat = new THREE.MeshStandardMaterial({
    color: 0x9d6bff,
    emissive: 0x7c4dff,
    emissiveIntensity: 1.45,
    transparent: true,
    opacity: 0.65,
  });
  for (let s = 0; s < 5; s++) {
    const bar = createChamferedBox({
      width: 11.5,
      height: 0.055,
      depth: 0.06,
      material: uhfBarMat,
      castShadow: false,
    });
    bar.position.set(0, 0.65 + s * 0.58, -11.4);
    bellamyGroup.add(bar);
    uhfScanBars.push(bar);
  }
  root.add(bellamyGroup);

  const veraGroup = new THREE.Group();
  veraGroup.name = 'CoupRegimeC_VeraForensic';
  veraGroup.visible = false;
  const worklight4000KMat = new THREE.MeshStandardMaterial({
    color: 0xfff8eb,
    emissive: 0xfff3d6,
    emissiveIntensity: 1.75,
    roughness: 0.15,
  });
  const veraGears: THREE.Group[] = [];
  for (const vx of [-2.45, 2.45]) {
    const shoe = createFloorShoe(0.5, 0.5, 0.1, aluminumMat, bluedMat);
    shoe.position.set(vx, 0, -9.4);
    const mast = createFilletedShaft({
      radius: 0.065,
      height: 2.85,
      anglageBevel: 0.008,
      radialSegments: 32,
      material: aluminumMat,
    });
    mast.position.set(vx, 0.1, -9.4);
    const bulb = createTurnedOrb({
      radius: 0.14,
      heightScale: 1.25,
      material: worklight4000KMat,
      castShadow: false,
    });
    bulb.position.set(vx, 2.55, -9.15);
    const guardRing = createNotchedBezel({
      notchShape: 'HEX',
      outerRadius: 0.22,
      innerRadius: 0.17,
      thickness: 0.05,
      material: goldMat,
    });
    guardRing.position.set(vx, 2.55, -9.15);
    const gear = createInvoluteGear({
      pitchRadius: 0.58,
      teeth: 22,
      thickness: 0.075,
      spokes: 5,
    });
    gear.position.set(vx * 0.88, 1.55, -9.22);
    veraGears.push(gear);
    veraGroup.add(shoe, mast, bulb, guardRing, gear);
  }
  root.add(veraGroup);

  // --------------------------------------------------------------------------
  // 10) Live State & Animation Envelope Controllers
  // --------------------------------------------------------------------------
  let activeRegime: CoupRegimeIdV7 = 'NONE';
  let apertureDimFactor = 1.0;
  let rowCGlintActive = false;

  let fresnelTimerSec = -1;
  let fresnelPeakHdr = 3.0;
  let baseCycEmissive = 0.56;
  let baseCoveEmissive = 1.15;

  const applyDimmingToBackdrop = () => {
    cycMat.emissiveIntensity = baseCycEmissive * apertureDimFactor;
    coveBarMat.emissiveIntensity = baseCoveEmissive * apertureDimFactor;
    floorRingGlowMat.emissiveIntensity = 1.05 * apertureDimFactor;
    signFaceMat.emissiveIntensity = 0.56 * Math.max(0.45, apertureDimFactor);
    for (let i = 0; i < bespokeSet.dimmableAcryliteMats.length; i++) {
      bespokeSet.dimmableAcryliteMats[i].emissiveIntensity = 0.82 * apertureDimFactor;
    }
    poolMatWarm.opacity = 0.36 * apertureDimFactor;
    poolMatCoolL.opacity = 0.32 * apertureDimFactor;
    poolMatWarmR.opacity = 0.28 * apertureDimFactor;
    for (let i = 0; i < volCones.length; i++) {
      volCones[i].mat.opacity = volCones[i].baseOpacity * apertureDimFactor;
    }
  };

  return {
    stageId,
    spec,
    root,

    triggerFresnelTell(isRubySpite = false): void {
      const tellHex = isRubySpite ? 0xff1744 : 0xffb84d;
      fresnel.filamentMat.emissive.setHex(tellHex);
      fresnel.lensMat.emissive.setHex(tellHex);
      fresnelPeakHdr = 3.0;
      fresnelTimerSec = 0;
    },

    triggerRowCGlint(active: boolean): void {
      rowCGlintActive = active;
      rowC.glintGroup.visible = active;
      if (!active) {
        rowC.programMat.emissiveIntensity = 0.14;
        rowC.glintFlareMat.emissiveIntensity = 0.0;
        rowC.glintFlareMat.opacity = 0.0;
      } else {
        rowC.programMat.emissiveIntensity = 2.6;
        rowC.glintFlareMat.emissiveIntensity = 3.0;
        rowC.glintFlareMat.opacity = 0.92;
      }
    },

    getRowCColliderMesh(): THREE.Mesh {
      return rowC.colliderMesh;
    },

    setVipJuryState(boonActive: boolean, baneActive: boolean): void {
      vipJury.boonMat.emissiveIntensity = boonActive ? 2.15 : 0.34;
      vipJury.baneMat.emissiveIntensity = baneActive ? 2.15 : 0.34;
    },

    setCoupRegime(regime: CoupRegimeIdV7): void {
      activeRegime = regime;
      rozGroup.visible = regime === 'REGIME_A_ROZ_PHARMA';
      bellamyGroup.visible = regime === 'REGIME_B_BELLAMY_UHF';
      veraGroup.visible = regime === 'REGIME_C_VERA_FORENSIC';

      if (regime === 'REGIME_A_ROZ_PHARMA') {
        cycMat.color.setHex(0x66f0ff);
        cycMat.emissive.setHex(0x00e5ff);
        coveBarMat.color.setHex(0x00e5ff);
        coveBarMat.emissive.setHex(0x00e5ff);
        baseCycEmissive = 0.62;
        baseCoveEmissive = 1.35;
      } else if (regime === 'REGIME_B_BELLAMY_UHF') {
        cycMat.color.setHex(0x9a7eff);
        cycMat.emissive.setHex(0x6540b8);
        coveBarMat.color.setHex(0x7c4dff);
        coveBarMat.emissive.setHex(0x7c4dff);
        baseCycEmissive = 0.48;
        baseCoveEmissive = 1.2;
      } else if (regime === 'REGIME_C_VERA_FORENSIC') {
        cycMat.color.setHex(0xc4d0dc);
        cycMat.emissive.setHex(0xffeacc);
        coveBarMat.color.setHex(0xfff1d6);
        coveBarMat.emissive.setHex(0xfff1d6);
        baseCycEmissive = 0.44;
        baseCoveEmissive = 1.15;
      } else {
        cycMat.color.setHex(0xffffff);
        cycMat.emissive.setHex(0xffffff);
        coveBarMat.color.setHex(spec.coveLightHex);
        coveBarMat.emissive.setHex(spec.coveLightHex);
        baseCycEmissive = 0.56;
        baseCoveEmissive = 1.15;
      }
      applyDimmingToBackdrop();
    },

    getActiveCoupRegime(): CoupRegimeIdV7 {
      return activeRegime;
    },

    setApertureDimFactor(factor: number): void {
      apertureDimFactor = Math.max(0.2, Math.min(1.0, factor));
      applyDimmingToBackdrop();
    },

    setWingSpanX(halfSpanMeters: number, wingZ = -4.8): void {
      const clampedX = Math.max(2.95, Math.min(11.5, halfSpanMeters));
      leftWingTruss.position.set(-clampedX, 0, wingZ);
      rightWingTruss.position.set(clampedX, 0, wingZ);
    },

    setMarqueeCrownY(yMeters: number): void {
      const clampedY = THREE.MathUtils.clamp(yMeters, 1.32, 2.52);
      marqueeCrownGroup.position.y = clampedY;
      // Telescope the twin bottom stanchions cleanly down to the y = 0.06m floor shoes!
      const sScale = Math.max(0.5, marqueeCrownGroup.scale.y || 1);
      const legLen = Math.max(0.4, (clampedY - 0.06) / sScale - 0.2);
      for (let i = 0; i < signSupportLegs.length; i++) {
        signSupportLegs[i].scale.y = legLen;
        signSupportLegs[i].position.y = -0.2 - legLen;
      }
    },

    setPortraitFraming(isPortrait: boolean): void {
      const innerX = isPortrait ? 1.66 : 2.08;
      innerMarqueePillars[0].position.x = -innerX;
      innerMarqueePillars[1].position.x = innerX;
      const crownScale = isPortrait ? 0.94 : 1.04;
      marqueeCrownGroup.scale.setScalar(crownScale);
      const shoeX = 0.84 * crownScale;
      marqueeStrutShoes[0].position.x = -shoeX;
      marqueeStrutShoes[1].position.x = shoeX;
    },

    update(dtSec: number, elapsedSec: number): void {
      bespokeSet.update(dtSec, elapsedSec);

      // Gentle 1966 Starburst glisten & smooth 4-circuit `#11` incandescent marquee bulb chase
      crownStarburst.rotation.z = elapsedSec * 0.14;
      const chasePhase = elapsedSec * 4.5;
      for (let g = 0; g < chasingBulbGroups.length; g++) {
        const bulbs = chasingBulbGroups[g];
        for (let b = 0; b < bulbs.length; b++) {
          const wave = 0.5 + 0.5 * Math.sin(chasePhase - b * 0.95 + g * 0.6);
          bulbs[b].emissiveIntensity = (0.44 + wave * 1.15) * Math.max(0.45, apertureDimFactor);
        }
      }

      // Live 1966 Broadcast Pedestal Camera Sweep + Alternating Crimson ON-AIR Tally Cuts!
      const liveCamIdx = Math.floor(elapsedSec / 6.5) % 2;
      for (let c = 0; c < camTurretHeads.length; c++) {
        const sweep = Math.sin(elapsedSec * 0.36 + c * 2.1) * 0.14;
        const nod = Math.cos(elapsedSec * 0.28 + c * 1.4) * 0.04;
        camTurretHeads[c].rotation.y = camBaseYaw[c] + sweep;
        camTurretHeads[c].rotation.x = 0.08 + nod;
        const targetTally = c === liveCamIdx ? 2.25 : 0.32;
        camTallyMats[c].emissiveIntensity +=
          (targetTally - camTallyMats[c].emissiveIntensity) * Math.min(1, dtSec * 8);
      }

      // Gentle overhead volumetric studio spot cone drift
      for (let i = 0; i < volCones.length; i++) {
        const vc = volCones[i];
        vc.mesh.rotation.z = vc.baseRotZ + Math.sin(elapsedSec * 0.32 + vc.phase) * 0.045;
      }

      // 1. Fresnel Lamp 8ms snap / 110ms decay HDR 3.0 pulse (100% exempt from card dimming!)
      if (fresnelTimerSec >= 0) {
        fresnelTimerSec += dtSec;
        let env = 0;
        if (fresnelTimerSec <= 0.008) {
          env = fresnelTimerSec / 0.008;
        } else if (fresnelTimerSec <= 0.118) {
          const decayT = (fresnelTimerSec - 0.008) / 0.11;
          env = Math.exp(-decayT * 3.4);
        } else {
          fresnelTimerSec = -1;
          env = 0;
        }
        const hdr = 0.24 + env * (fresnelPeakHdr - 0.24);
        fresnel.filamentMat.emissiveIntensity = hdr;
        fresnel.lensMat.emissiveIntensity = hdr * 0.92;
      }

      // 2. Row-C Rolled-Program Glint HDR shimmer (100% exempt from card dimming!)
      if (rowCGlintActive) {
        const twinkle = 2.65 + Math.sin(elapsedSec * 14.0) * 0.45;
        rowC.programMat.emissiveIntensity = twinkle * 0.85;
        rowC.glintFlareMat.emissiveIntensity = twinkle;
        rowC.glintGroup.rotation.z = elapsedSec * 1.8;
      }

      // 3. Active Coup Regime Animations
      if (activeRegime === 'REGIME_A_ROZ_PHARMA') {
        const phase = Math.floor(elapsedSec * 6.0);
        for (let i = 0; i < rozBulbMats.length; i++) {
          const on = ((i + phase) & 1) === 0;
          rozBulbMats[i].emissiveIntensity = (on ? 2.25 : 0.24) * apertureDimFactor;
        }
      } else if (activeRegime === 'REGIME_B_BELLAMY_UHF') {
        for (let i = 0; i < uhfScanBars.length; i++) {
          const scroll = ((elapsedSec * 0.65 + i * 0.2) % 1.0) * 2.8;
          uhfScanBars[i].position.y = 0.45 + scroll;
        }
      } else if (activeRegime === 'REGIME_C_VERA_FORENSIC') {
        for (let i = 0; i < veraGears.length; i++) {
          veraGears[i].rotation.z = elapsedSec * (i % 2 === 0 ? 0.55 : -0.55);
        }
      }
    },

    dispose(): void {
      disposeObject3DTree(root);
    },
  };
}
