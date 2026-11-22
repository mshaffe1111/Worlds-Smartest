// ============================================================================
// WORLD'S SMARTEST — Persistent Career Analytics Store (`#166` §2.1)
// Schema-safe `localStorage` (`ws_career_analytics_v1`) engine tracking:
//  • 2,000-event detailed historical ring-buffer (`QuestionAnalyticsEvent`)
//  • Daily UTC/local date buckets (`YYYY-MM-DD`: right, wrong, acc, avgMs, streak, pts)
//  • Session ELO & score trajectory history (`SessionAnalyticsEntry`)
//  • Lifetime per-domain (0..11), per-morph (5 archetypes), per-peel-tier (1..3),
//    per-mode, Overclock conviction, and 5-bucket response-time counters!
//  • Seamless backfill from `PassportSystem` / `ForgeEngine` on existing saves!
// ============================================================================

import { forgeEngine } from '../forge';
import type { DomainId, EndingId, PassportSystem } from '../narrative';

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
  | 'HERO_ARTIFACT_SYNTHESIS';

export type AnalyticsTimeRange = 'LAST_25' | 'DAYS_7' | 'DAYS_30' | 'ALL_TIME';

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
  | 'BLACK_SALON_VICTORY';

export interface QuestionAnalyticsInput {
  ts?: number;
  qid: number;
  domainId: number;
  mode?: AnalyticsGameMode | string;
  hubId?: string;
  archetype?: AnalyticsArchetype | string;
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

function normalizeArchetype(raw?: string): AnalyticsArchetype {
  const up = (raw ?? 'SIGHTLINE_LOCK').toUpperCase();
  if (
    up === 'SIGHTLINE_LOCK' ||
    up === 'CODEX_DUAL_RING' ||
    up === 'CALIBRATOR_DIAL' ||
    up === 'GAUNTLET_SHATTER' ||
    up === 'HERO_ARTIFACT_SYNTHESIS'
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
        },
        dailyBuckets:
          parsed.dailyBuckets && typeof parsed.dailyBuckets === 'object'
            ? parsed.dailyBuckets
            : {},
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions.slice(-MAX_SESSIONS) : [],
        events: Array.isArray(parsed.events) ? parsed.events.slice(-MAX_RING_EVENTS) : [],
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
    const pts = Math.max(0, Math.round(Number(input.pointsDelta) || 0));

    const skillSnap = forgeEngine.getSkillSnapshot();
    const eloAfter = clamp(
      Math.round(Number(input.eloAfter) || skillSnap.globalElo || this.state.globalEloLatest),
      600,
      2600,
    );

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
      promptSnippet: input.promptSnippet?.slice(0, 90),
      answerLabel: input.answerLabel?.slice(0, 44),
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

    // Speed Bucket index
    const speedIdx =
      respMs < 3000 ? 0 : respMs < 6000 ? 1 : respMs < 10000 ? 2 : respMs < 15000 ? 3 : 4;

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
}
