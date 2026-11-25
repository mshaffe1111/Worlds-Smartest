#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 Evergreen Pack Pipeline)
// Drop-In Evergreen Trivia Pack Validator & Compiler (`scripts/add_question_pack_v7.mjs`)
//
// Usage:
//   node scripts/add_question_pack_v7.mjs <input.json> [--out pack_name.json] [--pack-id id] [--title "Title"] [--priority 5] [--replace] [--dry-run] [--strict]
//   node scripts/add_question_pack_v7.mjs --verify-all
//
// Enforces ALL 12 AAA Quality Gates across existing shards + new pack:
//   Gate 1: Zero robotic Wikipedia/AI templates
//   Gate 2: Stem length (24..215 chars) & ZERO '...' / '…' ellipsis
//   Gate 3: 4 unique non-empty choices (1..38 chars), ZERO ellipsis
//   Gate 4: Distractor length-ratio parity & anti-longest-answer giveaway guard
//   Gate 5: Strict {0,1,2,3} bijection across answerIdx/poisonedFixIdx/waiverPruneIdx/anchorIdx
//   Gate 6: Punchy non-empty ahaFactoid (18..175 chars), distinct from stem, ZERO ellipsis
//   Gate 7: Cross-shard uniqueness (unique qid, unique canonicalEntityKey, unique stem, same-cat answer dedup)
//   Gate 8: Valid CategoryIdV7, matching DomainIdV7, difficulty 1..5, valid QuestionCardStyleV7 & ToyIdV7s
//   Gate 9: GeoTarget payload integrity (lat/lng/landmarkLabel)
//   Gate 10: BalanceScale payload integrity (5 weights, validPair sums to targetSum)
//   Gate 11: ConspiracyLasso payload integrity (9 unique cards, 3 distinct triadIndices)
//   Gate 12: Numeric / Sorter / Chronology / Patchbay / Vowels / Cyanotype / Shutters integrity
//
// Assigns dense QIDs starting at maxExistingQid + 1 (6578..), writes the compiled shard
// into `public/data/v7/`, and updates `public/data/v7/packs_manifest.json` so future packs
// scale effortlessly to 15,000-25,000+ clues with ZERO application code edits!
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public/data/v7');
const PACKS_MANIFEST_PATH = path.join(DATA_DIR, 'packs_manifest.json');

const CATEGORY_TO_DOMAIN = {
  MEDICINE: 'SCI_TECH',
  CHEMISTRY: 'SCI_TECH',
  PHYSICS: 'SCI_TECH',
  GADGETS: 'SCI_TECH',
  ENGINES: 'SCI_TECH',
  LITERATURE: 'POP_LIT',
  LEXICON: 'POP_LIT',
  'FINE ARTS': 'POP_LIT',
  SCREEN: 'POP_LIT',
  JUKEBOX: 'POP_LIT',
  FINANCE: 'NUM_GEO',
  PRICING: 'NUM_GEO',
  ODDS: 'NUM_GEO',
  ATLAS: 'NUM_GEO',
  SPORTS: 'NUM_GEO',
  DYNASTIES: 'HIST_FACT',
  HEADLINES: 'HIST_FACT',
  FOLKLORE: 'HIST_FACT',
  FALLACIES: 'HIST_FACT',
  CUISINE: 'HIST_FACT',
};

const VALID_CARD_STYLES = new Set([
  'CLASSIC_CUE',
  'HEADLINE_BLANK',
  'PICTURE_MONITOR',
  'SPOT_THE_MYTH',
  'BINARY_SPLIT',
]);

const VALID_TOYS = new Set([
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
]);

const BLITZ_LEGAL_TOYS = new Set([
  'TOY_01_KNIFE_SWITCH',
  'TOY_03_VERNIER_DIAL',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_11_MISSING_VOWELS_WHEEL',
]);

const BANNED_ROBOTIC_PATTERNS = [
  /what is the home country of/i,
  /what is the km of/i,
  /what is the capital of\b/i,
  /^(which|what) (chemical )?element has the atomic number\b/i,
  /^in which country is .* located\?/i,
  /locate waffle/i,
  /\bdelve\b|\btapestry\b|\btestament to\b|\bindelible mark\b/i,
  /\(\d{4}\)\?$/,
];

const DEFAULT_SEASON_SHARDS = [
  { file: 'season_1.json', kind: 'season', season: 1, priority: 10 },
  { file: 'season_2.json', kind: 'season', season: 2, priority: 20 },
  { file: 'season_3.json', kind: 'season', season: 3, priority: 30 },
  { file: 'season_4.json', kind: 'season', season: 4, priority: 40 },
];

function fnv1aHash(str) {
  let h = 0x811c9dc5;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function normEntity(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 96);
}

function normStem(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normAnswerDedupSlug(answerStr) {
  const cleaned = String(answerStr || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(the|a|an|gas|element|metal)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
  if (/^\d/.test(cleaned) || cleaned.length < 4) return null;
  return cleaned;
}

function hasEllipsis(str) {
  const s = String(str || '');
  return s.includes('...') || s.includes('\u2026');
}

function cleanInputCopy(str) {
  return String(str || '').trim();
}

function buildMissingVowelsPayload(answerStr, seedInt, answerIdx = 0) {
  const upper = String(answerStr || '').toUpperCase().trim();
  if (!/^[A-Z ]{4,22}$/.test(upper)) return undefined;
  const vowels = [];
  let masked = '';
  for (const ch of upper) {
    if ('AEIOU'.includes(ch)) {
      vowels.push(ch);
    } else if (ch === ' ') {
      masked += '   ';
    } else {
      masked += (masked && !masked.endsWith(' ') ? ' ' : '') + ch;
    }
  }
  if (vowels.length < 2 || vowels.length > 7) return undefined;
  const consonantsCount = upper.replace(/[^B-DF-HJ-NP-TV-Z]/g, '').length;
  if (consonantsCount < 3) return undefined;

  const trueSeq = vowels.join('-');
  const pool = ['A', 'E', 'I', 'O', 'U'];
  const distractors = new Set();
  let attempt = 0;
  while (distractors.size < 3 && attempt < 40) {
    attempt++;
    const mutated = vowels.map((v, idx) => {
      if ((idx + attempt + seedInt) % 2 === 0) {
        return pool[(pool.indexOf(v) + attempt + idx + 1) % 5];
      }
      return v;
    });
    const cand = mutated.join('-');
    if (cand !== trueSeq) distractors.add(cand);
  }
  if (distractors.size < 3) return undefined;
  const correctChoiceIdx = [0, 1, 2, 3].includes(answerIdx) ? answerIdx : seedInt % 4;
  const distArr = Array.from(distractors);
  const vowelChoices = [];
  let di = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctChoiceIdx) vowelChoices.push(trueSeq);
    else vowelChoices.push(distArr[di++]);
  }
  return {
    maskedDisplay: masked.trim(),
    fullAnswer: upper,
    vowelChoices,
    correctChoiceIdx,
  };
}

function computeBijection(answerIdx, choices, seedInt, preferredPoisonedIdx) {
  const others = [0, 1, 2, 3].filter((i) => i !== answerIdx);
  const ansLen = choices[answerIdx].length;
  const ranked = [...others].sort(
    (a, b) => Math.abs(choices[a].length - ansLen) - Math.abs(choices[b].length - ansLen),
  );
  const poisonedFixIdx =
    typeof preferredPoisonedIdx === 'number' && others.includes(preferredPoisonedIdx)
      ? preferredPoisonedIdx
      : ranked[0];
  const rest = ranked.filter((i) => i !== poisonedFixIdx);
  const rot = Math.abs(seedInt) % 2;
  const waiverPruneIdx = rest[rot === 0 ? 0 : 1];
  const anchorIdx = rest[rot === 0 ? 1 : 0];
  return { answerIdx, poisonedFixIdx, waiverPruneIdx, anchorIdx };
}

function inferDefaultCardStyle(clue) {
  if (clue.isKlaxonMyth) return 'SPOT_THE_MYTH';
  if (/\[[\s_]{2,}\]/.test(clue.stem)) return 'HEADLINE_BLANK';
  return 'CLASSIC_CUE';
}

function normalizeCandidateClue(raw, idx) {
  const category = String(raw.category || '').trim();
  const domain = raw.domain ? String(raw.domain).trim() : CATEGORY_TO_DOMAIN[category] || '';
  const stem = cleanInputCopy(raw.stem ?? raw.prompt ?? '');
  const choices = Array.isArray(raw.choices) ? raw.choices.map((c) => cleanInputCopy(c)) : [];
  const answerIdx = raw.answerIdx ?? raw.correctIndex;
  const ahaFactoid = cleanInputCopy(raw.ahaFactoid ?? raw.wittyHostAside ?? '');
  const difficulty = Number(raw.difficulty ?? 2);

  // Preserve explicit bijection if supplied (and let Gate 5 verify it strictly!), otherwise compute cleanly
  const hasExplicitBijection =
    raw.poisonedFixIdx !== undefined &&
    raw.waiverPruneIdx !== undefined &&
    raw.anchorIdx !== undefined;

  let poisonedFixIdx = raw.poisonedFixIdx;
  let waiverPruneIdx = raw.waiverPruneIdx;
  let anchorIdx = raw.anchorIdx;
  if (!hasExplicitBijection && [0, 1, 2, 3].includes(answerIdx) && choices.length === 4) {
    const bij = computeBijection(answerIdx, choices, idx + 17, raw.poisonedFixIdx);
    poisonedFixIdx = bij.poisonedFixIdx;
    waiverPruneIdx = bij.waiverPruneIdx;
    anchorIdx = bij.anchorIdx;
  }

  const canonicalEntityKey = normEntity(
    raw.canonicalEntityKey || `${choices[answerIdx] || 'item'}_${category}_${idx}`,
  );

  const isBespokeContraptionOnly =
    Boolean(raw.cyanotype) ||
    Boolean(raw.patchbay) ||
    Boolean(raw.balance) ||
    Boolean(raw.lasso);

  const initialToys =
    Array.isArray(raw.supportedToys) && raw.supportedToys.length > 0
      ? [...raw.supportedToys]
      : isBespokeContraptionOnly
        ? []
        : ['TOY_01_KNIFE_SWITCH', 'TOY_02_CONFIDENCE_PNEUMATIC', 'TOY_06_FUSE_WIRE_SNIPPER'];

  const supportedSet = new Set(initialToys);
  if (raw.numeric) {
    supportedSet.add('TOY_03_VERNIER_DIAL');
    if (
      typeof raw.numeric.target === 'number' &&
      raw.numeric.target >= 0 &&
      raw.numeric.target <= 100 &&
      typeof raw.numeric.max === 'number' &&
      raw.numeric.max <= 120
    ) {
      supportedSet.add('TOY_10_CLIFFHANGERS_THROTTLE');
    }
  }
  if (raw.balance) supportedSet.add('TOY_04_BALANCE_SCALE');
  if (raw.geo) supportedSet.add('TOY_05_RELIEF_GLOBE_3D');
  if (raw.sorter) supportedSet.add('TOY_07_MAIL_SORTER');
  if (raw.chronology) supportedSet.add('TOY_08_CHRONOLOGY_RAIL');
  if (raw.patchbay) supportedSet.add('TOY_09_SWITCHBOARD_PATCHBAY');
  if (raw.lasso) supportedSet.add('TOY_12_CONSPIRACY_LASSO');
  if (raw.cyanotype) supportedSet.add('TOY_13_CYANOTYPE_LOUPE');
  if (raw.shutters) supportedSet.add('TOY_14_FOUR_SHUTTER_REEL');

  if (isBespokeContraptionOnly) {
    supportedSet.delete('TOY_01_KNIFE_SWITCH');
    supportedSet.delete('TOY_02_CONFIDENCE_PNEUMATIC');
    supportedSet.delete('TOY_06_FUSE_WIRE_SNIPPER');
  } else {
    supportedSet.add('TOY_01_KNIFE_SWITCH');
    supportedSet.add('TOY_02_CONFIDENCE_PNEUMATIC');
    supportedSet.add('TOY_06_FUSE_WIRE_SNIPPER');
  }

  let vowels = raw.vowels;
  const isKlaxonMyth = Boolean(raw.isKlaxonMyth || raw.cardStyle === 'SPOT_THE_MYTH');
  const cardStyle =
    raw.cardStyle !== undefined ? String(raw.cardStyle).trim() : inferDefaultCardStyle({ isKlaxonMyth, stem });

  // Auto-generate Missing Vowels payload when clean and appropriate (skip SPOT_THE_MYTH full-clause statements)
  if (!vowels && !isBespokeContraptionOnly && cardStyle !== 'SPOT_THE_MYTH' && choices.length === 4 && [0, 1, 2, 3].includes(answerIdx)) {
    vowels = buildMissingVowelsPayload(choices[answerIdx], idx + 11, answerIdx);
  }
  if (vowels) {
    supportedSet.add('TOY_11_MISSING_VOWELS_WHEEL');
  }

  const out = {
    qid: typeof raw.qid === 'number' ? raw.qid : -1,
    canonicalEntityKey,
    category,
    domain,
    difficulty,
    isBlitzLegal: Boolean(raw.isBlitzLegal),
    stem,
    choices,
    answerIdx,
    poisonedFixIdx,
    waiverPruneIdx,
    anchorIdx,
    isKlaxonMyth,
    ahaFactoid,
    supportedToys: Array.from(supportedSet),
    cardStyle,
  };

  if (raw.numeric) out.numeric = raw.numeric;
  if (raw.balance) out.balance = raw.balance;
  if (raw.geo) out.geo = raw.geo;
  if (raw.sorter) out.sorter = raw.sorter;
  if (raw.chronology) out.chronology = raw.chronology;
  if (raw.patchbay) out.patchbay = raw.patchbay;
  if (vowels) out.vowels = vowels;
  if (raw.lasso) out.lasso = raw.lasso;
  if (raw.cyanotype) out.cyanotype = raw.cyanotype;
  if (raw.shutters) out.shutters = raw.shutters;

  return out;
}

function validateClue12Gates(clue, state, opts = {}) {
  const {
    checkQidUnique = false,
    skipSameCatAnswerDedup = false,
    allowMissingCardStyle = false,
    allowLegacyShutterEllipsis = false,
  } = opts;
  const reasons = [];

  // Gate 1: Zero robotic templates / AI slop / raw Markdown backticks / raw LaTeX
  const RAW_MARKDOWN_OR_LATEX_RE = /`|(\$[A-Za-z][A-Za-z0-9_{}^\\]+\$)|\\frac|\\times/;
  for (const re of BANNED_ROBOTIC_PATTERNS) {
    if (re.test(clue.stem) || re.test(clue.ahaFactoid)) {
      reasons.push(`gate1_robotic: matched ${re}`);
      state.gateDrops.gate1_robotic++;
      return reasons;
    }
  }
  if (
    RAW_MARKDOWN_OR_LATEX_RE.test(clue.stem) ||
    RAW_MARKDOWN_OR_LATEX_RE.test(clue.ahaFactoid || '') ||
    (Array.isArray(clue.choices) && clue.choices.some((ch) => RAW_MARKDOWN_OR_LATEX_RE.test(String(ch || '')))) ||
    clue.stem.includes('""') ||
    (clue.ahaFactoid || '').includes('""')
  ) {
    reasons.push('gate1_robotic: raw markdown backtick, LaTeX markup, or doubled quote "" found');
    state.gateDrops.gate1_robotic++;
    return reasons;
  }

  // Gate 2: Stem length (24..185 chars), ZERO ellipsis & 2-paddle BINARY_SPLIT wording guard
  const BINARY_FOUR_CONTRADICTION_RE =
    /\b(these four|all four of these|among these four|of these four|scan four|flex four|inspect four|line up four|compare four|check four|heat four|dip pH (?:paper|strips) into four|wire four|splash four|clock four|tap a chime through four|fire a rocket straight upward from four|strap a blood-pressure cuff onto four|scratch-test four|trace four|put four|peer through a telescope at four|place (?:a single speck of )?four|leave four|shine white light through four|pull apart four|hook a tiny stethoscope up to four|comparing construction dates of four|lining up four)\b/i;
  if (
    typeof clue.stem !== 'string' ||
    clue.stem.length < 24 ||
    clue.stem.length > 185 ||
    hasEllipsis(clue.stem) ||
    (clue.cardStyle === 'BINARY_SPLIT' && BINARY_FOUR_CONTRADICTION_RE.test(clue.stem))
  ) {
    reasons.push(
      `gate2_stemLen: len=${clue.stem?.length ?? 0}, ellipsis=${hasEllipsis(clue.stem)}, binaryFour=${clue.cardStyle === 'BINARY_SPLIT' && BINARY_FOUR_CONTRADICTION_RE.test(clue.stem)}`,
    );
    state.gateDrops.gate2_stemLen++;
    return reasons;
  }

  // Gate 2b: Zero HEADLINE_BLANK root-word self-spoilers (5+ letter unique root from answer appearing verbatim in stem)
  if (clue.cardStyle === 'HEADLINE_BLANK' && Array.isArray(clue.choices) && typeof clue.answerIdx === 'number') {
    const ansText = String(clue.choices[clue.answerIdx] || '').toLowerCase();
    const otherChoicesLow = clue.choices.filter((_, idx) => idx !== clue.answerIdx).map((s) => String(s || '').toLowerCase());
    const stemLow = clue.stem.toLowerCase();
    const HEADLINE_GENERIC_ALLOW = new Set([
      'about','after','again','among','award','black','board','brand','brown','build','chief','china','color','court','crown',
      'earth','eight','every','field','first','force','found','front','giant','glass','globe','golden','grand','great','green',
      'group','heavy','house','human','india','inner','japan','large','latin','light','local','major','metal','meter','miles',
      'model','money','month','music','never','night','north','ocean','order','other','paper','paris','parts','peace','place',
      'plain','plane','plant','plate','point','power','press','price','prime','prize','queen','radio','river','roman','round',
      'royal','scale','scene','score','seven','short','small','sound','south','space','speed','sport','stage','state','steel',
      'stone','story','style','sugar','super','sweet','table','their','there','these','thing','third','those','three','title',
      'today','total','tower','track','trade','train','under','union','value','water','where','which','while','white','whole',
      'whose','woman','women','words','world','would','years','young','american','ancient','british','century','classic','country',
      'english','europe','famous','federal','french','german','global','history','island','italian','london','million','billion',
      'modern','nation','national','official','olympic','people','percent','planet','popular','pounds','public','russian','school',
      'science','second','series','silver','single','spanish','square','standard','states','street','system','united','winter',
    ]);
    const ansWords = ansText.split(/[^a-z]+/).filter((w) => w.length >= 5 && !HEADLINE_GENERIC_ALLOW.has(w));
    for (const w of ansWords) {
      if (otherChoicesLow.some((o) => o.includes(w.slice(0, 5)))) continue;
      const root = w.endsWith('s') && w.length >= 6 ? w.slice(0, -1) : w;
      if (root.length < 5) continue;
      const leakRe = new RegExp(`(^|[^a-z])${root}(s|es|ed|ing|er|ers)?([^a-z]|$)`, 'i');
      if (leakRe.test(stemLow)) {
        reasons.push(`gate2_stemLen: HEADLINE_BLANK self-spoiler root "${root}" in stem`);
        state.gateDrops.gate2_stemLen++;
        return reasons;
      }
    }
  }

  // Gate 3: Exactly 4 unique non-empty choices (1..38 chars), ZERO ellipsis
  if (!Array.isArray(clue.choices) || clue.choices.length !== 4) {
    reasons.push('gate3_choices: choices must be an array of length 4');
    state.gateDrops.gate3_choices++;
    return reasons;
  }
  const normChoices = new Set(clue.choices.map((c) => String(c || '').toLowerCase().trim()));
  const lens = clue.choices.map((c) => String(c || '').length);
  if (
    normChoices.size !== 4 ||
    Math.min(...lens) < 1 ||
    Math.max(...lens) > 38 ||
    clue.choices.some((c) => hasEllipsis(c))
  ) {
    reasons.push(
      `gate3_choices: unique=${normChoices.size}, minLen=${Math.min(...lens)}, maxLen=${Math.max(...lens)}`,
    );
    state.gateDrops.gate3_choices++;
    return reasons;
  }

  // Gate 4: Distractor length-ratio guard
  const minLen = Math.max(1, Math.min(...lens));
  const maxLen = Math.max(...lens);
  const ratioCap = minLen <= 4 ? 3.5 : 2.65;
  if (maxLen / minLen > ratioCap) {
    reasons.push(`gate4_ratio: ratio ${(maxLen / minLen).toFixed(2)} > ${ratioCap}`);
    state.gateDrops.gate4_ratio++;
    return reasons;
  }

  // Gate 5: Strict {0,1,2,3} bijection across answerIdx/poisonedFixIdx/waiverPruneIdx/anchorIdx
  const bijVals = [clue.answerIdx, clue.poisonedFixIdx, clue.waiverPruneIdx, clue.anchorIdx];
  const bijSet = new Set(bijVals);
  if (
    bijSet.size !== 4 ||
    ![0, 1, 2, 3].every((k) => bijSet.has(k)) ||
    bijVals.some((v) => typeof v !== 'number')
  ) {
    reasons.push(`gate5_bijection: invalid bijection [${bijVals.join(',')}]`);
    state.gateDrops.gate5_bijection++;
    return reasons;
  }

  // Gate 6: Mandatory punchy ahaFactoid (18..175 chars), distinct from stem, ZERO ellipsis
  if (
    typeof clue.ahaFactoid !== 'string' ||
    clue.ahaFactoid.length < 18 ||
    clue.ahaFactoid.length > 175 ||
    hasEllipsis(clue.ahaFactoid) ||
    clue.ahaFactoid.toLowerCase() === clue.stem.toLowerCase()
  ) {
    reasons.push(
      `gate6_factoid: len=${clue.ahaFactoid?.length ?? 0}, ellipsis=${hasEllipsis(clue.ahaFactoid)}`,
    );
    state.gateDrops.gate6_factoid++;
    return reasons;
  }

  // Gate 7: Cross-shard deduplication (unique qid, canonicalEntityKey, normalized stem, same-cat answer)
  if (checkQidUnique) {
    if (!Number.isInteger(clue.qid) || clue.qid < 0 || state.seenQids.has(clue.qid)) {
      reasons.push(`gate7_dedup: invalid or duplicate qid=${clue.qid}`);
      state.gateDrops.gate7_dedup++;
      return reasons;
    }
  }
  if (!clue.canonicalEntityKey || state.seenEntities.has(clue.canonicalEntityKey)) {
    reasons.push(`gate7_dedup: duplicate canonicalEntityKey="${clue.canonicalEntityKey}"`);
    state.gateDrops.gate7_dedup++;
    return reasons;
  }
  const stemKey = normStem(clue.stem);
  if (!stemKey || state.seenStems.has(stemKey)) {
    reasons.push(`gate7_dedup: duplicate stem "${clue.stem.slice(0, 56)}"`);
    state.gateDrops.gate7_dedup++;
    return reasons;
  }
  const isClassic = Array.isArray(clue.supportedToys) && clue.supportedToys.includes('TOY_01_KNIFE_SWITCH');
  const ansSlug = isClassic ? normAnswerDedupSlug(clue.choices[clue.answerIdx]) : null;
  const catAnsKey = ansSlug ? `${clue.category}::${ansSlug}` : null;
  if (!skipSameCatAnswerDedup && catAnsKey && state.seenCategoryAnswers.has(catAnsKey)) {
    reasons.push(`gate7_dedup: duplicate category answer "${catAnsKey}"`);
    state.gateDrops.gate7_dedup++;
    return reasons;
  }

  // Gate 8: Valid CategoryIdV7, matching DomainIdV7, difficulty 1..5, valid cardStyle & ToyIdV7s
  const expectedDomain = CATEGORY_TO_DOMAIN[clue.category];
  if (!expectedDomain || clue.domain !== expectedDomain) {
    reasons.push(`gate8_schema: category="${clue.category}" domain="${clue.domain}" expected="${expectedDomain}"`);
    state.gateDrops.gate8_schema++;
    return reasons;
  }
  if (![1, 2, 3, 4, 5].includes(clue.difficulty)) {
    reasons.push(`gate8_schema: invalid difficulty=${clue.difficulty}`);
    state.gateDrops.gate8_schema++;
    return reasons;
  }
  if (clue.cardStyle !== undefined) {
    if (!VALID_CARD_STYLES.has(clue.cardStyle)) {
      reasons.push(`gate8_schema: invalid cardStyle="${clue.cardStyle}"`);
      state.gateDrops.gate8_schema++;
      return reasons;
    }
  } else if (!allowMissingCardStyle) {
    reasons.push('gate8_schema: missing cardStyle');
    state.gateDrops.gate8_schema++;
    return reasons;
  }
  if (
    !Array.isArray(clue.supportedToys) ||
    clue.supportedToys.length === 0 ||
    clue.supportedToys.some((t) => !VALID_TOYS.has(t))
  ) {
    reasons.push(`gate8_schema: invalid supportedToys`);
    state.gateDrops.gate8_schema++;
    return reasons;
  }

  // Gate 9: GeoTarget integrity (non-(0,0) Null Island sentinel + valid lat/lng bounds)
  if (clue.supportedToys.includes('TOY_05_RELIEF_GLOBE_3D') || clue.geo) {
    const g = clue.geo;
    if (
      !g ||
      typeof g.lat !== 'number' ||
      typeof g.lng !== 'number' ||
      (g.lat === 0 && g.lng === 0) ||
      Math.abs(g.lat) > 85 ||
      Math.abs(g.lng) > 180 ||
      !g.landmarkLabel
    ) {
      reasons.push('gate9_geo: invalid or Null Island (0,0) geo payload');
      state.gateDrops.gate9_geo++;
      return reasons;
    }
  }

  // Gate 10: BalanceScale integrity (5 weights, validPair sums to targetSum, unique pair on new packs)
  if (clue.supportedToys.includes('TOY_04_BALANCE_SCALE') || clue.balance) {
    const b = clue.balance;
    if (!b || !Array.isArray(b.weights) || b.weights.length !== 5 || !Array.isArray(b.validPair)) {
      reasons.push('gate10_balance: invalid balance payload');
      state.gateDrops.gate10_balance++;
      return reasons;
    }
    const [i0, i1] = b.validPair;
    if (
      i0 === i1 ||
      i0 < 0 ||
      i1 < 0 ||
      i0 > 4 ||
      i1 > 4 ||
      b.weights[i0].value + b.weights[i1].value !== b.targetSum
    ) {
      reasons.push('gate10_balance: validPair does not sum to targetSum');
      state.gateDrops.gate10_balance++;
      return reasons;
    }
    if (!allowLegacyShutterEllipsis) {
      let pairHits = 0;
      for (let a = 0; a < 5; a++) {
        for (let c = a + 1; c < 5; c++) {
          if (b.weights[a].value + b.weights[c].value === b.targetSum) pairHits++;
        }
      }
      if (pairHits !== 1) {
        reasons.push(`gate10_balance: expected strictly 1 pair summing to ${b.targetSum}, found ${pairHits}`);
        state.gateDrops.gate10_balance++;
        return reasons;
      }
    }
  }

  // Gate 11: ConspiracyLasso integrity
  if (clue.supportedToys.includes('TOY_12_CONSPIRACY_LASSO') || clue.lasso) {
    const l = clue.lasso;
    if (
      !l ||
      !Array.isArray(l.cards) ||
      l.cards.length !== 9 ||
      new Set(l.cards.map((x) => String(x).toLowerCase())).size !== 9 ||
      !Array.isArray(l.triadIndices) ||
      new Set(l.triadIndices).size !== 3 ||
      l.triadIndices.some((i) => i < 0 || i > 8)
    ) {
      reasons.push('gate11_lasso: invalid lasso payload');
      state.gateDrops.gate11_lasso++;
      return reasons;
    }
  }

  // Gate 12: Numeric / Sorter / Chronology / Patchbay / Vowels / Cyanotype / Shutters integrity
  if (clue.supportedToys.includes('TOY_03_VERNIER_DIAL') || clue.numeric) {
    const n = clue.numeric;
    const stepsFromMin = n && n.step > 0 ? (n.target - n.min) / n.step : NaN;
    const isStepReachable = Number.isFinite(stepsFromMin) && Math.abs(stepsFromMin - Math.round(stepsFromMin)) < 1e-4;
    if (
      !n ||
      typeof n.target !== 'number' ||
      typeof n.min !== 'number' ||
      typeof n.max !== 'number' ||
      typeof n.step !== 'number' ||
      n.max <= n.min ||
      n.step <= 0 ||
      n.target < n.min ||
      n.target > n.max ||
      !isStepReachable
    ) {
      reasons.push(`gate12_payloads: invalid or unreachable numeric payload (target=${n?.target}, min=${n?.min}, step=${n?.step})`);
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }
  if (clue.supportedToys.includes('TOY_07_MAIL_SORTER') || clue.sorter) {
    const s = clue.sorter;
    if (
      !s ||
      !s.chuteALabel ||
      !s.chuteBLabel ||
      !Array.isArray(s.items) ||
      s.items.length < 4 ||
      s.items.some((it) => !it?.label || (it.chute !== 0 && it.chute !== 1))
    ) {
      reasons.push('gate12_payloads: invalid sorter payload');
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }
  if (clue.supportedToys.includes('TOY_08_CHRONOLOGY_RAIL') || clue.chronology) {
    const ch = clue.chronology;
    const hasYearLeak =
      ch &&
      Array.isArray(ch.events) &&
      ch.events.some(
        (e) =>
          typeof e?.year === 'number' &&
          Math.abs(e.year) >= 1000 &&
          new RegExp(`\\b${Math.abs(e.year)}\\b`).test(String(e?.label || '')),
      );
    if (
      !ch ||
      !Array.isArray(ch.events) ||
      ch.events.length < 3 ||
      new Set(ch.events.map((e) => e.year)).size !== ch.events.length ||
      ch.events.some((e) => !e?.label || typeof e.year !== 'number' || !Number.isInteger(e.year)) ||
      hasYearLeak
    ) {
      reasons.push('gate12_payloads: invalid chronology payload (unique integer years, zero year leaks in labels)');
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }
  if (clue.supportedToys.includes('TOY_09_SWITCHBOARD_PATCHBAY') || clue.patchbay) {
    const pb = clue.patchbay;
    if (
      !pb ||
      !Array.isArray(pb.callers) ||
      pb.callers.length !== 3 ||
      !Array.isArray(pb.jacks) ||
      pb.jacks.length !== 4 ||
      !Array.isArray(pb.correctMapping) ||
      new Set(pb.correctMapping).size !== 3 ||
      pb.correctMapping.some((i) => i < 0 || i > 3)
    ) {
      reasons.push('gate12_payloads: invalid patchbay payload');
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }
  if (clue.supportedToys.includes('TOY_11_MISSING_VOWELS_WHEEL') || clue.vowels) {
    const v = clue.vowels;
    if (
      !v ||
      !v.maskedDisplay ||
      !v.fullAnswer ||
      !Array.isArray(v.vowelChoices) ||
      new Set(v.vowelChoices).size !== 4 ||
      ![0, 1, 2, 3].includes(v.correctChoiceIdx)
    ) {
      reasons.push('gate12_payloads: invalid vowels payload');
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }
  if (clue.supportedToys.includes('TOY_13_CYANOTYPE_LOUPE') || clue.cyanotype) {
    const cy = clue.cyanotype;
    if (!cy || !CATEGORY_TO_DOMAIN[cy.plateId] || cy.targetZoneIdx < 0 || cy.targetZoneIdx > 7 || !cy.targetZoneName) {
      reasons.push('gate12_payloads: invalid cyanotype payload');
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }
  if (clue.supportedToys.includes('TOY_14_FOUR_SHUTTER_REEL') || clue.shutters) {
    const sh = clue.shutters;
    if (
      !sh ||
      !Array.isArray(sh.shutters) ||
      sh.shutters.length !== 4 ||
      sh.shutters.some(
        (line) =>
          typeof line !== 'string' ||
          line.length < 10 ||
          line.length > 82 ||
          (!allowLegacyShutterEllipsis && hasEllipsis(line)),
      )
    ) {
      reasons.push('gate12_payloads: invalid shutters payload');
      state.gateDrops.gate12_payloads++;
      return reasons;
    }
  }

  // Compute strict Blitz legality
  const hasBlitzToy = clue.supportedToys.some((t) => BLITZ_LEGAL_TOYS.has(t));
  clue.isBlitzLegal =
    hasBlitzToy &&
    clue.stem.length <= 125 &&
    Math.max(...lens) <= 28 &&
    !clue.cyanotype;

  if (checkQidUnique) state.seenQids.add(clue.qid);
  state.seenEntities.add(clue.canonicalEntityKey);
  state.seenStems.add(stemKey);
  if (catAnsKey) state.seenCategoryAnswers.add(catAnsKey);
  return reasons;
}

function createValidationState() {
  return {
    seenQids: new Set(),
    seenEntities: new Set(),
    seenStems: new Set(),
    seenCategoryAnswers: new Set(),
    gateDrops: {
      gate1_robotic: 0,
      gate2_stemLen: 0,
      gate3_choices: 0,
      gate4_ratio: 0,
      gate5_bijection: 0,
      gate6_factoid: 0,
      gate7_dedup: 0,
      gate8_schema: 0,
      gate9_geo: 0,
      gate10_balance: 0,
      gate11_lasso: 0,
      gate12_payloads: 0,
    },
  };
}

function readExistingManifest() {
  if (fs.existsSync(PACKS_MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(PACKS_MANIFEST_PATH, 'utf8'));
  }
  const shards = [];
  let maxQid = -1;
  let totalCount = 0;
  for (const base of DEFAULT_SEASON_SHARDS) {
    const full = path.join(DATA_DIR, base.file);
    if (!fs.existsSync(full)) continue;
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    const clues = Array.isArray(data.clues) ? data.clues : [];
    const qids = clues.map((c) => c.qid);
    const minQ = qids.length ? Math.min(...qids) : 0;
    const maxQ = qids.length ? Math.max(...qids) : -1;
    if (maxQ > maxQid) maxQid = maxQ;
    totalCount += clues.length;
    shards.push({
      ...base,
      count: clues.length,
      qidRange: [minQ, maxQ],
    });
  }
  return {
    schema: 'WS_V7_PACKS_MANIFEST_1',
    updatedAtIso: new Date().toISOString(),
    bootPack: 'boot_pack.json',
    totalCorpusCount: totalCount,
    nextQid: maxQid + 1,
    shards,
  };
}

function loadExistingShardsIntoState(manifest, excludeFileName = null) {
  const state = createValidationState();
  let maxQid = -1;
  let existingCount = 0;
  for (const entry of manifest.shards) {
    if (excludeFileName && entry.file === excludeFileName) continue;
    const full = path.join(DATA_DIR, entry.file);
    if (!fs.existsSync(full)) {
      throw new Error(`Manifest references missing shard: ${entry.file}`);
    }
    const payload = JSON.parse(fs.readFileSync(full, 'utf8'));
    const clues = Array.isArray(payload.clues) ? payload.clues : [];
    for (const c of clues) {
      if (typeof c.qid === 'number' && c.qid > maxQid) maxQid = c.qid;
      state.seenQids.add(c.qid);
      state.seenEntities.add(c.canonicalEntityKey);
      state.seenStems.add(normStem(c.stem));
      const isClassic = Array.isArray(c.supportedToys) && c.supportedToys.includes('TOY_01_KNIFE_SWITCH');
      const slug = isClassic ? normAnswerDedupSlug(c.choices?.[c.answerIdx]) : null;
      if (slug) state.seenCategoryAnswers.add(`${c.category}::${slug}`);
      existingCount++;
    }
  }
  return { state, maxQid, existingCount };
}

function verifyAllShards() {
  const manifest = readExistingManifest();
  const state = createValidationState();
  const failures = [];
  let totalChecked = 0;
  const cardStyleCounts = {};
  const categoryCounts = {};
  const toyCounts = {};
  const shardSummaries = [];

  for (const entry of manifest.shards) {
    const full = path.join(DATA_DIR, entry.file);
    if (!fs.existsSync(full)) {
      failures.push(`Missing shard file: ${entry.file}`);
      continue;
    }
    const payload = JSON.parse(fs.readFileSync(full, 'utf8'));
    const clues = Array.isArray(payload.clues) ? payload.clues : [];
    const isSeasonLegacy = entry.kind === 'season';
    let shardFails = 0;
    for (const c of clues) {
      const reasons = validateClue12Gates(c, state, {
        checkQidUnique: true,
        skipSameCatAnswerDedup: isSeasonLegacy,
        allowMissingCardStyle: false,
        allowLegacyShutterEllipsis: false,
      });
      if (reasons.length > 0) {
        shardFails++;
        if (failures.length < 25) {
          failures.push(`[${entry.file} qid=${c.qid}] ${reasons.join('; ')}`);
        }
      }
      totalChecked++;
      const st = c.cardStyle || '(untagged-legacy)';
      cardStyleCounts[st] = (cardStyleCounts[st] || 0) + 1;
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      for (const t of c.supportedToys || []) {
        toyCounts[t] = (toyCounts[t] || 0) + 1;
      }
    }
    shardSummaries.push({ file: entry.file, count: clues.length, failures: shardFails });
  }

  // Also verify boot_pack.json schema integrity & every boot_pack qid exists in the corpus shards!
  const bootPath = path.join(DATA_DIR, manifest.bootPack || 'boot_pack.json');
  let bootFailures = 0;
  let bootCount = 0;
  const bootStyleCounts = {};
  const bootToyCounts = {};
  if (fs.existsSync(bootPath)) {
    const bootPayload = JSON.parse(fs.readFileSync(bootPath, 'utf8'));
    const bootClues = Array.isArray(bootPayload.clues) ? bootPayload.clues : [];
    bootCount = bootClues.length;
    const bootState = createValidationState();
    for (const c of bootClues) {
      if (!state.seenQids.has(c.qid)) {
        bootFailures++;
        if (failures.length < 25) {
          failures.push(`[boot_pack.json qid=${c.qid}] QID not found in any manifest shard`);
        }
      }
      const reasons = validateClue12Gates(c, bootState, {
        checkQidUnique: true,
        skipSameCatAnswerDedup: false,
        allowMissingCardStyle: false,
      });
      if (reasons.length > 0) {
        bootFailures++;
        if (failures.length < 25) {
          failures.push(`[boot_pack.json qid=${c.qid}] ${reasons.join('; ')}`);
        }
      }
      const st = c.cardStyle || '(missing)';
      bootStyleCounts[st] = (bootStyleCounts[st] || 0) + 1;
      for (const t of c.supportedToys || []) {
        bootToyCounts[t] = (bootToyCounts[t] || 0) + 1;
      }
    }
  } else {
    failures.push('Missing boot_pack.json');
  }

  // Verify dense QID contiguity 0 .. totalChecked-1
  const qidList = Array.from(state.seenQids).sort((a, b) => a - b);
  const minQid = qidList[0] ?? -1;
  const maxQid = qidList[qidList.length - 1] ?? -1;
  if (minQid !== 0 || maxQid !== totalChecked - 1) {
    failures.push(`QID contiguity mismatch: expected 0..${totalChecked - 1}, got ${minQid}..${maxQid} (unique=${qidList.length})`);
  }
  if (manifest.totalCorpusCount !== totalChecked) {
    failures.push(`Manifest totalCorpusCount=${manifest.totalCorpusCount} != actual ${totalChecked}`);
  }

  const report = {
    verifiedAtIso: new Date().toISOString(),
    totalCorpusClues: totalChecked,
    uniqueQids: state.seenQids.size,
    qidRange: [minQid, maxQid],
    bootPackCount: bootCount,
    bootPackFailures: bootFailures,
    totalFailures: failures.length,
    shards: shardSummaries,
    cardStyleCounts,
    bootStyleCounts,
    bootToyCounts,
    categoryCounts,
    toyCounts,
    gateDrops: state.gateDrops,
    sampleFailures: failures,
  };

  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0 || bootFailures > 0) {
    console.error(`\nFAILED VERIFICATION: ${failures.length} error(s) detected.`);
    process.exit(1);
  }
  console.log(`\nPASS: 0 schema/duplicate errors across all ${totalChecked} corpus clues + ${bootCount} boot_pack clues!`);
}

function parseCliArgs(argv) {
  const args = {
    input: null,
    out: null,
    packId: null,
    title: null,
    priority: 5,
    replace: false,
    dryRun: false,
    strict: false,
    verifyAll: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok === '--verify-all') args.verifyAll = true;
    else if (tok === '--replace') args.replace = true;
    else if (tok === '--dry-run') args.dryRun = true;
    else if (tok === '--strict') args.strict = true;
    else if (tok === '--out') args.out = argv[++i];
    else if (tok === '--pack-id') args.packId = argv[++i];
    else if (tok === '--title') args.title = argv[++i];
    else if (tok === '--priority') args.priority = Number(argv[++i] || 5);
    else if (!tok.startsWith('--') && !args.input) args.input = tok;
  }
  return args;
}

async function loadInputClues(inputPath) {
  const abs = path.resolve(ROOT, inputPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Input file not found: ${abs}`);
  }
  if (abs.endsWith('.mjs')) {
    const mod = await import(pathToFileURL(abs).href);
    const arr = mod.CLUES || mod.default || Object.values(mod).find((v) => Array.isArray(v));
    if (!Array.isArray(arr)) throw new Error(`No clue array exported from ${abs}`);
    return arr;
  }
  const parsed = JSON.parse(fs.readFileSync(abs, 'utf8'));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.clues)) return parsed.clues;
  throw new Error(`Input JSON must be an array or { clues: [...] }: ${abs}`);
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.verifyAll) {
    verifyAllShards();
    return;
  }
  if (!args.input) {
    console.log(
      'Usage:\n' +
        '  node scripts/add_question_pack_v7.mjs <input.json> [--out pack_name.json] [--pack-id id] [--title "Title"] [--priority 5] [--replace] [--dry-run] [--strict]\n' +
        '  node scripts/add_question_pack_v7.mjs --verify-all',
    );
    process.exit(1);
  }

  const baseInputName = path.basename(args.input, path.extname(args.input));
  const packId = args.packId || normEntity(baseInputName.replace(/^pack_/, '')) || 'custom_pack';
  const outFileName = args.out
    ? args.out.endsWith('.json')
      ? args.out
      : `${args.out}.json`
    : baseInputName.startsWith('pack_')
      ? `${baseInputName}.json`
      : `pack_${packId}.json`;
  const title = args.title || `Expansion Pack: ${packId}`;

  const manifest = readExistingManifest();
  const alreadyRegistered = manifest.shards.some((s) => s.file === outFileName);
  if (alreadyRegistered && !args.replace) {
    throw new Error(`Shard "${outFileName}" already exists in packs_manifest.json. Pass --replace to overwrite it.`);
  }

  const { state, maxQid, existingCount } = loadExistingShardsIntoState(
    manifest,
    args.replace ? outFileName : null,
  );

  const rawClues = await loadInputClues(args.input);
  const accepted = [];
  const rejected = [];

  rawClues.forEach((raw, idx) => {
    const norm = normalizeCandidateClue(raw, idx);
    const reasons = validateClue12Gates(norm, state, {
      checkQidUnique: false,
      skipSameCatAnswerDedup: false,
      allowMissingCardStyle: false,
    });
    if (reasons.length === 0) {
      accepted.push(norm);
    } else {
      rejected.push({
        index: idx,
        category: raw?.category,
        key: norm.canonicalEntityKey,
        stem: String(raw?.stem || '').slice(0, 72),
        reasons,
      });
    }
  });

  if (args.strict && rejected.length > 0) {
    console.error(`STRICT MODE FAILED: ${rejected.length} of ${rawClues.length} clues failed validation.`);
    console.error(JSON.stringify(rejected.slice(0, 20), null, 2));
    process.exit(1);
  }

  // Deterministic non-alphabetical interleave by difficulty + FNV-1a hash so draw order stays lively!
  accepted.sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    const ha = fnv1aHash(a.canonicalEntityKey);
    const hb = fnv1aHash(b.canonicalEntityKey);
    if (ha !== hb) return ha - hb;
    return a.canonicalEntityKey.localeCompare(b.canonicalEntityKey);
  });

  // Assign dense QIDs starting immediately after maxExistingQid (6578..)
  const startQid = maxQid + 1;
  accepted.forEach((clue, i) => {
    clue.qid = startQid + i;
  });
  const endQid = accepted.length > 0 ? startQid + accepted.length - 1 : startQid;
  const newTotalCorpusCount = existingCount + accepted.length;

  // Compute summary stats
  const catCounts = {};
  const styleCounts = {};
  const toyCounts = {};
  const answerIdxCounts = [0, 0, 0, 0];
  let longestIsTrue = 0;

  for (const c of accepted) {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    styleCounts[c.cardStyle] = (styleCounts[c.cardStyle] || 0) + 1;
    answerIdxCounts[c.answerIdx]++;
    const maxDist = Math.max(...c.choices.filter((_, i) => i !== c.answerIdx).map((s) => s.length), 1);
    if (c.choices[c.answerIdx].length > maxDist) longestIsTrue++;
    for (const t of c.supportedToys) {
      toyCounts[t] = (toyCounts[t] || 0) + 1;
    }
  }

  const summary = {
    inputFile: args.input,
    outputShard: outFileName,
    packId,
    title,
    dryRun: args.dryRun,
    inputCount: rawClues.length,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    qidRange: [startQid, endQid],
    newTotalCorpusCount,
    answerIdxBalance: answerIdxCounts,
    longestIsTrueRatio: Number((longestIsTrue / Math.max(1, accepted.length)).toFixed(4)),
    styleCounts,
    categoryCounts: catCounts,
    toyCounts,
    gateDrops: state.gateDrops,
    sampleRejected: rejected.slice(0, 15),
  };

  if (!args.dryRun && accepted.length > 0) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const shardOutPath = path.join(DATA_DIR, outFileName);
    const shardDoc = {
      schema: 'WS_V7_CORPUS_1',
      packId,
      title,
      compiledAtIso: new Date().toISOString(),
      totalCorpusCount: newTotalCorpusCount,
      qidRange: [startQid, endQid],
      clues: accepted,
    };
    fs.writeFileSync(shardOutPath, JSON.stringify(shardDoc));

    const updatedShards = manifest.shards.filter((s) => s.file !== outFileName);
    updatedShards.push({
      file: outFileName,
      kind: 'expansion',
      packId,
      title,
      priority: Number.isFinite(args.priority) ? args.priority : 5,
      count: accepted.length,
      qidRange: [startQid, endQid],
    });
    const nextManifest = {
      schema: 'WS_V7_PACKS_MANIFEST_1',
      updatedAtIso: new Date().toISOString(),
      bootPack: manifest.bootPack || 'boot_pack.json',
      totalCorpusCount: newTotalCorpusCount,
      nextQid: endQid + 1,
      shards: updatedShards,
    };
    fs.writeFileSync(PACKS_MANIFEST_PATH, JSON.stringify(nextManifest, null, 2));
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
