// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/boards/BoardTwistsEngineV7.ts`
// All 16 Live-Wired Board Twists (Zero Placebo Banners), Piece-3 Multiplier Cap
// (`<= 2.0x` Cold / `<= 3.0x` Streaking), Amber Chalk Truce Trust Ledger,
// Rival Wheelhouse Weak-Spot Bounty, Solenoid Rigged Gambit, Toby's Mercy
// Switch Discharge & Keep-4-Keystones (`5:10`) Solenoid Blitz Re-Rack!
// ============================================================================

import {
  ALL_CATEGORIES_V7,
  CATEGORY_TO_DOMAIN_V7,
  type BoardIdV7,
  type BoardTileNodeV7,
  type BoardTwistIdV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type DomainIdV7,
  type RivalIdV7,
} from '../contracts_v7';

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
// 2. Canonical Rival Weak/Strong Fallback Map (Matches `CastProfileV7` 20/20!)
// ----------------------------------------------------------------------------

export const RIVAL_SYMPATHETIC_SET_V7: ReadonlySet<RivalIdV7> = new Set<RivalIdV7>([
  'CARMEN_DELGADO',
  'TOBY_OKAFOR',
  'INEZ_CALLAHAN',
]);

export const DEFAULT_RIVAL_WEAK_CATEGORIES_V7: Record<RivalIdV7, readonly CategoryIdV7[]> = {
  CARMEN_DELGADO: ['PHYSICS', 'FINANCE', 'ENGINES'],
  TOBY_OKAFOR: ['DYNASTIES', 'FINE ARTS', 'LITERATURE'],
  INEZ_CALLAHAN: ['GADGETS', 'JUKEBOX', 'SPORTS'],
  ALASTAIR_KERR: ['SCREEN', 'CUISINE', 'PRICING'],
  SEO_YUN_KANG: ['FOLKLORE', 'HEADLINES', 'LEXICON'],
  REX_CALLOWAY: ['CHEMISTRY', 'MEDICINE', 'FALLACIES'],
};

export const DEFAULT_RIVAL_STRONG_CATEGORIES_V7: Record<RivalIdV7, readonly CategoryIdV7[]> = {
  CARMEN_DELGADO: ['LEXICON', 'LITERATURE', 'CUISINE'],
  TOBY_OKAFOR: ['ENGINES', 'GADGETS', 'PHYSICS'],
  INEZ_CALLAHAN: ['FINANCE', 'ODDS', 'HEADLINES'],
  ALASTAIR_KERR: ['DYNASTIES', 'FINE ARTS', 'FOLKLORE'],
  SEO_YUN_KANG: ['MEDICINE', 'CHEMISTRY', 'ATLAS'],
  REX_CALLOWAY: ['SPORTS', 'SCREEN', 'PRICING'],
};

// ----------------------------------------------------------------------------
// 3. Twist Runtime State, Gimmick Controls & Tile Evaluation Contracts
// ----------------------------------------------------------------------------

export interface BoardGimmickStateV7 {
  /** -1.0 (Left Deck), 0.0 (Center Split), +1.0 (Right Deck) for `BOARD_01_FUNK_CROSSFADER`. */
  crossfaderPosition: -1 | 0 | 1;
  /** 0..2 gear escapement phase for `BOARD_03_VAUDEVILLE_GEAR_TRAIN`. */
  gearPhase: number;
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
  /** Live balance beam tilt in degrees (`-4.5 .. +4.5`, negative = left heavy, positive = right heavy). */
  pendulumTiltDeg: number;
  /** Whether Toby's Mercy Switch has been pulled on the table flank this match. */
  mercySwitchPulled: boolean;
  /** Whether an Amber Chalk Truce was broken earlier this match. */
  amberTruceBroken: boolean;
  /** Turn counter incremented after each board action. */
  turnCounter: number;
}

export type BoardPlayModeV7 =
  | 'CLASSIC_TOTE'
  | 'TIC_TAC_LINE'
  | 'COAST_HEX_BRIDGE'
  | 'EYE_GUESS_MEMORY'
  | 'CONCENTRATION_PRIZE_MATCH'
  | 'MONTY_CURTAIN_DEAL';

export type EyeGuessHiddenBadgeV7 = 'NONE' | 'DOUBLE_2X' | 'CASH_300' | 'TRAP';

export type ConcentrationPrizeKindV7 =
  | 'NONE'
  | 'COLOR_TV'
  | 'CONVERTIBLE'
  | 'HAWAII_TRIP'
  | 'TAKE_STEAL';

export interface BoardModePostClaimResultV7 {
  readonly mode: BoardPlayModeV7;
  readonly bonusCash: number;
  readonly rivalStealCash: number;
  readonly multAdd: number;
  readonly bannerHeadline: string | null;
  readonly highlightedTileIndices?: readonly number[];
}

export interface BoardModeRuleBannerV7 {
  readonly mode: BoardPlayModeV7;
  readonly modeTitle: string;
  readonly ruleSummary: string;
}

export const BOARD_PLAY_MODE_BY_BOARD_V7: Record<BoardIdV7, BoardPlayModeV7> = {
  BOARD_01_FUNK_CROSSFADER: 'CLASSIC_TOTE',
  BOARD_02_JUBILEE_HEX_BRIDGE: 'TIC_TAC_LINE',
  BOARD_03_VAUDEVILLE_GEAR_TRAIN: 'CONCENTRATION_PRIZE_MATCH',
  BOARD_04_MAHOGANY_SWITCHBOARD: 'CLASSIC_TOTE',
  BOARD_05_LARSON_SPIN_RING: 'EYE_GUESS_MEMORY',
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
    modeTitle: "1964 CLASSIC TOTE",
    ruleSummary: 'Climb $150–$400 rows, uncover the hidden 2× Secret Square & crack the $500 Gold Vault!',
  },
  TIC_TAC_LINE: {
    mode: 'TIC_TAC_LINE',
    modeTitle: "HOLLYWOOD SQUARES · 3-IN-A-ROW",
    ruleSummary: 'Connect 3 claimed tiles in a line for a +$600 LINE JACKPOT — watch Rival blocks!',
  },
  COAST_HEX_BRIDGE: {
    mode: 'COAST_HEX_BRIDGE',
    modeTitle: 'COAST-TO-COAST BRIDGE',
    ruleSummary: 'Connect Left (NYC) to Right (Hollywood) across adjacent wins for +$750 (+0.25×/link)!',
  },
  EYE_GUESS_MEMORY: {
    mode: 'EYE_GUESS_MEMORY',
    modeTitle: "EYE GUESS '66 · MEMORY FLASH",
    ruleSummary: 'Memorize the 2.4s board flash! Claim hidden ⭐ 2× & 💰 +$300 tiles while dodging 🎭 TRAPS!',
  },
  CONCENTRATION_PRIZE_MATCH: {
    mode: 'CONCENTRATION_PRIZE_MATCH',
    modeTitle: "CONCENTRATION '65 · PRIZE MATCH",
    ruleSummary: 'Match 2 Luxury Prize Halves (Color TV, Convertible, Hawaii) for +$500 — hit TAKE! to steal $200!',
  },
  MONTY_CURTAIN_DEAL: {
    mode: 'MONTY_CURTAIN_DEAL',
    modeTitle: "LET'S MAKE A DEAL · CURTAIN SHOW",
    ruleSummary: 'Triple Velvet Mystery Curtains (#1–#3) + Instant Bargains — trade, double & steal!',
  },
};

export interface BoardTwistContextV7 {
  readonly boardId: BoardIdV7;
  readonly twistId: BoardTwistIdV7;
  readonly rivalId?: RivalIdV7;
  readonly rivalWeakCategories?: readonly CategoryIdV7[];
  readonly rivalStrongCategories?: readonly CategoryIdV7[];
  readonly playerStreak?: number;
  readonly isBlitzPhase?: boolean;
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
};

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

export class BoardTwistsEngineV7 {
  private context: BoardTwistContextV7;
  private gimmick: BoardGimmickStateV7;
  private revealedSecretSquareIndices = new Set<number>();
  private rolledMysteryOutcomes = new Map<number, MysteryCurtainOutcomeV7>();
  private mysteryCurtainNumbers = new Map<number, 1 | 2 | 3>();
  private eyeGuessBadges = new Map<number, EyeGuessHiddenBadgeV7>();
  private concentrationPrizes = new Map<number, ConcentrationPrizeKindV7>();
  private revealedConcentrationTiles = new Set<number>();
  private awardedPrizePackages = new Set<ConcentrationPrizeKindV7>();
  private awardedTicTacLines = new Set<string>();
  private coastToCoastAwarded = false;
  private activeWaveNumber = 1;

  constructor(initialContext?: Partial<BoardTwistContextV7>) {
    this.context = {
      boardId: initialContext?.boardId ?? 'BOARD_01_FUNK_CROSSFADER',
      twistId: initialContext?.twistId ?? 'TWIST_01_CROSSFADER_BOOST',
      rivalId: initialContext?.rivalId ?? 'CARMEN_DELGADO',
      rivalWeakCategories: initialContext?.rivalWeakCategories,
      rivalStrongCategories: initialContext?.rivalStrongCategories,
      playerStreak: initialContext?.playerStreak ?? 0,
      isBlitzPhase: initialContext?.isBlitzPhase ?? false,
      seedOffset: initialContext?.seedOffset ?? 0,
    };
    this.gimmick = this.createInitialGimmickState();
  }

  private createInitialGimmickState(): BoardGimmickStateV7 {
    return {
      crossfaderPosition: -1,
      gearPhase: 0,
      larsonHotTileIndex: 0,
      spinPassesUsed: 0,
      chargedBumperIndex: 0,
      baccaratShoeTotal: 9,
      sundialAngleRad: -Math.PI * 0.25,
      tunedUhfDomain: 'SCI_TECH',
      pendulumTiltDeg: 0,
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
    this.context = {
      ...this.context,
      ...nextContext,
    };
    if (resetGimmicks) {
      this.gimmick = this.createInitialGimmickState();
      this.revealedSecretSquareIndices.clear();
      this.rolledMysteryOutcomes.clear();
      this.mysteryCurtainNumbers.clear();
      this.eyeGuessBadges.clear();
      this.concentrationPrizes.clear();
      this.revealedConcentrationTiles.clear();
      this.awardedPrizePackages.clear();
      this.awardedTicTacLines.clear();
      this.coastToCoastAwarded = false;
      this.activeWaveNumber = 1;
    }
    if (tiles && tiles.length > 0) {
      this.seedSocketMarkersOnTiles(tiles);
      this.seedClassicTvTwistsOnTiles(tiles, this.activeWaveNumber, this.context.seedOffset ?? 0);
      this.syncPendulumTilt(tiles);
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

  /**
   * Seeds deterministic Amber Chalk Truce rings, Rival Wheelhouse weak-spot flags,
   * Pirate UHF halos, and Rigged Solenoid gambit tiles onto a freshly built board.
   */
  public seedSocketMarkersOnTiles(tiles: BoardTileNodeV7[]): void {
    if (tiles.length === 0) return;

    const weakSet = new Set<CategoryIdV7>(this.getEffectiveWeakCategories());
    const rivalId = this.context.rivalId ?? 'CARMEN_DELGADO';
    const isSympathetic = RIVAL_SYMPATHETIC_SET_V7.has(rivalId);
    const twistId = this.context.twistId;

    // Reset dynamic flags cleanly first
    for (const tile of tiles) {
      tile.domain = CATEGORY_TO_DOMAIN_V7[tile.category] ?? tile.domain;
      tile.isWheelhouse = weakSet.has(tile.category);
      tile.hasAmberTruce = false;
      tile.hasUhfHalo = false;
      tile.isRiggedSolenoid = false;
    }

    // Ensure at least 2 tiles carry Rival weak categories so Wheelhouse Totem is always actionable
    let wheelhouseCount = tiles.filter((t) => t.isWheelhouse).length;
    const weakList = this.getEffectiveWeakCategories();
    if (wheelhouseCount < 2 && weakList.length > 0) {
      for (let i = 0; i < tiles.length && wheelhouseCount < 2; i++) {
        const candidateIdx = (i * 5 + 2) % tiles.length;
        const candidate = tiles[candidateIdx];
        if (!candidate.isWheelhouse) {
          const forcedCat = weakList[wheelhouseCount % weakList.length] ?? ALL_CATEGORIES_V7[0];
          candidate.category = forcedCat;
          candidate.domain = CATEGORY_TO_DOMAIN_V7[forcedCat];
          candidate.isWheelhouse = true;
          wheelhouseCount++;
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

    // Reset all tiles to clean classic 4-option defaults first
    for (const tile of tiles) {
      tile.tvTwist = 'NONE';
      tile.isVaultLocked = false;
    }

    const playable = tiles.filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
    if (playable.length === 0) return;

    const assigned = new Set<number>();
    const hashBase = this.computeDeterministicBoardHash(waveNumber * 31);

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

    // 2. SECRET_SQUARE (1 hidden Daily Double tile per board; reveals on tap!)
    const secretTile = pickNextUnassigned(101, (t) => t.baseChips >= 200);
    if (secretTile) {
      secretTile.tvTwist = 'SECRET_SQUARE';
    }

    // 3. OPPONENT_CHOICE (`1–2` tiles badged `🎭 RIVAL'S PICK`, preferring Rival strong categories!)
    const strongSet = new Set<CategoryIdV7>(this.getEffectiveStrongCategories());
    const opponentTargetCount = playable.length >= 10 ? 2 : 1;
    for (let i = 0; i < opponentTargetCount; i++) {
      const oppTile = pickNextUnassigned(203 + i * 29, (t) => strongSet.has(t.category));
      if (oppTile) {
        oppTile.tvTwist = 'OPPONENT_CHOICE';
      }
    }

    // 4. MYSTERY_CURTAIN (`1–2` tiles normally, or `3` full Curtains #1/#2/#3 on `MONTY_CURTAIN_DEAL`!)
    const playMode = this.getActivePlayMode();
    const curtainTargetCount =
      playMode === 'MONTY_CURTAIN_DEAL'
        ? Math.min(3, playable.length)
        : playable.length >= 10
          ? 2
          : 1;
    for (let i = 0; i < curtainTargetCount; i++) {
      const curtainTile = pickNextUnassigned(307 + i * 41, (t) => !t.hasAmberTruce);
      if (curtainTile) {
        curtainTile.tvTwist = 'MYSTERY_CURTAIN';
        const num = (playMode === 'MONTY_CURTAIN_DEAL'
          ? (i % 3) + 1
          : ((waveNumber - 1 + i) % 3) + 1) as 1 | 2 | 3;
        this.mysteryCurtainNumbers.set(curtainTile.index, num);
      }
    }

    // 5. SHOWCASE_BONUS (`2–3` tiles per 12–15 tile board -> exact ~25% special tactile showcase rounds!)
    const showcaseTargetCount = playable.length >= 12 ? 3 : playable.length >= 8 ? 2 : 1;
    for (let i = 0; i < showcaseTargetCount; i++) {
      const showcaseTile = pickNextUnassigned(419 + i * 53);
      if (showcaseTile) {
        showcaseTile.tvTwist = 'SHOWCASE_BONUS';
      }
    }

    // 6. Seed Mode-Specific Hidden Layers (`EYE_GUESS_MEMORY` & `CONCENTRATION_PRIZE_MATCH`)
    this.seedBoardPlayModeState(tiles, waveNumber);
  }

  public getActivePlayMode(): BoardPlayModeV7 {
    return BOARD_PLAY_MODE_BY_BOARD_V7[this.context.boardId] ?? 'CLASSIC_TOTE';
  }

  public getBoardModeRuleBanner(): BoardModeRuleBannerV7 {
    return BOARD_MODE_RULE_BANNERS_V7[this.getActivePlayMode()];
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
    this.concentrationPrizes.clear();
    this.revealedConcentrationTiles.clear();
    this.awardedPrizePackages.clear();
    this.awardedTicTacLines.clear();
    this.coastToCoastAwarded = false;

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
   * BFS pathfinder for `COAST_HEX_BRIDGE`: checks whether Player-claimed tiles form a
   * continuous adjacent bridge from the Leftmost Edge (NYC) to the Rightmost Edge (Hollywood)!
   */
  private findCoastToCoastBridgePath(tiles: BoardTileNodeV7[]): readonly number[] | null {
    const owned = tiles.filter((t) => t.state === 'CLAIMED_PLAYER');
    if (owned.length < 3) return null;

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
    if (starts.length === 0 || goalSet.size === 0) return null;

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
    return null;
  }

  /**
   * Evaluates all 6 distinct 1960s Board Gameplay Modes immediately after a Player claim!
   */
  public evaluateBoardModePostClaim(
    claimedIdx: number,
    tiles: BoardTileNodeV7[],
    scored: boolean,
  ): BoardModePostClaimResultV7 {
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
          if (bridgePath) {
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
            bonusCash: scored ? -100 : -150,
            rivalStealCash: 0,
            multAdd: 0,
            bannerHeadline: '🎭 EYE GUESS TRAP! -$100 STUDIO ZONK!',
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
            bannerHeadline: '👁 EYE GUESS MEMORY HIT! ⭐ 2× DOUBLE BONUS!',
            highlightedTileIndices: [claimedIdx],
          };
        }
        if (badge === 'CASH_300') {
          return {
            mode,
            bonusCash: 300,
            rivalStealCash: 0,
            multAdd: 0,
            bannerHeadline: '👁 EYE GUESS MEMORY JACKPOT! 💰 +$300 BONUS!',
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
        this.revealedConcentrationTiles.add(claimedIdx);
        if (prize === 'TAKE_STEAL') {
          return {
            mode,
            bonusCash: 200,
            rivalStealCash: 200,
            multAdd: 0,
            bannerHeadline: '⚡ CONCENTRATION TAKE! Swiped $200 from Champion!',
            highlightedTileIndices: [claimedIdx],
          };
        }
        const prizeLabels: Record<Exclude<ConcentrationPrizeKindV7, 'NONE' | 'TAKE_STEAL'>, string> = {
          COLOR_TV: '📺 1966 COLOR TV',
          CONVERTIBLE: '🚗 CONVERTIBLE',
          HAWAII_TRIP: '🌴 HAWAII TRIP',
        };
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
            bannerHeadline: `🏆 PRIZE MATCH: ${prizeLabels[prize]} PACKAGE! +$500!`,
            highlightedTileIndices: matchingRevealed,
          };
        }
        return {
          mode,
          bonusCash: 75,
          rivalStealCash: 0,
          multAdd: 0,
          bannerHeadline: `🎁 PRIZE HALF FOUND: ${prizeLabels[prize]} (1/2) — Match twin for +$500!`,
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
          detail: 'Concentration TAKE! You swipe $150 right off the Champion’s scoreboard!',
          instantCashDelta: 150,
          rivalCashDelta: -150,
          chipsMultiplier: 1.0,
        };
      case 'DOUBLE_CHIPS': {
        const doubledStake = Math.min(800, (tile?.baseChips ?? 200) * 2);
        if (applyMutations && tile) {
          tile.baseChips = doubledStake;
        }
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
        const weakCats = this.getEffectiveWeakCategories();
        const fallbackPool = weakCats.length > 0 ? weakCats : ALL_CATEGORIES_V7;
        const candidateCat =
          fallbackPool.find((c) => c !== tile?.category) ??
          ALL_CATEGORIES_V7[(tileIndex + curtainNumber * 3 + 5) % ALL_CATEGORIES_V7.length];
        if (applyMutations && tile) {
          tile.category = candidateCat;
          tile.domain = CATEGORY_TO_DOMAIN_V7[candidateCat];
          tile.isWheelhouse = weakCats.includes(candidateCat);
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
   * for interactive *Let's Make a Deal* door selection (without mutating board state!).
   */
  public previewMysteryCurtainDoors(
    tileIndex: number,
    tiles: BoardTileNodeV7[],
  ): readonly [MysteryCurtainOutcomeV7, MysteryCurtainOutcomeV7, MysteryCurtainOutcomeV7] {
    const tile = tiles.find((t) => t.index === tileIndex);
    const kinds: readonly MysteryCurtainKindV7[] = [
      'BONUS_ENVELOPE',
      'STEAL_FROM_RIVAL',
      'DOUBLE_CHIPS',
      'WILD_CATEGORY_SWAP',
    ];
    const baseHash = this.computeDeterministicBoardHash(
      tileIndex * 73 + this.gimmick.turnCounter * 19,
    );
    const k1 = kinds[baseHash % kinds.length];
    const k2 = kinds[(baseHash + 1) % kinds.length];
    const k3 = kinds[(baseHash + 2) % kinds.length];
    return [
      this.buildMysteryOutcomeForKind(tileIndex, 1, k1, tile, false),
      this.buildMysteryOutcomeForKind(tileIndex, 2, k2, tile, false),
      this.buildMysteryOutcomeForKind(tileIndex, 3, k3, tile, false),
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
    const weakCats = this.getEffectiveWeakCategories();
    if (weakCats.length === 0) return null;
    const chosenWeak = weakCats[(tileIndex + this.gimmick.turnCounter) % weakCats.length];
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
        break;
      }

      case 'BOARD_03_VAUDEVILLE_GEAR_TRAIN': {
        this.gimmick.gearPhase = (this.gimmick.gearPhase + 1) % 3;
        break;
      }

      case 'BOARD_05_LARSON_SPIN_RING': {
        // Pass-Spin Brass Paddle advances hot-spot to next open tile and increments pass counter
        this.gimmick.spinPassesUsed += 1;
        this.advanceLarsonHotSpot(tiles, 3);
        break;
      }

      case 'BOARD_06_BOARDWALK_PINBALL': {
        this.gimmick.chargedBumperIndex = (this.gimmick.chargedBumperIndex + 1) % 3;
        break;
      }

      case 'BOARD_07_MONTE_CARLO_SHOE': {
        // Sabotage Shoe burns a low card (+3 pips, wrapping cleanly past 21 to 6)
        const nextSum = this.gimmick.baccaratShoeTotal + 3;
        this.gimmick.baccaratShoeTotal = nextSum > 21 ? 6 + (nextSum - 22) : nextSum;
        break;
      }

      case 'BOARD_08_GEODESIC_SUNDIAL': {
        this.gimmick.sundialAngleRad += Math.PI / 3;
        if (this.gimmick.sundialAngleRad > Math.PI) {
          this.gimmick.sundialAngleRad -= Math.PI * 2;
        }
        break;
      }

      case 'BOARD_09_PIRATE_UHF_DECK': {
        const idx = DOMAIN_CYCLE_V7.indexOf(this.gimmick.tunedUhfDomain);
        const nextDomain = DOMAIN_CYCLE_V7[(idx + 1) % DOMAIN_CYCLE_V7.length];
        this.gimmick.tunedUhfDomain = nextDomain;
        for (const t of tiles) {
          t.hasUhfHalo = t.domain === nextDomain && (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');
        }
        break;
      }

      default: {
        // Other boards pulse their kinetic mechanism and advance turn phase shift
        this.gimmick.gearPhase = (this.gimmick.gearPhase + 1) % 3;
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
    this.gimmick.pendulumTiltDeg = clamp(diff * 1.65, -4.5, 4.5);
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

    // 3. Rival Wheelhouse Weak-Spot Bounty (`+0.50x Mult` for attacking Rival's 3 weak categories!)
    const weakSet = new Set<CategoryIdV7>(this.getEffectiveWeakCategories());
    const strongSet = new Set<CategoryIdV7>(this.getEffectiveStrongCategories());
    const hitRivalWheelhouse = tile.isWheelhouse || weakSet.has(tile.category);
    if (hitRivalWheelhouse) {
      rawMultBonus += 0.5;
      bonusChips += twistId === 'TWIST_14_RIVAL_WHEELHOUSE_BOUNTY' ? 60 : 35;
      reasons.push('Rival Wheelhouse +0.50x');
    } else if (strongSet.has(tile.category)) {
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
      rawMultBonus += 0.5;
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
        // Secondary subtle board synergy when a cast-driven twist (13/14/15) runs on a kinetic board:
        if (boardId === 'BOARD_01_FUNK_CROSSFADER' && Math.sign(tile.x) === this.gimmick.crossfaderPosition) {
          bonusChips += 25;
        } else if (boardId === 'BOARD_12_PENDULUM_BALANCE') {
          const tilt = this.gimmick.pendulumTiltDeg;
          if ((tilt < -0.5 && tile.x > 0.12) || (tilt > 0.5 && tile.x < -0.12)) {
            bonusChips += 30;
          }
        }
        break;
      }
    }

    const cappedMultBonus = roundTo2(clamp(rawMultBonus, 0, maxBonus));
    const effectiveMult = roundTo2(1.0 + cappedMultBonus);
    // Authentic 1960s Network Tote-Board Dollar Stakes: strictly clean $50 increments ($150, $200, $250, ..., $500+)!
    const rawTotalChips = tile.baseChips + bonusChips;
    const effectiveChips = Math.max(150, Math.round(rawTotalChips / 50) * 50);
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

    this.advanceTurnState(tiles, target);
    return breakdown;
  }

  /**
   * Selects a smart target tile for the Rival's turn (avoiding Rival weak categories
   * when possible, preferring strong categories or strategic blockades) and commits it.
   */
  public chooseRivalTargetTile(tiles: BoardTileNodeV7[]): number | null {
    const openTiles = tiles.filter(
      (t) => (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') && !t.isVaultLocked,
    );
    if (openTiles.length === 0) return null;

    const strongSet = new Set<CategoryIdV7>(this.getEffectiveStrongCategories());
    const weakSet = new Set<CategoryIdV7>(this.getEffectiveWeakCategories());

    let bestTile = openTiles[0];
    let bestScore = -Infinity;

    const playMode = this.getActivePlayMode();
    for (const tile of openTiles) {
      let score = tile.baseChips * 0.4 + tile.boardMultBonus * 140;
      if (strongSet.has(tile.category)) score += 160;
      if (weakSet.has(tile.category)) score -= 140;
      if (tile.hasAmberTruce) score -= 220; // Sympathetic rivals honor their own chalk truce!
      if (tile.isRiggedSolenoid) score -= 90;
      if (tile.tvTwist === 'OPPONENT_CHOICE') score -= 45; // Risky for Rival—flips to their weak spot!
      // Hollywood Squares `TIC_TAC_LINE`: Rival actively prioritizes blocking Player 2-in-a-row threats!
      if (playMode === 'TIC_TAC_LINE') {
        const threatLines = this.findPlayerThreeInARowLines(tiles, tile.index);
        const newThreat = threatLines.some((ln) => !this.awardedTicTacLines.has(ln.join('-')));
        if (newThreat) {
          score += 380;
        }
      }
      if (this.context.boardId === 'BOARD_11_WHEW_GAUNTLET' && Math.abs(tile.z) < 0.35) {
        score += 85; // Blockade center row on Whew! Gauntlet
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

  public commitRivalTileClaim(tileIndex: number, tiles: BoardTileNodeV7[]): void {
    const target = tiles.find((t) => t.index === tileIndex);
    if (!target) return;
    target.state = 'CLAIMED_RIVAL';
    target.isRivalTarget = false;
    target.isRiggedSolenoid = false;
    this.advanceTurnState(tiles, target);
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
      if (survivorSet.has(tile.index)) {
        tile.state = 'BLITZ_SURVIVOR';
        tile.baseChips = Math.max(tile.baseChips, 300);
        survivorIndices.push(tile.index);
      } else {
        tile.state = 'RETRACTED';
        tile.isRiggedSolenoid = false;
        tile.tvTwist = 'NONE';
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
