// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/campaign/DailyBroadcastV7.ts`
// Shareable `DAILY 1966 BROADCAST` Deterministic Global Engine:
//   - Local `YYYY-MM-DD` deterministic seed (identical Episode #, Stage, Board,
//     Champion Rival, Featured Categories & Seeded Clue Order for all players)
//   - Zero-spoiler Wordle / NYT Connections-grade 1966 TV Emoji Share Card
//   - Persistent streak, best streak, games played/won & today's official score
// ============================================================================

import {
  ALL_BOARD_PLAY_MODES_V7,
  ALL_BOARD_UNLOCK_TOPOLOGIES_V7,
  ALL_CATEGORIES_V7,
  ALL_RIVAL_IDS_V7,
  BOARD_PLAY_MODE_TITLES_V7,
  DOMAIN_SPECS_V7,
  type BoardIdV7,
  type BoardPlayModeV7,
  type BoardTwistIdV7,
  type BoardUnlockTopologyV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type DailyArchiveEntryV8,
  type DailyBroadcastSaveV7,
  type DailyPercentileRankV8,
  type DomainIdV7,
  type EpisodeBlueprintV7,
  type RivalIdV7,
  type StageWorldIdV7,
  type ToyIdV7,
} from '../contracts_v7';
import { CAST_PROFILES_V7 } from './CastAndRelicsCatalogV7';

export const DAILY_BROADCAST_STORAGE_KEY_V7 = 'ws_v7_daily_broadcast_save_1';

/** Epoch anchor: 2026-07-06 = Daily Broadcast #1 (so Nov 24, 2026 = #142!). */
const DAILY_EPOCH_YEAR = 2026;
const DAILY_EPOCH_MONTH = 7; // July (1-indexed)
const DAILY_EPOCH_DAY = 6;

export type DailyTileHistoryTokenV7 = NonNullable<
  DailyBroadcastSaveV7['todayResult']
>['tileHistory'][number];

export interface DailyBroadcastBlueprintV7 extends EpisodeBlueprintV7 {
  readonly dateIso: string; // YYYY-MM-DD
  readonly displayDateShort: string; // e.g. "Nov 24"
  readonly dailyNumber: number; // Deterministic Daily Broadcast # (>= 1)
  readonly dailySeed: number; // 32-bit unsigned deterministic seed
  readonly recommendedTurns: number; // 6-turn punchy coffee-break show (supports up to 10)
  readonly turnSeeds: readonly number[]; // Deterministic seeds for turns 1..12
  readonly featuredCategories: readonly CategoryIdV7[];
  readonly boardPlayMode: BoardPlayModeV7; // Deterministic 8-mode rotation
  readonly unlockTopology: BoardUnlockTopologyV7; // Deterministic 5-topology rotation
  readonly comboKey: string; // `${boardPlayMode}::${unlockTopology}` (40 unique combos!)
  readonly stageBanner: string; // e.g. "Studio 6A Living Color Matinee"
}

export interface FormatDailyShareCardInputV7 {
  readonly episodeNumber: number;
  readonly dateIso: string;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly won: boolean;
  readonly currentStreak: number;
  readonly tileHistory: readonly DailyTileHistoryTokenV7[];
}

export interface RecordDailyBroadcastInputV7 {
  readonly dateIso?: string;
  readonly episodeNumber?: number;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly won: boolean;
  readonly tileHistory: readonly DailyTileHistoryTokenV7[];
  /** Defaults to false so "Replay Just for Fun" never overwrites today's official streak/score. */
  readonly overwriteOfficialToday?: boolean;
}

const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

interface DailyStageShowcaseSpec {
  readonly stageId: StageWorldIdV7;
  readonly boardId: BoardIdV7;
  readonly twistId: BoardTwistIdV7;
  readonly bannerTitle: string;
}

const DAILY_LIVING_COLOR_SHOWCASES: readonly DailyStageShowcaseSpec[] = [
  {
    stageId: 'STAGE_01_IBC_DAYTIME_FUNK',
    boardId: 'BOARD_01_FUNK_CROSSFADER',
    twistId: 'TWIST_01_CROSSFADER_BOOST',
    bannerTitle: 'Studio 6A Living Color Matinee',
  },
  {
    stageId: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    boardId: 'BOARD_02_JUBILEE_HEX_BRIDGE',
    twistId: 'TWIST_02_HEX_BRIDGE_CHAIN',
    bannerTitle: 'Hollywood Honeycomb Network Hour',
  },
  {
    stageId: 'STAGE_03_1926_VAUDEVILLE_PIT',
    boardId: 'BOARD_03_VAUDEVILLE_GEAR_TRAIN',
    twistId: 'TWIST_03_ESCAPEMENT_TICK_SHIFT',
    bannerTitle: 'Burbank Pop-Art Prize Deck',
  },
  {
    stageId: 'STAGE_04_1958_ISOLATION_VAULT',
    boardId: 'BOARD_04_MAHOGANY_SWITCHBOARD',
    twistId: 'TWIST_04_SUPERVISORY_RELAY_PAIR',
    bannerTitle: '$64,000 Isolation Tote Special',
  },
  {
    stageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    boardId: 'BOARD_05_LARSON_SPIN_RING',
    twistId: 'TWIST_05_LARSON_HOT_SPOT',
    bannerTitle: '1967 Apollo Color-Ring Showcase',
  },
  {
    stageId: 'STAGE_06_ATLANTIC_CITY_PIER',
    boardId: 'BOARD_06_BOARDWALK_PINBALL',
    twistId: 'TWIST_06_PINBALL_BUMPER_RICOCHET',
    bannerTitle: 'Atlantic City Steel Pier Special',
  },
  {
    stageId: 'STAGE_07_1969_MONTE_CARLO_CASINO',
    boardId: 'BOARD_07_MONTE_CARLO_SHOE',
    twistId: 'TWIST_07_BACCARAT_NATURAL_21',
    bannerTitle: 'Monte Carlo Satellite Royale',
  },
  {
    stageId: 'STAGE_08_WORLDS_FAIR_GEODESIC',
    boardId: 'BOARD_08_GEODESIC_SUNDIAL',
    twistId: 'TWIST_08_SOLAR_MERIDIAN_SWEEP',
    bannerTitle: 'World’s Fair Unisphere Broadcast',
  },
  {
    stageId: 'STAGE_09_CHANNEL_83_UHF_BARGE',
    boardId: 'BOARD_09_PIRATE_UHF_DECK',
    twistId: 'TWIST_09_PIRATE_CARRIER_LOCK',
    bannerTitle: 'Channel 83 Offshore Memory Deck',
  },
  {
    stageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    boardId: 'BOARD_10_SOVEREIGN_ZIGGURAT',
    twistId: 'TWIST_10_ZIGGURAT_APEX_CROWN',
    bannerTitle: 'Prime-Time Executive Ziggurat',
  },
  {
    stageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    boardId: 'BOARD_11_WHEW_GAUNTLET',
    twistId: 'TWIST_11_GAUNTLET_BLOCKADE_BREACH',
    bannerTitle: 'Coast-to-Coast Spotlight Gauntlet',
  },
  {
    stageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    boardId: 'BOARD_12_PENDULUM_BALANCE',
    twistId: 'TWIST_12_FULCRUM_EQUILIBRIUM',
    bannerTitle: 'Sale of the Century Deal Scale',
  },
];

const DAILY_COLD_OPEN_LINES: Record<RivalIdV7, string> = {
  DOTTY_VANCE:
    'I packed two blue-ribbon pecan chiffons for the crew—now let’s see whose pantry smarts win America’s Daily Tote!',
  CARMEN_DELGADO:
    'Same board coast-to-coast after my Bellevue night shift—play square by the Amber Truce and may the sharpest mind take the purse!',
  CHET_KOWALSKI:
    'Laced up my lucky Milwaukee bowling shirt for today’s national feed—touch that top-row five-hundred plaque and watch me roll strikes!',
  PEGGY_SUE_CONNORS:
    'Just touched down from Rome on the Pan Am Clipper—fifty million living rooms have their tray tables locked for our Daily spin!',
  TOBY_OKAFOR:
    'Every Con Ed transformer under Studio 6A is humming clean today—watch the Locked Vault and try breaking past my block!',
  INEZ_CALLAHAN:
    'Every household from Maine to Monterey faces the exact same card catalog today—read twice before you ring that studio bell!',
  BUZZ_HALVORSEN:
    'Slide rule’s zeroed and Cape Canaveral is tuned to Channel Four—one degree of drift on today’s Daily board and you’re splashdown!',
  GIGI_ST_CLAIR:
    'Soho to Manhattan on the same Daily Tote, darling—if a Big Wheel or Mystery Curtain blinks, I’m buying the whole rack!',
  WALTER_PRINGLE:
    'Treat today’s coast-to-coast grid like my Sunday Hartford crossword—ink only, zero erasers, and mind where I lay my blocks!',
  BETTY_LOU_HARPER:
    'Music Row’s got the studio monitor cranked up back in Nashville—save your sweetest high note for the final two turns, sugar!',
  MILES_ELLINGTON:
    'Same sheet music for fifty million cats today, baby—miss one off-beat syncopation on that board and I’m cutting your solo short.',
  SYLVIE_BEAUMONT:
    'A nationwide Daily menu deserves three-star nerve, mon cher—hesitate over the high-dollar plaques and your soufflé falls flat!',
  MARGO_STERLING:
    'Half of Madison Avenue is scoring today’s broadcast over martinis—I close six-figure boards before the sponsor break!',
  HANK_MCCOY:
    'I didn’t fly up from Houston to peck at hundred-dollar gravel—point me at today’s fattest vault and stand clear of the gusher!',
  ALASTAIR_KERR:
    'How charming—every parlor in the Republic gets to measure its modest wits against Savile Row’s finest this afternoon.',
  LANA_STARLING:
    'Tell the director Camera Two is my good side—coast-to-coast ratings spike whenever I pull a Mystery Curtain on live TV!',
  VINCE_CASTELLANO:
    'Every living room in the country gets dealt the exact same shoe today—let’s see if your palms sweat when the late turns tighten.',
  REX_CALLOWAY:
    'Smile for Camera One, pal—three hundred press boxes from Fenway to Candlestick are grading our Daily scorecard by supper!',
  ARTHUR_PENDLETON:
    'An admirable democratic experiment—one identical syllabus from coast to coast. Shall we convene today’s examination?',
  NORMA_JEAN_BAKER:
    'Everyone sees the same opening position today, yet almost everyone blunders by Move Four—watch the diagonals before you reach.',
  STERLING_VANCE:
    'Broad Street reads today’s Daily Tote like the closing Dow ticker—I’m cornering every high-yield square before the bell.',
  SEO_YUN_KANG:
    'Identical variables across every television set in America today—one sloppy hypothesis on the Curtain and the purse is mine.',
  CLARA_VON_BERG:
    'Silence in the balcony! Today’s national score demands brisk Viennese tempo—rush my cadence and I shall sweep the podium!',
  VICTOR_LAZAR:
    'Fifty million witnesses, one shared Tote Board, and zero margin for superstition—step to the lectern and prove you belong.',
};

type PersistedDailyBroadcastSaveV7 = DailyBroadcastSaveV7 & {
  /** Pre-today streak base carried in from yesterday so `overwriteOfficialToday` never resets a multi-day streak to 1. */
  readonly preTodayStreakBase?: number;
  /** Pre-today best streak so overwriting today's official run keeps `bestStreak` accurate. */
  readonly preTodayBestStreakBase?: number;
};

let memoryFallbackSave: PersistedDailyBroadcastSaveV7 | null = null;

const VALID_DAILY_TILE_TOKENS_V7 = new Set<DailyTileHistoryTokenV7>([
  'WIN',
  'SECRET_WIN',
  'VAULT_WIN',
  'MYSTERY_WIN',
  'SHOWCASE_WIN',
  'MISS',
]);

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function sanitizeDailyNonNegInt(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined || typeof value === 'boolean' || value === '') {
    return fallback;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function parseStrictIsoParts(
  dateIso: unknown,
): { year: number; month: number; day: number } | null {
  if (typeof dateIso !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Reject calendar rollovers such as `2026-02-31`, `2025-02-29`, or `2026-04-31`.
  const probe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** Returns true strictly when `dateIso` is a valid real calendar `YYYY-MM-DD` (rejects `2026-02-31` rollovers). */
export function isValidDailyDateIsoV7(dateIso: string): boolean {
  return parseStrictIsoParts(dateIso) !== null;
}

function parseIsoParts(dateIso: string): { year: number; month: number; day: number } {
  const strict = parseStrictIsoParts(dateIso);
  if (strict) return strict;
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

/** Returns local calendar date in `YYYY-MM-DD` format. */
export function getLocalDateIsoV7(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** Returns exact previous calendar date in `YYYY-MM-DD` format across month/year boundaries. */
export function getPreviousDateIsoV7(dateIso: string): string {
  const { year, month, day } = parseIsoParts(dateIso);
  const prev = new Date(year, month - 1, day - 1, 12, 0, 0);
  return getLocalDateIsoV7(prev);
}

/** Formats `YYYY-MM-DD` into compact broadcast guide style, e.g. `"Nov 24"`. */
export function formatShortBroadcastDateV7(dateIso: string): string {
  const { month, day } = parseIsoParts(dateIso);
  return `${SHORT_MONTH_NAMES[month - 1] ?? 'Nov'} ${day}`;
}

/** Computes deterministic Daily Broadcast episode number (`#142` on `2026-11-24`). */
export function computeDailyEpisodeNumberV7(dateIso: string = getLocalDateIsoV7()): number {
  const { year, month, day } = parseIsoParts(dateIso);
  const targetUtcNoon = Date.UTC(year, month - 1, day, 12, 0, 0);
  const epochUtcNoon = Date.UTC(DAILY_EPOCH_YEAR, DAILY_EPOCH_MONTH - 1, DAILY_EPOCH_DAY, 12, 0, 0);
  const diffDays = Math.round((targetUtcNoon - epochUtcNoon) / 86_400_000);
  return Math.max(1, diffDays + 1);
}

/** Deterministic 32-bit FNV-1a + Murmur avalanche seed for a `YYYY-MM-DD` date string. */
export function hashDateSeedV7(dateIso: string): number {
  const key = `WS_1966_LIVING_COLOR_DAILY_${dateIso.trim()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export function createMulberry32V7(seed: number): () => number {
  let a = seed >>> 0;
  return (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns deterministic per-turn 32-bit seed so every player gets the exact same clue & format on turn `turnNumber`. */
export function getDeterministicDailyTurnSeedV7(
  dateIso: string,
  turnNumber: number,
): number {
  const base = hashDateSeedV7(dateIso);
  let h = (base ^ Math.imul(Math.max(1, turnNumber), 0x9e3779b1)) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return h >>> 0;
}

/** Deterministically builds today's shared 1966 Daily Broadcast blueprint across all 12 Boards, 24 Champions & 40 (8×5) Mode×Topology Combos. */
export function getTodayBroadcastBlueprintV7(
  dateIso: string = getLocalDateIsoV7(),
): DailyBroadcastBlueprintV7 {
  const dailyNumber = computeDailyEpisodeNumberV7(dateIso);
  const dailySeed = hashDateSeedV7(dateIso);
  const rng = createMulberry32V7(dailySeed);
  const displayDateShort = formatShortBroadcastDateV7(dateIso);
  const dayZeroIdx = Math.max(0, dailyNumber - 1);

  // Coprime step mod 12 (`gcd(7, 12) === 1`): visits all 12 `BOARD_01..12` showcases every 12 days with 0 repeats!
  const showcaseIdx = (dayZeroIdx * 7 + 3) % DAILY_LIVING_COLOR_SHOWCASES.length;
  const showcase = DAILY_LIVING_COLOR_SHOWCASES[showcaseIdx];

  // Coprime step mod 24 (`gcd(11, 24) === 1`): visits all 24 Champions every 24 days with 0 back-to-back repeats!
  const rivalIdx = (dayZeroIdx * 11 + 5) % ALL_RIVAL_IDS_V7.length;
  const rivalId = ALL_RIVAL_IDS_V7[rivalIdx];
  const rivalProfile = CAST_PROFILES_V7[rivalId];

  // Coprime step mod 40 (`gcd(17, 40) === 1`): visits all 40 `(8 modes × 5 topologies)` combos every 40 days!
  const totalCombos = ALL_BOARD_PLAY_MODES_V7.length * ALL_BOARD_UNLOCK_TOPOLOGIES_V7.length;
  const comboSlot = (dayZeroIdx * 17 + 7) % totalCombos;
  const modeIdx = Math.floor(comboSlot / ALL_BOARD_UNLOCK_TOPOLOGIES_V7.length);
  const topoIdx = comboSlot % ALL_BOARD_UNLOCK_TOPOLOGIES_V7.length;
  const boardPlayMode = ALL_BOARD_PLAY_MODES_V7[modeIdx] ?? 'CLASSIC_TOTE';
  const unlockTopology = ALL_BOARD_UNLOCK_TOPOLOGIES_V7[topoIdx] ?? 'CLASSIC_OPEN';
  const comboKey = `${boardPlayMode}::${unlockTopology}`;
  const modeTitle = BOARD_PLAY_MODE_TITLES_V7[boardPlayMode];

  // Pick 6 balanced featured categories (at least 1 from each of the 4 domains + 2 wildcards)
  const domains: readonly DomainIdV7[] = ['SCI_TECH', 'POP_LIT', 'NUM_GEO', 'HIST_FACT'];
  const featured: CategoryIdV7[] = [];
  for (const dom of domains) {
    const cats = DOMAIN_SPECS_V7[dom].categories;
    const pick = cats[Math.floor(rng() * cats.length)];
    if (!featured.includes(pick)) featured.push(pick);
  }
  const remaining = ALL_CATEGORIES_V7.filter((c) => !featured.includes(c));
  while (featured.length < 6 && remaining.length > 0) {
    const idx = Math.floor(rng() * remaining.length);
    featured.push(remaining.splice(idx, 1)[0]);
  }

  const turnSeeds: number[] = [];
  for (let t = 1; t <= 12; t++) {
    turnSeeds.push(getDeterministicDailyTurnSeedV7(dateIso, t));
  }

  return {
    episodeNumber: dailyNumber,
    season: rivalProfile.seasonTier ?? 1,
    code: `DAILY #${dailyNumber}`,
    title: `1966 Daily Broadcast #${dailyNumber} (${displayDateShort}) — ${showcase.bannerTitle} · ${modeTitle}`,
    stageId: showcase.stageId,
    boardId: showcase.boardId,
    twistId: showcase.twistId,
    rivalId,
    isRoadshow:
      showcase.stageId !== 'STAGE_01_IBC_DAYTIME_FUNK' &&
      showcase.stageId !== 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    isGoldenExitMatch: false,
    isVaultDrop: false,
    isCoupPivot: false,
    isFinale: false,
    coldOpenLine: {
      speaker: rivalId,
      line: DAILY_COLD_OPEN_LINES[rivalId],
    },
    boothCheatHint: rivalProfile.signatureTellText,
    canaryBroker: 'VERA_KARP',
    canaryNote: `Official Daily Broadcast #${dailyNumber} — certified unrigged coast-to-coast tote feed.`,
    canaryIsPoisoned: false,
    dateIso,
    displayDateShort,
    dailyNumber,
    dailySeed,
    recommendedTurns: 6,
    turnSeeds,
    featuredCategories: featured,
    boardPlayMode,
    unlockTopology,
    comboKey,
    stageBanner: showcase.bannerTitle,
  };
}

/** Deterministic blueprint builder accepting either a `Date` or `YYYY-MM-DD` string for any Today or Archive Tape date. */
export function buildDailyBroadcastBlueprintV7(
  dateOrIso: Date | string = new Date(),
): DailyBroadcastBlueprintV7 {
  const dateIso =
    typeof dateOrIso === 'string'
      ? parseStrictIsoParts(dateOrIso)
        ? dateOrIso.trim()
        : getLocalDateIsoV7()
      : getLocalDateIsoV7(dateOrIso);
  return getTodayBroadcastBlueprintV7(dateIso);
}

/** Audits deterministic Daily Broadcast coverage across all 12 boards, 24 Champions & 40 (8×5) mode×topology combos. */
export function verifyDailyBroadcastRotationV7(): {
  readonly valid: boolean;
  readonly distinctBoards12: number;
  readonly distinctRivals24: number;
  readonly distinctCombos40: number;
} {
  const boards = new Set<BoardIdV7>();
  const rivals = new Set<RivalIdV7>();
  const combos = new Set<string>();
  const baseYear = 2026;
  const baseMonth = 10; // Nov (0-indexed)
  for (let d = 0; d < 40; d++) {
    const iso = getLocalDateIsoV7(new Date(baseYear, baseMonth, 1 + d, 12, 0, 0));
    const bp = getTodayBroadcastBlueprintV7(iso);
    if (d < 12) boards.add(bp.boardId);
    if (d < 24) rivals.add(bp.rivalId);
    combos.add(bp.comboKey);
  }
  const hasAllColdOpens = ALL_RIVAL_IDS_V7.every(
    (id) =>
      typeof DAILY_COLD_OPEN_LINES[id] === 'string' &&
      DAILY_COLD_OPEN_LINES[id].trim().length >= 32 &&
      !DAILY_COLD_OPEN_LINES[id].includes('...'),
  );
  return {
    valid:
      boards.size === 12 &&
      rivals.size === 24 &&
      combos.size === 40 &&
      hasAllColdOpens,
    distinctBoards12: boards.size,
    distinctRivals24: rivals.size,
    distinctCombos40: combos.size,
  };
}

/** Classifies a resolved turn into its celebratory spoiler-free 1966 TV emoji token across all 12 Classic TV Twists. */
export function classifyDailyTileOutcomeV7(params: {
  readonly scored: boolean;
  readonly tvTwist?: ClassicTvTileTwistV7;
  readonly selectedToy?: ToyIdV7;
}): DailyTileHistoryTokenV7 {
  if (!params.scored) return 'MISS';
  if (params.tvTwist === 'SECRET_SQUARE' || params.tvTwist === 'OPPONENT_CHOICE') {
    return 'SECRET_WIN';
  }
  if (params.tvTwist === 'LOCKED_VAULT' || params.tvTwist === 'BRASS_KEY') {
    return 'VAULT_WIN';
  }
  if (
    params.tvTwist === 'MYSTERY_CURTAIN' ||
    params.tvTwist === 'BLIND_CATEGORY' ||
    params.tvTwist === 'MYSTERY_CASH' ||
    params.tvTwist === 'INSTANT_BARGAIN'
  ) {
    return 'MYSTERY_WIN';
  }
  if (
    params.tvTwist === 'BIG_WHEEL_SPIN' ||
    params.tvTwist === 'PRESS_LUCK_SPIN' ||
    params.tvTwist === 'SHOWCASE_BONUS' ||
    (params.selectedToy && params.selectedToy !== 'TOY_01_KNIFE_SWITCH')
  ) {
    return 'SHOWCASE_WIN';
  }
  return 'WIN';
}

const TOKEN_TO_EMOJI_PAIR: Record<DailyTileHistoryTokenV7, string> = {
  WIN: '🟦🟩',
  SECRET_WIN: '⭐🟩',
  VAULT_WIN: '🔒🟩',
  MYSTERY_WIN: '❓🟩',
  SHOWCASE_WIN: '🎯🟩',
  MISS: '🟥',
};

function formatDollars(amount: number): string {
  const clean = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `$${clean.toLocaleString('en-US')}`;
}

/** Formats the crisp, zero-spoiler Wordle/Connections-style 1966 TV emoji share card. */
export function formatDailyBroadcastEmojiShareCardV7(
  input: FormatDailyShareCardInputV7,
): string {
  const shortDate = formatShortBroadcastDateV7(input.dateIso);
  const epNum =
    typeof input.episodeNumber === 'number' &&
    Number.isFinite(input.episodeNumber) &&
    input.episodeNumber >= 1
      ? Math.floor(input.episodeNumber)
      : computeDailyEpisodeNumberV7(input.dateIso);
  const streak = sanitizeDailyNonNegInt(input.currentStreak, 0);
  const line1 = `📺 WORLD'S SMARTEST · 1966 Daily Broadcast #${epNum} (${shortDate})`;
  const outcomeTag = input.won ? 'WON!' : 'CLOSE SHOW!';
  const streakSuffix = streak > 0 ? ` (🔥 Streak: ${streak})` : '';
  const leadIcon = input.won ? '🏆' : '🎬';
  const line2 = `${leadIcon} ${formatDollars(input.playerCash)} vs Champ ${formatDollars(input.rivalCash)} · ${outcomeTag}${streakSuffix}`;
  const safeHistory = Array.isArray(input.tileHistory)
    ? input.tileHistory.filter(
        (tok): tok is DailyTileHistoryTokenV7 =>
          typeof tok === 'string' && VALID_DAILY_TILE_TOKENS_V7.has(tok as DailyTileHistoryTokenV7),
      )
    : [];
  const emojiGrid =
    safeHistory.length > 0
      ? safeHistory.map((tok) => TOKEN_TO_EMOJI_PAIR[tok] ?? '🟦🟩').join(' ')
      : '🟦🟩';
  return `${line1}\n${line2}\n${emojiGrid}`;
}

function sanitizeTodayResult(
  rawResult: unknown,
  currentStreak: number,
): DailyBroadcastSaveV7['todayResult'] | undefined {
  if (!rawResult || typeof rawResult !== 'object' || Array.isArray(rawResult)) {
    return undefined;
  }
  const tr = rawResult as Record<string, unknown>;
  if (typeof tr.dateIso !== 'string' || !parseStrictIsoParts(tr.dateIso)) {
    return undefined;
  }
  if (!Array.isArray(tr.tileHistory)) {
    return undefined;
  }
  if (
    typeof tr.episodeNumber !== 'number' ||
    !Number.isFinite(tr.episodeNumber) ||
    typeof tr.playerCash !== 'number' ||
    !Number.isFinite(tr.playerCash) ||
    typeof tr.rivalCash !== 'number' ||
    !Number.isFinite(tr.rivalCash) ||
    typeof tr.won !== 'boolean'
  ) {
    return undefined;
  }
  const dateIso = tr.dateIso.trim();
  const episodeNumber = Math.max(1, Math.floor(tr.episodeNumber));
  const playerCash = Math.max(0, Math.round(tr.playerCash));
  const rivalCash = Math.max(0, Math.round(tr.rivalCash));
  const tileHistory = tr.tileHistory.filter(
    (tok): tok is DailyTileHistoryTokenV7 =>
      typeof tok === 'string' && VALID_DAILY_TILE_TOKENS_V7.has(tok as DailyTileHistoryTokenV7),
  );
  const shareText =
    typeof tr.shareText === 'string' && tr.shareText.trim().length > 0
      ? tr.shareText
      : formatDailyBroadcastEmojiShareCardV7({
          episodeNumber,
          dateIso,
          playerCash,
          rivalCash,
          won: tr.won,
          currentStreak,
          tileHistory,
        });
  return {
    dateIso,
    episodeNumber,
    playerCash,
    rivalCash,
    won: tr.won,
    tileHistory,
    shareText,
  };
}

function getStorageBackend(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    const g = globalThis as { localStorage?: Storage };
    if (g && g.localStorage) {
      return g.localStorage;
    }
  } catch {
    // Ignore storage access errors in sandboxed/private contexts
  }
  return null;
}

function sanitizeArchiveResults(
  rawArchive: unknown,
): DailyBroadcastSaveV7['archiveResults'] | undefined {
  if (!rawArchive || typeof rawArchive !== 'object' || Array.isArray(rawArchive)) {
    return undefined;
  }
  const src = rawArchive as Record<string, unknown>;
  const cleaned: Record<
    string,
    {
      readonly dailyNumber: number;
      readonly playerCash: number;
      readonly rivalCash: number;
      readonly won: boolean;
      readonly playedAtIso: string;
    }
  > = {};
  let count = 0;
  for (const [dateKey, val] of Object.entries(src)) {
    const trimmedKey = dateKey.trim();
    if (!parseStrictIsoParts(trimmedKey)) continue;
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
    const item = val as Record<string, unknown>;
    if (
      typeof item.dailyNumber !== 'number' ||
      !Number.isFinite(item.dailyNumber) ||
      typeof item.playerCash !== 'number' ||
      !Number.isFinite(item.playerCash) ||
      typeof item.rivalCash !== 'number' ||
      !Number.isFinite(item.rivalCash) ||
      typeof item.won !== 'boolean'
    ) {
      continue;
    }
    cleaned[trimmedKey] = {
      dailyNumber: Math.max(1, Math.floor(item.dailyNumber)),
      playerCash: Math.max(0, Math.round(item.playerCash)),
      rivalCash: Math.max(0, Math.round(item.rivalCash)),
      won: item.won,
      playedAtIso:
        typeof item.playedAtIso === 'string' && item.playedAtIso.trim().length > 0
          ? item.playedAtIso.trim()
          : `${trimmedKey}T12:00:00.000Z`,
    };
    count += 1;
  }
  return count > 0 ? cleaned : undefined;
}

function readRawSaveFromStorage(): PersistedDailyBroadcastSaveV7 | null {
  try {
    const storage = getStorageBackend();
    if (storage) {
      const raw = storage.getItem(DAILY_BROADCAST_STORAGE_KEY_V7);
      if (!raw) return memoryFallbackSave;
      const parsed = JSON.parse(raw) as Partial<PersistedDailyBroadcastSaveV7> | null;
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return memoryFallbackSave;
      }
      const lastPlayedDateIso =
        typeof parsed.lastPlayedDateIso === 'string' && parseStrictIsoParts(parsed.lastPlayedDateIso)
          ? parsed.lastPlayedDateIso.trim()
          : '';
      const currentStreak = sanitizeDailyNonNegInt(parsed.currentStreak, 0);
      const bestStreak = Math.max(currentStreak, sanitizeDailyNonNegInt(parsed.bestStreak, 0));
      const gamesPlayed = sanitizeDailyNonNegInt(parsed.gamesPlayed, 0);
      const gamesWon = Math.min(gamesPlayed, sanitizeDailyNonNegInt(parsed.gamesWon, 0));
      const todayResult = sanitizeTodayResult(parsed.todayResult, currentStreak);
      const archiveResults = sanitizeArchiveResults(parsed.archiveResults);
      const hasPreTodayStreakBase =
        typeof parsed.preTodayStreakBase === 'number' && Number.isFinite(parsed.preTodayStreakBase);
      const hasPreTodayBestBase =
        typeof parsed.preTodayBestStreakBase === 'number' &&
        Number.isFinite(parsed.preTodayBestStreakBase);
      return {
        lastPlayedDateIso,
        currentStreak,
        bestStreak,
        gamesPlayed,
        gamesWon,
        ...(todayResult ? { todayResult } : {}),
        ...(archiveResults ? { archiveResults } : {}),
        ...(hasPreTodayStreakBase
          ? { preTodayStreakBase: Math.max(0, Math.floor(parsed.preTodayStreakBase!)) }
          : {}),
        ...(hasPreTodayBestBase
          ? { preTodayBestStreakBase: Math.max(0, Math.floor(parsed.preTodayBestStreakBase!)) }
          : {}),
      };
    }
  } catch {
    // Fallback to in-memory store when storage is restricted
  }
  return memoryFallbackSave;
}

function writeSaveToStorage(save: PersistedDailyBroadcastSaveV7): void {
  memoryFallbackSave = save;
  try {
    const storage = getStorageBackend();
    if (storage) {
      storage.setItem(DAILY_BROADCAST_STORAGE_KEY_V7, JSON.stringify(save));
    }
  } catch {
    // Ignore quota / private-mode errors; memoryFallbackSave stays current
  }
}

/** Reads persistent Daily Broadcast save normalized for `nowDateIso` (decays expired streaks, clears stale `todayResult`). */
export function getDailyBroadcastSaveV7(
  nowDateIso: string = getLocalDateIsoV7(),
): DailyBroadcastSaveV7 {
  const safeNowIso = parseStrictIsoParts(nowDateIso) ? nowDateIso.trim() : getLocalDateIsoV7();
  const raw = readRawSaveFromStorage();
  if (!raw) {
    return {
      lastPlayedDateIso: '',
      currentStreak: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      gamesWon: 0,
    };
  }

  const yesterdayIso = getPreviousDateIsoV7(safeNowIso);
  const streakStillAlive =
    raw.lastPlayedDateIso === safeNowIso || raw.lastPlayedDateIso === yesterdayIso;
  const activeStreak = streakStillAlive ? raw.currentStreak : 0;
  const todayResult =
    raw.todayResult && raw.todayResult.dateIso === safeNowIso ? raw.todayResult : undefined;

  return {
    lastPlayedDateIso: raw.lastPlayedDateIso,
    currentStreak: activeStreak,
    bestStreak: Math.max(raw.bestStreak, activeStreak),
    gamesPlayed: raw.gamesPlayed,
    gamesWon: raw.gamesWon,
    ...(todayResult ? { todayResult } : {}),
    ...(raw.archiveResults ? { archiveResults: raw.archiveResults } : {}),
  };
}

export function hasCompletedTodayBroadcastV7(
  nowDateIso: string = getLocalDateIsoV7(),
): boolean {
  return Boolean(getDailyBroadcastSaveV7(nowDateIso).todayResult);
}

/** Records today's Daily Broadcast completion, updates streaks, builds shareText, and persists to `localStorage`. */
export function recordDailyBroadcastCompletionV7(
  input: RecordDailyBroadcastInputV7,
): DailyBroadcastSaveV7 {
  const dateIso =
    input.dateIso && parseStrictIsoParts(input.dateIso)
      ? input.dateIso.trim()
      : getLocalDateIsoV7();
  const episodeNumber =
    typeof input.episodeNumber === 'number' && Number.isFinite(input.episodeNumber)
      ? Math.max(1, Math.floor(input.episodeNumber))
      : computeDailyEpisodeNumberV7(dateIso);
  const rawStored = readRawSaveFromStorage();
  const existing = getDailyBroadcastSaveV7(dateIso);

  const alreadyCompletedToday = Boolean(
    existing.todayResult && existing.todayResult.dateIso === dateIso,
  );
  // Preserve official first-play streak & score on same-day "Replay Just for Fun" unless overwrite requested
  if (alreadyCompletedToday && !input.overwriteOfficialToday) {
    return existing;
  }

  const yesterdayIso = getPreviousDateIsoV7(dateIso);
  const isOverwritingToday = alreadyCompletedToday && Boolean(input.overwriteOfficialToday);

  // Preserve pre-today streak base when overwriting today so a multi-day streak is NEVER reset to 1!
  let preTodayStreakBase: number;
  let preTodayBestStreakBase: number;
  if (isOverwritingToday) {
    if (
      rawStored &&
      rawStored.lastPlayedDateIso === dateIso &&
      typeof rawStored.preTodayStreakBase === 'number' &&
      Number.isFinite(rawStored.preTodayStreakBase)
    ) {
      preTodayStreakBase = Math.max(0, Math.floor(rawStored.preTodayStreakBase));
    } else if (existing.todayResult?.won) {
      preTodayStreakBase = Math.max(0, existing.currentStreak - 1);
    } else {
      preTodayStreakBase = 0;
    }

    if (
      rawStored &&
      rawStored.lastPlayedDateIso === dateIso &&
      typeof rawStored.preTodayBestStreakBase === 'number' &&
      Number.isFinite(rawStored.preTodayBestStreakBase)
    ) {
      preTodayBestStreakBase = Math.max(0, Math.floor(rawStored.preTodayBestStreakBase));
    } else {
      preTodayBestStreakBase = existing.bestStreak;
    }
  } else {
    const continuedFromYesterday =
      existing.lastPlayedDateIso === yesterdayIso && existing.currentStreak > 0;
    preTodayStreakBase = continuedFromYesterday ? existing.currentStreak : 0;
    preTodayBestStreakBase = existing.bestStreak;
  }

  const nextStreak = input.won ? preTodayStreakBase + 1 : 0;
  const nextBestStreak = Math.max(preTodayBestStreakBase, nextStreak);

  // Overwriting today's run NEVER double-increments gamesPlayed / gamesWon!
  let nextPlayed: number;
  let nextWon: number;
  if (isOverwritingToday && existing.todayResult) {
    nextPlayed = Math.max(1, existing.gamesPlayed);
    const prevWonDelta = existing.todayResult.won ? 1 : 0;
    const nextWonDelta = input.won ? 1 : 0;
    nextWon = Math.max(0, Math.min(nextPlayed, existing.gamesWon - prevWonDelta + nextWonDelta));
  } else {
    nextPlayed = existing.gamesPlayed + 1;
    nextWon = existing.gamesWon + (input.won ? 1 : 0);
  }

  const cleanPlayerCash = Number.isFinite(input.playerCash)
    ? Math.max(0, Math.round(input.playerCash))
    : 0;
  const cleanRivalCash = Number.isFinite(input.rivalCash)
    ? Math.max(0, Math.round(input.rivalCash))
    : 0;
  const cleanHistory = Array.isArray(input.tileHistory)
    ? input.tileHistory.filter(
        (tok): tok is DailyTileHistoryTokenV7 =>
          typeof tok === 'string' && VALID_DAILY_TILE_TOKENS_V7.has(tok as DailyTileHistoryTokenV7),
      )
    : [];

  const shareText = formatDailyBroadcastEmojiShareCardV7({
    episodeNumber,
    dateIso,
    playerCash: cleanPlayerCash,
    rivalCash: cleanRivalCash,
    won: input.won,
    currentStreak: nextStreak,
    tileHistory: cleanHistory,
  });

  const persisted: PersistedDailyBroadcastSaveV7 = {
    lastPlayedDateIso: dateIso,
    currentStreak: nextStreak,
    bestStreak: nextBestStreak,
    gamesPlayed: nextPlayed,
    gamesWon: nextWon,
    preTodayStreakBase,
    preTodayBestStreakBase,
    todayResult: {
      dateIso,
      episodeNumber,
      playerCash: cleanPlayerCash,
      rivalCash: cleanRivalCash,
      won: input.won,
      tileHistory: cleanHistory,
      shareText,
    },
    ...(rawStored?.archiveResults ? { archiveResults: rawStored.archiveResults } : {}),
  };

  writeSaveToStorage(persisted);
  return {
    lastPlayedDateIso: persisted.lastPlayedDateIso,
    currentStreak: persisted.currentStreak,
    bestStreak: persisted.bestStreak,
    gamesPlayed: persisted.gamesPlayed,
    gamesWon: persisted.gamesWon,
    todayResult: persisted.todayResult,
    ...(persisted.archiveResults ? { archiveResults: persisted.archiveResults } : {}),
  };
}

// ============================================================================
// v8.0 "SWEEPS WEEK DELUXE" — BROADCAST TAPE ARCHIVE & PERCENTILE BELL-CURVE
// ============================================================================

export interface RecordArchiveDailyInputV8 {
  readonly dateIso: string;
  readonly episodeNumber: number;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly won: boolean;
  readonly tileHistory: readonly DailyTileHistoryTokenV7[];
}

export interface ComputeDailyPercentileInputV8 {
  readonly dailyNumber: number;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly won: boolean;
}

/**
 * Builds Today + past Daily Broadcast Tape Vault entries (`#1..#Today`, newest first),
 * deterministically reproducing every past date's exact Stage, Board Mode, and Champion.
 */
export function buildDailyArchiveCatalogV8(
  maxRecentDays: number = 30,
  refDate: Date = new Date(),
): readonly DailyArchiveEntryV8[] {
  const safeRef =
    refDate instanceof Date && !Number.isNaN(refDate.getTime()) ? refDate : new Date();
  const todayIso = getLocalDateIsoV7(safeRef);
  const todayNumber = computeDailyEpisodeNumberV7(todayIso);
  const clampedDays = Number.isFinite(maxRecentDays)
    ? Math.max(1, Math.min(todayNumber, Math.floor(maxRecentDays)))
    : Math.min(todayNumber, 30);

  const save = getDailyBroadcastSaveV7(todayIso);
  const entries: DailyArchiveEntryV8[] = [];

  for (let offset = 0; offset < clampedDays; offset += 1) {
    const dayDate = new Date(
      safeRef.getFullYear(),
      safeRef.getMonth(),
      safeRef.getDate() - offset,
      12,
      0,
      0,
    );
    const bp = buildDailyBroadcastBlueprintV7(dayDate);
    const isToday = offset === 0;
    const officialMatch =
      isToday && save.todayResult && save.todayResult.dateIso === bp.dateIso
        ? save.todayResult
        : undefined;
    const archiveMatch = save.archiveResults?.[bp.dateIso];

    entries.push({
      dailyNumber: bp.dailyNumber,
      dateIso: bp.dateIso,
      displayDateShort: bp.displayDateShort,
      rivalId: bp.rivalId,
      stageId: bp.stageId,
      boardPlayMode: bp.boardPlayMode,
      isToday,
      ...(officialMatch
        ? {
            officialTodayCash: officialMatch.playerCash,
            officialTodayWon: officialMatch.won,
          }
        : {}),
      ...(archiveMatch
        ? {
            archiveReplayCash: archiveMatch.playerCash,
            archiveReplayWon: archiveMatch.won,
          }
        : {}),
    });
  }

  return entries;
}

/**
 * Records a Past-Show Archive Tape completion (or streak-safe same-day replay) ONLY into
 * `save.archiveResults[dateIso]`.
 *
 * STRICT INVARIANT: NEVER mutates `currentStreak`, `bestStreak`, `lastPlayedDateIso`,
 * `gamesPlayed`, `gamesWon`, or official `todayResult`!
 */
export function recordArchiveDailyResultV8(
  input: RecordArchiveDailyInputV8,
): DailyBroadcastSaveV7 {
  const safeDateIso = parseStrictIsoParts(input.dateIso)
    ? input.dateIso.trim()
    : getLocalDateIsoV7();
  const dailyNumber =
    typeof input.episodeNumber === 'number' &&
    Number.isFinite(input.episodeNumber) &&
    input.episodeNumber >= 1
      ? Math.floor(input.episodeNumber)
      : computeDailyEpisodeNumberV7(safeDateIso);
  const cleanPlayerCash = Number.isFinite(input.playerCash)
    ? Math.max(0, Math.round(input.playerCash))
    : 0;
  const cleanRivalCash = Number.isFinite(input.rivalCash)
    ? Math.max(0, Math.round(input.rivalCash))
    : 0;
  const cleanWon = Boolean(input.won);

  const rawStored = readRawSaveFromStorage();
  const prevArchive = rawStored?.archiveResults ?? {};
  const nextArchiveResults: NonNullable<DailyBroadcastSaveV7['archiveResults']> = {
    ...prevArchive,
    [safeDateIso]: {
      dailyNumber,
      playerCash: cleanPlayerCash,
      rivalCash: cleanRivalCash,
      won: cleanWon,
      playedAtIso: new Date().toISOString(),
    },
  };

  const persisted: PersistedDailyBroadcastSaveV7 = {
    lastPlayedDateIso: rawStored?.lastPlayedDateIso ?? '',
    currentStreak: rawStored?.currentStreak ?? 0,
    bestStreak: rawStored?.bestStreak ?? 0,
    gamesPlayed: rawStored?.gamesPlayed ?? 0,
    gamesWon: rawStored?.gamesWon ?? 0,
    ...(rawStored?.todayResult ? { todayResult: rawStored.todayResult } : {}),
    ...(typeof rawStored?.preTodayStreakBase === 'number'
      ? { preTodayStreakBase: rawStored.preTodayStreakBase }
      : {}),
    ...(typeof rawStored?.preTodayBestStreakBase === 'number'
      ? { preTodayBestStreakBase: rawStored.preTodayBestStreakBase }
      : {}),
    archiveResults: nextArchiveResults,
  };

  writeSaveToStorage(persisted);

  return {
    lastPlayedDateIso: persisted.lastPlayedDateIso,
    currentStreak: persisted.currentStreak,
    bestStreak: persisted.bestStreak,
    gamesPlayed: persisted.gamesPlayed,
    gamesWon: persisted.gamesWon,
    ...(persisted.todayResult ? { todayResult: persisted.todayResult } : {}),
    archiveResults: nextArchiveResults,
  };
}

/** Smooth Abramowitz-Stegun normal CDF (`0..1`) strictly monotonic in `z`. */
function standardNormalCdfV8(z: number): number {
  if (!Number.isFinite(z)) return 0.5;
  if (z <= -8) return 0;
  if (z >= 8) return 1;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly =
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
    t;
  const erf = 1 - poly * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

/**
 * Computes a smooth, deterministic Studio 6A Audience Percentile & Rank Seal
 * anchored around `rivalCash` and typical 6-turn scores (`$1,200..$4,800+`).
 * Strictly monotonic non-decreasing with `playerCash`.
 */
export function computeDailyPercentileRankV8(
  opts: ComputeDailyPercentileInputV8,
): DailyPercentileRankV8 {
  const dailyNum =
    typeof opts.dailyNumber === 'number' && Number.isFinite(opts.dailyNumber)
      ? Math.max(1, Math.floor(opts.dailyNumber))
      : 1;
  const playerCash =
    typeof opts.playerCash === 'number' && Number.isFinite(opts.playerCash)
      ? Math.max(0, opts.playerCash)
      : 0;
  const rivalCash =
    typeof opts.rivalCash === 'number' && Number.isFinite(opts.rivalCash)
      ? Math.max(600, Math.min(3600, opts.rivalCash))
      : 1650;

  // Deterministic +/- $60 daily audience difficulty micro-anchor so each broadcast feels alive
  const dailyMicroAnchor = (((dailyNum * 37 + 3) % 11) - 5) * 12;
  const audienceMedianCash = 0.62 * rivalCash + 520 + dailyMicroAnchor;
  const audienceSigmaCash = 900;
  const victoryLift = opts.won ? 110 : 0;

  const z = (playerCash + victoryLift - audienceMedianCash) / audienceSigmaCash;
  const rawPct = Math.round(standardNormalCdfV8(z) * 100);
  const percentile = Math.max(5, Math.min(99, rawPct));

  if (percentile >= 98) {
    return {
      percentile,
      topPercentLabel: 'TOP 2%',
      rankTitle: 'NETWORK SOVEREIGN',
      badgeColorHex: '#FFD166',
      studioNote: `Outscored ${percentile}% of Studio 6A viewers on Broadcast #${dailyNum}!`,
    };
  }
  if (percentile >= 90) {
    return {
      percentile,
      topPercentLabel: 'TOP 10%',
      rankTitle: 'EXECUTIVE PRODUCER',
      badgeColorHex: '#00B4C6',
      studioNote: `Top-decile coast-to-coast tote finish (${percentile}th percentile)!`,
    };
  }
  if (percentile >= 75) {
    return {
      percentile,
      topPercentLabel: 'TOP 25%',
      rankTitle: 'RETURNING CHAMPION',
      badgeColorHex: '#FF6B35',
      studioNote: `Beat ${percentile}% of today’s national television audience!`,
    };
  }
  if (percentile >= 50) {
    return {
      percentile,
      topPercentLabel: 'TOP 50%',
      rankTitle: 'PRIME-TIME CONTENDER',
      badgeColorHex: '#1E56C5',
      studioNote: `Upper-half Studio 6A finish (${percentile}th percentile) on #${dailyNum}!`,
    };
  }
  return {
    percentile,
    topPercentLabel: 'TOP 75%',
    rankTitle: 'STUDIO CHALLENGER',
    badgeColorHex: '#E6397A',
    studioNote: `Certified Studio 6A challenger card on Broadcast #${dailyNum}!`,
  };
}

/** Resets in-memory Daily Broadcast fallback (plus storage if present) for isolated unit testing. */
export function resetDailyBroadcastSaveForTestV8(): void {
  memoryFallbackSave = null;
  try {
    const storage = getStorageBackend();
    storage?.removeItem(DAILY_BROADCAST_STORAGE_KEY_V7);
  } catch {
    // Ignore
  }
}

/** Shares the spoiler-free retro TV card via native Web Share sheet on mobile/tablet or copies cleanly to clipboard. */
export async function shareDailyBroadcastCardV7(
  shareText: string,
): Promise<'WEB_SHARE' | 'CLIPBOARD' | 'FAILED'> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      await navigator.share({
        title: "WORLD'S SMARTEST · 1966 Daily Broadcast",
        text: shareText,
      });
      return 'WEB_SHARE';
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'FAILED';
    }
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      return 'CLIPBOARD';
    }
  } catch {
    // Fallback to hidden textarea selection below
  }

  try {
    if (typeof document !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(ta);
      if (copied) return 'CLIPBOARD';
    }
  } catch {
    // Ignore
  }

  return 'FAILED';
}
