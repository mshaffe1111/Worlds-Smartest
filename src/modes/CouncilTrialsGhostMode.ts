// ============================================================================
// WORLD'S SMARTEST — Mode 5: World Council Trials & The Black Salon
// Implements PITCH_BIBLE.md §4:
//   • 3D Async Kinetic Ghost Duels (records & replays exact spin, peel & overclock timestamps!)
//   • Faction Leagues (Sovereign Bloc, Horizon Collective, Agora Coalition)
//   • Teo's 16-Player Underground Black Salon Knockout Bracket
// ============================================================================

import type { ForgeEngine, PeelTier, PrismQuestion } from '../forge';
import type { CastMemberId, InkBlackboard, MutatorId } from '../narrative/InkBlackboard';
import type { FactionId, PassportSystem } from '../narrative/PassportSystem';
import { getPortraitUrl, type CharacterExpression, type RivalPrismStatus } from '../narrative/RivalAI';
import {
  ScoringEngine,
  type PrismAnswerSubmission,
  type ScoredQuestionResult,
} from './ScoringEngine';

export type KineticEventType =
  | 'SPIN'
  | 'PEEL'
  | 'OVERCLOCK_START'
  | 'OVERCLOCK_CANCEL'
  | 'LOCK';

export interface KineticGhostEvent {
  /** Milliseconds since question start */
  tMs: number;
  type: KineticEventType;
  /** Facet index (0..3) on SPIN or LOCK */
  facetIndex?: number;
  /** Peel tier (2 or 3) on PEEL */
  peelTier?: PeelTier;
  /** Overclock charge (0..1) on LOCK */
  overclockCharge?: number;
  /** True if locked answer was correct */
  correct?: boolean;
  /** Banked points earned on LOCK */
  pointsEarned?: number;
}

export interface KineticQuestionTrace {
  qid: number;
  events: KineticGhostEvent[];
}

export interface KineticGhostPacket {
  version: 1;
  challengerName: string;
  faction: FactionId;
  countryCode: string;
  elo: number;
  portraitActorId: CastMemberId;
  seed: number;
  totalScore: number;
  traces: KineticQuestionTrace[];
}

export interface GhostContenderCard {
  id: string;
  handle: string;
  countryCode: string;
  faction: FactionId;
  elo: number;
  portraitActorId: CastMemberId;
  portraitUrl: string;
  styleTag: string;
  seed: number;
}

export interface LiveGhostReplayFrame {
  handle: string;
  faction: FactionId;
  elo: number;
  portraitUrl: string;
  expression: CharacterExpression;
  status: RivalPrismStatus;
  activeFacetIndex: number;
  peelTier: PeelTier;
  overclockCharging: boolean;
  overclockCharge: number;
  locked: boolean;
  lockedCorrect: boolean | null;
  liveTotalScore: number;
  telemetryBanner: string;
}

export interface BlackSalonRoundSpec {
  roundNumber: 1 | 2 | 3 | 4;
  roundTitle: string; // Round of 16 -> Quarter-Final -> Semi-Final -> Grand Salon Table
  mutator: MutatorId;
  mutatorLabel: string;
  opponent: GhostContenderCard;
  peelLocked: boolean;
  chronoSurge: boolean;
}

export interface GhostDuelSummary {
  modeKind: 'GHOST_DUEL' | 'BLACK_SALON';
  challengerName: string;
  opponentHandle: string;
  won: boolean;
  playerScore: number; // Guaranteed > 0 whenever >= 1 solved!
  ghostScore: number;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  factionPointsAwarded: number;
  eloDelta: number;
  newTrialsElo: number;
  shareableGhostCode: string;
  salonRoundCleared?: 1 | 2 | 3 | 4;
  salonChampionCrowned?: boolean;
}

interface TrialsPersistence {
  trialsElo: number;
  wins: number;
  losses: number;
  salonTrophies: number;
  salonCurrentRound: 0 | 1 | 2 | 3 | 4;
  factionStandings: Record<FactionId, number>;
}

const TRIALS_STORAGE_KEY = 'ws_council_trials_v2';
const TRIALS_MATCH_LENGTH = 5;

export const RANKED_GHOST_CONTENDERS: readonly GhostContenderCard[] = [
  {
    id: 'ghost_zurich_watchmaker',
    handle: 'A. Lindemann',
    countryCode: 'CH',
    faction: 'SOVEREIGN',
    elo: 1180,
    portraitActorId: 'vance',
    portraitUrl: getPortraitUrl('vance', 'neutral'),
    styleTag: 'Measured Tier-1 Safe Locks',
    seed: 104729,
  },
  {
    id: 'ghost_osaka_pulse',
    handle: 'Kaito_Zero',
    countryCode: 'JP',
    faction: 'HORIZON',
    elo: 1340,
    portraitActorId: 'soren',
    portraitUrl: getPortraitUrl('soren', 'smirk'),
    styleTag: '3.8s Blitz Overclocker',
    seed: 229841,
  },
  {
    id: 'ghost_cairo_acoustics',
    handle: 'Layla.M',
    countryCode: 'EG',
    faction: 'AGORA',
    elo: 1460,
    portraitActorId: 'nadia',
    portraitUrl: getPortraitUrl('nadia', 'neutral'),
    styleTag: 'Surgical Clue-Core Tactician',
    seed: 381907,
  },
  {
    id: 'ghost_oxford_fellow',
    handle: 'Dr_Pemberton',
    countryCode: 'GB',
    faction: 'SOVEREIGN',
    elo: 1590,
    portraitActorId: 'lindqvist',
    portraitUrl: getPortraitUrl('lindqvist', 'neutral'),
    styleTag: 'Cold-Instinct Historian',
    seed: 492113,
  },
  {
    id: 'ghost_buenos_uplink',
    handle: 'Signal_Rojas',
    countryCode: 'AR',
    faction: 'AGORA',
    elo: 1710,
    portraitActorId: 'teo',
    portraitUrl: getPortraitUrl('teo', 'intense'),
    styleTag: 'Bluff-Echo Feint Specialist',
    seed: 618239,
  },
  {
    id: 'ghost_reykjavik_aurora',
    handle: 'Katla_994',
    countryCode: 'IS',
    faction: 'HORIZON',
    elo: 1880,
    portraitActorId: 'tariq',
    portraitUrl: getPortraitUrl('tariq', 'neutral'),
    styleTag: '99.4% Polymath Precision',
    seed: 774103,
  },
];

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Encodes a compact `KineticGhostPacket` (~220–300 B/Q) into a shareable `WSG1:` Ghost Code!
 */
export function encodeGhostPacket(packet: KineticGhostPacket): string {
  const json = JSON.stringify(packet);
  if (typeof btoa === 'function') {
    const utf8Safe = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    return `WSG1:${btoa(utf8Safe)}`;
  }
  return `WSG1:${json}`;
}

export function decodeGhostPacket(code: string): KineticGhostPacket | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith('WSG1:')) return null;
    const payload = trimmed.slice(5);
    let json = payload;
    if (!payload.startsWith('{') && typeof atob === 'function') {
      const bin = atob(payload);
      json = decodeURIComponent(
        Array.from(bin)
          .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      );
    }
    const parsed = JSON.parse(json) as KineticGhostPacket;
    if (parsed?.version !== 1 || !Array.isArray(parsed.traces)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Synthesizes a deterministic 3D Kinetic Ghost trace for AI-seeded ranked contenders
 * so every opponent visibly spins facets, peels shutters, and charges Overclock in real time!
 */
function buildSyntheticGhostTrace(
  q: PrismQuestion,
  contender: GhostContenderCard,
  qIndex: number,
  peelLocked = false
): KineticQuestionTrace {
  const rng = createMulberry32((contender.seed + q.qid * 31 + qIndex * 997) >>> 0);
  const events: KineticGhostEvent[] = [];

  const eloAcc = clamp(0.56 + ((contender.elo - 1100) / 900) * 0.34 - q.irtB * 0.05, 0.38, 0.91);
  const correct = rng() < eloAcc;
  const speedScale = contender.faction === 'HORIZON' ? 0.76 : 1.0;
  const lockMs = Math.round((4200 + rng() * 5800) * speedScale);

  // 2–4 kinetic SPIN ticks leading toward chosen facet
  const spinSteps = 2 + Math.floor(rng() * 3);
  for (let s = 0; s < spinSteps; s++) {
    const spinT = Math.round((lockMs * 0.65 * (s + 1)) / (spinSteps + 1));
    events.push({
      tMs: spinT,
      type: 'SPIN',
      facetIndex: (s + Math.floor(rng() * 4)) % 4,
    });
  }

  let peelTier: PeelTier = 1;
  if (!peelLocked && q.archetype !== 'GAUNTLET_SHATTER' && rng() < 0.36) {
    peelTier = 2;
    events.push({
      tMs: Math.round(lockMs * 0.45),
      type: 'PEEL',
      peelTier: 2,
    });
  }

  let overclockCharge = 0;
  if (q.archetype !== 'GAUNTLET_SHATTER' && rng() < (contender.faction === 'HORIZON' ? 0.62 : 0.42)) {
    const ocStart = Math.max(900, lockMs - Math.round(550 + rng() * 400));
    events.push({ tMs: ocStart, type: 'OVERCLOCK_START' });
    // Occasional Bluff Echo feint from Teo-style ghosts!
    if (contender.portraitActorId === 'teo' && rng() < 0.28) {
      events.push({ tMs: ocStart + 280, type: 'OVERCLOCK_CANCEL' });
    } else {
      overclockCharge = Number(((lockMs - ocStart) / 1000).toFixed(2));
    }
  }

  const tierMult = peelTier === 1 ? 3.0 : 2.0;
  const ocMult = overclockCharge > 0 ? 1.0 + Math.min(1, overclockCharge) * 0.8 : 1.0;
  const pts = correct ? Math.round(1000 * tierMult * ocMult * 0.78 + 160) : 0;

  events.push({
    tMs: lockMs,
    type: 'LOCK',
    facetIndex: correct ? q.correctFacetIndex : (q.correctFacetIndex + 1) % 4,
    peelTier,
    overclockCharge,
    correct,
    pointsEarned: pts,
  });

  events.sort((a, b) => a.tMs - b.tMs);
  return { qid: q.qid, events };
}

export class CouncilTrialsGhostMode {
  private readonly forge: ForgeEngine;
  private readonly passport: PassportSystem;
  private readonly blackboard: InkBlackboard;
  private readonly scoring = new ScoringEngine();

  private persistence: TrialsPersistence;
  private activeKind: 'GHOST_DUEL' | 'BLACK_SALON' = 'GHOST_DUEL';
  private activeOpponentGhost: KineticGhostPacket | null = null;
  private activeSalonSpec: BlackSalonRoundSpec | null = null;
  private activeQuestions: PrismQuestion[] = [];
  private currentIndex = 0;
  private completedGhostScore = 0;

  // Player's live 3D Kinetic Ghost recorder for the current match
  private recordedTraces: KineticQuestionTrace[] = [];
  private currentQuestionEvents: KineticGhostEvent[] = [];
  private lastSubmitOut: {
    resolution: ScoredQuestionResult;
    ghostQuestionPoints: number;
    ghostTotalScore: number;
    nextQuestion: PrismQuestion | null;
    summary: GhostDuelSummary | null;
  } | null = null;

  constructor(forge: ForgeEngine, passport: PassportSystem, blackboard: InkBlackboard) {
    this.forge = forge;
    this.passport = passport;
    this.blackboard = blackboard;
    this.persistence = this.loadPersistence();
  }

  private loadPersistence(): TrialsPersistence {
    const defaults: TrialsPersistence = {
      trialsElo: 1200,
      wins: 0,
      losses: 0,
      salonTrophies: 0,
      salonCurrentRound: 0,
      factionStandings: {
        SOVEREIGN: 14820,
        HORIZON: 14690,
        AGORA: 14760,
      },
    };
    try {
      if (typeof localStorage === 'undefined') return defaults;
      const raw = localStorage.getItem(TRIALS_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<TrialsPersistence> | null;
      if (!parsed || typeof parsed !== 'object') return defaults;
      return {
        trialsElo: clamp(Math.round(Number(parsed.trialsElo) || 1200), 700, 2600),
        wins: Math.max(0, Math.floor(Number(parsed.wins) || 0)),
        losses: Math.max(0, Math.floor(Number(parsed.losses) || 0)),
        salonTrophies: Math.max(0, Math.floor(Number(parsed.salonTrophies) || 0)),
        salonCurrentRound: (parsed.salonCurrentRound as 0 | 1 | 2 | 3 | 4) || 0,
        factionStandings: {
          SOVEREIGN: Math.max(14000, Math.floor(Number(parsed.factionStandings?.SOVEREIGN) || 14820)),
          HORIZON: Math.max(14000, Math.floor(Number(parsed.factionStandings?.HORIZON) || 14690)),
          AGORA: Math.max(14000, Math.floor(Number(parsed.factionStandings?.AGORA) || 14760)),
        },
      };
    } catch {
      return defaults;
    }
  }

  private savePersistence(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TRIALS_STORAGE_KEY, JSON.stringify(this.persistence));
      }
    } catch {
      // Ignore storage errors
    }
  }

  public getHubOverview() {
    const snap = this.blackboard.getSnapshot();
    return {
      challengerName: this.passport.getChallengerName(),
      pledgedFaction: snap.pledgedFaction,
      trialsElo: this.persistence.trialsElo,
      wins: this.persistence.wins,
      losses: this.persistence.losses,
      salonTrophies: this.persistence.salonTrophies,
      salonUnlocked: true, // Playable anytime in Mode 5 + canonically unlocked in Campaign!
      salonCurrentRound: this.persistence.salonCurrentRound,
      factionStandings: { ...this.persistence.factionStandings },
      contenders: [...RANKED_GHOST_CONTENDERS],
    };
  }

  public pledgeFaction(faction: FactionId): void {
    this.blackboard.setPledgedFaction(faction);
  }

  /**
   * Starts a 3D Async Kinetic Ghost Duel against a Ranked Contender OR an imported `WSG1:` Ghost Code!
   */
  public async startGhostDuel(target: string | KineticGhostPacket): Promise<{
    questions: PrismQuestion[];
    firstQuestion: PrismQuestion | null;
    opponentHandle: string;
    opponentElo: number;
  }> {
    this.activeKind = 'GHOST_DUEL';
    this.activeSalonSpec = null;

    let importedPacket: KineticGhostPacket | null = null;
    if (typeof target === 'object') {
      importedPacket = target;
    } else if (target.startsWith('WSG1:')) {
      importedPacket = decodeGhostPacket(target);
    }

    if (importedPacket) {
      const pinnedQids = importedPacket.traces.map((t) => t.qid);
      const fetched: PrismQuestion[] = [];
      for (const qid of pinnedQids) {
        const q = await this.forge.getQuestionByQid(qid);
        if (q) fetched.push(q);
      }
      this.activeQuestions =
        fetched.length > 0
          ? fetched
          : await this.forge.queryBriefingRoomAsync({
              difficultyPreset: 'MEDIUM',
              count: TRIALS_MATCH_LENGTH,
            });
      this.activeOpponentGhost = importedPacket;
    } else {
      const contender =
        RANKED_GHOST_CONTENDERS.find((c) => c.id === target) ?? RANKED_GHOST_CONTENDERS[0];
      const preset =
        contender.elo >= 1750
          ? 'GENIUS'
          : contender.elo >= 1500
            ? 'HARD'
            : contender.elo >= 1300
              ? 'MEDIUM'
              : 'EASY';

      this.activeQuestions = await this.forge.queryBriefingRoomAsync({
        difficultyPreset: preset,
        count: TRIALS_MATCH_LENGTH,
      });
      const traces = this.activeQuestions.map((q, idx) =>
        buildSyntheticGhostTrace(q, contender, idx, false)
      );
      const totalGhostPts = traces.reduce(
        (sum, tr) => sum + (tr.events.find((e) => e.type === 'LOCK')?.pointsEarned ?? 0),
        0
      );
      this.activeOpponentGhost = {
        version: 1,
        challengerName: contender.handle,
        faction: contender.faction,
        countryCode: contender.countryCode,
        elo: contender.elo,
        portraitActorId: contender.portraitActorId,
        seed: contender.seed,
        totalScore: totalGhostPts,
        traces,
      };
    }

    this.resetMatchBuffers();
    return {
      questions: this.activeQuestions,
      firstQuestion: this.activeQuestions[0] ?? null,
      opponentHandle: this.activeOpponentGhost.challengerName,
      opponentElo: this.activeOpponentGhost.elo,
    };
  }

  /**
   * Starts or advances Teo's 16-Player Underground Black Salon Knockout Bracket!
   */
  public async startBlackSalonRound(): Promise<{
    salonSpec: BlackSalonRoundSpec;
    questions: PrismQuestion[];
    firstQuestion: PrismQuestion | null;
  }> {
    this.activeKind = 'BLACK_SALON';
    // Do NOT advance/persist `salonCurrentRound` until the player actually WINS in `finalizeMatch()` (#284)!
    const nextRound = ((this.persistence.salonCurrentRound % 4) + 1) as 1 | 2 | 3 | 4;

    const roundConfigs: Record<
      1 | 2 | 3 | 4,
      {
        title: string;
        mutator: MutatorId;
        label: string;
        contenderIdx: number;
        peelLocked: boolean;
        chronoSurge: boolean;
      }
    > = {
      1: {
        title: 'Round of 16 · Camden Cellar',
        mutator: 'CHRONO_SURGE',
        label: 'ALL-IN BLITZ · Fast Clock & 2x Speed Bonus',
        contenderIdx: 1,
        peelLocked: false,
        chronoSurge: true,
      },
      2: {
        title: 'Quarter-Final · Shinjuku Sub-Rail',
        mutator: 'ANALOG_STATIC',
        label: 'ANALOG STATIC · Depth Peel Sealed (+25% Cold Instinct)',
        contenderIdx: 3,
        peelLocked: true,
        chronoSurge: false,
      },
      3: {
        title: 'Semi-Final · Reykjavik Pirate Feed',
        mutator: 'BLUFF_WAGER',
        label: 'HIGH-WIRE POKER · Kinetic Ghost Overclock Duels',
        contenderIdx: 4,
        peelLocked: false,
        chronoSurge: true,
      },
      4: {
        title: 'Championship Table · Black Salon Crown',
        mutator: 'ANALOG_STATIC',
        label: 'SOVEREIGN BLACKOUT · Pure Cold Instinct Championship',
        contenderIdx: 5,
        peelLocked: true,
        chronoSurge: true,
      },
    };

    const cfg = roundConfigs[nextRound];
    const opponent = RANKED_GHOST_CONTENDERS[cfg.contenderIdx];
    this.activeSalonSpec = {
      roundNumber: nextRound,
      roundTitle: cfg.title,
      mutator: cfg.mutator,
      mutatorLabel: cfg.label,
      opponent,
      peelLocked: cfg.peelLocked,
      chronoSurge: cfg.chronoSurge,
    };

    this.activeQuestions = await this.forge.queryBriefingRoomAsync({
      difficultyPreset: nextRound >= 3 ? 'HARD' : 'MEDIUM',
      count: TRIALS_MATCH_LENGTH,
    });

    const traces = this.activeQuestions.map((q, idx) =>
      buildSyntheticGhostTrace(q, opponent, idx, cfg.peelLocked)
    );
    const totalGhostPts = traces.reduce(
      (sum, tr) => sum + (tr.events.find((e) => e.type === 'LOCK')?.pointsEarned ?? 0),
      0
    );

    this.activeOpponentGhost = {
      version: 1,
      challengerName: opponent.handle,
      faction: opponent.faction,
      countryCode: opponent.countryCode,
      elo: opponent.elo,
      portraitActorId: opponent.portraitActorId,
      seed: opponent.seed,
      totalScore: totalGhostPts,
      traces,
    };

    this.resetMatchBuffers();
    return {
      salonSpec: this.activeSalonSpec,
      questions: this.activeQuestions,
      firstQuestion: this.activeQuestions[0] ?? null,
    };
  }

  private resetMatchBuffers(): void {
    this.currentIndex = 0;
    this.completedGhostScore = 0;
    this.scoring.reset(0);
    this.recordedTraces = [];
    this.currentQuestionEvents = [];
    this.lastSubmitOut = null;
  }

  /**
   * Records a live player gesture (`SPIN`, `PEEL`, `OVERCLOCK_START`, `OVERCLOCK_CANCEL`)
   * with millisecond precision for your outgoing 3D Kinetic Ghost packet!
   */
  public recordPlayerKineticGesture(
    elapsedSec: number,
    type: Exclude<KineticEventType, 'LOCK'>,
    meta?: { facetIndex?: number; peelTier?: PeelTier }
  ): void {
    // Cap spin events to <= 12 per question so Ghost packet stays ultra-compact (~250 B/Q)
    if (
      type === 'SPIN' &&
      this.currentQuestionEvents.filter((e) => e.type === 'SPIN').length >= 12
    ) {
      return;
    }
    this.currentQuestionEvents.push({
      tMs: Math.max(0, Math.round(elapsedSec * 1000)),
      type,
      facetIndex: meta?.facetIndex,
      peelTier: meta?.peelTier,
    });
  }

  /**
   * Samples the Opponent's 3D Kinetic Ghost at `elapsedSec` on the current question!
   */
  public sampleOpponentGhostAt(elapsedSec: number): LiveGhostReplayFrame | null {
    const ghost = this.activeOpponentGhost;
    if (!ghost) return null;
    const trace = ghost.traces[this.currentIndex];
    const elapsedMs = Math.max(0, Math.round(elapsedSec * 1000));

    let activeFacetIndex = 0;
    let peelTier: PeelTier = 1;
    let overclockCharging = false;
    let overclockStartMs = 0;
    let locked = false;
    let lockedCorrect: boolean | null = null;
    let currentQPoints = 0;
    let latestBanner = `GHOST TELEMETRY: ${ghost.challengerName} scanning Prism...`;

    if (trace) {
      for (const ev of trace.events) {
        if (ev.tMs > elapsedMs) break;
        if (ev.type === 'SPIN' && ev.facetIndex !== undefined) {
          activeFacetIndex = ev.facetIndex;
          latestBanner = `GHOST SPIN: ${ghost.challengerName} rotated to Facet ${['A', 'B', 'C', 'D'][activeFacetIndex] ?? 'A'}.`;
        } else if (ev.type === 'PEEL' && ev.peelTier) {
          peelTier = ev.peelTier;
          latestBanner = `GHOST PEEL: ${ghost.challengerName} cracked Tier-${peelTier} Clue Core!`;
        } else if (ev.type === 'OVERCLOCK_START') {
          overclockCharging = true;
          overclockStartMs = ev.tMs;
          latestBanner = `GHOST SURGE: ${ghost.challengerName} charging Conviction Overclock!`;
        } else if (ev.type === 'OVERCLOCK_CANCEL') {
          overclockCharging = false;
          latestBanner = `GHOST FEINT: ${ghost.challengerName} vented Overclock (Bluff Echo)!`;
        } else if (ev.type === 'LOCK') {
          locked = true;
          overclockCharging = false;
          if (ev.facetIndex !== undefined) activeFacetIndex = ev.facetIndex;
          lockedCorrect = Boolean(ev.correct);
          currentQPoints = ev.pointsEarned ?? 0;
          latestBanner = `GHOST LOCKED at ${(ev.tMs / 1000).toFixed(1)}s!`;
        }
      }
    }

    const status: RivalPrismStatus = locked
      ? 'LOCKED'
      : overclockCharging
        ? 'OVERCLOCKING'
        : peelTier >= 2
          ? 'PEELING'
          : 'THINKING';

    const expression: CharacterExpression = locked
      ? lockedCorrect
        ? 'smirk'
        : 'shocked'
      : overclockCharging
        ? 'intense'
        : 'neutral';

    const liveCharge = overclockCharging
      ? clamp((elapsedMs - overclockStartMs) / 900, 0.1, 1.0)
      : 0;

    return {
      handle: ghost.challengerName,
      faction: ghost.faction,
      elo: ghost.elo,
      portraitUrl: getPortraitUrl(ghost.portraitActorId, expression),
      expression,
      status,
      activeFacetIndex,
      peelTier,
      overclockCharging,
      overclockCharge: Number(liveCharge.toFixed(2)),
      locked,
      lockedCorrect,
      liveTotalScore: this.completedGhostScore + currentQPoints,
      telemetryBanner: latestBanner,
    };
  }

  public getCurrentQuestion(): PrismQuestion | null {
    return this.activeQuestions[this.currentIndex] ?? null;
  }

  public submitCurrentAnswer(submission: PrismAnswerSubmission): {
    resolution: ScoredQuestionResult;
    ghostQuestionPoints: number;
    ghostTotalScore: number;
    nextQuestion: PrismQuestion | null;
    summary: GhostDuelSummary | null;
  } {
    const q = this.getCurrentQuestion();
    const ghost = this.activeOpponentGhost;
    if (!q || !ghost) {
      if (this.lastSubmitOut) return this.lastSubmitOut;
      throw new Error('No active Ghost Duel question.');
    }

    const resolution = this.scoring.submitAnswer(q, submission, {
      tier1BonusMultiplier: this.activeSalonSpec?.peelLocked ? 1.25 : 1.0,
      chronoSurgeActive: Boolean(this.activeSalonSpec?.chronoSurge),
    });

    // Finalize player's kinetic trace for this question
    this.currentQuestionEvents.push({
      tMs: Math.max(0, Math.round(submission.elapsedSec * 1000)),
      type: 'LOCK',
      facetIndex: submission.selectedFacetIndex,
      peelTier: submission.peelTier,
      overclockCharge: submission.overclockCharge,
      correct: resolution.correct,
      pointsEarned: resolution.pointsEarned,
    });
    this.recordedTraces.push({
      qid: q.qid,
      events: [...this.currentQuestionEvents],
    });
    this.currentQuestionEvents = [];

    // Advance opponent ghost score for this question
    const ghostLock = ghost.traces[this.currentIndex]?.events.find((e) => e.type === 'LOCK');
    const ghostQuestionPoints = ghostLock?.pointsEarned ?? 0;
    this.completedGhostScore += ghostQuestionPoints;

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
      q.irtB,
      q.qid
    );

    this.currentIndex += 1;
    const nextQuestion = this.activeQuestions[this.currentIndex] ?? null;
    const summary = nextQuestion === null ? this.finalizeMatch() : null;

    this.lastSubmitOut = {
      resolution,
      ghostQuestionPoints,
      ghostTotalScore: this.completedGhostScore,
      nextQuestion,
      summary,
    };
    return this.lastSubmitOut;
  }

  private finalizeMatch(): GhostDuelSummary {
    const ghost = this.activeOpponentGhost!;
    const playerScore = this.scoring.getMatchScore();
    const ghostScore = this.completedGhostScore;
    const won = playerScore >= ghostScore;

    const expected = 1 / (1 + Math.pow(10, (ghost.elo - this.persistence.trialsElo) / 400));
    const eloDelta = Math.round(32 * ((won ? 1 : 0) - expected));
    this.persistence.trialsElo = clamp(this.persistence.trialsElo + eloDelta, 700, 2600);

    const snap = this.blackboard.getSnapshot();
    const faction: FactionId = snap.pledgedFaction ?? 'AGORA';
    let factionPointsAwarded = 0;
    let salonRoundCleared: 1 | 2 | 3 | 4 | undefined;
    let salonChampionCrowned = false;

    if (won) {
      this.persistence.wins += 1;
      factionPointsAwarded = this.activeKind === 'BLACK_SALON' ? 250 : 150;
      this.persistence.factionStandings[faction] += factionPointsAwarded;

      if (this.activeKind === 'BLACK_SALON' && this.activeSalonSpec) {
        salonRoundCleared = this.activeSalonSpec.roundNumber;
        if (salonRoundCleared === 4) {
          salonChampionCrowned = true;
          this.persistence.salonTrophies += 1;
          this.persistence.salonCurrentRound = 0;
          this.blackboard.unlockSkin('BLACK_SALON_CRIMSON', true);
          this.passport.unlockTitleCrest('BLACK SALON CHAMPION', false);
        } else {
          // Advance bracket progression strictly on victory (#284)
          this.persistence.salonCurrentRound = salonRoundCleared;
        }
      }
    } else {
      this.persistence.losses += 1;
      if (this.activeKind === 'BLACK_SALON') {
        this.persistence.salonCurrentRound = 0; // Knocked out of single-elimination bracket
      }
    }

    this.savePersistence();

    const outgoingPacket: KineticGhostPacket = {
      version: 1,
      challengerName: this.passport.getChallengerName(),
      faction,
      countryCode: 'CH',
      elo: this.persistence.trialsElo,
      portraitActorId: 'vance',
      seed: Date.now() >>> 0,
      totalScore: playerScore,
      traces: this.recordedTraces,
    };

    return {
      modeKind: this.activeKind,
      challengerName: this.passport.getChallengerName(),
      opponentHandle: ghost.challengerName,
      won,
      playerScore,
      ghostScore,
      correctCount: this.scoring.getCorrectCount(),
      totalQuestions: this.activeQuestions.length,
      maxStreak: this.scoring.getMaxStreak(),
      factionPointsAwarded,
      eloDelta,
      newTrialsElo: this.persistence.trialsElo,
      shareableGhostCode: encodeGhostPacket(outgoingPacket),
      salonRoundCleared,
      salonChampionCrowned,
    };
  }
}
