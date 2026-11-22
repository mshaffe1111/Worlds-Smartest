// ============================================================================
// WORLD'S SMARTEST — MILLION-SCALE FORGE & LAZY SHARD ENGINE
// Implements docs/PITCH_BIBLE.md §6:
//   • Streams 20,165 pure-factual Tier-1 human questions + shard_manifest.json
//   • Lazily streams 929,564 verified fact-graph shard Qs (<150ms per domain)
//   • Synthesizes 50,400 deterministic Codex Dual-Ring triplets -> 1,000,129 Qs
//   • Exact 128 KB RoaringSeenTracker + 30-Q microTopicId & L0 anti-repeat guards
//   • 2PL/GRM 12-Domain IRT Skill Vector + Strict 8-City Campaign Curve + Daily Seed
// ============================================================================

import { IrtAdaptiveDirector } from './IrtAdaptiveDirector';
import { MAX_QID, RoaringSeenTracker } from './RoaringSeenTracker';
import {
  CODEX_SYNTHESIS_PER_DOMAIN,
  DeterministicRng,
  attachHeroSynthesisChain,
  decodeQuestionByQidFromChunks,
  decodeShardRawQuestion,
  fnv1a32,
  isCleanShardCandidate,
  normalizeToPrismQuestion,
  sharedCryptoRng,
  synthesizeShardCodexQuestion,
  type RngLike,
} from './ShardDecoder';
import {
  BUILTIN_TAXONOMY_SEEDS,
  type ForgeTaxonomyTree,
  type TaxonomyL0Node,
  type TaxonomyL1Node,
  type TaxonomyL2Node,
  type TaxonomySearchHit,
  type TaxonomyShardRule,
} from './TaxonomyCatalog';
import {
  CAMPAIGN_DIFFICULTY_CURVE,
  FORGE_DOMAINS,
  getCampaignStageSpec,
  type Archetype3D,
  type BriefingDifficultyPreset,
  type CampaignHubCode,
  type CampaignStageSpec,
  type DailyBroadcastPacket,
  type DomainCountEntry,
  type DomainId,
  type DomainSkillEntry,
  type ForgeDomainInfo,
  type ForgeQueryRequest,
  type ForgeUniverseCounts,
  type HeroRelicId,
  type IrtOutcomeInput,
  type IrtSkillSnapshot,
  type NarrativeTag,
  type PrismQuestion,
  type RawBossChainSpec,
  type RawGoldVenuePacksBundle,
  type RawQuestionRecord,
  type RawQuestionsBundle,
  type ShardChunkData,
  type ShardChunkTable,
  type ShardManifest,
  type ShardTableTypeSpec,
} from './types';

const DAILY_BROADCAST_SALT = 'WS_MERIDIAN_GLOBAL_FEED_V4';
const EPOCH_DAY_MS = 86_400_000;
const MERIDIAN_LAUNCH_EPOCH_MS = Date.UTC(2026, 0, 1);

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Built-in emergency Geneva Gold seed so synchronous boot calls never fail pre-fetch */
const BOOTSTRAP_GENEVA_SEED: ReadonlyArray<RawQuestionRecord> = [
  {
    qid: 1,
    l0Domain: 8,
    l1Category: 'International Organizations',
    l2Subcategory: 'Humanitarian Law',
    microTopicId: 'ch_red_cross_emblem',
    regions: ['CH', 'GLOBAL'],
    narrativeTags: ['SOVEREIGN_BLOC'],
    tone: 'PRESTIGE',
    irtB: -0.6,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      "Founded in Geneva in 1863, which humanitarian organization reversed the Swiss flag's colors for its emblem?",
    answerCorrect: 'Red Cross',
    distractors: [
      { text: 'Doctors Without Borders', plausibility: 0.82 },
      { text: 'Amnesty International', plausibility: 0.62 },
      { text: 'World Health Org.', plausibility: 0.74 },
    ],
    clues: [
      'Henry Dunant co-founded it after witnessing the 1859 Battle of Solferino.',
      'Its symbol swaps white-on-crimson into a crimson medical cross on white.',
    ],
    glyphHint: 'scales',
    whyExplanation:
      'Founded in Geneva in 1863, the International Committee of the Red Cross inverted the Swiss flag to honor Switzerland and mark battlefield neutrality.',
  },
  {
    qid: 7,
    l0Domain: 2,
    l1Category: 'European Geography',
    l2Subcategory: 'Alpine Peaks',
    microTopicId: 'ch_matterhorn',
    regions: ['CH', 'GLOBAL'],
    narrativeTags: ['AGORA_CIVIC'],
    tone: 'WITTY',
    irtB: -1.1,
    irtA: 1.15,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Which iconic pyramid-shaped Alpine peak straddles the Swiss-Italian border overlooking the car-free town of Zermatt?',
    answerCorrect: 'Matterhorn',
    distractors: [
      { text: 'Mont Blanc', plausibility: 0.84 },
      { text: 'Eiger', plausibility: 0.75 },
      { text: 'Jungfrau', plausibility: 0.68 },
    ],
    clues: [
      'Its four-faced pyramidal silhouette long graced Toblerone chocolate boxes.',
      'Standing 4,478 m tall, its name ends in the German word for peak or horn.',
    ],
    glyphHint: 'globe',
    whyExplanation:
      'Rising 4,478 meters above Zermatt, the Matterhorn was sculpted by four converging glaciers into one of the most recognizable peaks on Earth.',
  },
  {
    qid: 5,
    l0Domain: 1,
    l1Category: 'Physics',
    l2Subcategory: 'Particle Physics',
    microTopicId: 'ch_cern_lhc',
    regions: ['CH', 'GLOBAL'],
    narrativeTags: ['HORIZON_TECH', 'SOVEREIGN_BLOC'],
    tone: 'PRESTIGE',
    irtB: -0.45,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      "Beneath the Franco-Swiss border near Geneva lies CERN's 27-kilometer particle accelerator ring. What is its name?",
    answerCorrect: 'Large Hadron Collider',
    distractors: [
      { text: 'Tevatron Ring', plausibility: 0.78 },
      { text: 'Fermilab Synchrotron', plausibility: 0.72 },
      { text: 'Superconducting Loop', plausibility: 0.65 },
    ],
    clues: [
      'Its proton collisions confirmed the Higgs boson in July 2012.',
      'Its three-word name is famous worldwide by the initials LHC.',
    ],
    glyphHint: 'atom',
    whyExplanation:
      'Buried 100 meters below the Geneva borderlands, the 27 km Large Hadron Collider accelerates protons to 99.999999% of light speed.',
  },
  {
    qid: 4,
    l0Domain: 0,
    l1Category: 'Modern History',
    l2Subcategory: 'International Law',
    microTopicId: 'ch_first_geneva_convention',
    regions: ['CH', 'GLOBAL'],
    narrativeTags: ['SOVEREIGN_BLOC'],
    tone: 'PRESTIGE',
    irtB: -0.4,
    irtA: 1.3,
    freshness: 'EVERGREEN',
    archetype: 'CALIBRATOR_DIAL',
    prompt:
      'In what year was the First Geneva Convention signed, establishing modern international humanitarian law?',
    answerCorrect: '1864 CE',
    clues: [
      'Signed one year after the Red Cross formed, during the U.S. Civil War.',
      'Twelve European states ratified the medical neutrality treaty in the 1860s.',
    ],
    glyphHint: 'compass',
    whyExplanation:
      'On August 22, 1864, twelve European nations signed the First Geneva Convention, guaranteeing protection for wounded soldiers and medical personnel in war.',
    calibratorExt: {
      exactVal: 1864,
      unit: 'CE',
      minVal: 1780,
      maxVal: 1960,
      step: 1,
    },
    heroRelicId: 'meridian_astrolabe',
  },
];

export interface ForgeEngineOptions {
  dataBaseUrl?: string;
  seenTracker?: RoaringSeenTracker;
  irtDirector?: IrtAdaptiveDirector;
}

export class ForgeEngine {
  public readonly seenTracker: RoaringSeenTracker;
  public readonly irtDirector: IrtAdaptiveDirector;

  private dataBaseUrl: string;
  private initialized = false;
  private initPromise: Promise<ForgeUniverseCounts> | null = null;

  private tier1Questions: RawQuestionRecord[] = [];
  private byQid: Map<number, RawQuestionRecord> = new Map();
  private byDomain: Map<DomainId, RawQuestionRecord[]> = new Map();
  private byArchetype: Map<Archetype3D, RawQuestionRecord[]> = new Map();
  private byRegion: Map<string, RawQuestionRecord[]> = new Map();

  private shardManifest: ShardManifest | null = null;
  private extraShardTypes: Record<string, ShardTableTypeSpec> = {};
  private subcatShardBonusByDomain: Map<DomainId, number> = new Map();
  private subcatQidRangesByDomain: Map<DomainId, Array<[number, number]>> = new Map();
  private loadedShardsByDomain: Map<DomainId, ShardChunkData[]> = new Map();
  private primaryDomainShardLoaded: Set<DomainId> = new Set();
  private loadedExtraShardFiles: Map<string, ShardChunkData> = new Map();
  private pendingExtraFileLoads: Map<string, Promise<ShardChunkData | null>> = new Map();
  private pendingDomainLoads: Map<DomainId, Promise<ShardChunkData[]>> = new Map();
  private shardLoadListeners: Set<(domainId: DomainId, count: number) => void> = new Set();
  private bossChainsByHub: Map<string, RawBossChainSpec[]> = new Map();
  private goldVenuePackLoaded = false;

  private rawTaxonomyJson: Record<string, unknown> | null = null;
  private tableRuleRowCache: WeakMap<ShardChunkTable, Map<string, number[]>> = new WeakMap();

  constructor(options: ForgeEngineOptions = {}) {
    this.dataBaseUrl = (options.dataBaseUrl ?? '/data').replace(/\/+$/, '');
    this.seenTracker = options.seenTracker ?? new RoaringSeenTracker();
    this.irtDirector = options.irtDirector ?? new IrtAdaptiveDirector();
    this.indexTier1Records(BOOTSTRAP_GENEVA_SEED);
  }

  // --------------------------------------------------------------------------
  // Startup & Lazy Domain Shard Streaming (<150ms on-demand)
  // --------------------------------------------------------------------------

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initializes `ForgeEngine` by loading `public/data/questions.json` (20,165 pure-factual
   * human questions) + `public/data/shards/shard_manifest.json` (929,564 shard metadata).
   * Safe to call multiple times; concurrent calls share the same Promise.
   */
  public async init(customBaseUrl?: string): Promise<ForgeUniverseCounts> {
    if (customBaseUrl) {
      this.dataBaseUrl = customBaseUrl.replace(/\/+$/, '');
    }
    if (this.initialized) {
      return this.getDomainCounts();
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const [questionsResult, manifestResult, goldPackResult, taxonomyResult] =
        await Promise.allSettled([
          this.fetchTier1Questions(),
          this.fetchJson<ShardManifest>(`${this.dataBaseUrl}/shards/shard_manifest.json`),
          this.fetchJson<RawGoldVenuePacksBundle | RawQuestionRecord[]>(
            `${this.dataBaseUrl}/gold_venue_packs.json`,
          ),
          this.fetchJson<Record<string, unknown>>(
            `${this.dataBaseUrl}/shards/taxonomy_tree.json`,
          ),
        ]);

      if (questionsResult.status === 'fulfilled' && questionsResult.value.length > 0) {
        this.indexTier1Records(questionsResult.value);
      }
      if (goldPackResult.status === 'fulfilled' && goldPackResult.value) {
        this.ingestGoldVenuePacksData(goldPackResult.value);
      }
      if (
        manifestResult.status === 'fulfilled' &&
        manifestResult.value &&
        manifestResult.value.schemaVersion === 'WS_SHARD_V1'
      ) {
        this.shardManifest = manifestResult.value;
      }
      if (taxonomyResult.status === 'fulfilled' && taxonomyResult.value) {
        this.ingestTaxonomyTreeJson(taxonomyResult.value);
      }

      this.initialized = true;
      return this.getDomainCounts();
    })();

    return this.initPromise;
  }

  /**
   * Loads (or hot-reloads) Wave-2 `public/data/gold_venue_packs.json` (`600+` Bespoke Host-Country
   * Gold Venue Questions + `24` bespoke 3-step `HERO_ARTIFACT_SYNTHESIS` Boss chains).
   */
  public async loadGoldVenuePacks(customUrl?: string): Promise<number> {
    if (this.goldVenuePackLoaded && !customUrl) {
      return this.bossChainsByHub.size;
    }
    try {
      const url = customUrl ?? `${this.dataBaseUrl}/gold_venue_packs.json`;
      const bundle = await this.fetchJson<RawGoldVenuePacksBundle | RawQuestionRecord[]>(url);
      return this.ingestGoldVenuePacksData(bundle);
    } catch {
      return 0;
    }
  }

  public ingestGoldVenuePacksData(
    bundle: RawGoldVenuePacksBundle | RawQuestionRecord[],
  ): number {
    let addedCount = 0;
    let nextGoldQid = 50_000;
    const allocCleanQid = (candidateQid?: number): number => {
      if (
        typeof candidateQid === 'number' &&
        candidateQid >= 1 &&
        candidateQid < 60_000 &&
        !this.byQid.has(candidateQid)
      ) {
        return candidateQid;
      }
      while (this.byQid.has(nextGoldQid)) {
        nextGoldQid++;
      }
      return nextGoldQid++;
    };

    const appendRecord = (raw: RawQuestionRecord, fallbackHub?: string): void => {
      if (!raw || !raw.prompt || !raw.answerCorrect) return;
      const qid = allocCleanQid(raw.qid);
      const regions =
        Array.isArray(raw.regions) && raw.regions.length > 0
          ? raw.regions
          : fallbackHub
            ? [fallbackHub.toUpperCase(), 'GLOBAL']
            : ['GLOBAL'];
      const enriched: RawQuestionRecord = {
        ...raw,
        qid,
        regions,
      };
      this.tier1Questions.push(enriched);
      this.byQid.set(qid, enriched);
      const dom = clamp(Math.trunc(enriched.l0Domain ?? 0), 0, 11) as DomainId;
      this.byDomain.get(dom)?.push(enriched);
      const arch: Archetype3D = enriched.archetype ?? 'SIGHTLINE_LOCK';
      if (!this.byArchetype.has(arch)) this.byArchetype.set(arch, []);
      this.byArchetype.get(arch)?.push(enriched);
      for (const reg of regions) {
        let rList = this.byRegion.get(reg);
        if (!rList) {
          rList = [];
          this.byRegion.set(reg, rList);
        }
        rList.push(enriched);
      }
      addedCount++;
    };

    if (Array.isArray(bundle)) {
      for (const q of bundle) appendRecord(q);
      this.goldVenuePackLoaded = addedCount > 0;
      return addedCount;
    }

    if (Array.isArray(bundle.questions)) {
      for (const q of bundle.questions) appendRecord(q);
    }
    const venueMaps = bundle.venues ?? bundle.packs;
    if (venueMaps && typeof venueMaps === 'object') {
      for (const [hubKey, list] of Object.entries(venueMaps)) {
        if (Array.isArray(list)) {
          for (const q of list) appendRecord(q, hubKey);
        }
      }
    }

    const chains = bundle.bossChains ?? bundle.boss_chains;
    if (Array.isArray(chains)) {
      for (const chain of chains) {
        if (!chain || !Array.isArray(chain.steps) || chain.steps.length < 3) continue;
        const hubNorm = String(chain.hub ?? 'global').trim().toLowerCase();
        const hydratedSteps = chain.steps.slice(0, 3).map((st) => {
          const stepQid = allocCleanQid(st.qid);
          const hydrated: RawQuestionRecord = {
            ...st,
            qid: stepQid,
            archetype: 'HERO_ARTIFACT_SYNTHESIS',
            heroRelicId: (chain.relicId as HeroRelicId) ?? st.heroRelicId,
            regions:
              Array.isArray(st.regions) && st.regions.length > 0
                ? st.regions
                : [hubNorm.toUpperCase(), 'GLOBAL'],
          };
          this.byQid.set(stepQid, hydrated);
          return hydrated;
        });
        const cleanChain: RawBossChainSpec = {
          ...chain,
          hub: hubNorm,
          steps: hydratedSteps,
        };
        const list = this.bossChainsByHub.get(hubNorm) ?? [];
        list.push(cleanChain);
        this.bossChainsByHub.set(hubNorm, list);
      }
    }

    if (addedCount > 0 || this.bossChainsByHub.size > 0) {
      this.goldVenuePackLoaded = true;
    }
    return addedCount;
  }

  public isReady(): boolean {
    return this.initialized;
  }

  public getShardManifest(): ShardManifest | null {
    return this.shardManifest;
  }

  public isDomainShardLoaded(domainId: DomainId): boolean {
    const chunks = this.loadedShardsByDomain.get(domainId);
    return Boolean(chunks && chunks.length > 0);
  }

  public onShardLoaded(listener: (domainId: DomainId, questionCount: number) => void): () => void {
    this.shardLoadListeners.add(listener);
    return () => {
      this.shardLoadListeners.delete(listener);
    };
  }

  /**
   * Lazily fetches `public/data/shards/domain_<d>.json` (and multi-part chunks like
   * `domain_11_0.json`, `domain_11_1.json`) in <150ms when a domain is queried in
   * Briefing Room, Archive Descent Endless, or deep Campaign.
   */
  public async ensureDomainShardLoaded(domainId: DomainId): Promise<ShardChunkData[]> {
    const d = clamp(Math.trunc(domainId), 0, 11) as DomainId;
    if (this.primaryDomainShardLoaded.has(d)) {
      return this.loadedShardsByDomain.get(d) ?? [];
    }

    const inflight = this.pendingDomainLoads.get(d);
    if (inflight) {
      return inflight;
    }

    if (!this.shardManifest && !this.initialized) {
      await this.init();
    }
    if (!this.shardManifest) {
      return [];
    }

    const domEntry = this.shardManifest.domains.find((entry) => entry.l0Domain === d);
    if (!domEntry || !Array.isArray(domEntry.files) || domEntry.files.length === 0) {
      return [];
    }

    const loadTask = (async () => {
      try {
        const chunks = await Promise.all(
          domEntry.files.map((f) =>
            this.fetchJson<ShardChunkData>(`${this.dataBaseUrl}/shards/${f.path}`),
          ),
        );
        const validChunks = chunks.filter(
          (c): c is ShardChunkData => Boolean(c && Array.isArray(c.t) && Array.isArray(c.p)),
        );
        if (validChunks.length > 0) {
          this.primaryDomainShardLoaded.add(d);
          const alreadyAttached = (this.loadedShardsByDomain.get(d) ?? []).filter(
            (c) => !validChunks.includes(c),
          );
          const merged = [...validChunks, ...alreadyAttached];
          this.loadedShardsByDomain.set(d, merged);
          for (const cb of this.shardLoadListeners) {
            cb(d, domEntry.questions);
          }
          return merged;
        }
        return validChunks;
      } catch {
        return [];
      } finally {
        this.pendingDomainLoads.delete(d);
      }
    })();

    this.pendingDomainLoads.set(d, loadTask);
    return loadTask;
  }

  public async ensureDomainsLoaded(domainIds: ReadonlyArray<DomainId>): Promise<void> {
    const unique = Array.from(
      new Set(domainIds.map((d) => clamp(Math.trunc(d), 0, 11) as DomainId)),
    );
    await Promise.all(unique.map((d) => this.ensureDomainShardLoaded(d)));
  }

  /** Lazily loads an individual per-topic specialist shard file (`subcat_baseball.json`, `domain_subcats_5.json`, etc.) in <80ms */
  public async ensureExtraShardFileLoaded(
    filePath: string,
    domainId: DomainId,
  ): Promise<ShardChunkData | null> {
    const cleanPath = filePath.replace(/^\/+/, '').replace(/^data\/shards\//, '').replace(/^shards\//, '');
    if (!cleanPath) return null;
    const cached = this.loadedExtraShardFiles.get(cleanPath);
    if (cached) return cached;

    const inflight = this.pendingExtraFileLoads.get(cleanPath);
    if (inflight) return inflight;

    const task = (async () => {
      try {
        const chunk = await this.fetchJson<ShardChunkData>(
          `${this.dataBaseUrl}/shards/${cleanPath}`,
        );
        if (chunk && Array.isArray(chunk.t) && Array.isArray(chunk.p)) {
          if (chunk.types && typeof chunk.types === 'object') {
            Object.assign(this.extraShardTypes, chunk.types);
          }
          this.loadedExtraShardFiles.set(cleanPath, chunk);
          const d = clamp(Math.trunc(chunk.d ?? domainId), 0, 11) as DomainId;
          const existing = this.loadedShardsByDomain.get(d) ?? [];
          if (!existing.includes(chunk)) {
            existing.push(chunk);
            this.loadedShardsByDomain.set(d, existing);
          }
          return chunk;
        }
        return null;
      } catch {
        return null;
      } finally {
        this.pendingExtraFileLoads.delete(cleanPath);
      }
    })();

    this.pendingExtraFileLoads.set(cleanPath, task);
    return task;
  }

  /** Ensures both the parent L0 domain shard AND any specialist L1/L2 topic shard files are loaded */
  public async ensureTopicShardsLoaded(params: {
    domains?: ReadonlyArray<DomainId>;
    l1SubcategoryId?: string;
    l2TopicId?: string;
  }): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
    const taxFilter = this.resolveTaxonomyFilter(params.l1SubcategoryId, params.l2TopicId);
    if (taxFilter) {
      await Promise.all([
        this.ensureDomainShardLoaded(taxFilter.domainId),
        ...taxFilter.shardFiles.map((sf) =>
          this.ensureExtraShardFileLoaded(sf, taxFilter.domainId),
        ),
      ]);
      return;
    }
    if (params.domains && params.domains.length > 0) {
      await this.ensureDomainsLoaded(params.domains);
    }
  }

  /** Non-blocking fire-and-forget shard warm-up for synchronous callers */
  public prefetchDomainShards(domainIds: ReadonlyArray<DomainId>): void {
    for (const d of domainIds) {
      if (!this.isDomainShardLoaded(d)) {
        void this.ensureDomainShardLoaded(d);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3-Level Subcategory Taxonomy (`L0 -> L1 -> L2`) & Instant Search (#181/#183)
  // --------------------------------------------------------------------------

  public async loadTaxonomyTree(customUrl?: string): Promise<ForgeTaxonomyTree> {
    try {
      const url = customUrl ?? `${this.dataBaseUrl}/shards/taxonomy_tree.json`;
      const raw = await this.fetchJson<Record<string, unknown>>(url);
      if (raw && typeof raw === 'object') {
        this.ingestTaxonomyTreeJson(raw);
      }
    } catch {
      // Built-in 3-level taxonomy remains active if file not yet staged
    }
    return this.getTaxonomyTree();
  }

  public ingestTaxonomyTreeJson(raw: Record<string, unknown>): void {
    this.rawTaxonomyJson = raw;
    const rawTypes = (raw.types ?? raw.subcatTypes ?? raw.tableSpecs) as
      | Record<string, ShardTableTypeSpec>
      | undefined;
    if (rawTypes && typeof rawTypes === 'object') {
      Object.assign(this.extraShardTypes, rawTypes);
    }

    this.subcatShardBonusByDomain.clear();
    this.subcatQidRangesByDomain.clear();

    const subcatFilesMap = (raw.subcatFiles ?? raw.specialistFiles) as
      | Record<string, Array<string | { path?: string; questions?: number; baseQid?: number; qidEnd?: number }>>
      | undefined;
    if (subcatFilesMap && typeof subcatFilesMap === 'object') {
      for (const [domKey, entries] of Object.entries(subcatFilesMap)) {
        const d = clamp(Math.trunc(Number(domKey)), 0, 11) as DomainId;
        if (!Array.isArray(entries)) continue;
        let qSum = 0;
        const ranges: Array<[number, number]> = [];
        for (const entry of entries) {
          if (entry && typeof entry === 'object') {
            qSum += Math.max(0, Number(entry.questions ?? 0));
            if (typeof entry.baseQid === 'number' && typeof entry.qidEnd === 'number') {
              ranges.push([entry.baseQid, entry.qidEnd]);
            }
          }
        }
        if (qSum > 0) this.subcatShardBonusByDomain.set(d, qSum);
        if (ranges.length > 0) this.subcatQidRangesByDomain.set(d, ranges);
      }
    }

    // Also inspect per-domain specialist counts inside raw.domains if present
    const rawDoms = raw.domains as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(rawDoms)) {
      for (const rd of rawDoms) {
        const d = clamp(Math.trunc(Number(rd.l0Domain ?? rd.domainId ?? 0)), 0, 11) as DomainId;
        const subQs = Number(rd.specialistQuestions ?? rd.subcatQuestions ?? 0);
        if (subQs > 0 && !this.subcatShardBonusByDomain.has(d)) {
          this.subcatShardBonusByDomain.set(d, subQs);
        }
      }
    }
  }

  /**
   * Returns the complete 3-Level Drill-Down Taxonomy (`12 L0 -> L1 -> L2`, e.g.
   * `Sports & Games -> Sports -> Baseball`) with live verified & unseen question counts!
   */
  public getTaxonomyTree(): ForgeTaxonomyTree {
    const universe = this.getDomainCounts();
    const rawDoms = Array.isArray(this.rawTaxonomyJson?.domains)
      ? (this.rawTaxonomyJson!.domains as Array<Record<string, unknown>>)
      : null;

    let totalL1 = 0;
    let totalL2 = 0;

    const parseShardRules = (rawRules: unknown): TaxonomyShardRule[] => {
      if (!Array.isArray(rawRules)) return [];
      const out: TaxonomyShardRule[] = [];
      for (const item of rawRules) {
        if (!item || typeof item !== 'object') continue;
        const r = item as Record<string, unknown>;
        const typeStr = String(r.type ?? r.shardType ?? r.tableType ?? '').trim();
        if (!typeStr) continue;
        out.push({
          type: typeStr,
          filterCol:
            r.filterCol !== undefined && r.filterCol !== null
              ? (r.filterCol as number | string)
              : undefined,
          filterValues: Array.isArray(r.filterValues)
            ? r.filterValues.map((v) => String(v))
            : undefined,
          matchMode: r.matchMode === 'contains' ? 'contains' : 'exact',
          allowedAngleIds: Array.isArray(r.allowedAngleIds)
            ? r.allowedAngleIds.map((a) => String(a))
            : undefined,
        });
      }
      return out;
    };

    const parseShardFiles = (nodeObj: Record<string, unknown>): string[] => {
      const files: string[] = [];
      if (typeof nodeObj.shardFile === 'string' && nodeObj.shardFile.trim()) {
        files.push(nodeObj.shardFile.trim());
      }
      if (Array.isArray(nodeObj.shardFiles)) {
        for (const f of nodeObj.shardFiles) {
          if (typeof f === 'string' && f.trim() && !files.includes(f.trim())) {
            files.push(f.trim());
          }
        }
      }
      return files;
    };

    const domains: TaxonomyL0Node[] = FORGE_DOMAINS.map((meta) => {
      const d = meta.id;
      const domCounts = universe.byDomain[d];
      const rawDom = rawDoms?.find(
        (x) => Number(x.l0Domain ?? x.domainId ?? -1) === d,
      );
      const seedDom = BUILTIN_TAXONOMY_SEEDS.find((s) => s.domainId === d);
      const domShardFiles = rawDom ? parseShardFiles(rawDom) : [];

      const rawL1List = rawDom
        ? ((rawDom.l1Subcategories ?? rawDom.subcategories ?? rawDom.l1) as
            | Array<Record<string, unknown>>
            | undefined)
        : undefined;

      let l1Nodes: TaxonomyL1Node[] = [];

      if (Array.isArray(rawL1List) && rawL1List.length > 0) {
        l1Nodes = rawL1List.map((rawL1, l1Idx) => {
          const l1Id = String(rawL1.id ?? `d${d}_l1_${l1Idx}`);
          const l1Name = String(rawL1.name ?? rawL1.label ?? rawL1.title ?? `Category ${l1Idx + 1}`);
          const l1Files = [...domShardFiles, ...parseShardFiles(rawL1)];
          const l1Rules = parseShardRules(rawL1.shardRules ?? rawL1.predicates);
          const l1Keywords = Array.isArray(rawL1.keywords)
            ? rawL1.keywords.map((k) => String(k).toLowerCase())
            : [l1Name.toLowerCase()];

          const rawL2List = (rawL1.l2Topics ?? rawL1.topics ?? rawL1.l2) as
            | Array<Record<string, unknown>>
            | undefined;

          const l2Nodes: TaxonomyL2Node[] = Array.isArray(rawL2List)
            ? rawL2List.map((rawL2, l2Idx) => {
                const l2Id = String(rawL2.id ?? `${l1Id}_${l2Idx}`);
                const l2Name = String(rawL2.name ?? rawL2.label ?? rawL2.title ?? `Topic ${l2Idx + 1}`);
                const qidRanges: Array<[number, number]> = Array.isArray(rawL2.qidRanges)
                  ? (rawL2.qidRanges as Array<[number, number]>)
                  : [];
                const verCount = Math.max(
                  50,
                  Number(rawL2.questionCount ?? rawL2.verifiedCount ?? rawL2.questions ?? 1200),
                );
                let seenInTopic = 0;
                for (const [lo, hi] of qidRanges) {
                  seenInTopic += this.seenTracker.countSeenInRange(lo, hi);
                }
                const l2Files = Array.from(new Set([...l1Files, ...parseShardFiles(rawL2)]));
                const l2Rules = parseShardRules(rawL2.shardRules ?? rawL2.predicates);
                return {
                  id: l2Id,
                  domainId: d,
                  l1Id,
                  l1Name,
                  name: l2Name,
                  breadcrumb: `${meta.name} › ${l1Name} › ${l2Name}`,
                  medallionUrl: meta.medallionUrl,
                  accentHex: meta.accentHex,
                  verifiedCount: verCount,
                  unseenCount: Math.max(0, verCount - seenInTopic),
                  keywords: Array.isArray(rawL2.keywords)
                    ? rawL2.keywords.map((k) => String(k).toLowerCase())
                    : [l2Name.toLowerCase()],
                  shardRules: l2Rules.length > 0 ? l2Rules : l1Rules,
                  qidRanges,
                  shardFiles: l2Files,
                };
              })
            : [];

          const l1Sum = l2Nodes.reduce((s, item) => s + item.verifiedCount, 0);
          const l1Ver = Math.max(
            l1Sum,
            Number(rawL1.questionCount ?? rawL1.verifiedCount ?? rawL1.questions ?? l1Sum),
          );
          const l1Unseen = Math.min(
            l1Ver,
            l2Nodes.reduce((s, item) => s + item.unseenCount, 0) || l1Ver,
          );
          return {
            id: l1Id,
            domainId: d,
            domainName: meta.name,
            name: l1Name,
            breadcrumb: `${meta.name} › ${l1Name}`,
            medallionUrl: meta.medallionUrl,
            accentHex: meta.accentHex,
            verifiedCount: l1Ver,
            unseenCount: l1Unseen,
            keywords: l1Keywords,
            shardRules:
              l1Rules.length > 0
                ? l1Rules
                : l2Nodes.flatMap((child) => child.shardRules),
            shardFiles: Array.from(
              new Set([...l1Files, ...l2Nodes.flatMap((child) => child.shardFiles)]),
            ),
            l2Topics: l2Nodes,
          };
        });
      } else if (seedDom) {
        l1Nodes = seedDom.l1Subcategories.map((seedL1) => {
          const l2Nodes: TaxonomyL2Node[] = seedL1.l2Topics.map((seedL2) => {
            const verCount = seedL2.estimatedBaseCount;
            return {
              id: seedL2.id,
              domainId: d,
              l1Id: seedL1.id,
              l1Name: seedL1.name,
              name: seedL2.name,
              breadcrumb: `${meta.name} › ${seedL1.name} › ${seedL2.name}`,
              medallionUrl: meta.medallionUrl,
              accentHex: meta.accentHex,
              verifiedCount: verCount,
              unseenCount: verCount,
              keywords: seedL2.keywords,
              shardRules: seedL2.shardRules,
              qidRanges: seedL2.qidRanges ?? [],
              shardFiles: seedL2.shardFiles ?? [],
            };
          });
          const l1Ver = l2Nodes.reduce((s, n) => s + n.verifiedCount, 0);
          return {
            id: seedL1.id,
            domainId: d,
            domainName: meta.name,
            name: seedL1.name,
            breadcrumb: `${meta.name} › ${seedL1.name}`,
            medallionUrl: meta.medallionUrl,
            accentHex: meta.accentHex,
            verifiedCount: l1Ver,
            unseenCount: l1Ver,
            keywords: seedL1.keywords,
            shardRules:
              seedL1.shardRules && seedL1.shardRules.length > 0
                ? seedL1.shardRules
                : l2Nodes.flatMap((n) => n.shardRules),
            shardFiles: seedL1.shardFiles ?? [],
            l2Topics: l2Nodes,
          };
        });
      }

      totalL1 += l1Nodes.length;
      for (const l1 of l1Nodes) {
        totalL2 += l1.l2Topics.length;
      }

      const domVer = Math.max(
        domCounts?.verifiedCount ?? 0,
        l1Nodes.reduce((s, n) => s + n.verifiedCount, 0),
      );
      const domUnseen = Math.max(0, domVer - (domCounts?.seenInDomainEst ?? 0));

      return {
        domainId: d,
        key: meta.key,
        name: meta.name,
        shortName: meta.shortName,
        medallionUrl: meta.medallionUrl,
        accentHex: meta.accentHex,
        verifiedCount: domVer,
        totalPlayableCount: Math.max(domVer, domCounts?.totalPlayableCount ?? domVer),
        unseenCount: domUnseen,
        l1Subcategories: l1Nodes,
      };
    });

    const totalVer = Math.max(
      universe.verifiedUniqueTotal,
      domains.reduce((s, d) => s + d.verifiedCount, 0),
    );
    const totalPlay = Math.max(
      universe.totalPlayableCount,
      domains.reduce((s, d) => s + d.totalPlayableCount, 0),
    );

    return {
      schemaVersion: String(this.rawTaxonomyJson?.schemaVersion ?? 'WS_TAXONOMY_V1'),
      hydratedFromDisk: Boolean(this.rawTaxonomyJson),
      totalVerifiedQuestions: totalVer,
      totalPlayableQuestions: totalPlay,
      totalL1Count: totalL1,
      totalL2Count: totalL2,
      domains,
    };
  }

  /** Instant substring & keyword filter across all L0, L1, and L2 taxonomy nodes (e.g. "Baseball") */
  public searchTaxonomy(query: string): TaxonomySearchHit[] {
    const q = query.trim().toLowerCase();
    const tree = this.getTaxonomyTree();
    if (!q) {
      return tree.domains.flatMap((dom) =>
        dom.l1Subcategories.flatMap((l1) =>
          l1.l2Topics.map((l2) => ({
            level: 'L2' as const,
            domainId: dom.domainId,
            l1Id: l1.id,
            l2Id: l2.id,
            l1SubcategoryId: l1.id,
            l2TopicId: l2.id,
            name: l2.name,
            breadcrumb: l2.breadcrumb,
            medallionUrl: dom.medallionUrl,
            accentHex: dom.accentHex,
            verifiedCount: l2.verifiedCount,
            unseenCount: l2.unseenCount,
          })),
        ),
      );
    }

    const scored: Array<{ hit: TaxonomySearchHit; score: number }> = [];
    for (const dom of tree.domains) {
      if (dom.name.toLowerCase().includes(q) || dom.key.toLowerCase().includes(q)) {
        scored.push({
          score: dom.name.toLowerCase().startsWith(q) ? 85 : 60,
          hit: {
            level: 'L0',
            domainId: dom.domainId,
            name: dom.name,
            breadcrumb: dom.name,
            medallionUrl: dom.medallionUrl,
            accentHex: dom.accentHex,
            verifiedCount: dom.verifiedCount,
            unseenCount: dom.unseenCount,
          },
        });
      }
      for (const l1 of dom.l1Subcategories) {
        if (
          l1.name.toLowerCase().includes(q) ||
          l1.keywords.some((kw) => kw.includes(q))
        ) {
          scored.push({
            score: l1.name.toLowerCase().startsWith(q) ? 92 : 72,
            hit: {
              level: 'L1',
              domainId: dom.domainId,
              l1Id: l1.id,
              l1SubcategoryId: l1.id,
              name: l1.name,
              breadcrumb: l1.breadcrumb,
              medallionUrl: dom.medallionUrl,
              accentHex: dom.accentHex,
              verifiedCount: l1.verifiedCount,
              unseenCount: l1.unseenCount,
            },
          });
        }
        for (const l2 of l1.l2Topics) {
          const nameLow = l2.name.toLowerCase();
          const exactMatch = nameLow === q;
          const prefixMatch = nameLow.startsWith(q);
          const nameMatch = nameLow.includes(q);
          const kwMatch = l2.keywords.some((kw) => kw.includes(q));
          if (nameMatch || kwMatch) {
            scored.push({
              score: exactMatch ? 120 : prefixMatch ? 105 : nameMatch ? 88 : 68,
              hit: {
                level: 'L2',
                domainId: dom.domainId,
                l1Id: l1.id,
                l2Id: l2.id,
                l1SubcategoryId: l1.id,
                l2TopicId: l2.id,
                name: l2.name,
                breadcrumb: l2.breadcrumb,
                medallionUrl: dom.medallionUrl,
                accentHex: dom.accentHex,
                verifiedCount: l2.verifiedCount,
                unseenCount: l2.unseenCount,
              },
            });
          }
        }
      }
    }

    scored.sort((a, b) => b.score - a.score || b.hit.verifiedCount - a.hit.verifiedCount);
    return scored.slice(0, 40).map((s) => s.hit);
  }

  private resolveTaxonomyFilter(
    l1SubcategoryId?: string,
    l2TopicId?: string,
  ): {
    domainId: DomainId;
    topicName: string;
    keywords: string[];
    shardRules: TaxonomyShardRule[];
    shardFiles: string[];
  } | null {
    const cleanL2 = l2TopicId?.trim().toLowerCase();
    const cleanL1 = l1SubcategoryId?.trim().toLowerCase();
    if (!cleanL2 && !cleanL1) return null;

    const tree = this.getTaxonomyTree();
    for (const dom of tree.domains) {
      for (const l1 of dom.l1Subcategories) {
        if (cleanL2) {
          const hitL2 = l1.l2Topics.find(
            (t) => t.id.toLowerCase() === cleanL2 || t.name.toLowerCase() === cleanL2,
          );
          if (hitL2) {
            return {
              domainId: dom.domainId,
              topicName: hitL2.name,
              keywords: hitL2.keywords,
              shardRules: hitL2.shardRules,
              shardFiles: hitL2.shardFiles,
            };
          }
        }
        if (
          cleanL1 &&
          (l1.id.toLowerCase() === cleanL1 || l1.name.toLowerCase() === cleanL1) &&
          !cleanL2
        ) {
          return {
            domainId: dom.domainId,
            topicName: l1.name,
            keywords: l1.keywords,
            shardRules: l1.shardRules,
            shardFiles: l1.shardFiles,
          };
        }
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Live Universe & Domain Counts (~949,729 Verified / 1,000,129 Playable QIDs)
  // --------------------------------------------------------------------------

  public getDomainCatalog(): ReadonlyArray<ForgeDomainInfo> {
    return FORGE_DOMAINS;
  }

  public getCampaignCurve(): ReadonlyArray<CampaignStageSpec> {
    return CAMPAIGN_DIFFICULTY_CURVE;
  }

  /**
   * Returns live per-domain & total verified counts across all 12 domains:
   *   • 20,165 pure-factual Tier-1 human questions
   *   • 929,564 CC0/PD/CC-BY/MIT fact-graph shard questions (= 949,729 unique verified!)
   *   • +50,400 deterministic graded Codex/Synthesis pairings (= 1,000,129 dense playable QIDs!)
   */
  public getDomainCounts(): ForgeUniverseCounts {
    const manifest = this.shardManifest;
    const hasManifest = Boolean(manifest && manifest.totalQuestions > 0);
    const byDomain: DomainCountEntry[] = FORGE_DOMAINS.map((meta) => {
      const d = meta.id;
      const tier1Count = this.byDomain.get(d)?.length ?? 0;
      const domManifest = manifest?.domains.find((m) => m.l0Domain === d);
      const subcatBonus = this.subcatShardBonusByDomain.get(d) ?? 0;
      const shardFactCount = (domManifest?.questions ?? 0) + subcatBonus;
      const verifiedCount = tier1Count + shardFactCount;
      const codexSynthesisCount = hasManifest ? CODEX_SYNTHESIS_PER_DOMAIN : 0;
      const totalPlayableCount = verifiedCount + codexSynthesisCount;

      let seenInDomainEst = 0;
      if (domManifest && domManifest.files.length > 0) {
        for (const fm of domManifest.files) {
          seenInDomainEst += this.seenTracker.countSeenInRange(fm.baseQid, fm.qidEnd);
        }
      }
      const extraRanges = this.subcatQidRangesByDomain.get(d);
      if (extraRanges) {
        for (const [lo, hi] of extraRanges) {
          seenInDomainEst += this.seenTracker.countSeenInRange(lo, hi);
        }
      }
      const tier1List = this.byDomain.get(d) ?? [];
      for (let i = 0; i < tier1List.length; i++) {
        if (this.seenTracker.hasSeen(tier1List[i].qid)) seenInDomainEst++;
      }

      return {
        domainId: d,
        key: meta.key,
        name: meta.name,
        shortName: meta.shortName,
        accentHex: meta.accentHex,
        medallionUrl: meta.medallionUrl,
        tier1HumanCount: tier1Count,
        shardFactCount,
        verifiedCount,
        codexSynthesisCount,
        totalPlayableCount,
        shardLoaded: this.isDomainShardLoaded(d),
        seenInDomainEst,
      };
    });

    const tier1HumanTotal = this.tier1Questions.length;
    const shardFactTotal = byDomain.reduce((acc, item) => acc + item.shardFactCount, 0);
    const verifiedUniqueTotal = tier1HumanTotal + shardFactTotal;
    const codexSynthesisTotal = byDomain.reduce((acc, item) => acc + item.codexSynthesisCount, 0);
    const totalPlayableCount = verifiedUniqueTotal + codexSynthesisTotal;

    const loadedShardDomains: DomainId[] = [];
    for (let d = 0 as DomainId; d < 12; d = (d + 1) as DomainId) {
      if (this.isDomainShardLoaded(d)) loadedShardDomains.push(d);
    }

    return {
      tier1HumanTotal,
      shardFactTotal,
      verifiedUniqueTotal,
      codexSynthesisTotal,
      totalPlayableCount,
      qidSpaceCapacity: MAX_QID,
      seenTotal: this.seenTracker.getSeenCount(),
      loadedShardDomains,
      byDomain,
    };
  }

  // --------------------------------------------------------------------------
  // Psychometric Mastery, Passport 12-Domain Radar & Outcome Recording
  // --------------------------------------------------------------------------

  public getSkillVector(): DomainSkillEntry[] {
    return this.irtDirector.getSkillVector();
  }

  public getSkillSnapshot(): IrtSkillSnapshot {
    return this.irtDirector.getSnapshot();
  }

  public getWeakestDomains(count = 3, exclude: ReadonlyArray<DomainId> = []): DomainId[] {
    return this.irtDirector.getWeakestDomains(count, exclude);
  }

  public pickNemesisCounterDomain(exclude: ReadonlyArray<DomainId> = []): DomainId {
    return this.irtDirector.pickNemesisCounterDomain(exclude);
  }

  /**
   * Records a resolved Prism question:
   *   1. Marks `qid` in the 128 KB `RoaringSeenTracker` + updates 30-Q `microTopicId` & L0 guards
   *   2. Updates `thetaGlobal` & `thetaDomain[0..11]` via Graded Response Model (Overclock ignored!)
   */
  public recordQuestionOutcome(
    outcome: IrtOutcomeInput & {
      microTopicId?: string;
      l2Subcategory?: string;
      markSeen?: boolean;
    },
  ): IrtSkillSnapshot {
    if (outcome.markSeen !== false) {
      const cached = this.byQid.get(outcome.qid);
      this.seenTracker.recordPlayed({
        qid: outcome.qid,
        microTopicId: outcome.microTopicId ?? cached?.microTopicId,
        l2Subcategory: outcome.l2Subcategory ?? cached?.l2Subcategory,
        l0Domain: outcome.l0Domain,
      });
    }
    return this.irtDirector.recordOutcome(outcome);
  }

  // --------------------------------------------------------------------------
  // Geneva 4-Q Prologue, Progressive Campaign, Daily Broadcast & Mode Queries
  // --------------------------------------------------------------------------

  /**
   * Returns the curated 4-Question Geneva Screening Assessment (`PITCH_BIBLE.md` §2.2):
   *   • Q1: SIGHTLINE_LOCK (Accessible Geneva/Global Gold — teaches SPIN)
   *   • Q2: SIGHTLINE_LOCK (Rich Lateral Clue Gold — teaches PEEL + Teo Mirror Leak)
   *   • Q3: SIGHTLINE_LOCK (High-conviction Gold — teaches Hold-to-Overclock + Manifesto)
   *   • Q4: CALIBRATOR_DIAL (Meridian Brass Astrolabe precision year/number estimate)
   */
  public getGenevaPrologueQuestions(seed?: number): PrismQuestion[] {
    const rng: RngLike =
      seed !== undefined ? new DeterministicRng(seed) : sharedCryptoRng;

    const usedQids = new Set<number>();
    const usedDomains = new Set<number>();

    // Prefer accessible Geneva/Global Gold Core questions (qid <= 832, irtB in [-1.80, -0.15])
    const goldSightline = this.tier1Questions.filter(
      (q) =>
        q.qid <= 4_964 &&
        q.archetype === 'SIGHTLINE_LOCK' &&
        q.irtB >= -1.8 &&
        q.irtB <= -0.2 &&
        Array.isArray(q.clues) &&
        q.clues.length >= 2,
    );

    const chSightline = goldSightline.filter((q) => q.regions?.includes('CH'));
    const pickSightline = (preferCh: boolean, targetB: number): RawQuestionRecord => {
      const primaryPool = preferCh && chSightline.length > 0 ? chSightline : goldSightline;
      const pool = primaryPool.length > 0 ? primaryPool : this.tier1Questions;
      let best: RawQuestionRecord = pool[0] ?? BOOTSTRAP_GENEVA_SEED[0];
      let bestScore = -1e9;
      for (const q of pool) {
        if (usedQids.has(q.qid) || q.archetype !== 'SIGHTLINE_LOCK') continue;
        let s = 0;
        if (!this.seenTracker.hasSeen(q.qid)) s += 30;
        if (!usedDomains.has(q.l0Domain)) s += 16;
        if (q.qid <= 832) s += 20;
        s -= Math.abs(q.irtB - targetB) * 18;
        s += rng.nextFloat() * 5;
        if (s > bestScore) {
          bestScore = s;
          best = q;
        }
      }
      usedQids.add(best.qid);
      usedDomains.add(best.l0Domain);
      return best;
    };

    const q1Raw = pickSightline(true, -0.95);
    const q2Raw = pickSightline(false, -0.75);
    const q3Raw = pickSightline(false, -0.5);

    // Q4: Meridian Brass Astrolabe CALIBRATOR_DIAL (prefer QID 4 Geneva 1864 CE if unseen, else crisp Gold Calibrator)
    const q4Exact = this.byQid.get(4);
    let q4Raw: RawQuestionRecord | undefined =
      q4Exact && !this.seenTracker.hasSeen(4) ? q4Exact : undefined;
    if (!q4Raw) {
      const calPool = this.tier1Questions.filter(
        (q) =>
          q.archetype === 'CALIBRATOR_DIAL' &&
          q.qid <= 4_964 &&
          q.irtB <= 0.45 &&
          !usedQids.has(q.qid),
      );
      q4Raw =
        calPool.length > 0
          ? calPool[rng.nextInt(0, calPool.length - 1)]
          : (q4Exact ?? BOOTSTRAP_GENEVA_SEED[3]);
    }

    const salt = rng.nextUint32();
    const out = [q1Raw, q2Raw, q3Raw, q4Raw].map((raw, idx) => {
      const pq = normalizeToPrismQuestion(raw, {
        timerSec: 22,
        facetCount: 4,
        shuffleSalt: (salt + idx * 7919) >>> 0,
      });
      if (idx === 3 && !pq.heroRelicId) {
        pq.heroRelicId = 'meridian_astrolabe';
      }
      return pq;
    });
    return out;
  }

  /**
   * Synchronous Campaign Round Selector enforcing the strict 8-City Progressive Curve:
   * Geneva (-1.80..-0.35, 22s, Gold/curated first!) -> London (20s) -> Tokyo (19s) ->
   * Rio (18s) -> Cairo (17s) -> Reykjavik (15s) -> Singapore (14s) -> Apex Forum (13s).
   */
  public queryCampaignRound(params: {
    hub: CampaignHubCode | string;
    roundIndex?: number;
    count?: number;
    isBossShowdown?: boolean;
    phase1Count?: number;
    lateralJammerMode?: boolean;
    nemesisCounterPick?: boolean;
    domains?: DomainId[];
    excludeDomains?: DomainId[];
    irtBRange?: [number, number];
    morphSequence?: Archetype3D[];
    facetCount?: 4 | 5 | 6;
    seed?: number;
  }): PrismQuestion[] {
    const stage = getCampaignStageSpec(params.hub);
    const roundIdx = clamp(params.roundIndex ?? 0, 0, 11);
    const count = clamp(params.count ?? 5, 1, 25);

    // Warm up deep-campaign shards in background for Stage 3+
    if (stage.index >= 3) {
      const warmDomain = ((stage.index + roundIdx) % 12) as DomainId;
      this.prefetchDomainShards([warmDomain]);
    }

    if (params.isBossShowdown) {
      return this.buildBossShowdownQuestions(stage, count, params);
    }

    const effIrtMin =
      params.irtBRange && Number.isFinite(params.irtBRange[0])
        ? clamp(params.irtBRange[0], -1.85, 2.65)
        : stage.irtMin;
    const effIrtMax =
      params.irtBRange && Number.isFinite(params.irtBRange[1])
        ? clamp(Math.max(effIrtMin + 0.2, params.irtBRange[1]), -1.5, 2.85)
        : stage.irtMax;

    const span = Math.max(0.25, effIrtMax - effIrtMin);
    const roundFrac = roundIdx / 4;
    const roundCenter = lerp(
      effIrtMin + span * 0.22,
      effIrtMax - span * 0.14,
      roundFrac,
    );

    const fallbackSchedule = this.buildCityArchetypeSchedule(stage, count, roundIdx);
    const schedule: Archetype3D[] =
      Array.isArray(params.morphSequence) && params.morphSequence.length > 0
        ? Array.from({ length: count }, (_, idx) => {
            const rawArch = params.morphSequence![idx] ?? fallbackSchedule[idx];
            return rawArch === 'HERO_ARTIFACT_SYNTHESIS' ? 'SIGHTLINE_LOCK' : rawArch;
          })
        : fallbackSchedule;

    const targetCurve: number[] = [];
    for (let i = 0; i < count; i++) {
      const slotOffset = lerp(-span * 0.18, span * 0.18, i / Math.max(1, count - 1));
      targetCurve.push(clamp(roundCenter + slotOffset, effIrtMin, effIrtMax));
    }

    return this.queryQuestions({
      count,
      mode: 'CAMPAIGN',
      hub: stage.hub,
      roundIndex: roundIdx,
      domains: params.domains,
      excludeDomains: params.excludeDomains,
      archetypes: schedule,
      irtMin: effIrtMin,
      irtMax: effIrtMax,
      targetIrtCurve: targetCurve,
      regions: stage.regionCode !== 'GLOBAL' ? [stage.regionCode] : undefined,
      boostTags: params.lateralJammerMode ? ['LATERAL_DEDUCTION'] : undefined,
      lateralJammerMode: params.lateralJammerMode,
      nemesisCounterPick: params.nemesisCounterPick,
      facetCount: params.facetCount ?? 4,
      seed: params.seed,
    });
  }

  /** Async Campaign Round Selector that awaits lazy shard streaming on deep stages */
  public async queryCampaignRoundAsync(
    params: Parameters<ForgeEngine['queryCampaignRound']>[0],
  ): Promise<PrismQuestion[]> {
    if (!this.initialized) {
      await this.init();
    }
    const stage = getCampaignStageSpec(params.hub);
    if (stage.index >= 3) {
      const targetDomains =
        params.domains && params.domains.length > 0
          ? params.domains
          : ([
              ((stage.index * 2) % 12) as DomainId,
              ((stage.index * 2 + 1) % 12) as DomainId,
            ] as DomainId[]);
      await this.ensureDomainsLoaded(targetDomains);
    }
    return this.queryCampaignRound(params);
  }

  /**
   * Builds a 3-step chained `HERO_ARTIFACT_SYNTHESIS` Boss Relic PrismQuestion
   * for any Campaign hub (`ch`..`global`) or `HeroRelicId`.
   */
  public getBossArtifactSynthesis(hubOrRelic: string, facetCount: 4 | 5 | 6 = 4): PrismQuestion {
    const norm = hubOrRelic.trim().toLowerCase();
    const stage =
      CAMPAIGN_DIFFICULTY_CURVE.find(
        (s) => s.hub === norm || s.heroRelicId === norm || s.regionCode.toLowerCase() === norm,
      ) ?? CAMPAIGN_DIFFICULTY_CURVE[0];

    // Prefer Wave-2 authored 3-step Boss Chains (`gold_venue_packs.json`) when available!
    const authoredChains = this.bossChainsByHub.get(stage.hub) ?? [];
    if (authoredChains.length > 0) {
      const unseenChains = authoredChains.filter(
        (c) => !this.seenTracker.hasSeen(c.steps[0].qid),
      );
      const poolChains = unseenChains.length > 0 ? unseenChains : authoredChains;
      const chosenChain = poolChains[sharedCryptoRng.nextInt(0, poolChains.length - 1)];
      const normalizedSteps = chosenChain.steps.slice(0, 3).map((st) =>
        normalizeToPrismQuestion(st, {
          timerSec: stage.timerSec + 3,
          facetCount,
          shuffleSalt: sharedCryptoRng.nextUint32(),
          sourceTier: 'GOLD_CURATED',
        }),
      );
      return attachHeroSynthesisChain(normalizedSteps[0], normalizedSteps.slice(1, 3), stage.hub, {
        chainId: chosenChain.chainId,
        chainTitle: chosenChain.chainTitle,
        relicName: chosenChain.relicName,
        relicId: (chosenChain.relicId as HeroRelicId) ?? stage.heroRelicId,
      });
    }

    // Strict #190 [P0] filter: ONLY Sightline/Synthesis items with >=3 distractors and matching relic!
    const relicMatches = this.tier1Questions.filter(
      (q) =>
        (q.archetype === 'SIGHTLINE_LOCK' || q.archetype === 'HERO_ARTIFACT_SYNTHESIS') &&
        Array.isArray(q.distractors) &&
        q.distractors.length >= 3 &&
        (q.heroRelicId === stage.heroRelicId ||
          (q.archetype === 'HERO_ARTIFACT_SYNTHESIS' &&
            (stage.regionCode !== 'GLOBAL' || !q.heroRelicId || q.heroRelicId === 'master_ledger'))) &&
        (stage.regionCode === 'GLOBAL' || q.regions?.includes(stage.regionCode)),
    );

    const regionalSightline = this.tier1Questions.filter(
      (q) =>
        q.archetype === 'SIGHTLINE_LOCK' &&
        Array.isArray(q.distractors) &&
        q.distractors.length >= 3 &&
        (stage.regionCode === 'GLOBAL' || q.regions?.includes(stage.regionCode)) &&
        q.irtB >= stage.irtMin - 0.3 &&
        q.irtB <= stage.irtMax + 0.6,
    );

    const shuffledRelic = [...relicMatches];
    const shuffledRegional = [...regionalSightline];
    sharedCryptoRng.shuffleInPlace(shuffledRelic);
    sharedCryptoRng.shuffleInPlace(shuffledRegional);
    const combined = [...shuffledRelic, ...shuffledRegional];
    const picked: PrismQuestion[] = [];
    const used = new Set<number>();

    for (const raw of combined) {
      if (used.has(raw.qid)) continue;
      if (picked.length < 3 && (!this.seenTracker.hasSeen(raw.qid) || combined.length <= 3)) {
        used.add(raw.qid);
        picked.push(
          normalizeToPrismQuestion(raw, {
            timerSec: stage.timerSec + 3,
            facetCount,
            shuffleSalt: sharedCryptoRng.nextUint32(),
          }),
        );
      }
      if (picked.length >= 3) break;
    }

    while (picked.length < 3) {
      const extra = this.queryQuestions({
        count: 3 - picked.length,
        mode: 'CAMPAIGN',
        hub: stage.hub,
        archetypes: ['SIGHTLINE_LOCK'],
        irtMin: stage.irtMin,
        irtMax: stage.irtMax + 0.4,
        excludeQids: Array.from(used),
        facetCount,
      });
      if (extra.length === 0) break;
      for (const eq of extra) used.add(eq.qid);
      picked.push(...extra);
    }

    const lead =
      picked[0] ??
      normalizeToPrismQuestion(BOOTSTRAP_GENEVA_SEED[0], {
        timerSec: stage.timerSec,
        facetCount,
        shuffleSalt: sharedCryptoRng.nextUint32(),
      });
    return attachHeroSynthesisChain(lead, picked.slice(1, 3), stage.hub, {
      relicId: stage.heroRelicId,
    });
  }

  /**
   * Uniform Daily Seed (`PITCH_BIBLE.md` §4 & `#181` §2.2 — *The Global Feed*):
   * Pure deterministic 10-Prism UTC World Broadcast for `utcDateString` (`YYYY-MM-DD`),
   * spanning all 4 core morphs (`SIGHTLINE_LOCK`, `GAUNTLET_SHATTER`, `CODEX_DUAL_RING`,
   * and a Q10 `CALIBRATOR_DIAL` tiebreaker) with deterministic facet shuffles & zero adaptive bias!
   */
  public getDailyBroadcast(utcDateString?: string, count = 10): DailyBroadcastPacket {
    const safeCount = clamp(Math.trunc(count), 5, 15);
    const dateKey = (utcDateString?.trim() || this.getCurrentUtcDateString()).slice(0, 10);
    const seed = fnv1a32(`${DAILY_BROADCAST_SALT}:${dateKey}`);
    const rng = new DeterministicRng(seed);

    const parsedMs = Date.parse(`${dateKey}T00:00:00Z`);
    const broadcastNumber = Number.isFinite(parsedMs)
      ? Math.max(1, Math.floor((parsedMs - MERIDIAN_LAUNCH_EPOCH_MS) / EPOCH_DAY_MS) + 1)
      : 1;

    const baseMorphTen: Archetype3D[] = [
      'SIGHTLINE_LOCK',
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'SIGHTLINE_LOCK',
      'CALIBRATOR_DIAL',
      'SIGHTLINE_LOCK',
      'CODEX_DUAL_RING',
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL', // Q10 Precision Bullseye Tiebreaker!
    ];

    const morphSchedule: Archetype3D[] = [];
    for (let i = 0; i < safeCount; i++) {
      if (i === safeCount - 1) {
        morphSchedule.push('CALIBRATOR_DIAL');
      } else {
        morphSchedule.push(baseMorphTen[i % (baseMorphTen.length - 1)]);
      }
    }

    const usedQids = new Set<number>();
    const usedDomains = new Set<DomainId>();
    const questions: PrismQuestion[] = [];

    for (let slot = 0; slot < safeCount; slot++) {
      const arch = morphSchedule[slot];
      const targetB =
        slot === safeCount - 1
          ? 0.65
          : lerp(-1.0, 1.35, slot / Math.max(1, safeCount - 2));
      const pickedRaw = this.pickDeterministicFromTier1(
        arch,
        targetB - 0.65,
        targetB + 0.65,
        targetB,
        usedQids,
        usedDomains,
        rng,
      );
      usedQids.add(pickedRaw.qid);
      usedDomains.add(clamp(pickedRaw.l0Domain, 0, 11) as DomainId);

      const timerSec = arch === 'GAUNTLET_SHATTER' ? 10 : arch === 'CALIBRATOR_DIAL' ? 18 : 17;
      questions.push(
        normalizeToPrismQuestion(pickedRaw, {
          timerSec,
          facetCount: 4,
          shuffleSalt: (seed ^ Math.imul(slot + 1, 0x9e3779b9)) >>> 0,
        }),
      );
    }

    return {
      utcDate: dateKey,
      seed,
      broadcastNumber,
      questions,
      tiebreakerIndex: safeCount - 1,
    };
  }

  /**
   * Briefing Room (Categories & 3-Level Subcategory Drill-Down) Async Query —
   * Awaits `<80–150ms` shard load for the chosen L0/L1/L2 topic (`subcat_baseball.json`, etc.)!
   */
  public async queryBriefingRoomAsync(params: {
    domains?: DomainId[];
    l1SubcategoryId?: string;
    l2TopicId?: string;
    difficultyPreset?: BriefingDifficultyPreset;
    count?: number;
    facetCount?: 4 | 5 | 6;
  }): Promise<PrismQuestion[]> {
    if (!this.initialized) {
      await this.init();
    }
    if (params.l1SubcategoryId || params.l2TopicId) {
      await this.ensureTopicShardsLoaded({
        domains: params.domains,
        l1SubcategoryId: params.l1SubcategoryId,
        l2TopicId: params.l2TopicId,
      });
    } else {
      const d0 = sharedCryptoRng.nextInt(0, 11) as DomainId;
      const d1 = ((d0 + sharedCryptoRng.nextInt(1, 11)) % 12) as DomainId;
      const targetDomains: DomainId[] =
        params.domains && params.domains.length > 0 ? params.domains : [d0, d1];
      await this.ensureDomainsLoaded(targetDomains);
    }
    return this.queryBriefingRoom(params);
  }

  /** Synchronous Briefing Room Query (supports L0, L1, and L2 subcategory drill-down + 5/10/20/Marathon Qs) */
  public queryBriefingRoom(params: {
    domains?: DomainId[];
    l1SubcategoryId?: string;
    l2TopicId?: string;
    difficultyPreset?: BriefingDifficultyPreset;
    count?: number;
    facetCount?: 4 | 5 | 6;
  }): PrismQuestion[] {
    const count = clamp(params.count ?? 5, 1, 100);
    const preset: BriefingDifficultyPreset = params.difficultyPreset ?? 'ADAPTIVE';
    if (params.l1SubcategoryId || params.l2TopicId) {
      void this.ensureTopicShardsLoaded({
        domains: params.domains,
        l1SubcategoryId: params.l1SubcategoryId,
        l2TopicId: params.l2TopicId,
      });
    } else if (params.domains && params.domains.length > 0) {
      this.prefetchDomainShards(params.domains);
    }

    const morphRotation: Archetype3D[] = [
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
    ];
    const schedule: Archetype3D[] = [];
    for (let i = 0; i < count; i++) {
      if (count >= 4 && i % 2 === 1) {
        schedule.push(morphRotation[Math.floor(i / 2) % morphRotation.length]);
      } else {
        schedule.push('SIGHTLINE_LOCK');
      }
    }

    return this.queryQuestions({
      count,
      mode: 'BRIEFING',
      domains: params.domains,
      l1SubcategoryId: params.l1SubcategoryId,
      l2TopicId: params.l2TopicId,
      archetypes: schedule,
      difficultyPreset: preset,
      facetCount: params.facetCount ?? 4,
    });
  }

  /**
   * Archive Descent (Endless Mode) Async Query — climbs monotonically from accessible
   * Public Strata (`-1.20`) into Meridian Zero polymath depths (`+2.75`)!
   */
  public async queryEndlessBatchAsync(
    depthStart: number,
    count = 5,
    facetCount: 4 | 5 | 6 = 4,
  ): Promise<PrismQuestion[]> {
    if (!this.initialized) {
      await this.init();
    }
    const domA = (Math.floor(Math.max(0, depthStart) / 5) % 12) as DomainId;
    const domB = ((domA + 3) % 12) as DomainId;
    await this.ensureDomainsLoaded([domA, domB]);
    return this.queryEndlessBatch(depthStart, count, facetCount);
  }

  public queryEndlessBatch(
    depthStart: number,
    count = 5,
    facetCount: 4 | 5 | 6 = 4,
  ): PrismQuestion[] {
    const safeCount = clamp(count, 1, 20);
    const nextDom = (Math.floor(Math.max(0, depthStart) / 5) % 12) as DomainId;
    this.prefetchDomainShards([nextDom, ((nextDom + 1) % 12) as DomainId]);

    const floorIndex = Math.floor(Math.max(0, depthStart) / 5);
    const schedule: Archetype3D[] = [];
    const targetCurve: number[] = [];
    for (let i = 0; i < safeCount; i++) {
      const d = Math.max(0, depthStart) + i;
      targetCurve.push(clamp(-1.2 + d * 0.13, -1.5, 2.75));
      if (safeCount >= 4 && i % 2 === 1) {
        if (i === 1) {
          schedule.push('GAUNTLET_SHATTER');
        } else if (i === 3) {
          schedule.push(floorIndex % 2 === 1 && d >= 5 ? 'CODEX_DUAL_RING' : 'CALIBRATOR_DIAL');
        } else {
          const rot: Archetype3D[] = ['CODEX_DUAL_RING', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL'];
          schedule.push(rot[Math.floor(i / 2) % rot.length]);
        }
      } else {
        schedule.push('SIGHTLINE_LOCK');
      }
    }

    const baseTimer = clamp(Math.round(20 - Math.max(0, depthStart) * 0.2), 12, 20);
    const questions = this.queryQuestions({
      count: safeCount,
      mode: 'ENDLESS',
      archetypes: schedule,
      irtMin: Math.min(...targetCurve) - 0.55,
      irtMax: Math.max(...targetCurve) + 0.55,
      targetIrtCurve: targetCurve,
      facetCount,
    });
    for (const q of questions) {
      if (q.archetype !== 'GAUNTLET_SHATTER') {
        q.timerSec = baseTimer;
      }
    }
    return questions;
  }

  /**
   * General-purpose unified query engine across Tier-1 (`questions.json`),
   * Tier-2 (`domain_*.json` + `subcat_*.json` lazy shards), and Codex Synthesis.
   */
  public async queryQuestionsAsync(req: ForgeQueryRequest): Promise<PrismQuestion[]> {
    if (!this.initialized) {
      await this.init();
    }
    if (req.l1SubcategoryId || req.l2TopicId) {
      await this.ensureTopicShardsLoaded({
        domains: req.domains,
        l1SubcategoryId: req.l1SubcategoryId,
        l2TopicId: req.l2TopicId,
      });
    } else if (req.domains && req.domains.length > 0) {
      await this.ensureDomainsLoaded(req.domains);
    }
    return this.queryQuestions(req);
  }

  public queryQuestions(req: ForgeQueryRequest): PrismQuestion[] {
    const count = clamp(req.count, 1, 100);
    const respectSeen = req.respectSeenBitset ?? req.mode !== 'DAILY';
    const facetCount: 4 | 5 | 6 = req.facetCount ?? 4;
    // STRICT #181 §2.2 MANDATE: ONLY Daily / explicit seed uses DeterministicRng;
    // ALL other modes use true hardware cryptographic randomness (`crypto.getRandomValues`)!
    const rng: RngLike =
      req.mode === 'DAILY' || req.seed !== undefined
        ? new DeterministicRng(req.seed ?? fnv1a32(DAILY_BROADCAST_SALT))
        : sharedCryptoRng;

    const stage = req.hub ? getCampaignStageSpec(req.hub) : null;
    const baseTimer = stage ? stage.timerSec : 18;

    const taxFilter = this.resolveTaxonomyFilter(req.l1SubcategoryId, req.l2TopicId);

    // Resolve allowed domains (applying L1/L2 taxonomy lock or Nemesis Nadia counter-pick!)
    let allowedDomains: DomainId[] = taxFilter
      ? [taxFilter.domainId]
      : req.domains && req.domains.length > 0
        ? [...req.domains]
        : [];
    if (!taxFilter && req.excludeDomains && req.excludeDomains.length > 0) {
      const ex = new Set<DomainId>(req.excludeDomains);
      const base =
        allowedDomains.length > 0
          ? allowedDomains
          : (FORGE_DOMAINS.map((d) => d.id) as DomainId[]);
      allowedDomains = base.filter((d) => !ex.has(d));
    }
    if (!taxFilter && req.nemesisCounterPick && allowedDomains.length !== 1) {
      const counterDoms = this.irtDirector.getWeakestDomains(2, req.excludeDomains ?? []);
      allowedDomains = counterDoms;
      this.prefetchDomainShards(counterDoms);
    }

    const usedQids = new Set<number>(req.excludeQids ?? []);
    const usedDomainsInBatch = new Set<DomainId>();
    const results: PrismQuestion[] = [];
    let prevDomain: DomainId | null = this.seenTracker.getLastDomain();

    // 1. Honor explicit pinnedQids first (if provided by narrative set-pieces)
    if (req.pinnedQids && req.pinnedQids.length > 0) {
      for (const pqid of req.pinnedQids) {
        if (results.length >= count) break;
        const found = this.getQuestionByQidSync(pqid, {
          timerSec: baseTimer,
          facetCount,
          shuffleSalt: rng.nextUint32(),
        });
        if (found && !usedQids.has(found.qid)) {
          usedQids.add(found.qid);
          usedDomainsInBatch.add(found.l0Domain);
          prevDomain = found.l0Domain;
          results.push(found);
        }
      }
    }

    // 2. Fill remaining slots along difficulty curve & morph schedule
    for (let slot = results.length; slot < count; slot++) {
      const wantArch: Archetype3D =
        req.archetypes && req.archetypes.length > 0
          ? req.archetypes[slot % req.archetypes.length]
          : 'SIGHTLINE_LOCK';

      const { lo, hi, targetB } = this.resolveSlotDifficulty(req, slot, count, allowedDomains);

      // Per #118: Campaign (Geneva -> Apex) pulls strictly from Tier-1 human-curated
      // questions.json (20,165 items) FIRST before falling back to Tier-2 shards!
      const preferGoldOnly = Boolean(stage && stage.hub === 'ch');
      const canUseShards =
        !preferGoldOnly &&
        req.mode !== 'DAILY' &&
        (!req.requiredTags || req.requiredTags.length === 0) &&
        this.hasLoadedShardForDomains(allowedDomains);

      let rawPicked: RawQuestionRecord | null = null;

      // When an L1/L2 Subcategory Drill-Down is active (e.g. Baseball 25,000+ Qs!),
      // prioritize specialist shard tables & filtered domain tables directly!
      const tryShardFirst =
        canUseShards &&
        (Boolean(taxFilter) ||
          (req.mode === 'BRIEFING' && slot % 2 === 1) ||
          (req.mode === 'ENDLESS' && slot % 2 === 1));

      if (tryShardFirst) {
        rawPicked = this.pickFromLoadedShards(
          wantArch,
          lo,
          hi,
          targetB,
          allowedDomains,
          usedQids,
          rng,
          respectSeen,
          prevDomain,
          facetCount - 1,
          taxFilter,
        );
      }

      if (!rawPicked) {
        rawPicked = this.pickFromTier1Catalog({
          wantArch,
          irtMin: lo,
          irtMax: hi,
          targetB,
          allowedDomains,
          usedQids,
          usedDomainsInBatch,
          rng,
          respectSeen,
          prevDomain,
          preferGoldCurated: Boolean(stage?.preferGoldCuratedFirst),
          regions: slot < Math.ceil(count * 0.45) ? req.regions : undefined,
          requiredTags: req.requiredTags,
          boostTags: req.boostTags,
          lateralJammerMode: req.lateralJammerMode,
          taxFilter,
        });
      }

      // If Tier-1 was exhausted on a specific narrow category, fall back to loaded shards
      if (!rawPicked && canUseShards) {
        rawPicked = this.pickFromLoadedShards(
          wantArch,
          lo - 0.6,
          hi + 0.6,
          targetB,
          allowedDomains,
          usedQids,
          rng,
          respectSeen,
          prevDomain,
          facetCount - 1,
          taxFilter,
        );
      }

      // If a narrow morph (e.g. CODEX_DUAL_RING inside a small L2 filter) had 0 hits, relax to SIGHTLINE_LOCK inside same topic!
      if (!rawPicked && taxFilter && wantArch !== 'SIGHTLINE_LOCK' && canUseShards) {
        rawPicked = this.pickFromLoadedShards(
          'SIGHTLINE_LOCK',
          lo - 0.6,
          hi + 0.6,
          targetB,
          allowedDomains,
          usedQids,
          rng,
          respectSeen,
          prevDomain,
          facetCount - 1,
          taxFilter,
        );
      }

      const finalRaw = rawPicked ?? BOOTSTRAP_GENEVA_SEED[slot % BOOTSTRAP_GENEVA_SEED.length];
      usedQids.add(finalRaw.qid);
      const domId = clamp(finalRaw.l0Domain, 0, 11) as DomainId;
      usedDomainsInBatch.add(domId);
      prevDomain = domId;

      const timerForMorph =
        finalRaw.archetype === 'GAUNTLET_SHATTER'
          ? clamp(Math.min(baseTimer, Number(finalRaw.gauntletExt?.windowSec ?? 10)), 6, 14)
          : baseTimer;

      let pq = normalizeToPrismQuestion(finalRaw, {
        timerSec: timerForMorph,
        facetCount,
        shuffleSalt: rng.nextUint32(),
      });

      if (pq.archetype === 'HERO_ARTIFACT_SYNTHESIS' && !pq.heroSynthesis) {
        pq = attachHeroSynthesisChain(pq, [], stage?.hub ?? 'global');
      }

      results.push(pq);
    }

    return results;
  }

  /** Direct QID lookup across Tier-1 and any loaded Tier-2 shards (async auto-loads shard if needed!) */
  public async getQuestionByQid(
    qid: number,
    facetCount: 4 | 5 | 6 = 4,
  ): Promise<PrismQuestion | null> {
    if (!this.initialized) {
      await this.init();
    }
    const syncHit = this.getQuestionByQidSync(qid, { facetCount });
    if (syncHit) return syncHit;

    if (this.shardManifest && qid >= 60_000) {
      for (const dom of this.shardManifest.domains) {
        const inDomain = dom.files.some((f) => qid >= f.baseQid && qid <= f.qidEnd);
        if (inDomain) {
          await this.ensureDomainShardLoaded(dom.l0Domain as DomainId);
          return this.getQuestionByQidSync(qid, { facetCount });
        }
      }
    }
    return null;
  }

  public getQuestionByQidSync(
    qid: number,
    opts: { timerSec?: number; facetCount?: 4 | 5 | 6; shuffleSalt?: number } = {},
  ): PrismQuestion | null {
    const t1 = this.byQid.get(qid);
    if (t1) {
      return normalizeToPrismQuestion(t1, {
        ...opts,
        shuffleSalt: opts.shuffleSalt ?? sharedCryptoRng.nextUint32(),
      });
    }
    const unifiedManifest = this.getUnifiedManifestForDecode();
    if (unifiedManifest && qid >= 60_000) {
      for (const [, chunks] of this.loadedShardsByDomain) {
        const raw = decodeQuestionByQidFromChunks(
          unifiedManifest,
          chunks,
          qid,
          (opts.facetCount ?? 4) - 1,
        );
        if (raw) {
          return normalizeToPrismQuestion(raw, {
            ...opts,
            shuffleSalt: opts.shuffleSalt ?? sharedCryptoRng.nextUint32(),
          });
        }
      }
    }
    return null;
  }

  public getCurrentUtcDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getUnifiedManifestForDecode(): ShardManifest | null {
    if (!this.shardManifest) return null;
    if (Object.keys(this.extraShardTypes).length === 0) {
      return this.shardManifest;
    }
    return {
      ...this.shardManifest,
      types: { ...this.shardManifest.types, ...this.extraShardTypes },
    };
  }

  // --------------------------------------------------------------------------
  // Internal Selection, Indexing & Network Helpers
  // --------------------------------------------------------------------------

  private buildCityArchetypeSchedule(
    stage: CampaignStageSpec,
    count: number,
    roundIdx: number,
  ): Archetype3D[] {
    const schedule = new Array<Archetype3D>(count).fill('SIGHTLINE_LOCK');
    const specials = stage.unlockedArchetypes.filter(
      (a) => a !== 'SIGHTLINE_LOCK' && a !== 'HERO_ARTIFACT_SYNTHESIS',
    );
    if (specials.length === 0) {
      return schedule;
    }
    if (stage.hub === 'ch') {
      // Geneva weaves a welcoming Estimate / True-False beat so 5-Q rounds never repeat 5 plain MCQs!
      if (count >= 4) {
        schedule[Math.min(count - 2, 2)] =
          roundIdx % 2 === 0 ? 'CALIBRATOR_DIAL' : 'GAUNTLET_SHATTER';
      }
      return schedule;
    }
    if (count >= 4) {
      schedule[1] = specials[roundIdx % specials.length];
      if (count >= 5) {
        schedule[3] = specials[(roundIdx + 1) % specials.length];
      }
      for (let extra = 5; extra < count; extra += 2) {
        schedule[extra] = specials[(roundIdx + extra) % specials.length];
      }
    }
    return schedule;
  }

  private buildBossShowdownQuestions(
    stage: CampaignStageSpec,
    count: number,
    params: {
      phase1Count?: number;
      lateralJammerMode?: boolean;
      nemesisCounterPick?: boolean;
      domains?: DomainId[];
      excludeDomains?: DomainId[];
      irtBRange?: [number, number];
      facetCount?: 4 | 5 | 6;
      seed?: number;
    },
  ): PrismQuestion[] {
    // 3-Phase Boss Showdown (PITCH_BIBLE.md §3.4 + #175/#176 5..15-Q Phase Alignment):
    //   • Phase I (indices 0 .. p1Count-1): Shield Break (`p1Count = count >= 9 ? 4 : count >= 5 ? 2 : 1`)
    //   • Phase II (exact index === p1Count): 3-Step Chained `HERO_ARTIFACT_SYNTHESIS` Relic
    //   • Phase III (indices p1Count+1 .. count-1): Sovereign Sudden Death (interleaved morphs)
    const effIrtMin =
      params.irtBRange && Number.isFinite(params.irtBRange[0])
        ? clamp(params.irtBRange[0], -1.85, 2.65)
        : stage.irtMin;
    const effIrtMax =
      params.irtBRange && Number.isFinite(params.irtBRange[1])
        ? clamp(Math.max(effIrtMin + 0.2, params.irtBRange[1]), -1.5, 2.85)
        : stage.irtMax;
    const facetCount = params.facetCount ?? 4;
    if (count <= 1) {
      return [this.getBossArtifactSynthesis(stage.hub, facetCount)];
    }

    const relicBoss = this.getBossArtifactSynthesis(stage.hub, facetCount);
    const reservedQids = new Set<number>([relicBoss.qid]);
    if (relicBoss.heroSynthesis) {
      for (const st of relicBoss.heroSynthesis.steps) {
        reservedQids.add(st.qid);
      }
    }

    const defaultP1 = count >= 9 ? 4 : count >= 5 ? 2 : 1;
    const p1Count =
      params.phase1Count !== undefined
        ? clamp(Math.trunc(params.phase1Count), 1, Math.max(1, count - 2))
        : Math.min(defaultP1, Math.max(1, count - 1));

    const p1Schedule: Archetype3D[] = [];
    for (let i = 0; i < p1Count; i++) {
      // Mix GAUNTLET_SHATTER + brisk SIGHTLINE_LOCK when p1Count > 2 (#176)
      p1Schedule.push(p1Count > 2 && i % 2 === 1 ? 'SIGHTLINE_LOCK' : 'GAUNTLET_SHATTER');
    }

    const out: PrismQuestion[] = [];
    const shieldBreak = this.queryQuestions({
      count: p1Count,
      mode: 'CAMPAIGN',
      hub: stage.hub,
      archetypes: p1Schedule,
      irtMin: effIrtMin,
      irtMax: Math.min(2.85, effIrtMax + 0.25),
      domains: params.domains,
      excludeDomains: params.excludeDomains,
      excludeQids: Array.from(reservedQids),
      nemesisCounterPick: params.nemesisCounterPick,
      facetCount,
      seed: params.seed,
    });
    for (const sq of shieldBreak) {
      reservedQids.add(sq.qid);
      out.push(sq);
    }

    // Exact Phase II boundary: index === p1Count!
    out.push(relicBoss);

    const remaining = count - out.length;
    if (remaining > 0) {
      const hasCodex = stage.unlockedArchetypes.includes('CODEX_DUAL_RING');
      const p3Cycle: Archetype3D[] = hasCodex
        ? ['CALIBRATOR_DIAL', 'SIGHTLINE_LOCK', 'CODEX_DUAL_RING', 'SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'SIGHTLINE_LOCK']
        : ['CALIBRATOR_DIAL', 'SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'SIGHTLINE_LOCK'];
      const p3Schedule: Archetype3D[] =
        remaining === 1
          ? ['SIGHTLINE_LOCK']
          : Array.from({ length: remaining }, (_, idx) => p3Cycle[idx % p3Cycle.length]);

      const suddenDeath = this.queryQuestions({
        count: remaining,
        mode: 'CAMPAIGN',
        hub: stage.hub,
        roundIndex: 4,
        archetypes: p3Schedule,
        irtMin: Math.min(2.65, effIrtMin + 0.15),
        irtMax: Math.min(2.85, effIrtMax + 0.35),
        domains: params.domains,
        excludeDomains: params.excludeDomains,
        excludeQids: Array.from(reservedQids),
        lateralJammerMode: params.lateralJammerMode,
        nemesisCounterPick: params.nemesisCounterPick,
        facetCount,
        seed: params.seed !== undefined ? (params.seed ^ 0x9e3779b9) >>> 0 : undefined,
      });
      out.push(...suddenDeath);
    }

    return out.slice(0, count);
  }

  private resolveSlotDifficulty(
    req: ForgeQueryRequest,
    slot: number,
    count: number,
    allowedDomains: ReadonlyArray<DomainId>,
  ): { lo: number; hi: number; targetB: number } {
    if (req.targetIrtCurve && req.targetIrtCurve.length > 0) {
      const tb = req.targetIrtCurve[Math.min(slot, req.targetIrtCurve.length - 1)];
      return {
        lo: req.irtMin ?? tb - 0.55,
        hi: req.irtMax ?? tb + 0.55,
        targetB: tb,
      };
    }

    if (req.irtMin !== undefined && req.irtMax !== undefined) {
      const frac = slot / Math.max(1, count - 1);
      const tb = lerp(req.irtMin + 0.15, req.irtMax - 0.1, frac);
      return { lo: req.irtMin, hi: req.irtMax, targetB: tb };
    }

    const frac = slot / Math.max(1, count - 1);
    const preset = req.difficultyPreset ?? 'ADAPTIVE';
    switch (preset) {
      case 'EASY': {
        const tb = lerp(-1.4, -0.35, frac);
        return { lo: -1.8, hi: -0.2, targetB: tb };
      }
      case 'MEDIUM': {
        const tb = lerp(-0.25, 0.65, frac);
        return { lo: -0.5, hi: 0.85, targetB: tb };
      }
      case 'HARD': {
        const tb = lerp(0.75, 1.85, frac);
        return { lo: 0.55, hi: 2.15, targetB: tb };
      }
      case 'GENIUS': {
        const tb = lerp(1.45, 2.65, frac);
        return { lo: 1.25, hi: 2.85, targetB: tb };
      }
      case 'PROGRESSIVE': {
        const tb = lerp(-1.3, 1.95, frac);
        return { lo: tb - 0.55, hi: tb + 0.55, targetB: tb };
      }
      case 'ADAPTIVE':
      default: {
        const singleDom = allowedDomains.length === 1 ? allowedDomains[0] : undefined;
        const flowB = this.irtDirector.getFlowTargetIrtB(singleDom, 0.7);
        const sawtooth = lerp(-0.22, 0.28, frac);
        const tb = clamp(flowB + sawtooth, -1.65, 2.5);
        return { lo: tb - 0.6, hi: tb + 0.6, targetB: tb };
      }
    }
  }

  private hasLoadedShardForDomains(allowedDomains: ReadonlyArray<DomainId>): boolean {
    if (!this.shardManifest || this.loadedShardsByDomain.size === 0) return false;
    if (allowedDomains.length === 0) return true;
    return allowedDomains.some((d) => this.isDomainShardLoaded(d));
  }

  private getMatchingRowIndicesForRule(
    chunk: ShardChunkData,
    tbl: ShardChunkTable,
    spec: ShardTableTypeSpec,
    rule: TaxonomyShardRule,
  ): { indices: number[]; resolvedFilterCol: number | null } {
    if (rule.filterCol === undefined || rule.filterCol === null || !rule.filterValues?.length) {
      const cacheKey = '__ALL__';
      let map = this.tableRuleRowCache.get(tbl);
      if (!map) {
        map = new Map();
        this.tableRuleRowCache.set(tbl, map);
      }
      let all = map.get(cacheKey);
      if (!all) {
        all = tbl.r.map((_, idx) => idx);
        map.set(cacheKey, all);
      }
      return { indices: all, resolvedFilterCol: null };
    }

    const colIdx =
      typeof rule.filterCol === 'number'
        ? Math.trunc(rule.filterCol)
        : spec.cols.findIndex((c) => c.toLowerCase() === String(rule.filterCol).toLowerCase());
    if (colIdx < 0) {
      return { indices: [], resolvedFilterCol: null };
    }

    const normVals = rule.filterValues.map((v) => v.trim().toLowerCase()).filter(Boolean);
    const mode = rule.matchMode ?? 'exact';
    const cacheKey = `${colIdx}:${mode}:${normVals.join('|')}`;
    let map = this.tableRuleRowCache.get(tbl);
    if (!map) {
      map = new Map();
      this.tableRuleRowCache.set(tbl, map);
    }
    const hit = map.get(cacheKey);
    if (hit) {
      return { indices: hit, resolvedFilterCol: colIdx };
    }

    const isPoolCol = (spec.poolCols ?? []).includes(colIdx);
    const matched: number[] = [];
    for (let ri = 0; ri < tbl.r.length; ri++) {
      const rawCell = tbl.r[ri][colIdx];
      const cellStr = (
        isPoolCol ? (chunk.p[Number(rawCell)] ?? '') : String(rawCell ?? '')
      )
        .trim()
        .toLowerCase();
      if (!cellStr) continue;
      const ok =
        mode === 'contains'
          ? normVals.some((nv) => cellStr.includes(nv))
          : normVals.includes(cellStr);
      if (ok) matched.push(ri);
    }
    map.set(cacheKey, matched);
    return { indices: matched, resolvedFilterCol: colIdx };
  }

  private pickFromLoadedShards(
    wantArch: Archetype3D,
    irtMin: number,
    irtMax: number,
    targetB: number,
    allowedDomains: ReadonlyArray<DomainId>,
    usedQids: ReadonlySet<number>,
    rng: RngLike,
    respectSeen: boolean,
    prevDomain: DomainId | null,
    desiredDistractors = 3,
    taxFilter?: {
      domainId: DomainId;
      topicName: string;
      keywords: string[];
      shardRules: TaxonomyShardRule[];
      shardFiles: string[];
    } | null,
  ): RawQuestionRecord | null {
    const unifiedManifest = this.getUnifiedManifestForDecode();
    if (!unifiedManifest) return null;

    const candidateDomains: DomainId[] =
      allowedDomains.length > 0
        ? allowedDomains.filter((d) => this.isDomainShardLoaded(d))
        : Array.from(this.loadedShardsByDomain.keys());

    if (candidateDomains.length === 0) return null;

    // 1. Subcategory Drill-Down Path (`L1` / `L2`, e.g., `Sports & Games -> Sports -> Baseball`)
    if (taxFilter && (taxFilter.shardRules.length > 0 || taxFilter.shardFiles.length > 0)) {
      const chunks = this.loadedShardsByDomain.get(taxFilter.domainId) ?? [];
      if (chunks.length === 0) return null;

      const dedicatedTopicChunks = new Set<ShardChunkData>();
      for (const sf of taxFilter.shardFiles) {
        const cleanSf = sf.replace(/^\/+/, '').replace(/^data\/shards\//, '').replace(/^shards\//, '');
        // Only treat per-topic files (`subcat_*.json`), not shared domain-wide files (`domain_*.json`), as auto-all-tables
        if (!/^domain(_subcats)?_\d+/i.test(cleanSf)) {
          const loadedChunk = this.loadedExtraShardFiles.get(cleanSf);
          if (loadedChunk) dedicatedTopicChunks.add(loadedChunk);
        }
      }

      // Collect eligible (chunk, ti, rule, matchingRows, matchingAngles) slices
      const slices: Array<{
        chunk: ShardChunkData;
        ti: number;
        tbl: ShardChunkTable;
        spec: ShardTableTypeSpec;
        rowsIdx: number[];
        anglesIdx: number[];
        isSpecialistTable: boolean;
      }> = [];

      for (const chunk of chunks) {
        const isDedicatedTopicChunk = dedicatedTopicChunks.has(chunk);
        for (let ti = 0; ti < chunk.t.length; ti++) {
          const tbl = chunk.t[ti];
          const spec = chunk.types?.[tbl.type] ?? unifiedManifest.types[tbl.type];
          if (!spec || tbl.r.length === 0) continue;

          const matchingRules = taxFilter.shardRules.filter((r) => r.type === tbl.type);
          const effectiveRules: TaxonomyShardRule[] =
            matchingRules.length > 0
              ? matchingRules
              : isDedicatedTopicChunk
                ? [{ type: tbl.type }]
                : [];

          for (const rule of effectiveRules) {
            const { indices, resolvedFilterCol } = this.getMatchingRowIndicesForRule(
              chunk,
              tbl,
              spec,
              rule,
            );
            if (indices.length === 0) continue;

            const allowedSet = rule.allowedAngleIds ? new Set(rule.allowedAngleIds) : null;
            const anglesIdx: number[] = [];
            for (let ai = 0; ai < spec.angles.length; ai++) {
              const ang = spec.angles[ai];
              if (ang.id === 'la_role' || ang.id === 'lm_type' || ang.id === 'ac_disc' || ang.id === 'hw_rev') continue;
              if (ang.archetype !== wantArch) continue;
              if (allowedSet && !allowedSet.has(ang.id)) continue;
              // CRITICAL ANTI-SELF-ANSWERING GUARD (#181/#183):
              // Never ask for the filtered column itself (e.g. "What sport did Babe Ruth play?" inside Baseball!)
              if (resolvedFilterCol !== null) {
                if (ang.answerCol !== undefined && ang.answerCol === resolvedFilterCol) continue;
                if (ang.fakeCol !== undefined && ang.fakeCol === resolvedFilterCol) continue;
                if (ang.targetCol !== undefined && ang.targetCol === resolvedFilterCol) continue;
              }
              anglesIdx.push(ai);
            }
            if (anglesIdx.length > 0) {
              slices.push({
                chunk,
                ti,
                tbl,
                spec,
                rowsIdx: indices,
                anglesIdx,
                isSpecialistTable:
                  isDedicatedTopicChunk ||
                  tbl.baseQid >= 1_050_000 ||
                  tbl.type.startsWith('sub_'),
              });
            }
          }
        }
      }

      // If wantArch === 'CODEX_DUAL_RING' and no native Codex angle existed on the filtered table,
      // synthesize a 3-pair Codex Dual-Ring directly from the filtered within-topic rows!
      if (slices.length === 0 && wantArch === 'CODEX_DUAL_RING') {
        for (const chunk of chunks) {
          for (let ti = 0; ti < chunk.t.length; ti++) {
            const tbl = chunk.t[ti];
            const spec = chunk.types?.[tbl.type] ?? unifiedManifest.types[tbl.type];
            if (!spec) continue;
            for (const rule of taxFilter.shardRules) {
              if (rule.type !== tbl.type) continue;
              const { indices, resolvedFilterCol } = this.getMatchingRowIndicesForRule(
                chunk,
                tbl,
                spec,
                rule,
              );
              if (indices.length < 8) continue;
              const sightAi = spec.angles.findIndex(
                (a) =>
                  a.archetype === 'SIGHTLINE_LOCK' &&
                  (a.answerCol ?? 0) > 0 &&
                  a.answerCol !== resolvedFilterCol,
              );
              if (sightAi >= 0) {
                const startRi = indices[rng.nextInt(0, indices.length - 1)];
                const syntheticAngle = {
                  id: `${spec.angles[sightAi].id}_codex`,
                  archetype: 'CODEX_DUAL_RING' as const,
                  subjectCol: 0,
                  targetCol: spec.angles[sightAi].answerCol ?? 1,
                };
                const tempSpec: ShardTableTypeSpec = {
                  ...spec,
                  angles: [...spec.angles, syntheticAngle],
                };
                const decoded = decodeShardRawQuestion(
                  {
                    types: { ...unifiedManifest.types, [tbl.type]: tempSpec },
                    decoderSpec: unifiedManifest.decoderSpec,
                  },
                  chunk,
                  ti,
                  startRi,
                  tempSpec.angles.length - 1,
                  desiredDistractors,
                  indices,
                );
                if (
                  decoded &&
                  !usedQids.has(decoded.qid) &&
                  (!respectSeen || !this.seenTracker.hasSeen(decoded.qid))
                ) {
                  return decoded;
                }
              }
            }
          }
        }
      }

      if (slices.length > 0) {
        const topicLow = taxFilter.topicName.trim().toLowerCase();
        const candidates: Array<{
          slice: (typeof slices)[number];
          ri: number;
          ai: number;
          score: number;
        }> = [];

        for (let probe = 0; probe < 96; probe++) {
          const sl = slices[rng.nextInt(0, slices.length - 1)];
          const ri = sl.rowsIdx[rng.nextInt(0, sl.rowsIdx.length - 1)];
          const ai = sl.anglesIdx[rng.nextInt(0, sl.anglesIdx.length - 1)];
          const qid = sl.tbl.baseQid + ri * sl.spec.angles.length + ai;
          if (usedQids.has(qid)) continue;
          if (respectSeen && this.seenTracker.hasSeen(qid) && probe < 80) continue;

          const row = sl.tbl.r[ri];
          const irtB = clamp(
            Number(row[row.length - 1]) / 100.0 + Number(sl.spec.angles[ai].irtOffset ?? 0),
            -1.6,
            2.75,
          );
          let score = sl.isSpecialistTable ? 22 : 0;
          if (!this.seenTracker.hasSeen(qid)) score += 50;
          if (irtB < irtMin || irtB > irtMax) score -= 20;
          score -= Math.abs(irtB - targetB) * 14;
          score += rng.nextFloat() * 14; // Strong crypto-random jitter across matching unseen rows!
          candidates.push({ slice: sl, ri, ai, score });
        }

        candidates.sort((a, b) => b.score - a.score);
        for (const cand of candidates) {
          const decoded = decodeShardRawQuestion(
            unifiedManifest,
            cand.slice.chunk,
            cand.slice.ti,
            cand.ri,
            cand.ai,
            desiredDistractors,
            cand.slice.rowsIdx,
          );
          if (
            decoded &&
            decoded.answerCorrect.trim().toLowerCase() !== topicLow &&
            isCleanShardCandidate(decoded)
          ) {
            return decoded;
          }
        }
      }
      return null;
    }

    // 2. General Domain Shard Path (Crypto-Random across full loaded domain tables!)
    if (wantArch === 'CODEX_DUAL_RING') {
      const nonRepeatDoms =
        candidateDomains.length > 1 && prevDomain !== null
          ? candidateDomains.filter((d) => d !== prevDomain)
          : candidateDomains;
      const dom = nonRepeatDoms[rng.nextInt(0, nonRepeatDoms.length - 1)];
      const chunks = this.loadedShardsByDomain.get(dom) ?? [];
      for (let attempt = 0; attempt < 10; attempt++) {
        const synthSlot = rng.nextInt(0, CODEX_SYNTHESIS_PER_DOMAIN - 1);
        const codexRaw = synthesizeShardCodexQuestion(
          unifiedManifest,
          chunks,
          dom,
          synthSlot,
          targetB,
        );
        if (
          codexRaw &&
          !usedQids.has(codexRaw.qid) &&
          (!respectSeen || !this.seenTracker.hasSeen(codexRaw.qid))
        ) {
          return codexRaw;
        }
      }
      return null;
    }

    const candidatos: Array<{
      chunk: ShardChunkData;
      ti: number;
      ri: number;
      ai: number;
      score: number;
    }> = [];

    for (let probe = 0; probe < 84; probe++) {
      const dom = candidateDomains[rng.nextInt(0, candidateDomains.length - 1)];
      const chunks = this.loadedShardsByDomain.get(dom);
      if (!chunks || chunks.length === 0) continue;
      const chunk = chunks[rng.nextInt(0, chunks.length - 1)];
      if (chunk.t.length === 0) continue;
      const ti = rng.nextInt(0, chunk.t.length - 1);
      const tbl = chunk.t[ti];
      const spec = chunk.types?.[tbl.type] ?? unifiedManifest.types[tbl.type];
      if (!spec || tbl.r.length === 0) continue;

      const matchingAngles: number[] = [];
      for (let ai = 0; ai < spec.angles.length; ai++) {
        const ang = spec.angles[ai];
        // Skip hypernym/multi-discipline broad role & reverse-country leak angles (#118 & #190 P1)
        if (ang.id === 'la_role' || ang.id === 'lm_type' || ang.id === 'ac_disc' || ang.id === 'hw_rev') continue;
        if (ang.archetype === wantArch) {
          matchingAngles.push(ai);
        }
      }
      if (matchingAngles.length === 0) continue;

      const ai = matchingAngles[rng.nextInt(0, matchingAngles.length - 1)];
      const angle = spec.angles[ai];
      const ri = rng.nextInt(0, tbl.r.length - 1);
      const row = tbl.r[ri];
      const qid = tbl.baseQid + ri * spec.angles.length + ai;
      if (usedQids.has(qid)) continue;

      const irtB = clamp(
        Number(row[row.length - 1]) / 100.0 + Number(angle.irtOffset ?? 0),
        -1.6,
        2.75,
      );
      if (irtB < irtMin - 0.35 || irtB > irtMax + 0.35) continue;

      let score = 0;
      if (respectSeen) {
        if (!this.seenTracker.hasSeen(qid)) score += 48;
        else score -= 65;
      }
      if (prevDomain !== null && dom === prevDomain && candidateDomains.length > 1) {
        score -= 65;
      }
      score -= this.seenTracker.getDomainRepeatPenalty(dom) * 0.4;
      if (irtB < irtMin || irtB > irtMax) score -= 24;
      score -= Math.abs(irtB - targetB) * 16;
      score += rng.nextFloat() * 12;

      candidatos.push({ chunk, ti, ri, ai, score });
    }

    candidatos.sort((a, b) => b.score - a.score);
    for (let i = 0; i < candidatos.length; i++) {
      const c = candidatos[i];
      const decoded = decodeShardRawQuestion(
        unifiedManifest,
        c.chunk,
        c.ti,
        c.ri,
        c.ai,
        desiredDistractors,
      );
      if (decoded && isCleanShardCandidate(decoded)) {
        return decoded;
      }
    }
    return null;
  }

  private pickFromTier1Catalog(opts: {
    wantArch: Archetype3D;
    irtMin: number;
    irtMax: number;
    targetB: number;
    allowedDomains: ReadonlyArray<DomainId>;
    usedQids: ReadonlySet<number>;
    usedDomainsInBatch: ReadonlySet<DomainId>;
    rng: RngLike;
    respectSeen: boolean;
    prevDomain: DomainId | null;
    preferGoldCurated: boolean;
    regions?: ReadonlyArray<string>;
    requiredTags?: ReadonlyArray<NarrativeTag>;
    boostTags?: ReadonlyArray<NarrativeTag>;
    lateralJammerMode?: boolean;
    taxFilter?: {
      domainId: DomainId;
      topicName: string;
      keywords: string[];
    } | null;
  }): RawQuestionRecord | null {
    // 0. Host-Country ~40% Regional Flavor Direct Lookup (#190 P2):
    // Scan `this.byRegion.get(reg)` directly with zero striding so CH/BR/SG/IS regional items aren't skipped!
    if (!opts.taxFilter && opts.regions && opts.regions.length > 0) {
      const hostPool: RawQuestionRecord[] = [];
      for (const reg of opts.regions) {
        if (reg === 'GLOBAL') continue;
        const regList = this.byRegion.get(reg);
        if (regList) hostPool.push(...regList);
      }
      if (hostPool.length > 0) {
        const allowDomSet =
          opts.allowedDomains.length > 0 ? new Set<number>(opts.allowedDomains) : null;
        const regionalCands = hostPool.filter((q) => {
          if (opts.usedQids.has(q.qid)) return false;
          if (q.archetype !== opts.wantArch) return false;
          if (allowDomSet && !allowDomSet.has(q.l0Domain)) return false;
          if (opts.respectSeen && this.seenTracker.hasSeen(q.qid)) return false;
          if (q.irtB < opts.irtMin - 0.35 || q.irtB > opts.irtMax + 0.35) return false;
          return isCleanShardCandidate(q);
        });
        if (regionalCands.length > 0) {
          opts.rng.shuffleInPlace(regionalCands);
          regionalCands.sort(
            (a, b) => Math.abs(a.irtB - opts.targetB) - Math.abs(b.irtB - opts.targetB),
          );
          const topBand = regionalCands.slice(0, Math.min(6, regionalCands.length));
          return topBand[opts.rng.nextInt(0, topBand.length - 1)];
        }
      }
    }

    let pool: RawQuestionRecord[] = [];
    if (opts.allowedDomains.length === 0) {
      pool = this.byArchetype.get(opts.wantArch) ?? [];
      if (pool.length === 0) pool = this.tier1Questions;
    } else {
      for (const did of opts.allowedDomains) {
        const dList = this.byDomain.get(did) ?? [];
        for (let i = 0; i < dList.length; i++) {
          if (dList[i].archetype === opts.wantArch) {
            pool.push(dList[i]);
          }
        }
      }
      if (pool.length === 0 && !opts.taxFilter) {
        for (const did of opts.allowedDomains) {
          pool.push(...(this.byDomain.get(did) ?? []));
        }
      }
    }

    if (opts.taxFilter) {
      const kws = opts.taxFilter.keywords.map((k) => k.toLowerCase());
      const topicLow = opts.taxFilter.topicName.trim().toLowerCase();
      pool = pool.filter((q) => {
        if (q.answerCorrect.trim().toLowerCase() === topicLow) return false;
        const hay = `${q.l1Category ?? ''} ${q.l2Subcategory ?? ''} ${q.microTopicId ?? ''} ${q.prompt}`.toLowerCase();
        return kws.some((kw) => hay.includes(kw));
      });
    }

    if (pool.length === 0) return null;

    const reqTagSet =
      opts.requiredTags && opts.requiredTags.length > 0
        ? new Set<string>(opts.requiredTags)
        : null;
    const boostTagSet =
      opts.boostTags && opts.boostTags.length > 0 ? new Set<string>(opts.boostTags) : null;
    const regionSet =
      opts.regions && opts.regions.length > 0 ? new Set<string>(opts.regions) : null;

    // Crypto-random full-pool / reservoir evaluation (NEVER walks sequential QIDs!)
    const maxSample = 520;
    for (let pass = 0; pass < 2; pass++) {
      const topBucket: Array<{ q: RawQuestionRecord; score: number }> = [];
      const total = pool.length;
      const sampleCount = Math.min(total, maxSample);

      for (let sIdx = 0; sIdx < sampleCount; sIdx++) {
        const idx = total <= maxSample ? sIdx : opts.rng.nextInt(0, total - 1);
        const q = pool[idx];
        if (opts.usedQids.has(q.qid)) continue;
        if (pass === 0 && (q.irtB < opts.irtMin || q.irtB > opts.irtMax)) continue;
        if (!isCleanShardCandidate(q)) continue;

        if (pass === 0 && reqTagSet) {
          const tags = q.narrativeTags ?? [];
          let hasAll = true;
          for (const rt of reqTagSet) {
            if (!tags.includes(rt)) {
              hasAll = false;
              break;
            }
          }
          if (!hasAll) continue;
        }

        const dom = clamp(q.l0Domain, 0, 11) as DomainId;
        let score = 0;

        if (opts.respectSeen) {
          if (!this.seenTracker.hasSeen(q.qid)) score += 52;
          else score -= 65;
          if (this.seenTracker.isMicroTopicInCooldown(q.microTopicId)) score -= 85;
          if (this.seenTracker.isL2InCooldown(q.l2Subcategory)) score -= 25;
          if (opts.allowedDomains.length !== 1) {
            score -= this.seenTracker.getDomainRepeatPenalty(dom) * 0.5;
          }
        }

        const isGoldItem = q.qid <= 4_964 || (q.qid >= 50_000 && q.qid < 60_000);
        if (opts.preferGoldCurated && isGoldItem) {
          score += q.qid <= 832 || q.qid >= 50_000 ? 26 : 16;
        }

        if (regionSet && q.regions) {
          for (let r = 0; r < q.regions.length; r++) {
            const reg = q.regions[r];
            if (reg !== 'GLOBAL' && regionSet.has(reg)) {
              score += 34;
              break;
            }
          }
        }

        if (boostTagSet && q.narrativeTags) {
          for (let t = 0; t < q.narrativeTags.length; t++) {
            if (boostTagSet.has(q.narrativeTags[t])) score += 18;
          }
        }

        if (opts.lateralJammerMode) {
          if (q.tone === 'CRYPTIC') score += 24;
          if (q.narrativeTags?.includes('LATERAL_DEDUCTION')) score += 24;
        }

        if (
          opts.prevDomain !== null &&
          dom === opts.prevDomain &&
          opts.allowedDomains.length !== 1
        ) {
          score -= 75;
        } else if (opts.allowedDomains.length !== 1 && !opts.usedDomainsInBatch.has(dom)) {
          score += 15;
        }

        score -= Math.abs(q.irtB - opts.targetB) * 16;
        score += opts.rng.nextFloat() * 14; // Crypto-random spread across top candidates!

        topBucket.push({ q, score });
      }

      if (topBucket.length > 0) {
        topBucket.sort((a, b) => b.score - a.score);
        // Draw uniformly with crypto RNG among close top-scoring unseen matches
        const eliteCutoff = topBucket[0].score - 12;
        const elite = topBucket.filter((item) => item.score >= eliteCutoff).slice(0, 10);
        return elite[opts.rng.nextInt(0, elite.length - 1)].q;
      }
    }

    return null;
  }

  private pickDeterministicFromTier1(
    wantArch: Archetype3D,
    irtMin: number,
    irtMax: number,
    targetB: number,
    usedQids: ReadonlySet<number>,
    usedDomains: ReadonlySet<DomainId>,
    rng: DeterministicRng,
  ): RawQuestionRecord {
    const pool = this.byArchetype.get(wantArch) ?? this.tier1Questions;
    let best: RawQuestionRecord = pool[0] ?? BOOTSTRAP_GENEVA_SEED[0];
    let bestScore = -1e9;

    // Exact stride = 1 full deterministic scan so every player worldwide gets identical 10 Qs!
    for (let idx = 0; idx < pool.length; idx++) {
      const q = pool[idx];
      if (usedQids.has(q.qid)) continue;
      if (!isCleanShardCandidate(q)) continue;
      const dom = clamp(q.l0Domain, 0, 11) as DomainId;
      let s = 0;
      if (q.qid <= 4_964) s += 16;
      if (!usedDomains.has(dom)) s += 20;
      if (q.irtB < irtMin || q.irtB > irtMax) s -= 25;
      s -= Math.abs(q.irtB - targetB) * 18;
      s += rng.nextFloat() * 12;
      if (s > bestScore) {
        bestScore = s;
        best = q;
      }
    }
    return best;
  }

  private indexTier1Records(records: ReadonlyArray<RawQuestionRecord>): void {
    this.tier1Questions = [];
    this.byQid.clear();
    this.byDomain.clear();
    this.byArchetype.clear();
    this.byRegion.clear();

    for (let d = 0 as DomainId; d < 12; d = (d + 1) as DomainId) {
      this.byDomain.set(d, []);
    }
    const archKeys: Archetype3D[] = [
      'SIGHTLINE_LOCK',
      'CODEX_DUAL_RING',
      'CALIBRATOR_DIAL',
      'GAUNTLET_SHATTER',
      'HERO_ARTIFACT_SYNTHESIS',
    ];
    for (const ak of archKeys) {
      this.byArchetype.set(ak, []);
    }

    for (let i = 0; i < records.length; i++) {
      const q = records[i];
      if (!q || typeof q.qid !== 'number' || !q.prompt || !isCleanShardCandidate(q)) continue;
      this.tier1Questions.push(q);
      this.byQid.set(q.qid, q);

      const dom = clamp(Math.trunc(q.l0Domain ?? 0), 0, 11) as DomainId;
      this.byDomain.get(dom)?.push(q);

      const arch: Archetype3D = q.archetype ?? 'SIGHTLINE_LOCK';
      if (!this.byArchetype.has(arch)) {
        this.byArchetype.set(arch, []);
      }
      this.byArchetype.get(arch)?.push(q);

      if (Array.isArray(q.regions)) {
        for (let r = 0; r < q.regions.length; r++) {
          const reg = q.regions[r];
          let list = this.byRegion.get(reg);
          if (!list) {
            list = [];
            this.byRegion.set(reg, list);
          }
          list.push(q);
        }
      }
    }
  }

  private async fetchTier1Questions(): Promise<RawQuestionRecord[]> {
    // Prefer streaming gzipped bundle (2.04 MB) when DecompressionStream is supported,
    // with seamless fallback to plain questions.json!
    if (typeof DecompressionStream === 'function') {
      try {
        const gzResp = await fetch(`${this.dataBaseUrl}/questions.json.gz`);
        if (gzResp.ok && gzResp.body) {
          // Guard against dev servers that auto-decompress or return non-gzip bytes
          const buf = await gzResp.arrayBuffer();
          const u8 = new Uint8Array(buf);
          let jsonText: string;
          if (u8.length >= 2 && u8[0] === 0x1f && u8[1] === 0x8b) {
            const ds = new DecompressionStream('gzip');
            const stream = new Blob([u8]).stream().pipeThrough(ds);
            jsonText = await new Response(stream).text();
          } else {
            jsonText = new TextDecoder().decode(u8);
          }
          const parsed = JSON.parse(jsonText) as RawQuestionsBundle | RawQuestionRecord[];
          const arr = Array.isArray(parsed) ? parsed : parsed.questions;
          if (Array.isArray(arr) && arr.length > 0) {
            return arr;
          }
        }
      } catch {
        // Fall through to plain questions.json
      }
    }

    const plain = await this.fetchJson<RawQuestionsBundle | RawQuestionRecord[]>(
      `${this.dataBaseUrl}/questions.json`,
    );
    return Array.isArray(plain) ? plain : (plain.questions ?? []);
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`ForgeEngine fetch failed (${resp.status}): ${url}`);
    }
    return (await resp.json()) as T;
  }
}

/** Shared singleton `ForgeEngine` instance for cross-module imports */
export const forgeEngine = new ForgeEngine();
