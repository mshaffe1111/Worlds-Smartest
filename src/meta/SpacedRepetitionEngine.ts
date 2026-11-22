// ============================================================================
// WORLD'S SMARTEST — 5-Box Leitner Spaced-Repetition Mastery Engine (`v2.0` #5B)
// Cognitive memory consolidation persisted in `localStorage` (`ws_spaced_repetition_v2`):
//  • Missed questions (`!wasCorrect`) automatically enter Box 1 (Immediate 0ms on
//    first miss; 4h on repeat gameplay miss) so every mistake becomes lasting mastery!
//  • Bookmarked ☆ Intel Flashes enter Box 2 (24h review) if solved, or stay Box 1
//    if missed on that question.
//  • 5 Leitner Intervals:
//      Box 1: Immediate (0ms first miss / 4h repeat miss)
//      Box 2: 24 hours
//      Box 3: 3 days
//      Box 4: 7 days
//      Box 5: Mastered (21 days)
//  • Correct review promotes `box = Math.min(5, box + 1)` and schedules
//    `nextReviewAtMs = now + LEITNER_BOX_INTERVAL_MS[newBox]`.
//  • Wrong review resets cleanly to `Box 1` with `nextReviewAtMs = now` (Due Now).
// ============================================================================

import type { DomainId, IntelBookmark, PassportSystem } from '../narrative';

export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export type SrsCardSource = 'MISSED' | 'BOOKMARKED' | 'BOTH' | 'SEED';

export interface SrsQuestionOutcomeInput {
  qid: number;
  prompt: string;
  correctAnswer: string;
  distractors?: readonly string[];
  whyExplanation: string;
  domainId: DomainId | number;
  subcatLabel?: string;
  wasCorrect: boolean;
  wasBookmarked?: boolean;
  nowMs?: number;
}

export interface SrsReviewCard {
  qid: number;
  prompt: string;
  correctAnswer: string;
  distractors: string[];
  whyExplanation: string;
  domainId: DomainId;
  subcatLabel?: string;
  box: LeitnerBox;
  source: SrsCardSource;
  isBookmarked: boolean;
  isSeed?: boolean;
  createdAtMs: number;
  lastReviewedAtMs: number | null;
  nextReviewAtMs: number;
  totalReviews: number;
  correctReviews: number;
  wrongReviews: number;
  streakInDeck: number;
}

export interface SrsReviewAttemptResult {
  card: SrsReviewCard;
  previousBox: LeitnerBox;
  newBox: LeitnerBox;
  wasCorrect: boolean;
  nextIntervalLabel: string;
  promoted: boolean;
  resetToBox1: boolean;
}

export interface SrsDeckSummary {
  totalCards: number;
  dueCount: number;
  masteredCount: number;
  boxCounts: [number, number, number, number, number];
  retentionPct: number;
  missedCount: number;
  bookmarkedCount: number;
}

interface PersistedSrsState {
  schemaVersion: 2;
  updatedAtMs: number;
  cards: SrsReviewCard[];
}

export const SRS_STORAGE_KEY = 'ws_spaced_repetition_v2';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const BOX_1_FIRST_MISS_MS = 0;
export const BOX_1_REPEAT_MISS_MS = 4 * HOUR_MS;

export const LEITNER_BOX_INTERVAL_MS: Record<LeitnerBox, number> = {
  1: BOX_1_REPEAT_MISS_MS, // 4h on repeat miss (0ms immediate on first miss / review reset)
  2: 1 * DAY_MS, // 24h
  3: 3 * DAY_MS, // 3 days
  4: 7 * DAY_MS, // 7 days
  5: 21 * DAY_MS, // Mastered (21 days)
};

export const LEITNER_BOX_LABELS: Record<LeitnerBox, string> = {
  1: 'Box 1 · Immediate',
  2: 'Box 2 · 24h',
  3: 'Box 3 · 3 Days',
  4: 'Box 4 · 7 Days',
  5: 'Box 5 · Mastered',
};

export const LEITNER_BOX_SHORT_INTERVALS: Record<LeitnerBox, string> = {
  1: 'Now',
  2: '24h',
  3: '3d',
  4: '7d',
  5: '21d',
};

const MAX_STORED_SRS_CARDS = 600;

function clampDomainId(raw: number): DomainId {
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(11, Math.floor(raw))) as DomainId;
}

function clampBox(raw: number): LeitnerBox {
  if (!Number.isFinite(raw)) return 1;
  return Math.max(1, Math.min(5, Math.round(raw))) as LeitnerBox;
}

/**
 * Keeps calendar years (`1000..2150`) strictly comma-free (`1984`, never `1,984`).
 */
function sanitizeSrsCopy(text: string): string {
  return String(text ?? '')
    .trim()
    .replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi, '$1 $2$3')
    .replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g, (_m, y1a, y1b, rangePart, y2a, y2b) =>
      rangePart && y2a && y2b ? `(${y1a}${y1b}–${y2a}${y2b})` : `(${y1a}${y1b})`,
    )
    .replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g, '$1$2 $3')
    .replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g, '$1$2$3$4$5');
}

function cleanDistractors(
  rawDistractors: readonly string[] | undefined,
  correctAnswer: string,
): string[] {
  if (!Array.isArray(rawDistractors)) return [];
  const normCorrect = correctAnswer.trim().toLowerCase();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of rawDistractors) {
    const clean = sanitizeSrsCopy(String(item ?? ''));
    if (!clean) continue;
    const norm = clean.toLowerCase();
    if (norm === normCorrect || seen.has(norm)) continue;
    seen.add(norm);
    out.push(clean);
    if (out.length >= 3) break;
  }
  return out;
}

function cloneCard(card: SrsReviewCard): SrsReviewCard {
  return {
    ...card,
    distractors: [...card.distractors],
  };
}

export function formatTimeUntilReview(nextReviewAtMs: number, nowMs: number = Date.now()): string {
  const diff = nextReviewAtMs - nowMs;
  if (diff <= 0) return 'Due now';
  if (diff < HOUR_MS) {
    const mins = Math.max(1, Math.ceil(diff / (60 * 1000)));
    return `in ${mins}m`;
  }
  if (diff < DAY_MS) {
    const hrs = Math.max(1, Math.round(diff / HOUR_MS));
    return `in ${hrs}h`;
  }
  const days = Math.max(1, Math.round(diff / DAY_MS));
  return `in ${days}d`;
}

interface DemoSeedTemplate {
  qid: number;
  domainId: DomainId;
  subcatLabel: string;
  prompt: string;
  correctAnswer: string;
  distractors: readonly string[];
  whyExplanation: string;
  initialBox: LeitnerBox;
  dueNow: boolean;
}

const DEMO_GENEVA_SRS_SEEDS: readonly DemoSeedTemplate[] = [
  {
    qid: 900001,
    domainId: 0,
    subcatLabel: 'Modern Diplomacy',
    prompt: 'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',
    correctAnswer: 'Congress of Vienna',
    distractors: ['Treaty of Utrecht', 'Congress of Berlin', 'Peace of Westphalia'],
    whyExplanation:
      'Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.',
    initialBox: 1,
    dueNow: true,
  },
  {
    qid: 900002,
    domainId: 1,
    subcatLabel: 'Materials & Elements',
    prompt: 'Which pure metallic element possesses the highest melting point at 3,422 °C?',
    correctAnswer: 'Tungsten',
    distractors: ['Osmium', 'Rhenium', 'Tantalum'],
    whyExplanation:
      'Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.',
    initialBox: 1,
    dueNow: true,
  },
  {
    qid: 900007,
    domainId: 5,
    subcatLabel: 'Baseball',
    prompt: 'Which Cardinals ace posted an astonishing 1.12 ERA in 1968, prompting MLB to lower the pitcher’s mound?',
    correctAnswer: 'Bob Gibson',
    distractors: ['Sandy Koufax', 'Tom Seaver', 'Juan Marichal'],
    whyExplanation:
      'Gibson threw 13 shutouts and 28 complete games in 1968; MLB lowered the mound from 15 to 10 inches the next winter.',
    initialBox: 1,
    dueNow: true,
  },
  {
    qid: 900003,
    domainId: 2,
    subcatLabel: 'Maritime Straits',
    prompt: 'Which narrow waterway divides the European and Asian halves of Istanbul?',
    correctAnswer: 'Bosphorus Strait',
    distractors: ['Dardanelles', 'Strait of Hormuz', 'Kerch Strait'],
    whyExplanation:
      'Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international shipping.',
    initialBox: 2,
    dueNow: false,
  },
  {
    qid: 900005,
    domainId: 6,
    subcatLabel: 'Computing History',
    prompt: 'Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?',
    correctAnswer: 'Ada Lovelace',
    distractors: ['Grace Hopper', 'Alan Turing', 'Claude Shannon'],
    whyExplanation:
      'Lovelace published an algorithm for Bernoulli numbers and foresaw symbolic computing beyond pure arithmetic.',
    initialBox: 2,
    dueNow: false,
  },
  {
    qid: 900006,
    domainId: 11,
    subcatLabel: 'Game Theory',
    prompt: 'In game theory, what state holds when no player gains by unilaterally changing strategy?',
    correctAnswer: 'Nash Equilibrium',
    distractors: ['Pareto Optimality', 'Bayes’ Theorem', 'Prisoner’s Dilemma'],
    whyExplanation:
      'John Nash proved its existence across finite non-cooperative games in 1950 using Kakutani’s fixed-point theorem.',
    initialBox: 5,
    dueNow: false,
  },
];

export class SpacedRepetitionEngine {
  private cards = new Map<number, SrsReviewCard>();
  private readonly listeners = new Set<() => void>();

  constructor(passport?: PassportSystem) {
    this.load();
    if (passport) {
      this.syncFromPassportBookmarks(passport.getSnapshot().bookmarks);
    }
  }

  private load(): void {
    this.cards.clear();
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(SRS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedSrsState> | null;
      if (!parsed || !Array.isArray(parsed.cards)) return;

      for (const item of parsed.cards) {
        if (!item || typeof item !== 'object') continue;
        const qid = Math.floor(Number(item.qid));
        if (!Number.isFinite(qid) || qid <= 0) continue;
        const prompt = sanitizeSrsCopy(String(item.prompt ?? ''));
        const correctAnswer = sanitizeSrsCopy(String(item.correctAnswer ?? ''));
        if (!prompt || !correctAnswer) continue;

        const box = clampBox(Number(item.box) || 1);
        const createdAtMs = Number.isFinite(Number(item.createdAtMs))
          ? Number(item.createdAtMs)
          : Date.now();
        const nextReviewAtMs = Number.isFinite(Number(item.nextReviewAtMs))
          ? Number(item.nextReviewAtMs)
          : createdAtMs;
        const lastReviewedAtMs =
          item.lastReviewedAtMs !== null && Number.isFinite(Number(item.lastReviewedAtMs))
            ? Number(item.lastReviewedAtMs)
            : null;

        const validSources: readonly SrsCardSource[] = ['MISSED', 'BOOKMARKED', 'BOTH', 'SEED'];
        const source: SrsCardSource = validSources.includes(item.source as SrsCardSource)
          ? (item.source as SrsCardSource)
          : 'MISSED';

        this.cards.set(qid, {
          qid,
          prompt,
          correctAnswer,
          distractors: cleanDistractors(item.distractors, correctAnswer),
          whyExplanation: sanitizeSrsCopy(String(item.whyExplanation ?? '')),
          domainId: clampDomainId(Number(item.domainId)),
          subcatLabel: item.subcatLabel ? sanitizeSrsCopy(String(item.subcatLabel)) : undefined,
          box,
          source,
          isBookmarked: Boolean(item.isBookmarked || source === 'BOOKMARKED' || source === 'BOTH'),
          isSeed: Boolean(item.isSeed || source === 'SEED'),
          createdAtMs,
          lastReviewedAtMs,
          nextReviewAtMs,
          totalReviews: Math.max(0, Math.floor(Number(item.totalReviews) || 0)),
          correctReviews: Math.max(0, Math.floor(Number(item.correctReviews) || 0)),
          wrongReviews: Math.max(0, Math.floor(Number(item.wrongReviews) || 0)),
          streakInDeck: Math.max(0, Math.floor(Number(item.streakInDeck) || 0)),
        });
      }
    } catch {
      // Ignore corrupt storage payloads cleanly
    }
  }

  private enforceCapacity(): void {
    if (this.cards.size <= MAX_STORED_SRS_CARDS) return;
    const removable = Array.from(this.cards.values()).sort((a, b) => {
      // Preserve bookmarked cards first, then lower boxes (urgent learning), evict oldest Box 5 mastered cards first
      if (a.isBookmarked !== b.isBookmarked) return a.isBookmarked ? 1 : -1;
      if (a.box !== b.box) return b.box - a.box;
      return a.createdAtMs - b.createdAtMs;
    });
    const toDrop = this.cards.size - MAX_STORED_SRS_CARDS;
    for (let i = 0; i < toDrop && i < removable.length; i++) {
      this.cards.delete(removable[i].qid);
    }
  }

  private save(): void {
    this.enforceCapacity();
    try {
      if (typeof localStorage !== 'undefined') {
        const payload: PersistedSrsState = {
          schemaVersion: 2,
          updatedAtMs: Date.now(),
          cards: Array.from(this.cards.values()),
        };
        localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {
      // Ignore quota / private browsing errors
    }
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Automatically captures missed questions into Box 1 (Immediate 0ms on first miss,
   * 4h on repeat gameplay miss) and bookmarked questions into Box 2 (24h) if solved
   * or Box 1 if missed. Also advances existing cards when solved again in live play!
   */
  public ingestQuestionOutcome(input: SrsQuestionOutcomeInput): SrsReviewCard | null {
    const qid = Math.floor(Number(input.qid));
    if (!Number.isFinite(qid) || qid <= 0) return null;

    const prompt = sanitizeSrsCopy(input.prompt);
    const correctAnswer = sanitizeSrsCopy(input.correctAnswer);
    if (!prompt || !correctAnswer) return null;

    const now = Number.isFinite(input.nowMs) ? Number(input.nowMs) : Date.now();
    const domainId = clampDomainId(Number(input.domainId));
    const whyExplanation = sanitizeSrsCopy(input.whyExplanation);
    const distractors = cleanDistractors(input.distractors, correctAnswer);
    const subcatLabel = input.subcatLabel ? sanitizeSrsCopy(input.subcatLabel) : undefined;
    const wasCorrect = Boolean(input.wasCorrect);
    const wasBookmarked = Boolean(input.wasBookmarked);

    const existing = this.cards.get(qid);

    if (!wasCorrect) {
      if (!existing) {
        const card: SrsReviewCard = {
          qid,
          prompt,
          correctAnswer,
          distractors,
          whyExplanation,
          domainId,
          subcatLabel,
          box: 1,
          source: wasBookmarked ? 'BOTH' : 'MISSED',
          isBookmarked: wasBookmarked,
          isSeed: false,
          createdAtMs: now,
          lastReviewedAtMs: null,
          nextReviewAtMs: now + BOX_1_FIRST_MISS_MS, // Immediate (0ms) on first miss!
          totalReviews: 0,
          correctReviews: 0,
          wrongReviews: 0,
          streakInDeck: 0,
        };
        this.cards.set(qid, card);
        this.save();
        return cloneCard(card);
      }

      // Existing card missed again in live gameplay:
      //  • If already in Box 1 from a prior miss, schedule repeat-miss interval (4h)
      //  • If demoted from Box 2..5 (or seed), schedule immediately (0ms)
      const isRepeatBox1Miss =
        existing.box === 1 && !existing.isSeed && (existing.source === 'MISSED' || existing.source === 'BOTH');
      existing.prompt = prompt;
      existing.correctAnswer = correctAnswer;
      if (distractors.length > 0) existing.distractors = distractors;
      if (whyExplanation) existing.whyExplanation = whyExplanation;
      if (subcatLabel) existing.subcatLabel = subcatLabel;
      existing.domainId = domainId;
      existing.box = 1;
      existing.isSeed = false;
      existing.isBookmarked = existing.isBookmarked || wasBookmarked;
      existing.source = existing.isBookmarked ? 'BOTH' : 'MISSED';
      existing.lastReviewedAtMs = now;
      existing.totalReviews += 1;
      existing.wrongReviews += 1;
      existing.streakInDeck = 0;
      existing.nextReviewAtMs = now + (isRepeatBox1Miss ? BOX_1_REPEAT_MISS_MS : BOX_1_FIRST_MISS_MS);
      this.save();
      return cloneCard(existing);
    }

    // Correct outcome (`wasCorrect === true`):
    if (wasBookmarked) {
      if (!existing) {
        const card: SrsReviewCard = {
          qid,
          prompt,
          correctAnswer,
          distractors,
          whyExplanation,
          domainId,
          subcatLabel,
          box: 2, // Bookmarked & solved enters Box 2 (24h review)
          source: 'BOOKMARKED',
          isBookmarked: true,
          isSeed: false,
          createdAtMs: now,
          lastReviewedAtMs: now,
          nextReviewAtMs: now + LEITNER_BOX_INTERVAL_MS[2],
          totalReviews: 0,
          correctReviews: 0,
          wrongReviews: 0,
          streakInDeck: 1,
        };
        this.cards.set(qid, card);
        this.save();
        return cloneCard(card);
      }

      // Already exists (for example, missed on this question then bookmarked on Reveal):
      // Preserve Box 1 / urgent due schedule rather than hiding a fresh miss!
      existing.isBookmarked = true;
      existing.isSeed = false;
      existing.source = existing.source === 'MISSED' || existing.source === 'BOTH' ? 'BOTH' : 'BOOKMARKED';
      if (distractors.length > 0) existing.distractors = distractors;
      if (whyExplanation) existing.whyExplanation = whyExplanation;
      if (subcatLabel) existing.subcatLabel = subcatLabel;
      this.save();
      return cloneCard(existing);
    }

    // Correct & not bookmarked: only advance if the card is ALREADY in the SRS deck
    if (!existing) return null;

    const nextBox = Math.min(5, existing.box + 1) as LeitnerBox;
    existing.box = nextBox;
    existing.lastReviewedAtMs = now;
    existing.nextReviewAtMs = now + LEITNER_BOX_INTERVAL_MS[nextBox];
    existing.totalReviews += 1;
    existing.correctReviews += 1;
    existing.streakInDeck += 1;
    if (distractors.length > 0) existing.distractors = distractors;
    if (whyExplanation) existing.whyExplanation = whyExplanation;
    if (subcatLabel) existing.subcatLabel = subcatLabel;
    this.save();
    return cloneCard(existing);
  }

  /**
   * Upserts a single ☆ Intel Bookmark into the Mastery Deck (Box 2 / 24h if new,
   * or preserves Box 1 immediate review if already captured as a missed card!).
   */
  public upsertBookmarkCard(
    bookmark: IntelBookmark,
    distractors?: readonly string[],
    nowMs: number = Date.now(),
  ): SrsReviewCard | null {
    const qid = Math.floor(Number(bookmark.qid));
    if (!Number.isFinite(qid) || qid <= 0) return null;

    const existing = this.cards.get(qid);
    if (existing) {
      existing.isBookmarked = true;
      existing.isSeed = false;
      existing.source = existing.source === 'MISSED' || existing.source === 'BOTH' ? 'BOTH' : 'BOOKMARKED';
      const cleaned = cleanDistractors(distractors, existing.correctAnswer);
      if (cleaned.length > 0) existing.distractors = cleaned;
      this.save();
      return cloneCard(existing);
    }

    const prompt = sanitizeSrsCopy(bookmark.prompt);
    const correctAnswer = sanitizeSrsCopy(bookmark.answer);
    if (!prompt || !correctAnswer) return null;

    const parsedSavedMs = Date.parse(bookmark.savedAtIso);
    const createdAtMs = Number.isFinite(parsedSavedMs) ? parsedSavedMs : nowMs;
    const card: SrsReviewCard = {
      qid,
      prompt,
      correctAnswer,
      distractors: cleanDistractors(distractors, correctAnswer),
      whyExplanation: sanitizeSrsCopy(bookmark.whyExplanation),
      domainId: clampDomainId(Number(bookmark.domainId)),
      box: 2,
      source: 'BOOKMARKED',
      isBookmarked: true,
      isSeed: false,
      createdAtMs,
      lastReviewedAtMs: null,
      nextReviewAtMs: createdAtMs + LEITNER_BOX_INTERVAL_MS[2],
      totalReviews: 0,
      correctReviews: 0,
      wrongReviews: 0,
      streakInDeck: 0,
    };
    this.cards.set(qid, card);
    this.save();
    return cloneCard(card);
  }

  /**
   * Backfills existing `PassportSystem.bookmarks` into the 5-Box Leitner deck and
   * keeps bookmark flags in sync without ever discarding missed-question cards.
   */
  public syncFromPassportBookmarks(
    bookmarks: readonly IntelBookmark[],
    nowMs: number = Date.now(),
  ): number {
    let changed = 0;
    const bookmarkIds = new Set<number>();

    for (const bm of bookmarks) {
      const qid = Math.floor(Number(bm?.qid));
      if (!Number.isFinite(qid) || qid <= 0) continue;
      bookmarkIds.add(qid);

      const existing = this.cards.get(qid);
      if (!existing) {
        const prompt = sanitizeSrsCopy(bm.prompt);
        const correctAnswer = sanitizeSrsCopy(bm.answer);
        if (!prompt || !correctAnswer) continue;
        const parsedMs = Date.parse(bm.savedAtIso);
        const createdAtMs = Number.isFinite(parsedMs) ? parsedMs : nowMs;
        this.cards.set(qid, {
          qid,
          prompt,
          correctAnswer,
          distractors: [],
          whyExplanation: sanitizeSrsCopy(bm.whyExplanation),
          domainId: clampDomainId(Number(bm.domainId)),
          box: 2,
          source: 'BOOKMARKED',
          isBookmarked: true,
          isSeed: false,
          createdAtMs,
          lastReviewedAtMs: null,
          nextReviewAtMs: createdAtMs + LEITNER_BOX_INTERVAL_MS[2],
          totalReviews: 0,
          correctReviews: 0,
          wrongReviews: 0,
          streakInDeck: 0,
        });
        changed += 1;
      } else if (!existing.isBookmarked) {
        existing.isBookmarked = true;
        existing.isSeed = false;
        existing.source = existing.source === 'MISSED' || existing.source === 'BOTH' ? 'BOTH' : 'BOOKMARKED';
        changed += 1;
      }
    }

    // Reconcile unbookmarked cards: drop pure BOOKMARKED cards, keep MISSED/BOTH as MISSED
    for (const [qid, card] of Array.from(this.cards.entries())) {
      if (card.isBookmarked && !bookmarkIds.has(qid)) {
        if (card.source === 'BOOKMARKED') {
          this.cards.delete(qid);
        } else {
          card.isBookmarked = false;
          card.source = 'MISSED';
        }
        changed += 1;
      }
    }

    if (changed > 0) {
      this.save();
    }
    return changed;
  }

  /**
   * Grades an active review attempt inside the Mastery Deck:
   *  • Correct -> advances `box = Math.min(5, box + 1)` & schedules `now + LEITNER_BOX_INTERVAL_MS[newBox]`
   *  • Wrong   -> resets cleanly to `Box 1` with `nextReviewAtMs = now` (immediately due)
   */
  public recordReviewAttempt(
    qid: number,
    correct: boolean,
    nowMs: number = Date.now(),
  ): SrsReviewAttemptResult | null {
    const card = this.cards.get(Math.floor(Number(qid)));
    if (!card) return null;

    const now = Number.isFinite(nowMs) ? nowMs : Date.now();
    const previousBox = card.box;
    card.totalReviews += 1;
    card.lastReviewedAtMs = now;

    let newBox: LeitnerBox;
    if (correct) {
      newBox = Math.min(5, previousBox + 1) as LeitnerBox;
      card.box = newBox;
      card.correctReviews += 1;
      card.streakInDeck += 1;
      card.nextReviewAtMs = now + LEITNER_BOX_INTERVAL_MS[newBox];
    } else {
      newBox = 1;
      card.box = 1;
      card.wrongReviews += 1;
      card.streakInDeck = 0;
      card.nextReviewAtMs = now;
    }

    this.save();

    return {
      card: cloneCard(card),
      previousBox,
      newBox,
      wasCorrect: correct,
      nextIntervalLabel: correct ? LEITNER_BOX_SHORT_INTERVALS[newBox] : 'Now',
      promoted: correct && newBox > previousBox,
      resetToBox1: !correct,
    };
  }

  public getDueCards(nowMs: number = Date.now(), limit?: number): ReadonlyArray<SrsReviewCard> {
    const now = Number.isFinite(nowMs) ? nowMs : Date.now();
    const due = Array.from(this.cards.values())
      .filter((c) => c.nextReviewAtMs <= now)
      .sort((a, b) => {
        if (a.box !== b.box) return a.box - b.box;
        if (a.nextReviewAtMs !== b.nextReviewAtMs) return a.nextReviewAtMs - b.nextReviewAtMs;
        if (a.wrongReviews !== b.wrongReviews) return b.wrongReviews - a.wrongReviews;
        return a.createdAtMs - b.createdAtMs;
      })
      .map(cloneCard);

    if (typeof limit === 'number' && limit >= 0) {
      return due.slice(0, Math.floor(limit));
    }
    return due;
  }

  public getDueCount(nowMs: number = Date.now()): number {
    const now = Number.isFinite(nowMs) ? nowMs : Date.now();
    let count = 0;
    for (const card of this.cards.values()) {
      if (card.nextReviewAtMs <= now) count += 1;
    }
    return count;
  }

  public getAllCards(): ReadonlyArray<SrsReviewCard> {
    return Array.from(this.cards.values())
      .sort((a, b) => {
        if (a.box !== b.box) return a.box - b.box;
        if (a.nextReviewAtMs !== b.nextReviewAtMs) return a.nextReviewAtMs - b.nextReviewAtMs;
        return b.createdAtMs - a.createdAtMs;
      })
      .map(cloneCard);
  }

  public getMasteredCards(): ReadonlyArray<SrsReviewCard> {
    return Array.from(this.cards.values())
      .filter((c) => c.box === 5)
      .sort((a, b) => (b.lastReviewedAtMs ?? b.createdAtMs) - (a.lastReviewedAtMs ?? a.createdAtMs))
      .map(cloneCard);
  }

  public getCard(qid: number): SrsReviewCard | null {
    const found = this.cards.get(Math.floor(Number(qid)));
    return found ? cloneCard(found) : null;
  }

  public removeCard(qid: number): boolean {
    const deleted = this.cards.delete(Math.floor(Number(qid)));
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  public clearAll(): void {
    this.cards.clear();
    this.save();
  }

  public getDeckSummary(nowMs: number = Date.now()): SrsDeckSummary {
    const now = Number.isFinite(nowMs) ? nowMs : Date.now();
    const boxCounts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    let dueCount = 0;
    let totalReviews = 0;
    let correctReviews = 0;
    let missedCount = 0;
    let bookmarkedCount = 0;

    for (const card of this.cards.values()) {
      boxCounts[card.box - 1] += 1;
      if (card.nextReviewAtMs <= now) dueCount += 1;
      totalReviews += card.totalReviews;
      correctReviews += card.correctReviews;
      if (card.source === 'MISSED' || card.source === 'BOTH') missedCount += 1;
      if (card.isBookmarked) bookmarkedCount += 1;
    }

    const totalCards = this.cards.size;
    const masteredCount = boxCounts[4];
    const retentionPct =
      totalReviews > 0
        ? Math.round((correctReviews / totalReviews) * 100)
        : totalCards > 0
          ? Math.round(((totalCards - boxCounts[0]) / totalCards) * 100)
          : 0;

    return {
      totalCards,
      dueCount,
      masteredCount,
      boxCounts,
      retentionPct,
      missedCount,
      bookmarkedCount,
    };
  }

  /**
   * Seeds 6 curated Geneva Archival cards across Boxes 1, 2, and 5 ONLY when the deck is empty.
   */
  public seedDemoCardsIfEmpty(nowMs: number = Date.now()): boolean {
    if (this.cards.size > 0) return false;
    const now = Number.isFinite(nowMs) ? nowMs : Date.now();

    for (let i = 0; i < DEMO_GENEVA_SRS_SEEDS.length; i++) {
      const seed = DEMO_GENEVA_SRS_SEEDS[i];
      const nextReviewAtMs = seed.dueNow
        ? now - (DEMO_GENEVA_SRS_SEEDS.length - i) * 1000
        : now + LEITNER_BOX_INTERVAL_MS[seed.initialBox];

      this.cards.set(seed.qid, {
        qid: seed.qid,
        prompt: sanitizeSrsCopy(seed.prompt),
        correctAnswer: sanitizeSrsCopy(seed.correctAnswer),
        distractors: cleanDistractors(seed.distractors, seed.correctAnswer),
        whyExplanation: sanitizeSrsCopy(seed.whyExplanation),
        domainId: seed.domainId,
        subcatLabel: seed.subcatLabel,
        box: seed.initialBox,
        source: 'SEED',
        isBookmarked: false,
        isSeed: true,
        createdAtMs: now - (i + 1) * 60_000,
        lastReviewedAtMs: seed.initialBox > 1 ? now - HOUR_MS : null,
        nextReviewAtMs,
        totalReviews: seed.initialBox === 5 ? 4 : seed.initialBox === 2 ? 1 : 0,
        correctReviews: seed.initialBox === 5 ? 4 : seed.initialBox === 2 ? 1 : 0,
        wrongReviews: 0,
        streakInDeck: seed.initialBox === 5 ? 4 : seed.initialBox === 2 ? 1 : 0,
      });
    }

    this.save();
    return true;
  }
}
