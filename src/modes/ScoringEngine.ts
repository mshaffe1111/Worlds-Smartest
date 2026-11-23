// ============================================================================
// WORLD'S SMARTEST — Bug-Free Permanent-Banking Scoring Engine
// Implements PITCH_BIBLE.md §3.1–3.2 + Critical Client Bug Fix:
//   • Solved questions ALWAYS bank positive points permanently into matchScore
//   • Getting 2/5 Correct NEVER displays 0 PTS under any circumstance!
// ============================================================================

import {
  getAcademicTierSpec,
  presetToAcademicTier,
} from '../forge/QuestionDifficultyCalibration';
import { formatCleanTriviaNumber } from '../forge/ShardDecoder';
import type {
  AcademicDifficultyTier,
  Archetype3D,
  BriefingDifficultyPreset,
  CalibratorConeId,
  DomainId,
  GauntletAction,
  PeelTier,
  PlayerPrismSubmission,
  PrismQuestion,
} from '../forge/types';

export type { PlayerPrismSubmission };

export interface PrismAnswerSubmission extends PlayerPrismSubmission {}

export interface ScoringModifierOptions {
  timeTotalSec?: number;
  /** Tier-1 Cold Instinct multiplier boost (e.g. 1.25 for Clean Hands, 1.50 w/ Analog Static) */
  tier1BonusMultiplier?: number;
  /** Sovereign Override domain multiplier (e.g. 1.20 on History, Arts, Law, Myth) */
  sovereignDomainMultiplier?: number;
  /** Maverick's Gambit Overclock peak bonus scale (1.25 -> up to 2.25x Overclock) */
  overclockPeakBonusScale?: number;
  /** Chrono Surge doubles max speed bonus (300 -> 600) */
  chronoSurgeActive?: boolean;
  /** Strata multiplier for Endless Archive Descent (1.0x -> 1.35x -> 1.75x) */
  strataMultiplier?: number;
  /** Optional explicit 5-tier academic difficulty multiplier (1.0x / 1.15x / 1.35x / 1.60x / 2.00x) */
  difficultyTierMultiplier?: number;
  /** When true, automatically applies `question.difficultyMultiplier` from its calibrated academic tier */
  applyQuestionDifficultyMultiplier?: boolean;
  /** Optional Clue Ladder snipe bonus (+200 Step 1, +75 Step 2, +0 Step 3) added on correct lock */
  clueLadderBonusPoints?: number;
  /** Optional flat Mind Gambit bonus points (e.g. +250 First-Clue Bounty) added on correct lock */
  gambitFlatBonusPoints?: number;
  /** Optional Hot-Streak Surge combo multiplier bonus (e.g. +1.0x per 2 consecutive right answers) */
  streakComboMultiplierBonus?: number;
  /** Optional Vault Jackpot final-question multiplier (e.g. 2.5x) */
  finaleJackpotMultiplier?: number;
  /** When true (e.g. Vault Jackpot Gambit on final question), Double-Down miss incurs ZERO penalty */
  zeroDoubleDownPenalty?: boolean;
}

export interface ScoredQuestionResult {
  qid: number;
  domainId: DomainId;
  archetype: Archetype3D;
  correct: boolean;
  partialCreditRatio: number; // 1.0 full, 0.5 on 2/3 Codex, 0 on miss
  bullseye: boolean;
  backfired: boolean; // True ONLY when !correct && overclocked
  peelTier: PeelTier;
  overclocked: boolean;
  overclockCharge: number;
  basePoints: number;
  tierMultiplier: number;
  perkMultiplier: number;
  overclockMultiplier: number;
  speedBonus: number;
  streakAfter: number;
  streakBonus: number;
  /** Points earned on this question (ALWAYS >= 1000 when correct!) */
  pointsEarned: number;
  /** Total banked match score after this question (strictly monotonic on non-wager rounds!) */
  matchScoreAfter: number;
  /** Ironclad floor that can NEVER be lost for the rest of the match */
  permanentBankedFloor: number;
  correctAnswerDisplay: string;
  whyExplanation: string;
  promptSnapshot: string;
  /** Great-circle error distance in kilometers for `GLOBE_PIN_DROP` submissions */
  globeDistanceKm?: number;
  /** Accuracy ring tier for `GLOBE_PIN_DROP` submissions */
  globeAccuracyTier?: 'BULLSEYE PINPOINT' | 'REGIONAL LOCK' | 'CONTINENTAL GRAZE' | 'OFF TARGET';
  /** Calibrated 5-tier Academic / IQ placement of the evaluated question */
  difficultyTier?: AcademicDifficultyTier;
  /** Academic difficulty score multiplier applied on this question (1.0..2.0) */
  difficultyMultiplier?: number;
  /** Optional Clue Ladder bonus points earned on this question */
  clueLadderBonus?: number;
  /** Optional Mind Gambit bonus points earned on this question */
  gambitBonus?: number;
}

export const BASE_PRISM_POINTS = 1000;
export const BASE_MAX_SPEED_BONUS = 300;
export const STREAK_STEP_POINTS = 150;
export const MAX_STREAK_STEPS = 5;
const EARTH_MEAN_RADIUS_KM = 6371;

const SOVEREIGN_BONUS_DOMAINS: ReadonlySet<number> = new Set([0, 3, 8, 10]);

function clamp(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  if (v === Infinity) return max;
  if (v === -Infinity) return min;
  return Math.max(min, Math.min(max, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Computes great-circle distance in kilometers between two WGS84 `(lat, lon)` points
 * using the numerically-clamped Haversine formula (handles antipodes & ±180° dateline cleanly).
 */
export function computeHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return Infinity;
  }
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const rLat1 = lat1 * toRad;
  const rLat2 = lat2 * toRad;
  const sinHalfLat = Math.sin(dLat * 0.5);
  const sinHalfLon = Math.sin(dLon * 0.5);
  const a = clamp(
    sinHalfLat * sinHalfLat +
      Math.cos(rLat1) * Math.cos(rLat2) * sinHalfLon * sinHalfLon,
    0,
    1,
  );
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_MEAN_RADIUS_KM * c;
}

export function getSightlineTierMultiplier(peelTier: PeelTier): number {
  if (peelTier === 1) return 3.0;
  if (peelTier === 2) return 2.0;
  return 1.2;
}

/**
 * Returns the 5-tier academic difficulty score bonus multiplier:
 * `MIDDLE_SCHOOL` (1.00x), `HIGH_SCHOOL` (1.15x), `COLLEGE` (1.35x),
 * `GRADUATE` (1.60x), `MENSA` (2.00x).
 */
export function getDifficultyTierMultiplier(
  tierOrPreset?: AcademicDifficultyTier | BriefingDifficultyPreset,
): number {
  const tier = presetToAcademicTier(tierOrPreset);
  return tier ? getAcademicTierSpec(tier).scoreMultiplier : 1.0;
}

export function getCalibratorConeMultiplier(
  coneId?: CalibratorConeId,
  tolerancePct?: number
): number {
  if (coneId === 'PINHOLE') return 3.5;
  if (coneId === 'SHARP') return 2.5;
  if (coneId === 'WIDE') return 1.5;
  const tol = clamp(tolerancePct ?? 0.15, 0.02, 0.35);
  if (tol <= 0.04) return 3.5;
  if (tol <= 0.11) return 2.5;
  return round2(1.5 + ((0.35 - tol) / (0.35 - 0.11)) * 0.8);
}

/**
 * Pure, deterministic evaluation of any 5-Morph `PrismQuestion`!
 */
export function evaluatePrismAnswer(
  question: PrismQuestion,
  submission: PrismAnswerSubmission,
  currentStreak = 0,
  modifiers?: ScoringModifierOptions
): Omit<ScoredQuestionResult, 'matchScoreAfter' | 'permanentBankedFloor'> {
  const archetype = submission.archetype ?? question.archetype;
  const timeTotal =
    modifiers?.timeTotalSec ??
    (archetype === 'GAUNTLET_SHATTER'
      ? question.gauntlet?.windowSec ?? 8
      : question.timerSec || 20);

  const elapsedRatio = clamp((submission.elapsedSec || 0) / Math.max(1, timeTotal), 0, 1);
  const maxSpeed = modifiers?.chronoSurgeActive ? BASE_MAX_SPEED_BONUS * 2 : BASE_MAX_SPEED_BONUS;
  const rawSpeedBonus = Math.round((1 - elapsedRatio) * maxSpeed);

  const overclocked = Boolean(submission.overclocked) && (submission.overclockCharge ?? 0) >= 0.05;
  const charge = overclocked ? clamp(submission.overclockCharge, 0.15, 1.0) : 0;
  const peakScale = modifiers?.overclockPeakBonusScale ?? 1.0;
  // Tier 1 (3.0x) * 2.0x Overclock = 6.0x per PITCH_BIBLE.md §3.1!
  const overclockMultiplier = overclocked ? round2(1.0 + charge * peakScale) : 1.0;

  let correct = false;
  let partialCreditRatio = 0;
  let bullseye = false;
  let basePoints = BASE_PRISM_POINTS;
  let tierMultiplier = 1.0;
  let correctAnswerDisplay = question.answerCorrect;
  let globeDistanceKm: number | undefined;
  let globeAccuracyTier: ScoredQuestionResult['globeAccuracyTier'];

  if (archetype === 'GLOBE_PIN_DROP' && question.globePin?.targetLabel) {
    correctAnswerDisplay = question.globePin.targetLabel;
  }

  if (!submission.timedOut) {
    switch (archetype) {
      case 'GLOBE_PIN_DROP': {
        const pin = question.globePin;
        if (pin) {
          const targetLabel = pin.targetLabel || question.answerCorrect;
          const bullseyeKm = pin.bullseyeKm > 0 ? pin.bullseyeKm : 300;
          const goldKm = pin.goldKm > 0 ? pin.goldKm : 1000;
          const grazeKm = pin.grazeKm > 0 ? pin.grazeKm : 2200;
          const coords = submission.selectedGlobeCoords;

          if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lon)) {
            const distKm = computeHaversineDistanceKm(
              coords.lat,
              coords.lon,
              pin.targetLat,
              pin.targetLon,
            );
            const roundedKm = Math.round(distKm);
            globeDistanceKm = roundedKm;
            const formattedDist = formatCleanTriviaNumber(roundedKm, 'km');
            correctAnswerDisplay = `${targetLabel} (${formattedDist} km away)`;

            let accuracyFactor = 0;
            let baseConeMult = 0;
            if (distKm <= bullseyeKm) {
              correct = true;
              bullseye = true;
              accuracyFactor = 1.0;
              baseConeMult = 3.5;
              globeAccuracyTier = 'BULLSEYE PINPOINT';
            } else if (distKm <= goldKm) {
              correct = true;
              accuracyFactor = 0.86;
              baseConeMult = 2.5;
              globeAccuracyTier = 'REGIONAL LOCK';
            } else if (distKm <= grazeKm) {
              correct = true;
              accuracyFactor = 0.68;
              baseConeMult = 1.5;
              globeAccuracyTier = 'CONTINENTAL GRAZE';
            } else {
              correct = false;
              globeAccuracyTier = 'OFF TARGET';
            }

            if (correct) {
              partialCreditRatio = accuracyFactor;
              basePoints = Math.round(BASE_PRISM_POINTS * accuracyFactor);
              const peelScale =
                submission.peelTier === 1 ? 1.0 : submission.peelTier === 2 ? 0.78 : 0.55;
              tierMultiplier = round2(baseConeMult * peelScale);
            }
          } else {
            correct = false;
            globeAccuracyTier = 'OFF TARGET';
            correctAnswerDisplay = targetLabel;
          }
        }
        break;
      }

      case 'CALIBRATOR_DIAL': {
        const cal = question.calibrator;
        if (cal) {
          const cleanExact = formatCleanTriviaNumber(cal.exactVal, cal.unit, question.prompt);
          correctAnswerDisplay = `${cleanExact}${cal.unit ? ` ${cal.unit}` : ''}`.trim();
          const est = submission.calibratorEstimate ?? cal.initialEstimate;
          const span = Math.max(cal.step, cal.maxVal - cal.minVal);
          let margin: number;
          if (submission.calibratorConeId) {
            const coneSpec = cal.toleranceCones.find((c) => c.id === submission.calibratorConeId);
            margin = coneSpec
              ? coneSpec.margin
              : Math.max(cal.step, span * 0.15);
            tierMultiplier = coneSpec
              ? coneSpec.multiplier
              : getCalibratorConeMultiplier(submission.calibratorConeId);
          } else {
            const pct = clamp(submission.calibratorTolerancePct ?? 0.15, 0.02, 0.35);
            margin = Math.max(cal.step, span * pct);
            tierMultiplier = getCalibratorConeMultiplier(undefined, pct);
          }

          // Forgiving tolerance cones on MIDDLE_SCHOOL & HIGH_SCHOOL while mathematically
          // guaranteeing 0% untouched `initialEstimate` auto-win!
          if (
            question.difficultyTier === 'MIDDLE_SCHOOL' ||
            question.difficultyTier === 'HIGH_SCHOOL'
          ) {
            const isMid = question.difficultyTier === 'MIDDLE_SCHOOL';
            const coneId = submission.calibratorConeId;
            const forgivingFloorPct =
              coneId === 'PINHOLE'
                ? isMid
                  ? 0.035
                  : 0.025
                : coneId === 'SHARP'
                  ? isMid
                    ? 0.11
                    : 0.085
                  : isMid
                    ? 0.24
                    : 0.2;
            const floorMargin = Math.max(
              cal.step,
              Math.round((span * forgivingFloorPct) / cal.step) * cal.step,
            );
            let widened = Math.max(margin, floorMargin);
            const untouchedDist = Math.abs(cal.initialEstimate - cal.exactVal);
            if (untouchedDist > margin + 1e-6) {
              // Strictly stay below untouched initialEstimate distance so untouched dial NEVER auto-wins!
              const safeCeil = Math.max(margin, untouchedDist - Math.max(cal.step * 0.5, 0.25));
              widened = Math.min(widened, safeCeil);
            }
            margin = widened;
          }

          const error = Math.abs(est - cal.exactVal);
          if (error <= margin + 1e-6) {
            correct = true;
            partialCreditRatio = 1.0;
            bullseye =
              submission.calibratorConeId === 'PINHOLE' ||
              error <= Math.max(cal.step, span * 0.03);
          }
          // Apply peel clue penalty on secondary morphs (Tier 2 = 0.78x, Tier 3 = 0.55x) — eliminates free-peel exploit (#284)!
          if (submission.peelTier > 1) {
            tierMultiplier = round2(tierMultiplier * (submission.peelTier === 2 ? 0.78 : 0.55));
          }
        }
        break;
      }

      case 'CODEX_DUAL_RING': {
        const codex = question.codex;
        if (codex) {
          correctAnswerDisplay = codex.pairs.map((p) => `${p.subject} → ${p.target}`).join(' · ');
          const picks = submission.codexSelectedTargetIndices ?? [];
          let matched = 0;
          for (let s = 0; s < 3; s++) {
            if (picks[s] !== undefined && picks[s] === codex.correctTargetIndexBySubject[s]) {
              matched += 1;
            }
          }
          if (matched === 3) {
            correct = true;
            partialCreditRatio = 1.0;
            tierMultiplier = 3.0;
          } else if (matched === 2) {
            correct = true;
            partialCreditRatio = 0.5;
            basePoints = 600;
            tierMultiplier = 1.5;
          }
          if (correct && submission.peelTier > 1) {
            tierMultiplier = round2(tierMultiplier * (submission.peelTier === 2 ? 0.78 : 0.55));
          }
        }
        break;
      }

      case 'GAUNTLET_SHATTER': {
        const g = question.gauntlet;
        if (g && submission.gauntletAction) {
          const normalizedAction: GauntletAction =
            submission.gauntletAction === 'TRUE'
              ? 'VERIFY'
              : submission.gauntletAction === 'FALSE'
                ? 'DEBUNK'
                : submission.gauntletAction;

          correctAnswerDisplay = g.isTrick
            ? `CHALLENGE! (${g.isTrue ? 'True' : 'False'})`
            : g.isTrue
              ? 'VERIFY (True)'
              : 'DEBUNK (False)';

          if (normalizedAction === 'CHALLENGE' && g.isTrick) {
            correct = true;
            partialCreditRatio = 1.0;
            tierMultiplier = 2.5;
          } else if (normalizedAction === 'VERIFY' && g.isTrue) {
            correct = true;
            partialCreditRatio = 1.0;
            tierMultiplier = 1.5;
          } else if (normalizedAction === 'DEBUNK' && !g.isTrue) {
            correct = true;
            partialCreditRatio = 1.0;
            tierMultiplier = 1.5;
          }
        }
        break;
      }

      case 'HERO_ARTIFACT_SYNTHESIS': {
        const stepIdx = submission.synthesisStepIndex ?? 0;
        const step = question.heroSynthesis?.steps?.[stepIdx];
        const facets = step?.facets ?? question.facets;
        const expectedCorrectIdx = step?.correctFacetIndex ?? question.correctFacetIndex;
        const expectedAnswerText = step?.answerCorrect ?? question.answerCorrect;
        correctAnswerDisplay = expectedAnswerText;
        tierMultiplier = getSightlineTierMultiplier(submission.peelTier);

        if (typeof submission.selectedText === 'string' && submission.selectedText.length > 0) {
          correct =
            submission.selectedText.trim().toLowerCase() ===
            expectedAnswerText.trim().toLowerCase();
        } else if (submission.selectedFacetIndex !== undefined) {
          const pickedFacet = facets[submission.selectedFacetIndex];
          correct =
            Boolean(pickedFacet?.isCorrect) ||
            submission.selectedFacetIndex === expectedCorrectIdx;
        }
        if (correct) partialCreditRatio = 1.0;
        break;
      }

      case 'SIGHTLINE_LOCK':
      default: {
        tierMultiplier = getSightlineTierMultiplier(submission.peelTier);
        if (typeof submission.selectedText === 'string' && submission.selectedText.length > 0) {
          correct =
            submission.selectedText.trim().toLowerCase() ===
            question.answerCorrect.trim().toLowerCase();
        } else if (submission.selectedFacetIndex !== undefined) {
          const pickedFacet = question.facets?.[submission.selectedFacetIndex];
          correct =
            Boolean(pickedFacet?.isCorrect) ||
            submission.selectedFacetIndex === question.correctFacetIndex;
        }
        if (correct) partialCreditRatio = 1.0;
        break;
      }
    }
  }

  let perkMultiplier = 1.0;
  if (submission.peelTier === 1 && modifiers?.tier1BonusMultiplier) {
    perkMultiplier *= modifiers.tier1BonusMultiplier;
  }
  if (
    SOVEREIGN_BONUS_DOMAINS.has(question.l0Domain) &&
    modifiers?.sovereignDomainMultiplier &&
    modifiers.sovereignDomainMultiplier > 1
  ) {
    perkMultiplier *= modifiers.sovereignDomainMultiplier;
  }
  if (modifiers?.strataMultiplier && modifiers.strataMultiplier > 1) {
    perkMultiplier *= modifiers.strataMultiplier;
  }
  const appliedDifficultyMultiplier =
    modifiers?.difficultyTierMultiplier && modifiers.difficultyTierMultiplier > 0
      ? modifiers.difficultyTierMultiplier
      : modifiers?.applyQuestionDifficultyMultiplier && question.difficultyMultiplier
        ? question.difficultyMultiplier
        : 1.0;
  if (appliedDifficultyMultiplier > 1) {
    perkMultiplier *= appliedDifficultyMultiplier;
  }
  if (modifiers?.streakComboMultiplierBonus && modifiers.streakComboMultiplierBonus > 0) {
    perkMultiplier += modifiers.streakComboMultiplierBonus;
  }
  perkMultiplier = round2(perkMultiplier);

  const streakAfter = correct ? currentStreak + 1 : 0;
  const streakBonus =
    correct && streakAfter >= 2
      ? Math.min(streakAfter - 1, MAX_STREAK_STEPS) * STREAK_STEP_POINTS
      : 0;
  const speedBonus = correct ? rawSpeedBonus : 0;
  const clueLadderBonus =
    correct && modifiers?.clueLadderBonusPoints && modifiers.clueLadderBonusPoints > 0
      ? Math.round(modifiers.clueLadderBonusPoints)
      : 0;
  const gambitBonus =
    correct && modifiers?.gambitFlatBonusPoints && modifiers.gambitFlatBonusPoints > 0
      ? Math.round(modifiers.gambitFlatBonusPoints)
      : 0;

  let pointsEarned = 0;
  if (correct) {
    const coreScore = Math.round(
      basePoints * tierMultiplier * perkMultiplier * overclockMultiplier
    );
    pointsEarned = Math.max(
      basePoints,
      coreScore + speedBonus + streakBonus + clueLadderBonus + gambitBonus
    );
    if (modifiers?.finaleJackpotMultiplier && modifiers.finaleJackpotMultiplier > 1) {
      pointsEarned = Math.round(pointsEarned * modifiers.finaleJackpotMultiplier);
    } else if (submission.doubleOrNothingActive) {
      pointsEarned = Math.round(pointsEarned * 2.0);
    }
  }

  const backfired = !correct && overclocked;

  return {
    qid: question.qid,
    domainId: question.l0Domain,
    archetype,
    correct,
    partialCreditRatio,
    bullseye,
    backfired,
    peelTier: submission.peelTier,
    overclocked,
    overclockCharge: charge,
    basePoints: correct ? basePoints : 0,
    tierMultiplier: correct ? tierMultiplier : 0,
    perkMultiplier: correct ? perkMultiplier : 1,
    overclockMultiplier: correct ? overclockMultiplier : 1,
    speedBonus,
    streakAfter,
    streakBonus,
    pointsEarned,
    correctAnswerDisplay,
    whyExplanation: question.whyExplanation,
    promptSnapshot: question.prompt,
    ...(globeDistanceKm !== undefined ? { globeDistanceKm } : {}),
    ...(globeAccuracyTier !== undefined ? { globeAccuracyTier } : {}),
    ...(question.difficultyTier ? { difficultyTier: question.difficultyTier } : {}),
    difficultyMultiplier: correct ? round2(appliedDifficultyMultiplier) : 1,
    ...(clueLadderBonus > 0 ? { clueLadderBonus } : {}),
    ...(gambitBonus > 0 ? { gambitBonus } : {}),
  };
}

/**
 * Stateful Match Score Ledger with Ironclad Permanent Score Banking!
 * Guarantees mathematically that earned base points on solved questions can NEVER be wiped to 0!
 */
export class ScoringEngine {
  private matchScore = 0;
  private permanentBankedFloor = 0;
  private streak = 0;
  private maxStreak = 0;
  private correctCount = 0;
  private totalAnswered = 0;
  private overclockHits = 0;
  private overclockAttempts = 0;
  private bullseyeHits = 0;
  private peelTierSum = 0;
  private readonly history: ScoredQuestionResult[] = [];

  constructor(startingBonusPoints = 0) {
    const cleanBonus = Math.max(0, Math.round(startingBonusPoints));
    this.matchScore = cleanBonus;
    this.permanentBankedFloor = 0;
  }

  public reset(startingBonusPoints = 0): void {
    const cleanBonus = Math.max(0, Math.round(startingBonusPoints));
    this.matchScore = cleanBonus;
    this.permanentBankedFloor = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.overclockHits = 0;
    this.overclockAttempts = 0;
    this.bullseyeHits = 0;
    this.peelTierSum = 0;
    this.history.length = 0;
  }

  public submitAnswer(
    question: PrismQuestion,
    submission: PrismAnswerSubmission,
    modifiers?: ScoringModifierOptions
  ): ScoredQuestionResult {
    const evaluated = evaluatePrismAnswer(question, submission, this.streak, modifiers);

    this.totalAnswered += 1;
    this.peelTierSum += submission.peelTier;
    if (evaluated.overclocked) {
      this.overclockAttempts += 1;
    }

    if (evaluated.correct) {
      this.correctCount += 1;
      this.streak = evaluated.streakAfter;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }
      if (evaluated.overclocked) {
        this.overclockHits += 1;
      }
      if (evaluated.bullseye) {
        this.bullseyeHits += 1;
      }

      // Lock un-wagered earned base points permanently into permanentBankedFloor!
      const unriskedBaseGain = Math.max(
        evaluated.basePoints,
        Math.round(evaluated.basePoints * evaluated.tierMultiplier * evaluated.perkMultiplier) +
          evaluated.speedBonus
      );
      this.permanentBankedFloor += unriskedBaseGain;
      this.matchScore += evaluated.pointsEarned;
    } else {
      this.streak = 0;
      // Optional Double-or-Nothing only ever risks optional excess points ABOVE permanentBankedFloor!
      // Skipped cleanly when `zeroDoubleDownPenalty` (e.g. Vault Jackpot Gambit) is active.
      if (
        submission.doubleOrNothingActive &&
        !modifiers?.zeroDoubleDownPenalty &&
        this.matchScore > this.permanentBankedFloor
      ) {
        this.matchScore = Math.max(this.permanentBankedFloor, this.matchScore - 800);
      }
    }

    // Ironclad invariant: if correctCount > 0, matchScore >= permanentBankedFloor >= correctCount * 600+!
    this.matchScore = Math.max(this.permanentBankedFloor, this.matchScore);

    const fullResult: ScoredQuestionResult = {
      ...evaluated,
      matchScoreAfter: this.matchScore,
      permanentBankedFloor: this.permanentBankedFloor,
    };
    this.history.push(fullResult);
    return fullResult;
  }

  /**
   * Adds flat bonus points (e.g. +1,500 Bluff Call Bonus!) directly into banked matchScore.
   */
  public awardBonusPoints(points: number): number {
    const clean = Math.max(0, Math.round(points));
    this.matchScore += clean;
    this.permanentBankedFloor += clean;
    return this.matchScore;
  }

  public getMatchScore(): number {
    return this.matchScore;
  }

  public getPermanentBankedFloor(): number {
    return this.permanentBankedFloor;
  }

  public getStreak(): number {
    return this.streak;
  }

  public getMaxStreak(): number {
    return this.maxStreak;
  }

  public getCorrectCount(): number {
    return this.correctCount;
  }

  public getTotalAnswered(): number {
    return this.totalAnswered;
  }

  public getOverclockHits(): number {
    return this.overclockHits;
  }

  public getOverclockAttempts(): number {
    return this.overclockAttempts;
  }

  public getBullseyeHits(): number {
    return this.bullseyeHits;
  }

  public getAveragePeelTier(): number {
    if (this.totalAnswered === 0) return 1.0;
    return round2(this.peelTierSum / this.totalAnswered);
  }

  public getHistory(): readonly ScoredQuestionResult[] {
    return this.history;
  }
}
