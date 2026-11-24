// ============================================================================
// WORLD'S SMARTEST v6.0 — 3D Game-Board Contraption Renderer A (Boards 001–050)
// Pure Three.js 0.172 WebGL2 PBR scene builder, interactive Raycaster controller,
// StageAtmosphereThemeV6 material adapter, and deterministic turn-physics resolver
// for Families I–V:
//   I.   CLOCKWORK_ROTARY     — Extruded involute brass gears + x3 ruby laser
//   II.  TURF_WAR_BRIDGES     — Beveled crystal hexes + shatterable 3D iron chains
//   III. GRAVITY_PHYSICS      — Chrome steel pinball, toppling 3D dominoes, scales
//   IV.  CASINO_PUSH_LUCK     — Emerald baize felt, 3D chip towers, Blackjack 21,
//                               European roulette rotor, 3-shell Bezier cups
//   V.   STEALTH_OPTICS_RADAR — Rotatable 45° laser mirror raycaster, RGB crystal
//                               prism, custom GLSL phosphor sonar sweep, Nixie rack
// ============================================================================

import * as THREE from 'three';
import type {
  BoardFamilyIdV6,
  BoardNodeV6,
  BoardRuntimeStateV6,
  FoleySfxIdV6,
  StageAtmosphereThemeV6,
} from '../contracts_v6';
import {
  CORPUS_DOMAINS_V6,
  getBoardContraptionSpecA,
  type BoardContraptionSpecA,
} from './BoardCatalog001To050';

// ----------------------------------------------------------------------------
// 1. Public Interactive & Turn-Physics Types
// ----------------------------------------------------------------------------
export interface BoardRaycastHitA {
  readonly kind: 'NODE' | 'MIRROR_TURRET' | 'ROULETTE_WHEEL' | 'SHELL_CUP' | 'AUCTION_GAVEL';
  readonly nodeId?: string;
  readonly nodeIndex?: number;
  readonly worldPoint: [number, number, number];
  readonly lockedChains: number;
}

export interface BoardInteractionCallbacksA {
  readonly onNodeHover?: (hit: BoardRaycastHitA | null) => void;
  readonly onNodeSelect?: (node: BoardNodeV6, hit: BoardRaycastHitA) => void;
  readonly onMirrorRotated?: (nodeId: string, newAngleDeg: number, trace: LaserTraceResultA) => void;
  readonly onFoleyCue?: (sfx: FoleySfxIdV6) => void;
}

export interface LaserSegmentA {
  readonly from: [number, number];
  readonly to: [number, number];
  readonly colorHex: number;
}

export interface LaserTraceResultA {
  readonly segments: readonly LaserSegmentA[];
  readonly illuminatedNodeIds: readonly string[];
  readonly bounceCount: number;
  readonly opticalMultBonus: number;
}

export interface PinballSimResultA {
  readonly pathPoints: readonly [number, number, number][];
  readonly bumperHits: number;
  readonly bonusChips: number;
  readonly targetNodeId: string;
}

export interface ContraptionSideStateA {
  blackjackHandTotal: number;
  blackjackBustCount: number;
  roulettePocketNumber: number;
  rouletteSector: 'RED' | 'BLACK' | 'ZERO';
  shellPearlCupIndex: number;
  crapsPoint: number;
  tugRopeNotch: number;              // -3 (Rival) .. +3 (Player)
  scaleLeftGrams: number;
  scaleRightGrams: number;
  pendulumPhaseRad: number;
  sonarAngleRad: number;
  mirrorAnglesDeg: Record<string, number>;
  minesweeperRevealedCounts: Record<string, number>;
  ladderRung: number;
  pokerCollectedCards: string[];
  curtainChargeByNodeId: Record<string, number>;
  toppledDominoIds: string[];
}

export interface BoardTurnActionA {
  readonly actor: 'PLAYER' | 'RIVAL';
  readonly nodeId: string;
  readonly solvedCorrectly: boolean;
  readonly baseAccuracy01?: number;
  readonly standAndBank?: boolean;   // For Blackjack 21 / Bank-or-Bust Ladder
}

export interface BoardTurnResolutionA {
  readonly state: BoardRuntimeStateV6;
  readonly sideState: ContraptionSideStateA;
  readonly chipsAwarded: number;
  readonly multDelta: number;
  readonly triggeredTrapdoor: boolean;
  readonly winConditionMet: boolean;
  readonly winHeadline: string | null;
  readonly bonusCallouts: readonly string[];
  readonly sfxCues: readonly FoleySfxIdV6[];
  readonly flippedNodeIds: readonly string[];
  readonly brokenChainNodeIds: readonly string[];
  readonly toppledNodeIds: readonly string[];
  readonly laserTrace?: LaserTraceResultA;
  readonly pinballResult?: PinballSimResultA;
}

// ----------------------------------------------------------------------------
// 2. Deterministic Contraption Side-State & Pure Turn-Physics Resolver
//    (Works identically in headless Node tests AND live WebGL2 sessions!)
// ----------------------------------------------------------------------------
export function createInitialContraptionSideStateA(
  state: BoardRuntimeStateV6
): ContraptionSideStateA {
  const spec = getBoardContraptionSpecA(state.definition.boardId);
  const mirrorAnglesDeg: Record<string, number> = {};
  if (spec?.stealth?.mirrorNodeIndices) {
    spec.stealth.mirrorNodeIndices.forEach((nodeIdx, i) => {
      const node = state.nodes[nodeIdx];
      if (node) {
        mirrorAnglesDeg[node.nodeId] = spec.stealth?.initialMirrorAnglesDeg?.[i] ?? 45;
      }
    });
  }
  return {
    blackjackHandTotal: 0,
    blackjackBustCount: 0,
    roulettePocketNumber: 17,
    rouletteSector: 'BLACK',
    shellPearlCupIndex: 1,
    crapsPoint: 6,
    tugRopeNotch: 0,
    scaleLeftGrams: 0,
    scaleRightGrams: 0,
    pendulumPhaseRad: 0,
    sonarAngleRad: 0,
    mirrorAnglesDeg,
    minesweeperRevealedCounts: {},
    ladderRung: 0,
    pokerCollectedCards: [],
    curtainChargeByNodeId: {},
    toppledDominoIds: [],
  };
}

/**
 * Pure 2D/3D optical raycaster for Family V (Laser Mirror Vault & Prism Rainbow Splitter).
 * Reflects a collimated laser beam across rotatable 45° mirror turrets and records every
 * vault pierced along each bounce segment.
 */
export function computeLaserTraceA(
  state: BoardRuntimeStateV6,
  mirrorAnglesDeg: Readonly<Record<string, number>>
): LaserTraceResultA {
  const spec = getBoardContraptionSpecA(state.definition.boardId);
  const st = spec?.stealth;
  if (!st) {
    return { segments: [], illuminatedNodeIds: [], bounceCount: 0, opticalMultBonus: 0 };
  }

  const mirrorSet = new Set(st.mirrorNodeIndices ?? []);
  const segments: LaserSegmentA[] = [];
  const illuminated = new Set<string>();
  let bounceCount = 0;

  // Special case: Prism Rainbow Splitter (3 dispersed spectral rays from node 0!)
  if (st.opticsKind === 'PRISM_SPLITTER' && state.nodes.length > 0) {
    const prismNode = state.nodes[0];
    const [px, , pz] = prismNode.pos3d;
    const baseAngleRad = ((mirrorAnglesDeg[prismNode.nodeId] ?? 0) * Math.PI) / 180;
    segments.push({
      from: [st.emitterPos[0], st.emitterPos[1]],
      to: [px, pz],
      colorHex: 0xffffff,
    });
    illuminated.add(prismNode.nodeId);

    const spectralRays: ReadonlyArray<{ offsetRad: number; colorHex: number }> = [
      { offsetRad: -0.38, colorHex: 0xff3b5c },
      { offsetRad: 0.0, colorHex: 0x3ef095 },
      { offsetRad: 0.38, colorHex: 0x4ca8ff },
    ];
    for (const ray of spectralRays) {
      const ang = baseAngleRad + ray.offsetRad;
      const dx = Math.cos(ang);
      const dz = Math.sin(ang);
      const endX = px + dx * 3.1;
      const endZ = pz + dz * 3.1;
      segments.push({ from: [px, pz], to: [endX, endZ], colorHex: ray.colorHex });
      for (let i = 1; i < state.nodes.length; i++) {
        const n = state.nodes[i];
        const rx = n.pos3d[0] - px;
        const rz = n.pos3d[2] - pz;
        const proj = rx * dx + rz * dz;
        if (proj > 0.15 && proj < 3.15) {
          const perp = Math.abs(rx * -dz + rz * dx);
          if (perp <= 0.42) {
            illuminated.add(n.nodeId);
            bounceCount++;
          }
        }
      }
    }
    return {
      segments,
      illuminatedNodeIds: Array.from(illuminated),
      bounceCount,
      opticalMultBonus: Number(Math.min(2.5, illuminated.size * 0.35).toFixed(2)),
    };
  }

  // Iterative reflective raycast across rotatable 45° mirror turrets (up to 7 bounces)
  let ox = st.emitterPos[0];
  let oz = st.emitterPos[1];
  let dx = st.emitterDir[0];
  let dz = st.emitterDir[1];
  const dLen = Math.hypot(dx, dz) || 1;
  dx /= dLen;
  dz /= dLen;

  let lastMirrorId: string | null = null;
  const maxSteps = 7;
  const beamColor = spec.definition.accentPalette.gemHex;

  for (let step = 0; step < maxSteps; step++) {
    let bestMirrorT = Infinity;
    let hitMirrorNode: BoardNodeV6 | null = null;

    // Intersect ray with mirror turrets (radius 0.38)
    for (const node of state.nodes) {
      if (!mirrorSet.has(node.index) || node.nodeId === lastMirrorId) continue;
      const vx = node.pos3d[0] - ox;
      const vz = node.pos3d[2] - oz;
      const t = vx * dx + vz * dz;
      if (t <= 0.18) continue;
      const perpSq = vx * vx + vz * vz - t * t;
      if (perpSq <= 0.38 * 0.38 && t < bestMirrorT) {
        bestMirrorT = t;
        hitMirrorNode = node;
      }
    }

    const segDist = hitMirrorNode ? bestMirrorT : 4.6;
    const ex = hitMirrorNode ? hitMirrorNode.pos3d[0] : ox + dx * segDist;
    const ez = hitMirrorNode ? hitMirrorNode.pos3d[2] : oz + dz * segDist;
    segments.push({ from: [ox, oz], to: [ex, ez], colorHex: beamColor });

    // Record all vault nodes pierced along this segment
    for (const node of state.nodes) {
      const vx = node.pos3d[0] - ox;
      const vz = node.pos3d[2] - oz;
      const t = vx * dx + vz * dz;
      if (t >= 0.05 && t <= segDist + 0.1) {
        const perpSq = vx * vx + vz * vz - t * t;
        if (perpSq <= 0.44 * 0.44) {
          illuminated.add(node.nodeId);
        }
      }
    }

    if (!hitMirrorNode) break;
    bounceCount++;
    lastMirrorId = hitMirrorNode.nodeId;

    // Reflect ray across mirror normal: angleDeg defines mirror surface angle
    const surfRad = ((mirrorAnglesDeg[hitMirrorNode.nodeId] ?? 45) * Math.PI) / 180;
    const nx = -Math.sin(surfRad);
    const nz = Math.cos(surfRad);
    const dot = dx * nx + dz * nz;
    dx = dx - 2 * dot * nx;
    dz = dz - 2 * dot * nz;
    const len = Math.hypot(dx, dz) || 1;
    dx /= len;
    dz /= len;
    ox = ex;
    oz = ez;
  }

  return {
    segments,
    illuminatedNodeIds: Array.from(illuminated),
    bounceCount,
    opticalMultBonus: Number((bounceCount * st.bounceMultDelta).toFixed(2)),
  };
}

/**
 * Deterministic pinball/pachinko/plinko elastic multi-bumper trajectory simulator.
 */
export function simulatePinballDropA(
  state: BoardRuntimeStateV6,
  targetNodeId: string
): PinballSimResultA {
  const spec = getBoardContraptionSpecA(state.definition.boardId);
  const target = state.nodes.find((n) => n.nodeId === targetNodeId) ?? state.nodes[0];
  const bumpers = spec?.gravity?.bumperPositions ?? [
    [-0.9, -0.6],
    [0, -0.8],
    [0.9, -0.6],
  ];
  const tiltRad = ((spec?.gravity?.tiltDeg ?? 9) * Math.PI) / 180;
  const heightAtZ = (z: number) => 0.42 - z * Math.sin(tiltRad);

  const pts: [number, number, number][] = [];
  // Plunger launch lane along right edge up to top arch
  pts.push([2.05, heightAtZ(1.45), 1.45]);
  pts.push([2.05, heightAtZ(-1.35), -1.35]);
  pts.push([0.35 * target.pos3d[0], heightAtZ(-1.55), -1.55]);

  // Sort 3 nearest bumpers along descent toward target so the ball visually ricochets cleanly!
  const sortedBumpers = [...bumpers]
    .sort((a, b) => {
      const da = Math.hypot(a[0] - target.pos3d[0], a[1] - target.pos3d[2]);
      const db = Math.hypot(b[0] - target.pos3d[0], b[1] - target.pos3d[2]);
      return da - db;
    })
    .slice(0, Math.min(3, bumpers.length));

  let bumperHits = 0;
  for (const [bx, bz] of sortedBumpers) {
    // Approach shoulder of bumper and deflect toward next point
    const deflectX = bx + (target.pos3d[0] >= bx ? 0.24 : -0.24);
    const deflectZ = bz + 0.18;
    pts.push([bx, heightAtZ(bz) + 0.08, bz]);
    pts.push([deflectX, heightAtZ(deflectZ), deflectZ]);
    bumperHits++;
  }

  pts.push([target.pos3d[0], target.pos3d[1] + 0.18, target.pos3d[2]]);
  return {
    pathPoints: pts,
    bumperHits,
    bonusChips: bumperHits * 75,
    targetNodeId: target.nodeId,
  };
}

function checkWestToEastBridge(
  nodes: readonly BoardNodeV6[],
  owner: 'PLAYER' | 'RIVAL',
  westIndices: readonly number[],
  eastIndices: readonly number[]
): boolean {
  const byId = new Map<string, BoardNodeV6>();
  nodes.forEach((n) => byId.set(n.nodeId, n));
  const eastSet = new Set(eastIndices.map((idx) => nodes[idx]?.nodeId).filter(Boolean));
  const visited = new Set<string>();
  const queue: BoardNodeV6[] = [];

  for (const idx of westIndices) {
    const start = nodes[idx];
    if (start && start.owner === owner) {
      visited.add(start.nodeId);
      queue.push(start);
    }
  }
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (eastSet.has(cur.nodeId)) return true;
    for (const nbId of cur.neighbors) {
      if (visited.has(nbId)) continue;
      const nb = byId.get(nbId);
      if (nb && nb.owner === owner) {
        visited.add(nbId);
        queue.push(nb);
      }
    }
  }
  return false;
}

function computeAlignedClockworkNodes(
  nodes: readonly BoardNodeV6[],
  ringRotationsDeg: readonly [number, number, number]
): string[] {
  // Check which nodes align near the 12-o'clock meridian (-Z axis, angle -90 deg)
  const byRing = new Map<number, string[]>();
  for (const n of nodes) {
    const r = n.ringIndex ?? 0;
    const rotRad = ((ringRotationsDeg[r] ?? 0) * Math.PI) / 180;
    const rx = n.pos3d[0] * Math.cos(rotRad) - n.pos3d[2] * Math.sin(rotRad);
    const rz = n.pos3d[0] * Math.sin(rotRad) + n.pos3d[2] * Math.cos(rotRad);
    const distFromOrigin = Math.hypot(rx, rz);
    if (distFromOrigin < 0.08 || (rz < 0 && Math.abs(rx) <= 0.38)) {
      const list = byRing.get(r) ?? [];
      list.push(n.nodeId);
      byRing.set(r, list);
    }
  }
  const aligned: string[] = [];
  if (byRing.size >= 2) {
    for (const ids of byRing.values()) aligned.push(...ids);
  }
  return aligned;
}

/**
 * Pure deterministic turn-physics resolver for all 50 contraptions (Families I–V).
 * Never mutates caller input arrays/objects in-place; returns clean next state + VFX/SFX cues.
 */
export function resolveContraptionTurnA(
  prevState: BoardRuntimeStateV6,
  prevSide: ContraptionSideStateA,
  action: BoardTurnActionA
): BoardTurnResolutionA {
  const spec = getBoardContraptionSpecA(prevState.definition.boardId);
  const nextNodes: BoardNodeV6[] = prevState.nodes.map((n) => ({ ...n, neighbors: [...n.neighbors] }));
  const nextSide: ContraptionSideStateA = {
    ...prevSide,
    mirrorAnglesDeg: { ...prevSide.mirrorAnglesDeg },
    minesweeperRevealedCounts: { ...prevSide.minesweeperRevealedCounts },
    pokerCollectedCards: [...prevSide.pokerCollectedCards],
    curtainChargeByNodeId: { ...prevSide.curtainChargeByNodeId },
    toppledDominoIds: [...prevSide.toppledDominoIds],
  };

  const target = nextNodes.find((n) => n.nodeId === action.nodeId);
  const sfxCues: FoleySfxIdV6[] = [];
  const bonusCallouts: string[] = [];
  const flippedNodeIds: string[] = [];
  const brokenChainNodeIds: string[] = [];
  const toppledNodeIds: string[] = [];
  let chipsAwarded = 0;
  let multDelta = 0;
  let triggeredTrapdoor = false;
  let winConditionMet = false;
  let winHeadline: string | null = null;
  let laserTrace: LaserTraceResultA | undefined;
  let pinballResult: PinballSimResultA | undefined;

  const ringRotations: [number, number, number] = [...prevState.ringRotationsDeg];
  const nextStreak = action.actor === 'PLAYER' ? (action.solvedCorrectly ? prevState.streakCount + 1 : 0) : prevState.streakCount;
  const accuracyScale = 0.85 + Math.max(0, Math.min(1, action.baseAccuracy01 ?? 1)) * 0.3;

  // Handle Blackjack / Bank-or-Bust voluntary STAND & BANK
  if (action.standAndBank && action.actor === 'PLAYER') {
    const banked = Math.max(250, nextSide.blackjackHandTotal * 55 + nextSide.ladderRung * 220);
    chipsAwarded = banked;
    nextSide.blackjackHandTotal = 0;
    nextSide.ladderRung = 0;
    bonusCallouts.push(`BANKED $${banked} SAFELY`);
    sfxCues.push('chip_stack_riffle', 'vault_heavy_unlock');
  } else if (target && action.solvedCorrectly) {
    // 1. If node is locked with iron chains, shatter 1 chain first or claim if unlocked
    if (target.lockedChains > 0) {
      target.lockedChains = Math.max(0, target.lockedChains - 1);
      brokenChainNodeIds.push(target.nodeId);
      sfxCues.push('iron_chain_shatter');
      bonusCallouts.push(target.lockedChains === 0 ? 'IRON CHAINS SHATTERED' : 'CHAIN CRACKED');
    }
    if (target.lockedChains === 0) {
      target.owner = action.actor;
    }

    // Break 1 chain on adjacent chained nodes when capturing a neighbor!
    for (const nbId of target.neighbors) {
      const nb = nextNodes.find((n) => n.nodeId === nbId);
      if (nb && nb.lockedChains > 0) {
        nb.lockedChains -= 1;
        brokenChainNodeIds.push(nb.nodeId);
        sfxCues.push('iron_chain_shatter');
      }
    }

    chipsAwarded = Math.round(target.baseChips * accuracyScale);
    multDelta = target.multBonus;

    // ----------------------------------------------------------------------
    // FAMILY I: CLOCKWORK_ROTARY Physics
    // ----------------------------------------------------------------------
    if (spec?.definition.family === 'CLOCKWORK_ROTARY' && spec.clockwork) {
      const cw = spec.clockwork;
      const rIdx = Math.min(2, Math.max(0, target.ringIndex ?? 0));
      const step = cw.ringStepDeg[rIdx] ?? 45;
      ringRotations[rIdx] = (ringRotations[rIdx] + step + 360) % 360;
      // Back-drive adjacent meshed gear rings by gear ratio!
      for (let other = 0; other < cw.ringCounts.length; other++) {
        if (other === rIdx) continue;
        const ratio = cw.gearRatios[other] ?? 0;
        if (ratio !== 0) {
          ringRotations[other] = (ringRotations[other] + step * ratio + 360) % 360;
        }
      }
      sfxCues.push('brass_gear_detent');

      // Vaudeville curtain anticipation charge
      if (cw.hasCurtainMask) {
        const stored = nextSide.curtainChargeByNodeId[target.nodeId] ?? 0;
        if (stored > 0) {
          chipsAwarded += stored;
          bonusCallouts.push(`CURTAIN BONUS +$${stored}`);
          nextSide.curtainChargeByNodeId[target.nodeId] = 0;
        }
        // Charge nodes rotated into backstage (-Z rear half)
        for (const n of nextNodes) {
          if (n.owner !== 'NONE') continue;
          const rot = ((ringRotations[n.ringIndex ?? 0] ?? 0) * Math.PI) / 180;
          const rz = n.pos3d[0] * Math.sin(rot) + n.pos3d[2] * Math.cos(rot);
          if (rz < -0.5) {
            nextSide.curtainChargeByNodeId[n.nodeId] = (nextSide.curtainChargeByNodeId[n.nodeId] ?? 0) + 150;
          }
        }
      }

      const alignedIds = computeAlignedClockworkNodes(nextNodes, ringRotations);
      if (alignedIds.length >= 2) {
        multDelta += Number((cw.alignmentMult - 1.0).toFixed(2));
        chipsAwarded += 300;
        bonusCallouts.push(`ORRERY LASER ALIGNMENT x${cw.alignmentMult.toFixed(1)}`);
        sfxCues.push('optical_beam_lock', 'streak_chord_3');
      }
    }

    // ----------------------------------------------------------------------
    // FAMILY II: TURF_WAR_BRIDGES Physics
    // ----------------------------------------------------------------------
    if (spec?.definition.family === 'TURF_WAR_BRIDGES' && spec.turf) {
      const turf = spec.turf;
      sfxCues.push('crystal_hex_claim');

      // Kyoto Kintsugi Go-encirclement flip!
      if (turf.supportsEncirclementFlip) {
        const opponent = action.actor === 'PLAYER' ? 'RIVAL' : 'PLAYER';
        for (const candidate of nextNodes) {
          if (candidate.owner !== opponent || candidate.neighbors.length === 0) continue;
          const surrounded = candidate.neighbors.every((nbId) => {
            const nb = nextNodes.find((n) => n.nodeId === nbId);
            return nb && nb.owner === action.actor;
          });
          if (surrounded) {
            candidate.owner = action.actor;
            flippedNodeIds.push(candidate.nodeId);
            chipsAwarded += 250;
          }
        }
        if (flippedNodeIds.length > 0) {
          bonusCallouts.push(`KINTSUGI ENCIRCLE FLIP (${flippedNodeIds.length})`);
          sfxCues.push('vault_heavy_unlock');
        }
      }

      // Checkers King-Leap diagonal siphon
      if (turf.supportsKingLeapSteal) {
        const opponent = action.actor === 'PLAYER' ? 'RIVAL' : 'PLAYER';
        const rivalAdj = target.neighbors.filter(
          (id) => nextNodes.find((n) => n.nodeId === id)?.owner === opponent
        );
        if (rivalAdj.length >= 1) {
          chipsAwarded += 250;
          bonusCallouts.push('KING-LEAP SIPHON +$250');
        }
      }

      // Subway Express Line surge
      if (turf.expressLineGroups) {
        for (const group of turf.expressLineGroups) {
          const first = nextNodes[group[0]];
          const last = nextNodes[group[group.length - 1]];
          if (first?.owner === action.actor && last?.owner === action.actor) {
            let surged = 0;
            for (const idx of group) {
              const stNode = nextNodes[idx];
              if (stNode && stNode.owner === 'NONE') {
                stNode.owner = action.actor;
                flippedNodeIds.push(stNode.nodeId);
                surged++;
              }
            }
            if (surged > 0) {
              multDelta += 1.0;
              bonusCallouts.push(`EXPRESS LINE ELECTRIFIED (+${surged})`);
              sfxCues.push('nixie_spark_crackle');
            }
          }
        }
      }

      // Tug-of-War Rope Tension
      if (spec.subVariant === 'TUG_ROPE_TENSION') {
        nextSide.tugRopeNotch += action.actor === 'PLAYER' ? 1 : -1;
        if (Math.abs(nextSide.tugRopeNotch) >= 3) {
          winConditionMet = true;
          chipsAwarded += turf.bridgeBonusChips;
          winHeadline = `${action.actor === 'PLAYER' ? 'PLAYER' : 'RIVAL'} HAULED THE ROPE HOME`;
          bonusCallouts.push(`ROPE SPAN VICTORY +$${turf.bridgeBonusChips}`);
        }
      }

      // West-to-East Hex Bridge Win Check
      if (
        !winConditionMet &&
        checkWestToEastBridge(nextNodes, action.actor, turf.westPierIndices, turf.eastPierIndices)
      ) {
        winConditionMet = true;
        chipsAwarded += turf.bridgeBonusChips;
        winHeadline = 'WEST-TO-EAST CRYSTAL BRIDGE FORGED';
        bonusCallouts.push(`BRIDGE CROWN +$${turf.bridgeBonusChips}`);
        sfxCues.push('streak_fanfare_5');
      }
    }

    // ----------------------------------------------------------------------
    // FAMILY III: GRAVITY_PHYSICS Physics
    // ----------------------------------------------------------------------
    if (spec?.definition.family === 'GRAVITY_PHYSICS' && spec.gravity) {
      const grav = spec.gravity;
      if (
        grav.contraptionKind === 'PINBALL' ||
        grav.contraptionKind === 'PACHINKO' ||
        grav.contraptionKind === 'PLINKO' ||
        grav.contraptionKind === 'VORTEX'
      ) {
        pinballResult = simulatePinballDropA(prevState, target.nodeId);
        chipsAwarded += pinballResult.bonusChips;
        bonusCallouts.push(`${pinballResult.bumperHits} BUMPER RICOCHETS +$${pinballResult.bonusChips}`);
        sfxCues.push('paddle_spring_slam', 'ui_brass_tap');
      } else if (grav.contraptionKind === 'DOMINO' || grav.contraptionKind === 'AVALANCHE') {
        const cascade: string[] = [target.nodeId];
        for (const path of grav.dominoPaths ?? []) {
          const pos = path.indexOf(target.index);
          if (pos === -1) continue;
          for (let k = pos + 1; k < path.length; k++) {
            const nxt = nextNodes[path[k]];
            if (nxt && (nxt.owner === action.actor || nxt.owner === 'NONE')) {
              cascade.push(nxt.nodeId);
              if (nxt.owner === 'NONE') break; // Topple stops at first unclaimed stopper
            } else {
              break;
            }
          }
        }
        toppledNodeIds.push(...cascade);
        for (const id of cascade) {
          if (!nextSide.toppledDominoIds.includes(id)) nextSide.toppledDominoIds.push(id);
        }
        const extraMult = Number(((cascade.length - 1) * grav.cascadeMultPerLink).toFixed(2));
        if (extraMult > 0) {
          multDelta += extraMult;
          bonusCallouts.push(`DOMINO CASCADE x${cascade.length} (+${extraMult} MULT)`);
        }
        sfxCues.push('rotary_knob_click', 'brass_gear_detent');
      } else if (grav.contraptionKind === 'BALANCE_SCALE' || grav.contraptionKind === 'SEESAW') {
        const grams = grav.weightGramsByIndex?.[target.index] ?? 200;
        if ((target.ringIndex ?? 0) === 0) nextSide.scaleLeftGrams += grams;
        else nextSide.scaleRightGrams += grams;
        const diff = Math.abs(nextSide.scaleLeftGrams - nextSide.scaleRightGrams);
        if (diff <= 100) {
          multDelta += 1.5;
          chipsAwarded += 250;
          bonusCallouts.push('GOLDEN EQUILIBRIUM x2.5');
          sfxCues.push('trophy_pedestal_chime');
        } else {
          bonusCallouts.push(`PAN TORQUE ${grams}g (DELTA ${diff}g)`);
          sfxCues.push('pneumatic_piston_slam');
        }
      } else if (grav.contraptionKind === 'PENDULUM' || grav.contraptionKind === 'NEWTON_CRADLE') {
        const centered = Math.abs(Math.sin(nextSide.pendulumPhaseRad)) < 0.35 || target.ringIndex === 2;
        if (centered) {
          multDelta += 1.5;
          chipsAwarded += 300;
          bonusCallouts.push('ZENITH MOMENTUM STRIKE x2.5');
          sfxCues.push('medal_enamel_clink');
        }
        nextSide.pendulumPhaseRad = (nextSide.pendulumPhaseRad + 1.15) % (Math.PI * 2);
      }
    }

    // ----------------------------------------------------------------------
    // FAMILY IV: CASINO_PUSH_LUCK Physics
    // ----------------------------------------------------------------------
    if (spec?.definition.family === 'CASINO_PUSH_LUCK' && spec.casino) {
      const cas = spec.casino;
      sfxCues.push('chip_stack_riffle');

      if (cas.tableGameKind === 'BLACKJACK_21' && action.actor === 'PLAYER') {
        const val = cas.cardValuesByIndex?.[target.index] ?? 6;
        nextSide.blackjackHandTotal += val;
        if (nextSide.blackjackHandTotal === 21) {
          chipsAwarded = Math.round(chipsAwarded * cas.jackpotMult);
          multDelta += 3.0;
          nextSide.blackjackHandTotal = 0;
          bonusCallouts.push('EXACT 21 BLACKJACK! x4 JACKPOT');
          sfxCues.push('streak_fanfare_5', 'crowd_studio_roar');
        } else if (nextSide.blackjackHandTotal > 21) {
          nextSide.blackjackBustCount += 1;
          nextSide.blackjackHandTotal = 0;
          chipsAwarded = 0;
          triggeredTrapdoor = true;
          bonusCallouts.push('BUST OVER 21! STAGE TRAPDOOR ARMED');
          sfxCues.push('trapdoor_hinge_drop', 'crowd_collective_gasp');
        } else {
          bonusCallouts.push(`HAND TOTAL ${nextSide.blackjackHandTotal} / 21 (+${val})`);
        }
      } else if (cas.tableGameKind === 'BACCARAT' && action.actor === 'PLAYER') {
        const val = cas.cardValuesByIndex?.[target.index] ?? 4;
        nextSide.blackjackHandTotal = (nextSide.blackjackHandTotal + val) % 10;
        if (nextSide.blackjackHandTotal === 9) {
          chipsAwarded += 500;
          multDelta += 2.0;
          bonusCallouts.push('NATURAL 9! SIPHONED RIVAL STACK');
          sfxCues.push('vault_heavy_unlock');
        } else {
          bonusCallouts.push(`BACCARAT TALLY: ${nextSide.blackjackHandTotal}`);
        }
      } else if (cas.tableGameKind === 'ROULETTE') {
        const pocketVal = cas.cardValuesByIndex?.[target.index] ?? 0;
        const isZero = pocketVal === 0;
        const sector: 'RED' | 'BLACK' | 'ZERO' = isZero ? 'ZERO' : pocketVal % 2 === 1 ? 'RED' : 'BLACK';
        if (sector === nextSide.rouletteSector) {
          const boost = isZero ? 5.0 : 2.5;
          chipsAwarded = Math.round(chipsAwarded * boost);
          bonusCallouts.push(`ROULETTE ${sector} HIT x${boost}`);
          sfxCues.push('streak_chord_4');
        }
        // Advance European rotor to next deterministic pocket
        const nextIdx = (prevState.turnNumber * 5 + target.index + 3) % (cas.cardValuesByIndex?.length ?? 17);
        const nxtPocket = cas.cardValuesByIndex?.[nextIdx] ?? 0;
        nextSide.roulettePocketNumber = nxtPocket;
        nextSide.rouletteSector = nxtPocket === 0 ? 'ZERO' : nxtPocket % 2 === 1 ? 'RED' : 'BLACK';
      } else if (cas.tableGameKind === 'MINESWEEPER') {
        const mineSet = new Set(cas.mineIndices ?? []);
        if (mineSet.has(target.index)) {
          chipsAwarded = 0;
          triggeredTrapdoor = true;
          bonusCallouts.push('FRANKIE VAULT MINE TRIGGERED!');
          sfxCues.push('trapdoor_hinge_drop', 'nixie_spark_crackle');
        } else {
          const adjMines = target.neighbors.filter((id) => {
            const n = nextNodes.find((x) => x.nodeId === id);
            return n ? mineSet.has(n.index) : false;
          }).length;
          nextSide.minesweeperRevealedCounts[target.nodeId] = adjMines;
          if (adjMines >= 2) {
            multDelta += 1.25;
            bonusCallouts.push(`HIGH-NERVE SWEEP (${adjMines} MINES NEAR) +1.25x`);
          } else {
            bonusCallouts.push(`VAULT CLEAR (${adjMines} ADJACENT MINES)`);
          }
        }
      } else if (cas.tableGameKind === 'THREE_SHELL') {
        if (target.index === nextSide.shellPearlCupIndex) {
          chipsAwarded = Math.round(chipsAwarded * 3.0);
          multDelta += 2.0;
          bonusCallouts.push('EMERALD PEARL FOUND! x3');
          sfxCues.push('streak_fanfare_5');
        }
        nextSide.shellPearlCupIndex = (nextSide.shellPearlCupIndex + prevState.turnNumber + 1) % 3;
      } else if (cas.tableGameKind === 'POKER_RIVER' && action.actor === 'PLAYER') {
        const card = cas.pokerLabelsByIndex?.[target.index];
        if (card) {
          nextSide.pokerCollectedCards.push(card);
          const suits = nextSide.pokerCollectedCards.map((c) => c.split('-')[1]);
          const suitCount = suits.filter((s) => s === suits[suits.length - 1]).length;
          if (suitCount >= 5) {
            chipsAwarded += 1500;
            winConditionMet = true;
            winHeadline = 'MONTE CARLO 5-CARD FLUSH';
            bonusCallouts.push('5-CARD FLUSH +$1,500');
          }
        }
      } else if (cas.tableGameKind === 'LADDER_BUST' && action.actor === 'PLAYER') {
        nextSide.ladderRung = Math.min(5, nextSide.ladderRung + 1);
        multDelta += Number((nextSide.ladderRung * 0.5).toFixed(2));
        bonusCallouts.push(`RUNG ${nextSide.ladderRung}/5 CLIMBED`);
      } else if (cas.tableGameKind === 'CRAPS') {
        const bay = cas.cardValuesByIndex?.[target.index] ?? 7;
        if (bay === nextSide.crapsPoint) {
          chipsAwarded = Math.round(chipsAwarded * 3.0);
          bonusCallouts.push(`CRAPS POINT ${bay} HIT x3`);
        }
        const roll = ((prevState.turnNumber * 7 + target.index * 3) % 7) + 4;
        nextSide.crapsPoint = roll === 7 ? 8 : roll;
      }
    }

    // ----------------------------------------------------------------------
    // FAMILY V: STEALTH_OPTICS_RADAR Physics
    // ----------------------------------------------------------------------
    if (spec?.definition.family === 'STEALTH_OPTICS_RADAR' && spec.stealth) {
      const st = spec.stealth;
      if (st.opticsKind === 'LASER_MIRROR' || st.opticsKind === 'PRISM_SPLITTER') {
        if (nextSide.mirrorAnglesDeg[target.nodeId] !== undefined) {
          nextSide.mirrorAnglesDeg[target.nodeId] = (nextSide.mirrorAnglesDeg[target.nodeId] + 45) % 180;
        }
        laserTrace = computeLaserTraceA(
          { ...prevState, nodes: nextNodes },
          nextSide.mirrorAnglesDeg
        );
        if (laserTrace.illuminatedNodeIds.includes(target.nodeId)) {
          multDelta += laserTrace.opticalMultBonus;
          chipsAwarded += Math.round(laserTrace.bounceCount * 150);
          bonusCallouts.push(`LASER BOUNCE x${laserTrace.bounceCount} (+${laserTrace.opticalMultBonus}x)`);
          sfxCues.push('optical_beam_lock');
        }
      } else if (
        st.opticsKind === 'SONAR_PPI' ||
        st.opticsKind === 'PERISCOPE_GRID' ||
        st.opticsKind === 'SEARCHLIGHT_YARD'
      ) {
        const nodeAng = Math.atan2(target.pos3d[2], target.pos3d[0]);
        const diff = Math.abs(Math.atan2(Math.sin(nodeAng - nextSide.sonarAngleRad), Math.cos(nodeAng - nextSide.sonarAngleRad)));
        if (diff <= 0.65) {
          chipsAwarded = Math.round(chipsAwarded * 2.5);
          multDelta += 1.5;
          bonusCallouts.push('PEAK PHOSPHOR SONAR LOCK x2.5');
          sfxCues.push('optical_beam_lock');
        } else {
          sfxCues.push('ui_brass_tap');
        }
      } else if (st.opticsKind === 'TRIANGULATION' && st.dishAnchorIndices) {
        const ownedDishes = st.dishAnchorIndices.filter((i) => nextNodes[i]?.owner === action.actor).length;
        if (ownedDishes >= 3 && nextNodes[0]) {
          nextNodes[0].lockedChains = 0;
          chipsAwarded += 600;
          bonusCallouts.push('3-DISH TRIANGULATION LOCK — CORE OPEN');
          sfxCues.push('vault_heavy_unlock');
        }
      } else if (st.opticsKind === 'NIXIE_BREAKER') {
        if (target.hasTrapFuse) {
          triggeredTrapdoor = true;
          chipsAwarded = 0;
          bonusCallouts.push('NIXIE SHUNT OVERLOAD! TRAPDOOR');
          sfxCues.push('nixie_spark_crackle', 'trapdoor_hinge_drop');
        } else {
          sfxCues.push('nixie_spark_crackle');
        }
      }
    }
  } else {
    // Wrong answer: arm trapdoor hazard & reset Bank-or-Bust ladder
    triggeredTrapdoor = true;
    nextSide.ladderRung = 0;
    sfxCues.push('trapdoor_hinge_drop', 'crowd_collective_gasp');
  }

  const nextMult =
    action.actor === 'PLAYER'
      ? Number(Math.max(1.0, prevState.playerMult + multDelta).toFixed(2))
      : prevState.playerMult;
  const totalTurnCash = Math.round(chipsAwarded * (action.actor === 'PLAYER' ? nextMult : 1.0));
  const alignedNodeIds =
    spec?.definition.family === 'CLOCKWORK_ROTARY'
      ? computeAlignedClockworkNodes(nextNodes, ringRotations)
      : laserTrace
        ? [...laserTrace.illuminatedNodeIds]
        : prevState.alignedNodeIds;

  const nextState: BoardRuntimeStateV6 = {
    ...prevState,
    nodes: nextNodes,
    turnNumber: prevState.turnNumber + 1,
    ringRotationsDeg: ringRotations,
    alignedNodeIds,
    playerScoreChips:
      action.actor === 'PLAYER' ? prevState.playerScoreChips + chipsAwarded : prevState.playerScoreChips,
    playerMult: nextMult,
    playerTotalCash:
      action.actor === 'PLAYER' ? prevState.playerTotalCash + totalTurnCash : prevState.playerTotalCash,
    rivalTotalCash:
      action.actor === 'RIVAL' ? prevState.rivalTotalCash + totalTurnCash : prevState.rivalTotalCash,
    streakCount: nextStreak,
  };

  return {
    state: nextState,
    sideState: nextSide,
    chipsAwarded,
    multDelta,
    triggeredTrapdoor,
    winConditionMet,
    winHeadline,
    bonusCallouts,
    sfxCues,
    flippedNodeIds,
    brokenChainNodeIds,
    toppledNodeIds,
    laserTrace,
    pinballResult,
  };
}

// ----------------------------------------------------------------------------
// 3. Procedural PBR Canvas Textures & Custom GLSL Shaders (Zero External URLs)
// ----------------------------------------------------------------------------
function isCanvasSupported(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

function createProceduralSurfaceTexture(
  kind: 'BRUSHED_BRASS' | 'EMERALD_FELT' | 'BUNKER_STEEL' | 'MAHOGANY_WOOD'
): THREE.CanvasTexture | null {
  if (!isCanvasSupported()) return null;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (kind === 'BRUSHED_BRASS') {
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#c89b44');
    grad.addColorStop(0.5, '#e8c670');
    grad.addColorStop(1, '#a87d2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      const alpha = 0.04 + ((y * 37) % 13) * 0.006;
      ctx.fillStyle = y % 4 === 0 ? `rgba(255,245,210,${alpha})` : `rgba(40,26,8,${alpha})`;
      ctx.fillRect(0, y, size, 1);
    }
  } else if (kind === 'EMERALD_FELT') {
    ctx.fillStyle = '#0d5b3d';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 4200; i++) {
      const x = (i * 73) % size;
      const y = (i * 139) % size;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(34,132,88,0.22)' : 'rgba(4,34,20,0.25)';
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.strokeStyle = 'rgba(229,188,92,0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, size - 20, size - 20);
  } else if (kind === 'BUNKER_STEEL') {
    ctx.fillStyle = '#2d3629';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 3600; i++) {
      const x = (i * 97) % size;
      const y = (i * 53) % size;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(90,108,82,0.2)' : 'rgba(14,18,12,0.25)';
      ctx.fillRect(x, y, 2, 2);
    }
    // Engraved bunker grid ticks
    ctx.strokeStyle = 'rgba(130,152,115,0.18)';
    ctx.lineWidth = 1;
    for (let p = 0; p < size; p += 32) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#472116';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 3) {
      const wave = Math.sin(y * 0.14) * 14;
      ctx.fillStyle = y % 6 === 0 ? 'rgba(115,52,32,0.26)' : 'rgba(28,11,7,0.28)';
      ctx.fillRect(0, y, size, 2);
      ctx.fillRect((y * 19 + wave) % size, y, 32, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createNodePlaqueTexture(
  node: BoardNodeV6,
  badgeText: string,
  accentHex: number,
  isHighlighted: boolean
): THREE.CanvasTexture | null {
  if (!isCanvasSupported()) return null;
  const w = 256;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const dom = CORPUS_DOMAINS_V6[node.domainId] ?? CORPUS_DOMAINS_V6[0];
  const bgColor =
    node.owner === 'PLAYER'
      ? '#143c2e'
      : node.owner === 'RIVAL'
        ? '#4f1520'
        : node.lockedChains > 0
          ? '#1a1e28'
          : '#111926';
  const rimHex =
    node.owner === 'PLAYER'
      ? '#f3cc6d'
      : node.owner === 'RIVAL'
        ? '#ff5568'
        : isHighlighted
          ? '#fff0a6'
          : `#${accentHex.toString(16).padStart(6, '0')}`;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Inner radial vignette
  const rad = ctx.createRadialGradient(128, 128, 18, 128, 128, 124);
  rad.addColorStop(0, 'rgba(255,244,205,0.14)');
  rad.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, w, h);

  // Double brass border frame
  ctx.strokeStyle = rimHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,232,170,0.5)';
  ctx.strokeRect(24, 24, w - 48, h - 48);

  // Category code pill at top
  ctx.fillStyle = `#${dom.accentHex.toString(16).padStart(6, '0')}`;
  ctx.font = '700 32px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dom.shortCode, 128, 66);

  // Main value / badge (e.g. "$300", "21", "A-S", "350g", "LOCK")
  ctx.fillStyle = '#fff9eb';
  ctx.font = '900 62px Georgia, serif';
  ctx.fillText(badgeText, 128, 138);

  // Footer status line
  const footer =
    node.owner === 'PLAYER'
      ? 'CLAIMED'
      : node.owner === 'RIVAL'
        ? 'RIVAL'
        : node.lockedChains > 0
          ? `CHAIN x${node.lockedChains}`
          : node.multBonus >= 0.75
            ? `+${node.multBonus.toFixed(1)}x`
            : dom.label.slice(0, 11);
  ctx.fillStyle = rimHex;
  ctx.font = '700 24px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(footer, 128, 204);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const SONAR_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SONAR_FRAGMENT_SHADER = `
uniform float uSweepAngle;
uniform float uTime;
uniform vec3 uPhosphorColor;
uniform vec3 uBgColor;
varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  if (r > 1.0) discard;

  // Polar angle matching world XZ plane
  float ang = atan(p.y, p.x);
  float diff = mod(uSweepAngle - ang + 6.2831853, 6.2831853);
  // Crisp leading edge + smooth P1 phosphor persistence decay
  float sweep = exp(-diff * 2.65) * step(0.0, 1.0 - r);
  float leadingEdge = smoothstep(0.08, 0.0, diff) * 0.85;

  // Concentric range rings & 30-degree bearing ticks
  float rings = smoothstep(0.018, 0.004, abs(fract(r * 3.0) - 0.5) / 3.0) * 0.42;
  float crossHair = (smoothstep(0.014, 0.003, abs(p.x)) + smoothstep(0.014, 0.003, abs(p.y))) * 0.28;
  float bezelRing = smoothstep(0.95, 0.99, r) * 0.55;
  float scanline = 0.92 + 0.08 * sin(vUv.y * 180.0 + uTime * 2.0);

  vec3 col = uBgColor;
  col += uPhosphorColor * (sweep * 0.65 + leadingEdge + rings + crossHair);
  col += uPhosphorColor * bezelRing * 0.35;
  col *= scanline;

  gl_FragColor = vec4(col, 0.96);
}
`;

// ----------------------------------------------------------------------------
// 4. Procedural 3D Horology & Contraption Geometry Builders
// ----------------------------------------------------------------------------
function createInvoluteGearGeometry(
  outerRadius: number,
  innerRadius: number,
  teethCount: number,
  depth: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const rootR = outerRadius - 0.095;
  const tipR = outerRadius;
  const step = (Math.PI * 2) / teethCount;

  for (let i = 0; i < teethCount; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.18;
    const a2 = a0 + step * 0.34;
    const a3 = a0 + step * 0.54;
    const a4 = a0 + step * 0.72;
    const p0x = Math.cos(a0) * rootR;
    const p0y = Math.sin(a0) * rootR;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);
    shape.lineTo(Math.cos(a1) * rootR, Math.sin(a1) * rootR);
    shape.lineTo(Math.cos(a2) * tipR, Math.sin(a2) * tipR);
    shape.lineTo(Math.cos(a3) * tipR, Math.sin(a3) * tipR);
    shape.lineTo(Math.cos(a4) * rootR, Math.sin(a4) * rootR);
  }
  shape.closePath();

  if (innerRadius > 0.12) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.016,
    bevelSegments: 2,
    curveSegments: 24,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createBeveledHexGeometry(radius: number, height: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.032,
    bevelSize: 0.028,
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createWroughtIronChainOverlay(
  ironMat: THREE.Material,
  radius: number
): THREE.Group {
  const group = new THREE.Group();
  const linkGeo = new THREE.TorusGeometry(0.055, 0.017, 8, 14);
  for (const diag of [-1, 1]) {
    for (let k = -3; k <= 3; k++) {
      const t = k / 3;
      const mesh = new THREE.Mesh(linkGeo, ironMat);
      mesh.position.set(t * radius * 0.72, 0.2 + (1 - t * t) * 0.05, diag * t * radius * 0.72);
      mesh.rotation.y = diag > 0 ? Math.PI / 4 : -Math.PI / 4;
      mesh.rotation.x = k % 2 === 0 ? 0.35 : Math.PI / 2 - 0.2;
      mesh.castShadow = true;
      group.add(mesh);
    }
  }
  // Central forged brass/iron padlock boss
  const lockBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.08), ironMat);
  lockBody.position.set(0, 0.25, 0);
  group.add(lockBody);
  return group;
}

// ----------------------------------------------------------------------------
// 5. Internal Scene Node / Animation Tracking Types
// ----------------------------------------------------------------------------
interface NodeRigA {
  nodeId: string;
  nodeIndex: number;
  ringIndex: number;
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  rimMesh: THREE.Mesh;
  plaqueMesh: THREE.Mesh;
  plaqueMat: THREE.MeshStandardMaterial;
  chainGroup: THREE.Group | null;
  mirrorTurretGroup: THREE.Group | null;
  chipStackGroup: THREE.Group | null;
  nixieBulbMesh: THREE.Mesh | null;
  baseY: number;
  currentLiftY: number;
  targetLiftY: number;
  toppleAngleRad: number;
  targetToppleAngleRad: number;
}

interface ChainShardParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  life: number;
}

interface PinballFlightAnim {
  points: THREE.Vector3[];
  segmentIndex: number;
  segmentT: number;
  active: boolean;
}

interface ShellShuffleAnim {
  active: boolean;
  elapsed: number;
  duration: number;
  swaps: Array<[number, number]>;
  slotPositions: THREE.Vector3[];
}

// ----------------------------------------------------------------------------
// 6. Main Pure Three.js WebGL2 PBR Contraption Renderer A (Boards 001–050)
// ----------------------------------------------------------------------------
export class BoardContraptionRendererA {
  public readonly rootGroup: THREE.Group = new THREE.Group();
  public readonly supportedFamilies: readonly BoardFamilyIdV6[] = [
    'CLOCKWORK_ROTARY',
    'TURF_WAR_BRIDGES',
    'GRAVITY_PHYSICS',
    'CASINO_PUSH_LUCK',
    'STEALTH_OPTICS_RADAR',
  ] as const;

  private mountedParent: THREE.Object3D | null = null;

  private state: BoardRuntimeStateV6 | null = null;
  private spec: BoardContraptionSpecA | null = null;
  private sideState: ContraptionSideStateA | null = null;
  private stageTheme: StageAtmosphereThemeV6 | null = null;

  private readonly nodeRigs: Map<string, NodeRigA> = new Map();
  private readonly interactiveMeshes: THREE.Object3D[] = [];
  private readonly ringGroups: THREE.Group[] = [];
  private readonly currentRingRad: [number, number, number] = [0, 0, 0];
  private readonly targetRingRad: [number, number, number] = [0, 0, 0];

  // Shared PBR Materials adapted live by applyStageTheme()
  private substrateMat: THREE.MeshStandardMaterial;
  private trimMetalMat: THREE.MeshStandardMaterial;
  private secondaryMetalMat: THREE.MeshStandardMaterial;
  private ironChainMat: THREE.MeshStandardMaterial;
  private crystalMat: THREE.MeshPhysicalMaterial;
  private feltMat: THREE.MeshStandardMaterial;
  private bunkerSteelMat: THREE.MeshStandardMaterial;
  private chromeBallMat: THREE.MeshStandardMaterial;
  private ivoryMat: THREE.MeshStandardMaterial;
  private rubyLaserMat: THREE.MeshBasicMaterial;
  private playerEmissiveMat: THREE.MeshStandardMaterial;
  private rivalEmissiveMat: THREE.MeshStandardMaterial;

  // Dynamic family hero objects
  private orreryLaserBeam: THREE.Mesh | null = null;
  private escapementPallet: THREE.Group | null = null;
  private tonearmGroup: THREE.Group | null = null;
  private tugKnotMesh: THREE.Mesh | null = null;
  private pinballMesh: THREE.Mesh | null = null;
  private pinballBumpers: THREE.Mesh[] = [];
  private pinballAnim: PinballFlightAnim = { points: [], segmentIndex: 0, segmentT: 0, active: false };
  private pendulumArmGroup: THREE.Group | null = null;
  private balanceBeamGroup: THREE.Group | null = null;
  private balanceLeftPan: THREE.Group | null = null;
  private balanceRightPan: THREE.Group | null = null;
  private vortexOrbitAngle = 0;
  private rouletteRotorGroup: THREE.Group | null = null;
  private rouletteBallMesh: THREE.Mesh | null = null;
  private rouletteSpinVel = 1.6;
  private rouletteBallAngle = 0;
  private shellCupGroups: THREE.Group[] = [];
  private shellPearlMesh: THREE.Mesh | null = null;
  private shellAnim: ShellShuffleAnim = { active: false, elapsed: 0, duration: 1.8, swaps: [], slotPositions: [] };
  private crapsDiceMeshes: THREE.Mesh[] = [];
  private auctionGavelGroup: THREE.Group | null = null;
  private gavelStrikeTimer = 0;
  private laserBeamsGroup: THREE.Group | null = null;
  private sonarShaderMat: THREE.ShaderMaterial | null = null;
  private searchlightArms: THREE.Group[] = [];
  private xrayArchMesh: THREE.Mesh | null = null;

  // Transient VFX particles (shattered iron chain links & sparks)
  private readonly shards: ChainShardParticle[] = [];
  private readonly shardGroup: THREE.Group = new THREE.Group();
  private readonly trackedTextures: THREE.Texture[] = [];
  private readonly trackedGeometries: THREE.BufferGeometry[] = [];
  private readonly trackedMaterials: THREE.Material[] = [];

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private hoveredNodeId: string | null = null;
  private clockSec = 0;

  constructor() {
    this.rootGroup.name = 'BoardContraptionRendererA_Root';

    const brassTex = createProceduralSurfaceTexture('BRUSHED_BRASS');
    const feltTex = createProceduralSurfaceTexture('EMERALD_FELT');
    const bunkerTex = createProceduralSurfaceTexture('BUNKER_STEEL');
    const mahoganyTex = createProceduralSurfaceTexture('MAHOGANY_WOOD');
    [brassTex, feltTex, bunkerTex, mahoganyTex].forEach((t) => {
      if (t) this.trackedTextures.push(t);
    });

    this.substrateMat = new THREE.MeshStandardMaterial({
      color: 0x3b2218,
      ...(mahoganyTex ? { map: mahoganyTex } : {}),
      roughness: 0.44,
      metalness: 0.14,
    });
    this.trimMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd9af54,
      ...(brassTex ? { map: brassTex } : {}),
      roughness: 0.24,
      metalness: 0.88,
    });
    this.secondaryMetalMat = new THREE.MeshStandardMaterial({
      color: 0x2b394f,
      roughness: 0.32,
      metalness: 0.72,
    });
    this.ironChainMat = new THREE.MeshStandardMaterial({
      color: 0x383d47,
      roughness: 0.48,
      metalness: 0.86,
    });
    this.crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x101c30,
      roughness: 0.16,
      metalness: 0.12,
      clearcoat: 0.92,
      clearcoatRoughness: 0.12,
      reflectivity: 0.9,
    });
    this.feltMat = new THREE.MeshStandardMaterial({
      color: 0x0f6342,
      ...(feltTex ? { map: feltTex } : {}),
      roughness: 0.84,
      metalness: 0.04,
    });
    this.bunkerSteelMat = new THREE.MeshStandardMaterial({
      color: 0x2d372b,
      ...(bunkerTex ? { map: bunkerTex } : {}),
      roughness: 0.56,
      metalness: 0.54,
    });
    this.chromeBallMat = new THREE.MeshStandardMaterial({
      color: 0xf4f8ff,
      roughness: 0.05,
      metalness: 1.0,
    });
    this.ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xf3ecd8,
      roughness: 0.24,
      metalness: 0.08,
    });
    this.rubyLaserMat = new THREE.MeshBasicMaterial({
      color: 0xff2e50,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.playerEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xf2c966,
      emissive: 0x8f6210,
      emissiveIntensity: 0.65,
      roughness: 0.22,
      metalness: 0.82,
    });
    this.rivalEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xd9384a,
      emissive: 0x6e0e19,
      emissiveIntensity: 0.65,
      roughness: 0.26,
      metalness: 0.72,
    });

    this.trackedMaterials.push(
      this.substrateMat,
      this.trimMetalMat,
      this.secondaryMetalMat,
      this.ironChainMat,
      this.crystalMat,
      this.feltMat,
      this.bunkerSteelMat,
      this.chromeBallMat,
      this.ivoryMat,
      this.rubyLaserMat,
      this.playerEmissiveMat,
      this.rivalEmissiveMat
    );
  }

  // --------------------------------------------------------------------------
  // Public Lifecycle: Mount, Theme Adaptation, Sync, Update, Dispose
  // --------------------------------------------------------------------------
  public mount(
    state: BoardRuntimeStateV6,
    stageTheme?: StageAtmosphereThemeV6,
    boardScale = 1.0
  ): THREE.Group {
    this.clearSceneContents();

    this.state = state;
    this.spec = getBoardContraptionSpecA(state.definition.boardId) ?? null;
    this.sideState = createInitialContraptionSideStateA(state);
    this.rootGroup.scale.setScalar(boardScale);
    this.rootGroup.add(this.shardGroup);

    if (stageTheme) {
      this.applyStageTheme(stageTheme);
    } else if (this.spec) {
      this.trimMetalMat.color.setHex(this.spec.definition.accentPalette.primaryHex);
      this.secondaryMetalMat.color.setHex(this.spec.definition.accentPalette.secondaryHex);
      this.rubyLaserMat.color.setHex(this.spec.definition.accentPalette.gemHex);
    }

    switch (state.definition.family) {
      case 'CLOCKWORK_ROTARY':
        this.buildClockworkScene(state);
        break;
      case 'TURF_WAR_BRIDGES':
        this.buildTurfWarScene(state);
        break;
      case 'GRAVITY_PHYSICS':
        this.buildGravityPhysicsScene(state);
        break;
      case 'CASINO_PUSH_LUCK':
        this.buildCasinoPushLuckScene(state);
        break;
      case 'STEALTH_OPTICS_RADAR':
        this.buildStealthOpticsScene(state);
        break;
      default:
        this.buildClockworkScene(state);
        break;
    }

    this.syncState(state);
    return this.rootGroup;
  }

  /**
   * Live Stage World PBR adaptation so every contraption harmonizes with the
   * active StageAtmosphereThemeV6 materials (Carrara marble, Kyoto Urushi,
   * Monte Carlo emerald felt, 1969 olive bunker steel, Bathysphere bronze, etc.).
   */
  public applyStageTheme(theme: StageAtmosphereThemeV6): void {
    this.stageTheme = theme;
    const m = theme.materials;

    this.substrateMat.color.setHex(m.stoneOrWoodHex);
    this.substrateMat.roughness = Math.min(0.85, Math.max(0.18, m.floorRoughness));
    this.substrateMat.metalness = Math.min(0.6, m.floorMetalness);

    this.trimMetalMat.color.setHex(m.trimMetalHex);
    this.trimMetalMat.roughness = Math.min(0.45, Math.max(0.12, m.trimRoughness));
    this.trimMetalMat.metalness = Math.max(0.65, m.trimMetalness);

    this.secondaryMetalMat.color.setHex(m.floorColorHex).lerp(new THREE.Color(m.jewelSecondaryHex), 0.28);
    this.crystalMat.color.setHex(m.floorColorHex).lerp(new THREE.Color(m.jewelPrimaryHex), 0.16);
    this.playerEmissiveMat.color.setHex(m.jewelPrimaryHex);
    this.playerEmissiveMat.emissive.setHex(m.jewelPrimaryHex).multiplyScalar(0.35);
    this.rubyLaserMat.color.setHex(m.jewelSecondaryHex);

    if (this.sonarShaderMat) {
      this.sonarShaderMat.uniforms.uPhosphorColor.value.setHex(
        theme.stageId === 'STAGE_08_SUNKEN_BATHYSPHERE' ? 0x45f2d2 : 0x3ef095
      );
    }
  }

  /**
   * Drop-in `BoardRendererContractV6.mountBoard` adapter for `UnifiedBoardManagerV6`.
   */
  public mountBoard(
    parent: THREE.Object3D,
    state: BoardRuntimeStateV6,
    twistSnapshot?: unknown,
    stageTheme?: StageAtmosphereThemeV6
  ): THREE.Group {
    if (this.mountedParent && this.mountedParent !== parent) {
      this.mountedParent.remove(this.rootGroup);
    }
    this.mount(state, stageTheme, 1.0);
    if (this.rootGroup.parent !== parent) {
      parent.add(this.rootGroup);
    }
    this.mountedParent = parent;
    if (twistSnapshot) {
      this.syncState(state, twistSnapshot as ContraptionSideStateA);
    }
    return this.rootGroup;
  }

  public getSideState(): ContraptionSideStateA | null {
    return this.sideState;
  }

  public syncState(state: BoardRuntimeStateV6, updatedSideOrTwist?: unknown): void {
    this.state = state;
    if (
      updatedSideOrTwist &&
      typeof updatedSideOrTwist === 'object' &&
      'blackjackHandTotal' in (updatedSideOrTwist as Record<string, unknown>)
    ) {
      this.sideState = updatedSideOrTwist as ContraptionSideStateA;
    }
    const alignedSet = new Set(state.alignedNodeIds);

    for (let i = 0; i < 3; i++) {
      this.targetRingRad[i] = ((state.ringRotationsDeg[i] ?? 0) * Math.PI) / 180;
    }

    for (const node of state.nodes) {
      const rig = this.nodeRigs.get(node.nodeId);
      if (!rig) continue;

      const isAligned = alignedSet.has(node.nodeId);
      const badge = this.formatNodeBadgeText(node);
      const accentHex = this.spec?.definition.accentPalette.primaryHex ?? 0xd9af54;

      // Refresh plaque CanvasTexture cleanly
      const oldMap = rig.plaqueMat.map;
      const nextTex = createNodePlaqueTexture(node, badge, accentHex, isAligned);
      if (nextTex) {
        rig.plaqueMat.map = nextTex;
        rig.plaqueMat.needsUpdate = true;
        if (oldMap) oldMap.dispose();
      }

      // Rim ownership & alignment emissive feedback
      const rimMat = rig.rimMesh.material as THREE.MeshStandardMaterial;
      if (node.owner === 'PLAYER') {
        rimMat.color.setHex(0xf3cc6d);
        rimMat.emissive.setHex(0xb37f1c);
        rimMat.emissiveIntensity = 0.55;
      } else if (node.owner === 'RIVAL') {
        rimMat.color.setHex(0xff475c);
        rimMat.emissive.setHex(0x821422);
        rimMat.emissiveIntensity = 0.55;
      } else if (isAligned) {
        rimMat.color.setHex(this.spec?.definition.accentPalette.gemHex ?? 0xffd24d);
        rimMat.emissive.setHex(this.spec?.definition.accentPalette.gemHex ?? 0xffd24d);
        rimMat.emissiveIntensity = 0.72;
      } else {
        rimMat.color.setHex(this.stageTheme?.materials.trimMetalHex ?? accentHex);
        rimMat.emissive.setHex(0x000000);
        rimMat.emissiveIntensity = 0;
      }

      // Update iron chain visibility
      if (rig.chainGroup) {
        rig.chainGroup.visible = node.lockedChains > 0;
      }

      // Update domino topple target
      if (this.sideState?.toppledDominoIds.includes(node.nodeId)) {
        rig.targetToppleAngleRad = (74 * Math.PI) / 180;
      }

      // Update mirror turret physical yaw
      if (rig.mirrorTurretGroup && this.sideState) {
        const ang = this.sideState.mirrorAnglesDeg[node.nodeId] ?? 45;
        rig.mirrorTurretGroup.rotation.y = (-ang * Math.PI) / 180;
      }

      // Update 3D casino chip tower height on ownership
      if (rig.chipStackGroup) {
        rig.chipStackGroup.scale.y = node.owner === 'NONE' ? 1.0 : 1.55;
      }
    }

    // Update Orrery alignment laser beam visibility
    if (this.orreryLaserBeam) {
      this.orreryLaserBeam.visible = state.alignedNodeIds.length >= 2;
    }

    // Update Tug-of-War crimson rope marker position
    if (this.tugKnotMesh && this.sideState) {
      this.tugKnotMesh.position.x = THREE.MathUtils.clamp(this.sideState.tugRopeNotch * 0.62, -1.9, 1.9);
    }

    // Rebuild laser rays if Family V laser/prism board
    if (this.laserBeamsGroup && this.sideState) {
      this.rebuildLaserBeamMeshes(computeLaserTraceA(state, this.sideState.mirrorAnglesDeg));
    }
  }

  public update(dt: number, _elapsedSeconds?: number): void {
    const clampedDt = Math.min(0.05, Math.max(0.001, dt));
    this.clockSec += clampedDt;
    const lerpFast = 1 - Math.exp(-12 * clampedDt);
    const lerpSmooth = 1 - Math.exp(-6.5 * clampedDt);

    // 1. Smoothly rotate Clockwork gear rings
    for (let i = 0; i < this.ringGroups.length; i++) {
      const grp = this.ringGroups[i];
      if (!grp) continue;
      // Shortest angular interpolation
      let delta = this.targetRingRad[i] - this.currentRingRad[i];
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      this.currentRingRad[i] += delta * lerpSmooth;
      grp.rotation.y = -this.currentRingRad[i];
    }

    // 2. Clockwork Escapement rocking & Jukebox tonearm oscillation
    if (this.escapementPallet) {
      this.escapementPallet.rotation.y = Math.sin(this.clockSec * 2.4) * 0.28;
    }
    if (this.tonearmGroup) {
      this.tonearmGroup.rotation.y = -0.35 + Math.sin(this.clockSec * 0.65) * 0.22;
    }
    if (this.orreryLaserBeam && this.orreryLaserBeam.visible) {
      this.rubyLaserMat.opacity = 0.72 + Math.sin(this.clockSec * 9.0) * 0.22;
    }

    // 3. Node hover spring lift + Domino rigid-body topple + Nixie flicker
    for (const rig of this.nodeRigs.values()) {
      rig.currentLiftY += (rig.targetLiftY - rig.currentLiftY) * lerpFast;
      rig.group.position.y = rig.baseY + rig.currentLiftY;

      if (Math.abs(rig.targetToppleAngleRad - rig.toppleAngleRad) > 0.002) {
        rig.toppleAngleRad += (rig.targetToppleAngleRad - rig.toppleAngleRad) * lerpFast;
        rig.bodyMesh.rotation.x = rig.toppleAngleRad;
      }

      if (rig.nixieBulbMesh) {
        const mat = rig.nixieBulbMesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 1.15 + Math.sin(this.clockSec * 14 + rig.nodeIndex * 1.7) * 0.22;
      }
    }

    // 4. Pinball / Vortex chrome steel ball trajectory animation
    if (this.pinballMesh) {
      if (this.pinballAnim.active && this.pinballAnim.points.length >= 2) {
        this.pinballAnim.segmentT += clampedDt * 4.2;
        if (this.pinballAnim.segmentT >= 1) {
          this.pinballAnim.segmentT = 0;
          this.pinballAnim.segmentIndex++;
          // Flash nearest bumper on bounce transition
          const hitBumper = this.pinballBumpers[this.pinballAnim.segmentIndex % Math.max(1, this.pinballBumpers.length)];
          if (hitBumper) {
            hitBumper.scale.set(1.25, 1.18, 1.25);
          }
          if (this.pinballAnim.segmentIndex >= this.pinballAnim.points.length - 1) {
            this.pinballAnim.active = false;
          }
        }
        const idx = Math.min(this.pinballAnim.segmentIndex, this.pinballAnim.points.length - 2);
        const a = this.pinballAnim.points[idx];
        const b = this.pinballAnim.points[idx + 1];
        this.pinballMesh.position.lerpVectors(a, b, Math.min(1, this.pinballAnim.segmentT));
      } else if (this.spec?.subVariant === 'VORTEX_HYPERBOLIC_FUNNEL') {
        this.vortexOrbitAngle += clampedDt * 2.1;
        const r = 1.15 + Math.sin(this.clockSec * 0.7) * 0.55;
        const y = 0.24 + r * 0.22;
        this.pinballMesh.position.set(Math.cos(this.vortexOrbitAngle) * r, y, Math.sin(this.vortexOrbitAngle) * r);
      }
    }
    for (const bumper of this.pinballBumpers) {
      bumper.scale.x += (1 - bumper.scale.x) * lerpFast;
      bumper.scale.y += (1 - bumper.scale.y) * lerpFast;
      bumper.scale.z += (1 - bumper.scale.z) * lerpFast;
    }

    // 5. Pendulum Drawbridge / Newton's Cradle & Apothecary Balance Scale
    if (this.pendulumArmGroup) {
      const phase = this.clockSec * 1.45;
      if (this.sideState) this.sideState.pendulumPhaseRad = phase % (Math.PI * 2);
      this.pendulumArmGroup.rotation.z = Math.sin(phase) * 0.48;
    }
    if (this.balanceBeamGroup && this.sideState) {
      const diff = this.sideState.scaleRightGrams - this.sideState.scaleLeftGrams;
      const targetTilt = THREE.MathUtils.clamp((diff / 750) * 0.42, -0.45, 0.45);
      this.balanceBeamGroup.rotation.z += (targetTilt - this.balanceBeamGroup.rotation.z) * lerpSmooth;
      if (this.balanceLeftPan) this.balanceLeftPan.rotation.z = -this.balanceBeamGroup.rotation.z;
      if (this.balanceRightPan) this.balanceRightPan.rotation.z = -this.balanceBeamGroup.rotation.z;
    }

    // 6. Casino Roulette Rotor + Ball, Three-Shell Bezier Shuffle, Craps Dice, Auction Gavel
    if (this.rouletteRotorGroup) {
      this.rouletteRotorGroup.rotation.y += clampedDt * this.rouletteSpinVel;
      this.rouletteSpinVel = Math.max(0.45, this.rouletteSpinVel * (1 - clampedDt * 0.35));
      if (this.rouletteBallMesh) {
        this.rouletteBallAngle -= clampedDt * (this.rouletteSpinVel * 2.1 + 0.8);
        const rad = 0.72 + Math.sin(this.clockSec * 2.5) * 0.04;
        this.rouletteBallMesh.position.set(Math.cos(this.rouletteBallAngle) * rad, 0.38, Math.sin(this.rouletteBallAngle) * rad);
      }
    }
    if (this.shellAnim.active && this.shellCupGroups.length === 3) {
      this.updateShellShuffleAnim(clampedDt);
    }
    if (this.crapsDiceMeshes.length > 0) {
      this.crapsDiceMeshes.forEach((die, i) => {
        die.rotation.y += clampedDt * (0.45 + i * 0.25);
        die.position.y = 0.36 + Math.abs(Math.sin(this.clockSec * 2.2 + i)) * 0.06;
      });
    }
    if (this.auctionGavelGroup && this.gavelStrikeTimer > 0) {
      this.gavelStrikeTimer = Math.max(0, this.gavelStrikeTimer - clampedDt);
      this.auctionGavelGroup.rotation.z = Math.sin(this.gavelStrikeTimer * Math.PI * 3) * 0.55;
    }

    // 7. Stealth Optics: Custom GLSL Sonar Sweep, Searchlight Beams & X-Ray Arch
    if (this.sonarShaderMat) {
      const speed = this.spec?.stealth?.sweepSpeedRadPerSec ?? 1.05;
      const nextAngle = (this.clockSec * speed) % (Math.PI * 2);
      this.sonarShaderMat.uniforms.uSweepAngle.value = nextAngle;
      this.sonarShaderMat.uniforms.uTime.value = this.clockSec;
      if (this.sideState) this.sideState.sonarAngleRad = nextAngle;
    }
    if (this.searchlightArms.length > 0) {
      this.searchlightArms.forEach((arm, idx) => {
        arm.rotation.y = Math.sin(this.clockSec * 0.85 + idx * Math.PI) * 0.95;
      });
    }
    if (this.xrayArchMesh) {
      this.xrayArchMesh.position.z = Math.sin(this.clockSec * 0.9) * 1.15;
    }

    // 8. Shattered 3D iron chain shard physics
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life -= clampedDt;
      if (s.life <= 0) {
        this.shardGroup.remove(s.mesh);
        this.shards.splice(i, 1);
        continue;
      }
      s.vy -= 9.2 * clampedDt;
      s.mesh.position.x += s.vx * clampedDt;
      s.mesh.position.y = Math.max(0.05, s.mesh.position.y + s.vy * clampedDt);
      s.mesh.position.z += s.vz * clampedDt;
      s.mesh.rotation.x += s.rx * clampedDt;
      s.mesh.rotation.y += s.ry * clampedDt;
      s.mesh.scale.setScalar(Math.min(1, s.life * 1.4));
    }
  }

  // --------------------------------------------------------------------------
  // Interactive Raycaster & Live Contraption Actions
  // --------------------------------------------------------------------------
  public pickAtNdc(ndcX: number, ndcY: number, camera: THREE.Camera): BoardRaycastHitA | null {
    if (!this.state) return null;
    this.pointerNdc.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointerNdc, camera);
    const hits = this.raycaster.intersectObjects(this.interactiveMeshes, true);
    if (hits.length === 0) return null;

    for (const hit of hits) {
      let cur: THREE.Object3D | null = hit.object;
      while (cur) {
        const ud = cur.userData as {
          hitKind?: BoardRaycastHitA['kind'];
          nodeId?: string;
          nodeIndex?: number;
        };
        if (ud.hitKind) {
          const node = ud.nodeId ? this.state.nodes.find((n) => n.nodeId === ud.nodeId) : undefined;
          return {
            kind: ud.hitKind,
            nodeId: ud.nodeId,
            nodeIndex: ud.nodeIndex,
            worldPoint: [hit.point.x, hit.point.y, hit.point.z],
            lockedChains: node?.lockedChains ?? 0,
          };
        }
        cur = cur.parent;
      }
    }
    return null;
  }

  /**
   * Drop-in `BoardRendererContractV6.pickNodeAtNdc` adapter for `UnifiedBoardManagerV6`.
   */
  public pickNodeAtNdc(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera
  ): { readonly nodeId: string | null; readonly boardPlanePoint: [number, number, number] | null } {
    const hit = this.pickAtNdc(ndcX, ndcY, camera);
    return {
      nodeId: hit?.nodeId ?? null,
      boardPlanePoint: hit ? [...hit.worldPoint] : null,
    };
  }

  public setHoveredNode(nodeId: string | null): void {
    if (this.hoveredNodeId === nodeId) return;
    if (this.hoveredNodeId) {
      const prev = this.nodeRigs.get(this.hoveredNodeId);
      if (prev) prev.targetLiftY = 0;
    }
    this.hoveredNodeId = nodeId;
    if (nodeId) {
      const next = this.nodeRigs.get(nodeId);
      if (next) next.targetLiftY = 0.14;
    }
  }

  public attachPointerListeners(
    domElement: HTMLElement,
    camera: THREE.Camera,
    callbacks: BoardInteractionCallbacksA
  ): () => void {
    const toNdc = (ev: PointerEvent): [number, number] => {
      const rect = domElement.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const y = -(((ev.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      return [x, y];
    };

    const onMove = (ev: PointerEvent): void => {
      const [nx, ny] = toNdc(ev);
      const hit = this.pickAtNdc(nx, ny, camera);
      this.setHoveredNode(hit?.nodeId ?? null);
      domElement.style.cursor = hit ? 'pointer' : 'default';
      callbacks.onNodeHover?.(hit);
    };

    const onDown = (ev: PointerEvent): void => {
      if (!this.state) return;
      const [nx, ny] = toNdc(ev);
      const hit = this.pickAtNdc(nx, ny, camera);
      if (!hit) return;

      if (hit.kind === 'MIRROR_TURRET' && hit.nodeId) {
        const trace = this.rotateMirrorTurret(hit.nodeId, 45);
        const newAngle = this.sideState?.mirrorAnglesDeg[hit.nodeId] ?? 45;
        callbacks.onFoleyCue?.('brass_gear_detent');
        callbacks.onMirrorRotated?.(hit.nodeId, newAngle, trace);
        return;
      }

      if (hit.kind === 'ROULETTE_WHEEL') {
        this.rouletteSpinVel = 6.5;
        callbacks.onFoleyCue?.('rotary_knob_click');
        return;
      }

      if (hit.kind === 'AUCTION_GAVEL') {
        this.gavelStrikeTimer = 0.65;
        callbacks.onFoleyCue?.('paddle_spring_slam');
        return;
      }

      if (hit.nodeId) {
        const node = this.state.nodes.find((n) => n.nodeId === hit.nodeId);
        if (node) {
          callbacks.onFoleyCue?.('ui_brass_tap');
          callbacks.onNodeSelect?.(node, hit);
        }
      }
    };

    domElement.addEventListener('pointermove', onMove);
    domElement.addEventListener('pointerdown', onDown);
    return () => {
      domElement.removeEventListener('pointermove', onMove);
      domElement.removeEventListener('pointerdown', onDown);
      domElement.style.cursor = 'default';
    };
  }

  public rotateMirrorTurret(nodeId: string, deltaDeg = 45): LaserTraceResultA {
    if (!this.state || !this.sideState) {
      return { segments: [], illuminatedNodeIds: [], bounceCount: 0, opticalMultBonus: 0 };
    }
    const prev = this.sideState.mirrorAnglesDeg[nodeId] ?? 45;
    const next = (prev + deltaDeg + 360) % 180;
    this.sideState.mirrorAnglesDeg[nodeId] = next;
    const rig = this.nodeRigs.get(nodeId);
    if (rig?.mirrorTurretGroup) {
      rig.mirrorTurretGroup.rotation.y = (-next * Math.PI) / 180;
    }
    const trace = computeLaserTraceA(this.state, this.sideState.mirrorAnglesDeg);
    this.rebuildLaserBeamMeshes(trace);
    return trace;
  }

  public triggerPinballDrop(targetNodeId: string): PinballSimResultA | null {
    if (!this.state) return null;
    const sim = simulatePinballDropA(this.state, targetNodeId);
    this.pinballAnim = {
      points: sim.pathPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      segmentIndex: 0,
      segmentT: 0,
      active: true,
    };
    return sim;
  }

  public triggerChainShatter(nodeId: string): void {
    const rig = this.nodeRigs.get(nodeId);
    if (!rig) return;
    if (rig.chainGroup) rig.chainGroup.visible = false;

    const worldPos = new THREE.Vector3();
    rig.group.getWorldPosition(worldPos);
    const linkGeo = this.trackGeo(new THREE.TorusGeometry(0.055, 0.016, 6, 10));

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const mesh = new THREE.Mesh(linkGeo, this.ironChainMat);
      mesh.position.set(worldPos.x, worldPos.y + 0.3, worldPos.z);
      this.shardGroup.add(mesh);
      this.shards.push({
        mesh,
        vx: Math.cos(a) * (1.2 + (i % 3) * 0.45),
        vy: 2.2 + (i % 4) * 0.55,
        vz: Math.sin(a) * (1.2 + (i % 3) * 0.45),
        rx: 5 + i * 0.7,
        ry: 4 + i * 0.9,
        life: 0.95,
      });
    }
  }

  public triggerDominoCascade(nodeIds: readonly string[]): void {
    nodeIds.forEach((id) => {
      const rig = this.nodeRigs.get(id);
      if (rig) rig.targetToppleAngleRad = (74 * Math.PI) / 180;
    });
  }

  public triggerShellShuffle(swapCount = 4): number {
    if (this.shellCupGroups.length !== 3 || !this.sideState) return 1;
    const swaps: Array<[number, number]> = [];
    for (let i = 0; i < swapCount; i++) {
      const a = i % 3;
      const b = (i + 1 + (i % 2)) % 3;
      swaps.push([a, b]);
    }
    this.shellAnim = {
      active: true,
      elapsed: 0,
      duration: Math.max(1.2, swapCount * 0.42),
      swaps,
      slotPositions: [
        new THREE.Vector3(-1.25, 0.34, -0.95),
        new THREE.Vector3(0, 0.34, -0.95),
        new THREE.Vector3(1.25, 0.34, -0.95),
      ],
    };
    const nextPearl = (this.sideState.shellPearlCupIndex + swapCount) % 3;
    this.sideState.shellPearlCupIndex = nextPearl;
    return nextPearl;
  }

  public resolveTurnAction(action: BoardTurnActionA): BoardTurnResolutionA {
    if (!this.state || !this.sideState) {
      throw new Error('BoardContraptionRendererA.resolveTurnAction called before mount()');
    }
    const res = resolveContraptionTurnA(this.state, this.sideState, action);
    this.syncState(res.state, res.sideState);

    for (const brokenId of res.brokenChainNodeIds) {
      this.triggerChainShatter(brokenId);
    }
    if (res.toppledNodeIds.length > 0) {
      this.triggerDominoCascade(res.toppledNodeIds);
    }
    if (res.pinballResult) {
      this.triggerPinballDrop(res.pinballResult.targetNodeId);
    }
    if (this.spec?.subVariant === 'ROULETTE_WHEEL_ROTOR') {
      this.rouletteSpinVel = 7.2;
    }
    if (this.spec?.subVariant === 'THREE_SHELL_SHUFFLE') {
      this.triggerShellShuffle(4);
    }
    return res;
  }

  public dispose(): void {
    this.clearSceneContents();
    if (this.mountedParent) {
      this.mountedParent.remove(this.rootGroup);
      this.mountedParent = null;
    }
    for (const tex of this.trackedTextures) tex.dispose();
    for (const mat of this.trackedMaterials) mat.dispose();
    this.trackedTextures.length = 0;
    this.trackedMaterials.length = 0;
  }

  // --------------------------------------------------------------------------
  // Family I Builder: CLOCKWORK_ROTARY (Boards 001 – 010)
  // --------------------------------------------------------------------------
  private buildClockworkScene(state: BoardRuntimeStateV6): void {
    const cw = this.spec?.clockwork;
    const basePlinth = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(2.42, 2.58, 0.22, 48)),
      this.substrateMat
    );
    basePlinth.position.y = 0.02;
    basePlinth.receiveShadow = true;
    this.rootGroup.add(basePlinth);

    const brassRim = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(2.44, 0.065, 14, 64)),
      this.trimMetalMat
    );
    brassRim.rotation.x = Math.PI / 2;
    brassRim.position.y = 0.14;
    this.rootGroup.add(brassRim);

    // Create 3 coaxial (or twin side-by-side) involute brass gear ring groups
    const ringCount = cw?.ringCounts.length ?? 3;
    for (let r = 0; r < ringCount; r++) {
      const grp = new THREE.Group();
      const isTwin = cw?.isTwinSideBySide;
      if (isTwin) {
        grp.position.set(r === 0 ? -1.16 : 1.16, 0, 0);
      }
      const rad = cw?.ringRadii[r] ?? (2.05 - r * 0.65);
      const gearOuter = Math.max(0.5, rad + 0.24);
      const gearInner = Math.max(0.16, rad - 0.26);
      const teeth = Math.max(16, Math.round(gearOuter * 18));
      const gearMesh = new THREE.Mesh(
        this.trackGeo(createInvoluteGearGeometry(gearOuter, gearInner, teeth, 0.075)),
        r % 2 === 0 ? this.trimMetalMat : this.secondaryMetalMat
      );
      gearMesh.position.y = 0.12 + r * 0.1;
      gearMesh.castShadow = true;
      gearMesh.receiveShadow = true;
      grp.add(gearMesh);

      // 4 machined spokes linking each gear ring to central brass arbor
      for (let s = 0; s < 4; s++) {
        const spoke = new THREE.Mesh(
          this.trackGeo(new THREE.BoxGeometry(gearOuter * 1.7, 0.035, 0.075)),
          this.trimMetalMat
        );
        spoke.position.y = 0.14 + r * 0.1;
        spoke.rotation.y = (s / 4) * Math.PI;
        grp.add(spoke);
      }

      this.ringGroups.push(grp);
      this.rootGroup.add(grp);
    }

    // Center ruby jewel arbor hub
    const hub = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.24, 0.28, 0.5, 24)),
      this.trimMetalMat
    );
    hub.position.y = 0.28;
    this.rootGroup.add(hub);
    const hubJewel = new THREE.Mesh(
      this.trackGeo(new THREE.OctahedronGeometry(0.16, 0)),
      this.playerEmissiveMat
    );
    hubJewel.position.y = 0.58;
    this.rootGroup.add(hubJewel);

    // 12-o'clock Brass Laser Emitter + Volumetric x3 Alignment Laser Beam
    const emitter = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.12, 0.16, 0.36, 16)),
      this.trimMetalMat
    );
    emitter.position.set(0, 0.32, -2.42);
    this.rootGroup.add(emitter);

    const beamGeo = this.trackGeo(new THREE.CylinderGeometry(0.032, 0.032, 2.38, 12));
    beamGeo.rotateX(Math.PI / 2);
    this.orreryLaserBeam = new THREE.Mesh(beamGeo, this.rubyLaserMat);
    this.orreryLaserBeam.position.set(0, 0.44, -1.2);
    this.orreryLaserBeam.visible = false;
    this.rootGroup.add(this.orreryLaserBeam);

    // Bespoke Clockwork Sub-Variant Hero Props
    if (cw?.hasEscapementWindow) {
      this.escapementPallet = new THREE.Group();
      const arm = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(0.1, 0.08, 3.8)),
        this.secondaryMetalMat
      );
      arm.position.y = 0.52;
      this.escapementPallet.add(arm);
      this.rootGroup.add(this.escapementPallet);
    }
    if (cw?.hasCurtainMask) {
      const curtainMat = this.trackMat(
        new THREE.MeshStandardMaterial({ color: 0x7a1220, roughness: 0.78, metalness: 0.05 })
      );
      const arch = new THREE.Mesh(
        this.trackGeo(new THREE.TorusGeometry(2.38, 0.18, 12, 32, Math.PI)),
        curtainMat
      );
      arch.position.set(0, 0.34, -0.45);
      arch.rotation.x = Math.PI / 2;
      arch.rotation.z = Math.PI;
      this.rootGroup.add(arch);
    }
    if (cw?.hasTonearmSweep) {
      this.tonearmGroup = new THREE.Group();
      this.tonearmGroup.position.set(2.15, 0.48, -1.55);
      const rod = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.03, 0.03, 2.15, 10)),
        this.trimMetalMat
      );
      rod.rotation.z = Math.PI / 2;
      rod.position.x = -1.05;
      this.tonearmGroup.add(rod);
      this.rootGroup.add(this.tonearmGroup);
    }

    // Mount node medallions directly onto their rotating ring groups!
    const isTwin = Boolean(cw?.isTwinSideBySide);
    for (const node of state.nodes) {
      const rIdx = Math.min(this.ringGroups.length - 1, node.ringIndex ?? 0);
      const parentGrp = this.ringGroups[rIdx] ?? this.rootGroup;
      const localX = isTwin ? node.pos3d[0] - (rIdx === 0 ? -1.16 : 1.16) : node.pos3d[0];
      this.createNodeRig(node, parentGrp, [localX, node.pos3d[1], node.pos3d[2]], 'CLOCKWORK_MEDALLION');
    }
  }

  // --------------------------------------------------------------------------
  // Family II Builder: TURF_WAR_BRIDGES (Boards 011 – 020)
  // --------------------------------------------------------------------------
  private buildTurfWarScene(state: BoardRuntimeStateV6): void {
    const turf = this.spec?.turf;
    // Octagonal beveled stage table beneath the crystal hex span
    const deck = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(2.45, 2.6, 0.18, 8)),
      this.substrateMat
    );
    deck.position.y = 0.02;
    deck.receiveShadow = true;
    this.rootGroup.add(deck);

    // West & East Engraved Brass Bridge Piers
    for (const side of [-1, 1]) {
      const pier = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(0.26, 0.42, 2.55)),
        this.trimMetalMat
      );
      pier.position.set(side * 2.28, 0.24, 0);
      pier.castShadow = true;
      this.rootGroup.add(pier);
    }

    // Visual neighbor bridge conduits (Kintsugi molten gold seams / Subway illuminated rails / Copper bus)
    const linkColor =
      this.spec?.subVariant === 'KINTSUGI_GO_CAPTURE'
        ? 0xffcf4d
        : this.spec?.subVariant === 'CIRCUIT_BUS_POWER'
          ? 0x4affb8
          : this.spec?.definition.accentPalette.primaryHex ?? 0xd9af54;
    const bridgeMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: linkColor,
        emissive: linkColor,
        emissiveIntensity: 0.32,
        roughness: 0.26,
        metalness: 0.85,
      })
    );
    const drawnPairs = new Set<string>();
    for (const node of state.nodes) {
      for (const nbId of node.neighbors) {
        const key = node.nodeId < nbId ? `${node.nodeId}|${nbId}` : `${nbId}|${node.nodeId}`;
        if (drawnPairs.has(key)) continue;
        drawnPairs.add(key);
        const nb = state.nodes.find((x) => x.nodeId === nbId);
        if (!nb) continue;
        const a = new THREE.Vector3(node.pos3d[0], 0.16, node.pos3d[2]);
        const b = new THREE.Vector3(nb.pos3d[0], 0.16, nb.pos3d[2]);
        const len = a.distanceTo(b);
        const bar = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.055, 0.04, len)), bridgeMat);
        bar.position.copy(a).lerp(b, 0.5);
        bar.lookAt(b);
        this.rootGroup.add(bar);
      }
    }

    // Tug-of-War braided stage rope + crimson ribbon marker
    if (this.spec?.subVariant === 'TUG_ROPE_TENSION') {
      const rope = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 4.4, 12)),
        this.trimMetalMat
      );
      rope.rotation.z = Math.PI / 2;
      rope.position.set(0, 0.44, 0);
      this.rootGroup.add(rope);

      this.tugKnotMesh = new THREE.Mesh(
        this.trackGeo(new THREE.OctahedronGeometry(0.18, 0)),
        this.rivalEmissiveMat
      );
      this.tugKnotMesh.position.set(0, 0.56, 0);
      this.rootGroup.add(this.tugKnotMesh);
    }

    const shapeKind =
      turf?.layoutKind === 'SUBWAY_16' || turf?.layoutKind === 'CIRCUIT_16'
        ? 'SQUARE_VAULT'
        : 'BEVELED_HEX';

    for (const node of state.nodes) {
      this.createNodeRig(node, this.rootGroup, node.pos3d, shapeKind);
    }
  }

  // --------------------------------------------------------------------------
  // Family III Builder: GRAVITY_PHYSICS (Boards 021 – 030)
  // --------------------------------------------------------------------------
  private buildGravityPhysicsScene(state: BoardRuntimeStateV6): void {
    const grav = this.spec?.gravity;
    const tiltRad = ((grav?.tiltDeg ?? 0) * Math.PI) / 180;

    // Inclined mahogany/copper gravity cabinet deck
    const deck = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(4.6, 0.16, 3.8)),
      this.substrateMat
    );
    deck.position.y = 0.08;
    deck.rotation.x = tiltRad;
    deck.receiveShadow = true;
    this.rootGroup.add(deck);

    // Brass guardrails framing the gravity table
    for (const sx of [-2.26, 2.26]) {
      const rail = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(0.1, 0.28, 3.85)),
        this.trimMetalMat
      );
      rail.position.set(sx, 0.2, 0);
      rail.rotation.x = tiltRad;
      this.rootGroup.add(rail);
    }

    if (
      grav?.contraptionKind === 'PINBALL' ||
      grav?.contraptionKind === 'PACHINKO' ||
      grav?.contraptionKind === 'PLINKO' ||
      grav?.contraptionKind === 'VORTEX'
    ) {
      // Spun-brass hyperbolic funnel for Marble Vortex
      if (grav.contraptionKind === 'VORTEX') {
        const lathePts: THREE.Vector2[] = [];
        for (let i = 0; i <= 14; i++) {
          const t = i / 14;
          lathePts.push(new THREE.Vector2(0.28 + t * 1.95, 0.08 + t * t * 0.58));
        }
        const funnel = new THREE.Mesh(
          this.trackGeo(new THREE.LatheGeometry(lathePts, 40)),
          this.trimMetalMat
        );
        funnel.material = this.trackMat(
          new THREE.MeshStandardMaterial({
            color: this.spec?.definition.accentPalette.primaryHex ?? 0xd4964c,
            roughness: 0.25,
            metalness: 0.84,
            side: THREE.DoubleSide,
          })
        );
        this.rootGroup.add(funnel);
      }

      // Lit 3D Brass Pop-Bumpers
      const bumperGeo = this.trackGeo(new THREE.CylinderGeometry(0.16, 0.21, 0.22, 20));
      const bumperCapMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: this.spec?.definition.accentPalette.gemHex ?? 0xff4769,
          emissive: this.spec?.definition.accentPalette.gemHex ?? 0xff4769,
          emissiveIntensity: 0.65,
          roughness: 0.2,
          metalness: 0.5,
        })
      );
      for (const [rawBx, bz] of grav.bumperPositions ?? []) {
        const bx = Math.abs(rawBx) < 0.32 ? (rawBx >= 0 ? 0.56 : -0.56) : rawBx;
        const bumper = new THREE.Mesh(bumperGeo, bumperCapMat);
        bumper.position.set(bx, 0.34 - bz * Math.sin(tiltRad), bz);
        bumper.castShadow = true;
        this.pinballBumpers.push(bumper);
        this.rootGroup.add(bumper);
      }

      // Mirror-Chrome 3D Steel Pinball / Marble
      this.pinballMesh = new THREE.Mesh(
        this.trackGeo(new THREE.SphereGeometry(0.145, 24, 24)),
        this.chromeBallMat
      );
      this.pinballMesh.position.set(1.98, 0.45, 1.35);
      this.pinballMesh.castShadow = true;
      this.rootGroup.add(this.pinballMesh);
    }

    if (grav?.contraptionKind === 'PENDULUM' || grav?.contraptionKind === 'NEWTON_CRADLE') {
      // Overhead brass gantry frame + swinging counterweight pendulum / cradle bob
      const gantry = new THREE.Mesh(
        this.trackGeo(new THREE.TorusGeometry(2.1, 0.055, 10, 32, Math.PI)),
        this.trimMetalMat
      );
      gantry.position.set(0, 0.2, -1.65);
      this.rootGroup.add(gantry);

      this.pendulumArmGroup = new THREE.Group();
      this.pendulumArmGroup.position.set(0, 2.2, -1.65);
      const rod = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.025, 0.025, 1.45, 10)),
        this.trimMetalMat
      );
      rod.position.y = -0.72;
      const bob = new THREE.Mesh(
        this.trackGeo(new THREE.SphereGeometry(0.22, 24, 24)),
        grav.contraptionKind === 'NEWTON_CRADLE' ? this.chromeBallMat : this.trimMetalMat
      );
      bob.position.y = -1.48;
      this.pendulumArmGroup.add(rod, bob);
      this.rootGroup.add(this.pendulumArmGroup);
    }

    if (grav?.contraptionKind === 'BALANCE_SCALE' || grav?.contraptionKind === 'SEESAW') {
      // Central brass fulcrum pillar + tilting balance beam + twin hanging pans
      const pillar = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.12, 0.24, 1.2, 20)),
        this.trimMetalMat
      );
      pillar.position.set(0, 0.65, -1.35);
      this.rootGroup.add(pillar);

      this.balanceBeamGroup = new THREE.Group();
      this.balanceBeamGroup.position.set(0, 1.24, -1.35);
      const beam = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(2.85, 0.08, 0.12)),
        this.trimMetalMat
      );
      this.balanceBeamGroup.add(beam);

      this.balanceLeftPan = new THREE.Group();
      this.balanceLeftPan.position.set(-1.32, 0, 0);
      const leftDish = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.46, 0.34, 0.09, 20)),
        this.trimMetalMat
      );
      leftDish.position.y = -0.58;
      this.balanceLeftPan.add(leftDish);

      this.balanceRightPan = new THREE.Group();
      this.balanceRightPan.position.set(1.32, 0, 0);
      const rightDish = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.46, 0.34, 0.09, 20)),
        this.trimMetalMat
      );
      rightDish.position.y = -0.58;
      this.balanceRightPan.add(rightDish);

      this.balanceBeamGroup.add(this.balanceLeftPan, this.balanceRightPan);
      this.rootGroup.add(this.balanceBeamGroup);
    }

    const shapeKind =
      grav?.contraptionKind === 'DOMINO' || grav?.contraptionKind === 'AVALANCHE'
        ? 'STANDING_DOMINO'
        : 'PINBALL_SAUCER';

    for (const node of state.nodes) {
      this.createNodeRig(node, this.rootGroup, node.pos3d, shapeKind);
    }
  }

  // --------------------------------------------------------------------------
  // Family IV Builder: CASINO_PUSH_LUCK (Boards 031 – 040)
  // --------------------------------------------------------------------------
  private buildCasinoPushLuckScene(state: BoardRuntimeStateV6): void {
    const cas = this.spec?.casino;

    // Emerald Monte Carlo baize felt tabletop
    const feltTable = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(2.42, 2.48, 0.16, 48)),
      this.feltMat
    );
    feltTable.position.y = 0.04;
    feltTable.receiveShadow = true;
    this.rootGroup.add(feltTable);

    // Padded mahogany/walnut burl rail + inlaid brass trim band
    const rail = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(2.44, 0.13, 14, 64)),
      this.substrateMat
    );
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 0.16;
    this.rootGroup.add(rail);

    const inlayRing = new THREE.Mesh(
      this.trackGeo(new THREE.TorusGeometry(2.26, 0.024, 8, 64)),
      this.trimMetalMat
    );
    inlayRing.rotation.x = Math.PI / 2;
    inlayRing.position.y = 0.14;
    this.rootGroup.add(inlayRing);

    // European Roulette spinning mahogany & brass rotor
    if (cas?.tableGameKind === 'ROULETTE') {
      this.rouletteRotorGroup = new THREE.Group();
      this.rouletteRotorGroup.position.set(0, 0.16, 0);
      const bowl = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.95, 1.05, 0.22, 32)),
        this.substrateMat
      );
      const turret = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.14, 0.22, 0.42, 16)),
        this.trimMetalMat
      );
      turret.position.y = 0.2;
      for (let i = 0; i < 4; i++) {
        const spoke = new THREE.Mesh(
          this.trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 8)),
          this.trimMetalMat
        );
        spoke.rotation.z = Math.PI / 2;
        spoke.rotation.y = (i / 4) * Math.PI;
        spoke.position.y = 0.34;
        this.rouletteRotorGroup.add(spoke);
      }
      this.rouletteRotorGroup.add(bowl, turret);
      this.rouletteRotorGroup.userData = { hitKind: 'ROULETTE_WHEEL' };
      this.interactiveMeshes.push(this.rouletteRotorGroup);
      this.rootGroup.add(this.rouletteRotorGroup);

      this.rouletteBallMesh = new THREE.Mesh(
        this.trackGeo(new THREE.SphereGeometry(0.075, 16, 16)),
        this.ivoryMat
      );
      this.rouletteBallMesh.position.set(0.72, 0.38, 0);
      this.rootGroup.add(this.rouletteBallMesh);
    }

    // Three-Shell Monte lathe-turned brass cups + hidden emerald pearl
    if (cas?.tableGameKind === 'THREE_SHELL') {
      const cupGeo = this.trackGeo(new THREE.CylinderGeometry(0.2, 0.34, 0.42, 24));
      this.shellPearlMesh = new THREE.Mesh(
        this.trackGeo(new THREE.OctahedronGeometry(0.12, 1)),
        this.trackMat(
          new THREE.MeshStandardMaterial({
            color: 0x2effa4,
            emissive: 0x0ea865,
            emissiveIntensity: 0.9,
            roughness: 0.12,
            metalness: 0.3,
          })
        )
      );
      this.shellPearlMesh.position.set(0, 0.26, -0.95);
      this.rootGroup.add(this.shellPearlMesh);

      for (let c = 0; c < 3; c++) {
        const cupGrp = new THREE.Group();
        const cup = new THREE.Mesh(cupGeo, this.trimMetalMat);
        cup.position.y = 0.18;
        cup.castShadow = true;
        cupGrp.add(cup);
        cupGrp.position.set((c - 1) * 1.25, 0.34, -0.95);
        cupGrp.userData = {
          hitKind: 'SHELL_CUP',
          nodeId: state.nodes[c]?.nodeId,
          nodeIndex: c,
        };
        this.shellCupGroups.push(cupGrp);
        this.interactiveMeshes.push(cupGrp);
        this.rootGroup.add(cupGrp);
      }
    }

    // Twin 3D Ivory & Gold Craps Dice
    if (cas?.tableGameKind === 'CRAPS') {
      const dieGeo = this.trackGeo(new THREE.BoxGeometry(0.24, 0.24, 0.24));
      for (let i = 0; i < 2; i++) {
        const die = new THREE.Mesh(dieGeo, this.ivoryMat);
        die.position.set(-0.24 + i * 0.48, 0.36, -1.62);
        die.rotation.set(0.4 + i, 0.8 * i, 0.3);
        die.castShadow = true;
        this.crapsDiceMeshes.push(die);
        this.rootGroup.add(die);
      }
    }

    // Walnut & Brass Host's Blind Auction Gavel
    if (cas?.tableGameKind === 'BLIND_AUCTION') {
      this.auctionGavelGroup = new THREE.Group();
      this.auctionGavelGroup.position.set(0, 0.26, -1.65);
      const handle = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.035, 0.045, 0.72, 12)),
        this.substrateMat
      );
      handle.rotation.z = Math.PI / 2;
      handle.position.x = 0.22;
      const head = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.34, 16)),
        this.trimMetalMat
      );
      head.position.x = -0.14;
      this.auctionGavelGroup.add(handle, head);
      this.auctionGavelGroup.userData = { hitKind: 'AUCTION_GAVEL' };
      this.interactiveMeshes.push(this.auctionGavelGroup);
      this.rootGroup.add(this.auctionGavelGroup);
    }

    for (const node of state.nodes) {
      this.createNodeRig(node, this.rootGroup, node.pos3d, 'CASINO_CHIP_PLAQUE');
    }
  }

  // --------------------------------------------------------------------------
  // Family V Builder: STEALTH_OPTICS_RADAR (Boards 041 – 050)
  // --------------------------------------------------------------------------
  private buildStealthOpticsScene(state: BoardRuntimeStateV6): void {
    const st = this.spec?.stealth;
    const isPolarRadar =
      st?.opticsKind === 'SONAR_PPI' ||
      st?.opticsKind === 'BATHYSPHERE_AIRLOCK' ||
      st?.opticsKind === 'PERISCOPE_GRID' ||
      st?.opticsKind === 'TRIANGULATION';

    if (isPolarRadar) {
      // Heavy riveted bronze/olive circular oscilloscope housing
      const housing = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(2.42, 2.54, 0.22, 48)),
        this.bunkerSteelMat
      );
      housing.position.y = 0.02;
      this.rootGroup.add(housing);

      const bezel = new THREE.Mesh(
        this.trackGeo(new THREE.TorusGeometry(2.38, 0.09, 14, 64)),
        this.trimMetalMat
      );
      bezel.rotation.x = Math.PI / 2;
      bezel.position.y = 0.16;
      this.rootGroup.add(bezel);

      // Custom GLSL WebGL2 Submarine Phosphor Sonar Sweep Shader Disc!
      this.sonarShaderMat = new THREE.ShaderMaterial({
        vertexShader: SONAR_VERTEX_SHADER,
        fragmentShader: SONAR_FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uSweepAngle: { value: 0 },
          uTime: { value: 0 },
          uPhosphorColor: {
            value: new THREE.Color(
              st?.opticsKind === 'BATHYSPHERE_AIRLOCK' ? 0x3de8f5 : 0x3ef095
            ),
          },
          uBgColor: { value: new THREE.Color(0x061614) },
        },
      });
      this.trackedMaterials.push(this.sonarShaderMat);
      const screen = new THREE.Mesh(
        this.trackGeo(new THREE.CircleGeometry(2.32, 64)),
        this.sonarShaderMat
      );
      screen.rotation.x = -Math.PI / 2;
      screen.position.y = 0.145;
      this.rootGroup.add(screen);
    } else {
      // 1969 Matte Olive-Steel Optical / Breaker / X-Ray Console Bench
      const bench = new THREE.Mesh(
        this.trackGeo(new THREE.BoxGeometry(4.68, 0.2, 3.85)),
        this.bunkerSteelMat
      );
      bench.position.y = 0.04;
      bench.receiveShadow = true;
      this.rootGroup.add(bench);

      // Brass Laser / Prism Emitter Cannon at left edge
      if (st?.opticsKind === 'LASER_MIRROR' || st?.opticsKind === 'PRISM_SPLITTER') {
        const cannon = new THREE.Mesh(
          this.trackGeo(new THREE.CylinderGeometry(0.11, 0.14, 0.42, 16)),
          this.trimMetalMat
        );
        cannon.rotation.z = Math.PI / 2;
        cannon.position.set(st.emitterPos[0], 0.44, st.emitterPos[1]);
        this.rootGroup.add(cannon);

        this.laserBeamsGroup = new THREE.Group();
        this.rootGroup.add(this.laserBeamsGroup);
      }

      // Dual Sweeping Heist Searchlights
      if (st?.opticsKind === 'SEARCHLIGHT_YARD') {
        const coneMat = this.trackMat(
          new THREE.MeshBasicMaterial({
            color: 0xfff099,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        for (const sx of [-2.1, 2.1]) {
          const arm = new THREE.Group();
          arm.position.set(sx, 0.52, -1.6);
          const cone = new THREE.Mesh(this.trackGeo(new THREE.ConeGeometry(0.75, 3.6, 20, 1, true)), coneMat);
          cone.rotation.x = Math.PI / 2;
          cone.position.z = 1.8;
          arm.add(cone);
          this.searchlightArms.push(arm);
          this.rootGroup.add(arm);
        }
      }

      // Cyan Fluoroscope X-Ray Scanner Arch
      if (st?.opticsKind === 'XRAY_BELT') {
        const xrayMat = this.trackMat(
          new THREE.MeshBasicMaterial({
            color: 0x52e5ff,
            transparent: true,
            opacity: 0.26,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        this.xrayArchMesh = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(4.4, 0.95, 0.22)), xrayMat);
        this.xrayArchMesh.position.set(0, 0.58, 0);
        this.rootGroup.add(this.xrayArchMesh);
      }
    }

    const mirrorSet = new Set(st?.mirrorNodeIndices ?? []);
    for (const node of state.nodes) {
      const isMirror = mirrorSet.has(node.index);
      const kind =
        isMirror && st?.opticsKind === 'PRISM_SPLITTER'
          ? 'CRYSTAL_PRISM'
          : isMirror
            ? 'MIRROR_TURRET'
            : st?.opticsKind === 'NIXIE_BREAKER'
              ? 'NIXIE_BREAKER'
              : 'OPTICAL_VAULT';
      this.createNodeRig(node, this.rootGroup, node.pos3d, kind);
    }

    if (this.laserBeamsGroup && this.sideState) {
      this.rebuildLaserBeamMeshes(computeLaserTraceA(state, this.sideState.mirrorAnglesDeg));
    }
  }

  // --------------------------------------------------------------------------
  // Unified Per-Node 3D PBR Rig Factory (Bespoke Shape per Contraption Family)
  // --------------------------------------------------------------------------
  private createNodeRig(
    node: BoardNodeV6,
    parent: THREE.Group,
    localPos: readonly [number, number, number],
    visualKind:
      | 'CLOCKWORK_MEDALLION'
      | 'BEVELED_HEX'
      | 'SQUARE_VAULT'
      | 'STANDING_DOMINO'
      | 'PINBALL_SAUCER'
      | 'CASINO_CHIP_PLAQUE'
      | 'MIRROR_TURRET'
      | 'CRYSTAL_PRISM'
      | 'NIXIE_BREAKER'
      | 'OPTICAL_VAULT'
  ): void {
    const group = new THREE.Group();
    group.position.set(localPos[0], localPos[1], localPos[2]);

    const rimMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: this.spec?.definition.accentPalette.primaryHex ?? 0xd9af54,
        roughness: 0.24,
        metalness: 0.86,
      })
    );
    const plaqueMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.22,
      })
    );

    let bodyMesh: THREE.Mesh;
    let rimMesh: THREE.Mesh;
    let plaqueMesh: THREE.Mesh;
    let mirrorTurretGroup: THREE.Group | null = null;
    let chipStackGroup: THREE.Group | null = null;
    let nixieBulbMesh: THREE.Mesh | null = null;

    if (visualKind === 'BEVELED_HEX') {
      bodyMesh = new THREE.Mesh(this.trackGeo(createBeveledHexGeometry(0.4, 0.14)), this.crystalMat);
      rimMesh = new THREE.Mesh(this.trackGeo(createBeveledHexGeometry(0.43, 0.07)), rimMat);
      rimMesh.position.y = -0.02;
      plaqueMesh = new THREE.Mesh(this.trackGeo(new THREE.CircleGeometry(0.28, 6)), plaqueMat);
      plaqueMesh.rotation.x = -Math.PI / 2;
      plaqueMesh.position.y = 0.166;
    } else if (visualKind === 'STANDING_DOMINO') {
      const domGeo = this.trackGeo(new THREE.BoxGeometry(0.36, 0.62, 0.12));
      domGeo.translate(0, 0.31, 0); // Pivot at bottom edge for realistic rigid-body toppling!
      bodyMesh = new THREE.Mesh(domGeo, this.ivoryMat);
      rimMesh = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.38, 0.04, 0.14)), rimMat);
      rimMesh.position.y = 0.31;
      bodyMesh.add(rimMesh);
      plaqueMesh = new THREE.Mesh(this.trackGeo(new THREE.PlaneGeometry(0.32, 0.32)), plaqueMat);
      plaqueMesh.position.set(0, 0.44, 0.065);
      bodyMesh.add(plaqueMesh);
    } else if (visualKind === 'CASINO_CHIP_PLAQUE') {
      bodyMesh = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.34, 0.36, 0.12, 24)), this.feltMat);
      rimMesh = new THREE.Mesh(this.trackGeo(new THREE.TorusGeometry(0.35, 0.032, 8, 28)), rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.05;
      plaqueMesh = new THREE.Mesh(this.trackGeo(new THREE.CircleGeometry(0.31, 24)), plaqueMat);
      plaqueMesh.rotation.x = -Math.PI / 2;
      plaqueMesh.position.y = 0.065;

      // Mini 3D Clay-Composite Casino Chip Stack perched on plaque edge
      chipStackGroup = new THREE.Group();
      chipStackGroup.position.set(0.25, 0.04, -0.22);
      const chipGeo = this.trackGeo(new THREE.CylinderGeometry(0.095, 0.095, 0.032, 16));
      const chipsToStack = Math.min(5, Math.max(2, Math.round(node.baseChips / 80)));
      for (let c = 0; c < chipsToStack; c++) {
        const chip = new THREE.Mesh(chipGeo, c % 2 === 0 ? rimMat : this.rivalEmissiveMat);
        chip.position.y = c * 0.034;
        chipStackGroup.add(chip);
      }
      group.add(chipStackGroup);
    } else if (visualKind === 'MIRROR_TURRET' || visualKind === 'CRYSTAL_PRISM') {
      bodyMesh = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.34, 0.38, 0.12, 20)), this.bunkerSteelMat);
      rimMesh = new THREE.Mesh(this.trackGeo(new THREE.TorusGeometry(0.36, 0.034, 8, 24)), rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.06;
      plaqueMesh = new THREE.Mesh(this.trackGeo(new THREE.CircleGeometry(0.26, 20)), plaqueMat);
      plaqueMesh.rotation.x = -Math.PI / 2;
      plaqueMesh.position.y = 0.068;

      mirrorTurretGroup = new THREE.Group();
      mirrorTurretGroup.position.y = 0.24;
      if (visualKind === 'CRYSTAL_PRISM') {
        const prism = new THREE.Mesh(
          this.trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 3)),
          this.trackMat(
            new THREE.MeshPhysicalMaterial({
              color: 0xd8f4ff,
              roughness: 0.06,
              metalness: 0.05,
              clearcoat: 1.0,
              transparent: true,
              opacity: 0.85,
            })
          )
        );
        mirrorTurretGroup.add(prism);
      } else {
        const mirrorPlate = new THREE.Mesh(
          this.trackGeo(new THREE.BoxGeometry(0.46, 0.32, 0.045)),
          this.chromeBallMat
        );
        const frame = new THREE.Mesh(
          this.trackGeo(new THREE.BoxGeometry(0.5, 0.36, 0.03)),
          this.trimMetalMat
        );
        frame.position.z = -0.02;
        mirrorTurretGroup.add(mirrorPlate, frame);
      }
      mirrorTurretGroup.userData = { hitKind: 'MIRROR_TURRET', nodeId: node.nodeId, nodeIndex: node.index };
      group.add(mirrorTurretGroup);
    } else if (visualKind === 'NIXIE_BREAKER') {
      bodyMesh = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.64, 0.14, 0.56)), this.bunkerSteelMat);
      rimMesh = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(0.68, 0.04, 0.6)), rimMat);
      rimMesh.position.y = 0.06;
      plaqueMesh = new THREE.Mesh(this.trackGeo(new THREE.PlaneGeometry(0.56, 0.46)), plaqueMat);
      plaqueMesh.rotation.x = -Math.PI / 2;
      plaqueMesh.position.y = 0.085;

      // Blown-glass orange glowing Nixie bulb perched on upper edge
      const nixieMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xff8a2b,
          emissive: 0xff6200,
          emissiveIntensity: 1.2,
          roughness: 0.14,
          transparent: true,
          opacity: 0.88,
        })
      );
      nixieBulbMesh = new THREE.Mesh(this.trackGeo(new THREE.CylinderGeometry(0.09, 0.1, 0.3, 14)), nixieMat);
      nixieBulbMesh.position.set(0, 0.22, -0.18);
      group.add(nixieBulbMesh);
    } else {
      // Clockwork Medallion / Pinball Saucer / Square Vault / Optical Vault
      const isSq = visualKind === 'SQUARE_VAULT';
      bodyMesh = new THREE.Mesh(
        this.trackGeo(
          isSq ? new THREE.BoxGeometry(0.66, 0.14, 0.62) : new THREE.CylinderGeometry(0.32, 0.36, 0.14, 24)
        ),
        this.crystalMat
      );
      rimMesh = new THREE.Mesh(
        this.trackGeo(
          isSq ? new THREE.BoxGeometry(0.7, 0.05, 0.66) : new THREE.TorusGeometry(0.34, 0.032, 8, 28)
        ),
        rimMat
      );
      if (!isSq) rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.06;
      plaqueMesh = new THREE.Mesh(
        this.trackGeo(isSq ? new THREE.PlaneGeometry(0.58, 0.54) : new THREE.CircleGeometry(0.29, 24)),
        plaqueMat
      );
      plaqueMesh.rotation.x = -Math.PI / 2;
      plaqueMesh.position.y = 0.078;
    }

    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;

    if (visualKind !== 'STANDING_DOMINO') {
      group.add(bodyMesh, rimMesh, plaqueMesh);
    } else {
      group.add(bodyMesh);
    }

    // 3D Wrought-Iron Chain overlay for locked nodes!
    let chainGroup: THREE.Group | null = null;
    if (node.lockedChains > 0) {
      chainGroup = createWroughtIronChainOverlay(this.ironChainMat, 0.4);
      group.add(chainGroup);
    }

    group.userData = {
      hitKind: 'NODE',
      nodeId: node.nodeId,
      nodeIndex: node.index,
    };
    this.interactiveMeshes.push(group);
    parent.add(group);

    this.nodeRigs.set(node.nodeId, {
      nodeId: node.nodeId,
      nodeIndex: node.index,
      ringIndex: node.ringIndex ?? 0,
      group,
      bodyMesh,
      rimMesh,
      plaqueMesh,
      plaqueMat,
      chainGroup,
      mirrorTurretGroup,
      chipStackGroup,
      nixieBulbMesh,
      baseY: localPos[1],
      currentLiftY: 0,
      targetLiftY: 0,
      toppleAngleRad: 0,
      targetToppleAngleRad: 0,
    });
  }

  // --------------------------------------------------------------------------
  // Internal Helpers: Laser Beam Meshes, Shell Bezier Shuffle, Badges, Cleanup
  // --------------------------------------------------------------------------
  private rebuildLaserBeamMeshes(trace: LaserTraceResultA): void {
    if (!this.laserBeamsGroup) return;
    while (this.laserBeamsGroup.children.length > 0) {
      const child = this.laserBeamsGroup.children.pop()!;
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material && !this.trackedMaterials.includes(child.material)) {
          child.material.dispose();
        }
      }
    }

    for (const seg of trace.segments) {
      const a = new THREE.Vector3(seg.from[0], 0.44, seg.from[1]);
      const b = new THREE.Vector3(seg.to[0], 0.44, seg.to[1]);
      const len = a.distanceTo(b);
      if (len < 0.02) continue;
      const geo = new THREE.CylinderGeometry(0.026, 0.026, len, 10);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: seg.colorHex,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beam = new THREE.Mesh(geo, mat);
      beam.position.copy(a).lerp(b, 0.5);
      beam.lookAt(b);
      this.laserBeamsGroup.add(beam);
    }
  }

  private updateShellShuffleAnim(dt: number): void {
    this.shellAnim.elapsed += dt;
    const totalSwaps = this.shellAnim.swaps.length;
    if (totalSwaps === 0 || this.shellAnim.elapsed >= this.shellAnim.duration) {
      this.shellAnim.active = false;
      this.shellCupGroups.forEach((cup, i) => {
        cup.position.copy(this.shellAnim.slotPositions[i]);
      });
      if (this.shellPearlMesh && this.sideState) {
        const idx = this.sideState.shellPearlCupIndex % 3;
        this.shellPearlMesh.position.x = this.shellAnim.slotPositions[idx].x;
      }
      return;
    }

    const perSwap = this.shellAnim.duration / totalSwaps;
    const stepIdx = Math.min(totalSwaps - 1, Math.floor(this.shellAnim.elapsed / perSwap));
    const localT = (this.shellAnim.elapsed - stepIdx * perSwap) / perSwap;
    const smoothT = localT * localT * (3 - 2 * localT);
    const [a, b] = this.shellAnim.swaps[stepIdx];
    const posA = this.shellAnim.slotPositions[a];
    const posB = this.shellAnim.slotPositions[b];
    const arcZ = Math.sin(smoothT * Math.PI) * 0.42;

    this.shellCupGroups[a].position.set(
      THREE.MathUtils.lerp(posA.x, posB.x, smoothT),
      0.34,
      posA.z + arcZ
    );
    this.shellCupGroups[b].position.set(
      THREE.MathUtils.lerp(posB.x, posA.x, smoothT),
      0.34,
      posB.z - arcZ
    );
  }

  private formatNodeBadgeText(node: BoardNodeV6): string {
    const spec = this.spec;
    if (!spec) return `$${node.baseChips}`;
    if (spec.casino?.tableGameKind === 'BLACKJACK_21') {
      const v = spec.casino.cardValuesByIndex?.[node.index];
      if (v !== undefined) return String(v);
    }
    if (spec.casino?.tableGameKind === 'POKER_RIVER') {
      const lbl = spec.casino.pokerLabelsByIndex?.[node.index];
      if (lbl) return lbl;
    }
    if (spec.casino?.tableGameKind === 'MINESWEEPER' && this.sideState) {
      const revealed = this.sideState.minesweeperRevealedCounts[node.nodeId];
      if (revealed !== undefined) return `M:${revealed}`;
    }
    if (spec.gravity?.weightGramsByIndex) {
      const g = spec.gravity.weightGramsByIndex[node.index];
      if (g !== undefined) return `${g}g`;
    }
    if (spec.stealth?.mirrorNodeIndices?.includes(node.index) && this.sideState) {
      const deg = this.sideState.mirrorAnglesDeg[node.nodeId] ?? 45;
      return `${deg}d`;
    }
    return `$${node.baseChips}`;
  }

  private trackGeo<T extends THREE.BufferGeometry>(geo: T): T {
    this.trackedGeometries.push(geo);
    return geo;
  }

  private trackMat<T extends THREE.Material>(mat: T): T {
    this.trackedMaterials.push(mat);
    return mat;
  }

  private clearSceneContents(): void {
    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }
    while (this.shardGroup.children.length > 0) {
      this.shardGroup.remove(this.shardGroup.children[0]);
    }
    for (const rig of this.nodeRigs.values()) {
      if (rig.plaqueMat.map) rig.plaqueMat.map.dispose();
    }
    for (const geo of this.trackedGeometries) geo.dispose();
    this.trackedGeometries.length = 0;

    this.nodeRigs.clear();
    this.interactiveMeshes.length = 0;
    this.ringGroups.length = 0;
    this.pinballBumpers.length = 0;
    this.shellCupGroups.length = 0;
    this.crapsDiceMeshes.length = 0;
    this.searchlightArms.length = 0;
    this.shards.length = 0;
    this.orreryLaserBeam = null;
    this.escapementPallet = null;
    this.tonearmGroup = null;
    this.tugKnotMesh = null;
    this.pinballMesh = null;
    this.pendulumArmGroup = null;
    this.balanceBeamGroup = null;
    this.balanceLeftPan = null;
    this.balanceRightPan = null;
    this.rouletteRotorGroup = null;
    this.rouletteBallMesh = null;
    this.shellPearlMesh = null;
    this.auctionGavelGroup = null;
    this.laserBeamsGroup = null;
    this.sonarShaderMat = null;
    this.xrayArchMesh = null;
    this.hoveredNodeId = null;
  }
}
