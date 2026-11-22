// ============================================================================
// WORLD'S SMARTEST — THE FORGE & MILLION-SCALE SHARD ENGINE TYPES
// Implements docs/PITCH_BIBLE.md §3 & §6 Contracts (1,048,576 Dense QID Space)
// ============================================================================

export type DomainId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type GlyphHint =
  | 'globe'
  | 'atom'
  | 'crown'
  | 'dna'
  | 'compass'
  | 'prism'
  | 'scales'
  | 'column'
  | 'rocket'
  | 'gear'
  | 'mask'
  | 'flame'
  | 'eye'
  | 'wave'
  | 'star'
  | 'scroll';

export type Archetype3D =
  | 'SIGHTLINE_LOCK'
  | 'CODEX_DUAL_RING'
  | 'CALIBRATOR_DIAL'
  | 'GAUNTLET_SHATTER'
  | 'HERO_ARTIFACT_SYNTHESIS'
  | 'GLOBE_PIN_DROP';

/** Alias exported alongside `Archetype3D` for Upgrade #2 ergonomics */
export type PrismArchetype = Archetype3D;

export interface GlobeCoordinates {
  readonly lat: number;
  readonly lon: number;
}

export interface GlobePinAnchor {
  readonly label: string;
  readonly lat: number;
  readonly lon: number;
}

export interface GlobePinDropSpec {
  targetLat: number;
  targetLon: number;
  targetLabel: string;
  bullseyeKm: number;
  goldKm: number;
  grazeKm: number;
  regionHint: string;
  coordHint: string;
  quickAnchors: ReadonlyArray<{ label: string; lat: number; lon: number }>;
}

export interface VisualLensPlateSpec {
  imageUrl: string;
  caption: string;
  aspect?: 'SQUARE' | 'WIDE';
  altText?: string;
  kind?: string;
}

export type FactionAffinity = 'SOVEREIGN' | 'HORIZON' | 'AGORA';

export type CampaignHubCode = 'ch' | 'gb' | 'jp' | 'br' | 'eg' | 'is' | 'sg' | 'global';

export type CampaignDifficultyTier =
  | 'EASY'
  | 'EASY+'
  | 'MEDIUM'
  | 'MEDIUM+'
  | 'CHALLENGING'
  | 'HARD'
  | 'EXPERT'
  | 'GENIUS';

export type AcademicDifficultyTier =
  | 'MIDDLE_SCHOOL'
  | 'HIGH_SCHOOL'
  | 'COLLEGE'
  | 'GRADUATE'
  | 'MENSA';

export type {
  AcademicDifficultyTierSpec,
  QuestionDifficultyAssessment,
  QuestionDifficultyBreakdown,
} from './QuestionDifficultyCalibration';

export type BriefingDifficultyPreset =
  | AcademicDifficultyTier
  | 'ADAPTIVE'
  | 'PROGRESSIVE'
  | 'EASY'
  | 'MEDIUM'
  | 'HARD'
  | 'GENIUS';

export type PeelTier = 1 | 2 | 3;

export type HeroRelicId =
  | 'meridian_astrolabe'
  | 'armillary_orrery'
  | 'origami_prism'
  | 'emerald_sphere'
  | 'cipher_box'
  | 'cryo_relay'
  | 'council_seal'
  | 'master_ledger';

export type NarrativeTag =
  | 'SOVEREIGN_BLOC'
  | 'HORIZON_TECH'
  | 'AGORA_CIVIC'
  | 'MERIDIAN_ZERO'
  | 'BLACK_SALON'
  | 'ESPIONAGE'
  | 'ETHICS'
  | 'HIGH_POWER'
  | 'INVESTIGATIVE'
  | 'LATERAL_DEDUCTION'
  | 'CLASSIFIED_LEDGER'
  | 'HIGH_STAKES_BLUFF'
  | 'ARCHIVE_CORE'
  | 'CURRENT_PULSE'
  | 'RIVAL_PRESSURE'
  | 'FINALE_SYNTHESIS';

export type ToneTag = 'PRESTIGE' | 'WITTY' | 'THRILLER' | 'CRYPTIC';

export type QuestionSourceTier =
  | 'GOLD_CURATED'
  | 'VERIFIED_BENCHMARK'
  | 'FACT_GRAPH_SHARD'
  | 'CODEX_SYNTHESIS';

export interface ForgeDomainInfo {
  id: DomainId;
  key: string;
  name: string;
  shortName: string;
  accentHex: string;
  secondaryHex: string;
  materialLabel: string;
  glyphShape: GlyphHint;
  factionAffinity: FactionAffinity;
  medallionUrl: string;
}

export interface CampaignStageSpec {
  index: number;
  hub: CampaignHubCode;
  regionCode: string;
  city: string;
  venueName: string;
  difficultyLabel: CampaignDifficultyTier;
  irtMin: number;
  irtMax: number;
  timerSec: number;
  rivalAccuracy: number;
  heroRelicId: HeroRelicId;
  heroRelicTitle: string;
  unlockedArchetypes: Archetype3D[];
  preferGoldCuratedFirst: boolean;
}

// ----------------------------------------------------------------------------
// Raw Catalog & Shard Manifest Schemas (public/data/**)
// ----------------------------------------------------------------------------

export interface RawDistractor {
  text: string;
  plausibility: number;
}

export interface RawCodexExt {
  pairs: Array<{ subject: string; target: string }>;
  decoyTarget: string;
}

export interface RawCalibratorExt {
  exactVal: number;
  unit: string;
  minVal: number;
  maxVal: number;
  step?: number;
  logScale?: boolean;
}

export interface RawGauntletExt {
  isTrue: boolean;
  isTrick: boolean;
  windowSec: number;
}

export interface RawQuestionRecord {
  qid: number;
  l0Domain: number;
  /** Optional alias accepted from visual/globe/jeopardy JSON packs (normalized to `l0Domain`) */
  domainId?: number;
  l1Category?: string;
  l2Subcategory?: string;
  /** Optional aliases accepted from visual/globe/jeopardy JSON packs */
  l2Category?: string;
  l1Id?: string;
  l2Id?: string;
  subcatId?: string;
  microTopicId?: string;
  regions?: string[];
  narrativeTags?: string[];
  tone?: string;
  irtB: number;
  irtA?: number;
  freshness?: 'EVERGREEN' | 'SLOW_DRIFT' | 'CURRENT_EVENTS';
  archetype: Archetype3D;
  prompt: string;
  answerCorrect: string;
  distractors?: RawDistractor[];
  clues?: string[];
  glyphHint?: GlyphHint;
  glyphId?: string;
  _glyphKw?: string;
  whyExplanation?: string;
  codexExt?: RawCodexExt;
  calibratorExt?: RawCalibratorExt;
  gauntletExt?: RawGauntletExt;
  globePin?: Partial<GlobePinDropSpec> & {
    targetLat: number;
    targetLon: number;
    targetLabel: string;
  };
  visualPlate?: VisualLensPlateSpec;
  heroRelicId?: HeroRelicId;
  shardType?: string;
  angleId?: string;
  /** Optional 0..1 normalized row rank inside a sorted shard table (0 = household GOAT, 1 = deep archive cut) */
  shardRowRank01?: number;
}

export interface RawVisualGlobePackBundle {
  schemaVersion?: string;
  generatedAt?: string;
  totalCount?: number;
  questions?: RawQuestionRecord[];
  globeQuestions?: RawQuestionRecord[];
  visualQuestions?: RawQuestionRecord[];
  items?: RawQuestionRecord[];
  packs?: Record<string, RawQuestionRecord[]>;
}

export interface RawQuestionsBundle {
  schemaVersion: string;
  generatedAt?: string;
  totalCount: number;
  counts?: {
    byDomain?: Record<string, number>;
    byArchetype?: Record<string, number>;
    byCountry?: Record<string, number>;
    bySource?: Record<string, number>;
  };
  questions: RawQuestionRecord[];
}

export interface ShardAngleSpec {
  id: string;
  archetype: 'SIGHTLINE_LOCK' | 'GAUNTLET_SHATTER' | 'CALIBRATOR_DIAL' | 'CODEX_DUAL_RING';
  irtOffset?: number;
  prompt?: string;
  stem?: string;
  readonly stemVariants?: ReadonlyArray<string>;
  readonly promptVariants?: ReadonlyArray<string>;
  readonly truePromptVariants?: ReadonlyArray<string>;
  readonly falsePromptVariants?: ReadonlyArray<string>;
  readonly trueStemVariants?: ReadonlyArray<string>;
  readonly falseStemVariants?: ReadonlyArray<string>;
  answerCol?: number;
  subjectCol?: number;
  targetCol?: number;
  pairCols?: Array<[number, number]>;
  decoyCol?: number;
  distractorCol?: number;
  avoidSameCol?: number | null;
  preferSameCol?: number | null;
  inlineDistCols?: number[];
  clue1?: string;
  clue2?: string;
  why?: string;
  truePrompt?: string;
  falsePrompt?: string;
  fakeCol?: number;
  inlineFakeCol?: number;
  whyTrue?: string;
  whyFalse?: string;
  exactCol?: number;
  unit?: string;
  unitCol?: number;
  step?: number;
  pad?: number;
  minClamp?: number;
  maxClamp?: number;
}

export interface ShardTableTypeSpec {
  l0Domain: number;
  l1Category: string;
  glyphHint?: GlyphHint;
  cols: string[];
  poolCols?: number[];
  angles: ShardAngleSpec[];
}

export interface ShardFileEntry {
  path: string;
  bytes: number;
  entities: number;
  questions: number;
  baseQid: number;
  qidEnd: number;
  irtMin: number;
  irtMax: number;
  types: string[];
}

export interface ShardDomainManifestEntry {
  l0Domain: number;
  key: string;
  name: string;
  entities: number;
  questions: number;
  bytes: number;
  files: ShardFileEntry[];
}

export interface ShardDecoderSpec {
  hashFn: string;
  trueFalseBitExpr: string;
  distractorWindowRadius: number;
  calibratorOffsets: number[];
  adaptiveStepBrackets: Array<[number, number]>;
}

export interface ShardManifest {
  schemaVersion: string;
  generatedAt: string;
  baseUrlRelative: string;
  qidRange: [number, number];
  totalEntities: number;
  totalQuestions: number;
  totalShardBytes: number;
  maxShardBytes: number;
  licenses: Array<{ source: string; license: string; url: string }>;
  decoderSpec: ShardDecoderSpec;
  domains: ShardDomainManifestEntry[];
  types: Record<string, ShardTableTypeSpec>;
}

export interface ShardChunkTable {
  type: string;
  baseQid: number;
  r: Array<Array<string | number>>;
}

export interface ShardChunkData {
  d: number;
  p: string[];
  t: ShardChunkTable[];
  types?: Record<string, ShardTableTypeSpec>;
}

// ----------------------------------------------------------------------------
// Normalized 5-Morph Veritas Prism Question Payloads (3D + UI Ready)
// ----------------------------------------------------------------------------

export type FacetSlotLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface SightlineFacet {
  index: number;
  slotLabel: FacetSlotLetter;
  text: string;
  isCorrect: boolean;
  plausibility: number;
  /** Simulated global consensus percentage (sums to 100) for Whistleblower People's Lens */
  crowdSharePct: number;
  /** True for the false facets that physically shatter when peeling Tier-3 Blueprint Core */
  shattersOnTier3: boolean;
}

export interface RawBossChainSpec {
  chainId: string;
  relicId: HeroRelicId | string;
  relicName: string;
  hub: CampaignHubCode | string;
  chainTitle?: string;
  steps: RawQuestionRecord[];
}

export interface RawGoldVenuePacksBundle {
  schemaVersion?: string;
  totalQuestions?: number;
  questions?: RawQuestionRecord[];
  venues?: Record<string, RawQuestionRecord[]>;
  packs?: Record<string, RawQuestionRecord[]>;
  bossChains?: RawBossChainSpec[];
  boss_chains?: RawBossChainSpec[];
}

export interface ClueTierOneSpec {
  tier: 1;
  title: 'COLD INSTINCT';
  multiplier: 3.0;
  sealed: true;
  clueText: null;
  glyphHint: GlyphHint;
  glyphId: string;
  glyphUrl: string;
  glyphCategoryLabel: string;
  shatteredFacetIndices: [];
}

export interface ClueTierTwoSpec {
  tier: 2;
  title: 'THE CLUE CORE';
  multiplier: 2.0;
  sealed: false;
  clueText: string;
  glyphHint: GlyphHint;
  glyphId: string;
  glyphUrl: string;
  glyphCategoryLabel: string;
  shatteredFacetIndices: [];
}

export interface ClueTierThreeSpec {
  tier: 3;
  title: 'THE BLUEPRINT CORE';
  multiplier: 1.2;
  sealed: false;
  clueText: string;
  glyphHint: GlyphHint;
  glyphId: string;
  glyphUrl: string;
  glyphCategoryLabel: string;
  /** Indices into `PrismQuestion.facets` of the false facets eliminated on Tier-3 peel */
  shatteredFacetIndices: number[];
}

export type ClueTierTuple = [ClueTierOneSpec, ClueTierTwoSpec, ClueTierThreeSpec];

export interface CodexRingSpec {
  subjects: [string, string, string];
  targets: [string, string, string, string];
  /** For each subject 0..2, gives the matching index 0..3 inside `targets` */
  correctTargetIndexBySubject: [number, number, number];
  pairs: Array<{ subject: string; target: string }>;
  decoyTarget: string;
}

export type CalibratorConeId = 'WIDE' | 'SHARP' | 'PINHOLE';

export interface CalibratorToleranceCone {
  id: CalibratorConeId;
  label: string;
  margin: number;
  pctOfSpan: number;
  multiplier: number;
}

export interface CalibratorDialSpec {
  exactVal: number;
  minVal: number;
  maxVal: number;
  step: number;
  unit: string;
  logScale: boolean;
  initialEstimate: number;
  exactNormalized: number;
  toleranceCones: [CalibratorToleranceCone, CalibratorToleranceCone, CalibratorToleranceCone];
}

export type GauntletAction = 'VERIFY' | 'DEBUNK' | 'CHALLENGE';

export interface GauntletPlateSpec {
  statement: string;
  isTrue: boolean;
  isTrick: boolean;
  windowSec: number;
  correctAction: GauntletAction;
}

export interface HeroSynthesisStep {
  stepIndex: 0 | 1 | 2;
  stepLabel: string;
  latchTitle: string;
  qid: number;
  prompt: string;
  answerCorrect: string;
  facets: SightlineFacet[];
  correctFacetIndex: number;
  clueTiers: ClueTierTuple;
  glyphId: string;
  glyphUrl: string;
  whyExplanation: string;
}

export interface HeroSynthesisSpec {
  chainId?: string;
  chainTitle?: string;
  relicId: HeroRelicId;
  relicName: string;
  hub: CampaignHubCode;
  steps: [HeroSynthesisStep, HeroSynthesisStep, HeroSynthesisStep];
}

export interface PrismQuestion {
  qid: number;
  l0Domain: DomainId;
  domainMeta: ForgeDomainInfo;
  l1Category: string;
  l2Subcategory: string;
  microTopicId: string;
  regions: string[];
  narrativeTags: NarrativeTag[];
  tone: ToneTag;
  irtB: number;
  irtA: number;
  /** Calibrated 5-tier Academic / IQ placement ('MIDDLE_SCHOOL' .. 'MENSA') */
  difficultyTier: AcademicDifficultyTier;
  /** Deterministic 6-factor difficulty score (0..100) */
  difficultyScore: number;
  /** Human-readable tier label ('Middle School' | 'High School' | 'College' | 'Graduate' | 'Mensa') */
  difficultyLabel: string;
  /** Tier score bonus multiplier (1.0x | 1.15x | 1.35x | 1.6x | 2.0x) */
  difficultyMultiplier: number;
  freshness: 'EVERGREEN' | 'SLOW_DRIFT' | 'CURRENT_EVENTS';
  sourceTier: QuestionSourceTier;
  archetype: Archetype3D;
  prompt: string;
  answerCorrect: string;
  clues: [string, string];
  clueTiers: ClueTierTuple;
  glyphHint: GlyphHint;
  /** Exact SDF Holographic Core Glyph ID from public/assets/glyphs/manifest.json (36 glyphs) */
  glyphId: string;
  /** Ready-to-render asset URL (`/assets/glyphs/<glyphId>.png`) */
  glyphUrl: string;
  whyExplanation: string;
  timerSec: number;
  facets: SightlineFacet[];
  correctFacetIndex: number;
  codex?: CodexRingSpec;
  calibrator?: CalibratorDialSpec;
  gauntlet?: GauntletPlateSpec;
  globePin?: GlobePinDropSpec;
  visualPlate?: VisualLensPlateSpec;
  heroRelicId?: HeroRelicId;
  heroSynthesis?: HeroSynthesisSpec;
}

export interface PlayerPrismSubmission {
  archetype?: Archetype3D;
  /** Selected facet index (0..5) for SIGHTLINE_LOCK / HERO_ARTIFACT_SYNTHESIS */
  selectedFacetIndex?: number;
  /** Optional selected answer text (checked case-insensitively alongside facet index) */
  selectedText?: string;
  /** Active Peel tier when locked: 1 = Cold Instinct (3.0x), 2 = Clue Core (2.0x), 3 = Blueprint (1.2x) */
  peelTier: PeelTier;
  /** True if player held Lock >= 0.3s to engage Conviction Overclock */
  overclocked: boolean;
  /** Normalized Overclock charge in [0..1] (0.3s -> 0.15, 1.0s -> 1.0 -> 2.0x multiplier!) */
  overclockCharge: number;
  /** Elapsed time on the question in seconds */
  elapsedSec: number;
  /** True if Chrono-Ring hit 0.0s before locking */
  timedOut?: boolean;
  // Calibrator Astrolabe inputs
  calibratorEstimate?: number;
  calibratorConeId?: CalibratorConeId;
  calibratorTolerancePct?: number; // fallback if raw slider pct passed (0.02..0.35)
  // Codex Dual-Ring inputs: target index aligned under each of the 3 top subjects [t0, t1, t2]
  codexSelectedTargetIndices?: [number, number, number] | number[];
  // Gauntlet Shatter input
  gauntletAction?: GauntletAction | 'TRUE' | 'FALSE';
  // Globe Pin-Drop 3D / 2D WGS84 coordinates submission
  selectedGlobeCoords?: { readonly lat: number; readonly lon: number };
  // Hero Artifact Synthesis step index (0..2) if evaluating single latch
  synthesisStepIndex?: 0 | 1 | 2;
  // Optional Double-or-Nothing category wager (risks ONLY optional excess bonus, NEVER banked floor!)
  doubleOrNothingActive?: boolean;
}

// ----------------------------------------------------------------------------
// Domain Counts, IRT Skill Vector & Query Interfaces
// ----------------------------------------------------------------------------

export interface DomainCountEntry {
  domainId: DomainId;
  key: string;
  name: string;
  shortName: string;
  accentHex: string;
  medallionUrl: string;
  tier1HumanCount: number;
  shardFactCount: number;
  /** Exact unique verified questions (Tier-1 + Fact-Graph Shards = 928,334 across all 12 domains) */
  verifiedCount: number;
  /** Deterministic graded Codex/Synthesis sibling pairings from verified entities */
  codexSynthesisCount: number;
  /** Total dense playable QIDs in 1..1,048,575 (~1,005,134 total across all 12 domains) */
  totalPlayableCount: number;
  shardLoaded: boolean;
  seenInDomainEst: number;
}

export interface ForgeUniverseCounts {
  tier1HumanTotal: number;
  shardFactTotal: number;
  /** 928,334 unique verified questions across Tier-1 + 12 Fact-Graph Shards */
  verifiedUniqueTotal: number;
  codexSynthesisTotal: number;
  /** 1,000,000+ dense playable QIDs inside the 20-bit 1..1,048,575 bitset space */
  totalPlayableCount: number;
  qidSpaceCapacity: number;
  seenTotal: number;
  loadedShardDomains: DomainId[];
  byDomain: DomainCountEntry[];
}

export interface DomainSkillEntry {
  domainId: DomainId;
  key: string;
  name: string;
  shortName: string;
  accentHex: string;
  medallionUrl: string;
  /** IRT ability estimate in [-2.50, +2.50] */
  theta: number;
  /** Normalized 0..100 radar mastery percentage for Meridian Passport SVG Radar */
  masteryPct: number;
  /** Category Elo rating [800..2200] */
  elo: number;
  rankTitle: string;
  attempts: number;
  correct: number;
  accuracyPct: number;
}

export interface IrtOutcomeInput {
  qid: number;
  l0Domain: DomainId;
  archetype: Archetype3D;
  irtB: number;
  irtA?: number;
  correct: boolean;
  /** 1 = Cold Instinct (3.0x), 2 = Clue Core (2.0x), 3 = Blueprint Core (1.2x) */
  peelTier?: PeelTier;
  /** Optional continuous accuracy [0..1] for Calibrator / Codex partial credit */
  accuracyRatio?: number;
  bullseye?: boolean;
  /** Strictly ignored for IRT mastery updates per PITCH_BIBLE.md §6.3 (purely a score wager!) */
  overclocked?: boolean;
}

export interface IrtSkillSnapshot {
  thetaGlobal: number;
  globalElo: number;
  globalMasteryPct: number;
  thetaDomain: number[];
  domainElo: number[];
  domainAttempts: number[];
  domainCorrect: number[];
  consecutiveMisses: number;
  currentStreak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
}

export interface ForgeQueryRequest {
  count: number;
  mode: 'CAMPAIGN' | 'DAILY' | 'BRIEFING' | 'ENDLESS' | 'TRIALS';
  hub?: CampaignHubCode | string;
  roundIndex?: number;
  domains?: DomainId[];
  /** Optional L1 Subcategory ID from `forgeEngine.getTaxonomyTree()` (e.g. `'sports'`) */
  l1SubcategoryId?: string;
  /** Optional L2 Specific Topic ID from `forgeEngine.getTaxonomyTree()` (e.g. `'sports_baseball'`) */
  l2TopicId?: string;
  excludeDomains?: DomainId[];
  archetypes?: Archetype3D[];
  difficultyPreset?: BriefingDifficultyPreset;
  irtMin?: number;
  irtMax?: number;
  targetIrtCurve?: number[];
  regions?: string[];
  requiredTags?: NarrativeTag[];
  boostTags?: NarrativeTag[];
  pinnedQids?: number[];
  excludeQids?: number[];
  /** Optional set of player-flagged/quarantined QIDs to exclude from selection */
  quarantinedQids?: ReadonlySet<number>;
  /** Optional hint to prefer Visual Blueprint or 3D Globe Pin-Drop showcase items */
  preferVisualOrGlobe?: boolean;
  /** Optional deterministic 32-bit seed (used by Daily Broadcast & Ghost Trials) */
  seed?: number;
  /** Defaults to true for non-Daily modes; Daily sets false so all players share identical 7 Qs */
  respectSeenBitset?: boolean;
  /** Number of answer facets on SIGHTLINE_LOCK (defaults to 4; supports 4..6) */
  facetCount?: 4 | 5 | 6;
  /** When true in Tokyo Jammer / Lateral mode, boosts LATERAL_DEDUCTION & CRYPTIC items */
  lateralJammerMode?: boolean;
  /** When Nemesis Nadia counter-picks in Rio/Act II+, biases toward player's weakest domain */
  nemesisCounterPick?: boolean;
}

export type ForgeQuerySpec = ForgeQueryRequest;

export interface DailyBroadcastPacket {
  utcDate: string;
  seed: number;
  broadcastNumber: number;
  questions: PrismQuestion[];
  tiebreakerIndex: number;
}

// ----------------------------------------------------------------------------
// Canonical 12-Domain Catalog & 8-Stage Progressive Campaign Curve Constants
// ----------------------------------------------------------------------------

export const FORGE_DOMAINS: ReadonlyArray<ForgeDomainInfo> = [
  {
    id: 0,
    key: 'HISTORY',
    name: 'World History',
    shortName: 'History',
    accentHex: '#d4a853',
    secondaryHex: '#6c4d26',
    materialLabel: 'Aged Bronze Patina',
    glyphShape: 'crown',
    factionAffinity: 'SOVEREIGN',
    medallionUrl: './assets/ui/cat_0.png',
  },
  {
    id: 1,
    key: 'SCIENCE',
    name: 'Science & Space',
    shortName: 'Science',
    accentHex: '#48b8f0',
    secondaryHex: '#184e77',
    materialLabel: 'Iridescent Cobalt',
    glyphShape: 'atom',
    factionAffinity: 'HORIZON',
    medallionUrl: './assets/ui/cat_1.png',
  },
  {
    id: 2,
    key: 'GEOGRAPHY',
    name: 'Geography & Wonders',
    shortName: 'Geography',
    accentHex: '#38c793',
    secondaryHex: '#17594a',
    materialLabel: 'Topographic Brass',
    glyphShape: 'globe',
    factionAffinity: 'AGORA',
    medallionUrl: './assets/ui/cat_2.png',
  },
  {
    id: 3,
    key: 'ARTS',
    name: 'Arts & Architecture',
    shortName: 'Arts',
    accentHex: '#e6c78b',
    secondaryHex: '#7d5a50',
    materialLabel: 'Carrara & Kintsugi',
    glyphShape: 'column',
    factionAffinity: 'SOVEREIGN',
    medallionUrl: './assets/ui/cat_3.png',
  },
  {
    id: 4,
    key: 'POP',
    name: 'Film, Music & Pop',
    shortName: 'Pop & Media',
    accentHex: '#e85d99',
    secondaryHex: '#5a1e4d',
    materialLabel: 'Obsidian Lacquer',
    glyphShape: 'mask',
    factionAffinity: 'AGORA',
    medallionUrl: './assets/ui/cat_4.png',
  },
  {
    id: 5,
    key: 'SPORTS',
    name: 'Sports & Games',
    shortName: 'Sports',
    accentHex: '#f08a3e',
    secondaryHex: '#6e3514',
    materialLabel: 'Carbon Graphite',
    glyphShape: 'flame',
    factionAffinity: 'AGORA',
    medallionUrl: './assets/ui/cat_5.png',
  },
  {
    id: 6,
    key: 'TECH',
    name: 'Tech & Computing',
    shortName: 'Tech',
    accentHex: '#5ce1e6',
    secondaryHex: '#1c4459',
    materialLabel: 'Etched PCB Gold',
    glyphShape: 'gear',
    factionAffinity: 'HORIZON',
    medallionUrl: './assets/ui/cat_6.png',
  },
  {
    id: 7,
    key: 'NATURE',
    name: 'Nature & Biology',
    shortName: 'Nature',
    accentHex: '#58d66b',
    secondaryHex: '#1c4d2e',
    materialLabel: 'Basalt & Jade Vein',
    glyphShape: 'dna',
    factionAffinity: 'AGORA',
    medallionUrl: './assets/ui/cat_7.png',
  },
  {
    id: 8,
    key: 'SOCIETY',
    name: 'World Affairs & Law',
    shortName: 'Society & Law',
    accentHex: '#c8b89d',
    secondaryHex: '#4f463b',
    materialLabel: 'Portland Limestone',
    glyphShape: 'scales',
    factionAffinity: 'SOVEREIGN',
    medallionUrl: './assets/ui/cat_8.png',
  },
  {
    id: 9,
    key: 'FOOD',
    name: 'Food, Craft & Design',
    shortName: 'Food & Craft',
    accentHex: '#e08e5a',
    secondaryHex: '#69341d',
    materialLabel: 'Hammered Copper',
    glyphShape: 'compass',
    factionAffinity: 'AGORA',
    medallionUrl: './assets/ui/cat_9.png',
  },
  {
    id: 10,
    key: 'MYTH',
    name: 'Myth & Literature',
    shortName: 'Myth & Lit',
    accentHex: '#8d7bf0',
    secondaryHex: '#2f2966',
    materialLabel: 'Lapis & Astral Gold',
    glyphShape: 'scroll',
    factionAffinity: 'SOVEREIGN',
    medallionUrl: './assets/ui/cat_10.png',
  },
  {
    id: 11,
    key: 'LOGIC',
    name: 'Logic & Math',
    shortName: 'Logic & Math',
    accentHex: '#f5d469',
    secondaryHex: '#3c2e63',
    materialLabel: 'Dichroic Refraction',
    glyphShape: 'prism',
    factionAffinity: 'HORIZON',
    medallionUrl: './assets/ui/cat_11.png',
  },
];

export const CAMPAIGN_DIFFICULTY_CURVE: ReadonlyArray<CampaignStageSpec> = [
  {
    index: 0,
    hub: 'ch',
    regionCode: 'CH',
    city: 'Geneva',
    venueName: 'The Vetting Chamber',
    difficultyLabel: 'EASY',
    irtMin: -1.80,
    irtMax: -0.35,
    timerSec: 22,
    rivalAccuracy: 0.52,
    heroRelicId: 'meridian_astrolabe',
    heroRelicTitle: 'Meridian Brass Astrolabe',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'CALIBRATOR_DIAL', 'GAUNTLET_SHATTER'],
    preferGoldCuratedFirst: true,
  },
  {
    index: 1,
    hub: 'gb',
    regionCode: 'GB',
    city: 'London',
    venueName: 'The Sovereign Rotunda',
    difficultyLabel: 'EASY+',
    irtMin: -1.00,
    irtMax: 0.10,
    timerSec: 20,
    rivalAccuracy: 0.58,
    heroRelicId: 'armillary_orrery',
    heroRelicTitle: 'Locked Armillary Orrery',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'GLOBE_PIN_DROP'],
    preferGoldCuratedFirst: true,
  },
  {
    index: 2,
    hub: 'jp',
    regionCode: 'JP',
    city: 'Tokyo',
    venueName: 'Shinkansen Sky Pavilion',
    difficultyLabel: 'MEDIUM',
    irtMin: -0.50,
    irtMax: 0.55,
    timerSec: 19,
    rivalAccuracy: 0.64,
    heroRelicId: 'origami_prism',
    heroRelicTitle: 'Folding Origami Prism',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'GLOBE_PIN_DROP'],
    preferGoldCuratedFirst: true,
  },
  {
    index: 3,
    hub: 'br',
    regionCode: 'BR',
    city: 'Rio de Janeiro',
    venueName: 'Botanical Glass Canopy',
    difficultyLabel: 'MEDIUM+',
    irtMin: -0.10,
    irtMax: 0.90,
    timerSec: 18,
    rivalAccuracy: 0.68,
    heroRelicId: 'emerald_sphere',
    heroRelicTitle: 'Emerald Resonance Sphere',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'CODEX_DUAL_RING', 'GLOBE_PIN_DROP'],
    preferGoldCuratedFirst: false,
  },
  {
    index: 4,
    hub: 'eg',
    regionCode: 'EG',
    city: 'Cairo',
    venueName: 'Solar Acoustic Hall',
    difficultyLabel: 'CHALLENGING',
    irtMin: 0.30,
    irtMax: 1.25,
    timerSec: 17,
    rivalAccuracy: 0.73,
    heroRelicId: 'cipher_box',
    heroRelicTitle: 'Meridian Zero Cipher Box',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'CODEX_DUAL_RING', 'GLOBE_PIN_DROP'],
    preferGoldCuratedFirst: false,
  },
  {
    index: 5,
    hub: 'is',
    regionCode: 'IS',
    city: 'Reykjavik',
    venueName: 'Geothermal Basalt Caldera',
    difficultyLabel: 'HARD',
    irtMin: 0.65,
    irtMax: 1.65,
    timerSec: 15,
    rivalAccuracy: 0.78,
    heroRelicId: 'cryo_relay',
    heroRelicTitle: 'Cryo-Core Relay',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'CODEX_DUAL_RING', 'GLOBE_PIN_DROP'],
    preferGoldCuratedFirst: false,
  },
  {
    index: 6,
    hub: 'sg',
    regionCode: 'SG',
    city: 'Singapore',
    venueName: 'Diplomatic Sky-Bridge & Core',
    difficultyLabel: 'EXPERT',
    irtMin: 1.05,
    irtMax: 2.10,
    timerSec: 14,
    rivalAccuracy: 0.83,
    heroRelicId: 'council_seal',
    heroRelicTitle: 'Fractured Council Seal',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'CODEX_DUAL_RING', 'GLOBE_PIN_DROP'],
    preferGoldCuratedFirst: false,
  },
  {
    index: 7,
    hub: 'global',
    regionCode: 'GLOBAL',
    city: 'Apex Forum',
    venueName: 'The Apex Forum',
    difficultyLabel: 'GENIUS',
    irtMin: 1.45,
    irtMax: 2.80,
    timerSec: 13,
    rivalAccuracy: 0.88,
    heroRelicId: 'master_ledger',
    heroRelicTitle: 'Master Ledger Core',
    unlockedArchetypes: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
      'GLOBE_PIN_DROP',
      'HERO_ARTIFACT_SYNTHESIS',
    ],
    preferGoldCuratedFirst: false,
  },
];

export function getForgeDomainInfo(domainId: number): ForgeDomainInfo {
  const clamped = Math.max(0, Math.min(11, Math.trunc(domainId))) as DomainId;
  return FORGE_DOMAINS[clamped];
}

export function getCampaignStageSpec(hubOrRegion: string): CampaignStageSpec {
  const norm = hubOrRegion.trim().toLowerCase();
  const found = CAMPAIGN_DIFFICULTY_CURVE.find(
    (s) => s.hub === norm || s.regionCode.toLowerCase() === norm || s.city.toLowerCase() === norm,
  );
  return found ?? CAMPAIGN_DIFFICULTY_CURVE[0];
}
