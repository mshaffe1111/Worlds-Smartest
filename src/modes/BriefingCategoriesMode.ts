// ============================================================================
// WORLD'S SMARTEST — Mode 3: The Briefing Room (Categories, Difficulty & Length)
// Implements PITCH_BIBLE.md §4 (12 Enamel Medallions + ~949k–1M Verified Counts)
// ============================================================================

import type {
  Archetype3D,
  BriefingDifficultyPreset,
  DomainId,
  ForgeEngine,
  PrismQuestion,
} from '../forge';
import { SOVEREIGN_DOMAINS, type PassportSystem } from '../narrative/PassportSystem';
import {
  ScoringEngine,
  type PrismAnswerSubmission,
  type ScoredQuestionResult,
} from './ScoringEngine';

export type BriefingRunLength = 5 | 10 | 15 | 20 | 50 | number;

export interface BriefingCategoryCard {
  domainId: DomainId;
  key: string;
  name: string;
  shortName: string;
  medallionUrl: string; // 'assets/ui/cat_0.png' .. 'assets/ui/cat_11.png'
  accentHex: string;
  materialLabel: string;
  verifiedCount: number;
  totalPlayableCount: number;
  shardLoaded: boolean;
  elo: number;
  masteryPct: number;
  rankTitle: string;
  personalBestScore: number;
}

export interface BriefingRoomLaunchConfig {
  /** Selected categories: empty or 'GLOBAL_MIX' means all 12 categories! */
  domains: DomainId[] | 'GLOBAL_MIX';
  difficulty: BriefingDifficultyPreset;
  length: BriefingRunLength;
  archetypeFilter?: Archetype3D | 'ALL_MORPHS';
  /** Optional 3-level drill-down L1 Subcategory & L2 Specialist Topic (`#181`, e.g. Sports -> Baseball)! */
  l1SubcategoryId?: string;
  l2TopicId?: string;
  topicDisplayLabel?: string;
}

export interface BriefingRunSummary {
  challengerName: string;
  domainsLabel: string;
  difficulty: BriefingDifficultyPreset;
  totalQuestions: number;
  correctCount: number;
  totalScore: number; // Guaranteed > 0 whenever correctCount >= 1!
  maxStreak: number;
  overclockHits: number;
  averagePeelTier: number;
  eloDeltasByDomain: Partial<Record<DomainId, number>>;
  resolutions: ScoredQuestionResult[];
}

const BRIEFING_STORAGE_KEY = 'ws_briefing_room_v2';

// Verified baseline counts from #116/#121 before async manifest finishes resolving
const BASELINE_VERIFIED_DOMAIN_COUNTS: readonly number[] = [
  65120, // 0 History
  81620, // 1 Science
  154510, // 2 Geography
  101890, // 3 Arts
  98940, // 4 Film & Pop
  81310, // 5 Sports
  58610, // 6 Tech
  59010, // 7 Nature
  70510, // 8 World Affairs
  47120, // 9 Food & Craft
  67610, // 10 Myth & Lit
  63479, // 11 Logic & Math
];

export class BriefingCategoriesMode {
  private readonly forge: ForgeEngine;
  private readonly passport: PassportSystem;
  private readonly scoring = new ScoringEngine();

  private bestScoreByDomain: Record<number, number>;
  private activeConfig: BriefingRoomLaunchConfig | null = null;
  private activeQuestions: PrismQuestion[] = [];
  private currentIndex = 0;
  private preRunDomainElo: number[] = [];
  private lastSubmitOut: {
    resolution: ScoredQuestionResult;
    nextQuestion: PrismQuestion | null;
    summary: BriefingRunSummary | null;
  } | null = null;

  constructor(forge: ForgeEngine, passport: PassportSystem) {
    this.forge = forge;
    this.passport = passport;
    this.bestScoreByDomain = this.loadBestScores();
  }

  private loadBestScores(): Record<number, number> {
    try {
      if (typeof localStorage === 'undefined') return {};
      const raw = localStorage.getItem(BRIEFING_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, number> | null;
      if (!parsed || typeof parsed !== 'object') return {};
      const clean: Record<number, number> = {};
      for (let i = 0; i < 12; i++) {
        clean[i] = Math.max(0, Math.floor(Number(parsed[i]) || 0));
      }
      return clean;
    } catch {
      return {};
    }
  }

  private saveBestScores(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BRIEFING_STORAGE_KEY, JSON.stringify(this.bestScoreByDomain));
      }
    } catch {
      // Ignore quota errors
    }
  }

  /**
   * Returns all 12 Enamel Category Medallion cards + total universe summary for the Briefing Picker!
   */
  public getCategoryCards(): {
    totalVerifiedCount: number;
    totalPlayableCount: number;
    cards: BriefingCategoryCard[];
  } {
    const counts = this.forge.getDomainCounts();
    const manifestReady = counts.verifiedUniqueTotal >= 900000;
    const skillVec = this.forge.getSkillVector();

    const cards: BriefingCategoryCard[] = SOVEREIGN_DOMAINS.map((meta, idx) => {
      const domainCount = counts.byDomain[idx];
      const skill = skillVec[idx];
      const verifiedCount =
        manifestReady && domainCount && domainCount.verifiedCount > 0
          ? domainCount.verifiedCount
          : BASELINE_VERIFIED_DOMAIN_COUNTS[idx];
      const totalPlayableCount =
        manifestReady && domainCount && domainCount.totalPlayableCount > 0
          ? domainCount.totalPlayableCount
          : verifiedCount + 4200;

      return {
        domainId: meta.id,
        key: meta.key,
        name: meta.name,
        shortName: meta.shortName,
        medallionUrl: meta.medallionUrl,
        accentHex: meta.accentHex,
        materialLabel: meta.materialLabel,
        verifiedCount,
        totalPlayableCount,
        shardLoaded: Boolean(domainCount?.shardLoaded),
        elo: skill?.elo ?? 1200,
        masteryPct: skill?.masteryPct ?? 50,
        rankTitle: skill?.rankTitle ?? 'Adept',
        personalBestScore: this.bestScoreByDomain[meta.id] ?? 0,
      };
    });

    const totalVerifiedCount = manifestReady
      ? counts.verifiedUniqueTotal
      : cards.reduce((sum, c) => sum + c.verifiedCount, 0);
    const totalPlayableCount = manifestReady
      ? counts.totalPlayableCount
      : cards.reduce((sum, c) => sum + c.totalPlayableCount, 0);

    return {
      totalVerifiedCount,
      totalPlayableCount,
      cards,
    };
  }

  /**
   * Returns the 3-level drill-down taxonomy tree (`L0 -> L1 -> L2`, e.g. `Sports & Games -> Sports -> Baseball`)
   * once `@forge-shard-engine`'s `getTaxonomyTree()` is initialized (`#181`).
   */
  public getTaxonomyTree(): unknown {
    const forgeWithTaxonomy = this.forge as ForgeEngine & {
      getTaxonomyTree?: () => unknown;
    };
    return typeof forgeWithTaxonomy.getTaxonomyTree === 'function'
      ? forgeWithTaxonomy.getTaxonomyTree()
      : null;
  }

  public searchTaxonomy(query: string): unknown[] {
    const forgeWithSearch = this.forge as ForgeEngine & {
      searchTaxonomy?: (q: string) => unknown[];
    };
    return typeof forgeWithSearch.searchTaxonomy === 'function'
      ? forgeWithSearch.searchTaxonomy(query)
      : [];
  }

  /**
   * Lazily streams the chosen domain / specialist subcategory shard(s) (`<150ms`) and starts a custom Briefing run!
   */
  public async startBriefingRun(config: BriefingRoomLaunchConfig): Promise<{
    questions: PrismQuestion[];
    firstQuestion: PrismQuestion | null;
    nadiaGreeting: string;
  }> {
    this.activeConfig = config;
    const domainList: DomainId[] | undefined =
      config.domains === 'GLOBAL_MIX' || config.domains.length === 0
        ? undefined
        : config.domains;

    const archetypes: Archetype3D[] | undefined =
      !config.archetypeFilter || config.archetypeFilter === 'ALL_MORPHS'
        ? undefined
        : [config.archetypeFilter];

    this.preRunDomainElo = this.forge.getSkillVector().map((s) => s.elo);

    let questions: PrismQuestion[];
    const forgeExtended = this.forge as ForgeEngine & {
      queryBriefingRoomAsync: (params: {
        domains?: DomainId[];
        difficultyPreset: BriefingDifficultyPreset;
        count: number;
        l1SubcategoryId?: string;
        l2TopicId?: string;
      }) => Promise<PrismQuestion[]>;
      queryQuestions: (spec: {
        count: number;
        mode: 'BRIEFING';
        domains?: DomainId[];
        archetypes?: Archetype3D[];
        difficultyPreset?: BriefingDifficultyPreset;
        facetCount?: number;
        l1SubcategoryId?: string;
        l2TopicId?: string;
      }) => PrismQuestion[];
    };

    if (archetypes && archetypes.length > 0) {
      questions = await this.forge.queryQuestionsAsync({
        count: config.length,
        mode: 'BRIEFING',
        domains: domainList,
        archetypes,
        difficultyPreset: config.difficulty,
        facetCount: 4,
        l1SubcategoryId: config.l1SubcategoryId,
        l2TopicId: config.l2TopicId,
      });
    } else {
      questions = await forgeExtended.queryBriefingRoomAsync({
        domains: domainList,
        difficultyPreset: config.difficulty,
        count: config.length,
        l1SubcategoryId: config.l1SubcategoryId,
        l2TopicId: config.l2TopicId,
      });
    }

    this.activeQuestions = questions;
    this.currentIndex = 0;
    this.lastSubmitOut = null;
    this.scoring.reset(0);

    const challengerName = this.passport.getChallengerName();
    const label =
      config.topicDisplayLabel && config.topicDisplayLabel.trim().length > 0
        ? config.topicDisplayLabel.trim()
        : !domainList || domainList.length === 12
          ? 'Global 12-Domain Mix'
          : domainList.map((d) => SOVEREIGN_DOMAINS[d].shortName).join(' · ');

    return {
      questions,
      firstQuestion: questions[0] ?? null,
      nadiaGreeting: `Calibration pod ready, ${challengerName}. ${questions.length} Prisms queued across ${label} (${config.difficulty}).`,
    };
  }

  public getCurrentQuestion(): PrismQuestion | null {
    return this.activeQuestions[this.currentIndex] ?? null;
  }

  public submitCurrentAnswer(submission: PrismAnswerSubmission): {
    resolution: ScoredQuestionResult;
    nextQuestion: PrismQuestion | null;
    summary: BriefingRunSummary | null;
  } {
    const q = this.activeQuestions[this.currentIndex];
    if (!q || !this.activeConfig) {
      if (this.lastSubmitOut) return this.lastSubmitOut;
      throw new Error('No active Briefing Room question.');
    }

    const resolution = this.scoring.submitAnswer(q, submission);

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
      q.irtB
    );

    this.currentIndex += 1;
    const nextQuestion = this.activeQuestions[this.currentIndex] ?? null;
    const summary = nextQuestion === null ? this.finalizeRun() : null;

    this.lastSubmitOut = {
      resolution,
      nextQuestion,
      summary,
    };
    return this.lastSubmitOut;
  }

  private finalizeRun(): BriefingRunSummary {
    const cfg = this.activeConfig!;
    const totalScore = this.scoring.getMatchScore();
    const postSkill = this.forge.getSkillVector();

    const eloDeltasByDomain: Partial<Record<DomainId, number>> = {};
    for (let i = 0; i < 12; i++) {
      const diff = (postSkill[i]?.elo ?? 1200) - (this.preRunDomainElo[i] ?? 1200);
      if (diff !== 0) {
        eloDeltasByDomain[i as DomainId] = diff;
      }
    }

    if (cfg.domains !== 'GLOBAL_MIX' && cfg.domains.length === 1) {
      const dom = cfg.domains[0];
      if (totalScore > (this.bestScoreByDomain[dom] ?? 0)) {
        this.bestScoreByDomain[dom] = totalScore;
        this.saveBestScores();
      }
    }

    const domainsLabel =
      cfg.topicDisplayLabel && cfg.topicDisplayLabel.trim().length > 0
        ? cfg.topicDisplayLabel.trim()
        : cfg.domains === 'GLOBAL_MIX' || cfg.domains.length === 0
          ? 'Global 12-Domain Mix'
          : cfg.domains.map((d) => SOVEREIGN_DOMAINS[d].shortName).join(' · ');

    return {
      challengerName: this.passport.getChallengerName(),
      domainsLabel,
      difficulty: cfg.difficulty,
      totalQuestions: this.activeQuestions.length,
      correctCount: this.scoring.getCorrectCount(),
      totalScore,
      maxStreak: this.scoring.getMaxStreak(),
      overclockHits: this.scoring.getOverclockHits(),
      averagePeelTier: this.scoring.getAveragePeelTier(),
      eloDeltasByDomain,
      resolutions: [...this.scoring.getHistory()],
    };
  }
}
