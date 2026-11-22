// ============================================================================
// WORLD'S SMARTEST — Mode 2: The Global Feed (Daily 7-Prism World Broadcast)
// Implements PITCH_BIBLE.md §4 + 5-Line Wordle-Style Peel/Overclock Share Card
// ============================================================================

import type { DailyBroadcastPacket, ForgeEngine, PrismQuestion } from '../forge';
import type { PassportSystem } from '../narrative/PassportSystem';
import {
  ScoringEngine,
  type PrismAnswerSubmission,
  type ScoredQuestionResult,
} from './ScoringEngine';

export interface DailyFeedCompletedSummary {
  utcDate: string;
  broadcastNumber: number;
  challengerName: string;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  percentile: number; // 1..99
  topPercentBanner: string; // e.g. "Top 6%"
  dailyStreak: number;
  maxStreak: number;
  overclockHits: number;
  bullseyeTiebreakerHit: boolean;
  emojiRow: string;
  shareText: string; // Exact 5-line Wordle-style spoiler-free share card!
  resolutions: ScoredQuestionResult[];
  isReplay: boolean;
}

export interface DailyFeedPersistence {
  lastCompletedUtcDate: string | null;
  dailyStreak: number;
  bestScore: number;
  bestPercentile: number;
  completedRunsByDate: Record<
    string,
    {
      score: number;
      percentile: number;
      correctCount: number;
      shareText: string;
    }
  >;
}

const DAILY_STORAGE_KEY = 'ws_daily_global_feed_v2';

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

export function getCurrentUtcDateString(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isYesterdayUtc(prevDateStr: string | null, currentDateStr: string): boolean {
  if (!prevDateStr) return false;
  const prevMs = Date.parse(`${prevDateStr}T00:00:00Z`);
  const currMs = Date.parse(`${currentDateStr}T00:00:00Z`);
  if (!Number.isFinite(prevMs) || !Number.isFinite(currMs)) return false;
  const diffDays = Math.round((currMs - prevMs) / 86_400_000);
  return diffDays === 1;
}

/**
 * Calibrated logistic Global Percentile estimator across the 10-Prism World Broadcast!
 */
export function computeGlobalFeedPercentile(totalScore: number): number {
  if (!Number.isFinite(totalScore) || totalScore <= 0) return 1;
  // Median global broadcast score ~19,500 across 10 mixed Prisms (5/10 Safe Lock ≈ Top 60%, 7/10 ≈ Top 33%, 10/10 ≈ Top 9%)
  const logistic = 100 / (1 + Math.exp(-(totalScore - 19500) / 7200));
  return Math.round(clamp(logistic, 1, 99));
}

/**
 * Maps each question's Peel/Overclock/Bullseye resolution to a crisp spoiler-free emoji!
 */
export function resolutionToShareEmoji(r: ScoredQuestionResult): string {
  if (!r.correct) {
    return r.backfired ? '🟥' : '⬛';
  }
  if (r.bullseye) return '🎯';
  if (r.overclocked && r.peelTier === 1) return '💎';
  if (r.peelTier === 1) return '🟨';
  if (r.peelTier === 2) return '🟦';
  return '🟪';
}

/**
 * Generates the exact 5-Line Wordle-style Peel/Overclock Emoji Share Card with real Challenger Name!
 */
export function buildFiveLineDailyShareCard(params: {
  utcDate: string;
  broadcastNumber: number;
  challengerName: string;
  totalScore: number;
  percentile: number;
  resolutions: readonly ScoredQuestionResult[];
  maxStreak: number;
}): string {
  const emojiRow = params.resolutions.map(resolutionToShareEmoji).join('');
  const correctCount = params.resolutions.filter((r) => r.correct).length;
  const overclockHits = params.resolutions.filter((r) => r.correct && r.overclocked).length;
  const topPct = Math.max(1, 100 - Math.round(clamp(params.percentile, 1, 99)));
  const scoreFormatted = Math.max(0, Math.round(params.totalScore)).toLocaleString('en-US');

  return [
    `🌐 WORLD'S SMARTEST · FEED #${params.broadcastNumber} (${params.utcDate})`,
    `Challenger: ${params.challengerName} · ${scoreFormatted} PTS (Top ${topPct}%)`,
    emojiRow,
    `Cleared ${correctCount}/${params.resolutions.length} · Overclocks ${overclockHits}⚡ · Streak ${params.maxStreak}🔥`,
    `Spin · Peel · Overclock — The Meridian Global Broadcast`,
  ].join('\n');
}

export class DailyGlobalFeed {
  private readonly forge: ForgeEngine;
  private readonly passport: PassportSystem;
  private readonly scoring = new ScoringEngine();

  private persistence: DailyFeedPersistence;
  private activePacket: DailyBroadcastPacket | null = null;
  private currentIndex = 0;
  private lastSubmitOut: {
    resolution: ScoredQuestionResult;
    nextQuestion: PrismQuestion | null;
    completedSummary: DailyFeedCompletedSummary | null;
  } | null = null;

  constructor(forge: ForgeEngine, passport: PassportSystem) {
    this.forge = forge;
    this.passport = passport;
    this.persistence = this.loadPersistence();
  }

  private loadPersistence(): DailyFeedPersistence {
    const defaults: DailyFeedPersistence = {
      lastCompletedUtcDate: null,
      dailyStreak: 0,
      bestScore: 0,
      bestPercentile: 0,
      completedRunsByDate: {},
    };
    try {
      if (typeof localStorage === 'undefined') return defaults;
      const raw = localStorage.getItem(DAILY_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<DailyFeedPersistence> | null;
      if (!parsed || typeof parsed !== 'object') return defaults;
      return {
        lastCompletedUtcDate:
          typeof parsed.lastCompletedUtcDate === 'string' ? parsed.lastCompletedUtcDate : null,
        dailyStreak: Math.max(0, Math.floor(Number(parsed.dailyStreak) || 0)),
        bestScore: Math.max(0, Math.floor(Number(parsed.bestScore) || 0)),
        bestPercentile: clamp(Math.floor(Number(parsed.bestPercentile) || 0), 0, 99),
        completedRunsByDate:
          parsed.completedRunsByDate && typeof parsed.completedRunsByDate === 'object'
            ? parsed.completedRunsByDate
            : {},
      };
    } catch {
      return defaults;
    }
  }

  private savePersistence(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(this.persistence));
      }
    } catch {
      // Ignore storage quota issues
    }
  }

  public hasCompletedToday(utcDate = getCurrentUtcDateString()): boolean {
    return Boolean(this.persistence.completedRunsByDate[utcDate]);
  }

  public getSavedResultForDate(utcDate = getCurrentUtcDateString()) {
    return this.persistence.completedRunsByDate[utcDate] ?? null;
  }

  public getDailyStreak(): number {
    return this.persistence.dailyStreak;
  }

  /**
   * Starts today's uniform 00:00 UTC 7-Prism World Broadcast (zero adaptive scaling — 100% fair global seed!).
   */
  public startBroadcast(utcDate = getCurrentUtcDateString()): {
    packet: DailyBroadcastPacket;
    firstQuestion: PrismQuestion | null;
    hostGreeting: string;
  } {
    const packet = this.forge.getDailyBroadcast(utcDate);
    this.activePacket = packet;
    this.currentIndex = 0;
    this.lastSubmitOut = null;
    this.scoring.reset(0);
    const name = this.passport.getChallengerName();

    return {
      packet,
      firstQuestion: packet.questions[0] ?? null,
      hostGreeting: `Live from Geneva, ${name}—Global Feed #${packet.broadcastNumber} (${utcDate}). ${packet.questions.length} synchronized Prisms across identical UTC global stakes.`,
    };
  }

  public getCurrentQuestion(): PrismQuestion | null {
    if (!this.activePacket) return null;
    return this.activePacket.questions[this.currentIndex] ?? null;
  }

  public getProgress(): { current: number; total: number; score: number } {
    return {
      current: this.currentIndex + 1,
      total: this.activePacket?.questions.length ?? 10,
      score: this.scoring.getMatchScore(),
    };
  }

  /**
   * Submits an answer for the current Daily Broadcast Prism and advances (or finalizes on Q7).
   */
  public submitCurrentAnswer(submission: PrismAnswerSubmission): {
    resolution: ScoredQuestionResult;
    nextQuestion: PrismQuestion | null;
    completedSummary: DailyFeedCompletedSummary | null;
  } {
    if (!this.activePacket) {
      throw new Error('DailyGlobalFeed.startBroadcast() must be called before submitting.');
    }
    const q = this.activePacket.questions[this.currentIndex];
    if (!q) {
      if (this.lastSubmitOut) return this.lastSubmitOut;
      throw new Error('Daily broadcast already finished.');
    }

    // Zero pay-to-win / zero perk inflation in Daily Ranked Broadcast per PITCH_BIBLE.md §4 & §7.1!
    const resolution = this.scoring.submitAnswer(q, submission);

    this.forge.recordQuestionOutcome({
      qid: q.qid,
      l0Domain: q.l0Domain,
      archetype: q.archetype,
      irtB: q.irtB,
      irtA: q.irtA,
      correct: resolution.correct,
      peelTier: submission.peelTier,
      accuracyRatio: resolution.partialCreditRatio,
      bullseye: resolution.bullseye,
      overclocked: resolution.overclocked,
    });
    this.passport.recordDomainQuestionOutcome(
      q.l0Domain,
      resolution.correct,
      submission.peelTier,
      q.irtB
    );

    this.currentIndex += 1;
    const nextQuestion = this.activePacket.questions[this.currentIndex] ?? null;
    const completedSummary = nextQuestion === null ? this.finalizeBroadcast() : null;

    this.lastSubmitOut = {
      resolution,
      nextQuestion,
      completedSummary,
    };
    return this.lastSubmitOut;
  }

  private finalizeBroadcast(): DailyFeedCompletedSummary {
    const packet = this.activePacket!;
    const existingRun = this.persistence.completedRunsByDate[packet.utcDate];
    const isReplay = Boolean(existingRun);
    const totalScore = this.scoring.getMatchScore();
    const percentile = computeGlobalFeedPercentile(totalScore);
    const topPct = Math.max(1, 100 - percentile);
    const challengerName = this.passport.getChallengerName();
    const resolutions = [...this.scoring.getHistory()];
    const correctCount = this.scoring.getCorrectCount();

    if (this.persistence.lastCompletedUtcDate !== packet.utcDate) {
      if (isYesterdayUtc(this.persistence.lastCompletedUtcDate, packet.utcDate)) {
        this.persistence.dailyStreak += 1;
      } else {
        this.persistence.dailyStreak = 1;
      }
      this.persistence.lastCompletedUtcDate = packet.utcDate;
    }

    if (totalScore > this.persistence.bestScore) {
      this.persistence.bestScore = totalScore;
    }
    if (percentile > this.persistence.bestPercentile) {
      this.persistence.bestPercentile = percentile;
    }

    const shareText = buildFiveLineDailyShareCard({
      utcDate: packet.utcDate,
      broadcastNumber: packet.broadcastNumber,
      challengerName,
      totalScore,
      percentile,
      resolutions,
      maxStreak: this.scoring.getMaxStreak(),
    });

    // Never overwrite a higher saved Daily score with a lower practice replay (#284)!
    if (!existingRun || totalScore > existingRun.score) {
      this.persistence.completedRunsByDate[packet.utcDate] = {
        score: totalScore,
        percentile,
        correctCount,
        shareText,
      };
    }
    this.savePersistence();

    this.passport.recordDailyPercentile({
      utcDate: packet.utcDate,
      score: totalScore,
      percentile,
      correctCount,
    });

    const tiebreakerRes = resolutions[packet.tiebreakerIndex];

    return {
      utcDate: packet.utcDate,
      broadcastNumber: packet.broadcastNumber,
      challengerName,
      totalScore,
      correctCount,
      totalQuestions: resolutions.length,
      percentile,
      topPercentBanner: `Top ${topPct}%`,
      dailyStreak: this.persistence.dailyStreak,
      maxStreak: this.scoring.getMaxStreak(),
      overclockHits: this.scoring.getOverclockHits(),
      bullseyeTiebreakerHit: Boolean(tiebreakerRes?.bullseye),
      emojiRow: resolutions.map(resolutionToShareEmoji).join(''),
      shareText,
      resolutions,
      isReplay,
    };
  }
}
