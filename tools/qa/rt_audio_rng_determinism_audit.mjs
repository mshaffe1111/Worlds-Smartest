#!/usr/bin/env node
/**
 * RT-E2E-SYSTEMS-AUDITOR — Sound, Anti-Repetition & CSPRNG vs 10-Prism UTC Daily Determinism Audit
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_DIR = path.join(ROOT, 'src');

// Local file-backed fetch + localStorage shim
const memStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
  setItem: (k, v) => memStore.set(k, String(v)),
  removeItem: (k) => memStore.delete(k),
  clear: () => memStore.clear(),
};
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    localStorage: globalThis.localStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

globalThis.fetch = async (urlStr) => {
  const clean = String(urlStr).replace(/^\.\//, '').replace(/^\//, '');
  const fullPath = path.join(PUBLIC_DIR, clean);
  if (!fs.existsSync(fullPath)) {
    return {
      ok: false,
      status: 404,
      headers: { get: () => 'text/plain' },
      json: async () => { throw new Error(`404: ${clean}`); },
    };
  }
  const buf = fs.readFileSync(fullPath);
  if (fullPath.endsWith('.gz')) {
    const unzipped = zlib.gunzipSync(buf);
    return {
      ok: true,
      status: 200,
      body: true,
      headers: { get: () => 'application/json' },
      arrayBuffer: async () => unzipped.buffer.slice(unzipped.byteOffset, unzipped.byteOffset + unzipped.byteLength),
      json: async () => JSON.parse(unzipped.toString('utf8')),
    };
  }
  return {
    ok: true,
    status: 200,
    body: true,
    headers: { get: () => 'application/json' },
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    json: async () => JSON.parse(buf.toString('utf8')),
  };
};

async function bundleImport(entryRel) {
  const res = await build({
    entryPoints: [path.join(ROOT, entryRel)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
  });
  const code = res.outputFiles[0].text;
  const dataUrl = `data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`;
  return import(dataUrl);
}

function scanSourceForPattern(dir, regex) {
  const hits = [];
  function walk(cur) {
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
          if (regex.test(line)) {
            hits.push({ file: path.relative(ROOT, full).replace(/\\/g, '/'), line: idx + 1, snippet: trimmed.slice(0, 140) });
          }
        });
      }
    }
  }
  walk(dir);
  return hits;
}

async function main() {
  const report = {
    soundAndMidi: {},
    ambienceDefault: {},
    antiRepetitionAndBarks: {},
    csprngVsDailyDeterminism: {},
    passed: true,
    failures: [],
  };

  // 1. Run Python Sound & MIDI audit
  const pyOut = execFileSync('python', [path.join(__dirname, 'audit_sound_and_midi.py')], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  const pyJson = JSON.parse(pyOut);
  const midiCount = pyJson.midiAndSynthScan.midiFiles.length + pyJson.midiAndSynthScan.synthCodeHits.length;
  report.soundAndMidi = {
    midiFiles: pyJson.midiAndSynthScan.midiFiles.length,
    synthCodeHits: pyJson.midiAndSynthScan.synthCodeHits.length,
    voCount: pyJson.audioAudit.voCount,
    voIssues: pyJson.audioAudit.voIssues.length,
    sfxIssues: pyJson.audioAudit.sfxIssues.length,
    missingVoiceRefs: pyJson.audioAudit.missingVoiceRefs.length,
    ambienceBeds: pyJson.audioAudit.ambienceBeds.length,
  };
  if (midiCount !== 0) report.failures.push(`MIDI/synth hits found: ${midiCount}`);
  if (pyJson.audioAudit.voIssues.length !== 0) report.failures.push(`VO issues: ${pyJson.audioAudit.voIssues.length}`);
  if (pyJson.audioAudit.sfxIssues.length !== 0) report.failures.push(`SFX issues: ${pyJson.audioAudit.sfxIssues.length}`);
  if (pyJson.audioAudit.missingVoiceRefs.length !== 0) report.failures.push(`Missing VO refs: ${pyJson.audioAudit.missingVoiceRefs.length}`);

  // 2. AMBIENCE: OFF default check
  memStore.clear();
  const audioMod = await bundleImport('src/audio/StudioAudioEngine.ts');
  const engine = new audioMod.StudioAudioEngine();
  const musicOn = typeof engine.isMusicEnabled === 'function' ? engine.isMusicEnabled() : null;
  const sfxOn = typeof engine.isSfxEnabled === 'function' ? engine.isSfxEnabled() : null;
  const voiceOn = typeof engine.isVoiceEnabled === 'function' ? engine.isVoiceEnabled() : null;
  report.ambienceDefault = { musicEnabledDefault: musicOn, sfxEnabledDefault: sfxOn, voiceEnabledDefault: voiceOn };
  if (musicOn !== false) report.failures.push(`Expected AMBIENCE/music default OFF (false), got ${musicOn}`);

  // 3. Anti-repetition & Zero "Costly misstep" repeated barks
  const costlyHits = scanSourceForPattern(SRC_DIR, /costly misstep/i);
  const routineBarkVoiceCalls = scanSourceForPattern(
    path.join(SRC_DIR, 'ui'),
    /playVoice\([^)]*(on_player_miss|on_player_streak|costly)/i
  );
  const narrativeMod = await bundleImport('src/narrative/index.ts');
  const bank = new narrativeMod.ReactionVarietyBank();
  const totalLines = typeof bank.getTotalUniqueLineCount === 'function' ? bank.getTotalUniqueLineCount() : null;

  // Stress test 150 guaranteed non-repeating draws across all actors & kinds
  const actors = ['vance', 'nadia', 'soren', 'teo', 'lindqvist', 'tariq'];
  const kinds = ['MISS', 'STREAK_3', 'STREAK_5', 'STREAK_10', 'OVERCLOCK_WIN', 'BACKFIRE', 'CALIBRATOR_BULLSEYE', 'PEEL_USED', 'CLOSE_CALL'];
  const drawn150 = [];
  for (let i = 0; i < 150; i++) {
    const res = bank.pickGuaranteedLine(actors[i % actors.length], kinds[i % kinds.length], i % 12);
    drawn150.push(res.text);
  }
  const uniqueIn150 = new Set(drawn150).size;

  // Stress test routine silence rate (~60% null on MISS / PEEL_USED)
  let silentCount = 0;
  let voicedRoutineCount = 0;
  const N_SILENCE = 400;
  for (let i = 0; i < N_SILENCE; i++) {
    const r = bank.pickReaction({ actorId: actors[i % actors.length], kind: i % 2 === 0 ? 'MISS' : 'PEEL_USED', domainId: i % 12 });
    if (r === null) silentCount++;
    else if (r.voiceUrl) voicedRoutineCount++;
  }
  const silencePct = Number(((silentCount / N_SILENCE) * 100).toFixed(1));

  // Verify once-per-session VO bark guard
  narrativeMod.resetSessionPlayedBarks();
  const firstClaim = narrativeMod.claimGameplayBarkVoiceUrl('./assets/voice/vance_miss_01.mp3');
  const secondClaim = narrativeMod.claimGameplayBarkVoiceUrl('./assets/voice/vance_miss_01.mp3');
  const barkOnceWorks = firstClaim === './assets/voice/vance_miss_01.mp3' && secondClaim === undefined;

  report.antiRepetitionAndBarks = {
    costlyMisstepCodeHits: costlyHits,
    routineBarkVoiceCalls,
    reactionBankTotalLines: totalLines,
    uniqueWithin150Draws: uniqueIn150,
    routineSilencePct: silencePct,
    voicedRoutineCount,
    barkOncePerSessionGuardWorks: barkOnceWorks,
  };
  if (costlyHits.length !== 0) report.failures.push(`Found "Costly misstep" in src/: ${JSON.stringify(costlyHits)}`);
  if (routineBarkVoiceCalls.length !== 0) report.failures.push(`Routine miss/streak playVoice calls: ${routineBarkVoiceCalls.length}`);
  if (uniqueIn150 < 150) report.failures.push(`ReactionVarietyBank repeated within 150 draws (${uniqueIn150}/150 unique)`);
  if (voicedRoutineCount !== 0) report.failures.push(`Routine reaction returned voiceUrl (${voicedRoutineCount})`);
  if (!barkOnceWorks) report.failures.push('claimGameplayBarkVoiceUrl failed once-per-session guarantee');
  if (silencePct < 45 || silencePct > 75) report.failures.push(`Unexpected routine silence rate: ${silencePct}%`);

  // 4. CSPRNG non-Daily vs 10-Prism UTC Daily determinism
  const forgeMod = await bundleImport('src/forge/index.ts');

  async function makeFreshForge() {
    memStore.clear();
    const fe = new forgeMod.ForgeEngine({ dataBaseUrl: '/data' });
    await fe.init('/data');
    return fe;
  }

  const feA = await makeFreshForge();
  const feB = await makeFreshForge();
  const feC = await makeFreshForge();

  // Non-daily CSPRNG check (Campaign + Endless + Baseball Briefing)
  const campA = (await feA.queryCampaignRoundAsync({ hub: 'ch', roundIndex: 0, count: 5 })).map((q) => q.qid);
  const campB = (await feB.queryCampaignRoundAsync({ hub: 'ch', roundIndex: 0, count: 5 })).map((q) => q.qid);
  const campC = (await feC.queryCampaignRoundAsync({ hub: 'ch', roundIndex: 0, count: 5 })).map((q) => q.qid);
  const campaignNonDeterministic =
    JSON.stringify(campA) !== JSON.stringify(campB) || JSON.stringify(campB) !== JSON.stringify(campC);

  const endA = (await feA.queryEndlessBatchAsync(0, 5)).map((q) => q.qid);
  const endB = (await feB.queryEndlessBatchAsync(0, 5)).map((q) => q.qid);
  const endlessNonDeterministic = JSON.stringify(endA) !== JSON.stringify(endB);

  const baseA = (await feA.queryQuestionsAsync({ l2TopicId: 'baseball', count: 5 })).map((q) => q.qid);
  const baseB = (await feB.queryQuestionsAsync({ l2TopicId: 'baseball', count: 5 })).map((q) => q.qid);
  const baseballNonDeterministic = JSON.stringify(baseA) !== JSON.stringify(baseB);

  // 10-Prism UTC Daily determinism check (independent fresh engines!)
  const dFe1 = await makeFreshForge();
  const dFe2 = await makeFreshForge();
  const daily1 = dFe1.getDailyBroadcast('2026-11-22', 10);
  const daily2 = dFe2.getDailyBroadcast('2026-11-22', 10);
  const dailyNextDay = dFe2.getDailyBroadcast('2026-11-23', 10);

  const d1Qids = daily1.questions.map((q) => q.qid);
  const d2Qids = daily2.questions.map((q) => q.qid);
  const dNextQids = dailyNextDay.questions.map((q) => q.qid);
  const d1Facets = daily1.questions.map((q) => (q.facets || []).map((f) => f.text));
  const d2Facets = daily2.questions.map((q) => (q.facets || []).map((f) => f.text));

  const dailyExactQidMatch = JSON.stringify(d1Qids) === JSON.stringify(d2Qids);
  const dailyExactFacetMatch = JSON.stringify(d1Facets) === JSON.stringify(d2Facets);
  const dailyDiffersNextUtc = JSON.stringify(d1Qids) !== JSON.stringify(dNextQids);
  const dailyCountIs10 = d1Qids.length === 10 && new Set(d1Qids).size === 10;
  const dailyTiebreakerOk =
    daily1.tiebreakerIndex === 9 && daily1.questions[9]?.archetype === 'CALIBRATOR_DIAL';

  report.csprngVsDailyDeterminism = {
    campaignRunA: campA,
    campaignRunB: campB,
    campaignNonDeterministic,
    endlessRunA: endA,
    endlessRunB: endB,
    endlessNonDeterministic,
    baseballRunA: baseA,
    baseballRunB: baseB,
    baseballNonDeterministic,
    dailyDate: '2026-11-22',
    dailyCount: d1Qids.length,
    dailyUniqueCount: new Set(d1Qids).size,
    dailyExactQidMatch,
    dailyExactFacetMatch,
    dailyDiffersNextUtc,
    dailyTiebreakerIndex: daily1.tiebreakerIndex,
    dailyQ10Archetype: daily1.questions[9]?.archetype,
    dailyQids: d1Qids,
  };

  if (!campaignNonDeterministic) report.failures.push('Campaign draw was deterministic instead of CSPRNG!');
  if (!endlessNonDeterministic) report.failures.push('Endless draw was deterministic instead of CSPRNG!');
  if (!baseballNonDeterministic) report.failures.push('Baseball briefing draw was deterministic instead of CSPRNG!');
  if (!dailyCountIs10) report.failures.push(`Expected 10 unique Daily Prisms, got ${d1Qids.length}`);
  if (!dailyExactQidMatch) report.failures.push('10-Prism UTC Daily QIDs did not match across independent clients!');
  if (!dailyExactFacetMatch) report.failures.push('10-Prism UTC Daily facet orders did not match across independent clients!');
  if (!dailyDiffersNextUtc) report.failures.push('Consecutive UTC Daily dates returned identical QIDs!');
  if (!dailyTiebreakerOk) report.failures.push(`Expected Q10 CALIBRATOR_DIAL tiebreakerIndex=9, got idx=${daily1.tiebreakerIndex}, arch=${daily1.questions[9]?.archetype}`);

  report.passed = report.failures.length === 0;
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
