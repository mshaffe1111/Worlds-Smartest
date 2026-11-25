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
  createContactShadowDisc,
  createCurvedParabolicCove,
  createFilletedShaft,
  createGrandFeuEnamelMaterial,
  createInvoluteGear,
  createMidCenturyBoomerangPylon,
  createMidCenturyStarburst,
  createNotchedBezel,
  createObsidianMaterial,
  createSmoothBeveledRing,
  createTungstenBulbHaloSprite,
  createTurnedOrb,
  createVolumetricLightCone,
  createWalnutMaterial,
  disposeObject3DTree,
  getBrushedAnodizedTexture,
  getTungstenBulbHaloTexture,
} from './HorologicalCAD';

// ----------------------------------------------------------------------------
// 1. Canonical 1966 Living Color Specs for All 10 Soundstages
// ----------------------------------------------------------------------------

export const STAGE_WORLD_SPECS_V7: Record<StageWorldIdV7, StageWorldSpecV7> = {
  STAGE_01_IBC_DAYTIME_FUNK: {
    stageId: 'STAGE_01_IBC_DAYTIME_FUNK',
    code: 'STG-01',
    name: '30 Rock Studio 6A — 1966 Living Color',
    eraLabel: '1966 IBC Living Color',
    subtitle: 'Starburst Acrylite Fan Pavilion, Sunlit Walnut Slats & Chasing Marquee',
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
    name: 'IBC Television City — Primetime Jubilee',
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
    signText: 'IBC STUDIO 6A · IN LIVING COLOR',
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
    signText: 'IBC JUBILEE · IN LIVING COLOR',
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
    acrylite: [0x00d2e6, 0xff7838, 0xffd147],
    cycZenith: '#03152c',
    cycMid: '#073660',
    cycHorizon: '#0c6b94',
    ringGlowHex: 0x18dcf0,
    warmPoolHex: 0xffbe5c,
    coolPoolHex: 0x00dcf0,
    spotTintHex: 0xdff8ff,
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
    cycZenith: '#040a1c',
    cycMid: '#0b1b42',
    cycHorizon: '#162d63',
    ringGlowHex: 0xffcf54,
    warmPoolHex: 0xffd166,
    coolPoolHex: 0x2cb4dc,
    spotTintHex: 0xffe6b0,
    signText: 'IBC PENTHOUSE 38 · LIVING COLOR',
  },
};

const SHORT_STAGE_ID_ALIASES_V7: Readonly<Record<string, StageWorldIdV7>> = {
  STAGE_01: 'STAGE_01_IBC_DAYTIME_FUNK',
  STAGE_1: 'STAGE_01_IBC_DAYTIME_FUNK',
  'STG-01': 'STAGE_01_IBC_DAYTIME_FUNK',
  STAGE_02: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
  STAGE_2: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
  'STG-02': 'STAGE_02_IBC_PRIMETIME_JUBILEE',
  STAGE_03: 'STAGE_03_1926_VAUDEVILLE_PIT',
  STAGE_3: 'STAGE_03_1926_VAUDEVILLE_PIT',
  'STG-03': 'STAGE_03_1926_VAUDEVILLE_PIT',
  STAGE_04: 'STAGE_04_1958_ISOLATION_VAULT',
  STAGE_4: 'STAGE_04_1958_ISOLATION_VAULT',
  'STG-04': 'STAGE_04_1958_ISOLATION_VAULT',
  STAGE_05: 'STAGE_05_1984_LARSON_CRT_LAB',
  STAGE_5: 'STAGE_05_1984_LARSON_CRT_LAB',
  'STG-05': 'STAGE_05_1984_LARSON_CRT_LAB',
  STAGE_06: 'STAGE_06_ATLANTIC_CITY_PIER',
  STAGE_6: 'STAGE_06_ATLANTIC_CITY_PIER',
  'STG-06': 'STAGE_06_ATLANTIC_CITY_PIER',
  STAGE_07: 'STAGE_07_1969_MONTE_CARLO_CASINO',
  STAGE_7: 'STAGE_07_1969_MONTE_CARLO_CASINO',
  'STG-07': 'STAGE_07_1969_MONTE_CARLO_CASINO',
  STAGE_08: 'STAGE_08_WORLDS_FAIR_GEODESIC',
  STAGE_8: 'STAGE_08_WORLDS_FAIR_GEODESIC',
  'STG-08': 'STAGE_08_WORLDS_FAIR_GEODESIC',
  STAGE_09: 'STAGE_09_CHANNEL_83_UHF_BARGE',
  STAGE_9: 'STAGE_09_CHANNEL_83_UHF_BARGE',
  'STG-09': 'STAGE_09_CHANNEL_83_UHF_BARGE',
  STAGE_10: 'STAGE_10_SOVEREIGN_SANCTUM',
  'STG-10': 'STAGE_10_SOVEREIGN_SANCTUM',
};

// Register non-enumerable short stage aliases (`STAGE_01`..`STAGE_10`) so direct lookups
// (`STAGE_WORLD_SPECS_V7[raw]`) never return `undefined` while keeping `Object.keys()` === 10!
for (const [alias, canonical] of Object.entries(SHORT_STAGE_ID_ALIASES_V7)) {
  if (!(alias in STAGE_WORLD_SPECS_V7)) {
    Object.defineProperty(STAGE_WORLD_SPECS_V7, alias, {
      value: STAGE_WORLD_SPECS_V7[canonical],
      enumerable: false,
      configurable: true,
    });
  }
  if (!(alias in STAGE_FLOOR_MAP_V7)) {
    Object.defineProperty(STAGE_FLOOR_MAP_V7, alias, {
      value: STAGE_FLOOR_MAP_V7[canonical],
      enumerable: false,
      configurable: true,
    });
  }
  if (!(alias in STAGE_LIVING_COLOR_PALETTES)) {
    Object.defineProperty(STAGE_LIVING_COLOR_PALETTES, alias, {
      value: STAGE_LIVING_COLOR_PALETTES[canonical],
      enumerable: false,
      configurable: true,
    });
  }
}

export function resolveStageWorldIdV7(raw: string | StageWorldIdV7 | null | undefined): StageWorldIdV7 {
  if (!raw) return 'STAGE_01_IBC_DAYTIME_FUNK';
  const trimmed = String(raw).trim().toUpperCase();
  if (Object.prototype.hasOwnProperty.call(STAGE_WORLD_SPECS_V7, trimmed)) {
    const spec = (STAGE_WORLD_SPECS_V7 as Record<string, StageWorldSpecV7 | undefined>)[trimmed];
    if (spec) return spec.stageId;
  }
  const byAlias = SHORT_STAGE_ID_ALIASES_V7[trimmed];
  if (byAlias) return byAlias;
  const canonicalKeys = Object.keys(STAGE_WORLD_SPECS_V7) as StageWorldIdV7[];
  const byPrefix = canonicalKeys.find((k) => k.startsWith(trimmed));
  return byPrefix ?? 'STAGE_01_IBC_DAYTIME_FUNK';
}

/**
 * Merges static non-instanced `THREE.Mesh` descendants inside `container` that share the exact
 * same `(material, castShadow, receiveShadow)` tuple into a single `THREE.BufferGeometry` per
 * material in `container`'s local coordinate frame, slashing draw calls by 4x–8x with zero visual change!
 */
function compactStaticMeshesInGroup(
  container: THREE.Object3D,
  skipSubtrees?: ReadonlySet<THREE.Object3D>,
): void {
  container.updateWorldMatrix(true, true);
  const invContainer = new THREE.Matrix4().copy(container.matrixWorld).invert();
  const relMat = new THREE.Matrix4();

  interface Bucket {
    mat: THREE.Material;
    castShadow: boolean;
    receiveShadow: boolean;
    geoms: THREE.BufferGeometry[];
    meshes: THREE.Mesh[];
  }
  const buckets = new Map<string, Bucket>();
  const matIds = new Map<THREE.Material, number>();
  let nextMatId = 1;

  const walk = (node: THREE.Object3D): void => {
    if (skipSubtrees?.has(node)) return;
    if (!node.visible) return;
    if ((node as THREE.Sprite).isSprite) return;

    const mesh = node as THREE.Mesh;
    if (
      mesh.isMesh &&
      !(mesh as unknown as { isInstancedMesh?: boolean }).isInstancedMesh &&
      !Array.isArray(mesh.material) &&
      mesh.geometry &&
      mesh.geometry.getAttribute('position') &&
      !mesh.userData?.interactiveKind
    ) {
      const mat = mesh.material;
      let mId = matIds.get(mat);
      if (!mId) {
        mId = nextMatId++;
        matIds.set(mat, mId);
      }
      const key = `${mId}_${mesh.castShadow ? 1 : 0}_${mesh.receiveShadow ? 1 : 0}`;
      let b = buckets.get(key);
      if (!b) {
        b = {
          mat,
          castShadow: mesh.castShadow,
          receiveShadow: mesh.receiveShadow,
          geoms: [],
          meshes: [],
        };
        buckets.set(key, b);
      }
      relMat.multiplyMatrices(invContainer, mesh.matrixWorld);
      const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      g.applyMatrix4(relMat);
      b.geoms.push(g);
      if (mesh.children.length === 0) {
        b.meshes.push(mesh);
        return;
      }
      // If a Mesh has child objects, detach/reparent its children onto `container` in world-preserved space, or walk children!
      b.geoms.pop();
      g.dispose();
    }

    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i]);
    }
  };

  for (let i = 0; i < container.children.length; i++) {
    walk(container.children[i]);
  }

  for (const b of buckets.values()) {
    if (b.geoms.length < 2) {
      for (const g of b.geoms) g.dispose();
      continue;
    }
    let totalVerts = 0;
    for (const g of b.geoms) {
      totalVerts += g.getAttribute('position').count;
    }
    const pos = new Float32Array(totalVerts * 3);
    const norm = new Float32Array(totalVerts * 3);
    const uv = new Float32Array(totalVerts * 2);
    let vOff = 0;
    for (const g of b.geoms) {
      const pAttr = g.getAttribute('position') as THREE.BufferAttribute;
      const nAttr = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
      const uAttr = g.getAttribute('uv') as THREE.BufferAttribute | undefined;
      pos.set(pAttr.array as ArrayLike<number>, vOff * 3);
      if (nAttr && nAttr.itemSize === 3) {
        norm.set(nAttr.array as ArrayLike<number>, vOff * 3);
      }
      if (uAttr && uAttr.itemSize === 2) {
        uv.set(uAttr.array as ArrayLike<number>, vOff * 2);
      }
      vOff += pAttr.count;
      g.dispose();
    }
    for (const m of b.meshes) {
      m.geometry.dispose();
      m.removeFromParent();
    }
    const mergedGeom = new THREE.BufferGeometry();
    mergedGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    mergedGeom.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
    mergedGeom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    mergedGeom.computeBoundingSphere();

    const mergedMesh = new THREE.Mesh(mergedGeom, b.mat);
    mergedMesh.castShadow = b.castShadow;
    mergedMesh.receiveShadow = b.receiveShadow;
    container.add(mergedMesh);
  }
}

// ----------------------------------------------------------------------------
// 2. Built Stage Handle & Sub-Component Contracts
// ----------------------------------------------------------------------------

export interface BuiltStageWorldV7 {
  readonly stageId: StageWorldIdV7;
  readonly spec: StageWorldSpecV7;
  readonly root: THREE.Group;
  triggerFresnelTell(isRubySpite?: boolean): void;
  triggerRowCGlint(active: boolean): void;
  triggerApplauseSign?(durationSec?: number): void;
  getRowCColliderMesh(): THREE.Mesh;
  setVipJuryState(boonActive: boolean, baneActive: boolean): void;
  setCoupRegime(regime: CoupRegimeIdV7): void;
  getActiveCoupRegime(): CoupRegimeIdV7;
  setApertureDimFactor(factor: number): void;
  setWingSpanX(halfSpanMeters: number, wingZ?: number): void;
  setMarqueeCrownY?(yMeters: number): void;
  setPortraitFraming?(isPortrait: boolean, aspect?: number): void;
  update(dtSec: number, elapsedSec: number): void;
  dispose(): void;
}

// Helper: floor-bolted sculpted satin-brass mounting shoe resting flush on y = 0.00m + Contact AO
function createFloorShoe(
  width: number,
  depth: number,
  height: number,
  metalMat: THREE.Material,
  boltMat: THREE.Material,
): THREE.Group {
  const g = new THREE.Group();
  g.add(
    createContactShadowDisc({
      radiusX: width * 0.86,
      radiusZ: depth * 0.86,
      opacity: 0.54,
      yOffset: 0.004,
      name: 'FloorShoeContactAO',
    }),
  );
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

// Procedural 1024x512 Radiant 1966 Living Color Broadcast Cyclorama Vista Texture
function createCycloramaGradientTexture(
  stageId: StageWorldIdV7,
  palette: StagePaletteTriad,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const isNightVista =
      stageId === 'STAGE_06_ATLANTIC_CITY_PIER' ||
      stageId === 'STAGE_10_SOVEREIGN_SANCTUM' ||
      stageId === 'STAGE_07_1969_MONTE_CARLO_CASINO' ||
      stageId === 'STAGE_08_WORLDS_FAIR_GEODESIC' ||
      stageId === 'STAGE_09_CHANNEL_83_UHF_BARGE';

    const vGrad = ctx.createLinearGradient(0, 0, 0, 512);
    vGrad.addColorStop(0.0, palette.cycZenith);
    vGrad.addColorStop(0.42, palette.cycMid);
    vGrad.addColorStop(0.82, palette.cycHorizon);
    vGrad.addColorStop(1.0, isNightVista ? palette.cycMid : '#ffd88a');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Stage-distinct theatrical backdrop vistas right in the camera-visible y = 260..512 horizon band!
    if (stageId === 'STAGE_10_SOVEREIGN_SANCTUM') {
      // Unmistakable 1966 Midnight Manhattan 38th-Floor Skyline Panorama (Empire State, Chrysler, Park Ave!)
      const stars = 95;
      ctx.fillStyle = 'rgba(255, 246, 210, 0.55)';
      for (let s = 0; s < stars; s++) {
        ctx.fillRect((s * 137) % 1024, (s * 61) % 250, 2, 2);
      }
      const heights = [
        195, 255, 215, 310, 240, 355, 275, 230, 335, 265, 205, 295,
        365, 250, 315, 235, 285, 340, 225, 290, 245, 320, 210, 260,
      ];
      const bw = 1024 / heights.length;
      for (let i = 0; i < heights.length; i++) {
        const bh = heights[i];
        const bx = i * bw + 2;
        const by = 512 - bh;
        ctx.fillStyle = i % 2 === 0 ? '#070E24' : '#0B1636';
        ctx.fillRect(bx, by, bw - 3, bh);
        // Art-Deco setback crown & Empire spire accents
        if (bh >= 330) {
          ctx.fillRect(bx + 6, by - 26, bw - 15, 26);
          ctx.fillStyle = '#FFD56B';
          ctx.fillRect(bx + bw * 0.5 - 2, by - 58, 4, 32);
        }
        //Crisp glittering golden 1966 office window grid
        ctx.fillStyle = '#FFE082';
        for (let wy = by + 10; wy < 502; wy += 12) {
          for (let wx = bx + 5; wx < bx + bw - 8; wx += 8) {
            if (((i * 11 + wy * 3 + wx) % 5) !== 0) {
              ctx.fillRect(wx, wy, 4, 6);
            }
          }
        }
      }
    } else if (stageId === 'STAGE_08_WORLDS_FAIR_GEODESIC') {
      ctx.fillStyle = 'rgba(220, 248, 255, 0.52)';
      for (let s = 0; s < 90; s++) {
        ctx.fillRect((s * 113) % 1024, (s * 53) % 260, 2.5, 2.5);
      }
      ctx.strokeStyle = 'rgba(140, 232, 255, 0.42)';
      ctx.lineWidth = 4;
      for (const r of [160, 240, 330, 420]) {
        ctx.beginPath();
        ctx.arc(512, 490, r, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
    } else if (stageId === 'STAGE_06_ATLANTIC_CITY_PIER') {
      // Unmistakable 1965 Atlantic City Night Ocean Horizon + Illuminated Steel Pier Boardwalk & Surf!
      // Deep Atlantic ocean water plane across y = 315..512
      const seaGrad = ctx.createLinearGradient(0, 315, 0, 512);
      seaGrad.addColorStop(0.0, '#043B5C');
      seaGrad.addColorStop(0.45, '#065A82');
      seaGrad.addColorStop(1.0, '#032942');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(0, 315, 1024, 197);

      // Moonlit turquoise & gold ocean wave rollers
      for (let wy = 326; wy < 506; wy += 11) {
        ctx.strokeStyle = wy % 22 === 0 ? 'rgba(255, 230, 150, 0.52)' : 'rgba(64, 232, 248, 0.44)';
        ctx.lineWidth = wy % 22 === 0 ? 3.5 : 2.5;
        ctx.beginPath();
        for (let wx = 0; wx <= 1024; wx += 24) {
          const yOff = wy + Math.sin(wx * 0.03 + wy * 0.2) * 3.5;
          if (wx === 0) ctx.moveTo(wx, yOff);
          else ctx.lineTo(wx, yOff);
        }
        ctx.stroke();
      }

      // Silhouetted Atlantic City Boardwalk Pier trestle & warm carnival string bulbs along y = 300..332
      ctx.fillStyle = '#05182B';
      ctx.fillRect(0, 304, 1024, 16);
      for (let px = 16; px < 1024; px += 36) {
        ctx.fillRect(px, 318, 6, 36);
      }
      ctx.fillStyle = '#FFD56B';
      for (let lx = 18; lx < 1010; lx += 22) {
        ctx.beginPath();
        ctx.arc(lx, 296 + Math.sin(lx * 0.07) * 5, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (stageId === 'STAGE_07_1969_MONTE_CARLO_CASINO') {
      ctx.fillStyle = 'rgba(6, 18, 36, 0.58)';
      ctx.beginPath();
      ctx.moveTo(0, 512);
      ctx.lineTo(0, 305);
      ctx.quadraticCurveTo(260, 385, 512, 398);
      ctx.quadraticCurveTo(764, 380, 1024, 295);
      ctx.lineTo(1024, 512);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 230, 150, 0.72)';
      for (let k = 0; k < 85; k++) {
        const kx = ((k * 43) % 996) + 12;
        const ky = 335 + ((k * 29) % 135);
        ctx.fillRect(kx, ky, 5, 4);
      }
    } else if (stageId === 'STAGE_09_CHANNEL_83_UHF_BARGE') {
      ctx.strokeStyle = 'rgba(48, 232, 255, 0.34)';
      ctx.lineWidth = 3;
      for (const r of [120, 210, 300]) {
        ctx.beginPath();
        ctx.arc(512, 380, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let sy = 345; sy < 506; sy += 15) {
        ctx.strokeStyle = 'rgba(140, 244, 255, 0.38)';
        ctx.beginPath();
        for (let sx = 0; sx <= 1024; sx += 20) {
          const y = sy + Math.sin(sx * 0.04 + sy) * 5.5;
          if (sx === 0) ctx.moveTo(sx, y);
          else ctx.lineTo(sx, y);
        }
        ctx.stroke();
      }
    } else if (stageId === 'STAGE_05_1984_LARSON_CRT_LAB') {
      ctx.strokeStyle = 'rgba(110, 210, 255, 0.32)';
      ctx.lineWidth = 3;
      for (let a = 1; a <= 5; a++) {
        ctx.beginPath();
        ctx.ellipse(512, 360, a * 92, a * 42, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (stageId === 'STAGE_03_1926_VAUDEVILLE_PIT') {
      const cols = ['rgba(230,59,122,0.26)', 'rgba(244,169,31,0.26)', 'rgba(0,180,200,0.26)'];
      for (let d = 0; d < 16; d++) {
        ctx.fillStyle = cols[d % 3];
        const dx = 42 + d * 62;
        const dy = 260 + (d % 2) * 68;
        ctx.beginPath();
        ctx.moveTo(dx, dy - 42);
        ctx.lineTo(dx + 32, dy);
        ctx.lineTo(dx, dy + 42);
        ctx.lineTo(dx - 32, dy);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Theatrical 1966 IBC light-fan rays blooming upward from stage center
    ctx.save();
    ctx.translate(512, 476);
    const rayCount = stageId === 'STAGE_02_IBC_PRIMETIME_JUBILEE' ? 7 : 5;
    for (let i = -rayCount; i <= rayCount; i++) {
      ctx.save();
      ctx.rotate(i * (0.86 / rayCount));
      const rayGrad = ctx.createLinearGradient(0, 0, 0, -470);
      rayGrad.addColorStop(0.0, isNightVista ? 'rgba(120, 220, 255, 0.14)' : 'rgba(255, 240, 200, 0.24)');
      rayGrad.addColorStop(0.45, 'rgba(255, 232, 185, 0.06)');
      rayGrad.addColorStop(1.0, 'rgba(255, 232, 185, 0.0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-52, -470);
      ctx.lineTo(52, -470);
      ctx.lineTo(16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    if (!isNightVista) {
      const horizonGlow = ctx.createRadialGradient(512, 475, 32, 512, 475, 380);
      horizonGlow.addColorStop(0.0, 'rgba(255, 234, 178, 0.32)');
      horizonGlow.addColorStop(0.55, 'rgba(255, 215, 130, 0.1)');
      horizonGlow.addColorStop(1.0, 'rgba(255, 215, 130, 0.0)');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 140, 1024, 372);
    }
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

  // Stage-distinct upholstery & gallery architectural finishes (zero cloned pink Studio 6A bleachers!)
  const upholsteryByStage: Record<StageWorldIdV7, number> = {
    STAGE_01_IBC_DAYTIME_FUNK: 0xa81f48, // Studio 6A Carnaby Rose Velvet
    STAGE_02_IBC_PRIMETIME_JUBILEE: 0x5c2078, // Primetime Royal Plum Velvet
    STAGE_03_1926_VAUDEVILLE_PIT: 0xd94e1f, // Burbank Mod Tangerine Vinyl
    STAGE_04_1958_ISOLATION_VAULT: 0x0f5c6e, // Sealed Vault Teal Baffle
    STAGE_05_1984_LARSON_CRT_LAB: 0x1a4b8c, // Apollo Telemetry Cobalt
    STAGE_06_ATLANTIC_CITY_PIER: 0x008b99, // Atlantic City Seafoam Cabana
    STAGE_07_1969_MONTE_CARLO_CASINO: 0x0d6b4c, // Riviera Casino Emerald Velvet
    STAGE_08_WORLDS_FAIR_GEODESIC: 0x1864ab, // World's Fair Pavilion Cerulean
    STAGE_09_CHANNEL_83_UHF_BARGE: 0x264653, // Pirate Ship Gunmetal Canvas
    STAGE_10_SOVEREIGN_SANCTUM: 0x6b1028, // Penthouse 38 Imperial Burgundy Velvet
  };
  const velvetMat = new THREE.MeshStandardMaterial({
    color: upholsteryByStage[spec.stageId] ?? 0xa81f48,
    roughness: 0.62,
    metalness: 0.08,
    envMap,
    envMapIntensity: 0.65,
  });
  const useDarkExecutiveBase =
    spec.stageId === 'STAGE_10_SOVEREIGN_SANCTUM' ||
    spec.stageId === 'STAGE_05_1984_LARSON_CRT_LAB' ||
    spec.stageId === 'STAGE_08_WORLDS_FAIR_GEODESIC' ||
    spec.stageId === 'STAGE_09_CHANNEL_83_UHF_BARGE';
  const walnutMat = useDarkExecutiveBase
    ? createObsidianMaterial(envMap)
    : createWalnutMaterial(envMap);
  const brassMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);

  const tiers = [
    { z: -6.95, h: 0.52, d: 0.62 },
    { z: -7.58, h: 0.98, d: 0.64 },
    { z: -8.22, h: 1.44, d: 0.66 },
  ];

  const riserShadow = createContactShadowDisc({
    radiusX: 1.72,
    radiusZ: 1.28,
    opacity: 0.56,
    yOffset: 0.004,
    name: 'RowCRiserContactAO',
  });
  riserShadow.position.set(0, 0.004, -7.58);
  group.add(riserShadow);

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

    if (!noStudioGallery) {
      // 5 Sculpted Walnut & Velvet Theatre Seat Armrests framing the 4 audience seats!
      for (let a = 0; a < 5; a++) {
        const ax = -1.36 + a * 0.68;
        const armPost = createChamferedBox({
          width: 0.055,
          height: 0.18,
          depth: 0.32,
          cornerRadius: 0.018,
          material: walnutMat,
        });
        armPost.position.set(ax, tier.h + 0.14, tier.z + 0.02);
        const armPad = createChamferedBox({
          width: 0.072,
          height: 0.036,
          depth: 0.34,
          cornerRadius: 0.016,
          material: velvetMat,
        });
        armPad.position.set(ax, tier.h + 0.24, tier.z + 0.02);
        group.add(armPost, armPad);
      }
    }
  }

  // Twin Sloped 24K Brass Studio Audience Aisle Handrails + Warm Amber Step Courtesy Lights!
  const stepLampMat = new THREE.MeshStandardMaterial({
    color: 0xffd56b,
    emissive: 0xffa826,
    emissiveIntensity: 1.15,
    roughness: 0.18,
  });
  for (const railSide of [-1.46, 1.46] as const) {
    for (const [pz, ph] of [
      [-6.72, 0.92],
      [-8.42, 1.84],
    ] as const) {
      const stanchion = createFilletedShaft({
        radius: 0.024,
        height: ph,
        anglageBevel: 0.005,
        radialSegments: 18,
        material: brassMat,
      });
      stanchion.position.set(railSide, 0, pz);
      group.add(stanchion);
    }
    const railCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(railSide, 0.92, -6.72),
      new THREE.Vector3(railSide, 1.38, -7.57),
      new THREE.Vector3(railSide, 1.84, -8.42),
    ]);
    const handrail = new THREE.Mesh(
      new THREE.TubeGeometry(railCurve, 14, 0.022, 12, false),
      brassMat,
    );
    const stepLamp = createTurnedOrb({
      radius: 0.032,
      radialSegments: 14,
      material: stepLampMat,
      castShadow: false,
    });
    stepLamp.position.set(railSide, 0.58, -6.68);
    group.add(handrail, stepLamp);
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

  compactStaticMeshesInGroup(group, new Set([glintAnchor, colliderMesh]));

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

  compactStaticMeshesInGroup(group);

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

  // Helper to attach 4-circuit instanced chasing `#11` 2700K bulbs + instanced glow halos (`8` draw calls instead of `30+`!)
  const sharedHaloTex = typeof document !== 'undefined' ? getTungstenBulbHaloTexture() : null;
  const addArchBulbs = (
    parent: THREE.Object3D,
    radius: number,
    count: number,
    zOff: number,
    centerY: number,
    bulbHex = 0xffd56b,
  ) => {
    const circuitMats: THREE.MeshStandardMaterial[] = [];
    const haloMats: THREE.MeshBasicMaterial[] = [];
    for (let c = 0; c < 4; c++) {
      const bm = new THREE.MeshStandardMaterial({
        color: 0xfff8e4,
        emissive: bulbHex,
        emissiveIntensity: 1.0,
        roughness: 0.12,
      });
      const hm = new THREE.MeshBasicMaterial({
        map: sharedHaloTex,
        color: bulbHex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      (bm.userData as Record<string, unknown>).haloMat = hm;
      circuitMats.push(bm);
      haloMats.push(hm);
    }

    const orbGeom = new THREE.SphereGeometry(0.048, 10, 8);
    const haloGeom = new THREE.PlaneGeometry(0.24, 0.24);
    const dummy = new THREE.Object3D();
    const buckets: Array<Array<[number, number]>> = [[], [], [], []];

    for (let i = 0; i < count; i++) {
      const a = 0.14 * Math.PI + (i / Math.max(1, count - 1)) * (0.72 * Math.PI);
      buckets[i % 4].push([Math.cos(a) * radius, centerY + Math.sin(a) * radius]);
    }
    for (let c = 0; c < 4; c++) {
      const pts = buckets[c];
      if (pts.length === 0) continue;
      const bInst = new THREE.InstancedMesh(orbGeom, circuitMats[c], pts.length);
      const hInst = new THREE.InstancedMesh(haloGeom, haloMats[c], pts.length);
      hInst.renderOrder = 4;
      for (let k = 0; k < pts.length; k++) {
        dummy.position.set(pts[k][0], pts[k][1], zOff);
        dummy.updateMatrix();
        bInst.setMatrixAt(k, dummy.matrix);
        dummy.position.set(pts[k][0], pts[k][1], zOff + 0.036);
        dummy.updateMatrix();
        hInst.setMatrixAt(k, dummy.matrix);
      }
      bInst.instanceMatrix.needsUpdate = true;
      hInst.instanceMatrix.needsUpdate = true;
      parent.add(bInst, hInst);
    }
    chasingBulbGroups.push(circuitMats);
  };

  switch (stageId) {
    case 'STAGE_01_IBC_DAYTIME_FUNK': {
      // 30 ROCK STUDIO 6A: Unobstructed 7-Feather NBC Living Color Peacock Fan + Sunlit Walnut Wings w/ Twin Spinning Hex Finials!
      const peacockColors = [0x0096a6, 0x16a34a, 0xf4a91f, 0xff6738, 0xe63b7a, 0x1e56c5, 0x0096a6];
      const featherGroup = new THREE.Group();
      featherGroup.position.set(0, 0.34, -5.48);

      const fanPlinthAO = createContactShadowDisc({
        radius: 1.24,
        opacity: 0.58,
        yOffset: -0.336,
        name: 'PeacockFanPlinthContactAO',
      });
      featherGroup.add(fanPlinthAO);

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
        compactStaticMeshesInGroup(spinner);
        wing.add(spinner);
        wingSpinners.push(spinner);
        compactStaticMeshesInGroup(wing, new Set([spinner]));
        group.add(wing);
      }
      compactStaticMeshesInGroup(featherGroup);

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
        material: goldMat,
      });
      innerHalo.add(turqRing, innerGear);
      compactStaticMeshesInGroup(outerHalo);
      compactStaticMeshesInGroup(innerHalo);
      rotunda.add(outerHalo, innerHalo);
      compactStaticMeshesInGroup(rotunda, new Set([outerHalo, innerHalo]));
      group.add(rotunda);

      // Stepped Hollywood-Squares / IBC Jubilee Wing Light Chevrons (totally distinct from Stage 1!)
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
        compactStaticMeshesInGroup(wing);
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
      compactStaticMeshesInGroup(center, new Set(shutterPivots));
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
        const wingSkip = new Set<THREE.Object3D>();
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
          compactStaticMeshesInGroup(flower);
          wingSkip.add(flower);
          wing.add(stem, flower);
          flowerHeads.push(flower);
        }
        compactStaticMeshesInGroup(wing, wingSkip);
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
      center.add(
        createContactShadowDisc({
          radius: 1.18,
          opacity: 0.58,
          yOffset: 0.004,
          name: 'PendulumWellContactAO',
        }),
      );

      for (const bx of [-1.58, 1.58]) {
        const boothAO = createContactShadowDisc({
          radius: 1.04,
          opacity: 0.56,
          yOffset: 0.004,
          name: 'IsolationBoothContactAO',
        });
        boothAO.position.x = bx;
        center.add(boothAO);
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
        const beaconHalo = createTungstenBulbHaloSprite({
          scale: 0.44,
          opacity: 0.68,
          colorHex: 0xffd56b,
        });
        beaconHalo.position.set(bx, 2.6, 0.06);
        center.add(
          floorPlinth,
          brassTrimRing,
          teakCanopy,
          tealGlowRing,
          curvedTealGlass,
          beacon,
          beaconHalo,
        );
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
      compactStaticMeshesInGroup(center, new Set(relayBars));
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
        compactStaticMeshesInGroup(wing);
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
      center.add(
        createContactShadowDisc({
          radiusX: 2.65,
          radiusZ: 0.95,
          opacity: 0.56,
          yOffset: 0.004,
          name: 'ApolloConsoleContactAO',
        }),
      );

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
      compactStaticMeshesInGroup(center, new Set([armillaryPivot]));
      group.add(center);

      // Flanking 1967 Apollo Cream-and-Cobalt Analog Broadcast Vectorscope Wings
      const vectorRings: THREE.Mesh[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.3);
        wing.rotation.y = -side * 0.36;
        wing.add(createFloorShoe(2.42, 0.48, 0.09, goldMat, bluedMat));
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
        compactStaticMeshesInGroup(wing, new Set([sweepRing]));
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
      center.add(
        createContactShadowDisc({
          radiusX: 2.38,
          radiusZ: 0.78,
          opacity: 0.58,
          yOffset: 0.004,
          name: 'SteelPierBandstandContactAO',
        }),
      );

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

      // Luminous 3D Atlantic Ocean Wave Crest Coves & Boardwalk Pier Railing spanning the upstage horizon!
      const oceanWaveMat = createAcrylitePanelMaterial(0x00c6e0, 0.96, envMap);
      dimmableAcryliteMats.push(oceanWaveMat);
      for (let wRow = 0; wRow < 2; wRow++) {
        const waveBar = createChamferedBox({
          width: 11.4,
          height: 0.24,
          depth: 0.1,
          cornerRadius: 0.09,
          material: wRow === 0 ? oceanWaveMat : acMats[2],
          castShadow: false,
        });
        waveBar.position.set(0, 0.22 + wRow * 0.34, -2.4 - wRow * 0.5);
        center.add(waveBar);
      }
      for (let bp = -5; bp <= 5; bp++) {
        if (Math.abs(bp) <= 1) continue;
        const bollard = createFilletedShaft({
          radius: 0.065,
          height: 1.05,
          anglageBevel: 0.008,
          radialSegments: 16,
          material: bp % 2 === 0 ? walnutMat : goldMat,
        });
        bollard.position.set(bp * 0.96, 0, -2.1);
        center.add(bollard);
      }
      compactStaticMeshesInGroup(center, new Set(pipes));
      group.add(center);

      // Boardwalk Carnival Ferris-Starburst Wing Arches
      const ferrisStars: THREE.Group[] = [];
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.35);
        wing.rotation.y = -side * 0.34;
        wing.add(createFloorShoe(2.45, 0.48, 0.09, goldMat, bluedMat));
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
        compactStaticMeshesInGroup(ferrisStar);
        ferrisStars.push(ferrisStar);
        wing.add(carnivalArch, oceanWavePanel, ferrisStar);
        compactStaticMeshesInGroup(wing, new Set([ferrisStar]));
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
      for (const ax of [-2.02, 2.02]) {
        const legAO = createContactShadowDisc({ radius: 0.62, opacity: 0.54, yOffset: 0.004 });
        legAO.position.x = ax;
        center.add(legAO);
      }

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
      compactStaticMeshesInGroup(luminaire);
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
      compactStaticMeshesInGroup(center, new Set([luminaire]));
      group.add(center);

      // Sweeping Ken Adam Cantilevered Ivory-Gold Wing Ribs + Riviera Emerald Alcoves
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.35);
        wing.rotation.y = -side * 0.36;
        wing.add(
          createContactShadowDisc({
            radiusX: 1.28,
            radiusZ: 0.56,
            opacity: 0.56,
            yOffset: 0.004,
            name: 'MonteCarloWingContactAO',
          }),
        );
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
        compactStaticMeshesInGroup(wing);
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
      for (const ax of [-2.35, 2.35]) {
        const archAO = createContactShadowDisc({ radius: 0.68, opacity: 0.54, yOffset: 0.004 });
        archAO.position.set(ax, 0.004, -0.42);
        center.add(archAO);
      }

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
      compactStaticMeshesInGroup(dishPivot, new Set([orbitA, orbitB, orbitC]));
      azimuthYoke.add(dishPivot);
      compactStaticMeshesInGroup(azimuthYoke, new Set([dishPivot]));
      compactStaticMeshesInGroup(center, new Set([azimuthYoke]));
      group.add(center);

      // Iconic 1965 Flushing Meadows Googie Boomerang Wing Pylons + Satellite Spheres
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.65, 0, -4.35);
        wing.rotation.y = -side * 0.3;
        wing.add(
          createContactShadowDisc({
            radiusX: 0.92,
            radiusZ: 0.54,
            opacity: 0.56,
            yOffset: 0.004,
            name: 'GoogieBoomerangWingAO',
          }),
        );
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
        const satHalo = createTungstenBulbHaloSprite({
          scale: 0.58,
          opacity: 0.56,
          colorHex: side > 0 ? 0x4cd8ff : 0xffd56b,
        });
        satHalo.position.set(side * 0.26, 3.45, 0.08);
        wing.add(boomA, boomB, satOrb, satRing, satHalo);
        compactStaticMeshesInGroup(wing);
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
      for (const hx of [-2.18, 2.18]) {
        const hullAO = createContactShadowDisc({ radius: 0.64, opacity: 0.56, yOffset: 0.004 });
        hullAO.position.set(hx, 0.004, -0.4);
        center.add(hullAO);
      }

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
      compactStaticMeshesInGroup(center, new Set([clinoNeedle, ...waveBars]));
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
        const strobeHalo = createTungstenBulbHaloSprite({
          scale: 0.56,
          opacity: 0.72,
          colorHex: 0xff8d4c,
        });
        strobeHalo.position.set(side * 0.46, 3.46, 0.06);
        (strobeMat.userData as Record<string, unknown>).haloSprite = strobeHalo;
        wing.add(strobe, strobeHalo);
        beaconMats.push(strobeMat);
        compactStaticMeshesInGroup(wing);
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
            const pulse = Math.pow(0.5 + 0.5 * Math.sin(elapsed * 3.8 + b * Math.PI), 2);
            beaconMats[b].emissiveIntensity = 0.45 + pulse * 1.85;
            const halo = (beaconMats[b].userData as { haloSprite?: THREE.Sprite }).haloSprite;
            if (halo) halo.material.opacity = 0.22 + pulse * 0.68;
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
      center.add(
        createContactShadowDisc({
          radius: 1.18,
          opacity: 0.58,
          yOffset: 0.004,
          name: 'PendulumWellContactAO',
        }),
      );

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
        material: goldMat,
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

      // Soaring 38th-Floor Manhattan Penthouse Mullion Panorama Windows + Imperial Velvet Proscenium Drapes!
      const penthouseVelvetMat = new THREE.MeshStandardMaterial({
        color: 0x7c0d2b,
        roughness: 0.65,
        metalness: 0.08,
        envMap,
      });
      const skylineGlassMat = createAcrylitePanelMaterial(0x16386e, 0.55, envMap);
      dimmableAcryliteMats.push(skylineGlassMat);
      for (const wx of [-4.2, -2.65, 2.65, 4.2]) {
        const windowPane = createChamferedBox({
          width: 1.18,
          height: 3.45,
          depth: 0.05,
          cornerRadius: 0.14,
          material: skylineGlassMat,
          castShadow: false,
        });
        windowPane.position.set(wx, 1.78, -2.55);
        const goldFrame = createChamferedBox({
          width: 1.28,
          height: 3.55,
          depth: 0.08,
          cornerRadius: 0.16,
          material: goldMat,
        });
        goldFrame.position.set(wx, 1.78, -2.6);
        const transom = createChamferedBox({
          width: 1.24,
          height: 0.055,
          depth: 0.1,
          material: goldMat,
        });
        transom.position.set(wx, 2.35, -2.54);
        center.add(goldFrame, windowPane, transom);
      }
      // Imperial Crimson Velvet Valance Swags & Gold Bullion Trim flanking Penthouse Proscenium
      for (const vx of [-3.42, 3.42]) {
        const drapeColumn = createFilletedShaft({
          radius: 0.24,
          topRadius: 0.28,
          height: 3.55,
          anglageBevel: 0.012,
          radialSegments: 20,
          material: penthouseVelvetMat,
        });
        drapeColumn.position.set(vx, 0.05, -2.35);
        center.add(drapeColumn);
      }

      compactStaticMeshesInGroup(center, new Set([pendulumGroup, escapeWheel]));
      group.add(center);

      // Towering Art-Deco Champagne-Gold & Midnight-Sapphire Manhattan Penthouse Window Bay Wings
      for (const side of [-1, 1] as const) {
        const wing = new THREE.Group();
        wing.position.set(side * 3.7, 0, -4.35);
        wing.rotation.y = -side * 0.34;
        wing.add(
          createContactShadowDisc({
            radiusX: 1.42,
            radiusZ: 0.48,
            opacity: 0.56,
            yOffset: 0.004,
            name: 'PenthouseDecoWingAO',
          }),
        );
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
        compactStaticMeshesInGroup(wing);
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
  rawStageId: StageWorldIdV7,
  envMap: THREE.Texture,
): BuiltStageWorldV7 {
  const stageId = resolveStageWorldIdV7(rawStageId);
  const spec = STAGE_WORLD_SPECS_V7[stageId];
  const palette = STAGE_LIVING_COLOR_PALETTES[stageId];
  const root = new THREE.Group();
  root.name = `StageWorldV7_${stageId}`;

  const goldMat = create24KGoldMaterial(envMap);
  const aluminumMat = createAnodizedAluminumMaterial(envMap);
  const bluedMat = createBluedSteelMaterial(0x1e56c5, envMap);
  const walnutMat = createWalnutMaterial(envMap);
  const trussMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2e34,
    metalness: 0.78,
    roughness: 0.32,
    clearcoat: 0.28,
    envMap,
    envMapIntensity: 1.15,
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
  // 4) Layer 1 Studio 6A Lighting Towers (Mole-Richardson Barn-Door Fresnels + 18" Studio Scoops!)
  // --------------------------------------------------------------------------
  const mrLampBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x24282e,
    roughness: 0.44,
    metalness: 0.52,
    clearcoat: 0.22,
    envMap,
    envMapIntensity: 0.95,
  });
  const scoopReflectorMat = new THREE.MeshStandardMaterial({
    color: 0xfff0cc,
    emissive: 0xffc857,
    emissiveIntensity: 0.85,
    roughness: 0.24,
    metalness: 0.45,
    side: THREE.DoubleSide,
  });
  const towerTungstenLensMat = new THREE.MeshStandardMaterial({
    color: 0xfff6dc,
    emissive: 0xffc952,
    emissiveIntensity: 1.55,
    roughness: 0.12,
  });

  const buildLateralTruss = (name: string, aimSide: -1 | 1): THREE.Group => {
    const tg = new THREE.Group();
    tg.name = name;
    const shoe = createFloorShoe(0.66, 0.66, 0.12, goldMat, trussMat);
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
        width: 0.44,
        height: 0.055,
        depth: 0.44,
        cornerRadius: 0.06,
        material: r % 2 === 0 ? aluminumMat : goldMat,
      });
      collar.position.y = 0.48 + r * 0.62;
      tg.add(collar);
    }

    // Mount 2 Mole-Richardson Barn-Door Fresnel Spotlights (`y = 2.48m` & `y = 3.68m`) w/ C-clamps & 2700K glow!
    for (const fy of [2.48, 3.68] as const) {
      const rig = new THREE.Group();
      rig.position.set(-aimSide * 0.28, fy, 0.22);
      rig.rotation.set(0.24, -aimSide * 0.52, 0);

      const cClamp = createChamferedBox({
        width: 0.14,
        height: 0.09,
        depth: 0.12,
        cornerRadius: 0.02,
        material: aluminumMat,
        castShadow: false,
      });
      cClamp.position.set(aimSide * 0.16, 0.18, -0.08);

      const yoke = createChamferedBox({
        width: 0.34,
        height: 0.24,
        depth: 0.05,
        cornerRadius: 0.03,
        material: mrLampBodyMat,
        castShadow: false,
      });
      yoke.position.y = 0.08;

      const drum = createFilletedShaft({
        radius: 0.145,
        height: 0.32,
        baseCollarFlare: 0.02,
        neckCollarFlare: 0.024,
        anglageBevel: 0.008,
        radialSegments: 28,
        centered: true,
        material: mrLampBodyMat,
        castShadow: false,
      });
      drum.rotation.x = Math.PI * 0.5;

      const lens = createFilletedShaft({
        radius: 0.125,
        height: 0.028,
        radialSegments: 24,
        centered: true,
        material: towerTungstenLensMat,
        castShadow: false,
      });
      lens.rotation.x = Math.PI * 0.5;
      lens.position.z = 0.165;

      const halo = createTungstenBulbHaloSprite({
        scale: 0.48,
        opacity: 0.64,
        colorHex: 0xffd56b,
      });
      halo.position.z = 0.22;

      // 4 Angled Mole-Richardson Matte-Black Barn-Door Leaves!
      for (const [bx, by, rx, ry] of [
        [0, 0.15, -0.45, 0],
        [0, -0.15, 0.45, 0],
        [-0.15, 0, 0, 0.45],
        [0.15, 0, 0, -0.45],
      ] as const) {
        const door = createChamferedBox({
          width: bx === 0 ? 0.22 : 0.026,
          height: by === 0 ? 0.22 : 0.026,
          depth: 0.11,
          cornerRadius: 0.01,
          material: mrLampBodyMat,
          castShadow: false,
        });
        door.position.set(bx, by, 0.21);
        door.rotation.set(rx, ry, 0);
        rig.add(door);
      }

      rig.add(cClamp, yoke, drum, lens, halo);
      tg.add(rig);
    }

    // Broad 18-inch Spun-Aluminum Incandescent Studio Scoop Floodlight (`y = 1.32m`) washing the stage warmly!
    const scoopGroup = new THREE.Group();
    scoopGroup.position.set(-aimSide * 0.26, 1.32, 0.24);
    scoopGroup.rotation.set(0.12, -aimSide * 0.46, 0);
    const scoopOuter = createTurnedOrb({
      radius: 0.22,
      heightScale: 0.78,
      hemiOnly: true,
      radialSegments: 28,
      material: aluminumMat,
      castShadow: false,
    });
    scoopOuter.rotation.x = -Math.PI * 0.5;
    const scoopInner = createTurnedOrb({
      radius: 0.205,
      heightScale: 0.74,
      hemiOnly: true,
      radialSegments: 24,
      material: scoopReflectorMat,
      castShadow: false,
    });
    scoopInner.rotation.x = -Math.PI * 0.5;
    scoopInner.position.z = 0.01;
    const scoopBulb = createTurnedOrb({
      radius: 0.065,
      radialSegments: 16,
      material: towerTungstenLensMat,
      castShadow: false,
    });
    scoopBulb.position.z = 0.05;
    const scoopHalo = createTungstenBulbHaloSprite({
      scale: 0.54,
      opacity: 0.56,
      colorHex: 0xffe094,
    });
    scoopHalo.position.z = 0.12;
    scoopGroup.add(scoopOuter, scoopInner, scoopBulb, scoopHalo);
    tg.add(scoopGroup);

    return tg;
  };

  const leftWingTruss = buildLateralTruss('LeftWingTruss', -1);
  const rightWingTruss = buildLateralTruss('RightWingTruss', 1);
  leftWingTruss.position.set(-7.6, 0, -4.8);
  rightWingTruss.position.set(7.6, 0, -4.8);
  compactStaticMeshesInGroup(leftWingTruss);
  compactStaticMeshesInGroup(rightWingTruss);
  root.add(leftWingTruss, rightWingTruss);

  const fresnel = buildComplianceFresnelLamp(envMap);
  fresnel.group.position.set(-0.24, 1.72, 0.24);
  compactStaticMeshesInGroup(fresnel.group);
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

  // Instanced 4-circuit `#11` Marquee Pillars (`12` draw calls total instead of `54`!)
  const pillarHaloTex = typeof document !== 'undefined' ? getTungstenBulbHaloTexture() : null;
  for (const side of [-1, 1] as const) {
    const pGroup = new THREE.Group();
    pGroup.name = side < 0 ? 'InnerMarqueePillarL' : 'InnerMarqueePillarR';
    const ph = 2.75;
    const pBodyMat =
      stageId === 'STAGE_01_IBC_DAYTIME_FUNK' || stageId === 'STAGE_06_ATLANTIC_CITY_PIER'
        ? walnutMat
        : aluminumMat;
    pGroup.add(createContactShadowDisc({ radius: 0.44, opacity: 0.56, yOffset: 0.004 }));
    pGroup.add(
      createFilletedShaft({
        radius: 0.21,
        topRadius: 0.16,
        height: 0.12,
        baseCollarFlare: 0.03,
        neckCollarFlare: 0.015,
        anglageBevel: 0.01,
        radialSegments: 28,
        material: goldMat,
      }),
    );
    const pShaft = createFilletedShaft({
      radius: 0.125,
      topRadius: 0.155,
      height: ph - 0.12,
      baseCollarFlare: 0.02,
      neckCollarFlare: 0.035,
      anglageBevel: 0.01,
      radialSegments: 28,
      material: pBodyMat,
    });
    pShaft.position.y = 0.12;
    const pCrown = createTurnedOrb({
      radius: 0.145,
      heightScale: 0.72,
      radialSegments: 24,
      material: goldMat,
      castShadow: false,
    });
    pCrown.position.y = ph + 0.08;
    pGroup.add(pShaft, pCrown);

    const pCircuitMats: THREE.MeshStandardMaterial[] = [];
    for (let c = 0; c < 4; c++) {
      const bm = new THREE.MeshStandardMaterial({
        color: 0xfff6dc,
        emissive: 0xffd56b,
        emissiveIntensity: 0.9,
        roughness: 0.12,
        metalness: 0.05,
      });
      const hm = new THREE.MeshBasicMaterial({
        map: pillarHaloTex,
        color: 0xffd56b,
        transparent: true,
        opacity: 0.68,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      (bm.userData as Record<string, unknown>).haloMat = hm;
      pCircuitMats.push(bm);
    }

    const pBulbCount = 8;
    const pOrbGeom = new THREE.SphereGeometry(0.044, 10, 8);
    const pHaloGeom = new THREE.PlaneGeometry(0.24, 0.24);
    const pDummy = new THREE.Object3D();
    for (let i = 0; i < pBulbCount; i++) {
      const t = (i + 0.5) / pBulbCount;
      const by = 0.34 + t * (ph - 0.56);
      const localR = 0.128 + (0.154 - 0.128) * t;
      const sock = createSmoothBeveledRing({
        outerRadius: 0.054,
        innerRadius: 0.034,
        thickness: 0.024,
        segments: 16,
        material: goldMat,
      });
      sock.rotation.x = Math.PI * 0.5;
      sock.position.set(0, by, localR + 0.01);
      pGroup.add(sock);
    }
    compactStaticMeshesInGroup(pGroup);

    for (let c = 0; c < 4; c++) {
      const idxs = [0, 1, 2, 3, 4, 5, 6, 7].filter((idx) => idx % 4 === c);
      const hm = (pCircuitMats[c].userData as { haloMat: THREE.MeshBasicMaterial }).haloMat;
      const bInst = new THREE.InstancedMesh(pOrbGeom, pCircuitMats[c], idxs.length);
      const hInst = new THREE.InstancedMesh(pHaloGeom, hm, idxs.length);
      hInst.renderOrder = 4;
      for (let k = 0; k < idxs.length; k++) {
        const t = (idxs[k] + 0.5) / pBulbCount;
        const by = 0.34 + t * (ph - 0.56);
        const localR = 0.128 + (0.154 - 0.128) * t;
        pDummy.position.set(0, by, localR + 0.038);
        pDummy.updateMatrix();
        bInst.setMatrixAt(k, pDummy.matrix);
        pDummy.position.set(0, by, localR + 0.068);
        pDummy.updateMatrix();
        hInst.setMatrixAt(k, pDummy.matrix);
      }
      bInst.instanceMatrix.needsUpdate = true;
      hInst.instanceMatrix.needsUpdate = true;
      pGroup.add(bInst, hInst);
    }

    pGroup.position.set(side * 2.02, 0, -4.52);
    pGroup.rotation.y = -side * 0.14;
    framingGroup.add(pGroup);
    innerMarqueePillars.push(pGroup);
    chasingBulbGroups.push(pCircuitMats);
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
  compactStaticMeshesInGroup(crownStarburst);
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

  // `toneMapped: false` keeps the central milk-glass stage showcase marquee rich & un-crushed by AgX!
  const signFaceMat = new THREE.MeshBasicMaterial({
    map: signTex,
    color: 0xffffff,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
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
  for (let c = 0; c < 4; c++) {
    const bm = new THREE.MeshStandardMaterial({
      color: 0xfff8e2,
      emissive: 0xffd56b,
      emissiveIntensity: 1.1,
      roughness: 0.12,
    });
    const hm = new THREE.MeshBasicMaterial({
      map: typeof document !== 'undefined' ? getTungstenBulbHaloTexture() : null,
      color: 0xffd56b,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    (bm.userData as Record<string, unknown>).haloMat = hm;
    signBulbMats.push(bm);
  }
  const signBulbCoords: Array<[number, number]> = [];
  for (let b = 0; b < 7; b++) {
    const bx = -0.78 + b * 0.26;
    signBulbCoords.push([bx, 0.215], [bx, -0.215]);
  }
  const signOrbGeom = new THREE.SphereGeometry(0.025, 10, 8);
  const signHaloGeom = new THREE.PlaneGeometry(0.15, 0.15);
  const signDummy = new THREE.Object3D();
  for (let c = 0; c < 4; c++) {
    const pts = signBulbCoords.filter((_, idx) => idx % 4 === c);
    if (pts.length === 0) continue;
    const hm = (signBulbMats[c].userData as { haloMat: THREE.MeshBasicMaterial }).haloMat;
    const bInst = new THREE.InstancedMesh(signOrbGeom, signBulbMats[c], pts.length);
    const hInst = new THREE.InstancedMesh(signHaloGeom, hm, pts.length);
    hInst.renderOrder = 4;
    for (let k = 0; k < pts.length; k++) {
      signDummy.position.set(pts[k][0], pts[k][1], 0.064);
      signDummy.updateMatrix();
      bInst.setMatrixAt(k, signDummy.matrix);
      signDummy.position.set(pts[k][0], pts[k][1], 0.088);
      signDummy.updateMatrix();
      hInst.setMatrixAt(k, signDummy.matrix);
    }
    bInst.instanceMatrix.needsUpdate = true;
    hInst.instanceMatrix.needsUpdate = true;
    signFrame.add(bInst, hInst);
  }
  chasingBulbGroups.push(signBulbMats);
  marqueeCrownGroup.add(signFrame);

  // Authentic Backlit 1966 3D `ON THE AIR` & Reactive Blinking `APPLAUSE` Studio Lightbox Signs!
  const buildProsceniumLightbox = (kind: 'ON_THE_AIR' | 'APPLAUSE') => {
    const boxGroup = new THREE.Group();
    boxGroup.name = kind === 'ON_THE_AIR' ? 'StudioLightbox_OnTheAir' : 'StudioLightbox_Applause';

    const housing = createChamferedBox({
      width: 0.88,
      height: 0.36,
      depth: 0.11,
      cornerRadius: 0.055,
      bevelThickness: 0.009,
      bevelSize: 0.009,
      bevelSegments: 3,
      material: aluminumMat,
      castShadow: false,
    });
    const brassBezel = createChamferedBox({
      width: 0.84,
      height: 0.32,
      depth: 0.118,
      cornerRadius: 0.048,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3,
      material: goldMat,
      castShadow: false,
    });
    const visorHood = createChamferedBox({
      width: 0.9,
      height: 0.026,
      depth: 0.15,
      cornerRadius: 0.012,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
      material: goldMat,
      castShadow: false,
    });
    visorHood.position.set(0, 0.175, 0.024);

    // Overhead studio pipe hanger strut
    const hanger = createFilletedShaft({
      radius: 0.016,
      height: 0.42,
      anglageBevel: 0.004,
      radialSegments: 16,
      material: aluminumMat,
      castShadow: false,
    });
    hanger.position.set(0, 0.18, -0.02);
    boxGroup.add(housing, brassBezel, visorHood, hanger);

    const makeFaceTex = (variant: 'ON_AIR' | 'APPLAUSE_AMBER' | 'APPLAUSE_CRIMSON') => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 192;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFF6E3';
        ctx.fillRect(0, 0, 512, 192);

        const g = ctx.createLinearGradient(0, 12, 0, 180);
        if (variant === 'ON_AIR') {
          g.addColorStop(0.0, '#E61E3A');
          g.addColorStop(0.55, '#C4122C');
          g.addColorStop(1.0, '#8C091C');
        } else if (variant === 'APPLAUSE_AMBER') {
          g.addColorStop(0.0, '#FFF1A8');
          g.addColorStop(0.5, '#F6B221');
          g.addColorStop(1.0, '#C97A08');
        } else {
          g.addColorStop(0.0, '#FF4D79');
          g.addColorStop(0.55, '#E11D52');
          g.addColorStop(1.0, '#9E0B34');
        }
        ctx.fillStyle = g;
        ctx.fillRect(12, 12, 488, 168);

        ctx.strokeStyle = variant === 'APPLAUSE_AMBER' ? '#0D2238' : '#FFD56B';
        ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, 472, 152);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (variant === 'ON_AIR') {
          // Glowing live broadcast tally lamp dot + bold ON THE AIR milk-glass caps
          ctx.fillStyle = '#FFF9EC';
          ctx.beginPath();
          ctx.arc(62, 96, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '900 56px "Jost", "Futura", "Arial Black", sans-serif';
          ctx.shadowColor = 'rgba(10, 18, 34, 0.55)';
          ctx.shadowBlur = 6;
          ctx.fillText('ON THE AIR', 280, 98);
        } else {
          ctx.fillStyle = variant === 'APPLAUSE_AMBER' ? '#0D2238' : '#FFF9EC';
          ctx.font = '900 62px "Jost", "Futura", "Arial Black", sans-serif';
          ctx.shadowColor =
            variant === 'APPLAUSE_AMBER' ? 'rgba(255, 250, 224, 0.45)' : 'rgba(10, 18, 34, 0.55)';
          ctx.shadowBlur = 6;
          ctx.fillText('APPLAUSE', 256, 98);
        }
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    };

    const primaryTex = makeFaceTex(kind === 'ON_THE_AIR' ? 'ON_AIR' : 'APPLAUSE_AMBER');
    const altTex = kind === 'APPLAUSE' ? makeFaceTex('APPLAUSE_CRIMSON') : null;

    const faceMat = new THREE.MeshBasicMaterial({
      map: primaryTex,
      color: kind === 'ON_THE_AIR' ? 0xffffff : 0xdccaa8,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.27), faceMat);
    faceMesh.position.set(0, 0, 0.064);
    boxGroup.add(faceMesh);

    const bulbHalos: THREE.Sprite[] = [];
    const bulbMats: THREE.MeshStandardMaterial[] = [];
    for (const [bx, by] of [
      [-0.36, 0.135],
      [0.36, 0.135],
      [-0.36, -0.135],
      [0.36, -0.135],
    ] as const) {
      const bm = new THREE.MeshStandardMaterial({
        color: 0xfff8e2,
        emissive: kind === 'ON_THE_AIR' ? 0xff3b5c : 0xffd56b,
        emissiveIntensity: 1.25,
        roughness: 0.12,
      });
      const bulb = createTurnedOrb({
        radius: 0.02,
        radialSegments: 14,
        material: bm,
        castShadow: false,
        receiveShadow: false,
      });
      bulb.position.set(bx, by, 0.064);
      boxGroup.add(bulb);
      bulbMats.push(bm);

      const halo = createTungstenBulbHaloSprite({
        scale: 0.15,
        opacity: kind === 'ON_THE_AIR' ? 0.62 : 0.34,
        colorHex: kind === 'ON_THE_AIR' ? 0xff6b7a : 0xffd56b,
      });
      halo.position.set(bx, by, 0.088);
      boxGroup.add(halo);
      bulbHalos.push(halo);
    }

    const centerGlowHalo = createTungstenBulbHaloSprite({
      scale: 0.68,
      opacity: kind === 'ON_THE_AIR' ? 0.24 : 0.14,
      colorHex: kind === 'ON_THE_AIR' ? 0xff3b5c : 0xffd56b,
    });
    centerGlowHalo.scale.set(0.95, 0.42, 1);
    centerGlowHalo.position.set(0, 0, 0.09);
    boxGroup.add(centerGlowHalo);

    return {
      group: boxGroup,
      faceMat,
      primaryTex,
      altTex,
      bulbMats,
      bulbHalos,
      centerGlowHalo,
    };
  };

  const onTheAirLightbox = buildProsceniumLightbox('ON_THE_AIR');
  const applauseLightbox = buildProsceniumLightbox('APPLAUSE');
  onTheAirLightbox.group.position.set(-1.54, 0.01, 0.02);
  applauseLightbox.group.position.set(1.54, 0.01, 0.02);
  marqueeCrownGroup.add(onTheAirLightbox.group, applauseLightbox.group);

  framingGroup.add(marqueeCrownGroup);

  // Twin Historically Authentic 1966 RCA TK-41C Network Television Pedestal Cameras (ZERO blue!):
  // - RCA Studio Gray / CBS 18% Gray (`#767A80` brushed cast-aluminum upper cowling)
  // - Dark Charcoal Crinkle-Enamel (`#282C32`) lower frame, turret, matte-box & Houston-Fearless dolly
  // - 6 Horizontal side cooling louvers (3-tube Image Orthicon heat vents) + embossed crimson/gold RCA plaque
  // - 4-Lens mechanical turret + black anodized zoom barrel + angled barn-doors
  // - Rigid top rectangular CRT viewfinder w/ black sun-visor + glowing red `ON AIR` tally box + dual rear pan-bars
  // - Houston-Fearless pneumatic column + 3-spoke steering wheel + coiled black triaxial floor cable!
  const brushedCamTex = typeof document !== 'undefined' ? getBrushedAnodizedTexture() : null;
  const rcaStudioGrayMat = new THREE.MeshPhysicalMaterial({
    color: 0x9c9ea3,
    map: brushedCamTex,
    roughness: 0.28,
    metalness: 0.62,
    clearcoat: 0.34,
    envMap,
    envMapIntensity: 1.25,
  });
  const rcaCharcoalCrinkleMat = new THREE.MeshPhysicalMaterial({
    color: 0x282c32,
    roughness: 0.56,
    metalness: 0.34,
    clearcoat: 0.16,
    envMap,
    envMapIntensity: 0.85,
  });
  const blackRubberCableMat = new THREE.MeshStandardMaterial({
    color: 0x16181d,
    roughness: 0.64,
    metalness: 0.12,
  });
  const lensGlassMultiCoatMat = new THREE.MeshPhysicalMaterial({
    color: 0x182b3a,
    emissive: 0x0d3b4c,
    emissiveIntensity: 0.35,
    roughness: 0.06,
    metalness: 0.15,
    clearcoat: 1.0,
    envMap,
    envMapIntensity: 1.8,
  });

  // Embossed Crimson & 24K Gold `RCA · IN LIVING COLOR` side identification nameplate texture
  const camBadgeCanvas = document.createElement('canvas');
  camBadgeCanvas.width = 256;
  camBadgeCanvas.height = 64;
  const cbCtx = camBadgeCanvas.getContext('2d');
  if (cbCtx) {
    cbCtx.fillStyle = '#B81428';
    cbCtx.fillRect(0, 0, 256, 64);
    cbCtx.strokeStyle = '#F4A91F';
    cbCtx.lineWidth = 5;
    cbCtx.strokeRect(4, 4, 248, 56);
    cbCtx.fillStyle = '#FFF9EC';
    cbCtx.font = '900 20px "Jost", Arial, sans-serif';
    cbCtx.textAlign = 'center';
    cbCtx.textBaseline = 'middle';
    cbCtx.fillText('RCA · LIVING COLOR', 128, 33);
  }
  const camBadgeTex = new THREE.CanvasTexture(camBadgeCanvas);
  camBadgeTex.colorSpace = THREE.SRGBColorSpace;
  camBadgeTex.anisotropy = 8;
  const camBadgeFaceMat = new THREE.MeshBasicMaterial({
    map: camBadgeTex,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const camTurretHeads: THREE.Group[] = [];
  const camBaseYaw: number[] = [];
  const camTallyMats: THREE.MeshStandardMaterial[] = [];

  for (const side of [-1, 1] as const) {
    const tkCam = new THREE.Group();
    tkCam.name = side < 0 ? 'RCA_TK41C_Camera_1' : 'RCA_TK41C_Camera_2';
    tkCam.position.set(side * 3.16, 0, -2.85);
    const baseYaw = -side * 0.54;
    tkCam.rotation.y = baseYaw;

    tkCam.add(
      createContactShadowDisc({
        radius: 0.72,
        opacity: 0.6,
        yOffset: 0.004,
        name: 'CameraDollyContactAO',
      }),
    );

    // 1. Heavy Houston-Fearless 3-Arm Cast-Iron Crab Dolly Base + Chrome Caster Skirts!
    const dollyHub = createFilletedShaft({
      radius: 0.22,
      topRadius: 0.18,
      height: 0.11,
      anglageBevel: 0.01,
      radialSegments: 28,
      material: rcaCharcoalCrinkleMat,
    });
    tkCam.add(dollyHub);
    for (let legIdx = 0; legIdx < 3; legIdx++) {
      const la = (legIdx / 3) * Math.PI * 2 + Math.PI / 6;
      const legArm = createChamferedBox({
        width: 0.13,
        height: 0.075,
        depth: 0.44,
        cornerRadius: 0.03,
        material: rcaCharcoalCrinkleMat,
      });
      legArm.position.set(Math.sin(la) * 0.22, 0.055, Math.cos(la) * 0.22);
      legArm.rotation.y = la;
      const casterSkirt = createFilletedShaft({
        radius: 0.078,
        height: 0.068,
        anglageBevel: 0.008,
        radialSegments: 20,
        material: aluminumMat,
      });
      casterSkirt.position.set(Math.sin(la) * 0.39, 0.01, Math.cos(la) * 0.39);
      tkCam.add(legArm, casterSkirt);
    }

    // Two-stage Houston-Fearless Pneumatic Column (charcoal outer cylinder + polished chrome inner ram)
    const pedOuterSleeve = createFilletedShaft({
      radius: 0.135,
      topRadius: 0.125,
      height: 0.64,
      baseCollarFlare: 0.025,
      neckCollarFlare: 0.02,
      anglageBevel: 0.008,
      radialSegments: 32,
      material: rcaCharcoalCrinkleMat,
    });
    pedOuterSleeve.position.y = 0.09;
    const pedChromeRam = createFilletedShaft({
      radius: 0.092,
      height: 0.56,
      neckCollarFlare: 0.028,
      anglageBevel: 0.006,
      radialSegments: 28,
      material: aluminumMat,
    });
    pedChromeRam.position.y = 0.68;

    // 3-Spoke Houston-Fearless Steering Wheel Ring (Black Bakelite Rim + 3 Chrome Spokes!)
    const steeringGroup = new THREE.Group();
    steeringGroup.position.y = 0.94;
    const steeringRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.024, 14, 36),
      rcaCharcoalCrinkleMat,
    );
    steeringRim.rotation.x = Math.PI * 0.5;
    steeringGroup.add(steeringRim);
    for (let sp = 0; sp < 3; sp++) {
      const sa = (sp / 3) * Math.PI * 2;
      const spoke = createChamferedBox({
        width: 0.026,
        height: 0.022,
        depth: 0.27,
        cornerRadius: 0.008,
        material: aluminumMat,
        castShadow: false,
      });
      spoke.position.set(Math.sin(sa) * 0.135, 0, Math.cos(sa) * 0.135);
      spoke.rotation.y = sa;
      steeringGroup.add(spoke);
    }

    // Thick Coiled Black Triaxial Camera Cable snaking across the studio floor!
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.42, -0.14),
      new THREE.Vector3(side * 0.18, 0.03, -0.46),
      new THREE.Vector3(side * 0.56, 0.028, -0.68),
      new THREE.Vector3(side * 0.34, 0.028, -1.08),
      new THREE.Vector3(side * 0.88, 0.028, -1.36),
      new THREE.Vector3(side * 1.38, 0.028, -1.58),
    ]);
    const triaxCable = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 28, 0.026, 10, false),
      blackRubberCableMat,
    );
    const cableAO = createContactShadowDisc({
      radiusX: 0.76,
      radiusZ: 0.62,
      opacity: 0.38,
      yOffset: 0.0035,
      name: 'CameraTriaxCableContactAO',
    });
    cableAO.position.set(side * 0.68, 0.0035, -1.02);
    tkCam.add(pedOuterSleeve, pedChromeRam, steeringGroup, triaxCable, cableAO);

    // 2. Articulated RCA TK-41C Pan-Tilt Camera Head!
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 1.38, 0.04);

    // Lower Dark Charcoal Crinkle-Enamel Chassis Base (`y = -0.13`)
    const lowerChassis = createChamferedBox({
      width: 0.4,
      height: 0.17,
      depth: 0.74,
      cornerRadius: 0.045,
      material: rcaCharcoalCrinkleMat,
    });
    lowerChassis.position.y = -0.13;

    // Upper Brushed RCA Studio Gray Optical Cowling (`y = +0.07`)
    const upperCowling = createChamferedBox({
      width: 0.39,
      height: 0.28,
      depth: 0.72,
      cornerRadius: 0.065,
      material: rcaStudioGrayMat,
    });
    upperCowling.position.y = 0.07;

    // Polished Chrome Beltline Molding Strip + Hinged Top Optical Access Lid
    const chromeBelt = createChamferedBox({
      width: 0.408,
      height: 0.024,
      depth: 0.745,
      cornerRadius: 0.03,
      material: aluminumMat,
      castShadow: false,
    });
    chromeBelt.position.y = -0.042;
    const topAccessLid = createChamferedBox({
      width: 0.35,
      height: 0.028,
      depth: 0.64,
      cornerRadius: 0.04,
      material: aluminumMat,
      castShadow: false,
    });
    topAccessLid.position.y = 0.215;

    // Signature TK-41C Horizontal Side Cooling Louvers (6 Image-Orthicon heat vents per flank) + Embossed RCA Plaque!
    for (const flank of [-1, 1] as const) {
      for (let lv = 0; lv < 6; lv++) {
        const louver = createChamferedBox({
          width: 0.018,
          height: 0.016,
          depth: 0.34,
          cornerRadius: 0.004,
          material: rcaCharcoalCrinkleMat,
          castShadow: false,
        });
        louver.position.set(flank * 0.198, 0.01 + lv * 0.028, -0.12);
        headPivot.add(louver);
      }
      const badgeHolder = createChamferedBox({
        width: 0.018,
        height: 0.088,
        depth: 0.28,
        cornerRadius: 0.012,
        material: goldMat,
        castShadow: false,
      });
      badgeHolder.position.set(flank * 0.2, 0.11, 0.16);
      const badgeFace = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.068), camBadgeFaceMat);
      badgeFace.position.set(flank * 0.211, 0.11, 0.16);
      badgeFace.rotation.y = flank > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      headPivot.add(badgeHolder, badgeFace);
    }

    // Forward 4-Lens Mechanical Turret Plate + 3 Auxiliary Multi-Coated Turret Lenses!
    const turretDisc = createFilletedShaft({
      radius: 0.19,
      height: 0.055,
      anglageBevel: 0.006,
      radialSegments: 32,
      centered: true,
      material: rcaCharcoalCrinkleMat,
    });
    turretDisc.rotation.x = Math.PI * 0.5;
    turretDisc.position.set(0, 0.03, 0.385);
    const turretChromeHub = createFilletedShaft({
      radius: 0.042,
      height: 0.075,
      radialSegments: 20,
      centered: true,
      material: aluminumMat,
      castShadow: false,
    });
    turretChromeHub.rotation.x = Math.PI * 0.5;
    turretChromeHub.position.set(0, 0.03, 0.39);
    headPivot.add(turretDisc, turretChromeHub);

    // 3 Auxiliary Turret Prime Lenses (`90°`, `180°`, `270°` positions around turret; `0°` holds primary zoom matte-box!)
    for (const [lx, ly, lr, lh] of [
      [-0.105, 0.03, 0.042, 0.13],
      [0.105, 0.03, 0.046, 0.16],
      [0, -0.075, 0.038, 0.11],
    ] as const) {
      const auxBarrel = createFilletedShaft({
        radius: lr,
        height: lh,
        anglageBevel: 0.005,
        radialSegments: 22,
        centered: true,
        material: aluminumMat,
        castShadow: false,
      });
      auxBarrel.rotation.x = Math.PI * 0.5;
      auxBarrel.position.set(lx, ly, 0.41 + lh * 0.5);
      const auxGlass = createFilletedShaft({
        radius: lr * 0.78,
        height: 0.016,
        radialSegments: 18,
        centered: true,
        material: lensGlassMultiCoatMat,
        castShadow: false,
      });
      auxGlass.rotation.x = Math.PI * 0.5;
      auxGlass.position.set(lx, ly, 0.412 + lh);
      headPivot.add(auxBarrel, auxGlass);
    }

    // Primary Top Turret Black Anodized Zoom Barrel + Rectangular Matte-Box + 4 Angled Barn-Doors!
    const primeLens = createFilletedShaft({
      radius: 0.068,
      height: 0.22,
      anglageBevel: 0.006,
      radialSegments: 28,
      centered: true,
      material: rcaCharcoalCrinkleMat,
    });
    primeLens.rotation.x = Math.PI * 0.5;
    primeLens.position.set(0, 0.115, 0.49);

    const matteBox = createChamferedBox({
      width: 0.21,
      height: 0.16,
      depth: 0.12,
      cornerRadius: 0.02,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
      material: rcaCharcoalCrinkleMat,
      castShadow: false,
    });
    matteBox.position.set(0, 0.115, 0.61);

    const frontOpticGlass = createFilletedShaft({
      radius: 0.056,
      height: 0.018,
      radialSegments: 22,
      centered: true,
      material: lensGlassMultiCoatMat,
      castShadow: false,
    });
    frontOpticGlass.rotation.x = Math.PI * 0.5;
    frontOpticGlass.position.set(0, 0.115, 0.605);

    // 4 Angled Matte-Black Studio Zoom Barn-Doors!
    for (const [bx, by, rx, ry] of [
      [0, 0.095, -0.42, 0],
      [0, -0.095, 0.36, 0],
      [-0.12, 0, 0, 0.42],
      [0.12, 0, 0, -0.42],
    ] as const) {
      const bLeaf = createChamferedBox({
        width: bx === 0 ? 0.22 : 0.022,
        height: by === 0 ? 0.165 : 0.022,
        depth: 0.095,
        cornerRadius: 0.008,
        material: rcaCharcoalCrinkleMat,
        castShadow: false,
      });
      bLeaf.position.set(bx, 0.115 + by, 0.695);
      bLeaf.rotation.set(rx, ry, 0);
      headPivot.add(bLeaf);
    }

    // Rigid Top Rectangular CRT Electronic Viewfinder + Black Metal Sun-Visor Hood!
    const vfBody = createChamferedBox({
      width: 0.25,
      height: 0.17,
      depth: 0.32,
      cornerRadius: 0.032,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
      material: rcaStudioGrayMat,
      castShadow: false,
    });
    vfBody.position.set(0, 0.305, -0.14);
    const vfSunHood = createChamferedBox({
      width: 0.26,
      height: 0.18,
      depth: 0.14,
      cornerRadius: 0.024,
      material: rcaCharcoalCrinkleMat,
      castShadow: false,
    });
    vfSunHood.position.set(0, 0.31, -0.34);

    // Dual Rear Panning & Twist-Focus Operator Handles w/ Black Rubber Grips!
    for (const hs of [-1, 1] as const) {
      const barCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(hs * 0.15, -0.08, -0.32),
        new THREE.Vector3(hs * 0.24, -0.18, -0.58),
        new THREE.Vector3(hs * 0.28, -0.28, -0.78),
      ]);
      const panBar = new THREE.Mesh(
        new THREE.TubeGeometry(barCurve, 12, 0.013, 8, false),
        aluminumMat,
      );
      const grip = createFilletedShaft({
        radius: 0.022,
        height: 0.18,
        radialSegments: 14,
        centered: true,
        material: blackRubberCableMat,
        castShadow: false,
      });
      grip.position.set(hs * 0.27, -0.25, -0.72);
      grip.rotation.set(0.46, hs * 0.18, 0);
      headPivot.add(panBar, grip);
    }

    // Rectangular Chrome-Trimmed Red `"ON AIR"` Tally Lightbox perched atop front of Viewfinder!
    const tallyHousing = createChamferedBox({
      width: 0.16,
      height: 0.072,
      depth: 0.08,
      cornerRadius: 0.016,
      material: aluminumMat,
      castShadow: false,
    });
    tallyHousing.position.set(0, 0.31, 0.14);

    const tallyMat = new THREE.MeshStandardMaterial({
      color: 0xff2840,
      emissive: 0xff1e38,
      emissiveIntensity: side < 0 ? 2.25 : 0.32,
      roughness: 0.14,
    });
    const tallyLens = createChamferedBox({
      width: 0.135,
      height: 0.052,
      depth: 0.088,
      cornerRadius: 0.012,
      material: tallyMat,
      castShadow: false,
    });
    tallyLens.position.set(0, 0.31, 0.145);

    const tallyHalo = createTungstenBulbHaloSprite({
      scale: 0.28,
      opacity: side < 0 ? 0.74 : 0.1,
      colorHex: 0xff3b5c,
    });
    tallyHalo.position.set(0, 0.32, 0.2);
    (tallyMat.userData as Record<string, unknown>).haloSprite = tallyHalo;

    headPivot.add(
      lowerChassis,
      upperCowling,
      chromeBelt,
      topAccessLid,
      primeLens,
      matteBox,
      frontOpticGlass,
      vfBody,
      vfSunHood,
      tallyHousing,
      tallyLens,
      tallyHalo,
    );
    compactStaticMeshesInGroup(headPivot);
    tkCam.add(headPivot);
    compactStaticMeshesInGroup(tkCam, new Set([headPivot]));
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
  let applauseRemainingSec = 0;
  let baseLightboxScaleX = 0.96;
  let baseLightboxScaleY = 0.96;
  let baseLightboxScaleZ = 0.96;
  let baseCycEmissive = 0.56;
  let baseCoveEmissive = 1.15;

  const applyDimmingToBackdrop = () => {
    cycMat.emissiveIntensity = baseCycEmissive * apertureDimFactor;
    coveBarMat.emissiveIntensity = baseCoveEmissive * apertureDimFactor;
    floorRingGlowMat.emissiveIntensity = 1.05 * apertureDimFactor;
    signFaceMat.color.setScalar(Math.max(0.58, apertureDimFactor));
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

    triggerApplauseSign(durationSec = 2.4): void {
      applauseRemainingSec = Math.max(applauseRemainingSec, Math.max(0.6, durationSec));
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

    setPortraitFraming(isPortrait: boolean, aspect = isPortrait ? 0.52 : 1.6): void {
      if (!isPortrait) {
        // Landscape / Tablet Landscape / Desktop: Full 3-bay wide broadcast proscenium!
        innerMarqueePillars[0].position.set(-2.36, 0, -4.52);
        innerMarqueePillars[1].position.set(2.36, 0, -4.52);
        marqueeCrownGroup.scale.setScalar(1.02);
        signFrame.scale.set(1, 1, 1);
        baseLightboxScaleX = 0.96;
        baseLightboxScaleY = 0.96;
        baseLightboxScaleZ = 0.96;
        onTheAirLightbox.group.position.set(-1.52, 0.01, 0.02);
        applauseLightbox.group.position.set(1.52, 0.01, 0.02);
        onTheAirLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        applauseLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        marqueeStrutShoes[0].position.x = -0.857;
        marqueeStrutShoes[1].position.x = 0.857;
      } else if (aspect >= 0.7) {
        // Tablet Portrait (`768x1024`, `820x1180`): All 3 proscenium lightboxes framed comfortably inside ±1.86m!
        innerMarqueePillars[0].position.set(-1.92, 0, -4.64);
        innerMarqueePillars[1].position.set(1.92, 0, -4.64);
        marqueeCrownGroup.scale.setScalar(0.96);
        signFrame.scale.set(0.82, 0.92, 0.95);
        baseLightboxScaleX = 0.82;
        baseLightboxScaleY = 0.88;
        baseLightboxScaleZ = 0.92;
        onTheAirLightbox.group.position.set(-1.24, 0.01, 0.03);
        applauseLightbox.group.position.set(1.24, 0.01, 0.03);
        onTheAirLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        applauseLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        marqueeStrutShoes[0].position.x = -0.78;
        marqueeStrutShoes[1].position.x = 0.78;
      } else {
        // Phone Portrait (`390x844`, `390x660`): Compact 3-bay proscenium (`ON THE AIR` | Stage Marquee | `APPLAUSE`) inside ±1.17m!
        innerMarqueePillars[0].position.set(-1.66, 0, -4.66);
        innerMarqueePillars[1].position.set(1.66, 0, -4.66);
        marqueeCrownGroup.scale.setScalar(0.94);
        signFrame.scale.set(0.58, 0.78, 0.88);
        baseLightboxScaleX = 0.58;
        baseLightboxScaleY = 0.74;
        baseLightboxScaleZ = 0.86;
        onTheAirLightbox.group.position.set(-0.885, 0.0, 0.03);
        applauseLightbox.group.position.set(0.885, 0.0, 0.03);
        onTheAirLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        applauseLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        marqueeStrutShoes[0].position.x = -0.52;
        marqueeStrutShoes[1].position.x = 0.52;
      }
    },

    update(dtSec: number, elapsedSec: number): void {
      bespokeSet.update(dtSec, elapsedSec);

      // Gentle 1966 Starburst glisten & smooth 4-circuit `#11` incandescent marquee bulb chase + synced 2700K halation!
      crownStarburst.rotation.z = elapsedSec * 0.14;
      const chasePhase = elapsedSec * 4.5;
      for (let g = 0; g < chasingBulbGroups.length; g++) {
        const bulbs = chasingBulbGroups[g];
        for (let b = 0; b < bulbs.length; b++) {
          const wave = 0.5 + 0.5 * Math.sin(chasePhase - b * 0.95 + g * 0.6);
          const dimClamp = Math.max(0.45, apertureDimFactor);
          const emissive = (0.44 + wave * 1.35) * dimClamp;
          bulbs[b].emissiveIntensity = emissive;
          const ud = bulbs[b].userData as {
            haloSprite?: THREE.Sprite;
            haloMat?: THREE.MeshBasicMaterial;
          };
          if (ud.haloSprite) {
            ud.haloSprite.material.opacity = (0.2 + wave * 0.68) * dimClamp;
            const baseS = ((ud.haloSprite.userData as { baseScale?: number }).baseScale ?? 0.22);
            const s = baseS * (0.86 + wave * 0.26);
            ud.haloSprite.scale.set(s, s, 1);
          }
          if (ud.haloMat) {
            ud.haloMat.opacity = (0.2 + wave * 0.68) * dimClamp;
          }
        }
      }

      // Live 3D `ON THE AIR` steady broadcast ruby pulse & Reactive Blinking `APPLAUSE` Studio Lightbox!
      const onAirPulse = 0.92 + 0.08 * Math.sin(elapsedSec * 3.2);
      onTheAirLightbox.faceMat.color.setScalar(onAirPulse * Math.max(0.65, apertureDimFactor));
      onTheAirLightbox.centerGlowHalo.material.opacity = 0.22 * onAirPulse * Math.max(0.55, apertureDimFactor);
      for (let i = 0; i < onTheAirLightbox.bulbHalos.length; i++) {
        const tw = 0.5 + 0.5 * Math.sin(elapsedSec * 5.0 + i * 1.4);
        onTheAirLightbox.bulbHalos[i].material.opacity = (0.36 + tw * 0.44) * Math.max(0.55, apertureDimFactor);
      }

      if (applauseRemainingSec > 0) {
        applauseRemainingSec = Math.max(0, applauseRemainingSec - dtSec);
        // Blink warmly at ~5.6Hz alternating 2700K Neon Amber & Carnaby Crimson!
        const blinkTick = Math.floor(elapsedSec * 11.2);
        const isCrimsonBeat = (blinkTick & 1) === 1;
        const flashWave = 0.68 + 0.32 * Math.abs(Math.sin(elapsedSec * Math.PI * 11.2));
        if (applauseLightbox.altTex) {
          const nextMap = isCrimsonBeat ? applauseLightbox.altTex : applauseLightbox.primaryTex;
          if (applauseLightbox.faceMat.map !== nextMap) {
            applauseLightbox.faceMat.map = nextMap;
            applauseLightbox.faceMat.needsUpdate = true;
          }
        }
        applauseLightbox.faceMat.color.setScalar(0.85 + 0.15 * flashWave);
        applauseLightbox.centerGlowHalo.material.color.setHex(isCrimsonBeat ? 0xff477e : 0xffd56b);
        applauseLightbox.centerGlowHalo.material.opacity = 0.58 * flashWave;
        const pop = 1 + 0.045 * flashWave;
        applauseLightbox.group.scale.set(
          baseLightboxScaleX * pop,
          baseLightboxScaleY * pop,
          baseLightboxScaleZ,
        );
        for (let i = 0; i < applauseLightbox.bulbHalos.length; i++) {
          const on = ((i + blinkTick) & 1) === 0;
          applauseLightbox.bulbHalos[i].material.color.setHex(isCrimsonBeat ? 0xff6b8b : 0xffd56b);
          applauseLightbox.bulbHalos[i].material.opacity = on ? 0.92 : 0.35;
          applauseLightbox.bulbMats[i].emissiveIntensity = on ? 2.4 : 0.7;
        }
      } else {
        if (applauseLightbox.faceMat.map !== applauseLightbox.primaryTex) {
          applauseLightbox.faceMat.map = applauseLightbox.primaryTex;
          applauseLightbox.faceMat.needsUpdate = true;
        }
        const standbyDim = 0.58 * Math.max(0.52, apertureDimFactor);
        applauseLightbox.faceMat.color.setRGB(standbyDim, standbyDim * 0.94, standbyDim * 0.82);
        applauseLightbox.centerGlowHalo.material.color.setHex(0xffd56b);
        applauseLightbox.centerGlowHalo.material.opacity = 0.08 * Math.max(0.5, apertureDimFactor);
        applauseLightbox.group.scale.set(baseLightboxScaleX, baseLightboxScaleY, baseLightboxScaleZ);
        for (let i = 0; i < applauseLightbox.bulbHalos.length; i++) {
          applauseLightbox.bulbHalos[i].material.color.setHex(0xffd56b);
          applauseLightbox.bulbHalos[i].material.opacity = 0.28 * Math.max(0.5, apertureDimFactor);
          applauseLightbox.bulbMats[i].emissiveIntensity = 0.85 * Math.max(0.5, apertureDimFactor);
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
        const tallyHalo = (camTallyMats[c].userData as { haloSprite?: THREE.Sprite }).haloSprite;
        if (tallyHalo) {
          tallyHalo.material.opacity = THREE.MathUtils.clamp(
            (camTallyMats[c].emissiveIntensity - 0.25) * 0.38,
            0.08,
            0.78,
          );
        }
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
      camBadgeTex.dispose();
      onTheAirLightbox.primaryTex.dispose();
      applauseLightbox.primaryTex.dispose();
      applauseLightbox.altTex?.dispose();
      disposeObject3DTree(root);
    },
  };
}
