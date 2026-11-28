// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/boards/BoardTwistsEngineV7.ts`
// All 16 Live-Wired Board Twists (Zero Placebo Banners), Piece-3 Multiplier Cap
// (`<= 2.0x` Cold / `<= 3.0x` Streaking), Amber Chalk Truce Trust Ledger,
// Rival Wheelhouse Weak-Spot Bounty, Solenoid Rigged Gambit, Toby's Mercy
// Switch Discharge & Keep-4-Keystones (`5:10`) Solenoid Blitz Re-Rack!
// ============================================================================

import {
  ALL_BOARD_PLAY_MODES_R7_V9,
  ALL_BOARD_PLAY_MODES_V9,
  ALL_CATEGORIES_V7,
  ALL_RIVAL_IDS_V7,
  BOARD_PLAY_MODE_TITLES_V9,
  CATEGORY_TO_DOMAIN_V7,
  type BoardIdV7,
  type BoardPlayModeR7V9,
  type BoardPlayModeV9,
  type BoardTileNodeV7,
  type BoardTwistIdV7,
  type BoardUnlockTopologyV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type ClassicTvTileTwistV9,
  type CpuPlaystyleIdV7,
  type CpuTemperamentIdV7,
  type DifficultyModeV7,
  type DomainIdV7,
  type RivalIdV7,
  type SeasonIdV7,
  type SweepsNightNumberV9,
  type VibePackIdV9,
  type VipCelebIdV9,
} from '../contracts_v7';
import { CAST_PROFILES_V7 } from '../campaign/CastAndRelicsCatalogV7';
import { VIBE_PACK_CATEGORIES_V9, VIP_CELEB_CATALOG_V9 } from '../../v9/ShowroomAndCatalogsV9';

// ----------------------------------------------------------------------------
// 1. Canonical 16-Twist Specification Catalog (`BOARD_TWIST_SPECS_V7`)
// ----------------------------------------------------------------------------

export interface BoardTwistSpecV7 {
  readonly id: BoardTwistIdV7;
  readonly name: string;
  readonly shortRule: string;
  readonly iconGlyph: string;
  readonly homeBoardId: BoardIdV7;
  readonly accentHex: string;
}

export const BOARD_TWIST_SPECS_V7: Record<BoardTwistIdV7, BoardTwistSpecV7> = {
  TWIST_01_CROSSFADER_BOOST: {
    id: 'TWIST_01_CROSSFADER_BOOST',
    name: 'Studio 6A Crossfader Deck',
    shortRule: 'Slide the 3D Crossfader Left or Right to route +0.35x Mult & +35 Chips to that deck.',
    iconGlyph: '🎚',
    homeBoardId: 'BOARD_01_FUNK_CROSSFADER',
    accentHex: '#F4A91F',
  },
  TWIST_02_HEX_BRIDGE_CHAIN: {
    id: 'TWIST_02_HEX_BRIDGE_CHAIN',
    name: 'Hollywood Squares Light-Bridge',
    shortRule: 'Adjacent claimed hexes ignite glowing light-bridges for +0.25x Mult & +40 Chips per link.',
    iconGlyph: '⬡',
    homeBoardId: 'BOARD_02_JUBILEE_HEX_BRIDGE',
    accentHex: '#0096A6',
  },
  TWIST_03_ESCAPEMENT_TICK_SHIFT: {
    id: 'TWIST_03_ESCAPEMENT_TICK_SHIFT',
    name: 'Burbank Pop-Art Prize Spin',
    shortRule: 'Spinning 1966 Pop-Art prize wheels advance each turn, boosting aligned phase tiles by +0.40x Mult.',
    iconGlyph: '🎡',
    homeBoardId: 'BOARD_03_VAUDEVILLE_GEAR_TRAIN',
    accentHex: '#E63B7A',
  },
  TWIST_04_SUPERVISORY_RELAY_PAIR: {
    id: 'TWIST_04_SUPERVISORY_RELAY_PAIR',
    name: '$64,000 Relay Pair',
    shortRule: 'Completing a lit studio switchboard pair triggers +0.45x Mult & +75 Supervisory Chips.',
    iconGlyph: '🔌',
    homeBoardId: 'BOARD_04_MAHOGANY_SWITCHBOARD',
    accentHex: '#1E56C5',
  },
  TWIST_05_LARSON_HOT_SPOT: {
    id: 'TWIST_05_LARSON_HOT_SPOT',
    name: 'Apollo Color-Ring Hot-Spot',
    shortRule: 'Catch the chasing marquee hot-spot for +0.50x Mult & +60 Chips, or tap Paddle to pass spin.',
    iconGlyph: '💡',
    homeBoardId: 'BOARD_05_LARSON_SPIN_RING',
    accentHex: '#F4A91F',
  },
  TWIST_06_PINBALL_BUMPER_RICOCHET: {
    id: 'TWIST_06_PINBALL_BUMPER_RICOCHET',
    name: 'Steel Pier Bumper Ricochet',
    shortRule: 'Tiles bordering charged brass pop-bumpers ricochet for +0.35x Mult & +50 Bumper Chips.',
    iconGlyph: '⚡',
    homeBoardId: 'BOARD_06_BOARDWALK_PINBALL',
    accentHex: '#FF6738',
  },
  TWIST_07_BACCARAT_NATURAL_21: {
    id: 'TWIST_07_BACCARAT_NATURAL_21',
    name: 'Monte Carlo Natural 21',
    shortRule: 'Push the Royale Shoe gauge into 18–21 without busting for up to +0.75x Mult & +120 Chips.',
    iconGlyph: '♠',
    homeBoardId: 'BOARD_07_MONTE_CARLO_SHOE',
    accentHex: '#0096A6',
  },
  TWIST_08_SOLAR_MERIDIAN_SWEEP: {
    id: 'TWIST_08_SOLAR_MERIDIAN_SWEEP',
    name: "World's Fair Atomic Meridian",
    shortRule: 'Rotating Unisphere meridian arm casts a golden bonus arc granting +0.40x Mult & +50 Chips.',
    iconGlyph: '☀',
    homeBoardId: 'BOARD_08_GEODESIC_SUNDIAL',
    accentHex: '#F4A91F',
  },
  TWIST_09_PIRATE_CARRIER_LOCK: {
    id: 'TWIST_09_PIRATE_CARRIER_LOCK',
    name: 'Channel 83 Carrier Lock',
    shortRule: 'Tune the 3D Broadcast Dial to lock a domain band for +0.40x Mult & +55 Bonus Chips.',
    iconGlyph: '📡',
    homeBoardId: 'BOARD_09_PIRATE_UHF_DECK',
    accentHex: '#0096A6',
  },
  TWIST_10_ZIGGURAT_APEX_CROWN: {
    id: 'TWIST_10_ZIGGURAT_APEX_CROWN',
    name: 'Prime-Time Showcase Crown',
    shortRule: 'Climb stepped broadcast tiers (+0.15x / +0.35x / +0.65x Top Crown + +100 Chips).',
    iconGlyph: '▲',
    homeBoardId: 'BOARD_10_SOVEREIGN_ZIGGURAT',
    accentHex: '#F4A91F',
  },
  TWIST_11_GAUNTLET_BLOCKADE_BREACH: {
    id: 'TWIST_11_GAUNTLET_BLOCKADE_BREACH',
    name: 'Coast-to-Coast Breach',
    shortRule: 'Flank Rival blockade pins (+0.45x) and breach the top Gold Gauntlet row (+0.65x & +110 Chips).',
    iconGlyph: '🛡',
    homeBoardId: 'BOARD_11_WHEW_GAUNTLET',
    accentHex: '#FF6738',
  },
  TWIST_12_FULCRUM_EQUILIBRIUM: {
    id: 'TWIST_12_FULCRUM_EQUILIBRIUM',
    name: 'Deal Scale Equilibrium',
    shortRule: 'Claim tiles on the lighter arm of the live ±4.5° deal beam for +0.50x Mult & +70 Chips.',
    iconGlyph: '⚖',
    homeBoardId: 'BOARD_12_PENDULUM_BALANCE',
    accentHex: '#1E56C5',
  },
  TWIST_13_AMBER_CHALK_TRUCE: {
    id: 'TWIST_13_AMBER_CHALK_TRUCE',
    name: 'Gentleman’s Truce Ring',
    shortRule: 'Respect Gold Chalk rings for +0.35x Honor Mult; poaching breaks your Rival’s trust!',
    iconGlyph: '◎',
    homeBoardId: 'BOARD_04_MAHOGANY_SWITCHBOARD',
    accentHex: '#F4A91F',
  },
  TWIST_14_RIVAL_WHEELHOUSE_BOUNTY: {
    id: 'TWIST_14_RIVAL_WHEELHOUSE_BOUNTY',
    name: 'Champion Weak-Spot Bounty',
    shortRule: "Attack the Champion's 3 weak categories (Totem-marked) for +0.50x Bounty Mult & +60 Chips.",
    iconGlyph: '🎯',
    homeBoardId: 'BOARD_02_JUBILEE_HEX_BRIDGE',
    accentHex: '#FF6738',
  },
  TWIST_15_SOLENOID_RIGGED_GAMBIT: {
    id: 'TWIST_15_SOLENOID_RIGGED_GAMBIT',
    name: 'Hot-Wired Relay Gambit',
    shortRule: 'Buzzing hot-wired tiles pay +0.65x Mult & +100 Chips raw—or pull the Safety Switch to disarm.',
    iconGlyph: '⚡',
    homeBoardId: 'BOARD_09_PIRATE_UHF_DECK',
    accentHex: '#FF6738',
  },
  TWIST_16_DOUBLE_STAKE_CORNER: {
    id: 'TWIST_16_DOUBLE_STAKE_CORNER',
    name: 'Double-Stake Keystones',
    shortRule: 'Outer corner keystones carry +120 Chips & +0.55x Mult (+0.25x link with 2+ corners).',
    iconGlyph: '❖',
    homeBoardId: 'BOARD_10_SOVEREIGN_ZIGGURAT',
    accentHex: '#F4A91F',
  },
};

export const ALL_BOARD_TWIST_IDS_V7: readonly BoardTwistIdV7[] = Object.keys(
  BOARD_TWIST_SPECS_V7,
) as BoardTwistIdV7[];

// ----------------------------------------------------------------------------
// 2. Canonical 24-Champion Weak/Strong/Playstyle/Temperament Runtime Helpers
//    (100% Lazy Runtime Access into `CAST_PROFILES_V7` — ZERO Top-Level Module
//    Evaluation Across Rollup `v7-boards` <-> `v7-campaign-ui` Chunks!)
// ----------------------------------------------------------------------------

let cachedSympatheticSet: ReadonlySet<RivalIdV7> | null = null;

export function getSympatheticRivalsSetV7(): ReadonlySet<RivalIdV7> {
  if (!cachedSympatheticSet) {
    cachedSympatheticSet = new Set<RivalIdV7>(
      ALL_RIVAL_IDS_V7.filter((id) => CAST_PROFILES_V7[id]?.role === 'RIVAL_SYMPATHETIC'),
    );
  }
  return cachedSympatheticSet;
}

export function getRivalWeakCategoriesV7(id: RivalIdV7): readonly CategoryIdV7[] {
  return (
    CAST_PROFILES_V7[id]?.weakCategories ??
    CAST_PROFILES_V7.CARMEN_DELGADO?.weakCategories ??
    ['PHYSICS', 'FINANCE', 'ENGINES']
  );
}

export function getRivalStrongCategoriesV7(id: RivalIdV7): readonly CategoryIdV7[] {
  return (
    CAST_PROFILES_V7[id]?.strongCategories ??
    CAST_PROFILES_V7.CARMEN_DELGADO?.strongCategories ??
    ['MEDICINE', 'CHEMISTRY', 'CUISINE']
  );
}

export function getRivalPlaystyleV7(id: RivalIdV7): CpuPlaystyleIdV7 {
  return CAST_PROFILES_V7[id]?.playstyle ?? 'PROFESSOR';
}

export function getRivalTemperamentV7(id: RivalIdV7): CpuTemperamentIdV7 {
  return CAST_PROFILES_V7[id]?.temperament ?? 'STEADY';
}

export const RIVAL_SYMPATHETIC_SET_V7: Pick<ReadonlySet<RivalIdV7>, 'has'> = {
  has(id: RivalIdV7): boolean {
    return getSympatheticRivalsSetV7().has(id);
  },
};

export const DEFAULT_RIVAL_WEAK_CATEGORIES_V7: Record<RivalIdV7, readonly CategoryIdV7[]> =
  new Proxy({} as Record<RivalIdV7, readonly CategoryIdV7[]>, {
    get(_target, prop): readonly CategoryIdV7[] {
      return getRivalWeakCategoriesV7(String(prop) as RivalIdV7);
    },
  });

export const DEFAULT_RIVAL_STRONG_CATEGORIES_V7: Record<RivalIdV7, readonly CategoryIdV7[]> =
  new Proxy({} as Record<RivalIdV7, readonly CategoryIdV7[]>, {
    get(_target, prop): readonly CategoryIdV7[] {
      return getRivalStrongCategoriesV7(String(prop) as RivalIdV7);
    },
  });

export const DEFAULT_RIVAL_PLAYSTYLE_V7: Record<RivalIdV7, CpuPlaystyleIdV7> = new Proxy(
  {} as Record<RivalIdV7, CpuPlaystyleIdV7>,
  {
    get(_target, prop): CpuPlaystyleIdV7 {
      return getRivalPlaystyleV7(String(prop) as RivalIdV7);
    },
  },
);

export const DEFAULT_RIVAL_TEMPERAMENT_V7: Record<RivalIdV7, CpuTemperamentIdV7> = new Proxy(
  {} as Record<RivalIdV7, CpuTemperamentIdV7>,
  {
    get(_target, prop): CpuTemperamentIdV7 {
      return getRivalTemperamentV7(String(prop) as RivalIdV7);
    },
  },
);

// ----------------------------------------------------------------------------
// 3. Twist Runtime State, Gimmick Controls & Tile Evaluation Contracts
// ----------------------------------------------------------------------------

export interface BoardGimmickStateV7 {
  /** -1.0 (Left Deck), 0.0 (Center Split), +1.0 (Right Deck) for `BOARD_01_FUNK_CROSSFADER`. */
  crossfaderPosition: -1 | 0 | 1;
  /** 0..2 bridge polarity bus (`0` Center Spine, `1` Left Bank, `2` Right Bank) for `BOARD_02_JUBILEE_HEX_BRIDGE`. */
  bridgePolarityPhase?: 0 | 1 | 2;
  /** 0..2 gear escapement phase for `BOARD_03_VAUDEVILLE_GEAR_TRAIN`. */
  gearPhase: number;
  /** 0..3 stepped supervisory domain index for `BOARD_04_MAHOGANY_SWITCHBOARD`. */
  switchboardDomainIndex?: number;
  /** Active perimeter hot-spot tile index for `BOARD_05_LARSON_SPIN_RING`. */
  larsonHotTileIndex: number;
  /** Number of times player tapped the Pass-Spin Brass Paddle this match. */
  spinPassesUsed: number;
  /** Active charged bumper index (0..2) for `BOARD_06_BOARDWALK_PINBALL`. */
  chargedBumperIndex: number;
  /** Running Baccarat shoe pip total (0..21) for `BOARD_07_MONTE_CARLO_SHOE`. */
  baccaratShoeTotal: number;
  /** Solar meridian gnomon angle in radians (`-PI..+PI`) for `BOARD_08_GEODESIC_SUNDIAL`. */
  sundialAngleRad: number;
  /** Tuned UHF carrier domain for `BOARD_09_PIRATE_UHF_DECK`. */
  tunedUhfDomain: DomainIdV7;
  /** 0..2 focused Ziggurat terrace (`0` Apex, `1` Mid, `2` Base) for `BOARD_10_SOVEREIGN_ZIGGURAT`. */
  zigguratFocusTier?: 0 | 1 | 2;
  /** 0..4 scanned column lane for `BOARD_11_WHEW_GAUNTLET`. */
  gauntletReconColumn?: number;
  /** Live balance beam tilt in degrees (`-4.5 .. +4.5`, negative = left heavy, positive = right heavy). */
  pendulumTiltDeg: number;
  /** Tare counterweight offset (`0`, `+2.4`, `-2.4` deg) for `BOARD_12_PENDULUM_BALANCE`. */
  pendulumTareOffsetDeg?: number;
  /** Whether Toby's Mercy Switch has been pulled on the table flank this match. */
  mercySwitchPulled: boolean;
  /** Whether an Amber Chalk Truce was broken earlier this match. */
  amberTruceBroken: boolean;
  /** Turn counter incremented after each board action. */
  turnCounter: number;
  /** Human-readable readout of the latest gimmick action. */
  lastGimmickSummary?: string;
}

export {
  ALL_BOARD_PLAY_MODES_V7,
  ALL_BOARD_UNLOCK_TOPOLOGIES_V7,
  type BoardPlayModeV7,
} from '../contracts_v7';
import {
  ALL_BOARD_PLAY_MODES_V7,
  ALL_BOARD_UNLOCK_TOPOLOGIES_V7,
  type BoardPlayModeV7,
} from '../contracts_v7';

export interface BoardUnlockTopologySpecV7 {
  readonly id: BoardUnlockTopologyV7;
  readonly badge: string;
  readonly title: string;
  readonly shortRule: string;
  readonly compactRule: string;
}

export const BOARD_UNLOCK_TOPOLOGY_SPECS_V7: Record<
  BoardUnlockTopologyV7,
  BoardUnlockTopologySpecV7
> = {
  CLASSIC_OPEN: {
    id: 'CLASSIC_OPEN',
    badge: 'OPEN RACK',
    title: 'Classic Open Tote',
    shortRule: 'All dollar squares open from Turn 1 — crack the $500 Gold Vault!',
    compactRule: 'All open Turn 1',
  },
  PYRAMID_CLIMB: {
    id: 'PYRAMID_CLIMB',
    badge: '▲ PYRAMID',
    title: 'Pyramid Tier Climb',
    shortRule: 'Start on the base row and win upward to unlock higher-dollar upper tiers!',
    compactRule: 'Win base row up',
  },
  KEY_AND_SAFE: {
    id: 'KEY_AND_SAFE',
    badge: '🗝️ KEY & SAFE',
    title: 'Brass Key & Safe Vaults',
    shortRule: 'Win a 🗝️ Brass Key square to unlock a $500 Safe with 1-Turn Keyholder Shield!',
    compactRule: 'Win 🗝️ Key for Safe',
  },
  CENTER_STARBURST: {
    id: 'CENTER_STARBURST',
    badge: '✦ STARBURST',
    title: 'Center Starburst Bloom',
    shortRule: 'Claim center hub squares to radiate outward into high-stake corner keystones!',
    compactRule: 'Win center outward',
  },
  ROVING_SPOTLIGHT: {
    id: 'ROVING_SPOTLIGHT',
    badge: '🔦 SPOTLIGHT',
    title: 'Roving Follow-Spot',
    shortRule: 'Warm stage follow-spots sweep across active squares each turn (+$50 Spot Bonus)!',
    compactRule: 'Hit 🔦 Spot (+$50)',
  },
};

export interface CombinatorialBoardComboV7 {
  readonly playMode: BoardPlayModeV7;
  readonly unlockTopology: BoardUnlockTopologyV7;
  readonly boardId: BoardIdV7;
  readonly comboKey: string;
}

const PREFERRED_BOARDS_BY_PLAY_MODE_V7: Record<BoardPlayModeV7, readonly BoardIdV7[]> = {
  CLASSIC_TOTE: ['BOARD_01_FUNK_CROSSFADER', 'BOARD_04_MAHOGANY_SWITCHBOARD'],
  TIC_TAC_LINE: ['BOARD_02_JUBILEE_HEX_BRIDGE', 'BOARD_10_SOVEREIGN_ZIGGURAT'],
  COAST_HEX_BRIDGE: ['BOARD_08_GEODESIC_SUNDIAL', 'BOARD_11_WHEW_GAUNTLET'],
  EYE_GUESS_MEMORY: ['BOARD_05_LARSON_SPIN_RING', 'BOARD_09_PIRATE_UHF_DECK'],
  CONCENTRATION_PRIZE_MATCH: ['BOARD_03_VAUDEVILLE_GEAR_TRAIN', 'BOARD_07_MONTE_CARLO_SHOE'],
  MONTY_CURTAIN_DEAL: ['BOARD_06_BOARDWALK_PINBALL', 'BOARD_12_PENDULUM_BALANCE'],
  PRESS_YOUR_LUCK_GREMLIN: ['BOARD_05_LARSON_SPIN_RING', 'BOARD_06_BOARDWALK_PINBALL'],
  BIG_WHEEL_SHOWCASE: ['BOARD_03_VAUDEVILLE_GEAR_TRAIN', 'BOARD_01_FUNK_CROSSFADER'],
};

/**
 * Draws a non-repeating `(BoardPlayModeV7 × BoardUnlockTopologyV7)` combination from
 * the 40-combo studio bag. `S01E01` ALWAYS opens with `CLASSIC_TOTE + CLASSIC_OPEN`!
 */
export function drawCombinatorialBoardComboV7(opts: {
  readonly episodeNumber: number;
  readonly isCampaignEp1?: boolean;
  readonly fallbackBoardId: BoardIdV7;
  readonly recentCombos?: readonly string[];
  readonly preferredMode?: BoardPlayModeV7;
  readonly seed?: number;
}): CombinatorialBoardComboV7 {
  if (opts.isCampaignEp1) {
    return {
      playMode: 'CLASSIC_TOTE',
      unlockTopology: 'CLASSIC_OPEN',
      boardId: 'BOARD_01_FUNK_CROSSFADER',
      comboKey: 'CLASSIC_TOTE::CLASSIC_OPEN',
    };
  }

  const recent = opts.recentCombos ?? [];
  const recentSet = new Set(recent.slice(-18));
  const lastCombo = recent.length > 0 ? recent[recent.length - 1] : '';
  const [lastMode, lastTopo] = lastCombo.split('::');

  const candidateModes: readonly BoardPlayModeV7[] = opts.preferredMode
    ? [opts.preferredMode]
    : ALL_BOARD_PLAY_MODES_V7;

  const allPairs: Array<{ mode: BoardPlayModeV7; topo: BoardUnlockTopologyV7; key: string }> = [];
  for (const mode of candidateModes) {
    for (const topo of ALL_BOARD_UNLOCK_TOPOLOGIES_V7) {
      allPairs.push({ mode, topo, key: `${mode}::${topo}` });
    }
  }

  const freshStrict = allPairs.filter(
    (p) =>
      !recentSet.has(p.key) &&
      (opts.preferredMode ? p.topo !== lastTopo : p.mode !== lastMode && p.topo !== lastTopo),
  );
  const freshAny = allPairs.filter((p) => !recentSet.has(p.key));
  const pool = freshStrict.length > 0 ? freshStrict : freshAny.length > 0 ? freshAny : allPairs;

  const rawSeed =
    (opts.seed ?? opts.episodeNumber * 2654435761 + recent.length * 40503) >>> 0;
  const picked = pool[rawSeed % pool.length] ?? pool[0];
  const preferredBoards = PREFERRED_BOARDS_BY_PLAY_MODE_V7[picked.mode];
  const boardId = opts.preferredMode
    ? preferredBoards[rawSeed % preferredBoards.length] ?? opts.fallbackBoardId
    : BOARD_PLAY_MODE_BY_BOARD_V7[opts.fallbackBoardId] === picked.mode
      ? opts.fallbackBoardId
      : preferredBoards[rawSeed % preferredBoards.length] ?? opts.fallbackBoardId;

  return {
    playMode: picked.mode,
    unlockTopology: picked.topo,
    boardId,
    comboKey: picked.key,
  };
}

export type EyeGuessHiddenBadgeV7 = 'NONE' | 'DOUBLE_2X' | 'CASH_300' | 'TRAP';

export type ConcentrationPrizeKindV7 =
  | 'NONE'
  | 'COLOR_TV'
  | 'CONVERTIBLE'
  | 'HAWAII_TRIP'
  | 'TAKE_STEAL';

export const CONCENTRATION_PRIZE_NAMES_V7: Record<
  Exclude<ConcentrationPrizeKindV7, 'NONE'>,
  string
> = {
  COLOR_TV: '📺 1966 COLOR TV',
  CONVERTIBLE: '🚗 CONVERTIBLE',
  HAWAII_TRIP: '🌴 HAWAII TRIP',
  TAKE_STEAL: '⚡ TAKE! STEAL',
};

export interface BoardModePostClaimResultV7 {
  readonly mode: BoardPlayModeV7;
  readonly bonusCash: number;
  readonly rivalStealCash: number;
  readonly multAdd: number;
  readonly bannerHeadline: string | null;
  readonly highlightedTileIndices?: readonly number[];
  readonly earnedGremlinSpins?: number;
  readonly triggerBigWheel?: boolean;
  readonly matchedPrize?: string;
}

export interface BoardModeRuleBannerV7 {
  readonly mode: BoardPlayModeV7;
  readonly modeTitle: string;
  readonly ruleSummary: string;
  readonly compactTitle?: string;
  readonly compactRuleSummary?: string;
  readonly unlockTopology?: BoardUnlockTopologyV7;
  readonly topologyBadge?: string;
}

export const BOARD_PLAY_MODE_BY_BOARD_V7: Record<BoardIdV7, BoardPlayModeV7> = {
  BOARD_01_FUNK_CROSSFADER: 'CLASSIC_TOTE',
  BOARD_02_JUBILEE_HEX_BRIDGE: 'TIC_TAC_LINE',
  BOARD_03_VAUDEVILLE_GEAR_TRAIN: 'BIG_WHEEL_SHOWCASE',
  BOARD_04_MAHOGANY_SWITCHBOARD: 'CLASSIC_TOTE',
  BOARD_05_LARSON_SPIN_RING: 'PRESS_YOUR_LUCK_GREMLIN',
  BOARD_06_BOARDWALK_PINBALL: 'MONTY_CURTAIN_DEAL',
  BOARD_07_MONTE_CARLO_SHOE: 'CONCENTRATION_PRIZE_MATCH',
  BOARD_08_GEODESIC_SUNDIAL: 'COAST_HEX_BRIDGE',
  BOARD_09_PIRATE_UHF_DECK: 'EYE_GUESS_MEMORY',
  BOARD_10_SOVEREIGN_ZIGGURAT: 'TIC_TAC_LINE',
  BOARD_11_WHEW_GAUNTLET: 'COAST_HEX_BRIDGE',
  BOARD_12_PENDULUM_BALANCE: 'MONTY_CURTAIN_DEAL',
};

export const BOARD_MODE_RULE_BANNERS_V7: Record<BoardPlayModeV7, BoardModeRuleBannerV7> = {
  CLASSIC_TOTE: {
    mode: 'CLASSIC_TOTE',
    modeTitle: '1964 CLASSIC TOTE',
    ruleSummary: 'Climb $150–$400 rows, uncover the hidden 2× Secret Square & crack the $500 Gold Vault!',
    compactTitle: 'CLASSIC TOTE',
    compactRuleSummary: 'Crack the $500 Gold Vault!',
  },
  TIC_TAC_LINE: {
    mode: 'TIC_TAC_LINE',
    modeTitle: 'HOLLYWOOD SQUARES · 3-IN-A-ROW',
    ruleSummary: 'Connect 3 claimed tiles in a line for a +$600 LINE JACKPOT — watch Rival blocks!',
    compactTitle: '3-IN-A-ROW',
    compactRuleSummary: '3-in-a-row wins +$600!',
  },
  COAST_HEX_BRIDGE: {
    mode: 'COAST_HEX_BRIDGE',
    modeTitle: 'COAST-TO-COAST BRIDGE',
    ruleSummary: 'Connect Left (NYC) to Right (Hollywood) across adjacent wins for +$750 (+0.25×/link)!',
    compactTitle: 'COAST BRIDGE',
    compactRuleSummary: 'Link Left-Right +$750!',
  },
  EYE_GUESS_MEMORY: {
    mode: 'EYE_GUESS_MEMORY',
    modeTitle: "EYE GUESS '66 · MEMORY FLASH",
    ruleSummary: 'Memorize the 2.4s board flash! Claim hidden ⭐ 2× & 💰 +$300 tiles while dodging 🎭 TRAPS!',
    compactTitle: "EYE GUESS '66",
    compactRuleSummary: 'Recall 2.4s 2× flash!',
  },
  CONCENTRATION_PRIZE_MATCH: {
    mode: 'CONCENTRATION_PRIZE_MATCH',
    modeTitle: "CONCENTRATION '65 · PRIZE MATCH",
    ruleSummary: 'Match 2 Luxury Prize Halves (Color TV, Convertible, Hawaii) for +$500 — hit TAKE! to steal $200!',
    compactTitle: 'PRIZE MATCH',
    compactRuleSummary: 'Match 2 prizes +$500!',
  },
  MONTY_CURTAIN_DEAL: {
    mode: 'MONTY_CURTAIN_DEAL',
    modeTitle: "LET'S MAKE A DEAL · CURTAIN SHOW",
    ruleSummary: 'Triple Velvet Mystery Curtains (#1–#3) + Instant Bargains — trade, double & steal!',
    compactTitle: 'CURTAIN DEAL',
    compactRuleSummary: 'Pull Curtains #1–#3!',
  },
  PRESS_YOUR_LUCK_GREMLIN: {
    mode: 'PRESS_YOUR_LUCK_GREMLIN',
    modeTitle: "PRESS YOUR LUCK '66 · GREMLIN BOARD",
    ruleSummary: 'Win ⚡ Luck Squares to spin the Chasing Light-Board — bank cash or PASS SPINS before the Gremlin zaps 40%!',
    compactTitle: 'PRESS YOUR LUCK',
    compactRuleSummary: 'Spin cash, dodge Zonk!',
  },
  BIG_WHEEL_SHOWCASE: {
    mode: 'BIG_WHEEL_SHOWCASE',
    modeTitle: '1966 BIG WHEEL SHOWCASE',
    ruleSummary: 'Claim 🎡 Big Wheel squares to flick the 20-wedge Studio Wheel for $1,000 Jackpots, 2× Mult & Free Lifelines!',
    compactTitle: 'BIG WHEEL',
    compactRuleSummary: 'Spin 🎡 Wheel $1,000!',
  },
};

export interface BoardTwistContextV7 {
  readonly boardId: BoardIdV7;
  readonly twistId: BoardTwistIdV7;
  readonly rivalId?: RivalIdV7;
  readonly rivalWeakCategories?: readonly CategoryIdV7[];
  readonly rivalStrongCategories?: readonly CategoryIdV7[];
  readonly scoutedWeakCategories?: readonly CategoryIdV7[];
  readonly playModeOverride?: BoardPlayModeV7;
  readonly boardModeV9?: BoardPlayModeV9;
  readonly season?: SeasonIdV7;
  readonly vetoedCategories?: readonly CategoryIdV7[];
  readonly vibePackId?: VibePackIdV9;
  readonly allowedCategories?: readonly CategoryIdV7[];
  readonly isDailyBroadcast?: boolean;
  readonly sweepsNight?: SweepsNightNumberV9;
  readonly unlockTopology?: BoardUnlockTopologyV7;
  readonly cpuPlaystyle?: CpuPlaystyleIdV7;
  readonly cpuTemperament?: CpuTemperamentIdV7;
  readonly isCampaignEp1?: boolean;
  readonly playerStreak?: number;
  readonly isBlitzPhase?: boolean;
  readonly isAct3Showdown?: boolean;
  readonly turnNumber?: number;
  readonly seedOffset?: number;
}

export type MysteryCurtainKindV7 =
  | 'BONUS_ENVELOPE'
  | 'STEAL_FROM_RIVAL'
  | 'DOUBLE_CHIPS'
  | 'WILD_CATEGORY_SWAP';

export interface MysteryCurtainOutcomeV7 {
  readonly tileIndex: number;
  readonly curtainNumber: 1 | 2 | 3;
  readonly kind: MysteryCurtainKindV7;
  readonly headline: string;
  readonly detail: string;
  readonly instantCashDelta: number;
  readonly rivalCashDelta: number;
  readonly chipsMultiplier: number;
  readonly swappedCategory?: CategoryIdV7;
}

export interface VaultUnlockResultV7 {
  readonly unlockedTileIndices: readonly number[];
  readonly unlockedTiles: readonly BoardTileNodeV7[];
  readonly triggerReason: 'ADJACENT_WIN' | 'STREAK_UNLOCK' | 'NONE';
}

export interface SecretSquareRevealResultV7 {
  readonly wasSecretSquare: boolean;
  readonly newlyRevealed: boolean;
  readonly tileIndex: number;
  readonly multBonus: number;
  readonly headline: string;
}

export interface ClassicTvTwistSpecV7 {
  readonly id: ClassicTvTileTwistV7;
  readonly badgeLabel: string;
  readonly headline: string;
  readonly shortRule: string;
  readonly accentHex: string;
}

export const CLASSIC_TV_TWIST_SPECS_V7: Record<ClassicTvTileTwistV7, ClassicTvTwistSpecV7> = {
  NONE: {
    id: 'NONE',
    badgeLabel: 'CLASSIC',
    headline: 'Classic 4-Option Trivia',
    shortRule: 'Standard 1966 four-choice network monitor question.',
    accentHex: '#0096A6',
  },
  LOCKED_VAULT: {
    id: 'LOCKED_VAULT',
    badgeLabel: '🔒 $500 VAULT',
    headline: 'Locked Gold Vault',
    shortRule: 'Win any adjacent tile OR hit a 2+ streak to crack open this $500 Gold Vault!',
    accentHex: '#F4A91F',
  },
  SECRET_SQUARE: {
    id: 'SECRET_SQUARE',
    badgeLabel: '⭐ 2X SECRET',
    headline: 'Secret Square · Daily Double!',
    shortRule: 'Hidden until tapped — flips to gold starburst for Double Dollars (+1.0x Mult)!',
    accentHex: '#F4A91F',
  },
  OPPONENT_CHOICE: {
    id: 'OPPONENT_CHOICE',
    badgeLabel: "🎭 RIVAL'S PICK",
    headline: "Opponent's Choice",
    shortRule: 'Conquer your Rival’s dare for 1.5x Spite Mult + $100 bonus — or force them onto a weak spot!',
    accentHex: '#E63B7A',
  },
  MYSTERY_CURTAIN: {
    id: 'MYSTERY_CURTAIN',
    badgeLabel: '❓ CURTAIN',
    headline: 'Mystery Curtain Wild Spin',
    shortRule: 'Reveals +$200 Envelope, Steal $150, Double Chips, or a Wild Category Swap!',
    accentHex: '#E63B7A',
  },
  INSTANT_BARGAIN: {
    id: 'INSTANT_BARGAIN',
    badgeLabel: '🔔 BARGAIN',
    headline: 'Instant Bargain',
    shortRule: 'Ring the studio bell for a mid-show prize discount!',
    accentHex: '#FF6738',
  },
  SHOWCASE_BONUS: {
    id: 'SHOWCASE_BONUS',
    badgeLabel: '★ TV BONUS',
    headline: 'Studio Showcase Bonus Round',
    shortRule: 'Special tactile 1966 TV Showcase format with +$50 & +0.20x Showcase Bonus!',
    accentHex: '#0096A6',
  },
  BIG_WHEEL_SPIN: {
    id: 'BIG_WHEEL_SPIN',
    badgeLabel: '🎡 BIG WHEEL',
    headline: '1966 Studio Big Wheel Spin!',
    shortRule: 'Flick the 20-wedge Studio Wheel for up to $1,000, 2× Mult, Steal $250, or Free Lifeline!',
    accentHex: '#F4A91F',
  },
  BLIND_CATEGORY: {
    id: 'BLIND_CATEGORY',
    badgeLabel: '$600 · ???',
    headline: 'Blind $600 Mystery Category!',
    shortRule: 'High $600 dollar stake — hidden category shutter flips open when tapped!',
    accentHex: '#1E56C5',
  },
  MYSTERY_CASH: {
    id: 'MYSTERY_CASH',
    badgeLabel: '$??? CASH',
    headline: 'Wax-Sealed Mystery Cash Square!',
    shortRule: 'Category revealed upfront; hidden dollar stake ($250–$650) unseals on tap!',
    accentHex: '#0096A6',
  },
  BRASS_KEY: {
    id: 'BRASS_KEY',
    badgeLabel: '🗝️ SAFE KEY',
    headline: 'Brass Safe Key!',
    shortRule: 'Unlocks a $500 Safe with 1-Turn Keyholder Priority Shield against CPU sniping!',
    accentHex: '#F4A91F',
  },
  PRESS_LUCK_SPIN: {
    id: 'PRESS_LUCK_SPIN',
    badgeLabel: '⚡ LUCK SPIN',
    headline: 'Press-Your-Luck Light Board!',
    shortRule: 'Win to earn 2 Light-Board spins — bank big cash or pass spins before the Gremlin zaps 40%!',
    accentHex: '#FF6738',
  },
};

// ----------------------------------------------------------------------------
// 3b. v9.0 R7 Anti-Repetition Board Modes, Zero-Deadlock Live-Wire Fuse & VIP Bluff
// ----------------------------------------------------------------------------

export interface BoardModeRuleBannerV9 {
  readonly mode: BoardPlayModeV9;
  readonly modeTitle: string;
  readonly ruleSummary: string;
  readonly compactTitle?: string;
  readonly compactRuleSummary?: string;
  readonly unlockTopology?: BoardUnlockTopologyV7;
  readonly topologyBadge?: string;
}

export const BOARD_MODE_RULE_BANNERS_V9: Record<BoardPlayModeV9, BoardModeRuleBannerV9> = {
  ...BOARD_MODE_RULE_BANNERS_V7,
  LOUVER_SHUTTER: {
    mode: 'LOUVER_SHUTTER',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.LOUVER_SHUTTER,
    ruleSummary: '🕶️ TOPICS SHUTTERED · DOLLARS VISIBLE — $200–$500 glows bright; louvers snap open on tap!',
    compactTitle: 'LOUVER SHUTTER',
    compactRuleSummary: '🕶️ TOPICS SHUTTERED · DOLLARS VISIBLE',
  },
  BLIND_PURSE: {
    mode: 'BLIND_PURSE',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.BLIND_PURSE,
    ruleSummary: '💸 BLIND PURSE · CATEGORIES VISIBLE — Wax-sealed $150–$750 envelopes pop open on tap!',
    compactTitle: 'BLIND PURSE',
    compactRuleSummary: '💸 BLIND PURSE · CATEGORIES VISIBLE',
  },
  BLACKOUT_VAULT: {
    mode: 'BLACKOUT_VAULT',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.BLACKOUT_VAULT,
    ruleSummary: '🎩 BLACKOUT VAULT · FLIP TO REVEAL — Safe Trilons #1–#12 hide topic & cash (3 ⚡ High-Volt)!',
    compactTitle: 'BLACKOUT VAULT',
    compactRuleSummary: '🎩 BLACKOUT VAULT · FLIP TO REVEAL',
  },
  LIVE_WIRE_FUSE: {
    mode: 'LIVE_WIRE_FUSE',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.LIVE_WIRE_FUSE,
    ruleSummary: '🔗 LIVE-WIRE FUSE · WIN TO UNLOCK — 1 starter tile open; wins spark adjacent conduits open!',
    compactTitle: 'LIVE-WIRE FUSE',
    compactRuleSummary: '🔗 LIVE-WIRE FUSE · WIN TO UNLOCK',
  },
  SHIFTING_SPOTLIGHT: {
    mode: 'SHIFTING_SPOTLIGHT',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.SHIFTING_SPOTLIGHT,
    ruleSummary: '🔦 SHIFTING SPOTLIGHT · 1.5×/2× RAIL — Harvest Gold follow-spot glides to a new tile every turn!',
    compactTitle: 'SHIFTING SPOTLIGHT',
    compactRuleSummary: '🔦 1.5×/2× SPOTLIGHT GLIDES EACH TURN',
  },
  GOLDEN_DOMINO_CASCADE: {
    mode: 'GOLDEN_DOMINO_CASCADE',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.GOLDEN_DOMINO_CASCADE,
    ruleSummary: '🟨 GOLDEN DOMINO · 3-LINK CASCADE — Connect 3 contiguous wins for a +$350 Domino Cascade!',
    compactTitle: 'GOLDEN DOMINO',
    compactRuleSummary: '🟨 LINK 3 CONTIGUOUS WINS -> +$350!',
  },
  PRESSURE_COOKER: {
    mode: 'PRESSURE_COOKER',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.PRESSURE_COOKER,
    ruleSummary: '♨️ PRESSURE COOKER · RISING GAUGE — Hits climb ×1.0→×1.25→×1.5→×2.0; any miss blasts reset!',
    compactTitle: 'PRESSURE COOKER',
    compactRuleSummary: '♨️ SHARED ×1.0..×2.0 · MISS RESETS!',
  },
  HOLLYWOOD_MARQUEE_LINE: {
    mode: 'HOLLYWOOD_MARQUEE_LINE',
    modeTitle: BOARD_PLAY_MODE_TITLES_V9.HOLLYWOOD_MARQUEE_LINE,
    ruleSummary: '💡 HOLLYWOOD MARQUEE · 3-IN-A-ROW — Light O/X chasing bulbs in any 3-tile line for +$300!',
    compactTitle: 'MARQUEE LINE',
    compactRuleSummary: '💡 O/X 3-IN-A-ROW -> +$300 BONUS!',
  },
};

export interface ClassicTvTwistSpecV9 {
  readonly id: ClassicTvTileTwistV9;
  readonly badgeLabel: string;
  readonly headline: string;
  readonly shortRule: string;
  readonly accentHex: string;
}

export const CLASSIC_TV_TWIST_SPECS_V9: Record<ClassicTvTileTwistV9, ClassicTvTwistSpecV9> = {
  ...CLASSIC_TV_TWIST_SPECS_V7,
  VIP_BLUFF: {
    id: 'VIP_BLUFF',
    badgeLabel: '★ VIP BLUFF',
    headline: '1966 VIP Celebrity Bluff!',
    shortRule: "Read the VIP's verbal tell: [TRUST 'EM] (+1.0x / -0.5x) or [CALL BLUFF!] (+1.5x / -0.5x).",
    accentHex: '#E6397A',
  },
};

export interface BoardModePostClaimResultV9 {
  readonly mode: BoardPlayModeV9;
  readonly modeV7Fallback: BoardPlayModeV7;
  readonly bonusCash: number;
  readonly rivalStealCash: number;
  readonly multAdd: number;
  readonly bannerHeadline: string | null;
  readonly highlightedTileIndices?: readonly number[];
  readonly unlockedTileIndices?: readonly number[];
  readonly emergencyCircuitBreakerFired?: boolean;
  readonly dominoCascadeTriggered?: boolean;
  readonly dominoGroupId?: number;
  readonly marqueeLineTriggered?: boolean;
  readonly pressureCookerMult?: number;
  readonly nextSpotlightIdx?: number | null;
  readonly earnedGremlinSpins?: number;
  readonly triggerBigWheel?: boolean;
  readonly matchedPrize?: string;
}

const R7_BOARD_MODES_SET_V9 = new Set<BoardPlayModeV9>(ALL_BOARD_PLAY_MODES_R7_V9);

export function isR7BoardPlayModeV9(mode: BoardPlayModeV9): mode is BoardPlayModeR7V9 {
  return R7_BOARD_MODES_SET_V9.has(mode);
}

export function toV7BoardPlayModeFallback(mode: BoardPlayModeV9): BoardPlayModeV7 {
  return isR7BoardPlayModeV9(mode) ? 'CLASSIC_TOTE' : mode;
}

export function getPressureCookerMultiplierV9(consecutiveHits: number): 1 | 1.25 | 1.5 | 2 {
  if (consecutiveHits >= 3) return 2;
  if (consecutiveHits === 2) return 1.5;
  if (consecutiveHits === 1) return 1.25;
  return 1;
}

interface CanonicalSlotCoordV9 {
  readonly x: number;
  readonly z: number;
}

function makeCanonicalGridCoordsV9(
  cols: readonly number[],
  rows: readonly number[],
): readonly CanonicalSlotCoordV9[] {
  const out: CanonicalSlotCoordV9[] = [];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      out.push({ x: cols[c], z: rows[r] });
    }
  }
  return out;
}

const CANONICAL_BOARD_SLOTS_V9: Record<BoardIdV7, readonly CanonicalSlotCoordV9[]> = {
  BOARD_01_FUNK_CROSSFADER: makeCanonicalGridCoordsV9([-1.24, -0.44, 0.44, 1.24], [-0.64, 0.0, 0.64]),
  BOARD_02_JUBILEE_HEX_BRIDGE: [
    { x: -1.44, z: -0.68 }, { x: -0.72, z: -0.68 }, { x: 0.0, z: -0.68 }, { x: 0.72, z: -0.68 }, { x: 1.44, z: -0.68 },
    { x: -1.08, z: 0.0 }, { x: -0.36, z: 0.0 }, { x: 0.36, z: 0.0 }, { x: 1.08, z: 0.0 },
    { x: -1.44, z: 0.68 }, { x: -0.72, z: 0.68 }, { x: 0.0, z: 0.68 }, { x: 0.72, z: 0.68 }, { x: 1.44, z: 0.68 },
  ],
  BOARD_03_VAUDEVILLE_GEAR_TRAIN: makeCanonicalGridCoordsV9([-1.29, -0.43, 0.43, 1.29], [-0.68, 0.0, 0.68]),
  BOARD_04_MAHOGANY_SWITCHBOARD: makeCanonicalGridCoordsV9([-1.29, -0.43, 0.43, 1.29], [-0.68, 0.0, 0.68]),
  BOARD_05_LARSON_SPIN_RING: [
    { x: -1.42, z: -0.72 }, { x: -0.71, z: -0.72 }, { x: 0.0, z: -0.72 }, { x: 0.71, z: -0.72 }, { x: 1.42, z: -0.72 },
    { x: 1.42, z: 0.0 }, { x: 1.42, z: 0.72 }, { x: 0.71, z: 0.72 }, { x: 0.0, z: 0.72 }, { x: -0.71, z: 0.72 },
    { x: -1.42, z: 0.72 }, { x: -1.42, z: 0.0 }, { x: -0.48, z: 0.0 }, { x: 0.48, z: 0.0 },
  ],
  BOARD_06_BOARDWALK_PINBALL: [
    { x: -1.42, z: -0.74 }, { x: -0.48, z: -0.74 }, { x: 0.48, z: -0.74 }, { x: 1.42, z: -0.74 },
    { x: -1.46, z: 0.0 }, { x: 0.0, z: -0.22 }, { x: 1.46, z: 0.0 },
    { x: -0.76, z: 0.22 }, { x: 0.76, z: 0.22 },
    { x: -1.42, z: 0.76 }, { x: -0.52, z: 0.78 }, { x: 0.52, z: 0.78 }, { x: 1.42, z: 0.76 },
  ],
  BOARD_07_MONTE_CARLO_SHOE: [
    { x: -1.36, z: -0.66 }, { x: -0.46, z: -0.74 }, { x: 0.46, z: -0.74 }, { x: 1.36, z: -0.66 },
    { x: -1.32, z: 0.02 }, { x: -0.44, z: -0.04 }, { x: 0.44, z: -0.04 }, { x: 1.32, z: 0.02 },
    { x: -1.26, z: 0.68 }, { x: -0.42, z: 0.64 }, { x: 0.42, z: 0.64 }, { x: 1.26, z: 0.68 },
  ],
  BOARD_08_GEODESIC_SUNDIAL: [
    { x: 0.0, z: -0.76 }, { x: 0.72, z: -0.68 }, { x: 1.36, z: -0.38 }, { x: 1.44, z: 0.24 },
    { x: 1.02, z: 0.74 }, { x: 0.36, z: 0.78 }, { x: -0.36, z: 0.78 }, { x: -1.02, z: 0.74 },
    { x: -1.44, z: 0.24 }, { x: -1.36, z: -0.38 }, { x: -0.72, z: -0.68 },
    { x: -0.65, z: 0.04 }, { x: 0.65, z: 0.04 },
  ],
  BOARD_09_PIRATE_UHF_DECK: makeCanonicalGridCoordsV9([-1.29, -0.43, 0.43, 1.29], [-0.68, 0.0, 0.68]),
  BOARD_10_SOVEREIGN_ZIGGURAT: [
    { x: -0.92, z: -0.72 }, { x: 0.0, z: -0.72 }, { x: 0.92, z: -0.72 },
    { x: -1.44, z: -0.02 }, { x: -0.72, z: -0.02 }, { x: 0.0, z: -0.02 }, { x: 0.72, z: -0.02 }, { x: 1.44, z: -0.02 },
    { x: -1.44, z: 0.68 }, { x: -0.72, z: 0.68 }, { x: 0.0, z: 0.68 }, { x: 0.72, z: 0.68 }, { x: 1.44, z: 0.68 },
  ],
  BOARD_11_WHEW_GAUNTLET: makeCanonicalGridCoordsV9([-1.44, -0.72, 0.0, 0.72, 1.44], [-0.7, 0.0, 0.7]),
  BOARD_12_PENDULUM_BALANCE: [
    { x: -1.36, z: -0.66 }, { x: -0.64, z: -0.66 }, { x: 0.64, z: -0.66 }, { x: 1.36, z: -0.66 },
    { x: -1.36, z: 0.0 }, { x: -0.64, z: 0.0 }, { x: 0.64, z: 0.0 }, { x: 1.36, z: 0.0 },
    { x: -1.36, z: 0.66 }, { x: -0.64, z: 0.66 }, { x: 0.64, z: 0.66 }, { x: 1.36, z: 0.66 },
  ],
};

function getCanonicalSlotCoordV9(tile: BoardTileNodeV7, boardId?: BoardIdV7): CanonicalSlotCoordV9 {
  const slot = boardId ? CANONICAL_BOARD_SLOTS_V9[boardId]?.[tile.index] : undefined;
  return slot ?? { x: tile.x, z: tile.z };
}

function areCanonicalOrthogonalV9(a: CanonicalSlotCoordV9, b: CanonicalSlotCoordV9): boolean {
  const dx = Math.abs(a.x - b.x);
  const dz = Math.abs(a.z - b.z);
  const dist = Math.hypot(dx, dz);
  if (dist < 0.15) return false;
  if (dist <= 0.92) return true;
  return (dx < 0.16 && dz <= 1.05) || (dz < 0.16 && dx <= 1.05);
}

export function areGoldenDominoAdjacentV9(
  a: CanonicalSlotCoordV9,
  b: CanonicalSlotCoordV9,
  boardId?: BoardIdV7,
): boolean {
  const dist = Math.hypot(b.x - a.x, b.z - a.z);
  if (dist < 0.15) return false;
  return (
    areCanonicalOrthogonalV9(a, b) ||
    (boardId === 'BOARD_12_PENDULUM_BALANCE' && dist <= 1.38) ||
    ((boardId === 'BOARD_06_BOARDWALK_PINBALL' || boardId === 'BOARD_08_GEODESIC_SUNDIAL') &&
      dist <= 1.24)
  );
}

function mixSeedV9(seed: number): number {
  let s = (seed >>> 0) || 0x19660601;
  s ^= s >>> 16;
  s = Math.imul(s, 0x85ebca6b);
  s ^= s >>> 13;
  s = Math.imul(s, 0xc2b2ae35);
  s ^= s >>> 16;
  return s >>> 0;
}

export const BLIND_PURSE_ENVELOPES_V9: readonly number[] = [
  150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 750,
];

/**
 * Deterministic anti-repeat Board Mode selector supporting Campaign Ep 1, Sweeps Week
 * Nights 1–5, and recent-mode exclusion across all 16 `BoardPlayModeV9` modes.
 */
export function pickAntiRepeatBoardModeV9(opts: {
  readonly recentModes?: readonly BoardPlayModeV9[];
  readonly season?: SeasonIdV7;
  readonly sweepsNight?: SweepsNightNumberV9;
  readonly excludeModes?: readonly BoardPlayModeV9[];
  readonly isCampaignEp1?: boolean;
  readonly preferR7?: boolean;
  readonly seed?: number;
}): BoardPlayModeV9 {
  if (opts.isCampaignEp1) {
    return 'CLASSIC_TOTE';
  }

  const s = mixSeedV9(opts.seed ?? 1966 + (opts.season ?? 1) * 97);
  if (opts.sweepsNight !== undefined) {
    switch (opts.sweepsNight) {
      case 1:
        return 'CLASSIC_TOTE';
      case 2:
        return (s & 1) === 0 ? 'LOUVER_SHUTTER' : 'BLIND_PURSE';
      case 3: {
        const n3Pool: readonly BoardPlayModeR7V9[] = [
          'SHIFTING_SPOTLIGHT',
          'GOLDEN_DOMINO_CASCADE',
          'PRESSURE_COOKER',
          'HOLLYWOOD_MARQUEE_LINE',
        ];
        const exclude = new Set(opts.excludeModes ?? []);
        const recent = new Set((opts.recentModes ?? []).slice(-3));
        const filtered = n3Pool.filter((m) => !exclude.has(m) && !recent.has(m));
        const pool = filtered.length > 0 ? filtered : n3Pool;
        return pool[s % pool.length];
      }
      case 4:
        return 'LIVE_WIRE_FUSE';
      case 5:
        return 'BLACKOUT_VAULT';
    }
  }

  const basePool: readonly BoardPlayModeV9[] = opts.preferR7
    ? ALL_BOARD_PLAY_MODES_R7_V9
    : ALL_BOARD_PLAY_MODES_V9;
  const excludeSet = new Set(opts.excludeModes ?? []);
  const recentWindow = (opts.recentModes ?? []).slice(-6);
  const recentSet = new Set(recentWindow);
  const lastMode = recentWindow[recentWindow.length - 1];

  const strict = basePool.filter((m) => !excludeSet.has(m) && !recentSet.has(m));
  const soft = basePool.filter((m) => !excludeSet.has(m) && m !== lastMode);
  const noExclude = basePool.filter((m) => !excludeSet.has(m));
  const pool = strict.length > 0 ? strict : soft.length > 0 ? soft : noExclude.length > 0 ? noExclude : basePool;
  return pool[s % pool.length] ?? 'CLASSIC_TOTE';
}

/**
 * Configures any of the 8 R7 Board Play Modes onto `tiles` cleanly and deterministically.
 */
export function applyBoardPlayModeV9(
  tiles: BoardTileNodeV7[],
  mode: BoardPlayModeV9,
  opts?: {
    readonly boardId?: BoardIdV7;
    readonly seed?: number;
    readonly turnNumber?: number;
    readonly reset?: boolean;
  },
): {
  readonly mode: BoardPlayModeV9;
  readonly starterTileIdx: number | null;
  readonly spotlightTileIdx: number | null;
  readonly shuffledEnvelopes?: readonly number[];
  readonly highVoltIndices?: readonly number[];
} {
  const shouldReset = opts?.reset !== false;
  if (shouldReset) {
    for (const tile of tiles) {
      tile.isLiveWireLocked = false;
      tile.isSpotlightTile = false;
      tile.dominoGroupId = undefined;
    }
  }

  const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
  if (playable.length === 0) {
    return { mode, starterTileIdx: null, spotlightTileIdx: null };
  }

  const baseSeed = mixSeedV9((opts?.seed ?? 1966) + playable.length * 37);

  switch (mode) {
    case 'LOUVER_SHUTTER': {
      for (const tile of playable) {
        tile.blindCategoryHidden = true;
        tile.mysteryCashHidden = false;
        tile.isLiveWireLocked = false;
        tile.isTopologyLocked = false;
        tile.isVaultLocked = false;
      }
      return { mode, starterTileIdx: null, spotlightTileIdx: null };
    }

    case 'BLIND_PURSE': {
      const envelopes = [...BLIND_PURSE_ENVELOPES_V9];
      while (envelopes.length < playable.length) {
        envelopes.push(BLIND_PURSE_ENVELOPES_V9[envelopes.length % BLIND_PURSE_ENVELOPES_V9.length]);
      }
      let rngState = baseSeed || 0x1966_cafe;
      for (let i = envelopes.length - 1; i > 0; i--) {
        rngState = mixSeedV9(rngState + i * 73);
        const j = rngState % (i + 1);
        const tmp = envelopes[i];
        envelopes[i] = envelopes[j];
        envelopes[j] = tmp;
      }
      playable.forEach((tile, idx) => {
        const envCash = envelopes[idx] ?? 300;
        tile.nominalBaseChips = envCash;
        tile.baseChips = envCash;
        tile.blindCategoryHidden = false;
        tile.mysteryCashHidden = true;
        tile.isLiveWireLocked = false;
        tile.isTopologyLocked = false;
        tile.isVaultLocked = false;
      });
      return {
        mode,
        starterTileIdx: null,
        spotlightTileIdx: null,
        shuffledEnvelopes: envelopes.slice(0, playable.length),
      };
    }

    case 'BLACKOUT_VAULT': {
      // 3 deterministic high-volt doors (>= $350), all categories + dollars concealed behind #1..#12 safe trilons
      const ranked = [...playable].sort((a, b) => {
        const ha = mixSeedV9(baseSeed + a.index * 53);
        const hb = mixSeedV9(baseSeed + b.index * 53);
        return b.baseChips - a.baseChips || ha - hb;
      });
      const highVoltIndices = ranked.slice(0, Math.min(3, ranked.length)).map((t) => t.index);
      const highVoltSet = new Set(highVoltIndices);
      for (const tile of playable) {
        tile.blindCategoryHidden = true;
        tile.mysteryCashHidden = true;
        tile.isLiveWireLocked = false;
        tile.isTopologyLocked = false;
        tile.isVaultLocked = false;
        if (highVoltSet.has(tile.index)) {
          tile.baseChips = Math.max(tile.baseChips, 400);
          tile.nominalBaseChips = tile.baseChips;
        }
      }
      return { mode, starterTileIdx: null, spotlightTileIdx: null, highVoltIndices };
    }

    case 'LIVE_WIRE_FUSE': {
      // Strictly 1 starter tile open (`isLiveWireLocked = false`, `isTopologyLocked = false`, `isVaultLocked = false`);
      // every other playable tile locked until sparked by orthogonal wins or Emergency Circuit Breaker!
      const sorted = [...playable].sort((a, b) => {
        const ca = getCanonicalSlotCoordV9(a, opts?.boardId);
        const cb = getCanonicalSlotCoordV9(b, opts?.boardId);
        const scoreA = (a.tvTwist === 'LOCKED_VAULT' ? -500 : 0) + ca.z * 25 - Math.hypot(ca.x, ca.z) * 18;
        const scoreB = (b.tvTwist === 'LOCKED_VAULT' ? -500 : 0) + cb.z * 25 - Math.hypot(cb.x, cb.z) * 18;
        return scoreB - scoreA || a.index - b.index;
      });
      const candidatePool = sorted.slice(0, Math.min(4, sorted.length));
      const starter = candidatePool[baseSeed % candidatePool.length] ?? playable[0];

      for (const tile of playable) {
        if (tile.index === starter.index) {
          tile.isLiveWireLocked = false;
          tile.isTopologyLocked = false;
          tile.isVaultLocked = false;
          if (tile.tvTwist === 'LOCKED_VAULT') {
            tile.tvTwist = 'NONE';
          }
        } else {
          tile.isLiveWireLocked = true;
          tile.isTopologyLocked = true;
        }
      }
      return { mode, starterTileIdx: starter.index, spotlightTileIdx: null };
    }

    case 'SHIFTING_SPOTLIGHT': {
      const unlocked = playable.filter((t) => !t.isVaultLocked && !t.isTopologyLocked && !t.isLiveWireLocked);
      const pool = unlocked.length > 0 ? unlocked : playable;
      const spotTile = pool[baseSeed % pool.length] ?? pool[0];
      for (const tile of tiles) {
        tile.isSpotlightTile = tile.index === spotTile.index;
      }
      return { mode, starterTileIdx: null, spotlightTileIdx: spotTile.index };
    }

    case 'GOLDEN_DOMINO_CASCADE':
    case 'PRESSURE_COOKER':
    case 'HOLLYWOOD_MARQUEE_LINE':
    default: {
      return { mode, starterTileIdx: null, spotlightTileIdx: null };
    }
  }
}

/**
 * Evaluates connected components of `CLAIMED_PLAYER` tiles in `GOLDEN_DOMINO_CASCADE`.
 * Linking 3+ contiguous player-claimed tiles triggers `+$350` (`+0.25x`).
 */
export function evaluateGoldenDominoCascadeV9(
  tiles: BoardTileNodeV7[],
  opts: {
    readonly claimedIdx: number;
    readonly boardId?: BoardIdV7;
    readonly awardedGroups?: Set<string>;
  },
): {
  readonly triggered: boolean;
  readonly bonusCash: number;
  readonly multAdd: number;
  readonly groupId: number;
  readonly componentIndices: readonly number[];
  readonly bannerHeadline: string | null;
} {
  const claimedPlayer = tiles.filter((t) => t.state === 'CLAIMED_PLAYER');
  const start = claimedPlayer.find((t) => t.index === opts.claimedIdx);
  if (!start) {
    return {
      triggered: false,
      bonusCash: 0,
      multAdd: 0,
      groupId: 0,
      componentIndices: [],
      bannerHeadline: null,
    };
  }

  const visited = new Set<number>([start.index]);
  const queue: BoardTileNodeV7[] = [start];
  const component: BoardTileNodeV7[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    component.push(curr);
    const currCoord = getCanonicalSlotCoordV9(curr, opts.boardId);

    for (const other of claimedPlayer) {
      if (visited.has(other.index)) continue;
      const otherCoord = getCanonicalSlotCoordV9(other, opts.boardId);
      if (areGoldenDominoAdjacentV9(currCoord, otherCoord, opts.boardId)) {
        visited.add(other.index);
        queue.push(other);
      }
    }
  }

  const componentIndices = component.map((t) => t.index).sort((a, b) => a - b);
  const groupId = (componentIndices[0] ?? 0) + 1;
  for (const t of component) {
    t.dominoGroupId = groupId;
  }

  const tier = Math.floor(componentIndices.length / 3);
  const alreadyAwardedForTier =
    tier >= 1 &&
    opts.awardedGroups !== undefined &&
    componentIndices.some((idx) => opts.awardedGroups!.has(`TILE_${idx}_TIER_${tier}`));
  if (componentIndices.length >= 3 && !alreadyAwardedForTier) {
    if (opts.awardedGroups) {
      for (const idx of componentIndices) {
        opts.awardedGroups.add(`TILE_${idx}_TIER_${tier}`);
      }
    }
    return {
      triggered: true,
      bonusCash: 350,
      multAdd: 0.25,
      groupId,
      componentIndices,
      bannerHeadline: '🟨 GOLDEN DOMINO CASCADE! 3-LINK +$350!',
    };
  }
  if (alreadyAwardedForTier && opts.awardedGroups) {
    for (const idx of componentIndices) {
      opts.awardedGroups.add(`TILE_${idx}_TIER_${tier}`);
    }
  }

  return {
    triggered: false,
    bonusCash: 0,
    multAdd: 0,
    groupId,
    componentIndices,
    bannerHeadline: null,
  };
}

/**
 * Checks canonical 3-in-a-row collinear triples (`O` for Player, `X` for Rival) in `HOLLYWOOD_MARQUEE_LINE`.
 * Uses canonical `BOARD_SPECS_V7` coordinates so Portrait & Desktop yield identical lines!
 */
export function evaluateHollywoodMarqueeLineV9(
  tiles: BoardTileNodeV7[],
  opts: {
    readonly actor: 'PLAYER' | 'RIVAL';
    readonly boardId?: BoardIdV7;
    readonly awardedLineKeys?: Set<string>;
  },
): {
  readonly triggered: boolean;
  readonly bonusCash: number;
  readonly lineIndices: readonly number[];
  readonly lineKey: string | null;
  readonly bannerHeadline: string | null;
} {
  const targetState = opts.actor === 'PLAYER' ? 'CLAIMED_PLAYER' : 'CLAIMED_RIVAL';
  const owned = tiles.filter((t) => t.state === targetState);
  if (owned.length < 3) {
    return { triggered: false, bonusCash: 0, lineIndices: [], lineKey: null, bannerHeadline: null };
  }

  for (let i = 0; i < owned.length; i++) {
    for (let j = i + 1; j < owned.length; j++) {
      for (let k = j + 1; k < owned.length; k++) {
        const pts = [owned[i], owned[j], owned[k]]
          .map((t) => ({ tile: t, coord: getCanonicalSlotCoordV9(t, opts.boardId) }))
          .sort((a, b) => a.coord.x - b.coord.x || a.coord.z - b.coord.z);
        const [a, b, c] = pts;
        const d1 = Math.hypot(b.coord.x - a.coord.x, b.coord.z - a.coord.z);
        const d2 = Math.hypot(c.coord.x - b.coord.x, c.coord.z - b.coord.z);
        if (d1 < 0.35 || d1 > 1.38 || d2 < 0.35 || d2 > 1.38) continue;
        if (Math.abs(d1 - d2) > 0.36) continue;

        const ux = (b.coord.x - a.coord.x) / d1;
        const uz = (b.coord.z - a.coord.z) / d1;
        const vx = (c.coord.x - b.coord.x) / d2;
        const vz = (c.coord.z - b.coord.z) / d2;
        const dot = ux * vx + uz * vz;
        const cross = Math.abs(ux * vz - uz * vx);
        if (dot > 0.94 && cross < 0.18) {
          const lineIndices = [a.tile.index, b.tile.index, c.tile.index].sort((m, n) => m - n);
          const lineKey = `${opts.actor}:${lineIndices.join('-')}`;
          if (!opts.awardedLineKeys || !opts.awardedLineKeys.has(lineKey)) {
            opts.awardedLineKeys?.add(lineKey);
            return {
              triggered: true,
              bonusCash: 300,
              lineIndices,
              lineKey,
              bannerHeadline:
                opts.actor === 'PLAYER'
                  ? '💡 HOLLYWOOD MARQUEE 3-IN-A-ROW (O)! +$300 LINE BONUS!'
                  : '💡 CHAMPION MARQUEE 3-IN-A-ROW (X)! +$300!',
            };
          }
        }
      }
    }
  }

  return { triggered: false, bonusCash: 0, lineIndices: [], lineKey: null, bannerHeadline: null };
}

/**
 * Mathematically zero-deadlock progression + Emergency Circuit Breaker for `LIVE_WIRE_FUSE`.
 * Guarantees `unlockedCountAfter >= 1` after EVERY turn whenever any playable tile remains!
 */
export function enforceLiveWireFuseProgressV9(
  tiles: BoardTileNodeV7[],
  opts: {
    readonly claimedIdx: number;
    readonly scored: boolean;
    readonly boardId?: BoardIdV7;
  },
): {
  readonly unlockedIndices: readonly number[];
  readonly emergencyCircuitBreakerFired: boolean;
  readonly unlockedCountAfter: number;
} {
  const unlockedIndices: number[] = [];
  const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
  if (playable.length === 0) {
    return { unlockedIndices, emergencyCircuitBreakerFired: false, unlockedCountAfter: 0 };
  }

  const claimedTile = tiles.find((t) => t.index === opts.claimedIdx);
  if (opts.scored && claimedTile) {
    const claimedCoord = getCanonicalSlotCoordV9(claimedTile, opts.boardId);
    const lockedPlayable = playable.filter((t) => t.isLiveWireLocked || t.isTopologyLocked);
    const orthogonalLocked = lockedPlayable.filter((t) =>
      areCanonicalOrthogonalV9(claimedCoord, getCanonicalSlotCoordV9(t, opts.boardId)),
    );
    const toSpark =
      orthogonalLocked.length > 0
        ? orthogonalLocked
        : lockedPlayable.filter((t) => {
            const c = getCanonicalSlotCoordV9(t, opts.boardId);
            return Math.hypot(c.x - claimedCoord.x, c.z - claimedCoord.z) <= 1.38;
          });

    for (const t of toSpark) {
      t.isLiveWireLocked = false;
      t.isTopologyLocked = false;
      unlockedIndices.push(t.index);
    }
  }

  let unlockedNow = playable.filter(
    (t) => !t.isLiveWireLocked && !t.isTopologyLocked && !t.isVaultLocked,
  );
  let emergencyCircuitBreakerFired = false;

  if (unlockedNow.length === 0 && playable.length > 0) {
    emergencyCircuitBreakerFired = true;
    const refCoord = claimedTile
      ? getCanonicalSlotCoordV9(claimedTile, opts.boardId)
      : { x: 0, z: 0 };
    const candidates = [...playable].sort((a, b) => {
      const ca = getCanonicalSlotCoordV9(a, opts.boardId);
      const cb = getCanonicalSlotCoordV9(b, opts.boardId);
      const da = Math.hypot(ca.x - refCoord.x, ca.z - refCoord.z);
      const db = Math.hypot(cb.x - refCoord.x, cb.z - refCoord.z);
      const va = a.isVaultLocked ? 1 : 0;
      const vb = b.isVaultLocked ? 1 : 0;
      return va - vb || da - db || a.index - b.index;
    });
    for (let i = 0; i < Math.min(2, candidates.length); i++) {
      const c = candidates[i];
      c.isLiveWireLocked = false;
      c.isTopologyLocked = false;
      c.isVaultLocked = false;
      if (!unlockedIndices.includes(c.index)) {
        unlockedIndices.push(c.index);
      }
    }
    unlockedNow = playable.filter(
      (t) => !t.isLiveWireLocked && !t.isTopologyLocked && !t.isVaultLocked,
    );
  }

  return {
    unlockedIndices,
    emergencyCircuitBreakerFired,
    unlockedCountAfter: unlockedNow.length,
  };
}

export interface ResolvePostTurnEngineStateV9 {
  pressureCookerStreak: number;
  awardedDominoGroups?: Set<string>;
  awardedMarqueeLines?: Set<string>;
}

/**
 * Unified post-turn state machine for both Player & Rival turns across all 16 `BoardPlayModeV9` modes.
 */
export function resolvePostTurnBoardModeV9(params: {
  readonly tiles: BoardTileNodeV7[];
  readonly mode: BoardPlayModeV9;
  readonly claimedIdx: number;
  readonly actor: 'PLAYER' | 'RIVAL';
  readonly scored: boolean;
  readonly boardId?: BoardIdV7;
  readonly turnNumber?: number;
  readonly seed?: number;
  readonly engineState?: ResolvePostTurnEngineStateV9;
}): BoardModePostClaimResultV9 {
  const { tiles, mode, claimedIdx, actor, scored, boardId } = params;
  const fallbackMode = toV7BoardPlayModeFallback(mode);
  const claimedTile = tiles.find((t) => t.index === claimedIdx);

  if (mode === 'LOUVER_SHUTTER' || mode === 'BLIND_PURSE' || mode === 'BLACKOUT_VAULT') {
    if (claimedTile) {
      claimedTile.blindCategoryHidden = false;
      claimedTile.mysteryCashHidden = false;
    }
    return {
      mode,
      modeV7Fallback: fallbackMode,
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: 0,
      bannerHeadline: null,
      highlightedTileIndices: claimedTile ? [claimedIdx] : undefined,
    };
  }

  if (mode === 'LIVE_WIRE_FUSE') {
    const res = enforceLiveWireFuseProgressV9(tiles, { claimedIdx, scored, boardId });
    return {
      mode,
      modeV7Fallback: fallbackMode,
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: 0,
      bannerHeadline: res.emergencyCircuitBreakerFired
        ? '⚡ EMERGENCY CIRCUIT BREAKER! 2 TILES SPARKED OPEN!'
        : res.unlockedIndices.length > 0
          ? `🔗 LIVE-WIRE SPARK! +${res.unlockedIndices.length} TILE${res.unlockedIndices.length > 1 ? 'S' : ''} UNLOCKED!`
          : null,
      highlightedTileIndices: res.unlockedIndices.length > 0 ? res.unlockedIndices : undefined,
      unlockedTileIndices: res.unlockedIndices,
      emergencyCircuitBreakerFired: res.emergencyCircuitBreakerFired,
    };
  }

  if (mode === 'SHIFTING_SPOTLIGHT') {
    const playable = tiles.filter(
      (t) =>
        (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') &&
        !t.isVaultLocked &&
        !t.isTopologyLocked &&
        !t.isLiveWireLocked,
    );
    const prevSpotIdx = tiles.findIndex((t) => t.isSpotlightTile);
    const wasSpotlightHit = Boolean(claimedTile?.isSpotlightTile) && scored;
    const spotMultAdd = (params.turnNumber ?? 1) >= 7 ? 1.0 : 0.5;
    for (const t of tiles) t.isSpotlightTile = false;

    let nextSpotlightIdx: number | null = null;
    if (playable.length > 0) {
      const candidates = playable.filter((t) => t.index !== claimedIdx && t.index !== prevSpotIdx);
      const pool = candidates.length > 0 ? candidates : playable;
      const pickSeed = mixSeedV9((params.seed ?? 1966) + (params.turnNumber ?? 1) * 89 + claimedIdx * 13);
      const nextTile = pool[pickSeed % pool.length] ?? pool[0];
      nextTile.isSpotlightTile = true;
      nextSpotlightIdx = nextTile.index;
    }

    return {
      mode,
      modeV7Fallback: fallbackMode,
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: wasSpotlightHit && actor === 'PLAYER' ? spotMultAdd : 0,
      bannerHeadline: wasSpotlightHit
        ? `🔦 SPOTLIGHT HIT! ${(1 + spotMultAdd).toFixed(1)}× BOOST!`
        : null,
      highlightedTileIndices: nextSpotlightIdx !== null ? [nextSpotlightIdx] : undefined,
      nextSpotlightIdx,
    };
  }

  if (mode === 'GOLDEN_DOMINO_CASCADE') {
    if (actor === 'PLAYER' && scored) {
      const res = evaluateGoldenDominoCascadeV9(tiles, {
        claimedIdx,
        boardId,
        awardedGroups: params.engineState?.awardedDominoGroups,
      });
      return {
        mode,
        modeV7Fallback: fallbackMode,
        bonusCash: res.bonusCash,
        rivalStealCash: 0,
        multAdd: res.multAdd,
        bannerHeadline: res.bannerHeadline,
        highlightedTileIndices: res.triggered ? res.componentIndices : undefined,
        dominoCascadeTriggered: res.triggered,
        dominoGroupId: res.groupId,
      };
    }
    return {
      mode,
      modeV7Fallback: fallbackMode,
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: 0,
      bannerHeadline: null,
    };
  }

  if (mode === 'HOLLYWOOD_MARQUEE_LINE') {
    if (scored) {
      const res = evaluateHollywoodMarqueeLineV9(tiles, {
        actor,
        boardId,
        awardedLineKeys: params.engineState?.awardedMarqueeLines,
      });
      return {
        mode,
        modeV7Fallback: fallbackMode,
        bonusCash: actor === 'PLAYER' ? res.bonusCash : 0,
        rivalStealCash: 0,
        multAdd: actor === 'PLAYER' && res.triggered ? 0.25 : 0,
        bannerHeadline: res.bannerHeadline,
        highlightedTileIndices: res.triggered ? res.lineIndices : undefined,
        marqueeLineTriggered: res.triggered,
      };
    }
    return {
      mode,
      modeV7Fallback: fallbackMode,
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: 0,
      bannerHeadline: null,
    };
  }

  if (mode === 'PRESSURE_COOKER') {
    const state = params.engineState;
    if (scored) {
      const nextStreak = (state?.pressureCookerStreak ?? 0) + 1;
      if (state) state.pressureCookerStreak = nextStreak;
      const nextMult = getPressureCookerMultiplierV9(nextStreak);
      return {
        mode,
        modeV7Fallback: fallbackMode,
        bonusCash: 0,
        rivalStealCash: 0,
        multAdd: 0,
        bannerHeadline:
          nextMult >= 2.0
            ? '♨️ PRESSURE COOKER MAXED AT ×2.0!'
            : `♨️ PRESSURE GAUGE CLIMBING -> ×${nextMult.toFixed(2)}!`,
        pressureCookerMult: nextMult,
      };
    }
    const hadPressure = (state?.pressureCookerStreak ?? 0) > 0;
    if (state) state.pressureCookerStreak = 0;
    return {
      mode,
      modeV7Fallback: fallbackMode,
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: 0,
      bannerHeadline: hadPressure ? '💨 PRESSURE BLAST! GAUGE RESET TO ×1.0!' : null,
      pressureCookerMult: 1,
    };
  }

  return {
    mode,
    modeV7Fallback: fallbackMode,
    bonusCash: 0,
    rivalStealCash: 0,
    multAdd: 0,
    bannerHeadline: null,
  };
}

/**
 * Deterministically seeds `1–2` `'VIP_BLUFF'` tiles (`tile.tvTwistV9 = 'VIP_BLUFF'`, `tile.vipId`),
 * keeping `tile.tvTwist = 'NONE'` so v7 `ClassicTvTileTwistV7` consumers stay 100% compatible.
 */
export function seedVipBluffTilesOnTiles(
  tiles: BoardTileNodeV7[],
  opts?: {
    readonly count?: 1 | 2;
    readonly seed?: number;
    readonly season?: SeasonIdV7;
    readonly preferredCategories?: readonly CategoryIdV7[];
    readonly excludeBlitz?: boolean;
  },
): readonly { readonly tileIndex: number; readonly vipId: VipCelebIdV9 }[] {
  if (opts?.excludeBlitz) return [];
  const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
  if (playable.length === 0) return [];

  const desiredCount: 1 | 2 = opts?.count ?? (playable.length >= 12 ? 2 : 1);
  const seedBase = mixSeedV9((opts?.seed ?? 1966) + (opts?.season ?? 1) * 193);
  const prefCats = new Set(opts?.preferredCategories ?? []);

  // Never overwrite major visible twists or locked vaults; prefer unlocked tiles so VIP Bluff is playable early
  const eligible = playable.filter(
    (t) =>
      t.tvTwist === 'NONE' &&
      !t.isVaultLocked &&
      t.tvTwistV9 !== 'VIP_BLUFF',
  );
  const unlockedPreferred = eligible.filter(
    (t) => !t.isLiveWireLocked && !t.isTopologyLocked && (prefCats.size === 0 || prefCats.has(t.category)),
  );
  const unlockedAny = eligible.filter((t) => !t.isLiveWireLocked && !t.isTopologyLocked);
  const fallbackPool = eligible.length > 0 ? eligible : playable.filter((t) => t.tvTwist !== 'LOCKED_VAULT' && t.tvTwist !== 'SECRET_SQUARE');

  const poolOrder: BoardTileNodeV7[] = [
    ...unlockedPreferred,
    ...unlockedAny.filter((t) => !unlockedPreferred.includes(t)),
    ...eligible.filter((t) => !unlockedAny.includes(t)),
    ...fallbackPool.filter((t) => !eligible.includes(t)),
  ];

  const placed: Array<{ readonly tileIndex: number; readonly vipId: VipCelebIdV9 }> = [];
  const usedVips = new Set<VipCelebIdV9>();

  for (let i = 0; i < desiredCount && poolOrder.length > 0; i++) {
    const windowSize = Math.min(poolOrder.length, Math.max(2, Math.ceil(poolOrder.length * 0.6)));
    const pickIdx = mixSeedV9(seedBase + i * 71) % windowSize;
    const chosenTile = poolOrder.splice(pickIdx, 1)[0];
    if (!chosenTile) break;

    const vipPool = VIP_CELEB_CATALOG_V9.filter((v) => !usedVips.has(v.targetId));
    const vipList = vipPool.length > 0 ? vipPool : VIP_CELEB_CATALOG_V9;
    const vip = vipList[mixSeedV9(seedBase + chosenTile.index * 41 + i * 17) % vipList.length];
    if (!vip) break;

    chosenTile.tvTwistV9 = 'VIP_BLUFF';
    chosenTile.vipId = vip.targetId;
    usedVips.add(vip.targetId);
    placed.push({ tileIndex: chosenTile.index, vipId: vip.targetId });
  }

  return placed;
}

export interface TileTwistBreakdownV7 {
  readonly tileIndex: number;
  readonly baseChips: number;
  readonly bonusChips: number;
  readonly effectiveChips: number;
  /** Raw additive mult bonus before Piece-3 cap (`+0.00 .. +2.50`). */
  readonly rawMultBonus: number;
  /** Capped additive mult bonus (`0.00 .. 1.00` cold, `0.00 .. 2.00` streaking). */
  readonly cappedMultBonus: number;
  /** Final tile multiplier (`1.00 .. 2.00` cold, `1.00 .. 3.00` streaking). */
  readonly effectiveMult: number;
  /** Cap ceiling applied (`2.0` when `streak < 2`, `3.0` when `streak >= 2`). */
  readonly multCapCeiling: 2.0 | 3.0;
  readonly respectedAmberTruce: boolean;
  readonly poachedAmberTruce: boolean;
  readonly rivalTrustDelta: -1 | 0;
  readonly hitRivalWheelhouse: boolean;
  readonly triggeredRiggedSolenoid: boolean;
  readonly tvTwist: ClassicTvTileTwistV7;
  readonly tvTwistV9?: ClassicTvTileTwistV9;
  readonly pressureCookerMult?: number;
  readonly isVaultLocked: boolean;
  readonly activeReasons: readonly string[];
}

export interface BlitzReRackResultV7 {
  /** Exact 6 indices promoted to `BLITZ_SURVIVOR` (4 Keystones + 2 Surge Plinths). */
  readonly survivorIndices: readonly number[];
  /** The 4 preserved keystone indices inside `survivorIndices`. */
  readonly keystoneIndices: readonly number[];
  /** Indices retracted via solenoid pull-down (`state = 'RETRACTED'`). */
  readonly retractedIndices: readonly number[];
}

const DOMAIN_CYCLE_V7: readonly DomainIdV7[] = ['SCI_TECH', 'POP_LIT', 'NUM_GEO', 'HIST_FACT'];

function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

function roundTo2(val: number): number {
  return Math.round(val * 100) / 100;
}

function normalizeAngleDelta(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

// ----------------------------------------------------------------------------
// 4. `BoardTwistsEngineV7` — Stateful Live 16-Twist & Spatial Combo Engine
// ----------------------------------------------------------------------------

export interface StagedMatchBoardOverridesV7 {
  readonly playModeOverride?: BoardPlayModeV7;
  readonly boardModeV9?: BoardPlayModeV9;
  readonly season?: SeasonIdV7;
  readonly vetoedCategories?: readonly CategoryIdV7[];
  readonly vibePackId?: VibePackIdV9;
  readonly allowedCategories?: readonly CategoryIdV7[];
  readonly isDailyBroadcast?: boolean;
  readonly sweepsNight?: SweepsNightNumberV9;
  readonly unlockTopology?: BoardUnlockTopologyV7;
  readonly scoutedWeakCategories?: readonly CategoryIdV7[];
  readonly cpuPlaystyle?: CpuPlaystyleIdV7;
  readonly cpuTemperament?: CpuTemperamentIdV7;
  readonly isCampaignEp1?: boolean;
}

export interface CpuTurnRollInputV7 {
  readonly baseAccuracy: number;
  readonly difficultyMode?: DifficultyModeV7;
  readonly playstyle: CpuPlaystyleIdV7;
  readonly temperament: CpuTemperamentIdV7;
  readonly isWeakCategory: boolean;
  readonly isStrongCategory: boolean;
  readonly isBlindCategory?: boolean;
  readonly tvTwist?: ClassicTvTileTwistV7;
  readonly turnNumber: number;
  readonly cpuStreak: number;
  readonly cpuTiltTurnsRemaining: number;
  readonly boothRattled: boolean;
  readonly deterministicRoll01: number;
}

export interface CpuTurnRollOutcomeV7 {
  readonly scored: boolean;
  readonly hitThreshold: number;
  readonly lockInDwellMs: number;
  readonly demeanorTag: string;
}

export const DIFFICULTY_ACCURACY_OFFSET_V7: Record<DifficultyModeV7, number> = {
  MATINEE_EASY: -0.12,
  PRIMETIME_NORMAL: 0.0,
  ALLSTAR_HARD: 0.09,
  MASTERMIND: 0.16,
};

/**
 * Evaluates a CPU Champion's turn honestly from character stats, difficulty mode,
 * category mastery, and temperament psychology — ZERO fake score rubber-banding!
 */
export function evaluateCpuTurnOutcomeV7(input: CpuTurnRollInputV7): CpuTurnRollOutcomeV7 {
  const diffMode = input.difficultyMode ?? 'PRIMETIME_NORMAL';
  let threshold = input.baseAccuracy + DIFFICULTY_ACCURACY_OFFSET_V7[diffMode];

  if (input.isWeakCategory) threshold -= 0.24;
  if (input.isStrongCategory) threshold += 0.1;
  if (input.isBlindCategory) threshold -= 0.06;
  if (input.boothRattled) threshold -= 0.16;

  let lockInDwellMs = 460;
  let demeanorTag = 'STEADY LOCK';

  switch (input.temperament) {
    case 'HOTHEAD': {
      if (input.cpuTiltTurnsRemaining > 0) {
        threshold -= 0.16;
        lockInDwellMs = 310;
        demeanorTag = 'STEAMING TILT!';
      } else if (input.cpuStreak >= 2) {
        threshold += 0.06;
        lockInDwellMs = 350;
        demeanorTag = 'FIRED UP!';
      }
      break;
    }
    case 'ICE_VEINED': {
      if (input.cpuTiltTurnsRemaining > 0) {
        threshold -= 0.03;
        lockInDwellMs = 540;
        demeanorTag = 'FROSTY COMPOSURE';
      } else if (input.turnNumber >= 8) {
        threshold += 0.08;
        lockInDwellMs = 640;
        demeanorTag = 'ICE-VEINED CLUTCH';
      } else {
        lockInDwellMs = 560;
        demeanorTag = 'COOL & MEASURED';
      }
      break;
    }
    case 'SHOWBOAT': {
      const isGlamourTwist =
        input.tvTwist === 'BIG_WHEEL_SPIN' ||
        input.tvTwist === 'PRESS_LUCK_SPIN' ||
        input.tvTwist === 'SECRET_SQUARE' ||
        input.tvTwist === 'MYSTERY_CURTAIN';
      if (input.cpuTiltTurnsRemaining > 0) {
        threshold -= 0.08;
        lockInDwellMs = 340;
        demeanorTag = 'RUFFLED SHOWBOAT';
      } else if (isGlamourTwist) {
        threshold += 0.07;
        lockInDwellMs = 520;
        demeanorTag = 'SPOTLIGHT SHOWBOAT!';
      } else {
        threshold -= 0.02;
        lockInDwellMs = 380;
        demeanorTag = 'FLASHY SNAP';
      }
      break;
    }
    case 'STEADY':
    default: {
      if (input.cpuTiltTurnsRemaining > 0) {
        threshold -= 0.04;
        lockInDwellMs = 430;
        demeanorTag = 'SHAKEN FOCUS';
      }
      break;
    }
  }

  if (input.playstyle === 'CLUTCH_SHARK' && input.turnNumber >= 8) {
    threshold += 0.07;
    demeanorTag = 'SHARK FINALE SURGE';
  }

  const minFloor = diffMode === 'MATINEE_EASY' ? 0.22 : 0.28;
  const maxCeil =
    diffMode === 'MATINEE_EASY'
      ? 0.74
      : diffMode === 'PRIMETIME_NORMAL'
        ? 0.9
        : diffMode === 'ALLSTAR_HARD'
          ? 0.94
          : 0.97;
  const clampedThreshold = clamp(threshold, minFloor, maxCeil);
  const scored = input.deterministicRoll01 < clampedThreshold;

  return {
    scored,
    hitThreshold: roundTo2(clampedThreshold),
    lockInDwellMs,
    demeanorTag,
  };
}

export const computeRivalAccuracy = evaluateCpuTurnOutcomeV7;
export const computeRivalAccuracyV7 = evaluateCpuTurnOutcomeV7;

export class BoardTwistsEngineV7 {
  private static pendingMatchOverrides: StagedMatchBoardOverridesV7 | null = null;
  private static lastActiveInstance: BoardTwistsEngineV7 | null = null;

  public static stageNextMatchOverrides(overrides: StagedMatchBoardOverridesV7 | null): void {
    BoardTwistsEngineV7.pendingMatchOverrides = overrides;
  }

  public static getActiveEngine(): BoardTwistsEngineV7 | null {
    return BoardTwistsEngineV7.lastActiveInstance;
  }

  private context: BoardTwistContextV7;
  private gimmick: BoardGimmickStateV7;
  private revealedSecretSquareIndices = new Set<number>();
  private rolledMysteryOutcomes = new Map<number, MysteryCurtainOutcomeV7>();
  private mysteryCurtainNumbers = new Map<number, 1 | 2 | 3>();
  private mysteryCashAmounts = new Map<number, number>();
  private activeSpotlightIndices: number[] = [];
  private eyeGuessBadges = new Map<number, EyeGuessHiddenBadgeV7>();
  private concentrationPrizes = new Map<number, ConcentrationPrizeKindV7>();
  private revealedConcentrationTiles = new Set<number>();
  private concentrationTileClaimer = new Map<number, 'PLAYER' | 'RIVAL'>();
  private awardedPrizePackages = new Set<ConcentrationPrizeKindV7>();
  private awardedTicTacLines = new Set<string>();
  private coastToCoastAwarded = false;
  private cpuConcentrationBonusCash = 0;
  private cpuConcentrationStealCash = 0;
  private activeWaveNumber = 1;
  private act2BoostedTiles = new WeakSet<BoardTileNodeV7>();
  private activeBoardModeV9: BoardPlayModeV9 = 'CLASSIC_TOTE';
  private pressureCookerStreak = 0;
  private awardedDominoGroups = new Set<string>();
  private awardedMarqueeLines = new Set<string>();
  private blackoutHighVoltIndices = new Set<number>();
  private blindPurseEnvelopes: number[] = [];

  constructor(initialContext?: Partial<BoardTwistContextV7>) {
    this.context = {
      boardId: initialContext?.boardId ?? 'BOARD_01_FUNK_CROSSFADER',
      twistId: initialContext?.twistId ?? 'TWIST_01_CROSSFADER_BOOST',
      rivalId: initialContext?.rivalId ?? 'CARMEN_DELGADO',
      rivalWeakCategories: initialContext?.rivalWeakCategories,
      rivalStrongCategories: initialContext?.rivalStrongCategories,
      scoutedWeakCategories: initialContext?.scoutedWeakCategories ?? [],
      playModeOverride: initialContext?.playModeOverride,
      boardModeV9: initialContext?.boardModeV9,
      season: initialContext?.season,
      vetoedCategories: initialContext?.vetoedCategories,
      vibePackId: initialContext?.vibePackId,
      allowedCategories: initialContext?.allowedCategories,
      isDailyBroadcast: initialContext?.isDailyBroadcast,
      sweepsNight: initialContext?.sweepsNight,
      unlockTopology: initialContext?.unlockTopology ?? 'CLASSIC_OPEN',
      cpuPlaystyle: initialContext?.cpuPlaystyle,
      cpuTemperament: initialContext?.cpuTemperament,
      isCampaignEp1: initialContext?.isCampaignEp1 ?? false,
      playerStreak: initialContext?.playerStreak ?? 0,
      isBlitzPhase: initialContext?.isBlitzPhase ?? false,
      isAct3Showdown: initialContext?.isAct3Showdown ?? false,
      turnNumber: initialContext?.turnNumber ?? 1,
      seedOffset: initialContext?.seedOffset ?? 0,
    };
    this.activeBoardModeV9 =
      this.context.boardModeV9 ??
      this.context.playModeOverride ??
      BOARD_PLAY_MODE_BY_BOARD_V7[this.context.boardId] ??
      'CLASSIC_TOTE';
    this.gimmick = this.createInitialGimmickState();
    BoardTwistsEngineV7.lastActiveInstance = this;
  }

  private createInitialGimmickState(): BoardGimmickStateV7 {
    return {
      crossfaderPosition: -1,
      bridgePolarityPhase: 0,
      gearPhase: 0,
      switchboardDomainIndex: 0,
      larsonHotTileIndex: 0,
      spinPassesUsed: 0,
      chargedBumperIndex: 0,
      baccaratShoeTotal: 9,
      sundialAngleRad: -Math.PI * 0.25,
      tunedUhfDomain: 'SCI_TECH',
      zigguratFocusTier: 0,
      gauntletReconColumn: 0,
      pendulumTiltDeg: 0,
      pendulumTareOffsetDeg: 0,
      mercySwitchPulled: false,
      amberTruceBroken: false,
      turnCounter: 0,
    };
  }

  // --------------------------------------------------------------------------
  // Configuration & Match Setup
  // --------------------------------------------------------------------------

  public configureMatch(
    nextContext: Partial<BoardTwistContextV7>,
    tiles?: BoardTileNodeV7[],
    resetGimmicks = true,
  ): void {
    BoardTwistsEngineV7.lastActiveInstance = this;
    const staged = BoardTwistsEngineV7.pendingMatchOverrides;
    if (resetGimmicks && staged) {
      BoardTwistsEngineV7.pendingMatchOverrides = null;
    }

    const resolvedModeV9: BoardPlayModeV9 =
      nextContext.boardModeV9 ??
      staged?.boardModeV9 ??
      nextContext.playModeOverride ??
      staged?.playModeOverride ??
      (resetGimmicks
        ? BOARD_PLAY_MODE_BY_BOARD_V7[nextContext.boardId ?? this.context.boardId] ?? 'CLASSIC_TOTE'
        : this.activeBoardModeV9);

    const resolvedPlayModeV7: BoardPlayModeV7 = isR7BoardPlayModeV9(resolvedModeV9)
      ? 'CLASSIC_TOTE'
      : resolvedModeV9;

    this.activeBoardModeV9 = resolvedModeV9;

    this.context = {
      ...this.context,
      ...nextContext,
      ...(resetGimmicks
        ? {
            playModeOverride: resolvedPlayModeV7,
            boardModeV9: resolvedModeV9,
            season: nextContext.season ?? staged?.season ?? this.context.season,
            vetoedCategories: nextContext.vetoedCategories ?? staged?.vetoedCategories ?? [],
            vibePackId: nextContext.vibePackId ?? staged?.vibePackId,
            allowedCategories: nextContext.allowedCategories ?? staged?.allowedCategories,
            isDailyBroadcast: nextContext.isDailyBroadcast ?? staged?.isDailyBroadcast ?? false,
            sweepsNight: nextContext.sweepsNight ?? staged?.sweepsNight,
            unlockTopology: nextContext.unlockTopology ?? staged?.unlockTopology ?? 'CLASSIC_OPEN',
            scoutedWeakCategories:
              nextContext.scoutedWeakCategories ?? staged?.scoutedWeakCategories ?? [],
            cpuPlaystyle: nextContext.cpuPlaystyle ?? staged?.cpuPlaystyle,
            cpuTemperament: nextContext.cpuTemperament ?? staged?.cpuTemperament,
            isCampaignEp1: nextContext.isCampaignEp1 ?? staged?.isCampaignEp1 ?? false,
            isBlitzPhase: false,
            isAct3Showdown: false,
            turnNumber: 1,
          }
        : {}),
    };
    if (resetGimmicks) {
      this.gimmick = this.createInitialGimmickState();
      this.revealedSecretSquareIndices.clear();
      this.rolledMysteryOutcomes.clear();
      this.mysteryCurtainNumbers.clear();
      this.mysteryCashAmounts.clear();
      this.activeSpotlightIndices = [];
      this.eyeGuessBadges.clear();
      this.concentrationPrizes.clear();
      this.revealedConcentrationTiles.clear();
      this.concentrationTileClaimer.clear();
      this.awardedPrizePackages.clear();
      this.awardedTicTacLines.clear();
      this.coastToCoastAwarded = false;
      this.cpuConcentrationBonusCash = 0;
      this.cpuConcentrationStealCash = 0;
      this.activeWaveNumber = 1;
      this.act2BoostedTiles = new WeakSet<BoardTileNodeV7>();
      this.pressureCookerStreak = 0;
      this.awardedDominoGroups.clear();
      this.awardedMarqueeLines.clear();
      this.blackoutHighVoltIndices.clear();
      this.blindPurseEnvelopes = [];
    }
    if (tiles && tiles.length > 0) {
      this.seedSocketMarkersOnTiles(tiles);
      this.seedClassicTvTwistsOnTiles(tiles, this.activeWaveNumber, this.context.seedOffset ?? 0);
      this.syncPendulumTilt(tiles);
      this.recomputeBoardModifiers(tiles);
    }
  }

  public updateRuntimeMatchFlags(
    patch: Partial<
      Pick<
        BoardTwistContextV7,
        | 'scoutedWeakCategories'
        | 'turnNumber'
        | 'isAct3Showdown'
        | 'cpuPlaystyle'
        | 'cpuTemperament'
      >
    >,
    tiles?: BoardTileNodeV7[],
  ): void {
    this.context = {
      ...this.context,
      ...patch,
    };
    if (tiles && patch.scoutedWeakCategories) {
      const scoutedSet = new Set<CategoryIdV7>(patch.scoutedWeakCategories);
      for (const t of tiles) {
        t.isWheelhouse = scoutedSet.has(t.category);
      }
      this.recomputeBoardModifiers(tiles);
    }
  }

  public setPlayerStreak(streak: number, tiles?: BoardTileNodeV7[]): void {
    this.context = {
      ...this.context,
      playerStreak: Math.max(0, Math.floor(streak)),
    };
    if (tiles) {
      this.recomputeBoardModifiers(tiles);
    }
  }

  public getContext(): Readonly<BoardTwistContextV7> {
    return this.context;
  }

  public getGimmickState(): Readonly<BoardGimmickStateV7> {
    return this.gimmick;
  }

  public getActiveTwistSpec(): BoardTwistSpecV7 {
    return BOARD_TWIST_SPECS_V7[this.context.twistId];
  }

  public getEffectiveWeakCategories(): readonly CategoryIdV7[] {
    if (this.context.rivalWeakCategories && this.context.rivalWeakCategories.length > 0) {
      return this.context.rivalWeakCategories;
    }
    const rivalId = this.context.rivalId ?? 'CARMEN_DELGADO';
    return DEFAULT_RIVAL_WEAK_CATEGORIES_V7[rivalId] ?? DEFAULT_RIVAL_WEAK_CATEGORIES_V7.CARMEN_DELGADO;
  }

  public getEffectiveStrongCategories(): readonly CategoryIdV7[] {
    if (this.context.rivalStrongCategories && this.context.rivalStrongCategories.length > 0) {
      return this.context.rivalStrongCategories;
    }
    const rivalId = this.context.rivalId ?? 'CARMEN_DELGADO';
    return DEFAULT_RIVAL_STRONG_CATEGORIES_V7[rivalId] ?? DEFAULT_RIVAL_STRONG_CATEGORIES_V7.CARMEN_DELGADO;
  }

  private getAllowedCategoryPoolV9(): readonly CategoryIdV7[] {
    const vetoSet = new Set<CategoryIdV7>(this.context.vetoedCategories ?? []);
    const nonVetoedAll = ALL_CATEGORIES_V7.filter((c) => !vetoSet.has(c));
    if (this.context.allowedCategories && this.context.allowedCategories.length > 0) {
      const filteredAllowed = this.context.allowedCategories.filter((c) => !vetoSet.has(c));
      if (filteredAllowed.length > 0) return filteredAllowed;
    }
    if (this.context.vibePackId) {
      const packCats = VIBE_PACK_CATEGORIES_V9[this.context.vibePackId] ?? ALL_CATEGORIES_V7;
      const filteredPack = packCats.filter((c) => !vetoSet.has(c));
      if (filteredPack.length >= 3) return filteredPack;
      if (filteredPack.length > 0 && nonVetoedAll.length === 0) return filteredPack;
    }
    return nonVetoedAll.length > 0 ? nonVetoedAll : ALL_CATEGORIES_V7;
  }

  private getEligibleWeakCategoriesV9(): readonly CategoryIdV7[] {
    const vetoSet = new Set<CategoryIdV7>(this.context.vetoedCategories ?? []);
    const allowedSet = new Set<CategoryIdV7>(this.getAllowedCategoryPoolV9());
    return this.getEffectiveWeakCategories().filter(
      (c) => !vetoSet.has(c) && allowedSet.has(c),
    );
  }

  /**
   * Seeds deterministic Amber Chalk Truce rings, Rival Wheelhouse weak-spot flags,
   * Pirate UHF halos, and Rigged Solenoid gambit tiles onto a freshly built board.
   */
  public seedSocketMarkersOnTiles(tiles: BoardTileNodeV7[]): void {
    if (tiles.length === 0) return;

    const scoutedSet = new Set<CategoryIdV7>(this.context.scoutedWeakCategories ?? []);
    const rivalId = this.context.rivalId ?? 'CARMEN_DELGADO';
    const isSympathetic = RIVAL_SYMPATHETIC_SET_V7.has(rivalId);
    const twistId = this.context.twistId;

    // Reset dynamic flags cleanly first — `isWheelhouse` badge on plaque only lights up once SCOUTED!
    for (const tile of tiles) {
      tile.domain = CATEGORY_TO_DOMAIN_V7[tile.category] ?? tile.domain;
      tile.isWheelhouse = scoutedSet.has(tile.category);
      tile.hasAmberTruce = false;
      tile.hasUhfHalo = false;
      tile.isRiggedSolenoid = false;
    }

    // Ensure at least 2 tiles carry non-vetoed, allowed Rival weak categories when available!
    const eligibleWeakList = this.getEligibleWeakCategoriesV9();
    const eligibleWeakSet = new Set<CategoryIdV7>(eligibleWeakList);
    let weakPresentCount = tiles.filter((t) => eligibleWeakSet.has(t.category)).length;
    if (weakPresentCount < 2 && eligibleWeakList.length > 0) {
      for (let i = 0; i < tiles.length && weakPresentCount < 2; i++) {
        const candidateIdx = (i * 5 + 2) % tiles.length;
        const candidate = tiles[candidateIdx];
        if (!eligibleWeakSet.has(candidate.category)) {
          const forcedCat = eligibleWeakList[weakPresentCount % eligibleWeakList.length];
          if (!forcedCat) break;
          candidate.category = forcedCat;
          candidate.domain = CATEGORY_TO_DOMAIN_V7[forcedCat];
          candidate.isWheelhouse = scoutedSet.has(forcedCat);
          weakPresentCount++;
        }
      }
    }

    // Amber Chalk Truce: Active for Sympathetic Rivals (Carmen, Toby, Inez) OR `TWIST_13_AMBER_CHALK_TRUCE`
    if ((isSympathetic || twistId === 'TWIST_13_AMBER_CHALK_TRUCE') && !this.gimmick.amberTruceBroken) {
      let truceMarked = 0;
      for (let i = 0; i < tiles.length && truceMarked < 2; i++) {
        const idx = (i * 4 + 1) % tiles.length;
        const t = tiles[idx];
        if (!t.isWheelhouse && !t.hasAmberTruce) {
          t.hasAmberTruce = true;
          truceMarked++;
        }
      }
    }

    // UHF Carrier Halos: Always seed 2–3 on UHF Deck / Twist 09, or 1 Pirate bleed-through on late boards
    const uhfTargetCount =
      this.context.boardId === 'BOARD_09_PIRATE_UHF_DECK' || twistId === 'TWIST_09_PIRATE_CARRIER_LOCK'
        ? 3
        : 1;
    let uhfCount = 0;
    for (const tile of tiles) {
      if (tile.domain === this.gimmick.tunedUhfDomain && !tile.hasAmberTruce) {
        tile.hasUhfHalo = true;
        uhfCount++;
        if (uhfCount >= uhfTargetCount) break;
      }
    }

    // Rigged Solenoid Gambit: Seed 2–3 shivering copper-spark tiles unless Mercy Switch already disarmed them
    if (!this.gimmick.mercySwitchPulled) {
      const riggedCountTarget = twistId === 'TWIST_15_SOLENOID_RIGGED_GAMBIT' ? 3 : 2;
      const sortedByChips = [...tiles]
        .filter((t) => !t.hasAmberTruce)
        .sort((a, b) => b.baseChips - a.baseChips || b.index - a.index);
      for (let i = 0; i < Math.min(riggedCountTarget, sortedByChips.length); i++) {
        sortedByChips[i].isRiggedSolenoid = true;
      }
    }

    // Initialize Larson Hot-Spot onto an open perimeter tile
    this.gimmick.larsonHotTileIndex = 0;
  }

  // --------------------------------------------------------------------------
  // 1966 Network TV Board Twists (`LOCKED_VAULT`, `SECRET_SQUARE`,
  // `OPPONENT_CHOICE`, `MYSTERY_CURTAIN`, `SHOWCASE_BONUS`)
  // --------------------------------------------------------------------------

  private computeDeterministicBoardHash(extra = 0): number {
    const str = `${this.context.boardId}|${this.context.rivalId ?? 'RIVAL'}|${this.activeWaveNumber}|${this.context.seedOffset ?? 0}|${extra}`;
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /**
   * Deterministically seeds the 5 iconic 1966 TV Board Twists onto every board load
   * and Round-2 re-rack:
   * - 1 × `LOCKED_VAULT` (`$500` Gold Vault, `isVaultLocked = true`, unlocks on adjacent win or 2+ streak!)
   * - 1 × `SECRET_SQUARE` (hidden until tapped -> flips to gold starburst `⭐ 2X SECRET SQUARE!`)
   * - 1–2 × `OPPONENT_CHOICE` (`🎭 RIVAL'S PICK` -> `1.5x` Spite Bonus + `$100`!)
   * - 1–2 × `MYSTERY_CURTAIN` (`❓ CURTAIN #1–3` -> instant spin outcome!)
   * - 2–3 × `SHOWCASE_BONUS` (`★ TV BONUS` -> marks the ~25% special tactile showcase rounds!)
   */
  public seedClassicTvTwistsOnTiles(
    tiles: BoardTileNodeV7[],
    waveNumber = 1,
    seedOffset?: number,
  ): void {
    if (tiles.length === 0) return;

    this.activeWaveNumber = waveNumber;
    if (seedOffset !== undefined) {
      this.context = { ...this.context, seedOffset };
    }
    this.revealedSecretSquareIndices.clear();
    this.rolledMysteryOutcomes.clear();
    this.mysteryCurtainNumbers.clear();
    this.mysteryCashAmounts.clear();

    // Reset all tiles to clean classic 4-option defaults first (preserving uncovered Concentration prizes across Act II re-rack!)
    const preserveConcentration =
      waveNumber > 1 && this.getActivePlayMode() === 'CONCENTRATION_PRIZE_MATCH';
    for (const tile of tiles) {
      tile.tvTwist = 'NONE';
      tile.tvTwistV9 = undefined;
      tile.vipId = undefined;
      tile.isLiveWireLocked = false;
      tile.isSpotlightTile = false;
      tile.dominoGroupId = undefined;
      tile.isVaultLocked = false;
      tile.isTopologyLocked = false;
      tile.keyholderProtectedTurns = 0;
      tile.blindCategoryHidden = false;
      tile.mysteryCashHidden = false;
      if (!preserveConcentration) {
        tile.revealedConcentrationPrize = undefined;
      }
    }

    const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
    if (playable.length === 0) return;

    const assigned = new Set<number>();
    const hashBase = this.computeDeterministicBoardHash(waveNumber * 31);
    const playMode = this.getActivePlayMode();
    const topology = this.getActiveUnlockTopology();

    // 1. LOCKED_VAULT (1 high-value $500 Gold Vault per non-Blitz board, positioned upstage/central with neighbors)
    if (!this.context.isBlitzPhase && playable.length >= 6) {
      const vaultCandidates = [...playable].sort((a, b) => {
        const aTopBias = -a.z * 80 - Math.abs(a.x) * 35 + a.baseChips * 0.4;
        const bTopBias = -b.z * 80 - Math.abs(b.x) * 35 + b.baseChips * 0.4;
        return bTopBias - aTopBias || a.index - b.index;
      });
      const pickPool = Math.min(3, vaultCandidates.length);
      const vaultTile = vaultCandidates[hashBase % pickPool] ?? vaultCandidates[0];
      vaultTile.tvTwist = 'LOCKED_VAULT';
      vaultTile.isVaultLocked = true;
      vaultTile.baseChips = 500;
      vaultTile.nominalBaseChips = 500;
      vaultTile.hasAmberTruce = false;
      assigned.add(vaultTile.index);
    }

    // Helper to pick deterministically from unassigned playable tiles
    const pickNextUnassigned = (
      salt: number,
      preferFilter?: (t: BoardTileNodeV7) => boolean,
    ): BoardTileNodeV7 | null => {
      const pool = playable.filter((t) => !assigned.has(t.index));
      if (pool.length === 0) return null;
      const preferred = preferFilter ? pool.filter(preferFilter) : pool;
      const source = preferred.length > 0 ? preferred : pool;
      const h = this.computeDeterministicBoardHash(salt + waveNumber * 17);
      const chosen = source[h % source.length] ?? source[0];
      assigned.add(chosen.index);
      return chosen;
    };

    // 2. SECRET_SQUARE (1 hidden Daily Double tile per board; stays clean on-board & reveals on tap!)
    const secretTile = pickNextUnassigned(101, (t) => t.baseChips >= 200);
    if (secretTile) {
      secretTile.tvTwist = 'SECRET_SQUARE';
    }

    // Strict 60–65% Clean Classic Category Tile Budget (`7–8` of 12 tiles stay crisp Classic tiles;
    // max `4` visible twist banners on 12-tile boards, max `5` on 13–15 tile boards, max `2` SHOWCASE_BONUS!)
    const maxVisibleTwists = this.context.isBlitzPhase ? 2 : playable.length >= 13 ? 5 : 4;
    let visibleTwistsPlaced = assigned.has(secretTile?.index ?? -1)
      ? assigned.size - 1
      : assigned.size;

    const canPlaceVisibleTwist = (): boolean => visibleTwistsPlaced < maxVisibleTwists;

    // 3. KEY_AND_SAFE Topology: Seed 1 accessible BRASS_KEY tile on lower/mid rows!
    if (topology === 'KEY_AND_SAFE' && !this.context.isBlitzPhase && canPlaceVisibleTwist()) {
      const keyTile = pickNextUnassigned(149, (t) => t.z >= -0.05);
      if (keyTile) {
        keyTile.tvTwist = 'BRASS_KEY';
        keyTile.baseChips = Math.max(keyTile.baseChips, 250);
        visibleTwistsPlaced++;
      }
    }

    // 4. Mode-Signature & Rotating Headline Twist (1–2 distinct stars per board — ZERO Christmas-tree clutter!)
    const strongSet = new Set<CategoryIdV7>(this.getEffectiveStrongCategories());
    const placeMysteryCashOn = (t: BoardTileNodeV7): void => {
      t.tvTwist = 'MYSTERY_CASH';
      t.mysteryCashHidden = true;
      const cashPool = [250, 350, 450, 550, 650] as const;
      const hiddenCash =
        cashPool[this.computeDeterministicBoardHash(t.index * 59 + waveNumber) % cashPool.length];
      this.mysteryCashAmounts.set(t.index, hiddenCash);
    };
    const placeBlindCategoryOn = (t: BoardTileNodeV7): void => {
      t.tvTwist = 'BLIND_CATEGORY';
      t.baseChips = 600;
      t.nominalBaseChips = 600;
      t.blindCategoryHidden = true;
    };
    const placeCurtainOn = (t: BoardTileNodeV7, slotIdx: number): void => {
      t.tvTwist = 'MYSTERY_CURTAIN';
      const num = (playMode === 'MONTY_CURTAIN_DEAL'
        ? (slotIdx % 3) + 1
        : ((waveNumber - 1 + slotIdx) % 3) + 1) as 1 | 2 | 3;
      this.mysteryCurtainNumbers.set(t.index, num);
    };

    if (playMode === 'MONTY_CURTAIN_DEAL') {
      const curtainsWanted = playable.length >= 13 ? 3 : 2;
      for (let c = 0; c < curtainsWanted && visibleTwistsPlaced < maxVisibleTwists - 1; c++) {
        const ct = pickNextUnassigned(307 + c * 41, (t) => !t.hasAmberTruce);
        if (ct) {
          placeCurtainOn(ct, c);
          visibleTwistsPlaced++;
        }
      }
    } else if (playMode === 'BIG_WHEEL_SHOWCASE') {
      const wheelsWanted = this.context.isBlitzPhase ? 1 : playable.length >= 13 ? 3 : 2;
      for (let w = 0; w < wheelsWanted && canPlaceVisibleTwist(); w++) {
        const wt = pickNextUnassigned(173 + w * 37, (t) => !t.hasAmberTruce && t.z >= -0.05);
        if (wt) {
          wt.tvTwist = 'BIG_WHEEL_SPIN';
          wt.baseChips = Math.max(wt.baseChips, 250);
          visibleTwistsPlaced++;
        }
      }
      if (visibleTwistsPlaced < maxVisibleTwists - 1) {
        const accent = pickNextUnassigned(283, (t) => !t.hasAmberTruce);
        if (accent) {
          if ((hashBase & 1) === 0) placeMysteryCashOn(accent);
          else placeBlindCategoryOn(accent);
          visibleTwistsPlaced++;
        }
      }
    } else if (playMode === 'PRESS_YOUR_LUCK_GREMLIN') {
      const luckWanted = this.context.isBlitzPhase ? 1 : 2;
      for (let l = 0; l < luckWanted && canPlaceVisibleTwist(); l++) {
        const lt = pickNextUnassigned(211 + l * 43, (t) => !t.hasAmberTruce && t.z >= -0.05);
        if (lt) {
          lt.tvTwist = 'PRESS_LUCK_SPIN';
          lt.baseChips = Math.max(lt.baseChips, 250);
          visibleTwistsPlaced++;
        }
      }
      if (visibleTwistsPlaced < maxVisibleTwists - 1) {
        const accent = pickNextUnassigned(173, (t) => !t.hasAmberTruce);
        if (accent) {
          accent.tvTwist = 'BIG_WHEEL_SPIN';
          accent.baseChips = Math.max(accent.baseChips, 250);
          visibleTwistsPlaced++;
        }
      }
    } else {
      // Standard & Spatial Modes: Rotate 1 Headline Action Twist + 1 Mystery/Dare Twist (leaving 2 slots for Showcase!)
      const headlinePool: readonly ClassicTvTileTwistV7[] =
        this.context.isCampaignEp1 && waveNumber === 1
          ? ['BIG_WHEEL_SPIN', 'MYSTERY_CURTAIN', 'OPPONENT_CHOICE']
          : ['BIG_WHEEL_SPIN', 'MYSTERY_CURTAIN', 'PRESS_LUCK_SPIN', 'OPPONENT_CHOICE'];
      const chosenHeadline = headlinePool[hashBase % headlinePool.length] ?? 'BIG_WHEEL_SPIN';
      if (visibleTwistsPlaced < maxVisibleTwists - 1) {
        const ht = pickNextUnassigned(
          181,
          chosenHeadline === 'OPPONENT_CHOICE'
            ? (t) => strongSet.has(t.category)
            : (t) => !t.hasAmberTruce,
        );
        if (ht) {
          if (chosenHeadline === 'MYSTERY_CURTAIN') {
            placeCurtainOn(ht, 0);
          } else {
            ht.tvTwist = chosenHeadline;
            if (chosenHeadline === 'BIG_WHEEL_SPIN' || chosenHeadline === 'PRESS_LUCK_SPIN') {
              ht.baseChips = Math.max(ht.baseChips, 250);
            }
          }
          visibleTwistsPlaced++;
        }
      }

      if (!this.context.isBlitzPhase && visibleTwistsPlaced < maxVisibleTwists - 2) {
        const mysteryPool: readonly ('BLIND_CATEGORY' | 'MYSTERY_CASH' | 'OPPONENT_CHOICE')[] =
          chosenHeadline === 'OPPONENT_CHOICE'
            ? ['BLIND_CATEGORY', 'MYSTERY_CASH']
            : ['BLIND_CATEGORY', 'MYSTERY_CASH', 'OPPONENT_CHOICE'];
        const chosenMystery =
          mysteryPool[(hashBase >>> 3) % mysteryPool.length] ?? 'MYSTERY_CASH';
        const mt = pickNextUnassigned(
          257,
          chosenMystery === 'OPPONENT_CHOICE'
            ? (t) => strongSet.has(t.category)
            : chosenMystery === 'BLIND_CATEGORY'
              ? (t) => t.z <= 0.1
              : (t) => !t.hasAmberTruce,
        );
        if (mt) {
          if (chosenMystery === 'BLIND_CATEGORY') placeBlindCategoryOn(mt);
          else if (chosenMystery === 'MYSTERY_CASH') placeMysteryCashOn(mt);
          else mt.tvTwist = 'OPPONENT_CHOICE';
          visibleTwistsPlaced++;
        }
      }
    }

    // 5. SHOWCASE_BONUS (Strictly 1–2 tiles max per board -> ~25% tactile Showcase cadence without clutter!)
    const showcaseSlotsLeft = Math.max(0, Math.min(2, maxVisibleTwists - visibleTwistsPlaced));
    for (let i = 0; i < showcaseSlotsLeft; i++) {
      const showcaseTile = pickNextUnassigned(419 + i * 53);
      if (showcaseTile) {
        showcaseTile.tvTwist = 'SHOWCASE_BONUS';
        visibleTwistsPlaced++;
      }
    }

    // 6. Seed Mode-Specific Hidden Layers & Board Unlock Topology (`PYRAMID_CLIMB`, `KEY_AND_SAFE`, etc.)
    this.seedBoardPlayModeState(tiles, waveNumber);
    this.seedUnlockTopologyState(tiles);

    // 6b. Apply R7 Anti-Repetition Board Mode (`LOUVER_SHUTTER`, `BLIND_PURSE`, `BLACKOUT_VAULT`, `LIVE_WIRE_FUSE`, etc.)
    if (!this.context.isBlitzPhase && isR7BoardPlayModeV9(this.activeBoardModeV9)) {
      const r7Init = applyBoardPlayModeV9(tiles, this.activeBoardModeV9, {
        boardId: this.context.boardId,
        seed: hashBase,
        turnNumber: this.context.turnNumber ?? 1,
        reset: true,
      });
      if (r7Init.highVoltIndices) {
        this.blackoutHighVoltIndices = new Set(r7Init.highVoltIndices);
      }
      if (r7Init.shuffledEnvelopes) {
        this.blindPurseEnvelopes = [...r7Init.shuffledEnvelopes];
      }
    }

    // 6c. Seed 1–2 VIP Celebrity Bluff Squares (`tile.tvTwistV9 = 'VIP_BLUFF'`, keeping `tile.tvTwist = 'NONE'`)
    if (!this.context.isBlitzPhase && playable.length >= 6) {
      const vipBudgetLeft = Math.max(1, Math.min(2, maxVisibleTwists - visibleTwistsPlaced + 1));
      const desiredVipCount: 1 | 2 = vipBudgetLeft >= 2 && playable.length >= 12 ? 2 : 1;
      seedVipBluffTilesOnTiles(tiles, {
        count: desiredVipCount,
        seed: hashBase + 911,
        season: this.context.season,
        excludeBlitz: this.context.isBlitzPhase,
      });
    }

    // 7. Turn-1 Mode-Signature Openness Guarantee (`BIG_WHEEL_SHOWCASE` & `PRESS_YOUR_LUCK_GREMLIN`):
    // Even under `PYRAMID_CLIMB`, `KEY_AND_SAFE`, or `CENTER_STARBURST`, guarantee >= 2 signature
    // Wheel / Gremlin squares are immediately clickable on Turn 1!
    if (
      !this.context.isBlitzPhase &&
      (playMode === 'BIG_WHEEL_SHOWCASE' || playMode === 'PRESS_YOUR_LUCK_GREMLIN')
    ) {
      const sigTwist: ClassicTvTileTwistV7 =
        playMode === 'BIG_WHEEL_SHOWCASE' ? 'BIG_WHEEL_SPIN' : 'PRESS_LUCK_SPIN';
      const openPlayable = playable.filter((t) => !t.isVaultLocked && !t.isTopologyLocked);
      let openSigCount = openPlayable.filter((t) => t.tvTwist === sigTwist).length;
      const targetOpenSig = Math.min(2, openPlayable.length);
      if (openSigCount < targetOpenSig) {
        const lockedSigs = playable.filter(
          (t) => t.tvTwist === sigTwist && (t.isTopologyLocked || t.isVaultLocked),
        );
        const swapTargets = openPlayable.filter(
          (t) =>
            t.tvTwist !== sigTwist &&
            t.tvTwist !== 'BRASS_KEY' &&
            t.tvTwist !== 'SECRET_SQUARE',
        );
        for (const dst of swapTargets) {
          if (openSigCount >= targetOpenSig) break;
          const lockedDonor = lockedSigs.shift();
          if (lockedDonor && !lockedDonor.isVaultLocked) {
            lockedDonor.tvTwist = dst.tvTwist;
          }
          dst.tvTwist = sigTwist;
          dst.blindCategoryHidden = false;
          dst.mysteryCashHidden = false;
          dst.baseChips = Math.max(dst.baseChips, 250);
          openSigCount++;
        }
      }
    }
  }

  public getActivePlayMode(): BoardPlayModeV7 {
    return (
      this.context.playModeOverride ??
      BOARD_PLAY_MODE_BY_BOARD_V7[this.context.boardId] ??
      'CLASSIC_TOTE'
    );
  }

  public getActiveBoardModeV9(): BoardPlayModeV9 {
    return this.activeBoardModeV9;
  }

  public getPressureCookerMult(): number {
    return getPressureCookerMultiplierV9(this.pressureCookerStreak);
  }

  public getBlackoutHighVoltIndices(): ReadonlySet<number> {
    return this.blackoutHighVoltIndices;
  }

  public getBlindPurseRemainingEnvelopes(tiles: readonly BoardTileNodeV7[]): readonly number[] {
    return tiles
      .filter((t) => (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') && t.mysteryCashHidden)
      .map((t) => t.baseChips)
      .sort((a, b) => b - a);
  }

  public getBoardModeRuleBannerV9(): BoardModeRuleBannerV9 {
    const mode = this.getActiveBoardModeV9();
    const base = BOARD_MODE_RULE_BANNERS_V9[mode] ?? BOARD_MODE_RULE_BANNERS_V9.CLASSIC_TOTE;
    const topo = this.getActiveUnlockTopology();
    if (topo === 'CLASSIC_OPEN' || isR7BoardPlayModeV9(mode)) {
      return {
        ...base,
        compactTitle: base.compactTitle ?? base.modeTitle,
        compactRuleSummary: base.compactRuleSummary ?? base.ruleSummary,
        unlockTopology: topo,
      };
    }
    const topoSpec = BOARD_UNLOCK_TOPOLOGY_SPECS_V7[topo];
    return {
      ...base,
      modeTitle: `${base.modeTitle} · ${topoSpec.badge}`,
      ruleSummary: `${topoSpec.shortRule} ${base.ruleSummary}`,
      compactTitle: `${base.compactTitle ?? base.modeTitle} · ${topoSpec.badge}`,
      compactRuleSummary: `${topoSpec.compactRule} · ${base.compactRuleSummary ?? base.ruleSummary}`,
      unlockTopology: topo,
      topologyBadge: topoSpec.badge,
    };
  }

  public getActiveUnlockTopology(): BoardUnlockTopologyV7 {
    if (this.context.isBlitzPhase) return 'CLASSIC_OPEN';
    return this.context.unlockTopology ?? 'CLASSIC_OPEN';
  }

  public getActiveSpotlightIndices(): readonly number[] {
    return this.activeSpotlightIndices;
  }

  public getBoardModeRuleBanner(): BoardModeRuleBannerV7 {
    const base = BOARD_MODE_RULE_BANNERS_V7[this.getActivePlayMode()];
    const topo = this.getActiveUnlockTopology();
    if (topo === 'CLASSIC_OPEN') {
      return {
        ...base,
        compactTitle: base.compactTitle ?? base.modeTitle,
        compactRuleSummary: base.compactRuleSummary ?? base.ruleSummary,
        unlockTopology: topo,
      };
    }
    const topoSpec = BOARD_UNLOCK_TOPOLOGY_SPECS_V7[topo];
    const baseCompactTitle = base.compactTitle ?? base.modeTitle;
    const baseCompactRule = base.compactRuleSummary ?? base.ruleSummary;
    return {
      ...base,
      modeTitle: `${base.modeTitle} · ${topoSpec.badge}`,
      ruleSummary: `${topoSpec.shortRule} ${base.ruleSummary}`,
      compactTitle: `${baseCompactTitle} · ${topoSpec.badge}`,
      compactRuleSummary: `${topoSpec.compactRule} · ${baseCompactRule}`,
      unlockTopology: topo,
      topologyBadge: topoSpec.badge,
    };
  }

  private ensureMinimumOpenTopologyTiles(tiles: BoardTileNodeV7[], minOpen = 3): void {
    // LIVE_WIRE_FUSE starts with strictly 1 starter tile open (`minOpen = 1` enforced by Emergency Circuit Breaker)!
    const effectiveMinOpen = this.activeBoardModeV9 === 'LIVE_WIRE_FUSE' ? 1 : minOpen;
    const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
    const currentlyAvailable = playable.filter(
      (t) => !t.isVaultLocked && !t.isTopologyLocked && !t.isLiveWireLocked,
    );
    if (currentlyAvailable.length >= Math.min(effectiveMinOpen, playable.length)) return;

    const lockedCandidates = playable
      .filter((t) => (t.isTopologyLocked || t.isLiveWireLocked) && !t.isVaultLocked)
      .sort((a, b) => b.z - a.z || Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z) || a.index - b.index);

    let need = Math.min(effectiveMinOpen, playable.length) - currentlyAvailable.length;
    for (const cand of lockedCandidates) {
      if (need <= 0) break;
      cand.isTopologyLocked = false;
      cand.isLiveWireLocked = false;
      need--;
    }
  }

  public seedUnlockTopologyState(tiles: BoardTileNodeV7[]): void {
    this.activeSpotlightIndices = [];
    const topo = this.getActiveUnlockTopology();
    const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
    if (playable.length === 0 || topo === 'CLASSIC_OPEN') {
      for (const t of tiles) t.isTopologyLocked = false;
      return;
    }

    if (topo === 'PYRAMID_CLIMB') {
      // Bottom row (`maxZ` band) starts open; mid & upper rows unlock as you climb!
      const maxZ = Math.max(...playable.map((t) => t.z));
      for (const t of playable) {
        t.isTopologyLocked = t.z < maxZ - 0.34 && !t.isVaultLocked;
      }
      this.ensureMinimumOpenTopologyTiles(tiles, 4);
      return;
    }

    if (topo === 'KEY_AND_SAFE') {
      // Lock 2–3 high-dollar Safe tiles (`$500`) until a `🗝️ BRASS_KEY` tile is won!
      const safeCandidates = [...playable]
        .filter((t) => t.tvTwist !== 'BRASS_KEY' && !t.isVaultLocked)
        .sort((a, b) => -a.z - -b.z || b.baseChips - a.baseChips || a.index - b.index);
      const safeCount = Math.min(2, Math.max(1, Math.floor(playable.length / 5)));
      const safeSet = new Set(safeCandidates.slice(0, safeCount).map((t) => t.index));
      for (const t of playable) {
        if (safeSet.has(t.index)) {
          t.isTopologyLocked = true;
          t.baseChips = Math.max(t.baseChips, 500);
        } else {
          t.isTopologyLocked = false;
        }
      }
      this.ensureMinimumOpenTopologyTiles(tiles, 4);
      return;
    }

    if (topo === 'CENTER_STARBURST') {
      // Closest 4 center hub tiles start open; outer ring unlocks via adjacency!
      const byCenterDist = [...playable].sort(
        (a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z) || a.index - b.index,
      );
      const hubSet = new Set(byCenterDist.slice(0, Math.min(4, playable.length)).map((t) => t.index));
      for (const t of playable) {
        t.isTopologyLocked = !hubSet.has(t.index) && !t.isVaultLocked;
      }
      this.ensureMinimumOpenTopologyTiles(tiles, 4);
      return;
    }

    if (topo === 'ROVING_SPOTLIGHT') {
      this.refreshRovingSpotlight(tiles);
    }
  }

  public refreshRovingSpotlight(tiles: BoardTileNodeV7[]): readonly number[] {
    if (this.getActiveUnlockTopology() !== 'ROVING_SPOTLIGHT') {
      this.activeSpotlightIndices = [];
      return [];
    }
    const candidates = tiles.filter(
      (t) => (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') && !t.isVaultLocked,
    );
    if (candidates.length === 0) {
      this.activeSpotlightIndices = [];
      return [];
    }
    const targetLit = Math.min(candidates.length, Math.max(4, Math.ceil(candidates.length * 0.42)));
    const ordered = [...candidates].sort((a, b) => {
      const ha = this.computeDeterministicBoardHash(
        a.index * 61 + this.gimmick.turnCounter * 131 + this.activeWaveNumber * 17,
      );
      const hb = this.computeDeterministicBoardHash(
        b.index * 61 + this.gimmick.turnCounter * 131 + this.activeWaveNumber * 17,
      );
      return ha - hb;
    });
    const litSet = new Set(ordered.slice(0, targetLit).map((t) => t.index));
    for (const t of candidates) {
      t.isTopologyLocked = !litSet.has(t.index);
    }
    this.activeSpotlightIndices = Array.from(litSet);
    return this.activeSpotlightIndices;
  }

  /**
   * Unlocks topology-gated tiles after a claim (`PYRAMID_CLIMB`, `CENTER_STARBURST`,
   * `KEY_AND_SAFE` with **1-Turn Keyholder Priority Shield**, or advances `ROVING_SPOTLIGHT`).
   */
  public unlockTopologyAfterClaim(
    claimedIdx: number,
    tiles: BoardTileNodeV7[],
    scored: boolean,
    isPlayerClaim = true,
  ): {
    readonly unlockedIndices: readonly number[];
    readonly keyProtectedSafeIdx: number | null;
    readonly spotlightIndices: readonly number[];
  } {
    const topo = this.getActiveUnlockTopology();
    const claimed = tiles.find((t) => t.index === claimedIdx);
    const unlockedIndices: number[] = [];
    let keyProtectedSafeIdx: number | null = null;

    if (topo === 'PYRAMID_CLIMB' || topo === 'CENTER_STARBURST') {
      if (scored && claimed) {
        for (const t of tiles) {
          if (
            t.isTopologyLocked &&
            (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') &&
            Math.hypot(t.x - claimed.x, t.z - claimed.z) <= 1.28
          ) {
            t.isTopologyLocked = false;
            unlockedIndices.push(t.index);
          }
        }
      }
      this.ensureMinimumOpenTopologyTiles(tiles, 3);
    } else if (topo === 'KEY_AND_SAFE') {
      if (scored && claimed?.tvTwist === 'BRASS_KEY') {
        const lockedSafes = tiles
          .filter((t) => t.isTopologyLocked && (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR'))
          .sort((a, b) => b.baseChips - a.baseChips || a.index - b.index);
        const safe = lockedSafes[0];
        if (safe) {
          safe.isTopologyLocked = false;
          // 1-Turn Keyholder Priority: when Player unlocks a Safe, shield it from CPU sniping on the upcoming Rival turn!
          if (isPlayerClaim) {
            safe.keyholderProtectedTurns = 1;
            keyProtectedSafeIdx = safe.index;
          }
          unlockedIndices.push(safe.index);
        }
      }
      this.ensureMinimumOpenTopologyTiles(tiles, 3);
    } else if (topo === 'ROVING_SPOTLIGHT') {
      this.refreshRovingSpotlight(tiles);
    }

    if (unlockedIndices.length > 0 || topo === 'ROVING_SPOTLIGHT') {
      this.recomputeBoardModifiers(tiles);
    }

    return {
      unlockedIndices,
      keyProtectedSafeIdx,
      spotlightIndices: this.activeSpotlightIndices,
    };
  }

  /**
   *Expires 1-Turn Keyholder Priority shields right after the Rival's turn completes,
   *after having protected the newly unlocked Safe from CPU sniping!
   */
  public tickKeyholderProtectionAfterRivalTurn(tiles: BoardTileNodeV7[]): boolean {
    let changed = false;
    for (const t of tiles) {
      if (t.keyholderProtectedTurns && t.keyholderProtectedTurns > 0) {
        t.keyholderProtectedTurns = Math.max(0, t.keyholderProtectedTurns - 1);
        changed = true;
      }
    }
    return changed;
  }

  /**
   * Unseals a `BLIND_CATEGORY` (`$600 · ???`) or `MYSTERY_CASH` (`CAT · $???`) tile on tap!
   */
  public revealBlindOrMysteryTile(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
  ): {
    readonly wasBlindCategory: boolean;
    readonly wasMysteryCash: boolean;
    readonly revealedCategory?: CategoryIdV7;
    readonly revealedCash?: number;
  } {
    const tile = tiles.find((t) => t.index === tileIndex);
    if (!tile) {
      return { wasBlindCategory: false, wasMysteryCash: false };
    }
    if (tile.tvTwist === 'BLIND_CATEGORY' && tile.blindCategoryHidden) {
      tile.blindCategoryHidden = false;
      this.recomputeBoardModifiers(tiles);
      return {
        wasBlindCategory: true,
        wasMysteryCash: false,
        revealedCategory: tile.category,
      };
    }
    if (tile.tvTwist === 'MYSTERY_CASH' && tile.mysteryCashHidden) {
      tile.mysteryCashHidden = false;
      const cash = this.mysteryCashAmounts.get(tileIndex) ?? 400;
      tile.nominalBaseChips = cash;
      tile.baseChips = this.context.isAct3Showdown
        ? Math.min(900, Math.round((cash * 1.5) / 50) * 50)
        : cash;
      this.recomputeBoardModifiers(tiles);
      return {
        wasBlindCategory: false,
        wasMysteryCash: true,
        revealedCash: cash,
      };
    }
    if (tile.blindCategoryHidden || tile.mysteryCashHidden) {
      const wasBlindCategory = Boolean(tile.blindCategoryHidden);
      const wasMysteryCash = Boolean(tile.mysteryCashHidden);
      tile.blindCategoryHidden = false;
      tile.mysteryCashHidden = false;
      this.recomputeBoardModifiers(tiles);
      return {
        wasBlindCategory,
        wasMysteryCash,
        revealedCategory: wasBlindCategory ? tile.category : undefined,
        revealedCash: wasMysteryCash ? tile.baseChips : undefined,
      };
    }
    return { wasBlindCategory: false, wasMysteryCash: false };
  }

  /**
   * Act-3 (`Turns 8–10`) DOUBLE-DOLLARS SHOWDOWN: boosts all open tile stakes by `1.5x`
   * (rounded to crisp `$50` studio tote increments)!
   */
  public applyAct3DoubleDollarsBoost(tiles: BoardTileNodeV7[]): void {
    this.context = { ...this.context, isAct3Showdown: true };
    for (const t of tiles) {
      if ((t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') && !this.act2BoostedTiles.has(t)) {
        this.act2BoostedTiles.add(t);
        t.nominalBaseChips = t.nominalBaseChips ?? t.baseChips;
        t.baseChips = Math.min(900, Math.round((t.baseChips * 1.5) / 50) * 50);
      }
    }
    this.recomputeBoardModifiers(tiles);
  }

  public getEyeGuessHiddenBadge(tileIndex: number): EyeGuessHiddenBadgeV7 {
    return this.eyeGuessBadges.get(tileIndex) ?? 'NONE';
  }

  public getConcentrationPrize(tileIndex: number): ConcentrationPrizeKindV7 {
    return this.concentrationPrizes.get(tileIndex) ?? 'NONE';
  }

  public isConcentrationTileRevealed(tileIndex: number): boolean {
    return this.revealedConcentrationTiles.has(tileIndex);
  }

  private seedBoardPlayModeState(tiles: BoardTileNodeV7[], waveNumber: number): void {
    this.eyeGuessBadges.clear();
    this.awardedTicTacLines.clear();
    this.awardedDominoGroups.clear();
    this.awardedMarqueeLines.clear();
    if (waveNumber <= 1) {
      this.coastToCoastAwarded = false;
    }

    const playMode = this.getActivePlayMode();
    const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
    if (playable.length === 0) return;

    // Deterministic permutation of playable indices
    const order = [...playable].sort((a, b) => {
      const ha = this.computeDeterministicBoardHash(a.index * 97 + waveNumber * 43 + 7);
      const hb = this.computeDeterministicBoardHash(b.index * 97 + waveNumber * 43 + 7);
      return ha - hb;
    });

    if (playMode === 'EYE_GUESS_MEMORY') {
      // Never place Eye Guess memory-flash badges onto Locked Gold Vault tiles (prevents 3D padlock overlap with FLASH banner!)
      const eyeOrder = order.filter((t) => !t.isVaultLocked && t.tvTwist !== 'LOCKED_VAULT');
      const pattern: readonly EyeGuessHiddenBadgeV7[] = [
        'DOUBLE_2X',
        'DOUBLE_2X',
        'CASH_300',
        'CASH_300',
        'TRAP',
        'TRAP',
      ];
      for (let i = 0; i < Math.min(pattern.length, eyeOrder.length); i++) {
        this.eyeGuessBadges.set(eyeOrder[i].index, pattern[i]);
      }
    } else if (playMode === 'CONCENTRATION_PRIZE_MATCH') {
      // Preserve uncovered pairs & `revealedConcentrationPrize` stamps across Act II replenishment (`waveNumber > 1`)!
      if (waveNumber > 1 && this.concentrationPrizes.size > 0) {
        const byIdx = new Map(tiles.map((t) => [t.index, t]));
        for (const [idx, prize] of Array.from(this.concentrationPrizes.entries())) {
          const t = byIdx.get(idx);
          if (!t || t.state === 'RETRACTED') continue;
          if (this.awardedPrizePackages.has(prize)) {
            this.concentrationPrizes.delete(idx);
            this.revealedConcentrationTiles.delete(idx);
            this.concentrationTileClaimer.delete(idx);
            t.revealedConcentrationPrize = undefined;
          } else if (this.revealedConcentrationTiles.has(idx) && prize !== 'NONE') {
            t.revealedConcentrationPrize = CONCENTRATION_PRIZE_NAMES_V7[prize];
          }
        }
        return;
      }

      this.concentrationPrizes.clear();
      this.revealedConcentrationTiles.clear();
      this.concentrationTileClaimer.clear();
      this.awardedPrizePackages.clear();
      for (const t of tiles) {
        t.revealedConcentrationPrize = undefined;
      }

      const prizes: readonly ConcentrationPrizeKindV7[] = [
        'COLOR_TV',
        'COLOR_TV',
        'CONVERTIBLE',
        'CONVERTIBLE',
        'HAWAII_TRIP',
        'HAWAII_TRIP',
        'TAKE_STEAL',
        'TAKE_STEAL',
      ];
      for (let i = 0; i < Math.min(prizes.length, order.length); i++) {
        this.concentrationPrizes.set(order[i].index, prizes[i]);
      }
    } else if (waveNumber <= 1) {
      this.concentrationPrizes.clear();
      this.revealedConcentrationTiles.clear();
      this.concentrationTileClaimer.clear();
      this.awardedPrizePackages.clear();
    }
  }

  /**
   * Finds all 3-in-a-row collinear lines (horizontal, vertical, or diagonal) among
   * the given tile coordinates, working cleanly across BOTH Landscape and Portrait grids!
   */
  private findPlayerThreeInARowLines(
    tiles: BoardTileNodeV7[],
    extraAssumedPlayerIdx?: number,
  ): Array<readonly [number, number, number]> {
    const owned = tiles.filter(
      (t) => t.state === 'CLAIMED_PLAYER' || t.index === extraAssumedPlayerIdx,
    );
    if (owned.length < 3) return [];

    const lines: Array<readonly [number, number, number]> = [];
    for (let i = 0; i < owned.length; i++) {
      for (let j = i + 1; j < owned.length; j++) {
        for (let k = j + 1; k < owned.length; k++) {
          const pts = [owned[i], owned[j], owned[k]].sort((a, b) => a.x - b.x || a.z - b.z);
          const [a, b, c] = pts;
          const d1 = Math.hypot(b.x - a.x, b.z - a.z);
          const d2 = Math.hypot(c.x - b.x, c.z - b.z);
          // Adjacent neighbor hops in Landscape or Portrait (`<= 1.24m`) and roughly equal spacing
          if (d1 < 0.35 || d1 > 1.24 || d2 < 0.35 || d2 > 1.24) continue;
          if (Math.abs(d1 - d2) > 0.28) continue;

          // Collinearity check via normalized cross product (`|sin(angle)| < 0.18`)
          const ux = (b.x - a.x) / d1;
          const uz = (b.z - a.z) / d1;
          const vx = (c.x - b.x) / d2;
          const vz = (c.z - b.z) / d2;
          const dot = ux * vx + uz * vz;
          const cross = Math.abs(ux * vz - uz * vx);
          if (dot > 0.94 && cross < 0.18) {
            const sortedIds = [a.index, b.index, c.index].sort((m, n) => m - n) as [
              number,
              number,
              number,
            ];
            lines.push(sortedIds);
          }
        }
      }
    }
    return lines;
  }

  /**
   * BFS pathfinder for `COAST_HEX_BRIDGE`: checks whether Player-claimed tiles (plus any
   * hypothetical `extraAssumedPlayerIndices` tested by CPU lookahead!) form a continuous
   * adjacent bridge from the Leftmost Edge (NYC) to the Rightmost Edge (Hollywood)!
   * Returns the ordered tile indices along the bridge path, or `[]` when not yet connected.
   */
  public findCoastToCoastBridgePath(
    tiles: BoardTileNodeV7[],
    ...extraAssumedPlayerIndices: number[]
  ): readonly number[] {
    const assumedSet =
      extraAssumedPlayerIndices.length > 0 ? new Set<number>(extraAssumedPlayerIndices) : null;
    const owned = tiles.filter(
      (t) =>
        t.state !== 'RETRACTED' &&
        (t.state === 'CLAIMED_PLAYER' || (assumedSet !== null && assumedSet.has(t.index))),
    );
    if (owned.length < 2) return [];

    let minBoardX = Infinity;
    let maxBoardX = -Infinity;
    for (const t of tiles) {
      if (t.state === 'RETRACTED') continue;
      if (t.x < minBoardX) minBoardX = t.x;
      if (t.x > maxBoardX) maxBoardX = t.x;
    }
    const leftThresh = minBoardX + 0.38;
    const rightThresh = maxBoardX - 0.38;

    const starts = owned.filter((t) => t.x <= leftThresh);
    const goalSet = new Set(owned.filter((t) => t.x >= rightThresh).map((t) => t.index));
    if (starts.length === 0 || goalSet.size === 0) return [];

    const queue: number[][] = starts.map((s) => [s.index]);
    const visited = new Set<number>(starts.map((s) => s.index));
    const byIdx = new Map(owned.map((t) => [t.index, t]));

    while (queue.length > 0) {
      const path = queue.shift()!;
      const currIdx = path[path.length - 1];
      if (goalSet.has(currIdx)) return path;
      const curr = byIdx.get(currIdx)!;

      for (const nxt of owned) {
        if (visited.has(nxt.index)) continue;
        const dist = Math.hypot(nxt.x - curr.x, nxt.z - curr.z);
        if (dist <= 1.24) {
          visited.add(nxt.index);
          queue.push([...path, nxt.index]);
        }
      }
    }
    return [];
  }

  /**
   * 0-1 Shortest-Path & Cut-Vertex analyzer for `COAST_HEX_BRIDGE` CPU lookahead:
   * Computes exact minimum unowned steps needed for the Player to bridge Left-to-Right,
   * identifies 1-step winning tiles, 2-step bridge pairs, and shortest-path chokepoints!
   */
  private analyzeCoastBridgeChokepoints(tiles: BoardTileNodeV7[]): {
    readonly minStepsNow: number;
    readonly oneStepSet: ReadonlySet<number>;
    readonly twoStepPairCounts: ReadonlyMap<number, number>;
    readonly cutVertexDelta: ReadonlyMap<number, number>;
  } {
    const active = tiles.filter((t) => t.state !== 'RETRACTED');
    if (active.length === 0) {
      return {
        minStepsNow: Infinity,
        oneStepSet: new Set(),
        twoStepPairCounts: new Map(),
        cutVertexDelta: new Map(),
      };
    }

    let minBoardX = Infinity;
    let maxBoardX = -Infinity;
    for (const t of active) {
      if (t.x < minBoardX) minBoardX = t.x;
      if (t.x > maxBoardX) maxBoardX = t.x;
    }
    const leftThresh = minBoardX + 0.38;
    const rightThresh = maxBoardX - 0.38;

    const computeMinMissingSteps = (blockedTileIdx?: number): number => {
      const passable = active.filter(
        (t) => t.state !== 'CLAIMED_RIVAL' && t.index !== blockedTileIdx,
      );
      if (passable.length === 0) return Infinity;
      const distMap = new Map<number, number>();
      const deque: BoardTileNodeV7[] = [];

      for (const s of passable) {
        if (s.x <= leftThresh) {
          const startCost = s.state === 'CLAIMED_PLAYER' ? 0 : 1;
          distMap.set(s.index, startCost);
          if (startCost === 0) deque.unshift(s);
          else deque.push(s);
        }
      }
      if (deque.length === 0) return Infinity;

      while (deque.length > 0) {
        const curr = deque.shift()!;
        const currD = distMap.get(curr.index) ?? Infinity;
        if (curr.x >= rightThresh) {
          return currD;
        }
        for (const nxt of passable) {
          if (nxt.index === curr.index) continue;
          if (Math.hypot(nxt.x - curr.x, nxt.z - curr.z) > 1.24) continue;
          const stepCost = nxt.state === 'CLAIMED_PLAYER' ? 0 : 1;
          const nextD = currD + stepCost;
          if (nextD < (distMap.get(nxt.index) ?? Infinity)) {
            distMap.set(nxt.index, nextD);
            if (stepCost === 0) deque.unshift(nxt);
            else deque.push(nxt);
          }
        }
      }
      return Infinity;
    };

    const minStepsNow = computeMinMissingSteps();
    const openCandidates = active.filter(
      (t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR',
    );
    const oneStepSet = new Set<number>();
    const twoStepPairCounts = new Map<number, number>();
    const cutVertexDelta = new Map<number, number>();

    for (const c of openCandidates) {
      if (this.findCoastToCoastBridgePath(tiles, c.index).length > 0) {
        oneStepSet.add(c.index);
      }
      if (Number.isFinite(minStepsNow)) {
        const withoutC = computeMinMissingSteps(c.index);
        const delta = !Number.isFinite(withoutC) ? 99 : Math.max(0, withoutC - minStepsNow);
        if (delta > 0) {
          cutVertexDelta.set(c.index, delta);
        }
      }
    }

    if (oneStepSet.size === 0 && minStepsNow <= 2) {
      for (let i = 0; i < openCandidates.length; i++) {
        for (let j = i + 1; j < openCandidates.length; j++) {
          const a = openCandidates[i].index;
          const b = openCandidates[j].index;
          if (this.findCoastToCoastBridgePath(tiles, a, b).length > 0) {
            twoStepPairCounts.set(a, (twoStepPairCounts.get(a) ?? 0) + 1);
            twoStepPairCounts.set(b, (twoStepPairCounts.get(b) ?? 0) + 1);
          }
        }
      }
    }

    return {
      minStepsNow,
      oneStepSet,
      twoStepPairCounts,
      cutVertexDelta,
    };
  }

  /**
   * Evaluates v9 R7 board modes (`LOUVER_SHUTTER`, `BLIND_PURSE`, `BLACKOUT_VAULT`,
   * `LIVE_WIRE_FUSE`, `SHIFTING_SPOTLIGHT`, `GOLDEN_DOMINO_CASCADE`, `PRESSURE_COOKER`,
   * `HOLLYWOOD_MARQUEE_LINE`) or delegates to v7 for both Player and Rival turns.
   */
  public resolvePostTurnBoardModeV9(
    claimedIdx: number,
    tiles: BoardTileNodeV7[],
    actor: 'PLAYER' | 'RIVAL',
    scored: boolean,
  ): BoardModePostClaimResultV9 {
    const mode = this.getActiveBoardModeV9();
    if (isR7BoardPlayModeV9(mode)) {
      const stateRef: ResolvePostTurnEngineStateV9 = {
        pressureCookerStreak: this.pressureCookerStreak,
        awardedDominoGroups: this.awardedDominoGroups,
        awardedMarqueeLines: this.awardedMarqueeLines,
      };
      const res = resolvePostTurnBoardModeV9({
        tiles,
        mode,
        claimedIdx,
        actor,
        scored,
        boardId: this.context.boardId,
        turnNumber: this.context.turnNumber ?? this.gimmick.turnCounter + 1,
        seed: this.computeDeterministicBoardHash(this.gimmick.turnCounter * 43 + claimedIdx * 17),
        engineState: stateRef,
      });
      this.pressureCookerStreak = stateRef.pressureCookerStreak;
      this.recomputeBoardModifiers(tiles);
      return res;
    }

    if (actor === 'PLAYER') {
      const v7Res = this.evaluateBoardModePostClaim(claimedIdx, tiles, scored);
      return {
        ...v7Res,
        modeV7Fallback: v7Res.mode,
      };
    }

    return {
      mode,
      modeV7Fallback: toV7BoardPlayModeFallback(mode),
      bonusCash: 0,
      rivalStealCash: 0,
      multAdd: 0,
      bannerHeadline: null,
    };
  }

  /**
   * Evaluates all 8 v7 Board Gameplay Modes (and R7 modes via safe `CLASSIC_TOTE` fallback)
   * immediately after a Player claim!
   */
  public evaluateBoardModePostClaim(
    claimedIdx: number,
    tiles: BoardTileNodeV7[],
    scored: boolean,
  ): BoardModePostClaimResultV7 {
    if (isR7BoardPlayModeV9(this.activeBoardModeV9)) {
      const r9 = this.resolvePostTurnBoardModeV9(claimedIdx, tiles, 'PLAYER', scored);
      return {
        mode: r9.modeV7Fallback,
        bonusCash: r9.bonusCash,
        rivalStealCash: r9.rivalStealCash,
        multAdd: r9.multAdd,
        bannerHeadline: r9.bannerHeadline,
        highlightedTileIndices: r9.highlightedTileIndices,
        earnedGremlinSpins: r9.earnedGremlinSpins,
        triggerBigWheel: r9.triggerBigWheel,
        matchedPrize: r9.matchedPrize,
      };
    }

    const mode = this.getActivePlayMode();
    const tile = tiles.find((t) => t.index === claimedIdx);
    if (!tile) {
      return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
    }

    switch (mode) {
      case 'TIC_TAC_LINE': {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        const allLines = this.findPlayerThreeInARowLines(tiles);
        for (const line of allLines) {
          const key = line.join('-');
          if (!this.awardedTicTacLines.has(key)) {
            this.awardedTicTacLines.add(key);
            return {
              mode,
              bonusCash: 600,
              rivalStealCash: 0,
              multAdd: 0.5,
              bannerHeadline: '⭐ 3-IN-A-ROW HOLLYWOOD LINE! +$600 LINE JACKPOT!',
              highlightedTileIndices: line,
            };
          }
        }
        return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
      }

      case 'COAST_HEX_BRIDGE': {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        const adjLinks = this.countAdjacentClaimedPlayer(tile, tiles);
        const linkMult = roundTo2(Math.min(0.75, adjLinks * 0.25));
        if (!this.coastToCoastAwarded) {
          const bridgePath = this.findCoastToCoastBridgePath(tiles);
          if (bridgePath.length > 0) {
            this.coastToCoastAwarded = true;
            return {
              mode,
              bonusCash: 750,
              rivalStealCash: 0,
              multAdd: linkMult,
              bannerHeadline: '🌉 COAST-TO-COAST NYC ➔ HOLLYWOOD BRIDGE! +$750 BONUS!',
              highlightedTileIndices: bridgePath,
            };
          }
        }
        if (adjLinks > 0) {
          return {
            mode,
            bonusCash: adjLinks * 50,
            rivalStealCash: 0,
            multAdd: linkMult,
            bannerHeadline: `🔗 BRIDGE LINK ×${adjLinks}! +${linkMult.toFixed(2)}× · +$${adjLinks * 50}`,
            highlightedTileIndices: [claimedIdx],
          };
        }
        return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
      }

      case 'EYE_GUESS_MEMORY': {
        const badge = this.eyeGuessBadges.get(claimedIdx) ?? 'NONE';
        if (badge === 'TRAP') {
          return {
            mode,
            bonusCash: -100,
            rivalStealCash: 0,
            multAdd: 0,
            bannerHeadline: '⚡ EYE GUESS TRAP! -$100 STUDIO ZONK!',
            highlightedTileIndices: [claimedIdx],
          };
        }
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        if (badge === 'DOUBLE_2X') {
          return {
            mode,
            bonusCash: 0,
            rivalStealCash: 0,
            multAdd: 1.0,
            bannerHeadline: '★ EYE GUESS MEMORY HIT! 2× DOUBLE BONUS!',
            highlightedTileIndices: [claimedIdx],
          };
        }
        if (badge === 'CASH_300') {
          return {
            mode,
            bonusCash: 300,
            rivalStealCash: 0,
            multAdd: 0,
            bannerHeadline: '★ EYE GUESS MEMORY JACKPOT! +$300 BONUS!',
            highlightedTileIndices: [claimedIdx],
          };
        }
        return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
      }

      case 'CONCENTRATION_PRIZE_MATCH': {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        const prize = this.concentrationPrizes.get(claimedIdx) ?? 'NONE';
        if (prize === 'NONE') {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        const prizeName = CONCENTRATION_PRIZE_NAMES_V7[prize];
        tile.revealedConcentrationPrize = prizeName;
        this.revealedConcentrationTiles.add(claimedIdx);
        this.concentrationTileClaimer.set(claimedIdx, 'PLAYER');

        const siblingIndices = Array.from(this.concentrationPrizes.entries())
          .filter(([idx, p]) => idx !== claimedIdx && p === prize)
          .map(([idx]) => idx);
        const rivalSiblingIdx = siblingIndices.find((sibIdx) => {
          const sibTile = tiles.find((t) => t.index === sibIdx);
          return (
            sibTile?.state === 'CLAIMED_RIVAL' ||
            this.concentrationTileClaimer.get(sibIdx) === 'RIVAL'
          );
        });

        if (prize === 'TAKE_STEAL') {
          if (rivalSiblingIdx !== undefined && !this.awardedPrizePackages.has(prize)) {
            this.awardedPrizePackages.add(prize);
            const sibTile = tiles.find((t) => t.index === rivalSiblingIdx);
            if (sibTile && !sibTile.revealedConcentrationPrize) {
              sibTile.revealedConcentrationPrize = prizeName;
            }
            return {
              mode,
              bonusCash: 250,
              rivalStealCash: 200,
              multAdd: 0.25,
              matchedPrize: `PRIZE MATCH STEAL: ${prizeName}`,
              bannerHeadline: `⚡ PRIZE MATCH STEAL: ${prizeName}! +$250 BONUS + TAKE $200!`,
              highlightedTileIndices: [rivalSiblingIdx, claimedIdx],
            };
          }
          return {
            mode,
            bonusCash: 0,
            rivalStealCash: 200,
            multAdd: 0,
            bannerHeadline: '⚡ CONCENTRATION TAKE! Swiped up to $200 from Champion!',
            highlightedTileIndices: [claimedIdx],
          };
        }

        // Prize Match Steal: sibling half was already claimed by the CPU Champion!
        if (rivalSiblingIdx !== undefined && !this.awardedPrizePackages.has(prize)) {
          this.awardedPrizePackages.add(prize);
          const sibTile = tiles.find((t) => t.index === rivalSiblingIdx);
          if (sibTile && !sibTile.revealedConcentrationPrize) {
            sibTile.revealedConcentrationPrize = prizeName;
          }
          return {
            mode,
            bonusCash: 250,
            rivalStealCash: 0,
            multAdd: 0.25,
            matchedPrize: `PRIZE MATCH STEAL: ${prizeName}`,
            bannerHeadline: `⚡ PRIZE MATCH STEAL: ${prizeName}! +$250 BONUS!`,
            highlightedTileIndices: [rivalSiblingIdx, claimedIdx],
          };
        }

        const matchingRevealed = Array.from(this.revealedConcentrationTiles).filter(
          (idx) => this.concentrationPrizes.get(idx) === prize,
        );
        if (matchingRevealed.length >= 2 && !this.awardedPrizePackages.has(prize)) {
          this.awardedPrizePackages.add(prize);
          return {
            mode,
            bonusCash: 500,
            rivalStealCash: 0,
            multAdd: 0.25,
            matchedPrize: prizeName,
            bannerHeadline: `🏆 PRIZE MATCH: ${prizeName} PACKAGE! +$500!`,
            highlightedTileIndices: matchingRevealed,
          };
        }
        return {
          mode,
          bonusCash: 75,
          rivalStealCash: 0,
          multAdd: 0,
          bannerHeadline: `🎁 PRIZE HALF FOUND: ${prizeName} (1/2) — Match twin for +$500!`,
          highlightedTileIndices: [claimedIdx],
        };
      }

      case 'MONTY_CURTAIN_DEAL': {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        if (tile.tvTwist === 'MYSTERY_CURTAIN') {
          return {
            mode,
            bonusCash: 150,
            rivalStealCash: 0,
            multAdd: 0.25,
            bannerHeadline: "🎪 LET'S MAKE A DEAL BONUS! +$150 CURTAIN SWEETENER!",
            highlightedTileIndices: [claimedIdx],
          };
        }
        return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
      }

      case 'PRESS_YOUR_LUCK_GREMLIN': {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        const spins = tile.tvTwist === 'PRESS_LUCK_SPIN' ? 2 : 1;
        return {
          mode,
          bonusCash: 0,
          rivalStealCash: 0,
          multAdd: 0,
          bannerHeadline:
            spins >= 2
              ? '⚡ DOUBLE LUCK SPINS EARNED (2 SPINS)!'
              : '⚡ +1 LIGHT-BOARD SPIN EARNED!',
          highlightedTileIndices: [claimedIdx],
          earnedGremlinSpins: spins,
        };
      }

      case 'BIG_WHEEL_SHOWCASE': {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        if (tile.tvTwist === 'BIG_WHEEL_SPIN') {
          return {
            mode,
            bonusCash: 100,
            rivalStealCash: 0,
            multAdd: 0.25,
            bannerHeadline: '🎡 BIG WHEEL SHOWCASE BONUS! +$100 SPIN SWEETENER!',
            highlightedTileIndices: [claimedIdx],
            triggerBigWheel: true,
          };
        }
        const sameRowOwned = tiles.filter(
          (t) => t.state === 'CLAIMED_PLAYER' && Math.abs(t.z - tile.z) < 0.14,
        );
        if (sameRowOwned.length >= 3) {
          const sweepKey = `WHEEL_ROW_${Math.round(tile.z * 10)}`;
          if (!this.awardedTicTacLines.has(sweepKey)) {
            this.awardedTicTacLines.add(sweepKey);
            return {
              mode,
              bonusCash: 200,
              rivalStealCash: 0,
              multAdd: 0.25,
              bannerHeadline: '🎡 ROW COMPLETE — BONUS BIG WHEEL SPIN UNLOCKED!',
              highlightedTileIndices: sameRowOwned.map((t) => t.index),
              triggerBigWheel: true,
            };
          }
        }
        return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
      }

      case 'CLASSIC_TOTE':
      default: {
        if (!scored) {
          return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
        }
        // Classic Tote Row/Column Sweep check (`>= 3` player tiles in same horizontal row)
        const sameRowOwned = tiles.filter(
          (t) => t.state === 'CLAIMED_PLAYER' && Math.abs(t.z - tile.z) < 0.14,
        );
        const sameRowTotal = tiles.filter(
          (t) => t.state !== 'RETRACTED' && Math.abs(t.z - tile.z) < 0.14,
        );
        if (sameRowTotal.length >= 3 && sameRowOwned.length === sameRowTotal.length) {
          const sweepKey = `ROW_${Math.round(tile.z * 10)}`;
          if (!this.awardedTicTacLines.has(sweepKey)) {
            this.awardedTicTacLines.add(sweepKey);
            return {
              mode,
              bonusCash: 250,
              rivalStealCash: 0,
              multAdd: 0.25,
              bannerHeadline: '📺 FULL TOTE ROW SWEEP! +$250 STUDIO BONUS!',
              highlightedTileIndices: sameRowOwned.map((t) => t.index),
            };
          }
        }
        return { mode, bonusCash: 0, rivalStealCash: 0, multAdd: 0, bannerHeadline: null };
      }
    }
  }

  public getCurtainNumber(tileIndex: number): 1 | 2 | 3 {
    return this.mysteryCurtainNumbers.get(tileIndex) ?? (((tileIndex % 3) + 1) as 1 | 2 | 3);
  }

  public isSecretSquareRevealed(tileIndex: number): boolean {
    return this.revealedSecretSquareIndices.has(tileIndex);
  }

  public getRolledMysteryOutcome(tileIndex: number): MysteryCurtainOutcomeV7 | undefined {
    return this.rolledMysteryOutcomes.get(tileIndex);
  }

  /**
   * Reveals a hidden `SECRET_SQUARE` tile on tap -> awards `+1.0x` Double Dollars!
   */
  public revealSecretSquare(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
  ): SecretSquareRevealResultV7 {
    const tile = tiles.find((t) => t.index === tileIndex);
    if (!tile || tile.tvTwist !== 'SECRET_SQUARE') {
      return {
        wasSecretSquare: false,
        newlyRevealed: false,
        tileIndex,
        multBonus: 0,
        headline: '',
      };
    }
    const newlyRevealed = !this.revealedSecretSquareIndices.has(tileIndex);
    this.revealedSecretSquareIndices.add(tileIndex);
    this.recomputeBoardModifiers(tiles);
    return {
      wasSecretSquare: true,
      newlyRevealed,
      tileIndex,
      multBonus: 1.0,
      headline: '⭐ SECRET SQUARE! DOUBLE DOLLARS (2×)!',
    };
  }

  /**
   * Unlocks any `LOCKED_VAULT` tiles adjacent to `claimedIdx` (within spatial neighbor radius
   * across both Landscape and Portrait grids) OR immediately unlocks all locked vaults if
   * the player hits a `2+` streak!
   */
  public unlockAdjacentVaults(
    claimedIdx: number,
    tiles: BoardTileNodeV7[],
    currentStreak = 0,
    isPlayerClaim = true,
  ): VaultUnlockResultV7 {
    const claimedTile = tiles.find((t) => t.index === claimedIdx);
    const streakUnlocked = currentStreak >= 2;
    const unlockedTileIndices: number[] = [];
    const unlockedTiles: BoardTileNodeV7[] = [];
    let triggerReason: 'ADJACENT_WIN' | 'STREAK_UNLOCK' | 'NONE' = 'NONE';

    for (const tile of tiles) {
      if (
        tile.tvTwist !== 'LOCKED_VAULT' ||
        !tile.isVaultLocked ||
        (tile.state !== 'OPEN' && tile.state !== 'BLITZ_SURVIVOR')
      ) {
        continue;
      }

      let isAdjacent = false;
      if (claimedTile && claimedTile.index !== tile.index) {
        const dist = Math.hypot(tile.x - claimedTile.x, tile.z - claimedTile.z);
        // Covers orthogonal + diagonal neighbors in both Portrait (`~0.60..1.00m`) and Landscape (`~0.64..1.16m`)
        isAdjacent = dist <= 1.22;
      }

      if (isAdjacent || streakUnlocked) {
        tile.isVaultLocked = false;
        // 1-Turn Vault Shield: protect newly cracked $500 Gold Vault from immediate CPU sniping!
        if (isPlayerClaim) {
          tile.keyholderProtectedTurns = 1;
        }
        unlockedTileIndices.push(tile.index);
        unlockedTiles.push(tile);
        if (isAdjacent) {
          triggerReason = 'ADJACENT_WIN';
        } else if (triggerReason === 'NONE') {
          triggerReason = 'STREAK_UNLOCK';
        }
      }
    }

    if (unlockedTileIndices.length > 0) {
      this.recomputeBoardModifiers(tiles);
    }

    return {
      unlockedTileIndices,
      unlockedTiles,
      triggerReason,
    };
  }

  private buildMysteryOutcomeForKind(
    tileIndex: number,
    curtainNumber: 1 | 2 | 3,
    kind: MysteryCurtainKindV7,
    tile: BoardTileNodeV7 | undefined,
    applyMutations: boolean,
  ): MysteryCurtainOutcomeV7 {
    switch (kind) {
      case 'BONUS_ENVELOPE':
        return {
          tileIndex,
          curtainNumber,
          kind,
          headline: `❓ CURTAIN #${curtainNumber} · +$200 BONUS ENVELOPE!`,
          detail: 'Monty opens the velvet curtain—instant $200 cash envelope added to your bank!',
          instantCashDelta: 200,
          rivalCashDelta: 0,
          chipsMultiplier: 1.0,
        };
      case 'STEAL_FROM_RIVAL':
        return {
          tileIndex,
          curtainNumber,
          kind,
          headline: `❓ CURTAIN #${curtainNumber} · TAKE $150 FROM RIVAL!`,
          detail: 'Concentration TAKE! You swipe up to $150 right off the Champion’s scoreboard!',
          instantCashDelta: 150,
          rivalCashDelta: -150,
          chipsMultiplier: 1.0,
        };
      case 'DOUBLE_CHIPS': {
        // Do NOT mutate `tile.baseChips` directly here; `evaluateTileModifiers` applies exact `2x` once
        // so `$200` becomes `$400` (`2.0x`), NEVER quadrupling (`4.0x`)!
        const doubledStake = Math.min(900, Math.round(((tile?.baseChips ?? 200) * 2) / 50) * 50);
        return {
          tileIndex,
          curtainNumber,
          kind,
          headline: `❓ CURTAIN #${curtainNumber} · DOUBLE CHIPS (2× STAKE)!`,
          detail: `Live stake doubled to $${doubledStake} for this clue!`,
          instantCashDelta: 0,
          rivalCashDelta: 0,
          chipsMultiplier: 2.0,
        };
      }
      case 'WILD_CATEGORY_SWAP':
      default: {
        const allowedPool = this.getAllowedCategoryPoolV9();
        const eligibleWeak = this.getEligibleWeakCategoriesV9();
        const scoutedSet = new Set<CategoryIdV7>(this.context.scoutedWeakCategories ?? []);
        const deterministicPick =
          allowedPool[(tileIndex + curtainNumber * 3 + 5) % allowedPool.length] ??
          tile?.category ??
          ALL_CATEGORIES_V7[0];
        const candidateCat =
          eligibleWeak.find((c) => c !== tile?.category) ??
          allowedPool.find((c) => c !== tile?.category) ??
          deterministicPick;
        if (applyMutations && tile) {
          tile.category = candidateCat;
          tile.domain = CATEGORY_TO_DOMAIN_V7[candidateCat];
          tile.isWheelhouse = scoutedSet.has(candidateCat);
        }
        return {
          tileIndex,
          curtainNumber,
          kind: 'WILD_CATEGORY_SWAP',
          headline: `❓ CURTAIN #${curtainNumber} · WILD SWAP -> ${candidateCat}!`,
          detail: `Wild Trilon spin flipped the tile to ${candidateCat} + $75 Instant Bonus!`,
          instantCashDelta: 75,
          rivalCashDelta: 0,
          chipsMultiplier: 1.0,
          swappedCategory: candidateCat,
        };
      }
    }
  }

  /**
   * Previews 3 distinct deterministic outcomes behind Curtains #1, #2, and #3
   * using a full Fisher-Yates shuffle across all 24 3-door permutations!
   */
  public previewMysteryCurtainDoors(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
  ): readonly [MysteryCurtainOutcomeV7, MysteryCurtainOutcomeV7, MysteryCurtainOutcomeV7] {
    const tile = tiles.find((t) => t.index === tileIndex);
    const shuffled: MysteryCurtainKindV7[] = [
      'BONUS_ENVELOPE',
      'STEAL_FROM_RIVAL',
      'DOUBLE_CHIPS',
      'WILD_CATEGORY_SWAP',
    ];
    let state =
      this.computeDeterministicBoardHash(
        tileIndex * 73 + this.gimmick.turnCounter * 19 + (this.context.turnNumber ?? 1) * 29,
      ) || 0x1966_6a01;
    const nextUint = (): number => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return state >>> 0;
    };
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = nextUint() % (i + 1);
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }
    return [
      this.buildMysteryOutcomeForKind(tileIndex, 1, shuffled[0], tile, false),
      this.buildMysteryOutcomeForKind(tileIndex, 2, shuffled[1], tile, false),
      this.buildMysteryOutcomeForKind(tileIndex, 3, shuffled[2], tile, false),
    ];
  }

  /**
   * Spins and resolves a 1966 *Let's Make a Deal / Concentration* `MYSTERY_CURTAIN` tile!
   * Optionally accepts `chosenCurtainNum` (`1 | 2 | 3`) when wired to an interactive 3-door pick.
   */
  public rollMysteryCurtainOutcome(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
    chosenCurtainNum?: 1 | 2 | 3,
  ): MysteryCurtainOutcomeV7 {
    const cached = this.rolledMysteryOutcomes.get(tileIndex);
    if (cached) return cached;

    const tile = tiles.find((t) => t.index === tileIndex);
    const curtainNumber = chosenCurtainNum ?? this.getCurtainNumber(tileIndex);
    const doors = this.previewMysteryCurtainDoors(tileIndex, tiles);
    const chosenPreview = doors[(curtainNumber - 1) % 3] ?? doors[0];
    const outcome = this.buildMysteryOutcomeForKind(
      tileIndex,
      curtainNumber,
      chosenPreview.kind,
      tile,
      true,
    );

    this.rolledMysteryOutcomes.set(tileIndex, outcome);
    this.recomputeBoardModifiers(tiles);
    return outcome;
  }

  /**
   * When the Rival lands on an `OPPONENT_CHOICE` tile, flips it to one of the Rival's
   * weakest categories so they face a tough backstage dare!
   */
  public resolveRivalOpponentChoiceIfNeeded(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
  ): CategoryIdV7 | null {
    const tile = tiles.find((t) => t.index === tileIndex);
    if (!tile || tile.tvTwist !== 'OPPONENT_CHOICE') return null;
    const eligibleWeak = this.getEligibleWeakCategoriesV9();
    if (eligibleWeak.length === 0) return null;
    const chosenWeak = eligibleWeak[(tileIndex + this.gimmick.turnCounter) % eligibleWeak.length];
    tile.category = chosenWeak;
    tile.domain = CATEGORY_TO_DOMAIN_V7[chosenWeak];
    tile.isWheelhouse = true;
    this.recomputeBoardModifiers(tiles);
    return chosenWeak;
  }

  // --------------------------------------------------------------------------
  // Live 3D Contraption Gimmick & Flank Mercy Switch Interactions
  // --------------------------------------------------------------------------

  /**
   * Pulls Toby's Mercy Switch on the left flank of the 3D table:
   * Immediately disarms all shivering `isRiggedSolenoid` tiles into clean insulated bonus tiles!
   */
  public pullMercySwitch(tiles: BoardTileNodeV7[]): { disarmedCount: number } {
    let disarmedCount = 0;
    this.gimmick.mercySwitchPulled = true;
    for (const tile of tiles) {
      if (tile.isRiggedSolenoid) {
        tile.isRiggedSolenoid = false;
        disarmedCount++;
      }
    }
    this.recomputeBoardModifiers(tiles);
    return { disarmedCount };
  }

  /**
   * Executes the interactive 3D board gimmick when clicked/dragged directly on the table.
   */
  public triggerBoardGimmick(
    boardId: BoardIdV7,
    tiles: BoardTileNodeV7[],
    explicitValue?: number,
  ): Readonly<BoardGimmickStateV7> {
    switch (boardId) {
      case 'BOARD_01_FUNK_CROSSFADER': {
        if (explicitValue !== undefined) {
          this.gimmick.crossfaderPosition =
            explicitValue < -0.25 ? -1 : explicitValue > 0.25 ? 1 : 0;
        } else {
          // Cycle Left (-1) -> Right (+1) -> Center (0) -> Left (-1)
          this.gimmick.crossfaderPosition =
            this.gimmick.crossfaderPosition === -1
              ? 1
              : this.gimmick.crossfaderPosition === 1
                ? 0
                : -1;
        }
        this.gimmick.lastGimmickSummary =
          this.gimmick.crossfaderPosition === -1
            ? 'Crossfader -> Left Deck (+0.35x)'
            : this.gimmick.crossfaderPosition === 1
              ? 'Crossfader -> Right Deck (+0.35x)'
              : 'Crossfader -> Center Mix (+0.20x)';
        break;
      }

      case 'BOARD_02_JUBILEE_HEX_BRIDGE': {
        const nextPolarity = (((this.gimmick.bridgePolarityPhase ?? 0) + 1) % 3) as 0 | 1 | 2;
        this.gimmick.bridgePolarityPhase = nextPolarity;
        this.gimmick.lastGimmickSummary =
          nextPolarity === 1
            ? 'Bridge Polarity -> Left Bank (+0.25x)'
            : nextPolarity === 2
              ? 'Bridge Polarity -> Right Bank (+0.25x)'
              : 'Bridge Polarity -> Center Spine (+0.25x)';
        break;
      }

      case 'BOARD_03_VAUDEVILLE_GEAR_TRAIN': {
        this.gimmick.gearPhase = (this.gimmick.gearPhase + 1) % 3;
        this.gimmick.lastGimmickSummary = `Pop-Art Wheel Phase ${this.gimmick.gearPhase + 1}/3 (+0.40x)`;
        break;
      }

      case 'BOARD_04_MAHOGANY_SWITCHBOARD': {
        const nextDomainIdx =
          ((this.gimmick.switchboardDomainIndex ?? 0) + 1) % DOMAIN_CYCLE_V7.length;
        this.gimmick.switchboardDomainIndex = nextDomainIdx;
        const patchedDomain = DOMAIN_CYCLE_V7[nextDomainIdx];
        this.gimmick.lastGimmickSummary = `Crossbar Patch -> ${patchedDomain} (+0.30x & +$50)`;
        break;
      }

      case 'BOARD_05_LARSON_SPIN_RING': {
        // Pass-Spin Brass Paddle advances hot-spot to next open tile and increments pass counter
        this.gimmick.spinPassesUsed += 1;
        this.advanceLarsonHotSpot(tiles, 3);
        this.gimmick.lastGimmickSummary = `Hot-Spot Shifted -> Tile #${this.gimmick.larsonHotTileIndex + 1} (+0.50x)`;
        break;
      }

      case 'BOARD_06_BOARDWALK_PINBALL': {
        this.gimmick.chargedBumperIndex = (this.gimmick.chargedBumperIndex + 1) % 3;
        this.gimmick.lastGimmickSummary = `Charged Bumper #${this.gimmick.chargedBumperIndex + 1} (+0.35x)`;
        break;
      }

      case 'BOARD_07_MONTE_CARLO_SHOE': {
        // Sabotage Shoe burns a low card (+3 pips, wrapping cleanly past 21 to 6)
        const nextSum = this.gimmick.baccaratShoeTotal + 3;
        this.gimmick.baccaratShoeTotal = nextSum > 21 ? 6 + (nextSum - 22) : nextSum;
        this.gimmick.lastGimmickSummary = `Baccarat Shoe -> ${this.gimmick.baccaratShoeTotal} Pips`;
        break;
      }

      case 'BOARD_08_GEODESIC_SUNDIAL': {
        this.gimmick.sundialAngleRad += Math.PI / 3;
        if (this.gimmick.sundialAngleRad > Math.PI) {
          this.gimmick.sundialAngleRad -= Math.PI * 2;
        }
        this.gimmick.lastGimmickSummary = 'Meridian Sundial Swept (+0.40x Arc)';
        break;
      }

      case 'BOARD_09_PIRATE_UHF_DECK': {
        const idx = DOMAIN_CYCLE_V7.indexOf(this.gimmick.tunedUhfDomain);
        const nextDomain = DOMAIN_CYCLE_V7[(idx + 1) % DOMAIN_CYCLE_V7.length];
        this.gimmick.tunedUhfDomain = nextDomain;
        for (const t of tiles) {
          t.hasUhfHalo =
            t.domain === nextDomain && (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
        }
        this.gimmick.lastGimmickSummary = `UHF Carrier -> ${nextDomain} (+0.40x)`;
        break;
      }

      case 'BOARD_10_SOVEREIGN_ZIGGURAT': {
        const nextTier = (((this.gimmick.zigguratFocusTier ?? 0) + 1) % 3) as 0 | 1 | 2;
        this.gimmick.zigguratFocusTier = nextTier;
        this.gimmick.lastGimmickSummary =
          nextTier === 0
            ? 'Astrolabe -> Apex Crown Tier (+0.25x & +$50)'
            : nextTier === 1
              ? 'Astrolabe -> Mid Terrace (+0.25x & +$50)'
              : 'Astrolabe -> Base Steps (+0.25x & +$50)';
        break;
      }

      case 'BOARD_11_WHEW_GAUNTLET': {
        const nextCol = ((this.gimmick.gauntletReconColumn ?? 0) + 1) % 5;
        this.gimmick.gauntletReconColumn = nextCol;
        let clearedHotSpots = 0;
        for (const t of tiles) {
          const tileCol = clamp(Math.round((t.x + 1.44) / 0.72), 0, 4);
          if (tileCol === nextCol && t.isRiggedSolenoid) {
            t.isRiggedSolenoid = false;
            clearedHotSpots++;
          }
        }
        this.gimmick.lastGimmickSummary =
          clearedHotSpots > 0
            ? `Recon Lane ${nextCol + 1}/5 Swept & Boosted (+0.35x)`
            : `Recon Lane ${nextCol + 1}/5 Boosted (+0.35x & +$50)`;
        break;
      }

      case 'BOARD_12_PENDULUM_BALANCE': {
        const currTare = this.gimmick.pendulumTareOffsetDeg ?? 0;
        const nextTare = currTare === 0 ? 2.4 : currTare > 0 ? -2.4 : 0;
        this.gimmick.pendulumTareOffsetDeg = nextTare;
        this.syncPendulumTilt(tiles);
        this.gimmick.lastGimmickSummary =
          nextTare > 0
            ? 'Fulcrum Tare -> Left Arm Lighter (+0.50x)'
            : nextTare < 0
              ? 'Fulcrum Tare -> Right Arm Lighter (+0.50x)'
              : 'Fulcrum Tare -> Zeroed Equilibrium';
        break;
      }

      default: {
        this.gimmick.gearPhase = (this.gimmick.gearPhase + 1) % 3;
        this.gimmick.lastGimmickSummary = `Mechanism Phase ${this.gimmick.gearPhase + 1}/3`;
        break;
      }
    }

    this.recomputeBoardModifiers(tiles);
    return this.gimmick;
  }

  public advanceTurnState(tiles: BoardTileNodeV7[], claimedTile?: BoardTileNodeV7): void {
    this.gimmick.turnCounter += 1;
    this.gimmick.gearPhase = (this.gimmick.gearPhase + 1) % 3;
    this.gimmick.chargedBumperIndex = (this.gimmick.chargedBumperIndex + 1) % 3;
    this.gimmick.sundialAngleRad += Math.PI / 4;
    if (this.gimmick.sundialAngleRad > Math.PI) {
      this.gimmick.sundialAngleRad -= Math.PI * 2;
    }

    if (claimedTile) {
      const pip = this.getBaccaratPipValue(claimedTile);
      const nextShoe = this.gimmick.baccaratShoeTotal + pip;
      this.gimmick.baccaratShoeTotal = nextShoe > 21 ? pip : nextShoe;
    }

    this.advanceLarsonHotSpot(tiles, 2);
    this.syncPendulumTilt(tiles);
    this.recomputeBoardModifiers(tiles);
  }

  private advanceLarsonHotSpot(tiles: BoardTileNodeV7[], stepCount: number): void {
    if (tiles.length === 0) return;
    let cursor = this.gimmick.larsonHotTileIndex % tiles.length;
    let stepsRemaining = Math.max(1, stepCount);
    for (let guard = 0; guard < tiles.length * 3 && stepsRemaining > 0; guard++) {
      cursor = (cursor + 1) % tiles.length;
      if (tiles[cursor].state === 'OPEN' || tiles[cursor].state === 'BLITZ_SURVIVOR') {
        stepsRemaining--;
      }
    }
    this.gimmick.larsonHotTileIndex = cursor;
  }

  public syncPendulumTilt(tiles: BoardTileNodeV7[]): number {
    let leftMass = 0;
    let rightMass = 0;
    for (const tile of tiles) {
      if (tile.state === 'CLAIMED_PLAYER' || tile.state === 'CLAIMED_RIVAL') {
        const mass = tile.baseChips / 200;
        if (tile.x < -0.12) leftMass += mass;
        else if (tile.x > 0.12) rightMass += mass;
      }
    }
    const diff = rightMass - leftMass;
    this.gimmick.pendulumTiltDeg = clamp(
      diff * 1.65 + (this.gimmick.pendulumTareOffsetDeg ?? 0),
      -4.5,
      4.5,
    );
    return this.gimmick.pendulumTiltDeg;
  }

  // --------------------------------------------------------------------------
  // Spatial Adjacency, Corner Detection & Per-Tile Multiplier Computation
  // --------------------------------------------------------------------------

  private getBaccaratPipValue(tile: BoardTileNodeV7): number {
    return clamp(Math.round(tile.baseChips / 50), 2, 9);
  }

  private countAdjacentClaimedPlayer(tile: BoardTileNodeV7, tiles: BoardTileNodeV7[]): number {
    let count = 0;
    for (const other of tiles) {
      if (other.index === tile.index || other.state !== 'CLAIMED_PLAYER') continue;
      const dist = Math.hypot(other.x - tile.x, other.z - tile.z);
      if (dist <= 1.08) count++;
    }
    return count;
  }

  private isCornerKeystone(tile: BoardTileNodeV7, tiles: BoardTileNodeV7[]): boolean {
    if (tiles.length < 4) return true;
    const ranked = [...tiles].sort(
      (a, b) => Math.hypot(b.x, b.z * 1.35) - Math.hypot(a.x, a.z * 1.35),
    );
    for (let i = 0; i < 4; i++) {
      if (ranked[i].index === tile.index) return true;
    }
    return false;
  }

  /**
   * Computes exact live `Chips` & `Mult` breakdown for any tile, enforcing the
   * Piece-3 cap (`<= 2.0x` when cold `streak < 2`, `<= 3.0x` when streaking `streak >= 2`).
   */
  public evaluateTileModifiers(
    tile: BoardTileNodeV7,
    tiles: BoardTileNodeV7[],
    overrideStreak?: number,
  ): TileTwistBreakdownV7 {
    const streak = overrideStreak ?? this.context.playerStreak ?? 0;
    const isStreaking = streak >= 2;
    const multCapCeiling: 2.0 | 3.0 = isStreaking ? 3.0 : 2.0;
    const maxBonus = multCapCeiling - 1.0;

    let bonusChips = 0;
    let rawMultBonus = 0;
    const reasons: string[] = [];

    const twistId = this.context.twistId;
    const boardId = this.context.boardId;

    // 1. Blitz Survivor Crown Bonus (when in 5:10 Trapdoor Blitz)
    if (tile.state === 'BLITZ_SURVIVOR') {
      bonusChips += 100;
      rawMultBonus += 0.5;
      reasons.push('Blitz Plinth +0.50x');
    }

    // 2. Amber Chalk Truce Socket Rule (`+0.35x` when respected vs Trust Break when poached)
    const anyOpenAmberTruce = tiles.some(
      (t) => (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') && t.hasAmberTruce,
    );
    let respectedAmberTruce = false;
    let poachedAmberTruce = false;
    let rivalTrustDelta: -1 | 0 = 0;

    if (!this.gimmick.amberTruceBroken && anyOpenAmberTruce) {
      if (tile.hasAmberTruce) {
        poachedAmberTruce = true;
        rivalTrustDelta = -1;
        bonusChips += 50;
        reasons.push('Poached Amber Truce (Breaks Trust!)');
      } else {
        respectedAmberTruce = true;
        rawMultBonus += 0.35;
        reasons.push('Amber Chalk Truce Respected +0.35x');
      }
    }

    // 3. Rival Wheelhouse Weak-Spot Bounty (`+0.50x Mult` for attacking Rival's 3 weak categories!
    //    Masked while `blindCategoryHidden` is true so `$600 · ???` shutters never leak weak spots!)
    const weakSet = new Set<CategoryIdV7>(this.getEffectiveWeakCategories());
    const strongSet = new Set<CategoryIdV7>(this.getEffectiveStrongCategories());
    const isCategoryVisible = !tile.blindCategoryHidden;
    const hitRivalWheelhouse =
      isCategoryVisible && (tile.isWheelhouse || weakSet.has(tile.category));
    if (hitRivalWheelhouse) {
      rawMultBonus += 0.5;
      bonusChips += twistId === 'TWIST_14_RIVAL_WHEELHOUSE_BOUNTY' ? 60 : 35;
      reasons.push('Rival Wheelhouse +0.50x');
    } else if (isCategoryVisible && strongSet.has(tile.category)) {
      bonusChips += 45;
      reasons.push('Rival Turf Dare +45 Chips');
    }

    // 4. Solenoid Rigged Gambit vs Toby's Mercy Switch Insulation
    const triggeredRiggedSolenoid = tile.isRiggedSolenoid && !this.gimmick.mercySwitchPulled;
    if (triggeredRiggedSolenoid) {
      const rigMult = twistId === 'TWIST_15_SOLENOID_RIGGED_GAMBIT' ? 0.65 : 0.45;
      const rigChips = twistId === 'TWIST_15_SOLENOID_RIGGED_GAMBIT' ? 100 : 75;
      rawMultBonus += rigMult;
      bonusChips += rigChips;
      reasons.push(`Rigged Solenoid Gambit +${rigMult.toFixed(2)}x`);
    } else if (this.gimmick.mercySwitchPulled && twistId === 'TWIST_15_SOLENOID_RIGGED_GAMBIT') {
      rawMultBonus += 0.3;
      reasons.push('Mercy Disarmed +0.30x');
    }

    // 5. Pirate UHF Carrier Halo
    if (tile.hasUhfHalo && twistId !== 'TWIST_09_PIRATE_CARRIER_LOCK') {
      rawMultBonus += 0.25;
      bonusChips += 35;
      reasons.push('UHF Carrier Halo +0.25x');
    }

    // 5b. 1966 Classic TV Board Twists (`LOCKED_VAULT`, `SECRET_SQUARE`, `OPPONENT_CHOICE`, `SHOWCASE_BONUS`, `MYSTERY_CURTAIN`)
    const tvTwist: ClassicTvTileTwistV7 = tile.tvTwist ?? 'NONE';
    const isVaultLocked = Boolean(tile.isVaultLocked);

    if (tvTwist === 'SECRET_SQUARE' && this.revealedSecretSquareIndices.has(tile.index)) {
      rawMultBonus += 1.0;
      reasons.push('⭐ Secret Square 2× (+1.00x)');
    } else if (tvTwist === 'OPPONENT_CHOICE') {
      if (!hitRivalWheelhouse) {
        rawMultBonus += 0.5;
      }
      bonusChips += 100;
      reasons.push("🎭 Rival's Pick Spite (+0.50x +$100)");
    } else if (tvTwist === 'LOCKED_VAULT' && !isVaultLocked) {
      rawMultBonus += 0.25;
      reasons.push('🔓 Gold Vault Open (+0.25x)');
    } else if (tvTwist === 'SHOWCASE_BONUS') {
      rawMultBonus += 0.2;
      bonusChips += 50;
      reasons.push('★ TV Showcase Bonus (+0.20x +$50)');
    } else if (tvTwist === 'MYSTERY_CURTAIN') {
      const rolled = this.rolledMysteryOutcomes.get(tile.index);
      if (rolled?.kind === 'DOUBLE_CHIPS') {
        reasons.push('❓ Mystery Curtain 2× Chips');
      }
    } else if (tvTwist === 'BIG_WHEEL_SPIN') {
      rawMultBonus += 0.25;
      reasons.push('🎡 Big Wheel Spin (+0.25x)');
    } else if (tvTwist === 'BLIND_CATEGORY') {
      rawMultBonus += 0.35;
      reasons.push('$600 Blind Category (+0.35x)');
    } else if (tvTwist === 'MYSTERY_CASH') {
      rawMultBonus += 0.2;
      reasons.push('Mystery Cash Envelope (+0.20x)');
    } else if (tvTwist === 'BRASS_KEY') {
      rawMultBonus += 0.2;
      bonusChips += 50;
      reasons.push('🗝️ Safe Key Bonus (+0.20x +$50)');
    } else if (tvTwist === 'PRESS_LUCK_SPIN') {
      rawMultBonus += 0.25;
      reasons.push('⚡ Press-Your-Luck Spin (+0.25x)');
    }

    if (
      this.getActiveUnlockTopology() === 'ROVING_SPOTLIGHT' &&
      this.activeSpotlightIndices.includes(tile.index)
    ) {
      bonusChips += 50;
      rawMultBonus += 0.2;
      reasons.push('🔦 Roving Spotlight (+0.20x +$50)');
    }

    // 5c. v9 R7 Shifting Spotlight & Pressure Cooker Multipliers
    if (this.activeBoardModeV9 === 'SHIFTING_SPOTLIGHT' && tile.isSpotlightTile) {
      const turnNum = this.context.turnNumber ?? this.gimmick.turnCounter + 1;
      const spotBonus = turnNum >= 7 ? 1.0 : 0.5;
      rawMultBonus += spotBonus;
      reasons.push(`🔦 Shifting Spotlight (+${spotBonus.toFixed(2)}x)`);
    }

    let pressureCookerMult: number | undefined;
    if (this.activeBoardModeV9 === 'PRESSURE_COOKER') {
      pressureCookerMult = this.getPressureCookerMult();
      if (pressureCookerMult > 1) {
        const pressureAdd = pressureCookerMult - 1;
        rawMultBonus += pressureAdd;
        reasons.push(`♨️ Pressure Cooker ×${pressureCookerMult.toFixed(2)}`);
      }
    }

    // 6. Primary Episode Twist & Spatial Board Mechanics (All 16 Twists Wired!)
    switch (twistId) {
      case 'TWIST_01_CROSSFADER_BOOST': {
        const fader = this.gimmick.crossfaderPosition;
        if (fader === -1 && tile.x < -0.08) {
          rawMultBonus += 0.35;
          bonusChips += 35;
          reasons.push('Left Crossfader Deck +0.35x');
        } else if (fader === 1 && tile.x > 0.08) {
          rawMultBonus += 0.35;
          bonusChips += 35;
          reasons.push('Right Crossfader Deck +0.35x');
        } else if (fader === 0 && Math.abs(tile.x) <= 0.75) {
          rawMultBonus += 0.2;
          bonusChips += 20;
          reasons.push('Center Crossfader Mix +0.20x');
        }
        break;
      }

      case 'TWIST_02_HEX_BRIDGE_CHAIN': {
        const links = this.countAdjacentClaimedPlayer(tile, tiles);
        if (links > 0) {
          const linkMult = Math.min(0.75, links * 0.25);
          rawMultBonus += linkMult;
          bonusChips += links * 40;
          reasons.push(`Hex-Bridge x${links} +${linkMult.toFixed(2)}x`);
        } else if (Math.abs(tile.x) > 1.15) {
          // Anchor hexes on left/right banks help start a bridge
          bonusChips += 30;
          rawMultBonus += 0.15;
          reasons.push('Bridge Bank Anchor +0.15x');
        }
        const pol = this.gimmick.bridgePolarityPhase ?? 0;
        const polarityMatch =
          (pol === 1 && tile.x < -0.45) ||
          (pol === 2 && tile.x > 0.45) ||
          (pol === 0 && Math.abs(tile.x) <= 0.45);
        if (polarityMatch) {
          rawMultBonus += 0.25;
          bonusChips += 35;
          reasons.push(
            pol === 1
              ? 'Polarity Left Bank +0.25x'
              : pol === 2
                ? 'Polarity Right Bank +0.25x'
                : 'Polarity Center Spine +0.25x',
          );
        }
        break;
      }

      case 'TWIST_03_ESCAPEMENT_TICK_SHIFT': {
        if (tile.index % 3 === this.gimmick.gearPhase) {
          rawMultBonus += 0.4;
          bonusChips += 50;
          reasons.push('Escapement Gear Lock +0.40x');
        }
        break;
      }

      case 'TWIST_04_SUPERVISORY_RELAY_PAIR': {
        const sameDomainClaimed = tiles.some(
          (other) =>
            other.index !== tile.index &&
            other.domain === tile.domain &&
            other.state === 'CLAIMED_PLAYER',
        );
        if (sameDomainClaimed) {
          rawMultBonus += 0.45;
          bonusChips += 75;
          reasons.push('Supervisory Relay Pair +0.45x');
        } else {
          bonusChips += 25;
        }
        const activePatchDomain =
          DOMAIN_CYCLE_V7[(this.gimmick.switchboardDomainIndex ?? 0) % DOMAIN_CYCLE_V7.length];
        if (tile.domain === activePatchDomain) {
          rawMultBonus += 0.3;
          bonusChips += 50;
          reasons.push(`Crossbar ${activePatchDomain} Patch +0.30x`);
        }
        break;
      }

      case 'TWIST_05_LARSON_HOT_SPOT': {
        if (tile.index === this.gimmick.larsonHotTileIndex) {
          rawMultBonus += 0.5;
          bonusChips += 60;
          reasons.push('Larson Hot-Spot +0.50x');
        } else {
          const ringNeighbors = Math.abs(tile.index - this.gimmick.larsonHotTileIndex);
          if (ringNeighbors === 1 || ringNeighbors === tiles.length - 1) {
            rawMultBonus += 0.2;
            bonusChips += 25;
            reasons.push('Larson Trail Glow +0.20x');
          }
        }
        break;
      }

      case 'TWIST_06_PINBALL_BUMPER_RICOCHET': {
        const bumperCenters: readonly [number, number][] = [
          [-0.9, -0.25],
          [0.9, -0.25],
          [0.0, 0.32],
        ];
        const charged = bumperCenters[this.gimmick.chargedBumperIndex % 3];
        const distToCharged = Math.hypot(tile.x - charged[0], tile.z - charged[1]);
        if (distToCharged <= 1.05) {
          rawMultBonus += 0.35;
          bonusChips += 50;
          reasons.push('Charged Pop-Bumper +0.35x');
        }
        break;
      }

      case 'TWIST_07_BACCARAT_NATURAL_21': {
        const pip = this.getBaccaratPipValue(tile);
        const projected = this.gimmick.baccaratShoeTotal + pip;
        if (projected === 21) {
          rawMultBonus += 0.75;
          bonusChips += 120;
          reasons.push('Natural 21 Shoe +0.75x');
        } else if (projected >= 18 && projected <= 20) {
          rawMultBonus += 0.55;
          bonusChips += 85;
          reasons.push(`Baccarat ${projected} Stand +0.55x`);
        } else if (projected <= 17) {
          rawMultBonus += 0.2;
          bonusChips += 25;
          reasons.push(`Shoe Draw -> ${projected}`);
        }
        break;
      }

      case 'TWIST_08_SOLAR_MERIDIAN_SWEEP': {
        const tileAngle = Math.atan2(tile.z, tile.x);
        const angularDiff = normalizeAngleDelta(tileAngle, this.gimmick.sundialAngleRad);
        if (angularDiff <= 0.62) {
          rawMultBonus += 0.4;
          bonusChips += 50;
          reasons.push('Solar Meridian Arc +0.40x');
        }
        break;
      }

      case 'TWIST_09_PIRATE_CARRIER_LOCK': {
        if (tile.domain === this.gimmick.tunedUhfDomain || tile.hasUhfHalo) {
          rawMultBonus += 0.4;
          bonusChips += 55;
          reasons.push(`UHF ${this.gimmick.tunedUhfDomain} Lock +0.40x`);
        }
        break;
      }

      case 'TWIST_10_ZIGGURAT_APEX_CROWN': {
        if (tile.tierY >= 0.31) {
          const holdsMidTier = tiles.some(
            (t) => t.state === 'CLAIMED_PLAYER' && t.tierY >= 0.22 && t.tierY < 0.31,
          );
          const apexMult = holdsMidTier ? 0.85 : 0.65;
          rawMultBonus += apexMult;
          bonusChips += 100;
          reasons.push(`Ziggurat Apex +${apexMult.toFixed(2)}x`);
        } else if (tile.tierY >= 0.22) {
          rawMultBonus += 0.35;
          bonusChips += 40;
          reasons.push('Ziggurat Second Tier +0.35x');
        } else {
          rawMultBonus += 0.15;
          reasons.push('Ziggurat Base Step +0.15x');
        }
        const focusTier = this.gimmick.zigguratFocusTier ?? 0;
        const tierMatchesFocus =
          (focusTier === 0 && tile.tierY >= 0.31) ||
          (focusTier === 1 && tile.tierY >= 0.21 && tile.tierY < 0.31) ||
          (focusTier === 2 && tile.tierY < 0.21);
        if (tierMatchesFocus) {
          rawMultBonus += 0.25;
          bonusChips += 50;
          reasons.push('Astrolabe Tier Lock +0.25x');
        }
        break;
      }

      case 'TWIST_11_GAUNTLET_BLOCKADE_BREACH': {
        const rivalAdjacent = tiles.some(
          (other) =>
            other.state === 'CLAIMED_RIVAL' && Math.hypot(other.x - tile.x, other.z - tile.z) <= 1.05,
        );
        if (tile.z <= -0.45) {
          rawMultBonus += 0.65;
          bonusChips += 110;
          reasons.push('Gold Gauntlet Row +0.65x');
        } else if (rivalAdjacent) {
          rawMultBonus += 0.45;
          bonusChips += 65;
          reasons.push('Blockade Flank Breach +0.45x');
        }
        const reconCol = (this.gimmick.gauntletReconColumn ?? 0) % 5;
        const tileCol = clamp(Math.round((tile.x + 1.44) / 0.72), 0, 4);
        if (tileCol === reconCol) {
          rawMultBonus += 0.35;
          bonusChips += 50;
          reasons.push(`Recon Lane ${reconCol + 1} +0.35x`);
        }
        break;
      }

      case 'TWIST_12_FULCRUM_EQUILIBRIUM': {
        const tilt = this.gimmick.pendulumTiltDeg;
        const restoresRight = tilt < -0.4 && tile.x > 0.12;
        const restoresLeft = tilt > 0.4 && tile.x < -0.12;
        const balancedCenter = Math.abs(tilt) <= 0.4 && Math.abs(tile.x) <= 0.65;
        if (restoresLeft || restoresRight || balancedCenter) {
          rawMultBonus += 0.5;
          bonusChips += 70;
          reasons.push('Fulcrum Equilibrium +0.50x');
        }
        break;
      }

      case 'TWIST_16_DOUBLE_STAKE_CORNER': {
        if (this.isCornerKeystone(tile, tiles)) {
          const ownedCorners = tiles.filter(
            (t) => t.state === 'CLAIMED_PLAYER' && this.isCornerKeystone(t, tiles),
          ).length;
          const cornerMult = ownedCorners >= 2 ? 0.8 : 0.55;
          rawMultBonus += cornerMult;
          bonusChips += 120;
          reasons.push(`Double-Stake Corner +${cornerMult.toFixed(2)}x`);
        }
        break;
      }

      case 'TWIST_13_AMBER_CHALK_TRUCE':
      case 'TWIST_14_RIVAL_WHEELHOUSE_BOUNTY':
      case 'TWIST_15_SOLENOID_RIGGED_GAMBIT':
      default: {
        // Secondary live board gimmick synergy when a cast-driven twist (13/14/15) runs on any kinetic board:
        if (boardId === 'BOARD_01_FUNK_CROSSFADER' && Math.sign(tile.x) === this.gimmick.crossfaderPosition) {
          bonusChips += 25;
        } else if (boardId === 'BOARD_02_JUBILEE_HEX_BRIDGE') {
          const pol = this.gimmick.bridgePolarityPhase ?? 0;
          if ((pol === 1 && tile.x < -0.45) || (pol === 2 && tile.x > 0.45) || (pol === 0 && Math.abs(tile.x) <= 0.45)) {
            rawMultBonus += 0.2;
            bonusChips += 30;
          }
        } else if (boardId === 'BOARD_04_MAHOGANY_SWITCHBOARD') {
          const activePatchDomain =
            DOMAIN_CYCLE_V7[(this.gimmick.switchboardDomainIndex ?? 0) % DOMAIN_CYCLE_V7.length];
          if (tile.domain === activePatchDomain) {
            rawMultBonus += 0.2;
            bonusChips += 35;
          }
        } else if (boardId === 'BOARD_10_SOVEREIGN_ZIGGURAT') {
          const focusTier = this.gimmick.zigguratFocusTier ?? 0;
          if (
            (focusTier === 0 && tile.tierY >= 0.31) ||
            (focusTier === 1 && tile.tierY >= 0.21 && tile.tierY < 0.31) ||
            (focusTier === 2 && tile.tierY < 0.21)
          ) {
            rawMultBonus += 0.2;
            bonusChips += 35;
          }
        } else if (boardId === 'BOARD_11_WHEW_GAUNTLET') {
          const reconCol = (this.gimmick.gauntletReconColumn ?? 0) % 5;
          if (clamp(Math.round((tile.x + 1.44) / 0.72), 0, 4) === reconCol) {
            rawMultBonus += 0.25;
            bonusChips += 35;
          }
        } else if (boardId === 'BOARD_12_PENDULUM_BALANCE') {
          const tilt = this.gimmick.pendulumTiltDeg;
          if ((tilt < -0.5 && tile.x > 0.12) || (tilt > 0.5 && tile.x < -0.12)) {
            rawMultBonus += 0.25;
            bonusChips += 35;
          }
        }
        break;
      }
    }

    const cappedMultBonus = roundTo2(clamp(rawMultBonus, 0, maxBonus));
    const effectiveMult = roundTo2(1.0 + cappedMultBonus);
    // Authentic 1960s Network Tote-Board Dollar Stakes: strictly clean $50 increments ($150, $200, $250, ..., $500+)!
    // Keep Locked Gold Vault anchored to its printed Vault stake ($500, or $750 in Act II 1.5x) so unlocking never shifts price!
    const rawTotalChips = tvTwist === 'LOCKED_VAULT' ? tile.baseChips : tile.baseChips + bonusChips;
    const preDoubleChips = Math.max(150, Math.round(rawTotalChips / 50) * 50);
    const rolledMystery = this.rolledMysteryOutcomes.get(tile.index);
    const effectiveChips =
      tvTwist === 'MYSTERY_CURTAIN' && rolledMystery?.kind === 'DOUBLE_CHIPS'
        ? Math.min(1200, preDoubleChips * 2)
        : preDoubleChips;
    const roundedBonusChips = Math.max(0, effectiveChips - tile.baseChips);

    return {
      tileIndex: tile.index,
      baseChips: tile.baseChips,
      bonusChips: roundedBonusChips,
      effectiveChips,
      rawMultBonus: roundTo2(rawMultBonus),
      cappedMultBonus,
      effectiveMult,
      multCapCeiling,
      respectedAmberTruce,
      poachedAmberTruce,
      rivalTrustDelta,
      hitRivalWheelhouse,
      triggeredRiggedSolenoid,
      tvTwist,
      tvTwistV9: tile.tvTwistV9 ?? tvTwist,
      ...(pressureCookerMult !== undefined ? { pressureCookerMult } : {}),
      isVaultLocked,
      activeReasons: reasons,
    };
  }

  /**
   * Synchronizes `tile.boardMultBonus` across every tile on the board so the
   * 3D top-face canvas tags (`+0.5x`, `+0.8x`) always match live scoring 1:1.
   */
  public recomputeBoardModifiers(tiles: BoardTileNodeV7[]): TileTwistBreakdownV7[] {
    this.syncPendulumTilt(tiles);
    return tiles.map((tile) => {
      const breakdown = this.evaluateTileModifiers(tile, tiles);
      tile.boardMultBonus = breakdown.cappedMultBonus;
      return breakdown;
    });
  }

  /**
   * Resolves a Player tile claim: returns the exact `TileTwistBreakdownV7`, updates
   * Amber Chalk Truce state if poached, advances turn mechanisms, and refreshes board tags.
   */
  public commitPlayerTileClaim(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
    playerAnsweredCorrectly = true,
  ): TileTwistBreakdownV7 {
    const target = tiles.find((t) => t.index === tileIndex) ?? tiles[0];
    const breakdown = this.evaluateTileModifiers(target, tiles);

    if (breakdown.poachedAmberTruce) {
      this.gimmick.amberTruceBroken = true;
      for (const t of tiles) {
        t.hasAmberTruce = false;
      }
    }

    target.state = playerAnsweredCorrectly ? 'CLAIMED_PLAYER' : 'CLAIMED_RIVAL';
    target.isRivalTarget = false;
    target.isRiggedSolenoid = false;

    if (this.getActivePlayMode() === 'CONCENTRATION_PRIZE_MATCH') {
      const prize = this.concentrationPrizes.get(target.index) ?? 'NONE';
      if (prize !== 'NONE') {
        target.revealedConcentrationPrize = CONCENTRATION_PRIZE_NAMES_V7[prize];
        this.revealedConcentrationTiles.add(target.index);
        this.concentrationTileClaimer.set(
          target.index,
          playerAnsweredCorrectly ? 'PLAYER' : 'RIVAL',
        );
      }
    }

    this.advanceTurnState(tiles, target);
    return breakdown;
  }

  private computeChampionTileJitter(
    rivalId: RivalIdV7,
    turnNumber: number,
    tile: BoardTileNodeV7,
    visibleTwist: ClassicTvTileTwistV7,
    isKnownStrong: boolean,
  ): number {
    // 1. Deterministic per-(rivalId, turnNumber, category, tile.index) affinity micro-bias in [-42, +42]
    const turnKey = `${rivalId}|${turnNumber}|${tile.category}|${tile.index}|${this.context.seedOffset ?? 0}`;
    let h1 = 2166136261;
    for (let i = 0; i < turnKey.length; i++) {
      h1 ^= turnKey.charCodeAt(i);
      h1 = Math.imul(h1, 16777619);
    }
    const turnMicroBias = (((h1 >>> 0) % 8401) / 4200 - 1) * 42;

    // 2. Champion-specific Stage Zone & Twist Signature (prevents 65%+ same-playstyle tile cloning!)
    let champHash = 2166136261;
    for (let i = 0; i < rivalId.length; i++) {
      champHash ^= rivalId.charCodeAt(i);
      champHash = Math.imul(champHash, 16777619);
    }
    const ch = champHash >>> 0;
    const prefDirX = ((ch % 5) - 2) * 0.5; // -1.0, -0.5, 0.0, +0.5, +1.0
    const prefDirZ = (((ch >>> 3) % 5) - 2) * 0.5;
    const zoneBias = tile.x * prefDirX * 58 + tile.z * prefDirZ * 64;

    // Champion-specific twist taste among visible TV twists
    let twistTaste = 0;
    if (visibleTwist !== 'NONE') {
      const twKey = `${rivalId}::TWIST::${visibleTwist}`;
      let ht = 2166136261;
      for (let i = 0; i < twKey.length; i++) {
        ht ^= twKey.charCodeAt(i);
        ht = Math.imul(ht, 16777619);
      }
      twistTaste = (((ht >>> 0) % 3001) / 1500 - 1) * 135;
    }

    // Some Champions fiercely prize their personal wheelhouse turf even inside GAMBLER/HIGH_ROLLER
    const turfPride = isKnownStrong ? ((ch >>> 7) % 110) : 0;

    // Category taste tiebreaker per Champion
    const catKey = `${rivalId}::CAT::${tile.category}`;
    let hc = 2166136261;
    for (let i = 0; i < catKey.length; i++) {
      hc ^= catKey.charCodeAt(i);
      hc = Math.imul(hc, 16777619);
    }
    const catTaste = (((hc >>> 0) % 2001) / 1000 - 1) * 48;

    return turnMicroBias + zoneBias + twistTaste + turfPride + catTaste;
  }

  /**
   * Selects a smart target tile for the Rival's turn driven by their `CpuPlaystyleIdV7`
   * archetype (`GAMBLER`, `BLOCKER`, `PROFESSOR`, `HIGH_ROLLER`, `CLUTCH_SHARK`) and
   * `CpuTemperamentIdV7` (`HOTHEAD`, `ICE_VEINED`, `STEADY`, `SHOWBOAT`),
   * while strictly honoring `isVaultLocked`, `isTopologyLocked`, and 1-Turn Keyholder Priority!
   */
  public chooseRivalTargetTile(tiles: BoardTileNodeV7[]): number | null {
    const unprotectedOpen = tiles.filter(
      (t) =>
        (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') &&
        !t.isVaultLocked &&
        !t.isTopologyLocked &&
        !t.isLiveWireLocked &&
        !(t.keyholderProtectedTurns && t.keyholderProtectedTurns > 0),
    );
    const fallbackOpen =
      unprotectedOpen.length > 0
        ? unprotectedOpen
        : tiles.filter(
            (t) =>
              (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') &&
              !t.isVaultLocked &&
              !t.isTopologyLocked &&
              !t.isLiveWireLocked,
          );
    if (fallbackOpen.length === 0) return null;

    const rivalId = this.context.rivalId ?? 'CARMEN_DELGADO';
    const playstyle: CpuPlaystyleIdV7 =
      this.context.cpuPlaystyle ?? DEFAULT_RIVAL_PLAYSTYLE_V7[rivalId] ?? 'PROFESSOR';
    const temperament: CpuTemperamentIdV7 =
      this.context.cpuTemperament ?? DEFAULT_RIVAL_TEMPERAMENT_V7[rivalId] ?? 'STEADY';
    const turnNumber = this.context.turnNumber ?? this.gimmick.turnCounter + 1;
    const strongSet = new Set<CategoryIdV7>(this.getEffectiveStrongCategories());
    const weakSet = new Set<CategoryIdV7>(this.getEffectiveWeakCategories());

    let bestTile = fallbackOpen[0];
    let bestScore = -Infinity;

    const playMode = this.getActivePlayMode();
    const playerClaimed = tiles.filter((t) => t.state === 'CLAIMED_PLAYER');
    const rivalClaimed = tiles.filter((t) => t.state === 'CLAIMED_RIVAL');
    const playerBoardChipSum = playerClaimed.reduce((acc, t) => acc + t.baseChips, 0);
    const rivalBoardChipSum = rivalClaimed.reduce((acc, t) => acc + t.baseChips, 0);
    const isRivalTrailing = rivalBoardChipSum < playerBoardChipSum;
    const maxPlayerX =
      playerClaimed.length > 0 ? Math.max(...playerClaimed.map((t) => t.x)) : -Infinity;

    const bridgeAnalysis =
      playMode === 'COAST_HEX_BRIDGE' && !this.coastToCoastAwarded
        ? this.analyzeCoastBridgeChokepoints(tiles)
        : null;
    const hasUrgentBridgeThreat = Boolean(
      bridgeAnalysis &&
        (bridgeAnalysis.oneStepSet.size > 0 || bridgeAnalysis.twoStepPairCounts.size > 0),
    );

    for (const tile of fallbackOpen) {
      // Honest On-Stage Visibility: mask `$600 · ???` blind categories & unrevealed Secret Squares!
      const categoryKnown = !tile.blindCategoryHidden;
      const isKnownStrong = categoryKnown && strongSet.has(tile.category);
      const isKnownWeak = categoryKnown && weakSet.has(tile.category);
      const visibleTwist: ClassicTvTileTwistV7 =
        tile.tvTwist === 'SECRET_SQUARE' && !this.revealedSecretSquareIndices.has(tile.index)
          ? 'NONE'
          : (tile.tvTwist ?? 'NONE');
      const visibleChips = tile.mysteryCashHidden ? 350 : tile.baseChips;

      let score = visibleChips * 0.42 + tile.boardMultBonus * 145;
      if (isKnownStrong) score += 155;
      if (isKnownWeak) score -= 145;
      if (tile.hasAmberTruce && RIVAL_SYMPATHETIC_SET_V7.has(rivalId)) score -= 220;
      if (tile.isRiggedSolenoid) score -= 75;
      if (visibleTwist === 'OPPONENT_CHOICE') score -= 60;

      // Concentration Match/Steal Awareness: hunt open partner of an already-revealed prize!
      if (playMode === 'CONCENTRATION_PRIZE_MATCH') {
        const myPrize = this.concentrationPrizes.get(tile.index) ?? 'NONE';
        if (myPrize !== 'NONE' && !this.awardedPrizePackages.has(myPrize)) {
          const partnerRevealed = Array.from(this.revealedConcentrationTiles).some(
            (rIdx) => rIdx !== tile.index && this.concentrationPrizes.get(rIdx) === myPrize,
          );
          if (partnerRevealed) {
            score += 265;
          }
        }
      }

      // Baseline mode awareness: block imminent 3-in-a-row jackpots & Coast-to-Coast bridges
      const threatLines =
        playMode === 'TIC_TAC_LINE' ? this.findPlayerThreeInARowLines(tiles, tile.index) : [];
      const blocksLineThreat =
        playMode === 'TIC_TAC_LINE' &&
        threatLines.some((ln) => !this.awardedTicTacLines.has(ln.join('-')));
      if (blocksLineThreat) {
        score += 360;
      }

      const adjPlayerCount = this.countAdjacentClaimedPlayer(tile, tiles);
      const completesBridge1Step = Boolean(bridgeAnalysis?.oneStepSet.has(tile.index));
      const twoStepBridgeCount = bridgeAnalysis?.twoStepPairCounts.get(tile.index) ?? 0;
      const cutDelta = bridgeAnalysis?.cutVertexDelta.get(tile.index) ?? 0;
      const blocksBridgeFrontier =
        !this.coastToCoastAwarded &&
        adjPlayerCount >= 1 &&
        (tile.x >= maxPlayerX - 0.15 || Math.abs(tile.x) <= 0.65);

      if (playMode === 'COAST_HEX_BRIDGE' && !this.coastToCoastAwarded) {
        if (completesBridge1Step) {
          score += 520 + (cutDelta > 0 ? 120 : 0);
        } else if (twoStepBridgeCount > 0) {
          score += 240 + Math.min(120, twoStepBridgeCount * 35) + (cutDelta > 0 ? 140 : 0);
        } else if (cutDelta > 0) {
          score += 175 + (cutDelta >= 99 ? 90 : 0);
        } else if (blocksBridgeFrontier) {
          score += 140;
        }
      }

      // 5 Distinct `CpuPlaystyleIdV7` Archetype Personalities:
      switch (playstyle) {
        case 'GAMBLER': {
          if (
            visibleTwist === 'BIG_WHEEL_SPIN' ||
            visibleTwist === 'PRESS_LUCK_SPIN' ||
            visibleTwist === 'MYSTERY_CURTAIN' ||
            visibleTwist === 'MYSTERY_CASH' ||
            visibleTwist === 'SECRET_SQUARE'
          ) {
            score += 155;
          } else if (visibleTwist === 'SHOWCASE_BONUS' || visibleTwist === 'OPPONENT_CHOICE') {
            score += 110;
          }
          break;
        }
        case 'BLOCKER': {
          if (playMode === 'TIC_TAC_LINE' && blocksLineThreat) {
            score += 620;
          }
          if (playMode === 'COAST_HEX_BRIDGE' && !this.coastToCoastAwarded) {
            if (completesBridge1Step) {
              score += 920 + (cutDelta > 0 ? 280 : 0);
            } else if (twoStepBridgeCount > 0) {
              score +=
                580 +
                Math.min(180, twoStepBridgeCount * 45) +
                (cutDelta >= 99 ? 320 : cutDelta > 0 ? 220 : 0);
            } else if (cutDelta > 0) {
              score += 420 + (cutDelta >= 99 ? 200 : 0);
            } else if (blocksBridgeFrontier) {
              score += 190;
            }
          }
          if (adjPlayerCount >= 1) {
            score += adjPlayerCount * (hasUrgentBridgeThreat ? 40 : 120);
          }
          const nearLockedVault = tiles.some(
            (v) =>
              v.tvTwist === 'LOCKED_VAULT' &&
              v.isVaultLocked &&
              Math.hypot(v.x - tile.x, v.z - tile.z) <= 1.22,
          );
          if (nearLockedVault && !hasUrgentBridgeThreat) score += 135;
          if (visibleTwist === 'BRASS_KEY' && !completesBridge1Step) score += 175;
          break;
        }
        case 'PROFESSOR': {
          if (isKnownStrong) score += 230;
          if (isKnownWeak) score -= 240;
          if (visibleTwist === 'BLIND_CATEGORY' || visibleTwist === 'PRESS_LUCK_SPIN') {
            score -= 95;
          }
          break;
        }
        case 'HIGH_ROLLER': {
          score += visibleChips * 0.52;
          if (
            visibleChips >= 450 ||
            visibleTwist === 'BLIND_CATEGORY' ||
            (visibleTwist === 'LOCKED_VAULT' && !tile.isVaultLocked) ||
            visibleTwist === 'BRASS_KEY'
          ) {
            score += 195;
          }
          break;
        }
        case 'CLUTCH_SHARK': {
          if (turnNumber >= 8) {
            score += visibleChips * 0.72 + tile.boardMultBonus * 240 + 185;
            if (visibleTwist === 'BIG_WHEEL_SPIN' || tile.state === 'BLITZ_SURVIVOR') {
              score += 195;
            }
          } else {
            if (isKnownStrong) score += 110;
            if (playMode === 'TIC_TAC_LINE' && blocksLineThreat) score += 210;
            if (playMode === 'COAST_HEX_BRIDGE' && completesBridge1Step) score += 240;
          }
          break;
        }
      }

      // 4 Distinct `CpuTemperamentIdV7` Nuances + Per-Champion Signature Affinity Micro-Bias:
      switch (temperament) {
        case 'HOTHEAD': {
          if (isRivalTrailing || turnNumber >= 6) {
            score += visibleChips * 0.28 + (visibleChips >= 350 ? 85 : 0);
          }
          if (visibleTwist === 'OPPONENT_CHOICE') score += 95;
          if (tile.isRiggedSolenoid) score += 65;
          break;
        }
        case 'SHOWBOAT': {
          const centerProximity = Math.max(0, 1.35 - Math.hypot(tile.x * 0.65, tile.z));
          score += centerProximity * 38;
          if (this.activeSpotlightIndices.includes(tile.index)) score += 85;
          if (
            visibleTwist === 'BIG_WHEEL_SPIN' ||
            visibleTwist === 'PRESS_LUCK_SPIN' ||
            visibleTwist === 'MYSTERY_CURTAIN' ||
            visibleTwist === 'SHOWCASE_BONUS'
          ) {
            score += 42;
          }
          break;
        }
        case 'ICE_VEINED': {
          const expectedHitWeight = isKnownStrong ? 90 : isKnownWeak ? -105 : 24;
          score += expectedHitWeight + tile.boardMultBonus * 85;
          if (tile.isRiggedSolenoid) score -= 50;
          if (visibleTwist === 'BLIND_CATEGORY' && playstyle !== 'HIGH_ROLLER') score -= 45;
          break;
        }
        case 'STEADY':
        default: {
          if (isKnownStrong) score += 45;
          if (!tile.isRiggedSolenoid && visibleTwist === 'NONE') score += 28;
          break;
        }
      }

      score += this.computeChampionTileJitter(
        rivalId,
        turnNumber,
        tile,
        visibleTwist,
        isKnownStrong,
      );

      if (this.context.boardId === 'BOARD_11_WHEW_GAUNTLET' && Math.abs(tile.z) < 0.35) {
        score += 85;
      }
      if (score > bestScore) {
        bestScore = score;
        bestTile = tile;
      }
    }

    for (const t of tiles) {
      t.isRivalTarget = t.index === bestTile.index;
    }
    return bestTile.index;
  }

  public getCpuConcentrationBonusSummary(): {
    readonly bonusCash: number;
    readonly stealCash: number;
    readonly awardedPackagesCount: number;
  } {
    return {
      bonusCash: this.cpuConcentrationBonusCash,
      stealCash: this.cpuConcentrationStealCash,
      awardedPackagesCount: this.awardedPrizePackages.size,
    };
  }

  public commitRivalTileClaim(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
  ): {
    readonly revealedConcentrationPrize?: string;
    readonly matchedPrize?: string;
    readonly cpuBonusCash?: number;
    readonly cpuStealCash?: number;
    readonly highlightedTileIndices?: readonly number[];
  } {
    const target = tiles.find((t) => t.index === tileIndex);
    if (!target) return {};
    target.state = 'CLAIMED_RIVAL';
    target.isRivalTarget = false;
    target.isRiggedSolenoid = false;

    let revealedConcentrationPrize: string | undefined;
    let matchedPrize: string | undefined;
    let cpuBonusCash = 0;
    let cpuStealCash = 0;
    let highlightedTileIndices: number[] | undefined;

    if (this.getActivePlayMode() === 'CONCENTRATION_PRIZE_MATCH') {
      const prize = this.concentrationPrizes.get(target.index) ?? 'NONE';
      if (prize !== 'NONE') {
        const prizeName = CONCENTRATION_PRIZE_NAMES_V7[prize];
        target.revealedConcentrationPrize = prizeName;
        revealedConcentrationPrize = prizeName;
        this.revealedConcentrationTiles.add(target.index);
        this.concentrationTileClaimer.set(target.index, 'RIVAL');

        const siblingEntries = Array.from(this.concentrationPrizes.entries()).filter(
          ([idx, p]) => idx !== target.index && p === prize,
        );
        const playerSibling = siblingEntries.find(([idx]) => {
          const sibTile = tiles.find((t) => t.index === idx);
          return (
            sibTile?.state === 'CLAIMED_PLAYER' ||
            this.concentrationTileClaimer.get(idx) === 'PLAYER'
          );
        });
        const matchingRevealed = Array.from(this.revealedConcentrationTiles).filter(
          (idx) => this.concentrationPrizes.get(idx) === prize,
        );

        if (prize === 'TAKE_STEAL') {
          if (playerSibling && !this.awardedPrizePackages.has(prize)) {
            this.awardedPrizePackages.add(prize);
            const sibTile = tiles.find((t) => t.index === playerSibling[0]);
            if (sibTile && !sibTile.revealedConcentrationPrize) {
              sibTile.revealedConcentrationPrize = prizeName;
            }
            matchedPrize = `PRIZE MATCH STEAL: ${prizeName}`;
            cpuBonusCash = 250;
            cpuStealCash = 200;
            highlightedTileIndices = [playerSibling[0], target.index];
          } else {
            if (matchingRevealed.length >= 2 && !this.awardedPrizePackages.has(prize)) {
              this.awardedPrizePackages.add(prize);
              matchedPrize = prizeName;
              cpuBonusCash = 250;
              highlightedTileIndices = matchingRevealed;
            } else {
              highlightedTileIndices = [target.index];
            }
            cpuStealCash = 200;
          }
        } else if (!this.awardedPrizePackages.has(prize)) {
          if (playerSibling) {
            this.awardedPrizePackages.add(prize);
            const sibTile = tiles.find((t) => t.index === playerSibling[0]);
            if (sibTile && !sibTile.revealedConcentrationPrize) {
              sibTile.revealedConcentrationPrize = prizeName;
            }
            matchedPrize = `PRIZE MATCH STEAL: ${prizeName}`;
            cpuBonusCash = 250;
            highlightedTileIndices = [playerSibling[0], target.index];
          } else if (matchingRevealed.length >= 2) {
            this.awardedPrizePackages.add(prize);
            matchedPrize = prizeName;
            cpuBonusCash = 500;
            highlightedTileIndices = matchingRevealed;
          } else {
            cpuBonusCash = 75;
            highlightedTileIndices = [target.index];
          }
        }

        if (cpuBonusCash > 0) {
          this.cpuConcentrationBonusCash += cpuBonusCash;
        }
        if (cpuStealCash > 0) {
          this.cpuConcentrationStealCash += cpuStealCash;
        }
      }
    }

    this.advanceTurnState(tiles, target);
    if (isR7BoardPlayModeV9(this.activeBoardModeV9)) {
      this.resolvePostTurnBoardModeV9(tileIndex, tiles, 'RIVAL', true);
    }
    return {
      revealedConcentrationPrize,
      matchedPrize,
      ...(cpuBonusCash > 0 ? { cpuBonusCash } : {}),
      ...(cpuStealCash > 0 ? { cpuStealCash } : {}),
      ...(highlightedTileIndices ? { highlightedTileIndices } : {}),
    };
  }

  // --------------------------------------------------------------------------
  // Keep-4-Keystones (`5:10`) Solenoid Re-Rack -> 6 Trapdoor Blitz Plinths
  // --------------------------------------------------------------------------

  /**
   * Executes the canonical `5:10` Keep-4-Keystones Solenoid Re-Rack:
   * Preserves 4 strategic Keystone tiles (prioritizing high-stake corners/centers and
   * contested footholds) + 2 fresh surge plinths = exact `6` `BLITZ_SURVIVOR` plinths,
   * while retracting all remaining `N - 6` tiles via solenoid pull-down (`RETRACTED`).
   */
  public applyBlitzSolenoidReRack(tiles: BoardTileNodeV7[]): BlitzReRackResultV7 {
    this.context = {
      ...this.context,
      isBlitzPhase: true,
    };

    if (tiles.length === 0) {
      return { survivorIndices: [], keystoneIndices: [], retractedIndices: [] };
    }

    const targetSurvivorCount = Math.min(6, tiles.length);

    // Score 4 Keystones: favor outer structural corners/high-tier plinths & earned footholds
    const keystoneRanked = [...tiles].sort((a, b) => {
      const aCorner = this.isCornerKeystone(a, tiles) ? 120 : 0;
      const bCorner = this.isCornerKeystone(b, tiles) ? 120 : 0;
      const aClaimed = a.state === 'CLAIMED_PLAYER' ? 95 : a.state === 'CLAIMED_RIVAL' ? 55 : 30;
      const bClaimed = b.state === 'CLAIMED_PLAYER' ? 95 : b.state === 'CLAIMED_RIVAL' ? 55 : 30;
      const aScore = aCorner + aClaimed + a.tierY * 200 + a.baseChips * 0.25;
      const bScore = bCorner + bClaimed + b.tierY * 200 + b.baseChips * 0.25;
      return bScore - aScore || a.index - b.index;
    });

    const keystoneIndices: number[] = [];
    for (const t of keystoneRanked) {
      if (keystoneIndices.length >= Math.min(4, targetSurvivorCount)) break;
      keystoneIndices.push(t.index);
    }

    const survivorSet = new Set<number>(keystoneIndices);

    // Fill remaining 2 slots with central high-visibility open/prime surge plinths
    const surgeRanked = [...tiles]
      .filter((t) => !survivorSet.has(t.index))
      .sort((a, b) => {
        const aOpenBonus = a.state === 'OPEN' ? 150 : 0;
        const bOpenBonus = b.state === 'OPEN' ? 150 : 0;
        const aCenter = -Math.hypot(a.x, a.z) * 40 + a.baseChips * 0.2;
        const bCenter = -Math.hypot(b.x, b.z) * 40 + b.baseChips * 0.2;
        return bOpenBonus + bCenter - (aOpenBonus + aCenter) || a.index - b.index;
      });

    for (const t of surgeRanked) {
      if (survivorSet.size >= targetSurvivorCount) break;
      survivorSet.add(t.index);
    }

    const survivorIndices: number[] = [];
    const retractedIndices: number[] = [];

    for (const tile of tiles) {
      tile.isRivalTarget = false;
      tile.hasAmberTruce = false;
      tile.isVaultLocked = false;
      tile.isLiveWireLocked = false;
      tile.isTopologyLocked = false;
      tile.isSpotlightTile = false;
      tile.dominoGroupId = undefined;
      if (survivorSet.has(tile.index)) {
        tile.state = 'BLITZ_SURVIVOR';
        tile.baseChips = Math.max(tile.baseChips, 300);
        survivorIndices.push(tile.index);
      } else {
        tile.state = 'RETRACTED';
        tile.isRiggedSolenoid = false;
        tile.tvTwist = 'NONE';
        tile.tvTwistV9 = undefined;
        tile.vipId = undefined;
        retractedIndices.push(tile.index);
      }
    }

    this.seedClassicTvTwistsOnTiles(tiles, this.activeWaveNumber + 1, this.context.seedOffset ?? 0);
    this.recomputeBoardModifiers(tiles);
    return {
      survivorIndices,
      keystoneIndices,
      retractedIndices,
    };
  }
}
