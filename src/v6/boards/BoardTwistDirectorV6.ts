// ============================================================================
// WORLD'S SMARTEST v6.0 — Live Mid-Match Board Twist & Foil Counter-Play Engine
// Implements ALL 16 BoardTwistMutationIdV6 live stage mutations + Halftime
// Stage-Siren choreography, Rival Screw counter-plays, Blind Auctions,
// Golden-Balls Split-or-Steal Vault showdowns, all 9 FoilTrickCardV6 effects,
// and a strict mathematical Zero-Soft-Lock guarantee on every turn.
// ============================================================================

import type {
  BoardNodeV6,
  BoardRuntimeStateV6,
  BoardTwistMutationIdV6,
  FoilTrickCardV6,
  FoleySfxIdV6,
} from '../contracts_v6';
import {
  DOMAIN_LABELS_V6,
  getBoardBlueprintB,
} from './BoardCatalog051To100';

// ----------------------------------------------------------------------------
// 1. Canonical Specification Table for All 16 Live Twist Mutations (+ NONE)
// ----------------------------------------------------------------------------

export interface TwistMutationSpecV6 {
  readonly twistId: BoardTwistMutationIdV6;
  readonly title: string;
  readonly stageCallout: string;
  readonly rulesSummary: string;
  readonly primarySfx: FoleySfxIdV6;
  readonly accentHex: number;
  readonly intensityTier: 1 | 2 | 3;
  readonly counterFoilKinds: readonly FoilTrickCardV6['effectKind'][];
  readonly hasPhysical3DTell: boolean;
}

export const TWIST_MUTATION_SPECS_V6: Readonly<Record<BoardTwistMutationIdV6, TwistMutationSpecV6>> = {
  NONE: {
    twistId: 'NONE',
    title: 'Pure Stage Rules',
    stageCallout: 'CLEAN STAGE — NO ACTIVE MUTATION',
    rulesSummary: 'Standard contraption geometry with pure trivia momentum.',
    primarySfx: 'ui_brass_tap',
    accentHex: 0xd9a441,
    intensityTier: 1,
    counterFoilKinds: ['DOUBLE_MULT', 'FREEZE_NODE'],
    hasPhysical3DTell: false,
  },
  BLACKOUT_SPOTLIGHT: {
    twistId: 'BLACKOUT_SPOTLIGHT',
    title: 'Blackout Spotlight Heist',
    stageCallout: 'LIGHTS OUT! SWEEP YOUR SPOTLIGHT CONE!',
    rulesSummary: 'House lights cut; sweep the movable 3D Fresnel cone to reveal and claim hidden vaults.',
    primarySfx: 'optical_beam_lock',
    accentHex: 0xffd166,
    intensityTier: 2,
    counterFoilKinds: ['ROTATE_RING_FREE', 'REVEAL_MOLE', 'FREEZE_NODE'],
    hasPhysical3DTell: true,
  },
  GRAVITY_INVERSION: {
    twistId: 'GRAVITY_INVERSION',
    title: 'Gravity Inversion',
    stageCallout: 'GRAVITY FLIPPED! LOW TILES BECOME APEX!',
    rulesSummary: 'The 3D contraption rotates 180 degrees upside down, inverting low-tier stones into high-value Apex Vaults.',
    primarySfx: 'twist_siren_chime',
    accentHex: 0xd62828,
    intensityTier: 3,
    counterFoilKinds: ['DOUBLE_MULT', 'FREEZE_NODE', 'SHATTER_CHAINS'],
    hasPhysical3DTell: true,
  },
  HOST_BLIND_AUCTION: {
    twistId: 'HOST_BLIND_AUCTION',
    title: "Host's Blind Auction",
    stageCallout: 'VELVET CLOCHE DROP — PLACE SECRET BIDS!',
    rulesSummary: 'Commit hidden chip bids against the rival for x2 Mystery Cloche nodes, or bait them into rigged decoys.',
    primarySfx: 'chip_stack_riffle',
    accentHex: 0xc1121f,
    intensityTier: 2,
    counterFoilKinds: ['STEAL_RIVAL_POT', 'SCREW_RIVAL', 'DOUBLE_MULT'],
    hasPhysical3DTell: true,
  },
  CHAIN_FUSE_DETONATION: {
    twistId: 'CHAIN_FUSE_DETONATION',
    title: 'Chain-Fuse Detonation',
    stageCallout: 'FUSE LIT! DEFUSE BEFORE CHAIN BLAST!',
    rulesSummary: 'Sparking 2-turn fuses crawl across tiles: answer to defuse for +250 & unlock chains, or blast locks neighbors.',
    primarySfx: 'nixie_spark_crackle',
    accentHex: 0xf77f00,
    intensityTier: 3,
    counterFoilKinds: ['DEFUSE_ONE_WIRE', 'SHATTER_CHAINS', 'FREEZE_NODE'],
    hasPhysical3DTell: true,
  },
  MIRROR_TWIN_LINK: {
    twistId: 'MIRROR_TWIN_LINK',
    title: 'Mirror-Twin Entanglement',
    stageCallout: 'QUANTUM LINK! CLAIM ONE, FLIP ITS TWIN!',
    rulesSummary: 'Glowing conduits bind twin nodes: claiming Node A instantaneously flips its entangled partner A-prime.',
    primarySfx: 'crystal_hex_claim',
    accentHex: 0x00bbf9,
    intensityTier: 2,
    counterFoilKinds: ['FREEZE_NODE', 'DOUBLE_MULT', 'ROTATE_RING_FREE'],
    hasPhysical3DTell: true,
  },
  RISING_FLOOD_STAGE: {
    twistId: 'RISING_FLOOD_STAGE',
    title: 'Rising Flood Stage',
    stageCallout: 'FLOODGATES OPEN! RACE TO HIGH GROUND!',
    rulesSummary: 'Every 2 turns the translucent water plane rises, submerging outer/lower rings while boosting dry summit payouts.',
    primarySfx: 'twist_siren_chime',
    accentHex: 0x00b4d8,
    intensityTier: 3,
    counterFoilKinds: ['SHATTER_CHAINS', 'FREEZE_NODE', 'DOUBLE_MULT'],
    hasPhysical3DTell: true,
  },
  DOUBLE_AGENT_MOLE: {
    twistId: 'DOUBLE_AGENT_MOLE',
    title: 'Double-Agent Mole',
    stageCallout: 'TWO RIVAL MOLES HIDDEN — SPOT THE WOBBLE!',
    rulesSummary: 'Two tempting high-value gems are rival traps with subtle 3D physical wobble tells; unmask with Reveal-Mole for +300!',
    primarySfx: 'crowd_collective_gasp',
    accentHex: 0xef476f,
    intensityTier: 3,
    counterFoilKinds: ['REVEAL_MOLE', 'SCREW_RIVAL', 'DEFUSE_ONE_WIRE'],
    hasPhysical3DTell: true,
  },
  SPLIT_OR_STEAL_VAULT: {
    twistId: 'SPLIT_OR_STEAL_VAULT',
    title: 'Split-or-Steal Vault',
    stageCallout: 'GOLDEN SPHERES ARMED — SPLIT OR STEAL!',
    rulesSummary: 'Every rim claim feeds the central Golden Pot; entering the Vault triggers a simultaneous SPLIT vs STEAL bluff!',
    primarySfx: 'vault_heavy_unlock',
    accentHex: 0xf5c542,
    intensityTier: 3,
    counterFoilKinds: ['STEAL_RIVAL_POT', 'SCREW_RIVAL', 'DOUBLE_MULT'],
    hasPhysical3DTell: true,
  },
  MAGNETIC_REPULSOR: {
    twistId: 'MAGNETIC_REPULSOR',
    title: 'Magnetic Repulsor Pulse',
    stageCallout: 'POLARITY FLIP! CHIPS SLING TO THE RIM!',
    rulesSummary: 'The central dipole magnet flips each claim, slinging bonus chips to perimeter nodes and repelling rival locks.',
    primarySfx: 'brass_gear_detent',
    accentHex: 0x3a86ff,
    intensityTier: 2,
    counterFoilKinds: ['ROTATE_RING_FREE', 'FREEZE_NODE', 'SHATTER_CHAINS'],
    hasPhysical3DTell: true,
  },
  CURSED_MULTIPLIER_DECAY: {
    twistId: 'CURSED_MULTIPLIER_DECAY',
    title: 'Cursed Multiplier Decay',
    stageCallout: 'SAND DRAINING — MULTIPLIERS TICK DOWN!',
    rulesSummary: 'Unclaimed multiplier pedestals lose -0.25x every turn unless preserved with a Freeze-Node Foil card.',
    primarySfx: 'clock_escapement_urgent',
    accentHex: 0xffb703,
    intensityTier: 2,
    counterFoilKinds: ['FREEZE_NODE', 'DOUBLE_MULT', 'SWAP_CLUE_TOY'],
    hasPhysical3DTell: true,
  },
  OVERCLOCK_DOUBLE_SPEED: {
    twistId: 'OVERCLOCK_DOUBLE_SPEED',
    title: 'Overclock Double-Speed',
    stageCallout: 'OVERCLOCKED! BELTS & WHEELS RUN 2X FAST!',
    rulesSummary: 'Conveyors shift 2 notches and rotary wheels spin 60 degrees per turn; last-notch smelter rescues pay x1.5 Mult!',
    primarySfx: 'clock_horology_tick',
    accentHex: 0xff6d00,
    intensityTier: 2,
    counterFoilKinds: ['ROTATE_RING_FREE', 'FREEZE_NODE', 'DOUBLE_MULT'],
    hasPhysical3DTell: true,
  },
  RIVAL_FOG_JAMMER: {
    twistId: 'RIVAL_FOG_JAMMER',
    title: 'Rival Fog Jammer',
    stageCallout: 'SIGNAL JAMMED! RIVAL MASKED HIGH TILES!',
    rulesSummary: 'Rival radio-jammer scrambles 2 high-value tiles each turn; Screw Rival clears the static and refunds +150 Chips.',
    primarySfx: 'screw_rival_slam',
    accentHex: 0x6ec1e4,
    intensityTier: 2,
    counterFoilKinds: ['SCREW_RIVAL', 'REVEAL_MOLE', 'SWAP_CLUE_TOY'],
    hasPhysical3DTell: true,
  },
  GOLDEN_BOUNTY_HUNT: {
    twistId: 'GOLDEN_BOUNTY_HUNT',
    title: 'Golden Bounty Hunt',
    stageCallout: 'GOLDEN CRANE DROP — CHASE THE +350 BOUNTY!',
    rulesSummary: 'A gilded beacon hops to a new unclaimed node each turn; snagging it pays +350 Chips & +0.75x Mult immediately!',
    primarySfx: 'trophy_pedestal_chime',
    accentHex: 0xffd700,
    intensityTier: 1,
    counterFoilKinds: ['DOUBLE_MULT', 'FREEZE_NODE', 'SHATTER_CHAINS'],
    hasPhysical3DTell: true,
  },
  SUDDEN_TRAPDOOR_HAZARD: {
    twistId: 'SUDDEN_TRAPDOOR_HAZARD',
    title: 'Sudden Trapdoor Hazard',
    stageCallout: 'FLOOR RIGGED! HIT FOR +1.0X OR DROP!',
    rulesSummary: 'Two hazard-chevron tiles grant Daredevil +1.0x Mult on correct hits, or plunge straight into the 8s Trapdoor Pit!',
    primarySfx: 'trapdoor_hinge_drop',
    accentHex: 0xe63946,
    intensityTier: 3,
    counterFoilKinds: ['DEFUSE_ONE_WIRE', 'SWAP_CLUE_TOY', 'DOUBLE_MULT'],
    hasPhysical3DTell: true,
  },
  RICOCHET_LASER_BONUS: {
    twistId: 'RICOCHET_LASER_BONUS',
    title: 'Ricochet Laser Bonus',
    stageCallout: 'OPTICAL BEAM LOCKED — HIT THE LASER PATH!',
    rulesSummary: 'A ruby beam bounces through 3 aligned nodes; claiming any illuminated node adds +35% Chips per chain bounce.',
    primarySfx: 'optical_beam_lock',
    accentHex: 0x64dfdf,
    intensityTier: 2,
    counterFoilKinds: ['ROTATE_RING_FREE', 'DOUBLE_MULT', 'SHATTER_CHAINS'],
    hasPhysical3DTell: true,
  },
  HIGH_VOLTAGE_CHAIN: {
    twistId: 'HIGH_VOLTAGE_CHAIN',
    title: 'High-Voltage Chain',
    stageCallout: 'TESLA ARCS LIVE — LINK 3 FOR +0.75X MULT!',
    rulesSummary: 'Connecting 3+ adjacent player-owned nodes ignites a live plasma arc awarding +0.75x Mult and shock bonus chips!',
    primarySfx: 'nixie_spark_crackle',
    accentHex: 0x38d9a9,
    intensityTier: 2,
    counterFoilKinds: ['SHATTER_CHAINS', 'DOUBLE_MULT', 'FREEZE_NODE'],
    hasPhysical3DTell: true,
  },
};

export const ALL_LIVE_TWIST_IDS_V6: readonly BoardTwistMutationIdV6[] = [
  'BLACKOUT_SPOTLIGHT',
  'GRAVITY_INVERSION',
  'HOST_BLIND_AUCTION',
  'CHAIN_FUSE_DETONATION',
  'MIRROR_TWIN_LINK',
  'RISING_FLOOD_STAGE',
  'DOUBLE_AGENT_MOLE',
  'SPLIT_OR_STEAL_VAULT',
  'MAGNETIC_REPULSOR',
  'CURSED_MULTIPLIER_DECAY',
  'OVERCLOCK_DOUBLE_SPEED',
  'RIVAL_FOG_JAMMER',
  'GOLDEN_BOUNTY_HUNT',
  'SUDDEN_TRAPDOOR_HAZARD',
  'RICOCHET_LASER_BONUS',
  'HIGH_VOLTAGE_CHAIN',
] as const;

// ----------------------------------------------------------------------------
// 2. Runtime Data Structures & Event Contracts
// ----------------------------------------------------------------------------

export interface TwistEventV6 {
  readonly eventId: string;
  readonly twistId: BoardTwistMutationIdV6;
  readonly kind:
    | 'HALFTIME_SIREN'
    | 'TWIST_TICK'
    | 'CLAIM_COMBO'
    | 'MOLE_TRAP'
    | 'MOLE_DISARMED'
    | 'FUSE_DEFUSED'
    | 'FUSE_DETONATED'
    | 'FLOOD_SURGE'
    | 'GRAVITY_FLIP'
    | 'CONVEYOR_SHIFT'
    | 'AUCTION_RESULT'
    | 'SPLIT_OR_STEAL'
    | 'FOIL_PLAYED'
    | 'RIVAL_SCREW'
    | 'EMERGENCY_UNCHAIN';
  readonly bannerText: string;
  readonly sfx: FoleySfxIdV6;
  readonly affectedNodeIds: string[];
  readonly chipDelta: number;
  readonly multDelta: number;
  readonly triggerTrapdoor?: boolean;
}

export interface BlindAuctionStateV6 {
  readonly nodeId: string;
  readonly baseValuation: number;
  readonly isRiggedDecoy: boolean;
  readonly minBid: number;
  readonly maxBid: number;
  readonly rivalBluffTell: string;
}

export interface BlindAuctionResultV6 {
  readonly winner: 'PLAYER' | 'RIVAL' | 'NONE';
  readonly playerBid: number;
  readonly rivalBid: number;
  readonly wasRiggedDecoy: boolean;
  readonly netCashDelta: number;
  readonly unlockedMultiplier: number;
  readonly event: TwistEventV6;
}

export interface SplitOrStealStateV6 {
  readonly vaultNodeId: string;
  readonly totalPotCash: number;
  readonly rivalPersonaTell: string;
  readonly resolved: boolean;
}

export interface SplitOrStealResultV6 {
  readonly playerChoice: 'SPLIT' | 'STEAL';
  readonly rivalChoice: 'SPLIT' | 'STEAL';
  readonly playerPayoutCash: number;
  readonly rivalPayoutCash: number;
  readonly multBonus: number;
  readonly triggerTrapdoor: boolean;
  readonly event: TwistEventV6;
}

export interface ClaimTwistResolutionV6 {
  readonly nodeId: string;
  readonly chipsAwarded: number;
  readonly multDelta: number;
  readonly bonusFlippedNodeIds: string[];
  readonly unchainedNodeIds: string[];
  readonly triggerTrapdoor: boolean;
  readonly openBlindAuction: BlindAuctionStateV6 | null;
  readonly openSplitOrSteal: SplitOrStealStateV6 | null;
  readonly events: TwistEventV6[];
}

export interface FoilCardOutcomeV6 {
  readonly applied: boolean;
  readonly card: FoilTrickCardV6;
  readonly summary: string;
  readonly affectedNodeIds: string[];
  readonly cashDelta: number;
  readonly multDelta: number;
  readonly event: TwistEventV6;
}

export interface TwistDirectorSnapshotV6 {
  readonly activeTwist: BoardTwistMutationIdV6;
  readonly secondaryTwist: BoardTwistMutationIdV6;
  readonly halftimeTriggered: boolean;
  readonly spotlightTarget3d: [number, number, number];
  readonly spotlightRadius: number;
  readonly gravityInverted: boolean;
  readonly floodLevelIndex: number;
  readonly floodWaterLevelY: number;
  readonly submergedNodeIds: string[];
  readonly fuseTimers: Readonly<Record<string, number>>;
  readonly entangledPairs: ReadonlyArray<readonly [string, string]>;
  readonly revealedMoleNodeIds: string[];
  readonly moleTellIntensity: Readonly<Record<string, number>>;
  readonly frozenNodeIds: string[];
  readonly bountyNodeId: string | null;
  readonly bountyBonusChips: number;
  readonly hazardNodeIds: string[];
  readonly jammedNodeIds: string[];
  readonly magneticPolarity: 1 | -1;
  readonly laserPathNodeIds: string[];
  readonly voltageClusterNodeIds: string[];
  readonly splitOrStealPotCash: number;
  readonly pendingAuction: BlindAuctionStateV6 | null;
  readonly pendingSplitOrSteal: SplitOrStealStateV6 | null;
  readonly nextClaimMultBoost: number;
  readonly rivalScrewedTurnsRemaining: number;
  readonly conveyorShiftCount: number;
}

// ----------------------------------------------------------------------------
// 3. Seeded Utility Helpers
// ----------------------------------------------------------------------------

function createDirectorRng(seed: number): () => number {
  let s = (seed >>> 0) || 0x517cc1b7;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(text: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ----------------------------------------------------------------------------
// 4. BoardTwistDirectorV6 — Live Mid-Match Mutation Engine
// ----------------------------------------------------------------------------

export class BoardTwistDirectorV6 {
  private rng: () => number = createDirectorRng(1337);
  private eventSeq = 0;

  private secondaryTwist: BoardTwistMutationIdV6 = 'NONE';
  private halftimeTriggered = false;
  private spotlightTarget3d: [number, number, number] = [0, 0, 0];
  private spotlightRadius = 2.05;
  private gravityInverted = false;
  private floodLevelIndex = 0;
  private floodWaterLevelY = -1.65;
  private submergedNodeIds = new Set<string>();
  private fuseTimers = new Map<string, number>();
  private entangledPairs: Array<[string, string]> = [];
  private revealedMoleNodeIds = new Set<string>();
  private moleTellIntensity = new Map<string, number>();
  private frozenNodeIds = new Set<string>();
  private bountyNodeId: string | null = null;
  private bountyBonusChips = 350;
  private hazardNodeIds = new Set<string>();
  private jammedNodeIds = new Set<string>();
  private magneticPolarity: 1 | -1 = 1;
  private laserPathNodeIds: string[] = [];
  private voltageClusterNodeIds: string[] = [];
  private splitOrStealPotCash = 600;
  private pendingAuction: BlindAuctionStateV6 | null = null;
  private pendingSplitOrSteal: SplitOrStealStateV6 | null = null;
  private nextClaimMultBoost = 1.0;
  private rivalScrewedTurnsRemaining = 0;
  private conveyorShiftCount = 0;

  public initializeForBoard(
    state: BoardRuntimeStateV6,
    seed?: number,
  ): TwistDirectorSnapshotV6 {
    this.rng = createDirectorRng(seed ?? hashSeed(`${state.definition.boardId}_${state.activeTwist}`));
    this.eventSeq = 0;
    this.secondaryTwist = 'NONE';
    this.halftimeTriggered = false;
    this.spotlightTarget3d = [0, 0, 0];
    this.spotlightRadius = 2.15;
    this.gravityInverted = false;
    this.floodLevelIndex = 0;
    this.floodWaterLevelY = -1.65;
    this.submergedNodeIds.clear();
    this.fuseTimers.clear();
    this.entangledPairs = [];
    this.revealedMoleNodeIds.clear();
    this.moleTellIntensity.clear();
    this.frozenNodeIds.clear();
    this.bountyNodeId = null;
    this.bountyBonusChips = 350;
    this.hazardNodeIds.clear();
    this.jammedNodeIds.clear();
    this.magneticPolarity = 1;
    this.laserPathNodeIds = [];
    this.voltageClusterNodeIds = [];
    this.splitOrStealPotCash = 600;
    this.pendingAuction = null;
    this.pendingSplitOrSteal = null;
    this.nextClaimMultBoost = 1.0;
    this.rivalScrewedTurnsRemaining = 0;
    this.conveyorShiftCount = 0;

    this.configureTwistState(state, state.activeTwist);
    this.ensurePlayableNodes(state);
    return this.getSnapshot(state);
  }

  public getSnapshot(state: BoardRuntimeStateV6): TwistDirectorSnapshotV6 {
    const fuseObj: Record<string, number> = {};
    this.fuseTimers.forEach((v, k) => {
      fuseObj[k] = v;
    });
    const tellObj: Record<string, number> = {};
    this.moleTellIntensity.forEach((v, k) => {
      tellObj[k] = v;
    });
    return {
      activeTwist: state.activeTwist,
      secondaryTwist: this.secondaryTwist,
      halftimeTriggered: this.halftimeTriggered,
      spotlightTarget3d: [...this.spotlightTarget3d] as [number, number, number],
      spotlightRadius: this.spotlightRadius,
      gravityInverted: this.gravityInverted,
      floodLevelIndex: this.floodLevelIndex,
      floodWaterLevelY: this.floodWaterLevelY,
      submergedNodeIds: Array.from(this.submergedNodeIds),
      fuseTimers: fuseObj,
      entangledPairs: this.entangledPairs.map(([a, b]) => [a, b] as const),
      revealedMoleNodeIds: Array.from(this.revealedMoleNodeIds),
      moleTellIntensity: tellObj,
      frozenNodeIds: Array.from(this.frozenNodeIds),
      bountyNodeId: this.bountyNodeId,
      bountyBonusChips: this.bountyBonusChips,
      hazardNodeIds: Array.from(this.hazardNodeIds),
      jammedNodeIds: Array.from(this.jammedNodeIds),
      magneticPolarity: this.magneticPolarity,
      laserPathNodeIds: [...this.laserPathNodeIds],
      voltageClusterNodeIds: [...this.voltageClusterNodeIds],
      splitOrStealPotCash: this.splitOrStealPotCash,
      pendingAuction: this.pendingAuction ? { ...this.pendingAuction } : null,
      pendingSplitOrSteal: this.pendingSplitOrSteal ? { ...this.pendingSplitOrSteal } : null,
      nextClaimMultBoost: this.nextClaimMultBoost,
      rivalScrewedTurnsRemaining: this.rivalScrewedTurnsRemaining,
      conveyorShiftCount: this.conveyorShiftCount,
    };
  }

  public hasTwistActive(state: BoardRuntimeStateV6, twist: BoardTwistMutationIdV6): boolean {
    return state.activeTwist === twist || this.secondaryTwist === twist;
  }

  public setSpotlightTarget(
    state: BoardRuntimeStateV6,
    x: number,
    z: number,
  ): string[] {
    this.spotlightTarget3d = [
      Math.max(-3.6, Math.min(3.6, x)),
      0,
      Math.max(-3.4, Math.min(3.4, z)),
    ];
    return state.nodes
      .filter((nd) => this.isNodeInsideSpotlight(nd))
      .map((nd) => nd.nodeId);
  }

  public isNodeVisible(state: BoardRuntimeStateV6, nodeId: string): boolean {
    const node = state.nodes.find((nd) => nd.nodeId === nodeId);
    if (!node) return false;
    if (node.owner === 'PLAYER' || node.owner === 'RIVAL') return true;
    if (this.hasTwistActive(state, 'BLACKOUT_SPOTLIGHT')) {
      return this.isNodeInsideSpotlight(node);
    }
    if (this.hasTwistActive(state, 'RIVAL_FOG_JAMMER') && this.jammedNodeIds.has(nodeId)) {
      return false;
    }
    return true;
  }

  public isNodePlayable(
    state: BoardRuntimeStateV6,
    nodeId: string,
  ): { playable: boolean; reason?: string } {
    const node = state.nodes.find((nd) => nd.nodeId === nodeId);
    if (!node) return { playable: false, reason: 'Unknown node.' };
    if (node.owner === 'PLAYER' || node.owner === 'RIVAL') {
      return { playable: false, reason: 'Already claimed.' };
    }
    if (this.submergedNodeIds.has(nodeId)) {
      return { playable: false, reason: 'Submerged beneath the flood tide.' };
    }
    if (node.owner === 'LOCKED_VAULT') {
      const ownedCount = state.nodes.filter((nd) => nd.owner === 'PLAYER').length;
      if (ownedCount < 2 && node.lockedChains > 0) {
        return { playable: false, reason: 'Claim 2 support tiles or shatter chains to unlock Vault.' };
      }
    }
    if (node.lockedChains > 0) {
      const hasAdjacentOwned = node.neighbors.some((nid) => {
        const nb = state.nodes.find((x) => x.nodeId === nid);
        return nb?.owner === 'PLAYER';
      });
      if (!hasAdjacentOwned) {
        return { playable: false, reason: 'Locked by iron chains — claim an adjacent tile or play Shatter Chains.' };
      }
    }
    if (this.hasTwistActive(state, 'BLACKOUT_SPOTLIGHT') && !this.isNodeInsideSpotlight(node)) {
      return { playable: false, reason: 'Sweep the 3D spotlight over this tile first.' };
    }
    return { playable: true };
  }

  // --------------------------------------------------------------------------
  // Halftime Stage-Siren Mutation Choreography
  // --------------------------------------------------------------------------

  public evaluateHalftimeMutation(state: BoardRuntimeStateV6): TwistEventV6 | null {
    const halftimeTurn = Math.max(3, Math.ceil(state.maxTurns / 2));
    if (this.halftimeTriggered || state.turnNumber < halftimeTurn) {
      return null;
    }
    this.halftimeTriggered = true;

    const blueprint = getBoardBlueprintB(state.definition.boardId);
    const pool: BoardTwistMutationIdV6[] = blueprint
      ? blueprint.halftimeTwistPool.filter((t) => t !== state.activeTwist && t !== 'NONE')
      : ALL_LIVE_TWIST_IDS_V6.filter((t) => t !== state.activeTwist);

    // Dynamic drama selection: if trailing hard, favor comeback catalysts; if ahead, ramp pressure!
    const cashGap = state.playerTotalCash - state.rivalTotalCash;
    let chosen: BoardTwistMutationIdV6;
    if (cashGap < -200 && pool.includes('GOLDEN_BOUNTY_HUNT')) {
      chosen = 'GOLDEN_BOUNTY_HUNT';
    } else if (cashGap > 300 && pool.includes('CHAIN_FUSE_DETONATION')) {
      chosen = 'CHAIN_FUSE_DETONATION';
    } else if (pool.length > 0) {
      chosen = pool[Math.floor(this.rng() * pool.length)];
    } else {
      chosen = 'GOLDEN_BOUNTY_HUNT';
    }

    this.secondaryTwist = chosen;
    this.configureTwistState(state, chosen);
    this.ensurePlayableNodes(state);

    const spec = TWIST_MUTATION_SPECS_V6[chosen];
    return this.makeEvent(
      chosen,
      'HALFTIME_SIREN',
      `HALFTIME TWIST: ${spec.title.toUpperCase()} — ${spec.stageCallout}`,
      'twist_siren_chime',
      state.nodes.filter((nd) => nd.owner === 'NONE').slice(0, 4).map((nd) => nd.nodeId),
      0,
      0,
    );
  }

  // --------------------------------------------------------------------------
  // Resolve Player Claim Against All Active Twists
  // --------------------------------------------------------------------------

  public resolvePlayerClaim(
    state: BoardRuntimeStateV6,
    nodeId: string,
    correct: boolean,
    answerAccuracy = 1.0,
  ): ClaimTwistResolutionV6 {
    const node = state.nodes.find((nd) => nd.nodeId === nodeId);
    if (!node) {
      return {
        nodeId,
        chipsAwarded: 0,
        multDelta: 0,
        bonusFlippedNodeIds: [],
        unchainedNodeIds: [],
        triggerTrapdoor: false,
        openBlindAuction: null,
        openSplitOrSteal: null,
        events: [],
      };
    }

    const events: TwistEventV6[] = [];
    const bonusFlippedNodeIds: string[] = [];
    const unchainedNodeIds: string[] = [];
    let chipsAwarded = 0;
    let multDelta = 0;
    let triggerTrapdoor = false;
    let openBlindAuction: BlindAuctionStateV6 | null = null;
    let openSplitOrSteal: SplitOrStealStateV6 | null = null;

    const clampedAccuracy = Math.max(0.25, Math.min(1.0, answerAccuracy));

    // 1. Wrong Answer Resolution (Trapdoor Hazards, Fuse Acceleration, Mole Stings)
    if (!correct) {
      state.streakCount = 0;
      if (this.hasTwistActive(state, 'SUDDEN_TRAPDOOR_HAZARD') && this.hazardNodeIds.has(nodeId)) {
        triggerTrapdoor = true;
        events.push(
          this.makeEvent(
            'SUDDEN_TRAPDOOR_HAZARD',
            'CLAIM_COMBO',
            'HAZARD FLOOR SPRUNG! SURVIVE THE 8-SECOND TRAPDOOR PIT!',
            'trapdoor_hinge_drop',
            [nodeId],
            0,
            0,
            true,
          ),
        );
      } else if (this.hasTwistActive(state, 'CHAIN_FUSE_DETONATION') && this.fuseTimers.has(nodeId)) {
        const blastEvent = this.detonateFuseNode(state, nodeId);
        events.push(blastEvent);
      } else {
        triggerTrapdoor = true; // Standard v6 miss offers Trapdoor Gambit survival rescue!
      }
      return {
        nodeId,
        chipsAwarded: 0,
        multDelta: 0,
        bonusFlippedNodeIds,
        unchainedNodeIds,
        triggerTrapdoor,
        openBlindAuction,
        openSplitOrSteal,
        events,
      };
    }

    // 2. Correct Answer — Check Disguised Double-Agent Mole!
    if (this.hasTwistActive(state, 'DOUBLE_AGENT_MOLE') && node.isDoubleAgentMole) {
      if (this.revealedMoleNodeIds.has(nodeId)) {
        // Player unmasked the Mole first with Reveal-Mole Foil! Convert into Counter-Intel Bounty!
        node.isDoubleAgentMole = false;
        node.owner = 'PLAYER';
        chipsAwarded = Math.round((node.baseChips + 300) * clampedAccuracy);
        multDelta += 0.75;
        events.push(
          this.makeEvent(
            'DOUBLE_AGENT_MOLE',
            'MOLE_DISARMED',
            'MOLE FLIPPED! +300 COUNTER-INTEL BOUNTY & +0.75x MULT!',
            'vault_heavy_unlock',
            [nodeId],
            chipsAwarded,
            0.75,
          ),
        );
      } else {
        // Triggered unmasked Mole trap!
        node.isDoubleAgentMole = false;
        node.owner = 'RIVAL';
        const stolen = Math.round(node.baseChips * 0.75);
        state.rivalTotalCash += stolen;
        // Snap 1 chain onto an adjacent unchained non-frozen node
        const chainTarget = node.neighbors
          .map((nid) => state.nodes.find((x) => x.nodeId === nid))
          .find((nb) => nb && nb.owner === 'NONE' && !this.frozenNodeIds.has(nb.nodeId));
        if (chainTarget) chainTarget.lockedChains += 1;
        events.push(
          this.makeEvent(
            'DOUBLE_AGENT_MOLE',
            'MOLE_TRAP',
            `DOUBLE-AGENT MOLE! ${state.rivalName} HIJACKED $${stolen} CHIPS!`,
            'crowd_collective_gasp',
            chainTarget ? [nodeId, chainTarget.nodeId] : [nodeId],
            -stolen,
            0,
          ),
        );
        this.ensurePlayableNodes(state);
        return {
          nodeId,
          chipsAwarded: 0,
          multDelta: 0,
          bonusFlippedNodeIds,
          unchainedNodeIds,
          triggerTrapdoor: false,
          openBlindAuction: null,
          openSplitOrSteal: null,
          events,
        };
      }
    } else {
      // Standard clean claim
      node.owner = 'PLAYER';
      node.lockedChains = 0;
      chipsAwarded = Math.round(node.baseChips * clampedAccuracy);
      multDelta += node.multBonus;
    }

    // 3. Apply Active Twists Synergies on Correct Claim
    // 3a. Gravity Inversion Bonus (inverted base rows now sit at Apex!)
    if (this.hasTwistActive(state, 'GRAVITY_INVERSION') && this.gravityInverted) {
      const tierBonus = (node.tierIndex ?? 0) === 0 ? 220 : 80;
      chipsAwarded += tierBonus;
      multDelta += (node.tierIndex ?? 0) === 0 ? 0.5 : 0;
    }

    // 3b. Conveyor / Overclock Last-Notch Smelter Rescue
    const blueprint = getBoardBlueprintB(state.definition.boardId);
    if (
      (blueprint?.supportsConveyorShift || this.hasTwistActive(state, 'OVERCLOCK_DOUBLE_SPEED')) &&
      node.pos3d[0] >= 1.8
    ) {
      multDelta += 0.5;
      chipsAwarded += 120;
      events.push(
        this.makeEvent(
          'OVERCLOCK_DOUBLE_SPEED',
          'CLAIM_COMBO',
          'SMELTER EDGE SALVAGE! +120 CHIPS & +0.5x MULT!',
          'pneumatic_piston_slam',
          [nodeId],
          120,
          0.5,
        ),
      );
    }

    // 3c. Chain-Fuse Defusal!
    if (this.hasTwistActive(state, 'CHAIN_FUSE_DETONATION') && (node.hasTrapFuse || this.fuseTimers.has(nodeId))) {
      node.hasTrapFuse = false;
      this.fuseTimers.delete(nodeId);
      chipsAwarded += 250;
      multDelta += 0.5;
      for (const nbId of node.neighbors) {
        const nb = state.nodes.find((x) => x.nodeId === nbId);
        if (nb && nb.lockedChains > 0) {
          nb.lockedChains = Math.max(0, nb.lockedChains - 1);
          unchainedNodeIds.push(nb.nodeId);
        }
      }
      events.push(
        this.makeEvent(
          'CHAIN_FUSE_DETONATION',
          'FUSE_DEFUSED',
          'BOMB FUSE SNIPPED! +250 CHIPS & NEIGHBOR CHAINS SHATTERED!',
          'wire_cutter_snip',
          [nodeId, ...unchainedNodeIds],
          250,
          0.5,
        ),
      );
    }

    // 3d. Mirror-Twin / Quantum Entanglement Instant Flip!
    if (this.hasTwistActive(state, 'MIRROR_TWIN_LINK') || blueprint?.supportsEntangledPairs) {
      const twinId = this.findEntangledTwin(nodeId);
      if (twinId && !this.frozenNodeIds.has(twinId)) {
        const twinNode = state.nodes.find((x) => x.nodeId === twinId);
        if (twinNode && twinNode.owner !== 'PLAYER') {
          twinNode.owner = 'PLAYER';
          twinNode.lockedChains = 0;
          bonusFlippedNodeIds.push(twinId);
          const twinChips = Math.round(twinNode.baseChips * 0.6);
          chipsAwarded += twinChips;
          multDelta += 0.4;
          events.push(
            this.makeEvent(
              'MIRROR_TWIN_LINK',
              'CLAIM_COMBO',
              `QUANTUM TWIN FLIPPED! +${twinChips} CHIPS & +0.4x MULT!`,
              'crystal_hex_claim',
              [nodeId, twinId],
              twinChips,
              0.4,
            ),
          );
        }
      }
    }

    // 3e. Golden Bounty Hunt!
    if (this.hasTwistActive(state, 'GOLDEN_BOUNTY_HUNT') && this.bountyNodeId === nodeId) {
      chipsAwarded += this.bountyBonusChips;
      multDelta += 0.75;
      events.push(
        this.makeEvent(
          'GOLDEN_BOUNTY_HUNT',
          'CLAIM_COMBO',
          `GOLDEN BOUNTY CLAIMED! +${this.bountyBonusChips} CHIPS & +0.75x MULT!`,
          'trophy_pedestal_chime',
          [nodeId],
          this.bountyBonusChips,
          0.75,
        ),
      );
      this.relocateGoldenBounty(state);
    }

    // 3f. Sudden Trapdoor Hazard Daredevil Payout!
    if (this.hasTwistActive(state, 'SUDDEN_TRAPDOOR_HAZARD') && this.hazardNodeIds.has(nodeId)) {
      this.hazardNodeIds.delete(nodeId);
      multDelta += 1.0;
      events.push(
        this.makeEvent(
          'SUDDEN_TRAPDOOR_HAZARD',
          'CLAIM_COMBO',
          'DAREDEVIL CLEAR! +1.0x MULT OVER OPEN TRAPDOOR!',
          'crowd_studio_roar',
          [nodeId],
          0,
          1.0,
        ),
      );
    }

    // 3g. Ricochet Laser Bonus!
    if (this.hasTwistActive(state, 'RICOCHET_LASER_BONUS') && this.laserPathNodeIds.includes(nodeId)) {
      const pathIdx = this.laserPathNodeIds.indexOf(nodeId);
      const bounceBonus = Math.round(node.baseChips * (0.35 * (pathIdx + 1)));
      chipsAwarded += bounceBonus;
      multDelta += 0.35;
      events.push(
        this.makeEvent(
          'RICOCHET_LASER_BONUS',
          'CLAIM_COMBO',
          `LASER RICOCHET x${pathIdx + 1}! +${bounceBonus} OPTICAL CHIPS!`,
          'optical_beam_lock',
          [...this.laserPathNodeIds],
          bounceBonus,
          0.35,
        ),
      );
      this.recomputeLaserPath(state);
    }

    // 3h. High-Voltage Connected Cluster Arc!
    if (this.hasTwistActive(state, 'HIGH_VOLTAGE_CHAIN')) {
      const cluster = this.findConnectedOwnedCluster(state, nodeId, 'PLAYER');
      if (cluster.length >= 3) {
        this.voltageClusterNodeIds = cluster;
        const arcChips = cluster.length * 60;
        chipsAwarded += arcChips;
        multDelta += 0.75;
        events.push(
          this.makeEvent(
            'HIGH_VOLTAGE_CHAIN',
            'CLAIM_COMBO',
            `TESLA ARC (${cluster.length} LINKS)! +${arcChips} CHIPS & +0.75x MULT!`,
            'nixie_spark_crackle',
            cluster,
            arcChips,
            0.75,
          ),
        );
      }
    }

    // 3i. Magnetic Repulsor Dipole Flip!
    if (this.hasTwistActive(state, 'MAGNETIC_REPULSOR')) {
      this.magneticPolarity = this.magneticPolarity === 1 ? -1 : 1;
      const rimNodes = state.nodes.filter((nd) => nd.owner === 'NONE' && (nd.ringIndex ?? 2) >= 2);
      for (const rim of rimNodes.slice(0, 3)) {
        rim.baseChips += 60;
      }
      // Repel 1 chain lock off a neighboring tile
      const chainedNb = node.neighbors
        .map((nid) => state.nodes.find((x) => x.nodeId === nid))
        .find((nb) => nb && nb.lockedChains > 0);
      if (chainedNb) {
        chainedNb.lockedChains = 0;
        unchainedNodeIds.push(chainedNb.nodeId);
      }
      events.push(
        this.makeEvent(
          'MAGNETIC_REPULSOR',
          'TWIST_TICK',
          `MAGNET POLARITY ${this.magneticPolarity > 0 ? 'NORTH' : 'SOUTH'}! RIM PAYOUTS CHARGED +60!`,
          'brass_gear_detent',
          rimNodes.slice(0, 3).map((x) => x.nodeId),
          0,
          0,
        ),
      );
    }

    // 3j. Host's Blind Auction Cloche Trigger!
    if (this.hasTwistActive(state, 'HOST_BLIND_AUCTION') && node.isMysteryAuction) {
      node.isMysteryAuction = false;
      this.pendingAuction = {
        nodeId,
        baseValuation: node.baseChips * 2,
        isRiggedDecoy: this.rng() < 0.28,
        minBid: 50,
        maxBid: Math.max(150, Math.min(600, state.playerTotalCash)),
        rivalBluffTell:
          this.rng() < 0.5
            ? `${state.rivalName} taps the velvet cloche twice—confident or bluffing?`
            : `${state.rivalName} reaches eagerly for the high paddle...`,
      };
      openBlindAuction = { ...this.pendingAuction };
    }

    // 3k. Split-or-Steal Vault Pot Growth & Showdown Trigger!
    if (this.hasTwistActive(state, 'SPLIT_OR_STEAL_VAULT')) {
      this.splitOrStealPotCash += Math.round(node.baseChips * 0.75);
      const isCenterVault = node.index === 0 || (node.ringIndex === 0 && node.tierIndex === 2);
      if (isCenterVault && !this.pendingSplitOrSteal?.resolved) {
        const trailing = state.rivalTotalCash < state.playerTotalCash;
        this.pendingSplitOrSteal = {
          vaultNodeId: nodeId,
          totalPotCash: this.splitOrStealPotCash,
          rivalPersonaTell: trailing
            ? `${state.rivalName} is trailing—watch their knuckles tighten on the STEAL sphere.`
            : `${state.rivalName} smiles warmly and offers a handshake on SPLIT...`,
          resolved: false,
        };
        openSplitOrSteal = { ...this.pendingSplitOrSteal };
      }
    }

    // 4. Apply DOUBLE_MULT Foil boost & update runtime score totals!
    const effectiveMultBoost = this.nextClaimMultBoost;
    this.nextClaimMultBoost = 1.0;

    state.streakCount += 1;
    state.playerMult = Number((state.playerMult + multDelta).toFixed(2));
    const totalClaimChips = Math.round(chipsAwarded * effectiveMultBoost);
    state.playerScoreChips += totalClaimChips;
    state.playerTotalCash += Math.round(totalClaimChips * state.playerMult);

    // Unlock adjacent chains automatically on claim!
    for (const nbId of node.neighbors) {
      const nb = state.nodes.find((x) => x.nodeId === nbId);
      if (nb && nb.lockedChains > 0 && !unchainedNodeIds.includes(nb.nodeId)) {
        nb.lockedChains = Math.max(0, nb.lockedChains - 1);
        unchainedNodeIds.push(nb.nodeId);
      }
    }

    this.ensurePlayableNodes(state);

    return {
      nodeId,
      chipsAwarded: totalClaimChips,
      multDelta,
      bonusFlippedNodeIds,
      unchainedNodeIds,
      triggerTrapdoor,
      openBlindAuction,
      openSplitOrSteal,
      events,
    };
  }

  // --------------------------------------------------------------------------
  // Interactive Sub-Twists: Blind Auction & Golden-Balls Split-or-Steal
  // --------------------------------------------------------------------------

  public resolveBlindAuctionBid(
    state: BoardRuntimeStateV6,
    nodeId: string,
    playerBidCash: number,
  ): BlindAuctionResultV6 {
    const auction = this.pendingAuction;
    const bid = Math.max(0, Math.min(state.playerTotalCash, Math.round(playerBidCash)));
    const baseVal = auction?.baseValuation ?? 400;
    const isDecoy = auction?.isRiggedDecoy ?? false;
    const rivalBid = Math.round(
      Math.min(
        state.rivalTotalCash,
        baseVal * (isDecoy ? 0.35 + this.rng() * 0.45 : 0.45 + this.rng() * 0.55),
      ),
    );

    this.pendingAuction = null;

    if (bid === 0 && rivalBid === 0) {
      const event = this.makeEvent(
        'HOST_BLIND_AUCTION',
        'AUCTION_RESULT',
        'NO BIDDERS! CLOCHE WITHDRAWN!',
        'ui_brass_tap',
        [nodeId],
        0,
        0,
      );
      return {
        winner: 'NONE',
        playerBid: 0,
        rivalBid: 0,
        wasRiggedDecoy: isDecoy,
        netCashDelta: 0,
        unlockedMultiplier: 1.0,
        event,
      };
    }

    if (bid >= rivalBid) {
      state.playerTotalCash = Math.max(0, state.playerTotalCash - bid);
      if (isDecoy) {
        const event = this.makeEvent(
          'HOST_BLIND_AUCTION',
          'AUCTION_RESULT',
          `RIGGED LEMON CLOCHE! PAID $${bid} FOR A DUD!`,
          'crowd_collective_gasp',
          [nodeId],
          -bid,
          0,
        );
        return {
          winner: 'PLAYER',
          playerBid: bid,
          rivalBid,
          wasRiggedDecoy: true,
          netCashDelta: -bid,
          unlockedMultiplier: 1.0,
          event,
        };
      }
      const payout = baseVal * 2;
      state.playerTotalCash += payout;
      state.playerMult = Number((state.playerMult + 0.6).toFixed(2));
      const net = payout - bid;
      const event = this.makeEvent(
        'HOST_BLIND_AUCTION',
        'AUCTION_RESULT',
        `AUCTION WON ($${bid} vs $${rivalBid})! VAULT PAYS $${payout} & +0.6x!`,
        'vault_heavy_unlock',
        [nodeId],
        net,
        0.6,
      );
      return {
        winner: 'PLAYER',
        playerBid: bid,
        rivalBid,
        wasRiggedDecoy: false,
        netCashDelta: net,
        unlockedMultiplier: 2.0,
        event,
      };
    }

    // Rival outbid player!
    state.rivalTotalCash = Math.max(0, state.rivalTotalCash - rivalBid);
    if (isDecoy) {
      const bonusBait = 200;
      state.playerTotalCash += bonusBait;
      const event = this.makeEvent(
        'HOST_BLIND_AUCTION',
        'AUCTION_RESULT',
        `MASTER BAIT! ${state.rivalName} PAID $${rivalBid} FOR A RIGGED LEMON (+$${bonusBait}!)`,
        'crowd_studio_roar',
        [nodeId],
        bonusBait,
        0.35,
      );
      state.playerMult = Number((state.playerMult + 0.35).toFixed(2));
      return {
        winner: 'RIVAL',
        playerBid: bid,
        rivalBid,
        wasRiggedDecoy: true,
        netCashDelta: bonusBait,
        unlockedMultiplier: 1.0,
        event,
      };
    }

    state.rivalTotalCash += Math.round(baseVal * 1.4);
    const event = this.makeEvent(
      'HOST_BLIND_AUCTION',
      'AUCTION_RESULT',
      `${state.rivalName} WON THE CLOCHE AT $${rivalBid}!`,
      'chip_stack_riffle',
      [nodeId],
      0,
      0,
    );
    return {
      winner: 'RIVAL',
      playerBid: bid,
      rivalBid,
      wasRiggedDecoy: false,
      netCashDelta: 0,
      unlockedMultiplier: 1.0,
      event,
    };
  }

  public resolveSplitOrStealDecision(
    state: BoardRuntimeStateV6,
    playerChoice: 'SPLIT' | 'STEAL',
  ): SplitOrStealResultV6 {
    const showdown = this.pendingSplitOrSteal;
    const pot = showdown?.totalPotCash ?? this.splitOrStealPotCash;
    const vaultNodeId = showdown?.vaultNodeId ?? state.nodes[0]?.nodeId ?? '';

    // Rival decision: steals more often when trailing, splits more often when leading or screwed!
    const stealProb =
      this.rivalScrewedTurnsRemaining > 0
        ? 0.15
        : state.rivalTotalCash < state.playerTotalCash
          ? 0.65
          : 0.35;
    const rivalChoice: 'SPLIT' | 'STEAL' = this.rng() < stealProb ? 'STEAL' : 'SPLIT';

    let playerPayoutCash = 0;
    let rivalPayoutCash = 0;
    let multBonus = 0;
    let triggerTrapdoor = false;
    let banner = '';
    let sfx: FoleySfxIdV6 = 'vault_heavy_unlock';

    if (playerChoice === 'SPLIT' && rivalChoice === 'SPLIT') {
      playerPayoutCash = Math.round(pot * 0.6);
      rivalPayoutCash = Math.round(pot * 0.5);
      multBonus = 1.5;
      banner = `BOTH SPLIT! YOU POCKET $${playerPayoutCash} & +1.5x HONOR MULT!`;
      sfx = 'crowd_studio_roar';
    } else if (playerChoice === 'STEAL' && rivalChoice === 'SPLIT') {
      playerPayoutCash = pot;
      rivalPayoutCash = 0;
      multBonus = 1.0;
      banner = `HEIST COMPLETE! YOU STOLE THE ENTIRE $${pot} GOLDEN POT!`;
      sfx = 'vault_heavy_unlock';
    } else if (playerChoice === 'SPLIT' && rivalChoice === 'STEAL') {
      playerPayoutCash = 0;
      rivalPayoutCash = pot;
      multBonus = 0;
      banner = `BETRAYED! ${state.rivalName} STOLE THE $${pot} POT!`;
      sfx = 'crowd_collective_gasp';
    } else {
      // Double STEAL — Vault implodes!
      playerPayoutCash = 0;
      rivalPayoutCash = 0;
      triggerTrapdoor = true;
      banner = 'MUTUAL STEAL! VAULT IMPLODES INTO TRAPDOOR GAMBIT!';
      sfx = 'trapdoor_hinge_drop';
    }

    state.playerTotalCash += playerPayoutCash;
    state.rivalTotalCash += rivalPayoutCash;
    state.playerMult = Number((state.playerMult + multBonus).toFixed(2));
    this.splitOrStealPotCash = 400;

    if (this.pendingSplitOrSteal) {
      this.pendingSplitOrSteal = { ...this.pendingSplitOrSteal, resolved: true };
    }

    const event = this.makeEvent(
      'SPLIT_OR_STEAL_VAULT',
      'SPLIT_OR_STEAL',
      banner,
      sfx,
      vaultNodeId ? [vaultNodeId] : [],
      playerPayoutCash,
      multBonus,
      triggerTrapdoor,
    );

    return {
      playerChoice,
      rivalChoice,
      playerPayoutCash,
      rivalPayoutCash,
      multBonus,
      triggerTrapdoor,
      event,
    };
  }

  // --------------------------------------------------------------------------
  // End-of-Turn Contraption Physics & Active Mutation Ticks
  // --------------------------------------------------------------------------

  public advanceTurnAndApplyBoardPhysics(state: BoardRuntimeStateV6): TwistEventV6[] {
    const events: TwistEventV6[] = [];
    state.turnNumber += 1;

    if (this.rivalScrewedTurnsRemaining > 0) {
      this.rivalScrewedTurnsRemaining -= 1;
    }

    const blueprint = getBoardBlueprintB(state.definition.boardId);
    const overclockFactor = this.hasTwistActive(state, 'OVERCLOCK_DOUBLE_SPEED') ? 2 : 1;

    // 1. Check Halftime Stage-Siren Mutation!
    const halftimeEvt = this.evaluateHalftimeMutation(state);
    if (halftimeEvt) events.push(halftimeEvt);

    // 2. Rotary Ring / Ferris Wheel Mechanical Step
    if (blueprint?.supportsRingRotation || state.definition.mechanicArchetype === 'FERRIS_WHEEL') {
      const degStep = 30 * overclockFactor;
      state.ringRotationsDeg = [
        (state.ringRotationsDeg[0] + degStep) % 360,
        (state.ringRotationsDeg[1] - degStep * 0.5 + 360) % 360,
        (state.ringRotationsDeg[2] + degStep * 0.75) % 360,
      ];
      this.recomputeAlignedNodes(state);
    }

    // 3. Conveyor Belt / Tin-Duck Gallery Shift
    if (blueprint?.supportsConveyorShift) {
      this.conveyorShiftCount += overclockFactor;
      const shiftedIds: string[] = [];
      for (const nd of state.nodes) {
        if (nd.owner === 'NONE' && !this.frozenNodeIds.has(nd.nodeId)) {
          const dir = (nd.tierIndex ?? 0) % 2 === 0 ? 1 : -1;
          let nextX = nd.pos3d[0] + dir * 0.65 * overclockFactor;
          if (nextX > 3.1) {
            nextX = -2.8;
            // Crate dropped through smelter & refreshed as molten premium crate!
            nd.baseChips = Math.min(480, nd.baseChips + 40);
          } else if (nextX < -3.1) {
            nextX = 2.8;
          }
          nd.pos3d = [Number(nextX.toFixed(2)), nd.pos3d[1], nd.pos3d[2]];
          shiftedIds.push(nd.nodeId);
        }
      }
      if (shiftedIds.length > 0) {
        events.push(
          this.makeEvent(
            this.hasTwistActive(state, 'OVERCLOCK_DOUBLE_SPEED')
              ? 'OVERCLOCK_DOUBLE_SPEED'
              : state.activeTwist,
            'CONVEYOR_SHIFT',
            overclockFactor === 2
              ? 'OVERCLOCKED BELT! CRATES SURGED 2 NOTCHES!'
              : 'CONVEYOR ADVANCED 1 NOTCH TOWARD THE SMELTER!',
            'brass_gear_detent',
            shiftedIds,
            0,
            0,
          ),
        );
      }
    }

    // 4. Rising Flood Stage (submerges outer/lowest ring every 2 turns!)
    if (this.hasTwistActive(state, 'RISING_FLOOD_STAGE') && state.turnNumber % 2 === 0) {
      this.floodLevelIndex += 1;
      this.floodWaterLevelY = Number((-1.1 + this.floodLevelIndex * 0.42).toFixed(2));
      const newlySubmerged: string[] = [];
      const candidates = state.nodes
        .filter((nd) => nd.owner === 'NONE' && !this.submergedNodeIds.has(nd.nodeId) && !this.frozenNodeIds.has(nd.nodeId))
        .sort((a, b) => (b.ringIndex ?? 0) - (a.ringIndex ?? 0) || a.pos3d[1] - b.pos3d[1]);

      const maxToSubmerge = Math.max(0, Math.min(2, candidates.length - 3));
      for (let i = 0; i < maxToSubmerge; i++) {
        this.submergedNodeIds.add(candidates[i].nodeId);
        newlySubmerged.push(candidates[i].nodeId);
      }
      // Boost remaining dry summit nodes!
      for (const nd of state.nodes) {
        if (nd.owner === 'NONE' && !this.submergedNodeIds.has(nd.nodeId)) {
          nd.baseChips += 35;
        }
      }
      if (newlySubmerged.length > 0) {
        events.push(
          this.makeEvent(
            'RISING_FLOOD_STAGE',
            'FLOOD_SURGE',
            `TIDE RISING! ${newlySubmerged.length} OUTER TILES SUBMERGED — DRY TILES +35!`,
            'twist_siren_chime',
            newlySubmerged,
            0,
            0,
          ),
        );
      }
    }

    // 5. Chain-Fuse Detonation Countdown!
    if (this.hasTwistActive(state, 'CHAIN_FUSE_DETONATION')) {
      const toDetonate: string[] = [];
      this.fuseTimers.forEach((remaining, nid) => {
        if (this.frozenNodeIds.has(nid)) return;
        const nextVal = remaining - 1;
        if (nextVal <= 0) {
          toDetonate.push(nid);
        } else {
          this.fuseTimers.set(nid, nextVal);
        }
      });
      for (const nid of toDetonate) {
        events.push(this.detonateFuseNode(state, nid));
      }
      if (this.fuseTimers.size === 0) {
        this.igniteFreshFuse(state);
      }
    }

    // 6. Cursed Multiplier Decay!
    if (this.hasTwistActive(state, 'CURSED_MULTIPLIER_DECAY')) {
      const decayed: string[] = [];
      for (const nd of state.nodes) {
        if (nd.owner === 'NONE' && nd.multBonus > 0.1 && !this.frozenNodeIds.has(nd.nodeId)) {
          nd.multBonus = Number(Math.max(0.05, nd.multBonus - 0.25).toFixed(2));
          decayed.push(nd.nodeId);
        }
      }
      if (decayed.length > 0) {
        events.push(
          this.makeEvent(
            'CURSED_MULTIPLIER_DECAY',
            'TWIST_TICK',
            'HOURGLASS DRAIN! UNCLAIMED MULTIPLIERS ERODED -0.25x!',
            'clock_escapement_urgent',
            decayed,
            0,
            0,
          ),
        );
      }
    }

    // 7. Golden Bounty Relocation
    if (this.hasTwistActive(state, 'GOLDEN_BOUNTY_HUNT')) {
      this.relocateGoldenBounty(state);
    }

    // 8. Gravity Inversion Mid-Match Flip (every 3 turns!)
    if (this.hasTwistActive(state, 'GRAVITY_INVERSION') && state.turnNumber % 3 === 0) {
      this.gravityInverted = !this.gravityInverted;
      events.push(
        this.makeEvent(
          'GRAVITY_INVERSION',
          'GRAVITY_FLIP',
          this.gravityInverted
            ? 'ESCHER FLIP! BOARD INVERTED 180° — BASE TILES PAY APEX!'
            : 'GRAVITY RESTORED! BOARD RIGHTS ITSELF!',
          'twist_siren_chime',
          state.nodes.map((nd) => nd.nodeId),
          0,
          0,
        ),
      );
    }

    // 9. Rival Fog Jammer Refresh (if Rival isn't Screwed)
    if (this.hasTwistActive(state, 'RIVAL_FOG_JAMMER') && this.rivalScrewedTurnsRemaining === 0) {
      this.refreshFogJammer(state);
    }

    // 10. Recompute Laser Path
    if (this.hasTwistActive(state, 'RICOCHET_LASER_BONUS')) {
      this.recomputeLaserPath(state);
    }

    // 11. Zero-Soft-Lock Mathematical Guarantee!
    const emergencyEvt = this.ensurePlayableNodes(state);
    if (emergencyEvt) events.push(emergencyEvt);

    return events;
  }

  // --------------------------------------------------------------------------
  // Rival Screw Counter-Plays
  // --------------------------------------------------------------------------

  public executeRivalScrewCounterplay(
    state: BoardRuntimeStateV6,
    rivalAggression = 0.65,
  ): TwistEventV6 {
    if (this.rivalScrewedTurnsRemaining > 0) {
      return this.makeEvent(
        state.activeTwist,
        'RIVAL_SCREW',
        `${state.rivalName} IS JAMMED BY YOUR SCREW CARD!`,
        'ui_brass_tap',
        [],
        0,
        0,
      );
    }

    const targets = state.nodes
      .filter(
        (nd) =>
          nd.owner === 'NONE' &&
          !this.submergedNodeIds.has(nd.nodeId) &&
          !this.frozenNodeIds.has(nd.nodeId),
      )
      .sort((a, b) => b.baseChips - a.baseChips);

    if (targets.length === 0) {
      return this.makeEvent(
        state.activeTwist,
        'RIVAL_SCREW',
        `${state.rivalName} HOLDS POSITION!`,
        'ui_brass_tap',
        [],
        0,
        0,
      );
    }

    const target = targets[0];
    const roll = this.rng();

    if (roll < rivalAggression * 0.45 && targets.length > 2) {
      // Rival claims a prime tile
      target.owner = 'RIVAL';
      target.lockedChains = 0;
      const rivalGain = Math.round(target.baseChips * 1.15);
      state.rivalTotalCash += rivalGain;
      this.ensurePlayableNodes(state);
      return this.makeEvent(
        state.activeTwist,
        'RIVAL_SCREW',
        `${state.rivalName} SNATCHED ${target.categoryLabel} (+$${rivalGain})!`,
        'screw_rival_slam',
        [target.nodeId],
        0,
        0,
      );
    }

    if (roll < rivalAggression * 0.8) {
      // Rival clamps an iron chain lock onto top tile
      target.lockedChains += 1;
      this.ensurePlayableNodes(state);
      return this.makeEvent(
        state.activeTwist,
        'RIVAL_SCREW',
        `${state.rivalName} PADLOCKED ${target.categoryLabel}!`,
        'screw_rival_slam',
        [target.nodeId],
        0,
        0,
      );
    }

    // Rival lights a sudden spark fuse!
    target.hasTrapFuse = true;
    this.fuseTimers.set(target.nodeId, 2);
    return this.makeEvent(
      'CHAIN_FUSE_DETONATION',
      'RIVAL_SCREW',
      `${state.rivalName} RIGGED A 2-TURN FUSE ON ${target.categoryLabel}!`,
      'nixie_spark_crackle',
      [target.nodeId],
      0,
      0,
    );
  }

  // --------------------------------------------------------------------------
  // Foil Trick Card Counter-Play Engine (All 9 FoilTrickCardV6 Kinds!)
  // --------------------------------------------------------------------------

  public applyFoilTrickCard(
    state: BoardRuntimeStateV6,
    card: FoilTrickCardV6,
    targetNodeId?: string,
  ): FoilCardOutcomeV6 {
    const targetNode =
      (targetNodeId ? state.nodes.find((nd) => nd.nodeId === targetNodeId) : undefined) ??
      state.nodes.find((nd) => nd.owner === 'NONE' && !this.submergedNodeIds.has(nd.nodeId));

    const affected: string[] = [];
    let summary = '';
    let cashDelta = 0;
    let multDelta = 0;
    let sfx: FoleySfxIdV6 = 'foil_card_flick';

    switch (card.effectKind) {
      case 'FREEZE_NODE': {
        if (targetNode) {
          this.frozenNodeIds.add(targetNode.nodeId);
          this.submergedNodeIds.delete(targetNode.nodeId);
          affected.push(targetNode.nodeId);
          summary = `FROZE ${targetNode.categoryLabel} — IMMUNE TO DECAY, FLOODS & RIVAL STEALS!`;
          sfx = 'crystal_hex_claim';
        }
        break;
      }

      case 'DOUBLE_MULT': {
        this.nextClaimMultBoost = Number((this.nextClaimMultBoost * 2).toFixed(2));
        multDelta = 0.5;
        state.playerMult = Number((state.playerMult + 0.5).toFixed(2));
        summary = `FOIL OVERDRIVE! NEXT CLAIM PAYS x${this.nextClaimMultBoost} CHIPS (+0.5x MULT)!`;
        sfx = 'streak_chord_3';
        break;
      }

      case 'SCREW_RIVAL': {
        this.rivalScrewedTurnsRemaining += 2;
        this.jammedNodeIds.clear();
        const penalty = Math.min(state.rivalTotalCash, 225);
        state.rivalTotalCash -= penalty;
        cashDelta = 150;
        state.playerTotalCash += cashDelta;
        summary = `SCREWED ${state.rivalName}! JAMMED 2 TURNS, CLEARED FOG & +$150!`;
        sfx = 'screw_rival_slam';
        break;
      }

      case 'ROTATE_RING_FREE': {
        state.ringRotationsDeg = [
          (state.ringRotationsDeg[0] + 60) % 360,
          (state.ringRotationsDeg[1] + 60) % 360,
          (state.ringRotationsDeg[2] + 60) % 360,
        ];
        this.recomputeAlignedNodes(state);
        this.recomputeLaserPath(state);
        affected.push(...state.alignedNodeIds);
        summary = `MANUAL CRANK +60°! ${state.alignedNodeIds.length} NODES SNAPPED INTO ALIGNMENT!`;
        sfx = 'brass_gear_detent';
        break;
      }

      case 'SHATTER_CHAINS': {
        const chained = targetNode && targetNode.lockedChains > 0
          ? [targetNode]
          : state.nodes.filter((nd) => nd.lockedChains > 0).slice(0, 3);
        for (const nd of chained) {
          nd.lockedChains = 0;
          if (nd.owner === 'LOCKED_VAULT') nd.owner = 'NONE';
          affected.push(nd.nodeId);
        }
        summary =
          affected.length > 0
            ? `SHATTERED IRON CHAINS ON ${affected.length} VAULT NODE(S)!`
            : 'NO CHAINS FOUND — GAINED +0.35x MOMENTUM INSTEAD!';
        if (affected.length === 0) {
          multDelta = 0.35;
          state.playerMult = Number((state.playerMult + 0.35).toFixed(2));
        }
        sfx = 'iron_chain_shatter';
        break;
      }

      case 'REVEAL_MOLE': {
        const moles = state.nodes.filter((nd) => nd.isDoubleAgentMole);
        for (const m of moles) {
          this.revealedMoleNodeIds.add(m.nodeId);
          this.moleTellIntensity.set(m.nodeId, 1.0);
          affected.push(m.nodeId);
        }
        this.jammedNodeIds.clear();
        if (this.hasTwistActive(state, 'BLACKOUT_SPOTLIGHT')) {
          this.spotlightRadius = 4.2; // Floodlight sweep!
        }
        summary =
          moles.length > 0
            ? `UNMASKED ${moles.length} DOUBLE-AGENT MOLE(S)! CLAIM FOR +300 BOUNTY!`
            : 'FLOODLIGHTS FLASHED! ALL HIDDEN STATIC CLEARED!';
        sfx = 'optical_beam_lock';
        break;
      }

      case 'DEFUSE_ONE_WIRE': {
        const fusedNode =
          (targetNode && (targetNode.hasTrapFuse || this.fuseTimers.has(targetNode.nodeId))
            ? targetNode
            : state.nodes.find((nd) => nd.hasTrapFuse || this.fuseTimers.has(nd.nodeId))) ?? null;
        if (fusedNode) {
          fusedNode.hasTrapFuse = false;
          this.fuseTimers.delete(fusedNode.nodeId);
          affected.push(fusedNode.nodeId);
          cashDelta = 200;
          state.playerTotalCash += cashDelta;
          summary = `SNIPPED LIVE FUSE ON ${fusedNode.categoryLabel}! +$200 BOMB-SQUAD PAYOUT!`;
          sfx = 'wire_cutter_snip';
        } else if (this.hazardNodeIds.size > 0) {
          const hzId = Array.from(this.hazardNodeIds)[0];
          this.hazardNodeIds.delete(hzId);
          affected.push(hzId);
          cashDelta = 150;
          state.playerTotalCash += cashDelta;
          summary = 'DISARMED TRAPDOOR FLOOR BOLTS! +$150 SAFETY BONUS!';
          sfx = 'wire_cutter_snip';
        } else {
          cashDelta = 100;
          state.playerTotalCash += cashDelta;
          summary = 'NO LIVE FUSES — SALVAGED +$100 COPPER WIRE!';
          sfx = 'wire_cutter_snip';
        }
        break;
      }

      case 'STEAL_RIVAL_POT': {
        const stolen = Math.min(state.rivalTotalCash, Math.max(150, Math.round(state.rivalTotalCash * 0.25)));
        state.rivalTotalCash -= stolen;
        state.playerTotalCash += stolen;
        cashDelta = stolen;
        this.splitOrStealPotCash += 150;
        summary = `SIPHONED $${stolen} STRAIGHT FROM ${state.rivalName}'S BANKROLL!`;
        sfx = 'chip_stack_riffle';
        break;
      }

      case 'SWAP_CLUE_TOY': {
        if (targetNode) {
          const nextDomain = (targetNode.domainId + 3) % 12;
          targetNode.domainId = nextDomain;
          targetNode.categoryLabel = DOMAIN_LABELS_V6[nextDomain] ?? 'WILD CARD';
          targetNode.difficultyOffset = Math.max(-0.5, Number((targetNode.difficultyOffset - 0.5).toFixed(2)));
          affected.push(targetNode.nodeId);
          summary = `REWIRED TILE TO ${targetNode.categoryLabel} (EASIER CLUE CURVE)!`;
          sfx = 'foil_card_flick';
        }
        break;
      }
    }

    this.ensurePlayableNodes(state);

    const event = this.makeEvent(
      state.activeTwist,
      'FOIL_PLAYED',
      `${card.name.toUpperCase()}: ${summary}`,
      sfx,
      affected,
      cashDelta,
      multDelta,
    );

    return {
      applied: true,
      card,
      summary,
      affectedNodeIds: affected,
      cashDelta,
      multDelta,
      event,
    };
  }

  // --------------------------------------------------------------------------
  // Zero-Soft-Lock Invariant Guarantee
  // --------------------------------------------------------------------------

  public ensurePlayableNodes(state: BoardRuntimeStateV6): TwistEventV6 | null {
    const remainingNone = state.nodes.filter((nd) => nd.owner === 'NONE' || nd.owner === 'LOCKED_VAULT');
    if (remainingNone.length === 0) return null;

    const currentlyPlayable = remainingNone.filter((nd) => this.isNodePlayable(state, nd.nodeId).playable);
    const required = Math.min(2, remainingNone.length);
    if (currentlyPlayable.length >= required) return null;

    const rescued: string[] = [];
    for (const nd of remainingNone) {
      if (this.isNodePlayable(state, nd.nodeId).playable) continue;
      nd.lockedChains = 0;
      if (nd.owner === 'LOCKED_VAULT') nd.owner = 'NONE';
      this.submergedNodeIds.delete(nd.nodeId);
      if (this.hasTwistActive(state, 'BLACKOUT_SPOTLIGHT')) {
        this.spotlightTarget3d = [nd.pos3d[0], 0, nd.pos3d[2]];
      }
      rescued.push(nd.nodeId);
      const countNow = remainingNone.filter((x) => this.isNodePlayable(state, x.nodeId).playable).length;
      if (countNow >= required) break;
    }

    return this.makeEvent(
      state.activeTwist,
      'EMERGENCY_UNCHAIN',
      'STAGE SURGE! EMERGENCY SAFETY BREAKERS UNLOCKED PLAYABLE TILES!',
      'iron_chain_shatter',
      rescued,
      0,
      0,
    );
  }

  // --------------------------------------------------------------------------
  // Internal Twist Configuration & Geometry Helpers
  // --------------------------------------------------------------------------

  private configureTwistState(state: BoardRuntimeStateV6, twist: BoardTwistMutationIdV6): void {
    const blueprint = getBoardBlueprintB(state.definition.boardId);

    // Build entangled pairs whenever board supports it OR MIRROR_TWIN_LINK is active
    if (
      (twist === 'MIRROR_TWIN_LINK' || blueprint?.supportsEntangledPairs) &&
      this.entangledPairs.length === 0
    ) {
      const n = state.nodes.length;
      const half = Math.floor(n / 2);
      for (let i = 0; i < half; i++) {
        this.entangledPairs.push([state.nodes[i].nodeId, state.nodes[i + half].nodeId]);
      }
    }

    switch (twist) {
      case 'BLACKOUT_SPOTLIGHT': {
        const firstOpen = state.nodes.find((nd) => nd.owner === 'NONE' && nd.lockedChains === 0);
        if (firstOpen) {
          this.spotlightTarget3d = [firstOpen.pos3d[0], 0, firstOpen.pos3d[2]];
        }
        this.spotlightRadius = 2.25;
        break;
      }

      case 'GRAVITY_INVERSION': {
        this.gravityInverted = true;
        break;
      }

      case 'HOST_BLIND_AUCTION': {
        const pool = state.nodes.filter((nd) => nd.owner === 'NONE' && !nd.isMysteryAuction);
        for (const nd of pool.slice(0, 2)) {
          nd.isMysteryAuction = true;
        }
        break;
      }

      case 'CHAIN_FUSE_DETONATION': {
        for (const nd of state.nodes) {
          if (nd.hasTrapFuse && !this.fuseTimers.has(nd.nodeId)) {
            this.fuseTimers.set(nd.nodeId, 2);
          }
        }
        if (this.fuseTimers.size === 0) {
          this.igniteFreshFuse(state);
          this.igniteFreshFuse(state);
        }
        break;
      }

      case 'RISING_FLOOD_STAGE': {
        this.floodWaterLevelY = -1.05;
        break;
      }

      case 'DOUBLE_AGENT_MOLE': {
        let moleCount = state.nodes.filter((nd) => nd.isDoubleAgentMole).length;
        const pool = state.nodes
          .filter((nd) => nd.owner === 'NONE' && !nd.isDoubleAgentMole)
          .sort((a, b) => b.baseChips - a.baseChips);
        while (moleCount < 2 && pool.length > 2) {
          const picked = pool.shift();
          if (picked) {
            picked.isDoubleAgentMole = true;
            picked.baseChips = Math.max(picked.baseChips, 340);
            moleCount += 1;
          }
        }
        for (const nd of state.nodes) {
          if (nd.isDoubleAgentMole) {
            // Subtle readable 3D wobble tell!
            this.moleTellIntensity.set(nd.nodeId, 0.35 + this.rng() * 0.25);
          }
        }
        break;
      }

      case 'GOLDEN_BOUNTY_HUNT': {
        this.relocateGoldenBounty(state);
        break;
      }

      case 'SUDDEN_TRAPDOOR_HAZARD': {
        const pool = state.nodes.filter((nd) => nd.owner === 'NONE');
        for (const nd of pool.slice(0, 2)) {
          this.hazardNodeIds.add(nd.nodeId);
        }
        break;
      }

      case 'RIVAL_FOG_JAMMER': {
        this.refreshFogJammer(state);
        break;
      }

      case 'RICOCHET_LASER_BONUS': {
        this.recomputeLaserPath(state);
        break;
      }

      case 'SPLIT_OR_STEAL_VAULT': {
        this.splitOrStealPotCash = Math.max(this.splitOrStealPotCash, 750);
        break;
      }

      case 'HIGH_VOLTAGE_CHAIN':
      case 'MAGNETIC_REPULSOR':
      case 'CURSED_MULTIPLIER_DECAY':
      case 'OVERCLOCK_DOUBLE_SPEED':
      case 'MIRROR_TWIN_LINK':
      case 'NONE':
        break;
    }
  }

  private isNodeInsideSpotlight(node: BoardNodeV6): boolean {
    const dx = node.pos3d[0] - this.spotlightTarget3d[0];
    const dz = node.pos3d[2] - this.spotlightTarget3d[2];
    return Math.hypot(dx, dz) <= this.spotlightRadius;
  }

  private findEntangledTwin(nodeId: string): string | null {
    for (const [a, b] of this.entangledPairs) {
      if (a === nodeId) return b;
      if (b === nodeId) return a;
    }
    return null;
  }

  private igniteFreshFuse(state: BoardRuntimeStateV6): void {
    const candidates = state.nodes.filter(
      (nd) =>
        nd.owner === 'NONE' &&
        !this.submergedNodeIds.has(nd.nodeId) &&
        !this.fuseTimers.has(nd.nodeId) &&
        !this.frozenNodeIds.has(nd.nodeId),
    );
    if (candidates.length === 0) return;
    const picked = candidates[Math.floor(this.rng() * candidates.length)];
    picked.hasTrapFuse = true;
    this.fuseTimers.set(picked.nodeId, 2);
  }

  private detonateFuseNode(state: BoardRuntimeStateV6, nodeId: string): TwistEventV6 {
    this.fuseTimers.delete(nodeId);
    const node = state.nodes.find((nd) => nd.nodeId === nodeId);
    const affected: string[] = [nodeId];
    if (node) {
      node.hasTrapFuse = false;
      for (const nbId of node.neighbors) {
        const nb = state.nodes.find((x) => x.nodeId === nbId);
        if (nb && nb.owner === 'NONE' && !this.frozenNodeIds.has(nb.nodeId)) {
          nb.lockedChains = Math.min(2, nb.lockedChains + 1);
          affected.push(nb.nodeId);
        }
      }
    }
    return this.makeEvent(
      'CHAIN_FUSE_DETONATION',
      'FUSE_DETONATED',
      'CHAIN-BOMB DETONATION! NEIGHBORS CLAMPED IN IRON CHAINS!',
      'screw_rival_slam',
      affected,
      0,
      0,
    );
  }

  private relocateGoldenBounty(state: BoardRuntimeStateV6): void {
    const open = state.nodes.filter(
      (nd) =>
        nd.owner === 'NONE' &&
        !this.submergedNodeIds.has(nd.nodeId) &&
        nd.nodeId !== this.bountyNodeId,
    );
    if (open.length === 0) {
      this.bountyNodeId = null;
      return;
    }
    const picked = open[Math.floor(this.rng() * open.length)];
    this.bountyNodeId = picked.nodeId;
  }

  private refreshFogJammer(state: BoardRuntimeStateV6): void {
    this.jammedNodeIds.clear();
    const candidates = state.nodes
      .filter((nd) => nd.owner === 'NONE' && !this.frozenNodeIds.has(nd.nodeId))
      .sort((a, b) => b.baseChips - a.baseChips);
    for (const nd of candidates.slice(0, Math.min(2, Math.max(0, candidates.length - 2)))) {
      this.jammedNodeIds.add(nd.nodeId);
    }
  }

  private recomputeLaserPath(state: BoardRuntimeStateV6): void {
    const open = state.nodes.filter(
      (nd) => nd.owner === 'NONE' && !this.submergedNodeIds.has(nd.nodeId),
    );
    if (open.length === 0) {
      this.laserPathNodeIds = [];
      return;
    }
    const start = open[Math.floor((state.ringRotationsDeg[0] / 360) * open.length) % open.length];
    const path: string[] = [start.nodeId];
    let curr = start;
    for (let hop = 0; hop < 2; hop++) {
      const next = curr.neighbors
        .map((nid) => state.nodes.find((x) => x.nodeId === nid))
        .find((nb) => nb && nb.owner === 'NONE' && !path.includes(nb.nodeId));
      if (!next) break;
      path.push(next.nodeId);
      curr = next;
    }
    this.laserPathNodeIds = path;
  }

  private recomputeAlignedNodes(state: BoardRuntimeStateV6): void {
    const rotRad = (state.ringRotationsDeg[0] * Math.PI) / 180;
    const beamDirX = Math.cos(rotRad);
    const beamDirZ = Math.sin(rotRad);
    const scored = state.nodes
      .filter((nd) => nd.owner === 'NONE' || nd.owner === 'LOCKED_VAULT')
      .map((nd) => {
        const len = Math.hypot(nd.pos3d[0], nd.pos3d[2]) || 1;
        const align = Math.abs((nd.pos3d[0] / len) * beamDirX + (nd.pos3d[2] / len) * beamDirZ);
        return { nodeId: nd.nodeId, align };
      })
      .sort((a, b) => b.align - a.align);
    state.alignedNodeIds = scored.slice(0, 3).map((s) => s.nodeId);
  }

  private findConnectedOwnedCluster(
    state: BoardRuntimeStateV6,
    startNodeId: string,
    owner: 'PLAYER' | 'RIVAL',
  ): string[] {
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      const nd = state.nodes.find((x) => x.nodeId === currId);
      if (!nd || nd.owner !== owner) continue;
      visited.add(currId);
      for (const nbId of nd.neighbors) {
        if (!visited.has(nbId)) queue.push(nbId);
      }
    }
    return Array.from(visited);
  }

  private makeEvent(
    twistId: BoardTwistMutationIdV6,
    kind: TwistEventV6['kind'],
    bannerText: string,
    sfx: FoleySfxIdV6,
    affectedNodeIds: string[],
    chipDelta: number,
    multDelta: number,
    triggerTrapdoor = false,
  ): TwistEventV6 {
    this.eventSeq += 1;
    return {
      eventId: `twist_evt_${this.eventSeq}`,
      twistId,
      kind,
      bannerText,
      sfx,
      affectedNodeIds,
      chipDelta,
      multDelta,
      triggerTrapdoor,
    };
  }
}
