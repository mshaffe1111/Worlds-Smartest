// ============================================================================
// WORLD'S SMARTEST — Signature Standout Mechanic #2:
//   • TACTICAL MIND GAMBITS (6 Persisted Pre-Round Powers, 3 Starters Unlocked)
//   • FINALE CATEGORY PICKER (3 Distinct Topic Cards Before Final Question)
//   • SCOUT'S ADVANTAGE RETRY MERCY (`computeRetryMercyBoost`)
// Zero OS color emojis (monochrome symbols ◆ / ✦ / ↻ / ◈ / ★ / ◎ only).
// ============================================================================

import type { ForgeEngine } from '../forge/ForgeEngine';
import {
  FORGE_DOMAINS,
  getForgeDomainInfo,
  type BriefingDifficultyPreset,
  type DomainId,
  type PrismQuestion,
} from '../forge/types';

export type MindGambitId =
  | 'SECOND_WIND'
  | 'TOPIC_REROLL'
  | 'STREAK_SURGE'
  | 'CLUE_SNIPER'
  | 'FINALE_JACKPOT'
  | 'BLUFF_RADAR';

export const MIND_GAMBITS_STORAGE_KEY = 'ws_mind_gambits_v3';

export const STARTER_MIND_GAMBIT_IDS: readonly MindGambitId[] = [
  'SECOND_WIND',
  'TOPIC_REROLL',
  'STREAK_SURGE',
];

export interface MindGambitSpec {
  readonly id: MindGambitId;
  readonly name: string;
  readonly shortBadge: string;
  readonly glyph: string;
  readonly description: string;
  readonly starterUnlocked: boolean;
  readonly unlockConditionLabel: string;
}

export const MIND_GAMBIT_CATALOG: ReadonlyArray<MindGambitSpec> = [
  {
    id: 'SECOND_WIND',
    name: 'Second Wind',
    shortBadge: '◆ Second Wind',
    glyph: '◆',
    description:
      'Free Mulligan: Your first wrong answer this round lets you pick again without losing your streak!',
    starterUnlocked: true,
    unlockConditionLabel: 'Starter Gambit',
  },
  {
    id: 'TOPIC_REROLL',
    name: 'Specialist Swap',
    shortBadge: '↻ Swap Topic',
    glyph: '↻',
    description:
      'Once this round, tap ↻ Swap Topic to replace any question with your strongest domain!',
    starterUnlocked: true,
    unlockConditionLabel: 'Starter Gambit',
  },
  {
    id: 'STREAK_SURGE',
    name: 'Hot-Streak Surge',
    shortBadge: '✦ Streak Surge',
    glyph: '✦',
    description:
      'Every 2 right answers in a row adds +1.0x Combo Bonus and recharges a free 50/50!',
    starterUnlocked: true,
    unlockConditionLabel: 'Starter Gambit',
  },
  {
    id: 'CLUE_SNIPER',
    name: 'First-Clue Bounty',
    shortBadge: '◈ First-Clue +250',
    glyph: '◈',
    description:
      'Solving on Step 1 of a Clue Ladder or within 5s awards +250 Bonus Points!',
    starterUnlocked: false,
    unlockConditionLabel: 'Reach a 3-Answer Streak or 1 Clue-1 Snipe',
  },
  {
    id: 'FINALE_JACKPOT',
    name: 'Vault Jackpot',
    shortBadge: '★ 2.5x Jackpot',
    glyph: '★',
    description:
      'The Final Question pays 2.5x Jackpot Points with zero Double-Down penalty!',
    starterUnlocked: false,
    unlockConditionLabel: 'Win 2 Matches',
  },
  {
    id: 'BLUFF_RADAR',
    name: 'Rival Tell Scanner',
    shortBadge: '◎ Tell Scanner',
    glyph: '◎',
    description:
      "Reveals live whether your Rival's wager is Genuine or a Bluff (+500 Steal)!",
    starterUnlocked: false,
    unlockConditionLabel: 'Win 4 Matches or Catch 1 Rival Bluff',
  },
];

const GAMBIT_BY_ID: Readonly<Record<MindGambitId, MindGambitSpec>> = {
  SECOND_WIND: MIND_GAMBIT_CATALOG[0],
  TOPIC_REROLL: MIND_GAMBIT_CATALOG[1],
  STREAK_SURGE: MIND_GAMBIT_CATALOG[2],
  CLUE_SNIPER: MIND_GAMBIT_CATALOG[3],
  FINALE_JACKPOT: MIND_GAMBIT_CATALOG[4],
  BLUFF_RADAR: MIND_GAMBIT_CATALOG[5],
};

export function getMindGambitSpec(id: MindGambitId): MindGambitSpec {
  return GAMBIT_BY_ID[id] ?? MIND_GAMBIT_CATALOG[0];
}

export interface MindGambitPersistedState {
  unlockedIds: MindGambitId[];
  equippedId: MindGambitId;
  totalWins: number;
  bestStreak: number;
  bluffsCaught: number;
  firstClueSnipes: number;
  gambitsUsedCount: number;
}

export interface MindGambitCardView extends MindGambitSpec {
  readonly unlocked: boolean;
  readonly equipped: boolean;
}

function isValidGambitId(val: unknown): val is MindGambitId {
  return typeof val === 'string' && Object.prototype.hasOwnProperty.call(GAMBIT_BY_ID, val);
}

function createDefaultPersistedState(): MindGambitPersistedState {
  return {
    unlockedIds: [...STARTER_MIND_GAMBIT_IDS],
    equippedId: 'SECOND_WIND',
    totalWins: 0,
    bestStreak: 0,
    bluffsCaught: 0,
    firstClueSnipes: 0,
    gambitsUsedCount: 0,
  };
}

/**
 * Persistent Mind Gambits progression store backed by `localStorage` (`ws_mind_gambits_v3`).
 * All 3 starter gambits (`SECOND_WIND`, `TOPIC_REROLL`, `STREAK_SURGE`) are unlocked from Minute 1.
 */
export class MindGambitStore {
  private state: MindGambitPersistedState;

  constructor() {
    this.state = this.load();
  }

  private load(): MindGambitPersistedState {
    const def = createDefaultPersistedState();
    try {
      if (typeof localStorage === 'undefined') return def;
      const raw = localStorage.getItem(MIND_GAMBITS_STORAGE_KEY);
      if (!raw) return def;
      const parsed = JSON.parse(raw) as Partial<MindGambitPersistedState> | null;
      if (!parsed || typeof parsed !== 'object') return def;

      const unlockedSet = new Set<MindGambitId>(STARTER_MIND_GAMBIT_IDS);
      if (Array.isArray(parsed.unlockedIds)) {
        for (const item of parsed.unlockedIds) {
          if (isValidGambitId(item)) unlockedSet.add(item);
        }
      }
      const unlockedIds = Array.from(unlockedSet);
      const equippedId: MindGambitId =
        isValidGambitId(parsed.equippedId) && unlockedSet.has(parsed.equippedId)
          ? parsed.equippedId
          : 'SECOND_WIND';

      return {
        unlockedIds,
        equippedId,
        totalWins: Math.max(0, Math.floor(Number(parsed.totalWins) || 0)),
        bestStreak: Math.max(0, Math.floor(Number(parsed.bestStreak) || 0)),
        bluffsCaught: Math.max(0, Math.floor(Number(parsed.bluffsCaught) || 0)),
        firstClueSnipes: Math.max(0, Math.floor(Number(parsed.firstClueSnipes) || 0)),
        gambitsUsedCount: Math.max(0, Math.floor(Number(parsed.gambitsUsedCount) || 0)),
      };
    } catch {
      return def;
    }
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(MIND_GAMBITS_STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignore storage quota errors in restricted sandboxes
    }
  }

  public getState(): MindGambitPersistedState {
    return {
      ...this.state,
      unlockedIds: [...this.state.unlockedIds],
    };
  }

  public getEquippedGambitId(): MindGambitId {
    return this.state.equippedId;
  }

  public getEquippedGambit(): MindGambitSpec {
    return getMindGambitSpec(this.state.equippedId);
  }

  public isUnlocked(id: MindGambitId): boolean {
    return this.state.unlockedIds.includes(id);
  }

  public setEquippedGambit(id: MindGambitId): boolean {
    if (!this.isUnlocked(id)) {
      return false;
    }
    this.state.equippedId = id;
    this.save();
    return true;
  }

  public unlockGambit(id: MindGambitId): boolean {
    if (this.state.unlockedIds.includes(id)) {
      return false;
    }
    this.state.unlockedIds.push(id);
    this.save();
    return true;
  }

  public getUnlockedGambits(): MindGambitSpec[] {
    return MIND_GAMBIT_CATALOG.filter((g) => this.state.unlockedIds.includes(g.id));
  }

  public getAllGambitsWithStatus(): MindGambitCardView[] {
    return MIND_GAMBIT_CATALOG.map((g) => ({
      ...g,
      unlocked: this.state.unlockedIds.includes(g.id),
      equipped: this.state.equippedId === g.id,
    }));
  }

  /**
   * Returns crisp Gambit cards for the Pre-Round Readiness Picker (default 3 unlocked cards,
   * always including the currently equipped Gambit first so 1 click on `▶ START QUESTIONS` works!).
   */
  public getPickerOptions(maxCards = 3): MindGambitCardView[] {
    const cap = Math.max(1, Math.min(MIND_GAMBIT_CATALOG.length, Math.trunc(maxCards)));
    const all = this.getAllGambitsWithStatus();
    const unlocked = all.filter((g) => g.unlocked);
    const equipped = unlocked.find((g) => g.equipped) ?? unlocked[0];
    const ordered: MindGambitCardView[] = [];
    if (equipped) ordered.push(equipped);
    for (const g of unlocked) {
      if (ordered.length >= cap) break;
      if (!ordered.some((o) => o.id === g.id)) {
        ordered.push(g);
      }
    }
    for (const g of all) {
      if (ordered.length >= cap) break;
      if (!ordered.some((o) => o.id === g.id)) {
        ordered.push(g);
      }
    }
    return ordered;
  }

  /**
   * Records match outcomes & automatically unlocks non-starter Gambits when milestones are met.
   * Returns any newly unlocked `MindGambitId[]` for celebratory UI feedback.
   */
  public recordMatchProgress(stats: {
    won?: boolean;
    maxStreak?: number;
    bluffsCaught?: number;
    firstClueSnipes?: number;
    gambitTriggered?: boolean;
  }): MindGambitId[] {
    if (stats.won) {
      this.state.totalWins += 1;
    }
    if (typeof stats.maxStreak === 'number' && stats.maxStreak > this.state.bestStreak) {
      this.state.bestStreak = Math.trunc(stats.maxStreak);
    }
    if (typeof stats.bluffsCaught === 'number' && stats.bluffsCaught > 0) {
      this.state.bluffsCaught += Math.trunc(stats.bluffsCaught);
    }
    if (typeof stats.firstClueSnipes === 'number' && stats.firstClueSnipes > 0) {
      this.state.firstClueSnipes += Math.trunc(stats.firstClueSnipes);
    }
    if (stats.gambitTriggered) {
      this.state.gambitsUsedCount += 1;
    }

    const newlyUnlocked: MindGambitId[] = [];
    if (
      (this.state.bestStreak >= 3 || this.state.firstClueSnipes >= 1) &&
      !this.state.unlockedIds.includes('CLUE_SNIPER')
    ) {
      this.state.unlockedIds.push('CLUE_SNIPER');
      newlyUnlocked.push('CLUE_SNIPER');
    }
    if (this.state.totalWins >= 2 && !this.state.unlockedIds.includes('FINALE_JACKPOT')) {
      this.state.unlockedIds.push('FINALE_JACKPOT');
      newlyUnlocked.push('FINALE_JACKPOT');
    }
    if (
      (this.state.totalWins >= 4 || this.state.bluffsCaught >= 1) &&
      !this.state.unlockedIds.includes('BLUFF_RADAR')
    ) {
      this.state.unlockedIds.push('BLUFF_RADAR');
      newlyUnlocked.push('BLUFF_RADAR');
    }

    this.save();
    return newlyUnlocked;
  }

  public reset(): void {
    this.state = createDefaultPersistedState();
    this.save();
  }
}

export const mindGambitStore = new MindGambitStore();

// ============================================================================
// PER-MATCH RUNTIME MIND GAMBIT SESSION
// ============================================================================

export interface MatchGambitHudPill {
  readonly gambitId: MindGambitId;
  readonly name: string;
  readonly glyph: string;
  readonly shortBadge: string;
  readonly ready: boolean;
  readonly detailText: string;
  readonly canSwapTopic: boolean;
  readonly secondWindReady: boolean;
  readonly freeFiftyFiftyCharges: number;
  readonly comboBonusLabel: string | null;
  readonly bluffRadarActive: boolean;
}

export interface GambitQuestionBonusResult {
  readonly clueBountyPoints: number;
  readonly streakComboMultiplierBonus: number;
  readonly finaleJackpotMultiplier: number;
  readonly zeroDoubleDownPenalty: boolean;
  readonly rechargedFreeFiftyFifty: boolean;
  readonly statusCallout: string | null;
}

export class MatchGambitSession {
  public readonly equippedId: MindGambitId;
  public readonly spec: MindGambitSpec;

  private secondWindCharges: number;
  private topicSwapsRemaining: number;
  private freeFiftyFiftyCharges = 0;
  private streakSurgeSteps = 0;
  private anyEffectTriggered = false;

  constructor(
    equippedId: MindGambitId,
    opts?: {
      /** Granted by Scout's Advantage Retry Mercy so even non-Second-Wind builds get a free mulligan! */
      grantFreeSecondWind?: boolean;
    },
  ) {
    this.equippedId = equippedId;
    this.spec = getMindGambitSpec(equippedId);
    const baseSecondWind = equippedId === 'SECOND_WIND' ? 1 : 0;
    const bonusSecondWind = opts?.grantFreeSecondWind ? 1 : 0;
    this.secondWindCharges = baseSecondWind + bonusSecondWind;
    this.topicSwapsRemaining = equippedId === 'TOPIC_REROLL' ? 1 : 0;
  }

  public hasTriggeredAnyEffect(): boolean {
    return this.anyEffectTriggered;
  }

  public getSecondWindCharges(): number {
    return this.secondWindCharges;
  }

  public getTopicSwapsRemaining(): number {
    return this.topicSwapsRemaining;
  }

  public getFreeFiftyFiftyCharges(): number {
    return this.freeFiftyFiftyCharges;
  }

  public getBluffRadarStealBonus(): number {
    return this.equippedId === 'BLUFF_RADAR' ? 500 : 0;
  }

  public isBluffRadarActive(): boolean {
    return this.equippedId === 'BLUFF_RADAR';
  }

  public canTriggerSecondWind(archetype: string, timedOut = false): boolean {
    if (timedOut || this.secondWindCharges <= 0) return false;
    return archetype === 'SIGHTLINE_LOCK' || archetype === 'HERO_ARTIFACT_SYNTHESIS';
  }

  public consumeSecondWind(): {
    triggered: boolean;
    chargesRemaining: number;
    bannerText: string;
  } {
    if (this.secondWindCharges <= 0) {
      return {
        triggered: false,
        chargesRemaining: 0,
        bannerText: '',
      };
    }
    this.secondWindCharges -= 1;
    this.anyEffectTriggered = true;
    return {
      triggered: true,
      chargesRemaining: this.secondWindCharges,
      bannerText: '✦ SECOND WIND MULLIGAN! Wrong choice eliminated — pick again!',
    };
  }

  public canUseTopicSwap(): boolean {
    return this.topicSwapsRemaining > 0;
  }

  public consumeTopicSwap(): boolean {
    if (this.topicSwapsRemaining <= 0) return false;
    this.topicSwapsRemaining -= 1;
    this.anyEffectTriggered = true;
    return true;
  }

  public consumeFreeFiftyFifty(): boolean {
    if (this.freeFiftyFiftyCharges <= 0) return false;
    this.freeFiftyFiftyCharges -= 1;
    this.anyEffectTriggered = true;
    return true;
  }

  /**
   * Computes live ScoringEngine modifiers and Hot-Streak Surge recharge for an answered question.
   */
  public evaluateQuestionBonuses(params: {
    correct: boolean;
    currentStreakBefore: number;
    isClueLadderStep1?: boolean;
    elapsedSec?: number;
    isFinalQuestion?: boolean;
  }): GambitQuestionBonusResult {
    let clueBountyPoints = 0;
    let streakComboMultiplierBonus = 0;
    let finaleJackpotMultiplier = 1.0;
    let zeroDoubleDownPenalty = false;
    let rechargedFreeFiftyFifty = false;
    let statusCallout: string | null = null;

    if (this.equippedId === 'FINALE_JACKPOT' && params.isFinalQuestion) {
      zeroDoubleDownPenalty = true;
      if (params.correct) {
        finaleJackpotMultiplier = 2.5;
        this.anyEffectTriggered = true;
        statusCallout = '★ VAULT JACKPOT! 2.5x Final Question Payout!';
      }
    }

    if (params.correct) {
      const nextStreak = Math.max(0, Math.trunc(params.currentStreakBefore)) + 1;

      if (this.equippedId === 'STREAK_SURGE') {
        const steps = Math.min(3, Math.floor(nextStreak / 2));
        this.streakSurgeSteps = steps;
        if (steps > 0) {
          streakComboMultiplierBonus = steps * 1.0;
          this.anyEffectTriggered = true;
        }
        if (nextStreak > 0 && nextStreak % 2 === 0) {
          this.freeFiftyFiftyCharges = Math.min(3, this.freeFiftyFiftyCharges + 1);
          rechargedFreeFiftyFifty = true;
          this.anyEffectTriggered = true;
          statusCallout = `✦ HOT-STREAK SURGE! +${streakComboMultiplierBonus.toFixed(1)}x Combo & Free 50/50 Recharged!`;
        }
      }

      if (this.equippedId === 'CLUE_SNIPER') {
        const fastSolve = typeof params.elapsedSec === 'number' && params.elapsedSec <= 5.0;
        if (params.isClueLadderStep1 || fastSolve) {
          clueBountyPoints = 250;
          this.anyEffectTriggered = true;
          statusCallout = params.isClueLadderStep1
            ? '◈ FIRST-CLUE BOUNTY! +250 Bonus Points!'
            : '◈ SPEED SNIPE BOUNTY (<5s)! +250 Bonus Points!';
        }
      }
    } else if (this.equippedId === 'STREAK_SURGE') {
      this.streakSurgeSteps = 0;
    }

    return {
      clueBountyPoints,
      streakComboMultiplierBonus,
      finaleJackpotMultiplier,
      zeroDoubleDownPenalty,
      rechargedFreeFiftyFifty,
      statusCallout,
    };
  }

  public getHudPillState(isFinalQuestion = false): MatchGambitHudPill {
    let ready = false;
    let detailText = this.spec.shortBadge;
    let comboBonusLabel: string | null = null;

    switch (this.equippedId) {
      case 'SECOND_WIND':
        ready = this.secondWindCharges > 0;
        detailText = ready
          ? `◆ Second Wind Ready (${this.secondWindCharges})`
          : '◆ Second Wind Used';
        break;
      case 'TOPIC_REROLL':
        ready = this.topicSwapsRemaining > 0;
        detailText = ready ? '↻ Swap Topic Ready' : '↻ Swap Used';
        break;
      case 'STREAK_SURGE':
        ready = true;
        comboBonusLabel =
          this.streakSurgeSteps > 0 ? `+${this.streakSurgeSteps}.0x COMBO` : null;
        detailText =
          this.freeFiftyFiftyCharges > 0
            ? `✦ Surge · ${this.freeFiftyFiftyCharges} Free 50/50`
            : this.streakSurgeSteps > 0
              ? `✦ Surge Active (+${this.streakSurgeSteps}.0x)`
              : '✦ Streak Surge (2-in-a-row)';
        break;
      case 'CLUE_SNIPER':
        ready = true;
        detailText = '◈ Clue-1 / <5s: +250 PTS';
        break;
      case 'FINALE_JACKPOT':
        ready = isFinalQuestion;
        detailText = isFinalQuestion
          ? '★ 2.5x JACKPOT ACTIVE!'
          : '★ 2.5x Final Question Ready';
        break;
      case 'BLUFF_RADAR':
        ready = true;
        detailText = '◎ Rival Tell Scanner Live';
        break;
    }

    return {
      gambitId: this.equippedId,
      name: this.spec.name,
      glyph: this.spec.glyph,
      shortBadge: this.spec.shortBadge,
      ready,
      detailText,
      canSwapTopic: this.topicSwapsRemaining > 0,
      secondWindReady: this.secondWindCharges > 0,
      freeFiftyFiftyCharges: this.freeFiftyFiftyCharges,
      comboBonusLabel,
      bluffRadarActive: this.equippedId === 'BLUFF_RADAR',
    };
  }
}

export function createMatchGambitSession(
  equippedId?: MindGambitId,
  opts?: { grantFreeSecondWind?: boolean },
): MatchGambitSession {
  const id = equippedId ?? mindGambitStore.getEquippedGambitId();
  return new MatchGambitSession(id, opts);
}

// ============================================================================
// SPECIALIST SWAP (`TOPIC_REROLL`) LIVE QUESTION REPLACER
// ============================================================================

/**
 * Picks the player's strongest domain from `forge.getSkillVector()` (avoiding `avoidDomainId`
 * when possible so swapping ALWAYS gives a fresh topic!).
 */
export function resolveStrongestDomain(
  forge: ForgeEngine,
  avoidDomainId?: DomainId | null,
): DomainId {
  const skills = forge.getSkillVector();
  const sorted = [...skills].sort((a, b) => {
    const aExperienced = a.attempts > 0 ? 1 : 0;
    const bExperienced = b.attempts > 0 ? 1 : 0;
    if (aExperienced !== bExperienced) return bExperienced - aExperienced;
    if (b.elo !== a.elo) return b.elo - a.elo;
    return b.masteryPct - a.masteryPct;
  });
  const preferred = sorted.find((s) => s.domainId !== avoidDomainId) ?? sorted[0];
  return (preferred?.domainId ?? 0) as DomainId;
}

/**
 * Replaces a live question with a fresh `SIGHTLINE_LOCK` question from the player's strongest
 * domain when `TOPIC_REROLL` (`↻ Swap Topic`) is tapped!
 */
export function swapQuestionToStrongestDomain(
  forge: ForgeEngine,
  currentQuestion: PrismQuestion,
  opts?: {
    excludeQids?: ReadonlyArray<number>;
    difficultyPreset?: BriefingDifficultyPreset;
    mercyTierShift?: number;
  },
): PrismQuestion {
  const strongestDomain = resolveStrongestDomain(forge, currentQuestion.l0Domain);
  const excludeQids = Array.from(
    new Set<number>([currentQuestion.qid, ...(opts?.excludeQids ?? [])]),
  );
  const batch = forge.queryQuestions({
    count: 1,
    mode: 'BRIEFING',
    domains: [strongestDomain],
    archetypes: ['SIGHTLINE_LOCK'],
    difficultyPreset: opts?.difficultyPreset ?? currentQuestion.difficultyTier ?? 'MIDDLE_SCHOOL',
    mercyTierShift: opts?.mercyTierShift,
    excludeQids,
    facetCount: 4,
  });
  const replacement = batch[0] ?? currentQuestion;
  replacement.timerSec = Math.max(currentQuestion.timerSec, replacement.timerSec);
  return replacement;
}

// ============================================================================
// FINALE CATEGORY PICKER (*Final Jeopardy!* 3-Topic Choice)
// ============================================================================

const DOMAIN_FINALE_SUBTITLES: Readonly<Record<DomainId, string>> = {
  0: 'Empires, Turning Points & Legends',
  1: 'Cosmos, Physics & Breakthroughs',
  2: 'Capitals, Landmarks & World Wonders',
  3: 'Masterpieces, Styles & Architecture',
  4: 'Cinema, Music & Cultural Icons',
  5: 'Champions, Ballparks & Great Games',
  6: 'Inventions, Code & Digital Pioneers',
  7: 'Wildlife, Oceans & Living Earth',
  8: 'Treaties, Constitutions & Global Stage',
  9: 'Culinary Craft, Flavors & Design',
  10: 'Myths, Epics & Classic Literature',
  11: 'Patterns, Puzzles & Pure Logic',
};

export interface FinaleCategoryOption {
  readonly domainId: DomainId;
  readonly key: string;
  readonly title: string;
  readonly subtitle: string;
  readonly medallionUrl: string;
  readonly accentHex: string;
  readonly masteryPct: number;
  readonly isRecommended: boolean;
}

/**
 * Generates `count` (default `3`) distinct Topic Cards before the Final Question of a round
 * (*Final Jeopardy!* moment), blending the player's preferred/strongest domain with two
 * contrasting fresh domains!
 */
export function buildFinaleCategoryOptions(
  forge: ForgeEngine,
  preferredDomainId?: DomainId | null,
  count = 3,
): FinaleCategoryOption[] {
  const safeCount = Math.max(1, Math.min(FORGE_DOMAINS.length, Math.trunc(count)));
  const skills = forge.getSkillVector();
  const skillByDom = new Map<DomainId, number>();
  for (const s of skills) {
    skillByDom.set(s.domainId, s.masteryPct);
  }

  const chosenIds: DomainId[] = [];
  const addUnique = (id: DomainId): void => {
    if (!chosenIds.includes(id)) {
      chosenIds.push(id);
    }
  };

  // Slot 1: Explicit preferredDomainId OR player's strongest domain
  if (
    typeof preferredDomainId === 'number' &&
    preferredDomainId >= 0 &&
    preferredDomainId <= 11
  ) {
    addUnique(Math.trunc(preferredDomainId) as DomainId);
  } else {
    addUnique(resolveStrongestDomain(forge));
  }

  // Remaining slots: mix high-appeal distinct domains cleanly across remaining 11
  const remaining = FORGE_DOMAINS.map((d) => d.id).filter((id) => !chosenIds.includes(id));
  // Fisher-Yates shuffle using crypto RNG when available, else Math.random
  const nextRand = (): number => {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] / 4294967296;
    }
    return Math.random();
  };
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const tmp = remaining[i];
    remaining[i] = remaining[j];
    remaining[j] = tmp;
  }

  for (const id of remaining) {
    if (chosenIds.length >= safeCount) break;
    addUnique(id);
  }

  return chosenIds.slice(0, safeCount).map((domainId, idx) => {
    const meta = getForgeDomainInfo(domainId);
    const masteryPct = Math.round(skillByDom.get(domainId) ?? 50);
    const baseSub = DOMAIN_FINALE_SUBTITLES[domainId] ?? meta.materialLabel;
    const isRecommended = idx === 0;
    return {
      domainId,
      key: meta.key,
      title: meta.name,
      subtitle: isRecommended ? `${baseSub} · Recommended` : baseSub,
      medallionUrl: meta.medallionUrl,
      accentHex: meta.accentHex,
      masteryPct,
      isRecommended,
    };
  });
}

/**
 * Picks a crisp Final Question (`SIGHTLINE_LOCK`) for the player's selected Finale Category card,
 * strictly enforcing `difficultyPreset` & optional `mercyTierShift`!
 */
export function pickFinaleQuestionForCategory(
  forge: ForgeEngine,
  domainId: DomainId,
  difficultyPreset?: BriefingDifficultyPreset,
  opts?: {
    excludeQids?: ReadonlyArray<number>;
    timerSec?: number;
    hub?: string;
    mercyTierShift?: number;
    bonusTimerSec?: number;
  },
): PrismQuestion {
  const cleanDomain = Math.max(0, Math.min(11, Math.trunc(domainId))) as DomainId;
  const batch = forge.queryQuestions({
    count: 1,
    mode: opts?.hub ? 'CAMPAIGN' : 'BRIEFING',
    hub: opts?.hub,
    domains: [cleanDomain],
    archetypes: ['SIGHTLINE_LOCK'],
    difficultyPreset: difficultyPreset ?? 'ADAPTIVE',
    mercyTierShift: opts?.mercyTierShift,
    bonusTimerSec: opts?.bonusTimerSec,
    excludeQids: opts?.excludeQids ? [...opts.excludeQids] : undefined,
    facetCount: 4,
  });

  const picked = batch[0] ?? forge.getInstantTrialPrism(opts?.excludeQids, 'SIGHTLINE_LOCK');
  if (typeof opts?.timerSec === 'number' && opts.timerSec > 0) {
    picked.timerSec = Math.round(opts.timerSec);
  }
  return picked;
}

/**
 * Async variant of `pickFinaleQuestionForCategory` that ensures the chosen domain's lazy shard
 * is loaded when available before drawing the Final Question.
 */
export async function pickFinaleQuestionForCategoryAsync(
  forge: ForgeEngine,
  domainId: DomainId,
  difficultyPreset?: BriefingDifficultyPreset,
  opts?: {
    excludeQids?: ReadonlyArray<number>;
    timerSec?: number;
    hub?: string;
    mercyTierShift?: number;
    bonusTimerSec?: number;
  },
): Promise<PrismQuestion> {
  const cleanDomain = Math.max(0, Math.min(11, Math.trunc(domainId))) as DomainId;
  if (!forge.isReady()) {
    await forge.init('./data');
  }
  await forge.ensureDomainShardLoaded(cleanDomain);
  return pickFinaleQuestionForCategory(forge, cleanDomain, difficultyPreset, opts);
}

// ============================================================================
// SCOUT'S ADVANTAGE — RETRY MERCY SYSTEM (`computeRetryMercyBoost`)
// ============================================================================

export interface RetryMercyBoost {
  readonly active: boolean;
  readonly failedAttempts: number;
  /** Academic tier reduction applied to `ForgeEngine` (`0`, `-1`, or `-2`) */
  readonly mercyTierShift: 0 | -1 | -2;
  /** Extra countdown seconds per question (`+6s` on attempt 2, `+10s` on attempt 3+) */
  readonly bonusTimerSec: number;
  /** Extra starting shields on Boss Showdowns (`+1` on attempt 2, `+2` on attempt 3+) */
  readonly bonusStartingShields: number;
  /** Always `true` when `failedAttempts >= 1`: grants a free Second Wind wrong-answer mulligan! */
  readonly grantFreeSecondWind: boolean;
  readonly badgeTitle: string;
  readonly badgeDetail: string;
}

/**
 * Computes "Scout's Advantage" Retry Mercy boosts whenever a player retries a failed mission,
 * ensuring NO player ever hits a frustrating brick wall while keeping first-try wins pure!
 */
export function computeRetryMercyBoost(failedAttempts: number): RetryMercyBoost {
  const fails = Number.isFinite(failedAttempts) ? Math.max(0, Math.trunc(failedAttempts)) : 0;
  if (fails <= 0) {
    return {
      active: false,
      failedAttempts: 0,
      mercyTierShift: 0,
      bonusTimerSec: 0,
      bonusStartingShields: 0,
      grantFreeSecondWind: false,
      badgeTitle: '',
      badgeDetail: '',
    };
  }
  if (fails === 1) {
    return {
      active: true,
      failedAttempts: 1,
      mercyTierShift: -1,
      bonusTimerSec: 6,
      bonusStartingShields: 1,
      grantFreeSecondWind: true,
      badgeTitle: "✦ SCOUT'S ADVANTAGE ACTIVE",
      badgeDetail: 'Easier Questions + +6s Timer + Free Second Wind',
    };
  }
  return {
    active: true,
    failedAttempts: fails,
    mercyTierShift: -2,
    bonusTimerSec: 10,
    bonusStartingShields: 2,
    grantFreeSecondWind: true,
    badgeTitle: "✦ SCOUT'S ADVANTAGE MAX",
    badgeDetail: 'Gentle Questions + +10s Timer + +2 Shields + Free Second Wind',
  };
}
