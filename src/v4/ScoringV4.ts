// ============================================================================
// WORLD'S SMARTEST v4.0 — Honest 1:1 Scoring & Real Rival Stakes Engine
// Guarantees exact 1:1 conservation between UI tile badges, score breakdowns,
// scoreboard totals, wager risk, and Rival victory rules.
// ============================================================================

import type {
  EvaluatedAnswerV4,
  StageBoardStateV4,
  TileTwistKind,
} from './contracts';

export type TilePointValueV4 = 100 | 200 | 400 | 800;

export const VALID_TILE_POINT_VALUES_V4: readonly TilePointValueV4[] = [
  100,
  200,
  400,
  800,
] as const;

/** Exact base point value in non-board modes (Single, Daily, Endless). */
export const NON_BOARD_BASE_POINTS_V4 = 200;

/** Clean additive streak step (+25 per streak, capped at 8 -> +200 max). */
export const STREAK_STEP_POINTS_V4 = 25;
export const MAX_STREAK_BONUS_STEPS_V4 = 8;

/** 2x Double Down miss penalty: -0.5x base tile points (-50 to -400). */
export const DOUBLE_DOWN_MISS_FRACTION_V4 = 0.5;

/** Daily-Double-style Power Play wager floor and minimum ceiling. */
export const POWER_PLAY_MIN_WAGER_V4 = 50;
export const POWER_PLAY_MIN_MAX_WAGER_V4 = 200;

/** Rival Bounty stakes: beat it to steal +300; miss and Rival gains +200. */
export const RIVAL_BOUNTY_WIN_STEAL_V4 = 300;
export const RIVAL_BOUNTY_MISS_GAIN_V4 = 200;

/** Show Wheel immediate point awards/steals. */
export const WHEEL_STEAL_RIVAL_POINTS_V4 = 250;
export const WHEEL_SOLO_POT_BONUS_V4 = 150;
export const WHEEL_WEDGE_MAXED_BONUS_V4 = 200;

export type WheelActiveEffectV4 = 'NONE' | 'DOUBLE_POT' | 'HOT_SEAT_ALL_IN';

export interface PowerPlayWagerBoundsV4 {
  readonly minWager: number;
  readonly maxWager: number;
  readonly suggestedWager: number;
}

export interface ScoreQuestionInputV4 {
  readonly isCorrect: boolean;
  /** Exact tile value (100 | 200 | 400 | 800), or 200 default for non-board modes. */
  readonly baseTilePoints?: number;
  readonly currentPlayerScore: number;
  readonly currentRivalScore?: number;
  readonly hasActiveRival?: boolean;
  /** Active consecutive-hit streak entering this question (0 -> +0, 1 -> +25, ..., 8+ -> +200). */
  readonly currentStreak?: number;
  /** Optional 0..1 partial accuracy (used for reporting/display; defaults to 1 on hit, 0 on miss). */
  readonly accuracyRatio?: number;
  readonly isBullseyeOrSweep?: boolean;
  /** Armed BEFORE answering: Hit = 2x base points, Miss = -0.5x base points. */
  readonly doubleDownArmed?: boolean;
  /** When set on a POWER_PLAY tile (or wager question), Hit = +wager, Miss = -wager. */
  readonly powerPlayWager?: number | null;
  readonly twist?: TileTwistKind;
  readonly wheelEffect?: WheelActiveEffectV4;
  /**
   * When false (default), total player/rival scores floor at 0 (still subtracting up to
   * currentScore, NEVER silently zeroing when the player has points).
   * When true, full negative penalties apply without a 0 floor.
   */
  readonly allowNegative?: boolean;
  readonly correctSummaryLabel?: string;
  /** Optional explicit format bonus (e.g. Clue Escalator early solve) cleanly included in total. */
  readonly extraFormatBonusPoints?: number;
}

export interface ScoreResolutionV4 {
  readonly evaluated: EvaluatedAnswerV4;
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
  readonly playerDelta: number;
  readonly previousRivalScore: number;
  readonly newRivalScore: number;
  readonly rivalDelta: number;
  readonly bountyPlayerDelta: number;
  readonly bountyRivalDelta: number;
  readonly streakBonusPoints: number;
  readonly newStreak: number;
  readonly wasClampedAtZero: boolean;
  readonly effectivePowerPlayWager: number | null;
}

export interface TileScorePreviewInputV4 {
  readonly baseTilePoints?: number;
  readonly currentPlayerScore: number;
  readonly currentStreak?: number;
  readonly doubleDownArmed?: boolean;
  readonly powerPlayWager?: number | null;
  readonly wheelEffect?: WheelActiveEffectV4;
  readonly twist?: TileTwistKind;
  readonly allowNegative?: boolean;
}

export interface TileScorePreviewV4 {
  readonly basePoints: number;
  readonly streakBonus: number;
  readonly standardHitDelta: number;
  readonly standardMissDelta: number;
  readonly doubleDownHitDelta: number;
  readonly doubleDownMissRawDelta: number;
  readonly doubleDownMissAppliedDelta: number;
  readonly badgeText: string;
}

export interface VictoryCheckOptionsV4 {
  /** If true and scores + wedges + cleared wins are 100% deadlocked, player still loses tiebreak (default true). */
  readonly strictOnDeadlock?: boolean;
}

export type BoardVictoryReasonV4 =
  | 'OUTSCORED_RIVAL'
  | 'TIEBREAK_WEDGES'
  | 'TIEBREAK_TILES_WON'
  | 'TIEBREAK_DEADLOCK_WIN'
  | 'OUTSCORED_BY_RIVAL'
  | 'TIEBREAK_RIVAL_WEDGES'
  | 'TIEBREAK_RIVAL_TILES_WON'
  | 'TIEBREAK_DEADLOCK_LOSS'
  | 'MET_SOLO_TARGET'
  | 'BELOW_SOLO_TARGET';

export interface BoardVictoryOutcomeV4 {
  readonly playerWon: boolean;
  readonly reason: BoardVictoryReasonV4;
  readonly playerScore: number;
  readonly rivalScore: number;
  readonly soloTargetScore: number;
  readonly scoreMargin: number;
  readonly playerWedgeCount: number;
  readonly rivalWedgeCount: number;
  readonly playerTilesWon: number;
  readonly rivalTilesClaimed: number;
  readonly starsEarned: 0 | 1 | 2 | 3;
  readonly headlineSummary: string;
}

function sanitizeInt(value: number | undefined | null, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.round(value);
}

/**
 * Clean additive streak bonus: `+25 * min(streak, 8)` (0..+200).
 */
export function computeStreakBonus(streak: number): number {
  const safeStreak = Math.max(0, Math.floor(Number.isFinite(streak) ? streak : 0));
  return STREAK_STEP_POINTS_V4 * Math.min(safeStreak, MAX_STREAK_BONUS_STEPS_V4);
}

/**
 * Computes valid Power Play (Daily Double) wager bounds:
 * `50` up to `max(200, playerScore)`.
 */
export function getPowerPlayWagerBounds(playerScore: number): PowerPlayWagerBoundsV4 {
  const safeScore = sanitizeInt(playerScore, 0);
  const minWager = POWER_PLAY_MIN_WAGER_V4;
  const maxWager = Math.max(POWER_PLAY_MIN_MAX_WAGER_V4, safeScore);
  const halfPot = Math.round((maxWager * 0.5) / 50) * 50;
  const suggestedWager = Math.max(minWager, Math.min(maxWager, halfPot || minWager));
  return { minWager, maxWager, suggestedWager };
}

/**
 * Clamps a submitted Power Play wager cleanly into `[50, max(200, playerScore)]`.
 */
export function clampPowerPlayWager(wagerPoints: number, playerScore: number): number {
  const { minWager, maxWager } = getPowerPlayWagerBounds(playerScore);
  const rounded = sanitizeInt(wagerPoints, minWager);
  return Math.max(minWager, Math.min(maxWager, rounded));
}

/**
 * Applies a signed delta to a score, clamping at 0 unless `allowNegative` is true.
 * Guarantees `newScore === previousScore + appliedDelta`.
 */
export function applyScoreDelta(
  previousScore: number,
  rawDelta: number,
  allowNegative = false,
): { readonly newScore: number; readonly appliedDelta: number; readonly wasClampedAtZero: boolean } {
  const prev = sanitizeInt(previousScore, 0);
  const delta = sanitizeInt(rawDelta, 0);
  const unclamped = prev + delta;
  if (!allowNegative && unclamped < 0) {
    const clampedScore = 0;
    return {
      newScore: clampedScore,
      appliedDelta: clampedScore - prev,
      wasClampedAtZero: true,
    };
  }
  return {
    newScore: unclamped,
    appliedDelta: delta,
    wasClampedAtZero: false,
  };
}

/**
 * Computes exact 1:1 preview deltas so UI buttons ALWAYS match engine math.
 */
export function previewTileScoring(input: TileScorePreviewInputV4): TileScorePreviewV4 {
  const basePoints = Math.max(0, sanitizeInt(input.baseTilePoints, NON_BOARD_BASE_POINTS_V4));
  const currentScore = sanitizeInt(input.currentPlayerScore, 0);
  const streakBonus = computeStreakBonus(input.currentStreak ?? 0);
  const allowNegative = Boolean(input.allowNegative);
  const wheelEffect = input.wheelEffect ?? 'NONE';
  const bountyBonus = input.twist === 'RIVAL_BOUNTY' ? RIVAL_BOUNTY_WIN_STEAL_V4 : 0;

  if (input.powerPlayWager != null) {
    const wager = clampPowerPlayWager(input.powerPlayWager, currentScore);
    const missApplied = applyScoreDelta(currentScore, -wager, allowNegative).appliedDelta;
    return {
      basePoints: 0,
      streakBonus: 0,
      standardHitDelta: wager,
      standardMissDelta: missApplied,
      doubleDownHitDelta: wager,
      doubleDownMissRawDelta: -wager,
      doubleDownMissAppliedDelta: missApplied,
      badgeText: `Power Play: +${wager} / ${missApplied}`,
    };
  }

  const wheelHitBonus = wheelEffect === 'DOUBLE_POT' || wheelEffect === 'HOT_SEAT_ALL_IN' ? basePoints : 0;
  const wheelMissRaw = wheelEffect === 'HOT_SEAT_ALL_IN' ? -basePoints : 0;
  const standardHitDelta = basePoints + streakBonus + wheelHitBonus + bountyBonus;
  const standardMissDelta = applyScoreDelta(currentScore, wheelMissRaw, allowNegative).appliedDelta;

  const doubleDownHitDelta = basePoints * 2 + streakBonus + wheelHitBonus + bountyBonus;
  const doubleDownMissRawDelta = -Math.round(basePoints * DOUBLE_DOWN_MISS_FRACTION_V4) + wheelMissRaw;
  const doubleDownMissAppliedDelta = applyScoreDelta(
    currentScore,
    doubleDownMissRawDelta,
    allowNegative,
  ).appliedDelta;

  let badgeText: string;
  if (input.doubleDownArmed) {
    badgeText = `2x Double Down: +${doubleDownHitDelta} / ${doubleDownMissAppliedDelta}`;
  } else if (streakBonus > 0 || wheelHitBonus > 0 || bountyBonus > 0) {
    badgeText = `+${standardHitDelta} (${basePoints} base${streakBonus > 0 ? ` + ${streakBonus} streak` : ''}${wheelHitBonus > 0 ? ` + ${wheelHitBonus} wheel` : ''}${bountyBonus > 0 ? ` + ${bountyBonus} bounty` : ''})`;
  } else {
    badgeText = `+${basePoints}`;
  }

  return {
    basePoints,
    streakBonus,
    standardHitDelta,
    standardMissDelta,
    doubleDownHitDelta,
    doubleDownMissRawDelta,
    doubleDownMissAppliedDelta,
    badgeText,
  };
}

/**
 * Authoritative 1:1 score resolver for World's Smartest v4.0.
 *
 * Invariants guaranteed on every return value:
 *   1. `evaluated.netPointsDelta === evaluated.basePoints + evaluated.bonusPoints + evaluated.wagerDeltaPoints`
 *   2. `playerDelta === evaluated.netPointsDelta`
 *   3. `newPlayerScore === previousPlayerScore + playerDelta`
 *   4. `newRivalScore === previousRivalScore + rivalDelta`
 */
export function scoreAnswerV4(input: ScoreQuestionInputV4): ScoreResolutionV4 {
  const previousPlayerScore = sanitizeInt(input.currentPlayerScore, 0);
  const previousRivalScore = sanitizeInt(input.currentRivalScore, 0);
  const hasActiveRival = Boolean(input.hasActiveRival);
  const allowNegative = Boolean(input.allowNegative);
  const baseTilePoints = Math.max(0, sanitizeInt(input.baseTilePoints, NON_BOARD_BASE_POINTS_V4));
  const currentStreak = Math.max(0, Math.floor(input.currentStreak ?? 0));
  const wheelEffect: WheelActiveEffectV4 = input.wheelEffect ?? 'NONE';
  const twist: TileTwistKind = input.twist ?? 'NONE';
  const isPowerPlay = input.powerPlayWager != null;
  const isDoubleDown = !isPowerPlay && Boolean(input.doubleDownArmed);
  const extraFormatBonus = input.isCorrect ? Math.max(0, sanitizeInt(input.extraFormatBonusPoints, 0)) : 0;

  let basePoints = 0;
  let bonusPoints = 0;
  let wagerDeltaPoints = 0;
  let streakBonusPoints = 0;
  let bountyPlayerDelta = 0;
  let bountyRivalDelta = 0;
  let effectivePowerPlayWager: number | null = null;
  const parts: string[] = [];

  if (isPowerPlay) {
    // POWER PLAY (Daily Double): Hit = +wagerPoints, Miss = -wagerPoints!
    const wager = clampPowerPlayWager(input.powerPlayWager as number, previousPlayerScore);
    effectivePowerPlayWager = wager;
    if (input.isCorrect) {
      wagerDeltaPoints = wager;
      parts.push(`+${wager} Power Play wager`);
    } else {
      wagerDeltaPoints = -wager;
      parts.push(`-${wager} Power Play miss`);
    }
  } else {
    // Standard tile or non-board question
    if (input.isCorrect) {
      basePoints = baseTilePoints;
      parts.push(`+${basePoints} base`);

      streakBonusPoints = computeStreakBonus(currentStreak);
      if (streakBonusPoints > 0) {
        bonusPoints += streakBonusPoints;
        parts.push(`+${streakBonusPoints} streak`);
      }

      if (extraFormatBonus > 0) {
        bonusPoints += extraFormatBonus;
        parts.push(`+${extraFormatBonus} format bonus`);
      }

      if (isDoubleDown) {
        // Hit = 2x base points (basePoints + wagerDeltaPoints = 2 * basePoints)
        wagerDeltaPoints += baseTilePoints;
        parts.push(`+${baseTilePoints} 2x Double Down`);
      }

      if (wheelEffect === 'DOUBLE_POT') {
        bonusPoints += baseTilePoints;
        parts.push(`+${baseTilePoints} Show Wheel 2x Pot`);
      } else if (wheelEffect === 'HOT_SEAT_ALL_IN') {
        wagerDeltaPoints += baseTilePoints;
        parts.push(`+${baseTilePoints} Hot Seat All-In`);
      }
    } else {
      // Missed question: apply honest Double Down (-0.5x base) and/or Hot Seat (-1x base) penalty!
      if (isDoubleDown) {
        const ddPenalty = -Math.round(baseTilePoints * DOUBLE_DOWN_MISS_FRACTION_V4);
        wagerDeltaPoints += ddPenalty;
        parts.push(`${ddPenalty} 2x Double Down miss`);
      }
      if (wheelEffect === 'HOT_SEAT_ALL_IN') {
        wagerDeltaPoints -= baseTilePoints;
        parts.push(`-${baseTilePoints} Hot Seat miss`);
      }
      if (parts.length === 0) {
        parts.push('0 pts (miss)');
      }
    }

    // Rival Bounty twist (+300 steal on win; Rival +200 on miss)
    if (twist === 'RIVAL_BOUNTY') {
      if (input.isCorrect) {
        bountyPlayerDelta = RIVAL_BOUNTY_WIN_STEAL_V4;
        bonusPoints += bountyPlayerDelta;
        if (hasActiveRival) {
          const rivalSteal = applyScoreDelta(
            previousRivalScore,
            -RIVAL_BOUNTY_WIN_STEAL_V4,
            allowNegative,
          );
          bountyRivalDelta = rivalSteal.appliedDelta;
          parts.push(`+${bountyPlayerDelta} Bounty (Rival ${bountyRivalDelta})`);
        } else {
          parts.push(`+${bountyPlayerDelta} Bounty bonus`);
        }
      } else if (hasActiveRival) {
        bountyRivalDelta = RIVAL_BOUNTY_MISS_GAIN_V4;
        parts.push(`Rival +${bountyRivalDelta} Bounty`);
      }
    }
  }

  // Apply score floor cleanly without breaking 1:1 conservation
  const rawNetDelta = basePoints + bonusPoints + wagerDeltaPoints;
  const playerApplied = applyScoreDelta(previousPlayerScore, rawNetDelta, allowNegative);
  if (playerApplied.wasClampedAtZero) {
    // Adjust wagerDeltaPoints by the exact clamp difference so base + bonus + wager === net!
    const clampAdjustment = playerApplied.appliedDelta - rawNetDelta;
    wagerDeltaPoints += clampAdjustment;
    parts.push('floored at 0');
  }

  const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
  const newPlayerScore = previousPlayerScore + netPointsDelta;
  const newRivalScore = previousRivalScore + bountyRivalDelta;
  const newStreak = input.isCorrect ? currentStreak + 1 : 0;

  const accuracyRatio =
    typeof input.accuracyRatio === 'number' && Number.isFinite(input.accuracyRatio)
      ? Math.max(0, Math.min(1, input.accuracyRatio))
      : input.isCorrect
        ? 1
        : 0;

  const evaluated: EvaluatedAnswerV4 = {
    isCorrect: input.isCorrect,
    accuracyRatio,
    isBullseyeOrSweep: Boolean(input.isBullseyeOrSweep),
    basePoints,
    bonusPoints,
    wagerDeltaPoints,
    netPointsDelta,
    correctSummaryLabel:
      input.correctSummaryLabel ?? (input.isCorrect ? 'Correct' : 'Missed'),
    detailBreakdown: parts.join(' | '),
  };

  return {
    evaluated,
    previousPlayerScore,
    newPlayerScore,
    playerDelta: netPointsDelta,
    previousRivalScore,
    newRivalScore,
    rivalDelta: bountyRivalDelta,
    bountyPlayerDelta,
    bountyRivalDelta,
    streakBonusPoints,
    newStreak,
    wasClampedAtZero: playerApplied.wasClampedAtZero,
    effectivePowerPlayWager,
  };
}

/**
 * Reconciles an `EvaluatedAnswerV4` (e.g., returned by `QuestionGeneratorV4.evaluateSubmissionV4`
 * or constructed directly by a caller) with board-level stakes (Power Play wager, Double Down,
 * Streak, Wheel effect, Rival Bounty) without ever double-counting.
 */
export function reconcileEvaluatedAnswerForBoard(params: {
  readonly evalResult: EvaluatedAnswerV4;
  readonly tilePointValue: number;
  readonly tileTwist: TileTwistKind;
  readonly currentPlayerScore: number;
  readonly currentRivalScore: number;
  readonly hasActiveRival: boolean;
  readonly currentStreak?: number;
  readonly doubleDownArmed?: boolean;
  readonly powerPlayWager?: number | null;
  readonly wheelEffect?: WheelActiveEffectV4;
  readonly allowNegative?: boolean;
  /**
   * When true, trusts `evalResult.netPointsDelta` directly (applying only 0-floor clamping if
   * `!allowNegative` and Rival Bounty if `applyBountyOnFinalized` is true).
   */
  readonly evalResultIsFinalized?: boolean;
  readonly applyBountyOnFinalized?: boolean;
}): ScoreResolutionV4 {
  const {
    evalResult,
    tilePointValue,
    tileTwist,
    currentPlayerScore,
    currentRivalScore,
    hasActiveRival,
    currentStreak = 0,
    doubleDownArmed = false,
    powerPlayWager = null,
    wheelEffect = 'NONE',
    allowNegative = false,
    evalResultIsFinalized = false,
    applyBountyOnFinalized = false,
  } = params;

  const hasBoardModifiers =
    powerPlayWager != null ||
    doubleDownArmed ||
    wheelEffect !== 'NONE' ||
    (evalResult.isCorrect && currentStreak > 0);

  if (!evalResultIsFinalized && hasBoardModifiers) {
    // Preserve partial-credit base points on hits when 0 < accuracyRatio < 1
    // (e.g. partial Match-4 / Sort-4 / Pinpoint) instead of overwriting with full tilePointValue.
    const isPartialHit =
      evalResult.isCorrect &&
      Number.isFinite(evalResult.accuracyRatio) &&
      evalResult.accuracyRatio > 0 &&
      evalResult.accuracyRatio < 1;

    const effectiveBaseTilePoints = isPartialHit
      ? evalResult.basePoints > 0
        ? Math.min(tilePointValue, sanitizeInt(evalResult.basePoints, 0))
        : Math.round(tilePointValue * evalResult.accuracyRatio)
      : tilePointValue;

    // Preserve any non-negative format-specific bonus (such as Clue Escalator early solve).
    const extraFormatBonusPoints =
      evalResult.isCorrect && evalResult.bonusPoints > 0 ? evalResult.bonusPoints : 0;

    return scoreAnswerV4({
      isCorrect: evalResult.isCorrect,
      baseTilePoints: effectiveBaseTilePoints,
      currentPlayerScore,
      currentRivalScore,
      hasActiveRival,
      currentStreak,
      accuracyRatio: evalResult.accuracyRatio,
      isBullseyeOrSweep: evalResult.isBullseyeOrSweep,
      doubleDownArmed,
      powerPlayWager,
      twist: tileTwist,
      wheelEffect,
      allowNegative,
      correctSummaryLabel: evalResult.correctSummaryLabel,
      extraFormatBonusPoints,
    });
  }

  // Honor `evalResult.netPointsDelta` 1:1 (exact conservation) and optionally resolve Rival Bounty.
  const prevPlayer = sanitizeInt(currentPlayerScore, 0);
  const prevRival = sanitizeInt(currentRivalScore, 0);

  let basePoints = sanitizeInt(evalResult.basePoints, 0);
  let bonusPoints = sanitizeInt(evalResult.bonusPoints, 0);
  let wagerDeltaPoints = sanitizeInt(evalResult.wagerDeltaPoints, 0);

  // Guard against callers providing only `netPointsDelta` with zeroed subfields
  const subfieldSum = basePoints + bonusPoints + wagerDeltaPoints;
  const rawEvalNet = sanitizeInt(evalResult.netPointsDelta, subfieldSum);
  if (subfieldSum !== rawEvalNet) {
    const diff = rawEvalNet - subfieldSum;
    if (rawEvalNet < 0) {
      wagerDeltaPoints += diff;
    } else {
      basePoints += diff;
    }
  }

  let bountyPlayerDelta = 0;
  let bountyRivalDelta = 0;
  const extraParts: string[] = [];

  if (tileTwist === 'RIVAL_BOUNTY' && (!evalResultIsFinalized || applyBountyOnFinalized)) {
    if (evalResult.isCorrect) {
      bountyPlayerDelta = RIVAL_BOUNTY_WIN_STEAL_V4;
      bonusPoints += bountyPlayerDelta;
      if (hasActiveRival) {
        const rivalSteal = applyScoreDelta(
          prevRival,
          -RIVAL_BOUNTY_WIN_STEAL_V4,
          allowNegative,
        );
        bountyRivalDelta = rivalSteal.appliedDelta;
        extraParts.push(`+${bountyPlayerDelta} Bounty (Rival ${bountyRivalDelta})`);
      } else {
        extraParts.push(`+${bountyPlayerDelta} Bounty`);
      }
    } else if (hasActiveRival) {
      bountyRivalDelta = RIVAL_BOUNTY_MISS_GAIN_V4;
      extraParts.push(`Rival +${bountyRivalDelta} Bounty`);
    }
  }

  const rawNet = basePoints + bonusPoints + wagerDeltaPoints;
  const applied = applyScoreDelta(prevPlayer, rawNet, allowNegative);
  if (applied.wasClampedAtZero) {
    wagerDeltaPoints += applied.appliedDelta - rawNet;
    extraParts.push('floored at 0');
  }

  const finalNet = basePoints + bonusPoints + wagerDeltaPoints;
  const breakdownBase = evalResult.detailBreakdown?.trim() || `${finalNet >= 0 ? '+' : ''}${finalNet}`;
  const detailBreakdown =
    extraParts.length > 0 ? `${breakdownBase} | ${extraParts.join(' | ')}` : breakdownBase;

  const evaluated: EvaluatedAnswerV4 = {
    isCorrect: evalResult.isCorrect,
    accuracyRatio: evalResult.accuracyRatio,
    isBullseyeOrSweep: evalResult.isBullseyeOrSweep,
    basePoints,
    bonusPoints,
    wagerDeltaPoints,
    netPointsDelta: finalNet,
    correctSummaryLabel: evalResult.correctSummaryLabel,
    detailBreakdown,
  };

  return {
    evaluated,
    previousPlayerScore: prevPlayer,
    newPlayerScore: prevPlayer + finalNet,
    playerDelta: finalNet,
    previousRivalScore: prevRival,
    newRivalScore: prevRival + bountyRivalDelta,
    rivalDelta: bountyRivalDelta,
    bountyPlayerDelta,
    bountyRivalDelta,
    streakBonusPoints: 0,
    newStreak: evalResult.isCorrect ? currentStreak + 1 : 0,
    wasClampedAtZero: applied.wasClampedAtZero,
    effectivePowerPlayWager: null,
  };
}

/**
 * Honest Stage Victory Evaluation — ZERO fake participation `||` passes!
 *
 * - When `board.hasActiveRival === true`:
 *     - `playerScore > rivalScore` -> WIN
 *     - `playerScore < rivalScore` -> LOSS (even if `playerScore >= soloTargetScore`!)
 *     - `playerScore === rivalScore` -> Tiebreaker:
 *         1. More Crown Wedges (`earnedWedges.length > rivalWedges.length`)
 *         2. More tiles won (`CLEARED_WIN` > `CLAIMED_BY_RIVAL`)
 *         3. Deadlock -> LOSS (strictly must outplay the Challenger unless `strictOnDeadlock: false`)
 * - When `board.hasActiveRival === false` (Episode 1 solo tryout):
 *     - `playerScore >= soloTargetScore` -> WIN, else LOSS.
 */
export function evaluateBoardOutcome(
  board: StageBoardStateV4,
  options?: VictoryCheckOptionsV4,
): BoardVictoryOutcomeV4 {
  const strictOnDeadlock = options?.strictOnDeadlock ?? true;
  const playerScore = sanitizeInt(board.playerScore, 0);
  const rivalScore = sanitizeInt(board.rivalScore, 0);
  const soloTargetScore = sanitizeInt(board.soloTargetScore, 0);
  const playerWedgeCount = board.earnedWedges.length;
  const rivalWedgeCount = board.rivalWedges.length;

  let playerTilesWon = 0;
  let rivalTilesClaimed = 0;
  for (const tile of board.tiles) {
    if (tile.status === 'CLEARED_WIN') playerTilesWon++;
    else if (tile.status === 'CLAIMED_BY_RIVAL') rivalTilesClaimed++;
  }

  let playerWon = false;
  let reason: BoardVictoryReasonV4;
  let scoreMargin: number;
  let headlineSummary: string;

  if (board.hasActiveRival) {
    scoreMargin = playerScore - rivalScore;
    if (playerScore > rivalScore) {
      playerWon = true;
      reason = 'OUTSCORED_RIVAL';
      headlineSummary = `Victory! You beat the Challenger ${playerScore} to ${rivalScore} (+${scoreMargin}).`;
    } else if (playerScore < rivalScore) {
      playerWon = false;
      reason = 'OUTSCORED_BY_RIVAL';
      headlineSummary = `Defeat. The Challenger outscored you ${rivalScore} to ${playerScore}.`;
    } else if (playerWedgeCount > rivalWedgeCount) {
      playerWon = true;
      reason = 'TIEBREAK_WEDGES';
      headlineSummary = `Tiebreak Victory! Tied at ${playerScore}, won on Crown Wedges (${playerWedgeCount} to ${rivalWedgeCount}).`;
    } else if (playerWedgeCount < rivalWedgeCount) {
      playerWon = false;
      reason = 'TIEBREAK_RIVAL_WEDGES';
      headlineSummary = `Tiebreak Loss. Tied at ${playerScore}, Challenger held more Crown Wedges (${rivalWedgeCount} to ${playerWedgeCount}).`;
    } else if (playerTilesWon > rivalTilesClaimed) {
      playerWon = true;
      reason = 'TIEBREAK_TILES_WON';
      headlineSummary = `Tiebreak Victory! Tied at ${playerScore} and ${playerWedgeCount} wedges, won on tiles cleared (${playerTilesWon} to ${rivalTilesClaimed}).`;
    } else if (playerTilesWon < rivalTilesClaimed) {
      playerWon = false;
      reason = 'TIEBREAK_RIVAL_TILES_WON';
      headlineSummary = `Tiebreak Loss. Tied at ${playerScore}, Challenger claimed more tiles (${rivalTilesClaimed} to ${playerTilesWon}).`;
    } else {
      playerWon = !strictOnDeadlock;
      reason = playerWon ? 'TIEBREAK_DEADLOCK_WIN' : 'TIEBREAK_DEADLOCK_LOSS';
      headlineSummary = playerWon
        ? `Photo-Finish Draw Victory at ${playerScore}!`
        : `Deadlock Loss at ${playerScore}. Beat the Challenger outright to advance.`;
    }
  } else {
    scoreMargin = playerScore - soloTargetScore;
    if (playerScore >= soloTargetScore) {
      playerWon = true;
      reason = 'MET_SOLO_TARGET';
      headlineSummary = `Target Cleared! You scored ${playerScore} against the ${soloTargetScore} solo target.`;
    } else {
      playerWon = false;
      reason = 'BELOW_SOLO_TARGET';
      headlineSummary = `Short of Target. You scored ${playerScore} of the ${soloTargetScore} required.`;
    }
  }

  let starsEarned: 0 | 1 | 2 | 3 = 0;
  if (playerWon) {
    starsEarned = 1;
    const strongMargin = board.hasActiveRival
      ? scoreMargin >= 400
      : playerScore >= Math.round(soloTargetScore * 1.25);
    const dominantMargin = board.hasActiveRival
      ? scoreMargin >= 800
      : playerScore >= Math.round(soloTargetScore * 1.5);

    if (strongMargin || playerWedgeCount >= 2 || board.completedLinesCount >= 1) {
      starsEarned = 2;
    }
    if (
      dominantMargin &&
      (playerWedgeCount >= 3 || board.completedLinesCount >= 1 || playerTilesWon >= 8)
    ) {
      starsEarned = 3;
    }
  }

  return {
    playerWon,
    reason,
    playerScore,
    rivalScore,
    soloTargetScore,
    scoreMargin,
    playerWedgeCount,
    rivalWedgeCount,
    playerTilesWon,
    rivalTilesClaimed,
    starsEarned,
    headlineSummary,
  };
}

/**
 * Boolean stage victory gate. Strictly enforces real Rival stakes when `hasActiveRival === true`
 * and solo target score when `hasActiveRival === false`.
 */
export function didPlayerWinBoard(
  board: StageBoardStateV4,
  options?: VictoryCheckOptionsV4,
): boolean {
  return evaluateBoardOutcome(board, options).playerWon;
}
