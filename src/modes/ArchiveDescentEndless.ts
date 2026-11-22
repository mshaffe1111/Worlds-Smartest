// ============================================================================
// WORLD'S SMARTEST — Mode 4: The Archive Descent (Endless Subterranean Mode)
// Implements PITCH_BIBLE.md §4 (3 Prism Shields, 5-Q Extraction Airlocks, Lore)
// ============================================================================

import type { ForgeEngine, PrismQuestion } from '../forge';
import type { PassportSystem } from '../narrative/PassportSystem';
import {
  DEFAULT_40_ARCHIVE_LORE_LOGS,
  type ArchiveWave2LoreLog,
} from '../narrative/Wave2NarrativeDirector';
import {
  ScoringEngine,
  type PrismAnswerSubmission,
  type ScoredQuestionResult,
} from './ScoringEngine';

export type ArchiveStrataId =
  | 'PUBLIC_STRATA'
  | 'DIPLOMATIC_VAULTS'
  | 'MERIDIAN_ZERO_CORE';

export interface ArchiveAirlockState {
  depthReached: number; // e.g. 5, 10, 15, 20...
  strataId: ArchiveStrataId;
  strataTitle: string;
  strataMultiplier: number;
  shields: number;
  maxShields: number;
  correctCount: number;
  maxStreak: number;
  bankedSafeScore: number;
  unbankedFloorHaul: number;
  totalExtractableScore: number;
  loreLogTitle: string;
  loreLogText: string;
  nextStrataWarning: string;
}

export interface ArchiveDescentHUDState {
  depth: number; // 1-based current question depth
  strataId: ArchiveStrataId;
  strataTitle: string;
  strataMultiplier: number;
  shields: number;
  maxShields: number;
  overclockRepairStreak: number; // 0..2 -> 3 repairs +1 Shield!
  bankedSafeScore: number;
  unbankedFloorHaul: number;
  totalLiveScore: number;
  bestDepthEver: number;
  bestScoreEver: number;
}

export interface ArchiveRunSummary {
  challengerName: string;
  extractedCleanly: boolean;
  depthCleared: number;
  strataReached: string;
  finalBankedScore: number; // Guaranteed positive whenever >=1 question solved!
  correctCount: number;
  maxStreak: number;
  overclockHits: number;
  shieldsRemaining: number;
  newBestDepth: boolean;
  newBestScore: boolean;
}

interface ArchiveCheckpointSave {
  active: boolean;
  depth: number;
  shields: number;
  overclockRepairStreak: number;
  bankedSafeScore: number;
  unbankedFloorHaul: number;
  correctCount: number;
  maxStreak?: number;
  overclockHits: number;
  bestDepthEver: number;
  bestScoreEver: number;
}

const ENDLESS_STORAGE_KEY = 'ws_archive_descent_v2';
const AIRLOCK_INTERVAL = 5;
const MAX_PRISM_SHIELDS = 3;

const ARCHIVE_LORE_LOGS: ReadonlyArray<{ title: string; text: string }> = [
  {
    title: 'STRATA LOG 01 // SUB-LEVEL GENEVA',
    text: 'Construction manifests show The Ledger’s bedrock servers were poured in 2017—two years before the Geneva Charter was publicly proposed.',
  },
  {
    title: 'STRATA LOG 02 // TRIAL ZERO TELEMETRY',
    text: 'Audio fragment from 2019: Julian Vance argued for forty minutes against Chancellor Lindqvist to stop the midnight lockdown of Pod 01.',
  },
  {
    title: 'STRATA LOG 03 // ACOUSTIC HARMONIC KEY',
    text: 'Nadia Al-Mansoor’s graduate thesis on resonant limestone chambers was quietly cited in the Solar Acoustic Hall blueprint.',
  },
  {
    title: 'STRATA LOG 04 // HORIZON SUB-VOCAL PROTOTYPE',
    text: 'Director Takahashi’s lab tested sub-vocal bone-conduction relays on twelve poker pros before recruiting Soren Kael.',
  },
  {
    title: 'STRATA LOG 05 // REYKJAVIK HEARTBEAT',
    text: 'Every Sunday at 00:00 UTC, an unindexed geothermal server in Iceland exchanges a 64-byte cipher with Julian Vance’s desk.',
  },
  {
    title: 'STRATA LOG 06 // MERIDIAN ZERO CORE',
    text: '"If they ever silence me, find the 99.4% twin mind—and hand them the microphone live." — Tariq Al-Mansoor, 2019.',
  },
];

export function getStrataForDepth(depth: number): {
  id: ArchiveStrataId;
  title: string;
  multiplier: number;
} {
  if (depth <= 5) {
    return { id: 'PUBLIC_STRATA', title: 'PUBLIC STRATA', multiplier: 1.0 };
  }
  if (depth <= 10) {
    return { id: 'DIPLOMATIC_VAULTS', title: 'DIPLOMATIC VAULTS', multiplier: 1.35 };
  }
  const deepBonus = Math.min(0.75, Math.floor((depth - 11) / 5) * 0.2);
  return {
    id: 'MERIDIAN_ZERO_CORE',
    title: 'MERIDIAN ZERO CORE',
    multiplier: Number((1.75 + deepBonus).toFixed(2)),
  };
}

export class ArchiveDescentEndless {
  private readonly forge: ForgeEngine;
  private readonly passport: PassportSystem;
  private readonly floorScoring = new ScoringEngine();

  private depth = 1;
  private shields = MAX_PRISM_SHIELDS;
  private overclockRepairStreak = 0;
  private bankedSafeScore = 0;
  private unbankedFloorHaul = 0;
  private totalCorrect = 0;
  private bestRunMaxStreak = 0;
  private totalOverclockHits = 0;
  private bestDepthEver = 0;
  private bestScoreEver = 0;
  private hasActiveCheckpoint = false;

  private batchQuestions: PrismQuestion[] = [];
  private batchCursor = 0;
  private loreLogs: readonly ArchiveWave2LoreLog[] = DEFAULT_40_ARCHIVE_LORE_LOGS;

  constructor(forge: ForgeEngine, passport: PassportSystem) {
    this.forge = forge;
    this.passport = passport;
    this.loadCheckpoint();
  }

  public setLoreLogs(logs: readonly ArchiveWave2LoreLog[]): void {
    if (Array.isArray(logs) && logs.length > 0) {
      this.loreLogs = logs;
    }
  }

  private getRunMaxStreak(): number {
    return Math.max(this.bestRunMaxStreak, this.floorScoring.getMaxStreak());
  }

  private loadCheckpoint(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(ENDLESS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ArchiveCheckpointSave> | null;
      if (!parsed || typeof parsed !== 'object') return;

      this.bestDepthEver = Math.max(0, Math.floor(Number(parsed.bestDepthEver) || 0));
      this.bestScoreEver = Math.max(0, Math.floor(Number(parsed.bestScoreEver) || 0));

      if (parsed.active && (parsed.shields ?? 0) > 0) {
        this.hasActiveCheckpoint = true;
        this.depth = Math.max(1, Math.floor(Number(parsed.depth) || 1));
        this.shields = Math.min(MAX_PRISM_SHIELDS, Math.max(1, Math.floor(Number(parsed.shields) || 3)));
        this.overclockRepairStreak = Math.max(0, Math.floor(Number(parsed.overclockRepairStreak) || 0));
        this.bankedSafeScore = Math.max(0, Math.floor(Number(parsed.bankedSafeScore) || 0));
        this.unbankedFloorHaul = Math.max(0, Math.floor(Number(parsed.unbankedFloorHaul) || 0));
        this.totalCorrect = Math.max(0, Math.floor(Number(parsed.correctCount) || 0));
        this.bestRunMaxStreak = Math.max(0, Math.floor(Number(parsed.maxStreak) || 0));
        this.totalOverclockHits = Math.max(0, Math.floor(Number(parsed.overclockHits) || 0));
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveCheckpoint(active: boolean): void {
    this.hasActiveCheckpoint = active;
    const runMaxStreak = this.getRunMaxStreak();
    this.bestRunMaxStreak = runMaxStreak;
    try {
      if (typeof localStorage !== 'undefined') {
        const payload: ArchiveCheckpointSave = {
          active,
          depth: this.depth,
          shields: this.shields,
          overclockRepairStreak: this.overclockRepairStreak,
          bankedSafeScore: this.bankedSafeScore,
          unbankedFloorHaul: this.unbankedFloorHaul,
          correctCount: this.totalCorrect,
          maxStreak: runMaxStreak,
          overclockHits: this.totalOverclockHits,
          bestDepthEver: this.bestDepthEver,
          bestScoreEver: this.bestScoreEver,
        };
        localStorage.setItem(ENDLESS_STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {
      // Ignore quota issues
    }
  }

  public canResumeCheckpoint(): boolean {
    return this.hasActiveCheckpoint && this.shields > 0;
  }

  /**
   * Starts a fresh Archive Descent (or resumes saved checkpoint if `resumeCheckpoint === true`).
   */
  public async startDescent(resumeCheckpoint = false): Promise<{
    question: PrismQuestion | null;
    hud: ArchiveDescentHUDState;
  }> {
    if (!resumeCheckpoint || !this.canResumeCheckpoint()) {
      this.depth = 1;
      this.shields = MAX_PRISM_SHIELDS;
      this.overclockRepairStreak = 0;
      this.bankedSafeScore = 0;
      this.unbankedFloorHaul = 0;
      this.totalCorrect = 0;
      this.bestRunMaxStreak = 0;
      this.totalOverclockHits = 0;
      this.floorScoring.reset(0);
    } else {
      // Preserve `bestRunMaxStreak` across resumed sessions while resetting per-floor live buffer
      this.floorScoring.reset(0);
    }

    this.batchQuestions = await this.forge.queryEndlessBatchAsync(this.depth - 1, AIRLOCK_INTERVAL);
    this.batchCursor = 0;
    this.saveCheckpoint(true);

    return {
      question: this.batchQuestions[0] ?? null,
      hud: this.getHUDState(),
    };
  }

  public getCurrentQuestion(): PrismQuestion | null {
    return this.batchQuestions[this.batchCursor] ?? null;
  }

  public getHUDState(): ArchiveDescentHUDState {
    const strata = getStrataForDepth(this.depth);
    return {
      depth: this.depth,
      strataId: strata.id,
      strataTitle: strata.title,
      strataMultiplier: strata.multiplier,
      shields: this.shields,
      maxShields: MAX_PRISM_SHIELDS,
      overclockRepairStreak: this.overclockRepairStreak,
      bankedSafeScore: this.bankedSafeScore,
      unbankedFloorHaul: this.unbankedFloorHaul,
      totalLiveScore: this.bankedSafeScore + this.unbankedFloorHaul,
      bestDepthEver: this.bestDepthEver,
      bestScoreEver: this.bestScoreEver,
    };
  }

  /**
   * Resolves current Descent Prism, updates 3 Prism Shields (3-streak Overclock repairs +1;
   * Backfire shatters -2; Miss shatters -1), and triggers Airlock every 5 questions!
   */
  public async submitCurrentAnswer(submission: PrismAnswerSubmission): Promise<{
    resolution: ScoredQuestionResult;
    shieldDelta: number;
    shieldRepaired: boolean;
    hud: ArchiveDescentHUDState;
    airlockReached: ArchiveAirlockState | null;
    runEndedSummary: ArchiveRunSummary | null;
    nextQuestion: PrismQuestion | null;
  }> {
    const q = this.getCurrentQuestion();
    if (!q) {
      throw new Error('No active Archive Descent question.');
    }

    const strata = getStrataForDepth(this.depth);
    const resolution = this.floorScoring.submitAnswer(q, submission, {
      strataMultiplier: strata.multiplier,
    });

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

    let shieldDelta = 0;
    let shieldRepaired = false;

    if (resolution.correct) {
      this.totalCorrect += 1;
      // Guaranteed positive points banked into floor haul; 50% immediately protected in bankedSafeScore
      // so solved questions NEVER zero out even if all shields shatter before an Airlock!
      const safePortion = Math.round(resolution.pointsEarned * 0.5);
      this.bankedSafeScore += safePortion;
      this.unbankedFloorHaul += resolution.pointsEarned - safePortion;

      if (resolution.overclocked) {
        this.totalOverclockHits += 1;
        this.overclockRepairStreak += 1;
        if (this.overclockRepairStreak >= 3) {
          this.overclockRepairStreak = 0;
          if (this.shields < MAX_PRISM_SHIELDS) {
            this.shields += 1;
            shieldDelta = 1;
            shieldRepaired = true;
          }
        }
      } else {
        this.overclockRepairStreak = 0;
      }
    } else {
      this.overclockRepairStreak = 0;
      const loss = resolution.backfired ? 2 : 1;
      const prev = this.shields;
      this.shields = Math.max(0, this.shields - loss);
      shieldDelta = this.shields - prev;
    }

    // Check Shield Depletion
    if (this.shields <= 0) {
      const summary = this.finalizeRun(false, this.depth - (resolution.correct ? 0 : 1));
      return {
        resolution,
        shieldDelta,
        shieldRepaired,
        hud: this.getHUDState(),
        airlockReached: null,
        runEndedSummary: summary,
        nextQuestion: null,
      };
    }

    const clearedDepth = this.depth;
    this.depth += 1;
    this.batchCursor += 1;

    // Every 5 questions -> Extraction Airlock!
    if (clearedDepth % AIRLOCK_INTERVAL === 0) {
      this.saveCheckpoint(true);
      const airlock = this.buildAirlockState(clearedDepth);
      return {
        resolution,
        shieldDelta,
        shieldRepaired,
        hud: this.getHUDState(),
        airlockReached: airlock,
        runEndedSummary: null,
        nextQuestion: null,
      };
    }

    if (this.batchCursor >= this.batchQuestions.length) {
      this.batchQuestions = await this.forge.queryEndlessBatchAsync(
        this.depth - 1,
        AIRLOCK_INTERVAL
      );
      this.batchCursor = 0;
    }

    this.saveCheckpoint(true);
    return {
      resolution,
      shieldDelta,
      shieldRepaired,
      hud: this.getHUDState(),
      airlockReached: null,
      runEndedSummary: null,
      nextQuestion: this.getCurrentQuestion(),
    };
  }

  /**
   * Player chooses "EXTRACT & BANK HAUL" at an Extraction Airlock — locks 100% of haul cleanly!
   */
  public extractAtAirlock(): ArchiveRunSummary {
    this.bankedSafeScore += this.unbankedFloorHaul;
    this.unbankedFloorHaul = 0;
    return this.finalizeRun(true, this.depth - 1);
  }

  /**
   * Player chooses "DESCEND DEEPER" at an Extraction Airlock — locks 50% more of unbanked haul
   * into safety reserve and streams the next 5-question subterranean batch!
   */
  public async descendFromAirlock(): Promise<{
    question: PrismQuestion | null;
    hud: ArchiveDescentHUDState;
  }> {
    const lockIn = Math.round(this.unbankedFloorHaul * 0.5);
    this.bankedSafeScore += lockIn;
    this.unbankedFloorHaul -= lockIn;

    this.batchQuestions = await this.forge.queryEndlessBatchAsync(this.depth - 1, AIRLOCK_INTERVAL);
    this.batchCursor = 0;
    this.saveCheckpoint(true);

    return {
      question: this.getCurrentQuestion(),
      hud: this.getHUDState(),
    };
  }

  private buildAirlockState(depthReached: number): ArchiveAirlockState {
    const currentStrata = getStrataForDepth(depthReached);
    const nextStrata = getStrataForDepth(depthReached + 1);
    const logIdx = Math.min(
      this.loreLogs.length - 1,
      Math.max(0, Math.floor(depthReached / AIRLOCK_INTERVAL) - 1)
    );
    const lore = this.loreLogs[logIdx];

    return {
      depthReached,
      strataId: currentStrata.id,
      strataTitle: currentStrata.title,
      strataMultiplier: currentStrata.multiplier,
      shields: this.shields,
      maxShields: MAX_PRISM_SHIELDS,
      correctCount: this.totalCorrect,
      maxStreak: this.getRunMaxStreak(),
      bankedSafeScore: this.bankedSafeScore,
      unbankedFloorHaul: this.unbankedFloorHaul,
      totalExtractableScore: this.bankedSafeScore + this.unbankedFloorHaul,
      loreLogTitle: `${lore.code} // ${lore.title}`,
      loreLogText: lore.body,
      nextStrataWarning: `Next 5 Depths: ${nextStrata.title} (${nextStrata.multiplier}x Score Multiplier · Escalating Polymath IRT).`,
    };
  }

  private finalizeRun(extractedCleanly: boolean, depthCleared: number): ArchiveRunSummary {
    const finalScore = extractedCleanly
      ? this.bankedSafeScore + this.unbankedFloorHaul
      : this.bankedSafeScore;

    const cleanDepth = Math.max(0, depthCleared);
    const newBestDepth = cleanDepth > this.bestDepthEver;
    const newBestScore = finalScore > this.bestScoreEver;

    if (newBestDepth) this.bestDepthEver = cleanDepth;
    if (newBestScore) this.bestScoreEver = finalScore;

    const runMaxStreak = this.getRunMaxStreak();
    this.unbankedFloorHaul = 0;
    this.saveCheckpoint(false);

    return {
      challengerName: this.passport.getChallengerName(),
      extractedCleanly,
      depthCleared: cleanDepth,
      strataReached: getStrataForDepth(Math.max(1, cleanDepth)).title,
      finalBankedScore: finalScore,
      correctCount: this.totalCorrect,
      maxStreak: runMaxStreak,
      overclockHits: this.totalOverclockHits,
      shieldsRemaining: this.shields,
      newBestDepth,
      newBestScore,
    };
  }
}
