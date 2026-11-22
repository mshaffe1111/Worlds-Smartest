// ============================================================================
// WORLD'S SMARTEST — 2PL / GRM PSYCHOMETRIC IRT ADAPTIVE DIRECTOR
// Implements docs/PITCH_BIBLE.md §6.3 & §2.4:
//   • Global thetaGlobal + 12-Domain Skill Vector thetaDomain[0..11]
//   • Graded Epistemic Mastery (Tier-1 Cold Instinct > Tier-2 Clue > Tier-3 Blueprint)
//   • Overclock strictly decoupled from IRT/Elo (purely a score wager!)
//   • Meridian Passport 12-Domain Mastery Radar + Nemesis Nadia Weakest-Domain Counter-Pick
// ============================================================================

import {
  FORGE_DOMAINS,
  type Archetype3D,
  type DomainId,
  type DomainSkillEntry,
  type IrtOutcomeInput,
  type IrtSkillSnapshot,
  type PeelTier,
} from './types';

const IRT_STORAGE_KEY = 'ws_forge_irt_skill_v2';

const THETA_MIN = -2.5;
const THETA_MAX = 2.5;
const GLOBAL_LR = 0.14;
const DOMAIN_LR = 0.22;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round3(val: number): number {
  return Math.round(val * 1000) / 1000;
}

export function thetaToElo(theta: number): number {
  return Math.round(clamp(1200 + theta * 320, 800, 2200));
}

export function thetaToMasteryPct(theta: number, attempts = 0): number {
  // Base 0.0 theta maps to 50% baseline; [-2.5..+2.5] maps smoothly to [12%..99%]
  const normalized = (clamp(theta, THETA_MIN, THETA_MAX) - THETA_MIN) / (THETA_MAX - THETA_MIN);
  const rawPct = 12 + normalized * 87;
  // Blend gently from 42% starter radar baseline over first 4 attempts so fresh Passports look balanced
  const confidence = clamp(attempts / 4, 0, 1);
  return Math.round(42 * (1 - confidence) + rawPct * confidence);
}

export function eloToRankTitle(elo: number): string {
  if (elo >= 1900) return 'Sovereign Arbiter';
  if (elo >= 1700) return 'Grandmaster';
  if (elo >= 1500) return 'Polymath';
  if (elo >= 1320) return 'Specialist';
  if (elo >= 1120) return 'Contender';
  return 'Initiate';
}

export class IrtAdaptiveDirector {
  private thetaGlobal = 0.0;
  private readonly thetaDomain: number[] = new Array<number>(12).fill(0.0);
  private readonly domainAttempts: number[] = new Array<number>(12).fill(0);
  private readonly domainCorrect: number[] = new Array<number>(12).fill(0);

  private consecutiveMisses = 0;
  private currentStreak = 0;
  private bestStreak = 0;
  private totalAnswered = 0;
  private totalCorrect = 0;

  private readonly storageKey: string;

  constructor(storageKey: string = IRT_STORAGE_KEY, autoLoad = true) {
    this.storageKey = storageKey;
    if (autoLoad) {
      this.loadFromStorage();
    }
  }

  /**
   * 3PL/2PL item characteristic curve:
   * P(theta) = c + (1 - c) / (1 + exp(-a * (theta - b)))
   */
  public computeExpectedProbability(
    theta: number,
    irtB: number,
    irtA = 1.25,
    guessingFloor = 0.18,
  ): number {
    const a = clamp(irtA, 0.45, 2.25);
    const c = clamp(guessingFloor, 0.0, 0.45);
    const z = clamp(a * (theta - irtB), -12, 12);
    const logistic = 1 / (1 + Math.exp(-z));
    return c + (1 - c) * logistic;
  }

  /**
   * Graded Response Model (GRM) epistemic score in [0..1]:
   *   • Tier-1 Cold Instinct (3.0x) = 1.00 epistemic mastery
   *   • Tier-2 Clue Core (2.0x)     = 0.72 epistemic mastery (assisted lateral deduction)
   *   • Tier-3 Blueprint (1.2x)     = 0.44 epistemic mastery (2-facet duel + pinpoint clue)
   *   • Overclock is strictly ignored per PITCH_BIBLE.md §6.3!
   */
  public computeEpistemicGrade(outcome: IrtOutcomeInput): {
    grade: number;
    effectiveB: number;
    guessingFloor: number;
  } {
    const peel: PeelTier = outcome.peelTier ?? 1;
    const arch: Archetype3D = outcome.archetype;

    if (!outcome.correct) {
      const partial =
        outcome.accuracyRatio !== undefined && outcome.accuracyRatio > 0.5
          ? clamp(outcome.accuracyRatio * 0.35, 0, 0.35)
          : 0.0;
      const floor =
        arch === 'CALIBRATOR_DIAL' || arch === 'CODEX_DUAL_RING'
          ? 0.05
          : arch === 'GAUNTLET_SHATTER'
            ? 0.35
            : peel === 3
              ? 0.42
              : 0.2;
      return {
        grade: partial,
        effectiveB: outcome.irtB,
        guessingFloor: floor,
      };
    }

    if (arch === 'CALIBRATOR_DIAL') {
      const acc = outcome.bullseye
        ? 1.0
        : outcome.accuracyRatio !== undefined
          ? clamp(0.62 + outcome.accuracyRatio * 0.38, 0.62, 1.0)
          : peel === 1
            ? 0.9
            : 0.7;
      return {
        grade: acc,
        effectiveB: peel === 1 ? outcome.irtB : outcome.irtB - 0.35,
        guessingFloor: 0.05,
      };
    }

    if (arch === 'CODEX_DUAL_RING') {
      const acc =
        outcome.accuracyRatio !== undefined
          ? clamp(outcome.accuracyRatio, 0.45, 1.0)
          : peel === 1
            ? 1.0
            : 0.75;
      return {
        grade: acc,
        effectiveB: peel === 1 ? outcome.irtB : outcome.irtB - 0.4,
        guessingFloor: 0.08,
      };
    }

    if (arch === 'GAUNTLET_SHATTER') {
      return {
        grade: outcome.bullseye ? 1.0 : 0.88,
        effectiveB: outcome.irtB,
        guessingFloor: 0.35,
      };
    }

    // SIGHTLINE_LOCK & HERO_ARTIFACT_SYNTHESIS Graded Epistemic Tiers
    if (peel === 1) {
      return { grade: 1.0, effectiveB: outcome.irtB, guessingFloor: 0.2 };
    }
    if (peel === 2) {
      return { grade: 0.72, effectiveB: outcome.irtB - 0.42, guessingFloor: 0.25 };
    }
    return { grade: 0.44, effectiveB: outcome.irtB - 0.9, guessingFloor: 0.42 };
  }

  /**
   * Updates global theta & 12-domain skill vector after a question resolves.
   * Overclock is intentionally decoupled so wagering cannot inflate or tank psychometric Elo.
   */
  public recordOutcome(outcome: IrtOutcomeInput, persist = true): IrtSkillSnapshot {
    const dom = clamp(Math.trunc(outcome.l0Domain), 0, 11) as DomainId;
    const a = clamp(outcome.irtA ?? 1.25, 0.5, 2.0);
    const { grade, effectiveB, guessingFloor } = this.computeEpistemicGrade(outcome);

    const pGlobal = this.computeExpectedProbability(
      this.thetaGlobal,
      effectiveB,
      a,
      guessingFloor,
    );
    const pDomain = this.computeExpectedProbability(
      this.thetaDomain[dom],
      effectiveB,
      a,
      guessingFloor,
    );

    // Information-scaled step with gentler early-attempt damping
    const infoScale = clamp(a / 1.25, 0.65, 1.45);
    this.thetaGlobal = round3(
      clamp(this.thetaGlobal + GLOBAL_LR * infoScale * (grade - pGlobal), THETA_MIN, THETA_MAX),
    );
    this.thetaDomain[dom] = round3(
      clamp(
        this.thetaDomain[dom] + DOMAIN_LR * infoScale * (grade - pDomain),
        THETA_MIN,
        THETA_MAX,
      ),
    );

    this.domainAttempts[dom] += 1;
    this.totalAnswered += 1;

    if (outcome.correct) {
      this.domainCorrect[dom] += 1;
      this.totalCorrect += 1;
      this.consecutiveMisses = 0;
      this.currentStreak += 1;
      if (this.currentStreak > this.bestStreak) {
        this.bestStreak = this.currentStreak;
      }
    } else {
      this.consecutiveMisses += 1;
      this.currentStreak = 0;
    }

    if (persist) {
      this.saveToStorage();
    }
    return this.getSnapshot();
  }

  public getThetaGlobal(): number {
    return this.thetaGlobal;
  }

  public getThetaForDomain(domainId: DomainId): number {
    return this.thetaDomain[clamp(Math.trunc(domainId), 0, 11)];
  }

  public getThetaVector(): ReadonlyArray<number> {
    return this.thetaDomain;
  }

  /**
   * Computes flow-state target `irtB` for Briefing Room / Quick / Trials modes.
   * Targets 70% expected Tier-1/2 solve rate (65–75% sweet spot per PITCH_BIBLE.md §4),
   * applying a subtle mercy step-down after consecutive misses.
   */
  public getFlowTargetIrtB(
    domainId?: DomainId,
    targetSuccessProb = 0.7,
  ): number {
    const baseTheta =
      domainId !== undefined
        ? this.thetaDomain[domainId] * 0.65 + this.thetaGlobal * 0.35
        : this.thetaGlobal;

    const p = clamp(targetSuccessProb, 0.52, 0.88);
    // Inverse logistic offset: b = theta - ln(p / (1 - p)) / a
    const logitOffset = Math.log(p / (1 - p)) / 1.25;
    let targetB = baseTheta - logitOffset;

    if (this.consecutiveMisses >= 2) {
      targetB -= Math.min(0.65, this.consecutiveMisses * 0.22);
    } else if (this.currentStreak >= 4) {
      targetB += Math.min(0.45, (this.currentStreak - 3) * 0.11);
    }

    return round3(clamp(targetB, -1.65, 2.45));
  }

  /**
   * Full 12-Domain Skill Vector for Meridian Diplomatic Passport SVG Mastery Radar
   * and Category Elo cards.
   */
  public getSkillVector(): DomainSkillEntry[] {
    return FORGE_DOMAINS.map((meta) => {
      const d = meta.id;
      const theta = this.thetaDomain[d];
      const attempts = this.domainAttempts[d];
      const correct = this.domainCorrect[d];
      const elo = thetaToElo(theta);
      const masteryPct = thetaToMasteryPct(theta, attempts);
      const accuracyPct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
      return {
        domainId: d,
        key: meta.key,
        name: meta.name,
        shortName: meta.shortName,
        accentHex: meta.accentHex,
        medallionUrl: meta.medallionUrl,
        theta,
        masteryPct,
        elo,
        rankTitle: eloToRankTitle(elo),
        attempts,
        correct,
        accuracyPct,
      };
    });
  }

  /** Normalized [0.15 .. 1.00] 12-spoke polygon radii for the Passport Mastery Radar SVG */
  public getRadarRadii(): number[] {
    return this.getSkillVector().map((entry) => clamp(entry.masteryPct / 100, 0.18, 1.0));
  }

  /**
   * Ranks the player's weakest domains (lowest theta, tie-broken by lowest accuracy & more attempts).
   * Used directly by Nemesis Nadia in Rio / Act II+ to counter-pick the player's weakest trivia category!
   */
  public getWeakestDomains(count = 3, exclude: ReadonlyArray<DomainId> = []): DomainId[] {
    const excluded = new Set<number>(exclude);
    const entries = this.getSkillVector().filter((e) => !excluded.has(e.domainId));
    entries.sort((a, b) => {
      if (Math.abs(a.theta - b.theta) > 0.02) return a.theta - b.theta;
      if (a.accuracyPct !== b.accuracyPct) return a.accuracyPct - b.accuracyPct;
      if (a.attempts !== b.attempts) return b.attempts - a.attempts;
      // Deterministic tie-break favoring rigorous academic/cryptic counter-picks
      return b.domainId - a.domainId;
    });
    return entries.slice(0, Math.max(1, count)).map((e) => e.domainId);
  }

  /** Single-domain helper for Nemesis Nadia's counter-pick audible */
  public pickNemesisCounterDomain(exclude: ReadonlyArray<DomainId> = []): DomainId {
    const weakest = this.getWeakestDomains(1, exclude);
    return weakest[0] ?? (11 as DomainId);
  }

  /** Ranks the player's strongest domains (highest theta, tie-broken by accuracy & attempts) */
  public getStrongestDomains(count = 3, exclude: ReadonlyArray<DomainId> = []): DomainId[] {
    const excluded = new Set<number>(exclude);
    const entries = this.getSkillVector().filter((e) => !excluded.has(e.domainId));
    entries.sort((a, b) => {
      if (Math.abs(b.theta - a.theta) > 0.02) return b.theta - a.theta;
      if (b.accuracyPct !== a.accuracyPct) return b.accuracyPct - a.accuracyPct;
      return b.attempts - a.attempts;
    });
    return entries.slice(0, Math.max(1, count)).map((e) => e.domainId);
  }

  public getSnapshot(): IrtSkillSnapshot {
    return {
      thetaGlobal: this.thetaGlobal,
      globalElo: thetaToElo(this.thetaGlobal),
      globalMasteryPct: thetaToMasteryPct(this.thetaGlobal, this.totalAnswered),
      thetaDomain: [...this.thetaDomain],
      domainElo: this.thetaDomain.map((t) => thetaToElo(t)),
      domainAttempts: [...this.domainAttempts],
      domainCorrect: [...this.domainCorrect],
      consecutiveMisses: this.consecutiveMisses,
      currentStreak: this.currentStreak,
      bestStreak: this.bestStreak,
      totalAnswered: this.totalAnswered,
      totalCorrect: this.totalCorrect,
    };
  }

  public saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(this.storageKey, JSON.stringify(this.getSnapshot()));
    } catch {
      // Ignore SSR/quota errors
    }
  }

  public loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<IrtSkillSnapshot>;
      if (typeof parsed.thetaGlobal === 'number' && Number.isFinite(parsed.thetaGlobal)) {
        this.thetaGlobal = clamp(parsed.thetaGlobal, THETA_MIN, THETA_MAX);
      }
      if (Array.isArray(parsed.thetaDomain) && parsed.thetaDomain.length === 12) {
        for (let i = 0; i < 12; i++) {
          const v = Number(parsed.thetaDomain[i]);
          this.thetaDomain[i] = Number.isFinite(v) ? clamp(v, THETA_MIN, THETA_MAX) : 0;
        }
      }
      if (Array.isArray(parsed.domainAttempts) && parsed.domainAttempts.length === 12) {
        for (let i = 0; i < 12; i++) {
          this.domainAttempts[i] = Math.max(0, Math.trunc(Number(parsed.domainAttempts[i]) || 0));
        }
      }
      if (Array.isArray(parsed.domainCorrect) && parsed.domainCorrect.length === 12) {
        for (let i = 0; i < 12; i++) {
          this.domainCorrect[i] = Math.max(0, Math.trunc(Number(parsed.domainCorrect[i]) || 0));
        }
      }
      this.consecutiveMisses = Math.max(0, Math.trunc(Number(parsed.consecutiveMisses) || 0));
      this.currentStreak = Math.max(0, Math.trunc(Number(parsed.currentStreak) || 0));
      this.bestStreak = Math.max(0, Math.trunc(Number(parsed.bestStreak) || 0));
      this.totalAnswered = Math.max(0, Math.trunc(Number(parsed.totalAnswered) || 0));
      this.totalCorrect = Math.max(0, Math.trunc(Number(parsed.totalCorrect) || 0));
    } catch {
      // Ignore corrupt storage
    }
  }

  public reset(persist = true): void {
    this.thetaGlobal = 0.0;
    this.thetaDomain.fill(0.0);
    this.domainAttempts.fill(0);
    this.domainCorrect.fill(0);
    this.consecutiveMisses = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.totalAnswered = 0;
    this.totalCorrect = 0;
    if (persist) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(this.storageKey);
        }
      } catch {
        // Ignore
      }
    }
  }
}
