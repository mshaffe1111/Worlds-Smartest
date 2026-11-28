// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "Sweeps Week Deluxe")
// `src/v7/campaign/CareerStatsLedgerV8.ts`
// 1966 IBC Research Dept. Historical Ratings & Career Analytics Ledger:
//   - Defensive `localStorage` persistence under `'ws8_career_stats_ledger_v1'`
//   - Seamless 1-time legacy Campaign & Daily Broadcast save seeding
//   - Per-clue, per-twist, per-lifeline & rolling 40-match telemetry mutations
//   - 5-Domain Broadcast Analytics (`SCI_TECH`, `POP_LIT`, `MONEY_ODDS`,
//     `WORLD_SPORT`, `HIST_MYTH` x 4 categories = 20 canonical categories),
//     Category Wheelhouse/Practice sorting, Format comparison & Lifeline ROI.
// ============================================================================

import {
  ALL_BOARD_PLAY_MODES_V9,
  ALL_CATEGORIES_V7,
  BOARD_PLAY_MODE_TITLES_V9,
  CATEGORY_TO_DOMAIN_V7,
  type BoardModeStatCounterV8,
  type BoardPlayModeV9,
  type CampaignSaveStateV7,
  type CareerStatsLedgerV8,
  type CategoryIdV7,
  type CategoryStatCounterV8,
  type DomainIdV7,
  type LifelineStatCounterV8,
  type MatchHistoryPointV8,
  type QuestionCardStyleV7,
  type ToyFormatStatCounterV8,
  type ToyIdV7,
} from '../contracts_v7';
import {
  CLASSIC_CARD_STYLES_V7,
  CURATED_SHOWCASE_TOYS_V7,
  FRIENDLY_TV_CATEGORY_LABELS_V7,
} from '../corpus/CorpusManagerV7';

export const CAREER_STATS_STORAGE_KEY_V8 = 'ws8_career_stats_ledger_v1';
export const MAX_RECENT_MATCH_HISTORY_V8 = 40;

// ----------------------------------------------------------------------------
// 1. Broadcast Analytics Domain & Category Taxonomy (5 Domains x 4 = 20)
// ----------------------------------------------------------------------------

export type BroadcastAnalyticsDomainIdV8 =
  | 'SCI_TECH'
  | 'POP_LIT'
  | 'MONEY_ODDS'
  | 'WORLD_SPORT'
  | 'HIST_MYTH';

export type CategoryDomainFilterV8 =
  | BroadcastAnalyticsDomainIdV8
  | DomainIdV7
  | 'ALL';

export type CategorySortModeV8 =
  | 'ACCURACY_DESC'
  | 'WEAKEST_FIRST'
  | 'MOST_PLAYED'
  | 'BEST_STREAK';

export type CategoryStatusBadgeV8 =
  | '★ WHEELHOUSE'
  | 'SOLID'
  | 'NEEDS PRACTICE'
  | 'UNEXPLORED';

export interface BroadcastDomainSpecV8 {
  readonly domainId: BroadcastAnalyticsDomainIdV8;
  readonly title: string;
  readonly subtitle: string;
  readonly hexColor: string;
  readonly categories: readonly [
    CategoryIdV7,
    CategoryIdV7,
    CategoryIdV7,
    CategoryIdV7,
  ];
}

export const BROADCAST_ANALYTICS_DOMAINS_V8: readonly BroadcastDomainSpecV8[] = [
  {
    domainId: 'SCI_TECH',
    title: 'SCIENCE & TECH',
    subtitle: 'Labs, Medicine, Space & Gadgets',
    hexColor: '#008B94',
    categories: ['MEDICINE', 'CHEMISTRY', 'PHYSICS', 'GADGETS'],
  },
  {
    domainId: 'POP_LIT',
    title: 'ARTS & POP',
    subtitle: 'Books, Fine Arts, Screen & Jukebox',
    hexColor: '#F2A922',
    categories: ['LITERATURE', 'FINE ARTS', 'SCREEN', 'JUKEBOX'],
  },
  {
    domainId: 'MONEY_ODDS',
    title: 'MONEY & ODDS',
    subtitle: 'Finance, Pricing, Wagers & Logic',
    hexColor: '#009E73',
    categories: ['FINANCE', 'PRICING', 'ODDS', 'FALLACIES'],
  },
  {
    domainId: 'WORLD_SPORT',
    title: 'WORLD & SPORT',
    subtitle: 'World Atlas, Sports, Machines & Fare',
    hexColor: '#1746A2',
    categories: ['ATLAS', 'SPORTS', 'ENGINES', 'CUISINE'],
  },
  {
    domainId: 'HIST_MYTH',
    title: 'HISTORY & WIT',
    subtitle: 'Empires, Headlines, Myths & Lexicon',
    hexColor: '#FF6B35',
    categories: ['DYNASTIES', 'HEADLINES', 'FOLKLORE', 'LEXICON'],
  },
] as const;

const CATEGORY_TO_BROADCAST_DOMAIN_V8: Record<
  CategoryIdV7,
  BroadcastAnalyticsDomainIdV8
> = {
  MEDICINE: 'SCI_TECH',
  CHEMISTRY: 'SCI_TECH',
  PHYSICS: 'SCI_TECH',
  GADGETS: 'SCI_TECH',
  LITERATURE: 'POP_LIT',
  'FINE ARTS': 'POP_LIT',
  SCREEN: 'POP_LIT',
  JUKEBOX: 'POP_LIT',
  FINANCE: 'MONEY_ODDS',
  PRICING: 'MONEY_ODDS',
  ODDS: 'MONEY_ODDS',
  FALLACIES: 'MONEY_ODDS',
  ATLAS: 'WORLD_SPORT',
  SPORTS: 'WORLD_SPORT',
  ENGINES: 'WORLD_SPORT',
  CUISINE: 'WORLD_SPORT',
  DYNASTIES: 'HIST_MYTH',
  HEADLINES: 'HIST_MYTH',
  FOLKLORE: 'HIST_MYTH',
  LEXICON: 'HIST_MYTH',
};

const BROADCAST_DOMAIN_HEX_MAP_V8: Record<BroadcastAnalyticsDomainIdV8, string> = {
  SCI_TECH: '#008B94',
  POP_LIT: '#F2A922',
  MONEY_ODDS: '#009E73',
  WORLD_SPORT: '#1746A2',
  HIST_MYTH: '#FF6B35',
};

const BROADCAST_DOMAIN_TITLE_MAP_V8: Record<BroadcastAnalyticsDomainIdV8, string> = {
  SCI_TECH: 'SCIENCE & TECH',
  POP_LIT: 'ARTS & POP',
  MONEY_ODDS: 'MONEY & ODDS',
  WORLD_SPORT: 'WORLD & SPORT',
  HIST_MYTH: 'HISTORY & WIT',
};

export interface CategoryBreakdownItemV8 {
  readonly category: CategoryIdV7;
  readonly friendlyName: string;
  readonly broadcastDomain: BroadcastAnalyticsDomainIdV8;
  readonly broadcastDomainTitle: string;
  readonly domainHex: string;
  readonly attempts: number;
  readonly correct: number;
  readonly accuracyPct: number;
  readonly avgSec: number;
  readonly bestStreak: number;
  readonly currentStreak: number;
  readonly cashEarned: number;
  readonly statusBadge: CategoryStatusBadgeV8;
}

export interface DomainBreakdownItemV8 {
  readonly domainId: BroadcastAnalyticsDomainIdV8;
  readonly title: string;
  readonly subtitle: string;
  readonly hexColor: string;
  readonly attempts: number;
  readonly correct: number;
  readonly accuracyPct: number;
  readonly avgSec: number;
  readonly cashEarned: number;
  readonly categories: readonly CategoryBreakdownItemV8[];
}

export interface FormatStatRowV8 {
  readonly id: string;
  readonly kind: 'CLASSIC_CARD' | 'SHOWCASE_TOY';
  readonly title: string;
  readonly subtitle: string;
  readonly hexColor: string;
  readonly attempts: number;
  readonly correct: number;
  readonly accuracyPct: number;
  readonly avgSec: number;
  readonly cashEarned: number;
}

export interface LifelineRoiItemV8 {
  readonly id: 'FIFTY_FIFTY' | 'AUDIENCE_POLL' | 'FREE_SWAP';
  readonly title: string;
  readonly subtitle: string;
  readonly hexColor: string;
  readonly used: number;
  readonly wins: number;
  readonly winConversionPct: number;
}

export interface FormatAndLifelineBreakdownV8 {
  readonly classicSummary: {
    readonly attempts: number;
    readonly correct: number;
    readonly accuracyPct: number;
    readonly avgSec: number;
    readonly cashEarned: number;
  };
  readonly showcaseSummary: {
    readonly attempts: number;
    readonly correct: number;
    readonly accuracyPct: number;
    readonly avgSec: number;
    readonly cashEarned: number;
  };
  readonly classicCardStyles: readonly FormatStatRowV8[];
  readonly showcaseContraptions: readonly FormatStatRowV8[];
  readonly lifelines: readonly LifelineRoiItemV8[];
}

export interface BoardModeBreakdownItemV8 {
  readonly mode: BoardPlayModeV9;
  readonly shortTitle: string;
  readonly fullTitle: string;
  readonly hexColor: string;
  readonly played: number;
  readonly won: number;
  readonly winPct: number;
  readonly bestCash: number;
  readonly totalCash: number;
}

export interface WheelhouseAndPracticeCalloutsV8 {
  readonly wheelhouse: CategoryBreakdownItemV8 | null;
  readonly practiceTarget: CategoryBreakdownItemV8 | null;
}

export interface DailySeedSummaryInputV8 {
  readonly currentStreak?: number;
  readonly bestStreak?: number;
  readonly totalPlayed?: number;
  readonly totalWon?: number;
  readonly gamesPlayed?: number;
  readonly gamesWon?: number;
}

export interface RecordClueAttemptInputV8 {
  readonly category: CategoryIdV7;
  readonly toyId: ToyIdV7;
  readonly cardStyle?: QuestionCardStyleV7;
  readonly isCorrect: boolean;
  readonly responseMs: number;
  readonly cashEarned: number;
  readonly usedFiftyFifty?: boolean;
  readonly usedAudiencePoll?: boolean;
  readonly usedFreeSwap?: boolean;
}

// ----------------------------------------------------------------------------
// 2. Friendly Metadata Tables for Card Styles, Showcase Toys & Board Formats
// ----------------------------------------------------------------------------

const CLASSIC_CARD_STYLE_META_V8: Record<
  QuestionCardStyleV7,
  { readonly title: string; readonly subtitle: string; readonly hexColor: string }
> = {
  CLASSIC_CUE: {
    title: 'Classic Cue Monitor',
    subtitle: '4-Option Backlit Acrylite Pads',
    hexColor: '#008B94',
  },
  HEADLINE_BLANK: {
    title: 'Press Teletype Blank',
    subtitle: '1966 AP Wire Front-Page Slug',
    hexColor: '#1746A2',
  },
  PICTURE_MONITOR: {
    title: 'Picture Monitor Card',
    subtitle: 'Illustrated Studio Desk Frame',
    hexColor: '#F2A922',
  },
  SPOT_THE_MYTH: {
    title: 'Spot-the-Myth Alert',
    subtitle: 'Standards & Practices Trap Check',
    hexColor: '#E6397A',
  },
  BINARY_SPLIT: {
    title: '50/50 Dual Paddle',
    subtitle: 'Head-to-Head Showdown Split',
    hexColor: '#009E73',
  },
  HIGHER_OR_LOWER: {
    title: 'Higher or Lower Duel',
    subtitle: 'Two-Contender Comparison Split',
    hexColor: '#D97706',
  },
  ODD_ONE_OUT: {
    title: 'Odd One Out Grid',
    subtitle: '3 Belong · 1 Crasher Spotlight',
    hexColor: '#008B94',
  },
  FINISH_THE_LINE: {
    title: 'Finish the Line',
    subtitle: 'Famous Lyric, Quote & Slogan Cue',
    hexColor: '#6E3B23',
  },
  WHO_WHAT_AM_I: {
    title: 'Who / What Am I?',
    subtitle: '1966 Mystery Silhouette Riddle',
    hexColor: '#E6397A',
  },
  BEFORE_OR_AFTER: {
    title: 'Before or After Duel',
    subtitle: 'Chronological Time-Machine Split',
    hexColor: '#1746A2',
  },
};

const SHOWCASE_TOY_META_V8: Record<
  ToyIdV7,
  { readonly title: string; readonly subtitle: string; readonly hexColor: string }
> = {
  TOY_01_KNIFE_SWITCH: {
    title: 'Classic 4-Option Switch',
    subtitle: 'Standard Broadcast Monitor',
    hexColor: '#008B94',
  },
  TOY_03_VERNIER_DIAL: {
    title: 'Vernier Range Dial',
    subtitle: 'Precision Numeric Estimation',
    hexColor: '#FF6B35',
  },
  TOY_05_RELIEF_GLOBE_3D: {
    title: '3D Relief Globe',
    subtitle: 'Pin-Plant World Geography',
    hexColor: '#008B94',
  },
  TOY_11_MISSING_VOWELS_WHEEL: {
    title: 'Missing Vowels Wheel',
    subtitle: 'Solari Consonant Word Puzzle',
    hexColor: '#F2A922',
  },
  TOY_10_CLIFFHANGERS_THROTTLE: {
    title: 'Cliffhangers Throttle',
    subtitle: 'Alpine Range Climb Gauge',
    hexColor: '#E6397A',
  },
  TOY_14_FOUR_SHUTTER_REEL: {
    title: '4-Shutter Clue Wall',
    subtitle: '2.0x-to-1.0x Progressive Reveal',
    hexColor: '#1746A2',
  },
  TOY_08_CHRONOLOGY_RAIL: {
    title: 'Chronology Timeline',
    subtitle: 'Historical Era Sequence Rail',
    hexColor: '#D9A441',
  },
  TOY_04_BALANCE_SCALE: {
    title: 'Brass Balance Scale',
    subtitle: 'Two-Weight Target Equilibrium',
    hexColor: '#009E73',
  },
  TOY_07_MAIL_SORTER: {
    title: 'Pneumatic Mail Sorter',
    subtitle: 'Two-Chute Rapid Classification',
    hexColor: '#008B94',
  },
  TOY_09_SWITCHBOARD_PATCHBAY: {
    title: 'Switchboard Patchbay',
    subtitle: '3-Cord Operator Jack Match',
    hexColor: '#FF6B35',
  },
  TOY_12_CONSPIRACY_LASSO: {
    title: '3-Clue Connection Wall',
    subtitle: '3x3 Common-Thread Triad',
    hexColor: '#E6397A',
  },
  TOY_13_CYANOTYPE_LOUPE: {
    title: 'Picture Blueprint Loupe',
    subtitle: 'Cutaway Diagram Target Zone',
    hexColor: '#1746A2',
  },
  TOY_02_CONFIDENCE_PNEUMATIC: {
    title: 'Confidence Tube',
    subtitle: 'Insured vs High-Stakes Wager',
    hexColor: '#F2A922',
  },
  TOY_06_FUSE_WIRE_SNIPPER: {
    title: 'Elimination Wire Cut',
    subtitle: 'Snip False Leads Safely',
    hexColor: '#009E73',
  },
};

const BOARD_MODE_SHORT_LABELS_V8: Record<
  BoardPlayModeV9,
  { readonly shortTitle: string; readonly hexColor: string }
> = {
  CLASSIC_TOTE: { shortTitle: 'Classic Tote', hexColor: '#008B94' },
  TIC_TAC_LINE: { shortTitle: '3-in-a-Row', hexColor: '#F2A922' },
  COAST_HEX_BRIDGE: { shortTitle: 'Coast Bridge', hexColor: '#1746A2' },
  CONCENTRATION_PRIZE_MATCH: { shortTitle: 'Prize Match', hexColor: '#009E73' },
  EYE_GUESS_MEMORY: { shortTitle: 'Eye Guess', hexColor: '#D9A441' },
  PRESS_YOUR_LUCK_GREMLIN: { shortTitle: 'Gremlin Board', hexColor: '#E6397A' },
  BIG_WHEEL_SHOWCASE: { shortTitle: 'Big Wheel', hexColor: '#FF6B35' },
  MONTY_CURTAIN_DEAL: { shortTitle: 'Curtain Deal', hexColor: '#008B94' },
  LOUVER_SHUTTER: { shortTitle: 'Louver Shutter', hexColor: '#008B94' },
  BLIND_PURSE: { shortTitle: 'Blind Purse', hexColor: '#E6397A' },
  BLACKOUT_VAULT: { shortTitle: 'Blackout Vault', hexColor: '#6E3B23' },
  LIVE_WIRE_FUSE: { shortTitle: 'Live-Wire Fuse', hexColor: '#FF6B35' },
  SHIFTING_SPOTLIGHT: { shortTitle: 'Spotlight Rail', hexColor: '#F2A922' },
  GOLDEN_DOMINO_CASCADE: { shortTitle: 'Golden Domino', hexColor: '#15803D' },
  PRESSURE_COOKER: { shortTitle: 'Pressure Cooker', hexColor: '#E6397A' },
  HOLLYWOOD_MARQUEE_LINE: { shortTitle: 'Marquee Line', hexColor: '#D9A441' },
};

const CANONICAL_BOARD_MODES_ORDER_V8: readonly BoardPlayModeV9[] = [
  'CLASSIC_TOTE',
  'TIC_TAC_LINE',
  'COAST_HEX_BRIDGE',
  'CONCENTRATION_PRIZE_MATCH',
  'EYE_GUESS_MEMORY',
  'PRESS_YOUR_LUCK_GREMLIN',
  'BIG_WHEEL_SHOWCASE',
  'MONTY_CURTAIN_DEAL',
  'LOUVER_SHUTTER',
  'BLIND_PURSE',
  'BLACKOUT_VAULT',
  'LIVE_WIRE_FUSE',
  'SHIFTING_SPOTLIGHT',
  'GOLDEN_DOMINO_CASCADE',
  'PRESSURE_COOKER',
  'HOLLYWOOD_MARQUEE_LINE',
];

// ----------------------------------------------------------------------------
// 3. Defensive Sanitization & Storage Engine (Browser + Headless Node Safe)
// ----------------------------------------------------------------------------

const VALID_CATEGORIES_SET_V8 = new Set<string>(ALL_CATEGORIES_V7);
const VALID_BOARD_MODES_SET_V8 = new Set<string>(ALL_BOARD_PLAY_MODES_V9);
const VALID_CARD_STYLES_SET_V8 = new Set<string>(CLASSIC_CARD_STYLES_V7);
const VALID_TOYS_SET_V8 = new Set<string>(Object.keys(SHOWCASE_TOY_META_V8));
const VALID_MATCH_TYPES_SET_V8 = new Set<string>([
  'CAMPAIGN',
  'DAILY',
  'QUICK_PLAY',
  'COUCH_2P',
  'BLITZ_60',
  'SWEEPS_WEEK',
]);

let memoryStorageFallbackRawV8: string | null = null;
let liveMatchCluesBufferedV8 = 0;
let liveMatchClueCashBufferedV8 = 0;

function readRawLedgerStorageV8(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(CAREER_STATS_STORAGE_KEY_V8);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(CAREER_STATS_STORAGE_KEY_V8);
    }
  } catch {
    // Fall back to in-memory store when storage is sandboxed/unavailable
  }
  return memoryStorageFallbackRawV8;
}

function writeRawLedgerStorageV8(serialized: string): void {
  memoryStorageFallbackRawV8 = serialized;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CAREER_STATS_STORAGE_KEY_V8, serialized);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CAREER_STATS_STORAGE_KEY_V8, serialized);
    }
  } catch {
    // Ignore quota/sandbox exceptions; memory fallback retains state
  }
}

function sanitizeNonNegIntV8(
  value: unknown,
  fallback = 0,
  max = 1_000_000_000,
): number {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    value === ''
  ) {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(0, Math.floor(n)));
}

function sanitizeStringV8(
  value: unknown,
  fallback: string,
  maxLen = 80,
): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

function sanitizeCategoryCounterV8(raw: unknown): CategoryStatCounterV8 {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const attempts = sanitizeNonNegIntV8(rec.attempts, 0, 1_000_000);
  const correct = Math.min(
    attempts,
    sanitizeNonNegIntV8(rec.correct, 0, 1_000_000),
  );
  const currentStreak = sanitizeNonNegIntV8(rec.currentStreak, 0, 1_000_000);
  const bestStreak = Math.max(
    currentStreak,
    sanitizeNonNegIntV8(rec.bestStreak, 0, 1_000_000),
  );
  return {
    attempts,
    correct,
    totalResponseMs: sanitizeNonNegIntV8(
      rec.totalResponseMs,
      0,
      2_000_000_000,
    ),
    cashEarned: sanitizeNonNegIntV8(rec.cashEarned, 0, 1_000_000_000),
    currentStreak,
    bestStreak,
  };
}

function sanitizeToyFormatCounterV8(raw: unknown): ToyFormatStatCounterV8 {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const attempts = sanitizeNonNegIntV8(rec.attempts, 0, 1_000_000);
  const correct = Math.min(
    attempts,
    sanitizeNonNegIntV8(rec.correct, 0, 1_000_000),
  );
  return {
    attempts,
    correct,
    totalResponseMs: sanitizeNonNegIntV8(
      rec.totalResponseMs,
      0,
      2_000_000_000,
    ),
    cashEarned: sanitizeNonNegIntV8(rec.cashEarned, 0, 1_000_000_000),
  };
}

function sanitizeBoardModeCounterV8(raw: unknown): BoardModeStatCounterV8 {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const played = sanitizeNonNegIntV8(rec.played, 0, 1_000_000);
  const won = Math.min(played, sanitizeNonNegIntV8(rec.won, 0, 1_000_000));
  const bestCash = sanitizeNonNegIntV8(rec.bestCash, 0, 1_000_000_000);
  const totalCash = Math.max(
    bestCash,
    sanitizeNonNegIntV8(rec.totalCash, 0, 1_000_000_000),
  );
  return {
    played,
    won,
    bestCash,
    totalCash,
  };
}

function sanitizeLifelinesV8(raw: unknown): LifelineStatCounterV8 {
  const rec =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const fiftyFiftyUsed = sanitizeNonNegIntV8(rec.fiftyFiftyUsed, 0, 1_000_000);
  const audiencePollUsed = sanitizeNonNegIntV8(
    rec.audiencePollUsed,
    0,
    1_000_000,
  );
  const freeSwapUsed = sanitizeNonNegIntV8(rec.freeSwapUsed, 0, 1_000_000);
  return {
    fiftyFiftyUsed,
    fiftyFiftyWins: Math.min(
      fiftyFiftyUsed,
      sanitizeNonNegIntV8(rec.fiftyFiftyWins, 0, 1_000_000),
    ),
    audiencePollUsed,
    audiencePollWins: Math.min(
      audiencePollUsed,
      sanitizeNonNegIntV8(rec.audiencePollWins, 0, 1_000_000),
    ),
    freeSwapUsed,
    freeSwapWins: Math.min(
      freeSwapUsed,
      sanitizeNonNegIntV8(rec.freeSwapWins, 0, 1_000_000),
    ),
  };
}

function sanitizeMatchHistoryPointV8(raw: unknown): MatchHistoryPointV8 | null {
  if (!raw || typeof raw !== 'object') return null;
  const rec = raw as Record<string, unknown>;
  const matchTypeRaw =
    typeof rec.matchType === 'string' && VALID_MATCH_TYPES_SET_V8.has(rec.matchType)
      ? (rec.matchType as MatchHistoryPointV8['matchType'])
      : 'QUICK_PLAY';
  const boardPlayModeRaw =
    typeof rec.boardPlayMode === 'string' &&
    VALID_BOARD_MODES_SET_V8.has(rec.boardPlayMode)
      ? (rec.boardPlayMode as BoardPlayModeV9)
      : 'CLASSIC_TOTE';
  const cluesAnswered = sanitizeNonNegIntV8(rec.cluesAnswered, 0, 200);
  const cluesCorrect = Math.min(
    cluesAnswered,
    sanitizeNonNegIntV8(rec.cluesCorrect, 0, 200),
  );
  return {
    tsIso: sanitizeStringV8(rec.tsIso, new Date().toISOString(), 40),
    matchType: matchTypeRaw,
    label: sanitizeStringV8(rec.label, matchTypeRaw, 32),
    boardPlayMode: boardPlayModeRaw,
    rivalName: sanitizeStringV8(rec.rivalName, 'Studio Champion', 48),
    playerCash: sanitizeNonNegIntV8(rec.playerCash, 0, 100_000_000),
    rivalCash: sanitizeNonNegIntV8(rec.rivalCash, 0, 100_000_000),
    won: Boolean(rec.won),
    cluesAnswered,
    cluesCorrect,
    bestMatchStreak: sanitizeNonNegIntV8(rec.bestMatchStreak, 0, 200),
  };
}

export function createEmptyCareerStatsLedgerV8(): CareerStatsLedgerV8 {
  return {
    version: 'WS_CAREER_STATS_V8_1',
    seededFromLegacySave: false,
    totalMatchesPlayed: 0,
    totalMatchesWon: 0,
    totalCluesAnswered: 0,
    totalCluesCorrect: 0,
    totalResponseMs: 0,
    lifetimeCashEarned: 0,
    highestSingleMatchCash: 0,
    currentAnswerStreak: 0,
    bestAnswerStreakEver: 0,
    currentMatchWinStreak: 0,
    bestMatchWinStreakEver: 0,
    finalWagersAttempted: 0,
    finalWagersWon: 0,
    vaultsCracked: 0,
    bargainsBought: 0,
    gremlinsSurvived: 0,
    byCategory: {},
    byToy: {},
    byCardStyle: {},
    byBoardMode: {},
    lifelines: {
      fiftyFiftyUsed: 0,
      fiftyFiftyWins: 0,
      audiencePollUsed: 0,
      audiencePollWins: 0,
      freeSwapUsed: 0,
      freeSwapWins: 0,
    },
    recentMatches: [],
  };
}

export function sanitizeCareerStatsLedgerV8(raw: unknown): CareerStatsLedgerV8 {
  if (!raw || typeof raw !== 'object') {
    return createEmptyCareerStatsLedgerV8();
  }
  const rec = raw as Record<string, unknown>;

  const totalMatchesPlayed = sanitizeNonNegIntV8(rec.totalMatchesPlayed, 0);
  const totalMatchesWon = Math.min(
    totalMatchesPlayed,
    sanitizeNonNegIntV8(rec.totalMatchesWon, 0),
  );
  const totalCluesAnswered = sanitizeNonNegIntV8(rec.totalCluesAnswered, 0);
  const totalCluesCorrect = Math.min(
    totalCluesAnswered,
    sanitizeNonNegIntV8(rec.totalCluesCorrect, 0),
  );
  const currentAnswerStreak = sanitizeNonNegIntV8(rec.currentAnswerStreak, 0);
  const bestAnswerStreakEver = Math.max(
    currentAnswerStreak,
    sanitizeNonNegIntV8(rec.bestAnswerStreakEver, 0),
  );
  const currentMatchWinStreak = sanitizeNonNegIntV8(
    rec.currentMatchWinStreak,
    0,
  );
  const bestMatchWinStreakEver = Math.max(
    currentMatchWinStreak,
    sanitizeNonNegIntV8(rec.bestMatchWinStreakEver, 0),
  );
  const finalWagersAttempted = sanitizeNonNegIntV8(rec.finalWagersAttempted, 0);
  const finalWagersWon = Math.min(
    finalWagersAttempted,
    sanitizeNonNegIntV8(rec.finalWagersWon, 0),
  );

  const byCategory: Partial<Record<CategoryIdV7, CategoryStatCounterV8>> = {};
  if (rec.byCategory && typeof rec.byCategory === 'object') {
    for (const [key, val] of Object.entries(
      rec.byCategory as Record<string, unknown>,
    )) {
      if (VALID_CATEGORIES_SET_V8.has(key)) {
        const sanitized = sanitizeCategoryCounterV8(val);
        if (
          sanitized.attempts > 0 ||
          sanitized.bestStreak > 0 ||
          sanitized.cashEarned > 0
        ) {
          byCategory[key as CategoryIdV7] = sanitized;
        }
      }
    }
  }

  const byToy: Partial<Record<ToyIdV7, ToyFormatStatCounterV8>> = {};
  if (rec.byToy && typeof rec.byToy === 'object') {
    for (const [key, val] of Object.entries(
      rec.byToy as Record<string, unknown>,
    )) {
      if (VALID_TOYS_SET_V8.has(key)) {
        const sanitized = sanitizeToyFormatCounterV8(val);
        if (sanitized.attempts > 0 || sanitized.cashEarned > 0) {
          byToy[key as ToyIdV7] = sanitized;
        }
      }
    }
  }

  const byCardStyle: Partial<
    Record<QuestionCardStyleV7, ToyFormatStatCounterV8>
  > = {};
  if (rec.byCardStyle && typeof rec.byCardStyle === 'object') {
    for (const [key, val] of Object.entries(
      rec.byCardStyle as Record<string, unknown>,
    )) {
      if (VALID_CARD_STYLES_SET_V8.has(key)) {
        const sanitized = sanitizeToyFormatCounterV8(val);
        if (sanitized.attempts > 0 || sanitized.cashEarned > 0) {
          byCardStyle[key as QuestionCardStyleV7] = sanitized;
        }
      }
    }
  }

  const byBoardMode: Partial<Record<BoardPlayModeV9, BoardModeStatCounterV8>> =
    {};
  if (rec.byBoardMode && typeof rec.byBoardMode === 'object') {
    for (const [key, val] of Object.entries(
      rec.byBoardMode as Record<string, unknown>,
    )) {
      if (VALID_BOARD_MODES_SET_V8.has(key)) {
        const sanitized = sanitizeBoardModeCounterV8(val);
        if (sanitized.played > 0 || sanitized.bestCash > 0) {
          byBoardMode[key as BoardPlayModeV9] = sanitized;
        }
      }
    }
  }

  const recentMatches: MatchHistoryPointV8[] = [];
  if (Array.isArray(rec.recentMatches)) {
    for (const item of rec.recentMatches) {
      const point = sanitizeMatchHistoryPointV8(item);
      if (point) recentMatches.push(point);
    }
  }
  const trimmedMatches =
    recentMatches.length > MAX_RECENT_MATCH_HISTORY_V8
      ? recentMatches.slice(recentMatches.length - MAX_RECENT_MATCH_HISTORY_V8)
      : recentMatches;

  const highestSingleMatchCash = sanitizeNonNegIntV8(
    rec.highestSingleMatchCash,
    0,
  );
  const lifetimeCashEarned = Math.max(
    highestSingleMatchCash,
    sanitizeNonNegIntV8(rec.lifetimeCashEarned, 0),
  );

  return {
    version: 'WS_CAREER_STATS_V8_1',
    seededFromLegacySave: Boolean(rec.seededFromLegacySave),
    totalMatchesPlayed,
    totalMatchesWon,
    totalCluesAnswered,
    totalCluesCorrect,
    totalResponseMs: sanitizeNonNegIntV8(
      rec.totalResponseMs,
      0,
      2_000_000_000,
    ),
    lifetimeCashEarned,
    highestSingleMatchCash,
    currentAnswerStreak,
    bestAnswerStreakEver,
    currentMatchWinStreak,
    bestMatchWinStreakEver,
    finalWagersAttempted,
    finalWagersWon,
    vaultsCracked: sanitizeNonNegIntV8(rec.vaultsCracked, 0),
    bargainsBought: sanitizeNonNegIntV8(rec.bargainsBought, 0),
    gremlinsSurvived: sanitizeNonNegIntV8(rec.gremlinsSurvived, 0),
    byCategory,
    byToy,
    byCardStyle,
    byBoardMode,
    lifelines: sanitizeLifelinesV8(rec.lifelines),
    recentMatches: trimmedMatches,
  };
}

export function saveCareerStatsLedgerV8(
  ledger: CareerStatsLedgerV8,
): CareerStatsLedgerV8 {
  const sanitized = sanitizeCareerStatsLedgerV8(ledger);
  writeRawLedgerStorageV8(JSON.stringify(sanitized));
  return sanitized;
}

export function resetCareerStatsLedgerV8(): CareerStatsLedgerV8 {
  liveMatchCluesBufferedV8 = 0;
  liveMatchClueCashBufferedV8 = 0;
  const fresh = createEmptyCareerStatsLedgerV8();
  return saveCareerStatsLedgerV8(fresh);
}

// ----------------------------------------------------------------------------
// 4. Loader with Automatic 1-Time Legacy Campaign & Daily Broadcast Seeding
// ----------------------------------------------------------------------------

export function loadCareerStatsLedgerV8(
  legacyCampaign?: Partial<CampaignSaveStateV7>,
  dailyState?: DailySeedSummaryInputV8,
): CareerStatsLedgerV8 {
  let ledger = createEmptyCareerStatsLedgerV8();
  const raw = readRawLedgerStorageV8();
  if (raw) {
    try {
      ledger = sanitizeCareerStatsLedgerV8(JSON.parse(raw));
    } catch {
      ledger = createEmptyCareerStatsLedgerV8();
    }
  }

  if (!ledger.seededFromLegacySave) {
    const campPlayed = sanitizeNonNegIntV8(legacyCampaign?.episodesPlayed, 0);
    const campWon = Math.min(
      campPlayed,
      sanitizeNonNegIntV8(legacyCampaign?.episodesWon, 0),
    );
    const campPurseCash =
      sanitizeNonNegIntV8(legacyCampaign?.cleanPurseCash, 0) +
      sanitizeNonNegIntV8(legacyCampaign?.contrabandTrunkCash, 0);
    const campWinStreak = sanitizeNonNegIntV8(
      legacyCampaign?.returningChampStreak,
      0,
    );

    const dailyPlayed = sanitizeNonNegIntV8(
      dailyState?.totalPlayed ?? dailyState?.gamesPlayed,
      0,
    );
    const dailyWon = Math.min(
      dailyPlayed,
      sanitizeNonNegIntV8(dailyState?.totalWon ?? dailyState?.gamesWon, 0),
    );
    const dailyCurStreak = sanitizeNonNegIntV8(dailyState?.currentStreak, 0);
    const dailyBestStreak = Math.max(
      dailyCurStreak,
      sanitizeNonNegIntV8(dailyState?.bestStreak, 0),
    );

    const hasLegacyProgress =
      campPlayed > 0 || campPurseCash > 0 || dailyPlayed > 0;

    if (hasLegacyProgress) {
      const seededPlayed = Math.max(
        ledger.totalMatchesPlayed,
        campPlayed + dailyPlayed,
      );
      const seededWon = Math.min(
        seededPlayed,
        Math.max(ledger.totalMatchesWon, campWon + dailyWon),
      );
      const seededCash = Math.max(ledger.lifetimeCashEarned, campPurseCash);
      const estimatedBestSingle =
        seededCash > 0 && seededPlayed > 0
          ? Math.round(seededCash / seededPlayed)
          : seededCash;

      ledger.totalMatchesPlayed = seededPlayed;
      ledger.totalMatchesWon = seededWon;
      ledger.lifetimeCashEarned = seededCash;
      ledger.highestSingleMatchCash = Math.max(
        ledger.highestSingleMatchCash,
        estimatedBestSingle,
      );
      ledger.currentMatchWinStreak = Math.max(
        ledger.currentMatchWinStreak,
        campWinStreak,
        dailyCurStreak,
      );
      ledger.bestMatchWinStreakEver = Math.max(
        ledger.bestMatchWinStreakEver,
        ledger.currentMatchWinStreak,
        dailyBestStreak,
      );

      // Seed medal-backed twist & board mode counts if present in legacy save
      const safeCrackerMedals = sanitizeNonNegIntV8(
        legacyCampaign?.careerMedalCounts?.SAFE_CRACKER,
        0,
      );
      const gremlinDodgerMedals = sanitizeNonNegIntV8(
        legacyCampaign?.careerMedalCounts?.GREMLIN_DODGER,
        0,
      );
      const hotStreakMedals = sanitizeNonNegIntV8(
        legacyCampaign?.careerMedalCounts?.SHUTOUT_STREAK,
        0,
      );
      if (safeCrackerMedals > 0) {
        ledger.vaultsCracked = Math.max(ledger.vaultsCracked, safeCrackerMedals);
      }
      if (gremlinDodgerMedals > 0) {
        ledger.gremlinsSurvived = Math.max(
          ledger.gremlinsSurvived,
          gremlinDodgerMedals,
        );
      }
      if (hotStreakMedals > 0) {
        ledger.bestAnswerStreakEver = Math.max(ledger.bestAnswerStreakEver, 5);
      }

      const seededModes = [
        ...(Array.isArray(legacyCampaign?.masteredBoardModes)
          ? legacyCampaign.masteredBoardModes
          : []),
        ...(Array.isArray(legacyCampaign?.masteredBoardModesV9)
          ? legacyCampaign.masteredBoardModesV9
          : []),
      ];
      for (const mode of seededModes) {
        if (VALID_BOARD_MODES_SET_V8.has(mode) && !ledger.byBoardMode[mode]) {
          ledger.byBoardMode[mode] = {
            played: 1,
            won: 1,
            bestCash: Math.max(800, estimatedBestSingle),
            totalCash: Math.max(800, estimatedBestSingle),
          };
        }
      }

      ledger.seededFromLegacySave = true;
      return saveCareerStatsLedgerV8(ledger);
    }
  }

  if (legacyCampaign) {
    const legacyModes = [
      ...(Array.isArray(legacyCampaign.masteredBoardModes)
        ? legacyCampaign.masteredBoardModes
        : []),
      ...(Array.isArray(legacyCampaign.masteredBoardModesV9)
        ? legacyCampaign.masteredBoardModesV9
        : []),
    ];
    let backfilled = false;
    for (const mode of legacyModes) {
      if (VALID_BOARD_MODES_SET_V8.has(mode) && !ledger.byBoardMode[mode]) {
        ledger.byBoardMode[mode] = {
          played: 1,
          won: 1,
          bestCash: 800,
          totalCash: 800,
        };
        backfilled = true;
      }
    }
    if (backfilled) {
      return saveCareerStatsLedgerV8(ledger);
    }
  }

  return ledger;
}

// ----------------------------------------------------------------------------
// 5. Mutation Helpers (Auto-Saving to `localStorage`)
// ----------------------------------------------------------------------------

export function recordClueAttemptStatV8(
  input: RecordClueAttemptInputV8 & { readonly cashDelta?: number },
): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  const clampedMs = sanitizeNonNegIntV8(input.responseMs, 0, 180_000);
  const cash = sanitizeNonNegIntV8(
    input.cashEarned ?? input.cashDelta,
    0,
    10_000_000,
  );
  const isCorrect = Boolean(input.isCorrect);

  ledger.totalCluesAnswered += 1;
  if (isCorrect) {
    ledger.totalCluesCorrect += 1;
    ledger.currentAnswerStreak += 1;
    if (ledger.currentAnswerStreak > ledger.bestAnswerStreakEver) {
      ledger.bestAnswerStreakEver = ledger.currentAnswerStreak;
    }
  } else {
    ledger.currentAnswerStreak = 0;
  }
  ledger.totalResponseMs += clampedMs;
  ledger.lifetimeCashEarned += cash;

  liveMatchCluesBufferedV8 += 1;
  liveMatchClueCashBufferedV8 += cash;

  // Per-Category Counter
  if (VALID_CATEGORIES_SET_V8.has(input.category)) {
    const prevCat = ledger.byCategory[input.category] ?? {
      attempts: 0,
      correct: 0,
      totalResponseMs: 0,
      cashEarned: 0,
      currentStreak: 0,
      bestStreak: 0,
    };
    const nextCatStreak = isCorrect ? prevCat.currentStreak + 1 : 0;
    ledger.byCategory[input.category] = {
      attempts: prevCat.attempts + 1,
      correct: prevCat.correct + (isCorrect ? 1 : 0),
      totalResponseMs: prevCat.totalResponseMs + clampedMs,
      cashEarned: prevCat.cashEarned + cash,
      currentStreak: nextCatStreak,
      bestStreak: Math.max(prevCat.bestStreak, nextCatStreak),
    };
  }

  // Per-Toy Counter
  if (VALID_TOYS_SET_V8.has(input.toyId)) {
    const prevToy = ledger.byToy[input.toyId] ?? {
      attempts: 0,
      correct: 0,
      totalResponseMs: 0,
      cashEarned: 0,
    };
    ledger.byToy[input.toyId] = {
      attempts: prevToy.attempts + 1,
      correct: prevToy.correct + (isCorrect ? 1 : 0),
      totalResponseMs: prevToy.totalResponseMs + clampedMs,
      cashEarned: prevToy.cashEarned + cash,
    };
  }

  // Per-Classic-Card-Style Counter (for 4-option monitor presentations)
  if (input.toyId === 'TOY_01_KNIFE_SWITCH' || input.cardStyle) {
    const resolvedStyle: QuestionCardStyleV7 =
      input.cardStyle && VALID_CARD_STYLES_SET_V8.has(input.cardStyle)
        ? input.cardStyle
        : 'CLASSIC_CUE';
    const prevStyle = ledger.byCardStyle[resolvedStyle] ?? {
      attempts: 0,
      correct: 0,
      totalResponseMs: 0,
      cashEarned: 0,
    };
    ledger.byCardStyle[resolvedStyle] = {
      attempts: prevStyle.attempts + 1,
      correct: prevStyle.correct + (isCorrect ? 1 : 0),
      totalResponseMs: prevStyle.totalResponseMs + clampedMs,
      cashEarned: prevStyle.cashEarned + cash,
    };
  }

  // Lifeline Conversion Counters
  if (input.usedFiftyFifty) {
    ledger.lifelines.fiftyFiftyUsed += 1;
    if (isCorrect) ledger.lifelines.fiftyFiftyWins += 1;
  }
  if (input.usedAudiencePoll) {
    ledger.lifelines.audiencePollUsed += 1;
    if (isCorrect) ledger.lifelines.audiencePollWins += 1;
  }
  if (input.usedFreeSwap) {
    ledger.lifelines.freeSwapUsed += 1;
    if (isCorrect) ledger.lifelines.freeSwapWins += 1;
  }

  return saveCareerStatsLedgerV8(ledger);
}

export function recordLifelineUsedStatV8(
  kind: 'FIFTY_FIFTY' | 'AUDIENCE_POLL' | 'FREE_SWAP',
  wonClue = false,
): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  if (kind === 'FIFTY_FIFTY') {
    ledger.lifelines.fiftyFiftyUsed += 1;
    if (wonClue) ledger.lifelines.fiftyFiftyWins += 1;
  } else if (kind === 'AUDIENCE_POLL') {
    ledger.lifelines.audiencePollUsed += 1;
    if (wonClue) ledger.lifelines.audiencePollWins += 1;
  } else {
    ledger.lifelines.freeSwapUsed += 1;
    if (wonClue) ledger.lifelines.freeSwapWins += 1;
  }
  return saveCareerStatsLedgerV8(ledger);
}

export function recordVaultCrackedStatV8(): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  ledger.vaultsCracked += 1;
  return saveCareerStatsLedgerV8(ledger);
}

export function recordBargainBoughtStatV8(): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  ledger.bargainsBought += 1;
  return saveCareerStatsLedgerV8(ledger);
}

export function recordGremlinSurvivedStatV8(): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  ledger.gremlinsSurvived += 1;
  return saveCareerStatsLedgerV8(ledger);
}

export function recordFinalWagerStatV8(won: boolean): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  ledger.finalWagersAttempted += 1;
  if (won) {
    ledger.finalWagersWon += 1;
  }
  return saveCareerStatsLedgerV8(ledger);
}

export function recordMatchCompletedStatV8(
  point: MatchHistoryPointV8,
): CareerStatsLedgerV8 {
  const ledger = loadCareerStatsLedgerV8();
  const cleanPoint =
    sanitizeMatchHistoryPointV8(point) ??
    ({
      tsIso: new Date().toISOString(),
      matchType: 'QUICK_PLAY',
      label: 'QUICK',
      boardPlayMode: 'CLASSIC_TOTE',
      rivalName: 'Studio Champion',
      playerCash: 0,
      rivalCash: 0,
      won: false,
      cluesAnswered: 0,
      cluesCorrect: 0,
      bestMatchStreak: 0,
    } satisfies MatchHistoryPointV8);

  ledger.totalMatchesPlayed += 1;
  if (cleanPoint.won) {
    ledger.totalMatchesWon += 1;
    ledger.currentMatchWinStreak += 1;
    if (ledger.currentMatchWinStreak > ledger.bestMatchWinStreakEver) {
      ledger.bestMatchWinStreakEver = ledger.currentMatchWinStreak;
    }
  } else {
    ledger.currentMatchWinStreak = 0;
  }

  // Reconcile per-clue buffers vs standalone match completion calls
  if (liveMatchCluesBufferedV8 > 0) {
    const bonusPurseDelta = Math.max(
      0,
      cleanPoint.playerCash - liveMatchClueCashBufferedV8,
    );
    ledger.lifetimeCashEarned += bonusPurseDelta;
  } else {
    ledger.lifetimeCashEarned += cleanPoint.playerCash;
    ledger.totalCluesAnswered += cleanPoint.cluesAnswered;
    ledger.totalCluesCorrect += cleanPoint.cluesCorrect;
  }
  liveMatchCluesBufferedV8 = 0;
  liveMatchClueCashBufferedV8 = 0;

  if (cleanPoint.playerCash > ledger.highestSingleMatchCash) {
    ledger.highestSingleMatchCash = cleanPoint.playerCash;
  }
  if (cleanPoint.bestMatchStreak > ledger.bestAnswerStreakEver) {
    ledger.bestAnswerStreakEver = cleanPoint.bestMatchStreak;
  }

  // Per-Board-Mode Mastery Counter
  const prevBoard = ledger.byBoardMode[cleanPoint.boardPlayMode] ?? {
    played: 0,
    won: 0,
    bestCash: 0,
    totalCash: 0,
  };
  ledger.byBoardMode[cleanPoint.boardPlayMode] = {
    played: prevBoard.played + 1,
    won: prevBoard.won + (cleanPoint.won ? 1 : 0),
    bestCash: Math.max(prevBoard.bestCash, cleanPoint.playerCash),
    totalCash: prevBoard.totalCash + cleanPoint.playerCash,
  };

  // Rolling 40-Episode History Window (chronological oldest -> newest)
  const nextRecent = [...ledger.recentMatches, cleanPoint];
  ledger.recentMatches =
    nextRecent.length > MAX_RECENT_MATCH_HISTORY_V8
      ? nextRecent.slice(nextRecent.length - MAX_RECENT_MATCH_HISTORY_V8)
      : nextRecent;

  return saveCareerStatsLedgerV8(ledger);
}

// ----------------------------------------------------------------------------
// 6. Analytical Drill-Down Helpers for 1966 Nielsen Career Dashboard
// ----------------------------------------------------------------------------

function computeAccuracyPctV8(correct: number, attempts: number): number {
  if (attempts <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((correct / attempts) * 100)));
}

function computeAvgSecV8(totalResponseMs: number, attempts: number): number {
  if (attempts <= 0 || totalResponseMs <= 0) return 0;
  return Math.round((totalResponseMs / attempts / 1000) * 10) / 10;
}

function resolveCategoryStatusBadgeV8(
  attempts: number,
  accuracyPct: number,
): CategoryStatusBadgeV8 {
  if (attempts <= 0) return 'UNEXPLORED';
  if (attempts >= 2 && accuracyPct >= 75) return '★ WHEELHOUSE';
  if (attempts === 1 && accuracyPct >= 100) return 'SOLID';
  if (accuracyPct >= 50) return 'SOLID';
  return 'NEEDS PRACTICE';
}

function buildCategoryBreakdownItemV8(
  ledger: CareerStatsLedgerV8,
  category: CategoryIdV7,
): CategoryBreakdownItemV8 {
  const counter = ledger.byCategory[category];
  const attempts = counter?.attempts ?? 0;
  const correct = counter?.correct ?? 0;
  const totalResponseMs = counter?.totalResponseMs ?? 0;
  const cashEarned = counter?.cashEarned ?? 0;
  const bestStreak = counter?.bestStreak ?? 0;
  const currentStreak = counter?.currentStreak ?? 0;
  const accuracyPct = computeAccuracyPctV8(correct, attempts);
  const avgSec = computeAvgSecV8(totalResponseMs, attempts);
  const broadcastDomain = CATEGORY_TO_BROADCAST_DOMAIN_V8[category];

  return {
    category,
    friendlyName: FRIENDLY_TV_CATEGORY_LABELS_V7[category] ?? category,
    broadcastDomain,
    broadcastDomainTitle: BROADCAST_DOMAIN_TITLE_MAP_V8[broadcastDomain],
    domainHex: BROADCAST_DOMAIN_HEX_MAP_V8[broadcastDomain],
    attempts,
    correct,
    accuracyPct,
    avgSec,
    bestStreak,
    currentStreak,
    cashEarned,
    statusBadge: resolveCategoryStatusBadgeV8(attempts, accuracyPct),
  };
}

export function computeDomainBreakdownV8(
  ledger: CareerStatsLedgerV8,
): DomainBreakdownItemV8[] {
  return BROADCAST_ANALYTICS_DOMAINS_V8.map((spec) => {
    const nestedCategories = spec.categories.map((cat) =>
      buildCategoryBreakdownItemV8(ledger, cat),
    );
    let attempts = 0;
    let correct = 0;
    let totalResponseMs = 0;
    let cashEarned = 0;

    for (const cat of spec.categories) {
      const c = ledger.byCategory[cat];
      if (c) {
        attempts += c.attempts;
        correct += c.correct;
        totalResponseMs += c.totalResponseMs;
        cashEarned += c.cashEarned;
      }
    }

    return {
      domainId: spec.domainId,
      title: spec.title,
      subtitle: spec.subtitle,
      hexColor: spec.hexColor,
      attempts,
      correct,
      accuracyPct: computeAccuracyPctV8(correct, attempts),
      avgSec: computeAvgSecV8(totalResponseMs, attempts),
      cashEarned,
      categories: nestedCategories,
    };
  });
}

export function computeSortedCategoriesV8(
  ledger: CareerStatsLedgerV8,
  filterDomain: CategoryDomainFilterV8 = 'ALL',
  sortBy: CategorySortModeV8 = 'ACCURACY_DESC',
): CategoryBreakdownItemV8[] {
  const allItems = ALL_CATEGORIES_V7.map((cat) =>
    buildCategoryBreakdownItemV8(ledger, cat),
  );

  const filtered = allItems.filter((item) => {
    if (filterDomain === 'ALL') return true;
    if (
      filterDomain === 'SCI_TECH' ||
      filterDomain === 'POP_LIT' ||
      filterDomain === 'MONEY_ODDS' ||
      filterDomain === 'WORLD_SPORT' ||
      filterDomain === 'HIST_MYTH'
    ) {
      return item.broadcastDomain === filterDomain;
    }
    // Support canonical 4-domain DomainIdV7 ('NUM_GEO' | 'HIST_FACT') seamlessly
    return CATEGORY_TO_DOMAIN_V7[item.category] === filterDomain;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (sortBy === 'ACCURACY_DESC') {
      const aPlayed = a.attempts > 0 ? 1 : 0;
      const bPlayed = b.attempts > 0 ? 1 : 0;
      if (aPlayed !== bPlayed) return bPlayed - aPlayed;
      if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      return a.friendlyName.localeCompare(b.friendlyName);
    }

    if (sortBy === 'WEAKEST_FIRST') {
      const aPlayed = a.attempts > 0 ? 1 : 0;
      const bPlayed = b.attempts > 0 ? 1 : 0;
      if (aPlayed !== bPlayed) return bPlayed - aPlayed;
      if (a.accuracyPct !== b.accuracyPct) return a.accuracyPct - b.accuracyPct;
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      return a.friendlyName.localeCompare(b.friendlyName);
    }

    if (sortBy === 'MOST_PLAYED') {
      if (b.attempts !== a.attempts) return b.attempts - a.attempts;
      if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
      return a.friendlyName.localeCompare(b.friendlyName);
    }

    // 'BEST_STREAK'
    if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
    if (b.currentStreak !== a.currentStreak) {
      return b.currentStreak - a.currentStreak;
    }
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    return a.friendlyName.localeCompare(b.friendlyName);
  });

  return sorted;
}

export function computeWheelhouseAndPracticeCalloutsV8(
  ledger: CareerStatsLedgerV8,
): WheelhouseAndPracticeCalloutsV8 {
  const allItems = ALL_CATEGORIES_V7.map((cat) =>
    buildCategoryBreakdownItemV8(ledger, cat),
  );
  const played = allItems.filter((c) => c.attempts > 0);
  if (played.length === 0) {
    return { wheelhouse: null, practiceTarget: null };
  }

  const bestSorted = [...played].sort((a, b) => {
    if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
    if (b.correct !== a.correct) return b.correct - a.correct;
    return b.attempts - a.attempts;
  });
  const wheelhouse = bestSorted[0] ?? null;

  const weakCandidates = played.filter(
    (c) => !wheelhouse || c.category !== wheelhouse.category || played.length === 1,
  );
  const weakSorted = [...weakCandidates].sort((a, b) => {
    if (a.accuracyPct !== b.accuracyPct) return a.accuracyPct - b.accuracyPct;
    return b.attempts - a.attempts;
  });

  let practiceTarget: CategoryBreakdownItemV8 | null = weakSorted[0] ?? null;
  if (
    practiceTarget &&
    wheelhouse &&
    practiceTarget.category === wheelhouse.category &&
    practiceTarget.accuracyPct >= 80
  ) {
    const firstUnexplored = allItems.find((c) => c.attempts === 0) ?? null;
    practiceTarget = firstUnexplored;
  }

  return { wheelhouse, practiceTarget };
}

export function computeFormatAndLifelineBreakdownV8(
  ledger: CareerStatsLedgerV8,
): FormatAndLifelineBreakdownV8 {
  // Reconcile Classic 4-Option Card Styles with TOY_01_KNIFE_SWITCH if needed
  let styleSumAttempts = 0;
  let styleSumCorrect = 0;
  let styleSumMs = 0;
  let styleSumCash = 0;

  for (const style of CLASSIC_CARD_STYLES_V7) {
    const c = ledger.byCardStyle[style];
    if (c) {
      styleSumAttempts += c.attempts;
      styleSumCorrect += c.correct;
      styleSumMs += c.totalResponseMs;
      styleSumCash += c.cashEarned;
    }
  }

  const knifeCounter = ledger.byToy.TOY_01_KNIFE_SWITCH;
  const extraClassicAttempts = Math.max(
    0,
    (knifeCounter?.attempts ?? 0) - styleSumAttempts,
  );
  const extraClassicCorrect = Math.max(
    0,
    (knifeCounter?.correct ?? 0) - styleSumCorrect,
  );
  const extraClassicMs = Math.max(
    0,
    (knifeCounter?.totalResponseMs ?? 0) - styleSumMs,
  );
  const extraClassicCash = Math.max(
    0,
    (knifeCounter?.cashEarned ?? 0) - styleSumCash,
  );

  const classicCardStyles: FormatStatRowV8[] = CLASSIC_CARD_STYLES_V7.map(
    (style) => {
      const base = ledger.byCardStyle[style];
      const isDefaultCue = style === 'CLASSIC_CUE';
      const attempts =
        (base?.attempts ?? 0) + (isDefaultCue ? extraClassicAttempts : 0);
      const correct =
        (base?.correct ?? 0) + (isDefaultCue ? extraClassicCorrect : 0);
      const totalMs =
        (base?.totalResponseMs ?? 0) + (isDefaultCue ? extraClassicMs : 0);
      const cashEarned =
        (base?.cashEarned ?? 0) + (isDefaultCue ? extraClassicCash : 0);
      const meta = CLASSIC_CARD_STYLE_META_V8[style];

      return {
        id: style,
        kind: 'CLASSIC_CARD',
        title: meta.title,
        subtitle: meta.subtitle,
        hexColor: meta.hexColor,
        attempts,
        correct,
        accuracyPct: computeAccuracyPctV8(correct, attempts),
        avgSec: computeAvgSecV8(totalMs, attempts),
        cashEarned,
      };
    },
  );

  const classicTotalAttempts = styleSumAttempts + extraClassicAttempts;
  const classicTotalCorrect = styleSumCorrect + extraClassicCorrect;
  const classicTotalMs = styleSumMs + extraClassicMs;
  const classicTotalCash = styleSumCash + extraClassicCash;

  let showcaseTotalAttempts = 0;
  let showcaseTotalCorrect = 0;
  let showcaseTotalMs = 0;
  let showcaseTotalCash = 0;

  const showcaseContraptions: FormatStatRowV8[] = CURATED_SHOWCASE_TOYS_V7.map(
    (toyId) => {
      const c = ledger.byToy[toyId];
      const attempts = c?.attempts ?? 0;
      const correct = c?.correct ?? 0;
      const totalMs = c?.totalResponseMs ?? 0;
      const cashEarned = c?.cashEarned ?? 0;

      showcaseTotalAttempts += attempts;
      showcaseTotalCorrect += correct;
      showcaseTotalMs += totalMs;
      showcaseTotalCash += cashEarned;

      const meta = SHOWCASE_TOY_META_V8[toyId];
      return {
        id: toyId,
        kind: 'SHOWCASE_TOY',
        title: meta.title,
        subtitle: meta.subtitle,
        hexColor: meta.hexColor,
        attempts,
        correct,
        accuracyPct: computeAccuracyPctV8(correct, attempts),
        avgSec: computeAvgSecV8(totalMs, attempts),
        cashEarned,
      };
    },
  );

  const lifelines: LifelineRoiItemV8[] = [
    {
      id: 'FIFTY_FIFTY',
      title: '50/50 Studio Cut',
      subtitle: 'Removes two wrong choices on the monitor',
      hexColor: '#008B94',
      used: ledger.lifelines.fiftyFiftyUsed,
      wins: ledger.lifelines.fiftyFiftyWins,
      winConversionPct: computeAccuracyPctV8(
        ledger.lifelines.fiftyFiftyWins,
        ledger.lifelines.fiftyFiftyUsed,
      ),
    },
    {
      id: 'AUDIENCE_POLL',
      title: 'Studio Audience Poll',
      subtitle: 'Live Studio 6A applause meter consensus',
      hexColor: '#F2A922',
      used: ledger.lifelines.audiencePollUsed,
      wins: ledger.lifelines.audiencePollWins,
      winConversionPct: computeAccuracyPctV8(
        ledger.lifelines.audiencePollWins,
        ledger.lifelines.audiencePollUsed,
      ),
    },
    {
      id: 'FREE_SWAP',
      title: 'Free Cue-Card Swap',
      subtitle: 'Fresh replacement card in the same category',
      hexColor: '#FF6B35',
      used: ledger.lifelines.freeSwapUsed,
      wins: ledger.lifelines.freeSwapWins,
      winConversionPct: computeAccuracyPctV8(
        ledger.lifelines.freeSwapWins,
        ledger.lifelines.freeSwapUsed,
      ),
    },
  ];

  return {
    classicSummary: {
      attempts: classicTotalAttempts,
      correct: classicTotalCorrect,
      accuracyPct: computeAccuracyPctV8(
        classicTotalCorrect,
        classicTotalAttempts,
      ),
      avgSec: computeAvgSecV8(classicTotalMs, classicTotalAttempts),
      cashEarned: classicTotalCash,
    },
    showcaseSummary: {
      attempts: showcaseTotalAttempts,
      correct: showcaseTotalCorrect,
      accuracyPct: computeAccuracyPctV8(
        showcaseTotalCorrect,
        showcaseTotalAttempts,
      ),
      avgSec: computeAvgSecV8(showcaseTotalMs, showcaseTotalAttempts),
      cashEarned: showcaseTotalCash,
    },
    classicCardStyles,
    showcaseContraptions,
    lifelines,
  };
}

export function computeBoardModesBreakdownV8(
  ledger: CareerStatsLedgerV8,
): BoardModeBreakdownItemV8[] {
  return CANONICAL_BOARD_MODES_ORDER_V8.map((mode) => {
    const c = ledger.byBoardMode[mode];
    const played = c?.played ?? 0;
    const won = c?.won ?? 0;
    const bestCash = c?.bestCash ?? 0;
    const totalCash = c?.totalCash ?? 0;
    const meta = BOARD_MODE_SHORT_LABELS_V8[mode];
    return {
      mode,
      shortTitle: meta.shortTitle,
      fullTitle: BOARD_PLAY_MODE_TITLES_V9[mode] ?? meta.shortTitle,
      hexColor: meta.hexColor,
      played,
      won,
      winPct: computeAccuracyPctV8(won, played),
      bestCash,
      totalCash,
    };
  });
}
