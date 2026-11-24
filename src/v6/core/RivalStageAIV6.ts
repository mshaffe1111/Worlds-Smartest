// ============================================================================
// WORLD'S SMARTEST v6.0 — 10-Stage Champion Rival AI Engine
// Synced 1:1 with Clause 14-B Cast (`STAGE_01_VAUDEVILLE_PALACE` .. `STAGE_10`)
// Graph/Bridge Pathfinding · Rotary Alignment · Casino Push-Luck · Chain-Locking
// Telegraphed Intents & Bluff Tells · Strictly Fair Difficulty Scaling
// ============================================================================

import type {
  BoardDefinitionV6,
  BoardNodeV6,
  BoardRuntimeStateV6,
  BoardTwistMutationIdV6,
  StageWorldIdV6,
} from '../contracts_v6.ts';

export type RivalActionKindV6 =
  | 'CLAIM_NODE'
  | 'CHAIN_LOCK'
  | 'RING_DISRUPT'
  | 'BLUFF_BAIT'
  | 'AUCTION_BID'
  | 'FROZEN_SKIP';

export interface RivalStagePersonalityV6 {
  stageId: StageWorldIdV6;
  stageNumber: number;
  championId: string;
  displayName: string;
  titleTag: string;
  signatureArchetypes: readonly BoardDefinitionV6['mechanicArchetype'][];
  // Fair probability bounds (no rubber-band cheating)
  baseAccuracy: number; // 0.56 (Stage 1) -> 0.86 (Stage 10)
  // Tactical weight profile (0.0 .. 1.0)
  weights: {
    chipGreed: number;
    multGreed: number;
    graphCutAggression: number;
    clusterBuild: number;
    ringAlignmentFocus: number;
    innerCorePriority: number;
    casinoRiskAppetite: number;
    trapAwareness: number;
  };
  chainLockChance: number; // 0.0 on Stage 01 -> 0.42 on Stage 05/10
  maxChainLocksPerMatch: number;
  bluffChance: number; // 0.08 .. 0.35
  splitVsStealCooperateRate: number; // For Split-or-Steal final vaults
  bluffTellHint: string; // Crisp observational tell (<= 11 words)
  introQuips: readonly string[]; // <= 14 words each
  claimQuips: readonly string[]; // <= 14 words each
  chainLockQuips: readonly string[]; // <= 14 words each
  bluffQuips: readonly string[]; // <= 14 words each
  missQuips: readonly string[]; // <= 14 words each
}

export interface RivalTelegraphedIntentV6 {
  stageId: StageWorldIdV6;
  championName: string;
  actionKind: RivalActionKindV6;
  displayedTargetNodeId: string | null;
  actualTargetNodeId: string | null;
  chainLockNodeId: string | null;
  isBluffing: boolean;
  bluffTellHint: string | null;
  intentBadgeText: string; // <= 6 crisp words for board HUD
  barkLine: string; // <= 14 words
  projectedBidCash: number;
}

export interface RivalTurnExecutionResultV6 {
  championName: string;
  stageId: StageWorldIdV6;
  actionKind: RivalActionKindV6;
  targetNodeId: string | null;
  chainLockedNodeId: string | null;
  wasBluffRevealed: boolean;
  solvedClue: boolean;
  solveProbabilityUsed: number;
  cashDelta: number;
  ringRotatedIndex: number | null;
  ringRotationDeltaDeg: number;
  barkLine: string;
  actionTag: string;
  nextTelegraphedIntent: RivalTelegraphedIntentV6 | null;
}

export interface RivalTurnOptionsV6 {
  isTitleBout?: boolean;
  playerScrewedRival?: boolean;
  frozenNodeIds?: readonly string[];
  rivalFrozenThisTurn?: boolean;
  chainLocksAlreadyUsed?: number;
  rng?: () => number;
}

// ----------------------------------------------------------------------------
// The 10 Stage Champions (Synced 1:1 with Clause 14-B Writers' Room Cast)
// ----------------------------------------------------------------------------
export const RIVAL_PERSONALITIES_V6: Readonly<Record<StageWorldIdV6, RivalStagePersonalityV6>> = {
  STAGE_01_VAUDEVILLE_PALACE: {
    stageId: 'STAGE_01_VAUDEVILLE_PALACE',
    stageNumber: 1,
    championId: 'rival_01_barnaby',
    displayName: 'Barnaby "Two-Takes" Vance',
    titleTag: '1928 Matinee Showman',
    signatureArchetypes: ['CONCENTRIC_RINGS', 'HEX_TURF_BRIDGE', 'CARNIVAL_SHOOTING_GALLERY'],
    baseAccuracy: 0.56,
    weights: {
      chipGreed: 0.85,
      multGreed: 0.35,
      graphCutAggression: 0.25,
      clusterBuild: 0.3,
      ringAlignmentFocus: 0.4,
      innerCorePriority: 0.35,
      casinoRiskAppetite: 0.65,
      trapAwareness: 0.35,
    },
    chainLockChance: 0.0,
    maxChainLocksPerMatch: 0,
    bluffChance: 0.1,
    splitVsStealCooperateRate: 0.72,
    bluffTellHint: 'Tips his straw boater twice before switching picks.',
    introQuips: [
      'Hit my good side, kid. Sloane promised me two takes.',
      'Broadway lights favor a profile, not a parking-lot rookie.',
    ],
    claimQuips: [
      'Still got it! Somebody tell the balcony to keep clapping.',
      'Clean take, no cue cards. Mostly.',
    ],
    chainLockQuips: ['House rules, kid—don’t blame the headliner.'],
    bluffQuips: ['Misdirection! Classic third-act Vaudeville!'],
    missQuips: [
      'Cut! That bulb buzzed right in my eyeline!',
      'Okay, keep rolling—nobody in the mezzanine heard that.',
    ],
  },

  STAGE_02_GENEVA_CONSERVATORY: {
    stageId: 'STAGE_02_GENEVA_CONSERVATORY',
    stageNumber: 2,
    championId: 'rival_02_sabine',
    displayName: 'Dr. Sabine Vogt',
    titleTag: 'Horological Precisionist',
    signatureArchetypes: ['CONCENTRIC_RINGS', 'BALANCE_SCALE', 'PENDULUM_BRIDGE'],
    baseAccuracy: 0.62,
    weights: {
      chipGreed: 0.5,
      multGreed: 0.72,
      graphCutAggression: 0.4,
      clusterBuild: 0.5,
      ringAlignmentFocus: 0.95,
      innerCorePriority: 0.6,
      casinoRiskAppetite: 0.2,
      trapAwareness: 0.75,
    },
    chainLockChance: 0.14,
    maxChainLocksPerMatch: 1,
    bluffChance: 0.12,
    splitVsStealCooperateRate: 0.65,
    bluffTellHint: 'Taps her pocket chronometer when feinting outer gears.',
    introQuips: [
      'Your timing drifts by four hundred milliseconds. Let us begin.',
      'Every gear on this stage obeys torque, not luck.',
    ],
    claimQuips: [
      'Aligned to the ruby jewel. Exactly on beat.',
      'Precision beats theatre every single broadcast.',
    ],
    chainLockQuips: ['Escapement pinned. Try forcing that gear now.'],
    bluffQuips: ['A calibrated feint. You watched the wrong wheel.'],
    missQuips: [
      'Unacceptable drift. Who greased this main spring?',
      'A half-tooth off. Recalibrating immediately.',
    ],
  },

  STAGE_03_MONTE_CARLO_SALON: {
    stageId: 'STAGE_03_MONTE_CARLO_SALON',
    stageNumber: 3,
    championId: 'rival_03_mireille',
    displayName: 'Countess Mireille de Valois',
    titleTag: 'Riviera High-Roller',
    signatureArchetypes: ['BLACKJACK_21_FELT', 'SHELL_MONTE_BLUFF', 'MINESWEEPER_VAULTS'],
    baseAccuracy: 0.66,
    weights: {
      chipGreed: 0.78,
      multGreed: 0.82,
      graphCutAggression: 0.45,
      clusterBuild: 0.35,
      ringAlignmentFocus: 0.5,
      innerCorePriority: 0.55,
      casinoRiskAppetite: 0.96,
      trapAwareness: 0.62,
    },
    chainLockChance: 0.18,
    maxChainLocksPerMatch: 1,
    bluffChance: 0.34,
    splitVsStealCooperateRate: 0.35,
    bluffTellHint: 'Tilts her champagne coupe whenever her bid is empty.',
    introQuips: [
      'Darling, Meridian’s chips feel so delightfully cheap tonight.',
      'Push your luck, please. I adore watching amateurs bust at twenty-two.',
    ],
    claimQuips: [
      'Twenty-one on velvet. Pour another glass, Julian.',
      'The house rarely loses when I hold the shoe.',
    ],
    chainLockQuips: ['VIP velvet rope—this table is reserved, chéri.'],
    bluffQuips: ['You bit on the decoy chip? Oh, how charming.'],
    missQuips: [
      'Tragic shoe. Frankie, check those cards for fingerprints.',
      'A minor setback. The Riviera forgives bold bets.',
    ],
  },

  STAGE_04_CARTOGRAPHIC_ROTUNDA: {
    stageId: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    stageNumber: 4,
    championId: 'rival_04_alistair',
    displayName: 'Capt. Alistair Finch-Harrow',
    titleTag: 'Meridian Bridge-Cutter',
    signatureArchetypes: ['HEX_TURF_BRIDGE', 'SUBWAY_NETWORK', 'PENDULUM_BRIDGE'],
    baseAccuracy: 0.7,
    weights: {
      chipGreed: 0.45,
      multGreed: 0.55,
      graphCutAggression: 0.95,
      clusterBuild: 0.82,
      ringAlignmentFocus: 0.55,
      innerCorePriority: 0.65,
      casinoRiskAppetite: 0.4,
      trapAwareness: 0.72,
    },
    chainLockChance: 0.24,
    maxChainLocksPerMatch: 1,
    bluffChance: 0.18,
    splitVsStealCooperateRate: 0.52,
    bluffTellHint: 'Squints north on the brass sextant before swinging east.',
    introQuips: [
      'Control the narrows and the whole archipelago surrenders.',
      'Sloane bought me a brass globe; I intend to keep it.',
    ],
    claimQuips: [
      'Channel sealed. Find another crossing, sailor.',
      'Two bridges linked—my supply line holds firm.',
    ],
    chainLockQuips: ['Harbor chain raised! Good luck getting past that chokepoint.'],
    bluffQuips: ['False bearing! Never trust a rival’s chart.'],
    missQuips: [
      'Magnetic anomaly on this deck! Who moved the compass?',
      'Hit a shoal. Re-plotting course.',
    ],
  },

  STAGE_05_ANALOG_BUNKER_1969: {
    stageId: 'STAGE_05_ANALOG_BUNKER_1969',
    stageNumber: 5,
    championId: 'rival_05_walter',
    displayName: 'Walter "Redline" Kowalski',
    titleTag: '1969 Signal Saboteur',
    signatureArchetypes: ['LASER_MIRROR_GRID', 'SONAR_RADAR_SWEEP', 'CONVEYOR_FACTORY'],
    baseAccuracy: 0.73,
    weights: {
      chipGreed: 0.52,
      multGreed: 0.68,
      graphCutAggression: 0.86,
      clusterBuild: 0.58,
      ringAlignmentFocus: 0.68,
      innerCorePriority: 0.72,
      casinoRiskAppetite: 0.45,
      trapAwareness: 0.88,
    },
    chainLockChance: 0.42,
    maxChainLocksPerMatch: 2,
    bluffChance: 0.28,
    splitVsStealCooperateRate: 0.28,
    bluffTellHint: 'Flicks the amber Nixie breaker twice on a fake target.',
    introQuips: [
      'Signal locked. I’ve got two iron chains with your name stamped.',
      'Nobody clears Floor Five without burning a breaker.',
    ],
    claimQuips: [
      'Relay hijacked. Watch your phosphor screen go dark.',
      'Clean intercept. Meridian pays overtime for results.',
    ],
    chainLockQuips: ['Bolt thrown! Try chewing through cold-rolled bunker steel.'],
    bluffQuips: ['Ghost blip on your radar—fell for it hook and line.'],
    missQuips: [
      'Static burst! Frankie’s messing with my patch cables again!',
      'Bad telemetry. Re-zeroing the scope.',
    ],
  },

  STAGE_06_KYOTO_LACQUER_PAVILION: {
    stageId: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    stageNumber: 6,
    championId: 'rival_06_kenzo',
    displayName: 'Kenzo Taniguchi',
    titleTag: 'Kintsugi Web Tactician',
    signatureArchetypes: ['HEX_TURF_BRIDGE', 'DOMINO_CHAIN', 'STEPPED_PYRAMID'],
    baseAccuracy: 0.76,
    weights: {
      chipGreed: 0.48,
      multGreed: 0.76,
      graphCutAggression: 0.78,
      clusterBuild: 0.96,
      ringAlignmentFocus: 0.62,
      innerCorePriority: 0.7,
      casinoRiskAppetite: 0.3,
      trapAwareness: 0.85,
    },
    chainLockChance: 0.28,
    maxChainLocksPerMatch: 1,
    bluffChance: 0.22,
    splitVsStealCooperateRate: 0.58,
    bluffTellHint: 'Folds his fan silently when setting an indirect stone.',
    introQuips: [
      'You chase bright tiles. I surround the quiet intersections.',
      'One fracture in your cluster, and the lacquer belongs to me.',
    ],
    claimQuips: [
      'Four stones joined. Feel the board tighten.',
      'Patience pays compound interest on Turn Five.',
    ],
    chainLockQuips: ['A single golden seam seals that intersection.'],
    bluffQuips: ['You guarded the blossom and left the root bare.'],
    missQuips: [
      'A hasty brush stroke. Even masters crack the glaze.',
      'Well defended. I respect steady hands.',
    ],
  },

  STAGE_07_CARNIVAL_CURIOSITIES: {
    stageId: 'STAGE_07_CARNIVAL_CURIOSITIES',
    stageNumber: 7,
    championId: 'rival_07_delilah',
    displayName: 'Delilah "Nickel-Slot" Kerr',
    titleTag: 'Midnight Pier Hustler',
    signatureArchetypes: ['PINBALL_DROP', 'FERRIS_WHEEL', 'CARNIVAL_SHOOTING_GALLERY'],
    baseAccuracy: 0.79,
    weights: {
      chipGreed: 0.82,
      multGreed: 0.78,
      graphCutAggression: 0.65,
      clusterBuild: 0.52,
      ringAlignmentFocus: 0.65,
      innerCorePriority: 0.55,
      casinoRiskAppetite: 0.92,
      trapAwareness: 0.78,
    },
    chainLockChance: 0.3,
    maxChainLocksPerMatch: 2,
    bluffChance: 0.35,
    splitVsStealCooperateRate: 0.25,
    bluffTellHint: 'Spins a copper token on her knuckles before a switch.',
    introQuips: [
      'Step right up, mark! Every bumper on this pier tilts my way.',
      'Sloane thinks this stage is condemned—I call it rent-free.',
    ],
    claimQuips: [
      'Ding-ding-ding! Keep the plush bear, I’ll take your multiplier.',
      'Bounced off three brass bumpers straight into my pocket!',
    ],
    chainLockQuips: ['Padlocked the prize booth! Better bring a Foil card.'],
    bluffQuips: ['Looked at the Ferris wheel while I picked your pocket!'],
    missQuips: [
      'Hey! Somebody leveled the tilt sensor on my pinball deck!',
      'Oof—gutter ball. Next token’s mine.',
    ],
  },

  STAGE_08_SUNKEN_BATHYSPHERE: {
    stageId: 'STAGE_08_SUNKEN_BATHYSPHERE',
    stageNumber: 8,
    championId: 'rival_08_henrik',
    displayName: 'Dr. Henrik Lindholm',
    titleTag: 'Abyssal Pressure Tactician',
    signatureArchetypes: ['SONAR_RADAR_SWEEP', 'ELEVATOR_SHAFTS', 'MINESWEEPER_VAULTS'],
    baseAccuracy: 0.81,
    weights: {
      chipGreed: 0.58,
      multGreed: 0.8,
      graphCutAggression: 0.8,
      clusterBuild: 0.76,
      ringAlignmentFocus: 0.7,
      innerCorePriority: 0.98,
      casinoRiskAppetite: 0.38,
      trapAwareness: 0.92,
    },
    chainLockChance: 0.34,
    maxChainLocksPerMatch: 2,
    bluffChance: 0.2,
    splitVsStealCooperateRate: 0.44,
    bluffTellHint: 'Checks the brass depth gauge twice when feinting shallow.',
    introQuips: [
      'Outer rings flood first. Smart divers claim the bulkhead core.',
      'At four thousand meters, panic burns oxygen fast.',
    ],
    claimQuips: [
      'Inner hatch secured. Let the tide take the perimeter.',
      'Zero bubbles wasted. Pressure favors discipline.',
    ],
    chainLockQuips: ['Bulkhead dogged shut. Go swim for another node.'],
    bluffQuips: ['Sonar echo. You chased a shadow in the trench.'],
    missQuips: [
      'Hull groan threw off my readout. Stabilizing.',
      'Minor valve leak. Still well ahead of crush depth.',
    ],
  },

  STAGE_09_ASTRAL_OBSERVATORY: {
    stageId: 'STAGE_09_ASTRAL_OBSERVATORY',
    stageNumber: 9,
    championId: 'rival_09_nadia',
    displayName: 'Nadia Okafor-Voss',
    titleTag: 'Optical & Quantum Sniper',
    signatureArchetypes: ['ASTRAL_CONSTELLATION', 'PRISM_SPLITTER', 'LASER_MIRROR_GRID'],
    baseAccuracy: 0.84,
    weights: {
      chipGreed: 0.62,
      multGreed: 0.96,
      graphCutAggression: 0.84,
      clusterBuild: 0.72,
      ringAlignmentFocus: 0.92,
      innerCorePriority: 0.82,
      casinoRiskAppetite: 0.55,
      trapAwareness: 0.94,
    },
    chainLockChance: 0.35,
    maxChainLocksPerMatch: 2,
    bluffChance: 0.26,
    splitVsStealCooperateRate: 0.4,
    bluffTellHint: 'Tilts the brass prism lens when masking an entangled flip.',
    introQuips: [
      'Why claim one star when optical coupling hands me two?',
      'Your multiplier curve is cute. Watch what refraction does.',
    ],
    claimQuips: [
      'Twin-linked flip! That prism practically sang.',
      'Refracted straight through your lead.',
    ],
    chainLockQuips: ['Aperture shutter closed on your favorite multiplier.'],
    bluffQuips: ['Wave-function collapsed somewhere else. Surprise.'],
    missQuips: [
      'Atmospheric shimmer! Close the north dome louver!',
      'Parallax error—won’t happen twice under this aurora.',
    ],
  },

  STAGE_10_SOVEREIGN_COLOSSEUM: {
    stageId: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    stageNumber: 10,
    championId: 'rival_10_arthur',
    displayName: 'Arthur "The Archivist" Pendelton',
    titleTag: 'Meridian $900k Retainer Boss',
    signatureArchetypes: ['STEPPED_PYRAMID', 'SPLIT_OR_STEAL_ARENA', 'CONCENTRIC_RINGS'],
    baseAccuracy: 0.86,
    weights: {
      chipGreed: 0.72,
      multGreed: 0.94,
      graphCutAggression: 0.94,
      clusterBuild: 0.88,
      ringAlignmentFocus: 0.88,
      innerCorePriority: 0.92,
      casinoRiskAppetite: 0.64,
      trapAwareness: 0.96,
    },
    chainLockChance: 0.38,
    maxChainLocksPerMatch: 2,
    bluffChance: 0.3,
    splitVsStealCooperateRate: 0.32,
    bluffTellHint: 'Polishes his gold spectacles before locking an Apex bluff.',
    introQuips: [
      'Thirty-two years on retainer to keep Clause 14-B unpaid. Sit down.',
      'I memorized the vault index before you found the parking garage.',
    ],
    claimQuips: [
      'Meridian’s ten million remains comfortably in escrow.',
      'Textbook apex control. Sloane can breathe again.',
    ],
    chainLockQuips: ['Archival seal applied. Earn your way to the summit.'],
    bluffQuips: ['Did you honestly think I’d telegraph my final vault?'],
    missQuips: [
      'Impossible—that citation was revised in ninety-eight!',
      'Hah! Fine. Make me earn my retainer.',
    ],
  },
};

export function getRivalPersonalityV6(stageId: StageWorldIdV6): RivalStagePersonalityV6 {
  return RIVAL_PERSONALITIES_V6[stageId] ?? RIVAL_PERSONALITIES_V6.STAGE_01_VAUDEVILLE_PALACE;
}

// ----------------------------------------------------------------------------
// Graph, Ring & Casino Tactical Evaluators
// ----------------------------------------------------------------------------
interface NodeGraphMetrics {
  degree: number;
  adjacentPlayerCount: number;
  adjacentRivalCount: number;
  shortestBridgeBonus: number;
  encirclementBonus: number;
}

function computeGraphMetrics(nodes: readonly BoardNodeV6[]): Map<string, NodeGraphMetrics> {
  const byId = new Map<string, BoardNodeV6>();
  for (const n of nodes) byId.set(n.nodeId, n);

  const metrics = new Map<string, NodeGraphMetrics>();

  // BFS distance from existing RIVAL nodes to score shortest bridge expansions
  const distFromRival = new Map<string, number>();
  const queue: string[] = [];
  for (const n of nodes) {
    if (n.owner === 'RIVAL') {
      distFromRival.set(n.nodeId, 0);
      queue.push(n.nodeId);
    }
  }
  while (queue.length > 0) {
    const currId = queue.shift()!;
    const currDist = distFromRival.get(currId) ?? 0;
    const currNode = byId.get(currId);
    if (!currNode) continue;
    for (const nbId of currNode.neighbors) {
      if (!distFromRival.has(nbId)) {
        distFromRival.set(nbId, currDist + 1);
        queue.push(nbId);
      }
    }
  }

  for (const n of nodes) {
    let adjacentPlayerCount = 0;
    let adjacentRivalCount = 0;
    for (const nbId of n.neighbors) {
      const nb = byId.get(nbId);
      if (!nb) continue;
      if (nb.owner === 'PLAYER') adjacentPlayerCount += 1;
      if (nb.owner === 'RIVAL') adjacentRivalCount += 1;
    }

    const dRival = distFromRival.get(n.nodeId);
    const shortestBridgeBonus = dRival === 1 ? 1.0 : dRival === 2 ? 0.55 : 0.15;

    // Bonus for choking a node that touches BOTH player and rival (contested bridge!)
    const encirclementBonus =
      adjacentPlayerCount > 0 && adjacentRivalCount > 0
        ? 1.0
        : adjacentPlayerCount >= 2
          ? 0.85
          : adjacentRivalCount >= 2
            ? 0.7
            : 0.0;

    metrics.set(n.nodeId, {
      degree: n.neighbors.length,
      adjacentPlayerCount,
      adjacentRivalCount,
      shortestBridgeBonus,
      encirclementBonus,
    });
  }

  return metrics;
}

function estimateBlackjackHandValue(nodes: readonly BoardNodeV6[]): number {
  let sum = 0;
  for (const n of nodes) {
    if (n.owner === 'RIVAL') {
      sum += Math.max(1, Math.min(11, Math.round(n.baseChips / 50)));
    }
  }
  return sum;
}

function pickLine(lines: readonly string[], rng: () => number): string {
  if (lines.length === 0) return '';
  return lines[Math.floor(Math.max(0, Math.min(0.999999, rng())) * lines.length)];
}

// ----------------------------------------------------------------------------
// RivalStageAIV6 Class
// ----------------------------------------------------------------------------
export class RivalStageAIV6 {
  private readonly stageId: StageWorldIdV6;
  private readonly personality: RivalStagePersonalityV6;
  private activeIntent: RivalTelegraphedIntentV6 | null = null;
  private chainLocksUsed = 0;

  constructor(stageId: StageWorldIdV6) {
    this.stageId = stageId;
    this.personality = getRivalPersonalityV6(stageId);
  }

  public getPersonality(): Readonly<RivalStagePersonalityV6> {
    return this.personality;
  }

  public getActiveIntent(): Readonly<RivalTelegraphedIntentV6> | null {
    return this.activeIntent;
  }

  public resetMatchCounters(): void {
    this.activeIntent = null;
    this.chainLocksUsed = 0;
  }

  /**
   * Scores every claimable node using the Stage Champion's personality profile,
   * board mechanic archetype (Rotary/Hex-Bridge/Casino-21/Pyramid/Flood/Quantum),
   * and live Twist mutation!
   */
  public scoreCandidateNodes(
    board: Readonly<BoardRuntimeStateV6>,
    frozenNodeIds: readonly string[] = [],
  ): Array<{ node: BoardNodeV6; score: number }> {
    const frozen = new Set(frozenNodeIds);
    const openNodes = board.nodes.filter((n) => n.owner === 'NONE' && !frozen.has(n.nodeId));
    if (openNodes.length === 0) return [];

    const p = this.personality;
    const w = p.weights;
    const graphMetrics = computeGraphMetrics(board.nodes);
    const alignedSet = new Set(board.alignedNodeIds);
    const archetype = board.definition.mechanicArchetype;
    const twist: BoardTwistMutationIdV6 = board.activeTwist;
    const currentBlackjack = archetype === 'BLACKJACK_21_FELT' ? estimateBlackjackHandValue(board.nodes) : 0;

    const maxChips = Math.max(100, ...openNodes.map((n) => n.baseChips));
    const maxTier = Math.max(1, ...openNodes.map((n) => n.tierIndex ?? 0));

    const scored = openNodes.map((node) => {
      const gm = graphMetrics.get(node.nodeId);
      let score = 0;

      // 1. Base economic value (Chips + Mult)
      score += (node.baseChips / maxChips) * 32 * w.chipGreed;
      score += node.multBonus * 18 * w.multGreed;

      // 2. Graph / Bridge pathfinding & encirclement
      if (gm) {
        score += gm.adjacentPlayerCount * 15 * w.graphCutAggression;
        score += gm.adjacentRivalCount * 13 * w.clusterBuild;
        score += gm.shortestBridgeBonus * 14 * w.clusterBuild;
        score += gm.encirclementBonus * 18 * ((w.graphCutAggression + w.clusterBuild) * 0.5);
        score += Math.min(4, gm.degree) * 2.5;
      }

      // 3. Concentric Ring / Alignment beam bonus (x3 synergy!)
      if (alignedSet.has(node.nodeId)) {
        score += 34 * w.ringAlignmentFocus;
      }
      if (node.ringIndex === 0) {
        score += 18 * w.innerCorePriority;
      }
      if (node.tierIndex !== undefined && maxTier > 0) {
        score += (node.tierIndex / maxTier) * 22 * w.innerCorePriority;
      }

      // 4. Casino Push-Luck & Blackjack 21 evaluation
      if (archetype === 'BLACKJACK_21_FELT') {
        const cardVal = Math.max(1, Math.min(11, Math.round(node.baseChips / 50)));
        const projected = currentBlackjack + cardVal;
        if (projected === 21) {
          score += 55 * (0.6 + w.casinoRiskAppetite * 0.6);
        } else if (projected > 21) {
          // Bust risk! Cautious champions avoid busting; gamblers tolerate small risk if behind
          score -= 48 * (1.2 - w.casinoRiskAppetite * 0.5);
        } else if (projected >= 17) {
          score += 18 * w.casinoRiskAppetite;
        }
      }

      // 5. Mystery Auction / Quantum Mirror / Rising Flood twist adjustments
      if (node.isMysteryAuction || twist === 'HOST_BLIND_AUCTION') {
        score += 22 * w.casinoRiskAppetite;
      }
      if (twist === 'RISING_FLOOD_STAGE' && (node.ringIndex === 0 || (node.tierIndex ?? 0) >= 1)) {
        score += 24 * w.innerCorePriority;
      }
      if (
        (twist === 'MIRROR_TWIN_LINK' ||
          twist === 'HIGH_VOLTAGE_CHAIN' ||
          archetype === 'ASTRAL_CONSTELLATION' ||
          archetype === 'PRISM_SPLITTER') &&
        gm &&
        gm.degree >= 2
      ) {
        score += 20 * w.multGreed;
      }

      // 6. Risk & Chain Awareness (smart champions avoid disguised traps & iron chains unless rewarding)
      if (node.isDoubleAgentMole) {
        score -= 42 * w.trapAwareness;
      }
      if (node.hasTrapFuse) {
        score -= 22 * w.trapAwareness;
      }
      if (node.lockedChains > 0) {
        score -= node.lockedChains * 14 * (1.1 - w.graphCutAggression * 0.4);
      }

      // Slight penalty for extreme difficulty offset on early-stage champions
      score -= Math.max(0, node.difficultyOffset) * (6 - p.stageNumber * 0.4);

      return { node, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  /**
   * Slay-the-Spire style pre-turn telegraph: announces what the Stage Champion
   * threatens next so the player can race them, burn a Foil Card, or spot a Bluff Tell!
   */
  public planNextIntent(
    board: Readonly<BoardRuntimeStateV6>,
    opts: RivalTurnOptionsV6 = {},
  ): RivalTelegraphedIntentV6 {
    const rng = opts.rng ?? Math.random;
    const p = this.personality;
    const scored = this.scoreCandidateNodes(board, opts.frozenNodeIds);

    if (opts.rivalFrozenThisTurn || scored.length === 0) {
      const frozenIntent: RivalTelegraphedIntentV6 = {
        stageId: this.stageId,
        championName: p.displayName,
        actionKind: 'FROZEN_SKIP',
        displayedTargetNodeId: null,
        actualTargetNodeId: null,
        chainLockNodeId: null,
        isBluffing: false,
        bluffTellHint: null,
        intentBadgeText: 'LOCKED OUT THIS TURN',
        barkLine: 'Frozen on the buzzer—enjoy your free swing.',
        projectedBidCash: 0,
      };
      this.activeIntent = frozenIntent;
      return frozenIntent;
    }

    const bestTarget = scored[0].node;
    const secondTarget = scored.length > 1 ? scored[1].node : bestTarget;

    // Decide whether to arm a strategic Iron Chain-Lock on a high-value player-adjacent node
    const usedLocks = opts.chainLocksAlreadyUsed ?? this.chainLocksUsed;
    const canChainLock =
      usedLocks < p.maxChainLocksPerMatch &&
      (opts.isTitleBout || p.stageNumber >= 4) &&
      board.turnNumber >= 2;

    let chainLockNodeId: string | null = null;
    if (canChainLock && rng() < p.chainLockChance) {
      const graphMetrics = computeGraphMetrics(board.nodes);
      const lockCandidates = scored
        .map((s) => s.node)
        .filter((n) => n.nodeId !== bestTarget.nodeId && n.lockedChains < 2)
        .sort((a, b) => {
          const aAdj = graphMetrics.get(a.nodeId)?.adjacentPlayerCount ?? 0;
          const bAdj = graphMetrics.get(b.nodeId)?.adjacentPlayerCount ?? 0;
          return bAdj * 20 + b.multBonus * 10 - (aAdj * 20 + a.multBonus * 10);
        });
      if (lockCandidates.length > 0) {
        chainLockNodeId = lockCandidates[0].nodeId;
      }
    }

    // Decide whether to telegraph a Bluff Bait (displayed decoy != actual target)
    const canBluff = scored.length >= 2 && (opts.isTitleBout || p.stageNumber >= 3);
    const isBluffing = canBluff && rng() < p.bluffChance;

    let actionKind: RivalActionKindV6 = 'CLAIM_NODE';
    let displayedTargetNodeId = bestTarget.nodeId;
    let actualTargetNodeId = bestTarget.nodeId;
    let intentBadgeText = `EYEING ${bestTarget.categoryLabel.toUpperCase()}`;
    let barkLine = pickLine(p.introQuips, rng);

    if (board.activeTwist === 'HOST_BLIND_AUCTION' || bestTarget.isMysteryAuction) {
      actionKind = 'AUCTION_BID';
      intentBadgeText = 'BIDDING MYSTERY VAULT';
    } else if (chainLockNodeId) {
      actionKind = 'CHAIN_LOCK';
      intentBadgeText = `CHAIN-LOCKING + CLAIM`;
      barkLine = pickLine(p.chainLockQuips, rng);
    } else if (
      board.definition.mechanicArchetype === 'CONCENTRIC_RINGS' &&
      board.alignedNodeIds.length > 0 &&
      !board.alignedNodeIds.includes(bestTarget.nodeId) &&
      p.weights.ringAlignmentFocus >= 0.7 &&
      rng() < 0.35
    ) {
      actionKind = 'RING_DISRUPT';
      intentBadgeText = 'SPINNING GEAR RING';
    } else if (isBluffing) {
      actionKind = 'BLUFF_BAIT';
      displayedTargetNodeId = secondTarget.nodeId;
      actualTargetNodeId = bestTarget.nodeId;
      intentBadgeText = `EYEING ${secondTarget.categoryLabel.toUpperCase()}?`;
    }

    const projectedBidCash = Math.round(
      Math.min(
        Math.max(150, board.rivalTotalCash * (0.18 + p.weights.casinoRiskAppetite * 0.22)),
        Math.max(200, bestTarget.baseChips * (1 + bestTarget.multBonus)),
      ),
    );

    const intent: RivalTelegraphedIntentV6 = {
      stageId: this.stageId,
      championName: p.displayName,
      actionKind,
      displayedTargetNodeId,
      actualTargetNodeId,
      chainLockNodeId,
      isBluffing,
      bluffTellHint: isBluffing ? p.bluffTellHint : null,
      intentBadgeText,
      barkLine,
      projectedBidCash,
    };

    this.activeIntent = intent;
    return intent;
  }

  /**
   * Executes the Rival's turn cleanly on `board`, applying fair probability math,
   * strategic chain-locking, rotary disruption, and immediately planning the NEXT
   * telegraphed intent for the player's upcoming turn!
   */
  public executeTurn(
    board: BoardRuntimeStateV6,
    opts: RivalTurnOptionsV6 = {},
  ): RivalTurnExecutionResultV6 {
    const rng = opts.rng ?? Math.random;
    const p = this.personality;
    const frozen = new Set(opts.frozenNodeIds ?? []);

    if (opts.rivalFrozenThisTurn) {
      const nextIntent = this.planNextIntent(board, { ...opts, rivalFrozenThisTurn: false });
      return {
        championName: p.displayName,
        stageId: this.stageId,
        actionKind: 'FROZEN_SKIP',
        targetNodeId: null,
        chainLockedNodeId: null,
        wasBluffRevealed: false,
        solvedClue: false,
        solveProbabilityUsed: 0,
        cashDelta: 0,
        ringRotatedIndex: null,
        ringRotationDeltaDeg: 0,
        barkLine: 'Frozen out—nice Foil play. Enjoy it while it lasts.',
        actionTag: 'rival_frozen_skip',
        nextTelegraphedIntent: nextIntent,
      };
    }

    // Re-validate planned intent in case the player already stole the Rival's target!
    const intent = this.activeIntent ?? this.planNextIntent(board, opts);
    let targetNode =
      intent.actualTargetNodeId
        ? board.nodes.find(
            (n) =>
              n.nodeId === intent.actualTargetNodeId &&
              n.owner === 'NONE' &&
              !frozen.has(n.nodeId),
          )
        : undefined;

    if (!targetNode) {
      const rescored = this.scoreCandidateNodes(board, opts.frozenNodeIds);
      targetNode = rescored[0]?.node;
    }

    if (!targetNode) {
      return {
        championName: p.displayName,
        stageId: this.stageId,
        actionKind: 'FROZEN_SKIP',
        targetNodeId: null,
        chainLockedNodeId: null,
        wasBluffRevealed: false,
        solvedClue: false,
        solveProbabilityUsed: 0,
        cashDelta: 0,
        ringRotatedIndex: null,
        ringRotationDeltaDeg: 0,
        barkLine: 'No open nodes left—let the scoreboard settle this.',
        actionTag: 'rival_no_moves',
        nextTelegraphedIntent: null,
      };
    }

    // Optional Ring Disruption for horology/rotary boards
    let ringRotatedIndex: number | null = null;
    let ringRotationDeltaDeg = 0;
    if (
      intent.actionKind === 'RING_DISRUPT' &&
      board.definition.mechanicArchetype === 'CONCENTRIC_RINGS'
    ) {
      ringRotatedIndex = Math.floor(rng() * 3);
      ringRotationDeltaDeg = rng() < 0.5 ? 60 : -60;
      board.ringRotationsDeg[ringRotatedIndex] =
        (board.ringRotationsDeg[ringRotatedIndex] + ringRotationDeltaDeg + 360) % 360;
    }

    // Optional Iron Chain-Lock placement on a contested node
    let chainLockedNodeId: string | null = null;
    if (intent.chainLockNodeId && this.chainLocksUsed < p.maxChainLocksPerMatch) {
      const lockTarget = board.nodes.find(
        (n) => n.nodeId === intent.chainLockNodeId && n.owner === 'NONE' && n.lockedChains < 2,
      );
      if (lockTarget) {
        lockTarget.lockedChains += 1;
        chainLockedNodeId = lockTarget.nodeId;
        this.chainLocksUsed += 1;
      }
    }

    // Strictly fair probability calculation (zero rubber-banding)
    let prob = p.baseAccuracy;
    if (opts.isTitleBout) prob += 0.03;
    prob -= Math.max(0, targetNode.difficultyOffset) * 0.04;
    prob -= targetNode.lockedChains * 0.06;
    if (opts.playerScrewedRival) prob -= 0.26;
    if (targetNode.isDoubleAgentMole) prob -= 0.14;
    const solveProbabilityUsed = Math.max(0.32, Math.min(0.88, Number(prob.toFixed(3))));

    const solvedClue = rng() < solveProbabilityUsed;
    let cashDelta = 0;
    let barkLine = '';
    let actionTag = 'rival_missed_clue';

    if (solvedClue) {
      targetNode.owner = 'RIVAL';
      targetNode.lockedChains = 0;
      const alignedBonus = board.alignedNodeIds.includes(targetNode.nodeId) ? 1.5 : 1.0;
      const multFactor = Math.max(1, 1 + targetNode.multBonus * 0.45);
      cashDelta = Math.round(targetNode.baseChips * multFactor * alignedBonus);
      board.rivalTotalCash += cashDelta;

      if (intent.isBluffing) {
        barkLine = pickLine(p.bluffQuips, rng);
        actionTag = 'rival_bluff_claim';
      } else if (chainLockedNodeId) {
        barkLine = pickLine(p.chainLockQuips, rng);
        actionTag = 'rival_chain_lock_claim';
      } else {
        barkLine = pickLine(p.claimQuips, rng);
        actionTag = 'rival_node_claimed';
      }
    } else {
      barkLine = pickLine(p.missQuips, rng);
      actionTag = opts.playerScrewedRival ? 'rival_screwed_miss' : 'rival_missed_clue';
    }

    const nextTelegraphedIntent = this.planNextIntent(board, {
      ...opts,
      playerScrewedRival: false,
      chainLocksAlreadyUsed: this.chainLocksUsed,
    });

    return {
      championName: p.displayName,
      stageId: this.stageId,
      actionKind: intent.actionKind,
      targetNodeId: targetNode.nodeId,
      chainLockedNodeId,
      wasBluffRevealed: intent.isBluffing && solvedClue,
      solvedClue,
      solveProbabilityUsed,
      cashDelta,
      ringRotatedIndex,
      ringRotationDeltaDeg,
      barkLine,
      actionTag,
      nextTelegraphedIntent,
    };
  }

  /**
   * Game-theoretic Split-or-Steal choice for Stage 10 / Split-or-Steal Vault twists.
   */
  public decideSplitOrSteal(
    playerCash: number,
    rivalCash: number,
    rng: () => number = Math.random,
  ): 'SPLIT' | 'STEAL' {
    let cooperateProb = this.personality.splitVsStealCooperateRate;
    // Trailing rivals take slightly sharper calculated steals, still fair
    if (rivalCash < playerCash) {
      cooperateProb -= 0.14;
    }
    return rng() < Math.max(0.12, Math.min(0.85, cooperateProb)) ? 'SPLIT' : 'STEAL';
  }
}
