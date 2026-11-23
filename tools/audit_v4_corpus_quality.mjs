#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v4.0 — AUTOMATED CORPUS QUALITY & 7-FORMAT PROOF AUDIT
// Samples 1,000+ generated QuestionCardV4s across all 7 formats, 12 domains,
// and 5 difficulty tiers + audits 170 Globe Pin-Drops, 100 Codex Synthesis
// puzzles, Fame Gate compliance, 4,000 evaluateSubmissionV4 math checks, and
// entry JS footprint awareness (< 350 kB).
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

// ----------------------------------------------------------------------------
// 1. Bundle TypeScript modules cleanly into temp ESM via esbuild + measure size
// ----------------------------------------------------------------------------
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-v4-content-audit-'));
const bundleOut = path.join(tmpDir, 'content_engine_bundle.mjs');
const minOut = path.join(tmpDir, 'content_engine_min.mjs');

const entryShim = path.join(tmpDir, 'entry_shim.ts');
fs.writeFileSync(
  entryShim,
  `export * from ${JSON.stringify(path.join(ROOT, 'src/v4/QuestionGeneratorV4.ts'))};
export { ForgeEngine, forgeEngine } from ${JSON.stringify(path.join(ROOT, 'src/forge/ForgeEngine.ts'))};
export {
  approxGreatCircleKm,
  normalizeToPrismQuestion,
  synthesizeShardCodexQuestion,
  isBenchmarkOrExamSlop,
  hasRoboticWhyExplanation,
  isObscureCatalogEntityName,
} from ${JSON.stringify(path.join(ROOT, 'src/forge/ShardDecoder.ts'))};
`,
  'utf8',
);

await build({
  entryPoints: [entryShim],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  outfile: bundleOut,
});

await build({
  entryPoints: [path.join(ROOT, 'src/v4/QuestionGeneratorV4.ts')],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: minOut,
});

const contentEngineMinBytes = fs.statSync(minOut).size;
const contentEngineMinKb = Number((contentEngineMinBytes / 1024).toFixed(1));

// ----------------------------------------------------------------------------
// 2. Polyfill browser fetch() over public/ so ForgeEngine loads real disk JSON
// ----------------------------------------------------------------------------
globalThis.fetch = async (input) => {
  const rawUrl = String(input);
  const rel = rawUrl.replace(/^\.\/+/, '').replace(/^\/+/, '');
  const diskPath = path.join(PUBLIC_DIR, rel);
  if (!fs.existsSync(diskPath)) {
    return {
      ok: false,
      status: 404,
      json: async () => {
        throw new Error(`404: ${diskPath}`);
      },
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  }
  const buf = fs.readFileSync(diskPath);
  return {
    ok: true,
    status: 200,
    body: true,
    json: async () => JSON.parse(buf.toString('utf8')),
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    text: async () => buf.toString('utf8'),
  };
};

const mod = await import(pathToFileURL(bundleOut).href);
const {
  ForgeEngine,
  ALL_QUESTION_FORMATS_V4,
  drawQuestionCardV4,
  drawQuestionCardV4Sync,
  evaluateSubmissionV4,
  approxGreatCircleKm,
  normalizeToPrismQuestion,
  synthesizeShardCodexQuestion,
  isObscureCatalogEntityName,
} = mod;

// ----------------------------------------------------------------------------
// 3. Initialize ForgeEngine & load all 12 domain shards
// ----------------------------------------------------------------------------
const engine = new ForgeEngine({ dataBaseUrl: './data' });
const counts = await engine.init();
await engine.ensureDomainsLoaded([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

// Regex checks
const RE_YEAR_COMMA =
  /\b(?:(?:in|on|born|died|founded|opened|released|published|year|since|until|before|after|from|around|circa|c\.)\s+[12],\d{3}(?!,\d{3}|\s+(?:km|kilometers|meters|m\b|feet|ft|miles|mi|years|yrs|seats|hits|points|people|tons|kg))|\([12],\d{3}\)|[12],\d{3}\s*(?:CE|BCE|AD|BC)\b)/i;
const RE_SLOP_PROMPT =
  /\b(?:which of the following|all of the following except|none of the above|all of the above|infonity|a student wants to|students are studying|characteristic of the ring|find the derivative|evaluate the integral)\b|____/i;
const RE_ROBOTIC_WHY =
  /stands as the (?:exact |accurate )?(?:verified )?solution|verified\b[^.]{0,60}\b(?:match is|record confirms|answer is|solution is)|(?:record confirms|archive locks in|ledger locks in)\s+["'“]|confirmed (?:true|false|under|in)\b[^.]{0,65}(?:verified record|precise match|accurate answer|stands on)|^false on the\b[^.]{0,50}\brecord:|setting it apart from the three decoys|directly satisfies the\b|is the precise match for this|verified in the meridian ledger/i;
const RE_DRY_LETTER_HINT = /\b(?:starts with|begins with)\s+["'“‘]?[A-Za-z0-9]["'”’]?/i;
const RE_APOLLO_SPACE = /\b(?:apollo\s*(?:11|13|17)|moon landing|lunar module|neil armstrong|nasa)\b/i;

function checkNoYearCommas(text, context) {
  if (!text) return;
  if (RE_YEAR_COMMA.test(text)) {
    fail(`Year-comma leak in ${context}: "${text.slice(0, 110)}"`);
  }
}

// ----------------------------------------------------------------------------
// 4. Audit Static Curated Pack & ForgeEngine Quarantine / Scale
// ----------------------------------------------------------------------------
const curatedCards = engine.getCuratedV4Cards();
if (curatedCards.length < 240) {
  fail(`curated_v4_witty_pack.json has only ${curatedCards.length} cards (required >= 240)`);
}

const curatedByDomain = new Map();
const curatedByFormat = new Map();
const curatedQids = new Set();
for (const c of curatedCards) {
  if (curatedQids.has(c.qid)) fail(`Duplicate QID ${c.qid} in curated_v4_witty_pack.json`);
  curatedQids.add(c.qid);
  curatedByDomain.set(c.domainId, (curatedByDomain.get(c.domainId) ?? 0) + 1);
  curatedByFormat.set(c.format, (curatedByFormat.get(c.format) ?? 0) + 1);
  if (c.format === 'VISUAL_SPOTTER' && c.visualSpotter?.visualKind === 'SVG_DIAGRAM') {
    const rel = String(c.visualSpotter.imageUrl || '').replace(/^\.\/+/, '');
    if (!fs.existsSync(path.join(PUBLIC_DIR, rel))) {
      fail(`Missing SVG asset referenced by curated QID ${c.qid}: ${c.visualSpotter.imageUrl}`);
    }
  }
}

for (let d = 0; d < 12; d++) {
  if ((curatedByDomain.get(d) ?? 0) < 10) {
    fail(`Curated pack under-populated for Domain ${d}: ${curatedByDomain.get(d) ?? 0}`);
  }
}
for (const fmt of ALL_QUESTION_FORMATS_V4) {
  if ((curatedByFormat.get(fmt) ?? 0) < 12) {
    fail(`Curated pack under-populated for Format ${fmt}: ${curatedByFormat.get(fmt) ?? 0}`);
  }
}

// Verify ForgeEngine Tier-1 quarantine
const tier1Records = engine.getCleanTier1Records();
const leakedSlopTier1 = tier1Records.filter(
  (r) =>
    (r.qid >= 4965 && r.qid <= 20165) ||
    RE_SLOP_PROMPT.test(r.prompt || '') ||
    RE_ROBOTIC_WHY.test(r.whyExplanation || '') ||
    /^[a-z](?!H\b|Phone|Pad|Pod|Mac|OS|Bay|RNA|DNA)/.test((r.prompt || '').trim().replace(/^["'“‘(\[]+/, '')),
);
if (leakedSlopTier1.length > 0) {
  fail(`ForgeEngine Tier-1 leaked ${leakedSlopTier1.length} junk/slop records (first QID ${leakedSlopTier1[0].qid})`);
}

if (counts.totalPlayableCount < 500_000) {
  fail(`Total playable scale below 500k: ${counts.totalPlayableCount}`);
}

// ----------------------------------------------------------------------------
// 5. Audit all 170 GLOBE_PIN_DROP items for plausible regional neighbors
// ----------------------------------------------------------------------------
const globeRecords = engine.getVisualGlobeRecords().filter((r) => r.archetype === 'GLOBE_PIN_DROP');
let globeAudited = 0;
let globeOppositeContinentLeaks = 0;
let globeIsolatedIslandNotes = 0;

for (const raw of globeRecords) {
  const pq = normalizeToPrismQuestion(raw, { shuffleSalt: raw.qid });
  if (!pq.globePin) continue;
  globeAudited++;
  const { targetLat, targetLon, targetLabel, quickAnchors } = pq.globePin;
  const decoys = quickAnchors.filter((a) => a.label.toLowerCase() !== targetLabel.toLowerCase());
  if (decoys.length < 3) {
    fail(`Globe QID ${raw.qid} has fewer than 3 decoy anchors`);
  }
  for (const dec of decoys) {
    const dist = approxGreatCircleKm(targetLat, targetLon, dec.lat, dec.lon);
    if (dist > 2200) {
      // Allow ONLY ultra-remote oceanic islands (e.g. Hawaii / Easter Island / Guam) where <3 major cities exist in 2,200 km
      const isRemoteOcean =
        (targetLat > 15 && targetLat < 26 && targetLon < -150 && targetLon > -165) ||
        (targetLat < -20 && targetLon < -100 && targetLon > -120) ||
        (Math.abs(targetLat) > 65);
      if (isRemoteOcean && dist <= 4500) {
        globeIsolatedIslandNotes++;
      } else {
        globeOppositeContinentLeaks++;
        fail(
          `Globe QID ${raw.qid} (${targetLabel}) has far-away decoy "${dec.label}" at ${Math.round(dist)} km (>2,200 km)`,
        );
      }
    } else if (dist < 300) {
      fail(
        `Globe QID ${raw.qid} (${targetLabel}) has overly close decoy "${dec.label}" at ${Math.round(dist)} km`,
      );
    }
  }
}

// ----------------------------------------------------------------------------
// 6. Audit 100 CODEX_SYNTHESIS items for zero verbatim pair/decoy leaks in clues
// ----------------------------------------------------------------------------
const manifest = engine.getUnifiedManifest();
let codexAudited = 0;
let codexClueLeaks = 0;
for (let i = 0; i < 100; i++) {
  const dom = i % 12;
  const chunks = engine.getLoadedShardChunksForDomain(dom);
  const raw = synthesizeShardCodexQuestion(manifest, chunks, dom, i * 17 + 3, 0.5);
  if (!raw || !raw.codexExt) continue;
  codexAudited++;
  const pq = normalizeToPrismQuestion(raw, { shuffleSalt: i });
  const cluesBlob = `${pq.clues[0]} ${pq.clues[1]}`.toLowerCase();
  const decoyLow = raw.codexExt.decoyTarget.toLowerCase();
  if (decoyLow.length >= 3 && cluesBlob.includes(decoyLow)) {
    codexClueLeaks++;
    fail(`Codex QID ${raw.qid} leaked decoy "${raw.codexExt.decoyTarget}" in clues`);
  }
  for (const p of raw.codexExt.pairs) {
    const sl = p.subject.toLowerCase();
    const tl = p.target.toLowerCase();
    if (sl.length >= 3 && tl.length >= 3 && cluesBlob.includes(sl) && cluesBlob.includes(tl)) {
      codexClueLeaks++;
      fail(`Codex QID ${raw.qid} leaked pair "${p.subject} -> ${p.target}" in clues`);
    }
  }
}

// ----------------------------------------------------------------------------
// 7. Sample 1,000 QuestionCardV4s across ALL 7 formats, 12 domains & 5 tiers
// ----------------------------------------------------------------------------
const TIERS = ['MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE', 'GRADUATE', 'MENSA'];
const SAMPLE_TOTAL = 1000;
const formatCounts = Object.fromEntries(ALL_QUESTION_FORMATS_V4.map((f) => [f, 0]));
const domainCounts = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i, 0]));
const tierCounts = Object.fromEntries(TIERS.map((t) => [t, 0]));

let slopLeaks = 0;
let yearCommaLeaks = 0;
let dupChoiceOrPairLeaks = 0;
let fameGateViolations = 0;
let mathAssertionsRun = 0;
let mathAssertionsPassed = 0;
let curatedFirstHits = 0;
let dynamicShardHits = 0;
let blitzChecksPassed = 0;
const samplesByFormat = {};

const seenCuratedRun = new Set();

for (let i = 0; i < SAMPLE_TOTAL; i++) {
  const format = ALL_QUESTION_FORMATS_V4[i % ALL_QUESTION_FORMATS_V4.length];
  const domainId = i % 12;
  const difficultyTier = TIERS[i % TIERS.length];
  const isLightningBlitz = format === 'MULTIPLE_CHOICE' && i % 14 === 0;
  // First 500 draws verify curated-first routing; second 500 draws exercise 500k+ dynamic shard synthesis!
  const preferDynamicShards = i >= 500;

  const card = await drawQuestionCardV4({
    format,
    domainId,
    difficultyTier,
    isLightningBlitz,
    preferDynamicShards,
    excludeQids: seenCuratedRun,
    seed: (0x13579bdf + i * 2654435761) >>> 0,
    engine,
  });

  if (i < 500 && (card.qid <= 4964 || (card.qid >= 50000 && card.qid < 60000) || card.qid >= 1060000 && card.qid < 1100000)) {
    curatedFirstHits++;
  }
  if (card.qid >= 60000 && card.qid < 1060000 || card.qid >= 2000000) {
    dynamicShardHits++;
  }
  seenCuratedRun.add(card.qid);

  formatCounts[card.format] = (formatCounts[card.format] ?? 0) + 1;
  domainCounts[card.domainId] = (domainCounts[card.domainId] ?? 0) + 1;
  tierCounts[difficultyTier] = (tierCounts[difficultyTier] ?? 0) + 1;
  if (!samplesByFormat[card.format]) {
    samplesByFormat[card.format] = {
      qid: card.qid,
      domainId: card.domainId,
      tier: card.difficultyTier,
      wittyHeader: card.wittyHeader,
      prompt: card.prompt.slice(0, 95),
      recommendedSec: card.recommendedSec,
    };
  }

  // A. Universal Card Contract Checks
  if (!card.wittyHeader || card.wittyHeader.trim().length < 2) {
    fail(`Card #${i} (QID ${card.qid}) missing wittyHeader`);
  }
  if (card.readInGraceSec !== 2.0) {
    fail(`Card #${i} (QID ${card.qid}) readInGraceSec !== 2.0 (${card.readInGraceSec})`);
  }
  if (card.format === 'MULTIPLE_CHOICE') {
    const words = card.prompt.trim().split(/\s+/).filter(Boolean).length;
    if (card.recommendedSec === 12) {
      if (!isLightningBlitz || words > 8) {
        fail(`Card #${i} (QID ${card.qid}) set 12s timer improperly (blitz=${isLightningBlitz}, words=${words})`);
      } else {
        blitzChecksPassed++;
      }
    } else if (card.recommendedSec !== 28) {
      fail(`Card #${i} (QID ${card.qid}) MC recommendedSec=${card.recommendedSec} (expected 28 or 12)`);
    }
  }

  // B. Anti-Slop, Anti-Robotic, Anti-Year-Comma & Anti-Letter-Hint Checks
  const promptTrim = card.prompt.trim().replace(/^["'“‘(\[]+/, '');
  const isLowerStart = /^[a-z](?!H\b|Phone|Pad|Pod|Mac|OS|Bay|RNA|DNA)/.test(promptTrim);
  const isBenchmarkQid = card.qid >= 4965 && card.qid <= 20165;
  const isApolloInMyth = card.domainId === 10 && RE_APOLLO_SPACE.test(card.prompt);
  if (
    isBenchmarkQid ||
    isLowerStart ||
    isApolloInMyth ||
    RE_SLOP_PROMPT.test(card.prompt) ||
    RE_ROBOTIC_WHY.test(card.funFactWhy)
  ) {
    slopLeaks++;
    fail(`Slop leak on Card #${i} (QID ${card.qid}): P="${card.prompt.slice(0, 70)}" W="${card.funFactWhy.slice(0, 70)}"`);
  }
  if (RE_DRY_LETTER_HINT.test(card.helpfulHint)) {
    fail(`Dry letter hint leaked on Card #${i} (QID ${card.qid}): "${card.helpfulHint}"`);
  }

  const textBundle = [card.prompt, card.funFactWhy, card.helpfulHint];
  if (card.choices) textBundle.push(...card.choices);
  if (card.match4) {
    for (const p of card.match4.pairs) textBundle.push(p.leftPrompt, p.rightAnswer);
  }
  if (card.sort4) {
    for (const s of card.sort4.correctOrder) textBundle.push(s.label, s.formattedValue);
  }
  if (card.multiStrike) {
    for (const o of card.multiStrike.options) textBundle.push(o.label);
  }
  if (card.escalator) {
    textBundle.push(...card.escalator.clues, ...card.escalator.choices);
  }
  if (card.visualSpotter) {
    textBundle.push(...card.visualSpotter.choices);
  }
  for (const t of textBundle) {
    if (RE_YEAR_COMMA.test(t)) {
      yearCommaLeaks++;
      checkNoYearCommas(t, `Card #${i} QID ${card.qid}`);
    }
  }

  // C. Fame Gate Check on MIDDLE_SCHOOL..COLLEGE dynamic shard cards
  if (
    preferDynamicShards &&
    (difficultyTier === 'MIDDLE_SCHOOL' || difficultyTier === 'HIGH_SCHOOL' || difficultyTier === 'COLLEGE')
  ) {
    if (/\b(?:exoplanet|PSR B|HD \d{4,}|NGC \d{3,}|MACS\d+|Kepler-\d+|K2-\d+)\b/i.test(card.prompt)) {
      fameGateViolations++;
      fail(`Fame gate violation on ${difficultyTier} Card #${i} (QID ${card.qid}): "${card.prompt}"`);
    }
    if (card.match4) {
      for (const p of card.match4.pairs) {
        if (isObscureCatalogEntityName(p.leftPrompt)) {
          fameGateViolations++;
          fail(`Fame gate catalog leak in MATCH_4 (${difficultyTier}): ${p.leftPrompt}`);
        }
      }
    }
  }

  // D. Format-Specific Structural Invariants (0 duplicate choices/pairs, distinct Sort-4 values, etc.)
  if (card.format === 'MULTIPLE_CHOICE') {
    const ch = card.choices ?? [];
    const uniq = new Set(ch.map((x) => x.trim().toLowerCase()));
    if (ch.length !== 4 || uniq.size !== 4 || card.correctIndex === undefined || card.correctIndex < 0 || card.correctIndex > 3) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid MC choices on QID ${card.qid}: ${JSON.stringify(ch)}`);
    }
  } else if (card.format === 'MATCH_4') {
    const m4 = card.match4;
    if (!m4 || m4.pairs.length !== 4 || m4.shuffledRight.length !== 4) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid MATCH_4 structure on QID ${card.qid}`);
    } else {
      const leftUniq = new Set(m4.pairs.map((p) => p.leftPrompt.trim().toLowerCase()));
      const rightUniq = new Set(m4.pairs.map((p) => p.rightAnswer.trim().toLowerCase()));
      const shufIds = m4.shuffledRight.map((r) => r.pairId);
      const origIds = m4.pairs.map((p) => p.pairId);
      const isIdentity = shufIds.every((id, idx) => id === origIds[idx]);
      if (leftUniq.size !== 4 || rightUniq.size !== 4 || new Set(shufIds).size !== 4 || isIdentity) {
        dupChoiceOrPairLeaks++;
        fail(`Invalid MATCH_4 uniqueness/shuffle on QID ${card.qid}`);
      }
    }
  } else if (card.format === 'SORT_4') {
    const s4 = card.sort4;
    if (!s4 || s4.correctOrder.length !== 4 || s4.initialOrder.length !== 4) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid SORT_4 structure on QID ${card.qid}`);
    } else {
      const nums = s4.correctOrder.map((x) => x.numericValue);
      const labels = new Set(s4.correctOrder.map((x) => x.label.trim().toLowerCase()));
      const strictlyAsc = nums[0] < nums[1] && nums[1] < nums[2] && nums[2] < nums[3];
      const isIdentity = s4.initialOrder.every((x, idx) => x.itemId === s4.correctOrder[idx].itemId);
      if (!strictlyAsc || labels.size !== 4 || isIdentity) {
        dupChoiceOrPairLeaks++;
        fail(`Invalid SORT_4 ordering/distinctness on QID ${card.qid}: nums=${JSON.stringify(nums)}`);
      }
    }
  } else if (card.format === 'MULTI_STRIKE') {
    const ms = card.multiStrike;
    if (!ms || ms.options.length < 4) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid MULTI_STRIKE on QID ${card.qid}`);
    } else {
      const uniq = new Set(ms.options.map((o) => o.label.trim().toLowerCase()));
      const targetActual = ms.options.filter((o) => o.isTarget).length;
      if (uniq.size !== ms.options.length || targetActual !== ms.targetCount) {
        dupChoiceOrPairLeaks++;
        fail(`Invalid MULTI_STRIKE targets/dups on QID ${card.qid}: actual=${targetActual}, targetCount=${ms.targetCount}`);
      }
    }
  } else if (card.format === 'PINPOINT_DIAL') {
    const pp = card.pinpoint;
    if (
      !pp ||
      !(pp.minVal < pp.exactVal && pp.exactVal < pp.maxVal) ||
      !(pp.bullseyeRadius > 0 && pp.bullseyeRadius < pp.winRadius)
    ) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid PINPOINT_DIAL bounds on QID ${card.qid}: ${JSON.stringify(pp)}`);
    }
  } else if (card.format === 'CLUE_ESCALATOR') {
    const esc = card.escalator;
    if (!esc || esc.clues.length !== 3 || esc.choices.length !== 4) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid CLUE_ESCALATOR on QID ${card.qid}`);
    } else {
      const uniq = new Set(esc.choices.map((c) => c.trim().toLowerCase()));
      if (uniq.size !== 4) {
        dupChoiceOrPairLeaks++;
        fail(`Duplicate CLUE_ESCALATOR choices on QID ${card.qid}`);
      }
    }
  } else if (card.format === 'VISUAL_SPOTTER') {
    const vs = card.visualSpotter;
    if (!vs || vs.choices.length !== 4) {
      dupChoiceOrPairLeaks++;
      fail(`Invalid VISUAL_SPOTTER on QID ${card.qid}`);
    } else {
      const uniq = new Set(vs.choices.map((c) => c.trim().toLowerCase()));
      if (uniq.size !== 4) {
        dupChoiceOrPairLeaks++;
        fail(`Duplicate VISUAL_SPOTTER choices on QID ${card.qid}`);
      }
    }
  }

  // E. 100% Exact Math Verification on evaluateSubmissionV4 (4 scenarios per card = 4,000 checks!)
  const tilePts = [100, 200, 400, 800][i % 4];
  const makeCorrectSub = (doubleDown) => {
    const base = { format: card.format, elapsedSec: 6.2, doubleDownArmed: doubleDown };
    if (card.format === 'MULTIPLE_CHOICE') return { ...base, chosenIndex: card.correctIndex };
    if (card.format === 'VISUAL_SPOTTER') return { ...base, chosenIndex: card.visualSpotter.correctIndex };
    if (card.format === 'CLUE_ESCALATOR') return { ...base, chosenIndex: card.escalator.correctIndex, escalatorCluesRevealed: ((i % 3) + 1) };
    if (card.format === 'MATCH_4') {
      const links = {};
      for (const p of card.match4.pairs) links[p.pairId] = p.pairId;
      return { ...base, match4Links: links };
    }
    if (card.format === 'SORT_4') {
      return { ...base, sort4Ids: card.sort4.correctOrder.map((x) => x.itemId) };
    }
    if (card.format === 'MULTI_STRIKE') {
      return { ...base, multiStrikeIds: card.multiStrike.options.filter((o) => o.isTarget).map((o) => o.optionId) };
    }
    return { ...base, pinpointValue: card.pinpoint.exactVal };
  };

  const makeWrongSub = (doubleDown) => {
    const base = { format: card.format, elapsedSec: 11.4, doubleDownArmed: doubleDown };
    if (card.format === 'MULTIPLE_CHOICE') return { ...base, chosenIndex: ((card.correctIndex ?? 0) + 1) % 4 };
    if (card.format === 'VISUAL_SPOTTER') return { ...base, chosenIndex: ((card.visualSpotter.correctIndex ?? 0) + 1) % 4 };
    if (card.format === 'CLUE_ESCALATOR') return { ...base, chosenIndex: ((card.escalator.correctIndex ?? 0) + 1) % 4, escalatorCluesRevealed: 3 };
    if (card.format === 'MATCH_4') {
      const p = card.match4.pairs;
      return { ...base, match4Links: { [p[0].pairId]: p[1].pairId, [p[1].pairId]: p[2].pairId, [p[2].pairId]: p[3].pairId, [p[3].pairId]: p[0].pairId } };
    }
    if (card.format === 'SORT_4') {
      return { ...base, sort4Ids: [...card.sort4.correctOrder.map((x) => x.itemId)].reverse() };
    }
    if (card.format === 'MULTI_STRIKE') {
      return { ...base, multiStrikeIds: card.multiStrike.options.filter((o) => !o.isTarget).slice(0, 1).map((o) => o.optionId) };
    }
    const farVal = Math.abs(card.pinpoint.minVal - card.pinpoint.exactVal) > card.pinpoint.winRadius
      ? card.pinpoint.minVal
      : card.pinpoint.maxVal;
    return { ...base, pinpointValue: farVal };
  };

  const scenarios = [
    { name: 'win', sub: makeCorrectSub(false), expectWin: true, expectDDPenalty: false },
    { name: 'win_dd', sub: makeCorrectSub(true), expectWin: true, expectDDPenalty: false },
    { name: 'wrong_dd', sub: makeWrongSub(true), expectWin: false, expectDDPenalty: true },
    { name: 'timeout', sub: { format: card.format, timedOut: true, elapsedSec: 30, doubleDownArmed: false }, expectWin: false, expectDDPenalty: false },
  ];

  for (const sc of scenarios) {
    mathAssertionsRun++;
    const ev = evaluateSubmissionV4(card, sc.sub, tilePts);
    const exactConservation = ev.netPointsDelta === ev.basePoints + ev.bonusPoints + ev.wagerDeltaPoints;
    const validRatio = Number.isFinite(ev.accuracyRatio) && ev.accuracyRatio >= 0 && ev.accuracyRatio <= 1;
    const winOk = sc.expectWin ? ev.isCorrect && ev.netPointsDelta >= tilePts : !ev.isCorrect;
    const penaltyOk = sc.expectDDPenalty ? ev.wagerDeltaPoints === -Math.round(tilePts * 0.5) && ev.netPointsDelta < 0 : true;
    const summaryClean = !RE_YEAR_COMMA.test(ev.correctSummaryLabel);

    if (exactConservation && validRatio && winOk && penaltyOk && summaryClean) {
      mathAssertionsPassed++;
    } else {
      fail(
        `Math eval mismatch on QID ${card.qid} (${card.format} / ${sc.name}): ${JSON.stringify(ev)}`,
      );
    }
  }
}

// Verify synchronous 0ms draw fallback works cleanly across all 7 formats
for (const fmt of ALL_QUESTION_FORMATS_V4) {
  const syncCard = drawQuestionCardV4Sync({ format: fmt, engine });
  if (syncCard.format !== fmt) {
    fail(`drawQuestionCardV4Sync failed to return format ${fmt} (got ${syncCard.format})`);
  }
}

// Clean up temp directory
fs.rmSync(tmpDir, { recursive: true, force: true });

// ----------------------------------------------------------------------------
// 8. Print Crisp Audit Report
// ----------------------------------------------------------------------------
const report = {
  corpusScale: {
    curatedV4WittyCards: curatedCards.length,
    cleanTier1Records: tier1Records.length,
    shardFactQuestions: counts.shardFactTotal,
    codexSynthesisQuestions: counts.codexSynthesisTotal,
    totalPlayableCount: counts.totalPlayableCount,
    entryContentEngineMinKb: contentEngineMinKb,
    under350KbEntryBudget: contentEngineMinKb < 350,
  },
  sampling1000Cards: {
    totalSampled: SAMPLE_TOTAL,
    uniqueQidsSampled: seenCuratedRun.size,
    curatedFirst500Hits: curatedFirstHits,
    dynamicShard500Hits: dynamicShardHits,
    lightningBlitz12sVerified: blitzChecksPassed,
    byFormat: formatCounts,
    byDomain: domainCounts,
    byTier: tierCounts,
  },
  qualityGates: {
    mmluBoolqArcLeaks: slopLeaks + leakedSlopTier1.length,
    yearCommaLeaks,
    duplicateChoicesOrPairs: dupChoiceOrPairLeaks,
    fameGateViolations,
    globePinDropsAudited: globeAudited,
    globeOppositeContinentLeaks,
    globeIsolatedIslandExceptions: globeIsolatedIslandNotes,
    codexSynthesisAudited: codexAudited,
    codexVerbatimClueLeaks: codexClueLeaks,
    evaluateSubmissionMathPassed: `${mathAssertionsPassed}/${mathAssertionsRun}`,
  },
  samplesByFormat,
  warningsCount: warnings.length,
  errorsCount: errors.length,
};

console.log(JSON.stringify(report, null, 2));

if (errors.length > 0) {
  console.error(`\n=== AUDIT FAILURES (showing up to 50 of ${errors.length}) ===`);
  for (const e of errors.slice(0, 50)) {
    console.error(' -', e);
  }
  process.exit(1);
}

console.log('\nALL V4 CORPUS QUALITY & 7-FORMAT AUDIT GATES PASSED (0 ERRORS)!');
