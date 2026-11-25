// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/corpus/CorpusManagerV7.ts`
// Zero-Repeat Bitset Ledger + 25-Match Entity Cooldown + Step-0 Difficulty Cap
// + Strict 75% Classic 4-Option / 25% TV Showcase Format Director
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

/** Curated top-fun 1966 TV Showcase formats for the 25% special bonus turns. */
export const CURATED_SHOWCASE_TOYS_V7: readonly ToyIdV7[] = [
  'TOY_03_VERNIER_DIAL',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_11_MISSING_VOWELS_WHEEL',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_14_FOUR_SHUTTER_REEL',
  'TOY_08_CHRONOLOGY_RAIL',
];

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

const BLITZ_SET = new Set<ToyIdV7>(BLITZ_LEGAL_TOYS_V7);
const CURATED_SHOWCASE_SET = new Set<ToyIdV7>(CURATED_SHOWCASE_TOYS_V7);

function mixSeed32(seed: number): number {
  let z = (seed + 0x6d2b79f5) | 0;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return (z ^ (z >>> 14)) >>> 0;
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
  private readonly byCategory = new Map<CategoryIdV7, ClueRecordV7[]>();
  private readonly loadedShards = new Set<string>();
  private readonly pendingFetches = new Map<string, Promise<void>>();
  private readonly recentToys: ToyIdV7[] = [];
  private readonly recentShowcaseToys: ToyIdV7[] = [];
  private readonly sessionEntities: string[] = [];
  private defaultCadenceCounter = 0;
  private totalManifestCount = 6578;
  private bootPromise: Promise<void> | null = null;

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
      await this.loadShard('boot_pack.json');
      // Warm Season 1 immediately in background, followed by Seasons 2-4
      void this.warmSeasonShards();
    })();
    return this.bootPromise;
  }

  public async warmSeasonShards(prioritizeSeason?: 1 | 2 | 3 | 4): Promise<void> {
    const order: string[] = [];
    if (prioritizeSeason) {
      order.push(`season_${prioritizeSeason}.json`);
    }
    for (const s of ['season_1.json', 'season_2.json', 'season_3.json', 'season_4.json']) {
      if (!order.includes(s)) order.push(s);
    }
    for (const shard of order) {
      await this.loadShard(shard);
    }
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
          this.totalManifestCount = payload.totalCorpusCount;
        }
        if (Array.isArray(payload.clues)) {
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

  public ingestClues(clues: readonly ClueRecordV7[]): void {
    for (const clue of clues) {
      if (this.cluesByQid.has(clue.qid)) continue;
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
  }

  public drawClueForTurn(req: DrawClueRequestV7): DrawClueResultV7 {
    const isSeededMode = typeof req.deterministicSeed === 'number';
    const skipSeenLedger = Boolean(req.ignoreSeenLedger || isSeededMode);
    const cooldownSet = new Set<string>(
      isSeededMode
        ? [...(req.recentEntities ?? [])]
        : [...this.sessionEntities, ...(req.recentEntities ?? [])],
    );

    const catBucket = this.byCategory.get(req.category) ?? [];
    const allLoaded =
      this.cluesByQid.size > 0 ? Array.from(this.cluesByQid.values()) : EMERGENCY_SEED_CLUES;

    // Determine target input mode:
    // 1. Explicit `preferredToyId` takes top priority when provided.
    // 2. `forceClassicFourChoice` locks `TOY_01_KNIFE_SWITCH`.
    // 3. `forceShowcaseBonus` picks from `CURATED_SHOWCASE_TOYS_V7`.
    // 4. Default (omitted): strict 75% `TOY_01_KNIFE_SWITCH` / 25% `CURATED_SHOWCASE_TOYS_V7`
    //    cadence (slots 0,1,2 = Classic 4-Option; slot 3 = Curated Showcase; never back-to-back Showcase!).
    const lastToy = this.recentToys[this.recentToys.length - 1];
    let mode: 'EXPLICIT_TOY' | 'CLASSIC_FOUR_CHOICE' | 'SHOWCASE_BONUS';
    if (req.preferredToyId) {
      mode = 'EXPLICIT_TOY';
    } else if (req.forceClassicFourChoice) {
      mode = 'CLASSIC_FOUR_CHOICE';
    } else if (req.forceShowcaseBonus) {
      mode = 'SHOWCASE_BONUS';
    } else if (isSeededMode) {
      // Deterministic 75/25 split for Daily Broadcast turns when flags omitted
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

    if (mode === 'CLASSIC_FOUR_CHOICE') {
      const idx = isSeededMode
        ? mixSeed32(req.deterministicSeed! ^ 0x9e3779b9) % candidates.length
        : (this.seenLedger.getSeenCount() * 37 + this.defaultCadenceCounter * 13) %
          candidates.length;
      chosenClue = candidates[idx];
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
    } else {
      // SHOWCASE_BONUS (the curated 25% TV Bonus turns!)
      const recentShowcases = new Set(this.recentShowcaseToys.slice(-3));
      const startOffset = isSeededMode
        ? mixSeed32(req.deterministicSeed! ^ 0xc2b2ae35) % candidates.length
        : (this.seenLedger.getSeenCount() * 29 + this.recentShowcaseToys.length * 19) %
          candidates.length;

      let bestScore = -9999;
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[(i + startOffset) % candidates.length];
        const showcaseToys = c.supportedToys.filter(
          (t) => CURATED_SHOWCASE_SET.has(t) && (!req.isBlitz || BLITZ_SET.has(t)),
        );
        const usable: readonly ToyIdV7[] =
          showcaseToys.length > 0 ? showcaseToys : ['TOY_01_KNIFE_SWITCH'];

        for (const toy of usable) {
          let score = 0;
          if (CURATED_SHOWCASE_SET.has(toy)) score += 100;
          if (!isSeededMode) {
            if (toy !== lastToy) score += 30;
            if (!recentShowcases.has(toy)) score += 45;
          }
          // Prioritize tactile variety across Globe, Range Dial, Cliffhangers, Missing Vowels, Shutters, Chronology
          const priorityIdx = CURATED_SHOWCASE_TOYS_V7.indexOf(toy);
          if (priorityIdx >= 0) {
            const rotBonus = isSeededMode
              ? ((mixSeed32(req.deterministicSeed! ^ Math.imul(priorityIdx + 1, 0x45d9f3b)) % 11) * 7)
              : ((6 - priorityIdx) * 2);
            score += rotBonus;
          }
          if (!isSeededMode) {
            score += c.difficulty * 3;
          }
          if (score > bestScore) {
            bestScore = score;
            chosenClue = c;
            chosenToy = toy;
          }
        }
      }
    }

    if (!req.preferredToyId && !req.forceClassicFourChoice && !req.forceShowcaseBonus && !isSeededMode) {
      this.defaultCadenceCounter += 1;
    }

    if (req.markAsSeen !== false) {
      if (!isSeededMode) {
        this.seenLedger.markSeen(chosenClue.qid, true);
      }
      this.recentToys.push(chosenToy);
      if (this.recentToys.length > 12) this.recentToys.shift();
      if (chosenToy !== 'TOY_01_KNIFE_SWITCH') {
        this.recentShowcaseToys.push(chosenToy);
        if (this.recentShowcaseToys.length > 8) this.recentShowcaseToys.shift();
      }
      this.sessionEntities.push(chosenClue.canonicalEntityKey);
      if (this.sessionEntities.length > 180) this.sessionEntities.shift();
    }

    return { clue: chosenClue, selectedToy: chosenToy };
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
    this.defaultCadenceCounter = 0;
    await this.seenLedger.reset(true);
  }
}

export const ALL_SUPPORTED_TOYS_V7 = ALL_14_TOYS;
