// ============================================================================
// TriviaEngine — 1M-Ready Selection, Deterministic Daily Seed & Psychometric Scoring
// Implements ITriviaEngine strictly with zero-arg constructor `new TriviaEngine()`
// ============================================================================

import { QUESTION_BANK } from '../data/questions';
import type {
  AnswerSubmission,
  Archetype3D,
  DomainId,
  EvaluateOptions,
  ITriviaEngine,
  MatchQuerySpec,
  NarrativeFlag,
  QuestionRecord,
  QuestionResolution,
} from '../types/game';
import { AdaptiveDirector } from './AdaptiveDirector';
import { BitsetHistory } from './BitsetHistory';

const BASE_POINTS = 1000;
const MAX_SPEED_BONUS = 300;
const DAILY_SALT = 'WS_MERIDIAN_DAILY_V1';

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
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

function formatOrdinal(n: number): string {
  const abs = Math.abs(Math.round(n));
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${abs}th`;
  switch (abs % 10) {
    case 1:
      return `${abs}st`;
    case 2:
      return `${abs}nd`;
    case 3:
      return `${abs}rd`;
    default:
      return `${abs}th`;
  }
}

export function computeCalibratorMultiplier(tolerancePct: number): number {
  const tol = clamp(tolerancePct, 0.02, 0.35);
  if (tol <= 0.04) return 3.5;
  const t = clamp((0.35 - tol) / (0.35 - 0.04), 0, 1);
  return round2(1.0 + t * 2.5);
}

interface DailySlotPlan {
  archetype: Archetype3D;
  targetB: number;
}

const DAILY_SEVEN_BLUEPRINT: DailySlotPlan[] = [
  { archetype: 'SIGHTLINE_LOCK', targetB: -0.4 },
  { archetype: 'SIGHTLINE_LOCK', targetB: 0.3 },
  { archetype: 'GAUNTLET_SHATTER', targetB: 0.1 },
  { archetype: 'CODEX_DUAL_RING', targetB: 0.5 },
  { archetype: 'SIGHTLINE_LOCK', targetB: 1.0 },
  { archetype: 'GAUNTLET_SHATTER', targetB: 0.7 },
  { archetype: 'CALIBRATOR_DIAL', targetB: 0.6 },
];

export class TriviaEngine implements ITriviaEngine {
  private readonly bank: readonly QuestionRecord[];
  private readonly byQid: Map<number, QuestionRecord>;
  private readonly history: BitsetHistory;
  private readonly director: AdaptiveDirector;

  constructor() {
    this.bank = QUESTION_BANK;
    this.byQid = new Map<number, QuestionRecord>();
    for (const q of this.bank) {
      this.byQid.set(q.qid, q);
    }
    this.history = new BitsetHistory();
    this.director = new AdaptiveDirector();
  }

  public selectMatchQuestions(spec: MatchQuerySpec): QuestionRecord[] {
    const count = Math.max(0, Math.floor(spec.count));
    if (count === 0 || this.bank.length === 0) return [];

    // Daily Global Feed: strictly deterministic worldwide 7-question set
    if (spec.mode === 'DAILY' && (!spec.pinnedQids || spec.pinnedQids.length === 0)) {
      return this.selectDailyQuestions(spec, count);
    }

    const rng = spec.seed !== undefined ? createMulberry32(spec.seed) : Math.random;
    const selected: QuestionRecord[] = [];
    const selectedQids = new Set<number>();
    const selectedTopics = new Set<string>();
    const selectedSubcats = new Set<string>();
    const usedDomains = new Set<DomainId>();

    // 1. Honor pinned QIDs first (e.g. Geneva Prologue [1, 2, 3, 4])
    if (spec.pinnedQids && spec.pinnedQids.length > 0) {
      for (const qid of spec.pinnedQids) {
        if (selected.length >= count) break;
        const found = this.byQid.get(qid);
        if (found && !selectedQids.has(found.qid)) {
          selected.push(found);
          selectedQids.add(found.qid);
          selectedTopics.add(found.microTopicId);
          selectedSubcats.add(found.l2Subcategory);
          usedDomains.add(found.l0Domain);
        }
      }
    }

    const remaining = count - selected.length;
    if (remaining <= 0) return selected;

    const singleDomain = spec.domains && spec.domains.length === 1 ? spec.domains[0] : undefined;
    const baseTarget = this.director.getTargetDifficulty(singleDomain);
    const specificRegions = (spec.regions ?? []).filter((r) => r !== 'GLOBAL');
    const allowRepeats = spec.allowRepeatsFallback !== false;

    for (let i = selected.length; i < count; i++) {
      const targetB =
        spec.targetDifficultyCurve && spec.targetDifficultyCurve[i] !== undefined
          ? spec.targetDifficultyCurve[i]
          : clamp(baseTarget + (i / Math.max(1, count - 1) - 0.35) * 0.65, -2.0, 2.6);

      const preferredArchetype = this.getPreferredSlotArchetype(spec, i, count, selected);
      const isCampaignFinale =
        spec.mode === 'CAMPAIGN' && i === count - 1 && (!spec.pinnedQids || spec.pinnedQids.length === 0);

      const candidates = this.getTieredCandidates(
        spec,
        selectedQids,
        selectedTopics,
        selectedSubcats,
        allowRepeats
      );

      if (candidates.length === 0) break;

      const prevArchetype = selected.length > 0 ? selected[selected.length - 1].archetype : undefined;
      let bestQ = candidates[0];
      let bestScore = -Infinity;

      for (const q of candidates) {
        let score = -Math.abs(q.irtB - targetB) * 2.0;

        // Archetype variety preference (only when caller didn't lock a single archetype)
        if (preferredArchetype && (!spec.archetypes || spec.archetypes.length > 1)) {
          if (q.archetype === preferredArchetype) {
            score += 3.2;
          }
        }

        // Avoid repeating non-Sightline morphs back-to-back
        if (
          prevArchetype &&
          prevArchetype !== 'SIGHTLINE_LOCK' &&
          q.archetype === prevArchetype
        ) {
          score -= 1.8;
        }

        // Strongly prefer exact regional questions over generic GLOBAL when region requested
        if (specificRegions.length > 0) {
          const matchesSpecific = specificRegions.some((r) => q.regions.includes(r));
          if (matchesSpecific) score += 4.2;
        }

        // Narrative tag alignment
        if (spec.requiredTags && spec.requiredTags.length > 0) {
          let reqMatches = 0;
          for (const tag of spec.requiredTags) {
            if (q.narrativeTags.includes(tag)) reqMatches++;
          }
          score += reqMatches * 5.0;
        }

        if (spec.boostTags && spec.boostTags.length > 0) {
          let boostMatches = 0;
          for (const tag of spec.boostTags) {
            if (q.narrativeTags.includes(tag)) boostMatches++;
          }
          score += boostMatches * 2.4;
        }

        // Highlight Hero Relic boss questions on Campaign finale slots
        if (isCampaignFinale) {
          if (q.heroRelicId) {
            score += 6.0;
          }
        } else if (spec.mode === 'CAMPAIGN' && q.heroRelicId) {
          score -= 1.5;
        }

        // Intra-match diversity & cooldown protection
        if (selectedTopics.has(q.microTopicId)) score -= 5.0;
        if (selectedSubcats.has(q.l2Subcategory)) score -= 2.0;
        if (!usedDomains.has(q.l0Domain) && (!spec.domains || spec.domains.length > 1)) {
          score += 1.4;
        }

        // Unseen preference when in relaxed repeat tiers
        if (!this.history.hasSeen(q.qid)) {
          score += 2.5;
        }

        score += rng() * 1.8;

        if (score > bestScore) {
          bestScore = score;
          bestQ = q;
        }
      }

      selected.push(bestQ);
      selectedQids.add(bestQ.qid);
      selectedTopics.add(bestQ.microTopicId);
      selectedSubcats.add(bestQ.l2Subcategory);
      usedDomains.add(bestQ.l0Domain);
    }

    return selected;
  }

  public evaluateAnswer(
    question: QuestionRecord,
    submission: AnswerSubmission,
    options?: EvaluateOptions
  ): QuestionResolution {
    const timeTotal =
      options?.timeTotalSec ??
      (question.archetype === 'GAUNTLET_SHATTER'
        ? question.gauntletExt?.windowSec ?? 7
        : 20);
    const elapsedRatio = clamp(submission.elapsedSec / Math.max(1, timeTotal), 0, 1);
    const rawSpeedBonus = Math.round((1 - elapsedRatio) * MAX_SPEED_BONUS);

    const overclocked = Boolean(submission.overclocked);
    const clampedOcBonus = clamp(submission.overclockBonus || 0, 0, 1);
    const ocScale = options?.maverickGambitPerk ? 1.25 : 1.0;
    const overclockMultiplier = overclocked ? round2(1.0 + clampedOcBonus * ocScale) : 1.0;

    let correct = false;
    let partialScoreRatio: number | undefined;
    let bullseye: boolean | undefined;
    let tierMultiplier = 1.0;
    let speedBonus = 0;
    let totalPoints = 0;
    let correctAnswerDisplay = question.answerCorrect;

    switch (question.archetype) {
      case 'CALIBRATOR_DIAL': {
        const ext = question.calibratorExt;
        if (ext) {
          const range = Math.max(1e-6, ext.maxVal - ext.minVal);
          const tol = clamp(submission.calibratorTolerancePct ?? 0.15, 0.02, 0.35);
          const val = submission.calibratorVal ?? ext.minVal + range * 0.5;
          const halfWindow = range * tol;
          tierMultiplier = computeCalibratorMultiplier(tol);

          if (!submission.timedOut && Math.abs(val - ext.exactVal) <= halfWindow + 1e-9) {
            correct = true;
            bullseye = tol <= 0.04;
            speedBonus = rawSpeedBonus;
            totalPoints =
              Math.round(BASE_POINTS * tierMultiplier * overclockMultiplier) + speedBonus;
          } else {
            correct = false;
            bullseye = false;
          }
        }
        break;
      }

      case 'CODEX_DUAL_RING': {
        const ext = question.codexExt;
        if (ext) {
          correctAnswerDisplay = ext.pairs.map((p) => `${p.subject} → ${p.target}`).join(' · ');
          const matchedSubjects = new Set<number>();
          if (!submission.timedOut && Array.isArray(submission.codexMatches)) {
            for (const m of submission.codexMatches) {
              if (
                Number.isInteger(m.subjectIndex) &&
                m.subjectIndex >= 0 &&
                m.subjectIndex < ext.pairs.length &&
                m.subjectIndex === m.targetIndex
              ) {
                matchedSubjects.add(m.subjectIndex);
              }
            }
          }
          const matchedCount = matchedSubjects.size;
          if (matchedCount >= ext.pairs.length) {
            correct = true;
            partialScoreRatio = 1.0;
            tierMultiplier = 3.0;
            speedBonus = rawSpeedBonus;
            totalPoints =
              Math.round(BASE_POINTS * tierMultiplier * overclockMultiplier) + speedBonus;
          } else if (matchedCount === 2) {
            correct = true;
            partialScoreRatio = 0.5;
            tierMultiplier = 1.0;
            speedBonus = rawSpeedBonus;
            totalPoints =
              Math.round(BASE_POINTS * tierMultiplier * overclockMultiplier) + speedBonus;
          } else {
            correct = false;
            partialScoreRatio = round2(matchedCount / Math.max(1, ext.pairs.length));
            tierMultiplier = 0;
          }
        }
        break;
      }

      case 'GAUNTLET_SHATTER': {
        const ext = question.gauntletExt;
        if (ext) {
          correctAnswerDisplay = ext.isTrick
            ? `CHALLENGE! (${ext.isTrue ? 'True' : 'Myth / False'})`
            : ext.isTrue
              ? 'TRUE'
              : 'FALSE';

          if (!submission.timedOut && submission.gauntletAction) {
            if (submission.gauntletAction === 'CHALLENGE') {
              if (ext.isTrick) {
                correct = true;
                tierMultiplier = 2.5;
              }
            } else if (submission.gauntletAction === 'TRUE' && ext.isTrue) {
              correct = true;
              tierMultiplier = 1.5;
            } else if (submission.gauntletAction === 'FALSE' && !ext.isTrue) {
              correct = true;
              tierMultiplier = 1.5;
            }
          }

          if (correct) {
            speedBonus = rawSpeedBonus;
            totalPoints =
              Math.round(BASE_POINTS * tierMultiplier * overclockMultiplier) + speedBonus;
          }
        }
        break;
      }

      case 'SIGHTLINE_LOCK':
      case 'HERO_ARTIFACT_SYNTHESIS':
      default: {
        const baseTierMult =
          submission.peelTier === 1 ? 3.0 : submission.peelTier === 2 ? 2.0 : 1.2;
        const cleanHandsMult =
          options?.cleanHandsPerk && submission.peelTier === 1 ? 1.25 : 1.0;
        tierMultiplier = round2(baseTierMult * cleanHandsMult);

        if (!submission.timedOut) {
          if (typeof submission.selectedText === 'string') {
            correct =
              submission.selectedText.trim().toLowerCase() ===
              question.answerCorrect.trim().toLowerCase();
          } else if (submission.selectedFacetIndex !== undefined) {
            correct = submission.selectedFacetIndex === 0;
          }
        }

        if (correct) {
          speedBonus = rawSpeedBonus;
          totalPoints =
            Math.round(BASE_POINTS * tierMultiplier * overclockMultiplier) + speedBonus;
        }
        break;
      }
    }

    const backfired = !correct && overclocked;

    return {
      qid: question.qid,
      correct,
      partialScoreRatio,
      bullseye,
      backfired,
      basePoints: BASE_POINTS,
      tierMultiplier,
      overclockMultiplier,
      speedBonus: correct ? speedBonus : 0,
      totalPoints: correct ? Math.max(0, totalPoints) : 0,
      correctAnswerDisplay,
      whyExplanation: question.whyExplanation,
      peelTier: submission.peelTier,
      overclocked,
      promptSnapshot: question.prompt,
      domainId: question.l0Domain,
    };
  }

  public recordResult(
    question: QuestionRecord,
    resolution: QuestionResolution,
    submission: AnswerSubmission
  ): void {
    this.history.markSeen(question.qid, question.microTopicId, question.l2Subcategory);
    this.director.update(question, resolution, submission);
  }

  public getDailySeedAndDate(): { dateStr: string; seed: number } {
    const dateStr = new Date().toISOString().slice(0, 10);
    const seed = fnv1a32(`${DAILY_SALT}:${dateStr}`);
    return { dateStr, seed };
  }

  public estimateDailyPercentile(totalScore: number): number {
    if (!Number.isFinite(totalScore) || totalScore <= 0) return 1;
    // Calibrated logistic curve over 7-question Daily Global Feed score distribution
    const raw = 100 / (1 + Math.exp(-(totalScore - 11500) / 3600));
    return Math.round(clamp(raw, 1, 99));
  }

  public generateDailyShareGrid(
    dateStr: string,
    resolutions: QuestionResolution[],
    totalScore: number,
    percentile: number
  ): string {
    const icons = resolutions.map((r) => {
      if (!r.correct) return '✖';
      if (r.bullseye) return '🎯';
      if (r.overclocked && r.peelTier === 1) return '💎';
      if (r.peelTier === 1) return '✦';
      if (r.peelTier === 2) return '◈';
      return '◇';
    });

    const correctCount = resolutions.filter((r) => r.correct).length;
    const clampedPct = Math.round(clamp(percentile, 1, 99));
    const topPct = Math.max(1, 100 - clampedPct);
    const formattedScore = Math.round(totalScore).toLocaleString('en-US');

    return [
      "WORLD'S SMARTEST · GLOBAL FEED",
      `Meridian Dispatch ${dateStr}`,
      icons.join(' '),
      `Score: ${formattedScore} · Top ${topPct}% (${formatOrdinal(clampedPct)} %ile)`,
      `Cleared: ${correctCount}/${resolutions.length} · Spin · Peel · Overclock`,
    ].join('\n');
  }

  public getGlobalElo(): number {
    return this.director.getGlobalElo();
  }

  public getDomainRatings(): number[] {
    return this.director.getDomainRatings();
  }

  public getWeakestDomain(): DomainId {
    return this.director.getWeakestDomain();
  }

  public getTotalQuestionCount(): number {
    return this.bank.length;
  }

  public getSeenCount(): number {
    return this.history.getSeenCount();
  }

  public resetHistory(): void {
    this.history.reset();
    this.director.reset();
  }

  // --------------------------------------------------------------------------
  // Internal Selection Helpers
  // --------------------------------------------------------------------------

  private selectDailyQuestions(spec: MatchQuerySpec, count: number): QuestionRecord[] {
    const seed = spec.seed ?? this.getDailySeedAndDate().seed;
    const rng = createMulberry32(seed);
    const selected: QuestionRecord[] = [];
    const selectedQids = new Set<number>();
    const selectedTopics = new Set<string>();
    const usedDomains = new Set<DomainId>();

    const blueprint: DailySlotPlan[] =
      count === 7
        ? DAILY_SEVEN_BLUEPRINT
        : Array.from({ length: count }, (_, idx) => {
            if (idx === count - 1 && count >= 2) {
              return { archetype: 'CALIBRATOR_DIAL' as Archetype3D, targetB: 0.6 };
            }
            const ref = DAILY_SEVEN_BLUEPRINT[idx % (DAILY_SEVEN_BLUEPRINT.length - 1)];
            return ref;
          });

    for (let i = 0; i < blueprint.length; i++) {
      const slot = blueprint[i];
      const targetB =
        spec.targetDifficultyCurve && spec.targetDifficultyCurve[i] !== undefined
          ? spec.targetDifficultyCurve[i]
          : slot.targetB;

      let pool = this.bank.filter(
        (q) =>
          !selectedQids.has(q.qid) &&
          q.archetype === slot.archetype &&
          (!spec.domains || spec.domains.length === 0 || spec.domains.includes(q.l0Domain)) &&
          (!spec.regions ||
            spec.regions.length === 0 ||
            spec.regions.some((r) => q.regions.includes(r)))
      );

      if (pool.length === 0) {
        pool = this.bank.filter((q) => !selectedQids.has(q.qid) && q.archetype === slot.archetype);
      }
      if (pool.length === 0) {
        pool = this.bank.filter((q) => !selectedQids.has(q.qid));
      }
      if (pool.length === 0) break;

      let bestQ = pool[0];
      let bestScore = -Infinity;

      for (const q of pool) {
        let score = -Math.abs(q.irtB - targetB) * 1.4;
        if (!usedDomains.has(q.l0Domain)) score += 3.0;
        if (selectedTopics.has(q.microTopicId)) score -= 6.0;
        score += rng() * 4.0;

        if (score > bestScore) {
          bestScore = score;
          bestQ = q;
        }
      }

      selected.push(bestQ);
      selectedQids.add(bestQ.qid);
      selectedTopics.add(bestQ.microTopicId);
      usedDomains.add(bestQ.l0Domain);
    }

    return selected;
  }

  private getPreferredSlotArchetype(
    spec: MatchQuerySpec,
    slotIndex: number,
    totalCount: number,
    alreadySelected: QuestionRecord[]
  ): Archetype3D | undefined {
    if (spec.archetypes && spec.archetypes.length === 1) {
      return spec.archetypes[0];
    }

    const allowed = new Set<Archetype3D>(
      spec.archetypes && spec.archetypes.length > 0
        ? spec.archetypes
        : ['SIGHTLINE_LOCK', 'CODEX_DUAL_RING', 'CALIBRATOR_DIAL', 'GAUNTLET_SHATTER']
    );

    if (spec.mode === 'CAMPAIGN' && totalCount >= 5) {
      const cadence: Archetype3D[] = [
        'SIGHTLINE_LOCK',
        'CODEX_DUAL_RING',
        'GAUNTLET_SHATTER',
        'CALIBRATOR_DIAL',
        'SIGHTLINE_LOCK',
      ];
      const desired = cadence[slotIndex % cadence.length];
      return allowed.has(desired) ? desired : undefined;
    }

    // Briefing & Endless: lively 60% Sightline / 40% alternate morph showcase
    if (totalCount >= 4) {
      const counts = new Map<Archetype3D, number>();
      for (const q of alreadySelected) {
        counts.set(q.archetype, (counts.get(q.archetype) ?? 0) + 1);
      }
      if (slotIndex === 0) return allowed.has('SIGHTLINE_LOCK') ? 'SIGHTLINE_LOCK' : undefined;
      if (slotIndex === totalCount - 1 && allowed.has('CALIBRATOR_DIAL') && !counts.get('CALIBRATOR_DIAL')) {
        return 'CALIBRATOR_DIAL';
      }
      if (slotIndex === 2 && allowed.has('GAUNTLET_SHATTER') && !counts.get('GAUNTLET_SHATTER')) {
        return 'GAUNTLET_SHATTER';
      }
      if (slotIndex === 3 && allowed.has('CODEX_DUAL_RING') && !counts.get('CODEX_DUAL_RING')) {
        return 'CODEX_DUAL_RING';
      }
    }

    return allowed.has('SIGHTLINE_LOCK') ? 'SIGHTLINE_LOCK' : undefined;
  }

  private matchesTags(q: QuestionRecord, tags?: NarrativeFlag[]): boolean {
    if (!tags || tags.length === 0) return true;
    return tags.some((t) => q.narrativeTags.includes(t));
  }

  private matchesRegions(q: QuestionRecord, regions?: string[], includeGlobalFallback = false): boolean {
    if (!regions || regions.length === 0) return true;
    if (regions.some((r) => q.regions.includes(r))) return true;
    return includeGlobalFallback && q.regions.includes('GLOBAL');
  }

  private matchesDomains(q: QuestionRecord, domains?: DomainId[]): boolean {
    if (!domains || domains.length === 0) return true;
    return domains.includes(q.l0Domain);
  }

  private matchesArchetypes(q: QuestionRecord, archetypes?: Archetype3D[]): boolean {
    if (!archetypes || archetypes.length === 0) return true;
    return archetypes.includes(q.archetype);
  }

  private getTieredCandidates(
    spec: MatchQuerySpec,
    selectedQids: Set<number>,
    selectedTopics: Set<string>,
    selectedSubcats: Set<string>,
    allowRepeats: boolean
  ): QuestionRecord[] {
    const base = this.bank.filter((q) => !selectedQids.has(q.qid));
    if (base.length === 0) return [];

    const isUnseen = (q: QuestionRecord) => !this.history.hasSeen(q.qid);
    const offCooldown = (q: QuestionRecord) =>
      !this.history.isTopicOnCooldown(q.microTopicId) &&
      !selectedTopics.has(q.microTopicId) &&
      !this.history.isSubcategoryOnCooldown(q.l2Subcategory) &&
      !selectedSubcats.has(q.l2Subcategory);

    // Tier 1: Strictest — unseen, off cooldown, exact domains/regions/archetypes/requiredTags
    let pool = base.filter(
      (q) =>
        isUnseen(q) &&
        offCooldown(q) &&
        this.matchesDomains(q, spec.domains) &&
        this.matchesRegions(q, spec.regions, false) &&
        this.matchesArchetypes(q, spec.archetypes) &&
        this.matchesTags(q, spec.requiredTags)
    );
    if (pool.length > 0) return pool;

    // Tier 2: Unseen, relaxed cooldown, exact domains/regions/archetypes/requiredTags
    pool = base.filter(
      (q) =>
        isUnseen(q) &&
        this.matchesDomains(q, spec.domains) &&
        this.matchesRegions(q, spec.regions, false) &&
        this.matchesArchetypes(q, spec.archetypes) &&
        this.matchesTags(q, spec.requiredTags)
    );
    if (pool.length > 0) return pool;

    // Tier 3: Unseen, allow GLOBAL region fallback while preserving tags/domains/archetypes
    pool = base.filter(
      (q) =>
        isUnseen(q) &&
        this.matchesDomains(q, spec.domains) &&
        this.matchesRegions(q, spec.regions, true) &&
        this.matchesArchetypes(q, spec.archetypes) &&
        this.matchesTags(q, spec.requiredTags)
    );
    if (pool.length > 0) return pool;

    // Tier 4: Unseen, demote requiredTags to score boost
    pool = base.filter(
      (q) =>
        isUnseen(q) &&
        this.matchesDomains(q, spec.domains) &&
        this.matchesRegions(q, spec.regions, true) &&
        this.matchesArchetypes(q, spec.archetypes)
    );
    if (pool.length > 0) return pool;

    // Tier 5: Seen allowed (if fallback permitted) with strict domains/regions/archetypes/tags
    if (allowRepeats) {
      pool = base.filter(
        (q) =>
          this.matchesDomains(q, spec.domains) &&
          this.matchesRegions(q, spec.regions, false) &&
          this.matchesArchetypes(q, spec.archetypes) &&
          this.matchesTags(q, spec.requiredTags)
      );
      if (pool.length > 0) return pool;

      // Tier 6: Seen allowed with GLOBAL fallback
      pool = base.filter(
        (q) =>
          this.matchesDomains(q, spec.domains) &&
          this.matchesRegions(q, spec.regions, true) &&
          this.matchesArchetypes(q, spec.archetypes)
      );
      if (pool.length > 0) return pool;

      // Tier 7: Seen allowed matching domains + archetypes
      pool = base.filter(
        (q) =>
          this.matchesDomains(q, spec.domains) &&
          this.matchesArchetypes(q, spec.archetypes)
      );
      if (pool.length > 0) return pool;
    }

    // Tier 8: Unseen any-filter fallback before ultimate repeat fallback
    pool = base.filter((q) => isUnseen(q));
    if (pool.length > 0) return pool;

    return allowRepeats ? base : [];
  }
}
