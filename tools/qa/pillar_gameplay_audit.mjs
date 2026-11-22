#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST — PILLAR-GAMEPLAY-LEAD Empirical Simulation & Live Browser Audit
//
// Part A (`--part=sim`):
//   Compiles real TypeScript modules directly from `src/**` via `esbuild` into an
//   isolated ESM bundle in `os.tmpdir()`, loads real `public/data/**` corpus & shards,
//   and executes deterministic + Monte Carlo gameplay simulations across:
//     - SIM-01: CryptoRandomRng.shuffleInPlace entropy/permutation proof
//     - SIM-02: Geneva Prologue Q1-Q3 Tier-3 Peel shatteredFacetIndices collision + Q2 Leak contract
//     - SIM-03: All 5 3D Morphs integrity, 0% untouched auto-win (Calibrator + Codex), comma-free years,
//               free-peel exploit & HUD multiplier mismatch, Gauntlet Trick 2.0x vs 2.5x,
//               Hero Artifact Synthesis 3-step Latch_0..2 chain across all 8 hubs
//     - SIM-04: Core Prism Combat math: Overclock 240..1050ms 6.0x curve, Bluff Echo slide-cancel,
//               3D hold deadzone (0.04..0.08), Ironclad Permanent Score Banking, Rival AI tell honesty
//               + CALL BLUFF +1,500 PTS + CareerAnalytics double-count & false-positive bug
//     - SIM-05: All 5 Game Modes + Meta Loops:
//               * Campaign (96 missions, Shields, Phase III Sudden-Death Backfire, New Circuit+ IRT, 5-Slot Saves)
//               * Daily Global Feed (10 UTC-deterministic Prisms, Share Card, Percentile curve balance, replay farming)
//               * Briefing Room (Sports & Games -> Sports -> Baseball = 34,283 Qs, 5/10/20/50 lengths, CSPRNG unseen)
//               * Endless Archive Descent (40 Lore Logs, 3 Shields, Airlock extract/descend, maxStreak resume loss)
//               * World Council Ghost Trials & Black Salon (WSG1 encode/decode + 120-char truncation bug,
//                 Black Salon pre-completion round advance bug, BLACK_SALON -> CAMPAIGN analytics bucket bug)
//               * Career Stats + 64 Trophies + 32 Equippable Unlockables reachability & accuracy
//
// Part B (`--part=browser`):
//   Builds fresh `src/**` into an isolated temp directory (never clobbering `dist/`
//   and never touching `:8088`), serves it on `127.0.0.1:0`, and drives real Headless
//   Edge/Chromium (CDP + WebGL2) across Mobile Portrait (`390x844`) & Desktop (`1280x800`)
//   to empirically verify every live user flow and reproduce gameplay bugs in the real DOM!
// ============================================================================

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { startDistServer, launchCdpBrowser, sleep } from './rt_e2e_cdp.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_DATA_DIR = path.join(ROOT, 'public', 'data');

function parseArgs() {
  const opts = {
    part: 'all', // 'all' | 'sim' | 'browser'
    useDist: false,
    softwareGl: false,
    jsonOut: null,
  };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--part=')) opts.part = a.slice('--part='.length);
    else if (a === '--use-dist') opts.useDist = true;
    else if (a === '--software-gl') opts.softwareGl = true;
    else if (a.startsWith('--json=')) opts.jsonOut = a.slice('--json='.length);
  }
  return opts;
}

// ============================================================================
// NODE BROWSER POLYFILLS FOR REAL TS ENGINE EXECUTION (PART A)
// ============================================================================

function installNodeRuntimeShims() {
  const store = new Map();
  globalThis.localStorage = {
    get length() {
      return store.size;
    },
    key(i) {
      return Array.from(store.keys())[i] ?? null;
    },
    getItem(k) {
      return store.has(String(k)) ? store.get(String(k)) : null;
    },
    setItem(k, v) {
      store.set(String(k), String(v));
    },
    removeItem(k) {
      store.delete(String(k));
    },
    clear() {
      store.clear();
    },
  };

  if (typeof globalThis.window === 'undefined') {
    globalThis.window = {
      localStorage: globalThis.localStorage,
      innerWidth: 390,
      innerHeight: 844,
      location: { href: 'http://127.0.0.1/' },
      addEventListener() {},
      removeEventListener() {},
      matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    };
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
      documentElement: {
        dataset: {},
        style: { setProperty() {}, removeProperty() {} },
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      },
      head: { appendChild() {} },
      body: { appendChild() {}, classList: { add() {}, remove() {} } },
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, setAttribute() {}, appendChild() {}, remove() {} }),
    };
  }

  // Local filesystem fetch shim for `./data/...` & `data/...`
  globalThis.fetch = async (urlLike) => {
    const raw = String(urlLike || '');
    const clean = raw.replace(/^\.?\//, '').split('?')[0];
    const candidates = [
      path.join(ROOT, 'public', clean),
      path.join(ROOT, clean),
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const buf = fs.readFileSync(filePath);
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          url: raw,
          text: async () => buf.toString('utf8'),
          json: async () => JSON.parse(buf.toString('utf8')),
          arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
        };
      }
    }
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      url: raw,
      text: async () => '',
      json: async () => {
        throw new Error(`404: ${raw}`);
      },
    };
  };

  return { clearStorage: () => store.clear() };
}

async function buildSimulationBundle() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-gameplay-sim-'));
  const entryPath = path.join(tmpDir, 'sim_entry.ts');
  const outPath = path.join(tmpDir, 'sim_bundle.mjs');

  const p = (rel) => JSON.stringify(path.join(ROOT, rel).replace(/\\/g, '/'));
  const entrySrc = `
    export * as ShardDecoder from ${p('src/forge/ShardDecoder.ts')};
    export * as ForgeEngineMod from ${p('src/forge/ForgeEngine.ts')};
    export * as ScoringMod from ${p('src/modes/ScoringEngine.ts')};
    export * as DailyMod from ${p('src/modes/DailyGlobalFeed.ts')};
    export * as BriefingMod from ${p('src/modes/BriefingCategoriesMode.ts')};
    export * as EndlessMod from ${p('src/modes/ArchiveDescentEndless.ts')};
    export * as TrialsMod from ${p('src/modes/CouncilTrialsGhostMode.ts')};
    export * as CampaignMod from ${p('src/narrative/CampaignCircuitDirector.ts')};
    export * as PrologueMod from ${p('src/narrative/PrologueDirector.ts')};
    export * as RivalMod from ${p('src/narrative/RivalAI.ts')};
    export * as SaveSlotMod from ${p('src/narrative/CampaignSaveSlotManager.ts')};
    export * as PassportMod from ${p('src/narrative/PassportSystem.ts')};
    export * as InkMod from ${p('src/narrative/InkBlackboard.ts')};
    export * as DossierMod from ${p('src/narrative/EvidenceDossier.ts')};
    export * as AnalyticsMod from ${p('src/meta/CareerAnalyticsStore.ts')};
    export * as HonoursMod from ${p('src/meta/HallOfHonoursSystem.ts')};
    export * as AtelierMod from ${p('src/meta/PrismAtelierView.ts')};
    export * as Wave2Mod from ${p('src/narrative/Wave2NarrativeDirector.ts')};
    export * as OverclockMod from ${p('src/ergonomics/OverclockGestureController.ts')};
    export * as TaxonomyAdapterMod from ${p('src/ui/BriefingTaxonomyAdapter.ts')};
  `;
  fs.writeFileSync(entryPath, entrySrc, 'utf8');

  await esbuild.build({
    entryPoints: [entryPath],
    outfile: outPath,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    logLevel: 'silent',
    plugins: [
      {
        name: 'stub-3d',
        setup(build) {
          build.onResolve({ filter: /^(three|troika-three-text)(\/.*)?$/ }, (args) => ({
            path: args.path,
            namespace: 'stub-3d',
          }));
          build.onLoad({ filter: /.*/, namespace: 'stub-3d' }, () => ({
            contents: 'export default {}; export const MathUtils = { clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)) };',
            loader: 'js',
          }));
        },
      },
    ],
  });

  const mod = await import(pathToFileURL(outPath).href);
  return {
    mod,
    cleanup: () => {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    },
  };
}

// ============================================================================
// PART A: DIRECT ENGINE & MONTE CARLO SIMULATIONS
// ============================================================================

async function runSimulationSuite() {
  const { clearStorage } = installNodeRuntimeShims();
  const { mod, cleanup } = await buildSimulationBundle();
  const findings = [];
  const checks = {};

  const recordFinding = (id, severity, owner, fileLine, summary, evidence) => {
    findings.push({ id, severity, owner, fileLine, summary, evidence });
  };

  try {
    const {
      ShardDecoder,
      ForgeEngineMod,
      ScoringMod,
      DailyMod,
      BriefingMod,
      EndlessMod,
      TrialsMod,
      CampaignMod,
      PrologueMod,
      RivalMod,
      SaveSlotMod,
      PassportMod,
      InkMod,
      DossierMod,
      AnalyticsMod,
      HonoursMod,
      AtelierMod,
      Wave2Mod,
      OverclockMod,
      TaxonomyAdapterMod,
    } = mod;

    // ------------------------------------------------------------------------
    // SIM-01: CryptoRandomRng.shuffleInPlace Entropy / No-Op Proof
    // ------------------------------------------------------------------------
    {
      const baseline = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      let mutatedRuns = 0;
      const TRIALS = 200;
      for (let t = 0; t < TRIALS; t++) {
        const arr = baseline.slice();
        ShardDecoder.sharedCryptoRng.shuffleInPlace(arr);
        if (arr.some((v, idx) => v !== baseline[idx])) mutatedRuns++;
      }
      checks.sim01_cryptoShuffle = { trials: TRIALS, mutatedRuns };
      if (mutatedRuns < 190) {
        recordFinding(
          'GAMEPLAY-P0-01',
          'P0',
          '@forge-number-hygiene',
          'src/forge/ShardDecoder.ts:725-733',
          'CryptoRandomRng.shuffleInPlace() is a 100% no-op (`arr[i] = arr[j]; arr[i] = tmp;` instead of `arr[j] = tmp;`)',
          { trials: TRIALS, mutatedRuns, expectedMutatedRuns: '>= 199/200' },
        );
      }
    }

    // ------------------------------------------------------------------------
    // SIM-02: Geneva Prologue Q1-Q3 Tier-3 Peel Shatters Correct Answer + Q2 Leak Contract
    // ------------------------------------------------------------------------
    {
      clearStorage();
      const pPass = new PassportMod.PassportSystem();
      const pInk = new InkMod.InkBlackboard();
      const prologue = new PrologueMod.PrologueDirector(pPass, pInk);
      prologue.advanceFromCutscene();
      prologue.advanceFromCutscene();
      prologue.submitIdentityAndOrigin('AuditAce', 'ACADEMIC');

      const q1Snap = prologue.getSnapshot();
      const q1Card = q1Snap.activeQuestion;
      prologue.recordQuestionCompleted({ questionIndex: 1, correct: true, spinUsed: true, peelTierUsed: 1, overclocked: false });
      const leakSnap = prologue.getSnapshot();
      const exploitOption = (leakSnap.mirrorLeakChoices || []).find((o) => o.id === 'EXPLOIT_LEAK');
      prologue.chooseMirrorLeakAction('EXPLOIT_LEAK');
      const q2Snap = prologue.getSnapshot();
      const q2Card = q2Snap.activeQuestion;
      prologue.recordQuestionCompleted({ questionIndex: 2, correct: true, spinUsed: true, peelTierUsed: 1, overclocked: false });
      prologue.chooseManifesto('MANIFESTO_PUBLIC');
      const q3Snap = prologue.getSnapshot();
      const q3Card = q3Snap.activeQuestion;

      const qCards = [q1Card, q2Card, q3Card].filter(Boolean);
      const collisionStats = [];
      const TRIALS = 200;

      const smcSrcForSim02 = fs.readFileSync(path.join(ROOT, 'src/ui/SovereignMasterController.ts'), 'utf8');
      const prologueFacetBlock = smcSrcForSim02.slice(
        smcSrcForSim02.indexOf('const prismQ = prologueCardToPrismQuestion(qCard);'),
        smcSrcForSim02.indexOf('const prismQ = prologueCardToPrismQuestion(qCard);') + 1100,
      );
      const smcRecomputesPrologueShattered =
        /clueTiers\[2\]\.shatteredFacetIndices\s*=|clueTiers\[2\]\s*=\s*\{[\s\S]{0,160}shatteredFacetIndices:/.test(
          prologueFacetBlock,
        );

      for (let qi = 0; qi < qCards.length; qi++) {
        const qCard = qCards[qi];
        let shatteredCorrectCount = 0;
        let sampleBug = null;
        for (let t = 0; t < TRIALS; t++) {
          const raw = {
            qid: qCard.qid,
            l0Domain: qCard.domainId,
            l1Category: 'Geneva Vetting',
            prompt: qCard.prompt,
            answerCorrect: qCard.answerCorrect,
            distractors: qCard.facets.filter((_, i) => i !== qCard.correctFacetIndex),
            clues: qCard.clues,
            whyExplanation: qCard.whyExplanation,
            irtB: -0.5,
            archetype: 'SIGHTLINE_LOCK',
            timerSec: qCard.timeTotalSec,
          };
          const prismQ = ShardDecoder.normalizeToPrismQuestion(raw);
          prismQ.facets = qCard.facets.map((txt, idx) => ({
            index: idx,
            slotLabel: ['A', 'B', 'C', 'D'][idx],
            text: txt,
            isCorrect: idx === qCard.correctFacetIndex,
            crowdSharePct: idx === qCard.correctFacetIndex ? 46 : 18,
          }));
          prismQ.correctFacetIndex = qCard.correctFacetIndex;
          if (smcRecomputesPrologueShattered) {
            prismQ.clueTiers[2].shatteredFacetIndices = [0, 1, 2, 3].filter((i) => i !== qCard.correctFacetIndex).slice(0, 2);
          }
          const shattered = prismQ.clueTiers[2]?.shatteredFacetIndices || [];
          if (shattered.includes(prismQ.correctFacetIndex)) {
            shatteredCorrectCount++;
            if (!sampleBug) {
              sampleBug = {
                qid: qCard.qid,
                correctFacetIndex: prismQ.correctFacetIndex,
                correctAnswer: qCard.facets[qCard.correctFacetIndex],
                staleShatteredIndices: shattered,
              };
            }
          }
        }
        collisionStats.push({
          questionIndex: qi + 1,
          qid: qCard.qid,
          correctFacetIndex: qCard.correctFacetIndex,
          trials: TRIALS,
          shatteredCorrectCount,
          shatterRatePct: Number(((shatteredCorrectCount / TRIALS) * 100).toFixed(1)),
          sampleBug,
        });
      }

      // Also check Q2 Mirror Leak choice wording vs SovereignMasterController.ts:1231
      const smcSrc = fs.readFileSync(path.join(ROOT, 'src/ui/SovereignMasterController.ts'), 'utf8');
      const leakPeelBugMatch = smcSrc.match(/const initialPeel:\s*PeelTier\s*=\s*snap\.leakedHintRevealed\s*\?\s*2\s*:\s*1/);

      checks.sim02_prologuePeelAndLeak = {
        collisionStats,
        exploitOptionSubtext: exploitOption?.subtext,
        exploitOptionImpact: exploitOption?.impactBadge,
        q2LeakedHintRevealed: q2Snap.leakedHintRevealed,
        q2LeakedHintText: q2Card?.leakedHintText,
        smcSetsPeelTier2OnLeak: Boolean(leakPeelBugMatch),
      };

      const totalCollisions = collisionStats.reduce((s, c) => s + c.shatteredCorrectCount, 0);
      if (totalCollisions > 0) {
        recordFinding(
          'GAMEPLAY-P0-02',
          'P0',
          '@mobile-hud-architect',
          'src/ui/SovereignMasterController.ts:1216-1228, 2780-2790',
          'Geneva Prologue Q1–Q3 Tier-3 Peel can shatter & disable the REAL correct answer (`prologueCardToPrismQuestion` overwrites `facets` & `correctFacetIndex` without updating `clueTiers[2].shatteredFacetIndices`)',
          { collisionStats },
        );
      }
      if (leakPeelBugMatch && /3\.0x/i.test(String(exploitOption?.subtext || ''))) {
        recordFinding(
          'GAMEPLAY-P1-01',
          'P1',
          '@mobile-hud-architect',
          'src/ui/SovereignMasterController.ts:1231 vs src/narrative/PrologueDirector.ts:284',
          'Geneva Q2 Mirror Leak `EXPLOIT_LEAK` promises keeping 3.0x multiplier, yet `SovereignMasterController` initializes Q2 at `peelTier = 2` (2.0x) and ignores `qCard.leakedHintText`',
          {
            promisedText: exploitOption?.subtext,
            codeLine: leakPeelBugMatch[0],
          },
        );
      }
    }

    // ------------------------------------------------------------------------
    // BOOT REAL FORGE ENGINE FOR CORPUS, SHARDS & ALL 5 MODES
    // ------------------------------------------------------------------------
    clearStorage();
    const forge = new ForgeEngineMod.ForgeEngine({
      enableBackgroundPrefetch: false,
    });
    await forge.init();
    const counts = forge.getDomainCounts();
    checks.forgeBoot = {
      verifiedUniqueTotal: counts.verifiedUniqueTotal,
      totalPlayableCount: counts.totalPlayableCount,
      domainCount: counts.byDomain.length,
    };

    // ------------------------------------------------------------------------
    // SIM-03: All 5 3D Morphs Integrity, 0% Auto-Win, Comma-Free Years, Multipliers
    // ------------------------------------------------------------------------
    {
      // 3A: CALIBRATOR_DIAL across corpus + gold packs + prologue Q4 + decoded shard calibrators
      const rawQuestions = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA_DIR, 'questions.json'), 'utf8'));
      const rawGold = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA_DIR, 'gold_venue_packs.json'), 'utf8'));
      const qList = Array.isArray(rawQuestions) ? rawQuestions : (rawQuestions.questions || []);
      const goldList = [];
      for (const pack of Object.values(rawGold.packs || rawGold || {})) {
        if (Array.isArray(pack)) goldList.push(...pack);
        else if (pack && Array.isArray(pack.questions)) goldList.push(...pack.questions);
      }

      const calQuestions = [];
      for (const r of [...qList, ...goldList]) {
        if (r && (r.archetype === 'CALIBRATOR_DIAL' || r.calibrator)) {
          calQuestions.push(ShardDecoder.normalizeToPrismQuestion(r));
        }
      }
      // Also decode shard calibrators from live Forge queries across domains
      const liveCalPool = await forge.queryBriefingRoomAsync({
        domains: [0, 1, 2, 5, 6, 11],
        difficultyPreset: 'MIXED',
        count: 60,
      });
      for (const q of liveCalPool) {
        if (q.archetype === 'CALIBRATOR_DIAL' && q.calibrator) calQuestions.push(q);
      }

      let calAutoWinWide = 0;
      let calAutoWinSharp = 0;
      let calAutoWinPinhole = 0;
      const calYearCommaViolations = [];
      const calAutoWinSamples = [];

      for (const q of calQuestions) {
        const cal = q.calibrator;
        if (!cal) continue;
        for (const coneId of ['WIDE', 'SHARP', 'PINHOLE']) {
          const res = ScoringMod.evaluatePrismAnswer(q, {
            archetype: 'CALIBRATOR_DIAL',
            peelTier: 1,
            overclocked: false,
            overclockCharge: 0,
            elapsedSec: 4.0,
            calibratorEstimate: cal.initialEstimate,
            calibratorConeId: coneId,
          });
          if (res.correct) {
            if (coneId === 'WIDE') calAutoWinWide++;
            if (coneId === 'SHARP') calAutoWinSharp++;
            if (coneId === 'PINHOLE') calAutoWinPinhole++;
            if (calAutoWinSamples.length < 5) {
              calAutoWinSamples.push({
                qid: q.qid,
                coneId,
                initialEstimate: cal.initialEstimate,
                exactVal: cal.exactVal,
                prompt: q.prompt.slice(0, 70),
              });
            }
          }
          // Verify year comma hygiene in correctAnswerDisplay
          if (/\b[12],\d{3}\b/.test(res.correctAnswerDisplay)) {
            const isYear = ShardDecoder.isYearNumberContext(cal.unit, q.prompt);
            if (isYear && calYearCommaViolations.length < 10) {
              calYearCommaViolations.push({
                qid: q.qid,
                display: res.correctAnswerDisplay,
                unit: cal.unit,
                prompt: q.prompt.slice(0, 70),
              });
            }
          }
        }
      }

      // Check Calibrator Free-Peel Exploit: evaluatePrismAnswer with peelTier 1 vs peelTier 3 gives IDENTICAL points!
      const sampleCal = calQuestions[0];
      let calPeelTier1Pts = 0;
      let calPeelTier3Pts = 0;
      if (sampleCal?.calibrator) {
        const r1 = ScoringMod.evaluatePrismAnswer(sampleCal, {
          archetype: 'CALIBRATOR_DIAL',
          peelTier: 1,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 5.0,
          calibratorEstimate: sampleCal.calibrator.exactVal,
          calibratorConeId: 'PINHOLE',
        });
        const r3 = ScoringMod.evaluatePrismAnswer(sampleCal, {
          archetype: 'CALIBRATOR_DIAL',
          peelTier: 3,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 5.0,
          calibratorEstimate: sampleCal.calibrator.exactVal,
          calibratorConeId: 'PINHOLE',
        });
        calPeelTier1Pts = r1.pointsEarned;
        calPeelTier3Pts = r3.pointsEarned;
      }

      // 3B: CODEX_DUAL_RING across corpus + live synthesized codex questions
      const codexQuestions = [];
      for (const r of [...qList, ...goldList]) {
        if (r && (r.archetype === 'CODEX_DUAL_RING' || r.codex)) {
          codexQuestions.push(ShardDecoder.normalizeToPrismQuestion(r));
        }
      }
      // Pull live codex rounds from Forge (Campaign & Daily & Briefing)
      for (let d = 0; d < 12; d++) {
        const batch = await forge.queryBriefingRoomAsync({
          domains: [d],
          difficultyPreset: 'MIXED',
          count: 15,
        });
        for (const q of batch) {
          if (q.archetype === 'CODEX_DUAL_RING' && q.codex) codexQuestions.push(q);
        }
      }

      let codexAutoPass012 = 0; // exact or 2/3 partial credit on [0,1,2]
      let codexAutoPassExact012 = 0;
      let codexAutoPass000 = 0;
      let codexAutoPassInit = 0;
      const codexAutoSamples = [];
      for (const q of codexQuestions) {
        const c = q.codex;
        if (!c) continue;
        const r012 = ScoringMod.evaluatePrismAnswer(q, {
          archetype: 'CODEX_DUAL_RING',
          peelTier: 1,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 5.0,
          codexSelectedTargetIndices: [0, 1, 2],
        });
        if (r012.correct) {
          codexAutoPass012++;
          if (r012.partialCreditRatio === 1) codexAutoPassExact012++;
          if (codexAutoSamples.length < 5) {
            codexAutoSamples.push({
              qid: q.qid,
              submitted: [0, 1, 2],
              correctIdx: c.correctTargetIndexBySubject,
              partialCreditRatio: r012.partialCreditRatio,
            });
          }
        }
        const r000 = ScoringMod.evaluatePrismAnswer(q, {
          archetype: 'CODEX_DUAL_RING',
          peelTier: 1,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 5.0,
          codexSelectedTargetIndices: [0, 0, 0],
        });
        if (r000.correct) codexAutoPass000++;
        if (Array.isArray(c.initialTargetSelections)) {
          const rInit = ScoringMod.evaluatePrismAnswer(q, {
            archetype: 'CODEX_DUAL_RING',
            peelTier: 1,
            overclocked: false,
            overclockCharge: 0,
            elapsedSec: 5.0,
            codexSelectedTargetIndices: c.initialTargetSelections,
          });
          if (rInit.correct) codexAutoPassInit++;
        }
      }

      // Codex free-peel check
      let codexPeelTier1Pts = 0;
      let codexPeelTier3Pts = 0;
      if (codexQuestions[0]?.codex) {
        const q = codexQuestions[0];
        codexPeelTier1Pts = ScoringMod.evaluatePrismAnswer(q, {
          archetype: 'CODEX_DUAL_RING',
          peelTier: 1,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 5.0,
          codexSelectedTargetIndices: [...q.codex.correctTargetIndexBySubject],
        }).pointsEarned;
        codexPeelTier3Pts = ScoringMod.evaluatePrismAnswer(q, {
          archetype: 'CODEX_DUAL_RING',
          peelTier: 3,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 5.0,
          codexSelectedTargetIndices: [...q.codex.correctTargetIndexBySubject],
        }).pointsEarned;
      }

      // 3C: GAUNTLET_SHATTER Trick Multiplier HUD Mismatch
      const hudSrc = fs.readFileSync(path.join(ROOT, 'src/ui/SovereignHUD.ts'), 'utf8');
      const gauntletTrickHudLabel = hudSrc.match(/▲\s*TRICK\s*([0-9.]+)[×x]/i)?.[0] || null;
      const sampleGauntlet = ShardDecoder.normalizeToPrismQuestion({
        qid: 999001,
        l0Domain: 0,
        l1Category: 'Test',
        prompt: 'Trick check',
        answerCorrect: 'A',
        distractors: ['B', 'C', 'D'],
        clues: ['c1', 'c2'],
        whyExplanation: 'why',
        irtB: 0,
        archetype: 'GAUNTLET_SHATTER',
        gauntlet: { statement: 'Trick stmt', isTrue: false, isTrick: true, trickReason: 'Trick!' },
      });
      const trickScoreRes = ScoringMod.evaluatePrismAnswer(sampleGauntlet, {
        archetype: 'GAUNTLET_SHATTER',
        peelTier: 1,
        overclocked: false,
        overclockCharge: 0,
        elapsedSec: 3.0,
        gauntletAction: 'CHALLENGE',
      });

      // 3D: HERO_ARTIFACT_SYNTHESIS across ALL 8 Campaign hubs
      const HUBS = ['ch', 'gb', 'jp', 'br', 'eg', 'is', 'sg', 'global'];
      const heroResults = [];
      for (const hub of HUBS) {
        const hq = forge.getBossArtifactSynthesis(hub, 4);
        const steps = hq?.heroSynthesis?.steps || [];
        const stepHealth = steps.map((st, idx) => ({
          step: idx,
          facetCount: st.facets?.length ?? 0,
          distinctFacets: new Set((st.facets || []).map((f) => String(f.text).trim().toLowerCase())).size,
          correctCount: (st.facets || []).filter((f) => f.isCorrect).length,
          correctIdxValid: st.correctFacetIndex >= 0 && st.correctFacetIndex < (st.facets?.length ?? 0),
        }));
        heroResults.push({
          hub,
          ok: steps.length === 3 && stepHealth.every((s) => s.facetCount === 4 && s.distinctFacets === 4 && s.correctCount === 1 && s.correctIdxValid),
          stepCount: steps.length,
          stepHealth,
        });
      }

      checks.sim03_fiveMorphs = {
        calibratorCount: calQuestions.length,
        calAutoWinWide,
        calAutoWinSharp,
        calAutoWinPinhole,
        calAutoWinSamples,
        calYearCommaViolations,
        calPeelTier1Pts,
        calPeelTier3Pts,
        codexCount: codexQuestions.length,
        codexAutoPass012,
        codexAutoPassExact012,
        codexAutoPass000,
        codexAutoPassInit,
        codexAutoSamples,
        codexPeelTier1Pts,
        codexPeelTier3Pts,
        gauntletTrickHudLabel,
        gauntletTrickActualMult: trickScoreRes.tierMultiplier,
        heroSynthesis8Hubs: heroResults,
      };

      if (calAutoWinWide > 0 || calAutoWinSharp > 0 || calAutoWinPinhole > 0) {
        recordFinding(
          'GAMEPLAY-P1-CAL-AUTOWIN',
          'P1',
          '@forge-number-hygiene',
          'src/forge/ShardDecoder.ts (buildCalibratorSpec)',
          `CALIBRATOR_DIAL untouched initialEstimate auto-wins (${calAutoWinWide} WIDE / ${calAutoWinSharp} SHARP / ${calAutoWinPinhole} PINHOLE out of ${calQuestions.length})`,
          { calAutoWinSamples },
        );
      }
      if (codexAutoPass012 > 0 || codexAutoPassInit > 0) {
        recordFinding(
          'GAMEPLAY-P1-CODEX-AUTOPASS',
          'P1',
          '@forge-number-hygiene',
          'src/forge/ShardDecoder.ts (buildCodexSpec)',
          `CODEX_DUAL_RING untouched [0,1,2] auto-passes (${codexAutoPass012}/${codexQuestions.length}, exact=${codexAutoPassExact012}, initial=${codexAutoPassInit})`,
          { codexAutoSamples },
        );
      }
      if (calPeelTier1Pts > 0 && calPeelTier1Pts === calPeelTier3Pts && codexPeelTier1Pts > 0 && codexPeelTier1Pts === codexPeelTier3Pts) {
        recordFinding(
          'GAMEPLAY-P1-02',
          'P1',
          '@mobile-hud-architect / @forge-number-hygiene',
          'src/ui/SovereignHUD.ts:1695, 2077, 2250 + src/modes/ScoringEngine.ts:175-218',
          'CALIBRATOR_DIAL & CODEX_DUAL_RING HUD multiplier lie & Free-Peel Exploit: HUD always shows `3.0x/2.0x/1.2x` & lets player peel clues with ZERO score penalty (Calibrator Tier-1 pts === Tier-3 pts, Codex Tier-1 pts === Tier-3 pts), ignoring Calibrator cone multipliers (`1.5x/2.5x/3.5x`) in HUD & Overclock controller',
          { calPeelTier1Pts, calPeelTier3Pts, codexPeelTier1Pts, codexPeelTier3Pts },
        );
      }
      if (gauntletTrickHudLabel && !gauntletTrickHudLabel.includes(String(trickScoreRes.tierMultiplier))) {
        recordFinding(
          'GAMEPLAY-P2-01',
          'P2',
          '@mobile-hud-architect',
          'src/ui/SovereignHUD.ts:1974 vs src/modes/ScoringEngine.ts:240',
          `Gauntlet Trick button copy mismatch: HUD displays "${gauntletTrickHudLabel}" while ScoringEngine awards ${trickScoreRes.tierMultiplier.toFixed(1)}x`,
          { hudLabel: gauntletTrickHudLabel, scoringMult: trickScoreRes.tierMultiplier },
        );
      }
      if (heroResults.some((r) => !r.ok)) {
        recordFinding(
          'GAMEPLAY-P0-HERO',
          'P0',
          '@forge-number-hygiene',
          'src/forge/ForgeEngine.ts (queryHeroSynthesisBossAsync)',
          'One or more Boss Relic HERO_ARTIFACT_SYNTHESIS 3-step Latch chains failed facet integrity',
          { brokenHubs: heroResults.filter((r) => !r.ok) },
        );
      }
    }

    // ------------------------------------------------------------------------
    // SIM-04: Overclock Curve, Permanent Score Banking, Rival AI Tells & Call Bluff Double-Count
    // ------------------------------------------------------------------------
    {
      // Overclock 240ms..1050ms curve check
      const curvePts = [0, 120, 239, 240, 442, 645, 847, 1050, 1400].map((ms) => {
        const u = ms <= 240 ? 0 : Math.min(1, (ms - 240) / (1050 - 240));
        const c = OverclockMod.evaluateConvictionChargeCurve(u);
        return {
          ms,
          charge01: Number(c.toFixed(3)),
          multAt3x: Number((3.0 * (1 + c)).toFixed(2)),
        };
      });

      // 3D Canvas hold threshold mismatch check (Stage3DDirector vs SovereignMasterController)
      const stage3dSrc = fs.readFileSync(path.join(ROOT, 'src/stage3d/Stage3DDirector.ts'), 'utf8');
      const smcSrc = fs.readFileSync(path.join(ROOT, 'src/ui/SovereignMasterController.ts'), 'utf8');
      const stageHoldThresh = Number(stage3dSrc.match(/this\.holdCharge01\s*>=?\s*([0-9.]+)/)?.[1] ?? NaN);
      const smcHoldThresh = Number(smcSrc.match(/overclockCharge01\s*>=\s*([0-9.]+)/)?.[1] ?? NaN);

      // Ironclad Permanent Banking Monte Carlo (500 matches of 5 Qs with mixed hits & backfires)
      let bankingViolations = 0;
      const sampleQ = ShardDecoder.normalizeToPrismQuestion({
        qid: 1,
        l0Domain: 0,
        l1Category: 'History',
        prompt: 'Test Q',
        answerCorrect: 'A',
        distractors: ['B', 'C', 'D'],
        clues: ['c1', 'c2'],
        whyExplanation: 'w',
        irtB: 0,
        archetype: 'SIGHTLINE_LOCK',
      });
      for (let m = 0; m < 500; m++) {
        const eng = new ScoringMod.ScoringEngine(0);
        let hits = 0;
        for (let q = 0; q < 5; q++) {
          const isHit = (m + q) % 2 === 0;
          const isOC = q >= 2;
          const idx = isHit ? sampleQ.correctFacetIndex : (sampleQ.correctFacetIndex + 1) % 4;
          eng.submitAnswer(sampleQ, {
            archetype: 'SIGHTLINE_LOCK',
            peelTier: ((q % 3) + 1),
            overclocked: isOC,
            overclockCharge: isOC ? 1.0 : 0,
            elapsedSec: 4.5,
            selectedFacetIndex: idx,
            doubleOrNothingActive: q === 4,
          });
          if (isHit) hits++;
        }
        if (hits > 0 && (eng.getMatchScore() <= 0 || eng.getMatchScore() < eng.getPermanentBankedFloor())) {
          bankingViolations++;
        }
      }

      // Rival AI tell honesty & CALL BLUFF +1,500 PTS across 600 simulated questions (all 6 cast rivals)
      const RIVAL_IDS = ['vance', 'nadia', 'soren', 'teo', 'lindqvist', 'tariq'];
      let totalBluffQuestions = 0;
      let totalHonestTells = 0;
      let totalDishonestTells = 0;
      let caughtBluffsCorrectBonus = 0;
      let wrongBluffCallsZeroBonus = 0;

      for (const rid of RIVAL_IDS) {
        const rival = new RivalMod.RivalAI({ actorId: rid, seed: 4242, bluffWagerDuels: true });
        for (let i = 0; i < 100; i++) {
          rival.beginQuestion({
            qid: 1000 + i,
            domainId: i % 12,
            irtB: 0.5,
            archetype: 'SIGHTLINE_LOCK',
            timeTotalSec: 20,
          });
          // Advance simulated clock until wager / overclock window opens
          let called = false;
          for (let step = 1; step <= 38 && !called; step++) {
            const tickOut = rival.tick(step * 0.5);
            const hud = tickOut.hud;
            if (hud.callBluffWindowOpen) {
              const out = rival.callRivalBluff();
              called = true;
              const tellsIndicatesBluff = /bluff|clench|rolls rapidly|compromised|removes|cufflink|CALL IT/i.test(hud.tellPillText || '');
              if (out.wasActuallyBluffing) {
                totalBluffQuestions++;
                if (tellsIndicatesBluff) totalHonestTells++;
                else totalDishonestTells++;
                if (out.playerBonusPoints === 1500) caughtBluffsCorrectBonus++;
              } else {
                if (!tellsIndicatesBluff) totalHonestTells++;
                else totalDishonestTells++;
                if (out.playerBonusPoints === 0) wrongBluffCallsZeroBonus++;
              }
            }
          }
        }
      }

      // CareerAnalyticsStore double-count & false-positive count verification (checks REAL call sequence in SovereignMasterController.ts!)
      clearStorage();
      const analyticsStore = new AnalyticsMod.CareerAnalyticsStore();
      const smcBluffBlock = smcSrc.slice(
        smcSrc.indexOf('private handleCallRivalBluff'),
        smcSrc.indexOf('private handleCallRivalBluff') + 1200,
      );
      const smcSetsBluffBeforeIf = /if\s*\(\s*!outcome\.accepted\s*\)\s*return[^\n]*;\s*\r?\n\s*this\.questionBluffCalled\s*=\s*true/.test(smcBluffBlock);
      const smcCallsBluffFeat = /recordSpecialFeat\(['"]RIVAL_BLUFF_CAUGHT['"]\)/.test(smcBluffBlock);
      const smcBluffCancelBlock = smcSrc.slice(
        smcSrc.indexOf('private handleBluffCancel'),
        smcSrc.indexOf('private handleBluffCancel') + 700,
      );
      const smcCallsEchoFeat = /recordSpecialFeat\(['"]BLUFF_ECHO_CANCEL['"]\)/.test(smcBluffCancelBlock);
      const smcMetaQBlock = smcSrc.slice(
        smcSrc.indexOf('private notifyMetaQuestionOutcome'),
        smcSrc.indexOf('private notifyMetaQuestionOutcome') + 2400,
      );
      const smcPassesBluffCalled = /bluffCalled:\s*this\.questionBluffCalled/.test(smcMetaQBlock);
      const smcPassesBluffEcho = /bluffEchoCancelled:\s*this\.questionBluffEchoCancelled/.test(smcMetaQBlock);

      // Case A: Player catches 1 genuine bluff
      if (smcCallsBluffFeat) analyticsStore.recordSpecialFeat('RIVAL_BLUFF_CAUGHT');
      analyticsStore.recordQuestionOutcome({
        qid: 101,
        domainId: 0,
        archetype: 'SIGHTLINE_LOCK',
        mode: 'CAMPAIGN',
        correct: true,
        peelTier: 1,
        overclockCharge01: 0,
        backfired: false,
        responseTimeMs: 3000,
        pointsDelta: 3000,
        bluffCalled: smcPassesBluffCalled,
      });
      const countAfter1Catch = analyticsStore.getSnapshot().feats.rivalBluffsCaught;

      // Case B: Player makes 1 WRONG bluff call (wasActuallyBluffing === false)
      analyticsStore.recordQuestionOutcome({
        qid: 102,
        domainId: 0,
        archetype: 'SIGHTLINE_LOCK',
        mode: 'CAMPAIGN',
        correct: true,
        peelTier: 1,
        overclockCharge01: 0,
        backfired: false,
        responseTimeMs: 3000,
        pointsDelta: 3000,
        bluffCalled: smcSetsBluffBeforeIf && smcPassesBluffCalled,
      });
      const countAfter1CatchAnd1Fail = analyticsStore.getSnapshot().feats.rivalBluffsCaught;

      // Case C: Player triggers 1 Bluff Echo cancel
      if (smcCallsEchoFeat) analyticsStore.recordSpecialFeat('BLUFF_ECHO_CANCEL');
      analyticsStore.recordQuestionOutcome({
        qid: 103,
        domainId: 0,
        archetype: 'SIGHTLINE_LOCK',
        mode: 'CAMPAIGN',
        correct: true,
        peelTier: 1,
        overclockCharge01: 0,
        backfired: false,
        responseTimeMs: 4000,
        pointsDelta: 3000,
        bluffEchoCancelled: smcPassesBluffEcho,
      });
      const bluffEchoCountAfter1 = analyticsStore.getSnapshot().feats.bluffEchoCancels;

      // Case D: BLACK_SALON match recorded via SovereignMasterController.ts:3861 (`mode: 'BLACK_SALON'`)
      analyticsStore.recordMatchCompleted({
        mode: 'BLACK_SALON',
        hubId: 'is',
        won: true,
        correctCount: 5,
        totalQuestions: 5,
        score: 18000,
        isBlackSalon: true,
      });
      const snapAfterSalon = analyticsStore.getSnapshot();

      checks.sim04_combatAndTelemetry = {
        overclockCurve: curvePts,
        stageHoldThresh,
        smcHoldThresh,
        bankingViolations,
        rivalAi: {
          totalBluffQuestions,
          totalHonestTells,
          totalDishonestTells,
          caughtBluffsCorrectBonus,
          wrongBluffCallsZeroBonus,
        },
        analyticsBugs: {
          rivalBluffsCaughtAfter1GenuineCatch: countAfter1Catch,
          rivalBluffsCaughtAfter1CatchAnd1FailedCall: countAfter1CatchAnd1Fail,
          bluffEchoCancelsAfter1Cancel: bluffEchoCountAfter1,
          blackSalonLoggedAsCampaignMatches: snapAfterSalon.byMode.CAMPAIGN.matchesPlayed,
          blackSalonLoggedAsTrialsMatches: snapAfterSalon.byMode.TRIALS.matchesPlayed,
          blackSalonGhostTrialWins: snapAfterSalon.feats.ghostTrialWins,
        },
      };

      if (stageHoldThresh < smcHoldThresh) {
        recordFinding(
          'GAMEPLAY-P1-07',
          'P1',
          '@stage3d-mobile-framer / @mobile-hud-architect',
          'src/stage3d/Stage3DDirector.ts:1061 vs src/ui/SovereignMasterController.ts:2974',
          `3D Canvas Overclock Hold deadzone: Stage3D commits overclock at charge > ${stageHoldThresh}, but SovereignMasterController silently downgrades charge < ${smcHoldThresh} to Safe Lock`,
          { stageHoldThresh, smcHoldThresh },
        );
      }
      if (countAfter1Catch !== 1 || countAfter1CatchAnd1Fail !== 1 || bluffEchoCountAfter1 !== 1) {
        recordFinding(
          'GAMEPLAY-P1-04',
          'P1',
          '@mobile-hud-architect / @meta-sheets-architect',
          'src/ui/SovereignMasterController.ts:2596, 2609, 2899, 4008 + src/meta/CareerAnalyticsStore.ts:732-737',
          `CareerAnalyticsStore double-counting & false-positive bluff credit: 1 genuine bluff catch increments rivalBluffsCaught to ${countAfter1Catch} (expected 1); 1 FAILED bluff call still increments it to ${countAfter1CatchAnd1Fail}; 1 Bluff Echo cancel increments bluffEchoCancels to ${bluffEchoCountAfter1}`,
          checks.sim04_combatAndTelemetry.analyticsBugs,
        );
      }
      if (snapAfterSalon.byMode.CAMPAIGN.matchesPlayed > 0 && snapAfterSalon.byMode.TRIALS.matchesPlayed === 0) {
        recordFinding(
          'GAMEPLAY-P1-05',
          'P1',
          '@meta-sheets-architect / @mobile-hud-architect',
          'src/meta/CareerAnalyticsStore.ts:273-286 + src/ui/SovereignMasterController.ts:3711, 3988',
          'BLACK_SALON questions & matches silently misclassified into `byMode.CAMPAIGN` because `CareerAnalyticsStore.normalizeMode()` lacks a `BLACK_SALON` case (polluting Campaign stats & skipping `byMode.TRIALS` / `ghostTrialWins`)',
          {
            byModeCampaignMatches: snapAfterSalon.byMode.CAMPAIGN.matchesPlayed,
            byModeTrialsMatches: snapAfterSalon.byMode.TRIALS.matchesPlayed,
          },
        );
      }
    }

    // ------------------------------------------------------------------------
    // SIM-05: All 5 Game Modes, Campaign 96 Missions, 5-Slot Saves, 64 Trophies, 32 Unlockables
    // ------------------------------------------------------------------------
    {
      // 5A: Campaign 96 Missions + Phase III Sudden-Death + New Circuit+ IRT + 5-Slot Save Wipe
      clearStorage();
      const passport = new PassportMod.PassportSystem();
      const ink = new InkMod.InkBlackboard();
      const dossier = new DossierMod.EvidenceDossier(ink);
      const campaign = new CampaignMod.CampaignCircuitDirector(ink, passport, dossier);
      await campaign.loadCampaignData('data/campaign_20hr.json');
      const saveMgr = new SaveSlotMod.CampaignSaveSlotManager(passport, ink, campaign);

      const hubViews = campaign.getAllHubViews();
      const allMissions = hubViews.flatMap((hv) => hv.missions);
      const coreMissions = hubViews.flatMap((hv) => hv.coreMissions);
      const sideMissions = hubViews.flatMap((hv) => hv.sideInvestigations);
      const overview = campaign.getCampaignOverview();

      // Verify Phase III Sudden-Death Backfire spec on a City Boss (`gb_5`)
      const bossView = campaign.getMissionView('gb_5');
      const hasPhase3SuddenDeath = Boolean(
        bossView?.matchSpec?.bossPhases?.some((bp) => bp.phaseNumber === 3 && bp.suddenDeathOverclock),
      );

      // Verify New Circuit+ IRT escalation spec vs SovereignMasterController forwarding
      const ch1Loop0 = campaign.getMissionView('ch_1')?.matchSpec;
      const smcSrc = fs.readFileSync(path.join(ROOT, 'src/ui/SovereignMasterController.ts'), 'utf8');
      const smcCampaignQueryBlock = smcSrc.slice(
        smcSrc.indexOf('private async startCampaignPrismMatch'),
        smcSrc.indexOf('private async startCampaignPrismMatch') + 2600,
      );
      const forwardsIrtRange = /irtBRange/.test(smcCampaignQueryBlock);
      const forwardsMorphSeq = /morphSequence/.test(smcCampaignQueryBlock);

      // Check if handleFlightForkChoice & handleToggleBookmark call saveActiveSlot()
      const smcFlightBlock = smcSrc.slice(
        smcSrc.indexOf('private handleFlightForkChoice'),
        smcSrc.indexOf('private handleFlightForkChoice') + 450,
      );
      const smcBookmarkBlock = smcSrc.slice(
        smcSrc.indexOf('private handleToggleBookmark'),
        smcSrc.indexOf('private handleToggleBookmark') + 550,
      );
      const smcSavesOnFlightFork = /saveActiveSlot\s*\(/.test(smcFlightBlock);
      const smcSavesOnBookmark = /saveActiveSlot\s*\(/.test(smcBookmarkBlock);

      // Verify 5-Slot Save Manager cold-boot overwrite wipes unsaved Flight Fork / Bookmark mutations
      passport.setChallengerName('TestAce');
      passport.setOrigin('ACADEMIC');
      saveMgr.saveActiveSlot();
      // Mutate InkBlackboard (Flight Fork) & Passport (Bookmark) mirroring exact SMC behavior!
      const prolTmp = new PrologueMod.PrologueDirector(passport, ink);
      prolTmp.selectAct1FlightFork('JP');
      if (smcSavesOnFlightFork) saveMgr.saveActiveSlot();
      passport.toggleIntelBookmark({
        qid: 5555,
        domainId: 1,
        prompt: 'Saved Intel Test',
        answer: 'Mercury',
        whyExplanation: 'Closest planet to Sun.',
      });
      if (smcSavesOnBookmark) saveMgr.saveActiveSlot();
      const beforeReloadOrder = ink.getSnapshot().firstFlight;
      const beforeReloadBookmarks = passport.getSnapshot().bookmarks.length;
      // Simulate page refresh: reconstruct Passport + Ink + Campaign + CampaignSaveSlotManager
      const passport2 = new PassportMod.PassportSystem();
      const ink2 = new InkMod.InkBlackboard();
      const dossier2 = new DossierMod.EvidenceDossier(ink2);
      const campaign2 = new CampaignMod.CampaignCircuitDirector(ink2, passport2, dossier2);
      await campaign2.loadCampaignData('data/campaign_20hr.json');
      const saveMgr2 = new SaveSlotMod.CampaignSaveSlotManager(passport2, ink2, campaign2);
      const afterReloadOrder = ink2.getSnapshot().firstFlight;
      const afterReloadBookmarks = passport2.getSnapshot().bookmarks.length;

      // Test 5-Slot Save Export / Import / Switch / Reset / Delete integrity
      const exportJson = saveMgr2.exportSlotToFile(1);
      const importRes = saveMgr2.importSlotFromFileJson(2, exportJson);
      const switchRes = saveMgr2.switchOrStartSlot(2);
      saveMgr2.resetSlotToCampaignStart(2);
      const slot2AfterReset = saveMgr2.listSlots().find((s) => s.slotId === 2);
      saveMgr2.deleteSlot(2);
      const slot2AfterDelete = saveMgr2.listSlots().find((s) => s.slotId === 2);
      saveMgr2.switchOrStartSlot(1);

      // 5B: Daily Global Feed — 10 Prisms, UTC Determinism, Share Card, Percentile Balance, Replay Overwrite
      const daily1 = new DailyMod.DailyGlobalFeed(forge, passport2);
      const daily2 = new DailyMod.DailyGlobalFeed(forge, passport2);
      const utcDates = ['2026-11-22', '2026-11-23', '2026-11-24', '2026-12-01', '2026-12-25', '2027-01-01'];
      let dailyDeterminismMismatches = 0;
      let dailyCountViolations = 0;
      for (const d of utcDates) {
        const setA = daily1.startBroadcast(d).packet;
        const setB = daily2.startBroadcast(d).packet;
        if (setA.questions.length !== 10) dailyCountViolations++;
        const idsA = setA.questions.map((q) => q.qid).join(',');
        const idsB = setB.questions.map((q) => q.qid).join(',');
        if (idsA !== idsB) dailyDeterminismMismatches++;
      }

      // Monte Carlo balance check on 10-Prism Daily Percentile curve!
      const todayDaily = daily1.startBroadcast('2026-11-22').packet;
      const dailyScoreSamples = [];
      for (const hitsTarget of [0, 3, 5, 7, 10]) {
        const se = new ScoringMod.ScoringEngine(0);
        for (let i = 0; i < 10; i++) {
          const q = todayDaily.questions[i];
          const hit = i < hitsTarget;
          const sub =
            q.archetype === 'CALIBRATOR_DIAL' && q.calibrator
              ? {
                  archetype: q.archetype,
                  peelTier: 1,
                  overclocked: false,
                  overclockCharge: 0,
                  elapsedSec: 4.0,
                  calibratorEstimate: hit ? q.calibrator.exactVal : q.calibrator.minVal,
                  calibratorConeId: 'SHARP',
                }
              : q.archetype === 'CODEX_DUAL_RING' && q.codex
                ? {
                    archetype: q.archetype,
                    peelTier: 1,
                    overclocked: false,
                    overclockCharge: 0,
                    elapsedSec: 4.0,
                    codexSelectedTargetIndices: hit ? [...q.codex.correctTargetIndexBySubject] : [0, 0, 0],
                  }
                : q.archetype === 'GAUNTLET_SHATTER' && q.gauntlet
                  ? {
                      archetype: q.archetype,
                      peelTier: 1,
                      overclocked: false,
                      overclockCharge: 0,
                      elapsedSec: 4.0,
                      gauntletAction: hit
                        ? q.gauntlet.isTrick
                          ? 'CHALLENGE'
                          : q.gauntlet.isTrue
                            ? 'VERIFY'
                            : 'DEBUNK'
                        : q.gauntlet.isTrue
                          ? 'DEBUNK'
                          : 'VERIFY',
                    }
                  : {
                      archetype: 'SIGHTLINE_LOCK',
                      peelTier: 1,
                      overclocked: false,
                      overclockCharge: 0,
                      elapsedSec: 4.0,
                      selectedFacetIndex: hit ? q.correctFacetIndex : (q.correctFacetIndex + 1) % 4,
                    };
          se.submitAnswer(q, sub);
        }
        const score = se.getMatchScore();
        const pct = DailyMod.computeGlobalFeedPercentile(score);
        dailyScoreSamples.push({ hits: hitsTarget, safeLockScore: score, topPercentile: 100 - pct });
      }

      // Check Daily Replay overwriting higher score with lower score!
      daily1.startBroadcast('2026-11-22');
      for (let i = 0; i < 10; i++) {
        const q = daily1.getCurrentQuestion();
        if (!q) break;
        const sub =
          q.archetype === 'CALIBRATOR_DIAL' && q.calibrator
            ? { archetype: q.archetype, peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, calibratorEstimate: q.calibrator.exactVal, calibratorConeId: 'PINHOLE' }
            : q.archetype === 'CODEX_DUAL_RING' && q.codex
              ? { archetype: q.archetype, peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, codexSelectedTargetIndices: [...q.codex.correctTargetIndexBySubject] }
              : q.archetype === 'GAUNTLET_SHATTER' && q.gauntlet
                ? { archetype: q.archetype, peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, gauntletAction: q.gauntlet.isTrick ? 'CHALLENGE' : q.gauntlet.isTrue ? 'VERIFY' : 'DEBUNK' }
                : { archetype: 'SIGHTLINE_LOCK', peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, selectedFacetIndex: q.correctFacetIndex };
        daily1.submitCurrentAnswer(sub);
      }
      const dailyHighScore = daily1.getSavedResultForDate('2026-11-22')?.score ?? 0;
      // Replay same day and intentionally score 0!
      daily1.startBroadcast('2026-11-22');
      for (let i = 0; i < 10; i++) {
        const q = daily1.getCurrentQuestion();
        if (!q) break;
        daily1.submitCurrentAnswer({
          archetype: q.archetype,
          peelTier: 3,
          overclocked: false,
          overclockCharge: 0,
          elapsedSec: 18.0,
          timedOut: true,
        });
      }
      const dailyScoreAfterZeroReplay = daily1.getSavedResultForDate('2026-11-22')?.score ?? -1;

      // 5C: Briefing Room — Sports & Games -> Sports -> Baseball = 34,283 Qs + 5/10/20/50 Lengths + 0 Repeats + 0 Self-Leaks
      await forge.loadTaxonomyTree();
      await TaxonomyAdapterMod.prefetchExternalTaxonomyJson('./data/shards/taxonomy_tree.json');
      const taxTree = TaxonomyAdapterMod.buildNormalizedTaxonomyTree(forge.getDomainCounts(), forge);
      const sportsDom = taxTree.find((d) => d.domainId === 5);
      const sportsL1 = sportsDom?.subcategories.find((s) => s.id === 'sports');
      const baseballL2 = sportsL1?.topics.find((t) => t.id === 'sports_baseball');

      const briefing = new BriefingMod.BriefingCategoriesMode(forge, passport2);
      const seenBaseballQids = new Set();
      let baseballDuplicateCount = 0;
      let baseballSelfAnswerLeaks = 0;
      const baseballLengthCounts = {};
      for (const len of [5, 10, 20, 50]) {
        const session = await briefing.startBriefingRun({
          domains: [5],
          l1SubcategoryId: 'sports',
          l2TopicId: 'sports_baseball',
          topicDisplayLabel: 'Sports & Games › Sports › Baseball',
          difficulty: 'MIXED',
          length: len,
        });
        baseballLengthCounts[len] = session.questions.length;
        for (const q of session.questions) {
          if (seenBaseballQids.has(q.qid)) baseballDuplicateCount++;
          seenBaseballQids.add(q.qid);
          const ansLow = String(q.answerCorrect || '').trim().toLowerCase();
          if (ansLow === 'baseball' && /\bbaseball\b/i.test(q.prompt)) {
            baseballSelfAnswerLeaks++;
          }
        }
      }

      // 5D: Endless Archive Descent — 40 Lore Logs + 3 Shields + 3-Streak Repair + Backfire -2 + Airlock + maxStreak Checkpoint
      const endless = new EndlessMod.ArchiveDescentEndless(forge, passport2);
      const loreTitles = new Set((Wave2Mod.DEFAULT_40_ARCHIVE_LORE_LOGS || []).map((l) => l.title));
      const startRes = await endless.startDescent(false);
      // Answer 5 Qs: Q1 wrong (-1 shield: 3 -> 2), Q2/Q3/Q4/Q5 right with Overclock (3-streak repairs 2 -> 3!)
      let endlessQ = startRes.question;
      let airlockObj = null;
      for (let step = 0; step < 5 && endlessQ; step++) {
        const hit = step !== 0;
        const sub =
          endlessQ.archetype === 'CALIBRATOR_DIAL' && endlessQ.calibrator
            ? { archetype: endlessQ.archetype, peelTier: 1, overclocked: hit, overclockCharge: hit ? 0.5 : 0, elapsedSec: 3.0, calibratorEstimate: hit ? endlessQ.calibrator.exactVal : endlessQ.calibrator.minVal, calibratorConeId: 'SHARP' }
            : endlessQ.archetype === 'CODEX_DUAL_RING' && endlessQ.codex
              ? { archetype: endlessQ.archetype, peelTier: 1, overclocked: hit, overclockCharge: hit ? 0.5 : 0, elapsedSec: 3.0, codexSelectedTargetIndices: hit ? [...endlessQ.codex.correctTargetIndexBySubject] : [0, 0, 0] }
              : endlessQ.archetype === 'GAUNTLET_SHATTER' && endlessQ.gauntlet
                ? { archetype: endlessQ.archetype, peelTier: 1, overclocked: hit, overclockCharge: hit ? 0.5 : 0, elapsedSec: 3.0, gauntletAction: hit ? (endlessQ.gauntlet.isTrick ? 'CHALLENGE' : endlessQ.gauntlet.isTrue ? 'VERIFY' : 'DEBUNK') : (endlessQ.gauntlet.isTrue ? 'DEBUNK' : 'VERIFY') }
                : { archetype: 'SIGHTLINE_LOCK', peelTier: 1, overclocked: hit, overclockCharge: hit ? 0.5 : 0, elapsedSec: 3.0, selectedFacetIndex: hit ? endlessQ.correctFacetIndex : (endlessQ.correctFacetIndex + 1) % 4 };
        const adv = await endless.submitCurrentAnswer(sub);
        if (adv.airlockReached) {
          airlockObj = adv.airlockReached;
          break;
        }
        endlessQ = adv.nextQuestion;
      }
      const endlessCheckpointRaw = JSON.parse(globalThis.localStorage.getItem('ws_archive_descent_v2') || '{}');
      const extractedSummary = endless.extractAtAirlock();

      // 5E: World Council Ghost Trials & Black Salon
      const trials = new TrialsMod.CouncilTrialsGhostMode(forge, passport2, ink2);
      const { firstQuestion: tq0 } = await trials.startGhostDuel('soren');
      let curTq = tq0;
      let trialSummary = null;
      for (let i = 0; i < 6 && curTq; i++) {
        const sub =
          curTq.archetype === 'CALIBRATOR_DIAL' && curTq.calibrator
            ? { archetype: curTq.archetype, peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, calibratorEstimate: curTq.calibrator.exactVal, calibratorConeId: 'SHARP' }
            : curTq.archetype === 'CODEX_DUAL_RING' && curTq.codex
              ? { archetype: curTq.archetype, peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, codexSelectedTargetIndices: [...curTq.codex.correctTargetIndexBySubject] }
              : curTq.archetype === 'GAUNTLET_SHATTER' && curTq.gauntlet
                ? { archetype: curTq.archetype, peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, gauntletAction: curTq.gauntlet.isTrick ? 'CHALLENGE' : curTq.gauntlet.isTrue ? 'VERIFY' : 'DEBUNK' }
                : { archetype: 'SIGHTLINE_LOCK', peelTier: 1, overclocked: false, overclockCharge: 0, elapsedSec: 3.0, selectedFacetIndex: curTq.correctFacetIndex };
        const res = trials.submitCurrentAnswer(sub);
        if (res.summary) {
          trialSummary = res.summary;
          break;
        }
        curTq = res.nextQuestion;
      }
      const fullGhostCodeDecoded = trialSummary ? TrialsMod.decodeGhostPacket(trialSummary.shareableGhostCode) : null;
      const truncatedGhostCode = trialSummary ? `${trialSummary.shareableGhostCode.slice(0, 120)}...` : '';
      const truncatedGhostCodeDecoded = truncatedGhostCode ? TrialsMod.decodeGhostPacket(truncatedGhostCode) : null;

      // Test Black Salon abandon-to-advance bug!
      const salonRoundBefore = trials.getHubOverview().salonCurrentRound;
      await trials.startBlackSalonRound(); // Start Round 1 and DO NOT finish it!
      const salonRoundAfterAbandon = trials.getHubOverview().salonCurrentRound;

      // 5F: 64 Trophies & 32 Equippable Unlockables (12 Prism Finishes + 12 Broadcast Titles + 8 HUD Themes)
      const trophies = HonoursMod.HALL_OF_HONOURS_CATALOG;
      const uniqueTrophyIds = new Set(trophies.map((t) => t.id)).size;
      const finishesCount = AtelierMod.PRISM_ATELIER_FINISHES.length;
      const titlesCount = HonoursMod.BROADCAST_TITLES_CATALOG.length;
      const themesCount = HonoursMod.HUD_ACCENT_THEMES.length;
      const unlockByKind = {
        PRISM_FINISH: finishesCount,
        SOVEREIGN_TITLE: titlesCount,
        HUD_THEME: themesCount,
      };
      // Verify all 64 trophy target thresholds are finite positive integers & evaluator never throws
      const aStore = new AnalyticsMod.CareerAnalyticsStore();
      const honours = new HonoursMod.HallOfHonoursSystem(aStore, passport2, ink2);
      const trophyViews = honours.getAllProgress();
      const invalidTrophies = trophyViews.filter(
        (tv) => !Number.isFinite(tv.target) || tv.target <= 0 || !Number.isFinite(tv.current),
      );

      checks.sim05_modesAndMeta = {
        campaign: {
          totalMissions: allMissions.length,
          overviewTotalMissions: overview.totalMissionsCount,
          coreMissions: coreMissions.length,
          sideMissions: sideMissions.length,
          hubCount: hubViews.length,
          hasPhase3SuddenDeath,
          ch1IrtRange: ch1Loop0?.irtBRange,
          smcForwardsIrtRange: forwardsIrtRange,
          smcForwardsMorphSeq: forwardsMorphSeq,
        },
        saveSlots: {
          beforeReloadOrder,
          afterReloadOrder,
          beforeReloadBookmarks,
          afterReloadBookmarks,
          exportOk: exportJson.includes('WORLDS_SMARTEST_CAMPAIGN_SAVE'),
          importOk: importRes.ok,
          switchOk: Boolean(switchRes && !switchRes.isFreshStart),
          resetOk: Boolean(slot2AfterReset && slot2AfterReset.completedCount === 0),
          deleteOk: Boolean(slot2AfterDelete && !slot2AfterDelete.occupied),
        },
        dailyFeed: {
          datesChecked: utcDates.length,
          dailyCountViolations,
          dailyDeterminismMismatches,
          scorePercentileCurve: dailyScoreSamples,
          dailyHighScore,
          dailyScoreAfterZeroReplay,
        },
        briefingBaseball: {
          baseballFound: Boolean(baseballL2),
          baseballVerifiedCount: baseballL2?.verifiedCount ?? 0,
          lengthCounts: baseballLengthCounts,
          totalFetchedUnique: seenBaseballQids.size,
          duplicateCount: baseballDuplicateCount,
          selfAnswerLeaks: baseballSelfAnswerLeaks,
        },
        endless: {
          uniqueLoreLogsChecked: loreTitles.size,
          airlockDepth: airlockObj?.depthReached,
          airlockShieldsAfterMissAnd3OC: airlockObj?.shields,
          extractedActualCorrectCount: extractedSummary?.correctCount,
          checkpointHasMaxStreak: typeof endlessCheckpointRaw?.maxStreak === 'number',
        },
        ghostTrials: {
          fullGhostCodeLen: trialSummary?.shareableGhostCode?.length ?? 0,
          fullGhostDecodeOk: Boolean(fullGhostCodeDecoded),
          truncated120DecodeOk: Boolean(truncatedGhostCodeDecoded),
          salonRoundBeforeStart: salonRoundBefore,
          salonRoundAfterAbandon,
        },
        honours: {
          trophyCount: trophies.length,
          uniqueTrophyIds,
          unlockableCount: finishesCount + titlesCount + themesCount,
          unlockByKind,
          invalidTrophyEvalCount: invalidTrophies.length,
        },
      };

      // Emit verified findings from SIM-05
      if (afterReloadOrder !== beforeReloadOrder || afterReloadBookmarks !== beforeReloadBookmarks) {
        recordFinding(
          'GAMEPLAY-P0-03',
          'P0',
          '@mobile-hud-architect',
          'src/ui/SovereignMasterController.ts:1347-1351, 3370-3382 + src/narrative/CampaignSaveSlotManager.ts:336-339',
          'Save-Slot data wipe on page reload: Act I Flight Fork choice (`firstFlight`), Bookmarked Intel Flashes, and Daily/Briefing/Endless/Trials Passport stats are overwritten by stale Slot-1 snapshot on boot because `saveSlotManager.saveActiveSlot()` is not called after mutating Passport/Blackboard',
          { beforeReloadOrder, afterReloadOrder, beforeReloadBookmarks, afterReloadBookmarks },
        );
      }
      const smcGhostTruncated = /shareableGhostCode\.slice\(\s*0\s*,\s*120\s*\)/.test(smcSrc);
      if (smcGhostTruncated && trialSummary && fullGhostCodeDecoded && !truncatedGhostCodeDecoded) {
        recordFinding(
          'GAMEPLAY-P1-03',
          'P1',
          '@mobile-hud-architect',
          'src/ui/SovereignMasterController.ts:3887-3888',
          `Ghost Trials shareable \`WSG1:\` Ghost Code is truncated to 120 chars (\`slice(0, 120)...\`) from ${trialSummary.shareableGhostCode.length} chars, making copied codes 100% undecodable by \`decodeGhostPacket()\`, AND \`bestStreak\` is set to \`sum.correctCount\` instead of \`sum.maxStreak\``,
          { fullLen: trialSummary.shareableGhostCode.length, truncatedDecodable: false },
        );
      }
      if (dailyHighScore > 0 && dailyScoreAfterZeroReplay < dailyHighScore) {
        recordFinding(
          'GAMEPLAY-P1-06',
          'P1',
          '@forge-number-hygiene / @meta-sheets-architect',
          'src/modes/DailyGlobalFeed.ts:71-76, 312-317 + src/meta/CareerAnalyticsStore.ts:901-903',
          `Daily Global Feed bugs: (1) Practice replay on same UTC date overwrites best score (${dailyHighScore} -> ${dailyScoreAfterZeroReplay}) & increments \`dailyBroadcastsCompleted\` for Trophy #39 farming; (2) Percentile median (\`12200\`) is calibrated for old 7-Prism Daily instead of 10-Prism Daily (5/10 Safe Lock = Top ${dailyScoreSamples.find((s) => s.hits === 5)?.topPercentile}%)`,
          { dailyHighScore, dailyScoreAfterZeroReplay, dailyScoreSamples },
        );
      }
      if (!forwardsIrtRange || !forwardsMorphSeq) {
        recordFinding(
          'GAMEPLAY-P1-08',
          'P1',
          '@mobile-hud-architect',
          'src/ui/SovereignMasterController.ts:2046-2055',
          'Campaign `startCampaignPrismMatch()` does not forward `spec.irtBRange` or `spec.morphSequence` to `ForgeEngine.queryCampaignRoundAsync()`, nullifying New Circuit+ `+0.45 * loop` IRT difficulty scaling and per-mission morph cadence',
          { forwardsIrtRange, forwardsMorphSeq },
        );
      }
      if (salonRoundAfterAbandon !== salonRoundBefore) {
        recordFinding(
          'GAMEPLAY-P2-02',
          'P2',
          '@forge-number-hygiene',
          'src/modes/CouncilTrialsGhostMode.ts:503-505',
          `Black Salon increments & persists \`salonCurrentRound\` (${salonRoundBefore} -> ${salonRoundAfterAbandon}) at match START instead of VICTORY, letting players skip bracket rounds by abandoning`,
          { salonRoundBefore, salonRoundAfterAbandon },
        );
      }
      if (typeof endlessCheckpointRaw?.maxStreak !== 'number' && extractedSummary && extractedSummary.correctCount === 4) {
        recordFinding(
          'GAMEPLAY-P2-03',
          'P2',
          '@forge-number-hygiene',
          'src/modes/ArchiveDescentEndless.ts:75, 193-204, 231',
          'Endless Archive Descent checkpoint declares `maxStreak` on `ArchiveCheckpointSave` but never persists or restores it on resume (`startDescent(true)`)',
          { checkpointKeys: Object.keys(endlessCheckpointRaw || {}) },
        );
      }
    }
  } finally {
    cleanup();
  }

  return { checks, findings };
}

// ============================================================================
// PART B: LIVE HEADLESS EDGE/CHROMIUM WEBGL2 E2E BROWSER PLAYTEST
// ============================================================================

function buildIsolatedBrowserDist() {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-pillar-gameplay-dist-'));
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  execFileSync(process.execPath, [viteBin, 'build', '--outDir', outDir, '--emptyOutDir'], {
    cwd: ROOT,
    stdio: 'pipe',
  });
  return {
    outDir,
    cleanup: () => {
      try {
        fs.rmSync(outDir, { recursive: true, force: true });
      } catch {}
    },
  };
}

async function waitForAppBoot(br) {
  const ok = await br.waitFor(
    `document.querySelector('#canvas-root canvas') && (document.querySelector('#ws-title-enter-cta') || document.querySelector('[data-title-mode]') || document.querySelector('#ui-root button'))`,
    25000,
    150,
  );
  if (!ok) {
    throw new Error(
      `App failed to boot. consoleErrors=${JSON.stringify(br.consoleErrors)} pageExceptions=${JSON.stringify(br.pageExceptions)} httpErrors=${JSON.stringify(br.httpErrors)}`,
    );
  }
  await sleep(1000);
}

async function clickFirstVisible(br, selectors) {
  return br.evalJs(`(() => {
    for (const sel of ${JSON.stringify(selectors)}) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && !el.disabled && !el.closest('[hidden]')) {
        el.click();
        return { selector: sel, text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60) };
      }
    }
    return null;
  })()`);
}

async function playAnyCurrentQuestion(br, { preferCorrect = false, holdMs = 0 } = {}) {
  const kind = await br.evalJs(`(() => {
    if (document.querySelector('[data-gauntlet]')) return 'GAUNTLET';
    if (document.querySelector('.ws-globe-pin-controls, .ws-globe-anchor-btn')) return 'GLOBE_PIN_DROP';
    if (document.querySelector('#ws-cal-slider')) return 'CALIBRATOR';
    if (document.querySelector('[data-codex-subj]')) return 'CODEX';
    if (document.querySelector('[data-facet-idx]')) return 'SIGHTLINE';
    return 'NONE';
  })()`);
  if (kind === 'NONE') return kind;

  if (kind === 'GAUNTLET') {
    await br.evalJs(`document.querySelector('[data-gauntlet="VERIFY"]')?.click()`);
    await sleep(300);
    return kind;
  }

  if (kind === 'GLOBE_PIN_DROP') {
    await br.evalJs(`document.querySelector('.ws-globe-anchor-btn')?.click()`);
    await sleep(140);
  } else if (kind === 'CALIBRATOR') {
    await br.evalJs(`(() => {
      const s = document.querySelector('#ws-cal-slider');
      if (s) {
        const min = Number(s.min);
        const max = Number(s.max);
        s.value = String(${preferCorrect ? 'Math.round((min + max) / 2)' : 'min'});
        s.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await sleep(120);
  } else if (kind === 'CODEX') {
    await br.evalJs(`document.querySelector('[data-codex-subj="0"][data-codex-dir="1"]')?.click()`);
    await sleep(120);
  } else {
    // Select first enabled facet
    await br.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('[data-facet-idx]')).find((b) => !b.disabled);
      if (btn && !btn.classList.contains('is-sightline')) btn.click();
    })()`);
    await sleep(120);
  }

  const pt = await br.evalJs(`(() => {
    const b = document.querySelector('#ws-btn-overclock');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (pt) {
    await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
    await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
    await sleep(Math.max(40, holdMs));
    await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
  }
  await sleep(320);
  return kind;
}

async function runBrowserPlaytestSuite(useDist, softwareGl) {
  let distRoot = path.join(ROOT, 'dist');
  let cleanupDist = () => {};
  if (!useDist) {
    const built = buildIsolatedBrowserDist();
    distRoot = built.outDir;
    cleanupDist = built.cleanup;
  }

  const srv = await startDistServer(distRoot);
  let br = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      br = await launchCdpBrowser({ width: 390, height: 844, softwareGl });
      break;
    } catch (e) {
      if (attempt === 2) throw e;
      console.error(`[E2E] Retry ${attempt} launching Edge:`, e?.message || e);
      await sleep(1500);
    }
  }
  const browserReport = {
    e2e01_prologueAndReload: {},
    e2e02_campaignBreachBluffBookmark: {},
    e2e03_saveSlots: {},
    e2e04_briefingBaseball: {},
    e2e05_dailyGlobalFeed: {},
    e2e06_endlessAirlock: {},
    e2e07_ghostTrialsAndBlackSalon: {},
    e2e08_statsTrophiesUnlockablesAndObservatory: {},
    e2e09_desktop1280x800Smoke: {},
    diagnostics: { consoleErrors: [], pageExceptions: [], httpErrors: [], shaderErrors: [] },
    findings: [],
  };

  const addBrowserFinding = (id, severity, owner, fileLine, summary, evidence) => {
    browserReport.findings.push({ id, severity, owner, fileLine, summary, evidence });
  };

  try {
    console.error('[E2E] Booting 390x844 mobile portrait against', srv.baseUrl);
    await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    console.error('[E2E] E2E-01 Prologue...');

    // =========================================================================
    // E2E-01: COLD BOOT -> PROLOGUE Q1-Q4 (SPIN, PEEL T2->T3, MIRROR LEAK,
    //         PREMATURE PROLOGUE_CLEARED, BLUFF ECHO CANCEL, HOLD OVERCLOCK,
    //         CALIBRATOR COMMA-FREE YEARS + CONES + PEEL BUG, FLIGHT FORK RELOAD WIPE)
    // =========================================================================
    await br.evalJs(`localStorage.clear()`);
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);

    await br.clickSelector('#ws-title-enter-cta, [data-title-mode="CAMPAIGN"]');
    await sleep(500);
    // Advance Hub/Prologue CTA & intro cutscene/dialogue to Registration input (#challenger-name-input)
    for (let i = 0; i < 8; i++) {
      const hasInput = await br.evalJs(`Boolean(document.querySelector('#challenger-name-input'))`);
      if (hasInput) break;
      await clickFirstVisible(br, ['[data-start-prologue]', '#ws-mc-skip', '[data-cinema-skip]', '#ws-story-continue', '.ws-btn-gold']);
      await sleep(450);
    }

    // Fill Challenger Name & launch Q1
    await br.evalJs(`(() => {
      const inp = document.querySelector('#challenger-name-input');
      if (inp) {
        inp.value = 'AuditAce';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      document.querySelector('#ws-begin-vetting, .ws-btn-gold')?.click();
    })()`);
    await sleep(650);
    for (let i = 0; i < 6; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('[data-facet-idx="0"]'))`)) break;
      await clickFirstVisible(br, ['#ws-mc-skip', '[data-cinema-skip]', '#ws-story-continue', '.ws-btn-gold']);
      await sleep(450);
    }

    // Test Spin via A-D tap, ArrowRight key, and 3D canvas touch drag
    const spinStartIdx = await br.evalJs(`Number(document.querySelector('.ws-facet-pill.is-sightline')?.dataset.facetIdx ?? -1)`);
    await br.clickSelector('[data-facet-idx="2"]');
    await sleep(160);
    const spinAfterTap = await br.evalJs(`Number(document.querySelector('.ws-facet-pill.is-sightline')?.dataset.facetIdx ?? -1)`);
    await br.pressKey('ArrowRight', 'ArrowRight', 39);
    await sleep(220);
    const spinAfterArrow = await br.evalJs(`Number(document.querySelector('.ws-facet-pill.is-sightline')?.dataset.facetIdx ?? -1)`);
    // 3D canvas drag across open upper stage
    await br.touchDrag(280, 210, 90, 210, 10, 20);
    await sleep(250);
    const spinAfterDrag = await br.evalJs(`Number(document.querySelector('.ws-facet-pill.is-sightline')?.dataset.facetIdx ?? -1)`);

    // Test Peel Tier 1 -> Tier 2 -> Tier 3 on Geneva Q1! Check if correct answer (`Geneva` -> index 1) got disabled!
    await br.clickSelector('#ws-btn-peel');
    await sleep(250);
    const q1Tier2Badge = await br.evalJs(`document.querySelector('#ws-tier-badge')?.textContent?.trim() || ''`);
    await br.clickSelector('#ws-btn-peel');
    await sleep(250);
    const q1Tier3State = await br.evalJs(`(() => {
      const badge = document.querySelector('#ws-tier-badge')?.textContent?.trim() || '';
      const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => ({
        idx: Number(b.dataset.facetIdx),
        text: (b.querySelector('.ws-facet-text')?.textContent || b.textContent || '').trim(),
        disabled: b.disabled,
        shattered: b.classList.contains('is-shattered'),
      }));
      return { badge, facets };
    })()`);

    // Pick Geneva (or first enabled facet if Geneva was shattered!) and lock Q1
    await br.evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('[data-facet-idx]'));
      const geneva = btns.find((b) => /Geneva/i.test(b.textContent || '') && !b.disabled);
      const fallback = btns.find((b) => !b.disabled);
      const pick = geneva || fallback;
      if (pick && !pick.classList.contains('is-sightline')) pick.click();
    })()`);
    await sleep(120);
    await br.clickSelector('#ws-btn-overclock');
    await sleep(450);
    await br.clickSelector('#ws-btn-next-q');
    await sleep(500);

    // Mirror Leak Choice: click MIRROR:EXPLOIT_LEAK!
    const leakChoiceClicked = await br.evalJs(`(() => {
      const btn = document.querySelector('[data-story-choice="MIRROR:EXPLOIT_LEAK"], [data-story-choice="EXPLOIT_LEAK"]');
      if (!btn) return null;
      const text = btn.textContent.replace(/\\s+/g, ' ').trim();
      btn.click();
      return text;
    })()`);
    await sleep(500);

    // Inspect Q2 state immediately after choosing EXPLOIT_LEAK!
    const q2AfterLeak = await br.evalJs(`(() => {
      const tierBadge = document.querySelector('#ws-tier-badge')?.textContent?.trim() || '';
      const clueDrawer = document.querySelector('.ws-clue-drawer')?.textContent?.trim() || '';
      const prompt = document.querySelector('.ws-question-prompt')?.textContent?.trim() || '';
      return { tierBadge, clueDrawer, prompt };
    })()`);

    // Also trigger Tier-3 Peel on Q2 to check if Q2's real answer (`Marie Curie`) gets shattered!
    const q2CanPeel = await br.evalJs(`Boolean(document.querySelector('#ws-btn-peel') && !document.querySelector('#ws-btn-peel').disabled)`);
    if (q2CanPeel) {
      await br.clickSelector('#ws-btn-peel');
      await sleep(250);
    }
    const q2Tier3Facets = await br.evalJs(`Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => ({
      idx: Number(b.dataset.facetIdx),
      text: (b.querySelector('.ws-facet-text')?.textContent || b.textContent || '').trim(),
      disabled: b.disabled,
    }))`);

    // Finish Q2 -> Manifesto choice
    await playAnyCurrentQuestion(br);
    await sleep(300);
    await clickFirstVisible(br, ['#ws-btn-next-q']);
    await sleep(500);

    // Manifesto choice -> advance any story continue until Q3 loads, and check PROLOGUE_CLEARED
    await br.evalJs(`document.querySelector('[data-story-choice^="MANIFESTO:"]')?.click()`);
    await sleep(550);
    for (let i = 0; i < 4; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('[data-facet-idx="0"]'))`)) break;
      await clickFirstVisible(br, ['#ws-story-continue', '#ws-mc-skip', '.ws-btn-gold']);
      await sleep(400);
    }
    const analyticsRightAfterManifesto = await br.evalJs(`(() => {
      try {
        const a = JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}');
        return {
          prologueClearedCount: a.feats?.prologueCleared ?? 0,
          prologueMatches: a.byMode?.PROLOGUE?.matchesPlayed ?? 0,
          currentPrompt: document.querySelector('.ws-question-prompt')?.textContent?.trim() || '',
        };
      } catch { return null; }
    })()`);

    // On Q3: test Bluff Echo Slide-Cancel (`pointerdown -> hold 380ms -> drag 105px sideways -> pointerup`)
    const bluffEchoRes = await (async () => {
      const pt = await br.evalJs(`(() => {
        const b = document.querySelector('#ws-btn-overclock');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (!pt) return { tested: false };
      await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
      await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
      await sleep(380);
      await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x - 105, y: pt.y });
      await sleep(80);
      await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x - 105, y: pt.y, button: 'left', clickCount: 1 });
      await sleep(250);
      return br.evalJs(`(() => {
        const stillLive = Boolean(document.querySelector('#ws-btn-overclock') && !document.querySelector('#ws-btn-next-q'));
        const a = JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}');
        return { tested: true, stillLive, bluffEchoCancelsImmediately: a.feats?.bluffEchoCancels ?? 0 };
      })()`);
    })();

    // Now Hold Overclock 1080ms on Q3 to test full 6.0x curve!
    let maxOverclockLabelSeen = '';
    {
      const pt = await br.evalJs(`(() => {
        const b = document.querySelector('#ws-btn-overclock');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      if (pt) {
        await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
        await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
        await sleep(1080);
        maxOverclockLabelSeen = await br.evalJs(`document.querySelector('#ws-overclock-label')?.textContent?.trim() || ''`);
        await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
        await sleep(450);
      }
    }
    const bluffEchoCountAfterSubmit = await br.evalJs(`JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.feats?.bluffEchoCancels ?? 0`);
    for (let i = 0; i < 6; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('[data-cone-id="PINHOLE"]'))`)) break;
      await clickFirstVisible(br, ['#ws-btn-next-q', '#ws-story-continue', '#ws-mc-skip', '.ws-btn-gold']);
      await sleep(450);
    }

    // On Q4 (CALIBRATOR_DIAL — 1969 Moon Landing): test comma-free years, step buttons, slider, cones, HUD mult mismatch, and peel button!
    const q4CalState = await br.evalJs(`(() => {
      const boxText = document.querySelector('.ws-calibrator-box')?.innerText || '';
      const tierBadgeInitial = document.querySelector('#ws-tier-badge')?.textContent?.trim() || '';
      const lockLabelInitial = document.querySelector('#ws-overclock-label')?.textContent?.trim() || '';
      const peelEnabled = Boolean(document.querySelector('#ws-btn-peel') && !document.querySelector('#ws-btn-peel').disabled);
      const hasYearComma = /\\b[12],\\d{3}\\b/.test(boxText);
      return { boxText: boxText.replace(/\\s+/g, ' ').trim(), tierBadgeInitial, lockLabelInitial, peelEnabled, hasYearComma };
    })()`);

    // Click PINHOLE cone + step button + slider -> verify HUD tier badge & lock label STILL show 3.0x instead of 3.5x!
    const hasPinholeNow = await br.evalJs(`Boolean(document.querySelector('[data-cone-id="PINHOLE"]'))`);
    if (!hasPinholeNow) {
      const diagDom = await br.evalJs(`({
        prompt: document.querySelector('.ws-question-prompt')?.textContent?.trim() || '',
        story: document.querySelector('.ws-story-text, .ws-dialogue-text')?.textContent?.trim() || '',
        buttons: Array.from(document.querySelectorAll('button')).map((b) => ({ id: b.id, text: b.textContent.replace(/\\s+/g, ' ').trim().slice(0, 40), disabled: b.disabled })).slice(0, 12),
      })`);
      console.error('[E2E] Q4 PINHOLE not found — DOM state:', JSON.stringify(diagDom));
      // If still on Q3 live, submit Q3 via click & advance
      if (await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock'))`)) {
        await br.clickSelector('#ws-btn-overclock');
        await sleep(500);
      }
      for (let i = 0; i < 6; i++) {
        if (await br.evalJs(`Boolean(document.querySelector('[data-cone-id="PINHOLE"]'))`)) break;
        await clickFirstVisible(br, ['#ws-btn-next-q', '#ws-story-continue', '#ws-mc-skip', '.ws-btn-gold']);
        await sleep(450);
      }
    }
    await br.clickSelector('[data-cone-id="PINHOLE"]');
    await sleep(220);
    await br.evalJs(`document.querySelector('[data-cal-delta="1"]')?.click()`);
    await sleep(160);
    const q4AfterPinhole = await br.evalJs(`({
      readout: document.querySelector('#ws-cal-readout')?.textContent?.trim() || '',
      tierBadge: document.querySelector('#ws-tier-badge')?.textContent?.trim() || '',
      lockLabel: document.querySelector('#ws-overclock-label')?.textContent?.trim() || '',
      activeCone: document.querySelector('.ws-cone-pill.is-active')?.dataset.coneId || '',
    })`);

    // Set slider to 1969 & lock Q4
    await br.evalJs(`(() => {
      const s = document.querySelector('#ws-cal-slider');
      if (s) {
        s.value = '1969';
        s.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()`);
    await sleep(140);
    await br.clickSelector('#ws-btn-overclock');
    await sleep(500);
    await clickFirstVisible(br, ['#ws-btn-next-q']);
    await sleep(600);

    // Advance Passport Stamp Payoff -> Flight Fork -> choose FORK:GB (London First)
    for (let i = 0; i < 8; i++) {
      const hasFork = await br.evalJs(`Boolean(document.querySelector('[data-story-choice="FORK:GB"], [data-story-choice="LONDON_FIRST"], [data-story-choice="GB"], [data-flight-fork="gb"]'))`);
      if (hasFork) break;
      await clickFirstVisible(br, ['#ws-mc-skip', '[data-cinema-skip]', '#ws-story-continue', '#ws-summary-continue', '.ws-btn-gold']);
      await sleep(500);
    }
    const clickedFlightFork = await br.evalJs(`(() => {
      const b = document.querySelector('[data-story-choice="FORK:GB"], [data-story-choice="LONDON_FIRST"], [data-story-choice="GB"], [data-flight-fork="gb"]');
      if (!b) return false;
      b.click();
      return true;
    })()`);
    await sleep(700);
    const flightForkBeforeReload = await br.evalJs(`JSON.parse(localStorage.getItem('ws_ink_blackboard_v1') || '{}')?.firstFlight ?? null`);
    const prologueMatchesAfterFinish = await br.evalJs(`JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.byMode?.PROLOGUE?.matchesPlayed ?? 0`);

    // RELOAD PAGE to test live Save-Slot persistence wipe!
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    const flightForkAfterReload = await br.evalJs(`JSON.parse(localStorage.getItem('ws_ink_blackboard_v1') || '{}')?.firstFlight ?? null`);

    browserReport.e2e01_prologueAndReload = {
      spin: { spinStartIdx, spinAfterTap, spinAfterArrow, spinAfterDrag },
      q1Tier2Badge,
      q1Tier3State,
      leakChoiceClicked,
      q2AfterLeak,
      q2Tier3Facets,
      analyticsRightAfterManifesto,
      bluffEchoRes,
      bluffEchoCountAfterSubmit,
      maxOverclockLabelSeen,
      q4CalState,
      q4AfterPinhole,
      clickedFlightFork,
      flightForkBeforeReload,
      flightForkAfterReload,
      prologueMatchesAfterFinish,
    };

    if (analyticsRightAfterManifesto?.prologueClearedCount > 0) {
      addBrowserFinding(
        'GAMEPLAY-P1-09',
        'P1',
        '@mobile-hud-architect',
        'src/ui/SovereignMasterController.ts:1839, 3238-3256',
        `PROLOGUE_CLEARED trophy feat fires prematurely on Manifesto choice BEFORE Q3 & Q4 are played, and completing Prologue Q4 never logs a PROLOGUE match (\`byMode.PROLOGUE.matchesPlayed === ${prologueMatchesAfterFinish}\`)`,
        { analyticsRightAfterManifesto, prologueMatchesAfterFinish },
      );
    }
    if (clickedFlightFork && flightForkBeforeReload === 'GB' && flightForkAfterReload !== 'GB') {
      addBrowserFinding(
        'GAMEPLAY-P0-03-LIVE',
        'P0',
        '@mobile-hud-architect',
        'src/ui/SovereignMasterController.ts:1347-1351',
        `Live Browser Proof: Act I Flight Fork choice (\`${flightForkBeforeReload}\`) was WIPED to \`${flightForkAfterReload}\` on page reload because \`handleFlightForkChoice\` does not call \`saveSlotManager.saveActiveSlot()\``,
        { flightForkBeforeReload, flightForkAfterReload },
      );
    }
    if (q4AfterPinhole.activeCone === 'PINHOLE' && q4AfterPinhole.tierBadge.includes('3.0x')) {
      addBrowserFinding(
        'GAMEPLAY-P1-02-LIVE',
        'P1',
        '@mobile-hud-architect',
        'src/ui/SovereignHUD.ts:1695, 2250',
        `Live Browser Proof: On Q4 CALIBRATOR_DIAL with PINHOLE [3.5x] selected, HUD badge still displays "${q4AfterPinhole.tierBadge}" and Overclock bar shows "${q4AfterPinhole.lockLabel}" while #ws-btn-peel remains enabled (${q4CalState.peelEnabled})`,
        { q4CalState, q4AfterPinhole },
      );
    }

    // =========================================================================
    // E2E-02: CAMPAIGN FAILURE (`won === false` -> RETRY & RESTART) + CALL BLUFF + BOOKMARK RELOAD WIPE
    // =========================================================================
    console.error('[E2E] E2E-02 Campaign Breach + Call Bluff + Bookmark...');
    await br.clickSelector('[data-title-mode="CAMPAIGN"]');
    await sleep(600);
    // Launch first available mission (`gb_1`, `ch_1`, or any `[data-mission-id]`)
    await clickFirstVisible(br, ['[data-mission-id="gb_1"]', '[data-mission-id="ch_1"]', '[data-mission-id]', '[data-flight-fork="gb"]', '.ws-btn-gold']);
    await sleep(700);
    for (let i = 0; i < 10; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`)) break;
      await clickFirstVisible(br, ['[data-mission-id="gb_1"]', '[data-mission-id="ch_1"]', '[data-mission-id]', '#ws-mc-skip', '[data-cinema-skip]', '#ws-story-continue', '[data-story-choice]', '.ws-btn-gold']);
      await sleep(450);
    }

    // Wait up to 9s to catch a live Rival CALL BLUFF button and test it!
    let bluffCallLiveResult = null;
    for (let t = 0; t < 24; t++) {
      const btnFound = await br.evalJs(`(() => {
        const b = Array.from(document.querySelectorAll('button')).find((el) => /CALL BLUFF/i.test(el.textContent || '') && el.getBoundingClientRect().width > 0 && !el.disabled);
        if (!b) return null;
        const ptsBefore = document.querySelector('#ws-player-pts')?.textContent || '';
        const analyticsBefore = JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.feats?.rivalBluffsCaught ?? 0;
        b.click();
        return { clicked: true, label: b.textContent.trim(), ptsBefore, analyticsBefore };
      })()`);
      if (btnFound) {
        await sleep(350);
        const after = await br.evalJs(`({
          ptsAfter: document.querySelector('#ws-player-pts')?.textContent || '',
          tellAfter: document.querySelector('#ws-live-tell-text')?.textContent?.trim() || '',
          analyticsImmediately: JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.feats?.rivalBluffsCaught ?? 0,
        })`);
        bluffCallLiveResult = { ...btnFound, ...after };
        break;
      }
      await sleep(350);
    }

    // Submit Q1 with Overclock hold (600ms) -> bookmark it on reveal -> check reload wipe later, then force Circuit Breach!
    let bookmarkSavedBeforeReload = 0;
    let breachReached = false;
    let retryWorked = false;
    let restartSheetOpened = false;

    for (let step = 0; step < 12; step++) {
      if (await br.evalJs(`Boolean(document.querySelector('#ws-retry-mission'))`)) {
        breachReached = true;
        break;
      }
      if (await br.evalJs(`Boolean(document.querySelector('#ws-summary-continue') && !document.querySelector('#ws-retry-mission'))`)) {
        break;
      }
      if (await br.evalJs(`Boolean(document.querySelector('#ws-btn-next-q'))`)) {
        // On first reveal, bookmark the Intel Flash!
        if (bookmarkSavedBeforeReload === 0) {
          await br.evalJs(`document.querySelector('#ws-btn-bookmark')?.click()`);
          await sleep(160);
          bookmarkSavedBeforeReload = await br.evalJs(`(JSON.parse(localStorage.getItem('ws_meridian_passport_v2') || '{}')?.bookmarks || []).length`);
        }
        await br.clickSelector('#ws-btn-next-q');
        await sleep(450);
        continue;
      }
      if (await br.evalJs(`Boolean(document.querySelector('#ws-mc-skip, #ws-story-continue'))`)) {
        await clickFirstVisible(br, ['#ws-mc-skip', '#ws-story-continue']);
        await sleep(400);
        continue;
      }
      // Deliberately hold Overclock on facet 0 (fast backfire -> shields drop quickly)
      await playAnyCurrentQuestion(br, { preferCorrect: false, holdMs: 580 });
      await sleep(350);
    }

    if (bluffCallLiveResult) {
      bluffCallLiveResult.analyticsAfterQuestionSubmit = await br.evalJs(
        `JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.feats?.rivalBluffsCaught ?? 0`,
      );
    }

    if (breachReached) {
      await br.clickSelector('#ws-restart-from-start');
      await sleep(300);
      restartSheetOpened = await br.evalJs(`Boolean(document.querySelector('#ws-rfs-campaign'))`);
      await clickFirstVisible(br, ['#ws-rfs-cancel']);
      await sleep(250);
      await br.clickSelector('#ws-retry-mission');
      await sleep(600);
      for (let i = 0; i < 4; i++) {
        if (await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`)) {
          retryWorked = true;
          break;
        }
        await clickFirstVisible(br, ['#ws-mc-skip', '#ws-story-continue']);
        await sleep(350);
      }
    }

    // Check bookmark wipe across reload!
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    const bookmarkCountAfterReload = await br.evalJs(`(JSON.parse(localStorage.getItem('ws_meridian_passport_v2') || '{}')?.bookmarks || []).length`);

    browserReport.e2e02_campaignBreachBluffBookmark = {
      bluffCallLiveResult,
      breachReached,
      restartSheetOpened,
      retryWorked,
      bookmarkSavedBeforeReload,
      bookmarkCountAfterReload,
    };

    if (bookmarkSavedBeforeReload > 0 && bookmarkCountAfterReload === 0) {
      addBrowserFinding(
        'GAMEPLAY-P0-03-BOOKMARK',
        'P0',
        '@mobile-hud-architect',
        'src/ui/SovereignMasterController.ts:3220-3232',
        `Live Browser Proof: Saved Intel Flash bookmark (${bookmarkSavedBeforeReload} saved) was WIPED to 0 on page reload because \`handleToggleBookmark()\` never calls \`saveSlotManager.saveActiveSlot()\``,
        { bookmarkSavedBeforeReload, bookmarkCountAfterReload },
      );
    }

    // =========================================================================
    // E2E-03: 5-SLOT SAVE MANAGER (LOAD / EXPORT / IMPORT / RESET / DELETE)
    // =========================================================================
    await br.clickSelector('#ws-util-vault');
    await sleep(250);
    await br.clickSelector('#ws-util-saves');
    await sleep(400);

    const slotCount = await br.evalJs(`document.querySelectorAll('.ws-save-slot-row').length`);
    await br.clickSelector('[data-slot-export="1"]');
    await sleep(300);
    const exportedObj = await br.evalJs(`window.__rtStats.downloads[window.__rtStats.downloads.length - 1] || null`);
    const exportOk = Boolean(exportedObj?.text?.includes('WORLDS_SMARTEST_CAMPAIGN_SAVE'));

    let importOk = false;
    let resetOk = false;
    let deleteOk = false;
    if (exportOk) {
      await br.evalJs(`(() => {
        const importBtn = document.querySelector('[data-slot-import="2"]');
        const fileInput = document.querySelector('#ws-saves-file-input');
        const origClick = fileInput.click;
        fileInput.click = () => {};
        importBtn.click();
        fileInput.click = origClick;
        const payload = window.__rtStats.downloads[window.__rtStats.downloads.length - 1].text;
        const dt = new DataTransfer();
        dt.items.add(new File([payload], 'slot1.ws-save.json', { type: 'application/json' }));
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await sleep(400);
      importOk = await br.evalJs(`Boolean(localStorage.getItem('ws_campaign_slot_2'))`);

      if (importOk) {
        await br.clickSelector('[data-slot-reset="2"]');
        await sleep(200);
        await br.clickSelector('[data-exec-confirm="2"]');
        await sleep(300);
        resetOk = await br.evalJs(`/Reset Slot 2/i.test(document.querySelector('.ws-saves-banner')?.textContent || '')`);

        await br.clickSelector('[data-slot-delete="2"]');
        await sleep(200);
        await br.clickSelector('[data-exec-confirm="2"]');
        await sleep(300);
        deleteOk = await br.evalJs(`localStorage.getItem('ws_campaign_slot_2') === null`);
      }
    }
    await br.pressKey('Escape');
    await sleep(250);

    browserReport.e2e03_saveSlots = { slotCount, exportOk, importOk, resetOk, deleteOk };

    // =========================================================================
    // E2E-04: BRIEFING ROOM 3-LEVEL DRILL-DOWN (Sports & Games -> Sports -> Baseball = 34,283 + 5/10/20/50)
    // =========================================================================
    console.error('[E2E] E2E-04 Briefing Room Baseball...');
    await br.clickSelector('[data-title-mode="BRIEFING"]');
    await sleep(500);
    if (!(await br.evalJs(`Boolean(document.querySelector('.ws-briefing-sheet'))`))) {
      await clickFirstVisible(br, ['#ws-open-briefing-modal', '#ws-open-briefing-picker', '[data-open-briefing]', '.ws-btn-gold']);
      await sleep(450);
    }

    const briefingDrill = await (async () => {
      await br.evalJs(`Array.from(document.querySelectorAll('.ws-briefing-sheet [data-pick-l0], [data-pick-l0]')).find((b) => /Sports\\s*&\\s*Games/i.test(b.textContent || ''))?.click()`);
      await sleep(300);
      await br.evalJs(`Array.from(document.querySelectorAll('.ws-briefing-sheet [data-pick-l1], [data-pick-l1]')).find((b) => /^Sports\\b/i.test((b.querySelector('.ws-briefing-row-title')?.textContent || b.textContent || '').trim()))?.click()`);
      await sleep(300);
      const l2Info = await br.evalJs(`(() => {
        const b = Array.from(document.querySelectorAll('.ws-briefing-sheet [data-pick-l2], [data-pick-l2]')).find((el) => /\\bBaseball\\b/i.test(el.textContent || ''));
        if (!b) return null;
        const txt = b.textContent.replace(/\\s+/g, ' ').trim();
        b.click();
        return txt;
      })()`);
      await sleep(350);
      const lengthsAvailable = await br.evalJs(`Array.from(document.querySelectorAll('.ws-briefing-sheet [data-len], [data-briefing-count], [data-count], .ws-seg-btn')).map((b) => b.textContent.trim()).filter(Boolean)`);
      const breadcrumbs = await br.evalJs(`document.querySelector('#ws-briefing-breadcrumbs, .ws-sheet-breadcrumbs')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
      return { l2Info, lengthsAvailable, breadcrumbs };
    })();

    // Launch 5-Q Baseball round and play all 5 Qs!
    await br.evalJs(`Array.from(document.querySelectorAll('.ws-briefing-sheet [data-len="5"], [data-briefing-count="5"], [data-count="5"], .ws-briefing-sheet button')).find((b) => /^5(\\s*Qs?)?$/i.test((b.textContent || '').trim()))?.click()`);
    await sleep(150);
    await clickFirstVisible(br, ['#ws-cat-launch', '#ws-cat-launch-btn', '.ws-briefing-launch-cta']);
    await br.waitFor(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`, 10000, 150);
    await sleep(350);

    const baseballPrompts = [];
    for (let i = 0; i < 6; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('#ws-summary-continue'))`)) break;
      const p = await br.evalJs(`document.querySelector('.ws-question-prompt')?.textContent?.trim() || ''`);
      if (p) baseballPrompts.push(p);
      await playAnyCurrentQuestion(br);
      await sleep(250);
      await clickFirstVisible(br, ['#ws-btn-next-q']);
      await sleep(400);
    }
    const briefingSummaryOk = await br.evalJs(`Boolean(document.querySelector('#ws-summary-continue'))`);
    await clickFirstVisible(br, ['#ws-summary-continue']);
    await sleep(450);

    browserReport.e2e04_briefingBaseball = {
      briefingDrill,
      baseballCountShown34283: /34,283/.test(String(briefingDrill.l2Info || '')),
      playedQuestions: baseballPrompts.length,
      uniquePrompts: new Set(baseballPrompts).size,
      samplePrompts: baseballPrompts.slice(0, 3),
      briefingSummaryOk,
    };

    // =========================================================================
    // E2E-05: DAILY GLOBAL FEED (10 PRISMS + SHARE CARD)
    // =========================================================================
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    await br.clickSelector('[data-title-mode="DAILY"]');
    await sleep(500);
    if (!(await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`))) {
      await clickFirstVisible(br, ['#ws-launch-daily', '.ws-btn-gold']);
    }
    await br.waitFor(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`, 10000, 150);
    await sleep(350);

    const dailyQ1Header = await br.evalJs(`document.querySelector('.ws-topbar')?.innerText?.replace(/\\s+/g, ' ').trim() || ''`);
    let dailyQuestionsPlayed = 0;
    for (let i = 0; i < 12; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('#ws-copy-daily'))`)) break;
      if (await br.evalJs(`Boolean(document.querySelector('#ws-btn-next-q'))`)) {
        await br.clickSelector('#ws-btn-next-q');
        await sleep(320);
        continue;
      }
      const k = await playAnyCurrentQuestion(br);
      if (k !== 'NONE') dailyQuestionsPlayed++;
      await sleep(250);
      await clickFirstVisible(br, ['#ws-btn-next-q']);
      await sleep(350);
    }
    const dailyShareCard = await br.evalJs(`document.querySelector('pre')?.textContent || ''`);
    const dailyHasYearComma = /\b[12],\d{3}\b/.test(dailyShareCard);

    browserReport.e2e05_dailyGlobalFeed = {
      dailyQ1Header,
      dailyQuestionsPlayed,
      shareCardLines: dailyShareCard.split('\n').filter(Boolean).length,
      dailyHasYearComma,
      shareCardPreview: dailyShareCard,
    };

    // =========================================================================
    // E2E-06: ENDLESS ARCHIVE DESCENT (5 PRISMS WITH 1 MISS -> AIRLOCK BUG PROOF -> BANK HAUL & EXTRACT)
    // =========================================================================
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    await br.clickSelector('[data-title-mode="ENDLESS"]');
    await sleep(500);
    if (!(await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`))) {
      await clickFirstVisible(br, ['#ws-launch-endless', '.ws-btn-gold']);
    }
    await br.waitFor(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`, 10000, 150);
    await sleep(350);

    let endlessActualRight = 0;
    let endlessActualWrong = 0;
    let airlockText = '';
    for (let q = 0; q < 7; q++) {
      const atAirlock = await br.evalJs(`Boolean(document.querySelector('#ws-endless-deeper') || document.querySelector('#ws-summary-hub'))`);
      if (atAirlock) {
        airlockText = await br.evalJs(`document.querySelector('.ws-frame-cinema')?.innerText?.replace(/\\s+/g, ' ').trim() || ''`);
        break;
      }
      if (await br.evalJs(`Boolean(document.querySelector('#ws-summary-continue'))`)) {
        airlockText = await br.evalJs(`document.querySelector('.ws-frame-cinema')?.innerText?.replace(/\\s+/g, ' ').trim() || ''`);
        break;
      }
      // Answer question (tap safe lock so even misses only lose 1 shield, not 2!)
      await playAnyCurrentQuestion(br, { preferCorrect: true, holdMs: 40 });
      await sleep(250);
      const wasRight = await br.evalJs(`Boolean(document.querySelector('.ws-intel-flash') && !document.querySelector('.ws-intel-flash.is-miss'))`);
      if (wasRight) endlessActualRight++;
      else endlessActualWrong++;
      await clickFirstVisible(br, ['#ws-btn-next-q']);
      await sleep(400);
    }

    const endlessAirlockReached = /EXTRACTION AIRLOCK/i.test(airlockText);
    const endlessAirlockClaims5of5 = /5\/5 Solved/i.test(airlockText);
    await clickFirstVisible(br, ['#ws-summary-hub', '#ws-summary-continue']);
    await sleep(450);

    browserReport.e2e06_endlessAirlock = {
      endlessActualRight,
      endlessActualWrong,
      endlessAirlockReached,
      endlessAirlockClaims5of5,
      airlockText: airlockText.slice(0, 260),
    };

    if (endlessAirlockReached && endlessActualWrong > 0 && endlessAirlockClaims5of5) {
      addBrowserFinding(
        'GAMEPLAY-P1-10',
        'P1',
        '@mobile-hud-architect',
        'src/ui/SovereignMasterController.ts:2218, 3623, 3645-3647',
        `Live Browser Proof: Endless Archive Airlock falsely displays "5/5 Solved" (and \`bestStreak = shields\`) when player actually answered ${endlessActualRight} right / ${endlessActualWrong} wrong, and logs bogus 5/5 perfection into Career Analytics`,
        { endlessActualRight, endlessActualWrong, airlockText: airlockText.slice(0, 220) },
      );
    }

    // =========================================================================
    // E2E-07: WORLD COUNCIL GHOST TRIALS & BLACK SALON (TRUNCATED WSG1 CODE + MODE BUCKET)
    // =========================================================================
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    await br.clickSelector('[data-title-mode="TRIALS"]');
    await sleep(500);
    await clickFirstVisible(br, ['#ws-launch-black-salon', '#ws-launch-ghost-duel']);
    await br.waitFor(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`, 10000, 150);
    await sleep(350);

    const campMatchesBeforeSalon = await br.evalJs(`JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.byMode?.CAMPAIGN?.matchesPlayed ?? 0`);
    for (let i = 0; i < 8; i++) {
      if (await br.evalJs(`Boolean(document.querySelector('#ws-summary-continue'))`)) break;
      await playAnyCurrentQuestion(br);
      await sleep(250);
      await clickFirstVisible(br, ['#ws-btn-next-q']);
      await sleep(380);
    }
    const ghostCodeDisplayed = await br.evalJs(`document.querySelector('pre')?.textContent || ''`);
    const campMatchesAfterSalon = await br.evalJs(`JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.byMode?.CAMPAIGN?.matchesPlayed ?? 0`);
    const trialsMatchesAfterSalon = await br.evalJs(`JSON.parse(localStorage.getItem('ws_career_analytics_v1') || '{}')?.byMode?.TRIALS?.matchesPlayed ?? 0`);

    browserReport.e2e07_ghostTrialsAndBlackSalon = {
      ghostCodeDisplayed,
      ghostCodeTruncatedWithEllipsis: ghostCodeDisplayed.includes('...'),
      campMatchesBeforeSalon,
      campMatchesAfterSalon,
      trialsMatchesAfterSalon,
    };

    // =========================================================================
    // E2E-08: CAREER STATS (ALL 5 RIGHT/WRONG GRAPHS) + 64 TROPHIES + 32 UNLOCKABLES + OBSERVATORY TRANSITION
    // =========================================================================
    await br.clickSelector('#ws-util-vault');
    await sleep(250);
    await br.clickSelector('#ws-util-stats');
    await sleep(550);

    const statsAudit = await br.evalJs(`(() => {
      const shell = document.querySelector('.ws-meta-shell');
      const svgs = Array.from(document.querySelectorAll('.ws-meta-shell svg')).length;
      const sections = Array.from(document.querySelectorAll('.ws-meta-section-title')).map((el) => el.textContent.trim());
      const kpiText = document.querySelector('.ws-meta-kpi-strip')?.innerText?.replace(/\\s+/g, ' ').trim() || '';
      const ledgerRows = document.querySelectorAll('.ws-meta-section:last-child .ws-meta-row').length;
      return { found: Boolean(shell), svgs, sections, kpiText, ledgerRows };
    })()`);

    // Jump from Stats -> 3D Observatory via Vault jumper and check `ws-3d-showcase-open` class!
    await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
    await sleep(180);
    await br.clickSelector('.ws-meta-backdrop [data-suite-nav="OBSERVATORY"]');
    await sleep(550);
    const observatoryAfterStatsJump = await br.evalJs(`({
      has3dShowcaseClass: document.documentElement.classList.contains('ws-3d-showcase-open'),
      backdropHasStageDock: Boolean(document.querySelector('.ws-meta-backdrop.is-stage-dock')),
      title: document.querySelector('.ws-meta-title')?.textContent?.trim() || '',
    })`);

    // Jump to Hall of Honours (Trophies & Unlockables)
    await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
    await sleep(180);
    await br.clickSelector('.ws-meta-backdrop [data-suite-nav="HONOURS"]');
    await sleep(550);
    const honoursAudit = await br.evalJs(`(() => {
      const txt = document.querySelector('.ws-meta-backdrop')?.innerText || '';
      const trophyRows = document.querySelectorAll('[data-trophy-id], .ws-honour-row, .ws-trophy-row, .ws-meta-row').length;
      const unlockTab = Array.from(document.querySelectorAll('.ws-meta-backdrop button')).find((b) => /Unlock|Reward|Title|Theme|32|44/i.test(b.textContent || ''));
      if (unlockTab) unlockTab.click();
      return {
        has64Ref: /64|84/.test(txt),
        has84Ref: /84/.test(txt),
        trophyRows,
        clickedUnlockTab: unlockTab?.textContent?.trim() || null,
      };
    })()`);
    await sleep(300);
    const equipResult = await br.evalJs(`(() => {
      const equipBtn = Array.from(document.querySelectorAll('.ws-meta-backdrop button')).find((b) => /Equip/i.test(b.textContent || '') && !b.disabled);
      if (!equipBtn) return { foundEquipBtn: false };
      equipBtn.click();
      return { foundEquipBtn: true, label: equipBtn.textContent.trim() };
    })()`);

    browserReport.e2e08_statsTrophiesUnlockablesAndObservatory = {
      statsAudit,
      observatoryAfterStatsJump,
      honoursAudit,
      equipResult,
    };

    if (!observatoryAfterStatsJump.has3dShowcaseClass) {
      addBrowserFinding(
        'GAMEPLAY-P2-04',
        'P2',
        '@meta-sheets-architect',
        'src/meta/index.ts:308-329',
        'Switching from Career Stats to 3D Observatory via Vault `▾` jumper fails to set `ws-3d-showcase-open` on `documentElement`',
        observatoryAfterStatsJump,
      );
    }

    // =========================================================================
    // E2E-09: DESKTOP 1280x800 VIEWPORT SMOKE CHECK
    // =========================================================================
    await br.setViewport({ width: 1280, height: 800, mobile: false, dpr: 1 });
    await br.navigate(srv.baseUrl);
    await waitForAppBoot(br);
    const desktopTitleOk = await br.evalJs(`({
      vw: window.innerWidth,
      vh: window.innerHeight,
      hasCanvas: Boolean(document.querySelector('#canvas-root canvas')),
      modeButtons: document.querySelectorAll('[data-title-mode]').length,
      webglVersion: window.__rtStats?.webglVersion || null,
      shaderErrors: window.__rtStats?.shaderErrors || [],
    })`);
    browserReport.e2e09_desktop1280x800Smoke = desktopTitleOk;

    browserReport.diagnostics = {
      consoleErrors: br.consoleErrors.slice(),
      pageExceptions: br.pageExceptions.slice(),
      httpErrors: br.httpErrors.slice(),
      shaderErrors: desktopTitleOk.shaderErrors || [],
    };
  } finally {
    await br.close();
    await srv.close();
    cleanupDist();
  }

  return browserReport;
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function main() {
  const opts = parseArgs();
  const report = {
    timestamp: new Date().toISOString(),
    sim: null,
    browser: null,
    allFindings: [],
  };

  if (opts.part === 'all' || opts.part === 'sim') {
    console.error('[PILLAR-GAMEPLAY-AUDIT] Running Part A: Compiled TS Engine & Monte Carlo Simulations...');
    report.sim = await runSimulationSuite();
    report.allFindings.push(...report.sim.findings);
  }

  if (opts.part === 'all' || opts.part === 'browser') {
    console.error('[PILLAR-GAMEPLAY-AUDIT] Running Part B: Live Headless Edge WebGL2 E2E Playtest...');
    report.browser = await runBrowserPlaytestSuite(opts.useDist, opts.softwareGl);
    report.allFindings.push(...report.browser.findings);
  }

  if (opts.jsonOut) {
    fs.writeFileSync(opts.jsonOut, JSON.stringify(report, null, 2), 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));
  console.error(`\n[PILLAR-GAMEPLAY-AUDIT] COMPLETE — Total Verified Gameplay Findings: ${report.allFindings.length}`);
  for (const f of report.allFindings) {
    console.error(`  [${f.severity}] ${f.id} (${f.owner} @ ${f.fileLine}): ${f.summary}`);
  }
}

main().catch((err) => {
  console.error('[PILLAR-GAMEPLAY-AUDIT] FATAL:', err);
  process.exit(1);
});
