// ============================================================================
// WORLD'S SMARTEST — Signature Standout Mechanic #1: THE CLUE LADDER
// Progressive 3-Step Deduction (`500 -> 350 -> 200 PTS`):
//   • Step 1 (500 PTS · Genius Lead):        +200 Bonus ("✦ CLUE-1 SNIPE!")
//   • Step 2 (350 PTS · Sharp Narrowing):    +75 Bonus  ("✦ CLUE-2 LOCK!")
//   • Step 3 (200 PTS · Everyday Giveaway):  +0 Base    (Full Crystal-Clear Prompt)
// Deterministic, zero answer spoilers, zero OS emojis, comma-free calendar years.
// ============================================================================

import { sanitizeTriviaCopy } from '../forge/ShardDecoder';
import type { PrismQuestion } from '../forge/types';

export type ClueLadderStepNumber = 1 | 2 | 3;

export interface ClueLadderStep {
  readonly step: ClueLadderStepNumber;
  /** Showcase ladder readout value (`500`, `350`, or `200`) */
  readonly pointsValue: 500 | 350 | 200;
  /** Flat bonus points awarded on top of lock score (`+200`, `+75`, or `+0`) */
  readonly bonusPoints: 200 | 75 | 0;
  /** Plain-English step title */
  readonly label: string;
  /** Compact points badge (`500 PTS` / `350 PTS` / `200 PTS`) */
  readonly pointsBadge: string;
  /** Celebration callout when solved on this step */
  readonly calloutBanner: string;
  /** Spoiler-free, sanitized clue copy */
  readonly text: string;
}

export interface ClueLadderSpec {
  readonly qid: number;
  readonly steps: readonly [ClueLadderStep, ClueLadderStep, ClueLadderStep];
  /** Default auto-reveal interval between steps in seconds (`4.5s`) */
  readonly autoRevealIntervalSec: number;
}

export interface ClueLadderStepView extends ClueLadderStep {
  readonly unlocked: boolean;
  readonly isCurrent: boolean;
}

export interface ClueLadderViewSnapshot {
  readonly qid: number;
  readonly activeStep: ClueLadderStepNumber;
  readonly ladderBonusPoints: 200 | 75 | 0;
  readonly currentPointsValue: 500 | 350 | 200;
  readonly currentCalloutBanner: string;
  readonly isStep1Snipe: boolean;
  readonly canRevealNext: boolean;
  readonly nextAutoRevealInSec: number;
  readonly steps: readonly [ClueLadderStepView, ClueLadderStepView, ClueLadderStepView];
}

export const CLUE_LADDER_AUTO_REVEAL_SEC = 4.5;

const GENERIC_CLUE_RE =
  /^(?:category (?:focus|context):|half of the false facets|verify the |cross-check the verified)/i;

const ANSWER_LEAK_STOPWORDS = new Set<string>([
  'the',
  'and',
  'for',
  'with',
  'from',
  'into',
  'over',
  'under',
  'this',
  'that',
  'have',
  'has',
  'was',
  'were',
  'united',
  'states',
  'kingdom',
  'republic',
  'empire',
  'world',
  'national',
  'international',
  'great',
  'grand',
  'north',
  'south',
  'east',
  'west',
  'central',
  'first',
  'second',
  'third',
  'new',
  'old',
  'city',
  'town',
  'state',
  'river',
  'lake',
  'mount',
  'mountain',
  'peak',
  'island',
  'islands',
  'ocean',
  'sea',
  'bay',
  'park',
  'field',
  'tower',
  'bridge',
  'palace',
  'castle',
  'stone',
  'wall',
  'house',
  'hall',
  'church',
  'temple',
  'museum',
  'effect',
  'theory',
  'law',
  'principle',
  'system',
  'order',
  'war',
  'battle',
  'treaty',
  'king',
  'queen',
  'prince',
  'saint',
  'doctor',
  'sir',
  'lord',
  'lady',
  'club',
  'team',
  'league',
  'cup',
  'series',
  'open',
  'games',
  'red',
  'blue',
  'green',
  'black',
  'white',
  'gold',
  'golden',
  'silver',
]);

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeForCompare(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Extracts significant tokens from `answerCorrect` that would spoil the answer if revealed
 * verbatim in Step 1 or Step 2 of the Clue Ladder.
 */
function extractDistinctiveAnswerTokens(answerCorrect: string): string[] {
  const cleanAns = sanitizeTriviaCopy(answerCorrect).trim();
  if (!cleanAns) return [];
  const words = cleanAns
    .split(/[^a-zA-Z0-9']+/)
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter((w) => w.length >= 4);

  const tokens: string[] = [];
  for (const w of words) {
    const low = w.toLowerCase();
    if (ANSWER_LEAK_STOPWORDS.has(low)) continue;
    if (/^\d+$/.test(w) && w.length < 4) continue;
    tokens.push(w);
  }
  return tokens;
}

/**
 * Returns `true` if `candidateText` leaks the exact answer string or any distinctive
 * core word from `answerCorrect`.
 */
export function doesClueSpoilAnswer(candidateText: string, answerCorrect: string): boolean {
  const text = sanitizeTriviaCopy(candidateText).trim();
  const ans = sanitizeTriviaCopy(answerCorrect).trim();
  if (!text || !ans) return false;

  const textLow = text.toLowerCase();
  const ansLow = ans.toLowerCase();

  // 1. Direct full-answer match (word-bounded for short tokens so "Pi" doesn't match "epic")
  if (ansLow.length >= 3) {
    const exactRe = new RegExp(`(?<![a-z0-9])${escapeRegExp(ansLow)}(?![a-z0-9])`, 'i');
    if (exactRe.test(textLow)) return true;
  }

  // 2. Distinctive core token match (e.g., "Einstein", "Champollion", "Matterhorn", "Fenway")
  const tokens = extractDistinctiveAnswerTokens(ans);
  for (const tok of tokens) {
    if (tok.length < 5) continue;
    const tokRe = new RegExp(`(?<![a-z0-9])${escapeRegExp(tok.toLowerCase())}(?:s|es|'s)?(?![a-z0-9])`, 'i');
    if (tokRe.test(textLow)) return true;
  }

  return false;
}

/**
 * Masks any direct occurrence of the answer inside a context sentence cleanly, or returns
 * `null` if masking would produce awkward/empty copy.
 */
function maskAnswerInContextSentence(sentence: string, answerCorrect: string): string | null {
  const clean = sanitizeTriviaCopy(sentence).trim();
  const ans = sanitizeTriviaCopy(answerCorrect).trim();
  if (!clean || clean.length < 24) return null;
  if (!doesClueSpoilAnswer(clean, ans)) return clean;

  if (ans.length < 3) return null;

  // Replace optional leading article + exact answer with "this subject"
  let masked = clean.replace(
    new RegExp(`\\b(?:the\\s+)?${escapeRegExp(ans)}(?:'s)?\\b`, 'gi'),
    (match) => (match.endsWith("'s") ? "this subject's" : 'this subject'),
  );

  // Also replace any remaining distinctive 5+ char tokens if they appear cleanly
  const tokens = extractDistinctiveAnswerTokens(ans);
  for (const tok of tokens) {
    if (tok.length < 5) continue;
    masked = masked.replace(
      new RegExp(`\\b(?:the\\s+)?${escapeRegExp(tok)}(?:'s)?\\b`, 'gi'),
      (match) => (match.endsWith("'s") ? "this subject's" : 'this subject'),
    );
  }

  masked = masked
    .replace(/\b(?:this subject\s+){2,}/gi, 'this subject ')
    .replace(/\b(?:a|an|the)\s+this subject\b/gi, 'this subject')
    .replace(/ {2,}/g, ' ')
    .trim();

  // Ensure the masked sentence still carries rich information and zero answer leaks
  if (masked.length < 24 || doesClueSpoilAnswer(masked, ans)) {
    return null;
  }
  // Avoid clunky tautologies like "This subject is this subject."
  if (/^this subject\s+(?:is|was|are|were)\s+(?:a|an|the)?\s*this subject/i.test(masked)) {
    return null;
  }
  return masked;
}

function splitSentences(text: string): string[] {
  const clean = sanitizeTriviaCopy(text).trim();
  if (!clean) return [];
  return clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 18);
}

function extractPromptOpeningLead(prompt: string, answerCorrect: string): string | null {
  const clean = sanitizeTriviaCopy(prompt).trim();
  if (!clean) return null;

  // Look for a rich introductory clause before "which / who / what / where / name the"
  const leadMatch = clean.match(
    /^([^?]{18,130}?)(?:,\s*|\s+—\s+|\s*:\s+)(?:which|who|what|where|when|whose|in\s+which|name\s+the)\b/i,
  );
  if (leadMatch && leadMatch[1]) {
    const clause = leadMatch[1].trim().replace(/[,;:\-—]+$/, '');
    if (clause.length >= 18 && !doesClueSpoilAnswer(clause, answerCorrect)) {
      const ended = /[.!?]$/.test(clause) ? clause : `${clause}.`;
      return ended;
    }
  }
  return null;
}

function isUsableAuthoredClue(text: string | null | undefined, answerCorrect: string): text is string {
  if (!text || typeof text !== 'string') return false;
  const clean = sanitizeTriviaCopy(text).trim();
  if (clean.length < 18) return false;
  if (GENERIC_CLUE_RE.test(clean)) return false;
  if (/\b(?:false facets?|50\/50|eliminated|shatter(?:ed|ing)?)\b/i.test(clean)) return false;
  if (doesClueSpoilAnswer(clean, answerCorrect)) return false;
  return true;
}

function ensureTerminalPunctuation(text: string): string {
  const trimmed = sanitizeTriviaCopy(text).trim();
  if (!trimmed) return '';
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function buildMetadataNarrowingHint(q: PrismQuestion, alreadyUsedNorm: Set<string>): string {
  const domainName = q.domainMeta?.name || 'World Knowledge';
  const l1 = q.l1Category?.trim() || domainName;
  const l2 =
    q.l2Subcategory && q.l2Subcategory !== 'General Archive' ? q.l2Subcategory.trim() : '';
  const ansClean = sanitizeTriviaCopy(q.answerCorrect).trim();
  const ansWords = ansClean.split(/\s+/).filter(Boolean);
  const firstChar = ansClean.match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() ?? '';

  const candidates: string[] = [];
  if (l2 && l2.toLowerCase() !== l1.toLowerCase()) {
    candidates.push(
      `Spotlight: ${domainName} — specifically ${l1} (${l2}).`,
    );
  }
  if (ansWords.length >= 2 && firstChar) {
    candidates.push(
      `Field: ${l1}. Look for a ${ansWords.length}-word answer starting with "${firstChar}".`,
    );
  } else if (firstChar) {
    candidates.push(
      `Field: ${l1}. Narrow your pick to the answer beginning with "${firstChar}".`,
    );
  }
  candidates.push(
    `Category clue: ${domainName} · ${l1}. Eliminate choices outside this field.`,
  );

  for (const cand of candidates) {
    const clean = ensureTerminalPunctuation(cand);
    const norm = normalizeForCompare(clean);
    if (!alreadyUsedNorm.has(norm) && !doesClueSpoilAnswer(clean, q.answerCorrect)) {
      return clean;
    }
  }
  return ensureTerminalPunctuation(`Focus on ${domainName}: ${l1}.`);
}

/**
 * Deterministically builds a 3-Step Progressive Clue Ladder (`500 -> 350 -> 200 PTS`)
 * for any `PrismQuestion`, strictly guaranteeing zero answer spoilers on Steps 1 & 2
 * and a crystal-clear full prompt on Step 3!
 */
export function buildClueLadderSpec(q: PrismQuestion): ClueLadderSpec {
  const answer = sanitizeTriviaCopy(q.answerCorrect || '').trim();
  const cleanPrompt = sanitizeTriviaCopy(q.prompt || '').trim();
  const tier2Raw = q.clueTiers?.[1]?.clueText ?? q.clues?.[0] ?? '';
  const tier3Raw = q.clueTiers?.[2]?.clueText ?? q.clues?.[1] ?? '';
  const whySentences = splitSentences(q.whyExplanation || '');
  const openingLead = extractPromptOpeningLead(cleanPrompt, answer);

  const usedNorm = new Set<string>();
  const promptNorm = normalizeForCompare(cleanPrompt);

  // --- Step 1 (500 PTS · Genius Lead): Intriguing lateral clue ---
  let step1Text = '';
  if (isUsableAuthoredClue(tier2Raw, answer)) {
    step1Text = ensureTerminalPunctuation(tier2Raw);
  } else {
    for (const s of whySentences) {
      const safe = maskAnswerInContextSentence(s, answer);
      if (safe && normalizeForCompare(safe) !== promptNorm) {
        step1Text = ensureTerminalPunctuation(safe);
        break;
      }
    }
  }
  if (!step1Text && openingLead && normalizeForCompare(openingLead) !== promptNorm) {
    step1Text = ensureTerminalPunctuation(openingLead);
  }
  if (!step1Text) {
    const sub =
      q.l2Subcategory && q.l2Subcategory !== 'General Archive'
        ? `${q.l1Category} (${q.l2Subcategory})`
        : q.l1Category || q.domainMeta?.name || 'General Knowledge';
    step1Text = ensureTerminalPunctuation(
      `Lateral lead — ${q.domainMeta?.name || 'Archive'}: ${sub}. Spot the standout link among the 4 choices`,
    );
  }
  usedNorm.add(normalizeForCompare(step1Text));

  // --- Step 2 (350 PTS · Sharp Narrowing Clue): Concrete secondary clue ---
  let step2Text = '';
  if (
    isUsableAuthoredClue(tier3Raw, answer) &&
    !usedNorm.has(normalizeForCompare(tier3Raw)) &&
    normalizeForCompare(tier3Raw) !== promptNorm
  ) {
    step2Text = ensureTerminalPunctuation(tier3Raw);
  } else if (
    isUsableAuthoredClue(tier2Raw, answer) &&
    !usedNorm.has(normalizeForCompare(tier2Raw)) &&
    normalizeForCompare(tier2Raw) !== promptNorm
  ) {
    step2Text = ensureTerminalPunctuation(tier2Raw);
  }

  if (!step2Text && openingLead && !usedNorm.has(normalizeForCompare(openingLead))) {
    step2Text = ensureTerminalPunctuation(openingLead);
  }

  if (!step2Text) {
    for (const s of whySentences) {
      const safe = maskAnswerInContextSentence(s, answer);
      if (safe && !usedNorm.has(normalizeForCompare(safe)) && normalizeForCompare(safe) !== promptNorm) {
        step2Text = ensureTerminalPunctuation(safe);
        break;
      }
    }
  }

  if (!step2Text) {
    step2Text = buildMetadataNarrowingHint(q, usedNorm);
  }
  usedNorm.add(normalizeForCompare(step2Text));

  // --- Step 3 (200 PTS · Everyday Giveaway): Full crystal-clear prompt + helpful context ---
  let step3Text = cleanPrompt || `Identify the correct ${q.l1Category || 'trivia'} answer.`;
  if (step3Text.length < 48 && q.l1Category && !step3Text.toLowerCase().includes(q.l1Category.toLowerCase())) {
    step3Text = `${step3Text} (${q.l1Category})`;
  }

  const steps: readonly [ClueLadderStep, ClueLadderStep, ClueLadderStep] = [
    {
      step: 1,
      pointsValue: 500,
      bonusPoints: 200,
      label: 'GENIUS LEAD',
      pointsBadge: '500 PTS',
      calloutBanner: '✦ CLUE-1 SNIPE! +200 PTS',
      text: step1Text,
    },
    {
      step: 2,
      pointsValue: 350,
      bonusPoints: 75,
      label: 'SHARP CLUE',
      pointsBadge: '350 PTS',
      calloutBanner: '✦ CLUE-2 LOCK! +75 PTS',
      text: step2Text,
    },
    {
      step: 3,
      pointsValue: 200,
      bonusPoints: 0,
      label: 'FULL QUESTION',
      pointsBadge: '200 PTS',
      calloutBanner: 'FULL CLUE LOCK',
      text: step3Text,
    },
  ];

  return {
    qid: q.qid,
    steps,
    autoRevealIntervalSec: CLUE_LADDER_AUTO_REVEAL_SEC,
  };
}

/**
 * Determines whether a question slot should present the 3-Step Clue Ladder (`500 -> 350 -> 200 PTS`).
 * Activates on 1–2 non-visual `SIGHTLINE_LOCK` questions per round (`questionIndex === 1 || questionIndex === 3`),
 * preserving classic opener Q1, special morphs, visual blueprints, and the Final Question Category Picker!
 */
export function shouldUseClueLadder(
  questionIndex: number,
  totalQuestions: number,
  q: PrismQuestion,
  allQuestions?: ReadonlyArray<PrismQuestion>,
): boolean {
  if (!q || q.archetype !== 'SIGHTLINE_LOCK') return false;
  if (q.visualPlate?.imageUrl) return false;
  if (totalQuestions < 3 || questionIndex <= 0) return false;
  // Leave the final question clean for Finale Category Picker when totalQuestions >= 4
  if (totalQuestions >= 4 && questionIndex >= totalQuestions - 1) return false;

  if (questionIndex === 1 || questionIndex === 3) {
    return true;
  }

  // Fallback for rounds where slot 1 was a special morph (e.g., custom morphSequence) so rounds still get a Clue Ladder on slot 2!
  if (questionIndex === 2 && totalQuestions >= 4 && Array.isArray(allQuestions)) {
    const q1 = allQuestions[1];
    const slot1Eligible = Boolean(
      q1 && q1.archetype === 'SIGHTLINE_LOCK' && !q1.visualPlate?.imageUrl,
    );
    if (!slot1Eligible) {
      return true;
    }
  }

  // Longer runs (8–20+ questions) weave a Clue Ladder every 4 questions
  if (totalQuestions >= 8 && questionIndex > 3 && questionIndex % 4 === 1) {
    return true;
  }

  return false;
}

function isClueLadderSpec(input: PrismQuestion | ClueLadderSpec): input is ClueLadderSpec {
  return 'steps' in input && Array.isArray(input.steps);
}

/**
 * Stateful per-question tracker for the 3-Step Clue Ladder (`500 -> 350 -> 200 PTS`).
 * Supports both manual `revealNextStep()` clicks and smooth `4.5s` automatic progression via `tick(dtSec)`.
 */
export class ClueLadderTracker {
  public readonly spec: ClueLadderSpec;
  public activeStep: ClueLadderStepNumber = 1;

  private elapsedOnCurrentStepSec = 0;
  private autoRevealEnabled: boolean;

  constructor(questionOrSpec: PrismQuestion | ClueLadderSpec, autoRevealEnabled = true) {
    this.spec = isClueLadderSpec(questionOrSpec)
      ? questionOrSpec
      : buildClueLadderSpec(questionOrSpec);
    this.autoRevealEnabled = autoRevealEnabled;
  }

  public get ladderBonusPoints(): 200 | 75 | 0 {
    return this.spec.steps[this.activeStep - 1].bonusPoints;
  }

  public get currentPointsValue(): 500 | 350 | 200 {
    return this.spec.steps[this.activeStep - 1].pointsValue;
  }

  public get currentCalloutBanner(): string {
    return this.spec.steps[this.activeStep - 1].calloutBanner;
  }

  public get isStep1Snipe(): boolean {
    return this.activeStep === 1;
  }

  public get canRevealNext(): boolean {
    return this.activeStep < 3;
  }

  public get currentStepSpec(): ClueLadderStep {
    return this.spec.steps[this.activeStep - 1];
  }

  public get visibleSteps(): ClueLadderStep[] {
    return this.spec.steps.slice(0, this.activeStep);
  }

  public get nextAutoRevealInSec(): number {
    if (!this.autoRevealEnabled || this.activeStep >= 3) return 0;
    return Math.max(
      0,
      Math.round((this.spec.autoRevealIntervalSec - this.elapsedOnCurrentStepSec) * 10) / 10,
    );
  }

  public setAutoRevealEnabled(enabled: boolean): void {
    this.autoRevealEnabled = enabled;
  }

  /**
   * Immediately reveals the next clue step (`1 -> 2` or `2 -> 3`).
   */
  public revealNextStep(): {
    revealed: boolean;
    activeStep: ClueLadderStepNumber;
    stepSpec: ClueLadderStep;
  } {
    if (this.activeStep >= 3) {
      return {
        revealed: false,
        activeStep: 3,
        stepSpec: this.spec.steps[2],
      };
    }
    this.activeStep = (this.activeStep + 1) as ClueLadderStepNumber;
    this.elapsedOnCurrentStepSec = 0;
    return {
      revealed: true,
      activeStep: this.activeStep,
      stepSpec: this.spec.steps[this.activeStep - 1],
    };
  }

  /**
   * Reveals all 3 steps immediately (useful on answer reveal or 50/50 hint assist).
   */
  public revealAllSteps(): ClueLadderStep {
    this.activeStep = 3;
    this.elapsedOnCurrentStepSec = 0;
    return this.spec.steps[2];
  }

  /**
   * Advances auto-reveal elapsed time (call once per live gameplay tick after Reading Grace).
   * Automatically advances Step 1 -> Step 2 -> Step 3 every `4.5s` when enabled.
   */
  public tick(dtSec: number): {
    advanced: boolean;
    activeStep: ClueLadderStepNumber;
    stepSpec: ClueLadderStep;
  } {
    if (!this.autoRevealEnabled || this.activeStep >= 3 || !Number.isFinite(dtSec) || dtSec <= 0) {
      return {
        advanced: false,
        activeStep: this.activeStep,
        stepSpec: this.currentStepSpec,
      };
    }
    this.elapsedOnCurrentStepSec += dtSec;
    if (this.elapsedOnCurrentStepSec >= this.spec.autoRevealIntervalSec) {
      const res = this.revealNextStep();
      return {
        advanced: res.revealed,
        activeStep: res.activeStep,
        stepSpec: res.stepSpec,
      };
    }
    return {
      advanced: false,
      activeStep: this.activeStep,
      stepSpec: this.currentStepSpec,
    };
  }

  public getSnapshot(): ClueLadderViewSnapshot {
    const viewSteps = this.spec.steps.map((s) => ({
      ...s,
      unlocked: s.step <= this.activeStep,
      isCurrent: s.step === this.activeStep,
    })) as unknown as readonly [ClueLadderStepView, ClueLadderStepView, ClueLadderStepView];

    return {
      qid: this.spec.qid,
      activeStep: this.activeStep,
      ladderBonusPoints: this.ladderBonusPoints,
      currentPointsValue: this.currentPointsValue,
      currentCalloutBanner: this.currentCalloutBanner,
      isStep1Snipe: this.isStep1Snipe,
      canRevealNext: this.canRevealNext,
      nextAutoRevealInSec: this.nextAutoRevealInSec,
      steps: viewSteps,
    };
  }
}
