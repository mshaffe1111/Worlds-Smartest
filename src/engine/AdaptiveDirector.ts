// ============================================================================
// AdaptiveDirector — Graded Response Model (GRM) IRT Psychometric Engine
// Tracks global + 12-domain latent ability (theta) mapped to Elo (600..2400).
// Strictly separates epistemic mastery from Overclock score wagering!
// ============================================================================

import type {
  AnswerSubmission,
  DomainId,
  QuestionRecord,
  QuestionResolution,
} from '../types/game';

const STORAGE_KEY = 'ws_irt_v1';
const DOMAIN_COUNT = 12;
const MIN_THETA = -2.0;
const MAX_THETA = 4.0;
const MIN_ELO = 600;
const MAX_ELO = 2400;
const BASE_ELO = 1200;
const ELO_PER_THETA = 300;

interface PersistedIrtStateV1 {
  v: 1;
  thetaGlobal: number;
  thetaDomain: number[];
  globalAttempts: number;
  domainAttempts: number[];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function logistic(x: number): number {
  if (x > 20) return 1;
  if (x < -20) return 0;
  return 1 / (1 + Math.exp(-x));
}

export class AdaptiveDirector {
  private thetaGlobal = 0;
  private thetaDomain: number[] = Array(DOMAIN_COUNT).fill(0);
  private globalAttempts = 0;
  private domainAttempts: number[] = Array(DOMAIN_COUNT).fill(0);

  constructor(private readonly storageKey: string = STORAGE_KEY) {
    this.load();
  }

  public getGlobalTheta(): number {
    return this.thetaGlobal;
  }

  public getDomainTheta(domain: DomainId): number {
    return this.thetaDomain[domain] ?? 0;
  }

  public thetaToElo(theta: number): number {
    return Math.round(clamp(BASE_ELO + theta * ELO_PER_THETA, MIN_ELO, MAX_ELO));
  }

  public getGlobalElo(): number {
    return this.thetaToElo(this.thetaGlobal);
  }

  public getDomainRatings(): number[] {
    return this.thetaDomain.map((t) => this.thetaToElo(t));
  }

  public getWeakestDomain(): DomainId {
    let bestIdx = 0;
    let lowestTheta = this.thetaDomain[0];
    for (let i = 1; i < DOMAIN_COUNT; i++) {
      const t = this.thetaDomain[i];
      if (
        t < lowestTheta - 1e-6 ||
        (Math.abs(t - lowestTheta) <= 1e-6 &&
          this.domainAttempts[i] < this.domainAttempts[bestIdx])
      ) {
        lowestTheta = t;
        bestIdx = i;
      }
    }
    return bestIdx as DomainId;
  }

  /**
   * Returns target IRT difficulty (b) placing the player in the ~65-72%
   * flow-state zone (engagingly challenging without frustration).
   */
  public getTargetDifficulty(domain?: DomainId): number {
    const ability =
      domain !== undefined
        ? 0.65 * this.getDomainTheta(domain) + 0.35 * this.thetaGlobal
        : this.thetaGlobal;
    return clamp(ability - 0.15, -2.0, 2.6);
  }

  /**
   * Updates global and domain theta using a Samejima Graded Response Model
   * driven exclusively by epistemic accuracy (Peel Tier / Calibrator precision /
   * Codex alignment / Gauntlet discernment), NEVER Overclock wagering.
   */
  public update(
    question: QuestionRecord,
    resolution: QuestionResolution,
    submission: AnswerSubmission
  ): void {
    const y = this.computeEpistemicScore(question, resolution, submission);
    const a = clamp(question.irtA || 1.2, 0.8, 2.2);
    const b = clamp(question.irtB, -2.5, 3.0);
    const domain = question.l0Domain;

    const expGlobal = this.expectedGrmScore(this.thetaGlobal, a, b);
    const expDomain = this.expectedGrmScore(this.thetaDomain[domain], a, b);

    const lrGlobal = clamp(0.32 / Math.sqrt(1 + this.globalAttempts * 0.06), 0.1, 0.32);
    const lrDomain = clamp(0.46 / Math.sqrt(1 + this.domainAttempts[domain] * 0.12), 0.16, 0.46);

    const deltaGlobal = clamp(lrGlobal * a * (y - expGlobal), -0.35, 0.35);
    const deltaDomain = clamp(lrDomain * a * (y - expDomain), -0.5, 0.5);

    this.thetaGlobal = clamp(this.thetaGlobal + deltaGlobal, MIN_THETA, MAX_THETA);
    this.thetaDomain[domain] = clamp(
      this.thetaDomain[domain] + deltaDomain,
      MIN_THETA,
      MAX_THETA
    );
    this.globalAttempts += 1;
    this.domainAttempts[domain] += 1;

    this.save();
  }

  public reset(): void {
    this.thetaGlobal = 0;
    this.thetaDomain = Array(DOMAIN_COUNT).fill(0);
    this.globalAttempts = 0;
    this.domainAttempts = Array(DOMAIN_COUNT).fill(0);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Ignore storage restrictions
    }
  }

  private expectedGrmScore(theta: number, a: number, b: number): number {
    // 3 ordered mastery thresholds around question difficulty b:
    // b1 (assisted / partial), b2 (solid / Tier-2), b3 (cold instinct / Tier-1)
    const p1 = logistic(a * (theta - (b - 0.65)));
    const p2 = logistic(a * (theta - b));
    const p3 = logistic(a * (theta - (b + 0.65)));
    return 0.48 * p1 + 0.24 * p2 + 0.28 * p3;
  }

  private computeEpistemicScore(
    question: QuestionRecord,
    resolution: QuestionResolution,
    submission: AnswerSubmission
  ): number {
    if (submission.timedOut) return 0;

    switch (question.archetype) {
      case 'CALIBRATOR_DIAL': {
        if (!resolution.correct) return 0;
        if (resolution.bullseye) return 1.0;
        const ext = question.calibratorExt;
        const tol = clamp(submission.calibratorTolerancePct ?? 0.15, 0.02, 0.35);
        const coneTightness = clamp((0.35 - tol) / (0.35 - 0.04), 0, 1);
        let centerAccuracy = 0.5;
        if (ext && typeof submission.calibratorVal === 'number') {
          const range = Math.max(1e-6, ext.maxVal - ext.minVal);
          const halfWin = Math.max(1e-6, range * tol);
          centerAccuracy = clamp(1 - Math.abs(submission.calibratorVal - ext.exactVal) / halfWin, 0, 1);
        }
        return clamp(0.55 + 0.3 * coneTightness + 0.15 * centerAccuracy, 0.55, 0.98);
      }

      case 'CODEX_DUAL_RING': {
        if (!resolution.correct) return 0;
        if (resolution.partialScoreRatio !== undefined && resolution.partialScoreRatio < 1) {
          return 0.62;
        }
        return 1.0;
      }

      case 'GAUNTLET_SHATTER': {
        if (!resolution.correct) return 0;
        return submission.gauntletAction === 'CHALLENGE' ? 1.0 : 0.85;
      }

      case 'SIGHTLINE_LOCK':
      case 'HERO_ARTIFACT_SYNTHESIS':
      default: {
        if (!resolution.correct) return 0;
        if (submission.peelTier === 1) return 1.0;
        if (submission.peelTier === 2) return 0.72;
        return 0.48;
      }
    }
  }

  private load(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedIrtStateV1>;
      if (parsed.v !== 1) return;

      if (typeof parsed.thetaGlobal === 'number' && Number.isFinite(parsed.thetaGlobal)) {
        this.thetaGlobal = clamp(parsed.thetaGlobal, MIN_THETA, MAX_THETA);
      }
      if (Array.isArray(parsed.thetaDomain) && parsed.thetaDomain.length === DOMAIN_COUNT) {
        this.thetaDomain = parsed.thetaDomain.map((v) =>
          typeof v === 'number' && Number.isFinite(v) ? clamp(v, MIN_THETA, MAX_THETA) : 0
        );
      }
      if (typeof parsed.globalAttempts === 'number' && parsed.globalAttempts >= 0) {
        this.globalAttempts = Math.floor(parsed.globalAttempts);
      }
      if (Array.isArray(parsed.domainAttempts) && parsed.domainAttempts.length === DOMAIN_COUNT) {
        this.domainAttempts = parsed.domainAttempts.map((v) =>
          typeof v === 'number' && v >= 0 ? Math.floor(v) : 0
        );
      }
    } catch {
      // Fallback cleanly to default Elo 1200
    }
  }

  private save(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const payload: PersistedIrtStateV1 = {
        v: 1,
        thetaGlobal: this.thetaGlobal,
        thetaDomain: this.thetaDomain,
        globalAttempts: this.globalAttempts,
        domainAttempts: this.domainAttempts,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      // Ignore quota/storage access restrictions
    }
  }
}
