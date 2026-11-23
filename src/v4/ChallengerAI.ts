// ============================================================================
// WORLD'S SMARTEST v4.0 — Active Single-Player Challenger AI & Boss Draft
// Reads real PlayerStatProfileForHost career stats to Force Weak-Domain Tiles,
// Freeze Favorite Comfort-Zone Columns, Plant High-Stakes Bounties, Claim
// Board Tiles for real scoreboard pressure, and run Pre-Board Pick & Ban Drafts.
// ============================================================================

import type { DomainId } from '../forge/types';
import {
  WEDGE_CATALOG_V4,
  domainToWedgeColor,
  type BoardColumnV4,
  type BoardTileStatus,
  type BoardTileV4,
  type ChallengerMoveKind,
  type ChallengerProfileV4,
  type ChallengerTurnActionV4,
  type PlayerStatProfileForHost,
  type StageBoardStateV4,
  type WedgeColorId,
} from './contracts';
import {
  ALL_DOMAIN_IDS_V4,
  ALL_WEDGE_IDS_V4,
  DOMAIN_TOPIC_SUBTITLE_V4,
  createSeededRng,
  ensurePlayableTilesOrStageSurge,
  getPlayableTiles,
  getWittyColumnHeader,
  isUnplayedTileStatus,
  pickStageSpotlightTile,
  type DraftedColumnSpecV4,
} from './BoardEngine';

// ============================================================================
// 1. HELPER UTILITIES
// ============================================================================

function pickOne<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function shuffleArr<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function formatBanterTemplate(
  template: string,
  tokens: Readonly<Record<string, string>>,
): string {
  let out = template;
  for (const [key, val] of Object.entries(tokens)) {
    out = out.split(`{${key}}`).join(val);
  }
  return out;
}

function getDomainDisplayName(
  domainId: DomainId,
  playerStats?: PlayerStatProfileForHost | null,
): string {
  if (playerStats?.weakestDomainId === domainId && playerStats.weakestDomainName) {
    return playerStats.weakestDomainName;
  }
  if (playerStats?.strongestDomainId === domainId && playerStats.strongestDomainName) {
    return playerStats.strongestDomainName;
  }
  if (playerStats?.mostPlayedDomainId === domainId && playerStats.mostPlayedDomainName) {
    return playerStats.mostPlayedDomainName;
  }
  return DOMAIN_TOPIC_SUBTITLE_V4[domainId];
}

function computeChallengerTileAccuracy(
  challenger: ChallengerProfileV4,
  tile: BoardTileV4,
): number {
  let acc = challenger.baseAccuracy;
  if (challenger.strongDomains.includes(tile.domainId)) {
    acc += 0.14;
  }
  if (challenger.weakDomains.includes(tile.domainId)) {
    acc -= 0.16;
  }
  switch (tile.pointValue) {
    case 100:
      acc += 0.06;
      break;
    case 200:
      break;
    case 400:
      acc -= 0.04;
      break;
    case 800:
      acc -= 0.09;
      break;
  }
  return Math.max(0.18, Math.min(0.92, acc));
}

// ============================================================================
// 2. ACTIVE SINGLE-PLAYER CHALLENGER TURN (`runChallengerTurn`)
// ============================================================================

export interface ChallengerTurnResultV4 {
  readonly board: StageBoardStateV4;
  readonly action: ChallengerTurnActionV4;
  readonly forcedByStageSpotlight: boolean;
  readonly usedPlayerWeaknessStats: boolean;
  readonly usedPlayerFavoriteStats: boolean;
  readonly unlockedTileIds: readonly string[];
  readonly awardedRivalWedge: WedgeColorId | null;
  readonly stageSurgeTriggered: boolean;
  readonly stageSurgeUnlockedIds: readonly string[];
}

function pickWeakTargetTile(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): { tile: BoardTileV4 | null; matchedWeakStat: boolean; matchKind: 'EXACT_WEAK' | 'WEDGE_WEAK' | 'RIVAL_STRONG' | 'GENERAL' } {
  const playable = getPlayableTiles(board);
  if (playable.length === 0) {
    return { tile: null, matchedWeakStat: false, matchKind: 'GENERAL' };
  }

  const weakDomain = playerStats?.weakestDomainId ?? null;
  if (weakDomain !== null) {
    const exactWeak = playable.filter((t) => t.domainId === weakDomain);
    if (exactWeak.length > 0) {
      // Favor dramatic 200/400/800 tiles in the player's weak domain
      const sorted = [...exactWeak].sort((a, b) => b.pointValue - a.pointValue);
      const topBand = sorted.filter((t) => t.pointValue >= sorted[0].pointValue / 2);
      return {
        tile: pickOne(topBand, rng),
        matchedWeakStat: true,
        matchKind: 'EXACT_WEAK',
      };
    }

    const weakWedge = domainToWedgeColor(weakDomain);
    const wedgeWeak = playable.filter((t) => t.wedgeId === weakWedge);
    if (wedgeWeak.length > 0) {
      const sorted = [...wedgeWeak].sort((a, b) => b.pointValue - a.pointValue);
      return {
        tile: sorted[0],
        matchedWeakStat: true,
        matchKind: 'WEDGE_WEAK',
      };
    }
  }

  const rivalStrong = playable.filter((t) => challenger.strongDomains.includes(t.domainId));
  if (rivalStrong.length > 0) {
    const sorted = [...rivalStrong].sort((a, b) => b.pointValue - a.pointValue);
    return {
      tile: sorted[0],
      matchedWeakStat: false,
      matchKind: 'RIVAL_STRONG',
    };
  }

  const sortedAll = [...playable].sort((a, b) => b.pointValue - a.pointValue);
  return {
    tile: sortedAll[0],
    matchedWeakStat: false,
    matchKind: 'GENERAL',
  };
}

function pickFavoriteColumnToFreeze(
  board: StageBoardStateV4,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): { col: BoardColumnV4 | null; matchedFavoriteStat: boolean } {
  const playable = getPlayableTiles(board);
  const openCountByCol = new Map<number, number>();
  for (const t of playable) {
    openCountByCol.set(t.colIndex, (openCountByCol.get(t.colIndex) ?? 0) + 1);
  }

  // Must leave at least one OTHER unfrozen column with an open tile so freezing NEVER soft-locks
  const activePlayableCols = Array.from(openCountByCol.keys());
  if (activePlayableCols.length < 2) {
    return { col: null, matchedFavoriteStat: false };
  }

  const forcedTile = board.forcedTileId
    ? board.tiles.find((t) => t.tileId === board.forcedTileId)
    : undefined;

  const eligibleCols = board.columns.filter(
    (c) =>
      c.frozenTurnsRemaining <= 0 &&
      (openCountByCol.get(c.colIndex) ?? 0) > 0 &&
      (!forcedTile || forcedTile.colIndex !== c.colIndex),
  );

  if (eligibleCols.length === 0) {
    return { col: null, matchedFavoriteStat: false };
  }

  // Priority 1: player's most-played comfort-zone domain
  if (playerStats?.mostPlayedDomainId !== null && playerStats?.mostPlayedDomainId !== undefined) {
    const match = eligibleCols.find((c) => c.domainId === playerStats.mostPlayedDomainId);
    if (match) return { col: match, matchedFavoriteStat: true };
  }

  // Priority 2: player's strongest career domain
  if (playerStats?.strongestDomainId !== null && playerStats?.strongestDomainId !== undefined) {
    const match = eligibleCols.find((c) => c.domainId === playerStats.strongestDomainId);
    if (match) return { col: match, matchedFavoriteStat: true };
  }

  // Priority 3: column where player has already won the most tiles in this match
  let bestMatchCol: BoardColumnV4 | null = null;
  let bestWins = 0;
  for (const col of eligibleCols) {
    const wins = board.tiles.filter(
      (t) => t.colIndex === col.colIndex && t.status === 'CLEARED_WIN',
    ).length;
    if (wins > bestWins) {
      bestWins = wins;
      bestMatchCol = col;
    }
  }
  if (bestMatchCol && bestWins > 0) {
    return { col: bestMatchCol, matchedFavoriteStat: false };
  }

  // Priority 4: favorite wedge sibling
  const favDomain = playerStats?.mostPlayedDomainId ?? playerStats?.strongestDomainId ?? null;
  if (favDomain !== null) {
    const favWedge = domainToWedgeColor(favDomain);
    const wedgeMatch = eligibleCols.find((c) => c.wedgeId === favWedge);
    if (wedgeMatch) return { col: wedgeMatch, matchedFavoriteStat: true };
  }

  // Priority 5: column with most remaining open tiles
  const sorted = [...eligibleCols].sort(
    (a, b) => (openCountByCol.get(b.colIndex) ?? 0) - (openCountByCol.get(a.colIndex) ?? 0),
  );
  const topOpen = openCountByCol.get(sorted[0].colIndex) ?? 0;
  const tied = sorted.filter((c) => (openCountByCol.get(c.colIndex) ?? 0) === topOpen);
  return { col: pickOne(tied, rng), matchedFavoriteStat: false };
}

function pickBountyCandidateTile(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): BoardTileV4 | null {
  const candidates = getPlayableTiles(board).filter(
    (t) => t.twist === 'NONE' && t.tileId !== board.forcedTileId,
  );
  if (candidates.length === 0) return null;

  // Prefer player's weak domain or challenger's strong domain on 200/400 tiles
  const weakOrStrong = candidates.filter(
    (t) =>
      t.domainId === playerStats?.weakestDomainId ||
      challenger.strongDomains.includes(t.domainId),
  );
  const pool = weakOrStrong.length > 0 ? weakOrStrong : candidates;
  const midHigh = pool.filter((t) => t.pointValue >= 200);
  return pickOne(midHigh.length > 0 ? midHigh : pool, rng);
}

function pickClaimCandidateTile(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  rng: () => number,
): BoardTileV4 | null {
  const playable = getPlayableTiles(board).filter((t) => t.tileId !== board.forcedTileId);
  if (playable.length === 0) return null;

  // Prefer Challenger's strong domains and avoid weak domains when alternatives exist
  const strong = playable.filter((t) => challenger.strongDomains.includes(t.domainId));
  const nonWeak = playable.filter((t) => !challenger.weakDomains.includes(t.domainId));
  const pool = strong.length > 0 ? strong : nonWeak.length > 0 ? nonWeak : playable;

  // Higher-accuracy Challengers hunt bigger values; lower-tier Challengers play more evenly
  const sorted = [...pool].sort((a, b) => b.pointValue - a.pointValue);
  if (challenger.baseAccuracy >= 0.65 && rng() < 0.7) {
    return sorted[0];
  }
  return pickOne(pool, rng);
}

function executeForceWeakTile(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): ChallengerTurnResultV4 | null {
  const picked = pickWeakTargetTile(board, challenger, playerStats, rng);
  if (!picked.tile) return null;

  const targetTile = picked.tile;
  const targetCol = board.columns[targetTile.colIndex];
  const domainName = getDomainDisplayName(targetTile.domainId, playerStats);
  const weakPct =
    playerStats && playerStats.totalAnswered > 0
      ? Math.round(playerStats.weakestAccuracyPct)
      : null;

  let forcedReasonBanner: string;
  if (picked.matchKind === 'EXACT_WEAK' && weakPct !== null) {
    forcedReasonBanner = `${challenger.name} studied your career stats (${weakPct}% in ${domainName}) and forced you onto "${targetCol.wittyTitle}" (${targetTile.pointValue} pts)!`;
  } else if (picked.matchKind === 'EXACT_WEAK' || picked.matchKind === 'WEDGE_WEAK') {
    const weakLabel =
      playerStats?.weakestDomainName ??
      (playerStats?.weakestDomainId !== null && playerStats?.weakestDomainId !== undefined
        ? DOMAIN_TOPIC_SUBTITLE_V4[playerStats.weakestDomainId]
        : domainName);
    forcedReasonBanner = `${challenger.name} targeted your ${weakLabel} weak spot and locked you onto "${targetCol.wittyTitle}" (${targetTile.pointValue} pts)!`;
  } else if (picked.matchKind === 'RIVAL_STRONG') {
    forcedReasonBanner = `${challenger.name} dragged you onto their home turf: "${targetCol.wittyTitle}" (${targetTile.pointValue} pts)!`;
  } else {
    forcedReasonBanner = `${challenger.name} seized control of the board and forced "${targetCol.wittyTitle}" (${targetTile.pointValue} pts)!`;
  }

  const nextTiles = board.tiles.map((t) =>
    t.tileId === targetTile.tileId
      ? { ...t, forcedByRival: true }
      : t.forcedByRival
        ? { ...t, forcedByRival: false }
        : t,
  );

  const rawBanter =
    challenger.onForceCategoryLines.length > 0
      ? pickOne(challenger.onForceCategoryLines, rng)
      : `I read your stats sheet. Let's see how you handle "${targetCol.wittyTitle}"!`;

  const banterLine = formatBanterTemplate(rawBanter, {
    domain: domainName,
    weakDomain: domainName,
    category: targetCol.wittyTitle,
    tile: `${targetCol.wittyTitle} (${targetTile.pointValue} pts)`,
  });

  const nextBoard: StageBoardStateV4 = {
    ...board,
    tiles: nextTiles,
    forcedTileId: targetTile.tileId,
    forcedReasonBanner,
  };

  return {
    board: nextBoard,
    action: {
      moveKind: 'FORCE_WEAK_TILE',
      targetTileId: targetTile.tileId,
      targetColIndex: targetTile.colIndex,
      rivalPointsDelta: 0,
      rivalSucceeded: true,
      banterLine,
    },
    forcedByStageSpotlight: false,
    usedPlayerWeaknessStats: picked.matchedWeakStat,
    usedPlayerFavoriteStats: false,
    unlockedTileIds: [],
    awardedRivalWedge: null,
    stageSurgeTriggered: false,
    stageSurgeUnlockedIds: [],
  };
}

function executeFreezeFavoriteColumn(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): ChallengerTurnResultV4 | null {
  const picked = pickFavoriteColumnToFreeze(board, playerStats, rng);
  if (!picked.col) return null;

  const targetCol = picked.col;
  const domainName = getDomainDisplayName(targetCol.domainId, playerStats);

  const nextColumns = board.columns.map((c) =>
    c.colIndex === targetCol.colIndex ? { ...c, frozenTurnsRemaining: 1 } : c,
  );
  const nextTiles = board.tiles.map((t) =>
    t.colIndex === targetCol.colIndex && t.status === 'OPEN'
      ? { ...t, status: 'FROZEN_BY_RIVAL' as BoardTileStatus }
      : t,
  );

  const rawBanter =
    challenger.onFreezeColumnLines.length > 0
      ? pickOne(challenger.onFreezeColumnLines, rng)
      : `No hiding in "${targetCol.wittyTitle}" this turn — putting ${domainName} on ice!`;

  const banterLine = formatBanterTemplate(rawBanter, {
    domain: domainName,
    favoriteDomain: domainName,
    category: targetCol.wittyTitle,
  });

  let nextBoard: StageBoardStateV4 = {
    ...board,
    columns: nextColumns,
    tiles: nextTiles,
  };

  const surge = ensurePlayableTilesOrStageSurge(nextBoard, rng, 2);
  nextBoard = surge.board;

  return {
    board: nextBoard,
    action: {
      moveKind: 'FREEZE_FAVORITE_COLUMN',
      targetColIndex: targetCol.colIndex,
      rivalPointsDelta: 0,
      rivalSucceeded: true,
      banterLine,
    },
    forcedByStageSpotlight: false,
    usedPlayerWeaknessStats: false,
    usedPlayerFavoriteStats: picked.matchedFavoriteStat,
    unlockedTileIds: surge.unlockedTileIds,
    awardedRivalWedge: null,
    stageSurgeTriggered: surge.triggered,
    stageSurgeUnlockedIds: surge.unlockedTileIds,
  };
}

function executePlantBounty(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): ChallengerTurnResultV4 | null {
  const target = pickBountyCandidateTile(board, challenger, playerStats, rng);
  if (!target) return null;

  const col = board.columns[target.colIndex];
  const nextTiles = board.tiles.map((t) =>
    t.tileId === target.tileId
      ? { ...t, twist: 'RIVAL_BOUNTY' as const, twistRevealedToPlayer: true }
      : t,
  );

  return {
    board: {
      ...board,
      tiles: nextTiles,
    },
    action: {
      moveKind: 'PLANT_BOUNTY',
      targetTileId: target.tileId,
      targetColIndex: target.colIndex,
      rivalPointsDelta: 0,
      rivalSucceeded: true,
      banterLine: `${challenger.name} dropped a Rival Bounty on "${col.wittyTitle}" (${target.pointValue} pts) — beat it to steal +300, or miss and hand over +200!`,
    },
    forcedByStageSpotlight: false,
    usedPlayerWeaknessStats: target.domainId === playerStats?.weakestDomainId,
    usedPlayerFavoriteStats: false,
    unlockedTileIds: [],
    awardedRivalWedge: null,
    stageSurgeTriggered: false,
    stageSurgeUnlockedIds: [],
  };
}

function executeClaimTile(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  rng: () => number,
): ChallengerTurnResultV4 | null {
  const target = pickClaimCandidateTile(board, challenger, rng);
  if (!target) return null;

  const col = board.columns[target.colIndex];
  const accuracy = computeChallengerTileAccuracy(challenger, target);
  const succeeded = rng() < accuracy;

  if (!succeeded) {
    return {
      board,
      action: {
        moveKind: 'CLAIM_TILE',
        targetTileId: target.tileId,
        targetColIndex: target.colIndex,
        rivalPointsDelta: 0,
        rivalSucceeded: false,
        banterLine: `${challenger.name} took a swing at "${col.wittyTitle}" (${target.pointValue} pts) and missed — the tile stays wide open!`,
      },
      forcedByStageSpotlight: false,
      usedPlayerWeaknessStats: false,
      usedPlayerFavoriteStats: false,
      unlockedTileIds: [],
      awardedRivalWedge: null,
      stageSurgeTriggered: false,
      stageSurgeUnlockedIds: [],
    };
  }

  // Challenger nailed the tile: earns exact tile pointValue (100% honest math!)
  const nextTiles = board.tiles.map((t) => ({ ...t }));
  const targetIdx = nextTiles.findIndex((t) => t.tileId === target.tileId);
  nextTiles[targetIdx] = {
    ...nextTiles[targetIdx],
    status: 'CLAIMED_BY_RIVAL',
    twistRevealedToPlayer: true,
  };

  // Unlock orthogonal PADLOCKED / FOGGED neighbors so Rival play opens paths too
  const unlockedTileIds: string[] = [];
  const deltas: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dc, dr] of deltas) {
    const nbIdx = nextTiles.findIndex(
      (t) => t.colIndex === target.colIndex + dc && t.rowIndex === target.rowIndex + dr,
    );
    if (nbIdx < 0) continue;
    const nb = nextTiles[nbIdx];
    if (nb.status === 'PADLOCKED' || nb.status === 'FOGGED') {
      const frozen = board.columns[nb.colIndex].frozenTurnsRemaining > 0;
      nextTiles[nbIdx] = {
        ...nb,
        status: frozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
        twistRevealedToPlayer: nb.twist === 'POWER_PLAY' ? nb.twistRevealedToPlayer : true,
      };
      unlockedTileIds.push(nb.tileId);
    }
  }

  let awardedRivalWedge: WedgeColorId | null = null;
  const nextRivalWedges = [...board.rivalWedges];
  if (target.twist === 'CROWN_WEDGE' && !nextRivalWedges.includes(target.wedgeId)) {
    nextRivalWedges.push(target.wedgeId);
    awardedRivalWedge = target.wedgeId;
  }

  const rivalPointsDelta = target.pointValue;
  const remainingUnplayed = nextTiles.filter((t) => isUnplayedTileStatus(t.status)).length;

  let nextBoard: StageBoardStateV4 = {
    ...board,
    tiles: nextTiles,
    rivalScore: board.rivalScore + rivalPointsDelta,
    rivalWedges: nextRivalWedges,
    isBoardComplete: board.isBoardComplete || remainingUnplayed === 0,
  };

  let stageSurgeTriggered = false;
  let stageSurgeUnlockedIds: readonly string[] = [];
  if (!nextBoard.isBoardComplete) {
    const surge = ensurePlayableTilesOrStageSurge(nextBoard, rng, 2);
    nextBoard = surge.board;
    stageSurgeTriggered = surge.triggered;
    stageSurgeUnlockedIds = surge.unlockedTileIds;
    for (const id of surge.unlockedTileIds) {
      if (!unlockedTileIds.includes(id)) unlockedTileIds.push(id);
    }
  }

  const wedgeNote = awardedRivalWedge
    ? ` and snatched the ${WEDGE_CATALOG_V4[awardedRivalWedge].shortLabel} Crown Wedge`
    : '';

  return {
    board: nextBoard,
    action: {
      moveKind: 'CLAIM_TILE',
      targetTileId: target.tileId,
      targetColIndex: target.colIndex,
      rivalPointsDelta,
      rivalSucceeded: true,
      banterLine: `${challenger.name} swept "${col.wittyTitle}" for +${rivalPointsDelta}${wedgeNote}!`,
    },
    forcedByStageSpotlight: false,
    usedPlayerWeaknessStats: false,
    usedPlayerFavoriteStats: false,
    unlockedTileIds,
    awardedRivalWedge,
    stageSurgeTriggered,
    stageSurgeUnlockedIds,
  };
}

function chooseWeightedMove(
  board: StageBoardStateV4,
  challenger: ChallengerProfileV4,
  rng: () => number,
): ChallengerMoveKind[] {
  const weights: Record<ChallengerMoveKind, number> = {
    CLAIM_TILE: 50,
    PLANT_BOUNTY: 16,
    FREEZE_FAVORITE_COLUMN: 17,
    FORCE_WEAK_TILE: 17,
  };

  switch (board.topology) {
    case 'OPEN_CLASSIC':
      weights.CLAIM_TILE = 68;
      weights.PLANT_BOUNTY = 14;
      weights.FREEZE_FAVORITE_COLUMN = 8;
      weights.FORCE_WEAK_TILE = 10;
      break;
    case 'PADLOCK_NEIGHBORS':
    case 'FOG_CROSSROADS':
      weights.CLAIM_TILE = 56;
      weights.PLANT_BOUNTY = 16;
      weights.FREEZE_FAVORITE_COLUMN = 14;
      weights.FORCE_WEAK_TILE = 14;
      break;
    case 'SPOTLIGHT_ROULETTE':
      weights.CLAIM_TILE = 44;
      weights.PLANT_BOUNTY = 18;
      weights.FREEZE_FAVORITE_COLUMN = 14;
      weights.FORCE_WEAK_TILE = 24;
      break;
    case 'CHALLENGER_GAUNTLET':
      weights.CLAIM_TILE = 34;
      weights.PLANT_BOUNTY = 20;
      weights.FREEZE_FAVORITE_COLUMN = 24;
      weights.FORCE_WEAK_TILE = 22;
      break;
    case 'GRAND_FINALE_VAULT':
      weights.CLAIM_TILE = 32;
      weights.PLANT_BOUNTY = 20;
      weights.FREEZE_FAVORITE_COLUMN = 24;
      weights.FORCE_WEAK_TILE = 24;
      break;
  }

  // Personality boost for the Challenger's signature gimmick!
  weights[challenger.signatureGimmick] += 18;

  // Never force a second tile when forcedTileId is already set
  if (board.forcedTileId !== null) {
    weights.FORCE_WEAK_TILE = 0;
  }

  // Sample ordered fallback preference list by weighted draw without replacement
  const remaining: ChallengerMoveKind[] = [
    'FORCE_WEAK_TILE',
    'FREEZE_FAVORITE_COLUMN',
    'PLANT_BOUNTY',
    'CLAIM_TILE',
  ];
  const ordered: ChallengerMoveKind[] = [];
  while (remaining.length > 0) {
    let total = 0;
    for (const m of remaining) total += weights[m];
    if (total <= 0) {
      ordered.push(...remaining);
      break;
    }
    let roll = rng() * total;
    let chosenIdx = remaining.length - 1;
    for (let i = 0; i < remaining.length; i++) {
      roll -= weights[remaining[i]];
      if (roll <= 0) {
        chosenIdx = i;
        break;
      }
    }
    ordered.push(remaining[chosenIdx]);
    remaining.splice(chosenIdx, 1);
  }
  return ordered;
}

/**
 * Executes an active, personality-driven single-player Challenger AI turn!
 *
 * Guarantees:
 * - Reads real `playerStats` (`PlayerStatProfileForHost`) for stat-aware `FORCE_WEAK_TILE`
 *   and `FREEZE_FAVORITE_COLUMN` interference.
 * - On `SPOTLIGHT_ROULETTE`, `CHALLENGER_GAUNTLET`, and `GRAND_FINALE_VAULT`, triggers either
 *   a Stage Spotlight Forced Pick or Challenger Forced Weak-Category Pick every 2-3 turns.
 * - Never soft-locks the board (always validates/recovers via Stage Surge if needed).
 */
export function runChallengerTurn(
  board: StageBoardStateV4,
  challengerProfile: ChallengerProfileV4,
  playerStats?: PlayerStatProfileForHost | null,
  rng: () => number = Math.random,
): ChallengerTurnResultV4 {
  if (board.isBoardComplete || !board.hasActiveRival) {
    return {
      board,
      action: {
        moveKind: 'CLAIM_TILE',
        rivalPointsDelta: 0,
        rivalSucceeded: false,
        banterLine: board.isBoardComplete
          ? `${challengerProfile.name} steps back — final scores are locked!`
          : 'Solo tryout round — no Challenger interference active.',
      },
      forcedByStageSpotlight: false,
      usedPlayerWeaknessStats: false,
      usedPlayerFavoriteStats: false,
      unlockedTileIds: [],
      awardedRivalWedge: null,
      stageSurgeTriggered: false,
      stageSurgeUnlockedIds: [],
    };
  }

  let workingBoard = board;
  let forcedByStageSpotlight = false;

  // Rhythmic forced-pick cadence every 2-3 turns on Spotlight / Gauntlet / Finale!
  const isForcedCadenceTopology =
    workingBoard.topology === 'SPOTLIGHT_ROULETTE' ||
    workingBoard.topology === 'CHALLENGER_GAUNTLET' ||
    workingBoard.topology === 'GRAND_FINALE_VAULT';

  const shouldTriggerForcedTurn =
    isForcedCadenceTopology &&
    workingBoard.forcedTileId === null &&
    workingBoard.turnNumber > 0 &&
    (workingBoard.topology === 'SPOTLIGHT_ROULETTE'
      ? workingBoard.turnNumber % 2 === 0
      : workingBoard.turnNumber % 3 === 2 ||
        (challengerProfile.signatureGimmick === 'FORCE_WEAK_TILE' &&
          workingBoard.turnNumber % 3 === 0 &&
          rng() < 0.45));

  if (shouldTriggerForcedTurn) {
    const preferStageSpotlight =
      workingBoard.topology === 'SPOTLIGHT_ROULETTE'
        ? rng() < 0.6
        : workingBoard.topology === 'GRAND_FINALE_VAULT' && rng() < 0.35;

    if (preferStageSpotlight) {
      const spotTile = pickStageSpotlightTile(workingBoard, rng);
      if (spotTile) {
        const spotCol = workingBoard.columns[spotTile.colIndex];
        forcedByStageSpotlight = true;
        workingBoard = {
          ...workingBoard,
          forcedTileId: spotTile.tileId,
          forcedReasonBanner: `SPOTLIGHT ROULETTE! Studio cameras locked onto "${spotCol.wittyTitle}" (${spotTile.pointValue} pts) — no backing out!`,
        };
        // Challenger still plays a non-conflicting tile/bounty move on their turn!
        const followUp =
          executeClaimTile(workingBoard, challengerProfile, rng) ??
          executePlantBounty(workingBoard, challengerProfile, playerStats, rng);
        if (followUp) {
          return {
            ...followUp,
            forcedByStageSpotlight: true,
          };
        }
        return {
          board: workingBoard,
          action: {
            moveKind: 'CLAIM_TILE',
            targetTileId: spotTile.tileId,
            targetColIndex: spotTile.colIndex,
            rivalPointsDelta: 0,
            rivalSucceeded: true,
            banterLine: `The studio spotlight just locked you into "${spotCol.wittyTitle}" — enjoy!`,
          },
          forcedByStageSpotlight: true,
          usedPlayerWeaknessStats: false,
          usedPlayerFavoriteStats: false,
          unlockedTileIds: [],
          awardedRivalWedge: null,
          stageSurgeTriggered: false,
          stageSurgeUnlockedIds: [],
        };
      }
    } else {
      const forcedRes = executeForceWeakTile(workingBoard, challengerProfile, playerStats, rng);
      if (forcedRes) {
        return forcedRes;
      }
    }
  }

  // Standard personality-driven move selection with clean fallbacks
  const moveOrder = chooseWeightedMove(workingBoard, challengerProfile, rng);
  for (const move of moveOrder) {
    let result: ChallengerTurnResultV4 | null = null;
    switch (move) {
      case 'FORCE_WEAK_TILE':
        if (workingBoard.forcedTileId === null) {
          result = executeForceWeakTile(workingBoard, challengerProfile, playerStats, rng);
        }
        break;
      case 'FREEZE_FAVORITE_COLUMN':
        result = executeFreezeFavoriteColumn(workingBoard, challengerProfile, playerStats, rng);
        break;
      case 'PLANT_BOUNTY':
        result = executePlantBounty(workingBoard, challengerProfile, playerStats, rng);
        break;
      case 'CLAIM_TILE':
        result = executeClaimTile(workingBoard, challengerProfile, rng);
        break;
    }
    if (result) {
      return {
        ...result,
        forcedByStageSpotlight: forcedByStageSpotlight || result.forcedByStageSpotlight,
      };
    }
  }

  // Graceful fallback if only a forced tile remains open
  const surge = ensurePlayableTilesOrStageSurge(workingBoard, rng, 2);
  return {
    board: surge.board,
    action: {
      moveKind: 'CLAIM_TILE',
      rivalPointsDelta: 0,
      rivalSucceeded: false,
      banterLine: `${challengerProfile.name} eyes the board and yields the floor to you.`,
    },
    forcedByStageSpotlight,
    usedPlayerWeaknessStats: false,
    usedPlayerFavoriteStats: false,
    unlockedTileIds: surge.unlockedTileIds,
    awardedRivalWedge: null,
    stageSurgeTriggered: surge.triggered,
    stageSurgeUnlockedIds: surge.unlockedTileIds,
  };
}

// ============================================================================
// 3. PRE-BOARD CATEGORY PICK & BAN DRAFT (BOSS STAGES)
// ============================================================================

export type DraftEntryStatusV4 =
  | 'AVAILABLE'
  | 'PICKED_PLAYER'
  | 'PICKED_RIVAL'
  | 'BANNED_PLAYER'
  | 'BANNED_RIVAL';

export type DraftStepActionV4 = 'PICK' | 'BAN';

export interface CategoryDraftEntryV4 {
  readonly entryId: string;
  readonly domainId: DomainId;
  readonly wedgeId: WedgeColorId;
  readonly wittyTitle: string;
  readonly topicSubtitle: string;
  readonly status: DraftEntryStatusV4;
}

export interface DraftMoveRecordV4 {
  readonly actor: 'PLAYER' | 'RIVAL';
  readonly action: DraftStepActionV4;
  readonly entry: CategoryDraftEntryV4;
  readonly banterLine: string;
}

export interface CategoryDraftStateV4 {
  readonly draftId: string;
  readonly targetColumns: 4 | 5 | 6;
  readonly pool: readonly CategoryDraftEntryV4[];
  readonly playerPicksRemaining: number;
  readonly playerBansRemaining: number;
  readonly rivalPicksRemaining: number;
  readonly rivalBansRemaining: number;
  readonly nextActor: 'PLAYER' | 'RIVAL' | 'COMPLETE';
  readonly nextAction: DraftStepActionV4 | null;
  readonly turnIndex: number;
  readonly lastMove: DraftMoveRecordV4 | null;
  readonly log: readonly string[];
  readonly isComplete: boolean;
}

export interface BuildCategoryDraftPoolOptionsV4 {
  readonly draftId?: string;
  readonly targetColumns?: 4 | 5 | 6;
  readonly poolSize?: number;
  readonly excludeDomains?: readonly DomainId[];
  readonly seed?: number | string;
  readonly rng?: () => number;
}

interface DraftStepSpec {
  readonly actor: 'PLAYER' | 'RIVAL';
  readonly action: DraftStepActionV4;
}

function getDraftSchedule(targetColumns: 4 | 5 | 6): readonly DraftStepSpec[] {
  if (targetColumns === 4) {
    return [
      { actor: 'PLAYER', action: 'BAN' },
      { actor: 'RIVAL', action: 'BAN' },
      { actor: 'PLAYER', action: 'PICK' },
      { actor: 'RIVAL', action: 'PICK' },
      { actor: 'PLAYER', action: 'PICK' },
    ];
  }
  // 5 or 6 columns: 1 Ban + 2 Picks each (4 drafted columns + 1 or 2 Show Wildcard columns)
  return [
    { actor: 'PLAYER', action: 'BAN' },
    { actor: 'RIVAL', action: 'BAN' },
    { actor: 'PLAYER', action: 'PICK' },
    { actor: 'RIVAL', action: 'PICK' },
    { actor: 'PLAYER', action: 'PICK' },
    { actor: 'RIVAL', action: 'PICK' },
  ];
}

function advanceDraftTurn(
  state: CategoryDraftStateV4,
  schedule: readonly DraftStepSpec[],
  nextTurnIndex: number,
): Pick<CategoryDraftStateV4, 'nextActor' | 'nextAction' | 'turnIndex' | 'isComplete'> {
  const remainingTotal =
    state.playerPicksRemaining +
    state.playerBansRemaining +
    state.rivalPicksRemaining +
    state.rivalBansRemaining;
  const availableCount = state.pool.filter((e) => e.status === 'AVAILABLE').length;

  if (remainingTotal <= 0 || availableCount <= 0 || nextTurnIndex >= schedule.length) {
    return {
      nextActor: 'COMPLETE',
      nextAction: null,
      turnIndex: nextTurnIndex,
      isComplete: true,
    };
  }

  // Find next valid scheduled step that still has quota
  for (let i = nextTurnIndex; i < schedule.length; i++) {
    const step = schedule[i];
    const hasQuota =
      (step.actor === 'PLAYER' && step.action === 'PICK' && state.playerPicksRemaining > 0) ||
      (step.actor === 'PLAYER' && step.action === 'BAN' && state.playerBansRemaining > 0) ||
      (step.actor === 'RIVAL' && step.action === 'PICK' && state.rivalPicksRemaining > 0) ||
      (step.actor === 'RIVAL' && step.action === 'BAN' && state.rivalBansRemaining > 0);
    if (hasQuota) {
      return {
        nextActor: step.actor,
        nextAction: step.action,
        turnIndex: i,
        isComplete: false,
      };
    }
  }

  return {
    nextActor: 'COMPLETE',
    nextAction: null,
    turnIndex: schedule.length,
    isComplete: true,
  };
}

/**
 * Builds a balanced 10-to-12 category Pick & Ban draft pool spanning all 6 Color Wedges
 * and distinct Forge Domains for Boss episodes.
 */
export function buildCategoryDraftPool(
  options: BuildCategoryDraftPoolOptionsV4 = {},
): CategoryDraftStateV4 {
  const rng =
    options.rng ??
    (options.seed !== undefined ? createSeededRng(options.seed) : Math.random);
  const targetColumns: 4 | 5 | 6 = options.targetColumns ?? 5;
  const excluded = new Set<DomainId>(options.excludeDomains ?? []);
  const eligibleDomains = ALL_DOMAIN_IDS_V4.filter((d) => !excluded.has(d));
  const desiredSize = Math.max(
    targetColumns + 4,
    Math.min(12, options.poolSize ?? 10),
  );

  // First ensure every WedgeColorId gets representation, then fill up to desiredSize with remaining domains
  const chosenDomains: DomainId[] = [];
  const shuffledWedges = shuffleArr(ALL_WEDGE_IDS_V4, rng);
  for (const wedge of shuffledWedges) {
    const wedgeCandidates = WEDGE_CATALOG_V4[wedge].domainIds.filter((d) => !excluded.has(d));
    if (wedgeCandidates.length > 0 && chosenDomains.length < desiredSize) {
      chosenDomains.push(pickOne(wedgeCandidates, rng));
    }
  }

  const remainingDomains = shuffleArr(
    eligibleDomains.filter((d) => !chosenDomains.includes(d)),
    rng,
  );
  for (const d of remainingDomains) {
    if (chosenDomains.length >= desiredSize) break;
    chosenDomains.push(d);
  }

  const usedTitles = new Set<string>();
  const pool: CategoryDraftEntryV4[] = shuffleArr(chosenDomains, rng).map((domainId, idx) => {
    const header = getWittyColumnHeader(domainId, rng, usedTitles);
    usedTitles.add(header.wittyTitle);
    return {
      entryId: `draft_${idx}_d${domainId}`,
      domainId,
      wedgeId: header.wedgeId,
      wittyTitle: header.wittyTitle,
      topicSubtitle: header.topicSubtitle,
      status: 'AVAILABLE',
    };
  });

  const schedule = getDraftSchedule(targetColumns);
  const playerPicksRemaining = schedule.filter((s) => s.actor === 'PLAYER' && s.action === 'PICK').length;
  const playerBansRemaining = schedule.filter((s) => s.actor === 'PLAYER' && s.action === 'BAN').length;
  const rivalPicksRemaining = schedule.filter((s) => s.actor === 'RIVAL' && s.action === 'PICK').length;
  const rivalBansRemaining = schedule.filter((s) => s.actor === 'RIVAL' && s.action === 'BAN').length;

  return {
    draftId: options.draftId ?? `draft_${Math.floor(rng() * 1e6)}`,
    targetColumns,
    pool,
    playerPicksRemaining,
    playerBansRemaining,
    rivalPicksRemaining,
    rivalBansRemaining,
    nextActor: schedule[0].actor,
    nextAction: schedule[0].action,
    turnIndex: 0,
    lastMove: null,
    log: [],
    isComplete: false,
  };
}

/**
 * Applies the Player's PICK or BAN selection in the Boss Category Draft.
 */
export function applyPlayerDraftPick(
  state: CategoryDraftStateV4,
  entryId: string,
  actionOverride?: DraftStepActionV4,
): CategoryDraftStateV4 {
  if (state.isComplete) {
    throw new Error('ChallengerAI.applyPlayerDraftPick: draft is already complete');
  }
  const action: DraftStepActionV4 =
    actionOverride ??
    (state.nextActor === 'PLAYER' && state.nextAction
      ? state.nextAction
      : state.playerBansRemaining > 0
        ? 'BAN'
        : 'PICK');

  if (action === 'PICK' && state.playerPicksRemaining <= 0) {
    throw new Error('ChallengerAI.applyPlayerDraftPick: no player picks remaining');
  }
  if (action === 'BAN' && state.playerBansRemaining <= 0) {
    throw new Error('ChallengerAI.applyPlayerDraftPick: no player bans remaining');
  }

  const idx = state.pool.findIndex((e) => e.entryId === entryId);
  if (idx < 0) {
    throw new Error(`ChallengerAI.applyPlayerDraftPick: unknown entryId "${entryId}"`);
  }
  const target = state.pool[idx];
  if (target.status !== 'AVAILABLE') {
    throw new Error(
      `ChallengerAI.applyPlayerDraftPick: entry "${entryId}" is not AVAILABLE (${target.status})`,
    );
  }

  const nextStatus: DraftEntryStatusV4 = action === 'PICK' ? 'PICKED_PLAYER' : 'BANNED_PLAYER';
  const updatedEntry: CategoryDraftEntryV4 = { ...target, status: nextStatus };
  const nextPool = state.pool.map((e, i) => (i === idx ? updatedEntry : e));

  const banterLine =
    action === 'PICK'
      ? `You drafted "${target.wittyTitle}" (${target.topicSubtitle}) onto the board!`
      : `You banned "${target.wittyTitle}" (${target.topicSubtitle}) from tonight's show!`;

  const draftWithCounts: CategoryDraftStateV4 = {
    ...state,
    pool: nextPool,
    playerPicksRemaining: state.playerPicksRemaining - (action === 'PICK' ? 1 : 0),
    playerBansRemaining: state.playerBansRemaining - (action === 'BAN' ? 1 : 0),
    lastMove: { actor: 'PLAYER', action, entry: updatedEntry, banterLine },
    log: [...state.log, banterLine],
  };

  const schedule = getDraftSchedule(state.targetColumns);
  const nextStep = advanceDraftTurn(draftWithCounts, schedule, state.turnIndex + 1);
  return {
    ...draftWithCounts,
    ...nextStep,
  };
}

/**
 * Executes a stat-aware Rival PICK or BAN during the Boss Category Draft:
 * - On BAN: eliminates the player's comfort-zone / strongest domain (or Rival's own weak domain).
 * - On PICK: drafts the player's statistically weakest domain or the Rival's strongest turf!
 */
export function applyRivalDraftPick(
  state: CategoryDraftStateV4,
  challengerProfile: ChallengerProfileV4,
  playerStats?: PlayerStatProfileForHost | null,
  rng: () => number = Math.random,
): CategoryDraftStateV4 {
  if (state.isComplete) {
    return state;
  }

  const action: DraftStepActionV4 =
    state.nextActor === 'RIVAL' && state.nextAction
      ? state.nextAction
      : state.rivalBansRemaining > 0
        ? 'BAN'
        : 'PICK';

  if (
    (action === 'BAN' && state.rivalBansRemaining <= 0) ||
    (action === 'PICK' && state.rivalPicksRemaining <= 0)
  ) {
    const schedule = getDraftSchedule(state.targetColumns);
    return {
      ...state,
      ...advanceDraftTurn(state, schedule, state.turnIndex + 1),
    };
  }

  const available = state.pool.filter((e) => e.status === 'AVAILABLE');
  if (available.length === 0) {
    return { ...state, nextActor: 'COMPLETE', nextAction: null, isComplete: true };
  }

  type RivalDraftReasonTag =
    | 'WEAK_TARGET'
    | 'STRONG_BAN'
    | 'RIVAL_TURF'
    | 'RIVAL_WEAK_BAN'
    | 'GENERAL';

  let bestEntry = available[0];
  let bestScore = -Infinity;
  let reasonTag: RivalDraftReasonTag = 'GENERAL';

  for (const entry of available) {
    let score = rng() * 6;
    let tag: RivalDraftReasonTag = 'GENERAL';

    if (action === 'BAN') {
      if (entry.domainId === playerStats?.strongestDomainId) {
        score += 48;
        tag = 'STRONG_BAN';
      } else if (entry.domainId === playerStats?.mostPlayedDomainId) {
        score += 42;
        tag = 'STRONG_BAN';
      }
      if (challengerProfile.weakDomains.includes(entry.domainId)) {
        score += 36;
        if (tag === 'GENERAL') tag = 'RIVAL_WEAK_BAN';
      }
      if (challengerProfile.strongDomains.includes(entry.domainId)) {
        score -= 35;
      }
      if (entry.domainId === playerStats?.weakestDomainId) {
        score -= 30; // Never ban the player's weakness!
      }
    } else {
      // PICK
      if (entry.domainId === playerStats?.weakestDomainId) {
        score += 48;
        tag = 'WEAK_TARGET';
      }
      if (challengerProfile.strongDomains.includes(entry.domainId)) {
        score += 38;
        if (tag === 'GENERAL') tag = 'RIVAL_TURF';
      }
      if (challengerProfile.weakDomains.includes(entry.domainId)) {
        score -= 32;
      }
      if (
        entry.domainId === playerStats?.strongestDomainId ||
        entry.domainId === playerStats?.mostPlayedDomainId
      ) {
        score -= 22;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
      reasonTag = tag;
    }
  }

  const nextStatus: DraftEntryStatusV4 = action === 'PICK' ? 'PICKED_RIVAL' : 'BANNED_RIVAL';
  const updatedEntry: CategoryDraftEntryV4 = { ...bestEntry, status: nextStatus };
  const nextPool = state.pool.map((e) => (e.entryId === bestEntry.entryId ? updatedEntry : e));

  let banterLine: string;
  if (action === 'BAN') {
    banterLine =
      reasonTag === 'STRONG_BAN'
        ? `${challengerProfile.name} banned your comfort zone "${bestEntry.wittyTitle}" (${bestEntry.topicSubtitle})!`
        : `${challengerProfile.name} crossed "${bestEntry.wittyTitle}" (${bestEntry.topicSubtitle}) right off the board!`;
  } else {
    banterLine =
      reasonTag === 'WEAK_TARGET'
        ? `${challengerProfile.name} checked your career radar and drafted "${bestEntry.wittyTitle}" (${bestEntry.topicSubtitle})!`
        : `${challengerProfile.name} drafted their signature turf: "${bestEntry.wittyTitle}" (${bestEntry.topicSubtitle})!`;
  }

  const draftWithCounts: CategoryDraftStateV4 = {
    ...state,
    pool: nextPool,
    rivalPicksRemaining: state.rivalPicksRemaining - (action === 'PICK' ? 1 : 0),
    rivalBansRemaining: state.rivalBansRemaining - (action === 'BAN' ? 1 : 0),
    lastMove: { actor: 'RIVAL', action, entry: updatedEntry, banterLine },
    log: [...state.log, banterLine],
  };

  const schedule = getDraftSchedule(state.targetColumns);
  const nextStep = advanceDraftTurn(draftWithCounts, schedule, state.turnIndex + 1);
  return {
    ...draftWithCounts,
    ...nextStep,
  };
}

/**
 * Converts a completed (or in-progress) `CategoryDraftStateV4` into exact `DraftedColumnSpecV4[]`
 * ready to pass directly into `createStageBoard({ draftedColumns, ... })`.
 */
export function finalizeDraftToBoardColumns(
  state: CategoryDraftStateV4,
  rng: () => number = Math.random,
): readonly DraftedColumnSpecV4[] {
  const columns: DraftedColumnSpecV4[] = [];
  const usedDomains = new Set<DomainId>();
  const usedWedges = new Set<WedgeColorId>();

  const playerPicked = state.pool.filter((e) => e.status === 'PICKED_PLAYER');
  const rivalPicked = state.pool.filter((e) => e.status === 'PICKED_RIVAL');

  // Interleave player & rival picks nicely across the board
  const maxLen = Math.max(playerPicked.length, rivalPicked.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < playerPicked.length && columns.length < state.targetColumns) {
      const e = playerPicked[i];
      columns.push({
        domainId: e.domainId,
        wittyTitle: e.wittyTitle,
        topicSubtitle: e.topicSubtitle,
        pickedBy: 'PLAYER',
      });
      usedDomains.add(e.domainId);
      usedWedges.add(e.wedgeId);
    }
    if (i < rivalPicked.length && columns.length < state.targetColumns) {
      const e = rivalPicked[i];
      columns.push({
        domainId: e.domainId,
        wittyTitle: e.wittyTitle,
        topicSubtitle: e.topicSubtitle,
        pickedBy: 'RIVAL',
      });
      usedDomains.add(e.domainId);
      usedWedges.add(e.wedgeId);
    }
  }

  // Fill remaining slots with unbanned AVAILABLE categories, prioritizing uncovered Color Wedges!
  const remainingAvailable = shuffleArr(
    state.pool.filter((e) => e.status === 'AVAILABLE' && !usedDomains.has(e.domainId)),
    rng,
  ).sort((a, b) => {
    const aNew = usedWedges.has(a.wedgeId) ? 1 : 0;
    const bNew = usedWedges.has(b.wedgeId) ? 1 : 0;
    return aNew - bNew;
  });

  for (const e of remainingAvailable) {
    if (columns.length >= state.targetColumns) break;
    columns.push({
      domainId: e.domainId,
      wittyTitle: e.wittyTitle,
      topicSubtitle: e.topicSubtitle,
      pickedBy: 'SHOW',
    });
    usedDomains.add(e.domainId);
    usedWedges.add(e.wedgeId);
  }

  return columns;
}
