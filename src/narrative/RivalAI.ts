// ============================================================================
// WORLD'S SMARTEST — Deterministic Character Tells & Live Rival AI
// Implements PITCH_BIBLE.md §2.5 & §3.4 (Vance, Nadia, Soren, Teo, Lindqvist, Tariq)
// ============================================================================

import { getSovereignDomainMeta, type DomainId } from './PassportSystem';
import type { CastMemberId } from './InkBlackboard';

export type CharacterExpression = 'neutral' | 'intense' | 'shocked' | 'smirk';

export type RivalPrismStatus = 'HIDDEN' | 'THINKING' | 'PEELING' | 'OVERCLOCKING' | 'LOCKED';

export interface ExpressionPortraitMap {
  neutral: string;
  intense: string;
  shocked: string;
  smirk: string;
}

export const CAST_EXPRESSION_PORTRAITS: Record<CastMemberId, ExpressionPortraitMap> = {
  vance: {
    neutral: 'assets/portraits_cutout/vance.png',
    intense: 'assets/portraits_cutout/vance_intense.png',
    shocked: 'assets/portraits_cutout/vance_intense.png',
    smirk: 'assets/portraits_cutout/vance.png',
  },
  nadia: {
    neutral: 'assets/portraits_cutout/nadia.png',
    intense: 'assets/portraits_cutout/nadia.png',
    shocked: 'assets/portraits_cutout/nadia_shocked.png',
    smirk: 'assets/portraits_cutout/nadia.png',
  },
  soren: {
    neutral: 'assets/portraits_cutout/soren.png',
    intense: 'assets/portraits_cutout/soren.png',
    shocked: 'assets/portraits_cutout/soren.png',
    smirk: 'assets/portraits_cutout/soren_smirk.png',
  },
  teo: {
    neutral: 'assets/portraits_cutout/teo.png',
    intense: 'assets/portraits_cutout/teo_intense.png',
    shocked: 'assets/portraits_cutout/teo_intense.png',
    smirk: 'assets/portraits_cutout/teo.png',
  },
  lindqvist: {
    neutral: 'assets/portraits_cutout/lindqvist.png',
    intense: 'assets/portraits_cutout/lindqvist.png',
    shocked: 'assets/portraits_cutout/lindqvist.png',
    smirk: 'assets/portraits_cutout/lindqvist.png',
  },
  tariq: {
    neutral: 'assets/portraits_cutout/tariq.png',
    intense: 'assets/portraits_cutout/tariq.png',
    shocked: 'assets/portraits_cutout/tariq.png',
    smirk: 'assets/portraits_cutout/tariq.png',
  },
};

export function getPortraitUrl(actor: CastMemberId, expression: CharacterExpression = 'neutral'): string {
  const map = CAST_EXPRESSION_PORTRAITS[actor] ?? CAST_EXPRESSION_PORTRAITS.vance;
  return map[expression] ?? map.neutral;
}

export interface CastProfile {
  id: CastMemberId;
  name: string;
  shortName: string;
  codename: string;
  role: string;
  accentHex: string;
  strongDomains: DomainId[];
  weakDomains: DomainId[];
  baseAccuracy: number;
  baseLockSec: number;
  peelRate: number;
  overclockRate: number;
  bluffRateOnWeak: number;
  signatureTellSummary: string;
  genuineTellCue: string;
  bluffTellCue: string;
}

export const CAST_PROFILES: Record<CastMemberId, CastProfile> = {
  vance: {
    id: 'vance',
    name: 'Julian Vance',
    shortName: 'Vance',
    codename: 'The Maestro',
    role: 'Chief Adjudicator · The Meridian',
    accentHex: '#e8c474',
    strongDomains: [0, 1, 2, 3, 8, 10, 11],
    weakDomains: [4],
    baseAccuracy: 0.85,
    baseLockSec: 6.2,
    peelRate: 0.22,
    overclockRate: 0.56,
    bluffRateOnWeak: 0.45,
    signatureTellSummary:
      'Adjusts his left brass cufflink when withholding truth or bluffing; rhythmic right-ear stylus tap when confident.',
    genuineTellCue:
      'Tell: Vance taps his silver stylus twice beside his right ear — lethal certainty.',
    bluffTellCue:
      'Tell: Vance adjusts his left brass cufflink mid-charge — classic Arbiter bluff!',
  },
  nadia: {
    id: 'nadia',
    name: 'Nadia Al-Mansoor',
    shortName: 'Nadia',
    codename: 'The Polymath',
    role: 'Acoustic Engineer · Prodigy Rival',
    accentHex: '#48b8f0',
    strongDomains: [1, 6, 8, 11],
    weakDomains: [4, 5],
    baseAccuracy: 0.78,
    baseLockSec: 7.4,
    peelRate: 0.44,
    overclockRate: 0.44,
    bluffRateOnWeak: 0.28,
    signatureTellSummary:
      'Micro-blink and tiny corner smirk right before locking a lethal answer; jaw clench when rattled or bluffing.',
    genuineTellCue:
      'Tell: Micro-blink and tiny corner smirk — Nadia locked a genuine Cold-Instinct hit!',
    bluffTellCue:
      "Tell: Nadia's jaw clenches tightly past 8 seconds — rattled bluff!",
  },
  soren: {
    id: 'soren',
    name: 'Soren "Echo" Kael',
    shortName: 'Soren',
    codename: 'The Chaos Agent',
    role: 'Horizon Wildcard · Poker Hustler',
    accentHex: '#5ce1e6',
    strongDomains: [4, 5, 6, 11],
    weakDomains: [3, 10],
    baseAccuracy: 0.75,
    baseLockSec: 4.5,
    peelRate: 0.28,
    overclockRate: 0.65,
    bluffRateOnWeak: 0.62,
    signatureTellSummary:
      'Weighted silver coin freezes dead between his fingers on a genuine Horizon earpiece hit; fast coin roll means bluff.',
    genuineTellCue:
      "Tell: Soren's silver coin just FROZE dead between his fingers — high-confidence hit!",
    bluffTellCue:
      "Tell: Soren's coin rolls rapidly across his knuckles — poker bluff! CALL IT!",
  },
  teo: {
    id: 'teo',
    name: 'Mateo "Teo" Rojas',
    shortName: 'Teo',
    codename: 'The Fixer',
    role: 'Rogue Broadcast Producer',
    accentHex: '#38c793',
    strongDomains: [2, 4, 8, 9],
    weakDomains: [1, 11],
    baseAccuracy: 0.76,
    baseLockSec: 6.4,
    peelRate: 0.42,
    overclockRate: 0.42,
    bluffRateOnWeak: 0.45,
    signatureTellSummary:
      'Rapid eye-check toward overhead control-room cameras whenever the comms line is tapped or compromised.',
    genuineTellCue:
      'Tell: Teo keeps his eyes steady on the console — clean unmonitored lock.',
    bluffTellCue:
      'Tell: Teo darts a glance toward the red control-room tally camera — compromised trap!',
  },
  lindqvist: {
    id: 'lindqvist',
    name: 'Chancellor Ingrid Lindqvist',
    shortName: 'Lindqvist',
    codename: 'The Kingmaker',
    role: 'Chair · The Sovereign Bloc',
    accentHex: '#d4a853',
    strongDomains: [0, 2, 3, 8],
    weakDomains: [4, 6],
    baseAccuracy: 0.81,
    baseLockSec: 8.2,
    peelRate: 0.34,
    overclockRate: 0.36,
    bluffRateOnWeak: 0.38,
    signatureTellSummary:
      'Slowly removes her platinum spectacles only before delivering a backroom deal, threat, or intimidation bluff.',
    genuineTellCue:
      "Tell: Lindqvist's platinum spectacles stay firmly in place — cold Sovereign precision.",
    bluffTellCue:
      'Tell: Lindqvist slowly removes her platinum spectacles — pure intimidation bluff!',
  },
  tariq: {
    id: 'tariq',
    name: 'Tariq Al-Mansoor',
    shortName: 'Tariq',
    codename: 'Meridian Zero',
    role: 'Trial 00 Champion · 99.4% Twin Mind',
    accentHex: '#f2c166',
    strongDomains: [0, 1, 6, 8, 10, 11],
    weakDomains: [5],
    baseAccuracy: 0.84,
    baseLockSec: 6.0,
    peelRate: 0.25,
    overclockRate: 0.48,
    bluffRateOnWeak: 0.22,
    signatureTellSummary:
      'Traces crisp geometric triangles on the table whenever encoding a hidden vault clue.',
    genuineTellCue:
      'Tell: Tariq traces a quiet triangle across the marble — effortless 99.4% resonance.',
    bluffTellCue:
      'Tell: Tariq pauses mid-triangle with a faint half-smile — testing your nerve.',
  },
};

export interface RivalQuestionContext {
  qid: number;
  domainId: DomainId;
  irtB: number;
  archetype: string;
  timeTotalSec: number;
  /** Optional campaign hub code (`'ch'`, `'gb'`, `'jp'`, ...) for early-stage calibration */
  hubId?: string;
  /** Optional academic tier (`'MIDDLE_SCHOOL'` .. `'MENSA'`) for gentle early-stage calibration */
  difficultyTier?: string;
}

export interface RivalAIConfig {
  actorId: CastMemberId;
  customName?: string;
  customRole?: string;
  seed?: number;
  /** Optional campaign hub code (`'ch'` & `'gb'` enforce gentle 35%–45% accuracy, slower locks, 0 tempo steals) */
  hubId?: string;
  accuracyOverride?: number;
  tempoStealActive?: boolean;
  tempoStealImmune?: boolean;
  analogStaticJammed?: boolean;
  grudgeDomainActive?: boolean;
  grudgeDomainId?: DomainId | null;
  bluffWagerDuels?: boolean;
  isFinaleVsVance?: boolean;
}

export interface RivalLiveHUDState {
  actorId: CastMemberId;
  name: string;
  shortName: string;
  role: string;
  accentHex: string;
  score: number;
  status: RivalPrismStatus;
  expression: CharacterExpression;
  portraitUrl: string;
  tellPillText: string;
  isBluffing: boolean;
  callBluffWindowOpen: boolean;
  callBluffRemainingSec: number;
  peeledTier: 1 | 2;
  overclockCharge: number; // 0..1
}

export interface RivalTickOutput {
  changed: boolean;
  hud: RivalLiveHUDState;
  tempoStealDrainSec: number;
  tempoStealBlocked: boolean;
  openedBluffWindow: boolean;
}

export interface BluffCallOutcome {
  accepted: boolean;
  wasActuallyBluffing: boolean;
  playerBonusPoints: number; // +1500 when catching a bluff!
  rivalPenaltyPoints: number;
  bannerText: string;
}

export interface RivalQuestionOutcome {
  rivalCorrect: boolean;
  rivalWasBluffing: boolean;
  rivalPointsEarned: number;
  totalRivalScore: number;
  expression: CharacterExpression;
  hud: RivalLiveHUDState;
}

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

export class RivalAI {
  private readonly cfg: RivalAIConfig;
  private readonly profile: CastProfile;
  private readonly rng: () => number;

  private score = 0;
  private status: RivalPrismStatus = 'HIDDEN';
  private expression: CharacterExpression = 'neutral';
  private tellPillText = '';

  // Deterministic per-question plan
  private peelAtSec: number | null = null;
  private overclockAtSec: number | null = null;
  private lockAtSec = 8.0;
  private tempoStealFired = false;
  private plannedPeelTier: 1 | 2 = 1;
  private plannedOverclock = false;
  private plannedOverclockCharge = 0;
  private plannedCorrect = true;
  private plannedIsBluff = false;
  private bluffCalledByPlayer = false;
  private bluffBaitedByPlayer = false;
  private resolved = false;
  private lastElapsedSec = 0;
  private currentQuestionEarlyStage = false;

  constructor(config: RivalAIConfig) {
    this.cfg = config;
    this.profile = CAST_PROFILES[config.actorId] ?? CAST_PROFILES.nadia;
    const baseSeed =
      config.seed !== undefined
        ? config.seed
        : (config.actorId.charCodeAt(0) * 2654435761 + 1013904223) >>> 0;
    this.rng = createMulberry32(baseSeed);
    this.tellPillText = `${this.profile.shortName} studies the table in calm silence.`;
  }

  public getActorId(): CastMemberId {
    return this.profile.id;
  }

  public getName(): string {
    return this.cfg.customName ?? this.profile.name;
  }

  public getShortName(): string {
    return this.cfg.customName ?? this.profile.shortName;
  }

  public getScore(): number {
    return this.score;
  }

  public setScore(points: number): void {
    this.score = Math.max(0, Math.round(points));
  }

  public resetMatch(): void {
    this.score = 0;
    this.status = 'HIDDEN';
    this.expression = 'neutral';
    this.resolved = false;
  }

  /**
   * Deterministic per-question planning with 100% honest, readable physical tells!
   */
  public beginQuestion(q: RivalQuestionContext): RivalLiveHUDState {
    this.status = 'THINKING';
    this.expression = 'neutral';
    this.resolved = false;
    this.tempoStealFired = false;
    this.bluffCalledByPlayer = false;
    this.bluffBaitedByPlayer = false;
    this.lastElapsedSec = 0;

    // Mix question QID into deterministic step so tells vary naturally across questions
    const qHash = ((q.qid * 1597334677) >>> 0) / 4294967296;
    const roll1 = (this.rng() + qHash) % 1;
    const roll2 = this.rng();
    const roll3 = this.rng();

    const isStrongDomain = this.profile.strongDomains.includes(q.domainId);
    const isWeakDomain = this.profile.weakDomains.includes(q.domainId);
    const isGrudgeHit =
      Boolean(this.cfg.grudgeDomainActive) &&
      (this.cfg.grudgeDomainId === undefined ||
        this.cfg.grudgeDomainId === null ||
        q.domainId === this.cfg.grudgeDomainId);
    const isGauntlet = q.archetype === 'GAUNTLET_SHATTER';
    const normHub = String(q.hubId ?? this.cfg.hubId ?? '').trim().toLowerCase();
    const isGeneva = normHub === 'ch' || normHub === 'geneva';
    const isLondon = normHub === 'gb' || normHub === 'uk' || normHub === 'london';
    const isLateHub =
      normHub === 'br' ||
      normHub === 'eg' ||
      normHub === 'is' ||
      normHub === 'sg' ||
      normHub === 'global';
    const isEarlyStage =
      !this.cfg.isFinaleVsVance &&
      !isLateHub &&
      (isGeneva ||
        isLondon ||
        q.difficultyTier === 'MIDDLE_SCHOOL' ||
        q.irtB < -0.25);
    this.currentQuestionEarlyStage = isEarlyStage;

    // Lock time calculation (gentle & un-rushed on Stage 1 Geneva & Stage 2 London / irtB < -0.25)
    let targetLockSec = this.profile.baseLockSec + (roll1 - 0.5) * 2.8;
    if (isStrongDomain || isGrudgeHit) targetLockSec *= 0.84;
    if (isWeakDomain) targetLockSec *= 1.18;
    if (this.profile.id === 'soren' && this.cfg.analogStaticJammed) {
      targetLockSec += 3.8; // Jammed earpiece slows Soren dramatically!
    }
    if (isEarlyStage) {
      const slowScale = isGeneva ? 1.65 : isLondon ? 1.48 : 1.38;
      const minEarlyLock = isGauntlet ? 4.6 : isGeneva ? 12.0 : 10.5;
      targetLockSec = Math.max(targetLockSec * slowScale, minEarlyLock);
    }
    const maxAllowedLock = Math.max(3.6, q.timeTotalSec - (isEarlyStage ? 2.2 : 1.6));
    const minAllowedLock = isGauntlet
      ? isEarlyStage
        ? Math.min(4.4, maxAllowedLock)
        : 2.0
      : isEarlyStage
        ? Math.min(9.5, maxAllowedLock)
        : 3.2;
    this.lockAtSec = clamp(targetLockSec, minAllowedLock, maxAllowedLock);

    // Peel plan
    const canPeel = !isGauntlet && !this.cfg.analogStaticJammed;
    const peelProb = clamp(
      this.profile.peelRate +
        (isWeakDomain ? 0.18 : 0) +
        (isEarlyStage ? 0.12 : 0) +
        clamp(q.irtB, -1.5, 2.5) * 0.08,
      0.08,
      0.82
    );
    this.plannedPeelTier = canPeel && roll2 < peelProb ? 2 : 1;
    this.peelAtSec =
      this.plannedPeelTier === 2
        ? clamp(this.lockAtSec * 0.48, 1.8, Math.max(2.2, this.lockAtSec - 1.8))
        : null;

    // Accuracy & Deterministic Bluff Decision
    let acc: number;
    if (this.cfg.accuracyOverride !== undefined) {
      acc = this.cfg.accuracyOverride;
    } else if (isEarlyStage) {
      // Gentle Stage 1–2 calibration (35%–45% accuracy) so new players feel triumphant momentum!
      const earlyBase = isGeneva ? 0.36 : isLondon ? 0.42 : 0.4;
      acc = earlyBase;
      if (isStrongDomain) acc += 0.04;
      if (isWeakDomain) acc -= 0.05;
      if (this.plannedPeelTier === 2) acc += 0.03;
      if (this.profile.id === 'soren' && this.cfg.analogStaticJammed) acc -= 0.05;
      acc = clamp(acc, 0.35, 0.45);
    } else {
      acc = this.profile.baseAccuracy;
      if (isStrongDomain) acc += 0.07;
      if (isWeakDomain) acc -= 0.14;
      if (this.plannedPeelTier === 2) acc += 0.08;
      if (isGrudgeHit) acc += 0.08;
      acc -= clamp(q.irtB, -1.5, 2.5) * 0.06;
      if (this.profile.id === 'soren' && this.cfg.analogStaticJammed) {
        acc -= 0.18; // Live Signal Jammer neutralizes Soren's earpiece!
      }
      acc = clamp(acc, 0.34, 0.92);
    }

    const knowsAnswer = roll3 < acc;

    // Will rival Overclock genuinely or Bluff Overclock?
    const ocRoll = this.rng();
    const effectiveOverclockRate = isEarlyStage
      ? isGeneva
        ? 0.0
        : this.profile.overclockRate * 0.22
      : this.profile.overclockRate;
    const allowEarlyBluff = !isEarlyStage || Boolean(this.cfg.bluffWagerDuels);

    if (isGauntlet) {
      this.plannedOverclock = false;
      this.plannedIsBluff = false;
      this.plannedCorrect = knowsAnswer;
    } else if (knowsAnswer && ocRoll < effectiveOverclockRate) {
      // Genuine high-confidence Overclock — triggers GENUINE tell!
      this.plannedOverclock = true;
      this.plannedIsBluff = false;
      this.plannedCorrect = true;
    } else if (
      !knowsAnswer &&
      allowEarlyBluff &&
      (this.cfg.bluffWagerDuels || isWeakDomain || this.cfg.isFinaleVsVance) &&
      ocRoll < this.profile.bluffRateOnWeak
    ) {
      // Bluff Overclock — triggers READABLE BLUFF tell!
      this.plannedOverclock = true;
      this.plannedIsBluff = true;
      this.plannedCorrect = false;
    } else {
      this.plannedOverclock = false;
      this.plannedIsBluff = false;
      this.plannedCorrect = knowsAnswer;
    }

    this.plannedOverclockCharge = this.plannedOverclock ? round2(0.45 + this.rng() * 0.5) : 0;
    this.overclockAtSec = this.plannedOverclock
      ? clamp(
          this.lockAtSec - 1.85,
          (this.peelAtSec ?? 1.2) + 0.75,
          Math.max(2.2, this.lockAtSec - 0.9)
        )
      : null;

    // Initial opening stage cue
    if (isGrudgeHit) {
      const dName = getSovereignDomainMeta(q.domainId).name;
      this.tellPillText = `Tell: ${this.profile.shortName} smiles coldly — counter-picked ${dName}!`;
      this.expression = 'smirk';
    } else if (this.profile.id === 'soren' && this.cfg.analogStaticJammed) {
      this.tellPillText =
        "Tell: Soren taps his dead earpiece — Horizon telemetry jammed to pure static!";
      this.expression = 'shocked';
    } else {
      this.tellPillText = this.getOpeningIdleTell();
      this.expression = 'neutral';
    }

    return this.getHUDState();
  }

  /**
   * Advances Rival AI in real time and fires deterministic physical tells before locking!
   */
  public tick(elapsedSec: number): RivalTickOutput {
    this.lastElapsedSec = elapsedSec;
    if (this.resolved) {
      return {
        changed: false,
        hud: this.getHUDState(),
        tempoStealDrainSec: 0,
        tempoStealBlocked: false,
        openedBluffWindow: false,
      };
    }

    let changed = false;
    let tempoStealDrainSec = 0;
    let tempoStealBlocked = false;
    let openedBluffWindow = false;

    if (this.status !== 'LOCKED' && elapsedSec >= this.lockAtSec) {
      this.status = 'LOCKED';
      changed = true;

      if (this.bluffBaitedByPlayer) {
        this.expression = 'shocked';
        this.tellPillText = `BLUFF ECHO! ${this.profile.shortName} bit your feint and locked prematurely!`;
      } else if (this.plannedIsBluff) {
        this.expression = 'intense';
        this.tellPillText = this.profile.bluffTellCue;
      } else if (this.plannedCorrect) {
        this.expression = 'smirk';
        this.tellPillText = `${this.profile.shortName} locked in cleanly at ${elapsedSec.toFixed(1)}s.`;
      } else {
        this.expression = 'intense';
        this.tellPillText = `${this.profile.shortName} committed a hesitant lock.`;
      }

      // Tempo Steal fires the exact instant Rival locks — strictly disabled on early Stages 1–2 (`ch`/`gb` / irtB < -0.25)!
      const normCfgHub = String(this.cfg.hubId ?? '').trim().toLowerCase();
      const earlyHubNoTempoSteal =
        this.currentQuestionEarlyStage || normCfgHub === 'ch' || normCfgHub === 'gb';
      if (this.cfg.tempoStealActive && !this.tempoStealFired && !earlyHubNoTempoSteal) {
        this.tempoStealFired = true;
        if (this.cfg.tempoStealImmune) {
          tempoStealBlocked = true;
          this.expression = 'shocked';
          this.tellPillText = `TEMPO STEAL BLOCKED — Your Composure perk shielded the Chrono-Ring!`;
        } else {
          tempoStealDrainSec = 3.0;
          this.tellPillText = `TEMPO STEAL! ${this.profile.shortName} drained -3.0s from your Chrono-Ring!`;
        }
      }
    } else if (
      this.overclockAtSec !== null &&
      this.status !== 'OVERCLOCKING' &&
      this.status !== 'LOCKED' &&
      elapsedSec >= this.overclockAtSec
    ) {
      this.status = 'OVERCLOCKING';
      changed = true;
      openedBluffWindow = true;
      // 100% deterministic readable tell: Genuine vs Bluff!
      if (this.plannedIsBluff) {
        this.expression = this.profile.id === 'nadia' ? 'shocked' : 'intense';
        this.tellPillText = this.profile.bluffTellCue;
      } else {
        this.expression = this.profile.id === 'vance' ? 'intense' : 'smirk';
        this.tellPillText = this.profile.genuineTellCue;
      }
    } else if (
      this.peelAtSec !== null &&
      this.status === 'THINKING' &&
      elapsedSec >= this.peelAtSec
    ) {
      this.status = 'PEELING';
      changed = true;
      this.expression = 'intense';
      this.tellPillText = `Tell: Gold steam vents from ${this.profile.shortName}'s Prism — peeled Tier 2 Clue Core.`;
    }

    return {
      changed,
      hud: this.getHUDState(),
      tempoStealDrainSec,
      tempoStealBlocked,
      openedBluffWindow,
    };
  }

  /**
   * Player calls Rival's Bluff during an Overclock charge (`BLUFF_WAGER` / Vance Finale)!
   */
  public callRivalBluff(): BluffCallOutcome {
    if (this.bluffCalledByPlayer || this.resolved || !this.plannedOverclock) {
      return {
        accepted: false,
        wasActuallyBluffing: false,
        playerBonusPoints: 0,
        rivalPenaltyPoints: 0,
        bannerText: 'No active Rival Overclock wager to challenge.',
      };
    }

    this.bluffCalledByPlayer = true;
    if (this.plannedIsBluff) {
      const penalty = Math.min(this.score, 600);
      this.score = Math.max(0, this.score - penalty);
      this.plannedCorrect = false;
      this.expression = 'shocked';
      this.tellPillText = `BLUFF CAUGHT! You read ${this.profile.shortName}'s tell (+1,500 PTS)!`;
      return {
        accepted: true,
        wasActuallyBluffing: true,
        playerBonusPoints: 1500,
        rivalPenaltyPoints: penalty,
        bannerText: `BLUFF EXPOSED! ${this.profile.shortName}'s tell gave it away — +1,500 PTS!`,
      };
    }

    this.expression = 'smirk';
    this.tellPillText = `${this.profile.shortName}'s Overclock was 100% genuine — brace for impact!`;
    return {
      accepted: true,
      wasActuallyBluffing: false,
      playerBonusPoints: 0,
      rivalPenaltyPoints: 0,
      bannerText: `NOT A BLUFF! ${this.profile.shortName}'s wager is genuine — solve cleanly to match!`,
    };
  }

  /**
   * Player flick-cancels Overclock with `BLUFF_ECHO` perk equipped -> baits Rival!
   */
  public triggerPlayerBluffEchoFeint(elapsedSec: number): boolean {
    if (this.resolved || this.status === 'LOCKED' || this.bluffBaitedByPlayer) {
      return false;
    }
    this.bluffBaitedByPlayer = true;
    this.plannedOverclock = false;
    this.plannedOverclockCharge = 0;
    this.lockAtSec = Math.min(this.lockAtSec, elapsedSec + 0.3);
    this.plannedCorrect = false;
    this.expression = 'shocked';
    this.tellPillText = `BLUFF ECHO! ${this.profile.shortName} bit your feint and mis-locked!`;
    return true;
  }

  public resolveQuestion(params: {
    archetype: string;
    playerCorrect: boolean;
    playerBackfired: boolean;
  }): RivalQuestionOutcome {
    this.resolved = true;
    this.status = 'LOCKED';

    let points = 0;
    if (this.plannedCorrect) {
      const base = params.archetype === 'GAUNTLET_SHATTER' ? 800 : 1000;
      const tierMult =
        params.archetype === 'GAUNTLET_SHATTER'
          ? 1.5
          : this.plannedPeelTier === 1
            ? 3.0
            : 2.0;
      const ocMult =
        this.plannedOverclock && !this.plannedIsBluff
          ? 1.0 + this.plannedOverclockCharge * 0.75
          : 1.0;
      const scale = this.cfg.isFinaleVsVance
        ? 0.82
        : this.currentQuestionEarlyStage
          ? 0.62
          : 0.74;
      points = Math.round(base * tierMult * ocMult * scale + (this.currentQuestionEarlyStage ? 80 : 140));
    }

    // Per Pitch Bible §3.1: Player Overclock Backfire gifts Rival tactical momentum (+250)
    if (params.playerBackfired) {
      points += 250;
    }

    this.score += points;

    if (this.plannedCorrect && !params.playerCorrect) {
      this.expression = 'smirk';
      this.tellPillText = params.playerBackfired
        ? `${this.profile.shortName} capitalizes on your Overclock Backfire!`
        : `${this.profile.shortName} claims the round cleanly.`;
    } else if (!this.plannedCorrect && params.playerCorrect) {
      this.expression = 'shocked';
      this.tellPillText =
        this.profile.id === 'vance'
          ? 'Vance taps his right-ear stylus twice — genuinely impressed!'
          : `${this.profile.shortName} missed that Prism — you surge ahead!`;
    } else if (this.plannedCorrect && params.playerCorrect) {
      this.expression = 'intense';
      this.tellPillText = `Both Prisms resonate gold — razor-tight duel against ${this.profile.shortName}!`;
    } else {
      this.expression = 'neutral';
      this.tellPillText = `Neither contender cracked that Prism — reset for next round.`;
    }

    return {
      rivalCorrect: this.plannedCorrect,
      rivalWasBluffing: this.plannedIsBluff,
      rivalPointsEarned: points,
      totalRivalScore: this.score,
      expression: this.expression,
      hud: this.getHUDState(),
    };
  }

  /**
   * Live readout for the `BLUFF_RADAR` ("Rival Tell Scanner") Mind Gambit:
   * reveals clearly whether the Rival's active wager is Genuine or a Bluff (+500 Steal)!
   */
  public getBluffRadarReadout(): {
    activeWager: boolean;
    verdict: 'BLUFF' | 'GENUINE' | 'NONE';
    label: string;
  } {
    if (this.resolved || !this.plannedOverclock || this.status === 'HIDDEN') {
      return {
        activeWager: false,
        verdict: 'NONE',
        label: `Tell Scanner: ${this.profile.shortName} has not staked a Double-Down wager.`,
      };
    }
    if (this.plannedIsBluff) {
      return {
        activeWager: true,
        verdict: 'BLUFF',
        label: `TELL SCANNER: BLUFF DETECTED — Call ${this.profile.shortName}'s Bluff for +500 Steal!`,
      };
    }
    return {
      activeWager: true,
      verdict: 'GENUINE',
      label: `TELL SCANNER: GENUINE WAGER — ${this.profile.shortName} knows this one.`,
    };
  }

  public getHUDState(): RivalLiveHUDState {
    const windowOpen =
      !this.resolved &&
      !this.bluffCalledByPlayer &&
      this.status === 'OVERCLOCKING' &&
      this.overclockAtSec !== null &&
      this.lastElapsedSec - this.overclockAtSec <= 2.2;
    const remSec =
      windowOpen && this.overclockAtSec !== null
        ? Math.max(0, round2(2.2 - (this.lastElapsedSec - this.overclockAtSec)))
        : 0;

    return {
      actorId: this.profile.id,
      name: this.getName(),
      shortName: this.getShortName(),
      role: this.cfg.customRole ?? this.profile.role,
      accentHex: this.profile.accentHex,
      score: this.score,
      status: this.status,
      expression: this.expression,
      portraitUrl: getPortraitUrl(this.profile.id, this.expression),
      tellPillText: this.tellPillText,
      isBluffing: this.plannedIsBluff,
      callBluffWindowOpen: windowOpen,
      callBluffRemainingSec: remSec,
      peeledTier: this.status === 'PEELING' || (this.status === 'LOCKED' && this.plannedPeelTier === 2) ? 2 : 1,
      overclockCharge:
        this.status === 'OVERCLOCKING' || (this.status === 'LOCKED' && this.plannedOverclock)
          ? this.plannedOverclockCharge
          : 0,
    };
  }

  private getOpeningIdleTell(): string {
    switch (this.profile.id) {
      case 'vance':
        return 'Tell: Vance rests his brass pocket astrolabe beside the microphone.';
      case 'nadia':
        return 'Tell: Nadia scans the frosted facets in measured acoustic silence.';
      case 'soren':
        return 'Tell: Soren rolls a weighted silver coin smoothly across his knuckles...';
      case 'teo':
        return 'Tell: Teo monitors the live satellite uplink on his dual wrist-displays.';
      case 'lindqvist':
        return 'Tell: Chancellor Lindqvist folds her hands with icy Sovereign poise.';
      case 'tariq':
        return 'Tell: Tariq studies the crystal core — calm 99.4% symmetry.';
    }
  }
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
