// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 Gold Master)
// `src/v7/corpus/CorpusManagerV7.ts`
// Zero-Repeat Bitset Ledger + 25-Match Entity Cooldown + Step-0 Difficulty Cap
// + Strict 75% Classic 4-Option (5 Visual Card Styles w/ Recency Guard) /
//   25% Full 13-Toy TV Showcase Rotation (w/ Anti-Repeat Recency Ring)
// + Evergreen `packs_manifest.json` Dynamic Shard Loader (<30ms Instant Boot)
// + Deterministic Seeded Daily Broadcast Draw + Friendly 1966 TV Categories.
// ============================================================================

import { SeenQuestionBitsetLedger } from '../../v6/corpus/SeenQuestionBitsetLedger';
import {
  ALL_CATEGORIES_V7,
  BLITZ_LEGAL_TOYS_V7,
  CATEGORY_TO_DOMAIN_V7,
  type CategoryIdV7,
  type ClueRecordV7,
  type DifficultyTierV7,
  type QuestionCardStyleV7,
  type ToyIdV7,
} from '../contracts_v7';

/** Inviting 1966 Network TV Marquee Banners for all 20 Canonical Categories. */
export const FRIENDLY_TV_CATEGORY_LABELS_V7: Record<CategoryIdV7, string> = {
  MEDICINE: 'LIFE & MEDICINE',
  CHEMISTRY: 'LAB & ELEMENTS',
  PHYSICS: 'SPACE & FORCES',
  GADGETS: 'TECH & GADGETS',
  ENGINES: 'BIG MACHINES',
  LITERATURE: 'BOOKS & TALES',
  LEXICON: 'WORDS & WIT',
  'FINE ARTS': 'ART & DESIGN',
  SCREEN: 'SILVER SCREEN',
  JUKEBOX: 'HIT PARADE',
  FINANCE: 'BIG MONEY',
  PRICING: 'PRICE TAG',
  ODDS: 'ODDS & GAMBITS',
  ATLAS: 'WORLD ATLAS',
  SPORTS: 'SPORTS & GAMES',
  DYNASTIES: 'EMPIRES & KINGS',
  HEADLINES: 'HISTORY & NEWS',
  FOLKLORE: 'MYTHS & LEGENDS',
  FALLACIES: 'BRAIN TWISTERS',
  CUISINE: 'FOOD & DRINK',
};

export function getFriendlyCategoryLabelV7(category: CategoryIdV7): string {
  return FRIENDLY_TV_CATEGORY_LABELS_V7[category] ?? category;
}

/**
 * Full Roster of All 13 Polished 1966 TV Showcase Contraptions (`TOY_02`..`TOY_14`)
 * rotated across the 25% Showcase bonus turns with a deep anti-repeat recency ring.
 */
export const CURATED_SHOWCASE_TOYS_V7: readonly ToyIdV7[] = [
  'TOY_03_VERNIER_DIAL',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_11_MISSING_VOWELS_WHEEL',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_14_FOUR_SHUTTER_REEL',
  'TOY_08_CHRONOLOGY_RAIL',
  'TOY_04_BALANCE_SCALE',
  'TOY_07_MAIL_SORTER',
  'TOY_09_SWITCHBOARD_PATCHBAY',
  'TOY_12_CONSPIRACY_LASSO',
  'TOY_13_CYANOTYPE_LOUPE',
  'TOY_02_CONFIDENCE_PNEUMATIC',
  'TOY_06_FUSE_WIRE_SNIPPER',
];

/** Five unmistakable 1966 TV Visual Presentations rotated across the 75% Classic turns. */
export const CLASSIC_CARD_STYLES_V7: readonly QuestionCardStyleV7[] = [
  'CLASSIC_CUE',
  'HEADLINE_BLANK',
  'PICTURE_MONITOR',
  'SPOT_THE_MYTH',
  'BINARY_SPLIT',
];

export interface PacksManifestShardEntryV7 {
  readonly file: string;
  readonly kind?: 'season' | 'expansion';
  readonly season?: 1 | 2 | 3 | 4;
  readonly packId?: string;
  readonly title?: string;
  readonly priority?: number;
  readonly count?: number;
  readonly qidRange?: readonly [number, number];
}

export interface PacksManifestV7 {
  readonly schema: string;
  readonly updatedAtIso?: string;
  readonly bootPack?: string;
  readonly totalCorpusCount?: number;
  readonly nextQid?: number;
  readonly shards: readonly PacksManifestShardEntryV7[];
}

export interface DrawClueRequestV7 {
  readonly category: CategoryIdV7;
  readonly maxDifficulty: DifficultyTierV7;
  readonly preferredToyId?: ToyIdV7;
  /** When true, strictly locks input to Classic 4-Option (`TOY_01_KNIFE_SWITCH`). */
  readonly forceClassicFourChoice?: boolean;
  /** When true (e.g. `SHOWCASE_BONUS` tile), selects from `CURATED_SHOWCASE_TOYS_V7`. */
  readonly forceShowcaseBonus?: boolean;
  /** Optional deterministic 32-bit seed for Daily 1966 Broadcast global parity. */
  readonly deterministicSeed?: number;
  /** When true (or when deterministicSeed is set), ignores local seenLedger so all players get identical Daily draws. */
  readonly ignoreSeenLedger?: boolean;
  readonly isBlitz?: boolean;
  readonly recentEntities?: readonly string[];
  readonly markAsSeen?: boolean;
}

export interface DrawClueResultV7 {
  readonly clue: ClueRecordV7;
  readonly selectedToy: ToyIdV7;
  readonly selectedCardStyle: QuestionCardStyleV7;
}

export interface CorpusTelemetryV7 {
  readonly loadedCluesCount: number;
  readonly totalManifestCount: number;
  readonly seenCount: number;
  readonly shardsLoaded: readonly string[];
}

const ALL_14_TOYS: readonly ToyIdV7[] = [
  'TOY_01_KNIFE_SWITCH',
  'TOY_02_CONFIDENCE_PNEUMATIC',
  'TOY_03_VERNIER_DIAL',
  'TOY_04_BALANCE_SCALE',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_06_FUSE_WIRE_SNIPPER',
  'TOY_07_MAIL_SORTER',
  'TOY_08_CHRONOLOGY_RAIL',
  'TOY_09_SWITCHBOARD_PATCHBAY',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_11_MISSING_VOWELS_WHEEL',
  'TOY_12_CONSPIRACY_LASSO',
  'TOY_13_CYANOTYPE_LOUPE',
  'TOY_14_FOUR_SHUTTER_REEL',
];

/** Bespoke physical showcase contraptions prioritized slightly ahead of universal wager/wire toys so they shine! */
const BESPOKE_MECHANICAL_TOYS_SET = new Set<ToyIdV7>([
  'TOY_03_VERNIER_DIAL',
  'TOY_04_BALANCE_SCALE',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_07_MAIL_SORTER',
  'TOY_08_CHRONOLOGY_RAIL',
  'TOY_09_SWITCHBOARD_PATCHBAY',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_11_MISSING_VOWELS_WHEEL',
  'TOY_12_CONSPIRACY_LASSO',
  'TOY_13_CYANOTYPE_LOUPE',
  'TOY_14_FOUR_SHUTTER_REEL',
]);

const BLITZ_SET = new Set<ToyIdV7>(BLITZ_LEGAL_TOYS_V7);
const CURATED_SHOWCASE_SET = new Set<ToyIdV7>(CURATED_SHOWCASE_TOYS_V7);
const VALID_CARD_STYLE_SET = new Set<QuestionCardStyleV7>(CLASSIC_CARD_STYLES_V7);

const WIRE_FRIENDLY_CATEGORIES = new Set<CategoryIdV7>([
  'HEADLINES',
  'DYNASTIES',
  'SPORTS',
  'SCREEN',
  'FINANCE',
  'PRICING',
  'GADGETS',
  'ENGINES',
]);

const PICTURE_FRIENDLY_CATEGORIES = new Set<CategoryIdV7>([
  'FINE ARTS',
  'ATLAS',
  'CUISINE',
  'MEDICINE',
  'PHYSICS',
  'ENGINES',
  'FOLKLORE',
  'SCREEN',
  'SPORTS',
  'GADGETS',
  'CHEMISTRY',
]);

const FALLBACK_SHARD_ORDER: readonly string[] = [
  'pack_primetime_variety_1.json',
  'pack_primetime_variety_2.json',
  'pack_primetime_variety_3.json',
  'pack_primetime_variety_4.json',
  'season_1.json',
  'season_2.json',
  'season_3.json',
  'season_4.json',
];

function mixSeed32(seed: number): number {
  let z = (seed + 0x6d2b79f5) | 0;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return (z ^ (z >>> 14)) >>> 0;
}

/**
 * Determines which visual 1966 card styles fit a clue naturally without mislabeling
 * (e.g. never slapping `SPOT_THE_MYTH` onto a non-myth clue, never putting 4-option
 * wording onto 2-paddle `BINARY_SPLIT`, and never breaking `[ _____ ]` blanks).
 */
const UNSAFE_FOR_TWO_PADDLE_RE =
  /\b(these four|all four of these|among these four|of these four|these 4|three of these|which three|second|third|fourth|rank|chronolog|except|odd one out|bogus|fake|hoax)\b/i;

const FOIL_CONTENT_STOP_WORDS = new Set([
  'that', 'this', 'with', 'from', 'into', 'over', 'your', 'what', 'which', 'about', 'more', 'most',
  'less', 'very', 'only', 'just', 'than', 'then', 'when', 'were', 'been', 'have', 'does', 'they',
  'them', 'some', 'each', 'many', 'such', 'same', 'also', 'both', 'made', 'make', 'year', 'years',
  'time', 'first', 'last', 'city', 'king', 'queen', 'park', 'lake', 'star', 'book', 'film', 'song',
  'game', 'team', 'club', 'hall', 'bank', 'gold', 'blue', 'white', 'black', 'green', 'great', 'high',
]);

function foilNamedInStem(clue: ClueRecordV7): boolean {
  const foil = clue.choices?.[clue.poisonedFixIdx];
  if (!foil) return false;
  const stemLow = clue.stem.toLowerCase();
  const foilLow = foil.toLowerCase().trim();
  const ansLow = (clue.choices?.[clue.answerIdx] ?? '').toLowerCase().trim();

  // Symmetric "X or Y?" 50/50 showdowns where BOTH answer and foil are explicitly named in the stem are valid!
  const ansNamed =
    (ansLow.length >= 4 &&
      new RegExp(`(^|[^a-z0-9])${ansLow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(stemLow)) ||
    ansLow
      .split(/[^a-z]+/)
      .filter((w) => w.length >= 4 && !FOIL_CONTENT_STOP_WORDS.has(w))
      .some((w) => !foilLow.includes(w.slice(0, 4)) && new RegExp(`(^|[^a-z])${w}([^a-z]|$)`, 'i').test(stemLow));
  if (ansNamed) return false;

  if (foilLow.length >= 4 && new RegExp(`(^|[^a-z0-9])${foilLow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(stemLow)) {
    return true;
  }
  const words = foilLow
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4 && !FOIL_CONTENT_STOP_WORDS.has(w));
  for (const w of words) {
    if (ansLow.includes(w.slice(0, Math.min(w.length, 4)))) continue;
    const root = w.endsWith('s') && w.length >= 5 ? w.slice(0, -1) : w;
    if (new RegExp(`(^|[^a-z])${root}(s|es|ed|ing)?([^a-z]|$)`, 'i').test(stemLow)) {
      return true;
    }
  }
  return false;
}

function getEligibleCardStylesForClue(clue: ClueRecordV7): readonly QuestionCardStyleV7[] {
  const explicit =
    clue.cardStyle && VALID_CARD_STYLE_SET.has(clue.cardStyle) ? clue.cardStyle : undefined;
  const binarySafe =
    !UNSAFE_FOR_TWO_PADDLE_RE.test(clue.stem) && !clue.isKlaxonMyth && !foilNamedInStem(clue);

  if (explicit === 'SPOT_THE_MYTH') {
    return ['SPOT_THE_MYTH'];
  }
  if (explicit === 'HEADLINE_BLANK' || /\[[\s_]{2,}\]/.test(clue.stem)) {
    return ['HEADLINE_BLANK', 'CLASSIC_CUE'];
  }
  if (explicit === 'BINARY_SPLIT') {
    return binarySafe
      ? ['BINARY_SPLIT', 'CLASSIC_CUE', 'PICTURE_MONITOR']
      : ['CLASSIC_CUE', 'PICTURE_MONITOR'];
  }
  if (explicit === 'PICTURE_MONITOR') {
    return binarySafe
      ? ['PICTURE_MONITOR', 'CLASSIC_CUE', 'BINARY_SPLIT']
      : ['PICTURE_MONITOR', 'CLASSIC_CUE'];
  }

  // Classic clues support rich non-repeating visual variety while honoring 2-paddle wording safety!
  const styles: QuestionCardStyleV7[] = binarySafe
    ? ['CLASSIC_CUE', 'PICTURE_MONITOR', 'BINARY_SPLIT']
    : ['CLASSIC_CUE', 'PICTURE_MONITOR'];
  if (clue.isKlaxonMyth) {
    styles.unshift('SPOT_THE_MYTH');
  }
  if (WIRE_FRIENDLY_CATEGORIES.has(clue.category)) {
    styles.push('HEADLINE_BLANK');
  }
  return styles;
}

// Instant zero-latency emergency seed (used only if drawClueForTurn fires before boot_pack.json resolves)
const EMERGENCY_SEED_CLUES: readonly ClueRecordV7[] = ALL_CATEGORIES_V7.map(
  (cat, idx): ClueRecordV7 => ({
    qid: idx,
    canonicalEntityKey: `seed_carbolic_${idx}`,
    category: cat,
    domain: CATEGORY_TO_DOMAIN_V7[cat],
    difficulty: 1,
    isBlitzLegal: true,
    cardStyle: CLASSIC_CARD_STYLES_V7[idx % CLASSIC_CARD_STYLES_V7.length],
    stem: 'Before Fleming spotted Penicillium mold, Joseph Lister pioneered antiseptic surgery using misted sprays of what?',
    choices: ['Carbolic acid', 'Diethyl ether', 'Silver nitrate', 'Chloroform'],
    answerIdx: 0,
    poisonedFixIdx: 1,
    waiverPruneIdx: 3,
    anchorIdx: 2,
    isKlaxonMyth: false,
    ahaFactoid: 'Lister chose carbolic acid after learning Carlisle used it to deodorize sewage pastures.',
    supportedToys: [
      'TOY_01_KNIFE_SWITCH',
      'TOY_02_CONFIDENCE_PNEUMATIC',
      'TOY_06_FUSE_WIRE_SNIPPER',
      'TOY_11_MISSING_VOWELS_WHEEL',
    ],
    vowels: {
      maskedDisplay: 'C R B L C   C D',
      fullAnswer: 'CARBOLIC ACID',
      vowelChoices: ['A-O-I-A-I', 'E-O-I-A-E', 'A-U-E-O-I', 'O-A-I-E-A'],
      correctChoiceIdx: 0,
    },
  }),
);

export class CorpusManagerV7 {
  public readonly seenLedger: SeenQuestionBitsetLedger;
  private readonly cluesByQid = new Map<number, ClueRecordV7>();
  private readonly bootPackQids = new Set<number>();
  private readonly byCategory = new Map<CategoryIdV7, ClueRecordV7[]>();
  private readonly loadedShards = new Set<string>();
  private readonly pendingFetches = new Map<string, Promise<void>>();
  private readonly recentToys: ToyIdV7[] = [];
  private readonly recentShowcaseToys: ToyIdV7[] = [];
  private readonly recentCardStyles: QuestionCardStyleV7[] = [];
  private readonly sessionEntities: string[] = [];
  private defaultCadenceCounter = 0;
  private classicDrawCounter = 0;
  private showcaseRotationCursor = 0;
  private totalManifestCount = 11053;
  private manifestPromise: Promise<PacksManifestV7 | null> | null = null;
  private bootPromise: Promise<void> | null = null;
  private warmPromise: Promise<void> | null = null;

  constructor() {
    this.seenLedger = new SeenQuestionBitsetLedger({
      localStorageKey: 'ws_v7_seen_rle_1',
      indexedDbName: 'ws_v7_seen_ledger_db_1',
    });
    for (const cat of ALL_CATEGORIES_V7) {
      this.byCategory.set(cat, []);
    }
  }

  private resolveDataUrl(fileName: string): string {
    const base =
      (typeof import.meta !== 'undefined' &&
        (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) ||
      './';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}data/v7/${fileName}`;
  }

  public async init(): Promise<void> {
    if (this.bootPromise) return this.bootPromise;
    this.bootPromise = (async () => {
      await this.seenLedger.hydrate().catch(() => {});
      // Fast <30ms instant boot from boot_pack.json ONLY, then asynchronously warm manifest packs!
      await this.loadShard('boot_pack.json');
      void this.warmSeasonShards();
    })();
    return this.bootPromise;
  }

  private async fetchPacksManifest(): Promise<PacksManifestV7 | null> {
    if (this.manifestPromise) return this.manifestPromise;
    this.manifestPromise = (async () => {
      try {
        const resp = await fetch(this.resolveDataUrl('packs_manifest.json'));
        if (!resp.ok) return null;
        const parsed = (await resp.json()) as PacksManifestV7;
        if (!parsed || !Array.isArray(parsed.shards) || parsed.shards.length === 0) {
          return null;
        }
        if (typeof parsed.totalCorpusCount === 'number' && parsed.totalCorpusCount > 0) {
          this.totalManifestCount = Math.max(this.totalManifestCount, parsed.totalCorpusCount);
        }
        return parsed;
      } catch {
        return null;
      }
    })();
    return this.manifestPromise;
  }

  /**
   * Reads `public/data/v7/packs_manifest.json` so evergreen drop-in packs (15,000-25,000+ clues)
   * load automatically with ZERO code edits; caches & returns a shared in-flight Promise<void>
   * and ingests shards in strict deterministic manifest/QID order so Daily Broadcast draws
   * remain 100% bit-for-bit identical worldwide regardless of network fetch timing.
   */
  public warmSeasonShards(prioritizeSeason?: 1 | 2 | 3 | 4): Promise<void> {
    if (this.warmPromise) return this.warmPromise;
    this.warmPromise = (async () => {
      const manifest = await this.fetchPacksManifest();
      const order: string[] = [];

      if (manifest && manifest.shards.length > 0) {
        if (prioritizeSeason) {
          const target = manifest.shards.find(
            (s) => s.season === prioritizeSeason || s.file === `season_${prioritizeSeason}.json`,
          );
          if (target && !order.includes(target.file)) {
            order.push(target.file);
          }
        }
        const sortedEntries = [...manifest.shards].sort(
          (a, b) => (a.priority ?? 50) - (b.priority ?? 50) || a.file.localeCompare(b.file),
        );
        for (const entry of sortedEntries) {
          if (entry.file && !order.includes(entry.file)) {
            order.push(entry.file);
          }
        }
      } else {
        if (prioritizeSeason) {
          order.push(`season_${prioritizeSeason}.json`);
        }
        for (const s of FALLBACK_SHARD_ORDER) {
          if (!order.includes(s)) order.push(s);
        }
      }

      // Fetch shards sequentially in deterministic manifest order & normalize bucket order by ascending QID
      for (const shard of order) {
        await this.loadShard(shard);
      }
      for (const bucket of this.byCategory.values()) {
        bucket.sort((a, b) => a.qid - b.qid);
      }
    })();
    return this.warmPromise;
  }

  public async loadShard(shardFile: string): Promise<void> {
    if (this.loadedShards.has(shardFile)) return;
    const inflight = this.pendingFetches.get(shardFile);
    if (inflight) return inflight;

    const task = (async () => {
      try {
        const resp = await fetch(this.resolveDataUrl(shardFile));
        if (!resp.ok) return;
        const payload = (await resp.json()) as {
          totalCorpusCount?: number;
          clues?: ClueRecordV7[];
        };
        if (typeof payload.totalCorpusCount === 'number' && payload.totalCorpusCount > 0) {
          // Never regress manifest count downward when loading older season_1..4 shards!
          this.totalManifestCount = Math.max(this.totalManifestCount, payload.totalCorpusCount);
        }
        if (Array.isArray(payload.clues)) {
          if (shardFile === 'boot_pack.json') {
            for (const c of payload.clues) {
              this.bootPackQids.add(c.qid);
            }
          }
          this.ingestClues(payload.clues);
          this.loadedShards.add(shardFile);
        }
      } catch {
        // Offline / preload fallback uses already ingested boot_pack or emergency seed
      } finally {
        this.pendingFetches.delete(shardFile);
      }
    })();

    this.pendingFetches.set(shardFile, task);
    return task;
  }

  public ingestClues(
    clues: readonly (ClueRecordV7 & { readonly extraToys?: readonly ToyIdV7[] })[],
  ): void {
    const baseToys: readonly ToyIdV7[] = [
      'TOY_01_KNIFE_SWITCH',
      'TOY_02_CONFIDENCE_PNEUMATIC',
      'TOY_06_FUSE_WIRE_SNIPPER',
    ];
    for (const raw of clues) {
      if (this.cluesByQid.has(raw.qid)) continue;
      const hydratedToys: readonly ToyIdV7[] = Array.isArray(raw.supportedToys)
        ? raw.supportedToys
        : Array.isArray(raw.extraToys) && raw.extraToys.length > 0
          ? [...baseToys, ...raw.extraToys]
          : baseToys;
      const clue: ClueRecordV7 = {
        ...raw,
        domain: raw.domain ?? CATEGORY_TO_DOMAIN_V7[raw.category],
        isBlitzLegal: Boolean(raw.isBlitzLegal),
        isKlaxonMyth: Boolean(raw.isKlaxonMyth),
        cardStyle: raw.cardStyle ?? 'CLASSIC_CUE',
        supportedToys: hydratedToys,
      };
      this.cluesByQid.set(clue.qid, clue);
      const bucket = this.byCategory.get(clue.category);
      if (bucket) {
        bucket.push(clue);
      }
    }
  }

  /** Resets the 75/25 4-turn cadence counter at the start of a new episode or Daily Broadcast. */
  public resetMatchCadence(seed = 0): void {
    this.defaultCadenceCounter = seed > 0 ? mixSeed32(seed) % 2 : 0;
    this.recentToys.length = 0;
    this.recentCardStyles.length = 0;
  }

  /**
   * Selects a Classic 4-Option clue + visually distinct `QuestionCardStyleV7` with a recency guard
   * so consecutive questions NEVER repeat the same card style back-to-back while honoring explicit
   * semantic tags (`SPOT_THE_MYTH`, `HEADLINE_BLANK`, `BINARY_SPLIT`, `PICTURE_MONITOR`, `CLASSIC_CUE`).
   */
  private selectClassicClueAndStyle(
    candidates: readonly ClueRecordV7[],
    isSeededMode: boolean,
    deterministicSeed?: number,
  ): { clue: ClueRecordV7; cardStyle: QuestionCardStyleV7 } {
    const lastStyle = this.recentCardStyles[this.recentCardStyles.length - 1];
    const recentWindow = new Set<QuestionCardStyleV7>(this.recentCardStyles.slice(-3));

    // Rotate desired visual presentation style across all 5 styles, strictly avoiding lastStyle
    const desiredStyleIdx = isSeededMode
      ? mixSeed32((deterministicSeed ?? 1) ^ 0x517cc1b7) % CLASSIC_CARD_STYLES_V7.length
      : (this.classicDrawCounter + this.seenLedger.getSeenCount()) % CLASSIC_CARD_STYLES_V7.length;
    let desiredStyle = CLASSIC_CARD_STYLES_V7[desiredStyleIdx];
    if (!isSeededMode && desiredStyle === lastStyle) {
      desiredStyle =
        CLASSIC_CARD_STYLES_V7[(desiredStyleIdx + 1) % CLASSIC_CARD_STYLES_V7.length];
    }

    const startOffset = isSeededMode
      ? mixSeed32((deterministicSeed ?? 1) ^ 0x9e3779b9) % candidates.length
      : (this.seenLedger.getSeenCount() * 37 + this.classicDrawCounter * 19 + this.defaultCadenceCounter * 13) %
        candidates.length;

    // Scan a generous slice (up to 64 candidates) to find the best semantic + visual style fit cleanly
    const scanLimit = Math.min(candidates.length, 64);
    let bestClue = candidates[startOffset];
    let bestStyle: QuestionCardStyleV7 = 'CLASSIC_CUE';
    let bestScore = -9999;

    for (let i = 0; i < scanLimit; i++) {
      const c = candidates[(startOffset + i) % candidates.length];
      const eligible = getEligibleCardStylesForClue(c);
      const explicit =
        c.cardStyle && VALID_CARD_STYLE_SET.has(c.cardStyle) ? c.cardStyle : undefined;

      for (const style of eligible) {
        let score = 0;
        // Strongly reward genuine author-tagged clues matching their native card style!
        if (explicit && style === explicit) score += 65;
        // Strongly reward matching our current target rotation style
        if (style === desiredStyle) score += 55;
        // Enforce non-repeating consecutive card style guard!
        if (!isSeededMode) {
          if (style === lastStyle) score -= 240;
          else if (!recentWindow.has(style)) score += 40;
        } else if (style === desiredStyle) {
          score += 30;
        }
        // Subtle thematic bonus for natural category fits on untagged clues
        if (!explicit) {
          if (style === 'PICTURE_MONITOR' && PICTURE_FRIENDLY_CATEGORIES.has(c.category)) score += 12;
          if (style === 'HEADLINE_BLANK' && WIRE_FRIENDLY_CATEGORIES.has(c.category)) score += 8;
        }
        // Prefer slightly fresher index near startOffset to preserve deterministic distribution
        score -= Math.floor(i / 8);

        if (score > bestScore) {
          bestScore = score;
          bestClue = c;
          bestStyle = style;
        }
      }
    }

    // Hard fallback safety: if somehow style still matched lastStyle and an alternative is eligible, switch!
    if (!isSeededMode && bestStyle === lastStyle) {
      const alt = getEligibleCardStylesForClue(bestClue).find((s) => s !== lastStyle);
      if (alt) bestStyle = alt;
    }

    return { clue: bestClue, cardStyle: bestStyle };
  }

  public drawClueForTurn(req: DrawClueRequestV7): DrawClueResultV7 {
    const isSeededMode = typeof req.deterministicSeed === 'number';
    const skipSeenLedger = Boolean(req.ignoreSeenLedger || isSeededMode);
    const cooldownSet = new Set<string>(
      isSeededMode
        ? [...(req.recentEntities ?? [])]
        : [...this.sessionEntities, ...(req.recentEntities ?? [])],
    );

    const rawCatBucket = this.byCategory.get(req.category) ?? [];
    const rawAllLoaded =
      this.cluesByQid.size > 0 ? Array.from(this.cluesByQid.values()) : EMERGENCY_SEED_CLUES;

    // Seeded Daily Broadcast draws deterministically across the full loaded pool sorted by ascending QID
    // (ShowtimeAppV7 awaits `warmSeasonShards()`, which caches a single deterministic in-flight Promise).
    const catBucket = rawCatBucket;
    const allLoaded = rawAllLoaded;

    // Determine target input mode:
    // 1. Explicit `preferredToyId` takes top priority when provided.
    // 2. `forceClassicFourChoice` locks `TOY_01_KNIFE_SWITCH` (with 5-style card rotation!).
    // 3. `forceShowcaseBonus` picks from all 13 `CURATED_SHOWCASE_TOYS_V7` (never back-to-back!).
    // 4. Default (omitted): strict 75% `TOY_01_KNIFE_SWITCH` / 25% `CURATED_SHOWCASE_TOYS_V7`
    //    cadence (slots 0,1,2 = Classic 4-Option; slot 3 = Curated Showcase; never back-to-back Showcase!).
    const lastToy = this.recentToys[this.recentToys.length - 1];
    const lastShowcaseToy = this.recentShowcaseToys[this.recentShowcaseToys.length - 1];
    let mode: 'EXPLICIT_TOY' | 'CLASSIC_FOUR_CHOICE' | 'SHOWCASE_BONUS';
    if (req.preferredToyId) {
      mode = 'EXPLICIT_TOY';
    } else if (req.forceClassicFourChoice) {
      mode = 'CLASSIC_FOUR_CHOICE';
    } else if (req.forceShowcaseBonus) {
      mode = 'SHOWCASE_BONUS';
    } else if (isSeededMode) {
      const slot = mixSeed32(req.deterministicSeed!) % 4;
      mode = slot === 3 ? 'SHOWCASE_BONUS' : 'CLASSIC_FOUR_CHOICE';
    } else {
      const slot = this.defaultCadenceCounter % 4;
      const lastWasShowcase = Boolean(lastToy && lastToy !== 'TOY_01_KNIFE_SWITCH');
      mode = slot === 3 && !lastWasShowcase ? 'SHOWCASE_BONUS' : 'CLASSIC_FOUR_CHOICE';
    }

    const matchesToyMode = (c: ClueRecordV7): boolean => {
      if (mode === 'EXPLICIT_TOY' && req.preferredToyId) {
        return c.supportedToys.includes(req.preferredToyId);
      }
      if (mode === 'CLASSIC_FOUR_CHOICE') {
        return c.supportedToys.includes('TOY_01_KNIFE_SWITCH');
      }
      return c.supportedToys.some(
        (t) => CURATED_SHOWCASE_SET.has(t) && (!req.isBlitz || BLITZ_SET.has(t)),
      );
    };

    const filterPool = (
      source: readonly ClueRecordV7[],
      enforceUnseen: boolean,
      enforceCooldown: boolean,
      enforceDiff: boolean,
      enforceToyMode: boolean,
    ): ClueRecordV7[] => {
      return source.filter((c) => {
        if (enforceDiff && c.difficulty > req.maxDifficulty) return false;
        if (req.isBlitz && !c.isBlitzLegal) return false;
        if (enforceToyMode && !matchesToyMode(c)) return false;
        if (enforceUnseen && !skipSeenLedger && this.seenLedger.hasSeen(c.qid)) return false;
        if (enforceCooldown && cooldownSet.has(c.canonicalEntityKey)) return false;
        return true;
      });
    };

    let candidates: ClueRecordV7[] = [];
    // Pass 1: Exact category + difficulty cap + desired 75/25 toy mode
    candidates = filterPool(catBucket, true, true, true, true);
    if (candidates.length === 0) candidates = filterPool(catBucket, true, false, true, true);
    if (candidates.length === 0 && mode === 'EXPLICIT_TOY') {
      candidates = filterPool(catBucket, false, false, false, true);
      if (candidates.length === 0) candidates = filterPool(allLoaded, true, false, false, true);
      if (candidates.length === 0) candidates = filterPool(allLoaded, false, false, false, true);
    }
    if (candidates.length === 0) {
      const dom = CATEGORY_TO_DOMAIN_V7[req.category];
      const domainPool = allLoaded.filter((c) => c.domain === dom);
      candidates = filterPool(domainPool, true, true, true, true);
    }
    if (candidates.length === 0) candidates = filterPool(catBucket, false, true, true, true);
    if (candidates.length === 0) candidates = filterPool(allLoaded, true, false, true, true);
    // Fallback relaxing toy mode while preserving classic 4-choice safety if needed
    if (candidates.length === 0) candidates = filterPool(catBucket, true, true, true, false);
    if (candidates.length === 0) candidates = filterPool(catBucket, false, false, true, false);
    if (candidates.length === 0) candidates = filterPool(allLoaded, false, false, true, false);
    if (candidates.length === 0) candidates = [...allLoaded];

    if (isSeededMode) {
      candidates = [...candidates].sort((a, b) => a.qid - b.qid);
    }

    let chosenClue = candidates[0];
    let chosenToy: ToyIdV7 = 'TOY_01_KNIFE_SWITCH';
    let chosenCardStyle: QuestionCardStyleV7 =
      chosenClue.cardStyle && VALID_CARD_STYLE_SET.has(chosenClue.cardStyle)
        ? chosenClue.cardStyle
        : 'CLASSIC_CUE';

    if (mode === 'CLASSIC_FOUR_CHOICE') {
      const pick = this.selectClassicClueAndStyle(candidates, isSeededMode, req.deterministicSeed);
      chosenClue = pick.clue;
      chosenCardStyle = pick.cardStyle;
      chosenToy = chosenClue.supportedToys.includes('TOY_01_KNIFE_SWITCH')
        ? 'TOY_01_KNIFE_SWITCH'
        : (chosenClue.supportedToys[0] ?? 'TOY_01_KNIFE_SWITCH');
    } else if (mode === 'EXPLICIT_TOY' && req.preferredToyId) {
      const idx = isSeededMode
        ? mixSeed32(req.deterministicSeed! ^ 0x85ebca6b) % candidates.length
        : (this.seenLedger.getSeenCount() * 31 + this.recentToys.length * 17) % candidates.length;
      chosenClue = candidates[idx];
      chosenToy = chosenClue.supportedToys.includes(req.preferredToyId)
        ? req.preferredToyId
        : (chosenClue.supportedToys[0] ?? 'TOY_01_KNIFE_SWITCH');
      chosenCardStyle =
        chosenClue.cardStyle && VALID_CARD_STYLE_SET.has(chosenClue.cardStyle)
          ? chosenClue.cardStyle
          : 'CLASSIC_CUE';
    } else {
      // SHOWCASE_BONUS (25% TV Bonus turns rotating cleanly across ALL 13 TOY_02..TOY_14 contraptions!)
      const recentShowcases6 = new Set(this.recentShowcaseToys.slice(-6));
      const recentShowcases10 = new Set(this.recentShowcaseToys.slice(-10));
      const targetShowcaseToy =
        CURATED_SHOWCASE_TOYS_V7[
          (isSeededMode
            ? mixSeed32(req.deterministicSeed! ^ 0x27d4eb2d)
            : this.showcaseRotationCursor) % CURATED_SHOWCASE_TOYS_V7.length
        ];

      // If category candidates only contain universal TOY_02/06, also consider same-domain bespoke toys
      // so players regularly experience Globe, Scale, Sorter, Chronology, Patchbay, Lasso, Cyanotype & Shutters!
      let showcasePool = candidates;
      const hasBespokeInCandidates = candidates.some((c) =>
        c.supportedToys.some(
          (t) =>
            BESPOKE_MECHANICAL_TOYS_SET.has(t) &&
            t !== lastShowcaseToy &&
            (!req.isBlitz || BLITZ_SET.has(t)),
        ),
      );
      if (!hasBespokeInCandidates && !isSeededMode) {
        const dom = CATEGORY_TO_DOMAIN_V7[req.category];
        const domBespoke = allLoaded.filter(
          (c) =>
            c.domain === dom &&
            c.difficulty <= req.maxDifficulty &&
            (!req.isBlitz || c.isBlitzLegal) &&
            (!skipSeenLedger ? !this.seenLedger.hasSeen(c.qid) : true) &&
            !cooldownSet.has(c.canonicalEntityKey) &&
            c.supportedToys.some(
              (t) =>
                BESPOKE_MECHANICAL_TOYS_SET.has(t) &&
                t !== lastShowcaseToy &&
                (!req.isBlitz || BLITZ_SET.has(t)),
            ),
        );
        if (domBespoke.length > 0) {
          showcasePool = [...candidates, ...domBespoke.slice(0, 32)];
        }
      }

      const startOffset = isSeededMode
        ? mixSeed32(req.deterministicSeed! ^ 0xc2b2ae35) % showcasePool.length
        : (this.seenLedger.getSeenCount() * 29 + this.recentShowcaseToys.length * 19) %
          showcasePool.length;

      let bestScore = -9999;
      for (let i = 0; i < showcasePool.length; i++) {
        const c = showcasePool[(i + startOffset) % showcasePool.length];
        const showcaseToys = c.supportedToys.filter(
          (t) => CURATED_SHOWCASE_SET.has(t) && (!req.isBlitz || BLITZ_SET.has(t)),
        );
        const usable: readonly ToyIdV7[] =
          showcaseToys.length > 0 ? showcaseToys : ['TOY_01_KNIFE_SWITCH'];

        for (const toy of usable) {
          let score = 0;
          if (CURATED_SHOWCASE_SET.has(toy)) score += 100;
          // Prefer exact requested category over domain-borrowed showcase fallback
          if (c.category === req.category) score += 26;
          // Give bespoke physical contraptions a clear edge over universal TOY_02/TOY_06 unless rotating to them
          if (BESPOKE_MECHANICAL_TOYS_SET.has(toy)) score += 28;
          // Spotlight the current target slot in the 13-toy carousel!
          if (toy === targetShowcaseToy) score += 52;

          if (!isSeededMode) {
            // Strict anti-back-to-back guard on showcase toys!
            if (toy === lastShowcaseToy || toy === lastToy) {
              score -= 260;
            } else if (!recentShowcases10.has(toy)) {
              score += 75;
            } else if (!recentShowcases6.has(toy)) {
              score += 42;
            } else {
              // Reward toys that haven't appeared as recently inside the last 6
              const lastIdx = this.recentShowcaseToys.lastIndexOf(toy);
              const age = this.recentShowcaseToys.length - 1 - lastIdx;
              score += age * 6;
            }
          } else {
            const priorityIdx = CURATED_SHOWCASE_TOYS_V7.indexOf(toy);
            if (priorityIdx >= 0) {
              score +=
                (mixSeed32(req.deterministicSeed! ^ Math.imul(priorityIdx + 1, 0x45d9f3b)) % 13) * 6;
            }
          }

          if (!isSeededMode) {
            score += c.difficulty * 2;
          }
          if (score > bestScore) {
            bestScore = score;
            chosenClue = c;
            chosenToy = toy;
          }
        }
      }

      chosenCardStyle =
        chosenClue.cardStyle && VALID_CARD_STYLE_SET.has(chosenClue.cardStyle)
          ? chosenClue.cardStyle
          : 'CLASSIC_CUE';
    }

    if (!req.preferredToyId && !req.forceClassicFourChoice && !req.forceShowcaseBonus && !isSeededMode) {
      this.defaultCadenceCounter += 1;
    }

    const resolvedClue: ClueRecordV7 =
      chosenClue.cardStyle === chosenCardStyle
        ? chosenClue
        : { ...chosenClue, cardStyle: chosenCardStyle };

    if (req.markAsSeen !== false) {
      if (!isSeededMode) {
        this.seenLedger.markSeen(resolvedClue.qid, true);
      }
      this.recentToys.push(chosenToy);
      if (this.recentToys.length > 12) this.recentToys.shift();
      if (chosenToy === 'TOY_01_KNIFE_SWITCH') {
        this.classicDrawCounter += 1;
        this.recentCardStyles.push(chosenCardStyle);
        if (this.recentCardStyles.length > 8) this.recentCardStyles.shift();
      } else {
        this.showcaseRotationCursor += 1;
        this.recentShowcaseToys.push(chosenToy);
        if (this.recentShowcaseToys.length > 12) this.recentShowcaseToys.shift();
      }
      this.sessionEntities.push(resolvedClue.canonicalEntityKey);
      if (this.sessionEntities.length > 180) this.sessionEntities.shift();
    }

    return {
      clue: resolvedClue,
      selectedToy: chosenToy,
      selectedCardStyle: chosenCardStyle,
    };
  }

  public getTelemetry(): CorpusTelemetryV7 {
    return {
      loadedCluesCount: this.cluesByQid.size,
      totalManifestCount: Math.max(this.totalManifestCount, this.cluesByQid.size),
      seenCount: this.seenLedger.getSeenCount(),
      shardsLoaded: Array.from(this.loadedShards),
    };
  }

  public async resetSeenHistory(): Promise<void> {
    this.sessionEntities.length = 0;
    this.recentToys.length = 0;
    this.recentShowcaseToys.length = 0;
    this.recentCardStyles.length = 0;
    this.defaultCadenceCounter = 0;
    this.classicDrawCounter = 0;
    this.showcaseRotationCursor = 0;
    await this.seenLedger.reset(true);
  }
}

export const ALL_SUPPORTED_TOYS_V7 = ALL_14_TOYS;
