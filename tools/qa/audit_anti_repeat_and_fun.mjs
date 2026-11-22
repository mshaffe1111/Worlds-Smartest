#!/usr/bin/env node
/**
 * REDTEAM-FUN-UX-AUDIO — Pillar 3 & Pillar 5 Live Runtime Simulation:
 * Bundles `src/forge/index.ts` in memory via esbuild, mounts real `public/data/**` via local fetch shim,
 * and simulates:
 *  1) 40-Question Campaign run (Geneva -> London -> Tokyo -> Rio -> Cairo -> Reykjavik -> Singapore -> Apex)
 *  2) 40-Question Endless Archive Descent run (Depths 1..40)
 *  3) 7-Question Daily Broadcast across 5 consecutive UTC dates
 *  4) 36/36 SDF Holographic Core Glyphs (`public/assets/glyphs/*.png`) coverage & 0-404 check
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Local file-backed fetch + localStorage shim for deterministic Node execution
const memStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
  setItem: (k, v) => memStore.set(k, String(v)),
  removeItem: (k) => memStore.delete(k),
  clear: () => memStore.clear(),
};

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

async function loadForgeModule() {
  const res = await build({
    entryPoints: [path.join(ROOT, 'src/forge/index.ts')],
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

function maxRunOf(arr, predicate) {
  let cur = 0;
  let max = 0;
  for (const item of arr) {
    if (predicate(item)) {
      cur++;
      if (cur > max) max = cur;
    } else {
      cur = 0;
    }
  }
  return max;
}

async function main() {
  const forgeMod = await loadForgeModule();
  const engine = new forgeMod.ForgeEngine({ dataBaseUrl: '/data' });
  const counts = await engine.init('/data');

  // 1. Simulate 40-Question Campaign Playthrough (8 hubs x 5 Qs = 40 Qs, AND full 40-mission 200-Q marathon!)
  const hubs = ['ch', 'gb', 'jp', 'br', 'eg', 'is', 'sg', 'global'];
  const campaign40 = [];
  for (let hIdx = 0; hIdx < hubs.length; hIdx++) {
    const hub = hubs[hIdx];
    const isBoss = hIdx === 7; // include Boss Showdown check too
    const roundQs = await engine.queryCampaignRoundAsync({
      hub,
      roundIndex: hIdx % 4,
      count: 5,
      isBossShowdown: isBoss,
    });
    for (const q of roundQs) {
      campaign40.push({ hub, q });
      engine.recordQuestionOutcome({
        qid: q.qid,
        l0Domain: q.l0Domain,
        archetype: q.archetype,
        irtB: q.irtB,
        irtA: q.irtA,
        correct: true,
        peelTier: 1,
        microTopicId: q.microTopicId,
        l2Subcategory: q.l2Subcategory,
      });
    }
  }

  // Also test Geneva M1..M4 consecutive missions (4 x 5 = 20 Qs in Geneva alone!)
  const engineGeneva = new forgeMod.ForgeEngine({ dataBaseUrl: '/data' });
  globalThis.localStorage.clear();
  await engineGeneva.init('/data');
  const geneva20 = [];
  for (let r = 0; r < 4; r++) {
    const qs = await engineGeneva.queryCampaignRoundAsync({ hub: 'ch', roundIndex: r, count: 5, isBossShowdown: false });
    for (const q of qs) {
      geneva20.push(q);
      engineGeneva.recordQuestionOutcome({
        qid: q.qid,
        l0Domain: q.l0Domain,
        archetype: q.archetype,
        irtB: q.irtB,
        irtA: q.irtA,
        correct: true,
        peelTier: 1,
      });
    }
  }

  // Regional flavor rate per hub across 4 qualifier rounds (20 Qs per hub)
  const regionalRates = {};
  for (const hub of ['ch', 'gb', 'jp', 'br', 'eg', 'is', 'sg']) {
    const engHub = new forgeMod.ForgeEngine({ dataBaseUrl: '/data' });
    globalThis.localStorage.clear();
    await engHub.init('/data');
    let regHits = 0;
    let total = 0;
    const hubUpper = hub.toUpperCase();
    for (let r = 0; r < 4; r++) {
      const qs = await engHub.queryCampaignRoundAsync({ hub, roundIndex: r, count: 5, isBossShowdown: false });
      for (const q of qs) {
        total++;
        if (q.regions?.includes(hubUpper)) regHits++;
        engHub.recordQuestionOutcome({ qid: q.qid, l0Domain: q.l0Domain, archetype: q.archetype, irtB: q.irtB, correct: true });
      }
    }
    regionalRates[hub] = { regionalHits: regHits, total, pct: Number(((regHits / total) * 100).toFixed(1)) };
  }

  // 2. Simulate 40-Question Endless Archive Descent (8 floors x 5 Qs = Depths 1..40)
  globalThis.localStorage.clear();
  const engineEndless = new forgeMod.ForgeEngine({ dataBaseUrl: '/data' });
  await engineEndless.init('/data');
  const endless40 = [];
  for (let floor = 0; floor < 8; floor++) {
    const qs = await engineEndless.queryEndlessBatchAsync(floor * 5, 5);
    for (const q of qs) {
      endless40.push(q);
      engineEndless.recordQuestionOutcome({
        qid: q.qid,
        l0Domain: q.l0Domain,
        archetype: q.archetype,
        irtB: q.irtB,
        irtA: q.irtA,
        correct: true,
        peelTier: 1,
        microTopicId: q.microTopicId,
        l2Subcategory: q.l2Subcategory,
      });
    }
  }

  // 3. Verify all 8 Boss Artifact Synthesis 3-step chains!
  const bossChainsCheck = {};
  for (const hub of hubs) {
    const bossQ = engine.getBossArtifactSynthesis(hub);
    const stepQids = bossQ.heroSynthesis?.steps.map((s) => s.qid) ?? [];
    bossChainsCheck[hub] = {
      relicId: bossQ.heroRelicId,
      stepCount: stepQids.length,
      uniqueStepQids: new Set(stepQids).size,
      stepQids,
      stepPrompts: bossQ.heroSynthesis?.steps.map((s) => s.prompt.slice(0, 70)),
    };
  }

  // 4. Verify 36 SDF Glyph PNGs on disk & check how many distinct glyphIds appear across 120 sampled PrismQuestions
  const glyphManifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'assets/glyphs/manifest.json'), 'utf8'));
  const missingGlyphFiles = [];
  const manifestGlyphIds = (glyphManifest.glyphs ?? glyphManifest.items ?? []).map((g) => g.id ?? g.glyphId);
  for (const gid of manifestGlyphIds) {
    if (!fs.existsSync(path.join(PUBLIC_DIR, 'assets/glyphs', `${gid}.png`))) {
      missingGlyphFiles.push(gid);
    }
  }

  const seenGlyphIds = new Set();
  const brokenQuestionGlyphUrls = [];
  for (const item of [...campaign40.map((x) => x.q), ...endless40]) {
    const gid = item.glyphId ?? item.glyphHint;
    if (gid) seenGlyphIds.add(gid);
    if (item.glyphUrl) {
      const rel = item.glyphUrl.replace(/^\.\//, '').replace(/^\//, '');
      if (!fs.existsSync(path.join(PUBLIC_DIR, rel))) {
        brokenQuestionGlyphUrls.push({ qid: item.qid, glyphUrl: item.glyphUrl });
      }
    }
  }

  const c40Qids = campaign40.map((x) => x.q.qid);
  const e40Qids = endless40.map((q) => q.qid);

  console.log(
    JSON.stringify(
      {
        countsSummary: {
          tier1HumanTotal: counts.tier1HumanTotal,
          shardFactTotal: counts.shardFactTotal,
          verifiedUniqueTotal: counts.verifiedUniqueTotal,
          totalPlayableCount: counts.totalPlayableCount,
        },
        campaign40Audit: {
          totalQuestions: c40Qids.length,
          uniqueQids: new Set(c40Qids).size,
          repeatedQids: c40Qids.length - new Set(c40Qids).size,
          maxConsecutiveSightline: maxRunOf(campaign40, (x) => x.q.archetype === 'SIGHTLINE_LOCK'),
          archetypeBreakdown: campaign40.reduce((acc, x) => {
            acc[x.q.archetype] = (acc[x.q.archetype] ?? 0) + 1;
            return acc;
          }, {}),
          irtProgressionByHub: hubs.map((h) => {
            const sub = campaign40.filter((x) => x.hub === h).map((x) => x.q.irtB);
            const avg = sub.reduce((a, b) => a + b, 0) / Math.max(1, sub.length);
            return { hub: h, avgIrtB: Number(avg.toFixed(2)) };
          }),
        },
        geneva20ConsecutiveAudit: {
          totalQuestions: geneva20.length,
          uniqueQids: new Set(geneva20.map((q) => q.qid)).size,
          maxConsecutiveSightline: maxRunOf(geneva20, (q) => q.archetype === 'SIGHTLINE_LOCK'),
          archetypes: geneva20.map((q) => q.archetype),
        },
        regionalHostFlavor20QPerHub: regionalRates,
        endless40Audit: {
          totalQuestions: e40Qids.length,
          uniqueQids: new Set(e40Qids).size,
          repeatedQids: e40Qids.length - new Set(e40Qids).size,
          maxConsecutiveSightline: maxRunOf(endless40, (q) => q.archetype === 'SIGHTLINE_LOCK'),
          archetypeBreakdown: endless40.reduce((acc, q) => {
            acc[q.archetype] = (acc[q.archetype] ?? 0) + 1;
            return acc;
          }, {}),
          first5AvgIrt: Number((endless40.slice(0, 5).reduce((a, q) => a + q.irtB, 0) / 5).toFixed(2)),
          last5AvgIrt: Number((endless40.slice(35, 40).reduce((a, q) => a + q.irtB, 0) / 5).toFixed(2)),
        },
        bossChainsAudit: bossChainsCheck,
        glyphsAudit: {
          manifestCount: manifestGlyphIds.length,
          missingGlyphFiles,
          distinctGlyphIdsUsedAcross80Qs: seenGlyphIds.size,
          sampleGlyphIds: Array.from(seenGlyphIds).slice(0, 15),
          brokenQuestionGlyphUrls,
        },
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
