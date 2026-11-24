// ============================================================================
// WORLD'S SMARTEST v6.0 — 10 Radically Distinct Stage World Theme Catalog
// Implements `StageAtmosphereThemeV6` + Per-Stage HDRI Studio Lightbox Recipes
// ============================================================================

import type { StageAtmosphereThemeV6, StageWorldIdV6 } from '../contracts_v6';

export interface StageHdriEmitterBoxV6 {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  colorHex: number;
  /** Emissive HDR luminance multiplier (typically 1.8 .. 6.5 for crisp metallic highlights). */
  intensity: number;
  shape?: 'BOX' | 'DISC' | 'RING';
}

export interface StageEngineVisualRecipeV6 {
  stageId: StageWorldIdV6;
  exposure: number;
  envMapIntensity: number;
  skyHorizonHex: number;
  skyZenithHex: number;
  skyNadirHex: number;
  fillLightHex: number;
  fillIntensity: number;
  hemisphereSkyHex: number;
  hemisphereGroundHex: number;
  hemisphereIntensity: number;
  keyPosition: [number, number, number];
  rimPosition: [number, number, number];
  fillPosition: [number, number, number];
  /** Virtual studio lightbox emitters baked per-stage via `PMREMGenerator`. */
  hdriWallColorHex: number;
  hdriFloorBounceHex: number;
  hdriEmitters: ReadonlyArray<StageHdriEmitterBoxV6>;
  /** Trapdoor rim & pit illumination tailored to the venue. */
  trapdoorFrameHex: number;
  trapdoorHazardHex: number;
  pitBeaconHex: number;
  /** Concise architectural tagline for world-tour HUD / camera telemetry. */
  architecturalSignature: string;
}

export const STAGE_WORLD_ORDER_V6: readonly StageWorldIdV6[] = [
  'STAGE_01_VAUDEVILLE_PALACE',
  'STAGE_02_GENEVA_CONSERVATORY',
  'STAGE_03_MONTE_CARLO_SALON',
  'STAGE_04_CARTOGRAPHIC_ROTUNDA',
  'STAGE_05_ANALOG_BUNKER_1969',
  'STAGE_06_KYOTO_LACQUER_PAVILION',
  'STAGE_07_CARNIVAL_CURIOSITIES',
  'STAGE_08_SUNKEN_BATHYSPHERE',
  'STAGE_09_ASTRAL_OBSERVATORY',
  'STAGE_10_SOVEREIGN_COLOSSEUM',
] as const;

export const STAGE_THEMES_V6: Readonly<Record<StageWorldIdV6, StageAtmosphereThemeV6>> = {
  STAGE_01_VAUDEVILLE_PALACE: {
    stageId: 'STAGE_01_VAUDEVILLE_PALACE',
    stageNumber: 1,
    title: 'The Vaudeville Palace',
    eraSubtitle: '1928 Broadway • Mahogany & Edison Brass',
    difficultyBand: [1.0, 1.9],
    symphonyTrack: 'curtain_overture',
    materials: {
      floorColorHex: 0x5c2c18,
      floorRoughness: 0.42,
      floorMetalness: 0.06,
      trimMetalHex: 0xd9a74a,
      trimRoughness: 0.24,
      trimMetalness: 0.92,
      stoneOrWoodHex: 0x7c1422,
      jewelPrimaryHex: 0xf4be4e,
      jewelSecondaryHex: 0xb81d34,
    },
    lighting: {
      skyTopHex: 0x16090c,
      fogHex: 0x1a0b0e,
      fogDensity: 0.024,
      keyLightHex: 0xffd28e,
      keyIntensity: 3.1,
      rimLightHex: 0xff6e4a,
      rimIntensity: 1.45,
      ambientHex: 0x3b1a1c,
      particleKind: 'GOLDEN_DUST',
    },
    hudTheme: {
      surfaceCss: 'rgba(28, 12, 14, 0.88)',
      borderCss: 'rgba(224, 178, 86, 0.58)',
      accentCss: '#f4c059',
      badgeBgCss: '#8c1628',
      badgeTextCss: '#fff6e0',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_02_GENEVA_CONSERVATORY: {
    stageId: 'STAGE_02_GENEVA_CONSERVATORY',
    stageNumber: 2,
    title: 'Geneva Horology Conservatory',
    eraSubtitle: '1911 Lake Léman • Carrara Marble & Rose Gold',
    difficultyBand: [2.0, 2.9],
    symphonyTrack: 'geneva_horology',
    materials: {
      floorColorHex: 0xe9e6df,
      floorRoughness: 0.22,
      floorMetalness: 0.04,
      trimMetalHex: 0xe39e7a,
      trimRoughness: 0.2,
      trimMetalness: 0.94,
      stoneOrWoodHex: 0x2c4257,
      jewelPrimaryHex: 0x3b6cb8,
      jewelSecondaryHex: 0xc93556,
    },
    lighting: {
      skyTopHex: 0x87b4d9,
      fogHex: 0xcfe0ec,
      fogDensity: 0.015,
      keyLightHex: 0xfff7e6,
      keyIntensity: 3.4,
      rimLightHex: 0x9ac8f4,
      rimIntensity: 1.6,
      ambientHex: 0xaabed1,
      particleKind: 'SUNBEAM_POLLEN',
    },
    hudTheme: {
      surfaceCss: 'rgba(23, 33, 46, 0.86)',
      borderCss: 'rgba(229, 162, 128, 0.62)',
      accentCss: '#ebb08f',
      badgeBgCss: '#23446d',
      badgeTextCss: '#f8f6f1',
      fontHeadingFamily: '"Cinzel", "Times New Roman", serif',
    },
  },

  STAGE_03_MONTE_CARLO_SALON: {
    stageId: 'STAGE_03_MONTE_CARLO_SALON',
    stageNumber: 3,
    title: 'Monte Carlo Grand Salon',
    eraSubtitle: '1962 Riviera • Emerald Baize & Crystal Prisms',
    difficultyBand: [3.0, 3.9],
    symphonyTrack: 'riviera_caprice',
    materials: {
      floorColorHex: 0x0d5c3e,
      floorRoughness: 0.88,
      floorMetalness: 0.02,
      trimMetalHex: 0xe2bc66,
      trimRoughness: 0.18,
      trimMetalness: 0.95,
      stoneOrWoodHex: 0x4b2a19,
      jewelPrimaryHex: 0x1bb87b,
      jewelSecondaryHex: 0xf5d47a,
    },
    lighting: {
      skyTopHex: 0x0a172e,
      fogHex: 0x0d1b2a,
      fogDensity: 0.02,
      keyLightHex: 0xffe4b3,
      keyIntensity: 3.0,
      rimLightHex: 0x5ea2ff,
      rimIntensity: 1.55,
      ambientHex: 0x18342e,
      particleKind: 'CHAMPAGNE_SPARKLE',
    },
    hudTheme: {
      surfaceCss: 'rgba(11, 31, 26, 0.88)',
      borderCss: 'rgba(226, 188, 102, 0.6)',
      accentCss: '#f3d179',
      badgeBgCss: '#0f6a47',
      badgeTextCss: '#fff9ea',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_04_CARTOGRAPHIC_ROTUNDA: {
    stageId: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    stageNumber: 4,
    title: 'Cartographic Rotunda',
    eraSubtitle: '1894 Royal Geographic • Teak & Verdigris Copper',
    difficultyBand: [4.0, 4.9],
    symphonyTrack: 'explorer_odyssey',
    materials: {
      floorColorHex: 0x6f4a28,
      floorRoughness: 0.56,
      floorMetalness: 0.05,
      trimMetalHex: 0x4ca18d,
      trimRoughness: 0.36,
      trimMetalness: 0.82,
      stoneOrWoodHex: 0xb67a42,
      jewelPrimaryHex: 0x2a76c9,
      jewelSecondaryHex: 0xf4b64c,
    },
    lighting: {
      skyTopHex: 0x0f202c,
      fogHex: 0x14262e,
      fogDensity: 0.021,
      keyLightHex: 0xffc677,
      keyIntensity: 2.95,
      rimLightHex: 0x56c9b4,
      rimIntensity: 1.5,
      ambientHex: 0x243b3f,
      particleKind: 'COMPASS_FIREFLIES',
    },
    hudTheme: {
      surfaceCss: 'rgba(17, 30, 36, 0.88)',
      borderCss: 'rgba(92, 184, 160, 0.58)',
      accentCss: '#f0b95b',
      badgeBgCss: '#1e5b59',
      badgeTextCss: '#f8f2e4',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_05_ANALOG_BUNKER_1969: {
    stageId: 'STAGE_05_ANALOG_BUNKER_1969',
    stageNumber: 5,
    title: 'Analog Telemetry Bunker 1969',
    eraSubtitle: '1969 Bell Labs • Olive Steel, Nixie & Radar',
    difficultyBand: [5.0, 5.9],
    symphonyTrack: 'bunker_espionage',
    materials: {
      floorColorHex: 0x3b4238,
      floorRoughness: 0.52,
      floorMetalness: 0.62,
      trimMetalHex: 0x8e958a,
      trimRoughness: 0.34,
      trimMetalness: 0.88,
      stoneOrWoodHex: 0x2b312a,
      jewelPrimaryHex: 0xff7020,
      jewelSecondaryHex: 0x3ee878,
    },
    lighting: {
      skyTopHex: 0x0c110d,
      fogHex: 0x111713,
      fogDensity: 0.026,
      keyLightHex: 0xdfe8d8,
      keyIntensity: 2.45,
      rimLightHex: 0xff7b28,
      rimIntensity: 1.95,
      ambientHex: 0x1e2c22,
      particleKind: 'OSCILLOSCOPE_STATIC',
    },
    hudTheme: {
      surfaceCss: 'rgba(20, 25, 21, 0.90)',
      borderCss: 'rgba(255, 128, 42, 0.56)',
      accentCss: '#ff8a38',
      badgeBgCss: '#1f4d2e',
      badgeTextCss: '#c9ffd9',
      fontHeadingFamily: '"JetBrains Mono", ui-monospace, monospace',
    },
  },

  STAGE_06_KYOTO_LACQUER_PAVILION: {
    stageId: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    stageNumber: 6,
    title: 'Kyoto Urushi Pavilion',
    eraSubtitle: 'Edo Artisans • Vermilion Lacquer & Kintsugi Gold',
    difficultyBand: [6.0, 6.9],
    symphonyTrack: 'kyoto_nocturne',
    materials: {
      floorColorHex: 0x151112,
      floorRoughness: 0.08,
      floorMetalness: 0.14,
      trimMetalHex: 0xf1c250,
      trimRoughness: 0.2,
      trimMetalness: 0.96,
      stoneOrWoodHex: 0xb62418,
      jewelPrimaryHex: 0xd9301e,
      jewelSecondaryHex: 0xffcf64,
    },
    lighting: {
      skyTopHex: 0x0a1020,
      fogHex: 0x111420,
      fogDensity: 0.022,
      keyLightHex: 0xffd796,
      keyIntensity: 2.7,
      rimLightHex: 0xe6432b,
      rimIntensity: 1.75,
      ambientHex: 0x221922,
      particleKind: 'LANTERN_EMBERS',
    },
    hudTheme: {
      surfaceCss: 'rgba(18, 12, 14, 0.90)',
      borderCss: 'rgba(241, 194, 80, 0.62)',
      accentCss: '#f7c95c',
      badgeBgCss: '#a62116',
      badgeTextCss: '#fff5df',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_07_CARNIVAL_CURIOSITIES: {
    stageId: 'STAGE_07_CARNIVAL_CURIOSITIES',
    stageNumber: 7,
    title: 'Midnight Pier of Curiosities',
    eraSubtitle: '1934 Atlantic Boardwalk • Copper Calliope & Marquee',
    difficultyBand: [7.0, 7.9],
    symphonyTrack: 'carnival_accelerando',
    materials: {
      floorColorHex: 0x2b2c32,
      floorRoughness: 0.44,
      floorMetalness: 0.1,
      trimMetalHex: 0xd47746,
      trimRoughness: 0.25,
      trimMetalness: 0.92,
      stoneOrWoodHex: 0x41322a,
      jewelPrimaryHex: 0xe62b4f,
      jewelSecondaryHex: 0x26d1c6,
    },
    lighting: {
      skyTopHex: 0x09131d,
      fogHex: 0x10202b,
      fogDensity: 0.028,
      keyLightHex: 0xffcb80,
      keyIntensity: 2.75,
      rimLightHex: 0x28d6cc,
      rimIntensity: 1.85,
      ambientHex: 0x1b2b38,
      particleKind: 'COASTAL_MIST_BULBS',
    },
    hudTheme: {
      surfaceCss: 'rgba(13, 22, 30, 0.89)',
      borderCss: 'rgba(222, 126, 74, 0.62)',
      accentCss: '#33dfd4',
      badgeBgCss: '#9e1c38',
      badgeTextCss: '#fff4e6',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_08_SUNKEN_BATHYSPHERE: {
    stageId: 'STAGE_08_SUNKEN_BATHYSPHERE',
    stageNumber: 8,
    title: 'The Sunken Bathysphere',
    eraSubtitle: '1954 Abyssal Trench • Basalt, Bronze & Caustics',
    difficultyBand: [8.0, 8.6],
    symphonyTrack: 'bathysphere_cathedral',
    materials: {
      floorColorHex: 0x1e282d,
      floorRoughness: 0.28,
      floorMetalness: 0.16,
      trimMetalHex: 0xb37b42,
      trimRoughness: 0.3,
      trimMetalness: 0.9,
      stoneOrWoodHex: 0x27353c,
      jewelPrimaryHex: 0x2de2d6,
      jewelSecondaryHex: 0xe59c4d,
    },
    lighting: {
      skyTopHex: 0x031824,
      fogHex: 0x062330,
      fogDensity: 0.029,
      keyLightHex: 0x7ef2ec,
      keyIntensity: 2.8,
      rimLightHex: 0xffa652,
      rimIntensity: 1.7,
      ambientHex: 0x0d3645,
      particleKind: 'ABYSSAL_CAUSTIC_BUBBLES',
    },
    hudTheme: {
      surfaceCss: 'rgba(6, 26, 36, 0.89)',
      borderCss: 'rgba(92, 218, 212, 0.56)',
      accentCss: '#5bece4',
      badgeBgCss: '#8c5a27',
      badgeTextCss: '#effcff',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_09_ASTRAL_OBSERVATORY: {
    stageId: 'STAGE_09_ASTRAL_OBSERVATORY',
    stageNumber: 9,
    title: 'Arctic Astral Observatory',
    eraSubtitle: 'Tromsø Zenith • Hammered Copper, Alabaster & Aurora',
    difficultyBand: [8.7, 9.3],
    symphonyTrack: 'astral_storm_presto',
    materials: {
      floorColorHex: 0xdedbe4,
      floorRoughness: 0.24,
      floorMetalness: 0.06,
      trimMetalHex: 0xc97344,
      trimRoughness: 0.24,
      trimMetalness: 0.93,
      stoneOrWoodHex: 0x353c52,
      jewelPrimaryHex: 0x45f0a8,
      jewelSecondaryHex: 0x9970ff,
    },
    lighting: {
      skyTopHex: 0x060b1c,
      fogHex: 0x0c162b,
      fogDensity: 0.016,
      keyLightHex: 0xdff7ff,
      keyIntensity: 2.85,
      rimLightHex: 0x47f0a6,
      rimIntensity: 2.0,
      ambientHex: 0x263858,
      particleKind: 'AURORA_STARDUST',
    },
    hudTheme: {
      surfaceCss: 'rgba(12, 18, 36, 0.87)',
      borderCss: 'rgba(104, 240, 178, 0.56)',
      accentCss: '#63f2b6',
      badgeBgCss: '#3c2d73',
      badgeTextCss: '#f3f7ff',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },

  STAGE_10_SOVEREIGN_COLOSSEUM: {
    stageId: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    stageNumber: 10,
    title: 'The Sovereign Colosseum',
    eraSubtitle: 'Grand Championship • Nero Marble, Fire & 24k Gold',
    difficultyBand: [9.4, 10.0],
    symphonyTrack: 'colosseum_finale',
    materials: {
      floorColorHex: 0x16161a,
      floorRoughness: 0.16,
      floorMetalness: 0.12,
      trimMetalHex: 0xf4c44e,
      trimRoughness: 0.16,
      trimMetalness: 0.98,
      stoneOrWoodHex: 0x211f24,
      jewelPrimaryHex: 0xffb732,
      jewelSecondaryHex: 0xff4b1f,
    },
    lighting: {
      skyTopHex: 0x0c070a,
      fogHex: 0x170d0a,
      fogDensity: 0.02,
      keyLightHex: 0xffe0a8,
      keyIntensity: 3.35,
      rimLightHex: 0xff6b24,
      rimIntensity: 2.25,
      ambientHex: 0x2e1a12,
      particleKind: 'COLOSSEUM_FIRE_SPARKS',
    },
    hudTheme: {
      surfaceCss: 'rgba(18, 13, 12, 0.90)',
      borderCss: 'rgba(244, 196, 78, 0.68)',
      accentCss: '#ffd05b',
      badgeBgCss: '#9e3810',
      badgeTextCss: '#fff7e0',
      fontHeadingFamily: '"Cinzel", Georgia, serif',
    },
  },
};

export const STAGE_VISUAL_RECIPES_V6: Readonly<Record<StageWorldIdV6, StageEngineVisualRecipeV6>> = {
  STAGE_01_VAUDEVILLE_PALACE: {
    stageId: 'STAGE_01_VAUDEVILLE_PALACE',
    exposure: 1.12,
    envMapIntensity: 1.25,
    skyHorizonHex: 0x301116,
    skyZenithHex: 0x100507,
    skyNadirHex: 0x1b0b08,
    fillLightHex: 0x99283a,
    fillIntensity: 0.95,
    hemisphereSkyHex: 0xffcf94,
    hemisphereGroundHex: 0x451a12,
    hemisphereIntensity: 0.72,
    keyPosition: [4.5, 9.2, 6.4],
    rimPosition: [-5.8, 6.2, -6.5],
    fillPosition: [-6.0, 3.6, 5.2],
    hdriWallColorHex: 0x1c080c,
    hdriFloorBounceHex: 0x3c1b0e,
    hdriEmitters: [
      { position: [0, 8.5, 4.5], scale: [10, 0.6, 2.2], colorHex: 0xffd28b, intensity: 4.8 },
      { position: [0, 0.9, 9.5], scale: [12, 0.55, 0.5], colorHex: 0xffa74d, intensity: 5.5 },
      { position: [-9.2, 4.5, 0], scale: [0.5, 5.5, 7], colorHex: 0xb22238, intensity: 2.1 },
      { position: [9.2, 4.5, 0], scale: [0.5, 5.5, 7], colorHex: 0xdba54d, intensity: 2.6 },
      { position: [0, 6.5, -8.5], scale: [9, 1.5, 0.5], colorHex: 0xff8a54, intensity: 3.2 },
    ],
    trapdoorFrameHex: 0xd9a74a,
    trapdoorHazardHex: 0xc22a2a,
    pitBeaconHex: 0xff6e2e,
    architecturalSignature: '1928 Broadway Gilded Proscenium, Pleated Crimson Velvet & Edison Footlights',
  },

  STAGE_02_GENEVA_CONSERVATORY: {
    stageId: 'STAGE_02_GENEVA_CONSERVATORY',
    exposure: 1.15,
    envMapIntensity: 1.35,
    skyHorizonHex: 0xdeecf7,
    skyZenithHex: 0x629ad0,
    skyNadirHex: 0xd4cec4,
    fillLightHex: 0xcbe3fa,
    fillIntensity: 1.2,
    hemisphereSkyHex: 0xf4f9ff,
    hemisphereGroundHex: 0xc8b5a2,
    hemisphereIntensity: 1.05,
    keyPosition: [6.2, 11.0, 5.8],
    rimPosition: [-6.5, 8.5, -5.5],
    fillPosition: [-5.5, 5.0, 6.0],
    hdriWallColorHex: 0x7b96ad,
    hdriFloorBounceHex: 0xd8d2c6,
    hdriEmitters: [
      { position: [2.5, 9.8, 1.5], scale: [7.5, 0.4, 7.5], colorHex: 0xfff8e8, intensity: 5.4, shape: 'DISC' },
      { position: [-7.5, 6.8, -3.0], scale: [0.5, 5.0, 9.0], colorHex: 0xaad4ff, intensity: 3.4 },
      { position: [8.0, 5.5, 2.0], scale: [0.5, 4.5, 8.0], colorHex: 0xffd5b0, intensity: 3.8 },
      { position: [0, 6.5, -9.0], scale: [10.0, 3.5, 0.5], colorHex: 0xdceeff, intensity: 3.2 },
    ],
    trapdoorFrameHex: 0xe39e7a,
    trapdoorHazardHex: 0x2b5a9e,
    pitBeaconHex: 0xffa85c,
    architecturalSignature: 'Carrara Marble Compass Deck, Glass Conservatory Dome & Giant Rose-Gold Tourbillon',
  },

  STAGE_03_MONTE_CARLO_SALON: {
    stageId: 'STAGE_03_MONTE_CARLO_SALON',
    exposure: 1.16,
    envMapIntensity: 1.4,
    skyHorizonHex: 0x162a48,
    skyZenithHex: 0x071022,
    skyNadirHex: 0x0a291e,
    fillLightHex: 0x3b6cb5,
    fillIntensity: 0.9,
    hemisphereSkyHex: 0xffebc2,
    hemisphereGroundHex: 0x0d3d29,
    hemisphereIntensity: 0.78,
    keyPosition: [0.8, 10.2, 4.8],
    rimPosition: [-6.4, 6.4, -6.4],
    fillPosition: [6.4, 4.2, 5.2],
    hdriWallColorHex: 0x0e1d26,
    hdriFloorBounceHex: 0x0c422c,
    hdriEmitters: [
      { position: [0, 9.2, 0], scale: [6.5, 0.6, 6.5], colorHex: 0xffeac2, intensity: 6.2, shape: 'RING' },
      { position: [-8.5, 5.0, -4.5], scale: [0.5, 6.0, 5.0], colorHex: 0x558ce6, intensity: 3.0 },
      { position: [8.5, 5.0, -4.5], scale: [0.5, 6.0, 5.0], colorHex: 0x558ce6, intensity: 3.0 },
      { position: [0, 3.8, 9.2], scale: [10.0, 1.4, 0.5], colorHex: 0xf4cf82, intensity: 3.2 },
    ],
    trapdoorFrameHex: 0xe2bc66,
    trapdoorHazardHex: 0xc92a3e,
    pitBeaconHex: 0xffc857,
    architecturalSignature: '1962 Riviera Emerald Baize, Walnut Burl Rails & Tiered Crystal Chandelier',
  },

  STAGE_04_CARTOGRAPHIC_ROTUNDA: {
    stageId: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    exposure: 1.14,
    envMapIntensity: 1.3,
    skyHorizonHex: 0x1e3842,
    skyZenithHex: 0x09161f,
    skyNadirHex: 0x2b1d12,
    fillLightHex: 0x43a89a,
    fillIntensity: 1.0,
    hemisphereSkyHex: 0xa4dbd6,
    hemisphereGroundHex: 0x4c3119,
    hemisphereIntensity: 0.76,
    keyPosition: [4.8, 8.8, 5.6],
    rimPosition: [-6.0, 6.8, -5.8],
    fillPosition: [-5.8, 4.0, 4.8],
    hdriWallColorHex: 0x102229,
    hdriFloorBounceHex: 0x452f1b,
    hdriEmitters: [
      { position: [-4.5, 7.2, 3.5], scale: [2.2, 2.2, 2.2], colorHex: 0xffbf66, intensity: 5.5, shape: 'DISC' },
      { position: [4.5, 7.2, 3.5], scale: [2.2, 2.2, 2.2], colorHex: 0xffbf66, intensity: 5.5, shape: 'DISC' },
      { position: [0, 9.5, -2.0], scale: [8.0, 0.4, 8.0], colorHex: 0x54bfae, intensity: 3.1, shape: 'RING' },
      { position: [0, 4.5, -9.0], scale: [9.0, 2.2, 0.5], colorHex: 0x2d77c4, intensity: 2.8 },
    ],
    trapdoorFrameHex: 0xb67a42,
    trapdoorHazardHex: 0xd98f2b,
    pitBeaconHex: 0xffa73d,
    architecturalSignature: 'Caulked Teak Deck, Verdigris Copper Astrolabe Arches & Gimbaled Ship Lanterns',
  },

  STAGE_05_ANALOG_BUNKER_1969: {
    stageId: 'STAGE_05_ANALOG_BUNKER_1969',
    exposure: 1.15,
    envMapIntensity: 1.22,
    skyHorizonHex: 0x18211b,
    skyZenithHex: 0x090e0b,
    skyNadirHex: 0x141713,
    fillLightHex: 0x3de07a,
    fillIntensity: 0.85,
    hemisphereSkyHex: 0xc2d4c0,
    hemisphereGroundHex: 0x262922,
    hemisphereIntensity: 0.65,
    keyPosition: [2.5, 8.6, 5.2],
    rimPosition: [-6.2, 5.2, -5.0],
    fillPosition: [6.4, 3.8, -3.5],
    hdriWallColorHex: 0x161b16,
    hdriFloorBounceHex: 0x222620,
    hdriEmitters: [
      { position: [0, 9.0, 2.0], scale: [9.5, 0.45, 1.4], colorHex: 0xe6f0de, intensity: 4.6 },
      { position: [-8.2, 3.6, -2.5], scale: [0.5, 3.2, 7.0], colorHex: 0xff7020, intensity: 4.8 },
      { position: [8.2, 3.6, -2.5], scale: [0.5, 3.0, 6.0], colorHex: 0x3be67a, intensity: 3.6 },
      { position: [0, 2.5, 9.2], scale: [8.0, 1.0, 0.5], colorHex: 0xff9a44, intensity: 2.2 },
    ],
    trapdoorFrameHex: 0x7e8579,
    trapdoorHazardHex: 0xff741c,
    pitBeaconHex: 0xff4818,
    architecturalSignature: '1969 Olive-Steel Telemetry Racks, Live Orange Nixie Banks, Tape Reels & Radar Scope',
  },

  STAGE_06_KYOTO_LACQUER_PAVILION: {
    stageId: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    exposure: 1.16,
    envMapIntensity: 1.48,
    skyHorizonHex: 0x1e1828,
    skyZenithHex: 0x080d1c,
    skyNadirHex: 0x09080a,
    fillLightHex: 0xffae4a,
    fillIntensity: 1.05,
    hemisphereSkyHex: 0x8ea4d6,
    hemisphereGroundHex: 0x4f1712,
    hemisphereIntensity: 0.66,
    keyPosition: [4.2, 8.8, 5.5],
    rimPosition: [-5.8, 5.8, -6.5],
    fillPosition: [-6.0, 3.0, 3.2],
    hdriWallColorHex: 0x0d0b12,
    hdriFloorBounceHex: 0x240b09,
    hdriEmitters: [
      { position: [-7.5, 3.8, -4.5], scale: [0.6, 5.5, 6.0], colorHex: 0xffc66e, intensity: 5.2 },
      { position: [7.5, 3.8, -4.5], scale: [0.6, 5.5, 6.0], colorHex: 0xffc66e, intensity: 5.2 },
      { position: [0, 8.8, -3.5], scale: [10.0, 0.7, 2.5], colorHex: 0xd93524, intensity: 3.1 },
      { position: [0, 9.6, 4.5], scale: [4.5, 0.5, 4.5], colorHex: 0xc9dcff, intensity: 3.4, shape: 'DISC' },
    ],
    trapdoorFrameHex: 0xf1c250,
    trapdoorHazardHex: 0xc9261a,
    pitBeaconHex: 0xff7e33,
    architecturalSignature: 'Mirror Urushi Lacquer & Gold Kintsugi Deck Over Dark Water Shoji Lantern Moat',
  },

  STAGE_07_CARNIVAL_CURIOSITIES: {
    stageId: 'STAGE_07_CARNIVAL_CURIOSITIES',
    exposure: 1.18,
    envMapIntensity: 1.32,
    skyHorizonHex: 0x162d3c,
    skyZenithHex: 0x07101a,
    skyNadirHex: 0x14171c,
    fillLightHex: 0xe6355a,
    fillIntensity: 1.05,
    hemisphereSkyHex: 0x76d6d2,
    hemisphereGroundHex: 0x452019,
    hemisphereIntensity: 0.72,
    keyPosition: [4.5, 8.6, 6.0],
    rimPosition: [-6.5, 6.5, -5.5],
    fillPosition: [6.5, 4.5, -4.0],
    hdriWallColorHex: 0x0d1b24,
    hdriFloorBounceHex: 0x211a18,
    hdriEmitters: [
      { position: [0, 7.8, -6.5], scale: [11.0, 1.4, 0.6], colorHex: 0xffc966, intensity: 5.0 },
      { position: [-8.2, 4.5, 1.5], scale: [0.6, 4.5, 7.5], colorHex: 0xf02e56, intensity: 4.2 },
      { position: [8.2, 4.5, 1.5], scale: [0.6, 4.5, 7.5], colorHex: 0x26dfd4, intensity: 4.2 },
      { position: [0, 9.4, 3.5], scale: [6.0, 0.5, 3.0], colorHex: 0xffe4b8, intensity: 3.6 },
    ],
    trapdoorFrameHex: 0xd47746,
    trapdoorHazardHex: 0xe62b4f,
    pitBeaconHex: 0xff425c,
    architecturalSignature: 'Midnight Pier Planks, Hammered-Copper Calliope Pipes & Chasing Marquee Arches',
  },

  STAGE_08_SUNKEN_BATHYSPHERE: {
    stageId: 'STAGE_08_SUNKEN_BATHYSPHERE',
    exposure: 1.18,
    envMapIntensity: 1.38,
    skyHorizonHex: 0x093b4c,
    skyZenithHex: 0x031a26,
    skyNadirHex: 0x081318,
    fillLightHex: 0xe89844,
    fillIntensity: 1.0,
    hemisphereSkyHex: 0x62ede6,
    hemisphereGroundHex: 0x2e2116,
    hemisphereIntensity: 0.8,
    keyPosition: [2.2, 10.5, 3.8],
    rimPosition: [-6.0, 5.5, -6.0],
    fillPosition: [6.2, 3.5, 5.0],
    hdriWallColorHex: 0x06202b,
    hdriFloorBounceHex: 0x162226,
    hdriEmitters: [
      { position: [0, 9.6, 0], scale: [9.0, 0.4, 9.0], colorHex: 0x52f0ea, intensity: 5.2, shape: 'DISC' },
      { position: [-8.5, 4.2, -3.0], scale: [0.6, 4.2, 4.2], colorHex: 0x25c4d6, intensity: 4.4, shape: 'DISC' },
      { position: [8.5, 4.2, -3.0], scale: [0.6, 4.2, 4.2], colorHex: 0x25c4d6, intensity: 4.4, shape: 'DISC' },
      { position: [0, 2.2, 9.0], scale: [9.5, 1.2, 0.5], colorHex: 0xffa44c, intensity: 3.5 },
    ],
    trapdoorFrameHex: 0xb37b42,
    trapdoorHazardHex: 0x2de2d6,
    pitBeaconHex: 0xff8c38,
    architecturalSignature: 'Wet Volcanic Basalt, Riveted Cast-Bronze Portholes & Voronoi Abyssal Caustics',
  },

  STAGE_09_ASTRAL_OBSERVATORY: {
    stageId: 'STAGE_09_ASTRAL_OBSERVATORY',
    exposure: 1.16,
    envMapIntensity: 1.42,
    skyHorizonHex: 0x142642,
    skyZenithHex: 0x050918,
    skyNadirHex: 0x20222e,
    fillLightHex: 0x9970ff,
    fillIntensity: 1.1,
    hemisphereSkyHex: 0x92f7cf,
    hemisphereGroundHex: 0x5a4036,
    hemisphereIntensity: 0.85,
    keyPosition: [5.0, 10.0, 5.5],
    rimPosition: [-5.5, 7.5, -6.5],
    fillPosition: [6.0, 5.2, -4.5],
    hdriWallColorHex: 0x0c1528,
    hdriFloorBounceHex: 0x5c5c6b,
    hdriEmitters: [
      { position: [-2.0, 9.2, -3.5], scale: [12.0, 0.6, 3.0], colorHex: 0x42f5a8, intensity: 5.2 },
      { position: [3.0, 8.6, -5.5], scale: [10.0, 0.6, 2.6], colorHex: 0x996bff, intensity: 4.5 },
      { position: [6.5, 5.5, 4.5], scale: [3.5, 3.5, 0.5], colorHex: 0xfff0db, intensity: 4.4 },
      { position: [-8.0, 4.0, 2.5], scale: [0.5, 4.0, 6.0], colorHex: 0xd9804c, intensity: 2.8 },
    ],
    trapdoorFrameHex: 0xc97344,
    trapdoorHazardHex: 0x45f0a8,
    pitBeaconHex: 0xa274ff,
    architecturalSignature: 'Alabaster Ring, Open Hammered-Copper Dome, Optical Prisms & Live GLSL Aurora',
  },

  STAGE_10_SOVEREIGN_COLOSSEUM: {
    stageId: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    exposure: 1.18,
    envMapIntensity: 1.52,
    skyHorizonHex: 0x2b140d,
    skyZenithHex: 0x080507,
    skyNadirHex: 0x100d0d,
    fillLightHex: 0xff5a1f,
    fillIntensity: 1.15,
    hemisphereSkyHex: 0xffd584,
    hemisphereGroundHex: 0x3b180c,
    hemisphereIntensity: 0.72,
    keyPosition: [3.2, 10.6, 5.2],
    rimPosition: [0.0, 6.8, -8.2],
    fillPosition: [-6.5, 3.2, 4.5],
    hdriWallColorHex: 0x110b0a,
    hdriFloorBounceHex: 0x201812,
    hdriEmitters: [
      { position: [0, 9.6, 1.5], scale: [7.5, 0.5, 7.5], colorHex: 0xffe09e, intensity: 6.0, shape: 'RING' },
      { position: [-8.5, 3.0, -3.5], scale: [1.4, 3.6, 1.4], colorHex: 0xff6b22, intensity: 5.8 },
      { position: [8.5, 3.0, -3.5], scale: [1.4, 3.6, 1.4], colorHex: 0xff6b22, intensity: 5.8 },
      { position: [0, 5.2, -9.0], scale: [9.0, 2.2, 0.5], colorHex: 0xf6c344, intensity: 4.5 },
    ],
    trapdoorFrameHex: 0xf4c44e,
    trapdoorHazardHex: 0xff4b1f,
    pitBeaconHex: 0xff521b,
    architecturalSignature: 'Veined Nero-Gold Marble Colonnade, Flickering Bronze Braziers & 24k Gold Altar',
  },
};

export function getStageThemeV6(stageId: StageWorldIdV6): StageAtmosphereThemeV6 {
  return STAGE_THEMES_V6[stageId];
}

export function getStageThemeByNumberV6(stageNumber: number): StageAtmosphereThemeV6 {
  const clamped = Math.max(1, Math.min(STAGE_WORLD_ORDER_V6.length, Math.round(stageNumber)));
  return STAGE_THEMES_V6[STAGE_WORLD_ORDER_V6[clamped - 1]];
}

export function getStageVisualRecipeV6(stageId: StageWorldIdV6): StageEngineVisualRecipeV6 {
  return STAGE_VISUAL_RECIPES_V6[stageId];
}

/**
 * Applies the active Stage World's distinct HUD trim CSS custom properties
 * cleanly to `:root` or a target container so UI chrome harmonizes with the 3D venue.
 */
export function applyStageHudThemeCssVars(
  theme: StageAtmosphereThemeV6,
  targetEl?: HTMLElement | null
): void {
  const el = targetEl ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return;
  el.style.setProperty('--v6-stage-surface', theme.hudTheme.surfaceCss);
  el.style.setProperty('--v6-stage-border', theme.hudTheme.borderCss);
  el.style.setProperty('--v6-stage-accent', theme.hudTheme.accentCss);
  el.style.setProperty('--v6-stage-badge-bg', theme.hudTheme.badgeBgCss);
  el.style.setProperty('--v6-stage-badge-text', theme.hudTheme.badgeTextCss);
  el.style.setProperty('--v6-stage-heading-font', theme.hudTheme.fontHeadingFamily);
  el.dataset.stageWorld = theme.stageId;
}
