// ============================================================================
// WORLD'S SMARTEST — 6-FACTOR QUESTION DIFFICULTY CALIBRATION ENGINE
// Strict 5-Tier Academic / IQ Placement:
//   1. MIDDLE_SCHOOL ("Middle School" · 0–22  · irtB -1.85..-0.85 · 28s · 1.00x)
//   2. HIGH_SCHOOL   ("High School"   · 23–44 · irtB -0.85..-0.15 · 24s · 1.15x)
//   3. COLLEGE       ("College"       · 45–66 · irtB -0.15..+0.65 · 20s · 1.35x)
//   4. GRADUATE      ("Graduate"      · 67–84 · irtB +0.65..+1.45 · 17s · 1.60x)
//   5. MENSA         ("Mensa"         · 85–100· irtB +1.45..+2.85 · 15s · 2.00x)
// ============================================================================

import type {
  AcademicDifficultyTier,
  Archetype3D,
  BriefingDifficultyPreset,
  CampaignHubCode,
  RawQuestionRecord,
} from './types';

export interface AcademicDifficultyTierSpec {
  readonly id: AcademicDifficultyTier;
  readonly rank: 0 | 1 | 2 | 3 | 4;
  readonly label: string;
  readonly shortLabel: string;
  readonly badgeLabel: string;
  readonly subtitle: string;
  readonly scoreMin: number;
  readonly scoreMax: number;
  readonly irtMin: number;
  readonly irtMax: number;
  readonly timerSec: number;
  readonly scoreMultiplier: number;
  /** Preferred shard table row-rank [0..1] band (0 = top household GOAT, 1 = deepest archive cut) */
  readonly shardRankMin01: number;
  readonly shardRankMax01: number;
  /** Accessible morphs allowed when player explicitly picks this tier */
  readonly allowedBriefingMorphs: ReadonlyArray<Archetype3D>;
}

export interface QuestionDifficultyBreakdown {
  readonly basePriorScore: number;
  readonly lexiconDelta: number;
  readonly specificityDelta: number;
  readonly lexicalDelta: number;
  readonly morphDelta: number;
  readonly distractorDelta: number;
}

export interface QuestionDifficultyAssessment {
  readonly difficultyScore: number; // 0..100 integer
  readonly calibratedIrtB: number; // -1.85..+2.85
  readonly difficultyTier: AcademicDifficultyTier;
  readonly difficultyLabel: string;
  readonly shortLabel: string;
  readonly badgeLabel: string;
  readonly scoreMultiplier: number;
  readonly timerSec: number;
  readonly breakdown: QuestionDifficultyBreakdown;
}

export const ACADEMIC_DIFFICULTY_TIERS: ReadonlyArray<AcademicDifficultyTierSpec> = [
  {
    id: 'MIDDLE_SCHOOL',
    rank: 0,
    label: 'Middle School',
    shortLabel: 'Mid School',
    badgeLabel: 'MIDDLE SCHOOL',
    subtitle: 'Everyday Essentials',
    scoreMin: 0,
    scoreMax: 22,
    irtMin: -1.85,
    irtMax: -0.85,
    timerSec: 28,
    scoreMultiplier: 1.0,
    shardRankMin01: 0.0,
    shardRankMax01: 0.16,
    allowedBriefingMorphs: ['SIGHTLINE_LOCK', 'GAUNTLET_SHATTER', 'GLOBE_PIN_DROP'],
  },
  {
    id: 'HIGH_SCHOOL',
    rank: 1,
    label: 'High School',
    shortLabel: 'High School',
    badgeLabel: 'HIGH SCHOOL',
    subtitle: 'Varsity & AP Classics',
    scoreMin: 23,
    scoreMax: 44,
    irtMin: -0.85,
    irtMax: -0.15,
    timerSec: 24,
    scoreMultiplier: 1.15,
    shardRankMin01: 0.08,
    shardRankMax01: 0.44,
    allowedBriefingMorphs: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'GLOBE_PIN_DROP',
      'CALIBRATOR_DIAL',
    ],
  },
  {
    id: 'COLLEGE',
    rank: 2,
    label: 'College',
    shortLabel: 'College',
    badgeLabel: 'COLLEGE',
    subtitle: 'Collegiate Seminar',
    scoreMin: 45,
    scoreMax: 66,
    irtMin: -0.15,
    irtMax: 0.65,
    timerSec: 20,
    scoreMultiplier: 1.35,
    shardRankMin01: 0.24,
    shardRankMax01: 0.72,
    allowedBriefingMorphs: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'GLOBE_PIN_DROP',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
    ],
  },
  {
    id: 'GRADUATE',
    rank: 3,
    label: 'Graduate',
    shortLabel: 'Graduate',
    badgeLabel: 'GRADUATE',
    subtitle: 'Doctoral & Tournament',
    scoreMin: 67,
    scoreMax: 84,
    irtMin: 0.65,
    irtMax: 1.45,
    timerSec: 17,
    scoreMultiplier: 1.6,
    shardRankMin01: 0.5,
    shardRankMax01: 0.92,
    allowedBriefingMorphs: [
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'GLOBE_PIN_DROP',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
    ],
  },
  {
    id: 'MENSA',
    rank: 4,
    label: 'Mensa',
    shortLabel: 'Mensa',
    badgeLabel: 'MENSA',
    subtitle: '99th Percentile Grandmaster',
    scoreMin: 85,
    scoreMax: 100,
    irtMin: 1.45,
    irtMax: 2.85,
    timerSec: 15,
    scoreMultiplier: 2.0,
    shardRankMin01: 0.75,
    shardRankMax01: 1.0,
    allowedBriefingMorphs: [
      'SIGHTLINE_LOCK',
      'CALIBRATOR_DIAL',
      'CODEX_DUAL_RING',
      'GAUNTLET_SHATTER',
      'GLOBE_PIN_DROP',
    ],
  },
];

export const ACADEMIC_DIFFICULTY_BY_ID: Readonly<
  Record<AcademicDifficultyTier, AcademicDifficultyTierSpec>
> = {
  MIDDLE_SCHOOL: ACADEMIC_DIFFICULTY_TIERS[0],
  HIGH_SCHOOL: ACADEMIC_DIFFICULTY_TIERS[1],
  COLLEGE: ACADEMIC_DIFFICULTY_TIERS[2],
  GRADUATE: ACADEMIC_DIFFICULTY_TIERS[3],
  MENSA: ACADEMIC_DIFFICULTY_TIERS[4],
};

/** Iconic landmark years widely taught in elementary/middle school (exempt from obscure-year penalty) */
const ICONIC_LANDMARK_YEARS = new Set<number>([
  1492, 1776, 1789, 1865, 1914, 1918, 1929, 1939, 1945, 1947, 1969, 1989, 1991, 2000, 2001,
]);

/**
 * Household Core Knowledge Lexicon (Factor 2 — `-18` pts when target answer is an unmistakable icon,
 * `-10` pts when core school concepts anchor the prompt).
 */
const HOUSEHOLD_CORE_RE =
  /\b(?:mercury|venus|earth|mars|jupiter|saturn|uranus|neptune|pluto|solar system|milky way|gravity|photosynthesis|oxygen|hydrogen|carbon|helium|nitrogen|gold|silver|iron|copper|diamond|water|h2o|co2|dna|volcano|earthquake|tsunami|glacier|equator|africa|asia|europe|antarctica|australia|north america|south america|pacific|atlantic|indian ocean|arctic|amazon|nile|mississippi|everest|sahara|paris|london|tokyo|rome|cairo|new york|washington|beijing|moscow|sydney|athens|geneva|boston|chicago|los angeles|egypt|france|japan|china|india|brazil|italy|spain|canada|mexico|greece|germany|england|united states|red cross|united nations|olympics?|statue of liberty|eiffel tower|great wall|pyramids?|taj mahal|colosseum|parthenon|machu picchu|titanic|mona lisa|da vinci|picasso|van gogh|michelangelo|shakespeare|romeo and juliet|hamlet|mozart|beethoven|zeus|poseidon|athena|apollo|thor|odin|hercules|harry potter|star wars|beatles|disney|abraham lincoln|george washington|julius caesar|cleopatra|napoleon|world war|civil war|american revolution|declaration of independence|constitution|magna carta|rosetta stone|martin luther king|albert einstein|einstein|isaac newton|newton|charles darwin|darwin|marie curie|galileo|edison|babe ruth|jackie robinson|hank aaron|willie mays|lou gehrig|mickey mantle|derek jeter|shohei ohtani|mike trout|ken griffey|ted williams|joe dimaggio|yankees|red sox|dodgers|cubs|fenway|wrigley|world series|michael jordan|lebron james|kobe bryant|muhammad ali|serena williams|lionel messi|pele|usain bolt|super bowl|world cup|basketball|baseball|football|soccer|tennis|chess|octopus|dolphin|whale|penguin|elephant|giraffe|cheetah|lion|tiger|shark|eagle|butterfly|honeybee|triangle|circle|square|hexagon|pi|prime number|fibonacci)\b/i;

/**
 * Specialist Academic, Taxonomic, Archival, Legal & Advanced Jargon Lexicon (Factor 2 — up to `+16` pts).
 */
const SPECIALIST_JARGON_RE =
  /\b(?:homomorphism|isomorphism|automorphism|eigenvalue|eigenvector|hamiltonian|lagrangian|diffeomorphism|cohomology|topological|homeomorphism|manifold|stoichiometr\w*|enantiomer|stereoisomer|nucleophilic|electrophilic|epistemolog\w*|phenomenolog\w*|hermeneutic\w*|deontolog\w*|teleolog\w*|ontological|jurisprud\w*|certiorari|habeas|usufruct|historiograph\w*|numismatic\w*|paleograph\w*|philolog\w*|phylogenetic|clade|bryophyte|gymnosperm|angiosperm|echinoderm|arthropod|mitochondri\w*|endoplasmic|transcription factor|baryon|fermion|boson|quark|superconduct\w*|magnetohydro\w*|thermodynamic\w*|entropy|enthalpy|isozyme|allosteric|diachronic|synchronic|prosody|metonymy|synecdoche|chiaroscuro|sfumato|contrapposto|entablature|architrave|pendentive|spandrel|leibniz|spinoza|wittgenstein|heidegger|kierkegaard|schopenhauer|foucault|derrida|merovingian|carolingian|achaemenid|seleucid|ptolemaic|sassanid|abbasid|umayyad|habsburg|hohenzollern|plantagenet|westphalia|utrecht|tordesillas|sabermetric\w*|babip|ops\+|fip|era\+|wrc\+|war\b|whip\b|iso\b|logarithmic|asymptotic|combinatorial|diophantine|modular arithmetic|totient|congruence|eulerian|riemannian|stochastic|markov|bayesian)\b/i;

const BINOMIAL_LATIN_RE = /\b[A-Z][a-z]{3,}\s+[a-z]{4,}(?:us|is|ae|um|ii|ensis|oides)\b/;

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Normalizes legacy presets (`EASY` -> `MIDDLE_SCHOOL`, `MEDIUM` -> `COLLEGE`,
 * `HARD` -> `GRADUATE`, `GENIUS` -> `MENSA`) while keeping all 5 academic tiers + `ADAPTIVE`/`PROGRESSIVE`.
 */
export function normalizeBriefingDifficultyPreset(
  preset?: BriefingDifficultyPreset | string | null,
): BriefingDifficultyPreset {
  const up = String(preset ?? 'ADAPTIVE')
    .trim()
    .toUpperCase();
  switch (up) {
    case 'EASY':
    case 'MIDDLE_SCHOOL':
    case 'MID_SCHOOL':
      return 'MIDDLE_SCHOOL';
    case 'HIGH_SCHOOL':
      return 'HIGH_SCHOOL';
    case 'MEDIUM':
    case 'COLLEGE':
      return 'COLLEGE';
    case 'HARD':
    case 'GRADUATE':
      return 'GRADUATE';
    case 'GENIUS':
    case 'MENSA':
      return 'MENSA';
    case 'PROGRESSIVE':
      return 'PROGRESSIVE';
    case 'ADAPTIVE':
    default:
      return 'ADAPTIVE';
  }
}

/** Maps a fixed Briefing preset (or legacy alias) to its canonical `AcademicDifficultyTier`, or `null` for dynamic modes (`ADAPTIVE`/`PROGRESSIVE`). */
export function presetToAcademicTier(
  preset?: BriefingDifficultyPreset | string | null,
): AcademicDifficultyTier | null {
  const norm = normalizeBriefingDifficultyPreset(preset);
  if (
    norm === 'MIDDLE_SCHOOL' ||
    norm === 'HIGH_SCHOOL' ||
    norm === 'COLLEGE' ||
    norm === 'GRADUATE' ||
    norm === 'MENSA'
  ) {
    return norm;
  }
  return null;
}

export function getAcademicTierSpec(tier: AcademicDifficultyTier): AcademicDifficultyTierSpec {
  return ACADEMIC_DIFFICULTY_BY_ID[tier] ?? ACADEMIC_DIFFICULTY_TIERS[2];
}

export function getTierFromDifficultyScore(score: number): AcademicDifficultyTier {
  const s = clamp(Math.round(score), 0, 100);
  if (s <= 22) return 'MIDDLE_SCHOOL';
  if (s <= 44) return 'HIGH_SCHOOL';
  if (s <= 66) return 'COLLEGE';
  if (s <= 84) return 'GRADUATE';
  return 'MENSA';
}

export function getTierFromIrtB(irtB: number): AcademicDifficultyTier {
  const b = Number.isFinite(irtB) ? irtB : 0;
  if (b <= -0.85) return 'MIDDLE_SCHOOL';
  if (b <= -0.15) return 'HIGH_SCHOOL';
  if (b <= 0.65) return 'COLLEGE';
  if (b <= 1.45) return 'GRADUATE';
  return 'MENSA';
}

/**
 * Returns `[tier]` plus at most ONE immediately adjacent tier so fallback widening
 * NEVER leaps from `MIDDLE_SCHOOL` into `COLLEGE`/`GRADUATE`/`MENSA`!
 */
export function getAdjacentAcademicTiers(tier: AcademicDifficultyTier): AcademicDifficultyTier[] {
  const idx = ACADEMIC_DIFFICULTY_BY_ID[tier].rank;
  const out: AcademicDifficultyTier[] = [tier];
  if (idx === 0) {
    out.push('HIGH_SCHOOL');
  } else if (idx === ACADEMIC_DIFFICULTY_TIERS.length - 1) {
    out.push('GRADUATE');
  } else {
    out.push(ACADEMIC_DIFFICULTY_TIERS[idx - 1].id);
    out.push(ACADEMIC_DIFFICULTY_TIERS[idx + 1].id);
  }
  return out;
}

/**
 * Shifts an `AcademicDifficultyTier` down or up by `tierShift` steps (e.g., `-1` or `-2`
 * for Retry Mercy / "Scout's Advantage"), clamped strictly within `MIDDLE_SCHOOL..MENSA`.
 */
export function shiftAcademicDifficultyTier(
  tier: AcademicDifficultyTier,
  tierShift: number,
): AcademicDifficultyTier {
  const baseRank = ACADEMIC_DIFFICULTY_BY_ID[tier]?.rank ?? 0;
  const delta = Number.isFinite(tierShift) ? Math.trunc(tierShift) : 0;
  const shiftedRank = clamp(baseRank + delta, 0, ACADEMIC_DIFFICULTY_TIERS.length - 1);
  return ACADEMIC_DIFFICULTY_TIERS[shiftedRank].id;
}

/**
 * Strict 8-City Campaign Progressive Difficulty Ramp (`MIDDLE_SCHOOL` -> `MENSA`):
 *   - `ch` (Stage 1 — Geneva): `MIDDLE_SCHOOL`
 *   - `gb` (Stage 2 — London): Rounds 0–1 `MIDDLE_SCHOOL`, Rounds 2–4 `HIGH_SCHOOL`
 *   - `jp` (Stage 3 — Tokyo): `HIGH_SCHOOL`
 *   - `br` (Stage 4 — Rio) & `eg` (Stage 5 — Cairo): `COLLEGE`
 *   - `is` (Stage 6 — Reykjavik) & `sg` (Stage 7 — Singapore): `GRADUATE`
 *   - `global` (Stage 8 — Apex Finale): `MENSA`
 * Supports optional `mercyTierShift` (`-1` or `-2` when retrying a failed mission).
 */
export function resolveCampaignAcademicTier(
  hub: CampaignHubCode | string,
  roundIndex = 0,
  mercyTierShift = 0,
): AcademicDifficultyTier {
  const norm = String(hub ?? 'ch').trim().toLowerCase();
  const rIdx = Number.isFinite(roundIndex) ? Math.max(0, Math.trunc(roundIndex)) : 0;

  let baseTier: AcademicDifficultyTier;
  if (norm === 'ch' || norm === 'geneva') {
    baseTier = 'MIDDLE_SCHOOL';
  } else if (norm === 'gb' || norm === 'uk' || norm === 'london') {
    baseTier = rIdx <= 1 ? 'MIDDLE_SCHOOL' : 'HIGH_SCHOOL';
  } else if (norm === 'jp' || norm === 'tokyo') {
    baseTier = 'HIGH_SCHOOL';
  } else if (
    norm === 'br' ||
    norm === 'rio' ||
    norm === 'rio de janeiro' ||
    norm === 'eg' ||
    norm === 'cairo'
  ) {
    baseTier = 'COLLEGE';
  } else if (
    norm === 'is' ||
    norm === 'reykjavik' ||
    norm === 'sg' ||
    norm === 'singapore'
  ) {
    baseTier = 'GRADUATE';
  } else if (norm === 'global' || norm === 'apex' || norm === 'apex forum') {
    baseTier = 'MENSA';
  } else {
    baseTier = 'MIDDLE_SCHOOL';
  }

  return mercyTierShift !== 0
    ? shiftAcademicDifficultyTier(baseTier, mercyTierShift)
    : baseTier;
}

export type DifficultyCandidateInput =
  | Pick<
      RawQuestionRecord,
      | 'irtB'
      | 'archetype'
      | 'prompt'
      | 'answerCorrect'
      | 'distractors'
      | 'calibratorExt'
      | 'gauntletExt'
      | 'globePin'
      | 'shardRowRank01'
      | 'l0Domain'
    >
  | QuestionDifficultyAssessment;

export interface DifficultyMatchOptions {
  /** When true (Pass 1 fallback), allows at most ONE immediately adjacent tier (NEVER jumps 2+ tiers). */
  allowAdjacent?: boolean;
  /** Optional normalized shard table row rank [0..1] for shard items. */
  shardRowRank01?: number;
  /** Optional mercy shift (`-1` or `-2`) applied to the target tier before matching. */
  mercyTierShift?: number;
  /** Optional precomputed assessment to skip re-scoring inside tight query loops. */
  assessment?: QuestionDifficultyAssessment;
  /** Rejects `CODEX_DUAL_RING` on `MIDDLE_SCHOOL` (always) & `HIGH_SCHOOL` (strict pass). Defaults to true. */
  enforceMorphBounds?: boolean;
}

function isAssessmentObject(
  input: DifficultyCandidateInput,
): input is QuestionDifficultyAssessment {
  return (
    typeof input === 'object' &&
    input !== null &&
    'difficultyTier' in input &&
    'calibratedIrtB' in input &&
    'difficultyScore' in input
  );
}

/**
 * Strict academic difficulty predicate shared by Campaign (`ch`..`global`), Briefing Room,
 * and Finale Category Picker so early stages NEVER leak College/Graduate/Mensa questions
 * and late stages preserve genuine high-IQ prestige.
 */
export function doesCandidateMatchDifficultyPreset(
  candidate: DifficultyCandidateInput,
  preset?: BriefingDifficultyPreset | AcademicDifficultyTier | string | null,
  options: DifficultyMatchOptions = {},
): boolean {
  const baseTier = presetToAcademicTier(preset);
  if (!baseTier) {
    // Dynamic modes (`ADAPTIVE` / `PROGRESSIVE`) match via slot IRT curves instead of a fixed tier gate.
    return true;
  }

  const targetTier = options.mercyTierShift
    ? shiftAcademicDifficultyTier(baseTier, options.mercyTierShift)
    : baseTier;

  const allowAdjacent = Boolean(options.allowAdjacent);
  const enforceMorphBounds = options.enforceMorphBounds !== false;

  if (enforceMorphBounds && !isAssessmentObject(candidate)) {
    const arch = candidate.archetype ?? 'SIGHTLINE_LOCK';
    if (targetTier === 'MIDDLE_SCHOOL' && arch === 'CODEX_DUAL_RING') {
      return false;
    }
    if (targetTier === 'HIGH_SCHOOL' && !allowAdjacent && arch === 'CODEX_DUAL_RING') {
      return false;
    }
  }

  const assessment =
    options.assessment ??
    (isAssessmentObject(candidate)
      ? candidate
      : scoreQuestionDifficulty(candidate, { shardRowRank01: options.shardRowRank01 }));

  if (!allowAdjacent) {
    if (assessment.difficultyTier !== targetTier) {
      return false;
    }
    if (targetTier === 'MIDDLE_SCHOOL') {
      // Pure Middle School gate: accessible everyday knowledge, zero specialist academic jargon leaks.
      if (assessment.calibratedIrtB > -0.8) return false;
      if (assessment.breakdown.lexiconDelta > 0) return false;
    }
    if (targetTier === 'MENSA' && assessment.difficultyScore < 85) {
      return false;
    }
    return true;
  }

  const adjacent = getAdjacentAcademicTiers(targetTier);
  if (!adjacent.includes(assessment.difficultyTier)) {
    return false;
  }
  // Safety rails even during adjacent fallback: Middle School stays strictly in accessible High School band!
  if (targetTier === 'MIDDLE_SCHOOL') {
    if (assessment.difficultyScore > 36 || assessment.calibratedIrtB > -0.25) {
      return false;
    }
    if (assessment.breakdown.lexiconDelta > 0) {
      return false;
    }
  }
  if (targetTier === 'MENSA' && assessment.difficultyScore < 67) {
    return false;
  }
  return true;
}

/** Piecewise linear mapping of `irtB` (`-1.85..+2.85`) aligned cleanly to our 5 tier score boundaries (`0, 22, 44, 66, 84, 100`). */
function mapIrtBToPriorScore(irtB: number): number {
  const b = clamp(Number.isFinite(irtB) ? irtB : 0, -1.85, 2.85);
  if (b <= -0.85) return lerp(2, 22, (b - -1.85) / 1.0);
  if (b <= -0.15) return lerp(22, 44, (b - -0.85) / 0.7);
  if (b <= 0.65) return lerp(44, 66, (b - -0.15) / 0.8);
  if (b <= 1.45) return lerp(66, 84, (b - 0.65) / 0.8);
  return lerp(84, 99, (b - 1.45) / 1.4);
}

function mapShardRank01ToScore(rank01: number): number {
  const r = clamp(rank01, 0, 1);
  if (r <= 0.16) return lerp(4, 20, r / 0.16);
  if (r <= 0.42) return lerp(20, 44, (r - 0.16) / 0.26);
  if (r <= 0.70) return lerp(44, 66, (r - 0.42) / 0.28);
  if (r <= 0.90) return lerp(66, 84, (r - 0.70) / 0.20);
  return lerp(84, 98, (r - 0.90) / 0.10);
}

/** Inverse mapping from calibrated `difficultyScore` (`0..100`) to `calibratedIrtB` (`-1.85..+2.85`). */
function mapDifficultyScoreToIrtB(score: number): number {
  const s = clamp(score, 0, 100);
  let raw: number;
  if (s <= 22) raw = lerp(-1.8, -0.86, s / 22);
  else if (s <= 44) raw = lerp(-0.84, -0.16, (s - 22) / 22);
  else if (s <= 66) raw = lerp(-0.14, 0.64, (s - 44) / 22);
  else if (s <= 84) raw = lerp(0.66, 1.44, (s - 66) / 18);
  else raw = lerp(1.46, 2.75, (s - 84) / 16);
  return Math.round(raw * 100) / 100;
}

/**
 * Deterministic 6-Factor Objective Difficulty Calibration (`scoreQuestionDifficulty`):
 *   1. Base `irtB` prior + optional `shardRowRank01` (`0..1` fame/order rank inside sorted shards)
 *   2. Household Core Knowledge Lexicon boost (`-18` pts) vs. Specialist Academic/Latin Jargon (`+16` pts)
 *   3. Answer Specificity & Obscure 4-Digit Year Recall penalty (`+14` pts)
 *   4. Prompt Lexical & Clause Complexity (`-5..+10` pts)
 *   5. Cognitive Morph Complexity (`CODEX_DUAL_RING` `+20`, `CALIBRATOR_DIAL` `+12`, etc.)
 *   6. Distractor Plausibility Proximity (`-4..+8` pts)
 */
export function scoreQuestionDifficulty(
  raw: Pick<
    RawQuestionRecord,
    | 'irtB'
    | 'archetype'
    | 'prompt'
    | 'answerCorrect'
    | 'distractors'
    | 'calibratorExt'
    | 'gauntletExt'
    | 'globePin'
    | 'shardRowRank01'
    | 'l0Domain'
  >,
  opts?: { shardRowRank01?: number },
): QuestionDifficultyAssessment {
  const prompt = String(raw.prompt ?? '').trim();
  const arch: Archetype3D = raw.archetype ?? 'SIGHTLINE_LOCK';
  const answer = String(
    arch === 'GLOBE_PIN_DROP'
      ? (raw.globePin?.targetLabel || raw.answerCorrect || '')
      : (raw.answerCorrect ?? raw.globePin?.targetLabel ?? ''),
  ).trim();
  const rank01 = opts?.shardRowRank01 ?? raw.shardRowRank01;

  // --- Factor 1: Base irtB prior + shardRowRank01 ---
  const irtPrior = mapIrtBToPriorScore(Number(raw.irtB ?? 0));
  const basePriorScore =
    typeof rank01 === 'number' && Number.isFinite(rank01)
      ? irtPrior * 0.55 + mapShardRank01ToScore(rank01) * 0.45
      : irtPrior;

  // --- Factor 2: Household Core Knowledge (-18) vs. Specialist Academic/Latin Jargon (+16) ---
  let lexiconDelta = 0;
  const answerIsHousehold = HOUSEHOLD_CORE_RE.test(answer);
  const promptHasHousehold = HOUSEHOLD_CORE_RE.test(prompt);
  if (answerIsHousehold) {
    lexiconDelta -= 18;
  } else if (promptHasHousehold && answer.length <= 22) {
    lexiconDelta -= 10;
  }

  const combinedText = `${prompt} ${answer}`;
  let specialistHits = 0;
  if (SPECIALIST_JARGON_RE.test(combinedText)) specialistHits += 1;
  if (BINOMIAL_LATIN_RE.test(combinedText)) specialistHits += 1;
  if (specialistHits > 0) {
    lexiconDelta += Math.min(16, specialistHits * 11 + (SPECIALIST_JARGON_RE.test(answer) ? 5 : 0));
  }

  // --- Factor 3: Answer Specificity & Obscure Year Recall (+14 max) ---
  let specificityDelta = 0;
  const yearMatch = answer.match(/^\s*(\d{3,4})\s*(?:CE|BCE|AD|BC)?\s*$/i);
  const isCalibratorYear =
    arch === 'CALIBRATOR_DIAL' &&
    raw.calibratorExt &&
    /^(?:ce|bce|ad|bc|year|yr)$/i.test(String(raw.calibratorExt.unit ?? '').trim());
  const exactYearNum = yearMatch
    ? Number(yearMatch[1])
    : isCalibratorYear
      ? Math.round(Number(raw.calibratorExt!.exactVal))
      : null;

  if (exactYearNum !== null && Number.isFinite(exactYearNum)) {
    if (!ICONIC_LANDMARK_YEARS.has(exactYearNum)) {
      specificityDelta += 14;
    } else {
      specificityDelta += 2;
    }
  } else if (answer && arch !== 'GAUNTLET_SHATTER' && arch !== 'CODEX_DUAL_RING') {
    const ansWords = answer.split(/[\s/-]+/).filter((w) => w.length > 0);
    const avgAnsWordLen =
      ansWords.length > 0
        ? ansWords.reduce((sum, w) => sum + w.length, 0) / ansWords.length
        : 0;
    if (
      (ansWords.length >= 3 && avgAnsWordLen >= 7.0) ||
      (ansWords.length === 1 && answer.length >= 14 && !answerIsHousehold)
    ) {
      specificityDelta += 12;
    } else if (ansWords.length >= 4 && !answerIsHousehold) {
      specificityDelta += 8;
    } else if (ansWords.length <= 2 && answer.length <= 13 && !/\d{3,}/.test(answer)) {
      specificityDelta -= 4;
    }
  }

  // --- Factor 4: Prompt Lexical & Clause Complexity (-5..+10) ---
  let lexicalDelta = 0;
  const promptWords = prompt.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = promptWords.length;
  const alphaLens = promptWords
    .map((w) => w.replace(/[^a-zA-Z]/g, '').length)
    .filter((len) => len > 0);
  const avgWordLen =
    alphaLens.length > 0 ? alphaLens.reduce((a, b) => a + b, 0) / alphaLens.length : 5;
  const clauseSeparators = (prompt.match(/[,;:—–(]/g) ?? []).length;

  if (wordCount <= 16 && avgWordLen <= 5.4 && clauseSeparators <= 1) {
    lexicalDelta -= 5;
  } else {
    if (wordCount >= 28) lexicalDelta += 4;
    else if (wordCount >= 22) lexicalDelta += 2;
    if (avgWordLen >= 6.4) lexicalDelta += 4;
    else if (avgWordLen >= 5.9) lexicalDelta += 2;
    if (clauseSeparators >= 3) lexicalDelta += 2;
  }
  lexicalDelta = clamp(lexicalDelta, -5, 10);

  // --- Factor 5: Cognitive Morph Complexity (-2..+20) ---
  let morphDelta = 0;
  if (arch === 'CODEX_DUAL_RING') {
    morphDelta = 20;
  } else if (arch === 'CALIBRATOR_DIAL') {
    morphDelta = exactYearNum !== null && ICONIC_LANDMARK_YEARS.has(exactYearNum) ? 6 : 12;
  } else if (arch === 'HERO_ARTIFACT_SYNTHESIS') {
    morphDelta = 10;
  } else if (arch === 'GLOBE_PIN_DROP') {
    morphDelta = answerIsHousehold ? 0 : 5;
  } else if (arch === 'GAUNTLET_SHATTER') {
    morphDelta = raw.gauntletExt?.isTrick ? 10 : -2;
  }

  // --- Factor 6: Distractor Plausibility Proximity (-4..+8) ---
  let distractorDelta = 0;
  if (Array.isArray(raw.distractors) && raw.distractors.length > 0) {
    let plausSum = 0;
    let plausCount = 0;
    let sharedTokenHit = false;
    const ansTokens = new Set(
      answer
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 4),
    );

    for (const d of raw.distractors) {
      const dText = typeof d === 'string' ? d : String(d?.text ?? '');
      const pVal = typeof d === 'string' ? 0.74 : Number(d?.plausibility ?? 0.72);
      if (Number.isFinite(pVal)) {
        plausSum += pVal;
        plausCount++;
      }
      if (!sharedTokenHit && ansTokens.size > 0 && dText) {
        const dToks = dText.toLowerCase().split(/[^a-z0-9]+/);
        if (dToks.some((t) => t.length >= 4 && ansTokens.has(t))) {
          sharedTokenHit = true;
        }
      }
    }

    if (plausCount > 0) {
      const meanPlaus = plausSum / plausCount;
      if (meanPlaus >= 0.86) distractorDelta += 6;
      else if (meanPlaus >= 0.8) distractorDelta += 3;
      else if (meanPlaus <= 0.62) distractorDelta -= 4;
    }
    if (sharedTokenHit) {
      distractorDelta += 2;
    }
  }
  distractorDelta = clamp(distractorDelta, -4, 8);

  const rawScore =
    basePriorScore +
    lexiconDelta +
    specificityDelta +
    lexicalDelta +
    morphDelta +
    distractorDelta;
  const difficultyScore = Math.round(clamp(rawScore, 0, 100));
  const difficultyTier = getTierFromDifficultyScore(difficultyScore);
  const spec = ACADEMIC_DIFFICULTY_BY_ID[difficultyTier];
  const calibratedIrtB = mapDifficultyScoreToIrtB(difficultyScore);

  return {
    difficultyScore,
    calibratedIrtB,
    difficultyTier,
    difficultyLabel: spec.label,
    shortLabel: spec.shortLabel,
    badgeLabel: spec.badgeLabel,
    scoreMultiplier: spec.scoreMultiplier,
    timerSec: spec.timerSec,
    breakdown: {
      basePriorScore: Math.round(basePriorScore * 10) / 10,
      lexiconDelta,
      specificityDelta,
      lexicalDelta,
      morphDelta,
      distractorDelta,
    },
  };
}
