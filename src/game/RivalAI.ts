import type {
  CharacterId,
  CharacterMood,
  DomainId,
  PeelTier,
  QuestionRecord,
  RivalPrismStatus,
  RivalUIState,
} from '../types/game';

export type RivalCharacterId = Exclude<CharacterId, 'none'>;

export interface RivalAIConfig {
  id: RivalCharacterId;
  customName?: string;
  customTitle?: string;
  elo?: number;
  baseAccuracyOverride?: number;
  peelChanceOverride?: number;
  overclockChanceOverride?: number;
  speedMultiplier?: number; // < 1 faster lock, > 1 slower lock
  isGhostTelemetry?: boolean;
  tempoStealActive?: boolean;
  tempoStealBlockedByPerk?: boolean;
  analogStaticJammed?: boolean;
  grudgePressure?: boolean;
  grudgeDomainId?: DomainId;
  grudgeDomainName?: string;
  isVanceFinale?: boolean;
}

export interface RivalTickResult {
  changed: boolean;
  status: RivalPrismStatus;
  mood?: CharacterMood;
  tellMessage?: string;
  tempoStealSec: number;
  tempoStealBlocked: boolean;
  uiState: RivalUIState;
}

export interface RivalResolutionResult {
  rivalCorrect: boolean;
  rivalPointsDelta: number;
  reactionMood: CharacterMood;
  uiState: RivalUIState;
}

interface RivalProfile {
  name: string;
  shortName: string;
  title: string;
  baseAccuracy: number;
  peelChance: number;
  overclockChance: number;
  minLockRatio: number;
  maxLockRatio: number;
}

const RIVAL_PROFILES: Record<RivalCharacterId, RivalProfile> = {
  nadia: {
    name: 'Nadia Al-Mansoor',
    shortName: 'Nadia',
    title: 'The Polymath · Sovereign Prodigy',
    baseAccuracy: 0.78,
    peelChance: 0.46,
    overclockChance: 0.44,
    minLockRatio: 0.42,
    maxLockRatio: 0.72,
  },
  soren: {
    name: 'Soren "Echo" Kael',
    shortName: 'Soren',
    title: '"Echo" · Horizon Wildcard',
    baseAccuracy: 0.75,
    peelChance: 0.30,
    overclockChance: 0.62,
    minLockRatio: 0.28,
    maxLockRatio: 0.56,
  },
  vance: {
    name: 'Julian Vance',
    shortName: 'Vance',
    title: 'Chief Adjudicator · The Maestro',
    baseAccuracy: 0.84,
    peelChance: 0.22,
    overclockChance: 0.56,
    minLockRatio: 0.34,
    maxLockRatio: 0.62,
  },
  lindqvist: {
    name: 'Chancellor Ingrid Lindqvist',
    shortName: 'Lindqvist',
    title: 'Sovereign Chair · The Kingmaker',
    baseAccuracy: 0.80,
    peelChance: 0.36,
    overclockChance: 0.42,
    minLockRatio: 0.40,
    maxLockRatio: 0.68,
  },
  teo: {
    name: 'Mateo "Teo" Rojas',
    shortName: 'Teo',
    title: 'Rogue Producer · The Fixer',
    baseAccuracy: 0.76,
    peelChance: 0.44,
    overclockChance: 0.54,
    minLockRatio: 0.30,
    maxLockRatio: 0.58,
  },
  tariq: {
    name: 'Tariq Al-Mansoor',
    shortName: 'Tariq',
    title: 'Meridian Zero · Ghost of Trial 00',
    baseAccuracy: 0.82,
    peelChance: 0.26,
    overclockChance: 0.48,
    minLockRatio: 0.36,
    maxLockRatio: 0.64,
  },
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class RivalAI {
  private readonly id: RivalCharacterId;
  private readonly profile: RivalProfile;
  private readonly displayName: string;
  private readonly shortName: string;
  private readonly displayTitle: string;
  private readonly isGhostTelemetry: boolean;
  private readonly tempoStealActive: boolean;
  private readonly tempoStealBlockedByPerk: boolean;
  private readonly analogStaticJammed: boolean;
  private readonly grudgePressure: boolean;
  private readonly grudgeDomainId?: DomainId;
  private readonly grudgeDomainName?: string;
  private readonly isVanceFinale: boolean;

  private readonly tunedBaseAccuracy: number;
  private readonly tunedPeelChance: number;
  private readonly tunedOverclockChance: number;
  private readonly speedMultiplier: number;

  private score = 0;
  private status: RivalPrismStatus = 'HIDDEN';
  private tellMessage: string | undefined;

  // Per-question plan
  private peelAtSec: number | null = null;
  private overclockAtSec: number | null = null;
  private lockAtSec = 10;
  private tempoStealAtSec: number | null = null;
  private tempoStealFired = false;
  private bluffBaited = false;

  private plannedPeelTier: PeelTier = 1;
  private plannedOverclock = false;
  private plannedOverclockBonus = 0;
  private plannedCorrect = true;
  private questionResolved = false;

  constructor(config: RivalAIConfig) {
    this.id = config.id;
    this.profile = RIVAL_PROFILES[config.id];
    this.displayName = config.customName ?? this.profile.name;
    this.shortName = config.customName ?? this.profile.shortName;
    this.displayTitle = config.customTitle ?? this.profile.title;
    this.isGhostTelemetry = Boolean(config.isGhostTelemetry);
    this.tempoStealActive = Boolean(config.tempoStealActive);
    this.tempoStealBlockedByPerk = Boolean(config.tempoStealBlockedByPerk);
    this.analogStaticJammed = Boolean(config.analogStaticJammed);
    this.grudgePressure = Boolean(config.grudgePressure);
    this.grudgeDomainId = config.grudgeDomainId;
    this.grudgeDomainName = config.grudgeDomainName;
    this.isVanceFinale = Boolean(config.isVanceFinale);

    // Derive accuracy from Elo if provided (1180 -> 0.65 .. 1850 -> 0.87)
    const eloDerivedAcc =
      config.elo !== undefined
        ? clamp(0.62 + ((config.elo - 1100) / 800) * 0.26, 0.56, 0.89)
        : this.profile.baseAccuracy;

    this.tunedBaseAccuracy = clamp(
      config.baseAccuracyOverride ?? (this.isVanceFinale ? 0.85 : eloDerivedAcc),
      0.45,
      0.92
    );
    this.tunedPeelChance = clamp(
      config.peelChanceOverride ?? this.profile.peelChance,
      0.08,
      0.85
    );
    this.tunedOverclockChance = clamp(
      config.overclockChanceOverride ?? this.profile.overclockChance,
      0.1,
      0.85
    );
    this.speedMultiplier = clamp(config.speedMultiplier ?? 1.0, 0.65, 1.35);
  }

  public getId(): RivalCharacterId {
    return this.id;
  }

  public getName(): string {
    return this.displayName;
  }

  public getScore(): number {
    return this.score;
  }

  public setScore(score: number): void {
    this.score = Math.max(0, Math.round(score));
  }

  public reset(): void {
    this.score = 0;
    this.status = 'HIDDEN';
    this.tellMessage = undefined;
    this.questionResolved = false;
  }

  /**
   * Bluff Echo Perk Counterplay:
   * Flick-canceling an Overclock baits a rival still deciding into a panicked premature lock!
   */
  public triggerBluffEchoBait(elapsedSec: number): boolean {
    if (this.questionResolved || this.status === 'LOCKED' || this.bluffBaited) {
      return false;
    }
    this.bluffBaited = true;
    this.plannedOverclock = false;
    this.plannedOverclockBonus = 0;
    this.overclockAtSec = null;
    this.peelAtSec = null;
    this.lockAtSec = Math.min(this.lockAtSec, elapsedSec + 0.35);
    if (this.plannedCorrect && Math.random() < 0.62) {
      this.plannedCorrect = false;
    }
    this.tellMessage = `BLUFF ECHO! ${this.shortName} bites your feint and slams a premature lock!`;
    return true;
  }

  public beginQuestion(question: QuestionRecord, timeTotalSec: number): RivalUIState {
    this.status = 'THINKING';
    this.questionResolved = false;
    this.tempoStealFired = false;
    this.bluffBaited = false;

    const isGauntlet = question.archetype === 'GAUNTLET_SHATTER';
    const difficultyFactor = clamp(question.irtB, -2, 2.5);
    const isGrudgeDomainHit =
      this.grudgePressure &&
      (this.grudgeDomainId === undefined || question.l0Domain === this.grudgeDomainId);

    // Compute lock timing
    let minRatio = this.profile.minLockRatio * this.speedMultiplier;
    let maxRatio = this.profile.maxLockRatio * this.speedMultiplier;

    if (this.id === 'nadia' && this.tempoStealActive) {
      minRatio *= 0.78;
      maxRatio *= 0.80;
    }
    if (isGrudgeDomainHit) {
      minRatio *= 0.84;
      maxRatio *= 0.86;
    }
    if (this.id === 'soren' && this.analogStaticJammed && !this.isGhostTelemetry) {
      minRatio = Math.min(0.75, minRatio + 0.24);
      maxRatio = Math.min(0.88, maxRatio + 0.26);
    }

    minRatio = clamp(minRatio, 0.2, 0.78);
    maxRatio = clamp(Math.max(minRatio + 0.08, maxRatio), 0.3, 0.9);

    const baseRatio = minRatio + Math.random() * (maxRatio - minRatio);
    this.lockAtSec = clamp(
      timeTotalSec * baseRatio,
      isGauntlet ? 1.8 : 2.8,
      Math.max(3.2, timeTotalSec - 1.4)
    );

    // Decide Peel behavior (disabled in Gauntlet or Analog Static Jammer!)
    const canPeel = !isGauntlet && !this.analogStaticJammed;
    const adjustedPeelChance = clamp(
      this.tunedPeelChance + difficultyFactor * 0.12 - (isGrudgeDomainHit ? 0.12 : 0),
      0.08,
      0.84
    );
    const willPeel = canPeel && Math.random() < adjustedPeelChance;
    this.plannedPeelTier = willPeel ? 2 : 1;
    this.peelAtSec = willPeel
      ? clamp(this.lockAtSec * (0.36 + Math.random() * 0.18), 1.3, Math.max(1.4, this.lockAtSec - 1.3))
      : null;

    // Decide Overclock behavior
    const overclockChance =
      this.id === 'soren' && this.analogStaticJammed && !this.isGhostTelemetry
        ? 0.28
        : this.id === 'nadia' && (this.tempoStealActive || isGrudgeDomainHit)
          ? 0.60
          : this.tunedOverclockChance;

    this.plannedOverclock = !isGauntlet && Math.random() < overclockChance;
    this.plannedOverclockBonus = this.plannedOverclock ? 0.35 + Math.random() * 0.55 : 0;
    this.overclockAtSec = this.plannedOverclock
      ? clamp(
          this.lockAtSec - (0.9 + Math.random() * 0.5),
          (this.peelAtSec ?? 1.1) + 0.7,
          Math.max(1.8, this.lockAtSec - 0.45)
        )
      : null;

    // Tempo Steal (Nadia angered after Lindqvist briefing, or Nemesis Grudge Pressure!)
    if ((this.tempoStealActive || isGrudgeDomainHit) && !isGauntlet && !this.isGhostTelemetry) {
      this.tempoStealAtSec = clamp(
        this.lockAtSec - 1.0,
        2.8,
        Math.max(3.0, timeTotalSec * 0.46)
      );
    } else {
      this.tempoStealAtSec = null;
    }

    // Compute accuracy probability
    let accuracy = this.tunedBaseAccuracy - difficultyFactor * 0.08;
    if (willPeel) accuracy += 0.09;
    if (isGrudgeDomainHit) accuracy += 0.07;
    if (this.id === 'soren' && this.analogStaticJammed && !this.isGhostTelemetry) {
      accuracy -= 0.16; // Jammed earpiece hits Soren's certainty hard!
    }
    this.plannedCorrect = Math.random() < clamp(accuracy, 0.35, 0.92);

    // Opening flavor tell
    if (this.isGhostTelemetry) {
      this.tellMessage = this.analogStaticJammed
        ? `GHOST TELEMETRY: ${this.shortName} locked in Analog Static — Peel disabled.`
        : `GHOST TELEMETRY: ${this.shortName} scanning Prism facets live.`;
    } else if (isGrudgeDomainHit && this.grudgeDomainName) {
      this.tellMessage = `GRUDGE PRESSURE: ${this.shortName} counter-picked your weakest domain (${this.grudgeDomainName})!`;
    } else if (this.isVanceFinale || this.id === 'vance') {
      this.tellMessage =
        'Vance rolls his brass astrolabe across his palm — measuring your nerve before 2 billion viewers.';
    } else if (this.id === 'soren' && this.analogStaticJammed) {
      this.tellMessage = "Soren's earpiece is dead static — coin rolling erratically.";
    } else if (this.id === 'nadia' && this.tempoStealActive) {
      this.tellMessage = "Nadia's eyes lock hard — Tempo Steal pressure building.";
    } else if (this.id === 'nadia') {
      this.tellMessage = 'Nadia scans the facets in measured silence.';
    } else if (this.id === 'lindqvist') {
      this.tellMessage = 'Lindqvist folds her hands — cold Sovereign precision.';
    } else if (this.id === 'teo') {
      this.tellMessage = "Teo's eyes flick between your Prism and the live uplink feed.";
    } else if (this.id === 'tariq') {
      this.tellMessage = 'Tariq studies the core calmly — the original 99.4% mind.';
    } else {
      this.tellMessage = 'Soren rolls a weighted gold coin smoothly across his knuckles.';
    }

    return this.getUIState();
  }

  public tick(elapsedSec: number): RivalTickResult {
    if (this.questionResolved) {
      return {
        changed: false,
        status: this.status,
        tempoStealSec: 0,
        tempoStealBlocked: false,
        uiState: this.getUIState(),
      };
    }

    let changed = false;
    let mood: CharacterMood | undefined;
    let tempoStealSec = 0;
    let tempoStealBlocked = false;

    // Check Tempo Steal trigger
    if (
      this.tempoStealAtSec !== null &&
      !this.tempoStealFired &&
      elapsedSec >= this.tempoStealAtSec
    ) {
      this.tempoStealFired = true;
      changed = true;
      if (this.tempoStealBlockedByPerk) {
        tempoStealBlocked = true;
        mood = 'RATTLED';
        this.tellMessage = 'TEMPO STEAL BLOCKED — Analog Instinct shields your Chrono-Ring!';
      } else {
        tempoStealSec = 2.0;
        mood = 'SMIRK';
        this.tellMessage = this.grudgePressure
          ? `GRUDGE TEMPO STEAL! ${this.shortName} shaves -2.0s off your Chrono-Ring!`
          : `TEMPO STEAL! ${this.shortName} compresses your Chrono-Ring (-2.0s)!`;
      }
    }

    // Phase transitions
    if (this.status !== 'LOCKED' && elapsedSec >= this.lockAtSec) {
      this.status = 'LOCKED';
      changed = true;
      if (this.bluffBaited) {
        mood = 'RATTLED';
        this.tellMessage = `${this.shortName} snapped early on your Bluff Echo feint!`;
      } else if (this.isGhostTelemetry) {
        mood = this.plannedCorrect ? 'SMIRK' : 'TENSE';
        this.tellMessage = `GHOST LOCK: ${this.shortName} committed at ${elapsedSec.toFixed(1)}s!`;
      } else if (this.id === 'soren' && this.analogStaticJammed && !this.plannedCorrect) {
        mood = 'RATTLED';
        this.tellMessage = 'Soren hesitates, then slams a blind Analog lock!';
      } else {
        mood = this.plannedCorrect ? 'SMIRK' : 'TENSE';
        this.tellMessage = this.buildLockTell();
      }
    } else if (
      this.overclockAtSec !== null &&
      this.status !== 'OVERCLOCKING' &&
      this.status !== 'LOCKED' &&
      elapsedSec >= this.overclockAtSec
    ) {
      this.status = 'OVERCLOCKING';
      changed = true;
      mood = 'TELL';
      this.tellMessage = this.buildOverclockTell();
    } else if (
      this.peelAtSec !== null &&
      this.status === 'THINKING' &&
      elapsedSec >= this.peelAtSec
    ) {
      this.status = 'PEELING';
      changed = true;
      mood = 'TENSE';
      this.tellMessage = this.buildPeelTell();
    }

    return {
      changed,
      status: this.status,
      mood,
      tellMessage: changed ? this.tellMessage : undefined,
      tempoStealSec,
      tempoStealBlocked,
      uiState: this.getUIState(),
    };
  }

  public resolveQuestion(
    question: QuestionRecord,
    playerCorrect: boolean,
    playerBackfired: boolean
  ): RivalResolutionResult {
    this.questionResolved = true;
    this.status = 'LOCKED';

    // Rival gets a minor tactical recovery if player backfired (per Pitch Bible)
    const effectiveCorrect =
      this.plannedCorrect || (!this.bluffBaited && playerBackfired && Math.random() < 0.35);

    let delta = 0;
    if (effectiveCorrect) {
      const base = question.archetype === 'GAUNTLET_SHATTER' ? 800 : 1000;
      const tierMult =
        question.archetype === 'GAUNTLET_SHATTER'
          ? 1.5
          : this.plannedPeelTier === 1
            ? 3.0
            : 2.0;
      const ocMult = this.plannedOverclock ? 1 + this.plannedOverclockBonus * 0.65 : 1.0;
      const speed = Math.round(120 + Math.random() * 140);
      const scale = this.isVanceFinale ? 0.78 : this.isGhostTelemetry ? 0.75 : 0.72;
      delta = Math.round(base * tierMult * ocMult * scale + speed);
    }

    if (playerBackfired) {
      delta += 250; // Tactical momentum gift on player Backfire
    }

    this.score += delta;

    let reactionMood: CharacterMood;
    if (playerBackfired || (effectiveCorrect && !playerCorrect)) {
      reactionMood = 'SMIRK';
      this.tellMessage = this.buildWinRoundTell(playerBackfired);
    } else if (!effectiveCorrect && playerCorrect) {
      reactionMood = 'RATTLED';
      this.tellMessage = this.buildLoseRoundTell();
    } else if (playerCorrect && effectiveCorrect) {
      reactionMood = 'TENSE';
      this.tellMessage = this.isGhostTelemetry
        ? `DEAD HEAT: Both you and ${this.shortName} cleared the facet!`
        : this.id === 'vance'
          ? 'Vance taps his right-ear stylus — "Match point for mind against mind."'
          : this.id === 'nadia'
            ? 'Both beams glow gold — razor-tight duel!'
            : `Dead heat — ${this.shortName} resets for the next prism.`;
    } else {
      reactionMood = 'NEUTRAL';
      this.tellMessage = 'Neither contender cracked that prism cleanly.';
    }

    return {
      rivalCorrect: effectiveCorrect,
      rivalPointsDelta: delta,
      reactionMood,
      uiState: this.getUIState(),
    };
  }

  public getUIState(): RivalUIState {
    return {
      id: this.id,
      name: this.displayName,
      title: this.displayTitle,
      score: this.score,
      status: this.status,
      tellMessage: this.tellMessage,
    };
  }

  private buildPeelTell(): string {
    if (this.isGhostTelemetry) {
      return `GHOST TELEMETRY: ${this.shortName} cracked Tier-2 shutters.`;
    }
    switch (this.id) {
      case 'nadia':
        return "Gold steam vents from Nadia's Prism — she peeled Tier 2.";
      case 'vance':
        return 'Vance opens Tier 2 smoothly — "Precision over vanity."';
      case 'lindqvist':
        return 'Lindqvist unlocks Tier-2 archive shutters without blinking.';
      case 'teo':
        return 'Teo pops Tier-2 shutters fast, scanning the hologram.';
      case 'tariq':
        return 'Tariq vents a sliver of aurora vapor at Tier 2.';
      default:
        return 'Soren cracks his obsidian shutters for a Tier-2 holographic glimpse.';
    }
  }

  private buildOverclockTell(): string {
    if (this.isGhostTelemetry) {
      return `GHOST SURGE: ${this.shortName} charging Conviction Overclock!`;
    }
    switch (this.id) {
      case 'nadia':
        return 'TELL: Micro-blink & tiny corner smirk — Nadia is OVERCLOCKING!';
      case 'vance':
        return 'TELL: Vance adjusts his left brass cufflink — ARBITER OVERCLOCK!';
      case 'lindqvist':
        return 'TELL: Lindqvist lowers her platinum spectacles — SOVEREIGN OVERCLOCK!';
      case 'teo':
        return 'TELL: Teo checks the boom camera twice — PIRATE OVERCLOCK SURGE!';
      case 'tariq':
        return 'TELL: Basalt cryo-prism flares bright — Tariq is OVERCLOCKING!';
      default:
        return this.analogStaticJammed
          ? "TELL: Soren's coin slips mid-spin — desperate crimson Overclock!"
          : "TELL: Soren's gold coin FREEZES dead — Horizon Overclock surge!";
    }
  }

  private buildLockTell(): string {
    switch (this.id) {
      case 'nadia':
        return pickRandom([
          'Nadia locks her facet with a crisp brass clack!',
          "Nadia's beam snaps solid — your turn on the clock.",
        ]);
      case 'vance':
        return pickRandom([
          'Vance locks his facet with a velvet watchmaker click.',
          'Vance sets his astrolabe down — "Your move, contender."',
        ]);
      case 'lindqvist':
        return 'Lindqvist seals her Prism with austere finality.';
      case 'teo':
        return 'Teo slams his console lock — grinning across the lens.';
      case 'tariq':
        return 'Tariq locks cold-instinct — effortless 99.4% resonance.';
      default:
        return pickRandom([
          'Soren snaps his Prism shut and leans back grinning.',
          'Soren locked in — daring you to outbid him.',
        ]);
    }
  }

  private buildWinRoundTell(playerBackfired: boolean): string {
    if (this.isGhostTelemetry) {
      return playerBackfired
        ? `${this.shortName}'s ghost surges ahead off your Overclock backfire!`
        : `${this.shortName} claims the round on Ghost telemetry.`;
    }
    switch (this.id) {
      case 'nadia':
        return playerBackfired
          ? "Nadia's corner smirk widens as your Overclock shatters."
          : 'Nadia banks the round cleanly.';
      case 'vance':
        return playerBackfired
          ? 'Vance tilts his head — "Conviction without precision is merely theater."'
          : 'Vance takes the point with calm authority.';
      case 'lindqvist':
        return playerBackfired
          ? 'Lindqvist sets her spectacles down — "Recklessness disqualifies itself."'
          : 'Chancellor Lindqvist secures the Sovereign tally.';
      case 'teo':
        return playerBackfired
          ? 'Teo winces — "Oof! That backfire just burned live across 200 feeds!"'
          : 'Teo steals the round on pure street instinct.';
      case 'tariq':
        return playerBackfired
          ? 'Tariq shakes his head — "Breathe. Overclocking blind is how they break you."'
          : 'Tariq clears the synthesis with surgical calm.';
      default:
        return playerBackfired
          ? 'Soren flips his coin high — "Never bluff a shark!"'
          : 'Soren pockets the points with a sharp wink.';
    }
  }

  private buildLoseRoundTell(): string {
    if (this.bluffBaited) {
      return `${this.shortName} was completely fooled by your Bluff Echo feint!`;
    }
    if (this.isGhostTelemetry) {
      return `${this.shortName}'s ghost missed — you widen your Elo lead!`;
    }
    switch (this.id) {
      case 'nadia':
        return "Nadia's jaw clenches — she missed that facet!";
      case 'vance':
        return 'Vance taps his right-ear stylus twice — genuinely impressed!';
      case 'lindqvist':
        return "A rare flicker crosses Lindqvist's composure — outplayed!";
      case 'teo':
        return 'Teo laughs into his mic — "Okay, respect! You got me clean!"';
      case 'tariq':
        return 'Tariq smiles softly — "Julian chose well. 99.4% wasn\'t an accident."';
      default:
        return this.analogStaticJammed
          ? 'Soren grimaces — dead earpiece cost him the round!'
          : "Soren's coin drops flat on the glass — rattled!";
    }
  }
}
