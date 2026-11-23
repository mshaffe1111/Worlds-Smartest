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
import {
  doesCandidateMatchDifficultyPreset,
  getAcademicTierSpec,
  getAdjacentAcademicTiers,
  normalizeBriefingDifficultyPreset,
  presetToAcademicTier,
  resolveCampaignAcademicTier,
  scoreQuestionDifficulty,
  shiftAcademicDifficultyTier,
} from './QuestionDifficultyCalibration';
import { MAX_QID, RoaringSeenTracker } from './RoaringSeenTracker';
import {
  CODEX_SYNTHESIS_BASE_QID,
  CODEX_SYNTHESIS_PER_DOMAIN,
  DeterministicRng,
  attachHeroSynthesisChain,
  decodeQuestionByQidFromChunks,
  decodeShardRawQuestion,
  fnv1a32,
  formatCleanTriviaNumber,
  isCleanShardCandidate,
  isShardRowFamousEnoughForTier,
  normalizeToPrismQuestion,
  normalizeVisualAssetUrl,
  sharedCryptoRng,
  synthesizeShardCodexQuestion,
  type RngLike,
} from './ShardDecoder';
import type { QuestionCardV4 } from '../v4/contracts';
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
  FORGE_DOMAINS,
  type AcademicDifficultyTier,
  type Archetype3D,
  type BriefingDifficultyPreset,
  type CalibratorToleranceCone,
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
  type RawVisualGlobePackBundle,
  type ShardChunkData,
  type ShardChunkTable,
  type ShardManifest,
  type ShardTableTypeSpec,
} from './types';

/**
 * v3.0 Strict 8-City Progressive Campaign Difficulty Curve (`MIDDLE_SCHOOL` -> `MENSA`):
 *   - Stage 1 Geneva (`ch`):    MIDDLE_SCHOOL (30s, 35% rival accuracy, 0 Codex)
 *   - Stage 2 London (`gb`):    Rounds 0–1 MIDDLE_SCHOOL, Rounds 2–4 HIGH_SCHOOL (26s, 42% rival)
 *   - Stage 3 Tokyo (`jp`):     HIGH_SCHOOL (24s, 54% rival)
 *   - Stage 4 Rio (`br`):       COLLEGE (22s, 64% rival)
 *   - Stage 5 Cairo (`eg`):     COLLEGE (20s, 70% rival)
 *   - Stage 6 Reykjavik (`is`): GRADUATE (18s, 76% rival)
 *   - Stage 7 Singapore (`sg`): GRADUATE (16s, 82% rival)
 *   - Stage 8 Apex (`global`):  MENSA (15s, 88% rival)
 */
export const CAMPAIGN_DIFFICULTY_CURVE: ReadonlyArray<CampaignStageSpec> = [
  {
    index: 0,
    hub: 'ch',
    regionCode: 'CH',
    city: 'Geneva',
    venueName: 'The Vetting Chamber',
    difficultyLabel: 'EASY',
    irtMin: -1.85,
    irtMax: -0.85,
    timerSec: 30,
    rivalAccuracy: 0.35,
    heroRelicId: 'meridian_astrolabe',
    heroRelicTitle: 'Meridian Brass Astrolabe',
    unlockedArchetypes: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL'],
    preferGoldCuratedFirst: true,
  },
  {
    index: 1,
    hub: 'gb',
    regionCode: 'GB',
    city: 'London',
    venueName: 'The Sovereign Rotunda',
    difficultyLabel: 'EASY+',
    irtMin: -1.45,
    irtMax: -0.2,
    timerSec: 26,
    rivalAccuracy: 0.42,
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
    irtMin: -0.85,
    irtMax: -0.15,
    timerSec: 24,
    rivalAccuracy: 0.54,
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
    irtMin: -0.15,
    irtMax: 0.65,
    timerSec: 22,
    rivalAccuracy: 0.64,
    heroRelicId: 'emerald_sphere',
    heroRelicTitle: 'Emerald Resonance Sphere',
    unlockedArchetypes: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
      'GLOBE_PIN_DROP',
    ],
    preferGoldCuratedFirst: false,
  },
  {
    index: 4,
    hub: 'eg',
    regionCode: 'EG',
    city: 'Cairo',
    venueName: 'Solar Acoustic Hall',
    difficultyLabel: 'CHALLENGING',
    irtMin: -0.05,
    irtMax: 0.75,
    timerSec: 20,
    rivalAccuracy: 0.7,
    heroRelicId: 'cipher_box',
    heroRelicTitle: 'Meridian Zero Cipher Box',
    unlockedArchetypes: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
      'GLOBE_PIN_DROP',
    ],
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
    irtMax: 1.45,
    timerSec: 18,
    rivalAccuracy: 0.76,
    heroRelicId: 'cryo_relay',
    heroRelicTitle: 'Cryo-Core Relay',
    unlockedArchetypes: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
      'GLOBE_PIN_DROP',
    ],
    preferGoldCuratedFirst: false,
  },
  {
    index: 6,
    hub: 'sg',
    regionCode: 'SG',
    city: 'Singapore',
    venueName: 'Diplomatic Sky-Bridge & Core',
    difficultyLabel: 'EXPERT',
    irtMin: 0.75,
    irtMax: 1.55,
    timerSec: 16,
    rivalAccuracy: 0.82,
    heroRelicId: 'council_seal',
    heroRelicTitle: 'Fractured Council Seal',
    unlockedArchetypes: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
      'GLOBE_PIN_DROP',
    ],
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
    irtMax: 2.85,
    timerSec: 15,
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

export function getCampaignStageSpec(hubOrRegion: string): CampaignStageSpec {
  const norm = String(hubOrRegion ?? 'ch').trim().toLowerCase();
  const found = CAMPAIGN_DIFFICULTY_CURVE.find(
    (s) => s.hub === norm || s.regionCode.toLowerCase() === norm || s.city.toLowerCase() === norm,
  );
  return found ?? CAMPAIGN_DIFFICULTY_CURVE[0];
}

export interface ForgeQueryRequestWithMercy extends ForgeQueryRequest {
  /** Optional Retry Mercy tier shift (`-1` or `-2`) lowering academic tier on retried missions */
  mercyTierShift?: number;
  /** Optional extra timer seconds granted by Retry Mercy ("Scout's Advantage") */
  bonusTimerSec?: number;
}

/**
 * Widens `CALIBRATOR_DIAL` tolerance cones cleanly on `MIDDLE_SCHOOL` & `HIGH_SCHOOL`
 * while mathematically preserving the `0%` untouched `initialEstimate` auto-win invariant
 * and comma-free calendar year formatting!
 */
export function applyForgivingCalibratorCones(
  pq: PrismQuestion,
  effectiveTier?: AcademicDifficultyTier | null,
): PrismQuestion {
  if (pq.archetype !== 'CALIBRATOR_DIAL' || !pq.calibrator) {
    return pq;
  }
  const tier = effectiveTier ?? pq.difficultyTier;
  if (tier !== 'MIDDLE_SCHOOL' && tier !== 'HIGH_SCHOOL') {
    return pq;
  }

  const cal = pq.calibrator;
  const span = cal.maxVal - cal.minVal;
  const step = Math.max(0.1, cal.step);
  if (!Number.isFinite(span) || span <= step * 3) {
    return pq;
  }

  const snapMargin = (rawMargin: number, minSteps: number): number => {
    const snapped = Math.round(rawMargin / step) * step;
    return Math.max(step * minSteps, snapped);
  };

  const maxDistToBound = Math.max(
    Math.abs(cal.exactVal - cal.minVal),
    Math.abs(cal.maxVal - cal.exactVal),
  );
  // Keep at least `2 * step` clearance so `initialEstimate` can ALWAYS sit strictly outside WIDE!
  const safeMaxWide = Math.max(step * 2, maxDistToBound - step * 2);

  const isMid = tier === 'MIDDLE_SCHOOL';
  const targetWidePct = isMid ? 0.24 : 0.2;
  const targetSharpPct = isMid ? 0.11 : 0.085;
  const targetPinholePct = isMid ? 0.035 : 0.025;

  const wideMargin = Math.min(
    snapMargin(span * targetWidePct, isMid ? 3 : 2),
    Math.floor((span * (isMid ? 0.36 : 0.32)) / step) * step,
    Math.floor(safeMaxWide / step) * step,
  );
  const clampedWide = Math.max(cal.toleranceCones[0]?.margin ?? step * 2, Math.min(wideMargin, safeMaxWide));
  const sharpMargin = Math.min(
    snapMargin(span * targetSharpPct, isMid ? 2 : 1),
    Math.max(step, clampedWide - step),
  );
  const pinholeMargin = Math.min(
    snapMargin(span * targetPinholePct, 1),
    Math.max(step, sharpMargin - step),
  );

  const unitSuffix = cal.unit ? ` ${cal.unit}` : '';
  const cones: [CalibratorToleranceCone, CalibratorToleranceCone, CalibratorToleranceCone] = [
    {
      id: 'WIDE',
      label: `WIDE ±${formatCleanTriviaNumber(clampedWide, cal.unit, pq.prompt)}${unitSuffix}`,
      margin: clampedWide,
      pctOfSpan: Number(clamp(clampedWide / span, 0.12, 0.38).toFixed(3)),
      multiplier: 1.5,
    },
    {
      id: 'SHARP',
      label: `SHARP ±${formatCleanTriviaNumber(sharpMargin, cal.unit, pq.prompt)}${unitSuffix}`,
      margin: sharpMargin,
      pctOfSpan: Number(clamp(sharpMargin / span, 0.05, 0.2).toFixed(3)),
      multiplier: 2.5,
    },
    {
      id: 'PINHOLE',
      label: `PINHOLE ±${formatCleanTriviaNumber(pinholeMargin, cal.unit, pq.prompt)}${unitSuffix}`,
      margin: pinholeMargin,
      pctOfSpan: Number(clamp(pinholeMargin / span, 0.015, 0.08).toFixed(3)),
      multiplier: 3.5,
    },
  ];
  cal.toleranceCones = cones;

  // Preserve 0% untouched auto-win invariant after widening WIDE cone!
  const snapToStep = (v: number): number =>
    clamp(Math.round(v / step) * step, cal.minVal, cal.maxVal);
  if (Math.abs(cal.initialEstimate - cal.exactVal) <= clampedWide * 1.08) {
    const lowAnchor = snapToStep(cal.minVal + span * 0.08);
    const highAnchor = snapToStep(cal.maxVal - span * 0.08);
    const lowDist = Math.abs(lowAnchor - cal.exactVal);
    const highDist = Math.abs(highAnchor - cal.exactVal);
    let candidate = lowDist >= highDist ? lowAnchor : highAnchor;
    if (Math.abs(candidate - cal.exactVal) <= clampedWide) {
      candidate =
        Math.abs(cal.minVal - cal.exactVal) >= Math.abs(cal.maxVal - cal.exactVal)
          ? cal.minVal
          : cal.maxVal;
    }
    cal.initialEstimate = candidate;
  }

  return pq;
}

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

const COLD_OPEN_BALLPARK_BLUEPRINT_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300">` +
      `<rect width="480" height="300" fill="#070b16"/>` +
      `<g stroke="#1b3556" stroke-width="1" opacity="0.65">` +
      `<line x1="0" y1="60" x2="480" y2="60"/><line x1="0" y1="120" x2="480" y2="120"/>` +
      `<line x1="0" y1="180" x2="480" y2="180"/><line x1="0" y1="240" x2="480" y2="240"/>` +
      `<line x1="80" y1="0" x2="80" y2="300"/><line x1="160" y1="0" x2="160" y2="300"/>` +
      `<line x1="240" y1="0" x2="240" y2="300"/><line x1="320" y1="0" x2="320" y2="300"/>` +
      `<line x1="400" y1="0" x2="400" y2="300"/></g>` +
      `<path d="M240 258 L98 116 L122 86 L236 62 L322 54 L366 136 L386 156 L240 258 Z" fill="#102542" stroke="#4cc9f0" stroke-width="2.5"/>` +
      `<line x1="98" y1="116" x2="122" y2="86" stroke="#e5c16c" stroke-width="6"/>` +
      `<polygon points="240,254 206,220 240,186 274,220" fill="none" stroke="#e5c16c" stroke-width="2"/>` +
      `<circle cx="240" cy="222" r="5" fill="#e5c16c"/>` +
      `<g font-family="monospace" font-size="13" fill="#e5c16c" text-anchor="middle">` +
      `<text x="72" y="102">310 FT</text><text x="88" y="80" fill="#4cc9f0">37 FT WALL</text>` +
      `<text x="328" y="42">420 FT</text><text x="412" y="162">302 FT</text>` +
      `<text x="240" y="284" fill="#9bc2e6" font-size="11">OUTFIELD WALL ELEVATION &amp; FOUL GEOMETRY</text>` +
      `</g></svg>`,
  );

const COLD_OPEN_AROMATIC_RING_SVG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300">` +
      `<rect width="480" height="300" fill="#070b16"/>` +
      `<g stroke="#1a3452" stroke-width="1" opacity="0.55">` +
      `<circle cx="240" cy="146" r="108" fill="none"/><circle cx="240" cy="146" r="78" fill="none"/></g>` +
      `<polygon points="240,74 302,110 302,182 240,218 178,182 178,110" fill="#0d1e36" stroke="#4cc9f0" stroke-width="3"/>` +
      `<circle cx="240" cy="146" r="46" fill="none" stroke="#e5c16c" stroke-width="2.5" stroke-dasharray="8 5"/>` +
      `<g stroke="#e5c16c" stroke-width="2">` +
      `<line x1="240" y1="74" x2="240" y2="42"/><line x1="302" y1="110" x2="330" y2="94"/>` +
      `<line x1="302" y1="182" x2="330" y2="198"/><line x1="240" y1="218" x2="240" y2="250"/>` +
      `<line x1="178" y1="182" x2="150" y2="198"/><line x1="178" y1="110" x2="150" y2="94"/></g>` +
      `<g fill="#4cc9f0"><circle cx="240" cy="74" r="5"/><circle cx="302" cy="110" r="5"/>` +
      `<circle cx="302" cy="182" r="5"/><circle cx="240" cy="218" r="5"/>` +
      `<circle cx="178" cy="182" r="5"/><circle cx="178" cy="110" r="5"/></g>` +
      `<g font-family="monospace" font-size="12" fill="#e5c16c" text-anchor="middle">` +
      `<text x="240" y="34">H</text><text x="342" y="96">H</text><text x="342" y="206">H</text>` +
      `<text x="240" y="266">H</text><text x="138" y="206">H</text><text x="138" y="96">H</text>` +
      `<text x="240" y="288" fill="#9bc2e6" font-size="11">PLANAR 6-CARBON DELOCALIZED RING · 120° BOND ANGLES</text>` +
      `</g></svg>`,
  );

/**
 * 12 Hand-Curated Instant Cold-Open Showstoppers (QIDs 1,080,001..1,080,012 — zero overlap!):
 * Available synchronously in 0ms before `questions.json.gz` even starts downloading!
 * Spans History, Science, Baseball, Geography Globe Pin-Drop, and Visual Blueprints.
 */
export const INSTANT_COLD_OPEN_PRISMS: ReadonlyArray<RawQuestionRecord> = [
  {
    qid: 1_080_001,
    l0Domain: 0,
    l1Category: 'Ancient History',
    l2Subcategory: 'Archaeology',
    microTopicId: 'cold_open_rosetta_stone',
    regions: ['EG', 'GB', 'GLOBAL'],
    narrativeTags: ['ARCHIVE_CORE'],
    tone: 'PRESTIGE',
    irtB: -0.75,
    irtA: 1.3,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Unearthed in 1799 near the Nile Delta by French soldiers, which inscribed granodiorite stele bore three scripts that unlocked ancient Egyptian hieroglyphs?',
    answerCorrect: 'Rosetta Stone',
    distractors: [
      { text: 'Behistun Inscription', plausibility: 0.78 },
      { text: 'Code of Hammurabi', plausibility: 0.82 },
      { text: 'Cyrus Cylinder', plausibility: 0.71 },
    ],
    clues: [
      'Jean-François Champollion deciphered its parallel Greek, Demotic, and hieroglyphic decree in 1822.',
      'Named for the Egyptian port town of Rashid near Alexandria, it resides in the British Museum.',
    ],
    glyphHint: 'scroll',
    whyExplanation:
      'Carved in 196 BCE with a decree of Ptolemy V in hieroglyphs, Demotic, and Ancient Greek, the Rosetta Stone gave Jean-François Champollion the key to ancient Egyptian writing.',
  },
  {
    qid: 1_080_002,
    l0Domain: 1,
    l1Category: 'Physics',
    l2Subcategory: 'Waves & Optics',
    microTopicId: 'cold_open_doppler_effect',
    regions: ['GLOBAL'],
    narrativeTags: ['HORIZON_TECH'],
    tone: 'PRESTIGE',
    irtB: -0.55,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Named for an Austrian physicist, which wave phenomenon makes an approaching siren sound higher in pitch and shifts receding starlight toward red?',
    answerCorrect: 'Doppler effect',
    distractors: [
      { text: 'Coriolis effect', plausibility: 0.84 },
      { text: 'Photoelectric effect', plausibility: 0.76 },
      { text: 'Venturi effect', plausibility: 0.68 },
    ],
    clues: [
      'Astronomers rely on its redshift to measure the expansion of the universe.',
      'Meteorologists use radar named after this 1842 principle to track storm rotation.',
    ],
    glyphHint: 'wave',
    whyExplanation:
      'Proposed by Christian Doppler in 1842, relative motion compresses wavefronts ahead of a source and stretches them behind, governing both acoustic sirens and cosmic redshift.',
  },
  {
    qid: 1_080_003,
    l0Domain: 5,
    l1Category: 'Sports',
    l2Subcategory: 'Baseball',
    l1Id: 'sports',
    l2Id: 'sports_baseball',
    subcatId: 'sports_baseball',
    microTopicId: 'cold_open_fenway_blueprint',
    regions: ['US', 'GLOBAL'],
    narrativeTags: ['AGORA_CIVIC'],
    tone: 'PRESTIGE',
    irtB: -0.65,
    irtA: 1.28,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Study the outfield wall blueprint: which historic Boston ballpark pairs a towering 37-foot left-field wall just 310 feet down the line with a 302-foot right-field foul pole?',
    answerCorrect: 'Fenway Park',
    distractors: [
      { text: 'Wrigley Field', plausibility: 0.86 },
      { text: 'Yankee Stadium', plausibility: 0.81 },
      { text: 'Camden Yards', plausibility: 0.74 },
    ],
    clues: [
      'Opened in 1912, its left-field barrier is famously known as the Green Monster.',
      'Home to the Red Sox since 1912, its short right-field pole honors Johnny Pesky.',
    ],
    visualPlate: {
      imageUrl: COLD_OPEN_BALLPARK_BLUEPRINT_SVG,
      caption: 'Outfield Wall & Foul-Line Blueprint',
      aspect: 'WIDE',
    },
    glyphHint: 'flame',
    whyExplanation:
      'Opened in Boston on April 20, 1912, Fenway Park is MLB’s oldest active venue, defined by its 37-foot Green Monster in left field, 420-foot center-right triangle, and 302-foot Pesky’s Pole.',
  },
  {
    qid: 1_080_004,
    l0Domain: 2,
    l1Category: 'World Wonders',
    l2Subcategory: 'South America',
    microTopicId: 'cold_open_machu_picchu_pin',
    regions: ['BR', 'GLOBAL'],
    narrativeTags: ['ARCHIVE_CORE'],
    tone: 'PRESTIGE',
    irtB: -0.4,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'GLOBE_PIN_DROP',
    prompt:
      'Drop your Meridian beacon on the 15th-century Incan citadel perched 2,430 meters high in the Peruvian Andes above the Urubamba River valley.',
    answerCorrect: 'Machu Picchu, Peru',
    clues: [
      'High in the central Andes of western South America, northwest of Cusco.',
      'Southern & Western Hemisphere: near 13° S, 73° W.',
    ],
    globePin: {
      targetLat: -13.1631,
      targetLon: -72.545,
      targetLabel: 'Machu Picchu, Peru',
      bullseyeKm: 300,
      goldKm: 1000,
      grazeKm: 2200,
      regionHint: 'High in the central Andes of western South America, northwest of Cusco.',
      coordHint: 'Southern & Western Hemisphere: near 13° S, 73° W.',
      quickAnchors: [
        { label: 'Machu Picchu, Peru', lat: -13.1631, lon: -72.545 },
        { label: 'Lima, Peru', lat: -12.0464, lon: -77.0428 },
        { label: 'La Paz, Bolivia', lat: -16.4897, lon: -68.1193 },
        { label: 'Quito, Ecuador', lat: -0.1807, lon: -78.4678 },
      ],
    },
    glyphHint: 'globe',
    whyExplanation:
      'Built around 1450 for Incan emperor Pachacuti, Machu Picchu sits at 13.16° S, 72.55° W in Peru’s Eastern Cordillera above the Sacred Valley.',
  },
  {
    qid: 1_080_005,
    l0Domain: 1,
    l1Category: 'Chemistry',
    l2Subcategory: 'Organic Chemistry',
    microTopicId: 'cold_open_benzene_ring',
    regions: ['GLOBAL'],
    narrativeTags: ['HORIZON_TECH'],
    tone: 'PRESTIGE',
    irtB: -0.2,
    irtA: 1.3,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Inspect the planar six-carbon aromatic ring schematic: which hydrocarbon’s delocalized bond structure did August Kekulé famously link to a dream of a snake biting its own tail?',
    answerCorrect: 'Benzene',
    distractors: [
      { text: 'Cyclohexane', plausibility: 0.85 },
      { text: 'Toluene', plausibility: 0.79 },
      { text: 'Naphthalene', plausibility: 0.73 },
    ],
    clues: [
      'Michael Faraday first isolated this aromatic liquid in 1825 with molecular formula C₆H₆.',
      'Its six carbon atoms share pi-electrons equally around a symmetrical hexagonal ring.',
    ],
    visualPlate: {
      imageUrl: COLD_OPEN_AROMATIC_RING_SVG,
      caption: 'Planar Aromatic Ring Molecular Blueprint',
      aspect: 'WIDE',
    },
    glyphHint: 'atom',
    whyExplanation:
      'Benzene (C₆H₆) is the parent aromatic hydrocarbon; in 1865 August Kekulé proposed its cyclic ring structure, later explained by quantum electron delocalization.',
  },
  {
    qid: 1_080_006,
    l0Domain: 2,
    l1Category: 'European Geography',
    l2Subcategory: 'Nordic Capitals',
    microTopicId: 'cold_open_reykjavik_pin',
    regions: ['IS', 'GLOBAL'],
    narrativeTags: ['MERIDIAN_ZERO'],
    tone: 'THRILLER',
    irtB: -0.35,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'GLOBE_PIN_DROP',
    prompt:
      'Pinpoint the volcanic North Atlantic island capital straddling the Mid-Atlantic Ridge, near where Europe’s oldest surviving parliament met at Þingvellir in 930 CE.',
    answerCorrect: 'Reykjavik, Iceland',
    clues: [
      'Sub-Arctic North Atlantic island situated just below the Arctic Circle.',
      'Northern & Western Hemisphere: near 64° N, 22° W.',
    ],
    globePin: {
      targetLat: 64.1466,
      targetLon: -21.9426,
      targetLabel: 'Reykjavik, Iceland',
      bullseyeKm: 300,
      goldKm: 1000,
      grazeKm: 2200,
      regionHint: 'Sub-Arctic North Atlantic island situated just below the Arctic Circle.',
      coordHint: 'Northern & Western Hemisphere: near 64° N, 22° W.',
      quickAnchors: [
        { label: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426 },
        { label: 'Oslo, Norway', lat: 59.9139, lon: 10.7522 },
        { label: 'Nuuk, Greenland', lat: 64.1814, lon: -51.6941 },
        { label: 'Torshavn, Faroe Islands', lat: 62.0079, lon: -6.791 },
      ],
    },
    glyphHint: 'compass',
    whyExplanation:
      'At 64.15° N, 21.94° W, Reykjavik is the world’s northernmost capital of a sovereign state, powered almost entirely by Iceland’s geothermal and hydroelectric energy.',
  },
  {
    qid: 1_080_007,
    l0Domain: 5,
    l1Category: 'Sports',
    l2Subcategory: 'Baseball',
    l1Id: 'sports',
    l2Id: 'sports_baseball',
    subcatId: 'sports_baseball',
    microTopicId: 'cold_open_jackie_robinson_1947',
    regions: ['US', 'GLOBAL'],
    narrativeTags: ['AGORA_CIVIC'],
    tone: 'PRESTIGE',
    irtB: -0.45,
    irtA: 1.3,
    freshness: 'EVERGREEN',
    archetype: 'CALIBRATOR_DIAL',
    prompt:
      'In what year did Jackie Robinson make his Brooklyn Dodgers debut, breaking Major League Baseball’s modern color barrier?',
    answerCorrect: '1947 CE',
    clues: [
      'He took the field at Ebbets Field on April 15 two years after World War II ended.',
      'He won the inaugural MLB Rookie of the Year honor in the late 1940s.',
    ],
    calibratorExt: {
      exactVal: 1947,
      unit: 'CE',
      minVal: 1900,
      maxVal: 1990,
      step: 1,
    },
    glyphHint: 'flame',
    whyExplanation:
      'On April 15, 1947, Jackie Robinson started at first base for the Brooklyn Dodgers, transforming American sports and culture; his number 42 is retired across all of MLB.',
  },
  {
    qid: 1_080_008,
    l0Domain: 3,
    l1Category: 'Architecture',
    l2Subcategory: 'Classical Monuments',
    microTopicId: 'cold_open_parthenon_pin',
    regions: ['GLOBAL'],
    narrativeTags: ['SOVEREIGN_BLOC'],
    tone: 'PRESTIGE',
    irtB: -0.5,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'GLOBE_PIN_DROP',
    prompt:
      'Drop your beacon on the classical marble temple dedicated to Athena crowning the rocky Acropolis above the Aegean Sea.',
    answerCorrect: 'Parthenon, Athens',
    clues: [
      'Southeastern Mediterranean peninsula in Attica, mainland Greece.',
      'Northern & Eastern Hemisphere: near 38° N, 24° E.',
    ],
    globePin: {
      targetLat: 37.9715,
      targetLon: 23.7267,
      targetLabel: 'Parthenon, Athens',
      bullseyeKm: 300,
      goldKm: 1000,
      grazeKm: 2200,
      regionHint: 'Southeastern Mediterranean peninsula in Attica, mainland Greece.',
      coordHint: 'Northern & Eastern Hemisphere: near 38° N, 24° E.',
      quickAnchors: [
        { label: 'Parthenon, Athens', lat: 37.9715, lon: 23.7267 },
        { label: 'Colosseum, Rome', lat: 41.8902, lon: 12.4922 },
        { label: 'Giza Necropolis, Egypt', lat: 29.9792, lon: 31.1342 },
        { label: 'Hagia Sophia, Istanbul', lat: 41.0086, lon: 28.9802 },
      ],
    },
    glyphHint: 'column',
    whyExplanation:
      'Completed in 438 BCE under Pericles by architects Ictinus and Callicrates, the Parthenon crowns the Acropolis of Athens at 37.97° N, 23.73° E.',
  },
  {
    qid: 1_080_009,
    l0Domain: 6,
    l1Category: 'Computing',
    l2Subcategory: 'Internet History',
    microTopicId: 'cold_open_berners_lee_www',
    regions: ['CH', 'GB', 'GLOBAL'],
    narrativeTags: ['HORIZON_TECH'],
    tone: 'PRESTIGE',
    irtB: -0.6,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Working at CERN in 1989, which British computer scientist authored the hypertext proposal that invented HTTP, HTML, and the World Wide Web?',
    answerCorrect: 'Tim Berners-Lee',
    distractors: [
      { text: 'Vint Cerf', plausibility: 0.84 },
      { text: 'Alan Turing', plausibility: 0.78 },
      { text: 'Linus Torvalds', plausibility: 0.72 },
    ],
    clues: [
      'He built the first web browser and server on a NeXT workstation in Geneva.',
      'In 1994 he founded the World Wide Web Consortium (W3C) at MIT.',
    ],
    glyphHint: 'gear',
    whyExplanation:
      'Tim Berners-Lee proposed the World Wide Web at CERN in March 1989 and released the foundational HTTP, HTML, and URL specifications royalty-free to the public in 1993.',
  },
  {
    qid: 1_080_010,
    l0Domain: 5,
    l1Category: 'Sports',
    l2Subcategory: 'Baseball',
    l1Id: 'sports',
    l2Id: 'sports_baseball',
    subcatId: 'sports_baseball',
    microTopicId: 'cold_open_wrigley_chicago_pin',
    regions: ['US', 'GLOBAL'],
    narrativeTags: ['AGORA_CIVIC'],
    tone: 'WITTY',
    irtB: -0.5,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'GLOBE_PIN_DROP',
    prompt:
      'Pinpoint the Great Lakes metropolis home to Wrigley Field, the ivy-walled National League ballpark opened in 1914 on the North Side.',
    answerCorrect: 'Chicago, Illinois',
    clues: [
      'Upper Midwestern United States along the southwestern shore of Lake Michigan.',
      'Northern & Western Hemisphere: near 42° N, 88° W.',
    ],
    globePin: {
      targetLat: 41.9484,
      targetLon: -87.6553,
      targetLabel: 'Chicago, Illinois',
      bullseyeKm: 300,
      goldKm: 1000,
      grazeKm: 2200,
      regionHint: 'Upper Midwestern United States along the southwestern shore of Lake Michigan.',
      coordHint: 'Northern & Western Hemisphere: near 42° N, 88° W.',
      quickAnchors: [
        { label: 'Chicago, Illinois', lat: 41.9484, lon: -87.6553 },
        { label: 'Boston, Massachusetts', lat: 42.3467, lon: -71.0972 },
        { label: 'St. Louis, Missouri', lat: 38.627, lon: -90.1994 },
        { label: 'Minneapolis, Minnesota', lat: 44.9778, lon: -93.265 },
      ],
    },
    glyphHint: 'globe',
    whyExplanation:
      'Located in Chicago’s Lake View neighborhood at 41.95° N, 87.66° W, Wrigley Field has hosted the Cubs since 1916 and became famous for its hand-turned scoreboard and ivy outfield walls.',
  },
  {
    qid: 1_080_011,
    l0Domain: 7,
    l1Category: 'Marine Biology',
    l2Subcategory: 'Cephalopods',
    microTopicId: 'cold_open_octopus_hearts',
    regions: ['GLOBAL'],
    narrativeTags: ['AGORA_CIVIC'],
    tone: 'WITTY',
    irtB: -0.8,
    irtA: 1.2,
    freshness: 'EVERGREEN',
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Which intelligent marine cephalopod relies on three hearts, copper-rich blue blood, and specialized chromatophores to mimic textures in milliseconds?',
    answerCorrect: 'Octopus',
    distractors: [
      { text: 'Nautilus', plausibility: 0.78 },
      { text: 'Manta ray', plausibility: 0.65 },
      { text: 'Horseshoe crab', plausibility: 0.74 },
    ],
    clues: [
      'Two of its hearts pump blood through the gills while a third circulates it through the body.',
      'Its eight flexible arms house roughly two-thirds of its entire nervous system.',
    ],
    glyphHint: 'dna',
    whyExplanation:
      'Octopuses use copper-based hemocyanin (which turns blue when oxygenated), two branchial hearts, one systemic heart, and thousands of pigment-shifting chromatophores.',
  },
  {
    qid: 1_080_012,
    l0Domain: 0,
    l1Category: 'Space History',
    l2Subcategory: 'Apollo Program',
    microTopicId: 'cold_open_apollo_11_1969',
    regions: ['US', 'GLOBAL'],
    narrativeTags: ['HORIZON_TECH'],
    tone: 'PRESTIGE',
    irtB: -0.7,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: 'CALIBRATOR_DIAL',
    prompt:
      'In what year did Apollo 11’s lunar module Eagle touch down on the Sea of Tranquility, carrying the first humans to walk on the Moon?',
    answerCorrect: '1969 CE',
    clues: [
      'Neil Armstrong and Buzz Aldrin landed on July 20 in the final year of the 1960s.',
      'The landing fulfilled John F. Kennedy’s 1961 pledge before the decade closed.',
    ],
    calibratorExt: {
      exactVal: 1969,
      unit: 'CE',
      minVal: 1945,
      maxVal: 2005,
      step: 1,
    },
    glyphHint: 'rocket',
    whyExplanation:
      'Apollo 11 landed on the Moon on July 20, 1969, watched on television by an estimated 650 million people around the world.',
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

  private coldOpenByQid: Map<number, RawQuestionRecord> = new Map();
  private visualGlobeRecords: RawQuestionRecord[] = [];
  private visualGlobePackLoaded = false;
  private jeopardySignatureRecords: RawQuestionRecord[] = [];
  private jeopardyBySubcatId: Map<string, RawQuestionRecord[]> = new Map();
  private jeopardyByDomain: Map<DomainId, RawQuestionRecord[]> = new Map();
  private jeopardySignaturePackLoaded = false;
  private curatedV4Cards: QuestionCardV4[] = [];
  private curatedV4PackLoaded = false;
  private quarantinedQids: Set<number> = new Set();

  private shardManifest: ShardManifest | null = null;
  private extraShardTypes: Record<string, ShardTableTypeSpec> = {};
  private subcatShardBonusByDomain: Map<DomainId, number> = new Map();
  private subcatQidRangesByDomain: Map<DomainId, Array<[number, number]>> = new Map();
  private subcatFileIndex: Array<{
    domainId: DomainId;
    path: string;
    baseQid: number;
    qidEnd: number;
  }> = [];
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
    this.dataBaseUrl = (options.dataBaseUrl ?? './data').replace(/\/+$/, '');
    this.seenTracker = options.seenTracker ?? new RoaringSeenTracker();
    this.irtDirector = options.irtDirector ?? new IrtAdaptiveDirector();
    for (const q of INSTANT_COLD_OPEN_PRISMS) {
      this.coldOpenByQid.set(q.qid, q);
    }
    this.indexTier1Records(BOOTSTRAP_GENEVA_SEED);
  }

  // --------------------------------------------------------------------------
  // Instant 0ms Cold-Open Trial Prism & Quarantine Filter Controls
  // --------------------------------------------------------------------------

  public setQuarantinedQids(qids: ReadonlySet<number> | ReadonlyArray<number>): void {
    this.quarantinedQids.clear();
    for (const qid of qids) {
      if (Number.isFinite(qid)) {
        this.quarantinedQids.add(Math.trunc(qid));
      }
    }
  }

  public addQuarantinedQid(qid: number): void {
    if (Number.isFinite(qid)) {
      this.quarantinedQids.add(Math.trunc(qid));
    }
  }

  public getQuarantinedQids(): ReadonlySet<number> {
    return this.quarantinedQids;
  }

  /**
   * Returns 1 hand-curated showstopper `PrismQuestion` **synchronously in 0ms**
   * before `questions.json.gz` or any network fetch completes!
   */
  public getInstantTrialPrism(
    excludeQids?: ReadonlyArray<number> | ReadonlySet<number>,
    preferredArchetype?: Archetype3D,
  ): PrismQuestion {
    const excludeSet = new Set<number>(this.quarantinedQids);
    if (excludeQids) {
      for (const qid of excludeQids) {
        excludeSet.add(qid);
      }
    }

    let pool = INSTANT_COLD_OPEN_PRISMS.filter((q) => !excludeSet.has(q.qid));
    if (pool.length === 0) {
      pool = [...INSTANT_COLD_OPEN_PRISMS];
    }

    if (preferredArchetype) {
      const archFiltered = pool.filter((q) => q.archetype === preferredArchetype);
      if (archFiltered.length > 0) {
        pool = archFiltered;
      }
    }

    const unseen = pool.filter((q) => !this.seenTracker.hasSeen(q.qid));
    const drawPool = unseen.length > 0 ? unseen : pool;
    const chosen = drawPool[sharedCryptoRng.nextInt(0, drawPool.length - 1)];

    return normalizeToPrismQuestion(chosen, {
      timerSec: chosen.archetype === 'GLOBE_PIN_DROP' ? 22 : 18,
      facetCount: 4,
      shuffleSalt: sharedCryptoRng.nextUint32(),
      sourceTier: 'GOLD_CURATED',
    });
  }

  // --------------------------------------------------------------------------
  // Startup & Lazy Domain Shard Streaming (<150ms on-demand)
  // --------------------------------------------------------------------------

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initializes `ForgeEngine` by loading `public/data/questions.json` (20,165 pure-factual
   * human questions) + `public/data/shards/shard_manifest.json` (929,564 shard metadata)
   * + non-blocking Visual/Globe & Jeopardy Signature packs (gracefully tolerating missing files).
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
      const [
        questionsResult,
        manifestResult,
        goldPackResult,
        taxonomyResult,
        visualGlobeResult,
        jeopardySigResult,
        curatedV4Result,
      ] = await Promise.allSettled([
        this.fetchTier1Questions(),
        this.fetchJson<ShardManifest>(`${this.dataBaseUrl}/shards/shard_manifest.json`),
        this.fetchJson<RawGoldVenuePacksBundle | RawQuestionRecord[]>(
          `${this.dataBaseUrl}/gold_venue_packs.json`,
        ),
        this.fetchJson<Record<string, unknown>>(
          `${this.dataBaseUrl}/shards/taxonomy_tree.json`,
        ),
        this.fetchJson<RawVisualGlobePackBundle | RawQuestionRecord[]>(
          `${this.dataBaseUrl}/visual_globe_packs.json`,
        ),
        this.fetchJson<RawVisualGlobePackBundle | RawQuestionRecord[]>(
          `${this.dataBaseUrl}/jeopardy_signature_packs.json`,
        ),
        this.fetchJson<QuestionCardV4[] | { cards?: QuestionCardV4[]; items?: QuestionCardV4[] }>(
          `${this.dataBaseUrl}/curated_v4_witty_pack.json`,
        ),
      ]);

      if (questionsResult.status === 'fulfilled' && questionsResult.value.length > 0) {
        this.indexTier1Records(questionsResult.value);
      }
      if (goldPackResult.status === 'fulfilled' && goldPackResult.value) {
        this.ingestGoldVenuePacksData(goldPackResult.value);
      }
      if (visualGlobeResult.status === 'fulfilled' && visualGlobeResult.value) {
        this.ingestVisualGlobePackData(visualGlobeResult.value);
      }
      if (jeopardySigResult.status === 'fulfilled' && jeopardySigResult.value) {
        this.ingestJeopardySignaturePackData(jeopardySigResult.value);
      }
      if (curatedV4Result.status === 'fulfilled' && curatedV4Result.value) {
        this.ingestCuratedV4PackData(curatedV4Result.value);
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
   * Loads (or hot-reloads) `public/data/curated_v4_witty_pack.json`
   * (240+ hand-crafted, witty, curiosity-hook 7-format game-show cards across all 12 domains).
   */
  public async loadCuratedV4Pack(customUrl?: string): Promise<number> {
    if (this.curatedV4PackLoaded && !customUrl) {
      return this.curatedV4Cards.length;
    }
    try {
      const url = customUrl ?? `${this.dataBaseUrl}/curated_v4_witty_pack.json`;
      const bundle = await this.fetchJson<
        QuestionCardV4[] | { cards?: QuestionCardV4[]; items?: QuestionCardV4[] }
      >(url);
      return this.ingestCuratedV4PackData(bundle);
    } catch {
      return 0;
    }
  }

  public ingestCuratedV4PackData(
    bundle: QuestionCardV4[] | { cards?: QuestionCardV4[]; items?: QuestionCardV4[] },
  ): number {
    const rawList: QuestionCardV4[] = Array.isArray(bundle)
      ? bundle
      : Array.isArray(bundle?.cards)
        ? bundle.cards
        : Array.isArray(bundle?.items)
          ? bundle.items
          : [];
    if (rawList.length === 0) return 0;

    const existingIds = new Set<number>(this.curatedV4Cards.map((c) => c.qid));
    let added = 0;
    let nextQid = 1_090_001;

    const tierToIrt = (tier: QuestionCardV4['difficultyTier']): number => {
      switch (tier) {
        case 'MIDDLE_SCHOOL':
          return -1.25;
        case 'HIGH_SCHOOL':
          return -0.5;
        case 'COLLEGE':
          return 0.25;
        case 'GRADUATE':
          return 1.05;
        case 'MENSA':
          return 1.95;
      }
    };

    for (const card of rawList) {
      if (!card || !card.prompt || !card.format) continue;
      const qid =
        typeof card.qid === 'number' && card.qid >= 1_090_000 && !existingIds.has(card.qid)
          ? Math.trunc(card.qid)
          : (() => {
              while (existingIds.has(nextQid) || this.byQid.has(nextQid)) nextQid++;
              return nextQid++;
            })();
      const cleanCard: QuestionCardV4 = { ...card, qid };
      existingIds.add(qid);
      this.curatedV4Cards.push(cleanCard);
      added++;

      // Bridge MULTIPLE_CHOICE & PINPOINT_DIAL & SVG VISUAL_SPOTTER cards into Tier-1 indexes too
      if (
        card.format === 'MULTIPLE_CHOICE' &&
        Array.isArray(card.choices) &&
        card.choices.length === 4 &&
        card.correctIndex !== undefined
      ) {
        const answerCorrect = card.choices[card.correctIndex];
        const distractors = card.choices
          .filter((_, idx) => idx !== card.correctIndex)
          .map((text, idx) => ({ text, plausibility: Number((0.84 - idx * 0.05).toFixed(2)) }));
        const bridged: RawQuestionRecord = {
          qid,
          l0Domain: card.domainId,
          l1Category: card.categoryLabel,
          l2Subcategory: card.wittyHeader ?? card.categoryLabel,
          microTopicId: `v4_witty_${qid}`,
          regions: ['GLOBAL'],
          narrativeTags: ['ARCHIVE_CORE'],
          tone: 'WITTY',
          irtB: tierToIrt(card.difficultyTier),
          irtA: 1.3,
          freshness: 'EVERGREEN',
          archetype: 'SIGHTLINE_LOCK',
          prompt: card.prompt,
          answerCorrect,
          distractors,
          clues: [card.helpfulHint, card.helpfulHint],
          whyExplanation: card.funFactWhy,
        };
        if (isCleanShardCandidate(bridged) && !this.byQid.has(qid)) {
          this.attachExtraRecordToTier1Indexes(bridged);
        }
      } else if (card.format === 'PINPOINT_DIAL' && card.pinpoint) {
        const pp = card.pinpoint;
        const bridged: RawQuestionRecord = {
          qid,
          l0Domain: card.domainId,
          l1Category: card.categoryLabel,
          l2Subcategory: card.wittyHeader ?? card.categoryLabel,
          microTopicId: `v4_witty_${qid}`,
          regions: ['GLOBAL'],
          narrativeTags: ['ARCHIVE_CORE'],
          tone: 'WITTY',
          irtB: tierToIrt(card.difficultyTier),
          irtA: 1.3,
          freshness: 'EVERGREEN',
          archetype: 'CALIBRATOR_DIAL',
          prompt: card.prompt,
          answerCorrect: `${pp.exactVal}${pp.unitLabel ? ` ${pp.unitLabel}` : ''}`.trim(),
          clues: [card.helpfulHint, card.helpfulHint],
          whyExplanation: card.funFactWhy,
          calibratorExt: {
            exactVal: pp.exactVal,
            unit: pp.unitLabel,
            minVal: pp.minVal,
            maxVal: pp.maxVal,
            step: pp.step,
          },
        };
        if (isCleanShardCandidate(bridged) && !this.byQid.has(qid)) {
          this.attachExtraRecordToTier1Indexes(bridged);
        }
      }
    }

    if (added > 0) {
      this.curatedV4PackLoaded = true;
    }
    return added;
  }

  public getCuratedV4Cards(): ReadonlyArray<QuestionCardV4> {
    return this.curatedV4Cards;
  }

  public getLoadedShardChunksForDomain(domainId: DomainId): ReadonlyArray<ShardChunkData> {
    return this.loadedShardsByDomain.get(clamp(Math.trunc(domainId), 0, 11) as DomainId) ?? [];
  }

  public getUnifiedManifest(): ShardManifest | null {
    return this.getUnifiedManifestForDecode();
  }

  public getVisualGlobeRecords(): ReadonlyArray<RawQuestionRecord> {
    return this.visualGlobeRecords;
  }

  public getJeopardyRecords(domainId?: DomainId): ReadonlyArray<RawQuestionRecord> {
    if (domainId === undefined) return this.jeopardySignatureRecords;
    return this.jeopardyByDomain.get(clamp(Math.trunc(domainId), 0, 11) as DomainId) ?? [];
  }

  public getCleanTier1Records(domainId?: DomainId): ReadonlyArray<RawQuestionRecord> {
    if (domainId === undefined) return this.tier1Questions;
    return this.byDomain.get(clamp(Math.trunc(domainId), 0, 11) as DomainId) ?? [];
  }

  public getDataBaseUrl(): string {
    return this.dataBaseUrl;
  }

  /**
   * Loads (or hot-reloads) Upgrade #2 `public/data/visual_globe_packs.json`
   * (`GLOBE_PIN_DROP` + Visual Sapphire Blueprint `SIGHTLINE_LOCK` items).
   */
  public async loadVisualGlobePacks(customUrl?: string): Promise<number> {
    if (this.visualGlobePackLoaded && !customUrl) {
      return this.visualGlobeRecords.length;
    }
    try {
      const url = customUrl ?? `${this.dataBaseUrl}/visual_globe_packs.json`;
      const bundle = await this.fetchJson<RawVisualGlobePackBundle | RawQuestionRecord[]>(url);
      return this.ingestVisualGlobePackData(bundle);
    } catch {
      return 0;
    }
  }

  public ingestVisualGlobePackData(
    bundle: RawVisualGlobePackBundle | RawQuestionRecord[],
  ): number {
    const rawList = this.extractPackRecordList(bundle);
    if (rawList.length === 0) return 0;

    let addedCount = 0;
    let nextAllocQid = 1_070_001;
    const allocQid = (candidate?: number): number => {
      if (
        typeof candidate === 'number' &&
        candidate >= 1 &&
        candidate <= MAX_QID &&
        !this.byQid.has(candidate)
      ) {
        return Math.trunc(candidate);
      }
      while (this.byQid.has(nextAllocQid)) {
        nextAllocQid++;
      }
      return nextAllocQid++;
    };

    for (const raw of rawList) {
      const normalized = this.prepareExternalPackRecord(raw, allocQid);
      if (!normalized) continue;
      this.visualGlobeRecords.push(normalized);
      this.attachExtraRecordToTier1Indexes(normalized);
      addedCount++;
    }

    if (addedCount > 0) {
      this.visualGlobePackLoaded = true;
    }
    return addedCount;
  }

  /**
   * Loads (or hot-reloads) Upgrade #3 `public/data/jeopardy_signature_packs.json`
   * (`1,600+` Jeopardy-style multi-clue questions across all 12 domains & 157 L2 subcategories).
   */
  public async loadJeopardySignaturePacks(customUrl?: string): Promise<number> {
    if (this.jeopardySignaturePackLoaded && !customUrl) {
      return this.jeopardySignatureRecords.length;
    }
    try {
      const url = customUrl ?? `${this.dataBaseUrl}/jeopardy_signature_packs.json`;
      const bundle = await this.fetchJson<RawVisualGlobePackBundle | RawQuestionRecord[]>(url);
      return this.ingestJeopardySignaturePackData(bundle);
    } catch {
      return 0;
    }
  }

  public ingestJeopardySignaturePackData(
    bundle: RawVisualGlobePackBundle | RawQuestionRecord[],
  ): number {
    const rawList = this.extractPackRecordList(bundle);
    if (rawList.length === 0) return 0;

    let addedCount = 0;
    let nextAllocQid = 1_060_001;
    const allocQid = (candidate?: number): number => {
      if (
        typeof candidate === 'number' &&
        candidate >= 1 &&
        candidate <= MAX_QID &&
        !this.byQid.has(candidate)
      ) {
        return Math.trunc(candidate);
      }
      while (this.byQid.has(nextAllocQid)) {
        nextAllocQid++;
      }
      return nextAllocQid++;
    };

    for (const raw of rawList) {
      const normalized = this.prepareExternalPackRecord(raw, allocQid);
      if (!normalized) continue;
      this.jeopardySignatureRecords.push(normalized);
      const dom = clamp(Math.trunc(normalized.l0Domain ?? 0), 0, 11) as DomainId;
      let domList = this.jeopardyByDomain.get(dom);
      if (!domList) {
        domList = [];
        this.jeopardyByDomain.set(dom, domList);
      }
      domList.push(normalized);

      const subKeys = [
        normalized.subcatId,
        normalized.l2Id,
        normalized.l2Subcategory,
        normalized.l2Category,
      ]
        .filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
        .map((k) => k.trim().toLowerCase());
      const uniqueSubKeys = Array.from(new Set(subKeys));
      for (const sk of uniqueSubKeys) {
        let sList = this.jeopardyBySubcatId.get(sk);
        if (!sList) {
          sList = [];
          this.jeopardyBySubcatId.set(sk, sList);
        }
        sList.push(normalized);
      }

      this.attachExtraRecordToTier1Indexes(normalized);
      addedCount++;
    }

    if (addedCount > 0) {
      this.jeopardySignaturePackLoaded = true;
    }
    return addedCount;
  }

  private extractPackRecordList(
    bundle: RawVisualGlobePackBundle | RawQuestionRecord[],
  ): RawQuestionRecord[] {
    if (Array.isArray(bundle)) {
      return bundle;
    }
    if (!bundle || typeof bundle !== 'object') {
      return [];
    }
    const out: RawQuestionRecord[] = [];
    if (Array.isArray(bundle.questions)) out.push(...bundle.questions);
    if (Array.isArray(bundle.globeQuestions)) out.push(...bundle.globeQuestions);
    if (Array.isArray(bundle.visualQuestions)) out.push(...bundle.visualQuestions);
    if (Array.isArray(bundle.items)) out.push(...bundle.items);
    if (bundle.packs && typeof bundle.packs === 'object') {
      for (const list of Object.values(bundle.packs)) {
        if (Array.isArray(list)) out.push(...list);
      }
    }
    return out;
  }

  private prepareExternalPackRecord(
    raw: RawQuestionRecord,
    allocQid: (candidate?: number) => number,
  ): RawQuestionRecord | null {
    if (!raw || !raw.prompt) return null;
    const arch: Archetype3D = raw.archetype ?? (raw.globePin ? 'GLOBE_PIN_DROP' : 'SIGHTLINE_LOCK');
    const answerCorrect =
      raw.answerCorrect?.trim() ||
      (arch === 'GLOBE_PIN_DROP' ? raw.globePin?.targetLabel?.trim() ?? '' : '');
    if (!answerCorrect) return null;

    const qid = allocQid(raw.qid);
    const l0Domain = clamp(Math.trunc(raw.l0Domain ?? raw.domainId ?? 0), 0, 11) as DomainId;
    const regions =
      Array.isArray(raw.regions) && raw.regions.length > 0 ? raw.regions : ['GLOBAL'];
    const rawDists = Array.isArray(raw.distractors)
      ? raw.distractors.map((d, idx) =>
          typeof d === 'string'
            ? { text: d, plausibility: Number((0.82 - idx * 0.05).toFixed(2)) }
            : d,
        )
      : undefined;

    const visualPlate =
      raw.visualPlate && raw.visualPlate.imageUrl
        ? {
            ...raw.visualPlate,
            imageUrl: normalizeVisualAssetUrl(raw.visualPlate.imageUrl),
          }
        : undefined;

    const enriched: RawQuestionRecord = {
      ...raw,
      qid,
      l0Domain,
      domainId: l0Domain,
      l2Subcategory: raw.l2Subcategory ?? raw.l2Category,
      archetype: arch,
      answerCorrect,
      regions,
      ...(rawDists ? { distractors: rawDists } : {}),
      ...(visualPlate ? { visualPlate } : {}),
    };

    if (!isCleanShardCandidate(enriched)) {
      return null;
    }
    return enriched;
  }

  private attachExtraRecordToTier1Indexes(enriched: RawQuestionRecord): void {
    this.tier1Questions.push(enriched);
    this.byQid.set(enriched.qid, enriched);
    const dom = clamp(Math.trunc(enriched.l0Domain ?? 0), 0, 11) as DomainId;
    this.byDomain.get(dom)?.push(enriched);
    const arch: Archetype3D = enriched.archetype ?? 'SIGHTLINE_LOCK';
    if (!this.byArchetype.has(arch)) this.byArchetype.set(arch, []);
    this.byArchetype.get(arch)?.push(enriched);
    const regions = enriched.regions ?? ['GLOBAL'];
    for (const reg of regions) {
      let rList = this.byRegion.get(reg);
      if (!rList) {
        rList = [];
        this.byRegion.set(reg, rList);
      }
      rList.push(enriched);
    }
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
      if (!isCleanShardCandidate(enriched)) return;
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
    this.subcatFileIndex = [];

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
              if (typeof entry.path === 'string' && entry.path.trim().length > 0) {
                this.subcatFileIndex.push({
                  domainId: d,
                  path: entry.path.trim(),
                  baseQid: entry.baseQid,
                  qidEnd: entry.qidEnd,
                });
              }
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
    topicId: string;
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
              topicId: hitL2.id,
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
            topicId: l1.id,
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

    // Prefer accessible Geneva/Global Gold Core Middle School questions
    const goldSightline = this.tier1Questions.filter(
      (q) =>
        q.qid <= 4_964 &&
        q.archetype === 'SIGHTLINE_LOCK' &&
        doesCandidateMatchDifficultyPreset(q, 'MIDDLE_SCHOOL', { allowAdjacent: false }) &&
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

    const q1Raw = pickSightline(true, -1.35);
    const q2Raw = pickSightline(false, -1.2);
    const q3Raw = pickSightline(false, -1.05);

    // Q4: Meridian Brass Astrolabe CALIBRATOR_DIAL (prefer Apollo 1969 / accessible landmark year if unseen)
    const q4Exact = this.byQid.get(4);
    let q4Raw: RawQuestionRecord | undefined =
      q4Exact && !this.seenTracker.hasSeen(4) ? q4Exact : undefined;
    if (!q4Raw) {
      const calPool = this.tier1Questions.filter(
        (q) =>
          q.archetype === 'CALIBRATOR_DIAL' &&
          q.qid <= 4_964 &&
          q.irtB <= 0.1 &&
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
        timerSec: 30,
        facetCount: 4,
        shuffleSalt: (salt + idx * 7919) >>> 0,
      });
      if (idx === 3) {
        if (!pq.heroRelicId) {
          pq.heroRelicId = 'meridian_astrolabe';
        }
        applyForgivingCalibratorCones(pq, 'MIDDLE_SCHOOL');
      }
      return pq;
    });
    return out;
  }

  /**
   * Synchronous Campaign Round Selector enforcing the strict 8-City Progressive Curve (`MIDDLE_SCHOOL` -> `MENSA`):
   * Geneva (`MIDDLE_SCHOOL`, 30s) -> London (R0-1 `MIDDLE_SCHOOL`, R2-4 `HIGH_SCHOOL`, 26s) ->
   * Tokyo (`HIGH_SCHOOL`, 24s) -> Rio (`COLLEGE`, 22s) -> Cairo (`COLLEGE`, 20s) ->
   * Reykjavik (`GRADUATE`, 18s) -> Singapore (`GRADUATE`, 16s) -> Apex Forum (`MENSA`, 15s).
   * Supports optional `mercyTierShift` (`-1` or `-2`) and `bonusTimerSec` for Retry Mercy ("Scout's Advantage").
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
    difficultyPreset?: BriefingDifficultyPreset;
    mercyTierShift?: number;
    bonusTimerSec?: number;
    facetCount?: 4 | 5 | 6;
    seed?: number;
    quarantinedQids?: ReadonlySet<number>;
  }): PrismQuestion[] {
    const stage = getCampaignStageSpec(params.hub);
    const roundIdx = clamp(params.roundIndex ?? 0, 0, 11);
    const count = clamp(params.count ?? 5, 1, 25);
    const mercyShift = Number.isFinite(params.mercyTierShift)
      ? clamp(Math.trunc(params.mercyTierShift!), -2, 0)
      : 0;
    const bonusTimerSec = Number.isFinite(params.bonusTimerSec)
      ? clamp(Math.round(params.bonusTimerSec!), 0, 20)
      : 0;

    // Warm up deep-campaign shards in background for Stage 3+
    if (stage.index >= 3) {
      const warmDomain = ((stage.index + roundIdx) % 12) as DomainId;
      this.prefetchDomainShards([warmDomain]);
    }

    if (params.isBossShowdown) {
      return this.buildBossShowdownQuestions(stage, count, {
        ...params,
        mercyTierShift: mercyShift,
        bonusTimerSec,
      });
    }

    const explicitTier = presetToAcademicTier(params.difficultyPreset);
    const targetTier: AcademicDifficultyTier = explicitTier
      ? shiftAcademicDifficultyTier(explicitTier, mercyShift)
      : resolveCampaignAcademicTier(stage.hub, roundIdx, mercyShift);
    const tierSpec = getAcademicTierSpec(targetTier);

    // Align IRT band strictly with resolved AcademicDifficultyTier (never let stale caller irtBRange override mercy or early-stage tiers!)
    let effIrtMin = tierSpec.irtMin;
    let effIrtMax = tierSpec.irtMax;
    if (
      mercyShift === 0 &&
      params.irtBRange &&
      Number.isFinite(params.irtBRange[0]) &&
      Number.isFinite(params.irtBRange[1])
    ) {
      const overlapLo = Math.max(tierSpec.irtMin, params.irtBRange[0]);
      const overlapHi = Math.min(tierSpec.irtMax, params.irtBRange[1]);
      if (overlapHi - overlapLo >= 0.25) {
        effIrtMin = overlapLo;
        effIrtMax = overlapHi;
      }
    }

    const span = Math.max(0.25, effIrtMax - effIrtMin);
    const roundFrac = roundIdx / 4;
    const roundCenter = lerp(
      effIrtMin + span * 0.22,
      effIrtMax - span * 0.14,
      roundFrac,
    );

    const fallbackSchedule = this.buildCityArchetypeSchedule(stage, count, roundIdx, targetTier);
    const rawSchedule: Archetype3D[] =
      Array.isArray(params.morphSequence) && params.morphSequence.length > 0
        ? Array.from({ length: count }, (_, idx) => {
            const rawArch = params.morphSequence![idx] ?? fallbackSchedule[idx];
            return rawArch === 'HERO_ARTIFACT_SYNTHESIS' ? 'SIGHTLINE_LOCK' : rawArch;
          })
        : fallbackSchedule;

    // Enforce strict early-stage morph discipline:
    //   • `ch` or `MIDDLE_SCHOOL`: 0 `CODEX_DUAL_RING`, max 1 forgiving `GAUNTLET_SHATTER` or `CALIBRATOR_DIAL`
    //   • `HIGH_SCHOOL`: 0 `CODEX_DUAL_RING`
    let earlySpecialCount = 0;
    const schedule: Archetype3D[] = rawSchedule.map((arch) => {
      if (
        (stage.hub === 'ch' || targetTier === 'MIDDLE_SCHOOL' || targetTier === 'HIGH_SCHOOL') &&
        arch === 'CODEX_DUAL_RING'
      ) {
        return 'SIGHTLINE_LOCK';
      }
      if (
        (stage.hub === 'ch' || targetTier === 'MIDDLE_SCHOOL') &&
        (arch === 'GAUNTLET_SHATTER' || arch === 'CALIBRATOR_DIAL')
      ) {
        if (earlySpecialCount >= 1) {
          return 'SIGHTLINE_LOCK';
        }
        earlySpecialCount += 1;
      }
      return arch;
    });

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
      difficultyPreset: targetTier,
      mercyTierShift: 0,
      bonusTimerSec,
      irtMin: effIrtMin,
      irtMax: effIrtMax,
      targetIrtCurve: targetCurve,
      regions: stage.regionCode !== 'GLOBAL' ? [stage.regionCode] : undefined,
      boostTags: params.lateralJammerMode ? ['LATERAL_DEDUCTION'] : undefined,
      lateralJammerMode: params.lateralJammerMode,
      nemesisCounterPick: params.nemesisCounterPick,
      facetCount: params.facetCount ?? 4,
      seed: params.seed,
      quarantinedQids: params.quarantinedQids,
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
    quarantinedQids?: ReadonlySet<number>;
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
    quarantinedQids?: ReadonlySet<number>;
  }): PrismQuestion[] {
    const count = clamp(params.count ?? 5, 1, 100);
    const preset: BriefingDifficultyPreset = normalizeBriefingDifficultyPreset(
      params.difficultyPreset ?? 'ADAPTIVE',
    );
    const targetTier = presetToAcademicTier(preset);
    if (params.l1SubcategoryId || params.l2TopicId) {
      void this.ensureTopicShardsLoaded({
        domains: params.domains,
        l1SubcategoryId: params.l1SubcategoryId,
        l2TopicId: params.l2TopicId,
      });
    } else if (params.domains && params.domains.length > 0) {
      this.prefetchDomainShards(params.domains);
    }

    const taxFilter = this.resolveTaxonomyFilter(params.l1SubcategoryId, params.l2TopicId);
    const hasGlobeMatch = this.hasGlobePinDropForScope(
      taxFilter ? [taxFilter.domainId] : params.domains,
      taxFilter,
      targetTier,
    );

    // Restrict morph complexity on Middle School (ZERO brutal Codex or tight Calibrator traps!)
    let morphRotation: Archetype3D[];
    if (targetTier === 'MIDDLE_SCHOOL') {
      morphRotation = hasGlobeMatch
        ? ['GAUNTLET_SHATTER', 'GLOBE_PIN_DROP']
        : ['GAUNTLET_SHATTER'];
    } else if (targetTier === 'HIGH_SCHOOL') {
      morphRotation = hasGlobeMatch
        ? ['GAUNTLET_SHATTER', 'GLOBE_PIN_DROP', 'CALIBRATOR_DIAL']
        : ['GAUNTLET_SHATTER', 'CALIBRATOR_DIAL'];
    } else if (targetTier === 'MENSA') {
      morphRotation = hasGlobeMatch
        ? ['CALIBRATOR_DIAL', 'CODEX_DUAL_RING', 'GLOBE_PIN_DROP', 'GAUNTLET_SHATTER']
        : ['CALIBRATOR_DIAL', 'CODEX_DUAL_RING', 'GAUNTLET_SHATTER'];
    } else {
      morphRotation = hasGlobeMatch
        ? ['GAUNTLET_SHATTER', 'GLOBE_PIN_DROP', 'CALIBRATOR_DIAL', 'CODEX_DUAL_RING']
        : ['GAUNTLET_SHATTER', 'CALIBRATOR_DIAL', 'CODEX_DUAL_RING'];
    }

    const schedule: Archetype3D[] = [];
    for (let i = 0; i < count; i++) {
      if (targetTier === 'MIDDLE_SCHOOL') {
        // Keep Middle School mostly crisp SIGHTLINE_LOCK (~70%) with gentle True/False or Globe on slot 2
        if (count >= 4 && i % 3 === 2 && i !== count - 1) {
          schedule.push(morphRotation[Math.floor(i / 3) % morphRotation.length]);
        } else {
          schedule.push('SIGHTLINE_LOCK');
        }
      } else if (count >= 4 && i >= 2 && i !== count - 1 && i % 2 === 0) {
        // Reserve slot 0 (opener), slot 1 (Clue Ladder), and final slot (Finale Category Picker) as Sightline,
        // weaving special morphs cleanly on slots 2, 4, 6... (and slot 3 when count === 5)!
        schedule.push(morphRotation[Math.floor((i - 2) / 2) % morphRotation.length]);
      } else if (count === 5 && i === 3) {
        schedule.push(morphRotation[1 % morphRotation.length]);
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
      quarantinedQids: params.quarantinedQids,
    });
  }

  /**
   * Dedicated showcase query for Upgrade #2 Visual Sapphire Blueprints & 3D Globe Pin-Drops.
   * Works synchronously even before `visual_globe_packs.json` finishes loading via `INSTANT_COLD_OPEN_PRISMS`!
   */
  public queryVisualOrGlobeShowcase(opts?: {
    count?: number;
    kind?: 'ALL' | 'GLOBE_PIN_DROP' | 'VISUAL_BLUEPRINT';
    domains?: DomainId[];
    l1SubcategoryId?: string;
    l2TopicId?: string;
    excludeQids?: ReadonlyArray<number>;
    quarantinedQids?: ReadonlySet<number>;
    seed?: number;
    facetCount?: 4 | 5 | 6;
  }): PrismQuestion[] {
    const count = clamp(opts?.count ?? 5, 1, 50);
    const kind = opts?.kind ?? 'ALL';
    const facetCount: 4 | 5 | 6 = opts?.facetCount ?? 4;
    const rng: RngLike =
      opts?.seed !== undefined ? new DeterministicRng(opts.seed) : sharedCryptoRng;

    const excludeSet = new Set<number>(this.quarantinedQids);
    if (opts?.excludeQids) {
      for (const qid of opts.excludeQids) excludeSet.add(qid);
    }
    if (opts?.quarantinedQids) {
      for (const qid of opts.quarantinedQids) excludeSet.add(qid);
    }

    const taxFilter = this.resolveTaxonomyFilter(opts?.l1SubcategoryId, opts?.l2TopicId);
    const allowDoms = taxFilter
      ? new Set<number>([taxFilter.domainId])
      : opts?.domains && opts.domains.length > 0
        ? new Set<number>(opts.domains)
        : null;

    // Combine loaded visual_globe_packs + embedded cold-open showcase items (dedup by qid)
    const combined: RawQuestionRecord[] = [];
    const seenIds = new Set<number>();
    const addIfEligible = (q: RawQuestionRecord): void => {
      if (seenIds.has(q.qid) || excludeSet.has(q.qid)) return;
      const isGlobe = q.archetype === 'GLOBE_PIN_DROP';
      const isVisual = Boolean(q.visualPlate?.imageUrl);
      if (kind === 'GLOBE_PIN_DROP' && !isGlobe) return;
      if (kind === 'VISUAL_BLUEPRINT' && !isVisual) return;
      if (kind === 'ALL' && !isGlobe && !isVisual) return;
      if (allowDoms && !allowDoms.has(clamp(Math.trunc(q.l0Domain ?? q.domainId ?? 0), 0, 11))) {
        return;
      }
      if (taxFilter && !this.recordMatchesTaxonomyFilter(q, taxFilter)) {
        return;
      }
      seenIds.add(q.qid);
      combined.push(q);
    };

    for (const q of this.visualGlobeRecords) addIfEligible(q);
    for (const q of INSTANT_COLD_OPEN_PRISMS) addIfEligible(q);

    // Fallback gracefully to global showcase if narrow domain/topic filter had 0 hits
    if (combined.length === 0) {
      for (const q of this.visualGlobeRecords) {
        if (seenIds.has(q.qid) || excludeSet.has(q.qid)) continue;
        const isGlobe = q.archetype === 'GLOBE_PIN_DROP';
        const isVisual = Boolean(q.visualPlate?.imageUrl);
        if (kind === 'GLOBE_PIN_DROP' && !isGlobe) continue;
        if (kind === 'VISUAL_BLUEPRINT' && !isVisual) continue;
        if (kind === 'ALL' && !isGlobe && !isVisual) continue;
        seenIds.add(q.qid);
        combined.push(q);
      }
      for (const q of INSTANT_COLD_OPEN_PRISMS) {
        if (seenIds.has(q.qid) || excludeSet.has(q.qid)) continue;
        const isGlobe = q.archetype === 'GLOBE_PIN_DROP';
        const isVisual = Boolean(q.visualPlate?.imageUrl);
        if (kind === 'GLOBE_PIN_DROP' && !isGlobe) continue;
        if (kind === 'VISUAL_BLUEPRINT' && !isVisual) continue;
        if (kind === 'ALL' && !isGlobe && !isVisual) continue;
        seenIds.add(q.qid);
        combined.push(q);
      }
    }

    const sortWithUnseenPriority = (arr: RawQuestionRecord[]): RawQuestionRecord[] => {
      const unseen = arr.filter((q) => !this.seenTracker.hasSeen(q.qid));
      const seen = arr.filter((q) => this.seenTracker.hasSeen(q.qid));
      rng.shuffleInPlace(unseen);
      rng.shuffleInPlace(seen);
      return [...unseen, ...seen];
    };

    let ordered: RawQuestionRecord[];
    if (kind === 'ALL') {
      const globes = sortWithUnseenPriority(
        combined.filter((q) => q.archetype === 'GLOBE_PIN_DROP'),
      );
      const visuals = sortWithUnseenPriority(
        combined.filter((q) => q.archetype !== 'GLOBE_PIN_DROP' && Boolean(q.visualPlate?.imageUrl)),
      );
      ordered = [];
      let gi = 0;
      let vi = 0;
      while (ordered.length < count && (gi < globes.length || vi < visuals.length)) {
        if (gi < globes.length) ordered.push(globes[gi++]);
        if (ordered.length < count && vi < visuals.length) ordered.push(visuals[vi++]);
      }
    } else {
      ordered = sortWithUnseenPriority(combined).slice(0, count);
    }

    return ordered.map((raw) =>
      normalizeToPrismQuestion(raw, {
        timerSec: raw.archetype === 'GLOBE_PIN_DROP' ? 22 : 18,
        facetCount,
        shuffleSalt: rng.nextUint32(),
        sourceTier: 'GOLD_CURATED',
      }),
    );
  }

  /**
   * Archive Descent (Endless Mode) Async Query — climbs monotonically from accessible
   * Public Strata (`-1.20`) into Meridian Zero polymath depths (`+2.75`)!
   */
  public async queryEndlessBatchAsync(
    depthStart: number,
    count = 5,
    facetCount: 4 | 5 | 6 = 4,
    quarantinedQids?: ReadonlySet<number>,
  ): Promise<PrismQuestion[]> {
    if (!this.initialized) {
      await this.init();
    }
    const domA = (Math.floor(Math.max(0, depthStart) / 5) % 12) as DomainId;
    const domB = ((domA + 3) % 12) as DomainId;
    await this.ensureDomainsLoaded([domA, domB]);
    return this.queryEndlessBatch(depthStart, count, facetCount, quarantinedQids);
  }

  public queryEndlessBatch(
    depthStart: number,
    count = 5,
    facetCount: 4 | 5 | 6 = 4,
    quarantinedQids?: ReadonlySet<number>,
  ): PrismQuestion[] {
    const safeCount = clamp(count, 1, 20);
    const nextDom = (Math.floor(Math.max(0, depthStart) / 5) % 12) as DomainId;
    this.prefetchDomainShards([nextDom, ((nextDom + 1) % 12) as DomainId]);

    const floorIndex = Math.floor(Math.max(0, depthStart) / 5);
    const hasGlobe = this.hasGlobePinDropForScope(undefined, null);
    const schedule: Archetype3D[] = [];
    const targetCurve: number[] = [];
    for (let i = 0; i < safeCount; i++) {
      const d = Math.max(0, depthStart) + i;
      targetCurve.push(clamp(-1.2 + d * 0.13, -1.5, 2.75));
      if (safeCount >= 4 && i % 2 === 1) {
        if (i === 1) {
          schedule.push(hasGlobe && floorIndex % 3 === 1 ? 'GLOBE_PIN_DROP' : 'GAUNTLET_SHATTER');
        } else if (i === 3) {
          schedule.push(
            floorIndex % 2 === 1 && d >= 5
              ? 'CODEX_DUAL_RING'
              : hasGlobe && floorIndex % 3 === 2
                ? 'GLOBE_PIN_DROP'
                : 'CALIBRATOR_DIAL',
          );
        } else {
          const rot: Archetype3D[] = hasGlobe
            ? ['CODEX_DUAL_RING', 'GLOBE_PIN_DROP', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL']
            : ['CODEX_DUAL_RING', 'GAUNTLET_SHATTER', 'CALIBRATOR_DIAL'];
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
      quarantinedQids,
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
  public async queryQuestionsAsync(req: ForgeQueryRequestWithMercy): Promise<PrismQuestion[]> {
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

  public queryQuestions(req: ForgeQueryRequestWithMercy): PrismQuestion[] {
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
    const mercyShift = Number.isFinite(req.mercyTierShift)
      ? clamp(Math.trunc(req.mercyTierShift!), -2, 0)
      : 0;
    const bonusTimerSec = Number.isFinite(req.bonusTimerSec)
      ? clamp(Math.round(req.bonusTimerSec!), 0, 20)
      : 0;

    const explicitTier = presetToAcademicTier(req.difficultyPreset);
    const baseTier: AcademicDifficultyTier | null =
      explicitTier ??
      (req.mode === 'CAMPAIGN' && stage
        ? resolveCampaignAcademicTier(stage.hub, req.roundIndex ?? 0, 0)
        : null);
    const targetTier: AcademicDifficultyTier | null =
      baseTier && mercyShift !== 0
        ? shiftAcademicDifficultyTier(baseTier, mercyShift)
        : baseTier;

    const nominalCampaignTier =
      req.mode === 'CAMPAIGN' && stage
        ? resolveCampaignAcademicTier(stage.hub, req.roundIndex ?? 0, 0)
        : null;
    const isMercyRelaxedTier = Boolean(
      nominalCampaignTier &&
        targetTier &&
        getAcademicTierSpec(targetTier).rank < getAcademicTierSpec(nominalCampaignTier).rank,
    );
    const rawBaseTimer =
      req.mode === 'CAMPAIGN' && stage
        ? isMercyRelaxedTier && targetTier
          ? Math.max(stage.timerSec, getAcademicTierSpec(targetTier).timerSec)
          : stage.timerSec
        : targetTier
          ? getAcademicTierSpec(targetTier).timerSec
          : stage
            ? stage.timerSec
            : 18;
    const baseTimer = rawBaseTimer + bonusTimerSec;

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
    for (const qid of this.quarantinedQids) {
      usedQids.add(qid);
    }
    if (req.quarantinedQids) {
      for (const qid of req.quarantinedQids) {
        usedQids.add(qid);
      }
    }
    const usedDomainsInBatch = new Set<DomainId>();
    const usedAnswersInBatch = new Set<string>();
    const recordUsedAnswer = (ans?: string): void => {
      const clean = String(ans ?? '').trim().toLowerCase();
      if (clean && clean !== 'true' && clean !== 'false' && !clean.startsWith('3/3 ')) {
        usedAnswersInBatch.add(clean);
      }
    };
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
          recordUsedAnswer(found.answerCorrect);
          prevDomain = found.l0Domain;
          results.push(found);
        }
      }
    }

    // 2. Fill remaining slots along difficulty curve & morph schedule
    for (let slot = results.length; slot < count; slot++) {
      const rawArch: Archetype3D =
        req.archetypes && req.archetypes.length > 0
          ? req.archetypes[slot % req.archetypes.length]
          : 'SIGHTLINE_LOCK';
      const wantArch: Archetype3D =
        rawArch === 'CODEX_DUAL_RING' &&
        (targetTier === 'MIDDLE_SCHOOL' || targetTier === 'HIGH_SCHOOL')
          ? 'SIGHTLINE_LOCK'
          : rawArch;

      const { lo, hi, targetB } = this.resolveSlotDifficulty(
        req,
        slot,
        count,
        allowedDomains,
        targetTier,
      );

      // Per #118: Campaign (Geneva -> Apex) pulls strictly from Tier-1 human-curated
      // questions.json (20,165 items) FIRST before falling back to Tier-2 shards!
      const preferGoldOnly = Boolean(stage && stage.hub === 'ch');
      const canUseShards =
        wantArch !== 'GLOBE_PIN_DROP' &&
        !preferGoldOnly &&
        req.mode !== 'DAILY' &&
        (!req.requiredTags || req.requiredTags.length === 0) &&
        this.hasLoadedShardForDomains(allowedDomains);

      let rawPicked: RawQuestionRecord | null = null;

      // Priority Routing: curated_v4_witty_pack + Jeopardy Signature + Gold Venue + Visual/Globe
      // + clean Gold Core ALWAYS serve FIRST before touching shards!
      if (taxFilter) {
        rawPicked = this.pickFromCuratedTopicPool({
          wantArch,
          taxFilter,
          usedQids,
          usedAnswersInBatch,
          rng,
          respectSeen,
          targetB,
          targetTier,
          preferVisual: slot === 2 || Boolean(req.preferVisualOrGlobe),
        });
      }

      if (!rawPicked) {
        const tier1Candidate = this.pickFromTier1Catalog({
          wantArch,
          irtMin: lo,
          irtMax: hi,
          targetB,
          targetTier,
          allowedDomains,
          usedQids,
          usedDomainsInBatch,
          usedAnswersInBatch,
          rng,
          respectSeen,
          prevDomain,
          preferGoldCurated: true,
          preferVisualOrGlobe: Boolean(req.preferVisualOrGlobe),
          regions: slot < Math.ceil(count * 0.45) ? req.regions : undefined,
          requiredTags: req.requiredTags,
          boostTags: req.boostTags,
          lateralJammerMode: req.lateralJammerMode,
          taxFilter,
        });
        // If Tier-1 only returned an ALREADY-SEEN item while unseen shards are available,
        // seamlessly graduate into the 500k–950k+ non-repeating shard pool!
        if (
          tier1Candidate &&
          !(respectSeen && canUseShards && this.seenTracker.hasSeen(tier1Candidate.qid))
        ) {
          rawPicked = tier1Candidate;
        }
      }

      // Once curated Tier-1 packs are exhausted or seen for this scope, draw cleanly from fame-gated shards!
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
          targetTier,
          usedAnswersInBatch,
        );
      }

      // If a narrow morph (e.g. CODEX_DUAL_RING or GLOBE_PIN_DROP inside a small L2 filter) had 0 hits,
      // relax to SIGHTLINE_LOCK inside the same topic while STILL enforcing targetTier!
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
          targetTier,
          usedAnswersInBatch,
        );
      }

      if (!rawPicked && wantArch !== 'SIGHTLINE_LOCK' && targetTier) {
        // Fallback to SIGHTLINE_LOCK in the exact target academic tier before falling back to generic seed
        rawPicked = this.pickFromTier1Catalog({
          wantArch: 'SIGHTLINE_LOCK',
          irtMin: lo,
          irtMax: hi,
          targetB,
          targetTier,
          allowedDomains,
          usedQids,
          usedDomainsInBatch,
          usedAnswersInBatch,
          rng,
          respectSeen,
          prevDomain,
          preferGoldCurated: Boolean(stage?.preferGoldCuratedFirst),
          preferVisualOrGlobe: Boolean(req.preferVisualOrGlobe),
          taxFilter,
        });
      }

      if (!rawPicked && wantArch === 'GLOBE_PIN_DROP') {
        // Fallback to non-quarantined Globe Pin-Drop matching targetTier (or adjacent) so Mensa never leaks easy landmarks!
        const globeFallback = [...this.visualGlobeRecords, ...INSTANT_COLD_OPEN_PRISMS].filter(
          (q) => {
            if (q.archetype !== 'GLOBE_PIN_DROP' || usedQids.has(q.qid)) return false;
            if (
              targetTier &&
              !doesCandidateMatchDifficultyPreset(q, targetTier, { allowAdjacent: true })
            ) {
              return false;
            }
            return true;
          },
        );
        if (globeFallback.length > 0) {
          rawPicked = globeFallback[rng.nextInt(0, globeFallback.length - 1)];
        }
      }

      const safeFallbackPool =
        targetTier === 'MIDDLE_SCHOOL'
          ? BOOTSTRAP_GENEVA_SEED.filter((q) => q.archetype === 'SIGHTLINE_LOCK')
          : BOOTSTRAP_GENEVA_SEED;
      const finalRaw =
        rawPicked ?? safeFallbackPool[slot % Math.max(1, safeFallbackPool.length)] ?? BOOTSTRAP_GENEVA_SEED[0];
      usedQids.add(finalRaw.qid);
      recordUsedAnswer(finalRaw.answerCorrect);
      const domId = clamp(finalRaw.l0Domain, 0, 11) as DomainId;
      usedDomainsInBatch.add(domId);
      prevDomain = domId;

      const gauntletBase =
        targetTier === 'MIDDLE_SCHOOL'
          ? 14
          : targetTier === 'HIGH_SCHOOL'
            ? 12
            : clamp(Math.min(baseTimer, Number(finalRaw.gauntletExt?.windowSec ?? 10)), 8, 14);
      const timerForMorph =
        finalRaw.archetype === 'GAUNTLET_SHATTER'
          ? clamp(gauntletBase + bonusTimerSec, 8, 22)
          : finalRaw.archetype === 'GLOBE_PIN_DROP'
            ? Math.max(baseTimer, 22)
            : baseTimer;

      let pq = normalizeToPrismQuestion(finalRaw, {
        timerSec: timerForMorph,
        facetCount,
        shuffleSalt: rng.nextUint32(),
      });

      if (pq.archetype === 'GAUNTLET_SHATTER' && pq.gauntlet) {
        pq.gauntlet.windowSec = timerForMorph;
      }
      if (pq.archetype === 'CALIBRATOR_DIAL') {
        applyForgivingCalibratorCones(pq, targetTier);
      }

      if (pq.archetype === 'HERO_ARTIFACT_SYNTHESIS' && !pq.heroSynthesis) {
        pq = attachHeroSynthesisChain(pq, [], stage?.hub ?? 'global');
      }

      results.push(pq);
    }

    return results;
  }

  /**
   * Hydrates an exact ordered list of Question IDs across Cold-Open (`1.08M`), Tier-1,
   * Gold Venue Packs, Visual/Globe (`1.07M`), Jeopardy Signature (`1.06M`), Main Shards,
   * Codex Synthesis (`995k..1.045M`), and Specialist Subcat Shards (`1.1M+`) in parallel.
   * Powers Upgrade #1 `?duel=...` links so challenger and recipient play 100% identical Qs!
   */
  public async queryExactQuestionsByIds(
    qids: ReadonlyArray<number>,
    opts?: {
      facetCount?: 4 | 5 | 6;
      seed?: number;
      timerSec?: number;
    },
  ): Promise<PrismQuestion[]> {
    if (!Array.isArray(qids) || qids.length === 0) {
      return [];
    }
    if (!this.initialized) {
      await this.init();
    }

    const facetCount: 4 | 5 | 6 = opts?.facetCount ?? 4;
    const neededDomains = new Set<DomainId>();
    const neededExtraFiles: Array<{ path: string; domainId: DomainId }> = [];
    const seenExtraPaths = new Set<string>();
    const codexEnd = CODEX_SYNTHESIS_BASE_QID + CODEX_SYNTHESIS_PER_DOMAIN * 12;

    for (const rawQid of qids) {
      const qid = Math.trunc(rawQid);
      if (!Number.isFinite(qid) || qid <= 0) continue;
      if (this.byQid.has(qid) || this.coldOpenByQid.has(qid)) continue;

      if (qid >= CODEX_SYNTHESIS_BASE_QID && qid < codexEnd) {
        const d = Math.floor(
          (qid - CODEX_SYNTHESIS_BASE_QID) / CODEX_SYNTHESIS_PER_DOMAIN,
        ) as DomainId;
        if (d >= 0 && d < 12) neededDomains.add(d);
        continue;
      }

      let matchedMain = false;
      if (this.shardManifest && qid >= 60_000) {
        for (const dom of this.shardManifest.domains) {
          if (dom.files.some((f) => qid >= f.baseQid && qid <= f.qidEnd)) {
            neededDomains.add(dom.l0Domain as DomainId);
            matchedMain = true;
            break;
          }
        }
      }

      if (!matchedMain) {
        for (const entry of this.subcatFileIndex) {
          if (qid >= entry.baseQid && qid <= entry.qidEnd) {
            if (!seenExtraPaths.has(entry.path)) {
              seenExtraPaths.add(entry.path);
              neededExtraFiles.push({ path: entry.path, domainId: entry.domainId });
            }
            break;
          }
        }
      }
    }

    const loadTasks: Array<Promise<unknown>> = [];
    if (neededDomains.size > 0) {
      loadTasks.push(this.ensureDomainsLoaded(Array.from(neededDomains)));
    }
    for (const ef of neededExtraFiles) {
      loadTasks.push(this.ensureExtraShardFileLoaded(ef.path, ef.domainId));
    }
    if (loadTasks.length > 0) {
      await Promise.all(loadTasks);
    }

    const hydrated: PrismQuestion[] = [];
    for (let idx = 0; idx < qids.length; idx++) {
      const qid = Math.trunc(qids[idx]);
      if (!Number.isFinite(qid) || qid <= 0) continue;
      const shuffleSalt =
        opts?.seed !== undefined
          ? (opts.seed ^ Math.imul(idx + 1, 0x9e3779b9)) >>> 0
          : fnv1a32(`WS_DUEL_EXACT:${qid}:${idx}`);
      const pq = this.getQuestionByQidSync(qid, {
        facetCount,
        timerSec: opts?.timerSec,
        shuffleSalt,
      });
      if (pq) {
        hydrated.push(pq);
      }
    }
    return hydrated;
  }

  /** Direct QID lookup across Tier-1, Cold-Open, Visual/Globe, Jeopardy Signature, and any Tier-2/Subcat shards */
  public async getQuestionByQid(
    qid: number,
    facetCount: 4 | 5 | 6 = 4,
  ): Promise<PrismQuestion | null> {
    if (!this.initialized) {
      await this.init();
    }
    const syncHit = this.getQuestionByQidSync(qid, { facetCount });
    if (syncHit) return syncHit;

    const codexEnd = CODEX_SYNTHESIS_BASE_QID + CODEX_SYNTHESIS_PER_DOMAIN * 12;
    if (qid >= CODEX_SYNTHESIS_BASE_QID && qid < codexEnd) {
      const d = Math.floor(
        (qid - CODEX_SYNTHESIS_BASE_QID) / CODEX_SYNTHESIS_PER_DOMAIN,
      ) as DomainId;
      await this.ensureDomainShardLoaded(d);
      return this.getQuestionByQidSync(qid, { facetCount });
    }

    if (this.shardManifest && qid >= 60_000) {
      for (const dom of this.shardManifest.domains) {
        const inDomain = dom.files.some((f) => qid >= f.baseQid && qid <= f.qidEnd);
        if (inDomain) {
          await this.ensureDomainShardLoaded(dom.l0Domain as DomainId);
          return this.getQuestionByQidSync(qid, { facetCount });
        }
      }
    }

    for (const entry of this.subcatFileIndex) {
      if (qid >= entry.baseQid && qid <= entry.qidEnd) {
        await this.ensureExtraShardFileLoaded(entry.path, entry.domainId);
        return this.getQuestionByQidSync(qid, { facetCount });
      }
    }

    return null;
  }

  public getQuestionByQidSync(
    qid: number,
    opts: { timerSec?: number; facetCount?: 4 | 5 | 6; shuffleSalt?: number } = {},
  ): PrismQuestion | null {
    const t1 = this.byQid.get(qid) ?? this.coldOpenByQid.get(qid);
    if (t1) {
      return normalizeToPrismQuestion(t1, {
        ...opts,
        shuffleSalt: opts.shuffleSalt ?? sharedCryptoRng.nextUint32(),
      });
    }
    const unifiedManifest = this.getUnifiedManifestForDecode();
    if (unifiedManifest && qid >= 60_000) {
      const codexEnd = CODEX_SYNTHESIS_BASE_QID + CODEX_SYNTHESIS_PER_DOMAIN * 12;
      if (qid >= CODEX_SYNTHESIS_BASE_QID && qid < codexEnd) {
        const offset = qid - CODEX_SYNTHESIS_BASE_QID;
        const domId = Math.floor(offset / CODEX_SYNTHESIS_PER_DOMAIN) as DomainId;
        const synthSlot = offset % CODEX_SYNTHESIS_PER_DOMAIN;
        const chunks = this.loadedShardsByDomain.get(domId);
        if (chunks && chunks.length > 0) {
          const synthRaw = synthesizeShardCodexQuestion(unifiedManifest, chunks, domId, synthSlot);
          if (synthRaw) {
            return normalizeToPrismQuestion(synthRaw, {
              ...opts,
              shuffleSalt: opts.shuffleSalt ?? sharedCryptoRng.nextUint32(),
            });
          }
        }
      }

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

  private hasGlobePinDropForScope(
    domains: ReadonlyArray<DomainId> | undefined,
    taxFilter: {
      domainId: DomainId;
      topicId: string;
      topicName: string;
      keywords: string[];
    } | null,
    targetTier?: AcademicDifficultyTier | null,
  ): boolean {
    const globePool = this.byArchetype.get('GLOBE_PIN_DROP') ?? [];
    if (globePool.length === 0) return false;
    const allowedTiers = targetTier
      ? new Set<AcademicDifficultyTier>(getAdjacentAcademicTiers(targetTier))
      : null;
    const tierOk = (q: RawQuestionRecord): boolean => {
      if (!allowedTiers) return true;
      return allowedTiers.has(scoreQuestionDifficulty(q).difficultyTier);
    };
    if (taxFilter) {
      return globePool.some(
        (q) =>
          q.l0Domain === taxFilter.domainId &&
          this.recordMatchesTaxonomyFilter(q, taxFilter) &&
          tierOk(q),
      );
    }
    if (domains && domains.length > 0) {
      const domSet = new Set<number>(domains);
      return globePool.some((q) => domSet.has(q.l0Domain) && tierOk(q));
    }
    return globePool.some((q) => tierOk(q));
  }

  private recordMatchesTaxonomyFilter(
    q: RawQuestionRecord,
    taxFilter: {
      domainId: DomainId;
      topicId: string;
      topicName: string;
      keywords: string[];
    },
  ): boolean {
    const topicIdLow = taxFilter.topicId.trim().toLowerCase();
    const topicNameLow = taxFilter.topicName.trim().toLowerCase();
    if (q.answerCorrect.trim().toLowerCase() === topicNameLow) return false;
    if (
      q.subcatId?.trim().toLowerCase() === topicIdLow ||
      q.l2Id?.trim().toLowerCase() === topicIdLow ||
      q.l1Id?.trim().toLowerCase() === topicIdLow ||
      q.l2Subcategory?.trim().toLowerCase() === topicNameLow ||
      q.l2Category?.trim().toLowerCase() === topicNameLow
    ) {
      return true;
    }
    const hay = `${q.l1Category ?? ''} ${q.l2Subcategory ?? ''} ${q.l2Category ?? ''} ${q.l1Id ?? ''} ${q.l2Id ?? ''} ${q.subcatId ?? ''} ${q.microTopicId ?? ''} ${q.prompt}`.toLowerCase();
    return taxFilter.keywords.some((kw) => hay.includes(kw.toLowerCase()));
  }

  private pickFromCuratedTopicPool(opts: {
    wantArch: Archetype3D;
    taxFilter: {
      domainId: DomainId;
      topicId: string;
      topicName: string;
      keywords: string[];
    };
    usedQids: ReadonlySet<number>;
    usedAnswersInBatch?: ReadonlySet<string>;
    rng: RngLike;
    respectSeen: boolean;
    targetB: number;
    targetTier?: AcademicDifficultyTier | null;
    preferVisual: boolean;
  }): RawQuestionRecord | null {
    const candidates: RawQuestionRecord[] = [];
    const seenIds = new Set<number>();

    const collect = (list: ReadonlyArray<RawQuestionRecord> | undefined): void => {
      if (!list) return;
      for (const q of list) {
        if (seenIds.has(q.qid) || opts.usedQids.has(q.qid)) continue;
        if (opts.usedAnswersInBatch?.has(q.answerCorrect.trim().toLowerCase())) continue;
        if (q.archetype !== opts.wantArch) continue;
        if (q.l0Domain !== opts.taxFilter.domainId) continue;
        if (!this.recordMatchesTaxonomyFilter(q, opts.taxFilter)) continue;
        if (!isCleanShardCandidate(q)) continue;
        seenIds.add(q.qid);
        candidates.push(q);
      }
    };

    const topicIdLow = opts.taxFilter.topicId.trim().toLowerCase();
    const topicNameLow = opts.taxFilter.topicName.trim().toLowerCase();

    if (opts.wantArch === 'GLOBE_PIN_DROP' || opts.preferVisual) {
      collect(this.visualGlobeRecords);
    }
    collect(this.jeopardyBySubcatId.get(topicIdLow));
    collect(this.jeopardyBySubcatId.get(topicNameLow));
    collect(this.jeopardyByDomain.get(opts.taxFilter.domainId));
    if (!opts.preferVisual && opts.wantArch !== 'GLOBE_PIN_DROP') {
      collect(this.visualGlobeRecords);
    }

    if (candidates.length === 0) return null;

    const maxPasses = opts.targetTier ? 2 : 1;

    for (let pass = 0; pass < maxPasses; pass++) {
      const scored: Array<{ q: RawQuestionRecord; s: number }> = [];
      for (const q of candidates) {
        const diff = scoreQuestionDifficulty(q);
        if (
          opts.targetTier &&
          !doesCandidateMatchDifficultyPreset(q, opts.targetTier, {
            allowAdjacent: pass > 0,
            assessment: diff,
          })
        ) {
          continue;
        }
        let s = 0;
        if (opts.respectSeen) {
          if (!this.seenTracker.hasSeen(q.qid)) s += 55;
          else s -= 80;
          if (this.seenTracker.isMicroTopicInCooldown(q.microTopicId)) s -= 70;
        }
        if (opts.preferVisual && q.visualPlate?.imageUrl) s += 30;
        if (q.subcatId?.trim().toLowerCase() === topicIdLow) s += 20;
        if (opts.targetTier === 'MIDDLE_SCHOOL' && diff.breakdown.lexiconDelta <= -10) s += 16;
        s -= Math.abs(diff.calibratedIrtB - opts.targetB) * 12;
        s += opts.rng.nextFloat() * 14;
        scored.push({ q, s });
      }
      if (scored.length === 0) continue;
      scored.sort((a, b) => b.s - a.s);
      if (opts.respectSeen && this.seenTracker.hasSeen(scored[0].q.qid)) {
        return null;
      }
      const topBand = scored.filter((item) => item.s >= scored[0].s - 12).slice(0, 8);
      return topBand[opts.rng.nextInt(0, topBand.length - 1)].q;
    }

    return null;
  }

  private buildCityArchetypeSchedule(
    stage: CampaignStageSpec,
    count: number,
    roundIdx: number,
    targetTier?: AcademicDifficultyTier,
  ): Archetype3D[] {
    const schedule = new Array<Archetype3D>(count).fill('SIGHTLINE_LOCK');
    const hasGlobe = (this.byArchetype.get('GLOBE_PIN_DROP')?.length ?? 0) > 0;
    const blockCodex =
      stage.hub === 'ch' ||
      stage.hub === 'gb' ||
      stage.hub === 'jp' ||
      targetTier === 'MIDDLE_SCHOOL' ||
      targetTier === 'HIGH_SCHOOL';
    const specials = stage.unlockedArchetypes.filter(
      (a) =>
        a !== 'SIGHTLINE_LOCK' &&
        a !== 'HERO_ARTIFACT_SYNTHESIS' &&
        (!blockCodex || a !== 'CODEX_DUAL_RING') &&
        (a !== 'GLOBE_PIN_DROP' || hasGlobe),
    );
    if (specials.length === 0) {
      return schedule;
    }
    if (stage.hub === 'ch' || targetTier === 'MIDDLE_SCHOOL') {
      // Stage 1 Geneva & Middle School: 0 Codex, max 1 forgiving Gauntlet or Calibrator per round!
      if (count >= 4) {
        schedule[Math.min(count - 2, 2)] =
          roundIdx % 2 === 0 ? 'GAUNTLET_SHATTER' : 'CALIBRATOR_DIAL';
      }
      return schedule;
    }
    if (count >= 4) {
      // Keep slot 0 (crisp opener) and slot 1 (Clue Ladder) as SIGHTLINE_LOCK;
      // weave special morphs on slot 2 & slot 3 (and alternating beyond), leaving final slot for Finale Picker!
      schedule[2] = specials[roundIdx % specials.length];
      if (count >= 5) {
        schedule[3] = specials[(roundIdx + 1) % specials.length];
      }
      for (let extra = 5; extra < count - 1; extra += 2) {
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
      mercyTierShift?: number;
      bonusTimerSec?: number;
      facetCount?: 4 | 5 | 6;
      seed?: number;
    },
  ): PrismQuestion[] {
    // 3-Phase Boss Showdown (PITCH_BIBLE.md §3.4 + #175/#176 5..15-Q Phase Alignment):
    //   • Phase I (indices 0 .. p1Count-1): Shield Break (`p1Count = count >= 9 ? 4 : count >= 5 ? 2 : 1`)
    //   • Phase II (exact index === p1Count): 3-Step Chained `HERO_ARTIFACT_SYNTHESIS` Relic
    //   • Phase III (indices p1Count+1 .. count-1): Sovereign Sudden Death (interleaved morphs)
    const mercyShift = Number.isFinite(params.mercyTierShift)
      ? clamp(Math.trunc(params.mercyTierShift!), -2, 0)
      : 0;
    const bonusTimerSec = Number.isFinite(params.bonusTimerSec)
      ? clamp(Math.round(params.bonusTimerSec!), 0, 20)
      : 0;
    const bossTier = resolveCampaignAcademicTier(stage.hub, 4, mercyShift);
    const tierSpec = getAcademicTierSpec(bossTier);
    const effIrtMin = tierSpec.irtMin;
    const effIrtMax = tierSpec.irtMax;
    const facetCount = params.facetCount ?? 4;
    if (count <= 1) {
      const soloRelic = this.getBossArtifactSynthesis(stage.hub, facetCount);
      if (bonusTimerSec > 0) soloRelic.timerSec += bonusTimerSec;
      return [soloRelic];
    }

    const relicBoss = this.getBossArtifactSynthesis(stage.hub, facetCount);
    if (bonusTimerSec > 0) relicBoss.timerSec += bonusTimerSec;
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
      // Mix GAUNTLET_SHATTER + brisk SIGHTLINE_LOCK when p1Count > 2 (#176); keep Stage 1 Geneva gentle!
      p1Schedule.push(
        bossTier === 'MIDDLE_SCHOOL'
          ? i === 0
            ? 'GAUNTLET_SHATTER'
            : 'SIGHTLINE_LOCK'
          : p1Count > 2 && i % 2 === 1
            ? 'SIGHTLINE_LOCK'
            : 'GAUNTLET_SHATTER',
      );
    }

    const out: PrismQuestion[] = [];
    const shieldBreak = this.queryQuestions({
      count: p1Count,
      mode: 'CAMPAIGN',
      hub: stage.hub,
      roundIndex: 4,
      archetypes: p1Schedule,
      difficultyPreset: bossTier,
      bonusTimerSec,
      irtMin: effIrtMin,
      irtMax: effIrtMax,
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
      const hasCodex =
        stage.unlockedArchetypes.includes('CODEX_DUAL_RING') &&
        bossTier !== 'MIDDLE_SCHOOL' &&
        bossTier !== 'HIGH_SCHOOL';
      const p3Cycle: Archetype3D[] = hasCodex
        ? ['CALIBRATOR_DIAL', 'SIGHTLINE_LOCK', 'CODEX_DUAL_RING', 'SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'SIGHTLINE_LOCK']
        : bossTier === 'MIDDLE_SCHOOL'
          ? ['SIGHTLINE_LOCK', 'CALIBRATOR_DIAL', 'SIGHTLINE_LOCK', 'SIGHTLINE_LOCK']
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
        difficultyPreset: bossTier,
        bonusTimerSec,
        irtMin: effIrtMin,
        irtMax: effIrtMax,
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
    req: ForgeQueryRequestWithMercy,
    slot: number,
    count: number,
    allowedDomains: ReadonlyArray<DomainId>,
    resolvedTier?: AcademicDifficultyTier | null,
  ): { lo: number; hi: number; targetB: number } {
    const frac = slot / Math.max(1, count - 1);
    const hasMercyShift = Boolean(req.mercyTierShift && req.mercyTierShift < 0);

    // When a fixed academic tier is active on Campaign (or Mercy shifted the tier down),
    // anchor the IRT slot curve to that exact tier's band so stale caller curves never fight the tier!
    if (resolvedTier && (hasMercyShift || req.mode === 'CAMPAIGN')) {
      const spec = getAcademicTierSpec(resolvedTier);
      const pad = Math.min(0.12, (spec.irtMax - spec.irtMin) * 0.14);
      const tb = lerp(spec.irtMin + pad, spec.irtMax - pad, frac);
      return { lo: spec.irtMin, hi: spec.irtMax, targetB: tb };
    }

    if (req.targetIrtCurve && req.targetIrtCurve.length > 0) {
      const tb = req.targetIrtCurve[Math.min(slot, req.targetIrtCurve.length - 1)];
      return {
        lo: req.irtMin ?? tb - 0.55,
        hi: req.irtMax ?? tb + 0.55,
        targetB: tb,
      };
    }

    if (req.irtMin !== undefined && req.irtMax !== undefined) {
      const tb = lerp(req.irtMin + 0.15, req.irtMax - 0.1, frac);
      return { lo: req.irtMin, hi: req.irtMax, targetB: tb };
    }

    const preset = resolvedTier ?? normalizeBriefingDifficultyPreset(req.difficultyPreset ?? 'ADAPTIVE');
    switch (preset) {
      case 'MIDDLE_SCHOOL':
      case 'EASY': {
        const tb = lerp(-1.6, -0.92, frac);
        return { lo: -1.85, hi: -0.85, targetB: tb };
      }
      case 'HIGH_SCHOOL': {
        const tb = lerp(-0.78, -0.22, frac);
        return { lo: -0.85, hi: -0.15, targetB: tb };
      }
      case 'COLLEGE':
      case 'MEDIUM': {
        const tb = lerp(-0.08, 0.58, frac);
        return { lo: -0.15, hi: 0.65, targetB: tb };
      }
      case 'GRADUATE':
      case 'HARD': {
        const tb = lerp(0.72, 1.38, frac);
        return { lo: 0.65, hi: 1.45, targetB: tb };
      }
      case 'MENSA':
      case 'GENIUS': {
        const tb = lerp(1.55, 2.55, frac);
        return { lo: 1.45, hi: 2.85, targetB: tb };
      }
      case 'PROGRESSIVE': {
        const tb = lerp(-1.45, 2.05, frac);
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
    targetTier?: AcademicDifficultyTier | null,
    usedAnswersInBatch?: ReadonlySet<string>,
  ): RawQuestionRecord | null {
    const unifiedManifest = this.getUnifiedManifestForDecode();
    if (!unifiedManifest) return null;

    const candidateDomains: DomainId[] =
      allowedDomains.length > 0
        ? allowedDomains.filter((d) => this.isDomainShardLoaded(d))
        : Array.from(this.loadedShardsByDomain.keys());

    if (candidateDomains.length === 0) return null;

    const tierSpec = targetTier ? getAcademicTierSpec(targetTier) : null;

    const getRowWindowBounds = (
      len: number,
      pass: number,
    ): { minPos: number; maxPos: number } => {
      if (len <= 1 || !tierSpec) {
        return { minPos: 0, maxPos: Math.max(0, len - 1) };
      }
      if (tierSpec.id === 'MIDDLE_SCHOOL') {
        const cap =
          pass === 0
            ? Math.max(10, Math.floor(len * tierSpec.shardRankMax01))
            : Math.max(18, Math.floor(len * 0.34));
        return { minPos: 0, maxPos: Math.min(len - 1, cap) };
      }
      const loFrac = pass === 0 ? tierSpec.shardRankMin01 : Math.max(0, tierSpec.shardRankMin01 - 0.14);
      const hiFrac = pass === 0 ? tierSpec.shardRankMax01 : Math.min(1, tierSpec.shardRankMax01 + 0.14);
      const minPos = clamp(Math.floor(len * loFrac), 0, len - 1);
      const maxPos = clamp(Math.max(minPos + Math.min(12, len - 1), Math.floor(len * hiFrac)), minPos, len - 1);
      return { minPos, maxPos };
    };

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
      // synthesize a 3-pair Codex Dual-Ring directly from the filtered within-topic rows (College+ only!)
      if (
        slices.length === 0 &&
        wantArch === 'CODEX_DUAL_RING' &&
        targetTier !== 'MIDDLE_SCHOOL' &&
        targetTier !== 'HIGH_SCHOOL'
      ) {
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
                const win = getRowWindowBounds(indices.length, 0);
                const startRi = indices[rng.nextInt(win.minPos, win.maxPos)];
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
        const maxPasses = targetTier ? 2 : 2;
        for (let pass = 0; pass < maxPasses; pass++) {
          const candidates: Array<{
            slice: (typeof slices)[number];
            ri: number;
            ai: number;
            rowRank01: number;
            score: number;
          }> = [];

          const probes = targetTier ? 140 : 110;
          for (let probe = 0; probe < probes; probe++) {
            const sl = slices[rng.nextInt(0, slices.length - 1)];
            const win = getRowWindowBounds(sl.rowsIdx.length, pass);
            const pos = rng.nextInt(win.minPos, win.maxPos);
            const ri = sl.rowsIdx[pos];
            const ai = sl.anglesIdx[rng.nextInt(0, sl.anglesIdx.length - 1)];
            const qid = sl.tbl.baseQid + ri * sl.spec.angles.length + ai;
            if (usedQids.has(qid)) continue;
            if (respectSeen && this.seenTracker.hasSeen(qid) && probe < probes - 18) continue;

            const row = sl.tbl.r[ri];
            if (
              !isShardRowFamousEnoughForTier(
                sl.tbl.type,
                row,
                sl.spec,
                sl.chunk.p,
                ri,
                sl.tbl.r.length,
                targetTier,
              )
            ) {
              continue;
            }
            const irtB = clamp(
              Number(row[row.length - 1]) / 100.0 + Number(sl.spec.angles[ai].irtOffset ?? 0),
              -1.6,
              2.75,
            );
            // HARD IRT GATE BEFORE UNSEEN BONUS (Fixes #329 Graduate/Mensa leak into Easy!)
            if (pass === 0) {
              const hardPad = targetTier === 'MIDDLE_SCHOOL' ? 0.35 : 0.45;
              if (irtB < irtMin - hardPad || irtB > irtMax + hardPad) continue;
            } else if (targetTier === 'MIDDLE_SCHOOL') {
              // Even on Pass 1 widening, NEVER admit > -0.10 rows into Middle School!
              if (irtB > -0.1) continue;
            } else if (targetTier === 'MENSA') {
              if (irtB < 0.65) continue;
            }

            const rowRank01 =
              sl.rowsIdx.length > 1 ? pos / (sl.rowsIdx.length - 1) : 0;
            let score = sl.isSpecialistTable ? 22 : 0;
            if (!this.seenTracker.hasSeen(qid)) score += 45;
            if (irtB < irtMin || irtB > irtMax) score -= 28;
            score -= Math.abs(irtB - targetB) * 18;
            score += rng.nextFloat() * 12;
            candidates.push({ slice: sl, ri, ai, rowRank01, score });
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
              !decoded ||
              decoded.answerCorrect.trim().toLowerCase() === topicLow ||
              usedAnswersInBatch?.has(decoded.answerCorrect.trim().toLowerCase()) ||
              !isCleanShardCandidate(decoded)
            ) {
              continue;
            }
            if (targetTier) {
              if (
                !doesCandidateMatchDifficultyPreset(decoded, targetTier, {
                  allowAdjacent: pass > 0,
                  shardRowRank01: cand.rowRank01,
                })
              ) {
                continue;
              }
            }
            return decoded;
          }
        }
      }
      return null;
    }

    // 2. General Domain Shard Path (Crypto-Random across full loaded domain tables!)
    if (wantArch === 'CODEX_DUAL_RING') {
      if (targetTier === 'MIDDLE_SCHOOL' || targetTier === 'HIGH_SCHOOL') {
        return null;
      }
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
          if (
            targetTier &&
            !doesCandidateMatchDifficultyPreset(codexRaw, targetTier, { allowAdjacent: true })
          ) {
            continue;
          }
          return codexRaw;
        }
      }
      return null;
    }

    const maxGenPasses = targetTier ? 2 : 1;
    for (let pass = 0; pass < maxGenPasses; pass++) {
      const candidatos: Array<{
        chunk: ShardChunkData;
        ti: number;
        ri: number;
        ai: number;
        rowRank01: number;
        score: number;
      }> = [];

      const probes = targetTier ? 128 : 84;
      for (let probe = 0; probe < probes; probe++) {
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
        const win = getRowWindowBounds(tbl.r.length, pass);
        const ri = rng.nextInt(win.minPos, win.maxPos);
        const row = tbl.r[ri];
        if (
          !isShardRowFamousEnoughForTier(
            tbl.type,
            row,
            spec,
            chunk.p,
            ri,
            tbl.r.length,
            targetTier,
          )
        ) {
          continue;
        }
        const qid = tbl.baseQid + ri * spec.angles.length + ai;
        if (usedQids.has(qid)) continue;

        const irtB = clamp(
          Number(row[row.length - 1]) / 100.0 + Number(angle.irtOffset ?? 0),
          -1.6,
          2.75,
        );
        const pad = pass === 0 ? 0.35 : 0.65;
        if (irtB < irtMin - pad || irtB > irtMax + pad) continue;

        const rowRank01 = tbl.r.length > 1 ? ri / (tbl.r.length - 1) : 0;
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

        candidatos.push({ chunk, ti, ri, ai, rowRank01, score });
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
        if (
          !decoded ||
          usedAnswersInBatch?.has(decoded.answerCorrect.trim().toLowerCase()) ||
          !isCleanShardCandidate(decoded)
        ) {
          continue;
        }
        if (targetTier) {
          if (
            !doesCandidateMatchDifficultyPreset(decoded, targetTier, {
              allowAdjacent: pass > 0,
              shardRowRank01: c.rowRank01,
            })
          ) {
            continue;
          }
        }
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
    targetTier?: AcademicDifficultyTier | null;
    allowedDomains: ReadonlyArray<DomainId>;
    usedQids: ReadonlySet<number>;
    usedDomainsInBatch: ReadonlySet<DomainId>;
    usedAnswersInBatch?: ReadonlySet<string>;
    rng: RngLike;
    respectSeen: boolean;
    prevDomain: DomainId | null;
    preferGoldCurated: boolean;
    preferVisualOrGlobe?: boolean;
    regions?: ReadonlyArray<string>;
    requiredTags?: ReadonlyArray<NarrativeTag>;
    boostTags?: ReadonlyArray<NarrativeTag>;
    lateralJammerMode?: boolean;
    taxFilter?: {
      domainId: DomainId;
      topicId: string;
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
          if (opts.usedAnswersInBatch?.has(q.answerCorrect.trim().toLowerCase())) return false;
          if (q.archetype !== opts.wantArch) return false;
          if (allowDomSet && !allowDomSet.has(q.l0Domain)) return false;
          if (opts.respectSeen && this.seenTracker.hasSeen(q.qid)) return false;
          if (!isCleanShardCandidate(q)) return false;
          if (opts.targetTier) {
            return doesCandidateMatchDifficultyPreset(q, opts.targetTier, { allowAdjacent: false });
          }
          return q.irtB >= opts.irtMin - 0.35 && q.irtB <= opts.irtMax + 0.35;
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
      const tf = opts.taxFilter;
      pool = pool.filter((q) => this.recordMatchesTaxonomyFilter(q, tf));
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

    const targetTier = opts.targetTier ?? null;

    // Crypto-random full-pool / reservoir evaluation (NEVER walks sequential QIDs!)
    const maxSample = targetTier ? 1400 : 520;
    for (let pass = 0; pass < 2; pass++) {
      const topBucket: Array<{ q: RawQuestionRecord; score: number }> = [];
      const total = pool.length;
      const sampleCount = Math.min(total, maxSample);

      for (let sIdx = 0; sIdx < sampleCount; sIdx++) {
        const idx = total <= maxSample ? sIdx : opts.rng.nextInt(0, total - 1);
        const q = pool[idx];
        if (opts.usedQids.has(q.qid)) continue;
        if (opts.usedAnswersInBatch?.has(q.answerCorrect.trim().toLowerCase())) continue;
        if (!isCleanShardCandidate(q)) continue;

        let effectiveIrtB = q.irtB;
        let householdBonus = 0;
        if (targetTier) {
          const diff = scoreQuestionDifficulty(q);
          if (
            !doesCandidateMatchDifficultyPreset(q, targetTier, {
              allowAdjacent: pass > 0,
              assessment: diff,
            })
          ) {
            continue;
          }
          effectiveIrtB = diff.calibratedIrtB;
          if (targetTier === 'MIDDLE_SCHOOL' && diff.breakdown.lexiconDelta <= -10) {
            householdBonus = 16;
          }
        } else if (pass === 0 && (q.irtB < opts.irtMin || q.irtB > opts.irtMax)) {
          continue;
        }

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
        let score = householdBonus;

        if (opts.respectSeen) {
          if (!this.seenTracker.hasSeen(q.qid)) score += 52;
          else score -= 65;
          if (this.seenTracker.isMicroTopicInCooldown(q.microTopicId)) score -= 85;
          if (this.seenTracker.isL2InCooldown(q.l2Subcategory)) score -= 25;
          if (opts.allowedDomains.length !== 1) {
            score -= this.seenTracker.getDomainRepeatPenalty(dom) * 0.5;
          }
        }

        // Decisive curated priority routing:
        //   1. Curated v4 Witty Pack (1,090,000+) -> +42
        //   2. Jeopardy Signature Packs (1,060,000..1,069,999) -> +36
        //   3. Gold Venue Packs (50,000..59,999) & Visual/Globe (1,070,000..1,089,999) -> +34
        //   4. Clean Gold Core (1..832) -> +32
        //   5. Clean Tier-1 Reference/Trivia API (833..4,964) -> +12
        if (q.qid >= 1_090_000 && q.qid < 1_100_000) {
          score += 42;
        } else if (q.qid >= 1_060_000 && q.qid < 1_070_000) {
          score += 36;
        } else if (
          (q.qid >= 50_000 && q.qid < 60_000) ||
          (q.qid >= 1_070_000 && q.qid < 1_090_000)
        ) {
          score += 34;
        } else if (q.qid <= 832) {
          score += 32;
        } else if (q.qid <= 4_964) {
          score += opts.preferGoldCurated ? 12 : 8;
        }
        if (q.visualPlate?.imageUrl || q.archetype === 'GLOBE_PIN_DROP') {
          score += opts.preferVisualOrGlobe ? 34 : 16;
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

        score -= Math.abs(effectiveIrtB - opts.targetB) * 16;
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
      'GLOBE_PIN_DROP',
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
