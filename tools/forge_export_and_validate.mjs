#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST — FORGE Question Bank Validator & Dual-Engine JSON Exporter
// Validates 100% schema, mobile typography budgets, uniqueness, zero clue-leaks,
// Domain/Country/Morph/Relic balance, and exports BOTH:
//   - public/data/questions.json  (WebGL2 / PWA runtime)
//   - godot/data/questions.json   (Godot 4.7.2 Android & HTML5 runtime)
//
// Usage:
//   node tools/forge_export_and_validate.mjs                  # Full bank check + export
//   node tools/forge_export_and_validate.mjs --shard <path>   # Validate single shard file
//   node tools/forge_export_and_validate.mjs --no-export      # Validate full bank only
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const VALID_DOMAINS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
const DOMAIN_NAMES = [
  '0:History',
  '1:Science',
  '2:Geography',
  '3:Arts',
  '4:Pop',
  '5:Sports',
  '6:Tech',
  '7:Nature',
  '8:Society',
  '9:Food',
  '10:Myth',
  '11:Logic',
];

const VALID_GLYPHS = new Set([
  'globe', 'atom', 'crown', 'dna', 'compass', 'prism', 'scales', 'column',
  'rocket', 'gear', 'mask', 'flame', 'eye', 'wave', 'star', 'scroll',
]);

const VALID_ARCHETYPES = new Set([
  'SIGHTLINE_LOCK',
  'CODEX_DUAL_RING',
  'CALIBRATOR_DIAL',
  'GAUNTLET_SHATTER',
  'HERO_ARTIFACT_SYNTHESIS',
]);

const VALID_RELICS = new Set([
  'meridian_astrolabe',
  'armillary_orrery',
  'origami_prism',
  'emerald_sphere',
  'cipher_box',
  'cryo_relay',
  'council_seal',
  'master_ledger',
]);

const CAMPAIGN_COUNTRY_RELIC = {
  CH: 'meridian_astrolabe',
  GB: 'armillary_orrery',
  JP: 'origami_prism',
  BR: 'emerald_sphere',
  EG: 'cipher_box',
  IS: 'cryo_relay',
  SG: 'council_seal',
  GLOBAL: 'master_ledger',
};

const VALID_REGIONS = new Set(['CH', 'GB', 'JP', 'BR', 'EG', 'IS', 'SG', 'GLOBAL']);

const VALID_TAGS = new Set([
  'SOVEREIGN_BLOC',
  'HORIZON_TECH',
  'AGORA_CIVIC',
  'MERIDIAN_ZERO',
  'BLACK_SALON',
  'ESPIONAGE',
  'ETHICS',
  'HIGH_POWER',
  'INVESTIGATIVE',
  'LATERAL_DEDUCTION',
  'CLASSIFIED_LEDGER',
  'HIGH_STAKES_BLUFF',
  'ARCHIVE_CORE',
  'CURRENT_PULSE',
  'RIVAL_PRESSURE',
  'FINALE_SYNTHESIS',
]);

const VALID_TONES = new Set(['PRESTIGE', 'WITTY', 'THRILLER', 'CRYPTIC']);
const VALID_FRESHNESS = new Set(['EVERGREEN', 'SLOW_DRIFT', 'CURRENT_EVENTS']);

const BUDGETS = {
  promptMax: 140,
  promptMin: 15,
  answerMax: 28,
  distractorMax: 28,
  codexLabelMax: 28,
  clue0Max: 95,
  clue1Max: 85,
  whyMax: 185,
  whyMin: 20,
};

// ----------------------------------------------------------------------------
// Clean TypeScript Module Loader (resolves local relative TS imports cleanly)
// ----------------------------------------------------------------------------
const moduleCache = new Map();

function loadTsModule(absPath) {
  const resolved = fs.existsSync(absPath)
    ? absPath
    : fs.existsSync(`${absPath}.ts`)
      ? `${absPath}.ts`
      : null;

  if (!resolved) {
    throw new Error(`Cannot resolve TypeScript module: ${absPath}`);
  }
  if (moduleCache.has(resolved)) {
    return moduleCache.get(resolved);
  }

  const source = fs.readFileSync(resolved, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      strict: false,
    },
    fileName: resolved,
  });

  const exportsObj = {};
  const modObj = { exports: exportsObj };
  const dir = path.dirname(resolved);

  const localRequire = (specifier) => {
    if (specifier.startsWith('.')) {
      const target = path.resolve(dir, specifier);
      // Type-only modules resolve cleanly to empty objects if referenced
      if (target.endsWith('types/game') || target.endsWith('types\\game')) {
        return {};
      }
      return loadTsModule(target);
    }
    throw new Error(`Unexpected external import "${specifier}" in ${resolved}`);
  };

  const fn = new Function('require', 'module', 'exports', transpiled.outputText);
  fn(localRequire, modObj, exportsObj);
  moduleCache.set(resolved, modObj.exports);
  return modObj.exports;
}

// ----------------------------------------------------------------------------
// Normalization & Clue Answer-Leak Detection
// ----------------------------------------------------------------------------
function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsWholePhrase(haystackNorm, needleNorm) {
  if (!needleNorm || needleNorm.length < 3) return false;
  const re = new RegExp(`(?:^| )${escapeRegex(needleNorm)}(?: |$)`, 'i');
  return re.test(haystackNorm);
}

function checkClueLeaks(q) {
  const leaks = [];
  const clueNorms = (q.clues || []).map((c) => normalizeText(c));

  if (q.archetype === 'SIGHTLINE_LOCK' || q.archetype === 'HERO_ARTIFACT_SYNTHESIS') {
    const ansNorm = normalizeText(q.answerCorrect);
    if (ansNorm.length >= 3) {
      clueNorms.forEach((cn, idx) => {
        if (containsWholePhrase(cn, ansNorm)) {
          leaks.push(`clues[${idx}] directly contains answerCorrect "${q.answerCorrect}"`);
        }
      });
    }
  } else if (q.archetype === 'CALIBRATOR_DIAL' && q.calibratorExt) {
    const exactStr = String(q.calibratorExt.exactVal);
    if (exactStr.length >= 2) {
      const re = new RegExp(`(?<![0-9.,])${escapeRegex(exactStr)}(?![0-9.,])`);
      (q.clues || []).forEach((c, idx) => {
        if (re.test(String(c))) {
          leaks.push(`clues[${idx}] directly reveals calibrator exactVal "${exactStr}"`);
        }
      });
    }
  }
  return leaks;
}

// ----------------------------------------------------------------------------
// Per-Question Validation
// ----------------------------------------------------------------------------
function validateQuestion(q, index, errors, warnings) {
  const tag = `QID ${q?.qid ?? `(idx ${index})`}`;

  if (!q || typeof q !== 'object') {
    errors.push(`${tag}: record is not an object`);
    return;
  }

  if (!Number.isInteger(q.qid) || q.qid < 1) {
    errors.push(`${tag}: qid must be positive integer`);
  }
  if (!VALID_DOMAINS.has(q.l0Domain)) {
    errors.push(`${tag}: invalid l0Domain ${q.l0Domain}`);
  }
  if (typeof q.l1Category !== 'string' || q.l1Category.trim().length < 2) {
    errors.push(`${tag}: invalid l1Category`);
  }
  if (typeof q.l2Subcategory !== 'string' || q.l2Subcategory.trim().length < 2) {
    errors.push(`${tag}: invalid l2Subcategory`);
  }
  if (typeof q.microTopicId !== 'string' || !/^[a-z0-9_]+$/.test(q.microTopicId)) {
    errors.push(`${tag}: microTopicId "${q.microTopicId}" must be snake_case`);
  }

  if (!Array.isArray(q.regions) || q.regions.length === 0) {
    errors.push(`${tag}: regions must be non-empty array`);
  } else {
    for (const r of q.regions) {
      if (!VALID_REGIONS.has(r)) {
        errors.push(`${tag}: invalid region "${r}"`);
      }
    }
  }

  if (!Array.isArray(q.narrativeTags) || q.narrativeTags.length === 0) {
    errors.push(`${tag}: narrativeTags must be non-empty array`);
  } else {
    for (const t of q.narrativeTags) {
      if (!VALID_TAGS.has(t)) {
        errors.push(`${tag}: invalid narrativeTag "${t}"`);
      }
    }
  }

  if (!VALID_TONES.has(q.tone)) {
    errors.push(`${tag}: invalid tone "${q.tone}"`);
  }
  if (typeof q.irtB !== 'number' || !Number.isFinite(q.irtB) || q.irtB < -2.5 || q.irtB > 3.0) {
    errors.push(`${tag}: irtB ${q.irtB} out of [-2.5, 3.0]`);
  }
  if (typeof q.irtA !== 'number' || !Number.isFinite(q.irtA) || q.irtA < 0.8 || q.irtA > 2.5) {
    errors.push(`${tag}: irtA ${q.irtA} out of [0.8, 2.5]`);
  }
  if (!VALID_FRESHNESS.has(q.freshness)) {
    errors.push(`${tag}: invalid freshness "${q.freshness}"`);
  }
  if (!VALID_ARCHETYPES.has(q.archetype)) {
    errors.push(`${tag}: invalid archetype "${q.archetype}"`);
  }
  if (!VALID_GLYPHS.has(q.glyphHint)) {
    errors.push(`${tag}: invalid glyphHint "${q.glyphHint}"`);
  }

  // Prompt length budget
  if (typeof q.prompt !== 'string' || q.prompt.trim().length < BUDGETS.promptMin) {
    errors.push(`${tag}: prompt missing or too short`);
  } else if (q.prompt.length > BUDGETS.promptMax) {
    errors.push(`${tag}: prompt length ${q.prompt.length} > ${BUDGETS.promptMax}`);
  }

  // Answer string
  if (typeof q.answerCorrect !== 'string' || q.answerCorrect.trim().length === 0) {
    errors.push(`${tag}: answerCorrect missing`);
  }

  // Clues length budgets
  if (!Array.isArray(q.clues) || q.clues.length !== 2) {
    errors.push(`${tag}: clues must be tuple of 2 strings`);
  } else {
    if (typeof q.clues[0] !== 'string' || q.clues[0].trim().length < 8) {
      errors.push(`${tag}: clues[0] missing or too short`);
    } else if (q.clues[0].length > BUDGETS.clue0Max) {
      errors.push(`${tag}: clues[0] length ${q.clues[0].length} > ${BUDGETS.clue0Max}`);
    }
    if (typeof q.clues[1] !== 'string' || q.clues[1].trim().length < 8) {
      errors.push(`${tag}: clues[1] missing or too short`);
    } else if (q.clues[1].length > BUDGETS.clue1Max) {
      errors.push(`${tag}: clues[1] length ${q.clues[1].length} > ${BUDGETS.clue1Max}`);
    }
  }

  // Why explanation budget
  if (typeof q.whyExplanation !== 'string' || q.whyExplanation.trim().length < BUDGETS.whyMin) {
    errors.push(`${tag}: whyExplanation missing or too short`);
  } else if (q.whyExplanation.length > BUDGETS.whyMax) {
    errors.push(`${tag}: whyExplanation length ${q.whyExplanation.length} > ${BUDGETS.whyMax}`);
  }

  // Hero relic check
  if (q.heroRelicId !== undefined && !VALID_RELICS.has(q.heroRelicId)) {
    errors.push(`${tag}: invalid heroRelicId "${q.heroRelicId}"`);
  }
  if (q.archetype === 'HERO_ARTIFACT_SYNTHESIS' && !q.heroRelicId) {
    errors.push(`${tag}: HERO_ARTIFACT_SYNTHESIS requires heroRelicId`);
  }

  // Archetype-specific validation
  if (q.archetype === 'SIGHTLINE_LOCK' || q.archetype === 'HERO_ARTIFACT_SYNTHESIS') {
    if (q.answerCorrect.length > BUDGETS.answerMax) {
      errors.push(
        `${tag}: answerCorrect "${q.answerCorrect}" length ${q.answerCorrect.length} > ${BUDGETS.answerMax}`
      );
    }
    if (!Array.isArray(q.distractors) || q.distractors.length < 3 || q.distractors.length > 4) {
      errors.push(`${tag}: Sightline/Hero requires 3-4 distractors`);
    } else {
      const seenFacet = new Set([normalizeText(q.answerCorrect)]);
      for (const [di, d] of q.distractors.entries()) {
        if (!d || typeof d.text !== 'string' || d.text.trim().length === 0) {
          errors.push(`${tag}: distractor[${di}] text invalid`);
          continue;
        }
        if (d.text.length > BUDGETS.distractorMax) {
          errors.push(
            `${tag}: distractor[${di}] "${d.text}" length ${d.text.length} > ${BUDGETS.distractorMax}`
          );
        }
        if (typeof d.plausibility !== 'number' || d.plausibility < 0 || d.plausibility > 1) {
          errors.push(`${tag}: distractor[${di}] plausibility ${d.plausibility} out of [0,1]`);
        }
        const normD = normalizeText(d.text);
        if (seenFacet.has(normD)) {
          errors.push(`${tag}: duplicate option/distractor "${d.text}"`);
        }
        seenFacet.add(normD);
      }
    }
  } else if (q.archetype === 'CALIBRATOR_DIAL') {
    const ext = q.calibratorExt;
    if (!ext || typeof ext !== 'object') {
      errors.push(`${tag}: CALIBRATOR_DIAL requires calibratorExt`);
    } else {
      if (
        typeof ext.exactVal !== 'number' ||
        typeof ext.minVal !== 'number' ||
        typeof ext.maxVal !== 'number' ||
        !Number.isFinite(ext.exactVal) ||
        !Number.isFinite(ext.minVal) ||
        !Number.isFinite(ext.maxVal)
      ) {
        errors.push(`${tag}: calibratorExt numeric fields invalid`);
      } else {
        if (!(ext.minVal < ext.exactVal && ext.exactVal < ext.maxVal)) {
          errors.push(
            `${tag}: calibratorExt must satisfy minVal (${ext.minVal}) < exactVal (${ext.exactVal}) < maxVal (${ext.maxVal})`
          );
        }
        if (ext.logScale && ext.minVal <= 0) {
          errors.push(`${tag}: calibratorExt logScale requires minVal > 0`);
        }
      }
      if (typeof ext.unit !== 'string' || ext.unit.trim().length === 0) {
        errors.push(`${tag}: calibratorExt.unit missing`);
      }
      if (ext.step !== undefined && (typeof ext.step !== 'number' || ext.step <= 0)) {
        errors.push(`${tag}: calibratorExt.step must be > 0`);
      }
    }
  } else if (q.archetype === 'CODEX_DUAL_RING') {
    const ext = q.codexExt;
    if (!ext || typeof ext !== 'object') {
      errors.push(`${tag}: CODEX_DUAL_RING requires codexExt`);
    } else {
      if (!Array.isArray(ext.pairs) || ext.pairs.length !== 3) {
        errors.push(`${tag}: codexExt.pairs must have exactly 3 pairs`);
      } else {
        const subjects = new Set();
        const targets = new Set();
        for (const [pi, p] of ext.pairs.entries()) {
          if (!p || typeof p.subject !== 'string' || typeof p.target !== 'string') {
            errors.push(`${tag}: codexExt.pairs[${pi}] malformed`);
            continue;
          }
          if (p.subject.trim().length === 0 || p.subject.length > BUDGETS.codexLabelMax) {
            errors.push(
              `${tag}: codexExt.pairs[${pi}].subject "${p.subject}" invalid/len>${BUDGETS.codexLabelMax}`
            );
          }
          if (p.target.trim().length === 0 || p.target.length > BUDGETS.codexLabelMax) {
            errors.push(
              `${tag}: codexExt.pairs[${pi}].target "${p.target}" invalid/len>${BUDGETS.codexLabelMax}`
            );
          }
          const ns = normalizeText(p.subject);
          const nt = normalizeText(p.target);
          if (subjects.has(ns)) errors.push(`${tag}: duplicate codex subject "${p.subject}"`);
          if (targets.has(nt)) errors.push(`${tag}: duplicate codex target "${p.target}"`);
          subjects.add(ns);
          targets.add(nt);
        }
        if (typeof ext.decoyTarget !== 'string' || ext.decoyTarget.trim().length === 0) {
          errors.push(`${tag}: codexExt.decoyTarget missing`);
        } else {
          if (ext.decoyTarget.length > BUDGETS.codexLabelMax) {
            errors.push(
              `${tag}: codexExt.decoyTarget "${ext.decoyTarget}" len>${BUDGETS.codexLabelMax}`
            );
          }
          if (targets.has(normalizeText(ext.decoyTarget))) {
            errors.push(`${tag}: codexExt.decoyTarget duplicates a real pair target`);
          }
        }
      }
    }
  } else if (q.archetype === 'GAUNTLET_SHATTER') {
    const ext = q.gauntletExt;
    if (!ext || typeof ext !== 'object') {
      errors.push(`${tag}: GAUNTLET_SHATTER requires gauntletExt`);
    } else {
      if (typeof ext.isTrue !== 'boolean') errors.push(`${tag}: gauntletExt.isTrue must be boolean`);
      if (typeof ext.isTrick !== 'boolean') errors.push(`${tag}: gauntletExt.isTrick must be boolean`);
      if (typeof ext.windowSec !== 'number' || ext.windowSec < 5 || ext.windowSec > 12) {
        errors.push(`${tag}: gauntletExt.windowSec ${ext.windowSec} out of [5, 12]`);
      }
    }
  }

  // Clue answer-leak check
  const leaks = checkClueLeaks(q);
  for (const leak of leaks) {
    // Only warn on legacy CORE QIDs 1..220 if any exist, hard error on all new QIDs > 220
    if (q.qid <= 220) {
      warnings.push(`${tag} (legacy core): ${leak}`);
    } else {
      errors.push(`${tag}: CLUE ANSWER LEAK — ${leak}`);
    }
  }
}

// ----------------------------------------------------------------------------
// Main Runner
// ----------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  const shardIdx = args.indexOf('--shard');
  const shardPath = shardIdx >= 0 ? args[shardIdx + 1] : null;
  const noExport = args.includes('--no-export');

  const errors = [];
  const warnings = [];
  let questions = [];
  let modeLabel = 'FULL BANK';

  if (shardPath) {
    modeLabel = `SHARD (${shardPath})`;
    const absShard = path.resolve(ROOT, shardPath);
    const mod = loadTsModule(absShard);
    const arrKey = Object.keys(mod).find((k) => Array.isArray(mod[k]));
    if (!arrKey) {
      console.error(`ERROR: No exported QuestionRecord[] array found in ${shardPath}`);
      process.exit(1);
    }
    questions = mod[arrKey];

    // Also load existing CORE topics/prompts to prevent cross-shard collisions early
    const corePath = path.resolve(ROOT, 'src/data/questions.ts');
    if (absShard !== corePath) {
      try {
        const coreRaw = fs.readFileSync(corePath, 'utf8');
        const coreTopicMatches = [...coreRaw.matchAll(/microTopicId:\s*['"]([^'"]+)['"]/g)].map(
          (m) => m[1]
        );
        const coreTopics = new Set(coreTopicMatches);
        for (const q of questions) {
          if (coreTopics.has(q.microTopicId)) {
            errors.push(`QID ${q.qid}: microTopicId "${q.microTopicId}" collides with CORE_QUESTIONS`);
          }
        }
      } catch {
        // ignore if questions.ts is mid-edit
      }
    }
  } else {
    const mod = loadTsModule(path.join(ROOT, 'src/data/questions.ts'));
    questions = mod.QUESTION_BANK;
    if (!Array.isArray(questions)) {
      console.error('ERROR: QUESTION_BANK export missing from src/data/questions.ts');
      process.exit(1);
    }
  }

  // 1. Validate every question & check uniqueness
  const seenQids = new Set();
  const seenTopics = new Set();
  const seenPrompts = new Map();

  questions.forEach((q, idx) => {
    validateQuestion(q, idx, errors, warnings);

    if (seenQids.has(q.qid)) {
      errors.push(`Duplicate qid: ${q.qid}`);
    }
    seenQids.add(q.qid);

    if (seenTopics.has(q.microTopicId)) {
      errors.push(`QID ${q.qid}: Duplicate microTopicId "${q.microTopicId}"`);
    }
    seenTopics.add(q.microTopicId);

    const normPrompt = normalizeText(q.prompt);
    if (seenPrompts.has(normPrompt)) {
      errors.push(`QID ${q.qid}: Duplicate prompt matches QID ${seenPrompts.get(normPrompt)}`);
    } else {
      seenPrompts.set(normPrompt, q.qid);
    }
  });

  // 2. Monotonic QID check
  if (!shardPath) {
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].qid !== i + 1) {
        errors.push(`Non-monotonic QID at index ${i}: expected ${i + 1}, got ${questions[i].qid}`);
        break;
      }
    }
    // Verify Geneva Prologue pinned QIDs 1..4 remain untouched
    const q1 = questions[0];
    const q2 = questions[1];
    const q3 = questions[2];
    const q4 = questions[3];
    if (q1?.answerCorrect !== 'Red Cross') errors.push('Pinned QID 1 altered!');
    if (q2?.answerCorrect !== 'League of Nations') errors.push('Pinned QID 2 altered!');
    if (q3?.answerCorrect !== 'World Wide Web') errors.push('Pinned QID 3 altered!');
    if (q4?.heroRelicId !== 'meridian_astrolabe') errors.push('Pinned QID 4 altered!');
  } else {
    // In shard mode, verify strictly increasing QIDs without gaps
    for (let i = 1; i < questions.length; i++) {
      if (questions[i].qid !== questions[i - 1].qid + 1) {
        errors.push(
          `Shard QID gap/order error at index ${i}: prev=${questions[i - 1].qid}, cur=${questions[i].qid}`
        );
        break;
      }
    }
  }

  // 3. Compute Stats
  const byDomain = Object.fromEntries(Array.from({ length: 12 }, (_, d) => [d, 0]));
  const domainMinB = Object.fromEntries(Array.from({ length: 12 }, (_, d) => [d, Infinity]));
  const domainMaxB = Object.fromEntries(Array.from({ length: 12 }, (_, d) => [d, -Infinity]));
  const byArchetype = {
    SIGHTLINE_LOCK: 0,
    HERO_ARTIFACT_SYNTHESIS: 0,
    CALIBRATOR_DIAL: 0,
    CODEX_DUAL_RING: 0,
    GAUNTLET_SHATTER: 0,
  };
  const byCountry = Object.fromEntries(Object.keys(CAMPAIGN_COUNTRY_RELIC).map((c) => [c, 0]));
  const byCountryArch = Object.fromEntries(
    Object.keys(CAMPAIGN_COUNTRY_RELIC).map((c) => [c, new Set()])
  );
  const byCountryRelics = Object.fromEntries(
    Object.keys(CAMPAIGN_COUNTRY_RELIC).map((c) => [c, new Set()])
  );
  const byTag = {};

  for (const q of questions) {
    if (byDomain[q.l0Domain] !== undefined) {
      byDomain[q.l0Domain]++;
      domainMinB[q.l0Domain] = Math.min(domainMinB[q.l0Domain], q.irtB);
      domainMaxB[q.l0Domain] = Math.max(domainMaxB[q.l0Domain], q.irtB);
    }
    if (byArchetype[q.archetype] !== undefined) {
      byArchetype[q.archetype]++;
    }
    for (const r of q.regions || []) {
      if (byCountry[r] !== undefined) {
        byCountry[r]++;
        byCountryArch[r].add(q.archetype);
        if (q.heroRelicId) {
          byCountryRelics[r].add(`${q.archetype}:${q.heroRelicId}`);
        }
      }
    }
    for (const t of q.narrativeTags || []) {
      byTag[t] = (byTag[t] || 0) + 1;
    }
  }

  // 4. Full-Bank Balance Gates
  if (!shardPath) {
    if (questions.length < 750) {
      errors.push(`Total question count ${questions.length} < 750 minimum target`);
    }

    for (let d = 0; d < 12; d++) {
      if (byDomain[d] < 60) {
        errors.push(`Domain ${DOMAIN_NAMES[d]} count ${byDomain[d]} < 60 minimum`);
      }
      if (domainMinB[d] > -1.0) {
        errors.push(`Domain ${DOMAIN_NAMES[d]} min irtB ${domainMinB[d]} > -1.0 (needs easy tier)`);
      }
      if (domainMaxB[d] < 2.2) {
        errors.push(`Domain ${DOMAIN_NAMES[d]} max irtB ${domainMaxB[d]} < 2.2 (needs grandmaster tier)`);
      }
    }

    const sightlineHero = byArchetype.SIGHTLINE_LOCK + byArchetype.HERO_ARTIFACT_SYNTHESIS;
    if (sightlineHero < 480) errors.push(`Sightline+Hero count ${sightlineHero} < 480 minimum`);
    if (byArchetype.CALIBRATOR_DIAL < 110) {
      errors.push(`CALIBRATOR_DIAL count ${byArchetype.CALIBRATOR_DIAL} < 110 minimum`);
    }
    if (byArchetype.CODEX_DUAL_RING < 85) {
      errors.push(`CODEX_DUAL_RING count ${byArchetype.CODEX_DUAL_RING} < 85 minimum`);
    }
    if (byArchetype.GAUNTLET_SHATTER < 100) {
      errors.push(`GAUNTLET_SHATTER count ${byArchetype.GAUNTLET_SHATTER} < 100 minimum`);
    }

    for (const [country, relic] of Object.entries(CAMPAIGN_COUNTRY_RELIC)) {
      if (byCountry[country] < 20) {
        errors.push(`Country ${country} count ${byCountry[country]} < 20 minimum`);
      }
      for (const reqArch of [
        'SIGHTLINE_LOCK',
        'CALIBRATOR_DIAL',
        'CODEX_DUAL_RING',
        'GAUNTLET_SHATTER',
        'HERO_ARTIFACT_SYNTHESIS',
      ]) {
        if (!byCountryArch[country].has(reqArch)) {
          errors.push(`Country ${country} missing archetype ${reqArch}`);
        }
      }
      if (!byCountryRelics[country].has(`HERO_ARTIFACT_SYNTHESIS:${relic}`)) {
        errors.push(
          `Country ${country} missing HERO_ARTIFACT_SYNTHESIS boss question for relic "${relic}"`
        );
      }
    }

    for (const reqTag of [
      'MERIDIAN_ZERO',
      'CLASSIFIED_LEDGER',
      'HIGH_STAKES_BLUFF',
      'FINALE_SYNTHESIS',
      'ARCHIVE_CORE',
    ]) {
      if ((byTag[reqTag] || 0) < 15) {
        errors.push(`Narrative tag ${reqTag} count ${byTag[reqTag] || 0} < 15 minimum`);
      }
    }
  }

  // 5. Print Telemetry Report
  console.log(`\n======================================================================`);
  console.log(`FORGE VALIDATION REPORT — ${modeLabel}`);
  console.log(`======================================================================`);
  console.log(`Total Questions : ${questions.length}`);
  console.log(
    `Morph Breakdown : Sightline=${byArchetype.SIGHTLINE_LOCK}, Hero=${byArchetype.HERO_ARTIFACT_SYNTHESIS} (Combined=${byArchetype.SIGHTLINE_LOCK + byArchetype.HERO_ARTIFACT_SYNTHESIS}), Calibrator=${byArchetype.CALIBRATOR_DIAL}, Codex=${byArchetype.CODEX_DUAL_RING}, Gauntlet=${byArchetype.GAUNTLET_SHATTER}`
  );
  console.log('\nBy Domain:');
  for (let d = 0; d < 12; d++) {
    const minS = Number.isFinite(domainMinB[d]) ? domainMinB[d].toFixed(1) : 'n/a';
    const maxS = Number.isFinite(domainMaxB[d]) ? domainMaxB[d].toFixed(1) : 'n/a';
    console.log(
      `  ${DOMAIN_NAMES[d].padEnd(13)} : ${String(byDomain[d]).padStart(3)}  (irtB ${minS} .. ${maxS})`
    );
  }
  console.log('\nBy Campaign Country:');
  for (const [country, relic] of Object.entries(CAMPAIGN_COUNTRY_RELIC)) {
    const hasBoss = byCountryRelics[country].has(`HERO_ARTIFACT_SYNTHESIS:${relic}`);
    console.log(
      `  ${country.padEnd(7)} : ${String(byCountry[country]).padStart(3)}  morphs=${byCountryArch[country].size}/5  boss(${relic})=${hasBoss ? 'OK' : 'MISSING'}`
    );
  }
  console.log('\nKey Act II-IV Narrative Tags:');
  for (const tag of [
    'MERIDIAN_ZERO',
    'CLASSIFIED_LEDGER',
    'HIGH_STAKES_BLUFF',
    'FINALE_SYNTHESIS',
    'ARCHIVE_CORE',
  ]) {
    console.log(`  ${tag.padEnd(20)} : ${byTag[tag] || 0}`);
  }

  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.slice(0, 20).forEach((w) => console.log(`  [WARN] ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\nVALIDATION FAILED — ${errors.length} error(s):`);
    errors.slice(0, 60).forEach((e) => console.error(`  [ERR] ${e}`));
    if (errors.length > 60) {
      console.error(`  ... and ${errors.length - 60} more errors.`);
    }
    process.exit(1);
  }

  console.log(`\n[PASS] 0 validation errors!`);

  // 6. Export Dual-Engine JSON (Full Bank Mode)
  if (!shardPath && !noExport) {
    const payload = {
      schemaVersion: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalCount: questions.length,
      counts: {
        byDomain,
        byArchetype,
        byCountry,
      },
      questions,
    };

    const jsonText = JSON.stringify(payload, null, 2);
    const webOut = path.join(ROOT, 'public/data/questions.json');
    const godotOut = path.join(ROOT, 'godot/data/questions.json');

    fs.mkdirSync(path.dirname(webOut), { recursive: true });
    fs.mkdirSync(path.dirname(godotOut), { recursive: true });
    fs.writeFileSync(webOut, jsonText, 'utf8');
    fs.writeFileSync(godotOut, jsonText, 'utf8');

    const kb = (Buffer.byteLength(jsonText, 'utf8') / 1024).toFixed(1);
    console.log(`Exported ${questions.length} verified questions (${kb} KB) to:`);
    console.log(`  - ${webOut}`);
    console.log(`  - ${godotOut}`);
  }
}

main();
