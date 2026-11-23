#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v4.0 — Headless 500-Board & Challenger AI Proof Suite
// Proves:
//   1. 0 soft-locks across 500 simulated full matches over all 6 topologies
//   2. 100% exact 1:1 score conservation across tiles, streaks, 2x Double Down,
//      Power Play wagers, Rival Bounties, Show Wheel outcomes, & Challenger claims
//   3. Working Padlocks, Fog-of-War, Spotlight Roulette, 6-Slice Show Wheel,
//      Line-Clear Combos, 6 Color Crown Wedges, & 72 Witty Column Headers
//   4. Stat-aware Challenger FORCE_WEAK_TILE, FREEZE_FAVORITE_COLUMN,
//      PLANT_BOUNTY, CLAIM_TILE, & Boss Category Pick & Ban Draft
//   5. Honest Stage Victory Rule (`didPlayerWinBoard`) with ZERO fake `||` pass
// ============================================================================

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Register lightweight ESM hook so Node 26 native TS stripping resolves extensionless `.ts` imports
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !path.extname(specifier) &&
      context.parentURL?.startsWith('file:')
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const tsCandidate = path.resolve(parentDir, `${specifier}.ts`);
      if (fs.existsSync(tsCandidate)) {
        return {
          url: pathToFileURL(tsCandidate).href,
          shortCircuit: true,
        };
      }
    }
    return nextResolve(specifier, context);
  },
});

const Scoring = await import('../src/v4/ScoringV4.ts');
const Board = await import('../src/v4/BoardEngine.ts');
const Challenger = await import('../src/v4/ChallengerAI.ts');
const Contracts = await import('../src/v4/contracts.ts');

// ============================================================================
// 1. SAMPLE CHALLENGERS & PLAYER CAREER STAT PROFILES
// ============================================================================

const SAMPLE_CHALLENGERS = [
  {
    id: 'frankie',
    name: 'Frankie "Last Call" Russo',
    title: 'Neighborhood Pub-Quiz Bartender',
    hometown: 'Brooklyn, NY',
    avatarPortraitUrl: './assets/portraits_cutout/teo.png',
    accentHex: '#ff9347',
    strongDomains: [4, 5],
    weakDomains: [1, 6],
    baseAccuracy: 0.48,
    signatureGimmick: 'CLAIM_TILE',
    introLines: ['First round is on the house.', 'Hope you brought your coaster notes.'],
    onForceCategoryLines: ['Pouring you a stiff glass of {domain}!'],
    onFreezeColumnLines: ['Cutting you off from {category} for one turn!'],
    onPlayerBigPlayLines: ['Okay, respect.'],
    onPlayerMissLines: ['Check please!'],
    winMatchLine: 'Closing time.',
    loseMatchLine: 'Drinks are on me.',
  },
  {
    id: 'trevor',
    name: 'Trevor "14-Day" Blake',
    title: 'Regional TV Streak Holder',
    hometown: 'Columbus, OH',
    avatarPortraitUrl: './assets/portraits_cutout/soren.png',
    accentHex: '#f5c451',
    strongDomains: [0, 8, 2],
    weakDomains: [4, 9],
    baseAccuracy: 0.62,
    signatureGimmick: 'FORCE_WEAK_TILE',
    introLines: ['Smile for Channel 7.', 'Try not to squint at the veneers.'],
    onForceCategoryLines: ['Checking your stats... welcome to {weakDomain}!'],
    onFreezeColumnLines: ['Freezing {category} — try a new trick!'],
    onPlayerBigPlayLines: ['Lucky buzz.'],
    onPlayerMissLines: ['Oof, tough look on daytime TV.'],
    winMatchLine: 'Make that 15 days.',
    loseMatchLine: 'Demand a recount!',
  },
  {
    id: 'priya',
    name: 'Dr. Priya Nair',
    title: 'ER Trauma Doc & Speed-Crossword Champ',
    hometown: 'Chicago, IL',
    avatarPortraitUrl: './assets/portraits_cutout/lindqvist.png',
    accentHex: '#34d993',
    strongDomains: [1, 7, 11],
    weakDomains: [5],
    baseAccuracy: 0.7,
    signatureGimmick: 'PLANT_BOUNTY',
    introLines: ['Pulse check: steady.', 'Clock is already ticking.'],
    onForceCategoryLines: ['Prescribing one dose of {domain}.'],
    onFreezeColumnLines: ['Putting {category} in triage for a turn.'],
    onPlayerBigPlayLines: ['Clean diagnosis.'],
    onPlayerMissLines: ['Missed the vitals there.'],
    winMatchLine: 'Procedure complete.',
    loseMatchLine: 'Impressive bedside manner.',
  },
  {
    id: 'kenji',
    name: 'Kenji "Zero-Lag" Takahashi',
    title: 'Shogi & Quiz-Bowl Prodigy',
    hometown: 'Tokyo, Japan',
    avatarPortraitUrl: './assets/portraits_cutout/tariq.png',
    accentHex: '#46a8ff',
    strongDomains: [6, 11, 1],
    weakDomains: [9, 10],
    baseAccuracy: 0.74,
    signatureGimmick: 'FREEZE_FAVORITE_COLUMN',
    introLines: ['Three moves ahead already.', 'Let us test your latency.'],
    onForceCategoryLines: ['Your radar dips at {weakDomain}. Checkmate.'],
    onFreezeColumnLines: ['Locking down {category} — find another line.'],
    onPlayerBigPlayLines: ['Fast hands.'],
    onPlayerMissLines: ['Too slow on the read.'],
    winMatchLine: 'Zero lag, zero mercy.',
    loseMatchLine: 'Well calculated.',
  },
  {
    id: 'vance',
    name: 'Julian Vance',
    title: '3-Time Reigning World\'s Smartest Champion',
    hometown: 'London, UK',
    avatarPortraitUrl: './assets/portraits_cutout/vance.png',
    accentHex: '#b47cff',
    strongDomains: [0, 3, 8, 10],
    weakDomains: [5],
    baseAccuracy: 0.79,
    signatureGimmick: 'FORCE_WEAK_TILE',
    introLines: ['The world is watching.', 'Show me why you earned this podium.'],
    onForceCategoryLines: ['The data never lies — step into {weakDomain}.'],
    onFreezeColumnLines: ['We are closing {category} for the evening.'],
    onPlayerBigPlayLines: ['Now that was championship caliber.'],
    onPlayerMissLines: ['The spotlight gets hot up here.'],
    winMatchLine: 'Still the champion.',
    loseMatchLine: 'The crown is yours.',
  },
];

const SAMPLE_PLAYER_PROFILES = [
  {
    totalAnswered: 140,
    overallAccuracyPct: 71,
    bestStreak: 9,
    strongestDomainId: 4,
    strongestDomainName: 'Film, Music & Pop',
    strongestAccuracyPct: 91,
    weakestDomainId: 1,
    weakestDomainName: 'Science & Space',
    weakestAccuracyPct: 38,
    mostPlayedDomainId: 4,
    mostPlayedDomainName: 'Film, Music & Pop',
  },
  {
    totalAnswered: 95,
    overallAccuracyPct: 68,
    bestStreak: 6,
    strongestDomainId: 0,
    strongestDomainName: 'World History',
    strongestAccuracyPct: 88,
    weakestDomainId: 11,
    weakestDomainName: 'Logic & Math',
    weakestAccuracyPct: 34,
    mostPlayedDomainId: 5,
    mostPlayedDomainName: 'Sports & Games',
  },
  {
    totalAnswered: 220,
    overallAccuracyPct: 76,
    bestStreak: 12,
    strongestDomainId: 6,
    strongestDomainName: 'Tech & Computing',
    strongestAccuracyPct: 94,
    weakestDomainId: 3,
    weakestDomainName: 'Arts & Architecture',
    weakestAccuracyPct: 41,
    mostPlayedDomainId: 6,
    mostPlayedDomainName: 'Tech & Computing',
  },
  {
    totalAnswered: 60,
    overallAccuracyPct: 64,
    bestStreak: 5,
    strongestDomainId: 2,
    strongestDomainName: 'Geography & Wonders',
    strongestAccuracyPct: 85,
    weakestDomainId: 8,
    weakestDomainName: 'World Affairs & Law',
    weakestAccuracyPct: 31,
    mostPlayedDomainId: 2,
    mostPlayedDomainName: 'Geography & Wonders',
  },
];

// ============================================================================
// 2. UNIT TESTS: HONEST 1:1 SCORING, VICTORY RULES, HEADERS, WHEEL, & DRAFT
// ============================================================================

function verifyHonestScoringAndVictoryRules() {
  // 2a. Exact streak bonus formula: +25 * min(streak, 8)
  for (let s = 0; s <= 12; s++) {
    assert.equal(Scoring.computeStreakBonus(s), 25 * Math.min(s, 8));
  }

  // 2b. Standard exact tile values & non-board default (200)
  const nonBoard = Scoring.scoreAnswerV4({
    isCorrect: true,
    currentPlayerScore: 0,
    currentStreak: 0,
  });
  assert.equal(nonBoard.evaluated.basePoints, 200);
  assert.equal(nonBoard.playerDelta, 200);
  assert.equal(nonBoard.newPlayerScore, 200);

  for (const val of [100, 200, 400, 800]) {
    const hit = Scoring.scoreAnswerV4({
      isCorrect: true,
      baseTilePoints: val,
      currentPlayerScore: 500,
      currentStreak: 3,
    });
    assert.equal(hit.evaluated.basePoints, val);
    assert.equal(hit.evaluated.bonusPoints, 75);
    assert.equal(hit.playerDelta, val + 75);
    assert.equal(hit.newPlayerScore, 500 + val + 75);

    // 2x Double Down HIT = 2x base + streak
    const ddHit = Scoring.scoreAnswerV4({
      isCorrect: true,
      baseTilePoints: val,
      currentPlayerScore: 500,
      currentStreak: 2,
      doubleDownArmed: true,
    });
    assert.equal(ddHit.playerDelta, val * 2 + 50);
    assert.equal(ddHit.newPlayerScore, 500 + val * 2 + 50);

    // 2x Double Down MISS = -0.5x base (NEVER silently zeroed when player has points!)
    const ddMiss = Scoring.scoreAnswerV4({
      isCorrect: false,
      baseTilePoints: val,
      currentPlayerScore: 500,
      currentStreak: 4,
      doubleDownArmed: true,
    });
    assert.equal(ddMiss.playerDelta, -(val * 0.5));
    assert.equal(ddMiss.newPlayerScore, 500 - val * 0.5);
    assert.equal(ddMiss.newStreak, 0);
  }

  // Double Down miss clamping vs allowNegative
  const ddFloor = Scoring.scoreAnswerV4({
    isCorrect: false,
    baseTilePoints: 800,
    currentPlayerScore: 150,
    doubleDownArmed: true,
    allowNegative: false,
  });
  assert.equal(ddFloor.playerDelta, -150);
  assert.equal(ddFloor.newPlayerScore, 0);
  assert.equal(ddFloor.wasClampedAtZero, true);
  assert.equal(
    ddFloor.evaluated.basePoints +
      ddFloor.evaluated.bonusPoints +
      ddFloor.evaluated.wagerDeltaPoints,
    ddFloor.evaluated.netPointsDelta,
  );

  const ddNeg = Scoring.scoreAnswerV4({
    isCorrect: false,
    baseTilePoints: 800,
    currentPlayerScore: 150,
    doubleDownArmed: true,
    allowNegative: true,
  });
  assert.equal(ddNeg.playerDelta, -400);
  assert.equal(ddNeg.newPlayerScore, -250);

  // 2c. POWER_PLAY bounds & exact +/- wager
  assert.deepEqual(Scoring.getPowerPlayWagerBounds(0), {
    minWager: 50,
    maxWager: 200,
    suggestedWager: 100,
  });
  assert.equal(Scoring.clampPowerPlayWager(10, 600), 50);
  assert.equal(Scoring.clampPowerPlayWager(9999, 600), 600);
  assert.equal(Scoring.clampPowerPlayWager(500, 100), 200);

  const ppHit = Scoring.scoreAnswerV4({
    isCorrect: true,
    baseTilePoints: 400,
    currentPlayerScore: 700,
    powerPlayWager: 550,
    twist: 'POWER_PLAY',
  });
  assert.equal(ppHit.playerDelta, 550);
  assert.equal(ppHit.newPlayerScore, 1250);

  const ppMiss = Scoring.scoreAnswerV4({
    isCorrect: false,
    baseTilePoints: 400,
    currentPlayerScore: 700,
    powerPlayWager: 550,
    twist: 'POWER_PLAY',
  });
  assert.equal(ppMiss.playerDelta, -550);
  assert.equal(ppMiss.newPlayerScore, 150);

  // Preview 1:1 parity check
  const prev = Scoring.previewTileScoring({
    baseTilePoints: 400,
    currentPlayerScore: 600,
    currentStreak: 3,
    doubleDownArmed: true,
  });
  const actualDDHit = Scoring.scoreAnswerV4({
    isCorrect: true,
    baseTilePoints: 400,
    currentPlayerScore: 600,
    currentStreak: 3,
    doubleDownArmed: true,
  });
  const actualDDMiss = Scoring.scoreAnswerV4({
    isCorrect: false,
    baseTilePoints: 400,
    currentPlayerScore: 600,
    currentStreak: 3,
    doubleDownArmed: true,
  });
  assert.equal(prev.doubleDownHitDelta, actualDDHit.playerDelta);
  assert.equal(prev.doubleDownMissAppliedDelta, actualDDMiss.playerDelta);

  // 2d. Honest Stage Victory Rule (NO v3 fake `||` participation pass!)
  const sampleBoard = Board.createStageBoard({
    topology: 'OPEN_CLASSIC',
    hasActiveRival: true,
    soloTargetScore: 1000,
    seed: 'victory-test',
  });

  // Trailing rival 12,000 vs 45,000 MUST BE A LOSS even though 12,000 >= soloTargetScore!
  assert.equal(
    Scoring.didPlayerWinBoard({
      ...sampleBoard,
      playerScore: 12000,
      rivalScore: 45000,
      hasActiveRival: true,
      soloTargetScore: 1000,
    }),
    false,
    'Trailing Rival 12,000 to 45,000 must NEVER win!',
  );

  assert.equal(
    Scoring.didPlayerWinBoard({
      ...sampleBoard,
      playerScore: 2600,
      rivalScore: 2400,
      hasActiveRival: true,
    }),
    true,
  );

  // Tiebreak by Crown Wedges
  assert.equal(
    Scoring.didPlayerWinBoard({
      ...sampleBoard,
      playerScore: 2000,
      rivalScore: 2000,
      earnedWedges: ['GOLD_HISTORY', 'SAPPHIRE_GEO'],
      rivalWedges: ['GOLD_HISTORY'],
      hasActiveRival: true,
    }),
    true,
  );
  assert.equal(
    Scoring.didPlayerWinBoard({
      ...sampleBoard,
      playerScore: 2000,
      rivalScore: 2000,
      earnedWedges: ['GOLD_HISTORY'],
      rivalWedges: ['GOLD_HISTORY', 'SAPPHIRE_GEO'],
      hasActiveRival: true,
    }),
    false,
  );

  // Solo tryout (hasActiveRival === false)
  assert.equal(
    Scoring.didPlayerWinBoard({
      ...sampleBoard,
      playerScore: 1200,
      rivalScore: 99999,
      soloTargetScore: 1200,
      hasActiveRival: false,
    }),
    true,
  );
  assert.equal(
    Scoring.didPlayerWinBoard({
      ...sampleBoard,
      playerScore: 1199,
      rivalScore: 0,
      soloTargetScore: 1200,
      hasActiveRival: false,
    }),
    false,
  );
}

function verifyWittyHeadersAndWheelOutcomes() {
  const headers = Board.getAllWittyColumnHeaders();
  assert.ok(headers.length >= 60, `Expected >= 60 witty headers, got ${headers.length}`);
  const uniqueTitles = new Set(headers.map((h) => h.wittyTitle));
  assert.equal(uniqueTitles.size, headers.length, 'All witty headers must be unique');

  const bannedRe = /\b(telemetry|dossier|protocol|cipher|cufflink|meridian ledger)\b/i;
  const yearCommaRe = /\b[12],\d{3}\b/;
  for (const h of headers) {
    assert.ok(!bannedRe.test(h.wittyTitle), `Banned spy-slop word in header: ${h.wittyTitle}`);
    assert.ok(!yearCommaRe.test(h.wittyTitle), `Year comma found in header: ${h.wittyTitle}`);
  }

  // Test all 6 Show Wheel outcomes explicitly
  const rng = Board.createSeededRng('wheel-proof');
  let baseBoard = Board.createStageBoard({
    topology: 'GRAND_FINALE_VAULT',
    cols: 6,
    rows: 4,
    hasActiveRival: true,
    seed: 'wheel-board',
  });
  baseBoard = { ...baseBoard, playerScore: 600, rivalScore: 500 };

  const outcomesTested = new Set();
  for (const slice of Board.WHEEL_SLICES_V4) {
    const res = Board.spinCurveballWheel(baseBoard, rng, slice.outcome);
    outcomesTested.add(res.outcome);
    assert.equal(res.board.playerScore, baseBoard.playerScore + res.playerScoreDelta);
    assert.equal(res.board.rivalScore, baseBoard.rivalScore + res.rivalScoreDelta);

    switch (slice.outcome) {
      case 'DOUBLE_POT':
        assert.equal(res.nextTileEffect, 'DOUBLE_POT');
        break;
      case 'FREE_WEDGE_SHARD':
        assert.ok(res.awardedWedge !== null);
        assert.equal(res.board.earnedWedges.length, 1);
        break;
      case 'STEAL_RIVAL_POINTS':
        assert.equal(res.playerScoreDelta, 250);
        assert.equal(res.rivalScoreDelta, -250);
        break;
      case 'RECHARGE_LIFELINES':
        assert.equal(res.board.lifelines5050Left, baseBoard.lifelines5050Left + 1);
        assert.equal(res.board.lifelinesHintLeft, baseBoard.lifelinesHintLeft + 1);
        break;
      case 'SHATTER_ALL_LOCKS':
        assert.ok(res.unlockedTileIds.length > 0);
        assert.equal(
          res.board.tiles.filter((t) => t.status === 'PADLOCKED' || t.status === 'FOGGED').length,
          0,
        );
        break;
      case 'HOT_SEAT_ALL_IN':
        assert.equal(res.nextTileEffect, 'HOT_SEAT_ALL_IN');
        break;
    }
  }
  assert.equal(outcomesTested.size, 6, 'All 6 WheelSliceOutcomes must be verified');

  // Verify synthetic total-lockup Stage Surge recovery (both padlocks AND all-frozen columns!)
  const allLockedBoard = {
    ...baseBoard,
    tiles: baseBoard.tiles.map((t) => ({ ...t, status: 'PADLOCKED' })),
  };
  const surge = Board.ensurePlayableTilesOrStageSurge(allLockedBoard, rng, 2);
  assert.equal(surge.triggered, true);
  assert.equal(surge.unlockedTileIds.length, 2);
  assert.ok(Board.getPlayableTiles(surge.board).length >= 2);

  const allFrozenBoard = {
    ...baseBoard,
    columns: baseBoard.columns.map((c) => ({ ...c, frozenTurnsRemaining: 1 })),
    tiles: baseBoard.tiles.map((t) => ({ ...t, status: 'FROZEN_BY_RIVAL' })),
  };
  const thawSurge = Board.ensurePlayableTilesOrStageSurge(allFrozenBoard, rng, 2);
  assert.equal(thawSurge.triggered, true);
  assert.ok(thawSurge.thawedColIndices.length > 0);
  assert.ok(Board.getPlayableTiles(thawSurge.board).length > 0);
}

function verifyBossCategoryPickAndBanDraft() {
  let rivalBannedStrongCount = 0;
  let rivalPickedWeakOrStrongCount = 0;
  const totalDrafts = 30;

  for (let i = 0; i < totalDrafts; i++) {
    const rng = Board.createSeededRng(`boss-draft-${i}`);
    const targetCols = [4, 5, 6][i % 3];
    const rival = SAMPLE_CHALLENGERS[i % SAMPLE_CHALLENGERS.length];
    const stats = SAMPLE_PLAYER_PROFILES[i % SAMPLE_PLAYER_PROFILES.length];

    let draft = Challenger.buildCategoryDraftPool({
      targetColumns: targetCols,
      poolSize: 10,
      rng,
    });
    assert.equal(draft.isComplete, false);
    assert.ok(draft.pool.length >= 10);

    let safety = 0;
    while (!draft.isComplete && safety++ < 20) {
      if (draft.nextActor === 'PLAYER') {
        const available = draft.pool.filter((e) => e.status === 'AVAILABLE');
        // Player tries to ban rival's strong domain or pick player's strong domain
        const choice =
          draft.nextAction === 'BAN'
            ? (available.find((e) => rival.strongDomains.includes(e.domainId)) ?? available[0])
            : (available.find((e) => e.domainId === stats.strongestDomainId) ?? available[0]);
        draft = Challenger.applyPlayerDraftPick(draft, choice.entryId);
      } else if (draft.nextActor === 'RIVAL') {
        const prevAction = draft.nextAction;
        const availableBefore = draft.pool.filter((e) => e.status === 'AVAILABLE');
        const strongAvail = availableBefore.some(
          (e) =>
            e.domainId === stats.strongestDomainId ||
            e.domainId === stats.mostPlayedDomainId ||
            rival.weakDomains.includes(e.domainId),
        );
        const weakOrTurfAvail = availableBefore.some(
          (e) =>
            e.domainId === stats.weakestDomainId ||
            rival.strongDomains.includes(e.domainId),
        );

        draft = Challenger.applyRivalDraftPick(draft, rival, stats, rng);
        const last = draft.lastMove;
        assert.ok(last && last.actor === 'RIVAL');
        if (prevAction === 'BAN' && strongAvail) {
          if (
            last.entry.domainId === stats.strongestDomainId ||
            last.entry.domainId === stats.mostPlayedDomainId ||
            rival.weakDomains.includes(last.entry.domainId)
          ) {
            rivalBannedStrongCount++;
          }
        }
        if (prevAction === 'PICK' && weakOrTurfAvail) {
          if (
            last.entry.domainId === stats.weakestDomainId ||
            rival.strongDomains.includes(last.entry.domainId)
          ) {
            rivalPickedWeakOrStrongCount++;
          }
        }
      }
    }

    assert.equal(draft.isComplete, true);
    const cols = Challenger.finalizeDraftToBoardColumns(draft, rng);
    assert.equal(cols.length, targetCols);

    // Ensure ZERO banned entries leaked onto the final board
    const bannedDomains = new Set(
      draft.pool
        .filter((e) => e.status === 'BANNED_PLAYER' || e.status === 'BANNED_RIVAL')
        .map((e) => e.domainId),
    );
    for (const c of cols) {
      assert.ok(!bannedDomains.has(c.domainId), 'Banned category leaked onto board!');
    }

    // Feed drafted columns straight into createStageBoard!
    const draftedBoard = Board.createStageBoard({
      topology: 'GRAND_FINALE_VAULT',
      cols: targetCols,
      rows: 4,
      draftedColumns: cols,
      rng,
    });
    assert.equal(draftedBoard.columns.length, targetCols);
    assert.equal(Board.verifyBoardReachability(draftedBoard).ok, true);
  }

  assert.ok(rivalBannedStrongCount >= 20, 'Rival should consistently ban player comfort/own weak domains');
  assert.ok(rivalPickedWeakOrStrongCount >= 25, 'Rival should consistently draft weak/strong tactical domains');
  return { totalDrafts, rivalBannedStrongCount, rivalPickedWeakOrStrongCount };
}

// ============================================================================
// 3. 500-BOARD FULL HEADLESS SIMULATION ACROSS ALL 6 TOPOLOGIES
// ============================================================================

function run500BoardSimulation() {
  const TOTAL_BOARDS = 500;
  const topologies = Board.ALL_BOARD_TOPOLOGIES_V4;

  const stats = {
    totalBoards: TOTAL_BOARDS,
    totalTurnsPlayed: 0,
    softLocks: 0,
    scoreConservationFailures: 0,
    reachabilityFailures: 0,
    padlocksOrFogUnlocked: 0,
    crownWedgesAwarded: 0,
    rivalWedgesAwarded: 0,
    lineClearsTriggered: 0,
    powerPlaysResolved: 0,
    doubleDownsResolved: 0,
    doubleDownMissPenaltiesApplied: 0,
    wheelSpins: 0,
    wheelOutcomesSeen: new Set(),
    spotlightSweepsTriggered: 0,
    stageSurgesTriggered: 0,
    bountiesPlanted: 0,
    bountiesResolved: 0,
    challengerMoves: {
      FORCE_WEAK_TILE: 0,
      FREEZE_FAVORITE_COLUMN: 0,
      PLANT_BOUNTY: 0,
      CLAIM_TILE: 0,
    },
    statAwareWeakForces: 0,
    statAwareFavoriteFreezes: 0,
    stageSpotlightForcedTurns: 0,
    playerWins: 0,
    rivalWins: 0,
    soloWins: 0,
    soloLosses: 0,
    byTopology: {},
  };

  for (const topo of topologies) {
    stats.byTopology[topo] = {
      boards: 0,
      softLocks: 0,
      forcedTurns: 0,
      padlocksOrFogUnlocked: 0,
      avgAdjacentFormatCollisionPct: 0,
      totalAdjPairs: 0,
      collidingAdjPairs: 0,
    };
  }

  const sizeOptions = [
    { cols: 4, rows: 3 },
    { cols: 4, rows: 4 },
    { cols: 5, rows: 4 },
    { cols: 6, rows: 4 },
  ];

  for (let i = 0; i < TOTAL_BOARDS; i++) {
    const rng = Board.createSeededRng(`sim-v4-board-${i}`);
    const topology = topologies[i % topologies.length];
    const size =
      topology === 'GRAND_FINALE_VAULT'
        ? { cols: 6, rows: 4 }
        : sizeOptions[Math.floor(i / topologies.length) % sizeOptions.length];
    const hasActiveRival = !(topology === 'OPEN_CLASSIC' && i % 12 === 0);
    const challenger = SAMPLE_CHALLENGERS[i % SAMPLE_CHALLENGERS.length];
    const playerProfile = SAMPLE_PLAYER_PROFILES[i % SAMPLE_PLAYER_PROFILES.length];

    // On half of Gauntlet/Spotlight/Finale boards, guarantee player's weak & favorite domains
    // appear on the board so stat-aware targeting is stress-tested thoroughly!
    let customDomains;
    if (
      hasActiveRival &&
      i % 2 === 0 &&
      (topology === 'SPOTLIGHT_ROULETTE' ||
        topology === 'CHALLENGER_GAUNTLET' ||
        topology === 'GRAND_FINALE_VAULT')
    ) {
      const seedDomains = [playerProfile.weakestDomainId, playerProfile.mostPlayedDomainId];
      for (const d of Board.ALL_DOMAIN_IDS_V4) {
        if (seedDomains.length >= size.cols) break;
        if (!seedDomains.includes(d)) seedDomains.push(d);
      }
      customDomains = seedDomains.slice(0, size.cols);
    }

    let board = Board.createStageBoard({
      topology,
      cols: size.cols,
      rows: size.rows,
      maxTurns: Math.min(size.cols * size.rows, 14),
      allowedFormats: Board.ALL_QUESTION_FORMATS_V4,
      domains: customDomains,
      hasActiveRival,
      soloTargetScore: 1400,
      rng,
    });

    const topoRec = stats.byTopology[topology];
    topoRec.boards++;

    // Verify Turn-1 reachability & >= 3 starter OPEN tiles
    const reach = Board.verifyBoardReachability(board);
    if (!reach.ok || reach.initialOpenCount < 3) {
      stats.reachabilityFailures++;
    }

    // Verify 6 distinct wedges on default 6-column GRAND_FINALE_VAULT
    if (topology === 'GRAND_FINALE_VAULT' && !customDomains) {
      const uniqueWedges = new Set(board.columns.map((c) => c.wedgeId));
      assert.equal(uniqueWedges.size, 6, 'Default 6-col Grand Finale must cover all 6 Crown Wedges');
    }

    // Verify format diversity (all 7 formats present on every board since min tiles = 12 >= 7)
    const presentFormats = new Set(board.tiles.map((t) => t.format));
    assert.equal(
      presentFormats.size,
      Board.ALL_QUESTION_FORMATS_V4.length,
      `Expected all 7 formats on ${size.cols}x${size.rows} ${topology}, got ${presentFormats.size}`,
    );

    // Count adjacent format pairs (should be 0 collisions with 7 formats!)
    for (const tile of board.tiles) {
      const right = Board.getTileAt(board, tile.colIndex + 1, tile.rowIndex);
      if (right) {
        topoRec.totalAdjPairs++;
        if (right.format === tile.format) topoRec.collidingAdjPairs++;
      }
      const down = Board.getTileAt(board, tile.colIndex, tile.rowIndex + 1);
      if (down) {
        topoRec.totalAdjPairs++;
        if (down.format === tile.format) topoRec.collidingAdjPairs++;
      }
    }

    // Full match simulation loop with exact running ledger
    let ledgerPlayerScore = 0;
    let ledgerRivalScore = 0;
    let playerStreak = 0;
    let pendingWheelEffect = 'NONE';
    let safetyTurns = 0;

    while (!board.isBoardComplete && safetyTurns++ < 40) {
      const selectable = Board.getSelectableTiles(board);
      if (selectable.length === 0) {
        stats.softLocks++;
        topoRec.softLocks++;
        break;
      }

      if (board.forcedTileId !== null) {
        assert.equal(selectable.length, 1, 'When forcedTileId is set, selectable must have length 1');
        assert.equal(selectable[0].tileId, board.forcedTileId);
        assert.ok(board.forcedReasonBanner && board.forcedReasonBanner.length > 8);
        topoRec.forcedTurns++;
      }

      // Player picks a selectable tile (mix of strategic high-value & random play)
      const chosenTile =
        selectable.length === 1
          ? selectable[0]
          : selectable[Math.floor(rng() * selectable.length)];

      // Simulate player accuracy (domain-sensitive!)
      let playerAcc = 0.68;
      if (chosenTile.domainId === playerProfile.strongestDomainId) playerAcc = 0.88;
      else if (chosenTile.domainId === playerProfile.weakestDomainId) playerAcc = 0.36;
      const isCorrect = rng() < playerAcc;

      // Exercise POWER_PLAY wagers and 2x Double Down honestly
      let powerPlayWager = null;
      let doubleDownArmed = false;
      if (chosenTile.twist === 'POWER_PLAY') {
        const bounds = Scoring.getPowerPlayWagerBounds(board.playerScore);
        powerPlayWager = Math.round(
          bounds.minWager + rng() * (bounds.maxWager - bounds.minWager),
        );
        stats.powerPlaysResolved++;
      } else if (rng() < 0.25) {
        doubleDownArmed = true;
        stats.doubleDownsResolved++;
      }

      if (chosenTile.twist === 'RIVAL_BOUNTY') {
        stats.bountiesResolved++;
      }

      const preScore = board.playerScore;
      const mockEval = {
        isCorrect,
        accuracyRatio: isCorrect ? 1 : 0,
        isBullseyeOrSweep: isCorrect && rng() < 0.2,
        basePoints: isCorrect ? chosenTile.pointValue : 0,
        bonusPoints: 0,
        wagerDeltaPoints: 0,
        netPointsDelta: isCorrect ? chosenTile.pointValue : 0,
        correctSummaryLabel: isCorrect ? 'Correct' : 'Missed',
        detailBreakdown: isCorrect ? `+${chosenTile.pointValue}` : '0',
      };

      const res = Board.resolveTileResult(board, chosenTile.tileId, mockEval, {
        currentStreak: playerStreak,
        doubleDownArmed,
        powerPlayWager,
        wheelEffect: pendingWheelEffect,
        allowNegative: false,
        rng,
      });

      // Verify exact 1:1 score conservation on tile resolution
      ledgerPlayerScore += res.playerScoreDelta;
      ledgerRivalScore += res.rivalScoreDelta;
      if (
        res.board.playerScore !== ledgerPlayerScore ||
        res.board.rivalScore !== ledgerRivalScore ||
        res.evaluated.basePoints +
          res.evaluated.bonusPoints +
          res.evaluated.wagerDeltaPoints !==
          res.evaluated.netPointsDelta ||
        res.playerScoreDelta !== res.evaluated.netPointsDelta
      ) {
        stats.scoreConservationFailures++;
      }

      // Verify Double Down miss actually subtracted points whenever player had points!
      if (doubleDownArmed && !isCorrect && preScore > 0) {
        assert.ok(
          res.playerScoreDelta < 0,
          `Double Down miss must subtract points when score=${preScore}, got ${res.playerScoreDelta}`,
        );
        stats.doubleDownMissPenaltiesApplied++;
      }

      board = res.board;
      playerStreak = res.newStreak;
      pendingWheelEffect = 'NONE';
      stats.totalTurnsPlayed++;
      stats.padlocksOrFogUnlocked += res.unlockedTileIds.length;
      topoRec.padlocksOrFogUnlocked += res.unlockedTileIds.length;
      if (res.awardedWedge) stats.crownWedgesAwarded++;
      if (res.lineClearTriggered) stats.lineClearsTriggered += res.lineClearRewards.length;
      if (res.triggeredSpotlightSweep) stats.spotlightSweepsTriggered++;
      if (res.stageSurgeTriggered) stats.stageSurgesTriggered++;

      // Spin the 6-slice Show Wheel when triggered!
      if (res.triggeredWheelCurveball && !board.isBoardComplete) {
        const wheelRes = Board.spinCurveballWheel(board, rng);
        ledgerPlayerScore += wheelRes.playerScoreDelta;
        ledgerRivalScore += wheelRes.rivalScoreDelta;
        assert.equal(wheelRes.board.playerScore, ledgerPlayerScore);
        assert.equal(wheelRes.board.rivalScore, ledgerRivalScore);

        board = wheelRes.board;
        pendingWheelEffect = wheelRes.nextTileEffect;
        stats.wheelSpins++;
        stats.wheelOutcomesSeen.add(wheelRes.outcome);
        if (wheelRes.awardedWedge) stats.crownWedgesAwarded++;
        stats.padlocksOrFogUnlocked += wheelRes.unlockedTileIds.length;
      }

      // Active Single-Player Challenger AI turn!
      if (!board.isBoardComplete && board.hasActiveRival) {
        const aiRes = Challenger.runChallengerTurn(board, challenger, playerProfile, rng);
        ledgerRivalScore += aiRes.action.rivalPointsDelta;
        if (
          aiRes.board.playerScore !== ledgerPlayerScore ||
          aiRes.board.rivalScore !== ledgerRivalScore
        ) {
          stats.scoreConservationFailures++;
        }

        board = aiRes.board;
        stats.challengerMoves[aiRes.action.moveKind]++;
        if (aiRes.usedPlayerWeaknessStats && aiRes.action.moveKind === 'FORCE_WEAK_TILE') {
          stats.statAwareWeakForces++;
        }
        if (aiRes.usedPlayerFavoriteStats && aiRes.action.moveKind === 'FREEZE_FAVORITE_COLUMN') {
          stats.statAwareFavoriteFreezes++;
        }
        if (aiRes.action.moveKind === 'PLANT_BOUNTY') {
          stats.bountiesPlanted++;
        }
        if (aiRes.forcedByStageSpotlight) {
          stats.stageSpotlightForcedTurns++;
        }
        if (aiRes.awardedRivalWedge) {
          stats.rivalWedgesAwarded++;
        }
        if (aiRes.stageSurgeTriggered) {
          stats.stageSurgesTriggered++;
        }
        stats.padlocksOrFogUnlocked += aiRes.unlockedTileIds.length;
      }
    }

    assert.equal(board.isBoardComplete, true, `Board ${i} (${topology}) did not reach completion`);
    assert.equal(board.playerScore, ledgerPlayerScore);
    assert.equal(board.rivalScore, ledgerRivalScore);

    // Evaluate final board outcome honestly
    const outcome = Scoring.evaluateBoardOutcome(board);
    assert.equal(outcome.playerWon, Scoring.didPlayerWinBoard(board));
    if (board.hasActiveRival) {
      if (board.playerScore < board.rivalScore) {
        assert.equal(outcome.playerWon, false, 'Player trailing rival must NEVER win!');
      } else if (board.playerScore > board.rivalScore) {
        assert.equal(outcome.playerWon, true);
      }
      if (outcome.playerWon) stats.playerWins++;
      else stats.rivalWins++;
    } else {
      assert.equal(outcome.playerWon, board.playerScore >= board.soloTargetScore);
      if (outcome.playerWon) stats.soloWins++;
      else stats.soloLosses++;
    }
  }

  for (const topo of topologies) {
    const rec = stats.byTopology[topo];
    rec.avgAdjacentFormatCollisionPct =
      rec.totalAdjPairs > 0
        ? Number(((rec.collidingAdjPairs / rec.totalAdjPairs) * 100).toFixed(2))
        : 0;
  }

  return stats;
}

// ============================================================================
// 4. EXECUTE ALL ASSERTIONS & PRINT PROOF METRICS
// ============================================================================

verifyHonestScoringAndVictoryRules();
verifyWittyHeadersAndWheelOutcomes();
const draftMetrics = verifyBossCategoryPickAndBanDraft();
const sim = run500BoardSimulation();

// Hard acceptance assertions
assert.equal(sim.softLocks, 0, `Expected 0 soft-locks, got ${sim.softLocks}`);
assert.equal(sim.reachabilityFailures, 0, `Expected 0 reachability failures, got ${sim.reachabilityFailures}`);
assert.equal(
  sim.scoreConservationFailures,
  0,
  `Expected 0 score conservation failures, got ${sim.scoreConservationFailures}`,
);
assert.ok(sim.padlocksOrFogUnlocked > 1000, 'Expected active padlock/fog unlocking across boards');
assert.ok(sim.powerPlaysResolved > 200, 'Expected active Power Play wagers');
assert.ok(sim.doubleDownMissPenaltiesApplied > 150, 'Expected real Double Down miss penalties');
assert.ok(sim.wheelSpins > 200, 'Expected active Show Wheel spins');
assert.equal(sim.wheelOutcomesSeen.size, 6, 'All 6 WheelSliceOutcomes must trigger in simulation');
assert.ok(sim.lineClearsTriggered > 50, 'Expected Line-Clear combos to trigger');
assert.ok(sim.crownWedgesAwarded > 200, 'Expected Crown Wedges awarded');
assert.ok(sim.challengerMoves.FORCE_WEAK_TILE > 150, 'Expected active Challenger FORCE_WEAK_TILE');
assert.ok(sim.challengerMoves.FREEZE_FAVORITE_COLUMN > 150, 'Expected active Challenger FREEZE_FAVORITE_COLUMN');
assert.ok(sim.challengerMoves.PLANT_BOUNTY > 150, 'Expected active Challenger PLANT_BOUNTY');
assert.ok(sim.challengerMoves.CLAIM_TILE > 500, 'Expected active Challenger CLAIM_TILE');
assert.ok(sim.statAwareWeakForces > 100, 'Expected stat-aware weak-domain Challenger forcing');
assert.ok(sim.statAwareFavoriteFreezes > 50, 'Expected stat-aware favorite-column freezing');
assert.ok(sim.byTopology.SPOTLIGHT_ROULETTE.forcedTurns > 150, 'Spotlight Roulette must trigger forced turns');
assert.ok(sim.byTopology.CHALLENGER_GAUNTLET.forcedTurns > 150, 'Challenger Gauntlet must trigger forced turns');
assert.ok(sim.byTopology.GRAND_FINALE_VAULT.forcedTurns > 150, 'Grand Finale Vault must trigger forced turns');
assert.ok(sim.playerWins > 0 && sim.rivalWins > 0, 'Both player and rival wins must occur honestly');

console.log('====================================================================');
console.log("WORLD'S SMARTEST v4.0 — BOARD, TWISTS, SCORING & CHALLENGER AI PROOF");
console.log('====================================================================');
console.log(`Simulated Full Boards:        ${sim.totalBoards} (all 6 topologies)`);
console.log(`Total Player Turns Simulated: ${sim.totalTurnsPlayed}`);
console.log(`Soft-Locks:                   ${sim.softLocks} (PASS: 0)`);
console.log(`Reachability Failures:        ${sim.reachabilityFailures} (PASS: 0)`);
console.log(`Score Conservation Failures:  ${sim.scoreConservationFailures} (PASS: 100% exact 1:1)`);
console.log(`Witty Column Headers:         ${Board.getAllWittyColumnHeaders().length} across 12 domains`);
console.log('--------------------------------------------------------------------');
console.log(`Padlocks & Fog Unlocked:      ${sim.padlocksOrFogUnlocked}`);
console.log(`Crown Wedges Won (P / R):     ${sim.crownWedgesAwarded} / ${sim.rivalWedgesAwarded}`);
console.log(`Line-Clear Combos Triggered:  ${sim.lineClearsTriggered}`);
console.log(`Power Plays Wagered:          ${sim.powerPlaysResolved}`);
console.log(`2x Double Downs (Miss Pens):  ${sim.doubleDownsResolved} (${sim.doubleDownMissPenaltiesApplied} real penalties)`);
console.log(`Show Wheel Spins:             ${sim.wheelSpins} (${sim.wheelOutcomesSeen.size}/6 outcomes seen)`);
console.log(`Spotlight Sweeps / Surges:    ${sim.spotlightSweepsTriggered} / ${sim.stageSurgesTriggered}`);
console.log('--------------------------------------------------------------------');
console.log('Challenger AI Interference Moves:');
console.log(`  FORCE_WEAK_TILE:            ${sim.challengerMoves.FORCE_WEAK_TILE} (${sim.statAwareWeakForces} stat-matched)`);
console.log(`  FREEZE_FAVORITE_COLUMN:     ${sim.challengerMoves.FREEZE_FAVORITE_COLUMN} (${sim.statAwareFavoriteFreezes} stat-matched)`);
console.log(`  PLANT_BOUNTY:               ${sim.challengerMoves.PLANT_BOUNTY} (${sim.bountiesResolved} resolved on board)`);
console.log(`  CLAIM_TILE:                 ${sim.challengerMoves.CLAIM_TILE}`);
console.log(`  Stage Spotlight Forced:     ${sim.stageSpotlightForcedTurns}`);
console.log(`Boss Drafts Verified:         ${draftMetrics.totalDrafts} (Rival strong-bans: ${draftMetrics.rivalBannedStrongCount}, weak/turf-picks: ${draftMetrics.rivalPickedWeakOrStrongCount})`);
console.log('--------------------------------------------------------------------');
console.log('Per-Topology Summary:');
for (const topo of Board.ALL_BOARD_TOPOLOGIES_V4) {
  const r = sim.byTopology[topo];
  console.log(
    `  ${topo.padEnd(20)} boards=${String(r.boards).padStart(3)}  softLocks=${r.softLocks}  forcedTurns=${String(r.forcedTurns).padStart(3)}  unlocked=${String(r.padlocksOrFogUnlocked).padStart(4)}  adjFormatCollisions=${r.avgAdjacentFormatCollisionPct}%`,
  );
}
console.log('--------------------------------------------------------------------');
console.log(
  `Honest Match Outcomes:        Rival Matches ${sim.playerWins}W / ${sim.rivalWins}L | Solo Tryouts ${sim.soloWins}W / ${sim.soloLosses}L`,
);
console.log('ALL ASSERTIONS PASSED!');
