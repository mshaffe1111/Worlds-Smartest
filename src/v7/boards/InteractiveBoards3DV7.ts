// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master — 1966 LIVING COLOR)
// `src/v7/boards/InteractiveBoards3DV7.ts`
// All 12 Kinetic 1966 "In Living Color" Backlit Acrylite & Motorized 3-Sided
// Trilon Tote Boards, Giant Native Portrait (`9:16`) & Tablet (`3:4`) Reflow,
// Perimeter Chasing `#11` Incandescent Marquee Bulbs, `1024x512` Ultra-HD
// Living Color Plaques, 5 Iconic 1960s TV Twists (Locked Vault, Secret Square,
// Rival's Pick, Mystery Curtain, TV Showcase Bonus), & Zero Corner Z-Fighting!
// ============================================================================

import * as THREE from 'three';
import {
  ALL_CATEGORIES_V7,
  CATEGORY_TO_DOMAIN_V7,
  DOMAIN_SPECS_V7,
  type BoardIdV7,
  type BoardLoadSpec,
  type BoardPlayModeV9,
  type BoardTileNodeV7,
  type BoardTwistIdV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type ClassicTvTileTwistV9,
  type DomainIdV7,
  type RivalIdV7,
  type SeasonIdV7,
  type SeasonVisualSpecV9,
  type StageWorldIdV7,
  type VibePackIdV9,
} from '../contracts_v7';
import {
  BOARD_MODE_RULE_BANNERS_V7,
  BOARD_MODE_RULE_BANNERS_V9,
  BOARD_PLAY_MODE_BY_BOARD_V7,
  BoardTwistsEngineV7,
  CLASSIC_TV_TWIST_SPECS_V7,
  CLASSIC_TV_TWIST_SPECS_V9,
  applyBoardPlayModeV9,
  areGoldenDominoAdjacentV9,
  isR7BoardPlayModeV9,
  type BlitzReRackResultV7,
  type BoardGimmickStateV7,
  type BoardModePostClaimResultV7,
  type BoardModePostClaimResultV9,
  type BoardModeRuleBannerV7,
  type BoardModeRuleBannerV9,
  type BoardPlayModeV7,
  type ConcentrationPrizeKindV7,
  type EyeGuessHiddenBadgeV7,
  type MysteryCurtainOutcomeV7,
  type SecretSquareRevealResultV7,
  type TileTwistBreakdownV7,
  type VaultUnlockResultV7,
} from './BoardTwistsEngineV7';
import {
  SEASON_VISUAL_SPECS_V9,
  VIBE_PACK_CATEGORIES_V9,
  VIP_CELEB_CATALOG_V9,
} from '../../v9/ShowroomAndCatalogsV9';
import {
  createTungstenBulbHaloSprite,
  getAmericanWalnutVeneerTexture,
  getBrushedAnodizedTexture,
  getContactShadowTexture,
  getTungstenBulbHaloTexture,
} from '../engine/HorologicalCAD';

export {
  BOARD_MODE_RULE_BANNERS_V7,
  BOARD_MODE_RULE_BANNERS_V9,
  BOARD_PLAY_MODE_BY_BOARD_V7,
  CLASSIC_TV_TWIST_SPECS_V7,
  CLASSIC_TV_TWIST_SPECS_V9,
  type BoardModePostClaimResultV7,
  type BoardModePostClaimResultV9,
  type BoardModeRuleBannerV7,
  type BoardModeRuleBannerV9,
  type BoardPlayModeV7,
  type BoardPlayModeV9,
  type ConcentrationPrizeKindV7,
  type EyeGuessHiddenBadgeV7,
  type MysteryCurtainOutcomeV7,
  type SecretSquareRevealResultV7,
  type VaultUnlockResultV7,
};

// ----------------------------------------------------------------------------
// 0. 1966 "IN LIVING COLOR" Domain Palette & Friendly TV Category Display Map
// ----------------------------------------------------------------------------

export interface LivingColorDomainPaletteV7 {
  readonly primaryHex: string;
  readonly primaryHexNum: number;
  readonly deepHex: string;
  readonly highlightHex: string;
  readonly headerInkHex: string;
  readonly dollarInkHex: string;
  readonly label: string;
}

export const LIVING_COLOR_DOMAIN_PALETTE_V7: Record<DomainIdV7, LivingColorDomainPaletteV7> = {
  SCI_TECH: {
    primaryHex: '#1E56C5',
    primaryHexNum: 0x1e56c5,
    deepHex: '#0F3788',
    highlightHex: '#4E8EF7',
    headerInkHex: '#F7EEDB',
    dollarInkHex: '#113A8E',
    label: 'SCIENCE',
  },
  POP_LIT: {
    primaryHex: '#F4A91F',
    primaryHexNum: 0xf4a91f,
    deepHex: '#B87404',
    highlightHex: '#FFD25A',
    headerInkHex: '#1E140E',
    dollarInkHex: '#8C4E00',
    label: 'CULTURE',
  },
  NUM_GEO: {
    primaryHex: '#0096A6',
    primaryHexNum: 0x0096a6,
    deepHex: '#006873',
    highlightHex: '#33CAD8',
    headerInkHex: '#F7EEDB',
    dollarInkHex: '#005F6B',
    label: 'WORLD',
  },
  HIST_FACT: {
    primaryHex: '#FF6738',
    primaryHexNum: 0xff6738,
    deepHex: '#B83912',
    highlightHex: '#FF926E',
    headerInkHex: '#F7EEDB',
    dollarInkHex: '#A6330C',
    label: 'HISTORY',
  },
};

export const FRIENDLY_TV_BOARD_LABELS_V7: Record<CategoryIdV7, string> = {
  MEDICINE: 'MEDICINE',
  CHEMISTRY: 'CHEMISTRY',
  PHYSICS: 'PHYSICS',
  GADGETS: 'GADGETS',
  ENGINES: 'ENGINES',
  LITERATURE: 'LITERATURE',
  LEXICON: 'WORDS & WIT',
  'FINE ARTS': 'FINE ARTS',
  SCREEN: 'SILVER SCREEN',
  JUKEBOX: 'HIT PARADE',
  FINANCE: 'FINANCE',
  PRICING: 'PRICE TAG',
  ODDS: 'GAMES & ODDS',
  ATLAS: 'WORLD ATLAS',
  SPORTS: 'SPORTS',
  DYNASTIES: 'EMPIRES',
  HEADLINES: 'HEADLINES',
  FOLKLORE: 'MYTH & LORE',
  FALLACIES: 'BRAIN TWIST',
  CUISINE: 'FOOD & DRINK',
};

export interface BoardBoundsV7 {
  readonly isPortrait: boolean;
  readonly width: number;
  readonly depth: number;
  readonly rakeRad: number;
  readonly pivotY: number;
  readonly worldBox: THREE.Box3;
  readonly tilePlayfieldBox: THREE.Box3;
  readonly size: THREE.Vector3;
  readonly center: THREE.Vector3;
}

// ----------------------------------------------------------------------------
// 1. Canonical 12-Board Catalog & Spatial Blueprints (`BOARD_SPECS_V7`)
// ----------------------------------------------------------------------------

export interface BoardTileBlueprintSlotV7 {
  readonly x: number;
  readonly z: number;
  readonly tierY: number; // Always >= 0.14m local proud elevation!
  readonly shape: BoardTileNodeV7['shape'];
  readonly baseChips: 150 | 200 | 250 | 300 | 400;
}

export interface BoardSpecV7 {
  readonly id: BoardIdV7;
  readonly playMode: BoardPlayModeV7;
  readonly name: string;
  readonly subtitle: string;
  readonly homeStageId: StageWorldIdV7;
  readonly defaultTwistId: BoardTwistIdV7;
  readonly gimmickLabel: string;
  readonly bedHex: number;
  readonly woodVeneerHex: number;
  readonly brassAccentHex: number;
  readonly bakeliteHex: number;
  readonly slots: readonly BoardTileBlueprintSlotV7[];
}

function makeGridSlots(
  cols: readonly number[],
  rows: readonly number[],
  shape: BoardTileNodeV7['shape'],
  chipsByRow: readonly (150 | 200 | 250 | 300 | 400)[],
  tierByRow?: readonly number[],
): BoardTileBlueprintSlotV7[] {
  const out: BoardTileBlueprintSlotV7[] = [];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      const cornerBoost =
        (r === 0 || r === rows.length - 1) && (c === 0 || c === cols.length - 1);
      const base = chipsByRow[r] ?? 250;
      const chips: 150 | 200 | 250 | 300 | 400 =
        cornerBoost && base < 400 ? ((base + 50) as 200 | 250 | 300 | 400) : base;
      out.push({
        x: cols[c],
        z: rows[r],
        tierY: Math.max(0.14, tierByRow?.[r] ?? 0.15),
        shape,
        baseChips: chips,
      });
    }
  }
  return out;
}

export const BOARD_SPECS_V7: Record<BoardIdV7, BoardSpecV7> = {
  BOARD_01_FUNK_CROSSFADER: {
    id: 'BOARD_01_FUNK_CROSSFADER',
    playMode: 'CLASSIC_TOTE',
    name: '1964 Studio 6A Classic Tote',
    subtitle: 'Escalating $150–$400 backlit trilons, Secret Square & $500 Gold Vault',
    homeStageId: 'STAGE_01_IBC_DAYTIME_FUNK',
    defaultTwistId: 'TWIST_01_CROSSFADER_BOOST',
    gimmickLabel: 'Crossfader Slider',
    bedHex: 0x006b74,
    woodVeneerHex: 0x7b4224,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    // Sleek 1966 NBC Studio 6A / CBS TV City 4x3 Tote Console Matrix
    slots: [
      { x: -1.24, z: -0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: -0.44, z: -0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 0.44, z: -0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 1.24, z: -0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: -1.24, z: 0.0, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: -0.44, z: 0.0, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: 0.44, z: 0.0, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: 1.24, z: 0.0, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: -1.24, z: 0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: -0.44, z: 0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 0.44, z: 0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 1.24, z: 0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
    ],
  },

  BOARD_02_JUBILEE_HEX_BRIDGE: {
    id: 'BOARD_02_JUBILEE_HEX_BRIDGE',
    playMode: 'TIC_TAC_LINE',
    name: "1966 Hollywood Squares Honeycomb",
    subtitle: 'Connect 3-in-a-row across glowing light-bridges for a +$600 Line Jackpot',
    homeStageId: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    defaultTwistId: 'TWIST_02_HEX_BRIDGE_CHAIN',
    gimmickLabel: 'Bridge Polarity Bus',
    bedHex: 0x007b85,
    woodVeneerHex: 0x723a20,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    // 5 - 4 - 5 staggered honeycomb (14 tiles)
    slots: [
      { x: -1.44, z: -0.68, tierY: 0.15, shape: 'HEX', baseChips: 300 },
      { x: -0.72, z: -0.68, tierY: 0.15, shape: 'HEX', baseChips: 250 },
      { x: 0.0, z: -0.68, tierY: 0.16, shape: 'HEX', baseChips: 300 },
      { x: 0.72, z: -0.68, tierY: 0.15, shape: 'HEX', baseChips: 250 },
      { x: 1.44, z: -0.68, tierY: 0.15, shape: 'HEX', baseChips: 300 },
      { x: -1.08, z: 0.0, tierY: 0.16, shape: 'HEX', baseChips: 250 },
      { x: -0.36, z: 0.0, tierY: 0.17, shape: 'HEX', baseChips: 300 },
      { x: 0.36, z: 0.0, tierY: 0.17, shape: 'HEX', baseChips: 300 },
      { x: 1.08, z: 0.0, tierY: 0.16, shape: 'HEX', baseChips: 250 },
      { x: -1.44, z: 0.68, tierY: 0.15, shape: 'HEX', baseChips: 200 },
      { x: -0.72, z: 0.68, tierY: 0.15, shape: 'HEX', baseChips: 150 },
      { x: 0.0, z: 0.68, tierY: 0.15, shape: 'HEX', baseChips: 200 },
      { x: 0.72, z: 0.68, tierY: 0.15, shape: 'HEX', baseChips: 150 },
      { x: 1.44, z: 0.68, tierY: 0.15, shape: 'HEX', baseChips: 200 },
    ],
  },

  BOARD_03_VAUDEVILLE_GEAR_TRAIN: {
    id: 'BOARD_03_VAUDEVILLE_GEAR_TRAIN',
    playMode: 'BIG_WHEEL_SHOWCASE',
    name: '1966 Burbank Pop-Art Prize Deck',
    subtitle: 'Big Wheel showcase spins + three spinning Mondrian Living Color prize wheels',
    homeStageId: 'STAGE_03_1926_VAUDEVILLE_PIT',
    defaultTwistId: 'TWIST_03_ESCAPEMENT_TICK_SHIFT',
    gimmickLabel: 'Pop-Art Wheel Release',
    bedHex: 0x6e3b23,
    woodVeneerHex: 0x844424,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x006b74,
    slots: makeGridSlots(
      [-1.29, -0.43, 0.43, 1.29],
      [-0.68, 0.0, 0.68],
      'OCTAGON',
      [300, 250, 200],
      [0.16, 0.15, 0.15],
    ),
  },

  BOARD_04_MAHOGANY_SWITCHBOARD: {
    id: 'BOARD_04_MAHOGANY_SWITCHBOARD',
    playMode: 'CLASSIC_TOTE',
    name: '1964 "$64,000" Isolation Tote Desk',
    subtitle: 'Teak & teal glass network switchboard with escalating stakes & Gold Vault',
    homeStageId: 'STAGE_04_1958_ISOLATION_VAULT',
    defaultTwistId: 'TWIST_04_SUPERVISORY_RELAY_PAIR',
    gimmickLabel: 'Supervisory Crossbar Stepper',
    bedHex: 0x006b74,
    woodVeneerHex: 0x7c3d22,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    slots: makeGridSlots(
      [-1.29, -0.43, 0.43, 1.29],
      [-0.68, 0.0, 0.68],
      'CHAMFER_RECT',
      [300, 250, 150],
      [0.15, 0.15, 0.15],
    ),
  },

  BOARD_05_LARSON_SPIN_RING: {
    id: 'BOARD_05_LARSON_SPIN_RING',
    playMode: 'PRESS_YOUR_LUCK_GREMLIN',
    name: '1967 Apollo Color-Control Spin Ring',
    subtitle: 'Press Your Luck Gremlin light-board spins + Pass-Spin Brass Paddle',
    homeStageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    defaultTwistId: 'TWIST_05_LARSON_HOT_SPOT',
    gimmickLabel: 'Pass-Spin Brass Paddle',
    bedHex: 0x6e3b23,
    woodVeneerHex: 0x6e3b23,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x006b74,
    // 14 perimeter & inner-hub spin tiles (5 top, 2 mid-flank + 2 center hubs, 5 bottom)
    slots: [
      { x: -1.42, z: -0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: -0.71, z: -0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 0.0, z: -0.72, tierY: 0.16, shape: 'CHAMFER_RECT', baseChips: 400 },
      { x: 0.71, z: -0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 1.42, z: -0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: 1.42, z: 0.0, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 1.42, z: 0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: 0.71, z: 0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: 0.0, z: 0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: -0.71, z: 0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: -1.42, z: 0.72, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: -1.42, z: 0.0, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: -0.48, z: 0.0, tierY: 0.17, shape: 'OCTAGON', baseChips: 300 },
      { x: 0.48, z: 0.0, tierY: 0.17, shape: 'OCTAGON', baseChips: 300 },
    ],
  },

  BOARD_06_BOARDWALK_PINBALL: {
    id: 'BOARD_06_BOARDWALK_PINBALL',
    playMode: 'MONTY_CURTAIN_DEAL',
    name: '1966 Steel Pier Curtain Showcase',
    subtitle: "Let's Make a Deal triple curtains (#1–#3), pop-bumpers & Instant Bargains",
    homeStageId: 'STAGE_06_ATLANTIC_CITY_PIER',
    defaultTwistId: 'TWIST_06_PINBALL_BUMPER_RICOCHET',
    gimmickLabel: 'Plunger Bumper Charge',
    bedHex: 0x007b85,
    woodVeneerHex: 0x854626,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    // 13 tiles arranged cleanly around the 3 sprung pop-bumpers at (-0.86,-0.32), (+0.86,-0.32), (0,+0.34)
    slots: [
      { x: -1.42, z: -0.74, tierY: 0.15, shape: 'OCTAGON', baseChips: 300 },
      { x: -0.48, z: -0.74, tierY: 0.15, shape: 'OCTAGON', baseChips: 250 },
      { x: 0.48, z: -0.74, tierY: 0.15, shape: 'OCTAGON', baseChips: 250 },
      { x: 1.42, z: -0.74, tierY: 0.15, shape: 'OCTAGON', baseChips: 300 },
      { x: -1.46, z: 0.0, tierY: 0.15, shape: 'OCTAGON', baseChips: 250 },
      { x: 0.0, z: -0.22, tierY: 0.17, shape: 'HEX', baseChips: 400 },
      { x: 1.46, z: 0.0, tierY: 0.15, shape: 'OCTAGON', baseChips: 250 },
      { x: -0.76, z: 0.22, tierY: 0.16, shape: 'OCTAGON', baseChips: 250 },
      { x: 0.76, z: 0.22, tierY: 0.16, shape: 'OCTAGON', baseChips: 250 },
      { x: -1.42, z: 0.76, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: -0.52, z: 0.78, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 0.52, z: 0.78, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 1.42, z: 0.76, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
    ],
  },

  BOARD_07_MONTE_CARLO_SHOE: {
    id: 'BOARD_07_MONTE_CARLO_SHOE',
    playMode: 'CONCENTRATION_PRIZE_MATCH',
    name: '1969 Monte Carlo Prize Royale',
    subtitle: 'Spinning brass roulette ring + Concentration luxury prize-half matching',
    homeStageId: 'STAGE_07_1969_MONTE_CARLO_CASINO',
    defaultTwistId: 'TWIST_07_BACCARAT_NATURAL_21',
    gimmickLabel: 'Baccarat Sabotage Shoe',
    bedHex: 0x155d3b,
    woodVeneerHex: 0x783920,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    // Semi-circular casino arc of 12 wedge/chamfer plaques
    slots: [
      { x: -1.36, z: -0.66, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 300 },
      { x: -0.46, z: -0.74, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 400 },
      { x: 0.46, z: -0.74, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 400 },
      { x: 1.36, z: -0.66, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 300 },
      { x: -1.32, z: 0.02, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: -0.44, z: -0.04, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: 0.44, z: -0.04, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: 1.32, z: 0.02, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: -1.26, z: 0.68, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: -0.42, z: 0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 0.42, z: 0.64, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 1.26, z: 0.68, tierY: 0.15, shape: 'CHAMFER_RECT', baseChips: 200 },
    ],
  },

  BOARD_08_GEODESIC_SUNDIAL: {
    id: 'BOARD_08_GEODESIC_SUNDIAL',
    playMode: 'COAST_HEX_BRIDGE',
    name: "1965 World's Fair Coast-to-Coast Dial",
    subtitle: 'Orbiting Unisphere atomic rings — bridge NYC to Hollywood for +$750',
    homeStageId: 'STAGE_08_WORLDS_FAIR_GEODESIC',
    defaultTwistId: 'TWIST_08_SOLAR_MERIDIAN_SWEEP',
    gimmickLabel: 'Meridian Sundial Ring',
    bedHex: 0x5c301b,
    woodVeneerHex: 0x744225,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x006b74,
    // 12 outer clock-hour dial plinths + 1 elevated central meridian keystone = 13 tiles
    slots: [
      { x: 0.0, z: -0.76, tierY: 0.16, shape: 'WEDGE_PLINTH', baseChips: 300 },
      { x: 0.72, z: -0.68, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: 1.36, z: -0.38, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: 1.44, z: 0.24, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 200 },
      { x: 1.02, z: 0.74, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 200 },
      { x: 0.36, z: 0.78, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 150 },
      { x: -0.36, z: 0.78, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 150 },
      { x: -1.02, z: 0.74, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 200 },
      { x: -1.44, z: 0.24, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 200 },
      { x: -1.36, z: -0.38, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: -0.72, z: -0.68, tierY: 0.15, shape: 'WEDGE_PLINTH', baseChips: 250 },
      { x: -0.65, z: 0.04, tierY: 0.16, shape: 'HEX', baseChips: 300 },
      { x: 0.65, z: 0.04, tierY: 0.16, shape: 'HEX', baseChips: 300 },
    ],
  },

  BOARD_09_PIRATE_UHF_DECK: {
    id: 'BOARD_09_PIRATE_UHF_DECK',
    playMode: 'EYE_GUESS_MEMORY',
    name: '1966 Channel 83 Offshore Memory Deck',
    subtitle: "Spinning broadcast radar + Eye Guess '66 2.4s hidden bonus flash",
    homeStageId: 'STAGE_09_CHANNEL_83_UHF_BARGE',
    defaultTwistId: 'TWIST_09_PIRATE_CARRIER_LOCK',
    gimmickLabel: 'UHF Carrier Tuning Knob',
    bedHex: 0x006b74,
    woodVeneerHex: 0x6a3a24,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    slots: makeGridSlots(
      [-1.29, -0.43, 0.43, 1.29],
      [-0.68, 0.0, 0.68],
      'CHAMFER_RECT',
      [300, 250, 200],
      [0.15, 0.15, 0.15],
    ),
  },

  BOARD_10_SOVEREIGN_ZIGGURAT: {
    id: 'BOARD_10_SOVEREIGN_ZIGGURAT',
    playMode: 'TIC_TAC_LINE',
    name: '1966 Prime-Time Line Ziggurat',
    subtitle: '3-stepped Executive Showcase — complete 3-in-a-row lines for +$600',
    homeStageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    defaultTwistId: 'TWIST_10_ZIGGURAT_APEX_CROWN',
    gimmickLabel: 'Armillary Crown Astrolabe',
    bedHex: 0x5c301b,
    woodVeneerHex: 0x6e3820,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    // Strictly slopes UPSTAGE (-Z is 0.34m Apex, 0.0 is 0.24m Mid, +Z is 0.14m Front) -> ZERO occlusion!
    slots: [
      // Upstage Apex Crown Row (tierY = 0.34m, 3 Sovereign tiles)
      { x: -0.92, z: -0.72, tierY: 0.34, shape: 'OCTAGON', baseChips: 400 },
      { x: 0.0, z: -0.72, tierY: 0.34, shape: 'OCTAGON', baseChips: 400 },
      { x: 0.92, z: -0.72, tierY: 0.34, shape: 'OCTAGON', baseChips: 400 },
      // Mid Ziggurat Terrace (tierY = 0.24m, 5 tiles)
      { x: -1.44, z: -0.02, tierY: 0.24, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: -0.72, z: -0.02, tierY: 0.24, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 0.0, z: -0.02, tierY: 0.24, shape: 'CHAMFER_RECT', baseChips: 300 },
      { x: 0.72, z: -0.02, tierY: 0.24, shape: 'CHAMFER_RECT', baseChips: 250 },
      { x: 1.44, z: -0.02, tierY: 0.24, shape: 'CHAMFER_RECT', baseChips: 300 },
      // Downstage Base Terrace (tierY = 0.14m, 5 tiles — lowest in front so back rows are 100% unobstructed!)
      { x: -1.44, z: 0.68, tierY: 0.14, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: -0.72, z: 0.68, tierY: 0.14, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 0.0, z: 0.68, tierY: 0.14, shape: 'CHAMFER_RECT', baseChips: 200 },
      { x: 0.72, z: 0.68, tierY: 0.14, shape: 'CHAMFER_RECT', baseChips: 150 },
      { x: 1.44, z: 0.68, tierY: 0.14, shape: 'CHAMFER_RECT', baseChips: 200 },
    ],
  },

  BOARD_11_WHEW_GAUNTLET: {
    id: 'BOARD_11_WHEW_GAUNTLET',
    playMode: 'COAST_HEX_BRIDGE',
    name: '1968 Coast-to-Coast Gauntlet',
    subtitle: 'Bridge Left (NYC) to Right (Hollywood) through scanning spotlights for +$750',
    homeStageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    defaultTwistId: 'TWIST_11_GAUNTLET_BLOCKADE_BREACH',
    gimmickLabel: 'Gauntlet Recon Pulse',
    bedHex: 0x6e3b23,
    woodVeneerHex: 0x7a3d22,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x006b74,
    // 3x5 = 15 tiles
    slots: makeGridSlots(
      [-1.44, -0.72, 0.0, 0.72, 1.44],
      [-0.7, 0.0, 0.7],
      'CHAMFER_RECT',
      [400, 250, 150],
      [0.2, 0.17, 0.14],
    ),
  },

  BOARD_12_PENDULUM_BALANCE: {
    id: 'BOARD_12_PENDULUM_BALANCE',
    playMode: 'MONTY_CURTAIN_DEAL',
    name: '1969 Sale of the Century Deal Scale',
    subtitle: 'Live ±4.5° brass deal beam, Triple Mystery Curtains & Instant Bargains',
    homeStageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    defaultTwistId: 'TWIST_12_FULCRUM_EQUILIBRIUM',
    gimmickLabel: 'Fulcrum Tare Detent',
    bedHex: 0x007b85,
    woodVeneerHex: 0x753d21,
    brassAccentHex: 0xf4a91f,
    bakeliteHex: 0x4f2917,
    // Symmetric 6 Left + 6 Right tiles mounted directly onto the tilting balance beam!
    slots: [
      { x: -1.36, z: -0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 300 },
      { x: -0.64, z: -0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 250 },
      { x: 0.64, z: -0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 250 },
      { x: 1.36, z: -0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 300 },
      { x: -1.36, z: 0.0, tierY: 0.17, shape: 'OCTAGON', baseChips: 250 },
      { x: -0.64, z: 0.0, tierY: 0.17, shape: 'OCTAGON', baseChips: 200 },
      { x: 0.64, z: 0.0, tierY: 0.17, shape: 'OCTAGON', baseChips: 200 },
      { x: 1.36, z: 0.0, tierY: 0.17, shape: 'OCTAGON', baseChips: 250 },
      { x: -1.36, z: 0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 200 },
      { x: -0.64, z: 0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 150 },
      { x: 0.64, z: 0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 150 },
      { x: 1.36, z: 0.66, tierY: 0.17, shape: 'OCTAGON', baseChips: 200 },
    ],
  },
};

export const ALL_BOARD_IDS_V7: readonly BoardIdV7[] = Object.keys(BOARD_SPECS_V7) as BoardIdV7[];

// ----------------------------------------------------------------------------
// 2. Raycast Pick Contract & Controller Options
// ----------------------------------------------------------------------------

export type BoardPickResultV7 =
  | { readonly type: 'TILE'; readonly tileIndex: number }
  | { readonly type: 'MERCY_SWITCH' }
  | { readonly type: 'BOARD_GIMMICK'; readonly boardId: BoardIdV7 };

export interface InteractiveBoard3DConfigV7 {
  mountGroup?: THREE.Group;
  envMap?: THREE.Texture | null;
  initialBoardId?: BoardIdV7;
  initialTwistId?: BoardTwistIdV7;
  rivalId?: RivalIdV7;
  rivalWeakCategories?: readonly CategoryIdV7[];
  rivalStrongCategories?: readonly CategoryIdV7[];
  tableBedHex?: number;
  trimVeneerHex?: string | number;
  trimAccentHex?: string | number;
  reducedMotion?: boolean;
  highContrastBadges?: boolean;
  twistsEngine?: BoardTwistsEngineV7;
  onMercySwitchPulled?: (disarmedCount: number) => void;
  onBoardGimmickTriggered?: (boardId: BoardIdV7, state: Readonly<BoardGimmickStateV7>) => void;
  onTileHoverChanged?: (tileIndex: number | null) => void;
}

// ----------------------------------------------------------------------------
// 3. CIE L* Luminance Calibration & Standalone Horological CAD Builders
// ----------------------------------------------------------------------------

const TABLE_RAKE_RAD = 0.54; // Authentic +30.9° 1966 Network Tote-Board Console Rake!
const TABLE_PIVOT_Y = 0.88;
const TABLE_BED_WIDTH = 4.42;
const TABLE_BED_DEPTH = 2.62;

const PORTRAIT_RAKE_RAD = 0.74; // +42.4° Upright Mobile Portrait Tote Wall -> bold arm's-length legibility!
const PORTRAIT_PIVOT_Y = 1.02;
const PORTRAIT_BED_WIDTH = 2.56;
const PORTRAIT_BED_DEPTH_4ROW = 3.12;
const PORTRAIT_BED_DEPTH_5ROW = 3.14;

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function computeCieLStar(color: THREE.Color): number {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return y <= 0.008856 ? 903.3 * y : 116 * Math.pow(y, 1 / 3) - 16;
}

/**
 * Guarantees recessed table bed sits strictly inside `L* = 18..23` so `#EFECE4`
 * Champagne/Alabaster tiles (`L* ~ 74–78`) maintain `>= 4.8:1` contrast!
 */
function calibrateBedColorLStar(hexInput: number): THREE.Color {
  const col = new THREE.Color(hexInput);
  for (let i = 0; i < 18; i++) {
    const lStar = computeCieLStar(col);
    if (lStar < 18.4) {
      col.lerp(new THREE.Color(0xffffff), 0.045);
    } else if (lStar > 22.6) {
      col.multiplyScalar(0.92);
    } else {
      break;
    }
  }
  return col;
}

function parseHexNumber(val: string | number | undefined, fallback: number): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.trim().replace(/^#/, '');
    const parsed = Number.parseInt(cleaned, 16);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function createRoundedRectShape(w: number, d: number, r: number): THREE.Shape {
  const hw = w * 0.5;
  const hd = d * 0.5;
  const cr = Math.min(r, hw * 0.45, hd * 0.45);
  const s = new THREE.Shape();
  s.moveTo(-hw + cr, -hd);
  s.lineTo(hw - cr, -hd);
  s.quadraticCurveTo(hw, -hd, hw, -hd + cr);
  s.lineTo(hw, hd - cr);
  s.quadraticCurveTo(hw, hd, hw - cr, hd);
  s.lineTo(-hw + cr, hd);
  s.quadraticCurveTo(-hw, hd, -hw, hd - cr);
  s.lineTo(-hw, -hd + cr);
  s.quadraticCurveTo(-hw, -hd, -hw + cr, -hd);
  s.closePath();
  return s;
}

/** Chamfered horizontal slab centered in X/Z with bottom resting at `y = 0`. */
function createChamferedSlabGeometry(
  width: number,
  height: number,
  depth: number,
  cornerRadius = 0.035,
  bevel = 0.012,
): THREE.BufferGeometry {
  const bodyDepth = Math.max(0.008, height - bevel * 2);
  const shape = createRoundedRectShape(
    Math.max(0.04, width - bevel * 2),
    Math.max(0.04, depth - bevel * 2),
    cornerRadius,
  );
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: bodyDepth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 8,
  });
  geom.rotateX(-Math.PI * 0.5);
  geom.translate(0, bevel, 0);
  return geom;
}

/** Builds a precision 20°-pressure-angle horological gear with spoked cutouts. */
function createHorologicalGearGeometry(
  teeth: number,
  outerRadius: number,
  thickness: number,
  spokeCount = 5,
): THREE.BufferGeometry {
  const rootR = outerRadius * 0.84;
  const pitchR = outerRadius * 0.92;
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.36;
    const a3 = a0 + step * 0.64;
    const a4 = a0 + step * 0.78;

    const p0x = Math.cos(a0) * rootR;
    const p0y = Math.sin(a0) * rootR;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);

    shape.lineTo(Math.cos(a1) * pitchR, Math.sin(a1) * pitchR);
    shape.lineTo(Math.cos(a2) * outerRadius, Math.sin(a2) * outerRadius);
    shape.lineTo(Math.cos(a3) * outerRadius, Math.sin(a3) * outerRadius);
    shape.lineTo(Math.cos(a4) * pitchR, Math.sin(a4) * pitchR);
  }
  shape.closePath();

  // Spoke lightening windows
  const innerHubR = outerRadius * 0.28;
  const rimInnerR = rootR * 0.8;
  if (spokeCount >= 3 && rimInnerR > innerHubR + 0.04) {
    const winStep = (Math.PI * 2) / spokeCount;
    const padAngle = 0.16;
    for (let s = 0; s < spokeCount; s++) {
      const sa0 = s * winStep + padAngle;
      const sa1 = (s + 1) * winStep - padAngle;
      if (sa1 <= sa0 + 0.08) continue;
      const hole = new THREE.Path();
      hole.moveTo(Math.cos(sa0) * innerHubR, Math.sin(sa0) * innerHubR);
      for (let k = 0; k <= 6; k++) {
        const a = sa0 + ((sa1 - sa0) * k) / 6;
        hole.lineTo(Math.cos(a) * rimInnerR, Math.sin(a) * rimInnerR);
      }
      for (let k = 6; k >= 0; k--) {
        const a = sa0 + ((sa1 - sa0) * k) / 6;
        hole.lineTo(Math.cos(a) * innerHubR, Math.sin(a) * innerHubR);
      }
      hole.closePath();
      shape.holes.push(hole);
    }
  }

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  geom.rotateX(-Math.PI * 0.5);
  return geom;
}

/**
 * Builds the 2D `THREE.Shape` for a tile's outer Okabe-Ito *grand-feu* enamel rim
 * (including tactile colorblind domain notch!) or inner `#EFECE4` champagne core.
 */
function createTileContourShape(
  shapeKind: BoardTileNodeV7['shape'],
  width: number,
  depth: number,
  notchKind?: 'HEX' | 'SCALLOP' | 'VERNIER' | 'WAX_SEAL',
): THREE.Shape {
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const pts: [number, number][] = [];

  if (shapeKind === 'HEX') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      pts.push([Math.cos(a) * hw, Math.sin(a) * hd]);
    }
  } else if (shapeKind === 'OCTAGON') {
    const cx = hw * 0.68;
    const cz = hd * 0.68;
    pts.push(
      [-cx, -hd],
      [cx, -hd],
      [hw, -cz],
      [hw, cz],
      [cx, hd],
      [-cx, hd],
      [-hw, cz],
      [-hw, -cz],
    );
  } else if (shapeKind === 'WEDGE_PLINTH') {
    const topHw = hw * 0.84;
    const botHw = hw * 1.02;
    const ch = 0.045;
    pts.push(
      [-topHw + ch, -hd],
      [topHw - ch, -hd],
      [topHw, -hd + ch],
      [botHw, hd - ch],
      [botHw - ch, hd],
      [-botHw + ch, hd],
      [-botHw, hd - ch],
      [-topHw, -hd + ch],
    );
  } else {
    // CHAMFER_RECT (45°-corner chamfered rectangular horological plaque)
    const ch = Math.min(hw, hd) * 0.22;
    pts.push(
      [-hw + ch, -hd],
      [hw - ch, -hd],
      [hw, -hd + ch],
      [hw, hd - ch],
      [hw - ch, hd],
      [-hw + ch, hd],
      [-hw, hd - ch],
      [-hw, -hd + ch],
    );
  }

  // Sculpt tactile Okabe-Ito Domain Notch along the upstage crown edge (`y = +hd` in 2D before -90° X rot -> `-Z` upstage!)
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    // Top edge segment in Shape Y (`+hd` becomes `-Z` upstage after `rotateX(-PI/2)`)
    const isCrownEdge =
      notchKind &&
      Math.abs(prev[1] - hd) < 0.025 &&
      Math.abs(curr[1] - hd) < 0.025 &&
      Math.abs(prev[0] - curr[0]) > 0.14;

    if (isCrownEdge) {
      if (notchKind === 'HEX') {
        shape.lineTo(0.075, hd);
        shape.lineTo(0.05, hd + 0.026);
        shape.lineTo(-0.05, hd + 0.026);
        shape.lineTo(-0.075, hd);
      } else if (notchKind === 'SCALLOP') {
        shape.lineTo(0.09, hd);
        shape.quadraticCurveTo(0.045, hd + 0.032, 0.0, hd + 0.01);
        shape.quadraticCurveTo(-0.045, hd + 0.032, -0.09, hd);
      } else if (notchKind === 'VERNIER') {
        shape.lineTo(0.085, hd);
        shape.lineTo(0.085, hd + 0.022);
        shape.lineTo(0.03, hd + 0.022);
        shape.lineTo(0.03, hd + 0.006);
        shape.lineTo(-0.03, hd + 0.006);
        shape.lineTo(-0.03, hd + 0.022);
        shape.lineTo(-0.085, hd + 0.022);
        shape.lineTo(-0.085, hd);
      } else if (notchKind === 'WAX_SEAL') {
        shape.lineTo(0.07, hd);
        shape.bezierCurveTo(0.065, hd + 0.036, -0.065, hd + 0.036, -0.07, hd);
      }
    }
    shape.lineTo(curr[0], curr[1]);
  }
  shape.closePath();
  return shape;
}

/**
 * Creates a sleek, form-fitting contoured perimeter glow frame matching the exact
 * tile silhouette (`CHAMFER_RECT`, `HEX`, `OCTAGON`, `WEDGE_PLINTH`) — ZERO jagged
 * polygonal shards poking out behind rectangular tiles!
 */
function createContouredGlowRingGeometry(
  shapeKind: BoardTileNodeV7['shape'],
  width: number,
  depth: number,
  borderWidth = 0.028,
): THREE.BufferGeometry {
  const outer = createTileContourShape(shapeKind, width + borderWidth * 2, depth + borderWidth * 2);
  // Step inner hole strictly OUTSIDE the beveled enamelRimMesh (`width - 0.016`) so perimeter collars NEVER intersect or Z-fight!
  const innerShape = createTileContourShape(shapeKind, Math.max(0.08, width - 0.002), Math.max(0.08, depth - 0.002));
  const innerPts = innerShape.getPoints(24);
  const hole = new THREE.Path();
  for (let i = 0; i < innerPts.length; i++) {
    if (i === 0) hole.moveTo(innerPts[i].x, innerPts[i].y);
    else hole.lineTo(innerPts[i].x, innerPts[i].y);
  }
  hole.closePath();
  outer.holes.push(hole);

  const geom = new THREE.ExtrudeGeometry(outer, {
    depth: 0.006,
    bevelEnabled: false,
  });
  geom.rotateX(-Math.PI * 0.5);
  return geom;
}

// ----------------------------------------------------------------------------
// 4. High-DPI `512x256` Mipmapped Category Brass-Relief Plaque Renderer
// ----------------------------------------------------------------------------

function drawCategoryBrassGlyph(
  ctx: CanvasRenderingContext2D,
  category: CategoryIdV7,
  cx: number,
  cy: number,
  r: number,
  strokeCss: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = strokeCss;
  ctx.fillStyle = strokeCss;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (category) {
    case 'MEDICINE': {
      // Medical cross & caduceus staff
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.68);
      ctx.lineTo(0, r * 0.68);
      ctx.moveTo(-r * 0.52, -r * 0.16);
      ctx.lineTo(r * 0.52, -r * 0.16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.42, 0.2, Math.PI - 0.2);
      ctx.stroke();
      break;
    }
    case 'CHEMISTRY': {
      // Conical Erlenmeyer flask
      ctx.beginPath();
      ctx.moveTo(-r * 0.2, -r * 0.62);
      ctx.lineTo(r * 0.2, -r * 0.62);
      ctx.moveTo(-r * 0.14, -r * 0.62);
      ctx.lineTo(-r * 0.14, -r * 0.2);
      ctx.lineTo(-r * 0.56, r * 0.58);
      ctx.lineTo(r * 0.56, r * 0.58);
      ctx.lineTo(r * 0.14, -r * 0.2);
      ctx.lineTo(r * 0.14, -r * 0.62);
      ctx.stroke();
      break;
    }
    case 'PHYSICS': {
      // Twin orbital ellipses + nucleus
      for (const rot of [-0.55, 0.55]) {
        ctx.save();
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.68, r * 0.26, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'GADGETS': {
      // Precision 8-tooth gear & center bore
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r * 0.46, Math.sin(a) * r * 0.46);
        ctx.lineTo(Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68);
        ctx.stroke();
      }
      break;
    }
    case 'ENGINES': {
      // Piston crown & connecting rod
      ctx.strokeRect(-r * 0.44, -r * 0.6, r * 0.88, r * 0.52);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.08);
      ctx.lineTo(0, r * 0.42);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, r * 0.52, r * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'LITERATURE': {
      // Open hardcover book
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.45);
      ctx.lineTo(0, r * 0.52);
      ctx.moveTo(0, -r * 0.45);
      ctx.quadraticCurveTo(-r * 0.35, -r * 0.58, -r * 0.64, -r * 0.38);
      ctx.lineTo(-r * 0.64, r * 0.42);
      ctx.quadraticCurveTo(-r * 0.35, r * 0.28, 0, r * 0.52);
      ctx.moveTo(0, -r * 0.45);
      ctx.quadraticCurveTo(r * 0.35, -r * 0.58, r * 0.64, -r * 0.38);
      ctx.lineTo(r * 0.64, r * 0.42);
      ctx.quadraticCurveTo(r * 0.35, r * 0.28, 0, r * 0.52);
      ctx.stroke();
      break;
    }
    case 'LEXICON': {
      // Fountain pen nib
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.68);
      ctx.lineTo(r * 0.44, r * 0.18);
      ctx.lineTo(r * 0.24, r * 0.62);
      ctx.lineTo(-r * 0.24, r * 0.62);
      ctx.lineTo(-r * 0.44, r * 0.18);
      ctx.closePath();
      ctx.moveTo(0, -r * 0.68);
      ctx.lineTo(0, -r * 0.05);
      ctx.stroke();
      break;
    }
    case 'FINE ARTS': {
      // Framed canvas & brush diagonal
      ctx.strokeRect(-r * 0.56, -r * 0.48, r * 1.12, r * 0.96);
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, r * 0.28);
      ctx.lineTo(-r * 0.08, -r * 0.12);
      ctx.lineTo(r * 0.16, r * 0.16);
      ctx.lineTo(r * 0.38, -r * 0.22);
      ctx.stroke();
      break;
    }
    case 'SCREEN': {
      // Cinema filmstrip aperture
      ctx.strokeRect(-r * 0.58, -r * 0.46, r * 1.16, r * 0.92);
      ctx.beginPath();
      ctx.moveTo(-r * 0.18, -r * 0.24);
      ctx.lineTo(r * 0.28, 0);
      ctx.lineTo(-r * 0.18, r * 0.24);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'JUKEBOX': {
      // Vinyl 45rpm record & tonearm
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'FINANCE': {
      // Ascending market trend arrow
      ctx.beginPath();
      ctx.moveTo(-r * 0.58, r * 0.42);
      ctx.lineTo(-r * 0.16, 0.0);
      ctx.lineTo(r * 0.12, r * 0.22);
      ctx.lineTo(r * 0.56, -r * 0.38);
      ctx.moveTo(r * 0.22, -r * 0.38);
      ctx.lineTo(r * 0.56, -r * 0.38);
      ctx.lineTo(r * 0.56, -r * 0.04);
      ctx.stroke();
      break;
    }
    case 'PRICING': {
      // Brass price tag
      ctx.beginPath();
      ctx.moveTo(-r * 0.56, -r * 0.12);
      ctx.lineTo(0, -r * 0.58);
      ctx.lineTo(r * 0.56, -r * 0.02);
      ctx.lineTo(0, r * 0.58);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -r * 0.26, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ODDS': {
      // Die cube face with 5 pips
      ctx.strokeRect(-r * 0.52, -r * 0.52, r * 1.04, r * 1.04);
      for (const [px, py] of [
        [-0.26, -0.26],
        [0.26, -0.26],
        [0, 0],
        [-0.26, 0.26],
        [0.26, 0.26],
      ]) {
        ctx.beginPath();
        ctx.arc(px * r, py * r, r * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'ATLAS': {
      // Meridian globe
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
      ctx.moveTo(-r * 0.58, 0);
      ctx.lineTo(r * 0.58, 0);
      ctx.ellipse(0, 0, r * 0.28, r * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'SPORTS': {
      // Championship chalice cup
      ctx.beginPath();
      ctx.moveTo(-r * 0.44, -r * 0.52);
      ctx.lineTo(r * 0.44, -r * 0.52);
      ctx.quadraticCurveTo(r * 0.4, r * 0.14, 0, r * 0.18);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.14, -r * 0.44, -r * 0.52);
      ctx.moveTo(0, r * 0.18);
      ctx.lineTo(0, r * 0.54);
      ctx.moveTo(-r * 0.34, r * 0.54);
      ctx.lineTo(r * 0.34, r * 0.54);
      ctx.stroke();
      break;
    }
    case 'DYNASTIES': {
      // Three-point sovereign crown
      ctx.beginPath();
      ctx.moveTo(-r * 0.56, r * 0.42);
      ctx.lineTo(-r * 0.56, -r * 0.32);
      ctx.lineTo(-r * 0.2, r * 0.06);
      ctx.lineTo(0, -r * 0.52);
      ctx.lineTo(r * 0.2, r * 0.06);
      ctx.lineTo(r * 0.56, -r * 0.32);
      ctx.lineTo(r * 0.56, r * 0.42);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'HEADLINES': {
      // Broadsheet masthead & columns
      ctx.strokeRect(-r * 0.56, -r * 0.52, r * 1.12, r * 1.04);
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, -r * 0.22);
      ctx.lineTo(r * 0.38, -r * 0.22);
      ctx.moveTo(-r * 0.38, 0.06 * r);
      ctx.lineTo(r * 0.38, 0.06 * r);
      ctx.moveTo(-r * 0.38, 0.3 * r);
      ctx.lineTo(r * 0.18, 0.3 * r);
      ctx.stroke();
      break;
    }
    case 'FOLKLORE': {
      // Compass star lantern
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 - Math.PI * 0.5;
        const rad = i % 2 === 0 ? r * 0.64 : r * 0.24;
        const x = Math.cos(a) * rad;
        const y = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'FALLACIES': {
      // Klaxon prism / warning diamond
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.64);
      ctx.lineTo(r * 0.62, 0);
      ctx.lineTo(0, r * 0.64);
      ctx.lineTo(-r * 0.62, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.28);
      ctx.lineTo(0, r * 0.12);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, r * 0.32, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'CUISINE':
    default: {
      // Silver service cloche dome
      ctx.beginPath();
      ctx.arc(0, r * 0.22, r * 0.54, Math.PI, 0);
      ctx.moveTo(-r * 0.64, r * 0.24);
      ctx.lineTo(r * 0.64, r * 0.24);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -r * 0.38, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const cr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + cr, y);
  ctx.lineTo(x + w - cr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
  ctx.lineTo(x + w, y + h - cr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  ctx.lineTo(x + cr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
  ctx.lineTo(x, y + cr);
  ctx.quadraticCurveTo(x, y, x + cr, y);
  ctx.closePath();
}

function drawFittedBoldText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxW: number,
  maxPx: number,
  minPx: number,
  fontStack: string,
): number {
  let px = maxPx;
  while (px > minPx) {
    ctx.font = `900 ${px}px ${fontStack}`;
    if (ctx.measureText(text).width <= maxW) break;
    px -= 2;
  }
  ctx.font = `900 ${px}px ${fontStack}`;
  ctx.fillText(text, cx, cy, maxW);
  return px;
}

let cachedNeutralLouverBedTex: THREE.CanvasTexture | null = null;

/**
 * Neutral grayscale/ivory 1966 louvered Tote Board shadowbox texture so seasonal
 * bed and console colors (Cerise-Ruby, Emerald, Royal Cobalt, Peacock Teal) multiply cleanly
 * without teal channel crushing!
 */
function getNeutralLouverToteBedTexture(): THREE.CanvasTexture {
  if (cachedNeutralLouverBedTex) return cachedNeutralLouverBedTex;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    const rad = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
    rad.addColorStop(0.0, '#FFFFFF');
    rad.addColorStop(0.7, '#EAE5DC');
    rad.addColorStop(1.0, '#CFC8BC');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 8) {
      ctx.fillStyle = 'rgba(20, 20, 20, 0.28)';
      ctx.fillRect(0, y, 512, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.fillRect(0, y + 3, 512, 1.5);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let x = 0; x < 512; x += 32) {
      ctx.fillRect(x, 0, 2, 512);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  cachedNeutralLouverBedTex = tex;
  return tex;
}

function drawFourPointStarburst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fillHex: string,
): void {
  ctx.fillStyle = fillHex;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

export type CanonicalTrilonStyleIdV9 =
  | 'trilon_acrylite_cream'
  | 'trilon_cobalt_glass'
  | 'trilon_atomic_gold'
  | 'trilon_cerise_checker';

export interface TrilonStyleConfigV9 {
  readonly id: CanonicalTrilonStyleIdV9;
  readonly rimHexNum: number | null;
  readonly coreHexNum: number;
  readonly faceCenterHex: string;
  readonly faceMidHex: string;
  readonly faceEdgeHex: string;
  readonly headerBgOverride: string | null;
  readonly frameStrokeOverride: string | null;
  readonly isCheckerBorder: boolean;
}

export function normalizeTrilonStyleIdV9(styleId?: string): CanonicalTrilonStyleIdV9 {
  switch (styleId) {
    case 'trilon_cobalt_glass':
    case 'trilon_cbs_cobalt':
      return 'trilon_cobalt_glass';
    case 'trilon_atomic_gold':
      return 'trilon_atomic_gold';
    case 'trilon_cerise_checker':
      return 'trilon_cerise_checker';
    case 'trilon_acrylite_cream':
    case 'trilon_cream_acrylite':
    default:
      return 'trilon_acrylite_cream';
  }
}

export const TRILON_STYLE_CONFIGS_V9: Record<CanonicalTrilonStyleIdV9, TrilonStyleConfigV9> = {
  trilon_acrylite_cream: {
    id: 'trilon_acrylite_cream',
    rimHexNum: null,
    coreHexNum: 0xfff6e3,
    faceCenterHex: '#FFF9EC',
    faceMidHex: '#F8EED8',
    faceEdgeHex: '#F2E2C4',
    headerBgOverride: null,
    frameStrokeOverride: null,
    isCheckerBorder: false,
  },
  trilon_cobalt_glass: {
    id: 'trilon_cobalt_glass',
    rimHexNum: 0x1746a2,
    coreHexNum: 0xe8f0ff,
    faceCenterHex: '#FFFDF7',
    faceMidHex: '#EEF4FF',
    faceEdgeHex: '#D8E5FF',
    headerBgOverride: '#1746A2',
    frameStrokeOverride: '#1746A2',
    isCheckerBorder: false,
  },
  trilon_atomic_gold: {
    id: 'trilon_atomic_gold',
    rimHexNum: 0xf2a922,
    coreHexNum: 0xffe89e,
    faceCenterHex: '#FFFBE6',
    faceMidHex: '#FDF0B8',
    faceEdgeHex: '#F5D678',
    headerBgOverride: '#D9820B',
    frameStrokeOverride: '#F2A922',
    isCheckerBorder: false,
  },
  trilon_cerise_checker: {
    id: 'trilon_cerise_checker',
    rimHexNum: 0xe6397a,
    coreHexNum: 0xffe4ef,
    faceCenterHex: '#FFFDF7',
    faceMidHex: '#FDF0F5',
    faceEdgeHex: '#FAD6E4',
    headerBgOverride: '#E6397A',
    frameStrokeOverride: '#E6397A',
    isCheckerBorder: true,
  },
};

interface PlaqueRenderExtrasV7 {
  readonly secretRevealed: boolean;
  readonly curtainNumber: 1 | 2 | 3;
  readonly rolledMysteryOutcome?: MysteryCurtainOutcomeV7;
  readonly eyeGuessFlashActive?: boolean;
  readonly eyeGuessBadge?: EyeGuessHiddenBadgeV7;
  readonly concentrationPrize?: ConcentrationPrizeKindV7;
  readonly concentrationRevealed?: boolean;
  readonly isSpotlit?: boolean;
  readonly isRovingSpotlightBoard?: boolean;
  readonly hasBrassKeyOnBoard?: boolean;
  readonly boardModeV9?: BoardPlayModeV9;
  readonly trilonStyle?: TrilonStyleConfigV9;
  readonly seasonSpec?: SeasonVisualSpecV9;
  readonly pressureCookerMult?: number;
  readonly isHighVoltDoor?: boolean;
  readonly dominoAdjacentHint?: boolean;
}

/**
 * Paints a sculpted 1966 brushed anodized aluminum outer frame, crisp inner accent lip,
 * optional 24K Keyholder Shield border, and 4 corner brass jewel rivets outside all text zones!
 */
function drawAnodizedOuterBezelAndRivets(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accentStrokeCss: string,
  shieldProtected = false,
): void {
  // 1. Brushed anodized aluminum outer rim (14px perimeter band)
  const metalGrad = ctx.createLinearGradient(0, 0, w, h);
  metalGrad.addColorStop(0.0, '#F1F5FB');
  metalGrad.addColorStop(0.35, '#C4CFDE');
  metalGrad.addColorStop(0.68, '#F6FAFF');
  metalGrad.addColorStop(1.0, '#B5C2D3');
  ctx.strokeStyle = metalGrad;
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  // 2. Crisp 1966 Living Color / Twist inner bezel lip
  ctx.strokeStyle = shieldProtected ? '#F4A91F' : accentStrokeCss;
  ctx.lineWidth = shieldProtected ? 14 : 10;
  ctx.strokeRect(19, 19, w - 38, h - 38);

  if (shieldProtected) {
    ctx.strokeStyle = '#FFF3B0';
    ctx.lineWidth = 5;
    ctx.strokeRect(27, 27, w - 54, h - 54);
  }

  // 3. Four 3D-shaded 24K Brass Corner Jewel Rivets (strictly in outer 24px corners — zero text overlap!)
  for (const [rx, ry] of [
    [24, 24],
    [w - 24, 24],
    [24, h - 24],
    [w - 24, h - 24],
  ] as const) {
    const rg = ctx.createRadialGradient(rx - 3, ry - 3, 1, rx, ry, 10);
    rg.addColorStop(0.0, '#FFFBE0');
    rg.addColorStop(0.45, '#F6BE3B');
    rg.addColorStop(0.85, '#9E5D08');
    rg.addColorStop(1.0, '#3D2204');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rx, ry, 9.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBigWheel20WedgeEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
): void {
  const wedgeColors = [
    '#0096A6',
    '#F4A91F',
    '#E63B7A',
    '#FF6738',
    '#1E56C5',
    '#16A34A',
    '#F4A91F',
    '#0096A6',
    '#FF6738',
    '#E63B7A',
  ];
  const wedges = 20;
  const step = (Math.PI * 2) / wedges;
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < wedges; i++) {
    const a0 = i * step - Math.PI * 0.5;
    const a1 = a0 + step;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, a0, a1);
    ctx.closePath();
    ctx.fillStyle = wedgeColors[i % wedgeColors.length];
    ctx.fill();
    ctx.strokeStyle = '#FFF9EC';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Outer brass rim + nickel pegs
  ctx.strokeStyle = '#3E2012';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#F4A91F';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Center gold sunburst hub
  ctx.fillStyle = '#3E2012';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFD56B';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Top brass flapper pointer
  ctx.fillStyle = '#FF6738';
  ctx.strokeStyle = '#1E140E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-14, -radius - 12);
  ctx.lineTo(14, -radius - 12);
  ctx.lineTo(0, -radius + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawBrassSafeKeyEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.38);
  ctx.scale(scale, scale);

  const keyGrad = ctx.createLinearGradient(-70, -30, 70, 30);
  keyGrad.addColorStop(0.0, '#FFF5B8');
  keyGrad.addColorStop(0.5, '#F4A91F');
  keyGrad.addColorStop(1.0, '#A86206');

  ctx.fillStyle = keyGrad;
  ctx.strokeStyle = '#121A2B';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';

  // Shaft & ward teeth
  ctx.beginPath();
  ctx.rect(-18, -11, 108, 22);
  ctx.rect(52, 11, 16, 26);
  ctx.rect(74, 11, 16, 34);
  ctx.fill();
  ctx.stroke();

  // Ornate bow ring
  ctx.beginPath();
  ctx.arc(-48, 0, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFF9EC';
  ctx.beginPath();
  ctx.arc(-48, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawStarburstFoilSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  points = 14,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  const sealGrad = ctx.createRadialGradient(-outerR * 0.2, -outerR * 0.2, 2, 0, 0, outerR);
  sealGrad.addColorStop(0.0, '#FFFBE0');
  sealGrad.addColorStop(0.55, '#F6BD38');
  sealGrad.addColorStop(1.0, '#B46908');
  ctx.fillStyle = sealGrad;
  ctx.strokeStyle = '#121A2B';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  const total = points * 2;
  for (let i = 0; i < total; i++) {
    const a = (i / total) * Math.PI * 2 - Math.PI * 0.5;
    const r = i % 2 === 0 ? outerR : outerR * 0.66;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#121A2B';
  ctx.font = `900 ${Math.round(outerR * 0.68)}px "Jost", "Futura", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 0, 2);
  ctx.restore();
}

/**
 * Renders an Ultra-HD `1024x512` 1966 "In Living Color" Backlit Acrylite Trilon Plaque!
 * Un-crushed NTSC-safe Warm Broadcast Cream (`#FFF9EC` -> `#F2E2C4`) with `>= 13.7:1`
 * `#121A2B` ink contrast, brushed anodized outer frame, corner brass jewel rivets, and
 * bespoke 1966 artwork for all 12 `ClassicTvTileTwistV7` & 5 Unlock Topology states!
 */
function renderTilePlaqueCanvas(
  canvas: HTMLCanvasElement,
  tile: BoardTileNodeV7,
  breakdown: TileTwistBreakdownV7,
  highContrastBadges: boolean,
  extras: PlaqueRenderExtrasV7,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width; // 1024
  const h = canvas.height; // 512
  const pal = LIVING_COLOR_DOMAIN_PALETTE_V7[tile.domain];
  const displayCategory = FRIENDLY_TV_BOARD_LABELS_V7[tile.category] ?? tile.category;
  const tvTwist: ClassicTvTileTwistV7 = tile.tvTwist ?? 'NONE';
  const tvTwistV9: ClassicTvTileTwistV9 = tile.tvTwistV9 ?? tvTwist;
  const boardModeV9: BoardPlayModeV9 = extras.boardModeV9 ?? 'CLASSIC_TOTE';
  const trilonStyle = extras.trilonStyle ?? TRILON_STYLE_CONFIGS_V9.trilon_acrylite_cream;
  const isLockedVault = tvTwist === 'LOCKED_VAULT' && Boolean(tile.isVaultLocked);
  const isUnlockedVault = tvTwist === 'LOCKED_VAULT' && !tile.isVaultLocked;
  const isLiveWireLocked = Boolean(tile.isLiveWireLocked);
  const isTopologyLocked = Boolean(tile.isTopologyLocked) && !isLiveWireLocked;
  const isKeyholderShielded = (tile.keyholderProtectedTurns ?? 0) > 0;
  const isSecretRevealed = tvTwist === 'SECRET_SQUARE' && extras.secretRevealed;
  const isOpponentPick = tvTwist === 'OPPONENT_CHOICE';
  const isMysteryCurtain = tvTwist === 'MYSTERY_CURTAIN';
  const isShowcaseBonus = tvTwist === 'SHOWCASE_BONUS';
  const isInstantBargain = tvTwist === 'INSTANT_BARGAIN';
  const isBigWheel = tvTwist === 'BIG_WHEEL_SPIN';
  const isBlindCategory = tvTwist === 'BLIND_CATEGORY';
  const isMysteryCash = tvTwist === 'MYSTERY_CASH';
  const isBrassKey = tvTwist === 'BRASS_KEY';
  const isPressLuckSpin = tvTwist === 'PRESS_LUCK_SPIN';
  const isVipBluff = tvTwistV9 === 'VIP_BLUFF';
  const isBlackoutShutter =
    Boolean(tile.blindCategoryHidden) && Boolean(tile.mysteryCashHidden);
  const isR7LouverShutter =
    !isBlackoutShutter && !isBlindCategory && Boolean(tile.blindCategoryHidden);
  const isR7BlindPurse =
    !isBlackoutShutter && !isMysteryCash && Boolean(tile.mysteryCashHidden);
  const isSpotlightTile = Boolean(tile.isSpotlightTile) || Boolean(extras.isSpotlit);
  const isClaimedPlayer = tile.state === 'CLAIMED_PLAYER';
  const isClaimedRival = tile.state === 'CLAIMED_RIVAL';
  const shownChips = Math.max(150, Math.round(breakdown.effectiveChips / 50) * 50);

  const displayFont = '"Jost", "Futura", "Century Gothic", "Arial Black", "Segoe UI", sans-serif';
  const numericFont = '"Jost", "League Spartan", "Futura", "Arial Black", sans-serif';

  ctx.clearRect(0, 0, w, h);
  ctx.textBaseline = 'middle';

  // -------------------------------------------------------------------------
  // A0. EYE GUESS '66 MEMORY FLASH REVEAL (`2.4s` Hidden Bonus Peek!)
  // -------------------------------------------------------------------------
  if (
    extras.eyeGuessFlashActive &&
    !isClaimedPlayer &&
    !isClaimedRival &&
    !isLockedVault &&
    !isTopologyLocked &&
    extras.eyeGuessBadge &&
    extras.eyeGuessBadge !== 'NONE'
  ) {
    const isTrap = extras.eyeGuessBadge === 'TRAP';
    const isDouble = extras.eyeGuessBadge === 'DOUBLE_2X';
    const flashGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 24, w * 0.5, h * 0.5, w * 0.66);
    if (isTrap) {
      flashGrad.addColorStop(0, '#FF6738');
      flashGrad.addColorStop(1, '#B81D44');
    } else if (isDouble) {
      flashGrad.addColorStop(0, '#FFF5B8');
      flashGrad.addColorStop(1, '#F4A91F');
    } else {
      flashGrad.addColorStop(0, '#4EE3D4');
      flashGrad.addColorStop(1, '#0096A6');
    }
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#5C301B';
    ctx.fillRect(20, 20, w - 40, 114);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, "👁 EYE GUESS '66 FLASH!", w * 0.5, 78, w - 84, 60, 38, displayFont);

    ctx.fillStyle = isTrap ? '#FFFDF5' : '#1E140E';
    const flashHeadline = isTrap
      ? '🎭 TRAP (-$100)'
      : isDouble
        ? '⭐ 2X DOUBLE!'
        : '💰 +$300 CASH!';
    drawFittedBoldText(ctx, flashHeadline, w * 0.5, 272, w - 80, 118, 66, displayFont);

    ctx.fillStyle = isTrap ? '#FFE0C8' : '#1E140E';
    drawFittedBoldText(
      ctx,
      isTrap ? 'DODGE THIS SPOT!' : 'MEMORIZE THIS SPOT!',
      w * 0.5,
      412,
      w - 96,
      54,
      36,
      displayFont,
    );
    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#3E2012', false);
    return;
  }

  // -------------------------------------------------------------------------
  // A. CLAIMED PLAYER / CLAIMED RIVAL — Iconic 1966 Illuminated Trilon Contestant Medallions!
  // -------------------------------------------------------------------------
  if (isClaimedPlayer || isClaimedRival) {
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.52, 30, w * 0.5, h * 0.52, w * 0.68);
    if (isClaimedPlayer) {
      bgGrad.addColorStop(0.0, '#1ECA63');
      bgGrad.addColorStop(0.65, '#139A48');
      bgGrad.addColorStop(1.0, '#0A5E2A');
    } else {
      bgGrad.addColorStop(0.0, '#EE4840');
      bgGrad.addColorStop(0.65, '#C42824');
      bgGrad.addColorStop(1.0, '#7F1212');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle 1966 diagonal studio spotlight sheen across claimed Acrylite panel
    ctx.fillStyle = 'rgba(255, 252, 236, 0.08)';
    ctx.beginPath();
    ctx.moveTo(140, 0);
    ctx.lineTo(420, 0);
    ctx.lineTo(220, h);
    ctx.lineTo(-40, h);
    ctx.closePath();
    ctx.fill();

    // Top Studio Status Header Ribbon
    ctx.fillStyle = isClaimedPlayer ? '#083D1D' : '#570B0B';
    ctx.fillRect(20, 20, w - 40, 108);
    ctx.fillStyle = '#FFD56B';
    ctx.fillRect(20, 124, w - 40, 7);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(
      ctx,
      isClaimedPlayer ? '★ STUDIO PLAYER · BANKED' : '◆ CHAMPION · CLAIMED',
      w * 0.5,
      74,
      w - 108,
      50,
      34,
      displayFont,
    );

    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, displayCategory, w * 0.5, 192, w - 108, 72, 44, displayFont);

    const showPrizeTag =
      Boolean(extras.concentrationRevealed) &&
      Boolean(extras.concentrationPrize) &&
      extras.concentrationPrize !== 'NONE';

    if (showPrizeTag && extras.concentrationPrize) {
      drawFittedBoldText(
        ctx,
        isClaimedPlayer ? '★ YOU WON!' : '◆ RIVAL',
        w * 0.5,
        290,
        w - 120,
        92,
        56,
        displayFont,
      );
      const prizeMap: Record<Exclude<ConcentrationPrizeKindV7, 'NONE'>, string> = isClaimedPlayer
        ? {
            COLOR_TV: '★ COLOR TV PRIZE HALF',
            CONVERTIBLE: '★ CONVERTIBLE PRIZE HALF',
            HAWAII_TRIP: '★ HAWAII JET TRIP HALF',
            TAKE_STEAL: '★ TAKE! +$200 BONUS',
          }
        : {
            COLOR_TV: '◆ COLOR TV HALF · STEAL!',
            CONVERTIBLE: '◆ CONVERTIBLE HALF · STEAL!',
            HAWAII_TRIP: '◆ HAWAII TRIP HALF · STEAL!',
            TAKE_STEAL: '◆ RIVAL TAKE! -$200',
          };
      drawRoundedRectPath(ctx, 72, 360, w - 144, 108, 18);
      ctx.fillStyle = isClaimedPlayer ? '#5C301B' : '#570B0B';
      ctx.fill();
      ctx.strokeStyle = isClaimedPlayer ? '#FFD56B' : '#FECACA';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = '#FFD56B';
      drawFittedBoldText(
        ctx,
        prizeMap[extras.concentrationPrize as Exclude<ConcentrationPrizeKindV7, 'NONE'>],
        w * 0.5,
        414,
        w - 184,
        56,
        36,
        displayFont,
      );
    } else {
      // Iconic 1966 Gold-Rimmed Contestant Medallion Pill (`★ YOU WON` / `◆ RIVAL`)
      drawRoundedRectPath(ctx, 132, 256, w - 264, 178, 32);
      ctx.fillStyle = isClaimedPlayer ? 'rgba(10, 68, 32, 0.52)' : 'rgba(64, 8, 8, 0.52)';
      ctx.fill();
      ctx.strokeStyle = isClaimedPlayer ? '#FFD56B' : '#FECACA';
      ctx.lineWidth = 7;
      ctx.stroke();

      if (isClaimedPlayer) {
        drawStarburstFoilSeal(ctx, 224, 345, 52, 12);
      }
      ctx.fillStyle = '#FFFDF5';
      const stampLabel =
        boardModeV9 === 'HOLLYWOOD_MARQUEE_LINE'
          ? isClaimedPlayer
            ? '⭕  O  WIN!'
            : '❌  X  RIVAL'
          : isClaimedPlayer
            ? 'YOU WON!'
            : '◆ RIVAL';
      drawFittedBoldText(
        ctx,
        stampLabel,
        isClaimedPlayer ? w * 0.56 : w * 0.5,
        348,
        isClaimedPlayer ? w - 420 : w - 320,
        114,
        64,
        displayFont,
      );
    }

    // GOLDEN_DOMINO_CASCADE 1..3 Domino Pip badge in top-left on claimed Player tiles
    if (isClaimedPlayer && tile.dominoGroupId && tile.dominoGroupId > 0) {
      const pipColors = ['#008B94', '#E6397A', '#1746A2'];
      const pipFill = pipColors[(tile.dominoGroupId - 1) % pipColors.length];
      const pipCount = Math.min(3, ((tile.dominoGroupId - 1) % 3) + 1);
      drawRoundedRectPath(ctx, 36, 36, 112, 54, 14);
      ctx.fillStyle = '#FAF2DF';
      ctx.fill();
      ctx.strokeStyle = pipFill;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = pipFill;
      for (let p = 0; p < pipCount; p++) {
        const px = 64 + p * 28;
        ctx.beginPath();
        ctx.arc(px, 63, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawAnodizedOuterBezelAndRivets(ctx, w, h, isClaimedPlayer ? '#FFD56B' : '#FCA5A5', false);
    return;
  }

  // -------------------------------------------------------------------------
  // A2. LIVE-WIRE FUSE LOCKED TILE (`tile.isLiveWireLocked === true`)
  //     Smoked-Acrylite Padlock Clamp + Atomic Tangerine Fuse Bar (Category Dimly Readable!)
  // -------------------------------------------------------------------------
  if (isLiveWireLocked && !isLockedVault) {
    const lwGrad = ctx.createLinearGradient(0, 0, 0, h);
    lwGrad.addColorStop(0.0, '#6E3B23');
    lwGrad.addColorStop(0.55, '#522B19');
    lwGrad.addColorStop(1.0, '#3E2012');
    ctx.fillStyle = lwGrad;
    ctx.fillRect(0, 0, w, h);

    // Copper conduit lines across left/right edges
    ctx.fillStyle = 'rgba(255, 107, 53, 0.24)';
    ctx.fillRect(24, h * 0.5 - 10, w - 48, 20);
    ctx.fillRect(w * 0.5 - 10, 140, 20, h - 164);

    // Segmented Atomic Tangerine & Harvest Gold Fuse Top Bar
    ctx.fillStyle = '#3E2012';
    ctx.fillRect(20, 20, w - 40, 114);
    for (let sx = 34; sx < w - 70; sx += 64) {
      ctx.fillStyle = (sx / 64) % 2 === 0 ? '#FF6B35' : '#F2A922';
      ctx.fillRect(sx, 26, 48, 16);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '🔒 LIVE-WIRE · LOCKED', w * 0.5, 88, w - 108, 52, 34, displayFont);

    // Dimly readable cream category for route planning
    ctx.fillStyle = 'rgba(250, 242, 223, 0.72)';
    drawFittedBoldText(ctx, displayCategory, w * 0.5, 214, w - 110, 78, 46, displayFont);

    ctx.fillStyle = '#FFD166';
    drawFittedBoldText(ctx, `$${shownChips}`, w * 0.5, 326, w - 140, 108, 72, numericFont);

    drawRoundedRectPath(ctx, 64, h - 102, w - 128, 76, 16);
    ctx.fillStyle = '#4F2917';
    ctx.fill();
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#FFF6E3';
    drawFittedBoldText(ctx, 'WIN ADJACENT TO SPARK OPEN', w * 0.5, h - 63, w - 168, 46, 34, displayFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#FF6B35', false);
    return;
  }

  // -------------------------------------------------------------------------
  // A3. BLACKOUT VAULT (`Can't see either` — #1..#12 Safe Trilon + ⚡ HIGH-VOLT)
  // -------------------------------------------------------------------------
  if (isBlackoutShutter && !isLockedVault && !isTopologyLocked) {
    const bvGrad = ctx.createLinearGradient(0, 0, 0, h);
    bvGrad.addColorStop(0.0, '#6E3B23');
    bvGrad.addColorStop(0.5, '#582F1B');
    bvGrad.addColorStop(1.0, '#432213');
    ctx.fillStyle = bvGrad;
    ctx.fillRect(0, 0, w, h);

    // Brass cabinet corner struts & safe dial ring
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.32)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(w * 0.5, 310, 134, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = extras.isHighVoltDoor ? '#D9480F' : '#D9A441';
    ctx.fillRect(20, 20, w - 40, 116);
    ctx.textAlign = 'center';
    ctx.fillStyle = extras.isHighVoltDoor ? '#FFFDF7' : '#241309';
    drawFittedBoldText(
      ctx,
      extras.isHighVoltDoor ? '⚡ HIGH-VOLT BLACKOUT!' : '🎩 BLACKOUT SAFE',
      w * 0.5,
      78,
      w - 108,
      56,
      36,
      displayFont,
    );

    ctx.fillStyle = '#FAF2DF';
    drawFittedBoldText(
      ctx,
      `SAFE #${tile.index + 1}`,
      w * 0.5,
      276,
      w - 140,
      148,
      88,
      numericFont,
    );

    drawRoundedRectPath(ctx, 180, 382, w - 360, 74, 18);
    ctx.fillStyle = '#3E2012';
    ctx.fill();
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#FFD166';
    drawFittedBoldText(ctx, 'FLIP TO REVEAL · ? & $???', w * 0.5, 419, w - 400, 38, 28, displayFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, extras.isHighVoltDoor ? '#FF6B35' : '#D9A441', false);
    return;
  }

  // -------------------------------------------------------------------------
  // A4. LOUVER SHUTTER (`Can't see category` — Venetian Slats Top, Bright $ Bottom)
  // -------------------------------------------------------------------------
  if (isR7LouverShutter && !isLockedVault && !isTopologyLocked) {
    const lsGrad = ctx.createRadialGradient(w * 0.5, h * 0.65, 36, w * 0.5, h * 0.65, w * 0.64);
    lsGrad.addColorStop(0.0, '#FFFDF7');
    lsGrad.addColorStop(1.0, '#EFE0BE');
    ctx.fillStyle = lsGrad;
    ctx.fillRect(0, 0, w, h);

    // Venetian shutter louver blind covering upper half (concealing category cleanly!)
    ctx.fillStyle = '#006B74';
    ctx.fillRect(20, 20, w - 40, 232);
    for (let ly = 36; ly < 244; ly += 26) {
      ctx.fillStyle = 'rgba(250, 242, 223, 0.22)';
      ctx.fillRect(32, ly, w - 64, 9);
      ctx.fillStyle = 'rgba(30, 20, 14, 0.22)';
      ctx.fillRect(32, ly + 13, w - 64, 5);
    }

    drawRoundedRectPath(ctx, 168, 72, w - 336, 128, 22);
    ctx.fillStyle = '#4F2917';
    ctx.fill();
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD166';
    drawFittedBoldText(ctx, '🕶️ TOPIC SHUTTERED', w * 0.5, 136, w - 380, 56, 36, displayFont);

    ctx.fillStyle = '#1E140E';
    drawFittedBoldText(ctx, `$${shownChips}`, w * 0.5, 382, w - 120, 184, 114, numericFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#008B94', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // A5. BLIND PURSE (`Can't see money` — Category Open, Cerise/Brass $??? Flap)
  // -------------------------------------------------------------------------
  if (isR7BlindPurse && !isLockedVault && !isTopologyLocked) {
    const bpGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 36, w * 0.5, h * 0.5, w * 0.65);
    bpGrad.addColorStop(0.0, '#FFFDF7');
    bpGrad.addColorStop(1.0, '#F5E4CA');
    ctx.fillStyle = bpGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#E6397A';
    ctx.fillRect(20, 20, w - 40, 112);
    ctx.fillStyle = '#F2A922';
    ctx.fillRect(20, 128, w - 40, 8);

    drawCategoryBrassGlyph(ctx, tile.category, 78, 76, 34, '#FFFDF7');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFDF7';
    drawFittedBoldText(ctx, '💸 BLIND PURSE', 132, 76, w - 180, 56, 36, displayFont);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1E140E';
    drawFittedBoldText(ctx, displayCategory, w * 0.5, 222, w - 104, 104, 58, displayFont);

    drawRoundedRectPath(ctx, 180, 304, w - 360, 146, 26);
    ctx.fillStyle = '#E6397A';
    ctx.fill();
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.fillStyle = '#FFFDF7';
    drawFittedBoldText(ctx, '$ ???', w * 0.5, 378, w - 400, 126, 84, numericFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#E6397A', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // B0. TOPOLOGY-LOCKED SHUTTER (`PYRAMID_CLIMB` | `KEY_AND_SAFE` | `CENTER_STARBURST` | `ROVING_SPOTLIGHT`)
  //     Sunlit 1966 American Walnut & Brushed Champagne-Brass Solari Louvers (Zero Dark-Blue Boxes!)
  // -------------------------------------------------------------------------
  if (isTopologyLocked && !isLockedVault) {
    const shutGrad = ctx.createLinearGradient(0, 0, 0, h);
    shutGrad.addColorStop(0.0, '#7E4728');
    shutGrad.addColorStop(0.5, '#5E321B');
    shutGrad.addColorStop(1.0, '#452312');
    ctx.fillStyle = shutGrad;
    ctx.fillRect(0, 0, w, h);

    // 7 Motorized horizontal sunlit walnut & brass Solari shutter louver slats
    for (let sy = 140; sy < h - 32; sy += 46) {
      ctx.fillStyle = 'rgba(255, 232, 184, 0.14)';
      ctx.fillRect(28, sy, w - 56, 13);
      ctx.fillStyle = 'rgba(38, 17, 7, 0.38)';
      ctx.fillRect(28, sy + 28, w - 56, 10);
    }

    // Brushed Champagne-Brass Header Bar
    const hdrGrad = ctx.createLinearGradient(0, 20, 0, 130);
    hdrGrad.addColorStop(0.0, '#FFE38E');
    hdrGrad.addColorStop(1.0, '#D99B2B');
    ctx.fillStyle = hdrGrad;
    ctx.fillRect(20, 20, w - 40, 110);
    ctx.fillStyle = '#FFF9E6';
    ctx.fillRect(20, 128, w - 40, 6);

    const lockHeader = extras.isRovingSpotlightBoard
      ? '✦ AWAITING SPOTLIGHT'
      : extras.hasBrassKeyOnBoard
        ? '★ SAFE SHUTTERED · NEED KEY'
        : '▲ SHUTTERED · WIN ADJACENT';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#241309';
    drawFittedBoldText(ctx, lockHeader, w * 0.5, 76, w - 110, 52, 34, displayFont);

    const catText =
      isBlindCategory && tile.blindCategoryHidden !== false ? '★ ? · ? · ? ★' : displayCategory;
    ctx.fillStyle = '#FFF6E3';
    drawFittedBoldText(ctx, catText, w * 0.5, 224, w - 108, 86, 52, displayFont);

    const stakeText =
      isMysteryCash && tile.mysteryCashHidden !== false ? '$???' : `$${shownChips}`;
    ctx.fillStyle = '#FFE082';
    drawFittedBoldText(ctx, stakeText, w * 0.5, 368, w - 120, 138, 84, numericFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#D9A441', false);
    return;
  }

  // -------------------------------------------------------------------------
  // B. LOCKED GOLD VAULT (`isVaultLocked === true`) — 24K Gold Bank Vault Bars!
  // -------------------------------------------------------------------------
  if (isLockedVault) {
    const vaultGrad = ctx.createLinearGradient(0, 0, 0, h);
    vaultGrad.addColorStop(0, '#6A3B1F');
    vaultGrad.addColorStop(0.5, '#4A2714');
    vaultGrad.addColorStop(1, '#5D331B');
    ctx.fillStyle = vaultGrad;
    ctx.fillRect(0, 0, w, h);

    // Horizontal burnished bronze vault cross-beam behind vertical gold bars
    ctx.fillStyle = '#8C5A2B';
    ctx.fillRect(28, 238, w - 56, 26);

    // 7 Sculpted Cylindrical 24K Gold Bank Vault Bars spanning behind the $500 badge!
    for (let bx = 116; bx <= w - 116; bx += 132) {
      const barG = ctx.createLinearGradient(bx - 16, 0, bx + 16, 0);
      barG.addColorStop(0.0, '#8C5208');
      barG.addColorStop(0.35, '#FFF3B0');
      barG.addColorStop(0.65, '#F4A91F');
      barG.addColorStop(1.0, '#703F04');
      ctx.fillStyle = barG;
      ctx.fillRect(bx - 15, 134, 30, h - 158);
    }

    // Top Gold Vault Header Band (dedicated right-hand bay reserved for sculpted 3D Gold Padlock!)
    ctx.fillStyle = '#F4A91F';
    ctx.fillRect(20, 20, w - 40, 114);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#241309';
    drawFittedBoldText(ctx, '★ LOCKED GOLD VAULT', 48, 78, w - 264, 60, 40, displayFont);
    ctx.textAlign = 'center';

    // High-contrast sunlit espresso-walnut backing plate behind $500 so gold vault bars frame it cleanly
    drawRoundedRectPath(ctx, 244, 150, w - 488, 156, 24);
    ctx.fillStyle = 'rgba(56, 28, 13, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#FFD56B';
    ctx.font = `900 152px ${numericFont}`;
    ctx.fillText('$500', w * 0.5, 232);

    // Clear, large mobile-legible unlock rule ribbon
    drawRoundedRectPath(ctx, 38, 336, w - 76, 132, 20);
    ctx.fillStyle = 'rgba(56, 28, 13, 0.96)';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, 'WIN ADJACENT OR 2× STREAK', w * 0.5, 404, w - 108, 72, 48, displayFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#F4A91F', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // C. REVEALED SECRET SQUARE — Blazing 1966 Gold Sunburst & Starburst Foil Seal
  // -------------------------------------------------------------------------
  if (isSecretRevealed) {
    const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.64);
    sunGrad.addColorStop(0, '#FFF9D6');
    sunGrad.addColorStop(0.55, '#F6BE3B');
    sunGrad.addColorStop(1, '#DF8B12');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w * 0.5, h * 0.5);
    ctx.fillStyle = 'rgba(255, 252, 232, 0.32)';
    for (let r = 0; r < 16; r++) {
      ctx.rotate(Math.PI / 8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-42, -w * 0.62);
      ctx.lineTo(42, -w * 0.62);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#5C301B';
    ctx.fillRect(20, 20, w - 40, 120);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '★ 2X SECRET SQUARE!', w * 0.5, 82, w - 96, 66, 44, displayFont);

    drawStarburstFoilSeal(ctx, 134, 356, 74, 16);

    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, displayCategory, w * 0.54, 224, w - 260, 96, 54, displayFont);
    drawFittedBoldText(
      ctx,
      `$${shownChips} · 2×`,
      w * 0.56,
      382,
      w - 280,
      142,
      80,
      numericFont,
    );

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#3E2012', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // D1. BLIND CATEGORY (`★ MYSTERY SUBJECT · ???` Gold Shutter — ZERO duplicate text!)
  // -------------------------------------------------------------------------
  if (isBlindCategory) {
    const goldShut = ctx.createLinearGradient(0, 136, 0, h);
    goldShut.addColorStop(0.0, '#FFF9DF');
    goldShut.addColorStop(0.55, '#FBE29A');
    goldShut.addColorStop(1.0, '#F0C05A');
    ctx.fillStyle = goldShut;
    ctx.fillRect(0, 0, w, h);

    // Subtle horizontal gold mystery shutter ribs
    for (let sy = 148; sy < h - 30; sy += 38) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.fillRect(28, sy, w - 56, 10);
      ctx.fillStyle = 'rgba(140, 82, 8, 0.14)';
      ctx.fillRect(28, sy + 24, w - 56, 6);
    }

    ctx.fillStyle = '#5C301B';
    ctx.fillRect(20, 20, w - 40, 116);
    ctx.fillStyle = '#F4A91F';
    ctx.fillRect(20, 132, w - 40, 8);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '★ MYSTERY SUBJECT · ???', w * 0.5, 78, w - 108, 60, 40, displayFont);

    const blindHidden = tile.blindCategoryHidden !== false;
    if (blindHidden) {
      // Sculpted 1966 Gold & Walnut Mystery Question Medallion (`? · ★ · ?` — zero duplicate "BLIND CATEGORY" label!)
      drawRoundedRectPath(ctx, 184, 160, w - 368, 116, 58);
      ctx.fillStyle = '#5C301B';
      ctx.fill();
      ctx.strokeStyle = '#F4A91F';
      ctx.lineWidth = 7;
      ctx.stroke();

      drawStarburstFoilSeal(ctx, w * 0.5, 218, 42, 12);
      ctx.fillStyle = '#FFD56B';
      ctx.font = `900 80px ${numericFont}`;
      ctx.fillText('?', 278, 222);
      ctx.fillText('?', w - 278, 222);
      ctx.fillStyle = '#FFF9EC';
      ctx.font = `900 58px ${numericFont}`;
      ctx.fillText('?', 372, 220);
      ctx.fillText('?', w - 372, 220);
    } else {
      drawRoundedRectPath(ctx, 72, 166, w - 144, 108, 18);
      ctx.fillStyle = '#FFF9EC';
      ctx.fill();
      ctx.strokeStyle = '#121A2B';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.fillStyle = '#121A2B';
      drawFittedBoldText(ctx, displayCategory, w * 0.5, 222, w - 184, 78, 48, displayFont);
    }

    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, `$${shownChips}`, w * 0.5, 396, w - 120, 178, 112, numericFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#F4A91F', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // D2. MYSTERY CASH (`CATEGORY · $???` Wax-Sealed Cash Envelope!)
  // -------------------------------------------------------------------------
  if (isMysteryCash) {
    const creamGrad = ctx.createRadialGradient(w * 0.5, h * 0.54, 40, w * 0.5, h * 0.54, w * 0.64);
    creamGrad.addColorStop(0.0, '#FFF9EC');
    creamGrad.addColorStop(1.0, '#F2E2C4');
    ctx.fillStyle = creamGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#00796B';
    ctx.fillRect(20, 20, w - 40, 116);
    ctx.fillStyle = '#F4A91F';
    ctx.fillRect(20, 132, w - 40, 8);

    drawCategoryBrassGlyph(ctx, tile.category, 78, 78, 36, '#FFF9EC');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, '✦ MYSTERY CASH', 132, 78, w - 180, 58, 38, displayFont);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, displayCategory, w * 0.5, 214, w - 96, 104, 58, displayFont);

    // 1966 Golden-Manila Prize Envelope + 12-Lobe Scalloped Crimson Wax Seal in lower half
    ctx.save();
    drawRoundedRectPath(ctx, 78, 294, 320, 174, 18);
    ctx.fillStyle = 'rgba(79, 41, 23, 0.18)';
    ctx.fill();
    drawRoundedRectPath(ctx, 70, 284, 320, 174, 18);
    const envGrad = ctx.createLinearGradient(70, 284, 70, 458);
    envGrad.addColorStop(0.0, '#FFE9B5');
    envGrad.addColorStop(1.0, '#F1C66D');
    ctx.fillStyle = envGrad;
    ctx.fill();
    ctx.strokeStyle = '#1E140E';
    ctx.lineWidth = 5.5;
    ctx.stroke();

    // Inner parchment treasury rule
    drawRoundedRectPath(ctx, 82, 296, 296, 150, 12);
    ctx.strokeStyle = 'rgba(140, 82, 8, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Bottom pocket diagonal fold creases + top V-flap
    ctx.strokeStyle = 'rgba(79, 41, 23, 0.34)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(78, 450);
    ctx.lineTo(188, 368);
    ctx.moveTo(382, 450);
    ctx.lineTo(272, 368);
    ctx.stroke();

    ctx.strokeStyle = '#1E140E';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(76, 290);
    ctx.lineTo(230, 382);
    ctx.lineTo(384, 290);
    ctx.stroke();

    // 12-Lobe Scalloped Crimson Sealing-Wax Rosette + Specular Rim + Gold `$` Stamp
    const wx = 230;
    const wy = 380;
    ctx.fillStyle = '#B81442';
    ctx.beginPath();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const r = i % 2 === 0 ? 41 : 35;
      const px = wx + Math.cos(a) * r;
      const py = wy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6E0824';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#E01E5A';
    ctx.beginPath();
    ctx.arc(wx, wy, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFF9EC';
    ctx.font = `900 36px ${numericFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('$', wx, wy + 2);
    ctx.restore();

    const cashLabel = tile.mysteryCashHidden !== false ? '$???' : `$${shownChips}`;
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, cashLabel, 668, 382, 500, 172, 108, numericFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#00796B', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // D3. BIG WHEEL SPIN (Colorful 20-Wedge `🎡 BIG WHEEL`!)
  // -------------------------------------------------------------------------
  if (isBigWheel) {
    const creamGrad = ctx.createRadialGradient(w * 0.56, h * 0.56, 36, w * 0.5, h * 0.56, w * 0.65);
    creamGrad.addColorStop(0.0, '#FFF9EC');
    creamGrad.addColorStop(1.0, '#F2E2C4');
    ctx.fillStyle = creamGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#C2185B';
    ctx.fillRect(20, 20, w - 40, 116);
    ctx.fillStyle = '#F4A91F';
    ctx.fillRect(20, 132, w - 40, 8);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, '★ BIG WHEEL SPIN!', w * 0.5, 78, w - 108, 60, 40, displayFont);

    // Colorful 20-wedge 1966 Studio Wheel on left bay
    drawBigWheel20WedgeEmblem(ctx, 162, 318, 110);

    // Crisp category + stake on right bay (>= 130px clean cream gap before `SPIN!` badge!)
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, displayCategory, 632, 220, 612, 94, 52, displayFont);
    drawFittedBoldText(ctx, `$${shownChips}`, 478, 386, 316, 144, 92, numericFont);

    drawRoundedRectPath(ctx, w - 246, 332, 198, 108, 18);
    ctx.fillStyle = '#F4A91F';
    ctx.fill();
    ctx.strokeStyle = '#121A2B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, 'SPIN!', w - 147, 388, 172, 56, 36, displayFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#C2185B', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // D4. BRASS SAFE KEY (`🗝️ BRASS SAFE KEY`!)
  // -------------------------------------------------------------------------
  if (isBrassKey) {
    const creamGrad = ctx.createRadialGradient(w * 0.55, h * 0.55, 36, w * 0.5, h * 0.55, w * 0.65);
    creamGrad.addColorStop(0.0, '#FFF9EC');
    creamGrad.addColorStop(1.0, '#F3DFAC');
    ctx.fillStyle = creamGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#5C301B';
    ctx.fillRect(20, 20, w - 40, 116);
    ctx.fillStyle = '#F4A91F';
    ctx.fillRect(20, 132, w - 40, 8);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '★ BRASS SAFE KEY', w * 0.5, 78, w - 108, 60, 40, displayFont);

    drawBrassSafeKeyEmblem(ctx, 164, 322, 1.2);

    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, displayCategory, 632, 220, 612, 94, 52, displayFont);
    drawFittedBoldText(ctx, `$${shownChips}`, 476, 386, 312, 144, 92, numericFont);

    drawRoundedRectPath(ctx, w - 252, 332, 204, 108, 18);
    ctx.fillStyle = '#5C301B';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '+KEY!', w - 150, 388, 176, 54, 36, displayFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#F4A91F', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // D5. PRESS YOUR LUCK GREMLIN SPIN (`⚡ GREMLIN SPIN`!)
  // -------------------------------------------------------------------------
  if (isPressLuckSpin) {
    const creamGrad = ctx.createRadialGradient(w * 0.5, h * 0.56, 36, w * 0.5, h * 0.56, w * 0.65);
    creamGrad.addColorStop(0.0, '#FFF9EC');
    creamGrad.addColorStop(1.0, '#F2E2C4');
    ctx.fillStyle = creamGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#D9381E';
    ctx.fillRect(20, 20, w - 40, 116);
    ctx.fillStyle = '#FFD56B';
    ctx.fillRect(20, 132, w - 40, 8);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, '⚡ GREMLIN LIGHT-SPIN!', w * 0.5, 78, w - 108, 58, 38, displayFont);

    // Chasing 1966 light-board mini squares flanking left & right edges
    const sqColors = ['#0096A6', '#F4A91F', '#E63B7A', '#1E56C5', '#FF6738'];
    for (let i = 0; i < 5; i++) {
      const sy = 156 + i * 62;
      for (const sx of [38, w - 76]) {
        ctx.fillStyle = sqColors[(i + (sx > 100 ? 2 : 0)) % sqColors.length];
        ctx.fillRect(sx, sy, 38, 48);
        ctx.strokeStyle = '#121A2B';
        ctx.lineWidth = 3;
        ctx.strokeRect(sx, sy, 38, 48);
      }
    }

    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, displayCategory, w * 0.5, 220, w - 210, 98, 54, displayFont);
    drawFittedBoldText(ctx, `$${shownChips}`, 338, 390, 328, 148, 94, numericFont);

    drawRoundedRectPath(ctx, w - 354, 336, 254, 106, 18);
    ctx.fillStyle = '#121A2B';
    ctx.fill();
    ctx.strokeStyle = '#FF6738';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '+SPINS!', w - 227, 390, 224, 54, 36, displayFont);

    drawAnodizedOuterBezelAndRivets(ctx, w, h, '#FF6738', isKeyholderShielded);
    return;
  }

  // -------------------------------------------------------------------------
  // D6. STANDARD, VIP BLUFF, UNLOCKED VAULT, MYSTERY CURTAIN, OPPONENT CHOICE & SHOWCASE
  // -------------------------------------------------------------------------
  const vipSpec =
    isVipBluff && tile.vipId
      ? VIP_CELEB_CATALOG_V9.find((v) => v.targetId === tile.vipId)
      : undefined;

  const seasonSpec = extras.seasonSpec;
  const seasonNum = seasonSpec?.season ?? 1;
  const isDefaultCreamStyle = trilonStyle.id === 'trilon_acrylite_cream' && Boolean(seasonSpec);
  const defaultSeasonFrameStroke = isDefaultCreamStyle
    ? seasonNum === 2
      ? '#FF6B35'
      : seasonNum === 3
        ? '#D9A441'
        : seasonNum === 4
          ? '#1746A2'
          : pal.primaryHex
    : pal.primaryHex;

  let headerBg = trilonStyle.headerBgOverride ?? pal.primaryHex;
  let headerInk = trilonStyle.headerBgOverride ? '#FFFDF7' : pal.headerInkHex;
  let frameStroke = trilonStyle.frameStrokeOverride ?? defaultSeasonFrameStroke;
  let badgeText = pal.label;
  let vipBadgeLabel = '';

  if (isVipBluff) {
    headerBg = '#E6397A';
    headerInk = '#FFFDF7';
    frameStroke = '#E6397A';
    vipBadgeLabel = vipSpec ? vipSpec.name.toUpperCase() : 'VIP GUEST';
    badgeText = '★ VIP BLUFF';
  } else if (isUnlockedVault) {
    headerBg = '#F4A91F';
    headerInk = '#1E140E';
    frameStroke = '#F4A91F';
    badgeText = '★ VAULT OPEN!';
  } else if (isMysteryCurtain) {
    headerBg = '#B81448';
    headerInk = '#FFF9EC';
    frameStroke = '#C2185B';
    badgeText = extras.rolledMysteryOutcome
      ? `CURTAIN #${extras.curtainNumber} WILD!`
      : `★ CURTAIN #${extras.curtainNumber}`;
  } else if (isOpponentPick) {
    headerBg = '#B81D48';
    headerInk = '#FFF9EC';
    frameStroke = '#C2185B';
    badgeText = "◆ RIVAL'S DARE";
  } else if (isInstantBargain) {
    headerBg = '#D9480F';
    headerInk = '#FFF9EC';
    frameStroke = '#FF6738';
    badgeText = '★ BARGAIN BELL';
  } else if (isShowcaseBonus) {
    headerBg = '#007C8A';
    headerInk = '#FFF9EC';
    frameStroke = '#F4A91F';
    badgeText = '★ TV SHOWCASE';
  } else if (isSpotlightTile) {
    headerBg = '#F2A922';
    headerInk = '#1E140E';
    frameStroke = '#F2A922';
    badgeText = boardModeV9 === 'SHIFTING_SPOTLIGHT' ? '🔦 1.5×/2× SPOTLIGHT' : '✦ SPOTLIGHT LIVE';
  } else if (boardModeV9 === 'LIVE_WIRE_FUSE') {
    headerBg = '#15803D';
    headerInk = '#FFFDF7';
    frameStroke = '#15803D';
    badgeText = '▶ PLAY · LIVE CIRCUIT';
  } else if (boardModeV9 === 'PRESSURE_COOKER' && (extras.pressureCookerMult ?? 1) > 1) {
    const pMult = extras.pressureCookerMult ?? 1;
    headerBg = pMult >= 2 ? '#FF6B35' : '#D9820B';
    headerInk = '#FFFDF7';
    frameStroke = headerBg;
    badgeText = `♨️ BOILER ×${pMult.toFixed(2)}`;
  } else if (extras.dominoAdjacentHint && boardModeV9 === 'GOLDEN_DOMINO_CASCADE') {
    badgeText = '🟨 DOMINO LINK';
  } else if (tile.isWheelhouse) {
    badgeText = '★ WEAK SPOT';
  } else if (tile.isRiggedSolenoid) {
    badgeText = 'HOT SPOT';
  }

  // 1. NTSC-Safe Luminous Warm Broadcast Cream / Equipped Trilon Cosmetic Face!
  const windowGrad = ctx.createRadialGradient(w * 0.5, h * 0.56, 40, w * 0.5, h * 0.56, w * 0.66);
  if (isUnlockedVault || tile.state === 'BLITZ_SURVIVOR' || isSpotlightTile) {
    windowGrad.addColorStop(0.0, '#FFFBEB');
    windowGrad.addColorStop(0.65, '#FAF0D2');
    windowGrad.addColorStop(1.0, '#F5DFA4');
  } else if (isMysteryCurtain || isVipBluff) {
    windowGrad.addColorStop(0.0, '#FFF9EC');
    windowGrad.addColorStop(0.7, '#F9EDE6');
    windowGrad.addColorStop(1.0, '#F2D8E2');
  } else if (isDefaultCreamStyle) {
    if (seasonNum === 2) {
      windowGrad.addColorStop(0.0, '#FFFDF7');
      windowGrad.addColorStop(0.68, '#FFF0E4');
      windowGrad.addColorStop(1.0, '#FFE0CA');
    } else if (seasonNum === 3) {
      windowGrad.addColorStop(0.0, '#FFF9E8');
      windowGrad.addColorStop(0.68, '#FAEDC4');
      windowGrad.addColorStop(1.0, '#F2D890');
    } else if (seasonNum === 4) {
      windowGrad.addColorStop(0.0, '#FFFDF9');
      windowGrad.addColorStop(0.68, '#EEF4FF');
      windowGrad.addColorStop(1.0, '#DCE8FF');
    } else {
      windowGrad.addColorStop(0.0, '#FFF9EC');
      windowGrad.addColorStop(0.68, '#F8EED8');
      windowGrad.addColorStop(1.0, '#F2E2C4');
    }
  } else {
    windowGrad.addColorStop(0.0, trilonStyle.faceCenterHex);
    windowGrad.addColorStop(0.68, trilonStyle.faceMidHex);
    windowGrad.addColorStop(1.0, trilonStyle.faceEdgeHex);
  }
  ctx.fillStyle = windowGrad;
  ctx.fillRect(0, 0, w, h);

  // Seasonal Mid-Century Plaque Corner Motifs (strictly outside text/pill zones!)
  if (isDefaultCreamStyle && !isMysteryCurtain && !isVipBluff) {
    if (seasonNum === 1) {
      ctx.strokeStyle = '#008B94';
      ctx.lineWidth = 4;
      for (const [cx, cy, dx, dy] of [
        [42, 150, 26, 26],
        [w - 42, 150, -26, 26],
        [42, h - 42, 26, -26],
        [w - 42, h - 42, -26, -26],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(cx + dx, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + dy);
        ctx.stroke();
      }
    } else if (seasonNum === 2) {
      drawFourPointStarburst(ctx, 54, 166, 16, 5, '#FF6B35');
      drawFourPointStarburst(ctx, w - 54, 166, 16, 5, '#E6397A');
      drawFourPointStarburst(ctx, 54, h - 54, 16, 5, '#E6397A');
      drawFourPointStarburst(ctx, w - 54, h - 54, 16, 5, '#FF6B35');
    } else if (seasonNum === 3) {
      ctx.strokeStyle = '#D9A441';
      ctx.lineWidth = 3;
      ctx.strokeRect(32, 32, w - 64, h - 64);
      ctx.strokeStyle = '#15803D';
      ctx.lineWidth = 2;
      ctx.strokeRect(38, 142, w - 76, h - 180);
      for (const [dx, dy] of [
        [54, 166],
        [w - 54, 166],
        [54, h - 54],
        [w - 54, h - 54],
      ] as const) {
        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        ctx.moveTo(dx, dy - 12);
        ctx.lineTo(dx + 12, dy);
        ctx.lineTo(dx, dy + 12);
        ctx.lineTo(dx - 12, dy);
        ctx.closePath();
        ctx.fill();
      }
    } else if (seasonNum === 4) {
      ctx.lineWidth = 6;
      for (const [cx, cy, sx, sy] of [
        [34, 146, 1, 1],
        [w - 34, 146, -1, 1],
        [34, h - 34, 1, -1],
        [w - 34, h - 34, -1, -1],
      ] as const) {
        ctx.strokeStyle = '#1746A2';
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * 30);
        ctx.lineTo(cx + sx * 30, cy);
        ctx.stroke();
        ctx.strokeStyle = '#F2A922';
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * 16);
        ctx.lineTo(cx + sx * 16, cy);
        ctx.stroke();
      }
    }
  }

  // Mod Cerise Checkerboard edge trim when `trilon_cerise_checker` is equipped
  if (trilonStyle.isCheckerBorder) {
    const chk = 26;
    for (let x = 24; x < w - 24; x += chk * 2) {
      ctx.fillStyle = 'rgba(230, 57, 122, 0.24)';
      ctx.fillRect(x, h - 42, chk, 20);
      ctx.fillRect(x + chk, 136, chk, 14);
    }
  }

  // Scalloped 1966 Crimson Velvet Valance & Side Drape Pleats on `MYSTERY_CURTAIN` (compact scallops — zero category overlap!)
  if (isMysteryCurtain) {
    ctx.fillStyle = 'rgba(184, 20, 72, 0.13)';
    for (let sx = 28; sx < 92; sx += 24) {
      ctx.fillRect(sx, 136, 14, h - 160);
      ctx.fillRect(w - sx - 14, 136, 14, h - 160);
    }
    ctx.fillStyle = '#9E103C';
    const scallops = 16;
    const sw = (w - 56) / scallops;
    for (let s = 0; s < scallops; s++) {
      const cx = 28 + (s + 0.5) * sw;
      ctx.beginPath();
      ctx.arc(cx, 136, sw * 0.5, 0, Math.PI);
      ctx.fill();
    }
    ctx.strokeStyle = '#F4A91F';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let s = 0; s < scallops; s++) {
      const cx = 28 + (s + 0.5) * sw;
      ctx.arc(cx, 136, sw * 0.5, 0, Math.PI);
    }
    ctx.stroke();
  }

  // Crisscrossing Studio Follow-Spotlight Beams on `OPPONENT_CHOICE`!
  if (isOpponentPick) {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 169, 31, 0.16)';
    ctx.beginPath();
    ctx.moveTo(40, 136);
    ctx.lineTo(220, 136);
    ctx.lineTo(w * 0.72, h - 24);
    ctx.lineTo(w * 0.34, h - 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(230, 59, 122, 0.12)';
    ctx.beginPath();
    ctx.moveTo(w - 40, 136);
    ctx.lineTo(w - 220, 136);
    ctx.lineTo(w * 0.28, h - 24);
    ctx.lineTo(w * 0.66, h - 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Top Header Band (`y = 20..136`) — Iconic Living Color Category / Twist Ribbon
  ctx.fillStyle = headerBg;
  ctx.fillRect(20, 20, w - 40, 116);

  if (isDefaultCreamStyle && !isShowcaseBonus && !isUnlockedVault && seasonNum === 2) {
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(20, 132, w - 40, 4);
    ctx.fillStyle = '#E6397A';
    ctx.fillRect(20, 136, w - 40, 4);
  } else if (isDefaultCreamStyle && !isShowcaseBonus && !isUnlockedVault && seasonNum === 3) {
    ctx.fillStyle = '#D9A441';
    ctx.fillRect(20, 132, w - 40, 6);
    ctx.fillStyle = '#15803D';
    ctx.fillRect(20, 138, w - 40, 3);
  } else if (isDefaultCreamStyle && !isShowcaseBonus && !isUnlockedVault && seasonNum === 4) {
    ctx.fillStyle = '#1746A2';
    ctx.fillRect(20, 132, (w - 40) * 0.5, 8);
    ctx.fillStyle = '#F2A922';
    ctx.fillRect(20 + (w - 40) * 0.5, 132, (w - 40) * 0.5, 8);
  } else {
    ctx.fillStyle =
      isShowcaseBonus || isUnlockedVault
        ? '#F4A91F'
        : trilonStyle.frameStrokeOverride
          ? trilonStyle.frameStrokeOverride
          : (seasonSpec?.tileAccentHex ?? 'rgba(79, 41, 23, 0.26)');
    ctx.fillRect(20, 132, w - 40, 8);
  }

  // Left: Category Vector Glyph inside crisp medallion
  drawCategoryBrassGlyph(ctx, tile.category, 78, 78, 36, headerInk);

  // Right: High-Contrast Multiplier Pill if active (e.g. `1.5×`, `+0.5×`)
  const multBonus = tile.boardMultBonus;
  const showMultPill = multBonus >= 0.1 || isOpponentPick;
  let rightReserved = 42;
  if (showMultPill) {
    const multText = isOpponentPick
      ? '1.5×'
      : `+${multBonus.toFixed((multBonus * 10) % 1 === 0 ? 1 : 2)}×`;
    const pillW = 204;
    const pillH = 80;
    const pillX = w - pillW - 36;
    const pillY = 38;
    rightReserved = pillW + 56;

    drawRoundedRectPath(ctx, pillX, pillY, pillW, pillH, 16);
    ctx.fillStyle = highContrastBadges ? '#1E140E' : '#5C301B';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, multText, pillX + pillW * 0.5, pillY + pillH * 0.53, pillW - 22, 54, 36, numericFont);
  }

  // Header Status / Twist Badge Text
  ctx.textAlign = 'left';
  ctx.fillStyle = headerInk;
  const headerMaxW = w - 140 - rightReserved;
  drawFittedBoldText(
    ctx,
    badgeText,
    132,
    78,
    headerMaxW,
    isVipBluff ? 62 : 54,
    isVipBluff ? 42 : 34,
    displayFont,
  );

  const showChampTargetPill = Boolean(tile.isRivalTarget && !isMysteryCurtain);
  const hasBottomStatusPill = showChampTargetPill || isKeyholderShielded;
  const useVipBottomPill = isVipBluff && !hasBottomStatusPill;
  const useVipMidPill = isVipBluff && hasBottomStatusPill;
  const elevateStandardBody = hasBottomStatusPill || useVipBottomPill;

  // 4. HERO LEGIBILITY FIRST: BOLD 1966 GEOMETRIC CATEGORY TITLE (`#121A2B` >= 13.7:1 contrast!)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#121A2B';
  drawFittedBoldText(
    ctx,
    displayCategory,
    w * 0.5,
    useVipMidPill ? 182 : isMysteryCurtain ? 242 : elevateStandardBody ? 196 : 224,
    w - (isMysteryCurtain ? 156 : 96),
    useVipMidPill ? 76 : elevateStandardBody ? 94 : 112,
    useVipMidPill ? 46 : elevateStandardBody ? 54 : 62,
    displayFont,
  );

  if (useVipMidPill) {
    drawRoundedRectPath(ctx, 64, 224, w - 128, 66, 14);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.strokeStyle = '#E6397A';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9E103C';
    drawFittedBoldText(ctx, `🎭 ${vipBadgeLabel}`, w * 0.5, 257, w - 168, 44, 34, displayFont);
  } else {
    // Clean horizontal mid-century domain accent rule
    const ruleY = elevateStandardBody ? 256 : 298;
    ctx.strokeStyle =
      isDefaultCreamStyle && seasonNum === 4
        ? '#1746A2'
        : isDefaultCreamStyle && seasonNum === 3
          ? '#15803D'
          : isDefaultCreamStyle && seasonNum === 2
            ? '#FF6B35'
            : pal.primaryHex;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(84, ruleY);
    ctx.lineTo(w - 84, ruleY);
    ctx.stroke();
  }

  // Subtle connoisseur gold starburst foil seal on unrevealed `SECRET_SQUARE`!
  if (tvTwist === 'SECRET_SQUARE' && !isSecretRevealed) {
    drawStarburstFoilSeal(ctx, 88, elevateStandardBody ? 332 : 424, 36, 12);
  }

  // 5. MONUMENTAL DOLLAR SLAB (`#121A2B` Kodalith Ink >= 13.7:1 contrast!)
  const dollarLabel = `$${shownChips}`;

  if (isMysteryCurtain && !extras.rolledMysteryOutcome) {
    ctx.fillStyle = '#121A2B';
    ctx.font = `900 144px ${numericFont}`;
    ctx.textAlign = 'left';
    ctx.fillText(dollarLabel, 76, 400);

    drawRoundedRectPath(ctx, w - 424, 338, 356, 114, 20);
    ctx.fillStyle = '#B81448';
    ctx.fill();
    ctx.strokeStyle = '#121A2B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, 'WILD SPIN!', w - 246, 397, 322, 60, 40, displayFont);
  } else if (useVipMidPill) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, dollarLabel, w * 0.5, 344, w - 104, 102, 74, numericFont);
  } else if (elevateStandardBody) {
    // Elevated centered dollar baseline gives generous cream breathing room above enlarged mobile sub-pills!
    ctx.textAlign = 'center';
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, dollarLabel, w * 0.5, 322, w - 104, 122, 86, numericFont);
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#121A2B';
    drawFittedBoldText(ctx, dollarLabel, w * 0.5, 398, w - 104, 184, 114, numericFont);
  }

  // Bold Mobile-Readable Bottom Status Banner (`84–92px` tall, `34–44px` bold caps — crisp even on 390x660 5-row phones!)
  if (isKeyholderShielded && showChampTargetPill) {
    drawRoundedRectPath(ctx, 56, h - 106, 444, 80, 16);
    ctx.fillStyle = '#5C301B';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '★ SAFE SHIELD', 278, h - 65, 404, 44, 34, displayFont);

    drawRoundedRectPath(ctx, w - 500, h - 106, 444, 80, 16);
    ctx.fillStyle = '#C81E3A';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, '★ CHAMP TARGET', w - 278, h - 65, 404, 44, 34, displayFont);
  } else if (isKeyholderShielded) {
    drawRoundedRectPath(ctx, 84, h - 108, w - 168, 82, 16);
    ctx.fillStyle = '#5C301B';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD56B';
    drawFittedBoldText(ctx, '★ SAFE SHIELD', w * 0.5, h - 66, w - 216, 48, 38, displayFont);
  } else if (showChampTargetPill) {
    drawRoundedRectPath(ctx, 84, h - 108, w - 168, 82, 16);
    ctx.fillStyle = '#C81E3A';
    ctx.fill();
    ctx.strokeStyle = '#FFD56B';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF9EC';
    drawFittedBoldText(ctx, '★ CHAMP TARGET', w * 0.5, h - 66, w - 216, 48, 38, displayFont);
  } else if (useVipBottomPill) {
    drawRoundedRectPath(ctx, 42, h - 114, w - 84, 90, 18);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.strokeStyle = '#E6397A';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9E103C';
    drawFittedBoldText(ctx, `🎭 ${vipBadgeLabel}`, w * 0.5, h - 68, w - 128, 54, 42, displayFont);
  }

  // Brushed Anodized Outer Frame + 4 Sculpted 24K Brass Jewel Rivets!
  drawAnodizedOuterBezelAndRivets(ctx, w, h, frameStroke, isKeyholderShielded);
}

// ----------------------------------------------------------------------------
// 5. Internal Tile Visual Rig & Kinetic Board Mechanism Handles
// ----------------------------------------------------------------------------

interface TileVisualRigV7 {
  readonly node: BoardTileNodeV7;
  readonly rootGroup: THREE.Group;
  readonly liftGroup: THREE.Group;
  readonly trilonFlipGroup: THREE.Group;
  readonly trilonBackGroup: THREE.Group;
  readonly enamelRimMesh: THREE.Mesh;
  readonly enamelMat: THREE.MeshPhysicalMaterial;
  readonly champagneCoreMesh: THREE.Mesh;
  readonly plaqueMesh: THREE.Mesh;
  readonly plaqueMat: THREE.MeshBasicMaterial;
  readonly plaqueCanvas: HTMLCanvasElement | null;
  readonly plaqueTexture: THREE.CanvasTexture | null;
  readonly underGlowRing: THREE.Mesh;
  readonly underGlowMat: THREE.MeshBasicMaterial;
  readonly amberTruceRing: THREE.Group;
  readonly uhfHaloMesh: THREE.Mesh;
  readonly blitzCrownRing: THREE.Mesh;
  readonly twistAccentRing: THREE.Mesh;
  readonly twistAccentMat: THREE.MeshStandardMaterial;
  readonly vaultLockGroup: THREE.Group;
  readonly pickVolumeMesh: THREE.Mesh;
  readonly tileD: number;
  currentLiftY: number;
  liftVelocityY: number;
  targetLiftY: number;
  // Motorized 3-Sided Trilon Flip State
  flipActive: boolean;
  flipElapsedSec: number;
  flipDurationSec: number;
  flipDelaySec: number;
  flipSwappedAtMidpoint: boolean;
  // Locked Vault rattle & unlock fly-away animation
  vaultShakeSec: number;
  vaultUnlockBurstSec: number;
}

interface RivalClaimChoreographyV7 {
  readonly tileIndex: number;
  readonly didScore: boolean;
  elapsedSec: number;
  readonly durationSec: number;
  committed: boolean;
  readonly resolve: () => void;
  readonly onComplete?: () => void;
}

// ----------------------------------------------------------------------------
// 6. `InteractiveBoard3DControllerV7` — Master 3D Contraption Board Controller
// ----------------------------------------------------------------------------

export class InteractiveBoard3DControllerV7 {
  public readonly rootGroup: THREE.Group;
  public readonly pedestalGroup: THREE.Group;
  public readonly rakedChassisGroup: THREE.Group;
  public readonly balanceBeamGroup: THREE.Group;
  public readonly twistsEngine: BoardTwistsEngineV7;

  private envMap: THREE.Texture | null;
  private activeBoardId: BoardIdV7;
  private activeTwistId: BoardTwistIdV7;
  private rivalId: RivalIdV7;
  private customBedHex: number | undefined;
  private customVeneerHex: number | undefined;
  private customBrassHex: number | undefined;
  private reducedMotion: boolean;
  private highContrastBadges: boolean;
  private isPortraitMode = false;
  private seedOffset = 0;

  private onMercySwitchPulled?: (disarmedCount: number) => void;
  private onBoardGimmickTriggered?: (
    boardId: BoardIdV7,
    state: Readonly<BoardGimmickStateV7>,
  ) => void;
  private onTileHoverChanged?: (tileIndex: number | null) => void;

  private tileRigs: TileVisualRigV7[] = [];
  private tiles: BoardTileNodeV7[] = [];
  private pickMeshes: THREE.Mesh[] = [];
  private hoveredTileIndex: number | null = null;

  // 1966 Perimeter Chasing `#11` Incandescent Marquee Bulbs (4-circuit chaser + Instanced 2700K Halation Quads)
  private marqueeCircuitMats: THREE.MeshStandardMaterial[] = [];
  private marqueeHaloMats: THREE.MeshBasicMaterial[] = [];
  private marqueeCelebrationSec = 0;
  private eyeGuessFlashRemainingSec = 0;

  // Vertical Studio Spotlight Hover Beam + `ROVING_SPOTLIGHT` Multi-Beam Rig
  private hoverSpotBeamGroup: THREE.Group | null = null;
  private hoverSpotConeMat: THREE.MeshBasicMaterial | null = null;
  private hoverSpotRingMat: THREE.MeshBasicMaterial | null = null;
  private hoverSpotPos = new THREE.Vector3(0, 0.16, 0);
  private hoverSpotAlpha = 0;
  private hoverSpotColor = new THREE.Color(0xffd56b);
  private activeSpotlightIndices: number[] = [];
  private rovingSpotBeams: Array<{
    group: THREE.Group;
    coneMat: THREE.MeshBasicMaterial;
    ringMat: THREE.MeshBasicMaterial;
    pos: THREE.Vector3;
    alpha: number;
  }> = [];
  private sharedContactShadowMat: THREE.MeshBasicMaterial | null = null;

  // Wave 2 Bespoke 1966 Studio Centerpiece Kinetic Handles (`BOARD_01`..`BOARD_12`)
  private crossfaderVuMats: THREE.MeshStandardMaterial[] = [];
  private jubileeStarbursts: THREE.Group[] = [];
  private hexBridgePulseMats: THREE.MeshStandardMaterial[] = [];
  private vaudevilleWheelRings: THREE.Group[] = [];
  private vaudevilleFlapperArm: THREE.Group | null = null;
  private switchboardRelayMats: THREE.MeshStandardMaterial[] = [];
  private larsonPrizeWheelRim: THREE.Group | null = null;
  private pierChevronMats: THREE.MeshStandardMaterial[] = [];
  private pierFerrisGroup: THREE.Group | null = null;
  private rouletteWheelGroup: THREE.Group | null = null;
  private rouletteBallOrbitGroup: THREE.Group | null = null;
  private atomicOrbitRings: THREE.Group[] = [];
  private uhfRadarDishGroup: THREE.Group | null = null;
  private uhfTubeFilamentMats: THREE.MeshStandardMaterial[] = [];
  private zigguratCrownSpinners: THREE.Group[] = [];
  private zigguratStepGlowMats: THREE.MeshStandardMaterial[] = [];
  private gauntletScannerMats: THREE.MeshStandardMaterial[] = [];
  private pendulumEquilibriumMat: THREE.MeshStandardMaterial | null = null;
  private pendulumSideRings: THREE.Group[] = [];
  private portraitCrestSpinner: THREE.Group | null = null;

  // 4 Canonical Socket Widgets
  private cornerTotemSpinGroup: THREE.Group | null = null;
  private cornerTotemJewelMat: THREE.MeshStandardMaterial | null = null;
  private mercyLeverArmGroup: THREE.Group | null = null;
  private mercyLampMat: THREE.MeshStandardMaterial | null = null;
  private mercyLeverCurrentAngle = -0.45;
  private overheadCrosshairGroup: THREE.Group | null = null;
  private crosshairPos = new THREE.Vector3(0, 0.45, 0);
  private crosshairBaseScaleX = 0.76;
  private crosshairBaseScaleZ = 0.56;

  // Per-Board Live Moving & Interactive 3D Contraption Hardware Handles
  private vinylPlatters: THREE.Group[] = [];
  private crossfaderThumbGroup: THREE.Group | null = null;
  private hexBridgeLinks: {
    indexA: number;
    indexB: number;
    mesh: THREE.Mesh;
    mat: THREE.MeshStandardMaterial;
  }[] = [];
  private vaudevilleGears: { group: THREE.Group; ratio: number; baseAngle: number }[] = [];
  private currentGearAngle = 0;
  private switchboardRods: THREE.Group[] = [];
  private switchboardLamps: THREE.MeshStandardMaterial[] = [];
  private larsonBulbMats: THREE.MeshStandardMaterial[] = [];
  private larsonHaloSprites: THREE.Sprite[] = [];
  private spinPaddleArm: THREE.Group | null = null;
  private spinPaddleBounce = 0;
  private pinballBumpers: { capGroup: THREE.Group; lampMat: THREE.MeshStandardMaterial; pulse: number }[] = [];
  private baccaratShoeCarriage: THREE.Group | null = null;
  private baccaratNeedleGroup: THREE.Group | null = null;
  private sundialArmGroup: THREE.Group | null = null;
  private uhfKnobGroup: THREE.Group | null = null;
  private uhfNeedles: THREE.Group[] = [];
  private zigguratAstrolabeRings: THREE.Mesh[] = [];
  private gauntletBlockadePins: { index: number; group: THREE.Group; mat: THREE.MeshStandardMaterial }[] = [];
  private pendulumBobGroup: THREE.Group | null = null;
  private currentBeamTiltRad = 0;

  private activeRivalChoreo: RivalClaimChoreographyV7 | null = null;
  private elapsedSec = 0;
  private activeSeason: SeasonIdV7 = 1;
  private seasonAuthoritative = false;
  private marqueeCircuitHexes: [number, number, number, number] = [0xfff5d0, 0xffd56b, 0xfff0b8, 0xf2a922];
  private activeTrilonStyleId: CanonicalTrilonStyleIdV9 = 'trilon_acrylite_cream';
  private activeVetoedCategories: CategoryIdV7[] = [];
  private activeVibePackId: VibePackIdV9 | undefined;
  private activeBoardModeV9: BoardPlayModeV9 = 'CLASSIC_TOTE';
  private boardOwnedDisposables: { geometries: Set<THREE.BufferGeometry>; materials: Set<THREE.Material>; textures: Set<THREE.Texture> } = {
    geometries: new Set(),
    materials: new Set(),
    textures: new Set(),
  };

  constructor(
    mountOrConfig?: THREE.Group | InteractiveBoard3DConfigV7,
    envMapArg?: THREE.Texture | null,
    extraConfig?: Partial<InteractiveBoard3DConfigV7>,
  ) {
    const isGroup = mountOrConfig instanceof THREE.Group;
    const cfg: InteractiveBoard3DConfigV7 = isGroup
      ? { ...extraConfig, mountGroup: mountOrConfig, envMap: envMapArg ?? extraConfig?.envMap }
      : { ...(mountOrConfig ?? {}), ...(extraConfig ?? {}) };

    this.envMap = cfg.envMap ?? null;
    this.activeBoardId = cfg.initialBoardId ?? 'BOARD_01_FUNK_CROSSFADER';
    this.activeTwistId = cfg.initialTwistId ?? BOARD_SPECS_V7[this.activeBoardId].defaultTwistId;
    this.rivalId = cfg.rivalId ?? 'CARMEN_DELGADO';
    this.customBedHex = cfg.tableBedHex;
    this.customVeneerHex =
      cfg.trimVeneerHex !== undefined ? parseHexNumber(cfg.trimVeneerHex, 0x4d2518) : undefined;
    this.customBrassHex =
      cfg.trimAccentHex !== undefined ? parseHexNumber(cfg.trimAccentHex, 0xdca94a) : undefined;
    this.reducedMotion = cfg.reducedMotion ?? false;
    this.highContrastBadges = cfg.highContrastBadges ?? false;
    this.onMercySwitchPulled = cfg.onMercySwitchPulled;
    this.onBoardGimmickTriggered = cfg.onBoardGimmickTriggered;
    this.onTileHoverChanged = cfg.onTileHoverChanged;

    this.twistsEngine =
      cfg.twistsEngine ??
      new BoardTwistsEngineV7({
        boardId: this.activeBoardId,
        twistId: this.activeTwistId,
        rivalId: this.rivalId,
        rivalWeakCategories: cfg.rivalWeakCategories,
        rivalStrongCategories: cfg.rivalStrongCategories,
      });
    this.installOrientationInvariantModifierGuard();

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'InteractiveBoard3DV7_Root';

    this.pedestalGroup = new THREE.Group();
    this.pedestalGroup.name = 'HorologicalPedestal_V7';
    this.rootGroup.add(this.pedestalGroup);

    // Entire Contraption Table Chassis raked +22° (`0.384 rad`) toward camera!
    this.rakedChassisGroup = new THREE.Group();
    this.rakedChassisGroup.name = 'RakedContraptionChassis_22Deg';
    this.rakedChassisGroup.position.set(0, TABLE_PIVOT_Y, 0);
    this.rakedChassisGroup.rotation.x = TABLE_RAKE_RAD;
    this.rootGroup.add(this.rakedChassisGroup);

    this.balanceBeamGroup = new THREE.Group();
    this.balanceBeamGroup.name = 'TilePlayfieldOrBalanceBeam';
    this.rakedChassisGroup.add(this.balanceBeamGroup);

    if (cfg.mountGroup) {
      cfg.mountGroup.add(this.rootGroup);
    }

    this.loadBoard({
      boardId: this.activeBoardId,
      twistId: this.activeTwistId,
      rivalId: this.rivalId,
      rivalWeakCategories: cfg.rivalWeakCategories,
      rivalStrongCategories: cfg.rivalStrongCategories,
    });
  }

  // --------------------------------------------------------------------------
  // Resource Tracking & Clean Disposal
  // --------------------------------------------------------------------------

  private trackGeom<T extends THREE.BufferGeometry>(g: T): T {
    this.boardOwnedDisposables.geometries.add(g);
    return g;
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    if (
      this.envMap &&
      (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial)
    ) {
      m.envMap = this.envMap;
      m.envMapIntensity = m.metalness > 0.5 ? 1.15 : 0.65;
    }
    this.boardOwnedDisposables.materials.add(m);
    return m;
  }

  private trackTex<T extends THREE.Texture>(t: T): T {
    this.boardOwnedDisposables.textures.add(t);
    return t;
  }

  private clearActiveBoardResources(): void {
    this.pedestalGroup.clear();
    this.balanceBeamGroup.clear();
    this.rakedChassisGroup.clear();
    this.rakedChassisGroup.add(this.balanceBeamGroup);

    for (const g of this.boardOwnedDisposables.geometries) g.dispose();
    for (const m of this.boardOwnedDisposables.materials) m.dispose();
    for (const t of this.boardOwnedDisposables.textures) t.dispose();
    this.boardOwnedDisposables.geometries.clear();
    this.boardOwnedDisposables.materials.clear();
    this.boardOwnedDisposables.textures.clear();

    this.tileRigs = [];
    this.tiles = [];
    this.pickMeshes = [];
    this.hoveredTileIndex = null;
    this.marqueeCircuitMats = [];
    this.marqueeHaloMats = [];
    this.hoverSpotBeamGroup = null;
    this.hoverSpotConeMat = null;
    this.hoverSpotRingMat = null;
    this.hoverSpotAlpha = 0;
    this.rovingSpotBeams = [];
    this.sharedContactShadowMat = null;
    this.crossfaderVuMats = [];
    this.jubileeStarbursts = [];
    this.hexBridgePulseMats = [];
    this.vaudevilleWheelRings = [];
    this.vaudevilleFlapperArm = null;
    this.switchboardRelayMats = [];
    this.larsonPrizeWheelRim = null;
    this.pierChevronMats = [];
    this.pierFerrisGroup = null;
    this.rouletteWheelGroup = null;
    this.rouletteBallOrbitGroup = null;
    this.atomicOrbitRings = [];
    this.uhfRadarDishGroup = null;
    this.uhfTubeFilamentMats = [];
    this.zigguratCrownSpinners = [];
    this.zigguratStepGlowMats = [];
    this.gauntletScannerMats = [];
    this.pendulumEquilibriumMat = null;
    this.pendulumSideRings = [];
    this.portraitCrestSpinner = null;
    this.vinylPlatters = [];
    this.crossfaderThumbGroup = null;
    this.hexBridgeLinks = [];
    this.vaudevilleGears = [];
    this.switchboardRods = [];
    this.switchboardLamps = [];
    this.larsonBulbMats = [];
    this.larsonHaloSprites = [];
    this.spinPaddleArm = null;
    this.pinballBumpers = [];
    this.baccaratShoeCarriage = null;
    this.baccaratNeedleGroup = null;
    this.sundialArmGroup = null;
    this.uhfKnobGroup = null;
    this.uhfNeedles = [];
    this.zigguratAstrolabeRings = [];
    this.gauntletBlockadePins = [];
    this.pendulumBobGroup = null;
    this.cornerTotemSpinGroup = null;
    this.cornerTotemJewelMat = null;
    this.mercyLeverArmGroup = null;
    this.mercyLampMat = null;
    this.overheadCrosshairGroup = null;
    this.currentBeamTiltRad = 0;
  }

  /**
   * Ensures `evaluateTileModifiers` and `recomputeBoardModifiers` always evaluate spatial
   * board synergies against each tile's canonical `BOARD_SPECS_V7[boardId].slots[index]`
   * `(x, z, tierY)` so resizing between Desktop (`4x3`) and Mobile/Tablet (`3x4`) NEVER
   * mutates any tile's dollar value or `+mult` badge mid-match!
   */
  private installOrientationInvariantModifierGuard(): void {
    const engineRef = this.twistsEngine as unknown as {
      __wsCanonicalSlotGuardInstalled?: boolean;
      evaluateTileModifiers: BoardTwistsEngineV7['evaluateTileModifiers'];
      recomputeBoardModifiers: BoardTwistsEngineV7['recomputeBoardModifiers'];
    };
    if (engineRef.__wsCanonicalSlotGuardInstalled) return;
    engineRef.__wsCanonicalSlotGuardInstalled = true;

    const rawEvaluate = this.twistsEngine.evaluateTileModifiers.bind(this.twistsEngine);
    const rawRecompute = this.twistsEngine.recomputeBoardModifiers.bind(this.twistsEngine);

    const toCanonicalTiles = (tiles: BoardTileNodeV7[]): BoardTileNodeV7[] => {
      const slots = BOARD_SPECS_V7[this.activeBoardId]?.slots;
      if (!slots) return tiles;
      return tiles.map((t) => {
        const s = slots[t.index];
        if (!s || (t.x === s.x && t.z === s.z && t.tierY === s.tierY)) return t;
        return { ...t, x: s.x, z: s.z, tierY: Math.max(0.14, s.tierY) };
      });
    };

    engineRef.evaluateTileModifiers = (tile, tiles, overrideStreak) => {
      const slots = BOARD_SPECS_V7[this.activeBoardId]?.slots;
      const canonTiles = toCanonicalTiles(tiles);
      const s = slots?.[tile.index];
      const canonTile =
        s && (tile.x !== s.x || tile.z !== s.z || tile.tierY !== s.tierY)
          ? { ...tile, x: s.x, z: s.z, tierY: Math.max(0.14, s.tierY) }
          : tile;
      return rawEvaluate(canonTile, canonTiles, overrideStreak);
    };

    engineRef.recomputeBoardModifiers = (tiles) => {
      const canonTiles = toCanonicalTiles(tiles);
      const breakdowns = rawRecompute(canonTiles);
      for (let i = 0; i < tiles.length; i++) {
        if (breakdowns[i]) {
          tiles[i].boardMultBonus = breakdowns[i].cappedMultBonus;
        }
      }
      return breakdowns;
    };
  }

  public dispose(): void {
    if (this.activeRivalChoreo) {
      this.activeRivalChoreo.resolve();
      this.activeRivalChoreo = null;
    }
    this.clearActiveBoardResources();
    this.rootGroup.removeFromParent();
  }

  // --------------------------------------------------------------------------
  // Board Construction (`loadBoard`)
  // --------------------------------------------------------------------------

  public setEnvironmentMap(envMap: THREE.Texture | null): void {
    this.envMap = envMap;
    for (const m of this.boardOwnedDisposables.materials) {
      if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
        m.envMap = envMap;
        m.needsUpdate = true;
      }
    }
  }

  public setVisualAccessibility(opts: {
    reducedMotion?: boolean;
    highContrastBadges?: boolean;
  }): void {
    if (opts.reducedMotion !== undefined) this.reducedMotion = opts.reducedMotion;
    if (opts.highContrastBadges !== undefined) {
      this.highContrastBadges = opts.highContrastBadges;
      this.refreshAllTilePlaques();
    }
  }

  /**
   * Reflows the 3D Tote Board between a wide 1966 Network Studio Console (desktop/landscape)
   * and a tall, thumb-sized 3-Column Vertical Tote Rack (mobile portrait), preserving live tile states!
   */
  public setPortraitMode(isPortrait: boolean): void {
    const next = Boolean(isPortrait);
    if (this.isPortraitMode === next) return;
    this.isPortraitMode = next;
    this.rakedChassisGroup.position.set(0, next ? PORTRAIT_PIVOT_Y : TABLE_PIVOT_Y, 0);
    this.rakedChassisGroup.rotation.x = next ? PORTRAIT_RAKE_RAD : TABLE_RAKE_RAD;

    if (this.tiles.length > 0) {
      const savedTiles = this.tiles.map((t) => ({ ...t }));
      const spec = BOARD_SPECS_V7[this.activeBoardId];
      this.clearActiveBoardResources();
      this.tiles = savedTiles.map((t, idx) => {
        const slot = spec.slots[idx] ?? spec.slots[0];
        const pos = this.computeSlotCoordForOrientation(idx, savedTiles.length, slot);
        return {
          ...t,
          x: pos.x,
          z: pos.z,
          tierY: pos.tierY,
          shape: this.isPortraitMode ? 'CHAMFER_RECT' : slot.shape,
        };
      });
      this.buildChassisAndPedestal(spec);
      if (this.isPortraitMode) {
        this.buildPortraitBoardCrest(spec);
      } else {
        this.buildBoardSpecificHardware(spec);
      }
      this.buildCanonicalSocketWidgets(spec);
      this.balanceBeamGroup.rotation.set(0, 0, 0);
      for (const tile of this.tiles) {
        const rig = this.buildSingleTileRig(tile, spec);
        this.tileRigs.push(rig);
        this.balanceBeamGroup.add(rig.rootGroup);
      }
      this.syncDynamicBoardVisuals();
      this.refreshAllTilePlaques();
    }
  }

  private getActivePortraitDepth(tileCount: number): number {
    return tileCount > 12 ? PORTRAIT_BED_DEPTH_5ROW : PORTRAIT_BED_DEPTH_4ROW;
  }

  private computeSlotCoordForOrientation(
    idx: number,
    totalCount: number,
    slot: BoardTileBlueprintSlotV7,
  ): { x: number; z: number; tierY: number } {
    if (!this.isPortraitMode) {
      return {
        x: slot.x,
        z: slot.z,
        tierY: Math.max(0.14, slot.tierY),
      };
    }
    // Giant Tight-Packed 3-Column Vertical Tote-Board Matrix for Mobile Portrait (`9:16`) & Tablet (`3:4`)!
    // Outer tiles span ±1.163m inside 2.56m chassis (>91% pure glowing tile face across width!)
    const cols = 3;
    const rows = Math.max(4, Math.ceil(totalCount / cols));
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);
    const itemsInRow = rowIdx === rows - 1 ? totalCount - rowIdx * cols : cols;
    const colSpacing = 0.79;
    const x = (colIdx - (itemsInRow - 1) * 0.5) * colSpacing;
    const zSpan = rows >= 5 ? 2.16 : 2.10;
    const z = -zSpan * 0.5 + (rows > 1 ? (rowIdx / (rows - 1)) * zSpan : 0);
    const portraitTier = Math.max(0.14, Math.min(0.19, slot.tierY));
    return { x, z, tierY: portraitTier };
  }

  private resolveAllowedCategoriesV9(): readonly CategoryIdV7[] {
    const vetoSet = new Set<CategoryIdV7>(this.activeVetoedCategories);
    const basePool = this.activeVibePackId
      ? VIBE_PACK_CATEGORIES_V9[this.activeVibePackId]
      : ALL_CATEGORIES_V7;
    const filtered = basePool.filter((c) => !vetoSet.has(c));
    if (filtered.length >= 3) return filtered;
    const allFiltered = ALL_CATEGORIES_V7.filter((c) => !vetoSet.has(c));
    return allFiltered.length > 0 ? allFiltered : ALL_CATEGORIES_V7;
  }

  public loadBoard(
    opts: Omit<BoardLoadSpec, 'trimVeneerHex' | 'trimAccentHex'> & {
      trimVeneerHex?: string | number;
      trimAccentHex?: string | number;
      vibePackId?: VibePackIdV9;
    },
  ): BoardTileNodeV7[] {
    if (this.activeRivalChoreo) {
      const pendingChoreo = this.activeRivalChoreo;
      this.activeRivalChoreo = null;
      pendingChoreo.resolve();
    }
    this.hoveredTileIndex = null;
    this.marqueeCelebrationSec = 0;
    this.eyeGuessFlashRemainingSec = 0;
    this.clearActiveBoardResources();
    this.rakedChassisGroup.position.set(0, this.isPortraitMode ? PORTRAIT_PIVOT_Y : TABLE_PIVOT_Y, 0);
    this.rakedChassisGroup.rotation.x = this.isPortraitMode ? PORTRAIT_RAKE_RAD : TABLE_RAKE_RAD;

    this.activeBoardId = opts.boardId;
    const spec = BOARD_SPECS_V7[this.activeBoardId];
    this.activeTwistId = opts.twistId ?? spec.defaultTwistId;
    this.rivalId = opts.rivalId ?? this.rivalId;
    this.seedOffset = opts.seedOffset ?? 0;
    const hasExplicitSeason =
      opts.season === 1 || opts.season === 2 || opts.season === 3 || opts.season === 4;
    this.activeSeason = hasExplicitSeason ? opts.season! : (opts.season ?? 1);
    this.seasonAuthoritative = hasExplicitSeason;
    this.activeTrilonStyleId = normalizeTrilonStyleIdV9(opts.trilonStyleId);
    this.activeVetoedCategories = opts.vetoedCategories ? [...opts.vetoedCategories] : [];
    this.activeVibePackId = opts.vibePackId;

    this.customBedHex = opts.tableBedHex;
    this.customVeneerHex =
      opts.trimVeneerHex !== undefined
        ? parseHexNumber(opts.trimVeneerHex, spec.woodVeneerHex)
        : undefined;
    this.customBrassHex =
      opts.trimAccentHex !== undefined
        ? parseHexNumber(opts.trimAccentHex, spec.brassAccentHex)
        : undefined;

    // 1. Seed 12–15 `BoardTileNodeV7` nodes with orientation-aware Tote-Board layout & strict Veto/Vibe filtering
    const boardSeed = ALL_BOARD_IDS_V7.indexOf(this.activeBoardId) * 3 + 1 + this.seedOffset;
    const totalSlots = spec.slots.length;
    const vetoSet = new Set<CategoryIdV7>(this.activeVetoedCategories);
    const allowedCats = this.resolveAllowedCategoriesV9();
    const allowedSet = new Set<CategoryIdV7>(allowedCats);
    this.tiles = spec.slots.map((slot, idx) => {
      const overrideCat = opts.categoriesOverride?.[idx];
      const cat =
        overrideCat && !vetoSet.has(overrideCat) && (!this.activeVibePackId || allowedSet.has(overrideCat))
          ? overrideCat
          : allowedCats[Math.abs(idx * 3 + boardSeed) % allowedCats.length];
      const domain = CATEGORY_TO_DOMAIN_V7[cat];
      const pos = this.computeSlotCoordForOrientation(idx, totalSlots, slot);
      return {
        index: idx,
        id: `${this.activeBoardId}_TILE_${String(idx + 1).padStart(2, '0')}`,
        x: pos.x,
        z: pos.z,
        tierY: pos.tierY,
        shape: this.isPortraitMode ? 'CHAMFER_RECT' : slot.shape,
        category: cat,
        domain,
        baseChips: slot.baseChips,
        nominalBaseChips: slot.baseChips,
        boardMultBonus: 0,
        state: 'OPEN',
        tvTwist: 'NONE',
        isVaultLocked: false,
        hasAmberTruce: false,
        hasUhfHalo: false,
        isRiggedSolenoid: false,
        isRivalTarget: false,
        isWheelhouse: false,
      };
    });

    // 2. Wire `BoardTwistsEngineV7` onto the live tile array (seeds TV Twists, R7 mode & VIP Bluffs!)
    this.twistsEngine.configureMatch(
      {
        boardId: this.activeBoardId,
        twistId: this.activeTwistId,
        rivalId: this.rivalId,
        rivalWeakCategories: opts.rivalWeakCategories,
        rivalStrongCategories: opts.rivalStrongCategories,
        season: this.activeSeason,
        vetoedCategories: this.activeVetoedCategories,
        vibePackId: this.activeVibePackId,
        allowedCategories: allowedCats,
        ...(opts.boardPlayMode !== undefined ? { boardModeV9: opts.boardPlayMode } : {}),
        isBlitzPhase: false,
        seedOffset: this.seedOffset,
      },
      this.tiles,
      true,
    );
    this.activeBoardModeV9 = this.twistsEngine.getActiveBoardModeV9();

    // 3. Build Grounded 1966 "In Living Color" Seasonal Cabinet, Spun-Aluminum Trim & Chasing Marquee Bulbs
    this.buildChassisAndPedestal(spec);

    // 4. Build Board-Specific Kinetic 3D Contraption Hardware (or compact Portrait Crest Medallion!)
    if (this.isPortraitMode) {
      this.buildPortraitBoardCrest(spec);
    } else {
      this.buildBoardSpecificHardware(spec);
    }

    // 5. Build Canonical Socket Widgets (`CornerTotem`, `FlankSwitch`, `OverheadCrosshair` + per-tile `RimRing`)
    this.buildCanonicalSocketWidgets(spec);

    // 6. Build all 12–15 Proud Backlit 1966 Trilon Tote-Board Tiles (`y >= 0.14m`)
    this.balanceBeamGroup.rotation.set(0, 0, 0);
    for (const tile of this.tiles) {
      const rig = this.buildSingleTileRig(tile, spec);
      this.tileRigs.push(rig);
      this.balanceBeamGroup.add(rig.rootGroup);
    }

    this.mercyLeverCurrentAngle = -0.45;
    this.marqueeCelebrationSec = 0;
    this.eyeGuessFlashRemainingSec = 0;
    this.activeSpotlightIndices = [];
    this.syncDynamicBoardVisuals();
    this.refreshAllTilePlaques();

    return this.tiles;
  }

  private getOrCreateContactShadowMaterial(): THREE.MeshBasicMaterial {
    if (this.sharedContactShadowMat) return this.sharedContactShadowMat;
    this.sharedContactShadowMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        color: 0xffffff,
        transparent: true,
        opacity: 0.54,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );
    return this.sharedContactShadowMat;
  }

  private addBoardContactShadow(
    parent: THREE.Object3D,
    rx: number,
    rz: number,
    y: number,
    x = 0,
    z = 0,
    opacity?: number,
  ): THREE.Mesh {
    const geom = this.trackGeom(new THREE.PlaneGeometry(rx * 2, rz * 2));
    geom.rotateX(-Math.PI * 0.5);
    const mat =
      opacity !== undefined
        ? this.trackMat(
            new THREE.MeshBasicMaterial({
              map: getContactShadowTexture(),
              color: 0xffffff,
              transparent: true,
              opacity,
              depthWrite: false,
              toneMapped: false,
              polygonOffset: true,
              polygonOffsetFactor: -2,
              polygonOffsetUnits: -2,
            }),
          )
        : this.getOrCreateContactShadowMaterial();
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.castShadow = false;
    m.receiveShadow = false;
    m.renderOrder = 1;
    parent.add(m);
    return m;
  }

  // --------------------------------------------------------------------------
  // 1966 "IN LIVING COLOR" Tote-Board Cabinet, Broadcast Navy Bed, Spun Satin
  // Aluminum Trim, Chasing `#11` Marquee Bulbs & Zero-Z-Fighting Mitered Rails
  // --------------------------------------------------------------------------

  private resolveSeasonalMaterialPalette(spec: BoardSpecV7): {
    readonly seasonSpec: SeasonVisualSpecV9;
    readonly woodHex: number;
    readonly brassHex: number;
    readonly bedHex: number;
    readonly consoleBakeliteHex: number;
    readonly seasonAccentHex: number;
    readonly seasonSpotHex: number;
    readonly bulbCircuitHexes: readonly [number, number, number, number];
  } {
    const seasonSpec = SEASON_VISUAL_SPECS_V9[this.activeSeason] ?? SEASON_VISUAL_SPECS_V9[1];
    let seasonWoodHex = seasonSpec.cabinetHexNum ?? spec.woodVeneerHex;
    let seasonBrassHex = seasonSpec.bezelTrimHexNum ?? spec.brassAccentHex;
    let seasonBedHex = 0x007b85;
    let consoleBakeliteHex = 0x006b74;
    let seasonAccentHex = parseHexNumber(seasonSpec.tileAccentHex, 0x008b94);
    let seasonSpotHex = parseHexNumber(seasonSpec.spotlightHex, 0xf2a922);
    let bulbCircuitHexes: readonly [number, number, number, number] = [
      0xfff5d0, 0xffd56b, 0xfff0b8, 0xf2a922,
    ];

    if (this.activeSeason === 2) {
      seasonWoodHex = 0xfaf2df;
      seasonBrassHex = 0xd6dfe8;
      seasonBedHex = 0xa81d52;
      consoleBakeliteHex = 0xff6b35;
      seasonAccentHex = 0xff6b35;
      seasonSpotHex = 0xe6397a;
      bulbCircuitHexes = [0xff6b35, 0xe6397a, 0xff6b35, 0xe6397a];
    } else if (this.activeSeason === 3) {
      seasonWoodHex = 0x4f2917;
      seasonBrassHex = 0xf2a922;
      seasonBedHex = 0x157238;
      consoleBakeliteHex = 0x15803d;
      seasonAccentHex = 0x15803d;
      seasonSpotHex = 0xf2a922;
      bulbCircuitHexes = [0xffd56b, 0x22c55e, 0xf2a922, 0x15803d];
    } else if (this.activeSeason === 4) {
      seasonWoodHex = 0xd6dfe8;
      seasonBrassHex = 0x1746a2;
      seasonBedHex = 0x1746a2;
      consoleBakeliteHex = 0xf2a922;
      seasonAccentHex = 0x1746a2;
      seasonSpotHex = 0xf2a922;
      bulbCircuitHexes = [0x3b82f6, 0xfffdf7, 0xf2a922, 0x00d8ec];
    } else {
      seasonWoodHex = 0x6e3b23;
      seasonBrassHex = 0xd9a441;
      seasonBedHex = 0x007b85;
      consoleBakeliteHex = 0x006b74;
    }

    const isCanonicalSeasonShowcase = this.activeBoardId === 'BOARD_01_FUNK_CROSSFADER';
    if (!isCanonicalSeasonShowcase) {
      const tintHex = (baseHex: number, targetHex: number, alpha: number): number =>
        new THREE.Color(baseHex).lerp(new THREE.Color(targetHex), alpha).getHex();
      const woodHex = this.seasonAuthoritative
        ? tintHex(spec.woodVeneerHex, seasonWoodHex, 0.24)
        : (this.customVeneerHex ?? spec.woodVeneerHex);
      const brassHex = this.seasonAuthoritative
        ? seasonBrassHex
        : (this.customBrassHex ?? seasonBrassHex);
      const bedHex = this.seasonAuthoritative
        ? tintHex(spec.bedHex, seasonBedHex, 0.24)
        : (this.customBedHex ?? spec.bedHex);
      const boardBakeliteHex = this.seasonAuthoritative
        ? tintHex(spec.bakeliteHex, consoleBakeliteHex, 0.24)
        : spec.bakeliteHex;

      return {
        seasonSpec,
        woodHex,
        brassHex,
        bedHex,
        consoleBakeliteHex: boardBakeliteHex,
        seasonAccentHex,
        seasonSpotHex,
        bulbCircuitHexes,
      };
    }

    const woodHex = this.seasonAuthoritative
      ? seasonWoodHex
      : (this.customVeneerHex ?? seasonWoodHex);
    const brassHex = this.seasonAuthoritative
      ? seasonBrassHex
      : (this.customBrassHex ?? seasonBrassHex);
    const bedHex = this.seasonAuthoritative
      ? seasonBedHex
      : (this.customBedHex ?? seasonBedHex);

    return {
      seasonSpec,
      woodHex,
      brassHex,
      bedHex,
      consoleBakeliteHex,
      seasonAccentHex,
      seasonSpotHex,
      bulbCircuitHexes,
    };
  }

  private buildChassisAndPedestal(spec: BoardSpecV7): void {
    const bedW = this.isPortraitMode ? PORTRAIT_BED_WIDTH : TABLE_BED_WIDTH;
    const bedD = this.isPortraitMode
      ? this.getActivePortraitDepth(this.tiles.length || spec.slots.length)
      : TABLE_BED_DEPTH;

    const palette = this.resolveSeasonalMaterialPalette(spec);
    const {
      woodHex,
      brassHex,
      bedHex: resolvedBedHex,
      consoleBakeliteHex,
      seasonAccentHex,
      bulbCircuitHexes,
    } = palette;

    const walnutTex = typeof document !== 'undefined' ? getAmericanWalnutVeneerTexture() : null;
    const brushedTex = typeof document !== 'undefined' ? getBrushedAnodizedTexture() : null;
    const louverBedTex = typeof document !== 'undefined' ? getNeutralLouverToteBedTexture() : null;

    const isCanonicalSeasonShowcase = this.activeBoardId === 'BOARD_01_FUNK_CROSSFADER';
    const isMetalFramedBoard =
      this.activeBoardId === 'BOARD_05_LARSON_SPIN_RING' ||
      this.activeBoardId === 'BOARD_09_PIRATE_UHF_DECK' ||
      this.activeBoardId === 'BOARD_10_SOVEREIGN_ZIGGURAT';
    const woodMap = isCanonicalSeasonShowcase
      ? this.activeSeason === 2
        ? null
        : this.activeSeason === 4
          ? brushedTex
          : walnutTex
      : isMetalFramedBoard && this.activeSeason === 4
        ? brushedTex
        : walnutTex;
    const woodRoughness = isCanonicalSeasonShowcase
      ? this.activeSeason === 2
        ? 0.18
        : this.activeSeason === 4
          ? 0.22
          : 0.3
      : isMetalFramedBoard && this.activeSeason === 4
        ? 0.24
        : 0.3;
    const woodMetalness = isCanonicalSeasonShowcase
      ? this.activeSeason === 4
        ? 0.72
        : this.activeSeason === 2
          ? 0.08
          : 0.06
      : isMetalFramedBoard && this.activeSeason === 4
        ? 0.56
        : 0.08;
    const woodClearcoat = isCanonicalSeasonShowcase && this.activeSeason === 2 ? 0.85 : 0.72;

    const woodMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: woodHex,
        map: woodMap,
        roughness: woodRoughness,
        metalness: woodMetalness,
        clearcoat: woodClearcoat,
        clearcoatRoughness: 0.16,
      }),
    );
    woodMat.envMapIntensity = 0.78;

    const brassMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: brassHex,
        map: brushedTex,
        roughness: 0.22,
        metalness: 0.88,
        clearcoat: 0.55,
        clearcoatRoughness: 0.16,
      }),
    );
    brassMat.envMapIntensity = 1.1;

    const aluminumMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe4edf8,
        map: brushedTex,
        roughness: 0.22,
        metalness: 0.86,
        clearcoat: 0.48,
        clearcoatRoughness: 0.16,
      }),
    );
    aluminumMat.envMapIntensity = 1.05;

    const navyConsoleMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: consoleBakeliteHex,
        map: louverBedTex,
        roughness: 0.34,
        metalness: 0.18,
        clearcoat: 0.52,
        clearcoatRoughness: 0.2,
      }),
    );
    navyConsoleMat.envMapIntensity = 0.58;

    // Rich 1966 Living Color Louvered Shadowbox Bed (sunlit Peacock/Cerise/Emerald/Cobalt contrast!)
    const bedMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: louverBedTex,
        roughness: 0.68,
        metalness: 0.14,
      }),
    );
    bedMat.color.setHex(resolvedBedHex).lerp(new THREE.Color(0xffffff), 0.22);
    bedMat.envMapIntensity = 0.36;

    // Seasonal Backlit Acrylite inner shadowbox cove liner
    const coveGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: seasonAccentHex,
        emissive: seasonAccentHex,
        emissiveIntensity: 0.58,
        roughness: 0.25,
        metalness: 0.1,
      }),
    );

    // A. Grounded Mid-Century Sculpted American Teak & Satin Aluminum Pedestal Base + Contact AO
    const plinthW = this.isPortraitMode ? 1.98 : 3.24;
    this.addBoardContactShadow(
      this.pedestalGroup,
      plinthW * 0.68,
      1.24,
      0.0135,
      0,
      -0.02,
      0.62,
    );
    const plinthSlab = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(plinthW, 0.09, 1.72, 0.08, 0.016)),
      woodMat,
    );
    plinthSlab.receiveShadow = true;
    plinthSlab.castShadow = true;
    this.pedestalGroup.add(plinthSlab);

    const brassStep = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(plinthW - 0.22, 0.045, 1.5, 0.06, 0.01)),
      brassMat,
    );
    brassStep.position.y = 0.092;
    this.pedestalGroup.add(brassStep);

    const colTopY = (this.isPortraitMode ? PORTRAIT_PIVOT_Y : TABLE_PIVOT_Y) - 0.13;
    const colProfile = [
      new THREE.Vector2(0.2, 0.0),
      new THREE.Vector2(0.18, 0.08),
      new THREE.Vector2(0.115, 0.14),
      new THREE.Vector2(0.105, colTopY * 0.78),
      new THREE.Vector2(0.165, colTopY * 0.9),
      new THREE.Vector2(0.205, colTopY),
    ];
    const colGeom = this.trackGeom(new THREE.LatheGeometry(colProfile, 28));
    const colSpan = this.isPortraitMode ? 0.58 : 1.04;
    for (const sx of [-colSpan, colSpan]) {
      const stanchion = new THREE.Mesh(colGeom, aluminumMat);
      stanchion.position.set(sx, 0.135, -0.06);
      stanchion.castShadow = true;
      this.pedestalGroup.add(stanchion);
    }

    // B. Raked Sunlit American Teak Under-Hull & Rich 1966 Broadcast Navy Shadowbox Bed
    const underHull = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(bedW, 0.11, bedD, 0.075, 0.014)),
      woodMat,
    );
    underHull.position.y = -0.115;
    underHull.castShadow = true;
    underHull.receiveShadow = true;
    this.rakedChassisGroup.add(underHull);

    const railW = this.isPortraitMode ? 0.088 : 0.11;
    const railH = 0.088;

    const recessedBed = new THREE.Mesh(
      this.trackGeom(
        createChamferedSlabGeometry(bedW - railW * 2 - 0.02, 0.032, bedD - 0.2, 0.035, 0.005),
      ),
      bedMat,
    );
    recessedBed.position.y = -0.022;
    recessedBed.receiveShadow = true;
    this.rakedChassisGroup.add(recessedBed);

    // Backlit Peacock Acrylite Perimeter Light Cove Bars inside the Shadowbox (`y = 0.012m`, zero overlap!)
    const coveInsetX = bedW * 0.5 - railW - 0.022;
    const coveInsetZ = bedD * 0.5 - 0.112;
    const coveSideGeom = this.trackGeom(
      createChamferedSlabGeometry(0.014, 0.012, bedD - 0.25, 0.003, 0.002),
    );
    for (const cx of [-coveInsetX, coveInsetX]) {
      const cBar = new THREE.Mesh(coveSideGeom, coveGlowMat);
      cBar.position.set(cx, 0.012, 0);
      this.rakedChassisGroup.add(cBar);
    }
    const coveHorizGeom = this.trackGeom(
      createChamferedSlabGeometry(bedW - railW * 2 - 0.07, 0.012, 0.014, 0.003, 0.002),
    );
    for (const cz of [-coveInsetZ, coveInsetZ]) {
      const hBar = new THREE.Mesh(coveHorizGeom, coveGlowMat);
      hBar.position.set(0, 0.012, cz);
      this.rakedChassisGroup.add(hBar);
    }

    // Extruded 1966 Twin-Flange Anodized-Aluminum Channel Dividers + 24K Brass End-Ferrules (`y = 0.015m`)
    const mullionCountX = this.isPortraitMode ? 2 : 3;
    const channelSpanZ = bedD - 0.28;
    const flangeGeom = this.trackGeom(
      createChamferedSlabGeometry(0.0085, 0.019, channelSpanZ, 0.003, 0.002),
    );
    const grooveWebGeom = this.trackGeom(
      createChamferedSlabGeometry(0.024, 0.009, channelSpanZ, 0.003, 0.002),
    );
    const ferruleGeom = this.trackGeom(createChamferedSlabGeometry(0.032, 0.022, 0.042, 0.006, 0.003));
    for (let m = 1; m <= mullionCountX; m++) {
      const frac = m / (mullionCountX + 1) - 0.5;
      const mx = frac * (this.isPortraitMode ? 2.34 : 3.24);
      const web = new THREE.Mesh(grooveWebGeom, navyConsoleMat);
      web.position.set(mx, 0.011, 0);
      const flL = new THREE.Mesh(flangeGeom, aluminumMat);
      flL.position.set(mx - 0.008, 0.016, 0);
      const flR = new THREE.Mesh(flangeGeom, aluminumMat);
      flR.position.set(mx + 0.008, 0.016, 0);
      const capTop = new THREE.Mesh(ferruleGeom, brassMat);
      capTop.position.set(mx, 0.017, -channelSpanZ * 0.5 + 0.018);
      const capBot = new THREE.Mesh(ferruleGeom, brassMat);
      capBot.position.set(mx, 0.017, channelSpanZ * 0.5 - 0.018);
      this.rakedChassisGroup.add(web, flL, flR, capTop, capBot);
    }

    if (!this.isPortraitMode) {
      // Broadcast Navy & Spun-Aluminum Side Instrument Bays on Wide Console (`y = 0.016m`)
      const sideBayGeom = this.trackGeom(
        createChamferedSlabGeometry(0.54, 0.024, bedD - 0.34, 0.03, 0.006),
      );
      for (const bx of [-(bedW * 0.5 - 0.42), bedW * 0.5 - 0.42]) {
        const bay = new THREE.Mesh(sideBayGeom, navyConsoleMat);
        bay.position.set(bx, 0.016, 0);
        bay.receiveShadow = true;
        this.rakedChassisGroup.add(bay);
      }
    }

    // C. STRICTLY NON-OVERLAPPING Mitered Teak & Spun-Aluminum Perimeter Rails (>= 5mm Clearance = 0 Z-Fighting!)
    const sideRailGeom = this.trackGeom(
      createChamferedSlabGeometry(railW, railH, bedD, 0.022, 0.009),
    );
    for (const rx of [-bedW * 0.5 + railW * 0.5, bedW * 0.5 - railW * 0.5]) {
      const rail = new THREE.Mesh(sideRailGeom, woodMat);
      rail.position.set(rx, 0.0, 0);
      rail.castShadow = true;
      rail.receiveShadow = true;
      this.rakedChassisGroup.add(rail);
    }

    // Inner spun-aluminum trim molding stepped cleanly INSIDE side rails (`>= 5mm` gap!)
    const innerSideTrimGeom = this.trackGeom(
      createChamferedSlabGeometry(0.016, 0.062, bedD - 0.22, 0.004, 0.003),
    );
    for (const tx of [-bedW * 0.5 + railW + 0.013, bedW * 0.5 - railW - 0.013]) {
      const trim = new THREE.Mesh(innerSideTrimGeom, aluminumMat);
      trim.position.set(tx, 0.014, 0);
      this.rakedChassisGroup.add(trim);
    }

    // Back Rail spans strictly BETWEEN the two side rails (`bedW - railW * 2 - 0.010` -> 5mm physical gap!)
    const innerSpanW = bedW - railW * 2 - 0.01;
    const backRailDepth = this.isPortraitMode ? 0.095 : 0.115;
    const backRail = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(innerSpanW, railH, backRailDepth, 0.018, 0.009)),
      woodMat,
    );
    backRail.position.set(0, 0.0, -bedD * 0.5 + backRailDepth * 0.5);
    backRail.castShadow = true;
    this.rakedChassisGroup.add(backRail);

    // Downstage Front Trim Bar spans strictly BETWEEN side rails (`y = 0.004m`, low profile!)
    const frontRailDepth = this.isPortraitMode ? 0.088 : 0.098;
    const frontFlushTrim = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(innerSpanW, 0.036, frontRailDepth, 0.014, 0.006)),
      this.activeSeason === 1 || this.activeSeason === 3 ? brassMat : aluminumMat,
    );
    frontFlushTrim.position.set(0, 0.004, bedD * 0.5 - frontRailDepth * 0.5);
    this.rakedChassisGroup.add(frontFlushTrim);

    // Proud Stepped Mid-Century Corner Escutcheon Caps + Bold Non-Overlapping 3D Seasonal Silhouettes!
    const capW = railW + 0.01;
    const capGeom = this.trackGeom(createChamferedSlabGeometry(capW, 0.018, 0.135, 0.018, 0.004));
    const cornerX = bedW * 0.5 - railW * 0.5;
    const cornerZ = bedD * 0.5 - 0.068;
    for (const [gx, gz] of [
      [-cornerX, -cornerZ],
      [cornerX, -cornerZ],
      [-cornerX, cornerZ],
      [cornerX, cornerZ],
    ]) {
      const cap = new THREE.Mesh(capGeom, brassMat);
      cap.position.set(gx, railH + 0.006, gz);
      this.rakedChassisGroup.add(cap);
    }

    const seasonTrimMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: seasonAccentHex,
        emissive: seasonAccentHex,
        emissiveIntensity: 0.38,
        roughness: 0.24,
        metalness: 0.35,
      }),
    );

    if (this.activeSeason === 1) {
      // Studio 6A Flagship: Art-Moderne Stepped Walnut/Brass Corner Brackets & Peacock Teal Inlays
      const artBracketGeom = this.trackGeom(
        createChamferedSlabGeometry(capW + 0.032, 0.022, 0.15, 0.016, 0.005),
      );
      const lozengeGeom = this.trackGeom(
        createChamferedSlabGeometry(0.056, 0.018, 0.082, 0.014, 0.004),
      );
      for (const [gx, gz] of [
        [-cornerX, -cornerZ],
        [cornerX, -cornerZ],
        [-cornerX, cornerZ],
        [cornerX, cornerZ],
      ]) {
        const bracket = new THREE.Mesh(artBracketGeom, brassMat);
        bracket.position.set(gx, railH + 0.014, gz);
        const lozenge = new THREE.Mesh(lozengeGeom, seasonTrimMat);
        lozenge.position.set(gx, railH + 0.032, gz);
        this.rakedChassisGroup.add(bracket, lozenge);
      }
      const inlayGeom = this.trackGeom(
        createChamferedSlabGeometry(0.022, 0.034, bedD * 0.56, 0.006, 0.003),
      );
      const beadGeom = this.trackGeom(
        createChamferedSlabGeometry(0.026, 0.008, bedD * 0.58, 0.004, 0.002),
      );
      for (const sx of [-bedW * 0.5 - 0.018, bedW * 0.5 + 0.018]) {
        const inlay = new THREE.Mesh(inlayGeom, seasonTrimMat);
        inlay.position.set(sx, 0.028, 0);
        const topBead = new THREE.Mesh(beadGeom, brassMat);
        topBead.position.set(sx, 0.049, 0);
        const botBead = new THREE.Mesh(beadGeom, brassMat);
        botBead.position.set(sx, 0.007, 0);
        this.rakedChassisGroup.add(inlay, topBead, botBead);
      }
    } else if (this.activeSeason === 2) {
      // Hollywood Blvd Starburst Palace: Sweeping Googie Outer Wing Fins & 3D Corner Starbursts
      const ceriseStarMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xe6397a,
          emissive: 0xe6397a,
          emissiveIntensity: 0.45,
          roughness: 0.22,
          metalness: 0.28,
        }),
      );
      const wingGeom = this.trackGeom(
        createChamferedSlabGeometry(0.105, 0.056, bedD * 0.52, 0.032, 0.009),
      );
      const ridgeGeom = this.trackGeom(
        createChamferedSlabGeometry(0.03, 0.024, bedD * 0.44, 0.012, 0.005),
      );
      for (const sx of [-bedW * 0.5 - 0.056, bedW * 0.5 + 0.056]) {
        const wing = new THREE.Mesh(wingGeom, seasonTrimMat);
        wing.position.set(sx, 0.018, 0);
        const ridge = new THREE.Mesh(ridgeGeom, aluminumMat);
        ridge.position.set(sx, 0.052, 0);
        this.rakedChassisGroup.add(wing, ridge);
      }

      const starShape = new THREE.Shape();
      const rays = 6;
      for (let i = 0; i < rays * 2; i++) {
        const a = (i / (rays * 2)) * Math.PI * 2;
        const r = i % 2 === 0 ? 0.072 : 0.026;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) starShape.moveTo(px, py);
        else starShape.lineTo(px, py);
      }
      starShape.closePath();
      const starGeom = this.trackGeom(
        new THREE.ExtrudeGeometry(starShape, {
          depth: 0.016,
          bevelEnabled: true,
          bevelThickness: 0.003,
          bevelSize: 0.003,
          bevelSegments: 2,
        }),
      );
      starGeom.rotateX(-Math.PI * 0.5);
      const orbGeom = this.trackGeom(new THREE.SphereGeometry(0.022, 12, 10));
      for (const [gx, gz] of [
        [-cornerX, -cornerZ],
        [cornerX, -cornerZ],
        [-cornerX, cornerZ],
        [cornerX, cornerZ],
      ]) {
        const star = new THREE.Mesh(starGeom, ceriseStarMat);
        star.position.set(gx, railH + 0.02, gz);
        const orb = new THREE.Mesh(orbGeom, aluminumMat);
        orb.position.set(gx, railH + 0.04, gz);
        this.rakedChassisGroup.add(star, orb);
      }
    } else if (this.activeSeason === 3) {
      // Manhattan Prime-Time Gold Vault: Tiered 24K Gold Corner Turrets & Emerald Cabochons + Non-Colliding Flanks
      const turretBaseGeom = this.trackGeom(new THREE.CylinderGeometry(0.072, 0.078, 0.042, 12));
      const turretCollarGeom = this.trackGeom(new THREE.CylinderGeometry(0.056, 0.064, 0.016, 12));
      const cabochonGeom = this.trackGeom(new THREE.SphereGeometry(0.036, 14, 10));
      cabochonGeom.scale(1, 0.65, 1);
      for (const [gx, gz] of [
        [-cornerX, -cornerZ],
        [cornerX, -cornerZ],
        [-cornerX, cornerZ],
        [cornerX, cornerZ],
      ]) {
        const base = new THREE.Mesh(turretBaseGeom, brassMat);
        base.position.set(gx, railH + 0.022, gz);
        const collar = new THREE.Mesh(turretCollarGeom, brassMat);
        collar.position.set(gx, railH + 0.048, gz);
        const gem = new THREE.Mesh(cabochonGeom, seasonTrimMat);
        gem.position.set(gx, railH + 0.058, gz);
        this.rakedChassisGroup.add(base, collar, gem);
      }

      const flankGoldGeom = this.trackGeom(
        createChamferedSlabGeometry(0.034, 0.052, bedD * 0.62, 0.01, 0.004),
      );
      const flankEmeraldGeom = this.trackGeom(
        createChamferedSlabGeometry(0.038, 0.02, bedD * 0.54, 0.006, 0.003),
      );
      for (const sx of [-bedW * 0.5 - 0.024, bedW * 0.5 + 0.024]) {
        const gBar = new THREE.Mesh(flankGoldGeom, brassMat);
        gBar.position.set(sx, 0.016, 0);
        const eRib = new THREE.Mesh(flankEmeraldGeom, seasonTrimMat);
        eRib.position.set(sx + (sx > 0 ? 0.003 : -0.003), 0.018, 0);
        this.rakedChassisGroup.add(gBar, eRib);
      }
      const frontApronBar = new THREE.Mesh(
        this.trackGeom(createChamferedSlabGeometry(bedW * 0.72, 0.028, 0.028, 0.008, 0.004)),
        brassMat,
      );
      frontApronBar.position.set(0, 0.016, bedD * 0.5 + 0.018);
      this.rakedChassisGroup.add(frontApronBar);
    } else if (this.activeSeason === 4) {
      // Burbank Super-Stage Kaleidoscope: Aerospace Corner Prism Wings & Cobalt/Gold Chevrons
      const goldAccentMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xf2a922,
          emissive: 0xf2a922,
          emissiveIntensity: 0.42,
          roughness: 0.22,
          metalness: 0.68,
        }),
      );
      const prismWingGeom = this.trackGeom(
        createChamferedSlabGeometry(0.115, 0.036, 0.155, 0.024, 0.007),
      );
      const prismCrestGeom = this.trackGeom(
        createChamferedSlabGeometry(0.06, 0.018, 0.088, 0.014, 0.004),
      );
      for (const [gx, gz] of [
        [-(cornerX + 0.032), -(cornerZ + 0.01)],
        [cornerX + 0.032, -(cornerZ + 0.01)],
        [-(cornerX + 0.032), cornerZ + 0.01],
        [cornerX + 0.032, cornerZ + 0.01],
      ]) {
        const wing = new THREE.Mesh(prismWingGeom, seasonTrimMat);
        wing.position.set(gx, railH + 0.018, gz);
        wing.rotation.y = Math.sign(gx) * Math.sign(gz) * 0.42;
        const crest = new THREE.Mesh(prismCrestGeom, goldAccentMat);
        crest.position.set(gx, railH + 0.044, gz);
        crest.rotation.y = wing.rotation.y;
        this.rakedChassisGroup.add(wing, crest);
      }

      const outerChevronGeom = this.trackGeom(
        createChamferedSlabGeometry(0.084, 0.05, 0.25, 0.022, 0.008),
      );
      const bladeGeom = this.trackGeom(
        createChamferedSlabGeometry(0.042, 0.02, 0.19, 0.012, 0.004),
      );
      for (const sx of [-bedW * 0.5 - 0.044, bedW * 0.5 + 0.044]) {
        for (const sz of [-bedD * 0.22, bedD * 0.22]) {
          const chev = new THREE.Mesh(outerChevronGeom, seasonTrimMat);
          chev.position.set(sx, 0.034, sz);
          const blade = new THREE.Mesh(bladeGeom, goldAccentMat);
          blade.position.set(sx, 0.066, sz);
          this.rakedChassisGroup.add(chev, blade);
        }
      }
    }

    // Compact static pedestal & cabinet rails/channels/ferrules (`36` meshes -> `6` draw calls!)
    this.compactStaticBoardGroup(this.pedestalGroup);
    this.compactStaticBoardGroup(this.rakedChassisGroup, new Set([this.balanceBeamGroup]));

    // D. Perimeter Chasing `#11` Warm Incandescent Marquee Bulbs (Season-tinted 4-Circuit Studio Chaser!)
    this.buildPerimeterMarqueeBulbs(bedW, bedD, railW, railH, brassMat, bulbCircuitHexes);
  }

  private compactStaticBoardGroup(
    container: THREE.Object3D,
    skipSubtrees?: ReadonlySet<THREE.Object3D>,
  ): void {
    container.updateWorldMatrix(true, true);
    const inv = new THREE.Matrix4().copy(container.matrixWorld).invert();
    const rel = new THREE.Matrix4();
    const buckets = new Map<
      string,
      {
        mat: THREE.Material;
        cast: boolean;
        recv: boolean;
        geoms: THREE.BufferGeometry[];
        meshes: THREE.Mesh[];
      }
    >();
    const mIds = new Map<THREE.Material, number>();
    let seq = 1;

    const walk = (n: THREE.Object3D): void => {
      if (skipSubtrees?.has(n) || !n.visible || (n as THREE.Sprite).isSprite) return;
      const mesh = n as THREE.Mesh;
      if (
        mesh.isMesh &&
        !(mesh as unknown as { isInstancedMesh?: boolean }).isInstancedMesh &&
        !Array.isArray(mesh.material) &&
        mesh.geometry?.getAttribute('position') &&
        mesh.children.length === 0 &&
        !mesh.userData?.pickType
      ) {
        let mid = mIds.get(mesh.material);
        if (!mid) {
          mid = seq++;
          mIds.set(mesh.material, mid);
        }
        const key = `${mid}_${mesh.castShadow ? 1 : 0}_${mesh.receiveShadow ? 1 : 0}`;
        let b = buckets.get(key);
        if (!b) {
          b = {
            mat: mesh.material,
            cast: mesh.castShadow,
            recv: mesh.receiveShadow,
            geoms: [],
            meshes: [],
          };
          buckets.set(key, b);
        }
        rel.multiplyMatrices(inv, mesh.matrixWorld);
        const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        g.applyMatrix4(rel);
        b.geoms.push(g);
        b.meshes.push(mesh);
        return;
      }
      for (let i = 0; i < n.children.length; i++) walk(n.children[i]);
    };
    for (let i = 0; i < container.children.length; i++) walk(container.children[i]);

    for (const b of buckets.values()) {
      if (b.geoms.length < 2) {
        for (const g of b.geoms) g.dispose();
        continue;
      }
      let verts = 0;
      for (const g of b.geoms) verts += g.getAttribute('position').count;
      const pos = new Float32Array(verts * 3);
      const norm = new Float32Array(verts * 3);
      const uv = new Float32Array(verts * 2);
      let off = 0;
      for (const g of b.geoms) {
        const pa = g.getAttribute('position') as THREE.BufferAttribute;
        const na = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
        const ua = g.getAttribute('uv') as THREE.BufferAttribute | undefined;
        pos.set(pa.array as ArrayLike<number>, off * 3);
        if (na && na.itemSize === 3) norm.set(na.array as ArrayLike<number>, off * 3);
        if (ua && ua.itemSize === 2) uv.set(ua.array as ArrayLike<number>, off * 2);
        off += pa.count;
        g.dispose();
      }
      for (const m of b.meshes) {
        m.removeFromParent();
      }
      const mg = this.trackGeom(new THREE.BufferGeometry());
      mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      mg.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
      mg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      mg.computeBoundingSphere();
      const mm = new THREE.Mesh(mg, b.mat);
      mm.castShadow = b.cast;
      mm.receiveShadow = b.recv;
      container.add(mm);
    }
  }

  private buildPerimeterMarqueeBulbs(
    bedW: number,
    bedD: number,
    railW: number,
    railH: number,
    brassMat: THREE.Material,
    circuitHexes: readonly [number, number, number, number] = [0xfff5d0, 0xffd56b, 0xfff0b8, 0xf2a922],
  ): void {
    this.marqueeCircuitMats = [];
    this.marqueeHaloMats = [];
    this.marqueeCircuitHexes = [circuitHexes[0], circuitHexes[1], circuitHexes[2], circuitHexes[3]];
    const haloTex = typeof document !== 'undefined' ? getTungstenBulbHaloTexture() : null;

    for (let c = 0; c < 4; c++) {
      const hex = this.marqueeCircuitHexes[c];
      const m = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: c === 0 ? 1.8 : 0.42,
          roughness: 0.12,
          metalness: 0.04,
        }),
      );
      this.marqueeCircuitMats.push(m);

      const hm = this.trackMat(
        new THREE.MeshBasicMaterial({
          map: haloTex,
          color: hex,
          transparent: true,
          opacity: c === 0 ? 0.85 : 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
          side: THREE.DoubleSide,
        }),
      );
      this.marqueeHaloMats.push(hm);
    }

    const bulbProfile = [
      new THREE.Vector2(0.022, 0.0),
      new THREE.Vector2(0.028, 0.022),
      new THREE.Vector2(0.022, 0.044),
      new THREE.Vector2(0.0, 0.052),
    ];
    const bulbGeom = this.trackGeom(new THREE.LatheGeometry(bulbProfile, 10));
    const socketGeom = this.trackGeom(new THREE.CylinderGeometry(0.029, 0.033, 0.016, 10));
    const haloScale = this.isPortraitMode ? 0.145 : 0.165;
    const haloQuadGeom = this.trackGeom(new THREE.PlaneGeometry(haloScale, haloScale));
    haloQuadGeom.rotateX(-0.78); // Tilted cleanly toward the overhead studio camera!

    const positions: Array<[number, number, number]> = [];
    const railX = bedW * 0.5 - railW * 0.5;
    const topZ = -bedD * 0.5 + (this.isPortraitMode ? 0.048 : 0.058);
    const botZ = bedD * 0.5 - (this.isPortraitMode ? 0.044 : 0.05);
    const topBotCount = this.isPortraitMode ? 6 : 10;
    const sideCount = this.isPortraitMode ? 7 : 6;

    // Top row (left -> right)
    for (let i = 0; i < topBotCount; i++) {
      const t = (i + 0.5) / topBotCount;
      const x = THREE.MathUtils.lerp(-railX + 0.16, railX - 0.16, t);
      positions.push([x, railH + 0.002, topZ]);
    }
    // Right rail (top -> bottom)
    for (let i = 0; i < sideCount; i++) {
      const t = (i + 0.5) / sideCount;
      const z = THREE.MathUtils.lerp(-bedD * 0.5 + 0.19, bedD * 0.5 - 0.19, t);
      positions.push([railX, railH + 0.002, z]);
    }
    // Bottom front trim (right -> left)
    for (let i = 0; i < topBotCount; i++) {
      const t = (i + 0.5) / topBotCount;
      const x = THREE.MathUtils.lerp(railX - 0.16, -railX + 0.16, t);
      positions.push([x, 0.042, botZ]);
    }
    // Left rail (bottom -> top)
    for (let i = 0; i < sideCount; i++) {
      const t = (i + 0.5) / sideCount;
      const z = THREE.MathUtils.lerp(bedD * 0.5 - 0.19, -bedD * 0.5 + 0.19, t);
      positions.push([-railX, railH + 0.002, z]);
    }

    // Instanced sockets (`1` draw call) + 4-circuit bulbs (`4` draw calls) + 4-circuit halos (`4` draw calls)!
    const sockInst = new THREE.InstancedMesh(socketGeom, brassMat, positions.length);
    const dummy = new THREE.Object3D();
    const circuitBuckets: Array<Array<[number, number, number]>> = [[], [], [], []];

    for (let i = 0; i < positions.length; i++) {
      const [bx, by, bz] = positions[i];
      dummy.position.set(bx, by + 0.006, bz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      sockInst.setMatrixAt(i, dummy.matrix);
      circuitBuckets[i % 4].push([bx, by, bz]);
    }
    sockInst.instanceMatrix.needsUpdate = true;
    this.rakedChassisGroup.add(sockInst);

    for (let c = 0; c < 4; c++) {
      const bucket = circuitBuckets[c];
      if (bucket.length === 0) continue;
      const bInst = new THREE.InstancedMesh(bulbGeom, this.marqueeCircuitMats[c], bucket.length);
      const hInst = new THREE.InstancedMesh(haloQuadGeom, this.marqueeHaloMats[c], bucket.length);
      hInst.renderOrder = 4;
      for (let k = 0; k < bucket.length; k++) {
        const [bx, by, bz] = bucket[k];
        dummy.position.set(bx, by + 0.014, bz);
        dummy.updateMatrix();
        bInst.setMatrixAt(k, dummy.matrix);

        dummy.position.set(bx, by + 0.048, bz + 0.01);
        dummy.updateMatrix();
        hInst.setMatrixAt(k, dummy.matrix);
      }
      bInst.instanceMatrix.needsUpdate = true;
      hInst.instanceMatrix.needsUpdate = true;
      this.rakedChassisGroup.add(bInst, hInst);
    }
  }

  // --------------------------------------------------------------------------
  // 12 Bespoke Moving & Interactive 3D Contraption Hardware Suites
  // --------------------------------------------------------------------------

  private registerGimmickHitVolume(
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    localPos: [number, number, number] = [0, 0, 0],
  ): THREE.Mesh {
    const hitMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
      }),
    );
    const hitMesh = new THREE.Mesh(this.trackGeom(new THREE.BoxGeometry(w, h, d)), hitMat);
    hitMesh.position.set(localPos[0], localPos[1], localPos[2]);
    hitMesh.userData = {
      pickType: 'BOARD_GIMMICK',
      boardId: this.activeBoardId,
    };
    parent.add(hitMesh);
    this.pickMeshes.push(hitMesh);
    return hitMesh;
  }

  /**
   * Builds a compact animated 1966 sculptural centerpiece medallion perched neatly at
   * the top center crown on Mobile Portrait (plus Portrait `hexBridgeLinks` on `BOARD_02`
   * and Portrait `fulcrum` + `beamTruss` on `BOARD_12`) so EVERY one of the 12 boards
   * retains its unmistakable TV identity AND tactile Portrait gimmick without expanding
   * horizontal width past `2.56m`!
   */
  private buildPortraitBoardCrest(spec: BoardSpecV7): void {
    const portraitDepth = this.getActivePortraitDepth(this.tiles.length || spec.slots.length);
    const crownZ = -(portraitDepth * 0.5 + 0.08);
    const crestRoot = new THREE.Group();
    crestRoot.name = `PortraitCrest_${this.activeBoardId}`;
    crestRoot.position.set(0, 0.11, crownZ);

    const palette = this.resolveSeasonalMaterialPalette(spec);
    const brushedTex = typeof document !== 'undefined' ? getBrushedAnodizedTexture() : null;
    const louverTex = typeof document !== 'undefined' ? getNeutralLouverToteBedTexture() : null;
    const brassMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.brassHex,
        map: brushedTex,
        roughness: 0.22,
        metalness: 0.92,
        clearcoat: 0.55,
      }),
    );
    const aluminumMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe4edf8,
        map: brushedTex,
        roughness: 0.22,
        metalness: 0.86,
        clearcoat: 0.48,
      }),
    );
    const darkMetalMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.consoleBakeliteHex,
        map: louverTex,
        roughness: 0.28,
        metalness: 0.42,
        clearcoat: 0.62,
      }),
    );
    const peacockGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: palette.seasonAccentHex,
        emissive: palette.seasonAccentHex,
        emissiveIntensity: 0.95,
        roughness: 0.18,
        metalness: 0.35,
      }),
    );
    const goldGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: palette.seasonSpotHex,
        emissive: palette.seasonSpotHex,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.45,
      }),
    );
    const ceriseGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xff6da3,
        emissive: 0xe63b7a,
        emissiveIntensity: 0.88,
        roughness: 0.2,
        metalness: 0.25,
      }),
    );
    const tangerineGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xff8a5c,
        emissive: 0xeb5b28,
        emissiveIntensity: 0.88,
        roughness: 0.2,
        metalness: 0.25,
      }),
    );

    const spinner = new THREE.Group();
    const outerRing = new THREE.Mesh(
      this.trackGeom(new THREE.TorusGeometry(0.145, 0.014, 10, 28)),
      brassMat,
    );
    spinner.add(outerRing);

    switch (this.activeBoardId) {
      case 'BOARD_01_FUNK_CROSSFADER': {
        // Compact vinyl 33 RPM disc + gold crossfader cap
        const vinylDisc = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.12, 0.12, 0.016, 24)),
          darkMetalMat,
        );
        vinylDisc.rotation.x = Math.PI * 0.5;
        const label = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.052, 0.052, 0.022, 18)),
          ceriseGlowMat,
        );
        label.rotation.x = Math.PI * 0.5;
        spinner.add(vinylDisc, label);
        break;
      }

      case 'BOARD_02_JUBILEE_HEX_BRIDGE': {
        // 1966 Jubilee starburst + build glowing Portrait Hex-Bridge conduits beneath tiles!
        const rayGeom = this.trackGeom(new THREE.ConeGeometry(0.02, 0.13, 6));
        for (let r = 0; r < 8; r++) {
          const a = (r / 8) * Math.PI * 2;
          const ray = new THREE.Mesh(rayGeom, r % 2 === 0 ? goldGlowMat : peacockGlowMat);
          ray.position.set(Math.cos(a) * 0.072, Math.sin(a) * 0.072, 0);
          ray.rotation.z = a - Math.PI * 0.5;
          spinner.add(ray);
        }
        for (let i = 0; i < this.tiles.length; i++) {
          for (let j = i + 1; j < this.tiles.length; j++) {
            const a = this.tiles[i];
            const b = this.tiles[j];
            const dist = Math.hypot(b.x - a.x, b.z - a.z);
            if (dist <= 1.02) {
              const condMat = this.trackMat(
                new THREE.MeshStandardMaterial({
                  color: 0x0098a6,
                  emissive: 0x0098a6,
                  emissiveIntensity: 0.34,
                  roughness: 0.24,
                  metalness: 0.72,
                }),
              );
              const bar = new THREE.Mesh(
                this.trackGeom(createChamferedSlabGeometry(dist * 0.88, 0.024, 0.056, 0.012, 0.005)),
                condMat,
              );
              bar.position.set((a.x + b.x) * 0.5, 0.022, (a.z + b.z) * 0.5);
              bar.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
              this.rakedChassisGroup.add(bar);
              this.hexBridgeLinks.push({ indexA: i, indexB: j, mesh: bar, mat: condMat });

              const pipeMat = this.trackMat(
                new THREE.MeshStandardMaterial({
                  color: 0x8ef3ff,
                  emissive: 0x33cad8,
                  emissiveIntensity: 0.5,
                  roughness: 0.15,
                }),
              );
              const lightPipe = new THREE.Mesh(
                this.trackGeom(createChamferedSlabGeometry(dist * 0.76, 0.01, 0.018, 0.004, 0.002)),
                pipeMat,
              );
              lightPipe.position.set((a.x + b.x) * 0.5, 0.044, (a.z + b.z) * 0.5);
              lightPipe.rotation.y = bar.rotation.y;
              this.rakedChassisGroup.add(lightPipe);
              this.hexBridgePulseMats.push(pipeMat);
            }
          }
        }
        break;
      }

      case 'BOARD_03_VAUDEVILLE_GEAR_TRAIN': {
        // 8-spoke Burbank Pop-Art Kaleidoscope Prize Wheel
        const popMats = [peacockGlowMat, goldGlowMat, ceriseGlowMat, tangerineGlowMat];
        const spokeG = this.trackGeom(createChamferedSlabGeometry(0.11, 0.014, 0.028, 0.004, 0.002));
        for (let s = 0; s < 8; s++) {
          const sa = (s / 8) * Math.PI * 2;
          const sp = new THREE.Mesh(spokeG, popMats[s % 4]);
          sp.position.set(Math.cos(sa) * 0.068, Math.sin(sa) * 0.068, 0);
          sp.rotation.z = sa;
          spinner.add(sp);
        }
        break;
      }

      case 'BOARD_04_MAHOGANY_SWITCHBOARD': {
        // 4 Supervisory Fresnel Jewel Lamps mounted inside brass crown crossbar
        const lampHexes = [0x1a5fd0, 0xf4a91f, 0x0098a6, 0xeb5b28];
        const domeG = this.trackGeom(new THREE.CylinderGeometry(0.024, 0.028, 0.026, 12));
        domeG.rotateX(Math.PI * 0.5);
        for (let i = 0; i < 4; i++) {
          const lMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: lampHexes[i],
              emissive: lampHexes[i],
              emissiveIntensity: i === 0 ? 1.55 : 0.45,
              roughness: 0.16,
            }),
          );
          const dome = new THREE.Mesh(domeG, lMat);
          dome.position.set(-0.084 + i * 0.056, 0, 0.012);
          spinner.add(dome);
          this.switchboardLamps.push(lMat);
        }
        break;
      }

      case 'BOARD_05_LARSON_SPIN_RING': {
        // Chasing 8-lamp Apollo ring + brass paddle cap
        const bulbG = this.trackGeom(new THREE.SphereGeometry(0.022, 10, 10));
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const bMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xfff2c2,
              emissive: 0xffd56b,
              emissiveIntensity: i === 0 ? 1.8 : 0.3,
              roughness: 0.14,
            }),
          );
          const b = new THREE.Mesh(bulbG, bMat);
          b.position.set(Math.cos(a) * 0.11, Math.sin(a) * 0.11, 0.01);
          spinner.add(b);
          this.larsonBulbMats.push(bMat);
        }
        break;
      }

      case 'BOARD_06_BOARDWALK_PINBALL': {
        // Pop-bumper cap + twin tangerine/cerise ring
        const bumperCap = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.092, 0.108, 0.032, 20)),
          tangerineGlowMat,
        );
        bumperCap.rotation.x = Math.PI * 0.5;
        spinner.add(bumperCap);
        break;
      }

      case 'BOARD_07_MONTE_CARLO_SHOE': {
        // Mini Monte Carlo 8-spoke brass roulette turret
        const hub = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.036, 0.044, 0.028, 16)),
          goldGlowMat,
        );
        hub.rotation.x = Math.PI * 0.5;
        spinner.add(hub);
        const spokeG = this.trackGeom(createChamferedSlabGeometry(0.24, 0.012, 0.016, 0.003, 0.002));
        for (let s = 0; s < 4; s++) {
          const sp = new THREE.Mesh(spokeG, s % 2 === 0 ? brassMat : peacockGlowMat);
          sp.rotation.z = (s / 4) * Math.PI;
          spinner.add(sp);
        }
        break;
      }

      case 'BOARD_08_GEODESIC_SUNDIAL':
      case 'BOARD_10_SOVEREIGN_ZIGGURAT': {
        // Orbiting atomic / armillary crossed rings
        const r2 = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.115, 0.01, 10, 24)),
          peacockGlowMat,
        );
        r2.rotation.x = Math.PI / 3;
        const r3 = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.115, 0.01, 10, 24)),
          goldGlowMat,
        );
        r3.rotation.y = Math.PI / 3;
        spinner.add(r2, r3);
        break;
      }

      case 'BOARD_09_PIRATE_UHF_DECK': {
        // Knurled UHF carrier dial + pointer bar
        const dial = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.1, 0.11, 0.026, 20)),
          darkMetalMat,
        );
        dial.rotation.x = Math.PI * 0.5;
        const bar = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.024, 0.11, 0.02, 0.004, 0.002)),
          goldGlowMat,
        );
        bar.position.set(0, 0.04, 0.016);
        spinner.add(dial, bar);
        break;
      }

      case 'BOARD_11_WHEW_GAUNTLET': {
        // 5-Lamp Gold Gauntlet Recon Scanner Bar inside crown
        const scanG = this.trackGeom(createChamferedSlabGeometry(0.036, 0.044, 0.02, 0.005, 0.002));
        for (let s = 0; s < 5; s++) {
          const sMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xffd56b,
              emissive: 0xff6738,
              emissiveIntensity: s === 0 ? 1.7 : 0.35,
              roughness: 0.16,
            }),
          );
          const lamp = new THREE.Mesh(scanG, sMat);
          lamp.position.set(-0.096 + s * 0.048, 0, 0.014);
          spinner.add(lamp);
          this.gauntletScannerMats.push(sMat);
        }
        break;
      }

      case 'BOARD_12_PENDULUM_BALANCE': {
        // Portrait Fulcrum Knife-Edge + Equilibrium Calibration Arc + Tilting Balance Beam Deck!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.22, 1.24, 0.0135, 0, 0);
        const fulcrumShape = new THREE.Shape();
        fulcrumShape.moveTo(-0.15, 0);
        fulcrumShape.lineTo(0.15, 0);
        fulcrumShape.lineTo(0, 0.105);
        fulcrumShape.closePath();
        const fulcrumGeom = this.trackGeom(
          new THREE.ExtrudeGeometry(fulcrumShape, {
            depth: 2.36,
            bevelEnabled: true,
            bevelThickness: 0.006,
            bevelSize: 0.006,
            bevelSegments: 2,
          }),
        );
        fulcrumGeom.translate(0, 0, -1.18);
        const fulcrum = new THREE.Mesh(fulcrumGeom, darkMetalMat);
        fulcrum.position.set(0, 0.01, 0);
        this.rakedChassisGroup.add(fulcrum);

        const beamDeckMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0x007b85,
            roughness: 0.36,
            metalness: 0.34,
            clearcoat: 0.55,
          }),
        );
        beamDeckMat.envMapIntensity = 0.5;
        const beamTruss = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(2.22, 0.028, 2.38, 0.05, 0.007)),
          beamDeckMat,
        );
        beamTruss.position.set(0, 0.115, 0);
        this.balanceBeamGroup.add(beamTruss);

        const eqArcMat = this.trackMat(
          new THREE.MeshStandardMaterial({
            color: 0x33cad8,
            emissive: 0x0098a6,
            emissiveIntensity: 0.85,
            roughness: 0.18,
          }),
        );
        const eqArc = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.12, 0.014, 10, 24, Math.PI)),
          eqArcMat,
        );
        eqArc.position.set(0, -0.02, 0.012);
        this.pendulumEquilibriumMat = eqArcMat;
        spinner.add(eqArc);

        const balanceArm = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.23, 0.018, 0.018, 0.004, 0.002)),
          brassMat,
        );
        spinner.add(balanceArm);
        break;
      }
    }

    const coreJewel = new THREE.Mesh(
      this.trackGeom(new THREE.OctahedronGeometry(0.04, 0)),
      goldGlowMat,
    );
    spinner.add(coreJewel);
    crestRoot.add(spinner);
    this.portraitCrestSpinner = spinner;
    // Tactile Portrait BOARD_GIMMICK hit volume cleanly centered between FlankSwitch & CornerTotem (zero tile/HUD overlap!)
    this.registerGimmickHitVolume(crestRoot, 0.56, 0.34, 0.36, [0, 0.04, 0]);
    this.rakedChassisGroup.add(crestRoot);
  }

  /**
   * Builds a soft additive 1966 Studio Vertical Follow-Spotlight Hover Beam +
   * base floor ring inside `balanceBeamGroup` that glides smoothly onto whichever
   * tile the player hovers (or Rival targets!).
   */
  private buildHoverSpotlightBeam(): void {
    const beamGroup = new THREE.Group();
    beamGroup.name = 'StudioHoverSpotlightBeam_V7';
    beamGroup.visible = false;

    let beamAlphaTex: THREE.CanvasTexture | null = null;
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Feathered studio spotlight shaft (strictly 0 alpha across top 28% & bottom 4% -> ZERO cylinder seam!)
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0.0, 'rgba(255,255,255,0.0)');
        grad.addColorStop(0.28, 'rgba(255,255,255,0.0)');
        grad.addColorStop(0.62, 'rgba(255,255,255,0.22)');
        grad.addColorStop(0.88, 'rgba(255,255,255,0.46)');
        grad.addColorStop(0.97, 'rgba(255,255,255,0.0)');
        grad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 256);
        beamAlphaTex = this.trackTex(new THREE.CanvasTexture(c));
        beamAlphaTex.wrapS = THREE.ClampToEdgeWrapping;
        beamAlphaTex.wrapT = THREE.ClampToEdgeWrapping;
        beamAlphaTex.needsUpdate = true;
      }
    }

    const coneHeight = 1.65;
    const coneGeom = this.trackGeom(new THREE.CylinderGeometry(0.15, 0.42, coneHeight, 28, 1, true));
    const coneMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffd56b,
        map: beamAlphaTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const coneMesh = new THREE.Mesh(coneGeom, coneMat);
    coneMesh.position.y = coneHeight * 0.5 + 0.065;
    beamGroup.add(coneMesh);

    const poolHaloTex = typeof document !== 'undefined' ? getTungstenBulbHaloTexture() : null;
    const ringGeom = this.trackGeom(new THREE.PlaneGeometry(0.92, 0.92));
    ringGeom.rotateX(-Math.PI * 0.5);
    const ringMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffd56b,
        map: poolHaloTex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    );
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    // Seat feathered spotlight pool down on the recessed shadowbox bed beneath the tile plinth (zero hard circle edge!)
    ringMesh.position.y = -0.004;
    beamGroup.add(ringMesh);

    this.balanceBeamGroup.add(beamGroup);
    this.hoverSpotBeamGroup = beamGroup;
    this.hoverSpotConeMat = coneMat;
    this.hoverSpotRingMat = ringMat;

    // Build 4-beam Warm 2700K Studio Follow-Spot Pool for `ROVING_SPOTLIGHT` Unlock Topology!
    this.rovingSpotBeams = [];
    for (let s = 0; s < 4; s++) {
      const rGroup = new THREE.Group();
      rGroup.name = `RovingSpotlightBeam_${s}`;
      rGroup.visible = false;

      const rConeMat = this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xffd56b,
          map: beamAlphaTex,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
          side: THREE.DoubleSide,
        }),
      );
      const rCone = new THREE.Mesh(coneGeom, rConeMat);
      rCone.position.y = coneHeight * 0.5 + 0.06;
      rGroup.add(rCone);

      const rRingMat = this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xffe28a,
          map: poolHaloTex,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
          side: THREE.DoubleSide,
        }),
      );
      const rRing = new THREE.Mesh(ringGeom, rRingMat);
      rRing.position.y = -0.003;
      rGroup.add(rRing);

      this.balanceBeamGroup.add(rGroup);
      this.rovingSpotBeams.push({
        group: rGroup,
        coneMat: rConeMat,
        ringMat: rRingMat,
        pos: new THREE.Vector3(0, 0.16, 0),
        alpha: 0,
      });
    }
  }

  private buildBoardSpecificHardware(spec: BoardSpecV7): void {
    const palette = this.resolveSeasonalMaterialPalette(spec);
    const brushedTex = typeof document !== 'undefined' ? getBrushedAnodizedTexture() : null;
    const louverTex = typeof document !== 'undefined' ? getNeutralLouverToteBedTexture() : null;
    const walnutTex = typeof document !== 'undefined' ? getAmericanWalnutVeneerTexture() : null;

    const brassMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.brassHex,
        map: brushedTex,
        roughness: 0.2,
        metalness: 0.92,
        clearcoat: 0.58,
      }),
    );
    const aluminumMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe6eef8,
        map: brushedTex,
        roughness: 0.2,
        metalness: 0.88,
        clearcoat: 0.52,
      }),
    );
    const copperMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe6843c,
        map: brushedTex,
        roughness: 0.22,
        metalness: 0.9,
        clearcoat: 0.48,
      }),
    );
    const darkMetalMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.consoleBakeliteHex,
        map: louverTex,
        roughness: 0.28,
        metalness: 0.42,
        clearcoat: 0.62,
      }),
    );
    const walnutPropMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: this.activeSeason === 1 ? 0xbf7a4c : palette.woodHex,
        map: this.activeSeason === 2 ? null : this.activeSeason === 4 ? brushedTex : walnutTex,
        roughness: 0.3,
        metalness: this.activeSeason === 4 ? 0.68 : 0.08,
        clearcoat: 0.65,
      }),
    );
    const peacockGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x33cad8,
        emissive: 0x0098a6,
        emissiveIntensity: 0.85,
        roughness: 0.18,
        metalness: 0.25,
      }),
    );
    const tangerineGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xff8a5c,
        emissive: 0xeb5b28,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.25,
      }),
    );
    const ceriseGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xff6da3,
        emissive: 0xe63b7a,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.25,
      }),
    );
    const goldGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffd56b,
        emissive: 0xf4a91f,
        emissiveIntensity: 0.95,
        roughness: 0.18,
        metalness: 0.45,
      }),
    );
    const crystalGlassMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xf4f8ff,
        roughness: 0.08,
        metalness: 0.02,
        transparent: true,
        opacity: 0.26,
        clearcoat: 1.0,
        depthWrite: false,
      }),
    );

    switch (this.activeBoardId) {
      case 'BOARD_01_FUNK_CROSSFADER': {
        // Dual spinning 33.3 RPM Pressed-Vinyl & Walnut Transcription Turntables + Satin-Brass Tonearms + Live Crossfader VU!
        let vinylGrooveTex: THREE.CanvasTexture | null = null;
        if (typeof document !== 'undefined') {
          const vc = document.createElement('canvas');
          vc.width = 256;
          vc.height = 256;
          const vctx = vc.getContext('2d');
          if (vctx) {
            vctx.fillStyle = '#1E140E';
            vctx.fillRect(0, 0, 256, 256);
            // Anisotropic bow-tie vinyl specular sheen wedges against deep pressed black LP!
            vctx.save();
            vctx.translate(128, 128);
            for (const ang of [0.42, Math.PI + 0.42]) {
              vctx.save();
              vctx.rotate(ang);
              const sheen = vctx.createLinearGradient(-128, 0, 128, 0);
              sheen.addColorStop(0.0, 'rgba(255,255,255,0)');
              sheen.addColorStop(0.5, 'rgba(235,244,255,0.42)');
              sheen.addColorStop(1.0, 'rgba(255,255,255,0)');
              vctx.fillStyle = sheen;
              vctx.beginPath();
              vctx.moveTo(0, 0);
              vctx.arc(0, 0, 124, -0.24, 0.24);
              vctx.closePath();
              vctx.fill();
              vctx.restore();
            }
            // Concentric 33.3 RPM micro-grooves + track band breaks!
            for (let r = 50; r <= 122; r += 3) {
              vctx.strokeStyle =
                r % 18 === 0 ? 'rgba(0, 0, 0, 0.96)' : 'rgba(220, 236, 255, 0.16)';
              vctx.lineWidth = r % 18 === 0 ? 2.2 : 1.1;
              vctx.beginPath();
              vctx.arc(0, 0, r, 0, Math.PI * 2);
              vctx.stroke();
            }
            // 1966 IBC Gold & Crimson Center Record Label!
            vctx.fillStyle = '#F4A91F';
            vctx.beginPath();
            vctx.arc(0, 0, 48, 0, Math.PI * 2);
            vctx.fill();
            vctx.fillStyle = '#C9184A';
            vctx.beginPath();
            vctx.arc(0, 0, 44, Math.PI, Math.PI * 2);
            vctx.fill();
            vctx.strokeStyle = '#121A2B';
            vctx.lineWidth = 3;
            vctx.beginPath();
            vctx.arc(0, 0, 45, 0, Math.PI * 2);
            vctx.stroke();
            vctx.fillStyle = '#FFF9EC';
            vctx.font = '900 12px "Jost", Arial, sans-serif';
            vctx.textAlign = 'center';
            vctx.fillText('IBC 6A', 0, -18);
            vctx.fillStyle = '#121A2B';
            vctx.fillText('33 RPM', 0, 24);
            vctx.restore();
          }
          vinylGrooveTex = this.trackTex(new THREE.CanvasTexture(vc));
          vinylGrooveTex.colorSpace = THREE.SRGBColorSpace;
          vinylGrooveTex.anisotropy = 8;
        }

        // Low envMapIntensity prevents overhead softboxes from washing black vinyl LP into grey!
        const vinylDiscMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            map: vinylGrooveTex,
            roughness: 0.42,
            metalness: 0.04,
            clearcoat: 0.18,
            clearcoatRoughness: 0.25,
          }),
        );
        vinylDiscMat.envMapIntensity = 0.14;
        const plinthGeom = this.trackGeom(createChamferedSlabGeometry(0.46, 0.026, 0.5, 0.045, 0.008));
        const platterGeom = this.trackGeom(new THREE.CylinderGeometry(0.205, 0.212, 0.026, 36));
        const vinylGeom = this.trackGeom(new THREE.CylinderGeometry(0.188, 0.188, 0.012, 36));
        const spindleGeom = this.trackGeom(new THREE.CylinderGeometry(0.014, 0.018, 0.036, 16));

        for (const px of [-1.86, 1.86]) {
          this.addBoardContactShadow(this.rakedChassisGroup, 0.28, 0.3, 0.0435, px, -0.44);
          // Sunlit American Walnut Transcription Deck Plinth!
          const woodPlinth = new THREE.Mesh(plinthGeom, walnutPropMat);
          woodPlinth.position.set(px, 0.034, -0.44);
          this.rakedChassisGroup.add(woodPlinth);

          const deck = new THREE.Group();
          deck.position.set(px, 0.056, -0.42);
          const platter = new THREE.Mesh(platterGeom, brassMat);
          const vinyl = new THREE.Mesh(vinylGeom, vinylDiscMat);
          vinyl.position.y = 0.018;
          const spindle = new THREE.Mesh(spindleGeom, brassMat);
          spindle.position.y = 0.028;
          const strobeRing = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(0.202, 0.009, 8, 36)),
            brassMat,
          );
          strobeRing.rotation.x = Math.PI * 0.5;
          strobeRing.position.y = 0.014;
          const lug = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(0.015, 0.015, 0.024, 12)),
            goldGlowMat,
          );
          lug.position.set(0.138, 0.024, 0);
          deck.add(platter, vinyl, spindle, strobeRing, lug);
          this.rakedChassisGroup.add(deck);
          this.vinylPlatters.push(deck);

          // Sculpted 24K Brass Broadcast S-Tonearm + Counterweight + Crimson/Gold Phono Headshell!
          const armBase = new THREE.Group();
          armBase.position.set(px + (px < 0 ? -0.145 : 0.145), 0.062, -0.62);
          const gimbal = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(0.036, 0.044, 0.042, 18)),
            brassMat,
          );
          const counterweight = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(0.024, 0.024, 0.038, 16)),
            copperMat,
          );
          counterweight.rotation.x = Math.PI * 0.5;
          counterweight.position.set(0, 0.028, -0.042);
          const armCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.028, -0.02),
            new THREE.Vector3(px < 0 ? 0.048 : -0.048, 0.036, 0.11),
            new THREE.Vector3(px < 0 ? 0.105 : -0.105, 0.03, 0.22),
          ]);
          const tonearm = new THREE.Mesh(
            this.trackGeom(new THREE.TubeGeometry(armCurve, 16, 0.0085, 8, false)),
            brassMat,
          );
          const headshell = new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.034, 0.018, 0.056, 0.006, 0.003)),
            ceriseGlowMat,
          );
          headshell.position.set(px < 0 ? 0.108 : -0.108, 0.028, 0.232);
          headshell.rotation.y = px < 0 ? -0.28 : 0.28;
          armBase.add(gimbal, counterweight, tonearm, headshell);
          this.rakedChassisGroup.add(armBase);
        }

        // Front-apron Interactive 3D Crossfader Slider + Walnut/Brass Console Bezel + 10-segment Glowing 1966 VU Deck Strip!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.78, 0.19, 0.0135, 0, 1.08);
        const faderHousing = new THREE.Group();
        faderHousing.position.set(0, 0.024, 1.08);
        const walnutBezel = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(1.42, 0.018, 0.28, 0.036, 0.006)),
          walnutPropMat,
        );
        walnutBezel.position.y = -0.005;
        const brassRim = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(1.38, 0.022, 0.25, 0.032, 0.005)),
          brassMat,
        );
        brassRim.position.y = -0.001;
        const trackPlate = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(1.32, 0.026, 0.21, 0.026, 0.005)),
          darkMetalMat,
        );
        const slotGroove = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.86, 0.014, 0.038, 0.01, 0.003)),
          aluminumMat,
        );
        slotGroove.position.y = 0.021;
        faderHousing.add(walnutBezel, brassRim, trackPlate, slotGroove);

        // 10 illuminated Living Color VU meter segments framing the crossfader
        const vuColors = [
          0x0098a6, 0x0098a6, 0x1a5fd0, 0xf4a91f, 0xffd56b,
          0xffd56b, 0xf4a91f, 0x1a5fd0, 0x0098a6, 0xeb5b28,
        ];
        const segGeom = this.trackGeom(createChamferedSlabGeometry(0.062, 0.012, 0.028, 0.004, 0.002));
        for (let s = 0; s < 10; s++) {
          const vMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: vuColors[s],
              emissive: vuColors[s],
              emissiveIntensity: 0.45,
              roughness: 0.2,
            }),
          );
          const seg = new THREE.Mesh(segGeom, vMat);
          seg.position.set(-0.495 + s * 0.11, 0.024, -0.072);
          faderHousing.add(seg);
          this.crossfaderVuMats.push(vMat);
        }

        const thumb = new THREE.Group();
        const thumbCap = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.14, 0.056, 0.14, 0.02, 0.008)),
          brassMat,
        );
        const thumbInlay = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.03, 0.062, 0.11, 0.008, 0.004)),
          peacockGlowMat,
        );
        // Knurled tactile finger-ribs on brass crossfader cap!
        const ribGeom = this.trackGeom(createChamferedSlabGeometry(0.008, 0.061, 0.095, 0.002, 0.001));
        for (const rx of [-0.042, -0.026, 0.026, 0.042]) {
          const rib = new THREE.Mesh(ribGeom, aluminumMat);
          thumb.add(rib);
          rib.position.set(rx, 0, 0);
        }
        thumb.add(thumbCap, thumbInlay);
        thumb.position.set(-0.34, 0.022, 0);
        faderHousing.add(thumb);
        this.crossfaderThumbGroup = thumb;

        // 11 Precision-Engraved Satin-Aluminum & Gold dB Calibration Ticks flanking the fader slot!
        const majorTickGeom = this.trackGeom(createChamferedSlabGeometry(0.01, 0.008, 0.032, 0.002, 0.001));
        const minorTickGeom = this.trackGeom(createChamferedSlabGeometry(0.007, 0.008, 0.02, 0.002, 0.001));
        for (let t = 0; t <= 10; t++) {
          const tx = -0.4 + t * 0.08;
          const isMajor = t === 0 || t === 5 || t === 10;
          const tMesh = new THREE.Mesh(isMajor ? majorTickGeom : minorTickGeom, isMajor ? goldGlowMat : aluminumMat);
          tMesh.position.set(tx, 0.022, 0.056);
          faderHousing.add(tMesh);
        }

        this.registerGimmickHitVolume(faderHousing, 1.4, 0.24, 0.38, [0, 0.06, 0]);
        this.rakedChassisGroup.add(faderHousing);
        break;
      }

      case 'BOARD_02_JUBILEE_HEX_BRIDGE': {
        // Glowing Dual-Layer Honeycomb Light-Bridges + Twin Counter-Rotating 1966 Jubilee Starburst Spinners!
        for (let i = 0; i < this.tiles.length; i++) {
          for (let j = i + 1; j < this.tiles.length; j++) {
            const a = this.tiles[i];
            const b = this.tiles[j];
            const dist = Math.hypot(b.x - a.x, b.z - a.z);
            if (dist <= 1.02) {
              const condMat = this.trackMat(
                new THREE.MeshStandardMaterial({
                  color: 0x0098a6,
                  emissive: 0x0098a6,
                  emissiveIntensity: 0.28,
                  roughness: 0.24,
                  metalness: 0.72,
                }),
              );
              const bar = new THREE.Mesh(
                this.trackGeom(createChamferedSlabGeometry(dist * 0.88, 0.024, 0.056, 0.012, 0.005)),
                condMat,
              );
              bar.position.set((a.x + b.x) * 0.5, 0.022, (a.z + b.z) * 0.5);
              bar.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
              this.rakedChassisGroup.add(bar);
              this.hexBridgeLinks.push({ indexA: i, indexB: j, mesh: bar, mat: condMat });

              // Inner glowing optical light-pipe core pulsing along each honeycomb bridge!
              const pipeMat = this.trackMat(
                new THREE.MeshStandardMaterial({
                  color: 0x8ef3ff,
                  emissive: 0x33cad8,
                  emissiveIntensity: 0.5,
                  roughness: 0.15,
                }),
              );
              const lightPipe = new THREE.Mesh(
                this.trackGeom(createChamferedSlabGeometry(dist * 0.76, 0.01, 0.018, 0.004, 0.002)),
                pipeMat,
              );
              lightPipe.position.set((a.x + b.x) * 0.5, 0.044, (a.z + b.z) * 0.5);
              lightPipe.rotation.y = bar.rotation.y;
              this.rakedChassisGroup.add(lightPipe);
              this.hexBridgePulseMats.push(pipeMat);
            }
          }
        }

        // Twin Rotating 1966 Jubilee Atomic Starburst Medallions in Open Side Bays (100% clear of hexes & widgets!)
        const rayGeom = this.trackGeom(new THREE.ConeGeometry(0.024, 0.22, 6));
        for (const sx of [-1.82, 1.82]) {
          this.addBoardContactShadow(this.rakedChassisGroup, 0.24, 0.24, 0.0435, sx, -0.08);
          const starGroup = new THREE.Group();
          starGroup.position.set(sx, 0.066, -0.08);
          starGroup.scale.setScalar(0.72);
          const outerRim = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(0.24, 0.014, 10, 32)),
            brassMat,
          );
          outerRim.rotation.x = Math.PI * 0.5;
          starGroup.add(outerRim);
          for (let r = 0; r < 10; r++) {
            const a = (r / 10) * Math.PI * 2;
            const ray = new THREE.Mesh(rayGeom, r % 2 === 0 ? goldGlowMat : peacockGlowMat);
            ray.position.set(Math.cos(a) * 0.11, 0.012, Math.sin(a) * 0.11);
            ray.rotation.z = -Math.PI * 0.5;
            ray.rotation.y = -a;
            starGroup.add(ray);
          }
          const jewel = new THREE.Mesh(
            this.trackGeom(new THREE.OctahedronGeometry(0.055, 0)),
            goldGlowMat,
          );
          jewel.position.y = 0.02;
          starGroup.add(jewel);
          this.rakedChassisGroup.add(starGroup);
          this.jubileeStarbursts.push(starGroup);
        }

        // Clickable Glowing Bridge Polarity Capacitor on front apron (clear of frontFlushTrim & marquee bulbs!)
        this.addBoardContactShadow(this.rakedChassisGroup, 0.38, 0.11, 0.0135, 0, 1.08);
        const capSwitch = new THREE.Group();
        capSwitch.position.set(0, 0.022, 1.08);
        capSwitch.add(
          new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.72, 0.036, 0.14, 0.028, 0.007)),
            brassMat,
          ),
        );
        const capBar = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.56, 0.016, 0.052, 0.01, 0.004)),
          peacockGlowMat,
        );
        capBar.position.y = 0.034;
        capSwitch.add(capBar);
        this.registerGimmickHitVolume(capSwitch, 0.84, 0.22, 0.26, [0, 0.05, 0]);
        this.rakedChassisGroup.add(capSwitch);
        break;
      }

      case 'BOARD_03_VAUDEVILLE_GEAR_TRAIN': {
        // 1966 Burbank Pop-Art Prize Deck: Three Non-Overlapping Spinning Living Color Kaleidoscope Prize Wheels + Flapper Clicker!
        const wheelSpecs: readonly { x: number; z: number; r: number; ratio: number; glassY: number }[] = [
          { x: -0.84, z: -0.02, r: 0.39, ratio: 1.0, glassY: 0.05 },
          { x: 0.0, z: -0.02, r: 0.35, ratio: -1.18, glassY: 0.052 },
          { x: 0.84, z: -0.02, r: 0.37, ratio: 1.11, glassY: 0.051 },
        ];
        const popSliceMats = [peacockGlowMat, goldGlowMat, ceriseGlowMat, tangerineGlowMat];
        const pegGeom = this.trackGeom(new THREE.CylinderGeometry(0.013, 0.013, 0.034, 10));
        const wedgeBladeGeom = this.trackGeom(
          createChamferedSlabGeometry(0.27, 0.018, 0.076, 0.012, 0.004),
        );
        for (const ws of wheelSpecs) {
          this.addBoardContactShadow(this.rakedChassisGroup, ws.r * 1.12, ws.r * 1.12, 0.0135, ws.x, ws.z);
          const gGroup = new THREE.Group();
          gGroup.position.set(ws.x, 0.02, ws.z);
          const wheelDisc = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(ws.r * 0.96, ws.r * 0.96, 0.018, 32)),
            darkMetalMat,
          );
          gGroup.add(wheelDisc);
          for (let s = 0; s < 8; s++) {
            const sa = (s / 8) * Math.PI * 2;
            const spoke = new THREE.Mesh(wedgeBladeGeom, popSliceMats[s % 4]);
            spoke.position.set(Math.cos(sa) * (ws.r * 0.45), 0.014, Math.sin(sa) * (ws.r * 0.45));
            spoke.rotation.y = -sa;
            gGroup.add(spoke);
          }
          const rubyHub = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(0.066, 0.074, 0.04, 18)),
            goldGlowMat,
          );
          rubyHub.position.y = 0.02;
          gGroup.add(rubyHub);
          this.rakedChassisGroup.add(gGroup);
          this.vaudevilleGears.push({ group: gGroup, ratio: ws.ratio, baseAngle: 0 });

          // Spinning Prize-Wheel Rim Collar with 12 gleaming nickel pegs encircling each wheel aperture!
          const wheelRimGroup = new THREE.Group();
          wheelRimGroup.position.set(ws.x, 0.042, ws.z);
          const wheelTorus = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(ws.r * 1.04, 0.015, 10, 36)),
            aluminumMat,
          );
          wheelTorus.rotation.x = Math.PI * 0.5;
          wheelRimGroup.add(wheelTorus);
          for (let p = 0; p < 12; p++) {
            const pa = (p / 12) * Math.PI * 2;
            const peg = new THREE.Mesh(pegGeom, p % 2 === 0 ? goldGlowMat : ceriseGlowMat);
            peg.position.set(Math.cos(pa) * (ws.r * 1.04), 0.015, Math.sin(pa) * (ws.r * 1.04));
            wheelRimGroup.add(peg);
          }
          this.rakedChassisGroup.add(wheelRimGroup);
          this.vaudevilleWheelRings.push(wheelRimGroup);

          const glass = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(ws.r * 1.0, ws.r * 1.0, 0.008, 32)),
            crystalGlassMat,
          );
          glass.position.set(ws.x, ws.glassY, ws.z);
          this.rakedChassisGroup.add(glass);
        }

        // Spring-loaded Brass Prize-Wheel Flapper Clicker dead-center at upstage crest (`x = 0, z = -1.08m`)
        const flapperRoot = new THREE.Group();
        flapperRoot.position.set(0.0, 0.06, -1.08);
        const flapperMount = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.06, 0.075, 0.045, 18)),
          brassMat,
        );
        const flapperArm = new THREE.Group();
        const blade = new THREE.Mesh(
          this.trackGeom(new THREE.ConeGeometry(0.036, 0.22, 6)),
          tangerineGlowMat,
        );
        blade.rotation.x = Math.PI * 0.5;
        blade.position.set(0, 0.025, 0.11);
        flapperArm.add(blade);
        flapperRoot.add(flapperMount, flapperArm);
        this.vaudevilleFlapperArm = flapperArm;
        this.rakedChassisGroup.add(flapperRoot);

        this.addBoardContactShadow(this.rakedChassisGroup, 0.34, 0.11, 0.0135, 0, 1.08);
        const ratchetPad = new THREE.Group();
        ratchetPad.position.set(0, 0.024, 1.08);
        ratchetPad.add(
          new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.6, 0.042, 0.14, 0.028, 0.007)),
            brassMat,
          ),
        );
        this.registerGimmickHitVolume(ratchetPad, 0.74, 0.22, 0.26, [0, 0.05, 0]);
        this.rakedChassisGroup.add(ratchetPad);
        break;
      }

      case 'BOARD_04_MAHOGANY_SWITCHBOARD': {
        // Reciprocating brass crossbar selector rods + 4 Fresnel jewel lamps + Twin Patchbay Cord Arcs & Chasing Relay Strips!
        const rodGeom = this.trackGeom(new THREE.CylinderGeometry(0.016, 0.016, 3.2, 14));
        rodGeom.rotateZ(Math.PI * 0.5);
        const sliderGeom = this.trackGeom(
          createChamferedSlabGeometry(0.14, 0.044, 0.08, 0.015, 0.006),
        );
        for (const rz of [-0.34, 0.34]) {
          const rodGroup = new THREE.Group();
          rodGroup.position.set(0, 0.032, rz);
          rodGroup.add(new THREE.Mesh(rodGeom, aluminumMat));
          for (const sx of [-0.86, 0.0, 0.86]) {
            const slider = new THREE.Mesh(sliderGeom, brassMat);
            slider.position.set(sx, -0.01, 0);
            rodGroup.add(slider);
          }
          this.rakedChassisGroup.add(rodGroup);
          this.switchboardRods.push(rodGroup);
        }

        // Twin Sculpted Parabolic Telephone Patchbay Cords + 4-Lamp Relay Strips in Unobstructed Mid-Upper Bays!
        const relayGeom = this.trackGeom(new THREE.CylinderGeometry(0.021, 0.025, 0.022, 14));
        for (const side of [-1, 1]) {
          const bx = side * 1.9;
          const cordCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(bx - side * 0.06, 0.04, -0.66),
            new THREE.Vector3(bx + side * 0.06, 0.21, -0.38),
            new THREE.Vector3(bx - side * 0.04, 0.04, -0.1),
          ]);
          const cord = new THREE.Mesh(
            this.trackGeom(new THREE.TubeGeometry(cordCurve, 18, 0.014, 10, false)),
            side < 0 ? peacockGlowMat : goldGlowMat,
          );
          this.rakedChassisGroup.add(cord);

          for (let k = 0; k < 4; k++) {
            const rMat = this.trackMat(
              new THREE.MeshStandardMaterial({
                color: k % 2 === 0 ? 0x33cad8 : 0xffd56b,
                emissive: k % 2 === 0 ? 0x0098a6 : 0xf4a91f,
                emissiveIntensity: 0.4,
                roughness: 0.18,
              }),
            );
            const rLamp = new THREE.Mesh(relayGeom, rMat);
            rLamp.position.set(bx, 0.046, -0.68 + k * 0.2);
            this.rakedChassisGroup.add(rLamp);
            this.switchboardRelayMats.push(rMat);
          }
        }

        // 4 Supervisory Fresnel Jewel Lamps along upstage crest
        const lampColors = [0x1a5fd0, 0xf4a91f, 0x0098a6, 0xeb5b28];
        const domeGeom = this.trackGeom(
          new THREE.LatheGeometry(
            [
              new THREE.Vector2(0.055, 0),
              new THREE.Vector2(0.052, 0.035),
              new THREE.Vector2(0.025, 0.06),
              new THREE.Vector2(0, 0.066),
            ],
            18,
          ),
        );
        for (let i = 0; i < 4; i++) {
          const lx = -1.29 + i * 0.86;
          const lMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: lampColors[i],
              emissive: lampColors[i],
              emissiveIntensity: 0.85,
              roughness: 0.16,
              metalness: 0.1,
            }),
          );
          const dome = new THREE.Mesh(domeGeom, lMat);
          dome.position.set(lx, 0.035, -1.12);
          const domeHalo = createTungstenBulbHaloSprite({
            scale: 0.22,
            opacity: 0.56,
            colorHex: lampColors[i],
          });
          this.trackMat(domeHalo.material);
          domeHalo.position.set(lx, 0.095, -1.12);
          this.rakedChassisGroup.add(dome, domeHalo);
          this.switchboardLamps.push(lMat);
        }

        this.addBoardContactShadow(this.rakedChassisGroup, 0.34, 0.11, 0.0135, 0, 1.08);
        const stepKey = new THREE.Group();
        stepKey.position.set(0, 0.024, 1.08);
        const skWalnut = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.66, 0.022, 0.16, 0.026, 0.006)),
          walnutPropMat,
        );
        skWalnut.position.y = -0.004;
        const skPlate = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.56, 0.038, 0.12, 0.02, 0.006)),
          brassMat,
        );
        const skJewel = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.4, 0.014, 0.042, 0.008, 0.003)),
          peacockGlowMat,
        );
        skJewel.position.y = 0.028;
        stepKey.add(skWalnut, skPlate, skJewel);
        this.registerGimmickHitVolume(stepKey, 0.7, 0.2, 0.24, [0, 0.05, 0]);
        this.rakedChassisGroup.add(stepKey);
        break;
      }

      case 'BOARD_05_LARSON_SPIN_RING': {
        // 14 chasing 8Hz bulbs + Spinning 1966 Living Color Prize-Wheel Rim Halo + Pass-Spin Brass Paddle!
        const bulbGeom = this.trackGeom(
          new THREE.LatheGeometry(
            [
              new THREE.Vector2(0.038, 0),
              new THREE.Vector2(0.046, 0.04),
              new THREE.Vector2(0.028, 0.075),
              new THREE.Vector2(0, 0.082),
            ],
            16,
          ),
        );
        const socketGeom = this.trackGeom(new THREE.CylinderGeometry(0.048, 0.054, 0.026, 16));
        const larsonHaloTex = typeof document !== 'undefined' ? getTungstenBulbHaloTexture() : null;
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          const bx = Math.cos(a) * 1.72;
          const bz = Math.sin(a) * 1.08;
          const bMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xfff2c2,
              emissive: 0xffd56b,
              emissiveIntensity: 0.3,
              roughness: 0.14,
              metalness: 0.05,
            }),
          );
          const sock = new THREE.Mesh(socketGeom, brassMat);
          sock.position.set(bx, 0.028, bz);
          const bulb = new THREE.Mesh(bulbGeom, bMat);
          bulb.position.set(bx, 0.04, bz);
          const haloMat = this.trackMat(
            new THREE.SpriteMaterial({
              map: larsonHaloTex,
              color: 0xffd56b,
              transparent: true,
              opacity: 0.2,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              toneMapped: false,
            }),
          );
          const halo = new THREE.Sprite(haloMat);
          halo.position.set(bx, 0.095, bz);
          halo.scale.set(0.22, 0.22, 1);
          halo.renderOrder = 4;
          this.rakedChassisGroup.add(sock, bulb, halo);
          this.larsonBulbMats.push(bMat);
          this.larsonHaloSprites.push(halo);
        }

        // Spinning Segmented 1966 Living Color Prize-Wheel Rim Halo centered beneath the hub tiles!
        const prizeRim = new THREE.Group();
        prizeRim.position.set(0, 0.026, 0);
        const rimTorus = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.92, 0.022, 10, 48)),
          brassMat,
        );
        rimTorus.rotation.x = Math.PI * 0.5;
        prizeRim.add(rimTorus);
        const wheelColors = [peacockGlowMat, goldGlowMat, ceriseGlowMat, tangerineGlowMat];
        const notchGeom = this.trackGeom(createChamferedSlabGeometry(0.09, 0.02, 0.045, 0.008, 0.003));
        for (let n = 0; n < 16; n++) {
          const na = (n / 16) * Math.PI * 2;
          const notch = new THREE.Mesh(notchGeom, wheelColors[n % 4]);
          notch.position.set(Math.cos(na) * 0.92, 0.012, Math.sin(na) * 0.92);
          notch.rotation.y = -na;
          prizeRim.add(notch);
        }
        this.larsonPrizeWheelRim = prizeRim;
        this.rakedChassisGroup.add(prizeRim);

        // Clickable Pass-Spin Brass Paddle cleanly seated in Right Instrument Bay (100% clear of outer tiles & rail!)
        this.addBoardContactShadow(this.rakedChassisGroup, 0.22, 0.24, 0.0435, 1.93, 0.34);
        const paddleBase = new THREE.Group();
        paddleBase.position.set(1.93, 0.035, 0.34);
        paddleBase.scale.setScalar(0.7);
        paddleBase.add(
          new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.42, 0.055, 0.46, 0.05, 0.01)),
            darkMetalMat,
          ),
        );
        const paddleCollar = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.19, 0.014, 10, 28)),
          peacockGlowMat,
        );
        paddleCollar.rotation.x = Math.PI * 0.5;
        paddleCollar.position.y = 0.056;
        paddleBase.add(paddleCollar);

        const paddleArm = new THREE.Group();
        paddleArm.position.set(0, 0.06, 0);
        const capMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0xf4a91f,
            emissive: 0x8a4e00,
            emissiveIntensity: 0.55,
            roughness: 0.2,
            metalness: 0.65,
            clearcoat: 0.7,
          }),
        );
        const paddleDisc = new THREE.Mesh(
          this.trackGeom(
            new THREE.LatheGeometry(
              [
                new THREE.Vector2(0.16, 0),
                new THREE.Vector2(0.17, 0.045),
                new THREE.Vector2(0.13, 0.07),
                new THREE.Vector2(0, 0.075),
              ],
              24,
            ),
          ),
          capMat,
        );
        paddleArm.add(paddleDisc);
        paddleBase.add(paddleArm);
        this.spinPaddleArm = paddleArm;

        this.registerGimmickHitVolume(paddleBase, 0.56, 0.34, 0.58, [0, 0.09, 0]);
        this.rakedChassisGroup.add(paddleBase);
        break;
      }

      case 'BOARD_06_BOARDWALK_PINBALL': {
        // Three sprung pop-bumpers + Chrome Wire Rollover Rails + Chasing Pier Chevrons + Spinning Ferris Medallion!
        const bumperCoords: readonly [number, number][] = [
          [-0.86, -0.32],
          [0.86, -0.32],
          [0.0, 0.34],
        ];
        const capGeom = this.trackGeom(
          new THREE.LatheGeometry(
            [
              new THREE.Vector2(0.08, 0.0),
              new THREE.Vector2(0.085, 0.05),
              new THREE.Vector2(0.2, 0.075),
              new THREE.Vector2(0.19, 0.115),
              new THREE.Vector2(0.09, 0.145),
              new THREE.Vector2(0, 0.15),
            ],
            24,
          ),
        );
        for (let i = 0; i < bumperCoords.length; i++) {
          const [bx, bz] = bumperCoords[i];
          this.addBoardContactShadow(this.rakedChassisGroup, 0.27, 0.27, 0.0135, bx, bz);
          const bRoot = new THREE.Group();
          bRoot.position.set(bx, 0.02, bz);
          const ring = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(0.21, 0.016, 10, 28)),
            peacockGlowMat,
          );
          ring.rotation.x = Math.PI * 0.5;
          ring.position.y = 0.02;
          bRoot.add(ring);

          const lampMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xffd56b,
              emissive: 0xeb5b28,
              emissiveIntensity: i === 0 ? 1.2 : 0.4,
              roughness: 0.18,
              metalness: 0.45,
            }),
          );
          const capGroup = new THREE.Group();
          capGroup.add(new THREE.Mesh(capGeom, brassMat));
          const crownJewel = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(0.09, 0.11, 0.03, 20)),
            lampMat,
          );
          crownJewel.position.y = 0.142;
          const bumperHalo = createTungstenBulbHaloSprite({
            scale: 0.32,
            opacity: i === 0 ? 0.62 : 0.22,
            colorHex: 0xffb347,
          });
          this.trackMat(bumperHalo.material);
          bumperHalo.position.y = 0.175;
          capGroup.add(crownJewel, bumperHalo);
          bRoot.add(capGroup);
          this.registerGimmickHitVolume(bRoot, 0.46, 0.28, 0.46, [0, 0.1, 0]);
          this.rakedChassisGroup.add(bRoot);
          this.pinballBumpers.push({ capGroup, lampMat, pulse: 0 });
        }

        // Sleek Chrome Pinball Wire Rollover Guide Rails hugging outer bay edges (zero overlap with tiles/widgets!)
        for (const side of [-1, 1]) {
          const railCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(side * 2.02, 0.045, -0.78),
            new THREE.Vector3(side * 2.04, 0.075, 0.0),
            new THREE.Vector3(side * 2.02, 0.045, 0.92),
          ]);
          const wireRail = new THREE.Mesh(
            this.trackGeom(new THREE.TubeGeometry(railCurve, 20, 0.012, 10, false)),
            aluminumMat,
          );
          this.rakedChassisGroup.add(wireRail);
        }

        // Illuminated Chasing Pinball Rollover Arrow Chevrons on the center lane
        const chevGeom = this.trackGeom(new THREE.ConeGeometry(0.055, 0.11, 3));
        chevGeom.rotateX(-Math.PI * 0.5);
        for (let c = 0; c < 4; c++) {
          const cMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: c % 2 === 0 ? 0x33cad8 : 0xff8a5c,
              emissive: c % 2 === 0 ? 0x0098a6 : 0xeb5b28,
              emissiveIntensity: 0.55,
              roughness: 0.2,
            }),
          );
          const chev = new THREE.Mesh(chevGeom, cMat);
          chev.position.set(0, 0.025, 0.96 - c * 0.18);
          this.rakedChassisGroup.add(chev);
          this.pierChevronMats.push(cMat);
        }

        // Spinning Atlantic City Steel-Pier Ferris Wheel Medallion (`y >= 0.20m`) with Grounded A-Frame Legs!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.16, 0.12, 0.029, -1.94, -0.37);
        const ferrisStand = new THREE.Group();
        ferrisStand.position.set(-1.94, 0.028, -0.37);
        const ferrisBase = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.24, 0.018, 0.14, 0.02, 0.005)),
          walnutPropMat,
        );
        ferrisStand.add(ferrisBase);
        const legGeom = this.trackGeom(new THREE.CylinderGeometry(0.008, 0.011, 0.215, 10));
        for (const lx of [-0.085, 0.085]) {
          for (const lz of [-0.038, 0.038]) {
            const leg = new THREE.Mesh(legGeom, brassMat);
            leg.position.set(lx * 0.5, 0.102, lz * 0.5);
            leg.rotation.z = lx > 0 ? 0.38 : -0.38;
            leg.rotation.x = lz > 0 ? -0.18 : 0.18;
            ferrisStand.add(leg);
          }
        }
        const ferrisAxle = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.014, 0.014, 0.072, 12)),
          brassMat,
        );
        ferrisAxle.rotation.x = Math.PI * 0.5;
        ferrisAxle.position.y = 0.192;
        ferrisStand.add(ferrisAxle);
        this.rakedChassisGroup.add(ferrisStand);

        const ferris = new THREE.Group();
        ferris.position.set(-1.94, 0.22, -0.37);
        ferris.scale.setScalar(0.66);
        const fRim = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.18, 0.012, 10, 28)),
          brassMat,
        );
        ferris.add(fRim);
        const gondolaGeom = this.trackGeom(new THREE.CylinderGeometry(0.024, 0.024, 0.032, 10));
        for (let g = 0; g < 8; g++) {
          const ga = (g / 8) * Math.PI * 2;
          const spoke = new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.18, 0.008, 0.008, 0.002, 0.001)),
            aluminumMat,
          );
          spoke.position.set(Math.cos(ga) * 0.09, Math.sin(ga) * 0.09, 0);
          spoke.rotation.z = ga;
          const cab = new THREE.Mesh(gondolaGeom, g % 2 === 0 ? goldGlowMat : ceriseGlowMat);
          cab.position.set(Math.cos(ga) * 0.18, Math.sin(ga) * 0.18, 0);
          ferris.add(spoke, cab);
        }
        this.pierFerrisGroup = ferris;
        this.rakedChassisGroup.add(ferris);
        break;
      }

      case 'BOARD_07_MONTE_CARLO_SHOE': {
        // Sliding Baccarat Sabotage Shoe + 21-point crescent gauge + Spinning Monte Carlo Brass Roulette Ring & Orbiting Ivory Ball!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.2, 0.34, 0.0435, 1.92, 0.42);
        this.addBoardContactShadow(this.rakedChassisGroup, 0.24, 0.24, 0.0435, -1.89, -0.32);
        const shoeRoot = new THREE.Group();
        shoeRoot.position.set(1.92, 0.032, 0.42);
        const shoeWalnutBase = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.28, 0.045, 0.56, 0.04, 0.008)),
          walnutPropMat,
        );
        const shoeSideL = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.036, 0.13, 0.52, 0.015, 0.005)),
          walnutPropMat,
        );
        shoeSideL.position.set(-0.11, 0.055, 0);
        const shoeSideR = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.036, 0.13, 0.52, 0.015, 0.005)),
          walnutPropMat,
        );
        shoeSideR.position.set(0.11, 0.055, 0);
        const shoeBrassHood = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.26, 0.024, 0.24, 0.02, 0.005)),
          brassMat,
        );
        shoeBrassHood.position.set(0, 0.122, -0.12);
        const cardDeckMat = this.trackMat(
          new THREE.MeshStandardMaterial({ color: 0xfff8eb, roughness: 0.28 }),
        );
        const cardBackCrimsonMat = this.trackMat(
          new THREE.MeshStandardMaterial({ color: 0xc9184a, emissive: 0x5c0820, emissiveIntensity: 0.25, roughness: 0.28 }),
        );
        const cardStack = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.16, 0.075, 0.34, 0.012, 0.004)),
          cardDeckMat,
        );
        cardStack.position.set(0, 0.068, 0.04);
        cardStack.rotation.x = 0.22;
        const topCardBack = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.145, 0.01, 0.22, 0.008, 0.002)),
          cardBackCrimsonMat,
        );
        topCardBack.position.set(0, 0.098, 0.09);
        topCardBack.rotation.x = 0.22;
        shoeRoot.add(shoeWalnutBase, shoeSideL, shoeSideR, shoeBrassHood, cardStack, topCardBack);
        this.baccaratShoeCarriage = shoeRoot;
        this.registerGimmickHitVolume(shoeRoot, 0.46, 0.32, 0.64, [0, 0.1, 0]);
        this.rakedChassisGroup.add(shoeRoot);

        // Bespoke 1969 Monte Carlo Spinning Brass Roulette Wheel in Left Luxury Bay (100% clear of tiles, rail & switch!)
        const rouletteStation = new THREE.Group();
        rouletteStation.position.set(-1.89, 0.038, -0.32);
        rouletteStation.scale.setScalar(0.6);

        // Mahogany / Walnut outer bowl + brass ball-track lip
        const bowl = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.28, 0.3, 0.056, 36)),
          walnutPropMat,
        );
        const bowlLip = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.275, 0.018, 12, 36)),
          brassMat,
        );
        bowlLip.rotation.x = Math.PI * 0.5;
        bowlLip.position.y = 0.032;
        rouletteStation.add(bowl, bowlLip);

        // Spinning 12-pocket alternating Vermilion / Broadcast Navy / Riviera Emerald rotor + brass cross-turret
        const rotor = new THREE.Group();
        rotor.position.y = 0.034;
        const pocketGeom = this.trackGeom(createChamferedSlabGeometry(0.068, 0.016, 0.054, 0.006, 0.002));
        const redPocketMat = this.trackMat(
          new THREE.MeshStandardMaterial({ color: 0xe03e36, emissive: 0x6b100c, emissiveIntensity: 0.35, roughness: 0.25 }),
        );
        const emeraldZeroMat = this.trackMat(
          new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x0b5e2a, emissiveIntensity: 0.55, roughness: 0.22 }),
        );
        for (let p = 0; p < 12; p++) {
          const pa = (p / 12) * Math.PI * 2;
          const pMat = p === 0 ? emeraldZeroMat : p % 2 === 1 ? redPocketMat : darkMetalMat;
          const pocket = new THREE.Mesh(pocketGeom, pMat);
          pocket.position.set(Math.cos(pa) * 0.185, 0.008, Math.sin(pa) * 0.185);
          pocket.rotation.y = -pa;
          rotor.add(pocket);
        }
        const turretCone = new THREE.Mesh(
          this.trackGeom(new THREE.ConeGeometry(0.085, 0.095, 20)),
          brassMat,
        );
        turretCone.position.y = 0.048;
        const turretBarA = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.17, 0.016, 0.018, 0.004, 0.002)),
          brassMat,
        );
        turretBarA.position.y = 0.082;
        const turretBarB = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.018, 0.016, 0.17, 0.004, 0.002)),
          brassMat,
        );
        turretBarB.position.y = 0.082;
        rotor.add(turretCone, turretBarA, turretBarB);
        rouletteStation.add(rotor);
        this.rouletteWheelGroup = rotor;

        // Counter-orbiting gleaming Ivory Roulette Ball
        const ballOrbit = new THREE.Group();
        ballOrbit.position.y = 0.046;
        const ivoryMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0xfffaf0,
            emissive: 0xffe9b5,
            emissiveIntensity: 0.45,
            roughness: 0.1,
            clearcoat: 1.0,
          }),
        );
        const ball = new THREE.Mesh(this.trackGeom(new THREE.SphereGeometry(0.022, 16, 16)), ivoryMat);
        ball.position.set(0.242, 0.012, 0);
        ballOrbit.add(ball);
        rouletteStation.add(ballOrbit);
        this.rouletteBallOrbitGroup = ballOrbit;

        this.rakedChassisGroup.add(rouletteStation);

        // 21-Point Horological Crescent Gauge at upstage center (`z = -1.17m`, arching +Z inside cabinet — zero backRail/tile clip!)
        const gaugeDial = new THREE.Group();
        gaugeDial.position.set(0, 0.038, -1.17);
        const arcRing = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.16, 0.016, 10, 28, Math.PI)),
          brassMat,
        );
        arcRing.rotation.x = Math.PI * 0.5;
        gaugeDial.add(arcRing);

        const needlePivot = new THREE.Group();
        const needle = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.022, 0.016, 0.13, 0.005, 0.003)),
          tangerineGlowMat,
        );
        needle.position.z = 0.065;
        needlePivot.add(needle);
        needlePivot.position.y = 0.022;
        gaugeDial.add(needlePivot);
        this.baccaratNeedleGroup = needlePivot;
        this.rakedChassisGroup.add(gaugeDial);
        break;
      }

      case 'BOARD_08_GEODESIC_SUNDIAL': {
        // Rotating brass meridian gnomon arm + 1965 World's Fair Orbiting Atomic Rings (Unisphere Centerpiece)!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.42, 0.42, 0.0135, 0, 0);
        const hubGroup = new THREE.Group();
        hubGroup.position.set(0, 0.028, 0.0);
        const eqRing = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(1.08, 0.018, 10, 48)),
          aluminumMat,
        );
        eqRing.rotation.x = Math.PI * 0.5;
        hubGroup.add(eqRing);

        // 1965 World's Fair Central Orbiting Unisphere & 3 Atomic Electron Rings (compact 0.22m radius, zero tile overlap!)
        const unisphereHub = new THREE.Group();
        unisphereHub.position.set(0, 0.14, 0.0);
        const coreGlobe = new THREE.Mesh(
          this.trackGeom(new THREE.IcosahedronGeometry(0.088, 1)),
          peacockGlowMat,
        );
        unisphereHub.add(coreGlobe);

        const orbitConfigs: readonly { r: number; tiltX: number; tiltZ: number; mat: THREE.Material; orbMat: THREE.Material }[] = [
          { r: 0.17, tiltX: 0.58, tiltZ: 0.22, mat: aluminumMat, orbMat: goldGlowMat },
          { r: 0.205, tiltX: -0.62, tiltZ: 0.85, mat: brassMat, orbMat: tangerineGlowMat },
          { r: 0.235, tiltX: 1.05, tiltZ: -0.52, mat: peacockGlowMat, orbMat: ceriseGlowMat },
        ];
        const orbGeom = this.trackGeom(new THREE.SphereGeometry(0.022, 14, 14));
        for (const oc of orbitConfigs) {
          const orbitGroup = new THREE.Group();
          orbitGroup.rotation.set(oc.tiltX, 0, oc.tiltZ);
          const ringMesh = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(oc.r, 0.008, 10, 36)),
            oc.mat,
          );
          const electronOrb = new THREE.Mesh(orbGeom, oc.orbMat);
          electronOrb.position.set(oc.r, 0, 0);
          orbitGroup.add(ringMesh, electronOrb);
          unisphereHub.add(orbitGroup);
          this.atomicOrbitRings.push(orbitGroup);
        }
        hubGroup.add(unisphereHub);

        // Precision Inner Brass Meridian Compass Bezel (`r = 0.345m` — strictly clear of all 13 tiles at every angle!)
        const innerCompassRing = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.345, 0.011, 10, 44)),
          brassMat,
        );
        innerCompassRing.rotation.x = Math.PI * 0.5;
        innerCompassRing.position.y = 0.014;
        hubGroup.add(innerCompassRing);

        const armGroup = new THREE.Group();
        // Compact Precision Brass Sundial Pointer Arm (`r = 0.08..0.335m`) — NEVER tucks under or pokes past any tile border!
        const gnomonSpine = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.22, 0.018, 0.034, 0.008, 0.004)),
          brassMat,
        );
        gnomonSpine.position.set(0.185, 0.018, 0);
        const pointerTip = new THREE.Mesh(
          this.trackGeom(new THREE.ConeGeometry(0.028, 0.072, 4)),
          goldGlowMat,
        );
        pointerTip.rotation.z = -Math.PI * 0.5;
        pointerTip.position.set(0.305, 0.026, 0);
        armGroup.add(gnomonSpine, pointerTip);

        // Translucent golden solar sector wedge framed cleanly inside the inner meridian dial (`r = 0.338m`)
        const wedgeShape = new THREE.Shape();
        wedgeShape.moveTo(0, 0);
        wedgeShape.absarc(0, 0, 0.338, -0.52, 0.52, false);
        wedgeShape.closePath();
        const wedgeGeom = this.trackGeom(new THREE.ShapeGeometry(wedgeShape, 24));
        wedgeGeom.rotateX(-Math.PI * 0.5);
        const solarMat = this.trackMat(
          new THREE.MeshBasicMaterial({
            color: 0xffd166,
            transparent: true,
            opacity: 0.26,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        );
        const solarWedge = new THREE.Mesh(wedgeGeom, solarMat);
        solarWedge.position.y = 0.009;
        armGroup.add(solarWedge);

        hubGroup.add(armGroup);
        this.sundialArmGroup = armGroup;

        this.addBoardContactShadow(this.rakedChassisGroup, 0.13, 0.13, 0.0135, 0, 1.105);
        const dialKnob = new THREE.Group();
        dialKnob.position.set(0, 0.024, 1.105);
        const knobWalnutRing = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.098, 0.105, 0.026, 26)),
          walnutPropMat,
        );
        const knobBrassCap = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.075, 0.084, 0.048, 26)),
          brassMat,
        );
        knobBrassCap.position.y = 0.016;
        const compassCrossA = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.125, 0.012, 0.016, 0.004, 0.002)),
          aluminumMat,
        );
        compassCrossA.position.y = 0.043;
        const compassCrossB = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.016, 0.012, 0.125, 0.004, 0.002)),
          aluminumMat,
        );
        compassCrossB.position.y = 0.043;
        const compassJewel = new THREE.Mesh(
          this.trackGeom(new THREE.OctahedronGeometry(0.028, 0)),
          peacockGlowMat,
        );
        compassJewel.position.y = 0.056;
        dialKnob.add(knobWalnutRing, knobBrassCap, compassCrossA, compassCrossB, compassJewel);
        this.registerGimmickHitVolume(dialKnob, 0.36, 0.22, 0.26, [0, 0.06, 0]);
        this.rakedChassisGroup.add(hubGroup, dialKnob);
        break;
      }

      case 'BOARD_09_PIRATE_UHF_DECK': {
        // Knurled UHF Carrier Knob + Twin VU Meters + Spinning Offshore Broadcast Radar Dish + Glowing Vacuum-Tube Towers!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.23, 0.23, 0.0435, 1.9, 0.42);
        this.addBoardContactShadow(this.rakedChassisGroup, 0.22, 0.22, 0.0435, -1.9, -0.36);
        const knobStation = new THREE.Group();
        knobStation.position.set(1.9, 0.036, 0.42);
        knobStation.scale.setScalar(0.7);
        const escutcheon = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.22, 0.24, 0.026, 28)),
          brassMat,
        );
        knobStation.add(escutcheon);

        const knobGroup = new THREE.Group();
        knobGroup.position.y = 0.024;
        const knurledBody = new THREE.Mesh(
          this.trackGeom(
            new THREE.LatheGeometry(
              [
                new THREE.Vector2(0.16, 0),
                new THREE.Vector2(0.165, 0.07),
                new THREE.Vector2(0.13, 0.095),
                new THREE.Vector2(0, 0.1),
              ],
              24,
            ),
          ),
          darkMetalMat,
        );
        const pointerBar = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.032, 0.024, 0.15, 0.006, 0.003)),
          goldGlowMat,
        );
        pointerBar.position.set(0, 0.095, -0.04);
        knobGroup.add(knurledBody, pointerBar);
        knobStation.add(knobGroup);
        this.uhfKnobGroup = knobGroup;

        this.registerGimmickHitVolume(knobStation, 0.58, 0.34, 0.58, [0, 0.09, 0]);
        this.rakedChassisGroup.add(knobStation);

        // Spinning Channel 83 Offshore Broadcast Radar Dish cleanly centered in Left Deck Bay!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.18, 0.18, 0.0435, -1.9, -0.36);
        const radarBase = new THREE.Group();
        radarBase.position.set(-1.9, 0.042, -0.36);
        radarBase.scale.setScalar(0.84);
        const mast = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.036, 0.058, 0.16, 16)),
          aluminumMat,
        );
        mast.position.y = 0.08;
        radarBase.add(mast);

        const dishGroup = new THREE.Group();
        dishGroup.position.y = 0.18;
        const dishProfile = [
          new THREE.Vector2(0.0, 0.0),
          new THREE.Vector2(0.06, 0.015),
          new THREE.Vector2(0.14, 0.045),
          new THREE.Vector2(0.18, 0.085),
        ];
        const dishMesh = new THREE.Mesh(
          this.trackGeom(new THREE.LatheGeometry(dishProfile, 22)),
          aluminumMat,
        );
        dishMesh.rotation.x = Math.PI * 0.42;
        const feedHorn = new THREE.Mesh(
          this.trackGeom(new THREE.SphereGeometry(0.028, 12, 12)),
          peacockGlowMat,
        );
        feedHorn.position.set(0, 0.03, 0.11);
        dishGroup.add(dishMesh, feedHorn);
        radarBase.add(dishGroup);
        this.uhfRadarDishGroup = dishGroup;
        this.rakedChassisGroup.add(radarBase);

        // Glowing 1966 Vacuum-Tube Filament Towers symmetrically flanking Upstage VU Crest (zero CornerTotem collision!)
        const glassTubeGeom = this.trackGeom(new THREE.CylinderGeometry(0.044, 0.044, 0.17, 18));
        const coreFilGeom = this.trackGeom(new THREE.CylinderGeometry(0.016, 0.02, 0.115, 12));
        for (const tx of [-1.06, 1.06]) {
          const tubeRoot = new THREE.Group();
          tubeRoot.position.set(tx, 0.038, -1.09);
          const fMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xffa940,
              emissive: 0xff6738,
              emissiveIntensity: 1.15,
              roughness: 0.2,
            }),
          );
          const core = new THREE.Mesh(coreFilGeom, fMat);
          core.position.y = 0.072;
          const envelope = new THREE.Mesh(glassTubeGeom, crystalGlassMat);
          envelope.position.y = 0.09;
          const tubeHalo = createTungstenBulbHaloSprite({
            scale: 0.28,
            opacity: 0.68,
            colorHex: 0xff8d4c,
          });
          this.trackMat(tubeHalo.material);
          tubeHalo.position.y = 0.095;
          this.addBoardContactShadow(this.rakedChassisGroup, 0.09, 0.09, 0.039, tx, -1.09);
          tubeRoot.add(core, envelope, tubeHalo);
          this.uhfTubeFilamentMats.push(fMat);
          this.rakedChassisGroup.add(tubeRoot);
        }

        // Twin Illuminated VU Signal Meters cleanly framed at upstage crest (zero back-rail clip!)
        const meterGlowMat = this.trackMat(
          new THREE.MeshStandardMaterial({
            color: 0xfff4d4,
            emissive: 0x33cad8,
            emissiveIntensity: 0.5,
            roughness: 0.25,
          }),
        );
        for (const mx of [-0.52, 0.52]) {
          const meter = new THREE.Group();
          meter.position.set(mx, 0.034, -1.09);
          meter.add(
            new THREE.Mesh(
              this.trackGeom(createChamferedSlabGeometry(0.46, 0.035, 0.16, 0.03, 0.006)),
              meterGlowMat,
            ),
          );
          const needleG = new THREE.Group();
          needleG.position.set(0, 0.04, 0.055);
          const nMesh = new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.016, 0.012, 0.115, 0.004, 0.002)),
            tangerineGlowMat,
          );
          nMesh.position.z = -0.05;
          needleG.add(nMesh);
          meter.add(needleG);
          this.uhfNeedles.push(needleG);
          this.rakedChassisGroup.add(meter);
        }
        break;
      }

      case 'BOARD_10_SOVEREIGN_ZIGGURAT': {
        // 3-stepped Sovereign Broadcast Navy & Louvered Walnut terraces + Glowing Step-Light Strips + Flanking Starburst Crowns + Spinning Astrolabe!
        const terraceTrimMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0xd9a441,
            map: louverTex,
            roughness: 0.28,
            metalness: 0.36,
            clearcoat: 0.62,
          }),
        );
        terraceTrimMat.envMapIntensity = 0.68;

        const midTerrace = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(3.48, 0.1, 0.68, 0.05, 0.012)),
          darkMetalMat,
        );
        midTerrace.position.set(0, 0.01, -0.02);
        const midTrim = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(3.52, 0.025, 0.72, 0.05, 0.006)),
          terraceTrimMat,
        );
        midTrim.position.set(0, 0.095, -0.02);

        const apexTerrace = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(2.54, 0.2, 0.68, 0.05, 0.012)),
          darkMetalMat,
        );
        apexTerrace.position.set(0, 0.01, -0.72);
        const apexTrim = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(2.58, 0.026, 0.72, 0.05, 0.006)),
          terraceTrimMat,
        );
        apexTrim.position.set(0, 0.195, -0.72);

        // Glowing illuminated horizontal step-light strips along the downstage terrace risers!
        const stepConfigs: readonly { w: number; y: number; z: number; hex: number }[] = [
          { w: 3.42, y: 0.104, z: 0.345, hex: 0x0098a6 },
          { w: 2.48, y: 0.204, z: -0.355, hex: 0xf4a91f },
        ];
        for (const sc of stepConfigs) {
          const sMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: sc.hex,
              emissive: sc.hex,
              emissiveIntensity: 0.9,
              roughness: 0.16,
            }),
          );
          const strip = new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(sc.w, 0.014, 0.016, 0.004, 0.002)),
            sMat,
          );
          strip.position.set(0, sc.y, sc.z);
          this.zigguratStepGlowMats.push(sMat);
          this.rakedChassisGroup.add(strip);
        }

        this.rakedChassisGroup.add(midTerrace, midTrim, apexTerrace, apexTrim);

        // Flanking Prime-Time Executive Crown Obelisks (`x = ±1.56, z = -0.74`) — cleanly centered between top terrace & CornerTotem!
        const crownRayGeom = this.trackGeom(new THREE.ConeGeometry(0.02, 0.135, 6));
        for (const ox of [-1.56, 1.56]) {
          this.addBoardContactShadow(this.rakedChassisGroup, 0.15, 0.15, 0.0135, ox, -0.74);
          const obelisk = new THREE.Group();
          obelisk.position.set(ox, 0.02, -0.74);
          const shaft = new THREE.Mesh(
            this.trackGeom(new THREE.CylinderGeometry(0.052, 0.09, 0.24, 8)),
            brassMat,
          );
          shaft.position.y = 0.12;
          obelisk.add(shaft);

          const crownSpin = new THREE.Group();
          crownSpin.position.y = 0.285;
          for (let r = 0; r < 6; r++) {
            const a = (r / 6) * Math.PI * 2;
            const ray = new THREE.Mesh(crownRayGeom, r % 2 === 0 ? goldGlowMat : peacockGlowMat);
            ray.position.set(Math.cos(a) * 0.062, 0, Math.sin(a) * 0.062);
            ray.rotation.z = -Math.PI * 0.5;
            ray.rotation.y = -a;
            crownSpin.add(ray);
          }
          obelisk.add(crownSpin);
          this.zigguratCrownSpinners.push(crownSpin);
          this.rakedChassisGroup.add(obelisk);
        }

        // Grounded 3-axis brass armillary astrolabe centerpiece in the open right luxury bay (`x = 1.92, z = 0.24`) — 100% clear of all 13 Ziggurat tiles!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.18, 0.18, 0.0135, 1.92, 0.24);
        const astroRoot = new THREE.Group();
        astroRoot.position.set(1.92, 0.145, 0.24);
        astroRoot.scale.setScalar(0.82);
        const astroBase = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.056, 0.095, 0.09, 16)),
          brassMat,
        );
        astroBase.position.y = -0.115;
        const astroStem = new THREE.Mesh(
          this.trackGeom(new THREE.CylinderGeometry(0.022, 0.026, 0.12, 12)),
          brassMat,
        );
        astroStem.position.y = -0.05;
        astroRoot.add(astroBase, astroStem);
        for (let r = 0; r < 3; r++) {
          const ring = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(0.135 - r * 0.026, 0.011, 10, 26)),
            r === 1 ? peacockGlowMat : brassMat,
          );
          astroRoot.add(ring);
          this.zigguratAstrolabeRings.push(ring);
        }
        this.registerGimmickHitVolume(astroRoot, 0.42, 0.36, 0.42);
        this.rakedChassisGroup.add(astroRoot);
        break;
      }

      case 'BOARD_11_WHEW_GAUNTLET': {
        // Gold Gauntlet Crown Bar + Animated 6-Lamp Scanning Spotlight Bar + Rival Solenoid Blockade Pins!
        this.addBoardContactShadow(this.rakedChassisGroup, 1.82, 0.14, 0.0135, 0, -1.12);
        this.addBoardContactShadow(this.rakedChassisGroup, 0.34, 0.11, 0.0135, 0, 1.08);
        const goldCrownMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0xf6c244,
            emissive: 0x6b4400,
            emissiveIntensity: 0.45,
            roughness: 0.18,
            metalness: 0.94,
            clearcoat: 0.65,
          }),
        );
        const gauntletBar = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(3.48, 0.056, 0.12, 0.03, 0.01)),
          goldCrownMat,
        );
        gauntletBar.position.set(0, 0.03, -1.12);
        this.rakedChassisGroup.add(gauntletBar);

        // 6-Lamp Animated Scanning Spotlight Strip recessed along the Gold Gauntlet Crown!
        const scanGeom = this.trackGeom(createChamferedSlabGeometry(0.42, 0.018, 0.048, 0.008, 0.003));
        for (let s = 0; s < 6; s++) {
          const sMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xffd56b,
              emissive: 0xff6738,
              emissiveIntensity: 0.35,
              roughness: 0.16,
            }),
          );
          const lamp = new THREE.Mesh(scanGeom, sMat);
          lamp.position.set(-1.35 + s * 0.54, 0.086, -1.12);
          this.rakedChassisGroup.add(lamp);
          this.gauntletScannerMats.push(sMat);
        }

        const pinGeom = this.trackGeom(new THREE.CylinderGeometry(0.032, 0.038, 0.11, 16));
        for (let c = 0; c < 4; c++) {
          const px = -1.08 + c * 0.72;
          const pMat = this.trackMat(
            new THREE.MeshStandardMaterial({
              color: 0xff6738,
              emissive: 0xeb5b28,
              emissiveIntensity: 0.65,
              roughness: 0.22,
              metalness: 0.45,
            }),
          );
          const pGroup = new THREE.Group();
          pGroup.position.set(px, 0.04, -0.35);
          pGroup.add(new THREE.Mesh(pinGeom, pMat));
          this.rakedChassisGroup.add(pGroup);
          this.gauntletBlockadePins.push({ index: c, group: pGroup, mat: pMat });
        }

        const reconPad = new THREE.Group();
        reconPad.position.set(0, 0.024, 1.08);
        reconPad.add(
          new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.56, 0.04, 0.14, 0.02, 0.007)),
            goldCrownMat,
          ),
        );
        this.registerGimmickHitVolume(reconPad, 0.7, 0.22, 0.26, [0, 0.05, 0]);
        this.rakedChassisGroup.add(reconPad);
        break;
      }

      case 'BOARD_12_PENDULUM_BALANCE': {
        // Central fulcrum knife-edges + Tilting Balance Beam + Glowing Equilibrium Degree Arc + Twin Counter-Swinging Escapement Rings!
        this.addBoardContactShadow(this.rakedChassisGroup, 0.28, 1.04, 0.0135, 0, 0);
        const fulcrumShape = new THREE.Shape();
        fulcrumShape.moveTo(-0.18, 0);
        fulcrumShape.lineTo(0.18, 0);
        fulcrumShape.lineTo(0, 0.11);
        fulcrumShape.closePath();
        const fulcrumGeom = this.trackGeom(
          new THREE.ExtrudeGeometry(fulcrumShape, {
            depth: 1.92,
            bevelEnabled: true,
            bevelThickness: 0.008,
            bevelSize: 0.008,
            bevelSegments: 2,
          }),
        );
        fulcrumGeom.translate(0, 0, -0.96);
        const fulcrum = new THREE.Mesh(fulcrumGeom, darkMetalMat);
        fulcrum.position.set(0, 0.01, 0);
        this.rakedChassisGroup.add(fulcrum);

        // Glowing Upstage Equilibrium Calibration Arc (shines Peacock Emerald when balanced near 0°!)
        const eqArcMat = this.trackMat(
          new THREE.MeshStandardMaterial({
            color: 0x33cad8,
            emissive: 0x0098a6,
            emissiveIntensity: 0.85,
            roughness: 0.18,
          }),
        );
        const eqArc = new THREE.Mesh(
          this.trackGeom(new THREE.TorusGeometry(0.32, 0.018, 10, 32, Math.PI)),
          eqArcMat,
        );
        eqArc.position.set(0, 0.12, -1.12);
        this.pendulumEquilibriumMat = eqArcMat;
        this.rakedChassisGroup.add(eqArc);

        // Sleek 1966 Broadcast Peacock-Navy balance beam deck mounted inside `balanceBeamGroup`!
        const beamDeckMat = this.trackMat(
          new THREE.MeshPhysicalMaterial({
            color: 0x007b85,
            roughness: 0.36,
            metalness: 0.34,
            clearcoat: 0.55,
          }),
        );
        beamDeckMat.envMapIntensity = 0.5;
        const beamTruss = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(3.38, 0.032, 1.88, 0.06, 0.008)),
          beamDeckMat,
        );
        beamTruss.position.set(0, 0.105, 0);
        this.balanceBeamGroup.add(beamTruss);

        // Sculpted 3-Piece Brass Deal-Scale Centerpiece along the open central fulcrum channel (`x = 0`, 100% clear of all 12 tiles!)
        const balanceSpec: readonly { z: number; r: number }[] = [
          { z: 0.0, r: 0.185 },
          { z: -0.56, r: 0.105 },
          { z: 0.56, r: 0.105 },
        ];
        for (const bs of balanceSpec) {
          const ringGroup = new THREE.Group();
          ringGroup.position.set(0, 0.145, bs.z);
          const outer = new THREE.Mesh(
            this.trackGeom(new THREE.TorusGeometry(bs.r, 0.014, 10, 32)),
            brassMat,
          );
          outer.rotation.x = Math.PI * 0.5;
          const crossA = new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(bs.r * 1.85, 0.012, 0.016, 0.003, 0.002)),
            aluminumMat,
          );
          const crossB = new THREE.Mesh(
            this.trackGeom(createChamferedSlabGeometry(0.016, 0.012, bs.r * 1.85, 0.003, 0.002)),
            aluminumMat,
          );
          const jewel = new THREE.Mesh(
            this.trackGeom(new THREE.OctahedronGeometry(bs.r > 0.14 ? 0.044 : 0.03, 0)),
            bs.r > 0.14 ? goldGlowMat : peacockGlowMat,
          );
          ringGroup.add(outer, crossA, crossB, jewel);
          this.balanceBeamGroup.add(ringGroup);
          this.pendulumSideRings.push(ringGroup);
        }

        // Pointer needle & bob at upstage fulcrum dial
        const bobGroup = new THREE.Group();
        bobGroup.position.set(0, 0.12, -1.08);
        const spire = new THREE.Mesh(
          this.trackGeom(createChamferedSlabGeometry(0.036, 0.28, 0.028, 0.006, 0.004)),
          goldGlowMat,
        );
        bobGroup.add(spire);
        this.balanceBeamGroup.add(bobGroup);
        this.pendulumBobGroup = bobGroup;

        this.registerGimmickHitVolume(fulcrum, 0.52, 0.26, 0.52, [0, 0.12, 1.02]);
        break;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4 Canonical Socket Widgets (`CornerTotem`, `FlankSwitch`, `OverheadCrosshair`, `RimRing`)
  // --------------------------------------------------------------------------

  private buildCanonicalSocketWidgets(spec: BoardSpecV7): void {
    const palette = this.resolveSeasonalMaterialPalette(spec);
    const brushedTex = typeof document !== 'undefined' ? getBrushedAnodizedTexture() : null;
    const walnutTex = typeof document !== 'undefined' ? getAmericanWalnutVeneerTexture() : null;
    const louverTex = typeof document !== 'undefined' ? getNeutralLouverToteBedTexture() : null;

    const brassMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.brassHex,
        map: brushedTex,
        roughness: 0.2,
        metalness: 0.92,
        clearcoat: 0.55,
      }),
    );
    const walnutSocketMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: this.activeSeason === 1 ? 0xbf7a4c : palette.woodHex,
        map: this.activeSeason === 2 ? null : this.activeSeason === 4 ? brushedTex : walnutTex,
        roughness: this.activeSeason === 2 ? 0.18 : 0.3,
        metalness: this.activeSeason === 4 ? 0.68 : 0.08,
        clearcoat: 0.65,
      }),
    );
    const bakeliteMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.consoleBakeliteHex,
        map: louverTex,
        roughness: 0.28,
        metalness: 0.28,
        clearcoat: 0.6,
      }),
    );
    const copperMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe68846,
        map: brushedTex,
        roughness: 0.22,
        metalness: 0.92,
      }),
    );

    const portraitCrownZ = -(this.getActivePortraitDepth(this.tiles.length || spec.slots.length) * 0.5 + 0.09);

    // 1. `CornerTotem`: Grounded 1966 Walnut & Brass Studio Tally Beacon Lamp (zero floating hoop, 100% clear of all tile bezels!)
    const totemRoot = new THREE.Group();
    totemRoot.name = 'Socket_CornerTotem_Wheelhouse';
    if (this.isPortraitMode) {
      totemRoot.position.set(0.84, 0.048, portraitCrownZ - 0.03);
      totemRoot.scale.setScalar(0.42);
    } else {
      totemRoot.position.set(1.94, 0.036, -0.82);
      totemRoot.scale.setScalar(0.56);
      this.addBoardContactShadow(this.rakedChassisGroup, 0.16, 0.16, 0.0435, 1.94, -0.82);
    }

    const totemWalnutPlinth = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(0.32, 0.038, 0.32, 0.04, 0.008)),
      walnutSocketMat,
    );
    const totemBrassCollar = new THREE.Mesh(
      this.trackGeom(new THREE.CylinderGeometry(0.105, 0.128, 0.056, 20)),
      brassMat,
    );
    totemBrassCollar.position.y = 0.04;
    totemRoot.add(totemWalnutPlinth, totemBrassCollar);

    const spinCrown = new THREE.Group();
    spinCrown.position.y = 0.095;
    const jewelMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffc857,
        emissive: 0xd97706,
        emissiveIntensity: 0.78,
        roughness: 0.16,
        metalness: 0.2,
      }),
    );
    const tallyDome = new THREE.Mesh(
      this.trackGeom(new THREE.CylinderGeometry(0.072, 0.088, 0.095, 6)),
      jewelMat,
    );
    const finialCap = new THREE.Mesh(
      this.trackGeom(new THREE.CylinderGeometry(0.036, 0.076, 0.026, 6)),
      brassMat,
    );
    finialCap.position.y = 0.058;
    spinCrown.add(tallyDome, finialCap);
    totemRoot.add(spinCrown);
    this.cornerTotemSpinGroup = spinCrown;
    this.cornerTotemJewelMat = jewelMat;
    this.rakedChassisGroup.add(totemRoot);

    // 2. `FlankSwitch`: Clickable 3D Toby's Mercy Switch Lever (Strictly inside left instrument bay — zero tile/rail clip!)
    const mercyRoot = new THREE.Group();
    mercyRoot.name = 'Socket_FlankSwitch_TobyMercy';
    if (this.isPortraitMode) {
      mercyRoot.position.set(-0.76, 0.055, portraitCrownZ);
      mercyRoot.scale.setScalar(0.54);
    } else {
      mercyRoot.position.set(-1.93, 0.036, 0.34);
      mercyRoot.scale.setScalar(0.68);
      this.addBoardContactShadow(this.rakedChassisGroup, 0.21, 0.28, 0.0435, -1.93, 0.34);
    }

    const switchWoodPlinth = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(0.48, 0.036, 0.68, 0.05, 0.01)),
      walnutSocketMat,
    );
    switchWoodPlinth.position.y = -0.012;
    const switchBrassBezel = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(0.45, 0.044, 0.65, 0.045, 0.01)),
      brassMat,
    );
    switchBrassBezel.position.y = -0.005;
    const switchSlab = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(0.4, 0.054, 0.6, 0.036, 0.01)),
      bakeliteMat,
    );
    mercyRoot.add(switchWoodPlinth, switchBrassBezel, switchSlab);

    // Twin copper knife-contact jaws
    const jawGeom = this.trackGeom(createChamferedSlabGeometry(0.035, 0.095, 0.075, 0.008, 0.004));
    for (const jx of [-0.065, 0.065]) {
      const jaw = new THREE.Mesh(jawGeom, copperMat);
      jaw.position.set(jx, 0.048, -0.16);
      mercyRoot.add(jaw);
    }

    // Supervisory status jewel lamp on switch housing
    const mercyLampMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xe69f00,
        emissive: 0xd55e00,
        emissiveIntensity: 0.85,
        roughness: 0.18,
        metalness: 0.12,
      }),
    );
    const mercyLamp = new THREE.Mesh(
      this.trackGeom(new THREE.CylinderGeometry(0.042, 0.048, 0.032, 18)),
      mercyLampMat,
    );
    mercyLamp.position.set(0, 0.054, -0.25);
    mercyRoot.add(mercyLamp);
    this.mercyLampMat = mercyLampMat;

    // Pivoted brass knife blade + turned crimson/Bakelite grip handle
    const leverArm = new THREE.Group();
    leverArm.position.set(0, 0.068, 0.14);
    leverArm.rotation.x = this.mercyLeverCurrentAngle;

    const blade = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(0.046, 0.26, 0.028, 0.006, 0.004)),
      copperMat,
    );
    blade.position.y = 0.04;
    const handleMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x9e2a1c, roughness: 0.3, metalness: 0.15 }),
    );
    const grip = new THREE.Mesh(
      this.trackGeom(
        new THREE.LatheGeometry(
          [
            new THREE.Vector2(0.034, 0),
            new THREE.Vector2(0.052, 0.04),
            new THREE.Vector2(0.048, 0.13),
            new THREE.Vector2(0.022, 0.16),
            new THREE.Vector2(0, 0.165),
          ],
          18,
        ),
      ),
      handleMat,
    );
    grip.position.y = 0.25;
    leverArm.add(blade, grip);
    mercyRoot.add(leverArm);
    this.mercyLeverArmGroup = leverArm;

    // Generous touch hit-volume for Toby's Mercy Switch!
    const mercyHitMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
      }),
    );
    const mercyHit = new THREE.Mesh(
      this.trackGeom(new THREE.BoxGeometry(0.58, 0.52, 0.72)),
      mercyHitMat,
    );
    mercyHit.position.set(0, 0.22, 0);
    mercyHit.userData = { pickType: 'MERCY_SWITCH' };
    mercyRoot.add(mercyHit);
    this.pickMeshes.push(mercyHit);
    this.rakedChassisGroup.add(mercyRoot);

    // 3. `OverheadCrosshair`: Outer-Casing Perimeter Rival Intent Frame (sits OUTSIDE & BELOW plaque face — NEVER clips `+1.0x` or digits!)
    const crosshair = new THREE.Group();
    crosshair.name = 'Socket_OverheadCrosshair_RivalIntent';
    crosshair.visible = false;
    const crimsonMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xff5a4e,
        emissive: 0xd92d20,
        emissiveIntensity: 1.05,
        roughness: 0.18,
        metalness: 0.35,
      }),
    );
    // Unit-normalized (`1.0 x 1.0` full span -> `±0.5` half-extents) so `scale.set(outerW, 1, outerD)` hugs each tile's outer bevel!
    const halfX = 0.5;
    const halfZ = 0.5;
    const armLenX = 0.16;
    const armLenZ = 0.18;
    const barThick = 0.022;
    const armXGeom = this.trackGeom(createChamferedSlabGeometry(armLenX, 0.014, barThick, 0.004, 0.003));
    const armZGeom = this.trackGeom(createChamferedSlabGeometry(barThick, 0.014, armLenZ, 0.004, 0.003));
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const hArm = new THREE.Mesh(armXGeom, crimsonMat);
      hArm.position.set(sx * (halfX - armLenX * 0.5), 0.0, sz * halfZ);
      const vArm = new THREE.Mesh(armZGeom, crimsonMat);
      vArm.position.set(sx * halfX, 0.0, sz * (halfZ - armLenZ * 0.5));
      crosshair.add(hArm, vArm);
    }
    // Subtle upstage broadcast tally diamond perched cleanly outside top edge
    const tallyGem = new THREE.Mesh(
      this.trackGeom(new THREE.OctahedronGeometry(0.028, 0)),
      crimsonMat,
    );
    tallyGem.position.set(0, 0.014, -(halfZ + 0.022));
    crosshair.add(tallyGem);

    this.balanceBeamGroup.add(crosshair);
    this.overheadCrosshairGroup = crosshair;

    // 4. Vertical Studio Follow-Spotlight Hover Beam (glides over hovered tile across all 12 boards!)
    this.buildHoverSpotlightBeam();
  }

  // --------------------------------------------------------------------------
  // Single Proud 1966 Backlit Acrylite & Motorized 3-Sided Trilon Tile Builder
  // (`1024x512` Living Color Plaque + Trilon Spindles + 3D Gold Vault Padlock!)
  // --------------------------------------------------------------------------

  private computeTileFootprint(tile: BoardTileNodeV7, spec: BoardSpecV7): { tileW: number; tileD: number } {
    if (this.isPortraitMode) {
      const total = this.tiles.length || spec.slots.length;
      const rows = Math.max(4, Math.ceil(total / 3));
      return {
        tileW: 0.745,
        tileD: rows >= 5 ? 0.495 : 0.615,
      };
    }
    if (tile.shape === 'HEX') {
      return { tileW: 0.65, tileD: 0.55 };
    }
    if (this.activeBoardId === 'BOARD_12_PENDULUM_BALANCE') {
      return { tileW: 0.66, tileD: 0.54 };
    }
    if (this.activeBoardId === 'BOARD_07_MONTE_CARLO_SHOE') {
      return { tileW: 0.66, tileD: 0.50 };
    }
    if (this.activeBoardId === 'BOARD_08_GEODESIC_SUNDIAL') {
      return { tileW: 0.59, tileD: 0.47 };
    }
    if (spec.slots.length >= 13) {
      return { tileW: 0.63, tileD: 0.50 };
    }
    return { tileW: 0.74, tileD: 0.54 };
  }

  private buildSculptedVaultPadlock(): THREE.Group {
    const lockGroup = new THREE.Group();
    lockGroup.name = 'VaultPadlock3D';

    const goldLockMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xf6bc33,
        emissive: 0x7c4a00,
        emissiveIntensity: 0.45,
        roughness: 0.18,
        metalness: 0.92,
        clearcoat: 0.7,
      }),
    );
    const steelShackleMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xe6edf5,
        roughness: 0.2,
        metalness: 0.94,
        clearcoat: 0.5,
      }),
    );
    const keyholeMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x241309,
        roughness: 0.4,
        metalness: 0.2,
      }),
    );

    // Sculpted chamfered gold padlock body
    const body = new THREE.Mesh(
      this.trackGeom(createChamferedSlabGeometry(0.12, 0.036, 0.105, 0.018, 0.006)),
      goldLockMat,
    );
    body.position.set(0, 0.0, 0.03);
    lockGroup.add(body);

    // Curved brushed-steel U-shackle arch
    const shackle = new THREE.Mesh(
      this.trackGeom(new THREE.TorusGeometry(0.038, 0.011, 10, 20, Math.PI)),
      steelShackleMat,
    );
    shackle.rotation.x = -Math.PI * 0.5;
    shackle.position.set(0, 0.018, -0.02);
    lockGroup.add(shackle);

    // Keyhole escutcheon detail on top face of lock
    const keyhole = new THREE.Mesh(
      this.trackGeom(new THREE.CylinderGeometry(0.013, 0.013, 0.008, 12)),
      keyholeMat,
    );
    keyhole.position.set(0, 0.036, 0.024);
    lockGroup.add(keyhole);

    return lockGroup;
  }

  private buildSingleTileRig(tile: BoardTileNodeV7, spec: BoardSpecV7): TileVisualRigV7 {
    const livingPal = LIVING_COLOR_DOMAIN_PALETTE_V7[tile.domain];
    const { tileW, tileD } = this.computeTileFootprint(tile, spec);

    const rootGroup = new THREE.Group();
    rootGroup.name = tile.id;
    rootGroup.position.set(tile.x, 0, tile.z);

    // 0. Grounded Tile Plinth Contact AO Shadow Disc (exact deck surface height for Ziggurat & Balance Beam!)
    let deckTopY = 0.0135;
    if (this.activeBoardId === 'BOARD_12_PENDULUM_BALANCE') {
      deckTopY = this.isPortraitMode ? 0.145 : 0.141;
    } else if (!this.isPortraitMode && this.activeBoardId === 'BOARD_10_SOVEREIGN_ZIGGURAT') {
      deckTopY = tile.tierY > 0.3 ? 0.2245 : tile.tierY > 0.2 ? 0.1235 : 0.0135;
    }
    this.addBoardContactShadow(rootGroup, tileW * 0.62, tileD * 0.64, deckTopY, 0, 0);

    const satinAlumMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xdce5f0,
        roughness: 0.24,
        metalness: 0.88,
        clearcoat: 0.4,
      }),
    );
    const palette = this.resolveSeasonalMaterialPalette(spec);
    const brassPinMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: palette.brassHex,
        roughness: 0.22,
        metalness: 0.92,
        clearcoat: 0.5,
      }),
    );

    // 1. 4 Visible Machined Brass Guide Pins + Left/Right Motorized Trilon Axle Spindles (`2` merged draw calls instead of `6`!)
    const mergeNonIndexed = (geoms: THREE.BufferGeometry[]): THREE.BufferGeometry => {
      const nonIdx = geoms.map((g) => (g.index ? g.toNonIndexed() : g.clone()));
      let totalVerts = 0;
      for (const g of nonIdx) totalVerts += g.getAttribute('position').count;
      const pos = new Float32Array(totalVerts * 3);
      const norm = new Float32Array(totalVerts * 3);
      const uv = new Float32Array(totalVerts * 2);
      let vOff = 0;
      for (const g of nonIdx) {
        const pAttr = g.getAttribute('position') as THREE.BufferAttribute;
        const nAttr = g.getAttribute('normal') as THREE.BufferAttribute | undefined;
        const uAttr = g.getAttribute('uv') as THREE.BufferAttribute | undefined;
        pos.set(pAttr.array as ArrayLike<number>, vOff * 3);
        if (nAttr) norm.set(nAttr.array as ArrayLike<number>, vOff * 3);
        if (uAttr) uv.set(uAttr.array as ArrayLike<number>, vOff * 2);
        vOff += pAttr.count;
        g.dispose();
      }
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      out.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
      out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      return out;
    };

    const pinHeight = Math.max(0.08, tile.tierY - 0.014);
    const pxOff = tileW * 0.34;
    const pzOff = tileD * 0.3;
    const pinParts: THREE.BufferGeometry[] = [];
    for (const [sx, sz] of [
      [-pxOff, -pzOff],
      [pxOff, -pzOff],
      [-pxOff, pzOff],
      [pxOff, pzOff],
    ]) {
      const g = new THREE.CylinderGeometry(0.014, 0.016, pinHeight, 10);
      g.translate(sx, pinHeight * 0.5 - 0.01, sz);
      pinParts.push(g);
    }
    const pinsMesh = new THREE.Mesh(this.trackGeom(mergeNonIndexed(pinParts)), brassPinMat);
    rootGroup.add(pinsMesh);

    const axleParts: THREE.BufferGeometry[] = [];
    for (const side of [-1, 1]) {
      const g = new THREE.CylinderGeometry(0.012, 0.012, 0.036, 10);
      g.rotateZ(Math.PI * 0.5);
      g.translate(side * (tileW * 0.5 + 0.008), tile.tierY - 0.03, 0);
      axleParts.push(g);
    }
    const axlesMesh = new THREE.Mesh(this.trackGeom(mergeNonIndexed(axleParts)), satinAlumMat);
    rootGroup.add(axlesMesh);

    // Stepped seasonal socket collar for high-tier plinths (`tierY > 0.17m`)
    if (tile.tierY > 0.17) {
      const riserH = tile.tierY - 0.08;
      const riserMat = this.trackMat(
        new THREE.MeshPhysicalMaterial({
          color: palette.consoleBakeliteHex,
          roughness: 0.42,
          metalness: 0.28,
          clearcoat: 0.4,
        }),
      );
      const riser = new THREE.Mesh(
        this.trackGeom(
          createChamferedSlabGeometry(tileW * 0.88, riserH, tileD * 0.88, 0.035, 0.008),
        ),
        riserMat,
      );
      riser.position.y = 0.01;
      rootGroup.add(riser);
    }

    // Crisp Form-Fitting Contoured Hover / Claimed Under-Rim Glow Collar (matches exact tile silhouette!)
    const underGlowMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffdf7a,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const underGlowRing = new THREE.Mesh(
      this.trackGeom(createContouredGlowRingGeometry(tile.shape, tileW, tileD, 0.034)),
      underGlowMat,
    );
    underGlowRing.position.y = tile.tierY - 0.068;
    rootGroup.add(underGlowRing);

    // 2. Canonical `RimRing` Socket A: Sleek Contoured Harvest-Gold Truce Halo (zero loose floating dashes!)
    const amberTruceRing = new THREE.Group();
    amberTruceRing.position.y = tile.tierY - 0.05;
    const amberMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf4a91f,
        emissive: 0xf4a91f,
        emissiveIntensity: 0.75,
        roughness: 0.28,
        metalness: 0.2,
      }),
    );
    const amberFrame = new THREE.Mesh(
      this.trackGeom(createContouredGlowRingGeometry(tile.shape, tileW, tileD, 0.02)),
      amberMat,
    );
    amberTruceRing.add(amberFrame);
    amberTruceRing.visible = tile.hasAmberTruce;
    rootGroup.add(amberTruceRing);

    // 3. Canonical `RimRing` Socket B: Sleek Contoured Peacock-Teal UHF Halo (ZERO jagged shards!)
    const uhfMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x33cad8,
        emissive: 0x0096a6,
        emissiveIntensity: 0.75,
        roughness: 0.22,
        metalness: 0.3,
      }),
    );
    const uhfHaloMesh = new THREE.Mesh(
      this.trackGeom(createContouredGlowRingGeometry(tile.shape, tileW, tileD, 0.022)),
      uhfMat,
    );
    uhfHaloMesh.position.y = tile.tierY - 0.05;
    uhfHaloMesh.visible = tile.hasUhfHalo;
    rootGroup.add(uhfHaloMesh);

    // Blitz Survivor Gold Crown Collar (form-fitting perimeter bezel — zero jagged triangles!)
    const blitzMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffd56b,
        emissive: 0xf4a91f,
        emissiveIntensity: 0.95,
        roughness: 0.18,
        metalness: 0.85,
      }),
    );
    const blitzCrownRing = new THREE.Mesh(
      this.trackGeom(createContouredGlowRingGeometry(tile.shape, tileW, tileD, 0.026)),
      blitzMat,
    );
    blitzCrownRing.position.y = tile.tierY - 0.05;
    blitzCrownRing.visible = false;
    rootGroup.add(blitzCrownRing);

    // 1966 TV Twist Flush Luminous Perimeter Glow Collar (matches exact tile silhouette — ZERO jagged shards!)
    const twistAccentMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xf4a91f,
        emissive: 0xf4a91f,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.35,
      }),
    );
    const twistAccentRing = new THREE.Mesh(
      this.trackGeom(createContouredGlowRingGeometry(tile.shape, tileW, tileD, 0.024)),
      twistAccentMat,
    );
    twistAccentRing.position.y = tile.tierY - 0.05;
    twistAccentRing.visible = false;
    rootGroup.add(twistAccentRing);

    // 4. Liftable Tile Plinth Group -> Motorized 3-Sided Trilon Pivot Group (`trilonFlipGroup`)!
    const liftGroup = new THREE.Group();
    liftGroup.position.y = tile.tierY;
    rootGroup.add(liftGroup);

    const trilonFlipGroup = new THREE.Group();
    trilonFlipGroup.position.y = -0.024; // Rotate cleanly around tile prism vertical center!
    liftGroup.add(trilonFlipGroup);

    // 4a. Razor-Clean Backlit 1966 Living Color Acrylite Outer Casing (ZERO protruding jagged notch tabs!)
    const rimShape = createTileContourShape(tile.shape, tileW - 0.016, tileD - 0.016);
    const rimGeom = this.trackGeom(
      new THREE.ExtrudeGeometry(rimShape, {
        depth: 0.042,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 3,
      }),
    );
    rimGeom.rotateX(-Math.PI * 0.5);
    rimGeom.translate(0, -0.034, 0);

    const enamelMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: livingPal.primaryHexNum,
        emissive: livingPal.primaryHexNum,
        emissiveIntensity: 0.22,
        roughness: 0.16,
        metalness: 0.12,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12,
      }),
    );
    const enamelRimMesh = new THREE.Mesh(rimGeom, enamelMat);
    enamelRimMesh.castShadow = true;
    enamelRimMesh.receiveShadow = true;
    trilonFlipGroup.add(enamelRimMesh);

    // 4b. Clean Warm TV Cream / Satin Aluminum Inner Prism Core (ZERO dull gray-brown!)
    const coreShape = createTileContourShape(tile.shape, tileW - 0.048, tileD - 0.048);
    const coreGeom = this.trackGeom(
      new THREE.ExtrudeGeometry(coreShape, {
        depth: 0.042,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      }),
    );
    coreGeom.rotateX(-Math.PI * 0.5);
    coreGeom.translate(0, -0.03, 0);

    const trilonStyle =
      TRILON_STYLE_CONFIGS_V9[this.activeTrilonStyleId] ??
      TRILON_STYLE_CONFIGS_V9.trilon_acrylite_cream;
    const seasonSpec = SEASON_VISUAL_SPECS_V9[this.activeSeason] ?? SEASON_VISUAL_SPECS_V9[1];
    const seasonalCoreHex =
      trilonStyle.id === 'trilon_acrylite_cream'
        ? this.activeSeason === 2
          ? 0xffe8d6
          : this.activeSeason === 3
            ? 0xf8e2a6
            : this.activeSeason === 4
              ? 0xe2ecff
              : 0xfff6e3
        : trilonStyle.coreHexNum;

    const champagneMat = this.trackMat(
      new THREE.MeshPhysicalMaterial({
        color: seasonalCoreHex,
        emissive: 0xffefd0,
        emissiveIntensity: 0.24,
        roughness: 0.28,
        metalness: 0.04,
        clearcoat: 0.5,
      }),
    );
    champagneMat.envMapIntensity = 0.45;
    const champagneCoreMesh = new THREE.Mesh(coreGeom, champagneMat);
    champagneCoreMesh.castShadow = true;
    champagneCoreMesh.receiveShadow = false;
    trilonFlipGroup.add(champagneCoreMesh);

    // 4c. Ultra-HD `1024x512` Mipmapped `CanvasTexture` Living Color Front Plaque (fills 92% x 90% of tile!)
    let plaqueCanvas: HTMLCanvasElement | null = null;
    let plaqueTexture: THREE.CanvasTexture | null = null;
    if (typeof document !== 'undefined') {
      plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 1024;
      plaqueCanvas.height = 512;
      const breakdown = this.twistsEngine.evaluateTileModifiers(tile, this.tiles);
      renderTilePlaqueCanvas(plaqueCanvas, tile, breakdown, this.highContrastBadges, {
        secretRevealed: this.twistsEngine.isSecretSquareRevealed(tile.index),
        curtainNumber: this.twistsEngine.getCurtainNumber(tile.index),
        rolledMysteryOutcome: this.twistsEngine.getRolledMysteryOutcome(tile.index),
        eyeGuessFlashActive: this.eyeGuessFlashRemainingSec > 0,
        eyeGuessBadge: this.twistsEngine.getEyeGuessHiddenBadge(tile.index),
        concentrationPrize: this.twistsEngine.getConcentrationPrize(tile.index),
        concentrationRevealed: this.twistsEngine.isConcentrationTileRevealed(tile.index),
        isSpotlit: this.activeSpotlightIndices.includes(tile.index),
        isRovingSpotlightBoard: this.activeSpotlightIndices.length > 0,
        hasBrassKeyOnBoard: this.tiles.some((t) => t.tvTwist === 'BRASS_KEY'),
        boardModeV9: this.activeBoardModeV9,
        trilonStyle,
        seasonSpec,
        pressureCookerMult: this.twistsEngine.getPressureCookerMult(),
        isHighVoltDoor:
          this.activeBoardModeV9 === 'BLACKOUT_VAULT' &&
          this.twistsEngine.getBlackoutHighVoltIndices().has(tile.index),
        dominoAdjacentHint: this.isDominoAdjacentHintV9(tile),
      });

      plaqueTexture = this.trackTex(new THREE.CanvasTexture(plaqueCanvas));
      plaqueTexture.colorSpace = THREE.SRGBColorSpace;
      plaqueTexture.generateMipmaps = true;
      plaqueTexture.minFilter = THREE.LinearMipmapLinearFilter;
      plaqueTexture.magFilter = THREE.LinearFilter;
      plaqueTexture.anisotropy = 16;
      plaqueTexture.needsUpdate = true;
    }

    const plaqueW = tileW * (tile.shape === 'HEX' ? 0.8 : 0.92);
    const plaqueD = tileD * (tile.shape === 'HEX' ? 0.78 : 0.9);
    const plaqueGeom = this.trackGeom(new THREE.PlaneGeometry(plaqueW, plaqueD));
    plaqueGeom.rotateX(-Math.PI * 0.5);
    // `toneMapped: false` prevents AgXToneMapping from crushing `#FFF9EC` backlit cream into `#CBC5BA` putty-grey!
    const plaqueMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: plaqueTexture,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );
    const plaqueMesh = new THREE.Mesh(plaqueGeom, plaqueMat);
    plaqueMesh.position.y = 0.0285; // Cleanly +8.5mm above prism core top (zero depth-buffer Z-fighting!)
    trilonFlipGroup.add(plaqueMesh);

    // Reverse Metallic Harvest-Gold Trilon Backplate (visible only during active Trilon flip -> saves 36 draw calls at rest!)
    const trilonBackGroup = new THREE.Group();
    trilonBackGroup.visible = false;
    const bpParts: THREE.BufferGeometry[] = [];
    const backplateGeom = new THREE.PlaneGeometry(plaqueW * 0.96, plaqueD * 0.96);
    backplateGeom.rotateX(Math.PI * 0.5);
    backplateGeom.translate(0, -0.046, 0);
    bpParts.push(backplateGeom);
    const backStarGeom = new THREE.OctahedronGeometry(Math.min(tileW, tileD) * 0.16, 0);
    backStarGeom.scale(1, 0.18, 1);
    backStarGeom.translate(0, -0.052, 0);
    bpParts.push(backStarGeom);
    const spindleAxleGeom = new THREE.CylinderGeometry(0.0105, 0.0105, tileW + 0.044, 10);
    spindleAxleGeom.rotateZ(Math.PI * 0.5);
    spindleAxleGeom.translate(0, -0.012, 0);
    bpParts.push(spindleAxleGeom);
    trilonBackGroup.add(new THREE.Mesh(this.trackGeom(mergeNonIndexed(bpParts)), brassPinMat));
    trilonFlipGroup.add(trilonBackGroup);

    const collarParts: THREE.BufferGeometry[] = [];
    for (const sx of [-1, 1] as const) {
      const cg = new THREE.CylinderGeometry(0.019, 0.019, 0.016, 12);
      cg.rotateZ(Math.PI * 0.5);
      cg.translate(sx * (tileW * 0.5 + 0.01), -0.036, 0);
      collarParts.push(cg);
    }
    liftGroup.add(new THREE.Mesh(this.trackGeom(mergeNonIndexed(collarParts)), brassPinMat));

    // 4d. Sculpted 3D Gold Padlock Emblem (nestled cleanly in dedicated top-right clasp bay — zero text overlap!)
    const vaultLockGroup = this.buildSculptedVaultPadlock();
    vaultLockGroup.position.set(tileW * 0.36, 0.028, -tileD * 0.33);
    vaultLockGroup.scale.setScalar(0.76);
    vaultLockGroup.visible = tile.tvTwist === 'LOCKED_VAULT' && Boolean(tile.isVaultLocked);
    trilonFlipGroup.add(vaultLockGroup);

    // 5. Generous Mobile-Safe Raycast Hit-Volume (`1.06x` footprint, non-overlapping!)
    const pickMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
      }),
    );
    const pickVolumeMesh = new THREE.Mesh(
      this.trackGeom(new THREE.BoxGeometry(tileW * 1.04, 0.14, tileD * 1.06)),
      pickMat,
    );
    pickVolumeMesh.position.y = -0.02;
    pickVolumeMesh.userData = {
      pickType: 'TILE',
      tileIndex: tile.index,
    };
    liftGroup.add(pickVolumeMesh);
    this.pickMeshes.push(pickVolumeMesh);

    return {
      node: tile,
      rootGroup,
      liftGroup,
      trilonFlipGroup,
      trilonBackGroup,
      enamelRimMesh,
      enamelMat,
      champagneCoreMesh,
      plaqueMesh,
      plaqueMat,
      plaqueCanvas,
      plaqueTexture,
      underGlowRing,
      underGlowMat,
      amberTruceRing,
      uhfHaloMesh,
      blitzCrownRing,
      twistAccentRing,
      twistAccentMat,
      vaultLockGroup,
      pickVolumeMesh,
      tileD,
      currentLiftY: 0,
      liftVelocityY: 0,
      targetLiftY: 0,
      flipActive: false,
      flipElapsedSec: 0,
      flipDurationSec: 0.42,
      flipDelaySec: 0,
      flipSwappedAtMidpoint: false,
      vaultShakeSec: 0,
      vaultUnlockBurstSec: 0,
    };
  }

  // --------------------------------------------------------------------------
  // Plaque & Socket State Synchronization
  // --------------------------------------------------------------------------

  private isDominoAdjacentHintV9(tile: BoardTileNodeV7): boolean {
    if (this.activeBoardModeV9 !== 'GOLDEN_DOMINO_CASCADE') return false;
    if (tile.state !== 'OPEN' && tile.state !== 'BLITZ_SURVIVOR') return false;
    const specSlots = BOARD_SPECS_V7[this.activeBoardId]?.slots;
    const sA = specSlots?.[tile.index];
    if (!sA) return false;
    return this.tiles.some((other) => {
      if (other.state !== 'CLAIMED_PLAYER') return false;
      const sB = specSlots[other.index];
      if (!sB) return false;
      return areGoldenDominoAdjacentV9(sA, sB, this.activeBoardId);
    });
  }

  private refreshSingleTileVisual(rig: TileVisualRigV7): void {
    const tile = rig.node;
    const livingPal = LIVING_COLOR_DOMAIN_PALETTE_V7[tile.domain];
    const tvTwist: ClassicTvTileTwistV7 = tile.tvTwist ?? 'NONE';
    const isLockedVault = tvTwist === 'LOCKED_VAULT' && Boolean(tile.isVaultLocked);
    const isUnlockedVault = tvTwist === 'LOCKED_VAULT' && !tile.isVaultLocked;
    const isLiveWireLocked = Boolean(tile.isLiveWireLocked);
    const isTopologyLocked = Boolean(tile.isTopologyLocked) || isLiveWireLocked;
    const isVipBluff = tile.tvTwistV9 === 'VIP_BLUFF';
    const isSpotlightV9 = Boolean(tile.isSpotlightTile);
    const isKeyholderShielded = (tile.keyholderProtectedTurns ?? 0) > 0;
    const isSpotlit = this.activeSpotlightIndices.includes(tile.index);
    const isSecretRevealed =
      tvTwist === 'SECRET_SQUARE' && this.twistsEngine.isSecretSquareRevealed(tile.index);
    const isPlayable = tile.state === 'OPEN' || tile.state === 'BLITZ_SURVIVOR';
    const isBlindCategory = tvTwist === 'BLIND_CATEGORY';
    const isBlackoutShutter =
      Boolean(tile.blindCategoryHidden) && Boolean(tile.mysteryCashHidden);
    const isR7LouverShutter =
      !isBlackoutShutter && !isBlindCategory && Boolean(tile.blindCategoryHidden);
    const isShutteredMystery =
      (isBlackoutShutter || isR7LouverShutter) && !isLockedVault && !isTopologyLocked;
    const trilonStyle =
      TRILON_STYLE_CONFIGS_V9[this.activeTrilonStyleId] ??
      TRILON_STYLE_CONFIGS_V9.trilon_acrylite_cream;
    const seasonSpec = SEASON_VISUAL_SPECS_V9[this.activeSeason] ?? SEASON_VISUAL_SPECS_V9[1];

    // Sync inner prism core tint for default seasonal Acrylite Cream or equipped cosmetic
    const coreMat = rig.champagneCoreMesh.material as THREE.MeshPhysicalMaterial | undefined;
    if (coreMat && coreMat.color) {
      const seasonalCoreHex =
        trilonStyle.id === 'trilon_acrylite_cream'
          ? this.activeSeason === 2
            ? 0xffe8d6
            : this.activeSeason === 3
              ? 0xf8e2a6
              : this.activeSeason === 4
                ? 0xe2ecff
                : 0xfff6e3
          : trilonStyle.coreHexNum;
      coreMat.color.setHex(seasonalCoreHex);
    }

    // Color-code 3D backlit Acrylite casing cleanly by Living Color domain, Topology/R7 Shutter, Shield, or TV Twist!
    let rimHex = trilonStyle.rimHexNum ?? livingPal.primaryHexNum;
    let isStandardOpenRim = trilonStyle.rimHexNum === null;
    if (tile.state === 'CLAIMED_PLAYER') {
      rimHex = 0x16a34a;
      isStandardOpenRim = false;
    } else if (tile.state === 'CLAIMED_RIVAL') {
      rimHex = 0xd63838;
      isStandardOpenRim = false;
    } else if (isTopologyLocked && !isLockedVault) {
      rimHex = 0x8c5838;
      isStandardOpenRim = false;
    } else if (isBlackoutShutter && !isLockedVault) {
      const isHighVolt =
        this.activeBoardModeV9 === 'BLACKOUT_VAULT' &&
        this.twistsEngine.getBlackoutHighVoltIndices().has(tile.index);
      rimHex = isHighVolt ? 0xd9480f : 0x6e3b23;
      isStandardOpenRim = false;
    } else if (isR7LouverShutter && !isLockedVault) {
      rimHex = 0x006b74;
      isStandardOpenRim = false;
    } else if (
      isKeyholderShielded ||
      isLockedVault ||
      isUnlockedVault ||
      isSecretRevealed ||
      isSpotlightV9 ||
      tvTwist === 'BLIND_CATEGORY' ||
      tvTwist === 'BRASS_KEY'
    ) {
      rimHex = 0xf4a91f;
      isStandardOpenRim = false;
    } else if (isVipBluff || tvTwist === 'MYSTERY_CURTAIN' || tvTwist === 'BIG_WHEEL_SPIN') {
      rimHex = 0xe63b7a;
      isStandardOpenRim = false;
    } else if (tvTwist === 'OPPONENT_CHOICE') {
      rimHex = 0xc92a54;
      isStandardOpenRim = false;
    } else if (tvTwist === 'PRESS_LUCK_SPIN' || tvTwist === 'INSTANT_BARGAIN') {
      rimHex = 0xff6738;
      isStandardOpenRim = false;
    } else if (tvTwist === 'MYSTERY_CASH') {
      rimHex = 0x00897b;
      isStandardOpenRim = false;
    }

    if (isStandardOpenRim) {
      const seasonTint = new THREE.Color(
        parseHexNumber(seasonSpec.tileAccentHex, livingPal.primaryHexNum),
      );
      rig.enamelMat.color.setHex(rimHex).lerp(seasonTint, 0.22);
      rig.enamelMat.emissive.copy(rig.enamelMat.color);
    } else {
      rig.enamelMat.color.setHex(rimHex);
      rig.enamelMat.emissive.setHex(rimHex);
    }

    // Keep claimed Contestant Medallions luminous (`0xffffff`), softly warming topology/live-wire shuttered tiles!
    rig.plaqueMat.color.setHex(isTopologyLocked && !isLockedVault ? 0xe8dcc4 : 0xffffff);

    // Strictly mutually exclusive perimeter collar priority (ZERO coplanar Z-fighting & ZERO shutter spoilers!)
    const showBlitzCollar = tile.state === 'BLITZ_SURVIVOR';
    let showTwistCollar = false;
    if (
      !showBlitzCollar &&
      isPlayable &&
      !isShutteredMystery &&
      (!isTopologyLocked || isKeyholderShielded)
    ) {
      if (
        isKeyholderShielded ||
        isUnlockedVault ||
        isSecretRevealed ||
        tvTwist === 'BRASS_KEY' ||
        isSpotlit ||
        isSpotlightV9
      ) {
        rig.twistAccentMat.color.setHex(0xfff099);
        rig.twistAccentMat.emissive.setHex(0xffb703);
        showTwistCollar = true;
      } else if (isVipBluff || tvTwist === 'MYSTERY_CURTAIN' || tvTwist === 'BIG_WHEEL_SPIN') {
        rig.twistAccentMat.color.setHex(0xff6da3);
        rig.twistAccentMat.emissive.setHex(0xe63b7a);
        showTwistCollar = true;
      } else if (tvTwist === 'OPPONENT_CHOICE') {
        rig.twistAccentMat.color.setHex(0xf47295);
        rig.twistAccentMat.emissive.setHex(0xc92a54);
        showTwistCollar = true;
      } else if (tvTwist === 'PRESS_LUCK_SPIN' || tvTwist === 'INSTANT_BARGAIN') {
        rig.twistAccentMat.color.setHex(0xff926b);
        rig.twistAccentMat.emissive.setHex(0xff5722);
        showTwistCollar = true;
      } else if (tvTwist === 'BLIND_CATEGORY') {
        rig.twistAccentMat.color.setHex(0xffe082);
        rig.twistAccentMat.emissive.setHex(0xf4a91f);
        showTwistCollar = true;
      } else if (tvTwist === 'SHOWCASE_BONUS' || tvTwist === 'MYSTERY_CASH') {
        rig.twistAccentMat.color.setHex(0x4be3f0);
        rig.twistAccentMat.emissive.setHex(0x0098a6);
        showTwistCollar = true;
      }
    }
    const showAmberCollar =
      !showBlitzCollar &&
      !showTwistCollar &&
      !isShutteredMystery &&
      tile.hasAmberTruce &&
      isPlayable &&
      !isTopologyLocked;
    const showUhfCollar =
      !showBlitzCollar &&
      !showTwistCollar &&
      !showAmberCollar &&
      !isShutteredMystery &&
      tile.hasUhfHalo &&
      isPlayable &&
      !isTopologyLocked;

    rig.blitzCrownRing.visible = showBlitzCollar;
    rig.twistAccentRing.visible = showTwistCollar;
    rig.amberTruceRing.visible = showAmberCollar;
    rig.uhfHaloMesh.visible = showUhfCollar;
    rig.vaultLockGroup.visible = isLockedVault && isPlayable;
    if (!isPlayable) {
      rig.underGlowMat.opacity = 0;
      rig.underGlowRing.visible = false;
    }

    // Disable raycast hit-volume on retracted tiles during Blitz!
    rig.pickVolumeMesh.visible = tile.state !== 'RETRACTED';

    if (rig.plaqueCanvas && rig.plaqueTexture) {
      const breakdown = this.twistsEngine.evaluateTileModifiers(tile, this.tiles);
      renderTilePlaqueCanvas(rig.plaqueCanvas, tile, breakdown, this.highContrastBadges, {
        secretRevealed: isSecretRevealed,
        curtainNumber: this.twistsEngine.getCurtainNumber(tile.index),
        rolledMysteryOutcome: this.twistsEngine.getRolledMysteryOutcome(tile.index),
        eyeGuessFlashActive: this.eyeGuessFlashRemainingSec > 0,
        eyeGuessBadge: this.twistsEngine.getEyeGuessHiddenBadge(tile.index),
        concentrationPrize: this.twistsEngine.getConcentrationPrize(tile.index),
        concentrationRevealed: this.twistsEngine.isConcentrationTileRevealed(tile.index),
        isSpotlit,
        isRovingSpotlightBoard: this.activeSpotlightIndices.length > 0,
        hasBrassKeyOnBoard: this.tiles.some((t) => t.tvTwist === 'BRASS_KEY'),
        boardModeV9: this.activeBoardModeV9,
        trilonStyle,
        seasonSpec,
        pressureCookerMult: this.twistsEngine.getPressureCookerMult(),
        isHighVoltDoor:
          this.activeBoardModeV9 === 'BLACKOUT_VAULT' &&
          this.twistsEngine.getBlackoutHighVoltIndices().has(tile.index),
        dominoAdjacentHint: this.isDominoAdjacentHintV9(tile),
      });
      rig.plaqueTexture.needsUpdate = true;
    }
  }

  public refreshAllTilePlaques(): void {
    this.twistsEngine.recomputeBoardModifiers(this.tiles);

    for (const rig of this.tileRigs) {
      this.refreshSingleTileVisual(rig);
    }

    this.syncDynamicBoardVisuals();
  }

  private syncDynamicBoardVisuals(): void {
    const gState = this.twistsEngine.getGimmickState();

    // Update Hex-Bridge glowing Living Color Acrylite conduits when adjacent tiles are claimed (ZERO dark brown mud!)
    for (const link of this.hexBridgeLinks) {
      const a = this.tiles[link.indexA];
      const b = this.tiles[link.indexB];
      const bothPlayer = a?.state === 'CLAIMED_PLAYER' && b?.state === 'CLAIMED_PLAYER';
      const bothRival = a?.state === 'CLAIMED_RIVAL' && b?.state === 'CLAIMED_RIVAL';
      const onePlayer = a?.state === 'CLAIMED_PLAYER' || b?.state === 'CLAIMED_PLAYER';
      if (bothPlayer) {
        link.mat.color.setHex(0xffe066);
        link.mat.emissive.setHex(0xf4a91f);
        link.mat.emissiveIntensity = 1.55;
      } else if (bothRival) {
        link.mat.color.setHex(0xff6b7a);
        link.mat.emissive.setHex(0xd63838);
        link.mat.emissiveIntensity = 1.15;
      } else if (onePlayer) {
        link.mat.color.setHex(0xf4a91f);
        link.mat.emissive.setHex(0xd97706);
        link.mat.emissiveIntensity = 0.65;
      } else {
        link.mat.color.setHex(0x0098a6);
        link.mat.emissive.setHex(0x0098a6);
        link.mat.emissiveIntensity = 0.34;
      }
    }

    // Update Toby's Mercy Switch supervisory lamp
    if (this.mercyLampMat) {
      if (gState.mercySwitchPulled) {
        this.mercyLampMat.color.setHex(0x009e73);
        this.mercyLampMat.emissive.setHex(0x009e73);
        this.mercyLampMat.emissiveIntensity = 1.0;
      } else {
        const anyRigged = this.tiles.some((t) => t.isRiggedSolenoid && t.state === 'OPEN');
        this.mercyLampMat.color.setHex(anyRigged ? 0xd55e00 : 0xe69f00);
        this.mercyLampMat.emissive.setHex(anyRigged ? 0xd55e00 : 0x885500);
        this.mercyLampMat.emissiveIntensity = anyRigged ? 0.95 : 0.35;
      }
    }

    // Update Pinball charged pop-bumper lamp
    for (let i = 0; i < this.pinballBumpers.length; i++) {
      const isCharged = i === gState.chargedBumperIndex % 3;
      this.pinballBumpers[i].lampMat.emissiveIntensity = isCharged ? 1.15 : 0.3;
    }

    // Update Rival Intent OverheadCrosshair when not in active swoop choreography
    if (this.overheadCrosshairGroup && !this.activeRivalChoreo) {
      const targetTile = this.tiles.find(
        (t) => t.isRivalTarget && (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR'),
      );
      if (targetTile) {
        const fp = this.computeTileFootprint(targetTile, BOARD_SPECS_V7[this.activeBoardId]);
        this.crosshairBaseScaleX = fp.tileW + 0.016;
        this.crosshairBaseScaleZ = fp.tileD + 0.016;
        this.overheadCrosshairGroup.visible = true;
        this.crosshairPos.set(targetTile.x, targetTile.tierY - 0.014, targetTile.z);
        this.overheadCrosshairGroup.position.copy(this.crosshairPos);
        this.overheadCrosshairGroup.scale.set(this.crosshairBaseScaleX, 1, this.crosshairBaseScaleZ);
      } else {
        this.overheadCrosshairGroup.visible = false;
      }
    }
  }

  // --------------------------------------------------------------------------
  // Clean Raycast API (`pickBoardInteraction`) & Interactive Actions
  // --------------------------------------------------------------------------

  /**
   * Pure, non-mutating raycast query across all active 3D tiles, Toby's Mercy
   * Switch lever, and the active board's interactive 3D contraption gimmick.
   */
  public pickBoardInteraction(raycaster: THREE.Raycaster): BoardPickResultV7 | null {
    this.rootGroup.updateMatrixWorld(true);
    const hits = raycaster.intersectObjects(this.pickMeshes, false);
    for (const hit of hits) {
      const ud = hit.object.userData as {
        pickType?: 'TILE' | 'MERCY_SWITCH' | 'BOARD_GIMMICK';
        tileIndex?: number;
        boardId?: BoardIdV7;
      };
      if (ud.pickType === 'TILE' && typeof ud.tileIndex === 'number') {
        const node = this.tiles[ud.tileIndex];
        if (node && node.state !== 'RETRACTED') {
          return { type: 'TILE', tileIndex: ud.tileIndex };
        }
      } else if (ud.pickType === 'MERCY_SWITCH') {
        return { type: 'MERCY_SWITCH' };
      } else if (ud.pickType === 'BOARD_GIMMICK' && ud.boardId) {
        return { type: 'BOARD_GIMMICK', boardId: ud.boardId };
      }
    }
    return null;
  }

  /**
   * Updates hover lift (`+0.032m` brass-pin elevation + golden rim glow) from a live `THREE.Raycaster`.
   */
  public updateHoverFromRaycaster(raycaster: THREE.Raycaster): BoardPickResultV7 | null {
    const pick = this.pickBoardInteraction(raycaster);
    if (pick?.type === 'TILE') {
      const node = this.tiles[pick.tileIndex];
      const canHoverLift = node && (node.state === 'OPEN' || node.state === 'BLITZ_SURVIVOR');
      this.setHoveredTile(canHoverLift ? pick.tileIndex : null);
    } else {
      this.setHoveredTile(null);
    }
    return pick;
  }

  public setHoveredTile(tileIndex: number | null): void {
    if (this.hoveredTileIndex === tileIndex) return;
    this.hoveredTileIndex = tileIndex;
    this.onTileHoverChanged?.(tileIndex);
  }

  public getHoveredTileIndex(): number | null {
    return this.hoveredTileIndex;
  }

  /**
   * Sweeps warm `2700K` studio follow-spot beams onto active spotlight tiles on `ROVING_SPOTLIGHT` boards!
   */
  public setSpotlightIndices(indices: readonly number[]): void {
    this.activeSpotlightIndices = indices.filter(
      (idx) => Number.isInteger(idx) && idx >= 0 && idx < this.tiles.length,
    );
    this.refreshAllTilePlaques();
  }

  public getSpotlightIndices(): readonly number[] {
    return this.activeSpotlightIndices;
  }

  /**
   * Mechanical detent press impulse (`-22mm` plunge with spring rebound + crisp Trilon spin!).
   */
  public triggerTileDetentPress(tileIndex: number): void {
    const rig = this.tileRigs[tileIndex];
    if (!rig) return;
    rig.liftVelocityY = -0.62;
    rig.currentLiftY = Math.min(rig.currentLiftY, -0.018);

    // Cue subtle ~4% studio pedestal camera push-in toward the selected tile!
    if (this.rootGroup.parent && !rig.node.isVaultLocked && !rig.node.isTopologyLocked) {
      const wp = this.getTileWorldPosition(tileIndex);
      (this.rootGroup.parent.userData as Record<string, unknown>).__wsFocusHint = {
        x: wp.x,
        z: wp.z,
        zoomBoost: 0.04,
      };
    }

    // Physical motorized 3-sided Trilon snap-flip on tap!
    if (!rig.node.isVaultLocked && !rig.node.isTopologyLocked) {
      this.triggerTrilonFlip(tileIndex, 0, 0.34);
    }

    // Pulse board-specific kinetic mechanism on tile press!
    for (const bumper of this.pinballBumpers) {
      bumper.pulse = 1.0;
    }
  }

  /**
   * Triggers a motorized 1966 *Concentration* 3-sided Trilon rotation (`0 -> 2π`)
   * with seamless midpoint face swap when the metallic sunburst backplate faces camera!
   */
  public triggerTrilonFlip(tileIndex: number, delaySec = 0, durationSec = 0.42): void {
    const rig = this.tileRigs[tileIndex];
    if (!rig) return;
    if (this.reducedMotion) {
      this.refreshSingleTileVisual(rig);
      return;
    }
    rig.flipActive = true;
    rig.flipElapsedSec = 0;
    rig.flipDurationSec = Math.max(0.2, durationSec);
    rig.flipDelaySec = Math.max(0, delaySec);
    rig.flipSwappedAtMidpoint = false;
  }

  /**
   * Fires a celebratory chasing marquee bulb surge across the board bezel (+ cues 3D Stage `APPLAUSE` lightbox!).
   */
  public triggerMarqueeCelebration(durationSec = 1.4): void {
    this.marqueeCelebrationSec = Math.max(this.marqueeCelebrationSec, durationSec);
    if (this.rootGroup.parent) {
      const ud = this.rootGroup.parent.userData as { __wsApplausePulseSec?: number };
      ud.__wsApplausePulseSec = Math.max(ud.__wsApplausePulseSec ?? 0, Math.max(2.2, durationSec));
    }
  }

  /**
   * Rattles the 3D gold padlock & shakes a still-locked `LOCKED_VAULT` tile when tapped!
   */
  public triggerLockedVaultFeedback(tileIndex: number): void {
    const rig = this.tileRigs[tileIndex];
    if (!rig) return;
    rig.vaultShakeSec = 0.48;
    rig.liftVelocityY = 0.22;
  }

  /**
   * Unlocks any `LOCKED_VAULT` tiles adjacent to `claimedIdx` OR unlocks all locked
   * vaults immediately when `currentStreak >= 2`. Fires celebratory Trilon flips + marquee burst!
   */
  public unlockAdjacentVaults(claimedIdx: number, currentStreak = 0): VaultUnlockResultV7 {
    const res = this.twistsEngine.unlockAdjacentVaults(claimedIdx, this.tiles, currentStreak);
    if (res.unlockedTileIndices.length > 0) {
      this.triggerMarqueeCelebration(1.8);
      for (const idx of res.unlockedTileIndices) {
        const rig = this.tileRigs[idx];
        if (rig) {
          rig.liftVelocityY = 0.54;
          rig.vaultUnlockBurstSec = 0.75;
        }
        this.triggerTrilonFlip(idx, 0.04, 0.48);
      }
      this.refreshAllTilePlaques();
    }
    return res;
  }

  /**
   * Reveals a hidden `SECRET_SQUARE` tile on tap -> flips into gleaming Gold Starburst (`2×` Daily Double)!
   */
  public revealSecretSquare(tileIdx: number): SecretSquareRevealResultV7 {
    const res = this.twistsEngine.revealSecretSquare(tileIdx, this.tiles);
    if (res.wasSecretSquare && res.newlyRevealed) {
      this.triggerMarqueeCelebration(1.7);
      this.triggerTrilonFlip(tileIdx, 0, 0.46);
      this.refreshAllTilePlaques();
    }
    return res;
  }

  public isSecretSquareRevealed(tileIdx: number): boolean {
    return this.twistsEngine.isSecretSquareRevealed(tileIdx);
  }

  /**
   * Previews 3 distinct deterministic outcomes behind Curtains #1, #2, and #3
   * for interactive 3-door *Let's Make a Deal* theater UI!
   */
  public previewMysteryCurtainDoors(
    tileIdx: number,
  ): readonly [MysteryCurtainOutcomeV7, MysteryCurtainOutcomeV7, MysteryCurtainOutcomeV7] {
    return this.twistsEngine.previewMysteryCurtainDoors(tileIdx, this.tiles);
  }

  /**
   * Spins and resolves a 1966 `MYSTERY_CURTAIN` tile (`+$200 Envelope`, `Steal $150`,
   * `Double Chips`, or `Wild Category Swap`), triggering a Trilon flip & marquee surge!
   */
  public rollMysteryCurtainOutcome(
    tileIdx: number,
    chosenCurtainNum?: 1 | 2 | 3,
  ): MysteryCurtainOutcomeV7 {
    const outcome = this.twistsEngine.rollMysteryCurtainOutcome(
      tileIdx,
      this.tiles,
      chosenCurtainNum,
    );
    this.triggerMarqueeCelebration(1.5);
    this.triggerTrilonFlip(tileIdx, 0, 0.46);
    this.refreshAllTilePlaques();
    return outcome;
  }

  /**
   * Returns the active 1960s Board Gameplay Mode (`CLASSIC_TOTE`, `TIC_TAC_LINE`,
   * `COAST_HEX_BRIDGE`, `EYE_GUESS_MEMORY`, `CONCENTRATION_PRIZE_MATCH`, `MONTY_CURTAIN_DEAL`).
   */
  public getActiveBoardPlayMode(): BoardPlayModeV7 {
    return this.twistsEngine.getActivePlayMode();
  }

  /**
   * Returns the crisp 1966 Studio Rule Banner title & 1-line summary for the active board mode.
   */
  public getBoardModeRuleBanner(): BoardModeRuleBannerV7 {
    return this.twistsEngine.getBoardModeRuleBanner();
  }

  /**
   * Additive M3 R7+V7 active board mode getter (`LOUVER_SHUTTER`, `LIVE_WIRE_FUSE`, etc.).
   */
  public getActiveBoardModeV9(): BoardPlayModeV9 {
    return this.twistsEngine.getActiveBoardModeV9();
  }

  /**
   * Additive M3 R7+V7 crisp `<0.5s` marquee rule banner getter.
   */
  public getBoardModeRuleBannerV9(): BoardModeRuleBannerV9 {
    return this.twistsEngine.getBoardModeRuleBannerV9();
  }

  public getPressureCookerMult(): number {
    return this.twistsEngine.getPressureCookerMult();
  }

  public getActiveSeasonV9(): SeasonIdV7 {
    return this.activeSeason;
  }

  public getActiveTrilonStyleIdV9(): CanonicalTrilonStyleIdV9 {
    return this.activeTrilonStyleId;
  }

  /**
   * Unified R7/v7 post-turn board mode state advancement for both Player & Rival turns.
   */
  public resolvePostTurnBoardModeV9(
    claimedIdx: number,
    actor: 'PLAYER' | 'RIVAL',
    scored: boolean,
  ): BoardModePostClaimResultV9 {
    const res = this.twistsEngine.resolvePostTurnBoardModeV9(claimedIdx, this.tiles, actor, scored);
    if (
      (res.highlightedTileIndices && res.highlightedTileIndices.length > 0) ||
      (res.unlockedTileIndices && res.unlockedTileIndices.length > 0)
    ) {
      if (res.bonusCash >= 200 || res.rivalStealCash > 0 || res.multAdd >= 0.5 || res.emergencyCircuitBreakerFired) {
        this.triggerMarqueeCelebration(2.0);
      }
      const burstIndices = new Set<number>([
        ...(res.highlightedTileIndices ?? []),
        ...(res.unlockedTileIndices ?? []),
      ]);
      let order = 0;
      for (const idx of burstIndices) {
        const rig = this.tileRigs[idx];
        if (rig) {
          rig.vaultUnlockBurstSec = 2.0;
          rig.liftVelocityY = Math.max(rig.liftVelocityY, 0.48);
          this.triggerTrilonFlip(idx, order * 0.06, 0.4);
          order += 1;
        }
      }
    }
    this.refreshAllTilePlaques();
    return res;
  }

  /**
   * `EYE_GUESS_MEMORY` (*Eye Guess '66* — Boards 05, 09): Briefly flips ALL open tiles
   * open for `durationSec` (default `2.4s`) showing hidden `⭐ 2X`, `💰 +$300`, and `🎭 TRAP`
   * badges before snapping back shut!
   */
  public triggerEyeGuessMemoryFlash(durationSec = 2.4): void {
    this.eyeGuessFlashRemainingSec = Math.max(0.5, durationSec);
    this.triggerMarqueeCelebration(Math.min(2.6, durationSec));
    for (let idx = 0; idx < this.tileRigs.length; idx++) {
      const rig = this.tileRigs[idx];
      if (rig.node.state === 'OPEN' || rig.node.state === 'BLITZ_SURVIVOR') {
        this.triggerTrilonFlip(idx, idx * 0.022, 0.34);
      }
    }
    this.refreshAllTilePlaques();
  }

  public isEyeGuessFlashActive(): boolean {
    return this.eyeGuessFlashRemainingSec > 0;
  }

  /**
   * Evaluates mode-specific post-claim rewards (`TIC_TAC_LINE` +$600 3-in-a-row jackpot,
   * `COAST_HEX_BRIDGE` +$750 NYC-to-Hollywood bridge, `EYE_GUESS_MEMORY` hidden bonus/trap,
   * `CONCENTRATION_PRIZE_MATCH` +$500 luxury prize half matching & $200 TAKE! steal,
   * `MONTY_CURTAIN_DEAL` bonus sweetener, or `CLASSIC_TOTE` full-row sweep) and fires
   * celebratory 3D line/bridge pulses!
   */
  public evaluateBoardModePostClaim(
    claimedIdx: number,
    scored: boolean,
  ): BoardModePostClaimResultV7 {
    const res = this.twistsEngine.evaluateBoardModePostClaim(claimedIdx, this.tiles, scored);
    if (res.highlightedTileIndices && res.highlightedTileIndices.length > 0) {
      if (res.bonusCash >= 200 || res.rivalStealCash > 0 || res.multAdd >= 0.5) {
        this.triggerMarqueeCelebration(2.1);
      }
      for (let k = 0; k < res.highlightedTileIndices.length; k++) {
        const idx = res.highlightedTileIndices[k];
        const rig = this.tileRigs[idx];
        if (rig) {
          rig.vaultUnlockBurstSec = 2.4;
          rig.liftVelocityY = Math.max(rig.liftVelocityY, 0.52);
          this.triggerTrilonFlip(idx, k * 0.075, 0.42);
        }
      }
    }
    this.refreshAllTilePlaques();
    return res;
  }

  /**
   * If Rival targets an `OPPONENT_CHOICE` tile, flips it to one of the Rival's weak categories!
   */
  public resolveRivalOpponentChoiceIfNeeded(tileIdx: number): CategoryIdV7 | null {
    const weakCat = this.twistsEngine.resolveRivalOpponentChoiceIfNeeded(tileIdx, this.tiles);
    if (weakCat) {
      this.triggerTrilonFlip(tileIdx, 0, 0.4);
      this.refreshAllTilePlaques();
    }
    return weakCat;
  }

  /**
   * Pulls Toby's Mercy Switch in 3D: throws the copper knife lever, turns the
   * supervisory lamp emerald, disarms rigged solenoids, and invokes `onMercySwitchPulled`.
   */
  public pullMercySwitch(): { disarmedCount: number } {
    const res = this.twistsEngine.pullMercySwitch(this.tiles);
    this.refreshAllTilePlaques();
    this.onMercySwitchPulled?.(res.disarmedCount);
    return res;
  }

  /**
   * Triggers or drags the active board's 3D contraption gimmick (Crossfader slider,
   * Pass-Spin brass paddle, UHF Carrier knob, Baccarat Sabotage Shoe, Sundial gnomon, etc.).
   */
  public activateBoardGimmick(explicitValue?: number): Readonly<BoardGimmickStateV7> {
    const nextState = this.twistsEngine.triggerBoardGimmick(
      this.activeBoardId,
      this.tiles,
      explicitValue,
    );
    this.spinPaddleBounce = 1.0;
    for (const bumper of this.pinballBumpers) bumper.pulse = 0.85;
    this.refreshAllTilePlaques();
    this.onBoardGimmickTriggered?.(this.activeBoardId, nextState);
    return nextState;
  }

  /** Direct continuous drag helper for `BOARD_01_FUNK_CROSSFADER` (`-1..+1`). */
  public setCrossfaderPosition(normalizedX: number): Readonly<BoardGimmickStateV7> {
    return this.activateBoardGimmick(normalizedX);
  }

  /**
   * Commits a Player tile claim with mechanical detent plunge, 3D Trilon claim flip,
   * marquee celebration surge & live twist evaluation.
   */
  public claimPlayerTile(
    tileIndex: number,
    playerAnsweredCorrectly = true,
  ): TileTwistBreakdownV7 {
    this.triggerTileDetentPress(tileIndex);
    const breakdown = this.twistsEngine.commitPlayerTileClaim(
      tileIndex,
      this.tiles,
      playerAnsweredCorrectly,
    );
    if (playerAnsweredCorrectly) {
      this.triggerMarqueeCelebration(1.4);
      const claimedRig = this.tileRigs[tileIndex];
      if (claimedRig) {
        claimedRig.vaultUnlockBurstSec = Math.max(claimedRig.vaultUnlockBurstSec, 1.35);
      }
    }
    this.triggerTrilonFlip(tileIndex, 0, 0.44);
    this.refreshAllTilePlaques();
    return breakdown;
  }

  /**
   * Highlights the Rival's intended target tile with the floating crimson `OverheadCrosshair`.
   */
  public previewRivalIntent(tileIndex?: number): number | null {
    if (typeof tileIndex === 'number' && this.tiles[tileIndex]) {
      for (const t of this.tiles) {
        t.isRivalTarget = t.index === tileIndex;
      }
      this.refreshAllTilePlaques();
      return tileIndex;
    }
    const chosen = this.twistsEngine.chooseRivalTargetTile(this.tiles);
    this.refreshAllTilePlaques();
    return chosen;
  }

  /**
   * Choreographs the mandatory `1.20s` visible Rival board move:
   * `0.00–0.45s` Crimson `OverheadCrosshair` swoops & locks onto target tile,
   * `0.45–0.85s` tile lifts onto brass pins under crimson lock-on,
   * `0.85–1.20s` mechanical detent plunge flips tile to `CLAIMED_RIVAL` & settles.
   */
  public animateRivalClaim(
    tileIndex: number,
    didScore: boolean = true,
    onComplete?: () => void,
  ): Promise<void> {
    if (this.activeRivalChoreo) {
      this.activeRivalChoreo.resolve();
      this.activeRivalChoreo = null;
    }

    const target = this.tiles[tileIndex];
    if (!target) {
      onComplete?.();
      return Promise.resolve();
    }

    for (const t of this.tiles) {
      t.isRivalTarget = t.index === tileIndex;
    }
    if (this.overheadCrosshairGroup) {
      this.overheadCrosshairGroup.visible = true;
    }
    if (this.rootGroup.parent) {
      const wp = this.getTileWorldPosition(tileIndex);
      (this.rootGroup.parent.userData as Record<string, unknown>).__wsFocusHint = {
        x: wp.x,
        z: wp.z,
        zoomBoost: 0.035,
      };
    }

    return new Promise<void>((resolve) => {
      this.activeRivalChoreo = {
        tileIndex,
        didScore,
        elapsedSec: 0,
        durationSec: 1.2,
        committed: false,
        resolve,
        onComplete: () => {
          if (this.rootGroup.parent) {
            (this.rootGroup.parent.userData as Record<string, unknown>).__wsFocusHint = {
              x: 0,
              z: 0,
              zoomBoost: 0,
              clear: true,
            };
          }
          onComplete?.();
        },
      };
    });
  }

  /**
   * Executes a Round-2 Double-Stakes Solenoid Wave Re-Rack:
   * Resets all 12–15 plinths back to `'OPEN'` with rotated categories, `+50` Round-2
   * baseChips boost (capped at `400`), fresh socket markers, and upward solenoid spring lift
   * so 12-tile boards NEVER run out of clickable tiles in a 10-turn match!
   */
  public reRackFreshWave(waveNumber: 2 | 3 = 2): void {
    const spec = BOARD_SPECS_V7[this.activeBoardId];
    const boardSeed = ALL_BOARD_IDS_V7.indexOf(this.activeBoardId) * 3 + 1 + this.seedOffset;
    const waveOffset = waveNumber * 7;
    const allowedCats = this.resolveAllowedCategoriesV9();

    for (let idx = 0; idx < this.tiles.length; idx++) {
      const tile = this.tiles[idx];
      const slot = spec.slots[idx];
      const nextCat =
        allowedCats[Math.abs(idx * 3 + boardSeed + waveOffset) % allowedCats.length] ??
        ALL_CATEGORIES_V7[0];
      tile.category = nextCat;
      tile.domain = CATEGORY_TO_DOMAIN_V7[nextCat];
      tile.nominalBaseChips = slot?.baseChips ?? 200;
      tile.baseChips = Math.min(450, (slot?.baseChips ?? 200) + (waveNumber >= 2 ? 50 : 0));
      tile.state = 'OPEN';
      tile.isRivalTarget = false;
      tile.tvTwist = 'NONE';
      tile.tvTwistV9 = undefined;
      tile.vipId = undefined;
      tile.isVaultLocked = false;
      tile.isLiveWireLocked = false;
      tile.isSpotlightTile = false;
      tile.dominoGroupId = undefined;

      const rig = this.tileRigs[idx];
      if (rig) {
        rig.liftVelocityY = 0.42;
        this.triggerTrilonFlip(idx, idx * 0.038, 0.44);
      }
    }

    this.twistsEngine.seedSocketMarkersOnTiles(this.tiles);
    this.twistsEngine.seedClassicTvTwistsOnTiles(this.tiles, waveNumber, this.seedOffset);
    if (isR7BoardPlayModeV9(this.activeBoardModeV9)) {
      applyBoardPlayModeV9(this.tiles, this.activeBoardModeV9, {
        boardId: this.activeBoardId,
        seed: boardSeed + waveOffset,
      });
    }
    this.triggerMarqueeCelebration(1.6);
    this.refreshAllTilePlaques();
  }

  /**
   * Executes the `5:10` Keep-4-Keystones Solenoid Re-Rack:
   * Retracts `N - 6` tiles flush into the bed via solenoid pull-down and elevates
   * exact `6` glowing `BLITZ_SURVIVOR` plinths!
   */
  public triggerBlitzReRack(): BlitzReRackResultV7 {
    const result = this.twistsEngine.applyBlitzSolenoidReRack(this.tiles);
    for (const idx of result.survivorIndices) {
      const rig = this.tileRigs[idx];
      if (rig) {
        rig.liftVelocityY = 0.42;
      }
    }
    this.refreshAllTilePlaques();
    return result;
  }

  // --------------------------------------------------------------------------
  // Frame-Rate-Independent Kinesthetics & Hardware Tick (`update(dtSec)`)
  // --------------------------------------------------------------------------

  public update(dtSec: number): void {
    const dt = Math.min(0.05, Math.max(0.0001, dtSec));
    const choreoDt = Math.min(0.25, Math.max(0.0001, dtSec));
    this.elapsedSec += dt;
    const gState = this.twistsEngine.getGimmickState();
    const motionScale = this.reducedMotion ? 0.15 : 1.0;

    // 1. Update `1.20s` Visible Rival Board Choreography if active
    let rivalLiftTileIndex: number | null = null;
    if (this.activeRivalChoreo) {
      const choreo = this.activeRivalChoreo;
      choreo.elapsedSec += choreoDt;
      const p = Math.min(1, choreo.elapsedSec / choreo.durationSec);
      const target = this.tiles[choreo.tileIndex];

      if (target && this.overheadCrosshairGroup) {
        const fp = this.computeTileFootprint(target, BOARD_SPECS_V7[this.activeBoardId]);
        this.crosshairBaseScaleX = fp.tileW + 0.016;
        this.crosshairBaseScaleZ = fp.tileD + 0.016;
        this.overheadCrosshairGroup.visible = true;
        const goalVec = new THREE.Vector3(target.x, target.tierY - 0.01, target.z);
        this.crosshairPos.lerp(goalVec, Math.min(1, dt * 12));
        this.overheadCrosshairGroup.position.copy(this.crosshairPos);
        this.overheadCrosshairGroup.rotation.y = 0;
        const pulseScale = p < 0.7 ? 1.04 - p * 0.06 : 0.99 + (p - 0.7) * 0.1;
        this.overheadCrosshairGroup.scale.set(
          this.crosshairBaseScaleX * pulseScale,
          1,
          this.crosshairBaseScaleZ * pulseScale,
        );
      }

      if (p >= 0.35 && p < 0.74) {
        rivalLiftTileIndex = choreo.tileIndex;
      }
      if (p >= 0.74 && !choreo.committed) {
        choreo.committed = true;
        this.triggerTileDetentPress(choreo.tileIndex);
        if (choreo.didScore) {
          const rivalClaimRes = this.twistsEngine.commitRivalTileClaim(choreo.tileIndex, this.tiles);
          this.triggerTrilonFlip(choreo.tileIndex, 0, 0.42);
          if (rivalClaimRes.highlightedTileIndices && rivalClaimRes.highlightedTileIndices.length > 0) {
            if (rivalClaimRes.matchedPrize) {
              this.triggerMarqueeCelebration(1.6);
            }
            for (const hIdx of rivalClaimRes.highlightedTileIndices) {
              const hRig = this.tileRigs[hIdx];
              if (hRig) {
                hRig.vaultUnlockBurstSec = Math.max(hRig.vaultUnlockBurstSec, 1.4);
              }
            }
          }
        } else if (target) {
          // Rival FUMBLE / MISS: Tile rebounds OPEN with +$50 Rebound Bonus so the player can steal it!
          target.isRivalTarget = false;
          target.baseChips = Math.min(500, target.baseChips + 50);
          if (isR7BoardPlayModeV9(this.activeBoardModeV9)) {
            this.twistsEngine.resolvePostTurnBoardModeV9(choreo.tileIndex, this.tiles, 'RIVAL', false);
          }
        }
        this.refreshAllTilePlaques();
      }
      if (p >= 1.0) {
        this.activeRivalChoreo = null;
        if (this.overheadCrosshairGroup) {
          this.overheadCrosshairGroup.scale.set(this.crosshairBaseScaleX, 1, this.crosshairBaseScaleZ);
          this.syncDynamicBoardVisuals();
        }
        choreo.onComplete?.();
        choreo.resolve();
      }
    } else if (this.overheadCrosshairGroup && this.overheadCrosshairGroup.visible) {
      // Gentle studio tally pulse on outer perimeter brackets (never clips plaque text or neighboring tiles!)
      this.overheadCrosshairGroup.rotation.y = 0;
      const gentlePulse = 1.0 + 0.018 * Math.sin(this.elapsedSec * 4.2 * motionScale);
      this.overheadCrosshairGroup.scale.set(
        this.crosshairBaseScaleX * gentlePulse,
        1,
        this.crosshairBaseScaleZ * gentlePulse,
      );
    }

    // 2. Critically-Damped Tile Spring Physics (+32mm hover lift, -22mm click detent, 24Hz Solenoid shiver, Blitz retraction)
    for (const rig of this.tileRigs) {
      const tile = rig.node;
      let goalY = 0;

      if (tile.state === 'RETRACTED') {
        goalY = -(tile.tierY - 0.015); // Retracts flush into solenoid bed pocket!
      } else if (tile.state === 'BLITZ_SURVIVOR') {
        goalY = this.hoveredTileIndex === tile.index ? 0.056 : 0.028;
      } else if (
        (this.hoveredTileIndex === tile.index && tile.state === 'OPEN') ||
        rivalLiftTileIndex === tile.index
      ) {
        goalY = 0.032; // +32mm proud hover lift onto visible brass pins!
      } else if (tile.isSpotlightTile && tile.state === 'OPEN') {
        goalY = 0.022; // Proud R7 Shifting Spotlight elevation!
      } else if (tile.state === 'CLAIMED_PLAYER' || tile.state === 'CLAIMED_RIVAL') {
        goalY = -0.008; // Latched slightly seated in detent
      }

      rig.targetLiftY = goalY;
      const stiffness = 260;
      const damping = 24;
      const force = (rig.targetLiftY - rig.currentLiftY) * stiffness - rig.liftVelocityY * damping;
      rig.liftVelocityY += force * dt;
      rig.currentLiftY += rig.liftVelocityY * dt;

      // 24Hz Rigged Solenoid physical shiver (`±0.008m`) OR Locked Vault tap rattle!
      let shiverX = 0;
      let shiverZ = 0;
      if (rig.vaultShakeSec > 0) {
        rig.vaultShakeSec = Math.max(0, rig.vaultShakeSec - dt);
        const decay = rig.vaultShakeSec / 0.48;
        shiverX += Math.sin(this.elapsedSec * 58) * 0.024 * decay * motionScale;
        rig.vaultLockGroup.rotation.y = Math.sin(this.elapsedSec * 64) * 0.35 * decay;
      } else {
        rig.vaultLockGroup.rotation.y = 0;
      }

      if (rig.vaultUnlockBurstSec > 0) {
        rig.vaultUnlockBurstSec = Math.max(0, rig.vaultUnlockBurstSec - dt);
      }

      // Physical Motorized 3-Sided Trilon (`0 -> 2π`) Flip Animation with anti-clipping pop-arc!
      let flipLiftArc = 0;
      if (rig.flipActive) {
        rig.trilonBackGroup.visible = true;
        if (rig.flipDelaySec > 0) {
          rig.flipDelaySec = Math.max(0, rig.flipDelaySec - dt);
        } else {
          rig.flipElapsedSec += dt;
          const u = Math.min(1, rig.flipElapsedSec / rig.flipDurationSec);
          // Smooth cubic ease-in-out with crisp mechanical snap settle
          const eased = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) * 0.5;
          const flipAngle = eased * Math.PI * 2;
          rig.trilonFlipGroup.rotation.x = flipAngle;
          // Lift prism cleanly clear of the recessed bed whenever tilted edge-on (ZERO bed clipping!)
          flipLiftArc = Math.abs(Math.sin(flipAngle)) * (rig.tileD * 0.48) + Math.sin(u * Math.PI) * 0.05;
          if (u >= 0.48 && !rig.flipSwappedAtMidpoint) {
            rig.flipSwappedAtMidpoint = true;
            this.refreshSingleTileVisual(rig);
          }
          if (u >= 1) {
            rig.flipActive = false;
            rig.trilonBackGroup.visible = false;
            rig.trilonFlipGroup.rotation.x = 0;
            flipLiftArc = 0;
          }
        }
      } else {
        rig.trilonBackGroup.visible = false;
        rig.trilonFlipGroup.rotation.x = 0;
      }

      rig.liftGroup.position.set(shiverX, tile.tierY + rig.currentLiftY + flipLiftArc, shiverZ);
      rig.rootGroup.visible =
        tile.state !== 'RETRACTED' || rig.currentLiftY > -(tile.tierY - 0.022);

      // Crisp Form-Fitting Hover Under-Glow (hidden cleanly on claimed/empty sockets!) + Sculpted Claimed Bevel Rim-Glow
      const isPlayableTile = tile.state === 'OPEN' || tile.state === 'BLITZ_SURVIVOR';
      const isHovered = this.hoveredTileIndex === tile.index && isPlayableTile;
      const isRivalLift = rivalLiftTileIndex === tile.index && isPlayableTile;
      const isClaimedPlayer = tile.state === 'CLAIMED_PLAYER';
      const isClaimedRival = tile.state === 'CLAIMED_RIVAL';

      let glowColorHex = 0xffdf7a;
      let glowTarget = 0.0;
      const isKeyShielded = (tile.keyholderProtectedTurns ?? 0) > 0;
      const isRovingSpot = this.activeSpotlightIndices.includes(tile.index);
      if (isRivalLift) {
        glowColorHex = 0xff5c4d;
        glowTarget = 0.92;
      } else if (isHovered && !tile.isTopologyLocked) {
        glowColorHex = 0xffdf7a;
        glowTarget = 0.92;
      } else if (isPlayableTile && isKeyShielded) {
        glowColorHex = 0xffe47a;
        glowTarget = 0.84;
      } else if (isPlayableTile && isRovingSpot) {
        glowColorHex = 0xffd56b;
        glowTarget = 0.76;
      } else if (rig.vaultUnlockBurstSec > 0) {
        glowColorHex = isClaimedPlayer ? 0xffe066 : 0xffd56b;
        glowTarget = Math.min(0.95, 0.45 + rig.vaultUnlockBurstSec * 0.42);
      } else if (isPlayableTile && tile.state === 'BLITZ_SURVIVOR') {
        glowColorHex = 0xffd56b;
        glowTarget = 0.62;
      }
      rig.underGlowMat.color.setHex(glowColorHex);
      if (!isPlayableTile && rig.vaultUnlockBurstSec <= 0) {
        rig.underGlowMat.opacity = 0;
        rig.underGlowRing.visible = false;
      } else {
        rig.underGlowMat.opacity += (glowTarget - rig.underGlowMat.opacity) * Math.min(1, dt * 14);
        rig.underGlowRing.visible = rig.underGlowMat.opacity > 0.015;
      }
      rig.enamelMat.emissiveIntensity = isHovered
        ? 0.56
        : rig.vaultUnlockBurstSec > 0
          ? 0.64
          : isPlayableTile && tile.state === 'BLITZ_SURVIVOR'
            ? 0.42
            : isClaimedPlayer || isClaimedRival
              ? 0.36
              : 0.22;

      // Smooth emissive studio glow pulse on form-fitting perimeter halos (ZERO spinning jagged triangles!)
      if (rig.twistAccentRing.visible) {
        rig.twistAccentMat.emissiveIntensity =
          0.62 + 0.45 * Math.abs(Math.sin(this.elapsedSec * 3.4 + tile.index));
      }
    }

    // 2b. Eye Guess '66 Memory Flash countdown -> auto-snaps all tiles back shut cleanly when expired!
    if (this.eyeGuessFlashRemainingSec > 0) {
      this.eyeGuessFlashRemainingSec = Math.max(0, this.eyeGuessFlashRemainingSec - dt);
      if (this.eyeGuessFlashRemainingSec === 0) {
        for (let idx = 0; idx < this.tileRigs.length; idx++) {
          const rig = this.tileRigs[idx];
          if (rig.node.state === 'OPEN' || rig.node.state === 'BLITZ_SURVIVOR') {
            this.triggerTrilonFlip(idx, idx * 0.02, 0.34);
          }
        }
        this.refreshAllTilePlaques();
      }
    }

    // 2c. Animate Perimeter Chasing `#11` Incandescent Marquee Bulbs + Synced Halation Sprites (Per-Season Choreography!)
    if (this.marqueeCircuitMats.length === 4) {
      const rateScale = this.reducedMotion ? 0.25 : 1.0;
      const hotCrest = new THREE.Color(0xfffdf7);
      const baseColor = new THREE.Color();

      if (this.marqueeCelebrationSec > 0) {
        this.marqueeCelebrationSec = Math.max(0, this.marqueeCelebrationSec - dt);
        const fastPhase = Math.floor(this.elapsedSec * 16) % 4;
        for (let c = 0; c < 4; c++) {
          const isHot = c === fastPhase || c === (fastPhase + 2) % 4;
          const circuitHex = this.marqueeCircuitHexes[c] ?? 0xffd56b;
          baseColor.setHex(circuitHex);
          if (isHot) {
            baseColor.lerp(hotCrest, 0.55);
          }
          this.marqueeCircuitMats[c].emissiveIntensity = isHot ? 2.4 : 0.9;
          this.marqueeCircuitMats[c].color.copy(baseColor);
          this.marqueeCircuitMats[c].emissive.setHex(circuitHex);
          if (this.marqueeHaloMats[c]) {
            this.marqueeHaloMats[c].color.setHex(circuitHex);
            this.marqueeHaloMats[c].opacity = isHot ? 0.94 : 0.36;
          }
        }
      } else if (this.activeSeason === 2) {
        // Season 2: Bouncy Googie Atomic Tangerine vs Carnaby Cerise ping-pong + dual beat
        const pingPong = 1.5 + 1.5 * Math.sin(this.elapsedSec * 3.8 * rateScale);
        for (let c = 0; c < 4; c++) {
          const dist = Math.abs(pingPong - c);
          const pingGlow = Math.max(0, 1 - dist * 0.75);
          const beatGlow = 0.5 + 0.5 * Math.sin(this.elapsedSec * 5.2 * rateScale + c * Math.PI);
          const glow = Math.min(1, pingGlow * 0.65 + beatGlow * 0.45);
          const circuitHex = this.marqueeCircuitHexes[c] ?? 0xff6b35;
          baseColor.setHex(circuitHex);
          if (glow > 0.55) {
            baseColor.lerp(hotCrest, 0.45);
          }
          this.marqueeCircuitMats[c].emissiveIntensity = 0.42 + glow * 1.75;
          this.marqueeCircuitMats[c].color.copy(baseColor);
          this.marqueeCircuitMats[c].emissive.setHex(circuitHex);
          if (this.marqueeHaloMats[c]) {
            this.marqueeHaloMats[c].color.setHex(circuitHex);
            this.marqueeHaloMats[c].opacity = 0.2 + glow * 0.72;
          }
        }
      } else if (this.activeSeason === 3) {
        // Season 3: Royal 24K Gold vs Jewel Emerald opposing pulse
        const wave = Math.sin(this.elapsedSec * 3.4 * rateScale);
        for (let c = 0; c < 4; c++) {
          const glow = c % 2 === 0 ? 0.5 + 0.5 * wave : 0.5 - 0.5 * wave;
          const circuitHex = this.marqueeCircuitHexes[c] ?? 0xf2a922;
          baseColor.setHex(circuitHex);
          if (glow > 0.62) {
            baseColor.lerp(hotCrest, 0.35);
          }
          this.marqueeCircuitMats[c].emissiveIntensity = 0.38 + glow * 1.85;
          this.marqueeCircuitMats[c].color.copy(baseColor);
          this.marqueeCircuitMats[c].emissive.setHex(circuitHex);
          if (this.marqueeHaloMats[c]) {
            this.marqueeHaloMats[c].color.setHex(circuitHex);
            this.marqueeHaloMats[c].opacity = 0.18 + glow * 0.74;
          }
        }
      } else if (this.activeSeason === 4) {
        // Season 4: Brisk 4-Color Kaleidoscope Quad Wave (Cobalt, Starlight White, Gold, Cyan)
        const chasePos = (this.elapsedSec * 6.2 * rateScale) % 4;
        for (let c = 0; c < 4; c++) {
          let dist = Math.abs(chasePos - c);
          if (dist > 2) dist = 4 - dist;
          const glow = Math.max(0, 1 - dist * 0.68);
          const circuitHex = this.marqueeCircuitHexes[c] ?? 0x3b82f6;
          baseColor.setHex(circuitHex);
          if (glow > 0.6) {
            baseColor.lerp(hotCrest, 0.3);
          }
          this.marqueeCircuitMats[c].emissiveIntensity = 0.45 + glow * 1.75;
          this.marqueeCircuitMats[c].color.copy(baseColor);
          this.marqueeCircuitMats[c].emissive.setHex(circuitHex);
          if (this.marqueeHaloMats[c]) {
            this.marqueeHaloMats[c].color.setHex(circuitHex);
            this.marqueeHaloMats[c].opacity = 0.22 + glow * 0.72;
          }
        }
      } else {
        // Season 1: Classic Smooth 4-Circuit 2700K Tungsten Marquee Chase
        const chasePos = (this.elapsedSec * (this.reducedMotion ? 1.2 : 4.2)) % 4;
        for (let c = 0; c < 4; c++) {
          let dist = Math.abs(chasePos - c);
          if (dist > 2) dist = 4 - dist;
          const glow = Math.max(0, 1 - dist * 0.72);
          const circuitHex = this.marqueeCircuitHexes[c] ?? 0xffd56b;
          this.marqueeCircuitMats[c].emissiveIntensity = 0.36 + glow * 1.65;
          this.marqueeCircuitMats[c].color.setHex(glow > 0.55 ? 0xfff5d0 : circuitHex);
          this.marqueeCircuitMats[c].emissive.setHex(circuitHex);
          if (this.marqueeHaloMats[c]) {
            this.marqueeHaloMats[c].color.setHex(circuitHex);
            this.marqueeHaloMats[c].opacity = 0.16 + glow * 0.74;
          }
        }
      }
    }

    // 2d. Animate `ROVING_SPOTLIGHT` Multi-Beam Stage Follow-Spots!
    if (this.rovingSpotBeams.length > 0) {
      for (let s = 0; s < this.rovingSpotBeams.length; s++) {
        const beam = this.rovingSpotBeams[s];
        const targetIdx =
          s < this.activeSpotlightIndices.length ? this.activeSpotlightIndices[s] : undefined;
        const tNode = targetIdx !== undefined ? this.tiles[targetIdx] : undefined;
        const active =
          Boolean(tNode) && (tNode!.state === 'OPEN' || tNode!.state === 'BLITZ_SURVIVOR');

        if (active && tNode) {
          const goal = new THREE.Vector3(tNode.x, tNode.tierY, tNode.z);
          if (beam.alpha < 0.04) {
            beam.pos.copy(goal);
          } else {
            beam.pos.lerp(goal, Math.min(1, dt * 11));
          }
          beam.group.position.copy(beam.pos);
        }
        const goalAlpha = active ? 1.0 : 0.0;
        beam.alpha += (goalAlpha - beam.alpha) * Math.min(1, dt * 12);
        beam.group.visible = beam.alpha > 0.015;
        const pulse = 0.9 + 0.1 * Math.sin(this.elapsedSec * 4.8 + s * 1.3);
        beam.coneMat.opacity = beam.alpha * 0.24 * pulse;
        beam.ringMat.opacity = beam.alpha * 0.62 * pulse;
      }
    }

    // 2c. Animate Vertical Studio Follow-Spotlight Hover Beam (glides cleanly onto hovered/targeted tile!)
    if (this.hoverSpotBeamGroup && this.hoverSpotConeMat && this.hoverSpotRingMat) {
      const spotTileIdx =
        rivalLiftTileIndex !== null
          ? rivalLiftTileIndex
          : this.hoveredTileIndex !== null
            ? this.hoveredTileIndex
            : null;
      const spotTile = spotTileIdx !== null ? this.tiles[spotTileIdx] : undefined;
      const spotActive =
        Boolean(spotTile) && (spotTile!.state === 'OPEN' || spotTile!.state === 'BLITZ_SURVIVOR');

      if (spotActive && spotTile) {
        const goalSpot = new THREE.Vector3(spotTile.x, spotTile.tierY, spotTile.z);
        if (this.hoverSpotAlpha < 0.04) {
          this.hoverSpotPos.copy(goalSpot);
        } else {
          this.hoverSpotPos.lerp(goalSpot, Math.min(1, dt * 16));
        }
        this.hoverSpotBeamGroup.position.copy(this.hoverSpotPos);

        // Tint vertical spotlight to hovered tile's 1966 Living Color or TV Twist signature!
        let targetHex = LIVING_COLOR_DOMAIN_PALETTE_V7[spotTile.domain].primaryHexNum;
        if (rivalLiftTileIndex !== null) {
          targetHex = 0xff4d4d;
        } else if (spotTile.tvTwist === 'MYSTERY_CURTAIN') {
          targetHex = 0xff6da3;
        } else if (
          spotTile.tvTwist === 'LOCKED_VAULT' ||
          (spotTile.tvTwist === 'SECRET_SQUARE' &&
            this.twistsEngine.isSecretSquareRevealed(spotTile.index))
        ) {
          targetHex = 0xffd56b;
        } else if (spotTile.tvTwist === 'OPPONENT_CHOICE') {
          targetHex = 0xf47295;
        }
        this.hoverSpotColor.lerp(new THREE.Color(targetHex), Math.min(1, dt * 12));
        this.hoverSpotConeMat.color.copy(this.hoverSpotColor);
        this.hoverSpotRingMat.color.copy(this.hoverSpotColor);
      }

      const targetAlpha = spotActive ? 1.0 : 0.0;
      this.hoverSpotAlpha += (targetAlpha - this.hoverSpotAlpha) * Math.min(1, dt * 14);
      this.hoverSpotBeamGroup.visible = this.hoverSpotAlpha > 0.015;
      const shimmer = 0.92 + 0.08 * Math.sin(this.elapsedSec * 6.2);
      this.hoverSpotConeMat.opacity = this.hoverSpotAlpha * 0.42 * shimmer;
      this.hoverSpotRingMat.opacity = this.hoverSpotAlpha * 0.52 * shimmer;
    }

    // Portrait Upstage Centerpiece Crest Spinner
    if (this.portraitCrestSpinner) {
      this.portraitCrestSpinner.rotation.z += dt * 0.85 * motionScale;
    }

    // 3. Animate Canonical Socket Widgets (`CornerTotem` & `FlankSwitch` Toby's Mercy Lever)
    if (this.cornerTotemSpinGroup) {
      this.cornerTotemSpinGroup.rotation.y += dt * 1.1 * motionScale;
    }
    if (this.mercyLeverArmGroup) {
      const targetLeverAngle = gState.mercySwitchPulled ? 0.68 : -0.45;
      this.mercyLeverCurrentAngle +=
        (targetLeverAngle - this.mercyLeverCurrentAngle) * Math.min(1, dt * 12);
      this.mercyLeverArmGroup.rotation.x = this.mercyLeverCurrentAngle;
    }

    // 4. Animate All 12 Board-Specific Moving Contraption Mechanisms
    // Board 01: Dual spinning vinyl platters + Crossfader slider thumb + 10-segment VU Deck Strip
    for (let i = 0; i < this.vinylPlatters.length; i++) {
      const activeDeckBoost =
        (i === 0 && gState.crossfaderPosition <= 0) || (i === 1 && gState.crossfaderPosition >= 0)
          ? 3.49 // 33.3 RPM!
          : 1.1;
      this.vinylPlatters[i].rotation.y -= dt * activeDeckBoost * motionScale;
    }
    if (this.crossfaderThumbGroup) {
      const targetThumbX = gState.crossfaderPosition * 0.35;
      this.crossfaderThumbGroup.position.x +=
        (targetThumbX - this.crossfaderThumbGroup.position.x) * Math.min(1, dt * 14);
    }
    for (let s = 0; s < this.crossfaderVuMats.length; s++) {
      const bias =
        gState.crossfaderPosition === -1
          ? s < 5
            ? 1.0
            : 0.35
          : gState.crossfaderPosition === 1
            ? s >= 5
              ? 1.0
              : 0.35
            : 0.78;
      const wave = 0.5 + 0.5 * Math.sin(this.elapsedSec * 7.5 - Math.abs(s - 4.5) * 0.9);
      this.crossfaderVuMats[s].emissiveIntensity = (0.25 + wave * 0.95) * bias;
    }

    // Board 02: Glowing Honeycomb Light-Bridges + Polarity Bus Focus + Twin Counter-Rotating Jubilee Starburst Spinners!
    for (let i = 0; i < this.jubileeStarbursts.length; i++) {
      this.jubileeStarbursts[i].rotation.y += dt * (i === 0 ? 0.95 : -0.95) * motionScale;
    }
    const polPhase = gState.bridgePolarityPhase ?? 0;
    for (let i = 0; i < this.hexBridgePulseMats.length; i++) {
      const link = this.hexBridgeLinks[i];
      const a = link ? this.tiles[link.indexA] : undefined;
      const b = link ? this.tiles[link.indexB] : undefined;
      const hot = a?.state === 'CLAIMED_PLAYER' || b?.state === 'CLAIMED_PLAYER';
      const midX = a && b ? (a.x + b.x) * 0.5 : 0;
      const polarityEnergized =
        (polPhase === 1 && midX < -0.32) ||
        (polPhase === 2 && midX > 0.32) ||
        (polPhase === 0 && Math.abs(midX) <= 0.48);
      const pulse = 0.5 + 0.5 * Math.sin(this.elapsedSec * (hot ? 6.2 : polarityEnergized ? 4.4 : 2.6) - i * 0.55);
      this.hexBridgePulseMats[i].emissiveIntensity = hot
        ? 0.8 + pulse * 1.1
        : polarityEnergized
          ? 0.58 + pulse * 0.72
          : 0.22 + pulse * 0.36;
      this.hexBridgePulseMats[i].emissive.setHex(hot ? 0xffc84a : polarityEnergized ? 0x33cad8 : 0x0098a6);
    }

    // Board 03: Three meshing 20° brass escapement gears + Prize-Wheel Rims + Brass Flapper Clicker!
    if (this.vaudevilleGears.length > 0) {
      const targetGearAngle = gState.gearPhase * ((Math.PI * 2) / 9) + this.elapsedSec * 0.32 * motionScale;
      this.currentGearAngle += (targetGearAngle - this.currentGearAngle) * Math.min(1, dt * 8);
      for (let i = 0; i < this.vaudevilleGears.length; i++) {
        const vg = this.vaudevilleGears[i];
        vg.group.rotation.y = this.currentGearAngle * vg.ratio;
        if (this.vaudevilleWheelRings[i]) {
          this.vaudevilleWheelRings[i].rotation.y = -this.currentGearAngle * vg.ratio * 0.65;
        }
      }
    }
    if (this.vaudevilleFlapperArm) {
      const tickPulse = Math.pow(Math.abs(Math.sin(this.currentGearAngle * 6)), 4);
      this.vaudevilleFlapperArm.rotation.y = tickPulse * 0.28 * motionScale;
    }

    // Board 04: Reciprocating brass crossbar selector rods, stepped domain jewel lamps & chasing relay strips
    const activeDomainIdx = (gState.switchboardDomainIndex ?? 0) % 4;
    for (let i = 0; i < this.switchboardRods.length; i++) {
      const stepBias = (activeDomainIdx - 1.5) * 0.08;
      const sway = Math.sin(this.elapsedSec * 1.8 + i * Math.PI + gState.turnCounter) * 0.07 * motionScale;
      this.switchboardRods[i].position.x = sway + stepBias;
    }
    for (let i = 0; i < this.switchboardLamps.length; i++) {
      const isStepped = i % 4 === activeDomainIdx;
      this.switchboardLamps[i].emissiveIntensity = isStepped
        ? 1.55 + 0.45 * Math.sin(this.elapsedSec * 4.2)
        : 0.32 + 0.22 * Math.abs(Math.sin(this.elapsedSec * 2.4 + i * 1.1));
    }
    if (this.switchboardRelayMats.length > 0) {
      const lampsPerSide = Math.max(1, Math.floor(this.switchboardRelayMats.length / 2));
      const relayIdx = Math.floor(this.elapsedSec * 6.5) % lampsPerSide;
      for (let i = 0; i < this.switchboardRelayMats.length; i++) {
        const local = i % lampsPerSide;
        this.switchboardRelayMats[i].emissiveIntensity = local === relayIdx ? 1.55 : 0.22;
      }
    }

    // Board 05: 8Hz Larson chasing ring + 2700K bulb halation + Spinning Prize-Wheel Rim Halo + Pass-Spin Brass Paddle
    if (this.larsonBulbMats.length > 0) {
      const chaseIdx = Math.floor(this.elapsedSec * 8) % this.larsonBulbMats.length;
      for (let i = 0; i < this.larsonBulbMats.length; i++) {
        const dist =
          (chaseIdx - i + this.larsonBulbMats.length) % this.larsonBulbMats.length;
        const intensity = dist === 0 ? 1.95 : dist === 1 ? 1.05 : dist === 2 ? 0.48 : 0.16;
        this.larsonBulbMats[i].emissiveIntensity = intensity;
        if (this.larsonHaloSprites[i]) {
          this.larsonHaloSprites[i].material.opacity =
            dist === 0 ? 0.9 : dist === 1 ? 0.52 : dist === 2 ? 0.26 : 0.08;
        }
      }
    }
    if (this.larsonPrizeWheelRim) {
      this.larsonPrizeWheelRim.rotation.y +=
        dt * (0.55 + this.spinPaddleBounce * 3.8) * motionScale;
    }
    if (this.spinPaddleArm) {
      this.spinPaddleBounce = Math.max(0, this.spinPaddleBounce - dt * 4.5);
      this.spinPaddleArm.position.y = 0.06 - Math.sin(this.spinPaddleBounce * Math.PI) * 0.026;
    }

    // Board 06: Sprung brass pop-bumpers + Chasing Pier Chevrons + Spinning Steel-Pier Ferris Wheel!
    for (const bumper of this.pinballBumpers) {
      if (bumper.pulse > 0) {
        bumper.pulse = Math.max(0, bumper.pulse - dt * 5.0);
        const punch = Math.sin(bumper.pulse * Math.PI);
        bumper.capGroup.position.y = -punch * 0.024;
        bumper.capGroup.scale.setScalar(1 + punch * 0.08);
      } else {
        bumper.capGroup.position.y = 0;
        bumper.capGroup.scale.setScalar(1);
      }
    }
    if (this.pierChevronMats.length > 0) {
      const chevIdx = Math.floor(this.elapsedSec * 5.5) % this.pierChevronMats.length;
      for (let c = 0; c < this.pierChevronMats.length; c++) {
        this.pierChevronMats[c].emissiveIntensity = c === chevIdx ? 1.65 : 0.28;
      }
    }
    if (this.pierFerrisGroup) {
      this.pierFerrisGroup.rotation.z -= dt * 0.72 * motionScale;
    }

    // Board 07: Sliding Baccarat Sabotage Shoe + 21-point gauge needle + Spinning Monte Carlo Roulette Wheel & Ivory Ball!
    if (this.baccaratShoeCarriage) {
      const targetZ = 0.42 - (gState.baccaratShoeTotal / 21) * 0.24;
      this.baccaratShoeCarriage.position.z +=
        (targetZ - this.baccaratShoeCarriage.position.z) * Math.min(1, dt * 8);
    }
    if (this.baccaratNeedleGroup) {
      const norm21 = Math.min(1, Math.max(0, gState.baccaratShoeTotal / 21));
      const targetNeedleRot = (norm21 - 0.5) * Math.PI * 0.86;
      this.baccaratNeedleGroup.rotation.y +=
        (targetNeedleRot - this.baccaratNeedleGroup.rotation.y) * Math.min(1, dt * 10);
    }
    if (this.rouletteWheelGroup) {
      this.rouletteWheelGroup.rotation.y += dt * 1.45 * motionScale;
    }
    if (this.rouletteBallOrbitGroup) {
      this.rouletteBallOrbitGroup.rotation.y -= dt * 3.15 * motionScale;
    }

    // Board 08: Rotating brass meridian sundial gnomon arm + 1965 World's Fair Orbiting Atomic Rings!
    if (this.sundialArmGroup) {
      const targetAngle = -gState.sundialAngleRad;
      let diff = targetAngle - this.sundialArmGroup.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.sundialArmGroup.rotation.y += diff * Math.min(1, dt * 7);
    }
    for (let i = 0; i < this.atomicOrbitRings.length; i++) {
      const speed = (1.25 + i * 0.55) * (i % 2 === 0 ? 1 : -1) * motionScale;
      this.atomicOrbitRings[i].rotation.z += dt * speed;
      this.atomicOrbitRings[i].rotation.y += dt * 0.32 * motionScale;
    }

    // Board 09: UHF Carrier Tuning Knob + twin swaying VU needles + Spinning Radar Dish & Vacuum-Tube Glow!
    if (this.uhfKnobGroup) {
      const domainIdx = ['SCI_TECH', 'POP_LIT', 'NUM_GEO', 'HIST_FACT'].indexOf(
        gState.tunedUhfDomain,
      );
      const targetRot = (domainIdx - 1.5) * 0.72;
      this.uhfKnobGroup.rotation.y +=
        (targetRot - this.uhfKnobGroup.rotation.y) * Math.min(1, dt * 12);
    }
    for (let i = 0; i < this.uhfNeedles.length; i++) {
      const sway =
        Math.sin(this.elapsedSec * (3.1 + i * 1.3)) * 0.34 * motionScale +
        (i === 0 ? 0.18 : -0.12);
      this.uhfNeedles[i].rotation.y = sway;
    }
    if (this.uhfRadarDishGroup) {
      this.uhfRadarDishGroup.rotation.y += dt * 1.6 * motionScale;
    }
    for (let i = 0; i < this.uhfTubeFilamentMats.length; i++) {
      this.uhfTubeFilamentMats[i].emissiveIntensity =
        0.9 + 0.45 * Math.sin(this.elapsedSec * 4.2 + i * 1.6);
    }

    // Board 10: 3-axis Sovereign Astrolabe + Flanking Starburst Crowns + Glowing Terrace Steps!
    for (let i = 0; i < this.zigguratAstrolabeRings.length; i++) {
      const ring = this.zigguratAstrolabeRings[i];
      if (i === 0) ring.rotation.y += dt * 0.85 * motionScale;
      else if (i === 1) ring.rotation.x += dt * 1.15 * motionScale;
      else ring.rotation.z += dt * 1.45 * motionScale;
    }
    for (let i = 0; i < this.zigguratCrownSpinners.length; i++) {
      this.zigguratCrownSpinners[i].rotation.y += dt * (i === 0 ? 1.1 : -1.1) * motionScale;
    }
    const focusTier = gState.zigguratFocusTier ?? 0;
    for (let i = 0; i < this.zigguratStepGlowMats.length; i++) {
      const isFocusedStrip = (focusTier === 0 && i === 1) || (focusTier === 1 && i === 0);
      this.zigguratStepGlowMats[i].emissiveIntensity = isFocusedStrip
        ? 1.45 + 0.45 * Math.sin(this.elapsedSec * 4.2)
        : 0.55 + 0.25 * Math.sin(this.elapsedSec * 2.8 + i * 1.4);
    }

    // Board 11: Whew! Gauntlet blockade pins + Recon Column Spotlight Bar!
    const reconCol = (gState.gauntletReconColumn ?? 0) % 5;
    for (let i = 0; i < this.gauntletBlockadePins.length; i++) {
      const pin = this.gauntletBlockadePins[i];
      const nearRecon = i === reconCol || i + 1 === reconCol;
      pin.mat.emissiveIntensity = nearRecon
        ? 1.15 + 0.45 * Math.abs(Math.sin(this.elapsedSec * 4.5 + i))
        : 0.42 + 0.38 * Math.abs(Math.sin(this.elapsedSec * 3.4 + i));
    }
    if (this.gauntletScannerMats.length > 0) {
      const reconPos = (reconCol / 4) * Math.max(1, this.gauntletScannerMats.length - 1);
      const scanPos =
        reconPos * 0.65 +
        (Math.sin(this.elapsedSec * 3.2) * 0.5 + 0.5) * (this.gauntletScannerMats.length - 1) * 0.35;
      for (let s = 0; s < this.gauntletScannerMats.length; s++) {
        const proximity = Math.max(0, 1 - Math.abs(scanPos - s) * 0.85);
        this.gauntletScannerMats[s].emissiveIntensity = 0.25 + proximity * 1.65;
      }
    }

    // Board 12: Live tilting ±4.5° balance beam + Equilibrium Calibration Arc + Counter-Swinging Balance Rings!
    if (this.activeBoardId === 'BOARD_12_PENDULUM_BALANCE') {
      const targetTiltRad = -(gState.pendulumTiltDeg * Math.PI) / 180;
      this.currentBeamTiltRad += (targetTiltRad - this.currentBeamTiltRad) * Math.min(1, dt * 6);
      this.balanceBeamGroup.rotation.z = this.currentBeamTiltRad;
      if (this.pendulumBobGroup) {
        this.pendulumBobGroup.rotation.z = -this.currentBeamTiltRad * 1.8;
      }
      if (this.pendulumEquilibriumMat) {
        const balanced = Math.abs(gState.pendulumTiltDeg) <= 0.6;
        this.pendulumEquilibriumMat.emissive.setHex(balanced ? 0x16a34a : 0xeb5b28);
        this.pendulumEquilibriumMat.color.setHex(balanced ? 0x4ade80 : 0xff8a5c);
        this.pendulumEquilibriumMat.emissiveIntensity =
          0.75 + 0.4 * Math.abs(Math.sin(this.elapsedSec * 3.5));
      }
      for (let i = 0; i < this.pendulumSideRings.length; i++) {
        this.pendulumSideRings[i].rotation.y += dt * (i === 0 ? 1.15 : -1.15) * motionScale;
      }
    } else {
      this.balanceBeamGroup.rotation.z = 0;
    }
  }

  // --------------------------------------------------------------------------
  // State Inspection & World-Space Coordinate Helpers
  // --------------------------------------------------------------------------

  public getActiveBoardId(): BoardIdV7 {
    return this.activeBoardId;
  }

  public getActiveBoardSpec(): BoardSpecV7 {
    return BOARD_SPECS_V7[this.activeBoardId];
  }

  public getActiveTwistId(): BoardTwistIdV7 {
    return this.activeTwistId;
  }

  public getTiles(): readonly BoardTileNodeV7[] {
    return this.tiles;
  }

  public getTile(tileIndex: number): BoardTileNodeV7 | undefined {
    return this.tiles[tileIndex];
  }

  public getTileWorldPosition(tileIndex: number, target = new THREE.Vector3()): THREE.Vector3 {
    const rig = this.tileRigs[tileIndex];
    if (!rig) return target.set(0, this.isPortraitMode ? PORTRAIT_PIVOT_Y : TABLE_PIVOT_Y, 0);
    this.rootGroup.updateMatrixWorld(true);
    return rig.liftGroup.getWorldPosition(target);
  }

  /**
   * Returns exact live world-space bounding boxes for both the full 3D chassis
   * and the active tile playfield so camera auto-fitters frame Portrait & Tablet
   * Tote Racks edge-to-edge with millimeter precision!
   */
  public getBoardBounds(): BoardBoundsV7 {
    this.rootGroup.updateMatrixWorld(true);
    const worldBox = new THREE.Box3().setFromObject(this.rakedChassisGroup);
    const tilePlayfieldBox = new THREE.Box3();
    for (const rig of this.tileRigs) {
      if (rig.node.state !== 'RETRACTED') {
        tilePlayfieldBox.expandByObject(rig.rootGroup);
      }
    }
    if (tilePlayfieldBox.isEmpty()) {
      tilePlayfieldBox.copy(worldBox);
    }
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    worldBox.getSize(size);
    worldBox.getCenter(center);

    const width = this.isPortraitMode ? PORTRAIT_BED_WIDTH : TABLE_BED_WIDTH;
    const depth = this.isPortraitMode
      ? this.getActivePortraitDepth(this.tiles.length || BOARD_SPECS_V7[this.activeBoardId].slots.length)
      : TABLE_BED_DEPTH;

    return {
      isPortrait: this.isPortraitMode,
      width,
      depth,
      rakeRad: this.isPortraitMode ? PORTRAIT_RAKE_RAD : TABLE_RAKE_RAD,
      pivotY: this.isPortraitMode ? PORTRAIT_PIVOT_Y : TABLE_PIVOT_Y,
      worldBox,
      tilePlayfieldBox,
      size,
      center,
    };
  }
}
