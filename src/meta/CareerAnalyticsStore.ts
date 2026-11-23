// ============================================================================
// WORLD'S SMARTEST — Persistent Career Analytics Store (`#166` §2.1)
// Schema-safe `localStorage` (`ws_career_analytics_v1`) engine tracking:
//  • 2,000-event detailed historical ring-buffer (`QuestionAnalyticsEvent`)
//  • Daily UTC/local date buckets (`YYYY-MM-DD`: right, wrong, acc, avgMs, streak, pts)
//  • Session ELO & score trajectory history (`SessionAnalyticsEntry`)
//  • Lifetime per-domain (0..11), per-morph (6 archetypes), per-peel-tier (1..3),
//    per-mode, Overclock conviction, and 5-bucket response-time counters!
//  • Seamless backfill from `PassportSystem` / `ForgeEngine` on existing saves!
// ============================================================================

import { forgeEngine } from '../forge';
import {
  getSovereignDomainMeta,
  type DomainId,
  type EndingId,
  type PassportSystem,
} from '../narrative';

export type AnalyticsGameMode =
  | 'PROLOGUE'
  | 'CAMPAIGN'
  | 'DAILY'
  | 'BRIEFING'
  | 'ENDLESS'
  | 'TRIALS';

export type AnalyticsArchetype =
  | 'SIGHTLINE_LOCK'
  | 'CODEX_DUAL_RING'
  | 'CALIBRATOR_DIAL'
  | 'GAUNTLET_SHATTER'
  | 'HERO_ARTIFACT_SYNTHESIS'
  | 'GLOBE_PIN_DROP';

export type AnalyticsTimeRange = 'LAST_25' | 'DAYS_7' | 'DAYS_30' | 'ALL_TIME';

export type AnalyticsDifficultyTier =
  | 'MIDDLE_SCHOOL'
  | 'HIGH_SCHOOL'
  | 'COLLEGE'
  | 'GRADUATE'
  | 'MENSA';

export const ALL_ANALYTICS_DIFFICULTY_TIERS: readonly AnalyticsDifficultyTier[] = [
  'MIDDLE_SCHOOL',
  'HIGH_SCHOOL',
  'COLLEGE',
  'GRADUATE',
  'MENSA',
];

export type SpecialFeatKind =
  | 'PASSPORT_STAMPED'
  | 'PROLOGUE_CLEARED'
  | 'RIVAL_BLUFF_CAUGHT'
  | 'SOREN_COIN_BLUFF_DEFEATED'
  | 'BLUFF_ECHO_CANCEL'
  | 'UV_RELIC_SCANNED'
  | 'RELIC_LATCH_OPENED'
  | 'ATELIER_SKIN_EQUIPPED'
  | 'BACKSTAGE_INTERROGATION'
  | 'FACTION_PLEDGED'
  | 'ACT1_CLEARED'
  | 'CAMPAIGN_COMPLETED'
  | 'ENDING_UNLOCKED'
  | 'BLACK_SALON_VICTORY'
  | 'DUEL_CHALLENGE_PLAYED'
  | 'DUEL_GHOST_BEATEN'
  | 'SRS_REVIEW_COMPLETED'
  | 'OFFLINE_PACK_CACHED'
  | 'CLUE_LADDER_STEP1_SNIPE'
  | 'MIND_GAMBIT_USED'
  | 'SECOND_WIND_SAVED'
  | 'FINALE_CATEGORY_WIN';

export type AnalyticsSpeedBucketIndex = 0 | 1 | 2 | 3 | 4;

export type AnalyticsOutcomeFilter = 'ALL' | 'RIGHT' | 'WRONG' | 'DOUBLE_DOWN';

export interface QuestionAnalyticsInput {
  ts?: number;
  qid: number;
  domainId: number;
  mode?: AnalyticsGameMode | string;
  hubId?: string;
  archetype?: AnalyticsArchetype | string;
  difficultyTier?: AnalyticsDifficultyTier | string;
  subcatLabel?: string;
  speedBucketIdx?: AnalyticsSpeedBucketIndex;
  clueLadderStep?: 1 | 2 | 3;
  mindGambitId?: string;
  mindGambitTriggered?: boolean;
  finaleCategoryPicked?: boolean;
  globeDistanceKm?: number;
  hasVisualPlate?: boolean;
  correct: boolean;
  peelTier?: 1 | 2 | 3;
  overclockCharge01?: number;
  backfired?: boolean;
  bluffCalled?: boolean;
  bluffEchoCancelled?: boolean;
  bullseye?: boolean;
  firstTryCodex?: boolean;
  responseTimeMs?: number;
  pointsDelta?: number;
  eloAfter?: number;
  promptSnippet?: string;
  answerLabel?: string;
}

export interface QuestionAnalyticsEvent {
  ts: number;
  dateKey: string;
  qid: number;
  domainId: DomainId;
  mode: AnalyticsGameMode;
  hubId: string;
  archetype: AnalyticsArchetype;
  correct: boolean;
  peelTier: 1 | 2 | 3;
  overclockCharge01: number;
  backfired: boolean;
  bluffCalled: boolean;
  bullseye: boolean;
  responseTimeMs: number;
  pointsDelta: number;
  eloAfter: number;
  promptSnippet?: string;
  answerLabel?: string;
  subcatLabel?: string;
  difficultyTier?: string;
  speedBucketIdx?: AnalyticsSpeedBucketIndex;
  clueLadderStep?: 1 | 2 | 3;
  mindGambitId?: string;
}

export interface RightWrongCounter {
  right: number;
  wrong: number;
}

export interface DomainAnalyticsCounter extends RightWrongCounter {
  totalResponseMs: number;
  peakElo: number;
  lastElo: number;
}

export interface ModeAnalyticsCounter extends RightWrongCounter {
  matchesPlayed: number;
  matchesWon: number;
  bestScore: number;
}

export interface DailyAnalyticsBucket {
  dateKey: string;
  right: number;
  wrong: number;
  totalResponseMs: number;
  maxStreak: number;
  pointsEarned: number;
  max6xWins: number;
  backfires: number;
  eloEnd: number;
}

export interface SessionAnalyticsEntry {
  ts: number;
  dateKey: string;
  mode: AnalyticsGameMode;
  hubId?: string;
  won: boolean;
  right: number;
  wrong: number;
  score: number;
  eloAfter: number;
  maxOverclockWinsInMatch: number;
  peelsUsedInMatch: number;
  shieldsLostInMatch: number;
  isBossShowdown: boolean;
  isBlackSalon?: boolean;
}

export interface MatchCompletedAnalyticsInput {
  mode: AnalyticsGameMode | string;
  hubId?: string;
  won: boolean;
  correctCount: number;
  totalQuestions: number;
  score: number;
  eloAfter?: number;
  isBossShowdown?: boolean;
  shieldsLost?: number;
  peelsUsed?: number;
  max6xOverclockWinsInMatch?: number;
  isBlackSalon?: boolean;
  defeatedRivalId?: string;
  sorenCoinTellCaughtInMatch?: boolean;
  endlessDepthReached?: number;
  endingUnlocked?: EndingId;
  /** Optional UTC date key (`YYYY-MM-DD`) for Daily Global Feed deduplication */
  utcDate?: string;
  /** True when replaying an already-completed Daily Global Feed in practice mode */
  isReplay?: boolean;
  /** Optional calibrated 5-tier difficulty preset played (`MIDDLE_SCHOOL`..`MENSA`) */
  difficultyPreset?: AnalyticsDifficultyTier | string;
  /** Alias for `difficultyPreset` */
  difficultyTier?: AnalyticsDifficultyTier | string;
  /** Optional v3.0 Tactical Mind Gambit used during the match */
  mindGambitUsed?: string;
  /** True when Second Wind mulligan saved a wrong answer in this match */
  secondWindTriggered?: boolean;
  /** True when the Finale Category Picker final question was solved */
  finaleCategoryWon?: boolean;
}

export interface SpecialFeatCounters {
  passportStamped: boolean;
  prologueCleared: boolean;
  act1Cleared: boolean;
  campaignCompleted: boolean;
  rivalBluffsCaught: number;
  sorenCoinBluffDefeated: boolean;
  bluffEchoCancels: number;
  uvScansCount: number;
  scannedRelicIds: string[];
  openedLatchKeys: string[]; // e.g. 'armillary_orrery:0' .. up to 24 latches across 8 relics!
  atelierFinishesEquipped: number;
  backstageInterrogations: number;
  factionPledged: boolean;
  flawlessBossWins: number;
  unpeeledBossWins: number;
  perfectMatchesCount: number; // >= 5 questions with 100% accuracy
  max3x6xInSingleMatch: boolean;
  calibratorBullseyes: number;
  codexFirstTryLocks: number;
  ghostTrialWins: number;
  blackSalonWins: number;
  dailyBroadcastsCompleted: number;
  completedDailyDates: string[];
  maxEndlessDepth: number;
  achievedEndings: EndingId[];
  // v2.0 Expansion Counters (Difficulty Ladder, 3D Globe Pin-Drop, Visual Blueprints, Duels, SRS, Offline)
  difficultyRoundsCleared: Record<AnalyticsDifficultyTier, number>;
  difficultyBestAccuracyPct: Record<AnalyticsDifficultyTier, number>;
  globeBullseyes300Km: number;
  globeNoPeel120Km: number;
  visualBlueprintsSolved: number;
  tier1ColdDomains: number[];
  duelChallengesPlayed: number;
  duelGhostWins: number;
  srsReviewsCompleted: number;
  offlinePacksCached: number;
  // v3.0 Expansion Counters (Clue Ladder Step-1 Snipes & Tactical Mind Gambits)
  clueLadderStep1Snipes: number;
  mindGambitsActivated: number;
  secondWindSaves: number;
  finaleCategoryWins: number;
}

export interface OverclockConvictionStats {
  safeLockWins: number;
  safeLockMisses: number;
  overclockWins: number;
  overclockMisses: number;
  max6xWins: number; // overclockCharge01 >= 0.88 & Tier-1 or full conviction lock
  backfires: number;
  consecutiveMax6xWins: number;
  bestConsecutiveMax6xWins: number;
  currentMatchMax6xWins: number;
  currentMatchPeelsUsed: number;
}

export interface CareerAnalyticsState {
  schemaVersion: 1;
  backfilledFromLegacy: boolean;
  totalRight: number;
  totalWrong: number;
  totalResponseMs: number;
  totalPointsEarned: number;
  currentStreak: number;
  bestStreak: number;
  fastUnder3sStreak: number;
  bestFastUnder3sStreak: number;
  globalEloLatest: number;
  globalEloPeak: number;
  uniqueSolvedQids: number[]; // capped cleanly at 2,500 IDs + monotonic count
  uniqueSolvedCount: number;
  byDomain: DomainAnalyticsCounter[]; // length 12
  byArchetype: Record<AnalyticsArchetype, RightWrongCounter>;
  byPeelTier: Record<'1' | '2' | '3', RightWrongCounter>;
  byMode: Record<AnalyticsGameMode, ModeAnalyticsCounter>;
  /** 5 Speed Buckets: [0]=<3s, [1]=3-6s, [2]=6-10s, [3]=10-15s, [4]=15s+ */
  speedBuckets: [
    RightWrongCounter,
    RightWrongCounter,
    RightWrongCounter,
    RightWrongCounter,
    RightWrongCounter,
  ];
  overclock: OverclockConvictionStats;
  feats: SpecialFeatCounters;
  dailyBuckets: Record<string, DailyAnalyticsBucket>;
  sessions: SessionAnalyticsEntry[];
  events: QuestionAnalyticsEvent[];
}

const ANALYTICS_STORAGE_KEY = 'ws_career_analytics_v1';
const MAX_RING_EVENTS = 2000;
const MAX_SESSIONS = 140;
const MAX_STORED_UNIQUE_QIDS = 2500;

export const ALL_ANALYTICS_ARCHETYPES: readonly AnalyticsArchetype[] = [
  'SIGHTLINE_LOCK',
  'CODEX_DUAL_RING',
  'CALIBRATOR_DIAL',
  'GAUNTLET_SHATTER',
  'HERO_ARTIFACT_SYNTHESIS',
  'GLOBE_PIN_DROP',
];

export const ALL_ANALYTICS_MODES: readonly AnalyticsGameMode[] = [
  'CAMPAIGN',
  'DAILY',
  'BRIEFING',
  'ENDLESS',
  'TRIALS',
  'PROLOGUE',
];

export const SPEED_BUCKET_LABELS: readonly [string, string, string, string, string] = [
  '< 3.0s',
  '3–6s',
  '6–10s',
  '10–15s',
  '15s+',
];

export interface AnalyticsFilterState {
  range: AnalyticsTimeRange;
  domainId: DomainId | null;
  subcatLabel: string | null;
  archetype: AnalyticsArchetype | null;
  peelTier: 1 | 2 | 3 | null;
  outcome: AnalyticsOutcomeFilter;
  speedBucket: AnalyticsSpeedBucketIndex | null;
  bucketKey: string | null;
}

export interface SubcategoryBreakdownRow {
  subcatLabel: string;
  right: number;
  wrong: number;
  total: number;
  accuracyPct: number;
  avgResponseMs: number;
}

export interface AnalyticsBarBucketPoint {
  bucketKey: string;
  label: string;
  sublabel: string;
  right: number;
  wrong: number;
  rollingAccPct: number;
  isSelected: boolean;
}

export interface AnalyticsEloPoint {
  label: string;
  elo: number;
  ts?: number;
  correct?: boolean;
}

export interface FilteredAnalyticsKpis {
  totalRight: number;
  totalWrong: number;
  totalAnswered: number;
  accuracyPct: number | null;
  avgResponseMs: number;
  totalPointsEarned: number;
  currentStreak: number;
  bestStreak: number;
  eloLatest: number;
  eloPeak: number;
  doubleDownCount: number;
  doubleDownWins: number;
  doubleDownMisses: number;
  doubleDownWinPct: number | null;
  safeLockWins: number;
  safeLockMisses: number;
  max6xWins: number;
  backfires: number;
  bestConsecutiveMax6xWins: number;
}

export interface FilteredAnalyticsView {
  filter: AnalyticsFilterState;
  hasActiveDimensionFilter: boolean;
  activeFilterCount: number;
  rangeTotalCount: number;
  filteredEvents: QuestionAnalyticsEvent[];
  kpis: FilteredAnalyticsKpis;
  barSeries: AnalyticsBarBucketPoint[];
  byDomain: DomainAnalyticsCounter[];
  subcategories: SubcategoryBreakdownRow[];
  eloSeries: AnalyticsEloPoint[];
  byArchetype: Record<AnalyticsArchetype, RightWrongCounter>;
  byPeelTier: Record<'1' | '2' | '3', RightWrongCounter>;
  speedBuckets: [
    RightWrongCounter,
    RightWrongCounter,
    RightWrongCounter,
    RightWrongCounter,
    RightWrongCounter,
  ];
  outcomeCounts: {
    all: number;
    right: number;
    wrong: number;
    doubleDown: number;
  };
  ledgerEvents: QuestionAnalyticsEvent[];
  usingLegacyAggregateFallback: boolean;
}

export function createDefaultAnalyticsFilter(
  range: AnalyticsTimeRange = 'ALL_TIME',
): AnalyticsFilterState {
  return {
    range,
    domainId: null,
    subcatLabel: null,
    archetype: null,
    peelTier: null,
    outcome: 'ALL',
    speedBucket: null,
    bucketKey: null,
  };
}

export function computeSpeedBucketIdx(responseTimeMs: number): AnalyticsSpeedBucketIndex {
  const ms = Number.isFinite(responseTimeMs) ? responseTimeMs : 5200;
  if (ms < 3000) return 0;
  if (ms < 6000) return 1;
  if (ms < 10000) return 2;
  if (ms < 15000) return 3;
  return 4;
}

export function isDoubleDownEvent(
  ev: Pick<QuestionAnalyticsEvent, 'overclockCharge01' | 'backfired'>,
): boolean {
  return (Number(ev.overclockCharge01) || 0) >= 0.08 || Boolean(ev.backfired);
}

const DOMAIN_FALLBACK_SUBCATS: Record<
  DomainId,
  { core: string; dial: string; myth: string; globe: string }
> = {
  0: { core: 'World Civilizations', dial: 'Historical Dates', myth: 'History Myths', globe: 'Historic Sites' },
  1: { core: 'Physics & Space', dial: 'Scientific Milestones', myth: 'Science Myths', globe: 'Observatories & Labs' },
  2: { core: 'World Capitals', dial: 'Geographic Extremes', myth: 'Geography Myths', globe: 'Atlas Pinpoints' },
  3: { core: 'Fine Arts & Literature', dial: 'Cultural Eras', myth: 'Art & Lit Myths', globe: 'Cultural Landmarks' },
  4: { core: 'Cinema & Music', dial: 'Pop Culture Years', myth: 'Entertainment Myths', globe: 'Film & Music Capitals' },
  5: { core: 'Championship Sports', dial: 'Sports Records', myth: 'Sports Myths', globe: 'Iconic Venues' },
  6: { core: 'Computing & Innovation', dial: 'Tech Breakthroughs', myth: 'Tech Myths', globe: 'Tech Hubs' },
  7: { core: 'Biology & Ecology', dial: 'Natural Milestones', myth: 'Nature Myths', globe: 'Biomes & Habitats' },
  8: { core: 'Global Politics & Law', dial: 'Treaty Timelines', myth: 'Civic Myths', globe: 'Diplomatic Capitals' },
  9: { core: 'Culinary & Craft', dial: 'Design Heritage', myth: 'Food & Design Myths', globe: 'Regional Origins' },
  10: { core: 'Philosophy & Myth', dial: 'Classical Antiquity', myth: 'Mythology Facts', globe: 'Ancient Temples' },
  11: { core: 'Logic & Economics', dial: 'Quantitative Estimates', myth: 'Logic Paradoxes', globe: 'Financial Centers' },
};

function inferDifficultyFromElo(elo: number): AnalyticsDifficultyTier {
  if (elo < 1120) return 'MIDDLE_SCHOOL';
  if (elo < 1260) return 'HIGH_SCHOOL';
  if (elo < 1440) return 'COLLEGE';
  if (elo < 1650) return 'GRADUATE';
  return 'MENSA';
}

function sanitizeSubcatText(raw?: string): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().replace(/\s+/g, ' ').slice(0, 44);
  return trimmed.length > 0 ? trimmed : null;
}

function synthesizeSubcatFallback(
  domainId: DomainId,
  archetype: AnalyticsArchetype,
  promptSnippet?: string,
): string {
  const snippet = (promptSnippet ?? '').toLowerCase();
  if (snippet) {
    if (domainId === 1) {
      if (/\b(planet|star|orbit|galaxy|nasa|moon|mars|apollo|telescope|space)\b/.test(snippet)) return 'Astronomy & Space';
      if (/\b(element|atom|molecule|chemical|periodic|acid|metal|oxygen|carbon)\b/.test(snippet)) return 'Chemistry';
      if (/\b(dna|cell|gene|species|brain|heart|blood|organ|vaccine)\b/.test(snippet)) return 'Biology & Medicine';
      if (/\b(quantum|light|gravity|energy|relativity|particle|electron|cern)\b/.test(snippet)) return 'Physics';
    } else if (domainId === 0) {
      if (/\b(war|battle|treaty|empire|king|queen|dynasty|roman|greek|egypt)\b/.test(snippet)) return 'Empires & Conflict';
      if (/\b(revolution|constitution|president|independence|congress|charter)\b/.test(snippet)) return 'Modern History';
    } else if (domainId === 5) {
      if (/\b(baseball|mlb|home run|pitcher|world series|fenway|wrigley)\b/.test(snippet)) return 'Baseball';
      if (/\b(olympic|marathon|medal|sprint|swim|gymnast)\b/.test(snippet)) return 'Olympics';
      if (/\b(world cup|fifa|soccer|football|goal|striker)\b/.test(snippet)) return 'World Football';
      if (/\b(nba|basketball|tennis|wimbledon|chess|grandmaster)\b/.test(snippet)) return 'Court & Board Sports';
    }
  }
  const map = DOMAIN_FALLBACK_SUBCATS[domainId] ?? DOMAIN_FALLBACK_SUBCATS[0];
  if (archetype === 'CALIBRATOR_DIAL') return map.dial;
  if (archetype === 'GAUNTLET_SHATTER') return map.myth;
  if (archetype === 'GLOBE_PIN_DROP') return map.globe;
  return map.core;
}

export function normalizeAnalyticsEvent(
  raw: Partial<QuestionAnalyticsEvent>,
): QuestionAnalyticsEvent {
  const ts = Number.isFinite(Number(raw.ts)) && Number(raw.ts) > 0 ? Math.floor(Number(raw.ts)) : Date.now();
  const dateKey =
    typeof raw.dateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.dateKey.trim())
      ? raw.dateKey.trim()
      : toUtcDateKey(ts);
  const domainId = clamp(Math.floor(Number(raw.domainId) || 0), 0, 11) as DomainId;
  const mode = normalizeMode(raw.mode);
  const archetype = normalizeArchetype(raw.archetype);
  const peelTier: 1 | 2 | 3 = raw.peelTier === 2 ? 2 : raw.peelTier === 3 ? 3 : 1;
  const ocCharge = clamp(Number(raw.overclockCharge01) || 0, 0, 1);
  const respMs = clamp(Math.round(Number(raw.responseTimeMs) || 5200), 150, 60000);
  const speedBucketIdx: AnalyticsSpeedBucketIndex =
    typeof raw.speedBucketIdx === 'number' &&
    Number.isInteger(raw.speedBucketIdx) &&
    raw.speedBucketIdx >= 0 &&
    raw.speedBucketIdx <= 4
      ? (raw.speedBucketIdx as AnalyticsSpeedBucketIndex)
      : computeSpeedBucketIdx(respMs);
  const eloAfter = clamp(Math.round(Number(raw.eloAfter) || 1200), 600, 2600);
  const rawPrompt = typeof raw.promptSnippet === 'string' ? raw.promptSnippet.trim().slice(0, 96) : '';
  const rawAnswer = typeof raw.answerLabel === 'string' ? raw.answerLabel.trim().slice(0, 48) : '';
  const subcatLabel =
    sanitizeSubcatText(raw.subcatLabel) ?? synthesizeSubcatFallback(domainId, archetype, rawPrompt);
  const difficultyTier =
    normalizeDifficultyTier(raw.difficultyTier) ?? inferDifficultyFromElo(eloAfter);
  const domMeta = getSovereignDomainMeta(domainId);
  const promptSnippet =
    rawPrompt || (rawAnswer ? `${subcatLabel}: ${rawAnswer}` : `${domMeta.shortName} · ${subcatLabel}`);

  return {
    ts,
    dateKey,
    qid: Math.max(0, Math.floor(Number(raw.qid) || 0)),
    domainId,
    mode,
    hubId: typeof raw.hubId === 'string' && raw.hubId.trim() ? raw.hubId.trim() : 'ch',
    archetype,
    correct: Boolean(raw.correct),
    peelTier,
    overclockCharge01: Number(ocCharge.toFixed(2)),
    backfired: Boolean(raw.backfired),
    bluffCalled: Boolean(raw.bluffCalled),
    bullseye: Boolean(raw.bullseye),
    responseTimeMs: respMs,
    pointsDelta: Math.max(0, Math.round(Number(raw.pointsDelta) || 0)),
    eloAfter,
    promptSnippet,
    answerLabel: rawAnswer || undefined,
    subcatLabel,
    difficultyTier,
    speedBucketIdx,
    clueLadderStep:
      raw.clueLadderStep === 1 || raw.clueLadderStep === 2 || raw.clueLadderStep === 3
        ? raw.clueLadderStep
        : undefined,
    mindGambitId: typeof raw.mindGambitId === 'string' && raw.mindGambitId ? raw.mindGambitId : undefined,
  };
}

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function toUtcDateKey(ts: number): string {
  try {
    return new Date(ts).toISOString().slice(0, 10);
  } catch {
    return '2026-11-22';
  }
}

function normalizeMode(raw?: string, isBlackSalon?: boolean): AnalyticsGameMode {
  if (isBlackSalon) return 'TRIALS';
  const up = (raw ?? 'CAMPAIGN').toUpperCase();
  if (up === 'BLACK_SALON' || up === 'GHOST_TRIALS') {
    return 'TRIALS';
  }
  if (
    up === 'PROLOGUE' ||
    up === 'CAMPAIGN' ||
    up === 'DAILY' ||
    up === 'BRIEFING' ||
    up === 'ENDLESS' ||
    up === 'TRIALS'
  ) {
    return up;
  }
  return 'CAMPAIGN';
}

function normalizeDifficultyTier(raw?: string): AnalyticsDifficultyTier | null {
  if (!raw) return null;
  const up = raw.trim().toUpperCase();
  if (up === 'MIDDLE_SCHOOL' || up === 'MID_SCHOOL' || up === 'EASY') return 'MIDDLE_SCHOOL';
  if (up === 'HIGH_SCHOOL') return 'HIGH_SCHOOL';
  if (up === 'COLLEGE' || up === 'MEDIUM') return 'COLLEGE';
  if (up === 'GRADUATE' || up === 'HARD') return 'GRADUATE';
  if (up === 'MENSA' || up === 'GENIUS') return 'MENSA';
  return null;
}

function createEmptyDifficultyMap(): Record<AnalyticsDifficultyTier, number> {
  return {
    MIDDLE_SCHOOL: 0,
    HIGH_SCHOOL: 0,
    COLLEGE: 0,
    GRADUATE: 0,
    MENSA: 0,
  };
}

function normalizeArchetype(raw?: string): AnalyticsArchetype {
  const up = (raw ?? 'SIGHTLINE_LOCK').toUpperCase();
  if (
    up === 'SIGHTLINE_LOCK' ||
    up === 'CODEX_DUAL_RING' ||
    up === 'CALIBRATOR_DIAL' ||
    up === 'GAUNTLET_SHATTER' ||
    up === 'HERO_ARTIFACT_SYNTHESIS' ||
    up === 'GLOBE_PIN_DROP'
  ) {
    return up;
  }
  return 'SIGHTLINE_LOCK';
}

function createDefaultState(): CareerAnalyticsState {
  const byDomain: DomainAnalyticsCounter[] = Array.from({ length: 12 }, () => ({
    right: 0,
    wrong: 0,
    totalResponseMs: 0,
    peakElo: 1200,
    lastElo: 1200,
  }));

  const byArchetype: Record<AnalyticsArchetype, RightWrongCounter> = {
    SIGHTLINE_LOCK: { right: 0, wrong: 0 },
    CODEX_DUAL_RING: { right: 0, wrong: 0 },
    CALIBRATOR_DIAL: { right: 0, wrong: 0 },
    GAUNTLET_SHATTER: { right: 0, wrong: 0 },
    HERO_ARTIFACT_SYNTHESIS: { right: 0, wrong: 0 },
    GLOBE_PIN_DROP: { right: 0, wrong: 0 },
  };

  const byPeelTier: Record<'1' | '2' | '3', RightWrongCounter> = {
    '1': { right: 0, wrong: 0 },
    '2': { right: 0, wrong: 0 },
    '3': { right: 0, wrong: 0 },
  };

  const byMode = {} as Record<AnalyticsGameMode, ModeAnalyticsCounter>;
  for (const m of ALL_ANALYTICS_MODES) {
    byMode[m] = { right: 0, wrong: 0, matchesPlayed: 0, matchesWon: 0, bestScore: 0 };
  }

  return {
    schemaVersion: 1,
    backfilledFromLegacy: false,
    totalRight: 0,
    totalWrong: 0,
    totalResponseMs: 0,
    totalPointsEarned: 0,
    currentStreak: 0,
    bestStreak: 0,
    fastUnder3sStreak: 0,
    bestFastUnder3sStreak: 0,
    globalEloLatest: 1200,
    globalEloPeak: 1200,
    uniqueSolvedQids: [],
    uniqueSolvedCount: 0,
    byDomain,
    byArchetype,
    byPeelTier,
    byMode,
    speedBuckets: [
      { right: 0, wrong: 0 },
      { right: 0, wrong: 0 },
      { right: 0, wrong: 0 },
      { right: 0, wrong: 0 },
      { right: 0, wrong: 0 },
    ],
    overclock: {
      safeLockWins: 0,
      safeLockMisses: 0,
      overclockWins: 0,
      overclockMisses: 0,
      max6xWins: 0,
      backfires: 0,
      consecutiveMax6xWins: 0,
      bestConsecutiveMax6xWins: 0,
      currentMatchMax6xWins: 0,
      currentMatchPeelsUsed: 0,
    },
    feats: {
      passportStamped: false,
      prologueCleared: false,
      act1Cleared: false,
      campaignCompleted: false,
      rivalBluffsCaught: 0,
      sorenCoinBluffDefeated: false,
      bluffEchoCancels: 0,
      uvScansCount: 0,
      scannedRelicIds: [],
      openedLatchKeys: [],
      atelierFinishesEquipped: 0,
      backstageInterrogations: 0,
      factionPledged: false,
      flawlessBossWins: 0,
      unpeeledBossWins: 0,
      perfectMatchesCount: 0,
      max3x6xInSingleMatch: false,
      calibratorBullseyes: 0,
      codexFirstTryLocks: 0,
      ghostTrialWins: 0,
      blackSalonWins: 0,
      dailyBroadcastsCompleted: 0,
      completedDailyDates: [],
      maxEndlessDepth: 0,
      achievedEndings: [],
      difficultyRoundsCleared: createEmptyDifficultyMap(),
      difficultyBestAccuracyPct: createEmptyDifficultyMap(),
      globeBullseyes300Km: 0,
      globeNoPeel120Km: 0,
      visualBlueprintsSolved: 0,
      tier1ColdDomains: [],
      duelChallengesPlayed: 0,
      duelGhostWins: 0,
      srsReviewsCompleted: 0,
      offlinePacksCached: 0,
      clueLadderStep1Snipes: 0,
      mindGambitsActivated: 0,
      secondWindSaves: 0,
      finaleCategoryWins: 0,
    },
    dailyBuckets: {},
    sessions: [],
    events: [],
  };
}

export class CareerAnalyticsStore {
  private state: CareerAnalyticsState;
  private readonly listeners = new Set<(snap: CareerAnalyticsState) => void>();

  constructor(passport?: PassportSystem) {
    this.state = this.load();
    if (passport) {
      this.syncAndBackfillFromProfile(passport);
    }
  }

  private load(): CareerAnalyticsState {
    const defaults = createDefaultState();
    try {
      if (typeof localStorage === 'undefined') return defaults;
      const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<CareerAnalyticsState> | null;
      if (!parsed || typeof parsed !== 'object') return defaults;

      const byDomain =
        Array.isArray(parsed.byDomain) && parsed.byDomain.length === 12
          ? parsed.byDomain.map((d) => ({
              right: Math.max(0, Math.floor(Number(d?.right) || 0)),
              wrong: Math.max(0, Math.floor(Number(d?.wrong) || 0)),
              totalResponseMs: Math.max(0, Math.floor(Number(d?.totalResponseMs) || 0)),
              peakElo: clamp(Math.round(Number(d?.peakElo) || 1200), 600, 2600),
              lastElo: clamp(Math.round(Number(d?.lastElo) || 1200), 600, 2600),
            }))
          : defaults.byDomain;

      const byArchetype = { ...defaults.byArchetype };
      if (parsed.byArchetype && typeof parsed.byArchetype === 'object') {
        for (const arch of ALL_ANALYTICS_ARCHETYPES) {
          const src = parsed.byArchetype[arch];
          if (src) {
            byArchetype[arch] = {
              right: Math.max(0, Math.floor(Number(src.right) || 0)),
              wrong: Math.max(0, Math.floor(Number(src.wrong) || 0)),
            };
          }
        }
      }

      const byPeelTier = { ...defaults.byPeelTier };
      if (parsed.byPeelTier && typeof parsed.byPeelTier === 'object') {
        for (const k of ['1', '2', '3'] as const) {
          const src = parsed.byPeelTier[k];
          if (src) {
            byPeelTier[k] = {
              right: Math.max(0, Math.floor(Number(src.right) || 0)),
              wrong: Math.max(0, Math.floor(Number(src.wrong) || 0)),
            };
          }
        }
      }

      const byMode = { ...defaults.byMode };
      if (parsed.byMode && typeof parsed.byMode === 'object') {
        for (const m of ALL_ANALYTICS_MODES) {
          const src = parsed.byMode[m];
          if (src) {
            byMode[m] = {
              right: Math.max(0, Math.floor(Number(src.right) || 0)),
              wrong: Math.max(0, Math.floor(Number(src.wrong) || 0)),
              matchesPlayed: Math.max(0, Math.floor(Number(src.matchesPlayed) || 0)),
              matchesWon: Math.max(0, Math.floor(Number(src.matchesWon) || 0)),
              bestScore: Math.max(0, Math.floor(Number(src.bestScore) || 0)),
            };
          }
        }
      }

      const speedBuckets = defaults.speedBuckets.map((def, idx) => {
        const src = Array.isArray(parsed.speedBuckets) ? parsed.speedBuckets[idx] : null;
        return {
          right: Math.max(0, Math.floor(Number(src?.right) || def.right)),
          wrong: Math.max(0, Math.floor(Number(src?.wrong) || def.wrong)),
        };
      }) as CareerAnalyticsState['speedBuckets'];

      return {
        schemaVersion: 1,
        backfilledFromLegacy: Boolean(parsed.backfilledFromLegacy),
        totalRight: Math.max(0, Math.floor(Number(parsed.totalRight) || 0)),
        totalWrong: Math.max(0, Math.floor(Number(parsed.totalWrong) || 0)),
        totalResponseMs: Math.max(0, Math.floor(Number(parsed.totalResponseMs) || 0)),
        totalPointsEarned: Math.max(0, Math.floor(Number(parsed.totalPointsEarned) || 0)),
        currentStreak: Math.max(0, Math.floor(Number(parsed.currentStreak) || 0)),
        bestStreak: Math.max(0, Math.floor(Number(parsed.bestStreak) || 0)),
        fastUnder3sStreak: Math.max(0, Math.floor(Number(parsed.fastUnder3sStreak) || 0)),
        bestFastUnder3sStreak: Math.max(0, Math.floor(Number(parsed.bestFastUnder3sStreak) || 0)),
        globalEloLatest: clamp(Math.round(Number(parsed.globalEloLatest) || 1200), 600, 2600),
        globalEloPeak: clamp(Math.round(Number(parsed.globalEloPeak) || 1200), 600, 2600),
        uniqueSolvedQids: Array.isArray(parsed.uniqueSolvedQids)
          ? parsed.uniqueSolvedQids.slice(-MAX_STORED_UNIQUE_QIDS)
          : [],
        uniqueSolvedCount: Math.max(0, Math.floor(Number(parsed.uniqueSolvedCount) || 0)),
        byDomain,
        byArchetype,
        byPeelTier,
        byMode,
        speedBuckets,
        overclock: {
          ...defaults.overclock,
          ...(parsed.overclock ?? {}),
        },
        feats: {
          ...defaults.feats,
          ...(parsed.feats ?? {}),
          scannedRelicIds: Array.isArray(parsed.feats?.scannedRelicIds)
            ? parsed.feats!.scannedRelicIds
            : [],
          openedLatchKeys: Array.isArray(parsed.feats?.openedLatchKeys)
            ? parsed.feats!.openedLatchKeys
            : [],
          achievedEndings: Array.isArray(parsed.feats?.achievedEndings)
            ? parsed.feats!.achievedEndings
            : [],
          completedDailyDates: Array.isArray(parsed.feats?.completedDailyDates)
            ? parsed.feats!.completedDailyDates.filter((d): d is string => typeof d === 'string').slice(-365)
            : [],
          difficultyRoundsCleared: {
            ...createEmptyDifficultyMap(),
            ...(parsed.feats?.difficultyRoundsCleared ?? {}),
          },
          difficultyBestAccuracyPct: {
            ...createEmptyDifficultyMap(),
            ...(parsed.feats?.difficultyBestAccuracyPct ?? {}),
          },
          globeBullseyes300Km: Math.max(0, Math.floor(Number(parsed.feats?.globeBullseyes300Km) || 0)),
          globeNoPeel120Km: Math.max(0, Math.floor(Number(parsed.feats?.globeNoPeel120Km) || 0)),
          visualBlueprintsSolved: Math.max(0, Math.floor(Number(parsed.feats?.visualBlueprintsSolved) || 0)),
          tier1ColdDomains: Array.isArray(parsed.feats?.tier1ColdDomains)
            ? parsed.feats!.tier1ColdDomains
                .map((n) => Math.floor(Number(n)))
                .filter((n) => Number.isFinite(n) && n >= 0 && n <= 11)
            : [],
          duelChallengesPlayed: Math.max(0, Math.floor(Number(parsed.feats?.duelChallengesPlayed) || 0)),
          duelGhostWins: Math.max(0, Math.floor(Number(parsed.feats?.duelGhostWins) || 0)),
          srsReviewsCompleted: Math.max(0, Math.floor(Number(parsed.feats?.srsReviewsCompleted) || 0)),
          offlinePacksCached: Math.max(0, Math.floor(Number(parsed.feats?.offlinePacksCached) || 0)),
          clueLadderStep1Snipes: Math.max(0, Math.floor(Number(parsed.feats?.clueLadderStep1Snipes) || 0)),
          mindGambitsActivated: Math.max(0, Math.floor(Number(parsed.feats?.mindGambitsActivated) || 0)),
          secondWindSaves: Math.max(0, Math.floor(Number(parsed.feats?.secondWindSaves) || 0)),
          finaleCategoryWins: Math.max(0, Math.floor(Number(parsed.feats?.finaleCategoryWins) || 0)),
        },
        dailyBuckets:
          parsed.dailyBuckets && typeof parsed.dailyBuckets === 'object'
            ? parsed.dailyBuckets
            : {},
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions.slice(-MAX_SESSIONS) : [],
        events: Array.isArray(parsed.events)
          ? parsed.events
              .slice(-MAX_RING_EVENTS)
              .map((ev) => normalizeAnalyticsEvent(ev))
          : [],
      };
    } catch {
      return defaults;
    }
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignore private browsing quota errors
    }
    const snap = this.getSnapshot();
    for (const fn of this.listeners) {
      fn(snap);
    }
  }

  public subscribe(listener: (snap: CareerAnalyticsState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Backfills initial career right/wrong, ELO, and visa/daily milestones from `PassportSystem` & `ForgeEngine`
   * if the user already played rounds prior to Wave-3 Analytics installation!
   */
  public syncAndBackfillFromProfile(passport: PassportSystem): void {
    // Sync if external storage was seeded/updated (e.g. multi-tab or save restore)
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<CareerAnalyticsState> | null;
          if (
            parsed &&
            Array.isArray(parsed.events) &&
            parsed.events.length > this.state.events.length
          ) {
            this.state = this.load();
          }
        }
      }
    } catch {
      // Ignore storage inspection issues
    }

    const pSnap = passport.getSnapshot();
    const skill = forgeEngine.getSkillSnapshot();
    let dirty = false;

    if (pSnap.persona || pSnap.hasCustomName) {
      if (!this.state.feats.passportStamped && pSnap.persona) {
        this.state.feats.passportStamped = true;
        dirty = true;
      }
    }
    if (pSnap.visas.ch?.cleared && !this.state.feats.prologueCleared) {
      this.state.feats.prologueCleared = true;
      dirty = true;
    }
    if ((pSnap.visas.gb?.cleared && pSnap.visas.jp?.cleared) && !this.state.feats.act1Cleared) {
      this.state.feats.act1Cleared = true;
      dirty = true;
    }
    if (pSnap.visas.global?.cleared && !this.state.feats.campaignCompleted) {
      this.state.feats.campaignCompleted = true;
      dirty = true;
    }
    for (const dh of pSnap.dailyHistory) {
      if (dh?.utcDate && !this.state.feats.completedDailyDates.includes(dh.utcDate)) {
        this.state.feats.completedDailyDates.push(dh.utcDate);
        dirty = true;
      }
    }
    if (this.state.feats.completedDailyDates.length > 365) {
      this.state.feats.completedDailyDates = this.state.feats.completedDailyDates.slice(-365);
    }
    if (pSnap.dailyHistory.length > this.state.feats.dailyBroadcastsCompleted) {
      this.state.feats.dailyBroadcastsCompleted = pSnap.dailyHistory.length;
      dirty = true;
    }

    // Sync live domain ELO peaks
    for (let i = 0; i < 12; i++) {
      const elo = Math.max(pSnap.domainElo[i] ?? 1200, skill.domainElo[i] ?? 1200);
      if (elo !== this.state.byDomain[i].lastElo) {
        this.state.byDomain[i].lastElo = elo;
        this.state.byDomain[i].peakElo = Math.max(this.state.byDomain[i].peakElo, elo);
        dirty = true;
      }
    }

    if (skill.globalElo > 0 && skill.totalAnswered > 0) {
      this.state.globalEloLatest = skill.globalElo;
      this.state.globalEloPeak = Math.max(this.state.globalEloPeak, skill.globalElo);
    }

    // Backfill historical right/wrong counts once if store was empty on an existing profile
    const totalStored = this.state.totalRight + this.state.totalWrong;
    if (!this.state.backfilledFromLegacy && totalStored === 0 && skill.totalAnswered > 0) {
      this.state.backfilledFromLegacy = true;
      this.state.totalRight = Math.max(0, skill.totalCorrect);
      this.state.totalWrong = Math.max(0, skill.totalAnswered - skill.totalCorrect);
      this.state.bestStreak = Math.max(this.state.bestStreak, skill.bestStreak);
      this.state.currentStreak = skill.currentStreak;
      this.state.uniqueSolvedCount = Math.max(this.state.uniqueSolvedCount, skill.totalCorrect);

      for (let i = 0; i < 12; i++) {
        const att = skill.domainAttempts[i] ?? 0;
        const cor = skill.domainCorrect[i] ?? 0;
        this.state.byDomain[i].right = cor;
        this.state.byDomain[i].wrong = Math.max(0, att - cor);
      }

      const todayKey = toUtcDateKey(Date.now());
      this.state.dailyBuckets[todayKey] = {
        dateKey: todayKey,
        right: this.state.totalRight,
        wrong: this.state.totalWrong,
        totalResponseMs: skill.totalAnswered * 5800,
        maxStreak: skill.bestStreak,
        pointsEarned: this.state.totalRight * 2400,
        max6xWins: 0,
        backfires: 0,
        eloEnd: skill.globalElo,
      };
      dirty = true;
    }

    if (dirty) {
      this.save();
    }
  }

  public getSnapshot(): CareerAnalyticsState {
    return {
      ...this.state,
      byDomain: this.state.byDomain.map((d) => ({ ...d })),
      byArchetype: {
        SIGHTLINE_LOCK: { ...this.state.byArchetype.SIGHTLINE_LOCK },
        CODEX_DUAL_RING: { ...this.state.byArchetype.CODEX_DUAL_RING },
        CALIBRATOR_DIAL: { ...this.state.byArchetype.CALIBRATOR_DIAL },
        GAUNTLET_SHATTER: { ...this.state.byArchetype.GAUNTLET_SHATTER },
        HERO_ARTIFACT_SYNTHESIS: { ...this.state.byArchetype.HERO_ARTIFACT_SYNTHESIS },
        GLOBE_PIN_DROP: { ...this.state.byArchetype.GLOBE_PIN_DROP },
      },
      byPeelTier: {
        '1': { ...this.state.byPeelTier['1'] },
        '2': { ...this.state.byPeelTier['2'] },
        '3': { ...this.state.byPeelTier['3'] },
      },
      byMode: {
        CAMPAIGN: { ...this.state.byMode.CAMPAIGN },
        DAILY: { ...this.state.byMode.DAILY },
        BRIEFING: { ...this.state.byMode.BRIEFING },
        ENDLESS: { ...this.state.byMode.ENDLESS },
        TRIALS: { ...this.state.byMode.TRIALS },
        PROLOGUE: { ...this.state.byMode.PROLOGUE },
      },
      speedBuckets: this.state.speedBuckets.map((b) => ({ ...b })) as CareerAnalyticsState['speedBuckets'],
      overclock: { ...this.state.overclock },
      feats: {
        ...this.state.feats,
        scannedRelicIds: [...this.state.feats.scannedRelicIds],
        openedLatchKeys: [...this.state.feats.openedLatchKeys],
        achievedEndings: [...this.state.feats.achievedEndings],
        completedDailyDates: [...this.state.feats.completedDailyDates],
        difficultyRoundsCleared: { ...this.state.feats.difficultyRoundsCleared },
        difficultyBestAccuracyPct: { ...this.state.feats.difficultyBestAccuracyPct },
        tier1ColdDomains: [...this.state.feats.tier1ColdDomains],
      },
      dailyBuckets: { ...this.state.dailyBuckets },
      sessions: [...this.state.sessions],
      events: [...this.state.events],
    };
  }

  /**
   * Records a single live question resolution across ANY of the 5 modes + Geneva Prologue!
   */
  public recordQuestionOutcome(input: QuestionAnalyticsInput): CareerAnalyticsState {
    const ts = input.ts ?? Date.now();
    const dateKey = toUtcDateKey(ts);
    const domainId = clamp(Math.floor(Number(input.domainId) || 0), 0, 11) as DomainId;
    const mode = normalizeMode(input.mode);
    const archetype = normalizeArchetype(input.archetype);
    const peelTier: 1 | 2 | 3 =
      input.peelTier === 2 ? 2 : input.peelTier === 3 ? 3 : 1;
    const ocCharge = clamp(Number(input.overclockCharge01) || 0, 0, 1);
    const wasOverclocked = ocCharge >= 0.08;
    const isMax6x = ocCharge >= 0.88 && peelTier === 1;
    const backfired = Boolean(input.backfired) || (!input.correct && wasOverclocked);
    const respMs = clamp(Math.round(Number(input.responseTimeMs) || 5200), 150, 60000);
    const speedIdx: AnalyticsSpeedBucketIndex =
      typeof input.speedBucketIdx === 'number' &&
      Number.isInteger(input.speedBucketIdx) &&
      input.speedBucketIdx >= 0 &&
      input.speedBucketIdx <= 4
        ? input.speedBucketIdx
        : computeSpeedBucketIdx(respMs);
    const pts = Math.max(0, Math.round(Number(input.pointsDelta) || 0));

    const skillSnap = forgeEngine.getSkillSnapshot();
    const eloAfter = clamp(
      Math.round(Number(input.eloAfter) || skillSnap.globalElo || this.state.globalEloLatest),
      600,
      2600,
    );
    const difficultyTier =
      normalizeDifficultyTier(input.difficultyTier) ?? inferDifficultyFromElo(eloAfter);
    const rawPrompt = input.promptSnippet?.trim().slice(0, 96);
    const subcatLabel =
      sanitizeSubcatText(input.subcatLabel) ??
      synthesizeSubcatFallback(domainId, archetype, rawPrompt);
    const domMeta = getSovereignDomainMeta(domainId);
    const promptSnippet =
      rawPrompt ||
      (input.answerLabel ? `${subcatLabel}: ${input.answerLabel.slice(0, 44)}` : `${domMeta.shortName} · ${subcatLabel}`);

    const ev: QuestionAnalyticsEvent = {
      ts,
      dateKey,
      qid: Math.max(0, Math.floor(Number(input.qid) || 0)),
      domainId,
      mode,
      hubId: input.hubId ?? 'ch',
      archetype,
      correct: Boolean(input.correct),
      peelTier,
      overclockCharge01: Number(ocCharge.toFixed(2)),
      backfired,
      bluffCalled: Boolean(input.bluffCalled),
      bullseye: Boolean(input.bullseye),
      responseTimeMs: respMs,
      pointsDelta: pts,
      eloAfter,
      promptSnippet,
      answerLabel: input.answerLabel?.slice(0, 48),
      subcatLabel,
      difficultyTier,
      speedBucketIdx: speedIdx,
      clueLadderStep:
        input.clueLadderStep === 1 || input.clueLadderStep === 2 || input.clueLadderStep === 3
          ? input.clueLadderStep
          : undefined,
      mindGambitId: input.mindGambitId?.trim() || undefined,
    };

    this.state.events.push(ev);
    if (this.state.events.length > MAX_RING_EVENTS) {
      this.state.events.splice(0, this.state.events.length - MAX_RING_EVENTS);
    }

    this.state.totalResponseMs += respMs;
    this.state.totalPointsEarned += pts;
    this.state.globalEloLatest = eloAfter;
    this.state.globalEloPeak = Math.max(this.state.globalEloPeak, eloAfter);

    if (peelTier > 1) {
      this.state.overclock.currentMatchPeelsUsed += 1;
    }
    if (input.bluffEchoCancelled) {
      this.state.feats.bluffEchoCancels += 1;
    }
    if (input.bluffCalled) {
      this.state.feats.rivalBluffsCaught += 1;
    }
    if (ev.correct && input.clueLadderStep === 1) {
      this.state.feats.clueLadderStep1Snipes += 1;
    }
    if (input.mindGambitTriggered) {
      this.state.feats.mindGambitsActivated += 1;
    }
    if (ev.correct && input.finaleCategoryPicked) {
      this.state.feats.finaleCategoryWins += 1;
    }

    const domBucket = this.state.byDomain[domainId];
    domBucket.totalResponseMs += respMs;
    const domElo = skillSnap.domainElo[domainId] ?? domBucket.lastElo;
    domBucket.lastElo = domElo;
    domBucket.peakElo = Math.max(domBucket.peakElo, domElo);

    const tierKey = String(peelTier) as '1' | '2' | '3';

    if (ev.correct) {
      this.state.totalRight += 1;
      this.state.currentStreak += 1;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.currentStreak);

      if (respMs < 3000) {
        this.state.fastUnder3sStreak += 1;
        this.state.bestFastUnder3sStreak = Math.max(
          this.state.bestFastUnder3sStreak,
          this.state.fastUnder3sStreak,
        );
      } else {
        this.state.fastUnder3sStreak = 0;
      }

      if (ev.qid > 0 && !this.state.uniqueSolvedQids.includes(ev.qid)) {
        this.state.uniqueSolvedQids.push(ev.qid);
        if (this.state.uniqueSolvedQids.length > MAX_STORED_UNIQUE_QIDS) {
          this.state.uniqueSolvedQids.shift();
        }
        this.state.uniqueSolvedCount += 1;
      }

      domBucket.right += 1;
      this.state.byArchetype[archetype].right += 1;
      this.state.byPeelTier[tierKey].right += 1;
      this.state.byMode[mode].right += 1;
      this.state.speedBuckets[speedIdx].right += 1;

      if (ev.bullseye && archetype === 'CALIBRATOR_DIAL') {
        this.state.feats.calibratorBullseyes += 1;
      }
      if (archetype === 'GLOBE_PIN_DROP') {
        const distKm =
          typeof input.globeDistanceKm === 'number' && Number.isFinite(input.globeDistanceKm)
            ? Math.max(0, input.globeDistanceKm)
            : null;
        if (ev.bullseye || (distKm !== null && distKm <= 300)) {
          this.state.feats.globeBullseyes300Km += 1;
        }
        if (peelTier === 1 && distKm !== null && distKm <= 120) {
          this.state.feats.globeNoPeel120Km += 1;
        }
      }
      if (input.hasVisualPlate) {
        this.state.feats.visualBlueprintsSolved += 1;
      }
      if (peelTier === 1 && !this.state.feats.tier1ColdDomains.includes(domainId)) {
        this.state.feats.tier1ColdDomains.push(domainId);
      }
      if (archetype === 'CODEX_DUAL_RING' && (input.firstTryCodex ?? peelTier === 1)) {
        this.state.feats.codexFirstTryLocks += 1;
      }

      if (wasOverclocked) {
        this.state.overclock.overclockWins += 1;
        if (isMax6x) {
          this.state.overclock.max6xWins += 1;
          this.state.overclock.consecutiveMax6xWins += 1;
          this.state.overclock.bestConsecutiveMax6xWins = Math.max(
            this.state.overclock.bestConsecutiveMax6xWins,
            this.state.overclock.consecutiveMax6xWins,
          );
          this.state.overclock.currentMatchMax6xWins += 1;
          if (this.state.overclock.currentMatchMax6xWins >= 3) {
            this.state.feats.max3x6xInSingleMatch = true;
          }
        }
      } else {
        this.state.overclock.safeLockWins += 1;
      }
    } else {
      this.state.totalWrong += 1;
      this.state.currentStreak = 0;
      this.state.fastUnder3sStreak = 0;

      domBucket.wrong += 1;
      this.state.byArchetype[archetype].wrong += 1;
      this.state.byPeelTier[tierKey].wrong += 1;
      this.state.byMode[mode].wrong += 1;
      this.state.speedBuckets[speedIdx].wrong += 1;

      if (wasOverclocked) {
        this.state.overclock.overclockMisses += 1;
        this.state.overclock.consecutiveMax6xWins = 0;
      } else {
        this.state.overclock.safeLockMisses += 1;
      }
      if (backfired) {
        this.state.overclock.backfires += 1;
        this.state.overclock.consecutiveMax6xWins = 0;
      }
    }

    // Update Daily Bucket
    const existingDay = this.state.dailyBuckets[dateKey] ?? {
      dateKey,
      right: 0,
      wrong: 0,
      totalResponseMs: 0,
      maxStreak: 0,
      pointsEarned: 0,
      max6xWins: 0,
      backfires: 0,
      eloEnd: eloAfter,
    };
    if (ev.correct) existingDay.right += 1;
    else existingDay.wrong += 1;
    existingDay.totalResponseMs += respMs;
    existingDay.maxStreak = Math.max(existingDay.maxStreak, this.state.currentStreak);
    existingDay.pointsEarned += pts;
    if (ev.correct && isMax6x) existingDay.max6xWins += 1;
    if (backfired) existingDay.backfires += 1;
    existingDay.eloEnd = eloAfter;
    this.state.dailyBuckets[dateKey] = existingDay;

    // Trim daily buckets beyond 365 days if ever needed
    const dayKeys = Object.keys(this.state.dailyBuckets).sort();
    if (dayKeys.length > 365) {
      delete this.state.dailyBuckets[dayKeys[0]];
    }

    this.save();
    return this.getSnapshot();
  }

  /**
   * Records match/session completion & checks match-level feats (Flawless Boss, Unpeeled Sovereign, Perfect 5/5, etc.).
   */
  public recordMatchCompleted(input: MatchCompletedAnalyticsInput): CareerAnalyticsState {
    const ts = Date.now();
    const dateKey = toUtcDateKey(ts);
    const isBlackSalon = Boolean(input.isBlackSalon) || (input.mode ?? '').toUpperCase() === 'BLACK_SALON';
    const mode = normalizeMode(input.mode, isBlackSalon);
    const skillSnap = forgeEngine.getSkillSnapshot();
    const eloAfter = clamp(
      Math.round(Number(input.eloAfter) || skillSnap.globalElo || this.state.globalEloLatest),
      600,
      2600,
    );

    const right = Math.max(0, Math.floor(Number(input.correctCount) || 0));
    const total = Math.max(right, Math.floor(Number(input.totalQuestions) || right));
    const wrong = Math.max(0, total - right);
    const peelsUsed =
      input.peelsUsed !== undefined
        ? input.peelsUsed
        : this.state.overclock.currentMatchPeelsUsed;
    const max6xInMatch =
      input.max6xOverclockWinsInMatch !== undefined
        ? input.max6xOverclockWinsInMatch
        : this.state.overclock.currentMatchMax6xWins;
    const shieldsLost = Math.max(0, Math.floor(Number(input.shieldsLost) || 0));

    const modeCounter = this.state.byMode[mode];
    modeCounter.matchesPlayed += 1;
    if (input.won) modeCounter.matchesWon += 1;
    modeCounter.bestScore = Math.max(modeCounter.bestScore, Math.round(input.score || 0));

    if (total >= 5 && right === total) {
      this.state.feats.perfectMatchesCount += 1;
    }
    if (max6xInMatch >= 3) {
      this.state.feats.max3x6xInSingleMatch = true;
    }

    if (mode === 'PROLOGUE' && input.won) {
      this.state.feats.prologueCleared = true;
    }
    if (mode === 'DAILY' && !input.isReplay) {
      const dailyKey = (input.utcDate && input.utcDate.trim()) || dateKey;
      if (!this.state.feats.completedDailyDates.includes(dailyKey)) {
        this.state.feats.completedDailyDates.push(dailyKey);
        if (this.state.feats.completedDailyDates.length > 365) {
          this.state.feats.completedDailyDates.shift();
        }
        this.state.feats.dailyBroadcastsCompleted = Math.max(
          this.state.feats.dailyBroadcastsCompleted + 1,
          this.state.feats.completedDailyDates.length,
        );
      }
    }
    if (mode === 'ENDLESS' && input.endlessDepthReached) {
      this.state.feats.maxEndlessDepth = Math.max(
        this.state.feats.maxEndlessDepth,
        Math.floor(input.endlessDepthReached),
      );
    }
    if (mode === 'TRIALS' && input.won) {
      this.state.feats.ghostTrialWins += 1;
      if (isBlackSalon) {
        this.state.feats.blackSalonWins += 1;
      }
    }
    if (input.won && input.isBossShowdown) {
      if (shieldsLost === 0) {
        this.state.feats.flawlessBossWins += 1;
      }
      if (peelsUsed === 0) {
        this.state.feats.unpeeledBossWins += 1;
      }
    }
    if (input.won && input.defeatedRivalId === 'soren' && input.sorenCoinTellCaughtInMatch) {
      this.state.feats.sorenCoinBluffDefeated = true;
    }
    if (input.endingUnlocked && !this.state.feats.achievedEndings.includes(input.endingUnlocked)) {
      this.state.feats.achievedEndings.push(input.endingUnlocked);
      this.state.feats.campaignCompleted = true;
    }

    const diffTier = normalizeDifficultyTier(input.difficultyPreset ?? input.difficultyTier);
    if (diffTier && total > 0) {
      const accPct = Math.round((right / total) * 100);
      this.state.feats.difficultyBestAccuracyPct[diffTier] = Math.max(
        this.state.feats.difficultyBestAccuracyPct[diffTier] ?? 0,
        accPct,
      );
      if (diffTier === 'MIDDLE_SCHOOL' || input.won || accPct >= 50) {
        this.state.feats.difficultyRoundsCleared[diffTier] =
          (this.state.feats.difficultyRoundsCleared[diffTier] ?? 0) + 1;
      }
    }
    if (input.mindGambitUsed) {
      this.state.feats.mindGambitsActivated += 1;
    }
    if (input.secondWindTriggered) {
      this.state.feats.secondWindSaves += 1;
    }
    if (input.finaleCategoryWon) {
      this.state.feats.finaleCategoryWins += 1;
    }

    this.state.sessions.push({
      ts,
      dateKey,
      mode,
      hubId: input.hubId,
      won: Boolean(input.won),
      right,
      wrong,
      score: Math.max(0, Math.round(input.score || 0)),
      eloAfter,
      maxOverclockWinsInMatch: max6xInMatch,
      peelsUsedInMatch: peelsUsed,
      shieldsLostInMatch: shieldsLost,
      isBossShowdown: Boolean(input.isBossShowdown),
      isBlackSalon,
    });
    if (this.state.sessions.length > MAX_SESSIONS) {
      this.state.sessions.splice(0, this.state.sessions.length - MAX_SESSIONS);
    }

    // Reset per-match accumulators for next match
    this.state.overclock.currentMatchMax6xWins = 0;
    this.state.overclock.currentMatchPeelsUsed = 0;

    this.save();
    return this.getSnapshot();
  }

  /**
   * Records discrete narrative, forensic, & workshop actions for the 64 Trophies & Medals!
   */
  public recordSpecialFeat(
    kind: SpecialFeatKind,
    detail?: { relicId?: string; latchCount?: number; endingId?: EndingId; depth?: number },
  ): CareerAnalyticsState {
    switch (kind) {
      case 'PASSPORT_STAMPED':
        this.state.feats.passportStamped = true;
        break;
      case 'PROLOGUE_CLEARED':
        this.state.feats.prologueCleared = true;
        break;
      case 'RIVAL_BLUFF_CAUGHT':
        this.state.feats.rivalBluffsCaught += 1;
        break;
      case 'SOREN_COIN_BLUFF_DEFEATED':
        this.state.feats.sorenCoinBluffDefeated = true;
        break;
      case 'BLUFF_ECHO_CANCEL':
        this.state.feats.bluffEchoCancels += 1;
        break;
      case 'UV_RELIC_SCANNED':
        this.state.feats.uvScansCount += 1;
        if (detail?.relicId && !this.state.feats.scannedRelicIds.includes(detail.relicId)) {
          this.state.feats.scannedRelicIds.push(detail.relicId);
        }
        break;
      case 'RELIC_LATCH_OPENED': {
        const rid = detail?.relicId ?? 'meridian_astrolabe';
        const cnt = detail?.latchCount ?? 3;
        for (let i = 0; i < cnt; i++) {
          const key = `${rid}:${i}`;
          if (!this.state.feats.openedLatchKeys.includes(key)) {
            this.state.feats.openedLatchKeys.push(key);
          }
        }
        break;
      }
      case 'ATELIER_SKIN_EQUIPPED':
        this.state.feats.atelierFinishesEquipped += 1;
        break;
      case 'BACKSTAGE_INTERROGATION':
        this.state.feats.backstageInterrogations += 1;
        break;
      case 'FACTION_PLEDGED':
        this.state.feats.factionPledged = true;
        break;
      case 'ACT1_CLEARED':
        this.state.feats.act1Cleared = true;
        break;
      case 'CAMPAIGN_COMPLETED':
        this.state.feats.campaignCompleted = true;
        break;
      case 'ENDING_UNLOCKED':
        this.state.feats.campaignCompleted = true;
        if (detail?.endingId && !this.state.feats.achievedEndings.includes(detail.endingId)) {
          this.state.feats.achievedEndings.push(detail.endingId);
        }
        break;
      case 'BLACK_SALON_VICTORY':
        this.state.feats.blackSalonWins += 1;
        this.state.feats.ghostTrialWins += 1;
        break;
      case 'DUEL_CHALLENGE_PLAYED':
        this.state.feats.duelChallengesPlayed += 1;
        break;
      case 'DUEL_GHOST_BEATEN':
        this.state.feats.duelChallengesPlayed += 1;
        this.state.feats.duelGhostWins += 1;
        break;
      case 'SRS_REVIEW_COMPLETED':
        this.state.feats.srsReviewsCompleted += 1;
        break;
      case 'OFFLINE_PACK_CACHED':
        this.state.feats.offlinePacksCached += 1;
        break;
      case 'CLUE_LADDER_STEP1_SNIPE':
        this.state.feats.clueLadderStep1Snipes += 1;
        break;
      case 'MIND_GAMBIT_USED':
        this.state.feats.mindGambitsActivated += 1;
        break;
      case 'SECOND_WIND_SAVED':
        this.state.feats.secondWindSaves += 1;
        this.state.feats.mindGambitsActivated += 1;
        break;
      case 'FINALE_CATEGORY_WIN':
        this.state.feats.finaleCategoryWins += 1;
        break;
    }

    if (detail?.depth) {
      this.state.feats.maxEndlessDepth = Math.max(
        this.state.feats.maxEndlessDepth,
        Math.floor(detail.depth),
      );
    }

    this.save();
    return this.getSnapshot();
  }

  /**
   * Reloads persisted analytics state from `localStorage` if externally seeded or updated.
   */
  public reloadFromStorage(): CareerAnalyticsState {
    this.state = this.load();
    return this.getSnapshot();
  }
}

interface IndexedAnalyticsEvent {
  ev: QuestionAnalyticsEvent;
  eventKey: string;
}

function emptyArchetypeMap(): Record<AnalyticsArchetype, RightWrongCounter> {
  return {
    SIGHTLINE_LOCK: { right: 0, wrong: 0 },
    CODEX_DUAL_RING: { right: 0, wrong: 0 },
    CALIBRATOR_DIAL: { right: 0, wrong: 0 },
    GAUNTLET_SHATTER: { right: 0, wrong: 0 },
    HERO_ARTIFACT_SYNTHESIS: { right: 0, wrong: 0 },
    GLOBE_PIN_DROP: { right: 0, wrong: 0 },
  };
}

function emptyPeelTierMap(): Record<'1' | '2' | '3', RightWrongCounter> {
  return {
    '1': { right: 0, wrong: 0 },
    '2': { right: 0, wrong: 0 },
    '3': { right: 0, wrong: 0 },
  };
}

function emptySpeedBuckets(): [
  RightWrongCounter,
  RightWrongCounter,
  RightWrongCounter,
  RightWrongCounter,
  RightWrongCounter,
] {
  return [
    { right: 0, wrong: 0 },
    { right: 0, wrong: 0 },
    { right: 0, wrong: 0 },
    { right: 0, wrong: 0 },
    { right: 0, wrong: 0 },
  ];
}

function createEmptyDomainCounters(snap: CareerAnalyticsState): DomainAnalyticsCounter[] {
  return Array.from({ length: 12 }, (_, idx) => ({
    right: 0,
    wrong: 0,
    totalResponseMs: 0,
    peakElo: snap.byDomain[idx]?.peakElo ?? 1200,
    lastElo: snap.byDomain[idx]?.lastElo ?? 1200,
  }));
}

function computeKpisFromEvents(
  events: readonly QuestionAnalyticsEvent[],
  fallbackElo: number,
  fallbackPeakElo: number,
): FilteredAnalyticsKpis {
  let totalRight = 0;
  let totalWrong = 0;
  let totalResponseMs = 0;
  let totalPointsEarned = 0;
  let runningStreak = 0;
  let bestStreak = 0;
  let eloPeak = events.length > 0 ? 0 : fallbackPeakElo;
  let eloLatest = fallbackElo;

  let doubleDownCount = 0;
  let doubleDownWins = 0;
  let doubleDownMisses = 0;
  let safeLockWins = 0;
  let safeLockMisses = 0;
  let max6xWins = 0;
  let backfires = 0;
  let currMax6xStreak = 0;
  let bestConsecutiveMax6xWins = 0;

  for (const ev of events) {
    totalResponseMs += ev.responseTimeMs;
    totalPointsEarned += ev.pointsDelta;
    eloLatest = ev.eloAfter;
    eloPeak = Math.max(eloPeak, ev.eloAfter);

    const dd = isDoubleDownEvent(ev);
    const isMax6x = ev.overclockCharge01 >= 0.88 && ev.peelTier === 1;
    if (dd) doubleDownCount += 1;

    if (ev.correct) {
      totalRight += 1;
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
      if (dd) {
        doubleDownWins += 1;
        if (isMax6x) {
          max6xWins += 1;
          currMax6xStreak += 1;
          bestConsecutiveMax6xWins = Math.max(bestConsecutiveMax6xWins, currMax6xStreak);
        }
      } else {
        safeLockWins += 1;
      }
    } else {
      totalWrong += 1;
      runningStreak = 0;
      if (dd) {
        doubleDownMisses += 1;
        currMax6xStreak = 0;
      } else {
        safeLockMisses += 1;
      }
      if (ev.backfired) {
        backfires += 1;
        currMax6xStreak = 0;
      }
    }
  }

  const totalAnswered = totalRight + totalWrong;
  const accuracyPct = totalAnswered > 0 ? Number(((totalRight / totalAnswered) * 100).toFixed(1)) : null;
  const avgResponseMs = totalAnswered > 0 ? Math.round(totalResponseMs / totalAnswered) : 0;
  const ddTot = doubleDownWins + doubleDownMisses;
  const doubleDownWinPct = ddTot > 0 ? Math.round((doubleDownWins / ddTot) * 100) : null;

  return {
    totalRight,
    totalWrong,
    totalAnswered,
    accuracyPct,
    avgResponseMs,
    totalPointsEarned,
    currentStreak: runningStreak,
    bestStreak,
    eloLatest,
    eloPeak: events.length > 0 ? eloPeak : fallbackPeakElo,
    doubleDownCount,
    doubleDownWins,
    doubleDownMisses,
    doubleDownWinPct,
    safeLockWins,
    safeLockMisses,
    max6xWins,
    backfires,
    bestConsecutiveMax6xWins,
  };
}

function buildBarSeriesFromIndexed(
  items: readonly IndexedAnalyticsEvent[],
  range: AnalyticsTimeRange,
  selectedBucketKey: string | null,
): AnalyticsBarBucketPoint[] {
  if (items.length === 0) return [];

  if (range === 'LAST_25') {
    let runR = 0;
    let runTot = 0;
    return items.map(({ ev, eventKey }, idx) => {
      runTot += 1;
      if (ev.correct) runR += 1;
      const dom = getSovereignDomainMeta(ev.domainId);
      return {
        bucketKey: eventKey,
        label: `Q${idx + 1}`,
        sublabel: `${dom.shortName} · ${(ev.responseTimeMs / 1000).toFixed(1)}s · ${ev.correct ? `+${ev.pointsDelta.toLocaleString('en-US')} PTS` : 'MISS'}`,
        right: ev.correct ? 1 : 0,
        wrong: ev.correct ? 0 : 1,
        rollingAccPct: Math.round((runR / runTot) * 100),
        isSelected: selectedBucketKey === eventKey,
      };
    });
  }

  const dayMap = new Map<
    string,
    { right: number; wrong: number; points: number }
  >();
  for (const { ev } of items) {
    const dk = ev.dateKey;
    const entry = dayMap.get(dk) ?? { right: 0, wrong: 0, points: 0 };
    if (ev.correct) entry.right += 1;
    else entry.wrong += 1;
    entry.points += ev.pointsDelta;
    dayMap.set(dk, entry);
  }

  const maxDays = range === 'DAYS_7' ? 7 : range === 'DAYS_30' ? 30 : 365;
  const sortedKeys = Array.from(dayMap.keys()).sort().slice(-maxDays);
  let cumR = 0;
  let cumTot = 0;
  return sortedKeys.map((dk) => {
    const b = dayMap.get(dk)!;
    cumR += b.right;
    cumTot += b.right + b.wrong;
    const dayTot = b.right + b.wrong;
    const dayAcc = dayTot > 0 ? Math.round((b.right / dayTot) * 100) : 0;
    return {
      bucketKey: dk,
      label: dk.slice(5),
      sublabel: `${dk}: ${b.right} Right · ${b.wrong} Wrong (${dayAcc}%) · +${b.points.toLocaleString('en-US')} PTS`,
      right: b.right,
      wrong: b.wrong,
      rollingAccPct: cumTot > 0 ? Math.round((cumR / cumTot) * 100) : dayAcc,
      isSelected: selectedBucketKey === dk,
    };
  });
}

function buildEloSeriesFromEvents(events: readonly QuestionAnalyticsEvent[]): AnalyticsEloPoint[] {
  if (events.length === 0) return [];
  if (events.length === 1) {
    const only = events[0];
    return [
      { label: 'Base', elo: 1200 },
      { label: 'Q1', elo: only.eloAfter, ts: only.ts, correct: only.correct },
    ];
  }
  const maxPts = 28;
  const step = Math.max(1, Math.floor(events.length / maxPts));
  const out: AnalyticsEloPoint[] = [];
  for (let i = 0; i < events.length; i += step) {
    const ev = events[i];
    out.push({ label: `Q${i + 1}`, elo: ev.eloAfter, ts: ev.ts, correct: ev.correct });
  }
  const last = events[events.length - 1];
  if (out[out.length - 1]?.ts !== last.ts || out[out.length - 1]?.elo !== last.eloAfter) {
    out.push({ label: 'Now', elo: last.eloAfter, ts: last.ts, correct: last.correct });
  }
  return out;
}

/**
 * Pure, deterministic multi-dimensional cross-filtering engine for `CareerAnalyticsDashboardView`.
 * Recomputes Top KPIs, Graph 1 bars, Graph 2 12-Domain Radar + Subcategories, Graph 3 ELO Curve,
 * Graph 4A Morphs & Hint Tiers, Graph 4B 5-Bucket Speed Histogram, and Section 5 Question Ledger
 * from one unified `AnalyticsFilterState`!
 */
export function computeFilteredAnalyticsView(
  snap: CareerAnalyticsState,
  rawFilter: Partial<AnalyticsFilterState> = {},
  nowMs: number = Date.now(),
): FilteredAnalyticsView {
  const filter: AnalyticsFilterState = {
    range: rawFilter.range ?? 'ALL_TIME',
    domainId:
      rawFilter.domainId !== undefined &&
      rawFilter.domainId !== null &&
      Number.isFinite(Number(rawFilter.domainId))
        ? (clamp(Math.floor(Number(rawFilter.domainId)), 0, 11) as DomainId)
        : null,
    subcatLabel: sanitizeSubcatText(rawFilter.subcatLabel ?? undefined),
    archetype:
      rawFilter.archetype && ALL_ANALYTICS_ARCHETYPES.includes(rawFilter.archetype)
        ? rawFilter.archetype
        : null,
    peelTier:
      rawFilter.peelTier === 1 || rawFilter.peelTier === 2 || rawFilter.peelTier === 3
        ? rawFilter.peelTier
        : null,
    outcome:
      rawFilter.outcome === 'RIGHT' ||
      rawFilter.outcome === 'WRONG' ||
      rawFilter.outcome === 'DOUBLE_DOWN'
        ? rawFilter.outcome
        : 'ALL',
    speedBucket:
      rawFilter.speedBucket !== undefined &&
      rawFilter.speedBucket !== null &&
      Number.isInteger(rawFilter.speedBucket) &&
      rawFilter.speedBucket >= 0 &&
      rawFilter.speedBucket <= 4
        ? (rawFilter.speedBucket as AnalyticsSpeedBucketIndex)
        : null,
    bucketKey:
      typeof rawFilter.bucketKey === 'string' && rawFilter.bucketKey.trim().length > 0
        ? rawFilter.bucketKey.trim()
        : null,
  };

  if (filter.domainId === null) {
    filter.subcatLabel = null;
  }

  const activeFilterCount =
    (filter.domainId !== null ? 1 : 0) +
    (filter.subcatLabel !== null ? 1 : 0) +
    (filter.archetype !== null ? 1 : 0) +
    (filter.peelTier !== null ? 1 : 0) +
    (filter.outcome !== 'ALL' ? 1 : 0) +
    (filter.speedBucket !== null ? 1 : 0) +
    (filter.bucketKey !== null ? 1 : 0);
  const hasActiveDimensionFilter = activeFilterCount > 0;

  // Normalize all events (synthesizing backward-compatible fallbacks for pre-existing events)
  const normalizedAll: IndexedAnalyticsEvent[] = (snap.events ?? []).map((rawEv, idx) => {
    const ev = normalizeAnalyticsEvent(rawEv);
    return {
      ev,
      eventKey: `ev:${ev.ts}:${ev.qid}:${idx}`,
    };
  });

  // Legacy aggregate fallback when store was backfilled without granular events
  if (normalizedAll.length === 0 && snap.totalRight + snap.totalWrong > 0) {
    const legacyTotal = snap.totalRight + snap.totalWrong;
    if (!hasActiveDimensionFilter) {
      const legacyBarSeries: AnalyticsBarBucketPoint[] = [];
      const maxDays = filter.range === 'DAYS_7' ? 7 : filter.range === 'DAYS_30' ? 30 : 365;
      const sortedKeys = Object.keys(snap.dailyBuckets).sort().slice(-maxDays);
      if (sortedKeys.length > 0 && filter.range !== 'LAST_25') {
        let cumR = 0;
        let cumTot = 0;
        for (const dk of sortedKeys) {
          const b = snap.dailyBuckets[dk];
          cumR += b.right;
          cumTot += b.right + b.wrong;
          const dayTot = b.right + b.wrong;
          const dayAcc = dayTot > 0 ? Math.round((b.right / dayTot) * 100) : 0;
          legacyBarSeries.push({
            bucketKey: dk,
            label: dk.slice(5),
            sublabel: `${dk}: ${b.right} Right · ${b.wrong} Wrong (${dayAcc}%)`,
            right: b.right,
            wrong: b.wrong,
            rollingAccPct: cumTot > 0 ? Math.round((cumR / cumTot) * 100) : dayAcc,
            isSelected: false,
          });
        }
      } else {
        legacyBarSeries.push({
          bucketKey: 'legacy_career',
          label: 'Career',
          sublabel: `${snap.totalRight}R / ${snap.totalWrong}W`,
          right: snap.totalRight,
          wrong: snap.totalWrong,
          rollingAccPct: Math.round((snap.totalRight / legacyTotal) * 100),
          isSelected: false,
        });
      }

      const legacyElo: AnalyticsEloPoint[] = [{ label: 'Start', elo: 1200 }];
      if (snap.sessions.length > 0) {
        for (const s of snap.sessions.slice(-24)) {
          legacyElo.push({ label: s.mode.slice(0, 4), elo: s.eloAfter, ts: s.ts });
        }
      } else {
        legacyElo.push({ label: 'Now', elo: snap.globalEloLatest });
      }

      const ocTot = snap.overclock.overclockWins + snap.overclock.overclockMisses;
      return {
        filter,
        hasActiveDimensionFilter: false,
        activeFilterCount: 0,
        rangeTotalCount: legacyTotal,
        filteredEvents: [],
        kpis: {
          totalRight: snap.totalRight,
          totalWrong: snap.totalWrong,
          totalAnswered: legacyTotal,
          accuracyPct: Number(((snap.totalRight / legacyTotal) * 100).toFixed(1)),
          avgResponseMs: Math.round(snap.totalResponseMs / legacyTotal),
          totalPointsEarned: snap.totalPointsEarned,
          currentStreak: snap.currentStreak,
          bestStreak: snap.bestStreak,
          eloLatest: snap.globalEloLatest,
          eloPeak: snap.globalEloPeak,
          doubleDownCount: ocTot,
          doubleDownWins: snap.overclock.overclockWins,
          doubleDownMisses: snap.overclock.overclockMisses,
          doubleDownWinPct: ocTot > 0 ? Math.round((snap.overclock.overclockWins / ocTot) * 100) : null,
          safeLockWins: snap.overclock.safeLockWins,
          safeLockMisses: snap.overclock.safeLockMisses,
          max6xWins: snap.overclock.max6xWins,
          backfires: snap.overclock.backfires,
          bestConsecutiveMax6xWins: snap.overclock.bestConsecutiveMax6xWins,
        },
        barSeries: legacyBarSeries,
        byDomain: snap.byDomain.map((d) => ({ ...d })),
        subcategories: [],
        eloSeries: legacyElo,
        byArchetype: {
          SIGHTLINE_LOCK: { ...snap.byArchetype.SIGHTLINE_LOCK },
          CODEX_DUAL_RING: { ...snap.byArchetype.CODEX_DUAL_RING },
          CALIBRATOR_DIAL: { ...snap.byArchetype.CALIBRATOR_DIAL },
          GAUNTLET_SHATTER: { ...snap.byArchetype.GAUNTLET_SHATTER },
          HERO_ARTIFACT_SYNTHESIS: { ...snap.byArchetype.HERO_ARTIFACT_SYNTHESIS },
          GLOBE_PIN_DROP: { ...snap.byArchetype.GLOBE_PIN_DROP },
        },
        byPeelTier: {
          '1': { ...snap.byPeelTier['1'] },
          '2': { ...snap.byPeelTier['2'] },
          '3': { ...snap.byPeelTier['3'] },
        },
        speedBuckets: snap.speedBuckets.map((b) => ({ ...b })) as CareerAnalyticsState['speedBuckets'],
        outcomeCounts: {
          all: legacyTotal,
          right: snap.totalRight,
          wrong: snap.totalWrong,
          doubleDown: ocTot,
        },
        ledgerEvents: [],
        usingLegacyAggregateFallback: true,
      };
    }

    // Legacy aggregate profile with domain-only filter selected
    if (
      filter.domainId !== null &&
      filter.subcatLabel === null &&
      filter.archetype === null &&
      filter.peelTier === null &&
      filter.outcome === 'ALL' &&
      filter.speedBucket === null &&
      filter.bucketKey === null
    ) {
      const dom = snap.byDomain[filter.domainId];
      const domTot = dom.right + dom.wrong;
      const domMeta = getSovereignDomainMeta(filter.domainId);
      return {
        filter,
        hasActiveDimensionFilter: true,
        activeFilterCount: 1,
        rangeTotalCount: legacyTotal,
        filteredEvents: [],
        kpis: {
          totalRight: dom.right,
          totalWrong: dom.wrong,
          totalAnswered: domTot,
          accuracyPct: domTot > 0 ? Number(((dom.right / domTot) * 100).toFixed(1)) : null,
          avgResponseMs: domTot > 0 ? Math.round(dom.totalResponseMs / domTot) : 0,
          totalPointsEarned: 0,
          currentStreak: 0,
          bestStreak: 0,
          eloLatest: dom.lastElo,
          eloPeak: dom.peakElo,
          doubleDownCount: 0,
          doubleDownWins: 0,
          doubleDownMisses: 0,
          doubleDownWinPct: null,
          safeLockWins: 0,
          safeLockMisses: 0,
          max6xWins: 0,
          backfires: 0,
          bestConsecutiveMax6xWins: 0,
        },
        barSeries:
          domTot > 0
            ? [
                {
                  bucketKey: `dom_${filter.domainId}`,
                  label: domMeta.shortName,
                  sublabel: `${domMeta.name}: ${dom.right}R · ${dom.wrong}W`,
                  right: dom.right,
                  wrong: dom.wrong,
                  rollingAccPct: Math.round((dom.right / domTot) * 100),
                  isSelected: false,
                },
              ]
            : [],
        byDomain: snap.byDomain.map((d) => ({ ...d })),
        subcategories: [],
        eloSeries: [
          { label: 'Base', elo: 1200 },
          { label: domMeta.shortName, elo: dom.lastElo },
        ],
        byArchetype: emptyArchetypeMap(),
        byPeelTier: emptyPeelTierMap(),
        speedBuckets: emptySpeedBuckets(),
        outcomeCounts: {
          all: domTot,
          right: dom.right,
          wrong: dom.wrong,
          doubleDown: 0,
        },
        ledgerEvents: [],
        usingLegacyAggregateFallback: true,
      };
    }
  }

  // Apply Time Range first
  let rangeItems: IndexedAnalyticsEvent[];
  if (filter.range === 'LAST_25') {
    rangeItems = normalizedAll.slice(-25);
  } else if (filter.range === 'DAYS_7') {
    const cutoffKey = toUtcDateKey(nowMs - 6 * 86_400_000);
    rangeItems = normalizedAll.filter((it) => it.ev.dateKey >= cutoffKey);
  } else if (filter.range === 'DAYS_30') {
    const cutoffKey = toUtcDateKey(nowMs - 29 * 86_400_000);
    rangeItems = normalizedAll.filter((it) => it.ev.dateKey >= cutoffKey);
  } else {
    rangeItems = normalizedAll;
  }

  const subcatNorm = filter.subcatLabel ? filter.subcatLabel.toLowerCase() : null;

  const matches = (
    item: IndexedAnalyticsEvent,
    skip?: 'domain' | 'subcat' | 'archetype' | 'peelTier' | 'outcome' | 'speedBucket' | 'bucketKey',
  ): boolean => {
    const { ev, eventKey } = item;
    if (skip !== 'domain' && filter.domainId !== null && ev.domainId !== filter.domainId) {
      return false;
    }
    if (
      skip !== 'domain' &&
      skip !== 'subcat' &&
      subcatNorm !== null &&
      (ev.subcatLabel ?? '').toLowerCase() !== subcatNorm
    ) {
      return false;
    }
    if (skip !== 'archetype' && filter.archetype !== null && ev.archetype !== filter.archetype) {
      return false;
    }
    if (skip !== 'peelTier' && filter.peelTier !== null && ev.peelTier !== filter.peelTier) {
      return false;
    }
    if (skip !== 'outcome' && filter.outcome !== 'ALL') {
      if (filter.outcome === 'RIGHT' && !ev.correct) return false;
      if (filter.outcome === 'WRONG' && ev.correct) return false;
      if (filter.outcome === 'DOUBLE_DOWN' && !isDoubleDownEvent(ev)) return false;
    }
    if (skip !== 'speedBucket' && filter.speedBucket !== null) {
      const sb = ev.speedBucketIdx ?? computeSpeedBucketIdx(ev.responseTimeMs);
      if (sb !== filter.speedBucket) return false;
    }
    if (skip !== 'bucketKey' && filter.bucketKey !== null) {
      if (filter.range === 'LAST_25') {
        if (eventKey !== filter.bucketKey) return false;
      } else {
        if (ev.dateKey !== filter.bucketKey) return false;
      }
    }
    return true;
  };

  const filteredItems = rangeItems.filter((it) => matches(it));
  const filteredEvents = filteredItems.map((it) => it.ev);

  const fallbackElo =
    filter.domainId !== null
      ? snap.byDomain[filter.domainId]?.lastElo ?? snap.globalEloLatest
      : snap.globalEloLatest;
  const fallbackPeak =
    filter.domainId !== null
      ? snap.byDomain[filter.domainId]?.peakElo ?? snap.globalEloPeak
      : snap.globalEloPeak;
  const kpis = computeKpisFromEvents(filteredEvents, fallbackElo, fallbackPeak);

  // Graph 1: barSeries (matches all filters except bucketKey)
  const barItems = filter.bucketKey === null ? filteredItems : rangeItems.filter((it) => matches(it, 'bucketKey'));
  const barSeries = buildBarSeriesFromIndexed(barItems, filter.range, filter.bucketKey);

  // Graph 2: 12-Domain counters (matches all filters except domain/subcat)
  const byDomain = createEmptyDomainCounters(snap);
  const domItems = filter.domainId === null ? filteredItems : rangeItems.filter((it) => matches(it, 'domain'));
  for (const { ev } of domItems) {
    const dc = byDomain[ev.domainId];
    if (ev.correct) dc.right += 1;
    else dc.wrong += 1;
    dc.totalResponseMs += ev.responseTimeMs;
  }

  // Graph 2 Subcategory Breakdown (when a domain is selected, matches all filters except subcat)
  const subcategories: SubcategoryBreakdownRow[] = [];
  if (filter.domainId !== null) {
    const subItems =
      filter.subcatLabel === null ? filteredItems : rangeItems.filter((it) => matches(it, 'subcat'));
    const subMap = new Map<
      string,
      { label: string; right: number; wrong: number; totalMs: number }
    >();
    for (const { ev } of subItems) {
      const lbl = ev.subcatLabel ?? synthesizeSubcatFallback(ev.domainId, ev.archetype, ev.promptSnippet);
      const key = lbl.toLowerCase();
      const rec = subMap.get(key) ?? { label: lbl, right: 0, wrong: 0, totalMs: 0 };
      if (ev.correct) rec.right += 1;
      else rec.wrong += 1;
      rec.totalMs += ev.responseTimeMs;
      subMap.set(key, rec);
    }
    for (const rec of subMap.values()) {
      const total = rec.right + rec.wrong;
      subcategories.push({
        subcatLabel: rec.label,
        right: rec.right,
        wrong: rec.wrong,
        total,
        accuracyPct: total > 0 ? Math.round((rec.right / total) * 100) : 0,
        avgResponseMs: total > 0 ? Math.round(rec.totalMs / total) : 0,
      });
    }
    subcategories.sort((a, b) => b.total - a.total || a.subcatLabel.localeCompare(b.subcatLabel));
  }

  // Graph 3: ELO Trajectory strictly from filteredEvents
  const eloSeries = buildEloSeriesFromEvents(filteredEvents);

  // Graph 4A: 6-Morph counters (matches all filters except archetype)
  const byArchetype = emptyArchetypeMap();
  const archItems =
    filter.archetype === null ? filteredItems : rangeItems.filter((it) => matches(it, 'archetype'));
  for (const { ev } of archItems) {
    if (ev.correct) byArchetype[ev.archetype].right += 1;
    else byArchetype[ev.archetype].wrong += 1;
  }

  // Graph 4A: 3 Hint-Tier counters (matches all filters except peelTier)
  const byPeelTier = emptyPeelTierMap();
  const peelItems =
    filter.peelTier === null ? filteredItems : rangeItems.filter((it) => matches(it, 'peelTier'));
  for (const { ev } of peelItems) {
    const tk = String(ev.peelTier) as '1' | '2' | '3';
    if (ev.correct) byPeelTier[tk].right += 1;
    else byPeelTier[tk].wrong += 1;
  }

  // Graph 4B: 5-Bucket Speed Histogram (matches all filters except speedBucket)
  const speedBuckets = emptySpeedBuckets();
  const speedItems =
    filter.speedBucket === null ? filteredItems : rangeItems.filter((it) => matches(it, 'speedBucket'));
  for (const { ev } of speedItems) {
    const sb = ev.speedBucketIdx ?? computeSpeedBucketIdx(ev.responseTimeMs);
    if (ev.correct) speedBuckets[sb].right += 1;
    else speedBuckets[sb].wrong += 1;
  }

  // Outcome counts (matches all filters except outcome, so KPI outcome pills show exact slice counts)
  const outcomeItems =
    filter.outcome === 'ALL' ? filteredItems : rangeItems.filter((it) => matches(it, 'outcome'));
  let outRight = 0;
  let outWrong = 0;
  let outDd = 0;
  for (const { ev } of outcomeItems) {
    if (ev.correct) outRight += 1;
    else outWrong += 1;
    if (isDoubleDownEvent(ev)) outDd += 1;
  }

  return {
    filter,
    hasActiveDimensionFilter,
    activeFilterCount,
    rangeTotalCount: rangeItems.length,
    filteredEvents,
    kpis,
    barSeries,
    byDomain,
    subcategories,
    eloSeries,
    byArchetype,
    byPeelTier,
    speedBuckets,
    outcomeCounts: {
      all: outcomeItems.length,
      right: outRight,
      wrong: outWrong,
      doubleDown: outDd,
    },
    ledgerEvents: [...filteredEvents].reverse(),
    usingLegacyAggregateFallback: false,
  };
}
