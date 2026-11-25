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
  ALL_CATEGORIES_V7,
  DOMAIN_SPECS_V7,
  type BoardIdV7,
  type BoardTwistIdV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type DailyBroadcastSaveV7,
  type DomainIdV7,
  type EpisodeBlueprintV7,
  type RivalIdV7,
  type StageWorldIdV7,
  type ToyIdV7,
} from '../contracts_v7';
import { CAST_PROFILES_V7, RIVAL_IDS_V7 } from './CastAndRelicsCatalogV7';

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
    bannerTitle: 'Primetime Jubilee Network Hour',
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
    bannerTitle: 'Monte Carlo Satellite Showcase',
  },
  {
    stageId: 'STAGE_08_WORLDS_FAIR_GEODESIC',
    boardId: 'BOARD_08_GEODESIC_SUNDIAL',
    twistId: 'TWIST_08_SOLAR_MERIDIAN_SWEEP',
    bannerTitle: 'World’s Fair Pavilion Broadcast',
  },
  {
    stageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    boardId: 'BOARD_05_LARSON_SPIN_RING',
    twistId: 'TWIST_05_LARSON_HOT_SPOT',
    bannerTitle: '1967 Apollo Memory-Flash Showcase',
  },
];

const DAILY_COLD_OPEN_LINES: Record<RivalIdV7, string> = {
  CARMEN_DELGADO:
    'Same board coast-to-coast today—let’s keep it clean and see whose reflexes hold under the hot lamps!',
  TOBY_OKAFOR:
    'Every relay on today’s Daily Tote Board is humming—watch the Locked Vault and beat my tally if you can!',
  INEZ_CALLAHAN:
    'Fifty million homes get the exact same clues today. Read carefully before you slap that studio button!',
  ALASTAIR_KERR:
    'Another afternoon, another challenger hoping a Secret Square saves them. Shall we test your nerve?',
  SEO_YUN_KANG:
    'I have already priced the odds on today’s board. One slip on the Mystery Curtain and the purse is mine.',
  REX_CALLOWAY:
    'Smile for Camera One, pal—every living room in America is comparing their scorecard against ours today!',
};

let memoryFallbackSave: DailyBroadcastSaveV7 | null = null;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseIsoParts(dateIso: string): { year: number; month: number; day: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!m) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
  return {
    year: Number(m[1]),
    month: Math.max(1, Math.min(12, Number(m[2]))),
    day: Math.max(1, Math.min(31, Number(m[3]))),
  };
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

/** Deterministically builds today's shared 1966 Daily Broadcast blueprint. */
export function getTodayBroadcastBlueprintV7(
  dateIso: string = getLocalDateIsoV7(),
): DailyBroadcastBlueprintV7 {
  const dailyNumber = computeDailyEpisodeNumberV7(dateIso);
  const dailySeed = hashDateSeedV7(dateIso);
  const rng = createMulberry32V7(dailySeed);
  const displayDateShort = formatShortBroadcastDateV7(dateIso);

  const showcaseIdx = (dailyNumber - 1 + Math.floor(rng() * DAILY_LIVING_COLOR_SHOWCASES.length)) %
    DAILY_LIVING_COLOR_SHOWCASES.length;
  const showcase = DAILY_LIVING_COLOR_SHOWCASES[showcaseIdx];

  const rivalIdx = (dailyNumber + Math.floor(rng() * RIVAL_IDS_V7.length)) % RIVAL_IDS_V7.length;
  const rivalId = RIVAL_IDS_V7[rivalIdx];
  const rivalProfile = CAST_PROFILES_V7[rivalId];

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
    season: 1,
    code: `DAILY #${dailyNumber}`,
    title: `1966 Daily Broadcast #${dailyNumber} (${displayDateShort}) — ${showcase.bannerTitle}`,
    stageId: showcase.stageId,
    boardId: showcase.boardId,
    twistId: showcase.twistId,
    rivalId,
    isRoadshow: showcase.stageId !== 'STAGE_01_IBC_DAYTIME_FUNK' && showcase.stageId !== 'STAGE_02_IBC_PRIMETIME_JUBILEE',
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
  };
}

/** Classifies a resolved turn into its spoiler-free 1966 TV emoji token. */
export function classifyDailyTileOutcomeV7(params: {
  readonly scored: boolean;
  readonly tvTwist?: ClassicTvTileTwistV7;
  readonly selectedToy?: ToyIdV7;
}): DailyTileHistoryTokenV7 {
  if (!params.scored) return 'MISS';
  if (params.tvTwist === 'SECRET_SQUARE') return 'SECRET_WIN';
  if (params.tvTwist === 'LOCKED_VAULT') return 'VAULT_WIN';
  if (params.tvTwist === 'MYSTERY_CURTAIN') return 'MYSTERY_WIN';
  if (
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
  MISS: '🟦🟥',
};

function formatDollars(amount: number): string {
  const clean = Math.max(0, Math.round(amount));
  return `$${clean.toLocaleString('en-US')}`;
}

/** Formats the crisp, zero-spoiler Wordle/Connections-style 1966 TV emoji share card. */
export function formatDailyBroadcastEmojiShareCardV7(
  input: FormatDailyShareCardInputV7,
): string {
  const shortDate = formatShortBroadcastDateV7(input.dateIso);
  const line1 = `📺 WORLD'S SMARTEST · 1966 Daily Broadcast #${input.episodeNumber} (${shortDate})`;
  const outcomeTag = input.won ? 'WON!' : 'CLOSE SHOW!';
  const streakSuffix =
    input.currentStreak > 0 ? ` (🔥 Streak: ${input.currentStreak})` : '';
  const leadIcon = input.won ? '🏆' : '🎬';
  const line2 = `${leadIcon} ${formatDollars(input.playerCash)} vs Champ ${formatDollars(input.rivalCash)} · ${outcomeTag}${streakSuffix}`;
  const emojiGrid =
    input.tileHistory.length > 0
      ? input.tileHistory.map((tok) => TOKEN_TO_EMOJI_PAIR[tok] ?? '🟦🟩').join(' ')
      : '🟦🟩';
  return `${line1}\n${line2}\n${emojiGrid}`;
}

function readRawSaveFromStorage(): DailyBroadcastSaveV7 | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(DAILY_BROADCAST_STORAGE_KEY_V7);
      if (!raw) return memoryFallbackSave;
      const parsed = JSON.parse(raw) as Partial<DailyBroadcastSaveV7>;
      if (typeof parsed !== 'object' || parsed === null) return memoryFallbackSave;
      return {
        lastPlayedDateIso: typeof parsed.lastPlayedDateIso === 'string' ? parsed.lastPlayedDateIso : '',
        currentStreak: Math.max(0, Math.floor(Number(parsed.currentStreak) || 0)),
        bestStreak: Math.max(0, Math.floor(Number(parsed.bestStreak) || 0)),
        gamesPlayed: Math.max(0, Math.floor(Number(parsed.gamesPlayed) || 0)),
        gamesWon: Math.max(0, Math.floor(Number(parsed.gamesWon) || 0)),
        ...(parsed.todayResult && typeof parsed.todayResult.dateIso === 'string'
          ? { todayResult: parsed.todayResult }
          : {}),
      };
    }
  } catch {
    // Fallback to in-memory store when storage is restricted
  }
  return memoryFallbackSave;
}

function writeSaveToStorage(save: DailyBroadcastSaveV7): void {
  memoryFallbackSave = save;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(DAILY_BROADCAST_STORAGE_KEY_V7, JSON.stringify(save));
    }
  } catch {
    // Ignore quota / private-mode errors; memoryFallbackSave stays current
  }
}

/** Reads persistent Daily Broadcast save normalized for `nowDateIso` (decays expired streaks, clears stale `todayResult`). */
export function getDailyBroadcastSaveV7(
  nowDateIso: string = getLocalDateIsoV7(),
): DailyBroadcastSaveV7 {
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

  const yesterdayIso = getPreviousDateIsoV7(nowDateIso);
  const streakStillAlive =
    raw.lastPlayedDateIso === nowDateIso || raw.lastPlayedDateIso === yesterdayIso;
  const activeStreak = streakStillAlive ? raw.currentStreak : 0;
  const todayResult =
    raw.todayResult && raw.todayResult.dateIso === nowDateIso ? raw.todayResult : undefined;

  return {
    lastPlayedDateIso: raw.lastPlayedDateIso,
    currentStreak: activeStreak,
    bestStreak: Math.max(raw.bestStreak, activeStreak),
    gamesPlayed: raw.gamesPlayed,
    gamesWon: raw.gamesWon,
    ...(todayResult ? { todayResult } : {}),
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
  const dateIso = input.dateIso ?? getLocalDateIsoV7();
  const episodeNumber = input.episodeNumber ?? computeDailyEpisodeNumberV7(dateIso);
  const existing = getDailyBroadcastSaveV7(dateIso);

  // Preserve official first-play streak & score on same-day "Replay Just for Fun" unless overwrite requested
  if (existing.todayResult && existing.todayResult.dateIso === dateIso && !input.overwriteOfficialToday) {
    return existing;
  }

  const yesterdayIso = getPreviousDateIsoV7(dateIso);
  const continuedFromYesterday = existing.lastPlayedDateIso === yesterdayIso && existing.currentStreak > 0;
  const nextStreak = input.won ? (continuedFromYesterday ? existing.currentStreak + 1 : 1) : 0;
  const nextBestStreak = Math.max(existing.bestStreak, nextStreak);
  const nextPlayed = existing.gamesPlayed + 1;
  const nextWon = existing.gamesWon + (input.won ? 1 : 0);

  const shareText = formatDailyBroadcastEmojiShareCardV7({
    episodeNumber,
    dateIso,
    playerCash: input.playerCash,
    rivalCash: input.rivalCash,
    won: input.won,
    currentStreak: nextStreak,
    tileHistory: input.tileHistory,
  });

  const updated: DailyBroadcastSaveV7 = {
    lastPlayedDateIso: dateIso,
    currentStreak: nextStreak,
    bestStreak: nextBestStreak,
    gamesPlayed: nextPlayed,
    gamesWon: nextWon,
    todayResult: {
      dateIso,
      episodeNumber,
      playerCash: Math.max(0, Math.round(input.playerCash)),
      rivalCash: Math.max(0, Math.round(input.rivalCash)),
      won: input.won,
      tileHistory: [...input.tileHistory],
      shareText,
    },
  };

  writeSaveToStorage(updated);
  return updated;
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
